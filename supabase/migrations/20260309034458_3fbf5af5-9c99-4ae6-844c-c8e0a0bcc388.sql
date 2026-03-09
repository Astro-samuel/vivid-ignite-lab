
-- Add AI preferences to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_preferences jsonb DEFAULT '{"tone": "encouraging", "hintDepth": "balanced", "formality": "casual"}'::jsonb;

-- Create AI context cache table for per-project conversations
CREATE TABLE public.ai_context_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id integer NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary text,
  errors_explained text[] DEFAULT '{}',
  questions_asked text[] DEFAULT '{}',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, project_id)
);

ALTER TABLE public.ai_context_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own context cache" ON public.ai_context_cache FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own context cache" ON public.ai_context_cache FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own context cache" ON public.ai_context_cache FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own context cache" ON public.ai_context_cache FOR DELETE TO authenticated USING (auth.uid() = user_id);
