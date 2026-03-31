import React, { useState, useMemo } from 'react';
import { ChevronLeft, Pencil } from 'lucide-react';
import { useList } from '../../hooks/useList';
import { TABLES } from '../../services/dbService';
import { GROWTH_STAGES } from '../../constants';
import Badge from '../ui/Badge';
import CropTasks from './CropTasks';
import CropQRCode from './CropQRCode';
import RecordItem from '../record/RecordItem';

export default function CropDetailPage({ crop, onClose, onViewLog, onDeleteLog }) {
  const [activeTab, setActiveTab] = useState('tasks');
  const { items: logs } = useList(TABLES.DAILY_LOG, { cropId: crop?.id });
  if (!crop) return null;

  const daysSincePlanting = crop.plantingDate
    ? Math.floor((Date.now() - new Date(crop.plantingDate)) / 86400000)
    : null;

  const lastLog = logs[0];
  const lastStage = GROWTH_STAGES.find((s) => s.value === lastLog?.stage);

  return (
    <div className="crop-detail-page page-slide-in">
      {/* Header */}
      <div className="crop-detail-header">
        <button className="record-form-back" onClick={onClose}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <div className="crop-detail-title-row">
            {crop.category && <Badge variant="info">{crop.category}</Badge>}
            <h2 className="crop-detail-name">{crop.name}</h2>
          </div>
          {crop.variety && <p className="crop-detail-variety">{crop.variety}</p>}
          <div className="crop-detail-meta">
            {crop.plantingDate && <span>{crop.startType || '재배 시작'} {crop.plantingDate}</span>}
            {daysSincePlanting != null && <span>{daysSincePlanting}일째</span>}
            {lastStage && <span>{lastStage.icon} {lastStage.label}</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="underline-tab-bar">
        <button className={`underline-tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
          세부 계획
        </button>
        <button className={`underline-tab-btn ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
          기록 {logs.length > 0 && <span style={{ marginLeft: 4 }}>{logs.length}</span>}
        </button>
        <button className={`underline-tab-btn ${activeTab === 'qr' ? 'active' : ''}`} onClick={() => setActiveTab('qr')}>
          QR
        </button>
      </div>

      {activeTab === 'tasks' ? (
        <CropTasks cropId={crop.id} />
      ) : activeTab === 'qr' ? (
        <CropQRCode crop={crop} />
      ) : (
        <div className="crop-detail-logs">
          {logs.length === 0 ? (
            <p className="text-sm text-muted" style={{ textAlign: 'center', padding: '40px 0' }}>
              아직 기록이 없습니다
            </p>
          ) : (
            <div className="record-list">
              {logs.map((log) => (
                <RecordItem
                  key={log.id}
                  log={log}
                  cropName={crop.name}
                  onView={() => onViewLog?.(log)}
                  onDelete={() => onDeleteLog?.(log)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
