import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import {
  Home, Sprout, BookOpen, Calendar, MoreHorizontal,
  Bell, Settings
} from 'lucide-react';
import './styles/globals.css';
import ErrorBoundary from './components/ErrorBoundary';

// ── Lazy loading — 탭 첫 방문 시에만 JS 청크 로드 ──────────────────
const Dashboard    = lazy(() => import('./components/Dashboard'));
const CropTab      = lazy(() => import('./components/CropTab'));
const RecordTab    = lazy(() => import('./components/RecordTab'));
const CalendarView = lazy(() => import('./components/Calendar'));
const MoreTab      = lazy(() => import('./components/MoreTab'));

const TABS = [
  { id: 'home',     label: '홈',     icon: Home },
  { id: 'crop',     label: '작물',   icon: Sprout },
  { id: 'record',   label: '기록',   icon: BookOpen },
  { id: 'calendar', label: '캘린더', icon: Calendar },
  { id: 'more',     label: '더보기', icon: MoreHorizontal },
];

// ── 탭 로딩 스피너 ─────────────────────────────────────────────────
function TabLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '80px 20px', color: 'var(--text-muted)',
    }}>
      <div style={{
        width: '24px', height: '24px', borderRadius: '50%',
        border: '2px solid var(--border)',
        borderTopColor: 'var(--color-primary)',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('home');
  // 방문한 탭 추적 — 한 번 방문하면 계속 DOM에 유지 (keep-alive)
  const [visited, setVisited] = useState(new Set(['home']));
  const contentRef = useRef(null);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setVisited(prev => new Set([...prev, tabId]));
  };

  // 탭 전환 시 스크롤 맨 위
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeTab]);

  const renderTab = (tabId) => {
    switch (tabId) {
      case 'home':     return <Dashboard onNavigate={handleTabChange} />;
      case 'crop':     return <CropTab />;
      case 'record':   return <RecordTab />;
      case 'calendar': return <CalendarView />;
      case 'more':     return <MoreTab />;
      default:         return null;
    }
  };

  return (
    <div className="app-layout">

      {/* ── 상단 헤더 ── */}
      <header className="app-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: 'var(--color-primary)',
              textTransform: 'uppercase',
            }}>
              JANONG
            </span>
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '9px',
              fontWeight: 500,
              letterSpacing: '0.22em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              paddingBottom: '1px',
            }}>
              Farm System
            </span>
          </div>
          {activeTab === 'home' && (
            <div className="app-header-sub" style={{ fontStyle: 'italic', letterSpacing: '0.01em' }}>
              In the beginning God created the heavens and the earth.
            </div>
          )}
        </div>
        <div className="app-header-right">
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
            aria-label="알림"
          >
            <Bell size={20} strokeWidth={1.5} />
          </button>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
            aria-label="설정"
          >
            <Settings size={20} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* ── 콘텐츠 — Keep-alive: 방문한 탭은 숨기기만 하고 유지 ── */}
      <main className="app-content" ref={contentRef}>
        <ErrorBoundary>
          <Suspense fallback={<TabLoader />}>
            {TABS.map(tab => (
              visited.has(tab.id) ? (
                <div
                  key={tab.id}
                  style={{ display: activeTab === tab.id ? 'block' : 'none' }}
                >
                  {renderTab(tab.id)}
                </div>
              ) : null
            ))}
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* ── 하단 탭 네비게이션 ── */}
      <nav className="tab-nav">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`tab-item${isActive ? ' active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}

export default App;
