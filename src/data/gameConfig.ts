import type { IndicatorKey, RoleKey } from "../types/gameTypes";

export const indicatorScaleBands = [
  { min: 0, max: 2, label: "crisis" },
  { min: 3, max: 4, label: "fragile" },
  { min: 5, max: 6, label: "stable" },
  { min: 7, max: 8, label: "strong" },
  { min: 9, max: 10, label: "exceptional" },
] as const;

export const indicatorDescriptions: Record<IndicatorKey, string> = {
  economy: "jobs, investment, productivity, business activity",
  emissions:
    "higher value means better emissions performance, meaning lower net emissions and cleaner systems",
  trust: "confidence in leadership, fairness, and legitimacy",
  equity: "whether benefits and burdens are shared fairly",
  resilience: "ability to withstand and recover from shocks",
  energySecurity:
    "affordability, reliability, and diversification of energy supply",
};

export const startingResources: Record<RoleKey, { primary: number; secondary: number }> = {
  government: { primary: 3, secondary: 3 },
  business: { primary: 3, secondary: 3 },
  community: { primary: 3, secondary: 3 },
  youth: { primary: 3, secondary: 3 },
};

export const frictionBands = [
  { value: 0, label: "calm" },
  { value: 1, label: "manageable" },
  { value: 2, label: "tense" },
  { value: 3, label: "strained" },
  { value: 4, label: "volatile" },
  { value: 5, label: "crisis pressure" },
] as const;
