-- =============================================
-- admin_profiles 뷰 — 관리자용 유저 목록
-- profiles 테이블에 이미 email 컬럼이 있으므로
-- auth.users join 없이 profiles만 사용
-- =============================================

DROP VIEW IF EXISTS public.admin_profiles;

CREATE VIEW public.admin_profiles AS
  SELECT
    id,
    email,
    name,
    role,
    group_name,
    created_at,
    updated_at
  FROM public.profiles;

-- 관리자만 조회 가능
ALTER VIEW public.admin_profiles OWNER TO postgres;

GRANT SELECT ON public.admin_profiles TO authenticated;

-- RLS는 뷰가 아니라 기반 테이블(profiles)에서 적용됨
-- Admin can read all profiles 정책이 이미 있으므로 관리자는 전체 조회 가능
