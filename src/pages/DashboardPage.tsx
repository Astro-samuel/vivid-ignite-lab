import { useState, useEffect, useMemo } from "react";
import { Play, CheckCircle, Save, Trash2, Clock, Bookmark, Flame, Star, Target, LogIn, Loader2, Zap, ArrowRight, BookOpen } from "lucide-react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import FadeInView from "@/components/motion/FadeInView";
import MotionCard from "@/components/motion/MotionCard";
import StaggerContainer, { staggerItem } from "@/components/motion/StaggerContainer";
import { motion } from "framer-motion";
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
  const styles =
    difficulty === "beginner"
      ? { background: "rgba(0,255,136,0.15)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)" }
      : difficulty === "intermediate"
      ? { background: "rgba(255,165,0,0.15)", color: "#FFA500", border: "1px solid rgba(255,165,0,0.3)" }
      : { background: "rgba(183,68,255,0.15)", color: "#B744FF", border: "1px solid rgba(183,68,255,0.3)" };
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize" style={styles}>
      {difficulty}
    </span>
  );
}

function WhatCanIMakeWidget({ navigate, userId, userProjectIds }: { navigate: (path: string) => void; userId?: string; userProjectIds: Set<number> }) {
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
      <div className="rounded-2xl border p-5 mb-6" style={{ background: "hsl(var(--primary) / 0.04)", borderColor: "hsl(var(--primary) / 0.15)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Zap size={16} style={{ color: "hsl(var(--primary))" }} />
          <span className="text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>What Can I Make?</span>
        </div>
        <p className="text-xs mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
          Add components to your inventory to see projects you can build right now!
        </p>
        <button
          onClick={() => navigate("/components")}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-deep)))", color: "hsl(var(--primary-foreground))" }}
        >
          Set Up Inventory
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-5 mb-6" style={{ background: "hsl(var(--primary) / 0.04)", borderColor: "hsl(var(--primary) / 0.15)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap size={16} style={{ color: "hsl(var(--primary))" }} />
          <span className="text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>
            What Can I Make? 
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "hsl(var(--success) / 0.15)", color: "hsl(var(--success))", border: "1px solid hsl(var(--success) / 0.3)" }}>
            {buildable.length} project{buildable.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          onClick={() => navigate("/generate")}
          className="text-xs font-semibold transition-all hover:opacity-80"
          style={{ color: "hsl(var(--primary))" }}
        >
          See all →
        </button>
      </div>

      {buildable.length === 0 ? (
        <div>
          <p className="text-xs mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
            No fully buildable projects found with your current inventory. Try adding more components!
          </p>
          <button
            onClick={() => navigate("/components")}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-deep)))", color: "hsl(var(--primary-foreground))" }}
          >
            Update Inventory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {buildable.slice(0, 3).map(p => (
            <button
              key={p.id}
              onClick={() => {
                localStorage.setItem("activeGeneratedProject", JSON.stringify({
                  id: p.id, emoji: p.emoji, title: p.title, difficulty: p.difficulty,
                  time: p.time, xp: p.xp, components: p.components, source: "dashboard",
                }));
                navigate(`/project/${p.id}`);
              }}
              className="rounded-xl p-3 text-left transition-all hover:scale-[1.02] border"
              style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
            >
              <div className="text-xl mb-1">{p.emoji}</div>
              <p className="text-xs font-bold truncate" style={{ color: "hsl(var(--foreground))" }}>{p.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{p.time}</span>
                <span className="text-xs font-bold" style={{ color: "hsl(var(--secondary))" }}>+{p.xp}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
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

  // Fetch XP and streak from profile (DB source of truth) + update streak based on calendar
  useEffect(() => {
    if (!user) return;
    const updateStreak = async () => {
      const { data } = await supabase.from("profiles").select("total_xp, streak_days, projects_completed, last_active_date").eq("id", user.id).single();
      if (!data) return;

      const today = new Date().toISOString().split("T")[0];
      const lastActive = data.last_active_date as string | null;
      let newStreak = data.streak_days || 0;

      if (lastActive !== today) {
        // Calculate if yesterday was the last active date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastActive === yesterdayStr) {
          newStreak = (data.streak_days || 0) + 1;
        } else if (!lastActive) {
          newStreak = 1;
        } else {
          newStreak = 1; // streak reset
        }

        // Update last_active_date and streak in DB
        await supabase.from("profiles").update({
          last_active_date: today,
          streak_days: newStreak,
        }).eq("id", user.id);
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

  const [streakAnimating, setStreakAnimating] = useState(false);

  // Sync inventory from DB on login (for new devices)
  useEffect(() => {
    if (!user) return;
    const invKey = `inventory_${user.id}`;
    if (localStorage.getItem(invKey)) return;
    
    supabase.from("profiles").select("ai_preferences").eq("id", user.id).single()
      .then(({ data }) => {
        const inventory = (data?.ai_preferences as any)?.inventory_v1;
        if (inventory) {
          const names = Object.keys(inventory);
          localStorage.setItem(invKey, JSON.stringify(names));
          setToast("🎒 Inventory restored!");
          setTimeout(() => setToast(""), 3000);
        }
      });
  }, [user]);

  // Check onboarding status from DB, not just localStorage
  useEffect(() => {
    if (!user) return;
    if (localStorage.getItem(`onboarding_${user.id}`)) return; // already done
    supabase.from("profiles").select("display_name").eq("id", user.id).single()
      .then(({ data }) => {
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
    localStorage.setItem(
      "activeGeneratedProject",
      JSON.stringify({
        id: p.project_id, emoji: p.emoji, title: p.title, description: p.description,
        desc: p.description, difficulty: p.difficulty, time: p.time, xp: p.xp,
        components: p.components || [], source: "dashboard",
      })
    );
    navigate(`/project/${p.project_id}`);
  };

  const handleDelete = async (projectId: number) => {
    setDeletingId(projectId);
    await new Promise(r => setTimeout(r, 400));
    await deleteProject(projectId);
    setDeletingId(null);
    showToast("Project removed");
  };

  const inProgressProjects = projects.filter(p => p.status === "inProgress");
  const completedProjects = projects.filter(p => p.status === "completed");
  const savedProjects = projects.filter(p => p.status === "saved");
  const totalXP = dbXp;

  const dailyChallenges = useMemo(() => {
    const hasCompletedToday = completedProjects.some(p => {
      const updated = new Date(p.updated_at);
      const today = new Date();
      return updated.toDateString() === today.toDateString();
    });
    const hasInProgress = inProgressProjects.length > 0;
    return [
      { icon: "🎯", title: "Complete a Project", desc: "Finish any project from the catalog", xp: 50, done: hasCompletedToday },
      { icon: "🔧", title: "Work on a Project", desc: "Continue or start any project", xp: 25, done: hasInProgress },
      { icon: "🔥", title: "Keep Your Streak", desc: `Current streak: ${streakDays} day${streakDays !== 1 ? "s" : ""}`, xp: 35, done: streakDays > 0 },
    ];
  }, [completedProjects, inProgressProjects, streakDays]);

  if (!authLoading && !user) {
    return (
      <Layout>
        <div className="px-6 py-8 max-w-5xl mx-auto text-center">
          <FadeInView>
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "hsl(var(--foreground))" }}>Sign in to access your Dashboard</h1>
            <p className="text-sm mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>Save projects, track progress, and earn XP</p>
            <button
              onClick={() => navigate("/auth")}
              className="px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 mx-auto transition-all hover:scale-105"
              style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
            >
              <LogIn size={16} /> Sign In / Sign Up
            </button>
          </FadeInView>
        </div>
      </Layout>
    );
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const tabs: { id: Tab; label: string; count: number; icon: typeof Play }[] = [
    { id: "inProgress", label: "In Progress", count: inProgressProjects.length, icon: Play },
    { id: "completed", label: "Completed", count: completedProjects.length, icon: CheckCircle },
    { id: "saved", label: "Saved", count: savedProjects.length, icon: Bookmark },
  ];

  return (
    <Layout>
      <div className="px-6 py-8 max-w-5xl mx-auto">
        {/* Header */}
        <FadeInView className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} style={{ color: "hsl(var(--primary))" }} />
            <span className="text-xs font-semibold" style={{ color: "hsl(var(--primary))" }}>Your Workspace</span>
          </div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: "hsl(var(--foreground))" }}>Dashboard</h1>
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Track your projects and see your progress</p>
        </FadeInView>

        {/* Stats Row */}
        <StaggerContainer className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "In Progress", value: inProgressProjects.length, icon: Play, color: "hsl(var(--primary))", bg: "hsl(var(--primary) / 0.08)", border: "hsl(var(--primary) / 0.2)" },
            { label: "Completed", value: completedProjects.length, icon: CheckCircle, color: "hsl(var(--success))", bg: "hsl(var(--success) / 0.08)", border: "hsl(var(--success) / 0.2)" },
            { label: "Saved", value: savedProjects.length, icon: Bookmark, color: "hsl(var(--purple))", bg: "hsl(var(--purple) / 0.08)", border: "hsl(var(--purple) / 0.2)" },
            { label: "Total XP", value: totalXP, icon: Star, color: "hsl(var(--secondary))", bg: "hsl(var(--secondary) / 0.08)", border: "hsl(var(--secondary) / 0.2)" },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <motion.div
              key={label}
              variants={staggerItem}
              className="rounded-2xl p-5 flex items-center gap-4 border"
              style={{ background: bg, borderColor: border }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}22` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-2xl font-bold font-orbitron" style={{ color }}>{value}</p>
                <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</p>
              </div>
            </motion.div>
          ))}
        </StaggerContainer>
        
        {/* Onboarding Welcome Guide for new users with 0 stats */}
        {inProgressProjects.length === 0 && completedProjects.length === 0 && savedProjects.length === 0 && (
          <FadeInView delay={0.1} className="mb-6">
            <div className="rounded-2xl p-6 border overflow-hidden relative" style={{ background: "linear-gradient(135deg, hsl(232, 42%, 11%), hsl(232, 45%, 8%))", borderColor: "hsl(var(--primary) / 0.3)" }}>
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-[80px]" style={{ background: "hsl(var(--primary) / 0.15)" }} />
              <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: "hsl(var(--primary) / 0.1)", border: "1px solid hsl(var(--primary) / 0.2)" }}>
                  🚀
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-xl font-bold mb-1" style={{ color: "hsl(var(--foreground))" }}>Welcome to ArduinoLab!</h2>
                  <p className="text-sm mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Your workspace is ready. Let's get you building your first project!
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-left">
                    <div className="p-3 rounded-xl border border-dashed transition-all hover:bg-white/5" style={{ borderColor: "hsl(var(--border))" }}>
                      <p className="text-xs font-bold mb-1 flex items-center gap-2" style={{ color: "hsl(var(--primary))" }}>
                        <BookOpen size={12} /> Step 1: Browse Catalog
                      </p>
                      <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>Discover projects tailored to your skill level.</p>
                    </div>
                    <div className="p-3 rounded-xl border border-dashed transition-all hover:bg-white/5" style={{ borderColor: "hsl(var(--border))" }}>
                      <p className="text-xs font-bold mb-1 flex items-center gap-2" style={{ color: "hsl(var(--success))" }}>
                        <Zap size={12} /> Step 2: Set Inventory
                      </p>
                      <p className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>Add components you own for custom suggestions.</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <button
                      onClick={() => navigate("/catalog")}
                      className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all hover:scale-[1.05]"
                      style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
                    >
                      Browse All Projects <ArrowRight size={14} />
                    </button>
                    <button
                      onClick={() => navigate("/components")}
                      className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-[1.05] border"
                      style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                    >
                      Add Components
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </FadeInView>
        )}

        {/* Two columns: Streak + Daily Challenges */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Streak — synced from DB */}
          <motion.div
            className="rounded-2xl p-5 border"
            style={{ background: "hsl(var(--card))", borderColor: streakAnimating ? "hsl(var(--success) / 0.5)" : "hsl(var(--border))" }}
            animate={streakAnimating ? { scale: [1, 1.03, 1], boxShadow: ["0 0 0px transparent", "0 0 20px hsl(var(--success) / 0.3)", "0 0 0px transparent"] } : {}}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <motion.div animate={streakAnimating ? { rotate: [0, -15, 15, 0], scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.6 }}>
                  <Flame size={16} style={{ color: "hsl(var(--destructive))" }} />
                </motion.div>
                <span className="text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>
                  Weekly Streak
                </span>
              </div>
              <motion.span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: "hsl(var(--destructive) / 0.15)", color: "hsl(var(--destructive))" }}
                animate={streakAnimating ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {streakDays} day{streakDays !== 1 ? "s" : ""} {streakAnimating ? "🎉" : ""}
              </motion.span>
            </div>
            <div className="flex gap-2 justify-between">
              {(() => {
                // Build actual day labels for this week (Mon-Sun) with correct "today" highlight
                const now = new Date();
                const todayDayIdx = (now.getDay() + 6) % 7; // 0=Mon, 6=Sun
                return dayLabels.map((d, i) => {
                  // Active if this day is today or within the streak window before today
                  const daysAgo = todayDayIdx - i;
                  const active = daysAgo >= 0 && daysAgo < streakDays;
                  const isToday = i === todayDayIdx;
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <motion.div
                      initial={false}
                      animate={active ? { scale: [1, 1.15, 1], backgroundColor: "hsl(var(--success) / 0.2)" } : {}}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all"
                      style={
                        active
                          ? { background: "hsl(var(--success) / 0.15)", color: "hsl(var(--success))", border: "1px solid hsl(var(--success) / 0.3)", boxShadow: "0 0 8px hsl(var(--success) / 0.2)" }
                          : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
                      }
                    >
                      {active ? "✓" : d}
                    </motion.div>
                    <span className="text-xs font-medium" style={{ color: isToday ? "hsl(var(--primary))" : active ? "hsl(var(--success))" : "hsl(var(--muted-foreground))" }}>{d}</span>
                  </div>
                );
              })})()}
            </div>
          </motion.div>

          {/* Daily Challenges — dynamic */}
          <div
            className="rounded-2xl p-5 border"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Star size={16} style={{ color: "hsl(var(--secondary))" }} />
              <span className="text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>Daily Challenges</span>
            </div>
            <div className="space-y-3">
              {dailyChallenges.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{c.icon}</span>
                    <div>
                      <p
                        className="text-xs font-semibold"
                        style={{
                          color: c.done ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))",
                          textDecoration: c.done ? "line-through" : "none",
                        }}
                      >
                        {c.title}
                      </p>
                      <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{c.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-xs font-bold" style={{ color: "hsl(var(--secondary))" }}>✦ +{c.xp}</span>
                    {c.done && <CheckCircle size={14} style={{ color: "hsl(var(--success))" }} />}
                  </div>
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => navigate("/achievements")}
              className="w-full mt-3 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, hsl(var(--purple)), hsl(var(--pink)))",
                color: "hsl(var(--foreground))",
                boxShadow: "0 0 15px hsl(var(--purple) / 0.3)",
              }}
            >
              ✦ View All Challenges
            </button>
          </div>
        </div>

        {/* Learning Pathway */}
        <FadeInView delay={0.15} className="mb-6">
          <div className="rounded-2xl border p-5" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen size={16} style={{ color: "hsl(var(--primary))" }} />
                <span className="text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>Learning Pathway</span>
              </div>
              <button onClick={() => navigate("/learn")} className="text-xs font-semibold transition-all hover:opacity-80" style={{ color: "hsl(var(--primary))" }}>
                Start Learning →
              </button>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {[
                { step: 1, label: "LED Basics", desc: "Digital output & timing", emoji: "💡", done: completedProjects.length >= 1 },
                { step: 2, label: "Sensors", desc: "Read analog data", emoji: "🌡️", done: completedProjects.length >= 2 },
                { step: 3, label: "Motors", desc: "PWM & servo control", emoji: "🤖", done: completedProjects.length >= 3 },
                { step: 4, label: "Displays", desc: "LCD & OLED output", emoji: "📺", done: completedProjects.length >= 5 },
                { step: 5, label: "Wireless", desc: "Bluetooth & WiFi", emoji: "📡", done: completedProjects.length >= 7 },
                { step: 6, label: "Automation", desc: "IoT & smart systems", emoji: "🏠", done: completedProjects.length >= 10 },
              ].map((s, i, arr) => (
                <div key={s.step} className="flex items-center gap-3 flex-shrink-0">
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col items-center gap-1.5 min-w-[80px]"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all"
                      style={{
                        background: s.done ? "hsl(var(--success) / 0.15)" : "hsl(var(--muted))",
                        border: `2px solid ${s.done ? "hsl(var(--success) / 0.4)" : "hsl(var(--border))"}`,
                        boxShadow: s.done ? "0 0 10px hsl(var(--success) / 0.2)" : "none",
                      }}
                    >
                      {s.done ? "✓" : s.emoji}
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold" style={{ color: s.done ? "hsl(var(--success))" : "hsl(var(--foreground))" }}>{s.label}</p>
                      <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{s.desc}</p>
                    </div>
                  </motion.div>
                  {i < arr.length - 1 && (
                    <ArrowRight size={14} className="flex-shrink-0" style={{ color: s.done ? "hsl(var(--success))" : "hsl(var(--muted-foreground))" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </FadeInView>

        {/* "What Can I Make?" Widget */}
        <WhatCanIMakeWidget navigate={navigate} userId={user?.id} userProjectIds={userProjectIds} />

        {/* Project Tabs */}
        <div className="flex gap-2 mb-5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
                style={
                  isActive
                    ? { background: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.3)" }
                    : { background: "transparent", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
                }
              >
                <Icon size={13} />
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {projectsLoading && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 animate-spin">⚡</div>
            <p style={{ color: "hsl(var(--muted-foreground))" }}>Loading projects...</p>
          </div>
        )}

        {/* Tab Content */}
        {!projectsLoading && activeTab === "inProgress" && (
          <div className="space-y-4">
            {inProgressProjects.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border p-5 transition-all"
                style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: "hsl(var(--primary) / 0.08)", border: "1px solid hsl(var(--primary) / 0.15)" }}
                  >
                    {p.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div>
                        <h3 className="font-bold" style={{ color: "hsl(var(--foreground))" }}>{p.title}</h3>
                        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "hsl(var(--muted-foreground))" }}>{p.description || ""}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => openProject(p)}
                          disabled={navigatingId === p.project_id}
                          className="px-4 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-1.5"
                          style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-deep)))", color: "hsl(var(--primary-foreground))" }}
                        >
                          {navigatingId === p.project_id ? <><Loader2 size={12} className="animate-spin" /> Loading...</> : "Continue"}
                        </button>
                        <button
                          onClick={() => handleDelete(p.project_id)}
                          disabled={deletingId === p.project_id}
                          className="p-1.5 rounded-lg transition-all hover:scale-110 disabled:opacity-70 disabled:cursor-not-allowed"
                          style={{ color: "hsl(var(--destructive))", background: "hsl(var(--destructive) / 0.08)", border: "1px solid hsl(var(--destructive) / 0.2)" }}
                        >
                          {deletingId === p.project_id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-3 mt-2">
                      <DifficultyBadge difficulty={p.difficulty || "beginner"} />
                      <span className="flex items-center gap-1 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                        <Clock size={10} /> {p.time}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Progress</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${p.progress || 0}%`,
                            background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary-deep)))",
                            boxShadow: "0 0 8px hsl(var(--primary) / 0.5)",
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold" style={{ color: "hsl(var(--primary))" }}>{p.progress || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {inProgressProjects.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🚀</div>
                <p style={{ color: "hsl(var(--muted-foreground))" }}>No projects in progress. Start one!</p>
                <button onClick={() => navigate("/generate")} className="mt-4 px-6 py-2.5 rounded-full text-sm font-bold" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-deep)))", color: "hsl(var(--primary-foreground))" }}>
                  Generate a Project
                </button>
              </div>
            )}
          </div>
        )}

        {!projectsLoading && activeTab === "completed" && (
          <div className="space-y-4">
            {completedProjects.map((p) => (
              <div key={p.id} className="rounded-2xl border p-5" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--success) / 0.2)" }}>
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{p.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold" style={{ color: "hsl(var(--foreground))" }}>{p.title}</h3>
                          <CheckCircle size={15} style={{ color: "hsl(var(--success))" }} />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <DifficultyBadge difficulty={p.difficulty || "beginner"} />
                          <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Completed</span>
                          <span className="text-xs font-bold" style={{ color: "hsl(var(--success))" }}>+{p.xp} XP</span>
                        </div>
                      </div>
                      <button
                        onClick={() => openProject(p)}
                        disabled={navigatingId === p.project_id}
                        className="px-4 py-1.5 rounded-full text-xs font-bold border transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-1.5"
                        style={{ borderColor: "hsl(var(--primary) / 0.4)", color: "hsl(var(--primary))" }}
                      >
                        {navigatingId === p.project_id ? <><Loader2 size={12} className="animate-spin" /> Loading...</> : "View Code"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {completedProjects.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🏆</div>
                <p style={{ color: "hsl(var(--muted-foreground))" }}>No completed projects yet. Start building!</p>
              </div>
            )}
          </div>
        )}

        {!projectsLoading && activeTab === "saved" && (
          <div className="space-y-4">
            {savedProjects.map((p) => (
              <div key={p.id} className="rounded-2xl border p-5" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--purple) / 0.2)" }}>
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{p.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="font-bold" style={{ color: "hsl(var(--foreground))" }}>{p.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <DifficultyBadge difficulty={p.difficulty || "beginner"} />
                          <span className="flex items-center gap-1 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                            <Clock size={10} /> {p.time}
                          </span>
                          <span className="text-xs font-bold" style={{ color: "hsl(var(--secondary))" }}>+{p.xp} XP</span>
                        </div>
                      </div>
                      <button
                        onClick={() => openProject(p)}
                        disabled={navigatingId === p.project_id}
                        className="px-4 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-1.5"
                        style={{ background: "linear-gradient(135deg, hsl(var(--purple)), hsl(var(--pink)))", color: "hsl(var(--foreground))" }}
                      >
                        {navigatingId === p.project_id ? <><Loader2 size={12} className="animate-spin" /> Loading...</> : "Start Project"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {savedProjects.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📚</div>
                <p style={{ color: "hsl(var(--muted-foreground))" }}>No saved projects yet.</p>
                <button onClick={() => navigate("/catalog")} className="mt-4 px-6 py-2.5 rounded-full text-sm font-bold" style={{ background: "linear-gradient(135deg, hsl(var(--purple)), hsl(var(--pink)))", color: "hsl(var(--foreground))" }}>
                  Browse Catalog
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {toast && (
        <div
          className="fixed bottom-6 right-6 px-5 py-3 rounded-xl flex items-center gap-2 font-semibold animate-fade-in-up z-50"
          style={{ background: "linear-gradient(135deg, hsl(var(--success)), hsl(var(--success-deep)))", color: "hsl(var(--primary-foreground))", boxShadow: "0 0 20px hsl(var(--success) / 0.4)" }}
        >
          <CheckCircle size={16} /> {toast}
        </div>
      )}
    </Layout>
  );
}
