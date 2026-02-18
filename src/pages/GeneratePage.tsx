import { useState, useEffect } from "react";
import { Zap, RefreshCw, Save, CheckSquare, Square, ChevronDown, ChevronUp, Clock, Star, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";

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

const projectTemplates: Project[] = [
  { id: 1, emoji: "💡", title: "Smart LED Mood Lamp", difficulty: "beginner", time: "30 mins", xp: 75, description: "Build a responsive LED lamp that changes color based on ambient light levels, featuring PWM dimming and a photoresistor input for automatic adjustment.", components: ["LED", "Photoresistor", "Arduino Uno", "220Ω Resistor"] },
  { id: 2, emoji: "🌡️", title: "Weather Station Dashboard", difficulty: "intermediate", time: "60 mins", xp: 150, description: "Create a comprehensive weather monitoring system with temperature, humidity, and pressure sensors that logs data to your computer via serial communication.", components: ["DHT22", "BMP180", "LCD Display", "Arduino Mega"] },
  { id: 3, emoji: "🤖", title: "Line-Following Robot", difficulty: "intermediate", time: "90 mins", xp: 200, description: "Program a robot that autonomously follows a black line on white surface using IR sensors and differential motor control with PID algorithm.", components: ["IR Sensors", "Motor Driver L298N", "DC Motors", "Arduino Uno"] },
  { id: 4, emoji: "🔊", title: "Theremin Music Synthesizer", difficulty: "advanced", time: "75 mins", xp: 175, description: "Build a touchless musical instrument using ultrasonic sensors to detect hand distance and generate corresponding musical tones through a piezo buzzer.", components: ["HC-SR04", "Piezo Buzzer", "Arduino Uno", "LED Strip"] },
  { id: 5, emoji: "🌱", title: "Smart Plant Watering System", difficulty: "beginner", time: "45 mins", xp: 100, description: "Automate plant care with a soil moisture sensor that triggers a water pump when plants need watering, with LED status indicators.", components: ["Soil Moisture Sensor", "Water Pump", "Relay Module", "Arduino Uno"] },
];

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const cls = difficulty === "beginner" ? "badge-beginner" : difficulty === "intermediate" ? "badge-intermediate" : "badge-advanced";
  return <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${cls}`}>{difficulty}</span>;
}

function ProjectCard({
  project,
  index,
  isLoading,
  isSelected,
  onSelect,
  onStart,
}: {
  project: Project;
  index: number;
  isLoading: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onStart: () => void;
}) {
  const [expanded, setExpanded] = useState(index < 3);

  if (isLoading) {
    return (
      <div className="card-neon p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-muted" />
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
        <div className="h-3 bg-muted rounded w-full mb-2" />
        <div className="h-3 bg-muted rounded w-4/5" />
        <div className="flex items-center gap-2 mt-4">
          <Loader2 size={14} className="animate-spin" style={{ color: "#00F5FF" }} />
          <span className="text-sm" style={{ color: "#00F5FF" }}>Generating {index + 1}/5...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="card-neon overflow-hidden transition-all duration-300"
      style={isSelected ? { borderColor: "rgba(0,245,255,0.6)", boxShadow: "0 0 20px rgba(0,245,255,0.15)" } : {}}
    >
      <div className="p-5">
        <div className="flex items-start gap-3">
          <button
            onClick={onSelect}
            className="mt-1 flex-shrink-0 transition-transform hover:scale-110"
            style={{ color: isSelected ? "#00F5FF" : "hsl(226, 35%, 72%)" }}
          >
            {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
          </button>

          <div className="text-2xl flex-shrink-0">{project.emoji}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <h3 className="font-bold text-base" style={{ color: "#FFFFFF" }}>{project.title}</h3>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex-shrink-0 transition-transform hover:scale-110"
                style={{ color: "hsl(226, 35%, 72%)" }}
              >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <DifficultyBadge difficulty={project.difficulty} />
              <span className="flex items-center gap-1 text-xs" style={{ color: "hsl(226, 35%, 72%)" }}>
                <Clock size={11} /> {project.time}
              </span>
              <span className="text-xs font-bold" style={{ color: "#FFD700" }}>+{project.xp} XP</span>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pl-9 animate-fade-in-up">
            <p className="text-sm mb-3" style={{ color: "hsl(226, 35%, 72%)" }}>{project.description}</p>

            <div className="mb-4">
              <p className="text-xs font-semibold mb-1.5" style={{ color: "#00F5FF" }}>Required Components:</p>
              <div className="flex flex-wrap gap-1.5">
                {project.components.map((c) => (
                  <span
                    key={c}
                    className="text-xs px-2 py-0.5 rounded-lg"
                    style={{ background: "rgba(0,245,255,0.08)", color: "#00F5FF", border: "1px solid rgba(0,245,255,0.2)" }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <button onClick={onStart} className="btn-neon-teal px-5 py-2 text-sm font-bold flex items-center gap-2">
              <Zap size={14} />
              Start This Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GeneratePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingStates, setLoadingStates] = useState<boolean[]>([]);
  const [generating, setGenerating] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [savedToast, setSavedToast] = useState(false);

  const generateProjects = () => {
    setGenerating(true);
    setProjects([]);
    setLoadingStates([true, true, true, true, true]);
    setSelected(new Set());
    setShowAll(false);

    const shuffled = [...projectTemplates].sort(() => Math.random() - 0.5);

    shuffled.forEach((project, i) => {
      setTimeout(() => {
        setProjects((prev) => {
          const next = [...prev];
          next[i] = project;
          return next;
        });
        setLoadingStates((prev) => {
          const next = [...prev];
          next[i] = false;
          return next;
        });
        if (i === shuffled.length - 1) setGenerating(false);
      }, (i + 1) * 800);
    });
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const displayedProjects = showAll ? projects : projects.slice(0, 3);
  const loadingDisplayed = showAll ? loadingStates : loadingStates.slice(0, 3);

  return (
    <Layout>
      <div className="px-8 py-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: "rgba(0,245,255,0.1)", color: "#00F5FF", border: "1px solid rgba(0,245,255,0.3)" }}
          >
            <Zap size={12} /> AI Project Generator
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: "#FFFFFF" }}>
            Generate <span className="gradient-text-teal">Custom Projects</span>
          </h1>
          <p style={{ color: "hsl(226, 35%, 72%)" }}>
            Our AI will create 5 personalized Arduino projects tailored to your components and skill level.
          </p>
        </div>

        {/* Generate Button */}
        <div className="mb-8 flex gap-3 flex-wrap">
          <button
            onClick={generateProjects}
            disabled={generating}
            className="btn-neon-teal px-6 py-3 text-base font-bold flex items-center gap-2 disabled:opacity-60"
          >
            {generating ? (
              <><Loader2 size={18} className="animate-spin" /> Generating Projects...</>
            ) : (
              <><Zap size={18} /> Generate 5 Projects</>
            )}
          </button>

          {projects.length > 0 && (
            <>
              <button
                onClick={generateProjects}
                className="btn-neon-outline-teal px-5 py-3 text-sm font-bold flex items-center gap-2"
              >
                <RefreshCw size={16} /> Different Ideas
              </button>
              <button
                onClick={handleSave}
                className="btn-neon-gold px-5 py-3 text-sm font-bold flex items-center gap-2"
              >
                <Save size={16} /> {selected.size > 0 ? `Save Selected (${selected.size})` : "Save All"}
              </button>
            </>
          )}
        </div>

        {/* Progress indicator */}
        {generating && (
          <div
            className="mb-6 p-4 rounded-xl border"
            style={{ background: "rgba(0,245,255,0.05)", borderColor: "rgba(0,245,255,0.2)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Loader2 size={16} className="animate-spin" style={{ color: "#00F5FF" }} />
              <span className="text-sm font-semibold" style={{ color: "#00F5FF" }}>
                Generating {Math.min(projects.length + 1, 5)}/5 projects...
              </span>
            </div>
            <div className="progress-neon h-2">
              <div
                className="progress-neon-fill h-full"
                style={{ width: `${(projects.length / 5) * 100}%` }}
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
                <ProjectCard
                  key={i}
                  project={{ id: i, emoji: "⏳", title: "", difficulty: "beginner", time: "", xp: 0, description: "", components: [] }}
                  index={i}
                  isLoading={true}
                  isSelected={false}
                  onSelect={() => {}}
                  onStart={() => {}}
                />
              ) : projects[i] ? (
                <ProjectCard
                  key={projects[i].id}
                  project={projects[i]}
                  index={i}
                  isLoading={false}
                  isSelected={selected.has(projects[i].id)}
                  onSelect={() => toggleSelect(projects[i].id)}
                  onStart={() => {}}
                />
              ) : null;
            })}

            {projects.length === 5 && !showAll && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: "rgba(183,68,255,0.1)",
                  border: "1px dashed rgba(183,68,255,0.4)",
                  color: "#B744FF",
                }}
              >
                <ChevronDown size={18} />
                Show 2 More Projects
              </button>
            )}
          </div>
        )}

        {/* Empty state */}
        {projects.length === 0 && !generating && (
          <div
            className="text-center py-20 rounded-2xl border"
            style={{ borderColor: "hsl(229, 42%, 28%)", background: "hsl(229, 45%, 16%)" }}
          >
            <div className="text-6xl mb-4 animate-float">⚡</div>
            <h3 className="font-bold text-xl mb-2" style={{ color: "#FFFFFF" }}>Ready to Create?</h3>
            <p style={{ color: "hsl(226, 35%, 72%)" }}>Click Generate to get 5 unique Arduino project ideas!</p>
          </div>
        )}
      </div>

      {/* Toast */}
      {savedToast && (
        <div
          className="fixed bottom-6 right-6 px-5 py-3 rounded-xl flex items-center gap-2 font-semibold animate-fade-in-up"
          style={{ background: "linear-gradient(135deg, #00FF88, #00C853)", color: "#0A0E27", boxShadow: "0 0 20px rgba(0,255,136,0.4)" }}
        >
          <Star size={16} /> ✓ Project Saved Successfully!
        </div>
      )}
    </Layout>
  );
}
