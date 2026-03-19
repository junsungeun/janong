import { useAuth } from '../../contexts/AuthContext';
import LoginPage from '../LoginPage';
import AdminDashboard from './AdminDashboard';
import { Loader, ShieldX } from 'lucide-react';

export default function AdminApp() {
  const { user, profile, loading, signOut, isAdmin } = useAuth();

  if (loading) {
    return (
      <div style={centerStyle}>
        <Loader size={24} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  // profile 아직 로딩 중
  if (user && !profile) {
    return (
      <div style={centerStyle}>
        <Loader size={24} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={centerStyle}>
        <ShieldX size={40} color="var(--color-danger)" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
        <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>
          접근 권한 없음
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          어드민 계정으로 로그인해주세요.
        </p>
        <button
          onClick={signOut}
          style={{
            padding: '10px 24px', background: 'var(--color-danger)', color: '#fff',
            border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '480px', margin: '0 auto', minHeight: '100dvh',
      background: 'var(--bg)', fontFamily: 'var(--font-sans)',
    }}>
      <header style={{
        padding: '16px 20px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--bg-card)',
      }}>
        <div>
          <span style={{
            fontSize: '15px', fontWeight: 700, letterSpacing: '0.15em',
            color: 'var(--color-primary)', textTransform: 'uppercase',
          }}>
            JANONG
          </span>
          <span style={{
            fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)',
            marginLeft: '8px', letterSpacing: '0.08em',
          }}>
            ADMIN
          </span>
        </div>
        <button
          onClick={signOut}
          style={{
            padding: '6px 14px', background: 'none',
            border: '1px solid var(--border)', borderRadius: '6px',
            fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)',
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}
        >
          로그아웃
        </button>
      </header>
      <div style={{ padding: '20px' }}>
        <AdminDashboard />
      </div>
    </div>
  );
}

const centerStyle = {
  minHeight: '100dvh', background: 'var(--bg)',
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--font-sans)', padding: '20px',
};
