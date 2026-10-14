/* tools/art/anim100/preview.js — a quick look at some rows of the pose list (no sheet, no meta written):
     node tools/art/anim100/preview.js <cls> <out.png> row[,row…] [pxmm]
   Renders those rows of the ANIM100_LIB pose list (src/board/311-v100anim.js) for one printed class (gear from out/parts.json, written by make.js)
   and saves the packed canvas (8 facings a row) as a PNG. */
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const HERE = __dirname, ROOT = path.resolve(HERE, '../../..'), PORT = 20000 + Math.floor(Math.random() * 20000);
const [cls, out, rowsArg, pxArg] = process.argv.slice(2);
const parts = JSON.parse(fs.readFileSync(path.join(HERE, 'out/parts.json')));
const LOOK = { skin: '#c99a72', hair: '#2a1d14', hs: 'crop', bs: 'stubble' };
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); await new Promise(r => setTimeout(r, 700));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try { const pg = await browser.newPage(); await pg.goto(`http://127.0.0.1:${PORT}/tools/art/anim100/anim100.html`);
    await pg.waitForFunction(() => window.AN100R_READY || window.__err, null, { timeout: 120000 }); await pg.evaluate(() => AN100R.init());
    const t0 = Date.now();
    const url = await pg.evaluate(async ([look, gear, rows, px]) => { const api = AN100R.api; api.apply({ look, gear, pose: api.presets[0][2] });
      const set = rows.every(r => AN100L.SETS.move.includes(r)) ? 'move' : 'act';
      const r = await AN100L.render(api, set, { pxmm: px, ss: 2, rows }); return { url: r.canvas.toDataURL('image/png'), meta: r.meta }; },
      [Object.assign({}, LOOK, { cloth: parts[cls].cloth }), parts[cls].gear, rowsArg.split(','), +(pxArg || 2.6)]);
    fs.writeFileSync(out, Buffer.from(url.url.split(',')[1], 'base64')); fs.writeFileSync(out.replace(/\.png$/, '.json'), JSON.stringify(url.meta)); console.log('wrote', out, Math.round((Date.now() - t0) / 1000) + ' s');
  } finally { await browser.close(); srv.kill(); }
})().catch(e => { console.error(e); process.exit(1); });
