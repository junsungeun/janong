import React, { useState, useMemo } from 'react';
import { useList } from '../../hooks/useList';
import { TABLES, photoStorage } from '../../services/dbService';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import MiniCalendar from '../ui/MiniCalendar';
import PhotoTimelapse from './PhotoTimelapse';
import GrowthChart from './GrowthChart';
import StatusHistory from './StatusHistory';

export default function DashboardTab() {
  const { items: crops, loading: cropsLoading } = useList(TABLES.CROP);
  const { items: allLogs, loading: logsLoading } = useList(TABLES.DAILY_LOG);
  const [selectedCropId, setSelectedCropId] = useState(null);

  const loading = cropsLoading || logsLoading;
  const activeCropId = selectedCropId || (crops.length > 0 ? crops[0].id : null);

  const filteredLogs = useMemo(() => {
    if (!activeCropId) return [];
    return allLogs.filter((l) => l.cropId === activeCropId);
  }, [allLogs, activeCropId]);

  const logDates = useMemo(() => {
    return [...new Set(filteredLogs.map((l) => l.date).filter(Boolean))];
  }, [filteredLogs]);

  if (loading) return <Spinner />;

  return (
    <div className="dashboard-tab">
      <div className="page-header">
        <h2 className="page-title">성장 추적</h2>
        <p className="page-subtitle">작물별 생육 현황을 확인하세요</p>
      </div>

      {/* Horizontal scroll pill selector */}
      {crops.length > 0 && (
        <div className="dash-crop-chips">
          {crops.map((crop) => (
            <button
              key={crop.id}
              className={`dash-crop-chip ${activeCropId === crop.id ? 'active' : ''}`}
              onClick={() => setSelectedCropId(crop.id)}
            >
              {crop.name}
            </button>
          ))}
        </div>
      )}

      {/* Empty states */}
      {crops.length === 0 ? (
        <EmptyState
          title="등록된 작물이 없습니다"
          description="설정에서 작물을 등록하면 성장 추적을 시작할 수 있습니다."
        />
      ) : !activeCropId ? (
        <EmptyState
          title="작물을 선택하세요"
          description="위에서 확인할 작물을 선택해 주세요."
        />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          title="기록이 없습니다"
          description="이 작물에 대한 기록을 추가해 보세요."
        />
      ) : (
        <div className="dash-content">
          {/* Section: Photo timeline */}
          <div className="dash-section">
            <PhotoTimelapse
              logs={filteredLogs}
              getPhotoUrl={photoStorage.getUrl}
            />
          </div>

          {/* Divider */}
          <div className="dash-divider" />

          {/* Section: Growth chart */}
          <div className="dash-section">
            <GrowthChart logs={filteredLogs} />
          </div>

          {/* Divider */}
          <div className="dash-divider" />

          {/* Section: Status history */}
          <div className="dash-section">
            <StatusHistory logs={filteredLogs} />
          </div>

          {/* Divider */}
          <div className="dash-divider" />

          {/* Section: Calendar */}
          <div className="dash-section">
            <span className="section-title">기록 달력</span>
            <MiniCalendar logDates={logDates} />
          </div>
        </div>
      )}
    </div>
  );
}
