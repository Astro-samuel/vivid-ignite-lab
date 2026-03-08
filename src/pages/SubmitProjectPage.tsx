import { useState } from "react";
import { Send, CheckCircle, ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import FadeInView from "@/components/motion/FadeInView";

const difficultyOptions = ["beginner", "intermediate", "advanced"];

export default function SubmitProjectPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    difficulty: "beginner",
    components: "",
    estimatedTime: "30",
    authorName: "",
    authorEmail: "",
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.components.trim() || !form.authorName.trim()) return;
    setLoading(true);

    const { error } = await supabase.from("community_projects" as any).insert({
      title: form.title.trim(),
      description: form.description.trim(),
      difficulty: form.difficulty,
      components: form.components.split(",").map((c) => c.trim()).filter(Boolean),
      estimated_time: `${form.estimatedTime} mins`,
      author_name: form.authorName.trim(),
      author_email: form.authorEmail.trim() || null,
    } as any);

    setLoading(false);
    if (error) {
      console.error("Submit error:", error);
      alert("Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Layout>
        <div className="px-8 py-20 max-w-lg mx-auto text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: "#FFFFFF" }}>Project Submitted!</h1>
          <p className="text-sm mb-6" style={{ color: "#A0AED9" }}>
            Thanks for contributing, {form.authorName}! Your project will be reviewed and may appear in the catalog soon.
          </p>
          <button
            onClick={() => navigate("/catalog")}
            className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #00F5FF, #0099FF)", color: "#0A0E27" }}
          >
            Back to Catalog
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-8 py-10 max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/catalog")}
          className="flex items-center gap-2 text-sm font-medium mb-6 transition-all hover:gap-3"
          style={{ color: "#00F5FF" }}
        >
          <ArrowLeft size={16} /> Back to Catalog
        </button>

        <FadeInView className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#FFFFFF" }}>
            Submit a <span style={{ color: "#00FF88" }}>Project</span>
          </h1>
          <p className="text-sm" style={{ color: "#A0AED9" }}>
            Share your Arduino project with the community! It will be reviewed before appearing in the catalog.
          </p>
        </FadeInView>

        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#E0E7FF" }}>Project Title *</label>
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Smart Plant Monitor"
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ background: "hsl(229, 45%, 16%)", border: "1px solid hsl(229, 42%, 28%)", color: "#FFFFFF" }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#E0E7FF" }}>Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="What does this project do? What will the builder learn?"
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
              style={{ background: "hsl(229, 45%, 16%)", border: "1px solid hsl(229, 42%, 28%)", color: "#FFFFFF" }}
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#E0E7FF" }}>Difficulty</label>
            <div className="flex gap-2">
              {difficultyOptions.map((d) => (
                <button
                  key={d}
                  onClick={() => update("difficulty", d)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
                  style={
                    form.difficulty === d
                      ? { background: "rgba(0,245,255,0.15)", color: "#00F5FF", border: "1px solid rgba(0,245,255,0.4)" }
                      : { background: "hsl(229, 45%, 16%)", color: "#A0AED9", border: "1px solid hsl(229, 42%, 28%)" }
                  }
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Components */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#E0E7FF" }}>Components (comma-separated) *</label>
            <input
              value={form.components}
              onChange={(e) => update("components", e.target.value)}
              placeholder="Arduino Uno, LED, Resistor 220Ω, Breadboard"
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ background: "hsl(229, 45%, 16%)", border: "1px solid hsl(229, 42%, 28%)", color: "#FFFFFF" }}
            />
          </div>

          {/* Estimated time */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "#E0E7FF" }}>Estimated Time (minutes)</label>
            <input
              type="number"
              value={form.estimatedTime}
              onChange={(e) => update("estimatedTime", e.target.value)}
              min="5"
              max="300"
              className="w-32 px-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ background: "hsl(229, 45%, 16%)", border: "1px solid hsl(229, 42%, 28%)", color: "#FFFFFF" }}
            />
          </div>

          {/* Author */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#E0E7FF" }}>Your Name *</label>
              <input
                value={form.authorName}
                onChange={(e) => update("authorName", e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: "hsl(229, 45%, 16%)", border: "1px solid hsl(229, 42%, 28%)", color: "#FFFFFF" }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "#E0E7FF" }}>Email (optional)</label>
              <input
                value={form.authorEmail}
                onChange={(e) => update("authorEmail", e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: "hsl(229, 45%, 16%)", border: "1px solid hsl(229, 42%, 28%)", color: "#FFFFFF" }}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !form.title.trim() || !form.description.trim() || !form.components.trim() || !form.authorName.trim()}
            className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #00FF88, #00C853)", color: "#0A0E27", boxShadow: "0 0 15px rgba(0,255,136,0.3)" }}
          >
            {loading ? "Submitting..." : <><Send size={14} /> Submit Project</>}
          </button>
        </div>
      </div>
    </Layout>
  );
}
