import type { ActionCard, RoleKey } from "../types/gameTypes";

const scenario = (
  eventId: string,
  role: RoleKey,
  id: string,
  title: string,
  description: string,
  costs: ActionCard["costs"],
  tags: string[],
  immediateEffects: ActionCard["immediateEffects"],
  tradeoffEffects: ActionCard["tradeoffEffects"],
): ActionCard => ({
  id,
  eventId,
  role,
  title,
  description,
  actionType: "primary",
  costs,
  tags: ["scenario-response", `scenario-${eventId.toLowerCase()}`, ...tags],
  immediateEffects,
  tradeoffEffects,
});

export const scenarioResponseActions: ActionCard[] = [
  scenario("EVT_01", "government", "SCN_01_GOV", "Targeted Lifeline Tariff Rebate", "Shield B40 households and small traders from the first tariff shock while keeping efficiency signals for high users.", { primary: 1, secondary: 1 }, ["affordability", "equity", "energy"], [{ target: "trust", amount: 1 }, { target: "equity", amount: 1 }], [{ target: "economy", amount: -1 }]),
  scenario("EVT_01", "business", "SCN_01_BUS", "Offer Peak-Hour Demand Cuts", "Factories and malls shift load away from expensive peak hours instead of simply passing the bill downstream.", { primary: 1, secondary: 1 }, ["efficiency", "energy", "partnership"], [{ target: "energySecurity", amount: 1 }, { target: "economy", amount: 1 }], [{ target: "resource", key: "business.primary", amount: -1 }]),
  scenario("EVT_01", "community", "SCN_01_COM", "Run Bill-Clinic Sessions in Flats", "Resident groups help households understand tariffs, faulty appliances, and relief applications.", { primary: 1, secondary: 0 }, ["household", "equity", "public-awareness"], [{ target: "equity", amount: 1 }, { target: "trust", amount: 1 }], [{ target: "friction", amount: 1 }]),
  scenario("EVT_01", "youth", "SCN_01_YOU", "Publish a Fair Tariff Explainer", "Young communicators turn a technical tariff debate into a clear story about waste, fairness, and protection.", { primary: 1, secondary: 0 }, ["public-facing", "public-awareness"], [{ target: "trust", amount: 1 }, { target: "friction", amount: -1 }], []),

  scenario("EVT_02", "government", "SCN_02_GOV", "Create a CBAM Helpdesk for Exporters", "Set up a fast carbon reporting and verification desk before EU buyers start asking for paperwork.", { primary: 1, secondary: 1 }, ["cbam", "export", "decarbonisation"], [{ target: "economy", amount: 1 }, { target: "emissions", amount: 1 }], [{ target: "resource", key: "government.primary", amount: -1 }]),
  scenario("EVT_02", "business", "SCN_02_BUS", "Audit Steel and Electronics Supply Chains", "Trace embedded carbon in export products so firms can defend contracts under CBAM-style rules.", { primary: 2, secondary: 1 }, ["cbam", "transparency", "manufacturing"], [{ target: "economy", amount: 1 }, { target: "emissions", amount: 1 }, { target: "trust", amount: 1 }], [{ target: "resource", key: "business.secondary", amount: -1 }]),
  scenario("EVT_02", "community", "SCN_02_COM", "Protect Supplier Workers During Upgrades", "Make sure SME suppliers and workers are not squeezed by sudden compliance costs.", { primary: 1, secondary: 1 }, ["equity", "jobs", "supplier-support"], [{ target: "equity", amount: 2 }], [{ target: "economy", amount: -1 }]),
  scenario("EVT_02", "youth", "SCN_02_YOU", "Demand Public Carbon Labels", "Pressure exporters to publish product carbon data in language buyers and workers can understand.", { primary: 1, secondary: 1 }, ["scorecard", "accountability", "cbam"], [{ target: "trust", amount: 1 }, { target: "emissions", amount: 1 }], [{ target: "resource", key: "business.secondary", amount: -1 }]),

  scenario("EVT_03", "government", "SCN_03_GOV", "Activate El Nino Heat Protocol", "Coordinate schools, clinics, employers, and utilities around heat alerts and drought warnings.", { primary: 1, secondary: 1 }, ["heatwave", "adaptation", "coordination"], [{ target: "resilience", amount: 2 }, { target: "trust", amount: 1 }], [{ target: "energySecurity", amount: -1 }]),
  scenario("EVT_03", "business", "SCN_03_BUS", "Shift Work Hours for Outdoor Crews", "Construction, logistics, and plantation-linked firms protect workers from dangerous heat peaks.", { primary: 1, secondary: 1 }, ["heatwave", "jobs", "equity"], [{ target: "equity", amount: 1 }, { target: "resilience", amount: 1 }], [{ target: "economy", amount: -1 }]),
  scenario("EVT_03", "community", "SCN_03_COM", "Open Surau and Dewan Cooling Points", "Local leaders organize shaded rest, water access, and checks on elderly residents.", { primary: 1, secondary: 1 }, ["heatwave", "local-resilience", "equity"], [{ target: "resilience", amount: 1 }, { target: "trust", amount: 1 }], [{ target: "resource", key: "community.primary", amount: -1 }]),
  scenario("EVT_03", "youth", "SCN_03_YOU", "Map Heat Risk Street by Street", "Students and young professionals crowdsource hotspot data for clinics, schools, and councils.", { primary: 1, secondary: 0 }, ["heatwave", "data", "public-facing"], [{ target: "resilience", amount: 1 }, { target: "trust", amount: 1 }], []),

  scenario("EVT_04", "government", "SCN_04_GOV", "Convene ASEAN Haze Diplomacy", "Call an urgent diplomatic meeting with ASEAN counterparts while enforcing domestic burning controls.", { primary: 1, secondary: 2 }, ["haze", "diplomacy", "regulation"], [{ target: "trust", amount: 1 }, { target: "resilience", amount: 1 }], [{ target: "friction", amount: 1 }]),
  scenario("EVT_04", "business", "SCN_04_BUS", "Publish No-Burn Supplier Contracts", "Palm, paper, and logistics buyers suspend opaque suppliers and reward verified no-burn practices.", { primary: 1, secondary: 1 }, ["haze", "transparency", "accountability"], [{ target: "emissions", amount: 1 }, { target: "trust", amount: 1 }], [{ target: "economy", amount: -1 }]),
  scenario("EVT_04", "community", "SCN_04_COM", "Set Up Mask and Air-Room Distribution", "Resident networks prioritize children, outdoor workers, and asthma patients as air quality worsens.", { primary: 1, secondary: 1 }, ["haze", "health", "equity"], [{ target: "equity", amount: 1 }, { target: "resilience", amount: 1 }], [{ target: "resource", key: "community.secondary", amount: -1 }]),
  scenario("EVT_04", "youth", "SCN_04_YOU", "Track Hotspots and Name the Delay", "Youth groups translate satellite hotspot data into public pressure for faster action.", { primary: 1, secondary: 1 }, ["haze", "accountability", "confrontation"], [{ target: "trust", amount: 1 }, { target: "emissions", amount: 1 }], [{ target: "friction", amount: 1 }]),

  scenario("EVT_05", "government", "SCN_05_GOV", "Release Strategic Fuel Reserves Carefully", "Use reserves and targeted public transport support to soften the oil price shock without hiding the long-term signal.", { primary: 1, secondary: 1 }, ["oil-shock", "affordability", "energy"], [{ target: "energySecurity", amount: 1 }, { target: "trust", amount: 1 }], [{ target: "emissions", amount: -1 }]),
  scenario("EVT_05", "business", "SCN_05_BUS", "Accelerate Route and Fleet Efficiency", "Hauliers, e-commerce fleets, and port operators cut fuel exposure through routing, pooling, and electrification pilots.", { primary: 1, secondary: 1 }, ["oil-shock", "fleet", "efficiency"], [{ target: "economy", amount: 1 }, { target: "emissions", amount: 1 }], [{ target: "resource", key: "business.primary", amount: -1 }]),
  scenario("EVT_05", "community", "SCN_05_COM", "Coordinate Carpool and Feeder Routes", "Neighborhoods organize school, factory, and market trips to reduce household fuel stress.", { primary: 1, secondary: 0 }, ["oil-shock", "transit", "equity"], [{ target: "equity", amount: 1 }, { target: "energySecurity", amount: 1 }], [{ target: "friction", amount: 1 }]),
  scenario("EVT_05", "youth", "SCN_05_YOU", "Campaign for Cheaper Public Transport", "Make buses, rail feeders, and safe cycling the emotional answer to petrol anxiety.", { primary: 1, secondary: 1 }, ["oil-shock", "public-facing", "transit"], [{ target: "trust", amount: 1 }, { target: "emissions", amount: 1 }], [{ target: "resource", key: "government.secondary", amount: -1 }]),

  scenario("EVT_06", "government", "SCN_06_GOV", "Impose Drought Water Rationing Rules", "Prioritize households, clinics, and food services while forcing large users to publish savings plans.", { primary: 1, secondary: 2 }, ["water-stress", "regulation", "equity"], [{ target: "resilience", amount: 2 }, { target: "equity", amount: 1 }], [{ target: "economy", amount: -1 }, { target: "friction", amount: 1 }]),
  scenario("EVT_06", "business", "SCN_06_BUS", "Recycle Process Water at Factories", "Major users invest in reuse systems so production can continue under rationing.", { primary: 2, secondary: 0 }, ["water-stress", "clean-tech", "resilience"], [{ target: "resilience", amount: 1 }, { target: "economy", amount: 1 }], [{ target: "resource", key: "business.primary", amount: -1 }]),
  scenario("EVT_06", "community", "SCN_06_COM", "Run Tanker Queue Watch Teams", "Community volunteers keep water deliveries fair and visible in flats and kampungs.", { primary: 1, secondary: 1 }, ["water-stress", "equity", "local-legitimacy"], [{ target: "equity", amount: 1 }, { target: "trust", amount: 1 }], [{ target: "resource", key: "community.primary", amount: -1 }]),
  scenario("EVT_06", "youth", "SCN_06_YOU", "Expose Water Waste Hotspots", "Map leaks, overuse, and unfair rationing so the crisis does not disappear into blame.", { primary: 1, secondary: 1 }, ["water-stress", "accountability", "data"], [{ target: "trust", amount: 1 }, { target: "resilience", amount: 1 }], [{ target: "friction", amount: 1 }]),

  scenario("EVT_07", "government", "SCN_07_GOV", "Fund Sponge-City Drainage Works", "Fast-track retention ponds, permeable streets, and river reserve enforcement in the flooded district.", { primary: 2, secondary: 1 }, ["flood", "adaptation", "infrastructure"], [{ target: "resilience", amount: 2 }], [{ target: "economy", amount: -1 }]),
  scenario("EVT_07", "business", "SCN_07_BUS", "Keep Wages Paid During Flood Closure", "Employers protect workers and suppliers while sites clean up and reopen.", { primary: 1, secondary: 1 }, ["flood", "jobs", "equity"], [{ target: "equity", amount: 1 }, { target: "trust", amount: 1 }], [{ target: "economy", amount: -1 }]),
  scenario("EVT_07", "community", "SCN_07_COM", "Deploy Banjir Mutual Aid Hubs", "Residents coordinate food, charging, evacuation, and cleanup before aid systems fully arrive.", { primary: 1, secondary: 1 }, ["flood", "local-resilience", "equity"], [{ target: "resilience", amount: 1 }, { target: "trust", amount: 1 }], [{ target: "resource", key: "community.secondary", amount: -1 }]),
  scenario("EVT_07", "youth", "SCN_07_YOU", "Run Live Flood Needs Mapping", "Youth volunteers keep a public map of road closures, medicine needs, and missing support.", { primary: 1, secondary: 0 }, ["flood", "data", "public-facing"], [{ target: "resilience", amount: 1 }, { target: "trust", amount: 1 }], []),

  scenario("EVT_08", "government", "SCN_08_GOV", "Set Data Centre Clean Power Conditions", "Approve new data centres only with grid upgrades, renewable procurement, and water disclosure.", { primary: 1, secondary: 2 }, ["data-centre", "regulation", "clean-tech"], [{ target: "energySecurity", amount: 1 }, { target: "emissions", amount: 1 }], [{ target: "economy", amount: -1 }]),
  scenario("EVT_08", "business", "SCN_08_BUS", "Build High-Efficiency Data Campus", "Investors use waste heat recovery, efficient cooling, and firm clean power contracts.", { primary: 2, secondary: 1 }, ["data-centre", "innovation", "clean-investment"], [{ target: "economy", amount: 2 }, { target: "emissions", amount: 1 }], [{ target: "energySecurity", amount: -1 }]),
  scenario("EVT_08", "community", "SCN_08_COM", "Demand Local Benefit Agreements", "Residents bargain for jobs, grid reliability, and water safeguards before approvals pass.", { primary: 1, secondary: 1 }, ["data-centre", "equity", "local-legitimacy"], [{ target: "equity", amount: 1 }, { target: "trust", amount: 1 }], [{ target: "friction", amount: 1 }]),
  scenario("EVT_08", "youth", "SCN_08_YOU", "Question AI Power Demand Publicly", "Youth groups force a public debate on whether digital growth is compatible with climate goals.", { primary: 1, secondary: 1 }, ["data-centre", "accountability", "public-facing"], [{ target: "trust", amount: 1 }, { target: "emissions", amount: 1 }], [{ target: "resource", key: "business.secondary", amount: -1 }]),

  scenario("EVT_09", "government", "SCN_09_GOV", "Offer a Credible Green Investor Compact", "Tie incentives to local hiring, clean power, supplier upgrades, and public reporting.", { primary: 2, secondary: 1 }, ["investment", "industrial-policy", "jobs"], [{ target: "economy", amount: 2 }, { target: "trust", amount: 1 }], [{ target: "resource", key: "government.primary", amount: -1 }]),
  scenario("EVT_09", "business", "SCN_09_BUS", "Anchor a Malaysian Supplier Consortium", "Large firms bring SMEs into the clean manufacturing opportunity instead of importing every input.", { primary: 2, secondary: 1 }, ["investment", "partnership", "manufacturing"], [{ target: "economy", amount: 2 }, { target: "equity", amount: 1 }], [{ target: "resource", key: "business.primary", amount: -1 }]),
  scenario("EVT_09", "community", "SCN_09_COM", "Negotiate Community Hiring Guarantees", "Local groups make sure new investment creates visible pathways for nearby workers.", { primary: 1, secondary: 1 }, ["investment", "jobs", "equity"], [{ target: "equity", amount: 1 }, { target: "trust", amount: 1 }], [{ target: "economy", amount: -1 }]),
  scenario("EVT_09", "youth", "SCN_09_YOU", "Launch Green Jobs Career Clinics", "Show school leavers and graduates how the investment connects to real futures.", { primary: 1, secondary: 0 }, ["investment", "jobs", "public-facing"], [{ target: "trust", amount: 1 }, { target: "economy", amount: 1 }], []),

  scenario("EVT_10", "government", "SCN_10_GOV", "Guarantee a Just Transition Floor", "Announce minimum protections for affected households, workers, and informal earners.", { primary: 2, secondary: 1 }, ["equity", "government-support", "affordability"], [{ target: "equity", amount: 2 }, { target: "trust", amount: 1 }], [{ target: "resource", key: "government.primary", amount: -1 }]),
  scenario("EVT_10", "business", "SCN_10_BUS", "Share Transition Costs With SMEs", "Large firms absorb part of compliance and energy costs so smaller suppliers can survive.", { primary: 1, secondary: 2 }, ["equity", "supplier-support", "partnership"], [{ target: "equity", amount: 1 }, { target: "economy", amount: 1 }], [{ target: "resource", key: "business.secondary", amount: -1 }]),
  scenario("EVT_10", "community", "SCN_10_COM", "Hold a Fairness Assembly", "Residents, workers, and traders state what costs they can bear and what support they need.", { primary: 2, secondary: 0 }, ["assembly", "equity", "public-awareness"], [{ target: "trust", amount: 2 }, { target: "friction", amount: -1 }], [{ target: "resource", key: "community.primary", amount: -1 }]),
  scenario("EVT_10", "youth", "SCN_10_YOU", "Center B40 Voices in the Debate", "Youth organizers make the transition emotional by letting affected families speak first.", { primary: 1, secondary: 1 }, ["equity", "public-facing", "coalition"], [{ target: "equity", amount: 1 }, { target: "trust", amount: 1 }], [{ target: "friction", amount: 1 }]),

  scenario("EVT_11", "government", "SCN_11_GOV", "Publish a Cross-Party Climate Pledge", "Try to keep basic climate commitments alive beyond the election cycle.", { primary: 1, secondary: 2 }, ["politics", "public-narrative", "ambition"], [{ target: "trust", amount: 1 }, { target: "emissions", amount: 1 }], [{ target: "friction", amount: 1 }]),
  scenario("EVT_11", "business", "SCN_11_BUS", "Keep Investment Neutral During Campaign", "Business leaders avoid election threats and commit to long-term transition plans.", { primary: 1, secondary: 1 }, ["politics", "investment", "transparency"], [{ target: "economy", amount: 1 }, { target: "trust", amount: 1 }], [{ target: "resource", key: "business.secondary", amount: -1 }]),
  scenario("EVT_11", "community", "SCN_11_COM", "Host Candidate Climate Forums", "Neighborhood groups make candidates answer local questions on bills, floods, jobs, and haze.", { primary: 1, secondary: 1 }, ["politics", "assembly", "accountability"], [{ target: "trust", amount: 1 }, { target: "equity", amount: 1 }], [{ target: "friction", amount: 1 }]),
  scenario("EVT_11", "youth", "SCN_11_YOU", "Run a Youth Manifesto Scorecard", "Young voters compare promises against the city plan and keep screenshots moving.", { primary: 1, secondary: 1 }, ["politics", "scorecard", "public-facing"], [{ target: "trust", amount: 1 }, { target: "resource", key: "youth.secondary", amount: 1 }], [{ target: "resource", key: "government.secondary", amount: -1 }]),

  scenario("EVT_12", "government", "SCN_12_GOV", "Lock the Net Zero Delivery Mandate", "Turn the final package into funded implementation orders with public milestones.", { primary: 2, secondary: 2 }, ["endgame", "decarbonisation", "coordination"], [{ target: "emissions", amount: 2 }, { target: "trust", amount: 1 }], [{ target: "economy", amount: -1 }]),
  scenario("EVT_12", "business", "SCN_12_BUS", "Sign the Low-Carbon Procurement Pact", "Major buyers commit to cleaner local suppliers even if short-term costs are higher.", { primary: 2, secondary: 1 }, ["endgame", "procurement", "clean-investment"], [{ target: "economy", amount: 1 }, { target: "emissions", amount: 2 }], [{ target: "resource", key: "business.primary", amount: -1 }]),
  scenario("EVT_12", "community", "SCN_12_COM", "Ratify the People's Transition Covenant", "Community leaders back the final plan only if fairness protections stay enforceable.", { primary: 1, secondary: 2 }, ["endgame", "equity", "local-legitimacy"], [{ target: "equity", amount: 2 }, { target: "trust", amount: 1 }], [{ target: "friction", amount: 1 }]),
  scenario("EVT_12", "youth", "SCN_12_YOU", "Make the Future Visible", "Youth groups close the campaign with stories of the lives that will inherit the city's choices.", { primary: 1, secondary: 1 }, ["endgame", "public-facing", "narrative"], [{ target: "trust", amount: 1 }, { target: "emissions", amount: 1 }, { target: "friction", amount: -1 }], []),
];

export const scenarioActionsByEventRole = scenarioResponseActions.reduce(
  (map, action) => {
    if (!action.eventId) return map;
    map[action.eventId] ??= { government: [], business: [], community: [], youth: [] };
    map[action.eventId][action.role].push(action);
    return map;
  },
  {} as Record<string, Record<RoleKey, ActionCard[]>>,
);
