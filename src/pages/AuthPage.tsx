import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import FadeInView from "@/components/motion/FadeInView";

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
      const { error, data } = await signIn(email, password);
      if (error) setError(error.message);
      else {
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
      redirect_uri: window.location.origin,
    });
    if (error) setError(error.message || "Google sign-in failed");
    setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "hsl(var(--background))" }}>
      <FadeInView className="w-full max-w-md">
        <div className="bg-white border-2 border-b-4 border-slate-100 rounded-3xl p-8 shadow-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold font-display text-indigo-950 flex items-center justify-center gap-1.5">
              <span>⚡</span> Ignite<span className="text-indigo-600 font-extrabold font-display">Lab</span>
            </h1>
            <p className="text-sm font-bold text-slate-400 mt-2">
              {mode === "login" ? "Welcome back, maker!" : "Join the maker community"}
            </p>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full py-3 bg-white hover:bg-slate-50 border-2 border-b-4 border-slate-200 active:border-b-2 active:translate-y-[2px] rounded-xl text-sm font-extrabold flex items-center justify-center gap-3 transition-all text-slate-600 mb-6"
          >
            {googleLoading ? (
              <Loader2 size={16} className="animate-spin text-slate-500" />
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

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-0.5 bg-slate-100" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">or</span>
            <div className="flex-1 h-0.5 bg-slate-100" />
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
            {(["login", "signup"] as const).map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setError("");
                    setConfirmMsg("");
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all border-2 border-b-4 ${
                    active
                      ? "bg-white border-slate-200 text-indigo-600 shadow-sm"
                      : "bg-transparent border-transparent text-slate-500 hover:text-slate-600"
                  }`}
                >
                  {m === "login" ? "Log In" : "Sign Up"}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Username"
                  required
                  minLength={3}
                  maxLength={30}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 border-2 border-slate-100 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all placeholder:text-slate-400 placeholder:font-bold"
                />
              </div>
            )}
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 border-2 border-slate-100 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all placeholder:text-slate-400 placeholder:font-bold"
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="Password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 border-2 border-slate-100 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all placeholder:text-slate-400 placeholder:font-bold"
              />
            </div>

            {mode === "login" && (
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs font-bold text-indigo-500 hover:text-indigo-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
            )}

            {error && (
              <p className="text-xs font-bold px-4 py-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
                {error}
              </p>
            )}
            {confirmMsg && (
              <p className="text-xs font-bold px-4 py-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
                {confirmMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 border-2 border-b-4 border-indigo-700 active:border-b-2 active:translate-y-[2px] rounded-xl text-sm font-extrabold text-white flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin text-white" />
              ) : (
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
