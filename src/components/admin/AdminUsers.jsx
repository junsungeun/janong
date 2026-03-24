import { useState, useEffect } from 'react';
import { db, TABLES } from '../../services/dbService';
import { UserPlus, Trash2, Search } from 'lucide-react';

export default function AdminUsers() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    db.getAllList(TABLES.PROFILE).then((p) => { setProfiles(p); setLoading(false); });
  }, []);

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    return !q || (p.name || '').toLowerCase().includes(q) || (p.groupName || p.group_name || '').toLowerCase().includes(q);
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">회원 관리</h1>
        <span className="admin-page-count">{profiles.length}명</span>
      </div>

      <div className="admin-search">
        <Search size={16} />
        <input
          className="admin-search-input"
          placeholder="이름 또는 조 검색..."
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
              <th>이름</th>
              <th>조</th>
              <th>역할</th>
              <th>가입일</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.name || '-'}</strong></td>
                <td>{p.groupName || p.group_name || '-'}</td>
                <td>
                  <span className={`admin-role-badge ${p.role === 'admin' ? 'admin' : ''}`}>
                    {p.role === 'admin' ? '관리자' : '일반'}
                  </span>
                </td>
                <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('ko-KR') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
