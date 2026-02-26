import { useState, useRef, useEffect, lazy, Suspense, useCallback } from 'react';
import {
  Home, Sprout, BookOpen, Calendar, MoreHorizontal,
  Bell, AlertTriangle, CheckSquare, Sprout as SproutIcon, X,
} from 'lucide-react';
import './styles/globals.css';
import ErrorBoundary from './components/ErrorBoundary';
import { db, TABLES } from './services/dbService';
import { getCropTimeline } from './data/cropTimelines';

// ── Lazy loading ─────────────────────────────────────────────────────
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

const toYMD = (d) => d.toISOString().slice(0, 10);
const todayYMD = toYMD(new Date());

function TabLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
      <div style={{
        width: '24px', height: '24px', borderRadius: '50%',
        border: '2px solid var(--border)', borderTopColor: 'var(--color-primary)',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── 알림 패널 ─────────────────────────────────────────────────────────
function NotifPanel({ onClose, onNavigate }) {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const [todos, issues, crops] = await Promise.all([
        db.getList(TABLES.TODO),
        db.getList(TABLES.ISSUE),
        db.getList(TABLES.CROP),
      ]);

      const result = [];

      // 기한 초과 할일
      todos.filter(t => !t.done && t.date && t.date < todayYMD).forEach(t => {
        result.push({ type: 'overdue', label: t.text, sub: `기한 ${t.date.replace(/-/g, '.')}`, nav: 'calendar' });
      });

      // 오늘 할일
      todos.filter(t => !t.done && t.date === todayYMD).forEach(t => {
        result.push({ type: 'today', label: t.text, sub: '오늘 마감', nav: 'record' });
      });

      // 오늘 작물 타임라인
      crops.forEach(crop => {
        getCropTimeline(crop.name, crop.plantingDate)
          .filter(item => item.date === todayYMD)
          .forEach(item => {
            result.push({ type: 'timeline', label: `[${crop.name}] ${item.label}`, sub: '오늘 일정', nav: 'crop' });
          });
      });

      // 미해결 이슈
      issues.filter(i => !i.solved).forEach(i => {
        result.push({ type: 'issue', label: i.title, sub: `${i.crop} · 미해결`, nav: 'more' });
      });

      setItems(result);
      setLoading(false);
    };
    load();
  }, []);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const COLOR = {
    overdue:  'var(--color-danger)',
    today:    'var(--color-primary)',
    timeline: 'var(--color-earth)',
    issue:    'var(--color-danger)',
  };
  const ICON = {
    overdue:  <CheckSquare size={13} strokeWidth={1.5} />,
    today:    <CheckSquare size={13} strokeWidth={1.5} />,
    timeline: <SproutIcon  size={13} strokeWidth={1.5} />,
    issue:    <AlertTriangle size={13} strokeWidth={1.5} />,
  };
  const GROUP = [
    { key: 'overdue',  label: '기한 초과' },
    { key: 'today',    label: '오늘 마감' },
    { key: 'timeline', label: '오늘 농사 일정' },
    { key: 'issue',    label: '미해결 이슈' },
  ];

  return (
    <div ref={panelRef} style={{
      position: 'absolute', top: '52px', right: '12px',
      width: 'min(320px, calc(100vw - 24px))',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
      zIndex: 200, overflow: 'hidden',
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 16px 12px', borderBottom: '1px solid var(--border-light)',
      }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>알림</span>
        <button onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: '2px' }}>
          <X size={15} strokeWidth={1.5} />
        </button>
      </div>

      {/* 내용 */}
      <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '10px 0' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
            불러오는 중...
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 20px' }}>
            <Bell size={28} strokeWidth={1.5} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.25 }} />
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>새 알림이 없어요</p>
          </div>
        ) : (
          GROUP.map(g => {
            const list = items.filter(i => i.type === g.key);
            if (list.length === 0) return null;
            return (
              <div key={g.key} style={{ marginBottom: '4px' }}>
                <p style={{
                  fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
                  color: COLOR[g.key], padding: '4px 16px 6px', textTransform: 'uppercase',
                }}>
                  {g.label}
                </p>
                {list.map((item, i) => (
                  <button key={i}
                    onClick={() => { onNavigate(item.nav); onClose(); }}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '10px',
                      width: '100%', padding: '9px 16px', textAlign: 'left',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font-sans)',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <div style={{ color: COLOR[item.type], marginTop: '2px', flexShrink: 0 }}>
                      {ICON[item.type]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', color: 'var(--text)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── 앱 ────────────────────────────────────────────────────────────────
function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [visited, setVisited]     = useState(new Set(['home']));
  const [showNotif, setShowNotif] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [recordTrigger, setRecordTrigger] = useState(null);
  const contentRef = useRef(null);

  const handleTabChange = (tabId, params = null) => {
    setActiveTab(tabId);
    setVisited(prev => new Set([...prev, tabId]));
    setShowNotif(false);
    if (tabId === 'record' && params) {
      setRecordTrigger({ ...params, key: Date.now() });
    }
  };

  // 알림 뱃지 카운트 로드
  useEffect(() => {
    const loadCount = async () => {
      try {
        const [todos, issues, crops] = await Promise.all([
          db.getList(TABLES.TODO),
          db.getList(TABLES.ISSUE),
          db.getList(TABLES.CROP),
        ]);
        const overdueTodos = todos.filter(t => !t.done && t.date && t.date < todayYMD).length;
        const todayTodos   = todos.filter(t => !t.done && t.date === todayYMD).length;
        const activeIssues = issues.filter(i => !i.solved).length;
        const todayTimeline = crops.reduce((acc, crop) => {
          return acc + getCropTimeline(crop.name, crop.plantingDate).filter(i => i.date === todayYMD).length;
        }, 0);
        setNotifCount(overdueTodos + todayTodos + activeIssues + todayTimeline);
      } catch { /* 무시 */ }
    };
    loadCount();
  }, []);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeTab]);

  const renderTab = (tabId) => {
    switch (tabId) {
      case 'home':     return <Dashboard onNavigate={handleTabChange} />;
      case 'crop':     return <CropTab />;
      case 'record':   return <RecordTab trigger={recordTrigger} />;
      case 'calendar': return <CalendarView />;
      case 'more':     return <MoreTab />;
      default:         return null;
    }
  };

  return (
    <div className="app-layout">

      {/* ── 상단 헤더 ── */}
      <header className="app-header" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{
              fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 700,
              letterSpacing: '0.18em', color: 'var(--color-primary)', textTransform: 'uppercase',
            }}>
              JANONG
            </span>
            <span style={{
              fontFamily: 'var(--font-sans)', fontSize: '9px', fontWeight: 500,
              letterSpacing: '0.22em', color: 'var(--text-muted)', textTransform: 'uppercase', paddingBottom: '1px',
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
          {/* 알림 버튼 */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotif(v => !v)}
              style={{
                background: showNotif ? 'var(--color-primary-light)' : 'none',
                border: 'none', cursor: 'pointer',
                color: showNotif ? 'var(--color-primary)' : 'var(--text-muted)',
                display: 'flex', padding: '6px', borderRadius: '8px',
                transition: 'all 0.15s',
              }}
              aria-label="알림"
            >
              <Bell size={20} strokeWidth={1.5} />
            </button>
            {/* 뱃지 */}
            {notifCount > 0 && !showNotif && (
              <div style={{
                position: 'absolute', top: '2px', right: '2px',
                width: '16px', height: '16px', borderRadius: '50%',
                background: 'var(--color-danger)', color: '#fff',
                fontSize: '9px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                {notifCount > 9 ? '9+' : notifCount}
              </div>
            )}
          </div>
        </div>

        {/* 알림 드롭다운 */}
        {showNotif && (
          <NotifPanel
            onClose={() => setShowNotif(false)}
            onNavigate={handleTabChange}
          />
        )}
      </header>

      {/* ── 콘텐츠 ── */}
      <main className="app-content" ref={contentRef}>
        <ErrorBoundary>
          <Suspense fallback={<TabLoader />}>
            {TABS.map(tab => (
              visited.has(tab.id) ? (
                <div key={tab.id} style={{ display: activeTab === tab.id ? 'block' : 'none' }}>
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
