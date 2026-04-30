import type { EventCard } from "../types/gameTypes";

export const events: EventCard[] = [
  {
    id: "EVT_01",
    round: 1,
    title: "TNB Bill Shock",
    description:
      "Electricity costs dominate kopitiam talk and WhatsApp groups. Households worry about bills while factories warn that higher tariffs could hurt Malaysia's export edge.",
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
    title: "CBAM Deadline Letter",
    description:
      "European buyers ask Malaysian exporters for verified carbon data. Steel, aluminium, cement, electronics, and supplier SMEs suddenly face a paperwork-and-carbon test.",
    tags: ["cbam", "export", "market"],
    baseEffects: [
      {
        target: "economy",
        amount: -1,
        condition: "if emissions <= 4",
        description: "If Clean Air is 4 or below, Economy -1 as export risk rises.",
      },
      {
        target: "resource",
        key: "business.secondary",
        amount: -1,
        condition: "if business confidence high",
        description: "If Business confidence is high, the compliance scramble still costs confidence.",
      },
    ],
  },
  {
    id: "EVT_03",
    round: 3,
    title: "El Nino Heat and Drought",
    description:
      "Heat sits over the city for days. Clinics see heat stress, schools shorten outdoor activities, and water managers warn that the reservoirs are falling.",
    tags: ["shock", "heatwave", "el-nino", "water-stress"],
    baseEffects: [
      {
        target: "trust",
        amount: -1,
        condition: "if resilience <= 4",
        description: "If Resilience is 4 or below, Trust -1.",
      },
      {
        target: "energySecurity",
        amount: -1,
        condition: "if energySecurity <= 5",
        description: "If Energy Security is 5 or below, cooling demand strains the system.",
      },
    ],
  },
  {
    id: "EVT_04",
    round: 4,
    title: "Transboundary Haze Alert",
    description:
      "Satellite hotspots multiply and the haze forecast turns ugly. Parents check school notices, clinics prepare inhalers, and the city argues over diplomacy, enforcement, and blame.",
    tags: ["shock", "haze", "health", "asean"],
    baseEffects: [
      {
        target: "trust",
        amount: -1,
        condition: "if resilience <= 5",
        description: "If Resilience is 5 or below, Trust -1.",
      },
      {
        target: "resilience",
        amount: -1,
        condition: "if trust <= 4",
        description: "If Trust is 4 or below, the public response fragments.",
      },
    ],
  },
  {
    id: "EVT_05",
    round: 5,
    title: "Oil Price Shock",
    description:
      "Global crude prices spike after a supply disruption. Petrol anxiety returns, logistics costs rise, and the old debate over subsidies versus reform comes roaring back.",
    tags: ["shock", "oil-shock", "affordability", "energy"],
    baseEffects: [
      {
        target: "economy",
        amount: -1,
        condition: "if energySecurity <= 5",
        description: "If Energy Security is 5 or below, Economy -1.",
      },
      {
        target: "trust",
        amount: -1,
        condition: "if equity <= 4",
        description: "If Equity is 4 or below, Trust -1.",
      },
    ],
  },
  {
    id: "EVT_06",
    round: 6,
    title: "Water Stress in the Klang Basin",
    description:
      "A dry spell and river pollution force rationing warnings. Factories, hospitals, hawkers, apartments, and kampungs all ask who gets priority.",
    tags: ["shock", "water-stress", "health", "equity"],
    baseEffects: [
      {
        target: "economy",
        amount: -1,
        condition: "if resilience <= 5",
        description: "If Resilience is 5 or below, Economy -1.",
      },
      {
        target: "equity",
        amount: -1,
        condition: "if trust <= 5",
        description: "If Trust is 5 or below, Equity -1 as rationing feels unfair.",
      },
    ],
  },
  {
    id: "EVT_07",
    round: 7,
    title: "Banjir in the Low District",
    description:
      "Intense monsoon rain overwhelms drains in low-lying neighborhoods, disrupting roads, hawker income, school runs, and public confidence.",
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
    id: "EVT_08",
    round: 8,
    title: "Data Centre Power Scramble",
    description:
      "A wave of AI and cloud investors wants land, power, and water. The city sees jobs and tax revenue, but residents ask whether the grid and rivers can cope.",
    tags: ["data-centre", "energy", "investment", "water-stress"],
    baseEffects: [
      {
        target: "economy",
        amount: 1,
        condition: "if energySecurity >= 6",
        description: "If Energy Security is 6 or above, Economy +1 from investor confidence.",
      },
      {
        target: "energySecurity",
        amount: -1,
        condition: "if energySecurity <= 5",
        description: "If Energy Security is 5 or below, Energy Security -1.",
      },
    ],
  },
  {
    id: "EVT_09",
    round: 9,
    title: "Green Investor at the Gate",
    description:
      "A regional clean manufacturing investor is studying Malaysia for a new facility, but they want policy certainty, skilled workers, and credible local suppliers.",
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
    id: "EVT_10",
    round: 10,
    title: "Siapa Bayar?",
    description:
      "Residents in flats, kampungs, and terrace neighborhoods are asking who pays for the transition. Support softens where people fear another cost passed down to them.",
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
    id: "EVT_11",
    round: 11,
    title: "Pilihan Raya Season",
    description:
      "Climate ambition becomes campaign material. Every tariff, permit, subsidy, and protest is clipped, shared, and interpreted through a political lens.",
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
    id: "EVT_12",
    round: 12,
    title: "Malaysia at the Crossroads",
    description:
      "The city faces one final test. Investors, rakyat, and future generations all expect proof that the transition is real, fair, and durable.",
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
