// 자농(JANONG) — 고정 설정값
// API 키나 지점 변경 시 이 파일만 수정하면 됩니다.

export const CONFIG = {
  // Gemini AI — 키는 Supabase Edge Function 환경변수에 보관 (프론트 노출 없음)
  // 설정 위치: Supabase Dashboard > Edge Functions > gemini-proxy > Secrets

  // 농촌진흥청 농업기상 상세 관측데이터 API
  WEATHER_API_KEY: '0d4c921d7f24ae50c71f97c7e7c2b6146de731efb4fc84c79ea3706994674b1a',

  // 관측지점: 경기도 양주시 은현면 (장흥 인근 최근접)
  WEATHER_STATION_CODE: '482841A001',

  // 농사로 OpenAPI (주간농사정보, 작물재배기술, 품종정보)
  NONGSARO_API_KEY: '20260227S3RPMHZUGPDOYONFHDWGW',

  // Supabase
  SUPABASE_URL: 'https://atqznktlipbiuuivczpq.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0cXpua3RsaXBiaXV1aXZjenBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMDU5NTUsImV4cCI6MjA4NzY4MTk1NX0.oLJarNmM9ojhKUf3q6srCE18TBmK2PCtWPBFK5ZWzCo',
};
