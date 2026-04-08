import { actionsByRole, events, supportActionsByRole } from "../data";
import type { ActionCard, GameState, RoleKey } from "../types/gameTypes";

export const roleOrder: RoleKey[] = ["government", "business", "community", "youth"];

export const getEventForRound = (round: number) =>
  events.find((event) => event.round === round);

export const getPrimaryActionOptions = (
  role: RoleKey,
  round: number,
  count = 3,
): ActionCard[] => {
  const list = actionsByRole[role];
  const start = ((round - 1) * count) % list.length;
  return Array.from({ length: count }, (_, offset) => list[(start + offset) % list.length]);
};

export const getSupportOptions = (role: RoleKey): ActionCard[] =>
  supportActionsByRole[role];

export const allPlayersLocked = (state: GameState): boolean =>
  state.players.every((player) => player.lockedIn && player.selectedPrimaryActionId);
