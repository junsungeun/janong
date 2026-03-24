// SeedLog — 기업지원플러스 사업공고 API
import { CONFIG } from '../config';

const API_URL = 'https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do';

const AGRI_KEYWORDS = [
  '농업', '농식품', '농촌', '귀농', '귀촌', '영농',
  '스마트팜', '6차산업', '농가', '축산', '임업', '수산',
];

let cache = { data: null, ts: 0 };
const CACHE_TTL = 10 * 60 * 1000; // 10분

export async function fetchAgriNotices() {
  if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
    return cache.data;
  }

  const params = new URLSearchParams({
    crtfcKey: CONFIG.BIZINFO_API_KEY,
    dataType: 'json',
    pageUnit: '100',
    pageIndex: '1',
  });

  const resp = await fetch(`${API_URL}?${params}`);
  if (!resp.ok) throw new Error('사업공고 조회 실패');

  const json = await resp.json();
  const items = json.jsonArray || [];
  const all = Array.isArray(items) ? items : [items];

  const filtered = all.filter((item) => {
    const text = `${item.pblancNm || ''} ${item.hashtags || ''}`;
    return AGRI_KEYWORDS.some((kw) => text.includes(kw));
  });

  const result = filtered.map((item) => ({
    id: item.pblancId,
    title: item.pblancNm || '',
    org: item.jrsdInsttNm || '',
    period: formatPeriod(item.reqstBeginEndDe),
    url: item.pblancUrl || '',
    tags: item.hashtags || '',
  }));

  cache = { data: result, ts: Date.now() };
  return result;
}

function formatPeriod(raw) {
  if (!raw) return '';
  // "20260301~20260401" → "2026.03.01 ~ 2026.04.01"
  return raw.replace(/(\d{4})(\d{2})(\d{2})/g, '$1.$2.$3');
}
