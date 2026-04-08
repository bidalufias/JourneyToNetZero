import type { ActionCard as ActionCardType } from "../types/gameTypes";

type SupportActionBarProps = {
  actions: ActionCardType[];
  selectedId?: string;
  onSelect: (actionId?: string) => void;
  isDisabled?: (action: ActionCardType) => boolean;
};

export function SupportActionBar({
  actions,
  selectedId,
  onSelect,
  isDisabled,
}: SupportActionBarProps) {
  return (
    <div className="support-bar">
      <button
        type="button"
        className={`support-chip ${!selectedId ? "support-chip--selected" : ""}`}
        onClick={() => onSelect(undefined)}
      >
        No Support
      </button>
      {actions.map((action) => (
        <button
          type="button"
          key={action.id}
          className={`support-chip ${selectedId === action.id ? "support-chip--selected" : ""}`}
          onClick={() => onSelect(action.id)}
          disabled={isDisabled?.(action)}
          title={action.description}
        >
          {action.title}
        </button>
      ))}
    </div>
  );
}
