import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/dbService';

export function useList(table, filters = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 15000));
      const data = await Promise.race([db.getList(table, filters), timeout]);
      setItems(data);
    } catch {
      // 타임아웃 또는 에러 시 빈 목록 유지
    } finally {
      setLoading(false);
    }
  }, [table, JSON.stringify(filters)]);
  useEffect(() => { reload(); }, [reload]);
  return { items, loading, reload };
}
