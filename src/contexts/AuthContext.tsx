import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export const DEMO_USER: User = {
  id: "demo-maker-001",
  app_metadata: { provider: "email" },
  user_metadata: { username: "Demo Maker", display_name: "Demo Maker" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
  email: "demo.maker@arduinolab.local",
  phone: "",
  role: "authenticated",
  updated_at: new Date().toISOString(),
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signInAsGuest: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("demo_session") === "true") {
      setUser(DEMO_USER);
      setSession({
        access_token: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "demo_token",
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: "demo_refresh",
        user: DEMO_USER,
      } as Session);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (localStorage.getItem("demo_session") === "true") return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle expired/invalid refresh tokens by signing out
      if (event === "TOKEN_REFRESHED" && !session) {
        await supabase.auth.signOut();
        return;
      }

      // Update streak on sign-in
      if (event === "SIGNED_IN" && session?.user) {
        setTimeout(() => updateStreak(session.user.id), 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (localStorage.getItem("demo_session") === "true") return;
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
    if (userId === DEMO_USER.id) return;
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

  const signInAsGuest = async () => {
    localStorage.setItem("demo_session", "true");
    localStorage.setItem(`onboarding_${DEMO_USER.id}`, "done");
    setUser(DEMO_USER);
    setSession({
      access_token: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "demo_token",
      token_type: "bearer",
      expires_in: 3600,
      refresh_token: "demo_refresh",
      user: DEMO_USER,
    } as Session);
    setLoading(false);
    return { error: null };
  };

  const signOut = async () => {
    const isDemo = localStorage.getItem("demo_session") === "true";
    localStorage.removeItem("demo_session");
    if (!isDemo) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore signout errors
      }
    }
    setUser(null);
    setSession(null);
    // Clear all user-scoped and legacy app data
    const legacyKeys = ["userInventory", "activeGeneratedProject", "savedProjects", "removedCatalogProjects"];
    legacyKeys.forEach((key) => localStorage.removeItem(key));
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

