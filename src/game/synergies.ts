import type { Ending, Synergy } from './types'

/**
 * Authored per round rather than generic, so each one teaches the specific
 * politics of that situation. Combinations resolve non-linearly: aligned play
 * is amplified, a policy without public backing is diluted, and pressure
 * applied in the wrong direction reverses.
 */
export const SYNERGIES: Synergy[] = [
  {
    id: 'r1-grand-bargain',
    round: 1,
    title: 'The Grand Bargain',
    description:
      'A carbon price, a household rebate and an industry that has agreed to it in advance. This is what a functioning transition looks like on day one.',
    kind: 'amplify',
    requires: ['r1-gov-conditional', 'r1-biz-conditional', 'r1-com-conditional'],
    affects: ['government', 'business', 'community'],
    multiplier: 1.5,
  },
  {
    id: 'r1-no-legitimacy',
    round: 1,
    title: 'No Social Licence',
    description:
      'A carbon price introduced while households are publicly defending the fuel subsidy. The policy survives the sitting and not the year.',
    kind: 'cancel',
    requires: ['r1-gov-conditional', 'r1-com-self'],
    affects: ['government'],
    multiplier: 0.35,
  },
  {
    id: 'r2-crossparty',
    round: 2,
    title: 'Beyond The Cycle',
    description:
      'Subsidy reform agreed across the aisle and carried into the kampung by the people it affects. It outlives the government that passed it.',
    kind: 'amplify',
    requires: ['r2-gov-conditional', 'r2-com-conditional'],
    affects: ['government', 'community'],
    multiplier: 1.5,
  },
  {
    id: 'r2-election-trap',
    round: 2,
    title: 'The Election Trap',
    description:
      'Reform attempted while the subsidy is being defended from every stage in the country. It becomes the opposition’s best line and is reversed within a year.',
    kind: 'backfire',
    requires: ['r2-gov-collective', 'r2-com-self'],
    affects: ['government'],
    multiplier: -1,
  },
  {
    id: 'r3-corridor',
    round: 3,
    title: 'The Corridor',
    description:
      'An anchor tenant, community consent and a grid built ahead of demand. Johor gets the investment and the power to run it.',
    kind: 'amplify',
    requires: ['r3-biz-conditional', 'r3-com-conditional'],
    affects: ['business', 'community'],
    multiplier: 1.6,
  },
  {
    id: 'r3-water-war',
    round: 3,
    title: 'The Water War',
    description:
      'Unconditional approvals meeting organised local objection. The permits are issued, the projects stall in the courts, and nobody gets what they wanted.',
    kind: 'cancel',
    requires: ['r3-gov-self', 'r3-com-self'],
    affects: ['government', 'business'],
    multiplier: 0.4,
  },
  {
    id: 'r4-just-closure',
    round: 4,
    title: 'A Closure That Holds',
    description:
      'Coal retired on schedule, storage firming the grid, and the affected towns funded and running their own transition. This is the hard one, done right.',
    kind: 'amplify',
    requires: ['r4-gov-conditional', 'r4-biz-conditional', 'r4-com-conditional'],
    affects: ['government', 'business', 'community'],
    multiplier: 1.6,
  },
  {
    id: 'r4-lights-out',
    round: 4,
    title: 'Reserve Margin',
    description:
      'Coal retired on schedule with nothing built to replace it. The blackouts do more damage to the transition than the plants ever did.',
    kind: 'cancel',
    requires: ['r4-gov-collective', 'r4-biz-self'],
    affects: ['government'],
    multiplier: 0.3,
  },
  {
    id: 'r5-clean-chain',
    round: 5,
    title: 'The Clean Chain',
    description:
      'Traceability funded, smallholders organised, and no-burn enforced by the villages themselves. The haze thins and the market reopens.',
    kind: 'amplify',
    requires: ['r5-gov-collective', 'r5-biz-conditional', 'r5-com-conditional'],
    affects: ['government', 'business', 'community'],
    multiplier: 1.6,
  },
  {
    id: 'r5-blame-game',
    round: 5,
    title: 'The Blame Game',
    description:
      'A démarche to the neighbours while your own exporters quietly redirect uncertified volume east. Everyone can see it.',
    kind: 'backfire',
    requires: ['r5-gov-self', 'r5-biz-self'],
    affects: ['government', 'business'],
    multiplier: -1,
  },
  {
    id: 'r6-redeployment',
    round: 6,
    title: 'Redeployment',
    description:
      'The oil company turned into a transition investor, the storage hub built, and the oil towns retrained. The cliff becomes a corner.',
    kind: 'amplify',
    requires: ['r6-gov-conditional', 'r6-biz-conditional', 'r6-com-conditional'],
    affects: ['government', 'business', 'community'],
    multiplier: 1.5,
  },
  {
    id: 'r6-hollow',
    round: 6,
    title: 'Hollowed Out',
    description:
      'Reserves drawn down while the fields are sweated and households refuse the tax. The budget balances this year and there is nothing behind it.',
    kind: 'cancel',
    requires: ['r6-gov-self', 'r6-biz-self', 'r6-com-self'],
    affects: ['government', 'business', 'community'],
    multiplier: 0.35,
  },
  {
    id: 'r7-build-back',
    round: 7,
    title: 'Build Back Ahead',
    description:
      'Reconstruction to a 2050 standard, financed by a resilience bond, with adaptation and mitigation funded as one line. The next flood is survivable.',
    kind: 'amplify',
    requires: ['r7-gov-conditional', 'r7-biz-conditional', 'r7-act-conditional'],
    affects: ['government', 'business', 'activist'],
    multiplier: 1.6,
  },
  {
    id: 'r7-raid',
    round: 7,
    title: 'The Raid',
    description:
      'The transition budget spent on relief while industry rebuilds exactly where it was. Both will be underwater again inside a decade.',
    kind: 'backfire',
    requires: ['r7-gov-self', 'r7-biz-self'],
    affects: ['government', 'business'],
    multiplier: -1,
  },
  {
    id: 'r8-last-mile',
    round: 8,
    title: 'The Last Mile, Closed',
    description:
      'Firm power, industrial capture, restored peatland and an audit that stands up. Not a claim about net zero — the thing itself.',
    kind: 'amplify',
    requires: ['r8-gov-conditional', 'r8-biz-collective', 'r8-com-conditional'],
    affects: ['government', 'business', 'community'],
    multiplier: 1.7,
  },
  {
    id: 'r8-paper-zero',
    round: 8,
    title: 'Paper Zero',
    description:
      'Offsets bought, heavy industry exported, and the announcement made on schedule. The inventory is clean and the atmosphere is unchanged.',
    kind: 'cancel',
    requires: ['r8-gov-self', 'r8-biz-self'],
    affects: ['government', 'business'],
    multiplier: 0.3,
  },
]

