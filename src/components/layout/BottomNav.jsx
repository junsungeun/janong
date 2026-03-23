import { Home, BookOpen, BarChart2, Settings } from 'lucide-react';

const tabs = [
  { key: 'home', label: '홈', Icon: Home },
  { key: 'record', label: '기록', Icon: BookOpen },
  { key: 'dashboard', label: '대시보드', Icon: BarChart2 },
  { key: 'settings', label: '설정', Icon: Settings },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="tab-nav" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
      {tabs.map(({ key, label, Icon }) => (
        <button
          key={key}
          className={`tab-item${activeTab === key ? ' active' : ''}`}
          onClick={() => onTabChange(key)}
          aria-label={label}
        >
          <Icon size={22} strokeWidth={1.8} />
          <span style={{ fontSize: 10 }}>{label}</span>
        </button>
      ))}
    </nav>
  );
}
