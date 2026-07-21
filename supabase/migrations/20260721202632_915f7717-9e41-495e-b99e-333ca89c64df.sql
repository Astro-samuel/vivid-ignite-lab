
-- 1. Restrict SECURITY DEFINER trigger functions - not callable by clients
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_protected_profile_updates() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_protected_user_project_updates() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_protected_user_project_inserts() FROM PUBLIC, anon, authenticated;

-- 2. Drop check_username_available (replaced by unique index)
REVOKE ALL ON FUNCTION public.check_username_available(text) FROM PUBLIC, anon, authenticated;
DROP FUNCTION IF EXISTS public.check_username_available(text);

-- Enforce uniqueness at DB level
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_unique
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL;

-- 3. community_projects: require authentication for inserts, add restrictive update/delete
DROP POLICY IF EXISTS "Anyone can submit community projects" ON public.community_projects;
CREATE POLICY "Authenticated users can submit community projects"
  ON public.community_projects
  FOR INSERT
  TO authenticated
  WITH CHECK (status = 'pending');

CREATE POLICY "No client updates on community projects"
  ON public.community_projects
  FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "No client deletes on community projects"
  ON public.community_projects
  FOR DELETE
  TO authenticated
  USING (false);

-- 4. feedback: require authentication for inserts
DROP POLICY IF EXISTS "Anyone can submit valid feedback" ON public.feedback;
CREATE POLICY "Authenticated users can submit feedback"
  ON public.feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (
    length(trim(name)) BETWEEN 1 AND 200
    AND length(trim(message)) BETWEEN 1 AND 5000
    AND rating BETWEEN 1 AND 5
    AND category = ANY (ARRAY['general','bug','feature','other','question','praise'])
    AND (email IS NULL OR email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
  );
