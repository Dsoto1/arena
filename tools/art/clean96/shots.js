/* clean96/shots.js — screenshots of the post-event clean-up show, before (old crew: localStorage flavius_clean96off=1) and after.
     node tools/art/clean96/shots.js flavius-arena.html [outDir=tools/plans/clean96] [only=before|after]
   Moments: Charun + carts (corpse cart), rakers + guard (blood), the pillar carried / set up, the chest carried.
   PNGs (convert to .webp before committing). Each moment: the board at play size (board_<tag>_<moment>.png) and a 2× crop around the crew (zoom_<tag>_<moment>.png).
   Served over http (tools/perf95/serve.js) so the sheets decode like on the site. */
const { chromium } = require('playwright');
const pageURL = require('../../perf95/serve.js');
const path = require('path'), fs = require('fs');
const page = path.resolve(process.argv[2] || 'flavius-arena.html'), OUT = path.resolve(process.argv[3] || 'tools/plans/clean96'), only = process.argv[4] || '';
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const URL = await pageURL(page);
  const b = await chromium.launch();
  try {
    for (const tag of ['before', 'after']) {
      if (only && only !== tag) continue;
      const ctx = await b.newContext({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 2 });
      await ctx.addInitScript((off) => { try { localStorage.setItem('flavius_firstrun', 'shown'); if (off) localStorage.setItem('flavius_clean96off', '1'); else localStorage.removeItem('flavius_clean96off'); } catch (e) { } }, tag === 'before');
      const pg = await ctx.newPage(); await pg.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
      const errs = []; pg.on('pageerror', e => errs.push(e.message));
      await pg.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await pg.waitForFunction(() => window.FLAVIUS_READY, null, { timeout: 30000 }).catch(() => { });
      await pg.evaluate(() => { const c = document.getElementById('mClose'); if (c) c.click(); });
      await pg.evaluate(() => { $('#modal').hidden = true; startEvent({ ev: 'democritus', loc: 6, seats: ['soldier', 'hero', 'slave', 'royalty'].map(c => ({ cls: c, cpu: true, diff: 'normal' })), opts: { spect: 0 } }); SPEED = 'pause'; });
      await pg.waitForTimeout(1600);
      await pg.evaluate(() => {
        const pl = S.pillars[1]; S.pillars = S.pillars.filter(x => x !== pl); (S.rubble = S.rubble || []).push({ r: pl.r, c: pl.c, dr: 0, dc: 1 });
        S.pillars[0].pots = []; S.chest.r = 11; S.chest.c = 4;
        const p2 = S.players[1]; p2.r = 4; p2.c = 7; eliminate(p2, { type: 'player', p: S.players[0] });
        for (const [r, c] of [[6, 6], [6, 7], [7, 6], [5, 8], [8, 8], [7, 9]]) bloodAt(r, c, 'elim');
        S.players[2].r = 8; S.players[2].c = 5; S.players[3].r = 3; S.players[3].c = 3;
        eliminate(S.players[2], { type: 'player', p: S.players[0] }); eliminate(S.players[3], { type: 'player', p: S.players[0] });
      });
      await pg.waitForTimeout(1200);
      await pg.evaluate(() => { const r = S.lastResult && S.lastResult.rows && S.lastResult.rows.find(x => x.id === 0); if (r) r.fate = 'Fatal Charades · Charun'; SPEED = 'normal'; });
      const want = { charun: 1300, carts: 700, blood: 3800, pillars: 1200, chest: 350 }; const seen = {}; const t0 = Date.now();
      while (Date.now() - t0 < 120000) {
        const ph = await pg.evaluate(() => { const m = document.getElementById('modal'); if (m && !m.hidden) m.hidden = true; return S.clean ? CLEAN_ORDER[S.clean.phase] : (S.cleanDone ? 'done' : 'wait'); });
        if (ph === 'done') break;
        if (!want[ph] || seen[ph]) { await pg.waitForTimeout(60); continue; }
        seen[ph] = 1; const tEnd = Date.now() + want[ph];
        while (Date.now() < tEnd) { const p2 = await pg.evaluate(() => S.clean ? CLEAN_ORDER[S.clean.phase] : null); if (p2 !== ph) break; await pg.waitForTimeout(60); }
        const box = await pg.evaluate((ph) => { CITY.open = true; /* freeze the show (cleanTick9 and the crew loop wait while the city is open) */ try { draw(); } catch (e) { } const cv = document.getElementById('cv').getBoundingClientRect();
          const pts = []; const C = S.clean; if (!C) return null; const add = (r, c) => { const m = center(r, c); pts.push([m.x, m.y]); };
          if (C.ch) add(C.ch.r, C.ch.c); else if (ph === 'carts') { const t = C.carts.find(x => x.load) || C.carts.find(x => x.tgt) || C.carts[0]; add(t.r, t.c); }
          if (['blood', 'loot', 'rubble', 'laurels'].includes(ph)) for (const t of C.crew) add(t.r, t.c); if (C.pil) add(C.pil.r, C.pil.c); if (ph === 'chest' && S.chest) add(S.chest.r, S.chest.c);
          if (!pts.length) add(6, 6); const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
          const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
          return { cv: [cv.x, cv.y, cv.width, cv.height], cx: cv.x + cx, cy: cv.y + cy - TW * 0.4, TW, now: C ? CLEAN_ORDER[C.phase] : null, chest: S.chest ? [S.chest.r, S.chest.c] : null, figs: typeof CL96 !== 'undefined' ? CL96.items.filter(i => i.fig).length : 0 };
        }, ph);
        if (!box) continue;
        await pg.screenshot({ path: path.join(OUT, `board_${tag}_${ph}.png`), clip: { x: box.cv[0], y: box.cv[1], width: box.cv[2], height: box.cv[3] }, scale: 'css' });
        const w = 460, h = 300; await pg.screenshot({ path: path.join(OUT, `zoom_${tag}_${ph}.png`), clip: { x: Math.max(0, box.cx - w / 2), y: Math.max(0, box.cy - h / 2), width: w, height: h } });
        await pg.evaluate(() => { CITY.open = false; });
        console.log(tag, ph, '(shot during', box.now + ')', 'TW', Math.round(box.TW), 'chest', JSON.stringify(box.chest), 'figs', box.figs);
      }
      const st = await pg.evaluate(() => typeof CL96 !== 'undefined' ? { frames: CL96.frames, ms: +(CL96.ms / Math.max(1, CL96.frames)).toFixed(2) } : null);
      console.log(tag, 'CL96', JSON.stringify(st), 'ERRS', JSON.stringify(errs.slice(0, 4)));
      await ctx.close();
    }
  } finally { await b.close(); }
})().catch(e => { console.error(e); process.exit(1); });
