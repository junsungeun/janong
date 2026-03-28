-- =============================================
-- crop-photos 스토리지 버킷 RLS 정책
-- 경로 형식: {userId}/{cropId}/{filename}
-- =============================================

-- 업로드: 본인 폴더에만 허용
DROP POLICY IF EXISTS "Users can upload own photos" ON storage.objects;
CREATE POLICY "Users can upload own photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'crop-photos' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 조회: 인증된 유저 전체 허용 (공개 URL 사용)
DROP POLICY IF EXISTS "Authenticated users can view photos" ON storage.objects;
CREATE POLICY "Authenticated users can view photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'crop-photos' AND
    auth.role() = 'authenticated'
  );

-- 삭제: 본인 폴더만 허용
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;
CREATE POLICY "Users can delete own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'crop-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 수정: 본인 폴더만 허용
DROP POLICY IF EXISTS "Users can update own photos" ON storage.objects;
CREATE POLICY "Users can update own photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'crop-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
