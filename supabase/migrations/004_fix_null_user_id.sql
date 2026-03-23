-- =============================================
-- 4. user_id가 NULL인 기존 데이터 복구
-- Supabase SQL Editor에서 실행하세요.
--
-- 실행 방법:
-- 1. Supabase Dashboard → SQL Editor
-- 2. 아래 쿼리로 첫 번째 유저(또는 어드민) UUID 확인
-- 3. 해당 UUID로 아래 UPDATE 실행
-- =============================================

-- ① 유저 UUID 확인 (이 쿼리 먼저 실행)
-- SELECT id, email, role FROM public.profiles;

-- ② 아래 'YOUR-USER-UUID' 를 실제 UUID로 교체 후 실행
-- 예: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

DO $$
DECLARE
  target_uid UUID;
BEGIN
  -- 첫 번째 어드민 유저의 UUID를 자동으로 가져옴
  -- 어드민이 없으면 가장 먼저 생성된 유저 사용
  SELECT id INTO target_uid FROM public.profiles
    WHERE role = 'admin' ORDER BY created_at LIMIT 1;

  IF target_uid IS NULL THEN
    SELECT id INTO target_uid FROM public.profiles
      ORDER BY created_at LIMIT 1;
  END IF;

  IF target_uid IS NULL THEN
    RAISE EXCEPTION 'profiles 테이블에 유저가 없습니다. 먼저 회원가입하세요.';
  END IF;

  RAISE NOTICE '대상 유저 UUID: %', target_uid;

  -- 모든 테이블의 user_id NULL → 해당 유저로 할당
  UPDATE public.crops           SET user_id = target_uid WHERE user_id IS NULL;
  UPDATE public.daily_logs      SET user_id = target_uid WHERE user_id IS NULL;
  UPDATE public.todos           SET user_id = target_uid WHERE user_id IS NULL;
  UPDATE public.issues          SET user_id = target_uid WHERE user_id IS NULL;
  UPDATE public.work_timers     SET user_id = target_uid WHERE user_id IS NULL;
  UPDATE public.chem_logs       SET user_id = target_uid WHERE user_id IS NULL;
  UPDATE public.recipes         SET user_id = target_uid WHERE user_id IS NULL;
  UPDATE public.microbe_logs    SET user_id = target_uid WHERE user_id IS NULL;
  UPDATE public.calendar_events SET user_id = target_uid WHERE user_id IS NULL;
  UPDATE public.crop_photos     SET user_id = target_uid WHERE user_id IS NULL;

  RAISE NOTICE 'user_id NULL 데이터 복구 완료';
END $$;
