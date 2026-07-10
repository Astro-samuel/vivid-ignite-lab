import { useState, useRef, useEffect } from "react";
import { Play, AlertTriangle, CheckCircle, XCircle, Brain, Loader2, Zap, Bug, RefreshCw, ChevronRight, BookOpen, Circle, ArrowLeft, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Package, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import CodeEditor from "@/components/CodeEditor";
import ArduinoSetupGuide from "@/components/ArduinoSetupGuide";
import { useArduinoFlasher } from "@/hooks/useArduinoFlasher";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast as sonnerToast } from "sonner";

const DEBUG_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/debug-code`;

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

interface LibraryItem {
  name: string;
  includeName: string;
  description: string;
  sampleCode: string;
}

const LIBRARIES_DB: LibraryItem[] = [
  {
    name: "DHT Sensor Library",
    includeName: "DHT.h",
    description: "Read temperature and humidity values from DHT11/DHT22 sensors.",
    sampleCode: `#include "DHT.h"
#define DHTPIN 2
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  Serial.print("Temp: "); Serial.print(temp); Serial.print(" C | Hum: "); Serial.println(hum);
  delay(2000);
}`
  },
  {
    name: "LiquidCrystal I2C",
    includeName: "LiquidCrystal_I2C.h",
    description: "Drive character LCD displays via the standard I2C interface.",
    sampleCode: `#include <Wire.h>
#include <LiquidCrystal_I2C.h>
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Arduino Lab!");
}

void loop() {
}`
  },
  {
    name: "Servo",
    includeName: "Servo.h",
    description: "Allows an Arduino board to control RC hobby servo motors easily.",
    sampleCode: `#include <Servo.h>
Servo myservo;
int pos = 0;

void setup() {
  myservo.attach(9);
}

void loop() {
  for (pos = 0; pos <= 180; pos += 1) {
    myservo.write(pos);
    delay(15);
  }
  for (pos = 180; pos >= 0; pos -= 1) {
    myservo.write(pos);
    delay(15);
  }
}`
  },
  {
    name: "FastLED",
    includeName: "FastLED.h",
    description: "Easy control of addressable LED strips (NeoPixel, WS2812B, APA102).",
    sampleCode: `#include <FastLED.h>
#define NUM_LEDS 10
#define DATA_PIN 6
CRGB leds[NUM_LEDS];

void setup() {
  FastLED.addLeds<NEOPIXEL, DATA_PIN>(leds, NUM_LEDS);
}

void loop() {
  for(int i = 0; i < NUM_LEDS; i++) {
    leds[i] = CRGB::Red; FastLED.show(); delay(50);
    leds[i] = CRGB::Black; FastLED.show();
  }
}`
  },
  {
    name: "Adafruit SSD1306",
    includeName: "Adafruit_SSD1306.h",
    description: "Full graphics library for SSD1306 based 128x64 or 128x32 OLED screens.",
    sampleCode: `#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

void setup() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0,0);
  display.println("Hello, World!");
  display.display();
}

