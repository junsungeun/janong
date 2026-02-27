// 농사로 OpenAPI 서비스 — 자농(JANONG)
// Supabase Edge Function (nongsaro-proxy) 경유 (XML→JSON 변환 포함)
//
// 확인된 올바른 엔드포인트:
//   주간농사정보:     weekFarmInfo/weekFarmInfoList
//   치유농업 이슈:    agroHealingIssue/agroHealingIssueLst
//   치유농업 참고자료: agroHealingRef/agroHealingRefLst
//   치유농업 동영상:  agroHealingFarmMvp/agroHealingFarmMvpLst
//   치유농업 연구성과: agroHealingResearchResult/agroHealingResearchResultLst
// ※ 오퍼레이션명 접미사가 "List"가 아닌 "Lst" 임에 주의

import { CONFIG } from '../config';

const EDGE_FN_URL = `${CONFIG.SUPABASE_URL}/functions/v1/nongsaro-proxy`;

const call = async (endpoint, params = {}) => {
  const qs = new URLSearchParams({
    apiKey: CONFIG.NONGSARO_API_KEY,
    endpoint,
    ...params,
  });

  const res = await fetch(`${EDGE_FN_URL}?${qs}`, {
    headers: { 'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}` },
    signal:  AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`nongsaro-proxy HTTP ${res.status}`);
  return res.json();
};

// ── 주간농사정보 ──────────────────────────────────────────────────────
// 필드: cntntsNo, subject, regDt, writerNm, downUrl, downUrlList, fileName
export const fetchWeeklyFarming = async () => {
  try {
    const data = await call('weekFarmInfo/weekFarmInfoList', { numOfRows: '10', pageNo: '1' });
    const items = data?.body?.items?.item || [];
    return Array.isArray(items) ? items : [items];
  } catch (err) {
    console.warn('[JANONG] 주간농사정보 오류:', err.message);
    return [];
  }
};

// ── 치유농업 ──────────────────────────────────────────────────────────
// 공통 필드: cntntsNo, cntntsSj (제목)
// 이슈·연구성과: submitDt (날짜), imgUrl, summary
// 참고자료: publiDt, registDt

const healingList = async (endpoint, label) => {
  try {
    const data  = await call(endpoint, { pageNo: '1', numOfRows: '10' });
    const items = data?.body?.items?.item || [];
    return Array.isArray(items) ? items : [items];
  } catch (err) {
    console.warn(`[JANONG] ${label} 오류:`, err.message);
    return [];
  }
};

export const fetchHealingIssues   = () => healingList('agroHealingIssue/agroHealingIssueLst',                   '치유농업 이슈');
export const fetchHealingRefs     = () => healingList('agroHealingRef/agroHealingRefLst',                       '치유농업 참고자료');
export const fetchHealingVideos   = () => healingList('agroHealingFarmMvp/agroHealingFarmMvpLst',               '치유농업 동영상');
export const fetchHealingResearch = () => healingList('agroHealingResearchResult/agroHealingResearchResultLst', '치유농업 연구성과');
