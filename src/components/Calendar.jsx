import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, CalendarDays, Sprout, AlertTriangle, CheckCircle } from 'lucide-react';
import { storage, KEYS } from '../utils/storage';
import { getCropTimeline } from '../data/cropTimelines';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 이벤트 타입별 색상
const TYPE_COLOR = {
  timeline: 'var(--color-primary)',   // 초록 — 작물 타임라인
  calendar: 'var(--color-earth)',     // 황토 — 직접 등록
  issue:    'var(--color-danger)',    // 빨강 — 미해결 이슈
  solved:   'var(--border)',          // 회색 — 해결된 이슈
  todo:     'var(--color-info)',      // 파랑 — 할 일
};

const TYPE_LABEL = {
  timeline: '타임라인',
  calendar: '일정',
  issue:    '이슈',
  solved:   '해결됨',
  todo:     '할 일',
};

// YYYY-MM-DD 포맷 헬퍼
const toYMD = (d) => d.toISOString().slice(0, 10);
const todayYMD = toYMD(new Date());

// 월의 날짜 배열 생성 (null = 이전 달 빈 칸)
const buildGrid = (year, month) => {
  const first     = new Date(year, month, 1);
  const lastDay   = new Date(year, month + 1, 0).getDate();
  const startDow  = first.getDay(); // 0=일
  const cells     = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= lastDay; d++) cells.push(d);
  return cells;
};

