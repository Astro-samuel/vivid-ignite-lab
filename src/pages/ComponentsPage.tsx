import { useState } from "react";
import { Minus, Plus, Save, Zap, Lightbulb, Package } from "lucide-react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";

type Category = "Microcontroller" | "Sensor" | "Actuator" | "Display" | "Communication" | "Module" | "Power" | "Passive" | "Other";

interface ComponentItem {
  name: string;
  category: Category;
}

const allComponents: ComponentItem[] = [
  // Microcontrollers
  { name: "Arduino Uno", category: "Microcontroller" },
  { name: "Arduino Nano", category: "Microcontroller" },
  { name: "Arduino Mega", category: "Microcontroller" },
  { name: "ESP32", category: "Microcontroller" },
  { name: "ESP8266", category: "Microcontroller" },
  // Sensors
  { name: "Temperature Sensor (DHT11)", category: "Sensor" },
  { name: "Temperature Sensor (DHT22)", category: "Sensor" },
  { name: "Ultrasonic Sensor (HC-SR04)", category: "Sensor" },
  { name: "PIR Motion Sensor", category: "Sensor" },
  { name: "Photoresistor (LDR)", category: "Sensor" },
  { name: "IR Sensor", category: "Sensor" },
  { name: "Soil Moisture Sensor", category: "Sensor" },
  { name: "Sound Sensor", category: "Sensor" },
  { name: "Rain Sensor", category: "Sensor" },
  { name: "BMP180 (Pressure)", category: "Sensor" },
  // Actuators
  { name: "Servo Motor (SG90)", category: "Actuator" },
  { name: "DC Motor", category: "Actuator" },
  { name: "Stepper Motor", category: "Actuator" },
  { name: "Buzzer", category: "Actuator" },
  { name: "Relay Module", category: "Actuator" },
  { name: "Water Pump", category: "Actuator" },
  // Displays
  { name: "16x2 LCD", category: "Display" },
  { name: "OLED Display (0.96\")", category: "Display" },
  { name: "7-Segment Display", category: "Display" },
  { name: "LED Strip (WS2812B)", category: "Display" },
  { name: "LED Matrix 8x8", category: "Display" },
  // Communication
  { name: "HC-05 Bluetooth", category: "Communication" },
  { name: "NRF24L01 (RF)", category: "Communication" },
  { name: "SIM800L (GSM)", category: "Communication" },
  { name: "LoRa Module", category: "Communication" },
  // Passive
  { name: "LED (Red)", category: "Passive" },
  { name: "LED (Green)", category: "Passive" },
  { name: "LED (Blue)", category: "Passive" },
  { name: "RGB LED", category: "Passive" },
  { name: "Resistor (220Ω)", category: "Passive" },
  { name: "Resistor (1kΩ)", category: "Passive" },
  { name: "Resistor (10kΩ)", category: "Passive" },
  { name: "Capacitor 100µF", category: "Passive" },
  { name: "Push Button", category: "Passive" },
  { name: "Potentiometer", category: "Passive" },
  { name: "Transistor BC547", category: "Passive" },
  // Module
  { name: "Motor Driver (L298N)", category: "Module" },
  { name: "RFID RC522", category: "Module" },
  { name: "RTC DS3231", category: "Module" },
  { name: "SD Card Module", category: "Module" },
  { name: "I2C Hub", category: "Module" },
  // Power
  { name: "Battery Holder", category: "Power" },
  { name: "9V Battery", category: "Power" },
  { name: "Voltage Regulator (LM7805)", category: "Power" },
  // Other
  { name: "Breadboard", category: "Other" },
  { name: "Jumper Wires", category: "Other" },
  { name: "USB Cable", category: "Other" },
  { name: "Soldering Iron", category: "Other" },
];

const categories: Category[] = ["Microcontroller", "Sensor", "Actuator", "Display", "Communication", "Module", "Power", "Passive", "Other"];

