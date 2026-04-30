import { IndicatorBar } from "./IndicatorBar";
import type { IndicatorKey, RoundLog } from "../types/gameTypes";

type EndgameSummaryProps = {
  cityTitle: string;
  endingTitle: string;
  narrative: string;
  indicators: Record<IndicatorKey, number>;
  friction: number;
  logs: RoundLog[];
  onRestart: () => void;
};

const indicatorLabels: Record<IndicatorKey, string> = {
  economy: "Economy",
  emissions: "Clean Air",
  trust: "Trust",
  equity: "Equity",
  resilience: "Resilience",
  energySecurity: "Energy Security",
};

const roundScore = (log: RoundLog): number =>
  Object.values(log.indicatorChanges).reduce((sum, delta) => sum + Math.abs(delta ?? 0), 0) +
  Math.abs(log.frictionChange) * 2 +
  log.triggeredSynergies.length * 2;

export function EndgameSummary({
  cityTitle,
  endingTitle,
  narrative,
  indicators,
  friction,
  logs,
  onRestart,
}: EndgameSummaryProps) {
  const turningPoints = [...logs]
    .sort((a, b) => roundScore(b) - roundScore(a))
    .slice(0, 3);

  return (
    <article className="wc-card endgame-summary">
      <p className="eyebrow">Campaign Complete</p>
      <h1>{endingTitle}</h1>
      <p className="lead">{cityTitle}</p>
      <p>{narrative}</p>

      <div className="endgame-summary__indicators">
        {(Object.keys(indicators) as IndicatorKey[]).map((key) => (
          <IndicatorBar key={key} label={indicatorLabels[key]} value={indicators[key]} />
        ))}
      </div>

      <p className="muted">Final Friction: {friction} / 5</p>

      <div className="endgame-summary__turning-points">
        <h3>Top Turning Points</h3>
        {turningPoints.length ? (
          turningPoints.map((log) => (
            <p key={`turn-${log.round}`}>
              Round {log.round}: {log.headlines[0] ?? "Major city shift"}
            </p>
          ))
        ) : (
          <p>Rounds completed with no logged turning points.</p>
        )}
      </div>

      <button className="wc-button wc-button--lg" type="button" onClick={onRestart}>
        Play Again
      </button>
    </article>
  );
}
