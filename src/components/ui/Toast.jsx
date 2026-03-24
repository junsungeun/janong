import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export const toast = {
  success: (msg) => window.dispatchEvent(new CustomEvent('janong-toast', { detail: { msg, type: 'success' } })),
  error:   (msg) => window.dispatchEvent(new CustomEvent('janong-toast', { detail: { msg, type: 'error' } })),
  info:    (msg) => window.dispatchEvent(new CustomEvent('janong-toast', { detail: { msg, type: 'info' } })),
};

const ICONS = {
  success: <CheckCircle size={15} strokeWidth={2} />,
  error:   <XCircle size={15} strokeWidth={2} />,
  info:    <Info size={15} strokeWidth={2} />,
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
      setToasts(prev => [...prev, { id, ...e.detail }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800);
    };
    window.addEventListener('janong-toast', handler);
    return () => window.removeEventListener('janong-toast', handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type || 'info'}`}>
          <span className="toast-icon">{ICONS[t.type] || ICONS.info}</span>
          <span className="toast-msg">{t.msg}</span>
          <button
            className="toast-dismiss"
            onClick={() => dismiss(t.id)}
            aria-label="닫기"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
