import React, { useState, useMemo, useEffect } from 'react';
import { db, TABLES, photoStorage } from '../../services/dbService';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import MiniCalendar from '../ui/MiniCalendar';
import PhotoTimelapse from './PhotoTimelapse';
import GrowthChart from './GrowthChart';
import ExportButton from '../record/ExportButton';

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
  const [crops, setCrops] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCropId, setSelectedCropId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [c, l] = await Promise.all([
        db.getAllList(TABLES.CROP),
        db.getAllList(TABLES.DAILY_LOG),
      ]);
      setCrops(c);
      setAllLogs(l);
      setLoading(false);
    };
    load();
  }, []);

  const activeCropId = selectedCropId || (crops.length > 0 ? crops[0].id : null);

  const cropMap = useMemo(() => {
    const m = {};
    crops.forEach((c) => { m[c.id] = c.name; });
    return m;
  }, [crops]);

  const filteredLogs = useMemo(() => {
    if (!activeCropId) return [];
    return allLogs.filter((l) => l.cropId === activeCropId);
  }, [allLogs, activeCropId]);

  const logDates = useMemo(() => {
    return [...new Set(filteredLogs.map((l) => l.date).filter(Boolean))];
  }, [filteredLogs]);

  const logsForExport = useMemo(() => {
    const target = selectedCropId ? filteredLogs : allLogs;
    return target.map((l) => ({ ...l, cropName: cropMap[l.cropId] || '' }));
  }, [selectedCropId, filteredLogs, allLogs, cropMap]);

  if (loading) return <Spinner />;

  if (crops.length === 0) {
    return (
      <div className="dashboard-tab">
        <div className="page-header">
          <h2 className="page-title">전체 현황</h2>
          <p className="page-subtitle">팀 전체 작물 데이터</p>
        </div>
        <EmptyState
          icon={SeedlingIcon}
          title="등록된 작물이 없습니다"
          description="작물을 등록하면 전체 현황을 볼 수 있습니다."
        />
      </div>
    );
  }

  return (
    <div className="dashboard-tab">
      <div className="page-header">
        <div className="dash-header-row">
          <div>
            <h2 className="page-title">전체 현황</h2>
            <p className="page-subtitle">팀 전체 작물 데이터 · {allLogs.length}건</p>
          </div>
          <ExportButton
            logs={logsForExport}
            cropName={selectedCropId ? cropMap[selectedCropId] || '' : '전체'}
          />
        </div>
      </div>

      <div className="dash-crop-chips">
        <button
          className={`dash-crop-chip ${!selectedCropId ? 'active' : ''}`}
          onClick={() => setSelectedCropId(null)}
        >
          전체
        </button>
        {crops.map((crop) => (
          <button
            key={crop.id}
            className={`dash-crop-chip ${activeCropId === crop.id && selectedCropId ? 'active' : ''}`}
            onClick={() => setSelectedCropId(crop.id)}
          >
            {crop.name}
          </button>
        ))}
      </div>

      {filteredLogs.length === 0 && selectedCropId ? (
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
