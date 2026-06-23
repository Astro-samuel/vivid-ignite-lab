import { useState } from "react";
import { BookOpen, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const EXPLAIN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/explain-code`;

interface ExplainCodeProps {
  code: string;
}

export default function ExplainCode({ code }: ExplainCodeProps) {
  const [open, setOpen] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const explain = async () => {
    if (loading) return;
    setOpen(true);
    setExplanation("");
    setError("");
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { setError("Please log in to use this feature."); setLoading(false); return; }
      const resp = await fetch(EXPLAIN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setError(data.error || "Failed to get explanation");
        setLoading(false);
        return;
      }

      if (!resp.body) { setError("No response"); setLoading(false); return; }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              text += content;
              setExplanation(text);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch {
      setError("Connection failed");
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={explain}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 disabled:opacity-60"
        style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.3)" }}
      >
        <BookOpen size={12} /> {loading ? "Explaining..." : "Explain Code"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="fixed inset-0 bg-black/60" />
          <div
            className="relative w-full max-w-2xl max-h-[80vh] rounded-2xl border overflow-hidden flex flex-col"
            style={{ background: "hsl(229, 45%, 12%)", borderColor: "rgba(245,158,11,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "hsl(229, 42%, 22%)", background: "rgba(245,158,11,0.06)" }}>
              <div className="flex items-center gap-2">
                <BookOpen size={16} style={{ color: "#F59E0B" }} />
                <span className="font-bold text-sm" style={{ color: "#F59E0B" }}>AI Code Explanation</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/10" style={{ color: "#A0AED9" }}>
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {loading && !explanation && (
                <div className="flex items-center gap-2" style={{ color: "#A0AED9" }}>
                  <Loader2 size={16} className="animate-spin" /> Analyzing your code...
                </div>
              )}
              {error && (
                <p className="text-sm" style={{ color: "#FF4500" }}>{error}</p>
              )}
              {explanation && (
                <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#E0E7FF" }}>
                  {explanation}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
