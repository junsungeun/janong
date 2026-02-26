import { useState, useEffect } from 'react';
import { Plus, CheckSquare, Trash2, RotateCcw } from 'lucide-react';
import { storage, KEYS } from '../utils/storage';

const REPEAT_OPTIONS = ['없음', '매일', '매주', '월·수·금', '화·목'];

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [showDone, setShowDone] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ text: '', date: '', repeat: '없음' });

  useEffect(() => { setTodos(storage.getList(KEYS.TODO)); }, []);

  const add = () => {
    if (!form.text.trim()) return;
    storage.addItem(KEYS.TODO, { ...form, done: false });
    setTodos(storage.getList(KEYS.TODO));
    setForm({ text: '', date: '', repeat: '없음' });
    setShowForm(false);
  };

  const toggle = (id) => {
    storage.updateItem(KEYS.TODO, id, { done: !todos.find(t => t.id === id)?.done });
    setTodos(storage.getList(KEYS.TODO));
  };

  const del = (id) => { storage.deleteItem(KEYS.TODO, id); setTodos(storage.getList(KEYS.TODO)); };

  const pending = todos.filter(t => !t.done);
  const done = todos.filter(t => t.done);

  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date(new Date().toISOString().slice(0, 10));
  };

  return (
    <div>
      <div className="section-header">
        <span className="section-title">할 일</span>
        <button
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px' }}
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={14} strokeWidth={2} /> 추가
        </button>
      </div>

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

      {/* 미완료 */}
      {pending.length === 0 && !showForm ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
          <CheckSquare size={36} strokeWidth={1.5} style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontSize: '14px', fontWeight: 500 }}>할 일이 없어요</p>
          <p style={{ fontSize: '12px', marginTop: '6px', lineHeight: 1.8 }}>오늘 밭에서 해야 할 일을 추가해보세요</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
          {pending.map(todo => (
            <div
              key={todo.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 14px',
                background: 'var(--bg-card)',
                border: `1px solid ${isOverdue(todo.date) ? 'rgba(192,57,43,0.25)' : 'var(--border)'}`,
                borderRadius: '8px',
              }}
            >
              <button
                onClick={() => toggle(todo.id)}
                style={{
                  width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0,
                  border: '1.5px solid var(--border)', background: 'transparent', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-primary-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.4 }}>{todo.text}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '3px' }}>
                  {todo.date && (
                    <span style={{ fontSize: '11px', color: isOverdue(todo.date) ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                      {isOverdue(todo.date) ? '⚠ ' : ''}{todo.date.replace(/-/g, '.')}
                    </span>
                  )}
                  {todo.repeat !== '없음' && (
                    <span style={{ fontSize: '11px', color: 'var(--color-info)' }}>
                      <RotateCcw size={10} style={{ verticalAlign: 'middle', marginRight: '2px' }} />{todo.repeat}
                    </span>
                  )}
                </div>
              </div>
              <button
                className="btn-icon"
                style={{ width: '28px', height: '28px', background: '#FFF0F0', color: 'var(--color-danger)', flexShrink: 0 }}
                onClick={() => del(todo.id)}
              >
                <Trash2 size={13} strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 완료 */}
      {done.length > 0 && (
        <div>
          <button
            className="btn-ghost"
            onClick={() => setShowDone(!showDone)}
            style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}
          >
            완료된 항목 {done.length}개 {showDone ? '숨기기' : '보기'}
          </button>
          {showDone && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {done.map(todo => (
                <div
                  key={todo.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px', background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-light)', borderRadius: '8px', opacity: 0.7,
                  }}
                >
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
                  <span style={{ flex: 1, fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    {todo.text}
                  </span>
                  <button className="btn-icon" style={{ width: '26px', height: '26px', background: 'transparent', flexShrink: 0 }}
                    onClick={() => del(todo.id)}>
                    <Trash2 size={12} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
