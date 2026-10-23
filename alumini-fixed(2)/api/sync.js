// Google Sheet edited -> Apps Script pings this -> only the changed students are written to Firestore
// (the app's existing onSnapshot listeners then update live). Protected by SYNC_SECRET.
import { forceRefresh, sheetInfo } from '../lib/sheet.js';
import { ready, pushChanged } from '../lib/firebaseAdmin.js';
import { same } from '../lib/auth.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!process.env.SYNC_SECRET || !same(req.headers['x-sync-secret'] || '', process.env.SYNC_SECRET)) return res.status(401).json({ error: 'Not allowed' });
  if (!ready()) return res.status(500).json({ error: 'Firebase Admin not configured' });
  try {
    const list = await forceRefresh(), written = await pushChanged(list, req.query?.all === '1');
    return res.status(200).json({ ok: true, students: list.length, written, sheets: sheetInfo() });
  } catch (e) { console.error(e); return res.status(502).json({ error: 'Sheet or database unavailable' }); }
}
