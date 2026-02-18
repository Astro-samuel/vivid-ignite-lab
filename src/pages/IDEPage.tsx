import { useState, useRef, useEffect } from "react";
import { Play, AlertTriangle, CheckCircle, XCircle, Brain, Loader2, Zap, Bug, RefreshCw } from "lucide-react";
import Layout from "@/components/Layout";

type RunStep = "idle" | "compiling" | "simulating" | "safety" | "success" | "error";

const sampleCode = `// Smart LED Mood Lamp
// Controls LED brightness based on ambient light

const int LED_PIN = 9;
const int SENSOR_PIN = A0;
int brightness = 0;
int sensorValue = 0;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Smart LED Lamp Starting...");
}

void loop() {
  sensorValue = analogRead(SENSOR_PIN);
  // Map sensor value (0-1023) to LED brightness (0-255)
  brightness = map(sensorValue, 0, 1023, 255, 0);
  analogWrite(LED_PIN, brightness);
  
  Serial.print("Sensor: ");
  Serial.print(sensorValue);
  Serial.print(" | Brightness: ");
  Serial.println(brightness);
  
  delay(100);
}`;

const errorCode = `void setup() {
  Serial.begin(9600)
  pinMod(13, OUTPUT);  // Error: typo in function name
}

void loop() {
  digitalWrite(13, HIGH)
  delay(1000;           // Error: missing closing parenthesis
  digitalWrite(13, LOW);
  delay(1000);
}`;

interface DebugMessage {
  role: "ai" | "user";
  content: string;
}

const aiHints = [
  "I can see you have a missing semicolon on line 2. In C++, every statement must end with `;`. Try adding it after `Serial.begin(9600)`.",
  "There's a typo on line 3 – `pinMod` should be `pinMode`. Arduino's API is case-sensitive, so these exact function names matter.",
  "Good catch! Now look at line 7 – can you spot where the closing parenthesis `)` is missing in the delay call?",
  "You're almost there! Once you fix the syntax errors, think about what `delay(1000)` does. How long will the LED stay on vs off?",
];

