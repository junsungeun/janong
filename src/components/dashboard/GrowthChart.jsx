import React, { useState, useMemo } from 'react';

const METRICS = [
  { key: 'tempHigh', label: '온도', unit: '\u00b0C', color: 'var(--color-terra)' },
  { key: 'humidity', label: '습도', unit: '%', color: 'var(--color-info)' },
  { key: 'heightCm', label: '키', unit: 'cm', color: 'var(--color-primary)' },
  { key: 'leafCount', label: '잎 수', unit: '장', color: 'var(--color-primary-dark)' },
];

const CHART_H = 200;
const PAD = { top: 20, right: 16, bottom: 32, left: 40 };

export default function GrowthChart({ logs = [] }) {
  const [metric, setMetric] = useState('heightCm');
  const current = METRICS.find((m) => m.key === metric) || METRICS[0];

  const sorted = useMemo(
    () => [...logs].sort((a, b) => (a.date > b.date ? 1 : -1)),
    [logs]
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
    const padding = (mx - mn) * 0.1 || 5;
    return { minVal: Math.floor(mn - padding), maxVal: Math.ceil(mx + padding) };
  }, [points]);

  const innerW = `calc(100% - ${PAD.left + PAD.right}px)`;
  const innerH = CHART_H - PAD.top - PAD.bottom;

  const getX = (i) => {
    if (points.length <= 1) return PAD.left + 100;
    const viewW = 320 - PAD.left - PAD.right;
    return PAD.left + (i / (points.length - 1)) * viewW;
  };

  const getY = (val) => {
    const range = maxVal - minVal || 1;
    return PAD.top + innerH - ((val - minVal) / range) * innerH;
  };

  const polyline = points.map((p, i) => `${getX(i)},${getY(p.value)}`).join(' ');

  // Y-axis ticks (4 lines)
  const yTicks = [];
  for (let i = 0; i <= 3; i++) {
    const val = minVal + ((maxVal - minVal) / 3) * i;
    yTicks.push({ val: Math.round(val * 10) / 10, y: getY(val) });
  }

  return (
    <div className="growth-chart">
      <div className="growth-chart-toggles">
        {METRICS.map((m) => (
          <button
            key={m.key}
            className={`growth-chart-toggle ${metric === m.key ? 'active' : ''}`}
            onClick={() => setMetric(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {points.length === 0 ? (
        <p className="growth-chart-empty">데이터가 없습니다</p>
      ) : (
        <svg
          viewBox={`0 0 320 ${CHART_H}`}
          className="growth-chart-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {yTicks.map((t, i) => (
            <g key={i}>
              <line
                x1={PAD.left} y1={t.y}
                x2={320 - PAD.right} y2={t.y}
                stroke="var(--border)" strokeDasharray="3,3"
              />
              <text
                x={PAD.left - 6} y={t.y + 4}
                textAnchor="end"
                className="growth-chart-axis-label"
              >
                {t.val}
              </text>
            </g>
          ))}

          {/* Line */}
          <polyline
            points={polyline}
            fill="none"
            stroke={current.color}
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={getX(i)} cy={getY(p.value)}
                r="3.5"
                fill="var(--bg-card)"
                stroke={current.color}
                strokeWidth="2"
              />
              {/* X label — show first, last, and every other */}
              {(i === 0 || i === points.length - 1 || points.length <= 7 || i % 2 === 0) && (
                <text
                  x={getX(i)}
                  y={CHART_H - 6}
                  textAnchor="middle"
                  className="growth-chart-axis-label"
                >
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
