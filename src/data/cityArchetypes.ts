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
    title: "Klang Port Industrial City",
    description: "Export strength, high industrial emissions, monsoon flood exposure.",
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
    title: "Johor Growth Corridor",
    description: "Fast development, car dependence, pressure on housing and utilities.",
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
    title: "Penang Coastal Tourism City",
    description: "Tourism visibility, heritage districts, climate-exposed coastlines.",
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
    title: "Northern Manufacturing Belt",
    description: "Factory jobs, supplier networks, and tough transition politics.",
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
