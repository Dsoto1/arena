/* look100/make.js — v1.0 look test renders (pictures only): node tools/plans/look100/make.js
   Writes tools/plans/look100/look100_*.png (+ the raw sheets murm_sheet / fem_sheet, murm_hero512) and stats.json. */
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../../..'), PORT = 8795;
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 700));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const pg = await browser.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.goto(`http://127.0.0.1:${PORT}/tools/plans/look100/look.html`);
    await pg.waitForFunction(() => window.LOOK_READY, null, { timeout: 60000 });
    const t0 = Date.now(); const R = await pg.evaluate(() => window.LOOK_RUN()); R.stats.totalMs = Date.now() - t0;
    for (const [k, u] of Object.entries(R.files)) fs.writeFileSync(path.join(__dirname, k + '.png'), Buffer.from(u.split(',')[1], 'base64'));
    fs.writeFileSync(path.join(__dirname, 'stats.json'), JSON.stringify(R.stats, null, 1));
    console.log(JSON.stringify(R.stats, null, 1)); if (errs.length) console.log('ERRS', errs.slice(0, 6));
  } finally { await browser.close(); srv.kill(); }
})().catch(e => { console.error(e); process.exit(1); });
