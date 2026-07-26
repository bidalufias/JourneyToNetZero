/**
 * Plain-English trade-off hints for option cards.
 *
 * The design is explicit: option cards show title, one line, cost, and a
 * trade-off hint — never raw numbers. Players should be making judgement
 * calls, not spreadsheet calls. The hint is capped at 52 characters and reads
 * as a verdict, not a stat line.
 *
 * Hints are derived, not authored, for two reasons: 216 authored strings would
 * be 216 chances to leak a number, and a content pack swap (Singapore,
 * corporate, schools) would need all of them rewritten. A pack may still
 * override any single card by adding a `hint` field to the option.
 *
 * The generator reads only the *shape* of an option — its archetype, the signs
 * of its growth and happiness effects, whether it sets a legacy flag — so a
 * hint can never be reverse-engineered into a value.
 */
import type { Option } from '../engine/types'

/** Stable per-option variant choice, so a card reads the same every time. */
function variant(id: string, n: number): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h % n
}

type Shape = {
  /** Helps the country's carbon. */
  cuts: boolean
  /** Costs growth. */
  slowsEconomy: boolean
  /** Costs happiness. */
  unpopular: boolean
  /** Buys happiness. */
  popular: boolean
  /** Builds the green economy. */
  builds: boolean
  /** Sets a legacy flag that bites later. */
  legacy: boolean
  /** Pays off later rather than now. */
  slowBurn: boolean
}

const BY_ARCHETYPE: Record<string, (s: Shape) => string[]> = {
  SPEND_STEER: (s) => [
    s.unpopular ? 'Expensive. Right. Not everyone will agree.' : 'Expensive, and the country will feel it working.',
    'Bold. Needs the public behind you.',
    s.builds ? 'Buys a green economy. Empties the Treasury.' : 'Public money, pointed in one direction.',
  ],
  REGULATE: (s) => [
    'Makes the polluter move. Costs you friends.',
    s.slowsEconomy ? 'It works. Growth will not thank you.' : 'Force beats persuasion. Someone pays.',
    'The law does what the meeting could not.',
  ],
  DEREGULATE: (s) => [
    s.popular ? 'Popular today. Expensive by Round 6.' : 'Cheap now. The bill arrives later.',
    'Protects growth. Costs the country carbon.',
    s.legacy ? 'Easy. And it closes doors you will want.' : 'Do nothing, and hope. It has worked before.',
  ],
  TRANSITION: (s) => [
    'Real money, real pain, real cuts.',
    s.slowsEconomy ? 'Hurts this year. Pays for a decade.' : 'The expensive answer, and the honest one.',
    s.builds ? 'The biggest green move on the table.' : 'Capex now. Certainty later.',
  ],
  EXPAND: (s) => [
    s.popular ? 'Profitable. The room will notice.' : 'Good for the balance sheet. Bad for the air.',
    'Faster, cheaper, dirtier. Everyone sees it.',
    'Business as usual, at speed.',
  ],
  PARTNER: () => [
    'Halves in value unless someone co-funds it.',
    'Only works if the Government pays its half.',
    'A deal. It needs a partner to be worth anything.',
  ],
  ADAPT: (s) => [
    'Quiet, cheap, and it costs you something.',
    s.unpopular ? 'Absorb it. Nobody enjoys this one.' : 'Get on with it. No drama, small gains.',
    'The unglamorous option that usually helps.',
  ],
  DEMAND_RELIEF: () => [
    'Makes the Government pay, one way or another.',
    'Relief now. It comes out of someone else.',
    'Loud, popular, and it breaks the coalition.',
  ],
  SELF_ORGANISE: () => [
    'Doubles if the powerful actually back you.',
    'Do it yourselves. Better with real support.',
    'Community power. It tires people out.',
  ],
  ESCALATE: () => [
    'Loud. Effective. Nobody here will thank you.',
    'Pressure works. It also makes enemies.',
    'Name them. Watch the room change.',
  ],
  COLLABORATE: () => [
    'Real influence, and a little of your soul.',
    'A seat at the table costs you credibility.',
    'Inside the room. Quieter every time.',
  ],
  EDUCATE: (s) => [
    s.slowBurn ? 'Nothing today. Something big by Round 6.' : 'Slow, cheap, and it compounds.',
    'Evidence now. It pays every round after.',
    'The patient move. It always adds up.',
  ],
}

const MAX = 52

export function optionHint(option: Option): string {
  const authored = (option as Option & { hint?: string }).hint
  if (authored) return authored.slice(0, MAX)

  const flags = option.flags ?? []
  const shape: Shape = {
    cuts: option.e < 0,
    slowsEconomy: option.g < 0,
    unpopular: option.h < 0,
    popular: option.h >= 0.5,
    builds: option.gr >= 8,
    legacy: flags.length > 0,
    slowBurn: flags.some((f) => f.startsWith('EVIDENCE')),
  }

  const build = BY_ARCHETYPE[option.arch]
  if (!build) return 'A judgement call. Make it.'

  const choices = build(shape).filter((s) => s.length <= MAX)
  if (!choices.length) return 'A judgement call. Make it.'
  return choices[variant(option.id, choices.length)]
}

/** "2 FP", "3 C", "+1 FP" or "FREE" — a chip, never an effect. */
export function costLabel(option: Option): string {
  const c = option.cost ?? {}
  const parts: string[] = []
  if (c.fiscal) parts.push(c.fiscal > 0 ? `${c.fiscal} FP` : `+${-c.fiscal} FP`)
  if (c.capital) parts.push(c.capital > 0 ? `${c.capital} C` : `+${-c.capital} C`)
  return parts.length ? parts.join(' · ') : 'FREE'
}
