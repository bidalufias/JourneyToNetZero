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
      "A clean manufacturing investor is watching the city closely. The opportunity is real, but so is the risk of building a future economy that leaves local workers behind.",
    stakes: [
      "Government and Business alignment can unlock investment.",
      "Community and Youth can make the opportunity feel legitimate, not imposed.",
    ],
    tableQuestion: "Can Malaysia's green economy be built with local confidence?",
  },
  EVT_03: {
    scene:
      "The fairness debate leaves policy papers and enters pasar aisles, surau conversations, resident groups, and family chats.",
    stakes: [
      "Equity protects the coalition from turning against the transition.",
      "Fast climate gains may backfire if people feel they are paying for someone else's future.",
    ],
    tableQuestion: "What does a fair transition look like when money is tight?",
  },
  EVT_04: {
    scene:
      "Heat sits over the city. Clinics, schools, factories, and families all feel how climate risk becomes daily life.",
    stakes: [
      "Resilience decides whether this is a bad week or a breaking point.",
      "Energy Security matters when cooling demand spikes.",
    ],
    tableQuestion: "Who protects the people most exposed to heat?",
  },
  EVT_05: {
    scene:
      "Every move is now political theatre. A serious policy can become a campaign attack before the evening news cycle ends.",
    stakes: [
      "Trust penalties hit harder when voters are watching.",
      "Narrative and consultation can keep ambition from becoming backlash.",
    ],
    tableQuestion: "Can leaders act boldly without losing the mandate?",
  },
  EVT_06: {
    scene:
      "The low district floods again. Photos spread before the rain stops, and people ask why the same neighborhoods keep paying first.",
    stakes: [
      "Resilience investments can turn a disaster into a survivable shock.",
      "Low Trust makes every response look too late.",
    ],
    tableQuestion: "Will the city treat banjir as an emergency or a warning?",
  },
  EVT_07: {
    scene:
      "Buyers across ASEAN are changing their expectations. Cleaner suppliers get calls; laggards get polite silence.",
    stakes: [
      "Clean Air and Economy can reinforce each other now.",
      "Business confidence matters, but public legitimacy still decides whether growth lasts.",
    ],
    tableQuestion: "Can the city prove its transition is more than branding?",
  },
  EVT_08: {
    scene:
      "The final week arrives. Investors want proof, residents want fairness, and young people want a future they can believe in.",
    stakes: [
      "Weak indicators can trigger an endgame crisis.",
      "The final story will remember both the wins and the people who carried the cost.",
    ],
    tableQuestion: "What kind of Malaysian city did you actually build?",
  },
};

