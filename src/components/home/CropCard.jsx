import React, { useState, useRef, useEffect } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { ChevronRight, MoreVertical, Pencil, Trash2 } from 'lucide-react';

export default function CropCard({ crop, logCount = 0, lastLog, onClick, onEdit, onDelete }) {
  const { name, variety, plantingDate } = crop;
  const daysSincePlanting = plantingDate
    ? Math.floor((Date.now() - new Date(plantingDate)) / 86400000)
    : null;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [menuOpen]);

  return (
    <Card onClick={onClick} className="crop-card">
      <div className="crop-card-top">
        <div className="crop-card-body">
          <div className="crop-card-header">
            <span className="crop-card-name">{name}</span>
            {variety && <Badge variant="info">{variety}</Badge>}
          </div>
          <div className="crop-card-meta">
            <span className="crop-card-stat">
              기록 <strong>{logCount}</strong>건
            </span>
            {lastLog && (
              <span className="crop-card-stat crop-card-last">
                최근 {lastLog}
              </span>
            )}
          </div>
        </div>
        <div className="crop-card-right">
          {daysSincePlanting !== null && (
            <div className="crop-card-days">
              <span className="crop-card-days-num">{daysSincePlanting}</span>
              <span className="crop-card-days-label">일째</span>
            </div>
          )}
          <div className="crop-card-actions" ref={menuRef}>
            <button
              className="crop-card-menu-btn"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              aria-label="메뉴"
            >
              <MoreVertical size={18} />
            </button>
            {menuOpen && (
              <div className="crop-card-dropdown">
                <button className="crop-card-dropdown-item" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit?.(crop); }}>
                  <Pencil size={14} />
                  <span>수정</span>
                </button>
                <button className="crop-card-dropdown-item crop-card-dropdown-item--danger" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete?.(crop); }}>
                  <Trash2 size={14} />
                  <span>삭제</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
