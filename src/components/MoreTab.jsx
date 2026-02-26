import { useState } from 'react';
import { CheckSquare, AlertTriangle, Leaf, Settings } from 'lucide-react';
import TodoList from './TodoList';
import IssueBoard from './IssueBoard';
import NaturalFarmingTab from './NaturalFarmingTab';
import SettingsPanel from './SettingsPanel';

const SUB_TABS = [
  { id: 'todo',    label: '할 일',    icon: CheckSquare },
  { id: 'issue',   label: '이슈',     icon: AlertTriangle },
  { id: 'natural', label: '자연농업', icon: Leaf },
  { id: 'settings',label: '설정',     icon: Settings },
];

export default function MoreTab() {
  const [active, setActive] = useState('todo');

  return (
    <div>
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '20px',
        background: 'var(--bg-subtle)',
        borderRadius: '10px',
        padding: '4px',
      }}>
        {SUB_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '9px 4px',
                borderRadius: '7px',
                border: 'none',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 400,
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: isActive ? 'var(--bg-card)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
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
      {active === 'settings' && <SettingsPanel />}
    </div>
  );
}
