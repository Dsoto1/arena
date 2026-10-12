/* =====================================================================
   tools/art/crowd100/crowd100.js — v1.0 THE 3D CROWD sprites (build time only, driven by make.js through crowd100.html).
   Renders, with the PRODUCTION rig92 token (tools/art/rig92/game.js createToken + assets/gear100.js / body100.js):
     • 6 spectator LOOKS (his look test round 2, tools/plans/look100/anim_rig.js SPEC2_LOOKS): the tunic in a KEY grey (recoloured
       in the game at draw time, src/313-v100crowd.js), two of them with a cream toga + coloured border; no base, no bench (the tier is
       the bench). Poses (rows): sit · sitcheer · sitfist · stand · standcheer · standfist · walk0..3, 4 facings (the board's diagonals).
       The darker painted tone (brightness .8, contrast 1.14, saturation .88) is baked in.
     • the 8 printed classes as forum stand-ins (guards = the soldier, gladiators by class): stand + walk0..3, 4 facings, no base.
   Every cell is cropped to its alpha box and packed in a shelf grid (rows = poses); meta per cell [x, y, w, h, ax, ay, hx, hy]:
   anchor ax,ay = the SEAT point for sitting rows, the FEET for upright rows; hx,hy = the top of the head (for the regular's laurel).
   Space as rig92: metres, y up, the figure faces +z. Yaw 45 = faces screen down-right (the iso board's diagonals).
   ===================================================================== */
import * as THREE from 'three';
import { createToken } from '../rig92/game.js';
import { MM_PER_M } from '../rig92/rig.js';
const D2R = Math.PI / 180;
export const YAWS = [45, 135, -135, -45];

/* ---------------- poses (the look test's, round 2) ---------------- */
const HP0 = { L: [1, -0.6, -0.3], R: [1, -1, -0.3] };
const F = (p, j, f, h, hp, ex) => Object.assign({ p, j, f, h, hp: hp || HP0 }, ex || {});
const ready = (dy = 0, dx = 0, sp = 4, sh = 0) => F([dx, -55 + dy, 0], { pe: [4, -10, 0], sp: [sp, 4, 0], he: [-4, 4, 0], wR: [-20, 0, 0] },
  { L: [140, 100, 10], R: [-140, -90, -28] }, { L: [240, 1060 + sh, 260], R: [-210, 990, 280] });
function walk(t) {
  const sw = [60, 30, 0, -60, -30, 0][t], twist = [6, 4, 0, -6, -4, 0][t];
  const feet = [{ L: [115, 220, 6], R: [-115, -220, -10] }, { L: [115, 140, 6], R: [-115, -250, -10] }, { L: [115, 10, 6] },
    { L: [115, -220, 6], R: [-115, 220, -10] }, { L: [115, -250, 6], R: [-115, 140, -10] }, { R: [-115, 10, -10] }][t];
  const j = { pe: [3, twist, 0], sp: [5, -twist, 0], he: [-5, 0, 0], wR: [-20, 0, 0] };
  if (t === 2) Object.assign(j, { hR: [-32, 0, 0], kR: [62, 0, 0], aR: [-10, 0, 0] });
  if (t === 5) Object.assign(j, { hL: [-32, 0, 0], kL: [62, 0, 0], aL: [-10, 0, 0] });
  const py = [-50, -72, -28, -50, -72, -28][t];
  return F([0, py, 0], j, feet, { L: [235, 1080, 270 - sw * 0.4], R: [-220, 1010, 220 + sw] });
}
/* townsfolk walking: empty hands swinging */
function townWalk(t) { const w = walk([0, 2, 3, 5][t]); const sw = [1, 0, -1, 0][t]; w.h = { L: [210, 880, 120 * sw], R: [-210, 880, -120 * sw] }; w.hp = { L: [1, -1, -0.2], R: [1, -1, -0.2] }; delete w.j.wR; return w; }
/* seated: the pelvis lowered onto the tier edge, thighs forward, shins hanging over the edge (no bench drawn) */
const SEAT = (cheer, fist) => ({ p: [0, -455, -120], j: { hL: [-84, 0, 4], kL: [84, 0, 0], hR: [-84, 0, -4], kR: [84, 0, 0], he: cheer ? [-14, 0, 0] : [4, 0, 0] }, f: {},
  h: cheer ? { L: [250, 1500, -20], R: [-250, 1500, -20] } : fist ? { L: [140, 620, 160], R: [-230, 1420, 20] } : { L: [120, 600, 170], R: [-120, 600, 170] },
  hp: cheer ? { L: [1, 0, -1], R: [1, 0, -1] } : { L: [1, -1, -0.3], R: [1, -1, -0.3] } });
