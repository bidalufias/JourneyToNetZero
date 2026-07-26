/**
 * Picks the transport.
 *
 * With Supabase configured the game runs the way a workshop needs it to: four
 * phones on four devices, one dashboard on the projector, one authoritative
 * room in an edge function. Without it, everything falls back to the local
 * one-browser transport so the app runs with no backend at all — which is what
 * makes `npm run dev` useful and lets a facilitator rehearse on a laptop.
 *
 * Both satisfy the same contract, so nothing above this line knows which is in
 * use, and neither can hand a player the numbers behind an option.
 */
import { createLocalTransport } from './local'
import { createSupabaseTransport, supabaseConfigured } from './supabase'
import type { Transport, TransportOptions } from './transport'

export function createTransport(opts: TransportOptions): Transport {
  return supabaseConfigured() ? createSupabaseTransport(opts) : createLocalTransport(opts)
}

export { supabaseConfigured }
export type { Transport, TransportOptions }
