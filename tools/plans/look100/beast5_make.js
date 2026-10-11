/* look100/beast5_make.js — LOOK TEST round 5 (beasts). LOOK_SCRATCH=<dir>
   node tools/plans/look100/beast5_make.js render [keys…] [--only a,b]   sheets (drawn size) → scratch beast5_<k>.png, beast5_<k>_sheet.webp, beast5_report.json
   node tools/plans/look100/beast5_make.js diag [keys…]                   idle0 at 6 px/mm + the joints → scratch beast5_<k>_diag.png + joints in the report
   node tools/plans/look100/beast5_make.js comp                           round 4 | round 5, strips, board, close-ups, Tholo's cape clip (beast5_comp.js)
   Round 5 renders only Zora (wing fix): render zora (Tholo + Commodus: beast5_humanoid.js). */
const { chromium } = require('playwright'); const { spawn, execFileSync } = require('child_process'); const fs = require('fs'), path = require('path');
const HERE = __dirname, ROOT = path.resolve(HERE, '../../..'), PORT = 8815;
const SCR = process.env.LOOK_SCRATCH || path.join(require('os').tmpdir(), 'look100'); fs.mkdirSync(SCR, { recursive: true });
const argv = process.argv.slice(2), mode = argv[0]; const oi = argv.indexOf('--only'); const only = oi >= 0 ? argv[oi + 1].split(',') : null;
const keys = argv.slice(1).filter((a, i, A) => !a.startsWith('--') && A[i - 1] !== '--only');
const save = (f, url) => { fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64')); return fs.statSync(f).size; };
const RP = path.join(HERE, 'beast5_report.json'); const ALL = ['leo', 'leaena', 'ursa', 'brutum', 'valencia', 'moechus', 'glykon', 'arenosus', 'zora', 'boar', 'croc', 'spider'];
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); await new Promise(r => setTimeout(r, 700));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const rep = fs.existsSync(RP) ? JSON.parse(fs.readFileSync(RP)) : {}; rep.beasts = rep.beasts || {}; rep.diag = rep.diag || {};
  try {
    const pg = await browser.newPage({ viewport: { width: 1600, height: 1000 } }); const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.goto(`http://127.0.0.1:${PORT}/tools/plans/look100/beast5_rig.html`); await pg.waitForFunction(() => window.BEAST300_READY || window.__err, null, { timeout: 60000 });
    const e0 = await pg.evaluate(() => window.__err); if (e0) throw new Error(e0);
    const list = keys.length ? keys : ALL;
    if (mode === 'render') for (const k of list) { const r = await pg.evaluate(([k, o]) => BEAST300.render(k, { only: o }), [k, only]);
      save(path.join(SCR, `beast5_${k}${only ? '_test' : ''}.png`), r.png);
      if (!only && r.parts && r.parts.length) for (const p of r.parts) { save(path.join(HERE, `beast5_${p.name}_sheet.webp`), p.webp); delete p.webp; }   /* round 4: Leo split → two sheets */
      else if (!only) save(path.join(HERE, `beast5_${k}_sheet.webp`), (await pg.evaluate((k) => BSHEET[k].canvas.toDataURL('image/webp', 0.8), k)));
      delete r.png; delete r.joints; if (!only) { rep.beasts[k] = r; fs.writeFileSync(RP, JSON.stringify(rep, null, 1)); } console.log(k, JSON.stringify(r).slice(0, 260)); }
    if (mode === 'diag') for (const k of list) { if (k === 'spider') continue; const r = await pg.evaluate((k) => BEAST300.render(k, { diag: 1 }), k);
      save(path.join(SCR, `beast5_${k}_diag.png`), r.png); rep.diag[k] = { meta: r.meta, joints: r.joints }; fs.writeFileSync(RP, JSON.stringify(rep, null, 1)); console.log('diag', k, r.joints[0].length, 'joints'); }
    if (mode === 'comp') {
      /* round 5: Zora from this round's scratch png, Tholo + Commodus from this round's two parts (scratch beast5_<part>_part.png, merged back into
         the full layout); the snakes = their committed round-4 sheets; Leo = round 3; the rest = round 2. The round-4 side of the comparison =
         the committed beast4_ sheets (Tholo/Commodus: the two beast4_<part>_sheet.webp parts with beast4_hum.json, merged in the page).
         Reference gladiator = anim_glad_main_sheet.webp (39 rows, drawn x1.15 like the board's gladiators). */
      const b64 = (f) => 'data:image/' + (f.endsWith('.webp') ? 'webp' : 'png') + ';base64,' + fs.readFileSync(f).toString('base64');
      const prev = {};   /* the newest committed sheet of every beast before this round */
      const rep2 = JSON.parse(fs.readFileSync(path.join(HERE, 'beast2_report.json'))); for (const [k, r] of Object.entries(rep2.beasts)) { const f = path.join(HERE, `beast2_${k}_sheet.webp`); if (fs.existsSync(f)) prev[k] = { meta: r.meta, rows: r.rows, png: b64(f), pxmm: r.pxmm || 3.143 }; }
      const rep3 = JSON.parse(fs.readFileSync(path.join(HERE, 'beast3_report.json'))); for (const [k, r] of Object.entries(rep3.beasts)) { const m = k === 'leo' ? r.parts[0] : r; const f = path.join(HERE, `beast3_${k}_sheet.webp`); if (fs.existsSync(f) && m.meta) prev[k] = { meta: m.meta, rows: m.rows, png: b64(f), pxmm: r.pxmm || 3.143 }; }
      const rep4 = JSON.parse(fs.readFileSync(path.join(HERE, 'beast4_report.json'))); for (const k of ['glykon', 'arenosus', 'zora']) { const r = rep4.beasts[k]; prev[k] = { meta: r.meta, rows: r.rows, png: b64(path.join(HERE, `beast4_${k}_sheet.webp`)), pxmm: r.pxmm || 3.143 }; }
      const hum4 = JSON.parse(fs.readFileSync(path.join(HERE, 'beast4_hum.json')));
      for (const k of ['tholo', 'commodus']) prev[k] = { meta: hum4[k].meta, rows: hum4[k].rows, pxmm: 3.143, parts: hum4[k].parts.map(p => ({ meta: p.meta, rows: p.rows, png: b64(path.join(HERE, `beast4_${p.name}_sheet.webp`)) })) };
      const CHANGED = ['zora', 'tholo', 'commodus']; const sheets = {}; for (const [k, v] of Object.entries(prev)) if (v.png) sheets[k] = v;
      { const r = rep.beasts.zora; sheets.zora = { meta: r.meta, rows: r.rows, png: b64(path.join(SCR, 'beast5_zora.png')), pxmm: r.pxmm || 3.143 }; }
      const hum = JSON.parse(fs.readFileSync(path.join(HERE, 'beast5_hum.json'))); const merge = {}; for (const k of ['tholo', 'commodus']) { rep.beasts[k] = hum[k]; sheets[k] = { meta: hum[k].meta, rows: hum[k].rows, pxmm: 3.143 };
        merge[k] = hum[k].parts.map(p => ({ meta: p.meta, rows: p.rows, png: b64(path.join(SCR, `beast5_${p.name}_part.png`)) })); }
      const tags = { zora: 'round 5', tholo: 'round 5', commodus: 'round 5', glykon: 'round 4', arenosus: 'round 4', leo: 'round 3' };
      const GR = []; for (const [n, c] of [['idle', 4], ['walk', 6], ['attack', 5], ['block', 3], ['hit', 3], ['limp', 4], ['cower', 3], ['push', 4], ['topple', 4], ['knock', 3]]) for (let i = 0; i < c; i++) GR.push(n + i);
      const glad = { meta: [124, 143, 62, 111.6, 39], rows: GR, png: b64(path.join(HERE, 'anim_glad_main_sheet.webp')), k: 1.15 };
      const board = JSON.parse(fs.readFileSync(path.join(HERE, 'beast_board.json')));
      const out = await pg.evaluate((a) => B5COMP.run(a), { sheets, merge, glad, board, tags, r2: Object.fromEntries(CHANGED.map(k => [k, prev[k]])), changed: CHANGED });
      for (const f of fs.readdirSync(SCR)) if (/^b5(frame|cape)_/.test(f)) fs.unlinkSync(path.join(SCR, f));
      for (const [n, u] of Object.entries(out.files)) { const tmp = /^b5(frame|cape)_/.test(n); const sz = save(path.join(tmp ? SCR : HERE, n), u); if (!tmp) console.log(n, (sz / 1024).toFixed(1), 'KB'); }
      execFileSync('python3', [path.join(HERE, 'anim_webp.py'), SCR, path.join(HERE, 'beast5_clip_cape.webp'), String(out.cape.ms), 'b5cape_'], { stdio: 'inherit' });
      rep.cape = Object.assign(out.cape, { kb: +(fs.statSync(path.join(HERE, 'beast5_clip_cape.webp')).size / 1024).toFixed(1) });
      rep.placed = out.placed; fs.writeFileSync(RP, JSON.stringify(rep, null, 1)); console.log('cape clip', JSON.stringify(rep.cape));
    }
    if (errs.length) console.log('page errors:', errs.slice(0, 8));
  } finally { await browser.close(); srv.kill(); }
})().catch(e => { console.error(e); process.exit(1); });