const STANDP = (cheer, fist) => ({ p: [0, -6, 0], j: { he: cheer ? [-16, 0, 0] : [0, 0, 0], sL: [-4, 0, -12], eL: [-14, 0, 0], sR: [-4, 0, 12], eR: [-14, 0, 0] }, f: { L: [118, -10, 8], R: [-118, -10, -8] },
  h: cheer ? { L: [300, 2050, 80], R: [-300, 2050, 80] } : fist ? { L: [140, 900, 120], R: [-260, 2000, 60] } : undefined,
  hp: cheer ? { L: [1, 0, -0.6], R: [1, 0, -0.6] } : fist ? { L: [1, -1, -0.3], R: [1, 0, -0.6] } : { L: [1, 0, -0.6], R: [1, 0, -0.6] } });
/* rows: [name, spec, anchor kind] — 's' seat, 'u' upright (feet) */
export const SPEC_ROWS = [['sit', SEAT(0, 0), 's'], ['sitcheer', SEAT(1, 0), 's'], ['sitfist', SEAT(0, 1), 's'], ['stand', STANDP(0, 0), 'u'], ['standcheer', STANDP(1, 0), 'u'],
  ['standfist', STANDP(0, 1), 'u'], ['walk0', townWalk(0), 'u'], ['walk1', townWalk(1), 'u'], ['walk2', townWalk(2), 'u'], ['walk3', townWalk(3), 'u']];
export const CLS_ROWS = [['stand', ready(0, 0, 4, 0), 'u'], ['walk0', walk(0), 'u'], ['walk1', walk(2), 'u'], ['walk2', walk(3), 'u'], ['walk3', walk(5), 'u']];
/* base looks: the tunic in a KEY grey (recoloured at runtime), togas cream with a coloured border; hair never grey (the key) */
export const SPEC_LOOKS = [
  { look: { skin: '#c99a72', hair: '#2a1d14', hs: 'crop', bs: 'full' }, tunic: '#d8d8d8', toga: null },
  { look: { skin: '#e0b48e', hair: '#6a3b18', hs: 'curly' }, tunic: '#d8d8d8', toga: null },
  { look: { skin: '#a8754e', hair: '#141010', hs: 'long', fem: 1, band: '#e8dcc0' }, tunic: '#d8d8d8', toga: null },
  { look: { skin: '#d8a882', hair: '#4a2c18', hs: 'crop', bs: 'stubble' }, tunic: '#d8d8d8', toga: '#efe3c0', border: '#7a1e2a' },
  { look: { skin: '#8a5a3a', hair: '#121010', hs: 'curly', bs: 'goatee' }, tunic: '#d8d8d8', toga: null },
  { look: { skin: '#e8c0a0', hair: '#9a5a2a', hs: 'long', fem: 1, band: '#3a6ab0' }, tunic: '#d8d8d8', toga: '#efe3c0', border: '#c9a23e' },
];
const SHADE = 'brightness(0.8) contrast(1.14) saturate(0.88)';   /* the darker painted tone of his minis */

/* ---------------- helpers ---------------- */
let TOK = null, REND = null, DRESS = [];
async function tok() { if (!TOK) TOK = await createToken({}); return TOK; }
function renderer(w, h) { if (!REND) { REND = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); REND.outputColorSpace = THREE.SRGBColorSpace; REND.setClearColor(0x000000, 0); REND.setPixelRatio(1); }
  REND.setSize(w, h, false); return REND; }
function alphaBox(c) { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; }
function crop(c, AX, AY, HX, HY, name) { const b = alphaBox(c); if (b[2] < 0) throw new Error('empty cell ' + name);
  const x0 = Math.max(0, b[0] - 1), y0 = Math.max(0, b[1] - 1), w = Math.min(c.width, b[2] + 2) - x0, h = Math.min(c.height, b[3] + 2) - y0;
  const o = document.createElement('canvas'); o.width = w; o.height = h; o.getContext('2d').drawImage(c, x0, y0, w, h, 0, 0, w, h);
  return { name, c: o, ax: +(AX - x0).toFixed(1), ay: +(AY - y0).toFixed(1), hx: +(HX - x0).toFixed(1), hy: +(HY - y0).toFixed(1) }; }
/* rows of cells → one shelf-packed sheet (1 px gaps) as WebP + meta {rows:{name:[[x,y,w,h,ax,ay,hx,hy] per facing]}} */
/* withMask: a second copy of the grid to the RIGHT (x + W + 1) holding only the grey-keyed cloth as white (the game multiplies a tint
   through it — canvas compositing, no pixel reads, so it also works on file:// pages) */
