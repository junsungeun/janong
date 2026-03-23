import React, { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';
import { Field, Textarea, Select } from '../ui/Input';
import GrowthInput from './GrowthInput';
import { readMeter, analyzeCrop } from '../../services/geminiService';
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

const STEPS = [{ n: 1, l: '작물' }, { n: 2, l: '사진' }, { n: 3, l: '생장' }];

export default function RecordForm({ crops = [], onSave, onCancel }) {
  const fileRef = useRef(null);
  const [cropId, setCropId] = useState('');
  const [photos, setPhotos] = useState([]);
  const [growth, setGrowth] = useState({});
  const [memo, setMemo] = useState('');
  const [weather, setWeather] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [aiStatus, setAiStatus] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const step = !cropId ? 1 : photos.length === 0 ? 2 : 3;

  useEffect(() => { fetchCurrentWeather().then((w) => w && setWeather(w)); }, []);

  const handleAddPhoto = async (e) => {
    const files = Array.from(e.target.files || []);
    const np = await Promise.all(files.map(async (f) => {
      const r = await resizeImage(f);
      return { file: r, preview: URL.createObjectURL(r), type: '', analyzing: false, result: null };
    }));
    setPhotos((p) => [...p, ...np]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const setPhotoType = async (idx, type) => {
    setPhotos((p) => { const n = [...p]; n[idx] = { ...n[idx], type, analyzing: true, result: null }; return n; });
    try {
      const result = type === 'meter' ? await readMeter(photos[idx].file) : await analyzeCrop(photos[idx].file);
      if (type === 'meter') { if (result.temperature != null) setTemperature(result.temperature); if (result.humidity != null) setHumidity(result.humidity); }
      else { if (result.status) setAiStatus(result.status); if (result.summary || result.details) setAiAnalysis(`${result.summary || ''}\n${result.details || ''}\n${result.advice || ''}`.trim()); }
      setPhotos((p) => { const n = [...p]; n[idx] = { ...n[idx], analyzing: false, result }; return n; });
    } catch (err) {
      setPhotos((p) => { const n = [...p]; n[idx] = { ...n[idx], analyzing: false, result: { error: err.message } }; return n; });
    }
  };

  const handleSave = async () => {
    if (!cropId) { setError('작물을 선택해주세요'); return; }
    setSaving(true); setError('');
    try {
      const paths = await Promise.all(photos.map((p) => photoStorage.upload(cropId, p.file)));
      const ws = weather ? `${weather.temp ?? '-'}\u00b0C / 습도 ${weather.rh ?? '-'}% / 강수 ${weather.rain ?? 0}mm` : '';
      await db.add(TABLES.DAILY_LOG, { cropId, date: today, temperature, humidity, aiStatus, aiAnalysis, heightCm: growth.heightCm || null, leafCount: growth.leafCount || null, stemMm: growth.stemMm || null, memo, weather: ws, photos: paths });
      onSave?.();
    } catch (err) { setError(err.message || '저장 실패'); } finally { setSaving(false); }
  };

  const statusBadge = (s) => s === '좋음' ? 'good' : s === '주의' ? 'warning' : 'info';

  return (
    <div className="record-form page-slide-in">
      <div className="record-form-header">
        <h2 className="section-title">새 기록</h2>
        <Button variant="ghost" onClick={onCancel}>취소</Button>
      </div>

      {/* Step indicator */}
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

      {/* 1. Crop */}
      <div className="record-form-section">
        <p className="record-form-section-title"><span className="record-form-section-num">1</span>작물 선택</p>
        <Select options={crops.map((c) => ({ value: c.id, label: c.name }))} placeholder="작물을 선택하세요" value={cropId} onChange={(e) => setCropId(e.target.value)} />
      </div>

      {/* 2. Photos */}
      <div className="record-form-section">
        <p className="record-form-section-title"><span className="record-form-section-num">2</span>사진 촬영</p>
        {photos.length === 0 ? (
          <div className="record-photo-viewfinder" onClick={() => fileRef.current?.click()}>
            <div className="record-photo-viewfinder-icon">+</div>
            <span className="record-photo-viewfinder-text">사진 촬영 또는 선택</span>
            <span className="record-photo-viewfinder-hint">온습도계 / 작물 사진을 촬영해주세요</span>
          </div>
        ) : (
          <div className="record-photos-grid">
            {photos.map((ph, i) => (
              <div key={i} className="record-photo-item">
                <img src={ph.preview} alt="" className="record-photo-img" />
                <button className="record-photo-remove" onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}>X</button>
                {!ph.type && !ph.analyzing && (
                  <div className="record-photo-type-select">
                    <button className="record-type-btn" onClick={() => setPhotoType(i, 'meter')}>온습도계</button>
                    <button className="record-type-btn" onClick={() => setPhotoType(i, 'crop')}>작물 사진</button>
                  </div>
                )}
                {ph.analyzing && <div className="record-photo-overlay"><Spinner /><span className="text-caption">AI 분석 중...</span></div>}
                {ph.result && !ph.analyzing && (
                  <div className="record-photo-result">
                    {ph.type === 'meter' && ph.result.temperature != null && <Badge variant="info">{ph.result.temperature}&deg;C / {ph.result.humidity}%</Badge>}
                    {ph.type === 'crop' && ph.result.status && <Badge variant={statusBadge(ph.result.status)}>{ph.result.status}</Badge>}
                    {ph.result.error && <Badge variant="danger">{ph.result.error}</Badge>}
                  </div>
                )}
              </div>
            ))}
            <div className="record-photo-viewfinder" onClick={() => fileRef.current?.click()}>
              <div className="record-photo-viewfinder-icon">+</div>
              <span className="text-caption text-muted">추가</span>
            </div>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple onChange={handleAddPhoto} hidden />
      </div>

      {/* AI results */}
      {(aiStatus || temperature != null) && (
        <Card variant="highlight" className="record-ai-summary">
          <p className="record-ai-title">AI 분석 결과</p>
          {temperature != null && <div className="record-ai-row"><span className="record-ai-label">환경</span><span>{temperature}&deg;C / {humidity}%</span></div>}
          {aiStatus && <div className="record-ai-row"><span className="record-ai-label">상태</span><Badge variant={statusBadge(aiStatus)}>{aiStatus}</Badge></div>}
          {aiAnalysis && <p className="text-sm text-muted">{aiAnalysis}</p>}
        </Card>
      )}

      {/* 3. Growth */}
      <div className="record-form-section">
        <p className="record-form-section-title"><span className="record-form-section-num">3</span>생장 데이터</p>
        <GrowthInput values={growth} onChange={setGrowth} />
      </div>

      <Field label="메모 (선택)">
        <Textarea placeholder="오늘의 관찰 내용..." rows={3} value={memo} onChange={(e) => setMemo(e.target.value)} />
      </Field>

      {weather && <div className="record-weather-notice"><span className="text-caption text-muted">날씨 자동: {weather.temp}&deg;C / 습도 {weather.rh}% / 강수 {weather.rain}mm</span></div>}
      {error && <p className="record-form-error">{error}</p>}

      <div className="record-form-btns">
        <Button variant="secondary" onClick={onCancel}>취소</Button>
        <Button variant="primary" onClick={handleSave} disabled={saving || !cropId}>{saving ? '저장 중...' : '기록 저장'}</Button>
      </div>
    </div>
  );
}
