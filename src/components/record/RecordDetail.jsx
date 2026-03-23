import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { photoStorage } from '../../services/dbService';

const statusVariant = {
  '좋음': 'good',
  '보통': 'info',
  '주의': 'warning',
};

export default function RecordDetail({ log, cropName, onEdit, onDelete, onClose }) {
  if (!log) return null;

  const photos = (log.photos || []).map((p) => photoStorage.getUrl(p));

  return (
    <div className="record-detail page-slide-in">
      <div className="record-detail-top">
        <Button variant="ghost" onClick={onClose}>목록으로</Button>
        <div className="record-detail-actions">
          <Button variant="secondary" size="sm" onClick={() => onEdit?.(log)}>
            수정
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete?.(log)}>
            삭제
          </Button>
        </div>
      </div>

      {/* Photos */}
      {photos.length > 0 && (
        <div className="record-detail-photos">
          {photos.map((url, i) => (
            <img key={i} src={url} alt={`사진 ${i + 1}`} className="record-detail-photo" />
          ))}
        </div>
      )}

      {/* Header info */}
      <Card className="record-detail-card">
        <div className="record-detail-row">
          <span className="record-detail-label">날짜</span>
          <span>{log.date}</span>
        </div>
        <div className="record-detail-row">
          <span className="record-detail-label">작물</span>
          <span>{cropName || '-'}</span>
        </div>
        {log.aiStatus && (
          <div className="record-detail-row">
            <span className="record-detail-label">AI 상태</span>
            <Badge variant={statusVariant[log.aiStatus] || 'info'}>{log.aiStatus}</Badge>
          </div>
        )}
      </Card>

      {/* Environment */}
      {(log.temperature != null || log.humidity != null || log.weather) && (
        <Card className="record-detail-card">
          <p className="record-detail-section-title">환경 데이터</p>
          <div className="record-detail-env-grid">
            {log.temperature != null && (
              <div className="record-detail-env-item">
                <span className="record-detail-env-val">{log.temperature}°C</span>
                <span className="record-detail-env-label">온도</span>
              </div>
            )}
            {log.humidity != null && (
              <div className="record-detail-env-item">
                <span className="record-detail-env-val">{log.humidity}%</span>
                <span className="record-detail-env-label">습도</span>
              </div>
            )}
            {log.weather && (
              <div className="record-detail-env-item">
                <span className="record-detail-env-val">{log.weather}</span>
                <span className="record-detail-env-label">날씨</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Growth */}
      {(log.heightCm || log.leafCount || log.stemMm) && (
        <Card className="record-detail-card">
          <p className="record-detail-section-title">생장 데이터</p>
          <div className="record-detail-env-grid">
            {log.heightCm != null && (
              <div className="record-detail-env-item">
                <span className="record-detail-env-val">{log.heightCm} cm</span>
                <span className="record-detail-env-label">키</span>
              </div>
            )}
            {log.leafCount != null && (
              <div className="record-detail-env-item">
                <span className="record-detail-env-val">{log.leafCount}</span>
                <span className="record-detail-env-label">잎 수</span>
              </div>
            )}
            {log.stemMm != null && (
              <div className="record-detail-env-item">
                <span className="record-detail-env-val">{log.stemMm} mm</span>
                <span className="record-detail-env-label">줄기</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* AI Analysis */}
      {log.aiAnalysis && (
        <Card variant="highlight" className="record-detail-card">
          <p className="record-detail-section-title">AI 분석</p>
          <p className="record-detail-text">{log.aiAnalysis}</p>
        </Card>
      )}

      {/* Memo */}
      {log.memo && (
        <Card className="record-detail-card">
          <p className="record-detail-section-title">메모</p>
          <p className="record-detail-text">{log.memo}</p>
        </Card>
      )}
    </div>
  );
}
