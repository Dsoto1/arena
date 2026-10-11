/* look100/beast4_make.js — LOOK TEST round 4 (beasts). LOOK_SCRATCH=<dir>
   node tools/plans/look100/beast4_make.js render [keys…] [--only a,b]   sheets (drawn size) → scratch beast4_<k>.png, beast4_<k>_sheet.webp, beast4_report.json
   node tools/plans/look100/beast4_make.js diag [keys…]                   idle0 at 6 px/mm + the joints → scratch beast4_<k>_diag.png + joints in the report
   node tools/plans/look100/beast4_make.js comp                           round 3 | round 4, strips, board, close-ups, Tholo's cape clip (beast4_comp.js)
   Round 4 renders only the changed quadruped-rig beasts: render zora glykon arenosus (Tholo + Commodus: beast4_humanoid.js). */
const { chromium } = require('playwright'); const { spawn, execFileSync } = require('child_process'); const fs = require('fs'), path = require('path');
const HERE = __dirname, ROOT = path.resolve(HERE, '../../..'), PORT = 8813;
const SCR = process.env.LOOK_SCRATCH || path.join(require('os').tmpdir(), 'look100'); fs.mkdirSync(SCR, { recursive: true });
const argv = process.argv.slice(2), mode = argv[0]; const oi = argv.indexOf('--only'); const only = oi >= 0 ? argv[oi + 1].split(',') : null;
const keys = argv.slice(1).filter((a, i, A) => !a.startsWith('--') && A[i - 1] !== '--only');
const save = (f, url) => { fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64')); return fs.statSync(f).size; };
const RP = path.join(HERE, 'beast4_report.json'); const ALL = ['leo', 'leaena', 'ursa', 'brutum', 'valencia', 'moechus', 'glykon', 'arenosus', 'zora', 'boar', 'croc', 'spider'];
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); await new Promise(r => setTimeout(r, 700));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const rep = fs.existsSync(RP) ? JSON.parse(fs.readFileSync(RP)) : {}; rep.beasts = rep.beasts || {}; rep.diag = rep.diag || {};
  try {
    const pg = await browser.newPage({ viewport: { width: 1600, height: 1000 } }); const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.goto(`http://127.0.0.1:${PORT}/tools/plans/look100/beast4_rig.html`); await pg.waitForFunction(() => window.BEAST300_READY || window.__err, null, { timeout: 60000 });
    const e0 = await pg.evaluate(() => window.__err); if (e0) throw new Error(e0);
    const list = keys.length ? keys : ALL;
    if (mode === 'render') for (const k of list) { const r = await pg.evaluate(([k, o]) => BEAST300.render(k, { only: o }), [k, only]);
      save(path.join(SCR, `beast4_${k}${only ? '_test' : ''}.png`), r.png);
      if (!only && r.parts && r.parts.length) for (const p of r.parts) { save(path.join(HERE, `beast4_${p.name}_sheet.webp`), p.webp); delete p.webp; }   /* round 4: Leo split → two sheets */
      else if (!only) save(path.join(HERE, `beast4_${k}_sheet.webp`), (await pg.evaluate((k) => BSHEET[k].canvas.toDataURL('image/webp', 0.8), k)));
      delete r.png; delete r.joints; if (!only) { rep.beasts[k] = r; fs.writeFileSync(RP, JSON.stringify(rep, null, 1)); } console.log(k, JSON.stringify(r).slice(0, 260)); }
    if (mode === 'diag') for (const k of list) { if (k === 'spider') continue; const r = await pg.evaluate((k) => BEAST300.render(k, { diag: 1 }), k);
      save(path.join(SCR, `beast4_${k}_diag.png`), r.png); rep.diag[k] = { meta: r.meta, joints: r.joints }; fs.writeFileSync(RP, JSON.stringify(rep, null, 1)); console.log('diag', k, r.joints[0].length, 'joints'); }
    if (mode === 'comp') {
      /* round 4: the changed beasts from this round's scratch pngs (zora, glykon, arenosus + tholo/commodus full sheets); every other beast and the
         round-3 side of the comparison from the COMMITTED round-3 sheets (beast3_<k>_sheet.webp, same layout as their pngs; Leo = his idle+walk sheet);
         the reference gladiator = anim_glad_main_sheet.webp (39 rows, drawn x1.15 like the board's gladiators) */
      const b64 = (f) => 'data:image/' + (f.endsWith('.webp') ? 'webp' : 'png') + ';base64,' + fs.readFileSync(f).toString('base64');
      const rep3 = JSON.parse(fs.readFileSync(path.join(HERE, 'beast3_report.json'))), hum3 = JSON.parse(fs.readFileSync(path.join(HERE, 'beast3_hum.json')));
      const r3 = {}; for (const [k, r] of Object.entries(rep3.beasts)) { const m = k === 'leo' ? r.parts[0] : r; const f = path.join(HERE, `beast3_${k}_sheet.webp`); if (fs.existsSync(f)) r3[k] = { meta: m.meta, rows: m.rows, png: b64(f), pxmm: r.pxmm || 3.143 }; }
      /* beasts unchanged since round 2 have only their beast2 sheet committed */
      const rep2 = JSON.parse(fs.readFileSync(path.join(HERE, 'beast2_report.json'))); for (const [k, r] of Object.entries(rep2.beasts)) { const f = path.join(HERE, `beast2_${k}_sheet.webp`); if (!r3[k] && fs.existsSync(f)) r3[k] = { meta: r.meta, rows: r.rows, png: b64(f), pxmm: r.pxmm || 3.143 }; }
      for (const k of ['tholo', 'commodus']) r3[k] = { meta: hum3[k].meta, rows: hum3[k].rows, png: b64(path.join(HERE, `beast3_${k}_sheet.webp`)), pxmm: 3.143 };
      const CHANGED = ['glykon', 'arenosus', 'zora', 'tholo', 'commodus']; const sheets = Object.assign({}, r3);
      for (const k of ['glykon', 'arenosus', 'zora']) { const r = rep.beasts[k]; sheets[k] = { meta: r.meta, rows: r.rows, png: b64(path.join(SCR, `beast4_${k}.png`)), pxmm: r.pxmm || 3.143 }; }
      const hum = JSON.parse(fs.readFileSync(path.join(HERE, 'beast4_hum.json'))); const merge = {}; for (const k of ['tholo', 'commodus']) { rep.beasts[k] = hum[k]; sheets[k] = { meta: hum[k].meta, rows: hum[k].rows, pxmm: 3.143 };
        merge[k] = hum[k].parts.map(p => ({ meta: p.meta, rows: p.rows, png: b64(path.join(SCR, `beast4_${p.name}_part.png`)) })); }   /* the full sheet rebuilt from its two parts */
      const GR = []; for (const [n, c] of [['idle', 4], ['walk', 6], ['attack', 5], ['block', 3], ['hit', 3], ['limp', 4], ['cower', 3], ['push', 4], ['topple', 4], ['knock', 3]]) for (let i = 0; i < c; i++) GR.push(n + i);
      const glad = { meta: [124, 143, 62, 111.6, 39], rows: GR, png: b64(path.join(HERE, 'anim_glad_main_sheet.webp')), k: 1.15 };
      const board = JSON.parse(fs.readFileSync(path.join(HERE, 'beast_board.json')));
      const out = await pg.evaluate((a) => B4COMP.run(a), { sheets, merge, glad, board, r2: Object.fromEntries(CHANGED.map(k => [k, r3[k]])), changed: CHANGED });
      for (const f of fs.readdirSync(SCR)) if (/^b4(frame|cape)_/.test(f)) fs.unlinkSync(path.join(SCR, f));
      for (const [n, u] of Object.entries(out.files)) { const tmp = /^b4(frame|cape)_/.test(n); const sz = save(path.join(tmp ? SCR : HERE, n), u); if (!tmp) console.log(n, (sz / 1024).toFixed(1), 'KB'); }
      execFileSync('python3', [path.join(HERE, 'anim_webp.py'), SCR, path.join(HERE, 'beast4_clip_cape.webp'), String(out.cape.ms), 'b4cape_'], { stdio: 'inherit' });
      rep.cape = Object.assign(out.cape, { kb: +(fs.statSync(path.join(HERE, 'beast4_clip_cape.webp')).size / 1024).toFixed(1) });
      rep.placed = out.placed; fs.writeFileSync(RP, JSON.stringify(rep, null, 1)); console.log('cape clip', JSON.stringify(rep.cape));
    }
    if (errs.length) console.log('page errors:', errs.slice(0, 8));
  } finally { await browser.close(); srv.kill(); }
})().catch(e => { console.error(e); process.exit(1); });
