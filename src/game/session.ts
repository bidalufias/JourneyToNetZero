/**
 * Session types: the room around the engine.
 *
 * The engine knows about a country. This module knows about four people in a
 * room with phones, a countdown, and a shared screen. Everything here is owned
 * by the server; clients render whatever view they are handed and nothing else.
 */
import type { GameState, PublicState, Role, RoundLog, TrustRole } from '../engine/types'
import type { Impact } from './impact'

export type Phase =
  | 'lobby'
  | 'briefing'
  | 'crisis'
  | 'table'
  | 'choice'
  | 'reckoning'
  | 'summary'
  | 'results'
  | 'ended'

/**
 * Phase lengths in milliseconds. The published session is thirty-five minutes:
 * setup and onboarding, six rounds of play, then the results and the debrief.
 * It used to be advertised as thirty and run closer to thirty-seven, and a
 * workshop that overruns by seven minutes is a workshop that gets cut short.
 */
export const PHASE_MS: Record<Phase, number> = {
  lobby: 0, // ends when the facilitator starts
  briefing: 20_000,
  crisis: 30_000,
  table: 90_000,
  choice: 45_000,
  reckoning: 75_000,
  summary: 8_000,
  results: 0, // advances on facilitator input
  ended: 0,
}

/** The Reckoning flips one card at a time, ~3s apart. Never all four at once. */
export const RECKONING_CARD_GAP_MS = 3_000
export const RECKONING_FIRST_CARD_MS = 600
export const COALITION_HOLD_MS = 4_000
export const PROMISE_STING_MS = 2_500

export interface Player {
  role: Role
  name: string
  connected: boolean
  /** Set once during setup, never revealed until the endgame. */
  goalId: string | null
  /**
   * The card the player has tapped, or null while still thinking. Selecting is
   * not committing: a selection can be changed right up until `locked`.
   */
  choiceId: string | null
  /** Committed. Nothing changes a choice after this. */
  locked: boolean
  /** True when the timer committed the choice rather than the player. */
  autoLocked: boolean
  /** True when the timer also had to *pick* it, because nothing was selected. */
  defaulted: boolean
  /** Order in which players locked, for the "last one" callout. */
  lockedAt: number | null
}

/**
 * A public pledge. Recorded and displayed, never enforced. The first time
 * somebody breaks one, the room changes, and that moment is the training.
 */
export interface Promise_ {
  id: string
  round: number
  from: Role
  /** The pledge text, composed from preset phrasings so it always reads well. */
  text: string
  kind: 'promise' | 'demand'
  /** Option the pledge commits to, when the phrasing names one. */
  optionId: string | null
  /** Resolved at the Reckoning: did they do what they said? */
  outcome: 'kept' | 'broken' | 'unresolved'
}

/** A resource transfer. Executes immediately on acceptance and is permanent. */
export interface Offer {
  id: string
  round: number
  from: Role
  to: Role
  resource: 'fiscal' | 'capital'
  amount: number
  status: 'pending' | 'accepted' | 'declined' | 'expired'
}

export type TipKind = 'forecast' | 'dossier' | 'memo' | 'rumour'

export interface InsiderTip {
  id: string
  round: number
  /** Exactly one player per round. Never shown on the dashboard. */
  to: Role
  kind: TipKind
  reliability: 'CONFIRMED' | 'UNVERIFIED'
  source: string
  text: string
  /**
   * Whether the tip is actually true. Rolled server-side at deal time for
   * UNVERIFIED cards and never sent to any client until the holder publishes.
   */
  isTrue: boolean
  published: boolean
  /** Set at the end of the round, for published tips only. */
  revealed: boolean
}

export interface Room {
  code: string
  createdAt: number

  phase: Phase
  /** Server clock deadline for the current phase, or null if it does not tick. */
  phaseEndsAt: number | null
  /**
   * When the facilitator stopped the clock, or null while it runs.
   *
   * A paused room is frozen rather than rewound: the deadline it was heading
   * for is kept as it was and pushed forward by however long the pause lasted,
   * so a table that stops for two minutes gets back exactly the seconds it had
   * left. It is also the room's clock while it is set, and every phase change made
   * during a pause is timed from this instant, so stepping through phases with
   * the Next button hands each one its full length once the room restarts.
   */
  pausedAt: number | null

