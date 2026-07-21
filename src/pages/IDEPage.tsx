import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Play, AlertTriangle, CheckCircle, XCircle, Brain, Loader2, Zap, ChevronRight, BookOpen, Circle, ArrowLeft, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Package, Download, Save, FolderOpen, Trash2, Plus, Cpu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import CodeEditor from "@/components/CodeEditor";
import ArduinoSetupGuide from "@/components/ArduinoSetupGuide";
import PinoutModal from "@/components/PinoutModal";
import { useArduinoFlasher } from "@/hooks/useArduinoFlasher";
import { useIdeSketches, type IdeSketch } from "@/hooks/useIdeSketches";
import { compileSketch } from "@/lib/compileSketch";
import { BOARD_PROFILES } from "@/lib/stk500";
import { levelForXp } from "@/lib/xp";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast as sonnerToast } from "sonner";

const DEBUG_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/debug-code`;

type RunStep = "idle" | "compiling" | "simulating" | "safety" | "success" | "error";
type SaveState = "idle" | "saving" | "saved" | "unsaved" | "error";

const BOARD_LABELS: Record<string, string> = {
  "arduino:avr:uno": "Arduino Uno",
  "arduino:avr:nano": "Arduino Nano",
  "arduino:avr:mega": "Arduino Mega",
  "arduino:avr:leonardo": "Arduino Leonardo",
};

const BLANK_CODE = `void setup() {

}

void loop() {

}`;

interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  code: string;
}

const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: "blink",
    name: "Blink",
    description: "Toggle an LED on pin 13 every half second.",
    code: `const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
  delay(500);
}`,
  },
  {
    id: "sensor",
    name: "Read Sensor",
    description: "Read an analog sensor on A0 and print it to Serial.",
    code: `const int SENSOR_PIN = A0;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int value = analogRead(SENSOR_PIN);
  Serial.println(value);
  delay(200);
}`,
  },
  {
    id: "servo",
    name: "Servo Sweep",
    description: "Sweep a servo on pin 9 back and forth.",
    code: `#include <Servo.h>

Servo myServo;
int pos = 0;

void setup() {
  myServo.attach(9);
}

