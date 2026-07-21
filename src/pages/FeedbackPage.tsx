import { useState } from "react";
import Layout from "@/components/Layout";
import { Star, Send, MessageSquareHeart, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import FadeInView from "@/components/motion/FadeInView";
import { motion } from "framer-motion";

const feedbackSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email").max(255).or(z.literal("")),
  rating: z.number().min(1, "Please select a rating").max(5),
  category: z.string().min(1, "Please select a category"),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(1000, "Message too long"),
});

const categories = [
  { value: "general", label: "General", emoji: "💬" },
  { value: "bug", label: "Bug Report", emoji: "🐛" },
  { value: "feature", label: "Feature Request", emoji: "💡" },
  { value: "content", label: "Content", emoji: "📚" },
  { value: "ui", label: "UI / Design", emoji: "🎨" },
];

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    const result = feedbackSchema.safeParse({ name, email: email || "", rating, category, message });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const { error } = await supabase.from("feedback" as any).insert({
      name: result.data.name,
      email: result.data.email || null,
      rating: result.data.rating,
      category: result.data.category,
      message: result.data.message,
    } as any);

    setSubmitting(false);

    if (error) {
      setErrors({ form: "Failed to submit — please try again." });
      return;
    }

    setSubmitted(true);
  };

  const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Amazing"];

  if (submitted) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[70vh] px-4">
          <div
            className="text-center p-10 rounded-2xl border max-w-md w-full"
            style={{
              background: "hsl(var(--success) / 0.08)",
              borderColor: "hsl(var(--success) / 0.25)",
            }}
          >
            <CheckCircle size={56} className="mx-auto mb-4" style={{ color: "hsl(var(--success))" }} />
            <h2 className="text-2xl font-bold mb-2 text-foreground">Thank You! 🎉</h2>
            <p className="text-sm mb-6 text-muted-foreground">
              Your feedback helps us make Arduino AI better for everyone.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setName("");
                setEmail("");
                setRating(0);
                setCategory("");
                setMessage("");
              }}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 bg-primary text-primary-foreground"
            >
              Submit Another
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <FadeInView>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquareHeart size={16} className="text-primary" />
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">
              Share Your Thoughts
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Feedback</h1>
          <p className="text-sm mb-8 text-muted-foreground">
            Help us improve Arduino AI — we read every submission!
          </p>
        </FadeInView>

        <div className="space-y-6">
          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                Name <span style={{ color: "hsl(var(--destructive))" }}>*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                placeholder="Your name"
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all bg-background text-foreground"
                style={{
                  border: errors.name ? "1px solid hsl(var(--destructive))" : "1px solid hsl(var(--input))",
                }}
              />
              {errors.name && <p className="text-xs mt-1" style={{ color: "hsl(var(--destructive))" }}>{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                Email <span className="text-xs text-muted-foreground">(optional)</span>
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                type="email"
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all bg-background text-foreground"
                style={{
                  border: errors.email ? "1px solid hsl(var(--destructive))" : "1px solid hsl(var(--input))",
                }}
              />
              {errors.email && <p className="text-xs mt-1" style={{ color: "hsl(var(--destructive))" }}>{errors.email}</p>}
            </div>
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-xs font-medium mb-2 text-muted-foreground">
              Rating <span style={{ color: "hsl(var(--destructive))" }}>*</span>
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(star)}
                  className="transition-all hover:scale-125 p-0.5"
                >
                  <Star
                    size={28}
                    fill={(hoveredStar || rating) >= star ? "hsl(var(--primary))" : "transparent"}
                    style={{
                      color: (hoveredStar || rating) >= star ? "hsl(var(--primary))" : "hsl(var(--border))",
                      transition: "all 0.15s",
                    }}
                  />
                </button>
              ))}
              {(hoveredStar || rating) > 0 && (
                <span className="ml-2 text-xs font-medium text-primary">
                  {ratingLabels[hoveredStar || rating]}
                </span>
              )}
            </div>
            {errors.rating && <p className="text-xs mt-1" style={{ color: "hsl(var(--destructive))" }}>{errors.rating}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium mb-2 text-muted-foreground">
              Category <span style={{ color: "hsl(var(--destructive))" }}>*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:scale-105"
                  style={{
                    background: category === cat.value ? "hsl(var(--primary-light))" : "hsl(var(--background-hover) / 0.4)",
                    border: category === cat.value ? "1px solid hsl(var(--primary) / 0.4)" : "1px solid hsl(var(--border))",
                    color: category === cat.value ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                  }}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
            {errors.category && <p className="text-xs mt-1" style={{ color: "hsl(var(--destructive))" }}>{errors.category}</p>}
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
              Message <span style={{ color: "hsl(var(--destructive))" }}>*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Tell us what you think, what could be better, or what you'd love to see..."
              className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all resize-none bg-background text-foreground"
              style={{
                border: errors.message ? "1px solid hsl(var(--destructive))" : "1px solid hsl(var(--input))",
              }}
            />
            <div className="flex justify-between mt-1">
              {errors.message && <p className="text-xs" style={{ color: "hsl(var(--destructive))" }}>{errors.message}</p>}
              <span className="text-xs ml-auto text-muted-foreground">
                {message.length}/1000
              </span>
            </div>
          </div>

          {errors.form && (
            <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "hsl(var(--destructive) / 0.1)", color: "hsl(var(--destructive))" }}>
              {errors.form}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 bg-primary text-primary-foreground"
          >
            <Send size={14} />
            {submitting ? "Sending..." : "Submit Feedback"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
