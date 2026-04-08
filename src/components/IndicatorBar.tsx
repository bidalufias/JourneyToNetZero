import { motion } from "framer-motion";

type IndicatorBarProps = {
  label: string;
  value: number;
  max?: number;
};

export function IndicatorBar({ label, value, max = 10 }: IndicatorBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="indicator">
      <div className="indicator__head">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="indicator__track">
        <motion.div
          className="indicator__fill"
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>
    </div>
  );
}
