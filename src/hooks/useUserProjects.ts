import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, DEMO_USER } from "@/contexts/AuthContext";
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

export const MAX_ACTIVE_PROJECTS = 5;
export interface SaveProjectResult { error?: string; limitReached?: boolean }

// The demo account (shown when login is disabled) has no real database row, so Supabase rejects
// its writes. Keep its projects in localStorage instead so saving, progress and the dashboard work.
const DEMO_PROJECTS_KEY = "demo_user_projects_v1";
function readDemoProjects(): UserProject[] {
  try {
    return JSON.parse(localStorage.getItem(DEMO_PROJECTS_KEY) || "[]") as UserProject[];
  } catch {
    return [];
  }
}
function writeDemoProjects(rows: UserProject[]) {
  try {
    localStorage.setItem(DEMO_PROJECTS_KEY, JSON.stringify(rows));
  } catch {
    /* storage unavailable: demo projects will not persist */
  }
}

export function useUserProjects() {
  const { user } = useAuth();
  const isDemo = user?.id === DEMO_USER.id;
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!user) { setProjects([]); setLoading(false); return; }
    if (isDemo) {
      setProjects(readDemoProjects().sort((a, b) => b.saved_at.localeCompare(a.saved_at)));
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("user_projects")
      .select("*")
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false });
    if (!error && data) setProjects(data as unknown as UserProject[]);
    setLoading(false);
  }, [user, isDemo]);

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
  }): Promise<SaveProjectResult> => {
    if (!user) return { error: "Not authenticated" };

    // Active-project limit (completed projects do not count; re-saving a project you already have is not a new one).
    const limitMessage = `You can only have up to ${MAX_ACTIVE_PROJECTS} active projects.`;

    if (isDemo) {
      const rows = readDemoProjects();
      const active = rows.filter((r) => r.status !== "completed" && r.project_id !== project.project_id);
      if (active.length >= MAX_ACTIVE_PROJECTS) return { error: limitMessage, limitReached: true };
      const now = new Date().toISOString();
      const existing = rows.find((r) => r.project_id === project.project_id);
      const row: UserProject = {
        id: existing?.id ?? `demo-${project.project_id}`,
        user_id: user.id,
        project_id: project.project_id,
        emoji: project.emoji ?? null,
        title: project.title,
        description: project.description ?? null,
        difficulty: project.difficulty ?? null,
        time: project.time ?? null,
        xp: project.xp ?? null,
        components: project.components || [],
        source: project.source || "catalog",
        status: existing?.status ?? "inProgress",
        progress: existing?.progress ?? 0,
        checked_steps: existing?.checked_steps ?? [],
        current_code: existing?.current_code ?? null,
        notes: existing?.notes ?? {},
        saved_at: existing?.saved_at ?? now,
        updated_at: now,
      };
      writeDemoProjects([...rows.filter((r) => r.project_id !== project.project_id), row]);
      await fetchProjects();
      return {};
    }

    const { count, error: countError } = await supabase
      .from("user_projects")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .neq("status", "completed")
      .neq("project_id", project.project_id);
    if (countError) return { error: countError.message };
    if ((count ?? 0) >= MAX_ACTIVE_PROJECTS) return { error: limitMessage, limitReached: true };

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
  }, [user, isDemo, fetchProjects]);

  const updateProgress = useCallback(async (projectId: number, updates: {
    checked_steps?: boolean[];
    current_code?: string;
    notes?: Record<string, string>;
    status?: string;
    progress?: number;
  }) => {
    if (!user) return;
    if (isDemo) {
      writeDemoProjects(readDemoProjects().map((r) =>
        r.project_id === projectId ? { ...r, ...updates, updated_at: new Date().toISOString() } as UserProject : r));
      await fetchProjects();
      return;
    }
    await supabase.from("user_projects")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("project_id", projectId);
    await fetchProjects();
  }, [user, isDemo, fetchProjects]);

  // Complete a project: mark as completed and award XP to profile
  const completeProject = useCallback(async (projectId: number, xpAmount: number) => {
    if (!user) return;

    if (isDemo) {
      writeDemoProjects(readDemoProjects().map((r) =>
        r.project_id === projectId ? { ...r, status: "completed", progress: 100, updated_at: new Date().toISOString() } : r));
      await fetchProjects();
      return;
    }

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
  }, [user, isDemo, fetchProjects]);

  // Extra XP that is not tied to completing a project (e.g. the simulation bonus).
  const awardBonusXp = useCallback(async (xpAmount: number) => {
    if (!user || isDemo || xpAmount <= 0) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_xp")
      .eq("id", user.id)
      .single();
    if (!profile) return;
    const newXp = (profile.total_xp || 0) + xpAmount;
    await supabase.from("profiles").update({
      total_xp: newXp,
      level: levelForXp(newXp),
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);
  }, [user, isDemo]);

  const deleteProject = useCallback(async (projectId: number) => {
    if (!user) return;
    if (isDemo) {
      writeDemoProjects(readDemoProjects().filter((r) => r.project_id !== projectId));
      await fetchProjects();
      return;
    }
    await supabase.from("user_projects")
      .delete()
      .eq("user_id", user.id)
      .eq("project_id", projectId);
    await fetchProjects();
  }, [user, isDemo, fetchProjects]);

  const isProjectSaved = useCallback((projectId: number) => {
    return projects.some(p => p.project_id === projectId);
  }, [projects]);

  return { projects, loading, saveProject, updateProgress, completeProject, awardBonusXp, deleteProject, isProjectSaved, refetch: fetchProjects };
}
