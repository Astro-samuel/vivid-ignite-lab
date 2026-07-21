
-- 1. Prevent client-side manipulation of protected columns on profiles and user_projects
CREATE OR REPLACE FUNCTION public.prevent_protected_profile_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow updates from service_role (bypasses this check via SECURITY DEFINER caller check)
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF NEW.total_xp IS DISTINCT FROM OLD.total_xp THEN
    NEW.total_xp := OLD.total_xp;
  END IF;
  IF NEW.level IS DISTINCT FROM OLD.level THEN
    NEW.level := OLD.level;
  END IF;
  IF NEW.projects_completed IS DISTINCT FROM OLD.projects_completed THEN
    NEW.projects_completed := OLD.projects_completed;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_protected_profile_updates ON public.profiles;
CREATE TRIGGER trg_prevent_protected_profile_updates
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_protected_profile_updates();

CREATE OR REPLACE FUNCTION public.prevent_protected_user_project_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF NEW.xp IS DISTINCT FROM OLD.xp THEN
    NEW.xp := OLD.xp;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_protected_user_project_updates ON public.user_projects;
CREATE TRIGGER trg_prevent_protected_user_project_updates
BEFORE UPDATE ON public.user_projects
FOR EACH ROW EXECUTE FUNCTION public.prevent_protected_user_project_updates();

-- Block INSERT-time inflation as well
CREATE OR REPLACE FUNCTION public.prevent_protected_user_project_inserts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;
  -- Force xp to 0 on client inserts; server awards XP via completion flows
  NEW.xp := 0;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_protected_user_project_inserts ON public.user_projects;
CREATE TRIGGER trg_prevent_protected_user_project_inserts
BEFORE INSERT ON public.user_projects
FOR EACH ROW EXECUTE FUNCTION public.prevent_protected_user_project_inserts();

-- 2. Restrict EXECUTE on SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_username_available(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_username_available(text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.prevent_protected_profile_updates() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_protected_user_project_updates() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_protected_user_project_inserts() FROM PUBLIC, anon, authenticated;

-- 3. Tighten feedback INSERT policy (remove "WITH CHECK true")
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Anyone can submit valid feedback"
ON public.feedback
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(name)) BETWEEN 1 AND 200
  AND length(trim(message)) BETWEEN 1 AND 5000
  AND rating BETWEEN 1 AND 5
  AND category IN ('general','bug','feature','other','question','praise')
  AND (email IS NULL OR email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- 4. Explicitly block public reads on feedback (defense-in-depth alongside RLS)
REVOKE SELECT ON public.feedback FROM anon, authenticated;
GRANT SELECT ON public.feedback TO service_role;