export default function ComponentsPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<Category>("Microcontroller");
  
  // Load from localStorage
  const loadQuantities = (): Record<string, number> => {
    try {
      const inv = JSON.parse(localStorage.getItem("userInventory") || "[]") as string[];
      const q: Record<string, number> = {};
      inv.forEach((name) => { q[name] = 1; });
      return Object.keys(q).length > 0 ? q : { "Arduino Uno": 1 };
    } catch { return { "Arduino Uno": 1 }; }
  };
  
  const [quantities, setQuantities] = useState<Record<string, number>>(loadQuantities);
  const [saved, setSaved] = useState(false);

  const filteredComponents = allComponents.filter((c) => c.category === activeCategory);
  const totalSelected = Object.keys(quantities).length;

  const toggleComponent = (name: string) => {
    setQuantities((prev) => {
      if (prev[name] !== undefined) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return { ...prev, [name]: 1 };
    });
  };

  const adjustQty = (name: string, delta: number) => {
    setQuantities((prev) => {
      const curr = prev[name] ?? 1;
      const next = Math.max(1, curr + delta);
      return { ...prev, [name]: next };
    });
  };

  const handleSave = () => {
    const inventory = Object.keys(quantities);
    localStorage.setItem("userInventory", JSON.stringify(inventory));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Layout>
      <div className="flex h-full">
        {/* Main panel */}
        <div className="flex-1 px-8 py-10 overflow-y-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: "#00F5FF" }}>⚙️</span>
              <span className="text-xs font-semibold" style={{ color: "#00F5FF" }}>Inventory Management</span>
            </div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: "#FFFFFF" }}>My Components</h1>
            <p className="text-sm" style={{ color: "#A0AED9" }}>
              Add the Arduino components you own. We'll generate projects that match your inventory.
            </p>
          </div>

          {/* Component Library card */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: "hsl(229, 45%, 14%)", borderColor: "hsl(229, 42%, 26%)" }}
          >
            {/* Card header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "hsl(229, 42%, 22%)" }}
            >
              <span className="font-semibold" style={{ color: "#FFFFFF" }}>Component Library</span>
              <span
                className="text-xs px-3 py-1 rounded-full font-semibold"
                style={{ background: "rgba(0,245,255,0.12)", color: "#00F5FF", border: "1px solid rgba(0,245,255,0.25)" }}
              >
                {totalSelected} components selected
              </span>
            </div>

            {/* Save Inventory button */}
            <div className="px-5 py-3 border-b" style={{ borderColor: "hsl(229, 42%, 22%)" }}>
              <button
                onClick={handleSave}
                className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                style={{
                  background: saved
                    ? "linear-gradient(135deg, #00FF88, #00C853)"
                    : "linear-gradient(135deg, #00F5FF, #0099FF)",
                  color: "#0A0E27",
                  boxShadow: saved ? "0 0 20px rgba(0,255,136,0.4)" : "0 0 20px rgba(0,245,255,0.3)",
                }}
              >
                <Save size={15} />
                {saved ? "✓ Inventory Saved!" : "Save Inventory"}
              </button>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-1 px-5 py-3 border-b" style={{ borderColor: "hsl(229, 42%, 22%)" }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={
                    activeCategory === cat
                      ? { background: "#00F5FF", color: "#0A0E27" }
                      : { color: "hsl(226, 35%, 65%)", background: "transparent" }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Component list */}
            <div className="p-5 space-y-2">
              {filteredComponents.map((comp) => {
                const owned = quantities[comp.name] !== undefined;
                return (
                  <div
                    key={comp.name}
                    className="flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer"
                    style={
                      owned
                        ? { background: "rgba(0,245,255,0.06)", border: "1px solid rgba(0,245,255,0.25)" }
                        : { background: "hsl(229, 42%, 18%)", border: "1px solid transparent" }
                    }
                    onClick={() => !owned && toggleComponent(comp.name)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        onClick={(e) => { e.stopPropagation(); toggleComponent(comp.name); }}
                        className="w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-all"
                        style={
                          owned
                            ? { background: "#00F5FF", border: "1px solid #00F5FF" }
                            : { background: "transparent", border: "1px solid hsl(229, 42%, 35%)" }
                        }
                      >
                        {owned && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="#0A0E27" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: owned ? "#FFFFFF" : "hsl(226, 35%, 55%)" }}
                      >
                        {comp.name}
                      </span>
                    </div>

                    {owned && (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => adjustQty(comp.name, -1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{ background: "hsl(229, 42%, 22%)", border: "1px solid hsl(229, 42%, 30%)", color: "#FFFFFF" }}
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-sm font-bold w-6 text-center" style={{ color: "#FFFFFF" }}>
                          {quantities[comp.name]}
                        </span>
                        <button
                          onClick={() => adjustQty(comp.name, 1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          style={{ background: "hsl(229, 42%, 22%)", border: "1px solid hsl(229, 42%, 30%)", color: "#FFFFFF" }}
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right sidebar panel */}
        <div className="w-72 flex-shrink-0 px-4 py-10 space-y-4 border-l overflow-y-auto" style={{ borderColor: "hsl(229, 42%, 20%)" }}>
          {/* Tips */}
          <div
            className="rounded-2xl p-5 border"
            style={{ background: "rgba(255,215,0,0.05)", borderColor: "rgba(255,215,0,0.2)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={16} style={{ color: "#FFD700" }} />
              <span className="font-bold text-sm" style={{ color: "#FFD700" }}>Tips for Better Projects</span>
            </div>
            <ul className="space-y-2">
              {[
                "Add all your components, even basic ones like resistors",
                "Include the quantity - it affects what projects you can build",
                "More components = more complex project suggestions",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-xs" style={{ color: "#A0AED9" }}>
                  <span className="mt-0.5 flex-shrink-0">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Need Components */}
          <div
            className="rounded-2xl p-5 border"
            style={{ background: "rgba(0,255,136,0.05)", borderColor: "rgba(0,255,136,0.2)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Package size={16} style={{ color: "#00FF88" }} />
              <span className="font-bold text-sm" style={{ color: "#00FF88" }}>Need Components?</span>
            </div>
            <p className="text-xs mb-3" style={{ color: "#A0AED9" }}>
              Check out our starter kits to quickly set up your inventory with common components.
            </p>
            <button
              onClick={() => navigate("/kits")}
              className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #00FF88, #00C853)",
                color: "#0A0E27",
                boxShadow: "0 0 15px rgba(0,255,136,0.3)",
              }}
            >
              <Package size={14} /> Browse Kits
            </button>
          </div>

          {/* Ready to Build */}
          <div
            className="rounded-2xl p-5 border"
            style={{ background: "rgba(0,245,255,0.05)", borderColor: "rgba(0,245,255,0.2)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} style={{ color: "#00F5FF" }} />
              <span className="font-bold text-sm" style={{ color: "#00F5FF" }}>Ready to Build?</span>
            </div>
            <p className="text-xs mb-3" style={{ color: "#A0AED9" }}>
              Once you've added your components, let AI generate custom projects just for you.
            </p>
            <button
              onClick={() => navigate("/generate")}
              className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #00F5FF, #0099FF)",
                color: "#0A0E27",
                boxShadow: "0 0 15px rgba(0,245,255,0.3)",
              }}
            >
              <Zap size={14} /> Generate Project
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
