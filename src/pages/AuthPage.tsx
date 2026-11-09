import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, DEMO_USER } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import FadeInView from "@/components/motion/FadeInView";
import { LogoMark } from "@/components/Sidebar";
import Mascot from "@/components/Mascot";

export default function AuthPage() {
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      if (user) {
        if (user.id === DEMO_USER.id) {
          navigate("/dashboard", { replace: true });
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();

        if (profile?.display_name) {
          localStorage.setItem(`onboarding_${user.id}`, "done");
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/onboarding", { replace: true });
        }
      }
    };

    if (!authLoading) {
      checkUser();
    }
  }, [user, authLoading, navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setConfirmMsg("");
    setLoading(true);

    if (mode === "signup") {
      if (!username.trim()) {
        setError("Username is required");
        setLoading(false);
        return;
      }
      if (username.trim().length < 3) {
        setError("Username must be at least 3 characters");
        setLoading(false);
        return;
      }

      const { error } = await signUp(email, password, username.trim());
      if (error) {
        const msg = error.message || "";
        if (/duplicate|unique|profiles_username/i.test(msg)) {
          setError("Username is already taken");
        } else {
          setError(msg);
        }
      }
      else setConfirmMsg("Check your email to confirm your account!");
    } else {
      const { error, data } = await signIn(email, password);
      if (error) {
        setError(error.message || "Invalid credentials. Please check your email and password.");
      } else {
        const userId = data?.user?.id;
        if (userId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", userId)
            .single();
          if (profile?.display_name) {
            localStorage.setItem(`onboarding_${userId}`, "done");
            navigate("/dashboard");
          } else {
            navigate("/onboarding");
          }
        } else {
          navigate("/dashboard");
        }
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth`,
    });
    if (error) setError(error.message || "Google sign-in failed. Please try again.");
    setGoogleLoading(false);
  };

  const inputCls =
    "w-full pl-11 pr-3 py-3 bg-[hsl(var(--background-hover))] border-2 border-border rounded-2xl text-[16px] font-bold text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:border-[hsl(var(--blue-bright))] focus:bg-card";

  return (
    <div className="min-h-screen grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] bg-background">
      {/* Brand panel */}
      <aside className="hidden lg:flex flex-col items-center justify-center text-center gap-6 p-12 text-white" style={{ background: "hsl(var(--primary))" }}>
        <Mascot size={200} mood="cheer" bob />
        <p className="font-black text-4xl leading-[1.15] max-w-[16ch]">Pick up the sketch where you left it.</p>
        <p className="text-[17px] max-w-[36ch] opacity-90">Your lessons, components, saved sketches and streak follow your account.</p>
      </aside>

      {/* Form */}
      <main className="flex items-center justify-center px-5 py-12">
        <FadeInView className="w-full max-w-[400px]">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8 w-fit" aria-label="ArduinoLab home">
            <span className="rounded-lg overflow-hidden flex bg-[hsl(var(--sidebar-background))]"><LogoMark size={30} /></span>
            <span className="font-display font-bold text-lg text-foreground">ArduinoLab</span>
          </Link>

          <h1 className="font-black text-3xl text-foreground">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            {mode === "login" ? "Sign in to continue your lessons." : "Free. Takes a minute."}
          </p>

          <div role="tablist" aria-label="Sign in or sign up" className="mt-7 grid grid-cols-2 border-b border-border">
            {(["login", "signup"] as const).map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => { setMode(m); setError(""); setConfirmMsg(""); }}
                  className={`pb-3 -mb-px text-sm font-extrabold uppercase tracking-wider border-b-4 transition-colors ${
                    active ? "border-[hsl(var(--blue-bright))] text-secondary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "login" ? "Sign in" : "Sign up"}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label htmlFor="auth-username" className="block text-sm font-semibold text-foreground mb-1.5">Username</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input id="auth-username" type="text" required minLength={3} maxLength={30} autoComplete="username"
                    value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls} />
                </div>
              </div>
            )}
            <div>
              <label htmlFor="auth-email" className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input id="auth-email" type="email" required autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label htmlFor="auth-password" className="block text-sm font-semibold text-foreground">Password</label>
                {mode === "login" && (
                  <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline underline-offset-4">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input id="auth-password" type="password" required minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
              </div>
              {mode === "signup" && <p className="mt-1.5 text-xs text-muted-foreground">At least 6 characters.</p>}
            </div>

            {error && (
              <p role="alert" className="text-sm px-3 py-2.5 bg-destructive/10 border border-destructive/30 text-[hsl(var(--destructive-dark))] rounded-lg">
                {error}
              </p>
            )}
            {confirmMsg && (
              <p role="status" className="text-sm px-3 py-2.5 bg-success/10 border border-success/30 text-[hsl(var(--success-dark))] rounded-lg">
                {confirmMsg}
              </p>
            )}

            <button type="submit" disabled={loading} className="clay-btn clay-btn-primary clay-btn-lg w-full">
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign in" : "Create account"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6" aria-hidden="true">
            <div className="flex-1 h-px bg-border" />
            <span className="silk">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button type="button" onClick={handleGoogleSignIn} disabled={googleLoading} className="clay-btn clay-btn-ghost w-full !py-3">
            {googleLoading ? (
              <Loader2 size={16} className="animate-spin text-muted-foreground" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>
        </FadeInView>
      </main>
    </div>
  );
}
