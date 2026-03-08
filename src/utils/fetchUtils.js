// AbortSignal.timeout 미지원 브라우저 대응 — 공용 fetch 유틸리티
export const fetchWithTimeout = (url, opts, ms) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(timer));
};
