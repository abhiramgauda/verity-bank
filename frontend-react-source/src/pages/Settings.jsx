import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../ToastContext.jsx';
import { getApiBase, setApiBase } from '../api.js';
import { Banner, PageHead } from '../components/Common.jsx';

export default function Settings() {
  const { token, userId, username } = useAuth();
  const toast = useToast();
  const [value, setValue] = useState(getApiBase());
  const [result, setResult] = useState(null);

  async function save() {
    const trimmed = value.trim().replace(/\/$/, '');
    setApiBase(trimmed);
    setResult({ type: 'info', msg: `Saved. Base URL set to ${trimmed}` });
    toast('API address updated.', 'success');
  }

  return (
    <>
      <PageHead eyebrow="Configuration" title="Settings" sub="Connection and session details." />

      <div className="card" style={{ marginBottom: 18 }}>
        <h3 className="card-title" style={{ fontSize: 16 }}>API Connection</h3>
        <p className="card-sub">
          By default the app calls the backend on the same origin ({window.location.origin}). Override only if your
          API runs elsewhere.
        </p>
        <div className="field">
          <label htmlFor="settings-api">API base URL</label>
          <input id="settings-api" type="text" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-sm" onClick={save}>Save</button>
        {result && <div style={{ marginTop: 14 }}><Banner type={result.type}>{result.msg}</Banner></div>}
      </div>

      <div className="card">
        <h3 className="card-title" style={{ fontSize: 16 }}>Session</h3>
        <div className="kv"><span className="k">Signed in as</span><span className="v">{username || '—'}</span></div>
        <div className="kv"><span className="k">User ID</span><span className="v">{userId ?? '—'}</span></div>
        <div className="kv"><span className="k">Token</span><span className="v">{(token || '').slice(0, 24)}…</span></div>
      </div>
    </>
  );
}
