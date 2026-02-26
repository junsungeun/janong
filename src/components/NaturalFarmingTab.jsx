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
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '20px',
        background: 'var(--bg-subtle)',
        borderRadius: '10px',
        padding: '4px',
      }}>
        {TABS.map(tab => {
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

      {active === 'recipe'  && <RecipeBook />}
      {active === 'microbe' && <MicrobeLog />}
    </div>
  );
}
