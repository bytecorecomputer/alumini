export async function api(path, opts = {}) {
  const r = await fetch(path, opts), j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.error || 'Something went wrong.'), { status: r.status });
  return j;
}
export const post = (path, body) => api(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const authed = (path, token) => api(path, { headers: { Authorization: 'Bearer ' + token } });
export const inr = n => '₹' + Number(n).toLocaleString('en-IN');
export const fmtDate = d => d ? new Date(d + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
