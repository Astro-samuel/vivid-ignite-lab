
-- Free-form IDE sketches: user-owned, not tied to a catalog project
CREATE TABLE public.ide_sketches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL DEFAULT 'Untitled Sketch',
  code text NOT NULL DEFAULT '',
  fqbn text NOT NULL DEFAULT 'arduino:avr:uno',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ide_sketches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sketches" ON public.ide_sketches
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sketches" ON public.ide_sketches
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sketches" ON public.ide_sketches
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sketches" ON public.ide_sketches
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
