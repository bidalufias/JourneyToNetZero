import type { Situation } from './types'

/**
 * Eight rounds, 2026 to 2050. Round 1 opens on the situation Malaysia is
 * actually in as of July 2026. Every `realStory` is sourced in RESEARCH.md.
 *
 * `drift` is business-as-usual: the world moves whether or not the table does.
 * Left alone for all eight rounds it ends the game at roughly 58 / 111 / 31 —
 * a comprehensive loss on all three counts. Doing nothing is not neutral.
 */
export const SITUATIONS: Situation[] = [
  {
    round: 1,
    year: 2026,
    title: 'The Tax That Keeps Slipping',
    headline:
      'The carbon tax was meant to start this year. In April it was shelved.',
    context:
      'A carbon price on iron, steel and energy was announced for 2026 at RM35–45 a tonne. Then conflict in the Middle East pushed oil through the roof and the government put it on hold rather than squeeze industry and the rakyat at the same time. Meanwhile the Climate Change Bill sits on the order paper, ready to give Malaysia its first climate law.',
    realStory:
      'Real. The carbon tax was deferred in April 2026, with the minister citing the Middle East conflict. The Climate Change Bill was tabled in the first parliamentary sitting of 2026 and would make Malaysia the second ASEAN country with a dedicated climate law.',
    drift: { economy: 2, emissions: 3, living: -2 },
  },
  {
    round: 2,
    year: 2027,
    title: 'Election Year',
    headline:
      'GE16 must be called within months. Every subsidy is now a campaign promise.',
    context:
      'RON95 is held at RM1.99 for eligible citizens and the monthly quota has already been trimmed to 200 litres. Removing the T20 from the scheme would save around RM1.5 billion a month — real money for the transition, and a gift to every opposition candidate in the country. Sarawak goes to the polls first.',
    realStory:
      'Real. BUDI95 fixed RON95 at RM1.99 from September 2025; the quota was cut from 300 to 200 litres in April 2026. Economists put T20 exclusion savings at up to RM1.5bn monthly. Parliament must dissolve by December 2027, with the election due by February 2028.',
    drift: { economy: 2, emissions: 3, living: -2 },
  },
  {
    round: 3,
    year: 2029,
    title: 'The Data-Centre Reckoning',
    headline:
      'Johor has said yes to more computing than its grid can carry.',
    context:
      'Approved and pipeline projects point at roughly 7,000 megawatts — an eightfold jump — and by the mid-2030s data centres could take some 40% of the state’s electricity. They drink close to 200 times the water of ordinary industry. The investment is real, the jobs are real, and the substations are not built.',
    realStory:
      'Real. Johor had approved 51 data centre projects worth USD44.3 billion by November 2025 and had already rejected up to 30% of applications on sustainability grounds. The binding constraint is grid delivery, not generation; approvals can take 18 months.',
    drift: { economy: 3, emissions: 4, living: -2 },
  },
  {
    round: 4,
    year: 2031,
    title: 'Peak Or Bust',
    headline:
      'Malaysia told the world its emissions would peak by 2030. They have not.',
    context:
      'Seven gigawatts of coal — over half the fleet — is scheduled to come off the grid by 2033. Retiring it on time means finding replacement capacity fast and wearing the price. Keeping it means the peaking promise slips, and the next NDC review will say so in public.',
    realStory:
      'Real. NDC 3.0, submitted October 2025, commits Malaysia to peaking emissions between 2029 and 2034 with the goal of 2030, and to cutting up to 30 MtCO2e by 2035. Around 7 GW of coal capacity is scheduled to retire between 2029 and 2033, with unabated coal gone by 2044.',
    drift: { economy: 2, emissions: 2, living: -2 },
  },
  {
    round: 5,
    year: 2034,
    title: 'Smoke And The Trade Wall',
    headline:
      'The haze closes the schools. Brussels closes the market.',
    context:
      'A severe burning season has the AQI in the red from Johor to Penang, and the hospitals are filling. In the same quarter, EU deforestation rules bite: palm oil that cannot be traced to a plantation cleared before 2021 does not enter Europe. Smallholders have neither the paperwork nor the money to get it.',
    realStory:
      'Real. The 2026 haze outlook was rated red for Malaysia, with ASEAN hotspots up 86% in the first half of the year. EUDR enforcement began 30 December 2026, requiring plantation-level traceability; roughly 12% of Malaysia’s palm exports go to the EU, and compliant oil already trades at a USD150–220/tonne premium.',
    drift: { economy: 1, emissions: 1, living: -3 },
  },
  {
    round: 6,
    year: 2038,
    title: 'The Petroleum Squeeze',
    headline:
      'The dividend that quietly balanced every budget has been shrinking for a decade.',
    context:
      'Petroleum was 41% of federal revenue in 2009 and under 18% by the mid-2020s. The diversification worked — but the last slice is the hardest, the fields are older, and the money that used to arrive without a fight now has to be raised from someone in this room.',
    realStory:
      'Real, and smaller than most people assume. PETRONAS cut its 2026 government dividend 38% to RM20bn, the lowest since 2017. But petroleum-related revenue was already down to 17.5% of federal revenue in 2025 from 28% in 2022, and PETRONAS dividends alone are only 5–6%. Tax is over 70% of revenue.',
    drift: { economy: -1, emissions: 0, living: -2 },
  },
  {
    round: 7,
    year: 2043,
    title: 'The Water Rises',
    headline:
      'The modelled worst case arrives: a one-in-twenty-year flood on the back of a heatwave.',
    context:
      'Whole districts are under water for the second time in a decade. Every ringgit spent on sea walls, drainage and relief is a ringgit not spent on the transition — and the transition is what stops this happening again in 2055. Nobody in the room gets to say that out loud to a family on a rooftop.',
    realStory:
      'Real as a projection. The World Bank modelled a one-in-20-year flood following an extended heatwave cutting Malaysian GDP by over 20% in a single year, and puts disaster resilience needs at USD32.6 billion. The December 2024 Kelantan–Terengganu floods displaced over 90,000 people.',
    drift: { economy: -2, emissions: -1, living: -4 },
  },
  {
    round: 8,
    year: 2048,
    title: 'The Last Mile',
    headline:
      'Everything cheap has been done. What is left is expensive, slow or contested.',
    context:
      'Cement, steel, aviation, agriculture and the residual grid. The options on the table are nuclear, carbon capture, and paying other countries for offsets — each of which somebody in this room has spent twenty years opposing. Two years to 2050.',
    realStory:
      'Real. Nuclear was formally reintroduced in the 13th Malaysia Plan after Cabinet and National Energy Council endorsement in November 2024. Unabated coal is to be gone by 2044 and renewables to reach 70% of the mix by 2050, leaving hard-to-abate industry and land sinks as the closing problem.',
    drift: { economy: 1, emissions: -1, living: -2 },
  },
]

export const TOTAL_ROUNDS = SITUATIONS.length

export function situationFor(round: number): Situation {
  const s = SITUATIONS.find((x) => x.round === round)
  if (!s) throw new Error(`No situation for round ${round}`)
  return s
}
