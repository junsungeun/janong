import { useState, useEffect } from 'react';
import {
  Sprout, BookOpen, Camera, Thermometer,
  ChevronRight, TrendingUp, Calendar as CalIcon,
} from 'lucide-react';
import { db, TABLES, photoStorage } from '../services/dbService';
import { getCurrentSolarTerm, formatDate } from '../utils/solarTerms';
import { daysSincePlanting } from '../data/cropTimelines';
import { todayYMD } from '../utils/dateUtils';
import { getTodayVerse } from '../data/bibleVerses';
import { fetchCurrentWeather, getRainTypeText } from '../services/kmaWeatherService';

export default function Dashboard({ onNavigate, trigger }) {
  const [crops, setCrops] = useState([]);
  const [logs, setLogs] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const dateInfo = formatDate();
  const solarTerm = getCurrentSolarTerm();
  const verse = getTodayVerse();

  useEffect(() => {
    const load = async () => {
      const [cr, lg, ph] = await Promise.all([
        db.getList(TABLES.CROP),
        db.getList(TABLES.DAILY_LOG),
        db.getList(TABLES.CROP_PHOTO),
      ]);
      setCrops(cr);
      setLogs(lg);
      setPhotos(ph);
    };
    load();

    fetchCurrentWeather().then(w => {
      setWeather(w);
      setWeatherLoading(false);
    });
  }, []);

  // 통계
  const totalLogs = logs.length;
  const totalPhotos = photos.length + logs.reduce((acc, l) => acc + (l.photos?.length || 0), 0);
  const thisWeekLogs = logs.filter(l => {
    const d = new Date(l.date);
    const now = new Date();
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    return diff <= 7 && diff >= 0;
  }).length;

  // 최근 기온 데이터 (최근 7개)
  const tempLogs = logs
    .filter(l => l.autoTemp || l.tempHigh || l.tempLow)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    .slice(-7);

  // 최근 기록 3개
  const recentLogs = logs.slice(0, 3);

  return (
    <div className="dashboard">

      {/* ── 날짜 + 절기 ── */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{
            fontFamily: 'var(--font-serif)', fontSize: '22px',
            fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em',
          }}>
            {dateInfo.month}월 {dateInfo.day}일
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{dateInfo.weekday}요일</span>
          {solarTerm && <span className="badge badge-good">{solarTerm}</span>}
        </div>
      </div>

      {/* ── 현재 날씨 (기상청 실시간) ── */}
      <div className="card" style={{ padding: '18px 20px', marginBottom: '12px' }}>
        {weatherLoading ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>날씨 불러오는 중...</p>
        ) : weather ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>
                  {weather.temp}°
                </span>
                {weather.rainType > 0 && (
                  <span className="badge badge-info">{getRainTypeText(weather.rainType)}</span>
                )}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                습도 {weather.rh}% · 풍속 {weather.windSpeed}m/s
                {weather.rain > 0 ? ` · 강수 ${weather.rain}mm` : ''}
              </p>
            </div>
            <Thermometer size={28} color="var(--color-terra)" strokeWidth={1.5} />
          </div>
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
            위치 권한을 허용하면 현재 기온을 볼 수 있어요
          </p>
        )}
      </div>

      {/* ── 오늘의 말씀 ── */}
      <div style={{
        background: 'var(--color-primary)', borderRadius: '10px',
        padding: '16px 20px', marginBottom: '16px',
      }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '13px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.85 }}>
          "{verse.text}"
        </p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>— {verse.ref}</p>
      </div>

      {/* ── 요약 통계 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
        <StatCard icon={<Sprout size={18} />} label="내 작물" value={`${crops.length}종`} color="var(--color-primary)" />
        <StatCard icon={<BookOpen size={18} />} label="이번주 기록" value={`${thisWeekLogs}건`} color="var(--color-earth)" />
        <StatCard icon={<Camera size={18} />} label="총 사진" value={`${totalPhotos}장`} color="var(--color-terra)" />
      </div>

      {/* ── 기온 추이 (간단 바 차트) ── */}
      {tempLogs.length > 0 && (
        <div className="card" style={{ padding: '16px 18px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
            <TrendingUp size={15} color="var(--color-terra)" strokeWidth={1.5} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>최근 기온</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
            {tempLogs.map((log, i) => {
              const temp = log.autoTemp || log.tempHigh || log.tempLow || 0;
              const maxTemp = Math.max(...tempLogs.map(l => l.autoTemp || l.tempHigh || l.tempLow || 0), 1);
              const h = Math.max(10, (temp / maxTemp) * 60);
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text)' }}>{Math.round(temp)}°</span>
                  <div style={{
                    width: '100%', height: `${h}px`, borderRadius: '4px',
                    background: `linear-gradient(to top, var(--color-primary), var(--color-terra))`,
                    opacity: 0.7 + (i / tempLogs.length) * 0.3,
                  }} />
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                    {(log.date || '').slice(5).replace('-', '/')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 내 작물 요약 ── */}
      {crops.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div className="section-header" style={{ marginBottom: '10px' }}>
            <span className="section-title">내 작물</span>
            <button className="btn-ghost" onClick={() => onNavigate('crop')}>
              전체 보기
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {crops.slice(0, 4).map(crop => {
              const elapsed = daysSincePlanting(crop.plantingDate);
              const cropLogs = logs.filter(l => l.cropId === crop.id).length;
              return (
                <button
                  key={crop.id}
                  onClick={() => onNavigate('crop')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', background: 'var(--bg-card)',
                    border: '1px solid var(--border)', borderRadius: '10px',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: 'var(--color-primary-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', flexShrink: 0,
                  }}>
                    🌱
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                      {crop.name}
                    </span>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      D+{elapsed} · 기록 {cropLogs}건
                    </p>
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 최근 기록 ── */}
      {recentLogs.length > 0 && (
        <div>
          <div className="section-header" style={{ marginBottom: '10px' }}>
            <span className="section-title">최근 기록</span>
            <button className="btn-ghost" onClick={() => onNavigate('record')}>
              전체 보기
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {recentLogs.map(log => (
              <div key={log.id} className="card" style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)' }}>
                    {(log.date || '').replace(/-/g, '.')}
                  </span>
                  <span className="badge badge-info" style={{ fontSize: '10px' }}>{log.weather}</span>
                  {(log.autoTemp || log.tempHigh) && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {Math.round(log.autoTemp || log.tempHigh)}°C
                    </span>
                  )}
                  {log.photos?.length > 0 && <Camera size={12} color="var(--text-muted)" />}
                </div>
                <p style={{
                  fontSize: '13px', color: 'var(--text)', lineHeight: 1.6,
                  overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  {log.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 빈 상태 ── */}
      {crops.length === 0 && recentLogs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <Sprout size={40} strokeWidth={1.5} style={{ margin: '0 auto 14px', display: 'block', opacity: 0.3 }} />
          <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>시작해볼까요?</p>
          <p style={{ fontSize: '12px', lineHeight: 1.8 }}>
            작물을 등록하고 매일 기록을 남겨보세요.<br />
            데이터가 쌓일수록 농사가 보입니다.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card" style={{
      padding: '14px 12px', textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
    }}>
      <div style={{ color, opacity: 0.8 }}>{icon}</div>
      <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>{value}</p>
      <p style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>{label}</p>
    </div>
  );
}
