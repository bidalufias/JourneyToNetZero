/**
 * Local transport — the whole game in one browser.
 *
 * The dashboard tab is the host: it owns the `Room`, ticks the clock, and
 * broadcasts fresh views. Phone tabs send commands and render what comes back.
 * Nothing about that arrangement changes the trust model — a phone tab still
 * only ever receives a `PhoneView`, so the numbers behind an option are as
 * unreachable here as they are across a network.
 *
 * This exists so a facilitator can rehearse a session on one laptop, and so
 * the UI can be developed without standing up Supabase.
 */
import { loadContent } from '../engine/content'
import type { Content, Role } from '../engine/types'
import { ROLES } from '../engine/types'
import { apply, createRoom, dashboardView, endgame, phoneView, tick, type Command } from '../game/room'
import type { Room } from '../game/session'
import pack from '../../content/jtnz-content-pack-v2.json'
import tips from '../../content/jtnz-insider-tips.json'
import type {
  ConnectionState,
  DashboardSnapshot,
  PhoneSnapshot,
  Snapshot,
  Transport,
  TransportOptions,
  Wire,
} from './transport'

const content: Content = loadContent({ ...pack, insiderTips: { ...(pack as never as { insiderTips: object }).insiderTips, ...tips } })

const TICK_MS = 200
const channelName = (code: string) => `jtnz:${code}`

/** Persisted so a host tab reload does not lose the session. */
const storageKey = (code: string) => `jtnz:room:${code}`

function saveRoom(room: Room): void {
  try {
    localStorage.setItem(
      storageKey(room.code),
      JSON.stringify({ ...room, game: { ...room.game, flags: [...room.game.flags] } }),
    )
  } catch {
    // Storage is a convenience here, never a correctness requirement.
  }
}

function loadRoom(code: string): Room | null {
  try {
    const raw = localStorage.getItem(storageKey(code))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Room & { game: { flags: string[] } }
    parsed.game.flags = new Set(parsed.game.flags) as never
    return parsed as Room
  } catch {
    return null
  }
}

/** The dashboard tab. Owns the room and drives the clock. */
class LocalHost implements Transport {
  private room: Room
  private channel: BroadcastChannel
  private timer: ReturnType<typeof setInterval>
  private snapshotSubs = new Set<(s: Snapshot) => void>()
  private connectionSubs = new Set<(c: ConnectionState) => void>()

  constructor(code?: string, seed?: number) {
    const existing = code ? loadRoom(code) : null
    this.room = existing ?? createRoom(content, seed ?? Math.floor(Math.random() * 2 ** 31), Date.now())
    this.channel = new BroadcastChannel(channelName(this.room.code))
    this.channel.onmessage = (e: MessageEvent<Wire>) => this.receive(e.data)
    this.timer = setInterval(() => this.step(), TICK_MS)
    queueMicrotask(() => {
      this.connectionSubs.forEach((f) => f('live'))
      this.publish()
    })
  }

  get code(): string {
    return this.room.code
  }

  private receive(msg: Wire): void {
    if (msg.t === 'cmd') {
      this.room = apply(this.room, msg.cmd, content, Date.now())
      this.publish()
    } else if (msg.t === 'hello') {
      this.publish()
    }
  }

  private step(): void {
    const before = this.room.phase
    const beforeEnds = this.room.phaseEndsAt
    this.room = tick(this.room, content, Date.now())
    // Publish on every tick so countdowns stay in step across tabs; the
    // payload is small and the room is the only writer.
    this.publish()
    if (before !== this.room.phase || beforeEnds !== this.room.phaseEndsAt) saveRoom(this.room)
  }

  private buildSnapshots(): { dashboard: DashboardSnapshot; phones: Record<Role, PhoneSnapshot> } {
    const finished = this.room.phase === 'results' || this.room.phase === 'ended'
    const end = finished ? endgame(this.room, content) : null
    const dashboard: DashboardSnapshot = {
      kind: 'dashboard',
      view: dashboardView(this.room, content),
      endgame: end,
    }
    const phones = Object.fromEntries(
      ROLES.map((role) => [
        role,
        { kind: 'phone', view: phoneView(this.room, content, role), endgame: end } as PhoneSnapshot,
      ]),
    ) as Record<Role, PhoneSnapshot>
    return { dashboard, phones }
  }

  private publish(): void {
    const snaps = this.buildSnapshots()
    this.snapshotSubs.forEach((f) => f(snaps.dashboard))
    this.channel.postMessage({ t: 'snapshot', ...snaps } satisfies Wire)
  }

  onSnapshot(fn: (s: Snapshot) => void): () => void {
    this.snapshotSubs.add(fn)
    return () => this.snapshotSubs.delete(fn)
  }

  onConnection(fn: (c: ConnectionState) => void): () => void {
    this.connectionSubs.add(fn)
    return () => this.connectionSubs.delete(fn)
  }

  send(cmd: Command): void {
    this.room = apply(this.room, cmd, content, Date.now())
    saveRoom(this.room)
    this.publish()
  }

  close(): void {
    clearInterval(this.timer)
    saveRoom(this.room)
    this.channel.postMessage({ t: 'hostGone' } satisfies Wire)
    this.channel.close()
  }
}

/** A phone tab. Sends commands, renders whatever the host sends back. */
class LocalClient implements Transport {
  private channel: BroadcastChannel
  private snapshotSubs = new Set<(s: Snapshot) => void>()
  private connectionSubs = new Set<(c: ConnectionState) => void>()
  private lastSeen = 0
  private watchdog: ReturnType<typeof setInterval>
  private state: ConnectionState = 'connecting'

  readonly code: string

  constructor(code: string, private role: Role) {
    this.code = code
    this.channel = new BroadcastChannel(channelName(code))
    this.channel.onmessage = (e: MessageEvent<Wire>) => this.receive(e.data)
    this.channel.postMessage({ t: 'hello', role } satisfies Wire)

    // Every client must survive a disconnect and rejoin mid-round. If the host
    // goes quiet we say so plainly rather than freezing on a stale screen.
    this.watchdog = setInterval(() => {
      const stale = Date.now() - this.lastSeen > 2000
      this.setState(stale ? 'reconnecting' : 'live')
      if (stale) this.channel.postMessage({ t: 'hello', role } satisfies Wire)
    }, 1000)
  }

  private setState(next: ConnectionState): void {
    if (this.state === next) return
    this.state = next
    this.connectionSubs.forEach((f) => f(next))
  }

  private receive(msg: Wire): void {
    if (msg.t === 'snapshot') {
      this.lastSeen = Date.now()
      this.setState('live')
      this.snapshotSubs.forEach((f) => f(msg.phones[this.role]))
    } else if (msg.t === 'hostGone') {
      this.setState('reconnecting')
    }
  }

  onSnapshot(fn: (s: Snapshot) => void): () => void {
    this.snapshotSubs.add(fn)
    return () => this.snapshotSubs.delete(fn)
  }

  onConnection(fn: (c: ConnectionState) => void): () => void {
    this.connectionSubs.add(fn)
    fn(this.state)
    return () => this.connectionSubs.delete(fn)
  }

  send(cmd: Command): void {
    this.channel.postMessage({ t: 'cmd', cmd } satisfies Wire)
  }

  close(): void {
    clearInterval(this.watchdog)
    this.channel.close()
  }
}

export function createLocalTransport(opts: TransportOptions): Transport & { code?: string } {
  return opts.kind === 'dashboard' ? new LocalHost(opts.code, opts.seed) : new LocalClient(opts.code, opts.role)
}

export { content as localContent }
