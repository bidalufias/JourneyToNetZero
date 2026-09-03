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
  | 'practiceTalk'
  | 'practiceChoice'
  | 'power'
  | 'goal'
  | 'crisis'
  | 'table'
  | 'choice'
  | 'reckoning'
  | 'trust'
  | 'summary'
  | 'results'
  | 'ended'

/**
 * The onboarding, then the round.
 *
 * Every step teaches exactly one verb and then makes the table use it. A player
 * used to meet the room code, a role, a resource, a sealed goal and the three
 * national targets before making a single decision, which is roughly 850 words
 * inside a three minute setup. Now they say something, pick something, and see
 * it resolve, before any of it counts.
 *
 * The practice talk comes before the practice choice because that is the order
 * a real round runs in. The plan had them the other way round, on the reasoning
 * that picking is the simpler verb; teaching the sequence backwards to save one
 * step of difficulty is a poor trade.
 *
 * The round is built around a fixed budget rather than around what each beat
 * could justify on its own. The Reveal used to run 75 seconds, six times, which
 * is seven and a half minutes of the session spent watching rather than
 * playing: the flip sequence itself needs about fifteen seconds, and the rest
 * of it was a room waiting. That time is now split between the Talk, which is
 * where the game actually happens, and a short beat that says where the two
 * Public Trust tokens went, which the engine has awarded every round since the
 * first build without a single surface ever mentioning it.
 */
export const PHASE_MS: Record<Phase, number> = {
  lobby: 0, // ends when the facilitator starts
  briefing: 45_000,
  practiceTalk: 75_000,
  practiceChoice: 60_000,
  power: 30_000,
  goal: 45_000,
  crisis: 25_000,
  table: 90_000,
  choice: 40_000,
  reckoning: 45_000,
  trust: 15_000,
  summary: 8_000,
  results: 0, // advances on facilitator input
  ended: 0,
}

/**
 * Round 1 runs long, and only Round 1.
 *
 * The first crisis is the first time anybody reads a card, makes a case to a
 * stranger, or finds out what the lock button does under a clock. Charging that
 * round the same forty seconds as Round 6 is what produces a table that spends
 * its first round confused and its second round apologising for the first. The
 * coach strip on the phone disappears at the same time these do.
 */
const ROUND_ONE_MS: Partial<Record<Phase, number>> = {
  crisis: 35_000,
  table: 120_000,
  choice: 60_000,
}

