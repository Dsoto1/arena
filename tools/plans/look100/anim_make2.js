/* look100/anim_make2.js — LOOK TEST round 2 driver: node tools/plans/look100/anim_make2.js [render] [comp]
   render: timing split, 8 printed-class stand-ins, spectators v2 (bench, shading, keyed cloth, walk rows) → scratch PNGs + json
   comp:   anim_comp2.js → clip v2 (in-tile size, stepped poses + glide), classes line-up, spec compare z1/z2 v2, forum crop. */
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const HERE = __dirname, ROOT = path.resolve(HERE, '../../..'), PORT = 8798;
const SCR = process.env.LOOK_SCRATCH || path.join(require('os').tmpdir(), 'look100'); fs.mkdirSync(SCR, { recursive: true });
const want = process.argv.slice(2); const doR = !want.length || want.includes('render'), doC = !want.length || want.includes('comp');
const save = (f, url) => { fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64')); return fs.statSync(f).size; };
const b64 = (f) => 'data:image/png;base64,' + fs.readFileSync(path.join(SCR, f)).toString('base64');
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 700));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const RP = path.join(HERE, 'anim_report.json'); const rep = JSON.parse(fs.readFileSync(RP)); rep.r2 = rep.r2 || {};
  try {
    const pg = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.goto(`http://127.0.0.1:${PORT}/tools/plans/look100/anim_rig.html`);
    await pg.waitForFunction(() => window.LOOK100_READY || window.__err, null, { timeout: 60000 });
    const e0 = await pg.evaluate(() => window.__err); if (e0) throw new Error(e0);
    if (doR) {
      await pg.evaluate(() => LOOK100.init(0.005));
      rep.r2.timing = await pg.evaluate(() => LOOK100.timing()); console.log('timing', JSON.stringify(rep.r2.timing));
      let t = Date.now(); const cl = await pg.evaluate(() => LOOK100.classes()); const cm = {};
      for (const [k, v] of Object.entries(cl)) { if (k === 'frames') continue; save(path.join(SCR, `cls_${k}.png`), v.png); cm[k] = { meta: v.meta, ms: v.ms }; }
      rep.r2.classes = { frames: cl.frames, metas: cm, ms: Date.now() - t }; console.log('classes', Date.now() - t, 'ms');
      t = Date.now(); const sp = await pg.evaluate(() => LOOK100.spectators2());
      sp.looks.forEach((v, i) => save(path.join(SCR, `spec2_${i}.png`), v.png));
      rep.r2.spec = { metas: sp.looks.map(v => v.meta), msEach: sp.looks.map(v => v.ms), ms: sp.ms, poses: sp.poses }; console.log('spec2', sp.ms, 'ms');
      fs.writeFileSync(RP, JSON.stringify(rep, null, 1));
    }
    if (doC) {
      const d = { main: { meta: JSON.parse(fs.readFileSync(path.join(SCR, 'sheets.json'))).main.meta }, sheets: JSON.parse(fs.readFileSync(path.join(SCR, 'sheets.json'))) };
      const pngs = { main: b64('sheet_main.png'), ret: b64('sheet_ret.png') }; const cls = {}; for (const k of Object.keys(rep.r2.classes.metas)) cls[k] = b64(`cls_${k}.png`);
      const spec = rep.r2.spec.metas.map((m, i) => b64(`spec2_${i}.png`));
      const board = JSON.parse(fs.readFileSync(path.join(HERE, 'anim_board.json'))); const forum = JSON.parse(fs.readFileSync(path.join(HERE, 'spec_forum.json')));
      const out = await pg.evaluate((a) => COMP2.run(a), { sheets: d.sheets, pngs, cls, clsInfo: rep.r2.classes, spec, specInfo: rep.r2.spec, board, forum });
      for (const f of fs.readdirSync(SCR)) if (/^frame2_/.test(f)) fs.unlinkSync(path.join(SCR, f));
      for (const [name, url] of Object.entries(out.files)) { const sz = save(path.join(/^frame2_/.test(name) ? SCR : HERE, name), url); if (!/^frame2_/.test(name)) console.log(name, (sz / 1024).toFixed(1), 'KB'); }
      execFileSync('python3', [path.join(HERE, 'anim_webp.py'), SCR, path.join(HERE, 'anim_clip2_walk_attack.webp'), String(out.clip.ms), 'frame2_clip_'], { stdio: 'inherit' });
      rep.r2.clip = { ...out.clip, kb: +(fs.statSync(path.join(HERE, 'anim_clip2_walk_attack.webp')).size / 1024).toFixed(1) }; rep.r2.crowd = out.crowd; rep.r2.forum = out.forum;
      fs.writeFileSync(RP, JSON.stringify(rep, null, 1)); console.log('clip2', JSON.stringify(rep.r2.clip));
    }
    if (errs.length) console.log('page errors:', errs.slice(0, 8));
  } finally { await browser.close(); srv.kill(); }
})().catch(e => { console.error(e); process.exit(1); });
