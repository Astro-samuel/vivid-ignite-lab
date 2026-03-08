import { useState, useRef } from "react";
import { Minus, Plus, Save, Zap, Lightbulb, Package, Loader2, Brain, Heart, X, Sparkles, ShoppingCart, Camera, Eye } from "lucide-react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import FadeInView from "@/components/motion/FadeInView";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AnimatePresence, motion } from "framer-motion";

type Category = "Microcontroller" | "Sensor" | "Actuator" | "Display" | "Communication" | "Module" | "Power" | "Passive" | "Other";

interface ComponentItem {
  name: string;
  category: Category;
}

const allComponents: ComponentItem[] = [
  { name: "Arduino Uno", category: "Microcontroller" },
  { name: "Arduino Nano", category: "Microcontroller" },
  { name: "Arduino Mega", category: "Microcontroller" },
  { name: "ESP32", category: "Microcontroller" },
  { name: "ESP8266", category: "Microcontroller" },
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
  { name: "Servo Motor (SG90)", category: "Actuator" },
  { name: "DC Motor", category: "Actuator" },
  { name: "Stepper Motor", category: "Actuator" },
  { name: "Buzzer", category: "Actuator" },
  { name: "Relay Module", category: "Actuator" },
  { name: "Water Pump", category: "Actuator" },
  { name: "16x2 LCD", category: "Display" },
  { name: "OLED Display (0.96\")", category: "Display" },
  { name: "7-Segment Display", category: "Display" },
  { name: "LED Strip (WS2812B)", category: "Display" },
  { name: "LED Matrix 8x8", category: "Display" },
  { name: "HC-05 Bluetooth", category: "Communication" },
  { name: "NRF24L01 (RF)", category: "Communication" },
  { name: "SIM800L (GSM)", category: "Communication" },
  { name: "LoRa Module", category: "Communication" },
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
  { name: "Motor Driver (L298N)", category: "Module" },
  { name: "RFID RC522", category: "Module" },
  { name: "RTC DS3231", category: "Module" },
  { name: "SD Card Module", category: "Module" },
  { name: "I2C Hub", category: "Module" },
  { name: "Battery Holder", category: "Power" },
  { name: "9V Battery", category: "Power" },
  { name: "Voltage Regulator (LM7805)", category: "Power" },
  { name: "Breadboard", category: "Other" },
  { name: "Jumper Wires", category: "Other" },
  { name: "USB Cable", category: "Other" },
  { name: "Soldering Iron", category: "Other" },
];

const categories: Category[] = ["Microcontroller", "Sensor", "Actuator", "Display", "Communication", "Module", "Power", "Passive", "Other"];

