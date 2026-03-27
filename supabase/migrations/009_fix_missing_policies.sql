-- profiles: INSERT 정책 (upsert 시 필요)
DROP POLICY IF EXISTS "Users can upsert own profile" ON public.profiles;
CREATE POLICY "Users can upsert own profile" ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- profiles: 본인 UPDATE 정책
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
