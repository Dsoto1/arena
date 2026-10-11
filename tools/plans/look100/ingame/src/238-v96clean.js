/* =====================================================================
   238-V96CLEAN · v0.96 — the post-event clean-up show, redrawn (Virgilante's picks 1a 2c 3b 4)
   =====================================================================
   DISPLAY ONLY. The show itself (07-ui startCleanCrew / cleanTick9 / CLEAN_PH, its 320 ms tick and the countdown) is untouched:
   same phases, same S changes, same duration. This module only changes how the crew LOOKS.
   1a WORKERS = rendered once with the token modeller (tools/art/clean96: crew.js on rig92's body + rig; make.js) into flat sheets,
      one ROW per pose, 8 cells per row in MINI_YAW order like the minis8 sheets, no base (a contact shadow is painted):
        assets/crew96_slave.webp   walkA walkB stand rakeA rakeB carryA carryB pushA pushB haulA haulB  (iron collar + chain, irons)
        assets/crew96_charun.webp  walkA walkB stand raise strike  (bone mask, long mallet)
        assets/crew96_guard.webp   walkA walkB idle crack  (galea, red tunic, whip)
      CREW96_META = [cellW, cellH, anchorX, anchorY, rows] per sheet (from tools/art/clean96/out/meta.json), rendered at CREW96_PXMM.
      Each figure faces the way it moves ON SCREEN (cl96Yaw: so it turns with the ROT89 view by itself); walk cycle A·stand·B·stand.
   2c PROPS painted on the canvas in a small iso frame (cl96F: u = travel, v = across, h = height, in metres at mini scale):
      corpse cart with spoked turning wheels + iron tyres, plank bed, handles, a stretcher with the shrouded body in its colour;
      the column carried between two bearers (shaded drum, fluting, rope slings), hauled on rollers with ropes over the haulers'
      shoulders, and set back up under shear legs with a pulley and a hauler on the rope; the chest carried between two bearers.
      The rake, Charun's mallet and the guard's whip are part of the renders.
   3b EFFECTS (Full animations only): comb lines behind every rake head, cart ruts and Charun's drag furrow (fade over 9 s);
      dust at the feet, the rakes and the mallet blow; removed blood fades out under the rakes (cl96Ghost, a copy of the blood
      paint) instead of popping; a GUARD with a whip oversees every working phase (idle, a crack every few seconds + a dust flick).
      A third, unchained raker follows the pair in the blood/fish phases (display only — the tick's crew is still the two).
   4  PACE: unchanged (nothing here touches the tick or the phases).
   LAYERS: ground work (shadows, comb lines, ruts, ghosts, dust) paints in the 'decals' layer through the drawCleanCrew wrapper; the
      figures and props are sorted WITH the pieces: like 108's pen they ride in S.pillars for the length of draw() only
      (`cl96` items, depth d89 from dep89) and the drawPillar wrapper paints them — no new paint pass.
   MOTION: Full = a ≤15 fps rAF loop while the show runs (smooth walking between ticks), slowed so it takes ≤ ~¼ of the main thread
      (CL96.cost = measured script + raster per frame); Fast speed = no loop, no effects
      (figures jump per tick); Reduce motion / calm / Animations Off / effects off = STATIC (standing poses at their tiles, no
      loop, no effects, no guard crack). HEADLESS, the kill switch (localStorage flavius_clean96off=1) or sheets not yet decoded
      → the old drawSlave9/drawCart9/drawCharun9 crew. 55-anim's crew for speared spectators uses the sprites too (drawSlave9).
   Cosmetic randomness = Math.random only (never the seeded dice); nothing here writes S except the transient pillar items. */
const CREW96_PXMM = 2.6;
const CREW96_URL = { slave: 'assets/crew96_slave.webp', charun: 'assets/crew96_charun.webp', guard: 'assets/crew96_guard.webp' };
const CREW96_META = {
  slave: [114, 108, 57, 77.9, 11], charun: [112, 130, 56, 99.9, 5], guard: [158, 139, 79, 100.9, 4] };
const CREW96_ROWS = {
  slave: ['walkA', 'walkB', 'stand', 'rakeA', 'rakeB', 'carryA', 'carryB', 'pushA', 'pushB', 'haulA', 'haulB'],
  charun: ['walkA', 'walkB', 'stand', 'raise', 'strike'], guard: ['walkA', 'walkB', 'idle', 'crack'] };
const CL96 = { off: false, img: {}, raf: 0, last: 0, lines: [], ghosts: [], dust: [], guard: null, third: null, strike: null, raise: [], items: [], frames: 0, ms: 0, drawn: 0 };
try { CL96.off = localStorage.getItem('flavius_clean96off') === '1'; } catch (e) { /* storage blocked: on */ }
const CL96_M = 0.4243;   /* grid units per metre on the sand (a tile side ≈ 2.36 m at the minis' scale) */
const CL96_H = 0.479;    /* screen height per metre, in TW (30° camera, 0.8 TW = 25.4 mm) */
const CL96_WORK = new Set(['carts', 'blood', 'laurels', 'loot', 'rubble', 'pillars', 'chest', 'fish']);

