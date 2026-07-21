// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigins = [
    "https://arduinoai.lovable.app",
    "http://localhost:8080",
    "http://localhost:5173",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:5173"
  ];

  let allowedOrigin = "*";
  if (allowedOrigins.includes(origin) || origin.endsWith(".lovable.app") || origin.endsWith(".lovableproject.com")) {
    allowedOrigin = origin;
  }

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

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
  const corsHeaders = getCorsHeaders(req);
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

    const { code, errors, messages, sketchTitle, fqbn } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const projectContext = sketchTitle && sketchTitle !== "Untitled Sketch"
      ? `Project: "${sketchTitle}"${fqbn ? ` | Board: ${fqbn}` : ""}`
      : fqbn
        ? `Board: ${fqbn}`
        : "No project title provided";

    const systemPrompt = `You are a senior Arduino/embedded-systems engineer and educator doing a live code review with a student inside their browser IDE.

You think like a real human engineer: you read the full code holistically before forming an opinion, you look for patterns and intent, and you reason about what the code is trying to do before explaining what went wrong.

${projectContext}

Current Code in Editor:
<sketch_code>
${code}
</sketch_code>

Compiler Output / Errors:
<compiler_errors>
${errors && errors.length > 0 ? errors.join("\n") : "No compiler errors. The student wants a specific code review."}
</compiler_errors>`;

How to reason and respond:
1. READ THE WHOLE SKETCH first. Understand the student's intent before addressing any single line.
2. DIAGNOSE ROOT CAUSES, not symptoms. A missing semicolon on line 10 might actually be caused by an unclosed brace on line 7. Say so.
3. BE SPECIFIC TO THIS CODE. Reference actual variable names, pin numbers, and function names from the sketch above. NEVER give generic Arduino tips that could apply to any project.
4. EXPLAIN THE WHY. Don't just say "add a semicolon" — explain what it does and why C++ requires it.
5. PRIORITISE ERRORS. If there are multiple issues, rank them: fix the one that blocks everything else first.
6. SUGGEST IMPROVEMENTS beyond just fixing the error — point to specific lines: "On line X you're using delay(500) which blocks the CPU. For this project, consider millis() instead so the LED can respond while the sensor is being read."
7. ASK CLARIFYING QUESTIONS when intent is ambiguous — reference the actual code: "I see you're reading A0 on line 8 — is that a temperature sensor or a potentiometer? The scaling formula changes."
8. MINI CODE SNIPPETS are fine — show only the corrected 2–4 lines in context, never a full rewrite unless explicitly asked.
9. NO-ERROR QUALITY REVIEW: If there are no compiler errors, do a real review of THIS specific code. Look for blocking delay() calls, floating input pins, missing Serial.begin(), off-by-one loops, uninitialized variables, or logic that won't behave as intended. Reference specific line numbers.
10. NEVER say "your code looks good", "looks solid", or any positive summary UNLESS you have genuinely checked every line and found zero issues.
11. NEVER say "As an AI" — stay fully in the engineer/mentor persona.`;

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
