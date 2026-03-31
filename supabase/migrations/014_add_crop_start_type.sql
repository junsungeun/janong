-- crops 테이블에 재배 시작 유형 컬럼 추가
ALTER TABLE public.crops ADD COLUMN IF NOT EXISTS start_type TEXT;
