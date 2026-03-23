-- daily_logs에 R&D 수치 + AI 분석 컬럼 추가
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS humidity NUMERIC;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS height_cm NUMERIC;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS leaf_count INTEGER;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS stem_mm NUMERIC;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS ai_status TEXT;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS ai_analysis JSONB;
