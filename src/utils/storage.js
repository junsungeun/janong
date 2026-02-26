// localStorage CRUD 유틸 — 자농 전용
const PREFIX = 'janong_';

export const storage = {
  get: (key) => {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch { return false; }
  },

  remove: (key) => {
    localStorage.removeItem(PREFIX + key);
  },

  // 배열 기반 CRUD
  getList: (key) => {
    return storage.get(key) || [];
  },

  addItem: (key, item) => {
    const list = storage.getList(key);
    const newItem = { ...item, id: Date.now().toString(), createdAt: new Date().toISOString() };
    storage.set(key, [newItem, ...list]);
    return newItem;
  },

  updateItem: (key, id, updates) => {
    const list = storage.getList(key);
    const updated = list.map(item =>
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    );
    storage.set(key, updated);
  },

  deleteItem: (key, id) => {
    const list = storage.getList(key);
    storage.set(key, list.filter(item => item.id !== id));
  },
};

// ※ KEYS 상수는 초기 localStorage 플랜 레거시
//   현재 앱은 전체 Supabase(dbService.js) 사용 — 미사용
// export const KEYS = { ... };
