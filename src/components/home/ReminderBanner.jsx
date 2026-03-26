import React, { useMemo } from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function ReminderBanner({ logs, tasks, onNavigate }) {
  const today = new Date().toISOString().slice(0, 10);

  const reminders = useMemo(() => {
    const items = [];

    // 오늘 기록 여부
    const todayLogs = (logs || []).filter((l) => l.date === today);
    if (todayLogs.length === 0) {
      items.push({ type: 'record', icon: AlertCircle, color: 'var(--color-warning)', text: '오늘 기록이 없습니다', action: '기록하기' });
    }

    // 미완료 TODO 개수
    const todoCount = (tasks || []).filter((t) => t.status !== 'done').length;
    if (todoCount > 0) {
      items.push({ type: 'task', icon: Clock, color: 'var(--color-blue)', text: `미완료 할 일 ${todoCount}개`, action: null });
    }

    // 3일 이상 기록 없음
    if (logs && logs.length > 0) {
      const lastDate = [...logs].sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0]?.date;
      if (lastDate) {
        const daysSince = Math.floor((Date.now() - new Date(lastDate)) / 86400000);
        if (daysSince >= 3) {
          items.push({ type: 'gap', icon: AlertCircle, color: 'var(--color-danger)', text: `${daysSince}일째 기록이 없습니다`, action: '기록하기' });
        }
      }
    }

    // 오늘 기록 있으면
    if (todayLogs.length > 0 && todoCount === 0) {
      items.push({ type: 'done', icon: CheckCircle, color: 'var(--color-good)', text: '오늘 기록 완료!', action: null });
    }

    return items;
  }, [logs, tasks, today]);

  if (reminders.length === 0) return null;

  return (
    <div className="reminder-banners">
      {reminders.map((r, i) => (
        <div key={i} className="reminder-banner" style={{ '--reminder-color': r.color }}>
          <r.icon size={18} className="reminder-icon" />
          <span className="reminder-text">{r.text}</span>
          {r.action && r.type === 'record' && (
            <button className="reminder-action" onClick={() => onNavigate?.('record')}>
              {r.action}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
