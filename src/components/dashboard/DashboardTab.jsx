import React, { useState, useMemo } from 'react';
import { useList } from '../../hooks/useList';
import { TABLES, photoStorage } from '../../services/dbService';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import MiniCalendar from '../ui/MiniCalendar';
import PhotoTimelapse from './PhotoTimelapse';
import GrowthChart from './GrowthChart';

function SeedlingIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5">
      <path d="M7 20h10" strokeLinecap="round" />
      <path d="M12 20v-8" strokeLinecap="round" />
      <path d="M12 12C12 8 16 6 16 2c-3 0-4 4-4 4" />
      <path d="M12 12C12 8 8 6 8 2c3 0 4 4 4 4" />
    </svg>
  );
}

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

  if (crops.length === 0) {
    return (
      <div className="dashboard-tab">
        <div className="page-header">
          <h2 className="page-title">성장 추적</h2>
          <p className="page-subtitle">작물별 생육 현황을 확인하세요</p>
        </div>
        <EmptyState
          icon={SeedlingIcon}
          title="작물을 먼저 등록해주세요"
          description="설정 탭에서 작물을 등록하면 성장 추적을 시작할 수 있습니다."
        />
      </div>
    );
  }

  return (
    <div className="dashboard-tab">
      <div className="page-header">
        <h2 className="page-title">성장 추적</h2>
        <p className="page-subtitle">작물별 생육 현황을 확인하세요</p>
      </div>

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

      {filteredLogs.length === 0 ? (
        <EmptyState
          title="기록이 없습니다"
          description="이 작물에 대한 기록을 추가해 보세요."
        />
      ) : (
        <div className="dash-content">
          <div className="dash-section">
            <h3 className="dash-section-header">사진 타임랩스</h3>
            <PhotoTimelapse logs={filteredLogs} getPhotoUrl={photoStorage.getUrl} />
          </div>

          <div className="dash-divider" />

          <div className="dash-section">
            <h3 className="dash-section-header">생육 데이터</h3>
            <GrowthChart logs={filteredLogs} />
          </div>

          <div className="dash-divider" />

          <div className="dash-section">
            <h3 className="dash-section-header">기록 달력</h3>
            <MiniCalendar logDates={logDates} />
          </div>
        </div>
      )}
    </div>
  );
}
