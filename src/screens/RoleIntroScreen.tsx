import { motion } from "framer-motion";
import { useGameStore } from "../store/useGameStore";

const roleCards = [
  {
    title: "Government",
    identity: "Balances city-wide outcomes under constant political pressure.",
    constraint: "Constraint: trust losses hit legitimacy quickly.",
    superpower: "Superpower: sets direction with high-leverage policy moves.",
  },
  {
    title: "Business",
    identity: "Drives investment, jobs, and implementation speed.",
    constraint: "Constraint: confidence drops when friction and uncertainty rise.",
    superpower: "Superpower: can accelerate market-scale transition effects.",
  },
  {
    title: "Community",
    identity: "Protects fairness and neighborhood-level legitimacy.",
    constraint: "Constraint: capacity is limited when trust collapses.",
    superpower: "Superpower: cushions shocks and keeps equity in the game.",
  },
  {
    title: "Youth Activist",
    identity: "Pushes urgency, accountability, and future-facing choices.",
    constraint: "Constraint: confrontational plays can increase friction.",
    superpower: "Superpower: unlocks narrative and coalition momentum.",
  },
] as const;

export function RoleIntroScreen() {
  const goToCitySelect = useGameStore((state) => state.goToCitySelect);

  return (
    <section className="screen role-intro-screen" role="button" tabIndex={0} onClick={goToCitySelect}>
      <header>
        <p className="eyebrow">Roles</p>
        <h2>Each player carries a different mandate</h2>
        <p>Tap anywhere to continue.</p>
      </header>
      <div className="role-intro-grid">
        {roleCards.map((role, idx) => (
          <motion.article
            key={role.title}
            className="wc-card role-intro-card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.28 }}
          >
            <h3>{role.title}</h3>
            <p>{role.identity}</p>
            <p className="muted">{role.constraint}</p>
            <p className="muted">{role.superpower}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
