import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { photoStorage } from '../../services/dbService';
import { GROWTH_STAGES } from '../../constants';

function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length >= 3) return `${Number(parts[1])}.${Number(parts[2])}`;
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

export default function RecordItem({ log, cropName, onView, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const thumbUrl = log.photos?.[0]
    ? photoStorage.getUrl(log.photos[0])
    : null;

  return (
    <Card className="record-item" onClick={() => setExpanded(!expanded)}>
      <div className="record-item-header">
        {thumbUrl ? (
          <div className="record-item-thumb">
            <img src={thumbUrl} alt="" loading="lazy" />
          </div>
        ) : (
          <div className="record-item-thumb-empty">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
        )}

        <div className="record-item-info">
          <div className="record-item-top">
            <span className="record-item-date">{formatShortDate(log.date)}</span>
            {log.stage && (() => { const s = GROWTH_STAGES.find(s => s.value === log.stage); return s ? <Badge variant="good">{s.icon} {s.label}</Badge> : null; })()}
          </div>
          <span className="record-item-crop">{cropName || '작물 미지정'}</span>
          <div className="record-item-badges">
            {(log.houseTemp ?? log.temperature) != null && (
              <Badge variant="info">{(log.houseTemp ?? log.temperature)}&deg;C</Badge>
            )}
            {(log.houseHumidity ?? log.humidity) != null && (
              <Badge variant="info">{(log.houseHumidity ?? log.humidity)}%</Badge>
            )}
          </div>
        </div>

        <div className="record-item-chevron">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      <div className={`record-item-expand ${expanded ? 'open' : ''}`}>
        <div className="record-item-expand-inner">
          {log.memo && (
            <p className="record-item-memo">{log.memo}</p>
          )}
          <div className="record-item-actions">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onView?.(log); }}>
              상세보기
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete?.(log); }}>
              삭제
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
