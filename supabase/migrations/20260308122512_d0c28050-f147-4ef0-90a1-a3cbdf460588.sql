CREATE TABLE public.community_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  components TEXT[] NOT NULL DEFAULT '{}',
  estimated_time TEXT NOT NULL DEFAULT '30 mins',
  author_name TEXT NOT NULL,
  author_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit community projects"
  ON public.community_projects
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view approved community projects"
  ON public.community_projects
  FOR SELECT
  USING (status = 'approved');