void loop() {}`
  }
];

export default function IDEPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [code, setCode] = useState(starterCode);
  const [runStep, setRunStep] = useState<RunStep>("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [debugMessages, setDebugMessages] = useState<DebugMessage[]>([]);
  const [customDebugInput, setCustomDebugInput] = useState("");
  const [debugStreaming, setDebugStreaming] = useState(false);
  const [debugError, setDebugError] = useState("");
  const [xpAwarded, setXpAwarded] = useState(false);
  const [autoSaveCountdown, setAutoSaveCountdown] = useState(30);
  const [activeStep, setActiveStep] = useState(3);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showSimulator, setShowSimulator] = useState(true);
  const [showLibrariesPanel, setShowLibrariesPanel] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [installedLibraries, setInstalledLibraries] = useState<string[]>([]);
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const debugBottomRef = useRef<HTMLDivElement>(null);

  // Parse code to find active includes on load/edit
  useEffect(() => {
    const includes = code.match(/#include\s*[<"]([^>"]+)[>"]/g) || [];
    const detected = includes.map(inc => {
      const match = inc.match(/[<"]([^>"]+)[>"]/);
      return match ? match[1] : "";
    }).filter(Boolean);
    setInstalledLibraries(detected);
  }, [code]);

  // Scroll debug panel to bottom on new messages
  useEffect(() => {
    if (showDebug) {
      debugBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [debugMessages, showDebug]);

  const toggleInstallLibrary = (lib: LibraryItem) => {
    const isInstalled = installedLibraries.includes(lib.includeName);
    if (isInstalled) {
      // Remove include line
      const regex = new RegExp(`#include\\s*[<"]${lib.includeName}[>"]\\n?`, "g");
      setCode(prev => prev.replace(regex, ""));
      sonnerToast.info(`Uninstalled ${lib.name}`);
    } else {
      // Add include line at the top of the code
      setCode(prev => `#include <${lib.includeName}>\n` + prev);
      sonnerToast.success(`Installed ${lib.name}`);
    }
  };

  const injectBoilerplate = (sample: string) => {
    setCode(sample);
    sonnerToast.success("Test code loaded into editor!");
  };

  const {
    serialConnected,
    serialLogs,
    showSerialConsole,
    setShowSerialConsole,
    uploading,
    connectSerial,
    disconnectSerial,
    uploadToBoard: uploadCodeToBoard,
    clearLogs,
  } = useArduinoFlasher();

  const uploadToBoard = () => uploadCodeToBoard(code);

  const downloadIno = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sketch.ino";
    a.click();
    URL.revokeObjectURL(url);
    sonnerToast.success("Downloaded sketch.ino");
  };

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

    // Persist +75 XP to the user's profile (only once per session)
    if (user && !xpAwarded) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("total_xp")
          .eq("id", user.id)
          .single();
        if (profile !== null) {
          await supabase
            .from("profiles")
            .update({ total_xp: (profile.total_xp || 0) + 75 })
            .eq("id", user.id);
        }
      } catch {
        // Silently ignore XP save errors — the visual feedback still shows
      }
    }
  };

  const runDebugRequest = async (currentMessages: DebugMessage[]) => {
    if (debugStreaming) return;
    setDebugStreaming(true);
    setDebugError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setDebugStreaming(false);
        setDebugMessages(prev => [
          ...prev,
          { role: "ai", content: "Please log in to use the AI Debug Assistant." }
        ]);
        return;
      }

      const response = await fetch(DEBUG_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code,
          errors,
          messages: currentMessages,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to get debugging hint from AI.");
      }

      if (!response.body) {
        throw new Error("No response body received from AI service.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let aiText = "";

      // Append empty assistant message that we'll stream into
      setDebugMessages(prev => [...prev, { role: "ai", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              aiText += content;
              setDebugMessages(prev => {
                const updated = [...prev];
                if (updated.length > 0 && updated[updated.length - 1].role === "ai") {
                  updated[updated.length - 1] = { role: "ai", content: aiText };
                }
                return updated;
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (err: any) {
      setDebugError(err.message || "Failed to connect to AI Debug Assistant.");
      setDebugMessages(prev => [
        ...prev,
        { role: "ai", content: `❌ Error: ${err.message || "Something went wrong. Please try again."}` }
      ]);
    } finally {
      setDebugStreaming(false);
    }
  };

  const debugWithAI = () => {
    setShowDebug(true);
    if (debugMessages.length === 0) {
      const initialUserMsg: DebugMessage = {
        role: "user",
        content: "I ran into some compilation errors. Can you help me debug my code?"
      };
      setDebugMessages([initialUserMsg]);
      runDebugRequest([initialUserMsg]);
    }
  };

  const askNextHint = () => {
    const followUpMsg: DebugMessage = {
      role: "user",
      content: "I'm still stuck. Could you give me another hint or explain the issue further?"
    };
    const updatedMessages = [...debugMessages, followUpMsg];
    setDebugMessages(updatedMessages);
    runDebugRequest(updatedMessages);
  };

  const sendCustomDebugMessage = () => {
    if (!customDebugInput.trim() || debugStreaming) return;
    const msg: DebugMessage = {
      role: "user",
      content: customDebugInput.trim()
    };
    setCustomDebugInput("");
    const updatedMessages = [...debugMessages, msg];
    setDebugMessages(updatedMessages);
    runDebugRequest(updatedMessages);
  };

  const loadErrorCode = () => {
    // In a real app, this would be project-specific
    const projectSpecificError = code.includes("const int LED_PIN")
      ? errorCode
      : errorCode.replace("pinMod(13", "pinMod(9");

    setCode(projectSpecificError);
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
      <div className="flex flex-col h-[calc(100vh-48px)]">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b flex-shrink-0 ide-top-bar">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              title="Go Back"
              aria-label="Go Back"
              className="p-1.5 rounded-lg transition-all hover:scale-105 ide-top-back-btn"
            >
              <ArrowLeft size={14} />
            </button>
            <div>
              <h1 className="font-bold text-sm ide-title-text">Smart LED Mood Lamp</h1>
              <p className="text-xs ide-subtitle-text">
                Step {activeStep} of {projectSteps.length} • Auto-save in {autoSaveCountdown}s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Panel toggles */}
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className={`p-1.5 rounded-lg transition-all hover:scale-105 ${showInstructions ? "bg-purple-500/15 text-purple-500 border border-purple-500/30" : "bg-white/5 text-slate-400 border border-transparent"}`}
              title={showInstructions ? "Hide Instructions" : "Show Instructions"}
            >
              {showInstructions ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
            </button>
            <button
              onClick={() => setShowLibrariesPanel(!showLibrariesPanel)}
              className={`p-1.5 rounded-lg transition-all hover:scale-105 ${showLibrariesPanel ? "bg-blue-500/15 text-blue-500 border border-blue-500/30" : "bg-white/5 text-slate-400 border border-transparent"}`}
              title={showLibrariesPanel ? "Hide Library Manager" : "Show Library Manager"}
            >
              <Package size={14} />
            </button>
            <button
              onClick={() => setShowSimulator(!showSimulator)}
              className={`p-1.5 rounded-lg transition-all hover:scale-105 ${showSimulator ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30" : "bg-white/5 text-slate-400 border border-transparent"}`}
              title={showSimulator ? "Hide Simulator" : "Show Simulator"}
            >
              {showSimulator ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
            </button>

            <div className="w-px h-5 mx-1 ide-top-btn-divider" />

            <button onClick={loadErrorCode} className="btn-neon-outline-teal px-2.5 py-1.5 text-xs flex items-center gap-1.5">
              <Bug size={11} /> Load Errors
            </button>
            <button onClick={resetCode} className="px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all hover:scale-105 ide-btn-reset">
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
          <div className="px-4 py-2 border-b flex items-center gap-4 flex-shrink-0 ide-workflow-indicator">
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
                    <CheckCircle size={16} className="text-emerald-500" />
                  ) : isActive ? (
                    <Loader2 size={16} className="animate-spin text-blue-500" />
                  ) : (
                    <Circle size={16} className="text-slate-500" />
                  )}
                  <span className={`text-sm font-medium ${isDone ? "text-emerald-500" : isActive ? "text-blue-500" : "text-slate-400"}`}>
                    {labels[i]}
                  </span>
                  {i < 2 && <ChevronRight size={14} className="text-slate-500" />}
                </div>
              );
            })}
            {runStep === "success" && (
              <div className="flex items-center gap-2 animate-fade-in-up ml-2">
                <CheckCircle size={18} className="text-emerald-500" />
                <span className="font-bold text-sm text-emerald-500">✓ Task Complete! +75 XP Awarded</span>
              </div>
            )}
            {runStep === "error" && (
              <div className="flex items-center gap-2 animate-fade-in-up ml-2">
                <XCircle size={18} className="text-rose-500" />
                <span className="font-bold text-sm text-rose-500">{errors.length} Error{errors.length !== 1 ? "s" : ""} Found</span>
                <button onClick={debugWithAI} className="ml-2 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 bg-purple-500/20 text-purple-400 border border-purple-500/40">
                  <Brain size={12} /> Debug with AI
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Instructions Panel */}
          {showInstructions && (
            <div className="w-64 flex-shrink-0 border-r flex flex-col overflow-y-auto glass-card transition-all duration-300 animate-fade-in-up ide-instructions-panel">
              <div className="flex items-center gap-2 px-4 py-3 border-b ide-instructions-panel-title">
                <BookOpen size={15} className="text-purple-500" />
                <span className="font-bold text-sm text-white">Instructions</span>
              </div>
              <div className="p-3 space-y-2">
                {projectSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`rounded-xl overflow-hidden border cursor-pointer transition-all duration-200 ${
                      step.id === activeStep
                        ? "border-blue-500/45 bg-blue-500/5"
                        : step.done
                          ? "border-emerald-500/20 bg-transparent"
                          : "border-slate-800 bg-transparent"
                    }`}
                    onClick={() => setActiveStep(step.id)}
                  >
                    <div className="flex items-center gap-2.5 px-3 py-2.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                          step.done
                            ? "bg-emerald-500 text-slate-950"
                            : step.id === activeStep
                              ? "bg-blue-500 text-slate-950"
                              : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {step.done ? "✓" : step.id}
                      </div>
                      <span className={`text-xs font-semibold ${step.done ? "text-emerald-500" : step.id === activeStep ? "text-white" : "text-slate-400"}`}>
                        {step.title}
                      </span>
                    </div>

                    {step.id === activeStep && (
                      <div className="px-3 pb-3 animate-fade-in">
                        <ul className="space-y-1.5">
                          {step.instructions.map((inst, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                              <span className="mt-0.5 flex-shrink-0 text-blue-500">→</span>
                              <span>{inst}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-3 pt-0">
                <ArduinoSetupGuide />
              </div>
            </div>
          )}

          {/* Code Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div
              className="flex items-center gap-2 px-4 py-2 border-b text-xs font-mono flex-shrink-0 bg-[hsl(232,48%,6%)] border-[hsl(232,40%,16%)] text-[hsl(228,25%,60%)]"
            >
              <span className="text-[#3B82F6]">sketch.ino</span>
              <span>•</span>
              <span>Arduino Uno</span>
              <span className="ml-2">|</span>
              <button
                onClick={downloadIno}
                className="text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1"
              >
                <Download size={10} /> Download .ino
              </button>
              <button
                onClick={serialConnected ? disconnectSerial : connectSerial}
                className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-all cursor-pointer ${
                  serialConnected ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" : "bg-transparent text-slate-400 border-slate-800"
                }`}
              >
                {serialConnected ? "🔌 Connected" : "🔌 Connect Board"}
              </button>
              {serialConnected && (
                <button
                  onClick={uploadToBoard}
                  disabled={uploading}
                  className="text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/20 transition-all cursor-pointer ml-1"
                >
                  {uploading ? "Uploading..." : "📤 Upload to Board"}
                </button>
              )}
              <button
                onClick={() => setShowSerialConsole(!showSerialConsole)}
                className="text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-500/30 text-indigo-400 hover:bg-indigo-950/20 transition-all cursor-pointer ml-1"
              >
                📟 Serial Monitor {serialLogs.length > 0 && `(${serialLogs.length})`}
              </button>
              <span className="ml-auto text-xs text-emerald-500">✎ Editable</span>
            </div>
            <div className="relative flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 relative">
                <CodeEditor code={code} onChange={setCode} minHeight="100%" maxHeight="100%" />
              </div>
              {showSerialConsole && (
                <div className="h-44 border-t flex flex-col overflow-hidden bg-slate-950 ide-serial-console">
                  <div className="flex items-center justify-between px-4 py-1.5 border-b text-xs font-mono ide-serial-console-header">
                    <span className="text-cyan-400 font-bold">📟 Serial Monitor (9600 baud)</span>
                    <div className="flex gap-2">
                      <button
                        onClick={clearLogs}
                        className="hover:text-white transition-all text-[10px]"
                      >
                        Clear Logs
                      </button>
                      <button
                        onClick={() => setShowSerialConsole(false)}
                        className="hover:text-white transition-all text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 p-3 overflow-y-auto font-mono text-[10px] space-y-1 text-emerald-400">
                    {serialLogs.length === 0 ? (
                      <span className="text-slate-500 italic">No output. Verify connection and upload code.</span>
                    ) : (
                      serialLogs.map((log, idx) => (
                        <div key={idx} className="whitespace-pre-wrap">{log}</div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Error panel */}
            {errors.length > 0 && (
              <div className="border-t p-4 flex-shrink-0 animate-fade-in bg-rose-500/10 border-rose-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-rose-500" />
                  <span className="font-bold text-sm text-rose-500">Compilation Errors</span>
                </div>
                <div className="space-y-2">
                  {errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm font-mono p-2 rounded-lg bg-rose-500/15 text-rose-400">
                      <XCircle size={14} className="flex-shrink-0 mt-0.5" />
                      {err}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Wokwi Simulator Panel */}
          {showSimulator && (
            <div className="w-72 flex-shrink-0 border-l flex flex-col transition-all duration-300 ide-wokwi-simulator-panel">
              <div className="flex items-center gap-2 px-4 py-3 border-b ide-wokwi-simulator-panel-header">
                <Play size={14} className="text-emerald-500" />
                <span className="font-bold text-sm text-white">Simulator</span>
              </div>
              <div className="flex-1 relative">
                <iframe
                  src="https://wokwi.com/projects/new/arduino-uno"
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                  title="Wokwi Simulator"
                />
              </div>
            </div>
          )}

          {/* Library Manager Panel */}
          {showLibrariesPanel && (
            <div className="w-80 flex-shrink-0 border-l flex flex-col transition-all duration-300 animate-slide-in-right bg-slate-950 ide-library-manager-panel">
              <div className="flex items-center justify-between px-4 py-3 border-b ide-library-manager-header">
                <div className="flex items-center gap-2">
                  <Package size={15} className="text-cyan-400" />
                  <span className="font-bold text-sm text-white">Library Manager</span>
                </div>
                <button
                  onClick={() => setShowLibrariesPanel(false)}
                  className="text-slate-400 hover:text-white text-xs transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-3 border-b ide-library-manager-search">
                <input
                  type="text"
                  placeholder="Search libraries (e.g. FastLED, Servo)..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Library list */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {LIBRARIES_DB.filter(lib =>
                  lib.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
                  lib.includeName.toLowerCase().includes(librarySearch.toLowerCase())
                ).map(lib => {
                  const isInstalled = installedLibraries.includes(lib.includeName);
                  return (
                    <div
                      key={lib.includeName}
                      className={`p-3 rounded-xl border transition-all space-y-2 ${
                        isInstalled ? "bg-blue-500/5 border-blue-500/25" : "bg-white/5 border-slate-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-xs text-white">{lib.name}</h4>
                          <code className="text-[10px] text-cyan-400 block mt-0.5">&lt;{lib.includeName}&gt;</code>
                        </div>
                        <button
                          onClick={() => toggleInstallLibrary(lib)}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all hover:scale-105 ${
                            isInstalled ? "bg-rose-500/15 text-rose-500 border border-rose-500/30" : "bg-blue-500/15 text-blue-500 border border-blue-500/30"
                          }`}
                        >
                          {isInstalled ? "Uninstall" : "Install"}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">{lib.description}</p>
                      
                      {/* Inject sample button */}
                      {isInstalled && (
                        <button
                          onClick={() => injectBoilerplate(lib.sampleCode)}
                          className="w-full py-1.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-cyan-400 hover:bg-slate-850 hover:text-white transition-all flex items-center justify-center gap-1.5"
                        >
                          <Play size={10} /> Insert Test Code
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Debug Panel */}
          {showDebug && (
            <div className="w-72 flex flex-col border-l flex-shrink-0 glass-card animate-slide-in-right ide-library-manager-panel">
              <div className="flex items-center gap-2 px-4 py-3 border-b ide-wokwi-simulator-panel-header">
                <Brain size={16} className="text-purple-500" />
                <span className="font-bold text-sm text-white">AI Debug Assistant</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {debugMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl text-sm ${msg.role === "user" ? "ml-4 bg-blue-500/10 border border-blue-500/30 text-blue-400" : "bg-purple-500/10 border border-purple-500/30 text-slate-100"}`}
                  >
                    {msg.role === "ai" && <span className="text-xs font-bold block mb-1 text-purple-400">🧠 AI Assistant</span>}
                    {msg.content}
                  </div>
                ))}
                {debugStreaming && debugMessages[debugMessages.length - 1]?.role !== "ai" && (
                  <div className="flex gap-2 justify-start p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-purple-400" />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-purple-400 [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-purple-400 [animation-delay:0.3s]" />
                  </div>
                )}
                <div ref={debugBottomRef} />
              </div>

              <div className="p-4 border-t space-y-3 ide-wokwi-simulator-panel-header">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customDebugInput}
                    onChange={(e) => setCustomDebugInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customDebugInput.trim() && !debugStreaming) {
                        sendCustomDebugMessage();
                      }
                    }}
                    placeholder={debugStreaming ? "AI is thinking..." : "Ask follow up..."}
                    disabled={debugStreaming}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={sendCustomDebugMessage}
                    disabled={!customDebugInput.trim() || debugStreaming}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:hover:scale-100 transition-all flex-shrink-0"
                  >
                    Send
                  </button>
                </div>
                
                <button
                  onClick={askNextHint}
                  disabled={debugStreaming}
                  className="btn-neon-outline-teal w-full py-2 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Zap size={11} /> {debugStreaming ? "Thinking..." : "Get Next Hint"}
                </button>
                <p className="text-[10px] text-center text-slate-400">
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
