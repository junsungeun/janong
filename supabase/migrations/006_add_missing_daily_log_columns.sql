-- daily_logs 누락 컬럼 추가 (RecordForm 저장 오류 수정)
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS stage TEXT;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS memo TEXT;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS weather TEXT;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS house_temp NUMERIC;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS house_humidity NUMERIC;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS outdoor_temp NUMERIC;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS outdoor_humidity NUMERIC;
