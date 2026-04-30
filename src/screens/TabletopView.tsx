import { useState, useEffect } from "react";
import { useGameStore } from "../store/useGameStore";
import { actionById, cityArchetypes, events, wildcards } from "../data";
import { primaryObjectivesFor, secondaryObjectivesFor } from "../data/objectives";
import { allPlayersLocked, getPrimaryActionOptions, getSupportOptions } from "../store/selectors";
import type { ActionCard, RoleKey } from "../types/gameTypes";

/* ── Constants ── */
const ROLE_ORDER: RoleKey[] = ["government", "business", "community", "youth"];
const ROLE_EMOJI: Record<RoleKey, string> = { government: "🏛️", business: "💼", community: "🏘️", youth: "🔥" };
const ROLE_LABEL: Record<RoleKey, string> = { government: "Government", business: "Business", community: "Community", youth: "Youth" };
const IND_ICONS: Record<string, string> = { economy: "💰", emissions: "🏭", trust: "🤝", equity: "⚖️", resilience: "🛡️", energySecurity: "⚡" };
const IND_LABELS: Record<string, string> = { economy: "Economy", emissions: "Emissions", trust: "Trust", equity: "Equity", resilience: "Resilience", energySecurity: "Energy" };

type Phase = "objectives" | "city" | "playing" | "ending";

/* ════════════════════════════════════════════
   MAIN TABLETOP VIEW
   16:9 aspect ratio, 4 corners + center
   ════════════════════════════════════════════ */
export function TabletopView() {
  const store = useGameStore();
  const { game, showResolution } = store;
  const [phase, setPhase] = useState<Phase>("objectives");

  const allObjLocked = ROLE_ORDER.every((r) => game.objectivesLocked[r]);

  useEffect(() => {
    if (phase === "objectives" && allObjLocked) {
      setPhase("city");
    }
  }, [allObjLocked, phase]);

  useEffect(() => {
    if (phase === "playing" && game.phase === "ending" && !showResolution) {
      setPhase("ending");
    }
  }, [game.phase, showResolution, phase]);

  useEffect(() => {
    if (phase === "city" && game.phase === "decision") {
      setPhase("playing");
    }
  }, [game.phase, phase]);

  const cornerSeats = [
    { seat: 2, cls: "corner--tl" },
    { seat: 3, cls: "corner--tr" },
    { seat: 0, cls: "corner--bl" },
    { seat: 1, cls: "corner--br" },
  ];

  return (
    <div className="tabletop">
      {cornerSeats.map(({ seat, cls }) => (
        <div key={seat} className={`corner ${cls}`}>
          <PlayerCorner seat={seat} phase={phase} />
        </div>
      ))}

      <div className="center">
        <CenterBoard phase={phase} />
      </div>

      {showResolution && <ResolutionOverlay />}
    </div>
  );
}

/* ════════════════════════════════════════════
   PLAYER CORNER — all hooks at top, unconditionally
   ════════════════════════════════════════════ */
function PlayerCorner({ seat, phase }: { seat: number; phase: Phase }) {
  const role = ROLE_ORDER[seat];
  // All hooks called unconditionally at the top
  const player = useGameStore((s) => s.game.players[seat]);
  const activePanelRole = useGameStore((s) => s.game.players[seat]?.activePanelRole);
  const objLocked = useGameStore((s) => s.game.objectivesLocked[role as RoleKey]);
  const objSecondary = useGameStore((s) => s.game.selectedObjectives[role as RoleKey]?.secondary);

  const isSwapped = !!activePanelRole && activePanelRole !== role;
  const swappedRole = isSwapped ? activePanelRole : undefined;

  return (
    <div
      className={`corner__inner ${isSwapped ? "corner__inner--swapped" : ""}`}
      data-swap={isSwapped ? `${role}->${activePanelRole}` : ""}
    >
      <CornerHeader player={player} role={role} swappedRole={swappedRole} />
      {phase === "objectives" && <ObjectiveSelection seat={seat} />}
      {phase === "city" && (
        <CornerWaiting
          done={!!objLocked}
          secondary={!!objSecondary}
          label="Selecting city…"
        />
      )}
      {phase === "playing" && player && (
        <GameplayActions seat={seat as 0 | 1 | 2 | 3} role={role} />
      )}
      {phase === "ending" && <CornerVerdict role={role} />}
    </div>
  );
}

