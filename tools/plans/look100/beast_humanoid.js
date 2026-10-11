/* look100/beast_humanoid.js — LOOK TEST: Tholo + Commodus on the rig92 gladiator body (anim_rig.js humanoid) → scratch beast_<k>.png,
   beast_<k>_sheet.webp, beast_report.json. node tools/plans/look100/beast_humanoid.js */
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'), path = require('path');
const HERE = __dirname, ROOT = path.resolve(HERE, '../../..'), PORT = 8802; const SCR = process.env.LOOK_SCRATCH || path.join(require('os').tmpdir(), 'look100');
const save = (f, url) => fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
(async () => { const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); await new Promise(r => setTimeout(r, 700));
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try { const pg = await b.newPage(); await pg.goto(`http://127.0.0.1:${PORT}/tools/plans/look100/anim_rig.html`); await pg.waitForFunction(() => window.LOOK100_READY);
    const t0 = Date.now(); await pg.evaluate(() => LOOK100.init(0.005)); const build = Date.now() - t0;
    for (const k of ['tholo', 'commodus']) { const r = await pg.evaluate((k) => LOOK100.humanoid(k), k); save(path.join(SCR, `beast_${k}.png`), r.png); save(path.join(HERE, `beast_${k}_sheet.webp`), r.webp);
      delete r.png; delete r.webp; r.bodyBuildMs = build; const RP = path.join(HERE, 'beast_report.json'); const rep = fs.existsSync(RP) ? JSON.parse(fs.readFileSync(RP)) : {}; rep.beasts = rep.beasts || {}; rep.beasts[k] = r; fs.writeFileSync(RP, JSON.stringify(rep, null, 1)); console.log(k, JSON.stringify(r)); }
  } finally { await b.close(); srv.kill(); } })().catch(e => { console.error(e); process.exit(1); });
