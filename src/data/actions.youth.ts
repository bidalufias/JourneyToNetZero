import type { ActionCard } from "../types/gameTypes";

export const youthActions: ActionCard[] = [
  {
    id: "YOU_01",
    role: "youth",
    title: "Climate March",
    description:
      "Cost Momentum 1, Pressure 1. Immediate Government Political Capital -1 internal, Emissions +1 if Government responds with ambitious action. Trade-off Business Confidence -1.",
    actionType: "primary",
    costs: { primary: 1, secondary: 1 },
    tags: ["pressure", "public-facing"],
    immediateEffects: [
      { target: "resource", key: "government.secondary", amount: -1 },
      {
        target: "emissions",
        amount: 1,
        condition: "if government responds with ambitious action",
      },
    ],
    tradeoffEffects: [{ target: "resource", key: "business.secondary", amount: -1 }],
  },
  {
    id: "YOU_02",
    role: "youth",
    title: "Public Education Campaign",
    description:
      "Cost Momentum 1, Pressure 0. Immediate Trust +1, Friction -1.",
    actionType: "primary",
    costs: { primary: 1, secondary: 0 },
    tags: ["public-awareness", "public-facing"],
    immediateEffects: [
      { target: "trust", amount: 1 },
      { target: "friction", amount: -1 },
    ],
    tradeoffEffects: [],
    synergyKeys: ["SYN_04", "SYN_05"],
  },
  {
    id: "YOU_03",
    role: "youth",
    title: "Policy Scorecard",
    description:
      "Cost Momentum 1, Pressure 1. Immediate Trust +1 if Government or Business chose a credible action, otherwise Public Pressure +1 internal bonus. Trade-off Business Confidence -1 if Business chose delay or pass-through.",
    actionType: "primary",
    costs: { primary: 1, secondary: 1 },
    tags: ["scorecard", "accountability"],
    immediateEffects: [
      {
        target: "trust",
        amount: 1,
        condition: "if government or business chose credible action",
      },
      {
        target: "resource",
        key: "youth.secondary",
        amount: 1,
        condition: "if no credible action",
      },
    ],
    tradeoffEffects: [
      {
        target: "resource",
        key: "business.secondary",
        amount: -1,
        condition: "if business chose delay or pass-through",
      },
    ],
    synergyKeys: ["SYN_05"],
  },
  {
    id: "YOU_04",
    role: "youth",
    title: "Expose Greenwashing",
    description:
      "Cost Momentum 1, Pressure 1. Immediate Trust +1 if Business chose a weak or delay action. Trade-off Business Confidence -1 regardless.",
    actionType: "primary",
    costs: { primary: 1, secondary: 1 },
    tags: ["accountability", "confrontation"],
    immediateEffects: [
      {
        target: "trust",
        amount: 1,
        condition: "if business chose weak or delay action",
      },
    ],
    tradeoffEffects: [{ target: "resource", key: "business.secondary", amount: -1 }],
  },
  {
    id: "YOU_05",
    role: "youth",
    title: "Green Jobs Narrative",
    description:
      "Cost Momentum 1, Pressure 0. Immediate Trust +1, Economy +1 if Business or Government chose growth-oriented clean action.",
    actionType: "primary",
    costs: { primary: 1, secondary: 0 },
    tags: ["jobs", "narrative", "public-facing"],
    immediateEffects: [
      { target: "trust", amount: 1 },
      {
        target: "economy",
        amount: 1,
        condition: "if business or government chose growth-oriented clean action",
      },
    ],
    tradeoffEffects: [],
    synergyKeys: ["SYN_03", "SYN_02"],
  },
  {
    id: "YOU_06",
    role: "youth",
    title: "Coalition with Communities",
    description:
      "Cost Momentum 1, Pressure 1. Immediate Equity +1, Trust +1 if Community chose a local action.",
    actionType: "primary",
    costs: { primary: 1, secondary: 1 },
    tags: ["coalition", "equity"],
    immediateEffects: [
      { target: "equity", amount: 1 },
      {
        target: "trust",
        amount: 1,
        condition: "if community chose a local action",
      },
    ],
    tradeoffEffects: [],
    synergyKeys: ["SYN_02", "SYN_04"],
  },
  {
    id: "YOU_07",
    role: "youth",
    title: "Push Stronger City Targets",
    description:
      "Cost Momentum 1, Pressure 2. Immediate Emissions +1 if Government or Business chose climate action. Trade-off Friction +1 if no climate-aligned Government or Business action selected.",
    actionType: "primary",
    costs: { primary: 1, secondary: 2 },
    tags: ["ambition", "pressure"],
    immediateEffects: [
      {
        target: "emissions",
        amount: 1,
        condition: "if government or business chose climate action",
      },
    ],
    tradeoffEffects: [
      {
        target: "friction",
        amount: 1,
        condition:
          "if no climate-aligned government or business action selected",
      },
    ],
  },
  {
    id: "YOU_08",
    role: "youth",
    title: "Join City Taskforce",
    description:
      "Cost Momentum 1, Pressure 0. Immediate next synergy this round or next round gains +1 Trust.",
    actionType: "primary",
    costs: { primary: 1, secondary: 0 },
    tags: ["coordination", "coalition"],
    immediateEffects: [{ target: "meta", key: "nextSynergyTrustBoost", amount: 1 }],
    tradeoffEffects: [],
  },
  {
    id: "YOU_09",
    role: "youth",
    title: "Youth Innovation Challenge",
    description:
      "Cost Momentum 1, Pressure 0. Immediate Trust +1. Delayed after 2 rounds Economy +1.",
    actionType: "primary",
    costs: { primary: 1, secondary: 0 },
    tags: ["innovation", "future"],
    immediateEffects: [{ target: "trust", amount: 1 }],
    tradeoffEffects: [],
    delayedEffects: [
      {
        id: "YOU_09_D1",
        sourceId: "YOU_09",
        triggerRound: 2,
        effects: [{ target: "economy", amount: 1 }],
      },
    ],
  },
  {
    id: "YOU_10",
    role: "youth",
    title: "Direct Action Escalation",
    description:
      "Cost Momentum 1, Pressure 2. Immediate if Government ignored climate and equity this round, Trust +1 among supportive publics and Public Pressure +1 internal bonus. Trade-off Business Confidence -2, Friction +1.",
    actionType: "primary",
    costs: { primary: 1, secondary: 2 },
    tags: ["confrontation", "pressure", "public-facing"],
    immediateEffects: [
      {
        target: "trust",
        amount: 1,
        condition: "if government ignored climate and equity this round",
      },
      {
        target: "resource",
        key: "youth.secondary",
        amount: 1,
        condition: "if government ignored climate and equity this round",
      },
    ],
    tradeoffEffects: [
      { target: "resource", key: "business.secondary", amount: -2 },
      { target: "friction", amount: 1 },
    ],
  },
];
