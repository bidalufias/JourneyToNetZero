export type IndicatorKey =
  | "economy"
  | "emissions"
  | "trust"
  | "equity"
  | "resilience"
  | "energySecurity";

export type RoleKey = "government" | "business" | "community" | "youth";

export type PhaseKey =
  | "intro"
  | "brief"
  | "discussion"
  | "decision"
  | "resolution"
  | "refresh"
  | "ending";

export type ResourceState = {
  primary: number;
  secondary: number;
};

export type EffectTarget = IndicatorKey | "friction" | "resource" | "meta";

export type Effect = {
  target: EffectTarget;
  key?: string;
  amount: number;
  condition?: string;
  description?: string;
};

export type DelayedEffect = {
  id: string;
  sourceId: string;
  triggerRound: number;
  effects: Effect[];
  triggerOnShockTag?: string;
};

export type ActionCard = {
  id: string;
  role: RoleKey;
  title: string;
  description: string;
  actionType: "primary" | "support";
  costs: {
    primary?: number;
    secondary?: number;
  };
  tags: string[];
  immediateEffects: Effect[];
  tradeoffEffects: Effect[];
  delayedEffects?: DelayedEffect[];
  synergyKeys?: string[];
};

export type EventCard = {
  id: string;
  round: number;
  title: string;
  description: string;
  tags: string[];
  baseEffects: Effect[];
};

export type WildcardCard = {
  id: string;
  title: string;
  description: string;
  type: "roleSwap" | "resource" | "coordination" | "system" | "narrative";
  tags: string[];
  effects: Effect[];
};

export type SynergyRule = {
  id: string;
  title: string;
  requiredTags: string[];
  minMatches: number;
  effects: Effect[];
};

export type PlayerState = {
  seat: 0 | 1 | 2 | 3;
  role: RoleKey;
  activePanelRole: RoleKey;
  resources: ResourceState;
  selectedPrimaryActionId?: string;
  selectedSupportActionId?: string;
  lockedIn: boolean;
};

export type CityState = {
  indicators: Record<IndicatorKey, number>;
  friction: number;
  delayedEffectsQueue: DelayedEffect[];
};

export type RoundLog = {
  round: number;
  eventId: string;
  wildcardId?: string;
  actionsByRole: Record<RoleKey, { primary?: string; support?: string }>;
  indicatorChanges: Partial<Record<IndicatorKey, number>>;
  frictionChange: number;
  triggeredSynergies: string[];
  headlines: string[];
};

/* ── Objective system ── */

export type ObjectiveCondition =
  | { type: "indicatorMin"; key: IndicatorKey; min: number }
  | { type: "indicatorNeverBelow"; key: IndicatorKey; min: number }
  | { type: "frictionMax"; max: number }
  | { type: "synergyCount"; min: number }
  | { type: "resourceMin"; key: RoleKey; resourceType: "primary" | "secondary"; min: number }
  | { type: "tagChosenMax"; tag: string; max: number }
  | { type: "supportActionCount"; min: number }
  | { type: "combined"; conditions: ObjectiveCondition[]; mode: "all" | "any" };

export type ObjectiveCard = {
  id: string;
  role: RoleKey;
  tier: "primary" | "secondary";
  title: string;
  tagline: string;
  description: string;
  conditions: ObjectiveCondition;
  tensionNote: string;
};

export type ObjectiveVerdict =
  | "Hero"
  | "Pyrrhic Victory"
  | "The Pivot"
  | "Team Player"
  | "Selfish"
  | "Lost";

export type ObjectiveStats = {
  synergiesTriggeredByRole: Record<RoleKey, number>;
  supportActionsUsedByRole: Record<RoleKey, number>;
  tagsChosenByRole: Record<RoleKey, string[]>;
  indicatorsNeverBelow: Record<IndicatorKey, { below: number; violated: boolean }>;
  frictionNeverAbove: { max: number; violated: boolean };
  resourcesNeverBelow: Record<string, { min: number; violated: boolean }>;
};

export type GameState = {
  cityArchetypeId: string;
  round: number;
  phase: PhaseKey;
  players: PlayerState[];
  city: CityState;
  currentEventId?: string;
  currentWildcardId?: string;
  logs: RoundLog[];
  endingId?: string;
  timers: {
    phaseEndsAt?: number;
  };
  /* objective selection */
  objectiveSelectingSeat: number;
  selectedObjectives: Record<RoleKey, { primary?: string; secondary?: string }>;
  collectiveWin?: boolean;
  verdicts: Partial<Record<RoleKey, ObjectiveVerdict>>;
  stats: ObjectiveStats;
};
