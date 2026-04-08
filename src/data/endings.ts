import type { GameState } from "../types/gameTypes";

export type EndingDefinition = {
  id: string;
  title: string;
  narrative: string;
  matches: (state: GameState) => boolean;
};

const indicatorAtMost = (
  state: GameState,
  threshold: number,
): number =>
  Object.values(state.city.indicators).filter((value) => value <= threshold).length;

export const endings: EndingDefinition[] = [
  {
    id: "green-flourishing-city",
    title: "Green Flourishing City",
    narrative:
      "The city proved climate action can drive prosperity, fairness, and resilience together.",
    matches: (state) =>
      state.city.indicators.economy >= 7 &&
      state.city.indicators.emissions >= 7 &&
      state.city.indicators.resilience >= 6 &&
      state.city.indicators.equity >= 5 &&
      state.city.indicators.trust >= 5 &&
      state.city.friction <= 2,
  },
  {
    id: "uneven-transition",
    title: "Uneven Transition",
    narrative:
      "Economic momentum and cleaner systems improved, but trust or fairness was left behind.",
    matches: (state) =>
      state.city.indicators.economy >= 7 &&
      state.city.indicators.emissions >= 6 &&
      (state.city.indicators.equity <= 4 || state.city.indicators.trust <= 4),
  },
  {
    id: "prosperous-but-polluting",
    title: "Prosperous but Polluting",
    narrative:
      "The city grew wealthier, but emissions performance lagged and future risks accumulated.",
    matches: (state) =>
      state.city.indicators.economy >= 7 &&
      state.city.indicators.emissions <= 5,
  },
  {
    id: "fair-but-stalled",
    title: "Fair but Stalled",
    narrative:
      "The transition stayed socially grounded, but climate and economic progress stalled.",
    matches: (state) =>
      state.city.indicators.equity >= 6 &&
      state.city.indicators.trust >= 6 &&
      (state.city.indicators.economy <= 5 ||
        state.city.indicators.emissions <= 5),
  },
  {
    id: "resilient-recovery",
    title: "Resilient Recovery",
    narrative:
      "The city absorbed shocks and stayed standing, building a durable base for the next phase.",
    matches: (state) =>
      state.city.indicators.resilience >= 7 &&
      indicatorAtMost(state, 3) < 2 &&
      state.city.indicators.economy >= 5 &&
      state.city.indicators.trust >= 4,
  },
  {
    id: "crisis-and-backlash",
    title: "Crisis and Backlash",
    narrative:
      "Compounding stress, low trust, and instability undermined the transition.",
    matches: (state) =>
      indicatorAtMost(state, 3) >= 2 ||
      (state.city.friction === 5 && state.city.indicators.trust <= 3),
  },
  {
    id: "managed-transition",
    title: "Managed Transition",
    narrative:
      "The city made mixed but real progress, balancing trade-offs without full breakthrough or collapse.",
    matches: () => true,
  },
];
