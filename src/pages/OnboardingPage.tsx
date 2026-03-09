import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Cpu, Zap, Rocket, ArrowRight, Package, CheckCircle } from "lucide-react";
import FadeInView from "@/components/motion/FadeInView";
import { motion } from "framer-motion";

const experienceLevels = [
  { id: "beginner", icon: "🌱", label: "Complete Beginner", desc: "Never used Arduino before", color: "hsl(var(--success))" },
  { id: "some", icon: "🔧", label: "Some Experience", desc: "Done a few tutorials", color: "hsl(var(--primary))" },
  { id: "experienced", icon: "⚡", label: "Experienced Maker", desc: "Built multiple projects", color: "hsl(var(--secondary))" },
];

const starterKits = [
  {
    id: "arduino-official", name: "Arduino Official Starter Kit",
    components: ["Arduino Uno", "Breadboard", "Jumper Wires", "LED (Red)", "LED (Green)", "LED (Blue)", "Resistor (220Ω)", "Resistor (1kΩ)", "Push Button", "Potentiometer", "Buzzer"],
  },
  {
    id: "elegoo-uno", name: "Elegoo UNO R3 Kit",
    components: ["Arduino Uno", "Breadboard", "Jumper Wires", "LED (Red)", "LED (Green)", "LED (Blue)", "RGB LED", "Resistor (220Ω)", "Resistor (1kΩ)", "Resistor (10kΩ)", "Push Button", "Potentiometer", "Buzzer", "Servo Motor (SG90)", "Ultrasonic Sensor (HC-SR04)", "Temperature Sensor (DHT11)", "16x2 LCD", "IR Sensor"],
  },
  {
    id: "vilros", name: "Vilros Starter Kit",
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
    const kit = starterKits.find(k => k.id === kitId);
    if (kit) {
      setSelectedKit(kitId);
      setSelectedComponents(kit.components);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);

    // Save name and experience level to profile
    await supabase.from("profiles").update({
      display_name: fullName.trim() || null,
    }).eq("id", user.id);

    // Save experience level locally for project recommendations
    localStorage.setItem(`experience_${user.id}`, experience);

    // Save inventory to localStorage (user-scoped)
    if (selectedComponents.length > 0) {
      localStorage.setItem(`inventory_${user.id}`, JSON.stringify(selectedComponents));
    }

    // Mark onboarding as complete
    localStorage.setItem(`onboarding_${user.id}`, "done");

    setLoading(false);
    navigate("/dashboard");
  };

  const handleSkip = () => {
    if (!user) return;
    localStorage.setItem(`onboarding_${user.id}`, "done");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "hsl(var(--background))" }}>
      <FadeInView className="w-full max-w-lg">
        <div className="rounded-2xl p-8" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold font-orbitron" style={{ color: "hsl(var(--foreground))" }}>
              ⚡ Arduino<span style={{ color: "hsl(var(--primary))" }}>Lab</span>
            </h1>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex-1 h-1.5 rounded-full" style={{ background: s <= step ? "hsl(var(--primary))" : "hsl(var(--muted))" }} />
            ))}
          </div>

          {/* Step 1: Name */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-xl font-bold mb-2" style={{ color: "hsl(var(--foreground))" }}>
                Welcome! What's your name?
              </h2>
              <p className="text-sm mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
                Tell us what to call you.
              </p>

              <input
                type="text"
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={50}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 mb-6"
                style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", "--tw-ring-color": "hsl(var(--primary))" } as any}
              />

              <button
                onClick={() => setStep(2)}
                disabled={!fullName.trim()}
                className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-40"
                style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
              >
                Continue <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {/* Step 2: Experience Level */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-xl font-bold mb-2" style={{ color: "hsl(var(--foreground))" }}>
                What's your Arduino experience?
              </h2>
              <p className="text-sm mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
                This helps us recommend the right projects for you.
              </p>

              <div className="space-y-3 mb-6">
                {experienceLevels.map(level => (
                  <button
                    key={level.id}
                    onClick={() => setExperience(level.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all hover:scale-[1.01]"
                    style={
                      experience === level.id
                        ? { background: `${level.color}15`, border: `2px solid ${level.color}`, color: "hsl(var(--foreground))" }
                        : { background: "hsl(var(--muted))", border: "2px solid transparent", color: "hsl(var(--foreground))" }
                    }
                  >
                    <span className="text-2xl">{level.icon}</span>
                    <div>
                      <p className="font-semibold text-sm">{level.label}</p>
                      <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{level.desc}</p>
                    </div>
                    {experience === level.id && <CheckCircle size={18} className="ml-auto" style={{ color: level.color }} />}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!experience}
                className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-40"
                style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
              >
                Continue <ArrowRight size={16} />
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full py-2 mt-2 text-xs font-medium hover:underline"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                ← Back
              </button>
            </motion.div>
          )}

          {/* Step 3: Component Inventory */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-xl font-bold mb-2" style={{ color: "hsl(var(--foreground))" }}>
                What components do you have?
              </h2>
              <p className="text-sm mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
                Select a starter kit or skip to add components later.
              </p>

              <div className="space-y-3 mb-4">
                {starterKits.map(kit => (
                  <button
                    key={kit.id}
                    onClick={() => handleSelectKit(kit.id)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:scale-[1.01]"
                    style={
                      selectedKit === kit.id
                        ? { background: "hsl(var(--primary) / 0.1)", border: "2px solid hsl(var(--primary))" }
                        : { background: "hsl(var(--muted))", border: "2px solid transparent" }
                    }
                  >
                    <Package size={20} style={{ color: selectedKit === kit.id ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }} />
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color: "hsl(var(--foreground))" }}>{kit.name}</p>
                      <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{kit.components.length} components</p>
                    </div>
                    {selectedKit === kit.id && <CheckCircle size={18} style={{ color: "hsl(var(--primary))" }} />}
                  </button>
                ))}
              </div>

              {selectedKit && (
                <div className="mb-6 p-3 rounded-xl" style={{ background: "hsl(var(--muted))" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "hsl(var(--primary))" }}>Included components:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedComponents.map(c => (
                      <span key={c} className="text-xs px-2 py-0.5 rounded-lg" style={{ background: "hsl(var(--background))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
                >
                  {loading ? "Setting up..." : selectedComponents.length > 0 ? `Continue with ${selectedComponents.length} components` : "Continue without components"}
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => { setSelectedKit(null); setSelectedComponents([]); handleComplete(); }}
                  className="w-full py-2 text-xs font-medium hover:underline"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  Skip — I'll add components later
                </button>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-2 text-xs font-medium hover:underline"
                  style={{ color: "hsl(var(--muted-foreground))" }}
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
