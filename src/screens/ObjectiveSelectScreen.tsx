import { useGameStore } from "../store/useGameStore";
import { primaryObjectivesFor, secondaryObjectivesFor } from "../data/objectives";
import type { RoleKey } from "../types/gameTypes";

const ROLE_META: Record<RoleKey, { emoji: string; name: string }> = {
  government: { emoji: "🏛️", name: "Government" },
  business: { emoji: "💼", name: "Business" },
  community: { emoji: "🏘️", name: "Community" },
  youth: { emoji: "🔥", name: "Youth Activist" },
};

const roleOrder: RoleKey[] = ["government", "business", "community", "youth"];

export function ObjectiveSelectScreen() {
  const game = useGameStore((s) => s.game);
  const selectObjective = useGameStore((s) => s.selectObjective);
  const confirmObjectives = useGameStore((s) => s.confirmObjectives);

  const seat = game.objectiveSelectingSeat;
  const role = roleOrder[seat];
  const meta = ROLE_META[role];
  const selected = game.selectedObjectives[role];
  const primCards = primaryObjectivesFor(role);
  const secCards = secondaryObjectivesFor(role);

  /* multi-step per player: primary → secondary → confirm */
  const step: "primary" | "secondary" | "confirm" =
    !selected.primary ? "primary" : !selected.secondary ? "secondary" : "confirm";

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
      {/* header */}
      <p style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#666" }}>
        OBJECTIVE SELECTION — Player {seat + 1} of 4
      </p>
      <h2 style={{ marginTop: 4 }}>
        {meta.emoji} {meta.name}
      </h2>

      {/* progress dots */}
      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        {roleOrder.map((r, i) => (
          <div key={r} style={{
            width: 12, height: 12, borderRadius: "50%",
            background: i < seat ? "#000" : i === seat ? "#555" : "#ddd",
          }} />
        ))}
      </div>

      {/* PRIMARY SELECTION */}
      {step === "primary" && (
        <div style={{ maxWidth: 600, width: "100%" }}>
          <h3 style={{ borderBottom: "2px solid #000", paddingBottom: 4 }}>
            Choose your PUBLIC Objective
          </h3>
          <p style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>
            Everyone will see this. Pick carefully.
          </p>
          {primCards.map((card) => (
            <button
              key={card.id}
              onClick={() => selectObjective(seat, "primary", card.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: 12,
                marginBottom: 8,
                border: selected.primary === card.id ? "2px solid #000" : "1px solid #ccc",
                background: selected.primary === card.id ? "#f0f0f0" : "#fff",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <strong>{card.title}</strong>
              <span style={{ display: "block", fontSize: 12, color: "#666", marginTop: 2 }}>
                {card.tagline}
              </span>
              <span style={{ display: "block", fontSize: 13, marginTop: 4 }}>
                {card.description}
              </span>
              <span style={{ display: "block", fontSize: 11, color: "#999", marginTop: 4, fontStyle: "italic" }}>
                Tension: {card.tensionNote}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* SECONDARY SELECTION */}
      {step === "secondary" && (
        <div style={{ maxWidth: 600, width: "100%" }}>
          <h3 style={{ borderBottom: "2px solid #000", paddingBottom: 4 }}>
            Choose your SECRET Objective
          </h3>
          <p style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>
            Only you will know this. It stays hidden until the final scorecard.
          </p>
          {secCards.map((card) => (
            <button
              key={card.id}
              onClick={() => selectObjective(seat, "secondary", card.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: 12,
                marginBottom: 8,
                border: selected.secondary === card.id ? "2px solid #000" : "1px solid #ccc",
                background: selected.secondary === card.id ? "#f0f0f0" : "#fff",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <strong>🔒 {card.title}</strong>
              <span style={{ display: "block", fontSize: 12, color: "#666", marginTop: 2 }}>
                {card.tagline}
              </span>
              <span style={{ display: "block", fontSize: 13, marginTop: 4 }}>
                {card.description}
              </span>
              <span style={{ display: "block", fontSize: 11, color: "#999", marginTop: 4, fontStyle: "italic" }}>
                Tension: {card.tensionNote}
              </span>
            </button>
          ))}
          <button
            onClick={() => selectObjective(seat, "secondary", "")}
            style={{
              display: "block", width: "100%", textAlign: "left",
              padding: 12, marginBottom: 8,
              border: selected.secondary === "" ? "2px solid #000" : "1px solid #ccc",
              background: selected.secondary === "" ? "#f0f0f0" : "#fff",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <strong>No secret objective</strong>
            <span style={{ display: "block", fontSize: 12, color: "#666", marginTop: 2 }}>
              Play with only your public goal
            </span>
          </button>
        </div>
      )}

      {/* CONFIRM */}
      {step === "confirm" && (
        <div style={{ maxWidth: 600, width: "100%" }}>
          <h3 style={{ borderBottom: "2px solid #000", paddingBottom: 4 }}>
            Review &amp; Confirm
          </h3>
          <div style={{ padding: 12, border: "1px solid #ccc", marginBottom: 12 }}>
            <p><strong>Public:</strong> {primCards.find((c) => c.id === selected.primary)?.title}</p>
            <p style={{ fontSize: 13 }}>
              {primCards.find((c) => c.id === selected.primary)?.description}
            </p>
          </div>
          <div style={{ padding: 12, border: "1px solid #ccc", marginBottom: 16 }}>
            <p><strong>Secret:</strong> 🔒 {selected.secondary
              ? secCards.find((c) => c.id === selected.secondary)?.title
              : "None"}</p>
            {selected.secondary && (
              <p style={{ fontSize: 13 }}>
                {secCards.find((c) => c.id === selected.secondary)?.description}
              </p>
            )}
          </div>
          <button
            onClick={() => confirmObjectives(seat)}
            style={{
              padding: "10px 32px",
              background: "#000",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "inherit",
            }}
          >
            Confirm — Pass to Player {seat + 2 > 4 ? "City" : seat + 2}
          </button>
        </div>
      )}
    </div>
  );
}
