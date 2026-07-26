/** The four stakeholders. */
export type RoleId = 'government' | 'business' | 'community' | 'activist'

export const ROLE_IDS: RoleId[] = [
  'government',
  'business',
  'community',
  'activist',
]

/** The three national outcomes every player is judged on. */
export type IndicatorId = 'economy' | 'emissions' | 'living'

export interface Indicators {
  /** GDP growth, investment, export competitiveness, fiscal health. Higher is better. */
  economy: number
  /** National GHG output, indexed to 2026 = 100. Lower is better; 0 is net zero. */
  emissions: number
  /** Cost of living, jobs, health, energy access, public trust. Higher is better. */
  living: number
}

export type IndicatorDelta = Partial<Indicators>

/**
 * Every role plays the same three shapes each round, so players learn the
 * grammar once and spend the rest of the game on the substance.
 */
export type ActionShape =
  /** Cheap, protects your currency and agenda, pushes cost onto the others. */
  | 'self'
  /** Helps the nation, costs you currency, usually hurts your private agenda. */
  | 'collective'
  /** Strongest on the board, but locked until someone funds you this round. */
  | 'conditional'

export interface Role {
  id: RoleId
  name: string
  /** Malay name, shown as a subtitle. */
  nameMs: string
  currency: string
  currencyShort: string
  startingCurrency: number
  blurb: string
  /** The thing only this role can do. */
  power: { name: string; description: string }
  accent: string
}

export interface Action {
  id: string
  round: number
  role: RoleId
  shape: ActionShape
  title: string
  /** One line the player reads on their phone before committing. */
  summary: string
  /** Currency this action costs the acting player. */
  cost: number
  effects: IndicatorDelta
  /** Currency the acting player gains (e.g. taxes, profit). */
  income?: number
  /**
   * Conditional actions only: another player must transfer at least `amount`
   * of their currency to you this round to unlock it.
   */
  requires?: { from: RoleId; amount: number }
  /** Shown on the reveal — why this is a real option in Malaysia. */
  rationale: string
}

export interface Situation {
  round: number
  year: number
  title: string
  /** The hook, read aloud off the big screen. */
  headline: string
  /** Two or three sentences of grounding. */
  context: string
  /** The verified fact this is built on, shown during the debrief. */
  realStory: string
  /**
   * Business-as-usual drift applied every round before actions resolve. The
   * world moves whether or not the table does — doing nothing must lose.
   */
  drift: IndicatorDelta
}

/** Serializable agenda tests, evaluated by the engine. */
export type AgendaCheck =
  /** Indicator must never fall below `value` in any round. */
  | { type: 'never_below'; indicator: IndicatorId; value: number }
  /** Indicator must never rise above `value` in any round. */
  | { type: 'never_above'; indicator: IndicatorId; value: number }
  /** Final value of an indicator. */
  | { type: 'final'; indicator: IndicatorId; op: 'gte' | 'lte'; value: number }
  /** Indicator must hit a mark by the end of a given round. */
  | { type: 'by_round'; indicator: IndicatorId; round: number; op: 'gte' | 'lte'; value: number }
  /** Your currency at the end of the game. */
  | { type: 'currency_final'; op: 'gte' | 'lte'; value: number }
  /** Your currency must never hit zero at a round end. */
  | { type: 'never_broke' }
  /** You must pick a given shape at least `min` times. */
  | { type: 'shape_count'; shape: ActionShape; min: number }
  /** You must complete at least `min` transfers (given or received). */
  | { type: 'deals'; min: number }
  /** At least `min` of your deals must be with a specific role. */
  | { type: 'deals_with'; role: RoleId; min: number }
  /** You must never accept currency from a specific role. */
  | { type: 'never_take_from'; role: RoleId }
  /** Economy must never rise in a round where living standards fall. */
  | { type: 'no_growth_without_people' }
  /** You personally cause the single largest emissions cut of the game. */
  | { type: 'biggest_cut' }

export interface Agenda {
  id: string
  role: RoleId
  title: string
  /** Shown privately to the holder, in their own words. */
  description: string
  check: AgendaCheck
}

export type SynergyKind =
  /** Effects of the listed roles are amplified. */
  | 'amplify'
  /** The listed role's action is diluted or fails. */
  | 'cancel'
  /** The listed role's action reverses. */
  | 'backfire'

export interface Synergy {
  id: string
  round: number
  title: string
  description: string
  kind: SynergyKind
  /** All of these action ids must have been chosen for the synergy to fire. */
  requires: string[]
  /** Whose effects are modified. */
  affects: RoleId[]
  /** 1.5 amplifies by half; 0.35 dilutes; -1 reverses. */
  multiplier: number
}

export interface Ending {
  id: string
  title: string
  blurb: string
  /** Which of the three thresholds were met. */
  economy: boolean
  emissions: boolean
  living: boolean
}

/* ---------------------------------------------------------------- runtime */

export type Phase =
  | 'lobby'
  | 'briefing'
  | 'situation'
  | 'discussion'
  | 'locking'
  | 'reveal'
  | 'resolution'
  | 'ending'

export interface Transfer {
  round: number
  from: RoleId
  to: RoleId
  amount: number
}

export interface RoundResult {
  round: number
  choices: Partial<Record<RoleId, string>>
  transfers: Transfer[]
  before: Indicators
  after: Indicators
  firedSynergies: string[]
  /** Per-role contribution to the emissions change, for the debrief. */
  emissionsBy: Partial<Record<RoleId, number>>
}

export interface PlayerSeat {
  id: string
  role: RoleId
  name: string
  currency: number
  agendaId: string
  connected: boolean
}

export interface GameState {
  code: string
  phase: Phase
  round: number
  indicators: Indicators
  seats: Partial<Record<RoleId, PlayerSeat>>
  history: RoundResult[]
  /** Selections for the round in progress, hidden until reveal. */
  pending: Partial<Record<RoleId, string>>
  pendingTransfers: Transfer[]
  phaseEndsAt: number | null
  paused: boolean
  hostId: string | null
}
