import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../ToastContext.jsx';
import { api } from '../api.js';
import { Banner, Empty, PageHead, Spinner } from '../components/Common.jsx';

export default function Accounts() {
  const { token, userId } = useAuth();
  const toast = useToast();

  const [list, setList] = useState(null);
  const [listErr, setListErr] = useState('');
  const [loading, setLoading] = useState(true);

  const [formUserId, setFormUserId] = useState(userId ?? '');
  const [formErr, setFormErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setListErr('');
    api('/accounts', {}, token)
      .then((data) => setList(data || []))
      .catch((err) => setListErr(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e) {
    e.preventDefault();
    setFormErr('');
    setBusy(true);
    try {
      await api('/accounts', { method: 'POST', body: JSON.stringify({ userId: Number(formUserId) }) }, token);
      toast('Account opened.', 'success');
      load();
    } catch (err) {
      setFormErr(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!confirm('Close this account? This cannot be undone.')) return;
    try {
      await api(`/accounts/${id}`, { method: 'DELETE' }, token);
      toast('Account closed.', 'success');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <>
      <PageHead eyebrow="Registry" title="Accounts" sub="All bank accounts on record." />

      <div className="section">
        <div className="card">
          <h3 className="card-title" style={{ fontSize: 16 }}>Open new account</h3>
          <p className="card-sub">Link an account to a user ID.</p>
          <form onSubmit={submit}>
            <div className="inline-form">
              <div className="field">
                <label htmlFor="ac-userid">User ID</label>
                <input id="ac-userid" type="number" required value={formUserId} onChange={(e) => setFormUserId(e.target.value)} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={busy}>
                {busy ? 'Opening…' : 'Open Account'}
              </button>
            </div>
            {formErr && <div className="form-error" style={{ marginTop: 14 }}>{formErr}</div>}
          </form>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h2>All Accounts</h2>
        </div>
        {loading ? (
          <div className="empty">
            <Spinner dark />
          </div>
        ) : listErr ? (
          <Banner type="error">{listErr}</Banner>
        ) : !list.length ? (
          <div className="ledger">
            <Empty title="No accounts on record" />
          </div>
        ) : (
          <div className="ledger">
            {list.map((a) => (
              <div className="row-flat" key={a.id}>
                <div>
                  <div className="primary">{a.userFirstname} {a.userLastname}</div>
                  <div className="secondary">{a.iban || '—'} · Account #{a.id} · User #{a.userId}</div>
                </div>
                <button className="btn btn-danger-ghost btn-sm" onClick={() => remove(a.id)}>Close</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
