import { motion } from "framer-motion";
import { useGameStore } from "../store/useGameStore";

export function AttractScreen() {
  const goToRoleIntro = useGameStore((state) => state.goToRoleIntro);

  return (
    <section className="screen attract-screen">
      <motion.div
        className="attract-screen__wash"
        animate={{ rotate: [0, 3, -2, 0], scale: [1, 1.03, 1.01, 1] }}
        transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
      <div className="attract-screen__content">
        <p className="eyebrow">Tabletop Climate Simulation</p>
        <h1>Journey to Net Zero</h1>
        <p className="lead">4 voices. 1 city. Hard choices.</p>
        <button className="wc-button wc-button--lg" type="button" onClick={goToRoleIntro}>
          Start Game
        </button>
      </div>
    </section>
  );
}
