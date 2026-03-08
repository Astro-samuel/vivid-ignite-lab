import { useState, useMemo } from "react";
import { Search, Clock, X } from "lucide-react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import FadeInView from "@/components/motion/FadeInView";
import MotionCard from "@/components/motion/MotionCard";
import StaggerContainer, { staggerItem } from "@/components/motion/StaggerContainer";
import { motion } from "framer-motion";

const PROJECTS_PER_LEVEL = 5;

const allProjects = [
  // === BEGINNER ===
  { id: 1, emoji: "💡", title: "LED Blink Tutorial", desc: "The classic 'Hello World' of Arduino — make an LED blink!", difficulty: "beginner", time: "15 mins", xp: 50, tags: ["LED", "GPIO"] },
  { id: 2, emoji: "🌡️", title: "Temperature Monitor", desc: "Read temperature data and display it on your computer.", difficulty: "beginner", time: "30 mins", xp: 75, tags: ["DHT22", "Serial"] },
  { id: 4, emoji: "🌈", title: "RGB LED Mixer", desc: "Mix colors with an RGB LED and potentiometers.", difficulty: "beginner", time: "30 mins", xp: 80, tags: ["LED", "ADC"] },
  { id: 6, emoji: "🔊", title: "Music Synthesizer", desc: "Generate tones and melodies using a piezo buzzer.", difficulty: "beginner", time: "25 mins", xp: 70, tags: ["Piezo", "Tone"] },
  { id: 12, emoji: "🎮", title: "Joystick Game", desc: "Create a simple game controlled by a joystick.", difficulty: "beginner", time: "35 mins", xp: 85, tags: ["Joystick", "Display"] },
  { id: 13, emoji: "🚦", title: "Traffic Light Simulator", desc: "Build a realistic traffic light sequence with LEDs.", difficulty: "beginner", time: "20 mins", xp: 55, tags: ["LED", "Timing"] },
  { id: 14, emoji: "🎹", title: "Piano Keys", desc: "Make a mini piano with push buttons and a buzzer.", difficulty: "beginner", time: "25 mins", xp: 65, tags: ["Button", "Tone"] },
  { id: 15, emoji: "🌙", title: "Night Light", desc: "Auto-on LED when it gets dark using a photoresistor.", difficulty: "beginner", time: "20 mins", xp: 55, tags: ["LDR", "LED"] },

  // === INTERMEDIATE ===
  { id: 3, emoji: "🤖", title: "Servo Motor Control", desc: "Control servo motors for precise movements.", difficulty: "intermediate", time: "45 mins", xp: 100, tags: ["Servo", "PWM"] },
  { id: 5, emoji: "📡", title: "Bluetooth Controller", desc: "Control Arduino wirelessly via Bluetooth from your phone.", difficulty: "intermediate", time: "60 mins", xp: 130, tags: ["HC-05", "Bluetooth"] },
  { id: 7, emoji: "🌱", title: "Plant Watering Bot", desc: "Automate plant care with soil moisture sensing.", difficulty: "intermediate", time: "55 mins", xp: 115, tags: ["Sensor", "Relay"] },
  { id: 8, emoji: "🔐", title: "Digital Lock System", desc: "Build a keypad-based combination lock.", difficulty: "intermediate", time: "70 mins", xp: 140, tags: ["Keypad", "LCD"] },
  { id: 11, emoji: "📊", title: "OLED Display Dashboard", desc: "Display sensor data on a tiny OLED screen.", difficulty: "intermediate", time: "40 mins", xp: 95, tags: ["OLED", "I2C"] },
  { id: 16, emoji: "⏱️", title: "Reaction Timer Game", desc: "Measure your reaction speed with LEDs and a button.", difficulty: "intermediate", time: "40 mins", xp: 90, tags: ["Button", "Timing"] },
  { id: 17, emoji: "🧭", title: "Digital Compass", desc: "Build a compass using an I2C magnetometer module.", difficulty: "intermediate", time: "50 mins", xp: 110, tags: ["I2C", "Sensor"] },
  { id: 18, emoji: "📻", title: "IR Remote Decoder", desc: "Capture and decode signals from any IR remote control.", difficulty: "intermediate", time: "35 mins", xp: 85, tags: ["IR", "Serial"] },

  // === ADVANCED ===
  { id: 9, emoji: "🚗", title: "Obstacle Avoidance Car", desc: "Build a robot car that avoids obstacles autonomously.", difficulty: "advanced", time: "120 mins", xp: 250, tags: ["Ultrasonic", "Motor"] },
  { id: 10, emoji: "🌞", title: "Solar Tracker", desc: "Track the sun position using LDR sensors and servos.", difficulty: "advanced", time: "90 mins", xp: 200, tags: ["LDR", "Servo"] },
  { id: 19, emoji: "🏠", title: "Smart Home Hub", desc: "Control lights and fans via WiFi with an ESP8266 shield.", difficulty: "advanced", time: "100 mins", xp: 220, tags: ["WiFi", "Relay"] },
  { id: 20, emoji: "🤖", title: "Line Following Robot", desc: "Build a robot that follows a black line on the floor.", difficulty: "advanced", time: "110 mins", xp: 230, tags: ["IR Sensor", "Motor"] },
  { id: 21, emoji: "📡", title: "Weather Station", desc: "Log temperature, humidity, and pressure to an SD card.", difficulty: "advanced", time: "95 mins", xp: 210, tags: ["BMP280", "SD Card"] },
  { id: 22, emoji: "🦾", title: "Robotic Arm Controller", desc: "Control a 4-DOF robotic arm with potentiometers.", difficulty: "advanced", time: "130 mins", xp: 260, tags: ["Servo", "Kinematics"] },
  { id: 23, emoji: "🔋", title: "Battery Monitor System", desc: "Monitor and display battery voltage and health status.", difficulty: "advanced", time: "80 mins", xp: 190, tags: ["ADC", "OLED"] },
];

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
  // Changes every 3 hours
  return Math.floor(Date.now() / (3 * 60 * 60 * 1000));
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles =
    difficulty === "beginner"
      ? { background: "rgba(0,255,136,0.15)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)" }
      : difficulty === "intermediate"
      ? { background: "rgba(255,165,0,0.15)", color: "#FFA500", border: "1px solid rgba(255,165,0,0.3)" }
      : { background: "rgba(183,68,255,0.15)", color: "#B744FF", border: "1px solid rgba(183,68,255,0.3)" };
  return <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize" style={styles}>{difficulty}</span>;
}

