import { motion } from "framer-motion";
import type { ActionCard as ActionCardType } from "../types/gameTypes";

type ActionCardProps = {
  action: ActionCardType;
  selected?: boolean;
  onSelect: () => void;
  disabled?: boolean;
};

export function ActionCard({ action, selected, onSelect, disabled }: ActionCardProps) {
  const costPrimary = action.costs.primary ?? 0;
  const costSecondary = action.costs.secondary ?? 0;

  return (
    <motion.button
      type="button"
      className={`action-card ${selected ? "action-card--selected" : ""}`}
      onClick={onSelect}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -3 }}
      whileTap={disabled ? undefined : { scale: 0.99 }}
      layout
    >
      <div className="action-card__head">
        <h4 className="action-card__title">{action.title}</h4>
        <span className={`action-card__type action-card__type--${action.actionType}`}>
          {action.actionType}
        </span>
      </div>

      <div className="action-card__costs">
        <span>Primary {costPrimary}</span>
        <span>Secondary {costSecondary}</span>
      </div>

      <p className="action-card__desc">{action.description}</p>

      <div className="action-card__tags">
        {action.tags.slice(0, 3).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </motion.button>
  );
}
