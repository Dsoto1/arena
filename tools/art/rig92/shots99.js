/* rig92/shots99.js — body silhouette check: node tools/art/rig92/shots99.js <tag> [--res 0.004]
   writes tools/plans/body99/<tag>_{front,right,three,left}.png (torso close-ups) + <tag>_strip.png (all views, full body) */
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const HERE = __dirname, ROOT = path.resolve(HERE, '../../..'), OUT = path.join(ROOT, 'tools/plans/body99');
const argv = process.argv.slice(2);
const tag = argv[0] || 'shot';
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const PORT = +opt('port', 8793), RES = opt('res', '0.004');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 700));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const pg = await browser.newPage({ viewport: { width: 900, height: 700 } });
    const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(`http://127.0.0.1:${PORT}/tools/art/rig92/rig.html?headless=1&res=${RES}`);
    await pg.waitForFunction(() => window.RIG_READY || window.__err, null, { timeout: 180000 });
    const views = [['front', 0], ['right', -90], ['three', -40], ['left', 90]];
    const res = await pg.evaluate(async (views) => {
      const load = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
      const out = {}; const imgs = [];
      for (const [k, yaw] of views) {
        const f = renderFront(PRESETS.stand.pose, { w: 700, h: 1100, soleY: 1090, crownPx: 1070, yaw, ss: 2 });
        const im = await load(f.png); imgs.push(im);
        const ppm = 1070 / 1.855;
        const y0 = Math.round(1090 - 1.62 * ppm), y1 = Math.round(1090 - 0.92 * ppm);
        const c = document.createElement('canvas'); c.width = 700; c.height = y1 - y0; const g = c.getContext('2d');
        g.fillStyle = '#e9e1cf'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, y0, 700, y1 - y0, 0, 0, 700, y1 - y0);
        out[k] = c.toDataURL('image/png');
      }
      const s = document.createElement('canvas'); s.width = 700 * views.length / 2; s.height = 550; const g = s.getContext('2d');
      g.fillStyle = '#e9e1cf'; g.fillRect(0, 0, s.width, s.height);
      imgs.forEach((im, i) => g.drawImage(im, 0, 0, 700, 1100, i * 350, 0, 350, 550));
      out.strip = s.toDataURL('image/png'); return out;
    }, views);
    for (const k of Object.keys(res)) fs.writeFileSync(path.join(OUT, `${tag}_${k}.png`), Buffer.from(res[k].split(',')[1], 'base64'));
    console.log('wrote', Object.keys(res).map(k => `${tag}_${k}.png`).join(' '), errs.length ? 'ERRS ' + errs.slice(0, 3).join('|') : '');
  } finally { await browser.close(); srv.kill(); }
})().catch(e => { console.error(e); process.exit(1); });
