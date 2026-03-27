ALTER TABLE public.crop_tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.crop_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own crop_tasks" ON public.crop_tasks;
CREATE POLICY "Users manage own crop_tasks" ON public.crop_tasks FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
