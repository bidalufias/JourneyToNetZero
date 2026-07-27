/**
 * Session types — the room around the engine.
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
 * Phase lengths in milliseconds — the 30-minute session from the design doc:
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
 * A public pledge. Recorded and displayed, never enforced — the first time
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

/** What the dashboard renders. Public by definition — the whole room sees it. */
export interface DashboardView {
  code: string
  phase: Phase
  phaseEndsAt: number | null
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
  /** Target is null until the choices resolve — the engine derives it. */
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
  /** Declared this round — the Activist's only confirmation that it landed. */
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
  /** Written in plain language, no numbers — the phone's only interpretation. */
  roundResult: { didWhat: string; cost: string; others: string } | null
  waitingOn: number
}

export const ROLE_LABEL: Record<Role, string> = {
  government: 'Government',
  business: 'Business',
  community: 'Community',
  activist: 'Activist',
}

export const ROLE_CHARACTER: Record<Role, { name: string; title: string; org: string; blurb: string }> = {
  government: {
    name: 'Datuk Nurul Aziz',
    title: 'the Honourable Minister',
    org: 'Ministry of Energy, Environment and Climate',
    blurb: 'Holds the budget and the law. Moves faster than anyone. Can also be voted out in an afternoon.',
  },
  business: {
    name: 'Tan Sri Lim Wei Sheng',
    title: 'the Group CEO',
    org: 'Sawit Prima Group',
    blurb: 'Owns the emissions. Also owns the jobs, exports and tax base.',
  },
  community: {
    name: 'Mak Cik Rohani',
    title: 'the Chair',
    org: "Kampung Baru Jernih residents' association",
    blurb: '34 million people who want clean air, a job, and petrol under two Ringga a litre.',
  },
  activist: {
    name: 'Aisyah Kamal',
    title: 'the Founder',
    org: 'Bangkit Iklim',
    blurb: 'Can make ignoring her more expensive than listening — three times, and only three.',
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
  /** "2 FP", "3 C" or "FREE" — never a raw effect. */
  cost: string
  /** Plain-English trade-off, capped at 52 characters. */
  hint: string
  available: boolean
  /** Why it cannot be chosen — the three disabled states get three edges. */
  disabled: 'afford' | 'veto' | 'gate' | null
  disabledNote: string | null
}
