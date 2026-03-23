import { useState, useEffect } from 'react';
import { Plus, BookMarked, FlaskConical } from 'lucide-react';
import { db, TABLES } from '../services/dbService';
import { ConfirmModal } from './ConfirmModal';
import { toast } from './Toast';
import { SwipeableRow } from './SwipeableRow';

const MAT_TYPES = ['한방영양제', '토착미생물', '천혜녹즙', '목초액', '님오일', '마늘액', '키토산', '한방영양제+천혜녹즙', '직접입력'];
const CROP_OPTIONS = ['고추', '토마토', '배추', '상추', '오이', '가지', '감자', '고구마', '옥수수', '딸기', '전체', '직접입력'];
const SPRAY_METHODS = ['엽면살포', '토양관주', '뿌리관주', '드렌치', '연무', '기타'];

const BLANK_RECIPE = { name: '', material: '한방영양제', dilution: '', purpose: '', memo: '' };

export default function ChemicalLog() {
  const [logs, setLogs] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [view, setView] = useState('log'); // log | recipe
  const [editingLogId, setEditingLogId] = useState(null);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { message, onConfirm }

  const BLANK_LOG = {
    date: new Date().toISOString().slice(0, 10),
    material: '한방영양제', customMaterial: '',
    dilution: '', amount: '',
    crop: '전체', customCrop: '',
    sprayMethod: '엽면살포',
    weather: '', temp: '',
    memo: '', recipeId: '',
  };
  const [form, setForm] = useState({ ...BLANK_LOG });
  const [recipeForm, setRecipeForm] = useState({ ...BLANK_RECIPE });

  const loadLogs    = async () => {
    try {
      setLogs(await db.getList(TABLES.CHEM_LOG));
    } catch (e) {
      toast.error('살포 기록을 불러오지 못했어요');
    }
  };
  const loadRecipes = async () => {
    try {
      setRecipes(await db.getList(TABLES.RECIPE));
    } catch (e) {
      toast.error('레시피를 불러오지 못했어요');
    }
  };

  useEffect(() => { loadLogs(); loadRecipes(); }, []);

  /* ── 살포 기록 저장/수정 ── */
  const saveLog = async () => {
    if (!form.dilution.trim()) return;
    const finalMat  = form.material === '직접입력' ? form.customMaterial.trim() : form.material;
    const finalCrop = form.crop === '직접입력' ? form.customCrop.trim() : form.crop;
    const data = {
      date: form.date,
      material: finalMat,
      dilution: form.dilution,
      amount: form.amount,
      crop: finalCrop,
      sprayMethod: form.sprayMethod,
      weather: form.weather,
      temp: form.temp,
      memo: form.memo,
      recipeId: form.recipeId || null,
    };

    try {
      if (editingLogId) {
        await db.update(TABLES.CHEM_LOG, editingLogId, data);
        toast.success('살포 기록이 수정되었어요');
      } else {
        await db.add(TABLES.CHEM_LOG, data);
        toast.success('살포 기록이 등록되었어요');
      }
      await loadLogs();
      cancelLogEdit();
    } catch (e) {
      toast.error(editingLogId ? '살포 기록 수정에 실패했어요' : '살포 기록 등록에 실패했어요');
    }
  };

  const startLogEdit = (log) => {
    const materialIsCustom = !MAT_TYPES.slice(0, -1).includes(log.material);
    const cropIsCustom = !CROP_OPTIONS.slice(0, -1).includes(log.crop);
    setForm({
      date: log.date || '',
      material: materialIsCustom ? '직접입력' : log.material,
      customMaterial: materialIsCustom ? log.material : '',
      dilution: log.dilution || '',
      amount: log.amount || '',
      crop: cropIsCustom ? '직접입력' : log.crop,
      customCrop: cropIsCustom ? log.crop : '',
      sprayMethod: log.sprayMethod || '엽면살포',
      weather: log.weather || '',
      temp: log.temp || '',
      memo: log.memo || '',
      recipeId: log.recipeId || '',
    });
    setEditingLogId(log.id);
    setShowForm(true);
  };

  const cancelLogEdit = () => {
    setForm({ ...BLANK_LOG });
    setEditingLogId(null);
    setShowForm(false);
  };

  /* ── 레시피 저장/수정 ── */
  const saveRecipe = async () => {
    if (!recipeForm.name.trim()) return;

    try {
      if (editingRecipeId) {
        await db.update(TABLES.RECIPE, editingRecipeId, recipeForm);
        toast.success('레시피가 수정되었어요');
      } else {
        await db.add(TABLES.RECIPE, recipeForm);
        toast.success('레시피가 등록되었어요');
      }
      await loadRecipes();
      cancelRecipeEdit();
    } catch (e) {
      toast.error(editingRecipeId ? '레시피 수정에 실패했어요' : '레시피 등록에 실패했어요');
    }
  };

  const startRecipeEdit = (r) => {
    setRecipeForm({
      name: r.name || '',
      material: r.material || '한방영양제',
      dilution: r.dilution || '',
      purpose: r.purpose || '',
      memo: r.memo || '',
    });
    setEditingRecipeId(r.id);
    setShowRecipeForm(true);
  };

  const cancelRecipeEdit = () => {
    setRecipeForm({ ...BLANK_RECIPE });
    setEditingRecipeId(null);
    setShowRecipeForm(false);
  };

  /* ── 삭제 (확인 모달 포함) ── */
  const requestDelLog = (id) => {
    setConfirmModal({
      message: '이 살포 기록을 삭제할까요?',
      onConfirm: async () => {
        try {
          await db.delete(TABLES.CHEM_LOG, id);
          await loadLogs();
          toast.success('살포 기록이 삭제되었어요');
        } catch (e) {
          toast.error('살포 기록 삭제에 실패했어요');
        }
        setConfirmModal(null);
      },
    });
  };

  const requestDelRecipe = (id) => {
    setConfirmModal({
      message: '이 레시피를 삭제할까요?',
      onConfirm: async () => {
        try {
          await db.delete(TABLES.RECIPE, id);
          await loadRecipes();
          toast.success('레시피가 삭제되었어요');
        } catch (e) {
          toast.error('레시피 삭제에 실패했어요');
        }
        setConfirmModal(null);
      },
    });
  };

  const loadRecipe = (recipe) => {
    setForm(p => ({ ...p, material: recipe.material, dilution: recipe.dilution, recipeId: recipe.id, memo: recipe.purpose }));
  };

  return (
    <div>
      {/* ── 삭제 확인 모달 ── */}
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      <div className="section-header">
        <span className="section-title">천연농자재 기록</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setView('log')}
            style={{
              padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
              border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
              background: view === 'log' ? 'var(--color-primary)' : 'transparent',
              color: view === 'log' ? '#fff' : 'var(--text-muted)',
            }}
          >
            <FlaskConical size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />사용 기록
          </button>
          <button
            onClick={() => setView('recipe')}
            style={{
              padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500,
              border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
              background: view === 'recipe' ? 'var(--color-primary)' : 'transparent',
              color: view === 'recipe' ? '#fff' : 'var(--text-muted)',
            }}
          >
            <BookMarked size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />레시피
          </button>
        </div>
      </div>

      {view === 'log' ? (
        <>
          {/* 레시피 빠른 선택 */}
          {recipes.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.05em' }}>저장된 레시피</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {recipes.map(r => (
                  <button
                    key={r.id}
                    onClick={() => { loadRecipe(r); setShowForm(true); }}
                    style={{
                      padding: '5px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 500,
                      border: '1px solid var(--color-earth)', background: 'var(--color-earth-light)',
                      color: 'var(--color-earth)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginBottom: '16px', padding: '12px' }}
            onClick={() => {
              if (showForm && !editingLogId) {
                cancelLogEdit();
              } else {
                cancelLogEdit();
                setShowForm(true);
              }
            }}
          >
            <Plus size={15} strokeWidth={2} /> 살포 기록 추가
          </button>

          {showForm && (
            <div className="card mb-4" style={{ borderLeft: '3px solid var(--color-earth)', borderRadius: '0 8px 8px 0' }}>
              {/* 날짜 + 자재 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label className="label">날짜</label>
                  <input type="date" className="input" value={form.date}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={{ fontSize: '14px' }} />
                </div>
                <div>
                  <label className="label">자재 종류</label>
                  <select className="input" value={form.material}
                    onChange={e => setForm(p => ({ ...p, material: e.target.value, customMaterial: '' }))} style={{ fontSize: '14px' }}>
                    {MAT_TYPES.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* 직접입력 자재명 */}
              {form.material === '직접입력' && (
                <div style={{ marginBottom: '10px' }}>
                  <label className="label">자재명 직접 입력</label>
                  <input className="input" placeholder="예: OO회사 한방영양제, 자가제조 목초액" value={form.customMaterial}
                    onChange={e => setForm(p => ({ ...p, customMaterial: e.target.value }))} style={{ fontSize: '14px' }} autoFocus />
                </div>
              )}

              {/* 희석 + 살포량 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label className="label">희석배율 *</label>
                  <input className="input" placeholder="예: 500배, 1000배" value={form.dilution}
                    onChange={e => setForm(p => ({ ...p, dilution: e.target.value }))} style={{ fontSize: '14px' }} />
                </div>
                <div>
                  <label className="label">살포량</label>
                  <input className="input" placeholder="예: 20L, 2통" value={form.amount}
                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} style={{ fontSize: '14px' }} />
                </div>
              </div>

              {/* 대상 작물 + 살포 방법 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label className="label">대상 작물</label>
                  <select className="input" value={form.crop}
                    onChange={e => setForm(p => ({ ...p, crop: e.target.value, customCrop: '' }))} style={{ fontSize: '14px' }}>
                    {CROP_OPTIONS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">살포 방법</label>
                  <select className="input" value={form.sprayMethod}
                    onChange={e => setForm(p => ({ ...p, sprayMethod: e.target.value }))} style={{ fontSize: '14px' }}>
                    {SPRAY_METHODS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* 직접입력 작물명 */}
              {form.crop === '직접입력' && (
                <div style={{ marginBottom: '10px' }}>
                  <label className="label">작물명 직접 입력</label>
                  <input className="input" placeholder="예: 여주, 울금" value={form.customCrop}
                    onChange={e => setForm(p => ({ ...p, customCrop: e.target.value }))} style={{ fontSize: '14px' }} />
                </div>
              )}

              {/* 살포 당시 날씨/기온 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label className="label">살포 시 날씨</label>
                  <select className="input" value={form.weather}
                    onChange={e => setForm(p => ({ ...p, weather: e.target.value }))} style={{ fontSize: '14px' }}>
                    <option value="">미기록</option>
                    {['맑음', '구름많음', '흐림', '비 직전', '비 후'].map(w => <option key={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">살포 시 기온</label>
                  <input className="input" placeholder="예: 18°C" value={form.temp}
                    onChange={e => setForm(p => ({ ...p, temp: e.target.value }))} style={{ fontSize: '14px' }} />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="label">메모</label>
                <textarea className="input" placeholder="목적, 효과, 특이사항 등" value={form.memo}
                  onChange={e => setForm(p => ({ ...p, memo: e.target.value }))} rows={2}
                  style={{ fontSize: '14px', resize: 'none', lineHeight: 1.6 }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={cancelLogEdit}>취소</button>
                <button className="btn-primary" onClick={saveLog} disabled={!form.dilution.trim()}>
                  {editingLogId ? '수정' : '저장'}
                </button>
              </div>
            </div>
          )}

          {logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
              <FlaskConical size={36} strokeWidth={1.5} style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: '14px', marginBottom: '6px', fontWeight: 500 }}>사용 기록이 없어요</p>
              <p style={{ fontSize: '12px', lineHeight: 1.8 }}>천연농자재 살포 시 기록해두면<br />최적 타이밍을 파악할 수 있어요</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {logs.map(log => (
                <SwipeableRow
                  key={log.id}
                  onEdit={() => startLogEdit(log)}
                  onDelete={() => requestDelLog(log.id)}
                >
                  <div style={{ padding: '12px 14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{log.date?.replace(/-/g, '.')}</span>
                        <span className="badge badge-info" style={{ fontSize: '10px' }}>{log.material}</span>
                        <span className="badge badge-good" style={{ fontSize: '10px' }}>{log.crop}</span>
                        {log.sprayMethod && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{log.sprayMethod}</span>}
                        {log.weather && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{log.weather}</span>}
                      </div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                        {log.dilution} {log.amount && `· ${log.amount}`}
                        {log.temp && <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '6px' }}>{log.temp}</span>}
                      </p>
                      {log.memo && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>{log.memo}</p>}
                    </div>
                  </div>
                </SwipeableRow>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* ── 레시피 뷰 ── */}
          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginBottom: '16px', padding: '12px' }}
            onClick={() => {
              if (showRecipeForm && !editingRecipeId) {
                cancelRecipeEdit();
              } else {
                cancelRecipeEdit();
                setShowRecipeForm(true);
              }
            }}
          >
            <Plus size={15} strokeWidth={2} /> 레시피 저장
          </button>

          {showRecipeForm && (
            <div className="card mb-4" style={{ borderLeft: '3px solid var(--color-earth)', borderRadius: '0 8px 8px 0' }}>
              <div style={{ marginBottom: '10px' }}>
                <label className="label">레시피 이름 *</label>
                <input className="input" placeholder="예: 여름 탄저병 예방 배합" value={recipeForm.name}
                  onChange={e => setRecipeForm(p => ({ ...p, name: e.target.value }))} style={{ fontSize: '14px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label className="label">자재명</label>
                  <select className="input" value={recipeForm.material}
                    onChange={e => setRecipeForm(p => ({ ...p, material: e.target.value }))} style={{ fontSize: '14px' }}>
                    {MAT_TYPES.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">희석배율</label>
                  <input className="input" placeholder="예: 500배" value={recipeForm.dilution}
                    onChange={e => setRecipeForm(p => ({ ...p, dilution: e.target.value }))} style={{ fontSize: '14px' }} />
                </div>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label className="label">용도</label>
                <input className="input" placeholder="예: 탄저병 예방, 모종 활착 촉진" value={recipeForm.purpose}
                  onChange={e => setRecipeForm(p => ({ ...p, purpose: e.target.value }))} style={{ fontSize: '14px' }} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label className="label">메모</label>
                <input className="input" placeholder="배합 비율, 주의사항 등" value={recipeForm.memo}
                  onChange={e => setRecipeForm(p => ({ ...p, memo: e.target.value }))} style={{ fontSize: '14px' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={cancelRecipeEdit}>취소</button>
                <button className="btn-primary" onClick={saveRecipe} disabled={!recipeForm.name.trim()}>
                  {editingRecipeId ? '수정' : '저장'}
                </button>
              </div>
            </div>
          )}

          {recipes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
              <BookMarked size={36} strokeWidth={1.5} style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontSize: '14px', marginBottom: '6px', fontWeight: 500 }}>저장된 레시피가 없어요</p>
              <p style={{ fontSize: '12px', lineHeight: 1.8 }}>자주 쓰는 배합을 저장해두면<br />사용 기록에서 바로 불러올 수 있어요</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recipes.map(r => (
                <SwipeableRow
                  key={r.id}
                  onEdit={() => startRecipeEdit(r)}
                  onDelete={() => requestDelRecipe(r.id)}
                >
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-earth)' }}>{r.name}</span>
                        <span className="badge badge-info" style={{ fontSize: '10px' }}>{r.material}</span>
                      </div>
                      {r.dilution && <p style={{ fontSize: '13px', fontWeight: 600 }}>희석 {r.dilution}</p>}
                      {r.purpose && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>{r.purpose}</p>}
                      {r.memo && <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '3px' }}>{r.memo}</p>}
                    </div>
                  </div>
                </SwipeableRow>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
