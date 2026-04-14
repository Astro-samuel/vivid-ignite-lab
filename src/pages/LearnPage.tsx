import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import FadeInView from "@/components/motion/FadeInView";
import MotionCard from "@/components/motion/MotionCard";
import { motion } from "framer-motion";
import { BookOpen, Lock, CheckCircle, ChevronRight, Zap, Clock, Trophy, Flame, Star, Target, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  path_order: number;
  total_lessons: number;
}

interface Lesson {
  id: string;
  path_id: string;
  title: string;
  description: string;
  xp_reward: number;
  lesson_order: number;
  difficulty: string;
  estimated_minutes: number;
}

interface UserProgress {
  lesson_id: string;
  path_id: string;
  status: string;
  score: number;
}

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  xp_reward: number;
  active_date: string;
}

const iconMap: Record<string, any> = {
  Lightbulb: "💡",
  Thermometer: "🌡️",
  Cog: "⚙️",
  Monitor: "📺",
  Wifi: "📡",
};

export default function LearnPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const [pathsRes, lessonsRes, challengeRes] = await Promise.all([
      supabase.from("learning_paths").select("*").order("path_order"),
      supabase.from("lessons").select("*").order("lesson_order"),
      supabase.from("daily_challenges").select("*").lte("active_date", new Date().toISOString().split("T")[0]).order("active_date", { ascending: false }).limit(1),
    ]);

    if (pathsRes.data) setPaths(pathsRes.data);
    if (lessonsRes.data) setLessons(lessonsRes.data);
    if (challengeRes.data?.[0]) setDailyChallenge(challengeRes.data[0]);

    if (user) {
      const { data: prog } = await supabase
        .from("user_lesson_progress")
        .select("lesson_id, path_id, status, score")
        .eq("user_id", user.id);
      if (prog) setProgress(prog);

      // Check if daily challenge completed
      if (challengeRes.data?.[0]) {
        const { data: comp } = await supabase
          .from("user_challenge_completions")
          .select("id")
          .eq("user_id", user.id)
          .eq("challenge_id", challengeRes.data[0].id)
          .maybeSingle();
        setChallengeCompleted(!!comp);
      }
    }

    setLoading(false);
    if (pathsRes.data?.[0]) setSelectedPath(pathsRes.data[0].id);
  };

  const getPathProgress = (pathId: string) => {
    const pathLessons = lessons.filter(l => l.path_id === pathId);
    const completed = progress.filter(p => p.path_id === pathId && p.status === "completed");
    return { total: pathLessons.length, completed: completed.length };
  };

  const getLessonStatus = (lessonId: string, lessonOrder: number, pathId: string) => {
    const p = progress.find(pr => pr.lesson_id === lessonId);
    if (p) return p.status;
    // First lesson is always available
    if (lessonOrder === 1) return "available";
    // Check if previous lesson is completed
    const pathLessons = lessons.filter(l => l.path_id === pathId).sort((a, b) => a.lesson_order - b.lesson_order);
    const prevLesson = pathLessons.find(l => l.lesson_order === lessonOrder - 1);
    if (prevLesson) {
      const prevProgress = progress.find(pr => pr.lesson_id === prevLesson.id);
      if (prevProgress?.status === "completed") return "available";
    }
    return "locked";
  };

  const totalXpEarned = progress.filter(p => p.status === "completed").reduce((sum, p) => sum + (p.score || 0), 0);
  const totalCompleted = progress.filter(p => p.status === "completed").length;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "hsl(var(--muted))", borderTopColor: "hsl(var(--primary))" }} />
            <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Loading curriculum...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-6 py-8 max-w-6xl mx-auto">
        {/* Hero */}
        <FadeInView className="mb-8">
          <div className="relative rounded-2xl overflow-hidden p-8 border" style={{ background: "linear-gradient(135deg, hsl(232, 42%, 11%), hsl(232, 45%, 8%))", borderColor: "hsl(var(--primary) / 0.2)" }}>
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[100px]" style={{ background: "hsl(var(--primary) / 0.15)" }} />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full blur-[80px]" style={{ background: "hsl(var(--purple) / 0.1)" }} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Target size={14} style={{ color: "hsl(var(--primary))" }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--primary))" }}>Progressive Learning</span>
              </div>
              <h1 className="text-3xl font-bold mb-2 font-orbitron" style={{ color: "hsl(var(--foreground))" }}>Learn Arduino</h1>
              <p className="text-sm max-w-lg" style={{ color: "hsl(var(--muted-foreground))" }}>
                Master electronics step by step. Each path teaches a core skill through interactive lessons with real code challenges.
              </p>
              
              {/* Quick Stats */}
              <div className="flex gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} style={{ color: "hsl(var(--success))" }} />
                  <span className="text-sm font-bold" style={{ color: "hsl(var(--success))" }}>{totalCompleted}</span>
                  <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Lessons Done</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={14} style={{ color: "hsl(var(--secondary))" }} />
                  <span className="text-sm font-bold" style={{ color: "hsl(var(--secondary))" }}>{totalXpEarned}</span>
                  <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>XP Earned</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen size={14} style={{ color: "hsl(var(--primary))" }} />
                  <span className="text-sm font-bold" style={{ color: "hsl(var(--primary))" }}>{lessons.length}</span>
                  <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Total Lessons</span>
                </div>
              </div>
            </div>
          </div>
        </FadeInView>

        {/* Daily Challenge Banner */}
        {dailyChallenge && (
          <FadeInView delay={0.05} className="mb-8">
            <motion.div
              className="rounded-2xl p-5 border cursor-pointer"
              style={{
                background: challengeCompleted 
                  ? "hsl(var(--success) / 0.05)" 
                  : "linear-gradient(135deg, hsl(var(--secondary) / 0.08), hsl(var(--destructive) / 0.05))",
                borderColor: challengeCompleted ? "hsl(var(--success) / 0.3)" : "hsl(var(--secondary) / 0.3)",
              }}
              whileHover={{ scale: 1.005 }}
              onClick={() => navigate(`/learn/challenge`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: "hsl(var(--secondary) / 0.15)" }}>
                    {challengeCompleted ? "✅" : "⚡"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Flame size={14} style={{ color: "hsl(var(--destructive))" }} />
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--secondary))" }}>Daily Challenge</span>
                    </div>
                    <h3 className="font-bold" style={{ color: "hsl(var(--foreground))" }}>{dailyChallenge.title}</h3>
                    <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{dailyChallenge.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold" style={{ color: "hsl(var(--secondary))" }}>+{dailyChallenge.xp_reward} XP</span>
                  <ChevronRight size={16} style={{ color: "hsl(var(--muted-foreground))" }} />
                </div>
              </div>
            </motion.div>
          </FadeInView>
        )}

        {/* Skill Tree Paths */}
        <FadeInView delay={0.1} className="mb-6">
          <h2 className="text-lg font-bold mb-4" style={{ color: "hsl(var(--foreground))" }}>Skill Trees</h2>
          <div className="grid grid-cols-5 gap-3 mb-6">
            {paths.map((path, i) => {
              const prog = getPathProgress(path.id);
              const pct = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
              const isSelected = selectedPath === path.id;
              return (
                <motion.button
                  key={path.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedPath(path.id)}
                  className="rounded-2xl p-4 border text-left transition-all relative overflow-hidden"
                  style={{
                    background: isSelected ? `${path.color}15` : "hsl(var(--card))",
                    borderColor: isSelected ? `${path.color}50` : "hsl(var(--border))",
                    boxShadow: isSelected ? `0 0 20px ${path.color}20` : "none",
                  }}
                >
                  <div className="text-2xl mb-2">{iconMap[path.icon] || "📦"}</div>
                  <p className="text-sm font-bold mb-0.5" style={{ color: isSelected ? path.color : "hsl(var(--foreground))" }}>{path.title}</p>
                  <p className="text-xs mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>{prog.completed}/{prog.total} lessons</p>
                  
                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: path.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                    />
                  </div>
                  {pct === 100 && (
                    <div className="absolute top-3 right-3">
                      <Trophy size={14} style={{ color: path.color }} />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </FadeInView>

        {/* Selected Path Lessons */}
        {selectedPath && (
          <FadeInView delay={0.15}>
            <div className="rounded-2xl border p-6" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
              {(() => {
                const path = paths.find(p => p.id === selectedPath);
                if (!path) return null;
                const pathLessons = lessons.filter(l => l.path_id === selectedPath).sort((a, b) => a.lesson_order - b.lesson_order);
                
                return (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="text-3xl">{iconMap[path.icon] || "📦"}</div>
                      <div>
                        <h3 className="text-lg font-bold" style={{ color: path.color }}>{path.title}</h3>
                        <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{path.description}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {pathLessons.map((lesson, i) => {
                        const status = getLessonStatus(lesson.id, lesson.lesson_order, selectedPath);
                        const isLocked = status === "locked";
                        const isCompleted = status === "completed";
                        const isInProgress = status === "in_progress";

                        return (
                          <motion.div
                            key={lesson.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => {
                              if (!isLocked) navigate(`/learn/lesson/${lesson.id}`);
                            }}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.005]"}`}
                            style={{
                              background: isCompleted ? "hsl(var(--success) / 0.05)" : isInProgress ? `${path.color}08` : "hsl(var(--muted) / 0.3)",
                              borderColor: isCompleted ? "hsl(var(--success) / 0.3)" : isInProgress ? `${path.color}30` : "hsl(var(--border))",
                            }}
                          >
                            {/* Lesson Number */}
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                              style={{
                                background: isCompleted ? "hsl(var(--success) / 0.15)" : isLocked ? "hsl(var(--muted))" : `${path.color}20`,
                                color: isCompleted ? "hsl(var(--success))" : isLocked ? "hsl(var(--muted-foreground))" : path.color,
                                border: `2px solid ${isCompleted ? "hsl(var(--success) / 0.4)" : isLocked ? "hsl(var(--border))" : `${path.color}40`}`,
                              }}
                            >
                              {isCompleted ? <CheckCircle size={18} /> : isLocked ? <Lock size={14} /> : lesson.lesson_order}
                            </div>

                            {/* Lesson Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm" style={{ color: isLocked ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))" }}>
                                {lesson.title}
                              </h4>
                              <p className="text-xs truncate" style={{ color: "hsl(var(--muted-foreground))" }}>{lesson.description}</p>
                            </div>

                            {/* Meta */}
                            <div className="flex items-center gap-4 flex-shrink-0">
                              <div className="flex items-center gap-1">
                                <Clock size={12} style={{ color: "hsl(var(--muted-foreground))" }} />
                                <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{lesson.estimated_minutes}m</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Zap size={12} style={{ color: "hsl(var(--secondary))" }} />
                                <span className="text-xs font-bold" style={{ color: "hsl(var(--secondary))" }}>+{lesson.xp_reward}</span>
                              </div>
                              {!isLocked && <ChevronRight size={14} style={{ color: "hsl(var(--muted-foreground))" }} />}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          </FadeInView>
        )}
      </div>
    </Layout>
  );
}
