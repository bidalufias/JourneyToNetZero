import type { IndicatorKey } from "../types/gameTypes";

export type CityArchetype = {
  id: string;
  title: string;
  description: string;
  indicators: Record<IndicatorKey, number>;
  startingFriction: number;
};

export const cityArchetypes: CityArchetype[] = [
  {
    id: "industrial-port-city",
    title: "Industrial Port City",
    description: "Strong economy, high emissions, flood risk.",
    indicators: {
      economy: 7,
      emissions: 3,
      trust: 5,
      equity: 4,
      resilience: 4,
      energySecurity: 5,
    },
    startingFriction: 1,
  },
  {
    id: "growing-inland-city",
    title: "Growing Inland City",
    description: "Fast growth, weak transit, rising inequality.",
    indicators: {
      economy: 5,
      emissions: 4,
      trust: 5,
      equity: 4,
      resilience: 3,
      energySecurity: 4,
    },
    startingFriction: 1,
  },
  {
    id: "coastal-tourism-city",
    title: "Coastal Tourism City",
    description: "Climate exposed, service economy, strong public visibility.",
    indicators: {
      economy: 5,
      emissions: 5,
      trust: 6,
      equity: 5,
      resilience: 3,
      energySecurity: 4,
    },
    startingFriction: 0,
  },
  {
    id: "legacy-manufacturing-city",
    title: "Legacy Manufacturing City",
    description: "Jobs dependent on legacy industry, big transition tension.",
    indicators: {
      economy: 6,
      emissions: 3,
      trust: 4,
      equity: 5,
      resilience: 4,
      energySecurity: 5,
    },
    startingFriction: 1,
  },
];
