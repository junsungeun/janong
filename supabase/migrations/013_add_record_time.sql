-- daily_logs에 기록 시간 컬럼 추가
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS record_time TEXT;
