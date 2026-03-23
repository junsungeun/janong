import { useState, useEffect, useRef } from 'react';
import { Plus, ChevronDown, ChevronUp, BookOpen, Camera, X, Image as ImageIcon, Thermometer } from 'lucide-react';
import { db, TABLES, photoStorage } from '../services/dbService';
import { formatDate } from '../utils/solarTerms';
import { toast } from './Toast';
import { ConfirmModal } from './ConfirmModal';
import { SwipeableRow } from './SwipeableRow';
import { fetchCurrentWeather } from '../services/kmaWeatherService';

const WEATHER_OPTIONS = ['맑음', '흐림', '비', '눈', '바람'];
const WORK_TYPES = ['파종', '정식', '물주기', '방제', '수확', '전정', '멀칭', '기타'];

// 이미지 리사이즈 (최대 1200px, JPEG 80%)
const resizeImage = (file, maxW = 1200) =>
  new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })), 'image/jpeg', 0.8);
    };
    img.src = URL.createObjectURL(file);
  });

export default function DailyLog({ addTrigger }) {
  const [logs, setLogs] = useState([]);
  const [crops, setCrops] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [photos, setPhotos] = useState([]); // { file, preview }
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    weather: '맑음',
    tempHigh: '',
    tempLow: '',
    workTypes: [],
    cropId: '',
    content: '',
    memo: '',
  });

  useEffect(() => {
    if (addTrigger) setShowForm(true);
  }, [addTrigger]);

  const load = async () => {
    const [logData, cropData] = await Promise.all([
      db.getList(TABLES.DAILY_LOG),
      db.getList(TABLES.CROP),
    ]);
    setLogs(logData);
    setCrops(cropData);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ date: new Date().toISOString().slice(0, 10), weather: '맑음', tempHigh: '', tempLow: '', workTypes: [], cropId: '', content: '', memo: '' });
    setPhotos([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const preview = URL.createObjectURL(file);
      setPhotos(prev => [...prev, { file, preview }]);
    });
    e.target.value = '';
  };

  const removePhoto = (idx) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const save = async () => {
    if (!form.content.trim()) return;
    try {
      // 사진 업로드
      const photoPaths = [];
      for (const p of photos) {
        const resized = await resizeImage(p.file);
        const path = await photoStorage.upload(form.cropId || 'general', resized);
        photoPaths.push(path);
      }

      // 자동 기온 가져오기 (수동 입력 없을 때만)
      let autoTemp = null;
      if (!form.tempHigh && !form.tempLow) {
        const weather = await fetchCurrentWeather();
        if (weather?.temp !== null) {
          autoTemp = weather.temp;
        }
      }

      const logData = {
        date: form.date,
        weather: form.weather,
        tempHigh: form.tempHigh || null,
        tempLow: form.tempLow || null,
        workTypes: form.workTypes,
        cropId: form.cropId || null,
        content: form.content,
        memo: form.memo,
        photos: photoPaths,
        ...(autoTemp !== null && !form.tempHigh ? { tempHigh: autoTemp } : {}),
        ...(autoTemp !== null && !form.tempLow ? { tempLow: autoTemp } : {}),
        ...(autoTemp !== null ? { autoTemp, autoTempAt: new Date().toISOString() } : {}),
      };

      if (editingId) {
        await db.update(TABLES.DAILY_LOG, editingId, logData);
        toast.success('일지가 수정되었어요');
      } else {
        await db.add(TABLES.DAILY_LOG, logData);
        toast.success('농사 기록이 저장되었어요');
      }
      await load();
      resetForm();
    } catch {
      toast.error('저장 중 오류가 발생했어요');
    }
  };

  const startEdit = (log) => {
    setForm({
      date: log.date, weather: log.weather,
      tempHigh: log.tempHigh ?? '', tempLow: log.tempLow ?? '',
      workTypes: log.workTypes || [],
      cropId: log.cropId || '', content: log.content, memo: log.memo || '',
    });
    setEditingId(log.id);
    setPhotos([]);
    setExpandedId(null);
    setShowForm(true);
  };

  const del = async (id) => {
    try {
      await db.delete(TABLES.DAILY_LOG, id);
      toast.success('일지가 삭제되었어요');
      await load();
    } catch {
      toast.error('삭제 중 오류가 발생했어요');
    }
    setConfirmDelete(null);
  };

  const toggleWorkType = (type) => {
    setForm(prev => ({
      ...prev,
      workTypes: prev.workTypes.includes(type)
        ? prev.workTypes.filter(t => t !== type)
        : [...prev.workTypes, type],
    }));
  };

  const getCropName = (cropId) => crops.find(c => c.id === cropId)?.name || '';

  return (
    <div>
      <div className="section-header">
        <span className="section-title">농사 일지</span>
        <button
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px' }}
          onClick={() => { setShowForm(!showForm); setEditingId(null); }}
        >
          <Plus size={14} strokeWidth={2} />
          기록 추가
        </button>
      </div>

      {/* ── 작성 폼 ── */}
      {showForm && (
        <div className="card mb-5" style={{ borderLeft: '3px solid var(--color-primary)', borderRadius: '0 8px 8px 0' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '16px' }}>
            {editingId ? '일지 수정' : '오늘의 농사 기록'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label className="label">날짜</label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                style={{ fontSize: '14px' }}
              />
            </div>
            <div>
              <label className="label">날씨</label>
              <select
                className="input"
                value={form.weather}
                onChange={e => setForm(p => ({ ...p, weather: e.target.value }))}
                style={{ fontSize: '14px' }}
              >
                {WEATHER_OPTIONS.map(w => <option key={w}>{w}</option>)}
              </select>
            </div>
          </div>

          {/* 기온 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label className="label">최저 기온 (°C)</label>
              <input
                type="number"
                className="input"
                placeholder="예: 5"
                value={form.tempLow}
                onChange={e => setForm(p => ({ ...p, tempLow: e.target.value }))}
                style={{ fontSize: '14px' }}
              />
            </div>
            <div>
              <label className="label">최고 기온 (°C)</label>
              <input
                type="number"
                className="input"
                placeholder="예: 22"
                value={form.tempHigh}
                onChange={e => setForm(p => ({ ...p, tempHigh: e.target.value }))}
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>

          {/* 작물 선택 */}
          {crops.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <label className="label">작물</label>
              <select
                className="input"
                value={form.cropId}
                onChange={e => setForm(p => ({ ...p, cropId: e.target.value }))}
                style={{ fontSize: '14px' }}
              >
                <option value="">전체 (작물 미지정)</option>
                {crops.map(c => <option key={c.id} value={c.id}>{c.name}{c.variety ? ` · ${c.variety}` : ''}</option>)}
              </select>
            </div>
          )}

          <div style={{ marginBottom: '12px' }}>
            <label className="label">작업 종류</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {WORK_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => toggleWorkType(type)}
                  style={{
                    padding: '5px 12px', borderRadius: '100px',
                    border: '1px solid', fontSize: '12px', fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.15s',
                    fontFamily: 'var(--font-sans)',
                    borderColor: form.workTypes.includes(type) ? 'var(--color-primary)' : 'var(--border)',
                    background: form.workTypes.includes(type) ? 'var(--color-primary)' : 'transparent',
                    color: form.workTypes.includes(type) ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label className="label">오늘 한 일 *</label>
            <textarea
              className="input"
              placeholder="오늘 밭에서 한 일을 기록해요..."
              value={form.content}
              onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              rows={4}
              style={{ resize: 'vertical', lineHeight: '1.7', fontSize: '14px' }}
            />
          </div>

          {/* 사진 첨부 */}
          <div style={{ marginBottom: '12px' }}>
            <label className="label">사진</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotos}
              style={{ display: 'none' }}
            />
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {photos.map((p, i) => (
                <div key={i} style={{ position: 'relative', width: '72px', height: '72px', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={p.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    onClick={() => removePhoto(i)}
                    style={{
                      position: 'absolute', top: '2px', right: '2px',
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: 'rgba(0,0,0,0.6)', border: 'none',
                      color: '#fff', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: 'pointer', padding: 0,
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  width: '72px', height: '72px', borderRadius: '8px',
                  border: '1.5px dashed var(--border)', background: 'var(--bg-subtle)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', gap: '2px',
                }}
              >
                <Camera size={18} color="var(--text-muted)" strokeWidth={1.5} />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>추가</span>
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="label">메모 (선택)</label>
            <input
              className="input"
              placeholder="특이사항, 다음에 할 일 등"
              value={form.memo}
              onChange={e => setForm(p => ({ ...p, memo: e.target.value }))}
              style={{ fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={resetForm}>취소</button>
            <button className="btn-primary" onClick={save} disabled={!form.content.trim()}>
              {editingId ? '수정' : '저장'}
            </button>
          </div>
        </div>
      )}

      {/* ── 일지 목록 ── */}
      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
          <BookOpen size={36} strokeWidth={1.5} style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontSize: '14px', marginBottom: '6px', fontWeight: 500 }}>아직 기록이 없어요</p>
          <p style={{ fontSize: '12px', lineHeight: 1.8 }}>
            오늘 밭에서 한 일을 기록해두면<br />내년 농사에 그대로 쓸 수 있어요
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {logs.map(log => {
            const dateStr = log.date ? log.date.replace(/-/g, '.') : '';
            const isExpanded = expandedId === log.id;
            const cropName = getCropName(log.cropId);
            const logPhotos = log.photos || [];
            return (
              <SwipeableRow
                key={log.id}
                onEdit={() => startEdit(log)}
                onDelete={() => setConfirmDelete(log.id)}
                style={{ border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}
              >
                <div
                  style={{ padding: '14px 16px', cursor: 'pointer' }}
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>{dateStr}</span>
                        <span className="badge badge-info" style={{ fontSize: '10px' }}>{log.weather}</span>
                        {(log.tempLow || log.tempHigh) && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {log.tempLow ? `${log.tempLow}°` : ''}{log.tempLow && log.tempHigh ? '~' : ''}{log.tempHigh ? `${log.tempHigh}°` : ''}
                          </span>
                        )}
                        {cropName && <span className="badge badge-good" style={{ fontSize: '10px' }}>{cropName}</span>}
                        {log.workTypes?.slice(0, 2).map(t => (
                          <span key={t} className="badge" style={{ fontSize: '10px', background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>{t}</span>
                        ))}
                        {logPhotos.length > 0 && (
                          <ImageIcon size={13} color="var(--text-muted)" strokeWidth={1.5} />
                        )}
                      </div>
                      <p style={{
                        fontSize: '13px', color: 'var(--text)', lineHeight: 1.6,
                        overflow: isExpanded ? 'visible' : 'hidden',
                        display: isExpanded ? 'block' : '-webkit-box',
                        WebkitLineClamp: isExpanded ? 'unset' : 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {log.content}
                      </p>
                      {isExpanded && log.memo && (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                          메모: {log.memo}
                        </p>
                      )}
                      {/* 사진 미리보기 */}
                      {isExpanded && logPhotos.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                          {logPhotos.map((path, i) => (
                            <img
                              key={i}
                              src={photoStorage.getUrl(path)}
                              alt=""
                              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
                      {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                    </div>
                  </div>
                </div>
              </SwipeableRow>
            );
          })}
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          message="이 일지를 삭제할까요?"
          onConfirm={() => del(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
