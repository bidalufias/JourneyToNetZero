import { useState } from "react";
import { useGameStore } from "./store/useGameStore";
import { TabletopView } from "./screens/TabletopView";
import "./App.css";

/* ── How to Play Modal ── */
function HowToPlayModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>✕</button>
        <div className="modal__title">How to Play</div>

        <div className="modal__section">
          <div className="modal__heading">🏙️ The Setup</div>
          <p>
            You and 3 friends sit around a table, each representing a <strong>stakeholder</strong> in
            the same city: <strong>Government</strong>, <strong>Business</strong>, <strong>Community</strong>,
            and <strong>Youth</strong>. Your city must reach <strong>Net Zero</strong> emissions in 8 rounds
            — or at least survive the attempt.
          </p>
        </div>

        <div className="modal__section">
          <div className="modal__heading">🎯 Objectives</div>
          <p>
            Each player secretly picks a <strong>public objective</strong> and an optional <strong>secret objective</strong>.
            These score you individually at the end — but they <em>clash</em> with other players' goals.
            You'll need to negotiate, bluff, and compromise.
          </p>
        </div>

        <div className="modal__section">
          <div className="modal__heading">⚡ Each Round</div>
          <ol className="modal__list">
            <li><strong>Event:</strong> A crisis or opportunity hits the city (floods, investors, protests…).</li>
            <li><strong>Wildcard:</strong> A twist — maybe a role swap, a double-cost round, or a surprise alliance.</li>
            <li><strong>Pick actions:</strong> Each player chooses one <strong>primary action</strong> (costs ⚔️ and/or 🛡️) and one optional <strong>support</strong> action.</li>
            <li><strong>Lock in:</strong> Once everyone locks, the round resolves together.</li>
            <li><strong>Resolve:</strong> All effects apply at once — synergies trigger, indicators shift, friction rises or falls.</li>
          </ol>
        </div>

        <div className="modal__section">
          <div className="modal__heading">📊 The 6 City Indicators</div>
          <div className="modal__indicators">
            <span>💰 <strong>Economy</strong> — the city's wealth</span>
            <span>🏭 <strong>Emissions</strong> — pollution level</span>
            <span>🤝 <strong>Trust</strong> — public confidence</span>
            <span>⚖️ <strong>Equity</strong> — fairness across groups</span>
            <span>🛡️ <strong>Resilience</strong> — ability to absorb shocks</span>
            <span>⚡ <strong>Energy Security</strong> — reliable clean power</span>
          </div>
          <p>
            Push emissions down while keeping everything else stable. If any indicator
            hits <strong>0</strong>, the city collapses. If friction maxes out, alliances break.
          </p>
        </div>

        <div className="modal__section">
          <div className="modal__heading">🏆 Winning</div>
          <p>
            The <strong>city wins collectively</strong> if it reaches net-zero emissions with decent resilience.
            But individual <strong>verdicts</strong> — Hero, Selfish, Team Player, The Pivot, Pyrrhic Victory, or Lost —
            depend on whether <em>you</em> hit your personal objectives. The best games end with everyone arguing
            about who truly won.
          </p>
        </div>

        <div className="modal__section modal__section--tip">
          <div className="modal__heading">💬 Table Talk</div>
          <p>
            This is a <em>tabletop</em> game. Talk to each other! Negotiate deals, call out hypocrisy,
            form alliances, break them. The cards give you options — the conversation is the real game.
          </p>
        </div>

        <button className="btn btn--filled modal__cta" onClick={onClose}>Got it</button>
      </div>
    </div>
  );
}

function AttractScreen() {
  const goToTabletop = useGameStore((s) => s.goToTabletop);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="attract">
      <p className="attract__tag">Tabletop Climate Simulation</p>
      <h1 className="attract__title">Journey to Net Zero</h1>
      <p className="attract__sub">4 players · 8 rounds · 1 city</p>
      <div className="attract__buttons">
        <button className="btn" onClick={goToTabletop}>Start Game</button>
        <button className="btn btn--outline" onClick={() => setShowHelp(true)}>How to Play</button>
      </div>
      {showHelp && <HowToPlayModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}

export default function App() {
  const screen = useGameStore((s) => s.screen);
  return screen === "attract" ? <AttractScreen /> : <TabletopView />;
}
