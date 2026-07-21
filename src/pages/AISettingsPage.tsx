import { useState, useEffect } from "react";
import { Bot, Save, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import FadeInView from "@/components/motion/FadeInView";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AIPreferences {
  tone: "encouraging" | "direct" | "playful" | "professional";
  hintDepth: "minimal" | "balanced" | "detailed";
  formality: "casual" | "neutral" | "technical";
}

const defaultPrefs: AIPreferences = { tone: "encouraging", hintDepth: "balanced", formality: "casual" };

const toneOptions = [
  { value: "encouraging", label: "🎉 Encouraging", desc: "Warm, celebratory, lots of positive reinforcement" },
  { value: "direct", label: "🎯 Direct", desc: "Straight to the point, no fluff" },
  { value: "playful", label: "🎮 Playful", desc: "Fun, witty, uses humor and analogies" },
  { value: "professional", label: "📋 Professional", desc: "Formal, structured, textbook-style" },
];

const hintOptions = [
  { value: "minimal", label: "💡 Minimal", desc: "Just a nudge — figure it out yourself" },
  { value: "balanced", label: "⚖️ Balanced", desc: "Hints with enough context to guide you" },
  { value: "detailed", label: "📖 Detailed", desc: "Full explanations with examples" },
];

const formalityOptions = [
  { value: "casual", label: "💬 Casual", desc: "Like chatting with a friend who knows electronics" },
  { value: "neutral", label: "📝 Neutral", desc: "Clear and approachable, middle ground" },
  { value: "technical", label: "🔧 Technical", desc: "Uses proper terminology and specifications" },
];

function OptionGroup({ title, options, value, onChange }: {
  title: string;
  options: { value: string; label: string; desc: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <h3 className="font-bold text-sm mb-3" style={{ color: "hsl(var(--foreground))" }}>{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="text-left p-3 rounded-xl border transition-all hover:scale-[1.01]"
              style={selected ? {
                background: "hsl(var(--primary) / 0.1)",
                borderColor: "hsl(var(--primary) / 0.5)",
              } : {
                background: "hsl(var(--muted))",
                borderColor: "hsl(var(--border))",
              }}
            >
              <p className="text-sm font-semibold mb-0.5" style={{ color: selected ? "hsl(var(--primary))" : "hsl(var(--foreground))" }}>
                {opt.label}
              </p>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{opt.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AISettingsPage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<AIPreferences>(defaultPrefs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("ai_preferences").eq("id", user.id).single().then(({ data }) => {
      if (data?.ai_preferences) {
        setPrefs({ ...defaultPrefs, ...(data.ai_preferences as Partial<AIPreferences>) });
      }
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    // Fetch latest profile to merge data
    const { data: profile } = await supabase.from("profiles").select("ai_preferences").eq("id", user.id).single();
    const currentPreferences = (profile?.ai_preferences as any) || {};

    await supabase.from("profiles").update({
      ai_preferences: { ...currentPreferences, ...prefs },
    }).eq("id", user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Layout>
      <div className="px-8 py-10 max-w-2xl mx-auto">
        <FadeInView className="flex items-center gap-3 mb-8">
          <Bot size={22} style={{ color: "hsl(var(--primary))" }} />
          <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>AI Mentor Settings</h1>
        </FadeInView>

        <div className="space-y-6">
          <div className="rounded-2xl p-6 border space-y-6" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
            <OptionGroup
              title="Tone"
              options={toneOptions}
              value={prefs.tone}
              onChange={(v) => setPrefs((p) => ({ ...p, tone: v as AIPreferences["tone"] }))}
            />
            <OptionGroup
              title="Hint Depth"
              options={hintOptions}
              value={prefs.hintDepth}
              onChange={(v) => setPrefs((p) => ({ ...p, hintDepth: v as AIPreferences["hintDepth"] }))}
            />
            <OptionGroup
              title="Formality"
              options={formalityOptions}
              value={prefs.formality}
              onChange={(v) => setPrefs((p) => ({ ...p, formality: v as AIPreferences["formality"] }))}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-70"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
            }}
          >
            <Save size={16} /> {saving ? "Saving..." : "Save Preferences"}
          </button>

          {/* Preview */}
          <div className="rounded-2xl p-5 border" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
            <h3 className="font-bold text-sm mb-3" style={{ color: "hsl(var(--foreground))" }}>Preview</h3>
            <div className="rounded-xl p-4 text-sm" style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>
              {prefs.tone === "encouraging" && prefs.formality === "casual" && "Hey, awesome job getting that LED to blink! 🎉 Now, have you thought about what happens if you add a second LED to a different pin?"}
              {prefs.tone === "encouraging" && prefs.formality === "neutral" && "Great work on the LED blink! Next, consider connecting a second LED to explore multi-pin output control."}
              {prefs.tone === "encouraging" && prefs.formality === "technical" && "Excellent progress with GPIO output. Consider expanding to multi-channel PWM by assigning additional digital pins for parallel LED control."}
              {prefs.tone === "direct" && prefs.formality === "casual" && "LED works. Now try adding a second one on pin 12. Same resistor setup."}
              {prefs.tone === "direct" && prefs.formality === "neutral" && "Your LED circuit is functional. Add a second LED to pin 12 with a 220Ω resistor."}
              {prefs.tone === "direct" && prefs.formality === "technical" && "Output verified on pin 13. Replicate the circuit on pin 12 with identical current-limiting resistance (220Ω)."}
              {prefs.tone === "playful" && prefs.formality === "casual" && "Look at you, making LEDs dance! 💡 What if we gave it a buddy? Two LEDs are better than one, right? 😄"}
              {prefs.tone === "playful" && prefs.formality === "neutral" && "Nice blinker! Now imagine it has a friend — add another LED and make them take turns. Like a tiny light show!"}
              {prefs.tone === "playful" && prefs.formality === "technical" && "LED operational — time for a duet! Configure an additional GPIO output with alternating HIGH/LOW states for a chase effect."}
              {prefs.tone === "professional" && prefs.formality === "casual" && "Your LED circuit is working correctly. I'd suggest extending the project by adding a second output channel."}
              {prefs.tone === "professional" && prefs.formality === "neutral" && "The LED blink test has been completed successfully. The next step would be to add an additional LED output on a separate GPIO pin."}
              {prefs.tone === "professional" && prefs.formality === "technical" && "Test case passed: Digital output on GPIO 13 confirmed. Proceed to implement a secondary output channel on GPIO 12 with appropriate current-limiting circuitry."}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 px-5 py-3 rounded-xl flex items-center gap-2 font-semibold z-50"
            style={{ background: "hsl(var(--success))", color: "hsl(var(--background))" }}>
            <CheckCircle size={16} /> Preferences Saved!
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
