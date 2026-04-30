import { useGameStore, getEndingById } from "../store/useGameStore";
import { objectiveById } from "../data/objectives";
import type { RoleKey, ObjectiveVerdict } from "../types/gameTypes";

const ROLE_META: Record<RoleKey, { emoji: string; name: string }> = {
  government: { emoji: "🏛️", name: "Government" },
  business: { emoji: "💼", name: "Business" },
  community: { emoji: "🏘️", name: "Community" },
  youth: { emoji: "🔥", name: "Youth Activist" },
};

const roleOrder: RoleKey[] = ["government", "business", "community", "youth"];

const VERDOT_STYLE: Record<ObjectiveVerdict, string> = {
  Hero: "✅",
  "Pyrrhic Victory": "⚡",
  "The Pivot": "🔄",
  "Team Player": "🤝",
  Selfish: "⚠️",
  Lost: "❌",
};

export function EndingScreen() {
  const game = useGameStore((s) => s.game);
  const resetGame = useGameStore((s) => s.resetGame);
  const ending = getEndingById(game.endingId);

  const collectiveWin = game.collectiveWin ?? false;
  const verdicts = game.verdicts;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#fff",
      color: "#000",
      fontFamily: "system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: 24,
    }}>
      {/* Collective ending */}
      <p style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#666" }}>
        GAME OVER
      </p>
      <h1 style={{ marginTop: 4, fontSize: 24 }}>
        {ending?.title ?? "Game Over"}
      </h1>
      <p style={{ maxWidth: 500, textAlign: "center", marginTop: 8, fontSize: 14, color: "#333" }}>
        {ending?.narrative ?? "The campaign has ended."}
      </p>

      {/* Collective outcome badge */}
      <div style={{
        marginTop: 16,
        padding: "8px 24px",
        border: `2px solid ${collectiveWin ? "#000" : "#999"}`,
        fontWeight: "bold",
        fontSize: 14,
      }}>
        {collectiveWin ? "✅ COLLECTIVE WIN" : "❌ COLLECTIVE LOSS"}
      </div>

      {/* City indicators */}
      <div style={{ marginTop: 20, maxWidth: 600, width: "100%" }}>
        <h3 style={{ borderBottom: "1px solid #ccc", paddingBottom: 4 }}>
          City Indicators
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {Object.entries(game.city.indicators).map(([k, v]) => (
            <div key={k} style={{
              display: "flex", justifyContent: "space-between",
              padding: "4px 8px", borderBottom: "1px solid #eee", fontSize: 13,
            }}>
              <span style={{ textTransform: "capitalize" }}>{k}</span>
              <span style={{ fontWeight: "bold" }}>{v as number}/10</span>
            </div>
          ))}
          <div style={{
            display: "flex", justifyContent: "space-between",
            padding: "4px 8px", borderBottom: "1px solid #eee", fontSize: 13,
          }}>
            <span>Friction</span>
            <span style={{ fontWeight: "bold" }}>{game.city.friction}/5</span>
          </div>
        </div>
      </div>

      {/* Individual scorecard */}
      <div style={{ marginTop: 24, maxWidth: 600, width: "100%" }}>
        <h3 style={{ borderBottom: "1px solid #ccc", paddingBottom: 4 }}>
          Player Scorecard
        </h3>
        {roleOrder.map((role) => {
          const meta = ROLE_META[role];
          const verdict = verdicts[role] ?? "Lost";
          const selected = game.selectedObjectives[role];
          const primCard = selected.primary ? objectiveById(selected.primary) : undefined;
          const secCard = selected.secondary ? objectiveById(selected.secondary) : undefined;

          return (
            <div key={role} style={{
              border: "1px solid #ddd",
              marginBottom: 12,
              padding: 12,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: 15 }}>{meta.emoji} {meta.name}</strong>
                <span style={{ fontSize: 14, fontWeight: "bold" }}>
                  {VERDOT_STYLE[verdict]} {verdict}
                </span>
              </div>
              <div style={{ marginTop: 8, fontSize: 13 }}>
                <div>
                  <span style={{ color: "#666" }}>Public:</span>{" "}
                  {primCard ? primCard.title : "—"}
                </div>
                <div>
                  <span style={{ color: "#666" }}>Secret:</span>{" "}
                  {secCard ? `🔒 ${secCard.title}` : "—"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={resetGame}
        style={{
          marginTop: 24,
          padding: "10px 32px",
          background: "#000",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontSize: 14,
          fontFamily: "inherit",
        }}
      >
        Play Again
      </button>
    </div>
  );
}
