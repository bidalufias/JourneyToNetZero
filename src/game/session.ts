/**
 * Session types: the room around the engine.
 *
 * The engine knows about a country. This module knows about four people in a
 * room with phones, a countdown, and a shared screen. Everything here is owned
 * by the server; clients render whatever view they are handed and nothing else.
 */
import type { GameState, PublicState, Role, RoundLog, TrustRole } from '../engine/types'

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
 * Phase lengths in milliseconds, for the 30-minute session from the design doc:
 * 3 setup, 24 play across six 4-minute rounds, 3 results.
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
  resource: { kind: 'fiscal' | 'capital' | 'trust-awards' | 'spotlights'; value: number; label: string }
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
  /** The formal post, as it would read on a business card. */
  post: string
  /** One line, for the places that only have room for one. */
  blurb: string
  whoYouAre: string
  believe: string
  afraidOf: string
  howToPlay: string
  /** Three things this character would actually say at the table. */
  says: string[]
  /** And the one they never would. */
  neverSay: string
}

/**
 * The profile is the same text as the written guide's character cards, because
 * a player who read the guide and a player who did not have to end up playing
 * the same person. Most tables never open the guide, which is why the whole
 * thing has to be reachable from the phone that is already in their hand.
 */
export const ROLE_CHARACTER: Record<Role, RoleCharacter> = {
  government: {
    title: 'Honourable Minister',
    org: 'Ministry of Energy, Environment and Climate',
    post: '52 · Minister for Energy, Environment and Climate',
    blurb: 'Holds the budget and the law. Moves faster than anyone. Can also be voted out in an afternoon.',
    whoYouAre:
      'Twenty-four years in the civil service before you went into politics. You represent Kuala Jernih, a semi-rural seat where half your voters work in plantations and the other half commute into the city. People call you competent and slightly boring. You take that as a compliment.',
    believe:
      'The transition has to happen and you are the only person in this room who can actually fund it. You also believe that a government that loses an election achieves nothing at all, so staying in power is not vanity. It is the job.',
    afraidOf: 'Being remembered as the minister who made petrol expensive.',
    howToPlay:
      'You move faster than anyone else here. You can spend, and you can make law. But everything you do is paid for by someone who votes. Never give something away without asking what you get back.',
    says: [
      'I can fund that. What do I tell the people in Perindu?',
      "Give me a public reason to spend this and I'll spend it.",
      'If I do that I lose the seat, and then none of this happens.',
    ],
    neverSay: "Money's no object.",
  },
  business: {
    title: 'Business Tycoon',
    org: 'Sawit Prima Group',
    post: '58 · Group CEO, Sawit Prima: palm, property, power',
    blurb: 'Owns the emissions. Also owns the jobs, exports and tax base.',
    whoYouAre:
      'Third generation. You took over at 41, the week your father died. Forty thousand employees. You have read every major climate report of the last decade and can quote them, which surprises people who assume you have not.',
    believe:
      'You will go green the moment it is cheaper than not going green, or the moment somebody makes staying dirty more expensive. You do not think that makes you a villain. You think it makes you honest, and you are quietly irritated by people who pretend otherwise.',
    afraidOf: 'Being the chief executive who bet the company early and got it wrong.',
    howToPlay:
      'You own the emissions. You also own the jobs, the exports and most of the tax base. That gives you leverage. Use it. Never volunteer to pay for something alone if you can get it co-funded.',
    says: [
      "I'll do it, if the Government shares the cost.",
      "That's a ten-year investment and I'm judged every quarter.",
      'You want me to cut thirty percent? Fine. Who pays for the retraining?',
    ],
    neverSay: "Profit doesn't matter here.",
  },
  community: {
    title: 'Community Elder',
    org: "Kampung Baru Jernih residents' association",
    post: "47 · Food stall owner, chair of the residents' association",
    blurb: '34 million people who want clean air, a job, and petrol under two Ringga a litre.',
    whoYouAre:
      "You run a stall in Kampung Baru Jernih and you chair the residents' association, which means you speak for thirty-four million people who never elected you but definitely agree with you. Your stall has flooded three times in eight years. Your child has asthma. Your electricity bill doubled last year.",
    believe:
      'Clean air and affordable petrol are both perfectly reasonable things to want, and you are tired of being told to pick one. You have heard a lot of promises. You remember all of them.',
    afraidOf: "Being asked to sacrifice again by people who won't have to.",
    howToPlay:
      'Make them earn it out loud. Ask what things cost. Remind people what they promised last round. You are the only player who can say no and make it stick.',
    says: [
      'Explain that to me like I have to pay for it, because I do.',
      'You promised us this last time. What happened?',
      "We'll accept it. But you go first.",
    ],
    neverSay: 'Whatever you think is best.',
  },
  activist: {
    title: 'Youth Activist',
    org: 'Bangkit Iklim',
    post: '26 · Founder, Bangkit Iklim (Climate Rise)',
    blurb: 'Can make ignoring them more expensive than listening. Three times, and only three.',
    whoYouAre:
      'Law degree, no job in law. You organised the first climate strike in Kota Damai when you were nineteen, and four hundred people came. Last year ninety thousand came. You have no budget, no staff worth the name, and the largest following in the country.',
    believe:
      "The science isn't negotiable and the timeline isn't a preference. Everyone in this room will personally be fine whatever happens, and that is precisely the problem.",
    afraidOf: 'Becoming the person who sat in a nice room, signed something, and changed nothing.',
    howToPlay:
      'You have three real choices every round: escalate, which is loud, costly and effective against bad actors; collaborate, which buys real influence and spends a little of your soul; or build evidence, where nothing happens now and something big happens later. Pick deliberately.',
    says: [
      "That's not a plan, that's a press release.",
      "I'll back you publicly if you commit to it publicly.",
      "Everyone in this room will be fine. That's the problem.",
    ],
    neverSay: "Let's revisit this next year.",
  },
}

/** The resource each seat actually tracks. Every player watches exactly one number. */
export const ROLE_RESOURCE: Record<Role, { kind: PhoneView['resource']['kind']; label: string }> = {
  government: { kind: 'fiscal', label: 'Your Fiscal Points' },
  business: { kind: 'capital', label: 'Your Capital' },
  community: { kind: 'trust-awards', label: 'Public Mandate vetoes' },
  activist: { kind: 'spotlights', label: 'Spotlights' },
}

export interface PhoneOption {
  id: string
  title: string
  desc: string
  /** "2 FP", "3 C" or "FREE": never a raw effect. */
  cost: string
  /** Plain-English trade-off, capped at 52 characters. */
  hint: string
  available: boolean
  /** Why it cannot be chosen. The three disabled states get three edges. */
  disabled: 'afford' | 'veto' | 'gate' | null
  disabledNote: string | null
}
