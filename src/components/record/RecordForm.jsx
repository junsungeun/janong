import React, { useState, useRef, useEffect } from 'react';
import { Camera } from 'lucide-react';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { Field, Textarea, Select } from '../ui/Input';
import GrowthInput from './GrowthInput';
import { fetchCurrentWeather } from '../../services/kmaWeatherService';
import { db, TABLES, photoStorage } from '../../services/dbService';

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

const STEPS = [{ n: 1, l: '작물' }, { n: 2, l: '사진' }, { n: 3, l: '환경' }, { n: 4, l: '생장' }];

export default function RecordForm({ crops = [], editLog, onSave, onCancel }) {
  const fileRef = useRef(null);
  const isEdit = !!editLog;

  const [cropId, setCropId] = useState(editLog?.cropId || '');
  const [photos, setPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState(editLog?.photos || []);
  const [growth, setGrowth] = useState({
    heightCm: editLog?.heightCm ?? '',
    leafCount: editLog?.leafCount ?? '',
    stemMm: editLog?.stemMm ?? '',
  });
  const [temperature, setTemperature] = useState(editLog?.temperature ?? '');
  const [humidity, setHumidity] = useState(editLog?.humidity ?? '');
  const [memo, setMemo] = useState(editLog?.memo || '');
  const [weather, setWeather] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const step = !cropId ? 1 : (photos.length === 0 && existingPhotos.length === 0) ? 2 : 3;

  useEffect(() => { fetchCurrentWeather().then((w) => w && setWeather(w)); }, []);

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
        date: editLog?.date || today,
        temperature: temperature !== '' ? Number(temperature) : null,
        humidity: humidity !== '' ? Number(humidity) : null,
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

  return (
    <div className="record-form page-slide-in">
      <div className="record-form-header">
        <h2 className="section-title">{isEdit ? '기록 수정' : '새 기록'}</h2>
        <Button variant="ghost" onClick={onCancel}>취소</Button>
      </div>

      <div className="record-form-steps">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.n}>
            <div className="record-form-step">
              <span className={`record-form-step-num ${step === s.n ? 'active' : step > s.n ? 'done' : ''}`}>
                {step > s.n ? '\u2713' : s.n}
              </span>
              <span className={`record-form-step-label ${step === s.n ? 'active' : ''}`}>{s.l}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`record-form-step-line ${step > s.n ? 'done' : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="record-form-section">
        <p className="record-form-section-title"><span className="record-form-section-num">1</span>작물 선택</p>
        <Select options={crops.map((c) => ({ value: c.id, label: c.name }))} placeholder="작물을 선택하세요" value={cropId} onChange={(e) => setCropId(e.target.value)} />
      </div>

      <div className="record-form-section">
        <p className="record-form-section-title"><span className="record-form-section-num">2</span>사진 촬영</p>

        {/* Existing photos (edit mode) */}
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
            <span className="record-photo-viewfinder-hint">작물 사진을 촬영해주세요</span>
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

      <div className="record-form-section">
        <p className="record-form-section-title"><span className="record-form-section-num">3</span>환경 데이터 <span className="text-caption text-muted">(선택)</span></p>
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
        <p className="record-form-section-title"><span className="record-form-section-num">4</span>생장 데이터 <span className="text-caption text-muted">(선택)</span></p>
        <GrowthInput values={growth} onChange={setGrowth} />
      </div>

      <Field label="메모 (선택)">
        <Textarea placeholder="오늘의 관찰 내용..." rows={3} value={memo} onChange={(e) => setMemo(e.target.value)} />
      </Field>

      {weather && !isEdit && <div className="record-weather-notice"><span className="text-caption text-muted">날씨 자동: {weather.temp}&deg;C / 습도 {weather.rh}% / 강수 {weather.rain}mm</span></div>}
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
