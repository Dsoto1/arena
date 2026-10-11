/* look100/spec_forum_shot.js — LOOK TEST: the city forum (172-v89city) with today's walkers, and the same frame without them.
   node tools/plans/look100/spec_forum_shot.js → spec_forum_today.png, spec_forum_empty.png, spec_forum.json (walker points, facing, tile size) */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = __dirname, PAGE = 'file://' + path.resolve(__dirname, '../../../flavius-arena.html');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await pg.route(/fonts\.g/, r => r.abort());
  await pg.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); localStorage.setItem('flavius_firstrun', 'shown'); });
  await pg.goto(PAGE); await pg.waitForFunction(() => window.FLAVIUS_READY, null, { timeout: 90000 });
  await pg.evaluate(async () => { const W8 = ms => new Promise(r => setTimeout(r, ms)); while (CUR_MODAL) { CUR_MODAL.done(CUR_MODAL.closeB ? CUR_MODAL.closeB.value : null); await W8(120); } try { menuHide(); } catch (e) {}
    openCitySquare(6); });
  await pg.waitForTimeout(9000);   /* the crowd fills the square, figures decode */
  const info = await pg.evaluate(() => {
    window.requestAnimationFrame = () => 0;   /* freeze on the last drawn frame */
    const cv = CITY.cv, R = cv.getBoundingClientRect(), k = R.width / cv.width;
    const npcs = CITY.npcs.filter(n => n.kind !== 'beast' && n._x != null).map(n => ({ x: +(R.left + n._x * k).toFixed(1), y: +(R.top + n._y * k).toFixed(1), kind: n.kind,
      dr: (n.r - (n._fr != null ? n._fr : n.r)), dc: (n.c - (n._fc != null ? n._fc : n.c)), moving: !!(n.path && n.path.length) }));
    return { canvas: { x: R.left, y: R.top, w: R.width, h: R.height }, T: CITY.TW * k, npcs, loc: CITY.L.n };
  });
  await pg.waitForTimeout(300);
  await pg.screenshot({ path: path.join(OUT, 'spec_forum_today.png') });
  await pg.evaluate(() => { CITY.npcs = CITY.npcs.filter(n => n.kind === 'beast'); try { cityDraw(); } catch (e) { console.error(e); } });
  await pg.waitForTimeout(300);
  await pg.screenshot({ path: path.join(OUT, 'spec_forum_empty.png') });
  fs.writeFileSync(path.join(OUT, 'spec_forum.json'), JSON.stringify(info));
  console.log(info.loc, 'T', info.T, 'walkers', info.npcs.length, 'moving', info.npcs.filter(n => n.moving).length);
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
