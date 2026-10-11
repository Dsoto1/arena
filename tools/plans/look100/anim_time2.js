/* look100/anim_time2.js — LOOK TEST: per-cell time split (raster forced to finish / full readback / 2D crop) → anim_report.json r2.timing2 */
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'), path = require('path');
const HERE = __dirname, ROOT = path.resolve(HERE, '../../..'), PORT = 8799;
(async () => { const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); await new Promise(r => setTimeout(r, 700));
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try { const pg = await b.newPage(); await pg.goto(`http://127.0.0.1:${PORT}/tools/plans/look100/anim_rig.html`); await pg.waitForFunction(() => window.LOOK100_READY);
    await pg.evaluate(() => LOOK100.init(0.005)); await pg.evaluate(() => LOOK100.timing());
    const t = await pg.evaluate(() => LOOK100.timing2(16)); console.log(JSON.stringify(t));
    const RP = path.join(HERE, 'anim_report.json'); const rep = JSON.parse(fs.readFileSync(RP)); rep.r2.timing2 = t; fs.writeFileSync(RP, JSON.stringify(rep, null, 1));
  } finally { await b.close(); srv.kill(); } })().catch(e => { console.error(e); process.exit(1); });
