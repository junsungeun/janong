import React, { useState, useEffect, useCallback } from 'react';

export default function Modal({
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  const [exiting, setExiting] = useState(false);

  const handleClose = useCallback(() => {
    if (loading) return;
    setExiting(true);
  }, [loading]);

  useEffect(() => {
    if (!exiting) return;
    const timer = setTimeout(() => {
      onCancel?.();
    }, 180);
    return () => clearTimeout(timer);
  }, [exiting, onCancel]);

  return (
    <div
      className={`modal-overlay${exiting ? ' modal-overlay--exit' : ''}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`modal-content card${exiting ? ' modal-content--exit' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button
            className="btn-secondary"
            onClick={handleClose}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            className={`${danger ? 'btn-danger' : 'btn-primary'}${loading ? ' modal-btn--loading' : ''}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? '처리 중...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
