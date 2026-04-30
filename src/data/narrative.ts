import type { EventCard } from "../types/gameTypes";

export type EventBriefing = {
  scene: string;
  stakes: string[];
  tableQuestion: string;
};

export const eventBriefings: Record<EventCard["id"], EventBriefing> = {
  EVT_01: {
    scene:
      "The transition starts at the meter. Families compare bills, factory managers recalculate margins, and every promise about affordability is suddenly personal.",
    stakes: [
      "Energy Security protects homes and businesses from tariff pressure.",
      "Trust will be fragile if the first sacrifices land on ordinary households.",
    ],
    tableQuestion: "Who absorbs the first cost of change?",
  },
  EVT_02: {
    scene:
      "CBAM turns distant climate policy into a local export problem. Suddenly carbon data matters as much as price, delivery, and quality.",
    stakes: [
      "Clean Air performance now affects market access.",
      "SME suppliers may be left behind if compliance becomes a private scramble.",
    ],
    tableQuestion: "Can Malaysia defend its export future without abandoning smaller suppliers?",
  },
  EVT_03: {
    scene:
      "El Nino makes climate risk bodily. Heat, water anxiety, and power demand all arrive at once, and the most exposed people cannot simply stay indoors.",
    stakes: [
      "Resilience decides whether heat becomes disruption or tragedy.",
      "Energy Security weakens when cooling demand spikes.",
    ],
    tableQuestion: "Who gets protected first when heat and drought squeeze the city?",
  },
  EVT_04: {
    scene:
      "The haze rolls in as a regional crisis and a local health emergency. Diplomacy, supplier accountability, and neighborhood care all compete for attention.",
    stakes: [
      "Trust falls quickly if the city looks passive.",
      "Health protection and ASEAN diplomacy pull on different political muscles.",
    ],
    tableQuestion: "How do you act when the smoke crosses borders but the breathing happens here?",
  },
  EVT_05: {
    scene:
      "Oil prices jump and old habits return: subsidy demands, fuel queues, logistics complaints, and anger at the cost of moving around.",
    stakes: [
      "Short-term relief can slow the shift away from fossil fuels.",
      "Transit, efficiency, and fairness can turn pain into momentum.",
    ],
    tableQuestion: "Do you cushion the shock, accelerate the transition, or try to do both?",
  },
  EVT_06: {
    scene:
      "Water stress exposes the hidden infrastructure of daily life. The same rationing notice means different things to a hospital, a factory, a hawker, and a high-rise flat.",
    stakes: [
      "Resilience protects production and health.",
      "Equity collapses if rationing looks politically or commercially biased.",
    ],
    tableQuestion: "Who gets water, who cuts use, and who proves the rules are fair?",
  },
  EVT_07: {
    scene:
      "The low district floods again. Photos spread before the rain stops, and people ask why the same neighborhoods keep paying first.",
    stakes: [
      "Resilience investments can turn a disaster into a survivable shock.",
      "Low Trust makes every response look too late.",
    ],
    tableQuestion: "Will the city treat banjir as an emergency or a warning?",
  },
  EVT_08: {
    scene:
      "Data centre investors arrive with glossy renderings and enormous power needs. The city wants growth, but the grid and water system are not imaginary.",
    stakes: [
      "Economy can rise quickly if the city sets credible conditions.",
      "Energy Security and water resilience can suffer if approvals chase headlines.",
    ],
    tableQuestion: "What kind of digital economy can the city actually sustain?",
  },
  EVT_09: {
    scene:
      "A clean manufacturing investor is watching the city closely. The opportunity is real, but so is the risk of building a future economy that leaves local workers behind.",
    stakes: [
      "Government and Business alignment can unlock investment.",
      "Community and Youth can make the opportunity feel legitimate, not imposed.",
    ],
    tableQuestion: "Can Malaysia's green economy be built with local confidence?",
  },
  EVT_10: {
    scene:
      "The fairness debate leaves policy papers and enters pasar aisles, surau conversations, resident groups, and family chats.",
    stakes: [
      "Equity protects the coalition from turning against the transition.",
      "Fast climate gains may backfire if people feel they are paying for someone else's future.",
    ],
    tableQuestion: "What does a fair transition look like when money is tight?",
  },
  EVT_11: {
    scene:
      "Every move is now political theatre. A serious policy can become a campaign attack before the evening news cycle ends.",
    stakes: [
      "Trust penalties hit harder when voters are watching.",
      "Narrative and consultation can keep ambition from becoming backlash.",
    ],
    tableQuestion: "Can leaders act boldly without losing the mandate?",
  },
  EVT_12: {
    scene:
      "The final week arrives. Investors want proof, residents want fairness, and young people want a future they can believe in.",
    stakes: [
      "Weak indicators can trigger an endgame crisis.",
      "The final story will remember both the wins and the people who carried the cost.",
    ],
    tableQuestion: "What kind of Malaysian city did you actually build?",
  },
};
