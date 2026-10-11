/* look100/beast3_humanoid.js — LOOK TEST round 3: Tholo (cloth cape that swings) + Commodus (lion-pelt hood, segmented armour) on the
   rig92 humanoid (beast3_hum.js over anim_rig.js) → scratch beast3_<k>.png, beast3_<k>_sheet.webp, beast3_hum.json.
   The reference gladiator comes from round 2 (scratch beast2_glad.png + beast2_hum.json "glad"; re-run `beast2_humanoid.js glad` if missing).
   node tools/plans/look100/beast3_humanoid.js [tholo|commodus …] [--only walk0,walk3]   (--only → a test png, no sheet) */
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'), path = require('path');
const HERE = __dirname, ROOT = path.resolve(HERE, '../../..'), PORT = 8814; const SCR = process.env.LOOK_SCRATCH || path.join(require('os').tmpdir(), 'look100');
const save = (f, url) => fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64')); const RP = path.join(HERE, 'beast3_hum.json');
const argv = process.argv.slice(2); const oi = argv.indexOf('--only'); const only = oi >= 0 ? argv[oi + 1].split(',') : null; const keys = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--only');
(async () => { fs.mkdirSync(SCR, { recursive: true }); const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); await new Promise(r => setTimeout(r, 700));
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const out = fs.existsSync(RP) ? JSON.parse(fs.readFileSync(RP)) : {};
  try { const pg = await b.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.goto(`http://127.0.0.1:${PORT}/tools/plans/look100/beast3_hum.html`); await pg.waitForFunction(() => window.LOOK100_R3 || window.__err, null, { timeout: 120000 });
    const e0 = await pg.evaluate(() => window.__err); if (e0) throw new Error(e0);
    await pg.evaluate(() => LOOK100.init(0.005));
    for (const k of (keys.length ? keys : ['tholo', 'commodus'])) { const r = await pg.evaluate(([k, o]) => LOOK100.humanoid3(k, { only: o }), [k, only]);
      save(path.join(SCR, `beast3_${k}${only ? '_test' : ''}.png`), r.png); if (!only) save(path.join(HERE, `beast3_${k}_sheet.webp`), r.webp);
      delete r.png; delete r.webp; if (!only) { out[k] = r; fs.writeFileSync(RP, JSON.stringify(out, null, 1)); } console.log(k, JSON.stringify(r).slice(0, 220)); }
    if (errs.length) console.log('errs', errs.slice(0, 5));
  } finally { await b.close(); srv.kill(); } })().catch(e => { console.error(e); process.exit(1); });
