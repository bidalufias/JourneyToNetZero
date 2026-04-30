/**
 * objectiveEvaluator.ts
 *
 * Pure condition evaluator + verdict generator for the objective system.
 * Called once at game end from resolutionEngine.ts
 */
import { objectiveById } from "../data/objectives";
import type {
  GameState,
  ObjectiveCondition,
  ObjectiveVerdict,
  RoleKey,
} from "../types/gameTypes";

/* ── Condition evaluator (role-aware) ── */

export const evaluateCondition = (
  condition: ObjectiveCondition,
  state: GameState,
  role: RoleKey,
): boolean => {
  switch (condition.type) {
    case "indicatorMin":
      return state.city.indicators[condition.key] >= condition.min;

    case "indicatorNeverBelow": {
      const tracker = state.stats.indicatorsNeverBelow[condition.key];
      return !tracker.violated && state.city.indicators[condition.key] >= condition.min;
    }

    case "frictionMax": {
      return !state.stats.frictionNeverAbove.violated && state.city.friction <= condition.max;
    }

    case "synergyCount": {
      const total = Object.values(state.stats.synergiesTriggeredByRole)
        .reduce((a, b) => a + b, 0);
      return total >= condition.min;
    }

    case "resourceMin": {
      const player = state.players.find((p) => p.role === condition.key);
      if (!player) return false;
      const val = condition.resourceType === "primary"
        ? player.resources.primary
        : player.resources.secondary;
      return val >= condition.min;
    }

    case "tagChosenMax": {
      const tags = state.stats.tagsChosenByRole[role] ?? [];
      const count = tags.filter((t) => t === condition.tag).length;
      return count >= condition.max;
    }

    case "supportActionCount": {
      return state.stats.supportActionsUsedByRole[role] >= condition.min;
    }

    case "supportActionMax": {
      return state.stats.supportActionsUsedByRole[role] <= condition.max;
    }

    case "combined": {
      if (condition.mode === "all") {
        return condition.conditions.every((c) => evaluateCondition(c, state, role));
      }
      return condition.conditions.some((c) => evaluateCondition(c, state, role));
    }

    default:
      return false;
  }
};

/* ── Collective win check ── */

export const evaluateCollectiveWin = (state: GameState): boolean => {
  const ind = state.city.indicators;
  return (
    ind.emissions >= 6 &&
    ind.economy >= 5 &&
    ind.trust >= 4 &&
    ind.equity >= 4 &&
    ind.resilience >= 4
  );
};

/* ── Individual verdict ── */

export const evaluateVerdict = (
  collectiveWin: boolean,
  primaryMet: boolean,
  secondaryMet: boolean,
): ObjectiveVerdict => {
  if (collectiveWin && primaryMet && secondaryMet) return "Hero";
  if (collectiveWin && primaryMet && !secondaryMet) return "Pyrrhic Victory";
  if (collectiveWin && !primaryMet && secondaryMet) return "The Pivot";
  if (collectiveWin && !primaryMet && !secondaryMet) return "Team Player";
  if (!collectiveWin && (primaryMet || secondaryMet)) return "Selfish";
  return "Lost";
};

/* ── Full endgame evaluation ── */

export const evaluateObjectives = (
  state: GameState,
): { collectiveWin: boolean; verdicts: Partial<Record<RoleKey, ObjectiveVerdict>> } => {
  const collectiveWin = evaluateCollectiveWin(state);
  const verdicts: Partial<Record<RoleKey, ObjectiveVerdict>> = {};

  const roles: RoleKey[] = ["government", "business", "community", "youth"];
  for (const role of roles) {
    const selected = state.selectedObjectives[role];
    const primaryCard = selected.primary ? objectiveById(selected.primary) : undefined;
    const secondaryCard = selected.secondary ? objectiveById(selected.secondary) : undefined;

    const primaryMet = primaryCard
      ? evaluateCondition(primaryCard.conditions, state, role)
      : false;
    const secondaryMet = secondaryCard
      ? evaluateCondition(secondaryCard.conditions, state, role)
      : false;

    verdicts[role] = evaluateVerdict(collectiveWin, primaryMet, secondaryMet);
  }

  return { collectiveWin, verdicts };
};
