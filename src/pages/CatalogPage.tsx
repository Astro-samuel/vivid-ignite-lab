import { useState, useMemo, useEffect } from "react";
import { Search, Clock, X, Filter, Tag, Lock } from "lucide-react";
import { PROJECT_SKILLS, SKILL_COLORS } from "@/lib/skillMapping";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import FadeInView from "@/components/motion/FadeInView";
import MotionCard from "@/components/motion/MotionCard";
import StaggerContainer, { staggerItem } from "@/components/motion/StaggerContainer";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast as sonnerToast } from "sonner";
import { useUserProjects } from "@/hooks/useUserProjects";

const PROJECTS_PER_LEVEL = 5;

// Level requirements for each difficulty tier
const LEVEL_REQUIREMENTS: Record<string, { level: number; xp: number }> = {
  beginner: { level: 1, xp: 0 },
  intermediate: { level: 2, xp: 200 },
  advanced: { level: 3, xp: 500 },
};

const allProjects = [
  // === BEGINNER ===
  { id: 1, emoji: "💡", title: "LED Blink Tutorial", desc: "The classic 'Hello World' of Arduino — make an LED blink!", difficulty: "beginner", time: "15 mins", xp: 50, tags: ["LED", "GPIO"], components: ["LED (Red)", "Arduino Uno", "Resistor (220Ω)", "Breadboard"], cost: 5 },
  { id: 2, emoji: "🌡️", title: "Temperature Monitor", desc: "Read temperature data and display it on your computer.", difficulty: "beginner", time: "30 mins", xp: 75, tags: ["DHT22", "Serial"], components: ["Temperature Sensor (DHT22)", "Arduino Uno", "Breadboard", "Jumper Wires"], cost: 8 },
  { id: 4, emoji: "🌈", title: "RGB LED Mixer", desc: "Mix colors with an RGB LED and potentiometers.", difficulty: "beginner", time: "30 mins", xp: 80, tags: ["LED", "ADC"], components: ["RGB LED", "Potentiometer", "Arduino Uno", "Resistor (220Ω)"], cost: 7 },
  { id: 6, emoji: "🔊", title: "Music Synthesizer", desc: "Generate tones and melodies using a piezo buzzer.", difficulty: "beginner", time: "25 mins", xp: 70, tags: ["Piezo", "Tone"], components: ["Buzzer", "Push Button", "Arduino Uno", "Breadboard"], cost: 5 },
  { id: 12, emoji: "🎮", title: "Joystick Game", desc: "Create a simple game controlled by a joystick.", difficulty: "beginner", time: "35 mins", xp: 85, tags: ["Joystick", "Display"], components: ["Potentiometer", "16x2 LCD", "Arduino Uno", "Breadboard"], cost: 12 },
  { id: 13, emoji: "🚦", title: "Traffic Light Simulator", desc: "Build a realistic traffic light sequence with LEDs.", difficulty: "beginner", time: "20 mins", xp: 55, tags: ["LED", "Timing"], components: ["LED (Red)", "LED (Green)", "Arduino Uno", "Resistor (220Ω)"], cost: 4 },
  { id: 14, emoji: "🎹", title: "Piano Keys", desc: "Make a mini piano with push buttons and a buzzer.", difficulty: "beginner", time: "25 mins", xp: 65, tags: ["Button", "Tone"], components: ["Push Button", "Buzzer", "Arduino Uno", "Breadboard"], cost: 5 },
  { id: 15, emoji: "🌙", title: "Night Light", desc: "Auto-on LED when it gets dark using a photoresistor.", difficulty: "beginner", time: "20 mins", xp: 55, tags: ["LDR", "LED"], components: ["LED (Red)", "Photoresistor (LDR)", "Arduino Uno", "Resistor (10kΩ)"], cost: 5 },

  // === INTERMEDIATE ===
  { id: 3, emoji: "🤖", title: "Servo Motor Control", desc: "Control servo motors for precise movements.", difficulty: "intermediate", time: "45 mins", xp: 100, tags: ["Servo", "PWM", "robotics"], components: ["Servo Motor (SG90)", "Potentiometer", "Arduino Uno", "Breadboard"], cost: 10 },
  { id: 5, emoji: "📡", title: "Bluetooth Controller", desc: "Control Arduino wirelessly via Bluetooth from your phone.", difficulty: "intermediate", time: "60 mins", xp: 130, tags: ["HC-05", "Bluetooth", "IoT"], components: ["HC-05 Bluetooth", "LED (Red)", "Arduino Uno", "Breadboard"], cost: 15 },
  { id: 7, emoji: "🌱", title: "Plant Watering Bot", desc: "Automate plant care with soil moisture sensing.", difficulty: "intermediate", time: "55 mins", xp: 115, tags: ["Sensor", "Relay", "automation"], components: ["Soil Moisture Sensor", "Relay Module", "Water Pump", "Arduino Uno"], cost: 18 },
  { id: 8, emoji: "🔐", title: "Digital Lock System", desc: "Build a keypad-based combination lock.", difficulty: "intermediate", time: "70 mins", xp: 140, tags: ["Keypad", "LCD", "security"], components: ["Push Button", "16x2 LCD", "Servo Motor (SG90)", "Arduino Uno"], cost: 15 },
  { id: 11, emoji: "📊", title: "OLED Display Dashboard", desc: "Display sensor data on a tiny OLED screen.", difficulty: "intermediate", time: "40 mins", xp: 95, tags: ["OLED", "I2C"], components: ["OLED Display (0.96\")", "Temperature Sensor (DHT11)", "Arduino Uno", "Breadboard"], cost: 12 },
  { id: 16, emoji: "⏱️", title: "Reaction Timer Game", desc: "Measure your reaction speed with LEDs and a button.", difficulty: "intermediate", time: "40 mins", xp: 90, tags: ["Button", "Timing", "gaming"], components: ["LED (Red)", "Push Button", "16x2 LCD", "Arduino Uno"], cost: 10 },
  { id: 17, emoji: "🧭", title: "Digital Compass", desc: "Build a compass using an I2C magnetometer module.", difficulty: "intermediate", time: "50 mins", xp: 110, tags: ["I2C", "Sensor"], components: ["OLED Display (0.96\")", "Arduino Uno", "Breadboard", "Jumper Wires"], cost: 14 },
  { id: 18, emoji: "📻", title: "IR Remote Decoder", desc: "Capture and decode signals from any IR remote control.", difficulty: "intermediate", time: "35 mins", xp: 85, tags: ["IR", "Serial"], components: ["IR Sensor", "Arduino Uno", "Breadboard", "Jumper Wires"], cost: 8 },

  // === ADVANCED ===
  { id: 9, emoji: "🚗", title: "Obstacle Avoidance Car", desc: "Build a robot car that avoids obstacles autonomously.", difficulty: "advanced", time: "120 mins", xp: 250, tags: ["Ultrasonic", "Motor", "robotics"], components: ["Ultrasonic Sensor (HC-SR04)", "Motor Driver (L298N)", "DC Motor", "Arduino Uno"], cost: 35 },
  { id: 10, emoji: "🌞", title: "Solar Tracker", desc: "Track the sun position using LDR sensors and servos.", difficulty: "advanced", time: "90 mins", xp: 200, tags: ["LDR", "Servo", "automation"], components: ["Photoresistor (LDR)", "Servo Motor (SG90)", "Arduino Uno", "Breadboard"], cost: 20 },
  { id: 19, emoji: "🏠", title: "Smart Home Hub", desc: "Control lights and fans via WiFi with an ESP8266 shield.", difficulty: "advanced", time: "100 mins", xp: 220, tags: ["WiFi", "Relay", "IoT"], components: ["ESP8266", "Relay Module", "LED (Red)", "Arduino Uno"], cost: 25 },
  { id: 20, emoji: "🤖", title: "Line Following Robot", desc: "Build a robot that follows a black line on the floor.", difficulty: "advanced", time: "110 mins", xp: 230, tags: ["IR Sensor", "Motor", "robotics"], components: ["IR Sensor", "Motor Driver (L298N)", "DC Motor", "Arduino Uno"], cost: 30 },
  { id: 21, emoji: "📡", title: "Weather Station", desc: "Log temperature, humidity, and pressure to an SD card.", difficulty: "advanced", time: "95 mins", xp: 210, tags: ["BMP280", "SD Card", "data"], components: ["BMP180 (Pressure)", "SD Card Module", "Arduino Uno", "Breadboard"], cost: 22 },
  { id: 22, emoji: "🦾", title: "Robotic Arm Controller", desc: "Control a 4-DOF robotic arm with potentiometers.", difficulty: "advanced", time: "130 mins", xp: 260, tags: ["Servo", "Kinematics", "robotics"], components: ["Servo Motor (SG90)", "Potentiometer", "Arduino Mega", "Breadboard"], cost: 40 },
  { id: 23, emoji: "🔋", title: "Battery Monitor System", desc: "Monitor and display battery voltage and health status.", difficulty: "advanced", time: "80 mins", xp: 190, tags: ["ADC", "OLED", "data"], components: ["OLED Display (0.96\")", "Arduino Uno", "Resistor (10kΩ)", "Breadboard"], cost: 15 },
];

