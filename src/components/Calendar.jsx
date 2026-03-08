import { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Plus, X, CalendarDays, Sprout, AlertTriangle, CheckCircle,
} from 'lucide-react';
import { db, TABLES } from '../services/dbService';
import { getCropTimeline } from '../data/cropTimelines';
import { ConfirmModal } from './ConfirmModal';
import { SwipeableRow } from './SwipeableRow';
import { toast } from './Toast';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const TYPE_COLOR = {
  timeline: 'var(--color-primary)',
  calendar: 'var(--color-earth)',
  issue:    'var(--color-danger)',
  todo:     'var(--color-info)',
};

const toYMD = (d) => d.toISOString().slice(0, 10);
const todayYMD  = toYMD(new Date());
const tomorrowYMD = toYMD(new Date(Date.now() + 86400000));

const diffDays = (ymd) => {
  const t = new Date(todayYMD);
  const d = new Date(ymd);
  return Math.round((d - t) / 86400000);
};

const getGroup = (dateStr) => {
  if (!dateStr) return null;
  const diff = diffDays(dateStr);
  if (diff < 0)  return 'overdue';
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff <= 7)  return 'week';
  if (diff <= 30) return 'month';
  return 'later';
};

const GROUPS = [
  { key: 'overdue',  label: '기한 초과', color: 'var(--color-danger)', urgent: true  },
  { key: 'today',    label: '오늘',      color: 'var(--color-primary)',urgent: false },
  { key: 'tomorrow', label: '내일',      color: 'var(--color-earth)',  urgent: false },
  { key: 'week',     label: '이번 주',   color: 'var(--color-info)',   urgent: false },
  { key: 'month',    label: '이번 달',   color: 'var(--text-muted)',   urgent: false },
  { key: 'later',    label: '나중에',    color: 'var(--text-muted)',   urgent: false },
];

const buildGrid = (year, month) => {
  const first   = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const cells   = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  for (let d = 1; d <= lastDay; d++) cells.push(d);
  return cells;
};

