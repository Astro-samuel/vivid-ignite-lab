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
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: "hsl(var(--muted))", borderTopColor: "hsl(var(--primary))" }} />
        </div>
      </Layout>
    );
  }

  if (!challenge) {
    return (
      <Layout>
        <div className="px-6 py-8 text-center">
          <div className="text-5xl mb-4">🎯</div>
          <p className="font-bold" style={{ color: "hsl(var(--foreground))" }}>No challenge available today</p>
          <p className="text-sm mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>Check back tomorrow!</p>
          <button onClick={() => navigate("/learn")} className="text-sm font-bold" style={{ color: "hsl(var(--primary))" }}>← Back to Learn</button>
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
            className="flex items-center gap-2 text-sm font-medium mb-4 transition-all hover:opacity-80"
            style={{ color: "hsl(var(--primary))" }}
          >
            <ArrowLeft size={14} /> Back to Learn
          </button>

          <div className="rounded-2xl p-6 border relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(var(--secondary) / 0.08), hsl(var(--destructive) / 0.05))", borderColor: "hsl(var(--secondary) / 0.3)" }}>
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[80px]" style={{ background: "hsl(var(--secondary) / 0.15)" }} />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl" style={{ background: "hsl(var(--secondary) / 0.15)" }}>⚡</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Flame size={14} style={{ color: "hsl(var(--destructive))" }} />
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--secondary))" }}>Daily Challenge</span>
                  </div>
                  <h1 className="text-xl font-bold" style={{ color: "hsl(var(--foreground))" }}>{challenge.title}</h1>
                  <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{challenge.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={16} style={{ color: "hsl(var(--secondary))" }} />
                <span className="text-lg font-bold" style={{ color: "hsl(var(--secondary))" }}>+{challenge.xp_reward} XP</span>
              </div>
            </div>
          </div>
        </FadeInView>

        {/* Hint */}
        {challenge.hint && (
          <div className="mb-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 text-xs font-semibold transition-all hover:opacity-80"
              style={{ color: "hsl(var(--secondary))" }}
            >
              <Lightbulb size={12} />
              {showHint ? "Hide Hint" : "Need a Hint?"}
            </button>
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 rounded-xl p-3 border"
                  style={{ background: "hsl(var(--secondary) / 0.05)", borderColor: "hsl(var(--secondary) / 0.2)" }}
                >
                  <p className="text-sm" style={{ color: "hsl(var(--secondary))" }}>💡 {challenge.hint}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Code Editor */}
        <div className="rounded-2xl border overflow-hidden mb-4" style={{ borderColor: "hsl(var(--border))" }}>
          <div className="flex items-center justify-between px-4 py-2 border-b" style={{ background: "hsl(232, 48%, 6%)", borderColor: "hsl(var(--border))" }}>
            <span className="text-xs font-mono font-bold" style={{ color: "hsl(var(--primary))" }}>challenge.ino</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCode(challenge.starter_code || "")}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                <RotateCcw size={10} /> Reset
              </button>
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                style={{ color: "hsl(var(--secondary))" }}
              >
                {showSolution ? <EyeOff size={10} /> : <Eye size={10} />}
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
              className="mb-4 rounded-2xl border overflow-hidden"
              style={{ borderColor: "hsl(var(--success) / 0.3)" }}
            >
              <div className="px-4 py-2 border-b" style={{ background: "hsl(var(--success) / 0.05)", borderColor: "hsl(var(--success) / 0.2)" }}>
                <span className="text-xs font-bold" style={{ color: "hsl(var(--success))" }}>✓ Solution</span>
              </div>
              <pre className="p-4 text-sm font-mono overflow-x-auto" style={{ background: "hsl(232, 45%, 8%)", color: "hsl(var(--success))" }}>
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
            className="rounded-xl p-6 text-center"
            style={{ background: "hsl(var(--success) / 0.08)", border: "1px solid hsl(var(--success) / 0.3)" }}
          >
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-lg font-bold mb-1" style={{ color: "hsl(var(--success))" }}>Challenge Complete!</h3>
            <p className="text-sm mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>You earned {challenge.xp_reward} XP. Come back tomorrow for a new challenge!</p>
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
            disabled={submitting || !user}
            className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, hsl(var(--success)), hsl(var(--success-deep)))",
              color: "hsl(var(--primary-foreground))",
              boxShadow: "0 0 20px hsl(var(--success) / 0.3)",
            }}
          >
            <CheckCircle size={16} />
            {submitting ? "Completing..." : "Mark Challenge Complete"}
          </button>
        )}
      </div>
    </Layout>
  );
}
