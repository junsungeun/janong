import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Thermometer, Droplets, Cloud, Ruler, Leaf, Circle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { photoStorage } from '../../services/dbService';
import { GROWTH_STAGES } from '../../constants';

export default function RecordDetail({ log, cropName, onEdit, onDelete, onClose }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const galleryRef = useRef(null);

  const photos = (log?.photos || []).map((p) => photoStorage.getUrl(p));

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    const handleScroll = () => {
      const idx = Math.round(el.scrollLeft / el.offsetWidth);
      setActivePhoto(idx);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [photos.length]);

  if (!log) return null;

  return (
    <div className="record-detail page-slide-in">
      <div className="record-detail-top">
        <button className="record-detail-back-btn" onClick={onClose}>
          <ArrowLeft size={18} />
          <span>목록</span>
        </button>
      </div>

      {photos.length > 0 && (
        <div className="record-detail-gallery-wrap">
          <div className="record-detail-gallery" ref={galleryRef}>
            {photos.map((url, i) => (
              <div key={i} className="record-detail-gallery-item">
                <img src={url} alt={`사진 ${i + 1}`} className="record-detail-photo" />
              </div>
            ))}
          </div>
          {photos.length > 1 && (
            <div className="record-detail-dots">
              {photos.map((_, i) => (
                <span key={i} className={`record-detail-dot ${i === activePhoto ? 'active' : ''}`} />
              ))}
            </div>
          )}
        </div>
      )}

      <Card className="record-detail-card">
        <div className="record-detail-row">
          <span className="record-detail-label">날짜</span>
          <span className="record-detail-value">{log.date}</span>
        </div>
        <div className="record-detail-row">
          <span className="record-detail-label">작물</span>
          <span className="record-detail-value">{cropName || '-'}</span>
        </div>
        {log.stage && (
          <div className="record-detail-row">
            <span className="record-detail-label">재배 단계</span>
            <span className="record-detail-value">
              {(() => { const s = GROWTH_STAGES.find(s => s.value === log.stage); return s ? `${s.icon} ${s.label}` : log.stage; })()}
            </span>
          </div>
        )}
      </Card>

      {((log.houseTemp ?? log.temperature) != null || (log.houseHumidity ?? log.humidity) != null || log.weather) && (
        <Card className="record-detail-card">
          <p className="record-detail-section-title">환경 데이터</p>
          <div className="record-detail-env-grid">
            {(log.houseTemp ?? log.temperature) != null && (
              <div className="record-detail-env-item">
                <Thermometer size={16} className="record-detail-env-icon" />
                <span className="record-detail-env-val">{(log.houseTemp ?? log.temperature)}&deg;C</span>
                <span className="record-detail-env-label">온도</span>
              </div>
            )}
            {(log.houseHumidity ?? log.humidity) != null && (
              <div className="record-detail-env-item">
                <Droplets size={16} className="record-detail-env-icon" />
                <span className="record-detail-env-val">{(log.houseHumidity ?? log.humidity)}%</span>
                <span className="record-detail-env-label">습도</span>
              </div>
            )}
            {log.weather && (
              <div className="record-detail-env-item">
                <Cloud size={16} className="record-detail-env-icon" />
                <span className="record-detail-env-val">{log.weather}</span>
                <span className="record-detail-env-label">날씨</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {(log.heightCm || log.leafCount || log.stemMm) && (
        <Card className="record-detail-card">
          <p className="record-detail-section-title">생장 데이터</p>
          <div className="record-detail-env-grid">
            {log.heightCm != null && (
              <div className="record-detail-env-item">
                <Ruler size={16} className="record-detail-env-icon" />
                <span className="record-detail-env-val">{log.heightCm} cm</span>
                <span className="record-detail-env-label">키</span>
              </div>
            )}
            {log.leafCount != null && (
              <div className="record-detail-env-item">
                <Leaf size={16} className="record-detail-env-icon" />
                <span className="record-detail-env-val">{log.leafCount}</span>
                <span className="record-detail-env-label">잎 수</span>
              </div>
            )}
            {log.stemMm != null && (
              <div className="record-detail-env-item">
                <Circle size={16} className="record-detail-env-icon" />
                <span className="record-detail-env-val">{log.stemMm} mm</span>
                <span className="record-detail-env-label">줄기</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {log.memo && (
        <Card className="record-detail-card">
          <p className="record-detail-section-title">메모</p>
          <p className="record-detail-text">{log.memo}</p>
        </Card>
      )}

      <div className="record-detail-bottom">
        <Button variant="secondary" onClick={() => onEdit?.(log)}>수정</Button>
        <Button variant="danger" onClick={() => setConfirmDelete(true)}>삭제</Button>
      </div>

      {confirmDelete && (
        <Modal
          message="이 기록을 정말 삭제하시겠습니까? 삭제된 기록은 복구할 수 없습니다."
          confirmLabel="삭제"
          danger
          onConfirm={() => { setConfirmDelete(false); onDelete?.(log); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
