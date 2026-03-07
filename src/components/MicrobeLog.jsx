import { useState, useEffect } from 'react';
import {
  Plus, FlaskConical, ChevronDown, ChevronUp,
  CheckCircle, Trash2, ClipboardList, Pencil, X,
} from 'lucide-react';
import { db, TABLES } from '../services/dbService';
import { ConfirmModal } from './ConfirmModal';
import { toast } from './Toast';

// 배양 상태
const STATUS = {
  brewing: { label: '배양 중',   color: 'var(--color-earth)',   bg: '#FFF8F0' },
  done:    { label: '배양 완성', color: 'var(--color-primary)', bg: 'var(--color-primary-light)' },
  applied: { label: '투입 완료', color: 'var(--border)',        bg: 'var(--bg-subtle)' },
};

const today = () => new Date().toISOString().slice(0, 10);

export default function MicrobeLog() {
  const [batches, setBatches]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpanded] = useState(null);
  const [checkForms, setCheckForms] = useState({}); // batchId -> check form state
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [editBatchForm, setEditBatchForm] = useState({});
  const [confirmDeleteBatchId, setConfirmDeleteBatchId] = useState(null);
  const [confirmDeleteCheck, setConfirmDeleteCheck] = useState(null); // { batchId, checkId }

  const [form, setForm] = useState({
    startDate: today(),
    materials: '',
    temp: '',
    location: '',
    targetCrop: '',
    note: '',
  });

  const load = async () => {
    try {
      setBatches(await db.getList(TABLES.MICROBE_LOG));
    } catch (err) {
      toast.error('배양 목록을 불러오지 못했어요');
    }
  };
  useEffect(() => { load(); }, []);

  // ── 배양 등록 ──────────────────────────────────────────────────────
  const addBatch = async () => {
    if (!form.startDate) return;
    try {
      await db.add(TABLES.MICROBE_LOG, {
        ...form,
        status: 'brewing',
        checks: [],
      });
      await load();
      setForm({ startDate: today(), materials: '', temp: '', location: '', targetCrop: '', note: '' });
      setShowForm(false);
      toast.success('배양이 등록되었어요');
    } catch (err) {
      toast.error('배양 등록에 실패했어요');
    }
  };

  // ── 일별 상태 체크 추가 ─────────────────────────────────────────────
  const addCheck = async (batchId) => {
    const cf = checkForms[batchId] || initCheckForm();
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;
    try {
      const newChecks = [
        ...(batch.checks || []),
        { ...cf, id: Date.now().toString(), createdAt: new Date().toISOString() },
      ];
      await db.update(TABLES.MICROBE_LOG, batchId, { checks: newChecks });
      await load();
      setCheckForms(p => ({ ...p, [batchId]: initCheckForm() }));
      toast.success('상태 기록이 추가되었어요');
    } catch (err) {
      toast.error('상태 기록 추가에 실패했어요');
    }
  };

  const initCheckForm = () => ({
    date: today(), smell: 'ok', color: 'ok', foam: true, note: '',
  });

  const setCheckForm = (batchId, updates) => {
    setCheckForms(p => ({ ...p, [batchId]: { ...(p[batchId] || initCheckForm()), ...updates } }));
  };

  // ── 상태 전환 ───────────────────────────────────────────────────────
  const markDone = async (id) => {
    try {
      await db.update(TABLES.MICROBE_LOG, id, { status: 'done', completedAt: today() });
      await load();
      toast.success('배양 완성으로 표시했어요');
    } catch (err) {
      toast.error('상태 변경에 실패했어요');
    }
  };

  const markApplied = async (id) => {
    try {
      await db.update(TABLES.MICROBE_LOG, id, { status: 'applied', appliedAt: today() });
      await load();
      toast.success('투입 완료로 표시했어요');
    } catch (err) {
      toast.error('상태 변경에 실패했어요');
    }
  };

  const del = async (id) => {
    try {
      await db.delete(TABLES.MICROBE_LOG, id);
      await load();
      toast.success('배양 기록이 삭제되었어요');
    } catch (err) {
      toast.error('배양 기록 삭제에 실패했어요');
    }
  };

  // ── 개별 체크 삭제 ──────────────────────────────────────────────────
  const deleteCheck = async (batchId, checkId) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;
    try {
      const newChecks = (batch.checks || []).filter(c => c.id !== checkId);
      await db.update(TABLES.MICROBE_LOG, batchId, { checks: newChecks });
      await load();
      toast.success('관찰 기록이 삭제되었어요');
    } catch (err) {
      toast.error('관찰 기록 삭제에 실패했어요');
    }
  };

  // ── 배양 정보 수정 ──────────────────────────────────────────────────
  const startEditBatch = (batch) => {
    setEditingBatchId(batch.id);
    setEditBatchForm({
      materials: batch.materials || '',
      location: batch.location || '',
      startDate: batch.startDate || today(),
      temp: batch.temp || '',
      note: batch.note || '',
      targetCrop: batch.targetCrop || '',
    });
  };

  const cancelEditBatch = () => {
    setEditingBatchId(null);
    setEditBatchForm({});
  };

  const saveEditBatch = async () => {
    if (!editingBatchId) return;
    try {
      await db.update(TABLES.MICROBE_LOG, editingBatchId, { ...editBatchForm });
      await load();
      setEditingBatchId(null);
      setEditBatchForm({});
      toast.success('배양 정보가 수정되었어요');
    } catch (err) {
      toast.error('배양 정보 수정에 실패했어요');
    }
  };

  // 경과일 계산
  const elapsed = (dateStr) => {
    const diff = Math.round((Date.now() - new Date(dateStr)) / 86400000);
    return diff;
  };

  // 체크 상태 이모지
  const smellIcon  = v => v === 'ok' ? '✅' : '⚠️';
  const colorIcon  = v => v === 'ok' ? '✅' : '⚠️';
  const foamIcon   = v => v ? '🫧' : '—';

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <span className="section-title">토착미생물 배양 일지</span>
        <button
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px' }}
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={14} strokeWidth={2} /> 배양 시작
        </button>
      </div>

      {/* ── 배양 등록 폼 ── */}
      {showForm && (
        <div className="card mb-4" style={{
          padding: '18px 20px',
          borderLeft: '3px solid var(--color-earth)',
          borderRadius: '0 8px 8px 0',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label className="label">배양 시작일 *</label>
              <input
                type="date"
                className="input"
                value={form.startDate}
                onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                style={{ fontSize: '14px' }}
              />
            </div>
            <div>
              <label className="label">투입 예정 작물</label>
              <input
                className="input"
                placeholder="예: 고추, 전 작물"
                value={form.targetCrop}
                onChange={e => setForm(p => ({ ...p, targetCrop: e.target.value }))}
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label className="label">재료 구성</label>
            <textarea
              className="input"
              placeholder="예: 밥 1kg + 황설탕 1kg + 산야초효소 1L"
              value={form.materials}
              onChange={e => setForm(p => ({ ...p, materials: e.target.value }))}
              rows={2}
              style={{ fontSize: '14px', lineHeight: 1.7, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label className="label">배양 온도</label>
              <input
                className="input"
                placeholder="예: 25°C 유지"
                value={form.temp}
                onChange={e => setForm(p => ({ ...p, temp: e.target.value }))}
                style={{ fontSize: '14px' }}
              />
            </div>
            <div>
              <label className="label">배양 장소</label>
              <input
                className="input"
                placeholder="예: 창고 북쪽 선반"
                value={form.location}
                onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label className="label">메모</label>
            <input
              className="input"
              placeholder="특이사항, 채취 장소 등"
              value={form.note}
              onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
              style={{ fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>취소</button>
            <button className="btn-primary" onClick={addBatch}>배양 시작</button>
          </div>
        </div>
      )}

      {/* ── 배양 목록 ── */}
      {batches.length === 0 && !showForm ? (
        <div style={{ textAlign: 'center', padding: '52px 20px', color: 'var(--text-muted)' }}>
          <FlaskConical size={40} strokeWidth={1.5} style={{ margin: '0 auto 14px', display: 'block', opacity: 0.35 }} />
          <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>배양 기록이 없어요</p>
          <p style={{ fontSize: '12px', lineHeight: 1.8 }}>
            토착미생물 배양을 시작하면<br />일별 상태를 체크하고 기록할 수 있어요
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {batches.map(batch => {
            const st      = STATUS[batch.status] || STATUS.brewing;
            const isOpen  = expandedId === batch.id;
            const cf      = checkForms[batch.id] || initCheckForm();
            const days    = elapsed(batch.startDate);
            const lastCheck = batch.checks?.[batch.checks.length - 1];
            const isEditing = editingBatchId === batch.id;

            return (
              <div key={batch.id} className="card" style={{ padding: '16px' }}>
                {/* 카드 헤더 */}
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer' }}
                  onClick={() => setExpanded(isOpen ? null : batch.id)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 700, padding: '3px 10px',
                        borderRadius: '100px', background: st.bg, color: st.color,
                      }}>
                        {st.label}
                      </span>
                      {batch.targetCrop && (
                        <span className="badge badge-info" style={{ fontSize: '10px' }}>{batch.targetCrop}</span>
                      )}
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
                      {batch.startDate.replace(/-/g, '.')} 배양 시작
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      경과 {days}일
                      {lastCheck && ` · 최근 체크: ${lastCheck.date.slice(5).replace('-', '.')}`}
                      {batch.checks?.length > 0 && ` (${batch.checks.length}회)`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    {isOpen && (
                      <>
                        <button
                          className="btn-icon"
                          style={{ width: '28px', height: '28px', background: 'var(--bg-subtle)' }}
                          onClick={e => { e.stopPropagation(); startEditBatch(batch); }}
                          title="수정"
                        >
                          <Pencil size={13} strokeWidth={1.5} />
                        </button>
                        <button
                          className="btn-icon"
                          style={{ width: '28px', height: '28px', background: '#FFF0F0', color: 'var(--color-danger)' }}
                          onClick={e => { e.stopPropagation(); setConfirmDeleteBatchId(batch.id); }}
                        >
                          <Trash2 size={13} strokeWidth={1.5} />
                        </button>
                      </>
                    )}
                    {isOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  </div>
                </div>

                {/* 상세 */}
                {isOpen && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>

                    {/* 배양 정보 수정 폼 */}
                    {isEditing ? (
                      <div style={{
                        background: 'var(--bg-subtle)', borderRadius: '10px',
                        padding: '14px', marginBottom: '16px',
                      }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                          <div>
                            <label className="label">배양 시작일</label>
                            <input
                              type="date"
                              className="input"
                              value={editBatchForm.startDate}
                              onChange={e => setEditBatchForm(p => ({ ...p, startDate: e.target.value }))}
                              style={{ fontSize: '13px' }}
                            />
                          </div>
                          <div>
                            <label className="label">투입 예정 작물</label>
                            <input
                              className="input"
                              placeholder="예: 고추"
                              value={editBatchForm.targetCrop}
                              onChange={e => setEditBatchForm(p => ({ ...p, targetCrop: e.target.value }))}
                              style={{ fontSize: '13px' }}
                            />
                          </div>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <label className="label">재료 구성</label>
                          <textarea
                            className="input"
                            value={editBatchForm.materials}
                            onChange={e => setEditBatchForm(p => ({ ...p, materials: e.target.value }))}
                            rows={2}
                            style={{ fontSize: '13px', lineHeight: 1.6, resize: 'vertical' }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                          <div>
                            <label className="label">배양 온도</label>
                            <input
                              className="input"
                              value={editBatchForm.temp}
                              onChange={e => setEditBatchForm(p => ({ ...p, temp: e.target.value }))}
                              style={{ fontSize: '13px' }}
                            />
                          </div>
                          <div>
                            <label className="label">배양 장소</label>
                            <input
                              className="input"
                              value={editBatchForm.location}
                              onChange={e => setEditBatchForm(p => ({ ...p, location: e.target.value }))}
                              style={{ fontSize: '13px' }}
                            />
                          </div>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          <label className="label">메모</label>
                          <input
                            className="input"
                            value={editBatchForm.note}
                            onChange={e => setEditBatchForm(p => ({ ...p, note: e.target.value }))}
                            style={{ fontSize: '13px' }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="btn-secondary" onClick={cancelEditBatch}>취소</button>
                          <button className="btn-primary" onClick={saveEditBatch}>수정</button>
                        </div>
                      </div>
                    ) : (
                      /* 기본 정보 (읽기 모드) */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                        {batch.materials && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0, width: '48px' }}>재료</span>
                            <span style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>{batch.materials}</span>
                          </div>
                        )}
                        {(batch.temp || batch.location) && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0, width: '48px' }}>환경</span>
                            <span style={{ fontSize: '13px', color: 'var(--text)' }}>
                              {[batch.temp, batch.location].filter(Boolean).join(' · ')}
                            </span>
                          </div>
                        )}
                        {batch.note && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0, width: '48px' }}>메모</span>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{batch.note}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 상태 전환 버튼 */}
                    {batch.status === 'brewing' && (
                      <button
                        onClick={() => markDone(batch.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '9px 16px', borderRadius: '8px',
                          background: 'var(--color-primary-light)',
                          border: '1px solid var(--color-primary)',
                          color: 'var(--color-primary)', fontSize: '13px', fontWeight: 600,
                          cursor: 'pointer', fontFamily: 'var(--font-sans)',
                          marginBottom: '16px',
                        }}
                      >
                        <CheckCircle size={15} strokeWidth={1.5} /> 배양 완성으로 표시
                      </button>
                    )}
                    {batch.status === 'done' && (
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        <button
                          onClick={() => markApplied(batch.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '9px 16px', borderRadius: '8px',
                            background: 'var(--color-primary)', border: 'none',
                            color: '#fff', fontSize: '13px', fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'var(--font-sans)',
                          }}
                        >
                          <CheckCircle size={15} strokeWidth={1.5} /> 투입 완료 처리
                        </button>
                      </div>
                    )}

                    {/* 일별 상태 체크 */}
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>
                        일별 상태 체크
                      </p>

                      {/* 체크 추가 폼 (배양 중일 때만) */}
                      {batch.status === 'brewing' && (
                        <div style={{
                          background: 'var(--bg-subtle)', borderRadius: '10px',
                          padding: '14px', marginBottom: '10px',
                        }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                            <div>
                              <label className="label">날짜</label>
                              <input
                                type="date"
                                className="input"
                                value={cf.date}
                                onChange={e => setCheckForm(batch.id, { date: e.target.value })}
                                style={{ fontSize: '14px' }}
                              />
                            </div>
                            <div>
                              <label className="label">거품</label>
                              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                                {[{ v: true, label: '있음 🫧' }, { v: false, label: '없음' }].map(opt => (
                                  <button
                                    key={String(opt.v)}
                                    onClick={() => setCheckForm(batch.id, { foam: opt.v })}
                                    style={{
                                      flex: 1, padding: '8px 4px', borderRadius: '6px', fontSize: '12px',
                                      border: '1.5px solid', fontFamily: 'var(--font-sans)', cursor: 'pointer',
                                      borderColor: cf.foam === opt.v ? 'var(--color-primary)' : 'var(--border)',
                                      background:  cf.foam === opt.v ? 'var(--color-primary-light)' : 'transparent',
                                      color:       cf.foam === opt.v ? 'var(--color-primary)' : 'var(--text-muted)',
                                    }}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                            {[
                              { key: 'smell', label: '냄새' },
                              { key: 'color', label: '색상' },
                            ].map(({ key, label }) => (
                              <div key={key}>
                                <label className="label">{label}</label>
                                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                                  {[{ v: 'ok', label: '정상 ✅' }, { v: 'bad', label: '이상 ⚠️' }].map(opt => (
                                    <button
                                      key={opt.v}
                                      onClick={() => setCheckForm(batch.id, { [key]: opt.v })}
                                      style={{
                                        flex: 1, padding: '8px 4px', borderRadius: '6px', fontSize: '11px',
                                        border: '1.5px solid', fontFamily: 'var(--font-sans)', cursor: 'pointer',
                                        borderColor: cf[key] === opt.v ? (opt.v === 'ok' ? 'var(--color-primary)' : 'var(--color-danger)') : 'var(--border)',
                                        background:  cf[key] === opt.v ? (opt.v === 'ok' ? 'var(--color-primary-light)' : '#FFF0F0') : 'transparent',
                                        color:       cf[key] === opt.v ? (opt.v === 'ok' ? 'var(--color-primary)' : 'var(--color-danger)') : 'var(--text-muted)',
                                      }}
                                    >
                                      {opt.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div style={{ marginBottom: '10px' }}>
                            <label className="label">메모</label>
                            <input
                              className="input"
                              placeholder="관찰 내용 메모"
                              value={cf.note}
                              onChange={e => setCheckForm(batch.id, { note: e.target.value })}
                              style={{ fontSize: '13px' }}
                            />
                          </div>

                          <button
                            className="btn-primary"
                            onClick={() => addCheck(batch.id)}
                            style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '13px' }}
                          >
                            <ClipboardList size={14} strokeWidth={1.5} /> 상태 기록
                          </button>
                        </div>
                      )}

                      {/* 체크 기록 목록 */}
                      {batch.checks?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {[...batch.checks].reverse().map(chk => (
                            <div
                              key={chk.id}
                              style={{
                                display: 'flex', gap: '10px', alignItems: 'center',
                                padding: '10px 12px', background: 'var(--bg-card)',
                                border: '1px solid var(--border-light)', borderRadius: '8px',
                              }}
                            >
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0, width: '44px' }}>
                                {chk.date.slice(5).replace('-', '.')}
                              </span>
                              <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                                <span style={{ fontSize: '12px' }}>냄새 {smellIcon(chk.smell)}</span>
                                <span style={{ fontSize: '12px' }}>색상 {colorIcon(chk.color)}</span>
                                <span style={{ fontSize: '12px' }}>거품 {foamIcon(chk.foam)}</span>
                              </div>
                              {chk.note && (
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                  {chk.note}
                                </span>
                              )}
                              {/* Delete check button */}
                              <button
                                onClick={() => setConfirmDeleteCheck({ batchId: batch.id, checkId: chk.id })}
                                style={{
                                  width: '20px', height: '20px', borderRadius: '50%',
                                  background: 'transparent', border: 'none',
                                  color: 'var(--text-muted)', cursor: 'pointer', display: 'flex',
                                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}
                              >
                                <X size={12} strokeWidth={1.5} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                          아직 체크 기록이 없어요
                        </p>
                      )}
                    </div>

                    {/* 완성/투입일 */}
                    {batch.completedAt && (
                      <p style={{ fontSize: '12px', color: 'var(--color-primary)', marginTop: '8px' }}>
                        배양 완성일: {batch.completedAt.replace(/-/g, '.')}
                      </p>
                    )}
                    {batch.appliedAt && (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        투입 완료일: {batch.appliedAt.replace(/-/g, '.')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Batch delete confirmation modal */}
      {confirmDeleteBatchId && (
        <ConfirmModal
          message="이 배양 기록을 삭제할까요? 관찰 기록도 함께 삭제됩니다."
          onConfirm={() => { del(confirmDeleteBatchId); setConfirmDeleteBatchId(null); }}
          onCancel={() => setConfirmDeleteBatchId(null)}
        />
      )}

      {/* Check delete confirmation modal */}
      {confirmDeleteCheck && (
        <ConfirmModal
          message="이 관찰 기록을 삭제할까요?"
          onConfirm={() => { deleteCheck(confirmDeleteCheck.batchId, confirmDeleteCheck.checkId); setConfirmDeleteCheck(null); }}
          onCancel={() => setConfirmDeleteCheck(null)}
        />
      )}
    </div>
  );
}
