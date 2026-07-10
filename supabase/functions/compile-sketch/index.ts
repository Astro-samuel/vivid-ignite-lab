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

    const { code, fqbn } = await req.json();
    if (typeof code !== "string" || !code.trim()) {
      return new Response(JSON.stringify({ error: "Missing 'code' string" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const COMPILE_SERVER_URL = Deno.env.get("COMPILE_SERVER_URL");
    const COMPILE_SERVER_TOKEN = Deno.env.get("COMPILE_SERVER_TOKEN");
    if (!COMPILE_SERVER_URL) {
      return new Response(
        JSON.stringify({ error: "Compile server is not configured. Set COMPILE_SERVER_URL (see compile-server/README.md)." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const upstream = await fetch(`${COMPILE_SERVER_URL.replace(/\/$/, "")}/compile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(COMPILE_SERVER_TOKEN ? { Authorization: `Bearer ${COMPILE_SERVER_TOKEN}` } : {}),
      },
      body: JSON.stringify({ code, fqbn }),
    });

    const result = await upstream.json().catch(() => ({}));
    return new Response(JSON.stringify(result), {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("compile-sketch error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
