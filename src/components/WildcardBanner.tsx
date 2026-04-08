import { AnimatePresence, motion } from "framer-motion";

type WildcardBannerProps = {
  title: string;
  description: string;
};

export function WildcardBanner({ title, description }: WildcardBannerProps) {
  return (
    <AnimatePresence>
      <motion.section
        className="wildcard-banner"
        initial={{ opacity: 0, scale: 0.96, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <strong>Wildcard: {title}</strong>
        <p>{description}</p>
      </motion.section>
    </AnimatePresence>
  );
}
