/**
 * Journey to Net Zero: engine types.
 *
 * These mirror `reference/engine.py` and `reference/content.py`, which are the
 * authoritative implementation. Nothing here may re-derive a number: every
 * constant arrives from the content pack JSON.
 */

export const ROLES = ['government', 'business', 'community', 'activist'] as const
export type Role = (typeof ROLES)[number]

/** Roles that can hold Trust tokens. Community awards them and never holds any. */
export const TRUST_ROLES = ['government', 'business', 'activist'] as const
export type TrustRole = (typeof TRUST_ROLES)[number]

export type Archetype =
  | 'SPEND_STEER'
  | 'REGULATE'
  | 'DEREGULATE'
  | 'TRANSITION'
  | 'EXPAND'
  | 'PARTNER'
  | 'ADAPT'
  | 'DEMAND_RELIEF'
  | 'SELF_ORGANISE'
  | 'ESCALATE'
  | 'COLLABORATE'
  | 'EDUCATE'

/** Archetypes that count toward the Coalition Bonus and support Self-Organise. */
export const SUPPORTIVE: ReadonlySet<Archetype> = new Set<Archetype>([
  'SPEND_STEER',
  'TRANSITION',
  'PARTNER',
  'COLLABORATE',
])

/** Archetypes that break the coalition and attract the Spotlight. */
export const DIRTY: ReadonlySet<Archetype> = new Set<Archetype>(['EXPAND', 'DEREGULATE'])

export interface Cost {
  /** Positive spends Fiscal, negative refunds it. */
  fiscal?: number
  /** Positive spends Capital, negative refunds it. */
  capital?: number
}

export interface Shock {
  g: number
  h: number
  e?: number
  fiscal?: number
  capital?: number
}

export interface Option {
  id: string
  arch: Archetype
  title: string
  desc: string
  cost: Cost
  /** Raw content values, before role scaling and the global multipliers. */
  e: number
  g: number
  h: number
  gr: number
  flags: string[]
  headline: string
  /** Requires Government Trust at or above this value to appear. */
  gate_trust?: number
  /** Removed from the table entirely when this flag is set. */
  block_flag?: number | string
  /** ×1.5 when this flag is set. */
  boost_flag?: string
  /** ×2 when two or more EVIDENCE flags are set. */
  boost_evidence?: boolean
  /** [recipient, resource, amount]: grants a resource to another player. */
  grants?: [Role, 'capital' | 'fiscal', number]
}

export interface Scenario {
  id: string
  round: number
  variant: string
  type: string
  title: string
  situation: string
  shock: Shock
  options: Record<Role, Option[]>
}

export interface DriftBand {
  greenShareMax: number
  k: number
}

export interface CoalitionEffect {
  /** Negative for an emissions cut. */
  emissions: number
  happiness: number
  green: number
}

export interface Config {
  trend: number
  persist: number
  green_scale: number
  green_decay: number
  green_power: number
  green_dividend: number
  h_b0: number
  h_b_green: number
  h_b_growth: number
  h_persist: number
  h_scale: number
  mac_lo: number
  mac_span: number
  mac_ref: number
  mac_range: number
  self_org_mult: number
  partner_unfunded: number
  spotlight_backdown: number
  accountability_bonus: number
  vetoes: number
  regulation_bite: number
  public_pressure: number
  evidence_green: number
  fiscal_income: number
  fiscal_bonus_at: number
  capital_income_at: number
  fiscal_cap: number
  capital_cap: number
  tgt_e: number
  tgt_g: number
  tgt_h: number
  start: {
    e: number
    g: number
    h: number
    gr: number
    fiscal: number
    capital: number
    spot: number
  }
  e_green: number
  e_dirty: number
  h_scale2: number
  role_e: Record<Role, number>
  regulate_abate: number
  credibility_decay: number
  volunteer_fatigue: number
  coalition: Record<string, CoalitionEffect>
  coal_scale: number
  r6_flag_reduce: number
  r6_flag_cap: number
  r6_high_e: number
  r6_high_mult: number
  driftTable: DriftBand[]
}

export interface PrivateGoal {
  id: string
  title: string
  desc: string
  check: string
  measured: number
}

export interface TutorialScenario {
  title: string
  situation: string
  options: Record<Role, Option[]>
}

export interface Content {
  config: Config
  scenarios: Record<string, Scenario>
  /** Scenario ids by round, e.g. { 1: ['R1A','R1B','R1C'] }. */
  roundVariants: Record<number, string[]>
  resilienceFlags: ReadonlySet<string>
  privateGoals: Record<Role, PrivateGoal[]>
  insiderTips: InsiderTips
  /**
   * The practice round. Two cards a seat, and none of it reaches the engine: it
   * exists so a player learns tap, lock and look up on a decision that cannot
   * cost them anything. In the pack rather than in code so a variant can
   * localise it with everything else.
   */
  tutorial: TutorialScenario
}

