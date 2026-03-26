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
import ShareReport from '../analysis/ShareReport';
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
      try {
        const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 15000));
        const [c, l, p] = await Promise.race([
          Promise.all([
            db.getAllList(TABLES.CROP),
            db.getAllList(TABLES.DAILY_LOG),
            db.getAllList(TABLES.PROFILE),
          ]),
          timeout,
        ]);
        setCrops(c);
        setLogs(l);
        setProfiles(p);
      } catch {
        // 타임아웃 또는 에러 시 빈 상태 유지
      } finally {
        setLoading(false);
      }
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
    return [...filteredLogs]
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 5);
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

      {/* ── 헤더 ── */}
      <div className="dh-header">
        <div className="dh-header-text">
          <h2 className="dh-title">대시보드</h2>
          <p className="dh-subtitle">{filterGroup !== 'all' ? `${filterGroup}조` : '전체'} 현황</p>
        </div>
        <ExportButton logs={logsForExport} cropName={filterGroup !== 'all' ? filterGroup : '전체'} />
      </div>

      {/* ── 1뎁스: 조 선택 ── */}
      {groups.length > 0 && (
        <div className="dh-d1">
          <button className={`dh-d1-btn ${filterGroup === 'all' ? 'active' : ''}`} onClick={() => setFilterGroup('all')}>전체</button>
          {groups.map((g) => (
            <button key={g} className={`dh-d1-btn ${filterGroup === g ? 'active' : ''}`} onClick={() => setFilterGroup(g)}>{g}조</button>
          ))}
        </div>
      )}

      {/* ── 2뎁스: 뷰 탭 ── */}
      <div className="dh-d2">
        {[
          { key: 'overview', label: '현황' },
          { key: 'timeline', label: '타임라인' },
          { key: 'compare', label: '비교' },
          { key: 'period', label: '기간별' },
          { key: 'photos', label: '사진' },
          { key: 'report', label: '리포트' },
        ].map((v) => (
          <button key={v.key} className={`dh-d2-btn ${activeView === v.key ? 'active' : ''}`} onClick={() => setActiveView(v.key)}>
            {v.label}
          </button>
        ))}
      </div>

      {/* ── 뷰 콘텐츠 ── */}
      {activeView === 'compare' ? (
        <CompareView crops={filteredCrops} logs={filteredLogs} cropMap={cropMap} />
      ) : activeView === 'period' ? (
        <PeriodCompare logs={filteredLogs} />
      ) : activeView === 'timeline' ? (
        <TimelineView logs={filteredLogs} cropMap={cropMap} />
      ) : activeView === 'photos' ? (
        <PhotoCompare logs={filteredLogs} crops={filteredCrops} cropMap={cropMap} />
      ) : activeView === 'report' ? (
        <>
          <WeeklyReport logs={filteredLogs} crops={filteredCrops} cropMap={cropMap} />
          <div style={{ marginTop: 24 }}>
            <ShareReport logs={filteredLogs} crops={filteredCrops} cropMap={cropMap} groupName={filterGroup !== 'all' ? filterGroup : ''} />
          </div>
        </>
      ) : (
      <>
        {/* 3뎁스: 분류 필터 */}
        {categories.length > 0 && (
          <div className="dh-d3">
            <span className="dh-d3-label">분류</span>
            <button className={`dh-d3-btn ${filterCategory === 'all' ? 'active' : ''}`} onClick={() => setFilterCategory('all')}>전체</button>
            {categories.map((c) => (
              <button key={c} className={`dh-d3-btn ${filterCategory === c ? 'active' : ''}`} onClick={() => setFilterCategory(c)}>{c}</button>
            ))}
          </div>
        )}

        {/* 통계 카드 */}
        <div className="dash-stats-grid">
          <div className="dash-stat-card">
            <div className="dash-stat-icon"><Sprout size={22} /></div>
            <div className="dash-stat-info">
              <span className="dash-stat-num">{stats.totalCrops}</span>
              <span className="dash-stat-label">작물</span>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon"><FileText size={22} /></div>
            <div className="dash-stat-info">
              <span className="dash-stat-num">{stats.totalLogs}</span>
              <span className="dash-stat-label">총 기록</span>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon"><BarChart2 size={22} /></div>
            <div className="dash-stat-info">
              <span className="dash-stat-num">{stats.weekLogs}</span>
              <span className="dash-stat-label">이번 주</span>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon"><Users size={22} /></div>
            <div className="dash-stat-info">
              <span className="dash-stat-num">{stats.members}</span>
              <span className="dash-stat-label">참여자</span>
            </div>
          </div>
        </div>

        {/* 작물 현황 */}
        {filteredCrops.length > 0 && (
          <div className="dash-section">
            <h3 className="dash-section-title">작물 현황</h3>
            <div className="dash-crop-cards">
              {filteredCrops.map((crop) => {
                const count = filteredLogs.filter((l) => l.cropId === crop.id).length;
                return (
                  <div key={crop.id} className="dash-crop-card">
                    <div className="dash-crop-card-top">
                      <span className="dash-crop-card-name">{crop.name}</span>
                      {crop.category && <span className="dash-crop-card-cat">{crop.category}</span>}
                    </div>
                    <span className="dash-crop-card-count">{count}<em>건</em></span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 최근 기록 */}
        {recentLogs.length > 0 && (
          <div className="dash-section">
            <h3 className="dash-section-title">최근 기록</h3>
            <div className="dash-recent-cards">
              {recentLogs.map((log) => (
                <div key={log.id} className="dash-recent-card">
                  <div className="dash-recent-card-left">
                    <span className="dash-recent-card-crop">{cropMap[log.cropId] || '-'}</span>
                    {log.memo && <span className="dash-recent-card-memo">{log.memo.slice(0, 40)}</span>}
                  </div>
                  <span className="dash-recent-card-date">{log.date?.slice(5)}</span>
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
