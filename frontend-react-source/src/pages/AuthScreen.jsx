import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../ToastContext.jsx';
import { getApiBase } from '../api.js';

export default function AuthScreen() {
  const [tab, setTab] = useState('login');
  const { login, register } = useAuth();
  const toast = useToast();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginErr, setLoginErr] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);

  const [regForm, setRegForm] = useState({ firstname: '', lastname: '', email: '', password: '' });
  const [regErr, setRegErr] = useState('');
  const [regBusy, setRegBusy] = useState(false);

  async function submitLogin(e) {
    e.preventDefault();
    setLoginErr('');
    setLoginBusy(true);
    try {
      await login(loginForm.email.trim(), loginForm.password);
    } catch (err) {
      setLoginErr(err.message);
    } finally {
      setLoginBusy(false);
    }
  }

  async function submitRegister(e) {
    e.preventDefault();
    setRegErr('');
    setRegBusy(true);
    try {
      await register({ ...regForm, firstname: regForm.firstname.trim(), lastname: regForm.lastname.trim(), email: regForm.email.trim(), active: true });
      toast('Account created. Welcome to Verity Bank.', 'success');
    } catch (err) {
      setRegErr(err.message);
    } finally {
      setRegBusy(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-visual">
        <div className="brandmark"><span className="seal">V</span> VERITY BANK</div>
        <div>
          <p className="auth-quote">Every rupee, <em>entered and accounted for.</em></p>
          <div className="ledger-strip" style={{ marginTop: 28 }}>
            <span>Est. Ledger System</span>
            <span>JWT Secured</span>
            <span>Real-time Statements</span>
          </div>
        </div>
        <div className="ledger-strip">
          <span>API — {getApiBase()}</span>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-card">
          <div className="auth-tabs">
            <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => setTab('login')}>Sign In</button>
            <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => setTab('register')}>Open Account</button>
          </div>

          {tab === 'login' ? (
            <div>
              <h1 className="auth-title">Welcome back</h1>
              <p className="auth-sub">Sign in to view your ledger.</p>
              {loginErr && <div className="form-error">{loginErr}</div>}
              <form onSubmit={submitLogin}>
                <div className="field">
                  <label htmlFor="login-email">Email</label>
                  <input id="login-email" type="email" required autoComplete="username" placeholder="you@example.com"
                    value={loginForm.email} onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="field">
                  <label htmlFor="login-password">Password</label>
                  <input id="login-password" type="password" required autoComplete="current-password" placeholder="••••••••"
                    value={loginForm.password} onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))} />
                </div>
                <button className="btn btn-primary btn-block" type="submit" disabled={loginBusy}>
                  {loginBusy ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
              <p className="form-note">New here? <a href="#" onClick={(e) => { e.preventDefault(); setTab('register'); }} style={{ color: 'var(--brass-deep)', fontWeight: 600 }}>Open an account</a></p>
            </div>
          ) : (
            <div>
              <h1 className="auth-title">Open an account</h1>
              <p className="auth-sub">Takes less than a minute.</p>
              {regErr && <div className="form-error">{regErr}</div>}
              <form onSubmit={submitRegister}>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="reg-first">First name</label>
                    <input id="reg-first" type="text" required value={regForm.firstname}
                      onChange={(e) => setRegForm((f) => ({ ...f, firstname: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label htmlFor="reg-last">Last name</label>
                    <input id="reg-last" type="text" required value={regForm.lastname}
                      onChange={(e) => setRegForm((f) => ({ ...f, lastname: e.target.value }))} />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="reg-email">Email</label>
                  <input id="reg-email" type="email" required value={regForm.email}
                    onChange={(e) => setRegForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="field">
                  <label htmlFor="reg-password">Password</label>
                  <input id="reg-password" type="password" required minLength={4} maxLength={16} placeholder="4–16 characters"
                    value={regForm.password} onChange={(e) => setRegForm((f) => ({ ...f, password: e.target.value }))} />
                </div>
                <button className="btn btn-gold btn-block" type="submit" disabled={regBusy}>
                  {regBusy ? 'Creating…' : 'Create Account'}
                </button>
              </form>
              <p className="form-note">Already registered? <a href="#" onClick={(e) => { e.preventDefault(); setTab('login'); }} style={{ color: 'var(--brass-deep)', fontWeight: 600 }}>Sign in</a></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
