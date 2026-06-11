import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, Lock, Clock, Zap, Flame, Star, Trophy, ChevronRight, Target,
} from "lucide-react";
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

// Map emoji icons to actual emojis
const iconMap: Record<string, string> = {
  Lightbulb: "💡",
  Thermometer: "🌡️",
  Cog: "⚙️",
  Monitor: "📺",
  Wifi: "📡",
};

// Path colors mapped to clay-style palette
const pathColorMap: Record<string, { bg: string; border: string; shadow: string; text: string; light: string }> = {
  "#3B82F6": { bg: "#3B82F6", border: "#2563EB", shadow: "#1D4ED8", text: "#1D4ED8", light: "#EFF6FF" },
  "#10B981": { bg: "#10B981", border: "#059669", shadow: "#047857", text: "#065F46", light: "#ECFDF5" },
  "#F59E0B": { bg: "#F59E0B", border: "#D97706", shadow: "#B45309", text: "#92400E", light: "#FFFBEB" },
  "#8B5CF6": { bg: "#8B5CF6", border: "#7C3AED", shadow: "#6D28D9", text: "#4C1D95", light: "#F5F3FF" },
  "#EF4444": { bg: "#EF4444", border: "#DC2626", shadow: "#B91C1C", text: "#7F1D1D", light: "#FEF2F2" },
};
const defaultColor = { bg: "#6366F1", border: "#4F46E5", shadow: "#4338CA", text: "#312E81", light: "#EEF2FF" };

function getPathColor(hex: string) {
  return pathColorMap[hex] || defaultColor;
}

// Duolingo-style circular node
function LessonNode({
  lesson,
  status,
  pathColor,
  onClick,
  index,
}: {
  lesson: Lesson;
  status: "completed" | "available" | "locked";
  pathColor: ReturnType<typeof getPathColor>;
  onClick: () => void;
  index: number;
}) {
  const isAvailable = status === "available";
  const isCompleted = status === "completed";
  const isLocked = status === "locked";

  // Zigzag offset for map feel
  const offset = index % 2 === 0 ? 0 : 32;

  return (
    <div className="flex flex-col items-center" style={{ marginLeft: offset }}>
      <motion.button
        id={`lesson-node-${lesson.id}`}
        onClick={onClick}
        disabled={isLocked}
        className="lesson-node relative"
        style={
          isCompleted
            ? {
                background: "#22C55E",
                borderColor: "#16A34A",
                boxShadow: "0 5px 0 0 #15803D, 0 8px 16px rgba(34,197,94,0.3)",
                color: "white",
                width: 64,
                height: 64,
              }
            : isAvailable
            ? {
                background: pathColor.bg,
                borderColor: pathColor.border,
                boxShadow: `0 5px 0 0 ${pathColor.shadow}, 0 8px 20px ${pathColor.bg}55`,
                color: "white",
                width: 64,
                height: 64,
                animation: "nodeFloat 3s ease-in-out infinite",
              }
            : {
                background: "hsl(238, 45%, 90%)",
                borderColor: "hsl(238, 45%, 82%)",
                boxShadow: "0 4px 0 0 hsl(238, 45%, 76%)",
                color: "hsl(240, 14%, 65%)",
                width: 64,
                height: 64,
                cursor: "not-allowed",
              }
        }
        whileHover={!isLocked ? { scale: 1.12 } : {}}
        whileTap={!isLocked ? { scale: 0.95 } : {}}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.06, type: "spring", stiffness: 400, damping: 25 }}
        aria-label={`${lesson.title} — ${status}`}
      >
        {isCompleted ? (
          <CheckCircle size={28} strokeWidth={2.5} />
        ) : isLocked ? (
          <Lock size={22} strokeWidth={2} />
        ) : (
          <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: "1.1rem" }}>
            {lesson.lesson_order}
          </span>
        )}
      </motion.button>

      {/* Label below node */}
      <p
        className="text-center mt-1.5 font-bold text-xs leading-tight max-w-[80px]"
        style={{ color: isLocked ? "hsl(240, 14%, 70%)" : pathColor.text, fontFamily: "'Baloo 2', sans-serif" }}
      >
        {lesson.title}
      </p>
    </div>
  );
}

