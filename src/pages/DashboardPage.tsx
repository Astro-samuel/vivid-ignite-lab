import { useState, useEffect, useMemo } from "react";
import {
  Play, CheckCircle, Trash2, Clock, Bookmark, Flame, Star, LogIn,
  Loader2, Zap, ArrowRight, BookOpen, GraduationCap, Gem, Trophy,
} from "lucide-react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProjects } from "@/hooks/useUserProjects";
import { supabase } from "@/integrations/supabase/client";

type Tab = "inProgress" | "completed" | "saved";

const quickProjects = [
  { id: 104, emoji: "🚦", title: "Traffic Light Controller", difficulty: "beginner", time: "20 mins", xp: 55, components: ["LED", "Arduino Uno", "220Ω Resistor", "Breadboard"] },
  { id: 105, emoji: "🎹", title: "Button Piano", difficulty: "beginner", time: "25 mins", xp: 65, components: ["Push Button", "Buzzer", "Arduino Uno", "Breadboard"] },
  { id: 107, emoji: "🎲", title: "Electronic Dice", difficulty: "beginner", time: "25 mins", xp: 60, components: ["LED", "Push Button", "Arduino Uno", "220Ω Resistor"] },
  { id: 109, emoji: "🌈", title: "Rainbow LED Fader", difficulty: "beginner", time: "25 mins", xp: 65, components: ["RGB LED", "Arduino Uno", "220Ω Resistor", "Breadboard"] },
  { id: 101, emoji: "💡", title: "Smart LED Mood Lamp", difficulty: "beginner", time: "30 mins", xp: 75, components: ["LED", "Photoresistor", "Arduino Uno", "220Ω Resistor"] },
  { id: 106, emoji: "🌙", title: "Automatic Night Light", difficulty: "beginner", time: "20 mins", xp: 55, components: ["LED", "Photoresistor", "Arduino Uno", "10kΩ Resistor"] },
  { id: 108, emoji: "⏰", title: "Countdown Timer", difficulty: "beginner", time: "30 mins", xp: 70, components: ["7-Segment Display", "Buzzer", "Push Button", "Arduino Uno"] },
  { id: 110, emoji: "📢", title: "Clap Switch", difficulty: "beginner", time: "30 mins", xp: 70, components: ["Sound Sensor", "LED", "Arduino Uno", "Relay Module"] },
  { id: 209, emoji: "🔔", title: "Motion Detection Alarm", difficulty: "intermediate", time: "40 mins", xp: 95, components: ["PIR Sensor", "Buzzer", "LED", "Arduino Uno"] },
  { id: 207, emoji: "🎯", title: "Laser Tripwire Alarm", difficulty: "intermediate", time: "45 mins", xp: 100, components: ["Laser Module", "Photoresistor", "Buzzer", "Arduino Uno"] },
  { id: 201, emoji: "🌡️", title: "Weather Station Dashboard", difficulty: "intermediate", time: "60 mins", xp: 150, components: ["DHT22", "BMP180", "OLED Display", "Arduino Uno"] },
  { id: 205, emoji: "⏱️", title: "Reaction Time Game", difficulty: "intermediate", time: "40 mins", xp: 90, components: ["LED", "Push Button", "LCD 16x2", "Arduino Uno"] },
  { id: 204, emoji: "📻", title: "IR Remote Decoder", difficulty: "intermediate", time: "35 mins", xp: 85, components: ["IR Receiver", "Arduino Uno", "Breadboard", "Jumper Wires"] },
  { id: 305, emoji: "🚁", title: "Ultrasonic Radar Scanner", difficulty: "advanced", time: "90 mins", xp: 200, components: ["HC-SR04", "Servo Motor", "Arduino Uno", "Breadboard"] },
  { id: 303, emoji: "🏠", title: "Smart Home Controller", difficulty: "advanced", time: "100 mins", xp: 220, components: ["ESP8266", "Relay Module", "LED", "Arduino Uno"] },
  { id: 301, emoji: "🔊", title: "Theremin Synthesizer", difficulty: "advanced", time: "75 mins", xp: 175, components: ["HC-SR04", "Piezo Buzzer", "Arduino Uno", "LED Strip"] },
];

