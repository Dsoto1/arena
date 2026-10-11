/* look100/board.js — ROUND 2 board crop in the REAL game page (display patches inside this test only; src/ untouched):
   A today (his minis, pillars as they are) · B the 3D class tokens at the mini rule (round base = 0.8 TW, figure +15% in the sheet) ·
   C the same + pillars, Blessing pots and the chest ×1.15. One token stands on a near EDGE tile, next to the raised railing.
   node tools/plans/look100/board.js   (after make2.js wrote cls2_*.png + stats2.json) → look100_r2_board.png */
const http = require('http'), fs = require('fs'), path = require('path'); const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '../../..');
(async () => {
  const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    const ext = path.extname(f); r.writeHead(200, { 'content-type': { '.html': 'text/html', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' }[ext] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const base = 'http://127.0.0.1:' + srv.address().port + '/';
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }); await ctx.route(/fonts\./, r => r.abort());
  await ctx.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); localStorage.setItem('flavius_firstrun', 'shown'); });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(base + 'flavius-arena.html'); await pg.waitForFunction(() => window.FLAVIUS_READY, null, { timeout: 30000 });
  const stats = JSON.parse(fs.readFileSync(path.join(__dirname, 'stats2.json'), 'utf8'));
  const url = await pg.evaluate(async (stats) => {
    const W8 = ms => new Promise(r => setTimeout(r, ms)); while (CUR_MODAL) { CUR_MODAL.done(CUR_MODAL.closeB ? CUR_MODAL.closeB.value : null); await W8(120); } try { menuHide() } catch (e) {}
    SETTINGS.tokenStyle = 'standee'; applySettings();
    const seats = ['soldier', 'hero', 'amazonia', 'veteranus'];
    startEvent({ ev: 'democritus', loc: 6, seats: seats.map((c, i) => ({ cls: c, cpu: true })), opts: { spect: 'auto' } });
    for (let i = 0; i < 200; i++) { await W8(120); if (CUR_MODAL) { const lit = document.querySelector('#mBody [data-mi]:not(.dim):not([disabled])'); const bs = [...document.querySelectorAll('#mBtns button:not([disabled])')]; if (lit) lit.click(); else if (bs.length) bs[0].click(); else CUR_MODAL.done(null); } else if (S && S.phase !== 'setup' && i > 6) break; }
    SPEED = 'pause'; for (let i = 0; i < 50 && (S.busy || (S.anims && S.anims.length)); i++) await W8(100); try { menuHide() } catch (e) {}
    for (const id of ['cardShow', 'bubbles']) (document.getElementById(id) || {}).innerHTML = '';
    /* the scene: a pillar near the front, three fighters round it, one on the near edge tile */
    const n = N - 1, pl = S.pillars.slice().sort((a, b) => (b.r + b.c) - (a.r + a.c))[0];
    const free = (r, c) => r >= 0 && c >= 0 && r <= n && c <= n && !S.pillars.some(q => q.r === r && q.c === c);
    const spots = [[pl.r, pl.c + 1], [pl.r + 1, pl.c], [pl.r + 1, pl.c + 1]].filter(([r, c]) => free(r, c));
    S.players.forEach((p, i) => { const sp = i < 3 ? spots[i % spots.length] : [n, Math.min(n, pl.c + 1)]; p.r = sp[0]; p.c = sp[1]; p._fr = p.r; p._fc = p.c; p._face = [1, 0, 7, 1][i]; });
    if (S.chest) { S.chest.held = null; const cs = [[pl.r - 1, pl.c + 1], [pl.r, pl.c - 1]].find(([r, c]) => free(r, c) && !S.players.some(p => p.r === r && p.c === c)); if (cs) { S.chest.r = cs[0]; S.chest.c = cs[1]; } }
    S.zoomIn = false; for (let i = 0; i < 40; i++) { draw(); await W8(80); }
    /* the 3D sheets (mini rule: round base 25.4 mm = MINI_BASE × TW) */
    const load = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
    const SH = {}; for (const k of seats) SH[k] = { im: await load('tools/plans/look100/cls2_' + k + '.png'), m: stats.classes[k].meta };
    const MODE = { tok: false, obj: 1 };
    const baseMini = miniDraw; miniDraw = function (k, x, y, opt = {}) { const p = MINI_CUR, sh = MODE.tok && p && S.players.includes(p) && SH[p.cls];
      if (!sh) return baseMini.apply(this, arguments); const s = TW * MINI_BASE / 25.4 / MINI_PXMM, M = sh.m, i = miniFace(p, p.cls) || 0;
      ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.32)'; const rw = TW * MINI_BASE * 0.55; ell(x + 2, y + 3, rw, rw * 0.5); ctx.fill();
      ctx.drawImage(sh.im, i * M[0], 0, M[0], M[1], x - M[2] * s, y - M[3] * s, M[0] * s, M[1] * s);
      if (p.color) { const k2 = s * MINI_PXMM, rx = 12.75 * k2; ctx.strokeStyle = p.color; ctx.lineWidth = Math.max(1.5, 2.3 * k2); ctx.beginPath(); ctx.ellipse(x, y - 1.35 * k2, rx, rx * 0.5, 0, 0.05, Math.PI - 0.05); ctx.stroke(); }
      ctx.restore(); return y - M[3] * s; };
    const around = (fn, getM) => function (...a) { if (MODE.obj === 1) return fn.apply(this, a); const m = getM(...a); ctx.save(); ctx.translate(m.x, m.y); ctx.scale(MODE.obj, MODE.obj); ctx.translate(-m.x, -m.y); try { return fn.apply(this, a); } finally { ctx.restore(); } };
    drawPillar = around(drawPillar, (q) => center(q.r, q.c)); drawChest83 = around(drawChest83, (m) => m);
    /* crop round the pillar + the edge tile */
    const box = () => { const pts = [center(pl.r - 2.4, pl.c - 1.2), center(pl.r + 2.2, pl.c + 2.2), center(n + 0.9, pl.c + 1), center(pl.r - 2.4, pl.c + 2.6), center(pl.r + 1, pl.c - 2)];
      const xs = pts.map(p => p.x), ys = pts.map(p => p.y); return [Math.min(...xs), Math.min(...ys) - TW * 1.4, Math.max(...xs), Math.max(...ys) + TW * 0.3]; };
    const dpr = window.devicePixelRatio || 1;
    const shot = async () => { for (let i = 0; i < 8; i++) { draw(); await W8(60); } const [x0, y0, x1, y1] = box(); const c = document.createElement('canvas'); c.width = Math.round((x1 - x0) * dpr); c.height = Math.round((y1 - y0) * dpr);
      const g = c.getContext('2d'); g.drawImage(cv, Math.round(x0 * dpr), Math.round(y0 * dpr), c.width, c.height, 0, 0, c.width, c.height);
      /* the edge token's tile, outlined */
      const e = S.players[3]; const m = center(e.r, e.c); const X = (v) => (v - x0) * dpr, Y = (v) => (v - y0) * dpr; g.strokeStyle = '#2a7fff'; g.lineWidth = 2 * dpr; g.setLineDash([6 * dpr, 4 * dpr]); g.beginPath();
      g.moveTo(X(m.x), Y(m.y - TH / 2)); g.lineTo(X(m.x + TW / 2), Y(m.y)); g.lineTo(X(m.x), Y(m.y + TH / 2)); g.lineTo(X(m.x - TW / 2), Y(m.y)); g.closePath(); g.stroke(); return c; };
    const A = await shot(); MODE.tok = true; const B = await shot(); MODE.obj = 1.15; const C = await shot();
    const pad = 20, hd = 70, W = A.width * 3 + pad * 4, H = A.height + hd + 90; const out = document.createElement('canvas'); out.width = W; out.height = H; const g = out.getContext('2d');
    g.fillStyle = '#e9e1cf'; g.fillRect(0, 0, W, H); g.fillStyle = '#3a2c20'; g.font = `600 ${16 * dpr}px Georgia, serif`;
    g.fillText('Round 2 · on the real board (Democritus, Roma, the game\'s own draw at 1440×900 ×2): size against the tile, the railing and the pillars', pad, 30 * dpr / 1.3);
    [[A, 'A · today: his 3D minis (MINI_BASE 0.8 TW)'], [B, 'B · 3D class tokens, base 0.8 TW, figure +15% · objects as today'], [C, 'C · B + pillars, pots and the chest ×1.15']].forEach(([c, s], i) => {
      const x = pad + i * (A.width + pad); g.drawImage(c, x, hd); g.font = `${13 * dpr}px Georgia, serif`; g.fillText(s, x, hd - 10); });
    g.font = `${12 * dpr}px Georgia, serif`; g.fillStyle = '#6a5038';
    g.fillText(`Blue dashes = the near edge tile next to the raised railing: the round base sits inside it. Board TW here = ${Math.round(TW)} px (×${dpr}). Draw rule for the 3D sheet = the minis' (TW·0.8/25.4/MINI_PXMM px per sheet px), not 222's h/1.3.`, pad, H - 30);
    return out.toDataURL('image/png');
  }, stats);
  fs.writeFileSync(path.join(__dirname, 'look100_r2_board.png'), Buffer.from(url.split(',')[1], 'base64'));
  console.log('ok', errs.slice(0, 5)); await b.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
