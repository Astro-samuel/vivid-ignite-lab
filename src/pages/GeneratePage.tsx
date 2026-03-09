import { useState, useEffect } from "react";
import { Zap, RefreshCw, Save, CheckSquare, Square, ChevronDown, ChevronUp, Clock, Star, Loader2, X, Plus, Brain } from "lucide-react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import FadeInView from "@/components/motion/FadeInView";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProjects } from "@/hooks/useUserProjects";
import { toast as sonnerToast } from "sonner";

interface Project {
  id: number;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  time: string;
  xp: number;
  description: string;
  components: string[];
  emoji: string;
}

const projectPool: Project[] = [
  // Beginner
  { id: 101, emoji: "💡", title: "Smart LED Mood Lamp", difficulty: "beginner", time: "30 mins", xp: 75, description: "Build a responsive LED lamp that changes color based on ambient light levels using a photoresistor.", components: ["LED", "Photoresistor", "Arduino Uno", "220Ω Resistor"] },
  { id: 102, emoji: "🌱", title: "Smart Plant Watering System", difficulty: "beginner", time: "45 mins", xp: 100, description: "Automate plant care with a soil moisture sensor that triggers a water pump when plants need watering.", components: ["Soil Moisture Sensor", "Water Pump", "Relay Module", "Arduino Uno"] },
  { id: 103, emoji: "🎮", title: "Joystick-Controlled LED Matrix", difficulty: "beginner", time: "40 mins", xp: 90, description: "Use a joystick to draw and animate patterns on an 8x8 LED matrix display.", components: ["8x8 LED Matrix", "MAX7219", "Joystick Module", "Arduino Uno"] },
  { id: 104, emoji: "🚦", title: "Traffic Light Controller", difficulty: "beginner", time: "20 mins", xp: 55, description: "Simulate a real traffic light sequence with red, yellow, and green LEDs and timed delays.", components: ["LED", "Arduino Uno", "220Ω Resistor", "Breadboard"] },
  { id: 105, emoji: "🎹", title: "Button Piano", difficulty: "beginner", time: "25 mins", xp: 65, description: "Create a mini piano using push buttons mapped to musical notes on a piezo buzzer.", components: ["Push Button", "Buzzer", "Arduino Uno", "Breadboard"] },
  { id: 106, emoji: "🌙", title: "Automatic Night Light", difficulty: "beginner", time: "20 mins", xp: 55, description: "An LED that turns on automatically when ambient light drops below a threshold.", components: ["LED", "Photoresistor", "Arduino Uno", "10kΩ Resistor"] },
  { id: 107, emoji: "🎲", title: "Electronic Dice", difficulty: "beginner", time: "25 mins", xp: 60, description: "Press a button to roll a virtual die displayed on 7 LEDs arranged in a dice pattern.", components: ["LED", "Push Button", "Arduino Uno", "220Ω Resistor"] },
  { id: 108, emoji: "⏰", title: "Countdown Timer", difficulty: "beginner", time: "30 mins", xp: 70, description: "Build a countdown timer with a 7-segment display and buzzer alert.", components: ["7-Segment Display", "Buzzer", "Push Button", "Arduino Uno"] },
  { id: 109, emoji: "🌈", title: "Rainbow LED Fader", difficulty: "beginner", time: "25 mins", xp: 65, description: "Smoothly cycle through all rainbow colors on an RGB LED using PWM.", components: ["RGB LED", "Arduino Uno", "220Ω Resistor", "Breadboard"] },
  { id: 110, emoji: "📢", title: "Clap Switch", difficulty: "beginner", time: "30 mins", xp: 70, description: "Toggle an LED on/off by clapping, using a sound sensor module.", components: ["Sound Sensor", "LED", "Arduino Uno", "Relay Module"] },

  // Intermediate
  { id: 201, emoji: "🌡️", title: "Weather Station Dashboard", difficulty: "intermediate", time: "60 mins", xp: 150, description: "Monitor temperature, humidity, and pressure with sensor data displayed on an OLED screen.", components: ["DHT22", "BMP180", "OLED Display", "Arduino Uno"] },
  { id: 202, emoji: "🔐", title: "RFID Door Lock", difficulty: "intermediate", time: "60 mins", xp: 140, description: "Create a secure door lock using RFID tags and a servo motor with LCD feedback.", components: ["RFID RC522", "Servo Motor", "LCD 16x2", "Arduino Uno"] },
  { id: 203, emoji: "🤖", title: "Line-Following Robot", difficulty: "intermediate", time: "90 mins", xp: 200, description: "Program a robot that autonomously follows a black line using IR sensors and differential motor control.", components: ["IR Sensors", "Motor Driver L298N", "DC Motors", "Arduino Uno"] },
  { id: 204, emoji: "📻", title: "IR Remote Decoder", difficulty: "intermediate", time: "35 mins", xp: 85, description: "Capture and decode infrared signals from any TV remote control.", components: ["IR Receiver", "Arduino Uno", "Breadboard", "Jumper Wires"] },
  { id: 205, emoji: "⏱️", title: "Reaction Time Game", difficulty: "intermediate", time: "40 mins", xp: 90, description: "Test your reflexes — press the button as fast as possible when the LED lights up.", components: ["LED", "Push Button", "LCD 16x2", "Arduino Uno"] },
  { id: 206, emoji: "🧭", title: "Digital Compass", difficulty: "intermediate", time: "50 mins", xp: 110, description: "Build a compass using an I2C magnetometer and display heading on an OLED.", components: ["HMC5883L", "OLED Display", "Arduino Uno", "Breadboard"] },
  { id: 207, emoji: "🎯", title: "Laser Tripwire Alarm", difficulty: "intermediate", time: "45 mins", xp: 100, description: "Create a security beam — when the laser is broken, an alarm buzzer sounds.", components: ["Laser Module", "Photoresistor", "Buzzer", "Arduino Uno"] },
  { id: 208, emoji: "📊", title: "Data Logger to SD Card", difficulty: "intermediate", time: "55 mins", xp: 120, description: "Log sensor readings to an SD card with timestamps for offline analysis.", components: ["SD Card Module", "DHT11", "Arduino Uno", "Breadboard"] },
  { id: 209, emoji: "🔔", title: "Motion Detection Alarm", difficulty: "intermediate", time: "40 mins", xp: 95, description: "Detect movement with a PIR sensor and trigger a buzzer and LED alert.", components: ["PIR Sensor", "Buzzer", "LED", "Arduino Uno"] },
  { id: 210, emoji: "🖥️", title: "Serial LCD Menu System", difficulty: "intermediate", time: "50 mins", xp: 105, description: "Build a navigable menu system on an LCD using rotary encoder input.", components: ["LCD 16x2", "Rotary Encoder", "Arduino Uno", "Breadboard"] },

  // Advanced
  { id: 301, emoji: "🔊", title: "Theremin Music Synthesizer", difficulty: "advanced", time: "75 mins", xp: 175, description: "Build a touchless instrument using ultrasonic distance to generate musical tones.", components: ["HC-SR04", "Piezo Buzzer", "Arduino Uno", "LED Strip"] },
  { id: 302, emoji: "📡", title: "Wireless Sensor Network", difficulty: "advanced", time: "120 mins", xp: 250, description: "Build a multi-node sensor network using NRF24L01 radio modules.", components: ["NRF24L01", "DHT11", "Arduino Nano", "OLED Display"] },
  { id: 303, emoji: "🏠", title: "Smart Home Controller", difficulty: "advanced", time: "100 mins", xp: 220, description: "Control lights and fans via WiFi using an ESP8266 shield and a web interface.", components: ["ESP8266", "Relay Module", "LED", "Arduino Uno"] },
  { id: 304, emoji: "🦾", title: "Robotic Arm with Inverse Kinematics", difficulty: "advanced", time: "130 mins", xp: 260, description: "Control a multi-servo robotic arm with calculated joint angles for precise positioning.", components: ["Servo Motor", "Joystick Module", "Arduino Mega", "Breadboard"] },
  { id: 305, emoji: "🚁", title: "Ultrasonic Radar Scanner", difficulty: "advanced", time: "90 mins", xp: 200, description: "Sweep an ultrasonic sensor on a servo and display a radar-style map on Processing.", components: ["HC-SR04", "Servo Motor", "Arduino Uno", "Breadboard"] },
  { id: 306, emoji: "🎵", title: "Audio Spectrum Analyzer", difficulty: "advanced", time: "80 mins", xp: 185, description: "Visualize audio frequencies on an LED matrix using FFT analysis.", components: ["Microphone Module", "8x8 LED Matrix", "MAX7219", "Arduino Uno"] },
  { id: 307, emoji: "⚡", title: "Power Consumption Monitor", difficulty: "advanced", time: "85 mins", xp: 190, description: "Measure voltage and current with INA219 and display real-time power graphs on OLED.", components: ["INA219", "OLED Display", "Arduino Uno", "Breadboard"] },
  { id: 308, emoji: "🤖", title: "Gesture-Controlled Robot", difficulty: "advanced", time: "110 mins", xp: 240, description: "Control a robot using hand gestures detected by an accelerometer on a glove.", components: ["MPU6050", "Motor Driver L298N", "DC Motors", "Arduino Uno"] },
];