/* ---------- sheets ---------- */
function cl96Img(k) {
  if (HEADLESS || !CREW96_URL[k]) return null; let im = CL96.img[k];
  if (!im) { im = new Image(); im.onload = () => { try { if (S && S.clean) draw(); } catch (e) { /* the next tick redraws */ } }; im.src = CREW96_URL[k]; CL96.img[k] = im; }
  return im.complete && im.naturalWidth ? im : null;
}
function cl96Ready() { let ok = true; for (const k in CREW96_URL) if (!cl96Img(k)) ok = false; return ok; }
/* off · static · fast · full */
function cl96Mode() {
  if (HEADLESS || CL96.off || !cl96Ready()) return 'off';
  try {
    if (typeof reduceMotion === 'function' && reduceMotion()) return 'static';
    if (typeof SETTINGS !== 'undefined' && SETTINGS && (SETTINGS.anim88 === 'off' || SETTINGS.fx === false || SETTINGS.calm)) return 'static';
    if (typeof SPEED !== 'undefined' && SPEED === 'fast') return 'fast';
  } catch (e) { return 'static'; }
  return 'full';
}
const cl96Scale = () => TW * (typeof MINI_BASE !== 'undefined' ? MINI_BASE : 0.8) / 25.4 / CREW96_PXMM;
/* yaw cell (MINI_YAW order) for a screen direction: yaw 0 = toward the camera (down), +90 = right */
function cl96Yaw(dx, dy) {
  if (!dx && !dy) return 0; const a = Math.atan2(dx, dy * 2) * 180 / Math.PI; const Y = [0, 45, 90, 135, 180, -135, -90, -45];
  let best = 0, bd = 1e9; Y.forEach((y, i) => { const d = Math.abs(((a - y) % 360 + 540) % 360 - 180); if (d < bd) { bd = d; best = i; } }); return best;
}
/* facing cell for a grid direction (dr, dc) at (r, c), as seen now (the ROT89 view turns center()) */
function cl96Face(r, c, dr, dc) { const a = center(r, c), b = center(r + dr, c + dc); return cl96Yaw(b.x - a.x, b.y - a.y); }
function cl96Spr(fig, row, face, x, y, alpha) {
  const im = cl96Img(fig); const M = CREW96_META[fig]; if (!im || !M) return false; const j = CREW96_ROWS[fig].indexOf(row); if (j < 0) return false;
  const s = cl96Scale(); ctx.save(); if (alpha != null && alpha < 1) ctx.globalAlpha *= Math.max(0, alpha);
  ctx.drawImage(im, face * M[0], j * M[1], M[0], M[1], x - M[2] * s, y - M[3] * s, M[0] * s, M[1] * s); ctx.restore(); CL96.drawn++; return true;
}

/* ---------- display smoothing: a crew object's shown position glides from tile to tile within a tick ---------- */
const CL96_SM = new WeakMap();
function cl96Pos(o, r, c, now, mode, perTile) {
  let s = CL96_SM.get(o);
  if (!s) { s = { fr: r, fc: c, tr: r, tc: c, t0: now - 1e4, dr: 1, dc: 1, at: now - 1e4, dur: 300 }; CL96_SM.set(o, s); }
  if (r !== s.tr || c !== s.tc) {
    const p = cl96At(s, now, mode); const dr = r - p[0], dc = c - p[1], l = Math.hypot(dr, dc);
    if (l > 2.6 && !perTile) { s.fr = r; s.fc = c; } else { s.fr = p[0]; s.fc = p[1]; }
    if (l > 1e-3) { s.dr = dr / l; s.dc = dc / l; }
    s.tr = r; s.tc = c; s.t0 = now; s.at = now; s.dur = perTile ? Math.max(300, perTile * l) : 300;
  }
  const p = cl96At(s, now, mode); const moving = mode === 'full' ? now - s.t0 < s.dur : now - s.at < 330;
  return { r: p[0], c: p[1], dr: s.dr, dc: s.dc, moving, s };
}
/* where a glide stands now (linear: a steady walking pace); Fast / Static jump straight to the tile */
function cl96At(s, now, mode) { const k = mode === 'full' ? Math.min(1, Math.max(0, (now - s.t0) / (s.dur || 300))) : 1; return [s.fr + (s.tr - s.fr) * k, s.fc + (s.tc - s.fc) * k]; }
/* the pose row for a walking figure: A · stand · B · stand (Full), A/B per tick (Fast), stand (Static) */
function cl96Cycle(kind, moving, now, mode, ph) {
  const t = now + (ph || 0) * 137;
  if (kind === 'rake') return mode === 'static' ? 'rakeA' : (Math.floor(t / (mode === 'fast' ? 320 : 300)) % 2 ? 'rakeB' : 'rakeA');
  if (!moving || mode === 'static') return kind === 'walk' ? 'stand' : kind + 'A';
  if (kind === 'walk') { if (mode === 'fast') return Math.floor(t / 320) % 2 ? 'walkB' : 'walkA'; return ['walkA', 'stand', 'walkB', 'stand'][Math.floor(t / 150) % 4]; }
  return Math.floor(t / (mode === 'fast' ? 320 : 230)) % 2 ? kind + 'B' : kind + 'A';
}

