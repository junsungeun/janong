import React from 'react';
import Badge from '../ui/Badge';

const STATUS_MAP = {
  '좋음': { variant: 'good', color: 'var(--color-good)' },
  '보통': { variant: 'info', color: 'var(--color-info)' },
  '주의': { variant: 'warning', color: 'var(--color-warning)' },
  '위험': { variant: 'danger', color: 'var(--color-danger)' },
  good: { variant: 'good', color: 'var(--color-good)' },
  normal: { variant: 'info', color: 'var(--color-info)' },
  warning: { variant: 'warning', color: 'var(--color-warning)' },
  danger: { variant: 'danger', color: 'var(--color-danger)' },
};

export default function StatusHistory({ logs = [] }) {
  const entries = logs
    .filter((l) => l.aiStatus)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  if (entries.length === 0) return null;

  return (
    <div className="status-history">
      <span className="section-title">상태 변화</span>
      <div className="status-timeline">
        {entries.map((entry, i) => {
          const info = STATUS_MAP[entry.aiStatus] || STATUS_MAP.normal;
          const statusLabel = typeof entry.aiStatus === 'string'
            ? entry.aiStatus
            : info?.variant || '보통';

          return (
            <div key={entry.id || i} className="status-timeline-item">
              <div className="status-timeline-dot-wrap">
                <span className={`status-timeline-dot status-dot-${info.variant}`} />
                {i < entries.length - 1 && (
                  <span className="status-timeline-line" />
                )}
              </div>
              <div className="status-timeline-content">
                <div className="status-timeline-header">
                  <span className="status-timeline-date">{entry.date}</span>
                  <Badge variant={info.variant}>{statusLabel}</Badge>
                </div>
                {entry.aiAnalysis && (
                  <p className="status-timeline-text">
                    {entry.aiAnalysis.length > 80
                      ? entry.aiAnalysis.slice(0, 80) + '...'
                      : entry.aiAnalysis}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
