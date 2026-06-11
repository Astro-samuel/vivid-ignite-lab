import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import FadeInView from "@/components/motion/FadeInView";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Flame, Zap, Lightbulb, CheckCircle, RotateCcw, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function DailyChallengePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadChallenge();
  }, [user]);

  const loadChallenge = async () => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("daily_challenges")
      .select("*")
      .lte("active_date", today)
      .order("active_date", { ascending: false })
      .limit(1);

    if (data?.[0]) {
      setChallenge(data[0]);
      setCode(data[0].starter_code || "");

      if (user) {
        const { data: comp } = await supabase
          .from("user_challenge_completions")
          .select("id")
          .eq("user_id", user.id)
          .eq("challenge_id", data[0].id)
          .maybeSingle();
        setCompleted(!!comp);
      }
    }
    setLoading(false);
  };

  const handleComplete = async () => {
    if (!user || !challenge) return;
    setSubmitting(true);

    await supabase.from("user_challenge_completions").upsert({
      user_id: user.id,
      challenge_id: challenge.id,
      score: challenge.xp_reward,
    }, { onConflict: "user_id,challenge_id" });

    const { data: profile } = await supabase
      .from("profiles")
      .select("total_xp")
      .eq("id", user.id)
      .single();

    if (profile) {
      await supabase.from("profiles").update({
        total_xp: (profile.total_xp || 0) + challenge.xp_reward,
      }).eq("id", user.id);
    }

    setCompleted(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!challenge) {
    return (
      <Layout>
        <div className="px-6 py-12 text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-extrabold font-display text-indigo-950 mb-2">No active challenge today</h2>
          <p className="text-sm font-semibold text-slate-400 mb-6">Come back tomorrow for a fresh daily build challenge!</p>
          <button
            onClick={() => navigate("/learn")}
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 border-2 border-b-4 border-indigo-700 active:border-b-2 active:translate-y-[2px] rounded-xl text-sm font-extrabold text-white transition-all"
          >
            ← Back to Learn
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-6 py-6 max-w-4xl mx-auto">
        <FadeInView className="mb-6">
          <button
            onClick={() => navigate("/learn")}
            className="flex items-center gap-2 text-sm font-bold mb-4 transition-all text-indigo-500 hover:text-indigo-600"
          >
            <ArrowLeft size={14} /> Back to Learn
          </button>

          <div className="bg-white border-2 border-b-4 border-slate-100 rounded-2xl p-6 relative overflow-hidden shadow-sm">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[80px] bg-indigo-50" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 border-2 border-b-4 border-rose-200 flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Flame size={14} className="text-rose-500 fill-rose-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Daily Challenge</span>
                  </div>
                  <h1 className="text-xl font-extrabold font-display text-indigo-950">{challenge.title}</h1>
                  <p className="text-sm font-medium text-slate-500">{challenge.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-indigo-50 border-2 border-indigo-100 px-4 py-2 rounded-2xl self-start md:self-auto">
                <Zap size={16} className="text-indigo-600 fill-indigo-600" />
                <span className="text-lg font-extrabold font-display text-indigo-600">+{challenge.xp_reward} XP</span>
              </div>
            </div>
          </div>
        </FadeInView>

        {/* Hint */}
        {challenge.hint && (
          <div className="mb-6">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-all"
            >
              <Lightbulb size={12} className="fill-indigo-100" />
              {showHint ? "Hide Hint" : "Need a Hint?"}
            </button>
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 rounded-2xl p-4 bg-indigo-50/50 border-2 border-indigo-100"
                >
                  <p className="text-sm font-semibold text-indigo-700">💡 Hint: {challenge.hint}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Code Editor */}
        <div className="rounded-2xl border-2 border-b-4 border-slate-200 overflow-hidden mb-6 bg-slate-900 shadow-md">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
            <span className="text-xs font-mono font-extrabold text-indigo-400">challenge.ino</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCode(challenge.starter_code || "")}
                className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-all"
              >
                <RotateCcw size={10} /> Reset
              </button>
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="flex items-center gap-1 px-3 py-1 bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 rounded-lg text-xs font-bold text-indigo-300 transition-all"
              >
                {showSolution ? <EyeOff size={10} /> : <Eye size={10} />}
                {showSolution ? "Hide" : "Show"} Solution
              </button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-4 font-mono text-sm outline-none resize-none block bg-slate-900"
            style={{
              color: "#E2E8F0", // Fix dark text on dark bg visual bug
              caretColor: "#6366F1",
              minHeight: "300px",
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: "1.6",
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
              className="mb-6 rounded-2xl border-2 border-b-4 border-emerald-200 overflow-hidden"
            >
              <div className="px-4 py-2 border-b border-emerald-100 bg-emerald-50">
                <span className="text-xs font-extrabold text-emerald-700">✓ Solution</span>
              </div>
              <pre className="p-4 text-sm font-mono overflow-x-auto bg-slate-900 text-emerald-400">
                {challenge.solution_code}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Complete */}
        {completed ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl p-6 text-center bg-emerald-50 border-2 border-b-4 border-emerald-200 shadow-sm"
          >
            <div className="text-5xl mb-3">🏆</div>
            <h3 className="text-xl font-extrabold font-display text-emerald-800 mb-1">Challenge Completed!</h3>
            <p className="text-sm font-semibold text-slate-500 mb-4">You earned {challenge.xp_reward} XP. Come back tomorrow for a new daily challenge!</p>
            <button
              onClick={() => navigate("/learn")}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 border-2 border-b-4 border-indigo-700 active:border-b-2 active:translate-y-[2px] rounded-xl text-sm font-extrabold text-white transition-all shadow-sm"
            >
              Continue Learning →
            </button>
          </motion.div>
        ) : (
          <button
            onClick={handleComplete}
            disabled={submitting || !user}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 border-2 border-b-4 border-emerald-700 active:border-b-2 active:translate-y-[2px] rounded-xl text-sm font-extrabold text-white flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:pointer-events-none"
          >
            <CheckCircle size={16} />
            {submitting ? "Completing..." : "Mark Challenge Complete"}
          </button>
        )}
      </div>
    </Layout>
  );
}
