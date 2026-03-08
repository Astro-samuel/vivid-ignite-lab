
-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username text,
  display_name text,
  avatar_url text,
  total_xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  streak_days integer NOT NULL DEFAULT 0,
  projects_completed integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User projects table
CREATE TABLE public.user_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id integer NOT NULL,
  emoji text,
  title text NOT NULL,
  description text,
  difficulty text DEFAULT 'beginner',
  time text,
  xp integer DEFAULT 0,
  components text[] DEFAULT '{}',
  source text DEFAULT 'catalog',
  status text NOT NULL DEFAULT 'inProgress',
  progress integer DEFAULT 0,
  checked_steps boolean[] DEFAULT '{}',
  current_code text,
  notes jsonb DEFAULT '{}',
  saved_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, project_id)
);

ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON public.user_projects
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.user_projects
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.user_projects
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.user_projects
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