export interface InsiderTips {
  rule: string
  rotation: string
  types: Record<string, { label: string; rounds: number[]; desc: string }>
  whisperAccuracy: number
  forecasts: Record<string, string[]>
  intel: Record<string, string>
  whispers: Record<string, string>
}

/** Mutable game state. The server owns exactly one of these per room. */
export interface GameState {
  /** Scenario ids, one per round, e.g. ['R1A','R2C',...]. */
  path: string[]
  round: number

  emissions: number
  growth: number
  happiness: number
  greenShare: number

  fiscal: number
  capital: number
  spotlights: number
  vetoes: number

  trust: Record<TrustRole, number>
  flags: Set<string>

  gdpHistory: number[]
  happinessHistory: number[]
  picks: Record<Role, string>[]

  /** Emissions delivered per role, for the Business "Green Champion" goal. */
  roleEmissions: Record<Role, number>

  spotlightHits: number
  vetoesUsed: number
  coalitionRounds: number
  /** Prior Collaborates. Each costs the Activist 8% of all future effect. */
  collabs: number
  /** Prior Self-Organises. Each costs the Community 6%. */
  selforg: number
  /** Self-Organise actions that landed with real backing. */
  selfOrganiseSucceeded: number
  /** Roles that chose a dirty option last round, for the veto trigger. */
  lastDirty: Role[]
}

/** What the four players (and the Community's veto) decided this round. */
export interface RoundInput {
  /** Option id chosen by each role. */
  choices: Record<Role, string>
  /**
   * Role whose dirty options the Community removed with a Public Mandate.
   * The engine spends the veto; pass null when none was used.
   */
  vetoTarget?: Role | null
  /**
   * Whether the Government agreed to co-fund a Partner option during THE TABLE.
   * In `engine.py` this was `Policy.cofund()`; with humans it is a real decision.
   */
  coFund?: boolean
}

/** Everything the dashboard needs to narrate one round. */
export interface RoundLog {
  round: number
  scenarioId: string
  /** Shock after legacy-flag and Round 6 scaling. */
  shock: { g: number; h: number; e: number }
  shockMultiplier: number
  vetoTarget: Role | null
  /** Roles whose choice was constrained by the veto. */
  vetoBlocked: string[]
  spotlightTarget: Role | null
  govRegulates: boolean
  govIsolated: boolean
  /** Per-role breakdown, in reveal order. */
  reveals: RoundReveal[]
  alignedCount: number
  coalitionBonus: CoalitionEffect | null
  forcedAbatement: number
  /** Meter deltas applied this round. */
  deltas: { e: number; g: number; h: number; gr: number }
  trustAwarded: { care: TrustRole; future: TrustRole }
  /** Emissions added by growth-carbon drift. */
  drift: number
  driftK: number
  state: PublicState
}

export interface RoundReveal {
  role: Role
  optionId: string
  arch: Archetype
  title: string
  desc: string
  headline: string
  /** Counted toward the Coalition Bonus, i.e. not Expand, Deregulate or Demand Relief. */
  aligned: boolean
  /** Multiplier applied to this option's effects, after every rule. */
  multiplier: number
  /** Emissions actually delivered, after MAC, role scaling and multipliers. */
  emissions: number
  partnerUnfunded: boolean
  selfOrganiseSupported: boolean
  spotlit: boolean
  flagsSet: string[]
}

/** The subset of state safe to broadcast. Never includes option numbers. */
export interface PublicState {
  round: number
  emissions: number
  growth: number
  averageGrowth: number
  happiness: number
  greenShare: number
  fiscal: number
  capital: number
  spotlights: number
  vetoes: number
  trust: Record<TrustRole, number>
  flags: string[]
  /** Emissions in 2050 if the current growth and green share hold. */
  projection2050: number
}

export interface GameResult {
  win: boolean
  /** Emissions target met. */
  pe: boolean
  /** Average growth target met. */
  pg: boolean
  /** Happiness target met. */
  ph: boolean
  e: number
  g: number
  h: number
  gr: number
  fiscal: number
  capital: number
  trust: Record<TrustRole, number>
  flags: Set<string>
  roleEmissions: Record<Role, number>
  spotlightHits: number
  vetoesUsed: number
  coalitionRounds: number
  selfOrganiseSucceeded: number
  gdpHistory: number[]
  happinessHistory: number[]
  picks: Record<Role, string>[]
}