export function synergiesFor(round: number): Synergy[] {
  return SYNERGIES.filter((s) => s.round === round)
}

/**
 * 2050 thresholds. All three must be met for the best outcome.
 *
 * Emissions is an index where 2026 = 100, so 30 is a ~70% cut in gross
 * emissions. That is the honest definition of net zero: the residual is small
 * enough for land sinks and removals to close the gap, not literally zero.
 *
 * Calibrated against scripts/balance.ts so the strategies actually separate —
 * a table that only sacrifices lands "Clean, But Poorer", a table that trades
 * can take all three, and a table that defends its own corner takes none.
 */
export const THRESHOLDS = {
  economy: 60,
  emissions: 30,
  living: 60,
} as const

/** Every combination of the three thresholds has a named outcome. */
export const ENDINGS: Ending[] = [
  {
    id: 'green-advanced',
    title: 'A Green Advanced Economy',
    blurb:
      'Malaysia arrived. The economy grew, emissions fell to near zero, and people are measurably better off than they were in 2026. It required every one of you to give something up in a round you would rather have won. Very few tables get here.',
    economy: true,
    emissions: true,
    living: true,
  },
  {
    id: 'clean-but-poorer',
    title: 'Clean, But Poorer',
    blurb:
      'The emissions came down and living standards held, but the economy never recovered its momentum. Malaysia met its climate obligations and watched the investment go to countries that did not. A defensible outcome that nobody will thank you for.',
    economy: false,
    emissions: true,
    living: true,
  },
  {
    id: 'green-unequal',
    title: 'Green And Unequal',
    blurb:
      'Net zero delivered on the back of households. The targets were met, the economy grew, and the cost of getting there was paid by the people with the least room to absorb it. The transition worked. The politics of it will not hold.',
    economy: true,
    emissions: true,
    living: false,
  },
  {
    id: 'prosperous-overheating',
    title: 'Prosperous And Overheating',
    blurb:
      'A richer, more comfortable Malaysia that did not decarbonise in time. Every year of growth bought with emissions that are now somebody else’s problem — and, before long, your children’s. The floods in round seven were not the last ones.',
    economy: true,
    emissions: false,
    living: true,
  },
  {
    id: 'growth-at-all-costs',
    title: 'Growth At All Costs',
    blurb:
      'The economy is the only number that moved. Emissions are barely below where they started and people are worse off than in 2026 — the growth went somewhere, and not to households. This is the path of least resistance, and it leads here.',
    economy: true,
    emissions: false,
    living: false,
  },
  {
    id: 'stalled-fair',
    title: 'Stalled But Fair',
    blurb:
      'You protected people. Living standards held through eight rounds of pressure, and neither the economy nor the emissions curve moved. Kindness without capacity — the country is intact, and the 2050 commitment was missed by a distance.',
    economy: false,
    emissions: false,
    living: true,
  },
  {
    id: 'clean-collapse',
    title: 'The Cliff Edge',
    blurb:
      'Emissions fell because the economy did. Decarbonisation by recession is not a strategy, and the people who paid for it are the ones who could least afford to. The number in the inventory is good. Nothing else is.',
    economy: false,
    emissions: true,
    living: false,
  },
  {
    id: 'stalled-transition',
    title: 'Stalled Transition',
    blurb:
      'Nothing moved. The economy stagnated, emissions stayed high, and living standards fell for eight straight rounds. Every player defended their own position and the country paid for all four of them. This is what happens when nobody trades.',
    economy: false,
    emissions: false,
    living: false,
  },
]

export function endingFor(
  economy: boolean,
  emissions: boolean,
  living: boolean,
): Ending {
  const e = ENDINGS.find(
    (x) => x.economy === economy && x.emissions === emissions && x.living === living,
  )
  if (!e) throw new Error('No ending matched')
  return e
}
