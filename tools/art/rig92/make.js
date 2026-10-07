/* rig92/make.js — render every preset headless: out/<preset>_sheet.png (+ .json meta), out/<preset>_hero.png, out/compare.png
   Run from anywhere:  node tools/art/rig92/make.js [preset …] [--res 0.004] [--port 8792]
   Needs Playwright + Chromium (preinstalled; PLAYWRIGHT_BROWSERS_PATH) and python3 for the static server. */
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');

const HERE = __dirname, ROOT = path.resolve(HERE, '../../..'), OUT = path.join(HERE, 'out');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const PORT = +opt('port', 8792), RES = opt('res', '0.004');
const only = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
const save = (f, dataURL) => fs.writeFileSync(path.join(OUT, f), Buffer.from(dataURL.split(',')[1], 'base64'));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 700));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const pg = await browser.newPage({ viewport: { width: 900, height: 700 } });
    const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    const t0 = Date.now();
    await pg.goto(`http://127.0.0.1:${PORT}/tools/art/rig92/rig.html?headless=1&res=${RES}`);
    await pg.waitForFunction(() => window.RIG_READY || window.__err, null, { timeout: 180000 }).catch(e => { throw new Error('page not ready: ' + errs.join(' | ')); });
    const stats = await pg.evaluate(() => window.BODY_STATS);
    console.log(`body built: ${stats.verts} verts, ${stats.tris} tris, grid ${stats.grid.join('×')}, ${Math.round(stats.ms.total)} ms in page (${Date.now() - t0} ms with load)`);
    console.log('  field/mesh/weights/rest ms:', ['field', 'mesh', 'weights', 'rest'].map(k => Math.round(stats.ms[k])).join(' / '));
    const order = await pg.evaluate(() => window.PRESET_ORDER);
    const meta = {};
    for (const k of order) {
      if (only.length && !only.includes(k)) continue;
      const r = await pg.evaluate((k) => { const p = PRESETS[k].pose; const s = renderSheet(p); const h = renderHero(p, { bg: ['#e9e1cf', '#cdbf9f'] }); return { s, h, bytes: poseBytes(p), feet: footCheck(p) }; }, k);
      save(`${k}_sheet.png`, r.s.png); save(`${k}_hero.png`, r.h.png);
      meta[k] = { cell: r.s.meta, poseBytes: r.bytes, sheetMs: r.s.ms, heroMs: r.h.ms, feet: r.feet };
      console.log(`${k.padEnd(8)} sheet ${r.s.meta.join(',')} in ${r.s.ms} ms · hero ${r.h.ms} ms · pose ${r.bytes} B · feet`, JSON.stringify(r.feet));
    }
    /* avatar beside the 3D body (front view, same height) */
    if (!only.length || only.includes('compare')) {
      const png = await pg.evaluate(async () => {
        const f = renderFront(PRESETS.stand.pose);
        const load = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
        const av = await load('../../../assets/avatar.png'), bd = await load(f.png);
        const c = document.createElement('canvas'); c.width = av.width + bd.width + 30; c.height = av.height + 40; const g = c.getContext('2d');
        g.fillStyle = '#f3efe6'; g.fillRect(0, 0, c.width, c.height);
        g.drawImage(av, 10, 30); g.drawImage(bd, av.width + 20, 30);
        g.fillStyle = '#555'; g.font = '14px sans-serif'; g.fillText('assets/avatar.png', 12, 20); g.fillText('3D body (front, same height)', av.width + 24, 20);
        g.strokeStyle = 'rgba(200,60,60,.35)'; for (const y of [35, 820]) { g.beginPath(); g.moveTo(0, y); g.lineTo(c.width, y); g.stroke(); }
        return c.toDataURL('image/png');
      });
      save('compare.png', png); console.log('compare.png written');
    }
    fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 1));
    if (errs.length) console.log('page errors:', errs.slice(0, 5));
  } finally { await browser.close(); srv.kill(); }
})().catch(e => { console.error(e); process.exit(1); });
