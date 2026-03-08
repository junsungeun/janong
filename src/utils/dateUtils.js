// 날짜 관련 공용 유틸리티 — 자농(JANONG)

export const toYMD = (d) => d.toISOString().slice(0, 10);

export const todayYMD = toYMD(new Date());

export const tomorrowYMD = toYMD(new Date(Date.now() + 86400000));

export const diffDays = (ymd) => {
  const t = new Date(todayYMD);
  const d = new Date(ymd);
  return Math.round((d - t) / 86400000);
};

/** dateStr → 그룹 키 반환. dateStr 없으면 noDateFallback 반환 */
export const getGroup = (dateStr, noDateFallback = null) => {
  if (!dateStr) return noDateFallback;
  const diff = diffDays(dateStr);
  if (diff < 0)  return 'overdue';
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff <= 7)  return 'week';
  if (diff <= 30) return 'month';
  return 'later';
};
