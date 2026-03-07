import { useState, useEffect, useMemo } from 'react';
import { Plus, CheckSquare, Trash2, RotateCcw, ChevronDown, ChevronUp, Pencil, Check, X } from 'lucide-react';
import { db, TABLES } from '../services/dbService';

const REPEAT_OPTIONS = ['없음', '매일', '매주', '월·수·금', '화·목'];

const todayYMD = new Date().toISOString().slice(0, 10);

const diffDays = (ymd) => {
  const t = new Date(todayYMD);
  const d = new Date(ymd);
  return Math.round((d - t) / 86400000);
};

const getGroup = (dateStr) => {
  if (!dateStr) return 'nodate';
  const diff = diffDays(dateStr);
  if (diff < 0)  return 'overdue';
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff <= 7)  return 'week';
  if (diff <= 30) return 'month';
  return 'later';
};

const GROUPS = [
  { key: 'overdue',  label: '기한 초과', color: 'var(--color-danger)',  urgent: true  },
  { key: 'today',    label: '오늘',      color: 'var(--color-primary)', urgent: false },
  { key: 'tomorrow', label: '내일',      color: 'var(--color-earth)',   urgent: false },
  { key: 'week',     label: '이번 주',   color: 'var(--color-info)',    urgent: false },
  { key: 'month',    label: '이번 달',   color: 'var(--text-muted)',    urgent: false },
  { key: 'later',    label: '나중에',    color: 'var(--text-muted)',    urgent: false },
  { key: 'nodate',   label: '날짜 없음', color: 'var(--text-muted)',    urgent: false },
];

const FILTERS = [
  { key: 'all',   label: '전체',    groups: ['overdue','today','tomorrow','week','month','later','nodate'] },
  { key: 'today', label: '오늘',    groups: ['overdue','today'] },
  { key: 'week',  label: '이번 주', groups: ['overdue','today','tomorrow','week'] },
];

