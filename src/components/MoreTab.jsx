import { useState } from 'react';
import { CheckSquare, AlertTriangle, Leaf, Settings, Heart } from 'lucide-react';
import TodoList from './TodoList';
import IssueBoard from './IssueBoard';
import NaturalFarmingTab from './NaturalFarmingTab';
import SettingsPanel from './SettingsPanel';
import HealingFarmingTab from './HealingFarmingTab';

const SUB_TABS = [
  { id: 'todo',    label: '할 일',   icon: CheckSquare },
  { id: 'issue',   label: '이슈',    icon: AlertTriangle },
  { id: 'natural', label: '자연농업', icon: Leaf },
  { id: 'healing', label: '치유농업', icon: Heart },
  { id: 'settings',label: '설정',    icon: Settings },
];

export default function MoreTab() {
  const [active, setActive] = useState('todo');

  return (
    <div>
      <div className="underline-tab-bar">
        {SUB_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              className={`underline-tab-btn${isActive ? ' active' : ''}`}
              onClick={() => setActive(tab.id)}
            >
              <Icon size={14} strokeWidth={isActive ? 2 : 1.5} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {active === 'todo'     && <TodoList />}
      {active === 'issue'    && <IssueBoard />}
      {active === 'natural'  && <NaturalFarmingTab />}
      {active === 'healing'  && <HealingFarmingTab />}
      {active === 'settings' && <SettingsPanel />}
    </div>
  );
}
