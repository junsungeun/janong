import React, { useState } from 'react';
import { db, TABLES } from '../../services/dbService';
import { useList } from '../../hooks/useList';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import { Field, Input } from '../ui/Input';

const EMPTY_FORM = { name: '', variety: '', plantingDate: '', section: '' };

export default function CropManager() {
  const { items: crops, loading, reload } = useList(TABLES.CROP);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (crop) => {
    setForm({
      name: crop.name || '',
      variety: crop.variety || '',
      plantingDate: crop.plantingDate || '',
      section: crop.section || '',
    });
    setEditId(crop.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await db.update(TABLES.CROP, editId, form);
      } else {
        await db.add(TABLES.CROP, form);
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditId(null);
      await reload();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await db.delete(TABLES.CROP, deleteTarget);
      setDeleteTarget(null);
      await reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="crop-manager">
      <div className="section-header">
        <span className="section-title">작물 관리</span>
        <Button variant="secondary" size="sm" onClick={openCreate}>
          작물 등록
        </Button>
      </div>

      {loading ? (
        <p className="text-muted text-sm">불러오는 중...</p>
      ) : crops.length === 0 ? (
        <p className="text-muted text-sm">등록된 작물이 없습니다.</p>
      ) : (
        <div className="crop-manager-list">
          {crops.map((crop) => (
            <Card key={crop.id} className="crop-manager-item">
              <div className="crop-manager-item-top">
                <div>
                  <span className="crop-manager-name">{crop.name}</span>
                  {crop.variety && (
                    <span className="crop-manager-variety">{crop.variety}</span>
                  )}
                </div>
                <div className="crop-manager-actions">
                  <button className="btn-ghost" onClick={() => openEdit(crop)}>수정</button>
                  <button className="btn-ghost crop-manager-delete" onClick={() => setDeleteTarget(crop.id)}>삭제</button>
                </div>
              </div>
              <div className="crop-manager-meta">
                {crop.plantingDate && <span>파종: {crop.plantingDate}</span>}
                {crop.section && <span>구획: {crop.section}</span>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form overlay */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <h3 className="crop-form-title">
              {editId ? '작물 수정' : '작물 등록'}
            </h3>
            <form className="crop-form" onSubmit={handleSubmit}>
              <Field label="작물명" required>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="예: 토마토"
                  required
                />
              </Field>
              <Field label="품종">
                <Input
                  name="variety"
                  value={form.variety}
                  onChange={handleChange}
                  placeholder="예: 대추방울토마토"
                />
              </Field>
              <Field label="파종일">
                <Input
                  name="plantingDate"
                  type="date"
                  value={form.plantingDate}
                  onChange={handleChange}
                />
              </Field>
              <Field label="구획">
                <Input
                  name="section"
                  value={form.section}
                  onChange={handleChange}
                  placeholder="예: A-1"
                />
              </Field>
              <div className="crop-form-actions">
                <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>
                  취소
                </Button>
                <Button variant="primary" type="submit" disabled={saving}>
                  {saving ? '저장 중...' : editId ? '수정' : '등록'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <Modal
          message="이 작물을 삭제하시겠습니까? 관련 기록은 유지됩니다."
          confirmLabel="삭제"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
