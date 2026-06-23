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

  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [testStatus, setTestStatus] = useState<"idle" | "running" | "success" | "failed">("idle");

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
      setConsoleOutput(["// Terminal ready. Fix the code errors and click 'Run Verification' below."]);

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

  const runVerification = async () => {
    if (!challenge) return;
    setTestStatus("running");
    setConsoleOutput([
      "[SYSTEM] Initializing compilation toolchain...",
      "[SYSTEM] Loading board definition: Arduino Uno (ATmega328P)...",
      "[COMPILE] Running syntax check..."
    ]);

    await new Promise(r => setTimeout(r, 800));

    // Basic syntax checking
    const lines = code.split("\n");
    let syntaxError = "";
    
    // Check braces balance
    let openBraces = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      openBraces += (line.match(/{/g) || []).length;
      openBraces -= (line.match(/}/g) || []).length;

      // Check missing semicolons on simple statements (ignoring control blocks, comments, and empty lines)
      if (
        line && 
        !line.startsWith("//") && 
        !line.startsWith("#") && 
        !line.endsWith(";") && 
        !line.endsWith("{") && 
        !line.endsWith("}") && 
        !line.includes("void") && 
        !line.includes("if") && 
        !line.includes("for") && 
        !line.includes("while") &&
        !line.startsWith("/*") &&
        !line.startsWith("*")
      ) {
        syntaxError = `Compilation Error: Expected ';' at end of statement on line ${i + 1}.`;
        break;
      }
    }

    if (openBraces !== 0) {
      syntaxError = `Compilation Error: Unmatched curly braces. Check your setup() or loop() scopes.`;
    }

    if (syntaxError) {
      setConsoleOutput(prev => [
        ...prev,
        `[COMPILE] ❌ ${syntaxError}`,
        "[SYSTEM] Verification failed."
      ]);
      setTestStatus("failed");
      return;
    }

    setConsoleOutput(prev => [...prev, "[COMPILE] ✓ Syntax check complete. 0 warnings.", "[TEST] Starting verification test suite..."]);
    await new Promise(r => setTimeout(r, 600));

    // Test specific rules
    const testResults: string[] = [];
    let testsPassed = true;

    const lowerCode = code.toLowerCase();

    // Challenge-specific check rules based on description
    if (challenge.description.toLowerCase().includes("delay") || challenge.description.toLowerCase().includes("block")) {
      if (lowerCode.includes("delay(")) {
        testResults.push("❌ Test 1: Avoid using blocking delay() statements... FAILED");
        testsPassed = false;
      } else {
        testResults.push("✓ Test 1: Avoid using blocking delay() statements... PASSED");
      }

      if (lowerCode.includes("millis()")) {
        testResults.push("✓ Test 2: Implement non-blocking millis() timer... PASSED");
      } else {
        testResults.push("❌ Test 2: Implement non-blocking millis() timer... FAILED");
        testsPassed = false;
      }
    }

    if (challenge.description.toLowerCase().includes("pinmode") || challenge.description.toLowerCase().includes("output") || challenge.description.toLowerCase().includes("input")) {
      if (lowerCode.includes("pinmode(")) {
        testResults.push("✓ Test: Declare pinMode configurations... PASSED");
      } else {
        testResults.push("❌ Test: Declare pinMode configurations... FAILED");
        testsPassed = false;
      }
    }

    // Default catch-all checking if they modified the starter code
    if (code.trim() === challenge.starter_code?.trim()) {
      testResults.push("❌ Test: Modify starter code to solve the bug... FAILED");
      testsPassed = false;
    }

    setConsoleOutput(prev => [
      ...prev,
      ...testResults,
      testsPassed ? "[SUCCESS] All verification tests passed!" : "[SYSTEM] Some verification tests failed. Please review your code."
    ]);

    if (testsPassed) {
      setTestStatus("success");
      await handleComplete();
    } else {
      setTestStatus("failed");
    }
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
      <div className="px-6 py-6 max-w-6xl mx-auto h-[calc(100vh-60px)] flex flex-col">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <button
            onClick={() => navigate("/learn")}
            className="flex items-center gap-2 text-sm font-bold transition-all text-indigo-500 hover:text-indigo-600"
          >
            <ArrowLeft size={14} /> Back to Learn
          </button>
          
          <div className="flex items-center gap-2 bg-indigo-50/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl">
            <Zap size={14} className="text-indigo-400 fill-indigo-400" />
            <span className="text-sm font-bold text-indigo-400">+{challenge.xp_reward} XP</span>
          </div>
        </div>

        {/* Debugging Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 mb-4">
          
          {/* Left panel: Instructions & Details */}
          <div className="lg:col-span-4 flex flex-col space-y-4 min-h-0 overflow-y-auto pr-2">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Flame size={16} className="text-rose-500 fill-rose-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Debugging Arena</span>
              </div>
              <h1 className="text-xl font-bold text-white mb-3">{challenge.title}</h1>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">{challenge.description}</p>
              
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Task Objective:</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Identify and fix syntax, logic, or structure errors in the Arduino code. Use non-blocking strategies and correct function definitions where appropriate.
                </p>
              </div>
            </div>

            {challenge.hint && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-all"
                >
                  <Lightbulb size={13} className="fill-indigo-950" />
                  {showHint ? "Hide Interactive Hint" : "Reveal Hint"}
                </button>
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 text-xs text-indigo-300 leading-relaxed bg-indigo-950/20 border border-indigo-900/40 p-3 rounded-xl"
                    >
                      {challenge.hint}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {completed && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 text-center shadow-sm"
              >
                <div className="text-4xl mb-2">🏆</div>
                <h3 className="text-base font-bold text-emerald-400 mb-1">Challenge Completed!</h3>
                <p className="text-xs text-slate-400 mb-3">Your code solution was successfully verified.</p>
                <button
                  onClick={() => navigate("/learn")}
                  className="clay-btn clay-btn-success clay-btn-sm w-full"
                >
                  Continue Learn Map →
                </button>
              </motion.div>
            )}
          </div>

          {/* Right panel: Editor & Console Terminal */}
          <div className="lg:col-span-8 flex flex-col min-h-0 border border-slate-800 rounded-2xl bg-slate-950 overflow-hidden shadow-lg">
            
            {/* Header bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900">
              <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] animate-pulse" />
                sketch.ino
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCode(challenge.starter_code || "")}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-all"
                >
                  <RotateCcw size={10} /> Reset
                </button>
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 rounded-lg text-xs font-bold text-indigo-300 transition-all"
                >
                  {showSolution ? <EyeOff size={10} /> : <Eye size={10} />}
                  {showSolution ? "Hide Solution" : "View Solution"}
                </button>
              </div>
            </div>

            {/* Interactive textarea editor */}
            <div className="flex-1 min-h-0 relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your Arduino code here..."
                className="w-full h-full p-4 font-mono text-xs outline-none resize-none bg-slate-950 text-[#E2E8F0] caret-indigo-500 leading-relaxed overflow-y-auto"
                spellCheck={false}
              />
            </div>

            {/* Simulated Live Console Terminal */}
            <div className="h-44 border-t border-slate-800 bg-[#060814] flex flex-col">
              <div className="flex items-center justify-between px-4 py-1.5 bg-[#0b0f19] border-b border-slate-800 text-[10px] font-mono text-slate-500 font-bold">
                <span>SIMULATOR CONSOLE</span>
                {testStatus === "running" && <span className="text-indigo-400 animate-pulse">RUNNING TESTS...</span>}
                {testStatus === "success" && <span className="text-emerald-400">PASSED</span>}
                {testStatus === "failed" && <span className="text-rose-400">FAILED</span>}
              </div>
              <div className="flex-1 p-3 font-mono text-[10px] text-slate-400 overflow-y-auto space-y-1 select-text">
                {consoleOutput.map((out, idx) => (
                  <div key={idx} className={
                    out.includes("[SUCCESS]") ? "text-emerald-400 font-bold" :
                    out.includes("❌") || out.includes("Error:") ? "text-rose-400" :
                    out.includes("✓") ? "text-emerald-400" :
                    out.includes("[SYSTEM]") ? "text-indigo-400" : "text-slate-500"
                  }>
                    {out}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-3 border-t border-slate-800 bg-slate-900 flex justify-end">
              <button
                onClick={runVerification}
                disabled={testStatus === "running" || completed}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5 shadow"
              >
                {testStatus === "running" ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle size={12} /> Run Verification
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Pre-rendered solution toggle popup */}
        {showSolution && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowSolution(false)}>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
            <div
              className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl border border-emerald-500/20 overflow-hidden flex flex-col"
              style={{ background: "hsl(var(--background-card))" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-emerald-500/20 bg-emerald-500/5">
                <span className="font-bold text-sm text-emerald-400">Challenge Solution Code</span>
                <button onClick={() => setShowSolution(false)} className="text-slate-400 hover:text-white text-xs font-bold">Close</button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 bg-slate-950">
                <pre className="text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {challenge.solution_code}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

