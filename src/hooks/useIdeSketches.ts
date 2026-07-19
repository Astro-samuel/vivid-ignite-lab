import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface IdeSketch {
  id: string;
  user_id: string;
  title: string;
  code: string;
  fqbn: string;
  created_at: string;
  updated_at: string;
}

export function useIdeSketches() {
  const { user } = useAuth();
  const [sketches, setSketches] = useState<IdeSketch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSketches = useCallback(async () => {
    if (!user) { setSketches([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("ide_sketches")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (!error && data) setSketches(data as unknown as IdeSketch[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSketches(); }, [fetchSketches]);

  const createSketch = useCallback(async (title: string, code: string, fqbn: string) => {
    if (!user) return { error: "Not authenticated" };
    const { data, error } = await supabase
      .from("ide_sketches")
      .insert({ user_id: user.id, title, code, fqbn })
      .select()
      .single();
    if (!error) await fetchSketches();
    return { sketch: data as unknown as IdeSketch | undefined, error: error?.message };
  }, [user, fetchSketches]);

  const saveSketch = useCallback(async (id: string, updates: { title?: string; code?: string; fqbn?: string }) => {
    if (!user) return { error: "Not authenticated" };
    const { error } = await supabase
      .from("ide_sketches")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);
    if (!error) await fetchSketches();
    return { error: error?.message };
  }, [user, fetchSketches]);

  const deleteSketch = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from("ide_sketches").delete().eq("id", id).eq("user_id", user.id);
    await fetchSketches();
  }, [user, fetchSketches]);

  return { sketches, loading, createSketch, saveSketch, deleteSketch, refetch: fetchSketches };
}
