import React, { useState, useMemo } from 'react';
import Card from './Card';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function MiniCalendar({ logDates = [], onDateClick }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const logSet = useMemo(() => new Set(logDates), [logDates]);

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;

    const result = [];
    for (let i = 0; i < startOffset; i++) {
      result.push({ day: null, key: `e${i}` });
    }
    for (let d = 1; d <= lastDate; d++) {
      const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
      result.push({
        day: d,
        key: dateStr,
        dateStr,
        isToday: dateStr === todayStr,
        hasLog: logSet.has(dateStr),
      });
    }
    return result;
  }, [year, month, todayStr, logSet]);

  const goPrev = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  };

  const goNext = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  };

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
        {cells.map((c) => (
          <div
            key={c.key}
            className={[
              'mini-cal-cell',
              c.isToday ? 'mini-cal-today' : '',
              c.hasLog ? 'mini-cal-logged' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => c.day && onDateClick?.(c.dateStr)}
            role={c.day && onDateClick ? 'button' : undefined}
          >
            {c.day && (
              <>
                <span>{c.day}</span>
                {c.hasLog && <span className="mini-cal-dot" />}
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
