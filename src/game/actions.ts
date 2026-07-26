import type { Action } from './types'

/**
 * 8 rounds x 4 roles x 3 shapes = 96 actions.
 *
 * Shapes are consistent so players learn the grammar once:
 *   self         cheap, protects you, pushes cost onto the others
 *   collective   helps the nation, costs you
 *   conditional  strongest on the board, locked until someone funds you
 *
 * Conditional `requires` are deliberately crossed so that no single player can
 * unlock everyone. Government cannot fund both Business and Community and
 * still afford its own strong play — that shortfall is the negotiation.
 */
export const ACTIONS: Action[] = [
  /* ============================ ROUND 1 — 2026 ============================ */
  {
    id: 'r1-gov-self',
    round: 1,
    role: 'government',
    shape: 'self',
    title: 'Keep the tax shelved',
    summary:
      'Hold the carbon tax back another year. Industry gets relief while oil is high, and nobody has to explain a new levy before an election.',
    cost: 0,
    income: 2,
    effects: { economy: 2, emissions: 4, living: 2 },
    rationale:
      'This is what actually happened in April 2026 — the tax was deferred rather than layered onto an energy shock.',
  },
  {
    id: 'r1-gov-collective',
    round: 1,
    role: 'government',
    shape: 'collective',
    title: 'Pass the Climate Change Bill',
    summary:
      'Get the law on the books: an independent regulator, mandatory reporting, and the machinery a carbon price will eventually need.',
    cost: 3,
    effects: { economy: -1, emissions: -1, living: -1 },
    rationale:
      'The Bill was tabled in the first 2026 sitting and would make Malaysia the second ASEAN country with a dedicated climate law.',
  },
  {
    id: 'r1-gov-conditional',
    round: 1,
    role: 'government',
    shape: 'conditional',
    title: 'Price carbon, rebate the rakyat',
    summary:
      'Introduce the tax on iron, steel and energy — and ring-fence every ringgit of it into targeted household transfers.',
    cost: 4,
    income: 3,
    requires: { from: 'community', amount: 2 },
    effects: { economy: 1, emissions: -2, living: 1 },
    rationale:
      'Revenue recycling is the standard answer to a regressive carbon price, but it only holds if the public believes the money comes back.',
  },
  {
    id: 'r1-biz-self',
    round: 1,
    role: 'business',
    shape: 'self',
    title: 'Lobby for a longer runway',
    summary:
      'Make the case that a carbon price during an oil shock costs jobs. Ask for three more years and a review clause.',
    cost: 1,
    income: 2,
    effects: { economy: 4, emissions: 5, living: 0 },
    rationale:
      'Industry groups warned the tax would hit export competitiveness and push up industrial electricity costs.',
  },
  {
    id: 'r1-biz-collective',
    round: 1,
    role: 'business',
    shape: 'collective',
    title: 'Start measuring now',
    summary:
      'Build the emissions accounting before you are forced to. Get audit-ready for CBAM whether or not the local tax lands.',
    cost: 2,
    effects: { economy: 1, emissions: -1, living: 0 },
    rationale:
      'EU CBAM entered full implementation in January 2026 — exporters need verified emissions data regardless of Malaysian policy.',
  },
  {
    id: 'r1-biz-conditional',
    round: 1,
    role: 'business',
    shape: 'conditional',
    title: 'Trade certainty for a price',
    summary:
      'Accept the carbon tax now in exchange for a fixed schedule and a transition allowance. You can plan against a known number.',
    cost: 3,
    requires: { from: 'government', amount: 2 },
    effects: { economy: 2, emissions: -3, living: 2 },
    rationale:
      'Policy uncertainty is often costlier to capital-intensive industry than the policy itself.',
  },
  {
    id: 'r1-com-self',
    round: 1,
    role: 'community',
    shape: 'self',
    title: 'Defend the subsidy',
    summary:
      'No new costs on households while pump prices are already climbing. Hold the line at RM1.99 and the 200-litre quota.',
    cost: 1,
    effects: { economy: -1, emissions: 3, living: 4 },
    rationale:
      'BUDI95 holds RON95 at RM1.99 for eligible citizens against an unsubsidised price of RM3.72 in May 2026.',
  },
  {
    id: 'r1-com-collective',
    round: 1,
    role: 'community',
    shape: 'collective',
    title: 'Back the Bill publicly',
    summary:
      'Lend your legitimacy to a climate law even though it brings no immediate relief to anyone’s electricity bill.',
    cost: 2,
    effects: { economy: 0, emissions: 0, living: 1 },
    rationale:
      'Climate legislation rarely passes without visible public constituency behind it.',
  },
  {
    id: 'r1-com-conditional',
    round: 1,
    role: 'community',
    shape: 'conditional',
    title: 'Support in exchange for a guarantee',
    summary:
      'Endorse the carbon price — but only against a written commitment that the revenue returns to households, not the general fund.',
    cost: 2,
    requires: { from: 'government', amount: 2 },
    effects: { economy: 0, emissions: -2, living: 2 },
    rationale:
      'The BUDI95 model showed targeted transfers can be delivered directly; the question is whether carbon revenue is treated the same way.',
  },
  {
    id: 'r1-act-self',
    round: 1,
    role: 'activist',
    shape: 'self',
    title: 'Name the delay',
    summary:
      'Make the deferral the story. Every week it slips is a week of free emissions for the biggest emitters in the country.',
    cost: 1,
    income: 1,
    effects: { economy: -2, emissions: -1, living: 1 },
    rationale:
      'Public pressure is the main cost of delay when there is no legal deadline to enforce.',
  },
  {
    id: 'r1-act-collective',
    round: 1,
    role: 'activist',
    shape: 'collective',
    title: 'Publish the compliance gap',
    summary:
      'Do the unglamorous work: document which facilities already report emissions and which have never been measured at all.',
    cost: 2,
    effects: { economy: -2, emissions: -1, living: -1 },
    rationale:
      'Monitoring, reporting and verification is the foundation the Climate Change Bill’s regulator would be built on.',
  },
  {
    id: 'r1-act-conditional',
    round: 1,
    role: 'activist',
    shape: 'conditional',
    title: 'Build the household coalition',
    summary:
      'Join forces with Community. Reframe the climate law as a cost-of-living win rather than an environmental one.',
    cost: 2,
    requires: { from: 'community', amount: 2 },
    effects: { economy: -1, emissions: -2, living: 0 },
    rationale:
      'Climate policy survives elections when it is understood as a bill-reduction policy.',
  },

  /* ============================ ROUND 2 — 2027 ============================ */
  {
    id: 'r2-gov-self',
    round: 2,
    role: 'government',
    shape: 'self',
    title: 'Freeze everything until polling day',
    summary:
      'No new levies, no subsidy changes, no hard decisions. Get through GE16 first and govern afterwards.',
    cost: 0,
    income: 2,
    effects: { economy: 1, emissions: 4, living: 2 },
    rationale:
      'Parliament must dissolve by December 2027; reform windows close as elections approach.',
  },
  {
    id: 'r2-gov-collective',
    round: 2,
    role: 'government',
    shape: 'collective',
    title: 'Exclude the T20 from BUDI95',
    summary:
      'Take the subsidy away from the top 20% of earners. Roughly RM1.5 billion a month, redirected to the transition.',
    cost: 2,
    income: 4,
    effects: { economy: -1, emissions: -1, living: 0 },
    rationale:
      'Economists estimated T20 exclusion could save up to RM1.5bn monthly; the political cost is that the T20 vote, and shout loudest.',
  },
  {
    id: 'r2-gov-conditional',
    round: 2,
    role: 'government',
    shape: 'conditional',
    title: 'Reform with the opposition on board',
    summary:
      'Put subsidy reform beyond the election cycle by agreeing it across the aisle, with Community fronting the case to households.',
    cost: 4,
    income: 4,
    requires: { from: 'community', amount: 3 },
    effects: { economy: 2, emissions: -2, living: 1 },
    rationale:
      'Reforms that survive a change of government are the ones no single party owns.',
  },
  {
    id: 'r2-biz-self',
    round: 2,
    role: 'business',
    shape: 'self',
    title: 'Wait out the election',
    summary:
      'Defer the capex decision until you know who is signing the approvals. Nobody commits a billion ringgit in a caretaker period.',
    cost: 0,
    income: 3,
    effects: { economy: 3, emissions: 5, living: 0 },
    rationale:
      'Investment stalls around Malaysian elections; the pause itself has a carbon cost.',
  },
  {
    id: 'r2-biz-collective',
    round: 2,
    role: 'business',
    shape: 'collective',
    title: 'Sign a corporate renewable PPA',
    summary:
      'Lock in a long-term green power purchase agreement. It costs more today and hedges you against every tariff review after.',
    cost: 3,
    effects: { economy: 1, emissions: -1, living: 1 },
    rationale:
      'RP4 raised the base tariff 14.2% to 45.62 sen/kWh from July 2025, making long-term renewable contracts look cheaper each year.',
  },
  {
    id: 'r2-biz-conditional',
    round: 2,
    role: 'business',
    shape: 'conditional',
    title: 'Anchor a green industrial park',
    summary:
      'Commit to a decarbonised industrial cluster if the state commits to the grid connection. Neither works without the other.',
    cost: 4,
    requires: { from: 'government', amount: 3 },
    effects: { economy: 3, emissions: -3, living: 2 },
    rationale:
      'Industrial decarbonisation depends on transmission investment that no single firm will fund alone.',
  },
  {
    id: 'r2-com-self',
    round: 2,
    role: 'community',
    shape: 'self',
    title: 'Make it the election issue',
    summary:
      'Any candidate who touches the petrol subsidy hears about it at every ceramah between now and polling day.',
    cost: 1,
    income: 2,
    effects: { economy: -2, emissions: 3, living: 4 },
    rationale:
      'Fuel prices have decided Malaysian elections before, and everyone in the room knows it.',
  },
  {
    id: 'r2-com-collective',
    round: 2,
    role: 'community',
    shape: 'collective',
    title: 'Accept targeting, demand transparency',
    summary:
      'Agree that the T20 can pay full price — on condition the savings are published, line by line, every quarter.',
    cost: 2,
    effects: { economy: 0, emissions: 0, living: 2 },
    rationale:
      'Public tolerance for subsidy reform tracks closely with whether people believe the savings are visible.',
  },
  {
    id: 'r2-com-conditional',
    round: 2,
    role: 'community',
    shape: 'conditional',
    title: 'Deliver the reform for them',
    summary:
      'Take the case to the kampung yourself, if the money is guaranteed to come back as transport, clinics and schools.',
    cost: 3,
    requires: { from: 'government', amount: 3 },
    effects: { economy: 1, emissions: -2, living: 2 },
    rationale:
      'Community-led communication has succeeded where government messaging on subsidy rationalisation has not.',
  },
  {
    id: 'r2-act-self',
    round: 2,
    role: 'activist',
    shape: 'self',
    title: 'Score the manifestos',
    summary:
      'Publish a climate scorecard for every party and make them answer for it in public.',
    cost: 1,
    income: 2,
    effects: { economy: -3, emissions: -1, living: 1 },
    rationale:
      'Election-time scorecards are one of the few moments climate policy is forced onto a party platform.',
  },
  {
    id: 'r2-act-collective',
    round: 2,
    role: 'activist',
    shape: 'collective',
    title: 'Campaign for the reform',
    summary:
      'Back subsidy targeting publicly — the least popular position available to you, and the one the arithmetic supports.',
    cost: 3,
    effects: { economy: -2, emissions: -1, living: 0 },
    rationale:
      'Fossil fuel subsidies overwhelmingly benefit higher-income households, a point advocacy groups have made for years.',
  },
  {
    id: 'r2-act-conditional',
    round: 2,
    role: 'activist',
    shape: 'conditional',
    title: 'Bind the winner in advance',
    summary:
      'Get every major party to sign a public climate pledge before the writ drops, with Business standing alongside you.',
    cost: 3,
    requires: { from: 'business', amount: 3 },
    effects: { economy: 0, emissions: -2, living: 0 },
    rationale:
      'Cross-party pre-commitments are how climate policy survives a change of administration.',
  },

  /* ============================ ROUND 3 — 2029 ============================ */
  {
    id: 'r3-gov-self',
    round: 3,
    role: 'government',
    shape: 'self',
    title: 'Approve everything',
    summary:
      'Investment is investment. Sign the data centres, book the FDI number, let the grid catch up later.',
    cost: 0,
    income: 3,
    effects: { economy: 4, emissions: 4, living: -1 },
    rationale:
      'Johor had approved 51 projects worth USD44.3bn by late 2025, ahead of the infrastructure to serve them.',
  },
  {
    id: 'r3-gov-collective',
    round: 3,
    role: 'government',
    shape: 'collective',
    title: 'Condition approvals on power and water',
    summary:
      'No permit without a renewable supply plan and a closed-loop cooling commitment. Some investors will walk.',
    cost: 3,
    effects: { economy: -2, emissions: -2, living: 1 },
    rationale:
      'Johor already rejected up to 30% of applications on sustainability grounds — the screening mechanism exists.',
  },
  {
    id: 'r3-gov-conditional',
    round: 3,
    role: 'government',
    shape: 'conditional',
    title: 'Build the grid ahead of demand',
    summary:
      'Fund transmission and substations before the load arrives, with industry co-investing. Eighteen-month approvals become six.',
    cost: 5,
    requires: { from: 'business', amount: 3 },
    effects: { economy: 2, emissions: -3, living: 1 },
    rationale:
      'The binding constraint in Johor is grid delivery rather than generation capacity; TNB’s RP4 capex more than doubled to RM42.8bn.',
  },
  {
    id: 'r3-biz-self',
    round: 3,
    role: 'business',
    shape: 'self',
    title: 'Build now, green it later',
    summary:
      'Take the grid connection you can get today. Commit to renewables in a press release and a future procurement cycle.',
    cost: 2,
    income: 4,
    effects: { economy: 6, emissions: 5, living: -3 },
    rationale:
      'Data centre demand is contracted years ahead; clean supply frequently arrives after the load does.',
  },
  {
    id: 'r3-biz-collective',
    round: 3,
    role: 'business',
    shape: 'collective',
    title: 'Wastewater cooling and on-site solar',
    summary:
      'Run on treated effluent and put generation on your own roof. Slower to build, and it takes you off the water fight.',
    cost: 3,
    effects: { economy: 0, emissions: -2, living: 2 },
    rationale:
      'At least one Johor operator runs entirely on treated wastewater and has signed a renewable supply deal with TNB.',
  },
  {
    id: 'r3-biz-conditional',
    round: 3,
    role: 'business',
    shape: 'conditional',
    title: 'Anchor tenant for a clean grid',
    summary:
      'Underwrite a dedicated renewable supply corridor as its first customer — if the community accepts the land use.',
    cost: 4,
    requires: { from: 'community', amount: 3 },
    effects: { economy: 3, emissions: -4, living: 2 },
    rationale:
      'Large anchor offtakers are what make new renewable capacity bankable.',
  },
  {
    id: 'r3-com-self',
    round: 3,
    role: 'community',
    shape: 'self',
    title: 'Fight the water allocation',
    summary:
      'Two hundred times the water of ordinary industry, in a state that rations in a dry year. Object to every permit.',
    cost: 1,
    income: 2,
    effects: { economy: 1, emissions: 3, living: 1 },
    rationale:
      'Water draw is the most concrete local grievance against the data centre build-out.',
  },
  {
    id: 'r3-com-collective',
    round: 3,
    role: 'community',
    shape: 'collective',
    title: 'Negotiate a community benefit deal',
    summary:
      'Accept the projects in return for local hiring quotas, training places and a share of the rates.',
    cost: 2,
    effects: { economy: -1, emissions: -1, living: 3 },
    rationale:
      'Community benefit agreements convert local opposition into local stake, at the cost of the objection itself.',
  },
  {
    id: 'r3-com-conditional',
    round: 3,
    role: 'community',
    shape: 'conditional',
    title: 'Consent for the corridor',
    summary:
      'Give the renewable corridor the social licence it needs to cross your land — for a permanent stake in what it earns.',
    cost: 3,
    requires: { from: 'business', amount: 3 },
    effects: { economy: 1, emissions: -3, living: 2 },
    rationale:
      'Transmission and solar siting fail on land consent more often than on engineering.',
  },
  {
    id: 'r3-act-self',
    round: 3,
    role: 'activist',
    shape: 'self',
    title: 'Publish the water and power numbers',
    summary:
      'Put the real consumption figures where every voter in Johor can see them. Force the trade-off into the open.',
    cost: 1,
    income: 2,
    effects: { economy: 0, emissions: -1, living: -2 },
    rationale:
      'Disclosure of resource intensity is what turned Johor’s data centre boom into a public debate.',
  },
  {
    id: 'r3-act-collective',
    round: 3,
    role: 'activist',
    shape: 'collective',
    title: 'Draft the sustainability standard',
    summary:
      'Stop objecting and start specifying: a workable PUE and water standard the regulator could actually adopt.',
    cost: 3,
    effects: { economy: -3, emissions: -2, living: 1 },
    rationale:
      'Johor’s rejections show a screening standard is politically viable when it is technically specified.',
  },
  {
    id: 'r3-act-conditional',
    round: 3,
    role: 'activist',
    shape: 'conditional',
    title: 'Make the standard binding',
    summary:
      'Get your standard written into the approval conditions themselves, with government enforcing it as a permit term.',
    cost: 3,
    requires: { from: 'government', amount: 3 },
    effects: { economy: 0, emissions: -3, living: 0 },
    rationale:
      'A voluntary standard becomes an effective one at the moment it is attached to a licence.',
  },

  /* ============================ ROUND 4 — 2031 ============================ */
  {
    id: 'r4-gov-self',
    round: 4,
    role: 'government',
    shape: 'self',
    title: 'Extend the coal plants',
    summary:
      'Reliability first. Push the retirement schedule back five years and keep the tariff where people can pay it.',
    cost: 1,
    income: 3,
    effects: { economy: 2, emissions: 4, living: 1 },
    rationale:
      'Coal retirement schedules slip when replacement capacity is late and tariffs are politically sensitive.',
  },
  {
    id: 'r4-gov-collective',
    round: 4,
    role: 'government',
    shape: 'collective',
    title: 'Hold the retirement schedule',
    summary:
      'Seven gigawatts comes off on time. Accept the reserve margin risk and the tariff pass-through that follows.',
    cost: 4,
    effects: { economy: -2, emissions: -3, living: -1 },
    rationale:
      'Over half of Malaysia’s coal fleet — around 7 GW — is scheduled to retire between 2029 and 2033.',
  },
  {
    id: 'r4-gov-conditional',
    round: 4,
    role: 'government',
    shape: 'conditional',
    title: 'Retire coal, fund the workers',
    summary:
      'Close the plants on schedule with a funded just-transition package for every affected town, delivered through Community.',
    cost: 5,
    requires: { from: 'community', amount: 3 },
    effects: { economy: 1, emissions: -4, living: 1 },
    rationale:
      'Coal closures that fund redeployment hold politically; ones that do not get reversed by the next government.',
  },
  {
    id: 'r4-biz-self',
    round: 4,
    role: 'business',
    shape: 'self',
    title: 'Buy the cheapest available power',
    summary:
      'Whatever is on the grid is what you run on. Your competitors in Vietnam are not paying a green premium either.',
    cost: 0,
    income: 4,
    effects: { economy: 4, emissions: 5, living: -1 },
    rationale:
      'Industrial electricity cost is a first-order factor in Southeast Asian manufacturing competitiveness.',
  },
  {
    id: 'r4-biz-collective',
    round: 4,
    role: 'business',
    shape: 'collective',
    title: 'Build replacement capacity',
    summary:
      'Put your own money into the solar and storage that has to exist before the coal can come off.',
    cost: 4,
    effects: { economy: 0, emissions: -3, living: 0 },
    rationale:
      'Malaysia expects to add over 6.5 GW of solar between 2026 and 2029, most of it privately financed.',
  },
  {
    id: 'r4-biz-conditional',
    round: 4,
    role: 'business',
    shape: 'conditional',
    title: 'Firm the grid with storage',
    summary:
      'Deploy grid-scale batteries so the reserve margin survives the coal closures — if the regulator guarantees the return.',
    cost: 5,
    requires: { from: 'government', amount: 3 },
    effects: { economy: 2, emissions: -5, living: 2 },
    rationale:
      'Storage economics depend almost entirely on whether a capacity market or contract pays for availability.',
  },
  {
    id: 'r4-com-self',
    round: 4,
    role: 'community',
    shape: 'self',
    title: 'Defend the coal towns',
    summary:
      'These are thousands of jobs in places with no second industry. No closure without a plan you can name.',
    cost: 1,
    income: 2,
    effects: { economy: -1, emissions: 3, living: 3 },
    rationale:
      'Plant closures concentrate losses in single-employer towns while the benefits are diffuse and national.',
  },
  {
    id: 'r4-com-collective',
    round: 4,
    role: 'community',
    shape: 'collective',
    title: 'Accept closure, demand retraining',
    summary:
      'Agree the plants come off — and hold everyone to a retraining guarantee with a name and a date attached.',
    cost: 3,
    effects: { economy: -1, emissions: -2, living: 1 },
    rationale:
      'Just transition frameworks work when the retraining commitment is specific and funded up front.',
  },
  {
    id: 'r4-com-conditional',
    round: 4,
    role: 'community',
    shape: 'conditional',
    title: 'Run the transition yourselves',
    summary:
      'Take the just-transition money and administer it locally — placement, training, small business credit — if industry funds it.',
    cost: 3,
    requires: { from: 'business', amount: 3 },
    effects: { economy: 0, emissions: -4, living: 2 },
    rationale:
      'Locally administered transition funds reach affected workers faster than centrally run schemes.',
  },
  {
    id: 'r4-act-self',
    round: 4,
    role: 'activist',
    shape: 'self',
    title: 'Litigate the delay',
    summary:
      'Take the extension to court as a breach of the government’s own stated NDC commitment.',
    cost: 2,
    income: 1,
    effects: { economy: -2, emissions: -1, living: 0 },
    rationale:
      'Climate litigation against retirement delays has become a standard tactic where a national target is on the record.',
  },
  {
    id: 'r4-act-collective',
    round: 4,
    role: 'activist',
    shape: 'collective',
    title: 'Campaign for the peaking promise',
    summary:
      'Make 2030 mean something. Hold the government to the peaking window it filed with the UN.',
    cost: 3,
    effects: { economy: -3, emissions: -3, living: -1 },
    rationale:
      'NDC 3.0 commits Malaysia to peaking emissions between 2029 and 2034, with 2030 as the stated goal.',
  },
  {
    id: 'r4-act-conditional',
    round: 4,
    role: 'activist',
    shape: 'conditional',
    title: 'Stand with the coal towns',
    summary:
      'Campaign for closure and for the workers in the same breath, arm in arm with Community. Nobody expects it.',
    cost: 3,
    requires: { from: 'community', amount: 3 },
    effects: { economy: -1, emissions: -4, living: 0 },
    rationale:
      'Labour–environment alliances are the historical precondition for coal phase-outs that actually hold.',
  },

  /* ============================ ROUND 5 — 2034 ============================ */
  {
    id: 'r5-gov-self',
    round: 5,
    role: 'government',
    shape: 'self',
    title: 'Blame the neighbours',
    summary:
      'The fires are across the border. Issue the démarche, distribute the masks, and wait for the wind to change.',
    cost: 0,
    income: 2,
    effects: { economy: 2, emissions: 4, living: -4 },
    rationale:
      'Transboundary attribution has repeatedly substituted for domestic land-use enforcement during haze episodes.',
  },
  {
    id: 'r5-gov-collective',
    round: 5,
    role: 'government',
    shape: 'collective',
    title: 'Fund traceability for smallholders',
    summary:
      'Pay for the mapping and certification 400,000 smallholders cannot afford, so their oil still reaches Europe.',
    cost: 4,
    effects: { economy: 0, emissions: -4, living: 1 },
    rationale:
      'EUDR requires plantation-level traceability to prove no deforestation after 2020 — the cost falls hardest on smallholders.',
  },
  {
    id: 'r5-gov-conditional',
    round: 5,
    role: 'government',
    shape: 'conditional',
    title: 'Lead the ASEAN haze fund',
    summary:
      'Put real money into a regional fire-prevention facility and bring the region with you, with activists supplying the monitoring.',
    cost: 5,
    requires: { from: 'activist', amount: 3 },
    effects: { economy: 2, emissions: -5, living: 2 },
    rationale:
      'Malaysia has proposed a sustainable haze fund and science diplomacy under the ASEAN Agreement on Transboundary Haze Pollution.',
  },
  {
    id: 'r5-biz-self',
    round: 5,
    role: 'business',
    shape: 'self',
    title: 'Redirect to India and China',
    summary:
      'If Europe wants paperwork, sell elsewhere. The volume clears at a discount and nobody asks for a polygon map.',
    cost: 1,
    income: 4,
    effects: { economy: 4, emissions: 5, living: -2 },
    rationale:
      'Malaysian EU-bound palm volumes fell around 12% in 2025 as uncertified exporters redirected to India and China.',
  },
  {
    id: 'r5-biz-collective',
    round: 5,
    role: 'business',
    shape: 'collective',
    title: 'Certify the whole supply chain',
    summary:
      'Trace every tonne to the plantation. Expensive, slow, and it earns a premium once it is done.',
    cost: 4,
    income: 2,
    effects: { economy: 2, emissions: -4, living: 2 },
    rationale:
      'EUDR-compliant palm oil trades at a USD150–220 per tonne premium, with certified exporters holding EU access.',
  },
  {
    id: 'r5-biz-conditional',
    round: 5,
    role: 'business',
    shape: 'conditional',
    title: 'Bring the smallholders with you',
    summary:
      'Extend your certification system down to every supplier in your chain, funded jointly with the community.',
    cost: 5,
    income: 2,
    requires: { from: 'community', amount: 3 },
    effects: { economy: 3, emissions: -6, living: 3 },
    rationale:
      'Inclusive certification keeps smallholders in the export chain instead of pushing them into unregulated markets.',
  },
  {
    id: 'r5-com-self',
    round: 5,
    role: 'community',
    shape: 'self',
    title: 'Demand emergency relief',
    summary:
      'Air purifiers in every school, clinics open late, and compensation for anyone who cannot work outdoors.',
    cost: 2,
    effects: { economy: -1, emissions: 3, living: 2 },
    rationale:
      'Haze episodes drive measurable spikes in respiratory admissions and lost outdoor working days.',
  },
  {
    id: 'r5-com-collective',
    round: 5,
    role: 'community',
    shape: 'collective',
    title: 'Organise the smallholders',
    summary:
      'Get 400,000 small farms into cooperatives that can share the cost of certification none of them can carry alone.',
    cost: 3,
    effects: { economy: 1, emissions: -3, living: 3 },
    rationale:
      'Cooperative aggregation is the only realistic route to plantation-level traceability at smallholder scale.',
  },
  {
    id: 'r5-com-conditional',
    round: 5,
    role: 'community',
    shape: 'conditional',
    title: 'No-burn pact, enforced locally',
    summary:
      'Every village signs a no-burn agreement and polices it — in exchange for the equipment that makes clearing possible without fire.',
    cost: 3,
    requires: { from: 'government', amount: 3 },
    effects: { economy: 1, emissions: -5, living: 3 },
    rationale:
      'Fire prevention succeeds where communities have both an enforcement stake and a viable alternative to burning.',
  },
  {
    id: 'r5-act-self',
    round: 5,
    role: 'activist',
    shape: 'self',
    title: 'Map the burning concessions',
    summary:
      'Satellite data, hotspot by hotspot, matched to concession boundaries and company names. Publish all of it.',
    cost: 2,
    income: 2,
    effects: { economy: -2, emissions: -1, living: -1 },
    rationale:
      'ASEAN hotspot monitoring made concession-level attribution possible; publication is what creates consequences.',
  },
  {
    id: 'r5-act-collective',
    round: 5,
    role: 'activist',
    shape: 'collective',
    title: 'Defend the smallholders in Brussels',
    summary:
      'Argue in Europe that a rule which excludes small farms punishes the wrong people and drives worse land use.',
    cost: 3,
    effects: { economy: -1, emissions: -4, living: 1 },
    rationale:
      'EUDR compliance burdens fall disproportionately on smallholders who did not drive industrial deforestation.',
  },
  {
    id: 'r5-act-conditional',
    round: 5,
    role: 'activist',
    shape: 'conditional',
    title: 'Turn the maps into enforcement',
    summary:
      'Hand your monitoring to the regulator and let it become the evidence base for prosecution, not just a headline.',
    cost: 3,
    requires: { from: 'government', amount: 3 },
    effects: { economy: 0, emissions: -5, living: 1 },
    rationale:
      'Independent monitoring changes outcomes when it is admissible to an agency with the power to act on it.',
  },

  /* ============================ ROUND 6 — 2038 ============================ */
  {
    id: 'r6-gov-self',
    round: 6,
    role: 'government',
    shape: 'self',
    title: 'Draw down the reserves',
    summary:
      'Take a larger dividend from the national oil company and defer the structural question one more budget cycle.',
    cost: 0,
    income: 4,
    effects: { economy: 3, emissions: 4, living: 1 },
    rationale:
      'Higher dividend draws have historically closed fiscal gaps at the cost of the company’s own transition capital.',
  },
  {
    id: 'r6-gov-collective',
    round: 6,
    role: 'government',
    shape: 'collective',
    title: 'Broaden the tax base',
    summary:
      'Replace petroleum revenue properly — consumption tax, capital gains, carbon. Unpopular, durable, and overdue.',
    cost: 3,
    income: 5,
    effects: { economy: -1, emissions: -4, living: -1 },
    rationale:
      'Petroleum revenue fell from 41.3% of federal revenue in 2009 to 17.5% by 2025, largely through non-petroleum tax measures.',
  },
  {
    id: 'r6-gov-conditional',
    round: 6,
    role: 'government',
    shape: 'conditional',
    title: 'Redirect the oil company',
    summary:
      'Turn the national energy champion into a transition investor — hydrogen, CCS, offshore wind — with industry co-underwriting.',
    cost: 5,
    income: 3,
    requires: { from: 'business', amount: 3 },
    effects: { economy: 2, emissions: -5, living: 1 },
    rationale:
      'National oil companies hold the offshore engineering capability that carbon storage and offshore wind both require.',
  },
  {
    id: 'r6-biz-self',
    round: 6,
    role: 'business',
    shape: 'self',
    title: 'Sweat the existing assets',
    summary:
      'Squeeze the last decade of production out of what is already drilled. Nothing new, nothing written down.',
    cost: 1,
    income: 5,
    effects: { economy: 5, emissions: 5, living: -1 },
    rationale:
      'Late-life field economics favour maximising recovery over the write-downs an early exit would force.',
  },
  {
    id: 'r6-biz-collective',
    round: 6,
    role: 'business',
    shape: 'collective',
    title: 'Reinvest into clean industry',
    summary:
      'Move the cash flow from hydrocarbons into the industries that replace them, and accept the lower near-term return.',
    cost: 4,
    effects: { economy: 1, emissions: -4, living: 0 },
    rationale:
      'Redeploying fossil cash flow is the largest single lever available to a petroleum-linked private sector.',
  },
  {
    id: 'r6-biz-conditional',
    round: 6,
    role: 'business',
    shape: 'conditional',
    title: 'Build the CCS hub',
    summary:
      'Turn depleted offshore fields into regional carbon storage and sell the service — if the state carries the liability tail.',
    cost: 5,
    income: 3,
    requires: { from: 'government', amount: 3 },
    effects: { economy: 3, emissions: -6, living: 2 },
    rationale:
      'Depleted Malaysian offshore reservoirs are a credible regional storage resource; long-term liability is the blocker.',
  },
  {
    id: 'r6-com-self',
    round: 6,
    role: 'community',
    shape: 'self',
    title: 'Refuse new taxes',
    summary:
      'Wages have not moved in a decade. The gap in the budget was not made by households and should not be closed by them.',
    cost: 1,
    income: 2,
    effects: { economy: 0, emissions: 3, living: 3 },
    rationale:
      'Consumption taxes are regressive without offsetting transfers, which is why they are politically fragile.',
  },
  {
    id: 'r6-com-collective',
    round: 6,
    role: 'community',
    shape: 'collective',
    title: 'Accept the tax, protect the bottom',
    summary:
      'Support a broader tax base on the condition that the B40 is fully compensated and it is written into the act.',
    cost: 3,
    effects: { economy: 0, emissions: -3, living: 1 },
    rationale:
      'Compensated consumption taxes have proven durable where the offset is statutory rather than discretionary.',
  },
  {
    id: 'r6-com-conditional',
    round: 6,
    role: 'community',
    shape: 'conditional',
    title: 'Retrain the oil towns',
    summary:
      'Terengganu and Sabah built their economies on this industry. Move those workers into the next one, with industry paying.',
    cost: 3,
    requires: { from: 'business', amount: 3 },
    effects: { economy: 1, emissions: -5, living: 2 },
    rationale:
      'Petroleum employment is geographically concentrated, so the transition risk is regional rather than national.',
  },
  {
    id: 'r6-act-self',
    round: 6,
    role: 'activist',
    shape: 'self',
    title: 'Expose the stranded assets',
    summary:
      'Put the write-down risk on the record and force the market to price what everyone already knows.',
    cost: 2,
    income: 2,
    effects: { economy: -1, emissions: -1, living: 0 },
    rationale:
      'Stranded asset disclosure shifts capital allocation faster than regulation in listed markets.',
  },
  {
    id: 'r6-act-collective',
    round: 6,
    role: 'activist',
    shape: 'collective',
    title: 'Campaign for the tax shift',
    summary:
      'Argue publicly for taxing carbon and capital instead of payrolls. Alienate almost everybody.',
    cost: 3,
    effects: { economy: -2, emissions: -4, living: -1 },
    rationale:
      'Shifting the tax base from labour to carbon is well supported in theory and rarely popular in practice.',
  },
  {
    id: 'r6-act-conditional',
    round: 6,
    role: 'activist',
    shape: 'conditional',
    title: 'Audit the transition',
    summary:
      'Become the independent verifier of every ringgit the state claims it moved from fossil to clean, with a legal mandate.',
    cost: 3,
    requires: { from: 'government', amount: 3 },
    effects: { economy: 0, emissions: -5, living: 0 },
    rationale:
      'Independent verification is what separates a transition plan from a rebranding of existing spending.',
  },

  /* ============================ ROUND 7 — 2043 ============================ */
  {
    id: 'r7-gov-self',
    round: 7,
    role: 'government',
    shape: 'self',
    title: 'Emergency relief, paid from the transition',
    summary:
      'People are on rooftops. Take the money from wherever it is sitting, and the climate budget is sitting right there.',
    cost: 2,
    effects: { economy: 1, emissions: 4, living: 5 },
    rationale:
      'Disaster response reliably crowds out mitigation spending because the need is immediate and visible.',
  },
  {
    id: 'r7-gov-collective',
    round: 7,
    role: 'government',
    shape: 'collective',
    title: 'Fund adaptation as new money',
    summary:
      'Borrow for the sea walls and the drainage rather than raiding decarbonisation. The debt is real and so is the flood.',
    cost: 5,
    effects: { economy: -2, emissions: -5, living: 1 },
    rationale:
      'The World Bank puts Malaysia’s disaster resilience needs at USD32.6bn, separate from mitigation investment.',
  },
  {
    id: 'r7-gov-conditional',
    round: 7,
    role: 'government',
    shape: 'conditional',
    title: 'Build back to a climate standard',
    summary:
      'Rebuild everything to a 2050 flood projection, not a 1990 one, with industry delivering at cost.',
    cost: 5,
    requires: { from: 'business', amount: 3 },
    effects: { economy: 1, emissions: -6, living: 3 },
    rationale:
      'Proactive adaptation could offset up to half of projected losses; reconstruction is the cheapest moment to upgrade a standard.',
  },
  {
    id: 'r7-biz-self',
    round: 7,
    role: 'business',
    shape: 'self',
    title: 'Claim, rebuild, carry on',
    summary:
      'Insurance covers the plant. Rebuild it exactly as it was, in exactly the same place, and reopen by the quarter’s end.',
    cost: 2,
    income: 3,
    effects: { economy: 3, emissions: 6, living: 0 },
    rationale:
      'Like-for-like reconstruction is the fastest route back to production and locks in the same exposure.',
  },
  {
    id: 'r7-biz-collective',
    round: 7,
    role: 'business',
    shape: 'collective',
    title: 'Relocate and harden',
    summary:
      'Move the vulnerable sites, raise the rest, and design the supply chain for a country that floods more often.',
    cost: 4,
    effects: { economy: 0, emissions: -5, living: 2 },
    rationale:
      'Repeat flooding of the same industrial areas is now a modelled certainty rather than a tail risk.',
  },
  {
    id: 'r7-biz-conditional',
    round: 7,
    role: 'business',
    shape: 'conditional',
    title: 'Underwrite the resilience bond',
    summary:
      'Finance national adaptation through a bond you buy and the public guarantees. Returns tied to avoided losses.',
    cost: 5,
    income: 3,
    requires: { from: 'government', amount: 3 },
    effects: { economy: 2, emissions: -7, living: 4 },
    rationale:
      'Resilience bonds mobilise private capital for adaptation, which grant funding has never covered at scale.',
  },
  {
    id: 'r7-com-self',
    round: 7,
    role: 'community',
    shape: 'self',
    title: 'Demand compensation now',
    summary:
      'Cash, this month, to every displaced household. Arguments about drainage master plans can wait.',
    cost: 2,
    effects: { economy: -2, emissions: 4, living: 4 },
    rationale:
      'Immediate transfers are the most effective short-term response and do nothing about the next flood.',
  },
  {
    id: 'r7-com-collective',
    round: 7,
    role: 'community',
    shape: 'collective',
    title: 'Accept managed retreat',
    summary:
      'Agree to move the most exposed settlements. It is the right answer and it costs people their kampung.',
    cost: 4,
    effects: { economy: -1, emissions: -4, living: 3 },
    rationale:
      'Managed retreat is the most effective and least popular adaptation measure available to any government.',
  },
  {
    id: 'r7-com-conditional',
    round: 7,
    role: 'community',
    shape: 'conditional',
    title: 'Community flood defence corps',
    summary:
      'Local early warning, maintained drains, trained volunteers in every district — if the state funds and trains them.',
    cost: 3,
    requires: { from: 'government', amount: 3 },
    effects: { economy: 0, emissions: -6, living: 4 },
    rationale:
      'Community-based early warning measurably reduces flood casualties at a fraction of the cost of hard infrastructure.',
  },
  {
    id: 'r7-act-self',
    round: 7,
    role: 'activist',
    shape: 'self',
    title: 'Make it a loss and damage case',
    summary:
      'Take Malaysia’s claim to the international stage and argue somebody else should be paying for this.',
    cost: 2,
    income: 2,
    effects: { economy: -3, emissions: 0, living: 1 },
    rationale:
      'Loss and damage finance is real but slow, and the argument can substitute for domestic action.',
  },
  {
    id: 'r7-act-collective',
    round: 7,
    role: 'activist',
    shape: 'collective',
    title: 'Refuse the raid on mitigation',
    summary:
      'Fight the transfer of decarbonisation money into relief, knowing exactly how that will look on television.',
    cost: 4,
    effects: { economy: -3, emissions: -5, living: -2 },
    rationale:
      'Every mitigation ringgit moved to relief raises the probability of the next disaster it will have to pay for.',
  },
  {
    id: 'r7-act-conditional',
    round: 7,
    role: 'activist',
    shape: 'conditional',
    title: 'Adaptation and mitigation together',
    summary:
      'Campaign for both to be funded as one programme, with Community carrying the case in the flooded districts.',
    cost: 3,
    requires: { from: 'community', amount: 3 },
    effects: { economy: -1, emissions: -6, living: 2 },
    rationale:
      'Framing adaptation and mitigation as a single budget line is what stops them cannibalising each other.',
  },

  /* ============================ ROUND 8 — 2048 ============================ */
  {
    id: 'r8-gov-self',
    round: 8,
    role: 'government',
    shape: 'self',
    title: 'Buy offsets and declare victory',
    summary:
      'Purchase the remaining tonnes on the international market. Net zero on paper, in time for the announcement.',
    cost: 3,
    effects: { economy: 1, emissions: -3, living: 0 },
    rationale:
      'Offset-heavy net zero claims are cheaper and faster, and are widely challenged on additionality grounds.',
  },
  {
    id: 'r8-gov-collective',
    round: 8,
    role: 'government',
    shape: 'collective',
    title: 'Commission the nuclear plant',
    summary:
      'Take the decision that has been deferred for forty years. Firm, clean, expensive, and nobody wants it in their state.',
    cost: 5,
    effects: { economy: 0, emissions: -6, living: 0 },
    rationale:
      'Nuclear was formally reintroduced in the 13th Malaysia Plan after Cabinet endorsement in November 2024.',
  },
  {
    id: 'r8-gov-conditional',
    round: 8,
    role: 'government',
    shape: 'conditional',
    title: 'Close the last mile properly',
    summary:
      'Nuclear, storage, industrial heat and land sinks as one programme, with public consent secured first.',
    cost: 6,
    requires: { from: 'community', amount: 3 },
    effects: { economy: 2, emissions: -7, living: 1 },
    rationale:
      'The residual after renewables is firm power, industrial heat and land use — no single technology closes it.',
  },
  {
    id: 'r8-biz-self',
    round: 8,
    role: 'business',
    shape: 'self',
    title: 'Relocate the hard-to-abate',
    summary:
      'Move the cement and steel offshore. Malaysia’s inventory improves and the atmosphere never notices.',
    cost: 2,
    income: 4,
    effects: { economy: 3, emissions: -2, living: -3 },
    rationale:
      'Carbon leakage moves the emissions rather than removing them, which is precisely what CBAM exists to penalise.',
  },
  {
    id: 'r8-biz-collective',
    round: 8,
    role: 'business',
    shape: 'collective',
    title: 'Decarbonise cement and steel here',
    summary:
      'Electrify what can be electrified, capture the rest, and keep the industry and its jobs in the country.',
    cost: 5,
    effects: { economy: 2, emissions: -6, living: 1 },
    rationale:
      'Process emissions from cement and steel require capture rather than fuel switching, making them the true last mile.',
  },
  {
    id: 'r8-biz-conditional',
    round: 8,
    role: 'business',
    shape: 'conditional',
    title: 'Export the solution',
    summary:
      'Make Malaysia the regional supplier of clean industrial materials and carbon storage — with the state opening the markets.',
    cost: 6,
    income: 4,
    requires: { from: 'government', amount: 3 },
    effects: { economy: 3, emissions: -8, living: 2 },
    rationale:
      'First movers in clean materials capture the premium as neighbouring carbon border rules take effect.',
  },
  {
    id: 'r8-com-self',
    round: 8,
    role: 'community',
    shape: 'self',
    title: 'Not in our state',
    summary:
      'No reactor, no storage well, no capture plant near anyone’s home. Find another way, somewhere else.',
    cost: 2,
    income: 2,
    effects: { economy: -3, emissions: 4, living: 2 },
    rationale:
      'Siting consent is the binding constraint on nuclear and carbon storage almost everywhere they are proposed.',
  },
  {
    id: 'r8-com-collective',
    round: 8,
    role: 'community',
    shape: 'collective',
    title: 'Host it, on your terms',
    summary:
      'Accept the infrastructure with independent monitoring, local ownership and a permanent revenue share.',
    cost: 3,
    effects: { economy: 1, emissions: -5, living: 2 },
    rationale:
      'Communities that hold a monitoring role and an ownership stake accept infrastructure others refuse.',
  },
  {
    id: 'r8-com-conditional',
    round: 8,
    role: 'community',
    shape: 'conditional',
    title: 'Restore the forests and peat',
    summary:
      'Put degraded peatland and forest back into a working sink, managed by the people who live in it, funded by industry.',
    cost: 3,
    requires: { from: 'business', amount: 3 },
    effects: { economy: 1, emissions: -7, living: 2 },
    rationale:
      'Peatland rewetting is among the highest-value land-based mitigation available in Malaysia and depends on local management.',
  },
  {
    id: 'r8-act-self',
    round: 8,
    role: 'activist',
    shape: 'self',
    title: 'Reject the offsets',
    summary:
      'Refuse the paper solution and say so loudly, even at the cost of the headline number the country wants.',
    cost: 2,
    effects: { economy: -3, emissions: 0, living: -1 },
    rationale:
      'Offset integrity challenges have repeatedly forced governments back to physical abatement.',
  },
  {
    id: 'r8-act-collective',
    round: 8,
    role: 'activist',
    shape: 'collective',
    title: 'Verify the final inventory',
    summary:
      'Audit the last tonne. If Malaysia says net zero in 2050, make sure the number survives independent scrutiny.',
    cost: 4,
    effects: { economy: -1, emissions: -6, living: 0 },
    rationale:
      'A net zero claim is worth what its verification is worth, and nothing more.',
  },
  {
    id: 'r8-act-conditional',
    round: 8,
    role: 'activist',
    shape: 'conditional',
    title: 'Certify it to the world',
    summary:
      'Turn independent verification into a national export credential, backed by the industry it audits.',
    cost: 4,
    requires: { from: 'business', amount: 3 },
    effects: { economy: 0, emissions: -7, living: 0 },
    rationale:
      'Credible verification is what converts decarbonisation into market access under carbon border regimes.',
  },
]

const BY_ID = new Map(ACTIONS.map((a) => [a.id, a]))

export function actionById(id: string): Action {
  const a = BY_ID.get(id)
  if (!a) throw new Error(`Unknown action: ${id}`)
  return a
}

export function actionsFor(round: number, role: string): Action[] {
  return ACTIONS.filter((a) => a.round === round && a.role === role)
}