// Dotted connector between nodes
function PathConnector({ completed }: { completed: boolean }) {
  return (
    <div className="flex items-center justify-center h-6">
      <div
        style={{
          width: 3,
          height: 24,
          borderLeft: `3px dashed ${completed ? "#22C55E" : "hsl(238, 45%, 80%)"}`,
        }}
      />
    </div>
  );
}

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
  const [xpBurst, setXpBurst] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");

  const getPathLevel = (order: number): "beginner" | "intermediate" | "advanced" => {
    if (order <= 2) return "beginner";
    if (order <= 4) return "intermediate";
    return "advanced";
  };

  useEffect(() => { loadData(); }, [user]);

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

  const getLessonStatus = (lessonId: string, lessonOrder: number, pathId: string): "completed" | "available" | "locked" => {
    const p = progress.find(pr => pr.lesson_id === lessonId);
    if (p?.status === "completed") return "completed";
    if (p?.status === "in_progress") return "available";
    if (lessonOrder === 1) return "available";
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

  const handleLessonClick = (lesson: Lesson, status: string) => {
    if (status === "locked") return;
    navigate(`/learn/lesson/${lesson.id}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full border-4"
              style={{ borderColor: "hsl(241, 100%, 93%)", borderTopColor: "#6366F1" }}
            />
            <p className="font-bold text-sm" style={{ color: "hsl(240, 14%, 60%)", fontFamily: "'Baloo 2', sans-serif" }}>
              Loading curriculum...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const selectedPathData = paths.find(p => p.id === selectedPath);
  const selectedColor = selectedPathData ? getPathColor(selectedPathData.color) : defaultColor;
  const pathLessons = selectedPath
    ? lessons.filter(l => l.path_id === selectedPath).sort((a, b) => a.lesson_order - b.lesson_order)
    : [];

  return (
    <Layout>
      <div className="px-4 md:px-6 py-6 max-w-4xl mx-auto">

        {/* ── Page Header ── */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1
            className="text-3xl font-black mb-1"
            style={{ fontFamily: "'Baloo 2', sans-serif", color: "hsl(244, 61%, 33%)" }}
          >
            Learn Arduino
          </h1>
          <p className="text-sm font-semibold" style={{ color: "hsl(240, 14%, 60%)" }}>
            Master electronics step by step
          </p>
        </motion.div>

        {/* ── Quick Stats Row ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Lessons Done", value: totalCompleted, icon: CheckCircle, color: "#22C55E", bg: "#DCFCE7", border: "#86EFAC" },
            { label: "XP Earned",    value: totalXpEarned,  icon: Zap,         color: "#A855F7", bg: "#F5F3FF", border: "#C4B5FD" },
            { label: "Total Lessons", value: lessons.length, icon: Star,        color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A" },
          ].map(({ label, value, icon: Icon, color, bg, border }, i) => (
            <motion.div
              key={label}
              className="rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
              style={{
                background: bg,
                border: `2.5px solid ${border}`,
                boxShadow: `0 4px 0 0 ${border}`,
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Icon size={20} style={{ color }} strokeWidth={2.5} />
              <p className="text-2xl font-black" style={{ fontFamily: "'Baloo 2', sans-serif", color }}>
                {value}
              </p>
              <p className="text-xs font-bold" style={{ color: "hsl(240, 14%, 55%)" }}>{label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Daily Challenge Banner ── */}
        {dailyChallenge && (
          <motion.div
            className="mb-6 cursor-pointer"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            onClick={() => navigate("/learn/challenge")}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div
              className="rounded-2xl p-4 flex items-center justify-between"
              style={
                challengeCompleted
                  ? {
                      background: "#DCFCE7",
                      border: "2.5px solid #86EFAC",
                      boxShadow: "0 4px 0 0 #4ADE80",
                    }
                  : {
                      background: "linear-gradient(135deg, #FFFBEB, #FEF9C3)",
                      border: "2.5px solid #FDE68A",
                      boxShadow: "0 4px 0 0 #FCD34D",
                    }
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{
                    background: challengeCompleted ? "#BBF7D0" : "#FEF3C7",
                    border: `2px solid ${challengeCompleted ? "#86EFAC" : "#FDE68A"}`,
                  }}
                >
                  {challengeCompleted ? "✅" : "⚡"}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Flame size={13} style={{ color: "#F59E0B" }} />
                    <span
                      className="text-xs font-black uppercase tracking-wider"
                      style={{ color: "#92400E", fontFamily: "'Baloo 2', sans-serif" }}
                    >
                      Daily Challenge
                    </span>
                  </div>
                  <h3 className="font-black text-sm" style={{ color: "hsl(244, 61%, 33%)", fontFamily: "'Baloo 2', sans-serif" }}>
                    {dailyChallenge.title}
                  </h3>
                  <p className="text-xs font-semibold" style={{ color: "hsl(240, 14%, 55%)" }}>
                    {dailyChallenge.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className="font-black text-sm px-3 py-1 rounded-full"
                  style={{ background: "#FEF3C7", color: "#92400E", border: "2px solid #FDE68A" }}
                >
                  +{dailyChallenge.xp_reward} XP
                </span>
                <ChevronRight size={18} style={{ color: "#92400E" }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Skill Path Selector ── */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-black"
              style={{ color: "hsl(var(--foreground))", fontFamily: "'Baloo 2', sans-serif" }}
            >
              Skill Paths
            </h2>
            <div className="flex bg-slate-100/50 p-1 rounded-2xl border-2 border-slate-100 max-w-md">
              {(["all", "beginner", "intermediate", "advanced"] as const).map((level) => {
                const active = difficultyFilter === level;
                return (
                  <button
                    key={level}
                    onClick={() => {
                      setDifficultyFilter(level);
                      const filtered = paths.filter(p => level === "all" || getPathLevel(p.path_order) === level);
                      if (filtered.length > 0 && !filtered.find(p => p.id === selectedPath)) {
                        setSelectedPath(filtered[0].id);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all border-2 border-b-4 ${
                      active
                        ? "bg-white border-slate-200 text-indigo-600 shadow-sm"
                        : "bg-transparent border-transparent text-slate-500 hover:text-slate-600"
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {paths
              .filter(p => difficultyFilter === "all" || getPathLevel(p.path_order) === difficultyFilter)
              .map((path, i) => {
                const prog = getPathProgress(path.id);
                const pct = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
                const isSelected = selectedPath === path.id;
                const c = getPathColor(path.color);

                return (
                  <motion.button
                    key={path.id}
                    id={`path-selector-${path.id}`}
                    onClick={() => setSelectedPath(path.id)}
                    className="rounded-2xl p-4 text-center transition-all cursor-pointer"
                    style={
                      isSelected
                        ? {
                            background: c.light,
                            border: `2.5px solid ${c.border}`,
                            boxShadow: `0 4px 0 0 ${c.shadow}`,
                            transform: "translateY(-2px)",
                          }
                        : {
                            background: "white",
                            border: "2.5px solid hsl(238, 45%, 88%)",
                            boxShadow: "0 4px 0 0 hsl(238, 40%, 82%)",
                          }
                    }
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.04 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Circular progress ring */}
                    <div className="relative w-10 h-10 mx-auto mb-2">
                      <svg className="absolute inset-0" width="40" height="40" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="17" fill="none" stroke="hsl(238, 45%, 90%)" strokeWidth="4" />
                        <motion.circle
                          cx="20" cy="20" r="17"
                          fill="none"
                          stroke={c.bg}
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 17}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 17 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 17 * (1 - pct / 100) }}
                          transform="rotate(-90 20 20)"
                          transition={{ duration: 1, delay: 0.3 + i * 0.05, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-lg">
                        {iconMap[path.icon] || "📦"}
                      </div>
                    </div>
                    <p
                      className="text-xs font-black leading-tight"
                      style={{ color: isSelected ? c.text : "hsl(244, 61%, 33%)", fontFamily: "'Baloo 2', sans-serif" }}
                    >
                      {path.title}
                    </p>
                    <p className="text-[10px] font-semibold mt-0.5" style={{ color: "hsl(240, 14%, 62%)" }}>
                      {prog.completed}/{prog.total}
                    </p>
                    {pct === 100 && (
                      <Trophy size={12} className="mx-auto mt-1" style={{ color: c.bg }} />
                    )}
                  </motion.button>
                );
              })}
          </div>
        </motion.div>

        {/* ── Skill Map — Duolingo circular nodes ── */}
        {selectedPath && selectedPathData && (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPath}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Path header */}
              <div
                className="rounded-2xl p-5 mb-4 flex items-center gap-4"
                style={{
                  background: selectedColor.light,
                  border: `2.5px solid ${selectedColor.border}`,
                  boxShadow: `0 4px 0 0 ${selectedColor.shadow}`,
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{
                    background: "white",
                    border: `2px solid ${selectedColor.border}`,
                    boxShadow: `0 3px 0 0 ${selectedColor.shadow}`,
                  }}
                >
                  {iconMap[selectedPathData.icon] || "📦"}
                </div>
                <div>
                  <h3
                    className="text-xl font-black"
                    style={{ color: selectedColor.text, fontFamily: "'Baloo 2', sans-serif" }}
                  >
                    {selectedPathData.title}
                  </h3>
                  <p className="text-sm font-semibold" style={{ color: "hsl(240, 14%, 55%)" }}>
                    {selectedPathData.description}
                  </p>
                  {/* Path progress bar */}
                  <div className="clay-progress-track mt-2" style={{ height: 10 }}>
                    <motion.div
                      className="clay-progress-fill"
                      style={{ height: "100%", background: `linear-gradient(90deg, ${selectedColor.bg}, ${selectedColor.border})` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${getPathProgress(selectedPath).total > 0 ? Math.round((getPathProgress(selectedPath).completed / getPathProgress(selectedPath).total) * 100) : 0}%` }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              {/* Node Map */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "white",
                  border: "2.5px solid hsl(238, 45%, 88%)",
                  boxShadow: "0 4px 0 0 hsl(238, 40%, 82%)",
                }}
              >
                <h3
                  className="text-sm font-black mb-5 uppercase tracking-wider"
                  style={{ color: "hsl(240, 14%, 60%)", fontFamily: "'Baloo 2', sans-serif" }}
                >
                  Lesson Map
                </h3>

                {/* Vertical node map */}
                <div className="flex flex-col items-center gap-0">
                  {pathLessons.map((lesson, i) => {
                    const status = getLessonStatus(lesson.id, lesson.lesson_order, selectedPath);
                    const isCompleted = status === "completed";
                    const isNext = i > 0 && getLessonStatus(pathLessons[i - 1].id, pathLessons[i - 1].lesson_order, selectedPath) === "completed" && !isCompleted;

                    return (
                      <div key={lesson.id} className="flex flex-col items-center">
                        {i > 0 && (
                          <PathConnector
                            completed={getLessonStatus(pathLessons[i - 1].id, pathLessons[i - 1].lesson_order, selectedPath) === "completed"}
                          />
                        )}
                        <div className="flex items-center gap-4">
                          <LessonNode
                            lesson={lesson}
                            status={status}
                            pathColor={selectedColor}
                            onClick={() => handleLessonClick(lesson, status)}
                            index={i}
                          />
                          {/* Lesson info card — only for available/current */}
                          {(status === "available" || isNext) && (
                            <motion.div
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.06 + 0.2 }}
                              className="rounded-xl p-3 cursor-pointer"
                              style={{
                                background: selectedColor.light,
                                border: `2px solid ${selectedColor.border}`,
                                boxShadow: `0 3px 0 0 ${selectedColor.shadow}`,
                                minWidth: 180,
                                maxWidth: 220,
                              }}
                              onClick={() => handleLessonClick(lesson, status)}
                            >
                              <p
                                className="font-black text-sm leading-tight mb-1"
                                style={{ color: selectedColor.text, fontFamily: "'Baloo 2', sans-serif" }}
                              >
                                {lesson.title}
                              </p>
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "hsl(240, 14%, 60%)" }}>
                                  <Clock size={11} /> {lesson.estimated_minutes}m
                                </span>
                                <span
                                  className="flex items-center gap-1 text-xs font-black"
                                  style={{ color: "#A855F7" }}
                                >
                                  <Zap size={11} /> +{lesson.xp_reward} XP
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Completion state */}
                  {pathLessons.length > 0 &&
                    pathLessons.every(l => getLessonStatus(l.id, l.lesson_order, selectedPath) === "completed") && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="mt-4 flex flex-col items-center gap-2"
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{
                          background: "#FEF3C7",
                          border: "3px solid #FDE68A",
                          boxShadow: "0 5px 0 0 #FCD34D",
                        }}
                      >
                        <Trophy size={28} style={{ color: "#F59E0B" }} />
                      </div>
                      <p className="font-black text-sm" style={{ color: "#92400E", fontFamily: "'Baloo 2', sans-serif" }}>
                        Path Complete! 🎉
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Empty state */}
        {paths.length === 0 && !loading && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"
              style={{ background: "#EEF2FF", border: "3px solid #C7D2FE" }}>
              📚
            </div>
            <h3 className="text-xl font-black mb-2" style={{ fontFamily: "'Baloo 2', sans-serif", color: "hsl(244, 61%, 33%)" }}>
              No learning paths yet
            </h3>
            <p className="text-sm font-semibold" style={{ color: "hsl(240, 14%, 60%)" }}>
              Check back soon — content is being added!
            </p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