function getInventoryComponents(userId?: string): string[] {
  try {
    const key = userId ? `inventory_${userId}` : "userInventory";
    const inv = JSON.parse(localStorage.getItem(key) || "[]");
    return inv;
  } catch { return []; }
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles =
    difficulty === "beginner"
      ? { background: "rgba(0,255,136,0.15)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)" }
      : difficulty === "intermediate"
      ? { background: "rgba(255,165,0,0.15)", color: "#FFA500", border: "1px solid rgba(255,165,0,0.3)" }
      : { background: "rgba(183,68,255,0.15)", color: "#B744FF", border: "1px solid rgba(183,68,255,0.3)" };
  return (
    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize" style={styles}>
      {difficulty}
    </span>
  );
}

function ProjectCard({
  project, index, isLoading, isSelected, onSelect, onStart, isStarting,
}: {
  project: Project; index: number; isLoading: boolean; isSelected: boolean;
  onSelect: () => void; onStart: () => void; isStarting?: boolean;
}) {
  const [expanded, setExpanded] = useState(index < 3);

  if (isLoading) {
    return (
      <div className="rounded-2xl border p-5 animate-pulse" style={{ background: "hsl(229, 45%, 16%)", borderColor: "hsl(229, 42%, 28%)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl" style={{ background: "hsl(229, 42%, 22%)" }} />
          <div className="flex-1">
            <div className="h-4 rounded w-3/4 mb-2" style={{ background: "hsl(229, 42%, 22%)" }} />
            <div className="h-3 rounded w-1/2" style={{ background: "hsl(229, 42%, 22%)" }} />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Loader2 size={14} className="animate-spin" style={{ color: "#00F5FF" }} />
          <span className="text-sm" style={{ color: "#00F5FF" }}>Generating {index + 1}/5...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all duration-300"
      style={
        isSelected
          ? { background: "hsl(229, 45%, 16%)", borderColor: "rgba(0,245,255,0.5)", boxShadow: "0 0 20px rgba(0,245,255,0.1)" }
          : { background: "hsl(229, 45%, 16%)", borderColor: "hsl(229, 42%, 28%)" }
      }
    >
      <div className="p-5">
        <div className="flex items-start gap-3">
          <button onClick={onSelect} className="mt-1 flex-shrink-0 transition-transform hover:scale-110" style={{ color: isSelected ? "#00F5FF" : "#A0AED9" }}>
            {isSelected ? <CheckSquare size={17} /> : <Square size={17} />}
          </button>
          <div className="text-2xl flex-shrink-0">{project.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-base" style={{ color: "#FFFFFF" }}>{project.title}</h3>
              <button onClick={() => setExpanded(!expanded)} className="flex-shrink-0 transition-all hover:scale-110" style={{ color: "#A0AED9" }}>
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <DifficultyBadge difficulty={project.difficulty} />
              <span className="flex items-center gap-1 text-xs" style={{ color: "#A0AED9" }}>
                <Clock size={11} /> {project.time}
              </span>
              <span className="text-xs font-bold" style={{ color: "#FFD700" }}>+{project.xp} XP</span>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pl-10 animate-fade-in-up">
            <p className="text-sm mb-3" style={{ color: "#A0AED9" }}>{project.description}</p>
            <div className="mb-4">
              <p className="text-xs font-semibold mb-1.5" style={{ color: "#00F5FF" }}>Required Components:</p>
              <div className="flex flex-wrap gap-1.5">
                {project.components.map((c) => (
                  <span key={c} className="text-xs px-2 py-0.5 rounded-lg" style={{ background: "rgba(0,245,255,0.08)", color: "#00F5FF", border: "1px solid rgba(0,245,255,0.2)" }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={onStart}
              disabled={isStarting}
              className="px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #00F5FF, #0099FF)",
                color: "#0A0E27",
                boxShadow: "0 0 15px rgba(0,245,255,0.3)",
              }}
            >
              {isStarting ? <><Loader2 size={14} className="animate-spin" /> Starting...</> : <><Zap size={14} /> Start This Project</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GeneratePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveProject, projects: userProjects } = useUserProjects();
  const userProjectIds = new Set(userProjects.map(p => p.project_id));
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingStates, setLoadingStates] = useState<boolean[]>([]);
  const [generating, setGenerating] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState("");
  const [difficulty, setDifficulty] = useState("Any Difficulty");
  const [category, setCategory] = useState("Any Category");
  const [components, setComponents] = useState<string[]>(() => getInventoryComponents(user?.id));
  const [newComponent, setNewComponent] = useState("");
  const [previouslyShown, setPreviouslyShown] = useState<Set<number>>(new Set());
  const [communityProjects, setCommunityProjects] = useState<Project[]>([]);
  const [aiRecommending, setAiRecommending] = useState(false);

  // Fetch approved community projects on mount
  useEffect(() => {
    supabase
      .from("community_projects")
      .select("*")
      .then(({ data }) => {
        if (data) {
          // Use a stable unique ID based on the community project's actual UUID hash
          const mapped: Project[] = data.map((p) => {
            // Generate a stable numeric ID from the UUID to avoid collisions
            const hashId = p.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) + 5000;
            return {
              id: hashId,
              emoji: "🌐",
              title: p.title,
              description: p.description,
              difficulty: (p.difficulty as Project["difficulty"]) || "beginner",
              time: p.estimated_time || "30 mins",
              xp: p.difficulty === "advanced" ? 200 : p.difficulty === "intermediate" ? 120 : 75,
              components: p.components || [],
            };
          });
          setCommunityProjects(mapped);
        }
      });
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const removeComponent = (c: string) => {
    setComponents((prev) => prev.filter((x) => x !== c));
    setProjects([]);
    setLoadingStates([]);
    setSelected(new Set());
  };
  const addComponent = () => {
    if (newComponent.trim() && !components.includes(newComponent.trim())) {
      setComponents((prev) => [...prev, newComponent.trim()]);
      setNewComponent("");
      setProjects([]);
      setLoadingStates([]);
      setSelected(new Set());
    }
  };

  const generateProjects = () => {
    setGenerating(true);
    setProjects([]);
    setLoadingStates([true, true, true, true, true]);
    setSelected(new Set());
    setShowAll(false);

    const ownedNorm = components.map(c => c.replace(/ ×\d+$/, "").replace(/\s×\d+/, "").toLowerCase().trim());

    // Combine static pool + community projects
    let pool = [...projectPool, ...communityProjects].sort(() => Math.random() - 0.5);
    if (difficulty !== "Any Difficulty") pool = pool.filter((p) => p.difficulty === difficulty.toLowerCase());

    // Exclude previously shown projects to ensure variety
    const fresh = pool.filter((p) => !previouslyShown.has(p.id));
    const candidates = fresh.length >= 5 ? fresh : pool; // reset if pool exhausted

    // Score by component match, prioritize better matches but allow partial
    const scored = candidates.map((p) => {
      const matchCount = p.components.filter((req) =>
        ownedNorm.some((owned) => owned.includes(req.toLowerCase()) || req.toLowerCase().includes(owned))
      ).length;
      return { ...p, matchScore: p.components.length > 0 ? matchCount / p.components.length : 0 };
    });

    // Sort by best match first, randomize within same score
    const sorted = scored.sort((a, b) => b.matchScore - a.matchScore || Math.random() - 0.5);
    const selected5 = sorted.slice(0, 5);

    if (selected5.length === 0) {
      setGenerating(false);
      setLoadingStates([]);
      showToast("No projects match your components. Try adding more to your inventory!");
      return;
    }

    // Track shown IDs
    setPreviouslyShown((prev) => {
      const next = new Set(prev);
      selected5.forEach((p) => next.add(p.id));
      // Reset if we've shown most of the pool
      if (next.size > pool.length * 0.8) return new Set(selected5.map((p) => p.id));
      return next;
    });

    selected5.forEach((project, i) => {
      setTimeout(() => {
        setProjects((prev) => { const next = [...prev]; next[i] = project; return next; });
        setLoadingStates((prev) => { const next = [...prev]; next[i] = false; return next; });
        if (i === Math.min(selected5.length, 5) - 1) setGenerating(false);
      }, (i + 1) * 800);
    });
  };

  const generateAIRecommendations = async () => {
    if (!user) { navigate("/auth"); return; }
    setAiRecommending(true);
    setProjects([]);
    setLoadingStates([true, true, true, true, true]);
    setSelected(new Set());
    setShowAll(false);

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("level, projects_completed")
        .eq("id", user.id)
        .single();

      const { data, error } = await supabase.functions.invoke("recommend-projects", {
        body: {
          components,
          level: profile?.level || 1,
          projectsCompleted: profile?.projects_completed || 0,
        },
      });

      if (error) throw error;

      if (data?.projects && Array.isArray(data.projects)) {
        const aiProjects: Project[] = data.projects.map((p: any, i: number) => ({
          id: 700 + i + Math.floor(Math.random() * 100),
          emoji: p.emoji || "🤖",
          title: p.title,
          description: p.description,
          difficulty: p.difficulty || "beginner",
          time: p.time || "30 mins",
          xp: p.xp || 75,
          components: p.components || [],
        }));

        aiProjects.forEach((project, i) => {
          setTimeout(() => {
            setProjects(prev => { const next = [...prev]; next[i] = project; return next; });
            setLoadingStates(prev => { const next = [...prev]; next[i] = false; return next; });
            if (i === aiProjects.length - 1) setAiRecommending(false);
          }, (i + 1) * 600);
        });
      } else {
        throw new Error("No projects returned");
      }
    } catch (e: any) {
      console.error("AI recommendation error:", e);
      setAiRecommending(false);
      setLoadingStates([]);
      sonnerToast.error(e?.message || "AI recommendation failed. Try the regular generator instead.");
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const [savingAll, setSavingAll] = useState(false);
  const [startingId, setStartingId] = useState<number | null>(null);

  const handleSave = async () => {
    if (!user) { navigate("/auth"); return; }
    setSavingAll(true);
    await new Promise(r => setTimeout(r, 500));
    const projectsToSave = selected.size > 0 
      ? projects.filter(p => selected.has(p.id))
      : projects.filter(Boolean);
    
    let savedCount = 0;
    for (const p of projectsToSave) {
      const result = await saveProject({
        project_id: p.id,
        emoji: p.emoji,
        title: p.title,
        description: p.description,
        difficulty: p.difficulty,
        time: p.time,
        xp: p.xp,
        components: p.components,
        source: "generate",
      });
      if (result.error) {
        sonnerToast.error("🚫 Project limit reached", {
          description: "You can only have up to 5 projects in your dashboard. Complete or remove a project to start a new one.",
          duration: 5000,
        });
        break;
      }
      savedCount++;
    }
    setSavingAll(false);
    if (savedCount > 0) showToast(`✓ ${savedCount} project${savedCount !== 1 ? "s" : ""} saved to dashboard!`);
  };

  const handleStartProject = async (project: Project) => {
    setStartingId(project.id);
    await new Promise(r => setTimeout(r, 500));
    if (user) {
      const result = await saveProject({
        project_id: project.id,
        emoji: project.emoji,
        title: project.title,
        description: project.description,
        difficulty: project.difficulty,
        time: project.time,
        xp: project.xp,
        components: project.components,
        source: "generate",
      });
      if (result.error) {
        sonnerToast.error("🚫 Project limit reached", {
          description: "You can only have up to 5 projects in your dashboard. Complete or remove a project to start a new one.",
          duration: 5000,
        });
        setStartingId(null);
        return;
      }
    }
    localStorage.setItem("activeGeneratedProject", JSON.stringify(project));
    navigate(`/project/${project.id}`);
  };

  return (
    <Layout>
      <div className="px-6 py-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} style={{ color: "#B744FF" }} />
            <span className="text-xs font-semibold" style={{ color: "#B744FF" }}>AI-Powered Generation</span>
          </div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: "#FFFFFF" }}>Generate Project</h1>
          <p className="text-sm" style={{ color: "#A0AED9" }}>
            Let AI create a custom Arduino project based on your available components
          </p>
        </div>

        {/* Two panel row */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Components Panel */}
          <div className="rounded-2xl border p-5" style={{ background: "hsl(229, 45%, 16%)", borderColor: "hsl(229, 42%, 28%)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,245,255,0.12)" }}>
                <Zap size={14} style={{ color: "#00F5FF" }} />
              </div>
              <span className="font-semibold text-sm" style={{ color: "#FFFFFF" }}>Your Components</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(0,245,255,0.15)", color: "#00F5FF" }}>{components.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3 max-h-32 overflow-y-auto">
              {components.map((c) => (
                <div
                  key={c}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium group"
                  style={{ background: "rgba(255,255,255,0.06)", color: "#E0E7FF", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {c}
                  <button
                    onClick={() => removeComponent(c)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5"
                    style={{ color: "#FF4500" }}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newComponent}
                onChange={(e) => setNewComponent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addComponent()}
                placeholder="Add component..."
                className="flex-1 px-3 py-1.5 rounded-lg text-xs focus:outline-none"
                style={{ background: "hsl(229, 42%, 22%)", border: "1px solid rgba(0,245,255,0.2)", color: "#FFFFFF" }}
              />
              <button
                onClick={addComponent}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                style={{ background: "rgba(0,245,255,0.15)", color: "#00F5FF", border: "1px solid rgba(0,245,255,0.3)" }}
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          <div className="rounded-2xl border p-5" style={{ background: "hsl(229, 45%, 16%)", borderColor: "hsl(229, 42%, 28%)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,215,0,0.12)" }}>
                <Star size={14} style={{ color: "#FFD700" }} />
              </div>
              <span className="font-semibold text-sm" style={{ color: "#FFFFFF" }}>Generation Options</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#A0AED9" }}>Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none appearance-none"
                  style={{ background: "hsl(229, 42%, 22%)", border: "1px solid rgba(255,255,255,0.1)", color: "#FFFFFF" }}
                >
                  <option>Any Difficulty</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "#A0AED9" }}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none appearance-none"
                  style={{ background: "hsl(229, 42%, 22%)", border: "1px solid rgba(255,255,255,0.1)", color: "#FFFFFF" }}
                >
                  <option>Any Category</option>
                  <option>Sensors</option>
                  <option>Displays</option>
                  <option>Motors</option>
                  <option>Communication</option>
                  <option>Audio</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={generateProjects}
            disabled={generating || aiRecommending}
            className="py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.01] disabled:opacity-70"
            style={{
              background: generating ? "rgba(183,68,255,0.3)" : "linear-gradient(135deg, #B744FF, #FF1493, #FF4500)",
              color: "#FFFFFF",
              boxShadow: generating ? "none" : "0 0 30px rgba(183,68,255,0.4)",
            }}
          >
            {generating ? (
              <><Loader2 size={18} className="animate-spin" /> Generating...</>
            ) : (
              <><Zap size={18} /> ✦ Generate Project</>
            )}
          </button>
          <button
            onClick={generateAIRecommendations}
            disabled={generating || aiRecommending}
            className="py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.01] disabled:opacity-70"
            style={{
              background: aiRecommending ? "rgba(0,245,255,0.15)" : "linear-gradient(135deg, #00F5FF, #0099FF, #00FF88)",
              color: aiRecommending ? "#00F5FF" : "#0A0E27",
              boxShadow: aiRecommending ? "none" : "0 0 30px rgba(0,245,255,0.3)",
            }}
          >
            {aiRecommending ? (
              <><Loader2 size={18} className="animate-spin" /> AI Thinking...</>
            ) : (
              <><Brain size={18} /> 🤖 AI Recommend for My Level</>
            )}
          </button>
        </div>

        {/* Action buttons when projects exist */}
        {projects.length > 0 && (
          <div className="flex gap-3 mb-6 flex-wrap">
            <button
              onClick={generateProjects}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all hover:scale-105"
              style={{ borderColor: "rgba(0,245,255,0.4)", color: "#00F5FF" }}
            >
              <RefreshCw size={14} /> Generate Different Ideas
            </button>
            <button
              onClick={handleSave}
              disabled={savingAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: "rgba(255,215,0,0.15)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }}
            >
              {savingAll ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> {selected.size > 0 ? `Save Selected (${selected.size})` : "Save All"}</>}
            </button>
          </div>
        )}

        {/* Progress indicator */}
        {generating && (
          <div className="mb-5 p-4 rounded-xl border" style={{ background: "rgba(0,245,255,0.04)", borderColor: "rgba(0,245,255,0.15)" }}>
            <div className="flex items-center gap-3 mb-2">
              <Loader2 size={14} className="animate-spin" style={{ color: "#00F5FF" }} />
              <span className="text-sm font-semibold" style={{ color: "#00F5FF" }}>
                Generating {Math.min(projects.length + 1, 5)}/5 projects...
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(229, 42%, 22%)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(projects.length / 5) * 100}%`,
                  background: "linear-gradient(90deg, #00F5FF, #B744FF)",
                  boxShadow: "0 0 10px rgba(0,245,255,0.6)",
                }}
              />
            </div>
          </div>
        )}

        {/* Projects list */}
        {(projects.length > 0 || generating) && (
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((i) => {
              if (!showAll && i >= 3) return null;
              if (loadingStates[i] === undefined && !generating) return null;
              return loadingStates[i] ? (
                <ProjectCard key={`loading-${i}`} project={{ id: -i, emoji: "⏳", title: "", difficulty: "beginner", time: "", xp: 0, description: "", components: [] }} index={i} isLoading={true} isSelected={false} onSelect={() => {}} onStart={() => {}} isStarting={false} />
              ) : projects[i] ? (
                <ProjectCard key={`proj-${projects[i].id}`} project={projects[i]} index={i} isLoading={false} isSelected={selected.has(projects[i].id)} onSelect={() => toggleSelect(projects[i].id)} onStart={() => handleStartProject(projects[i])} isStarting={startingId === projects[i].id} />
              ) : null;
            })}

            {projects.length === 5 && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                style={{ background: "rgba(183,68,255,0.08)", border: "1px dashed rgba(183,68,255,0.4)", color: "#B744FF" }}
              >
                <ChevronDown size={18} />
                Show 2 More Projects
              </button>
            )}
          </div>
        )}

        {/* Empty state */}
        {projects.length === 0 && !generating && (
          <div className="text-center py-16 rounded-2xl border" style={{ borderColor: "hsl(229, 42%, 28%)", background: "hsl(229, 45%, 16%)" }}>
            <div className="text-6xl mb-4 animate-float">⚡</div>
            <h3 className="font-bold text-xl mb-2" style={{ color: "#FFFFFF" }}>Ready to Create?</h3>
            <p style={{ color: "#A0AED9" }}>Click Generate to get 5 unique Arduino project ideas!</p>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 px-5 py-3 rounded-xl flex items-center gap-2 font-semibold animate-fade-in-up z-50" style={{ background: "linear-gradient(135deg, #00FF88, #00C853)", color: "#0A0E27", boxShadow: "0 0 20px rgba(0,255,136,0.4)" }}>
          <Star size={16} /> {toast}
        </div>
      )}
    </Layout>
  );
}
