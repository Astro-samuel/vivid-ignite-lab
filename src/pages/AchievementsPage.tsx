import { useState, useEffect, useMemo } from "react";
import { Trophy, Star, Zap, Target, Lock, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import FadeInView from "@/components/motion/FadeInView";
import MotionCard from "@/components/motion/MotionCard";
import StaggerContainer, { staggerItem } from "@/components/motion/StaggerContainer";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProjects } from "@/hooks/useUserProjects";
import { supabase } from "@/integrations/supabase/client";

interface Achievement {
  id: number;
  emoji: string;
  title: string;
  desc: string;
  xp: number;
  unlocked: boolean;
  color: string;
  progress: number;
  total: number;
}

function getInventoryCount(userId?: string): number {
  try {
    const key = userId ? `inventory_${userId}` : "userInventory";
    return JSON.parse(localStorage.getItem(key) || "[]").length;
  } catch {
    return 0;
  }
}

export default function AchievementsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects } = useUserProjects();
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [profile, setProfile] = useState<{ total_xp: number; level: number; projects_completed: number; streak_days: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    const syncStreak = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("total_xp, level, projects_completed, streak_days, last_active_date")
        .eq("id", user.id)
        .single();
      if (!data) return;

      const today = new Date().toISOString().split("T")[0];
      const lastActive = (data as any).last_active_date as string | null;
      let newStreak = data.streak_days || 0;

      if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        newStreak = lastActive === yesterdayStr ? (data.streak_days || 0) + 1 : 1;
        await supabase
          .from("profiles")
          .update({ last_active_date: today, streak_days: newStreak } as any)
          .eq("id", user.id);
      }

      setProfile({ ...data, streak_days: newStreak });
    };
    syncStreak();
  }, [user]);

  const actualCompleted = projects.filter((p) => p.status === "completed").length;
  const completedCount = Math.max(profile?.projects_completed ?? 0, actualCompleted);

  const actualXP = projects.filter((p) => p.status === "completed").reduce((s, p) => s + (p.xp || 0), 0);
  const totalXP = Math.max(profile?.total_xp ?? 0, actualXP);

  const streakDays = profile?.streak_days ?? 0;
  const inventoryCount = useMemo(() => getInventoryCount(user?.id), [user?.id]);

  const achievements: Achievement[] = useMemo(
    () => [
      {
        id: 1,
        emoji: "⚡",
        title: "First Spark",
        desc: "Complete your first Arduino project",
        xp: 50,
        color: "#379966",
        progress: Math.min(completedCount, 1),
        total: 1,
        unlocked: completedCount >= 1,
      },
      {
        id: 2,
        emoji: "🔥",
        title: "On Fire",
        desc: "Complete 3 projects",
        xp: 100,
        color: "#379966",
        progress: Math.min(completedCount, 3),
        total: 3,
        unlocked: completedCount >= 3,
      },
      {
        id: 3,
        emoji: "🌈",
        title: "Color Wizard",
        desc: "Complete 5 projects",
        xp: 75,
        color: "#379966",
        progress: Math.min(completedCount, 5),
        total: 5,
        unlocked: completedCount >= 5,
      },
      {
        id: 4,
        emoji: "🤖",
        title: "Robotics Pioneer",
        desc: "Reach Level 2",
        xp: 200,
        color: "#379966",
        progress: Math.min(profile?.level ?? 1, 2),
        total: 2,
        unlocked: (profile?.level ?? 1) >= 2,
      },
      {
        id: 5,
        emoji: "🏆",
        title: "Champion Builder",
        desc: "Complete 10 projects",
        xp: 500,
        color: "#379966",
        progress: Math.min(completedCount, 10),
        total: 10,
        unlocked: completedCount >= 10,
      },
      {
        id: 6,
        emoji: "💪",
        title: "XP Hunter",
        desc: "Earn 500+ XP total",
        xp: 150,
        color: "#379966",
        progress: Math.min(totalXP, 500),
        total: 500,
        unlocked: totalXP >= 500,
      },
      {
        id: 7,
        emoji: "🌟",
        title: "Star Maker",
        desc: "Earn 1000+ XP total",
        xp: 300,
        color: "#379966",
        progress: Math.min(totalXP, 1000),
        total: 1000,
        unlocked: totalXP >= 1000,
      },
      {
        id: 8,
        emoji: "⚙️",
        title: "Component Master",
        desc: "Add 20+ components to your inventory",
        xp: 125,
        color: "#379966",
        progress: Math.min(inventoryCount, 20),
        total: 20,
        unlocked: inventoryCount >= 20,
      },
      {
        id: 9,
        emoji: "🔥",
        title: "Streak Starter",
        desc: "Maintain a 3-day streak",
        xp: 75,
        color: "#379966",
        progress: Math.min(streakDays, 3),
        total: 3,
        unlocked: streakDays >= 3,
      },
      {
        id: 10,
        emoji: "📅",
        title: "Week Warrior",
        desc: "Maintain a 7-day streak",
        xp: 200,
        color: "#379966",
        progress: Math.min(streakDays, 7),
        total: 7,
        unlocked: streakDays >= 7,
      },
    ],
    [completedCount, totalXP, inventoryCount, profile?.level, streakDays]
  );

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const filtered = achievements.filter((a) => {
    if (filter === "unlocked") return a.unlocked;
    if (filter === "locked") return !a.unlocked;
    return true;
  });

  return (
    <Layout>
      <div className="px-6 py-8 max-w-4xl mx-auto">
        {/* Title */}
        <FadeInView className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-b-4 border-primary/30 flex items-center justify-center text-2xl shadow-sm">
              🏆
            </div>
            <div>
              <h1 className="text-3xl font-extrabold font-display text-foreground">
                Achievements
              </h1>
              <p className="text-sm font-medium text-muted-foreground">
                Level up your skills and unlock legendary build badges
              </p>
            </div>
          </div>
        </FadeInView>

        {/* Quick Stats Grid */}
        <StaggerContainer className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: Trophy,
              label: "Unlocked",
              value: `${unlockedCount}/${achievements.length}`,
              bg: "bg-card",
              border: "border-border",
              textColor: "text-foreground",
            },
            {
              icon: Zap,
              label: "Total XP",
              value: `${totalXP}`,
              bg: "bg-primary/10",
              border: "border-primary/30",
              textColor: "text-primary",
            },
            {
              icon: Star,
              label: "Completed",
              value: `${completedCount}`,
              bg: "bg-card",
              border: "border-border",
              textColor: "text-foreground",
            },
          ].map(({ icon: Icon, label, value, bg, border, textColor }) => (
            <motion.div
              key={label}
              variants={staggerItem}
              className={`bg-card border-2 border-b-4 ${border} rounded-2xl p-5 text-center shadow-sm hover:translate-y-[-2px] transition-all`}
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-5 h-5 ${textColor}`} />
              </div>
              <p className="text-2xl font-extrabold font-display text-foreground">
                {value}
              </p>
              <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-wider">
                {label}
              </p>
            </motion.div>
          ))}
        </StaggerContainer>

        {/* Weekly Progress Tracker */}
        <FadeInView>
          <div className="bg-card border-2 border-b-4 border-border rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold font-display text-foreground text-lg flex items-center gap-2">
                  <span>🔥</span> Daily Streak Tracker
                </h3>
                <p className="text-xs font-semibold text-muted-foreground">
                  Earn XP daily to protect your streak!
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-xs font-bold px-4 py-2 bg-card hover:bg-muted border-2 border-b-4 border-border active:border-b-2 active:translate-y-[2px] text-foreground rounded-xl transition-all"
              >
                View Challenges →
              </button>
            </div>
            <div className="flex gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                const todayDayIdx = (new Date().getDay() + 6) % 7; // 0=Mon, 6=Sun
                const daysAgo = todayDayIdx - i;
                const active = daysAgo >= 0 && daysAgo < streakDays;
                const isToday = i === todayDayIdx;
                return (
                  <div key={day} className="flex-1 text-center">
                    <div
                      className={`w-full aspect-square rounded-xl flex items-center justify-center mb-1 transition-all ${
                        active
                          ? "bg-primary border-2 border-b-4 border-primary/70 text-primary-foreground"
                          : isToday
                          ? "bg-muted border-2 border-dashed border-border"
                          : "bg-background border-2 border-border"
                      }`}
                    >
                      {active ? (
                        <CheckCircle size={14} className="text-primary-foreground" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? "text-foreground font-extrabold"
                          : active
                          ? "text-primary font-extrabold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeInView>

        {/* Filters */}
        <FadeInView>
          <div className="flex gap-2 mb-6">
            {(["all", "unlocked", "locked"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all border-2 border-b-4 ${
                  filter === f
                    ? "bg-primary border-primary/70 text-primary-foreground"
                    : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </FadeInView>

        {/* Achievements Grid */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((ach) => (
            <motion.div key={ach.id} variants={staggerItem}>
              <MotionCard
                className={`rounded-2xl border-2 border-b-4 bg-card p-5 shadow-sm transition-all hover:translate-y-[-2px]`}
                style={{
                  borderColor: ach.unlocked ? `${ach.color}44` : "hsl(var(--border))",
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border-2 border-b-4 shadow-sm"
                    style={{
                      background: ach.unlocked ? `${ach.color}15` : "hsl(var(--card))",
                      borderColor: ach.unlocked ? ach.color : "hsl(var(--border))",
                    }}
                  >
                    {ach.unlocked ? (
                      ach.emoji
                    ) : (
                      <Lock size={18} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3
                          className="font-extrabold text-sm"
                          style={{
                            color: ach.unlocked ? "hsl(var(--foreground))" : "hsl(var(--foreground-muted))",
                          }}
                        >
                          {ach.title}
                        </h3>
                        <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                          {ach.desc}
                        </p>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 border bg-muted text-foreground border-border">
                        +{ach.xp} XP
                      </span>
                    </div>
                    {!ach.unlocked && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>
                            {ach.progress}/{ach.total}
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-background overflow-hidden border border-border">
                          <div
                            className="h-full rounded-full transition-all duration-700 bg-muted-foreground"
                            style={{
                              width: `${(ach.progress / ach.total) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {ach.unlocked && (
                      <div className="flex items-center gap-1 mt-2">
                        <CheckCircle size={12} className="text-success" />
                        <span className="text-xs font-bold text-success">
                          Unlocked!
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </MotionCard>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </Layout>
  );
}
