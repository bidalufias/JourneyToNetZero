import { create } from "zustand";
import {
  actionById,
  cityArchetypes,
  endings,
  events,
  startingResources,
} from "../data";
import { objectiveById } from "../data/objectives";
import { resolveRound } from "./resolutionEngine";
import type {
  ActionCard,
  GameState,
  ObjectiveCondition,
  ObjectiveStats,
  PlayerState,
  RoleKey,
} from "../types/gameTypes";

export type UIScreen = "attract" | "tabletop";

const createInitialStats = (): ObjectiveStats => ({
  synergiesTriggeredByRole: { government: 0, business: 0, community: 0, youth: 0 },
  supportActionsUsedByRole: { government: 0, business: 0, community: 0, youth: 0 },
  tagsChosenByRole: { government: [], business: [], community: [], youth: [] },
  indicatorsNeverBelow: {
    economy: { below: 0, violated: false },
    emissions: { below: 0, violated: false },
    trust: { below: 0, violated: false },
    equity: { below: 0, violated: false },
    resilience: { below: 0, violated: false },
    energySecurity: { below: 0, violated: false },
  },
  frictionNeverAbove: { max: 5, violated: false },
  resourcesNeverBelow: {},
});

type StoreState = {
  screen: UIScreen;
  game: GameState;
  showResolution: boolean;
  goToTabletop: () => void;
  selectObjective: (seat: number, tier: "primary" | "secondary", objectiveId: string) => void;
  confirmObjectives: (seat: number) => void;
  setupCity: (cityArchetypeId: string) => void;
  startGame: () => void;
  selectPrimaryAction: (seat: 0 | 1 | 2 | 3, actionId: string) => void;
  selectSupportAction: (seat: 0 | 1 | 2 | 3, actionId?: string) => void;
  toggleLock: (seat: 0 | 1 | 2 | 3) => void;
  resolveRoundNow: () => void;
  closeResolution: () => void;
  resetGame: () => void;
};

const roleOrder: RoleKey[] = ["government", "business", "community", "youth"];

const wildcardOrder = ["WC_01", "WC_04", "WC_07", "WC_08", "WC_03", "WC_10", "WC_09"];

const wildcardForRound = (round: number): string | undefined => {
  if (round < 2) {
    return undefined;
  }
  return wildcardOrder[(round - 2) % wildcardOrder.length];
};

const buildPlayers = (): PlayerState[] =>
  roleOrder.map((role, seat) => ({
    seat: seat as 0 | 1 | 2 | 3,
    role,
    activePanelRole: role,
    resources: {
      primary: startingResources[role].primary,
      secondary: startingResources[role].secondary,
    },
    lockedIn: false,
  }));

const applyRoleSwap = (players: PlayerState[], wildcardId?: string): void => {
  players.forEach((player) => {
    player.activePanelRole = player.role;
  });
  if (wildcardId === "WC_01") {
    players.forEach((player) => {
      player.activePanelRole = roleOrder[(player.seat + 1) % roleOrder.length];
    });
  }
  if (wildcardId === "WC_02") {
    players.forEach((player) => {
      player.activePanelRole =
        roleOrder[(player.seat + roleOrder.length - 1) % roleOrder.length];
    });
  }
};

const initialGameState = (): GameState => {
  const city = cityArchetypes[0];
  const players = buildPlayers();
  applyRoleSwap(players, undefined);

  return {
    cityArchetypeId: city.id,
    round: 1,
    phase: "intro",
    players,
    city: {
      indicators: structuredClone(city.indicators),
      friction: city.startingFriction,
      delayedEffectsQueue: [],
    },
    currentEventId: events[0]?.id,
    currentWildcardId: undefined,
    logs: [],
    timers: {},
    objectiveSelectingSeat: -1,
    selectedObjectives: {
      government: {},
      business: {},
      community: {},
      youth: {},
    },
    objectivesLocked: {
      government: false,
      business: false,
      community: false,
      youth: false,
    },
    verdicts: {},
    stats: createInitialStats(),
  };
};

const getPlayer = (players: PlayerState[], seat: 0 | 1 | 2 | 3): PlayerState | undefined =>
  players.find((player) => player.seat === seat);

const canAfford = (player: PlayerState, action?: ActionCard): boolean => {
  if (!action) return true;
  const costPrimary = action.costs.primary ?? 0;
  const costSecondary = action.costs.secondary ?? 0;
  return (
    player.resources.primary >= costPrimary &&
    player.resources.secondary >= costSecondary
  );
};

const registerObjectiveCondition = (
  stats: ObjectiveStats,
  condition: ObjectiveCondition,
): void => {
  if (condition.type === "combined") {
    condition.conditions.forEach((item) => registerObjectiveCondition(stats, item));
    return;
  }
  if (condition.type === "indicatorNeverBelow") {
    const tracker = stats.indicatorsNeverBelow[condition.key];
    tracker.below = Math.max(tracker.below, condition.min);
    return;
  }
  if (condition.type === "frictionMax") {
    stats.frictionNeverAbove.max = Math.min(stats.frictionNeverAbove.max, condition.max);
    return;
  }
  if (condition.type === "resourceMin") {
    const key = `${condition.key}_${condition.resourceType}`;
    const existing = stats.resourcesNeverBelow[key];
    stats.resourcesNeverBelow[key] = {
      min: Math.max(existing?.min ?? 0, condition.min),
      violated: existing?.violated ?? false,
    };
    return;
  }
};

const registerObjectiveTrackers = (game: GameState): void => {
  roleOrder.forEach((role) => {
    const selected = game.selectedObjectives[role];
    [selected.primary, selected.secondary].forEach((id) => {
      if (!id) return;
      const card = objectiveById(id);
      if (card) registerObjectiveCondition(game.stats, card.conditions);
    });
  });
};

