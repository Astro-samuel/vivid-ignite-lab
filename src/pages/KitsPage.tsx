import { useState } from "react";
import { Package, Zap, Star, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";

const kits = [
  {
    id: 1, emoji: "🌟", name: "Starter Kit",
    desc: "Perfect for absolute beginners. Everything you need to get started with Arduino.",
    components: ["Arduino Uno", "Breadboard", "LED (5x)", "220Ω Resistor (10x)", "Jumper Wires", "USB Cable"],
    projects: 8, difficulty: "beginner", color: "#00FF88",
    features: ["8 beginner projects included", "Step-by-step tutorials", "No soldering required"],
  },
  {
    id: 2, emoji: "⚡", name: "Sensor Pack",
    desc: "Explore the world of sensors and environmental monitoring.",
    components: ["DHT22", "HC-SR04 Ultrasonic", "PIR Motion", "LDR Light Sensor", "Soil Moisture", "BMP180 Pressure"],
    projects: 12, difficulty: "intermediate", color: "#00F5FF",
    features: ["12 sensor projects", "IoT ready", "Cloud dashboard compatible"],
  },
  {
    id: 3, emoji: "🤖", name: "Robotics Kit",
    desc: "Build robots and autonomous vehicles with this comprehensive robotics bundle.",
    components: ["L298N Motor Driver", "DC Motors (2x)", "Servo Motor (2x)", "IR Sensors (3x)", "HC-SR04", "Chassis Kit"],
    projects: 10, difficulty: "intermediate", color: "#FFD700",
    features: ["10 robotics projects", "Line following + obstacle avoidance", "Bluetooth control ready"],
  },
  {
    id: 4, emoji: "📡", name: "IoT Connectivity Kit",
    desc: "Connect your projects to the internet and control them from anywhere.",
    components: ["ESP32", "ESP8266 NodeMCU", "HC-05 Bluetooth", "LoRa Module", "SIM800L GSM", "RFID RC522"],
    projects: 15, difficulty: "advanced", color: "#B744FF",
    features: ["15 IoT projects", "WiFi + Bluetooth + LoRa", "Cloud & mobile app integration"],
  },
  {
    id: 5, emoji: "🎨", name: "LED Art Kit",
    desc: "Create stunning light art installations and interactive displays.",
    components: ["WS2812B LED Strip (1m)", "RGB LED (10x)", "LED Matrix 8x8", "IR Remote", "Potentiometer (3x)", "Capacitor 1000µF"],
    projects: 9, difficulty: "beginner", color: "#FF1493",
    features: ["9 LED art projects", "Full color control", "Music reactive effects"],
  },
  {
    id: 6, emoji: "🔊", name: "Audio Kit",
    desc: "Build sound-reactive projects, music players, and voice-controlled devices.",
    components: ["Piezo Buzzer", "MAX9814 Microphone", "DF Player Mini", "Speaker (2W)", "Potentiometer", "3.5mm Jack"],
    projects: 7, difficulty: "intermediate", color: "#FF4500",
    features: ["7 audio projects", "Music visualization", "Voice command support"],
  },
];

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const cls = difficulty === "beginner" ? "badge-beginner" : difficulty === "intermediate" ? "badge-intermediate" : "badge-advanced";
  return <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${cls}`}>{difficulty}</span>;
}

export default function KitsPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | null>(null);
  const [toast, setToast] = useState(false);

  const handleSelect = (id: number) => {
    setSelected(id);
    setToast(true);
    setTimeout(() => { setToast(false); navigate("/generate"); }, 2000);
  };

  return (
    <Layout>
      <div className="px-8 py-10 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Package size={22} style={{ color: "#FFD700" }} />
            <h1 className="text-3xl font-bold" style={{ color: "#FFFFFF" }}>
              Starter <span className="gradient-text-gold">Kits</span>
            </h1>
          </div>
          <p style={{ color: "hsl(226, 35%, 72%)" }}>
            Pre-configured component bundles to jumpstart your learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {kits.map((kit, i) => (
            <div
              key={kit.id}
              className="card-neon p-5 cursor-pointer group transition-all duration-300"
              style={
                selected === kit.id
                  ? { borderColor: `${kit.color}66`, boxShadow: `0 0 20px ${kit.color}22` }
                  : {}
              }
              onClick={() => handleSelect(kit.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
                    style={{ background: `${kit.color}18`, border: `1px solid ${kit.color}33` }}
                  >
                    {kit.emoji}
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: "#FFFFFF" }}>{kit.name}</h3>
                    <DifficultyBadge difficulty={kit.difficulty} />
                  </div>
                </div>
                {selected === kit.id && (
                  <CheckCircle size={20} style={{ color: kit.color }} className="flex-shrink-0" />
                )}
              </div>

              <p className="text-sm mb-4" style={{ color: "hsl(226, 35%, 72%)" }}>{kit.desc}</p>

              {/* Components */}
              <div className="mb-4">
                <p className="text-xs font-semibold mb-2" style={{ color: kit.color }}>Includes:</p>
                <div className="flex flex-wrap gap-1.5">
                  {kit.components.slice(0, 4).map((c) => (
                    <span
                      key={c}
                      className="text-xs px-2 py-0.5 rounded-lg"
                      style={{ background: `${kit.color}10`, color: kit.color, border: `1px solid ${kit.color}25` }}
                    >
                      {c}
                    </span>
                  ))}
                  {kit.components.length > 4 && (
                    <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: "hsl(229, 42%, 22%)", color: "hsl(226, 35%, 72%)" }}>
                      +{kit.components.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="mb-4 space-y-1.5">
                {kit.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs" style={{ color: "hsl(226, 35%, 72%)" }}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: kit.color }} />
                    {f}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "hsl(229, 42%, 28%)" }}>
                <div className="flex items-center gap-1 text-xs" style={{ color: "hsl(226, 35%, 72%)" }}>
                  <Star size={11} style={{ color: kit.color }} /> {kit.projects} projects
                </div>
                <button
                  className="px-4 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                  style={{
                    background: `${kit.color}22`,
                    color: kit.color,
                    border: `1px solid ${kit.color}44`,
                  }}
                >
                  <Zap size={11} className="inline mr-1" /> Select Kit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <div
          className="fixed bottom-6 right-6 px-5 py-3 rounded-xl flex items-center gap-2 font-semibold animate-fade-in-up"
          style={{ background: "linear-gradient(135deg, #00FF88, #00C853)", color: "#0A0E27", boxShadow: "0 0 20px rgba(0,255,136,0.4)" }}
        >
          <CheckCircle size={16} /> ✓ Kit Selected!
        </div>
      )}
    </Layout>
  );
}
