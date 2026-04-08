import type { ActionCard } from "../types/gameTypes";

export const businessActions: ActionCard[] = [
  {
    id: "BUS_01",
    role: "business",
    title: "Clean Manufacturing Investment",
    description:
      "Cost Capital 2, Confidence 1. Delayed after 2 rounds Economy +2, Emissions +1.",
    actionType: "primary",
    costs: { primary: 2, secondary: 1 },
    tags: ["clean-investment", "manufacturing", "investment"],
    immediateEffects: [],
    tradeoffEffects: [],
    delayedEffects: [
      {
        id: "BUS_01_D1",
        sourceId: "BUS_01",
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
    id: "BUS_02",
    role: "business",
    title: "Rooftop Solar Rollout",
    description:
      "Cost Capital 2, Confidence 0. Immediate Energy Security +1, Emissions +1.",
    actionType: "primary",
    costs: { primary: 2, secondary: 0 },
    tags: ["clean-tech", "energy"],
    immediateEffects: [
      { target: "energySecurity", amount: 1 },
      { target: "emissions", amount: 1 },
    ],
    tradeoffEffects: [],
  },
  {
    id: "BUS_03",
    role: "business",
    title: "Fleet Electrification",
    description:
      "Cost Capital 2, Confidence 0. Immediate Emissions +1. Delayed after 1 round Economy +1.",
    actionType: "primary",
    costs: { primary: 2, secondary: 0 },
    tags: ["fleet", "decarbonisation"],
    immediateEffects: [{ target: "emissions", amount: 1 }],
    tradeoffEffects: [],
    delayedEffects: [
      {
        id: "BUS_03_D1",
        sourceId: "BUS_03",
        triggerRound: 1,
        effects: [{ target: "economy", amount: 1 }],
      },
    ],
    synergyKeys: ["SYN_01"],
  },
  {
    id: "BUS_04",
    role: "business",
    title: "Worker Reskilling Programme",
    description:
      "Cost Capital 1, Confidence 1. Immediate Equity +1. Delayed after 2 rounds Economy +1.",
    actionType: "primary",
    costs: { primary: 1, secondary: 1 },
    tags: ["skills", "jobs"],
    immediateEffects: [{ target: "equity", amount: 1 }],
    tradeoffEffects: [],
    delayedEffects: [
      {
        id: "BUS_04_D1",
        sourceId: "BUS_04",
        triggerRound: 2,
        effects: [{ target: "economy", amount: 1 }],
      },
    ],
    synergyKeys: ["SYN_02"],
  },
  {
    id: "BUS_05",
    role: "business",
    title: "Green Product Launch",
    description:
      "Cost Capital 1, Confidence 1. Immediate Economy +1. Trade-off Trust -1 if Trust is already 4 or below.",
    actionType: "primary",
    costs: { primary: 1, secondary: 1 },
    tags: ["innovation", "market"],
    immediateEffects: [{ target: "economy", amount: 1 }],
    tradeoffEffects: [
      { target: "trust", amount: -1, condition: "if trust <= 4" },
    ],
    synergyKeys: ["SYN_03"],
  },
  {
    id: "BUS_06",
    role: "business",
    title: "Circular Economy Upgrade",
    description:
      "Cost Capital 2, Confidence 0. Immediate Emissions +1, Resilience +1.",
    actionType: "primary",
    costs: { primary: 2, secondary: 0 },
    tags: ["circular", "resilience"],
    immediateEffects: [
      { target: "emissions", amount: 1 },
      { target: "resilience", amount: 1 },
    ],
    tradeoffEffects: [],
  },
  {
    id: "BUS_07",
    role: "business",
    title: "Supply Chain Transparency",
    description:
      "Cost Capital 1, Confidence 1. Immediate Trust +1, Confidence +1 internal bonus.",
    actionType: "primary",
    costs: { primary: 1, secondary: 1 },
    tags: ["transparency", "accountability", "cleaner-action"],
    immediateEffects: [
      { target: "trust", amount: 1 },
      { target: "resource", key: "business.secondary", amount: 1 },
    ],
    tradeoffEffects: [],
    synergyKeys: ["SYN_05"],
  },
  {
    id: "BUS_08",
    role: "business",
    title: "Public-Private Partnership",
    description:
      "Cost Capital 1, Confidence 1. Immediate if Government chose an infrastructure or industrial action, Economy +1. Weak alone.",
    actionType: "primary",
    costs: { primary: 1, secondary: 1 },
    tags: ["partnership"],
    immediateEffects: [
      {
        target: "economy",
        amount: 1,
        condition: "if government chose infrastructure or industrial action",
      },
    ],
    tradeoffEffects: [],
  },
  {
    id: "BUS_09",
    role: "business",
    title: "Pass Through Costs",
    description:
      "Cost Capital 0, Confidence 0. Immediate Economy +1, Confidence +1 internal bonus. Trade-off Trust -1, Equity -1, Friction +1 unless Community or Government cushioning is present.",
    actionType: "primary",
    costs: { primary: 0, secondary: 0 },
    tags: ["pricing", "affordability-risk", "weak-climate-action"],
    immediateEffects: [
      { target: "economy", amount: 1 },
      { target: "resource", key: "business.secondary", amount: 1 },
    ],
    tradeoffEffects: [
      {
        target: "trust",
        amount: -1,
        condition: "unless community or government cushioning present",
      },
      {
        target: "equity",
        amount: -1,
        condition: "unless community or government cushioning present",
      },
      {
        target: "friction",
        amount: 1,
        condition: "unless community or government cushioning present",
      },
    ],
  },
  {
    id: "BUS_10",
    role: "business",
    title: "Delay Compliance",
    description:
      "Cost Capital 0, Confidence 0. Immediate Economy +1. Trade-off Emissions -1, Trust -1, Friction +1.",
    actionType: "primary",
    costs: { primary: 0, secondary: 0 },
    tags: ["delay", "polluting", "weak-climate-action"],
    immediateEffects: [{ target: "economy", amount: 1 }],
    tradeoffEffects: [
      { target: "emissions", amount: -1 },
      { target: "trust", amount: -1 },
      { target: "friction", amount: 1 },
    ],
  },
];
