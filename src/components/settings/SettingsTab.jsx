import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
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
      </div>

      {/* Account info */}
      <Card className="settings-account">
        <div className="section-header">
          <span className="section-title">계정 정보</span>
        </div>
        <div className="settings-account-row">
          <span className="settings-label">이메일</span>
          <span className="settings-value">{user?.email || '-'}</span>
        </div>
        <div className="settings-account-row">
          <span className="settings-label">권한</span>
          <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>
        </div>
      </Card>

      {/* Crop Manager */}
      <CropManager />

      {/* Logout */}
      <div className="settings-logout-wrap">
        <Button variant="secondary" className="settings-logout-btn" onClick={signOut}>
          로그아웃
        </Button>
      </div>
    </div>
  );
}
