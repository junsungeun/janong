import { useState, useEffect, useMemo } from 'react';
import { db, TABLES } from '../../services/dbService';
import { Search } from 'lucide-react';

export default function AdminCrops() {
  const [crops, setCrops] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      const [c, p, l] = await Promise.all([
        db.getAllList(TABLES.CROP),
        db.getAllList(TABLES.PROFILE),
        db.getAllList(TABLES.DAILY_LOG),
      ]);
      setCrops(c); setProfiles(p); setLogs(l);
      setLoading(false);
    };
    load();
  }, []);

  const profileMap = useMemo(() => Object.fromEntries(profiles.map((p) => [p.id, p])), [profiles]);

  const logCounts = useMemo(() => {
    const m = {};
    logs.forEach((l) => { m[l.cropId] = (m[l.cropId] || 0) + 1; });
    return m;
  }, [logs]);

  const filtered = crops.filter((c) => {
    const q = search.toLowerCase();
    return !q || (c.name || '').toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q);
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">작물 관리</h1>
        <span className="admin-page-count">{crops.length}종</span>
      </div>

      <div className="admin-search">
        <Search size={16} />
        <input
          className="admin-search-input"
          placeholder="작물명 또는 카테고리 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="admin-loading">로딩 중...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>작물명</th>
              <th>품종</th>
              <th>카테고리</th>
              <th>등록자</th>
              <th>조</th>
              <th>기록 수</th>
              <th>파종일</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const owner = profileMap[c.userId];
              return (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.variety || '-'}</td>
                  <td>{c.category || '-'}</td>
                  <td>{owner?.name || '-'}</td>
                  <td>{owner?.groupName || owner?.group_name || '-'}</td>
                  <td>{logCounts[c.id] || 0}</td>
                  <td>{c.plantingDate || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
