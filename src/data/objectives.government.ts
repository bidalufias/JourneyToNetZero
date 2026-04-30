import type { ObjectiveCard } from "../types/gameTypes";

export const governmentObjectives: ObjectiveCard[] = [
  /* ── Primary (public, pick 1 of 4) ── */
  {
    id: "gov-p-re-election",
    role: "government",
    tier: "primary",
    title: "Re-election",
    tagline: "Stay in power at all costs",
    description: "Keep trust ≥ 6 and equity ≥ 5 by game end. Lose if either falls below.",
    conditions: { type: "combined", mode: "all", conditions: [
      { type: "indicatorMin", key: "trust", min: 6 },
      { type: "indicatorMin", key: "equity", min: 5 },
    ] },
    tensionNote: "Clashes with Business (Market Dominance) and Activist (Net Zero or Nothing). Keeping everyone happy means slower action.",
  },
  {
    id: "gov-p-green-legacy",
    role: "government",
    tier: "primary",
    title: "Green Legacy",
    tagline: "Be remembered as the leader who delivered Net Zero",
    description: "Emissions ≥ 8 and resilience ≥ 6 by game end.",
    conditions: { type: "combined", mode: "all", conditions: [
      { type: "indicatorMin", key: "emissions", min: 8 },
      { type: "indicatorMin", key: "resilience", min: 6 },
    ] },
    tensionNote: "Clashes with Business (Market Dominance) and Community (No One Left Behind). Aggressive targets sacrifice short-term equity.",
  },
  {
    id: "gov-p-economic-powerhouse",
    role: "government",
    tier: "primary",
    title: "Economic Powerhouse",
    tagline: "Grow the economy while going green",
    description: "Economy ≥ 8 and emissions ≥ 6 by game end.",
    conditions: { type: "combined", mode: "all", conditions: [
      { type: "indicatorMin", key: "economy", min: 8 },
      { type: "indicatorMin", key: "emissions", min: 6 },
    ] },
    tensionNote: "Clashes with Activist (Accountability Watchdog) and Community (Energy Independence). Growth-first angers the base.",
  },
  {
    id: "gov-p-social-contract",
    role: "government",
    tier: "primary",
    title: "Social Contract",
    tagline: "No one gets left behind",
    description: "Equity ≥ 7 and trust ≥ 7 by game end.",
    conditions: { type: "combined", mode: "all", conditions: [
      { type: "indicatorMin", key: "equity", min: 7 },
      { type: "indicatorMin", key: "trust", min: 7 },
    ] },
    tensionNote: "Clashes with Business (Resilience Investor) and Activist (Net Zero or Nothing). Social spending delays climate investment.",
  },

  /* ── Secondary (secret, pick 1 of 3) ── */
  {
    id: "gov-s-fiscal-discipline",
    role: "government",
    tier: "secondary",
    title: "Fiscal Discipline",
    tagline: "Never let primary resources dip below 2",
    description: "Your primary resource must never fall below 2 at any point.",
    conditions: { type: "resourceMin", key: "government", resourceType: "primary", min: 2 },
    tensionNote: "Forces conservative spending — may block expensive climate actions.",
  },
  {
    id: "gov-s-synergy-diplomat",
    role: "government",
    tier: "secondary",
    title: "Synergy Diplomat",
    tagline: "Make the team click",
    description: "At least 3 synergies must be triggered across the game.",
    conditions: { type: "synergyCount", min: 3 },
    tensionNote: "Requires coordinating with all roles — but others may not share your agenda.",
  },
  {
    id: "gov-s-low-friction-mandate",
    role: "government",
    tier: "secondary",
    title: "Low Friction Mandate",
    tagline: "Keep the peace",
    description: "Friction must never exceed 2 at any point.",
    conditions: { type: "frictionMax", max: 2 },
    tensionNote: "Conflicts with Activist confrontation plays and aggressive policy moves.",
  },
];
