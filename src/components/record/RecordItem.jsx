import React, { useState } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { photoStorage } from '../../services/dbService';

const statusVariant = {
  '좋음': 'good',
  '보통': 'info',
  '주의': 'warning',
};

export default function RecordItem({ log, cropName, onView, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const thumbUrl = log.photos?.[0]
    ? photoStorage.getUrl(log.photos[0])
    : null;

  return (
    <Card
      className="record-item"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="record-item-header">
        {/* Thumbnail or placeholder */}
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

        {/* Info section */}
        <div className="record-item-info">
          <div className="record-item-top">
            <span className="record-item-date">{log.date}</span>
            {log.aiStatus && (
              <Badge variant={statusVariant[log.aiStatus] || 'info'}>
                {log.aiStatus}
              </Badge>
            )}
          </div>
          <span className="record-item-crop">{cropName || '작물 미지정'}</span>

          {/* Temperature/humidity badges */}
          <div className="record-item-badges">
            {log.temperature != null && (
              <Badge variant="info">{log.temperature}&deg;C</Badge>
            )}
            {log.humidity != null && (
              <Badge variant="info">{log.humidity}%</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Expandable detail with smooth animation */}
      <div className={`record-item-expand ${expanded ? 'open' : ''}`}>
        <div className="record-item-expand-inner">
          {log.aiAnalysis && (
            <p className="record-item-analysis">{log.aiAnalysis}</p>
          )}
          {log.memo && (
            <p className="record-item-memo">{log.memo}</p>
          )}
          <div className="record-item-actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onView?.(log); }}
            >
              상세보기
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onDelete?.(log); }}
            >
              삭제
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
