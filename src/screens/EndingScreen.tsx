import { getEndingById } from "../store/useGameStore";
import { IndicatorBar } from "../components/IndicatorBar";
import type { GameState } from "../types/gameTypes";

type EndingScreenProps = {
  game: GameState;
  onPlayAgain: () => void;
};

export function EndingScreen({ game, onPlayAgain }: EndingScreenProps) {
  const ending = getEndingById(game.endingId);
  const recentHeadlines = game.logs.slice(-3).flatMap((log) => log.headlines);

  return (
    <section className="screen ending-screen">
      <section className="wc-card endgame-summary">
        <p className="eyebrow">Session Complete</p>
        <h2>{ending?.title ?? "Managed Transition"}</h2>
        <p className="lead">{ending?.narrative ?? "The city reached a mixed transition outcome."}</p>

        <section className="endgame-summary__indicators">
          <IndicatorBar label="Economy" value={game.city.indicators.economy} />
          <IndicatorBar label="Emissions" value={game.city.indicators.emissions} />
          <IndicatorBar label="Trust" value={game.city.indicators.trust} />
          <IndicatorBar label="Equity" value={game.city.indicators.equity} />
          <IndicatorBar label="Resilience" value={game.city.indicators.resilience} />
          <IndicatorBar label="Energy Security" value={game.city.indicators.energySecurity} />
        </section>

        <p className="muted">Final Friction: {game.city.friction} / 5</p>

        <section className="endgame-summary__turning-points">
          <h3>Final Headlines</h3>
          <ul>
            {recentHeadlines.length > 0 ? (
              recentHeadlines.map((headline, index) => <li key={`${headline}-${index}`}>{headline}</li>)
            ) : (
              <li>No headlines recorded.</li>
            )}
          </ul>
        </section>

        <button type="button" className="wc-button wc-button--lg" onClick={onPlayAgain}>
          Play Again
        </button>
      </section>
    </section>
  );
}
