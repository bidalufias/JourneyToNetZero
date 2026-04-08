import { ActionCard } from "./ActionCard";
import { SupportActionBar } from "./SupportActionBar";
import type { ActionCard as ActionCardType, PlayerState } from "../types/gameTypes";

type RolePanelProps = {
  player: PlayerState;
  displayRoleLabel: string;
  primaryOptions: ActionCardType[];
  supportOptions: ActionCardType[];
  onPrimarySelect: (actionId: string) => void;
  onSupportSelect: (actionId?: string) => void;
  onToggleLock: () => void;
};

export function RolePanel({
  player,
  displayRoleLabel,
  primaryOptions,
  supportOptions,
  onPrimarySelect,
  onSupportSelect,
  onToggleLock,
}: RolePanelProps) {
  return (
    <section className={`role-panel role-panel--seat-${player.seat}`}>
      <header className="role-panel__head">
        <h3>{displayRoleLabel}</h3>
        <div className="role-panel__resources">
          <span>P: {player.resources.primary}</span>
          <span>S: {player.resources.secondary}</span>
        </div>
      </header>

      <div className="role-panel__actions">
        {primaryOptions.map((action) => (
          <ActionCard
            key={action.id}
            action={action}
            selected={player.selectedPrimaryActionId === action.id}
            onSelect={() => onPrimarySelect(action.id)}
          />
        ))}
      </div>

      <SupportActionBar
        actions={supportOptions}
        selectedId={player.selectedSupportActionId}
        onSelect={onSupportSelect}
      />

      <button className="lock-btn" onClick={onToggleLock}>
        {player.lockedIn ? "Unlock" : "Lock In"}
      </button>
    </section>
  );
}
