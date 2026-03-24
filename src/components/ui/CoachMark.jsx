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
    } else {
      setRect(null);
    }
  }, [step]);

  useEffect(() => {
    // 약간의 딜레이: DOM 렌더 완료 후 측정
    const id = requestAnimationFrame(updateRect);
    window.addEventListener('resize', updateRect);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', updateRect);
    };
  }, [updateRect]);

  const current = STEPS[step];
  if (!current || !rect) return null;

  const isLast = step === STEPS.length - 1;

  const PAD = 6;
  const TOOLTIP_H = 160; // 툴팁 예상 높이
  const TOOLTIP_W = 280;
  const MARGIN = 12;
  const hlTop = rect.top - PAD;
  const hlLeft = rect.left - PAD;
  const hlW = rect.width + PAD * 2;
  const hlH = rect.height + PAD * 2;

  const tooltipLeft = Math.max(16, Math.min(hlLeft, window.innerWidth - TOOLTIP_W - 16));

  // 아래 공간 부족하면 위로
  const spaceBelow = window.innerHeight - (hlTop + hlH + MARGIN);
  const spaceAbove = hlTop - MARGIN;
  const tooltipStyle = { width: TOOLTIP_W };

  if (current.position === 'bottom' && spaceBelow >= TOOLTIP_H) {
    tooltipStyle.top = hlTop + hlH + MARGIN;
    tooltipStyle.left = tooltipLeft;
  } else if (spaceAbove >= TOOLTIP_H) {
    tooltipStyle.top = hlTop - MARGIN - TOOLTIP_H;
    tooltipStyle.left = tooltipLeft;
  } else {
    // 공간 없으면 화면 중앙
    tooltipStyle.top = Math.max(16, (window.innerHeight - TOOLTIP_H) / 2);
    tooltipStyle.left = (window.innerWidth - TOOLTIP_W) / 2;
  }

  return (
    <div className="coach-overlay">
      {/* box-shadow로 주변 어둡게 + highlight 테두리 */}
      <div
        className="coach-highlight"
        style={{ top: hlTop, left: hlLeft, width: hlW, height: hlH }}
      />

      {/* 툴팁 */}
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
