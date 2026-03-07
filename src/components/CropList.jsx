import { useState, useEffect } from 'react';
import { Plus, Sprout, ChevronRight, ArrowLeft, Trash2, Pencil, CalendarDays, Camera } from 'lucide-react';
import { db, TABLES } from '../services/dbService';
import { toast } from './Toast';
import { ConfirmModal } from './ConfirmModal';
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
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const BLANK_FORM = {
    name: '', customName: '', variety: '', area: '',
    plantingDate: new Date().toISOString().slice(0, 10),
    growMethod: '노지', seedType: '', note: '',
  };
  const [form, setForm] = useState({ ...BLANK_FORM });

  const load = async () => setCrops(await db.getList(TABLES.CROP));

  useEffect(() => { load(); }, []);

  const add = async () => {
    const finalName = form.name === '직접입력' ? form.customName.trim() : form.name.trim();
    if (!finalName) return;
    const { customName, ...cropData } = form;
    try {
      await db.add(TABLES.CROP, {
        name:        finalName,
        variety:     cropData.variety    || null,
        area:        cropData.area       || null,
        plantingDate:cropData.plantingDate,
        growMethod:  cropData.growMethod || '노지',
        seedType:    cropData.seedType   || null,
        note:        cropData.note       || null,
      });
      await load();
      setForm({ ...BLANK_FORM });
      setShowForm(false);
      toast.success(`${finalName} 등록 완료`);
    } catch (e) {
      console.error('[작물 등록 오류]', e);
      toast.error(`등록 오류: ${e?.message || '다시 시도해주세요'}`);
    }
  };

  const edit = async () => {
    const finalName = form.name === '직접입력' ? form.customName.trim() : form.name.trim();
    if (!finalName) return;
    const { customName, ...cropData } = form;
    try {
      await db.update(TABLES.CROP, editingId, {
        name:        finalName,
        variety:     cropData.variety    || null,
        area:        cropData.area       || null,
        plantingDate:cropData.plantingDate,
        growMethod:  cropData.growMethod || '노지',
        seedType:    cropData.seedType   || null,
        note:        cropData.note       || null,
      });
      await load();
      setForm({ ...BLANK_FORM });
      setEditingId(null);
      setShowForm(false);
      toast.success('작물 정보가 수정되었어요');
    } catch (e) {
      console.error('[작물 수정 오류]', e);
      toast.error(`수정 오류: ${e?.message || '다시 시도해주세요'}`);
    }
  };

  const startEdit = (crop, e) => {
    e.stopPropagation();
    const isCustom = !SUPPORTED_CROPS.includes(crop.name);
    setForm({
      name:        isCustom ? '직접입력' : crop.name,
      customName:  isCustom ? crop.name : '',
      variety:     crop.variety || '',
      area:        crop.area || '',
      plantingDate:crop.plantingDate || new Date().toISOString().slice(0, 10),
      growMethod:  crop.growMethod || '노지',
      seedType:    crop.seedType || '',
      note:        crop.note || '',
    });
    setEditingId(crop.id);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...BLANK_FORM });
    setShowForm(false);
  };

  const requestDelete = (crop, e) => {
    e.stopPropagation();
    setDeleteTarget(crop);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    try {
      await db.delete(TABLES.CROP, id);
      await load();
      if (selectedId === id) setSelectedId(null);
      toast.success('작물이 삭제되었어요');
    } catch (e) {
      console.error('[작물 삭제 오류]', e);
      toast.error(`삭제 오류: ${e?.message || '다시 시도해주세요'}`);
    } finally {
      setDeleteTarget(null);
    }
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
          onClick={() => { setShowForm(!showForm); if (showForm) cancelEdit(); }}
        >
          <Plus size={14} strokeWidth={2} /> 작물 등록
        </button>
      </div>

      {/* 등록/수정 폼 */}
      {showForm && (
        <div className="card mb-4" style={{ borderLeft: '3px solid var(--color-primary)', borderRadius: '0 8px 8px 0', padding: '18px 20px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '16px' }}>
            {editingId ? '작물 수정' : '작물 등록'}
          </p>

          {/* 작물명 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label className="label">작물 종류 *</label>
              <select
                className="input"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value, customName: '' }))}
                style={{ fontSize: '14px' }}
              >
                <option value="">-- 선택 --</option>
                {SUPPORTED_CROPS.map(c => <option key={c}>{c}</option>)}
                <option value="직접입력">직접 입력</option>
              </select>
            </div>
            <div>
              <label className="label">품종명</label>
              <input
                className="input"
                placeholder="예: 청양고추, 방울토마토"
                value={form.name === '직접입력' ? form.customName : form.variety}
                onChange={e => form.name === '직접입력'
                  ? setForm(p => ({ ...p, customName: e.target.value }))
                  : setForm(p => ({ ...p, variety: e.target.value }))
                }
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>

          {/* 직접 입력 시 작물명 입력 */}
          {form.name === '직접입력' && (
            <div style={{ marginBottom: '10px' }}>
              <label className="label">작물명 직접 입력 *</label>
              <input
                className="input"
                placeholder="예: 여주, 울금, 생강"
                value={form.customName}
                onChange={e => setForm(p => ({ ...p, customName: e.target.value }))}
                style={{ fontSize: '14px' }}
                autoFocus
              />
            </div>
          )}

          {/* 구획 + 재배방식 */}
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
              <label className="label">재배 방식</label>
              <select
                className="input"
                value={form.growMethod}
                onChange={e => setForm(p => ({ ...p, growMethod: e.target.value }))}
                style={{ fontSize: '14px' }}
              >
                {['노지', '하우스', '터널', '수경', '화분', '기타'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* 파종일 + 모종/씨앗 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
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
            <div>
              <label className="label">종류 (씨앗/모종)</label>
              <select
                className="input"
                value={form.seedType}
                onChange={e => setForm(p => ({ ...p, seedType: e.target.value }))}
                style={{ fontSize: '14px' }}
              >
                <option value="">미지정</option>
                {['씨앗 파종', '모종 정식', '구근 식재', '삽목', '접목묘'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* 메모 */}
          <div style={{ marginBottom: '14px' }}>
            <label className="label">메모</label>
            <textarea
              className="input"
              placeholder="구매처, 재배 목표, 특이사항 등"
              value={form.note}
              onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
              rows={2}
              style={{ fontSize: '14px', resize: 'none', lineHeight: 1.6 }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={cancelEdit}>취소</button>
            <button
              className="btn-primary"
              onClick={editingId ? edit : add}
              disabled={form.name === '직접입력' ? !form.customName.trim() : !form.name}
            >
              {editingId ? '수정' : '등록'}
            </button>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{crop.name}</span>
                    {crop.variety && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>· {crop.variety}</span>}
                    {crop.area && <span className="badge badge-info" style={{ fontSize: '10px' }}>{crop.area}</span>}
                    {crop.growMethod && crop.growMethod !== '노지' && (
                      <span className="badge badge-good" style={{ fontSize: '10px' }}>{crop.growMethod}</span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {crop.plantingDate?.replace(/-/g, '.')} {crop.seedType || '정식'}
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
                    onClick={e => startEdit(crop, e)}
                    style={{
                      width: '28px', height: '28px', borderRadius: '6px',
                      background: 'var(--color-primary-light)', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--color-primary)',
                    }}
                  >
                    <Pencil size={13} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={e => requestDelete(crop, e)}
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

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <ConfirmModal
          message="이 작물을 삭제할까요? 관련 타임라인과 사진도 함께 삭제됩니다."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
