import React, { useState, useMemo } from 'react';

function avg(arr) {
  const nums = arr.filter((v) => v != null && !isNaN(v));
  if (nums.length === 0) return '-';
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
}

function getWeekRange(weeksAgo) {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() - weeksAgo * 7);
  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
    label: weeksAgo === 0 ? '이번 주' : weeksAgo === 1 ? '지난 주' : `${weeksAgo}주 전`,
  };
}

export default function PeriodCompare({ logs }) {
  const [period, setPeriod] = useState('week'); // week | month

  const ranges = useMemo(() => {
    if (period === 'week') {
      return [0, 1, 2, 3].map(getWeekRange);
    }
    // month
    const now = new Date();
    return [0, 1, 2].map((monthsAgo) => {
      const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0);
      return {
        start: d.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
        label: `${d.getMonth() + 1}월`,
      };
    });
  }, [period]);

  const stats = useMemo(() => {
    return ranges.map((r) => {
      const filtered = logs.filter((l) => l.date >= r.start && l.date <= r.end);
      return {
        label: r.label,
        count: filtered.length,
        avgHeight: avg(filtered.map((l) => l.heightCm)),
        avgLeaf: avg(filtered.map((l) => l.leafCount)),
        avgTemp: avg(filtered.map((l) => l.houseTemp ?? l.temperature)),
      };
    });
  }, [logs, ranges]);

  return (
    <div className="period-compare">
      <div className="sub-tab-bar" style={{ marginBottom: 16 }}>
        <button className={`sub-tab-btn ${period === 'week' ? 'active' : ''}`} onClick={() => setPeriod('week')}>주간</button>
        <button className={`sub-tab-btn ${period === 'month' ? 'active' : ''}`} onClick={() => setPeriod('month')}>월간</button>
      </div>

      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th>항목</th>
              {stats.map((s) => <th key={s.label}>{s.label}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>기록 수</td>
              {stats.map((s) => <td key={s.label}><strong>{s.count}</strong>건</td>)}
            </tr>
            <tr>
              <td>평균 키</td>
              {stats.map((s) => <td key={s.label}>{s.avgHeight !== '-' ? `${s.avgHeight}cm` : '-'}</td>)}
            </tr>
            <tr>
              <td>평균 잎 수</td>
              {stats.map((s) => <td key={s.label}>{s.avgLeaf}</td>)}
            </tr>
            <tr>
              <td>평균 온도</td>
              {stats.map((s) => <td key={s.label}>{s.avgTemp !== '-' ? `${s.avgTemp}°C` : '-'}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
