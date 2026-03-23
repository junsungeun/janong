import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

export default function CropCard({ crop, logCount = 0, lastLog, onClick }) {
  const { name, variety, plantingDate } = crop;
  const daysSincePlanting = plantingDate
    ? Math.floor((Date.now() - new Date(plantingDate)) / 86400000)
    : null;

  return (
    <Card onClick={onClick} className="crop-card">
      <div className="crop-card-header">
        <span className="crop-card-name">{name}</span>
        {variety && <Badge variant="info">{variety}</Badge>}
      </div>
      <div className="crop-card-meta">
        {daysSincePlanting !== null && (
          <span className="crop-card-stat">
            재배 <strong>{daysSincePlanting}</strong>일
          </span>
        )}
        <span className="crop-card-stat">
          기록 <strong>{logCount}</strong>건
        </span>
        {lastLog && (
          <span className="crop-card-stat crop-card-last">
            최근 {lastLog}
          </span>
        )}
      </div>
    </Card>
  );
}