/** How long this phase runs, for the round the room is actually in. */
export function phaseMs(phase: Phase, round: number): number {
  return (round <= 1 ? ROUND_ONE_MS[phase] : undefined) ?? PHASE_MS[phase]
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
 * The three shapes of the one thing a player can say out loud.
 *
 * There used to be four ways to speak: promise, demand, offer and a private
 * co-funding toggle that the room never saw. Three of them produced the same
 * kind of line on the same board, and the fourth was the single most important
 * commitment in the game, made by tapping a switch nobody was told about.
 *
 * `deal` is new, and it is the sentence the design document ends on: the most
 * important number in a session is the number of times somebody says "what if
 * we both did it?", and until now the game had no way to say it.
 */
export type SayShape = 'promise' | 'demand' | 'deal' | 'cofund'

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
  kind: SayShape
  /** Option the pledge commits to, when the phrasing names one. */
  optionId: string | null
  /** For a deal: the seat the pledge is conditional on, and on what. */
  ifRole: Role | null
  ifConditionId: string | null
  /**
   * Resolved at the Reveal.
   *
   * `void` exists for deals only, and it is the honest answer rather than a
   * softened one: a conditional pledge whose condition never happened did not
   * bind anybody, so calling it broken would punish the one player who tried to
   * build something, and calling it kept would reward a promise nobody tested.
   */
  outcome: 'kept' | 'broken' | 'void' | 'unresolved'
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

/**
 * A Tip Off: one true warning, to one player, about what is coming next.
 *
 * There were four kinds, one of which was a coin flip. A tip is now always
 * true, so there is nothing to explain and nothing to gamble: the only decision
 * is whether to keep an advantage or trade it for standing, which is a decision
 * a player can make in the five seconds they actually have.
 */
export interface InsiderTip {
  id: string
  round: number
  /** Exactly one player per round. Never shown on the dashboard. */
  to: Role
  source: string
  text: string
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
  publishedTip: { from: Role; text: string; source: string } | null
  /** Target is null until the choices resolve. The engine derives it. */
  spotlight: { by: Role; target: Role | null; remaining: number } | null
  veto: { target: Role; removed: string[]; remaining: number } | null
  lastRound: RoundLog | null
  history: RoundLog[]
  headlines: string[]
  targets: { emissions: number; growth: number; happiness: number }
  /**
   * Where this round's two Public Trust tokens went.
   *
   * The engine has awarded these every round since the first build and no
   * surface has ever said so, which left the Community holding a power the
   * game told them about and then never showed them using.
   */
  trustAward: { care: TrustRole; future: TrustRole } | null
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
  /**
   * What your card did, once the cards are face up.
   *
   * The no-numbers rule is right before a choice and wrong after it. Once four
   * cards are on the big screen the information is not private any more, and
   * withholding it teaches nothing: a player who cannot connect the card they
   * read to the meter that moved has played six rounds of a guessing game.
   */
  roundResult: {
    didWhat: string
    cost: string
    others: string
    /** The card, and the same four chips it carried before it was chosen. */
    title: string
    impact: Impact[]
    costLabel: string
    /** Carbon actually delivered, in Mt, after every rule the engine applied. */
    carbon: number
    /** One line of comparison against the rest of the table, or nothing. */
    note: string | null
  } | null
  /** Where the two Public Trust tokens went this round, and why. */
  trustAward: { care: Role; future: Role } | null
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
export interface RoleCard {
  /** The archetype, without its article. */
  title: string
  org: string

  /*
   * The card. Four lines under four fixed headings, in this order, on every
   * surface: who you are, what you want, what you have, how to play. Seventy
   * words or fewer between them, and the same words wherever the card shows.
   */
  who: string
  wants: string
  /** The seat's money or power, with the number. */
  has: string
  /** Three short instructions. The line the old role screens never had. */
  howToPlay: string
  /** Two lines a shy player can open their mouth with. Behind a tap, never on the card. */
  says: [string, string]
}

/**
 * A player used to learn their role from five screens, at five moments, under
 * five sets of headings, and around 250 words. Now it is one card of about
 * sixty words, shown in the same shape at every moment the player needs it.
 */
export const ROLE_CARD: Record<Role, RoleCard> = {
  government: {
    title: 'Minister',
    org: 'Ministry of Energy and Climate',
    who: 'The Minister. You run the government.',
    wants: 'A growing economy, and to stay in power.',
    has: 'Budget: 4. You get 2 more each round. Cards cost 1 to 3 Budget.',
    howToPlay:
      'Spend on big changes. Give Budget to the Business when a deal is worth it. Always ask what the voters get.',
    says: [
      'I can pay for that. What do I tell the voters?',
      'If I do that, I lose the election. Then nothing happens.',
    ],
  },
  business: {
    title: 'Company Boss',
    org: 'Sawit Prima Group',
    who: 'The Company Boss. You own the biggest company in the country.',
    wants: 'Profit, and a company that still exists in 2050.',
    has: 'Company Money: 5. You get 1 more each round. Going clean costs 3.',
    howToPlay:
      'Go clean when someone helps you pay. Ask the Government to pay half. Protect your workers’ jobs.',
    says: ['I will do it if the Government pays half.', 'Who pays to retrain my workers?'],
  },
  community: {
    title: 'Community Leader',
    org: 'Kampung Baru Jernih residents',
    who: 'The Community Leader. You speak for 34 million ordinary people.',
    wants: 'Clean air, and prices people can afford.',
    has: '2 vetoes. A veto takes one player’s dirty cards away for one round.',
    howToPlay:
      'Ask what each plan costs ordinary people. Remind players what they promised. Use a veto when someone is about to hurt everyone.',
    says: [
      'Explain it to me like I have to pay for it. Because I do.',
      'You promised this last time. What happened?',
    ],
  },
  activist: {
    title: 'Youth Activist',
    org: 'Bangkit Iklim',
    who: 'The Youth Activist. You lead the biggest movement in the country.',
    wants: 'Real climate action, fast.',
    has: '3 Spotlights. A Spotlight punishes a player who picks a dirty card.',
    howToPlay:
      'Push everyone to pick clean cards. Offer deals: “I will support you if you go clean”. Use a Spotlight when you think someone will pick a dirty card.',
    says: [
      'That is not a plan. That is a press release.',
      'I will support you in public if you promise in public.',
    ],
  },
}

/**
 * Everything the card does not carry. Read by the facilitator's script and
 * nowhere else: a host can read it aloud when a table wants colour, and a
 * player never has to.
 */
export interface Backstory {
  post: string
  whoYouAre: string
  believe: string
  afraidOf: string
  neverSay: string
}

export const BACKSTORY: Record<Role, Backstory> = {
  government: {
    post: 'Minister for Energy and Climate',
    whoYouAre:
      'Twenty-four years in the civil service, then politics. Half your voters work on plantations. The other half commute into the city.',
    believe:
      'The change has to happen. Only you can pay for it. But a government that loses an election changes nothing.',
    afraidOf: 'Being the Minister who made petrol expensive.',
    neverSay: 'Money does not matter.',
  },
  business: {
    post: 'Group CEO, Sawit Prima',
    whoYouAre:
      'Third generation. You took over at 41. Forty thousand staff. You have read every big climate report.',
    believe:
      'You will go clean when it is cheaper than staying dirty. Or when someone makes dirty expensive. You think that is honest, not evil.',
    afraidOf: 'Being the boss who went clean too early and lost money.',
    neverSay: 'Profit does not matter here.',
  },
  community: {
    post: 'Food stall owner, head of the residents’ association',
    whoYouAre:
      'You run a food stall and head the residents’ association. Your stall has flooded three times in eight years. Your child has asthma.',
    believe:
      'Clean air and affordable petrol are both reasonable things to want. You have heard many promises. You remember all of them.',
    afraidOf: 'Being asked to sacrifice again by people who will not have to.',
    neverSay: 'Whatever you think is best.',
  },
  activist: {
    post: 'Founder, Bangkit Iklim',
    whoYouAre:
      'Law degree, no job in law. You ran the first climate strike here at nineteen. Four hundred people came. Last year ninety thousand came.',
    believe:
      'The science is not up for debate. The deadline is not a preference. Everyone in this room will be fine. That is the problem.',
    afraidOf: 'Sitting in a nice room, signing something, and changing nothing.',
    neverSay: 'Let us talk about it next year.',
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
