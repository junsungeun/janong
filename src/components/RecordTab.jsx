import { useState, useEffect } from 'react';
import { BookOpen, Timer, FlaskConical } from 'lucide-react';
import DailyLog from './DailyLog';
import WorkTimer from './WorkTimer';
import ChemicalLog from './ChemicalLog';

const SUB_TABS = [
  { id: 'log',   label: '농사 일지', icon: BookOpen },
  { id: 'timer', label: '작업 타이머', icon: Timer },
  { id: 'chem',  label: '농자재', icon: FlaskConical },
];

export default function RecordTab({ trigger }) {
  const [active, setActive] = useState('log');
  const [addTrigger, setAddTrigger] = useState(null);

  useEffect(() => {
    if (!trigger?.key) return;
    if (trigger.sub) setActive(trigger.sub);
    if (trigger.add) setAddTrigger(trigger.key);
  }, [trigger?.key]);

  return (
    <div>
      {/* 서브 탭 */}
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
                gap: '5px',
                padding: '8px 6px',
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

      {active === 'log'   && <DailyLog addTrigger={addTrigger} />}
      {active === 'timer' && <WorkTimer />}
      {active === 'chem'  && <ChemicalLog />}
    </div>
  );
}
