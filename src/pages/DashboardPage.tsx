import { useState, useEffect } from "react";
import { Play, CheckCircle, Save, Trash2, Clock, Bookmark, Flame, Star, Target, LogIn } from "lucide-react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import FadeInView from "@/components/motion/FadeInView";
import MotionCard from "@/components/motion/MotionCard";
import StaggerContainer, { staggerItem } from "@/components/motion/StaggerContainer";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProjects } from "@/hooks/useUserProjects";

type Tab = "inProgress" | "completed" | "saved";

const days = ["M", "T", "W", "T", "F", "S", "S"];
const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

const dailyChallenges = [
  { icon: "🎯", title: "Complete a Project", desc: "Finish any project from the catalog", xp: 50, done: false },
  { icon: "🔧", title: "Add 3 Components", desc: "Add components to your inventory", xp: 25, done: false },
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
  const { user, loading: authLoading } = useAuth();
  const { projects, loading: projectsLoading, deleteProject } = useUserProjects();

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (user && !localStorage.getItem(`onboarding_${user.id}`)) {
      navigate("/onboarding");
    }
  }, [user, navigate]);

  const openProject = (p: typeof projects[0]) => {
    localStorage.setItem(
      "activeGeneratedProject",
      JSON.stringify({
        id: p.project_id,
        emoji: p.emoji,
        title: p.title,
        description: p.description,
        desc: p.description,
        difficulty: p.difficulty,
        time: p.time,
        xp: p.xp,
        components: p.components || [],
        source: "dashboard",
      })
    );
    navigate(`/project/${p.project_id}`);
  };

  // Redirect to auth if not logged in
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

  const inProgressProjects = projects.filter(p => p.status === "inProgress");
  const completedProjects = projects.filter(p => p.status === "completed");
  const savedProjects = projects.filter(p => p.status === "saved");
  const totalXP = completedProjects.reduce((s, p) => s + (p.xp || 0), 0);

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

        {/* Two columns: Streak + Daily Challenges */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Streak */}
          <div
            className="rounded-2xl p-5 border"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Flame size={16} style={{ color: "hsl(var(--destructive))" }} />
              <span className="text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>
                Weekly Streak
              </span>
            </div>
            <div className="flex gap-2 justify-between">
              {days.map((d, i) => {
                const active = i < 3;
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all"
                      style={
                        active
                          ? { background: "hsl(var(--success) / 0.15)", color: "hsl(var(--success))", border: "1px solid hsl(var(--success) / 0.3)" }
                          : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
                      }
                    >
                      {active ? "✓" : dayLabels[i]}
                    </div>
                    <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{d}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Challenges */}
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
                <div key={i} className="flex items-center justify-between">
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
                </div>
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
                          className="px-4 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105"
                          style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-deep)))", color: "hsl(var(--primary-foreground))" }}
                        >
                          Continue
                        </button>
                        <button
                          onClick={() => { deleteProject(p.project_id); showToast("Project removed"); }}
                          className="p-1.5 rounded-lg transition-all hover:scale-110"
                          style={{ color: "hsl(var(--destructive))", background: "hsl(var(--destructive) / 0.08)", border: "1px solid hsl(var(--destructive) / 0.2)" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-3 mt-2">
                      <DifficultyBadge difficulty={p.difficulty || "beginner"} />
                      <span className="flex items-center gap-1 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                        <Clock size={10} /> {p.time}
                      </span>
                    </div>

                    {/* Progress bar */}
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
                        className="px-4 py-1.5 rounded-full text-xs font-bold border transition-all hover:scale-105"
                        style={{ borderColor: "hsl(var(--primary) / 0.4)", color: "hsl(var(--primary))" }}
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
                        className="px-4 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105"
                        style={{ background: "linear-gradient(135deg, hsl(var(--purple)), hsl(var(--pink)))", color: "hsl(var(--foreground))" }}
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
