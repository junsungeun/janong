import { Home, BookOpen, BarChart2, Settings } from 'lucide-react';

const tabs = [
  { key: 'home', label: '홈', Icon: Home },
  { key: 'record', label: '기록', Icon: BookOpen },
  { key: 'dashboard', label: '대시보드', Icon: BarChart2 },
  { key: 'settings', label: '설정', Icon: Settings },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="tab-nav" role="tablist">
      {tabs.map(({ key, label, Icon }) => (
        <button
          key={key}
          className={`tab-item${activeTab === key ? ' active' : ''}`}
          onClick={() => onTabChange(key)}
          aria-label={label}
          role="tab"
          aria-selected={activeTab === key}
        >
          <span className="tab-item-inner">
            <Icon size={21} strokeWidth={activeTab === key ? 2.2 : 1.7} />
            <span className="tab-item-label">{label}</span>
          </span>
        </button>
      ))}
    </nav>
  );
}
