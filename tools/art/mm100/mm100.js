/* =====================================================================
   tools/art/mm100/mm100.js — v1.0 MAIN MENU SHOW sprites (build time only, driven by make.js through mm100.html).
   Renders exactly the poses the menu show (src/ui/282-v100menu.js) draws, at the show's drawn size, one strip per actor:
     • gladiators: the PRODUCTION rig92 token (tools/art/rig92/game.js createToken + the pre-baked printed pieces assets/gear100.js),
       each printed class's real loadout (the game's own t93Parts, read by make.js from the built page) + a look per class;
     • beasts, Tholo, Commodus: the NEWEST look-test beast rigs (tools/plans/look100/beastN_rig.js + beastN_hum.js), loaded as
       patched copies (make.js decides which file; the patches only expose the yaw list and the render scale);
   Every cell is cropped to its own alpha box; the strip meta gives [x, w, h, anchorX, anchorY] per cell (anchor = base centre).
   ===================================================================== */
import * as THREE from 'three';
import { createToken } from '../rig92/game.js';
import { MM_PER_M, BASE_H } from '../rig92/rig.js';
const D2R = Math.PI / 180;

/* ---------------- gladiator frames (anim_rig.js look-test frames, copied: idle, walk, attack, hit) ---------------- */
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
const ATTACK = [
  F([0, -120, -30], { pe: [4, -20, 0], sp: [4, -8, 0], ch: [0, -10, 0], he: [-6, 16, 0], wR: [-30, 0, 0] }, { L: [150, 230, 6], R: [-150, -230, -36] }, { L: [200, 1150, 350], R: [-330, 1250, -200] }),
  F([0, -150, 40], { pe: [8, 6, 0], sp: [8, 8, 0], ch: [4, 10, 0], he: [-10, 0, 0], wR: [0, 0, 0] }, { L: [150, 320, 6], R: [-140, -300, -36] }, { L: [260, 1080, 150], R: [-120, 1400, 520] }),
  F([0, -200, 70], { pe: [8, -22, 0], sp: [10, -10, 0], ch: [6, -8, 0], he: [-14, 14, 0], wR: [60, 0, 0] }, { L: [140, 360, 6], R: [-130, -340, -38] }, { L: [200, 1180, 230], R: [-70, 1240, 720] }, { L: [1, -1, -0.2], R: [1, -1, 0] }),
];
const HIT = [
  F([0, -60, -60], { sp: [-14, 0, 6], ch: [-10, 0, 4], he: [-22, 12, 0] }, { L: [140, 60, 10], R: [-140, -200, -20] }, { L: [330, 1150, 120], R: [-380, 1000, -60] }),
  F([20, -120, -120], { pe: [0, 6, 6], sp: [-6, 0, 10], he: [12, -10, 0] }, { L: [160, -120, 10], R: [-120, -260, -20] }, { L: [260, 920, 100], R: [-300, 840, 0] }),
];
/* the show's cells per gladiator: [name, yaw, spec or preset key]. Walk at 60° (screen right; the page mirrors it for the left). */
const WALK_Y = 60, DUEL_Y = 60;
export const GLAD_CELLS = [['walk0', WALK_Y, walk(0)], ['walk1', WALK_Y, walk(2)], ['walk2', WALK_Y, walk(3)], ['walk3', WALK_Y, walk(5)],
  ['idle0', 0, ready(0, 0, 4, 0)], ['idle1', 0, ready(8, 14, 0, 14)], ['flex', 0, '@victory'], ['hit0', 0, HIT[0]], ['hit1', 0, HIT[1]]];
export const DUEL_CELLS = [['atk0', DUEL_Y, ATTACK[0]], ['atk1', DUEL_Y, ATTACK[1]], ['atk2', DUEL_Y, ATTACK[2]], ['kneel', DUEL_Y, '@kneel']];

/* ---------------- shared: crop + pack ---------------- */
function alphaBox(c) { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; }
/* one cell: crop a canvas to its alpha box (+1 px), anchor kept relative */
function crop(c, AX, AY, name) { const b = alphaBox(c); if (b[2] < 0) throw new Error('empty cell ' + name);
  const x0 = Math.max(0, b[0] - 1), y0 = Math.max(0, b[1] - 1), w = Math.min(c.width, b[2] + 2) - x0, h = Math.min(c.height, b[3] + 2) - y0;
  const o = document.createElement('canvas'); o.width = w; o.height = h; o.getContext('2d').drawImage(c, x0, y0, w, h, 0, 0, w, h);
  return { name, c: o, ax: +(AX - x0).toFixed(1), ay: +(AY - y0).toFixed(1) }; }
/* cells → one horizontal strip (1 px gap) as WebP + meta */
function pack(cells, q) { const W = cells.reduce((s, x) => s + x.c.width + 1, 0), H = Math.max(...cells.map(x => x.c.height));
  const o = document.createElement('canvas'); o.width = W; o.height = H; const g = o.getContext('2d'); let x = 0; const meta = {};
  for (const k of cells) { g.drawImage(k.c, x, 0); meta[k.name] = [x, k.c.width, k.c.height, k.ax, k.ay]; x += k.c.width + 1; }
  const url = o.toDataURL('image/webp', q); const png = o.toDataURL('image/png');
  return { url, png, meta, w: W, h: H, bytes: Math.round((url.length - url.indexOf(',') - 1) * 0.75), decoded: W * H * 4 }; }

