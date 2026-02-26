import { useState, useEffect } from 'react';
import { Plus, Trash2, BookMarked, FlaskConical } from 'lucide-react';
import { db, TABLES } from '../services/dbService';

const MAT_TYPES = ['한방영양제', '토착미생물', '천혜녹즙', '목초액', '님오일', '마늘액', '키토산', '기타'];
const CROP_OPTIONS = ['고추', '토마토', '배추', '상추', '오이', '가지', '감자', '전체', '기타'];

export default function ChemicalLog() {
  const [logs, setLogs] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [view, setView] = useState('log'); // log | recipe
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    material: '한방영양제',
    dilution: '',
    amount: '',
    crop: '전체',
    memo: '',
    recipeId: '',
  });
  const [recipeForm, setRecipeForm] = useState({ name: '', material: '한방영양제', dilution: '', purpose: '', memo: '' });

  const loadLogs    = async () => setLogs(await db.getList(TABLES.CHEM_LOG));
  const loadRecipes = async () => setRecipes(await db.getList(TABLES.RECIPE));

  useEffect(() => { loadLogs(); loadRecipes(); }, []);

  const saveLog = async () => {
    if (!form.dilution.trim()) return;
    await db.add(TABLES.CHEM_LOG, form);
    await loadLogs();
    setForm({ date: new Date().toISOString().slice(0, 10), material: '한방영양제', dilution: '', amount: '', crop: '전체', memo: '', recipeId: '' });
    setShowForm(false);
  };

  const saveRecipe = async () => {
    if (!recipeForm.name.trim()) return;
    await db.add(TABLES.RECIPE, recipeForm);
    await loadRecipes();
    setRecipeForm({ name: '', material: '한방영양제', dilution: '', purpose: '', memo: '' });
    setShowRecipeForm(false);
  };

  const delLog    = async (id) => { await db.delete(TABLES.CHEM_LOG, id); await loadLogs(); };
  const delRecipe = async (id) => { await db.delete(TABLES.RECIPE, id);   await loadRecipes(); };

  const loadRecipe = (recipe) => {
    setForm(p => ({ ...p, material: recipe.material, dilution: recipe.dilution, recipeId: recipe.id, memo: recipe.purpose }));
  };

  return (
    <div>
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
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={15} strokeWidth={2} /> 살포 기록 추가
          </button>

          {showForm && (
            <div className="card mb-4" style={{ borderLeft: '3px solid var(--color-earth)', borderRadius: '0 8px 8px 0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label className="label">날짜</label>
                  <input type="date" className="input" value={form.date}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={{ fontSize: '14px' }} />
                </div>
                <div>
                  <label className="label">자재명</label>
                  <select className="input" value={form.material}
                    onChange={e => setForm(p => ({ ...p, material: e.target.value }))} style={{ fontSize: '14px' }}>
                    {MAT_TYPES.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label className="label">희석배율 *</label>
                  <input className="input" placeholder="예: 500배" value={form.dilution}
                    onChange={e => setForm(p => ({ ...p, dilution: e.target.value }))} style={{ fontSize: '14px' }} />
                </div>
                <div>
                  <label className="label">살포량</label>
                  <input className="input" placeholder="예: 20L" value={form.amount}
                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} style={{ fontSize: '14px' }} />
                </div>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label className="label">대상 작물</label>
                <select className="input" value={form.crop}
                  onChange={e => setForm(p => ({ ...p, crop: e.target.value }))} style={{ fontSize: '14px' }}>
                  {CROP_OPTIONS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label className="label">메모</label>
                <input className="input" placeholder="목적, 특이사항 등" value={form.memo}
                  onChange={e => setForm(p => ({ ...p, memo: e.target.value }))} style={{ fontSize: '14px' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={() => setShowForm(false)}>취소</button>
                <button className="btn-primary" onClick={saveLog} disabled={!form.dilution.trim()}>저장</button>
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
                <div key={log.id} className="card" style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{log.date?.replace(/-/g, '.')}</span>
                        <span className="badge badge-info" style={{ fontSize: '10px' }}>{log.material}</span>
                        <span className="badge badge-good" style={{ fontSize: '10px' }}>{log.crop}</span>
                      </div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                        {log.dilution} {log.amount && `· ${log.amount}`}
                      </p>
                      {log.memo && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>{log.memo}</p>}
                    </div>
                    <button className="btn-icon" style={{ width: '28px', height: '28px', background: '#FFF0F0', color: 'var(--color-danger)', flexShrink: 0 }}
                      onClick={() => delLog(log.id)}>
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
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
            onClick={() => setShowRecipeForm(!showRecipeForm)}
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
                <button className="btn-secondary" onClick={() => setShowRecipeForm(false)}>취소</button>
                <button className="btn-primary" onClick={saveRecipe} disabled={!recipeForm.name.trim()}>저장</button>
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
                <div key={r.id} className="card" style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-earth)' }}>{r.name}</span>
                        <span className="badge badge-info" style={{ fontSize: '10px' }}>{r.material}</span>
                      </div>
                      {r.dilution && <p style={{ fontSize: '13px', fontWeight: 600 }}>희석 {r.dilution}</p>}
                      {r.purpose && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>{r.purpose}</p>}
                      {r.memo && <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '3px' }}>{r.memo}</p>}
                    </div>
                    <button className="btn-icon" style={{ width: '28px', height: '28px', background: '#FFF0F0', color: 'var(--color-danger)', flexShrink: 0 }}
                      onClick={() => delRecipe(r.id)}>
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
