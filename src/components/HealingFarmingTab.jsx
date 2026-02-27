import { useState, useEffect } from 'react';
import { BookOpen, Play, FlaskConical, FileText, ExternalLink, RefreshCw } from 'lucide-react';
import {
  fetchHealingIssues,
  fetchHealingRefs,
  fetchHealingVideos,
  fetchHealingResearch,
} from '../services/nongsaroService';

const SECTIONS = [
  { id: 'issue',    label: '이슈',    icon: FileText,     fetch: fetchHealingIssues,   titleKey: 'issueSj',  dateKey: 'registDt' },
  { id: 'ref',      label: '참고자료', icon: BookOpen,     fetch: fetchHealingRefs,     titleKey: 'refSj',    dateKey: 'registDt' },
  { id: 'video',    label: '동영상',   icon: Play,         fetch: fetchHealingVideos,   titleKey: 'mvpNm',    dateKey: 'registDt' },
  { id: 'research', label: '연구성과', icon: FlaskConical, fetch: fetchHealingResearch, titleKey: 'rsltNm',   dateKey: 'registDt' },
];

function ContentCard({ item, titleKey, dateKey }) {
  const title = item[titleKey] || item.title || item.sj || '제목 없음';
  const date  = item[dateKey]  || item.date  || '';
  const url   = item.url || item.fileUrl || item.linkUrl || null;

  return (
    <div className="card" style={{ padding: '14px 16px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', lineHeight: 'var(--leading-normal)', flex: 1 }}>
          {title}
        </p>
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--text-muted)', flexShrink: 0, display: 'flex', padding: '2px' }}>
            <ExternalLink size={14} strokeWidth={1.5} />
          </a>
        )}
      </div>
      {date && (
        <p style={{ fontSize: 'var(--text-caption)', color: 'var(--text-muted)', marginTop: '6px' }}>
          {String(date).slice(0, 10).replace(/-/g, '.')}
        </p>
      )}
    </div>
  );
}

export default function HealingFarmingTab() {
  const [active, setActive] = useState('issue');
  const [cache, setCache]   = useState({});
  const [loading, setLoading] = useState(false);

  const section = SECTIONS.find(s => s.id === active);

  useEffect(() => {
    if (cache[active]) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const items = await section.fetch();
      if (!cancelled) {
        setCache(prev => ({ ...prev, [active]: items }));
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [active]);

  const items = cache[active] || [];

  return (
    <div>
      {/* 섹션 탭 */}
      <div className="sub-tab-bar" style={{ marginBottom: '16px' }}>
        {SECTIONS.map(s => {
          const Icon = s.icon;
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              className={`sub-tab-btn${isActive ? ' active' : ''}`}
              onClick={() => setActive(s.id)}
            >
              <Icon size={13} strokeWidth={isActive ? 2 : 1.5} />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* 콘텐츠 */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <RefreshCw size={20} strokeWidth={1.5} color="var(--text-muted)"
            style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            {section && <section.icon size={40} strokeWidth={1} />}
          </div>
          <p className="empty-state-text">데이터를 불러오지 못했어요<br />잠시 후 다시 시도해주세요</p>
        </div>
      ) : (
        items.map((item, i) => (
          <ContentCard key={i} item={item} titleKey={section.titleKey} dateKey={section.dateKey} />
        ))
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
