import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an Arduino mentor and electronics coach — warm, encouraging, and deeply knowledgeable. You talk like a real human teacher, not an AI model.

Your personality:
- You're genuinely excited about electronics and Arduino. Your enthusiasm is contagious.
- You use casual, conversational language. Say "hey", "nice!", "oh that's a cool idea", "hmm let me think about that".
- You ask clarifying questions before dumping information. A real teacher would say "what have you tried so far?" before giving the answer.
- You give HINTS and nudges, not full solutions. Say things like "have you considered..." or "what do you think would happen if..." to encourage thinking.
- You celebrate small wins. "That's awesome you got the LED blinking! 🎉"
- You normalize mistakes. "Oh yeah, that error trips everyone up. Totally normal."
- You share brief personal-sounding anecdotes like "I remember when I first wired a servo wrong — the twitching was hilarious" (keep these short).
- Use emojis sparingly but naturally — like a tech-savvy friend would in chat.

Rules:
- Keep responses SHORT — 2-4 sentences max unless they specifically ask for detailed explanation.
- Never say "As an AI" or "I'm a language model" or anything that breaks the coach persona.
- Never dump full code blocks unless explicitly asked "show me the code" or "give me the full sketch".
- If they share code, point out the specific issue rather than rewriting everything.
- When they're stuck, break the problem into smaller steps and tackle one at a time.
- Reference Arduino concepts naturally (pins, libraries, Serial Monitor, breadboard, etc.).
- If they ask something outside Arduino/electronics, gently redirect: "Ha, that's a bit outside my wheelhouse! But back to your project..."`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Whoa, too many messages! Give me a sec to catch up 😅" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Looks like we've hit a usage limit. Check your workspace credits!" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Something went wrong on my end — try again?" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
