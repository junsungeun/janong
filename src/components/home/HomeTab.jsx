import React, { useMemo, useState } from 'react';
import { useList } from '../../hooks/useList';
import { TABLES } from '../../services/dbService';
import { getCurrentSolarTerm, formatDate } from '../../utils/solarTerms';
import { getTodayVerse } from '../../data/bibleVerses';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import WeatherCard from './WeatherCard';
import CropCard from './CropCard';
import MiniCalendar from '../ui/MiniCalendar';
import CropManager from '../settings/CropManager';
import { Plus } from 'lucide-react';

export default function HomeTab({ onNavigate }) {
  const { items: crops, loading: cropsLoading, reload: reloadCrops } = useList(TABLES.CROP);
  const { items: logs, loading: logsLoading } = useList(TABLES.DAILY_LOG);
  const [showCropManager, setShowCropManager] = useState(false);

  const dateInfo = formatDate();
  const solarTerm = getCurrentSolarTerm();
  const verse = getTodayVerse();

  // Compute per-crop stats from logs
  const cropStats = useMemo(() => {
    const map = {};
    (logs || []).forEach((log) => {
      const id = log.cropId;
      if (!map[id]) map[id] = { count: 0, lastDate: null };
      map[id].count += 1;
      if (!map[id].lastDate || log.date > map[id].lastDate) {
        map[id].lastDate = log.date;
      }
    });
    return map;
  }, [logs]);

  // Collect unique log dates for mini calendar
  const logDates = useMemo(() => {
    return [...new Set((logs || []).map((l) => l.date).filter(Boolean))];
  }, [logs]);

  return (
    <div className="home-tab">
      {/* Date + Solar Term */}
      <div className="home-date-section">
        <h1 className="home-date">
          {dateInfo.month}월 {dateInfo.day}일 {dateInfo.weekday}요일
        </h1>
        {solarTerm && (
          <span className="home-solar-term">{solarTerm}</span>
        )}
      </div>

      {/* Bible verse */}
      {verse && (
        <p className="home-verse">
          {verse.text}
          <span className="home-verse-ref"> - {verse.ref}</span>
        </p>
      )}

      {/* Weather */}
      <WeatherCard />

      {/* Crop List */}
      <div className="home-section">
        <div className="section-header">
          <span className="section-title">내 작물</span>
          <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => setShowCropManager(true)}>
            작물 등록
          </Button>
        </div>

        {cropsLoading ? (
          <Spinner />
        ) : crops.length === 0 ? (
          <EmptyState
            title="등록된 작물이 없습니다"
            description="작물을 등록하고 재배 기록을 시작하세요."
          />
        ) : (
          <div className="home-crop-list">
            {crops.map((crop) => {
              const stats = cropStats[crop.id] || {};
              return (
                <CropCard
                  key={crop.id}
                  crop={crop}
                  logCount={stats.count || 0}
                  lastLog={stats.lastDate}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Mini Calendar */}
      <div className="home-section">
        <div className="section-header">
          <span className="section-title">기록 달력</span>
        </div>
        {logsLoading ? <Spinner /> : <MiniCalendar logDates={logDates} />}
      </div>

      {/* Quick Record Button */}
      <div className="home-record-btn-wrap">
        <Button
          variant="primary"
          className="home-record-btn"
          onClick={() => onNavigate?.('record')}
        >
          기록하기
        </Button>
      </div>

      {/* Crop Manager Modal */}
      {showCropManager && (
        <div className="modal-overlay" onClick={() => { setShowCropManager(false); reloadCrops(); }}>
          <div className="modal-content card" style={{ maxHeight: '80vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <CropManager />
            <div className="form-actions" style={{ marginTop: '16px' }}>
              <Button variant="secondary" onClick={() => { setShowCropManager(false); reloadCrops(); }}>닫기</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
