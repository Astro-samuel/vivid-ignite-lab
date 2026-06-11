import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import FadeInView from "@/components/motion/FadeInView";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "hsl(var(--background))" }}>
      <FadeInView className="w-full max-w-md">
        <div className="bg-white border-2 border-b-4 border-slate-100 rounded-3xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold font-display text-indigo-950 flex items-center justify-center gap-1.5">
              <span>⚡</span> Ignite<span className="text-indigo-600 font-extrabold font-display">Lab</span>
            </h1>
            <p className="text-sm font-bold text-slate-400 mt-2">
              Reset your password
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircle size={48} className="mx-auto text-emerald-500" />
              <p className="text-sm font-bold text-emerald-700">
                Check your email for a password reset link!
              </p>
              <button
                onClick={() => navigate("/auth")}
                className="mt-4 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 border-2 border-b-4 border-slate-300 text-slate-600 font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 mx-auto"
              >
                <ArrowLeft size={14} /> Back to login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                {loading ? <Loader2 size={16} className="animate-spin text-white" /> : "Send Reset Link"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border-2 border-b-4 border-slate-200 active:border-b-2 active:translate-y-[2px] rounded-xl text-xs font-extrabold text-slate-500 flex items-center justify-center gap-2 transition-all"
              >
                <ArrowLeft size={14} /> Back to login
              </button>
            </form>
          )}
        </div>
      </FadeInView>
    </div>
  );
}
