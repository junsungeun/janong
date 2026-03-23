import React from 'react';

export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-state-icon">
          <Icon size={48} />
        </div>
      )}
      {title && <p className="empty-state-title">{title}</p>}
      {description && <p className="empty-state-text">{description}</p>}
    </div>
  );
}
