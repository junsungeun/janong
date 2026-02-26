import { useState, useRef, useEffect } from 'react';
import {
  Home, Sprout, BookOpen, Calendar, MoreHorizontal,
  Bell, Settings
} from 'lucide-react';
import './styles/globals.css';
import Dashboard from './components/Dashboard';
import RecordTab from './components/RecordTab';
import MoreTab from './components/MoreTab';
import CropTab from './components/CropTab';
import CalendarView from './components/Calendar';
import PlaceholderPage from './components/PlaceholderPage';
import ErrorBoundary from './components/ErrorBoundary';

const TABS = [
  { id: 'home',     label: '홈',     icon: Home },
  { id: 'crop',     label: '작물',   icon: Sprout },
  { id: 'record',   label: '기록',   icon: BookOpen },
  { id: 'calendar', label: '캘린더', icon: Calendar },
  { id: 'more',     label: '더보기', icon: MoreHorizontal },
];

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'crop':
        return <CropTab />;
      case 'record':
        return <RecordTab />;
      case 'calendar':
        return <CalendarView />;
      case 'more':
        return <MoreTab />;
      default:
        return null;
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

      {/* ── 콘텐츠 ── */}
      <main className="app-content" ref={contentRef}>
        <ErrorBoundary key={activeTab}>
          {renderContent()}
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
              onClick={() => setActiveTab(tab.id)}
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
