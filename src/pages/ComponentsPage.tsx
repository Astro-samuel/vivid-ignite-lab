import { useState, useRef } from "react";
import { toast as sonnerToast } from "sonner";
import { Minus, Plus, Save, Zap, Lightbulb, Package, Loader2, Heart, X, ShoppingCart, Check, Camera, Eye, Sparkles } from "lucide-react";
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
  { name: "Magnetometer (HMC5883L)", category: "Sensor" },
  { name: "Accelerometer/Gyro (MPU6050)", category: "Sensor" },
  { name: "Power Monitor (INA219)", category: "Sensor" },
  { name: "Microphone Module", category: "Sensor" },
  { name: "Servo Motor (SG90)", category: "Actuator" },
  { name: "DC Motor", category: "Actuator" },
  { name: "Stepper Motor", category: "Actuator" },
  { name: "Buzzer", category: "Actuator" },
  { name: "Relay Module", category: "Actuator" },
  { name: "Water Pump", category: "Actuator" },
  { name: "Laser Module", category: "Actuator" },
  { name: "16x2 LCD", category: "Display" },
  { name: "OLED Display (0.96\")", category: "Display" },
  { name: "7-Segment Display", category: "Display" },
  { name: "LED Strip (WS2812B)", category: "Display" },
  { name: "LED Matrix 8x8", category: "Display" },
  { name: "HC-05 Bluetooth", category: "Communication" },
  { name: "NRF24L01 (RF)", category: "Communication" },
  { name: "SIM800L (GSM)", category: "Communication" },
  { name: "LoRa Module", category: "Communication" },
  { name: "GPS Module", category: "Communication" },
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
  { name: "Rotary Encoder", category: "Passive" },
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
  const [baseline, setBaseline] = useState(() => JSON.stringify(Object.entries(loadQuantities()).sort()));

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
    
    // Sync to Supabase if user is logged in
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("ai_preferences").eq("id", user.id).single();
      const currentPrefs = (profile?.ai_preferences as any) || {};
      await supabase.from("profiles").update({
        ai_preferences: { ...currentPrefs, inventory_v1: quantities }
      }).eq("id", user.id);
    }
    
    sonnerToast.success("📦 Inventory saved and synced to account!");
    setSaving(false);
    setBaseline(JSON.stringify(Object.entries(quantities).sort()));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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

  // ── Selection summary ──
  const removeComponent = (name: string) => {
    setQuantities((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };
  const clearSelection = () => setQuantities({});

  const selectedByCategory = [
    ...categories.map((cat) => ({
      cat: cat as string,
      items: allComponents.filter((c) => c.category === cat && quantities[c.name] !== undefined).map((c) => c.name),
    })),
    // Items in the inventory that are not in the library (e.g. added from a kit) still need to show up.
    { cat: "Added elsewhere", items: Object.keys(quantities).filter((n) => !allComponents.some((c) => c.name === n)) },
  ].filter((g) => g.items.length > 0);
  const totalUnits = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const isDirty = JSON.stringify(Object.entries(quantities).sort()) !== baseline;
  // Visual Search
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      setPreviewImage(base64);
      setVisualSearching(true);
      setVisualResults([]);
      try {
        const { data, error } = await supabase.functions.invoke("visual-search", {
          body: { image: base64 },
        });
        if (error) throw error;
        if (data?.components) {
          setVisualResults(data.components);
        }
      } catch (e) {
        console.error("Visual search error:", e);
      }
      setVisualSearching(false);
    };
    reader.readAsDataURL(file);
  };

  const addVisualResultsToInventory = () => {
    setQuantities(prev => {
      const next = { ...prev };
      visualResults.forEach(item => { if (!next[item.name]) next[item.name] = 1; });
      return next;
    });
    setVisualResults([]);
    setPreviewImage(null);
    setShowVisualSearch(false);
  };

  // "One component away" - components on wishlist that if added would complete a project's requirements
  const ownedNames = Object.keys(quantities);

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row lg:h-full">
        {/* Main panel */}
        <div className="flex-1 min-w-0 px-5 sm:px-8 py-8 lg:py-10 lg:overflow-y-auto">
          <FadeInView className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: "hsl(var(--muted-foreground))" }}>⚙️</span>
              <span className="text-xs font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>Inventory Management</span>
            </div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: "hsl(var(--foreground))" }}>My Components</h1>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              Add the Arduino components you own. We'll generate projects that match your inventory.
            </p>
          </FadeInView>

          {/* Visual search (camera) */}
          <div className="mb-4">
            <button
              onClick={() => setShowVisualSearch(!showVisualSearch)}
              aria-expanded={showVisualSearch}
              className="clay-btn clay-btn-ghost"
            >
              <Camera size={16} /> Search by camera <Eye size={14} />
            </button>
          </div>
          {/* Visual Search Panel */}
          <AnimatePresence>
            {showVisualSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-4"
              >
                <div
                  className="rounded-2xl border p-5"
                  style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Camera size={16} style={{ color: "hsl(var(--foreground))" }} />
                      <span className="font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>Visual Component Search</span>
                    </div>
                    <button onClick={() => setShowVisualSearch(false)} style={{ color: "hsl(var(--muted-foreground))" }}>
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-xs mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Upload a photo of an electronic component you can't identify — AI will recognize it and add it to your inventory.
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {!previewImage ? (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-8 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-all hover:scale-[1.01]"
                      style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                    >
                      <Camera size={28} />
                      <span className="text-sm font-semibold">Take Photo or Upload Image</span>
                      <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Supports JPG, PNG, WEBP</span>
                    </button>
                  ) : (
                    <div>
                      <div className="rounded-xl overflow-hidden mb-3 relative">
                        <img src={previewImage} alt="Component" className="w-full max-h-48 object-contain rounded-xl" style={{ background: "hsl(var(--background))" }} />
                        <button
                          onClick={() => { setPreviewImage(null); setVisualResults([]); }}
                          className="absolute top-2 right-2 p-1.5 rounded-lg"
                          style={{ background: "hsl(var(--background) / 0.6)", color: "hsl(var(--foreground))" }}
                        >
                          <X size={12} />
                        </button>
                      </div>

                      {visualSearching && (
                        <div className="flex items-center gap-2 py-3 justify-center">
                          <Loader2 size={16} className="animate-spin" style={{ color: "hsl(var(--muted-foreground))" }} />
                          <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Analyzing image...</span>
                        </div>
                      )}

                      {visualResults.length > 0 && (
                        <div className="mt-3 p-4 rounded-xl" style={{ background: "hsl(var(--success) / 0.06)", border: "1px solid hsl(var(--success) / 0.2)" }}>
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={14} style={{ color: "hsl(var(--success))" }} />
                            <span className="text-sm font-bold" style={{ color: "hsl(var(--success))" }}>
                              Identified {visualResults.length} component{visualResults.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="space-y-1.5 mb-3">
                            {visualResults.map(item => (
                              <div key={item.name} className="flex items-center justify-between px-3 py-2 rounded-lg"
                                style={{ background: "hsl(var(--success) / 0.08)", border: "1px solid hsl(var(--success) / 0.15)" }}>
                                <span className="text-xs font-medium" style={{ color: "hsl(var(--foreground))" }}>
                                  {ownedNames.includes(item.name) ? "✓ " : "+ "}{item.name}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{
                                  background: item.confidence === "high" ? "hsl(var(--success) / 0.15)" : item.confidence === "medium" ? "hsl(var(--warning) / 0.15)" : "hsl(var(--destructive) / 0.15)",
                                  color: item.confidence === "high" ? "hsl(var(--success))" : item.confidence === "medium" ? "hsl(var(--warning))" : "hsl(var(--destructive))",
                                  border: `1px solid ${item.confidence === "high" ? "hsl(var(--success) / 0.3)" : item.confidence === "medium" ? "hsl(var(--warning) / 0.3)" : "hsl(var(--destructive) / 0.3)"}`
                                }}>
                                  {item.confidence}
                                </span>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={addVisualResultsToInventory}
                            className="w-full py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                            style={{ background: "hsl(var(--success))", color: "hsl(var(--background))" }}
                          >
                            <Plus size={14} /> Add to Inventory
                          </button>
                        </div>
                      )}

                      {!visualSearching && visualResults.length === 0 && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                          style={{ background: "hsl(var(--background-hover))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" }}
                        >
                          <Camera size={14} /> Try Another Photo
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Component Library card */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "hsl(var(--border))" }}
            >
              <span className="font-semibold" style={{ color: "hsl(var(--foreground))" }}>Component Library</span>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-1 px-5 py-3 border-b" style={{ borderColor: "hsl(var(--border))" }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={
                    activeCategory === cat
                      ? { background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }
                      : { color: "hsl(var(--muted-foreground))", background: "transparent" }
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
                        ? { background: "hsl(var(--primary) / 0.06)", border: "1px solid hsl(var(--primary) / 0.25)" }
                        : wishlisted
                        ? { background: "hsl(var(--purple) / 0.06)", border: "1px solid hsl(var(--purple) / 0.2)" }
                        : { background: "hsl(var(--background-hover))", border: "1px solid transparent" }
                    }
                    onClick={() => !owned && toggleComponent(comp.name)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        onClick={(e) => { e.stopPropagation(); toggleComponent(comp.name); }}
                        className="w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-all"
                        style={
                          owned
                            ? { background: "hsl(var(--primary))", border: "1px solid hsl(var(--primary))" }
                            : { background: "transparent", border: "1px solid hsl(var(--border))" }
                        }
                      >
                        {owned && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: owned ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}
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
                            background: wishlisted ? "hsl(var(--purple) / 0.15)" : "transparent",
                            border: wishlisted ? "1px solid hsl(var(--purple) / 0.3)" : "1px solid hsl(var(--border))",
                            color: wishlisted ? "hsl(var(--purple))" : "hsl(var(--muted-foreground))",
                          }}
                        >
                          <Heart size={11} fill={wishlisted ? "hsl(var(--purple))" : "none"} />
                        </button>
                      )}

                      {owned && (
                        <>
                          <button
                            onClick={() => adjustQty(comp.name, -1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                            style={{ background: "hsl(var(--background-hover))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-sm font-bold w-6 text-center" style={{ color: "hsl(var(--foreground))" }}>
                            {quantities[comp.name]}
                          </span>
                          <button
                            onClick={() => adjustQty(comp.name, 1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                            style={{ background: "hsl(var(--background-hover))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
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
        <div className="lg:w-80 flex-shrink-0 px-5 py-8 lg:py-10 space-y-4 border-t lg:border-t-0 lg:border-l lg:overflow-y-auto" style={{ borderColor: "hsl(var(--border))" }}>

                    {/* Selection summary */}
          <section aria-labelledby="selection-summary-title" className="clay-card p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 id="selection-summary-title" className="font-black text-lg text-foreground">Your selection</h2>
              {totalSelected > 0 && (
                <span className={`clay-badge ${isDirty ? "clay-badge-warning" : "clay-badge-success"}`}>
                  {isDirty ? "Unsaved" : <><Check size={11} /> Saved</>}
                </span>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl px-3 py-2.5" style={{ background: "hsl(var(--secondary-light))" }}>
                <dt className="silk" style={{ color: "hsl(var(--secondary))" }}>Components</dt>
                <dd className="font-black text-2xl tabular-nums" style={{ color: "hsl(var(--secondary))" }}>{totalSelected}</dd>
              </div>
              <div className="rounded-xl px-3 py-2.5" style={{ background: "hsl(var(--success-light))" }}>
                <dt className="silk" style={{ color: "hsl(var(--primary))" }}>Total units</dt>
                <dd className="font-black text-2xl tabular-nums" style={{ color: "hsl(var(--primary))" }}>{totalUnits}</dd>
              </div>
            </dl>

            {totalSelected === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nothing selected yet. Tick components in the library to add them here.
              </p>
            ) : (
              <div className="max-h-80 overflow-y-auto -mx-1 px-1 space-y-4">
                {selectedByCategory.map((group) => (
                  <div key={group.cat}>
                    <p className="silk mb-1.5">{group.cat} · {group.items.length}</p>
                    <ul className="space-y-1">
                      {group.items.map((name) => (
                        <li key={name} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 bg-[hsl(var(--background-hover))]">
                          <span className="flex-1 min-w-0 truncate text-sm font-bold text-foreground" title={name}>{name}</span>
                          <span className="font-mono text-xs font-semibold text-muted-foreground tabular-nums">×{quantities[name]}</span>
                          <button
                            onClick={() => removeComponent(name)}
                            aria-label={`Remove ${name}`}
                            className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-card transition-colors"
                          >
                            <X size={13} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 space-y-2">
              <button
                onClick={handleSave}
                disabled={saving || (!isDirty && !saving)}
                className="clay-btn clay-btn-primary w-full"
              >
                {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : saved && !isDirty ? <><Check size={15} /> Inventory saved</> : <><Save size={15} /> Save inventory</>}
              </button>
              {totalSelected > 0 && (
                <button onClick={clearSelection} className="clay-btn clay-btn-ghost clay-btn-sm w-full">
                  Clear selection
                </button>
              )}
            </div>
          </section>

          {/* Wishlist Panel */}
          <div
            className="rounded-2xl p-5 border"
            style={{ background: "hsl(var(--purple) / 0.05)", borderColor: "hsl(var(--purple) / 0.2)" }}
          >
            <button
              onClick={() => setShowWishlist(!showWishlist)}
              className="flex items-center gap-2 w-full mb-2"
            >
              <Heart size={16} style={{ color: "hsl(var(--purple))" }} fill={wishlist.length > 0 ? "hsl(var(--purple))" : "none"} />
              <span className="font-bold text-sm" style={{ color: "hsl(var(--purple))" }}>
                Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
              </span>
              <ShoppingCart size={12} style={{ color: "hsl(var(--purple))", marginLeft: "auto" }} />
            </button>
            <p className="text-xs mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
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
                    <p className="text-xs italic" style={{ color: "hsl(var(--muted-foreground))" }}>
                      Click the ♡ icon next to any component to add it here.
                    </p>
                  ) : (
                    <>
                      {wishlist.map(name => (
                        <div
                          key={name}
                          className="flex items-center justify-between px-3 py-2 rounded-lg"
                          style={{ background: "hsl(var(--purple) / 0.08)", border: "1px solid hsl(var(--purple) / 0.15)" }}
                        >
                          <span className="text-xs font-medium truncate" style={{ color: "hsl(var(--foreground))" }}>{name}</span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => moveWishlistToInventory(name)}
                              className="p-1 rounded transition-all hover:scale-110"
                              title="Got it! Move to inventory"
                              style={{ color: "hsl(var(--success))" }}
                            >
                              <Plus size={11} />
                            </button>
                            <button
                              onClick={() => toggleWishlist(name)}
                              className="p-1 rounded transition-all hover:scale-110"
                              title="Remove from wishlist"
                              style={{ color: "hsl(var(--destructive))" }}
                            >
                              <X size={11} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <p className="text-xs mt-2 italic" style={{ color: "hsl(var(--muted-foreground))" }}>
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
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={16} style={{ color: "hsl(var(--muted-foreground))" }} />
              <span className="font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>Tips for Better Projects</span>
            </div>
            <ul className="space-y-2">
              {[
                "Add all your components, even basic ones like resistors",
                "Include the quantity - it affects what projects you can build",
                "More components = more complex project suggestions",
                "Add wishlist items to plan future purchases",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <span className="mt-0.5 flex-shrink-0">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Need Components */}
          <div
            className="rounded-2xl p-5 border"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Package size={16} style={{ color: "hsl(var(--foreground))" }} />
              <span className="font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>Need Components?</span>
            </div>
            <p className="text-xs mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
              Check out our starter kits to quickly set up your inventory with common components.
            </p>
            <button
              onClick={() => navigate("/kits")}
              className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] border"
              style={{
                background: "hsl(var(--background-hover))",
                color: "hsl(var(--foreground))",
                borderColor: "hsl(var(--border))",
              }}
            >
              <Package size={14} /> Browse Kits
            </button>
          </div>

          {/* Ready to Build */}
          <div
            className="rounded-2xl p-5 border"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} style={{ color: "hsl(var(--foreground))" }} />
              <span className="font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>Ready to Build?</span>
            </div>
            <p className="text-xs mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
              Once you've added your components, let AI generate custom projects just for you.
            </p>
            <button
              onClick={() => navigate("/generate")}
              className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{
                background: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
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
