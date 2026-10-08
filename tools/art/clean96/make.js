/* clean96/make.js — renders the arena crew sheets for src/238-v96clean.js:
     node tools/art/clean96/make.js [slave charun guard] [--pxmm 2.6] [--q 0.8] [--res 0.005] [--port 8796]
   → assets/crew96_<fig>.webp (one row per pose, 8 MINI_YAW cells) + tools/art/clean96/out/<fig>.png (lossless preview, not committed)
   + tools/art/clean96/out/meta.json (paste the metas into CREW96_META in src/238-v96clean.js). Needs Playwright + python3. */
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const HERE = __dirname, ROOT = path.resolve(HERE, '../../..'), OUT = path.join(HERE, 'out');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const only = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
const PORT = +opt('port', 8796);
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 700));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const pg = await browser.newPage();
    const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.goto(`http://127.0.0.1:${PORT}/tools/art/clean96/crew.html`);
    await pg.waitForFunction(() => window.CREW96_READY || window.__err, null, { timeout: 60000 });
    const e0 = await pg.evaluate(() => window.__err); if (e0) throw new Error(e0);
    const st = await pg.evaluate((res) => CREW96.init(+res), opt('res', '0.005'));
    console.log('body', st.verts, 'verts');
    let meta = {}; try { meta = JSON.parse(fs.readFileSync(path.join(OUT, 'meta.json'), 'utf8')); } catch (e) { /* first run */ }
    const figs = only.length ? only : await pg.evaluate(() => CREW96.FIGS);
    for (const f of figs) {
      const r = await pg.evaluate(([f, o]) => CREW96.renderFig(f, o), [f, { pxmm: +opt('pxmm', 2.6), q: +opt('q', 0.8), png: true, ss: 4 }]);
      fs.writeFileSync(path.join(ROOT, 'assets', `crew96_${f}.webp`), Buffer.from(r.url.split(',')[1], 'base64'));
      fs.writeFileSync(path.join(OUT, `${f}.png`), Buffer.from(r.png.split(',')[1], 'base64'));
      meta[f] = { meta: r.meta, rows: r.rows, bytes: r.bytes };
      console.log(f.padEnd(7), JSON.stringify(r.meta), r.rows.join(','), r.bytes, 'B', r.ms, 'ms');
    }
    fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 1));
    if (errs.length) console.log('page errors:', errs.slice(0, 5));
  } finally { await browser.close(); srv.kill(); }
})().catch(e => { console.error(e); process.exit(1); });
