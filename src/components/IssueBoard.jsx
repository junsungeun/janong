import { useState, useEffect } from 'react';
import { Plus, AlertTriangle, CheckCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { db, TABLES } from '../services/dbService';

const SEVERITY = [
  { value: 'high',   label: '높음', color: 'var(--color-danger)', bg: '#FFF0F0' },
  { value: 'mid',    label: '보통', color: 'var(--color-terra)',  bg: '#FFF8F5' },
  { value: 'low',    label: '낮음', color: 'var(--color-info)',   bg: 'var(--color-earth-light)' },
];
const CROPS = ['고추', '토마토', '배추', '상추', '오이', '가지', '감자', '전체', '기타'];

export default function IssueBoard() {
  const [issues, setIssues] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all'); // all | open | solved
  const [form, setForm] = useState({ title: '', content: '', severity: 'high', crop: '전체' });

  const load = async () => setIssues(await db.getList(TABLES.ISSUE));

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title.trim()) return;
    await db.add(TABLES.ISSUE, { ...form, solved: false });
    await load();
    setForm({ title: '', content: '', severity: 'high', crop: '전체' });
    setShowForm(false);
  };

  const toggleSolved = async (id) => {
    const issue = issues.find(i => i.id === id);
    await db.update(TABLES.ISSUE, id, { solved: !issue?.solved, solvedAt: !issue?.solved ? new Date().toISOString() : null });
    await load();
  };

  const del = async (id) => { await db.delete(TABLES.ISSUE, id); await load(); };

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
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={14} strokeWidth={2} /> 이슈 등록
        </button>
      </div>

      {showForm && (
        <div className="card mb-4" style={{ borderLeft: '3px solid var(--color-danger)', borderRadius: '0 8px 8px 0' }}>
          <div style={{ marginBottom: '10px' }}>
            <label className="label">이슈 제목 *</label>
            <input className="input" placeholder="예: 고추 탄저병 의심" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={{ fontSize: '14px' }} autoFocus />
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
            <button className="btn-secondary" onClick={() => setShowForm(false)}>취소</button>
            <button className="btn-primary" onClick={save} disabled={!form.title.trim()}>등록</button>
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
                  padding: '14px 16px',
                  borderLeft: `3px solid ${issue.solved ? 'var(--border)' : sev.color}`,
                  borderRadius: '0 8px 8px 0',
                  opacity: issue.solved ? 0.65 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', alignItems: 'flex-start' }}
                  onClick={() => setExpandedId(isExpanded ? null : issue.id)}
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
                    }}>
                      {issue.title}
                    </p>
                    {isExpanded && issue.content && (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.7 }}>
                        {issue.content}
                      </p>
                    )}
                    {isExpanded && issue.solved && issue.solvedAt && (
                      <p style={{ fontSize: '11px', color: 'var(--color-good)', marginTop: '6px' }}>
                        해결일: {issue.solvedAt.slice(0, 10).replace(/-/g, '.')}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px', flexShrink: 0 }}>
                    {isExpanded && (
                      <>
                        <button
                          className="btn-icon"
                          style={{ width: '28px', height: '28px', background: issue.solved ? 'var(--bg-subtle)' : 'var(--color-primary-light)', color: issue.solved ? 'var(--text-muted)' : 'var(--color-primary)' }}
                          onClick={e => { e.stopPropagation(); toggleSolved(issue.id); }}
                          title={issue.solved ? '미해결로 되돌리기' : '해결됨으로 표시'}
                        >
                          <CheckCircle size={13} strokeWidth={1.5} />
                        </button>
                        <button className="btn-icon" style={{ width: '28px', height: '28px', background: '#FFF0F0', color: 'var(--color-danger)' }}
                          onClick={e => { e.stopPropagation(); del(issue.id); }}>
                          <Trash2 size={13} strokeWidth={1.5} />
                        </button>
                      </>
                    )}
                    {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
