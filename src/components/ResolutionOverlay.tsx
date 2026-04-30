import { AnimatePresence, motion } from "framer-motion";
import type { IndicatorKey, RoundLog } from "../types/gameTypes";

type ResolutionOverlayProps = {
  open: boolean;
  log?: RoundLog;
  cityTitle: string;
  onClose: () => void;
};

const indicatorLabels: Record<IndicatorKey, string> = {
  economy: "Economy",
  emissions: "Clean Air",
  trust: "Trust",
  equity: "Equity",
  resilience: "Resilience",
  energySecurity: "Energy Security",
};

export function ResolutionOverlay({ open, log, cityTitle, onClose }: ResolutionOverlayProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="resolution-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.section
            className="resolution-overlay__panel wc-card"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 14, opacity: 0 }}
            transition={{ duration: 0.24 }}
          >
            <header>
              <p className="eyebrow">Resolution</p>
              <h3>{cityTitle} Round {log?.round ?? ""} Results</h3>
            </header>

            <div className="resolution-overlay__changes">
              {Object.entries(log?.indicatorChanges ?? {}).map(([key, change]) => {
                const indicatorKey = key as IndicatorKey;
                const direction = change >= 0 ? "up" : "down";
                return (
                  <div className={`delta delta--${direction}`} key={key}>
                    <span>{indicatorLabels[indicatorKey]}</span>
                    <strong>{change >= 0 ? `+${change}` : change}</strong>
                  </div>
                );
              })}
              <div className={`delta ${(log?.frictionChange ?? 0) <= 0 ? "delta--up" : "delta--down"}`}>
                <span>Friction</span>
                <strong>{(log?.frictionChange ?? 0) >= 0 ? `+${log?.frictionChange}` : log?.frictionChange}</strong>
              </div>
            </div>

            {log?.triggeredSynergies?.length ? (
              <div className="resolution-overlay__synergies">
                {log.triggeredSynergies.map((synergy) => (
                  <span key={synergy}>{synergy}</span>
                ))}
              </div>
            ) : null}

            <div className="resolution-overlay__headlines">
              {(log?.headlines ?? []).slice(0, 4).map((headline) => (
                <p key={headline}>{headline}</p>
              ))}
            </div>

            <button type="button" className="wc-button wc-button--lg" onClick={onClose}>
              Continue
            </button>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
