/* look100/beast2_humanoid.js — LOOK TEST round 2: the reference gladiator (×1.15), Tholo (+13%, bulkier, tunic + cape), Commodus
   on the rig92 humanoid (anim_rig.js humanoid2) → scratch beast2_<k>.png, beast2_<k>_sheet.webp, beast2_report.json (glad → rep.glad). */
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'), path = require('path');
const HERE = __dirname, ROOT = path.resolve(HERE, '../../..'), PORT = 8804; const SCR = process.env.LOOK_SCRATCH || path.join(require('os').tmpdir(), 'look100');
const save = (f, url) => fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64')); const RP = path.join(HERE, 'beast2_hum.json');
(async () => { const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); await new Promise(r => setTimeout(r, 700));
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const out = {};
  try { const pg = await b.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message)); await pg.goto(`http://127.0.0.1:${PORT}/tools/plans/look100/anim_rig.html`); await pg.waitForFunction(() => window.LOOK100_READY);
    await pg.evaluate(() => LOOK100.init(0.005));
    for (const k of (process.argv[2] ? process.argv.slice(2) : ['glad', 'tholo', 'commodus'])) { const r = await pg.evaluate((k) => LOOK100.humanoid2(k), k); save(path.join(SCR, `beast2_${k}.png`), r.png); if (k !== 'glad') save(path.join(HERE, `beast2_${k}_sheet.webp`), r.webp);
      delete r.png; delete r.webp; out[k] = r; fs.writeFileSync(RP, JSON.stringify(out, null, 1)); console.log(k, JSON.stringify(r).slice(0, 200)); }
    if (errs.length) console.log('errs', errs.slice(0, 5));
  } finally { await b.close(); srv.kill(); } })().catch(e => { console.error(e); process.exit(1); });
