import { useState, useEffect, useMemo } from "react";
import { BarChart3, TrendingUp, Target, Clock, Zap, Trophy, Flame } from "lucide-react";
import Layout from "@/components/Layout";
import FadeInView from "@/components/motion/FadeInView";
import MotionCard from "@/components/motion/MotionCard";
import StaggerContainer, { staggerItem } from "@/components/motion/StaggerContainer";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProjects } from "@/hooks/useUserProjects";
import { supabase } from "@/integrations/supabase/client";
import { calculateSkillProgress } from "@/lib/skillMapping";

export default function InsightsPage() {
  const { user } = useAuth();
  const { projects } = useUserProjects();
  const [profile, setProfile] = useState<{ total_xp: number; level: number; projects_completed: number; streak_days: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("total_xp, level, projects_completed, streak_days").eq("id", user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

  const completed = projects.filter(p => p.status === "completed");
  const inProgress = projects.filter(p => p.status === "inProgress");
  const totalProjects = projects.length;
  const completedCount = Math.max(profile?.projects_completed ?? 0, completed.length);
  const totalXP = Math.max(profile?.total_xp ?? 0, completed.reduce((s, p) => s + (p.xp || 0), 0));
  const streakDays = profile?.streak_days ?? 0;

  // Difficulty breakdown
  const difficultyStats = useMemo(() => {
    const stats = { beginner: { total: 0, completed: 0 }, intermediate: { total: 0, completed: 0 }, advanced: { total: 0, completed: 0 } };
    projects.forEach(p => {
      const d = (p.difficulty || "beginner") as keyof typeof stats;
      if (stats[d]) {
        stats[d].total++;
        if (p.status === "completed") stats[d].completed++;
      }
    });
    return stats;
  }, [projects]);

  // Completion rate
  const completionRate = totalProjects > 0 ? Math.round((completedCount / totalProjects) * 100) : 0;

  // Average progress of in-progress projects
  const avgProgress = inProgress.length > 0 ? Math.round(inProgress.reduce((s, p) => s + (p.progress || 0), 0) / inProgress.length) : 0;

  // XP per completed project
  const avgXP = completedCount > 0 ? Math.round(totalXP / completedCount) : 0;

  // Skills
  const skills = useMemo(() => calculateSkillProgress(projects), [projects]);

  // Time estimate stats
  const timeStats = useMemo(() => {
    const parseTime = (t?: string | null) => {
      if (!t) return 0;
      const m = t.match(/(\d+)/);
      return m ? parseInt(m[1]) : 0;
    };
    const totalMins = completed.reduce((s, p) => s + parseTime(p.time), 0);
    return { totalMins, avgMins: completedCount > 0 ? Math.round(totalMins / completedCount) : 0 };
  }, [completed, completedCount]);

  const diffColors = {
    beginner: { color: "#00FF88", bg: "rgba(0,255,136,0.15)" },
    intermediate: { color: "#FFA500", bg: "rgba(255,165,0,0.15)" },
    advanced: { color: "#B744FF", bg: "rgba(183,68,255,0.15)" },
  };

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <FadeInView>
          <div className="mb-6">
            <h1 className="text-2xl font-bold font-orbitron mb-1" style={{ color: "hsl(var(--foreground))" }}>
              <BarChart3 size={24} className="inline mr-2" style={{ color: "hsl(var(--primary))" }} />
              Progress Insights
            </h1>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              Analytics on your learning journey, skills, and achievements.
            </p>
          </div>
        </FadeInView>

        {/* Overview Stats */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Completion Rate", value: `${completionRate}%`, icon: Target, color: "hsl(var(--primary))" },
            { label: "Total XP", value: totalXP.toLocaleString(), icon: Zap, color: "hsl(var(--secondary))" },
            { label: "Streak", value: `${streakDays} days`, icon: Flame, color: "hsl(var(--destructive))" },
            { label: "Time Invested", value: timeStats.totalMins > 60 ? `${Math.round(timeStats.totalMins / 60)}h` : `${timeStats.totalMins}m`, icon: Clock, color: "hsl(var(--primary))" },
          ].map(({ label, value, icon: Icon, color }) => (
            <motion.div key={label} variants={staggerItem} className="rounded-2xl p-5 border" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
              <Icon size={18} className="mb-2" style={{ color }} />
              <p className="text-2xl font-bold font-orbitron" style={{ color }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</p>
            </motion.div>
          ))}
        </StaggerContainer>

        {/* Difficulty Breakdown */}
        <FadeInView delay={0.2}>
          <div className="rounded-2xl border p-5 mb-6" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
            <h2 className="text-sm font-bold mb-4" style={{ color: "hsl(var(--foreground))" }}>
              <TrendingUp size={16} className="inline mr-2" style={{ color: "hsl(var(--primary))" }} />
              Difficulty Breakdown
            </h2>
            <div className="space-y-4">
              {(["beginner", "intermediate", "advanced"] as const).map(d => {
                const s = difficultyStats[d];
                const pct = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
                return (
                  <div key={d}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize" style={{ background: diffColors[d].bg, color: diffColors[d].color }}>{d}</span>
                        <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{s.completed}/{s.total} completed</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: diffColors[d].color }}>{pct}%</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full rounded-full"
                        style={{ background: diffColors[d].color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeInView>

        {/* Skill Progress */}
        <FadeInView delay={0.3}>
          <div className="rounded-2xl border p-5 mb-6" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
            <h2 className="text-sm font-bold mb-4" style={{ color: "hsl(var(--foreground))" }}>
              <Trophy size={16} className="inline mr-2" style={{ color: "hsl(var(--secondary))" }} />
              Skill Mastery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map(skill => {
                const pct = Math.min(Math.round((skill.current / skill.max) * 100), 100);
                return (
                  <div key={skill.name} className="p-3 rounded-xl" style={{ background: "hsl(var(--muted))" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold" style={{ color: "hsl(var(--foreground))" }}>{skill.name}</span>
                      <span className="text-xs font-bold" style={{ color: skill.color }}>{skill.level}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--background))" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full rounded-full"
                        style={{ background: skill.color }}
                      />
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{skill.current}/{skill.max} projects</p>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeInView>

        {/* Quick Stats */}
        <FadeInView delay={0.4}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border p-4" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Avg XP per Project</p>
              <p className="text-xl font-bold font-orbitron mt-1" style={{ color: "hsl(var(--secondary))" }}>{avgXP}</p>
            </div>
            <div className="rounded-2xl border p-4" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Avg Time per Project</p>
              <p className="text-xl font-bold font-orbitron mt-1" style={{ color: "hsl(var(--primary))" }}>{timeStats.avgMins} min</p>
            </div>
            <div className="rounded-2xl border p-4" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Active Progress</p>
              <p className="text-xl font-bold font-orbitron mt-1" style={{ color: "hsl(var(--primary))" }}>{avgProgress}%</p>
            </div>
          </div>
        </FadeInView>
      </div>
    </Layout>
  );
}
