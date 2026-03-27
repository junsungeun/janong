import React, { useState, useMemo, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { toast } from '../ui/Toast';
import { useList } from '../../hooks/useList';
import { useAuth } from '../../contexts/AuthContext';
import { db, TABLES } from '../../services/dbService';
import Spinner from '../ui/Spinner';
import Modal from '../ui/Modal';
import RecordItem from './RecordItem';
import RecordForm from './RecordForm';
import RecordDetail from './RecordDetail';

export default function RecordTab({ initialCropFilter }) {
  const { user } = useAuth();
  const { items: crops, loading: cropsLoading } = useList(TABLES.CROP, { userId: user?.id });
  const { items: logs, loading: logsLoading, reload } = useList(TABLES.DAILY_LOG, { userId: user?.id });

  const [view, setView] = useState('list');
  const [selectedLog, setSelectedLog] = useState(null);
  const [editLog, setEditLog] = useState(null);
  const [filterCrop, setFilterCrop] = useState(initialCropFilter || 'all');

  useEffect(() => {
    if (initialCropFilter) setFilterCrop(initialCropFilter);
  }, [initialCropFilter]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const cropMap = useMemo(() => {
    const m = {};
    crops.forEach((c) => { m[c.id] = c.variety ? `${c.name} · ${c.variety}` : c.name; });
    return m;
  }, [crops]);

  const filteredLogs = useMemo(() => {
    if (filterCrop === 'all') return logs;
    return logs.filter((l) => l.cropId === filterCrop);
  }, [logs, filterCrop]);

  const handleSaveForm = () => { setView('list'); setEditLog(null); reload(); };

  const handleEdit = (log) => {
    setEditLog(log);
    setSelectedLog(null);
    setView('form');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await db.delete(TABLES.DAILY_LOG, deleteTarget.id);
      setDeleteTarget(null);
      setSelectedLog(null);
      setView('list');
      reload();
    } catch (err) {
      toast.error(err.message || '삭제에 실패했습니다.');
    }
  };

  const handleView = (log) => { setSelectedLog(log); setView('detail'); };
  const loading = cropsLoading || logsLoading;

  if (view === 'form') {
    return (
      <RecordForm
        crops={crops}
        editLog={editLog}
        onSave={handleSaveForm}
        onCancel={() => { setView(editLog ? 'detail' : 'list'); setEditLog(null); }}
      />
    );
  }
  if (view === 'detail' && selectedLog) {
    return (
      <RecordDetail
        log={selectedLog}
        cropName={cropMap[selectedLog.cropId]}
        onEdit={handleEdit}
        onDelete={(log) => setDeleteTarget(log)}
        onClose={() => { setSelectedLog(null); setView('list'); }}
      />
    );
  }

  return (
    <div className="record-tab">
      <div className="record-tab-header">
        <div className="page-header">
          <div className="record-tab-title-row">
            <h2 className="page-title">재배 기록</h2>
            {logs.length > 0 && (
              <span className="record-tab-count-badge">{logs.length}</span>
            )}
          </div>
          <p className="page-subtitle">일일 재배 상태를 기록하세요</p>
        </div>
        <button className="record-tab-cta" onClick={() => { setEditLog(null); setView('form'); }}>
          + 새 기록
        </button>
      </div>

      <div className="record-filter-chips">
        <button
          className={`record-chip ${filterCrop === 'all' ? 'active' : ''}`}
          onClick={() => setFilterCrop('all')}
        >
          전체
        </button>
        {crops.map((c) => (
          <button
            key={c.id}
            className={`record-chip ${filterCrop === c.id ? 'active' : ''}`}
            onClick={() => setFilterCrop(c.id)}
          >
            {c.variety ? `${c.name} · ${c.variety}` : c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : filteredLogs.length === 0 ? (
        <div className="record-empty-state">
          <div className="record-empty-icon">
            <BookOpen size={40} strokeWidth={1.5} />
          </div>
          <p className="record-empty-title">기록이 없습니다</p>
          <p className="record-empty-desc">새 기록을 추가하여 재배 일지를 시작하세요.</p>
          <button className="record-empty-btn" onClick={() => { setEditLog(null); setView('form'); }}>
            첫 기록 남기기
          </button>
        </div>
      ) : (
        <div className="record-list">
          {filteredLogs.map((log) => (
            <RecordItem
              key={log.id}
              log={log}
              cropName={cropMap[log.cropId]}
              onView={handleView}
              onDelete={(l) => setDeleteTarget(l)}
            />
          ))}
        </div>
      )}

      {deleteTarget && (
        <Modal
          message="이 기록을 삭제하시겠습니까?"
          confirmLabel="삭제"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
