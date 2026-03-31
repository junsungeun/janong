import React, { useState } from 'react';
import { db, TABLES } from '../../services/dbService';
import { useList } from '../../hooks/useList';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../ui/Toast';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import { Field, Input } from '../ui/Input';

const CATEGORIES = ['채소', '과일', '허브', '곡물', '화훼', '기타'];
const START_TYPES = [{ value: '파종', label: '파종' }, { value: '모종 정식', label: '모종 정식' }];
const EMPTY = { name: '', variety: '', startType: '', plantingDate: '', section: '', category: '' };

export default function CropManager() {
  const { user } = useAuth();
  const { items: crops, loading, reload } = useList(TABLES.CROP, { userId: user?.id });
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (c) => {
    setForm({
      name: c.name || '', variety: c.variety || '',
      startType: c.startType || '', plantingDate: c.plantingDate || '',
      section: c.section || '', category: c.category || '',
    });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editId) await db.update(TABLES.CROP, editId, form);
      else await db.add(TABLES.CROP, form);
      setShowForm(false); setForm(EMPTY); setEditId(null); await reload();
      toast.success(editId ? '작물 정보가 수정되었습니다.' : '작물이 등록되었습니다.');
    } catch (err) {
      console.error(err);
      toast.error(err.message || '저장에 실패했습니다.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await db.delete(TABLES.CROP, deleteTarget.id);
      setDeleteTarget(null);
      await reload();
      toast.success('작물이 삭제되었습니다.');
    } catch (err) {
      console.error(err);
      toast.error(err.message || '삭제에 실패했습니다.');
    }
  };

  const deleteCropName = deleteTarget?.name || '이 작물';

  return (
    <div className="crop-manager">
      <div className="section-header">
        <span className="section-title">작물 관리</span>
        <Button variant="secondary" size="sm" onClick={openCreate}>+ 작물 등록</Button>
      </div>

      {loading ? (
        <Spinner />
      ) : crops.length === 0 ? (
        <div className="crop-manager-empty">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
            <path d="M12 22V12" strokeLinecap="round" />
            <path d="M12 12C12 8 16 5 16 2c-3 0-4 4-4 4" />
            <path d="M12 12C12 8 8 5 8 2c3 0 4 4 4 4" />
            <path d="M4 22h16" strokeLinecap="round" />
          </svg>
          <p className="crop-manager-empty-title">등록된 작물이 없습니다</p>
          <Button variant="primary" size="sm" onClick={openCreate}>작물 등록</Button>
        </div>
      ) : (
        <div className="crop-manager-list">
          {crops.map((crop) => (
            <Card key={crop.id} className="crop-manager-item">
              <div className="crop-manager-item-top">
                <div className="crop-manager-item-info">
                  <span className="crop-manager-name">{crop.name}</span>
                  {crop.variety && <span className="crop-manager-variety">{crop.variety}</span>}
                </div>
                <div className="crop-manager-actions">
                  <button className="crop-manager-action-btn" onClick={() => openEdit(crop)} title="수정" aria-label={`${crop.name} 수정`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button className="crop-manager-action-btn crop-manager-delete" onClick={() => setDeleteTarget(crop)} title="삭제" aria-label={`${crop.name} 삭제`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
              {(crop.plantingDate || crop.section || crop.startType) && (
                <div className="crop-manager-meta">
                  {crop.startType && <span className="crop-manager-meta-item">{crop.startType}</span>}
                  {crop.plantingDate && <span className="crop-manager-meta-item">{crop.plantingDate}</span>}
                  {crop.section && <span className="crop-manager-meta-item">{crop.section}</span>}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content card crop-form-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="crop-form-title">{editId ? '작물 정보 수정' : '새 작물 등록'}</h3>
            <form className="crop-form" onSubmit={handleSubmit}>
              <Field label="작물명 *">
                <Input name="name" value={form.name} onChange={handleChange} placeholder="예: 토마토" required />
              </Field>
              <Field label="품종">
                <Input name="variety" value={form.variety} onChange={handleChange} placeholder="예: 대추방울토마토" />
              </Field>
              <Field label="시작 유형">
                <div className="start-type-chips">
                  {START_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      className={`start-type-chip ${form.startType === t.value ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, startType: form.startType === t.value ? '' : t.value })}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="재배 시작일">
                <Input name="plantingDate" type="date" value={form.plantingDate} onChange={handleChange} />
              </Field>
              <Field label="카테고리">
                <select className="input" name="category" value={form.category} onChange={handleChange}>
                  <option value="">선택 안 함</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="구획 위치">
                <Input name="section" value={form.section} onChange={handleChange} placeholder="예: A-1" />
              </Field>
              <div className="crop-form-actions">
                <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>취소</Button>
                <Button variant="primary" type="submit" disabled={saving}>
                  {saving ? '저장 중...' : editId ? '수정' : '등록'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <Modal
          message={`"${deleteCropName}"을(를) 삭제하시겠습니까? 관련 기록은 유지됩니다.`}
          confirmLabel="삭제"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
