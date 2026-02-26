import { useState, useEffect } from 'react';
import {
  CheckSquare, AlertTriangle, Timer, Plus, Leaf,
} from 'lucide-react';
import { getCurrentSolarTerm, formatDate } from '../utils/solarTerms';
import { db, TABLES } from '../services/dbService';
import WeatherCard from './WeatherCard';
import { getTodayVerse } from '../data/bibleVerses';

export default function Dashboard({ onNavigate }) {
  const [todos, setTodos]   = useState([]);
  const [issues, setIssues] = useState([]);
  const dateInfo  = formatDate();
  const solarTerm = getCurrentSolarTerm();
  const verse     = getTodayVerse();

  const load = async () => {
    const [td, iss] = await Promise.all([
      db.getList(TABLES.TODO),
      db.getList(TABLES.ISSUE),
    ]);
    setTodos(td);
    setIssues(iss);
  };

  useEffect(() => { load(); }, []);

  const toggleTodo = async (id) => {
    await db.update(TABLES.TODO, id, { done: !todos.find(t => t.id === id)?.done });
    await load();
  };

  const pendingTodos  = todos.filter(t => !t.done).slice(0, 3);
  const activeIssues  = issues.filter(i => !i.solved);

  return (
    <div className="dashboard">

      {/* ── 날짜 + 절기 ── */}
      <div className="date-header mb-4">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '22px',
            fontWeight: 600,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
          }}>
            {dateInfo.month}월 {dateInfo.day}일
          </span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {dateInfo.weekday}요일
          </span>
          {solarTerm && (
            <span className="badge badge-good" style={{ marginLeft: '4px' }}>
              {solarTerm}
            </span>
          )}
        </div>
      </div>

      {/* ── 오늘의 말씀 ── */}
      <div className="mb-5" style={{
        background: 'var(--color-primary)',
        borderRadius: '10px',
        padding: '18px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 장식 원 */}
        <div style={{
          position: 'absolute', right: '-20px', top: '-20px',
          width: '100px', height: '100px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: '20px', bottom: '-30px',
          width: '80px', height: '80px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }} />

        <p style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.55)',
          marginBottom: '10px',
        }}>
          오늘의 말씀
        </p>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '14px',
          fontWeight: 400,
          color: 'rgba(255,255,255,0.92)',
          lineHeight: 1.85,
          marginBottom: '12px',
        }}>
          "{verse.text}"
        </p>
        <p style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.55)',
          letterSpacing: '0.05em',
        }}>
          — {verse.ref}
        </p>
      </div>

      {/* ── 날씨 카드 + 자연농업 추천 (3단계 API 연동) ── */}
      <WeatherCard />

      {/* ── 이슈 알림 ── */}
      {activeIssues.length > 0 && (
        <div className="mb-5">
          <div className="section-header">
            <span className="section-title" style={{ color: 'var(--color-danger)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={18} strokeWidth={1.5} />
                미해결 이슈 {activeIssues.length}건
              </span>
            </span>
            <button className="btn-ghost" onClick={() => onNavigate('more')}>전체 보기</button>
          </div>

          {activeIssues.slice(0, 2).map(issue => (
            <div key={issue.id} className="card" style={{
              borderLeft: '3px solid var(--color-danger)',
              borderRadius: '0 8px 8px 0',
              padding: '14px 16px',
              marginBottom: '6px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{issue.title}</p>
                  <p style={{ fontSize: 'var(--text-caption)', color: 'var(--text-muted)', marginTop: '3px' }}>
                    작물: {issue.crop}
                  </p>
                </div>
                <span className="badge badge-danger">
                  {issue.severity === 'high' ? '높음' : issue.severity === 'mid' ? '보통' : '낮음'}
                </span>
              </div>
            </div>
          ))}
          {activeIssues.length > 2 && (
            <button className="btn-ghost" onClick={() => onNavigate('more')} style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              +{activeIssues.length - 2}건 더 보기
            </button>
          )}
        </div>
      )}

      {/* ── 할 일 미리보기 ── */}
      <div className="mb-5">
        <div className="section-header">
          <span className="section-title">할 일</span>
          <button className="btn-ghost" onClick={() => onNavigate('more')}>전체 보기</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {pendingTodos.length === 0 ? (
            <div className="card-record" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
              <CheckSquare size={28} strokeWidth={1.5} style={{ margin: '0 auto 8px', display: 'block' }} />
              <p style={{ fontSize: 'var(--text-sm)' }}>오늘 할 일이 없어요</p>
            </div>
          ) : (
            pendingTodos.map(todo => (
              <button
                key={todo.id}
                onClick={() => toggleTodo(todo.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'background 0.15s',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <div style={{
                  width: '18px', height: '18px',
                  borderRadius: '4px',
                  border: '1.5px solid var(--border)',
                  background: 'transparent',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', flex: 1 }}>
                  {todo.text}
                </span>
                {todo.date && (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {todo.date.replace(/-/g, '.')}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── 빠른 기록 버튼 ── */}
      <div style={{
        background: 'var(--bg-dark)',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '15px',
          color: 'var(--text-light)',
          marginBottom: '4px',
        }}>
          오늘 농사 기록
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { icon: <Leaf          size={16} strokeWidth={1.5} />, label: '농사 일지',   tab: 'record' },
            { icon: <Timer         size={16} strokeWidth={1.5} />, label: '작업 타이머', tab: 'record' },
            { icon: <AlertTriangle size={16} strokeWidth={1.5} />, label: '이슈 등록',   tab: 'more'   },
            { icon: <Plus          size={16} strokeWidth={1.5} />, label: '할 일 추가',  tab: 'more'   },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => onNavigate(item.tab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                color: 'var(--text-light)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                transition: 'background 0.15s',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
