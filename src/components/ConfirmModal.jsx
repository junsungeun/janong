import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

export function ConfirmModal({ message, onConfirm, onCancel, confirmLabel = '삭제', danger = true }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onCancel();
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => document.removeEventListener('mousedown', handler);
  }, [onCancel]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 10000, padding: '20px',
    }}>
      <div ref={ref} style={{
        background: 'var(--bg-card)', borderRadius: '14px',
        padding: '24px 20px 20px', width: 'min(320px, 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        animation: 'modalIn 0.15s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: danger ? 'rgba(192,57,43,0.1)' : 'var(--color-primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <AlertTriangle size={18} strokeWidth={2} style={{ color: danger ? 'var(--color-danger)' : 'var(--color-primary)' }} />
          </div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.5, fontFamily: 'var(--font-sans)' }}>
            {message}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '10px 20px', fontSize: '13px', fontWeight: 600,
            background: 'var(--bg-subtle)', color: 'var(--text)',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}>
            취소
          </button>
          <button onClick={onConfirm} style={{
            padding: '10px 20px', fontSize: '13px', fontWeight: 600,
            background: danger ? 'var(--color-danger)' : 'var(--color-primary)',
            color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
          }}>
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }`}</style>
    </div>
  );
}
