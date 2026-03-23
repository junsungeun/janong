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
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })),
        'image/jpeg',
        0.8,
      );
    };
    img.src = URL.createObjectURL(file);
  });

export default function RecordForm({ crops = [], onSave, onCancel }) {
  const fileRef = useRef(null);
  const [cropId, setCropId] = useState('');
  const [photos, setPhotos] = useState([]); // { file, preview, type, analyzing, result }
  const [growth, setGrowth] = useState({});
  const [memo, setMemo] = useState('');
  const [weather, setWeather] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Merged AI results
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [aiStatus, setAiStatus] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  // Auto-fetch weather
  useEffect(() => {
    fetchCurrentWeather().then((w) => {
      if (w) setWeather(w);
    });
  }, []);

  const handleAddPhoto = async (e) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = await Promise.all(
      files.map(async (f) => {
        const resized = await resizeImage(f);
        return {
          file: resized,
          preview: URL.createObjectURL(resized),
          type: '', // 'meter' or 'crop'
          analyzing: false,
          result: null,
        };
      }),
    );
    setPhotos((prev) => [...prev, ...newPhotos]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const setPhotoType = async (index, type) => {
    setPhotos((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], type, analyzing: true, result: null };
      return next;
    });

    const photo = photos[index];
    try {
      let result;
      if (type === 'meter') {
        result = await readMeter(photo.file);
        if (result.temperature != null) setTemperature(result.temperature);
        if (result.humidity != null) setHumidity(result.humidity);
      } else {
        result = await analyzeCrop(photo.file);
        if (result.status) setAiStatus(result.status);
        if (result.summary || result.details) {
          setAiAnalysis(`${result.summary || ''}\n${result.details || ''}\n${result.advice || ''}`.trim());
        }
      }
      setPhotos((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], analyzing: false, result };
        return next;
      });
    } catch (err) {
      setPhotos((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], analyzing: false, result: { error: err.message } };
        return next;
      });
    }
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!cropId) { setError('작물을 선택해주세요'); return; }
    setSaving(true);
    setError('');
    try {
      // Upload photos
      const uploadedPaths = await Promise.all(
        photos.map((p) => photoStorage.upload(cropId, p.file)),
      );

      const weatherStr = weather
        ? `${weather.temp ?? '-'}°C / 습도 ${weather.rh ?? '-'}% / 강수 ${weather.rain ?? 0}mm`
        : '';

      const logData = {
        cropId,
        date: today,
        temperature,
        humidity,
        aiStatus,
        aiAnalysis,
        heightCm: growth.heightCm || null,
        leafCount: growth.leafCount || null,
        stemMm: growth.stemMm || null,
        memo,
        weather: weatherStr,
        photos: uploadedPaths,
      };

      await db.add(TABLES.DAILY_LOG, logData);
      onSave?.();
    } catch (err) {
      setError(err.message || '저장 실패');
    } finally {
      setSaving(false);
    }
  };

  const cropOptions = crops.map((c) => ({ value: c.id, label: c.name }));

  return (
    <div className="record-form page-slide-in">
      <div className="record-form-header">
        <h2 className="section-title">새 기록</h2>
        <Button variant="ghost" onClick={onCancel}>취소</Button>
      </div>

      {/* Step 1: Crop */}
      <Field label="작물 선택" required>
        <Select
          options={cropOptions}
          placeholder="작물을 선택하세요"
          value={cropId}
          onChange={(e) => setCropId(e.target.value)}
        />
      </Field>

      {/* Step 2-4: Photos */}
      <div className="record-form-section">
        <label className="label">사진</label>
        <div className="record-photos-grid">
          {photos.map((photo, i) => (
            <div key={i} className="record-photo-item">
              <img src={photo.preview} alt="" className="record-photo-img" />
              <button className="record-photo-remove" onClick={() => removePhoto(i)}>X</button>

              {/* Type selector */}
              {!photo.type && !photo.analyzing && (
                <div className="record-photo-type-select">
                  <button className="record-type-btn" onClick={() => setPhotoType(i, 'meter')}>
                    온습도계
                  </button>
                  <button className="record-type-btn" onClick={() => setPhotoType(i, 'crop')}>
                    작물 사진
                  </button>
                </div>
              )}

              {/* Analyzing */}
              {photo.analyzing && (
                <div className="record-photo-overlay">
                  <Spinner />
                  <span className="text-caption">AI 분석 중...</span>
                </div>
              )}

              {/* Result badge */}
              {photo.result && !photo.analyzing && (
                <div className="record-photo-result">
                  {photo.type === 'meter' && photo.result.temperature != null && (
                    <Badge variant="info">
                      {photo.result.temperature}°C / {photo.result.humidity}%
                    </Badge>
                  )}
                  {photo.type === 'crop' && photo.result.status && (
                    <Badge variant={photo.result.status === '좋음' ? 'good' : photo.result.status === '주의' ? 'warning' : 'info'}>
                      {photo.result.status}
                    </Badge>
                  )}
                  {photo.result.error && (
                    <Badge variant="danger">{photo.result.error}</Badge>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Add photo button */}
          <div className="record-photo-add" onClick={() => fileRef.current?.click()}>
            <span className="record-photo-add-icon">+</span>
            <span className="text-caption">사진 추가</span>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleAddPhoto}
          hidden
        />
      </div>

      {/* AI results summary */}
      {(aiStatus || temperature != null) && (
        <Card variant="highlight" className="record-ai-summary">
          <p className="record-ai-title">AI 분석 결과</p>
          {temperature != null && <p className="text-sm">온도: {temperature}°C / 습도: {humidity}%</p>}
          {aiStatus && <p className="text-sm">상태: {aiStatus}</p>}
          {aiAnalysis && <p className="text-sm text-muted">{aiAnalysis}</p>}
        </Card>
      )}

      {/* Step 5: Growth */}
      <div className="record-form-section">
        <label className="label">생장 데이터 (선택)</label>
        <GrowthInput values={growth} onChange={setGrowth} />
      </div>

      {/* Step 6: Memo */}
      <Field label="메모 (선택)">
        <Textarea
          placeholder="오늘의 관찰 내용..."
          rows={3}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </Field>

      {/* Weather auto-fill notice */}
      {weather && (
        <p className="record-weather-notice text-caption text-muted">
          날씨 자동: {weather.temp}°C / 습도 {weather.rh}% / 강수 {weather.rain}mm
        </p>
      )}

      {error && <p className="record-form-error">{error}</p>}

      {/* Step 7: Save */}
      <Button
        variant="primary"
        className="record-save-btn"
        onClick={handleSave}
        disabled={saving || !cropId}
      >
        {saving ? '저장 중...' : '기록 저장'}
      </Button>
    </div>
  );
}
