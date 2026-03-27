-- is_admin() 함수: SECURITY DEFINER로 RLS 우회해서 순환참조 방지
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- profiles 정책 교체
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update profiles" ON public.profiles;

CREATE POLICY "Admin can read all profiles" ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin can update profiles" ON public.profiles FOR UPDATE
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- crops 어드민 정책 교체
DROP POLICY IF EXISTS "Admin full access crops" ON public.crops;
CREATE POLICY "Admin full access crops" ON public.crops FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- daily_logs 어드민 정책 교체
DROP POLICY IF EXISTS "Admin full access daily_logs" ON public.daily_logs;
CREATE POLICY "Admin full access daily_logs" ON public.daily_logs FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- crop_photos 어드민 정책 교체
DROP POLICY IF EXISTS "Admin full access crop_photos" ON public.crop_photos;
CREATE POLICY "Admin full access crop_photos" ON public.crop_photos FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- todos 어드민 정책 교체
DROP POLICY IF EXISTS "Admin full access todos" ON public.todos;
CREATE POLICY "Admin full access todos" ON public.todos FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- issues 어드민 정책 교체
DROP POLICY IF EXISTS "Admin full access issues" ON public.issues;
CREATE POLICY "Admin full access issues" ON public.issues FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- work_timers 어드민 정책 교체
DROP POLICY IF EXISTS "Admin full access work_timers" ON public.work_timers;
CREATE POLICY "Admin full access work_timers" ON public.work_timers FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- chem_logs 어드민 정책 교체
DROP POLICY IF EXISTS "Admin full access chem_logs" ON public.chem_logs;
CREATE POLICY "Admin full access chem_logs" ON public.chem_logs FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- recipes 어드민 정책 교체
DROP POLICY IF EXISTS "Admin full access recipes" ON public.recipes;
CREATE POLICY "Admin full access recipes" ON public.recipes FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- microbe_logs 어드민 정책 교체
DROP POLICY IF EXISTS "Admin full access microbe_logs" ON public.microbe_logs;
CREATE POLICY "Admin full access microbe_logs" ON public.microbe_logs FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- calendar_events 어드민 정책 교체
DROP POLICY IF EXISTS "Admin full access calendar_events" ON public.calendar_events;
CREATE POLICY "Admin full access calendar_events" ON public.calendar_events FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- crop_tasks 어드민 정책 추가
DROP POLICY IF EXISTS "Admin full access crop_tasks" ON public.crop_tasks;
CREATE POLICY "Admin full access crop_tasks" ON public.crop_tasks FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());
