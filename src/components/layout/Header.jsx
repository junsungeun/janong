import { Settings } from 'lucide-react';

export default function Header({ onSettingsClick }) {
  return (
    <header className="app-header">
      <div className="app-header-brand">
        <img src="/logo.png" alt="SeedLog" className="app-header-logo-img" />
        <div>
          <span className="app-header-logo">SeedLog</span>
          <div className="app-header-sub">농사 기록 플랫폼</div>
        </div>
      </div>
      <button className="app-header-settings" onClick={onSettingsClick} aria-label="설정">
        <Settings size={20} strokeWidth={1.8} />
      </button>
    </header>
  );
}
