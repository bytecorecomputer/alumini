// Open  https://YOUR-SITE/api/health  in a browser: it tests every piece login depends on and says which one is broken.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const steps = [];
  const run = async (name, fn) => {
    const t = Date.now();
    try { const info = await fn(); steps.push({ name, ok: true, ms: Date.now() - t, ...(info || {}) }); return true; }
    catch (e) { steps.push({ name, ok: false, ms: Date.now() - t, error: String(e?.message || e).slice(0, 200) }); return false; }
  };
  let S, F, adminOk = false;
  const libOk = await run('load lib/sheet.js + lib/auth.js', async () => { S = await import('../lib/sheet.js'); await import('../lib/auth.js'); });
  const fbOk = await run('load lib/firebaseAdmin.js', async () => { F = await import('../lib/firebaseAdmin.js'); });
  if (fbOk) adminOk = await run('firebase admin credentials', async () => {
    if (!F.ready()) throw new Error('Not initialised. In Vercel set FIREBASE_SERVICE_ACCOUNT (full JSON) or VITE_FIREBASE_PRIVATE_KEY + VITE_FIREBASE_CLIENT_EMAIL.');
  });
  if (adminOk) {
    await run('firestore: students collection', async () => ({ students: (await F.getDb().collection('students').count().get()).data().count }));
    await run('firebase: create login token', async () => { await F.getAuthAdmin().createCustomToken('health-check'); });
  }
  if (libOk) await run('google sheets', async () => { const l = await S.loadStudents(); return { total: l.length, sheets: S.sheetInfo() }; });
  res.status(200).json({
    ok: steps.every(s => s.ok), node: process.version, time: new Date().toISOString(),
    env: { FIREBASE_SERVICE_ACCOUNT: !!process.env.FIREBASE_SERVICE_ACCOUNT, VITE_FIREBASE_PRIVATE_KEY: !!process.env.VITE_FIREBASE_PRIVATE_KEY, VITE_FIREBASE_CLIENT_EMAIL: !!process.env.VITE_FIREBASE_CLIENT_EMAIL, SYNC_SECRET: !!process.env.SYNC_SECRET },
    steps,
  });
}
