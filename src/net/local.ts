/**
 * Local transport: the whole game in one browser.
 *
 * The dashboard tab is the host: it owns the `Room`, ticks the clock, and
 * broadcasts fresh views. Phone tabs send commands and render what comes back.
 * Nothing about that arrangement changes the trust model. A phone tab still
 * only ever receives a `PhoneView`, so the numbers behind an option are as
 * unreachable here as they are across a network.
 *
 * This exists so a facilitator can rehearse a session on one laptop, and so
 * the UI can be developed without standing up Supabase.
 */
import { loadContent } from '../engine/content'
import type { Content, Role } from '../engine/types'
import { ROLES } from '../engine/types'
import {
  apply,
  authorise,
  createRoom,
  dashboardView,
  endgame,
  phoneView,
  tick,
  type Command,
} from '../game/room'
import type { Room } from '../game/session'
import pack from '../../content/jtnz-content-pack-v2.json'
import tips from '../../content/jtnz-insider-tips.json'
import type {
  ConnectionState,
  DashboardSnapshot,
  DeniedSnapshot,
  PhoneSnapshot,
  RosterSeat,
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

/**
 * One id per tab, which is this transport's stand-in for one phone.
 *
 * `sessionStorage` is per-tab and survives a reload, so a player who refreshes
 * keeps their seat while a second tab opening the same URL is correctly seen
 * as a different device asking for a chair that is already occupied.
 */
function clientId(): string {
  try {
    const existing = sessionStorage.getItem('jtnz:client')
    if (existing) return existing
    const made = Math.random().toString(36).slice(2, 10)
    sessionStorage.setItem('jtnz:client', made)
    return made
  } catch {
    return Math.random().toString(36).slice(2, 10)
  }
}

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
  /** Which tab holds which chair: the local half of a seat token. */
  private owners = new Map<Role, string>()
  private closed = false

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

  private roster(): RosterSeat[] {
    return ROLES.map((role) => ({
      role,
      name: this.room.players[role].name || null,
      taken: Boolean(this.room.players[role].name),
    }))
  }

  /**
   * Whether this tab may act as this seat.
   *
   * A chair with a name on it belongs to whoever claimed it. An unnamed chair
   * is free, and the first tab to ask gets it, which is also what lets a
   * player who left take a seat again, on this phone or another.
   */
  private grant(role: Role, client: string): boolean {
    const owner = this.owners.get(role)
    if (owner === client) return true
    if (owner && this.room.players[role].name) return false
    this.owners.set(role, client)
    return true
  }

  private deny(client: string, reason: DeniedSnapshot['reason']): void {
    if (this.closed) return
    this.channel.postMessage({
      t: 'denied',
      client,
      snapshot: { kind: 'denied', reason, code: this.room.code, seats: this.roster() },
    } satisfies Wire)
  }

  private receive(msg: Wire): void {
    if (msg.t === 'cmd') {
      // The role on the wire is never trusted: a tab may only act as the seat
      // it actually holds, which is the same rule the edge function applies.
      if (msg.role !== 'dashboard') {
        if (!this.grant(msg.role, msg.client)) return this.deny(msg.client, 'seat-taken')
        const cmd = authorise(msg.role, msg.cmd)
        if (!cmd) return
        this.room = apply(this.room, cmd, content, Date.now())
        if (cmd.t === 'leave') this.owners.delete(msg.role)
      } else {
        this.room = apply(this.room, msg.cmd, content, Date.now())
      }
      saveRoom(this.room)
      this.publish()
    } else if (msg.t === 'release') {
      if (this.owners.get(msg.role) === msg.client) {
        this.owners.delete(msg.role)
        this.room = apply(this.room, { t: 'leave', role: msg.role }, content, Date.now())
        saveRoom(this.room)
      }
      this.publish()
    } else if (msg.t === 'hello') {
      if (msg.role !== 'dashboard' && !this.grant(msg.role, msg.client)) {
        return this.deny(msg.client, 'seat-taken')
      }
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
    if (this.closed) return
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
    const allowed = authorise('dashboard', cmd)
    if (!allowed) return
    this.room = apply(this.room, allowed, content, Date.now())
    saveRoom(this.room)
    this.publish()
  }

  /** The big screen holds no seat, so there is nothing to give up. */
  release(): void {}

  close(): void {
    if (this.closed) return
    this.closed = true
    clearInterval(this.timer)
    saveRoom(this.room)
    // Post before closing, and never after: React remounts this transport in
    // development, and a post on a closed channel throws.
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
  private client = clientId()
  private denied = false

  constructor(code: string, private role: Role) {
    this.code = code
    this.channel = new BroadcastChannel(channelName(code))
    this.channel.onmessage = (e: MessageEvent<Wire>) => this.receive(e.data)
    this.channel.postMessage({ t: 'hello', role, client: this.client } satisfies Wire)

    // Every client must survive a disconnect and rejoin mid-round. If the host
    // goes quiet we say so plainly rather than freezing on a stale screen.
    this.watchdog = setInterval(() => {
      if (this.denied) return
      const stale = Date.now() - this.lastSeen > 2000
      this.setState(stale ? 'reconnecting' : 'live')
      if (stale) this.channel.postMessage({ t: 'hello', role, client: this.client } satisfies Wire)
    }, 1000)
  }

  private setState(next: ConnectionState): void {
    if (this.state === next) return
    this.state = next
    this.connectionSubs.forEach((f) => f(next))
  }

  private receive(msg: Wire): void {
    if (msg.t === 'denied' && msg.client === this.client) {
      this.denied = true
      this.setState('live')
      this.snapshotSubs.forEach((f) => f(msg.snapshot))
    } else if (msg.t === 'snapshot') {
      if (this.denied) return
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
    if (this.denied) return
    this.channel.postMessage({ t: 'cmd', cmd, role: this.role, client: this.client } satisfies Wire)
  }

  release(): void {
    if (this.denied) return
    this.channel.postMessage({ t: 'release', role: this.role, client: this.client } satisfies Wire)
    this.denied = true
  }

  close(): void {
    clearInterval(this.watchdog)
    this.denied = true
    this.channel.close()
  }
}

export function createLocalTransport(opts: TransportOptions): Transport & { code?: string } {
  return opts.kind === 'dashboard' ? new LocalHost(opts.code, opts.seed) : new LocalClient(opts.code, opts.role)
}

export { content as localContent }
