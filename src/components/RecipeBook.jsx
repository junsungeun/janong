import { useState, useEffect } from 'react';
import { Plus, FlaskConical, ChevronDown, ChevronUp, Trash2, Copy, Check } from 'lucide-react';
import { db, TABLES } from '../services/dbService';

const PURPOSE_OPTS = [
  '병해충 예방', '생장 촉진', '면역 강화', '수확 후 처리',
  '토양 개선', '모종 활착', '기타',
];

export default function RecipeBook() {
  const [recipes, setRecipes]     = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [expandedId, setExpanded] = useState(null);
  const [copied, setCopied]       = useState(null);
  const [form, setForm] = useState({
    name: '', materials: '', dilution: '', purpose: '병해충 예방', note: '',
  });

  const load = async () => setRecipes(await db.getList(TABLES.RECIPE));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name.trim()) return;
    await db.add(TABLES.RECIPE, { ...form });
    await load();
    setForm({ name: '', materials: '', dilution: '', purpose: '병해충 예방', note: '' });
    setShowForm(false);
  };

  const del = async (id) => { await db.delete(TABLES.RECIPE, id); await load(); };

  const copyToClipboard = (recipe) => {
    const text = `[${recipe.name}]\n재료: ${recipe.materials}\n희석배율: ${recipe.dilution}\n용도: ${recipe.purpose}${recipe.note ? '\n메모: ' + recipe.note : ''}`;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(recipe.id);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <span className="section-title">천연농자재 레시피</span>
        <button
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px' }}
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={14} strokeWidth={2} /> 레시피 추가
        </button>
      </div>

      {/* ── 등록 폼 ── */}
      {showForm && (
        <div className="card mb-4" style={{
          padding: '18px 20px',
          borderLeft: '3px solid var(--color-primary)',
          borderRadius: '0 8px 8px 0',
        }}>
          <div style={{ marginBottom: '10px' }}>
            <label className="label">레시피 이름 *</label>
            <input
              className="input"
              placeholder="예: 여름 탄저병 예방 배합"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              autoFocus
              style={{ fontSize: '14px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label className="label">재료 구성</label>
            <textarea
              className="input"
              placeholder="예: 토착미생물 1 + 천혜녹즙 0.5 + 한방영양제 0.5"
              value={form.materials}
              onChange={e => setForm(p => ({ ...p, materials: e.target.value }))}
              rows={2}
              style={{ fontSize: '14px', lineHeight: 1.7, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label className="label">희석배율</label>
              <input
                className="input"
                placeholder="예: 500배"
                value={form.dilution}
                onChange={e => setForm(p => ({ ...p, dilution: e.target.value }))}
                style={{ fontSize: '14px' }}
              />
            </div>
            <div>
              <label className="label">용도</label>
              <select
                className="input"
                value={form.purpose}
                onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))}
                style={{ fontSize: '14px' }}
              >
                {PURPOSE_OPTS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label className="label">메모</label>
            <input
              className="input"
              placeholder="살포 타이밍, 주의사항 등"
              value={form.note}
              onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
              style={{ fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>취소</button>
            <button className="btn-primary" onClick={save} disabled={!form.name.trim()}>저장</button>
          </div>
        </div>
      )}

      {/* ── 레시피 목록 ── */}
      {recipes.length === 0 && !showForm ? (
        <div style={{ textAlign: 'center', padding: '52px 20px', color: 'var(--text-muted)' }}>
          <FlaskConical size={40} strokeWidth={1.5} style={{ margin: '0 auto 14px', display: 'block', opacity: 0.35 }} />
          <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>저장된 레시피가 없어요</p>
          <p style={{ fontSize: '12px', lineHeight: 1.8 }}>
            자주 쓰는 천연농자재 배합을<br />레시피로 저장해두면 편리해요
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recipes.map(recipe => {
            const isOpen = expandedId === recipe.id;
            return (
              <div
                key={recipe.id}
                className="card"
                style={{ padding: '14px 16px' }}
              >
                {/* 헤더 행 */}
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => setExpanded(isOpen ? null : recipe.id)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                        {recipe.name}
                      </span>
                      <span style={{
                        fontSize: '10px', padding: '2px 8px', borderRadius: '100px',
                        background: 'var(--color-primary-light)', color: 'var(--color-primary)',
                        fontWeight: 600,
                      }}>
                        {recipe.purpose}
                      </span>
                    </div>
                    {!isOpen && recipe.dilution && (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                        희석 {recipe.dilution}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    {isOpen && (
                      <>
                        <button
                          className="btn-icon"
                          style={{ width: '28px', height: '28px', background: 'var(--bg-subtle)' }}
                          onClick={e => { e.stopPropagation(); copyToClipboard(recipe); }}
                          title="클립보드 복사"
                        >
                          {copied === recipe.id
                            ? <Check size={13} strokeWidth={2} color="var(--color-primary)" />
                            : <Copy size={13} strokeWidth={1.5} />
                          }
                        </button>
                        <button
                          className="btn-icon"
                          style={{ width: '28px', height: '28px', background: '#FFF0F0', color: 'var(--color-danger)' }}
                          onClick={e => { e.stopPropagation(); del(recipe.id); }}
                        >
                          <Trash2 size={13} strokeWidth={1.5} />
                        </button>
                      </>
                    )}
                    {isOpen
                      ? <ChevronUp   size={16} color="var(--text-muted)" />
                      : <ChevronDown size={16} color="var(--text-muted)" />
                    }
                  </div>
                </div>

                {/* 상세 */}
                {isOpen && (
                  <div style={{
                    marginTop: '14px',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}>
                    {recipe.materials && (
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>재료 구성</p>
                        <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>{recipe.materials}</p>
                      </div>
                    )}
                    {recipe.dilution && (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>희석배율</span>
                        <span style={{
                          fontSize: '13px', fontWeight: 700,
                          color: 'var(--color-primary)',
                          background: 'var(--color-primary-light)',
                          padding: '2px 10px', borderRadius: '100px',
                        }}>
                          {recipe.dilution}
                        </span>
                      </div>
                    )}
                    {recipe.note && (
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>메모</p>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>{recipe.note}</p>
                      </div>
                    )}
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {recipe.createdAt?.slice(0, 10).replace(/-/g, '.')} 저장
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
