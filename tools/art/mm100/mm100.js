/* =====================================================================
   tools/art/mm100/mm100.js — MAIN MENU SHOW sprites (build time only, driven by make.js through mm100.html).
   Renders exactly the poses the menu show (src/ui/282-v100menu.js) draws, one strip per actor, from TODAY'S board figures:
     • gladiators: the game's own token (assets/three93.js + gear100.js + body100.js + tok93.js — the files 222/311 load, FIG_SCALE 1.0 =
       80% of a pillar, 336) wearing each printed class's real loadout (t93Parts, read by make.js from the built page) + its look, posed
       with 311's ANIM100_LIB rows (AN100L.ROWS: the v1.01 creep walk, idle, hit, the 323/G10 slash / sweep / thrust / throw rows) and the
       token's own presets (victory, kneel). tok93.js is loaded as a patched copy: the ONE patch lets sheetAsync take a yaw list
       (so.yaws) instead of rendering all 8 MINI_YAW facings — it FAILS LOUDLY when the line moved;
     • beasts, Tholo, Commodus: the board's rigs (tools/plans/look100/beastN_rig.js + beastN_hum.js — the files tools/art/anim100b/make.js
       renders the board sheets from, with SIZE102 / SIZE103 / SLIM103 / k102), loaded as patched copies (the yaw list and the render
       scale only), at the board's size relative to the gladiators (window.MM100_PXB: round bases + humanoids = the gladiators' px/mm,
       long bases fit 1.1 tile like 312 bst100Scale).
   NO BASES (B38, his call 2026-10-17): every figure is rendered without its base; the anchor is where the feet stand (the old base top),
   the show draws a soft contact shadow there (282 mm100Spr).
   Every cell is cropped to its own alpha box; the strip meta gives [x, w, h, anchorX, anchorY] per cell (anchor = the feet's ground point).
   ===================================================================== */
const D2R = Math.PI / 180;

/* ---------------- the game's own token + poses ---------------- */
const YAW_A = 'for (const yaw of MINI_YAW) {\n      lightFor(cam);', YAW_B = 'for (const yaw of (s.yaws || MINI_YAW)) {\n      lightFor(cam);';
let LIB = null, AN = null, API = null;
async function lib() { if (LIB) return LIB;
  let s = await (await fetch('../../../assets/tok93.js')).text();
  if (!s.includes(YAW_A)) throw new Error('PATCH POINT MISSING in assets/tok93.js (sheetSteps yaw loop) — update tools/art/mm100/mm100.js');
  s = s.replace(YAW_A, YAW_B); (0, eval)(s); LIB = window.TOK93LIB(window.THREE93); return LIB; }
async function an100() { if (AN) return AN; const src = await (await fetch('../../../src/board/311-v100anim.js')).text();
  const a = src.indexOf('/* ANIM100_LIB:BEGIN'), b = src.indexOf('/* ANIM100_LIB:END */');
  if (a < 0 || b < 0) throw new Error('ANIM100_LIB markers missing in src/board/311-v100anim.js');
  AN = new Function(src.slice(a, b) + ';return AN100L')(); return AN; }
async function tok() { if (!API) { await lib(); await an100(); API = await LIB.createToken({}); } return API; }
const cp = (o) => JSON.parse(JSON.stringify(o));
/* idle1 = 311's idle stance with a small weight shift (the menu's group photo breathes; the board holds idle0) */
function shift(spec) { const o = cp(spec); o.p = [(o.p[0] || 0) + 14, (o.p[1] || 0) + 8, o.p[2] || 0]; o.j = Object.assign({}, o.j, { sp: [0, 4, 0] });
  o.h = Object.assign({}, o.h, { L: [o.h.L[0], o.h.L[1] + 14, o.h.L[2]] }); return o; }