function pack(rows, q, withMask) { const W = Math.max(...rows.map(r => r.cells.reduce((s, x) => s + x.c.width + 1, 0))), H = rows.reduce((s, r) => s + Math.max(...r.cells.map(x => x.c.height)) + 1, 0);
  const o = document.createElement('canvas'); o.width = withMask ? W * 2 + 1 : W; o.height = H; const g = o.getContext('2d', { willReadFrequently: true }); let y = 0; const meta = {};
  for (const r of rows) { let x = 0; const rh = Math.max(...r.cells.map(k => k.c.height)); meta[r.name] = r.cells.map(k => { g.drawImage(k.c, x, y); const m = [x, y, k.c.width, k.c.height, k.ax, k.ay, k.hx, k.hy];
      if (withMask) { const d = k.c.getContext('2d').getImageData(0, 0, k.c.width, k.c.height); const p = d.data; let n = 0;
        for (let i = 0; i < p.length; i += 4) { const a = p[i + 3]; const mx = Math.max(p[i], p[i + 1], p[i + 2]), mn = Math.min(p[i], p[i + 1], p[i + 2]);
          /* the key grey under the warm sun: r ≥ g ≥ b with blue ≥ 0.78 red (skin ≤ 0.7, the cream toga ≈ 0.72, leather far below) */
          const r = p[i], gg = p[i + 1], bb = p[i + 2]; void mn;
          if (a && mx >= 55 && bb >= 0.78 * r && gg >= 0.86 * r && gg <= r + 6 && bb <= gg + 6) { p[i] = p[i + 1] = p[i + 2] = 255; n++; } else p[i + 3] = 0; }
        const t = document.createElement('canvas'); t.width = k.c.width; t.height = k.c.height; t.getContext('2d').putImageData(d, 0, 0); g.drawImage(t, W + 1 + x, y); m.push(n); }
      x += k.c.width + 1; return m; }); y += rh + 1; }
  const url = o.toDataURL('image/webp', q), png = o.toDataURL('image/png');
  return { url, png, meta, w: o.width, h: H, mx: withMask ? W + 1 : 0, bytes: Math.round((url.length - url.indexOf(',') - 1) * 0.75), decoded: o.width * H * 4 }; }
const wp = (o) => { const v = new THREE.Vector3(); o.updateWorldMatrix(true, false); o.getWorldPosition(v); return v; };

/* render rows [name, spec, kind] at pxmm (×2 supersampled), 4 facings each */
async function renderRows(T, rows, pxmm, o = {}) {
  const { scene, turn, B } = T._dbg; const rig = T.rig; const sun = scene.children.find(x => x.isDirectionalLight); const ss = 2, ppm = pxmm * MM_PER_M * ss, S = Math.ceil((o.box || 3.4) * ppm / 4) * 4;
  const target = new THREE.Vector3(0, o.ty != null ? o.ty : 0.95, 0), hw = S / 2 / ppm; const cam = new THREE.OrthographicCamera(-hw, hw, hw, -hw, 0.01, 50);
  cam.position.set(0, target.y + Math.sin(30 * D2R) * 10, Math.cos(30 * D2R) * 10); cam.lookAt(target); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  const dir = new THREE.Vector3(-0.55, 0.85, 0.55).applyQuaternion(cam.quaternion); sun.position.copy(cam.position).add(dir.multiplyScalar(5));
  sun.target.position.copy(cam.position).add(new THREE.Vector3(0, 0, -10).applyQuaternion(cam.quaternion)); sun.target.updateMatrixWorld();
  B.setOutline(0.85 * ss / ppm); const r = renderer(S, S);
  const proj = (v) => { const p = v.clone().project(cam); return [(p.x * 0.5 + 0.5) * S / ss, (-p.y * 0.5 + 0.5) * S / ss]; };
  const out = [];
  for (const [name, spec, kind] of rows) { T.setPose(T.specPose(spec)); const cells = [];
    for (const yaw of YAWS) { turn.rotation.y = yaw * D2R; turn.updateMatrixWorld(true); r.render(scene, cam);
      /* the anchor: sitting = under the pelvis (the buttocks on the tier edge); upright = the feet on the ground */
      let A; if (kind === 's') { const pe = wp(rig.bones.pe), hL = wp(rig.bones.hL), hR = wp(rig.bones.hR); const v = new THREE.Vector3((hL.x + hR.x) / 2, Math.min(hL.y, hR.y) - 0.1 * T._dbg.B.group.scale.y, (hL.z + hR.z) / 2); A = proj(v); void pe; }
      else A = proj(new THREE.Vector3(0, 0, 0));
      const he = wp(rig.bones.he); const Hd = proj(new THREE.Vector3(he.x, he.y + 0.14 * B.group.scale.y, he.z));
      let c = document.createElement('canvas'); c.width = S; c.height = S; c.getContext('2d').drawImage(r.domElement, 0, 0);
      const d = document.createElement('canvas'); d.width = S / 2; d.height = S / 2; const g = d.getContext('2d'); g.imageSmoothingQuality = 'high'; if (o.shade) g.filter = o.shade; g.drawImage(c, 0, 0, d.width, d.height);
      cells.push(crop(d, A[0], A[1], Hd[0], Hd[1], name + '@' + yaw)); await new Promise(ok => setTimeout(ok, 0)); }
    out.push({ name, kind, cells }); }
  turn.rotation.y = 0; turn.updateMatrixWorld(true); return { rows: out, ppm: ppm / ss };
}

