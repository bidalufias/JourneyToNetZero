import type { ObjectiveCard, RoleKey } from "../types/gameTypes";
import { governmentObjectives } from "./objectives.government";
import { businessObjectives } from "./objectives.business";
import { communityObjectives } from "./objectives.community";
import { youthObjectives } from "./objectives.youth";

const allObjectives: ObjectiveCard[] = [
  ...governmentObjectives,
  ...businessObjectives,
  ...communityObjectives,
  ...youthObjectives,
];

export const objectivesByRole: Record<RoleKey, ObjectiveCard[]> = {
  government: governmentObjectives,
  business: businessObjectives,
  community: communityObjectives,
  youth: youthObjectives,
};

export const primaryObjectivesFor = (role: RoleKey): ObjectiveCard[] =>
  objectivesByRole[role].filter((o) => o.tier === "primary");

export const secondaryObjectivesFor = (role: RoleKey): ObjectiveCard[] =>
  objectivesByRole[role].filter((o) => o.tier === "secondary");

export const objectiveById = (id: string): ObjectiveCard | undefined =>
  allObjectives.find((o) => o.id === id);

export { governmentObjectives, businessObjectives, communityObjectives, youthObjectives };
