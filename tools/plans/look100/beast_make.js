/* look100/beast_make.js — LOOK TEST driver for the beasts.
   node tools/plans/look100/beast_make.js render [keys…] [--only idle0,walk0]   → scratch beast_<key>.png + beast_<key>_sheet.webp + beast_report.json
   node tools/plans/look100/beast_make.js comp                                  → sheets beside his minis, strips, board crop, pounce clip (beast_comp.js) */
const { chromium } = require('playwright'); const { spawn, execFileSync } = require('child_process'); const fs = require('fs'), path = require('path');
const HERE = __dirname, ROOT = path.resolve(HERE, '../../..'), PORT = 8801;
const SCR = process.env.LOOK_SCRATCH || path.join(require('os').tmpdir(), 'look100'); fs.mkdirSync(SCR, { recursive: true });
const argv = process.argv.slice(2), mode = argv[0]; const oi = argv.indexOf('--only'); const only = oi >= 0 ? argv[oi + 1].split(',') : null;
const keys = argv.slice(1).filter((a, i, A) => !a.startsWith('--') && A[i - 1] !== '--only');
const save = (f, url) => { fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64')); return fs.statSync(f).size; };
const RP = path.join(HERE, 'beast_report.json');
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); await new Promise(r => setTimeout(r, 700));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const rep = fs.existsSync(RP) ? JSON.parse(fs.readFileSync(RP)) : {}; rep.beasts = rep.beasts || {};
  try {
    const pg = await browser.newPage({ viewport: { width: 1600, height: 1000 } }); const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.goto(`http://127.0.0.1:${PORT}/tools/plans/look100/beast_rig.html`); await pg.waitForFunction(() => window.BEAST100_READY || window.__err, null, { timeout: 60000 });
    const e0 = await pg.evaluate(() => window.__err); if (e0) throw new Error(e0);
    if (mode === 'render') {
      const list = keys.length ? keys : await pg.evaluate(() => Object.keys(BEASTS_KEYS()));
      for (const k of list) { const r = await pg.evaluate(([k, o]) => BEAST100.render(k, { only: o }), [k, only]);
        save(path.join(SCR, `beast_${k}${only ? '_test' : ''}.png`), r.png); if (!only) save(path.join(HERE, `beast_${k}_sheet.webp`), (await pg.evaluate((k) => BSHEET[k].canvas.toDataURL('image/webp', 0.8), k)));
        delete r.png; if (!only) rep.beasts[k] = r; console.log(k, JSON.stringify(r)); }
      fs.writeFileSync(RP, JSON.stringify(rep, null, 1));
    }
    if (errs.length) console.log('page errors:', errs.slice(0, 8));
  } finally { await browser.close(); srv.kill(); }
})().catch(e => { console.error(e); process.exit(1); });
