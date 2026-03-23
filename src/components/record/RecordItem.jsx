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
      className={`record-item ${expanded ? 'record-item-expanded' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="record-item-header">
        {thumbUrl && (
          <div className="record-item-thumb">
            <img src={thumbUrl} alt="" loading="lazy" />
          </div>
        )}
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
          <div className="record-item-meta">
            {log.temperature != null && (
              <span className="record-item-env">{log.temperature}°C</span>
            )}
            {log.humidity != null && (
              <span className="record-item-env">{log.humidity}%</span>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="record-item-detail">
          {log.aiAnalysis && (
            <p className="record-item-analysis">{log.aiAnalysis}</p>
          )}
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
      )}
    </Card>
  );
}
