import { useState } from "react";
import { Plus, Trash2, Search, Cpu, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";

const componentCategories = [
  {
    name: "Microcontrollers",
    items: ["Arduino Uno", "Arduino Mega", "Arduino Nano", "ESP32", "ESP8266"],
    color: "#00F5FF",
    emoji: "🎛️",
  },
  {
    name: "Sensors",
    items: ["DHT22 (Temp/Humidity)", "HC-SR04 (Ultrasonic)", "PIR Motion Sensor", "Soil Moisture Sensor", "BMP180 (Pressure)", "LDR (Light Sensor)", "IR Sensor"],
    color: "#00FF88",
    emoji: "📡",
  },
  {
    name: "Actuators",
    items: ["Servo Motor", "DC Motor", "Stepper Motor", "Piezo Buzzer", "Relay Module", "Water Pump"],
    color: "#FFD700",
    emoji: "⚙️",
  },
  {
    name: "Displays",
    items: ["16x2 LCD", "OLED 128x64", "7-Segment Display", "TFT Touch Screen", "LED Matrix"],
    color: "#B744FF",
    emoji: "📺",
  },
  {
    name: "Components",
    items: ["LED (Red)", "LED (Green)", "LED (Blue)", "RGB LED", "220Ω Resistor", "10kΩ Resistor", "Capacitor 100µF", "Transistor BC547", "Potentiometer"],
    color: "#FF4500",
    emoji: "🔌",
  },
  {
    name: "Communication",
    items: ["HC-05 Bluetooth", "NRF24L01 (RF)", "SIM800L (GSM)", "LoRa Module", "I2C Hub"],
    color: "#FF1493",
    emoji: "📶",
  },
];

export default function ComponentsPage() {
  const [myComponents, setMyComponents] = useState<string[]>(["Arduino Uno", "LED (Red)", "220Ω Resistor", "DHT22 (Temp/Humidity)", "Servo Motor"]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const addComponent = (item: string) => {
    if (!myComponents.includes(item)) {
      setMyComponents((prev) => [...prev, item]);
      setToast(`Added: ${item}`);
      setTimeout(() => setToast(null), 2500);
    }
  };

  const removeComponent = (item: string) => {
    setMyComponents((prev) => prev.filter((c) => c !== item));
  };

  const filtered = componentCategories.map((cat) => ({
    ...cat,
    items: cat.items.filter((i) => i.toLowerCase().includes(search.toLowerCase())),
  })).filter((cat) => cat.items.length > 0);

  return (
    <Layout>
      <div className="px-8 py-10 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#FFFFFF" }}>
            My <span className="gradient-text-teal">Components</span>
          </h1>
          <p style={{ color: "hsl(226, 35%, 72%)" }}>Add your components to get personalized project recommendations</p>
        </div>

        {/* My Components */}
        <div className="card-neon p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Cpu size={18} style={{ color: "#00F5FF" }} />
            <h2 className="font-bold" style={{ color: "#FFFFFF" }}>
              My Inventory <span className="text-sm font-normal ml-2" style={{ color: "#00F5FF" }}>({myComponents.length} items)</span>
            </h2>
          </div>

          {myComponents.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: "hsl(226, 35%, 72%)" }}>
              No components added yet. Browse below to add some!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {myComponents.map((c) => (
                <div
                  key={c}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium"
                  style={{ background: "rgba(0,245,255,0.1)", color: "#00F5FF", border: "1px solid rgba(0,245,255,0.3)" }}
                >
                  <CheckCircle size={12} />
                  {c}
                  <button onClick={() => removeComponent(c)} className="hover:text-red-400 transition-colors ml-1">
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(226, 35%, 60%)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search components..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
            style={{ background: "hsl(229, 45%, 16%)", border: "1px solid hsl(229, 42%, 28%)", color: "#FFFFFF" }}
          />
        </div>

        {/* Categories */}
        <div className="space-y-6">
          {filtered.map((cat) => (
            <div key={cat.name}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{cat.emoji}</span>
                <h3 className="font-bold text-sm" style={{ color: cat.color }}>{cat.name}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((item) => {
                  const owned = myComponents.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => addComponent(item)}
                      disabled={owned}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:cursor-default"
                      style={
                        owned
                          ? { background: `${cat.color}22`, color: cat.color, border: `1px solid ${cat.color}44` }
                          : { background: "hsl(229, 45%, 16%)", color: "hsl(226, 35%, 72%)", border: "1px solid hsl(229, 42%, 28%)" }
                      }
                    >
                      {owned ? <CheckCircle size={12} /> : <Plus size={12} />}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 px-5 py-3 rounded-xl flex items-center gap-2 font-semibold animate-fade-in-up" style={{ background: "linear-gradient(135deg, #00FF88, #00C853)", color: "#0A0E27", boxShadow: "0 0 20px rgba(0,255,136,0.4)" }}>
          <CheckCircle size={16} /> {toast}
        </div>
      )}
    </Layout>
  );
}
