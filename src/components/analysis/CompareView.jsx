import React, { useState, useMemo } from 'react';
import { GROWTH_STAGES } from '../../constants';

function avg(arr) {
  const nums = arr.filter((v) => v != null);
  if (nums.length === 0) return null;
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
}

export default function CompareView({ crops, logs, cropMap }) {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const comparisons = useMemo(() => {
    return selectedIds.map((cropId) => {
      const cropLogs = logs.filter((l) => l.cropId === cropId);
      const crop = crops.find((c) => c.id === cropId);
      const lastLog = cropLogs[0];
      const lastStage = GROWTH_STAGES.find((s) => s.value === lastLog?.stage);

      return {
        id: cropId,
        name: crop?.name || '-',
        category: crop?.category || '-',
        totalLogs: cropLogs.length,
        avgHeight: avg(cropLogs.map((l) => l.heightCm)),
        avgLeaf: avg(cropLogs.map((l) => l.leafCount)),
        avgHouseTemp: avg(cropLogs.map((l) => l.houseTemp ?? l.temperature)),
        lastStage: lastStage ? `${lastStage.icon} ${lastStage.label}` : '-',
        lastDate: lastLog?.date || '-',
      };
    });
  }, [selectedIds, crops, logs]);

  return (
    <div className="compare-view">
      <p className="record-form-section-label">작물 선택 <span className="text-caption text-muted">(최대 4개)</span></p>
      <div className="compare-crop-chips">
        {crops.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`dash-crop-chip ${selectedIds.includes(c.id) ? 'active' : ''}`}
            onClick={() => toggle(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {comparisons.length > 0 && (
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th>항목</th>
                {comparisons.map((c) => (
                  <th key={c.id}>{c.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>분류</td>
                {comparisons.map((c) => <td key={c.id}>{c.category}</td>)}
              </tr>
              <tr>
                <td>기록 수</td>
                {comparisons.map((c) => <td key={c.id}><strong>{c.totalLogs}</strong>건</td>)}
              </tr>
              <tr>
                <td>평균 키</td>
                {comparisons.map((c) => <td key={c.id}>{c.avgHeight ? `${c.avgHeight}cm` : '-'}</td>)}
              </tr>
              <tr>
                <td>평균 잎 수</td>
                {comparisons.map((c) => <td key={c.id}>{c.avgLeaf || '-'}</td>)}
              </tr>
              <tr>
                <td>평균 하우스 온도</td>
                {comparisons.map((c) => <td key={c.id}>{c.avgHouseTemp ? `${c.avgHouseTemp}°C` : '-'}</td>)}
              </tr>
              <tr>
                <td>현재 단계</td>
                {comparisons.map((c) => <td key={c.id}>{c.lastStage}</td>)}
              </tr>
              <tr>
                <td>최근 기록</td>
                {comparisons.map((c) => <td key={c.id}>{c.lastDate}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {comparisons.length === 0 && (
        <p className="text-sm text-muted" style={{ textAlign: 'center', padding: '40px 0' }}>
          비교할 작물을 선택하세요
        </p>
      )}
    </div>
  );
}
