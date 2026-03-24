import React from 'react';

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-state-icon">
          <Icon size={56} />
        </div>
      )}
      {title && <p className="empty-state-title">{title}</p>}
      {description && <p className="empty-state-text">{description}</p>}
      {actionLabel && onAction && (
        <button className="btn-primary empty-state-action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
