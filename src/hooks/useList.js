import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/dbService';

export function useList(table, filters = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setLoading(true);
    const data = await db.getList(table, filters);
    setItems(data);
    setLoading(false);
  }, [table, JSON.stringify(filters)]);
  useEffect(() => { reload(); }, [reload]);
  return { items, loading, reload };
}
