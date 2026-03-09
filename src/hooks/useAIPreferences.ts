import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AIPreferences {
  tone: "encouraging" | "direct" | "playful" | "professional";
  hintDepth: "minimal" | "balanced" | "detailed";
  formality: "casual" | "neutral" | "technical";
}

const defaultPrefs: AIPreferences = { tone: "encouraging", hintDepth: "balanced", formality: "casual" };

export function useAIPreferences() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<AIPreferences>(defaultPrefs);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("ai_preferences").eq("id", user.id).single().then(({ data }) => {
      if (data?.ai_preferences) {
        setPrefs({ ...defaultPrefs, ...(data.ai_preferences as Partial<AIPreferences>) });
      }
    });
  }, [user]);

  return prefs;
}
