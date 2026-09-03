/**
 * What an option card tells you it will do.
 *
 * Four chips, direction only, never a number. The card used to carry a
 * 52-character mood line instead ("Real money, real pain, real cuts"), which is
 * good writing and a bad interface: a player has forty seconds, three cards they
 * have never seen, and no axis to compare them on.
 *
 * Hiding the *size* of an effect is what keeps this a judgement rather than a
 * spreadsheet, and that stays. Hiding the *direction* was never part of that
 * bargain. It does not create judgement, it creates guessing.
 *
 * Derived from the option's shape, exactly as the old hints were, for the same
 * two reasons: 216 authored strings would be 216 chances to leak a value, and a
 * content pack swap would need every one of them rewritten. The bands below were
 * fitted to the pack so each one is well populated rather than chosen to look
 * tidy.
 */
import type { Archetype, Option } from '../engine/types'

export type Meter = 'carbon' | 'economy' | 'life' | 'clean'

export interface Impact {
  meter: Meter
  label: string
  /** -3 to 3. Sign is the direction the meter moves, size is how hard. */
  dir: number
  /** Whether this direction is the one the country wants. */
  good: boolean
}

/** Three arrows is the top band, and every band holds a real share of the pack. */
const BANDS: Record<Meter, { key: keyof Pick<Option, 'e' | 'g' | 'h' | 'gr'>; label: string; t: [number, number, number]; upIsGood: boolean }> = {
  carbon: { key: 'e', label: 'CARBON', t: [8, 4, 0.5], upIsGood: false },
  economy: { key: 'g', label: 'ECONOMY', t: [0.6, 0.3, 0.05], upIsGood: true },
  life: { key: 'h', label: 'QUALITY OF LIFE', t: [0.6, 0.35, 0.05], upIsGood: true },
  clean: { key: 'gr', label: 'CLEAN ECONOMY', t: [8, 4, 0.5], upIsGood: true },
}

export const METERS: Meter[] = ['carbon', 'economy', 'life', 'clean']

function band(value: number, [t3, t2, t1]: [number, number, number]): number {
  const a = Math.abs(value)
  const size = a >= t3 ? 3 : a >= t2 ? 2 : a >= t1 ? 1 : 0
  return value < 0 ? -size : size
}

export function optionImpact(option: Option): Impact[] {
  return METERS.map((meter) => {
    const spec = BANDS[meter]
    const dir = band(option[spec.key] ?? 0, spec.t)
    return {
      meter,
      label: spec.label,
      dir,
      good: dir === 0 ? true : spec.upIsGood ? dir > 0 : dir < 0,
    }
  })
}

/** "▼▼▼", "▲", or "-". The only thing a player reads off a card. */
export function arrows(dir: number): string {
  if (dir === 0) return '-'
  return (dir < 0 ? '▼' : '▲').repeat(Math.abs(dir))
}

/**
 * The one thing arrows cannot say: a card whose value depends on somebody else.
 * Everything else about an option is now in the chips, so this is empty far more
 * often than not, and an empty line is the correct outcome.
 */
export function optionCondition(option: Option, coFund = false): string | null {
  // Breaking the coalition is material and it is not visible in the arrows. A
  // recession genuinely cuts carbon, so a card like "Cut Costs, Cut Jobs" shows
  // a green carbon arrow and is still the card that costs the table its bonus.
  // That trade is the whole lesson, and a player can only weigh it if they are
  // told which side of it they are standing on.
  if (BREAKS_COALITION.has(option.arch)) return 'Dirty card. It breaks moving together.'
  // Once the Government has said it will pay, the card must say so too. A
  // partnership still warning that it only half works after the money was
  // pledged out loud tells the Business the sentence on the board meant nothing.
  if (option.arch === 'PARTNER') {
    return coFund
      ? 'Partnership. The Government pays half. It works in full.'
      : 'Partnership. Only half works unless the Government pays half.'
  }
  if (option.arch === 'SELF_ORGANISE') return 'Works twice as well if the Government or Business helps.'
  if (option.arch === 'COLLABORATE') return 'You work with them. You gain power. Some supporters leave you.'
  if ((option.flags ?? []).some((f) => f.startsWith('EVIDENCE'))) return 'Does nothing now. Helps every round after this.'
  return null
}

/**
 * The three archetypes that do not count toward moving together, straight from
 * the engine's own test in `playRound`. Named here rather than re-derived so
 * the card cannot tell a player something the resolution disagrees with.
 */
const BREAKS_COALITION: ReadonlySet<Archetype> = new Set<Archetype>([
  'EXPAND',
  'DEREGULATE',
  'DEMAND_RELIEF',
])

/** "2 Budget", "3 Company Money", "+1 Budget" or "Free". A chip, never an effect. */
export function costLabel(option: Option): string {
  const c = option.cost ?? {}
  const parts: string[] = []
  if (c.fiscal) parts.push(c.fiscal > 0 ? `${c.fiscal} Budget` : `+${-c.fiscal} Budget`)
  if (c.capital) parts.push(c.capital > 0 ? `${c.capital} Company Money` : `+${-c.capital} Company Money`)
  return parts.length ? parts.join(' · ') : 'Free'
}