  players: Record<Role, Player>
  game: GameState

  promises: Promise_[]
  offers: Offer[]
  tips: InsiderTip[]

  /** Community's Public Mandate target for the current round. */
  vetoTarget: Role | null
  /** Whether the Government agreed to co-fund the Business's Partner option. */
  coFund: boolean
  /** The Activist has called a Spotlight this round. */
  spotlightCalled: boolean

  /** Populated at the Reckoning and read by both surfaces. */
  lastRound: RoundLog | null
  history: RoundLog[]

  /** Roles that have already received a tip, for the rotation rule. */
  tipRotation: Role[]

  /** Deterministic seed so a room replays identically for debugging. */
  seed: number
  rngCursor: number
}

/** What the dashboard renders. Public by definition: the whole room sees it. */
export interface DashboardView {
  code: string
  phase: Phase
  phaseEndsAt: number | null
  /** The facilitator has stopped the clock. Nothing moves until they restart it. */
  paused: boolean
  /**
   * The instant it stopped, on the server's clock, or null while it runs.
   *
   * Countdowns read this rather than `Date.now()` while it is set, which is
   * what makes a paused clock hold still on every surface at once.
   */
  pausedAt: number | null
  round: number
  scenario: {
    id: string
    title: string
    type: string
    situation: string
  } | null
  state: PublicState
  seats: {
    role: Role
    name: string | null
    connected: boolean
    locked: boolean
    /** True for the one player everybody is waiting on. */
    lastToLock: boolean
  }[]
  promises: Promise_[]
  offersInFlight: Offer[]
  /** Announced, but never who received it. */
  tipDealtThisRound: boolean
  publishedTip: { from: Role; text: string; source: string; verdict: 'true' | 'false' | null } | null
  /** Target is null until the choices resolve. The engine derives it. */
  spotlight: { by: Role; target: Role | null; remaining: number } | null
  veto: { target: Role; removed: string[]; remaining: number } | null
  lastRound: RoundLog | null
  history: RoundLog[]
  headlines: string[]
  targets: { emissions: number; growth: number; happiness: number }
}

/**
 * What one phone renders.
 *
 * Deliberately narrow: option cards carry a title, one line, a cost chip and a
 * plain-English trade-off hint. No raw numbers ever cross this boundary, so a
 * player cannot inspect the maths behind an option even with devtools open.
 */
export interface PhoneView {
  code: string
  role: Role
  name: string
  phase: Phase
  phaseEndsAt: number | null
  /**
   * The facilitator has stopped the clock. The phone freezes its countdown and
   * says so, because a timer draining during a pause is the one thing that
   * would make a player choose in a hurry for no reason.
   */
  paused: boolean
  pausedAt: number | null
  round: number
  scenario: { id: string; title: string; situation: string; type: string } | null
  /** The one line written for this role, not the shared news copy. */
  privateLine: string | null
  options: PhoneOption[]
  /** The card tapped but not yet committed. Changeable until `locked`. */
  choiceId: string | null
  /** Committed. The choice screen goes read-only and the phone steps back. */
  locked: boolean
  /** Your own resource, and only yours. */
  resource: { kind: 'fiscal' | 'capital' | 'vetoes' | 'spotlights'; value: number; label: string }
  trust: Record<TrustRole, number>
  vetoesRemaining: number
  spotlightsRemaining: number
  /** Declared this round: the Activist's only confirmation that it landed. */
  spotlightCalled: boolean
  /** The Government has agreed to co-fund the Business's partnership option. */
  coFund: boolean
  goalId: string | null
  /** Your own sealed goal, so the phone can remind you what you are chasing. */
  goalTitle: string | null
  goalDesc: string | null
  goalChoices: { id: string; title: string; desc: string }[] | null
  tip: InsiderTip | null
  promises: Promise_[]
  incomingOffers: Offer[]
  sentOffers: Offer[]
  seats: { role: Role; name: string | null; connected: boolean; locked: boolean }[]
  /** The three national targets and where the country stands, for the header. */
  nation: {
    carbon: number
    economy: number
    life: number
    clean: number
    targets: { carbon: number; economy: number; life: number }
  }
  /** Written in plain language, no numbers: the phone's only interpretation. */
  roundResult: { didWhat: string; cost: string; others: string } | null
  waitingOn: number
}

