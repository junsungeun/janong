import React, { useState, useRef, useEffect } from 'react';
import { Camera, ChevronLeft } from 'lucide-react';
import { Field, Textarea } from '../ui/Input';
import GrowthInput from './GrowthInput';
import { fetchCurrentWeather } from '../../services/kmaWeatherService';
import { db, TABLES, photoStorage } from '../../services/dbService';
import { GROWTH_STAGES } from '../../constants';

const resizeImage = (file, maxW = 1200) =>
  new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const c = document.createElement('canvas');
      c.width = img.width * scale;
      c.height = img.height * scale;
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => resolve(new File([b], file.name, { type: 'image/jpeg' })), 'image/jpeg', 0.8);
    };
    img.src = URL.createObjectURL(file);
  });

export default function RecordForm({ crops = [], editLog, onSave, onCancel }) {
  const fileRef = useRef(null);
  const isEdit = !!editLog;

  const [cropId, setCropId] = useState(editLog?.cropId || '');
  const [stage, setStage] = useState(editLog?.stage || '');
  const [photos, setPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState(editLog?.photos || []);
  const [growth, setGrowth] = useState({
    heightCm: editLog?.heightCm ?? '',
    leafCount: editLog?.leafCount ?? '',
    stemMm: editLog?.stemMm ?? '',
  });
  const [temperature, setTemperature] = useState(editLog?.houseTemp ?? editLog?.temperature ?? '');
  const [humidity, setHumidity] = useState(editLog?.houseHumidity ?? editLog?.humidity ?? '');
  const [memo, setMemo] = useState(editLog?.memo || '');
  const [weather, setWeather] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => { fetchCurrentWeather().then((w) => w && setWeather(w)); }, []);

  const selectedCrop = crops.find((c) => c.id === cropId);

  const handleAddPhoto = async (e) => {
    const files = Array.from(e.target.files || []);
    const np = await Promise.all(files.map(async (f) => {
      const r = await resizeImage(f);
      return { file: r, preview: URL.createObjectURL(r) };
    }));
    setPhotos((p) => [...p, ...np]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeExistingPhoto = (idx) => {
    setExistingPhotos((p) => p.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!cropId) { setError('작물을 선택해주세요'); return; }
    setSaving(true); setError('');
    try {
      const newPaths = await Promise.all(photos.map((p) => photoStorage.upload(cropId, p.file)));
      const allPhotoPaths = [...existingPhotos, ...newPaths];
      const ws = weather ? `${weather.temp ?? '-'}\u00b0C / 습도 ${weather.rh ?? '-'}% / 강수 ${weather.rain ?? 0}mm` : '';

      const logData = {
        cropId,
        stage: stage || null,
        date: editLog?.date || today,
        // 하우스 내부 (수동)
        houseTemp: temperature !== '' ? Number(temperature) : null,
        houseHumidity: humidity !== '' ? Number(humidity) : null,
        // 실외 (자동)
        outdoorTemp: weather?.temp ?? null,
        outdoorHumidity: weather?.rh ?? null,
        heightCm: growth.heightCm || null,
        leafCount: growth.leafCount || null,
        stemMm: growth.stemMm || null,
        memo,
        weather: ws || editLog?.weather || '',
        photos: allPhotoPaths,
      };

      if (isEdit) {
        await db.update(TABLES.DAILY_LOG, editLog.id, logData);
      } else {
        await db.add(TABLES.DAILY_LOG, logData);
      }
      onSave?.();
    } catch (err) { setError(err.message || '저장 실패'); } finally { setSaving(false); }
  };

  const activeStageIdx = GROWTH_STAGES.findIndex((s) => s.value === stage);

  // Step 1: 작물 미선택 → 작물 선택 화면
  if (!cropId) {
    return (
      <div className="record-form page-slide-in">
        <div className="record-form-header">
          <h2 className="section-title">{isEdit ? '기록 수정' : '새 기록'}</h2>
          <button className="btn-ghost" onClick={onCancel}>취소</button>
        </div>

        <div className="record-form-section">
          <p className="record-form-section-title">어떤 작물을 기록할까요?</p>
          <div className="crop-select-grid">
            {crops.map((c) => (
              <button
                key={c.id}
                type="button"
                className="crop-select-chip"
                onClick={() => setCropId(c.id)}
              >
                <span className="crop-select-name">{c.name}</span>
                {c.variety && <span className="crop-select-variety">{c.variety}</span>}
              </button>
            ))}
          </div>
          {crops.length === 0 && (
            <p className="text-sm text-muted" style={{ textAlign: 'center', padding: '20px 0' }}>
              설정에서 작물을 먼저 등록해주세요.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Step 2: 작물 선택됨 → 기록 작성
  return (
    <div className="record-form page-slide-in">
      {/* Header with crop name */}
      <div className="record-form-header">
        <button className="record-form-back" onClick={() => isEdit ? onCancel() : setCropId('')}>
          <ChevronLeft size={20} />
        </button>
        <div className="record-form-crop-info">
          <h2 className="record-form-crop-name">{selectedCrop?.name || '작물'}</h2>
          {selectedCrop?.variety && <span className="record-form-crop-variety">{selectedCrop.variety}</span>}
        </div>
        <button className="btn-ghost" onClick={onCancel}>취소</button>
      </div>

      {/* Stage progress bar */}
      <div className="stage-progress">
        {GROWTH_STAGES.map((s, i) => (
          <button
            key={s.value}
            type="button"
            className={`stage-progress-item ${stage === s.value ? 'active' : ''} ${i <= activeStageIdx ? 'passed' : ''}`}
            onClick={() => setStage(stage === s.value ? '' : s.value)}
          >
            <span className="stage-progress-dot">
              {stage === s.value ? s.icon : <span className="stage-progress-dot-inner" />}
            </span>
            <span className="stage-progress-label">{s.label}</span>
            {i < GROWTH_STAGES.length - 1 && <span className={`stage-progress-line ${i < activeStageIdx ? 'filled' : ''}`} />}
          </button>
        ))}
      </div>

      {/* Photo section */}
      <div className="record-form-section">
        <p className="record-form-section-label">사진</p>

        {existingPhotos.length > 0 && (
          <div className="record-photos-grid">
            {existingPhotos.map((path, i) => (
              <div key={`existing-${i}`} className="record-photo-item">
                <img src={photoStorage.getUrl(path)} alt="" className="record-photo-img" />
                <button className="record-photo-remove record-photo-remove-visible" onClick={() => removeExistingPhoto(i)}>
                  <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="2"><path d="M1 1l8 8M9 1l-8 8"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length === 0 && existingPhotos.length === 0 ? (
          <div className="record-photo-viewfinder" onClick={() => fileRef.current?.click()}>
            <div className="record-photo-viewfinder-icon">
              <Camera size={24} />
            </div>
            <span className="record-photo-viewfinder-text">사진 촬영 또는 선택</span>
          </div>
        ) : (
          <div className="record-photos-grid">
            {photos.map((ph, i) => (
              <div key={i} className="record-photo-item">
                <img src={ph.preview} alt="" className="record-photo-img" />
                <button className="record-photo-remove record-photo-remove-visible" onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}>
                  <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="2"><path d="M1 1l8 8M9 1l-8 8"/></svg>
                </button>
              </div>
            ))}
            <div className="record-photo-viewfinder record-photo-viewfinder-mini" onClick={() => fileRef.current?.click()}>
              <Camera size={20} />
              <span className="text-caption text-muted">추가</span>
            </div>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple onChange={handleAddPhoto} hidden />
      </div>

      {/* Data section */}
      <div className="record-form-section">
        <p className="record-form-section-label">하우스 환경 <span className="text-caption text-muted">(수동)</span></p>
        <div className="growth-input-row">
          <div className="growth-input-field">
            <label className="growth-input-label">온도</label>
            <div className="growth-input-wrap">
              <input className="input" type="number" inputMode="decimal" placeholder="0" value={temperature} onChange={(e) => setTemperature(e.target.value)} step="0.1" />
              <span className="growth-input-unit">&deg;C</span>
            </div>
          </div>
          <div className="growth-input-field">
            <label className="growth-input-label">습도</label>
            <div className="growth-input-wrap">
              <input className="input" type="number" inputMode="numeric" placeholder="0" value={humidity} onChange={(e) => setHumidity(e.target.value)} min="0" max="100" />
              <span className="growth-input-unit">%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="record-form-section">
        <p className="record-form-section-label">생장</p>
        <GrowthInput values={growth} onChange={setGrowth} />
      </div>

      <div className="record-form-section">
        <p className="record-form-section-label">메모</p>
        <div className="memo-template-chips">
          {['잎 색상 양호', '물줌', '비료 시비', '병해 발견', '수확함', '곁순 제거', '지주 설치'].map((t) => (
            <button key={t} type="button" className="memo-template-chip" onClick={() => setMemo((m) => m ? `${m}, ${t}` : t)}>
              {t}
            </button>
          ))}
        </div>
        <Textarea placeholder="오늘의 관찰 내용..." rows={3} value={memo} onChange={(e) => setMemo(e.target.value)} />
      </div>

      {weather && !isEdit && (
        <div className="record-weather-auto">
          <p className="record-form-section-label">실외 날씨 <span className="text-caption text-muted">(자동)</span></p>
          <div className="record-weather-auto-grid">
            <span>{weather.temp}&deg;C</span>
            <span>습도 {weather.rh}%</span>
            <span>강수 {weather.rain}mm</span>
          </div>
        </div>
      )}
      {error && <p className="record-form-error">{error}</p>}

      <button
        className="record-save-btn-full"
        onClick={handleSave}
        disabled={saving || !cropId}
      >
        {saving ? '저장 중...' : isEdit ? '수정 완료' : '기록 저장'}
      </button>
    </div>
  );
}
