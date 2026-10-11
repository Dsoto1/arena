/* look100/beast_board_shot.js — LOOK TEST: the real board (all-CPU Classic, zoom 1.7 on the centre) with nobody on the sand (07-ui DRAW_EMPTY)
   → beast_board_empty.png + beast_board.json (tile centres in screenshot px, tile width, pillars/obstacles). */
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const OUT = __dirname, PAGE = 'file://' + path.resolve(__dirname, '../../../flavius-arena.html');
(async () => { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1440, height: 900 } }); await pg.route(/fonts\.g/, r => r.abort());
  await pg.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); localStorage.setItem('flavius_firstrun', 'shown'); });
  await pg.goto(PAGE); await pg.waitForFunction(() => window.FLAVIUS_READY, null, { timeout: 90000 });
  await pg.evaluate(async () => { const W8 = ms => new Promise(r => setTimeout(r, ms)); while (CUR_MODAL) { CUR_MODAL.done(CUR_MODAL.closeB ? CUR_MODAL.closeB.value : null); await W8(120); } try { menuHide(); } catch (e) {}
    startEvent({ ev: 'democritus', loc: 6, seats: ['hero', 'soldier', 'royalty', 'venatore'].map(c => ({ cls: c, cpu: true })), opts: { spect: 24 } });
    for (let i = 0; i < 200; i++) { await W8(100); if (CUR_MODAL) CUR_MODAL.done(CUR_MODAL.closeB ? CUR_MODAL.closeB.value : null); else if (S && S.phase !== 'setup' && i > 8) break; }
    setInterval(() => { if (CUR_MODAL) CUR_MODAL.done(CUR_MODAL.closeB ? CUR_MODAL.closeB.value : null); }, 300); });
  await pg.waitForTimeout(8000); await pg.evaluate(() => { SPEED = 'pause'; }); await pg.waitForTimeout(2500);
  const info = await pg.evaluate(() => {
    for (const el of cv.parentElement.children) if (el !== cv) el.style.visibility = 'hidden';
    for (const s of ['#cardShow', '#bubbles', '#wbubs', '#fx95', '#tip']) { const e = document.querySelector(s); if (e) e.style.visibility = 'hidden'; }
    DRAW_EMPTY = true; const mid = (N - 1) / 2; const P0 = cur(); P0.r = 6; P0.c = 6; CAM.fr = mid; CAM.fc = mid; CAM.z = 1.7; S.zoomIn = true;
    for (let i = 0; i < 40; i++) draw();
    const R = cv.getBoundingClientRect(); const k = R.width / cv.width; const T = ctx.getTransform(); const sc = Math.hypot(T.a, T.b);
    const P = (x, y) => { const p = T.transformPoint(new DOMPoint(x, y)); return { x: +(R.left + p.x * k).toFixed(1), y: +(R.top + p.y * k).toFixed(1) }; };
    const tiles = {}; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { const m = center(r, c); tiles[r + ',' + c] = P(m.x, m.y); }
    const occ = []; for (const q of (S.pillars || [])) if (q.r != null) occ.push([q.r, q.c]);
    return { canvas: { x: R.left, y: R.top, w: R.width, h: R.height }, N, tw: +(TW * sc * k).toFixed(2), tiles, occ };
  });
  await pg.waitForTimeout(300); await pg.screenshot({ path: path.join(OUT, 'beast_board_empty.png') });
  fs.writeFileSync(path.join(OUT, 'beast_board.json'), JSON.stringify(info)); console.log('tw', info.tw, 'pillars', info.occ.length); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
