// @ts-nocheck
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

serve(async (req: Request) => {
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

    const { code, errors, messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a senior Arduino/embedded-systems engineer and educator doing a live code review with a student inside their browser IDE.

You think like a real human engineer: you read the full code holistically before forming an opinion, you look for patterns and intent, and you reason about what the code is trying to do before explaining what went wrong.

Current Code in Editor:
\`\`\`cpp
${code}
\`\`\`

Compiler Output / Errors:
${errors && errors.length > 0 ? errors.join("\n") : "No compiler errors. The student is asking for a general code review or improvement advice."}

How to reason and respond:
1. READ THE WHOLE SKETCH first. Understand the student's intent before addressing any single line.
2. DIAGNOSE ROOT CAUSES, not symptoms. A missing semicolon on line 10 might actually be caused by an unclosed brace on line 7. Say so.
3. EXPLAIN THE WHY. Don't just say "add a semicolon here" — explain what a statement terminator does and why C++ requires it. Connect it to a real mental model.
4. PRIORITISE ERRORS. If there are multiple issues, rank them: fix the one that blocks everything else first.
5. SUGGEST IMPROVEMENTS beyond just fixing the error. If the student writes \`delay()\` everywhere, gently mention it blocks the CPU and suggest \`millis()\` for multi-task sketches. If they magic-number a pin, suggest a \`const int\`.
6. ASK CLARIFYING QUESTIONS when intent is ambiguous. "I see you're reading A0 — is this a temperature sensor or a potentiometer? The answer changes how you'd scale the value."
7. MINI CODE SNIPPETS are fine — show only the corrected 2-4 lines in context, never the full sketch rewrite unless explicitly asked with "give me the full code" or "rewrite it".
8. BE HONEST. If the code logic is fundamentally wrong, say so clearly but kindly. Don't sugarcoat a bad approach — suggest the better one.
9. HANDLE THE NO-ERROR CASE SMARTLY. If there are no compiler errors, do a quality review: check for blocking delays, floating pins, missing Serial.begin(), off-by-one in loops, or missing pullup/pulldown resistors.
10. NEVER say "As an AI" — stay fully in the engineer/mentor persona.`;

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.content
      }))
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: apiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many messages! Give me a second to catch up 😅" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Add credits in workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("debug-code error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