/* the duel row per class: spears / tridents thrust, the rest slash (311 an100AtkRow; blades pick at random there, a fixed pick here) */
const atkRow = (wt) => /spear|trident|pilum|hasta|lance|pike|fork/i.test(String(wt || '')) ? 'thrust' : 'slash';
/* the show's cells per gladiator: [name, yaw, spec | '@preset']. Walk at 60° (screen right; the page mirrors it for the left). */
const WALK_Y = 60, DUEL_Y = 60;
function gladCells(R) { return [['walk0', WALK_Y, R.walk[0]], ['walk1', WALK_Y, R.walk[2]], ['walk2', WALK_Y, R.walk[4]], ['walk3', WALK_Y, R.walk[6]],
  ['idle0', 0, R.idle[0]], ['idle1', 0, shift(R.idle[0])], ['flex', 0, '@victory'], ['hit0', 0, R.hit[0]], ['hit1', 0, R.hit[1]]]; }
function duelCells(R, row) { const A = R[row]; return [['atk0', DUEL_Y, A[0]], ['atk1', DUEL_Y, A[1]], ['atk2', DUEL_Y, A[2]], ['kneel', DUEL_Y, '@kneel']]; }

/* ---------------- shared: crop + pack ---------------- */
function alphaBox(c) { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; }
/* one cell: crop a canvas to its alpha box (+1 px), anchor kept relative */
function crop(c, AX, AY, name) { const b = alphaBox(c); if (b[2] < 0) throw new Error('empty cell ' + name);
  const x0 = Math.max(0, b[0] - 1), y0 = Math.max(0, b[1] - 1), w = Math.min(c.width, b[2] + 2) - x0, h = Math.min(c.height, b[3] + 2) - y0;
  if (b[0] === 0 || b[1] === 0 || b[2] === c.width - 1) console.error('cell ' + name + ' touches the render box edge (clipped?)');
  const o = document.createElement('canvas'); o.width = w; o.height = h; o.getContext('2d').drawImage(c, x0, y0, w, h, 0, 0, w, h);
  return { name, c: o, ax: +(AX - x0).toFixed(1), ay: +(AY - y0).toFixed(1) }; }
/* the topmost opaque pixel of a cell, from its anchor (Commodus's raised blade tip → 282 MM100_TIP) */
function topPt(k) { const b = alphaBox(k.c); const d = k.c.getContext('2d').getImageData(0, b[1], k.c.width, 1).data; let xs = 0, n = 0;
  for (let x = 0; x < k.c.width; x++) if (d[x * 4 + 3] > 8) { xs += x; n++; } return [Math.round(xs / n - k.ax), Math.round(b[1] - k.ay)]; }
/* cells → one horizontal strip (1 px gap) as WebP + meta */
function pack(cells, q) { const W = cells.reduce((s, x) => s + x.c.width + 1, 0), H = Math.max(...cells.map(x => x.c.height));
  const o = document.createElement('canvas'); o.width = W; o.height = H; const g = o.getContext('2d'); let x = 0; const meta = {};
  for (const k of cells) { g.drawImage(k.c, x, 0); meta[k.name] = [x, k.c.width, k.c.height, k.ax, k.ay]; x += k.c.width + 1; }
  const url = o.toDataURL('image/webp', q); const png = o.toDataURL('image/png');
  const r = { url, png, meta, w: W, h: H, bytes: Math.round((url.length - url.indexOf(',') - 1) * 0.75), decoded: W * H * 4 };
  const ra = cells.find(k => k.name === 'raise'); if (ra) r.tip = topPt(ra); return r; }

/* render cells [name, yaw, spec|'@preset'] of the dressed token at pxmm (the game's sheetAsync, ×2 supersampled, one yaw each) */
/* B38 (his call 2026-10-17 "default the main menu show to no bases"): the base is hidden and the anchor moves from the base bottom up to
   the base TOP (where the feet stand): BASE_H = 3.2 mm seen at the sheet's 30° elevation */
