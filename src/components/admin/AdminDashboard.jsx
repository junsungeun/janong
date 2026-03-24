import { useState, useEffect } from 'react';
import { db, TABLES } from '../../services/dbService';
import { Users, Sprout, FileText, BarChart2 } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [profiles, crops, logs] = await Promise.all([
        db.getAllList(TABLES.PROFILE),
        db.getAllList(TABLES.CROP),
        db.getAllList(TABLES.DAILY_LOG),
      ]);

      const now = new Date();
      const weekAgo = new Date(now - 7 * 86400000).toISOString().slice(0, 10);
      const weekLogs = logs.filter((l) => l.date >= weekAgo);

      // 조별 통계
      const groups = {};
      profiles.forEach((p) => {
        const g = p.groupName || p.group_name || '미지정';
        if (!groups[g]) groups[g] = { members: 0, crops: 0, logs: 0 };
        groups[g].members += 1;
      });
      crops.forEach((c) => {
        const profile = profiles.find((p) => p.id === c.userId);
        const g = profile?.groupName || profile?.group_name || '미지정';
        if (groups[g]) groups[g].crops += 1;
      });
      logs.forEach((l) => {
        const crop = crops.find((c) => c.id === l.cropId);
        const profile = crop ? profiles.find((p) => p.id === crop.userId) : null;
        const g = profile?.groupName || profile?.group_name || '미지정';
        if (groups[g]) groups[g].logs += 1;
      });

      setStats({
        totalUsers: profiles.length,
        totalCrops: crops.length,
        totalLogs: logs.length,
        weekLogs: weekLogs.length,
        groups,
        recentLogs: logs.slice(0, 10),
        cropMap: Object.fromEntries(crops.map((c) => [c.id, c.name])),
      });
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <p className="admin-loading">로딩 중...</p>;
  if (!stats) return null;

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">대시보드</h1>

      <div className="admin-stats-grid">
        <StatCard icon={Users} label="전체 회원" value={stats.totalUsers} color="#7C3AED" bg="#F3E8FF" />
        <StatCard icon={Sprout} label="등록 작물" value={stats.totalCrops} color="var(--color-primary)" bg="var(--color-primary-light)" />
        <StatCard icon={FileText} label="총 기록" value={stats.totalLogs} color="var(--color-blue)" bg="var(--color-blue-light)" />
        <StatCard icon={BarChart2} label="이번 주" value={stats.weekLogs} color="#986C00" bg="var(--color-yellow-light)" />
      </div>

      <div className="admin-grid-2col">
        <div className="admin-card">
          <h3 className="admin-card-title">조별 현황</h3>
          <table className="admin-table">
            <thead>
              <tr><th>조</th><th>인원</th><th>작물</th><th>기록</th></tr>
            </thead>
            <tbody>
              {Object.entries(stats.groups).map(([name, g]) => (
                <tr key={name}><td>{name}</td><td>{g.members}</td><td>{g.crops}</td><td>{g.logs}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-card">
          <h3 className="admin-card-title">최근 기록</h3>
          <div className="admin-recent-list">
            {stats.recentLogs.map((l) => (
              <div key={l.id} className="admin-recent-item">
                <span className="admin-recent-date">{l.date}</span>
                <span className="admin-recent-crop">{stats.cropMap[l.cropId] || '-'}</span>
                <span className="admin-recent-memo">{(l.memo || '').slice(0, 30)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon" style={{ background: bg, color }}>
        <Icon size={22} />
      </div>
      <div>
        <span className="admin-stat-num">{value}</span>
        <span className="admin-stat-label">{label}</span>
      </div>
    </div>
  );
}
