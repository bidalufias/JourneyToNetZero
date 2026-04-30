import type { ObjectiveCard } from "../types/gameTypes";

export const youthObjectives: ObjectiveCard[] = [
  /* ── Primary (public) ── */
  {
    id: "youth-p-net-zero-nothing",
    role: "youth",
    tier: "primary",
    title: "Net Zero or Nothing",
    tagline: "No compromise on climate",
    description: "Emissions ≥ 8 by game end.",
    conditions: { type: "indicatorMin", key: "emissions", min: 8 },
    tensionNote: "Clashes with Government (Re-election), Business (Market Dominance), and Community (Voice of the People). Aggressive targets create friction.",
  },
  {
    id: "youth-p-accountability-watchdog",
    role: "youth",
    tier: "primary",
    title: "Accountability Watchdog",
    tagline: "Expose the gap between promises and action",
    description: "Emissions ≥ 6 and trust ≥ 6 by game end.",
    conditions: { type: "combined", mode: "all", conditions: [
      { type: "indicatorMin", key: "emissions", min: 6 },
      { type: "indicatorMin", key: "trust", min: 6 },
    ] },
    tensionNote: "Clashes with Business (Trusted Partner) and Government (Economic Powerhouse). Accountability makes enemies.",
  },
  {
    id: "youth-p-movement-builder",
    role: "youth",
    tier: "primary",
    title: "Movement Builder",
    tagline: "Build the broadest possible coalition",
    description: "At least 3 synergies must be triggered across the game.",
    conditions: { type: "synergyCount", min: 3 },
    tensionNote: "Clashes with Business (Trusted Partner) and Community (Safe Haven). Coalition-building means compromising with unlikely allies.",
  },
  {
    id: "youth-p-just-transition",
    role: "youth",
    tier: "primary",
    title: "Just Transition",
    tagline: "Climate justice or no justice",
    description: "Emissions ≥ 6 and equity ≥ 6 by game end.",
    conditions: { type: "combined", mode: "all", conditions: [
      { type: "indicatorMin", key: "emissions", min: 6 },
      { type: "indicatorMin", key: "equity", min: 6 },
    ] },
    tensionNote: "Clashes with Government (Green Legacy) and Business (Resilience Investor). Balancing climate AND equity is the hardest path.",
  },

  /* ── Secondary (secret) ── */
  {
    id: "youth-s-confrontational",
    role: "youth",
    tier: "secondary",
    title: "Confrontational Stance",
    tagline: "Force the issue through pressure",
    description: "Choose actions tagged 'confrontational' at least 3 times.",
    conditions: { type: "tagChosenMax", tag: "confrontational", max: 99 },
    tensionNote: "High risk — friction spikes will hurt everyone including yourself.",
  },
  {
    id: "youth-s-future-guardian",
    role: "youth",
    tier: "secondary",
    title: "Future Guardian",
    tagline: "Never let emissions performance drop",
    description: "Emissions must never fall below 5 at any point.",
    conditions: { type: "indicatorNeverBelow", key: "emissions", min: 5 },
    tensionNote: "You'll block any action that risks emissions drops — even beneficial economy moves.",
  },
  {
    id: "youth-s-grassroots",
    role: "youth",
    tier: "secondary",
    title: "Grassroots Organizer",
    tagline: "Your power comes from the people",
    description: "Use at least 3 support actions across the game.",
    conditions: { type: "supportActionCount", min: 3 },
    tensionNote: "Spending resources on support means fewer big primary plays.",
  },
];
