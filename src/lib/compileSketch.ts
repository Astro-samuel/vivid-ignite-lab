import { supabase } from "@/integrations/supabase/client";

const COMPILE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compile-sketch`;

export interface CompileResult {
  ok: boolean;
  hex?: string;
  log?: string;
  error?: string;
}

// Compiles an Arduino sketch on the remote build server via the compile-sketch
// edge function. Board-agnostic and port-agnostic — used both for a plain
// "check my code" pass and as the first step before flashing a physical board.
export async function compileSketch(code: string, fqbn: string): Promise<CompileResult> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) return { ok: false, error: "Please log in to compile code." };

  let response: Response;
  try {
    response = await fetch(COMPILE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code, fqbn }),
    });
  } catch {
    return { ok: false, error: "Could not reach the compile server. It may be offline." };
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok === false) {
    return { ok: false, error: result.error || result.log || "Compilation failed.", log: result.log };
  }
  return { ok: true, hex: result.hex, log: result.log };
}
