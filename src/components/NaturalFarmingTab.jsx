import { useState } from 'react';
import { FlaskConical, Microscope } from 'lucide-react';
import RecipeBook from './RecipeBook';
import MicrobeLog from './MicrobeLog';

const TABS = [
  { id: 'recipe',  label: '레시피',       icon: FlaskConical },
  { id: 'microbe', label: '미생물 배양 일지', icon: Microscope },
];

export default function NaturalFarmingTab() {
  const [active, setActive] = useState('recipe');

  return (
    <div>
      <div className="sub-tab-bar">
        {TABS.map(tab => {
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

      {active === 'recipe'  && <RecipeBook />}
      {active === 'microbe' && <MicrobeLog />}
    </div>
  );
}
