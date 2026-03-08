import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { db, TABLES } from '../services/dbService';
import { formatDate } from '../utils/solarTerms';
import { toast } from './Toast';
import { ConfirmModal } from './ConfirmModal';
import { SwipeableRow } from './SwipeableRow';

const WEATHER_OPTIONS = ['맑음', '흐림', '비', '눈', '바람'];
const WORK_TYPES = ['파종', '정식', '물주기', '방제', '수확', '전정', '멀칭', '기타'];

export default function DailyLog({ addTrigger }) {
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    weather: '맑음',
    workTypes: [],
    content: '',
    memo: '',
  });

  useEffect(() => {
    if (addTrigger) setShowForm(true);
  }, [addTrigger]);

  const load = async () => {
    try {
      setLogs(await db.getList(TABLES.DAILY_LOG));
    } catch {
      toast.error('일지를 불러오지 못했어요');
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ date: new Date().toISOString().slice(0, 10), weather: '맑음', workTypes: [], content: '', memo: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const save = async () => {
    if (!form.content.trim()) return;
    try {
      if (editingId) {
        await db.update(TABLES.DAILY_LOG, editingId, form);
        toast.success('일지가 수정되었어요');
      } else {
        await db.add(TABLES.DAILY_LOG, form);
        toast.success('농사 기록이 저장되었어요');
      }
      await load();
      resetForm();
    } catch {
      toast.error('저장 중 오류가 발생했어요');
    }
  };

  const startEdit = (log) => {
    setForm({ date: log.date, weather: log.weather, workTypes: log.workTypes || [], content: log.content, memo: log.memo || '' });
    setEditingId(log.id);
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

          <div style={{ marginBottom: '12px' }}>
            <label className="label">작업 종류</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {WORK_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => toggleWorkType(type)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '100px',
                    border: '1px solid',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
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
            <button className="btn-secondary" onClick={resetForm}>
              취소
            </button>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>{dateStr}</span>
                        <span className="badge badge-info" style={{ fontSize: '10px' }}>{log.weather}</span>
                        {log.workTypes?.slice(0, 2).map(t => (
                          <span key={t} className="badge badge-good" style={{ fontSize: '10px' }}>{t}</span>
                        ))}
                        {log.workTypes?.length > 2 && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>+{log.workTypes.length - 2}</span>
                        )}
                      </div>
                      <p style={{
                        fontSize: '13px',
                        color: 'var(--text)',
                        lineHeight: 1.6,
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
