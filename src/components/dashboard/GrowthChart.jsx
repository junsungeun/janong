import React, { useState, useMemo } from 'react';

const METRICS = [
  { key: 'tempHigh', label: '온도', unit: '\u00b0C', color: 'var(--color-terra)' },
  { key: 'humidity', label: '습도', unit: '%', color: 'var(--color-info)' },
  { key: 'heightCm', label: '키', unit: 'cm', color: 'var(--color-primary)' },
  { key: 'leafCount', label: '잎 수', unit: '장', color: 'var(--color-primary-dark)' },
];

const CHART_H = 220;
const PAD = { top: 24, right: 16, bottom: 36, left: 44 };
const VIEW_W = 320;

export default function GrowthChart({ logs = [] }) {
  const [metric, setMetric] = useState('heightCm');
  const [hoverIdx, setHoverIdx] = useState(null);
  const current = METRICS.find((m) => m.key === metric) || METRICS[0];

  const sorted = useMemo(
    () => [...logs].sort((a, b) => (a.date > b.date ? 1 : -1)),
    [logs],
  );

  const points = useMemo(() => {
    return sorted
      .filter((l) => l[metric] != null)
      .map((l) => ({ date: l.date, value: Number(l[metric]) }));
  }, [sorted, metric]);

  const { minVal, maxVal } = useMemo(() => {
    if (points.length === 0) return { minVal: 0, maxVal: 100 };
    const vals = points.map((p) => p.value);
    const mn = Math.min(...vals);
    const mx = Math.max(...vals);
    const padding = (mx - mn) * 0.15 || 5;
    return { minVal: Math.floor(mn - padding), maxVal: Math.ceil(mx + padding) };
  }, [points]);

  const innerH = CHART_H - PAD.top - PAD.bottom;
  const innerW = VIEW_W - PAD.left - PAD.right;

  const getX = (i) => {
    if (points.length <= 1) return PAD.left + innerW / 2;
    return PAD.left + (i / (points.length - 1)) * innerW;
  };

  const getY = (val) => {
    const range = maxVal - minVal || 1;
    return PAD.top + innerH - ((val - minVal) / range) * innerH;
  };

  const polyline = points.map((p, i) => `${getX(i)},${getY(p.value)}`).join(' ');

  const yTicks = [];
  for (let i = 0; i <= 3; i++) {
    const val = minVal + ((maxVal - minVal) / 3) * i;
    yTicks.push({ val: Math.round(val * 10) / 10, y: getY(val) });
  }

  const showLabel = (i) => {
    if (points.length <= 7) return true;
    if (i === 0 || i === points.length - 1) return true;
    return i % 2 === 0;
  };

  return (
    <div className="growth-chart">
      <span className="section-title">성장 차트</span>

      <div className="growth-chart-toggles" role="group" aria-label="측정 항목 선택">
        {METRICS.map((m) => (
          <button
            key={m.key}
            className={`growth-chart-toggle ${metric === m.key ? 'active' : ''}`}
            onClick={() => { setMetric(m.key); setHoverIdx(null); }}
            aria-pressed={metric === m.key}
          >
            {m.label}
          </button>
        ))}
      </div>

      {points.length === 0 ? (
        <div className="growth-chart-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
            <path d="M3 3v18h18" strokeLinecap="round" />
            <path d="M7 16l4-4 4 4 5-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>데이터가 아직 없습니다</p>
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${VIEW_W} ${CHART_H}`}
          className="growth-chart-svg"
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHoverIdx(null)}
          role="img"
          aria-label={`${current.label} 성장 차트 - ${points.length}개 데이터`}
        >
          {yTicks.map((t, i) => (
            <g key={i}>
              <line
                x1={PAD.left} y1={t.y}
                x2={VIEW_W - PAD.right} y2={t.y}
                stroke="var(--border)" strokeDasharray="4,3" strokeWidth="0.5"
              />
              <text x={PAD.left - 6} y={t.y + 3.5} textAnchor="end" className="growth-chart-axis-label">
                {t.val}
              </text>
            </g>
          ))}

          {points.length > 1 && (
            <polygon
              points={`${getX(0)},${getY(minVal)} ${polyline} ${getX(points.length - 1)},${getY(minVal)}`}
              fill={current.color} fillOpacity="0.06"
            />
          )}

          <polyline
            points={polyline} fill="none" stroke={current.color}
            strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
          />

          {points.map((p, i) => (
            <g key={i} onMouseEnter={() => setHoverIdx(i)} onTouchStart={() => setHoverIdx(i)}>
              <rect x={getX(i) - 12} y={PAD.top - 4} width="24" height={innerH + 8} fill="transparent" />
              <circle
                cx={getX(i)} cy={getY(p.value)}
                r={hoverIdx === i ? 5 : 3.5}
                fill="var(--bg-card)" stroke={current.color} strokeWidth="2"
              />
              {hoverIdx === i && (
                <g>
                  <rect x={getX(i) - 22} y={getY(p.value) - 26} width="44" height="18" rx="4" fill="var(--bg-dark)" />
                  <text x={getX(i)} y={getY(p.value) - 14} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="600" fontFamily="var(--font-sans)">
                    {p.value}{current.unit}
                  </text>
                </g>
              )}
              {showLabel(i) && (
                <text x={getX(i)} y={CHART_H - 8} textAnchor="middle" className="growth-chart-axis-label">
                  {p.date?.slice(5)}
                </text>
              )}
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}
