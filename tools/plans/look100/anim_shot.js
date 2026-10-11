/* look100/anim_shot.js — LOOK TEST (not game code): screenshots of a real all-CPU Play Now board for the v1.0 animation look test.
   node tools/plans/look100/anim_shot.js   → anim_board.png (the canvas, crowd on), spec_stands_empty.png (crowd painter off),
   anim_board.json (tile centres in screenshot px, tile width, seat points + facing of every seated spectator, sprite height). */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = __dirname, PAGE = 'file://' + path.resolve(__dirname, '../../../flavius-arena.html');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await pg.route(/fonts\.g/, r => r.abort());
  await pg.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); localStorage.setItem('flavius_firstrun', 'shown'); });
  await pg.goto(PAGE); await pg.waitForFunction(() => window.FLAVIUS_READY, null, { timeout: 90000 });
  await pg.evaluate(async () => {
    const W8 = ms => new Promise(r => setTimeout(r, ms)); while (CUR_MODAL) { CUR_MODAL.done(CUR_MODAL.closeB ? CUR_MODAL.closeB.value : null); await W8(120); } try { menuHide(); } catch (e) {}
    startEvent({ ev: 'democritus', loc: 6, seats: ['hero', 'soldier', 'royalty', 'venatore'].map(c => ({ cls: c, cpu: true })), opts: { spect: 24 } });
    for (let i = 0; i < 200; i++) { await W8(100); if (CUR_MODAL) CUR_MODAL.done(CUR_MODAL.closeB ? CUR_MODAL.closeB.value : null); else if (S && S.phase !== 'setup' && i > 8) break; }
    window.__iv = setInterval(() => { if (CUR_MODAL) CUR_MODAL.done(CUR_MODAL.closeB ? CUR_MODAL.closeB.value : null); }, 300);
  });
  await pg.waitForTimeout(9000);   /* crowd walk-in done, a few CPU moves */
  await pg.evaluate(() => { SPEED = 'pause'; });
  await pg.waitForTimeout(2500);
  const ALL = {};
  for (const [tag, z] of [['z1', null], ['z2', 2]]) {
    const info = await pg.evaluate((z) => {
      /* overlays off (cards, bubbles, wager bubbles, floating numbers, buttons over the sand) */
      for (const el of cv.parentElement.children) if (el !== cv) el.style.visibility = 'hidden';
      for (const s of ['#cardShow', '#bubbles', '#wbubs', '#fx95', '#tip']) { const e = document.querySelector(s); if (e) e.style.visibility = 'hidden'; }
      CAM.z = z; S.zoomIn = !!z; if (window.__d91) { draw91 = window.__d91; }
      for (let i = 0; i < 30; i++) draw();
      const R = cv.getBoundingClientRect(); const k = R.width / cv.width;
      const T = CR91.T || ctx.getTransform(); const sc = Math.hypot(T.a, T.b);
      const P = (x, y) => { const p = T.transformPoint(new DOMPoint(x, y)); return { x: +(R.left + p.x * k).toFixed(1), y: +(R.top + p.y * k).toFixed(1) }; };
      const tiles = {}; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { const m = center(r, c); tiles[r + ',' + c] = P(m.x, m.y); }
      const occ = []; for (const p of S.players) if (p.alive !== false && p.r != null) occ.push([p.r, p.c]); for (const n of (S.npcs || [])) if (n.r != null) occ.push([n.r, n.c]);
      for (const q of (S.pillars || [])) if (q.r != null) occ.push([q.r, q.c]);
      const mm = center((N - 1) / 2, (N - 1) / 2); const mid = P(mm.x, mm.y);
      const seats = (CR91.seen || []).map(s => ({ ...P(s.x, s.y), back: s.back, mood: s.mood, sec: s.sec }));
      return { canvas: { x: R.left, y: R.top, w: R.width, h: R.height }, N, tw: +(TW * sc * k).toFixed(2), crowdH: +(TW * SIZE91 * sc * k).toFixed(2), tiles, occ, mid, seats };
    }, z);
    await pg.waitForTimeout(400);
    await pg.screenshot({ path: path.join(OUT, `anim_board_${tag}.png`) });
    await pg.evaluate(() => { window.__d91 = window.__d91 || draw91; draw91 = function () {}; draw(); });
    await pg.screenshot({ path: path.join(OUT, `spec_stands_empty_${tag}.png`) });
    ALL[tag] = info; console.log(tag, 'tw', info.tw, 'crowdH', info.crowdH, 'seats', info.seats.length);
  }
  fs.writeFileSync(path.join(OUT, 'anim_board.json'), JSON.stringify(ALL));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
