import { actionsByRole, events, scenarioActionsByEventRole, supportActionsByRole } from "../data";
import type { ActionCard, GameState, RoleKey } from "../types/gameTypes";

export const roleOrder: RoleKey[] = ["government", "business", "community", "youth"];

export const getEventForRound = (round: number) =>
  events.find((event) => event.round === round);

export const getPrimaryActionOptions = (
  role: RoleKey,
  round: number,
  eventId?: string,
  count = 4,
): ActionCard[] => {
  const scenarioActions = eventId ? scenarioActionsByEventRole[eventId]?.[role] ?? [] : [];
  const list = actionsByRole[role].filter((action) => !action.tags.includes("scenario-response"));
  const fillCount = Math.max(0, count - scenarioActions.length);
  const start = ((round - 1) * fillCount) % list.length;
  const rotatingActions = Array.from(
    { length: fillCount },
    (_, offset) => list[(start + offset) % list.length],
  );

  const uniqueActions = new Map<string, ActionCard>();
  [...scenarioActions, ...rotatingActions].forEach((action) => {
    uniqueActions.set(action.id, action);
  });
  return [...uniqueActions.values()];
};

export const getSupportOptions = (role: RoleKey): ActionCard[] =>
  supportActionsByRole[role];

export const allPlayersLocked = (state: GameState): boolean =>
  state.players.every((player) => player.lockedIn && player.selectedPrimaryActionId);
