import { useState } from "react";
import { Lightbulb, Zap, RefreshCw, Loader2, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";

const bigIdeas = [
  {
    id: 1, emoji: "🛸", title: "Autonomous Drone Navigation System",
    desc: "Build a drone that autonomously maps indoor environments using LIDAR and computer vision, creating real-time 3D maps.",
    tags: ["LIDAR", "Computer Vision", "IMU", "ESP32"], level: "Expert", impact: "Revolutionary",
  },
  {
    id: 2, emoji: "🧬", title: "Biometric Smart Home Hub",
    desc: "Create a home automation system that recognizes residents by fingerprint and voice, auto-adjusting lighting, temperature, and security.",
    tags: ["Fingerprint Sensor", "Voice Recognition", "Smart Home", "Raspberry Pi"], level: "Advanced", impact: "Life-Changing",
  },
  {
    id: 3, emoji: "🌊", title: "Ocean Pollution Monitor Buoy",
    desc: "Deploy a self-powered floating sensor that tracks water quality, pH, temperature, and sends data via LoRa to a cloud dashboard.",
    tags: ["pH Sensor", "LoRa", "Solar Panel", "GPS"], level: "Advanced", impact: "Environmental",
  },
  {
    id: 4, emoji: "🧠", title: "Brain-Computer Interface Prototype",
    desc: "Build a basic EEG headset that reads brainwave patterns and controls a simple game using neural signals.",
    tags: ["EEG Sensor", "Signal Processing", "BLE", "ML"], level: "Expert", impact: "Future Tech",
  },
  {
    id: 5, emoji: "🌿", title: "AI-Powered Vertical Farm",
    desc: "Design an automated vertical farm that uses machine learning to optimize nutrient levels, lighting schedules, and harvesting.",
    tags: ["pH Sensor", "Grow Lights", "Camera", "AI"], level: "Advanced", impact: "Sustainable",
  },
];

const impactColors: Record<string, string> = {
  Revolutionary: "#FF1493",
  "Life-Changing": "#B744FF",
  Environmental: "#00FF88",
  "Future Tech": "#00F5FF",
  Sustainable: "#00FF88",
};

export default function ThinkBiggerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState(bigIdeas);

  const regenerate = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIdeas([...bigIdeas].sort(() => Math.random() - 0.5));
    setLoading(false);
  };

  return (
    <Layout>
      <div className="px-8 py-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border text-sm font-medium"
            style={{ background: "rgba(183,68,255,0.1)", borderColor: "rgba(183,68,255,0.3)", color: "#B744FF" }}
          >
            <Lightbulb size={14} /> Think Bigger
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: "#FFFFFF" }}>
            Push The <span className="shimmer-text">Boundaries</span>
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "hsl(226, 35%, 72%)" }}>
            Ambitious projects that challenge your skills and could actually change the world.
          </p>

          <button
            onClick={regenerate}
            disabled={loading}
            className="mt-6 btn-neon-outline-teal px-6 py-3 text-sm font-bold flex items-center gap-2 mx-auto"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {loading ? "Generating..." : "New Ideas"}
          </button>
        </div>

        {/* Ideas */}
        <div className="space-y-5">
          {ideas.map((idea, i) => {
            const impactColor = impactColors[idea.impact] || "#00F5FF";
            return (
              <div
                key={idea.id}
                className="card-neon p-6 cursor-pointer group animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex gap-5">
                  <div className="text-4xl animate-float" style={{ animationDelay: `${i * 0.4}s` }}>{idea.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                      <h3 className="font-bold text-lg" style={{ color: "#FFFFFF" }}>{idea.title}</h3>
                      <div className="flex gap-2 flex-wrap">
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-bold"
                          style={{ background: "rgba(183,68,255,0.15)", color: "#B744FF", border: "1px solid rgba(183,68,255,0.3)" }}
                        >
                          {idea.level}
                        </span>
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-bold"
                          style={{ background: `${impactColor}15`, color: impactColor, border: `1px solid ${impactColor}33` }}
                        >
                          {idea.impact}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm mb-4" style={{ color: "hsl(226, 35%, 72%)" }}>{idea.desc}</p>

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex flex-wrap gap-1.5">
                        {idea.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-lg"
                            style={{ background: "rgba(0,245,255,0.08)", color: "#00F5FF", border: "1px solid rgba(0,245,255,0.2)" }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => navigate("/ide")}
                        className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 group-hover:gap-3"
                        style={{ background: "linear-gradient(135deg, #00F5FF, #0099FF)", color: "#0A0E27", boxShadow: "0 0 12px rgba(0,245,255,0.3)" }}
                      >
                        <Zap size={14} /> Start Building <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
