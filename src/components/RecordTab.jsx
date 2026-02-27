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
      <div className="sub-tab-bar">
        {SUB_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              className={`sub-tab-btn${isActive ? ' active' : ''}`}
              onClick={() => setActive(tab.id)}
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