function loadWishlist(userId?: string): string[] {
  try {
    const key = userId ? `wishlist_${userId}` : "wishlist";
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch { return []; }
}

function saveWishlistToStorage(items: string[], userId?: string) {
  const key = userId ? `wishlist_${userId}` : "wishlist";
  localStorage.setItem(key, JSON.stringify(items));
}

export default function ComponentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<Category>("Microcontroller");

  const loadQuantities = (): Record<string, number> => {
    try {
      const key = user ? `inventory_${user.id}` : "userInventory";
      const inv = JSON.parse(localStorage.getItem(key) || "[]") as string[];
      const q: Record<string, number> = {};
      inv.forEach((name) => { q[name] = 1; });
      return q;
    } catch { return {}; }
  };

  const [quantities, setQuantities] = useState<Record<string, number>>(loadQuantities);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Smart Recognition state
  const [pasteText, setPasteText] = useState("");
  const [recognizing, setRecognizing] = useState(false);
  const [recognized, setRecognized] = useState<string[]>([]);
  const [showPastePanel, setShowPastePanel] = useState(false);

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>(() => loadWishlist(user?.id));
  const [showWishlist, setShowWishlist] = useState(false);

  // Visual Search state
  const [showVisualSearch, setShowVisualSearch] = useState(false);
  const [visualSearching, setVisualSearching] = useState(false);
  const [visualResults, setVisualResults] = useState<{name: string; confidence: string}[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    const inventory = Object.keys(quantities);
    const key = user ? `inventory_${user.id}` : "userInventory";
    localStorage.setItem(key, JSON.stringify(inventory));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Smart Recognition
  const handleRecognize = async () => {
    if (!pasteText.trim()) return;
    setRecognizing(true);
    setRecognized([]);
    try {
      const { data, error } = await supabase.functions.invoke("recognize-components", {
        body: { text: pasteText.trim() },
      });
      if (error) throw error;
      if (data?.components) {
        setRecognized(data.components);
      }
    } catch (e) {
      console.error("Recognition error:", e);
    }
    setRecognizing(false);
  };

  const addRecognizedToInventory = () => {
    setQuantities(prev => {
      const next = { ...prev };
      recognized.forEach(name => { if (!next[name]) next[name] = 1; });
      return next;
    });
    setRecognized([]);
    setPasteText("");
    setShowPastePanel(false);
  };

  // Wishlist
  const toggleWishlist = (name: string) => {
    setWishlist(prev => {
      const next = prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name];
      saveWishlistToStorage(next, user?.id);
      return next;
    });
  };

  const moveWishlistToInventory = (name: string) => {
    setQuantities(prev => ({ ...prev, [name]: 1 }));
    setWishlist(prev => {
      const next = prev.filter(n => n !== name);
      saveWishlistToStorage(next, user?.id);
      return next;
    });
  };

  // "One component away" - components on wishlist that if added would complete a project's requirements
  const ownedNames = Object.keys(quantities);

  return (
    <Layout>
      <div className="flex h-full">
        {/* Main panel */}
        <div className="flex-1 px-8 py-10 overflow-y-auto">
          <FadeInView className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: "#00F5FF" }}>⚙️</span>
              <span className="text-xs font-semibold" style={{ color: "#00F5FF" }}>Inventory Management</span>
            </div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: "#FFFFFF" }}>My Components</h1>
            <p className="text-sm" style={{ color: "#A0AED9" }}>
              Add the Arduino components you own. We'll generate projects that match your inventory.
            </p>
          </FadeInView>

          {/* Smart Recognition Panel */}
          <div className="mb-4">
            <button
              onClick={() => setShowPastePanel(!showPastePanel)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, rgba(183,68,255,0.15), rgba(255,20,147,0.15))",
                color: "#B744FF",
                border: "1px solid rgba(183,68,255,0.3)",
              }}
            >
              <Brain size={15} />
              🤖 Smart Component Recognition
              <Sparkles size={12} />
            </button>
          </div>

          <AnimatePresence>
            {showPastePanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <div
                  className="rounded-2xl border p-5"
                  style={{ background: "rgba(183,68,255,0.06)", borderColor: "rgba(183,68,255,0.25)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Brain size={16} style={{ color: "#B744FF" }} />
                      <span className="font-bold text-sm" style={{ color: "#B744FF" }}>Paste Your Component List</span>
                    </div>
                    <button onClick={() => setShowPastePanel(false)} style={{ color: "#A0AED9" }}>
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-xs mb-3" style={{ color: "#A0AED9" }}>
                    Paste a shopping cart, project guide, or parts list — AI will recognize the components and add them to your inventory.
                  </p>
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder={"e.g.\n1x Arduino Uno\n2x DHT11 Temperature Sensor\n5x 220 ohm Resistor\nServo motor SG90\nBreadboard + jumper wires..."}
                    className="w-full h-28 px-4 py-3 rounded-xl text-sm resize-none focus:outline-none"
                    style={{
                      background: "hsl(229, 42%, 12%)",
                      border: "1px solid rgba(183,68,255,0.2)",
                      color: "#FFFFFF",
                    }}
                  />
                  <button
                    onClick={handleRecognize}
                    disabled={recognizing || !pasteText.trim()}
                    className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, #B744FF, #FF1493)",
                      color: "#FFFFFF",
                      boxShadow: "0 0 15px rgba(183,68,255,0.3)",
                    }}
                  >
                    {recognizing ? <><Loader2 size={14} className="animate-spin" /> Recognizing...</> : <><Brain size={14} /> Recognize Components</>}
                  </button>

                  {/* Recognized Results */}
                  <AnimatePresence>
                    {recognized.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-4 p-4 rounded-xl"
                        style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)" }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles size={14} style={{ color: "#00FF88" }} />
                          <span className="text-sm font-bold" style={{ color: "#00FF88" }}>
                            Found {recognized.length} component{recognized.length !== 1 ? "s" : ""}!
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {recognized.map(name => (
                            <span
                              key={name}
                              className="text-xs px-2.5 py-1 rounded-lg font-medium"
                              style={{
                                background: ownedNames.includes(name) ? "rgba(255,215,0,0.12)" : "rgba(0,255,136,0.12)",
                                color: ownedNames.includes(name) ? "#FFD700" : "#00FF88",
                                border: `1px solid ${ownedNames.includes(name) ? "rgba(255,215,0,0.3)" : "rgba(0,255,136,0.3)"}`,
                              }}
                            >
                              {ownedNames.includes(name) ? "✓ " : "+"} {name}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={addRecognizedToInventory}
                          className="w-full py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                          style={{
                            background: "linear-gradient(135deg, #00FF88, #00C853)",
                            color: "#0A0E27",
                          }}
                        >
                          <Plus size={14} /> Add All to Inventory
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Component Library card */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: "hsl(229, 45%, 14%)", borderColor: "hsl(229, 42%, 26%)" }}
          >
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
                disabled={saving}
                className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-80 disabled:cursor-not-allowed"
                style={{
                  background: saved
                    ? "linear-gradient(135deg, #00FF88, #00C853)"
                    : "linear-gradient(135deg, #00F5FF, #0099FF)",
                  color: "#0A0E27",
                  boxShadow: saved ? "0 0 20px rgba(0,255,136,0.4)" : "0 0 20px rgba(0,245,255,0.3)",
                }}
              >
                {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : saved ? <><Save size={15} /> ✓ Inventory Saved!</> : <><Save size={15} /> Save Inventory</>}
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
                const wishlisted = wishlist.includes(comp.name);
                return (
                  <div
                    key={comp.name}
                    className="flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer"
                    style={
                      owned
                        ? { background: "rgba(0,245,255,0.06)", border: "1px solid rgba(0,245,255,0.25)" }
                        : wishlisted
                        ? { background: "rgba(255,20,147,0.06)", border: "1px solid rgba(255,20,147,0.2)" }
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

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {/* Wishlist button */}
                      {!owned && (
                        <button
                          onClick={() => toggleWishlist(comp.name)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                          style={{
                            background: wishlisted ? "rgba(255,20,147,0.15)" : "transparent",
                            border: wishlisted ? "1px solid rgba(255,20,147,0.3)" : "1px solid hsl(229, 42%, 30%)",
                            color: wishlisted ? "#FF1493" : "hsl(226, 35%, 55%)",
                          }}
                        >
                          <Heart size={11} fill={wishlisted ? "#FF1493" : "none"} />
                        </button>
                      )}

                      {owned && (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right sidebar panel */}
        <div className="w-72 flex-shrink-0 px-4 py-10 space-y-4 border-l overflow-y-auto" style={{ borderColor: "hsl(229, 42%, 20%)" }}>

          {/* Wishlist Panel */}
          <div
            className="rounded-2xl p-5 border"
            style={{ background: "rgba(255,20,147,0.05)", borderColor: "rgba(255,20,147,0.2)" }}
          >
            <button
              onClick={() => setShowWishlist(!showWishlist)}
              className="flex items-center gap-2 w-full mb-2"
            >
              <Heart size={16} style={{ color: "#FF1493" }} fill={wishlist.length > 0 ? "#FF1493" : "none"} />
              <span className="font-bold text-sm" style={{ color: "#FF1493" }}>
                Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
              </span>
              <ShoppingCart size={12} style={{ color: "#FF1493", marginLeft: "auto" }} />
            </button>
            <p className="text-xs mb-3" style={{ color: "#A0AED9" }}>
              Components you want but don't have yet. Plan your next purchase!
            </p>

            <AnimatePresence>
              {(showWishlist || wishlist.length > 0) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-1.5"
                >
                  {wishlist.length === 0 ? (
                    <p className="text-xs italic" style={{ color: "hsl(226, 35%, 45%)" }}>
                      Click the ♡ icon next to any component to add it here.
                    </p>
                  ) : (
                    <>
                      {wishlist.map(name => (
                        <div
                          key={name}
                          className="flex items-center justify-between px-3 py-2 rounded-lg"
                          style={{ background: "rgba(255,20,147,0.08)", border: "1px solid rgba(255,20,147,0.15)" }}
                        >
                          <span className="text-xs font-medium truncate" style={{ color: "#E0E7FF" }}>{name}</span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => moveWishlistToInventory(name)}
                              className="p-1 rounded transition-all hover:scale-110"
                              title="Got it! Move to inventory"
                              style={{ color: "#00FF88" }}
                            >
                              <Plus size={11} />
                            </button>
                            <button
                              onClick={() => toggleWishlist(name)}
                              className="p-1 rounded transition-all hover:scale-110"
                              title="Remove from wishlist"
                              style={{ color: "#FF4500" }}
                            >
                              <X size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <p className="text-xs mt-2 italic" style={{ color: "hsl(226, 35%, 55%)" }}>
                        💡 Get these components to unlock more projects!
                      </p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
                "Use 🤖 Smart Recognition to paste shopping lists",
                "Add wishlist items to plan future purchases",
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
