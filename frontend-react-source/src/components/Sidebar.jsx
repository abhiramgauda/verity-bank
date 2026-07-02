const NAV_ITEMS = [
  { key: 'overview', label: 'Overview' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'contacts', label: 'Beneficiaries' },
  { key: 'accounts', label: 'Accounts' },
  { key: 'admin', label: 'Admin' },
  { key: 'settings', label: 'Settings' },
];

export default function Sidebar({ view, onNavigate, username, userId, onLogout, open }) {
  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="sidebar-brand">
        <span className="seal">V</span>
        <span className="name">Verity Bank</span>
      </div>
      <div className="sidebar-user">
        <div className="who">{username || '—'}</div>
        <div className="id">USER ID {userId ?? '—'}</div>
      </div>
      <nav className="nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`nav-btn${view === item.key ? ' active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <span className="dot" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-foot">
        <button
          className="btn btn-ghost btn-block"
          style={{ color: 'var(--paper)', borderColor: 'rgba(246,243,234,0.3)' }}
          onClick={onLogout}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
