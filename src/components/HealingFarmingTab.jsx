import { useState, useEffect } from 'react';
import { BookOpen, Play, FlaskConical, FileText, ExternalLink, RefreshCw, Download } from 'lucide-react';
import {
  fetchHealingIssues,
  fetchHealingRefs,
  fetchHealingVideos,
  fetchHealingResearch,
  fetchHealingDetail,
} from '../services/nongsaroService';

const SECTIONS = [
  { id: 'issue',    label: '이슈',    icon: FileText,     fetch: fetchHealingIssues,   titleKey: 'cntntsSj', dateKey: 'submitDt'  },
  { id: 'ref',      label: '참고자료', icon: BookOpen,     fetch: fetchHealingRefs,     titleKey: 'cntntsSj', dateKey: 'publiDt'   },
  { id: 'video',    label: '동영상',   icon: Play,         fetch: fetchHealingVideos,   titleKey: 'cntntsSj', dateKey: 'submitDt'  },
  { id: 'research', label: '연구성과', icon: FlaskConical, fetch: fetchHealingResearch, titleKey: 'cntntsSj', dateKey: 'submitDt'  },
];

function ContentCard({ item, titleKey, dateKey, sectionId }) {
  const title   = item[titleKey] || item.subject || '제목 없음';
  const date    = item[dateKey]  || item.regDt   || '';
  const summary = item.summary   || null;
  // 주간농사정보는 downUrl 직접 보유
  const directUrl = item.downUrl || item.url || item.fileUrl || item.linkUrl || null;

  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    // 직접 URL 있으면 바로 열기
    if (directUrl) {
      window.open(directUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    // cntntsNo 있으면 상세 API 호출
    if (!item.cntntsNo) return;
    setLoading(true);
    const detail = await fetchHealingDetail(sectionId, item.cntntsNo);
    setLoading(false);
    if (detail?.fileView) {
      window.open(detail.fileView, '_blank', 'noopener,noreferrer');
    } else if (detail?.downUrl) {
      window.open(detail.downUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const hasLink = !!directUrl || !!item.cntntsNo;

  return (
    <div className="card" style={{ padding: '14px 16px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', lineHeight: 'var(--leading-normal)', flex: 1 }}>
          {title}
        </p>
        {hasLink && (
          <button
            onClick={handleOpen}
            disabled={loading}
            style={{
              background: 'none', border: 'none', cursor: loading ? 'wait' : 'pointer',
              color: 'var(--text-muted)', flexShrink: 0, display: 'flex', padding: '2px',
            }}
          >
            {loading
              ? <RefreshCw size={14} strokeWidth={1.5} style={{ animation: 'spin 1s linear infinite' }} />
              : directUrl?.includes('download') || directUrl?.includes('Download')
                ? <Download size={14} strokeWidth={1.5} />
                : <ExternalLink size={14} strokeWidth={1.5} />
            }
          </button>
        )}
      </div>
      {summary && (
        <p style={{ fontSize: 'var(--text-caption)', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 'var(--leading-normal)' }}>
          {summary.length > 80 ? summary.slice(0, 80) + '…' : summary}
        </p>
      )}
      {date && (
        <p style={{ fontSize: 'var(--text-caption)', color: 'var(--text-muted)', marginTop: '6px' }}>
          {String(date).slice(0, 10).replace(/-/g, '.')}
        </p>
      )}
    </div>
  );
}

export default function HealingFarmingTab() {
  const [active, setActive]   = useState('issue');
  const [cache, setCache]     = useState({});
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
          <ContentCard
            key={i}
            item={item}
            titleKey={section.titleKey}
            dateKey={section.dateKey}
            sectionId={active}
          />
        ))
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
