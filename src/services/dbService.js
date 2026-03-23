// JANONG — Supabase DB 서비스
// camelCase ↔ snake_case 자동 변환 포함

import { supabase } from '../lib/supabase';

// ── 테이블명 상수 ─────────────────────────────────────────
export const TABLES = {
  CROP:         'crops',
  DAILY_LOG:    'daily_logs',
  TODO:         'todos',
  ISSUE:        'issues',
  WORK_TIMER:   'work_timers',
  CHEM_LOG:     'chem_logs',
  RECIPE:       'recipes',
  MICROBE_LOG:  'microbe_logs',
  CALENDAR:     'calendar_events',
  CROP_PHOTO:   'crop_photos',
};

// ── camelCase ↔ snake_case 변환 ───────────────────────────
const toSnake = (s) => s.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`);
const toCamel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

// 빈 문자열 → null 변환 (UUID/참조 컬럼에 '' 전송 방지)
const emptyToNull = (v) => (v === '' ? null : v);

const snakify = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [toSnake(k), emptyToNull(v)])
  );
};

const camelify = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [toCamel(k), v]));
};

// ── 범용 CRUD ─────────────────────────────────────────────
export const db = {
  // 목록 조회 (최신순)
  getList: async (table, filters = {}) => {
    let q = supabase.from(table).select('*').order('created_at', { ascending: false });
    Object.entries(snakify(filters)).forEach(([col, val]) => { q = q.eq(col, val); });
    const { data, error } = await q;
    if (error) {
      console.warn(`[db.getList] ${table}:`, error.message);
      return [];
    }
    return (data || []).map(camelify);
  },

  // 단건 조회
  getById: async (table, id) => {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
    if (error) throw error;
    return camelify(data);
  },

  // 추가 (user_id 자동 주입)
  add: async (table, item) => {
    const { data: { user } } = await supabase.auth.getUser();
    const row = { ...snakify(item), user_id: user?.id };
    const { data, error } = await supabase.from(table).insert(row).select().single();
    if (error) throw error;
    return camelify(data);
  },

  // 수정
  update: async (table, id, updates) => {
    const row = { ...snakify(updates), updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from(table).update(row).eq('id', id).select().single();
    if (error) throw error;
    return camelify(data);
  },

  // 삭제
  delete: async (table, id) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },
};

// ── 사진 스토리지 (타임랩스) ──────────────────────────────
export const photoStorage = {
  // File → Supabase Storage 업로드 후 경로 반환
  upload: async (cropId, file) => {
    const ext  = file.name.split('.').pop() || 'jpg';
    const path = `${cropId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('crop-photos').upload(path, file, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });
    if (error) throw error;
    return path;
  },

  // storage path → 공개 URL
  getUrl: (path) => {
    const { data } = supabase.storage.from('crop-photos').getPublicUrl(path);
    return data.publicUrl;
  },

  // 삭제
  remove: async (path) => {
    const { error } = await supabase.storage.from('crop-photos').remove([path]);
    if (error) throw error;
  },
};
