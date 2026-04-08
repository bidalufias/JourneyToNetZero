import { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { actionById, events, wildcards } from "../data";
import { allPlayersLocked, getPrimaryActionOptions, getSupportOptions } from "../store/selectors";
import type { RoleKey, PlayerState, ActionCard } from "../types/gameTypes";
import { motion, AnimatePresence } from "framer-motion";

const ROLE_CLASS: Record<RoleKey, string> = { government: "gov", business: "biz", community: "com", youth: "youth" };
const ROLE_EMOJI: Record<RoleKey, string> = { government: "🏛️", business: "💼", community: "🏘️", youth: "🔥" };
const ROLE_LABEL: Record<RoleKey, string> = { government: "Government", business: "Business", community: "Community", youth: "Youth Activist" };
const IND_ICONS: Record<string, string> = { economy: "💰", emissions: "🏭", trust: "🤝", equity: "⚖️", resilience: "🛡️", energySecurity: "⚡" };

/* ── Effect preview chips ── */
function EffectPreview({ effects }: { effects: ActionCard["immediateEffects"] | ActionCard["tradeoffEffects"] }) {
  if (!effects || effects.length === 0) return null;
  return (
    <div className="card-effects">
      {effects.filter(e => e.target !== "meta").map((e, i) => (
        <span key={i} className={`effect-chip ${e.amount > 0 ? "effect-chip--up" : "effect-chip--down"}`}>
          {IND_ICONS[e.target] || "●"} {e.amount > 0 ? `+${e.amount}` : e.amount}
        </span>
      ))}
    </div>
  );
}

/* ── Single Playing Card ── */
function PlayCard({
  action, selected, disabled, onSelect, compact,
}: {
  action: ActionCard; selected: boolean; disabled: boolean;
  onSelect: () => void; compact?: boolean;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className={`playcard ${selected ? "playcard--selected" : ""} ${disabled ? "playcard--disabled" : ""} ${compact ? "playcard--compact" : ""}`}
      onClick={() => { if (!disabled && !flipped) onSelect(); }}>
      <div className="playcard__flipper">
        {/* FRONT */}
        <div className="playcard__front">
          <div className="playcard__title">{action.title}</div>
          <div className="playcard__cost">
            <span>⚔️{action.costs.primary ?? 0}</span>
            <span>🛡️{action.costs.secondary ?? 0}</span>
          </div>
          <EffectPreview effects={action.immediateEffects} />
          {action.tradeoffEffects.length > 0 && (
            <EffectPreview effects={action.tradeoffEffects} />
          )}
          <button className="playcard__info" onClick={(e) => { e.stopPropagation(); setFlipped(true); }}
            tabIndex={-1}>ⓘ</button>
        </div>

        {/* BACK */}
        <div className="playcard__back">
          <div className="playcard__back-title">{action.title}</div>
          <div className="playcard__back-desc">{action.description}</div>
          <button className="playcard__back-close" onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
            tabIndex={-1}>✕</button>
        </div>
      </div>
    </div>
  );
}

/* ── Quadrant ── */
function Quadrant({
  player, corner, onPrimary, onSupport, onToggle, round,
}: {
  player: PlayerState; corner: string;
  onPrimary: (id: string) => void;
  onSupport: (id?: string) => void;
  onToggle: () => void;
  round: number;
}) {
  const c = ROLE_CLASS[player.role];
  const primaries = getPrimaryActionOptions(player.activePanelRole, round);
  const supports = getSupportOptions(player.activePanelRole);

  return (
    <div className={`quadrant quadrant--${corner}`}>
      <div className="q-flip">
        <div className={`q-header q-header--${c}`}>
          <div className={`q-avatar q-avatar--${c}`}>{ROLE_EMOJI[player.role]}</div>
          <span className="q-role">{ROLE_LABEL[player.role]}</span>
          <div className="q-resources">
            <span className="q-res">⚔️ {player.resources.primary}</span>
            <span className="q-res">🛡️ {player.resources.secondary}</span>
          </div>
        </div>

        <div className="q-cards">
          {primaries.map((a) => {
            const ok = player.resources.primary >= (a.costs.primary ?? 0) && player.resources.secondary >= (a.costs.secondary ?? 0);
            const sel = player.selectedPrimaryActionId === a.id;
            const dis = player.lockedIn || (!ok && !sel);
            return (
              <PlayCard key={a.id} action={a} selected={sel} disabled={dis && !sel}
                onSelect={() => onPrimary(a.id)} />
            );
          })}
        </div>

        <div className="q-support">
          {supports.map((a) => {
            const ok = player.resources.primary >= (a.costs.primary ?? 0) && player.resources.secondary >= (a.costs.secondary ?? 0);
            const sel = player.selectedSupportActionId === a.id;
            const dis = player.lockedIn || (!ok && !sel);
            return (
              <PlayCard key={a.id} action={a} selected={sel} disabled={dis && !sel}
                onSelect={() => onSupport(sel ? undefined : a.id)} compact />
            );
          })}
        </div>

        <button className={`q-lockin ${player.lockedIn ? "q-lockin--locked" : ""} ${!player.selectedPrimaryActionId ? "q-lockin--disabled" : ""}`}
          onClick={onToggle} disabled={!player.selectedPrimaryActionId}>
          {player.lockedIn ? "🔒 Locked" : "Lock In"}
        </button>
      </div>
    </div>
  );
}

function Dial({ icon, label, value }: { icon: string; label: string; value: number }) {
  const pct = Math.min(100, Math.max(0, value * 10));
  const cls = value >= 7 ? "good" : value >= 4 ? "mid" : "bad";
  const color = value >= 7 ? "#66bb6a" : value >= 4 ? "#ffa726" : "#ef5350";
  return (
    <div className="ind">
      <span className="ind__icon">{icon}</span>
      <span className={`ind__val ind__val--${cls}`}>{value}</span>
      <div className="ind__bar"><div className="ind__fill" style={{ width: `${pct}%`, backgroundColor: color }} /></div>
      <span className="ind__label">{label}</span>
    </div>
  );
}

export function TabletopGameScreen() {
  const store = useGameStore();
  const { game } = store;
  const [showRes, setShowRes] = useState(false);

  const evt = events.find((e) => e.id === game.currentEventId);
  const wc = wildcards.find((w) => w.id === game.currentWildcardId);
  const allLocked = allPlayersLocked(game);
  const log = game.logs[game.logs.length - 1];
  const ind = game.city.indicators;
  const [gov, biz, com, youth] = game.players;

  return (
    <div className="tabletop-game">
      <div className="tabletop-grid">
        <Quadrant player={gov} corner="top-left"
          onPrimary={(id) => store.selectPrimaryAction(0, id)}
          onSupport={(id) => store.selectSupportAction(0, id)}
          onToggle={() => store.toggleLock(0)} round={game.round} />
        <Quadrant player={biz} corner="top-right"
          onPrimary={(id) => store.selectPrimaryAction(1, id)}
          onSupport={(id) => store.selectSupportAction(1, id)}
          onToggle={() => store.toggleLock(1)} round={game.round} />
        <Quadrant player={com} corner="bottom-left"
          onPrimary={(id) => store.selectPrimaryAction(2, id)}
          onSupport={(id) => store.selectSupportAction(2, id)}
          onToggle={() => store.toggleLock(2)} round={game.round} />
        <Quadrant player={youth} corner="bottom-right"
          onPrimary={(id) => store.selectPrimaryAction(3, id)}
          onSupport={(id) => store.selectSupportAction(3, id)}
          onToggle={() => store.toggleLock(3)} round={game.round} />
      </div>

      <div className="centre">
        <div className="centre__round">Round {game.round} of 8</div>
        {evt && <div className="centre__event">{evt.title}</div>}
        {evt && <div className="centre__desc">{evt.description}</div>}
        <div className="indicators">
          <Dial icon="💰" label="Economy" value={ind.economy} />
          <Dial icon="🏭" label="Emissions" value={ind.emissions} />
          <Dial icon="🤝" label="Trust" value={ind.trust} />
          <Dial icon="⚖️" label="Equity" value={ind.equity} />
          <Dial icon="🛡️" label="Resilience" value={ind.resilience} />
          <Dial icon="⚡" label="Energy" value={ind.energySecurity} />
        </div>
        {wc && (
          <div className="wc-banner">
            <div className="wc-banner__title">🎯 {wc.title}</div>
            <div className="wc-banner__desc">{wc.description}</div>
          </div>
        )}
        <button className={`resolve-btn ${!allLocked ? "resolve-btn--disabled" : ""}`}
          onClick={() => { store.resolveRoundNow(); setShowRes(true); }} disabled={!allLocked}>
          {allLocked ? "▶ Resolve Round" : `⏳ ${game.players.filter(p => p.lockedIn).length}/4 Locked`}
        </button>
      </div>

      <AnimatePresence>
        {showRes && log && (
          <motion.div className="res-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="res-panel" initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 30 }} transition={{ type: "spring", damping: 20 }}>
              <div className="res-panel__title">Round {log.round} Results</div>
              <div className="res-deltas">
                {([
                  ["💰 Economy", log.indicatorChanges.economy],
                  ["🏭 Emissions", log.indicatorChanges.emissions],
                  ["🤝 Trust", log.indicatorChanges.trust],
                  ["⚖️ Equity", log.indicatorChanges.equity],
                  ["🛡️ Resilience", log.indicatorChanges.resilience],
                  ["⚡ Energy", log.indicatorChanges.energySecurity],
                  ["😤 Friction", log.frictionChange],
                ] as [string, number | undefined][]).map(([label, delta]) => (
                  <span key={label}
                    className={`d-chip ${!(delta ?? 0) ? "d-chip--zero" : (delta ?? 0) > 0 ? "d-chip--up" : "d-chip--down"}`}>
                    {label} {(delta ?? 0) > 0 ? `+${delta}` : (delta ?? 0) < 0 ? `${delta}` : "0"}
                  </span>
                ))}
              </div>
              <ul className="res-actions">
                {Object.entries(log.actionsByRole).map(([role, actions]) => (
                  <li key={role}><strong>{ROLE_LABEL[role as RoleKey]}:</strong>{" "}
                    {actionById.get(actions.primary ?? "")?.title ?? "Pass"} /{" "}
                    {actionById.get(actions.support ?? "")?.title ?? "No support"}
                  </li>
                ))}
              </ul>
              {log.triggeredSynergies.length > 0 && (
                <div style={{ textAlign: "center", marginBottom: 8, color: "#fff" }}>
                  <strong>✨ Synergies:</strong>{" "}
                  {log.triggeredSynergies.map((s) => <span key={s} className="d-chip d-chip--up" style={{ margin: 2 }}>{s}</span>)}
                </div>
              )}
              {log.headlines.length > 0 && (
                <ul className="res-actions" style={{ fontStyle: "italic" }}>
                  {log.headlines.map((h, i) => <li key={i}>📰 {h}</li>)}
                </ul>
              )}
              <button className="res-continue" onClick={() => { store.closeResolution(); setShowRes(false); }}>Continue</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
