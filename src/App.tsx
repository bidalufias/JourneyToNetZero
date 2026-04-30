import { useGameStore } from "./store/useGameStore";
import { TabletopView } from "./screens/TabletopView";
import "./App.css";

function AttractScreen() {
  const goToTabletop = useGameStore((s) => s.goToTabletop);
  return (
    <div className="attract">
      <p className="attract__tag">Tabletop Climate Simulation</p>
      <h1 className="attract__title">Journey to Net Zero</h1>
      <p className="attract__sub">4 players · 8 rounds · 1 city</p>
      <button className="btn" onClick={goToTabletop}>Start Game</button>
    </div>
  );
}

export default function App() {
  const screen = useGameStore((s) => s.screen);
  return screen === "attract" ? <AttractScreen /> : <TabletopView />;
}