// ── 항목 카드 ──────────────────────────────────────────────────────────
function AgendaItem({ ev, showDate, onToggle }) {
  const color = TYPE_COLOR[ev.type] || 'var(--border)';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '11px 14px',
      background: 'var(--bg-card)',
      borderLeft: `3px solid ${color}`,
      borderRadius: '0 8px 8px 0',
    }}>
      {/* 아이콘 / 체크박스 */}
      <div style={{ flexShrink: 0, width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {ev.type === 'todo' ? (
          <button
            onClick={() => onToggle?.(ev.id)}
            title="완료 체크"
            style={{
              width: '18px', height: '18px', borderRadius: '4px',
              border: `1.5px solid ${color}`, background: 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
              transition: 'all 0.15s', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.borderColor = color; e.currentTarget.style.opacity = '0.8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = '1'; }}
          >
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
              <path d="M1 3.5L3 5.5L8 1" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : ev.icon ? (
          <span style={{ fontSize: '13px' }}>{ev.icon}</span>
        ) : ev.type === 'timeline' ? (
          <Sprout size={13} color={color} strokeWidth={1.5} />
        ) : ev.type === 'calendar' ? (
          <CalendarDays size={13} color={color} strokeWidth={1.5} />
        ) : (
          <AlertTriangle size={13} color={color} strokeWidth={1.5} />
        )}
      </div>

      {/* 내용 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '13px', fontWeight: 500, color: 'var(--text)',
          lineHeight: 1.4, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        }}>
          {ev.title}
        </p>
        {ev.note && (
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{ev.note}</p>
        )}
      </div>

      {/* 날짜 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {showDate && ev.date && (
          <span style={{
            fontSize: '11px',
            color: ev.group === 'overdue' ? 'var(--color-danger)' : 'var(--text-muted)',
            fontWeight: ev.group === 'overdue' ? 600 : 400,
          }}>
            {ev.date.slice(5).replace('-', '/')}
          </span>
        )}
      </div>
    </div>
  );
}

// ── 활성 이슈 카드 ─────────────────────────────────────────────────────
function IssueItem({ issue }) {
  const sev = issue.severity === 'high' ? '높음' : issue.severity === 'mid' ? '보통' : '낮음';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '11px 14px', background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderLeft: '3px solid var(--color-danger)',
      borderRadius: '0 8px 8px 0',
    }}>
      <AlertTriangle size={14} color="var(--color-danger)" strokeWidth={1.5} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {issue.title}
        </p>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {issue.crop} · 심각도 {sev}
        </p>
      </div>
      <span style={{
        fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '100px',
        background: '#FFF0F0', color: 'var(--color-danger)',
      }}>
        미해결
      </span>
    </div>
  );
}

// ── 그룹 헤더 ─────────────────────────────────────────────────────────
function GroupHeader({ config, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      {config.urgent && (
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: config.color, flexShrink: 0,
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      )}
      <span style={{ fontSize: '11px', fontWeight: 700, color: config.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {config.label}
      </span>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>· {count}건</span>
    </div>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────────────
export default function Calendar() {
  const today = new Date();
  const [cur, setCur]             = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [showMiniCal, setShowMiniCal] = useState(false);
  const [selected, setSelected]   = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm]           = useState({ title: '', date: todayYMD, note: '' });
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [calEvents, setCalEvents] = useState([]);
  const [crops, setCrops]         = useState([]);
  const [issues, setIssues]       = useState([]);
  const [todos, setTodos]         = useState([]);
  const [showOverdue, setShowOverdue] = useState(true);

  const loadAll = async () => {
    const [cal, c, iss, td] = await Promise.all([
      db.getList(TABLES.CALENDAR),
      db.getList(TABLES.CROP),
      db.getList(TABLES.ISSUE),
      db.getList(TABLES.TODO),
    ]);
    setCalEvents(cal);
    setCrops(c);
    setIssues(iss);
    setTodos(td);
  };

  useEffect(() => { loadAll(); }, []);

  // ── 전체 어젠다 항목 ────────────────────────────────────────────────
  const allItems = useMemo(() => {
    const items = [];

    crops.forEach(crop => {
      getCropTimeline(crop.name, crop.plantingDate).forEach(item => {
        const group = getGroup(item.date);
        if (!group) return;
        items.push({ type: 'timeline', title: `[${crop.name}] ${item.label}`, note: item.note, icon: item.icon, date: item.date, group });
      });
    });

    calEvents.forEach(ev => {
      const group = getGroup(ev.date);
      if (!group) return;
      items.push({ type: 'calendar', title: ev.title, note: ev.note, date: ev.date, id: ev.id, group });
    });

    todos.filter(t => !t.done && t.date).forEach(t => {
      const group = getGroup(t.date);
      if (!group) return;
      items.push({ type: 'todo', title: t.text, date: t.date, id: t.id, group });
    });

    return items;
  }, [calEvents, crops, todos]);

  const activeIssues = useMemo(() => issues.filter(i => !i.solved), [issues]);

  // ── 날짜별 이벤트 맵 (미니 캘린더 도트용) ──────────────────────────
  const eventsByDate = useMemo(() => {
    const map = {};
    allItems.forEach(item => {
      if (!map[item.date]) map[item.date] = [];
      map[item.date].push(item);
    });
    return map;
  }, [allItems]);

  // ── 그룹별 정렬 ────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const result = {};
    GROUPS.forEach(g => { result[g.key] = []; });
    allItems.forEach(item => { result[item.group]?.push(item); });
    Object.values(result).forEach(arr => arr.sort((a, b) => (a.date || '').localeCompare(b.date || '')));
    return result;
  }, [allItems]);

  const selItems = selected ? (eventsByDate[selected] || []) : [];

  // ── CRUD ────────────────────────────────────────────────────────────
  const resetForm = () => {
    setForm({ title: '', date: todayYMD, note: '' });
    setEditingId(null);
    setShowAddForm(false);
  };

  const saveEvent = async () => {
    if (!form.title.trim() || !form.date) return;
    try {
      if (editingId) {
        await db.update(TABLES.CALENDAR, editingId, form);
        toast.success('일정이 수정되었어요');
      } else {
        await db.add(TABLES.CALENDAR, form);
        toast.success('일정이 등록되었어요');
      }
      await loadAll();
      resetForm();
    } catch {
      toast.error('처리 중 오류가 발생했어요');
    }
  };

  const startEdit = (ev) => {
    setEditingId(ev.id);
    setForm({ title: ev.title, date: ev.date, note: ev.note || '' });
    setShowAddForm(true);
    setSelected(null);
  };

  const requestDelete = (id) => {
    setConfirmDelete(id);
  };

  const confirmDeleteEvent = async () => {
    if (!confirmDelete) return;
    try {
      await db.delete(TABLES.CALENDAR, confirmDelete);
      toast.success('일정이 삭제되었어요');
      await loadAll();
    } catch {
      toast.error('처리 중 오류가 발생했어요');
    }
    setConfirmDelete(null);
  };

  const toggleTodo = async (id) => {
    const t = todos.find(t => t.id === id);
    if (!t) return;
    try {
      await db.update(TABLES.TODO, id, { done: !t.done });
      await loadAll();
    } catch {
      toast.error('처리 중 오류가 발생했어요');
    }
  };

  const cells = buildGrid(cur.year, cur.month);
  const hasAny = allItems.length > 0 || activeIssues.length > 0;

  // ── 항목 렌더 헬퍼: calendar 타입은 SwipeableRow로 감싸기 ──
  const renderAgendaItem = (ev, i, { showDate = false } = {}) => {
    if (ev.type === 'calendar' && ev.id) {
      return (
        <SwipeableRow
          key={`${ev.id}-${i}`}
          onEdit={() => startEdit(ev)}
          onDelete={() => requestDelete(ev.id)}
        >
          <AgendaItem ev={ev} showDate={showDate} onToggle={toggleTodo} />
        </SwipeableRow>
      );
    }
    return (
      <AgendaItem key={i} ev={ev} showDate={showDate} onToggle={toggleTodo} />
    );
  };

  return (
    <div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>

      {/* ── 삭제 확인 모달 ── */}
      {confirmDelete && (
        <ConfirmModal
          message="이 일정을 삭제할까요?"
          onConfirm={confirmDeleteEvent}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* ── 상단 컨트롤 바 ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button
          onClick={() => setShowMiniCal(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: showMiniCal ? 'var(--color-primary-light)' : 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px', padding: '8px 14px',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            color: showMiniCal ? 'var(--color-primary)' : 'var(--text)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <CalendarDays size={14} strokeWidth={1.5} />
          {cur.year}년 {cur.month + 1}월
          {showMiniCal ? <ChevronUp size={13} strokeWidth={2} /> : <ChevronDown size={13} strokeWidth={2} />}
        </button>

        <button
          className="btn-primary"
          style={{ padding: '8px 14px', fontSize: '12px' }}
          onClick={() => { resetForm(); setShowAddForm(v => !v); setSelected(null); }}
        >
          <Plus size={13} strokeWidth={2} /> 일정 추가
        </button>
      </div>

      {/* ── 미니 캘린더 ── */}
      {showMiniCal && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '16px', marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <button onClick={() => setCur(p => { const d = new Date(p.year, p.month - 1); return { year: d.getFullYear(), month: d.getMonth() }; })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex' }}>
              <ChevronLeft size={16} strokeWidth={1.5} />
            </button>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-serif)' }}>
              {cur.month + 1}월
            </span>
            <button onClick={() => setCur(p => { const d = new Date(p.year, p.month + 1); return { year: d.getFullYear(), month: d.getMonth() }; })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex' }}>
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '4px' }}>
            {WEEKDAYS.map((d, i) => (
              <div key={d} style={{
                textAlign: 'center', fontSize: '10px', fontWeight: 600, padding: '3px 0',
                color: i === 0 ? 'var(--color-danger)' : i === 6 ? 'var(--color-info)' : 'var(--text-muted)',
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const ymd = toYMD(new Date(cur.year, cur.month, day));
              const isToday = ymd === todayYMD;
              const isSel   = ymd === selected;
              const colIdx  = i % 7;
              const dotTypes = [...new Set((eventsByDate[ymd] || []).map(e => e.type))];

              return (
                <button key={ymd} onClick={() => setSelected(isSel ? null : ymd)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '5px 2px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    background: isSel ? 'var(--color-primary)' : isToday ? 'var(--color-primary-light)' : 'transparent',
                    minHeight: '40px',
                  }}
                >
                  <span style={{
                    fontSize: '12px', fontWeight: isToday || isSel ? 700 : 400, lineHeight: 1, marginBottom: '4px',
                    color: isSel ? '#fff' : isToday ? 'var(--color-primary)'
                      : colIdx === 0 ? 'var(--color-danger)' : colIdx === 6 ? 'var(--color-info)' : 'var(--text)',
                  }}>
                    {day}
                  </span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {dotTypes.map((type, j) => (
                      <div key={j} style={{
                        width: '4px', height: '4px', borderRadius: '50%',
                        background: isSel ? 'rgba(255,255,255,0.8)' : TYPE_COLOR[type] || 'var(--border)',
                      }} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 선택된 날짜 상세 ── */}
      {selected && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '16px', marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                {selected.replace(/-/g, '.')}
              </p>
              {selected === todayYMD && <span className="badge badge-good" style={{ fontSize: '10px' }}>오늘</span>}
              {selected === tomorrowYMD && <span style={{ fontSize: '11px', color: 'var(--color-earth)', fontWeight: 600 }}>내일</span>}
            </div>
            <button onClick={() => setSelected(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {selItems.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              이날 등록된 항목이 없어요
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {selItems.map((ev, i) => renderAgendaItem(ev, i))}
            </div>
          )}
        </div>
      )}

      {/* ── 일정 추가/수정 폼 ── */}
      {showAddForm && (
        <div className="card mb-4" style={{ padding: '16px', borderLeft: '3px solid var(--color-earth)', borderRadius: '0 8px 8px 0' }}>
          <div style={{ marginBottom: '10px' }}>
            <label className="label">일정 제목 *</label>
            <input className="input" placeholder="일정을 입력해요" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && saveEvent()} autoFocus style={{ fontSize: '14px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label className="label">날짜</label>
              <input type="date" className="input" value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={{ fontSize: '13px' }} />
            </div>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label className="label">메모</label>
            <input className="input" placeholder="메모" value={form.note}
              onChange={e => setForm(p => ({ ...p, note: e.target.value }))} style={{ fontSize: '14px' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={resetForm}>취소</button>
            <button className="btn-primary" onClick={saveEvent} disabled={!form.title.trim()}>
              {editingId ? '수정' : '등록'}
            </button>
          </div>
        </div>
      )}

      {/* ── 어젠다 뷰 ── */}
      {GROUPS.map(g => {
        const items = grouped[g.key] || [];
        if (items.length === 0) return null;
        const isOverdue = g.key === 'overdue';
        return (
          <div key={g.key} style={{ marginBottom: '20px' }}>
            {isOverdue ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <GroupHeader config={g} count={items.length} />
                <button
                  onClick={() => setShowOverdue(v => !v)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)',
                    display: 'flex', alignItems: 'center', gap: '3px',
                    padding: '2px 6px',
                  }}
                >
                  {showOverdue ? <ChevronUp size={13} strokeWidth={1.5} /> : <ChevronDown size={13} strokeWidth={1.5} />}
                  {showOverdue ? '숨기기' : '보이기'}
                </button>
              </div>
            ) : (
              <GroupHeader config={g} count={items.length} />
            )}
            {(!isOverdue || showOverdue) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {items.map((ev, i) => renderAgendaItem(ev, i, { showDate: true }))}
              </div>
            )}
          </div>
        );
      })}

      {/* ── 활성 이슈 ── */}
      {activeIssues.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--color-danger)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-danger)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              활성 이슈
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>· {activeIssues.length}건</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {activeIssues.map(issue => <IssueItem key={issue.id} issue={issue} />)}
          </div>
        </div>
      )}

      {/* ── 빈 상태 ── */}
      {!hasAny && !showAddForm && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <CalendarDays size={40} strokeWidth={1.5} style={{ margin: '0 auto 14px', display: 'block', opacity: 0.25 }} />
          <p style={{ fontSize: '14px', fontWeight: 600 }}>예정된 항목이 없어요</p>
          <p style={{ fontSize: '12px', marginTop: '6px', opacity: 0.7 }}>할 일, 작물 타임라인, 일정을 등록해 보세요</p>
        </div>
      )}
    </div>
  );
}
