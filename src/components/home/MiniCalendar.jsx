import React, { useMemo } from 'react';
import Card from '../ui/Card';

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function MiniCalendar({ logDates = [] }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayStr = `${year}-${pad(month + 1)}-${pad(today.getDate())}`;

  const logSet = useMemo(() => new Set(logDates), [logDates]);

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0).getDate();
    // getDay(): 0=Sun, convert to Mon-based: (getDay()+6)%7
    const startOffset = (firstDay.getDay() + 6) % 7;

    const result = [];
    // empty cells before first day
    for (let i = 0; i < startOffset; i++) {
      result.push({ day: null, key: `e${i}` });
    }
    for (let d = 1; d <= lastDate; d++) {
      const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
      result.push({
        day: d,
        key: dateStr,
        isToday: dateStr === todayStr,
        hasLog: logSet.has(dateStr),
      });
    }
    return result;
  }, [year, month, todayStr, logSet]);

  return (
    <Card className="mini-cal">
      <div className="mini-cal-title">
        {year}년 {month + 1}월
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
            ].filter(Boolean).join(' ')}
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
