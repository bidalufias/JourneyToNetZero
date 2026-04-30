import { motion } from "framer-motion";
import { useGameStore } from "../store/useGameStore";

const steps = [
  {
    title: "Choose actions",
    text: "Each role selects one primary action, then optional support.",
  },
  {
    title: "Watch impacts",
    text: "Events, wildcards, synergies, and trade-offs resolve together.",
  },
  {
    title: "Balance 6 indicators",
    text: "Economy, clean air, trust, equity, resilience, and energy security.",
  },
  {
    title: "Survive 8 rounds",
    text: "Handle shocks and end with a resilient, fair, low-carbon city.",
  },
] as const;

export function HowToPlayScreen() {
  const startGame = useGameStore((state) => state.startGame);

  return (
    <section className="screen how-to-play-screen">
      <header>
        <p className="eyebrow">How To Play</p>
        <h2>Discuss fast. Decide clearly. Own the consequences.</h2>
      </header>

      <div className="how-to-grid">
        {steps.map((step, idx) => (
          <motion.article
            className="wc-card how-to-card"
            key={step.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.24 }}
          >
            <div className="step-number">{idx + 1}</div>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </motion.article>
        ))}
      </div>

      <button className="wc-button wc-button--lg" type="button" onClick={startGame}>
        Continue to Round 1
      </button>
    </section>
  );
}
