# SeedLog (구 JANONG 앱)
상태: 개발중
한 줄 요약: 자연농업 농사 기록 플랫폼 — React + Vite + Supabase 모바일 웹앱

---

## 버전
v0.0.0

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `src/App.jsx` | 앱 루트 — 탭 라우팅, 스플래시, 인증 |
| `src/contexts/AuthContext.jsx` | 인증 컨텍스트 (Supabase Auth) |
| `src/components/layout/Header.jsx` | 상단 헤더 |
| `src/components/layout/BottomNav.jsx` | 하단 탭 네비게이션 |
| `src/components/home/HomeTab.jsx` | 홈 탭 |
| `src/components/record/RecordTab.jsx` | 기록 탭 |
| `src/components/dashboard/DashboardTab.jsx` | 대시보드 탭 |
| `src/components/notices/NoticesTab.jsx` | 공지 탭 |
| `src/components/settings/SettingsTab.jsx` | 설정 탭 |
| `src/styles/globals.css` | 글로벌 스타일 |
| `src/styles/components.css` | 컴포넌트 스타일 |
| `supabase/` | Supabase 설정 |
| `admin.html` | 관리자 페이지 (별도 HTML) |
| `SeedLog_QA.xlsx` | QA 시트 |

## 탭 구조
```
홈(home) → 기록(record) → 대시보드(dashboard) → 공지(notices) → 설정(settings)
```

## 기술 스택
- React 19 + Vite
- Supabase (DB + Auth)
- lucide-react (아이콘)
- 모바일 반응형 웹앱

## 완료된 작업
- React + Vite + Supabase 기본 구조 셋업
- 스플래시 화면
- 인증 (AuthContext)
- 하단 탭 네비게이션 5개
- 홈/기록/대시보드/공지/설정 탭 기본 구조
- 디자인 토큰 교체 완료 (MEMORY 참고)
- components.css 레이아웃 최적화 완료

## 환경변수
| 변수 | 설명 |
|------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |

## 다음 할 일
- 작물 상세 페이지 (다음 세션 예정 — MEMORY 참고)
- Phase 1~4 로드맵 진행 (비교분석, TODO, 리포트, QR 등)
- 전체 QA (SeedLog_QA.xlsx 기준)

## 이슈 / 메모
- 브랜드명: JANONG → SeedLog로 변경됨
- AI 기능(Gemini) 제거 결정, 데이터 축적 도구로 컨셉 전환
- 로드맵 상세는 MEMORY의 project_seedlog_roadmap.md 참고
