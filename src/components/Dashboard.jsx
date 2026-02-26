import { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare, AlertTriangle, Timer, Plus, Leaf,
  RefreshCw, X, ChevronRight, ChevronDown, ChevronUp,
  ChevronLeft, CalendarDays, Sprout,
} from 'lucide-react';
import { getCurrentSolarTerm, formatDate } from '../utils/solarTerms';
import { db, TABLES } from '../services/dbService';
import { getCropTimeline } from '../data/cropTimelines';
import { adviseIssue, MOCK_ISSUE_ADVICE } from '../services/geminiService';
import { CONFIG } from '../config';
import WeatherCard from './WeatherCard';
import { getTodayVerse } from '../data/bibleVerses';

const SEVERITY = [
  { value: 'high', label: '높음', color: 'var(--color-danger)', bg: '#FFF0F0' },
  { value: 'mid',  label: '보통', color: 'var(--color-terra)',  bg: '#FFF8F5' },
  { value: 'low',  label: '낮음', color: 'var(--color-info)',   bg: 'var(--color-earth-light)' },
];
const CROP_OPTIONS = ['고추', '토마토', '배추', '상추', '오이', '가지', '감자', '고구마', '전체', '기타'];
const REPEAT_OPTIONS = ['없음', '매일', '매주', '월·수·금', '화·목'];
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const toYMD = (d) => d.toISOString().slice(0, 10);