function getInventoryComponents(userId?: string): string[] {
  try {
    const key = userId ? `inventory_${userId}` : "userInventory";
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch { return []; }
}

const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const style =
    difficulty === "beginner"
      ? { background: "#DCFCE7", color: "#16A34A", border: "2px solid #86EFAC" }
      : difficulty === "intermediate"
      ? { background: "#FFFBEB", color: "#D97706", border: "2px solid #FDE68A" }
      : { background: "#F5F3FF", color: "#7C3AED", border: "2px solid #C4B5FD" };
  return (
    <span
      className="text-xs px-2.5 py-0.5 rounded-full font-bold capitalize"
      style={{ fontFamily: "'Baloo 2', sans-serif", ...style }}
    >
      {difficulty}
    </span>
  );
}

function WhatCanIMakeWidget({
  navigate,
  userId,
  userProjectIds,
}: {
  navigate: (path: string) => void;
  userId?: string;
  userProjectIds: Set<number>;
}) {
  const inventory = useMemo(() => getInventoryComponents(userId), [userId]);
  const inventoryNorm = inventory.map(c => c.replace(/ ×\d+$/, "").replace(/\s×\d+/, "").toLowerCase().trim());
  const availableProjects = quickProjects.filter(p => !userProjectIds.has(p.id));
  const buildable = availableProjects.filter(p =>
    p.components.every(req =>
      inventoryNorm.some(owned => owned.includes(req.toLowerCase()) || req.toLowerCase().includes(owned))
    )
  );

  if (inventory.length === 0) {
    return (
      <motion.div
        className="clay-card p-5 mb-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Zap size={18} style={{ color: "#6366F1" }} />
          <span className="font-black text-sm" style={{ fontFamily: "'Baloo 2', sans-serif", color: "hsl(244, 61%, 33%)" }}>
            What Can I Make?
          </span>
        </div>
        <p className="text-sm font-semibold mb-3" style={{ color: "hsl(240, 14%, 60%)" }}>
          Add components to your inventory to see projects you can build right now!
        </p>
        <button
          onClick={() => navigate("/components")}
          className="clay-btn clay-btn-primary clay-btn-sm"
          id="setup-inventory-btn"
        >
          Set Up Inventory
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="clay-card p-5 mb-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap size={18} style={{ color: "#6366F1" }} />
          <span className="font-black text-sm" style={{ fontFamily: "'Baloo 2', sans-serif", color: "hsl(244, 61%, 33%)" }}>
            What Can I Make?
          </span>
          <span
            className="text-xs px-2.5 py-0.5 rounded-full font-black"
            style={{ background: "#DCFCE7", color: "#16A34A", border: "2px solid #86EFAC", fontFamily: "'Baloo 2', sans-serif" }}
          >
            {buildable.length} ready
          </span>
        </div>
        <button
          onClick={() => navigate("/generate")}
          className="text-xs font-black"
          style={{ color: "#6366F1" }}
          id="see-all-projects-btn"
        >
          See all →
        </button>
      </div>

      {buildable.length === 0 ? (
        <div>
          <p className="text-sm font-semibold mb-3" style={{ color: "hsl(240, 14%, 60%)" }}>
            No fully buildable projects found. Try adding more components!
          </p>
          <button
            onClick={() => navigate("/components")}
            className="clay-btn clay-btn-ghost clay-btn-sm"
          >
            Update Inventory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {buildable.slice(0, 3).map(p => (
            <button
              key={p.id}
              id={`buildable-project-${p.id}`}
              onClick={() => {
                localStorage.setItem("activeGeneratedProject", JSON.stringify({
                  id: p.id, emoji: p.emoji, title: p.title, difficulty: p.difficulty,
                  time: p.time, xp: p.xp, components: p.components, source: "dashboard",
                }));
                navigate(`/project/${p.id}`);
              }}
              className="rounded-2xl p-3 text-left transition-all cursor-pointer"
              style={{
                background: "#EEF2FF",
                border: "2px solid #C7D2FE",
                boxShadow: "0 3px 0 0 #A5B4FC",
              }}
            >
              <div className="text-xl mb-1">{p.emoji}</div>
              <p className="text-xs font-black truncate" style={{ color: "hsl(244, 61%, 33%)", fontFamily: "'Baloo 2', sans-serif" }}>
                {p.title}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-semibold" style={{ color: "hsl(240, 14%, 60%)" }}>{p.time}</span>
                <span className="text-[10px] font-black" style={{ color: "#A855F7" }}>+{p.xp}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("inProgress");
  const navigate = useNavigate();
  const [toast, setToast] = useState("");
  const { user, loading: authLoading } = useAuth();
  const { projects, loading: projectsLoading, deleteProject } = useUserProjects();
  const userProjectIds = useMemo(() => new Set(projects.map(p => p.project_id)), [projects]);
  const [navigatingId, setNavigatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [dbXp, setDbXp] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [streakAnimating, setStreakAnimating] = useState(false);

  useEffect(() => {
    if (!user) return;
    const updateStreak = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("total_xp, streak_days, last_active_date")
        .eq("id", user.id)
        .single();
      if (!data) return;

      const today = new Date().toISOString().split("T")[0];
      const lastActive = data.last_active_date as string | null;
      let newStreak = data.streak_days || 0;

      if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastActive === yesterdayStr) {
          newStreak = (data.streak_days || 0) + 1;
        } else if (!lastActive) {
          newStreak = 1;
        } else {
          newStreak = 1;
        }

        await supabase.from("profiles").update({ last_active_date: today, streak_days: newStreak }).eq("id", user.id);
      }

      const prevStreak = streakDays;
      setDbXp(data.total_xp || 0);
      setStreakDays(newStreak);

      if (prevStreak !== newStreak && newStreak > 0 && prevStreak !== 0) {
        setStreakAnimating(true);
        setTimeout(() => setStreakAnimating(false), 2000);
      }
    };
    updateStreak();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const invKey = `inventory_${user.id}`;
    if (localStorage.getItem(invKey)) return;
    supabase.from("profiles").select("ai_preferences").eq("id", user.id).single().then(({ data }) => {
      const inventory = (data?.ai_preferences as any)?.inventory_v1;
      if (inventory) {
        const names = Object.keys(inventory);
        localStorage.setItem(invKey, JSON.stringify(names));
        showToast("Inventory restored!");
      }
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (localStorage.getItem(`onboarding_${user.id}`)) return;
    supabase.from("profiles").select("display_name").eq("id", user.id).single().then(({ data }) => {
      if (data?.display_name) {
        localStorage.setItem(`onboarding_${user.id}`, "done");
      } else {
        navigate("/onboarding");
      }
    });
  }, [user, navigate]);

  const openProject = async (p: typeof projects[0]) => {
    setNavigatingId(p.project_id);
    await new Promise(r => setTimeout(r, 500));
    localStorage.setItem("activeGeneratedProject", JSON.stringify({
      id: p.project_id, emoji: p.emoji, title: p.title, description: p.description,
      desc: p.description, difficulty: p.difficulty, time: p.time, xp: p.xp,
      components: p.components || [], source: "dashboard",
    }));
    navigate(`/project/${p.project_id}`);
  };

  const handleDelete = async (projectId: number) => {
    setDeletingId(projectId);
    await new Promise(r => setTimeout(r, 400));
    await deleteProject(projectId);
    setDeletingId(null);
    showToast("Project removed");
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const inProgressProjects = projects.filter(p => p.status === "inProgress");
  const completedProjects = projects.filter(p => p.status === "completed");
  const savedProjects = projects.filter(p => p.status === "saved");

  const dailyChallenges = useMemo(() => {
    const hasCompletedToday = completedProjects.some(p => {
      const updated = new Date(p.updated_at);
      return updated.toDateString() === new Date().toDateString();
    });
    return [
      { title: "Complete a Project", desc: "Finish any project from the catalog", xp: 50, done: hasCompletedToday },
      { title: "Work on a Project", desc: "Continue or start any project", xp: 25, done: inProgressProjects.length > 0 },
      { title: "Keep Your Streak", desc: `${streakDays} day streak`, xp: 35, done: streakDays > 0 },
    ];
  }, [completedProjects, inProgressProjects, streakDays]);

  if (!authLoading && !user) {
    return (
      <Layout>
        <div className="px-4 py-12 max-w-lg mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-6"
              style={{ background: "#EEF2FF", border: "3px solid #C7D2FE", boxShadow: "0 5px 0 0 #A5B4FC" }}
            >
              🔒
            </div>
            <h1 className="text-3xl font-black mb-2" style={{ fontFamily: "'Baloo 2', sans-serif", color: "hsl(244, 61%, 33%)" }}>
              Sign in to continue
            </h1>
            <p className="text-sm font-semibold mb-6" style={{ color: "hsl(240, 14%, 60%)" }}>
              Save projects, track progress, and earn XP
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="clay-btn clay-btn-primary clay-btn-lg mx-auto"
              id="dashboard-signin-btn"
            >
              <LogIn size={18} />
              Sign In / Sign Up
            </button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const tabs: { id: Tab; label: string; count: number; emoji: string }[] = [
    { id: "inProgress", label: "In Progress", count: inProgressProjects.length, emoji: "▶️" },
    { id: "completed",  label: "Completed",   count: completedProjects.length,  emoji: "✅" },
    { id: "saved",      label: "Saved",       count: savedProjects.length,      emoji: "🔖" },
  ];

  return (
    <Layout>
      <div className="px-4 md:px-6 py-6 max-w-4xl mx-auto">

        {/* ── Page Header ── */}
        <motion.div className="mb-6" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black mb-0.5" style={{ fontFamily: "'Baloo 2', sans-serif", color: "hsl(244, 61%, 33%)" }}>
            Dashboard
          </h1>
          <p className="text-sm font-semibold" style={{ color: "hsl(240, 14%, 60%)" }}>
            Track your progress and keep the streak alive 🔥
          </p>
        </motion.div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "In Progress", value: inProgressProjects.length, bg: "#EEF2FF", border: "#C7D2FE", shadow: "#A5B4FC", text: "#4F46E5", emoji: "▶️" },
            { label: "Completed",   value: completedProjects.length,  bg: "#DCFCE7", border: "#86EFAC", shadow: "#4ADE80", text: "#16A34A", emoji: "✅" },
            { label: "Saved",       value: savedProjects.length,      bg: "#F5F3FF", border: "#C4B5FD", shadow: "#A78BFA", text: "#7C3AED", emoji: "🔖" },
            { label: "Total XP",    value: dbXp,                      bg: "#FFFBEB", border: "#FDE68A", shadow: "#FCD34D", text: "#D97706", emoji: "💎" },
          ].map(({ label, value, bg, border, shadow, text, emoji }, i) => (
            <motion.div
              key={label}
              className="rounded-2xl p-5 text-center"
              style={{
                background: bg,
                border: `2.5px solid ${border}`,
                boxShadow: `0 5px 0 0 ${shadow}`,
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 25 }}
              whileHover={{ translateY: -2, boxShadow: `0 7px 0 0 ${shadow}` }}
            >
              <div className="text-2xl mb-1">{emoji}</div>
              <p className="text-3xl font-black" style={{ fontFamily: "'Baloo 2', sans-serif", color: text }}>
                {value.toLocaleString()}
              </p>
              <p className="text-xs font-bold mt-0.5" style={{ color: "hsl(240, 14%, 60%)" }}>{label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Welcome guide for new users ── */}
        {inProgressProjects.length === 0 && completedProjects.length === 0 && savedProjects.length === 0 && (
          <motion.div
            className="clay-card p-6 mb-6 overflow-hidden relative"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {/* Decorative bubble */}
            <div
              className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
              style={{ background: "#6366F1" }}
            />
            <div className="relative z-10 flex flex-col sm:flex-row gap-5 items-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: "#EEF2FF", border: "2.5px solid #C7D2FE", boxShadow: "0 4px 0 0 #A5B4FC" }}
              >
                🚀
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-black mb-1" style={{ fontFamily: "'Baloo 2', sans-serif", color: "hsl(244, 61%, 33%)" }}>
                  Welcome to ArduinoLab!
                </h2>
                <p className="text-sm font-semibold mb-4" style={{ color: "hsl(240, 14%, 60%)" }}>
                  Your workspace is ready. Let's build your first project!
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    onClick={() => navigate("/catalog")}
                    className="clay-btn clay-btn-primary clay-btn-sm"
                    id="welcome-browse-btn"
                  >
                    Browse Projects <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => navigate("/learn")}
                    className="clay-btn clay-btn-ghost clay-btn-sm"
                    id="welcome-learn-btn"
                  >
                    <GraduationCap size={14} /> Start Learning
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Streak + Daily Challenges ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

          {/* Streak Calendar */}
          <motion.div
            className="clay-card p-5"
            animate={streakAnimating ? { scale: [1, 1.03, 1] } : {}}
            transition={{ duration: 0.8 }}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <motion.div animate={streakAnimating ? { rotate: [0, -15, 15, 0], scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.6 }}>
                  <Flame size={18} style={{ color: streakDays > 0 ? "#F59E0B" : "#94A3B8" }} />
                </motion.div>
                <span className="font-black text-sm" style={{ fontFamily: "'Baloo 2', sans-serif", color: "hsl(244, 61%, 33%)" }}>
                  Daily Streak
                </span>
              </div>
              <motion.span
                className="font-black text-sm px-3 py-1 rounded-full"
                style={{
                  background: streakDays > 0 ? "#FFFBEB" : "#F1F5F9",
                  color: streakDays > 0 ? "#D97706" : "#94A3B8",
                  border: `2px solid ${streakDays > 0 ? "#FDE68A" : "#E2E8F0"}`,
                  fontFamily: "'Baloo 2', sans-serif",
                }}
                animate={streakAnimating ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {streakDays} {streakDays === 1 ? "day" : "days"} {streakAnimating ? "🎉" : ""}
              </motion.span>
            </div>

            {/* Week calendar dots — Duolingo style */}
            <div className="flex gap-2 justify-between">
              {(() => {
                const now = new Date();
                const todayDayIdx = (now.getDay() + 6) % 7;
                return dayLabels.map((d, i) => {
                  const daysAgo = todayDayIdx - i;
                  const active = daysAgo >= 0 && daysAgo < streakDays;
                  const isToday = i === todayDayIdx;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <motion.div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
                        style={
                          active
                            ? { background: "#22C55E", color: "white", border: "2.5px solid #16A34A", boxShadow: "0 3px 0 0 #15803D" }
                            : { background: "hsl(238, 80%, 95%)", color: "hsl(240, 14%, 65%)", border: "2px solid hsl(238, 45%, 88%)" }
                        }
                        initial={false}
                        animate={active && streakAnimating ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                      >
                        {active ? "✓" : d}
                      </motion.div>
                      <span
                        className="text-[10px] font-bold"
                        style={{ color: isToday ? "#6366F1" : active ? "#16A34A" : "hsl(240, 14%, 65%)" }}
                      >
                        {d}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </motion.div>

          {/* Daily Challenges */}
          <motion.div
            className="clay-card p-5"
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Star size={18} style={{ color: "#F59E0B" }} />
              <span className="font-black text-sm" style={{ fontFamily: "'Baloo 2', sans-serif", color: "hsl(244, 61%, 33%)" }}>
                Daily Challenges
              </span>
            </div>

            <div className="space-y-3">
              {dailyChallenges.map((c, i) => (
                <motion.div
                  key={i}
                  className="flex items-center justify-between rounded-xl p-3"
                  style={{
                    background: c.done ? "#DCFCE7" : "hsl(238, 80%, 96%)",
                    border: `2px solid ${c.done ? "#86EFAC" : "hsl(238, 45%, 88%)"}`,
                  }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: c.done ? "#22C55E" : "white",
                        border: `2px solid ${c.done ? "#16A34A" : "hsl(238, 45%, 82%)"}`,
                      }}
                    >
                      {c.done && <CheckCircle size={14} color="white" strokeWidth={3} />}
                    </div>
                    <div>
                      <p
                        className="text-xs font-black"
                        style={{
                          color: c.done ? "#15803D" : "hsl(244, 61%, 33%)",
                          textDecoration: c.done ? "line-through" : "none",
                          fontFamily: "'Baloo 2', sans-serif",
                        }}
                      >
                        {c.title}
                      </p>
                      <p className="text-[10px] font-semibold" style={{ color: "hsl(240, 14%, 60%)" }}>{c.desc}</p>
                    </div>
                  </div>
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: "#F5F3FF", color: "#7C3AED", border: "2px solid #C4B5FD", fontFamily: "'Baloo 2', sans-serif" }}
                  >
                    +{c.xp} XP
                  </span>
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => navigate("/achievements")}
              className="clay-btn clay-btn-primary w-full mt-4"
              style={{ borderRadius: 14 }}
              id="view-all-challenges-btn"
            >
              <Trophy size={15} /> View Achievements
            </button>
          </motion.div>
        </div>

        {/* ── Learning Pathway ── */}
        <motion.div
          className="clay-card p-5 mb-6"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen size={18} style={{ color: "#6366F1" }} />
              <span className="font-black text-sm" style={{ fontFamily: "'Baloo 2', sans-serif", color: "hsl(var(--foreground))" }}>
                Learning Pathway
              </span>
            </div>
            <button
              onClick={() => navigate("/learn")}
              className="text-xs font-black flex items-center gap-1"
              style={{ color: "hsl(var(--primary))" }}
              id="go-to-learn-btn"
            >
              📚 Explore Learning Hub
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { step: 1, label: "LED Basics", emoji: "💡", done: completedProjects.length >= 1 },
              { step: 2, label: "Sensors",    emoji: "🌡️", done: completedProjects.length >= 2 },
              { step: 3, label: "Motors",     emoji: "🤖", done: completedProjects.length >= 3 },
              { step: 4, label: "Displays",   emoji: "📺", done: completedProjects.length >= 5 },
              { step: 5, label: "Wireless",   emoji: "📡", done: completedProjects.length >= 7 },
              { step: 6, label: "IoT",        emoji: "🏠", done: completedProjects.length >= 10 },
            ].map((s, i, arr) => (
              <div key={s.step} className="flex items-center gap-2 flex-shrink-0">
                <motion.div
                  className="flex flex-col items-center gap-1 min-w-[64px]"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                    style={
                      s.done
                        ? { background: "#DCFCE7", border: "2.5px solid #86EFAC", boxShadow: "0 3px 0 0 #4ADE80" }
                        : { background: "hsl(238, 80%, 95%)", border: "2px solid hsl(238, 45%, 88%)", boxShadow: "0 3px 0 0 hsl(238, 45%, 82%)" }
                    }
                  >
                    {s.done ? "✅" : s.emoji}
                  </div>
                  <p
                    className="text-[10px] font-black text-center"
                    style={{ color: s.done ? "#16A34A" : "hsl(244, 61%, 33%)", fontFamily: "'Baloo 2', sans-serif" }}
                  >
                    {s.label}
                  </p>
                </motion.div>
                {i < arr.length - 1 && (
                  <div
                    style={{
                      width: 24,
                      height: 3,
                      borderTop: `3px dashed ${s.done ? "#22C55E" : "hsl(238, 45%, 82%)"}`,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── What Can I Make? ── */}
        <WhatCanIMakeWidget navigate={navigate} userId={user?.id} userProjectIds={userProjectIds} />

        {/* ── Project Tabs ── */}
        <div className="flex gap-2 mb-5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-black cursor-pointer transition-all"
                style={
                  isActive
                    ? {
                        background: "#EEF2FF",
                        color: "#4F46E5",
                        border: "2.5px solid #C7D2FE",
                        boxShadow: "0 3px 0 0 #A5B4FC",
                        fontFamily: "'Baloo 2', sans-serif",
                      }
                    : {
                        background: "white",
                        color: "hsl(240, 14%, 60%)",
                        border: "2px solid hsl(238, 45%, 88%)",
                        fontFamily: "'Baloo 2', sans-serif",
                      }
                }
              >
                {tab.emoji} {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>

        {/* ── Loading ── */}
        {projectsLoading && (
          <div className="text-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full border-4 mx-auto mb-3"
              style={{ borderColor: "#E0E7FF", borderTopColor: "#6366F1" }}
            />
            <p className="font-bold text-sm" style={{ color: "hsl(240, 14%, 60%)", fontFamily: "'Baloo 2', sans-serif" }}>
              Loading projects...
            </p>
          </div>
        )}

        {/* ── Tab Content — In Progress ── */}
        <AnimatePresence mode="wait">
          {!projectsLoading && activeTab === "inProgress" && (
            <motion.div
              key="inProgress"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {inProgressProjects.map((p) => (
                <div
                  key={p.id}
                  className="clay-card p-5"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: "#EEF2FF", border: "2px solid #C7D2FE" }}
                    >
                      {p.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="font-black" style={{ fontFamily: "'Baloo 2', sans-serif", color: "hsl(244, 61%, 33%)" }}>
                            {p.title}
                          </h3>
                          <p className="text-xs font-semibold mt-0.5 line-clamp-1" style={{ color: "hsl(240, 14%, 60%)" }}>
                            {p.description || ""}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            id={`continue-project-${p.project_id}`}
                            onClick={() => openProject(p)}
                            disabled={navigatingId === p.project_id}
                            className="clay-btn clay-btn-success clay-btn-sm disabled:opacity-60"
                          >
                            {navigatingId === p.project_id
                              ? <><Loader2 size={12} className="animate-spin" /> Loading...</>
                              : <><Play size={12} /> Continue</>}
                          </button>
                          <button
                            id={`delete-project-${p.project_id}`}
                            onClick={() => handleDelete(p.project_id)}
                            disabled={deletingId === p.project_id}
                            className="clay-btn clay-btn-danger clay-btn-sm disabled:opacity-60"
                            style={{ padding: "8px 10px" }}
                          >
                            {deletingId === p.project_id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <DifficultyBadge difficulty={p.difficulty || "beginner"} />
                        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "hsl(240, 14%, 60%)" }}>
                          <Clock size={11} /> {p.time}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="clay-progress-track" style={{ height: 12 }}>
                        <motion.div
                          className="clay-progress-fill"
                          style={{ height: "100%" }}
                          initial={{ width: 0 }}
                          animate={{ width: `${p.progress || 0}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                        />
                      </div>
                      <p className="text-right text-xs font-black mt-1" style={{ color: "#16A34A", fontFamily: "'Baloo 2', sans-serif" }}>
                        {p.progress || 0}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {inProgressProjects.length === 0 && (
                <EmptyState emoji="🚀" message="No projects in progress. Start one!" action={() => navigate("/generate")} actionLabel="Generate a Project" />
              )}
            </motion.div>
          )}

          {/* ── Tab Content — Completed ── */}
          {!projectsLoading && activeTab === "completed" && (
            <motion.div key="completed" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {completedProjects.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl p-5"
                  style={{ background: "#DCFCE7", border: "2.5px solid #86EFAC", boxShadow: "0 4px 0 0 #4ADE80" }}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{p.emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black" style={{ fontFamily: "'Baloo 2', sans-serif", color: "hsl(244, 61%, 33%)" }}>{p.title}</h3>
                            <CheckCircle size={16} style={{ color: "#16A34A" }} />
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <DifficultyBadge difficulty={p.difficulty || "beginner"} />
                            <span className="text-xs font-black" style={{ color: "#16A34A", fontFamily: "'Baloo 2', sans-serif" }}>
                              +{p.xp} XP
                            </span>
                          </div>
                        </div>
                        <button
                          id={`view-code-${p.project_id}`}
                          onClick={() => openProject(p)}
                          disabled={navigatingId === p.project_id}
                          className="clay-btn clay-btn-ghost clay-btn-sm disabled:opacity-60"
                        >
                          {navigatingId === p.project_id ? <><Loader2 size={12} className="animate-spin" /> Loading...</> : "View Code"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {completedProjects.length === 0 && (
                <EmptyState emoji="🏆" message="No completed projects yet. Start building!" action={() => navigate("/catalog")} actionLabel="Browse Catalog" />
              )}
            </motion.div>
          )}

          {/* ── Tab Content — Saved ── */}
          {!projectsLoading && activeTab === "saved" && (
            <motion.div key="saved" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {savedProjects.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl p-5"
                  style={{ background: "#F5F3FF", border: "2.5px solid #C4B5FD", boxShadow: "0 4px 0 0 #A78BFA" }}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{p.emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h3 className="font-black" style={{ fontFamily: "'Baloo 2', sans-serif", color: "hsl(244, 61%, 33%)" }}>{p.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <DifficultyBadge difficulty={p.difficulty || "beginner"} />
                            <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "hsl(240, 14%, 60%)" }}>
                              <Clock size={10} /> {p.time}
                            </span>
                            <span className="text-xs font-black" style={{ color: "#7C3AED", fontFamily: "'Baloo 2', sans-serif" }}>+{p.xp} XP</span>
                          </div>
                        </div>
                        <button
                          id={`start-saved-${p.project_id}`}
                          onClick={() => openProject(p)}
                          disabled={navigatingId === p.project_id}
                          className="clay-btn clay-btn-primary clay-btn-sm disabled:opacity-60"
                        >
                          {navigatingId === p.project_id ? <><Loader2 size={12} className="animate-spin" /> Loading...</> : <><Play size={12} /> Start</>}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {savedProjects.length === 0 && (
                <EmptyState emoji="📚" message="No saved projects yet." action={() => navigate("/catalog")} actionLabel="Browse Catalog" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-24 md:bottom-6 right-6 px-5 py-3 rounded-2xl flex items-center gap-2 font-black z-50"
            style={{
              background: "#22C55E",
              color: "white",
              border: "2.5px solid #16A34A",
              boxShadow: "0 5px 0 0 #15803D",
              fontFamily: "'Baloo 2', sans-serif",
            }}
            initial={{ y: 40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <CheckCircle size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

function EmptyState({
  emoji, message, action, actionLabel,
}: {
  emoji: string;
  message: string;
  action: () => void;
  actionLabel: string;
}) {
  return (
    <motion.div
      className="text-center py-14"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"
        style={{ background: "#EEF2FF", border: "3px solid #C7D2FE", boxShadow: "0 5px 0 0 #A5B4FC" }}
      >
        {emoji}
      </div>
      <p className="font-bold text-sm mb-4" style={{ color: "hsl(240, 14%, 60%)", fontFamily: "'Baloo 2', sans-serif" }}>
        {message}
      </p>
      <button onClick={action} className="clay-btn clay-btn-primary clay-btn-sm mx-auto">
        {actionLabel}
      </button>
    </motion.div>
  );
}


