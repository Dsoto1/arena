/* look100/anim_comp2.js — LOOK TEST round 2 compositing (not game code). COMP2.run(args) from anim_make2.js:
   clip v2 (figure + base inside its tile, stepped poses with a smooth glide), the 8 printed-class stand-ins line-up,
   spectators v2 (bench, darker painted shading, runtime-recoloured tunics, bigger) at z1/z2, and 3D walkers in the city forum. */
(function () {
  const MINI_YAW = [0, 45, 90, 135, 180, -135, -90, -45], PXMM = 3.143, MPM = 32.5 / 1.855;
  const T99 = 0.88;   /* src/272-v99fix4 T99B.t93k: the game draws 3D tokens 12% under the minis' 0.8-tile base → base 0.70 tile */
  const img = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('img')); i.src = src; });
  const cnv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const toCv = async (u) => { const i = await img(u); const c = cnv(i.width, i.height); c.getContext('2d').drawImage(i, 0, 0); return c; };
  const yawIdx = (deg) => { let b = 0, bd = 1e9; MINI_YAW.forEach((y, i) => { const d = Math.abs(((deg - y + 540) % 360) - 180); if (d < bd) { bd = d; b = i; } }); return b; };
  const dirYaw = (dx, dy) => Math.atan2(dx, dy) * 180 / Math.PI;
  const hash = (n) => ((n * 2654435761) >>> 0) / 4294967296;
  function cell(g, S, row, col, x, y, s = 1, flip = false) { const [w, h, AX, AY] = S.meta; g.save(); if (flip) { g.translate(x, 0); g.scale(-1, 1); x = 0; } g.drawImage(S.canvas, col * w, row * h, w, h, x - AX * s, y - AY * s, w * s, h * s); g.restore(); }
  function shadow(g, x, y, rx, a = 0.3) { g.save(); const gr = g.createRadialGradient(x, y, 0, x, y, rx); gr.addColorStop(0, `rgba(20,12,6,${a})`); gr.addColorStop(1, 'rgba(20,12,6,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx, rx * 0.5, 0, 0, 7); g.fill(); g.restore(); }
  function label(g, t, x, y, o = {}) { g.save(); g.font = `${o.b ? '600 ' : ''}${o.px || 13}px "DejaVu Sans", sans-serif`; g.fillStyle = o.c || '#f0dca8'; g.textBaseline = 'top'; g.fillText(t, x, y); g.restore(); }
  const crop = (src, x, y, w, h, k = 1) => { const c = cnv(Math.round(w * k), Math.round(h * k)); const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(src, x, y, w, h, 0, 0, c.width, c.height); return c; };
  const T = (B, r, c) => B.tiles[r + ',' + c];
  const inView = (B, p, m) => p.x > B.canvas.x + m && p.x < B.canvas.x + B.canvas.w - m && p.y > B.canvas.y + m * 1.3 && p.y < B.canvas.y + B.canvas.h - m * 0.6;
  function clear(B, r, c) { if (r < 1 || c < 1 || r > B.N - 2 || c > B.N - 2) return false;   /* never the edge row: the base must not reach the railing */
    for (const [or, oc] of B.occ) { const dx = (oc - or) - (c - r), dy = (oc + or) - (c + r); if (dx === 0 && dy === 0) return false; if (Math.abs(dx) <= 2 && dy >= 1 && dy <= 5) return false; } return true; }
  const DIRS = [[0, 1, 1, 5, 0], [1, 0, 7, 3, 40], [-1, 0, 3, 7, 60], [0, -1, 5, 1, 80]];
  function pickPath(B, len) { let best = null;
    for (const [dr, dc, fw, bk, pen] of DIRS) for (let r = 0; r < B.N; r++) for (let c = 0; c < B.N; c++) {
      let ok = true; for (let k = 0; k < len; k++) if (!clear(B, r + dr * k, c + dc * k)) ok = false; if (!ok) continue;
      const a = T(B, r, c), b = T(B, r + dr * (len - 1), c + dc * (len - 1)); if (!inView(B, a, 70) || !inView(B, b, 70)) continue;
      const d = Math.hypot((a.x + b.x) / 2 - (B.canvas.x + B.canvas.w / 2), (a.y + b.y) / 2 - (B.canvas.y + B.canvas.h / 2)) + pen; if (!best || d < best.d) best = { r, c, dr, dc, fw, bk, d, at: (k) => T(B, r + dr * k, c + dc * k) }; }
    return best; }
  /* the tile's outline (to show the base inside it) */
  function tileLine(g, x, y, tw, a = 0.55) { g.save(); g.strokeStyle = `rgba(255,236,170,${a})`; g.lineWidth = 1.2; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(x, y - tw / 4); g.lineTo(x + tw / 2, y); g.lineTo(x, y + tw / 4); g.lineTo(x - tw / 2, y); g.closePath(); g.stroke(); g.restore(); }

  /* ---------------- clip v2 ---------------- */
  function clip2(B, shot, SH) {
    const P = pickPath(B, 4); const A = SH.main, R = SH.ret; const s = T99 * 0.8 * B.tw / (25.4 * PXMM);
    const t = [0, 1, 2, 3].map(k => P.at(k));
    const xs = t.map(p => p.x), ys = t.map(p => p.y); const x0 = Math.min(...xs) - B.tw * 0.95, x1 = Math.max(...xs) + B.tw * 0.95, y0 = Math.min(...ys) - B.tw * 1.45, y1 = Math.max(...ys) + B.tw * 0.5;
    const W = Math.round(x1 - x0), H = Math.round(y1 - y0); const rowOf = (S, n) => S.rows.indexOf(n);
    const FR = 3;   /* video frames per pose: 40 ms × 3 = a new pose every 120 ms; the position moves every frame */
    const seq = [];
    const ease = (u) => u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    const walkN = 30;   /* 2 tiles in 1.2 s */
    for (let f = 0; f < walkN; f++) { const u = ease((f + 1) / walkN) * 2; const k = Math.min(1, Math.floor(u)), v = u - k; const a = t[k], b = t[Math.min(2, k + 1)];
      seq.push({ m: 'walk' + (Math.floor(f / FR) % 6), x: a.x + (b.x - a.x) * v, y: a.y + (b.y - a.y) * v, r: 'ridle0' }); }
    const atk = ['attack0', 'attack1', 'attack2', 'attack3', 'attack4'], lunge = [0, 0, 0.06, 0.14, 0.04], tr = ['ridle0', 'ridle0', 'ridle0', 'rhit0', 'rhit1'];
    atk.forEach((m, i) => { for (let f = 0; f < FR; f++) { const L = lunge[i] + (i < 4 ? (lunge[i + 1] - lunge[i]) * f / FR : -lunge[i] * f / FR); seq.push({ m, x: t[2].x + (t[3].x - t[2].x) * L, y: t[2].y + (t[3].y - t[2].y) * L, r: tr[i] }); } });
    for (let i = 0; i < 4; i++) for (let f = 0; f < FR; f++) seq.push({ m: 'idle' + i, x: t[2].x, y: t[2].y, r: i < 2 ? 'rhit2' : 'ridle0' });
    const frames = [];
    for (const q of seq) {
      const c = cnv(W, H); const g = c.getContext('2d'); g.drawImage(shot, x0, y0, W, H, 0, 0, W, H);
      const L = [[A, rowOf(A, q.m), P.fw, q.x - x0, q.y - y0], [R, rowOf(R, q.r), P.bk, t[3].x - x0, t[3].y - y0]].sort((p, o) => p[4] - o[4]);
      for (const [S, row, col, x, y] of L) { shadow(g, x + 2, y + 2, B.tw * 0.3); cell(g, S, row, col, x, y, s); }
      frames.push(c);
    }
    /* a still with the tile outlines: the bases sit inside their tiles */
    const st = cnv(W, H); { const g = st.getContext('2d'); g.drawImage(frames[walkN + 3 * FR], 0, 0); tileLine(g, t[2].x - x0, t[2].y - y0, B.tw); tileLine(g, t[3].x - x0, t[3].y - y0, B.tw); }
    return { frames, still: st, info: { tiles: [P.r, P.c, P.dr, P.dc], facing: P.fw, scale: +s.toFixed(3), baseOfTile: +(25.4 * PXMM * s / B.tw).toFixed(3), w: W, h: H, n: frames.length, ms: 40 } };
  }

  /* ---------------- the 8 printed classes ---------------- */
  function lineup(SC, info, tw) {
    const ks = Object.keys(SC); const fr = info.frames; const s = T99 * 0.8 * tw / (25.4 * PXMM);
    const cw = tw * 0.95, ch = tw * 1.75, LBL = 120; const W = LBL + fr.length * 2 * cw + 30, H = 60 + ks.length * ch;
    const c = cnv(Math.ceil(W), Math.ceil(H)); const g = c.getContext('2d'); g.fillStyle = '#d9c9a3'; g.fillRect(0, 0, W, H);
    label(g, 'Printed classes as rig92 stand-ins (approximate class loadouts) — 8 frames each, facing 1 | facing 3, game size at zoom ×2, dashed = the tile', 10, 8, { px: 14, b: 1, c: '#2b1d12' });
    label(g, fr.join(' · ') + '   (the full 47-frame set renders the same way)', 10, 30, { px: 12, c: '#5a4630' });
    ks.forEach((k, j) => { const y = 60 + j * ch + ch - tw * 0.32; label(g, k, 10, y - ch * 0.55, { px: 14, b: 1, c: '#2b1d12' });
      for (let side = 0; side < 2; side++) fr.forEach((_, i) => { const x = LBL + side * (fr.length * cw + 30) + i * cw + cw / 2; tileLine(g, x, y, tw, 0.9); shadow(g, x + 2, y + 2, tw * 0.3); cell(g, SC[k], i, side, x, y, s); }); });
    return c;
  }

  /* ---------------- spectators v2 ---------------- */
  const TUNICS = ['#8a3b2a', '#3f6b8a', '#c9a23e', '#4f7a3a', '#7a4a8a', '#a0522d', '#5a6a7a', '#b0643a', '#2f5a52', '#8c2a3a', '#d8cfb6', '#6b4a2a'];
  const RC = new Map(); let RCN = 0;
  /* the runtime recolour: the grey-keyed tunic pixels × the tint (kept per look·pose·facing·tint, like the game's sprite cache) */
  function recol(S, li, row, col, tint) {
    const key = li + '|' + row + '|' + col + '|' + tint; if (RC.has(key)) return RC.get(key);
    const [w, h, AX, AY] = S.meta; const c = cnv(w, h); const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(S.canvas, col * w, row * h, w, h, 0, 0, w, h);
    const d = g.getImageData(0, 0, w, h), p = d.data; const tr = parseInt(tint.slice(1, 3), 16), tg = parseInt(tint.slice(3, 5), 16), tb = parseInt(tint.slice(5, 7), 16);
    for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const r = p[i], gg = p[i + 1], b = p[i + 2], mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
      if (mx < 55 || mx - mn > 14) continue; const L = mx / 200; p[i] = Math.min(255, tr * L); p[i + 1] = Math.min(255, tg * L); p[i + 2] = Math.min(255, tb * L); }
    g.putImageData(d, 0, 0); const o = { canvas: c, meta: [w, h, AX, AY] }; RC.set(key, o); RCN++; return o;
  }
  const PI2 = { sit: 0, sitcheer: 1, sitfist: 2, stand: 3, standcheer: 4, walk0: 5, walk1: 6, walk2: 7, walk3: 8 };
  function crowd2(B, empty, SP) {
    const c = cnv(empty.width, empty.height); const g = c.getContext('2d'); g.drawImage(empty, 0, 0);
    const seatedPx = 1.40 * MPM * PXMM, s = B.crowdH / seatedPx * 1.05 * 1.2; const used = {};
    const list = B.seats.map((st, i) => { const h = hash(i + 7); let pose = 'sit';
      if (st.mood === 'delighted') pose = h < 0.5 ? 'sitcheer' : 'standcheer'; else if (st.mood === 'furious') pose = 'sitfist'; else if (h < 0.15) pose = 'stand'; else if (h < 0.3) pose = 'sitcheer';
      return { st, li: Math.floor(hash(i * 3 + 1) * SP.length), tint: TUNICS[Math.floor(hash(i * 5 + 2) * TUNICS.length)], pose, yi: yawIdx(dirYaw(B.mid.x - st.x, B.mid.y - st.y)) }; }).sort((a, b) => a.st.y - b.st.y);
    for (const it of list) { const x = it.st.x, y = it.st.y + B.crowdH * 0.06; used[it.li + it.tint] = 1;
      g.save(); g.fillStyle = 'rgba(20,12,6,.25)'; g.beginPath(); g.ellipse(x + 1, y, B.crowdH * 0.24, B.crowdH * 0.09, 0, 0, 7); g.fill(); g.restore();
      const S = recol(SP[it.li], it.li, PI2[it.pose], it.yi, it.tint); cell(g, S, 0, 0, x, y, s); }
    return { c, scale: +s.toFixed(3), variants: Object.keys(used).length };
  }
  function panel(top, bot, r, t1, t2) { const W = Math.round(r.w), H = Math.round(r.h); const out = cnv(W, H * 2 + 60); const g = out.getContext('2d'); g.fillStyle = '#1f1812'; g.fillRect(0, 0, out.width, out.height);
    g.drawImage(top, r.x, r.y, W, H, 0, 26, W, H); g.drawImage(bot, r.x, r.y, W, H, 0, H + 56, W, H); label(g, t1, 8, 5, { px: 14, b: 1 }); label(g, t2, 8, H + 35, { px: 14, b: 1 }); return out; }
  function detail(L0, R0, x, y, w, h, K, t1, t2) { const L = crop(L0, x, y, w, h, K), R = crop(R0, x, y, w, h, K); const out = cnv(L.width * 2 + 12, L.height + 30); const g = out.getContext('2d'); g.fillStyle = '#1f1812'; g.fillRect(0, 0, out.width, out.height);
    g.drawImage(L, 0, 30); g.drawImage(R, L.width + 12, 30); label(g, t1, 6, 6, { px: 14, b: 1 }); label(g, t2, L.width + 18, 6, { px: 14, b: 1 }); return out; }

  /* ---------------- the forum ---------------- */
  function forum(F, empty, SP, SC) {
    const c = cnv(empty.width, empty.height); const g = c.getContext('2d'); g.drawImage(empty, 0, 0);
    const T0 = F.T, s = T0 * 1.05 / (1.855 * MPM * PXMM); const sc = T99 * 0.8 * T0 / (25.4 * PXMM) * 0.95;
    const list = F.npcs.map((n, i) => ({ n, i })).sort((a, b) => a.n.y - b.n.y); let walking = 0;
    for (const { n, i } of list) { const h = hash(i + 31), walkF = h < 0.55; if (walkF) walking++;
      const yi = Math.floor(hash(i * 11 + 5) * 8);
      g.save(); g.fillStyle = 'rgba(40,24,8,.28)'; g.beginPath(); g.ellipse(n.x + T0 * 0.13, n.y + T0 * 0.01, T0 * 0.3, T0 * 0.09, -0.12, 0, 7); g.fill(); g.restore();
      if ((n.kind === 'soldier' || n.kind === 'glad') && SC) {   /* guards and gladiators: the class stand-ins (rendered here only at facings 1 and 3; mirrored for the others) */
        const S = SC[n.kind === 'soldier' ? 'soldier' : ['hero', 'slave', 'venatore', 'amazonia'][i % 4]]; const col = [1, 3, 5, 7].includes(yi) ? (yi === 1 || yi === 7 ? 0 : 1) : 0; const flip = yi >= 5;
        const [w, h2, AX, AY] = S.meta; g.save(); g.translate(n.x, n.y); if (flip) g.scale(-1, 1); g.drawImage(S.canvas, col * w, (walkF ? 1 : 0) * h2, w, h2, -AX * sc, -AY * sc, w * sc, h2 * sc); g.restore(); continue; }
      const li = Math.floor(hash(i * 3 + 1) * SP.length), tint = TUNICS[Math.floor(hash(i * 5 + 2) * TUNICS.length)];
      const S = recol(SP[li], li, walkF ? PI2['walk' + (i % 4)] : PI2.stand, yi, tint); cell(g, S, 0, 0, n.x, n.y, s); }
    return { c, scale: +s.toFixed(3), walking, n: F.npcs.length };
  }

  window.COMP2 = {
    async run(a) {
      const files = {}; const put = (n, c, type = 'image/png', q) => { files[n] = c.toDataURL(type, q); };
      const SH = { main: { meta: a.sheets.main.meta, rows: a.sheets.main.rows, canvas: await toCv(a.pngs.main) }, ret: { meta: a.sheets.ret.meta, rows: a.sheets.ret.rows, canvas: await toCv(a.pngs.ret) } };
      const SC = {}; for (const [k, u] of Object.entries(a.cls)) SC[k] = { meta: a.clsInfo.metas[k].meta, canvas: await toCv(u) };
      const SP = []; for (let i = 0; i < a.spec.length; i++) SP.push({ meta: a.specInfo.metas[i], canvas: await toCv(a.spec[i]) });
      const shots = {}; for (const n of ['anim_board_z1', 'anim_board_z2', 'spec_stands_empty_z1', 'spec_stands_empty_z2', 'spec_forum_today', 'spec_forum_empty']) shots[n] = await img(n + '.png');
      const B2 = a.board.z2; const cl = clip2(B2, shots.anim_board_z2, SH);
      cl.frames.forEach((f, i) => put(`frame2_clip_${String(i).padStart(3, '0')}.png`, f)); put('anim_clip2_still.png', cl.still);
      put('anim_classes_lineup.png', lineup(SC, a.clsInfo, B2.tw));
      const crowd = {};
      for (const z of ['z1', 'z2']) { const B = a.board[z]; const r = crowd2(B, shots['spec_stands_empty_' + z], SP); crowd[z] = { scale: r.scale, variants: r.variants };
        put(`spec2_compare_${z}.webp`, panel(shots['anim_board_' + z], r.c, B.canvas, `TODAY — 193-v91crowd (${z === 'z1' ? 'board fit' : 'zoom ×2'}, real zoom)`, 'ROUND 2 — rig92 crowd: bench under every sitter, darker painted shading, +20%, 6 looks × 12 tunic colours (runtime recolour)'), 'image/webp', 0.9);
        const st = B.seats.filter(p => inView(B, p, 30)); let best = null; for (const s0 of st) { const n = st.filter(o => Math.hypot(o.x - s0.x, o.y - s0.y) < B.tw * 2.2).length; if (!best || n > best.n) best = { s0, n }; }
        const cw = B.tw * 4.6, ch = B.tw * 2.4, K = z === 'z1' ? 3 : 2; put(`spec2_detail_${z}.png`, detail(shots['anim_board_' + z], r.c, best.s0.x - cw / 2, best.s0.y - ch * 0.62, cw, ch, K, `today (×${K})`, `rig92 crowd v2 (×${K})`)); }
      const F = a.forum; const fo = forum(F, shots.spec_forum_empty, SP, SC); const fr = F.canvas;
      put('spec_forum_compare.webp', panel(shots.spec_forum_today, fo.c, fr, `TODAY — the forum of ${F.loc} (172-v89city lit sculpted figures)`, 'ROUND 2 — the same rig92 people walking the forum (townsfolk = crowd looks, guards/gladiators = class stand-ins)'), 'image/webp', 0.9);
      put('spec_forum_detail.png', detail(shots.spec_forum_today, fo.c, fr.x + fr.w * 0.2, fr.y + fr.h * 0.52, fr.w * 0.5, fr.h * 0.38, 2, 'today (×2)', 'rig92 walkers (×2)'));
      return { files, clip: cl.info, crowd: { ...crowd, recoloured: RCN }, forum: { scale: fo.scale, walking: fo.walking, n: fo.n } };
    },
  };
})();
