import React, { useMemo } from 'react';
import { Download } from 'lucide-react';
import { GROWTH_STAGES } from '../../constants';
import { exportCsv } from '../../utils/exportCsv';

function getThisWeekRange() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 7);
  return { start: start.toISOString().slice(0, 10), end: now.toISOString().slice(0, 10) };
}

export default function WeeklyReport({ logs, crops, cropMap }) {
  const { start, end } = getThisWeekRange();

  const weekLogs = useMemo(() => {
    return logs.filter((l) => l.date >= start && l.date <= end);
  }, [logs, start, end]);

  const report = useMemo(() => {
    const byCrop = {};
    weekLogs.forEach((l) => {
      const id = l.cropId;
      if (!byCrop[id]) byCrop[id] = { logs: [], name: cropMap[id] || '-' };
      byCrop[id].logs.push(l);
    });

    return Object.entries(byCrop).map(([cropId, data]) => {
      const heights = data.logs.map((l) => l.heightCm).filter(Boolean);
      const lastLog = data.logs[0];
      const stage = GROWTH_STAGES.find((s) => s.value === lastLog?.stage);
      return {
        cropId,
        name: data.name,
        count: data.logs.length,
        stage: stage ? `${stage.icon} ${stage.label}` : '-',
        heightGrowth: heights.length >= 2
          ? (heights[0] - heights[heights.length - 1]).toFixed(1)
          : '-',
        lastMemo: lastLog?.memo?.slice(0, 40) || '',
      };
    });
  }, [weekLogs, cropMap]);

  const handleExport = () => {
    const rows = report.map((r) => ({
      작물: r.name,
      기록수: r.count,
      재배단계: r.stage,
      '주간성장(cm)': r.heightGrowth,
      최근메모: r.lastMemo,
    }));
    const today = new Date().toISOString().slice(0, 10);
    exportCsv(rows, `SeedLog_주간리포트_${today}.csv`);
  };

  return (
    <div className="weekly-report">
      <div className="weekly-report-header">
        <div>
          <h3 className="dash-section-header">주간 리포트</h3>
          <p className="text-caption text-muted">{start} ~ {end}</p>
        </div>
        {report.length > 0 && (
          <button className="btn-ghost" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Download size={14} /> 내보내기
          </button>
        )}
      </div>

      {report.length === 0 ? (
        <p className="text-sm text-muted" style={{ textAlign: 'center', padding: '20px 0' }}>이번 주 기록이 없습니다</p>
      ) : (
        <div className="weekly-report-list">
          {report.map((r) => (
            <div key={r.cropId} className="weekly-report-card">
              <div className="weekly-report-card-top">
                <span className="weekly-report-crop">{r.name}</span>
                <span className="weekly-report-stage">{r.stage}</span>
              </div>
              <div className="weekly-report-stats">
                <div className="weekly-report-stat">
                  <span className="weekly-report-stat-num">{r.count}</span>
                  <span className="weekly-report-stat-label">기록</span>
                </div>
                <div className="weekly-report-stat">
                  <span className="weekly-report-stat-num">{r.heightGrowth !== '-' ? `+${r.heightGrowth}` : '-'}</span>
                  <span className="weekly-report-stat-label">성장(cm)</span>
                </div>
              </div>
              {r.lastMemo && <p className="weekly-report-memo">{r.lastMemo}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
