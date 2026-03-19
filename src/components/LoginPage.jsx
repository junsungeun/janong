import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sprout, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px',
          background: 'var(--color-primary-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <Sprout size={28} color="var(--color-primary)" strokeWidth={1.5} />
        </div>
        <h1 style={{
          fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 700,
          letterSpacing: '0.18em', color: 'var(--color-primary)', textTransform: 'uppercase',
        }}>
          JANONG
        </h1>
        <p style={{
          fontSize: '11px', color: 'var(--text-muted)',
          letterSpacing: '0.15em', marginTop: '4px', textTransform: 'uppercase',
        }}>
          Farm System
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{
        width: '100%', maxWidth: '340px',
        display: 'flex', flexDirection: 'column', gap: '14px',
      }}>
        <div>
          <label style={{
            display: 'block', fontSize: '12px', fontWeight: 600,
            color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.04em',
          }}>
            이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              width: '100%', padding: '12px 14px',
              border: '1px solid var(--border)',
              borderRadius: '10px', fontSize: '15px',
              fontFamily: 'var(--font-sans)',
              background: 'var(--bg-card)',
              color: 'var(--text)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div>
          <label style={{
            display: 'block', fontSize: '12px', fontWeight: 600,
            color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.04em',
          }}>
            비밀번호
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%', padding: '12px 42px 12px 14px',
                border: '1px solid var(--border)',
                borderRadius: '10px', fontSize: '15px',
                fontFamily: 'var(--font-sans)',
                background: 'var(--bg-card)',
                color: 'var(--text)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', display: 'flex', padding: '2px',
              }}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <p style={{
            fontSize: '13px', color: 'var(--color-danger)',
            textAlign: 'center', margin: '0',
          }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '13px',
            background: loading ? 'var(--text-muted)' : 'var(--color-primary)',
            color: '#fff', border: 'none', borderRadius: '10px',
            fontSize: '15px', fontWeight: 600,
            fontFamily: 'var(--font-sans)',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '6px',
            transition: 'background 0.15s',
          }}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <p style={{
        fontSize: '11px', color: 'var(--text-muted)',
        textAlign: 'center', marginTop: '48px', fontStyle: 'italic',
      }}>
        In the beginning God created the heavens and the earth.
      </p>
    </div>
  );
}
