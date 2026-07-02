import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../ToastContext.jsx';
import { api, initials } from '../api.js';
import { Banner, Empty, PageHead, Spinner } from '../components/Common.jsx';

export default function Contacts() {
  const { token, userId } = useAuth();
  const toast = useToast();

  const [list, setList] = useState(null);
  const [listErr, setListErr] = useState('');
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ firstname: '', lastname: '', email: '', iban: '' });
  const [formErr, setFormErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setListErr('');
    api(`/contacts/user/${userId}`, {}, token)
      .then((data) => setList(data || []))
      .catch((err) => setListErr(err.message))
      .finally(() => setLoading(false));
  }, [token, userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e) {
    e.preventDefault();
    setFormErr('');
    setBusy(true);
    try {
      await api(
        '/contacts',
        {
          method: 'POST',
          body: JSON.stringify({
            firstname: form.firstname.trim(),
            lastname: form.lastname.trim(),
            email: form.email.trim(),
            iban: form.iban.trim(),
            userId,
          }),
        },
        token
      );
      toast('Beneficiary saved.', 'success');
      setForm({ firstname: '', lastname: '', email: '', iban: '' });
      load();
    } catch (err) {
      setFormErr(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!confirm('Remove this beneficiary?')) return;
    try {
      await api(`/contacts/${id}`, { method: 'DELETE' }, token);
      toast('Beneficiary removed.', 'success');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <>
      <PageHead eyebrow="Address Book" title="Beneficiaries" sub="People you send money to, saved for quick transfers." />

      <div className="section">
        <div className="card">
          <h3 className="card-title" style={{ fontSize: 16 }}>Add beneficiary</h3>
          <form onSubmit={submit}>
            <div className="field-row">
              <div className="field">
                <label htmlFor="ct-first">First name</label>
                <input id="ct-first" type="text" required value={form.firstname} onChange={(e) => setForm((f) => ({ ...f, firstname: e.target.value }))} />
              </div>
              <div className="field">
                <label htmlFor="ct-last">Last name</label>
                <input id="ct-last" type="text" required value={form.lastname} onChange={(e) => setForm((f) => ({ ...f, lastname: e.target.value }))} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="ct-email">Email</label>
                <input id="ct-email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="field">
                <label htmlFor="ct-iban">IBAN</label>
                <input id="ct-iban" type="text" required value={form.iban} onChange={(e) => setForm((f) => ({ ...f, iban: e.target.value }))} />
              </div>
            </div>
            {formErr && <div className="form-error">{formErr}</div>}
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save Beneficiary'}
            </button>
          </form>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h2>Saved Beneficiaries</h2>
        </div>
        {loading ? (
          <div className="empty">
            <Spinner dark />
          </div>
        ) : listErr ? (
          <Banner type="error">{listErr}</Banner>
        ) : !list.length ? (
          <div className="ledger">
            <Empty title="No beneficiaries yet">Add one above to send transfers faster.</Empty>
          </div>
        ) : (
          <div className="ledger">
            {list.map((c) => (
              <div className="row-flat" key={c.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span className="badge transfert">{initials(`${c.firstname} ${c.lastname}`)}</span>
                  <div>
                    <div className="primary">{c.firstname} {c.lastname}</div>
                    <div className="secondary">{c.iban} · {c.email}</div>
                  </div>
                </div>
                <button className="btn btn-danger-ghost btn-sm" onClick={() => remove(c.id)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
