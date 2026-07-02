import { fmtDate, fmtMoney } from '../api.js';
import { Empty } from './Common.jsx';

export default function LedgerTable({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="ledger">
        <Empty title="No entries yet">Transactions you make will appear here.</Empty>
      </div>
    );
  }

  return (
    <div className="ledger">
      <div className="ledger-row head">
        <span></span>
        <span>Destination IBAN</span>
        <span>Type</span>
        <span>Date</span>
        <span style={{ textAlign: 'right' }}>Amount</span>
      </div>
      {transactions.map((t, i) => {
        const type = (t.type || '').toLowerCase();
        const isDeposit = type === 'deposit';
        return (
          <div className="ledger-row" key={i}>
            <span className={`badge ${type}`}>{isDeposit ? 'DEP' : 'TRF'}</span>
            <span className="ledger-iban">{t.destinationIban || '—'}</span>
            <span style={{ textTransform: 'capitalize' }}>{t.type || '—'}</span>
            <span className="ledger-date">{fmtDate(t.transactionDate)}</span>
            <span className={`ledger-amt ${type}`}>
              {isDeposit ? '+' : '−'} ₹{fmtMoney(t.amount)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