export const ROLE_LABEL: Record<Role, string> = {
  government: 'Government',
  business: 'Business',
  community: 'Community',
  activist: 'Activist',
}

/**
 * The four seats, as archetypes rather than people.
 *
 * Nobody here has a name. The player types their own when they take the chair,
 * and a second name printed beside it only competes with it: a table spends the
 * session calling each other Minister and Tycoon anyway, never the invented
 * names they were given. So the seat carries a job, and the person in it is
 * whoever sat down.
 *
 * `title` omits its article, because the places it appears want different ones:
 * a sentence needs "the Honourable Minister" and a seat list wants none at all.
 *
 * Nothing here is gendered. The archetype is played by whoever takes it.
 */
export interface RoleCharacter {
  /** The archetype, without its article. */
  title: string
  org: string
  post: string
  /** One line, for the places that only have room for one. */
  blurb: string

  /* The three lines. Everything a player needs to open their mouth in Round 1. */
  youAre: string
  youWant: string
  yourMove: string

  /* The full profile, behind a tap. Nobody has to read this to play. */
  whoYouAre: string
  believe: string
  afraidOf: string
  /** What this seat actually does with the one thing it holds. */
  resourcePower: string
  /** Three things this character would say at the table. */
  says: string[]
  /** And the one they never would. */
  neverSay: string
}

/**
 * The role screen used to stack nine labelled sections and about 450 words, in
 * front of a player who had ninety seconds and had never seen the game. Now the
 * first three lines are the whole brief and the rest is optional.
 *
 * Nothing here is gendered. The archetype is played by whoever takes it.
 */