/* ── Shared Header ── */
function CornerHeader({ player, role, swappedRole }: { player: any; role: RoleKey; swappedRole?: RoleKey }) {
  const isSwapped = !!swappedRole;
  return (
    <div className={`corner__head ${isSwapped ? "corner__head--swapped" : ""}`}>
      <span className="corner__emoji">{ROLE_EMOJI[role]}</span>
      <span className="corner__role">{ROLE_LABEL[role]}</span>
      {isSwapped && (
        <span className="corner__swap-badge">
          → {ROLE_EMOJI[swappedRole!]} {ROLE_LABEL[swappedRole!]}
        </span>
      )}
      {player && (
        <div className="corner__resources">
          <span className="corner__res">⚔️{player.resources.primary}</span>
          <span className="corner__res">🛡️{player.resources.secondary}</span>
        </div>
      )}
    </div>
  );
}

/* ── Objective Selection (SIMULTANEOUS) ── */
function ObjectiveSelection({ seat }: { seat: number }) {
  const store = useGameStore();
  const game = store.game;
  const role = ROLE_ORDER[seat];
  const obj = game.selectedObjectives[role];
  const locked = game.objectivesLocked[role];

  if (locked) {
    const pObj = primaryObjectivesFor(role).find((o) => o.id === obj.primary);
    return (
      <div className="corner__obj">
        ✓ {pObj?.title ?? "Objective set"}
        {obj.secondary && " · 🔒 Secret"}
      </div>
    );
  }

  const primaries = primaryObjectivesFor(role);
  const secondaries = secondaryObjectivesFor(role);
  const selectedPrimary = primaries.find((o) => o.id === obj.primary);

  return (
    <div className="corner__actions">
      <div className="obj-section">
        <div className="obj-section__label">Public</div>
        {primaries.map((o) => (
          <div key={o.id} className="obj-choice">
            <button
              className={`card-btn card-btn--obj ${obj.primary === o.id ? "card-btn--selected" : ""}`}
              onClick={() => store.selectObjective(seat, "primary", o.id)}
            >
              {o.title}
            </button>
            <div className="obj-choice__tagline">{o.tagline}</div>
          </div>
        ))}
        {selectedPrimary && (
          <div className="obj-desc">
            <div className="obj-desc__text">{selectedPrimary.description}</div>
            {selectedPrimary.tensionNote && (
              <div className="obj-desc__tension">⚡ {selectedPrimary.tensionNote}</div>
            )}
          </div>
        )}
      </div>

      {obj.primary && (
        <div className="obj-section">
          <div className="obj-section__label">🔒 Secret</div>
          {secondaries.map((o) => (
            <div key={o.id} className="obj-choice">
              <button
                className={`card-btn card-btn--obj ${obj.secondary === o.id ? "card-btn--selected" : ""}`}
                onClick={() => store.selectObjective(seat, "secondary", o.id)}
              >
                {o.title}
              </button>
              <div className="obj-choice__tagline">{o.tagline}</div>
            </div>
          ))}
          <button
            className={`card-btn card-btn--obj ${!obj.secondary ? "card-btn--selected" : ""}`}
            onClick={() => store.selectObjective(seat, "secondary", "")}
          >
            Skip
          </button>
        </div>
      )}

      {obj.primary && (
        <button className="corner__lockin" onClick={() => store.confirmObjectives(seat)}>
          Confirm
        </button>
      )}
    </div>
  );
}

/* ── Waiting / City Phase ── */
function CornerWaiting({ done, secondary, label }: { done: boolean; secondary: boolean; label: string }) {
  return (
    <>
      {done && (
        <div className="corner__obj">
          ✓ Objective{secondary ? " · 🔒" : ""}
        </div>
      )}
      <div className="corner__waiting">{label}</div>
    </>
  );
}

