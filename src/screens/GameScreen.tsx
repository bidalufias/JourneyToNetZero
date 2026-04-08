import { actionById, events, wildcards } from "../data";
import { IndicatorBar } from "../components/IndicatorBar";
import { RolePanel } from "../components/RolePanel";
import { WildcardBanner } from "../components/WildcardBanner";
import { allPlayersLocked, getPrimaryActionOptions, getSupportOptions } from "../store/selectors";
import type { ActionCard, GameState, RoleKey } from "../types/gameTypes";

type GameScreenProps = {
  game: GameState;
  showResolution: boolean;
  onPrimarySelect: (seat: 0 | 1 | 2 | 3, actionId: string) => void;
  onSupportSelect: (seat: 0 | 1 | 2 | 3, actionId?: string) => void;
  onToggleLock: (seat: 0 | 1 | 2 | 3) => void;
  onResolveRound: () => void;
  onCloseResolution: () => void;
};

const roleLabels: Record<RoleKey, string> = {
  government: "Government",
  business: "Business",
  community: "Community",
  youth: "Youth Activist",
};

const formatDelta = (value?: number): string => {
  if (!value) return "0";
  return value > 0 ? `+${value}` : `${value}`;
};

export function GameScreen({
  game,
  showResolution,
  onPrimarySelect,
  onSupportSelect,
  onToggleLock,
  onResolveRound,
  onCloseResolution,
}: GameScreenProps) {
  const event = events.find((item) => item.id === game.currentEventId);
  const wildcard = wildcards.find((item) => item.id === game.currentWildcardId);
  const latestLog = game.logs[game.logs.length - 1];
  const everyoneLocked = allPlayersLocked(game);
  const playerBySeat = new Map(game.players.map((player) => [player.seat, player]));
  const orientationBySeat: Record<0 | 1 | 2 | 3, "top" | "right" | "bottom" | "left"> = {
    0: "top",
    1: "right",
    2: "bottom",
    3: "left",
  };

  const canAfford = (rolePlayer: NonNullable<(typeof game.players)[number]>, action: ActionCard): boolean =>
    rolePlayer.resources.primary >= (action.costs.primary ?? 0) &&
    rolePlayer.resources.secondary >= (action.costs.secondary ?? 0);

  const isPrimaryDisabled = (
    rolePlayer: NonNullable<(typeof game.players)[number]>,
    action: ActionCard,
  ): boolean => {
    if (!canAfford(rolePlayer, action)) {
      return true;
    }
    if (game.currentWildcardId === "WC_03" && rolePlayer.role === "government") {
      return (action.costs.primary ?? 0) > 1;
    }
    if (game.currentWildcardId === "WC_04" && rolePlayer.role === "business") {
      return !action.tags.includes("investment") && !action.tags.includes("clean-investment");
    }
    return false;
  };

  return (
    <section className="screen game-screen">
      <header className="game-screen__header wc-card">
        <div>
          <p className="eyebrow">Round {game.round} of 8</p>
          <h2>{event?.title ?? "Decision Round"}</h2>
          <p className="muted">{event?.description}</p>
        </div>
        <button type="button" className="wc-button" disabled={!everyoneLocked} onClick={onResolveRound}>
          Resolve Round
        </button>
      </header>

      <div className="game-table">
        {(() => {
          const top = playerBySeat.get(0);
          if (!top) return null;
          const swapped = top.role !== top.activePanelRole;
          return (
            <RolePanel
              key={top.role}
              orientation={orientationBySeat[top.seat]}
              player={top}
              ownerRoleLabel={roleLabels[top.role]}
              displayRoleLabel={
                swapped ? `${roleLabels[top.activePanelRole]} panel` : roleLabels[top.activePanelRole]
              }
              primaryOptions={getPrimaryActionOptions(top.activePanelRole, game.round)}
              supportOptions={getSupportOptions(top.activePanelRole)}
              isPrimaryDisabled={(action) => isPrimaryDisabled(top, action)}
              isSupportDisabled={(action) => !canAfford(top, action)}
              onPrimarySelect={(actionId) => onPrimarySelect(top.seat, actionId)}
              onSupportSelect={(actionId) => onSupportSelect(top.seat, actionId)}
              onToggleLock={() => onToggleLock(top.seat)}
            />
          );
        })()}

        <div className="game-table__middle">
          {(() => {
            const left = playerBySeat.get(3);
            if (!left) return null;
            const swapped = left.role !== left.activePanelRole;
            return (
              <RolePanel
                key={left.role}
                orientation={orientationBySeat[left.seat]}
                player={left}
                ownerRoleLabel={roleLabels[left.role]}
                displayRoleLabel={
                  swapped
                    ? `${roleLabels[left.activePanelRole]} panel`
                    : roleLabels[left.activePanelRole]
                }
                primaryOptions={getPrimaryActionOptions(left.activePanelRole, game.round)}
                supportOptions={getSupportOptions(left.activePanelRole)}
                isPrimaryDisabled={(action) => isPrimaryDisabled(left, action)}
                isSupportDisabled={(action) => !canAfford(left, action)}
                onPrimarySelect={(actionId) => onPrimarySelect(left.seat, actionId)}
                onSupportSelect={(actionId) => onSupportSelect(left.seat, actionId)}
                onToggleLock={() => onToggleLock(left.seat)}
              />
            );
          })()}

          <section className="game-table__center">
            <section className="indicator-grid wc-card">
              <IndicatorBar label="Economy" value={game.city.indicators.economy} />
              <IndicatorBar label="Emissions" value={game.city.indicators.emissions} />
              <IndicatorBar label="Trust" value={game.city.indicators.trust} />
              <IndicatorBar label="Equity" value={game.city.indicators.equity} />
              <IndicatorBar label="Resilience" value={game.city.indicators.resilience} />
              <IndicatorBar label="Energy Security" value={game.city.indicators.energySecurity} />
            </section>

            <section className="city-board wc-card">
              <div className="city-board__header">
                <h3>City Status</h3>
                <p className="muted">Friction {game.city.friction} / 5</p>
              </div>
              <div className="city-board__map">
                <span className="city-node city-node--a" />
                <span className="city-node city-node--b" />
                <span className="city-node city-node--c" />
              </div>
              <div className="city-board__brief">
                <p>
                  Round event: <strong>{event?.title ?? "None"}</strong>
                </p>
                <p>{event?.description}</p>
              </div>
            </section>

            {wildcard ? <WildcardBanner title={wildcard.title} description={wildcard.description} /> : null}
          </section>

          {(() => {
            const right = playerBySeat.get(1);
            if (!right) return null;
            const swapped = right.role !== right.activePanelRole;
            return (
              <RolePanel
                key={right.role}
                orientation={orientationBySeat[right.seat]}
                player={right}
                ownerRoleLabel={roleLabels[right.role]}
                displayRoleLabel={
                  swapped
                    ? `${roleLabels[right.activePanelRole]} panel`
                    : roleLabels[right.activePanelRole]
                }
                primaryOptions={getPrimaryActionOptions(right.activePanelRole, game.round)}
                supportOptions={getSupportOptions(right.activePanelRole)}
                isPrimaryDisabled={(action) => isPrimaryDisabled(right, action)}
                isSupportDisabled={(action) => !canAfford(right, action)}
                onPrimarySelect={(actionId) => onPrimarySelect(right.seat, actionId)}
                onSupportSelect={(actionId) => onSupportSelect(right.seat, actionId)}
                onToggleLock={() => onToggleLock(right.seat)}
              />
            );
          })()}
        </div>

        {(() => {
          const bottom = playerBySeat.get(2);
          if (!bottom) return null;
          const swapped = bottom.role !== bottom.activePanelRole;
          return (
            <RolePanel
              key={bottom.role}
              orientation={orientationBySeat[bottom.seat]}
              player={bottom}
              ownerRoleLabel={roleLabels[bottom.role]}
              displayRoleLabel={
                swapped
                  ? `${roleLabels[bottom.activePanelRole]} panel`
                  : roleLabels[bottom.activePanelRole]
              }
              primaryOptions={getPrimaryActionOptions(bottom.activePanelRole, game.round)}
              supportOptions={getSupportOptions(bottom.activePanelRole)}
              isPrimaryDisabled={(action) => isPrimaryDisabled(bottom, action)}
              isSupportDisabled={(action) => !canAfford(bottom, action)}
              onPrimarySelect={(actionId) => onPrimarySelect(bottom.seat, actionId)}
              onSupportSelect={(actionId) => onSupportSelect(bottom.seat, actionId)}
              onToggleLock={() => onToggleLock(bottom.seat)}
            />
          );
        })()}
      </div>

      {showResolution && latestLog && (
        <aside className="resolution-overlay">
          <div className="wc-card resolution-overlay__panel">
            <p className="eyebrow">Round {latestLog.round} Resolution</p>
            <h3>City Update</h3>
            <div className="resolution-overlay__changes">
              {(
                [
                  ["Economy", latestLog.indicatorChanges.economy],
                  ["Emissions", latestLog.indicatorChanges.emissions],
                  ["Trust", latestLog.indicatorChanges.trust],
                  ["Equity", latestLog.indicatorChanges.equity],
                  ["Resilience", latestLog.indicatorChanges.resilience],
                  ["Energy Security", latestLog.indicatorChanges.energySecurity],
                  ["Friction", latestLog.frictionChange],
                ] as const
              ).map(([label, delta]) => (
                <article
                  key={label}
                  className={`delta ${!delta ? "" : delta > 0 ? "delta--up" : "delta--down"}`}
                >
                  <strong>{label}</strong>
                  <span>{formatDelta(delta)}</span>
                </article>
              ))}
            </div>

            <h4>Selected Actions</h4>
            <ul className="resolution-overlay__headlines">
              {Object.entries(latestLog.actionsByRole).map(([role, actions]) => (
                <li key={role}>
                  <strong>{roleLabels[role as RoleKey]}:</strong>{" "}
                  {actionById.get(actions.primary ?? "")?.title ?? "No primary"} /{" "}
                  {actionById.get(actions.support ?? "")?.title ?? "No support"}
                </li>
              ))}
            </ul>

            {latestLog.triggeredSynergies.length > 0 ? (
              <div className="resolution-overlay__synergies">
                {latestLog.triggeredSynergies.map((synergy) => (
                  <span key={synergy}>{synergy}</span>
                ))}
              </div>
            ) : null}

            {latestLog.headlines.length > 0 && (
              <>
                <h4>Headlines</h4>
                <ul className="resolution-overlay__headlines">
                  {latestLog.headlines.map((headline) => (
                    <li key={headline}>{headline}</li>
                  ))}
                </ul>
              </>
            )}

            <button type="button" className="wc-button" onClick={onCloseResolution}>
              Continue
            </button>
          </div>
        </aside>
      )}
    </section>
  );
}