// All unique tags from projects
const allTags = [...new Set(allProjects.flatMap(p => p.tags))].sort();

// Seeded shuffle that changes every 3 hours
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getTimeSeed(): number {
  // Changes once per day (midnight UTC)
  return Math.floor(Date.now() / (24 * 60 * 60 * 1000));
}

function getInventoryComponents(userId?: string): string[] {
  try {
    const key = userId ? `inventory_${userId}` : "userInventory";
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch { return []; }
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles =
    difficulty === "beginner"
      ? { background: "hsl(var(--success) / 0.15)", color: "hsl(var(--success))", border: "1px solid hsl(var(--success) / 0.3)" }
      : difficulty === "intermediate"
      ? { background: "hsl(var(--secondary) / 0.15)", color: "hsl(var(--secondary))", border: "1px solid hsl(var(--secondary) / 0.3)" }
      : { background: "hsl(var(--purple) / 0.15)", color: "hsl(var(--purple))", border: "1px solid hsl(var(--purple) / 0.3)" };
  return <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize" style={styles}>{difficulty}</span>;
}

const costRanges = [
  { label: "All", min: 0, max: Infinity },
  { label: "Under $10", min: 0, max: 10 },
  { label: "$10–$20", min: 10, max: 20 },
  { label: "$20+", min: 20, max: Infinity },
];

export default function CatalogPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects: userProjects } = useUserProjects();
  const userProjectIds = useMemo(() => new Set(userProjects.map(p => p.project_id)), [userProjects]);
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [costFilter, setCostFilter] = useState(0); // index into costRanges
  const [componentFilter, setComponentFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [removedIds, setRemovedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem("removedCatalogProjects");
    return saved ? JSON.parse(saved) : [];
  });
  const [userLevel, setUserLevel] = useState(1);
  const [userXp, setUserXp] = useState(0);

  // Fetch user profile for level/XP and experience from onboarding
  const userExperience = useMemo(() => {
    if (!user) return "none";
    return localStorage.getItem(`experience_${user.id}`) || "none";
  }, [user]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("level, total_xp").eq("id", user.id).single()
      .then(({ data }) => {
        if (data) {
          setUserLevel(data.level ?? 1);
          setUserXp(data.total_xp ?? 0);
        }
      });
  }, [user]);

  // Experience-based minimum unlock: "some" → intermediate, "experienced" → advanced
  const effectiveLevel = useMemo(() => {
    let base = userLevel;
    if (userExperience === "some" && base < 2) base = 2;
    if (userExperience === "experienced" && base < 3) base = 3;
    return base;
  }, [userLevel, userExperience]);

  const isLocked = (difficulty: string) => {
    const req = LEVEL_REQUIREMENTS[difficulty];
    if (!req) return false;
    return effectiveLevel < req.level;
  };

  const inventory = useMemo(() => getInventoryComponents(user?.id), [user?.id]);

  const getLockMessage = (difficulty: string) => {
    const req = LEVEL_REQUIREMENTS[difficulty];
    if (!req) return "";
    if (effectiveLevel < req.level) return `🔒 Unlock at Level ${req.level} (${req.xp} XP required)`;
    return "";
  };

  const handleRemove = (id: number) => {
    const updated = [...removedIds, id];
    setRemovedIds(updated);
    localStorage.setItem("removedCatalogProjects", JSON.stringify(updated));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  };

  // Pick 5 per level, shuffled by seed that changes based on user's saved projects
  // This ensures different projects appear when user adds projects to dashboard
  const visibleProjects = useMemo(() => {
    // Create a seed that incorporates both time and user's project count
    // This makes the selection change whenever user saves a new project
    const timeSeed = getTimeSeed();
    const userProjectSeed = userProjectIds.size * 7919; // Prime multiplier for variety
    const combinedSeed = timeSeed + userProjectSeed;
    
    const levels = ["beginner", "intermediate", "advanced"] as const;
    const result: typeof allProjects = [];

    for (const level of levels) {
      // Exclude ALL projects already in user's dashboard (both active and completed)
      const pool = allProjects.filter((p) => 
        p.difficulty === level && 
        !removedIds.includes(p.id) && 
        !userProjectIds.has(p.id)
      );
      const shuffled = seededShuffle(pool, combinedSeed + level.length);
      result.push(...shuffled.slice(0, PROJECTS_PER_LEVEL));
    }

    return result;
  }, [removedIds, userProjectIds]);

  const filtered = visibleProjects.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchDiff = diffFilter === "all" || p.difficulty === diffFilter;
    const matchTags = selectedTags.size === 0 || p.tags.some(t => selectedTags.has(t));
    const range = costRanges[costFilter];
    const matchCost = p.cost >= range.min && p.cost < range.max;
    const matchComponent = !componentFilter || p.components.some(c => c.toLowerCase().includes(componentFilter.toLowerCase()));
    return matchSearch && matchDiff && matchTags && matchCost && matchComponent;
  });

  // Check which projects the user can build with current inventory
  const inventoryNorm = inventory.map(c => c.toLowerCase().trim());
  const canBuild = (project: typeof allProjects[0]) =>
    project.components.every(req => inventoryNorm.some(owned => owned.includes(req.toLowerCase()) || req.toLowerCase().includes(owned)));

  const levels = ["beginner", "intermediate", "advanced"];
  const levelLabels: Record<string, string> = { beginner: "🟢 Beginner", intermediate: "🟡 Intermediate", advanced: "🟣 Advanced" };

  const activeFilterCount = (selectedTags.size > 0 ? 1 : 0) + (costFilter > 0 ? 1 : 0) + (componentFilter ? 1 : 0);

  return (
    <Layout>
      <div className="px-8 py-10 max-w-6xl mx-auto">
        {/* Header */}
        <FadeInView className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "hsl(var(--foreground))" }}>
            Project <span className="gradient-text-teal">Catalog</span>
          </h1>
          <p style={{ color: "hsl(var(--muted-foreground))" }}>
            {filtered.length} projects shown • Refreshes daily
          </p>
        </FadeInView>

        {/* Search + Difficulty + Filter Toggle */}
        <FadeInView delay={0.1} className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--muted-foreground))" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects or components..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{
                background: "hsl(var(--muted))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
            />
          </div>

          <div className="flex gap-2">
            {["all", "beginner", "intermediate", "advanced"].map((d) => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className="px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
                style={
                  diffFilter === d
                    ? { background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.4)" }
                    : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
                }
              >
                {d}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
            style={
              showFilters || activeFilterCount > 0
                ? { background: "hsl(var(--purple) / 0.15)", color: "hsl(var(--purple))", border: "1px solid hsl(var(--purple) / 0.4)" }
                : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
            }
          >
            <Filter size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold" style={{ background: "hsl(var(--purple))", color: "hsl(var(--foreground))" }}>
                {activeFilterCount}
              </span>
            )}
          </button>
        </FadeInView>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="rounded-2xl border p-5 space-y-4" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
                {/* Component Filter */}
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "hsl(var(--primary))" }}>
                    Filter by Component
                  </label>
                  <input
                    value={componentFilter}
                    onChange={(e) => setComponentFilter(e.target.value)}
                    placeholder="e.g. servo, LCD, DHT..."
                    className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                    style={{
                      background: "hsl(var(--muted))",
                      border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: "hsl(var(--purple))" }}>
                    <Tag size={12} /> Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all"
                        style={
                          selectedTags.has(tag)
                            ? { background: "hsl(var(--purple) / 0.2)", color: "hsl(var(--purple))", border: "1px solid hsl(var(--purple) / 0.4)" }
                            : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
                        }
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimated Cost */}
                <div>
                  <label className="text-xs font-semibold mb-2 block" style={{ color: "hsl(var(--secondary))" }}>
                    Estimated Cost
                  </label>
                  <div className="flex gap-2">
                    {costRanges.map((range, i) => (
                      <button
                        key={range.label}
                        onClick={() => setCostFilter(i)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                        style={
                          costFilter === i
                            ? { background: "hsl(var(--secondary) / 0.15)", color: "hsl(var(--secondary))", border: "1px solid hsl(var(--secondary) / 0.4)" }
                            : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
                        }
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear filters */}
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => { setSelectedTags(new Set()); setCostFilter(0); setComponentFilter(""); }}
                    className="text-xs font-semibold flex items-center gap-1.5 transition-all hover:opacity-80"
                    style={{ color: "hsl(var(--destructive))" }}
                  >
                    <X size={12} /> Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grouped by level */}
        {levels
          .filter((lvl) => diffFilter === "all" || diffFilter === lvl)
          .map((lvl) => {
            const levelProjects = filtered.filter((p) => p.difficulty === lvl);
            if (levelProjects.length === 0) return null;
            const locked = isLocked(lvl);
            const lockMsg = getLockMessage(lvl);
            return (
              <div key={lvl} className="mb-10">
                <FadeInView>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>
                      {levelLabels[lvl]}
                    </h2>
                    {locked && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5"
                        style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}>
                        <Lock size={10} /> {lockMsg}
                      </span>
                    )}
                  </div>
                </FadeInView>
                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {levelProjects.map((p) => {
                    const buildable = canBuild(p);
                    return (
                      <motion.div key={p.id} variants={staggerItem}>
                        <MotionCard className={`card-neon p-4 group relative ${locked ? "cursor-not-allowed" : "cursor-pointer"}`}>
                          {/* Lock overlay */}
                          {locked && (
                            <div className="absolute inset-0 z-10 rounded-2xl flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]"
                              style={{ background: "hsl(var(--background) / 0.7)" }}>
                              <Lock size={24} style={{ color: "hsl(var(--muted-foreground))" }} />
                              <span className="text-xs font-bold text-center px-3" style={{ color: "hsl(var(--muted-foreground))" }}>
                                Unlock at Level {LEVEL_REQUIREMENTS[p.difficulty]?.level}
                              </span>
                              <span className="text-xs" style={{ color: "hsl(var(--muted-foreground) / 0.7)" }}>
                                Requires {LEVEL_REQUIREMENTS[p.difficulty]?.xp} XP
                              </span>
                            </div>
                          )}

                          {!locked && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRemove(p.id); }}
                              className="absolute top-2 right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                              style={{ background: "hsl(var(--destructive) / 0.15)", color: "hsl(var(--destructive))", border: "1px solid hsl(var(--destructive) / 0.3)" }}
                              title="Remove project"
                            >
                              <X size={12} />
                            </button>
                          )}

                          {/* Buildable badge */}
                          {buildable && !locked && !isCompleted && (
                            <div className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "hsl(var(--success) / 0.15)", color: "hsl(var(--success))", border: "1px solid hsl(var(--success) / 0.3)" }}>
                              ✓ Can Build
                            </div>
                          )}

                          <div className={`text-2xl mb-2 ${buildable && !locked ? "mt-5" : ""}`}>{p.emoji}</div>
                          <h3 className="font-bold text-sm mb-1" style={{ color: "hsl(var(--foreground))" }}>{p.title}</h3>
                          <p className="text-xs mb-3 line-clamp-2" style={{ color: "hsl(var(--muted-foreground))" }}>{p.desc}</p>

                          {/* Skills */}
                          {PROJECT_SKILLS[p.id] && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {PROJECT_SKILLS[p.id].map((skill) => (
                                <span
                                  key={skill}
                                  className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                                  style={{
                                    background: `${SKILL_COLORS[skill]}18`,
                                    color: SKILL_COLORS[skill],
                                    border: `1px solid ${SKILL_COLORS[skill]}33`,
                                  }}
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-1 mb-3">
                            {p.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-1.5 py-0.5 rounded"
                                style={{ background: "hsl(var(--purple) / 0.1)", color: "hsl(var(--purple))", border: "1px solid hsl(var(--purple) / 0.2)" }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-xs mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                            <span className="flex items-center gap-1"><Clock size={10} /> {p.time}</span>
                            <span className="font-bold" style={{ color: "hsl(var(--secondary))" }}>+{p.xp} XP</span>
                          </div>
                          <div className="text-xs mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
                            ~${p.cost} in parts
                          </div>

                          <button
                            disabled={locked}
                            onClick={() => {
                              if (locked) {
                                sonnerToast.error("🔒 Project Locked", {
                                  description: `Complete more projects to reach Level ${LEVEL_REQUIREMENTS[p.difficulty]?.level} and unlock ${p.difficulty} projects.`,
                                  duration: 4000,
                                });
                                return;
                              }
                              localStorage.setItem("activeGeneratedProject", JSON.stringify({
                                id: p.id,
                                emoji: p.emoji,
                                title: p.title,
                                description: p.desc,
                                difficulty: p.difficulty,
                                time: p.time,
                                xp: p.xp,
                                components: p.components,
                                source: "catalog",
                              }));
                              navigate(`/project/${p.id}`);
                            }}
                            className="w-full py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                            style={locked
                              ? { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
                              : isCompleted
                              ? { background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.3)" }
                              : { background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-deep)))", color: "hsl(var(--primary-foreground))", boxShadow: "0 0 12px hsl(var(--primary) / 0.25)" }
                            }
                          >
                            {locked ? "Locked" : isCompleted ? "✓ Completed" : "View Project"}
                          </button>
                        </MotionCard>
                      </motion.div>
                    );
                  })}
                </StaggerContainer>
              </div>
            );
          })}

        {filtered.length === 0 && (
          <FadeInView className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-semibold mb-1" style={{ color: "hsl(var(--foreground))" }}>No projects found</p>
            <p style={{ color: "hsl(var(--muted-foreground))" }}>Try different search terms or filters</p>
          </FadeInView>
        )}
      </div>
    </Layout>
  );
}
