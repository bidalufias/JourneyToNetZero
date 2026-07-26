import { createClient } from '@supabase/supabase-js'
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './config'
import type { Indicators, Phase, RoleId, RoundResult, Transfer } from '../game/types'

export interface RoomRow {
  code: string
  phase: Phase
  round: number
  indicators: Indicators
  seats: Partial<Record<RoleId, SeatRow>>
  history: RoundResult[]
  pending_choices: Partial<Record<RoleId, string>>
  pending_transfers: Transfer[]
  phase_ends_at: string | null
  paused: boolean
  host_id: string | null
}

export interface SeatRow {
  id: string
  role: RoleId
  name: string
  currency: number
  agendaId: string
  connected: boolean
  /**
   * Set when a player commits. The chosen action is deliberately NOT written
   * to the room at this point — only the fact that they are locked. Choices
   * are published a moment later, once all four are locked and nobody can
   * change their mind. That is what keeps the round genuinely simultaneous.
   */
  locked: boolean
  /**
   * A seat nobody took, played by the computer so a table of one, two or three
   * can still run all four stakeholders. It chooses at random from whatever is
   * playable and never opens a deal — the point being that the seat is filled,
   * not represented.
   *
   * Stored inside the seats JSON, so this needs no schema change.
   */
  bot?: boolean
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false },
  realtime: { params: { eventsPerSecond: 10 } },
})

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ' // no I or O — they read as 1 and 0

export function generateCode(): string {
  let out = ''
  const bytes = crypto.getRandomValues(new Uint8Array(4))
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length]
  return out
}

export function newPlayerId(): string {
  return crypto.randomUUID()
}
