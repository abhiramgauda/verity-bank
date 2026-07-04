import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../ToastContext.jsx';
import { api } from '../api.js';
import { Banner, Empty, PageHead, Spinner } from '../components/Common.jsx';

function UserList({ users, isActive, onToggle, onPromote }) {
  if (!users.length) {
    return (
      <div className="ledger">
        <Empty title="None found." />
      </div>
    );
  }
  return (
    <div className="ledger">
      {users.map((u) => (
        <div className="row-flat" key={u.id}>
          <div>
            <div className="primary">{u.firstname} {u.lastname}</div>
            <div className="secondary">{u.email} · #{u.id}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => onPromote(u.id)}>Make Admin</button>
            <button className={`btn btn-sm ${isActive ? 'btn-danger-ghost' : 'btn-gold'}`} onClick={() => onToggle(u.id, isActive)}>
              {isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Admin() {
  const { token } = useAuth();
  const toast = useToast();

  const [active, setActive] = useState(null);
  const [activeErr, setActiveErr] = useState('');
  const [inactive, setInactive] = useState(null);
  const [inactiveErr, setInactiveErr] = useState('');

  const load = useCallback(() => {
    setActiveErr('');
    setInactiveErr('');
    api('/admin/users/active', {}, token)
      .then((data) => setActive(data || []))
      .catch((err) => setActiveErr(err.message));
    api('/admin/users/inactive', {}, token)
      .then((data) => setInactive(data || []))
      .catch((err) => setInactiveErr(err.message));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(id, currentlyActive) {
    try {
      await api(`/users/${currentlyActive ? 'invalidate' : 'validate'}/${id}`, { method: 'PATCH' }, token);
      toast(`User ${currentlyActive ? 'deactivated' : 'activated'}.`, 'success');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function promote(id) {
    if (!confirm('Grant this user admin privileges?')) return;
    try {
      await api(`/admin/users/${id}/promote`, { method: 'PATCH' }, token);
      toast('User promoted to admin.', 'success');
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <>
      <PageHead eyebrow="Back Office" title="Admin" sub="Manage customer activation status. Requires an admin role." />
      <Banner type="info">
        These actions require the ROLE_ADMIN privilege on your account. If you registered as a standard customer,
        calls below will be denied.
      </Banner>
      <div className="grid-2">
        <div className="section">
          <div className="section-head">
            <h2>Active Users</h2>
          </div>
          {active === null && !activeErr ? (
            <div className="empty">
              <Spinner dark />
            </div>
          ) : activeErr ? (
            <Banner type="error">{activeErr}</Banner>
          ) : (
            <UserList users={active} isActive onToggle={toggle} onPromote={promote} />
          )}
        </div>
        <div className="section">
          <div className="section-head">
            <h2>Inactive Users</h2>
          </div>
          {inactive === null && !inactiveErr ? (
            <div className="empty">
              <Spinner dark />
            </div>
          ) : inactiveErr ? (
            <Banner type="error">{inactiveErr}</Banner>
          ) : (
            <UserList users={inactive} isActive={false} onToggle={toggle} onPromote={promote} />
          )}
        </div>
      </div>
    </>
  );
}
