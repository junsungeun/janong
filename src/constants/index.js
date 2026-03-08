// 공용 상수 — 자농(JANONG)

export const SEVERITY = [
  { value: 'high', label: '높음', color: 'var(--color-danger)', bg: '#FFF0F0' },
  { value: 'mid',  label: '보통', color: 'var(--color-terra)',  bg: '#FFF8F5' },
  { value: 'low',  label: '낮음', color: 'var(--color-info)',   bg: 'var(--color-earth-light)' },
];

export const CROP_OPTIONS = ['고추', '토마토', '배추', '상추', '오이', '가지', '감자', '고구마', '전체', '기타'];

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export const REPEAT_OPTIONS = ['없음', '매일', '매주', '월·수·금', '화·목'];

export const EVENT_TYPE_COLORS = {
  timeline: 'var(--color-primary)',
  calendar: 'var(--color-earth)',
  issue:    'var(--color-danger)',
  todo:     'var(--color-info)',
};
