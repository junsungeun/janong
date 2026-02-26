import { Sprout } from 'lucide-react';

export default function PlaceholderPage({ title, description }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '40px 20px',
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: 'var(--color-primary-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
      }}>
        <Sprout size={28} color="var(--color-primary)" strokeWidth={1.5} />
      </div>
      <h2 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '20px',
        fontWeight: 600,
        color: 'var(--text)',
        marginBottom: '10px',
        letterSpacing: '-0.02em',
      }}>
        {title}
      </h2>
      <p style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--text-muted)',
        lineHeight: 'var(--leading-loose)',
        maxWidth: '260px',
      }}>
        {description || '다음 개발 단계에서 구현됩니다.'}
      </p>
      <div style={{
        marginTop: '24px',
        padding: '10px 20px',
        background: 'var(--bg-subtle)',
        borderRadius: '100px',
        fontSize: '12px',
        color: 'var(--text-muted)',
      }}>
        개발 진행 중
      </div>
    </div>
  );
}
