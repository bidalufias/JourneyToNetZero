import type { ActionCard as ActionCardType } from "../types/gameTypes";

type ActionCardProps = {
  action: ActionCardType;
  selected?: boolean;
  onSelect: () => void;
  disabled?: boolean;
};

export function ActionCard({ action, selected, onSelect, disabled }: ActionCardProps) {
  return (
    <button
      type="button"
      className={`action-card ${selected ? "action-card--selected" : ""}`}
      onClick={onSelect}
      disabled={disabled}
    >
      <div className="action-card__title">{action.title}</div>
      <div className="action-card__cost">
        Cost {action.costs.primary ?? 0} / {action.costs.secondary ?? 0}
      </div>
      <p className="action-card__desc">{action.description}</p>
    </button>
  );
}