function TodoCard({ todo, onToggle, onDelete, onSave }) {
  const isOverdue = todo.group === 'overdue';
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ text: todo.text, date: todo.date || '', repeat: todo.repeat || '없음' });

  const save = () => {
    if (!editForm.text.trim()) return;
    onSave(todo.id, editForm);
    setEditing(false);
  };

  const cancel = () => {
    setEditForm({ text: todo.text, date: todo.date || '', repeat: todo.repeat || '없음' });
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{
        padding: '12px 14px',
        background: 'var(--bg-card)',
        border: '1.5px solid var(--color-primary)',
        borderRadius: '8px',
      }}>
        <input
          className="input"
          value={editForm.text}
          onChange={e => setEditForm(p => ({ ...p, text: e.target.value }))}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
          autoFocus
          style={{ fontSize: '14px', marginBottom: '8px' }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
          <input type="date" className="input" value={editForm.date}
            onChange={e => setEditForm(p => ({ ...p, date: e.target.value }))} style={{ fontSize: '13px' }} />
          <select className="input" value={editForm.repeat}
            onChange={e => setEditForm(p => ({ ...p, repeat: e.target.value }))} style={{ fontSize: '13px' }}>
            {REPEAT_OPTIONS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <button onClick={cancel} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
            <X size={12} strokeWidth={2} /> 취소
          </button>
          <button onClick={save} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }} disabled={!editForm.text.trim()}>
            <Check size={12} strokeWidth={2} /> 저장
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '11px 14px',
      background: 'var(--bg-card)',
      border: `1px solid ${isOverdue ? 'rgba(192,57,43,0.2)' : 'var(--border)'}`,
      borderLeft: `3px solid ${isOverdue ? 'var(--color-danger)' : todo.group === 'today' ? 'var(--color-primary)' : 'var(--border-light)'}`,
      borderRadius: '0 8px 8px 0',
    }}>
      {/* 체크박스 */}
      <button
        onClick={() => onToggle(todo.id)}
        style={{
          width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0,
          border: `1.5px solid ${isOverdue ? 'var(--color-danger)' : 'var(--border)'}`,
          background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-primary-light)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = isOverdue ? 'var(--color-danger)' : 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
      />

      {/* 내용 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.4, wordBreak: 'break-all' }}>
          {todo.text}
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '3px', flexWrap: 'wrap' }}>
          {todo.date && (
            <span style={{
              fontSize: '11px',
              color: isOverdue ? 'var(--color-danger)' : 'var(--text-muted)',
              fontWeight: isOverdue ? 600 : 400,
            }}>
              {isOverdue && '⚠ '}{todo.date.replace(/-/g, '.')}
            </span>
          )}
          {todo.repeat !== '없음' && (
            <span style={{ fontSize: '11px', color: 'var(--color-info)', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <RotateCcw size={9} strokeWidth={2} />
              {todo.repeat}
            </span>
          )}
        </div>
      </div>

      {/* 수정 / 삭제 */}
      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
        <button
          className="btn-icon"
          style={{ width: '28px', height: '28px', background: 'transparent', color: 'var(--text-muted)' }}
          onClick={() => setEditing(true)}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary-light)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <Pencil size={12} strokeWidth={1.5} />
        </button>
        <button
          className="btn-icon"
          style={{ width: '28px', height: '28px', background: 'transparent', color: 'var(--text-muted)' }}
          onClick={() => onDelete(todo.id)}
          onMouseEnter={e => { e.currentTarget.style.background = '#FFF0F0'; e.currentTarget.style.color = 'var(--color-danger)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <Trash2 size={13} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [showDone, setShowDone] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ text: '', date: '', repeat: '없음' });
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [filter, setFilter] = useState('all');

  const load = async () => setTodos(await db.getList(TABLES.TODO));
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.text.trim()) return;
    await db.add(TABLES.TODO, { ...form, done: false });
    await load();
    setForm({ text: '', date: '', repeat: '없음' });
    setShowForm(false);
  };

  const toggle = async (id) => {
    await db.update(TABLES.TODO, id, { done: !todos.find(t => t.id === id)?.done });
    await load();
  };

  const del = async (id) => { await db.delete(TABLES.TODO, id); await load(); };

  const save = async (id, fields) => {
    await db.update(TABLES.TODO, id, fields);
    await load();
  };

  const toggleCollapse = (key) => setCollapsedGroups(p => ({ ...p, [key]: !p[key] }));

  const grouped = useMemo(() => {
    const pending = todos.filter(t => !t.done).map(t => ({ ...t, group: getGroup(t.date) }));
    const result = {};
    GROUPS.forEach(g => { result[g.key] = []; });
    pending.forEach(t => result[t.group]?.push(t));
    ['overdue', 'today', 'tomorrow', 'week', 'month', 'later'].forEach(key => {
      result[key].sort((a, b) => a.date.localeCompare(b.date));
    });
    return result;
  }, [todos]);

  const done = todos.filter(t => t.done);
  const pendingCount = todos.filter(t => !t.done).length;
  const activeFilter = FILTERS.find(f => f.key === filter);
  const visibleGroups = GROUPS.filter(g => activeFilter.groups.includes(g.key));

  return (
    <div>
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="section-title">할 일</span>
          {pendingCount > 0 && (
            <span style={{
              fontSize: '11px', fontWeight: 700, padding: '2px 8px',
              borderRadius: '100px', background: 'var(--color-primary-light)', color: 'var(--color-primary)',
            }}>
              {pendingCount}
            </span>
          )}
        </div>
        <button
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px' }}
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={14} strokeWidth={2} /> 추가
        </button>
      </div>

      {/* 필터 탭 */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 600,
              border: '1.5px solid', cursor: 'pointer', fontFamily: 'var(--font-sans)',
              transition: 'all 0.15s',
              borderColor: filter === f.key ? 'var(--color-primary)' : 'var(--border)',
              background: filter === f.key ? 'var(--color-primary)' : 'var(--bg-card)',
              color: filter === f.key ? '#fff' : 'var(--text-muted)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 추가 폼 */}
      {showForm && (
        <div className="card mb-4" style={{ borderLeft: '3px solid var(--color-primary)', borderRadius: '0 8px 8px 0' }}>
          <div style={{ marginBottom: '10px' }}>
            <label className="label">할 일 *</label>
            <input
              className="input"
              placeholder="할 일을 입력해요"
              value={form.text}
              onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && add()}
              autoFocus
              style={{ fontSize: '14px' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label className="label">날짜 (선택)</label>
              <input type="date" className="input" value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={{ fontSize: '14px' }} />
            </div>
            <div>
              <label className="label">반복</label>
              <select className="input" value={form.repeat}
                onChange={e => setForm(p => ({ ...p, repeat: e.target.value }))} style={{ fontSize: '14px' }}>
                {REPEAT_OPTIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>취소</button>
            <button className="btn-primary" onClick={add} disabled={!form.text.trim()}>추가</button>
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {pendingCount === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
          <CheckSquare size={36} strokeWidth={1.5} style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontSize: '14px', fontWeight: 500 }}>할 일이 없어요</p>
          <p style={{ fontSize: '12px', marginTop: '6px', lineHeight: 1.8 }}>오늘 밭에서 해야 할 일을 추가해보세요</p>
        </div>
      )}

      {/* 그룹별 목록 */}
      {visibleGroups.map(g => {
        const items = grouped[g.key] || [];
        if (items.length === 0) return null;
        const isCollapsed = collapsedGroups[g.key];

        return (
          <div key={g.key} style={{ marginBottom: '20px' }}>
            <button
              onClick={() => toggleCollapse(g.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                width: '100%', background: 'none', border: 'none',
                cursor: 'pointer', padding: '0 0 8px 0', textAlign: 'left',
              }}
            >
              {g.urgent && (
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: g.color, flexShrink: 0,
                  animation: 'todoPulse 1.5s ease-in-out infinite',
                }} />
              )}
              <span style={{ fontSize: '11px', fontWeight: 700, color: g.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {g.label}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>· {items.length}건</span>
              <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', display: 'flex' }}>
                {isCollapsed ? <ChevronDown size={14} strokeWidth={1.5} /> : <ChevronUp size={14} strokeWidth={1.5} />}
              </div>
            </button>

            {!isCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {items.map(todo => (
                  <TodoCard key={todo.id} todo={todo} onToggle={toggle} onDelete={del} onSave={save} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* 완료된 항목 */}
      {done.length > 0 && (
        <div style={{ marginTop: '8px', paddingTop: pendingCount > 0 ? '8px' : 0, borderTop: pendingCount > 0 ? '1px solid var(--border-light)' : 'none' }}>
          <button
            onClick={() => setShowDone(!showDone)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)',
              padding: '4px 0', marginBottom: showDone ? '10px' : 0,
            }}
          >
            {showDone ? <ChevronUp size={13} strokeWidth={1.5} /> : <ChevronDown size={13} strokeWidth={1.5} />}
            완료된 항목 {done.length}개
          </button>
          {showDone && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {done.map(todo => (
                <div key={todo.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-light)', borderRadius: '8px', opacity: 0.6,
                }}>
                  <button
                    onClick={() => toggle(todo.id)}
                    style={{
                      width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0,
                      border: '1.5px solid var(--color-primary)', background: 'var(--color-primary)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <span style={{ flex: 1, fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'line-through', wordBreak: 'break-all' }}>
                    {todo.text}
                  </span>
                  {todo.date && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
                      {todo.date.slice(5).replace('-', '/')}
                    </span>
                  )}
                  <button
                    className="btn-icon"
                    style={{ width: '26px', height: '26px', background: 'transparent', flexShrink: 0 }}
                    onClick={() => del(todo.id)}
                  >
                    <Trash2 size={12} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes todoPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