export default function CatalogPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<string>("all");
  const [removedIds, setRemovedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem("removedCatalogProjects");
    return saved ? JSON.parse(saved) : [];
  });

  const handleRemove = (id: number) => {
    const updated = [...removedIds, id];
    setRemovedIds(updated);
    localStorage.setItem("removedCatalogProjects", JSON.stringify(updated));
  };

  // Pick 5 per level, shuffled by time seed
  const visibleProjects = useMemo(() => {
    const seed = getTimeSeed();
    const levels = ["beginner", "intermediate", "advanced"] as const;
    const result: typeof allProjects = [];

    for (const level of levels) {
      const pool = allProjects.filter((p) => p.difficulty === level && !removedIds.includes(p.id));
      const shuffled = seededShuffle(pool, seed + level.length);
      result.push(...shuffled.slice(0, PROJECTS_PER_LEVEL));
    }

    return result;
  }, [removedIds]);

  const filtered = visibleProjects.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchDiff = diffFilter === "all" || p.difficulty === diffFilter;
    return matchSearch && matchDiff;
  });

  const levels = ["beginner", "intermediate", "advanced"];
  const levelLabels: Record<string, string> = { beginner: "🟢 Beginner", intermediate: "🟡 Intermediate", advanced: "🟣 Advanced" };

  return (
    <Layout>
      <div className="px-8 py-10 max-w-6xl mx-auto">
        {/* Header */}
        <FadeInView className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "hsl(var(--foreground))" }}>
            Project <span className="gradient-text-teal">Catalog</span>
          </h1>
          <p style={{ color: "hsl(var(--muted-foreground))" }}>
            {filtered.length} projects shown • Refreshes every few hours
          </p>
        </FadeInView>

        {/* Filters */}
        <FadeInView delay={0.1} className="flex gap-3 mb-8 flex-wrap">
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
                    ? { background: "rgba(0,245,255,0.15)", color: "#00F5FF", border: "1px solid rgba(0,245,255,0.4)" }
                    : { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }
                }
              >
                {d}
              </button>
            ))}
          </div>
        </FadeInView>

        {/* Grouped by level */}
        {levels
          .filter((lvl) => diffFilter === "all" || diffFilter === lvl)
          .map((lvl) => {
            const levelProjects = filtered.filter((p) => p.difficulty === lvl);
            if (levelProjects.length === 0) return null;
            return (
              <div key={lvl} className="mb-10">
                <FadeInView>
                  <h2 className="text-lg font-bold mb-4" style={{ color: "hsl(var(--foreground))" }}>
                    {levelLabels[lvl]}
                  </h2>
                </FadeInView>
                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {levelProjects.map((p, i) => (
                    <motion.div key={p.id} variants={staggerItem}>
                      <MotionCard
                        className="card-neon p-4 cursor-pointer group relative"
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemove(p.id); }}
                          className="absolute top-2 right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                          style={{ background: "rgba(255,80,80,0.15)", color: "#FF5050", border: "1px solid rgba(255,80,80,0.3)" }}
                          title="Remove project"
                        >
                          <X size={12} />
                        </button>
                        <div className="text-2xl mb-2">{p.emoji}</div>
                        <h3 className="font-bold text-sm mb-1" style={{ color: "hsl(var(--foreground))" }}>{p.title}</h3>
                        <p className="text-xs mb-3 line-clamp-2" style={{ color: "hsl(var(--muted-foreground))" }}>{p.desc}</p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {p.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{ background: "rgba(183,68,255,0.1)", color: "#B744FF", border: "1px solid rgba(183,68,255,0.2)" }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
                          <span className="flex items-center gap-1"><Clock size={10} /> {p.time}</span>
                          <span className="font-bold" style={{ color: "#FFD700" }}>+{p.xp} XP</span>
                        </div>

                        <button
                          onClick={() => {
                            localStorage.setItem("activeGeneratedProject", JSON.stringify({
                              id: p.id,
                              emoji: p.emoji,
                              title: p.title,
                              description: p.desc,
                              difficulty: p.difficulty,
                              time: p.time,
                              xp: p.xp,
                              components: p.tags,
                              source: "catalog",
                            }));
                            navigate(`/project/${p.id}`);
                          }}
                          className="w-full py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-[1.02]"
                          style={{ background: "linear-gradient(135deg, #00F5FF, #0099FF)", color: "#0A0E27", boxShadow: "0 0 12px rgba(0,245,255,0.25)" }}
                        >
                          View Project
                        </button>
                      </MotionCard>
                    </motion.div>
                  ))}
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
