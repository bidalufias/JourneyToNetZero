import type { ObjectiveCard } from "../types/gameTypes";

export const communityObjectives: ObjectiveCard[] = [
  /* ── Primary (public) ── */
  {
    id: "com-p-no-one-left-behind",
    role: "community",
    tier: "primary",
    title: "No One Left Behind",
    tagline: "Equity is non-negotiable",
    description: "Equity ≥ 7 by game end.",
    conditions: { type: "indicatorMin", key: "equity", min: 7 },
    tensionNote: "Clashes with Business (Market Dominance) and Government (Green Legacy). Equity spending slows emissions gains.",
  },
  {
    id: "com-p-safe-haven",
    role: "community",
    tier: "primary",
    title: "Safe Haven",
    tagline: "A city that protects its people",
    description: "Resilience ≥ 7 and equity ≥ 6 by game end.",
    conditions: { type: "combined", mode: "all", conditions: [
      { type: "indicatorMin", key: "resilience", min: 7 },
      { type: "indicatorMin", key: "equity", min: 6 },
    ] },
    tensionNote: "Clashes with Business (Clean Energy Pioneer) and Activist (Just Transition). Protection requires resources others want.",
  },
  {
    id: "com-p-energy-independence",
    role: "community",
    tier: "primary",
    title: "Energy Independence",
    tagline: "Our energy, our rules",
    description: "Energy security ≥ 7 and equity ≥ 5 by game end.",
    conditions: { type: "combined", mode: "all", conditions: [
      { type: "indicatorMin", key: "energySecurity", min: 7 },
      { type: "indicatorMin", key: "equity", min: 5 },
    ] },
    tensionNote: "Clashes with Government (Economic Powerhouse) and Business (Trusted Partner). Decentralized energy disrupts incumbents.",
  },
  {
    id: "com-p-voice-of-the-people",
    role: "community",
    tier: "primary",
    title: "Voice of the People",
    tagline: "Trust is earned through representation",
    description: "Trust ≥ 7 by game end.",
    conditions: { type: "indicatorMin", key: "trust", min: 7 },
    tensionNote: "Clashes with Activist (Net Zero or Nothing) and Government (Re-election). Trust is fragile when hard choices hit.",
  },

  /* ── Secondary (secret) ── */
  {
    id: "com-s-community-coffers",
    role: "community",
    tier: "secondary",
    title: "Community Coffers",
    tagline: "Build a war chest for the neighborhood",
    description: "Your primary resource must be ≥ 3 at game end.",
    conditions: { type: "resourceMin", key: "community", resourceType: "primary", min: 3 },
    tensionNote: "Holding back resources means fewer plays per round — risky when the city needs help.",
  },
  {
    id: "com-s-support-network",
    role: "community",
    tier: "secondary",
    title: "Support Network",
    tagline: "Everyone chips in",
    description: "Use at least 4 support actions across the game.",
    conditions: { type: "supportActionCount", min: 4 },
    tensionNote: "Burns through resources fast — you may run dry when it matters most.",
  },
  {
    id: "com-s-never-abandoned",
    role: "community",
    tier: "secondary",
    title: "Never Abandoned",
    tagline: "Equity never drops to crisis",
    description: "Equity must never fall below 4 at any point.",
    conditions: { type: "indicatorNeverBelow", key: "equity", min: 4 },
    tensionNote: "You'll oppose any action that risks equity — even if it's the best climate move.",
  },
];
