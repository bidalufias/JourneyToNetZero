/**
 * Transport — how a client reaches the authoritative room.
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
 * the game does — and a player cannot reach the numbers by reaching past the UI.
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

export type Snapshot = DashboardSnapshot | PhoneSnapshot

export type ConnectionState =
  | 'connecting'
  | 'live'
  /** Was connected, lost it. The seat is held; this usually recovers. */
  | 'reconnecting'
  /**
   * Configured for Supabase but the server cannot be reached at all — almost
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

/** Wire messages for the local BroadcastChannel implementation. */
export type Wire =
  | { t: 'hello'; role: Role | 'dashboard' }
  | { t: 'cmd'; cmd: Command }
  | { t: 'snapshot'; dashboard: DashboardSnapshot; phones: Record<Role, PhoneSnapshot> }
  | { t: 'hostGone' }
