import type { ActionCard } from "../types/gameTypes";

export const communityActions: ActionCard[] = [
  {
    id: "COM_01",
    role: "community",
    title: "Community Solar Co-op",
    description:
      "Cost Cohesion 1, Capacity 1. Immediate Equity +1, Energy Security +1. Delayed after 1 round Trust +1.",
    actionType: "primary",
    costs: { primary: 1, secondary: 1 },
    tags: ["equity", "energy", "community", "community-equity"],
    immediateEffects: [
      { target: "equity", amount: 1 },
      { target: "energySecurity", amount: 1 },
    ],
    tradeoffEffects: [],
    delayedEffects: [
      {
        id: "COM_01_D1",
        sourceId: "COM_01",
        triggerRound: 1,
        effects: [{ target: "trust", amount: 1 }],
      },
    ],
  },
  {
    id: "COM_02",
    role: "community",
    title: "Home Efficiency Drive",
    description:
      "Cost Cohesion 1, Capacity 1. Immediate Energy Security +1, Equity +1. Gains reduced by 1 if no Government or Business support exists.",
    actionType: "primary",
    costs: { primary: 1, secondary: 1 },
    tags: ["efficiency", "household"],
    immediateEffects: [
      { target: "energySecurity", amount: 1 },
      { target: "equity", amount: 1 },
    ],
    tradeoffEffects: [
      {
        target: "meta",
        key: "reduceCom02GainsWithoutGovOrBusinessSupport",
        amount: 1,
      },
    ],
  },
  {
    id: "COM_03",
    role: "community",
    title: "Cooling Shelter Network",
    description:
      "Cost Cohesion 1, Capacity 1. Immediate Resilience +1, Trust +1 during heatwave rounds.",
    actionType: "primary",
    costs: { primary: 1, secondary: 1 },
    tags: ["adaptation", "local-resilience"],
    immediateEffects: [
      { target: "resilience", amount: 1 },
      { target: "trust", amount: 1, condition: "during heatwave rounds" },
    ],
    tradeoffEffects: [],
    synergyKeys: ["SYN_04"],
  },
  {
    id: "COM_04",
    role: "community",
    title: "Transit Adoption Campaign",
    description:
      "Cost Cohesion 1, Capacity 0. Immediate Trust +1 if Government or Business chose transit or fleet action.",
    actionType: "primary",
    costs: { primary: 1, secondary: 0 },
    tags: ["adoption", "transit"],
    immediateEffects: [
      {
        target: "trust",
        amount: 1,
        condition: "if government or business chose transit or fleet action",
      },
    ],
    tradeoffEffects: [],
    synergyKeys: ["SYN_01"],
  },
  {
    id: "COM_05",
    role: "community",
    title: "Neighborhood Retrofit Hub",
    description:
      "Cost Cohesion 1, Capacity 2. Immediate Equity +1. Delayed after 2 rounds Resilience +1, Energy Security +1.",
    actionType: "primary",
    costs: { primary: 1, secondary: 2 },
    tags: ["retrofit", "local-resilience"],
    immediateEffects: [{ target: "equity", amount: 1 }],
    tradeoffEffects: [],
    delayedEffects: [
      {
        id: "COM_05_D1",
        sourceId: "COM_05",
        triggerRound: 2,
        effects: [
          { target: "resilience", amount: 1 },
          { target: "energySecurity", amount: 1 },
        ],
      },
    ],
  },
  {
    id: "COM_06",
    role: "community",
    title: "Citizen Assembly",
    description:
      "Cost Cohesion 2, Capacity 0. Immediate Trust +1, Friction -1. Delayed after 1 round next Trust penalty reduced by 1.",
    actionType: "primary",
    costs: { primary: 2, secondary: 0 },
    tags: ["assembly", "public-awareness"],
    immediateEffects: [
      { target: "trust", amount: 1 },
      { target: "friction", amount: -1 },
    ],
    tradeoffEffects: [],
    delayedEffects: [
      {
        id: "COM_06_D1",
        sourceId: "COM_06",
        triggerRound: 1,
        effects: [{ target: "meta", key: "nextTrustPenaltyReduction", amount: 1 }],
      },
    ],
    synergyKeys: ["SYN_05"],
  },
  {
    id: "COM_07",
    role: "community",
    title: "Waste and Food Initiative",
    description:
      "Cost Cohesion 1, Capacity 1. Immediate Emissions +1, Trust +1.",
    actionType: "primary",
    costs: { primary: 1, secondary: 1 },
    tags: ["circular", "community"],
    immediateEffects: [
      { target: "emissions", amount: 1 },
      { target: "trust", amount: 1 },
    ],
    tradeoffEffects: [],
  },
  {
    id: "COM_08",
    role: "community",
    title: "Volunteer Resilience Teams",
    description:
      "Cost Cohesion 1, Capacity 1. Immediate Resilience +1. Delayed on next shock, cancel 1 Trust loss.",
    actionType: "primary",
    costs: { primary: 1, secondary: 1 },
    tags: ["local-resilience", "adaptation"],
    immediateEffects: [{ target: "resilience", amount: 1 }],
    tradeoffEffects: [],
    delayedEffects: [
      {
        id: "COM_08_D1",
        sourceId: "COM_08",
        triggerRound: 99,
        triggerOnShockTag: "shock",
        effects: [{ target: "meta", key: "cancelShockTrustLoss", amount: 1 }],
      },
    ],
    synergyKeys: ["SYN_04"],
  },
  {
    id: "COM_09",
    role: "community",
    title: "Support Compact Growth",
    description:
      "Cost Cohesion 1, Capacity 1. Immediate Resilience +1. Delayed after 2 rounds Emissions +1. Trade-off Trust -1 unless Public Narrative, Assembly, or Youth coalition support is present.",
    actionType: "primary",
    costs: { primary: 1, secondary: 1 },
    tags: ["urban-form", "transit"],
    immediateEffects: [{ target: "resilience", amount: 1 }],
    tradeoffEffects: [
      {
        target: "trust",
        amount: -1,
        condition:
          "unless public narrative, assembly, or youth coalition support present",
      },
    ],
    delayedEffects: [
      {
        id: "COM_09_D1",
        sourceId: "COM_09",
        triggerRound: 2,
        effects: [{ target: "emissions", amount: 1 }],
      },
    ],
  },
  {
    id: "COM_10",
    role: "community",
    title: "Resist Disruptive Development",
    description:
      "Cost Cohesion 1, Capacity 0. Immediate Equity +1, Trust +1 if a major industrial or infrastructure action was selected this round. Trade-off Economy -1 if opposing a Government or Business growth action without mediation support.",
    actionType: "primary",
    costs: { primary: 1, secondary: 0 },
    tags: ["protection", "local-legitimacy"],
    immediateEffects: [
      { target: "equity", amount: 1 },
      {
        target: "trust",
        amount: 1,
        condition:
          "if major industrial or infrastructure action selected this round",
      },
    ],
    tradeoffEffects: [
      {
        target: "economy",
        amount: -1,
        condition:
          "if opposing growth action without mediation support",
      },
    ],
  },
];
