export default function Header() {
  return (
    <header className="app-header">
      <div>
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--color-primary)',
            letterSpacing: '0.18em',
            lineHeight: 1,
          }}
        >
          JANONG
        </div>
        <div
          style={{
            fontSize: 9,
            color: 'var(--text-muted)',
            marginTop: 2,
            letterSpacing: '0.04em',
          }}
        >
          Farm R&D
        </div>
      </div>
    </header>
  );
}
