import { ReactNode, useState, useEffect } from "react";
import Sidebar, { LogoMark } from "./Sidebar";
import AIMentor from "./AIMentor";
import { Menu, Flame, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("total_xp, streak_days")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setXp(data.total_xp || 0);
          setStreak(data.streak_days || 0);
        }
      });
  }, [user]);

  return (
    <div className="flex h-screen overflow-hidden relative bg-background">
      <Sidebar />

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 md:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
            >
              <Sidebar mobile onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center gap-3 px-4 flex-shrink-0 relative z-30 bg-card border-b-2 border-border min-h-[60px]">
          <button
            id="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(true)}
            className="flex md:hidden items-center justify-center w-9 h-9 rounded-lg cursor-pointer border-2 border-border text-foreground hover:bg-[hsl(var(--background-hover))] transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>

          <Link to="/" className="flex md:hidden items-center gap-2 flex-1" aria-label="ArduinoLab home">
            <LogoMark size={30} />
            <span className="font-black text-[22px] leading-none" style={{ color: "hsl(var(--green-bright))" }}>arduinolab</span>
          </Link>

          <div className="flex-1 hidden md:block" />

          {user ? (
            <div className="flex items-center gap-1" aria-label="Your progress">
              <div className="stat-pill" title={`${streak}-day streak`}>
                <Flame size={22} fill="currentColor" className={streak > 0 ? "text-orange-bright" : "text-[hsl(0_0%_72%)]"} aria-hidden="true" />
                <span className={streak > 0 ? "text-orange" : "text-muted-foreground"}>{streak}</span>
                <span className="sr-only">day streak</span>
              </div>
              <div className="stat-pill" title={`${xp} total XP`}>
                <Zap size={22} fill="currentColor" className="text-gold-bright" aria-hidden="true" />
                <span className="text-gold">{xp.toLocaleString()}</span>
                <span className="sr-only">XP</span>
              </div>
            </div>
          ) : (
            <Link to="/auth" className="clay-btn clay-btn-primary clay-btn-sm">
              Sign in
            </Link>
          )}
        </header>

        <main className="flex-1 overflow-y-auto page-dots">{children}</main>
      </div>

      <AIMentor />
    </div>
  );
}
