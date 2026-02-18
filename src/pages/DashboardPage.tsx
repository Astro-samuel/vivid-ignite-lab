import { useState } from "react";
import { LayoutDashboard, Clock, BookOpen, CheckCircle, Save, Trash2, Play } from "lucide-react";
import Layout from "@/components/Layout";

type Tab = "inProgress" | "saved" | "completed";

const inProgressProjects = [
  { id: 1, emoji: "💡", title: "Smart LED Mood Lamp", step: 2, totalSteps: 4, difficulty: "beginner", xp: 75, lastModified: "2 hours ago" },
  { id: 2, emoji: "🌡️", title: "Weather Station Dashboard", step: 1, totalSteps: 6, difficulty: "intermediate", xp: 150, lastModified: "Yesterday" },
];

const savedProjects = [
  { id: 3, emoji: "🤖", title: "Line-Following Robot", difficulty: "intermediate", xp: 200, savedOn: "3 days ago" },
  { id: 4, emoji: "🔊", title: "Theremin Synthesizer", difficulty: "advanced", xp: 175, savedOn: "1 week ago" },
  { id: 5, emoji: "🌱", title: "Smart Plant Watering", difficulty: "beginner", xp: 100, savedOn: "2 weeks ago" },
];

const completedProjects = [
  { id: 6, emoji: "🌈", title: "RGB LED Mixer", difficulty: "beginner", xp: 80, completedOn: "5 days ago" },
  { id: 7, emoji: "🔔", title: "Alarm System", difficulty: "beginner", xp: 90, completedOn: "2 weeks ago" },
];

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const cls = difficulty === "beginner" ? "badge-beginner" : difficulty === "intermediate" ? "badge-intermediate" : "badge-advanced";
  return <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${cls}`}>{difficulty}</span>;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("inProgress");
  const [savedToast, setSavedToast] = useState(false);

  const tabs: { id: Tab; label: string; count: number; color: string }[] = [
    { id: "inProgress", label: "In Progress", count: inProgressProjects.length, color: "#00F5FF" },
    { id: "saved", label: "Saved", count: savedProjects.length, color: "#FFD700" },
    { id: "completed", label: "Completed", count: completedProjects.length, color: "#00FF88" },
  ];

  const totalXP = completedProjects.reduce((sum, p) => sum + p.xp, 0);
  const totalProjects = inProgressProjects.length + savedProjects.length + completedProjects.length;

  return (
    <Layout>
      <div className="px-8 py-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00F5FF22, #0099FF11)", border: "1px solid rgba(0,245,255,0.3)" }}>
              <LayoutDashboard size={20} style={{ color: "#00F5FF" }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>My Dashboard</h1>
              <p className="text-sm" style={{ color: "hsl(226, 35%, 72%)" }}>Track and manage all your projects</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Projects", value: totalProjects, color: "#00F5FF", icon: BookOpen },
              { label: "In Progress", value: inProgressProjects.length, color: "#B744FF", icon: Clock },
              { label: "XP Earned", value: `${totalXP}+`, color: "#FFD700", icon: CheckCircle },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="stat-card">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} style={{ color }} />
                  <span className="text-xs" style={{ color: "hsl(226, 35%, 72%)" }}>{label}</span>
                </div>
                <p className="text-2xl font-bold font-orbitron" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: "hsl(229, 45%, 16%)" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              style={
                activeTab === tab.id
                  ? { background: `${tab.color}22`, color: tab.color, border: `1px solid ${tab.color}44` }
                  : { color: "hsl(226, 35%, 72%)" }
              }
            >
              {tab.label}
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: `${tab.color}22`, color: tab.color }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "inProgress" && (
          <div className="space-y-4">
            {inProgressProjects.map((p) => (
              <div key={p.id} className="card-neon p-5">
                <div className="flex items-start gap-4">
                  <div className="text-3xl animate-float">{p.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold" style={{ color: "#FFFFFF" }}>{p.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <DifficultyBadge difficulty={p.difficulty} />
                          <span className="text-xs" style={{ color: "hsl(226, 35%, 72%)" }}>
                            <Clock size={10} className="inline mr-1" />{p.lastModified}
                          </span>
                          <span className="text-xs font-bold" style={{ color: "#FFD700" }}>+{p.xp} XP</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn-neon-teal px-4 py-1.5 text-xs font-bold flex items-center gap-1"
                          onClick={() => { setSavedToast(true); setTimeout(() => setSavedToast(false), 3000); }}
                        >
                          <Play size={12} /> Continue
                        </button>
                        <button
                          className="p-1.5 rounded-lg transition-all hover:scale-110"
                          style={{ color: "#FFD700", background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)" }}
                        >
                          <Save size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 progress-neon h-2">
                        <div
                          className="progress-neon-fill"
                          style={{ width: `${(p.step / p.totalSteps) * 100}%`, height: "100%" }}
                        />
                      </div>
                      <span className="text-xs font-semibold flex-shrink-0" style={{ color: "#00F5FF" }}>
                        Step {p.step}/{p.totalSteps}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="space-y-4">
            {savedProjects.map((p) => (
              <div key={p.id} className="card-neon p-5">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{p.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-bold" style={{ color: "#FFFFFF" }}>{p.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <DifficultyBadge difficulty={p.difficulty} />
                          <span className="text-xs" style={{ color: "hsl(226, 35%, 72%)" }}>Saved {p.savedOn}</span>
                          <span className="text-xs font-bold" style={{ color: "#FFD700" }}>+{p.xp} XP</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-neon-teal px-4 py-1.5 text-xs font-bold flex items-center gap-1">
                          <Play size={12} /> Start
                        </button>
                        <button className="p-1.5 rounded-lg transition-all hover:scale-110" style={{ color: "#FF4500", background: "rgba(255,69,0,0.1)", border: "1px solid rgba(255,69,0,0.3)" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "completed" && (
          <div className="space-y-4">
            {completedProjects.map((p) => (
              <div key={p.id} className="card-neon p-5" style={{ borderColor: "rgba(0,255,136,0.2)" }}>
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{p.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold" style={{ color: "#FFFFFF" }}>{p.title}</h3>
                          <CheckCircle size={16} style={{ color: "#00FF88" }} />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <DifficultyBadge difficulty={p.difficulty} />
                          <span className="text-xs" style={{ color: "hsl(226, 35%, 72%)" }}>Completed {p.completedOn}</span>
                          <span className="text-xs font-bold" style={{ color: "#00FF88" }}>+{p.xp} XP Earned</span>
                        </div>
                      </div>
                      <button className="btn-neon-outline-teal px-4 py-1.5 text-xs font-bold">
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
                <p style={{ color: "hsl(226, 35%, 72%)" }}>No completed projects yet. Start building!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {savedToast && (
        <div className="fixed bottom-6 right-6 px-5 py-3 rounded-xl flex items-center gap-2 font-semibold animate-fade-in-up" style={{ background: "linear-gradient(135deg, #00FF88, #00C853)", color: "#0A0E27", boxShadow: "0 0 20px rgba(0,255,136,0.4)" }}>
          <CheckCircle size={16} /> ✓ Project Saved
        </div>
      )}
    </Layout>
  );
}
