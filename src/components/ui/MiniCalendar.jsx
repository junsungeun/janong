import React, { useState, useMemo } from 'react';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const DAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function getWeekRows(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay.getDay(); // 일요일 = 0

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

  // Selected date label
  const selectedLabel = useMemo(() => {
    const target = selectedDate || todayStr;
    const d = new Date(target);
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const dayName = DAY_NAMES[d.getDay()];
    const isToday = target === todayStr;
    return `${mm}.${dd} ${dayName}${isToday ? ' TODAY' : ''}`;
  }, [selectedDate, todayStr]);

  return (
    <div className="cal">
      {/* Month header */}
      <div className="cal-header">
        <button className="cal-nav" onClick={goPrev}>&lsaquo;</button>
        <span className="cal-month" onClick={() => setExpanded(!expanded)}>
          {year}. {pad(month + 1)}
        </span>
        <button className="cal-nav" onClick={goNext}>&rsaquo;</button>
      </div>

      {/* Day labels */}
      <div className="cal-grid">
        {DAY_LABELS.map((label, i) => (
          <div key={label} className={`cal-day-label ${i === 0 ? 'cal-sun' : i === 6 ? 'cal-sat' : ''}`}>{label}</div>
        ))}

        {/* Date cells */}
        {visibleRows.map((row, ri) => (
          <React.Fragment key={ri}>
            {row.map((day, ci) => {
              if (!day) return <div key={`e-${ri}-${ci}`} className="cal-cell" />;
              const dateStr = makeDateStr(day);
              const isToday = dateStr === todayStr;
              const hasLog = logSet.has(dateStr);
              const isSelected = dateStr === selectedDate;
              return (
                <div
                  key={dateStr}
                  className={[
                    'cal-cell cal-cell--day',
                    isToday ? 'cal-today' : '',
                    hasLog ? 'cal-has-log' : '',
                    isSelected ? 'cal-selected' : '',
                    ci === 0 ? 'cal-sun' : ci === 6 ? 'cal-sat' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => onDateClick?.(dateStr)}
                >
                  <span className="cal-cell-num">{day}</span>
                  {hasLog && <span className="cal-indicator" />}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Selected date label */}
      <div className="cal-date-label">
        <span className="cal-date-text">{selectedLabel}</span>
        <button className="cal-expand-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? '접기' : '펼치기'}
        </button>
      </div>
    </div>
  );
}
