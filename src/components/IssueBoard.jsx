import { useState, useEffect } from 'react';
import { Plus, AlertTriangle, CheckCircle, Trash2, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { db, TABLES } from '../services/dbService';
import { ConfirmModal } from './ConfirmModal';
import { toast } from './Toast';

const SEVERITY = [
  { value: 'high',   label: '높음', color: 'var(--color-danger)', bg: '#FFF0F0' },
  { value: 'mid',    label: '보통', color: 'var(--color-terra)',  bg: '#FFF8F5' },
  { value: 'low',    label: '낮음', color: 'var(--color-info)',   bg: 'var(--color-earth-light)' },
];
const CROPS = ['고추', '토마토', '배추', '상추', '오이', '가지', '감자', '전체', '기타'];

const EMPTY_FORM = { title: '', content: '', severity: 'high', crop: '전체' };

export default function IssueBoard() {
  const [issues, setIssues] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all'); // all | open | solved
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [triedSubmit, setTriedSubmit] = useState(false);

  const load = async () => setIssues(await db.getList(TABLES.ISSUE));

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(false);
    setTriedSubmit(false);
  };

  const save = async () => {
    if (!form.title.trim()) {
      setTriedSubmit(true);
      return;
    }
    try {
      if (editingId) {
        await db.update(TABLES.ISSUE, editingId, form);
        toast.success('이슈가 수정되었어요');
      } else {
        await db.add(TABLES.ISSUE, { ...form, solved: false });
        toast.success('이슈가 등록되었어요');
      }
      await load();
      resetForm();
    } catch {
      toast.error('처리 중 오류가 발생했어요');
    }
  };

  const startEdit = (issue) => {
    setForm({
      title: issue.title || '',
      content: issue.content || '',
      severity: issue.severity || 'high',
      crop: issue.crop || '전체',
    });
    setEditingId(issue.id);
    setShowForm(true);
    setTriedSubmit(false);
  };

  const toggleSolved = async (id) => {
    try {
      const issue = issues.find(i => i.id === id);
      await db.update(TABLES.ISSUE, id, { solved: !issue?.solved, solvedAt: !issue?.solved ? new Date().toISOString() : null });
      await load();
    } catch {
      toast.error('처리 중 오류가 발생했어요');
    }
  };

  const del = async (id) => {
    try {
      await db.delete(TABLES.ISSUE, id);
      await load();
      toast.success('이슈가 삭제되었어요');
    } catch {
      toast.error('처리 중 오류가 발생했어요');
    }
  };

  const filtered = issues.filter(i => {
    if (filter === 'open') return !i.solved;
    if (filter === 'solved') return i.solved;
    return true;
  });

  const openCount = issues.filter(i => !i.solved).length;

  const getSev = (val) => SEVERITY.find(s => s.value === val) || SEVERITY[0];

  return (
    <div>
      <div className="section-header">
        <span className="section-title">
          이슈 관리
          {openCount > 0 && (
            <span className="badge badge-danger" style={{ marginLeft: '8px', fontSize: '10px' }}>
              미해결 {openCount}
            </span>
          )}
        </span>
        <button
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px' }}
          onClick={() => {
            if (showForm && !editingId) {
              resetForm();
            } else {
              resetForm();
              setShowForm(true);
            }
          }}
        >
          <Plus size={14} strokeWidth={2} /> 이슈 등록
        </button>
      </div>

      {showForm && (
        <div className="card mb-4" style={{ borderLeft: '3px solid var(--color-danger)', borderRadius: '0 8px 8px 0' }}>
          <div style={{ marginBottom: '10px' }}>
            <label className="label">이슈 제목 *</label>
            <input className="input" placeholder="예: 고추 탄저병 의심" value={form.title}
              onChange={e => { setForm(p => ({ ...p, title: e.target.value })); if (triedSubmit && e.target.value.trim()) setTriedSubmit(false); }}
              style={{ fontSize: '14px', borderColor: triedSubmit && !form.title.trim() ? 'var(--color-danger)' : undefined }} autoFocus />
            {triedSubmit && !form.title.trim() && (
              <p style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '4px', fontWeight: 500 }}>
                제목을 입력해주세요
              </p>
            )}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label className="label">내용</label>
            <textarea className="input" placeholder="증상, 발생 위치, 상황 설명..." value={form.content}
              onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={3}
              style={{ fontSize: '14px', lineHeight: 1.7, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label className="label">심각도</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {SEVERITY.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setForm(p => ({ ...p, severity: s.value }))}
                    style={{
                      flex: 1, padding: '8px 4px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                      border: '1.5px solid', fontFamily: 'var(--font-sans)', cursor: 'pointer', transition: 'all 0.15s',
                      borderColor: form.severity === s.value ? s.color : 'var(--border)',
                      background: form.severity === s.value ? s.bg : 'transparent',
                      color: form.severity === s.value ? s.color : 'var(--text-muted)',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">관련 작물</label>
              <select className="input" value={form.crop}
                onChange={e => setForm(p => ({ ...p, crop: e.target.value }))} style={{ fontSize: '14px' }}>
                {CROPS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={resetForm}>취소</button>
            <button className="btn-primary" onClick={save}>
              {editingId ? '수정' : '등록'}
            </button>
          </div>
        </div>
      )}

      {/* 필터 탭 */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
        {[
          { key: 'all', label: `전체 ${issues.length}` },
          { key: 'open', label: `미해결 ${openCount}` },
          { key: 'solved', label: `해결됨 ${issues.length - openCount}` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 500,
              border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
              background: filter === tab.key ? 'var(--text)' : 'transparent',
              color: filter === tab.key ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
          <AlertTriangle size={36} strokeWidth={1.5} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
          <p style={{ fontSize: '14px', fontWeight: 500 }}>
            {filter === 'open' ? '미해결 이슈가 없어요' : filter === 'solved' ? '해결된 이슈가 없어요' : '이슈가 없어요'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(issue => {
            const sev = getSev(issue.severity);
            const isExpanded = expandedId === issue.id;
            return (
              <div
                key={issue.id}
                className="card"
                style={{
                  padding: 0,
                  borderLeft: `3px solid ${issue.solved ? 'var(--border)' : sev.color}`,
                  borderRadius: '0 8px 8px 0',
                  opacity: issue.solved ? 0.65 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <button
                  type="button"
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    background: 'none', border: 'none', width: '100%', textAlign: 'left',
                    cursor: 'pointer', padding: '14px 16px', fontFamily: 'inherit',
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                  aria-expanded={isExpanded}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                      {!issue.solved && (
                        <span style={{
                          fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px',
                          background: sev.bg, color: sev.color,
                        }}>
                          {sev.label}
                        </span>
                      )}
                      {issue.solved && (
                        <span className="badge badge-good" style={{ fontSize: '10px' }}>해결됨</span>
                      )}
                      <span className="badge badge-info" style={{ fontSize: '10px' }}>{issue.crop}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {issue.createdAt?.slice(0, 10).replace(/-/g, '.')}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '14px', fontWeight: 600, color: 'var(--text)',
                      textDecoration: issue.solved ? 'line-through' : 'none',
                      margin: 0,
                    }}>
                      {issue.title}
                    </p>
                    {isExpanded && issue.content && (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.7, margin: '8px 0 0' }}>
                        {issue.content}
                      </p>
                    )}
                    {isExpanded && issue.solved && issue.solvedAt && (
                      <p style={{ fontSize: '11px', color: 'var(--color-good)', marginTop: '6px', margin: '6px 0 0' }}>
                        해결일: {issue.solvedAt.slice(0, 10).replace(/-/g, '.')}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px', flexShrink: 0 }}>
                    {isExpanded && (
                      <>
                        <span
                          role="button"
                          tabIndex={0}
                          className="btn-icon"
                          style={{ width: '28px', height: '28px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', cursor: 'pointer' }}
                          onClick={e => { e.stopPropagation(); startEdit(issue); }}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); startEdit(issue); } }}
                          title="수정"
                        >
                          <Pencil size={13} strokeWidth={1.5} />
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          className="btn-icon"
                          style={{ width: '28px', height: '28px', background: issue.solved ? 'var(--bg-subtle)' : 'var(--color-primary-light)', color: issue.solved ? 'var(--text-muted)' : 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', cursor: 'pointer' }}
                          onClick={e => { e.stopPropagation(); toggleSolved(issue.id); }}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); toggleSolved(issue.id); } }}
                          title={issue.solved ? '미해결로 되돌리기' : '해결됨으로 표시'}
                        >
                          <CheckCircle size={13} strokeWidth={1.5} />
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          className="btn-icon"
                          style={{ width: '28px', height: '28px', background: '#FFF0F0', color: 'var(--color-danger)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', cursor: 'pointer' }}
                          onClick={e => { e.stopPropagation(); setConfirmDelete(issue.id); }}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); setConfirmDelete(issue.id); } }}
                          title="삭제"
                        >
                          <Trash2 size={13} strokeWidth={1.5} />
                        </span>
                      </>
                    )}
                    {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          message="이 이슈를 삭제할까요?"
          onConfirm={() => {
            del(confirmDelete);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