export const ROLE_CHARACTER: Record<Role, RoleCharacter> = {
  government: {
    title: 'Minister',
    org: 'Ministry of Energy and Climate',
    post: 'Minister for Energy and Climate',
    blurb: 'You hold the country\u2019s money and the power to make law.',
    youAre: 'The Minister. You hold the national Budget and the power to make law.',
    youWant: 'Growth, and to still be in office in 2050.',
    yourMove: 'Spend Budget to change the country. Or give Budget away so someone else can act.',
    whoYouAre:
      'Twenty-four years in the civil service, then politics. Half your voters work on plantations. The other half commute into the city.',
    believe:
      'The change has to happen, and you are the only one who can pay for it. But a government that loses an election changes nothing.',
    afraidOf: 'Being the minister who made petrol expensive.',
    resourcePower:
      'You start with 4 Budget. From Round 2 you get 2 more each round, and 1 extra when the economy is strong, up to 8. Big moves cost 2 or 3, so it often pays to save a round and then spend properly. You can also give Budget to another player, or pay half of a Business partnership so it works at full strength instead of half.',
    says: [
      'I can fund that. What do I tell the people who voted for me?',
      'Give me a public reason to spend this and I will spend it.',
      'If I do that I lose the seat, and then none of this happens.',
    ],
    neverSay: 'Money is no object.',
  },
  business: {
    title: 'Company Boss',
    org: 'Sawit Prima Group',
    post: 'Group CEO, Sawit Prima',
    blurb: 'You own most of the pollution. You also own most of the jobs.',
    youAre: 'The Company Boss. You own most of the country\u2019s pollution, and most of its jobs.',
    youWant: 'Profit, and not to bet the company on the wrong decade.',
    yourMove: 'Spend Company Money to go clean. Or get someone else to pay half.',
    whoYouAre:
      'Third generation. You took over at 41. Forty thousand staff. You have read every big climate report and can quote them.',
    believe:
      'You will go clean when it is cheaper than staying dirty, or when someone makes staying dirty expensive. You think that is honest, not villainous.',
    afraidOf: 'Being the boss who moved early and got it wrong.',
    resourcePower:
      'You start with 5 Company Money and gain 1 each round, 2 when the economy is booming, up to 12. Going clean costs 3 and hurts, but it is the biggest single cut on the table and it earns you Public Trust. Partnerships cost only 1, but they work only if the Government pays too, so agree that during the talk. Sitting on your money keeps you safe, and is also how the country misses.',
    says: [
      'I will do it, if the Government shares the cost.',
      'That is a ten-year investment and I am judged every quarter.',
      'You want me to cut thirty percent? Fine. Who pays for the retraining?',
    ],
    neverSay: 'Profit does not matter here.',
  },
  community: {
    title: 'Community Leader',
    org: 'Kampung Baru Jernih residents',
    post: 'Food stall owner, head of the residents\u2019 association',
    blurb: '34 million people who want clean air, a job, and petrol they can afford.',
    youAre: 'The Community Leader. You speak for 34 million people.',
    youWant: 'Clean air and prices people can afford. You are tired of being told to pick one.',
    yourMove: 'Make them earn your support out loud. Twice a game you can say no and mean it.',
    whoYouAre:
      'You run a food stall and head the residents\u2019 association. Your stall has flooded three times in eight years. Your child has asthma.',
    believe:
      'Clean air and affordable petrol are both reasonable things to want. You have heard a lot of promises and you remember all of them.',
    afraidOf: 'Being asked to sacrifice again by people who will not have to.',
    resourcePower:
      'You hold no money and no laws. You hold two vetoes for the whole game. Each one takes a player\u2019s dirtiest cards away for a single round, and everyone is told it was you. Public Trust is handed out every round too, one for whoever looked after people best and one for whoever did most for the future. You do not choose who gets it. It goes to whoever earned it, so your job is to make them earn it in front of you.',
    says: [
      'Explain that to me like I have to pay for it, because I do.',
      'You promised us this last time. What happened?',
      'We will accept it. But you go first.',
    ],
    neverSay: 'Whatever you think is best.',
  },
  activist: {
    title: 'Youth Activist',
    org: 'Bangkit Iklim',
    post: 'Founder, Bangkit Iklim',
    blurb: 'You can make ignoring you expensive. Three times, and only three.',
    youAre: 'The Youth Activist. You have no money and the largest following in the country.',
    youWant: 'Real change, fast. And not to become the person who signed something and changed nothing.',
    yourMove: 'Name someone in public. Three times a game, and only if you push hard yourself.',
    whoYouAre:
      'Law degree, no job in law. You ran the first climate strike here at nineteen and four hundred people came. Last year ninety thousand came.',
    believe:
      'The science is not negotiable and the timeline is not a preference. Everyone in this room will be fine whatever happens. That is the problem.',
    afraidOf: 'Sitting in a nice room, signing something, and changing nothing.',
    resourcePower:
      'You cannot build or buy anything. You have three Spotlights for the whole game. A Spotlight names one player before everyone locks in. If that player then takes their dirtiest card, it only half works, they lose Public Trust, and the country feels better for the accountability. It only fires if you also escalate with your own card that round, so save it for a round when you expect someone to cave. Every time you sit down and compromise instead, the next one bites a little less.',
    says: [
      'That is not a plan, that is a press release.',
      'I will back you in public if you commit to it in public.',
      'Everyone in this room will be fine. That is the problem.',
    ],
    neverSay: 'Let us look at this again next year.',
  },
}

/** The resource each seat actually tracks. Every player watches exactly one number. */
export const ROLE_RESOURCE: Record<Role, { kind: PhoneView['resource']['kind']; label: string }> = {
  government: { kind: 'fiscal', label: 'Your Budget' },
  business: { kind: 'capital', label: 'Your Company Money' },
  community: { kind: 'vetoes', label: 'Your vetoes' },
  activist: { kind: 'spotlights', label: 'Your Spotlights' },
}

export interface PhoneOption {
  id: string
  title: string
  desc: string
  /** "2 Budget", "3 Company Money" or "Free": never a raw effect. */
  cost: string
  /** Four direction-only chips. Which way each meter moves, never how far. */
  impact: Impact[]
  /** Set only when the card's value depends on somebody else. Usually null. */
  condition: string | null
  available: boolean
  /** Why it cannot be chosen. The three disabled states get three edges. */
  disabled: 'afford' | 'veto' | 'gate' | null
  disabledNote: string | null
}
