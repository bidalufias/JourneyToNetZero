import type { ActionCard } from "../types/gameTypes";

export const governmentActions: ActionCard[] = [
  {
    id: "GOV_01",
    role: "government",
    title: "Transit Expansion",
    description:
      "Cost Budget 2, Political Capital 1. Immediate Resilience +1, Emissions +1. Trade-off Economy -1 this round.",
    actionType: "primary",
    costs: { primary: 2, secondary: 1 },
    tags: ["transit", "infrastructure"],
    immediateEffects: [
      { target: "resilience", amount: 1 },
      { target: "emissions", amount: 1 },
    ],
    tradeoffEffects: [{ target: "economy", amount: -1 }],
    synergyKeys: ["SYN_01"],
  },
  {
    id: "GOV_02",
    role: "government",
    title: "Carbon Pricing",
    description:
      "Cost Budget 0, Political Capital 2. Immediate Emissions +2. Trade-off Trust -1, Economy -1 unless Just Transition Package active.",
    actionType: "primary",
    costs: { primary: 0, secondary: 2 },
    tags: ["pricing", "decarbonisation"],
    immediateEffects: [{ target: "emissions", amount: 2 }],
    tradeoffEffects: [
      { target: "trust", amount: -1 },
      {
        target: "economy",
        amount: -1,
        condition: "unless synergy SYN_02 triggered",
      },
    ],
    synergyKeys: ["SYN_02"],
  },
  {
    id: "GOV_03",
    role: "government",
    title: "Just Transition Fund",
    description:
      "Cost Budget 2, Political Capital 1. Immediate Equity +2, Trust +1.",
    actionType: "primary",
    costs: { primary: 2, secondary: 1 },
    tags: ["government-support", "equity"],
    immediateEffects: [
      { target: "equity", amount: 2 },
      { target: "trust", amount: 1 },
    ],
    tradeoffEffects: [],
    synergyKeys: ["SYN_02"],
  },
  {
    id: "GOV_04",
    role: "government",
    title: "Grid Modernisation",
    description:
      "Cost Budget 2, Political Capital 1. Immediate Energy Security +1. Delayed after 2 rounds Emissions +1, Resilience +1. Trade-off Economy -1 this round.",
    actionType: "primary",
    costs: { primary: 2, secondary: 1 },
    tags: ["grid", "infrastructure", "clean-tech"],
    immediateEffects: [{ target: "energySecurity", amount: 1 }],
    tradeoffEffects: [{ target: "economy", amount: -1 }],
    delayedEffects: [
      {
        id: "GOV_04_D1",
        sourceId: "GOV_04",
        triggerRound: 2,
        effects: [
          { target: "emissions", amount: 1 },
          { target: "resilience", amount: 1 },
        ],
      },
    ],
  },
  {
    id: "GOV_05",
    role: "government",
    title: "Green Industrial Zone",
    description:
      "Cost Budget 2, Political Capital 1. Delayed after 2 rounds Economy +2, Emissions +1. Trade-off Trust -1 unless Business or Community support is present.",
    actionType: "primary",
    costs: { primary: 2, secondary: 1 },
    tags: ["industrial-policy", "growth"],
    immediateEffects: [],
    tradeoffEffects: [
      {
        target: "trust",
        amount: -1,
        condition: "unless business or community support present",
      },
    ],
    delayedEffects: [
      {
        id: "GOV_05_D1",
        sourceId: "GOV_05",
        triggerRound: 2,
        effects: [
          { target: "economy", amount: 2 },
          { target: "emissions", amount: 1 },
        ],
      },
    ],
    synergyKeys: ["SYN_03"],
  },
  {
    id: "GOV_06",
    role: "government",
    title: "Building Efficiency Standards",
    description:
      "Cost Budget 0, Political Capital 2. Immediate Emissions +1, Energy Security +1. Trade-off Business Confidence -1 unless Business chose transparency, innovation, or partnership action.",
    actionType: "primary",
    costs: { primary: 0, secondary: 2 },
    tags: ["efficiency", "regulation"],
    immediateEffects: [
      { target: "emissions", amount: 1 },
      { target: "energySecurity", amount: 1 },
    ],
    tradeoffEffects: [
      {
        target: "resource",
        key: "business.secondary",
        amount: -1,
        condition:
          "unless business selected transparency, innovation, or partnership action",
      },
    ],
  },
  {
    id: "GOV_07",
    role: "government",
    title: "Nature-Based Flood Buffer",
    description:
      "Cost Budget 2, Political Capital 1. Immediate Resilience +1. Delayed on next flood or heat shock, cancel 1 penalty.",
    actionType: "primary",
    costs: { primary: 2, secondary: 1 },
    tags: ["adaptation", "nature"],
    immediateEffects: [{ target: "resilience", amount: 1 }],
    tradeoffEffects: [],
    delayedEffects: [
      {
        id: "GOV_07_D1",
        sourceId: "GOV_07",
        triggerRound: 99,
        triggerOnShockTag: "shock",
        effects: [{ target: "meta", key: "cancelShockPenalty", amount: 1 }],
      },
    ],
    synergyKeys: ["SYN_04"],
  },
  {
    id: "GOV_08",
    role: "government",
    title: "Public Retrofit Grants",
    description:
      "Cost Budget 2, Political Capital 0. Immediate Equity +1, Energy Security +1, Emissions +1.",
    actionType: "primary",
    costs: { primary: 2, secondary: 0 },
    tags: ["equity", "efficiency", "buildings"],
    immediateEffects: [
      { target: "equity", amount: 1 },
      { target: "energySecurity", amount: 1 },
      { target: "emissions", amount: 1 },
    ],
    tradeoffEffects: [],
  },
  {
    id: "GOV_09",
    role: "government",
    title: "Clean Procurement Rules",
    description:
      "Cost Budget 1, Political Capital 1. Immediate Emissions +1, Economy +1 if Business chose investment-related action. Trade-off next Budget gain skipped once.",
    actionType: "primary",
    costs: { primary: 1, secondary: 1 },
    tags: ["procurement", "clean-tech"],
    immediateEffects: [
      { target: "emissions", amount: 1 },
      {
        target: "economy",
        amount: 1,
        condition: "if business chose investment-related action",
      },
    ],
    tradeoffEffects: [{ target: "meta", key: "skipNextGovernmentBudgetGain", amount: 1 }],
  },
  {
    id: "GOV_10",
    role: "government",
    title: "Public Narrative Campaign",
    description:
      "Cost Budget 1, Political Capital 1. Immediate Trust +1, Friction -1.",
    actionType: "primary",
    costs: { primary: 1, secondary: 1 },
    tags: ["communication", "public-awareness", "public-narrative"],
    immediateEffects: [
      { target: "trust", amount: 1 },
      { target: "friction", amount: -1 },
    ],
    tradeoffEffects: [],
    synergyKeys: ["SYN_04", "SYN_05"],
  },
];
