import React, { useMemo, useState, useCallback } from 'react';
import { useList } from '../../hooks/useList';
import { db, TABLES } from '../../services/dbService';
import { getCurrentSolarTerm, formatDate } from '../../utils/solarTerms';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import Modal from '../ui/Modal';
import WeatherCard from './WeatherCard';
import CropCard from './CropCard';
import MiniCalendar from '../ui/MiniCalendar';
import CropManager from '../settings/CropManager';
import CropDetailPage from '../crop/CropDetailPage';
import { Plus, Sprout } from 'lucide-react';
import { Field, Input } from '../ui/Input';

export default function HomeTab({ onNavigate }) {
  const { items: crops, loading: cropsLoading, reload: reloadCrops } = useList(TABLES.CROP);
  const { items: logs, loading: logsLoading } = useList(TABLES.DAILY_LOG);
  const [showCropManager, setShowCropManager] = useState(false);
  const [editCrop, setEditCrop] = useState(null);
  const [deleteCrop, setDeleteCrop] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [detailCrop, setDetailCrop] = useState(null);

  const dateInfo = formatDate();
  const solarTerm = getCurrentSolarTerm();

  const closeCropManager = useCallback(() => {
    setShowCropManager(false);
    reloadCrops();
  }, [reloadCrops]);

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

  const logDates = useMemo(() => {
    return [...new Set((logs || []).map((l) => l.date).filter(Boolean))];
  }, [logs]);

  const cropMap = useMemo(() => {
    const m = {};
    crops.forEach((c) => { m[c.id] = c.name; });
    return m;
  }, [crops]);

  const dateLogs = useMemo(() => {
    if (!selectedDate) return [];
    return (logs || []).filter((l) => l.date === selectedDate);
  }, [logs, selectedDate]);

  const handleCropClick = (crop) => {
    setDetailCrop(crop);
  };

  const handleEditCrop = (crop) => {
    setEditCrop({ ...crop });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editCrop?.name?.trim()) return;
    try {
      await db.update(TABLES.CROP, editCrop.id, {
        name: editCrop.name,
        variety: editCrop.variety,
        plantingDate: editCrop.plantingDate,
        section: editCrop.section,
      });
      setEditCrop(null);
      reloadCrops();
    } catch (err) { console.error(err); }
  };

  const handleDeleteCrop = async () => {
    if (!deleteCrop) return;
    try {
      await db.delete(TABLES.CROP, deleteCrop.id);
      setDeleteCrop(null);
      reloadCrops();
    } catch (err) { console.error(err); }
  };

  if (detailCrop) {
    return (
      <CropDetailPage
        crop={detailCrop}
        onClose={() => { setDetailCrop(null); reloadCrops(); }}
        onViewLog={(log) => onNavigate?.('record', { cropId: log.cropId })}
      />
    );
  }

  return (
    <div className="home-tab">
      <div className="home-date-section">
        <h1 className="home-date">
          {dateInfo.month}월 {dateInfo.day}일 {dateInfo.weekday}요일
        </h1>
        {solarTerm && (
          <span className="home-solar-term">{solarTerm}</span>
        )}
      </div>

      <WeatherCard />

      <div className="home-section home-section--crops">
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
            <div className="home-empty-crops-icon" aria-hidden="true">
              <Sprout size={40} />
            </div>
            <p className="home-empty-crops-title">아직 등록된 작물이 없어요</p>
            <p className="home-empty-crops-desc">
              작물을 등록하고 매일의 성장을<br />기록해보세요.
            </p>
            <button
              className="btn-primary home-empty-crops-cta"
              onClick={() => setShowCropManager(true)}
            >
              <Plus size={16} />
              작물 등록하기
            </button>
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
                  onClick={() => handleCropClick(crop)}
                  onEdit={handleEditCrop}
                  onDelete={setDeleteCrop}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="home-section home-section--calendar">
        <div className="section-header">
          <span className="section-title">기록 달력</span>
        </div>
        {logsLoading ? <Spinner /> : (
          <MiniCalendar
            logDates={logDates}
            selectedDate={selectedDate}
            onDateClick={(date) => setSelectedDate(selectedDate === date ? null : date)}
          />
        )}
      </div>

      {/* Date logs panel */}
      {selectedDate && (
        <div className="home-section home-section--date-logs">
          <div className="section-header">
            <span className="section-title">{selectedDate} 기록</span>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)}>닫기</Button>
          </div>
          {dateLogs.length === 0 ? (
            <p className="home-date-logs-empty">이 날짜에 기록이 없습니다.</p>
          ) : (
            <div className="home-date-logs-list">
              {dateLogs.map((log) => (
                <div key={log.id} className="home-date-log-item" onClick={() => onNavigate?.('record', { cropId: log.cropId })}>
                  <div className="home-date-log-top">
                    <span className="home-date-log-crop">{cropMap[log.cropId] || '작물 미지정'}</span>
                    {(log.houseTemp ?? log.temperature) != null && <span className="home-date-log-env">{(log.houseTemp ?? log.temperature)}&deg;C</span>}
                    {(log.houseHumidity ?? log.humidity) != null && <span className="home-date-log-env">{(log.houseHumidity ?? log.humidity)}%</span>}
                  </div>
                  {log.memo && <p className="home-date-log-memo">{log.memo}</p>}
                  <div className="home-date-log-data">
                    {log.heightCm != null && <span>키 {log.heightCm}cm</span>}
                    {log.leafCount != null && <span>잎 {log.leafCount}장</span>}
                    {log.stemMm != null && <span>줄기 {log.stemMm}mm</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
        <div className="modal-overlay" onClick={closeCropManager}>
          <div className="modal-content card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <CropManager />
            <div className="form-actions home-crop-manager-close">
              <Button variant="secondary" onClick={closeCropManager}>닫기</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Crop Modal */}
      {editCrop && (
        <div className="modal-overlay" onClick={() => setEditCrop(null)}>
          <div className="modal-content card crop-form-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="crop-form-title">작물 정보 수정</h3>
            <form className="crop-form" onSubmit={handleEditSave}>
              <Field label="작물명 *">
                <Input name="name" value={editCrop.name || ''} onChange={(e) => setEditCrop({ ...editCrop, name: e.target.value })} required />
              </Field>
              <Field label="품종">
                <Input name="variety" value={editCrop.variety || ''} onChange={(e) => setEditCrop({ ...editCrop, variety: e.target.value })} />
              </Field>
              <Field label="파종일">
                <Input name="plantingDate" type="date" value={editCrop.plantingDate || ''} onChange={(e) => setEditCrop({ ...editCrop, plantingDate: e.target.value })} />
              </Field>
              <Field label="구획 위치">
                <Input name="section" value={editCrop.section || ''} onChange={(e) => setEditCrop({ ...editCrop, section: e.target.value })} />
              </Field>
              <div className="crop-form-actions">
                <Button variant="secondary" type="button" onClick={() => setEditCrop(null)}>취소</Button>
                <Button variant="primary" type="submit">수정</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Crop Confirm */}
      {deleteCrop && (
        <Modal
          message={`"${deleteCrop.name}"을(를) 삭제하시겠습니까? 관련 기록은 유지됩니다.`}
          confirmLabel="삭제"
          danger
          onConfirm={handleDeleteCrop}
          onCancel={() => setDeleteCrop(null)}
        />
      )}
    </div>
  );
}
