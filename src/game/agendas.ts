import type { Agenda, RoleId } from './types'

/**
 * Three per role, one drawn privately at setup. Only the holder sees it, and
 * it is revealed and scored at the end. This is why a player argues for
 * something that looks irrational to everyone else at the table.
 */
export const AGENDAS: Agenda[] = [
  /* -------------------------------------------------------- government */
  {
    id: 'gov-reelection',
    role: 'government',
    title: 'Re-election',
    description:
      'You cannot deliver anything from opposition. Living standards must never fall in two consecutive rounds — one bad year is survivable, two is a lost seat.',
    check: { type: 'never_below', indicator: 'living', value: 38 },
  },
  {
    id: 'gov-fiscal',
    role: 'government',
    title: 'Fiscal Hawk',
    description:
      'A government that runs out of money stops governing. Never end a round with your Budget at zero.',
    check: { type: 'never_broke' },
  },
  {
    id: 'gov-legacy',
    role: 'government',
    title: 'Legacy',
    description:
      'You want your name on the decade that turned. Personally deliver the single largest emissions cut of the game.',
    check: { type: 'biggest_cut' },
  },

  /* ---------------------------------------------------------- business */
  {
    id: 'biz-shareholders',
    role: 'business',
    title: 'Shareholders',
    description:
      'You answer to a board. Finish the game with at least 10 Capital — whatever else happens to the country.',
    check: { type: 'currency_final', op: 'gte', value: 10 },
  },
  {
    id: 'biz-pivot',
    role: 'business',
    title: 'The Pivot',
    description:
      'You have staked your career on being early. At least four of your eight actions must be the collective option.',
    check: { type: 'shape_count', shape: 'collective', min: 4 },
  },
  {
    id: 'biz-market',
    role: 'business',
    title: 'Market Share',
    description:
      'A shrinking economy is a shrinking business. The Economy must finish above 70.',
    check: { type: 'final', indicator: 'economy', op: 'gte', value: 70 },
  },

  /* --------------------------------------------------------- community */
  {
    id: 'com-costofliving',
    role: 'community',
    title: 'Cost of Living',
    description:
      'Abstractions do not feed anyone. Living Standards must never drop below 42 at any point in the game.',
    check: { type: 'never_below', indicator: 'living', value: 42 },
  },
  {
    id: 'com-justtransition',
    role: 'community',
    title: 'Just Transition',
    description:
      'Growth that leaves people behind is not growth. There must never be a round where the Economy rises while Living Standards fall.',
    check: { type: 'no_growth_without_people' },
  },
  {
    id: 'com-voice',
    role: 'community',
    title: 'A Seat At The Table',
    description:
      'You are done being consulted after the fact. Complete at least four deals — currency given or received.',
    check: { type: 'deals', min: 4 },
  },

  /* ---------------------------------------------------------- activist */
  {
    id: 'act-credibility',
    role: 'activist',
    title: 'Credibility',
    description:
      'The moment you take their money you become theirs. Never accept a transfer from Business.',
    check: { type: 'never_take_from', role: 'business' },
  },
  {
    id: 'act-urgency',
    role: 'activist',
    title: 'Urgency',
    description:
      'Late is the same as never. Emissions must be at or below 70 by the end of round 5.',
    check: { type: 'by_round', indicator: 'emissions', round: 5, op: 'lte', value: 70 },
  },
  {
    id: 'act-coalition',
    role: 'activist',
    title: 'Coalition',
    description:
      'You cannot win this alone and you know it. Complete at least three deals with Community.',
    check: { type: 'deals_with', role: 'community', min: 3 },
  },
]

export function agendaById(id: string): Agenda {
  const a = AGENDAS.find((x) => x.id === id)
  if (!a) throw new Error(`Unknown agenda: ${id}`)
  return a
}

export function agendasFor(role: RoleId): Agenda[] {
  return AGENDAS.filter((a) => a.role === role)
}
