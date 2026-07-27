/**
 * Supabase transport — the real thing.
 *
 * Room state lives in Postgres, every mutation runs inside the `room` edge
 * function, and clients hold nothing but a seat token and whatever view the
 * server last handed them.
 *
 * The sync shape is deliberate. Realtime carries only a revision number, never
 * state: a shared channel that carried the room would hand every phone every
 * other phone's sealed goal and insider tip. On a revision bump each client
 * asks the edge function for *its own* view, and the function decides what
 * that client is allowed to know.
 *
 * Configure with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. With neither
 * set the app falls back to the local one-browser transport, so development
 * and rehearsal need no backend at all.
 */
import type { Role } from '../engine/types'
import type { Command } from '../game/room'
import type {
  ConnectionState,
  DashboardSnapshot,
  DeniedSnapshot,
  PhoneSnapshot,
  RosterSeat,
  Snapshot,
  Transport,
  TransportOptions,
} from './transport'

const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export function supabaseConfigured(): boolean {
  return Boolean(URL_ && ANON)
}

/** Seat tokens survive a reload so a dropped player rejoins their own seat. */
const tokenKey = (code: string, seat: string) => `jtnz:token:${code}:${seat}`

interface FnResult {
  kind?: 'dashboard' | 'phone'
  view?: unknown
  endgame?: unknown
  revision?: number
  code?: string
  token?: string
  error?: string
  seats?: RosterSeat[]
}

/**
 * A refusal the player can act on, as opposed to a network failure they can
 * only wait out. The two need different screens, so they get different types.
 */
class Refused extends Error {
  constructor(
    readonly reason: DeniedSnapshot['reason'],
    readonly seats: RosterSeat[],
  ) {
    super(reason)
  }
}

/**
 * The token no longer names a seat: the player left, or the room was reset.
 * Distinct from a network failure, which must never cost anybody their chair.
 */
class StaleToken extends Error {}

