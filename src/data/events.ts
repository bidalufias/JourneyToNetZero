import type { EventCard } from "../types/gameTypes";

export const events: EventCard[] = [
  {
    id: "EVT_01",
    round: 1,
    title: "Cost of Power",
    description:
      "Global energy prices are rising, and households are worried about bills while businesses warn about competitiveness.",
    tags: ["affordability", "energy"],
    baseEffects: [
      {
        target: "economy",
        amount: -1,
        condition: "if energySecurity <= 4",
        description: "If Energy Security is 4 or below, Economy -1.",
      },
    ],
  },
  {
    id: "EVT_02",
    round: 2,
    title: "Investor at the Gate",
    description:
      "A major investor is exploring a green manufacturing facility in the city, but they want policy certainty and local readiness.",
    tags: ["opportunity", "investment"],
    baseEffects: [
      {
        target: "economy",
        amount: 1,
        condition: "if government and business align",
        description: "If Government and Business align, Economy +1.",
      },
    ],
  },
  {
    id: "EVT_03",
    round: 3,
    title: "Who Pays?",
    description:
      "Citizens are beginning to ask who bears the cost of the transition. Support is softening in lower-income areas.",
    tags: ["social-tension", "equity"],
    baseEffects: [
      {
        target: "trust",
        amount: -1,
        condition: "if equity <= 4",
        description: "If Equity is 4 or below, Trust -1.",
      },
    ],
  },
  {
    id: "EVT_04",
    round: 4,
    title: "Heatwave Week",
    description:
      "A severe heatwave pushes up cooling demand, strains the grid, and affects public health.",
    tags: ["shock", "heatwave"],
    baseEffects: [
      {
        target: "trust",
        amount: -1,
        condition: "if resilience <= 4",
        description: "If Resilience is 4 or below, Trust -1.",
      },
      {
        target: "economy",
        amount: -1,
        condition: "if energySecurity <= 4",
        description: "If Energy Security is 4 or below, Economy -1.",
      },
    ],
  },
  {
    id: "EVT_05",
    round: 5,
    title: "Election Season",
    description:
      "Climate ambition becomes politically charged. Every move is watched and interpreted through a political lens.",
    tags: ["politics", "narrative"],
    baseEffects: [
      {
        target: "meta",
        key: "extraGovTrustPenalty",
        amount: 1,
        description:
          "Government actions with Trust penalties suffer an extra -1 Trust.",
      },
    ],
  },
  {
    id: "EVT_06",
    round: 6,
    title: "Flooding the Low District",
    description:
      "A heavy rainfall event overwhelms drainage in vulnerable neighborhoods and disrupts roads, commerce, and public confidence.",
    tags: ["shock", "flood"],
    baseEffects: [
      {
        target: "resilience",
        amount: -1,
        condition: "if resilience <= 4",
        description: "If Resilience is 4 or below, Resilience -1.",
      },
      {
        target: "economy",
        amount: -1,
        condition: "if resilience <= 4",
        description: "If Resilience is 4 or below, Economy -1.",
      },
    ],
  },
  {
    id: "EVT_07",
    round: 7,
    title: "New Market Demand",
    description:
      "Regional buyers are beginning to favor low-carbon products and climate-ready suppliers.",
    tags: ["future-economy", "market"],
    baseEffects: [
      {
        target: "economy",
        amount: 1,
        condition: "if emissions >= 6",
        description: "If Emissions is 6 or above, Economy +1.",
      },
      {
        target: "resource",
        key: "business.primary",
        amount: 1,
        condition: "if business confidence high",
        description:
          "If Business confidence is high, gain an additional investment bonus.",
      },
    ],
  },
  {
    id: "EVT_08",
    round: 8,
    title: "City at the Crossroads",
    description:
      "The city faces one final test. Investors, citizens, and future generations all expect proof that the transition is real, fair, and durable.",
    tags: ["endgame"],
    baseEffects: [
      {
        target: "meta",
        key: "endgameCrisisPenalty",
        amount: 1,
        condition: "if any 2 indicators are 3 or below",
        description: "If any 2 indicators are 3 or below, trigger endgame crisis penalty.",
      },
    ],
  },
];
