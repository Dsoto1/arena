/* babylon100/shot.js — screenshots of the mock-up.  node tools/plans/babylon100/shot.js <out.png> <width> <height> [query] */
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const path = require('path');
const ROOT = path.resolve(__dirname, '../../..'); const [out, W, H, q] = process.argv.slice(2); const PORT = 8872 + Math.floor(Math.random() * 50);
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); await new Promise(r => setTimeout(r, 700));
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try { const mobile = +W < 600; const pg = await b.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: mobile ? 3 : 1, isMobile: mobile, hasTouch: mobile });
    const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text().slice(0, 200)); });
    await pg.goto(`http://127.0.0.1:${PORT}/tools/plans/babylon100/arena.html${q ? '?' + q : ''}`); await pg.waitForFunction(() => window.MOCK_READY || window.MOCK_ERR, null, { timeout: 180000 });
    await pg.waitForTimeout(2500); await pg.screenshot({ path: out }); console.log(JSON.stringify(await pg.evaluate(() => ({ err: window.MOCK_ERR, s: window.MOCK.stats() }))), errs.slice(0, 8));
  } finally { await b.close(); srv.kill(); }
})();
