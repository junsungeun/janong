-- crops 테이블 누락 컬럼 추가 (작물 저장 오류 수정)
ALTER TABLE public.crops ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.crops ADD COLUMN IF NOT EXISTS variety TEXT;
ALTER TABLE public.crops ADD COLUMN IF NOT EXISTS planting_date DATE;
ALTER TABLE public.crops ADD COLUMN IF NOT EXISTS section TEXT;
ALTER TABLE public.crops ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.crops ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.crops ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
