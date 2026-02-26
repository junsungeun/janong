import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Timer, BarChart2 } from 'lucide-react';
import { storage, KEYS } from '../utils/storage';

const CATEGORIES = ['파종', '물주기', '방제', '수확', '전정', '멀칭', '기타'];

const fmt = (sec) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
};

const fmtHM = (sec) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분`;
};

export default function WorkTimer() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [category, setCategory] = useState('기타');
  const [sessions, setSessions] = useState([]);
  const [view, setView] = useState('timer'); // timer | stats
  const intervalRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    setSessions(storage.getList(KEYS.WORK_TIMER));
  }, []);

  useEffect(() => {
    if (running) {
      startRef.current = Date.now() - elapsed * 1000;
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      }, 500);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const start = () => setRunning(true);
  const pause = () => setRunning(false);

  const stop = () => {
    setRunning(false);
    if (elapsed < 10) { setElapsed(0); return; }
    const record = {
      date: new Date().toISOString().slice(0, 10),
      category,
      duration: elapsed,
      startedAt: new Date(Date.now() - elapsed * 1000).toISOString(),
    };
    storage.addItem(KEYS.WORK_TIMER, record);
    setSessions(storage.getList(KEYS.WORK_TIMER));
    setElapsed(0);
  };

  // 오늘 통계
  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = sessions.filter(s => s.date === today);
  const todayTotal = todaySessions.reduce((a, s) => a + (s.duration || 0), 0);

  // 카테고리별 누적
  const catStats = CATEGORIES.map(cat => ({
    cat,
    total: sessions.filter(s => s.category === cat).reduce((a, s) => a + (s.duration || 0), 0),
  })).filter(s => s.total > 0).sort((a, b) => b.total - a.total);

  const totalAll = sessions.reduce((a, s) => a + (s.duration || 0), 0);

  // 최근 7일
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const label = `${d.getMonth()+1}/${d.getDate()}`;
    const total = sessions.filter(s => s.date === key).reduce((a, s) => a + (s.duration || 0), 0);
    return { key, label, total };
  });
  const maxDay = Math.max(...last7.map(d => d.total), 1);

  return (
    <div>
      <div className="section-header">
        <span className="section-title">작업 시간 기록</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setView('timer')}
            style={{
              padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
              border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
              background: view === 'timer' ? 'var(--color-primary)' : 'transparent',
              color: view === 'timer' ? '#fff' : 'var(--text-muted)',
            }}
          >
            <Timer size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />타이머
          </button>
          <button
            onClick={() => setView('stats')}
            style={{
              padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
              border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
              background: view === 'stats' ? 'var(--color-primary)' : 'transparent',
              color: view === 'stats' ? '#fff' : 'var(--text-muted)',
            }}
          >
            <BarChart2 size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />통계
          </button>
        </div>
      </div>

      {view === 'timer' ? (
        <>
          {/* ── 타이머 ── */}
          <div className="card mb-4" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '52px',
              fontWeight: 300,
              color: running ? 'var(--color-primary)' : 'var(--text)',
              letterSpacing: '0.04em',
              lineHeight: 1,
              marginBottom: '8px',
              transition: 'color 0.3s',
            }}>
              {fmt(elapsed)}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              {running ? '작업 중...' : elapsed > 0 ? '일시정지' : '시작 버튼을 눌러주세요'}
            </p>

            {/* 카테고리 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => !running && setCategory(cat)}
                  style={{
                    padding: '5px 12px', borderRadius: '100px', border: '1px solid',
                    fontSize: '12px', fontWeight: 500, cursor: running ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-sans)', transition: 'all 0.15s', opacity: running ? 0.6 : 1,
                    borderColor: category === cat ? 'var(--color-primary)' : 'var(--border)',
                    background: category === cat ? 'var(--color-primary)' : 'transparent',
                    color: category === cat ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              {!running ? (
                <button
                  className="btn-primary"
                  onClick={start}
                  style={{ padding: '12px 32px', borderRadius: '100px', gap: '8px' }}
                >
                  <Play size={16} strokeWidth={2} fill="white" /> {elapsed > 0 ? '재시작' : '시작'}
                </button>
              ) : (
                <button
                  className="btn-secondary"
                  onClick={pause}
                  style={{ padding: '12px 28px', borderRadius: '100px' }}
                >
                  <Pause size={16} strokeWidth={2} /> 일시정지
                </button>
              )}
              {elapsed > 0 && (
                <button
                  onClick={stop}
                  style={{
                    padding: '12px 20px', borderRadius: '100px', border: '1px solid var(--border)',
                    background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '14px', fontFamily: 'var(--font-sans)',
                  }}
                >
                  <Square size={14} strokeWidth={2} /> 종료·저장
                </button>
              )}
            </div>
          </div>

          {/* 오늘 요약 */}
          <div className="card-record" style={{ padding: '14px 16px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>오늘 총 작업</span>
              <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
                {fmtHM(todayTotal)}
              </span>
            </div>
          </div>

          {/* 오늘 세션 목록 */}
          {todaySessions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {todaySessions.map(s => (
                <div key={s.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', background: 'var(--bg-card)', borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                }}>
                  <span className="badge badge-good" style={{ fontSize: '11px' }}>{s.category}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-serif)' }}>
                    {fmtHM(s.duration)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* ── 통계 뷰 ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.05em' }}>오늘</p>
              <p style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>
                {fmtHM(todayTotal)}
              </p>
            </div>
            <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.05em' }}>전체 누적</p>
              <p style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--color-earth)' }}>
                {fmtHM(totalAll)}
              </p>
            </div>
          </div>

          {/* 7일 바 차트 */}
          <div className="card mb-4" style={{ padding: '18px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '14px', letterSpacing: '0.05em' }}>최근 7일</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
              {last7.map(d => (
                <div key={d.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{
                    width: '100%', borderRadius: '3px 3px 0 0',
                    background: d.key === today ? 'var(--color-primary)' : 'var(--color-primary-light)',
                    height: d.total > 0 ? `${Math.max(6, (d.total / maxDay) * 60)}px` : '3px',
                    transition: 'height 0.3s',
                  }} />
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 카테고리별 */}
          {catStats.length > 0 && (
            <div className="card" style={{ padding: '18px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '14px', letterSpacing: '0.05em' }}>작업 유형별</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {catStats.map(({ cat, total }) => (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{cat}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{fmtHM(total)}</span>
                    </div>
                    <div style={{ height: '5px', background: 'var(--bg-subtle)', borderRadius: '3px' }}>
                      <div style={{
                        height: '100%', borderRadius: '3px',
                        background: 'var(--color-primary)',
                        width: `${(total / totalAll) * 100}%`,
                        transition: 'width 0.4s',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