async function callFunction(body: Record<string, unknown>): Promise<FnResult> {
  const res = await fetch(`${URL_}/functions/v1/room`, {
    method: 'POST',
    headers: {
      apikey: ANON!,
      Authorization: `Bearer ${ANON}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = (await res.json()) as FnResult
  if (res.status === 403) throw new StaleToken(data.error ?? 'not your seat')
  if (res.status === 409) throw new Refused('seat-taken', data.seats ?? [])
  if (res.status === 404) throw new Refused('no-room', [])
  if (res.status === 400 && data.error === 'unknown seat') throw new Refused('bad-seat', [])
  if (!res.ok) throw new Error(data.error ?? `room function returned ${res.status}`)
  return data
}

class SupabaseTransport implements Transport {
  private snapshotSubs = new Set<(s: Snapshot) => void>()
  private connectionSubs = new Set<(c: ConnectionState) => void>()
  private state: ConnectionState = 'connecting'
  private token: string | null = null
  private code: string
  private seat: Role | 'dashboard'
  private revision = 0
  private socket: WebSocket | null = null
  private heartbeat: ReturnType<typeof setInterval> | null = null
  private poller: ReturnType<typeof setInterval> | null = null
  private ticker: ReturnType<typeof setInterval> | null = null
  private closed = false
  private fetching = false
  private everConnected = false
  private attempts = 0

  constructor(opts: TransportOptions) {
    this.seat = opts.kind === 'dashboard' ? 'dashboard' : opts.role
    this.code = (opts.kind === 'dashboard' ? (opts.code ?? '') : opts.code).toUpperCase()
    void this.start(opts)
  }

  private setState(next: ConnectionState): void {
    if (this.state === next || this.closed) return
    this.state = next
    this.connectionSubs.forEach((f) => f(next))
  }

  private async start(opts: TransportOptions): Promise<void> {
    try {
      const stored = this.code ? localStorage.getItem(tokenKey(this.code, this.seat)) : null

      if (opts.kind === 'dashboard' && !this.code) {
        const created = await callFunction({ action: 'create' })
        this.code = created.code!
        this.token = created.token!
        this.emit(created)
      } else if (stored && (await this.resume(stored))) {
        // Reload, lost signal, phone locked — the token proves the seat is
        // still ours and nothing else needs to happen.
      } else if (opts.kind === 'phone') {
        const claimed = await callFunction({ action: 'claim', code: this.code, role: opts.role })
        this.token = claimed.token!
        this.emit(claimed)
      } else {
        // Reopening a dashboard whose token was lost — the seat is already
        // taken, so there is nothing to reclaim. Say so rather than hang.
        throw new Error('this browser does not hold that room')
      }

      if (this.token) localStorage.setItem(tokenKey(this.code, this.seat), this.token)
      this.everConnected = true
      this.attempts = 0
      this.setState('live')
      this.subscribe()

      // A dropped broadcast should cost latency, never a stuck session.
      this.poller = setInterval(() => void this.refresh(), 4000)

      // Nothing runs server-side between requests, so the dashboard asks the
      // server to look at its own clock. It cannot say what time it is — the
      // function uses Date.now() and nothing advances before its deadline.
      if (this.seat === 'dashboard') {
        this.ticker = setInterval(() => void this.tick(), 500)
      }
    } catch (err) {
      // A refused seat is an answer, not an outage. Retrying it forever would
      // leave the player on a spinner while the room waits for them.
      if (err instanceof Refused) {
        this.token = null
        try {
          if (this.code) localStorage.removeItem(tokenKey(this.code, this.seat))
        } catch {
          // Clearing a stale token is a courtesy, never a requirement.
        }
        this.setState('live')
        this.snapshotSubs.forEach((f) =>
          f({ kind: 'denied', reason: err.reason, code: this.code, seats: err.seats }),
        )
        return
      }
      // Never having reached the server is a different problem from losing it:
      // it means the edge function is not deployed or the key is wrong, and no
      // amount of waiting fixes either.
      console.error('[jtnz] could not join room:', err)
      this.setState(this.everConnected ? 'reconnecting' : 'unreachable')
      this.attempts += 1
      const backoff = Math.min(30_000, 2000 * 2 ** Math.min(this.attempts - 1, 4))
      setTimeout(() => !this.closed && void this.start(opts), backoff)
    }
  }

  /**
   * Try a stored token. A token that no longer names a seat — because the
   * player left, or a facilitator reset the room — must not strand them on a
   * reconnect spinner, so a failure here falls back to claiming the seat afresh.
   */
  private async resume(stored: string): Promise<boolean> {
    try {
      this.emit(await callFunction({ action: 'view', code: this.code, token: stored }))
      this.token = stored
      return true
    } catch (err) {
      // Anything else — a dropped request, a slow network — is not evidence
      // that the seat is gone, so it propagates and the caller retries.
      if (!(err instanceof StaleToken)) throw err
      try {
        localStorage.removeItem(tokenKey(this.code, this.seat))
      } catch {
        // Best effort; the claim below is what actually matters.
      }
      return false
    }
  }

  private emit(result: FnResult): void {
    if (result.revision !== undefined) this.revision = result.revision
    if (!result.view) return
    const snapshot = (
      result.kind === 'dashboard'
        ? { kind: 'dashboard', view: result.view, endgame: result.endgame }
        : { kind: 'phone', view: result.view, endgame: result.endgame }
    ) as DashboardSnapshot | PhoneSnapshot
    this.snapshotSubs.forEach((f) => f(snapshot))
  }

  private async refresh(): Promise<void> {
    if (!this.token || this.closed || this.fetching) return
    this.fetching = true
    try {
      this.emit(await callFunction({ action: 'view', code: this.code, token: this.token }))
      this.setState('live')
    } catch {
      this.setState('reconnecting')
    } finally {
      this.fetching = false
    }
  }

  private async tick(): Promise<void> {
    if (!this.token || this.closed) return
    try {
      this.emit(await callFunction({ action: 'tick', code: this.code, token: this.token }))
    } catch {
      this.setState('reconnecting')
    }
  }

  /**
   * Realtime, over the raw websocket rather than supabase-js.
   *
   * The client needs exactly one thing from Realtime — a nudge that the room
   * moved — and the whole SDK is a large dependency to carry for that.
   */
  private subscribe(): void {
    if (this.closed) return
    const url = `${URL_!.replace(/^http/, 'ws')}/realtime/v1/websocket?apikey=${ANON}&vsn=1.0.0`
    const socket = new WebSocket(url)
    this.socket = socket

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          topic: `realtime:room:${this.code}`,
          event: 'phx_join',
          payload: { config: { broadcast: { self: true } } },
          ref: '1',
        }),
      )
      this.heartbeat = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: 'hb' }))
        }
      }, 25_000)
    }

    socket.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data as string) as {
          event?: string
          payload?: { event?: string; payload?: { revision?: number } }
        }
        if (msg.event !== 'broadcast') return
        const revision = msg.payload?.payload?.revision
        if (revision !== undefined && revision > this.revision) void this.refresh()
      } catch {
        // A malformed frame is not worth tearing the session down over.
      }
    }

    socket.onclose = () => {
      if (this.heartbeat) clearInterval(this.heartbeat)
      if (!this.closed) setTimeout(() => this.subscribe(), 2000)
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
    if (!this.token) return
    void callFunction({ action: 'cmd', code: this.code, token: this.token, cmd })
      .then((r) => this.emit(r))
      .catch(() => this.setState('reconnecting'))
  }

  release(): void {
    const token = this.token
    this.token = null
    try {
      localStorage.removeItem(tokenKey(this.code, this.seat))
    } catch {
      // The server-side release below is what actually frees the chair.
    }
    if (token) void callFunction({ action: 'release', code: this.code, token }).catch(() => {})
  }

  close(): void {
    this.closed = true
    if (this.heartbeat) clearInterval(this.heartbeat)
    if (this.poller) clearInterval(this.poller)
    if (this.ticker) clearInterval(this.ticker)
    this.socket?.close()
    this.setState('closed')
  }
}

export function createSupabaseTransport(opts: TransportOptions): Transport {
  return new SupabaseTransport(opts)
}
