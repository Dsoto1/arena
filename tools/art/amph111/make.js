/* =====================================================================
   tools/art/amph111/make.js — THE AMPHITHEATRE BAKE (v1.11 art; tools/plans/v111/AMPH.md). Renders the procedural surround
   (scene.js + props.js, the game's own three93.js r169) in headless Chromium + SwiftShader WebGL, at EXACTLY the game's projection:
   2:1 isometric, an orthographic camera 30° down, 45° round, the board's grid = world X/Z (1 unit = 1 tile), so tile corner (0,0) =
   the game's (OX, OY) and one tile = TW. Rendered at 2× (cfg ss) with no MSAA, then box-filtered down → every layer's alpha is its exact
   coverage, so the layers ADD back together ('lighter') without seams.
     node tools/art/amph111/make.js [--out DIR] [--tw 112] [--pass N] [--overview 1.6] [--assets]
   Writes DIR/<layer>.png (stone, bench, cloth — luminance, tinted per arena in the game — fixed, fire, glow (night, opaque black)) and
   DIR/meta.json (TW0, the frame in TW: xl xr yt yb, sizes). --assets also encodes assets/amph111_<layer>.webp + assets/amph111.json.
   The frame (in TW, around the game's OX/OY): xl = xr = 11.5, yt = 3.6, yb = 8.9 — the canvas never shows more (07-ui draw: OY = 2.7 TW,
   the canvas ends ≤ 8.6 TW below OY; on very wide canvases the game fills past ±11.5 TW with its own dark edge).
   ===================================================================== */
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const HERE = __dirname, ROOT = path.resolve(HERE, '../../..');
const A = process.argv.slice(2), opt = (k, d) => { const i = A.indexOf('--' + k); return i >= 0 ? A[i + 1] : d; };
const OUT = path.resolve(opt('out', path.join(HERE, 'out'))); fs.mkdirSync(OUT, { recursive: true });
const TW0 = +opt('tw', 112), SS = +opt('ss', 2), OVER = +opt('overview', 0);
const FR = { xl: 11.5, xr: 11.5, yt: 3.6, yb: 8.9 };
const LAYERS = (opt('layers', 'stone,bench,cloth,fixed,fire,glow,all')).split(',');
const LOOK = JSON.parse(opt('look', '{}'));
const PORT = 20000 + Math.floor(Math.random() * 20000);
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const pg = await browser.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.goto(`http://127.0.0.1:${PORT}/tools/art/amph111/amph111.html`); await pg.waitForFunction(() => window.AMPH111, null, { timeout: 60000 });
    const t0 = Date.now(); const res = {};
    for (const night of [false, true]) {
      const ls = LAYERS.filter(l => (l === 'glow') === night); if (!ls.length) continue;
      const r = await pg.evaluate(cfg => window.AMPH111.render(cfg).then(r => ({ out: r.out, W: r.W, H: r.H, meta: r.meta, tris: r.tris })),
        Object.assign({ tw0: TW0, ss: SS, layers: ls, night, look: LOOK, overview: OVER || 0, inkA: +opt('ink', 0.55), post: +opt('post', 0) }, FR));
      for (const k of Object.keys(r.out)) { fs.writeFileSync(path.join(OUT, k + '_ss.png'), Buffer.from(r.out[k].split(',')[1], 'base64')); }
      Object.assign(res, { W: r.W, H: r.H, meta: r.meta, tris: r.tris });
    }
    if (errs.length) console.log('PAGE ERRS', errs.slice(0, 5));
    /* box-filter down by SS (exact coverage alpha), premultiplied so colour never bleeds from transparent pixels */
    const ls = LAYERS.join(',');
    execFileSync('python3', ['-I', path.join(HERE, 'down.py'), OUT, String(SS), ls], { stdio: 'inherit' });
    const meta = Object.assign({ tw0: TW0, ss: SS, w: Math.round(res.W / SS), h: Math.round(res.H / SS), ms: Date.now() - t0, tris: res.tris, fires: res.meta.fires }, FR);
    fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 1));
    console.log('rendered', JSON.stringify({ w: meta.w, h: meta.h, ms: meta.ms, tris: meta.tris }));
    if (A.includes('--assets')) execFileSync('python3', ['-I', path.join(HERE, 'enc.py'), OUT, path.join(ROOT, 'assets')], { stdio: 'inherit' });
  } finally { await browser.close(); srv.kill(); }
})().catch(e => { console.error(e); process.exit(2); });
