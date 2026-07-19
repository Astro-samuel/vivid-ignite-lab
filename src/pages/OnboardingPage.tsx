import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Package, CheckCircle } from "lucide-react";
import FadeInView from "@/components/motion/FadeInView";
import { motion } from "framer-motion";

const experienceLevels = [
  { id: "beginner", icon: "🌱", label: "Complete Beginner", desc: "Never used Arduino before", color: "142 71% 45%" }, // Emerald
  { id: "some", icon: "🔧", label: "Some Experience", desc: "Done a few tutorials", color: "243 75% 59%" }, // Indigo
  { id: "experienced", icon: "⚡", label: "Experienced Maker", desc: "Built multiple projects", color: "38 92% 50%" }, // Amber
];

const starterKits = [
  {
    id: "arduino-official",
    name: "Arduino Official Starter Kit",
    components: ["Arduino Uno", "Breadboard", "Jumper Wires", "LED (Red)", "LED (Green)", "LED (Blue)", "Resistor (220Ω)", "Resistor (1kΩ)", "Push Button", "Potentiometer", "Buzzer"],
  },
  {
    id: "elegoo-uno",
    name: "Elegoo UNO R3 Kit",
    components: ["Arduino Uno", "Breadboard", "Jumper Wires", "LED (Red)", "LED (Green)", "LED (Blue)", "RGB LED", "Resistor (220Ω)", "Resistor (1kΩ)", "Resistor (10kΩ)", "Push Button", "Potentiometer", "Buzzer", "Servo Motor (SG90)", "Ultrasonic Sensor (HC-SR04)", "Temperature Sensor (DHT11)", "16x2 LCD", "IR Sensor"],
  },
  {
    id: "vilros",
    name: "Vilros Starter Kit",
    components: ["Arduino Uno", "Breadboard", "Jumper Wires", "LED (Red)", "LED (Green)", "Resistor (220Ω)", "Resistor (10kΩ)", "Push Button", "Potentiometer", "Buzzer", "Photoresistor (LDR)", "Servo Motor (SG90)"],
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [experience, setExperience] = useState("");
  const [selectedKit, setSelectedKit] = useState<string | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSelectKit = (kitId: string) => {
    const kit = starterKits.find((k) => k.id === kitId);
    if (kit) {
      setSelectedKit(kitId);
      setSelectedComponents(kit.components);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);

    await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        display_name: fullName.trim() || null,
      });

    localStorage.setItem(`experience_${user.id}`, experience);

    if (selectedComponents.length > 0) {
      localStorage.setItem(`inventory_${user.id}`, JSON.stringify(selectedComponents));
    }

    localStorage.setItem(`onboarding_${user.id}`, "done");

    setLoading(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <FadeInView className="w-full max-w-lg">
        <div className="bg-card border-2 border-b-4 border-border rounded-3xl p-8 shadow-sm">
          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold font-display text-foreground flex items-center justify-center gap-1.5">
              <span>⚡</span> Ignite<span className="text-primary font-extrabold font-display">Lab</span>
            </h1>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2 mb-8 bg-[hsl(var(--background-hover))] p-1 rounded-full">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-all duration-350 ${
                  s <= step ? "bg-primary" : "bg-transparent"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Name */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl font-extrabold font-display text-foreground mb-2">
                Welcome! What's your name?
              </h2>
              <p className="text-sm font-semibold text-muted-foreground mb-6">
                Tell us what we should call you as you build.
              </p>

              <input
                type="text"
                placeholder="Your display name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={50}
                className="w-full px-4 py-3 bg-background hover:bg-[hsl(var(--background-hover))]/50 border-2 border-input rounded-xl text-sm font-semibold focus:outline-none focus:border-primary focus:bg-card text-foreground transition-all placeholder:text-muted-foreground placeholder:font-bold mb-6"
              />

              <button
                onClick={() => setStep(2)}
                disabled={!fullName.trim()}
                className="w-full py-3 bg-primary hover:bg-primary/90 border-2 border-b-4 border-[hsl(var(--primary-dark))] active:border-b-2 active:translate-y-[2px] rounded-xl text-sm font-extrabold text-primary-foreground flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-40 disabled:pointer-events-none"
              >
                Continue <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {/* Step 2: Experience Level */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl font-extrabold font-display text-foreground mb-2">
                What's your Arduino experience?
              </h2>
              <p className="text-sm font-semibold text-muted-foreground mb-6">
                We'll tailor the recommended learning path to your starting point.
              </p>

              <div className="space-y-3 mb-6">
                {experienceLevels.map((level) => {
                  const active = experience === level.id;
                  return (
                    <button
                      key={level.id}
                      onClick={() => setExperience(level.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left border-2 border-b-4 transition-all hover:translate-y-[-1px] ${
                        active
                          ? "bg-card border-primary"
                          : "bg-background border-border"
                      }`}
                    >
                      <span className="text-3xl">{level.icon}</span>
                      <div className="flex-1">
                        <p className="font-extrabold text-foreground text-sm">{level.label}</p>
                        <p className="text-xs font-semibold text-muted-foreground mt-0.5">{level.desc}</p>
                      </div>
                      {active && (
                        <CheckCircle size={18} className="text-primary flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setStep(3)}
                  disabled={!experience}
                  className="w-full py-3 bg-primary hover:bg-primary/90 border-2 border-b-4 border-[hsl(var(--primary-dark))] active:border-b-2 active:translate-y-[2px] rounded-xl text-sm font-extrabold text-primary-foreground flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-40 disabled:pointer-events-none"
                >
                  Continue <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => setStep(1)}
                  className="w-full py-2 bg-background hover:bg-[hsl(var(--background-hover))] border-2 border-b-4 border-border active:border-b-2 active:translate-y-[2px] rounded-xl text-xs font-extrabold text-muted-foreground flex items-center justify-center gap-2 transition-all"
                >
                  ← Back
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Component Inventory */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl font-extrabold font-display text-foreground mb-2">
                What components do you have?
              </h2>
              <p className="text-sm font-semibold text-muted-foreground mb-6">
                Select your starter kit so we can automatically match lessons.
              </p>

              <div className="space-y-3 mb-4">
                {starterKits.map((kit) => {
                  const active = selectedKit === kit.id;
                  return (
                    <button
                      key={kit.id}
                      onClick={() => handleSelectKit(kit.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left border-2 border-b-4 transition-all hover:translate-y-[-1px] ${
                        active
                          ? "bg-card border-primary"
                          : "bg-background border-border"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 border-b-4 ${
                          active
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-card border-border text-muted-foreground"
                        }`}
                      >
                        <Package size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-extrabold text-foreground text-sm">{kit.name}</p>
                        <p className="text-xs font-bold text-muted-foreground mt-0.5">
                          {kit.components.length} components
                        </p>
                      </div>
                      {active && <CheckCircle size={18} className="text-primary" />}
                    </button>
                  );
                })}
              </div>

              {selectedKit && (
                <div className="mb-6 p-4 rounded-2xl bg-primary/10 border-2 border-primary/30">
                  <p className="text-xs font-bold text-primary mb-2">Included components:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedComponents.map((c) => (
                      <span
                        key={c}
                        className="text-xs px-2.5 py-1 rounded-xl bg-card text-foreground border border-border font-semibold"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="w-full py-3 bg-success hover:bg-success/90 border-2 border-b-4 border-[hsl(var(--success-dark))] active:border-b-2 active:translate-y-[2px] rounded-xl text-sm font-extrabold text-primary-foreground flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  {loading
                    ? "Setting up..."
                    : selectedComponents.length > 0
                    ? `Continue with ${selectedComponents.length} components`
                    : "Continue without components"}
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => {
                    setSelectedKit(null);
                    setSelectedComponents([]);
                    handleComplete();
                  }}
                  className="w-full py-2.5 bg-background hover:bg-[hsl(var(--background-hover))] border-2 border-b-4 border-border active:border-b-2 active:translate-y-[2px] rounded-xl text-xs font-extrabold text-muted-foreground flex items-center justify-center gap-2 transition-all"
                >
                  Skip — I'll add components later
                </button>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-2 text-xs font-bold text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
                >
                  ← Back
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </FadeInView>
    </div>
  );
}
