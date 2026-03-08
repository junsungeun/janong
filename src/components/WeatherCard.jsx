import { useState, useEffect, useCallback } from 'react';
import { CloudSun, Droplets, Wind, Thermometer, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchWeather, getNaturalFarmingAdvice, mockWeather } from '../services/weatherService';
import { CONFIG } from '../config';

export default function WeatherCard() {
  const [weather, setWeather]       = useState(null);
  const [advice, setAdvice]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchWeather(CONFIG.WEATHER_STATION_CODE, CONFIG.WEATHER_API_KEY);
    setWeather(data);
    setAdvice(getNaturalFarmingAdvice(data));
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // 날씨 아이콘 간단 매핑
  const weatherIcon = () => {
    if (!weather) return <CloudSun size={36} color="var(--color-earth)" strokeWidth={1.5} />;
    const { re, rh, si } = weather;
    if (re > 1) return <span role="img" aria-label="비" style={{ fontSize: '32px' }}>🌧</span>;
    if (rh > 85) return <span role="img" aria-label="흐림" style={{ fontSize: '32px' }}>☁</span>;
    if (si > 400) return <span role="img" aria-label="맑음" style={{ fontSize: '32px' }}>☀</span>;
    return <CloudSun size={36} color="var(--color-earth)" strokeWidth={1.5} />;
  };

  const timeStr = lastUpdated
    ? `${lastUpdated.getHours().toString().padStart(2,'0')}:${lastUpdated.getMinutes().toString().padStart(2,'0')} 업데이트`
    : '';

  return (
    <div style={{ marginBottom: '20px' }}>

      {/* ── 날씨 메인 카드 ── */}
      <div className="card" style={{ padding: '20px' }}>

        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <RefreshCw size={16} strokeWidth={1.5} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: 'var(--text-sm)' }}>날씨 불러오는 중...</span>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '36px',
                    fontWeight: 300,
                    color: 'var(--color-primary)',
                    lineHeight: 1,
                  }}>
                    {weather?.temp ?? '--'}°
                  </span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>C</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  {weather?.isMock && (
                    <span style={{
                      fontSize: '10px', fontWeight: 600, padding: '2px 7px',
                      borderRadius: '100px', background: 'var(--bg-subtle)',
                      color: 'var(--text-muted)', border: '1px solid var(--border)',
                    }}>
                      예시 데이터
                    </span>
                  )}
                  {!weather?.isMock && weather?.observedAt && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {weather.observedAt} 관측
                    </span>
                  )}
                  {weather?.isMock && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      API 키 입력 후 실시간 연동
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            {weatherIcon()}
            <button
              onClick={load}
              disabled={loading}
              style={{
                background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '11px', padding: '2px 0', opacity: loading ? 0.4 : 1,
              }}
            >
              <RefreshCw size={12} strokeWidth={1.5} />
              {timeStr}
            </button>
          </div>
        </div>

        {/* 예시 데이터 안내 */}
        {!loading && weather?.isMock && (
          <div style={{
            marginBottom: '14px', padding: '10px 14px', borderRadius: '8px',
            background: '#FFF8F0', border: '1px solid #FFD9B0',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <AlertCircle size={14} color="var(--color-terra)" strokeWidth={1.5} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '12px', color: 'var(--color-terra)', flex: 1 }}>
              실시간 날씨를 불러오지 못했어요
            </p>
            <button onClick={load} style={{
              background: 'none', border: '1px solid var(--color-terra)', borderRadius: '6px',
              color: 'var(--color-terra)', fontSize: '11px', fontWeight: 600,
              cursor: 'pointer', padding: '4px 10px', fontFamily: 'var(--font-sans)',
              whiteSpace: 'nowrap',
            }}>
              다시 시도
            </button>
          </div>
        )}

        {/* 기상 수치 4격자 */}
        {!loading && weather && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-light)',
          }}>
            {[
              { icon: <Droplets size={16} strokeWidth={1.5} />, label: '습도',    value: `${Math.round(weather.rh)}%` },
              { icon: <Wind     size={16} strokeWidth={1.5} />, label: '풍속',    value: `${weather.ws}m/s` },
              { icon: <Thermometer size={16} strokeWidth={1.5} />, label: '토양수분', value: weather.ms10 != null ? `${Math.round(weather.ms10)}%` : '-' },
              { icon: <CloudSun size={16} strokeWidth={1.5} />, label: '강수',    value: `${weather.re}mm` },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)', display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                  {item.icon}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{item.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 자연농업 추천 ── */}
      {!loading && advice.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div className="section-header" style={{ marginBottom: '10px' }}>
            <span className="section-title">오늘의 추천 작업</span>
            <span className="badge badge-info">자연농업 기준</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {advice.map((rec, i) => (
              <div
                key={i}
                className={rec.type === 'good' ? 'card-highlight' : 'card-warning'}
                style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}
              >
                <span style={{ fontSize: '20px', lineHeight: 1.2, flexShrink: 0 }}>{rec.icon}</span>
                <div>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    color: rec.type === 'good' ? 'var(--color-primary)' : 'var(--color-terra)',
                    marginBottom: '3px',
                  }}>
                    {rec.title}
                  </p>
                  <p style={{ fontSize: 'var(--text-caption)', color: 'var(--text-muted)', lineHeight: 'var(--leading-loose)' }}>
                    {rec.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
