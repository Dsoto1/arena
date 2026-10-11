/* look100/beast2_comp.js — LOOK TEST round 2 compositing for the beasts (not game code). B2COMP.run(args) from beast2_make.js comp:
   + per-beast rig diagrams in his colour language; sheets are rendered at their drawn size (S.pxmm), so every placement scales by drawn ÷ rendered px/mm.
   his mini beside ours (8 facings), an animation strip per beast, every beast on one real board crop (rule: round bases 0.8 tile,
   long bases ≤ 1.1 tile, figure + base inside the tile), and the lion pouncing on a gladiator (stepped poses + glide). */
(function () {
  const PXMM = 3.143, MINI_YAW = [0, 45, 90, 135, 180, -135, -90, -45];
  const img = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('img ' + src)); i.src = src; });
  const cnv = (w, h, bg) => { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); if (bg) { const g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); } return c; };
  const toCv = async (u) => { const i = await img(u); const c = cnv(i.width, i.height); c.getContext('2d').drawImage(i, 0, 0); return c; };
  function cell(g, S, row, col, x, y, s = 1) { const [w, h, AX, AY] = S.meta; g.drawImage(S.canvas, col * w, row * h, w, h, x - AX * s, y - AY * s, w * s, h * s); }
  const rowOf = (S, n) => { const i = S.rows.indexOf(n); if (i < 0) throw new Error('row ' + n); return i; };
  function label(g, t, x, y, o = {}) { g.save(); g.font = `${o.b ? '600 ' : ''}${o.px || 13}px "DejaVu Sans", sans-serif`; g.fillStyle = o.c || '#2b1d12'; g.textBaseline = 'top'; g.fillText(t, x, y); g.restore(); }
  function shadow(g, x, y, rx, ry, a = 0.3) { g.save(); g.fillStyle = `rgba(20,12,6,${a})`; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); g.restore(); }
  const NAMES = { leo: 'Leo (lion)', leaena: 'Leaena (lioness)', ursa: 'Ursa (bear)', brutum: 'Brutum (bear)', valencia: 'Valencia (wolf)', moechus: 'Moechus (wolf)', glykon: 'Glykon (snake)', arenosus: 'Arenosus (snake)',
    zora: 'Zora (golden eagle)', tholo: 'Tholo', commodus: 'Commodus', boar: 'Boar (custom kind)', croc: 'Crocodile (custom kind)', spider: 'Spider (offering swarm)' };
  const ORDER = ['leo', 'leaena', 'ursa', 'brutum', 'valencia', 'moechus', 'glykon', 'arenosus', 'zora', 'tholo', 'commodus', 'boar', 'croc', 'spider'];
  const LONG = { leo: 72, leaena: 72, ursa: 75, brutum: 75, croc: 75 };   /* our oval bases (mm, long axis); his long bases: lions 58, bears 63 (MINI_A) */
  /* scale on the board: round base = 0.8 tile; a long base ≤ 1.1 tile (src/94-v72 miniScale) */
  const drawnPx = (k, tw) => LONG[k] ? 1.1 * tw / LONG[k] : 0.8 * tw / 25.4;   /* screen px per mm of the base */
  const bscale = (k, tw, S) => drawnPx(k, tw) / (S && S.pxmm || PXMM);
  const HIS_FOOT = { leo: 58, leaena: 58, ursa: 63, brutum: 63 };
  const hisPx = (k, tw) => { const p = 0.8 * tw / 25.4; const a = HIS_FOOT[k] || 25.4; return p * Math.min(1, 1.1 * tw / (a * p)); };

  /* ---------- 1. his mini beside ours ---------- */
  async function compare(SH) {
    const blocks = [];
    const TW = 104;
    for (const k of ORDER) { const S0 = SH[k]; if (!S0) continue; let his = null; try { const hi = await img(`../../../assets/minis8_${k}.webp`); const k2 = hisPx(k, TW) / PXMM; his = cnv(hi.width * k2, hi.height * k2); const hg = his.getContext('2d'); hg.imageSmoothingQuality = 'high'; hg.drawImage(hi, 0, 0, his.width, his.height); } catch (e) {}
      const k3 = drawnPx(k, TW) / (S0.pxmm || PXMM); const S = { meta: S0.meta.map((v, i) => i < 4 ? v * k3 : v), rows: S0.rows, canvas: (() => { const c = cnv(S0.canvas.width * k3, S0.meta[1] * k3); const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(S0.canvas, 0, 0, S0.canvas.width, S0.meta[1], 0, 0, c.width, c.height); return c; })() };
      blocks.push({ k, S, his }); }
    const colW = (b) => Math.max(b.S.meta[0], b.his ? b.his.width / 8 : 0);
    const W = 150 + Math.max(...blocks.map(b => (colW(b) + 6) * 8)) + 20; let H = 50; for (const b of blocks) H += 26 + (b.his ? b.his.height + 8 : 0) + b.S.meta[1] + 16;
    const c = cnv(W, H, '#e4d6b4'); const g = c.getContext('2d');
    label(g, 'Round 2 \u2014 his mini (minis8) above ours (idle, 8 facings), both as DRAWN on the board at zoom \u00d72 (tile 104 px): his long bases fit 1.1 tile; ours 1.1 tile + figure +30% (round bases +15%)', 12, 12, { px: 15, b: 1 });
    let y = 50;
    for (const b of blocks) { const cw = colW(b) + 6; label(g, NAMES[b.k], 12, y + 4, { px: 14, b: 1 }); y += 26;
      if (b.his) { const hw = b.his.width / 8; label(g, 'his mini', 12, y + b.his.height / 2 - 8, { px: 12, c: '#6a5236' }); for (let i = 0; i < 8; i++) g.drawImage(b.his, i * hw, 0, hw, b.his.height, 150 + i * cw + (cw - hw) / 2, y, hw, b.his.height); y += b.his.height + 8; }
      else label(g, '(no mini)', 150, y - 22, { px: 12, c: '#8a6a4a' });
      label(g, 'ours', 12, y + b.S.meta[1] / 2 - 8, { px: 12, c: '#6a5236' });
      for (let i = 0; i < 8; i++) cell(g, b.S, 0, i, 150 + i * cw + cw / 2, y + b.S.meta[3]); y += b.S.meta[1] + 16; }
    return c;
  }
  /* ---------- 2. an animation strip per beast ---------- */
  function strip(k, S) {
    const groups = []; let last = null; S.rows.forEach((n, i) => { const a = n.replace(/\d+$/, ''); if (a !== last) { groups.push({ a, rows: [] }); last = a; } groups[groups.length - 1].rows.push(i); });
    const sc = Math.min(1, 150 / S.meta[0]), cw = S.meta[0] * sc, ch = S.meta[1] * sc, maxN = Math.max(...groups.map(g => g.rows.length)); const FAC = [1, 3];
    const W = 120 + FAC.length * (maxN * cw + 24), H = 56 + groups.length * (ch + 6);
    const c = cnv(W, H, '#e4d6b4'); const g = c.getContext('2d'); label(g, `${NAMES[k]} — ${S.rows.length} frames · facings 1 (45°) | 3 (135°)`, 10, 10, { px: 15, b: 1 });
    FAC.forEach((f, fi) => label(g, `facing ${f}`, 120 + fi * (maxN * cw + 24), 34, { px: 12, b: 1, c: '#6a3b1c' }));
    groups.forEach((G, j) => { const y = 52 + j * (ch + 6); g.fillStyle = 'rgba(255,250,235,.45)'; g.fillRect(6, y, W - 12, ch); label(g, G.a, 12, y + 6, { px: 13, b: 1 }); label(g, `${G.rows.length} frames`, 12, y + 24, { px: 11, c: '#6a5236' });
      FAC.forEach((f, fi) => G.rows.forEach((ri, n) => { const x = 120 + fi * (maxN * cw + 24) + n * cw + cw / 2; cell(g, S, ri, f, x, y + S.meta[3] * sc, sc); })); });
    return c;
  }
  /* ---------- 3. the board ---------- */
  function freeTile(B) { const occ = new Set(B.occ.map(([r, c]) => r + ',' + c)); return (r, c) => r >= 1 && c >= 1 && r <= B.N - 2 && c <= B.N - 2 && !occ.has(r + ',' + c) && !(r === 6 && c === 6); }
  const clearOf = (B) => (r, c) => { for (const [or, oc] of B.occ) { const dx = (oc - or) - (c - r), dy = (oc + or) - (c + r); if (Math.abs(dx) <= 1 && dy >= 1 && dy <= 4) return false; } return true; };
  function board(B, shot, SH, G) {
    const free = freeTile(B), clr = clearOf(B); const inV = (p) => p.x > B.canvas.x + 50 && p.x < B.canvas.x + B.canvas.w - 50 && p.y > B.canvas.y + 90 && p.y < B.canvas.y + B.canvas.h - 25;
    const tiles = []; for (let r = 1; r < B.N - 1; r++) for (let c = 1; c < B.N - 1; c++) { const p = B.tiles[r + ',' + c]; if (free(r, c) && r % 2 === 1 && c % 2 === 1 && inV(p)) tiles.push({ r, c, p }); }
    /* spread them: greedy farthest-apart from the centre outwards */
    const want = [...ORDER, 'glad', 'glad2']; const pick = []; const cx = B.canvas.x + B.canvas.w / 2, cy = B.canvas.y + B.canvas.h * 0.55;
    tiles.sort((a, b) => Math.hypot(a.p.x - cx, a.p.y - cy) - Math.hypot(b.p.x - cx, b.p.y - cy));
    for (const t of tiles) { if (pick.length >= want.length) break;  pick.push(t); }
    const c = cnv(B.canvas.w, B.canvas.h); const g = c.getContext('2d'); g.drawImage(shot, B.canvas.x, B.canvas.y, B.canvas.w, B.canvas.h, 0, 0, B.canvas.w, B.canvas.h);
    const items = pick.map((t, i) => ({ t, k: want[i] })).sort((a, b) => a.t.p.y - b.t.p.y);
    const yaws = [1, 7, 0, 1, 7, 1, 0, 7, 1, 0, 1, 7, 1, 0, 1, 7];
    items.forEach((it, i) => { const x = it.t.p.x - B.canvas.x, y = it.t.p.y - B.canvas.y; const yi = yaws[i % yaws.length];
      if (it.k === 'glad' || it.k === 'glad2') { const s = 0.8 * B.tw / (25.4 * PXMM); shadow(g, x + 2, y + 2, B.tw * 0.3, B.tw * 0.14); cell(g, G, rowOf(G, it.k === 'glad' ? 'idle0' : 'attack3'), yi, x, y, s); label(g, 'gladiator \u00d71.15', x - 34, y + B.tw * 0.2, { px: 10, c: '#2b1d12' }); return; }
      const S = SH[it.k]; if (!S) return; const s = bscale(it.k, B.tw, S) * (it.k === 'spider' ? 0.75 : 1);
      if (it.k === 'spider') { for (const [dx, dy, f] of [[-12, -4, 0], [10, -6, 1], [-2, 8, 2], [14, 7, 3]]) cell(g, S, rowOf(S, 'walk' + f), (yi + f) % 8, x + dx * B.tw / 88, y + dy * B.tw / 88, s); }
      else { shadow(g, x + 2, y + 3, B.tw * (LONG[it.k] ? 0.5 : 0.3), B.tw * (LONG[it.k] ? 0.22 : 0.14), 0.22); cell(g, S, rowOf(S, 'idle0'), yi, x, y, s); }
      label(g, NAMES[it.k].replace(/ \(.*/, ''), x - 24, y + B.tw * 0.24, { px: 10, c: '#2b1d12' }); });
    return { c, placed: items.map(i => i.k) };
  }
  /* ---------- 4. the lion pounces on a gladiator ---------- */
  function pounce(B, shot, L, G) {
    const free = freeTile(B), clr = clearOf(B); let P = null, bd = 1e9; const cx = B.canvas.x + B.canvas.w / 2, cy = B.canvas.y + B.canvas.h * 0.55;
    for (let r = 1; r < B.N - 1; r++) for (let c = 1; c + 2 < B.N - 1; c++) { let ok = true; for (let k = 0; k < 3; k++) if (!free(r, c + k) || !clr(r, c + k)) ok = false; if (!ok) continue; const p = B.tiles[r + ',' + (c + 1)]; const d = Math.hypot(p.x - cx, p.y - cy); if (d < bd) { bd = d; P = { r, c }; } }
    const t = [0, 1, 2].map(k => B.tiles[P.r + ',' + (P.c + k)]);
    const x0 = Math.min(t[0].x, t[2].x) - B.tw * 1.0, y0 = Math.min(t[0].y, t[2].y) - B.tw * 1.25, W = Math.round(Math.abs(t[2].x - t[0].x) + B.tw * 2.0), H = Math.round(Math.abs(t[2].y - t[0].y) + B.tw * 1.75);
    const sL = bscale('leo', B.tw, L), sG = 0.8 * B.tw / (25.4 * PXMM); const FR = 3; const seq = [];
    const at = (u) => ({ x: t[1].x + (t[2].x - t[1].x) * u, y: t[1].y + (t[2].y - t[1].y) * u });
    for (let i = 0; i < 2; i++) for (let f = 0; f < FR; f++) seq.push({ l: 'idle' + i, lp: t[0], g: 'idle' + i });
    const walkN = 18; for (let f = 0; f < walkN; f++) { const u = f / (walkN - 1), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; seq.push({ l: 'walk' + (Math.floor(f / FR) % 6), lp: { x: t[0].x + (t[1].x - t[0].x) * e, y: t[0].y + (t[1].y - t[0].y) * e }, g: 'idle' + (Math.floor(f / 6) % 4) }); }
    const A = [['attack0', 0, 0, 'idle0'], ['attack1', 0, -0.06, 'idle1'], ['attack2', 0.1, 0.4, 'idle1'], ['attack3', 0.45, 0.55, 'hit0'], ['attack4', 0.5, 0.2, 'hit1']];
    for (const [l, u0, u1, gr] of A) for (let f = 0; f < (l === 'attack3' ? 4 : FR); f++) { const u = u0 + (u1 - u0) * f / FR; seq.push({ l, lp: at(u), g: l === 'attack3' && f >= 2 ? 'hit1' : gr }); }
    for (let f = 0; f < 6; f++) seq.push({ l: 'idle' + (f < 3 ? 2 : 3), lp: at(0.1 * (1 - f / 6)), g: f < 3 ? 'hit2' : 'idle0' });
    const frames = seq.map(q => { const c = cnv(W, H); const g = c.getContext('2d'); g.drawImage(shot, x0, y0, W, H, 0, 0, W, H);
      const L1 = [[L, rowOf(L, q.l), 1, q.lp.x - x0, q.lp.y - y0, sL, 0.5, 0.22], [G, rowOf(G, q.g), 5, t[2].x - x0, t[2].y - y0, sG, 0.3, 0.14]].sort((a, b) => a[4] - b[4]);
      for (const [S, row, col, x, y, s, rx, ry] of L1) { shadow(g, x + 2, y + 3, B.tw * rx, B.tw * ry, 0.24); cell(g, S, row, col, x, y, s); } return c; });
    return { frames, info: { n: frames.length, ms: 40, tiles: [P.r, P.c], w: W, h: H, lionScale: +sL.toFixed(3), gladScale: +sG.toFixed(3) } };
  }
  /* ---------- 5. rig diagrams (his colour language) ---------- */
  const JCOL = { head: '#e8463c', chest: '#f08c2e', spine: '#f2d23c', limb: '#58c85a', foot: '#3c86e8', tail: '#9a52e0' };
  const JLAB = [['head', 'Head'], ['chest', 'Shoulder / chest / hip'], ['spine', 'Spine'], ['limb', 'Elbow / knee / wing'], ['foot', 'Paw / foot / wing tip'], ['tail', 'Tail']];
  function rigDiagram(k, D) {
    const S = D.S, [w, h, AX, AY] = S.meta; const views = [2, 1]; const W = views.length * (w + 20) + 260, H = h + 80;
    const c = cnv(W, H, '#1d2130'); const g = c.getContext('2d'); label(g, (NAMES[k] || k).toUpperCase() + ' \u2014 rig (' + D.joints[0].length + ' joints)', 16, 14, { px: 18, b: 1, c: '#d8dce8' });
    views.forEach((yi, vi) => { const ox = 16 + vi * (w + 20), oy = 56; g.save(); g.globalAlpha = 0.55; g.drawImage(S.canvas, yi * w, 0, w, h, ox, oy, w, h); g.restore();
      const js = D.joints[yi]; const at = (j) => [ox + AX + j.x, oy + AY + j.y]; const by = Object.fromEntries(js.map(j => [j.n, j]));
      for (const j of js) { if (!j.par || !by[j.par]) continue; const a = at(j), b = at(by[j.par]); g.strokeStyle = JCOL[j.cat]; g.lineWidth = 3; g.globalAlpha = 0.85; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); g.globalAlpha = 1; }
      for (const j of js) { const [x, y] = at(j); g.fillStyle = JCOL[j.cat]; g.strokeStyle = '#0c0e14'; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, 5.5, 0, 7); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(x - 1.6, y - 1.6, 1.8, 0, 7); g.fill(); } });
    const lx = W - 240; label(g, 'JOINT LEGEND', lx, 60, { px: 13, b: 1, c: '#c8ccd8' }); JLAB.forEach(([cat, t], i) => { g.fillStyle = JCOL[cat]; g.beginPath(); g.arc(lx + 8, 92 + i * 26, 7, 0, 7); g.fill(); label(g, t, lx + 24, 84 + i * 26, { px: 13, c: '#d8dce8' }); });
    return c;
  }
  window.B2COMP = {
    async run(a) {
      const files = {}; const put = (n, c, t = 'image/png', q) => { files[n] = c.toDataURL(t, q); };
      const SH = {}; for (const [k, v] of Object.entries(a.sheets)) SH[k] = { meta: v.meta, rows: v.rows, pxmm: v.pxmm, canvas: await toCv(v.png) };
      const G = { meta: a.glad.meta, rows: a.glad.rows, canvas: await toCv(a.glad.png) };
      for (const [k, d] of Object.entries(a.diag || {})) { const S = { meta: d.meta, canvas: await toCv(d.png) }; put(`beast2_rig_${k}.png`, rigDiagram(k, { S, joints: d.joints })); }
      put('beast2_vs_minis.webp', await compare(SH), 'image/webp', 0.9);
      for (const k of ORDER) if (SH[k]) put(`beast2_strip_${k}.png`, strip(k, SH[k]));
      const shot = await img('beast_board_empty.png'); const bd = board(a.board, shot, SH, G); put('beast2_board.png', bd.c);
      const pc = pounce(a.board, shot, SH.leo, G); pc.frames.forEach((f, i) => put(`b2frame_${String(i).padStart(3, '0')}.png`, f));
      { const pick = [3, 8, 20, 26, 29, 33, 37, 40, 44].filter(i => i < pc.frames.length); const w = pc.frames[0].width, h = pc.frames[0].height; const c = cnv(pick.length * (w + 4), h + 26, '#1f1812'); const g = c.getContext('2d');
        label(g, 'Round 2 — Leo pounces (longer reach): stepped poses every 120 ms, the base glides — frames from beast2_clip_pounce.webp', 6, 5, { px: 14, b: 1, c: '#f0dca8' }); pick.forEach((i, n) => g.drawImage(pc.frames[i], n * (w + 4), 26)); put('beast2_clip_frames.png', c); }
      return { files, clip: pc.info, placed: bd.placed };
    },
  };
})();
