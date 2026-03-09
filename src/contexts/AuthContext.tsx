import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Update streak on sign-in
      if (event === "SIGNED_IN" && session?.user) {
        setTimeout(() => updateStreak(session.user.id), 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Also check streak on page load if already signed in
      if (session?.user) {
        setTimeout(() => updateStreak(session.user.id), 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateStreak = async (userId: string) => {
    const todayKey = `streak_checked_${userId}`;
    const today = new Date().toISOString().slice(0, 10);

    // Only check once per day
    if (localStorage.getItem(todayKey) === today) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("streak_days, updated_at")
      .eq("id", userId)
      .single();

    if (!profile) return;

    const lastUpdate = profile.updated_at ? new Date(profile.updated_at).toISOString().slice(0, 10) : null;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    let newStreak = profile.streak_days || 0;

    if (lastUpdate === today) {
      // Already updated today, no change
    } else if (lastUpdate === yesterday) {
      // Consecutive day — increment streak
      newStreak += 1;
    } else {
      // Streak broken — reset to 1
      newStreak = 1;
    }

    await supabase.from("profiles").update({
      streak_days: newStreak,
      updated_at: new Date().toISOString(),
    }).eq("id", userId);

    localStorage.setItem(todayKey, today);
  };

  const signUp = async (email: string, password: string, username?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: username },
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    return { error, data };
  };

  const signOut = async () => {
    const userId = user?.id;
    await supabase.auth.signOut();
    // Clear all user-scoped and legacy app data
    const legacyKeys = ["userInventory", "activeGeneratedProject", "savedProjects", "removedCatalogProjects"];
    legacyKeys.forEach((key) => localStorage.removeItem(key));
    if (userId) {
      localStorage.removeItem(`inventory_${userId}`);
      localStorage.removeItem(`onboarding_${userId}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
