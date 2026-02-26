import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

export const toast = {
  success: (msg) => window.dispatchEvent(new CustomEvent('janong-toast', { detail: { msg, type: 'success' } })),
  error:   (msg) => window.dispatchEvent(new CustomEvent('janong-toast', { detail: { msg, type: 'error' } })),
  info:    (msg) => window.dispatchEvent(new CustomEvent('janong-toast', { detail: { msg, type: 'info' } })),
};

const STYLES = {
  success: { bg: '#3B5E3A', icon: <CheckCircle size={15} strokeWidth={2} /> },
  error:   { bg: '#C0392B', icon: <XCircle     size={15} strokeWidth={2} /> },
  info:    { bg: '#8B6914', icon: <Info        size={15} strokeWidth={2} /> },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, ...e.detail }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800);
    };
    window.addEventListener('janong-toast', handler);
    return () => window.removeEventListener('janong-toast', handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={{
        position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', gap: '8px',
        zIndex: 9999, width: 'min(320px, calc(100vw - 40px))',
        pointerEvents: 'none',
      }}>
        {toasts.map(t => {
          const s = STYLES[t.type] || STYLES.info;
          return (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 16px', background: s.bg, color: '#fff',
              borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-sans)',
              animation: 'toastIn 0.2s ease',
            }}>
              {s.icon}
              {t.msg}
            </div>
          );
        })}
      </div>
    </>
  );
}
