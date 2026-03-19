-- =============================================
-- 2. 모든 테이블에 user_id 추가 + RLS 설정
-- (IF NOT EXISTS / DROP POLICY IF EXISTS 사용 — 중복 실행 안전)
-- =============================================

-- ── crops ──
ALTER TABLE public.crops ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own crops" ON public.crops;
DROP POLICY IF EXISTS "Admin full access crops" ON public.crops;
CREATE POLICY "Users manage own crops" ON public.crops FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin full access crops" ON public.crops FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── daily_logs ──
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own daily_logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Admin full access daily_logs" ON public.daily_logs;
CREATE POLICY "Users manage own daily_logs" ON public.daily_logs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin full access daily_logs" ON public.daily_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── todos ──
ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own todos" ON public.todos;
DROP POLICY IF EXISTS "Admin full access todos" ON public.todos;
CREATE POLICY "Users manage own todos" ON public.todos FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin full access todos" ON public.todos FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── issues ──
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own issues" ON public.issues;
DROP POLICY IF EXISTS "Admin full access issues" ON public.issues;
CREATE POLICY "Users manage own issues" ON public.issues FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin full access issues" ON public.issues FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── work_timers ──
ALTER TABLE public.work_timers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.work_timers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own work_timers" ON public.work_timers;
DROP POLICY IF EXISTS "Admin full access work_timers" ON public.work_timers;
CREATE POLICY "Users manage own work_timers" ON public.work_timers FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin full access work_timers" ON public.work_timers FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── chem_logs ──
ALTER TABLE public.chem_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.chem_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own chem_logs" ON public.chem_logs;
DROP POLICY IF EXISTS "Admin full access chem_logs" ON public.chem_logs;
CREATE POLICY "Users manage own chem_logs" ON public.chem_logs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin full access chem_logs" ON public.chem_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── recipes ──
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Admin full access recipes" ON public.recipes;
CREATE POLICY "Users manage own recipes" ON public.recipes FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin full access recipes" ON public.recipes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── microbe_logs ──
ALTER TABLE public.microbe_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.microbe_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own microbe_logs" ON public.microbe_logs;
DROP POLICY IF EXISTS "Admin full access microbe_logs" ON public.microbe_logs;
CREATE POLICY "Users manage own microbe_logs" ON public.microbe_logs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin full access microbe_logs" ON public.microbe_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── calendar_events ──
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own calendar_events" ON public.calendar_events;
DROP POLICY IF EXISTS "Admin full access calendar_events" ON public.calendar_events;
CREATE POLICY "Users manage own calendar_events" ON public.calendar_events FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin full access calendar_events" ON public.calendar_events FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── crop_photos ──
ALTER TABLE public.crop_photos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.crop_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own crop_photos" ON public.crop_photos;
DROP POLICY IF EXISTS "Admin full access crop_photos" ON public.crop_photos;
CREATE POLICY "Users manage own crop_photos" ON public.crop_photos FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin full access crop_photos" ON public.crop_photos FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================
-- 기존 데이터 마이그레이션 안내:
-- 첫 어드민 계정 생성 후 아래 SQL 실행 (어드민 UUID로 교체)
-- =============================================
-- UPDATE public.crops SET user_id = '어드민-UUID' WHERE user_id IS NULL;
-- UPDATE public.daily_logs SET user_id = '어드민-UUID' WHERE user_id IS NULL;
-- UPDATE public.todos SET user_id = '어드민-UUID' WHERE user_id IS NULL;
-- UPDATE public.issues SET user_id = '어드민-UUID' WHERE user_id IS NULL;
-- UPDATE public.work_timers SET user_id = '어드민-UUID' WHERE user_id IS NULL;
-- UPDATE public.chem_logs SET user_id = '어드민-UUID' WHERE user_id IS NULL;
-- UPDATE public.recipes SET user_id = '어드민-UUID' WHERE user_id IS NULL;
-- UPDATE public.microbe_logs SET user_id = '어드민-UUID' WHERE user_id IS NULL;
-- UPDATE public.calendar_events SET user_id = '어드민-UUID' WHERE user_id IS NULL;
-- UPDATE public.crop_photos SET user_id = '어드민-UUID' WHERE user_id IS NULL;
