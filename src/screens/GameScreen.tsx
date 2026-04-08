import { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { actionById, events, wildcards } from "../data";
import { allPlayersLocked, getPrimaryActionOptions, getSupportOptions } from "../store/selectors";
import type { RoleKey, PlayerState } from "../types/gameTypes";
import { motion, AnimatePresence } from "framer-motion";

const ROLE_COLORS = { government: "gov", business: "biz", community: "com", youth: "youth" } as const;
const ROLE_EMOJIS: Record<RoleKey, string> = { government: "🏛️", business: "💼", community: "🏘️", youth: "🔥" };
const ROLE_LABELS: Record<RoleKey, string> = { government: "Government", business: "Business", community: "Community", youth: "Youth" };

function QuadrantPanel({
  player,
  colour,
  onPrimarySelect,
  onSupportSelect,
  onToggleLock,
  round,
}: {
  player: PlayerState;
  colour: string;
  onPrimarySelect: (actionId: string) => void;
  onSupportSelect: (actionId?: string) => void;
  onToggleLock: () => void;
  round: number;
}) {
  const c = ROLE_COLORS[player.role];
  const primaryOptions = getPrimaryActionOptions(player.activePanelRole, round);
  const supportOptions = getSupportOptions(player.activePanelRole);

  return (
    <div className={`quadrant quadrant--${colour}`}>
      {/* Header */}
      <div className={`quadrant__header quadrant__header--${c}`}>
        <div className={`quadrant__avatar quadrant__avatar--${c}`}>
          {ROLE_EMOJIS[player.role]}
        </div>
        <span className="quadrant__role-name">{ROLE_LABELS[player.role]}</span>
        <div className="quadrant__resources">
          <span className="resource-badge">⚔️ {player.resources.primary}</span>
          <span className="resource-badge">🛡️ {player.resources.secondary}</span>
        </div>
      </div>

      {/* Action Cards */}
      <div className="quadrant__actions">
        {primaryOptions.map((action) => {
          const canAfford = player.resources.primary >= (action.costs.primary ?? 0) && player.resources.secondary >= (action.costs.secondary ?? 0);
          const selected = player.selectedPrimaryActionId === action.id;
          const disabled = player.lockedIn || !canAfford;
          return (
            <button
              key={action.id}
              className={`quadrant-card quadrant-card--${c} ${selected ? "quadrant-card--selected" : ""} ${disabled && !selected ? "quadrant-card--disabled" : ""}`}
              onClick={() => !disabled && onPrimarySelect(action.id)}
              disabled={disabled && !selected}
            >
              <span className="quadrant-card__title">{action.title}</span>
              <span className="quadrant-card__cost">
                Cost: ⚔️{action.costs.primary ?? 0} 🛡️{action.costs.secondary ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Support Strip */}
      <div className="quadrant__support">
        {supportOptions.map((action) => {
          const canAfford = player.resources.primary >= (action.costs.primary ?? 0) && player.resources.secondary >= (action.costs.secondary ?? 0);
          const selected = player.selectedSupportActionId === action.id;
          const disabled = player.lockedIn || !canAfford;
          return (
            <button
              key={action.id}
              className={`support-btn ${selected ? "support-btn--selected" : ""} ${disabled && !selected ? "support-btn--disabled" : ""}`}
              onClick={() => !disabled && onSupportSelect(selected ? undefined : action.id)}
              disabled={disabled && !selected}
            >
              {action.title}
            </button>
          );
        })}
      </div>

      {/* Lock In */}
      <button
        className={`quadrant__lockin quadrant__lockin--${c} ${player.lockedIn ? "quadrant__lockin--locked" : ""} ${!player.selectedPrimaryActionId ? "quadrant__lockin--disabled" : ""}`}
        onClick={onToggleLock}
        disabled={!player.selectedPrimaryActionId}
      >
        {player.lockedIn ? "🔒 Locked" : "Lock In"}
      </button>
      <div className="quadrant__status">
        {!player.selectedPrimaryActionId ? "Select an action" : player.lockedIn ? "Ready!" : "Action selected"}
      </div>
    </div>
  );
}

function IndicatorDial({ label, value, icon }: { label: string; value: number; icon: string }) {
  const pct = Math.min(100, Math.max(0, (value / 10) * 100));
  const color = value >= 7 ? "#2e7d32" : value >= 4 ? "#8B7355" : "#c62828";
  return (
    <div className="indicator-dial">
      <span className="indicator-dial__value" style={{ color }}>{icon}</span>
      <span className="indicator-dial__value" style={{ color }}>{value}</span>
      <div className="indicator-dial__bar">
        <div className="indicator-dial__fill" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="indicator-dial__label">{label}</span>
    </div>
  );
}

export function TabletopGameScreen() {
  const store = useGameStore();
  const { game, showResolution } = store;
  const [showRes, setShowRes] = useState(showResolution);

  const event = events.find((e) => e.id === game.currentEventId);
  const wildcard = wildcards.find((w) => w.id === game.currentWildcardId);
  const everyoneLocked = allPlayersLocked(game);
  const latestLog = game.logs[game.logs.length - 1];

  const players = game.players;
  const gov = players.find((p) => p.seat === 0)!;
  const biz = players.find((p) => p.seat === 1)!;
  const com = players.find((p) => p.seat === 2)!;
  const youth = players.find((p) => p.seat === 3)!;

  const indicators = game.city.indicators;

  const handleResolve = () => {
    store.resolveRoundNow();
    setShowRes(true);
  };

  const handleCloseResolution = () => {
    store.closeResolution();
    setShowRes(false);
  };

  return (
    <div className="tabletop-game">
      <div className="tabletop-grid">
        {/* Top-Left: Government */}
        <QuadrantPanel
          player={gov}
          colour="top-left"
          onPrimarySelect={(id) => store.selectPrimaryAction(0, id)}
          onSupportSelect={(id) => store.selectSupportAction(0, id)}
          onToggleLock={() => store.toggleLock(0)}
          round={game.round}
        />

        {/* Top-Right: Business */}
        <QuadrantPanel
          player={biz}
          colour="top-right"
          onPrimarySelect={(id) => store.selectPrimaryAction(1, id)}
          onSupportSelect={(id) => store.selectSupportAction(1, id)}
          onToggleLock={() => store.toggleLock(1)}
          round={game.round}
        />

        {/* Bottom-Left: Community (rotated 180° via CSS) */}
        <QuadrantPanel
          player={com}
          colour="bottom-left"
          onPrimarySelect={(id) => store.selectPrimaryAction(2, id)}
          onSupportSelect={(id) => store.selectSupportAction(2, id)}
          onToggleLock={() => store.toggleLock(2)}
          round={game.round}
        />

        {/* Bottom-Right: Youth (rotated 180° via CSS) */}
        <QuadrantPanel
          player={youth}
          colour="bottom-right"
          onPrimarySelect={(id) => store.selectPrimaryAction(3, id)}
          onSupportSelect={(id) => store.selectSupportAction(3, id)}
          onToggleLock={() => store.toggleLock(3)}
          round={game.round}
        />
      </div>

      {/* Centre Overlay */}
      <div className="centre-overlay">
        <div className="centre-header">
          <div className="centre-header__round">Round {game.round} of 8</div>
          <div className="centre-header__event">{event?.title ?? "Decision Round"}</div>
          {event && <div className="centre-header__desc">{event.description}</div>}
        </div>

        <div className="indicator-ring">
          <IndicatorDial label="Economy" value={indicators.economy} icon="💰" />
          <IndicatorDial label="Emissions" value={indicators.emissions} icon="🏭" />
          <IndicatorDial label="Trust" value={indicators.trust} icon="🤝" />
          <IndicatorDial label="Equity" value={indicators.equity} icon="⚖️" />
          <IndicatorDial label="Resilience" value={indicators.resilience} icon="🛡️" />
          <IndicatorDial label="Energy" value={indicators.energySecurity} icon="⚡" />
        </div>

        {wildcard && (
          <div className="wildcard-banner">
            <div className="wildcard-banner__title">🎯 {wildcard.title}</div>
            <div className="wildcard-banner__desc">{wildcard.description}</div>
          </div>
        )}

        <button
          className={`resolve-btn ${!everyoneLocked ? "resolve-btn--disabled" : ""}`}
          onClick={handleResolve}
          disabled={!everyoneLocked}
        >
          {everyoneLocked ? "▶ Resolve Round" : `⏳ ${game.players.filter(p => p.lockedIn).length}/4 Locked`}
        </button>
      </div>

      {/* Resolution Overlay */}
      <AnimatePresence>
        {showRes && latestLog && (
          <motion.div
            className="resolution-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="resolution-panel"
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <div className="resolution-panel__title">
                Round {latestLog.round} Results
              </div>

              <div className="resolution-deltas">
                {([
                  ["💰 Economy", latestLog.indicatorChanges.economy],
                  ["🏭 Emissions", latestLog.indicatorChanges.emissions],
                  ["🤝 Trust", latestLog.indicatorChanges.trust],
                  ["⚖️ Equity", latestLog.indicatorChanges.equity],
                  ["🛡️ Resilience", latestLog.indicatorChanges.resilience],
                  ["⚡ Energy", latestLog.indicatorChanges.energySecurity],
                  ["😤 Friction", latestLog.frictionChange],
                ] as const).map(([label, delta]) => (
                  <span
                    key={label}
                    className={`delta-chip ${!delta ? "delta-chip--zero" : (delta ?? 0) > 0 ? "delta-chip--up" : "delta-chip--down"}`}
                  >
                    {label} {(delta ?? 0) > 0 ? `+${delta}` : (delta ?? 0) < 0 ? `${delta}` : "0"}
                  </span>
                ))}
              </div>

              <ul className="resolution-actions">
                {Object.entries(latestLog.actionsByRole).map(([role, actions]) => (
                  <li key={role}>
                    <strong>{ROLE_LABELS[role as RoleKey]}:</strong>{" "}
                    {actionById.get(actions.primary ?? "")?.title ?? "Pass"} /{" "}
                    {actionById.get(actions.support ?? "")?.title ?? "No support"}
                  </li>
                ))}
              </ul>

              {latestLog.triggeredSynergies.length > 0 && (
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <strong>✨ Synergies:</strong>{" "}
                  {latestLog.triggeredSynergies.map((s) => (
                    <span key={s} className="delta-chip delta-chip--up" style={{ margin: 2 }}>{s}</span>
                  ))}
                </div>
              )}

              {latestLog.headlines.length > 0 && (
                <ul className="resolution-actions" style={{ fontStyle: "italic" }}>
                  {latestLog.headlines.map((h, i) => <li key={i}>📰 {h}</li>)}
                </ul>
              )}

              <button className="resolution-continue" onClick={handleCloseResolution}>
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
