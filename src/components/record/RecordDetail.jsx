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
      {/* Top navigation */}
      <div className="record-detail-top">
        <Button variant="ghost" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5m7-7l-7 7 7 7"/>
          </svg>
          목록
        </Button>
      </div>

      {/* Photo gallery with snap scroll */}
      {photos.length > 0 && (
        <>
          <div className="record-detail-gallery">
            {photos.map((url, i) => (
              <div key={i} className="record-detail-gallery-item">
                <img
                  src={url}
                  alt={`사진 ${i + 1}`}
                  className="record-detail-photo"
                />
              </div>
            ))}
          </div>
          {photos.length > 1 && (
            <p className="record-detail-photo-count">
              {photos.length}장의 사진
            </p>
          )}
        </>
      )}

      {/* Basic info card */}
      <Card className="record-detail-card">
        <div className="record-detail-row">
          <span className="record-detail-label">날짜</span>
          <span className="record-detail-value">{log.date}</span>
        </div>
        <div className="record-detail-row">
          <span className="record-detail-label">작물</span>
          <span className="record-detail-value">{cropName || '-'}</span>
        </div>
        {log.aiStatus && (
          <div className="record-detail-row">
            <span className="record-detail-label">AI 상태</span>
            <Badge variant={statusVariant[log.aiStatus] || 'info'}>
              {log.aiStatus}
            </Badge>
          </div>
        )}
      </Card>

      {/* Environment data */}
      {(log.temperature != null || log.humidity != null || log.weather) && (
        <Card className="record-detail-card">
          <p className="record-detail-section-title">환경 데이터</p>
          <div className="record-detail-env-grid">
            {log.temperature != null && (
              <div className="record-detail-env-item">
                <span className="record-detail-env-val">
                  {log.temperature}&deg;C
                </span>
                <span className="record-detail-env-label">온도</span>
              </div>
            )}
            {log.humidity != null && (
              <div className="record-detail-env-item">
                <span className="record-detail-env-val">
                  {log.humidity}%
                </span>
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

      {/* Growth data */}
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

      {/* AI Analysis highlight card */}
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

      {/* Bottom action buttons */}
      <div className="record-detail-bottom">
        <Button
          variant="secondary"
          onClick={() => onEdit?.(log)}
        >
          수정
        </Button>
        <Button
          variant="danger"
          onClick={() => onDelete?.(log)}
        >
          삭제
        </Button>
      </div>
    </div>
  );
}
