import { ReactNode, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import AIMentor from "./AIMentor";
import { Flame, Gem, Heart, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link, useLocation } from "react-router-dom";
import {
  Home, GraduationCap, LayoutDashboard, BookOpen, Zap, Trophy, User,
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

// Mobile bottom nav — 5 core sections like Duolingo
const mobileNavItems = [
  { icon: Home,            label: "Home",       path: "/" },
  { icon: GraduationCap,  label: "Learn",      path: "/learn" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: BookOpen,        label: "Catalog",   path: "/catalog" },
  { icon: Trophy,          label: "Wins",      path: "/achievements" },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hearts] = useState(5); // full hearts as default
  const { user } = useAuth();
  const location = useLocation();

  // Fetch live XP + streak from profile
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
    <div
      className="flex h-screen overflow-hidden relative"
      style={{ background: "var(--background)" }}
    >
      {/* ── Desktop Sidebar ── */}
      <Sidebar />

      {/* ── Mobile overlay sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 md:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
            >
              <Sidebar mobile onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* ── Top Bar ── */}
        <header
          className="flex items-center gap-3 px-4 py-2 flex-shrink-0 relative z-30"
          style={{
            background: "var(--card)",
            borderBottom: "2.5px solid var(--border)",
            minHeight: "56px",
          }}
        >
          {/* Mobile hamburger */}
          <button
            id="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(true)}
            className="flex md:hidden items-center justify-center w-9 h-9 rounded-xl cursor-pointer transition-all"
            style={{
              background: "var(--primary-light)",
              border: "2px solid hsl(var(--primary) / 0.3)",
              color: "hsl(var(--primary))",
            }}
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>

          {/* Logo — mobile only (desktop sidebar has it) */}
          <div className="flex md:hidden items-center gap-2 flex-1">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-black"
              style={{ background: "hsl(var(--primary))" }}
            >
              A
            </div>
            <span className="font-black text-sm" style={{ fontFamily: "'Baloo 2', sans-serif", color: "hsl(var(--foreground))" }}>
              ArduinoLab
            </span>
          </div>

          {/* ── Spacer (desktop) ── */}
          <div className="flex-1 hidden md:block" />

          {/* ── Stat Pills ── */}
          {user && (
            <div className="flex items-center gap-2">
              {/* 🔥 Streak */}
              <motion.div
                className="stat-pill"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                title={`${streak}-day streak`}
              >
                <Flame
                  size={16}
                  style={{ color: streak > 0 ? "#F59E0B" : "#94A3B8" }}
                  className={streak > 0 ? "animate-heart-beat" : ""}
                />
                <span style={{ color: streak > 0 ? "hsl(38, 92%, 38%)" : "hsl(240, 14%, 60%)" }}>
                  {streak}
                </span>
              </motion.div>

              {/* 💎 XP Gems */}
              <motion.div
                className="stat-pill"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                title={`${xp} total XP`}
              >
                <Gem size={16} style={{ color: "#A855F7" }} />
                <span style={{ color: "hsl(265, 89%, 45%)" }}>{xp.toLocaleString()}</span>
              </motion.div>

              {/* ❤️ Hearts */}
              <motion.div
                className="stat-pill"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                title={`${hearts}/5 hearts`}
              >
                <Heart
                  size={16}
                  fill="#EF4444"
                  style={{ color: "#EF4444" }}
                />
                <span style={{ color: "hsl(0, 84%, 45%)" }}>{hearts}</span>
              </motion.div>
            </div>
          )}

          {/* Not signed in — minimal right side */}
          {!user && (
            <Link
              to="/auth"
              className="clay-btn clay-btn-primary clay-btn-sm"
              style={{ fontSize: "0.78rem", padding: "6px 16px" }}
            >
              Sign In
            </Link>
          )}
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto page-transition-enter pb-0">
          {children}
        </main>
      </div>

      {/* ── AI Mentor (floating) ── */}
      <AIMentor />
    </div>
  );
}
