/* look100/beast3_make.js — LOOK TEST round 3 (beasts). LOOK_SCRATCH=<dir>
   node tools/plans/look100/beast3_make.js render [keys…] [--only a,b]   sheets (drawn size) → scratch beast3_<k>.png, beast3_<k>_sheet.webp, beast3_report.json
   node tools/plans/look100/beast3_make.js diag [keys…]                   idle0 at 6 px/mm + the joints → scratch beast3_<k>_diag.png + joints in the report
   node tools/plans/look100/beast3_make.js split                          Tholo + Commodus sheets (from beast3_humanoid.js) → idle+walk / actions WebPs
   node tools/plans/look100/beast3_make.js comp                           rig diagrams, his minis beside ours, strips, board, pounce clip (beast3_comp.js) */
const { chromium } = require('playwright'); const { spawn, execFileSync } = require('child_process'); const fs = require('fs'), path = require('path');
const HERE = __dirname, ROOT = path.resolve(HERE, '../../..'), PORT = 8813;
const SCR = process.env.LOOK_SCRATCH || path.join(require('os').tmpdir(), 'look100'); fs.mkdirSync(SCR, { recursive: true });
const argv = process.argv.slice(2), mode = argv[0]; const oi = argv.indexOf('--only'); const only = oi >= 0 ? argv[oi + 1].split(',') : null;
const keys = argv.slice(1).filter((a, i, A) => !a.startsWith('--') && A[i - 1] !== '--only');
/* his 1a: idle+walk in one sheet, the actions in another, when the actions widen the cells (beast3_split.py decides + writes the WebPs) */
const splitSheet = (png, meta, rows, k) => JSON.parse(execFileSync('python3', ['-I', path.join(HERE, 'beast3_split.py'), png, JSON.stringify(meta), JSON.stringify(rows), path.join(HERE, 'beast3_' + k)]).toString());
const save = (f, url) => { fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64')); return fs.statSync(f).size; };
const RP = path.join(HERE, 'beast3_report.json'); const ALL = ['leo', 'leaena', 'ursa', 'brutum', 'valencia', 'moechus', 'glykon', 'arenosus', 'zora', 'boar', 'croc', 'spider'];
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); await new Promise(r => setTimeout(r, 700));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const rep = fs.existsSync(RP) ? JSON.parse(fs.readFileSync(RP)) : {}; rep.beasts = rep.beasts || {}; rep.diag = rep.diag || {};
  try {
    const pg = await browser.newPage({ viewport: { width: 1600, height: 1000 } }); const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.goto(`http://127.0.0.1:${PORT}/tools/plans/look100/beast3_rig.html`); await pg.waitForFunction(() => window.BEAST300_READY || window.__err, null, { timeout: 60000 });
    const e0 = await pg.evaluate(() => window.__err); if (e0) throw new Error(e0);
    const list = keys.length ? keys : ALL;
    if (mode === 'render') for (const k of list) { const r = await pg.evaluate(([k, o]) => BEAST300.render(k, { only: o }), [k, only]);
      const pf = path.join(SCR, `beast3_${k}${only ? '_test' : ''}.png`); save(pf, r.png);
      if (!only) r.out = splitSheet(pf, r.meta, r.rows, k);
      delete r.png; delete r.joints; if (!only) { rep.beasts[k] = r; fs.writeFileSync(RP, JSON.stringify(rep, null, 1)); } console.log(k, JSON.stringify(r).slice(0, 400)); }
    if (mode === 'split') { const hum = JSON.parse(fs.readFileSync(path.join(HERE, 'beast3_hum.json'))); rep.hum = rep.hum || {};
      for (const k of ['tholo', 'commodus']) if (hum[k]) { const o = splitSheet(path.join(SCR, `beast3_${k}.png`), hum[k].meta, hum[k].rows, k); rep.hum[k] = Object.assign({}, hum[k], { out: o }); console.log(k, JSON.stringify(o).slice(0, 300)); }
      fs.writeFileSync(RP, JSON.stringify(rep, null, 1)); }
    if (mode === 'diag') for (const k of list) { if (k === 'spider') continue; const r = await pg.evaluate((k) => BEAST300.render(k, { diag: 1 }), k);
      save(path.join(SCR, `beast3_${k}_diag.png`), r.png); rep.diag[k] = { meta: r.meta, joints: r.joints }; fs.writeFileSync(RP, JSON.stringify(rep, null, 1)); console.log('diag', k, r.joints[0].length, 'joints'); }
    if (mode === 'comp') {
      const b64 = (f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
      const sheets = {}; for (const [k, r] of Object.entries(rep.beasts)) { const f = path.join(SCR, `beast3_${k}.png`); if (fs.existsSync(f)) sheets[k] = { meta: r.meta, rows: r.rows, png: b64(f), pxmm: r.pxmm || 3.143 }; }
      const diag = {}; for (const [k, d] of Object.entries(rep.diag)) diag[k] = { meta: d.meta, joints: d.joints, png: b64(path.join(SCR, `beast3_${k}_diag.png`)) };
      const hum = JSON.parse(fs.readFileSync(path.join(HERE, 'beast3_hum.json'))); for (const k of ['tholo', 'commodus']) if (hum[k]) { rep.beasts[k] = hum[k]; sheets[k] = { meta: hum[k].meta, rows: hum[k].rows, png: b64(path.join(SCR, `beast3_${k}.png`)), pxmm: 3.143 }; }
      const g = hum.glad; const glad = { meta: g.meta, rows: g.rows, png: b64(path.join(SCR, 'beast3_glad.png')) };
      const board = JSON.parse(fs.readFileSync(path.join(HERE, 'beast_board.json')));
      const out = await pg.evaluate((a) => B3COMP.run(a), { sheets, diag, glad, board, cape: hum.tholo && hum.tholo.cape && hum.tholo.cape.clear });
      for (const f of fs.readdirSync(SCR)) if (/^b3t?frame_/.test(f)) fs.unlinkSync(path.join(SCR, f));
      for (const [n, u] of Object.entries(out.files)) { const sz = save(path.join(/^b3t?frame_/.test(n) ? SCR : HERE, n), u); if (!/^b3t?frame_/.test(n)) console.log(n, (sz / 1024).toFixed(1), 'KB'); }
      execFileSync('python3', [path.join(HERE, 'anim_webp.py'), SCR, path.join(HERE, 'beast3_clip_pounce.webp'), String(out.clip.ms), 'b3frame_'], { stdio: 'inherit' });
      if (fs.readdirSync(SCR).some(f => /^b3tframe_/.test(f))) { execFileSync('python3', [path.join(HERE, 'anim_webp.py'), SCR, path.join(HERE, 'beast3_clip_tholo_walk.webp'), '120', 'b3tframe_'], { stdio: 'inherit' }); rep.tholoClip = { kb: +(fs.statSync(path.join(HERE, 'beast3_clip_tholo_walk.webp')).size / 1024).toFixed(1), frames: 18, ms: 120 }; }
      rep.clip = Object.assign(out.clip, { kb: +(fs.statSync(path.join(HERE, 'beast3_clip_pounce.webp')).size / 1024).toFixed(1) }); rep.placed = out.placed; fs.writeFileSync(RP, JSON.stringify(rep, null, 1)); console.log('clip', JSON.stringify(rep.clip));
    }
    if (errs.length) console.log('page errors:', errs.slice(0, 8));
  } finally { await browser.close(); srv.kill(); }
})().catch(e => { console.error(e); process.exit(1); });
