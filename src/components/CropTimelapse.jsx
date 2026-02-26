import { useState, useEffect, useRef } from 'react';
import { Camera, Play, Pause, Trash2, Plus } from 'lucide-react';
import { storage } from '../utils/storage';

// 이미지를 최대 800px로 리사이즈 후 base64 반환
const resizeImage = (file, maxW = 800) =>
  new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = Math.min(1, maxW / img.width);
      const w = Math.round(img.width  * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement('canvas');
      canvas.width  = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.src = url;
  });

export default function CropTimelapse({ cropId }) {
  const [photos, setPhotos]     = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ date: new Date().toISOString().slice(0, 10), note: '' });
  const [playing, setPlaying]   = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [uploading, setUploading] = useState(false);
  const inputRef  = useRef(null);
  const timerRef  = useRef(null);

  const photoKey = `crop_photo_${cropId}`;

  const loadPhotos = () => {
    const list = storage.get(photoKey) || [];
    // 날짜순 정렬
    setPhotos([...list].sort((a, b) => a.date.localeCompare(b.date)));
  };

  useEffect(() => { loadPhotos(); }, [cropId]);

  // 슬라이드쇼
  useEffect(() => {
    if (playing && photos.length > 0) {
      timerRef.current = setInterval(() => {
        setSlideIdx(i => (i + 1) % photos.length);
      }, 500);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, photos.length]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await resizeImage(file);
      const list    = storage.get(photoKey) || [];
      const newItem = {
        id: Date.now().toString(),
        date: form.date,
        note: form.note,
        photo: dataUrl,
        createdAt: new Date().toISOString(),
      };
      storage.set(photoKey, [newItem, ...list]);
      loadPhotos();
      setForm({ date: new Date().toISOString().slice(0, 10), note: '' });
      setShowForm(false);
      if (inputRef.current) inputRef.current.value = '';
    } finally {
      setUploading(false);
    }
  };

  const del = (id) => {
    const list = (storage.get(photoKey) || []).filter(p => p.id !== id);
    storage.set(photoKey, list);
    loadPhotos();
    if (playing) setPlaying(false);
  };

  return (
    <div>
      {/* ── 슬라이드쇼 플레이어 ── */}
      {photos.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', background: '#000', aspectRatio: '4/3' }}>
            <img
              src={photos[slideIdx]?.photo}
              alt={photos[slideIdx]?.date}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.1s' }}
            />
            {/* 날짜 오버레이 */}
            <div style={{
              position: 'absolute', bottom: '10px', left: '10px',
              background: 'rgba(0,0,0,0.55)', borderRadius: '6px',
              padding: '4px 10px', color: '#fff', fontSize: '12px',
              backdropFilter: 'blur(4px)',
            }}>
              {photos[slideIdx]?.date.replace(/-/g, '.')}
              {photos[slideIdx]?.note && ` · ${photos[slideIdx].note}`}
            </div>
            {/* 슬라이드 인디케이터 */}
            <div style={{
              position: 'absolute', bottom: '10px', right: '10px',
              background: 'rgba(0,0,0,0.55)', borderRadius: '6px',
              padding: '4px 10px', color: '#fff', fontSize: '11px',
              backdropFilter: 'blur(4px)',
            }}>
              {slideIdx + 1} / {photos.length}
            </div>
          </div>

          {/* 재생 컨트롤 */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' }}>
            <button
              onClick={() => { setPlaying(p => !p); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '9px 18px', borderRadius: '8px',
                background: playing ? 'var(--color-earth)' : 'var(--color-primary)',
                color: '#fff', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-sans)',
              }}
            >
              {playing
                ? <><Pause size={14} strokeWidth={2} /> 정지</>
                : <><Play  size={14} strokeWidth={2} /> 타임랩스 재생</>
              }
            </button>
            {/* 썸네일 스크롤 */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', flex: 1 }}>
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => { setPlaying(false); setSlideIdx(i); }}
                  style={{
                    width: '40px', height: '40px', flexShrink: 0, padding: 0,
                    border: `2px solid ${i === slideIdx ? 'var(--color-primary)' : 'transparent'}`,
                    borderRadius: '6px', overflow: 'hidden', cursor: 'pointer',
                  }}
                >
                  <img src={p.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 사진 없을 때 빈 상태 ── */}
      {photos.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <Camera size={36} strokeWidth={1.5} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
          <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>성장 사진을 추가해보세요</p>
          <p style={{ fontSize: '12px', lineHeight: 1.7 }}>날짜별 사진을 올리면<br />타임랩스로 성장 과정을 확인할 수 있어요</p>
        </div>
      )}

      {/* ── 사진 추가 폼 ── */}
      {showForm && (
        <div className="card mb-4" style={{ padding: '16px' }}>
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
              <label className="label">메모 (선택)</label>
              <input
                className="input"
                placeholder="예: 꽃 피기 시작"
                value={form.note}
                onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>취소</button>
            <button
              className="btn-primary"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {uploading
                ? '업로드 중...'
                : <><Camera size={14} strokeWidth={1.5} /> 사진 선택</>
              }
            </button>
          </div>
        </div>
      )}

      {/* ── 추가 버튼 ── */}
      {!showForm && (
        <button
          className="btn-primary"
          onClick={() => setShowForm(true)}
          style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: '13px' }}
        >
          <Plus size={14} strokeWidth={2} /> 성장 사진 추가
        </button>
      )}

      {/* ── 사진 목록 (그리드) ── */}
      {photos.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            사진 {photos.length}장 · 날짜순
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {photos.map((p, i) => (
              <div
                key={p.id}
                style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => { setSlideIdx(i); setPlaying(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                <img src={p.photo} alt={p.date} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                  padding: '16px 6px 4px', color: '#fff', fontSize: '10px',
                }}>
                  {p.date.replace(/-/g, '.').slice(5)}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); del(p.id); }}
                  style={{
                    position: 'absolute', top: '4px', right: '4px',
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)', border: 'none',
                    color: '#fff', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Trash2 size={11} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
    </div>
  );
}
