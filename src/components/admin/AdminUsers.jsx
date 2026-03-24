import { useState, useEffect } from 'react';
import { db, TABLES } from '../../services/dbService';
import { adminService } from '../../services/adminService';
import { supabase } from '../../lib/supabase';
import { UserPlus, Trash2, KeyRound, Search, Pencil } from 'lucide-react';

export default function AdminUsers() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // { type: 'create' | 'edit' | 'password' | 'delete', user? }
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('admin_profiles').select('*').order('created_at', { ascending: false });
    if (!error) setProfiles((data || []).map(p => ({
      ...p,
      groupName: p.group_name,
      createdAt: p.created_at,
    })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    return !q || (p.name || '').toLowerCase().includes(q) || (p.groupName || p.group_name || '').toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q);
  });

  const openCreate = () => { setForm({ email: '', password: '', name: '', groupName: '' }); setError(''); setModal({ type: 'create' }); };
  const openEdit = (u) => { setForm({ name: u.name || '', groupName: u.groupName || u.group_name || '', role: u.role || 'user' }); setError(''); setModal({ type: 'edit', user: u }); };
  const openPassword = (u) => { setForm({ password: '' }); setError(''); setModal({ type: 'password', user: u }); };
  const openDelete = (u) => { setError(''); setModal({ type: 'delete', user: u }); };

  const handleCreate = async () => {
    setSaving(true); setError('');
    try {
      await adminService.createUser(form.email, form.password, form.name);
      setModal(null); load();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  const handleEdit = async () => {
    setSaving(true); setError('');
    try {
      await supabase.from('profiles').update({
        name: form.name, group_name: form.groupName, role: form.role,
      }).eq('id', modal.user.id);
      setModal(null); load();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  const handlePassword = async () => {
    setSaving(true); setError('');
    try {
      await adminService.resetPassword(modal.user.id, form.password);
      setModal(null);
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true); setError('');
    try {
      await adminService.deleteUser(modal.user.id);
      setModal(null); load();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">회원 관리</h1>
        <button className="btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}>
          <UserPlus size={16} /> 계정 생성
        </button>
      </div>

      <div className="admin-search">
        <Search size={16} />
        <input className="admin-search-input" placeholder="이름 또는 조 검색..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? <p className="admin-loading">로딩 중...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>이름</th><th>이메일</th><th>조</th><th>역할</th><th>가입일</th><th>관리</th></tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name || '-'}</strong></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.email || '-'}</td>
                  <td>{p.groupName || p.group_name || '-'}</td>
                  <td><span className={`admin-role-badge ${p.role === 'admin' ? 'admin' : ''}`}>{p.role === 'admin' ? '관리자' : '일반'}</span></td>
                  <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('ko-KR') : '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="admin-action-btn" title="수정" onClick={() => openEdit(p)}><Pencil size={14} /></button>
                      <button className="admin-action-btn" title="비밀번호" onClick={() => openPassword(p)}><KeyRound size={14} /></button>
                      <button className="admin-action-btn admin-action-btn--danger" title="삭제" onClick={() => openDelete(p)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            {modal.type === 'create' && (
              <>
                <h3 className="admin-modal-title">계정 생성</h3>
                <div className="admin-modal-fields">
                  <AdminInput label="이름" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                  <AdminInput label="이메일" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
                  <AdminInput label="비밀번호" value={form.password} onChange={(v) => setForm({ ...form, password: v })} type="password" />
                  <AdminInput label="조" value={form.groupName} onChange={(v) => setForm({ ...form, groupName: v })} placeholder="예: 1조" />
                </div>
                {error && <p className="admin-modal-error">{error}</p>}
                <div className="admin-modal-actions">
                  <button className="btn-secondary" onClick={() => setModal(null)}>취소</button>
                  <button className="btn-primary" onClick={handleCreate} disabled={saving}>{saving ? '생성 중...' : '생성'}</button>
                </div>
              </>
            )}
            {modal.type === 'edit' && (
              <>
                <h3 className="admin-modal-title">회원 정보 수정</h3>
                <div className="admin-modal-fields">
                  <AdminInput label="이름" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                  <AdminInput label="조" value={form.groupName} onChange={(v) => setForm({ ...form, groupName: v })} />
                  <div>
                    <label className="admin-input-label">역할</label>
                    <select className="admin-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ width: '100%' }}>
                      <option value="user">일반</option>
                      <option value="admin">관리자</option>
                    </select>
                  </div>
                </div>
                {error && <p className="admin-modal-error">{error}</p>}
                <div className="admin-modal-actions">
                  <button className="btn-secondary" onClick={() => setModal(null)}>취소</button>
                  <button className="btn-primary" onClick={handleEdit} disabled={saving}>{saving ? '저장 중...' : '저장'}</button>
                </div>
              </>
            )}
            {modal.type === 'password' && (
              <>
                <h3 className="admin-modal-title">비밀번호 변경</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{modal.user.name || modal.user.email}</p>
                <AdminInput label="새 비밀번호" value={form.password} onChange={(v) => setForm({ ...form, password: v })} type="password" />
                {error && <p className="admin-modal-error">{error}</p>}
                <div className="admin-modal-actions">
                  <button className="btn-secondary" onClick={() => setModal(null)}>취소</button>
                  <button className="btn-primary" onClick={handlePassword} disabled={saving}>{saving ? '변경 중...' : '변경'}</button>
                </div>
              </>
            )}
            {modal.type === 'delete' && (
              <>
                <h3 className="admin-modal-title" style={{ color: 'var(--color-danger)' }}>계정 삭제</h3>
                <p style={{ fontSize: 14, marginBottom: 8 }}><strong>{modal.user.name || '-'}</strong></p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>이 유저의 모든 데이터가 삭제됩니다.</p>
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

function AdminInput({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label className="admin-input-label">{label}</label>
      <input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
