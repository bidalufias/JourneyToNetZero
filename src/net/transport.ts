/**
 * Transport: how a client reaches the authoritative room.
 *
 * The UI talks only to this interface. Two implementations exist:
 *
 *   LocalTransport   one browser, one host tab, BroadcastChannel between tabs.
 *                    For development, rehearsal and a facilitator testing the
 *                    flow on a laptop before a session.
 *   SupabaseTransport the real thing: room state in Postgres, resolution in an
 *                    Edge Function, sync over Supabase Realtime.
 *
 * Both obey the same contract: clients send `Command`s and receive views. A
 * client never computes game state, so swapping transports cannot change what
 * the game does, and a player cannot reach the numbers by reaching past the UI.
 */
import type { Role } from '../engine/types'
import type { Command } from '../game/room'
import type { DashboardView, PhoneView } from '../game/session'
import type { Endgame } from '../game/room'

export interface DashboardSnapshot {
  kind: 'dashboard'
  view: DashboardView
  endgame: Endgame | null
}

export interface PhoneSnapshot {
  kind: 'phone'
  view: PhoneView
  endgame: Endgame | null
}

/** Who is in which chair, as much of it as is safe to tell an outsider. */
export interface RosterSeat {
  role: Role
  name: string | null
  taken: boolean
}

/**
 * The seat was refused, or the room does not exist.
 *
 * A refusal has to carry the roster, otherwise the only thing the phone can
 * say is "no", and the player's next question is always "then which seat can
 * I have?". Names on the roster are already public: they are on the projector.
 */
export interface DeniedSnapshot {
  kind: 'denied'
  reason: 'seat-taken' | 'no-room' | 'bad-seat'
  code: string
  seats: RosterSeat[]
}

export type Snapshot = DashboardSnapshot | PhoneSnapshot | DeniedSnapshot

export type ConnectionState =
  | 'connecting'
  | 'live'
  /** Was connected, lost it. The seat is held; this usually recovers. */
  | 'reconnecting'
  /**
   * Configured for Supabase but the server cannot be reached at all. Almost
   * always a missing edge function or a bad key, not a flaky network. Worth
   * saying differently, because the fix is a deploy and not patience.
   */
  | 'unreachable'
  | 'closed'

export interface Transport {
  /** Fires whenever the server pushes a new view. */
  onSnapshot(fn: (s: Snapshot) => void): () => void
  onConnection(fn: (c: ConnectionState) => void): () => void
  send(cmd: Command): void
  /**
   * Give up the seat and forget the credential that holds it, so the chair is
   * takeable again. Distinct from `close`, which is what an unmounting tab or
   * a lost signal does and must never cost anybody their place.
   */
  release(): void
  close(): void
}

export interface DashboardTransportOptions {
  kind: 'dashboard'
  /** Omit to create a new room. */
  code?: string
  seed?: number
}

export interface PhoneTransportOptions {
  kind: 'phone'
  code: string
  role: Role
}

export type TransportOptions = DashboardTransportOptions | PhoneTransportOptions

/**
 * Wire messages for the local BroadcastChannel implementation.
 *
 * `hello` carries a per-tab client id because the local host has to answer the
 * same question the edge function does: is this the phone that holds the seat,
 * or a second one that wants it? A tab is the closest thing this transport has
 * to a device, so `sessionStorage` supplies the id.
 */
export type Wire =
  | { t: 'hello'; role: Role | 'dashboard'; client: string }
  | { t: 'cmd'; cmd: Command; role: Role | 'dashboard'; client: string }
  | { t: 'release'; role: Role; client: string }
  | { t: 'snapshot'; dashboard: DashboardSnapshot; phones: Record<Role, PhoneSnapshot> }
  | { t: 'denied'; client: string; snapshot: DeniedSnapshot }
  | { t: 'hostGone' }
