import { CheckCircle, MapPin, Cpu, CloudSun, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsPanel() {
  const { user, profile, signOut } = useAuth();

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <span className="section-title">앱 설정</span>
      </div>

      {/* ── 내 계정 ── */}
      <div className="card" style={{ padding: '16px 18px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: 'var(--color-primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <User size={18} color="var(--color-primary)" strokeWidth={1.5} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
              {profile?.name || '사용자'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* ── 로그아웃 ── */}
      <button
        onClick={signOut}
        className="card"
        style={{
          width: '100%', padding: '14px 18px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <div style={{
          width: '36px', height: '36px', borderRadius: '8px',
          background: '#FFF0F0',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <LogOut size={18} color="var(--color-danger)" strokeWidth={1.5} />
        </div>
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-danger)' }}>로그아웃</p>
      </button>

      {/* ── 연동 현황 ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>

        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'var(--color-primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Cpu size={18} color="var(--color-primary)" strokeWidth={1.5} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Gemini 2.5 Flash</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>작물 분석 · 병해충 진단</p>
            </div>
            <CheckCircle size={18} color="var(--color-primary)" strokeWidth={2} />
          </div>
        </div>

        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'var(--color-earth-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <CloudSun size={18} color="var(--color-earth)" strokeWidth={1.5} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>농업기상 상세 관측 API</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>농촌진흥청 국립농업과학원</p>
            </div>
            <CheckCircle size={18} color="var(--color-primary)" strokeWidth={2} />
          </div>
        </div>

        <div className="card" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: '#FFF0E8',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <MapPin size={18} color="var(--color-terra)" strokeWidth={1.5} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>경기도 양주시 은현면</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>관측지점 482841A001 · 고도 107m</p>
            </div>
            <CheckCircle size={18} color="var(--color-primary)" strokeWidth={2} />
          </div>
        </div>

      </div>

      {/* ── 앱 정보 ── */}
      <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-muted)' }}>
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: '11px',
          letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px',
        }}>
          JANONG Farm System
        </p>
        <p style={{ fontSize: '11px', fontStyle: 'italic', marginBottom: '4px' }}>
          In the beginning God created · v0.8.0
        </p>
        <p style={{ fontSize: '11px' }}>창세기 1:1</p>
      </div>
    </div>
  );
}
