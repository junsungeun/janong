import { useState, useEffect, useMemo } from 'react';
import { db, TABLES } from '../../services/dbService';
import { Download, Search, Trash2, Eye } from 'lucide-react';
import { exportCsv } from '../../utils/exportCsv';
import { toast } from '../ui/Toast';

export default function AdminData() {
  const [logs, setLogs] = useState([]);
  const [crops, setCrops] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCrop, setFilterCrop] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [l, c, p] = await Promise.all([
      db.getAllList(TABLES.DAILY_LOG),
      db.getAllList(TABLES.CROP),
      db.getAllList(TABLES.PROFILE),
    ]);
    setLogs(l); setCrops(c); setProfiles(p);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const cropMap = useMemo(() => Object.fromEntries(crops.map((c) => [c.id, c])), [crops]);
  const profileMap = useMemo(() => Object.fromEntries(profiles.map((p) => [p.id, p])), [profiles]);
  const groups = useMemo(() => [...new Set(profiles.map((p) => p.groupName || p.group_name).filter(Boolean))], [profiles]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const crop = cropMap[l.cropId];
      if (filterCrop !== 'all' && l.cropId !== filterCrop) return false;
      if (filterGroup !== 'all') {
        const profile = crop ? profileMap[crop.userId] : null;
        if ((profile?.groupName || profile?.group_name) !== filterGroup) return false;
      }
      return true;
    });
  }, [logs, filterCrop, filterGroup, cropMap, profileMap]);

  const handleExport = () => {
    const rows = filtered.map((l) => {
      const crop = cropMap[l.cropId];
      const profile = crop ? profileMap[crop.userId] : null;
      return {
        날짜: l.date || '',
        조: profile?.groupName || profile?.group_name || '',
        작물: crop?.name || '',
        카테고리: crop?.category || '',
        단계: l.stage || '',
        '하우스온도': l.houseTemp ?? l.temperature ?? '',
        '하우스습도': l.houseHumidity ?? l.humidity ?? '',
        '실외온도': l.outdoorTemp ?? '',
        '키(cm)': l.heightCm ?? '',
        '잎수': l.leafCount ?? '',
        '줄기(mm)': l.stemMm ?? '',
        메모: l.memo || '',
      };
    });
    exportCsv(rows, `SeedLog_데이터_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await db.delete(TABLES.DAILY_LOG, deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (e) { console.error(e); toast.error(e.message || '삭제에 실패했습니다.'); }
    setDeleting(false);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">데이터 관리</h1>
        <button className="btn-primary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}>
          <Download size={16} /> 내보내기 ({filtered.length}건)
        </button>
      </div>

      <div className="admin-filters">
        <select className="admin-select" value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
          <option value="all">전체 조</option>
          {groups.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select className="admin-select" value={filterCrop} onChange={(e) => setFilterCrop(e.target.value)}>
          <option value="all">전체 작물</option>
          {crops.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <span className="admin-page-count">{filtered.length}건</span>
      </div>

      {loading ? <p className="admin-loading">로딩 중...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>날짜</th><th>작물</th><th>단계</th><th>온도</th><th>키</th><th>잎</th><th>메모</th><th>관리</th></tr></thead>
            <tbody>
              {filtered.slice(0, 200).map((l) => (
                <tr key={l.id}>
                  <td>{l.date}</td>
                  <td>{cropMap[l.cropId]?.name || '-'}</td>
                  <td>{l.stage || '-'}</td>
                  <td>{l.houseTemp ?? l.temperature ?? '-'}</td>
                  <td>{l.heightCm ?? '-'}</td>
                  <td>{l.leafCount ?? '-'}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(l.memo || '').slice(0, 40)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="admin-action-btn" title="상세" onClick={() => setDetailTarget(l)}><Eye size={14} /></button>
                      <button className="admin-action-btn admin-action-btn--danger" title="삭제" onClick={() => setDeleteTarget(l)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 200 && <p className="admin-table-more">+{filtered.length - 200}건 더 (내보내기로 전체 확인)</p>}
        </div>
      )}

      {/* Detail modal */}
      {detailTarget && (
        <div className="admin-modal-overlay" onClick={() => setDetailTarget(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">기록 상세</h3>
            <div className="admin-detail-grid">
              <div><span className="admin-detail-label">날짜</span><span>{detailTarget.date}</span></div>
              <div><span className="admin-detail-label">작물</span><span>{cropMap[detailTarget.cropId]?.name || '-'}</span></div>
              <div><span className="admin-detail-label">단계</span><span>{detailTarget.stage || '-'}</span></div>
              <div><span className="admin-detail-label">하우스 온도</span><span>{detailTarget.houseTemp ?? detailTarget.temperature ?? '-'}</span></div>
              <div><span className="admin-detail-label">하우스 습도</span><span>{detailTarget.houseHumidity ?? detailTarget.humidity ?? '-'}</span></div>
              <div><span className="admin-detail-label">실외 온도</span><span>{detailTarget.outdoorTemp ?? '-'}</span></div>
              <div><span className="admin-detail-label">키</span><span>{detailTarget.heightCm ?? '-'}cm</span></div>
              <div><span className="admin-detail-label">잎 수</span><span>{detailTarget.leafCount ?? '-'}</span></div>
              <div><span className="admin-detail-label">줄기</span><span>{detailTarget.stemMm ?? '-'}mm</span></div>
            </div>
            {detailTarget.memo && <p style={{ fontSize: 14, marginTop: 16, padding: 12, background: 'var(--bg)', borderRadius: 8 }}>{detailTarget.memo}</p>}
            <div className="admin-modal-actions" style={{ marginTop: 20 }}>
              <button className="btn-secondary" onClick={() => setDetailTarget(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title" style={{ color: 'var(--color-danger)' }}>기록 삭제</h3>
            <p style={{ fontSize: 14, marginBottom: 20 }}>{deleteTarget.date} · {cropMap[deleteTarget.cropId]?.name || '-'}</p>
            <div className="admin-modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>취소</button>
              <button className="btn-primary" onClick={handleDelete} disabled={deleting} style={{ background: 'var(--color-danger)' }}>{deleting ? '삭제 중...' : '삭제'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
