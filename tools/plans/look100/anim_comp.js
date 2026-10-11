/* look100/anim_comp.js — LOOK TEST compositing (not game code). Runs in anim_rig.html after anim_rig.js rendered window.SHEETS.
   COMP100.run(board) → { files: {name: dataURL}, clip } : the animation strip, the walk + attack clip frames on a real board crop,
   the rete / spider / Fortuna's Bounty effect frames, and the rig92 spectators beside today's sculpted crowd (193-v91crowd). */
(function () {
  const MINI_YAW = [0, 45, 90, 135, 180, -135, -90, -45];
  const PXMM = 3.143;
  const img = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('img ' + src)); i.src = src; });
  const cnv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const yawIdx = (deg) => { let b = 0, bd = 1e9; MINI_YAW.forEach((y, i) => { const d = Math.abs(((deg - y + 540) % 360) - 180); if (d < bd) { bd = d; b = i; } }); return b; };
  const dirYaw = (dx, dy) => Math.atan2(dx, dy) * 180 / Math.PI;   /* screen direction → MINI_YAW (0 = toward the camera, +45 = right-down) */
  const rowOf = (S, name) => { const i = S.rows.indexOf(name); if (i < 0) throw new Error('row ' + name); return i; };
  /* one sheet cell with its anchor at (x, y) */
  function cell(g, S, row, col, x, y, s = 1, a = 1) { const [w, h, AX, AY] = S.meta; g.save(); g.globalAlpha = a; g.drawImage(S.canvas, col * w, row * h, w, h, x - AX * s, y - AY * s, w * s, h * s); g.restore(); }
  function shadow(g, x, y, rx, a = 0.28) { g.save(); const gr = g.createRadialGradient(x, y, 0, x, y, rx); gr.addColorStop(0, `rgba(20,12,6,${a})`); gr.addColorStop(1, 'rgba(20,12,6,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx, rx * 0.5, 0, 0, 7); g.fill(); g.restore(); }
  function label(g, t, x, y, o = {}) { g.save(); g.font = `${o.b ? '600 ' : ''}${o.px || 13}px "DejaVu Sans", sans-serif`; g.fillStyle = o.c || '#2b1d12'; g.textBaseline = 'top'; g.fillText(t, x, y); g.restore(); }
  function tag(g, t, x, y) { g.save(); g.font = '600 12px "DejaVu Sans", sans-serif'; const w = g.measureText(t).width + 12; g.fillStyle = 'rgba(20,14,10,.78)'; g.fillRect(x, y, w, 20); g.fillStyle = '#f0dca8'; g.textBaseline = 'middle'; g.fillText(t, x + 6, y + 10); g.restore(); }
  const crop = (src, x, y, w, h, k = 1) => { const c = cnv(Math.round(w * k), Math.round(h * k)); const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(src, x, y, w, h, 0, 0, c.width, c.height); return c; };
  const T = (B, r, c) => B.tiles[r + ',' + c];
  const freeSet = (B) => { const s = new Set(B.occ.map(([r, c]) => r + ',' + c)); return (r, c) => r >= 0 && c >= 0 && r < B.N && c < B.N && !s.has(r + ',' + c); };
  const inView = (B, p, m) => p.x > B.canvas.x + m && p.x < B.canvas.x + B.canvas.w - m && p.y > B.canvas.y + m * 1.3 && p.y < B.canvas.y + B.canvas.h - m * 0.6;

  /* ------------------------------------------------ 1. the animation strip ------------------------------------------------ */
  const NOTES = {
    idle: 'Idle — breathing, weight shift', walk: 'Walk', attack: 'Attack — wind, raise, slash, thrust, recover', block: 'Block — shield up, brace',
    hit: 'Hit / recoil', limp: 'Injured limp', cower: 'Scared cower', push: 'Push', topple: 'Topple a pillar', knock: 'Knock a pot', fall: 'Fall / die', sever: 'Severed forearm',
  };
  function strip() {
    const M = SHEETS.main, Fl = SHEETS.fall; const groups = [];
    for (const S of [M, Fl]) { let last = null; S.rows.forEach((n, i) => { const k = n.replace(/\d+$/, ''); if (k !== last) { groups.push({ k, S, rows: [] }); last = k; } groups[groups.length - 1].rows.push(i); }); }
    const FAC = [1, 3]; const s = 1;   /* board size at zoom 2 (base ≈ 0.8 tile ≈ 83 px) */
    const cw = (S) => S.meta[0] * s * (S === Fl ? 0.86 : 0.78);
    const LBL = 190, maxN = 6, colW = Math.max(cw(M), cw(Fl));
    const W = LBL + FAC.length * (maxN * colW + 30) + 20;
    const rowH = (S) => S.meta[1] * s * 0.92;
    let H = 70; for (const G of groups) H += rowH(G.S) + 8;
    const c = cnv(Math.ceil(W), Math.ceil(H)); const g = c.getContext('2d');
    g.fillStyle = '#e4d6b4'; g.fillRect(0, 0, c.width, c.height);
    label(g, 'Flavius Rule v1.0 — LOOK TEST: animated token rows (rig92 murmillo, board size), two facings', 14, 10, { px: 16, b: 1 });
    label(g, 'Each frame = one sheet ROW × 8 MINI_YAW cells in the game (shown here: MINI_YAW 1 = 45°, step along +c, and 3 = 135°). Rendered once, cached, one drawImage per piece.', 14, 32, { px: 12, c: '#5a4630' });
    FAC.forEach((f, i) => label(g, `facing ${f} (${MINI_YAW[f]}°)`, LBL + i * (maxN * colW + 30) + 4, 52, { px: 12, b: 1, c: '#6a3b1c' }));
    let y = 70;
    for (const G of groups) {
      const rh = rowH(G.S); g.fillStyle = 'rgba(255,250,235,.45)'; g.fillRect(8, y, W - 16, rh);
      label(g, NOTES[G.k] || G.k, 14, y + 8, { px: 13, b: 1 }); label(g, `${G.rows.length} frames`, 14, y + 26, { px: 12, c: '#6a5236' });
      FAC.forEach((f, fi) => G.rows.forEach((ri, k) => {
        const x = LBL + fi * (maxN * colW + 30) + k * colW + colW / 2, ay = y + rh - 18;
        shadow(g, x, ay, 34 * s); cell(g, G.S, ri, f, x, ay, s * 0.86);
        g.save(); g.fillStyle = '#8a7050'; g.font = '10px sans-serif'; g.fillText(String(k + 1), x - colW / 2 + 4, y + rh - 6); g.restore();
      }));
      y += rh + 8;
    }
    return c;
  }

  /* ------------------------------------------------ 2. the clip: walk two tiles + attack ------------------------------------------------ */
  function pickPath(B, len, extra = 1) {
    const free = freeSet(B); let best = null;
    for (let r = 0; r < B.N - 1; r++) for (let c0 = 0; c0 + len <= B.N; c0++) {
      let ok = true; for (let k = -1; k <= len; k++) for (let dr = 0; dr <= extra; dr++) if ((r + dr >= 0 && c0 + k >= 0 && r + dr < B.N && c0 + k < B.N) && !free(r + dr, c0 + k)) ok = false;
      if (!ok) continue; const a = T(B, r, c0), b = T(B, r, c0 + len - 1); if (!inView(B, a, 70) || !inView(B, b, 70)) continue;
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; const cx = B.canvas.x + B.canvas.w / 2, cy = B.canvas.y + B.canvas.h / 2;
      const d = Math.hypot(mid.x - cx, mid.y - cy); if (!best || d < best.d) best = { r, c0, d };
    }
    return best;
  }
  function clip(B, shot) {
    const P = pickPath(B, 4); if (!P) throw new Error('no free path for the clip');
    const A = SHEETS.main, R = SHEETS.ret; const s = 0.8 * B.tw / (25.4 * PXMM);
    const t0 = T(B, P.r, P.c0), t1 = T(B, P.r, P.c0 + 1), t2 = T(B, P.r, P.c0 + 2), te = T(B, P.r, P.c0 + 3);
    const x0 = Math.min(t0.x, te.x) - B.tw * 1.0, x1 = Math.max(t0.x, te.x) + B.tw * 1.0, y0 = Math.min(t0.y, te.y) - B.tw * 1.55, y1 = Math.max(t0.y, te.y) + B.tw * 0.55;
    const W = Math.round(x1 - x0), H = Math.round(y1 - y0); const frames = [];
    const seq = [];   /* [murmillo row, x, y, ret row] */
    for (let k = 0; k < 12; k++) { const a = k < 6 ? t0 : t1, b = k < 6 ? t1 : t2, u = (k % 6 + 1) / 6; seq.push(['walk' + (k % 6), a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, 'ridle0']); }
    const atkR = ['ridle0', 'ridle0', 'ridle0', 'rhit0', 'rhit1'];
    for (let k = 0; k < 5; k++) seq.push(['attack' + k, t2.x, t2.y, atkR[k]]);
    seq.push(['idle0', t2.x, t2.y, 'rhit2'], ['idle1', t2.x, t2.y, 'rhit2'], ['idle2', t2.x, t2.y, 'ridle0'], ['idle3', t2.x, t2.y, 'ridle0']);
    for (const [mr, mx, my, rr] of seq) {
      const c = cnv(W, H); const g = c.getContext('2d'); g.drawImage(shot, x0, y0, W, H, 0, 0, W, H);
      const list = [[A, rowOf(A, mr), 1, mx - x0, my - y0], [R, rowOf(R, rr), 5, te.x - x0, te.y - y0]].sort((p, q) => p[4] - q[4]);
      for (const [S, row, col, x, y] of list) { shadow(g, x + 3, y + 2, B.tw * 0.36); cell(g, S, row, col, x, y, s); }
      frames.push(c);
    }
    return { frames, info: { tiles: [P.r, P.c0], scale: +s.toFixed(3), w: W, h: H, n: frames.length } };
  }
  const row5 = (frames, gap = 6, title) => {   /* frames side by side with numbers */
    const w = frames[0].width, h = frames[0].height, top = title ? 26 : 0; const c = cnv(frames.length * (w + gap) - gap, h + top + 18); const g = c.getContext('2d');
    g.fillStyle = '#1f1812'; g.fillRect(0, 0, c.width, c.height); if (title) label(g, title, 6, 6, { px: 14, b: 1, c: '#f0dca8' });
    frames.forEach((f, i) => { g.drawImage(f, i * (w + gap), top); label(g, String(i + 1), i * (w + gap) + 4, top + h + 2, { px: 12, c: '#c8b48a' }); }); return c;
  };

  /* ------------------------------------------------ 3a. rete: throw and wrap ------------------------------------------------ */
  function netDisc(g, cx, cy, rx, ry, o = {}) {
    const N = 14, rings = 4, sag = o.sag || 0; g.save(); g.lineCap = 'round';
    const pt = (a, k) => { const ex = Math.cos(a) * rx * k, ey = Math.sin(a) * ry * k; return [cx + ex, cy + ey + sag * (1 - k * k) * -1 + (o.drop || 0) * k * k]; };
    for (const pass of [0, 1]) {
      g.strokeStyle = pass ? '#d8c49a' : 'rgba(40,26,14,.85)'; g.lineWidth = pass ? 1.1 : 2.4;
      for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2; g.beginPath(); for (let k = 0.12; k <= 1.001; k += 0.11) { const [x, y] = pt(a, k); k < 0.2 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
      for (let j = 1; j <= rings; j++) { const k = j / rings; g.beginPath(); for (let i = 0; i <= 40; i++) { const [x, y] = pt(i / 40 * Math.PI * 2, k); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    }
    for (let i = 0; i < N; i++) { const [x, y] = pt(i / N * Math.PI * 2, 1); g.fillStyle = '#3d3a36'; g.beginPath(); g.arc(x, y, 2.2, 0, 7); g.fill(); g.fillStyle = '#8a8680'; g.beginPath(); g.arc(x - 0.6, y - 0.6, 0.9, 0, 7); g.fill(); }
    g.restore();
  }
  function netWrap(g, S, row, col, x, y, s) {   /* the net hugging the target's silhouette (sprite alpha as the mask) */
    const [w, h, AX, AY] = S.meta; const c = cnv(Math.ceil(w * s) + 8, Math.ceil(h * s) + 8); const q = c.getContext('2d');
    q.strokeStyle = 'rgba(40,26,14,.9)'; q.lineWidth = 2.2; const step = 7 * s;
    for (const pass of [0, 1]) { q.strokeStyle = pass ? '#dcc89c' : 'rgba(40,26,14,.9)'; q.lineWidth = pass ? 1.1 : 2.4;
      for (let k = -c.height; k < c.width + c.height; k += step) { q.beginPath(); q.moveTo(k, 0); q.lineTo(k - c.height * 0.7, c.height); q.stroke(); q.beginPath(); q.moveTo(k - c.height * 0.7, 0); q.lineTo(k, c.height); q.stroke(); } }
    q.globalCompositeOperation = 'destination-in'; for (const [dx, dy] of [[0, 0], [2, 0], [-2, 0], [0, 2], [0, -2]]) q.drawImage(S.canvas, col * w, row * h, w, h, 4 + dx, 4 + dy, w * s, h * s);
    g.drawImage(c, x - AX * s - 4, y - AY * s - 4);
    /* the skirt and the weights on the sand round his feet */
    g.save(); g.strokeStyle = 'rgba(40,26,14,.85)'; g.lineWidth = 1.6; const rx = 26 * s, ry = 12 * s;
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const fx = x + Math.cos(a) * rx, fy = y + 4 + Math.sin(a) * ry; g.beginPath(); g.moveTo(x + Math.cos(a) * 10 * s, y - 30 * s); g.quadraticCurveTo(x + Math.cos(a) * 20 * s, y - 8 * s, fx, fy); g.stroke(); g.fillStyle = '#3d3a36'; g.beginPath(); g.arc(fx, fy, 2.3, 0, 7); g.fill(); }
    g.restore();
  }
  function rete(B, shot) {
    const free = freeSet(B); const P = pickPath(B, 3); const A = SHEETS.main, R = SHEETS.ret; const s = 0.8 * B.tw / (25.4 * PXMM);
    const ta = T(B, P.r, P.c0), tb = T(B, P.r, P.c0 + 2);
    const x0 = ta.x - B.tw * 0.9, y0 = Math.min(ta.y, tb.y) - B.tw * 1.6, W = Math.round(tb.x - ta.x + B.tw * 1.8), H = Math.round(Math.abs(tb.y - ta.y) + B.tw * 2.15);
    const hand = [[22, -118], [30, -150], [36, -118]];   /* the left hand over the anchor (sprite px × s), per rete frame, facing 1 */
    const F = [['rete0', 'idle0'], ['rete1', 'idle1'], ['rete2', 'hit0'], ['ridle0', 'cower0'], ['ridle0', 'cower1']];
    const out = [];
    F.forEach(([rr, mr], k) => {
      const c = cnv(W, H); const g = c.getContext('2d'); g.drawImage(shot, x0, y0, W, H, 0, 0, W, H);
      const ax = ta.x - x0, ay = ta.y - y0, bx = tb.x - x0, by = tb.y - y0;
      shadow(g, ax + 3, ay + 2, B.tw * 0.36); cell(g, R, rowOf(R, rr), 1, ax, ay, s);
      const hx = ax + (hand[Math.min(k, 2)][0]) * s, hy = ay + hand[Math.min(k, 2)][1] * s, top = by - 120 * s;
      if (k >= 1 && k <= 3) { const u = [0, 0.25, 0.7, 1][k]; const nx = hx + (bx - hx) * u, ny = hy + (top - hy) * u - Math.sin(u * Math.PI) * 55 * s; const r = [0, 14, 36, 34][k] * s;
        g.save(); g.globalAlpha = 0.22; g.fillStyle = '#1a120a'; g.beginPath(); g.ellipse(ax + (bx - ax) * u, ay + (by - ay) * u, r * 1.1, r * 0.5, 0, 0, 7); g.fill(); g.restore(); }
      shadow(g, bx + 3, by + 2, B.tw * 0.36); cell(g, A, rowOf(A, mr), 5, bx, by, s);
      if (k === 0) { g.fillStyle = '#c9b48a'; g.strokeStyle = '#2a1a0c'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(hx, hy, 9 * s, 6 * s, 0.4, 0, 7); g.fill(); g.stroke(); for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + Math.cos(i) * 12 * s, hy + Math.sin(i) * 9 * s + 6); g.stroke(); } }
      if (k >= 1 && k <= 3) { const u = [0, 0.25, 0.7, 1][k]; const nx = hx + (bx - hx) * u, ny = hy + (top - hy) * u - Math.sin(u * Math.PI) * 55 * s;
        if (k === 3) netDisc(g, bx, top + 30 * s, 34 * s, 15 * s, { drop: 40 * s, sag: 0 });
        else netDisc(g, nx, ny, [0, 14, 36][k] * s, [0, 8, 14][k] * s, { sag: [0, 3, 6][k] * s }); }
      if (k === 4) netWrap(g, A, rowOf(A, mr), 5, bx, by, s);
      out.push(c);
    });
    return out;
  }

  /* ------------------------------------------------ 3b. spiders: today vs the new look ------------------------------------------------ */
  function spidersToday(g, m, TW, k, seed) {   /* src/11-extra.js drawHitFX 'spiders', ported for the comparison (time k = 0..1) */
    const n = 14; for (let j = 0; j < n; j++) { const a = seed + j * 2.399; const ph = (k * 3 + j / n) % 1; const rad = TW * (0.12 + 0.26 * ((j * 37) % 10) / 10);
      const x = m.x + Math.cos(a + k * 6 * (j % 2 ? 1 : -1)) * rad, y = m.y - TW * (0.15 + 0.75 * ph) + Math.sin(a * 1.7 + k * 9) * TW * 0.06;
      g.fillStyle = '#120b08'; g.strokeStyle = '#120b08'; g.lineWidth = 1; const s = TW * 0.035; g.beginPath(); g.ellipse(x, y, s * 1.2, s, 0, 0, Math.PI * 2); g.fill();
      for (let l = 0; l < 4; l++) { const wig = Math.sin(k * 40 + j + l) * s * 0.6; g.beginPath(); g.moveTo(x - s, y); g.lineTo(x - s * 2.4, y - s + l * s * 0.7 + wig); g.moveTo(x + s, y); g.lineTo(x + s * 2.4, y - s + l * s * 0.7 - wig); g.stroke(); }
      g.fillStyle = '#8a1d12'; g.beginPath(); g.arc(x, y - s * 0.2, s * 0.35, 0, Math.PI * 2); g.fill(); }
  }
  function spiders(B, shot) {
    const free = freeSet(B); let tile = null, bd = 1e9; const cx = B.canvas.x + B.canvas.w * 0.45, cy = B.canvas.y + B.canvas.h * 0.55;
    for (let r = 1; r < B.N - 1; r++) for (let c = 1; c < B.N - 1; c++) { let ok = true; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (!free(r + dr, c + dc)) ok = false; const p = T(B, r, c); if (!ok || !inView(B, p, 100)) continue; const d = Math.hypot(p.x - cx, p.y - cy); if (d < bd) { bd = d; tile = { r, c, p }; } }
    const A = SHEETS.main, SP = SHEETS.spider; const s = 0.8 * B.tw / (25.4 * PXMM), ss = s * 0.42;
    const m = tile.p; const x0 = m.x - B.tw * 1.25, y0 = m.y - B.tw * 1.55, W = Math.round(B.tw * 2.5), H = Math.round(B.tw * 2.15);
    /* six spiders: start on the neighbouring tiles, crawl to him; two climb him in the last frames */
    const sp = [[-1.0, 0.25], [0.95, 0.15], [-0.6, 0.55], [0.5, 0.6], [0.1, -0.45], [-0.3, -0.35]];
    const todayF = [], newF = [];
    for (let f = 0; f < 4; f++) {
      const u = f / 3;
      { const c = cnv(W, H); const g = c.getContext('2d'); g.drawImage(shot, x0, y0, W, H, 0, 0, W, H); shadow(g, m.x - x0 + 3, m.y - y0 + 2, B.tw * 0.36); cell(g, A, rowOf(A, 'cower' + Math.min(2, f)), 0, m.x - x0, m.y - y0, s); spidersToday(g, { x: m.x - x0, y: m.y - y0 }, B.tw, f / 4 * 0.9 + 0.05, 3.3); todayF.push(c); }
      const c = cnv(W, H); const g = c.getContext('2d'); g.drawImage(shot, x0, y0, W, H, 0, 0, W, H);
      const items = [];
      sp.forEach(([dx, dy], i) => { const k = Math.min(1, u * (0.75 + (i % 3) * 0.12)); const climb = i >= 4 && f >= 2;
        const sx = m.x + dx * B.tw * (1 - 0.72 * k), sy = m.y + dy * B.tw * 0.5 * (1 - 0.72 * k) - (climb ? (f - 1) * 22 * s : 0);
        const yi = climb ? 4 : yawIdx(dirYaw(m.x - sx, m.y - sy)); items.push([sy, () => { if (!climb) shadow(g, sx - x0 + 2, sy - y0 + 1, 10 * s, 0.25); cell(g, SP, (f + i) % 4, yi, sx - x0, sy - y0, ss); }]); });
      items.push([m.y, () => { shadow(g, m.x - x0 + 3, m.y - y0 + 2, B.tw * 0.36); cell(g, A, rowOf(A, 'cower' + Math.min(2, f)), 0, m.x - x0, m.y - y0, s); }]);
      items.sort((a, b) => a[0] - b[0]).forEach(([, fn], i) => fn());
      /* climbers drawn over the figure */
      sp.forEach(([dx, dy], i) => { if (i < 4 || f < 2) return; const sx = m.x + dx * B.tw * 0.28 + (i === 4 ? 8 : -8) * s, sy = m.y - (f - 1) * 26 * s - 20 * s; cell(g, SP, (f + i) % 4, i === 4 ? 4 : 2, sx - x0, sy - y0, ss * 0.9); });
      newF.push(c);
    }
    return { todayF, newF };
  }

  /* ------------------------------------------------ 3c. Fortuna's Bounty: an offering from the stands ------------------------------------------------ */
  function bounty(B, shot, rtok) {
    const free = freeSet(B);
    const seats = B.seats.filter(p => inView(B, p, 40)); let best = null;
    for (const st of seats) for (let r = 0; r < B.N; r++) for (let c = 0; c < B.N; c++) { if (!free(r, c)) continue; const p = T(B, r, c); if (!inView(B, p, 70)) continue; const d = Math.hypot(p.x - st.x, p.y - st.y); if (d > B.tw * 1.6 && d < B.tw * 3.2 && (!best || Math.abs(d - B.tw * 2.4) < best.e)) best = { st, p, e: Math.abs(d - B.tw * 2.4) }; }
    const { st, p } = best; const hx = st.x, hy = st.y - B.crowdH * 0.85;
    const x0 = Math.min(hx, p.x) - B.tw * 0.8, x1 = Math.max(hx, p.x) + B.tw * 0.8, y0 = Math.min(hy, p.y) - B.tw * 1.3, y1 = Math.max(hy, p.y) + B.tw * 0.45;
    const W = Math.round(x1 - x0), H = Math.round(y1 - y0); const out = [];
    const cellW = rtok.width / 8, cellH = rtok.height / 5, idx = 28; const tx = (idx % 8) * cellW, ty = Math.floor(idx / 8) * cellH;   /* elix2 */
    const R = B.tw * 0.2; const at = (u) => ({ x: hx + (p.x - hx) * u, y: hy + (p.y - hy) * u - Math.sin(u * Math.PI) * B.tw * 1.1 });
    [0, 0.28, 0.55, 0.82, 1].forEach((u, k) => {
      const c = cnv(W, H); const g = c.getContext('2d'); g.drawImage(shot, x0, y0, W, H, 0, 0, W, H);
      const q = at(u); const gx = hx + (p.x - hx) * u, gy = (st.y + (p.y - st.y) * u);
      /* trail */
      g.save(); for (let j = 1; j <= 7; j++) { const v = u - j * 0.035; if (v < 0) break; const t = at(v); g.globalAlpha = (1 - j / 8) * 0.7; g.fillStyle = j % 2 ? '#ffe9a0' : '#f3c44e'; g.beginPath(); g.arc(t.x - x0, t.y - y0, 2.6 - j * 0.25, 0, 7); g.fill(); } g.restore();
      if (k === 0) { g.save(); g.globalAlpha = 0.85; const gr = g.createRadialGradient(hx - x0, hy - y0, 0, hx - x0, hy - y0, R * 1.6); gr.addColorStop(0, 'rgba(255,240,180,.95)'); gr.addColorStop(1, 'rgba(255,220,120,0)'); g.fillStyle = gr; g.beginPath(); g.arc(hx - x0, hy - y0, R * 1.6, 0, 7); g.fill(); g.restore(); }
      if (k > 0 && k < 4) { g.save(); g.globalAlpha = 0.15 + 0.3 * u; g.fillStyle = '#1a120a'; g.beginPath(); g.ellipse(p.x - x0, p.y - y0, R * (0.4 + u * 0.7), R * 0.35 * (0.4 + u * 0.7), 0, 0, 7); g.fill(); g.restore(); }
      if (k < 4) {   /* the token tumbling: squash across its spin, a darker rim for the edge */
        const spin = Math.cos(u * Math.PI * 3.2), sx = Math.max(0.18, Math.abs(spin)); g.save(); g.translate(q.x - x0, q.y - y0); g.rotate(u * 1.2 - 0.4);
        g.fillStyle = '#6a4a1c'; g.beginPath(); g.ellipse(2, 1.5, R * sx, R, 0, 0, 7); g.fill(); g.scale(sx, 1);
        if (spin > 0) g.drawImage(rtok, tx, ty, cellW, cellH, -R, -R, R * 2, R * 2); else { g.fillStyle = '#9c7a3c'; g.beginPath(); g.arc(0, 0, R, 0, 7); g.fill(); g.strokeStyle = '#4a3214'; g.lineWidth = 2; g.stroke(); }
        g.restore();
      } else {   /* landed flat on the tile: iso ellipse, dust ring, glints */
        g.save(); g.translate(p.x - x0, p.y - y0); g.globalAlpha = 0.5; g.strokeStyle = '#f2e3bd'; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 1, R * 2.1, R * 0.95, 0, 0, 7); g.stroke(); g.globalAlpha = 1;
        g.fillStyle = 'rgba(20,12,6,.3)'; g.beginPath(); g.ellipse(2, 3, R * 1.05, R * 0.55, 0, 0, 7); g.fill(); g.scale(1, 0.5); g.drawImage(rtok, tx, ty, cellW, cellH, -R, -R, R * 2, R * 2); g.restore();
        g.save(); g.strokeStyle = '#fff3c4'; g.lineWidth = 1.5; for (const [dx, dy, l] of [[-R * 1.2, -R * 0.9, 6], [R * 1.1, -R * 0.7, 5], [0, -R * 1.3, 7]]) { const X = p.x - x0 + dx, Y = p.y - y0 + dy; g.beginPath(); g.moveTo(X - l, Y); g.lineTo(X + l, Y); g.moveTo(X, Y - l); g.lineTo(X, Y + l); g.stroke(); } g.restore();
      }
      out.push(c);
    });
    return out;
  }

  /* ------------------------------------------------ 4. spectators ------------------------------------------------ */
  const POSE_I = { sit: 0, sitcheer: 1, sitfist: 2, stand: 3, standcheer: 4 };
  function crowd(B, empty) {
    const c = cnv(empty.width, empty.height); const g = c.getContext('2d'); g.drawImage(empty, 0, 0);
    const SP = SHEETS.spec; const seatedPx = 1.40 * 17.52 * PXMM; const s = B.crowdH / seatedPx * 1.05;
    const list = B.seats.map((st, i) => {
      const h = (i * 2654435761 >>> 0) % 1000 / 1000; let pose = 'sit';
      if (st.mood === 'delighted') pose = h < 0.5 ? 'sitcheer' : 'standcheer'; else if (st.mood === 'furious') pose = 'sitfist'; else if (h < 0.18) pose = 'stand'; else if (h < 0.3) pose = 'sitcheer';
      return { st, v: (i * 7 + 3) % SP.length, pose, yi: yawIdx(dirYaw(B.mid.x - st.x, B.mid.y - st.y)) };
    }).sort((a, b) => a.st.y - b.st.y);
    for (const it of list) { const x = it.st.x, y = it.st.y + B.crowdH * 0.06; g.save(); g.fillStyle = 'rgba(20,12,6,.22)'; g.beginPath(); g.ellipse(x + 1, y, B.crowdH * 0.22, B.crowdH * 0.08, 0, 0, 7); g.fill(); g.restore(); cell(g, SP[it.v], POSE_I[it.pose], it.yi, x, y, s); }
    return { c, scale: +s.toFixed(3), poses: list.reduce((o, x) => (o[x.pose] = (o[x.pose] || 0) + 1, o), {}) };
  }
  function crowdPanel(B, today, rig, tag2) {
    const r = B.canvas; const k = 1; const W = Math.round(r.w), H = Math.round(r.h);
    const out = cnv(W, H * 2 + 60); const g = out.getContext('2d'); g.fillStyle = '#1f1812'; g.fillRect(0, 0, out.width, out.height);
    g.drawImage(today, r.x, r.y, W, H, 0, 26, W, H); g.drawImage(rig, r.x, r.y, W, H, 0, H + 56, W, H);
    label(g, `TODAY — 193-v91crowd sculpted spectators (${tag2}, real zoom)`, 8, 5, { px: 14, b: 1, c: '#f0dca8' });
    label(g, `LOOK TEST — rig92 spectators: seated / standing / cheering, tunics + togas (same seats, same zoom)`, 8, H + 35, { px: 14, b: 1, c: '#f0dca8' });
    return out;
  }
  function crowdDetail(B, today, rig, z) {   /* one stand section enlarged ×2 for the eye (pixels of the real-zoom render, smoothed) */
    const st = B.seats.filter(p => inView(B, p, 30)); let best = null;
    for (const a of st) { const n = st.filter(b => Math.hypot(b.x - a.x, b.y - a.y) < B.tw * 2.2).length; if (!best || n > best.n) best = { a, n }; }
    const cw = B.tw * 4.6, ch = B.tw * 2.4; const x = best.a.x - cw / 2, y = best.a.y - ch * 0.62; const K = z === 'z1' ? 3 : 2;
    const L = crop(today, x, y, cw, ch, K), R = crop(rig, x, y, cw, ch, K);
    const out = cnv(L.width * 2 + 12, L.height + 30); const g = out.getContext('2d'); g.fillStyle = '#1f1812'; g.fillRect(0, 0, out.width, out.height);
    g.drawImage(L, 0, 30); g.drawImage(R, L.width + 12, 30); label(g, `today (×${K})`, 6, 6, { px: 14, b: 1, c: '#f0dca8' }); label(g, `rig92 spectators (×${K})`, L.width + 18, 6, { px: 14, b: 1, c: '#f0dca8' });
    return out;
  }

  window.COMP100 = {
    async run(board) {
      const files = {}; const put = (n, c, type = 'image/png', q) => { files[n] = c.toDataURL(type, q); };
      const shots = {}; for (const n of ['anim_board_z1', 'anim_board_z2', 'spec_stands_empty_z1', 'spec_stands_empty_z2']) shots[n] = await img(n + '.png');
      const rtok = await img('../../../assets/rtok.webp');
      put('anim_strip.png', strip());
      const B2 = board.z2;
      const cl = clip(B2, shots.anim_board_z2); cl.frames.forEach((f, i) => put(`frame_clip_${String(i).padStart(3, '0')}.png`, f));
      put('anim_clip_frames.png', row5(cl.frames.filter((_, i) => i % 2 === 0 || i >= 12), 4, 'Walk two tiles + attack on the real board (every 2nd walk frame) — the looping clip is anim_clip_walk_attack.webp'));
      put('anim_fx_rete.png', row5(rete(B2, shots.anim_board_z2), 6, 'Rete: thrown and wrapping the target (5 frames, net painted in 2D over the rig92 sprites)'));
      const sp = spiders(B2, shots.anim_board_z2);
      const a = row5(sp.todayF, 6, 'Spiders TODAY (11-extra drawHitFX, ported 1:1)'), b = row5(sp.newF, 6, 'Spiders NEW LOOK: modelled spider (rig92 pipeline), 4 gait frames × 8 facings, crawling in and climbing');
      { const c = cnv(Math.max(a.width, b.width), a.height + b.height + 8); const g = c.getContext('2d'); g.fillStyle = '#1f1812'; g.fillRect(0, 0, c.width, c.height); g.drawImage(a, 0, 0); g.drawImage(b, 0, a.height + 8); put('anim_fx_spiders.png', c); }
      put('anim_fx_bounty.png', row5(bounty(B2, shots.anim_board_z2, rtok), 6, "Fortuna's Bounty: an offering token thrown from the stands, tumbling onto a tile (5 frames)"));
      const crowdInfo = {};
      for (const z of ['z1', 'z2']) {
        const B = board[z]; const r = crowd(B, shots['spec_stands_empty_' + z]); crowdInfo[z] = { scale: r.scale, poses: r.poses, crowdH: B.crowdH };
        put(`spec_compare_${z}.png`, crowdPanel(B, shots['anim_board_' + z], r.c, z === 'z1' ? 'board fit' : 'zoom ×2'));
        put(`spec_detail_${z}.png`, crowdDetail(B, shots['anim_board_' + z], r.c, z));
      }
      put('spec_sheet_one_look.png', SHEETS.spec[3].canvas);
      return { files, clip: { ms: 110, ...cl.info }, crowd: crowdInfo };
    },
  };
})();