/* ── Gameplay Actions ── */
function GameplayActions({ seat, role }: { seat: 0 | 1 | 2 | 3; role: RoleKey }) {
  const store = useGameStore();
  const game = store.game;
  const player = game.players[seat];
  if (!player) return null;

  const obj = game.selectedObjectives[role];
  const pObj = obj?.primary ? primaryObjectivesFor(role).find((o) => o.id === obj.primary) : null;

  const primaries = getPrimaryActionOptions(player.activePanelRole, game.round);
  const supports = getSupportOptions(player.activePanelRole);

  return (
    <>
      {pObj && <div className="corner__obj">🎯 {pObj.title}</div>}
      <div className="corner__actions">
        {primaries.map((a) => {
          const ok =
            player.resources.primary >= (a.costs.primary ?? 0) &&
            player.resources.secondary >= (a.costs.secondary ?? 0);
          const sel = player.selectedPrimaryActionId === a.id;
          const dis = player.lockedIn || (!ok && !sel);
          return (
            <button
              key={a.id}
              className={`card-btn ${sel ? "card-btn--selected" : ""}`}
              disabled={dis && !sel}
              onClick={() => store.selectPrimaryAction(seat, a.id)}
            >
              <div className="card-btn__title">{a.title}</div>
              <div className="card-btn__cost">
                ⚔️{a.costs.primary ?? 0} 🛡️{a.costs.secondary ?? 0}
              </div>
              <EffectLine effects={a.immediateEffects} />
            </button>
          );
        })}

        {supports.length > 0 && (
          <>
            <div className="obj-section__label" style={{ marginTop: 2 }}>Support</div>
            {supports.map((a) => {
              const ok =
                player.resources.primary >= (a.costs.primary ?? 0) &&
                player.resources.secondary >= (a.costs.secondary ?? 0);
              const sel = player.selectedSupportActionId === a.id;
              const dis = player.lockedIn || (!ok && !sel);
              return (
                <button
                  key={a.id}
                  className={`card-btn card-btn--compact ${sel ? "card-btn--selected" : ""}`}
                  disabled={dis && !sel}
                  onClick={() => store.selectSupportAction(seat, sel ? undefined : a.id)}
                >
                  <div className="card-btn__title">{a.title}</div>
                  <div className="card-btn__cost">
                    ⚔️{a.costs.primary ?? 0} 🛡️{a.costs.secondary ?? 0}
                  </div>
                </button>
              );
            })}
          </>
        )}
      </div>
      <button
        className={`corner__lockin ${player.lockedIn ? "corner__lockin--locked" : ""}`}
        onClick={() => store.toggleLock(seat)}
        disabled={!player.selectedPrimaryActionId}
      >
        {player.lockedIn ? "🔒 Locked" : "Lock In"}
      </button>
    </>
  );
}

function EffectLine({ effects }: { effects: ActionCard["immediateEffects"] }) {
  if (!effects || effects.length === 0) return null;
  return (
    <div className="card-btn__effects">
      {effects
        .filter((e) => e.target !== "meta")
        .map((e, i) => (
          <span key={i}>
            {IND_ICONS[e.target] || "●"}
            {e.amount > 0 ? `+${e.amount}` : e.amount}{" "}
          </span>
        ))}
    </div>
  );
}