const BASE_TOP_MM = 3.2 * Math.cos(30 * D2R);
function baseG(api) { const g = (api._dbg && api._dbg.baseG) || api.baseG; if (!g) throw new Error('tok93 baseG not found — update tools/art/mm100/mm100.js'); return g; }
async function renderTok(api, list, pxmm, keepBase) { const out = []; const bg = baseG(api); bg.visible = !!keepBase;
  try {
  for (const [name, yaw, spec] of list) {
    if (typeof spec === 'string') { const p = api.presets.find(x => x[0] === spec.slice(1)); if (!p) throw new Error('no preset ' + spec); api.setPose(p[2]); }
    else api.setPose(api.specPose(spec));
    const r = await api.sheetAsync({ pxmm, ss: 2, fit: false, yaws: [yaw] }); const [w, , ax, ay] = r.meta;
    if (r.canvas.width !== w) throw new Error('the yaw patch did not take (sheet ' + r.canvas.width + ' px wide, cell ' + w + ')');
    out.push(crop(r.canvas, ax, keepBase ? ay : ay - BASE_TOP_MM * pxmm, name)); }
  } finally { bg.visible = true; }
  try { api.setPose(api.presets[0][2]); } catch (e) {}
  return out; }
window.MM100R = {
  /* one class: look + the game's gear → { g: strip, d: duel strip } */
  async glad(cls, look, gear, pxmm, q) { const api = await tok(); api.apply({ look, gear, pose: api.presets[0][2] }); const R = AN.ROWS;
    const g = pack(await renderTok(api, gladCells(R), pxmm), q), row = atkRow(gear && gear.wR && gear.wR.t), d = pack(await renderTok(api, duelCells(R, row), pxmm), q);
    return { g, d, row, baked: !!api.baked, fig: LIB.FIG_SCALE }; },
  /* the soldier's plain probe: height of idle0 at pxmm (to fit the show's size) */
  async probe(look, gear, pxmm) { const api = await tok(); api.apply({ look, gear, pose: api.presets[0][2] });
    const c = (await renderTok(api, [['idle0', 0, AN.ROWS.idle[0]]], pxmm, true))[0]; /* with its base: the show's scale stays the v1.05 one */ return { w: c.c.width, h: c.c.height, ax: c.ax, ay: c.ay, fig: LIB.FIG_SCALE }; },
  /* a look-test sheet (rows = frames, columns = yaws, uniform cells w×h with anchor ax,ay) → named cells: pick = [[name, row, col], …] */
  cut(png, meta, pick) { return new Promise((ok, no) => { const im = new Image(); im.onload = () => { const [w, h, ax, ay] = meta; const out = [];
      for (const [name, row, col] of pick) { if (row < 0 || col < 0) { no(new Error('frame missing for cell ' + name)); return; }
        const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(im, col * w, row * h, w, h, 0, 0, w, h); out.push(crop(c, ax, ay, name)); }
      ok(out); }; im.onerror = no; im.src = png; }); },
  pack,
  /* a patched copy of a look-test module (relative imports made absolute; extra lines appended; replacements checked) → the module, or its blob URL (asUrl) */
  async patched(url, reps, tail, asUrl) { let s = await (await fetch(url)).text(); const miss = [];
    for (const [a, b] of reps) { if (!s.includes(a)) miss.push(a); s = s.split(a).join(b); }
    if (miss.length) throw new Error('PATCH POINTS MISSING in ' + url + ': ' + miss.join(' | ') + ' — update tools/art/mm100/make.js for the new beast rig');
    s = s.replace(/(from\s+|import\(\s*)(['"])(\.\.?\/[^'"]+)\2/g, (m, a, q, p) => a + q + new URL(p, new URL(url, location.href)).href + q);
    s += '\n' + (tail || ''); const bu = URL.createObjectURL(new Blob([s], { type: 'text/javascript' })); return asUrl ? bu : import(bu); },
};
window.MM100R_READY = true;
