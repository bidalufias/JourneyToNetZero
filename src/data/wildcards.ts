import type { WildcardCard } from "../types/gameTypes";

export const wildcards: WildcardCard[] = [
  {
    id: "WC_01",
    title: "Swap Left",
    description:
      "All players use the role panel to their left for this round. Players keep their own resource pools.",
    type: "roleSwap",
    tags: ["swap-left"],
    effects: [{ target: "meta", key: "swapLeft", amount: 1 }],
  },
  {
    id: "WC_02",
    title: "Swap Right",
    description:
      "All players use the role panel to their right for this round. Players keep their own resource pools.",
    type: "roleSwap",
    tags: ["swap-right"],
    effects: [{ target: "meta", key: "swapRight", amount: 1 }],
  },
  {
    id: "WC_03",
    title: "Budget Freeze",
    description: "Government may not spend more than 1 Budget this round.",
    type: "resource",
    tags: ["government", "budget-cap"],
    effects: [{ target: "meta", key: "governmentBudgetSpendCap", amount: 1 }],
  },
  {
    id: "WC_04",
    title: "Investor Rush",
    description:
      "Business gains +2 Capital this round, but must choose an investment-tagged action.",
    type: "resource",
    tags: ["business", "investment"],
    effects: [
      { target: "resource", key: "business.primary", amount: 2 },
      { target: "meta", key: "businessMustChooseInvestmentTag", amount: 1 },
    ],
  },
  {
    id: "WC_05",
    title: "No Time to Talk",
    description: "Discussion time is cut in half.",
    type: "coordination",
    tags: ["timer"],
    effects: [{ target: "meta", key: "discussionHalved", amount: 1 }],
  },
  {
    id: "WC_06",
    title: "Global Spotlight",
    description: "All Trust gains and losses are doubled this round.",
    type: "narrative",
    tags: ["trust-multiplier"],
    effects: [{ target: "meta", key: "doubleTrust", amount: 1 }],
  },
  {
    id: "WC_07",
    title: "Clean Tech Breakthrough",
    description:
      "Any action with a clean-tech or decarbonisation tag gains +1 Emissions improvement.",
    type: "system",
    tags: ["clean-tech", "decarbonisation"],
    effects: [{ target: "meta", key: "cleanTechBonus", amount: 1 }],
  },
  {
    id: "WC_08",
    title: "Election Fever",
    description:
      "Government actions with a Trust penalty suffer an extra -1 Trust this round.",
    type: "narrative",
    tags: ["government", "trust-penalty"],
    effects: [{ target: "meta", key: "extraGovTrustPenalty", amount: 1 }],
  },
  {
    id: "WC_09",
    title: "Volunteer Surge",
    description: "Community gains +2 Local Capacity this round.",
    type: "resource",
    tags: ["community", "capacity"],
    effects: [{ target: "resource", key: "community.secondary", amount: 2 }],
  },
  {
    id: "WC_10",
    title: "Youth Strike Week",
    description:
      "Youth Activist confrontational actions gain +1 pressure effect, but Business Confidence losses are also +1.",
    type: "narrative",
    tags: ["youth", "confrontation"],
    effects: [
      { target: "meta", key: "youthConfrontationalPressureBoost", amount: 1 },
      { target: "meta", key: "extraBusinessConfidenceLoss", amount: 1 },
    ],
  },
];