export default function IDEPage() {
  const [code, setCode] = useState(sampleCode);
  const [runStep, setRunStep] = useState<RunStep>("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [debugMessages, setDebugMessages] = useState<DebugMessage[]>([]);
  const [hintIndex, setHintIndex] = useState(0);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [autoSaveCountdown, setAutoSaveCountdown] = useState(30);
  const codeRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoSaveCountdown((prev) => {
        if (prev <= 1) {
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const runAndCheck = async () => {
    setErrors([]);
    setXpAwarded(false);

    // Step 1: Compiling
    setRunStep("compiling");
    await delay(1200);

    // Check for errors (simplified)
    const hasErrors = code.includes("pinMod(") || code.includes("delay(1000;");
    const foundErrors: string[] = [];
    if (code.includes("pinMod(")) foundErrors.push("Line 3: 'pinMod' is not defined. Did you mean 'pinMode'?");
    if (code.includes("delay(1000;")) foundErrors.push("Line 7: Syntax error – missing closing parenthesis ')'");
    if (!code.includes(";") && code.length > 50) foundErrors.push("Line 2: Missing semicolon ';'");

    if (hasErrors) {
      setErrors(foundErrors);
      setRunStep("error");
      return;
    }

    // Step 2: Simulating
    setRunStep("simulating");
    await delay(1500);

    // Step 3: Safety Check
    setRunStep("safety");
    await delay(1000);

    // Step 4: Success
    setRunStep("success");
    setXpAwarded(true);
  };

  const debugWithAI = () => {
    setShowDebug(true);
    if (debugMessages.length === 0) {
      setDebugMessages([
        {
          role: "ai",
          content: "🧠 I can see your code and the errors. Let me help you think through this. " + aiHints[0],
        },
      ]);
    }
  };

  const askNextHint = () => {
    const nextIdx = (hintIndex + 1) % aiHints.length;
    setHintIndex(nextIdx);
    setDebugMessages((prev) => [
      ...prev,
      { role: "user", content: "Give me another hint" },
      { role: "ai", content: aiHints[nextIdx] },
    ]);
  };

  const loadErrorCode = () => {
    setCode(errorCode);
    setRunStep("idle");
    setErrors([]);
    setXpAwarded(false);
  };

  const resetCode = () => {
    setCode(sampleCode);
    setRunStep("idle");
    setErrors([]);
    setXpAwarded(false);
    setShowDebug(false);
  };

  return (
    <Layout>
      <div className="flex flex-col h-full" style={{ minHeight: "calc(100vh - 0px)" }}>
        {/* Top Bar */}
        <div
          className="flex items-center justify-between px-6 py-3 border-b"
          style={{ background: "hsl(229, 48%, 8%)", borderColor: "hsl(229, 42%, 20%)" }}
        >
          <div className="flex items-center gap-4">
            <div>
              <h1 className="font-bold text-sm" style={{ color: "#FFFFFF" }}>Smart LED Mood Lamp</h1>
              <p className="text-xs" style={{ color: "hsl(226, 35%, 72%)" }}>
                Step 1 of 4 • Auto-save in {autoSaveCountdown}s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={loadErrorCode} className="btn-neon-outline-teal px-3 py-1.5 text-xs flex items-center gap-1.5">
              <Bug size={12} /> Load Error Code
            </button>
            <button onClick={resetCode} className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all hover:scale-105" style={{ background: "rgba(255,69,0,0.15)", color: "#FF4500", border: "1px solid rgba(255,69,0,0.3)" }}>
              <RefreshCw size={12} /> Reset
            </button>
            <button
              onClick={runAndCheck}
              disabled={runStep === "compiling" || runStep === "simulating" || runStep === "safety"}
              className="btn-neon-green px-5 py-2 text-sm font-bold flex items-center gap-2 disabled:opacity-60"
            >
              {runStep === "compiling" && <><Loader2 size={14} className="animate-spin" /> Compiling...</>}
              {runStep === "simulating" && <><Loader2 size={14} className="animate-spin" /> Simulating...</>}
              {runStep === "safety" && <><Loader2 size={14} className="animate-spin" /> Safety Check...</>}
              {(runStep === "idle" || runStep === "success" || runStep === "error") && <><Play size={14} /> ▶ Run &amp; Check</>}
            </button>
          </div>
        </div>

        {/* Run workflow indicator */}
        {runStep !== "idle" && (
          <div
            className="px-6 py-3 border-b flex items-center gap-6"
            style={{ background: "hsl(229, 45%, 14%)", borderColor: "hsl(229, 42%, 20%)" }}
          >
            {(["compiling", "simulating", "safety", "success", "error"] as RunStep[]).map((step, i) => {
              const labels = ["Compiling", "Simulating", "Safety Check", "", ""];
              const steps = ["compiling", "simulating", "safety"];
              const stepIdx = steps.indexOf(runStep);
              const thisIdx = steps.indexOf(step as string);
              const isDone = runStep === "success" || (thisIdx !== -1 && stepIdx > thisIdx);
              const isActive = step === runStep;
              const isError = runStep === "error" && step === "compiling";

              if (step === "success") {
                if (runStep !== "success") return null;
                return (
                  <div key={step} className="flex items-center gap-2 animate-fade-in-up">
                    <CheckCircle size={18} style={{ color: "#00FF88" }} />
                    <span className="font-bold text-sm" style={{ color: "#00FF88" }}>✓ Task Complete! +75 XP Awarded</span>
                  </div>
                );
              }
              if (step === "error") {
                if (runStep !== "error") return null;
                return (
                  <div key={step} className="flex items-center gap-2 animate-fade-in-up">
                    <XCircle size={18} style={{ color: "#FF4500" }} />
                    <span className="font-bold text-sm" style={{ color: "#FF4500" }}>{errors.length} Error{errors.length !== 1 ? "s" : ""} Found</span>
                    <button onClick={debugWithAI} className="ml-2 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1" style={{ background: "rgba(183,68,255,0.2)", color: "#B744FF", border: "1px solid rgba(183,68,255,0.4)" }}>
                      <Brain size={12} /> Debug with AI
                    </button>
                  </div>
                );
              }

              if (!steps.includes(step as string)) return null;

              return (
                <div key={step} className="flex items-center gap-2">
                  {isDone ? (
                    <CheckCircle size={16} style={{ color: "#00FF88" }} />
                  ) : isActive ? (
                    <Loader2 size={16} className="animate-spin" style={{ color: "#00F5FF" }} />
                  ) : (
                    <div className="w-4 h-4 rounded-full border" style={{ borderColor: "hsl(226, 35%, 72%)" }} />
                  )}
                  <span
                    className="text-sm font-medium"
                    style={{ color: isDone ? "#00FF88" : isActive ? "#00F5FF" : "hsl(226, 35%, 72%)" }}
                  >
                    {labels[i]}
                  </span>
                  {i < 2 && <span style={{ color: "hsl(226, 35%, 72%)" }}>→</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Main area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col">
            <div
              className="flex items-center gap-2 px-4 py-2 border-b text-xs font-mono"
              style={{ background: "hsl(229, 48%, 8%)", borderColor: "hsl(229, 42%, 20%)", color: "hsl(226, 35%, 72%)" }}
            >
              <span style={{ color: "#00F5FF" }}>sketch.ino</span>
              <span>•</span>
              <span>Arduino Uno</span>
            </div>
            <div className="relative flex-1">
              <textarea
                ref={codeRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="code-editor w-full h-full p-4 text-sm resize-none focus:outline-none"
                style={{ fontFamily: "'JetBrains Mono', monospace", lineHeight: "1.7", fontSize: "13px" }}
                spellCheck={false}
              />
            </div>

            {/* Error panel */}
            {errors.length > 0 && (
              <div
                className="border-t p-4"
                style={{ background: "rgba(255,69,0,0.08)", borderColor: "rgba(255,69,0,0.3)" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} style={{ color: "#FF4500" }} />
                  <span className="font-bold text-sm" style={{ color: "#FF4500" }}>Compilation Errors</span>
                </div>
                <div className="space-y-2">
                  {errors.map((err, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm font-mono p-2 rounded-lg"
                      style={{ background: "rgba(255,69,0,0.1)", color: "#FF6B35" }}
                    >
                      <XCircle size={14} className="flex-shrink-0 mt-0.5" />
                      {err}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Debug Panel */}
          {showDebug && (
            <div
              className="w-80 flex flex-col border-l"
              style={{ background: "hsl(229, 45%, 14%)", borderColor: "hsl(229, 42%, 20%)" }}
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "hsl(229, 42%, 20%)" }}>
                <Brain size={16} style={{ color: "#B744FF" }} />
                <span className="font-bold text-sm" style={{ color: "#FFFFFF" }}>AI Debug Assistant</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {debugMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl text-sm ${msg.role === "ai" ? "" : "ml-4"}`}
                    style={{
                      background: msg.role === "ai" ? "rgba(183,68,255,0.1)" : "rgba(0,245,255,0.1)",
                      border: `1px solid ${msg.role === "ai" ? "rgba(183,68,255,0.3)" : "rgba(0,245,255,0.3)"}`,
                      color: msg.role === "ai" ? "#E0E7FF" : "#00F5FF",
                    }}
                  >
                    {msg.role === "ai" && <span className="text-xs font-bold block mb-1" style={{ color: "#B744FF" }}>🧠 AI Assistant</span>}
                    {msg.content}
                  </div>
                ))}
              </div>

              <div className="p-4 border-t space-y-2" style={{ borderColor: "hsl(229, 42%, 20%)" }}>
                <button onClick={askNextHint} className="btn-neon-outline-teal w-full py-2 text-sm font-semibold flex items-center justify-center gap-2">
                  <Zap size={14} /> Get Next Hint
                </button>
                <p className="text-xs text-center" style={{ color: "hsl(226, 35%, 72%)" }}>
                  AI gives hints, not answers 🎓
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
