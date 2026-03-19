-- daily_logs에 기온 + 자동 기온 컬럼 추가
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS temp_high NUMERIC;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS temp_low NUMERIC;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS auto_temp NUMERIC;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS auto_temp_at TIMESTAMPTZ;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]';
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS crop_id UUID REFERENCES public.crops(id);
