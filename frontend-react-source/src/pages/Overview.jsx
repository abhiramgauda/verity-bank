import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { api, fmtMoney } from '../api.js';
import { Banner, PageHead, Spinner } from '../components/Common.jsx';
import LedgerTable from '../components/LedgerTable.jsx';

export default function Overview({ onNavigate }) {
  const { token, userId, username } = useAuth();
  const [stats, setStats] = useState(null);
  const [statsErr, setStatsErr] = useState('');
  const [tx, setTx] = useState(null);
  const [txErr, setTxErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.allSettled([
      api(`/statistics/${userId}`, {}, token),
      api(`/transactions/user/${userId}`, {}, token),
    ]).then(([statsRes, txRes]) => {
      if (cancelled) return;
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      else setStatsErr(statsRes.reason.message);
      if (txRes.status === 'fulfilled') setTx(txRes.value || []);
      else setTxErr(txRes.reason.message);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [token, userId]);

  const recent = (tx || [])
    .slice()
    .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
    .slice(0, 5);

  return (
    <>
      <PageHead eyebrow="Statement" title="Overview" sub="A snapshot of your standing with the bank." />

      {loading && (
        <div className="empty">
          <Spinner dark />
        </div>
      )}

      {!loading && statsErr && <Banner type="error">Could not load statistics: {statsErr}</Banner>}

      {!loading && stats && (
        <div className="passbook">
          <div className="passbook-top">
            <div>
              <div className="passbook-label">Account Balance</div>
              <div className="passbook-balance">
                <span className="cur">₹</span>
                {fmtMoney(stats.accountBalance)}
              </div>
            </div>
            <div className="stamp">
              VERIFIED
              <br />
              LEDGER
            </div>
          </div>
          <div className="passbook-meta">
            <div>
              <div className="k">Highest Transfer</div>
              <div className="v">₹{fmtMoney(stats.highestTransfer)}</div>
            </div>
            <div>
              <div className="k">Highest Deposit</div>
              <div className="v">₹{fmtMoney(stats.highestDeposit)}</div>
            </div>
            <div>
              <div className="k">Holder</div>
              <div className="v">{username || '—'}</div>
            </div>
          </div>
        </div>
      )}

      {!loading && (
        <div className="section">
          <div className="section-head">
            <h2>Recent Activity</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('transactions')}>
              View all
            </button>
          </div>
          {txErr ? <Banner type="error">Could not load transactions: {txErr}</Banner> : <LedgerTable transactions={recent} />}
        </div>
      )}
    </>
  );
}