/* ── Ending Verdicts ── */
function CornerVerdict({ role }: { role: RoleKey }) {
  const game = useGameStore((s) => s.game);
  const verdict = game.verdicts?.[role];
  const obj = game.selectedObjectives[role];
  const pObj = obj?.primary
    ? primaryObjectivesFor(role).find((o) => o.id === obj.primary)
    : null;

  return (
    <div className="corner__verdict">
      {pObj && <div className="corner__verdict-detail">🎯 {pObj.title}</div>}
      {obj?.secondary && <div className="corner__verdict-detail">🔒 Secret objective</div>}
      {verdict ? (
        <div className="corner__verdict-label">{verdict}</div>
      ) : (
        <div className="corner__verdict-detail">Calculating…</div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   CENTER BOARD
   ════════════════════════════════════════════ */
function CenterBoard({ phase }: { phase: Phase }) {
  if (phase === "objectives") return <CenterObjectives />;
  if (phase === "city") return <CenterCitySelect />;
  if (phase === "ending") return <CenterEnding />;
  return <CenterGame />;
}

/* ── Objective Progress (simultaneous) ── */
function CenterObjectives() {
  const game = useGameStore((s) => s.game);
  const lockedCount = ROLE_ORDER.filter((r) => game.objectivesLocked[r]).length;

  return (
    <>
      <div className="center__phase">Setup</div>
      <div className="center__round">Select Objectives</div>
      <div style={{ fontSize: 12, color: "#666" }}>
        {lockedCount}/4 confirmed
      </div>
      <div className="obj-progress">
        {ROLE_ORDER.map((r, i) => (
          <div
            key={i}
            className={`obj-progress__dot ${
              game.objectivesLocked[r]
                ? "obj-progress__dot--done"
                : game.selectedObjectives[r]?.primary
                  ? "obj-progress__dot--active"
                  : ""
            }`}
          />
        ))}
      </div>
      <div style={{ fontSize: 9, color: "#999", textAlign: "center", maxWidth: 280, lineHeight: 1.5 }}>
        All players pick simultaneously — choose a <strong>public</strong> objective and an optional <strong>🔒 secret</strong>.
      </div>
    </>
  );
}

/* ── City Selection ── */
function CenterCitySelect() {
  const store = useGameStore();
  return (
    <>
      <div className="center__phase">City Archetype</div>
      <div className="center__round">Choose Your City</div>
      <div className="city-grid">
        {cityArchetypes.map((city) => (
          <button key={city.id} className="city-card" onClick={() => store.setupCity(city.id)}>
            <div className="city-card__title">{city.title}</div>
            <div className="city-card__desc">{city.description}</div>
          </button>
        ))}
      </div>
    </>
  );
}

/* ── Main Game Board ── */
function CenterGame() {
  const store = useGameStore();
  const { game } = store;
  const ind = game.city.indicators;
  const evt = events.find((e) => e.id === game.currentEventId);
  const wc = wildcards.find((w) => w.id === game.currentWildcardId);
  const allLocked = allPlayersLocked(game);

  return (
    <>
      <div className="center__phase">Round</div>
      <div className="center__round">{game.round} / 8</div>

      <div className="indicators">
        {(["economy", "emissions", "trust", "equity", "resilience", "energySecurity"] as const).map((key) => {
          const val = ind[key];
          const inverted = key === "emissions";
          const danger = inverted ? val >= 7 : val <= 3;
          const warning = !danger && (inverted ? val >= 5 : val <= 5);
          return (
            <div key={key} className={`ind ${danger ? "ind--danger" : warning ? "ind--warning" : ""}`}>
              <span className="ind__icon">{IND_ICONS[key]}</span>
              <span className="ind__val">{val}</span>
              <div className="ind__bar">
                <div className="ind__fill" style={{ width: `${Math.min(100, val * 10)}%` }} />
              </div>
              <span className="ind__label">{IND_LABELS[key]}</span>
            </div>
          );
        })}
      </div>

      <div className={`friction ${game.city.friction >= 4 ? "friction--danger" : ""}`}>
        <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 0.5 }}>Friction</span>
        <div className="friction__dots">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={`friction__dot ${i < game.city.friction ? "friction__dot--filled" : ""}`} />
          ))}
        </div>
      </div>

      <div className="obj-peek">
        <div className="obj-peek__label">Public Objectives</div>
        <div className="obj-peek__grid">
          {ROLE_ORDER.map((r) => {
            const pObj = game.selectedObjectives[r]?.primary
              ? primaryObjectivesFor(r).find((o) => o.id === game.selectedObjectives[r].primary)
              : null;
            return (
              <div key={r} className="obj-peek__item">
                <span className="obj-peek__emoji">{ROLE_EMOJI[r]}</span>
                <span className="obj-peek__title">{pObj?.title ?? "—"}</span>
              </div>
            );
          })}
        </div>
      </div>

      {evt && (
        <div className="event">
          <div className="event__title">{evt.title}</div>
          {evt.description && <div className="event__desc">{evt.description}</div>}
        </div>
      )}

      {wc && (
        <div className="wildcard">
          <div className="wildcard__title">🎯 {wc.title}</div>
          {wc.description && <div className="wildcard__desc">{wc.description}</div>}
        </div>
      )}

      <button
        className="resolve"
        onClick={() => store.resolveRoundNow()}
        disabled={!allLocked}
      >
        {allLocked
          ? "▶ Resolve Round"
          : `⏳ ${game.players.filter((p) => p.lockedIn).length}/4 Locked`}
      </button>
    </>
  );
}

