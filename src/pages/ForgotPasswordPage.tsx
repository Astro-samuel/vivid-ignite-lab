import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import FadeInView from "@/components/motion/FadeInView";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

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
        <div className="rounded-2xl p-8" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-orbitron" style={{ color: "hsl(var(--foreground))" }}>
              ⚡ Arduino<span style={{ color: "hsl(var(--primary))" }}>Lab</span>
            </h1>
            <p className="text-sm mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>
              Reset your password
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircle size={48} className="mx-auto" style={{ color: "hsl(var(--success))" }} />
              <p className="text-sm" style={{ color: "hsl(var(--foreground))" }}>
                Check your email for a password reset link!
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                style={{ color: "hsl(var(--primary))" }}
              >
                <ArrowLeft size={14} /> Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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

              {error && (
                <p className="text-sm px-3 py-2 rounded-lg" style={{ background: "hsl(var(--destructive) / 0.1)", color: "hsl(var(--destructive))" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Send Reset Link"}
              </button>

              <Link
                to="/auth"
                className="flex items-center justify-center gap-2 text-sm font-medium hover:underline"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                <ArrowLeft size={14} /> Back to login
              </Link>
            </form>
          )}
        </div>
      </FadeInView>
    </div>
  );
}
