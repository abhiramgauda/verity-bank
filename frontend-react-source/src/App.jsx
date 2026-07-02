import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import { ToastProvider } from './ToastContext.jsx';
import AuthScreen from './pages/AuthScreen.jsx';
import Sidebar from './components/Sidebar.jsx';
import Overview from './pages/Overview.jsx';
import Transactions from './pages/Transactions.jsx';
import Contacts from './pages/Contacts.jsx';
import Accounts from './pages/Accounts.jsx';
import Admin from './pages/Admin.jsx';
import Settings from './pages/Settings.jsx';

function AppShell() {
  const { isAuthenticated, username, userId, logout } = useAuth();
  const [view, setView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) return <AuthScreen />;

  function navigate(v) {
    setView(v);
    setSidebarOpen(false);
  }

  return (
    <div>
      <div className="mobile-topbar">
        <button onClick={() => setSidebarOpen((o) => !o)} aria-label="Toggle menu">☰</button>
        <span className="brandmark" style={{ fontSize: 15 }}>
          <span className="seal" style={{ width: 22, height: 22, fontSize: 9 }}>V</span>
          Verity Bank
        </span>
      </div>
      <div className="shell">
        <Sidebar view={view} onNavigate={navigate} username={username} userId={userId} onLogout={logout} open={sidebarOpen} />
        <main className="main">
          {view === 'overview' && <Overview onNavigate={navigate} />}
          {view === 'transactions' && <Transactions />}
          {view === 'contacts' && <Contacts />}
          {view === 'accounts' && <Accounts />}
          {view === 'admin' && <Admin />}
          {view === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ToastProvider>
  );
}
