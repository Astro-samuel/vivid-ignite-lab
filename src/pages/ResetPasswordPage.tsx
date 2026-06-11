import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import FadeInView from "@/components/motion/FadeInView";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else {
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    }
    setLoading(false);
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "hsl(var(--background))" }}>
        <FadeInView className="w-full max-w-md text-center">
          <div className="bg-white border-2 border-b-4 border-slate-100 rounded-3xl p-8 shadow-sm">
            <p className="text-sm font-semibold text-slate-500 mb-6">
              Invalid or expired reset link. Please request a new link to proceed.
            </p>
            <button
              onClick={() => navigate("/forgot-password")}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 border-2 border-b-4 border-indigo-700 active:border-b-2 active:translate-y-[2px] rounded-xl text-sm font-extrabold text-white transition-all shadow-sm"
            >
              Request New Link
            </button>
          </div>
        </FadeInView>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "hsl(var(--background))" }}>
      <FadeInView className="w-full max-w-md">
        <div className="bg-white border-2 border-b-4 border-slate-100 rounded-3xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold font-display text-indigo-950 flex items-center justify-center gap-1.5">
              <span>⚡</span> Ignite<span className="text-indigo-600 font-extrabold font-display">Lab</span>
            </h1>
            <p className="text-sm font-bold text-slate-400 mt-2">
              Set your new password
            </p>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <CheckCircle size={48} className="mx-auto text-emerald-500 animate-bounce" />
              <p className="text-sm font-bold text-emerald-700">
                Password updated! Redirecting to dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="New password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 border-2 border-slate-100 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all placeholder:text-slate-400 placeholder:font-bold"
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 border-2 border-slate-100 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all placeholder:text-slate-400 placeholder:font-bold"
                />
              </div>

              {error && (
                <p className="text-xs font-bold px-4 py-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 border-2 border-b-4 border-indigo-700 active:border-b-2 active:translate-y-[2px] rounded-xl text-sm font-extrabold text-white flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? <Loader2 size={16} className="animate-spin text-white" /> : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </FadeInView>
    </div>
  );
}
