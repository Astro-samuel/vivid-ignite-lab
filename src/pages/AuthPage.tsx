import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import FadeInView from "@/components/motion/FadeInView";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

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

      // Check username availability
      const { data: available, error: checkErr } = await supabase.rpc("check_username_available", {
        desired_username: username.trim(),
      });
      if (checkErr) {
        setError("Could not verify username. Try again.");
        setLoading(false);
        return;
      }
      if (!available) {
        setError("Username is already taken");
        setLoading(false);
        return;
      }

      const { error } = await signUp(email, password, username.trim());
      if (error) setError(error.message);
      else setConfirmMsg("Check your email to confirm your account!");
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
      else navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) setError(error.message || "Google sign-in failed");
    setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "hsl(var(--background))" }}>
      <FadeInView className="w-full max-w-md">
        <div className="rounded-2xl p-8" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-orbitron" style={{ color: "hsl(var(--foreground))" }}>
              ⚡ Arduino<span style={{ color: "hsl(var(--primary))" }}>Lab</span>
            </h1>
            <p className="text-sm mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>
              {mode === "login" ? "Welcome back, maker!" : "Join the maker community"}
            </p>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] disabled:opacity-50 mb-4"
            style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
          >
            {googleLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: "hsl(var(--border))" }} />
            <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "hsl(var(--border))" }} />
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl mb-6 p-1" style={{ background: "hsl(var(--muted))" }}>
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); setConfirmMsg(""); }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
                style={mode === m
                  ? { background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }
                  : { color: "hsl(var(--muted-foreground))" }}
              >
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--muted-foreground))" }} />
                <input
                  type="text"
                  placeholder="Username"
                  required
                  minLength={3}
                  maxLength={30}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
                  style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", "--tw-ring-color": "hsl(var(--primary))" } as any}
                />
              </div>
            )}
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--muted-foreground))" }} />
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", "--tw-ring-color": "hsl(var(--primary))" } as any}
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--muted-foreground))" }} />
              <input
                type="password"
                placeholder="Password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", "--tw-ring-color": "hsl(var(--primary))" } as any}
              />
            </div>

            {mode === "login" && (
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs hover:underline" style={{ color: "hsl(var(--primary))" }}>
                  Forgot password?
                </Link>
              </div>
            )}

            {error && (
              <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "hsl(var(--destructive) / 0.1)", color: "hsl(var(--destructive))" }}>
                {error}
              </p>
            )}
            {confirmMsg && (
              <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "hsl(var(--success) / 0.1)", color: "hsl(var(--success))" }}>
                {confirmMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : (
                <>
                  {mode === "login" ? "Log In" : "Create Account"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </FadeInView>
    </div>
  );
}
