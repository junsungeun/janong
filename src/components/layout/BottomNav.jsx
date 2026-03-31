import { Home, BookOpen, BarChart2, GraduationCap } from 'lucide-react';

const tabs = [
  { key: 'home', label: '홈', Icon: Home },
  { key: 'record', label: '기록', Icon: BookOpen },
  { key: 'dashboard', label: '대시보드', Icon: BarChart2 },
  { key: 'quiz', label: '기출문제', Icon: GraduationCap },
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
            <Icon size={20} strokeWidth={1.8} />
            <span className="tab-item-label">{label}</span>
          </span>
        </button>
      ))}
    </nav>
  );
}
