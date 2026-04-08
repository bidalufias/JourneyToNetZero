import { useGameStore } from "./store/useGameStore";
import { cityArchetypes, endings } from "./data";
import { TabletopGameScreen } from "./screens/GameScreen";
import "./App.css";

function AttractScreen() {
  const goToRoleIntro = useGameStore((s) => s.goToRoleIntro);
  return (
    <div className="screen" onClick={goToRoleIntro}>
      <p className="eyebrow">TABLETOP CLIMATE SIMULATION</p>
      <h1 style={{ marginTop: 8, fontSize: 32 }}>Journey to Net Zero</h1>
      <p className="muted" style={{ marginTop: 8 }}>4 voices. 1 city. Hard choices.</p>
      <button className="wc-button" style={{ marginTop: 24 }} onClick={(e) => { e.stopPropagation(); goToRoleIntro(); }}>Start Game</button>
    </div>
  );
}

const ROLES = [
  { key: "government", emoji: "🏛️", name: "Government", desc: "Balances city-wide outcomes under political pressure.", constraint: "Trust losses hit legitimacy quickly.", superpower: "High-leverage policy moves." },
  { key: "business", emoji: "💼", name: "Business", desc: "Drives investment, jobs, and implementation speed.", constraint: "Confidence drops when friction rises.", superpower: "Market-scale transition effects." },
  { key: "community", emoji: "🏘️", name: "Community", desc: "Protects fairness and neighborhood legitimacy.", constraint: "Capacity limited when trust collapses.", superpower: "Cushions shocks, keeps equity alive." },
  { key: "youth", emoji: "🔥", name: "Youth Activist", desc: "Pushes urgency, accountability, future-facing choices.", constraint: "Confrontational plays increase friction.", superpower: "Narrative and coalition momentum." },
];

function RoleIntroScreen() {
  const goToCitySelect = useGameStore((s) => s.goToCitySelect);
  return (
    <div className="screen">
      <p className="eyebrow">ROLES</p>
      <h2 style={{ marginTop: 4 }}>Each player carries a different mandate</h2>
      <div className="roles-grid">
        {ROLES.map((r) => (
          <div key={r.key} className="role-card">
            <div style={{ fontSize: 24 }}>{r.emoji}</div>
            <h3>{r.name}</h3>
            <p>{r.desc}</p>
            <p><strong>Constraint:</strong> {r.constraint}</p>
            <p><strong>Superpower:</strong> {r.superpower}</p>
          </div>
        ))}
      </div>
      <button className="wc-button" style={{ marginTop: 16 }} onClick={goToCitySelect}>Continue</button>
    </div>
  );
}

function CitySelectScreen() {
  const setupCity = useGameStore((s) => s.setupCity);
  return (
    <div className="screen">
      <p className="eyebrow">CITY ARCHETYPE</p>
      <h2 style={{ marginTop: 4 }}>Choose your city</h2>
      <p className="muted" style={{ marginBottom: 16 }}>Pick a starting condition.</p>
      <div className="city-grid">
        {cityArchetypes.map((city: any) => (
          <div key={city.id} className="city-card" onClick={() => setupCity(city.id)}>
            <h3>{city.title ?? city.name}</h3>
            <p>{city.description ?? city.subtitle}</p>
            <button className="wc-button" style={{ marginTop: 6, fontSize: 10, padding: "4px 10px" }}>Select City</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function HowToPlayScreen() {
  const startGame = useGameStore((s) => s.startGame);
  return (
    <div className="screen">
      <p className="eyebrow">HOW TO PLAY</p>
      <h2 style={{ marginTop: 4 }}>Quick Rules</h2>
      <div style={{ maxWidth: 500, textAlign: "left", marginTop: 16, lineHeight: 1.8, fontSize: 13 }}>
        <p>🎯 <strong>Goal:</strong> Net Zero emissions in 8 rounds while keeping the city thriving</p>
        <p>👥 <strong>Roles:</strong> 4 unique roles with special abilities</p>
        <p>🃏 <strong>Actions:</strong> Pick Primary + optional Support, then Lock In</p>
        <p>📊 <strong>6 Indicators:</strong> Economy, Emissions, Trust, Equity, Resilience, Energy</p>
        <p>✨ <strong>Synergies:</strong> Coordinate roles for bonus effects</p>
        <p>🎯 <strong>Wildcards:</strong> Unexpected events each round</p>
      </div>
      <button className="wc-button" style={{ marginTop: 20 }} onClick={startGame}>Continue to Round 1</button>
    </div>
  );
}

function EndingScreen() {
  const game = useGameStore((s) => s.game);
  const resetGame = useGameStore((s) => s.resetGame);
  const ending = endings.find((e: any) => e.id === (game as any).endingId);
  return (
    <div className="ending-screen">
      <div className="ending-card">
        <h1 className="ending-card__title">{ending?.title ?? "Game Over"}</h1>
        <p className="ending-card__body">{ending?.narrative ?? ending?.title ?? "The campaign has ended."}</p>
        <div className="ending-card__stats">
          {Object.entries(game.city.indicators).map(([k, v]) => (
            <span key={k} className="delta-chip delta-chip--zero">{k}: {v as number}</span>
          ))}
        </div>
        <button className="wc-button" style={{ marginTop: 16 }} onClick={resetGame}>Play Again</button>
      </div>
    </div>
  );
}

export default function App() {
  const screen = useGameStore((s) => s.screen);
  switch (screen) {
    case "attract": return <AttractScreen />;
    case "roleIntro": return <RoleIntroScreen />;
    case "citySelect": return <CitySelectScreen />;
    case "howToPlay": return <HowToPlayScreen />;
    case "game": return <TabletopGameScreen />;
    case "ending": return <EndingScreen />;
    default: return <AttractScreen />;
  }
}