/* ---------------- gladiators: the production token ---------------- */
let TOK = null, REND = null;
async function tok() { if (!TOK) TOK = await createToken({ scale: 1.15 }); return TOK; }   /* v1.02: the v1.0 figure size (the board tokens moved to FIG_SCALE) */
function renderer(w, h) { if (!REND) { REND = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); REND.outputColorSpace = THREE.SRGBColorSpace; REND.setClearColor(0x000000, 0); REND.setPixelRatio(1); }
  REND.setSize(w, h, false); return REND; }
/* render cells [name, yaw, spec|'@preset'] of the token as it is dressed now, at pxmm (×2 supersampled) */
async function renderTok(T, list, pxmm) {
  const { scene, turn, B } = T._dbg; const sun = scene.children.find(x => x.isDirectionalLight); const ss = 2, ppm = pxmm * MM_PER_M * ss, S = Math.ceil(3.4 * ppm / 4) * 4;
  const target = new THREE.Vector3(0, 0.85, 0), hw = S / 2 / ppm; const cam = new THREE.OrthographicCamera(-hw, hw, hw, -hw, 0.01, 50);
  cam.position.set(0, target.y + Math.sin(30 * D2R) * 10, Math.cos(30 * D2R) * 10); cam.lookAt(target); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  const dir = new THREE.Vector3(-0.55, 0.85, 0.55).applyQuaternion(cam.quaternion); sun.position.copy(cam.position).add(dir.multiplyScalar(5));
  sun.target.position.copy(cam.position).add(new THREE.Vector3(0, 0, -10).applyQuaternion(cam.quaternion)); sun.target.updateMatrixWorld();
  B.setOutline(0.85 * ss / ppm); const r = renderer(S, S);
  const anc = new THREE.Vector3(0, -BASE_H, 0).project(cam);   /* anchor = the base's bottom centre, like minis8 */ const AX = (anc.x * 0.5 + 0.5) * S / ss, AY = (-anc.y * 0.5 + 0.5) * S / ss;
  const out = [];
  for (const [name, yaw, spec] of list) {
    if (typeof spec === 'string') { const p = T.presets.find(x => x[0] === spec.slice(1)); if (!p) throw new Error('no preset ' + spec); T.setPose(p[2]); }
    else T.setPose(T.specPose(spec));
    turn.rotation.y = yaw * D2R; turn.updateMatrixWorld(true); r.render(scene, cam);
    let c = document.createElement('canvas'); c.width = S; c.height = S; c.getContext('2d').drawImage(r.domElement, 0, 0);
    const d = document.createElement('canvas'); d.width = S / 2; d.height = S / 2; const g = d.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, 0, d.width, d.height);
    out.push(crop(d, AX, AY, name)); turn.rotation.y = 0; turn.updateMatrixWorld(true); await new Promise(ok => setTimeout(ok, 0));
  }
  return out;
}
window.MM100R = {
  /* one class: look + the game's gear → { g: strip, d: duel strip } */
  async glad(cls, look, gear, pxmm, q) { const T = await tok(); T.apply({ look, gear });
    const g = pack(await renderTok(T, GLAD_CELLS, pxmm), q), d = pack(await renderTok(T, DUEL_CELLS, pxmm), q);
    return { g, d, baked: T.baked, bakeWhy: T.bakeWhy }; },
  /* the escort soldier's plain probe: height of idle0 at pxmm (to fit the show's size) */
  async probe(look, gear, pxmm) { const T = await tok(); T.apply({ look, gear }); const c = (await renderTok(T, [['idle0', 0, ready(0, 0, 4, 0)]], pxmm))[0]; return { w: c.c.width, h: c.c.height, ax: c.ax, ay: c.ay }; },
  /* a look-test sheet (rows = frames, columns = yaws, uniform cells w×h with anchor ax,ay) → named cells: pick = [[name, row, col], …] */
  cut(png, meta, pick) { return new Promise((ok, no) => { const im = new Image(); im.onload = () => { const [w, h, ax, ay] = meta; const out = [];
      for (const [name, row, col] of pick) { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(im, col * w, row * h, w, h, 0, 0, w, h); out.push(crop(c, ax, ay, name)); }
      ok(out); }; im.onerror = no; im.src = png; }); },
  pack,
  /* a patched copy of a look-test module (relative imports made absolute; extra lines appended; replacements checked) */
  async patched(url, reps, tail) { let s = await (await fetch(url)).text(); const miss = [];
    for (const [a, b] of reps) { if (!s.includes(a)) miss.push(a); s = s.split(a).join(b); }
    if (miss.length) throw new Error('PATCH POINTS MISSING in ' + url + ': ' + miss.join(' | ') + ' — update tools/art/mm100/make.js for the new beast rig');
    s = s.replace(/(from\s+|import\(\s*)(['"])(\.\.?\/[^'"]+)\2/g, (m, a, q, p) => a + q + new URL(p, new URL(url, location.href)).href + q);
    s += '\n' + (tail || ''); const bu = URL.createObjectURL(new Blob([s], { type: 'text/javascript' })); return import(bu); },
};
window.MM100R_READY = true;
