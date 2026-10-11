/* look100/r9_compare.js — v1.0 integration check: the SHIPPED pre-baked gear (assets/gear100.js, simplified) beside the FULL-DETAIL bake
   (node tools/art/rig92/mkgear.js --full --out /tmp/claude-0/g100full.js) on the real game bundle — 512 px hero + the board sheet,
   for the max load and the 8 class kits. → tools/plans/look100/r9_compare.png (+ r9_compare.json timings).
   node tools/plans/look100/r9_compare.js [full.js] */
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../../..'), FULL = process.argv[2] || '/tmp/claude-0/g100full.js';
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const pg = await b.newPage({ viewport: { width: 1200, height: 900 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  await pg.setContent('<!doctype html><body style="background:#e9e1cf"></body>');
  for (const f of ['assets/three93.js', 'assets/tok93.js', 'assets/gear100.js']) await pg.addScriptTag({ path: path.join(ROOT, f) });
  const ship = await pg.evaluate(() => { const d = window.GEAR100; window.G_SHIP = d; delete window.GEAR100; return d.b64.length; });
  await pg.addScriptTag({ path: FULL }); await pg.evaluate(() => { window.G_FULL = window.GEAR100; delete window.GEAR100; });
  const R = await pg.evaluate(async () => {
    const LIB = window.TOK93LIB(window.THREE93); const out = { t: {} };
    const KITS = [['max load', { head: { t: 'murmillo' }, chest: { t: 'thorax' }, belt: { t: 'balteus' }, arm: { R: { upper: { t: 'galerus' }, lower: { t: 'bracers' } }, L: { upper: { t: 'manica' }, wraps: 1 } }, leg: { L: { upper: { t: 'thighplate' }, lower: { t: 'cnemis' } }, R: { upper: { t: 'thighplate' }, lower: { t: 'ocrea' } } }, wR: { t: 'sword', k: 'gladius' }, wL: { t: 'scutum', k: 'scutum' } }, '#7a1c14'],
      ['soldier', { head: { t: 'centurion' }, belt: { t: 'balteus' }, arm: { R: { wraps: 1 }, L: { wraps: 1 } }, leg: { L: { upper: { t: 'legwrapsU' } }, R: { upper: { t: 'legwrapsU' } } }, wR: { t: 'sword', k: 'gladius' } }, '#7a1c14'],
      ['royalty', { head: { t: 'cassis' }, chest: { t: 'ornate' }, arm: { R: { wraps: 1 }, L: { wraps: 1 } }, wR: { t: 'dagger', k: 'pugio' } }, '#2c3550'],
      ['hero', { head: { t: 'thrachelm' }, arm: { L: { upper: { t: 'provmanica' }, wraps: 1 }, R: { wraps: 1 } }, leg: { L: { lower: { t: 'legwraps' } }, R: { lower: { t: 'legwraps' } } }, wR: { t: 'sica', k: 'sica' }, wL: { t: 'parma', k: 'thracian' } }, '#5c6a2a'],
      ['veteranus', { head: { t: 'flavhelm' }, chest: { t: 'musculata' }, arm: { R: { wraps: 1 }, L: { wraps: 1 } }, leg: { L: { lower: { t: 'legwraps' } }, R: { lower: { t: 'legwraps' } } }, wR: { t: 'club', k: 'rudis' } }, '#b1a391'],
      ['venatore', { head: { t: 'steelhelm' }, belt: { t: 'balteus1' }, arm: { R: { wraps: 1 }, L: { wraps: 1 } }, leg: { L: { lower: { t: 'legwraps' } }, R: { lower: { t: 'legwraps' } } }, wR: { t: 'spear', k: 'hasta' } }, '#5a3466']];
    const imgs = [];
    for (const [nm, G] of [['shipped', window.G_SHIP], ['full', window.G_FULL]]) {
      const t0 = performance.now(); const api = await LIB.createToken({ gear8: G }); out.t[nm] = { build: Math.round(performance.now() - t0), baked: api.baked, why: api.bakeWhy };
      for (const [k, g, cloth] of KITS) {
        const t1 = performance.now(); api.apply({ look: { hs: 'crop', skin: '#ad7a5c', cloth }, gear: g, pose: api.standFor(g) }); const wear = Math.round(performance.now() - t1);
        const hero = api.hero({ w: 360, h: 360, span: 2.55, cy: 0.98, el: 20, yaw: 24 }); const s = api.sheet();
        imgs.push({ nm, k, wear, hero: hero.toDataURL('image/png'), sheet: s.canvas.toDataURL('image/png'), meta: s.meta, ms: s.ms, sc: k === 'max load' || k === 'hero' ? api.shieldCheck() : null });
      }
      api.dispose();
    }
    const L = (u) => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = u; });
    const W = 360 + 8 * 0 + 40, rows = imgs.length / 2; const c = document.createElement('canvas'); c.width = 20 + 2 * (360 + 760) + 40; c.height = 60 + rows * 380; const g = c.getContext('2d'); g.fillStyle = '#e9e1cf'; g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = '#3a2c20'; g.font = '600 18px Georgia'; g.fillText('v1.0 · SHIPPED pre-baked gear (left, assets/gear100.js) vs FULL-DETAIL sculpts (right) — 360 px hero + the board sheet at 1:1', 20, 30);
    for (let r = 0; r < rows; r++) for (let side = 0; side < 2; side++) { const it = imgs[side * rows + r]; const x = 20 + side * (360 + 760 + 20), y = 50 + r * 380;
      g.drawImage(await L(it.hero), x, y); const sh = await L(it.sheet); g.drawImage(sh, x + 370, y + 40); g.imageSmoothingEnabled = false; g.drawImage(sh, 0, 0, it.meta[0] * 3, it.meta[1], x + 370, y + 190, it.meta[0] * 6, it.meta[1] * 2); g.imageSmoothingEnabled = true;
      g.fillStyle = '#3a2c20'; g.font = '13px Georgia'; g.fillText(`${it.nm} · ${it.k} · wear ${it.wear} ms · sheet ${it.ms} ms${it.sc ? ' · shield ' + (it.sc.ok ? '✓' : '✗') + ' face≤' + it.sc.angMax + '° edge≤' + it.sc.alongMax + '° front ' + it.sc.frontMax : ''}`, x, y + 375); }
    out.png = c.toDataURL('image/png'); out.rows = imgs.map(i => ({ nm: i.nm, k: i.k, wear: i.wear, ms: i.ms, meta: i.meta, sc: i.sc && { ok: i.sc.ok, ang: i.sc.angMax, along: i.sc.alongMax, front: i.sc.frontMax } })); return out;
  });
  fs.writeFileSync(path.join(__dirname, 'r9_compare.png'), Buffer.from(R.png.split(',')[1], 'base64')); delete R.png; R.shipB64 = ship; R.errs = errs.slice(0, 8);
  fs.writeFileSync(path.join(__dirname, 'r9_compare.json'), JSON.stringify(R, null, 1)); console.log(JSON.stringify(R).slice(0, 2500)); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
