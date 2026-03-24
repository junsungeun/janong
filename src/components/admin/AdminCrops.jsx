import { useState, useEffect, useMemo } from 'react';
import { db, TABLES } from '../../services/dbService';
import { Search, Pencil, Trash2 } from 'lucide-react';

const CATEGORIES = ['채소', '과일', '허브', '곡물', '화훼', '기타'];

export default function AdminCrops() {
  const [crops, setCrops] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const [c, p, l] = await Promise.all([
      db.getAllList(TABLES.CROP),
      db.getAllList(TABLES.PROFILE),
      db.getAllList(TABLES.DAILY_LOG),
    ]);
    setCrops(c); setProfiles(p); setLogs(l);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const profileMap = useMemo(() => Object.fromEntries(profiles.map((p) => [p.id, p])), [profiles]);
  const logCounts = useMemo(() => {
    const m = {};
    logs.forEach((l) => { m[l.cropId] = (m[l.cropId] || 0) + 1; });
    return m;
  }, [logs]);

  const filtered = crops.filter((c) => {
    const q = search.toLowerCase();
    return !q || (c.name || '').toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q);
  });

  const openEdit = (c) => {
    setForm({ name: c.name || '', variety: c.variety || '', category: c.category || '', plantingDate: c.plantingDate || '', section: c.section || '' });
    setError('');
    setModal({ type: 'edit', crop: c });
  };

  const openDelete = (c) => { setError(''); setModal({ type: 'delete', crop: c }); };

  const handleEdit = async () => {
    setSaving(true); setError('');
    try {
      await db.update(TABLES.CROP, modal.crop.id, form);
      setModal(null); load();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true); setError('');
    try {
      await db.delete(TABLES.CROP, modal.crop.id);
      setModal(null); load();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">작물 관리</h1>
        <span className="admin-page-count">{crops.length}종</span>
      </div>

      <div className="admin-search">
        <Search size={16} />
        <input className="admin-search-input" placeholder="작물명 또는 카테고리 검색..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? <p className="admin-loading">로딩 중...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>작물명</th><th>품종</th><th>카테고리</th><th>등록자</th><th>조</th><th>기록</th><th>관리</th></tr></thead>
            <tbody>
              {filtered.map((c) => {
                const owner = profileMap[c.userId];
                return (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.variety || '-'}</td>
                    <td>{c.category || '-'}</td>
                    <td>{owner?.name || '-'}</td>
                    <td>{owner?.groupName || owner?.group_name || '-'}</td>
                    <td>{logCounts[c.id] || 0}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="admin-action-btn" onClick={() => openEdit(c)}><Pencil size={14} /></button>
                        <button className="admin-action-btn admin-action-btn--danger" onClick={() => openDelete(c)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            {modal.type === 'edit' && (
              <>
                <h3 className="admin-modal-title">작물 수정</h3>
                <div className="admin-modal-fields">
                  <div><label className="admin-input-label">작물명</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div><label className="admin-input-label">품종</label><input className="input" value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} /></div>
                  <div>
                    <label className="admin-input-label">카테고리</label>
                    <select className="admin-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ width: '100%' }}>
                      <option value="">선택 안 함</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label className="admin-input-label">파종일</label><input className="input" type="date" value={form.plantingDate} onChange={(e) => setForm({ ...form, plantingDate: e.target.value })} /></div>
                  <div><label className="admin-input-label">구획</label><input className="input" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} /></div>
                </div>
                {error && <p className="admin-modal-error">{error}</p>}
                <div className="admin-modal-actions">
                  <button className="btn-secondary" onClick={() => setModal(null)}>취소</button>
                  <button className="btn-primary" onClick={handleEdit} disabled={saving}>{saving ? '저장 중...' : '저장'}</button>
                </div>
              </>
            )}
            {modal.type === 'delete' && (
              <>
                <h3 className="admin-modal-title" style={{ color: 'var(--color-danger)' }}>작물 삭제</h3>
                <p style={{ fontSize: 14, marginBottom: 8 }}><strong>{modal.crop.name}</strong></p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>이 작물의 기록 {logCounts[modal.crop.id] || 0}건도 함께 삭제됩니다.</p>
                {error && <p className="admin-modal-error">{error}</p>}
                <div className="admin-modal-actions">
                  <button className="btn-secondary" onClick={() => setModal(null)}>취소</button>
                  <button className="btn-primary" onClick={handleDelete} disabled={saving} style={{ background: 'var(--color-danger)' }}>{saving ? '삭제 중...' : '삭제'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
