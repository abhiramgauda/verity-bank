const DEFAULT_API_BASE = '/api/v1';

export function getApiBase() {
  return localStorage.getItem('verity_api_base') || DEFAULT_API_BASE;
}

export function setApiBase(base) {
  localStorage.setItem('verity_api_base', base);
}

export async function api(path, opts = {}, token) {
  const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
  if (token) headers['Authorization'] = 'Bearer ' + token;

  let res;
  try {
    res = await fetch(getApiBase() + path, { ...opts, headers });
  } catch (err) {
    throw new Error(
      `Could not reach the API at ${getApiBase()}. Check the address in Settings and that the server is running.`
    );
  }

  if (res.status === 401 || res.status === 403) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Not authorized. Your session may have expired or you lack permission for this action.');
  }

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      msg = body.message || body.error || JSON.stringify(body);
    } catch {
      try {
        msg = (await res.text()) || msg;
      } catch {
        /* noop */
      }
    }
    throw new Error(msg);
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  const t = await res.text();
  return t ? (isNaN(t) ? t : Number(t)) : null;
}

export function fmtMoney(v) {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function initials(name) {
  if (!name) return '—';
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