/* ── Ending ── */
function CenterEnding() {
  const store = useGameStore();
  const { game } = store;
  const ind = game.city.indicators;

  return (
    <>
      <div className="center__phase">Game Over</div>
      <div className="ending-title">
        {game.phase === "ending" ? "Journey Complete" : "Game Over"}
      </div>

      <div className="indicators">
        {(["economy", "emissions", "trust", "equity", "resilience", "energySecurity"] as const).map((key) => (
          <div key={key} className="ind">
            <span className="ind__icon">{IND_ICONS[key]}</span>
            <span className="ind__val">{ind[key]}</span>
            <div className="ind__bar">
              <div className="ind__fill" style={{ width: `${Math.min(100, ind[key] * 10)}%` }} />
            </div>
            <span className="ind__label">{IND_LABELS[key]}</span>
          </div>
        ))}
      </div>

      <button className="btn" onClick={() => store.resetGame()}>
        Play Again
      </button>
    </>
  );
}

/* ════════════════════════════════════════════
   RESOLUTION OVERLAY
   ════════════════════════════════════════════ */
function ResolutionOverlay() {
  const store = useGameStore();
  const log = store.game.logs[store.game.logs.length - 1];
  if (!log) return null;

  return (
    <div className="overlay">
      <div className="overlay__panel">
        <div className="overlay__title">Round {log.round} Results</div>

        <div className="overlay__deltas">
          {([
            ["💰 Economy", log.indicatorChanges.economy],
            ["🏭 Emissions", log.indicatorChanges.emissions],
            ["🤝 Trust", log.indicatorChanges.trust],
            ["⚖️ Equity", log.indicatorChanges.equity],
            ["🛡️ Resilience", log.indicatorChanges.resilience],
            ["⚡ Energy", log.indicatorChanges.energySecurity],
            ["😤 Friction", log.frictionChange],
          ] as [string, number | undefined][]).map(([label, delta]) => (
            <span
              key={label}
              className={`delta ${
                !(delta ?? 0) ? "delta--zero" : (delta ?? 0) > 0 ? "delta--up" : "delta--down"
              }`}
            >
              {label}{" "}
              {(delta ?? 0) > 0 ? `+${delta}` : (delta ?? 0) < 0 ? `${delta}` : "0"}
            </span>
          ))}
        </div>

        <ul className="overlay__actions">
          {Object.entries(log.actionsByRole).map(([role, actions]) => (
            <li key={role}>
              <strong>{ROLE_LABEL[role as RoleKey]}:</strong>{" "}
              {actionById.get(actions.primary ?? "")?.title ?? "Pass"}
              {actions.support && ` / ${actionById.get(actions.support)?.title ?? "—"}`}
            </li>
          ))}
        </ul>

        {log.triggeredSynergies.length > 0 && (
          <div className="overlay__synergies">
            <strong>✨ Synergies:</strong> {log.triggeredSynergies.join(", ")}
          </div>
        )}

        {log.headlines.length > 0 && (
          <ul className="overlay__headlines">
            {log.headlines.map((h, i) => (
              <li key={i}>📰 {h}</li>
            ))}
          </ul>
        )}

        <button className="overlay__continue" onClick={() => store.closeResolution()}>
          Continue
        </button>
      </div>
    </div>
  );
}
