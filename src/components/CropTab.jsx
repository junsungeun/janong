import { useState } from 'react';
import { Sprout, Leaf, Bug } from 'lucide-react';
import CropList from './CropList';
import CropMonitor from './CropMonitor';
import PestDiagnosis from './PestDiagnosis';

const SUB_TABS = [
  { id: 'crops',   label: '내 작물',  icon: Sprout },
  { id: 'monitor', label: '작물 분석', icon: Leaf },
  { id: 'pest',    label: '병해충',   icon: Bug },
];

export default function CropTab() {
  const [active, setActive] = useState('crops');

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
                gap: '5px',
                padding: '9px 6px',
                borderRadius: '7px',
                border: 'none',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: isActive ? 'var(--bg-card)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <Icon size={15} strokeWidth={isActive ? 2 : 1.5} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {active === 'crops'   && <CropList />}
      {active === 'monitor' && <CropMonitor />}
      {active === 'pest'    && <PestDiagnosis />}
    </div>
  );
}
