import type { ObjectiveCard } from "../types/gameTypes";

export const businessObjectives: ObjectiveCard[] = [
  /* ── Primary (public) ── */
  {
    id: "biz-p-market-dominance",
    role: "business",
    tier: "primary",
    title: "Market Dominance",
    tagline: "Profit first, planet second",
    description: "Economy ≥ 8 and your primary resource ≥ 4 at game end.",
    conditions: { type: "combined", mode: "all", conditions: [
      { type: "indicatorMin", key: "economy", min: 8 },
      { type: "resourceMin", key: "business", resourceType: "primary", min: 4 },
    ] },
    tensionNote: "Clashes with Government (Green Legacy) and Activist (Net Zero or Nothing). Profit-driven moves erode trust.",
  },
  {
    id: "biz-p-clean-energy-pioneer",
    role: "business",
    tier: "primary",
    title: "Clean Energy Pioneer",
    tagline: "The green transition is the biggest market opportunity",
    description: "Emissions ≥ 7 and energy security ≥ 7 by game end.",
    conditions: { type: "combined", mode: "all", conditions: [
      { type: "indicatorMin", key: "emissions", min: 7 },
      { type: "indicatorMin", key: "energySecurity", min: 7 },
    ] },
    tensionNote: "Clashes with Community (Safe Haven) and Government (Re-election). Big infrastructure disrupts neighborhoods.",
  },
  {
    id: "biz-p-trusted-partner",
    role: "business",
    tier: "primary",
    title: "Trusted Partner",
    tagline: "Be the private sector government can count on",
    description: "Trust ≥ 6 and economy ≥ 6 by game end.",
    conditions: { type: "combined", mode: "all", conditions: [
      { type: "indicatorMin", key: "trust", min: 6 },
      { type: "indicatorMin", key: "economy", min: 6 },
    ] },
    tensionNote: "Clashes with Activist (Movement Builder) and Government (Economic Powerhouse). Being liked limits aggressive moves.",
  },
  {
    id: "biz-p-resilience-investor",
    role: "business",
    tier: "primary",
    title: "Resilience Investor",
    tagline: "Bounce back stronger from every shock",
    description: "Resilience ≥ 8 by game end.",
    conditions: { type: "indicatorMin", key: "resilience", min: 8 },
    tensionNote: "Clashes with Government (Social Contract) and Activist (Accountability Watchdog). Resilience spending diverts from equity.",
  },

  /* ── Secondary (secret) ── */
  {
    id: "biz-s-efficiency-king",
    role: "business",
    tier: "secondary",
    title: "Efficiency King",
    tagline: "Do more with less",
    description: "Use no more than 2 support actions the entire game.",
    conditions: { type: "supportActionMax", max: 2 },
    tensionNote: "Self-imposed restraint — may miss critical combo opportunities.",
  },
  {
    id: "biz-s-green-portfolio",
    role: "business",
    tier: "secondary",
    title: "Green Portfolio",
    tagline: "Stack clean-investment tags",
    description: "Choose actions tagged 'clean-investment' at least 4 times.",
    conditions: { type: "combined", mode: "all", conditions: [
      { type: "tagChosenMax", tag: "clean-investment", max: 4 },
    ] },
    tensionNote: "Forces green picks even when red picks are strategically better this round.",
  },
  {
    id: "biz-s-energy-baron",
    role: "business",
    tier: "secondary",
    title: "Energy Baron",
    tagline: "Control the energy narrative",
    description: "Energy security must never drop below 5 at any point.",
    conditions: { type: "indicatorNeverBelow", key: "energySecurity", min: 5 },
    tensionNote: "Makes you vulnerable to any shock that hits energy — you'll fight every negative energy event.",
  },
];
