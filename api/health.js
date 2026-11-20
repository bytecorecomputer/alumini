// Open https://YOUR-SITE/api/health in a browser: it tests every piece login depends on and shows its status.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const steps = [];
  const run = async (name, fn) => {
    const t = Date.now();
    try {
      const info = await fn();
      steps.push({ name, ok: true, ms: Date.now() - t, ...(info || {}) });
      return true;
    } catch (e) {
      steps.push({ name, ok: false, ms: Date.now() - t, error: String(e?.message || e).slice(0, 250) });
      return false;
    }
  };

  let S = null, F = null, adminOk = false;
  const libOk = await run('load lib/sheet.js + lib/auth.js', async () => {
    S = await import('../lib/sheet.js');
    await import('../lib/auth.js');
  });

  const fbOk = await run('load lib/firebaseAdmin.js', async () => {
    try {
      F = await import('../lib/firebaseAdmin.js');
    } catch (err) {
      return { notice: 'firebaseAdmin skipped or not needed for sheet login: ' + err.message };
    }
  });

  if (fbOk && F?.ready) {
    adminOk = await run('firebase admin credentials', async () => {
      if (!F.ready()) {
        return { status: 'Client anonymous fallback enabled (no server service account needed for login)' };
      }
      return { ready: true };
    });
  }

  if (adminOk && F?.ready && F.ready()) {
    await run('firestore: students collection', async () => ({
      students: (await F.getDb().collection('students').count().get()).data().count
    }));
    await run('firebase: create login token', async () => {
      await F.getAuthAdmin().createCustomToken('health-check');
    });
  }

  if (libOk && S?.loadStudents) {
    await run('google sheets (SWR cache)', async () => {
      const l = await S.loadStudents();
      return { totalStudents: l.length, sheets: S.sheetInfo() };
    });
  }

  res.status(200).json({
    ok: steps.filter(s => s.name.includes('sheet')).every(s => s.ok),
    node: process.version,
    time: new Date().toISOString(),
    env: {
      FIREBASE_SERVICE_ACCOUNT: !!process.env.FIREBASE_SERVICE_ACCOUNT,
      VITE_FIREBASE_PRIVATE_KEY: !!process.env.VITE_FIREBASE_PRIVATE_KEY,
      VITE_FIREBASE_CLIENT_EMAIL: !!process.env.VITE_FIREBASE_CLIENT_EMAIL,
      SYNC_SECRET: !!process.env.SYNC_SECRET
    },
    steps,
  });
}
