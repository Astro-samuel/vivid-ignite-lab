-- Fix community_projects INSERT policy to enforce status='pending'
DROP POLICY IF EXISTS "Anyone can submit community projects" ON public.community_projects;

CREATE POLICY "Anyone can submit community projects"
  ON public.community_projects
  FOR INSERT
  TO public
  WITH CHECK (status = 'pending');

-- Fix ai_context_cache: drop RESTRICTIVE policies, recreate as PERMISSIVE
DROP POLICY IF EXISTS "Users can delete own context cache" ON public.ai_context_cache;
DROP POLICY IF EXISTS "Users can insert own context cache" ON public.ai_context_cache;
DROP POLICY IF EXISTS "Users can update own context cache" ON public.ai_context_cache;
DROP POLICY IF EXISTS "Users can view own context cache" ON public.ai_context_cache;

CREATE POLICY "Users can view own context cache"
  ON public.ai_context_cache
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own context cache"
  ON public.ai_context_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own context cache"
  ON public.ai_context_cache
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own context cache"
  ON public.ai_context_cache
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);