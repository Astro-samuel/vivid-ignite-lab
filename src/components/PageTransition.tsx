import { type ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [displayKey, setDisplayKey] = useState(location.pathname);

  useEffect(() => {
    if (location.pathname !== displayKey) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setDisplayKey(location.pathname);
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen">
      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "hsl(var(--background) / 0.6)", backdropFilter: "blur(4px)" }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Loader2 size={28} className="animate-spin" style={{ color: "hsl(var(--primary))" }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={displayKey}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}