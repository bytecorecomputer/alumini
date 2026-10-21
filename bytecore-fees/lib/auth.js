import crypto from 'node:crypto';
const sign = p => crypto.createHmac('sha256', process.env.SESSION_SECRET).update(p).digest('base64url');
export const issue = (id, days = 7) => { const p = Buffer.from(JSON.stringify({ id, exp: Date.now() + days * 864e5 })).toString('base64url'); return `${p}.${sign(p)}`; };
export function verify(req) {
  const [p, s] = String(req.headers.authorization || '').replace('Bearer ', '').split('.'); if (!p || !s) return null;
  const ok = sign(p); if (s.length !== ok.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(ok))) return null;
  try { const d = JSON.parse(Buffer.from(p, 'base64url')); return d.exp > Date.now() ? d.id : null; } catch { return null; }
}
export const same = (a, b) => { const h = x => crypto.createHash('sha256').update(String(x)).digest(); return crypto.timingSafeEqual(h(a), h(b)); };
export const ipOf = req => String(req.headers['x-forwarded-for'] || 'x').split(',')[0].trim();
export const limiter = max => { const hits = new Map(); return ip => { const n = Date.now(), h = (hits.get(ip) || []).filter(t => n - t < 6e5); h.push(n); hits.set(ip, h); return h.length > max; }; };
export const configured = () => !!process.env.SESSION_SECRET;
