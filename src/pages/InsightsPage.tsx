import { useState, useEffect, useMemo } from "react";
import { BarChart3, TrendingUp, Target, Clock, Zap, Trophy, Flame } from "lucide-react";
import Layout from "@/components/Layout";
import FadeInView from "@/components/motion/FadeInView";
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
    supabase
      .from("profiles")
      .select("total_xp, level, projects_completed, streak_days")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
      });
  }, [user]);

  const completed = projects.filter((p) => p.status === "completed");
  const inProgress = projects.filter((p) => p.status === "inProgress");
  const totalProjects = projects.length;
  const completedCount = Math.max(profile?.projects_completed ?? 0, completed.length);
  const totalXP = Math.max(profile?.total_xp ?? 0, completed.reduce((s, p) => s + (p.xp || 0), 0));
  const streakDays = profile?.streak_days ?? 0;

  const difficultyStats = useMemo(() => {
    const stats = {
      beginner: { total: 0, completed: 0 },
      intermediate: { total: 0, completed: 0 },
      advanced: { total: 0, completed: 0 },
    };
    projects.forEach((p) => {
      const d = (p.difficulty || "beginner") as keyof typeof stats;
      if (stats[d]) {
        stats[d].total++;
        if (p.status === "completed") stats[d].completed++;
      }
    });
    return stats;
  }, [projects]);

  const completionRate = totalProjects > 0 ? Math.round((completedCount / totalProjects) * 100) : 0;
  const avgProgress = inProgress.length > 0 ? Math.round(inProgress.reduce((s, p) => s + (p.progress || 0), 0) / inProgress.length) : 0;
  const avgXP = completedCount > 0 ? Math.round(totalXP / completedCount) : 0;
  const skills = useMemo(() => calculateSkillProgress(completed.map((p) => p.project_id)), [completed]);

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
    beginner: { color: "#10B981", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600" },
    intermediate: { color: "#F59E0B", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600" },
    advanced: { color: "#8B5CF6", bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-600" },
  };

  return (
    <Layout>
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <FadeInView className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border-2 border-b-4 border-indigo-200 flex items-center justify-center text-2xl shadow-sm">
              📊
            </div>
            <div>
              <h1 className="text-3xl font-extrabold font-display text-indigo-950">
                Progress Insights
              </h1>
              <p className="text-sm font-semibold text-slate-400">
                Deep-dive metrics and analysis on your learning journey, skills, and speed.
              </p>
            </div>
          </div>
        </FadeInView>

        {/* Overview Stats */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Completion Rate", value: `${completionRate}%`, icon: Target, border: "border-indigo-200", bg: "bg-indigo-50", text: "text-indigo-600" },
            { label: "Total XP", value: totalXP.toLocaleString(), icon: Zap, border: "border-indigo-200", bg: "bg-indigo-50", text: "text-indigo-600" },
            { label: "Streak", value: `${streakDays} days`, icon: Flame, border: "border-rose-200", bg: "bg-rose-50", text: "text-rose-600" },
            {
              label: "Time Invested",
              value: timeStats.totalMins > 60 ? `${Math.round(timeStats.totalMins / 60)}h` : `${timeStats.totalMins}m`,
              icon: Clock,
              border: "border-indigo-200",
              bg: "bg-indigo-50",
              text: "text-indigo-600",
            },
          ].map(({ label, value, icon: Icon, border, bg, text }) => (
            <motion.div
              key={label}
              variants={staggerItem}
              className={`bg-white border-2 border-b-4 ${border} rounded-2xl p-5 shadow-sm hover:translate-y-[-1px] transition-all`}
            >
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                <Icon size={16} className={text} />
              </div>
              <p className="text-2xl font-extrabold font-display text-indigo-950">{value}</p>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{label}</p>
            </motion.div>
          ))}
        </StaggerContainer>

        {/* Difficulty Breakdown */}
        <FadeInView delay={0.2} className="mb-6">
          <div className="bg-white border-2 border-b-4 border-slate-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-extrabold font-display text-indigo-950 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-indigo-600" />
              Difficulty Level Stats
            </h2>
            <div className="space-y-4">
              {(["beginner", "intermediate", "advanced"] as const).map((d) => {
                const s = difficultyStats[d];
                const pct = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
                const styling = diffColors[d];
                return (
                  <div key={d}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${styling.bg} ${styling.text} ${styling.border}`}
                        >
                          {d}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          {s.completed}/{s.total} completed
                        </span>
                      </div>
                      <span className={`text-xs font-extrabold ${styling.text}`}>{pct}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full rounded-full"
                        style={{ background: styling.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeInView>

        {/* Skill Mastery */}
        <FadeInView delay={0.3} className="mb-6">
          <div className="bg-white border-2 border-b-4 border-slate-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-extrabold font-display text-indigo-950 mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-amber-500 fill-amber-100" />
              Hardware Skills Mastery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map((skill) => {
                const pct = skill.percent;
                return (
                  <div key={skill.name} className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-extrabold text-indigo-950">{skill.name}</span>
                      <span
                        className="text-xs px-2.5 py-0.5 rounded-full font-bold border"
                        style={{
                          background: `${skill.color}15`,
                          color: skill.color,
                          borderColor: `${skill.color}30`,
                        }}
                      >
                        {skill.level}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white overflow-hidden border border-slate-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full rounded-full"
                        style={{ background: skill.color }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {skill.completed}/{skill.total} projects
                      </span>
                      <span className="text-xs font-bold text-slate-400">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeInView>

        {/* Average Speed Insights */}
        <FadeInView delay={0.4}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border-2 border-b-4 border-slate-100 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg XP per Project</p>
              <p className="text-2xl font-extrabold font-display text-indigo-950 mt-1 flex items-center gap-1">
                <span>💎</span> {avgXP}
              </p>
            </div>
            <div className="bg-white border-2 border-b-4 border-slate-100 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Time per Project</p>
              <p className="text-2xl font-extrabold font-display text-indigo-950 mt-1 flex items-center gap-1">
                <span>⏱️</span> {timeStats.avgMins} min
              </p>
            </div>
            <div className="bg-white border-2 border-b-4 border-slate-100 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Progress</p>
              <p className="text-2xl font-extrabold font-display text-indigo-950 mt-1 flex items-center gap-1">
                <span>🚀</span> {avgProgress}%
              </p>
            </div>
          </div>
        </FadeInView>
      </div>
    </Layout>
  );
}
