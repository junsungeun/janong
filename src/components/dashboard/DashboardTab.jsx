import React, { useState, useMemo, useEffect } from 'react';
import { BarChart2, Sprout, FileText, Users } from 'lucide-react';
import { db, TABLES } from '../../services/dbService';
import Spinner from '../ui/Spinner';
import ExportButton from '../record/ExportButton';
import CompareView from '../analysis/CompareView';
import PeriodCompare from '../analysis/PeriodCompare';
import WeeklyReport from '../analysis/WeeklyReport';
import PhotoCompare from '../analysis/PhotoCompare';
import TimelineView from '../record/TimelineView';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardTab() {
  const { profile } = useAuth();
  const [crops, setCrops] = useState([]);
  const [logs, setLogs] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [c, l, p] = await Promise.all([
        db.getAllList(TABLES.CROP),
        db.getAllList(TABLES.DAILY_LOG),
        db.getAllList(TABLES.PROFILE),
      ]);
      setCrops(c);
      setLogs(l);
      setProfiles(p);
      setLoading(false);
    };
    load();
  }, []);

  // 조 목록
  const groups = useMemo(() => {
    const set = new Set(profiles.map((p) => p.groupName).filter(Boolean));
    return [...set].sort();
  }, [profiles]);

  // 카테고리 목록
  const categories = useMemo(() => {
    const set = new Set(crops.map((c) => c.category).filter(Boolean));
    return [...set].sort();
  }, [crops]);

  // 조별 유저 ID 매핑
  const groupUserIds = useMemo(() => {
    if (filterGroup === 'all') return null;
    return new Set(profiles.filter((p) => p.groupName === filterGroup).map((p) => p.id));
  }, [profiles, filterGroup]);

  // 필터링
  const filteredCrops = useMemo(() => {
    let result = crops;
    if (groupUserIds) result = result.filter((c) => groupUserIds.has(c.userId));
    if (filterCategory !== 'all') result = result.filter((c) => c.category === filterCategory);
    return result;
  }, [crops, groupUserIds, filterCategory]);

  const filteredCropIds = useMemo(() => new Set(filteredCrops.map((c) => c.id)), [filteredCrops]);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => filteredCropIds.has(l.cropId));
  }, [logs, filteredCropIds]);

  // 통계
  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now - 7 * 86400000).toISOString().slice(0, 10);
    const thisWeekLogs = filteredLogs.filter((l) => l.date >= weekAgo);
    const memberCount = groupUserIds ? groupUserIds.size : new Set(profiles.map((p) => p.id)).size;

    return {
      totalCrops: filteredCrops.length,
      totalLogs: filteredLogs.length,
      weekLogs: thisWeekLogs.length,
      members: memberCount,
    };
  }, [filteredCrops, filteredLogs, groupUserIds, profiles]);

  // 최근 기록
  const recentLogs = useMemo(() => {
    return filteredLogs.slice(0, 5);
  }, [filteredLogs]);

  const cropMap = useMemo(() => {
    const m = {};
    crops.forEach((c) => { m[c.id] = c.name; });
    return m;
  }, [crops]);

  const logsForExport = useMemo(() => {
    return filteredLogs.map((l) => ({ ...l, cropName: cropMap[l.cropId] || '' }));
  }, [filteredLogs, cropMap]);

  if (loading) return <Spinner />;

  return (
    <div className="dashboard-tab">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h2 className="page-title">대시보드</h2>
          <p className="page-subtitle">
            {filterGroup !== 'all' ? `${filterGroup}` : '전체'} 현황
          </p>
        </div>
        <ExportButton
          logs={logsForExport}
          cropName={filterGroup !== 'all' ? filterGroup : '전체'}
        />
      </div>

      {/* View tabs */}
      <div className="dash-view-tabs">
        {[
          { key: 'overview', label: '현황' },
          { key: 'timeline', label: '타임라인' },
          { key: 'compare', label: '비교' },
          { key: 'period', label: '기간별' },
          { key: 'photos', label: '사진' },
          { key: 'report', label: '리포트' },
        ].map((v) => (
          <button key={v.key} className={`dash-view-tab ${activeView === v.key ? 'active' : ''}`} onClick={() => setActiveView(v.key)}>
            {v.label}
          </button>
        ))}
      </div>

      {activeView === 'compare' ? (
        <CompareView crops={filteredCrops} logs={filteredLogs} cropMap={cropMap} />
      ) : activeView === 'period' ? (
        <PeriodCompare logs={filteredLogs} />
      ) : activeView === 'timeline' ? (
        <TimelineView logs={filteredLogs} cropMap={cropMap} />
      ) : activeView === 'photos' ? (
        <PhotoCompare logs={filteredLogs} crops={filteredCrops} cropMap={cropMap} />
      ) : activeView === 'report' ? (
        <WeeklyReport logs={filteredLogs} crops={filteredCrops} cropMap={cropMap} />
      ) : (
      <>
      {/* Filters */}
      <div className="dash-filters">
        {groups.length > 0 && (
          <div className="dash-filter-row">
            <span className="dash-filter-label">조</span>
            <div className="dash-crop-chips">
              <button className={`dash-crop-chip ${filterGroup === 'all' ? 'active' : ''}`} onClick={() => setFilterGroup('all')}>전체</button>
              {groups.map((g) => (
                <button key={g} className={`dash-crop-chip ${filterGroup === g ? 'active' : ''}`} onClick={() => setFilterGroup(g)}>{g}</button>
              ))}
            </div>
          </div>
        )}
        {categories.length > 0 && (
          <div className="dash-filter-row">
            <span className="dash-filter-label">분류</span>
            <div className="dash-crop-chips">
              <button className={`dash-crop-chip ${filterCategory === 'all' ? 'active' : ''}`} onClick={() => setFilterCategory('all')}>전체</button>
              {categories.map((c) => (
                <button key={c} className={`dash-crop-chip ${filterCategory === c ? 'active' : ''}`} onClick={() => setFilterCategory(c)}>{c}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <Sprout size={20} />
          </div>
          <div className="dash-stat-info">
            <span className="dash-stat-num">{stats.totalCrops}</span>
            <span className="dash-stat-label">작물</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: 'var(--color-blue-light)', color: 'var(--color-blue)' }}>
            <FileText size={20} />
          </div>
          <div className="dash-stat-info">
            <span className="dash-stat-num">{stats.totalLogs}</span>
            <span className="dash-stat-label">총 기록</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: 'var(--color-yellow-light)', color: '#986C00' }}>
            <BarChart2 size={20} />
          </div>
          <div className="dash-stat-info">
            <span className="dash-stat-num">{stats.weekLogs}</span>
            <span className="dash-stat-label">이번 주</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: '#F3E8FF', color: '#7C3AED' }}>
            <Users size={20} />
          </div>
          <div className="dash-stat-info">
            <span className="dash-stat-num">{stats.members}</span>
            <span className="dash-stat-label">참여자</span>
          </div>
        </div>
      </div>

      {/* Crop list summary */}
      {filteredCrops.length > 0 && (
        <div className="dash-section">
          <h3 className="dash-section-header">작물 현황</h3>
          <div className="dash-crop-list">
            {filteredCrops.map((crop) => {
              const count = logs.filter((l) => l.cropId === crop.id).length;
              return (
                <div key={crop.id} className="dash-crop-row">
                  <div className="dash-crop-row-info">
                    <span className="dash-crop-row-name">{crop.name}</span>
                    {crop.category && <span className="dash-crop-row-cat">{crop.category}</span>}
                  </div>
                  <span className="dash-crop-row-count">{count}건</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent logs */}
      {recentLogs.length > 0 && (
        <div className="dash-section">
          <h3 className="dash-section-header">최근 기록</h3>
          <div className="dash-recent-list">
            {recentLogs.map((log) => (
              <div key={log.id} className="dash-recent-item">
                <span className="dash-recent-date">{log.date}</span>
                <span className="dash-recent-crop">{cropMap[log.cropId] || '-'}</span>
                {log.memo && <span className="dash-recent-memo">{log.memo.slice(0, 30)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
