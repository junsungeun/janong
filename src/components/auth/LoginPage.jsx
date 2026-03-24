import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signUpDone, setSignUpDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password, name, groupName);
        setSignUpDone(true);
      }
    } catch (err) {
      setError(err.message || (mode === 'login' ? '로그인에 실패했습니다.' : '회원가입에 실패했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setSignUpDone(false);
  };

  if (signUpDone) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-brand">
            <img src="/logo.png" alt="SeedLog" className="login-logo-img" />
            <div className="login-logo">SeedLog</div>
            <div className="login-subtitle">농사 기록 플랫폼</div>
          </div>
          <div className="login-success">
            <p>회원가입이 완료되었습니다.</p>
            <p className="login-success-sub">이메일 인증 후 로그인해주세요.</p>
          </div>
          <button className="btn-primary login-btn" onClick={() => { setMode('login'); setSignUpDone(false); }}>
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`login-page${loading ? ' login-page--loading' : ''}`}>
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">
            SeedLog
            <span className="login-sprout" aria-hidden="true">&#127793;</span>
          </div>
          <div className="login-subtitle">농사 기록 플랫폼</div>
          <div className="login-tagline">내 땅을 아는 농사</div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'signup' && (
            <>
              <div className="login-field">
                <label className="label" htmlFor="login-name">이름</label>
                <div className="login-field-icon">
                  <User size={16} className="login-field-icon-svg" />
                  <input
                    id="login-name"
                    className="input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름을 입력하세요"
                    autoComplete="name"
                  />
                </div>
              </div>
              <div className="login-field">
                <label className="label" htmlFor="login-group">조</label>
                <select
                  id="login-group"
                  className="input"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                >
                  <option value="">조를 선택하세요</option>
                  <option value="1조">1조</option>
                  <option value="2조">2조</option>
                  <option value="3조">3조</option>
                  <option value="4조">4조</option>
                </select>
              </div>
            </>
          )}

          <div className="login-field">
            <label className="label" htmlFor="login-email">이메일</label>
            <div className="login-field-icon">
              <Mail size={16} className="login-field-icon-svg" />
              <input
                id="login-email"
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@seedlog.kr"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label className="label" htmlFor="login-password">비밀번호</label>
            <div className="login-field-icon">
              <Lock size={16} className="login-field-icon-svg" />
              <input
                id="login-password"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? '영문/숫자 조합 6자 이상' : '비밀번호를 입력하세요'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
                minLength={mode === 'signup' ? 6 : undefined}
              />
            </div>
            {mode === 'signup' && (
              <p className="login-password-hint">영문, 숫자를 포함해 6자 이상 입력해주세요</p>
            )}
          </div>

          {error && <div className="login-error" role="alert">{error}</div>}

          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? (mode === 'login' ? '로그인 중...' : '가입 중...') : (mode === 'login' ? '로그인' : '회원가입')}
          </button>
        </form>

        <p className="login-notice">
          {mode === 'login' ? (
            <>계정이 없으신가요? <button className="login-link" onClick={switchMode}>회원가입</button></>
          ) : (
            <>이미 계정이 있으신가요? <button className="login-link" onClick={switchMode}>로그인</button></>
          )}
        </p>
      </div>
    </div>
  );
}
