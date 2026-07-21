import { useState, useEffect, useMemo } from "react";
import { TrendingUp, Target, Clock, Zap, Trophy, Flame, BarChart3, Gem, Rocket } from "lucide-react";
import Layout from "@/components/Layout";
import FadeInView from "@/components/motion/FadeInView";
import StaggerContainer, { staggerItem } from "@/components/motion/StaggerContainer";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProjects } from "@/hooks/useUserProjects";
import { supabase } from "@/integrations/supabase/client";
import { calculateSkillProgress } from "@/lib/skillMapping";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  Cell
} from "recharts";

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

  // Transform skills for Recharts Radar
  const radarData = useMemo(() => {
    return skills.map(s => ({
      subject: s.name,
      value: s.percent,
      completed: s.completed,
      total: s.total
    }));
  }, [skills]);

  // Transform difficulty stats for Recharts Bar
  const difficultyData = useMemo(() => {
    return [
      { name: "Beginner", completed: difficultyStats.beginner.completed, total: difficultyStats.beginner.total },
      { name: "Intermediate", completed: difficultyStats.intermediate.completed, total: difficultyStats.intermediate.total },
      { name: "Advanced", completed: difficultyStats.advanced.completed, total: difficultyStats.advanced.total }
    ];
  }, [difficultyStats]);

  // Generate mock timeline data for XP progress
  const timelineData = useMemo(() => {
    return [
      { name: "Mon", XP: Math.round(totalXP * 0.1) },
      { name: "Tue", XP: Math.round(totalXP * 0.25) },
      { name: "Wed", XP: Math.round(totalXP * 0.45) },
      { name: "Thu", XP: Math.round(totalXP * 0.6) },
      { name: "Fri", XP: Math.round(totalXP * 0.75) },
      { name: "Sat", XP: Math.round(totalXP * 0.9) },
      { name: "Sun", XP: totalXP }
    ];
  }, [totalXP]);

  const diffColors = {
    beginner: { color: "hsl(142, 60%, 42%)", bg: "bg-success/10", border: "border-success/30", text: "text-success" },
    intermediate: { color: "hsl(189, 70%, 40%)", bg: "bg-secondary/10", border: "border-secondary/30", text: "text-secondary" },
    advanced: { color: "hsl(262, 45%, 58%)", bg: "bg-brand-purple/10", border: "border-brand-purple/30", text: "text-brand-purple" },
  };

  const customTooltipStyle = {
    contentStyle: {
      backgroundColor: "hsl(228, 28%, 12%)",
      border: "1px solid hsl(228, 20%, 22%)",
      borderRadius: "12px",
      color: "hsl(220, 24%, 97%)"
    },
    itemStyle: { color: "hsl(220, 24%, 97%)" }
  };

  return (
    <Layout>
      <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <FadeInView className="mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-muted border-2 border-b-4 border-border flex items-center justify-center shadow-sm text-muted-foreground">
              <BarChart3 size={22} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold font-display text-foreground">
                Progress Insights
              </h1>
              <p className="text-sm font-semibold text-muted-foreground">
                Deep-dive metrics and analysis on your learning journey, skills, and speed.
              </p>
            </div>
          </div>
        </FadeInView>

        {/* Overview Stats */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Completion Rate", value: `${completionRate}%`, icon: Target, border: "border-border", bg: "bg-muted", text: "text-muted-foreground" },
            { label: "Total XP", value: totalXP.toLocaleString(), icon: Zap, border: "border-primary/20", bg: "bg-primary/10", text: "text-primary" },
            { label: "Streak", value: `${streakDays} days`, icon: Flame, border: "border-primary/20", bg: "bg-primary/10", text: "text-primary" },
            {
              label: "Time Invested",
              value: timeStats.totalMins > 60 ? `${Math.round(timeStats.totalMins / 60)}h` : `${timeStats.totalMins}m`,
              icon: Clock,
              border: "border-border",
              bg: "bg-muted",
              text: "text-muted-foreground",
            },
          ].map(({ label, value, icon: Icon, border, bg, text }) => (
            <motion.div
              key={label}
              variants={staggerItem}
              className={`bg-card/40 border-2 border-b-4 ${border} rounded-2xl p-5 shadow-md hover:translate-y-[-1px] transition-all`}
            >
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                <Icon size={16} className={text} />
              </div>
              <p className="text-2xl font-extrabold font-display text-foreground">{value}</p>
              <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-wider">{label}</p>
            </motion.div>
          ))}
        </StaggerContainer>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hardware Skills Mastery (Radar) */}
          <FadeInView delay={0.2}>
            <div className="bg-card/40 border-2 border-b-4 border-border rounded-3xl p-6 shadow-md h-full flex flex-col justify-between">
              <div>
                <h2 className="text-base font-extrabold font-display text-foreground mb-1.5 flex items-center gap-2">
                  <Trophy size={18} className="text-muted-foreground" />
                  Hardware Skills Mastery
                </h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Visual assessment of your experience across core electronics topics.
                </p>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="hsl(228, 20%, 22%)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(228, 14%, 62%)", fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(228, 14%, 62%)", fontSize: 8 }} />
                    <Radar
                      name="Skills"
                      dataKey="value"
                      stroke="hsl(38, 92%, 50%)"
                      fill="hsl(38, 92%, 50%)"
                      fillOpacity={0.25}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 mt-4 pt-4 border-t border-border">
                {skills.map((skill) => (
                  <div key={skill.name} className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">{skill.name}</span>
                    <span className="font-mono text-primary font-bold">{skill.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeInView>

          {/* Difficulty Breakdown & Progress */}
          <FadeInView delay={0.3}>
            <div className="bg-card/40 border-2 border-b-4 border-border rounded-3xl p-6 shadow-md h-full flex flex-col justify-between">
              <div>
                <h2 className="text-base font-extrabold font-display text-foreground mb-1.5 flex items-center gap-2">
                  <TrendingUp size={18} className="text-muted-foreground" />
                  Difficulty Level Breakdown
                </h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Completion stats and volumes divided by complexity.
                </p>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={difficultyData} barSize={28}>
                    <XAxis dataKey="name" tick={{ fill: "hsl(228, 14%, 62%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(228, 14%, 62%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip {...customTooltipStyle} cursor={{ fill: "hsl(228, 24%, 18%)", radius: 6 }} />
                    <Bar dataKey="completed" radius={[6, 6, 0, 0]}>
                      {difficultyData.map((entry, index) => {
                        const colors = [diffColors.beginner.color, diffColors.intermediate.color, diffColors.advanced.color];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4 mt-6">
                {(["beginner", "intermediate", "advanced"] as const).map((d) => {
                  const s = difficultyStats[d];
                  const pct = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
                  const styling = diffColors[d];
                  return (
                    <div key={d}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${styling.bg} ${styling.text} ${styling.border}`}
                          >
                            {d}
                          </span>
                          <span className="text-xs font-bold text-muted-foreground">
                            {s.completed}/{s.total} completed
                          </span>
                        </div>
                        <span className={`text-xs font-extrabold ${styling.text}`}>{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden border border-border/50">
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
        </div>

        {/* Weekly Activity Area Chart */}
        <FadeInView delay={0.4}>
          <div className="bg-card/40 border-2 border-b-4 border-border rounded-3xl p-6 shadow-md">
            <h2 className="text-base font-extrabold font-display text-foreground mb-1.5 flex items-center gap-2">
              <Zap size={18} className="text-muted-foreground" />
              XP Cumulative Growth
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              Track your cumulative experience gain and progression rate over the week.
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fill: "hsl(228, 14%, 62%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(228, 14%, 62%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip {...customTooltipStyle} />
                  <Area type="monotone" dataKey="XP" stroke="hsl(38, 92%, 50%)" strokeWidth={3} fillOpacity={1} fill="url(#xpGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </FadeInView>

        {/* Average Speed Insights */}
        <FadeInView delay={0.5}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card/40 border-2 border-b-4 border-border rounded-2xl p-5 shadow-md">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg XP per Project</p>
              <p className="text-2xl font-extrabold font-display text-foreground mt-1 flex items-center gap-1.5">
                <Gem size={20} className="text-primary" /> {avgXP}
              </p>
            </div>
            <div className="bg-card/40 border-2 border-b-4 border-border rounded-2xl p-5 shadow-md">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg Time per Project</p>
              <p className="text-2xl font-extrabold font-display text-foreground mt-1 flex items-center gap-1.5">
                <Clock size={20} className="text-muted-foreground" /> {timeStats.avgMins} min
              </p>
            </div>
            <div className="bg-card/40 border-2 border-b-4 border-border rounded-2xl p-5 shadow-md">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Progress</p>
              <p className="text-2xl font-extrabold font-display text-foreground mt-1 flex items-center gap-1.5">
                <Rocket size={20} className="text-muted-foreground" /> {avgProgress}%
              </p>
            </div>
          </div>
        </FadeInView>
      </div>
    </Layout>
  );
}
