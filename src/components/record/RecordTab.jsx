import React, { useState, useMemo } from 'react';
import { useList } from '../../hooks/useList';
import { db, TABLES } from '../../services/dbService';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import Spinner from '../ui/Spinner';
import Modal from '../ui/Modal';
import RecordItem from './RecordItem';
import RecordForm from './RecordForm';
import RecordDetail from './RecordDetail';
import PestDiagnosis from './PestDiagnosis';
import ExportButton from './ExportButton';

export default function RecordTab() {
  const { items: crops, loading: cropsLoading } = useList(TABLES.CROP);
  const { items: logs, loading: logsLoading, reload } = useList(TABLES.DAILY_LOG);

  const [view, setView] = useState('list');
  const [selectedLog, setSelectedLog] = useState(null);
  const [filterCrop, setFilterCrop] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const cropMap = useMemo(() => {
    const m = {};
    crops.forEach((c) => { m[c.id] = c.name; });
    return m;
  }, [crops]);

  const filteredLogs = useMemo(() => {
    if (filterCrop === 'all') return logs;
    return logs.filter((l) => l.cropId === filterCrop);
  }, [logs, filterCrop]);

  const logsForExport = useMemo(() => {
    return filteredLogs.map((l) => ({ ...l, cropName: cropMap[l.cropId] || '' }));
  }, [filteredLogs, cropMap]);

  const handleSaveForm = () => { setView('list'); reload(); };

  const handleSavePest = async (logData) => {
    try {
      const photos = logData.photos || [];
      const paths = [];
      for (const f of photos) {
        if (f instanceof File) {
          const { photoStorage } = await import('../../services/dbService');
          const p = await photoStorage.upload(logData.cropId, f);
          paths.push(p);
        }
      }
      await db.add(TABLES.DAILY_LOG, {
        ...logData,
        photos: paths,
        date: new Date().toISOString().slice(0, 10),
      });
      setView('list');
      reload();
    } catch (err) {
      console.error('병해충 일지 저장 실패:', err);
    }
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
      console.error('삭제 실패:', err);
    }
  };

  const handleView = (log) => { setSelectedLog(log); setView('detail'); };
  const loading = cropsLoading || logsLoading;

  if (view === 'form') {
    return (
      <RecordForm
        crops={crops}
        onSave={handleSaveForm}
        onCancel={() => setView('list')}
      />
    );
  }

  if (view === 'pest') {
    return (
      <PestDiagnosis
        crops={crops}
        onSave={handleSavePest}
        onClose={() => setView('list')}
      />
    );
  }

  if (view === 'detail' && selectedLog) {
    return (
      <RecordDetail
        log={selectedLog}
        cropName={cropMap[selectedLog.cropId]}
        onEdit={() => {}}
        onDelete={(log) => setDeleteTarget(log)}
        onClose={() => { setSelectedLog(null); setView('list'); }}
      />
    );
  }

  return (
    <div className="record-tab">
      {/* Header with CTA */}
      <div className="record-tab-header">
        <div className="page-header">
          <h2 className="page-title">재배 기록</h2>
          <p className="page-subtitle">일일 재배 상태를 기록하세요</p>
        </div>
        <button
          className="record-tab-cta"
          onClick={() => setView('form')}
        >
          + 새 기록
        </button>
      </div>

      {/* Pill-style crop filter chips */}
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
            {c.name}
          </button>
        ))}
      </div>

      {/* Log list */}
      {loading ? (
        <Spinner />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          title="기록이 없습니다"
          description="새 기록을 추가하여 재배 일지를 시작하세요."
        />
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

      {/* Bottom action bar */}
      {filteredLogs.length > 0 && (
        <div className="record-bottom-bar">
          <ExportButton
            logs={logsForExport}
            cropName={filterCrop === 'all' ? '전체' : cropMap[filterCrop] || ''}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setView('pest')}
          >
            병해충 진단
          </Button>
        </div>
      )}

      {/* Delete confirmation modal */}
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
