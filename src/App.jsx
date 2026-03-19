import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Home, Sprout, BookOpen, Calendar, MoreHorizontal,
  Bell, AlertTriangle, CheckSquare, Sprout as SproutIcon, X, Plus, ArrowLeft, Loader, LogOut,
} from 'lucide-react';
import { ToastContainer } from './components/Toast';
import './styles/globals.css';
import ErrorBoundary from './components/ErrorBoundary';
import { db, TABLES } from './services/dbService';
import { getCropTimeline } from './data/cropTimelines';
import { toYMD, todayYMD } from './utils/dateUtils';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';

// ── Eager imports — 탭 전환 딜레이 제거 ──────────────────────────────
import Dashboard    from './components/Dashboard';
import CropTab      from './components/CropTab';
import RecordTab    from './components/RecordTab';
import CalendarView from './components/Calendar';
import MoreTab      from './components/MoreTab';

const TABS = [
  { id: 'home',     label: '홈',     icon: Home },
  { id: 'crop',     label: '작물',   icon: Sprout },
  { id: 'record',   label: '기록',   icon: BookOpen },
  { id: 'calendar', label: '캘린더', icon: Calendar },
  { id: 'more',     label: '더보기', icon: MoreHorizontal },
];

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
      todos.filter(t => !t.done && t.date && t.date < todayYMD).forEach(t => {
        result.push({ type: 'overdue', label: t.text, sub: `기한 ${t.date.replace(/-/g, '.')}`, nav: 'calendar' });
      });
      todos.filter(t => !t.done && t.date === todayYMD).forEach(t => {
        result.push({ type: 'today', label: t.text, sub: '오늘 마감', nav: 'record' });
      });
      crops.forEach(crop => {
        getCropTimeline(crop.name, crop.plantingDate)
          .filter(item => item.date === todayYMD)
          .forEach(item => {
            result.push({ type: 'timeline', label: `[${crop.name}] ${item.label}`, sub: '오늘 일정', nav: 'crop' });
          });
      });
      issues.filter(i => !i.solved).forEach(i => {
        result.push({ type: 'issue', label: i.title, sub: `${i.crop} · 미해결`, nav: 'more' });
      });

      setItems(result);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose(); };
    setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const COLOR = {
    overdue: 'var(--color-danger)', today: 'var(--color-primary)',
    timeline: 'var(--color-earth)', issue: 'var(--color-danger)',
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
      <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '10px 0' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>불러오는 중...</div>
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
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: COLOR[g.key], padding: '4px 16px 6px', textTransform: 'uppercase' }}>
                  {g.label}
                </p>
                {list.map((item, i) => (
                  <button key={i}
                    onClick={() => { onNavigate(item.nav); onClose(); }}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '10px',
                      width: '100%', padding: '9px 16px', textAlign: 'left',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font-sans)', transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <div style={{ color: COLOR[item.type], marginTop: '2px', flexShrink: 0 }}>{ICON[item.type]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', color: 'var(--text)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.label}</p>
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

// ── FAB ────────────────────────────────────────────────────────────────
function FAB({ onNavigate }) {
  const [open, setOpen] = useState(false);

  const actions = [
    {
      label: '이슈 등록', color: 'var(--color-danger)',
      icon: <AlertTriangle size={14} strokeWidth={2} />,
      onClick: () => { onNavigate('home', { action: 'issue' }); setOpen(false); },
    },
    {
      label: '할 일 추가', color: 'var(--color-info)',
      icon: <CheckSquare size={14} strokeWidth={2} />,
      onClick: () => { onNavigate('home', { action: 'todo' }); setOpen(false); },
    },
    {
      label: '농사 일지', color: 'var(--color-primary)',
      icon: <BookOpen size={14} strokeWidth={2} />,
      onClick: () => { onNavigate('record', { sub: 'log', add: true }); setOpen(false); },
    },
  ];

  return (
    <>
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 140 }} />
      )}
      <div style={{ position: 'fixed', bottom: '76px', right: '16px', zIndex: 150, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {open && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', alignItems: 'flex-end' }}>
            {actions.map((a, i) => (
              <button key={i} onClick={a.onClick} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '9px 16px', background: 'var(--bg-card)',
                border: `1.5px solid ${a.color}`, borderRadius: '20px',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-sans)', color: a.color,
                boxShadow: '0 3px 12px rgba(0,0,0,0.14)', whiteSpace: 'nowrap',
              }}>
                {a.icon}
                {a.label}
              </button>
            ))}
          </div>
        )}
        <button onClick={() => setOpen(v => !v)} style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: open ? 'var(--color-primary-dark)' : 'var(--color-primary)',
          color: '#fff', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 4px 16px rgba(59,94,58,0.4)',
          transition: 'background 0.2s',
        }}>
          {open ? <X size={20} strokeWidth={2.5} /> : <Plus size={22} strokeWidth={2.5} />}
        </button>
      </div>
    </>
  );
}

// ── 인증 게이트 ──────────────────────────────────────────────────────
function App() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100dvh', background: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Loader size={24} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return <AppMain />;
}

