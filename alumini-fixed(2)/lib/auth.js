import crypto from 'node:crypto';
export const same = (a, b) => { const h = x => crypto.createHash('sha256').update(String(x)).digest(); return crypto.timingSafeEqual(h(a), h(b)); };
export const ipOf = req => String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'x').split(',')[0].trim();
export const limiter = max => { const hits = new Map(); return ip => { const n = Date.now(), h = (hits.get(ip) || []).filter(t => n - t < 6e5); h.push(n); hits.set(ip, h); return h.length > max; }; };
