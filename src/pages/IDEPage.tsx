import { useState, useRef, useEffect } from "react";
import { Play, AlertTriangle, CheckCircle, XCircle, Brain, Loader2, Zap, Bug, RefreshCw, ChevronRight, BookOpen, Circle } from "lucide-react";
import Layout from "@/components/Layout";

type RunStep = "idle" | "compiling" | "simulating" | "safety" | "success" | "error";

const starterCode = `/*
  🎯 Project: Smart LED Mood Lamp
  
  Goal: Control LED brightness based on ambient light.
  
  📦 Components: LED (pin 9), Photoresistor (A0)
  
  🧩 Hints:
     1. Use pinMode() to set LED_PIN as OUTPUT
     2. Use analogRead() to get light sensor value (0-1023)
     3. Use map() to convert sensor range to LED brightness (0-255)
     4. Use analogWrite() to set LED brightness
     5. Add Serial.print() to debug your values
  
  💡 Try writing it yourself first!
     Use "Debug with AI" if you get stuck.
*/

const int LED_PIN = 9;
const int SENSOR_PIN = A0;

void setup() {
  // TODO: Set LED_PIN as OUTPUT
  // TODO: Start Serial at 9600 baud
}

void loop() {
  // TODO: Read the sensor value with analogRead()
  // TODO: Map sensor value (0-1023) to brightness (0-255)
  //       Hint: brighter room = dimmer LED, so invert the range
  // TODO: Write brightness to LED with analogWrite()
  // TODO: Print values to Serial for debugging
  
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

const projectSteps = [
  {
    id: 1, title: "Gather Components", done: true,
    instructions: [
      "Get an Arduino Uno and USB cable",
      "Find a photoresistor (LDR) and LED",
      "Grab two 220Ω resistors",
      "Get a breadboard and jumper wires",
    ],
  },
  {
    id: 2, title: "Wire the Circuit", done: true,
    instructions: [
      "Connect LED anode (long leg) → 220Ω resistor → Pin 9",
      "Connect LED cathode (short leg) → GND",
      "Connect LDR between 5V and A0",
      "Connect 10kΩ resistor between A0 and GND",
    ],
  },
  {
    id: 3, title: "Write the Code", done: false, active: true,
    instructions: [
      "Open the code editor on the left",
      "Read the code — note the map() function",
      "Understand how analogRead() works (returns 0-1023)",
      "See how we map sensor to LED brightness",
    ],
  },
  {
    id: 4, title: "Run & Verify", done: false,
    instructions: [
      "Click '▶ Run & Check' button",
      "Watch the compilation and simulation steps",
      "If errors appear, use 'Debug with AI'",
      "Success = +75 XP!",
    ],
  },
];

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
  const [code, setCode] = useState(starterCode);
  const [runStep, setRunStep] = useState<RunStep>("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [debugMessages, setDebugMessages] = useState<DebugMessage[]>([]);
  const [hintIndex, setHintIndex] = useState(0);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [autoSaveCountdown, setAutoSaveCountdown] = useState(30);
  const [activeStep, setActiveStep] = useState(3);
  const codeRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoSaveCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const runAndCheck = async () => {
    setErrors([]);
    setXpAwarded(false);

    setRunStep("compiling");
    await delay(1200);

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

    setRunStep("simulating");
    await delay(1500);
    setRunStep("safety");
    await delay(1000);
    setRunStep("success");
    setXpAwarded(true);
  };

  const debugWithAI = () => {
    setShowDebug(true);
    if (debugMessages.length === 0) {
      setDebugMessages([
        { role: "ai", content: "🧠 I can see your code and the errors. Let me help you think through this. " + aiHints[0] },
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
    setCode(starterCode);
    setRunStep("idle");
    setErrors([]);
    setXpAwarded(false);
    setShowDebug(false);
  };

  return (
    <Layout>
      <div className="flex flex-col" style={{ height: "calc(100vh - 48px)" }}>
        {/* Top Bar */}
        <div
          className="flex items-center justify-between px-6 py-2.5 border-b flex-shrink-0"
          style={{ background: "hsl(232, 48%, 6%)", borderColor: "hsl(232, 40%, 16%)" }}
        >
          <div>
            <h1 className="font-bold text-sm" style={{ color: "#FFFFFF" }}>Smart LED Mood Lamp</h1>
            <p className="text-xs" style={{ color: "hsl(228, 25%, 60%)" }}>
              Step {activeStep} of {projectSteps.length} • Auto-save in {autoSaveCountdown}s
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={loadErrorCode} className="btn-neon-outline-teal px-2.5 py-1.5 text-xs flex items-center gap-1.5">
              <Bug size={11} /> Load Errors
            </button>
            <button onClick={resetCode} className="px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all hover:scale-105" style={{ background: "rgba(255,69,0,0.15)", color: "#FF4500", border: "1px solid rgba(255,69,0,0.3)" }}>
              <RefreshCw size={11} /> Reset
            </button>
            <button
              onClick={runAndCheck}
              disabled={runStep === "compiling" || runStep === "simulating" || runStep === "safety"}
              className="btn-neon-green px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 disabled:opacity-60"
            >
              {runStep === "compiling" && <><Loader2 size={12} className="animate-spin" /> Compiling...</>}
              {runStep === "simulating" && <><Loader2 size={12} className="animate-spin" /> Simulating...</>}
              {runStep === "safety" && <><Loader2 size={12} className="animate-spin" /> Safety Check...</>}
              {(runStep === "idle" || runStep === "success" || runStep === "error") && <><Play size={12} /> Run &amp; Check</>}
            </button>
          </div>
        </div>

        {/* Run workflow indicator */}
        {runStep !== "idle" && (
          <div
            className="px-4 py-2 border-b flex items-center gap-4 flex-shrink-0"
            style={{ background: "hsl(232, 42%, 11%)", borderColor: "hsl(232, 40%, 16%)" }}
          >
            {(["compiling", "simulating", "safety"] as RunStep[]).map((step, i) => {
              const labels = ["Compiling", "Simulating", "Safety Check"];
              const stepOrder = ["compiling", "simulating", "safety"];
              const stepIdx = stepOrder.indexOf(runStep);
              const thisIdx = stepOrder.indexOf(step);
              const isDone = runStep === "success" || stepIdx > thisIdx;
              const isActive = step === runStep;

              return (
                <div key={step} className="flex items-center gap-2">
                  {isDone ? (
                    <CheckCircle size={16} style={{ color: "#00FF88" }} />
                  ) : isActive ? (
                    <Loader2 size={16} className="animate-spin" style={{ color: "#00F5FF" }} />
                  ) : (
                    <Circle size={16} style={{ color: "hsl(228, 25%, 40%)" }} />
                  )}
                  <span className="text-sm font-medium" style={{ color: isDone ? "#00FF88" : isActive ? "#00F5FF" : "hsl(228, 25%, 50%)" }}>
                    {labels[i]}
                  </span>
                  {i < 2 && <ChevronRight size={14} style={{ color: "hsl(228, 25%, 40%)" }} />}
                </div>
              );
            })}
            {runStep === "success" && (
              <div className="flex items-center gap-2 animate-fade-in-up ml-2">
                <CheckCircle size={18} style={{ color: "#00FF88" }} />
                <span className="font-bold text-sm" style={{ color: "#00FF88" }}>✓ Task Complete! +75 XP Awarded</span>
              </div>
            )}
            {runStep === "error" && (
              <div className="flex items-center gap-2 animate-fade-in-up ml-2">
                <XCircle size={18} style={{ color: "#FF4500" }} />
                <span className="font-bold text-sm" style={{ color: "#FF4500" }}>{errors.length} Error{errors.length !== 1 ? "s" : ""} Found</span>
                <button onClick={debugWithAI} className="ml-2 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1" style={{ background: "rgba(183,68,255,0.2)", color: "#B744FF", border: "1px solid rgba(183,68,255,0.4)" }}>
                  <Brain size={12} /> Debug with AI
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Instructions Panel */}
          <div
            className="w-56 flex-shrink-0 border-r flex flex-col overflow-y-auto"
            style={{ background: "hsl(232, 42%, 11%)", borderColor: "hsl(232, 40%, 16%)" }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "hsl(232, 40%, 16%)" }}>
              <BookOpen size={15} style={{ color: "#B744FF" }} />
              <span className="font-bold text-sm" style={{ color: "#FFFFFF" }}>Instructions</span>
            </div>
            <div className="p-3 space-y-2">
              {projectSteps.map((step) => (
                <div
                  key={step.id}
                  className="rounded-xl overflow-hidden border cursor-pointer transition-all duration-200"
                  style={{
                    borderColor: step.id === activeStep
                      ? "rgba(0,245,255,0.4)"
                      : step.done
                      ? "rgba(0,255,136,0.2)"
                      : "hsl(232, 38%, 20%)",
                    background: step.id === activeStep
                      ? "rgba(0,245,255,0.06)"
                      : "transparent",
                  }}
                  onClick={() => setActiveStep(step.id)}
                >
                  <div className="flex items-center gap-2.5 px-3 py-2.5">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={
                        step.done
                          ? { background: "#00FF88", color: "#0A0E27" }
                          : step.id === activeStep
                          ? { background: "#00F5FF", color: "#0A0E27" }
                          : { background: "hsl(232, 40%, 22%)", color: "hsl(228, 25%, 60%)" }
                      }
                    >
                      {step.done ? "✓" : step.id}
                    </div>
                    <span className="text-xs font-semibold" style={{ color: step.done ? "#00FF88" : step.id === activeStep ? "#FFFFFF" : "hsl(228, 25%, 60%)" }}>
                      {step.title}
                    </span>
                  </div>

                  {step.id === activeStep && (
                    <div className="px-3 pb-3 animate-fade-in">
                      <ul className="space-y-1.5">
                        {step.instructions.map((inst, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "hsl(228, 30%, 70%)" }}>
                            <span className="mt-0.5 flex-shrink-0" style={{ color: "#00F5FF" }}>→</span>
                            <span>{inst}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div
              className="flex items-center gap-2 px-4 py-2 border-b text-xs font-mono flex-shrink-0"
              style={{ background: "hsl(232, 48%, 6%)", borderColor: "hsl(232, 40%, 16%)", color: "hsl(228, 25%, 60%)" }}
            >
              <span style={{ color: "#00F5FF" }}>sketch.ino</span>
              <span>•</span>
              <span>Arduino Uno</span>
              <span className="ml-auto text-xs" style={{ color: "#00FF88" }}>✎ Editable</span>
            </div>
            <div className="relative flex-1 flex overflow-hidden">
              {/* Line Numbers */}
              <div
                className="flex-shrink-0 select-none text-right pr-3 pt-4 pb-4 overflow-hidden"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "13px",
                  lineHeight: "1.7",
                  color: "hsl(228, 25%, 35%)",
                  background: "hsl(229, 48%, 7%)",
                  borderRight: "1px solid hsl(232, 38%, 18%)",
                  width: "48px",
                  minWidth: "48px",
                }}
                ref={(el) => {
                  if (el && codeRef.current) {
                    const sync = () => { el.scrollTop = codeRef.current!.scrollTop; };
                    codeRef.current.addEventListener("scroll", sync);
                  }
                }}
              >
                {code.split("\n").map((_, i) => (
                  <div key={i} className="px-1" style={{ height: "calc(13px * 1.7)" }}>
                    {i + 1}
                  </div>
                ))}
              </div>
              <textarea
                ref={codeRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="code-editor w-full h-full p-4 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[hsl(182,100%,50%)]"
                style={{ fontFamily: "'JetBrains Mono', monospace", lineHeight: "1.7", fontSize: "13px", caretColor: "#00F5FF", border: "none", borderRadius: 0 }}
                spellCheck={false}
              />
            </div>

            {/* Error panel */}
            {errors.length > 0 && (
              <div className="border-t p-4 flex-shrink-0 animate-fade-in" style={{ background: "rgba(255,69,0,0.08)", borderColor: "rgba(255,69,0,0.3)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} style={{ color: "#FF4500" }} />
                  <span className="font-bold text-sm" style={{ color: "#FF4500" }}>Compilation Errors</span>
                </div>
                <div className="space-y-2">
                  {errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm font-mono p-2 rounded-lg" style={{ background: "rgba(255,69,0,0.1)", color: "#FF6B35" }}>
                      <XCircle size={14} className="flex-shrink-0 mt-0.5" />
                      {err}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Wokwi Simulator Panel */}
          <div
            className="w-72 flex-shrink-0 border-l flex flex-col"
            style={{ background: "hsl(232, 42%, 11%)", borderColor: "hsl(232, 40%, 16%)" }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "hsl(232, 40%, 16%)" }}>
              <Play size={14} style={{ color: "#00FF88" }} />
              <span className="font-bold text-sm" style={{ color: "#FFFFFF" }}>Simulator</span>
            </div>
            <div className="flex-1 relative">
              <iframe
                src="https://wokwi.com/projects/new/arduino-uno"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                style={{ border: "none" }}
                title="Wokwi Simulator"
              />
            </div>
          </div>

          {/* AI Debug Panel */}
          {showDebug && (
            <div className="w-64 flex flex-col border-l flex-shrink-0 animate-slide-in-right" style={{ background: "hsl(232, 42%, 11%)", borderColor: "hsl(232, 40%, 16%)" }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "hsl(232, 40%, 16%)" }}>
                <Brain size={16} style={{ color: "#B744FF" }} />
                <span className="font-bold text-sm" style={{ color: "#FFFFFF" }}>AI Debug Assistant</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {debugMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl text-sm ${msg.role === "user" ? "ml-4" : ""}`}
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

              <div className="p-4 border-t space-y-2" style={{ borderColor: "hsl(232, 40%, 16%)" }}>
                <button onClick={askNextHint} className="btn-neon-outline-teal w-full py-2 text-sm font-semibold flex items-center justify-center gap-2">
                  <Zap size={14} /> Get Next Hint
                </button>
                <p className="text-xs text-center" style={{ color: "hsl(228, 25%, 60%)" }}>
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
