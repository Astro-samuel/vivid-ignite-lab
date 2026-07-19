import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import FadeInView from "@/components/motion/FadeInView";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, BookOpen, Code, Wrench, CheckCircle, ChevronRight, Zap,
  Lightbulb, RotateCcw, Copy, Check, ExternalLink, Save, Search, Sparkles, Send, Bot,
  History, Trash2, RefreshCw, XCircle, AlertTriangle, Play, Loader2, Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ExplainCode from "@/components/ExplainCode";
import CodeEditor from "@/components/CodeEditor";
import { toast as sonnerToast } from "sonner";
import { useArduinoFlasher } from "@/hooks/useArduinoFlasher";
import { levelForXp } from "@/lib/xp";
import Confetti from "@/components/Confetti";
import { useLevelUp } from "@/contexts/LevelUpContext";

const PathBadge = ({ path }: { path: any }) => {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current && path?.color) {
      ref.current.style.background = `${path.color}15`;
      ref.current.style.color = path.color;
      ref.current.style.borderColor = `${path.color}30`;
    }
  }, [path]);
  return (
    <span
      ref={ref}
      className="text-xs font-extrabold px-3 py-1 rounded-full border shadow-sm"
    >
      {path?.title}
    </span>
  );
};

type Tab = "concept" | "challenge" | "simulate" | "build";

const getLessonVideo = (title: string) => {
  const videos: Record<string, string> = {
    "Your First Blink": "https://www.youtube.com/embed/fD36wA5zOyo",
    "Traffic Light Pattern": "https://www.youtube.com/embed/86D12y_2B_8",
    "PWM & LED Brightness": "https://www.youtube.com/embed/YfV-vFMV_E8",
    "RGB Color Mixing": "https://www.youtube.com/embed/J77zW5YwX9Y",
    "LED Array Patterns": "https://www.youtube.com/embed/c10eJ9V-X-k",
    "NeoPixel LED Strip": "https://www.youtube.com/embed/8N697tG9Qlg",
    "Reading a Button": "https://www.youtube.com/embed/j1_A4Y2gTUA",
    "Light Sensor": "https://www.youtube.com/embed/2_N1x3cE-8Q",
    "Temperature Sensor": "https://www.youtube.com/embed/n4d82Gf2KjM",
    "Ultrasonic Distance": "https://www.youtube.com/embed/ZejQOXhyqd0",
    "PIR Motion Detector": "https://www.youtube.com/embed/6F3B_V5-y-0",
    "Multi-Sensor Dashboard": "https://www.youtube.com/embed/ZejQOXhyqd0",
    "Servo Basics": "https://www.youtube.com/embed/LXURLv7_9rU",
    "DC Motor with L293D": "https://www.youtube.com/embed/8tGleV8Z1F4",
    "Potentiometer Servo Control": "https://www.youtube.com/embed/LXURLv7_9rU",
    "Stepper Motor Control": "https://www.youtube.com/embed/0qwrnUePrYQ",
    "Robot Car Movement": "https://www.youtube.com/embed/8tGleV8Z1F4",
  };
  return videos[title] || null;
};

const getLessonTranscript = (title: string) => {
  const transcripts: Record<string, string> = {
    "Your First Blink": "Welcome to Your First Blink! In this lesson, we'll configure digital pin 13 as an output. In the loop, we use digitalWrite(13, HIGH) to send 5V to the pin, turning the LED on. Then we delay for 500 milliseconds. Next, digitalWrite(13, LOW) turns off the voltage and LED, followed by another 500ms delay. This creates the continuous blinking cycle.",
    "Traffic Light Pattern": "In this traffic light sequencing lesson, we control three LEDs representing red, yellow, and green. We use pinMode() for pins 2, 3, and 4. We sequence them in the loop: Red HIGH for 3000ms, then Red LOW and Yellow HIGH for 1000ms, and finally Yellow LOW and Green HIGH for 3000ms. This teaches sequencing and output controls.",
    "PWM & LED Brightness": "PWM or Pulse Width Modulation allows us to simulate analog output on digital pins. By using analogWrite() with values from 0 to 255, we can control how much power flows to pin 9. The loop uses a for-loop to fade the LED brightness up and another to fade it back down, creating a smooth breathing effect.",
    "RGB Color Mixing": "RGB LEDs contain three independent channels (Red, Green, Blue). By adjusting the PWM values on redPin, greenPin, and bluePin via analogWrite, we can mix any color. In this challenge, we write a setColor helper and cycle through colors.",
    "Reading a Button": "Buttons are basic digital inputs. We use INPUT_PULLUP to activate the internal resistor, holding the pin HIGH when unpressed. When the button is pressed, it connects to ground, pulling the signal LOW. We check digitalRead(2) to toggle the LED on pin 13.",
    "Light Sensor": "Light sensors (photoresistors) change resistance based on ambient light. By pairing them with a resistor in a voltage divider, we read analog values between 0 and 1023 on pin A0. analogRead(A0) helps track brightness.",
    "Temperature Sensor": "The TMP36 temperature sensor outputs a voltage directly proportional to Celsius temperature. We read A0 and map the raw ADC value (0-1023) back to voltage, convert it to Celsius using the standard formula, and print both C and F metrics.",
    "Ultrasonic Distance": "Ultrasonic sensors measure distance by sending sound waves (Trig) and timing how long they take to bounce back (Echo). We trigger a 10-microsecond pulse, measure the return time with pulseIn(), and calculate distance in cm.",
    "Servo Basics": "Servos are actuators that rotate to specific angles from 0 to 180 degrees. Using the Servo.h library, we attach the motor to pin 9 and sweep it back and forth using a position index loop.",
  };
  return transcripts[title] || "Welcome! In this tutorial, we will explore the concepts, build wiring configurations, and write the Arduino code step-by-step. Use the editor to practice the challenge and ask our AI Mentor for any help.";
};

