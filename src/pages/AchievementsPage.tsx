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
  id: number; emoji: string; title: string; desc: string; xp: number;
  unlocked: boolean; color: string; progress: number; total: number;
}

function getInventoryCount(userId?: string): number {
  try {
    const key = userId ? `inventory_${userId}` : "userInventory";
    return JSON.parse(localStorage.getItem(key) || "[]").length;
  } catch { return 0; }
}

export default function AchievementsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects } = useUserProjects();
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [profile, setProfile] = useState<{ total_xp: number; level: number; projects_completed: number; streak_days: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("total_xp, level, projects_completed, streak_days").eq("id", user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

  // Use the greater of profile.projects_completed and actual completed projects count
  const actualCompleted = projects.filter(p => p.status === "completed").length;
  const completedCount = Math.max(profile?.projects_completed ?? 0, actualCompleted);
  
  // Use the greater of profile.total_xp and actual sum of completed project XP
  const actualXP = projects.filter(p => p.status === "completed").reduce((s, p) => s + (p.xp || 0), 0);
  const totalXP = Math.max(profile?.total_xp ?? 0, actualXP);
  
  const streakDays = profile?.streak_days ?? 0;
  const inventoryCount = useMemo(() => getInventoryCount(user?.id), [user?.id]);

  // Compute achievements dynamically from real data
  const achievements: Achievement[] = useMemo(() => [
    {
      id: 1, emoji: "⚡", title: "First Spark", desc: "Complete your first Arduino project",
      xp: 50, color: "#00F5FF",
      progress: Math.min(completedCount, 1), total: 1,
      unlocked: completedCount >= 1,
    },
    {
      id: 2, emoji: "🔥", title: "On Fire", desc: "Complete 3 projects",
      xp: 100, color: "#FF4500",
      progress: Math.min(completedCount, 3), total: 3,
      unlocked: completedCount >= 3,
    },
    {
      id: 3, emoji: "🌈", title: "Color Wizard", desc: "Complete 5 projects",
      xp: 75, color: "#B744FF",
      progress: Math.min(completedCount, 5), total: 5,
      unlocked: completedCount >= 5,
    },
    {
      id: 4, emoji: "🤖", title: "Robotics Pioneer", desc: "Reach Level 2",
      xp: 200, color: "#00F5FF",
      progress: Math.min(profile?.level ?? 1, 2), total: 2,
      unlocked: (profile?.level ?? 1) >= 2,
    },
    {
      id: 5, emoji: "🏆", title: "Champion Builder", desc: "Complete 10 projects",
      xp: 500, color: "#FFD700",
      progress: Math.min(completedCount, 10), total: 10,
      unlocked: completedCount >= 10,
    },
    {
      id: 6, emoji: "💪", title: "XP Hunter", desc: "Earn 500+ XP total",
      xp: 150, color: "#B744FF",
      progress: Math.min(totalXP, 500), total: 500,
      unlocked: totalXP >= 500,
    },
    {
      id: 7, emoji: "🌟", title: "Star Maker", desc: "Earn 1000+ XP total",
      xp: 300, color: "#FFD700",
      progress: Math.min(totalXP, 1000), total: 1000,
      unlocked: totalXP >= 1000,
    },
    {
      id: 8, emoji: "⚙️", title: "Component Master", desc: "Add 20+ components to your inventory",
      xp: 125, color: "#00FF88",
      progress: Math.min(inventoryCount, 20), total: 20,
      unlocked: inventoryCount >= 20,
    },
    {
      id: 9, emoji: "🔥", title: "Streak Starter", desc: "Maintain a 3-day streak",
      xp: 75, color: "#FF4500",
      progress: Math.min(streakDays, 3), total: 3,
      unlocked: streakDays >= 3,
    },
    {
      id: 10, emoji: "📅", title: "Week Warrior", desc: "Maintain a 7-day streak",
      xp: 200, color: "#FF4500",
      progress: Math.min(streakDays, 7), total: 7,
      unlocked: streakDays >= 7,
    },
  ], [completedCount, totalXP, inventoryCount, profile?.level, streakDays]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const achievementXP = achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.xp, 0);

  const filtered = achievements.filter((a) => {
    if (filter === "unlocked") return a.unlocked;
    if (filter === "locked") return !a.unlocked;
    return true;
  });

  return (
    <Layout>
      <div className="px-8 py-10 max-w-4xl mx-auto">
        <FadeInView className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Trophy size={24} style={{ color: "hsl(var(--secondary))" }} />
            <h1 className="text-3xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
              <span className="gradient-text-gold">Achievements</span>
            </h1>
          </div>
          <p style={{ color: "hsl(var(--muted-foreground))" }}>Track your progress and earn badges</p>
        </FadeInView>

        <StaggerContainer className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Trophy, label: "Unlocked", value: `${unlockedCount}/${achievements.length}`, color: "hsl(var(--secondary))" },
            { icon: Zap, label: "Total XP", value: `${totalXP}`, color: "hsl(var(--primary))" },
            { icon: Star, label: "Projects Done", value: `${completedCount}`, color: "hsl(var(--success))" },
          ].map(({ icon: Icon, label, value, color }) => (
            <motion.div key={label} variants={staggerItem} className="rounded-2xl border p-5 text-center"
              style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
              <Icon size={20} style={{ color }} className="mx-auto mb-2" />
              <p className="text-xl font-bold font-orbitron" style={{ color }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</p>
            </motion.div>
          ))}
        </StaggerContainer>

        <FadeInView>
          <div className="rounded-2xl border p-5 mb-8" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ color: "hsl(var(--foreground))" }}>🔥 Daily Streak</h3>
              <button onClick={() => navigate("/dashboard")} className="text-sm font-semibold px-3 py-1 rounded-lg transition-all hover:scale-105"
                style={{ background: "hsl(var(--destructive) / 0.1)", color: "hsl(var(--destructive))", border: "1px solid hsl(var(--destructive) / 0.3)" }}>
                View Challenges →
              </button>
            </div>
            <div className="flex gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                const active = i < streakDays;
                return (
                  <div key={day} className="flex-1 text-center">
                    <div className="w-full aspect-square rounded-xl flex items-center justify-center mb-1 transition-all"
                      style={{
                        background: active ? "linear-gradient(135deg, hsl(var(--destructive)), hsl(var(--destructive) / 0.7))" : "hsl(var(--muted))",
                        boxShadow: active ? "0 0 12px hsl(var(--destructive) / 0.4)" : "none",
                      }}>
                      {active ? <CheckCircle size={14} style={{ color: "hsl(var(--foreground))" }} /> : <div className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--muted-foreground) / 0.4)" }} />}
                    </div>
                    <span className="text-xs" style={{ color: active ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))" }}>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeInView>

        <FadeInView>
          <div className="flex gap-2 mb-6">
            {(["all", "unlocked", "locked"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className="px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
                style={filter === f
                  ? { background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.4)" }
                  : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
                }
              >{f}</button>
            ))}
          </div>
        </FadeInView>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((ach) => (
            <motion.div key={ach.id} variants={staggerItem}>
              <MotionCard
                className="rounded-2xl border p-5"
                style={ach.unlocked
                  ? { background: "hsl(var(--card))", borderColor: `${ach.color}44`, boxShadow: `0 0 15px ${ach.color}11` }
                  : { background: "hsl(var(--card))", borderColor: "hsl(var(--border))", opacity: 0.7 }
                }
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: ach.unlocked ? `${ach.color}22` : "hsl(var(--muted))", border: `1px solid ${ach.unlocked ? ach.color + "44" : "hsl(var(--border))"}` }}
                  >
                    {ach.unlocked ? ach.emoji : <Lock size={18} style={{ color: "hsl(var(--muted-foreground))" }} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm" style={{ color: ach.unlocked ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>{ach.title}</h3>
                        <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>{ach.desc}</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${ach.color}22`, color: ach.color, border: `1px solid ${ach.color}44` }}>+{ach.xp} XP</span>
                    </div>
                    {!ach.unlocked && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                          <span>Progress</span><span>{ach.progress}/{ach.total}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(ach.progress / ach.total) * 100}%`, background: `linear-gradient(90deg, ${ach.color}, ${ach.color}88)`, boxShadow: `0 0 8px ${ach.color}66` }} />
                        </div>
                      </div>
                    )}
                    {ach.unlocked && (
                      <div className="flex items-center gap-1 mt-2">
                        <CheckCircle size={12} style={{ color: "hsl(var(--success))" }} /><span className="text-xs font-medium" style={{ color: "hsl(var(--success))" }}>Unlocked!</span>
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
