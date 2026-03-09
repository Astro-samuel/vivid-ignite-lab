import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AIContextCache {
  messages: { role: "user" | "assistant"; content: string }[];
  summary: string | null;
  errors_explained: string[];
  questions_asked: string[];
}

const MAX_CACHED_MESSAGES = 20; // Keep last 20 messages for context

export function useAIContext(projectId: number | null) {
  const { user } = useAuth();
  const [context, setContext] = useState<AIContextCache>({
    messages: [],
    summary: null,
    errors_explained: [],
    questions_asked: [],
  });
  const [loaded, setLoaded] = useState(false);

  // Load cached context
  useEffect(() => {
    if (!user || !projectId) { setLoaded(true); return; }
    supabase
      .from("ai_context_cache")
      .select("messages, summary, errors_explained, questions_asked")
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .single()
      .then(({ data }) => {
        if (data) {
          setContext({
            messages: (data.messages as AIContextCache["messages"]) || [],
            summary: data.summary,
            errors_explained: data.errors_explained || [],
            questions_asked: data.questions_asked || [],
          });
        }
        setLoaded(true);
      });
  }, [user, projectId]);

  // Save context to DB
  const saveContext = useCallback(async (update: Partial<AIContextCache>) => {
    if (!user || !projectId) return;
    const newCtx = { ...context, ...update };
    // Trim messages to max
    if (newCtx.messages.length > MAX_CACHED_MESSAGES) {
      newCtx.messages = newCtx.messages.slice(-MAX_CACHED_MESSAGES);
    }
    setContext(newCtx);

    await supabase.from("ai_context_cache" as any).upsert({
      user_id: user.id,
      project_id: projectId,
      messages: newCtx.messages,
      summary: newCtx.summary,
      errors_explained: newCtx.errors_explained,
      questions_asked: newCtx.questions_asked,
      updated_at: new Date().toISOString(),
    } as any, { onConflict: "user_id,project_id" });
  }, [user, projectId, context]);

  // Track a new question
  const trackQuestion = useCallback((question: string) => {
    const short = question.slice(0, 100);
    if (!context.questions_asked.includes(short)) {
      saveContext({ questions_asked: [...context.questions_asked, short] });
    }
  }, [context.questions_asked, saveContext]);

  // Track an explained error
  const trackError = useCallback((error: string) => {
    const short = error.slice(0, 100);
    if (!context.errors_explained.includes(short)) {
      saveContext({ errors_explained: [...context.errors_explained, short] });
    }
  }, [context.errors_explained, saveContext]);

  return { context, loaded, saveContext, trackQuestion, trackError };
}
