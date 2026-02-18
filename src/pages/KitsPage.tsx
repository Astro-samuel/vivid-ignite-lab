import { useState } from "react";
import { Package, Zap, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";

const kits = [
  {
    id: 1,
    emoji: "🌱",
    name: "Basic Starter Kit",
    price: "$25",
    desc: "Perfect for absolute beginners. Learn the fundamentals of Arduino.",
    components: [
      "Arduino Uno", "Breadboard", "Jumper Wires", "LED (Red) ×5",
      "LED (Green) ×5", "LED (Blue) ×5", "Resistor (220Ω) ×10",
      "Resistor (1kΩ) ×10", "Push Button ×5", "Potentiometer ×2", "Buzzer",
    ],
    componentCount: 11,
    projects: "15+",
    color: "#00FF88",
    borderColor: "rgba(0,255,136,0.5)",
  },
  {
    id: 2,
    emoji: "📊",
    name: "Sensor Explorer Kit",
    price: "$45",
    desc: "Dive into the world of sensors. Measure temperature, distance, light, and more.",
    components: [
      "Arduino Uno", "Breadboard", "Jumper Wires", "Temperature Sensor (DHT11)",
      "Ultrasonic Sensor (HC-SR04)", "PIR Motion Sensor", "Photoresistor (LDR) ×2",
      "IR Sensor ×2", "Soil Moisture Sensor", "BMP180 Pressure", "Sound Sensor", "Rain Sensor",
    ],
    componentCount: 12,
    projects: "25+",
    color: "#00F5FF",
    borderColor: "rgba(0,245,255,0.5)",
  },
  {
    id: 3,
    emoji: "🤖",
    name: "Robotics Kit",
    price: "$65",
    desc: "Build moving robots! Includes motors, drivers, and chassis components.",
    components: [
      "Arduino Uno", "Motor Driver (L298N)", "DC Motor ×4", "Servo Motor (SG90) ×2",
      "Ultrasonic Sensor (HC-SR04) ×2", "IR Sensor ×3", "Battery Holder", "Breadboard",
      "Chassis Kit",
    ],
    componentCount: 9,
    projects: "20+",
    color: "#FFD700",
    borderColor: "rgba(255,215,0,0.5)",
  },
  {
    id: 4,
    emoji: "🌐",
    name: "IoT & WiFi Kit",
    price: "$55",
    desc: "Connect your projects to the internet. Build smart home devices.",
    components: [
      "ESP32", "ESP8266", "Relay Module ×2", "Temperature Sensor (DHT22)",
      "PIR Motion Sensor", "OLED Display (0.96\")", "LED Strip (WS2812B)",
      "Buzzer", "Jumper Wires", "Breadboard",
    ],
    componentCount: 10,
    projects: "30+",
    color: "#B744FF",
    borderColor: "rgba(183,68,255,0.5)",
  },
  {
    id: 5,
    emoji: "⭐",
    name: "Complete Maker Kit",
    price: "$120",
    desc: "Everything you need! The ultimate kit for serious Arduino enthusiasts.",
    components: [
      "Arduino Uno", "Arduino Nano", "ESP32", "Breadboard ×2", "Jumper Wires",
      "LED (Red) ×10", "LED (Green) ×10", "RGB LED ×5", "Resistor (220Ω) ×20",
      "Resistor (10kΩ) ×10", "DHT22", "HC-SR04", "Servo Motor ×3", "DC Motor ×4",
      "L298N Motor Driver", "OLED Display", "16x2 LCD", "Buzzer", "Relay Module ×2", "Potentiometer ×3",
    ],
    componentCount: 20,
    projects: "50+",
    color: "#FF1493",
    borderColor: "rgba(255,20,147,0.5)",
    bestValue: true,
  },
];

// Shared inventory state (in a real app this would be in context/store)
export let sharedInventory: string[] = [
  "Arduino Uno", "LED (Red)", "220Ω Resistor", "DHT22 (Temp/Humidity)", "Servo Motor",
];

export default function KitsPage() {
  const navigate = useNavigate();
  const [selectedKits, setSelectedKits] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState("");

  const handleHaveKit = (kit: typeof kits[0]) => {
    if (selectedKits.has(kit.id)) return;
    setSelectedKits((prev) => new Set([...prev, kit.id]));

    // Add kit components to shared inventory
    kit.components.forEach((c) => {
      const base = c.replace(/ ×\d+$/, "").replace(/\s×\d+/, "");
      if (!sharedInventory.includes(base)) {
        sharedInventory.push(base);
      }
    });

    setToast(`✓ ${kit.name} added to inventory!`);
    setTimeout(() => {
      setToast("");
      navigate("/generate");
    }, 2000);
  };

  return (
    <Layout>
      <div className="px-8 py-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Package size={14} style={{ color: "#00FF88" }} />
            <span className="text-xs font-semibold" style={{ color: "#00FF88" }}>Component Kits</span>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#FFFFFF" }}>Starter Kits</h1>
          <p style={{ color: "#A0AED9" }}>
            Don't have components yet? Choose a kit that matches your interests and we'll set up your inventory automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {kits.map((kit) => {
            const owned = selectedKits.has(kit.id);
            return (
              <div
                key={kit.id}
                className="rounded-2xl border overflow-hidden transition-all duration-300 relative"
                style={{
                  background: "hsl(229, 45%, 14%)",
                  borderColor: owned ? kit.borderColor : "hsl(229, 42%, 26%)",
                  boxShadow: owned ? `0 0 20px ${kit.color}18` : "none",
                }}
              >
                {/* Best Value badge */}
                {kit.bestValue && (
                  <div
                    className="absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-xl"
                    style={{ background: "linear-gradient(135deg, #FFD700, #FFA500)", color: "#0A0E27" }}
                  >
                    BEST VALUE
                  </div>
                )}

                <div className="p-5">
                  {/* Kit header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{kit.emoji}</span>
                      <div>
                        <h3 className="font-bold text-base" style={{ color: "#FFFFFF" }}>{kit.name}</h3>
                      </div>
                    </div>
                    <span className="text-xl font-black" style={{ color: kit.color }}>{kit.price}</span>
                  </div>

                  {/* Progress-like bar with project count */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 h-1 rounded-full mr-3" style={{ background: "hsl(229, 42%, 22%)" }}>
                      <div className="h-full rounded-full" style={{ width: "40%", background: kit.color }} />
                    </div>
                    <span className="text-xs flex items-center gap-1" style={{ color: kit.color }}>
                      <Zap size={11} /> {kit.projects} projects
                    </span>
                  </div>

                  <p className="text-sm mb-4" style={{ color: "#A0AED9" }}>{kit.desc}</p>

                  {/* Component count */}
                  <p className="text-xs font-semibold mb-2" style={{ color: "hsl(226, 35%, 65%)" }}>
                    {kit.componentCount} components
                  </p>

                  {/* Includes */}
                  <p className="text-xs font-semibold mb-2" style={{ color: kit.color }}>Includes:</p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {kit.components.slice(0, 8).map((c) => (
                      <span
                        key={c}
                        className="text-xs px-2 py-0.5 rounded-lg"
                        style={{
                          background: "hsl(229, 42%, 20%)",
                          color: "hsl(226, 35%, 75%)",
                          border: "1px solid hsl(229, 42%, 30%)",
                        }}
                      >
                        {c}
                      </span>
                    ))}
                    {kit.components.length > 8 && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-lg"
                        style={{ background: "hsl(229, 42%, 20%)", color: "hsl(226, 35%, 65%)", border: "1px solid hsl(229, 42%, 30%)" }}
                      >
                        +{kit.components.length - 8} more
                      </span>
                    )}
                  </div>

                  {/* I Have This Kit button */}
                  <button
                    onClick={() => handleHaveKit(kit)}
                    disabled={owned}
                    className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:cursor-default"
                    style={
                      owned
                        ? {
                            background: `${kit.color}22`,
                            color: kit.color,
                            border: `1px solid ${kit.color}44`,
                          }
                        : {
                            background: `linear-gradient(135deg, ${kit.color}, ${kit.color}BB)`,
                            color: kit.id === 1 || kit.id === 2 ? "#0A0E27" : "#FFFFFF",
                            boxShadow: `0 0 20px ${kit.color}44`,
                          }
                    }
                  >
                    {owned ? (
                      <><CheckCircle size={16} /> ✓ Added to Inventory!</>
                    ) : (
                      <><CheckCircle size={16} /> I Have This Kit</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* No kit section */}
        <div
          className="mt-8 rounded-2xl p-6 border text-center"
          style={{ background: "hsl(229, 45%, 14%)", borderColor: "hsl(229, 42%, 26%)" }}
        >
          <h3 className="font-bold mb-2" style={{ color: "#FFFFFF" }}>Don't have a kit?</h3>
          <p className="text-sm mb-4" style={{ color: "#A0AED9" }}>
            You can manually add individual components in the "My Components" section, or let our AI suggest projects based on common beginner setups.
          </p>
        </div>
      </div>

      {toast && (
        <div
          className="fixed bottom-6 right-6 px-5 py-3 rounded-xl flex items-center gap-2 font-semibold animate-fade-in-up z-50"
          style={{ background: "linear-gradient(135deg, #00FF88, #00C853)", color: "#0A0E27", boxShadow: "0 0 20px rgba(0,255,136,0.4)" }}
        >
          <CheckCircle size={16} /> {toast}
        </div>
      )}
    </Layout>
  );
}