export default function Calendar() {
  const today      = new Date();
  const [cur, setCur]         = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState(null);      // 'YYYY-MM-DD'
  const [showAddForm, setShowAddForm] = useState(false);
  const [calEvents, setCalEvents]     = useState([]);   // KEYS.CALENDAR
  const [form, setForm] = useState({ title: '', date: todayYMD, note: '' });

  // ── 캘린더 이벤트 로드 ──────────────────────────────────────────────
  const loadCalEvents = () => setCalEvents(storage.getList(KEYS.CALENDAR));
  useEffect(() => { loadCalEvents(); }, []);

  // ── 전체 이벤트 집계 (날짜 → 이벤트 배열) ─────────────────────────
  const eventsByDate = useMemo(() => {
    const map = {};

    const push = (dateStr, ev) => {
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(ev);
    };

    // 1) 작물 타임라인
    const crops = storage.getList(KEYS.CROP);
    crops.forEach(crop => {
      const items = getCropTimeline(crop.name, crop.plantingDate);
      items.forEach(item => {
        push(item.date, {
          type:  'timeline',
          title: `[${crop.name}${crop.area ? ' ' + crop.area : ''}] ${item.label}`,
          note:  item.note,
          icon:  item.icon,
        });
      });
    });

    // 2) 직접 등록 일정
    calEvents.forEach(ev => {
      push(ev.date, { type: 'calendar', title: ev.title, note: ev.note, id: ev.id });
    });

    // 3) 이슈 (등록일 기준)
    const issues = storage.getList(KEYS.ISSUE);
    issues.forEach(issue => {
      const dateStr = issue.createdAt?.slice(0, 10);
      if (dateStr) {
        push(dateStr, {
          type:  issue.solved ? 'solved' : 'issue',
          title: issue.title,
          note:  `${issue.crop} · ${issue.solved ? '해결됨' : '미해결'}`,
          id:    issue.id,
        });
      }
    });

    // 4) 오늘 기한 할 일
    const todos = storage.getList(KEYS.TODO);
    todos.forEach(todo => {
      if (todo.date && !todo.done) {
        push(todo.date, { type: 'todo', title: todo.text, note: '할 일' });
      }
    });

    return map;
  }, [calEvents, cur]); // cur 변경 시 재계산

  // ── 일정 추가 ────────────────────────────────────────────────────────
  const addEvent = () => {
    if (!form.title.trim() || !form.date) return;
    storage.addItem(KEYS.CALENDAR, { ...form });
    loadCalEvents();
    setForm({ title: '', date: selected || todayYMD, note: '' });
    setShowAddForm(false);
  };

  // ── 일정 삭제 ────────────────────────────────────────────────────────
  const delEvent = (id) => {
    storage.deleteItem(KEYS.CALENDAR, id);
    loadCalEvents();
  };

  // ── 월 이동 ─────────────────────────────────────────────────────────
  const prevMonth = () => setCur(p => {
    const d = new Date(p.year, p.month - 1, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const nextMonth = () => setCur(p => {
    const d = new Date(p.year, p.month + 1, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const cells     = buildGrid(cur.year, cur.month);
  const selEvents = selected ? (eventsByDate[selected] || []) : [];

  return (
    <div>
      {/* ── 월 네비게이터 ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button
          onClick={prevMonth}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px' }}
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '18px', fontWeight: 600, color: 'var(--text)',
          }}>
            {cur.year}년 {cur.month + 1}월
          </p>
        </div>

        <button
          onClick={nextMonth}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px' }}
        >
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* ── 요일 헤더 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' }}>
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: 600,
              padding: '6px 0',
              color: i === 0 ? 'var(--color-danger)' : i === 6 ? 'var(--color-info)' : 'var(--text-muted)',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* ── 날짜 그리드 ── */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '20px' }}
      >
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;

          const ymd       = toYMD(new Date(cur.year, cur.month, day));
          const isToday   = ymd === todayYMD;
          const isSel     = ymd === selected;
          const dayEvents = eventsByDate[ymd] || [];
          const dow       = (i) % 7;
          const colIdx    = i % 7;

          // 도트 색 (최대 3개, 중복 색 제거)
          const dotColors = [...new Set(dayEvents.map(e => TYPE_COLOR[e.type]))].slice(0, 3);

          return (
            <button
              key={ymd}
              onClick={() => {
                setSelected(isSel ? null : ymd);
                setShowAddForm(false);
                setForm(p => ({ ...p, date: ymd }));
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '6px 2px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                background: isSel
                  ? 'var(--color-primary)'
                  : isToday
                    ? 'var(--color-primary-light)'
                    : 'transparent',
                transition: 'background 0.1s',
                minHeight: '52px',
              }}
            >
              <span style={{
                fontSize: '14px',
                fontWeight: isToday || isSel ? 700 : 400,
                color: isSel
                  ? '#fff'
                  : isToday
                    ? 'var(--color-primary)'
                    : colIdx === 0
                      ? 'var(--color-danger)'
                      : colIdx === 6
                        ? 'var(--color-info)'
                        : 'var(--text)',
                lineHeight: 1,
                marginBottom: '5px',
              }}>
                {day}
              </span>

              {/* 이벤트 도트 */}
              <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center', minHeight: '8px' }}>
                {dotColors.map((color, ci) => (
                  <div
                    key={ci}
                    style={{
                      width: '5px', height: '5px', borderRadius: '50%',
                      background: isSel ? 'rgba(255,255,255,0.8)' : color,
                    }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── 범례 ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '10px',
        marginBottom: '20px', paddingBottom: '16px',
        borderBottom: '1px solid var(--border-light)',
      }}>
        {Object.entries(TYPE_COLOR).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{TYPE_LABEL[type]}</span>
          </div>
        ))}
      </div>

      {/* ── 선택된 날짜 상세 ── */}
      {selected && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
              {selected.replace(/-/g, '.')}
              {selected === todayYMD && (
                <span className="badge badge-good" style={{ marginLeft: '8px', fontSize: '10px' }}>오늘</span>
              )}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn-primary"
                style={{ padding: '7px 14px', fontSize: '12px' }}
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <Plus size={13} strokeWidth={2} /> 일정 추가
              </button>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* 일정 추가 폼 */}
          {showAddForm && (
            <div className="card mb-4" style={{ padding: '16px', borderLeft: '3px solid var(--color-earth)', borderRadius: '0 8px 8px 0' }}>
              <div style={{ marginBottom: '10px' }}>
                <label className="label">일정 제목 *</label>
                <input
                  className="input"
                  placeholder="일정을 입력해요"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && addEvent()}
                  autoFocus
                  style={{ fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label className="label">날짜</label>
                <input
                  type="date"
                  className="input"
                  value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  style={{ fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label className="label">메모 (선택)</label>
                <input
                  className="input"
                  placeholder="메모"
                  value={form.note}
                  onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                  style={{ fontSize: '14px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={() => setShowAddForm(false)}>취소</button>
                <button className="btn-primary" onClick={addEvent} disabled={!form.title.trim()}>추가</button>
              </div>
            </div>
          )}

          {/* 이벤트 목록 */}
          {selEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-muted)' }}>
              <CalendarDays size={32} strokeWidth={1.5} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.35 }} />
              <p style={{ fontSize: '13px' }}>등록된 일정이 없어요</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selEvents.map((ev, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '13px 16px',
                    background: 'var(--bg-card)',
                    borderTop: '1px solid var(--border)',
                    borderRight: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                    borderLeft: `3px solid ${TYPE_COLOR[ev.type]}`,
                    borderRadius: '0 8px 8px 0',
                  }}
                >
                  {/* 아이콘 */}
                  <div style={{ flexShrink: 0, marginTop: '1px' }}>
                    {ev.type === 'timeline' && <Sprout       size={16} color={TYPE_COLOR.timeline} strokeWidth={1.5} />}
                    {ev.type === 'calendar' && <CalendarDays size={16} color={TYPE_COLOR.calendar} strokeWidth={1.5} />}
                    {ev.type === 'issue'    && <AlertTriangle size={16} color={TYPE_COLOR.issue}   strokeWidth={1.5} />}
                    {ev.type === 'solved'   && <CheckCircle  size={16} color={TYPE_COLOR.solved}   strokeWidth={1.5} />}
                    {ev.type === 'todo'     && (
                      <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: `1.5px solid ${TYPE_COLOR.todo}` }} />
                    )}
                    {ev.icon && <span style={{ fontSize: '16px' }}>{ev.icon}</span>}
                  </div>

                  {/* 내용 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span style={{
                        fontSize: '10px', fontWeight: 600, padding: '1px 7px', borderRadius: '100px',
                        background: `${TYPE_COLOR[ev.type]}22`,
                        color: TYPE_COLOR[ev.type],
                      }}>
                        {TYPE_LABEL[ev.type]}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>
                      {ev.title}
                    </p>
                    {ev.note && (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.7 }}>
                        {ev.note}
                      </p>
                    )}
                  </div>

                  {/* 캘린더 직접 등록 이벤트만 삭제 가능 */}
                  {ev.type === 'calendar' && ev.id && (
                    <button
                      onClick={() => delEvent(ev.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', flexShrink: 0,
                        display: 'flex', padding: '2px',
                      }}
                    >
                      <X size={15} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 선택 안됐을 때 이달 이벤트 요약 ── */}
      {!selected && (() => {
        const thisMonthEvents = Object.entries(eventsByDate)
          .filter(([date]) => date.startsWith(`${cur.year}-${String(cur.month + 1).padStart(2, '0')}`))
          .flatMap(([date, evs]) => evs.map(ev => ({ ...ev, date })))
          .sort((a, b) => a.date.localeCompare(b.date));

        if (thisMonthEvents.length === 0) return null;

        return (
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>
              {cur.month + 1}월 일정 목록
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {thisMonthEvents.slice(0, 10).map((ev, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(ev.date)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px', background: 'var(--bg-card)',
                    border: '1px solid var(--border)', borderRadius: '8px',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: TYPE_COLOR[ev.type], flexShrink: 0,
                  }} />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0, width: '48px' }}>
                    {ev.date.slice(5).replace('-', '.')}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text)', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {ev.icon ? `${ev.icon} ` : ''}{ev.title}
                  </span>
                </button>
              ))}
              {thisMonthEvents.length > 10 && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>
                  +{thisMonthEvents.length - 10}개 더 있어요 (날짜를 클릭해서 확인)
                </p>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
