/* look100/r9_ingame.js — v1.0 INTEGRATION shots (276-v100gear): drives the real build flavius-arena.html (assets/tok93.js + the pre-baked
   assets/gear100.js). A Studio character wearing printed pieces is converted, the token
   modeller opens, then a Play Now event draws it on the board — screenshots at 1440 and 390 wide → r9_ingame_*.png, r9_ingame.json.
   node tools/plans/look100/r9_ingame.js */
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const PAGE = path.resolve(__dirname, '../../../flavius-arena.html'), OUT = __dirname;
(async () => {
  const b = await chromium.launch(); const errs = [], R = {};
  const mk = async (w, h) => { const pg = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 }); await pg.route(/fonts\.g/, r => r.abort());
    pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    await pg.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); localStorage.setItem('flavius_firstrun', 'shown'); localStorage.setItem('flavius_tok93auto', '1'); });
    await pg.goto('file://' + PAGE, { timeout: 120000 }); await pg.waitForFunction(() => window.FLAVIUS_READY, null, { timeout: 90000 }); return pg; };
  const until = async (pg, fn, ms = 600000) => { try { await pg.waitForFunction(fn, null, { timeout: ms, polling: 500 }); return true; } catch (e) { return false; } };
  const pg = await mk(1440, 950);
  /* 1. a Studio character in printed pieces the sculptor knows */
  await pg.evaluate(async () => { menuHide(); if (CUR_MODAL) CUR_MODAL.done(null); await loadCustoms(); const c = blankChar(); c.id = 'sc8'; c.name = 'Sculptus'; charFromClass(c, 'soldier'); c.classRef = 'cls:soldier';
    c.portrait.bs = 'full'; c.portrait.hs = 'crop'; c.portrait.fem = false; c.color = '#7a1c14'; c.created = '2026-10-11'; c.status = 'active';
    c.arm = Object.assign({}, c.arm, { head: 'murmillo', chest: 'thorax', belt: 1, rarm: { upper: 'galerus', lower: 'bracers' }, larm: { upper: 'manica', wraps: 1 }, legU: 'thighplate', legL: 'ocrea' });
    c.R = 'gladius'; c.L = 'scutum'; delete c.tok93; await Store.put('customChars', c.id, c); await loadCustoms(); window.__t0 = performance.now(); openStudio('chars'); });
  const conv = await until(pg, () => { const c = CUSTOM.chars.find(x => x.id === 'sc8'); return c && c.tok93 && c.tok93.sheet; });
  R.convert = await pg.evaluate(() => { const c = CUSTOM.chars.find(x => x.id === 'sc8'), t = c.tok93 || {}; return { ok: !!t.sheet, ms: Math.round(performance.now() - window.__t0), buildMs: T93.buildMs, sheetMs: T93.ms, meta: t.meta, kb: Math.round((t.sheet || '').length * 0.75 / 102.4) / 10, parts: t.parts && t.parts.gear, sculpted: T93.api && T93.api.sculpted && T93.api.sculpted() }; });
  R.convert.converted = conv;
  /* 2. the token modeller */
  await pg.evaluate(() => { ST.draft = JSON.parse(JSON.stringify(CUSTOM.chars.find(x => x.id === 'sc8'))); ST.view = 'edit'; studioRedraw(); });
  await pg.waitForTimeout(800); await pg.screenshot({ path: path.join(OUT, 'r9_ingame_studio_1440.png') });
  await pg.evaluate(() => { const b = document.querySelector('#studio [data-t93="open"]'); if (b) b.click(); });
  const ready = await until(pg, () => { const b = document.querySelector('#t93m [data-t93m="save"]'); return b && !b.disabled; }, 300000);
  await until(pg, () => document.querySelectorAll('#t93m #t93strip canvas').length === 8, 300000);
  await pg.waitForTimeout(1500); await pg.screenshot({ path: path.join(OUT, 'r9_ingame_modeller_1440.png') }); R.modeller = { ready };
  await pg.setViewportSize({ width: 390, height: 844 }); await pg.waitForTimeout(1500); await pg.screenshot({ path: path.join(OUT, 'r9_ingame_modeller_390.png') });
  await pg.setViewportSize({ width: 1440, height: 950 }); await pg.waitForTimeout(800);
  await pg.evaluate(() => { const x = document.querySelector('#t93m [data-t93m="close"], #t93m [data-t93m="cancel"]'); if (x) x.click(); else { const m = document.getElementById('t93m'); if (m) m.remove(); } });
  /* 3. Play Now: the character on the board */
  await pg.evaluate(async () => { if (CUR_MODAL) CUR_MODAL.done(null); await new Promise(r => setTimeout(r, 500)); const st = document.getElementById('studio'); if (typeof closeStudio === 'function') try { closeStudio(); } catch (e) {} menuHide();
    startEvent({ ev: 'democritus', loc: 6, seats: [{ cls: 'cc_sc8', cpu: false }, { cls: 'soldier', cpu: true }, { cls: 'slave', cpu: true }, { cls: 'royalty', cpu: true }], opts: { spect: 0 } }); });
  await until(pg, () => typeof S !== 'undefined' && S && S.players && S.players[0] && S.players[0].cls === 'cc_sc8', 60000);
  await pg.waitForTimeout(3000);
  R.board = await pg.evaluate(async () => { for (let i = 0; i < 12 && CUR_MODAL; i++) { CUR_MODAL.done(null); await new Promise(r => setTimeout(r, 300)); }
    const p = S.players[0]; const t = tokenForP(p); for (let i = 0; i < 30 && !(t.t93 && t93Img(t.t93)); i++) await new Promise(r => setTimeout(r, 100));
    T93.drawn = 0; draw(); return { t93: !!t.t93, drawn: T93.drawn, TW: typeof TW !== 'undefined' ? TW : null }; });
  await pg.waitForTimeout(800); await pg.screenshot({ path: path.join(OUT, 'r9_ingame_board_1440.png') });
  /* a close crop round the seat */
  const cr = await pg.evaluate(() => { const p = S.players[0]; const cv = document.getElementById('cv'); const r = cv.getBoundingClientRect(); const c = typeof center === 'function' ? center(p.r, p.c) : [0, 0]; const cc = Array.isArray(c) ? c : [c.x, c.y]; const k = r.width / cv.width; return { x: r.left + cc[0] * k, y: r.top + cc[1] * k, k, raw: c }; });
  R.crop = cr; try { if (isFinite(cr.x) && isFinite(cr.y)) await pg.screenshot({ path: path.join(OUT, 'r9_ingame_board_1440_crop.png'), clip: { x: Math.min(1120, Math.max(0, cr.x - 160)), y: Math.min(650, Math.max(0, cr.y - 230)), width: 320, height: 300 } }); } catch (e) { R.cropErr = String(e).slice(0, 120); }
  await pg.setViewportSize({ width: 390, height: 844 }); await pg.waitForTimeout(2000); await pg.evaluate(() => draw()); await pg.waitForTimeout(500);
  await pg.screenshot({ path: path.join(OUT, 'r9_ingame_board_390.png') });
  R.errs = errs.slice(0, 10); fs.writeFileSync(path.join(OUT, 'r9_ingame.json'), JSON.stringify(R, null, 1)); console.log(JSON.stringify(R)); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
