import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/dbService';

export function useList(table, filters = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 15000));
      const data = await Promise.race([db.getList(table, filters), timeout]);
      setItems(data);
    } catch (err) {
      // 타임아웃 또는 에러 시 빈 목록 유지
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [table, JSON.stringify(filters)]);
  useEffect(() => { reload(); }, [reload]);
  return { items, loading, reload, error };
}
