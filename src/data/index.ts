import { businessActions } from "./actions.business";
import { communityActions } from "./actions.community";
import { governmentActions } from "./actions.government";
import { youthActions } from "./actions.youth";
import { scenarioResponseActions } from "./scenarioResponses";
import { supportActions } from "./supportActions";
import type { ActionCard, RoleKey } from "../types/gameTypes";

export { cityArchetypes } from "./cityArchetypes";
export { events } from "./events";
export { wildcards } from "./wildcards";
export { synergies } from "./synergies";
export { supportActions } from "./supportActions";
export { scenarioActionsByEventRole, scenarioResponseActions } from "./scenarioResponses";
export { endings } from "./endings";
export { eventBriefings } from "./narrative";
export { GAME_ROUNDS, startingResources, indicatorScaleBands, frictionBands } from "./gameConfig";

export const primaryActions: ActionCard[] = [
  ...governmentActions,
  ...businessActions,
  ...communityActions,
  ...youthActions,
  ...scenarioResponseActions,
];

export const actionsByRole: Record<RoleKey, ActionCard[]> = {
  government: governmentActions,
  business: businessActions,
  community: communityActions,
  youth: youthActions,
};

export const supportActionsByRole: Record<RoleKey, ActionCard[]> = {
  government: supportActions.filter((action) => action.role === "government"),
  business: supportActions.filter((action) => action.role === "business"),
  community: supportActions.filter((action) => action.role === "community"),
  youth: supportActions.filter((action) => action.role === "youth"),
};

export const actionById = new Map<string, ActionCard>(
  [...primaryActions, ...supportActions].map((action) => [action.id, action]),
);
