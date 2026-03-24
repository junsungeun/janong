export default function Header() {
  return (
    <header className="app-header">
      <div>
        <div className="app-header-brand">
          <span className="app-header-logo">SeedLog</span>
          <span className="app-header-sprout" aria-hidden="true">&#127793;</span>
        </div>
        <div className="app-header-sub">농사 기록 플랫폼</div>
      </div>
    </header>
  );
}
