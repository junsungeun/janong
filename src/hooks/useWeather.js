import { useState, useEffect } from 'react';
import { fetchCurrentWeather } from '../services/kmaWeatherService';

export function useWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchCurrentWeather().then(w => { setWeather(w); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  return { weather, loading };
}
