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
    title: "Green Malaysia City",
    narrative:
      "The city proved that Malaysian climate action can drive prosperity, fairness, and resilience together.",
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
      "Cleaner systems and investment momentum arrived, but some communities felt the benefits passed them by.",
    matches: (state) =>
      state.city.indicators.economy >= 7 &&
      state.city.indicators.emissions >= 6 &&
      (state.city.indicators.equity <= 4 || state.city.indicators.trust <= 4),
  },
  {
    id: "prosperous-but-polluting",
    title: "Prosperous but Polluting",
    narrative:
      "The city protected growth and jobs, but emissions performance lagged and future climate risks kept accumulating.",
    matches: (state) =>
      state.city.indicators.economy >= 7 &&
      state.city.indicators.emissions <= 5,
  },
  {
    id: "fair-but-stalled",
    title: "Fair but Stalled",
    narrative:
      "The transition stayed socially grounded, but climate delivery and economic confidence stalled.",
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
      "The city absorbed heat, floods, and public pressure, building a durable base for Malaysia's next phase.",
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
      "Compounding stress, low trust, and political backlash undermined the transition before it could take root.",
    matches: (state) =>
      indicatorAtMost(state, 3) >= 2 ||
      (state.city.friction === 5 && state.city.indicators.trust <= 3),
  },
  {
    id: "managed-transition",
    title: "Managed Transition",
    narrative:
      "The city made mixed but real progress, balancing Malaysian trade-offs without full breakthrough or collapse.",
    matches: () => true,
  },
];
