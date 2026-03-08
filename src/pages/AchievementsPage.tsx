import { useState } from "react";
import { Trophy, Star, Zap, Target, Lock, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import FadeInView from "@/components/motion/FadeInView";
import MotionCard from "@/components/motion/MotionCard";
import StaggerContainer, { staggerItem } from "@/components/motion/StaggerContainer";
import { motion } from "framer-motion";

interface Achievement {
  id: number; emoji: string; title: string; desc: string; xp: number;
  unlocked: boolean; color: string; progress?: number; total?: number;
}

const achievements: Achievement[] = [
  { id: 1, emoji: "⚡", title: "First Spark", desc: "Complete your first Arduino project", xp: 50, unlocked: false, color: "#00F5FF", progress: 0, total: 1 },
  { id: 2, emoji: "🔥", title: "On Fire", desc: "Complete 3 projects in a row", xp: 100, unlocked: false, color: "#FF4500", progress: 0, total: 3 },
  { id: 3, emoji: "🌈", title: "Color Wizard", desc: "Master LED and RGB projects", xp: 75, unlocked: false, color: "#B744FF", progress: 0, total: 3 },
  { id: 4, emoji: "🤖", title: "Robotics Pioneer", desc: "Build your first autonomous robot", xp: 200, unlocked: false, color: "#00F5FF", progress: 0, total: 1 },
  { id: 5, emoji: "🏆", title: "Champion Builder", desc: "Complete 10 projects", xp: 500, unlocked: false, color: "#FFD700", progress: 0, total: 10 },
  { id: 6, emoji: "🧠", title: "AI Collaborator", desc: "Use AI debug assist 5 times", xp: 150, unlocked: false, color: "#B744FF", progress: 0, total: 5 },
  { id: 7, emoji: "🌟", title: "Star Maker", desc: "Earn 1000+ XP total", xp: 300, unlocked: false, color: "#FFD700", progress: 0, total: 1000 },
  { id: 8, emoji: "⚙️", title: "Component Master", desc: "Add 20+ components to your inventory", xp: 125, unlocked: false, color: "#00FF88", progress: 0, total: 20 },
];

const streakDays = [false, false, false, false, false, false, false];

export default function AchievementsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalXP = achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.xp, 0);

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
            <Trophy size={24} style={{ color: "#FFD700" }} />
            <h1 className="text-3xl font-bold" style={{ color: "#FFFFFF" }}>
              <span className="gradient-text-gold">Achievements</span>
            </h1>
          </div>
          <p style={{ color: "hsl(226, 35%, 72%)" }}>Track your progress and earn badges</p>
        </FadeInView>

        <StaggerContainer className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Trophy, label: "Unlocked", value: `${unlockedCount}/${achievements.length}`, color: "#FFD700" },
            { icon: Zap, label: "XP Earned", value: `${totalXP}`, color: "#00F5FF" },
            { icon: Star, label: "Current Streak", value: "0 days", color: "#FF4500" },
          ].map(({ icon: Icon, label, value, color }) => (
            <motion.div key={label} variants={staggerItem} className="stat-card text-center">
              <Icon size={20} style={{ color }} className="mx-auto mb-2" />
              <p className="text-xl font-bold font-orbitron" style={{ color }}>{value}</p>
              <p className="text-xs mt-1" style={{ color: "hsl(226, 35%, 72%)" }}>{label}</p>
            </motion.div>
          ))}
        </StaggerContainer>

        <FadeInView>
          <div className="card-neon p-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ color: "#FFFFFF" }}>🔥 Daily Streak</h3>
              <button onClick={() => navigate("/dashboard")} className="text-sm font-semibold px-3 py-1 rounded-lg transition-all hover:scale-105" style={{ background: "rgba(255,69,0,0.1)", color: "#FF4500", border: "1px solid rgba(255,69,0,0.3)" }}>
                View Challenges →
              </button>
            </div>
            <div className="flex gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                <div key={day} className="flex-1 text-center">
                  <div className="w-full aspect-square rounded-xl flex items-center justify-center mb-1 transition-all" style={{ background: streakDays[i] ? "linear-gradient(135deg, #FF4500, #FF6B35)" : "hsl(229, 42%, 22%)", boxShadow: streakDays[i] ? "0 0 12px rgba(255,69,0,0.4)" : "none" }}>
                    {streakDays[i] ? <CheckCircle size={14} style={{ color: "#FFFFFF" }} /> : <div className="w-2 h-2 rounded-full" style={{ background: "hsl(226, 35%, 50%)" }} />}
                  </div>
                  <span className="text-xs" style={{ color: streakDays[i] ? "#FF6B35" : "hsl(226, 35%, 50%)" }}>{day}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeInView>

        <FadeInView>
          <div className="flex gap-2 mb-6">
            {(["all", "unlocked", "locked"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className="px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
                style={filter === f
                  ? { background: "rgba(0,245,255,0.15)", color: "#00F5FF", border: "1px solid rgba(0,245,255,0.4)" }
                  : { background: "hsl(229, 45%, 16%)", color: "hsl(226, 35%, 72%)", border: "1px solid hsl(229, 42%, 28%)" }
                }
              >{f}</button>
            ))}
          </div>
        </FadeInView>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((ach) => (
            <motion.div key={ach.id} variants={staggerItem}>
              <MotionCard
                className="card-neon p-5"
                style={ach.unlocked ? { borderColor: `${ach.color}44`, boxShadow: `0 0 15px ${ach.color}11` } : { opacity: 0.7 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 relative"
                    style={{ background: ach.unlocked ? `${ach.color}22` : "hsl(229, 42%, 22%)", border: `1px solid ${ach.unlocked ? ach.color + "44" : "hsl(229, 42%, 28%)"}` }}
                  >
                    {ach.unlocked ? ach.emoji : <Lock size={18} style={{ color: "hsl(226, 35%, 50%)" }} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm" style={{ color: ach.unlocked ? "#FFFFFF" : "hsl(226, 35%, 72%)" }}>{ach.title}</h3>
                        <p className="text-xs mt-0.5" style={{ color: "hsl(226, 35%, 60%)" }}>{ach.desc}</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `${ach.color}22`, color: ach.color, border: `1px solid ${ach.color}44` }}>+{ach.xp} XP</span>
                    </div>
                    {!ach.unlocked && ach.progress !== undefined && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1" style={{ color: "hsl(226, 35%, 60%)" }}>
                          <span>Progress</span><span>{ach.progress}/{ach.total}</span>
                        </div>
                        <div className="progress-neon h-1.5">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(ach.progress! / ach.total!) * 100}%`, background: `linear-gradient(90deg, ${ach.color}, ${ach.color}88)`, boxShadow: `0 0 8px ${ach.color}66` }} />
                        </div>
                      </div>
                    )}
                    {ach.unlocked && (
                      <div className="flex items-center gap-1 mt-2">
                        <CheckCircle size={12} style={{ color: "#00FF88" }} /><span className="text-xs" style={{ color: "#00FF88" }}>Unlocked!</span>
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
