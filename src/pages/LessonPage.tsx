import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import FadeInView from "@/components/motion/FadeInView";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Code, Wrench, CheckCircle, ChevronRight, Zap, Lightbulb, Play, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Tab = "concept" | "challenge" | "build";

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<any>(null);
  const [path, setPath] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("concept");
  const [code, setCode] = useState("");
  const [showSolution, setShowSolution] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  const loadLesson = async () => {
    if (!lessonId) return;
    setLoading(true);
    const { data: lessonData } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .single();

    if (lessonData) {
      setLesson(lessonData);
      setCode(lessonData.challenge_starter_code || "");

      const { data: pathData } = await supabase
        .from("learning_paths")
        .select("*")
        .eq("id", lessonData.path_id)
        .single();
      if (pathData) setPath(pathData);

      if (user) {
        const { data: prog } = await supabase
          .from("user_lesson_progress")
          .select("status")
          .eq("user_id", user.id)
          .eq("lesson_id", lessonId)
          .maybeSingle();
        setCompleted(prog?.status === "completed");
      }
    }
    setLoading(false);
  };

  const handleComplete = async () => {
    if (!user || !lesson) return;
    setSubmitting(true);

    // Upsert progress
    await supabase.from("user_lesson_progress").upsert({
      user_id: user.id,
      lesson_id: lesson.id,
      path_id: lesson.path_id,
      status: "completed",
      score: lesson.xp_reward,
      completed_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
    }, { onConflict: "user_id,lesson_id" });

    // Award XP
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_xp")
      .eq("id", user.id)
      .single();

    if (profile) {
      await supabase.from("profiles").update({
        total_xp: (profile.total_xp || 0) + lesson.xp_reward,
      }).eq("id", user.id);
    }

    setCompleted(true);
    setSubmitting(false);
  };

  const tabs = [
    { id: "concept" as Tab, label: "📖 Concept", icon: BookOpen },
    { id: "challenge" as Tab, label: "💻 Challenge", icon: Code },
    { id: "build" as Tab, label: "🔨 Build", icon: Wrench },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "hsl(var(--muted))", borderTopColor: "hsl(var(--primary))" }} />
        </div>
      </Layout>
    );
  }

  if (!lesson) {
    return (
      <Layout>
        <div className="px-6 py-8 text-center">
          <p style={{ color: "hsl(var(--muted-foreground))" }}>Lesson not found</p>
          <button onClick={() => navigate("/learn")} className="mt-4 text-sm font-bold" style={{ color: "hsl(var(--primary))" }}>← Back to Learn</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-6 py-6 max-w-4xl mx-auto">
        {/* Header */}
        <FadeInView className="mb-6">
          <button
            onClick={() => navigate("/learn")}
            className="flex items-center gap-2 text-sm font-medium mb-4 transition-all hover:opacity-80"
            style={{ color: "hsl(var(--primary))" }}
          >
            <ArrowLeft size={14} /> Back to Learn
          </button>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {path && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${path.color}20`, color: path.color }}>{path.title}</span>}
                <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Lesson {lesson.lesson_order}</span>
              </div>
              <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>{lesson.title}</h1>
              <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{lesson.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} style={{ color: "hsl(var(--secondary))" }} />
              <span className="text-sm font-bold" style={{ color: "hsl(var(--secondary))" }}>+{lesson.xp_reward} XP</span>
            </div>
          </div>
        </FadeInView>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={
                activeTab === tab.id
                  ? { background: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.3)" }
                  : { background: "hsl(var(--muted) / 0.3)", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "concept" && (
            <motion.div
              key="concept"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl border p-6"
              style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
            >
              <div className="prose prose-invert max-w-none">
                {lesson.concept_content.split("\n").map((line: string, i: number) => {
                  if (line.startsWith("# ")) return <h2 key={i} className="text-xl font-bold mb-3" style={{ color: "hsl(var(--foreground))" }}>{line.slice(2)}</h2>;
                  if (line.startsWith("## ")) return <h3 key={i} className="text-lg font-bold mb-2 mt-4" style={{ color: "hsl(var(--primary))" }}>{line.slice(3)}</h3>;
                  if (line.startsWith("```")) return null;
                  if (line.startsWith("- **")) {
                    const match = line.match(/- \*\*(.+?)\*\* — (.+)/);
                    if (match) return (
                      <div key={i} className="flex items-start gap-2 mb-2">
                        <span className="text-xs mt-0.5" style={{ color: "hsl(var(--primary))" }}>•</span>
                        <p className="text-sm"><span className="font-bold" style={{ color: "hsl(var(--foreground))" }}>{match[1]}</span> <span style={{ color: "hsl(var(--muted-foreground))" }}>— {match[2]}</span></p>
                      </div>
                    );
                  }
                  if (line.startsWith("- ")) return (
                    <div key={i} className="flex items-start gap-2 mb-1">
                      <span className="text-xs mt-0.5" style={{ color: "hsl(var(--primary))" }}>•</span>
                      <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{line.slice(2)}</p>
                    </div>
                  );
                  if (line.trim() === "") return <div key={i} className="h-2" />;
                  // Inline code blocks
                  const rendered = line.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded text-xs font-mono" style="background: hsl(232, 40%, 18%); color: #00F5FF;">$1</code>');
                  return <p key={i} className="text-sm mb-2" style={{ color: "hsl(var(--muted-foreground))" }} dangerouslySetInnerHTML={{ __html: rendered }} />;
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setActiveTab("challenge")}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:scale-[1.02]"
                  style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
                >
                  Start Challenge <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "challenge" && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Challenge Prompt */}
              <div className="rounded-xl border p-4 mb-4" style={{ background: "hsl(var(--primary) / 0.05)", borderColor: "hsl(var(--primary) / 0.2)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={14} style={{ color: "hsl(var(--secondary))" }} />
                  <span className="text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>Challenge</span>
                </div>
                <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{lesson.challenge_prompt}</p>
              </div>

              {/* Code Editor */}
              <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "hsl(var(--border))" }}>
                <div className="flex items-center justify-between px-4 py-2 border-b" style={{ background: "hsl(232, 48%, 6%)", borderColor: "hsl(var(--border))" }}>
                  <span className="text-xs font-mono font-bold" style={{ color: "hsl(var(--primary))" }}>sketch.ino</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCode(lesson.challenge_starter_code || "")}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-all hover:opacity-80"
                      style={{ color: "hsl(var(--muted-foreground))" }}
                    >
                      <RotateCcw size={10} /> Reset
                    </button>
                    <button
                      onClick={() => setShowSolution(!showSolution)}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-all hover:opacity-80"
                      style={{ color: "hsl(var(--secondary))" }}
                    >
                      {showSolution ? "Hide" : "Show"} Solution
                    </button>
                  </div>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-4 font-mono text-sm outline-none resize-none"
                  style={{ 
                    background: "hsl(232, 45%, 8%)", 
                    color: "hsl(var(--foreground))",
                    minHeight: "300px",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                  spellCheck={false}
                />
              </div>

              {/* Solution */}
              <AnimatePresence>
                {showSolution && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 rounded-2xl border overflow-hidden"
                    style={{ borderColor: "hsl(var(--success) / 0.3)" }}
                  >
                    <div className="px-4 py-2 border-b" style={{ background: "hsl(var(--success) / 0.05)", borderColor: "hsl(var(--success) / 0.2)" }}>
                      <span className="text-xs font-bold" style={{ color: "hsl(var(--success))" }}>✓ Solution</span>
                    </div>
                    <pre className="p-4 text-sm font-mono overflow-x-auto" style={{ background: "hsl(232, 45%, 8%)", color: "hsl(var(--success))" }}>
                      {lesson.challenge_solution}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setActiveTab("concept")}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all border"
                  style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                >
                  <ArrowLeft size={14} /> Back to Concept
                </button>
                <button
                  onClick={() => setActiveTab("build")}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:scale-[1.02]"
                  style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
                >
                  Build It! <Wrench size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "build" && (
            <motion.div
              key="build"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl border p-6"
              style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: "hsl(var(--primary) / 0.1)" }}>
                  🔨
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: "hsl(var(--foreground))" }}>Build Task</h3>
                  <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Now build it with real hardware!</p>
                </div>
              </div>

              <div className="rounded-xl p-4 mb-6" style={{ background: "hsl(var(--muted) / 0.3)", border: "1px dashed hsl(var(--border))" }}>
                <p className="text-sm" style={{ color: "hsl(var(--foreground))" }}>{lesson.build_task}</p>
              </div>

              {completed ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-xl p-6 text-center"
                  style={{ background: "hsl(var(--success) / 0.08)", border: "1px solid hsl(var(--success) / 0.3)" }}
                >
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: "hsl(var(--success))" }}>Lesson Complete!</h3>
                  <p className="text-sm mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>You earned {lesson.xp_reward} XP</p>
                  <button
                    onClick={() => navigate("/learn")}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
                    style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
                  >
                    Continue Learning →
                  </button>
                </motion.div>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={submitting}
                  className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--success)), hsl(var(--success-deep)))",
                    color: "hsl(var(--primary-foreground))",
                    boxShadow: "0 0 20px hsl(var(--success) / 0.3)",
                  }}
                >
                  <CheckCircle size={16} />
                  {submitting ? "Completing..." : "Mark as Complete"}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
