// Called by the Google Sheet (Apps Script) the moment someone edits it -> refresh immediately.
import { forceRefresh, sheetInfo } from '../lib/sheet.js';
import { same } from '../lib/auth.js';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const key = req.headers['x-sync-secret'] || '';
  if (!process.env.SYNC_SECRET || !same(key, process.env.SYNC_SECRET)) return res.status(401).json({ error: 'Not allowed' });
  try { const l = await forceRefresh(); return res.status(200).json({ ok: true, students: l.length, hash: l.hash, sheets: sheetInfo() }); }
  catch { return res.status(502).json({ error: 'Sheet unavailable' }); }
}