/* ---------------- dressing: tunics / togas for spectators (look test round 2) ---------------- */
function undress(B) { for (const m of DRESS) B.kit.kill(m); DRESS = []; }
function dressSpec(B, V) {
  undress(B); const K = B.kit, GI = K.GI;
  B.setLook(Object.assign({}, V.look, { noHarness: true, cloth: V.tunic }));
  B.group.traverse(o => { if (o.name === 'sandals' || o.name === 'sandals_ink') o.visible = true; });
  const mat = (col) => { const m = K.maskedMat(); m.color.set(col); m.userData.ownMat = 1; return m; };
  const fold = (p) => { const f = Math.sin(p[0] * 60 + p[1] * 22) * 0.5 + 0.5; return [0.82 + 0.18 * f, 0.82 + 0.18 * f, 0.82 + 0.18 * f]; };
  DRESS.push(K.shellFrom('tun100', (p, g) => {
    if (g === GI.T) return Math.min(p[1] - 0.7, 1.52 - p[1] + 0.0, 0.03);
    if (g === GI.LL || g === GI.LR) return Math.min(p[1] - 0.66, 0.03);
    if (g === GI.AL || g === GI.AR) return Math.min(Math.abs(p[0]) < 0.36 ? 0.03 : -1, p[1] - 1.3);
    return -1;
  }, fold, 0.009, { mat: mat(V.tunic) }));
  if (V.toga) {
    DRESS.push(K.shellFrom('toga100', (p, g) => {
      if (g === GI.AL) return Math.min(p[1] - 1.2, 0.03);
      if (g === GI.LL || g === GI.LR) return Math.min(p[1] - 0.5, 0.03);
      if (g !== GI.T) return -1; if (p[1] < 0.6 || p[1] > 1.56) return -1;
      const bare = (-p[0]) * 0.95 + (p[1] - 1.18) * 1.0 - 0.03; return Math.min(-bare, 0.03);
    }, (p) => { const f = Math.sin(p[0] * 40 - p[1] * 38) * 0.5 + 0.5; return [0.8 + 0.2 * f, 0.8 + 0.2 * f, 0.8 + 0.2 * f]; }, 0.017, { mat: mat(V.toga), hem: { w: 0.02, col: V.border, bw: 0.006, bcol: V.border } }));
  }
}

window.CROWD100R = {
  /* one spectator look (index into SPEC_LOOKS) */
  async look(i, pxmm, q) { const T = await tok(); const { B, baseG } = T; baseG.visible = false; T.apply({ look: {}, gear: {} }); dressSpec(B, SPEC_LOOKS[i]);
    const t0 = performance.now(); const R = await renderRows(T, SPEC_ROWS, pxmm, { box: 3.6, ty: 0.95, shade: SHADE }); undress(B);
    const P = pack(R.rows, q, true); return Object.assign(P, { ppm: +R.ppm.toFixed(3), kinds: Object.fromEntries(R.rows.map(r => [r.name, r.kind])), ms: Math.round(performance.now() - t0), baked: T.baked, bodyBaked: T.bodyBaked, bodyWhy: T.bodyWhy }); },
  /* one printed class stand-in: look + the game's gear */
  async cls(look, gear, pxmm, q) { const T = await tok(); T.baseG.visible = false; T.apply({ look, gear });
    const t0 = performance.now(); const R = await renderRows(T, CLS_ROWS, pxmm, { box: 4.2, ty: 0.95, shade: SHADE });
    const P = pack(R.rows, q); return Object.assign(P, { ppm: +R.ppm.toFixed(3), kinds: Object.fromEntries(R.rows.map(r => [r.name, r.kind])), ms: Math.round(performance.now() - t0), baked: T.baked }); },
};
window.CROWD100R_READY = true;
