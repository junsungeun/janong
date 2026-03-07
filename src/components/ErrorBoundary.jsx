import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[JANONG ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '52px 24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
      }}>
        <AlertTriangle
          size={40}
          strokeWidth={1.5}
          style={{ marginBottom: '16px', opacity: 0.45, color: 'var(--color-warning)' }}
        />
        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
          화면을 불러오지 못했어요
        </p>
        <p style={{ fontSize: '13px', lineHeight: 1.8, marginBottom: '24px' }}>
          일시적인 오류가 발생했어요.<br />새로고침하거나 다시 시도해 주세요.
        </p>
        <button
          onClick={() => this.setState({ hasError: false, error: null })}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 20px',
            borderRadius: '6px',
            border: '1px solid var(--color-primary)',
            background: 'transparent',
            color: 'var(--color-primary)',
            fontSize: '13px',
            fontWeight: 500,
            fontFamily: 'var(--font-sans)',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} strokeWidth={1.5} />
          다시 시도
        </button>
      </div>
    );
  }
}
