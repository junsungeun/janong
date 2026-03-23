import React, { useMemo, useState } from 'react';
import { useList } from '../../hooks/useList';
import { TABLES } from '../../services/dbService';
import { getCurrentSolarTerm, formatDate } from '../../utils/solarTerms';
import { getTodayVerse } from '../../data/bibleVerses';
import Button from '../ui/Button';
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
        <div className="home-verse-card">
          <p className="home-verse">
            {verse.text}
            <span className="home-verse-ref">{verse.ref}</span>
          </p>
        </div>
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
          <div className="home-empty-crops">
            <span className="home-empty-crops-icon" aria-hidden="true">&#127807;</span>
            <p className="home-empty-crops-title">아직 등록된 작물이 없어요</p>
            <p className="home-empty-crops-desc">
              작물을 등록하고 매일의 성장을<br />기록해보세요.
            </p>
          </div>
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
        <button
          className="btn-terra home-record-btn"
          onClick={() => onNavigate?.('record')}
        >
          기록하기
        </button>
      </div>

      {/* Crop Manager Modal */}
      {showCropManager && (
        <div className="modal-overlay" onClick={() => { setShowCropManager(false); reloadCrops(); }}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
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
