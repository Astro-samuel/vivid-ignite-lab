import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";
import Confetti from "@/components/Confetti";

interface LevelUpContextValue {
  announceLevelUp: (newLevel: number) => void;
}

const LevelUpContext = createContext<LevelUpContextValue | null>(null);

export function useLevelUp() {
  const ctx = useContext(LevelUpContext);
  if (!ctx) throw new Error("useLevelUp must be used within a LevelUpProvider");
  return ctx;
}

export function LevelUpProvider({ children }: { children: ReactNode }) {
  const [level, setLevel] = useState<number | null>(null);

  const announceLevelUp = useCallback((newLevel: number) => {
    setLevel(newLevel);
    setTimeout(() => setLevel(null), 4000);
  }, []);

  return (
    <LevelUpContext.Provider value={{ announceLevelUp }}>
      {children}
      <AnimatePresence>
        {level !== null && (
          <motion.div
            className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <Confetti count={120} />
            <motion.div
              role="status"
              aria-live="polite"
              className="clay-card-primary relative flex flex-col items-center gap-2 px-10 py-8 text-center"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <motion.div
                animate={{ rotate: [0, -8, 8, -8, 0] }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Star size={56} className="text-white" fill="white" />
              </motion.div>
              <p className="font-display text-xs font-black uppercase tracking-widest text-white/80">
                Level Up!
              </p>
              <p className="font-display text-4xl font-black text-white">
                Level {level}
              </p>
              <p className="text-sm font-semibold text-white/90">
                You're on a roll — keep building!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LevelUpContext.Provider>
  );
}
