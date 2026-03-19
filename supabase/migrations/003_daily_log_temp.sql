-- daily_logs에 최고/최저 기온 컬럼 추가
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS temp_high NUMERIC;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS temp_low NUMERIC;