const getLineExplanations = (title: string) => {
  const defaultExpl = [
    { line: "void setup()", desc: "Configures settings when Arduino boots up" },
    { line: "void loop()", desc: "Runs continuously to execute your main code logic" }
  ];
  const explanations: Record<string, { line: string; desc: string }[]> = {
    "Your First Blink": [
      { line: "pinMode(13, OUTPUT);", desc: "Sets pin 13 (built-in LED) as an output pin" },
      { line: "digitalWrite(13, HIGH);", desc: "Turns the LED on by supplying 5V to pin 13" },
      { line: "delay(500);", desc: "Pauses program execution for 500 milliseconds (0.5 seconds)" },
      { line: "digitalWrite(13, LOW);", desc: "Turns the LED off by grounding pin 13 (0V)" }
    ],
    "Traffic Light Pattern": [
      { line: "pinMode(red, OUTPUT);", desc: "Configures Red LED pin 2 as output" },
      { line: "digitalWrite(red, HIGH);", desc: "Turns Red LED on" },
      { line: "delay(3000);", desc: "Holds Red phase for 3 seconds" },
      { line: "digitalWrite(red, LOW);", desc: "Turns Red LED off before next phase" }
    ],
    "PWM & LED Brightness": [
      { line: "analogWrite(ledPin, i);", desc: "Writes a PWM duty cycle value (0 to 255) to fade the LED" },
      { line: "for (int i = 0; ...)", desc: "Loops to smoothly increment or decrement the duty cycle" }
    ],
    "Reading a Button": [
      { line: "pinMode(2, INPUT_PULLUP);", desc: "Enables internal pull-up resistor on pin 2 (HIGH when open, LOW when pressed)" },
      { line: "if (digitalRead(2) == LOW)", desc: "Checks if the button is pressed (completes circuit to Ground)" }
    ]
  };
  return explanations[title] || defaultExpl;
};

