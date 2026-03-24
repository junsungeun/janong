import { useState, useEffect, useMemo } from 'react';
import { db, TABLES } from '../../services/dbService';
import { Download, Search } from 'lucide-react';
import { exportCsv } from '../../utils/exportCsv';

export default function AdminData() {
  const [logs, setLogs] = useState([]);
  const [crops, setCrops] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCrop, setFilterCrop] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');

  useEffect(() => {
    const load = async () => {
      const [l, c, p] = await Promise.all([
        db.getAllList(TABLES.DAILY_LOG),
        db.getAllList(TABLES.CROP),
        db.getAllList(TABLES.PROFILE),
      ]);
      setLogs(l); setCrops(c); setProfiles(p);
      setLoading(false);
    };
    load();
  }, []);

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
    exportCsv(rows, `SeedLog_전체데이터_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">데이터 관리</h1>
        <button className="btn-primary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}>
          <Download size={16} />
          전체 내보내기 ({filtered.length}건)
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
      </div>

      {loading ? (
        <p className="admin-loading">로딩 중...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>날짜</th>
                <th>작물</th>
                <th>단계</th>
                <th>온도</th>
                <th>키</th>
                <th>잎</th>
                <th>메모</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map((l) => (
                <tr key={l.id}>
                  <td>{l.date}</td>
                  <td>{cropMap[l.cropId]?.name || '-'}</td>
                  <td>{l.stage || '-'}</td>
                  <td>{l.houseTemp ?? l.temperature ?? '-'}</td>
                  <td>{l.heightCm ?? '-'}</td>
                  <td>{l.leafCount ?? '-'}</td>
                  <td>{(l.memo || '').slice(0, 30)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 100 && (
            <p className="admin-table-more">+{filtered.length - 100}건 더... (내보내기로 전체 확인)</p>
          )}
        </div>
      )}
    </div>
  );
}
