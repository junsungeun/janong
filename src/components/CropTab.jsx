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

      {active === 'crops'   && <CropList />}
      {active === 'monitor' && <CropMonitor />}
      {active === 'pest'    && <PestDiagnosis />}
    </div>
  );
}
