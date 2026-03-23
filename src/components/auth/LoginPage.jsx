import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('login'); // login | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
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
        await signUp(email, password, name);
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
            <div className="login-logo">JANONG</div>
            <div className="login-subtitle">Farm R&D</div>
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
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">JANONG</div>
          <div className="login-subtitle">Farm R&D</div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'signup' && (
            <div className="login-field">
              <label className="label" htmlFor="login-name">이름</label>
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
          )}

          <div className="login-field">
            <label className="label" htmlFor="login-email">이메일</label>
            <input
              id="login-email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@janong.kr"
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label className="label" htmlFor="login-password">비밀번호</label>
            <input
              id="login-password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? '6자 이상 입력하세요' : '비밀번호를 입력하세요'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              minLength={mode === 'signup' ? 6 : undefined}
            />
          </div>

          {error && <div className="login-error">{error}</div>}

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
