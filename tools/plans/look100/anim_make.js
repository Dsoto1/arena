/* look100/anim_make.js — LOOK TEST driver: node tools/plans/look100/anim_make.js [render] [comp]
   render: rig92 sheets → anim_*_sheet.webp/png + scratch frames; comp: strips, clip frames, effects, spectators (anim_comp.js). */
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const HERE = __dirname, ROOT = path.resolve(HERE, '../../..'), PORT = 8797;
const SCR = process.env.LOOK_SCRATCH || path.join(require('os').tmpdir(), 'look100'); fs.mkdirSync(SCR, { recursive: true });
const want = process.argv.slice(2); const doR = !want.length || want.includes('render'), doC = !want.length || want.includes('comp');
const save = (f, url) => { fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64')); return fs.statSync(f).size; };
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 700));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const rep = fs.existsSync(path.join(HERE, 'anim_report.json')) ? JSON.parse(fs.readFileSync(path.join(HERE, 'anim_report.json'))) : {};
  try {
    const pg = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.goto(`http://127.0.0.1:${PORT}/tools/plans/look100/anim_rig.html`);
    await pg.waitForFunction(() => window.LOOK100_READY || window.__err, null, { timeout: 60000 });
    const e0 = await pg.evaluate(() => window.__err); if (e0) throw new Error(e0);
    if (doR) { const t0 = Date.now(); const st = await pg.evaluate(() => LOOK100.init(0.005)); rep.bodyBuildMs = Date.now() - t0; console.log('body', st.verts, rep.bodyBuildMs, 'ms'); }
    if (doR) {
      const g = await pg.evaluate(() => LOOK100.gladiator());
      rep.glad = {};
      for (const k of ['main', 'fall']) {
        save(path.join(HERE, `anim_glad_${k}_sheet.webp`), g[k].webp); save(path.join(SCR, `glad_${k}.png`), g[k].png);
        rep.glad[k] = { meta: g[k].meta, frames: g[k].rows.length, cells: g[k].rows.length * 8, ms: g[k].ms, msPerFrame8: g[k].msPerFrame, kb8: +(g[k].bytes8 / 1024).toFixed(1), kb8q65: +(g[k].bytes8q65 / 1024).toFixed(1), kb4: +(g[k].bytes4 / 1024).toFixed(1) };
        console.log('glad', k, JSON.stringify(rep.glad[k]));
      }
      rep.labels = g.labels;
      const r = await pg.evaluate(() => LOOK100.retiarius()); save(path.join(HERE, 'anim_ret_sheet.webp'), r.webp); rep.ret = { meta: r.meta, ms: r.ms, kb8: +(r.bytes8 / 1024).toFixed(1), rows: r.rows }; console.log('ret', JSON.stringify(rep.ret));
      const s = await pg.evaluate(() => LOOK100.spider()); save(path.join(HERE, 'anim_spider_sheet.webp'), s.webp); save(path.join(SCR, 'spider.png'), s.png); rep.spider = { meta: s.meta, ms: s.ms, kb8: +(s.bytes8 / 1024).toFixed(1) }; console.log('spider', JSON.stringify(rep.spider));
      const c = await pg.evaluate(() => LOOK100.spectators()); c.png.forEach((u, i) => save(path.join(SCR, `spec_${i}.png`), u)); rep.spec = { metas: c.metas, ms: c.ms, kbOneLook: +(c.bytesOneLook / 1024).toFixed(1), looks: c.looks, poses: c.poses }; console.log('spec', JSON.stringify(rep.spec));
    }
    if (doR) {   /* keep the rendered sheets so a comp-only run needs no 3D */
      const dump = await pg.evaluate(() => { const o = {}; for (const k of ['main', 'fall', 'ret', 'spider']) o[k] = { meta: SHEETS[k].meta, rows: SHEETS[k].rows || [0, 1, 2, 3], png: SHEETS[k].canvas.toDataURL('image/png') };
        o.spec = SHEETS.spec.map(S => ({ meta: S.meta, png: S.canvas.toDataURL('image/png') })); return o; });
      for (const k of ['main', 'fall', 'ret', 'spider']) { save(path.join(SCR, `sheet_${k}.png`), dump[k].png); delete dump[k].png; }
      dump.spec.forEach((S, i) => { save(path.join(SCR, `sheet_spec${i}.png`), S.png); delete S.png; });
      fs.writeFileSync(path.join(SCR, 'sheets.json'), JSON.stringify(dump));
    }
    if (doC) {
      if (!doR) { const d = JSON.parse(fs.readFileSync(path.join(SCR, 'sheets.json'))); const b64 = (f) => 'data:image/png;base64,' + fs.readFileSync(path.join(SCR, f)).toString('base64');
        for (const k of ['main', 'fall', 'ret', 'spider']) d[k].png = b64(`sheet_${k}.png`); d.spec.forEach((S, i) => { S.png = b64(`sheet_spec${i}.png`); });
        await pg.evaluate(async (d) => { const ld = (u) => new Promise(ok => { const i = new Image(); i.onload = () => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; c.getContext('2d').drawImage(i, 0, 0); ok(c); }; i.src = u; });
          window.SHEETS = {}; for (const k of ['main', 'fall', 'ret', 'spider']) SHEETS[k] = { meta: d[k].meta, rows: d[k].rows, canvas: await ld(d[k].png) };
          SHEETS.spec = []; for (const S of d.spec) SHEETS.spec.push({ meta: S.meta, canvas: await ld(S.png) }); }, d); }
      const board = JSON.parse(fs.readFileSync(path.join(HERE, 'anim_board.json')));
      const out = await pg.evaluate((b) => COMP100.run(b), board);
      for (const [name, url] of Object.entries(out.files)) { const sz = save(path.join(/^frame_/.test(name) ? SCR : HERE, name), url); if (!/^frame_/.test(name)) console.log(name, (sz / 1024).toFixed(1), 'KB'); }
      rep.clip = out.clip;
      /* the looping clip: frames → animated WebP (PIL) */
      execFileSync('python3', [path.join(HERE, 'anim_webp.py'), SCR, path.join(HERE, 'anim_clip_walk_attack.webp'), String(out.clip.ms)], { stdio: 'inherit' });
      rep.clip.kb = +(fs.statSync(path.join(HERE, 'anim_clip_walk_attack.webp')).size / 1024).toFixed(1);
    }
    fs.writeFileSync(path.join(HERE, 'anim_report.json'), JSON.stringify(rep, null, 1));
    if (errs.length) console.log('page errors:', errs.slice(0, 8));
  } finally { await browser.close(); srv.kill(); }
})().catch(e => { console.error(e); process.exit(1); });
