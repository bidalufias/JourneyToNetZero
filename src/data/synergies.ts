import type { SynergyRule } from "../types/gameTypes";

export const synergies: SynergyRule[] = [
  {
    id: "SYN_01",
    title: "Clean Mobility Push",
    requiredTags: ["transit", "fleet", "adoption", "clean-air"],
    minMatches: 3,
    effects: [
      { target: "emissions", amount: 2 },
      { target: "economy", amount: 1 },
      { target: "trust", amount: 1 },
    ],
  },
  {
    id: "SYN_02",
    title: "Just Transition Package",
    requiredTags: [
      "government-support",
      "skills or jobs",
      "community-equity or coalition",
    ],
    minMatches: 3,
    effects: [
      { target: "equity", amount: 2 },
      { target: "trust", amount: 1 },
      { target: "friction", amount: -1 },
    ],
  },
  {
    id: "SYN_03",
    title: "Green Growth Flywheel",
    requiredTags: [
      "industrial-policy",
      "clean-investment",
      "innovation or market narrative",
    ],
    minMatches: 3,
    effects: [
      { target: "economy", amount: 2 },
      { target: "emissions", amount: 1 },
    ],
  },
  {
    id: "SYN_04",
    title: "Resilience Alliance",
    requiredTags: [
      "adaptation",
      "local-resilience",
      "public-awareness or coalition",
    ],
    minMatches: 3,
    effects: [
      { target: "resilience", amount: 2 },
      { target: "trust", amount: 1 },
    ],
  },
  {
    id: "SYN_05",
    title: "Accountability Reset",
    requiredTags: [
      "scorecard or transparency",
      "public narrative or assembly",
      "cleaner business or government action",
    ],
    minMatches: 3,
    effects: [
      { target: "trust", amount: 2 },
      { target: "friction", amount: -1 },
    ],
  },
];
