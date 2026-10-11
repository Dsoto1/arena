/* look100/beast3_humanoid.js — LOOK TEST round 3: the reference gladiator (×1.15), Tholo (cloth cape + leg check), Commodus (pelt hood +
   segmented armour) on the rig92 body (beast3_hum.js) → scratch beast3_<k>.png + beast3_hum.json. Then `beast3_make.js split` writes the WebPs.
   LOOK_SCRATCH=<dir> node tools/plans/look100/beast3_humanoid.js [glad tholo commodus]   (a failed cape check stops the run) */
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'), path = require('path');
const HERE = __dirname, ROOT = path.resolve(HERE, '../../..'), PORT = 8814; const SCR = process.env.LOOK_SCRATCH || path.join(require('os').tmpdir(), 'look100'); fs.mkdirSync(SCR, { recursive: true });
const save = (f, url) => fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64')); const RP = path.join(HERE, 'beast3_hum.json');
(async () => { const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); await new Promise(r => setTimeout(r, 700));
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const out = fs.existsSync(RP) ? JSON.parse(fs.readFileSync(RP)) : {}; let fail = 0;
  try { const pg = await b.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.goto(`http://127.0.0.1:${PORT}/tools/plans/look100/beast3_hum.html`); await pg.waitForFunction(() => window.LOOK300_READY || window.__err, null, { timeout: 120000 });
    const e0 = await pg.evaluate(() => window.__err); if (e0) throw new Error(e0);
    await pg.evaluate(() => LOOK300.init(0.005));
    for (const k of (process.argv[2] ? process.argv.slice(2) : ['glad', 'tholo', 'commodus'])) { const r = await pg.evaluate((k) => LOOK300.humanoid3(k), k); save(path.join(SCR, `beast3_${k}.png`), r.png);
      delete r.png; out[k] = r; fs.writeFileSync(RP, JSON.stringify(out, null, 1)); console.log(k, JSON.stringify(r).slice(0, 400)); }
    if (errs.length) console.log('errs', errs.slice(0, 5));
  } catch (e) { console.error(String(e).slice(0, 600)); fail = 1; } finally { await b.close(); srv.kill(); } process.exit(fail); })();
