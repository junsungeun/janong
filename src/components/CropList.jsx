import { useState, useEffect } from 'react';
import { Plus, Sprout, ChevronRight, ArrowLeft, Trash2, CalendarDays, Camera } from 'lucide-react';
import { storage, KEYS } from '../utils/storage';
import { SUPPORTED_CROPS, daysSincePlanting } from '../data/cropTimelines';
import CropTimeline from './CropTimeline';
import CropTimelapse from './CropTimelapse';

const DETAIL_TABS = [
  { id: 'timeline',  label: '재배 타임라인' },
  { id: 'timelapse', label: '성장 타임랩스' },
];

// 작물 이모지 매핑
const CROP_EMOJI = {
  '고추': '🌶', '토마토': '🍅', '오이': '🥒', '가지': '🍆',
  '배추': '🥬', '무': '🥕', '상추': '🥬', '시금치': '🥬',
  '감자': '🥔', '고구마': '🍠', '옥수수': '🌽', '콩': '🫘',
  '딸기': '🍓', '수박': '🍉', '참외': '🍈', '기타': '🌱',
};

export default function CropList() {
  const [crops, setCrops]         = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [detailTab, setDetailTab] = useState('timeline');
  const [form, setForm] = useState({
    name: '고추', area: '', plantingDate: new Date().toISOString().slice(0, 10), note: '',
  });

  const load = () => setCrops(storage.getList(KEYS.CROP));

  useEffect(() => { load(); }, []);

  const add = () => {
    if (!form.name.trim()) return;
    storage.addItem(KEYS.CROP, { ...form });
    load();
    setForm({ name: '고추', area: '', plantingDate: new Date().toISOString().slice(0, 10), note: '' });
    setShowForm(false);
  };

  const del = (id, e) => {
    e.stopPropagation();
    storage.deleteItem(KEYS.CROP, id);
    // 연결된 사진도 삭제
    localStorage.removeItem(`janong_crop_photo_${id}`);
    load();
    if (selectedId === id) setSelectedId(null);
  };

  const selectedCrop = crops.find(c => c.id === selectedId);

  // ── 상세 뷰 ─────────────────────────────────────────────────────────
  if (selectedCrop) {
    return (
      <div>
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => setSelectedId(null)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex', padding: '4px',
            }}
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>{CROP_EMOJI[selectedCrop.name] || '🌱'}</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
                {selectedCrop.name}
              </span>
              {selectedCrop.area && (
                <span className="badge badge-info">{selectedCrop.area}</span>
              )}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
              {selectedCrop.plantingDate.replace(/-/g, '.')} 정식 · D+{daysSincePlanting(selectedCrop.plantingDate)}일째
            </p>
          </div>
        </div>

        {/* 상세 서브탭 */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '20px',
          background: 'var(--bg-subtle)', borderRadius: '10px', padding: '4px',
        }}>
          {DETAIL_TABS.map(tab => {
            const isActive = detailTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setDetailTab(tab.id)}
                style={{
                  flex: 1, padding: '9px 6px', borderRadius: '7px', border: 'none',
                  fontSize: '13px', fontWeight: isActive ? 600 : 400,
                  fontFamily: 'var(--font-sans)', cursor: 'pointer', transition: 'all 0.15s',
                  background: isActive ? 'var(--bg-card)' : 'transparent',
                  color:      isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                  boxShadow:  isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {tab.id === 'timeline'  && <CalendarDays size={14} strokeWidth={isActive ? 2 : 1.5} style={{ verticalAlign: 'middle', marginRight: '4px' }} />}
                {tab.id === 'timelapse' && <Camera       size={14} strokeWidth={isActive ? 2 : 1.5} style={{ verticalAlign: 'middle', marginRight: '4px' }} />}
                {tab.label}
              </button>
            );
          })}
        </div>

        {detailTab === 'timeline'  && <CropTimeline  cropName={selectedCrop.name} plantingDate={selectedCrop.plantingDate} />}
        {detailTab === 'timelapse' && <CropTimelapse cropId={selectedCrop.id} />}
      </div>
    );
  }

  // ── 목록 뷰 ─────────────────────────────────────────────────────────
  return (
    <div>
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <span className="section-title">
          내 작물
          {crops.length > 0 && (
            <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '6px' }}>
              {crops.length}종
            </span>
          )}
        </span>
        <button
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px' }}
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={14} strokeWidth={2} /> 작물 등록
        </button>
      </div>

      {/* 등록 폼 */}
      {showForm && (
        <div className="card mb-4" style={{ borderLeft: '3px solid var(--color-primary)', borderRadius: '0 8px 8px 0', padding: '18px 20px' }}>
          <div style={{ marginBottom: '10px' }}>
            <label className="label">작물 선택 *</label>
            <select
              className="input"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              style={{ fontSize: '14px' }}
            >
              {SUPPORTED_CROPS.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label className="label">구획명</label>
              <input
                className="input"
                placeholder="예: A밭, 1번 하우스"
                value={form.area}
                onChange={e => setForm(p => ({ ...p, area: e.target.value }))}
                style={{ fontSize: '14px' }}
              />
            </div>
            <div>
              <label className="label">파종/정식일 *</label>
              <input
                type="date"
                className="input"
                value={form.plantingDate}
                onChange={e => setForm(p => ({ ...p, plantingDate: e.target.value }))}
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label className="label">메모</label>
            <input
              className="input"
              placeholder="품종, 특이사항 등"
              value={form.note}
              onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
              style={{ fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>취소</button>
            <button className="btn-primary" onClick={add} disabled={!form.name.trim()}>등록</button>
          </div>
        </div>
      )}

      {/* 작물 목록 */}
      {crops.length === 0 && !showForm ? (
        <div style={{ textAlign: 'center', padding: '52px 20px', color: 'var(--text-muted)' }}>
          <Sprout size={40} strokeWidth={1.5} style={{ margin: '0 auto 14px', display: 'block', opacity: 0.35 }} />
          <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>등록된 작물이 없어요</p>
          <p style={{ fontSize: '12px', lineHeight: 1.8 }}>작물을 등록하면<br />재배 타임라인과 성장 타임랩스를 기록할 수 있어요</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {crops.map(crop => {
            const elapsed = daysSincePlanting(crop.plantingDate);
            return (
              <button
                key={crop.id}
                onClick={() => { setSelectedId(crop.id); setDetailTab('timeline'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '16px', background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: '10px',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  fontFamily: 'var(--font-sans)', transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {/* 이모지 */}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  background: 'var(--color-primary-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', flexShrink: 0,
                }}>
                  {CROP_EMOJI[crop.name] || '🌱'}
                </div>

                {/* 정보 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{crop.name}</span>
                    {crop.area && <span className="badge badge-info" style={{ fontSize: '10px' }}>{crop.area}</span>}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {crop.plantingDate.replace(/-/g, '.')} 정식
                    <span style={{
                      marginLeft: '8px', fontWeight: 700,
                      color: elapsed > 0 ? 'var(--color-primary)' : 'var(--text-muted)',
                    }}>
                      D+{elapsed}
                    </span>
                  </p>
                  {crop.note && (
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{crop.note}</p>
                  )}
                </div>

                {/* 우측 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                  <button
                    onClick={e => del(crop.id, e)}
                    style={{
                      width: '28px', height: '28px', borderRadius: '6px',
                      background: '#FFF0F0', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--color-danger)',
                    }}
                  >
                    <Trash2 size={13} strokeWidth={1.5} />
                  </button>
                  <ChevronRight size={18} color="var(--text-muted)" strokeWidth={1.5} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
