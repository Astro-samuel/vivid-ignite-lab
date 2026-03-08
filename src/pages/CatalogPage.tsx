import { useState } from "react";
import { Search, Clock, X } from "lucide-react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";

const MAX_PROJECTS = 5;

const allProjects = [
  { id: 1, emoji: "💡", title: "LED Blink Tutorial", desc: "The classic 'Hello World' of Arduino - make an LED blink!", difficulty: "beginner", time: "15 mins", xp: 50, tags: ["LED", "GPIO"] },
  { id: 2, emoji: "🌡️", title: "Temperature Monitor", desc: "Read temperature data and display it on your computer.", difficulty: "beginner", time: "30 mins", xp: 75, tags: ["DHT22", "Serial"] },
  { id: 3, emoji: "🤖", title: "Servo Motor Control", desc: "Control servo motors for precise movements.", difficulty: "intermediate", time: "45 mins", xp: 100, tags: ["Servo", "PWM"] },
  { id: 4, emoji: "🌈", title: "RGB LED Mixer", desc: "Mix colors with an RGB LED and potentiometers.", difficulty: "beginner", time: "30 mins", xp: 80, tags: ["LED", "ADC"] },
  { id: 5, emoji: "📡", title: "Bluetooth Controller", desc: "Control Arduino wirelessly via Bluetooth from your phone.", difficulty: "intermediate", time: "60 mins", xp: 130, tags: ["HC-05", "Bluetooth"] },
  { id: 6, emoji: "🔊", title: "Music Synthesizer", desc: "Generate tones and melodies using a piezo buzzer.", difficulty: "beginner", time: "25 mins", xp: 70, tags: ["Piezo", "Tone"] },
  { id: 7, emoji: "🌱", title: "Plant Watering Bot", desc: "Automate plant care with soil moisture sensing.", difficulty: "intermediate", time: "55 mins", xp: 115, tags: ["Sensor", "Relay"] },
  { id: 8, emoji: "🔐", title: "Digital Lock System", desc: "Build a keypad-based combination lock.", difficulty: "intermediate", time: "70 mins", xp: 140, tags: ["Keypad", "LCD"] },
  { id: 9, emoji: "🚗", title: "Obstacle Avoidance Car", desc: "Build a robot car that avoids obstacles autonomously.", difficulty: "advanced", time: "120 mins", xp: 250, tags: ["Ultrasonic", "Motor"] },
  { id: 10, emoji: "🌞", title: "Solar Tracker", desc: "Track the sun position using LDR sensors and servos.", difficulty: "advanced", time: "90 mins", xp: 200, tags: ["LDR", "Servo"] },
  { id: 11, emoji: "📊", title: "OLED Display Dashboard", desc: "Display sensor data on a tiny OLED screen.", difficulty: "intermediate", time: "40 mins", xp: 95, tags: ["OLED", "I2C"] },
  { id: 12, emoji: "🎮", title: "Joystick Game", desc: "Create a simple game controlled by a joystick.", difficulty: "beginner", time: "35 mins", xp: 85, tags: ["Joystick", "Display"] },
];

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

  const visibleProjects = allProjects.filter((p) => !removedIds.includes(p.id)).slice(0, MAX_PROJECTS);

  const filtered = visibleProjects.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchDiff = diffFilter === "all" || p.difficulty === diffFilter;
    return matchSearch && matchDiff;
  });

  return (
    <Layout>
      <div className="px-8 py-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#FFFFFF" }}>
            Project <span className="gradient-text-teal">Catalog</span>
          </h1>
          <p style={{ color: "hsl(226, 35%, 72%)" }}>{visibleProjects.length} of {MAX_PROJECTS} projects shown</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(226, 35%, 60%)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects or components..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{
                background: "hsl(229, 45%, 16%)",
                border: "1px solid hsl(229, 42%, 28%)",
                color: "#FFFFFF",
              }}
            />
          </div>

          {/* Difficulty filter */}
          <div className="flex gap-2">
            {["all", "beginner", "intermediate", "advanced"].map((d) => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className="px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
                style={
                  diffFilter === d
                    ? { background: "rgba(0,245,255,0.15)", color: "#00F5FF", border: "1px solid rgba(0,245,255,0.4)" }
                    : { background: "hsl(229, 45%, 16%)", color: "hsl(226, 35%, 72%)", border: "1px solid hsl(229, 42%, 28%)" }
                }
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <div
              key={p.id}
              className="card-neon p-5 cursor-pointer group"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="text-3xl mb-3 animate-float" style={{ animationDelay: `${i * 0.3}s` }}>
                {p.emoji}
              </div>
              <h3 className="font-bold mb-2" style={{ color: "#FFFFFF" }}>{p.title}</h3>
              <p className="text-sm mb-4 line-clamp-2" style={{ color: "hsl(226, 35%, 72%)" }}>{p.desc}</p>

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <DifficultyBadge difficulty={p.difficulty} />
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-lg"
                    style={{ background: "rgba(183,68,255,0.1)", color: "#B744FF", border: "1px solid rgba(183,68,255,0.2)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs mb-4" style={{ color: "hsl(226, 35%, 72%)" }}>
                <span className="flex items-center gap-1"><Clock size={11} /> {p.time}</span>
                <span className="font-bold" style={{ color: "#FFD700" }}>+{p.xp} XP</span>
              </div>

              <button
                onClick={() => navigate(`/project/${p.id}`)}
                className="w-full py-2 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #00F5FF, #0099FF)", color: "#0A0E27", boxShadow: "0 0 12px rgba(0,245,255,0.25)" }}
              >
                View Project
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-semibold mb-1" style={{ color: "#FFFFFF" }}>No projects found</p>
            <p style={{ color: "hsl(226, 35%, 72%)" }}>Try different search terms or filters</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
