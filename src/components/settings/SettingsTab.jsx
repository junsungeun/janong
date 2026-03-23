import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import CropManager from './CropManager';

export default function SettingsTab() {
  const { user, profile, signOut } = useAuth();

  const roleBadge = profile?.role === 'admin'
    ? { label: '관리자', variant: 'warning' }
    : { label: '일반', variant: 'info' };

  return (
    <div className="settings-tab">
      <div className="page-header">
        <h2 className="page-title">설정</h2>
        <p className="page-subtitle">계정과 작물을 관리하세요</p>
      </div>

      {/* Account info card */}
      <Card className="settings-account">
        <div className="settings-account-header">
          <div className="settings-account-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className="settings-account-name">
            <span className="settings-account-email">
              {user?.email || '-'}
            </span>
            <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>
          </div>
        </div>
      </Card>

      {/* Crop Manager */}
      <CropManager />

      {/* Logout button - subtle danger style */}
      <div className="settings-logout-wrap">
        <button className="settings-logout-btn" onClick={signOut}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          로그아웃
        </button>
      </div>
    </div>
  );
}