const getValidationRules = (title: string) => {
  const rules: Record<string, { label: string; test: (code: string) => boolean }[]> = {
    "Your First Blink": [
      { label: "Configure pin 13 as OUTPUT", test: (code) => /pinMode\(\s*13\s*,\s*OUTPUT\s*\)/.test(code) },
      { label: "Turn the LED on using digitalWrite HIGH", test: (code) => /digitalWrite\(\s*13\s*,\s*HIGH\s*\)/.test(code) },
      { label: "Turn the LED off using digitalWrite LOW", test: (code) => /digitalWrite\(\s*13\s*,\s*LOW\s*\)/.test(code) },
      { label: "Use delay() to hold states", test: (code) => /delay\(\s*\d+\s*\)/.test(code) }
    ],
    "Traffic Light Pattern": [
      { label: "Configure pins 2, 3, and 4 as OUTPUTs", test: (code) => /pinMode\(\s*2\s*,\s*OUTPUT\s*\)/.test(code) && /pinMode\(\s*3\s*,\s*OUTPUT\s*\)/.test(code) && /pinMode\(\s*4\s*,\s*OUTPUT\s*\)/.test(code) },
      { label: "Sequentially write red, yellow, green states", test: (code) => /digitalWrite\(\s*2\s*,\s*(HIGH|LOW)\s*\)/.test(code) && /digitalWrite\(\s*3\s*,\s*(HIGH|LOW)\s*\)/.test(code) && /digitalWrite\(\s*4\s*,\s*(HIGH|LOW)\s*\)/.test(code) },
      { label: "Implement delays for traffic sequencing", test: (code) => (code.match(/delay\(\s*\d+\s*\)/g) || []).length >= 3 }
    ],
    "PWM & LED Brightness": [
      { label: "Configure ledPin (typically pin 9) as OUTPUT", test: (code) => /pinMode\(\s*9\s*,\s*OUTPUT\s*\)/.test(code) || /ledPin\s*=\s*9/.test(code) },
      { label: "Use analogWrite() to control PWM brightness", test: (code) => /analogWrite\(\s*[^,]+,\s*[^)]+\)/.test(code) },
      { label: "Use a loop to fade the LED", test: (code) => /for\s*\(/.test(code) || /while\s*\(/.test(code) }
    ],
    "Reading a Button": [
      { label: "Configure button pin with INPUT_PULLUP", test: (code) => /INPUT_PULLUP/.test(code) },
      { label: "Read button state with digitalRead()", test: (code) => /digitalRead\s*\(/.test(code) },
      { label: "Toggle LED based on button condition", test: (code) => /if\s*\(/.test(code) }
    ],
    "Light Sensor": [
      { label: "Read light levels with analogRead(A0)", test: (code) => /analogRead\(\s*A0\s*\)/.test(code) },
      { label: "Initialize Serial communication", test: (code) => /Serial\.begin\(\s*\d+\s*\)/.test(code) }
    ],
    "Temperature Sensor": [
      { label: "Read analog temperature pin", test: (code) => /analogRead\(\s*A0\s*\)/.test(code) },
      { label: "Convert ADC value to Celsius", test: (code) => /(\/\s*1024|1024\.0|0\.00488)/.test(code) || /temp/.test(code) }
    ]
  };
  return rules[title] || [
    { label: "Implement void setup()", test: (code) => /void\s+setup\s*\(\s*\)/.test(code) },
    { label: "Implement void loop()", test: (code) => /void\s+loop\s*\(\s*\)/.test(code) }
  ];
};

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { announceLevelUp } = useLevelUp();
  const [lesson, setLesson] = useState<any>(null);
  const [path, setPath] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("concept");
  const [code, setCode] = useState("");
  const [showSolution, setShowSolution] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Compilation & Simulation states
  const [runStep, setRunStep] = useState<"idle" | "compiling" | "simulating" | "success" | "error">("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [codePassed, setCodePassed] = useState(false);
  const [simulatorPassed, setSimulatorPassed] = useState(false);
  const [simExpanded, setSimExpanded] = useState(false);

  // Version Control
  interface CodeSnapshot { code: string; label: string; timestamp: string; }
  const [codeVersions, setCodeVersions] = useState<CodeSnapshot[]>([]);
  const [showVersionPanel, setShowVersionPanel] = useState(false);
  const [revertCount, setRevertCount] = useState(0);

  // Advanced learning states
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([
    { role: "assistant", content: "Hey! 👋 I'm your AI Learning Assistant for this lesson. I can help explain the concept, walk you through the code, or debug any errors. What's on your mind?" }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedAsTemplate, setSavedAsTemplate] = useState(false);
  const [transcriptSearch, setTranscriptSearch] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);

  const [validationChecks, setValidationChecks] = useState<Array<{ label: string; passed: boolean }>>([]);
  const [showConfetti, setShowConfetti] = useState(false);

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
  const [codeUploaded, setCodeUploaded] = useState(false);

  const uploadToBoard = async () => {
    const success = await uploadCodeToBoard(code);
    if (success) setCodeUploaded(true);
  };

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  useEffect(() => {
    if (!lesson) return;
    const rules = getValidationRules(lesson.title);
    const results = rules.map(r => ({
      label: r.label,
      passed: r.test(code)
    }));
    setValidationChecks(results);
  }, [code, lesson]);

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
      setCode((lessonData.challenge_starter_code || "").replace(/\\n/g, "\n"));

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

  useEffect(() => {
    try {
      setCodeVersions(JSON.parse(localStorage.getItem(`lesson_code_versions_${lessonId}`) || "[]"));
    } catch {
      setCodeVersions([]);
    }
    setRunStep("idle");
    setErrors([]);
  }, [lessonId]);

  const saveSnapshot = (label?: string) => {
    const snapshot = {
      code: code,
      label: label || `Snapshot #${codeVersions.length + 1}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [snapshot, ...codeVersions].slice(0, 20);
    setCodeVersions(updated);
    localStorage.setItem(`lesson_code_versions_${lessonId}`, JSON.stringify(updated));
    sonnerToast.success("📸 Code snapshot saved");
  };

  const runAndCheck = async () => {
    setErrors([]);
    setRunStep("compiling");
    await new Promise((r) => setTimeout(r, 1200));

    const foundErrors: string[] = [];

    // Check for common Arduino errors
    if (code.includes("pinMod(")) foundErrors.push("Error: 'pinMod' is not defined. Did you mean 'pinMode'?");
    if (/delay\(\d+;/.test(code)) foundErrors.push("Syntax error: missing closing parenthesis ')' in delay()");
    if (code.includes("void setup()") && !code.includes("pinMode") && !code.includes("Serial.begin") && !code.includes("// TODO")) {
      foundErrors.push("Warning: setup() is empty. Initialize your pins with pinMode() and Serial with Serial.begin().");
    }
    if (code.includes("// TODO: Initialize") || code.includes("// TODO: Write your main")) {
      foundErrors.push("Incomplete: You still have TODO sections. Fill in your code before running!");
    }
    if (!code.includes("void setup()")) foundErrors.push("Error: Missing setup() function.");
    if (!code.includes("void loop()")) foundErrors.push("Error: Missing loop() function.");

    if (foundErrors.length > 0) {
      setErrors(foundErrors);
      setRunStep("error");
      setCodePassed(false);
      setSimulatorPassed(false);
      return;
    }

    setCodePassed(true);
    setRunStep("simulating");
    await new Promise((r) => setTimeout(r, 1500));

    const safetyWarnings: string[] = [];
    if (code.includes("analogWrite") && code.includes("delay(1)")) {
      safetyWarnings.push("Warning: Very short delay with analog output may cause instability.");
    }
    if (safetyWarnings.length > 0) {
      setErrors(safetyWarnings);
      setRunStep("error");
      setSimulatorPassed(false);
      return;
    }

    setSimulatorPassed(true);
    setRunStep("success");
    sonnerToast.success("🚀 Code compiled and simulation passed!");
  };

  const handleComplete = async () => {
    if (!user || !lesson) return;
    setSubmitting(true);

    await supabase.from("user_lesson_progress").upsert({
      user_id: user.id,
      lesson_id: lesson.id,
      path_id: lesson.path_id,
      status: "completed",
      score: lesson.xp_reward,
      completed_at: new Date().toISOString(),
      started_at: new Date().toISOString(),
    }, { onConflict: "user_id,lesson_id" });

    const { data: profile } = await supabase
      .from("profiles")
      .select("total_xp, level")
      .eq("id", user.id)
      .single();

    if (profile) {
      const newXp = (profile.total_xp || 0) + lesson.xp_reward;
      const newLevel = levelForXp(newXp);
      await supabase.from("profiles").update({
        total_xp: newXp,
        level: newLevel,
      }).eq("id", user.id);
      if (newLevel > (profile.level || 1)) announceLevelUp(newLevel);
    }

    setCompleted(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
    setSubmitting(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAsTemplate = () => {
    localStorage.setItem(`template_${lesson?.id}`, code);
    setSavedAsTemplate(true);
    setTimeout(() => setSavedAsTemplate(false), 2000);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || aiLoading) return;
    await handleSendQuestion(chatInput.trim());
  };

  const handleSendQuestion = async (text: string) => {
    const userMsg = { role: "user", content: text };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput("");
    setAiLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setChatHistory(prev => [...prev, { role: "assistant", content: "Please log in to chat with the AI Mentor." }]);
        setAiLoading(false);
        return;
      }

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-mentor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: [...chatHistory, userMsg],
          preferences: { tone: "supportive", hintDepth: "detailed", formality: "friendly" },
          contextMeta: { lesson_title: lesson.title, lesson_id: lesson.id }
        }),
      });

      if (!resp.ok) {
        throw new Error("Failed to connect to AI Mentor");
      }

      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setChatHistory(prev => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIdx: number;
          while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIdx);
            buffer = buffer.slice(newlineIdx + 1);
            if (line.startsWith("data: ")) {
              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") break;
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  assistantText += content;
                  setChatHistory(prev => {
                    const next = [...prev];
                    next[next.length - 1] = { role: "assistant", content: assistantText };
                    return next;
                  });
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { role: "assistant", content: "Sorry, I had trouble connecting. Please try again." }]);
    } finally {
      setAiLoading(false);
    }
  };

  const tabs = [
    { id: "concept" as Tab, label: "📖 Concept", icon: BookOpen },
    { id: "challenge" as Tab, label: "💻 Challenge", icon: Code },
    { id: "simulate" as Tab, label: "🤖 Simulate", icon: Zap },
    { id: "build" as Tab, label: "🔨 Build", icon: Wrench },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!lesson) {
    return (
      <Layout>
        <div className="px-6 py-12 text-center max-w-md mx-auto">
          <p className="text-sm font-semibold text-muted-foreground mb-4">Lesson not found</p>
          <button
            onClick={() => navigate("/learn")}
            className="px-6 py-3 bg-primary hover:bg-primary/90 border-2 border-b-4 border-primary/60 active:border-b-2 active:translate-y-[2px] rounded-xl text-sm font-extrabold text-primary-foreground transition-all"
          >
            ← Back to Learn
          </button>
        </div>
      </Layout>
    );
  }

  const videoUrl = getLessonVideo(lesson.title);
  const transcript = getLessonTranscript(lesson.title);
  const showTranscriptBlock = transcript.toLowerCase().includes(transcriptSearch.toLowerCase());

  const quickStarters = [
    `How does ${lesson.title} work?`,
    "Explain setup() here",
    "Help me debug code",
    "What parts are needed?"
  ];

  return (
    <Layout>
      <AnimatePresence>
        {showConfetti && <Confetti />}
      </AnimatePresence>
      <div className="px-6 py-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Lesson workspace */}
        <div className="lg:col-span-8 flex flex-col min-w-0">
          {/* Header */}
          <FadeInView className="mb-6">
            <button
              onClick={() => navigate("/learn")}
              className="flex items-center gap-2 text-sm font-bold mb-4 transition-all text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={14} /> Back to Learn
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {path && <PathBadge path={path} />}
                  <span className="text-xs font-bold text-muted-foreground">Lesson {lesson.lesson_order}</span>
                </div>
                <h1 className="text-2xl font-extrabold font-display text-foreground">{lesson.title}</h1>
                <p className="text-sm font-medium text-muted-foreground">{lesson.description}</p>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 border-2 border-primary/30 px-4 py-2 rounded-2xl self-start md:self-auto shadow-sm">
                <Zap size={14} className="text-primary fill-primary" />
                <span className="text-sm font-extrabold font-display text-primary">+{lesson.xp_reward} XP</span>
              </div>
            </div>
          </FadeInView>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-muted/40 p-1 rounded-2xl border-2 border-border max-w-sm">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-extrabold transition-all border-2 border-b-4 ${
                    isActive
                      ? "bg-card border-border text-primary shadow-sm"
                      : "bg-transparent border-transparent text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "concept" && (
              <motion.div
                key="concept"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-card border-2 border-b-4 border-border rounded-2xl p-6 shadow-sm"
              >


                {/* Core Concept Prose */}
                <div className="prose max-w-none text-foreground font-medium leading-relaxed mb-6">
                  {lesson.concept_content.replace(/\\n/g, "\n").split("\n").map((line: string, i: number) => {
                    if (line.startsWith("# ")) {
                      return (
                        <h2 key={i} className="text-xl font-extrabold font-display text-foreground mb-3 mt-2">
                          {line.slice(2)}
                        </h2>
                      );
                    }
                    if (line.startsWith("## ")) {
                      return (
                        <h3 key={i} className="text-lg font-extrabold font-display text-foreground mb-2 mt-4">
                          {line.slice(3)}
                        </h3>
                      );
                    }
                    if (line.startsWith("```")) return null;
                    if (line.startsWith("- **")) {
                      const match = line.match(/- \*\*(.+?)\*\* — (.+)/);
                      if (match) {
                        return (
                          <div key={i} className="flex items-start gap-2 mb-2 pl-2">
                            <span className="text-muted-foreground font-extrabold mt-0.5">•</span>
                            <p className="text-sm">
                              <span className="font-extrabold text-foreground">{match[1]}</span>{" "}
                              <span className="text-muted-foreground">— {match[2]}</span>
                            </p>
                          </div>
                        );
                      }
                    }
                    if (line.startsWith("- ")) {
                      return (
                        <div key={i} className="flex items-start gap-2 mb-1 pl-2">
                          <span className="text-muted-foreground font-extrabold mt-0.5">•</span>
                          <p className="text-sm text-muted-foreground">{line.slice(2)}</p>
                        </div>
                      );
                    }
                    if (line.trim() === "") return <div key={i} className="h-3" />;

                    const rendered = line.replace(
                      /`([^`]+)`/g,
                      '<code class="px-1.5 py-0.5 rounded text-xs font-mono bg-muted text-foreground border border-border font-bold">$1</code>'
                    );
                    return (
                      <p
                        key={i}
                        className="text-sm mb-2 text-muted-foreground font-medium"
                        dangerouslySetInnerHTML={{ __html: rendered }}
                      />
                    );
                  })}
                </div>

                {/* Concept diagram comparisons */}
                <div className="mb-6 border-2 border-border rounded-2xl p-5 bg-muted/20">
                  <h4 className="font-black text-sm text-foreground font-display mb-3">Signal Comparison Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-background border-2 border-border rounded-xl">
                      <h5 className="font-extrabold text-xs text-foreground mb-1">Digital Pins</h5>
                      <p className="text-[11px] text-muted-foreground leading-tight">States: HIGH (5V) or LOW (0V). Ideal for simple switches, button inputs, and standard LEDs.</p>
                    </div>
                    <div className="p-3 bg-background border-2 border-border rounded-xl">
                      <h5 className="font-extrabold text-xs text-foreground mb-1">Analog Input</h5>
                      <p className="text-[11px] text-muted-foreground leading-tight">States: Reads range of voltages (0V to 5V) returning 0 to 1023. Perfect for potentiometers and environmental sensors.</p>
                    </div>
                  </div>
                </div>

                {/* Line-by-line syntax explanation */}
                <div className="mb-6 border-2 border-border rounded-2xl p-5 bg-muted/20">
                  <h4 className="font-black text-sm text-foreground font-display mb-3">How the Code Works:</h4>
                  <div className="space-y-2">
                    {getLineExplanations(lesson.title).map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row justify-between gap-1 p-2.5 bg-background border-2 border-border rounded-xl font-semibold">
                        <code className="text-xs font-mono text-foreground">{item.line}</code>
                        <span className="text-[11px] text-muted-foreground sm:text-right">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setActiveTab("challenge")}
                    className="px-6 py-3 bg-primary hover:bg-primary/90 border-2 border-b-4 border-primary/60 active:border-b-2 active:translate-y-[2px] rounded-xl text-sm font-extrabold text-primary-foreground flex items-center gap-2 transition-all shadow-sm"
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
                <div className="rounded-2xl border-2 border-b-4 border-primary/30 p-5 mb-6 bg-primary/5">
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <Lightbulb size={16} className="fill-primary/20" />
                    <span className="text-sm font-extrabold uppercase tracking-wider">Challenge Task</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground leading-relaxed">
                    {lesson.challenge_prompt}
                  </p>
                </div>

                {/* Code Requirements Checklist */}
                <div className="rounded-2xl border-2 border-border p-5 mb-6 bg-background/40">
                  <h4 className="font-extrabold text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle size={14} /> Challenge Requirements
                  </h4>
                  <div className="space-y-2">
                    {validationChecks.map((check, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-semibold">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] font-black ${
                            check.passed
                              ? "bg-success/10 border-success/50 text-success"
                              : "bg-card border-border text-muted-foreground"
                          }`}
                        >
                          {check.passed ? "✓" : "○"}
                        </div>
                        <span className={check.passed ? "text-success line-through decoration-success/30" : "text-foreground"}>
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Run workflow indicator */}
                {runStep !== "idle" && (
                  <div className="rounded-xl px-5 py-3 flex items-center gap-6 border mb-4 bg-card border-border">
                    {(["compiling", "simulating"] as const).map((step, i) => {
                      const labels = ["Compiling", "Simulating"];
                      const stepOrder = ["compiling", "simulating"];
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
                            <div className="w-4 h-4 rounded-full bg-muted" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              isDone ? "text-success" : isActive ? "text-primary" : "text-muted-foreground"
                            }`}
                          >
                            {labels[i]}
                          </span>
                        </div>
                      );
                    })}
                    {runStep === "success" && (
                      <span className="font-bold text-sm animate-fade-in-up flex items-center gap-2 text-success">
                        <CheckCircle size={16} /> ✓ Compilation Successful!
                      </span>
                    )}
                    {runStep === "error" && (
                      <div className="flex items-center gap-2">
                        <XCircle size={16} className="text-destructive" />
                        <span className="font-bold text-sm text-destructive">{errors.length} Error{errors.length !== 1 ? "s" : ""}</span>
                        <button
                          onClick={() => {
                            handleSendQuestion(`I encountered ${errors.length} error(s) during compilation: \n\n${errors.join("\n")}\n\nHere is my code:\n\n\`\`\`cpp\n${code}\n\`\`\`\n\nPlease help me debug this!`);
                          }}
                          className="ml-2 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 bg-card text-foreground border border-border"
                        >
                          <Bot size={12} /> Debug with AI
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Code Editor */}
                <div className="rounded-2xl border-2 border-b-4 border-border overflow-hidden bg-card shadow-md mb-6">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-extrabold text-muted-foreground">sketch.ino</span>
                      <span className="text-border">|</span>
                      <button
                        onClick={serialConnected ? disconnectSerial : connectSerial}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                          serialConnected
                            ? "bg-success/15 text-success border-success/30"
                            : "bg-transparent text-muted-foreground border-border"
                        }`}
                      >
                        {serialConnected ? "🔌 Connected" : "🔌 Connect Board"}
                      </button>
                      {serialConnected && (
                        <button
                          onClick={uploadToBoard}
                          disabled={uploading}
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-border text-foreground hover:bg-muted transition-all cursor-pointer"
                        >
                          {uploading ? "Uploading..." : "📤 Upload"}
                        </button>
                      )}
                      <button
                        onClick={() => setShowSerialConsole(!showSerialConsole)}
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-border text-foreground hover:bg-muted transition-all cursor-pointer"
                      >
                        📟 Serial
                      </button>
                      {showSolution && (
                        <span className="text-[10px] bg-card text-foreground border border-border px-2 py-0.5 rounded-full font-bold">
                          Viewing Solution
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!showSolution && (
                        <>
                          <button
                            onClick={() => saveSnapshot()}
                            className="flex items-center gap-1 px-3 py-1 bg-card hover:bg-muted border border-border rounded-lg text-xs font-bold text-foreground transition-all cursor-pointer"
                          >
                            <Save size={10} /> Snapshot
                          </button>
                          <button
                            onClick={() => setShowVersionPanel(!showVersionPanel)}
                            className="flex items-center gap-1 px-3 py-1 bg-card hover:bg-muted border border-border rounded-lg text-xs font-bold text-foreground transition-all cursor-pointer"
                          >
                            <History size={10} /> History ({codeVersions.length})
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          if (!showSolution) {
                            setCode((lesson.challenge_starter_code || "").replace(/\\n/g, "\n"));
                            setRunStep("idle");
                            setErrors([]);
                          }
                        }}
                        disabled={showSolution}
                        className="flex items-center gap-1 px-3 py-1 bg-card hover:bg-muted border border-border rounded-lg text-xs font-bold text-foreground transition-all cursor-pointer disabled:opacity-40"
                      >
                        <RotateCcw size={10} /> Reset
                      </button>
                      <button
                        onClick={() => setShowSolution(!showSolution)}
                        className="flex items-center gap-1 px-3 py-1 bg-card hover:bg-muted border border-border rounded-lg text-xs font-bold text-foreground transition-all cursor-pointer"
                      >
                        {showSolution ? "Hide" : "Reveal"} Solution
                      </button>
                      <ExplainCode code={showSolution ? lesson.challenge_solution.replace(/\\n/g, "\n") : code} />
                    </div>
                  </div>

                  {/* Version History Panel */}
                  {showVersionPanel && !showSolution && (
                    <div className="border-b px-5 py-3 space-y-2 animate-fade-in bg-muted/30 border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                          <History size={12} /> Version History
                        </span>
                        <button onClick={() => setShowVersionPanel(false)} className="text-xs text-muted-foreground">✕</button>
                      </div>
                      {codeVersions.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No snapshots yet. Click "Snapshot" to save current code.</p>
                      ) : (
                        <div className="max-h-40 overflow-y-auto space-y-1.5">
                          {codeVersions.map((v, i) => (
                            <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-background border border-border">
                              <div>
                                <p className="text-xs font-semibold text-foreground">{v.label}</p>
                                <p className="text-[10px] text-muted-foreground">{new Date(v.timestamp).toLocaleString()}</p>
                              </div>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => {
                                    setCode(v.code);
                                    setRevertCount(prev => prev + 1);
                                    sonnerToast.success(`↩️ Reverted to "${v.label}"`);
                                  }}
                                  className="px-2 py-1 rounded text-xs font-bold transition-all hover:scale-105 text-foreground border border-border"
                                >
                                  Revert
                                </button>
                                <button
                                  onClick={() => {
                                    const updated = codeVersions.filter((_, idx) => idx !== i);
                                    setCodeVersions(updated);
                                    localStorage.setItem(`lesson_code_versions_${lessonId}`, JSON.stringify(updated));
                                  }}
                                  title="Delete version"
                                  aria-label="Delete version"
                                  className="px-2 py-1 rounded text-xs transition-all hover:scale-105 text-destructive"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Code Area */}
                  {showSolution ? (
                    <CodeEditor key="solution" code={lesson.challenge_solution.replace(/\\n/g, "\n")} readOnly maxHeight="500px" minHeight="300px" />
                  ) : (
                    <div className="relative flex flex-col overflow-hidden">
                      <CodeEditor key={`user-v${revertCount}`} code={code} onChange={(newCode) => { setCode(newCode); setCodeUploaded(false); }} maxHeight="500px" minHeight="400px" />
                      {showSerialConsole && (
                        <div className="h-36 border-t flex flex-col overflow-hidden bg-background border-border">
                          <div className="flex items-center justify-between px-4 py-1.5 border-b text-[10px] font-mono border-border text-muted-foreground">
                            <span className="text-muted-foreground font-bold">📟 Serial Monitor (9600 baud)</span>
                            <div className="flex gap-2">
                              <button onClick={clearLogs} className="hover:text-white transition-all">Clear Logs</button>
                              <button onClick={() => setShowSerialConsole(false)} className="hover:text-white transition-all">✕</button>
                            </div>
                          </div>
                          <div className="flex-1 p-3 overflow-y-auto font-mono text-[9px] space-y-1 text-foreground">
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
                  )}

                  {/* Error Panel */}
                  {errors.length > 0 && (
                    <div className="border-t p-4 animate-fade-in bg-destructive/10 border-destructive/30">
                      <div className="flex items-center gap-2 mb-2 text-destructive">
                        <AlertTriangle size={14} />
                        <span className="font-bold text-sm">Compilation Errors</span>
                      </div>
                      {errors.map((err, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs font-mono p-2 rounded-lg mb-1 bg-destructive/15 text-destructive">
                          <XCircle size={12} className="flex-shrink-0 mt-0.5" /> {err}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Editor Actions */}
                <div className="flex flex-wrap gap-2.5 mb-6">
                  <button
                    onClick={handleCopy}
                    className="clay-btn clay-btn-ghost clay-btn-sm"
                  >
                    {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                    {copied ? "Copied!" : "Copy to My Editor"}
                  </button>
                  <button
                    onClick={() => handleSendQuestion("Explain how to test this code step-by-step in Wokwi simulator")}
                    className="clay-btn clay-btn-ghost clay-btn-sm"
                  >
                    <ExternalLink size={14} /> Test in Wokwi
                  </button>
                  <button
                    onClick={handleSaveAsTemplate}
                    className="clay-btn clay-btn-ghost clay-btn-sm"
                  >
                    {savedAsTemplate ? <Check size={14} className="text-success" /> : <Save size={14} />}
                    {savedAsTemplate ? "Saved!" : "Save as Template"}
                  </button>
                  <button
                    onClick={runAndCheck}
                    disabled={runStep === "compiling" || runStep === "simulating"}
                    className="px-5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-60 bg-primary text-primary-foreground font-display shadow-lg shadow-primary/20"
                  >
                    {runStep === "compiling" || runStep === "simulating" ? (
                      <><Loader2 size={14} className="animate-spin" /> Running...</>
                    ) : (
                      <><Play size={14} /> Run & Compile</>
                    )}
                  </button>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setActiveTab("concept")}
                    className="px-5 py-3 rounded-xl text-sm font-extrabold flex items-center gap-2 transition-all border-2 border-b-4 border-border bg-card hover:bg-muted/10 text-foreground active:border-b-2 active:translate-y-[2px]"
                  >
                    <ArrowLeft size={14} /> Back to Concept
                  </button>
                  <button
                    onClick={() => setActiveTab("simulate")}
                    className="px-6 py-3 bg-primary hover:bg-primary/90 border-2 border-b-4 border-primary/60 active:border-b-2 active:translate-y-[2px] rounded-xl text-sm font-extrabold text-primary-foreground flex items-center gap-2 transition-all shadow-sm"
                  >
                    Go to Simulation <Zap size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "simulate" && (
              <motion.div
                key="simulate"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div
                  className={`rounded-2xl border overflow-hidden transition-all duration-300 bg-card border-border ${simExpanded ? "fixed inset-4 z-50" : "relative"}`}
                >
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                    <span className="text-sm font-semibold text-foreground">Wokwi Simulator</span>
                    <button
                      onClick={() => setSimExpanded(!simExpanded)}
                      className="px-3 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105 text-muted-foreground border border-border"
                    >
                      {simExpanded ? "Minimize" : "Expand"}
                    </button>
                  </div>
                  <div className={simExpanded ? "relative bg-background w-full h-[calc(100%-44px)]" : "relative bg-background w-full h-[450px]"}>
                    <iframe
                      src="https://wokwi.com/projects/new/arduino-uno"
                      className={simExpanded ? "w-full h-full border-none" : "absolute inset-0 w-full h-full border-none"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                      title="Wokwi Simulator"
                    />
                  </div>
                </div>
                {simExpanded && <div className="fixed inset-0 bg-black/60 z-45" onClick={() => setSimExpanded(false)} />}

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setActiveTab("challenge")}
                    className="px-5 py-3 rounded-xl text-sm font-extrabold flex items-center gap-2 transition-all border-2 border-b-4 border-border bg-card hover:bg-muted/10 text-foreground active:border-b-2 active:translate-y-[2px]"
                  >
                    <ArrowLeft size={14} /> Back to Code
                  </button>
                  <button
                    onClick={() => setActiveTab("build")}
                    className="px-6 py-3 bg-primary hover:bg-primary/90 border-2 border-b-4 border-primary/60 active:border-b-2 active:translate-y-[2px] rounded-xl text-sm font-extrabold text-primary-foreground flex items-center gap-2 transition-all shadow-sm"
                  >
                    Go to Build <Wrench size={14} />
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
                className="bg-card border-2 border-b-4 border-border rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-card border-2 border-b-4 border-border flex items-center justify-center text-2xl shadow-sm">
                    🔨
                  </div>
                  <div>
                    <h3 className="font-extrabold font-display text-foreground text-base">Build Task</h3>
                    <p className="text-xs font-bold text-muted-foreground">Time to wires and solder! Connect up the hardware.</p>
                  </div>
                </div>

                <div className="rounded-2xl p-5 mb-6 bg-muted/20 border-2 border-dashed border-border">
                  <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
                    {lesson.build_task}
                  </p>
                </div>

                {/* Direct Board Upload Card */}
                <div className="rounded-2xl p-5 mb-6 border-2 border-primary/30 bg-primary/5 space-y-4">
                  <h4 className="font-black text-sm text-foreground font-display flex items-center gap-2">
                    <Zap size={16} className="text-primary" /> Physical Arduino Upload
                  </h4>
                  <p className="text-xs font-bold text-muted-foreground">
                    Before you can mark this lesson as complete, you must connect your physical Arduino board and upload your working code.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={serialConnected ? disconnectSerial : connectSerial}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all hover:scale-105 border ${
                        serialConnected
                          ? "bg-success/15 text-success border-success/30"
                          : "bg-muted/10 text-muted-foreground border-border"
                      }`}
                    >
                      {serialConnected ? "🔌 Connected" : "🔌 Connect Arduino"}
                    </button>
                    {serialConnected && (
                      <button
                        onClick={uploadToBoard}
                        disabled={uploading}
                        className="px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all hover:scale-105 bg-primary text-primary-foreground border border-primary/60 hover:bg-primary/90"
                      >
                        {uploading ? (
                          <><Loader2 size={12} className="animate-spin" /> Uploading...</>
                        ) : (
                          <>📤 Upload to Board</>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setShowSerialConsole(!showSerialConsole)}
                      className="px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all hover:scale-105 bg-card text-foreground border border-border"
                    >
                      📟 {showSerialConsole ? "Hide Serial Monitor" : "Open Serial Monitor"}
                    </button>
                  </div>

                  {/* Serial Monitor Inline */}
                  {showSerialConsole && (
                    <div className="border border-border rounded-xl overflow-hidden bg-background">
                      <div className="flex items-center justify-between px-3 py-1.5 border-b text-[10px] font-mono border-border text-muted-foreground">
                        <span className="text-muted-foreground font-bold">📟 Serial Monitor (9600 baud)</span>
                        <button onClick={clearLogs} className="hover:text-white transition-all text-[9px]">Clear</button>
                      </div>
                      <div className="p-3 max-h-36 overflow-y-auto font-mono text-[9px] text-foreground space-y-1 bg-background">
                        {serialLogs.length === 0 ? (
                          <span className="text-muted-foreground italic text-[9px]">No output. Verify connection and upload code.</span>
                        ) : (
                          serialLogs.map((log, idx) => (
                            <div key={idx} className="whitespace-pre-wrap">{log}</div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="text-muted-foreground">Upload Status:</span>
                    {codeUploaded ? (
                      <span className="text-success flex items-center gap-1">
                        <CheckCircle size={12} /> Sketch successfully uploaded!
                      </span>
                    ) : (
                      <span className="text-warning flex items-center gap-1">
                        <AlertTriangle size={12} /> Pending upload to physical Arduino
                      </span>
                    )}
                  </div>
                </div>

                {completed ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="rounded-2xl p-6 text-center bg-success/10 border-2 border-b-4 border-success/30 shadow-sm"
                  >
                    <div className="text-5xl mb-3">🎉</div>
                    <h3 className="text-xl font-extrabold font-display text-success mb-1">Lesson Complete!</h3>
                    <p className="text-sm font-semibold text-muted-foreground mb-4">You earned {lesson.xp_reward} XP. Keep pushing forward!</p>
                    <button
                      onClick={() => navigate("/learn")}
                      className="px-6 py-3 bg-primary hover:bg-primary/90 border-2 border-b-4 border-primary/60 active:border-b-2 active:translate-y-[2px] rounded-xl text-sm font-extrabold text-primary-foreground transition-all shadow-sm"
                    >
                      Continue Learning →
                    </button>
                  </motion.div>
                ) : (
                  <button
                    onClick={handleComplete}
                    disabled={submitting || !codeUploaded}
                    className="w-full py-4 bg-success hover:bg-success/90 border-2 border-b-4 border-success/70 active:border-b-2 active:translate-y-[2px] rounded-xl text-sm font-extrabold text-white flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <CheckCircle size={16} />
                    {submitting ? "Completing..." : !codeUploaded ? "Upload Code to Board to Complete" : "Mark as Complete"}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Embedded AI Learning Assistant */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="bg-card border-2 border-b-4 border-border rounded-3xl p-5 flex flex-col h-full shadow-sm">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b-2 border-border flex-shrink-0">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-primary/10 border-2 border-primary/30 text-primary">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-black text-sm text-foreground font-display leading-none">AI Assistant</h3>
                <span className="text-[10px] font-bold text-muted-foreground mt-1 block">Your personal Arduino mentor</span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto max-h-[360px] lg:max-h-[420px] mb-4 space-y-3 p-3 bg-background rounded-2xl border-2 border-border">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed max-w-[85%] font-semibold ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground border-b-2 border-primary/60'
                        : 'bg-card text-foreground border-2 border-border'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-card text-foreground border-2 border-border rounded-2xl px-3.5 py-2 text-xs font-semibold animate-pulse">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Prompt Starters */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {quickStarters.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSendQuestion(q)}
                  className="text-[10px] font-black text-left p-2.5 bg-primary/10 hover:bg-primary/20 border-2 border-primary/30 rounded-xl text-primary transition-all leading-tight cursor-pointer"
                >
                  "{q}"
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-3.5 py-2.5 bg-background hover:bg-muted/50 border-2 border-border focus:border-primary rounded-xl text-xs font-semibold focus:outline-none text-foreground transition-all"
              />
              <button
                type="submit"
                disabled={aiLoading}
                title="Send message"
                aria-label="Send message"
                className="clay-btn clay-btn-primary clay-btn-sm shrink-0 flex items-center justify-center w-9 h-9 !p-0"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
