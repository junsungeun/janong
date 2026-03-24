import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginPage from '../auth/LoginPage';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminData from './AdminData';
import AdminCrops from './AdminCrops';
import { Loader, ShieldX, LayoutDashboard, Users, Database, Sprout, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { key: 'users', label: '회원 관리', icon: Users },
  { key: 'crops', label: '작물 관리', icon: Sprout },
  { key: 'data', label: '데이터', icon: Database },
];

export default function AdminApp() {
  const { user, profile, loading, signOut, isAdmin } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard');

  if (loading) {
    return (
      <div style={centerStyle}>
        <Loader size={24} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  if (!isAdmin) {
    return (
      <div style={centerStyle}>
        <ShieldX size={40} color="var(--color-danger)" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
        <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>접근 권한 없음</p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>어드민 계정으로 로그인해주세요.</p>
        <button onClick={signOut} className="btn-primary">로그아웃</button>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeNav) {
      case 'users': return <AdminUsers />;
      case 'crops': return <AdminCrops />;
      case 'data': return <AdminData />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-logo">SeedLog</span>
          <span className="admin-sidebar-badge">Admin</span>
        </div>
        <nav className="admin-sidebar-nav">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`admin-nav-item ${activeNav === key ? 'active' : ''}`}
              onClick={() => setActiveNav(key)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-user">
            <span>{profile?.name || user?.email}</span>
          </div>
          <button className="admin-nav-item admin-logout" onClick={signOut}>
            <LogOut size={18} />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>
      <main className="admin-main">
        {renderContent()}
      </main>
    </div>
  );
}

const centerStyle = {
  minHeight: '100dvh', background: 'var(--bg)',
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--font-sans)', padding: '20px',
};