const updateTrackerViolations = (game: GameState): void => {
  (Object.keys(game.city.indicators) as Array<keyof typeof game.city.indicators>).forEach((key) => {
    const tracker = game.stats.indicatorsNeverBelow[key];
    if (tracker && game.city.indicators[key] < tracker.below) {
      tracker.violated = true;
    }
  });
  if (game.city.friction > game.stats.frictionNeverAbove.max) {
    game.stats.frictionNeverAbove.violated = true;
  }
  game.players.forEach((player) => {
    (["primary", "secondary"] as const).forEach((resourceType) => {
      const key = `${player.role}_${resourceType}`;
      const tracker = game.stats.resourcesNeverBelow[key];
      if (tracker && player.resources[resourceType] < tracker.min) {
        tracker.violated = true;
      }
    });
  });
};

export const useGameStore = create<StoreState>((set, get) => ({
  screen: "attract",
  game: initialGameState(),
  showResolution: false,

  goToTabletop: () => {
    const game = initialGameState();
    game.objectiveSelectingSeat = -1;
    game.selectedObjectives = { government: {}, business: {}, community: {}, youth: {} };
    game.objectivesLocked = { government: false, business: false, community: false, youth: false };
    game.stats = createInitialStats();
    set({ screen: "tabletop", game, showResolution: false });
  },

  selectObjective: (seat, tier, objectiveId) => {
    const game = structuredClone(get().game);
    const role = roleOrder[seat];
    if (!role) return;
    game.selectedObjectives[role][tier] = objectiveId;
    set({ game });
  },

  confirmObjectives: (seat) => {
    const game = structuredClone(get().game);
    const role = roleOrder[seat];
    if (!role) return;
    const obj = game.selectedObjectives[role];
    if (!obj.primary) return;
    game.objectivesLocked[role] = true;
    registerObjectiveTrackers(game);
    updateTrackerViolations(game);
    set({ game });
  },

  setupCity: (cityArchetypeId) => {
    const city = cityArchetypes.find((item) => item.id === cityArchetypeId) ?? cityArchetypes[0];
    const players = buildPlayers();
    const wildcardId = wildcardForRound(1);
    applyRoleSwap(players, wildcardId);

    set({
      game: {
        ...get().game,
        cityArchetypeId: city.id,
        round: 1,
        phase: "decision",
        players,
        city: {
          indicators: structuredClone(city.indicators),
          friction: city.startingFriction,
          delayedEffectsQueue: [],
        },
        currentEventId: events[0]?.id,
        currentWildcardId: wildcardId,
        logs: [],
        timers: {},
        stats: createInitialStats(),
      },
      showResolution: false,
    });
    const nextGame = structuredClone(get().game);
    registerObjectiveTrackers(nextGame);
    updateTrackerViolations(nextGame);
    set({ game: nextGame });
  },

  startGame: () => {
    const state = get();
    const game = structuredClone(state.game);
    game.phase = "decision";
    set({ game });
  },

  selectPrimaryAction: (seat, actionId) => {
    const state = get();
    const game = structuredClone(state.game);
    const player = getPlayer(game.players, seat);
    if (!player) return;

    const action = actionById.get(actionId);
    if (!action || action.actionType !== "primary" || action.role !== player.activePanelRole) {
      return;
    }

    if (game.currentWildcardId === "WC_03" && player.role === "government") {
      if ((action.costs.primary ?? 0) > 1) return;
    }
    if (game.currentWildcardId === "WC_04" && player.role === "business") {
      if (!action.tags.includes("investment") && !action.tags.includes("clean-investment")) return;
    }
    if (!canAfford(player, action)) return;

    player.selectedPrimaryActionId = action.id;
    player.lockedIn = false;
    set({ game });
  },

  selectSupportAction: (seat, actionId) => {
    const state = get();
    const game = structuredClone(state.game);
    const player = getPlayer(game.players, seat);
    if (!player) return;

    if (!actionId) {
      player.selectedSupportActionId = undefined;
      player.lockedIn = false;
      set({ game });
      return;
    }

    const action = actionById.get(actionId);
    if (!action || action.actionType !== "support" || action.role !== player.activePanelRole) {
      return;
    }
    if (!canAfford(player, action)) return;

    player.selectedSupportActionId = action.id;
    player.lockedIn = false;
    set({ game });
  },

  toggleLock: (seat) => {
    const state = get();
    const game = structuredClone(state.game);
    const player = getPlayer(game.players, seat);
    if (!player || !player.selectedPrimaryActionId) return;
    player.lockedIn = !player.lockedIn;
    set({ game });
  },

  resolveRoundNow: () => {
    const state = get();
    if (!state.game.players.every((player) => player.lockedIn && player.selectedPrimaryActionId)) {
      return;
    }

    const resolved = resolveRound(state.game);
    if (resolved.phase !== "ending") {
      resolved.currentEventId = events[resolved.round - 1]?.id;
      resolved.currentWildcardId = wildcardForRound(resolved.round);
      applyRoleSwap(resolved.players, resolved.currentWildcardId);
    }

    set({
      game: resolved,
      showResolution: true,
      screen: "tabletop",
    });
  },

  closeResolution: () => {
    const state = get();
    if (state.game.phase === "ending") {
      set({ showResolution: false });
      return;
    }
    const game = structuredClone(state.game);
    game.phase = "decision";
    set({ showResolution: false, game });
  },

  resetGame: () =>
    set({
      screen: "attract",
      game: initialGameState(),
      showResolution: false,
    }),
}));

export const getEndingById = (endingId?: string) =>
  endings.find((ending) => ending.id === endingId);
