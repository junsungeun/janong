import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { ChevronRight } from 'lucide-react';

export default function CropCard({ crop, logCount = 0, lastLog, onClick }) {
  const { name, variety, plantingDate, lastAiStatus } = crop;
  const daysSincePlanting = plantingDate
    ? Math.floor((Date.now() - new Date(plantingDate)) / 86400000)
    : null;

  const statusClass = lastAiStatus
    ? `crop-card--status-${lastAiStatus}`
    : '';

  return (
    <Card onClick={onClick} className={`crop-card ${statusClass}`}>
      <div className="crop-card-top">
        <div className="crop-card-body">
          <div className="crop-card-header">
            <span className="crop-card-name">{name}</span>
            {variety && <Badge variant="info">{variety}</Badge>}
          </div>
          <div className="crop-card-meta">
            <span className="crop-card-stat">
              기록 <strong>{logCount}</strong>건
            </span>
            {lastLog && (
              <span className="crop-card-stat crop-card-last">
                최근 {lastLog}
              </span>
            )}
          </div>
        </div>
        <div className="crop-card-right">
          {daysSincePlanting !== null && (
            <div className="crop-card-days">
              <span className="crop-card-days-num">{daysSincePlanting}</span>
              <span className="crop-card-days-label">일째</span>
            </div>
          )}
          <ChevronRight size={18} className="crop-card-chevron" />
        </div>
      </div>
    </Card>
  );
}
