import React, { useState, useMemo } from 'react';
import Card from './Card';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function getWeekRows(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= lastDate; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const rows = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

export default function MiniCalendar({ logDates = [], selectedDate, onDateClick }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [expanded, setExpanded] = useState(false);

  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const logSet = useMemo(() => new Set(logDates), [logDates]);

  const rows = useMemo(() => getWeekRows(year, month), [year, month]);

  // Find the row index containing today (or selected date)
  const activeWeekIdx = useMemo(() => {
    const targetDay = selectedDate
      ? (() => { const [y, m] = selectedDate.split('-').map(Number); return y === year && m - 1 === month ? Number(selectedDate.split('-')[2]) : null; })()
      : (year === today.getFullYear() && month === today.getMonth() ? today.getDate() : null);

    if (targetDay == null) return 0;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].includes(targetDay)) return i;
    }
    return 0;
  }, [rows, year, month, selectedDate, today]);

  const visibleRows = expanded ? rows : [rows[activeWeekIdx] || rows[0]];

  const goPrev = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  };

  const goNext = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  };

  const makeDateStr = (day) => `${year}-${pad(month + 1)}-${pad(day)}`;

  return (
    <Card className="mini-cal">
      <div className="mini-cal-header">
        <button className="mini-cal-nav" onClick={goPrev} aria-label="이전 달">&lsaquo;</button>
        <div className="mini-cal-title">
          {year}년 {month + 1}월
        </div>
        <button className="mini-cal-nav" onClick={goNext} aria-label="다음 달">&rsaquo;</button>
      </div>

      <div className="mini-cal-grid">
        {DAY_LABELS.map((label) => (
          <div key={label} className="mini-cal-label">{label}</div>
        ))}
        {visibleRows.map((row, ri) => (
          <React.Fragment key={ri}>
            {row.map((day, ci) => {
              if (!day) return <div key={`e-${ri}-${ci}`} className="mini-cal-cell" />;
              const dateStr = makeDateStr(day);
              const isToday = dateStr === todayStr;
              const hasLog = logSet.has(dateStr);
              const isSelected = dateStr === selectedDate;
              return (
                <div
                  key={dateStr}
                  className={[
                    'mini-cal-cell mini-cal-cell--day',
                    isToday ? 'mini-cal-today' : '',
                    hasLog ? 'mini-cal-logged' : '',
                    isSelected ? 'mini-cal-selected' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => onDateClick?.(dateStr)}
                >
                  <span>{day}</span>
                  {hasLog && <span className="mini-cal-dot" />}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <button className="mini-cal-toggle" onClick={() => setExpanded(!expanded)}>
        {expanded ? '주간 보기' : '월간 보기'}
      </button>
    </Card>
  );
}
