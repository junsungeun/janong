import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Trash2, KeyRound, Users, ArrowLeft } from 'lucide-react';

export default function AdminDashboard({ onBack }) {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadUsers = async () => {
    try {
      const list = await adminService.listUsers();
      setUsers(list);
    } catch (e) {
      console.error('유저 목록 로드 실패:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  return (
    <div style={{ padding: '0 0 24px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={20} color="var(--color-primary)" strokeWidth={1.5} />
          <span className="section-title">유저 관리</span>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', background: 'var(--color-primary)',
            color: '#fff', border: 'none', borderRadius: '8px',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <UserPlus size={15} strokeWidth={2} />
          계정 생성
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '40px 0' }}>
          불러오는 중...
        </p>
      ) : users.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '40px 0' }}>
          등록된 유저가 없습니다.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {users.map((u) => (
            <div key={u.id} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{
                      fontSize: '14px', fontWeight: 600, color: 'var(--text)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {u.name || u.email}
                    </p>
                    {u.role === 'admin' && (
                      <span style={{
                        fontSize: '10px', fontWeight: 700, color: 'var(--color-primary)',
                        background: 'var(--color-primary-light)',
                        padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.06em',
                      }}>
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                    {u.email}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '2px' }}>
                    가입: {new Date(u.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>

                {u.id !== profile?.id && (
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                      onClick={() => setResetTarget(u)}
                      title="비밀번호 변경"
                      style={{
                        padding: '7px', background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                        borderRadius: '8px', cursor: 'pointer', display: 'flex',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <KeyRound size={15} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(u)}
                      title="계정 삭제"
                      style={{
                        padding: '7px', background: '#FFF0F0', border: '1px solid #FFD4D4',
                        borderRadius: '8px', cursor: 'pointer', display: 'flex',
                        color: 'var(--color-danger)',
                      }}
                    >
                      <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadUsers(); }}
        />
      )}
      {resetTarget && (
        <ResetPasswordModal
          user={resetTarget}
          onClose={() => setResetTarget(null)}
          onDone={() => { setResetTarget(null); }}
        />
      )}
      {deleteTarget && (
        <DeleteUserModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => { setDeleteTarget(null); loadUsers(); }}
        />
      )}
    </div>
  );
}

// ── 계정 생성 모달 ──
function CreateUserModal({ onClose, onCreated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminService.createUser(email, password, name);
      onCreated();
    } catch (err) {
      setError(err.message || '생성 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '18px' }}>
        새 계정 생성
      </h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <InputField label="이름" value={name} onChange={setName} placeholder="홍길동" />
        <InputField label="이메일" value={email} onChange={setEmail} type="email" required placeholder="user@example.com" />
        <InputField label="임시 비밀번호" value={password} onChange={setPassword} type="password" required placeholder="6자 이상" />
        {error && <p style={{ fontSize: '13px', color: 'var(--color-danger)', margin: 0 }}>{error}</p>}
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <button type="button" onClick={onClose} style={btnSecondary}>취소</button>
          <button type="submit" disabled={loading} style={btnPrimary(loading)}>
            {loading ? '생성 중...' : '생성'}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

// ── 비밀번호 변경 모달 ──
function ResetPasswordModal({ user, onClose, onDone }) {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminService.resetPassword(user.id, newPassword);
      onDone();
    } catch (err) {
      setError(err.message || '변경 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
        비밀번호 변경
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        {user.name || user.email}
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <InputField label="새 비밀번호" value={newPassword} onChange={setNewPassword} type="password" required placeholder="6자 이상" />
        {error && <p style={{ fontSize: '13px', color: 'var(--color-danger)', margin: 0 }}>{error}</p>}
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <button type="button" onClick={onClose} style={btnSecondary}>취소</button>
          <button type="submit" disabled={loading} style={btnPrimary(loading)}>
            {loading ? '변경 중...' : '변경'}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

// ── 계정 삭제 모달 ──
function DeleteUserModal({ user, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setError('');
    setLoading(true);
    try {
      await adminService.deleteUser(user.id);
      onDeleted();
    } catch (err) {
      setError(err.message || '삭제 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-danger)', marginBottom: '10px' }}>
        계정 삭제
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '4px' }}>
        <strong>{user.name || user.email}</strong>
      </p>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
        이 유저의 모든 데이터가 삭제됩니다. 되돌릴 수 없습니다.
      </p>
      {error && <p style={{ fontSize: '13px', color: 'var(--color-danger)', marginBottom: '12px' }}>{error}</p>}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onClose} style={btnSecondary}>취소</button>
        <button onClick={handleDelete} disabled={loading} style={{
          ...btnPrimary(loading),
          background: loading ? 'var(--text-muted)' : 'var(--color-danger)',
        }}>
          {loading ? '삭제 중...' : '삭제'}
        </button>
      </div>
    </ModalOverlay>
  );
}

// ── 공통 UI ──
function ModalOverlay({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 300, padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', borderRadius: '14px',
          padding: '24px', width: '100%', maxWidth: '380px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', required = false, placeholder = '' }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '12px', fontWeight: 600,
        color: 'var(--text-muted)', marginBottom: '5px', letterSpacing: '0.04em',
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 12px',
          border: '1px solid var(--border)', borderRadius: '8px',
          fontSize: '14px', fontFamily: 'var(--font-sans)',
          background: 'var(--bg)', color: 'var(--text)',
          outline: 'none', boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

const btnSecondary = {
  flex: 1, padding: '10px', background: 'var(--bg-subtle)',
  border: '1px solid var(--border)', borderRadius: '8px',
  fontSize: '14px', fontWeight: 600, cursor: 'pointer',
  fontFamily: 'var(--font-sans)', color: 'var(--text)',
};

const btnPrimary = (loading) => ({
  flex: 1, padding: '10px',
  background: loading ? 'var(--text-muted)' : 'var(--color-primary)',
  color: '#fff', border: 'none', borderRadius: '8px',
  fontSize: '14px', fontWeight: 600,
  cursor: loading ? 'not-allowed' : 'pointer',
  fontFamily: 'var(--font-sans)',
});
