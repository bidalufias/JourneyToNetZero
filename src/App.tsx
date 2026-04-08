import { AnimatePresence, motion } from "framer-motion";
import { AttractScreen } from "./screens/AttractScreen";
import { CitySelectScreen } from "./screens/CitySelectScreen";
import { EndingScreen } from "./screens/EndingScreen";
import { GameScreen } from "./screens/GameScreen";
import { HowToPlayScreen } from "./screens/HowToPlayScreen";
import { RoleIntroScreen } from "./screens/RoleIntroScreen";
import { useGameStore } from "./store/useGameStore";

function App() {
  const screen = useGameStore((state) => state.screen);
  const game = useGameStore((state) => state.game);
  const showResolution = useGameStore((state) => state.showResolution);

  const selectPrimaryAction = useGameStore((state) => state.selectPrimaryAction);
  const selectSupportAction = useGameStore((state) => state.selectSupportAction);
  const toggleLock = useGameStore((state) => state.toggleLock);
  const resolveRoundNow = useGameStore((state) => state.resolveRoundNow);
  const closeResolution = useGameStore((state) => state.closeResolution);
  const resetGame = useGameStore((state) => state.resetGame);

  return (
    <main className="app-shell">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          className="screen-frame"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        >
          {screen === "attract" && <AttractScreen />}
          {screen === "roleIntro" && <RoleIntroScreen />}
          {screen === "citySelect" && <CitySelectScreen />}
          {screen === "howToPlay" && <HowToPlayScreen />}
          {screen === "game" && (
            <GameScreen
              game={game}
              showResolution={showResolution}
              onPrimarySelect={selectPrimaryAction}
              onSupportSelect={selectSupportAction}
              onToggleLock={toggleLock}
              onResolveRound={resolveRoundNow}
              onCloseResolution={closeResolution}
            />
          )}
          {screen === "ending" && <EndingScreen game={game} onPlayAgain={resetGame} />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

export default App;
