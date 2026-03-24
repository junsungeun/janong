import React, { useState, useEffect, useCallback } from 'react';

const STEPS = [
  {
    target: '.home-date-section',
    title: '오늘의 날짜',
    desc: '오늘 날짜와 절기 정보를 확인할 수 있어요.',
    position: 'bottom',
  },
  {
    target: '.home-section--crops',
    title: '내 작물',
    desc: '등록한 작물 목록이에요. 작물을 탭하면 상세 페이지로 이동합니다.',
    position: 'bottom',
  },
  {
    target: '.home-record-btn',
    title: '기록하기',
    desc: '이 버튼을 눌러 매일의 재배 기록을 남겨보세요.',
    position: 'top',
  },
  {
    target: '.tab-item:nth-child(2)',
    title: '기록 탭',
    desc: '내가 남긴 모든 기록을 확인하고 관리할 수 있어요.',
    position: 'top',
  },
  {
    target: '.tab-item:nth-child(3)',
    title: '대시보드',
    desc: '전체 현황, 비교 분석, 리포트를 확인할 수 있어요.',
    position: 'top',
  },
  {
    target: '.app-header-settings',
    title: '설정',
    desc: '작물 등록, 계정 관리는 여기서 할 수 있어요.',
    position: 'bottom',
  },
];

export default function CoachMark({ onComplete }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);

  const updateRect = useCallback(() => {
    const el = document.querySelector(STEPS[step]?.target);
    if (el) {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }
  }, [step]);

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [updateRect]);

  const current = STEPS[step];
  if (!current || !rect) return null;

  const isLast = step === STEPS.length - 1;

  // Tooltip position
  const tooltipStyle = {};
  if (current.position === 'bottom') {
    tooltipStyle.top = rect.top + rect.height + 12;
    tooltipStyle.left = Math.max(16, Math.min(rect.left, window.innerWidth - 300));
  } else {
    tooltipStyle.top = rect.top - 12;
    tooltipStyle.left = Math.max(16, Math.min(rect.left, window.innerWidth - 300));
    tooltipStyle.transform = 'translateY(-100%)';
  }

  return (
    <div className="coach-overlay">
      {/* Dark overlay with hole */}
      <svg className="coach-svg" viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}>
        <defs>
          <mask id="coach-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={rect.left - 4} y={rect.top - 4}
              width={rect.width + 8} height={rect.height + 8}
              rx="12" fill="black"
            />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#coach-mask)" />
      </svg>

      {/* Highlight border */}
      <div className="coach-highlight" style={{
        top: rect.top - 4, left: rect.left - 4,
        width: rect.width + 8, height: rect.height + 8,
      }} />

      {/* Tooltip */}
      <div className="coach-tooltip" style={tooltipStyle}>
        <div className="coach-step-indicator">
          {STEPS.map((_, i) => (
            <span key={i} className={`coach-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
          ))}
        </div>
        <h4 className="coach-title">{current.title}</h4>
        <p className="coach-desc">{current.desc}</p>
        <div className="coach-actions">
          <button className="coach-skip" onClick={onComplete}>건너뛰기</button>
          <button className="coach-next" onClick={() => isLast ? onComplete() : setStep(step + 1)}>
            {isLast ? '시작하기' : '다음'}
          </button>
        </div>
      </div>
    </div>
  );
}