/* ---------- a small iso frame for props: u along travel, v across, h up (metres) ---------- */
function cl96F(r, c, dr, dc) { const o = center(r, c), a = center(r + dr, c + dc), b = center(r - dc, c + dr); return { o, u: { x: a.x - o.x, y: a.y - o.y }, v: { x: b.x - o.x, y: b.y - o.y }, r, c, dr, dc }; }
function cl96P(F, u, v, h) { return { x: F.o.x + (F.u.x * u + F.v.x * v) * CL96_M, y: F.o.y + (F.u.y * u + F.v.y * v) * CL96_M - h * CL96_H * TW }; }
/* grid point at (u, v) of a frame (for figures placed around a prop) */
function cl96G(F, u, v) { return [F.r + (F.dr * u - F.dc * v) * CL96_M, F.c + (F.dc * u + F.dr * v) * CL96_M]; }
const cl96Poly = (pts) => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath(); };
const cl96Lw = (k) => Math.max(1, TW * k);
/* a wooden wheel standing in the u-h plane: rim, iron tyre, six spokes turned by `roll`, iron hub */
function cl96Wheel(F, v, R, roll) {
  const c = cl96P(F, 0, v, R); const pt = (t, k) => cl96P(F, Math.cos(t) * R * k, v, R + Math.sin(t) * R * k);
  ctx.save(); ctx.lineJoin = 'round';
  ctx.beginPath(); for (let i = 0; i <= 24; i++) { const p = pt(i / 24 * Math.PI * 2, 1); i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); }
  ctx.strokeStyle = '#2a2420'; ctx.lineWidth = cl96Lw(0.05); ctx.stroke(); ctx.strokeStyle = '#6a4a26'; ctx.lineWidth = cl96Lw(0.03); ctx.stroke();
  ctx.strokeStyle = '#4f3a22'; ctx.lineWidth = cl96Lw(0.016); ctx.beginPath();
  for (let k = 0; k < 6; k++) { const p = pt(roll + k * Math.PI / 3, 0.92); ctx.moveTo(c.x, c.y); ctx.lineTo(p.x, p.y); } ctx.stroke();
  ctx.fillStyle = '#3d3a37'; ell(c.x, c.y, cl96Lw(0.03), cl96Lw(0.03)); ctx.fill(); ctx.fillStyle = 'rgba(255,240,210,.35)'; ell(c.x - cl96Lw(0.008), c.y - cl96Lw(0.008), cl96Lw(0.012), cl96Lw(0.012)); ctx.fill();
  ctx.restore();
}
/* a box in the frame, faces shaded by the sun (upper left); far faces first, the lid last */
function cl96Box(F, u0, u1, v0, v1, h0, h1, col) {
  const P = (u, v, h) => cl96P(F, u, v, h);
  const faces = [[[u0, v0], [u1, v0]], [[u1, v0], [u1, v1]], [[u1, v1], [u0, v1]], [[u0, v1], [u0, v0]]].map(([a, b]) => {
    const pts = [P(a[0], a[1], h0), P(b[0], b[1], h0), P(b[0], b[1], h1), P(a[0], a[1], h1)]; return { pts, y: (pts[0].y + pts[1].y) / 2, x: (pts[0].x + pts[1].x) / 2 }; });
  faces.sort((a, b) => a.y - b.y);
  ctx.save(); ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(30,18,8,.85)'; ctx.lineWidth = cl96Lw(0.012);
  const cx = (faces[0].x + faces[3].x) / 2;
  for (const f of faces.slice(2)) { cl96Poly(f.pts); ctx.fillStyle = shade(col, f.x < cx ? -0.22 : -0.38); ctx.fill(); ctx.stroke(); }
  const top = [P(u0, v0, h1), P(u1, v0, h1), P(u1, v1, h1), P(u0, v1, h1)]; cl96Poly(top); ctx.fillStyle = shade(col, 0.06); ctx.fill(); ctx.stroke();
  ctx.restore(); return top;
}
/* the corpse cart: far wheel, bed with planks, the stretcher + shrouded body, near wheel, handles */
function cl96Cart(F, load, roll) {
  const near = cl96P(F, 0, 0.5, 0).y > cl96P(F, 0, -0.5, 0).y ? 0.5 : -0.5;
  cl96Wheel(F, -near, 0.42, roll);
  const top = cl96Box(F, -0.78, 0.78, -0.42, 0.42, 0.5, 0.74, '#8a6238');
  ctx.save(); ctx.strokeStyle = 'rgba(40,24,10,.45)'; ctx.lineWidth = cl96Lw(0.008); ctx.beginPath();
  for (const v of [-0.21, 0, 0.21]) { const a = cl96P(F, -0.78, v, 0.74), b = cl96P(F, 0.78, v, 0.74); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); } ctx.stroke(); ctx.restore();
  if (load) {   /* a stretcher laid across the bed, the body shrouded on it, ringed in its colours */
    ctx.save(); ctx.strokeStyle = '#5e4126'; ctx.lineWidth = cl96Lw(0.022); ctx.lineCap = 'round'; ctx.beginPath();
    for (const v of [-0.26, 0.26]) { const a = cl96P(F, -1.0, v, 0.8), b = cl96P(F, 1.0, v, 0.8); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); } ctx.stroke();
    const blob = (rx, ry, h) => { const p = []; for (let i = 0; i < 20; i++) { const t = i / 20 * Math.PI * 2; p.push(cl96P(F, Math.cos(t) * rx, Math.sin(t) * ry, h)); } return p; };
    cl96Poly(blob(0.72, 0.24, 0.84)); ctx.fillStyle = '#b9ae9b'; ctx.fill();
    cl96Poly(blob(0.66, 0.19, 0.94)); ctx.fillStyle = '#ddd4c4'; ctx.fill(); ctx.strokeStyle = load.c || '#7d6a55'; ctx.lineWidth = cl96Lw(0.022); ctx.stroke();
    const hd = cl96P(F, 0.58, 0, 1.0); ctx.fillStyle = '#e6ddcd'; ell(hd.x, hd.y, cl96Lw(0.05), cl96Lw(0.04)); ctx.fill();
    ctx.strokeStyle = 'rgba(110,20,14,.55)'; ctx.lineWidth = cl96Lw(0.01); ctx.beginPath(); const s1 = cl96P(F, -0.1, 0.05, 0.98), s2 = cl96P(F, 0.15, -0.04, 0.98); ctx.moveTo(s1.x, s1.y); ctx.lineTo(s2.x, s2.y); ctx.stroke();
    ctx.restore();
  }
  cl96Wheel(F, near, 0.42, roll);
  ctx.save(); ctx.strokeStyle = '#5a3f22'; ctx.lineWidth = cl96Lw(0.022); ctx.lineCap = 'round'; ctx.beginPath();
  for (const v of [-0.32, 0.32]) { const a = cl96P(F, -0.7, v, 0.68), b = cl96P(F, -1.12, v, 0.96); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); } ctx.stroke(); ctx.restore();
  return top;
}
/* a column lying along u at height h: a shaded drum, fluting, the visible end */
function cl96Column(F, h, len, R) {
  const pc = (typeof THEME !== 'undefined' && THEME.pillar) || '#ece4d4';
  const A = cl96P(F, -len / 2, 0, h), B = cl96P(F, len / 2, 0, h); const w = R * 2 * CL96_H * TW;
  ctx.save(); ctx.lineCap = 'butt';
  ctx.strokeStyle = 'rgba(40,30,20,.75)'; ctx.lineWidth = w + 2; ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
  ctx.strokeStyle = shade(pc, -0.18); ctx.lineWidth = w; ctx.stroke();
  ctx.strokeStyle = shade(pc, 0.02); ctx.lineWidth = w * 0.55; ctx.beginPath(); ctx.moveTo(A.x, A.y - w * 0.16); ctx.lineTo(B.x, B.y - w * 0.16); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = Math.max(1, w * 0.12); ctx.beginPath(); ctx.moveTo(A.x, A.y - w * 0.3); ctx.lineTo(B.x, B.y - w * 0.3); ctx.stroke();
  ctx.strokeStyle = 'rgba(80,66,48,.35)'; ctx.lineWidth = 1; ctx.beginPath();
  for (const k of [-0.12, 0.12, 0.32]) { ctx.moveTo(A.x, A.y + w * k); ctx.lineTo(B.x, B.y + w * k); } ctx.stroke();
  const end = A.y > B.y ? -len / 2 : len / 2; const e = []; for (let i = 0; i < 18; i++) { const t = i / 18 * Math.PI * 2; e.push(cl96P(F, end, Math.cos(t) * R, h + Math.sin(t) * R)); }
  cl96Poly(e); ctx.fillStyle = shade(pc, -0.06); ctx.fill(); ctx.strokeStyle = 'rgba(40,30,20,.75)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
}
function cl96Rope(a, b, sag) {
  ctx.save(); ctx.strokeStyle = '#8a7048'; ctx.lineWidth = cl96Lw(0.012); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a.x, a.y);
  ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 + (sag || 0), b.x, b.y); ctx.stroke();
  ctx.strokeStyle = 'rgba(40,28,12,.5)'; ctx.lineWidth = Math.max(0.6, TW * 0.004); ctx.setLineDash([2, 2]); ctx.stroke(); ctx.restore();
}
/* the chain between the two chained rakers: iron links sagging between their hands */
function cl96Chain(a, b) {
  const d = Math.hypot(a.x - b.x, a.y - b.y); if (d > TW * 2.4 || d < 2) return;   /* the chain only while they work side by side */
  const n = Math.min(36, Math.max(4, Math.round(d / (TW * 0.05)))); const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 + TW * 0.28;
  ctx.save(); ctx.lineWidth = Math.max(1, TW * 0.01);
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * mx + t * t * b.x, y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * my + t * t * b.y;
    ctx.strokeStyle = i % 2 ? '#2f2c2a' : '#55524e'; ctx.beginPath(); ctx.ellipse(x, y, TW * (i % 2 ? 0.014 : 0.022), TW * (i % 2 ? 0.02 : 0.012), 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

/* ---------- the effects (Full only) ---------- */
function cl96Line(kind, a, b, w) { const L = CL96.lines; L.push({ kind, a, b, w, t0: performance.now() }); if (L.length > 160) L.splice(0, L.length - 160); }
function cl96Dust(r, c, h, n, big) { if (CL96.dust.length > 48) return; const now = performance.now(); for (let i = 0; i < (n || 1); i++) CL96.dust.push({ r: r + (Math.random() - 0.5) * 0.12, c: c + (Math.random() - 0.5) * 0.12, h: h || 0, t0: now, life: (big ? 700 : 520) + Math.random() * 200, k: big ? 1.6 : 1, sx: (Math.random() - 0.5) * 0.5 }); }
/* the blood paint of 07-ui (seeded per splash, so the same shape), faded by a */
function cl96Ghost(B, a) {
  const m = center(B.r, B.c); const R9 = mulberry32(B.seed || 1); const rr = () => R9.next();
  const fa = typeof bloodFade84 === 'function' ? bloodFade84(B) : 1; const sp = 1 + (1 - fa) * 0.12;
  ctx.save(); ctx.globalAlpha = (B.kind === 'drop' ? 0.5 : 0.72) * fa * a;
  ctx.fillStyle = typeof bloodCol84 === 'function' ? bloodCol84(B.kind === 'elim' ? '#6e120c' : '#8a1c14', fa) : B.kind === 'elim' ? '#6e120c' : '#8a1c14';
  const k = B.kind === 'elim' ? 9 : B.kind === 'limb' ? 5 : 2;
  for (let i = 0; i < k; i++) { const an = rr() * Math.PI * 2, d = rr() * (B.kind === 'elim' ? 0.42 : 0.26);
    ell(m.x + Math.cos(an) * TW * d, m.y + Math.sin(an) * TW * d * 0.5, TW * sp * (B.kind === 'drop' ? 0.03 : 0.05 + rr() * 0.06), TW * sp * (B.kind === 'drop' ? 0.018 : 0.03 + rr() * 0.03)); ctx.fill(); }
  if (B.kind === 'elim') { ctx.globalAlpha = 0.6 * fa * a; ell(m.x, m.y, TW * 0.3, TW * 0.15); ctx.fill(); }
  ctx.restore();
}
/* decals: shadows, comb lines, ruts, furrows, fading blood, dust — the ground under the crew */
function cl96Ground(now, mode) {
  ctx.save();
  if (mode === 'full') {
    for (let i = CL96.lines.length - 1; i >= 0; i--) {
      const L = CL96.lines[i], age = now - L.t0, life = L.kind === 'rake' ? 9000 : 7000; if (age > life) { CL96.lines.splice(i, 1); continue; }
      const a = 1 - age / life, A = center(L.a[0], L.a[1]), B = center(L.b[0], L.b[1]); const dx = B.x - A.x, dy = B.y - A.y, l = Math.hypot(dx, dy) || 1;
      const nx = -dy / l, ny = dx / l; const offs = L.kind === 'rake' ? [-2, -1, 0, 1, 2] : L.kind === 'rut' ? [-1, 1] : [0]; const sp = L.kind === 'rake' ? TW * 0.045 : TW * 0.16;
      ctx.lineCap = 'round'; ctx.lineWidth = cl96Lw(L.kind === 'drag' ? 0.03 : 0.012);
      ctx.strokeStyle = `rgba(86,62,34,${(L.kind === 'drag' ? 0.3 : 0.26) * a})`; ctx.beginPath();
      for (const k of offs) { const ox = nx * sp * k, oy = ny * sp * k * 0.6; ctx.moveTo(A.x + ox, A.y + oy); ctx.lineTo(B.x + ox, B.y + oy); } ctx.stroke();
      ctx.strokeStyle = `rgba(255,244,220,${0.16 * a})`; ctx.lineWidth = cl96Lw(0.008); ctx.beginPath();
      for (const k of offs) { const ox = nx * sp * k, oy = ny * sp * k * 0.6 - 1; ctx.moveTo(A.x + ox, A.y + oy); ctx.lineTo(B.x + ox, B.y + oy); } ctx.stroke();
    }
    for (let i = CL96.ghosts.length - 1; i >= 0; i--) { const g = CL96.ghosts[i], a = 1 - (now - g.t0) / 1400; if (a <= 0) { CL96.ghosts.splice(i, 1); continue; } cl96Ghost(g.b, a); }
  }
  /* contact shadows: the sun is upper left, so they fall a little right and down */
  ctx.fillStyle = 'rgba(0,0,0,.26)';
  for (const it of CL96.items) { if (!it.sh) continue; const m = center(it.r, it.c); ell(m.x + TW * 0.03, m.y + TW * 0.015, TW * it.sh, TW * it.sh * 0.42); ctx.fill(); }
  if (mode === 'full') for (let i = CL96.dust.length - 1; i >= 0; i--) {
    const d = CL96.dust[i], t = (now - d.t0) / d.life; if (t >= 1) { CL96.dust.splice(i, 1); continue; }
    const m = center(d.r, d.c); const rad = TW * 0.05 * d.k * (0.5 + t); ctx.fillStyle = `rgba(214,190,146,${0.42 * (1 - t)})`;
    ell(m.x + d.sx * TW * 0.2 * t, m.y - d.h * CL96_H * TW - TW * 0.12 * t * d.k, rad, rad * 0.62); ctx.fill();
  }
  ctx.restore();
}

/* ---------- this frame's crew: grid positions, poses, depths (screen coordinates are taken at paint time) ---------- */
function cl96Fig(fig, row, face, r, c, extra) { return Object.assign({ fig, row, face, r, c, d: dep89(r, c), sh: fig === 'charun' ? 0.2 : 0.16 }, extra || {}); }
function cl96Build(now, mode) {
  const C = S.clean, out = []; if (!C) return out; const ph = CLEAN_ORDER[C.phase]; const full = mode === 'full';
  const fig = (o, r, c, kind, figK, i, opt = {}) => {
    const p = cl96Pos(o, r, c, now, mode); const face = opt.face != null ? opt.face : cl96Face(p.r, p.c, p.dr, p.dc);
    const row = opt.row || cl96Cycle(kind, p.moving, now, mode, i);
    if (full && p.moving && kind !== 'rake' && (row === 'walkA' || row === 'walkB') && p.s.lastRow !== row && Math.random() < 0.35) cl96Dust(p.r, p.c, 0, 1);
    p.s.lastRow = row; const it = cl96Fig(figK || 'slave', row, face, p.r, p.c, opt.it); out.push(it); return { p, it };
  };
  /* the raking pair (+ a third, unchained) and the crew's other jobs */
  if (C.crew && (ph === 'blood' || ph === 'fish' || ph === 'laurels' || ph === 'loot' || ph === 'rubble' || ph === 'pillars')) {
    const kind = ph === 'blood' || ph === 'fish' ? 'rake' : ph === 'pillars' ? 'walk' : 'carry';
    const pair = C.crew.map((cw, i) => fig(cw, cw.r, cw.c, kind, 'slave', i));
    if (pair.length === 2) out.push({ chain: [pair[0].it, pair[1].it], r: 0, c: 0, d: Math.max(pair[0].it.d, pair[1].it.d) + 0.02 });
    if (kind === 'rake') {
      const T = CL96.third || (CL96.third = { hist: [], o: {} }); const a0 = C.crew[0]; const last = T.hist[T.hist.length - 1];
      if (!last || last[0] !== a0.r || last[1] !== a0.c) { T.hist.push([a0.r, a0.c]); if (T.hist.length > 4) T.hist.shift(); }
      const at = T.hist.length > 2 ? T.hist[T.hist.length - 3] : [a0.r + 0.6, a0.c - 0.6];
      fig(T.o, at[0], at[1], 'rake', 'slave', 2);
    } else if (ph === 'rubble' || ph === 'loot' || ph === 'laurels') for (const q of pair) q.it.hold = ph === 'rubble' ? 'stone' : ph === 'loot' ? 'sack' : 'basket';
  }
  /* the carts with a pusher behind each, and their ruts */
  if (ph === 'carts' && C.carts) C.carts.forEach((ct, i) => {
    const p = cl96Pos(ct, ct.r, ct.c, now, mode); const st = p.s; st.roll = (st.roll || 0);
    if (full && p.moving) { const q = st.prevP; if (q) { const dd = Math.hypot(p.r - q[0], p.c - q[1]); st.roll += dd / CL96_M / 0.42; if (dd > 0.06) { cl96Line('rut', q, [p.r, p.c]); st.prevP = [p.r, p.c]; } } else st.prevP = [p.r, p.c]; }
    else st.prevP = [p.r, p.c];
    const F = { r: p.r, c: p.c, dr: p.dr, dc: p.dc }; const g = cl96G(F, -1.62, 0);
    out.push({ cart: { load: ct.load, roll: st.roll }, r: p.r, c: p.c, dr: p.dr, dc: p.dc, d: dep89(p.r, p.c), sh: 0.34 });
    out.push(cl96Fig('slave', cl96Cycle('push', p.moving, now, mode, i + 4), cl96Face(p.r, p.c, p.dr, p.dc), g[0], g[1]));
  });
  /* Charun: walks in, raises the mallet, strikes, drags the fated out (the furrow behind) */
  if (C.ch) {
    const ch = C.ch, st = CL96.strike && CL96.strike.o === ch ? CL96.strike : null; let row = null;
    if (st) { const t = now - st.t0; if (mode === 'static') row = 'strike'; else if (t < 140) row = 'raise'; else if (t < 330) { row = 'strike'; if (!st.dust && full) { st.dust = 1; const p0 = cl96Pos(ch, ch.r, ch.c, now, mode); cl96Dust(p0.r + p0.dr * 0.4, p0.c + p0.dc * 0.4, 0, 4, true); } } }
    const r = fig(ch, ch.r, ch.c, 'walk', 'charun', 7, { row: row || undefined });
    if (full && ch.mode === 'drag' && r.p.moving) { const s = r.p.s; if (s.prevD) { if (Math.hypot(r.p.r - s.prevD[0], r.p.c - s.prevD[1]) > 0.08) { cl96Line('drag', s.prevD, [r.p.r, r.p.c]); s.prevD = [r.p.r, r.p.c]; } } else s.prevD = [r.p.r, r.p.c]; }
  }
  /* the pillars: carried between two bearers / hauled on rollers / dressed by one man with the pots */
  if (C.pil) {
    const j = C.pil, p = cl96Pos(j, j.r, j.c, now, mode); const F = { r: p.r, c: p.c, dr: p.dr, dc: p.dc }; const face = cl96Face(p.r, p.c, p.dr, p.dc);
    if (j.kind === 'carry') {
      out.push({ col: 'carry', r: p.r, c: p.c, dr: p.dr, dc: p.dc, d: dep89(p.r, p.c), sh: 0 });
      for (const [u, k] of [[1.55, 0], [-1.55, 1]]) { const g = cl96G(F, u, 0); out.push(cl96Fig('slave', cl96Cycle('carry', p.moving, now, mode, k), face, g[0], g[1])); }
    } else if (j.kind === 'haul') {
      out.push({ col: 'haul', r: p.r, c: p.c, dr: p.dr, dc: p.dc, d: dep89(p.r, p.c), sh: 0 });
      for (const [v, k] of [[0.42, 0], [-0.42, 1]]) { const g = cl96G(F, 2.1, v); out.push(cl96Fig('slave', cl96Cycle('haul', p.moving, now, mode, k), face, g[0], g[1])); }
      if (full && p.moving) { const s = p.s; if (s.prevD) { if (Math.hypot(p.r - s.prevD[0], p.c - s.prevD[1]) > 0.08) { cl96Line('drag', s.prevD, [p.r, p.c]); s.prevD = [p.r, p.c]; } } else s.prevD = [p.r, p.c]; }
    } else fig(j, j.r, j.c, 'carry', 'slave', 3, { it: { hold: 'pot' } });
  }
  /* a pillar just set back up: shear legs, pulley, a hauler on the rope (1.3 s) */
  for (let i = CL96.raise.length - 1; i >= 0; i--) {
    const R = CL96.raise[i], t = now - R.t0; if (t > 1300 || mode !== 'full') { CL96.raise.splice(i, 1); continue; }
    const F = { r: R.r, c: R.c, dr: 0, dc: 1 }; const g = cl96G(F, 0, 2.3);
    out.push({ frame: { a: Math.min(1, (1300 - t) / 300) }, r: R.r, c: R.c, dr: 0, dc: 1, d: dep89(R.r, R.c) + 0.05, sh: 0 });
    out.push(cl96Fig('slave', t % 460 < 230 ? 'haulA' : 'haulB', cl96Face(R.r, R.c, 1, 0) /* facing away from the pillar along +v */, g[0], g[1], { a: Math.min(1, (1300 - t) / 300) }));
  }
  /* the chest: two bearers at its handles */
  if (ph === 'chest' && S.chest && C.chsDid) {
    const p = cl96Pos(S.chest, S.chest.r, S.chest.c, now, mode === 'full' ? 'fast' : mode); /* the game draws the chest on its tile: the bearers stay with it */ const F = { r: p.r, c: p.c, dr: p.dr, dc: p.dc }; const face = cl96Face(p.r, p.c, p.dr, p.dc);
    for (const [v, k] of [[0.62, 0], [-0.62, 1]]) { const g = cl96G(F, 0, v); out.push(cl96Fig('slave', cl96Cycle('carry', p.moving, now, mode, k), face, g[0], g[1])); }
  }
  /* the overseer */
  cl96Guard(out, now, mode, ph);
  return out;
}
function cl96Guard(out, now, mode, ph) {
  const work = CL96_WORK.has(ph) && out.some(it => it.fig === 'slave');
  let G = CL96.guard; if (!G && !work) return;
  if (!G) {
    let r = 0, c = 0, n = 0; for (const it of out) if (it.fig === 'slave') { r += it.r; c += it.c; n++; } r /= n; c /= n;
    G = CL96.guard = { o: {}, r: Math.min(N - 1, Math.max(0, Math.round(r + 2))), c: Math.min(N - 1, Math.max(0, Math.round(c - 2))), a: 0, t0: now, crackAt: now + 2500 + Math.random() * 2500, crack: 0 };
  }
  G.a = Math.max(0, Math.min(1, G.a + (work ? 1 : -1) * (mode === 'full' ? 0.12 : 1)));
  if (!work && G.a <= 0) { CL96.guard = null; return; }
  /* keep an eye on the crew: about two tiles off their middle, re-placed only when they have moved on */
  let r = 0, c = 0, n = 0; for (const it of out) if (it.fig === 'slave') { r += it.r; c += it.c; n++; }
  if (n) { r /= n; c /= n; const tr = Math.min(N - 1, Math.max(0, Math.round(r + 1.6))), tc = Math.min(N - 1, Math.max(0, Math.round(c - 1.6)));
    if (Math.hypot(tr - G.r, tc - G.c) > 2.6) { G.r = tr; G.c = tc; } G.lr = r; G.lc = c; }
  const p = cl96Pos(G.o, G.r, G.c, now, mode, 520);
  let row, face;
  if (p.moving) { row = mode === 'full' ? ['walkA', 'walkB'][Math.floor(now / 200) % 2] : 'walkA'; face = cl96Face(p.r, p.c, p.dr, p.dc); }
  else {
    face = G.lr != null ? cl96Face(p.r, p.c, G.lr - p.r, G.lc - p.c) : 0; row = 'idle';
    if (mode === 'full') {
      if (now > G.crackAt) { G.crack = now; G.crackAt = now + 3500 + Math.random() * 3000; G.dusted = 0; }
      if (now - G.crack < 380) { row = 'crack'; if (!G.dusted && now - G.crack > 160) { G.dusted = 1; const Y = [0, 45, 90, 135, 180, -135, -90, -45][face] * Math.PI / 180;
        /* the lash tip lands ~1.6 m ahead: screen dir → grid (iso inverse of a unit step) */
        const sx = Math.sin(Y), sy = Math.cos(Y) / 2; const a = center(0, 0), b = center(0, 1), d = center(1, 0); const ux = b.x - a.x, uy = b.y - a.y, vx = d.x - a.x, vy = d.y - a.y;
        const det = ux * vy - uy * vx || 1; const kc = (sx * vy - sy * vx) / det, kr = (ux * sy - uy * sx) / det; const l = Math.hypot(kc, kr) || 1;
        cl96Dust(p.r + kr / l * 0.68, p.c + kc / l * 0.68, 0, 3); } }
    }
  }
  out.push(cl96Fig('guard', row, face, p.r, p.c, { a: G.a }));
}
/* one item, painted with the pieces */
function cl96Paint(it) {
  const m = center(it.r, it.c);
  if (it.fig) {
    const ok = cl96Spr(it.fig, it.row, it.face, m.x, m.y, it.a);
    if (ok && it.hold) {   /* what a carrier holds in front of him: a stone, a sack, a basket of laurels, a pot */
      const Y = [0, 45, 90, 135, 180, -135, -90, -45][it.face] * Math.PI / 180; const x = m.x + Math.sin(Y) * TW * 0.12, y = m.y - TW * 0.4 + Math.cos(Y) * TW * 0.05;
      const front = Math.cos(Y) > -0.2; if (front) {
        ctx.save(); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(30,20,10,.8)';
        if (it.hold === 'stone') { ctx.fillStyle = '#b8ad98'; ctx.beginPath(); ctx.rect(x - TW * 0.07, y - TW * 0.05, TW * 0.14, TW * 0.08); ctx.fill(); ctx.stroke(); }
        else if (it.hold === 'sack') { ctx.fillStyle = '#a08a62'; ell(x, y, TW * 0.07, TW * 0.06); ctx.fill(); ctx.stroke(); }
        else if (it.hold === 'basket') { ctx.fillStyle = '#9a7442'; ell(x, y, TW * 0.08, TW * 0.045); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#5f8a3a'; ell(x, y - TW * 0.025, TW * 0.06, TW * 0.028); ctx.fill(); }
        else { ctx.fillStyle = '#9a5a34'; ell(x, y, TW * 0.06, TW * 0.055); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#7a4424'; ctx.fillRect(x - TW * 0.025, y - TW * 0.08, TW * 0.05, TW * 0.03); }
        ctx.restore(); }
    }
    return;
  }
  if (it.chain) { const [a, b] = it.chain; const ma = center(a.r, a.c), mb = center(b.r, b.c); cl96Chain({ x: ma.x, y: ma.y - TW * 0.42 }, { x: mb.x, y: mb.y - TW * 0.42 }); return; }
  const F = cl96F(it.r, it.c, it.dr, it.dc);
  if (it.cart) { cl96Cart(F, it.cart.load, it.cart.roll); return; }
  if (it.col === 'carry') {
    cl96Column(F, 0.86, 2.6, 0.27);
    for (const u of [1.55, -1.55]) cl96Rope(cl96P(F, u * 0.78, 0, 0.98), cl96P(F, u, 0.25, 0.86), TW * 0.03);
    return;
  }
  if (it.col === 'haul') {
    ctx.save(); ctx.fillStyle = '#5e4126'; for (const u of [-0.5, 0.45]) { const a = cl96P(F, u, -0.3, 0.06), b = cl96P(F, u, 0.3, 0.06); ctx.strokeStyle = '#5e4126'; ctx.lineWidth = cl96Lw(0.05); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } ctx.restore();
    cl96Column(F, 0.32, 2.6, 0.27);
    for (const v of [0.42, -0.42]) cl96Rope(cl96P(F, 1.3, 0, 0.4), cl96P(F, 2.0, v, 1.36), TW * 0.05);
    return;
  }
  if (it.frame) {   /* shear legs over the pillar, a pulley at the top, the rope to the hauler */
    ctx.save(); ctx.globalAlpha *= it.frame.a; ctx.lineCap = 'round';
    const top = cl96P(F, 0, 0, 3.2), l1 = cl96P(F, -0.55, -1.0, 0), l2 = cl96P(F, 0.55, -1.0, 0), h1 = cl96P(F, 0, 2.2, 1.36);
    ctx.strokeStyle = '#3b2814'; ctx.lineWidth = cl96Lw(0.04); ctx.beginPath(); ctx.moveTo(l1.x, l1.y); ctx.lineTo(top.x, top.y); ctx.lineTo(l2.x, l2.y); ctx.stroke();
    ctx.strokeStyle = '#7a5530'; ctx.lineWidth = cl96Lw(0.025); ctx.stroke();
    ctx.fillStyle = '#4a4744'; ell(top.x, top.y, cl96Lw(0.04), cl96Lw(0.04)); ctx.fill(); ctx.fillStyle = '#9a9894'; ell(top.x, top.y, cl96Lw(0.016), cl96Lw(0.016)); ctx.fill();
    ctx.restore(); ctx.save(); ctx.globalAlpha *= it.frame.a;
    cl96Rope(top, cl96P(F, 0, 0, 2.1), 0); cl96Rope(top, h1, TW * 0.06); ctx.restore();
  }
}

/* ---------- hooks ---------- */
/* the comb lines: each raker's rake head (≈1.05 m ahead of him) leaves its trail */
function cl96Rakes(now) {
  for (const it of CL96.items) if (it.fig === 'slave' && it.row && it.row.startsWith('rake')) {
    const Y = [0, 45, 90, 135, 180, -135, -90, -45][it.face] * Math.PI / 180;
    const a = center(0, 0), b = center(0, 1), d = center(1, 0); const ux = b.x - a.x, uy = b.y - a.y, vx = d.x - a.x, vy = d.y - a.y;
    const sx = Math.sin(Y), sy = Math.cos(Y) / 2; const det = ux * vy - uy * vx || 1; let kc = (sx * vy - sy * vx) / det, kr = (ux * sy - uy * sx) / det; const l = Math.hypot(kc, kr) || 1;
    const hr = it.r + kr / l * 0.45, hc = it.c + kc / l * 0.45;
    const H = CL96.heads || (CL96.heads = []);
    let best = null, bd = 0.6; for (const h of H) { const dd = Math.hypot(h[0] - hr, h[1] - hc); if (dd < bd) { bd = dd; best = h; } }
    if (best) { if (bd > 0.07) { cl96Line('rake', [best[0], best[1]], [hr, hc]); best[0] = hr; best[1] = hc; best[2] = now; if (Math.random() < 0.3) cl96Dust(hr, hc, 0, 1); } else best[2] = now; }
    else H.push([hr, hc, now]);
  }
  if (CL96.heads) CL96.heads = CL96.heads.filter(h => now - h[2] < 700);
}
{ const base = draw; draw = function () {
    if (!(S && S.clean && S.clean.crew && S.pillars) || HEADLESS) return base.apply(this, arguments);
    const mode = cl96Mode(); if (mode === 'off') { CL96.items = []; return base.apply(this, arguments); }
    const t0 = performance.now();
    try { if (typeof rot89Now === 'function') rot89Now(); } catch (e) { /* the view stays as it was */ }
    let extra = [];
    try {
      CL96.items = cl96Build(t0, mode); if (mode === 'full') cl96Rakes(t0);
      extra = CL96.items.filter(it => !it.skip).map((it, i) => ({ id: 'cl96_' + i, cl96: it, r: it.r, c: it.c, d89: it.d, pots: [] }));
      S.pillars.push(...extra);
    } catch (e) { CL96.items = []; extra = []; }
    CL96.drawn = 0;
    try { return base.apply(this, arguments); }
    finally {
      if (S && S.pillars && extra.length) S.pillars = S.pillars.filter(x => !x.cl96);
      CL96.frames++; CL96.ms += performance.now() - t0;
      if (mode === 'full') cl96Kick();
    }
  }; }
{ const base = drawPillar; drawPillar = function (pl) { if (pl && pl.cl96) { try { cl96Paint(pl.cl96); } catch (e) { /* one bad item never stops the board */ } return; } return base.apply(this, arguments); }; }
{ const base = drawCleanCrew; drawCleanCrew = function () {
    const mode = cl96Mode(); if (mode === 'off' || !CL96.items.length) return base.apply(this, arguments);
    try { cl96Ground(performance.now(), mode); } catch (e) { /* ground work is decoration */ }
  }; }
/* the rAF loop for smooth walking (Full only): ≤16 fps, stops with the show, a hidden tab, the city, the menu or idle */
function cl96Kick() {
  if (CL96.raf) return;
  const tick = (t) => {
    CL96.raf = 0;
    if (!S || !S.clean || cl96Mode() !== 'full' || document.hidden) return;
    if (typeof CITY !== 'undefined' && CITY && CITY.open) return;
    const mm = document.getElementById('mainMenu'); if (mm && !mm.hidden) return;
    if (document.body.classList.contains('idle92')) return;
    /* what a frame really costs here (script + raster: the gap to the next frame after one we drew), so the loop never takes more
       than ~a quarter of the main thread — the show's own 320 ms tick must keep its pace on a slow machine */
    if (CL96.drawnAt) { const cost = t - CL96.drawnAt; CL96.cost = CL96.cost ? CL96.cost * 0.7 + cost * 0.3 : cost; CL96.drawnAt = 0; }
    const gap = Math.max(66, (CL96.cost || 16) * 4);
    if (t - CL96.last >= gap) { CL96.last = t; CL96.drawnAt = 0; try { draw(); } catch (e) { /* the tick still draws */ } CL96.drawnAt = performance.now(); if (!CL96.raf) CL96.raf = requestAnimationFrame(tick); return; }
    CL96.raf = requestAnimationFrame(tick);
  };
  CL96.raf = requestAnimationFrame(tick);
}
/* removed blood fades under the rakes */
{ const base = CLEAN_PH.blood; CLEAN_PH.blood = function (C) {
    const before = (S.blood || []).slice(); const r = base.apply(this, arguments);
    try { if (cl96Mode() === 'full') { const left = new Set(S.blood || []), now = performance.now(); for (const b of before) if (!left.has(b)) { CL96.ghosts.push({ b, t0: now }); cl96Dust(b.r, b.c, 0, 2); } } } catch (e) { /* cosmetic */ }
    return r; }; }
/* Charun's blow when he reaches the fated */
{ const base = CLEAN_PH.charun; CLEAN_PH.charun = function (C) {
    const ch = C.ch, was = ch && ch.mode; const r = base.apply(this, arguments);
    try { if (ch && was === 'in' && ch.mode === 'drag') CL96.strike = { o: ch, t0: performance.now() }; } catch (e) { /* cosmetic */ }
    return r; }; }
/* a pillar set back on its plinth: the shear legs go up for a moment */
{ const base = CLEAN_PH.pillars; CLEAN_PH.pillars = function (C) {
    const j = C.pil; const r = base.apply(this, arguments);
    try { if (j && j.kind === 'carry' && !C.pil && j.ip) { CL96.raise.push({ r: j.ip.r, c: j.ip.c, t0: performance.now() }); if (cl96Mode() === 'full') cl96Dust(j.ip.r, j.ip.c, 0, 4, true); } } catch (e) { /* cosmetic */ }
    return r; }; }
/* a new show: fresh effects, the sheets start decoding at once */
{ const base = startCleanCrew; startCleanCrew = function () {
    if (!HEADLESS) { try { cl96Ready(); } catch (e) { /* loads later */ } }
    CL96.lines = []; CL96.ghosts = []; CL96.dust = []; CL96.guard = null; CL96.third = null; CL96.strike = null; CL96.raise = []; CL96.heads = []; CL96.items = [];
    return base.apply(this, arguments); }; }
/* 55-anim's crew for a speared spectator (and any other drawSlave9 caller): the slave sprite, facing the way he walks */
{ const base = drawSlave9; const last = []; let frameKey = -1, idx = 0;
  drawSlave9 = function (m, withRake) {
    const mode = cl96Mode(); if (mode === 'off' || !m) return base.apply(this, arguments);
    const fk = CL96.frames + (typeof LAYERS93 !== 'undefined' ? LAYERS93.frames * 1e4 : 0); if (fk !== frameKey) { frameKey = fk; idx = 0; }
    const i = idx++; const L = last[i] || (last[i] = { x: m.x, y: m.y, face: 0 }); const dx = m.x - L.x, dy = m.y - L.y;
    if (Math.hypot(dx, dy) > 0.6) { L.face = cl96Yaw(dx, dy); L.mv = performance.now(); } L.x = m.x; L.y = m.y;
    const now = performance.now(), moving = now - (L.mv || 0) < 200;
    const row = withRake ? cl96Cycle('rake', true, now, mode, i) : cl96Cycle('walk', moving, now, mode, i);
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.24)'; ell(m.x + TW * 0.03, m.y + TW * 0.015, TW * 0.16, TW * 0.066); ctx.fill(); ctx.restore();
    if (!cl96Spr('slave', row, L.face, m.x, m.y)) return base.apply(this, arguments);
  }; }
