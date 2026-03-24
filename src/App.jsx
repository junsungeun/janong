import { useState } from 'react';
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

function AppMain() {
  const [activeTab, setActiveTab] = useState('home');

  const renderTab = () => {
    switch (activeTab) {
      case 'home':       return <HomeTab onNavigate={setActiveTab} />;
      case 'record':     return <RecordTab />;
      case 'dashboard':  return <DashboardTab />;
      case 'notices':    return <NoticesTab />;
      case 'settings':   return <SettingsTab />;
      default:           return null;
    }
  };

  return (
    <div className="app-layout">
      <Header />
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
