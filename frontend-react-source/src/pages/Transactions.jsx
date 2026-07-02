import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../ToastContext.jsx';
import { api } from '../api.js';
import { Banner, PageHead, Spinner } from '../components/Common.jsx';
import LedgerTable from '../components/LedgerTable.jsx';

export default function Transactions() {
  const { token, userId } = useAuth();
  const toast = useToast();

  const [list, setList] = useState(null);
  const [listErr, setListErr] = useState('');
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ amount: '', destinationIban: '', type: 'DEPOSIT' });
  const [formErr, setFormErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setListErr('');
    api(`/transactions/user/${userId}`, {}, token)
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
        '/transactions',
        {
          method: 'POST',
          body: JSON.stringify({
            amount: Number(form.amount),
            destinationIban: form.destinationIban.trim(),
            type: form.type,
            userId,
          }),
        },
        token
      );
      toast('Transaction recorded.', 'success');
      setForm({ amount: '', destinationIban: '', type: 'DEPOSIT' });
      load();
    } catch (err) {
      setFormErr(err.message);
    } finally {
      setBusy(false);
    }
  }

  const sorted = (list || []).slice().sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));

  return (
    <>
      <PageHead eyebrow="Ledger" title="Transactions" sub="Every deposit and transfer, entered in order." />

      <div className="section">
        <div className="card">
          <h3 className="card-title" style={{ fontSize: 16 }}>New entry</h3>
          <p className="card-sub">Record a deposit or send a transfer to an IBAN.</p>
          <form onSubmit={submit}>
            <div className="field-row">
              <div className="field">
                <label htmlFor="tx-amount">Amount (₹)</label>
                <input
                  id="tx-amount"
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div className="field">
                <label htmlFor="tx-type">Type</label>
                <select id="tx-type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                  <option value="DEPOSIT">Deposit</option>
                  <option value="TRANSFERT">Transfer</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="tx-iban">Destination IBAN</label>
              <input
                id="tx-iban"
                type="text"
                required
                placeholder="e.g. FR76 3000..."
                value={form.destinationIban}
                onChange={(e) => setForm((f) => ({ ...f, destinationIban: e.target.value }))}
              />
            </div>
            {formErr && <div className="form-error">{formErr}</div>}
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? 'Submitting…' : 'Submit Entry'}
            </button>
          </form>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h2>All Transactions</h2>
        </div>
        {loading ? (
          <div className="empty">
            <Spinner dark />
          </div>
        ) : listErr ? (
          <Banner type="error">{listErr}</Banner>
        ) : (
          <LedgerTable transactions={sorted} />
        )}
      </div>
    </>
  );
}
