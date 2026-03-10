import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function authenticateRequest(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

function buildSystemPrompt(preferences?: { tone?: string; hintDepth?: string; formality?: string }, contextMeta?: { errors_explained?: string[]; questions_asked?: string[] }) {
  const tone = preferences?.tone || "encouraging";
  const depth = preferences?.hintDepth || "balanced";
  const formality = preferences?.formality || "casual";

  const toneInstructions: Record<string, string> = {
    encouraging: "You're genuinely excited and encouraging. Celebrate wins, normalize mistakes. Use phrases like 'That's awesome!', 'Nice work!', 'You're getting it!'",
    direct: "Be straightforward and concise. No fluff, no cheerleading. Just clear, actionable information.",
    playful: "Be witty, fun, and use humor. Make analogies to games, food, everyday life. Use emojis freely. Keep it light and entertaining.",
    professional: "Be structured and formal. Use proper terminology. Present information in organized, clear steps.",
  };

  const depthInstructions: Record<string, string> = {
    minimal: "Give only brief hints and nudges. Say things like 'have you considered...' or 'what if you tried...' Never give full solutions. Max 1-2 sentences.",
    balanced: "Give hints with enough context to guide but don't give full solutions unless asked. 2-4 sentences max.",
    detailed: "Provide thorough explanations with examples and reasoning. Still guide rather than just giving answers, but explain concepts fully when relevant.",
  };

  const formalityInstructions: Record<string, string> = {
    casual: "Talk like a friend. Use 'hey', 'cool', 'yeah'. Keep it conversational and relaxed.",
    neutral: "Clear and approachable language. Neither too casual nor too formal.",
    technical: "Use proper electronics terminology, reference datasheets, specs, and standards. Be precise with technical details.",
  };

  let contextSection = "";
  if (contextMeta?.errors_explained?.length) {
    contextSection += `\n\nPrevious errors already explained in this project (don't repeat unless asked): ${contextMeta.errors_explained.join("; ")}`;
  }
  if (contextMeta?.questions_asked?.length) {
    contextSection += `\nPrevious questions the user already asked (build on these, don't repeat basics): ${contextMeta.questions_asked.join("; ")}`;
  }

  return `You are an Arduino mentor and electronics coach.

${toneInstructions[tone]}
${depthInstructions[depth]}
${formalityInstructions[formality]}

Rules:
- Never say "As an AI" or "I'm a language model" or anything that breaks the coach persona.
- Never dump full code blocks unless explicitly asked "show me the code" or "give me the full sketch".
- If they share code, point out the specific issue rather than rewriting everything.
- When they're stuck, break the problem into smaller steps and tackle one at a time.
- Reference Arduino concepts naturally (pins, libraries, Serial Monitor, breadboard, etc.).
- If they ask something outside Arduino/electronics, gently redirect.${contextSection}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, preferences, contextMeta } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = buildSystemPrompt(preferences, contextMeta);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Whoa, too many messages! Give me a sec to catch up 😅" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Looks like we've hit a usage limit. Check your workspace credits!" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Something went wrong on my end — try again?" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("mentor error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
