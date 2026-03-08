import { useState, useEffect } from "react";
import { Play, CheckCircle, Save, Trash2, Clock, Bookmark, Flame, Star, Target } from "lucide-react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import FadeInView from "@/components/motion/FadeInView";
import MotionCard from "@/components/motion/MotionCard";
import StaggerContainer, { staggerItem } from "@/components/motion/StaggerContainer";
import { motion } from "framer-motion";

type Tab = "inProgress" | "completed" | "saved";

interface SavedProject {
  id: number;
  emoji: string;
  title: string;
  description?: string;
  difficulty: string;
  time: string;
  xp: number;
  status: string;
  savedAt: number;
  progress?: number;
  step?: number;
  totalSteps?: number;
}

function loadSavedProjects(): SavedProject[] {
  try {
    return JSON.parse(localStorage.getItem("savedProjects") || "[]");
  } catch { return []; }
}

const days = ["M", "T", "W", "T", "F", "S", "S"];
const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

const dailyChallenges = [
  { icon: "🎯", title: "Complete a Project", desc: "Finish any project from the catalog", xp: 50, done: false },
  { icon: "🔧", title: "Add 3 Components", desc: "Add components to your inventory", xp: 25, done: true },
  { icon: "✨", title: "Generate AI Project", desc: "Use AI to generate a custom project", xp: 35, done: false },
];

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

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("inProgress");
  const navigate = useNavigate();
  const [toast, setToast] = useState("");
  const [allProjects, setAllProjects] = useState<SavedProject[]>([]);

  const openProject = (project: SavedProject) => {
    localStorage.setItem(
      "activeGeneratedProject",
      JSON.stringify({
        id: project.id,
        emoji: project.emoji,
        title: project.title,
        description: project.description,
        desc: (project as any).desc,
        difficulty: project.difficulty,
        time: project.time,
        xp: project.xp,
        components: (project as any).components || [],
        source: "dashboard",
      })
    );
    navigate(`/project/${project.id}`);
  };

  useEffect(() => {
    setAllProjects(loadSavedProjects());
  }, []);

  const inProgressProjects = allProjects.filter(p => p.status === "inProgress");
  const completedProjects = allProjects.filter(p => p.status === "completed");
  const savedProjects = allProjects.filter(p => p.status === "saved");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const totalXP = completedProjects.reduce((s, p) => s + p.xp, 0);

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
            <Target size={14} style={{ color: "#00F5FF" }} />
            <span className="text-xs font-semibold" style={{ color: "#00F5FF" }}>Your Workspace</span>
          </div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: "#FFFFFF" }}>Dashboard</h1>
          <p className="text-sm" style={{ color: "#A0AED9" }}>Track your projects and see your progress</p>
        </FadeInView>

        {/* Stats Row */}
        <StaggerContainer className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "In Progress", value: inProgressProjects.length, icon: Play, color: "#00F5FF", bg: "rgba(0,245,255,0.08)", border: "rgba(0,245,255,0.2)" },
            { label: "Completed", value: completedProjects.length, icon: CheckCircle, color: "#00FF88", bg: "rgba(0,255,136,0.08)", border: "rgba(0,255,136,0.2)" },
            { label: "Saved", value: savedProjects.length, icon: Bookmark, color: "#B744FF", bg: "rgba(183,68,255,0.08)", border: "rgba(183,68,255,0.2)" },
            { label: "Total XP", value: totalXP, icon: Star, color: "#FFD700", bg: "rgba(255,215,0,0.08)", border: "rgba(255,215,0,0.2)" },
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
                <p className="text-xs" style={{ color: "#A0AED9" }}>{label}</p>
              </div>
            </motion.div>
          ))}
        </StaggerContainer>

        {/* Two columns: Streak + Daily Challenges */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Streak */}
          <div
            className="rounded-2xl p-5 border"
            style={{ background: "rgba(255,69,0,0.06)", borderColor: "rgba(255,69,0,0.2)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{ background: "rgba(255,69,0,0.2)" }}>
                  🔥
                </div>
                <span className="font-bold text-sm" style={{ color: "#FFFFFF" }}>Current Streak</span>
              </div>
              <span className="text-xs" style={{ color: "#A0AED9" }}>Best: 0 days</span>
            </div>

            <p className="text-4xl font-black font-orbitron mb-1" style={{ color: "#FF4500" }}>0 <span className="text-lg font-semibold" style={{ color: "#A0AED9" }}>days</span></p>

            {/* Day indicators */}
            <div className="flex gap-2 mt-4 mb-3">
              {days.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold"
                    style={
                      i === 2
                        ? { background: "rgba(255,69,0,0.3)", border: "1px solid rgba(255,69,0,0.6)", color: "#FF4500" }
                        : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#A0AED9" }
                    }
                  >
                    {d}
                  </div>
                  <span className="text-xs" style={{ color: "#A0AED9" }}>{dayLabels[i]}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-center mt-2" style={{ color: "#A0AED9" }}>
              Start building today to begin your streak! 🚀
            </p>
          </div>

          {/* Daily Challenges */}
          <div
            className="rounded-2xl p-5 border"
            style={{ background: "rgba(183,68,255,0.06)", borderColor: "rgba(183,68,255,0.2)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(183,68,255,0.2)" }}>
                    <Target size={14} style={{ color: "#B744FF" }} />
                  </div>
                  <span className="font-bold text-sm" style={{ color: "#FFFFFF" }}>Daily Challenges</span>
                </div>
                <p className="text-xs mt-1 ml-9" style={{ color: "#A0AED9" }}>1/3 completed</p>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full font-semibold"
                style={{ background: "rgba(183,68,255,0.15)", color: "#B744FF", border: "1px solid rgba(183,68,255,0.3)" }}
              >
                ⏰ Resets in 8h
              </span>
            </div>

            <div className="space-y-2">
              {dailyChallenges.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{
                    background: c.done ? "rgba(0,255,136,0.06)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${c.done ? "rgba(0,255,136,0.2)" : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{c.icon}</span>
                    <div>
                      <p
                        className="text-xs font-semibold"
                        style={{
                          color: c.done ? "#A0AED9" : "#FFFFFF",
                          textDecoration: c.done ? "line-through" : "none",
                        }}
                      >
                        {c.title}
                      </p>
                      <p className="text-xs" style={{ color: "#A0AED9" }}>{c.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-xs font-bold" style={{ color: "#FFD700" }}>✦ +{c.xp}</span>
                    {c.done && <CheckCircle size={14} style={{ color: "#00FF88" }} />}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/achievements")}
              className="w-full mt-3 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #B744FF, #FF1493)",
                color: "#FFFFFF",
                boxShadow: "0 0 15px rgba(183,68,255,0.3)",
              }}
            >
              ✦ View All Challenges
            </button>
          </div>
        </div>

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
                    ? {
                        background: "rgba(0,245,255,0.12)",
                        color: "#00F5FF",
                        border: "1px solid rgba(0,245,255,0.3)",
                      }
                    : {
                        background: "transparent",
                        color: "#A0AED9",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }
                }
              >
                <Icon size={13} />
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === "inProgress" && (
          <div className="space-y-4">
            {inProgressProjects.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border p-5 transition-all"
                style={{ background: "hsl(229, 45%, 16%)", borderColor: "hsl(229, 42%, 28%)" }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.15)" }}
                  >
                    {p.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div>
                        <h3 className="font-bold" style={{ color: "#FFFFFF" }}>{p.title}</h3>
                        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "#A0AED9" }}>{p.description || ""}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => openProject(p)}
                          className="px-4 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105"
                          style={{
                            background: "linear-gradient(135deg, #00F5FF, #0099FF)",
                            color: "#0A0E27",
                          }}
                        >
                          Continue
                        </button>
                        <button
                          onClick={() => showToast("✓ Project Saved")}
                          className="p-1.5 rounded-lg transition-all hover:scale-110"
                          style={{ color: "#FFD700", background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)" }}
                        >
                          <Save size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-3 mt-2">
                      <DifficultyBadge difficulty={p.difficulty} />
                      <span className="flex items-center gap-1 text-xs" style={{ color: "#A0AED9" }}>
                        <Clock size={10} /> {p.time}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: "#A0AED9" }}>Progress</span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "hsl(229, 42%, 22%)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${p.progress}%`,
                            background: "linear-gradient(90deg, #00F5FF, #0099FF)",
                            boxShadow: "0 0 8px rgba(0,245,255,0.5)",
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold" style={{ color: "#00F5FF" }}>{p.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {inProgressProjects.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🚀</div>
                <p style={{ color: "#A0AED9" }}>No projects in progress. Start one!</p>
                <button onClick={() => navigate("/generate")} className="mt-4 px-6 py-2.5 rounded-full text-sm font-bold" style={{ background: "linear-gradient(135deg, #00F5FF, #0099FF)", color: "#0A0E27" }}>
                  Generate a Project
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "completed" && (
          <div className="space-y-4">
            {completedProjects.map((p) => (
              <div key={p.id} className="rounded-2xl border p-5" style={{ background: "hsl(229, 45%, 16%)", borderColor: "rgba(0,255,136,0.2)" }}>
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{p.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold" style={{ color: "#FFFFFF" }}>{p.title}</h3>
                          <CheckCircle size={15} style={{ color: "#00FF88" }} />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <DifficultyBadge difficulty={p.difficulty} />
                          <span className="text-xs" style={{ color: "#A0AED9" }}>Completed</span>
                          <span className="text-xs font-bold" style={{ color: "#00FF88" }}>+{p.xp} XP</span>
                        </div>
                      </div>
                      <button
                        onClick={() => openProject(p)}
                        className="px-4 py-1.5 rounded-full text-xs font-bold border transition-all hover:scale-105"
                        style={{ borderColor: "rgba(0,245,255,0.4)", color: "#00F5FF" }}
                      >
                        View Code
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {completedProjects.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🏆</div>
                <p style={{ color: "#A0AED9" }}>No completed projects yet. Start building!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="space-y-4">
            {savedProjects.map((p) => (
              <div key={p.id} className="rounded-2xl border p-5" style={{ background: "hsl(229, 45%, 16%)", borderColor: "rgba(183,68,255,0.2)" }}>
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{p.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="font-bold" style={{ color: "#FFFFFF" }}>{p.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <DifficultyBadge difficulty={p.difficulty} />
                          <span className="flex items-center gap-1 text-xs" style={{ color: "#A0AED9" }}>
                            <Clock size={10} /> {p.time}
                          </span>
                          <span className="text-xs font-bold" style={{ color: "#FFD700" }}>+{p.xp} XP</span>
                        </div>
                      </div>
                      <button
                        onClick={() => openProject(p)}
                        className="px-4 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105"
                        style={{
                          background: "linear-gradient(135deg, #B744FF, #FF1493)",
                          color: "#FFFFFF",
                        }}
                      >
                        Start Project
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {savedProjects.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📚</div>
                <p style={{ color: "#A0AED9" }}>No saved projects yet.</p>
                <button onClick={() => navigate("/catalog")} className="mt-4 px-6 py-2.5 rounded-full text-sm font-bold" style={{ background: "linear-gradient(135deg, #B744FF, #FF1493)", color: "#FFFFFF" }}>
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
          style={{ background: "linear-gradient(135deg, #00FF88, #00C853)", color: "#0A0E27", boxShadow: "0 0 20px rgba(0,255,136,0.4)" }}
        >
          <CheckCircle size={16} /> {toast}
        </div>
      )}
    </Layout>
  );
}