// ── 앱 메인 ──────────────────────────────────────────────────────────
function AppMain() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab]     = useState('home');
  const [showNotif, setShowNotif]     = useState(false);
  const [notifCount, setNotifCount]   = useState(0);
  const [recordTrigger, setRecordTrigger] = useState(null);
  const [homeTrigger, setHomeTrigger]     = useState(null);
  const contentRef = useRef(null);
  const [subPage, setSubPage] = useState(null);
  const scrollPositions = useRef({});
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;
  const subPageRef = useRef(subPage);
  subPageRef.current = subPage;
  const programmaticBack = useRef(false);
  const historyPushed = useRef(false);

  // ── 서브 페이지 네비게이션 ──
  const handleSetSubPage = useCallback((info) => {
    setSubPage(info);
    subPageRef.current = info;
    if (info && !historyPushed.current) {
      window.history.pushState({ subPage: true }, '');
      historyPushed.current = true;
    } else if (!info && historyPushed.current) {
      historyPushed.current = false;
      programmaticBack.current = true;
      window.history.back();
    }
  }, []);

  const goBack = useCallback(() => {
    const sp = subPageRef.current;
    if (!sp) return;
    sp.onBack();
    setSubPage(null);
    subPageRef.current = null;
    if (historyPushed.current) {
      historyPushed.current = false;
      programmaticBack.current = true;
      window.history.back();
    }
  }, []);

  // 브라우저 뒤로가기 버튼 지원
  useEffect(() => {
    const handler = () => {
      if (programmaticBack.current) {
        programmaticBack.current = false;
        return;
      }
      const sp = subPageRef.current;
      if (sp) {
        sp.onBack();
        setSubPage(null);
        subPageRef.current = null;
        historyPushed.current = false;
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // useCallback — 안정적인 함수 참조로 자식 컴포넌트 불필요 재렌더 방지
  const handleTabChange = useCallback((tabId, params = null) => {
    if (contentRef.current) {
      scrollPositions.current[activeTabRef.current] = contentRef.current.scrollTop;
    }
    const sp = subPageRef.current;
    if (sp) {
      sp.onBack();
      setSubPage(null);
      subPageRef.current = null;
      if (historyPushed.current) {
        historyPushed.current = false;
        programmaticBack.current = true;
        window.history.back();
      }
    }
    setActiveTab(tabId);
    setShowNotif(false);
    if (tabId === 'record' && params) setRecordTrigger({ ...params, key: Date.now() });
    if (tabId === 'home'   && params) setHomeTrigger({ ...params, key: Date.now() });
  }, []);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const [todos, issues, crops] = await Promise.all([
          db.getList(TABLES.TODO),
          db.getList(TABLES.ISSUE),
          db.getList(TABLES.CROP),
        ]);
        const overdueTodos  = todos.filter(t => !t.done && t.date && t.date < todayYMD).length;
        const todayTodos    = todos.filter(t => !t.done && t.date === todayYMD).length;
        const activeIssues  = issues.filter(i => !i.solved).length;
        const todayTimeline = crops.reduce((acc, crop) =>
          acc + getCropTimeline(crop.name, crop.plantingDate).filter(i => i.date === todayYMD).length, 0);
        setNotifCount(overdueTodos + todayTodos + activeIssues + todayTimeline);
      } catch (e) { console.warn('알림 카운트 로드 실패:', e); }
    };
    loadCount();
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = scrollPositions.current[activeTab] || 0;
    }
  }, [activeTab]);

  return (
    <div className="app-layout">

      {/* ── 상단 헤더 ── */}
      <header className="app-header" style={{ position: 'relative' }}>
        {subPage ? (
          <div className="sub-page-header">
            <button className="sub-page-back" onClick={goBack} aria-label="뒤로가기">
              <ArrowLeft size={20} strokeWidth={1.5} />
            </button>
            <span className="sub-page-title">{subPage.title}</span>
          </div>
        ) : (
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
        )}

        <div className="app-header-right" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
          <button
            onClick={signOut}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex', padding: '6px',
              borderRadius: '8px', transition: 'all 0.15s',
            }}
            aria-label="로그아웃"
          >
            <LogOut size={18} strokeWidth={1.5} />
          </button>
        </div>

        {showNotif && (
          <NotifPanel onClose={() => setShowNotif(false)} onNavigate={handleTabChange} />
        )}
      </header>

      {/* ── 콘텐츠 — 조건부 마운트 ── */}
      <main className="app-content" ref={contentRef}>
        <ErrorBoundary>
          {activeTab === 'home'     && <Dashboard onNavigate={handleTabChange} trigger={homeTrigger} />}
          {activeTab === 'crop'     && <CropTab onSetSubPage={handleSetSubPage} />}
          {activeTab === 'record'   && <RecordTab trigger={recordTrigger} />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'more'     && <MoreTab />}
        </ErrorBoundary>
      </main>

      {!subPage && <FAB onNavigate={handleTabChange} />}
      <ToastContainer />

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
