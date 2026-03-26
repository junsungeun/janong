// SeedLog — Supabase DB 서비스
import { supabase } from '../lib/supabase';

export const TABLES = {
  CROP: 'crops',
  DAILY_LOG: 'daily_logs',
  CROP_PHOTO: 'crop_photos',
  CROP_TASK: 'crop_tasks',
  PROFILE: 'profiles',
};

// ── snake_case ↔ camelCase ──
const toSnake = (s) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const toCamel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

const snakify = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [toSnake(k), v === '' ? null : v])
  );
};

const camelify = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [toCamel(k), v]));
};

// ── 현재 유저 ID ──
const getUserId = async () => {
  const timeout = new Promise((_, rej) =>
    setTimeout(() => rej(new Error('세션 조회 시간 초과')), 8000)
  );
  const { data: { session } } = await Promise.race([
    supabase.auth.getSession(),
    timeout,
  ]);
  if (!session?.user?.id) throw new Error('로그인이 필요합니다');
  return session.user.id;
};

// ── CRUD ──
export const db = {
  getList: async (table, filters = {}) => {
    let q = supabase.from(table).select('*').order('created_at', { ascending: false });
    Object.entries(snakify(filters) || {}).forEach(([col, val]) => {
      if (val !== null && val !== undefined) q = q.eq(col, val);
    });
    const { data, error } = await q;
    if (error) { console.warn(`[db.getList] ${table}:`, error.message); return []; }
    return (data || []).map(camelify);
  },

  // 전체 데이터 조회 (RLS 허용 시 모든 유저 데이터)
  getAllList: async (table) => {
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (error) { console.warn(`[db.getAllList] ${table}:`, error.message); return []; }
    return (data || []).map(camelify);
  },

  getById: async (table, id) => {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
    if (error) throw error;
    return camelify(data);
  },

  add: async (table, item) => {
    const userId = await getUserId();
    const row = { ...snakify(item), user_id: userId };
    const { data, error } = await supabase.from(table).insert(row).select().single();
    if (error) throw new Error(`[${table}] 추가 실패: ${error.message}`);
    return camelify(data);
  },

  update: async (table, id, updates) => {
    const row = { ...snakify(updates), updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from(table).update(row).eq('id', id).select().single();
    if (error) throw new Error(`[${table}] 수정 실패: ${error.message}`);
    return camelify(data);
  },

  delete: async (table, id) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw new Error(`[${table}] 삭제 실패: ${error.message}`);
  },
};

// ── 사진 스토리지 ──
export const photoStorage = {
  upload: async (cropId, file) => {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${cropId}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const { error } = await supabase.storage.from('crop-photos').upload(path, file, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });
    if (error) throw error;
    return path;
  },

  getUrl: (path) => {
    if (!path) return '';
    const { data } = supabase.storage.from('crop-photos').getPublicUrl(path);
    return data.publicUrl;
  },

  remove: async (path) => {
    const { error } = await supabase.storage.from('crop-photos').remove([path]);
    if (error) throw error;
  },
};
