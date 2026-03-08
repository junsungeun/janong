import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Pencil, Trash2, MoreVertical } from 'lucide-react';

// ── 스와이프 + 케밥 메뉴 통합 액션 컴포넌트 ──
// 모바일: 좌측 스와이프 → 편집/삭제 노출
// 공통: ⋮ 버튼 → 드롭다운 메뉴 (Portal로 렌더링하여 잘림 방지)

const ACTION_WIDTH = 72;
const TOTAL_ACTION = ACTION_WIDTH * 2;
const THRESHOLD = 40;

export function SwipeableRow({ children, onEdit, onDelete, style = {} }) {
  const [offsetX, setOffsetX] = useState(0);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const startX = useRef(0);
  const startY = useRef(0);
  const dragging = useRef(false);
  const isHorizontal = useRef(null);
  const rowRef = useRef(null);
  const menuBtnRef = useRef(null);
  const menuRef = useRef(null);

  const close = useCallback(() => {
    setOpen(false);
    setOffsetX(0);
    setMenuOpen(false);
  }, []);

  // 외부 클릭 시 메뉴/스와이프 닫기
  useEffect(() => {
    if (!open && !menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      if (rowRef.current && !rowRef.current.contains(e.target)) close();
      if (menuOpen && menuBtnRef.current && !menuBtnRef.current.contains(e.target) &&
          menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open, menuOpen, close]);

  // 스크롤 시 드롭다운 닫기
  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(false);
    window.addEventListener('scroll', handler, true);
    return () => window.removeEventListener('scroll', handler, true);
  }, [menuOpen]);

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    dragging.current = true;
    isHorizontal.current = null;
  };

  const onTouchMove = (e) => {
    if (!dragging.current) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (isHorizontal.current === null) {
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        isHorizontal.current = Math.abs(dx) > Math.abs(dy);
      }
      return;
    }

    if (!isHorizontal.current) return;

    e.preventDefault();
    const base = open ? -TOTAL_ACTION : 0;
    const next = base + dx;
    setOffsetX(Math.max(-TOTAL_ACTION, Math.min(0, next)));
  };

  const onTouchEnd = () => {
    dragging.current = false;
    isHorizontal.current = null;
    if (offsetX < -THRESHOLD) {
      setOffsetX(-TOTAL_ACTION);
      setOpen(true);
    } else {
      setOffsetX(0);
      setOpen(false);
    }
  };

  const handleEdit = () => {
    close();
    onEdit?.();
  };

  const handleDelete = () => {
    close();
    onDelete?.();
  };

  const openMenu = (e) => {
    e.stopPropagation();
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }
    // 버튼 위치 기준으로 드롭다운 위치 계산
    const rect = menuBtnRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
    setMenuOpen(true);
  };

  return (
    <div ref={rowRef} style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', ...style }}>
      {/* 스와이프 뒤 액션 버튼 */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0,
        display: 'flex', zIndex: 1,
      }}>
        {onEdit && (
          <button
            onClick={handleEdit}
            aria-label="편집"
            style={{
              width: ACTION_WIDTH, border: 'none', cursor: 'pointer',
              background: 'var(--color-primary)', color: '#fff',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '4px', fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-sans)',
            }}
          >
            <Pencil size={16} strokeWidth={2} />
            편집
          </button>
        )}
        {onDelete && (
          <button
            onClick={handleDelete}
            aria-label="삭제"
            style={{
              width: ACTION_WIDTH, border: 'none', cursor: 'pointer',
              background: 'var(--color-danger)', color: '#fff',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '4px', fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-sans)',
            }}
          >
            <Trash2 size={16} strokeWidth={2} />
            삭제
          </button>
        )}
      </div>

      {/* 메인 콘텐츠 (스와이프 대상) */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          position: 'relative', zIndex: 2,
          background: 'var(--bg-card)',
          transform: `translateX(${offsetX}px)`,
          transition: dragging.current ? 'none' : 'transform 0.25s cubic-bezier(.2,.8,.3,1)',
          willChange: 'transform',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {children}
          </div>
          {/* 케밥 메뉴 (⋮) */}
          <div style={{ flexShrink: 0 }}>
            <button
              ref={menuBtnRef}
              onClick={openMenu}
              aria-label="더보기"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px', color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '6px', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <MoreVertical size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* 드롭다운 — Portal로 body에 렌더링 (overflow:hidden 회피) */}
      {menuOpen && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: menuPos.top + 'px',
            right: menuPos.right + 'px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
            zIndex: 10000, overflow: 'hidden', minWidth: '120px',
            animation: 'modalIn 0.12s ease',
          }}
        >
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); handleEdit(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '11px 16px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 500, color: 'var(--text)',
                fontFamily: 'var(--font-sans)', textAlign: 'left',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <Pencil size={14} strokeWidth={2} style={{ color: 'var(--color-primary)' }} />
              편집
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '11px 16px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 500, color: 'var(--color-danger)',
                fontFamily: 'var(--font-sans)', textAlign: 'left',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#FFF0F0'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <Trash2 size={14} strokeWidth={2} />
              삭제
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
