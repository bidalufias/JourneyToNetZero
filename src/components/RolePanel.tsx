import { ActionCard } from "./ActionCard";
import { SupportActionBar } from "./SupportActionBar";
import type { ActionCard as ActionCardType, PlayerState } from "../types/gameTypes";

type RolePanelProps = {
  orientation: "top" | "right" | "bottom" | "left";
  player: PlayerState;
  displayRoleLabel: string;
  ownerRoleLabel: string;
  primaryOptions: ActionCardType[];
  supportOptions: ActionCardType[];
  isPrimaryDisabled?: (action: ActionCardType) => boolean;
  isSupportDisabled?: (action: ActionCardType) => boolean;
  onPrimarySelect: (actionId: string) => void;
  onSupportSelect: (actionId?: string) => void;
  onToggleLock: () => void;
};

export function RolePanel({
  orientation,
  player,
  displayRoleLabel,
  ownerRoleLabel,
  primaryOptions,
  supportOptions,
  isPrimaryDisabled,
  isSupportDisabled,
  onPrimarySelect,
  onSupportSelect,
  onToggleLock,
}: RolePanelProps) {
  return (
    <section className={`role-panel role-panel--${orientation} wc-card`}>
      <header className="role-panel__head">
        <div>
          <h3>{displayRoleLabel}</h3>
          {displayRoleLabel !== ownerRoleLabel ? <p className="muted">Controlled by {ownerRoleLabel}</p> : null}
        </div>
        <div className="role-panel__resources">
          <span>Primary {player.resources.primary}</span>
          <span>Secondary {player.resources.secondary}</span>
        </div>
      </header>

      <div className="role-panel__actions">
        {primaryOptions.map((action) => (
          <ActionCard
            key={action.id}
            action={action}
            selected={player.selectedPrimaryActionId === action.id}
            onSelect={() => onPrimarySelect(action.id)}
            disabled={isPrimaryDisabled?.(action)}
          />
        ))}
      </div>

      <SupportActionBar
        actions={supportOptions}
        selectedId={player.selectedSupportActionId}
        onSelect={onSupportSelect}
        isDisabled={isSupportDisabled}
      />

      <div className="role-panel__decision">
        <span>
          Decision: {player.selectedPrimaryActionId ? "Primary selected" : "Waiting"}
          {player.selectedSupportActionId ? " + support" : ""}
        </span>
        <button
          className="wc-button"
          type="button"
          onClick={onToggleLock}
          disabled={!player.selectedPrimaryActionId}
        >
          {player.lockedIn ? "Unlock" : "Lock In"}
        </button>
      </div>
    </section>
  );
}
