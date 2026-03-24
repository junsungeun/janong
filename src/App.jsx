import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import LoginPage from './components/auth/LoginPage';
import HomeTab from './components/home/HomeTab';
import RecordTab from './components/record/RecordTab';
import DashboardTab from './components/dashboard/DashboardTab';
import NoticesTab from './components/notices/NoticesTab';
import SettingsTab from './components/settings/SettingsTab';
import { ToastContainer } from './components/ui/Toast';
import './styles/globals.css';
import './styles/components.css';

function SplashScreen({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1800);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="splash">
      <img src="/logo.png" alt="SeedLog" className="splash-logo" />
      <h1 className="splash-title">SeedLog</h1>
      <p className="splash-sub">농사 기록 플랫폼</p>
    </div>
  );
}

function AppMain() {
  const [activeTab, setActiveTab] = useState('home');
  const [recordFilterCropId, setRecordFilterCropId] = useState(null);

  const handleNavigate = (tab, data) => {
    if (tab === 'record' && data?.cropId) {
      setRecordFilterCropId(data.cropId);
    } else {
      setRecordFilterCropId(null);
    }
    setActiveTab(tab);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'home':       return <HomeTab onNavigate={handleNavigate} />;
      case 'record':     return <RecordTab initialCropFilter={recordFilterCropId} />;
      case 'dashboard':  return <DashboardTab />;
      case 'notices':    return <NoticesTab />;
      case 'settings':   return <SettingsTab />;
      default:           return null;
    }
  };

  return (
    <div className="app-layout">
      <Header onSettingsClick={() => setActiveTab('settings')} />
      <main className="app-content">
        {renderTab()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div className="app-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return <AppMain />;
}
