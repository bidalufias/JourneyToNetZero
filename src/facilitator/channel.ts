/**
 * The link between the big screen and the facilitator's own window.
 *
 * The script window is not a second dashboard: it never builds a transport and
 * never touches the room. In the local transport the dashboard tab *is* the
 * host, so a second one would fight it for the session; and even against
 * Supabase, a second dashboard client is a second thing to keep alive for no
 * gain. Instead the broadcast tab publishes where it has got to, and the script
 * window reads that and may ask it to advance.
 *
 * `BroadcastChannel` is same-origin and same-browser, which is exactly the
 * shape of the problem: the facilitator's laptop drives the projector, and the
 * script sits on the laptop's own screen next to it. A script window opened
 * anywhere else still works — it just shows the run of show without knowing
 * which phase is live, which is what a printout would have given them.
 */
import type { Role } from '../engine/types'
import type { Phase } from '../game/session'

export interface FacilitatorState {
  code: string
  phase: Phase
  round: number
  phaseEndsAt: number | null
  seats: { role: Role; name: string | null; connected: boolean; locked: boolean }[]
}

export type FacilitatorMessage =
  /** The broadcast tab, saying where it is. */
  | { t: 'state'; state: FacilitatorState }
  /** A script window that has just opened, asking to be told. */
  | { t: 'hello' }
  /** The facilitator, pressing a button in the script window. */
  | { t: 'cmd'; cmd: 'start' | 'advance' }
  /** The broadcast tab going away. */
  | { t: 'gone' }

export const channelName = (code: string) => `jtnz:facilitator:${code || 'new'}`

/** Null where BroadcastChannel is missing — the script degrades, nothing breaks. */
export function openChannel(code: string): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null
  try {
    return new BroadcastChannel(channelName(code))
  } catch {
    return null
  }
}
