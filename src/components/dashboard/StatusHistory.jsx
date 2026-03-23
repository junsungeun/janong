import React from 'react';
import Badge from '../ui/Badge';

const STATUS_MAP = {
  good: { label: '좋음', variant: 'good' },
  normal: { label: '보통', variant: 'info' },
  warning: { label: '주의', variant: 'warning' },
  danger: { label: '위험', variant: 'danger' },
};

export default function StatusHistory({ logs = [] }) {
  // Filter logs with ai_status, most recent first
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
          return (
            <div key={entry.id || i} className="status-timeline-item">
              <div className="status-timeline-dot-wrap">
                <span className={`status-timeline-dot status-dot-${info.variant}`} />
                {i < entries.length - 1 && <span className="status-timeline-line" />}
              </div>
              <div className="status-timeline-content">
                <div className="status-timeline-header">
                  <span className="status-timeline-date">{entry.date}</span>
                  <Badge variant={info.variant}>{info.label}</Badge>
                </div>
                {entry.aiSummary && (
                  <p className="status-timeline-text">{entry.aiSummary}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