// 결과 텍스트 파서
function ResultView({ text }) {
  const lines = text.split('\n').filter(l => l.trim());
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {lines.map((line, i) => {
        const isSection = /^[📍🌿⚠️✅📊💡🌱]/.test(line);
        const isList    = /^\s{2,}[\d\-]/.test(line);
        return (
          <p key={i} style={{
            fontSize: isSection ? '13px' : '12px',
            fontWeight: isSection ? 600 : 400,
            color: isSection ? 'var(--text)' : 'var(--text-muted)',
            lineHeight: 1.85,
            marginTop: isSection && i !== 0 ? '8px' : 0,
            paddingLeft: isList ? '4px' : 0,
          }}>
            {line}
          </p>
        );
      })}
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const [todos, setTodos]       = useState([]);
  const [issues, setIssues]     = useState([]);
  const [crops, setCrops]       = useState([]);
  const [calEvents, setCalEvents] = useState([]);

  // 이슈 등록 상태
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueForm, setIssueForm] = useState({ title: '', content: '', severity: 'high', crop: '전체' });
  const [issueAdvice, setIssueAdvice] = useState(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [savedIssue, setSavedIssue] = useState(null);

  // 할 일 추가 상태
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [todoForm, setTodoForm] = useState({ text: '', date: '', repeat: '없음' });

  // 캘린더 펼치기 상태
  const [calExpanded, setCalExpanded] = useState(false);
  const [calSelDate, setCalSelDate]   = useState(null);
  const [calMonth, setCalMonth]       = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });

  const dateInfo  = formatDate();
  const solarTerm = getCurrentSolarTerm();
  const verse     = getTodayVerse();
  const todayYMD  = toYMD(new Date());

  const load = async () => {
    const [td, iss, cr, cal] = await Promise.all([
      db.getList(TABLES.TODO),
      db.getList(TABLES.ISSUE),
      db.getList(TABLES.CROP),
      db.getList(TABLES.CALENDAR),
    ]);
    setTodos(td);
    setIssues(iss);
    setCrops(cr);
    setCalEvents(cal);
  };

  useEffect(() => { load(); }, []);

  const toggleTodo = async (id) => {
    await db.update(TABLES.TODO, id, { done: !todos.find(t => t.id === id)?.done });
    await load();
  };

  // ── 이번 주 날짜 배열 (일~토) ─────────────────────────────────────
  const weekDates = useMemo(() => {
    const today = new Date();
    const dow = today.getDay(); // 0=일
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - dow + i);
      return toYMD(d);
    });
  }, []);

  // ── 날짜별 이벤트 맵 ──────────────────────────────────────────────
  const eventsByDate = useMemo(() => {
    const map = {};
    const push = (ymd, ev) => { map[ymd] = [...(map[ymd] || []), ev]; };

    // 작물 타임라인
    crops.forEach(crop => {
      getCropTimeline(crop.name, crop.plantingDate).forEach(item => {
        push(item.date, { type: 'timeline', label: item.label, icon: item.icon, crop: crop.name });
      });
    });

    // 캘린더 이벤트
    calEvents.forEach(ev => push(ev.date, { type: 'calendar', label: ev.title }));

    // 할 일
    todos.filter(t => t.date && !t.done).forEach(t => push(t.date, { type: 'todo', label: t.text }));

    return map;
  }, [crops, calEvents, todos]);

  // 오늘 이벤트
  const todayEvents = eventsByDate[todayYMD] || [];
  // 오늘 미완료 할 일
  const pendingTodos = todos.filter(t => !t.done).slice(0, 3);
  const activeIssues = issues.filter(i => !i.solved);

  // ── 이슈 저장 + Gemini 조언 ─────────────────────────────────────────
  const saveIssue = async () => {
    if (!issueForm.title.trim()) return;
    setAdviceLoading(true);
    setIssueAdvice(null);
    const saved = await db.add(TABLES.ISSUE, { ...issueForm, solved: false });
    setSavedIssue(saved);
    await load();
    const apiKey = CONFIG.GEMINI_API_KEY;
    try {
      const text = apiKey ? await adviseIssue(issueForm, apiKey) : MOCK_ISSUE_ADVICE;
      setIssueAdvice(text);
    } catch {
      setIssueAdvice(MOCK_ISSUE_ADVICE);
    } finally {
      setAdviceLoading(false);
    }
  };

  const resetIssueForm = () => {
    setShowIssueForm(false);
    setIssueForm({ title: '', content: '', severity: 'high', crop: '전체' });
    setIssueAdvice(null);
    setSavedIssue(null);
    setAdviceLoading(false);
  };

  // ── 할 일 저장 ───────────────────────────────────────────────────────
  const saveTodo = async () => {
    if (!todoForm.text.trim()) return;
    await db.add(TABLES.TODO, { ...todoForm, done: false });
    await load();
    setTodoForm({ text: '', date: '', repeat: '없음' });
    setShowTodoForm(false);
  };

  // ── 이벤트 타입별 색상 ─────────────────────────────────────────────
  const dotColor = (type) => {
    if (type === 'timeline') return 'var(--color-primary)';
    if (type === 'calendar')  return 'var(--color-earth)';
    if (type === 'todo')      return 'var(--color-info)';
    return 'var(--border)';
  };

  return (
    <div className="dashboard">

      {/* ── 날짜 + 절기 ── */}
      <div className="date-header mb-4">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{
            fontFamily: 'var(--font-serif)', fontSize: '22px',
            fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em',
          }}>
            {dateInfo.month}월 {dateInfo.day}일
          </span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {dateInfo.weekday}요일
          </span>
          {solarTerm && <span className="badge badge-good" style={{ marginLeft: '4px' }}>{solarTerm}</span>}
        </div>
      </div>

      {/* ── 오늘의 말씀 ── */}
      <div className="mb-5" style={{
        background: 'var(--color-primary)', borderRadius: '10px',
        padding: '18px 20px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: '20px', bottom: '-30px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: '10px' }}>
          오늘의 말씀
        </p>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '14px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.85, marginBottom: '12px' }}>
          "{verse.text}"
        </p>
        <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.05em' }}>
          — {verse.ref}
        </p>
      </div>

      {/* ── 날씨 카드 ── */}
      <WeatherCard />

      {/* ── 일정 캘린더 ── */}
      <div className="mb-5">
        <div className="section-header" style={{ marginBottom: '12px' }}>
          <span className="section-title">일정</span>
          <button
            onClick={() => { setCalExpanded(v => !v); setCalSelDate(null); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', borderRadius: '8px',
              background: calExpanded ? 'var(--color-primary-light)' : 'var(--bg-card)',
              border: `1px solid ${calExpanded ? 'var(--color-primary)' : 'var(--border)'}`,
              cursor: 'pointer', color: calExpanded ? 'var(--color-primary)' : 'var(--text-muted)',
              transition: 'all 0.15s', flexShrink: 0,
            }}
          >
            {calExpanded ? <ChevronUp size={15} strokeWidth={2} /> : <CalendarDays size={15} strokeWidth={1.5} />}
          </button>
        </div>

        {/* 주간 날짜 스트립 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '10px' }}>
          {weekDates.map((ymd, i) => {
            const isToday  = ymd === todayYMD;
            const isSel    = ymd === calSelDate;
            const d        = new Date(ymd);
            const dayEvs   = eventsByDate[ymd] || [];
            const isSun    = i === 0;
            const isSat    = i === 6;
            return (
              <button key={ymd}
                onClick={() => setCalSelDate(isSel ? null : ymd)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px 0',
                }}
              >
                <p style={{
                  fontSize: '10px', fontWeight: 500, marginBottom: '4px',
                  color: isSun ? 'var(--color-danger)' : isSat ? 'var(--color-info)' : 'var(--text-muted)',
                }}>
                  {WEEKDAYS[d.getDay()]}
                </p>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isSel ? 'var(--color-earth)' : isToday ? 'var(--color-primary)' : 'transparent',
                }}>
                  <span style={{
                    fontSize: '13px', fontWeight: (isToday || isSel) ? 700 : 400,
                    color: (isToday || isSel) ? '#fff' : isSun ? 'var(--color-danger)' : isSat ? 'var(--color-info)' : 'var(--text)',
                  }}>
                    {d.getDate()}
                  </span>
                </div>
                <div style={{ height: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2px', marginTop: '3px' }}>
                  {dayEvs.slice(0, 3).map((ev, j) => (
                    <div key={j} style={{ width: '4px', height: '4px', borderRadius: '50%', background: dotColor(ev.type) }} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── 펼친 월간 캘린더 ── */}
        {calExpanded && (() => {
          const cells = [];
          const first = new Date(calMonth.year, calMonth.month, 1);
          const last  = new Date(calMonth.year, calMonth.month + 1, 0).getDate();
          for (let i = 0; i < first.getDay(); i++) cells.push(null);
          for (let d = 1; d <= last; d++) cells.push(d);

          return (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '14px', marginBottom: '10px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <button onClick={() => setCalMonth(p => { const d = new Date(p.year, p.month - 1); return { year: d.getFullYear(), month: d.getMonth() }; })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px' }}>
                  <ChevronLeft size={16} strokeWidth={1.5} />
                </button>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-serif)' }}>
                  {calMonth.year}년 {calMonth.month + 1}월
                </span>
                <button onClick={() => setCalMonth(p => { const d = new Date(p.year, p.month + 1); return { year: d.getFullYear(), month: d.getMonth() }; })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '4px' }}>
                  <ChevronRight size={16} strokeWidth={1.5} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' }}>
                {WEEKDAYS.map((w, i) => (
                  <div key={w} style={{
                    textAlign: 'center', fontSize: '10px', fontWeight: 600, padding: '3px 0',
                    color: i === 0 ? 'var(--color-danger)' : i === 6 ? 'var(--color-info)' : 'var(--text-muted)',
                  }}>{w}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                {cells.map((day, i) => {
                  if (!day) return <div key={`e-${i}`} />;
                  const ymd    = `${calMonth.year}-${String(calMonth.month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                  const isToday = ymd === todayYMD;
                  const isSel   = ymd === calSelDate;
                  const colIdx  = i % 7;
                  const dots    = [...new Set((eventsByDate[ymd] || []).map(e => e.type))];
                  return (
                    <button key={ymd} onClick={() => setCalSelDate(isSel ? null : ymd)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        padding: '5px 2px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                        background: isSel ? 'var(--color-earth)' : isToday ? 'var(--color-primary-light)' : 'transparent',
                        minHeight: '40px',
                      }}
                    >
                      <span style={{
                        fontSize: '12px', lineHeight: 1, marginBottom: '4px', fontWeight: (isToday || isSel) ? 700 : 400,
                        color: isSel ? '#fff' : isToday ? 'var(--color-primary)'
                          : colIdx === 0 ? 'var(--color-danger)' : colIdx === 6 ? 'var(--color-info)' : 'var(--text)',
                      }}>
                        {day}
                      </span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {dots.slice(0, 3).map((type, j) => (
                          <div key={j} style={{
                            width: '4px', height: '4px', borderRadius: '50%',
                            background: isSel ? 'rgba(255,255,255,0.8)' : dotColor(type),
                          }} />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ── 선택된 날짜 항목 ── */}
        {calSelDate && (() => {
          const items = eventsByDate[calSelDate] || [];
          const d     = new Date(calSelDate);
          const label = calSelDate === todayYMD ? '오늘' : `${d.getMonth() + 1}/${d.getDate()}`;
          return (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '14px', marginBottom: '6px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{label} 일정</p>
                <button onClick={() => setCalSelDate(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  <X size={15} strokeWidth={1.5} />
                </button>
              </div>
              {items.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                  이날 등록된 항목이 없어요
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {items.map((ev, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '9px 12px', borderRadius: '7px',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      borderLeft: `3px solid ${dotColor(ev.type)}`,
                    }}>
                      <div style={{ flexShrink: 0 }}>
                        {ev.type === 'timeline' && <Sprout size={13} color={dotColor('timeline')} strokeWidth={1.5} />}
                        {ev.type === 'calendar'  && <CalendarDays size={13} color={dotColor('calendar')} strokeWidth={1.5} />}
                        {ev.type === 'todo'      && <CheckSquare size={13} color={dotColor('todo')} strokeWidth={1.5} />}
                        {ev.type === 'issue'     && <AlertTriangle size={13} color={dotColor('issue')} strokeWidth={1.5} />}
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text)', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {ev.icon ? `${ev.icon} ` : ''}{ev.label}
                      </span>
                      {ev.crop && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{ev.crop}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* 오늘 항목 (날짜 미선택 상태) */}
        {!calSelDate && (() => {
          const todayEvs = eventsByDate[todayYMD] || [];
          if (todayEvs.length === 0) return (
            <div style={{ padding: '14px', borderRadius: '8px', textAlign: 'center', background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '12px' }}>오늘 예정된 일정이 없어요</p>
            </div>
          );
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {todayEvs.slice(0, 4).map((ev, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '9px 12px', borderRadius: '7px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderLeft: `3px solid ${dotColor(ev.type)}`,
                }}>
                  <div style={{ flexShrink: 0 }}>
                    {ev.type === 'timeline' && <Sprout size={13} color={dotColor('timeline')} strokeWidth={1.5} />}
                    {ev.type === 'calendar'  && <CalendarDays size={13} color={dotColor('calendar')} strokeWidth={1.5} />}
                    {ev.type === 'todo'      && <CheckSquare size={13} color={dotColor('todo')} strokeWidth={1.5} />}
                    {ev.type === 'issue'     && <AlertTriangle size={13} color={dotColor('issue')} strokeWidth={1.5} />}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text)', flex: 1 }}>
                    {ev.icon ? `${ev.icon} ` : ''}{ev.label}
                  </span>
                  {ev.crop && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{ev.crop}</span>}
                </div>
              ))}
              {todayEvs.length > 4 && (
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '4px 0' }}>
                  +{todayEvs.length - 4}개 더
                </p>
              )}
            </div>
          );
        })()}
      </div>

      {/* ── 할 일 미리보기 ── */}
      <div className="mb-5">
        <div className="section-header">
          <span className="section-title">할 일</span>
          <button className="btn-ghost" onClick={() => onNavigate('more')}>전체 보기</button>
        </div>

        {/* 인라인 할 일 추가 폼 */}
        {showTodoForm && (
          <div className="card mb-4" style={{ borderLeft: '3px solid var(--color-primary)', borderRadius: '0 8px 8px 0', padding: '16px 18px' }}>
            <div style={{ marginBottom: '10px' }}>
              <input className="input" placeholder="할 일을 입력해요"
                value={todoForm.text}
                onChange={e => setTodoForm(p => ({ ...p, text: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && saveTodo()}
                style={{ fontSize: '14px' }} autoFocus />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <input type="date" className="input" value={todoForm.date}
                onChange={e => setTodoForm(p => ({ ...p, date: e.target.value }))} style={{ fontSize: '13px' }} />
              <select className="input" value={todoForm.repeat}
                onChange={e => setTodoForm(p => ({ ...p, repeat: e.target.value }))} style={{ fontSize: '13px' }}>
                {REPEAT_OPTIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-secondary" onClick={() => setShowTodoForm(false)} style={{ flex: 1 }}>취소</button>
              <button className="btn-primary" onClick={saveTodo} disabled={!todoForm.text.trim()} style={{ flex: 2, justifyContent: 'center' }}>
                추가
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {pendingTodos.length === 0 && !showTodoForm ? (
            <div className="card-record" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
              <CheckSquare size={28} strokeWidth={1.5} style={{ margin: '0 auto 8px', display: 'block' }} />
              <p style={{ fontSize: 'var(--text-sm)' }}>오늘 할 일이 없어요</p>
            </div>
          ) : (
            pendingTodos.map(todo => (
              <button key={todo.id} onClick={() => toggleTodo(todo.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 14px', background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: '8px',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'background 0.15s', fontFamily: 'var(--font-sans)',
                }}
              >
                <div style={{
                  width: '18px', height: '18px', borderRadius: '4px',
                  border: '1.5px solid var(--border)', background: 'transparent', flexShrink: 0,
                }} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', flex: 1 }}>{todo.text}</span>
                {todo.date && (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {todo.date.replace(/-/g, '.')}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── 미해결 이슈 알림 ── */}
      {activeIssues.length > 0 && !showIssueForm && (
        <div className="mb-5">
          <div className="section-header">
            <span className="section-title" style={{ color: 'var(--color-danger)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={18} strokeWidth={1.5} />
                미해결 이슈 {activeIssues.length}건
              </span>
            </span>
            <button className="btn-ghost" onClick={() => onNavigate('more')}>전체 보기</button>
          </div>
          {activeIssues.slice(0, 2).map(issue => (
            <div key={issue.id} className="card" style={{
              borderLeft: '3px solid var(--color-danger)', borderRadius: '0 8px 8px 0',
              padding: '14px 16px', marginBottom: '6px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{issue.title}</p>
                  <p style={{ fontSize: 'var(--text-caption)', color: 'var(--text-muted)', marginTop: '3px' }}>작물: {issue.crop}</p>
                </div>
                <span className="badge badge-danger">
                  {issue.severity === 'high' ? '높음' : issue.severity === 'mid' ? '보통' : '낮음'}
                </span>
              </div>
            </div>
          ))}
          {activeIssues.length > 2 && (
            <button className="btn-ghost" onClick={() => onNavigate('more')} style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              +{activeIssues.length - 2}건 더 보기
            </button>
          )}
        </div>
      )}

      {/* ── 이슈 등록 인라인 폼 ── */}
      {showIssueForm && (
        <div className="mb-5">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span className="section-title" style={{ color: 'var(--color-danger)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} strokeWidth={1.5} /> 이슈 등록
              </span>
            </span>
            <button onClick={resetIssueForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>

          {!savedIssue && (
            <div className="card" style={{ borderLeft: '3px solid var(--color-danger)', borderRadius: '0 8px 8px 0', padding: '18px 20px', marginBottom: '12px' }}>
              <div style={{ marginBottom: '10px' }}>
                <label className="label">이슈 제목 *</label>
                <input className="input" placeholder="예: 고추 잎 황변, 진딧물 발생"
                  value={issueForm.title}
                  onChange={e => setIssueForm(p => ({ ...p, title: e.target.value }))}
                  style={{ fontSize: '14px' }} autoFocus />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label className="label">증상 설명</label>
                <textarea className="input" placeholder="언제부터, 어느 부위, 어떤 증상인지 자세히 적을수록 좋아요"
                  value={issueForm.content}
                  onChange={e => setIssueForm(p => ({ ...p, content: e.target.value }))}
                  rows={3} style={{ fontSize: '14px', lineHeight: 1.7, resize: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div>
                  <label className="label">심각도</label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {SEVERITY.map(s => (
                      <button key={s.value}
                        onClick={() => setIssueForm(p => ({ ...p, severity: s.value }))}
                        style={{
                          flex: 1, padding: '8px 4px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                          border: '1.5px solid', fontFamily: 'var(--font-sans)', cursor: 'pointer',
                          borderColor: issueForm.severity === s.value ? s.color : 'var(--border)',
                          background: issueForm.severity === s.value ? s.bg : 'transparent',
                          color: issueForm.severity === s.value ? s.color : 'var(--text-muted)',
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">관련 작물</label>
                  <select className="input" value={issueForm.crop}
                    onChange={e => setIssueForm(p => ({ ...p, crop: e.target.value }))} style={{ fontSize: '14px' }}>
                    {CROP_OPTIONS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={saveIssue} disabled={!issueForm.title.trim() || adviceLoading}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '14px' }}>
                <AlertTriangle size={15} strokeWidth={1.5} /> 이슈 등록 + AI 조언 받기
              </button>
            </div>
          )}

          {savedIssue && (
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 14px', borderRadius: '8px',
                background: 'var(--color-primary-light)', marginBottom: '12px',
              }}>
                <CheckSquare size={15} color="var(--color-primary)" strokeWidth={2} />
                <span style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600 }}>
                  이슈 등록 완료 — {savedIssue.title}
                </span>
              </div>

              <div className="card" style={{ padding: '18px 20px', borderLeft: '3px solid var(--color-earth)', borderRadius: '0 10px 10px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--color-earth-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '14px' }}>🤖</span>
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-earth)' }}>Gemini 자연농업 조언</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AI 기반 자연농업 해결법</p>
                    </div>
                  </div>
                  <button className="btn-ghost" onClick={resetIssueForm} style={{ fontSize: '12px' }}>닫기</button>
                </div>

                {adviceLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <RefreshCw size={24} color="var(--color-earth)" strokeWidth={1.5}
                      style={{ margin: '0 auto 10px', display: 'block', animation: 'spin 1s linear infinite' }} />
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>이슈를 분석하는 중...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                ) : issueAdvice ? (
                  <ResultView text={issueAdvice} />
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 빠른 기록 버튼 ── */}
      <div style={{
        background: 'var(--bg-dark)', borderRadius: '12px',
        padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px',
      }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', color: 'var(--text-light)', marginBottom: '4px' }}>
          오늘 농사 기록
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { icon: <Leaf          size={16} strokeWidth={1.5} />, label: '농사 일지',   action: () => onNavigate('record') },
            { icon: <Timer         size={16} strokeWidth={1.5} />, label: '작업 타이머', action: () => onNavigate('record') },
            { icon: <AlertTriangle size={16} strokeWidth={1.5} />, label: '이슈 등록',
              action: () => {
                setShowIssueForm(true);
                setShowTodoForm(false);
                setSavedIssue(null);
                setIssueAdvice(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              },
            },
            { icon: <Plus          size={16} strokeWidth={1.5} />, label: '할 일 추가',
              action: () => { setShowTodoForm(true); setShowIssueForm(false); },
            },
          ].map((item, i) => (
            <button key={i} onClick={item.action}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px', color: 'var(--text-light)',
                fontSize: 'var(--text-sm)', cursor: 'pointer',
                transition: 'background 0.15s', fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
