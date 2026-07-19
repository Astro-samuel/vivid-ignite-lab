import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { levelForXp } from "@/lib/xp";

export interface UserProject {
  id: string;
  user_id: string;
  project_id: number;
  emoji: string | null;
  title: string;
  description: string | null;
  difficulty: string | null;
  time: string | null;
  xp: number | null;
  components: string[];
  source: string | null;
  status: string;
  progress: number | null;
  checked_steps: boolean[];
  current_code: string | null;
  notes: Record<string, string>;
  saved_at: string;
  updated_at: string;
}

export function useUserProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!user) { setProjects([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("user_projects")
      .select("*")
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false });
    if (!error && data) setProjects(data as unknown as UserProject[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const saveProject = useCallback(async (project: {
    project_id: number;
    emoji?: string;
    title: string;
    description?: string;
    difficulty?: string;
    time?: string;
    xp?: number;
    components?: string[];
    source?: string;
  }) => {
    if (!user) return { error: "Not authenticated" };
    
    // Check 5 ACTIVE project limit (exclude completed projects)
    const { count } = await supabase
      .from("user_projects")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .neq("status", "completed");
    if ((count ?? 0) >= 5) return { error: "You can only have up to 5 active projects." };

    const { error } = await supabase.from("user_projects").upsert({
      user_id: user.id,
      project_id: project.project_id,
      emoji: project.emoji,
      title: project.title,
      description: project.description,
      difficulty: project.difficulty,
      time: project.time,
      xp: project.xp,
      components: project.components || [],
      source: project.source || "catalog",
      status: "inProgress",
    }, { onConflict: "user_id,project_id" });

    if (!error) await fetchProjects();
    return { error: error?.message };
  }, [user, fetchProjects]);

  const updateProgress = useCallback(async (projectId: number, updates: {
    checked_steps?: boolean[];
    current_code?: string;
    notes?: Record<string, string>;
    status?: string;
    progress?: number;
  }) => {
    if (!user) return;
    await supabase.from("user_projects")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("project_id", projectId);
    await fetchProjects();
  }, [user, fetchProjects]);

  // Complete a project: mark as completed and award XP to profile
  const completeProject = useCallback(async (projectId: number, xpAmount: number) => {
    if (!user) return;

    // Mark project as completed
    await supabase.from("user_projects")
      .update({ status: "completed", progress: 100, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("project_id", projectId);

    // Award XP and increment projects_completed on profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_xp, level, projects_completed")
      .eq("id", user.id)
      .single();

    if (profile) {
      const newXp = (profile.total_xp || 0) + xpAmount;
      const newCompleted = (profile.projects_completed || 0) + 1;
      const newLevel = levelForXp(newXp);

      await supabase.from("profiles").update({
        total_xp: newXp,
        level: newLevel,
        projects_completed: newCompleted,
        updated_at: new Date().toISOString(),
      }).eq("id", user.id);
    }

    await fetchProjects();
  }, [user, fetchProjects]);

  const deleteProject = useCallback(async (projectId: number) => {
    if (!user) return;
    await supabase.from("user_projects")
      .delete()
      .eq("user_id", user.id)
      .eq("project_id", projectId);
    await fetchProjects();
  }, [user, fetchProjects]);

  const isProjectSaved = useCallback((projectId: number) => {
    return projects.some(p => p.project_id === projectId);
  }, [projects]);

  return { projects, loading, saveProject, updateProgress, completeProject, deleteProject, isProjectSaved, refetch: fetchProjects };
}
