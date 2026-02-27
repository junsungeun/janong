// 농사로 OpenAPI 서비스 — 자농(JANONG)
// Supabase Edge Function (nongsaro-proxy) 경유

import { CONFIG } from '../config';

const EDGE_FN_URL = `${CONFIG.SUPABASE_URL}/functions/v1/nongsaro-proxy`;

const call = async (endpoint, params = {}) => {
  const qs = new URLSearchParams({
    apiKey:   CONFIG.NONGSARO_API_KEY,
    endpoint,
    format:   'json',
    ...params,
  });

  const res = await fetch(`${EDGE_FN_URL}?${qs}`, {
    headers: { 'apikey': CONFIG.SUPABASE_ANON_KEY },
    signal:  AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`nongsaro-proxy HTTP ${res.status}`);
  return res.json();
};

// ── 주간농사정보 ──────────────────────────────────────────────────────
// 이번 주 농사 작업 및 병해충 방제 요령
export const fetchWeeklyFarming = async () => {
  try {
    const data = await call('weeklyFarming/weeklyFarmingList');
    const items = data?.body?.items?.item || data?.body?.item || [];
    return Array.isArray(items) ? items : [items];
  } catch (err) {
    console.warn('[JANONG] 주간농사정보 오류:', err.message);
    return [];
  }
};

// ── 이달 심을 수 있는 작물 (작물재배기술 기반) ───────────────────────
// 전체 작물 목록에서 현재 월에 파종 가능한 작물 필터링
export const fetchCropsInSeason = async () => {
  try {
    const currentMonth = new Date().getMonth() + 1; // 1~12
    const data = await call('cropGrwStndInfo/cropGrwStndInfoList', {
      cropSeCode: '',
    });
    const items = data?.body?.items?.item || [];
    const list  = Array.isArray(items) ? items : [items];

    // 파종 적기(sowingBeginMonth ~ sowingEndMonth) 안에 현재 월 포함 여부 필터
    return list.filter(crop => {
      const start = parseInt(crop.sowingBeginMonth || crop.sownBeginMt || 0);
      const end   = parseInt(crop.sowingEndMonth   || crop.sownEndMt   || 0);
      if (!start || !end) return false;
      return currentMonth >= start && currentMonth <= end;
    }).map(crop => ({
      name:       crop.cropNm   || crop.cropName || '',
      code:       crop.cropCd   || crop.cropCode || '',
      sowStart:   crop.sowingBeginMonth || crop.sownBeginMt || '',
      sowEnd:     crop.sowingEndMonth   || crop.sownEndMt   || '',
      category:   crop.cropSeCodeNm || '',
    }));
  } catch (err) {
    console.warn('[JANONG] 이달 추천 작물 오류:', err.message);
    return [];
  }
};

// ── 작물 품종 정보 ────────────────────────────────────────────────────
export const fetchVarietyInfo = async (cropCode) => {
  try {
    const data = await call('varietyInfo/varietyInfoList', { cropCode });
    const items = data?.body?.items?.item || [];
    return Array.isArray(items) ? items : [items];
  } catch (err) {
    console.warn('[JANONG] 품종 정보 오류:', err.message);
    return [];
  }
};

// ── 치유농업 ──────────────────────────────────────────────────────────
const healingList = async (endpoint, label) => {
  try {
    const data  = await call(endpoint, { pageNo: '1', numOfRows: '10' });
    const items = data?.body?.items?.item || data?.body?.item || [];
    return Array.isArray(items) ? items : [items];
  } catch (err) {
    console.warn(`[JANONG] ${label} 오류:`, err.message);
    return [];
  }
};

export const fetchHealingIssues    = () => healingList('agroHealingIssue/agroHealingIssueList',                   '치유농업 이슈');
export const fetchHealingRefs      = () => healingList('agroHealingRef/agroHealingRefList',                       '치유농업 참고자료');
export const fetchHealingVideos    = () => healingList('agroHealingFarmMvp/agroHealingFarmMvpList',               '치유농업 동영상');
export const fetchHealingResearch  = () => healingList('agroHealingResearchResult/agroHealingResearchResultList', '치유농업 연구성과');
