import React from 'react';
import { GROWTH_STAGES } from '../../constants';
import { photoStorage } from '../../services/dbService';

function formatDate(d) {
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length >= 3) return `${Number(parts[1])}.${Number(parts[2])}`;
  const date = new Date(d + 'T00:00:00');
  return `${date.getMonth() + 1}.${date.getDate()}`;
}

function weekday(d) {
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length >= 3) {
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  }
  return ['일', '월', '화', '수', '목', '금', '토'][new Date(d + 'T00:00:00').getDay()];
}

export default function TimelineView({ logs, cropMap }) {
  if (!logs || logs.length === 0) {
    return <p className="text-sm text-muted" style={{ textAlign: 'center', padding: '40px 0' }}>기록이 없습니다</p>;
  }

  // Group by date
  const grouped = {};
  logs.forEach((log) => {
    const d = log.date || 'unknown';
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(log);
  });

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="timeline">
      {dates.map((date) => (
        <div key={date} className="timeline-day">
          <div className="timeline-date-bar">
            <span className="timeline-date">{formatDate(date)}</span>
            <span className="timeline-weekday">{weekday(date)}</span>
          </div>
          <div className="timeline-entries">
            {grouped[date].map((log) => {
              const stage = GROWTH_STAGES.find((s) => s.value === log.stage);
              const thumb = log.photos?.[0] ? photoStorage.getUrl(log.photos[0]) : null;
              return (
                <div key={log.id} className="timeline-entry">
                  <div className="timeline-dot-line">
                    <span className="timeline-dot" />
                    <span className="timeline-line" />
                  </div>
                  <div className="timeline-card">
                    {thumb && <img src={thumb} alt="" className="timeline-thumb" loading="lazy" />}
                    <div className="timeline-card-body">
                      <div className="timeline-card-top">
                        <span className="timeline-crop">{cropMap[log.cropId] || '-'}</span>
                        {stage && <span className="timeline-stage">{stage.icon} {stage.label}</span>}
                      </div>
                      {log.memo && <p className="timeline-memo">{log.memo}</p>}
                      <div className="timeline-data">
                        {(log.houseTemp ?? log.temperature) != null && <span>{log.houseTemp ?? log.temperature}°C</span>}
                        {log.heightCm != null && <span>키 {log.heightCm}cm</span>}
                        {log.leafCount != null && <span>잎 {log.leafCount}장</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
