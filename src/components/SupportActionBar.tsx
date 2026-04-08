import type { ActionCard as ActionCardType } from "../types/gameTypes";

type SupportActionBarProps = {
  actions: ActionCardType[];
  selectedId?: string;
  onSelect: (actionId?: string) => void;
};

export function SupportActionBar({
  actions,
  selectedId,
  onSelect,
}: SupportActionBarProps) {
  return (
    <div className="support-bar">
      <button
        className={`support-chip ${!selectedId ? "support-chip--selected" : ""}`}
        onClick={() => onSelect(undefined)}
      >
        No Support
      </button>
      {actions.map((action) => (
        <button
          key={action.id}
          className={`support-chip ${selectedId === action.id ? "support-chip--selected" : ""}`}
          onClick={() => onSelect(action.id)}
        >
          {action.title}
        </button>
      ))}
    </div>
  );
}