void loop() {
  for (pos = 0; pos <= 180; pos++) {
    myServo.write(pos);
    delay(15);
  }
  for (pos = 180; pos >= 0; pos--) {
    myServo.write(pos);
    delay(15);
  }
}`,
  },
];

interface DebugMessage {
  role: "ai" | "user";
  content: string;
}

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

void loop() {}`
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
  const { sketches, loading: sketchesLoading, createSketch, saveSketch, deleteSketch } = useIdeSketches();

  const [activeSketchId, setActiveSketchId] = useState<string | null>(null);
  const [sketchTitle, setSketchTitle] = useState("Untitled Sketch");
  const [fqbn, setFqbn] = useState("arduino:avr:uno");
  const [code, setCode] = useState(BLANK_CODE);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const [runStep, setRunStep] = useState<RunStep>("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [debugMessages, setDebugMessages] = useState<DebugMessage[]>([]);
  const [customDebugInput, setCustomDebugInput] = useState("");
  const [debugStreaming, setDebugStreaming] = useState(false);
  const [debugError, setDebugError] = useState("");
  const [xpAwarded, setXpAwarded] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showSimulator, setShowSimulator] = useState(true);
  const [showLibrariesPanel, setShowLibrariesPanel] = useState(false);
  const [showSketchesPanel, setShowSketchesPanel] = useState(false);
  const [showPinoutModal, setShowPinoutModal] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [installedLibraries, setInstalledLibraries] = useState<string[]>([]);
  const debugBottomRef = useRef<HTMLDivElement>(null);
  const skipAutosaveRef = useRef(true);

  // Check for transferred code from lessons or snippets
  useEffect(() => {
    const transferredCode = localStorage.getItem("activeIDECode");
    if (transferredCode) {
      setCode(transferredCode);
      localStorage.removeItem("activeIDECode");
      sonnerToast.success("Loaded sketch code into IDE!");
    }
  }, []);


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

  // Keyboard shortcuts (Ctrl+S / Cmd+S to save, Ctrl+Enter / Cmd+Enter to run)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveNow();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runAndCheck();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code, fqbn, sketchTitle, activeSketchId, user, saveState, runStep]);

  // Unsaved work loss protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveState === "unsaved") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveState]);

  // Debounced autosave: only for sketches that already have a saved row —
  // fresh/untitled work needs one explicit Save to create that row first.
  useEffect(() => {
    if (skipAutosaveRef.current) {
      skipAutosaveRef.current = false;
      return;
    }
    if (!activeSketchId) {
      setSaveState("unsaved");
      return;
    }
    setSaveState("saving");
    const timeout = setTimeout(async () => {
      const { error } = await saveSketch(activeSketchId, { title: sketchTitle, code, fqbn });
      setSaveState(error ? "error" : "saved");
    }, 1500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, fqbn, sketchTitle]);

  const toggleInstallLibrary = (lib: LibraryItem) => {
    const isInstalled = installedLibraries.includes(lib.includeName);
    if (isInstalled) {
      const regex = new RegExp(`#include\\s*[<"]${lib.includeName}[>"]\\n?`, "g");
      setCode(prev => prev.replace(regex, ""));
      sonnerToast.info(`Uninstalled ${lib.name}`);
    } else {
      setCode(prev => `#include <${lib.includeName}>\n` + prev);
      sonnerToast.success(`Installed ${lib.name}`);
    }
  };

  const injectBoilerplate = (sample: string) => {
    setCode(sample);
    sonnerToast.success("Test code loaded into editor!");
  };

  const loadTemplate = (tpl: StarterTemplate) => {
    setCode(tpl.code);
    sonnerToast.success(`${tpl.name} template loaded!`);
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

  const uploadToBoard = () => uploadCodeToBoard(code, fqbn);

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

  const newSketch = () => {
    skipAutosaveRef.current = true;
    setActiveSketchId(null);
    setSketchTitle("Untitled Sketch");
    setFqbn("arduino:avr:uno");
    setCode(BLANK_CODE);
    setRunStep("idle");
    setErrors([]);
    setXpAwarded(false);
    setShowDebug(false);
    setSaveState("idle");
    setShowSketchesPanel(false);
  };

  const loadSketch = (sketch: IdeSketch) => {
    skipAutosaveRef.current = true;
    setActiveSketchId(sketch.id);
    setSketchTitle(sketch.title);
    setFqbn(sketch.fqbn);
    setCode(sketch.code);
    setRunStep("idle");
    setErrors([]);
    setXpAwarded(false);
    setShowDebug(false);
    setSaveState("saved");
    setShowSketchesPanel(false);
  };

  const saveNow = async () => {
    if (!user) {
      sonnerToast.error("Log in to save your sketch.");
      return;
    }
    setSaveState("saving");
    if (activeSketchId) {
      const { error } = await saveSketch(activeSketchId, { title: sketchTitle, code, fqbn });
      setSaveState(error ? "error" : "saved");
      if (error) sonnerToast.error(error);
      else sonnerToast.success("Sketch saved!");
    } else {
      const { sketch, error } = await createSketch(sketchTitle, code, fqbn);
      if (error || !sketch) {
        setSaveState("error");
        sonnerToast.error(error || "Failed to save sketch.");
        return;
      }
      skipAutosaveRef.current = true;
      setActiveSketchId(sketch.id);
      setSaveState("saved");
      sonnerToast.success("Sketch saved!");
    }
  };

  const removeSketch = async (id: string) => {
    await deleteSketch(id);
    if (id === activeSketchId) newSketch();
    sonnerToast.info("Sketch deleted");
  };

  const runAndCheck = async () => {
    setErrors([]);
    setXpAwarded(false);
    setRunStep("compiling");

    const result = await compileSketch(code, fqbn);
    if (!result.ok) {
      const lines = result.log
        ? result.log.split("\n").filter(l => l.trim()).slice(0, 20)
        : [result.error || "Compilation failed."];
      setErrors(lines);
      setRunStep("error");
      return;
    }

    setRunStep("simulating");
    await delay(600);
    setRunStep("safety");
    await delay(500);
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
          const newXp = (profile.total_xp || 0) + 75;
          await supabase
            .from("profiles")
            .update({ total_xp: newXp, level: levelForXp(newXp) })
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

  const saveStateLabel: Record<SaveState, string> = {
    idle: "Not saved yet",
    saving: "Saving…",
    saved: "Saved",
    unsaved: "Unsaved changes",
    error: "Save failed",
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
              <input
                value={sketchTitle}
                onChange={(e) => setSketchTitle(e.target.value)}
                aria-label="Sketch title"
                className="font-bold text-sm bg-transparent border-none outline-none focus:underline ide-title-text w-44"
              />
              <p className="text-xs ide-subtitle-text">
                {BOARD_LABELS[fqbn]} • {saveStateLabel[saveState]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Panel toggles */}
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              aria-label="Toggle Instructions"
              className={`p-1.5 rounded-lg transition-all hover:scale-105 ${showInstructions ? "bg-primary/15 text-primary border border-primary/30" : "bg-muted/50 text-muted-foreground border border-transparent"}`}
              title={showInstructions ? "Hide Instructions" : "Show Instructions"}
            >
              {showInstructions ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
            </button>
            <button
              onClick={() => setShowLibrariesPanel(!showLibrariesPanel)}
              aria-label="Toggle Library Manager"
              className={`p-1.5 rounded-lg transition-all hover:scale-105 ${showLibrariesPanel ? "bg-primary/15 text-primary border border-primary/30" : "bg-muted/50 text-muted-foreground border border-transparent"}`}
              title={showLibrariesPanel ? "Hide Library Manager" : "Show Library Manager"}
            >
              <Package size={14} />
            </button>
            <button
              onClick={() => setShowSketchesPanel(!showSketchesPanel)}
              aria-label="Toggle My Sketches"
              className={`p-1.5 rounded-lg transition-all hover:scale-105 ${showSketchesPanel ? "bg-primary/15 text-primary border border-primary/30" : "bg-muted/50 text-muted-foreground border border-transparent"}`}
              title={showSketchesPanel ? "Hide My Sketches" : "Show My Sketches"}
            >
              <FolderOpen size={14} />
            </button>
            <button
              onClick={() => setShowSimulator(!showSimulator)}
              aria-label="Toggle Simulator"
              className={`p-1.5 rounded-lg transition-all hover:scale-105 ${showSimulator ? "bg-primary/15 text-primary border border-primary/30" : "bg-muted/50 text-muted-foreground border border-transparent"}`}
              title={showSimulator ? "Hide Simulator" : "Show Simulator"}
            >
              {showSimulator ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
            </button>
            <button
              onClick={() => setShowPinoutModal(true)}
              aria-label="Open Pin Reference Guide"
              className="p-1.5 rounded-lg transition-all hover:scale-105 bg-muted/50 text-muted-foreground hover:text-foreground border border-transparent flex items-center gap-1 text-xs font-semibold"
              title="Pinout Guide"
            >
              <Cpu size={14} className="text-primary" /> Pinout Guide
            </button>

            <div className="w-px h-5 mx-1 ide-top-btn-divider" />

            <button onClick={newSketch} aria-label="Create new sketch" className="px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all hover:scale-105 ide-btn-reset">
              <Plus size={11} /> New
            </button>
            <button onClick={saveNow} aria-label="Save sketch" disabled={saveState === "saving"} className="rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-all px-2.5 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-60">
              <Save size={11} /> {saveState === "saving" ? "Saving..." : "Save"}
            </button>
            <button
              onClick={runAndCheck}
              aria-label="Run and check code"
              disabled={runStep === "compiling" || runStep === "simulating" || runStep === "safety"}
              className="rounded-lg bg-primary text-primary-foreground hover:bg-primary-dark px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-60"
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
                    <CheckCircle size={16} className="text-success" />
                  ) : isActive ? (
                    <Loader2 size={16} className="animate-spin text-primary" />
                  ) : (
                    <Circle size={16} className="text-muted-foreground" />
                  )}
                  <span className={`text-sm font-medium ${isDone ? "text-success" : isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {labels[i]}
                  </span>
                  {i < 2 && <ChevronRight size={14} className="text-muted-foreground" />}
                </div>
              );
            })}
            {runStep === "success" && (
              <div className="flex items-center gap-2 animate-fade-in-up ml-2">
                <CheckCircle size={18} className="text-success" />
                <span className="font-bold text-sm text-success">✓ Task Complete! +75 XP Awarded</span>
              </div>
            )}
            {runStep === "error" && (
              <div className="flex items-center gap-2 animate-fade-in-up ml-2">
                <XCircle size={18} className="text-destructive" />
                <span className="font-bold text-sm text-destructive">{errors.length} Error{errors.length !== 1 ? "s" : ""} Found</span>
                <button onClick={debugWithAI} className="ml-2 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 bg-brand-purple/20 text-brand-purple border border-brand-purple/40">
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
                <BookOpen size={15} className="text-muted-foreground" />
                <span className="font-bold text-sm text-foreground">Start Building</span>
              </div>
              <div className="p-3 space-y-2">
                <p className="text-xs text-muted-foreground px-1 pb-1">
                  Blank sketch by default — or drop in a starter template:
                </p>
                {STARTER_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => loadTemplate(tpl)}
                    className="w-full text-left rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all p-3"
                  >
                    <span className="text-xs font-semibold text-foreground block">{tpl.name}</span>
                    <span className="text-[11px] text-muted-foreground">{tpl.description}</span>
                  </button>
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
              <span className="text-primary">sketch.ino</span>
              <span>•</span>
              <select
                value={fqbn}
                onChange={(e) => setFqbn(e.target.value)}
                aria-label="Board"
                className="bg-transparent border-none text-[hsl(228,25%,60%)] text-xs focus:outline-none cursor-pointer"
              >
                {Object.keys(BOARD_PROFILES).map((key) => (
                  <option key={key} value={key} className="bg-slate-900 text-white">{BOARD_LABELS[key] ?? key}</option>
                ))}
              </select>
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
                  serialConnected ? "bg-success/15 text-success border-success/30" : "bg-transparent text-muted-foreground border-border"
                }`}
              >
                {serialConnected ? "🔌 Connected" : "🔌 Connect Board"}
              </button>
              {serialConnected && (
                <button
                  onClick={uploadToBoard}
                  disabled={uploading}
                  className="text-[10px] font-bold px-2 py-0.5 rounded border border-border text-muted-foreground hover:bg-muted transition-all cursor-pointer ml-1"
                >
                  {uploading ? "Uploading..." : "📤 Upload to Board"}
                </button>
              )}
              <button
                onClick={() => setShowSerialConsole(!showSerialConsole)}
                className="text-[10px] font-bold px-2 py-0.5 rounded border border-border text-muted-foreground hover:bg-muted transition-all cursor-pointer ml-1"
              >
                📟 Serial Monitor {serialLogs.length > 0 && `(${serialLogs.length})`}
              </button>
              <span className="ml-auto text-xs text-success">✎ Editable</span>
            </div>
            <div className="relative flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 relative">
                <CodeEditor code={code} onChange={setCode} minHeight="100%" maxHeight="100%" />
              </div>
              {showSerialConsole && (
                <div className="h-44 border-t flex flex-col overflow-hidden bg-slate-950 ide-serial-console">
                  <div className="flex items-center justify-between px-4 py-1.5 border-b text-xs font-mono ide-serial-console-header">
                    <span className="text-foreground font-bold">📟 Serial Monitor (9600 baud)</span>
                    <div className="flex gap-2">
                      <button
                        onClick={clearLogs}
                        className="hover:text-foreground transition-all text-[10px]"
                      >
                        Clear Logs
                      </button>
                      <button
                        onClick={() => setShowSerialConsole(false)}
                        className="hover:text-foreground transition-all text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 p-3 overflow-y-auto font-mono text-[10px] space-y-1 text-success">
                    {serialLogs.length === 0 ? (
                      <span className="text-muted-foreground italic">No output. Verify connection and upload code.</span>
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
              <div className="border-t p-4 flex-shrink-0 animate-fade-in bg-destructive/10 border-destructive/30">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-destructive" />
                  <span className="font-bold text-sm text-destructive">Compilation Errors</span>
                </div>
                <div className="space-y-2">
                  {errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm font-mono p-2 rounded-lg bg-destructive/15 text-destructive">
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
                <Play size={14} className="text-muted-foreground" />
                <span className="font-bold text-sm text-foreground">Simulator</span>
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

          {/* My Sketches Panel */}
          {showSketchesPanel && (
            <div className="w-80 flex-shrink-0 border-l flex flex-col transition-all duration-300 animate-slide-in-right bg-slate-950 ide-library-manager-panel">
              <div className="flex items-center justify-between px-4 py-3 border-b ide-library-manager-header">
                <div className="flex items-center gap-2">
                  <FolderOpen size={15} className="text-muted-foreground" />
                  <span className="font-bold text-sm text-foreground">My Sketches</span>
                </div>
                <button
                  onClick={() => setShowSketchesPanel(false)}
                  className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 border-b ide-library-manager-search">
                <button
                  onClick={newSketch}
                  className="w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 transition-all"
                >
                  <Plus size={12} /> New Sketch
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {sketchesLoading ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Loading...</p>
                ) : sketches.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No saved sketches yet — hit Save to keep this one.</p>
                ) : (
                  sketches.map((s) => (
                    <div
                      key={s.id}
                      className={`p-3 rounded-xl border transition-all ${
                        s.id === activeSketchId ? "bg-primary/5 border-primary/25" : "bg-muted/30 border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button onClick={() => loadSketch(s)} className="text-left flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-foreground truncate">{s.title}</h4>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{formatDistanceToNow(new Date(s.updated_at), { addSuffix: true })}</p>
                        </button>
                        <button
                          onClick={() => removeSketch(s.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                          title="Delete sketch"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Library Manager Panel */}
          {showLibrariesPanel && (
            <div className="w-80 flex-shrink-0 border-l flex flex-col transition-all duration-300 animate-slide-in-right bg-slate-950 ide-library-manager-panel">
              <div className="flex items-center justify-between px-4 py-3 border-b ide-library-manager-header">
                <div className="flex items-center gap-2">
                  <Package size={15} className="text-muted-foreground" />
                  <span className="font-bold text-sm text-foreground">Library Manager</span>
                </div>
                <button
                  onClick={() => setShowLibrariesPanel(false)}
                  className="text-muted-foreground hover:text-foreground text-xs transition-colors"
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
                  className="w-full px-3 py-1.5 rounded-lg text-xs bg-muted border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
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
                        isInstalled ? "bg-success/5 border-success/25" : "bg-muted/30 border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-xs text-foreground">{lib.name}</h4>
                          <code className="text-[10px] text-muted-foreground block mt-0.5">&lt;{lib.includeName}&gt;</code>
                        </div>
                        <button
                          onClick={() => toggleInstallLibrary(lib)}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all hover:scale-105 ${
                            isInstalled ? "bg-destructive/15 text-destructive border border-destructive/30" : "bg-primary/15 text-primary border border-primary/30"
                          }`}
                        >
                          {isInstalled ? "Uninstall" : "Install"}
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-normal">{lib.description}</p>

                      {/* Inject sample button */}
                      {isInstalled && (
                        <button
                          onClick={() => injectBoilerplate(lib.sampleCode)}
                          className="w-full py-1.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-primary hover:bg-slate-850 hover:text-foreground transition-all flex items-center justify-center gap-1.5"
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
                <Brain size={16} className="text-brand-purple" />
                <span className="font-bold text-sm text-foreground">AI Debug Assistant</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {debugMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl text-sm ${msg.role === "user" ? "ml-4 bg-primary/10 border border-primary/30 text-primary" : "bg-brand-purple/10 border border-brand-purple/30 text-foreground"}`}
                  >
                    {msg.role === "ai" && <span className="text-xs font-bold block mb-1 text-brand-purple">🧠 AI Assistant</span>}
                    {msg.content}
                  </div>
                ))}
                {debugStreaming && debugMessages[debugMessages.length - 1]?.role !== "ai" && (
                  <div className="flex gap-2 justify-start p-3 rounded-xl bg-brand-purple/10 border border-brand-purple/30">
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-brand-purple" />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-brand-purple [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce bg-brand-purple [animation-delay:0.3s]" />
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
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-brand-purple"
                  />
                  <button
                    onClick={sendCustomDebugMessage}
                    disabled={!customDebugInput.trim() || debugStreaming}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-purple hover:bg-brand-purple/90 disabled:opacity-40 disabled:hover:scale-100 transition-all flex-shrink-0"
                  >
                    Send
                  </button>
                </div>

                <button
                  onClick={askNextHint}
                  disabled={debugStreaming}
                  className="rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-all w-full py-2 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Zap size={11} /> {debugStreaming ? "Thinking..." : "Get Next Hint"}
                </button>
                <p className="text-[10px] text-center text-muted-foreground">
                  AI gives hints, not answers 🎓
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <PinoutModal isOpen={showPinoutModal} onClose={() => setShowPinoutModal(false)} />
    </Layout>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
