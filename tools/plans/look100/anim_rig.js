/* =====================================================================
   look100/anim_rig.js — v1.0 LOOK TEST (not game code). Driven by anim_make.js through anim_rig.html.
   Renders, with the rig92 token modeller (tools/art/rig92, imported read-only):
     • a murmillo token's animation rows (idle, walk, attack, block, hit, limp, cower, push, topple, knock, fall, severed)
       in the minis8 sheet format (one ROW per frame × 8 MINI_YAW cells, base on), like the clean-up crew (clean96);
     • a retiarius (the clip's target + the rete thrower);
     • a modelled spider (4 gait frames × 8 facings);
     • rig92 spectators (seated / standing / cheering, tunics + togas, varied colours, no base).
   Space as rig92: metres, y up, the figure faces +z, its left is +x; h targets / feet in mm (see rig92/README.md).
   ===================================================================== */
import * as THREE from 'three';
import { createToken } from '../../art/rig92/game.js';
import { resolveSpec, MM_PER_M } from '../../art/rig92/rig.js';

const MINI_YAW = [0, 45, 90, 135, 180, -135, -90, -45];
const D2R = Math.PI / 180;
let TOK, B, GM, PROPS, REND, WOUND = null, BASE = null, BENCH = null;
const TIMES = { render: 0, post: 0, cells: 0 };

/* ---------------- the murmillo's frames ---------------- */
const RD = { L: [240, 1060, 260], R: [-210, 990, 280] }, HP0 = { L: [1, -0.6, -0.3], R: [1, -1, -0.3] };
const F = (p, j, f, h, hp, ex) => Object.assign({ p, j, f, h, hp: hp || HP0 }, ex || {});
const ready = (dy = 0, dx = 0, sp = 4, sh = 0) => F([dx, -55 + dy, 0], { pe: [4, -10, 0], sp: [sp, 4, 0], he: [-4, 4, 0], wR: [-20, 0, 0] },
  { L: [140, 100, 10], R: [-140, -90, -28] }, { L: [240, 1060 + sh, 260], R: [-210, 990, 280] });
const UP = (j) => j;   /* a swinging (unpinned) leg: FK eulers in j */
function walk(t) {   /* 6 frames: contact L, load, pass (R swings), contact R, load, pass (L swings) */
  const sw = [60, 30, 0, -60, -30, 0][t], twist = [6, 4, 0, -6, -4, 0][t];
  const feet = [{ L: [115, 220, 6], R: [-115, -220, -10] }, { L: [115, 140, 6], R: [-115, -250, -10] }, { L: [115, 10, 6] },
    { L: [115, -220, 6], R: [-115, 220, -10] }, { L: [115, -250, 6], R: [-115, 140, -10] }, { R: [-115, 10, -10] }][t];
  const j = { pe: [3, twist, 0], sp: [5, -twist, 0], he: [-5, 0, 0], wR: [-20, 0, 0] };
  if (t === 2) Object.assign(j, { hR: [-32, 0, 0], kR: [62, 0, 0], aR: [-10, 0, 0] });
  if (t === 5) Object.assign(j, { hL: [-32, 0, 0], kL: [62, 0, 0], aL: [-10, 0, 0] });
  const py = [-50, -72, -28, -50, -72, -28][t];
  return F([0, py, 0], j, feet, { L: [235, 1080, 270 - sw * 0.4], R: [-220, 1010, 220 + sw] });
}
const GLAD_ROWS = [
  ['idle', [ready(0, 0, 4, 0), ready(4, 8, 2, 8), ready(8, 14, 0, 14), ready(4, 6, 2, 6)], 'idle breathing + weight shift (n19)'],
  ['walk', [0, 1, 2, 3, 4, 5].map(walk), 'walk cycle (animated tokens)'],
  ['attack', [
    F([0, -120, -30], { pe: [4, -20, 0], sp: [4, -8, 0], ch: [0, -10, 0], he: [-6, 16, 0], wR: [-30, 0, 0] }, { L: [150, 230, 6], R: [-150, -230, -36] }, { L: [200, 1150, 350], R: [-330, 1250, -200] }),
    F([0, -100, 0], { pe: [0, -26, 0], sp: [-2, -10, 0], ch: [-4, -12, 0], he: [-8, 20, 0], wR: [-40, 0, 0] }, { L: [150, 230, 6], R: [-150, -230, -36] }, { L: [220, 1180, 330], R: [-300, 1650, -60] }, { L: [1, -0.6, -0.3], R: [1, 0.3, -0.6] }),
    F([0, -150, 40], { pe: [8, 6, 0], sp: [8, 8, 0], ch: [4, 10, 0], he: [-10, 0, 0], wR: [0, 0, 0] }, { L: [150, 320, 6], R: [-140, -300, -36] }, { L: [260, 1080, 150], R: [-120, 1400, 520] }),
    F([0, -200, 70], { pe: [8, -22, 0], sp: [10, -10, 0], ch: [6, -8, 0], he: [-14, 14, 0], wR: [60, 0, 0] }, { L: [140, 360, 6], R: [-130, -340, -38] }, { L: [200, 1180, 230], R: [-70, 1240, 720] }, { L: [1, -1, -0.2], R: [1, -1, 0] }),
    ready(-10, 0, 6, 0)], 'attack: wind-up, raise, slash, thrust, recover (n19)'],
  ['block', [ready(-20, 0, 6, 60),
    F([0, -130, -10], { pe: [6, -24, 0], sp: [12, 12, 0], ch: [8, 10, 0], he: [-16, 4, 0], wL: [0, 60, 0], wR: [-40, 0, 0] }, { L: [165, 200, 10], R: [-170, -180, -40] }, { L: [-10, 1300, 340], R: [-240, 1540, -90] }, { L: [1, -0.5, -0.2], R: [1, 0.2, -1] }),
    F([0, -235, -20], { pe: [16, -12, 0], sp: [16, 0, 0], ch: [6, 0, 0], he: [-24, 6, 0], wL: [0, 60, 0], wR: [-20, 0, 0] }, { L: [180, 300, 10], R: [-200, -300, -32] }, { L: [160, 1180, 440], R: [-210, 940, 200] }, { L: [0, 0, -1], R: [1, -1, -0.3] })],
    'block: shield up, brace (n19)'],
  ['hit', [
    F([0, -60, -60], { sp: [-14, 0, 6], ch: [-10, 0, 4], he: [-22, 12, 0] }, { L: [140, 60, 10], R: [-140, -200, -20] }, { L: [330, 1150, 120], R: [-380, 1000, -60] }),
    F([20, -120, -120], { pe: [0, 6, 6], sp: [-6, 0, 10], he: [12, -10, 0] }, { L: [160, -120, 10], R: [-120, -260, -20] }, { L: [260, 920, 100], R: [-300, 840, 0] }),
    F([0, -110, -20], { sp: [16, 0, 0], ch: [6, 0, 0], he: [-6, 0, 0] }, { L: [150, 80, 10], R: [-150, -120, -20] }, { L: [220, 1100, 250], R: [-220, 950, 200] })],
    'hit / recoil (n19 injured)'],
  ['limp', [
    F([40, -70, 0], { pe: [4, 0, 8], sp: [16, 0, -8], ch: [10, 0, -6], he: [18, 0, 6], wR: [40, 0, 0] }, { L: [170, 60, 12], R: [-110, 150, -6] }, { L: [120, 1110, 110], R: [-320, 780, 60] }, { L: [1, -0.6, -0.4], R: [1, -0.6, -0.4] }),
    F([55, -105, 0], { pe: [4, 0, 12], sp: [18, 0, -10], ch: [10, 0, -6], he: [22, 0, 8], wR: [40, 0, 0] }, { L: [170, 60, 12], R: [-110, 100, -6] }, { L: [130, 1080, 110], R: [-330, 740, 40] }, { L: [1, -0.6, -0.4], R: [1, -0.6, -0.4] }),
    F([30, -60, 30], { pe: [4, 0, 4], sp: [14, 0, -6], ch: [8, 0, -4], he: [14, 0, 4], wR: [40, 0, 0] }, { L: [170, 220, 12], R: [-110, 40, -6] }, { L: [120, 1120, 160], R: [-320, 790, 90] }, { L: [1, -0.6, -0.4], R: [1, -0.6, -0.4] }),
    F([35, -75, 20], { pe: [4, 0, 6], sp: [15, 0, -7], ch: [9, 0, -5], he: [16, 0, 5], wR: [40, 0, 0] }, { L: [170, 180, 12], R: [-110, 120, -6] }, { L: [120, 1110, 140], R: [-320, 770, 80] }, { L: [1, -0.6, -0.4], R: [1, -0.6, -0.4] })],
    'injured limp, sword dragging (n19 injured)'],
  ['cower', [
    F([0, -120, -60], { sp: [10, 0, 0], he: [20, 0, 0] }, { L: [150, 60, 10], R: [-150, -120, -20] }, { L: [170, 1480, 330], R: [-190, 1350, 300] }, { L: [1, -1, 0], R: [1, -1, 0] }),
    F([0, -330, -80], { pe: [25, 0, 0], sp: [25, 0, 0], ch: [10, 0, 0], he: [30, 0, 0] }, { L: [170, 150, 10], R: [-170, -60, -20] }, { L: [130, 1330, 330], R: [-130, 1300, 330] }, { L: [1, -1, 0], R: [1, -1, 0] }),
    F([0, -280, -60], { pe: [20, 0, 0], sp: [20, 0, 0], he: [-5, 0, 0] }, { L: [170, 150, 10], R: [-170, -60, -20] }, { L: [200, 1250, 380], R: [-180, 1000, 200] })],
    'scared cower, peek (n19 scared)'],
  ['push', [
    F([0, -120, 0], { sp: [10, 0, 0] }, { L: [150, 180, 6], R: [-150, -200, -20] }, { L: [180, 1250, 350], R: [-180, 1250, 350] }, { L: [1, -1, -0.2], R: [1, -1, -0.2] }),
    F([0, -150, 60], { sp: [20, 0, 0], ch: [8, 0, 0], he: [-14, 0, 0] }, { L: [150, 250, 6], R: [-150, -330, -20] }, { L: [170, 1250, 560], R: [-170, 1250, 560] }, { L: [1, -1, -0.2], R: [1, -1, -0.2] }),
    F([0, -200, 110], { pe: [15, 0, 0], sp: [24, 0, 0], he: [-24, 0, 0] }, { L: [150, 300, 6], R: [-140, -420, -20] }, { L: [160, 1200, 650], R: [-160, 1200, 650] }, { L: [1, -1, -0.2], R: [1, -1, -0.2] }),
    F([0, -170, 140], { sp: [18, 0, 0], he: [-18, 0, 0] }, { L: [150, 380, 6], R: [-150, -300, -20] }, { L: [170, 1280, 760], R: [-170, 1280, 760] }, { L: [1, -1, -0.2], R: [1, -1, -0.2] })],
    'push: set, contact, drive, follow-through (n19 push)'],
  ['topple', [
    F([0, -260, -30], { pe: [20, -30, 0], sp: [18, -10, 0], he: [-20, 20, 0] }, { L: [170, 200, 10], R: [-170, -200, -20] }, { L: [150, 1100, 300], R: [-200, 950, 150] }),
    F([0, -200, 120], { pe: [18, -40, 0], sp: [16, -20, 0], he: [-20, 26, 0] }, { L: [150, 320, 10], R: [-150, -350, -20] }, { L: [150, 1250, 250], R: [-260, 1100, 300] }),
    F([0, -180, 140], { sp: [10, 0, 0], he: [-24, 0, 0] }, { L: [150, 300, 10], R: [-150, -420, -20] }, { L: [180, 1700, 550], R: [-180, 1700, 550] }, { L: [1, -0.4, -0.4], R: [1, -0.4, -0.4] }),
    F([0, -150, 180], { sp: [22, 0, 0], he: [-14, 0, 0] }, { L: [150, 420, 10], R: [-150, -250, -20] }, { L: [200, 1350, 650], R: [-200, 1350, 650] }, { L: [1, -1, -0.2], R: [1, -1, -0.2] })],
    'topple a pillar: set, shoulder, heave, stumble (n19 pillars)'],
  ['knock', [
    F([0, -180, 0], { pe: [8, 25, 0], sp: [8, 10, 0], he: [-10, -10, 0], wR: [-20, 0, 0] }, { L: [150, 150, 10], R: [-150, -150, -20] }, { L: [220, 1150, 250], R: [-350, 850, -150] }),
    F([0, -60, 60], { pe: [0, -15, 0], sp: [-8, -6, 0], ch: [-10, -6, 0], he: [-25, 0, 0], wR: [-40, 0, 0] }, { L: [150, 250, 10], R: [-150, -150, -20] }, { L: [230, 1150, 250], R: [-150, 1950, 450] }, { L: [1, -0.6, -0.3], R: [1, 0.2, -0.6] }),
    F([0, -80, 40], { pe: [0, -25, 0], sp: [-4, -10, 0], he: [-18, -10, 0], wR: [-40, 0, 0] }, { L: [150, 250, 10], R: [-150, -150, -20] }, { L: [260, 1100, 200], R: [150, 1800, 250] }, { L: [1, -0.6, -0.3], R: [1, 0.2, -0.6] })],
    'knock a pot off a pillar: wind, swipe up, follow (n19 pots)'],
];
const KNEEL = { L: [150, 330, 6], R: [-130, -380, -10] };
const LIMBS = { hL: [0, 0, 8], hR: [0, 0, -8], sL: [10, 0, 70], sR: [10, 0, -70], eL: [-30, 0, 0], eR: [-30, 0, 0], he: [0, 40, 0] };
const FALL_ROWS = [
  ['fall', [
    F([0, -80, -90], { sp: [-20, 0, 0], ch: [-14, 0, 0], he: [-30, 0, 0] }, { L: [140, 60, 10], R: [-140, -200, -20] }, { L: [420, 1250, -50], R: [-420, 1250, -50] }, { L: [1, 0, -1], R: [1, 0, -1] }),
    F([0, -400, -20], { sp: [10, 0, 0], he: [20, 0, 0] }, KNEEL, { L: [250, 720, 150], R: [-260, 660, 100] }),
    F([0, -470, -60], { pe: [20, 0, 0], sp: [30, 0, 0], ch: [15, 0, 0], he: [30, 0, 0] }, KNEEL, { L: [200, 520, 350], R: [-200, 470, 300] }),
    F([0, -470, -60], { pe: [20, 0, 0], sp: [30, 0, 0], ch: [15, 0, 0], he: [30, 0, 0] }, KNEEL, { L: [200, 520, 350], R: [-200, 470, 300] }, null, { rot: 48, piv: [0, 0, 0.32] }),
    { p: [0, 0, 0], j: LIMBS, f: {}, rot: 90, lift: 0.17, dz: -0.85 }],
    'fall / die: struck, knees buckle, slump, topple, lying (n19 + die)'],
  ['sever', [
    F([0, -60, -60], { sp: [-14, 0, 6], ch: [-10, 0, 4], he: [-22, 12, 0] }, { L: [140, 60, 10], R: [-140, -200, -20] }, { L: [330, 1150, 120], R: [-380, 1000, -60] }),
    F([0, -90, -60], { sp: [-6, 8, 0], ch: [-4, 10, 0], he: [14, 20, 0] }, { L: [140, 60, 10], R: [-140, -200, -20] }, { L: [-110, 1220, 260], R: [-330, 1150, 80] }, { L: [1, -1, -0.2], R: [1, -1, -0.2] }, { sever: 1 }),
    F([40, -90, 0], { pe: [4, 0, 8], sp: [16, 0, -8], ch: [10, 0, -6], he: [18, 0, 6] }, { L: [170, 60, 12], R: [-110, 150, -6] }, { L: [140, 1050, 180], R: [-300, 1080, 40] }, null, { sever: 1 })],
    'severed limb: hit, forearm gone + clutch, stagger (n19 limbs)'],
];
/* the retiarius: rete in the LEFT hand, trident in the right */
const RET_ROWS = [
  ['ridle', [F([0, -55, 0], { pe: [4, 10, 0], sp: [4, -4, 0], he: [-4, -4, 0] }, { L: [140, 100, 10], R: [-140, -90, -28] }, { L: [260, 1000, 250], R: [-220, 1100, 260] })]],
  ['rete', [
    F([0, -130, -40], { pe: [4, -30, 0], sp: [4, -16, 0], ch: [-4, -16, 0], he: [-6, 30, 0] }, { L: [170, 220, 20], R: [-170, -200, -30] }, { L: [420, 1150, -320], R: [-260, 1050, 260] }, { L: [1, -0.4, -0.6], R: [1, -1, -0.3] }),
    F([0, -120, 20], { pe: [4, 28, 0], sp: [6, 14, 0], ch: [0, 14, 0], he: [-8, -10, 0] }, { L: [190, 240, 24], R: [-170, -200, -30] }, { L: [470, 1450, 380], R: [-260, 950, -80] }, { L: [1, -0.4, -0.6], R: [1, -0.6, -0.6] }),
    F([0, -150, 60], { pe: [8, 34, 0], sp: [10, 18, 0], ch: [4, 16, 0], he: [-10, -16, 0] }, { L: [190, 330, 24], R: [-170, -260, -30] }, { L: [300, 1250, 650], R: [-260, 950, -60] }, { L: [1, -0.6, -0.4], R: [1, -0.6, -0.6] })]],
  ['rhit', GLAD_ROWS[4][1]],
];

/* ---------------- spectators ---------------- */
const SEAT = (cheer, fist) => ({ bench: 1, p: [0, -455, -120], j: { hL: [-84, 0, 4], kL: [84, 0, 0], hR: [-84, 0, -4], kR: [84, 0, 0], he: cheer ? [-14, 0, 0] : [4, 0, 0] }, f: {},
  h: cheer ? { L: [250, 1500, -20], R: [-250, 1500, -20] } : fist ? { L: [140, 620, 160], R: [-230, 1420, 20] } : { L: [120, 600, 170], R: [-120, 600, 170] },
  hp: cheer ? { L: [1, 0, -1], R: [1, 0, -1] } : { L: [1, -1, -0.3], R: [1, -1, -0.3] } });
const STANDP = (cheer) => ({ p: [0, -6, 0], j: { he: cheer ? [-16, 0, 0] : [0, 0, 0], sL: [-4, 0, -12], eL: [-14, 0, 0], sR: [-4, 0, 12], eR: [-14, 0, 0] }, f: { L: [118, -10, 8], R: [-118, -10, -8] },
  h: cheer ? { L: [300, 2050, 80], R: [-300, 2050, 80] } : undefined, hp: { L: [1, 0, -0.6], R: [1, 0, -0.6] } });
export const SPEC_POSES = [['sit', SEAT(0, 0)], ['sitcheer', SEAT(1, 0)], ['sitfist', SEAT(0, 1)], ['stand', STANDP(0)], ['standcheer', STANDP(1)]];
export const SPEC_LOOKS = [
  { look: { skin: '#c99a72', hair: '#2a1d14', hs: 'crop', bs: 'full' }, tunic: '#8a3b2a', toga: null },
  { look: { skin: '#e0b48e', hair: '#5a3b20', hs: 'curly' }, tunic: '#3f6b8a', toga: null },
  { look: { skin: '#a8754e', hair: '#141010', hs: 'long', fem: 1, band: '#e8dcc0' }, tunic: '#c9a23e', toga: null },
  { look: { skin: '#d8a882', hair: '#8c8a86', hs: 'crop', bs: 'stubble' }, tunic: '#e8e0cc', toga: '#f0eadb', border: '#7a1e2a' },
  { look: { skin: '#8a5a3a', hair: '#121010', hs: 'curly', bs: 'goatee' }, tunic: '#4f7a3a', toga: null },
  { look: { skin: '#e8c0a0', hair: '#9a5a2a', hs: 'long', fem: 1, band: '#3a6ab0' }, tunic: '#7a4a8a', toga: null },
  { look: { skin: '#c48e66', hair: '#3a2a1e', hs: 'crop', bs: 'stache' }, tunic: '#d8cfb6', toga: '#ece4d2', border: '#c9a23e' },
  { look: { skin: '#b7835d', hair: '#22160e', hs: 'cap' }, tunic: '#a0522d', toga: null },
];

/* ---------------- helpers ---------------- */
function renderer(w, h) {
  if (!REND) { REND = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); REND.outputColorSpace = THREE.SRGBColorSpace; REND.setClearColor(0x000000, 0); REND.setPixelRatio(1); }
  if (REND.domElement.width !== w || REND.domElement.height !== h) REND.setSize(w, h, false); return REND;
}
function alphaBox(c) {
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return [x0, y0, x1, y1];
}
const toon = (c) => new THREE.MeshToonMaterial({ color: new THREE.Color(c), gradientMap: GM });
function inkOf(mesh, w) {
  const m = new THREE.MeshBasicMaterial({ color: 0x120c0a, side: THREE.BackSide }); const u = { value: w }; m.userData.u = u;
  m.onBeforeCompile = (sh) => { sh.uniforms.uOut = u; sh.vertexShader = 'uniform float uOut;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normalize(normal) * uOut;'); };
  m.customProgramCacheKey = () => 'lookInk';
  const o = new THREE.Mesh(mesh.geometry, m); o.position.copy(mesh.position); o.quaternion.copy(mesh.quaternion); o.scale.copy(mesh.scale); return o;
}

/* put one frame on the rig (group tilt for the fall, a severed forearm) */
function setFrame(spec) {
  B.group.rotation.set(0, 0, 0); B.group.position.set(0, 0, 0); B.group.updateMatrixWorld(true);
  const bones = B.rig.bones; bones.eR.scale.set(1, 1, 1); if (WOUND) WOUND.visible = false; if (BENCH) BENCH.visible = !!spec.bench;
  TOK.setPose(resolveSpec(B.rig, spec));
  if (spec.sever) { bones.eR.scale.set(0.02, 0.02, 0.02); if (WOUND) WOUND.visible = true; }
  if (spec.rot) {
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), spec.rot * D2R); const piv = new THREE.Vector3(...(spec.piv || [0, 0, 0]));
    B.group.quaternion.copy(q); B.group.position.copy(piv).sub(piv.clone().applyQuaternion(q)); B.group.position.y += spec.lift || 0; B.group.position.z += spec.dz || 0;
  }
  B.group.updateMatrixWorld(true);
}

/* render frames → a minis8-format sheet (rows × 8 yaws), cells cropped round the base anchor like rig92 sheet() */
async function renderFrames(frames, o = {}) {
  const t0 = performance.now(); const { scene, turn } = TOK._dbg; const sun = scene.children.find(x => x.isDirectionalLight);
  const ss = o.ss || 2, pxmm = o.pxmm || 3.143, ppm = pxmm * MM_PER_M * ss, S = Math.ceil((o.box || 4.2) * ppm / 4) * 4;
  const target = new THREE.Vector3(0, o.ty != null ? o.ty : 0.82, 0); const hw = S / 2 / ppm;
  const cam = new THREE.OrthographicCamera(-hw, hw, hw, -hw, 0.01, 50);
  cam.position.set(target.x, target.y + Math.sin(30 * D2R) * 10, target.z + Math.cos(30 * D2R) * 10); cam.lookAt(target); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  const dir = new THREE.Vector3(-0.55, 0.85, 0.55).applyQuaternion(cam.quaternion);
  sun.position.copy(cam.position).add(dir.multiplyScalar(5)); sun.target.position.copy(cam.position).add(new THREE.Vector3(0, 0, -10).applyQuaternion(cam.quaternion)); sun.target.updateMatrixWorld();
  const outPx = o.outlinePx || 0.85; if (B) B.setOutline(outPx * ss / ppm);
  for (const m of (o.inks || [])) m.material.userData.u.value = outPx * ss / ppm;
  const r = renderer(S, S);
  const anc = new THREE.Vector3(0, o.noBase ? 0 : -0.0, 0).project(cam); const AX = (anc.x * 0.5 + 0.5) * S / ss, AY = (-anc.y * 0.5 + 0.5) * S / ss;
  const yaws = o.yaws || MINI_YAW; const cells = []; const per = [];
  for (const fr of frames) {
    const t1 = performance.now(); if (o.set) o.set(fr); const row = [];
    for (const yaw of yaws) {
      const q0 = performance.now(); turn.rotation.y = yaw * D2R; turn.updateMatrixWorld(true); r.render(scene, cam);
      let c = document.createElement('canvas'); c.width = S; c.height = S; c.getContext('2d').drawImage(r.domElement, 0, 0);
      const q1 = performance.now(); TIMES.render += q1 - q0; TIMES.cells++;
      for (let k = ss; k > 1; k /= 2) { const d = document.createElement('canvas'); d.width = Math.ceil(c.width / 2); d.height = Math.ceil(c.height / 2); const g = d.getContext('2d'); g.imageSmoothingQuality = 'high'; if (o.shade && k === 2) g.filter = o.shade; g.drawImage(c, 0, 0, d.width, d.height); c = d; }
      row.push({ c, box: alphaBox(c) }); TIMES.post += performance.now() - q1; await new Promise(ok => setTimeout(ok, 0));
    }
    turn.rotation.y = 0; turn.updateMatrixWorld(true); cells.push(row); per.push(performance.now() - t1);
  }
  let L = 0, Rr = 0, T = 0, Bm = 0;
  for (const row of cells) for (const { box } of row) { if (box[2] < 0) continue; L = Math.max(L, AX - box[0]); Rr = Math.max(Rr, box[2] + 1 - AX); T = Math.max(T, AY - box[1]); Bm = Math.max(Bm, box[3] + 1 - AY); }
  const half = Math.ceil(Math.max(L, Rr)) + 1, w = half * 2, top = Math.ceil(T) + 1, h = top + Math.ceil(Bm) + 1;
  const x0 = Math.floor(AX) - half, y0 = Math.floor(AY) - top;
  const out = document.createElement('canvas'); out.width = w * yaws.length; out.height = h * cells.length; const g = out.getContext('2d');
  cells.forEach((row, j) => row.forEach(({ c }, i) => g.drawImage(c, x0, y0, w, h, i * w, j * h, w, h)));
  return { canvas: out, meta: [w, h, +(AX - x0).toFixed(1), +(AY - y0).toFixed(1), cells.length], ms: Math.round(performance.now() - t0), msPerFrame: Math.round(per.reduce((a, b) => a + b, 0) / per.length) };
}
const enc = (c, type, q) => { const u = c.toDataURL(type, q); return { url: u, bytes: Math.round((u.length - u.indexOf(',') - 1) * 0.75) }; };

/* a sub-sheet with only some yaw columns (size estimates for fewer facings) */
function cols(sheet, idx) {
  const [w, h, , , n] = sheet.meta; const o = document.createElement('canvas'); o.width = w * idx.length; o.height = h * n; const g = o.getContext('2d');
  idx.forEach((i, k) => g.drawImage(sheet.canvas, i * w, 0, w, h * n, k * w, 0, w, h * n)); return o;
}

/* ---------------- dressing: tunics / togas for spectators ---------------- */
let DRESS = [];
function undress() { for (const m of DRESS) B.kit.kill(m); DRESS = []; }
function dressSpec(V) {
  undress(); const K = B.kit, GI = K.GI;
  B.setLook(Object.assign({}, V.look, { noHarness: true, cloth: V.tunic }));
  B.group.traverse(o => { if (o.name === 'sandals' || o.name === 'sandals_ink') o.visible = true; });
  const mat = (col) => { const m = K.maskedMat(); m.color.set(col); m.userData.ownMat = 1; return m; };
  const fold = (p) => { const f = Math.sin(p[0] * 60 + p[1] * 22) * 0.5 + 0.5; return [0.82 + 0.18 * f, 0.82 + 0.18 * f, 0.82 + 0.18 * f]; };
  /* tunic: torso from the shoulders to mid-thigh, short sleeves */
  DRESS.push(K.shellFrom('tun100', (p, g) => {
    if (g === GI.T) return Math.min(p[1] - 0.7, 1.52 - p[1] + 0.0, 0.03);
    if (g === GI.LL || g === GI.LR) return Math.min(p[1] - 0.66, 0.03);
    if (g === GI.AL || g === GI.AR) return Math.min(Math.abs(p[0]) < 0.36 ? 0.03 : -1, p[1] - 1.3);
    return -1;
  }, fold, 0.009, { mat: mat(V.tunic) }));
  if (V.toga) {   /* the toga: a heavy drape from the left shoulder across the body to the right hip, coloured border */
    DRESS.push(K.shellFrom('toga100', (p, g) => {
      if (g === GI.AL) return Math.min(p[1] - 1.2, 0.03);
      if (g === GI.LL || g === GI.LR) return Math.min(p[1] - 0.5, 0.03);
      if (g !== GI.T) return -1; if (p[1] < 0.6 || p[1] > 1.56) return -1;
      const bare = (-p[0]) * 0.95 + (p[1] - 1.18) * 1.0 - 0.03; return Math.min(-bare, 0.03);
    }, (p) => { const f = Math.sin(p[0] * 40 - p[1] * 38) * 0.5 + 0.5; return [0.8 + 0.2 * f, 0.8 + 0.2 * f, 0.8 + 0.2 * f]; }, 0.017, { mat: mat(V.toga), hem: { w: 0.02, col: V.border, bw: 0.006, bcol: V.border } }));
  }
}

/* ---------------- the spider ---------------- */
let SPIDER = null;
function spiderFrame(f) {
  if (SPIDER) { SPIDER.traverse(o => { if (o.geometry) o.geometry.dispose(); }); PROPS.remove(SPIDER); }
  const G = new THREE.Group(); SPIDER = G; PROPS.add(G);
  const BODY = '#26201c', BAND = '#8c8278', LEG = '#2e2824';
  const add = (geo, col, w = 0.012) => { const m = new THREE.Mesh(geo, toon(col)); G.add(m); const i = inkOf(m, w); G.add(i); INKS.push(i); return m; };
  const s = 2.3;   /* spider scale in figure metres (a big arena spider: ~0.6 m across the legs × s) */
  const bob = [0, 0.012, 0, 0.012][f] * s;
  const ceph = add(new THREE.SphereGeometry(0.075 * s, 18, 12), BODY); ceph.scale.set(1, 0.7, 1.15); ceph.position.set(0, 0.11 * s + bob, 0.06 * s);
  const abd = add(new THREE.SphereGeometry(0.11 * s, 20, 14), BODY); abd.scale.set(1, 0.85, 1.25); abd.position.set(0, 0.15 * s + bob, -0.15 * s); abd.rotation.x = -0.25;
  for (const [y, z, r] of [[0.235, -0.12, 0.03], [0.225, -0.2, 0.026], [0.2, -0.27, 0.02]]) { const b = add(new THREE.SphereGeometry(r * s, 10, 8), BAND, 0.006); b.scale.set(1.6, 0.35, 0.8); b.position.set(0, y * s + bob, z * s); }
  for (const sx of [1, -1]) {
    add(new THREE.SphereGeometry(0.014 * s, 8, 6), '#9a1a14', 0.004).position.set(sx * 0.024 * s, 0.155 * s + bob, 0.135 * s);
    add(new THREE.SphereGeometry(0.009 * s, 8, 6), '#9a1a14', 0.003).position.set(sx * 0.05 * s, 0.15 * s + bob, 0.12 * s);
    const fang = add(new THREE.ConeGeometry(0.012 * s, 0.05 * s, 6), '#1a1412', 0.004); fang.position.set(sx * 0.02 * s, 0.07 * s + bob, 0.15 * s); fang.rotation.x = Math.PI * 0.85;
  }
  /* 8 legs, alternating tetrapod gait: L1 R2 L3 R4 swing together */
  const ang = [55, 20, -15, -50];
  for (const sx of [1, -1]) for (let i = 0; i < 4; i++) {
    const grp = (i + (sx > 0 ? 0 : 1)) % 2; const ph = (f / 4) * Math.PI * 2 + grp * Math.PI;
    const a = ang[i] * D2R, swing = Math.sin(ph) * 0.12, lift = Math.max(0, Math.cos(ph)) * 0.06 * s;
    const hip = new THREE.Vector3(sx * 0.06 * s, 0.11 * s + bob, 0.06 * s - i * 0.03 * s);
    const reach = (0.34 - Math.abs(i - 1.5) * 0.02) * s, aa = a + swing * (i < 2 ? 1 : -1);
    const foot = new THREE.Vector3(sx * Math.cos(aa) * reach, lift, 0.06 * s + Math.sin(aa) * reach);
    const knee = hip.clone().lerp(foot, 0.45); knee.y = 0.24 * s + lift * 0.5; knee.x += sx * 0.03 * s;
    const seg = (a0, b0, r) => { const d = new THREE.Vector3().subVectors(b0, a0); const g = new THREE.CylinderGeometry(r * 0.8, r, d.length(), 6); const m = add(g, LEG, 0.006); m.position.copy(a0).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); };
    seg(hip, knee, 0.012 * s); seg(knee, foot, 0.008 * s);
    add(new THREE.SphereGeometry(0.012 * s, 6, 5), LEG, 0.004).position.copy(knee);
  }
}
let INKS = [];

window.LOOK100 = {
  async init(res = 0.005) {
    TOK = await createToken({ res }); B = TOK._dbg.B; GM = B.mats.gm; const { turn } = TOK._dbg; BASE = turn.children[0];
    PROPS = new THREE.Group(); turn.add(PROPS);
    /* the wound cap for the severed forearm: rides the upper arm at the elbow */
    WOUND = B.kit.rigid(new THREE.SphereGeometry(0.045, 12, 8), B.kit.makeToon('#8c1410'), 'sR', B.kit.P('eR'), null); WOUND.visible = false;
    return B.stats;
  },
  /* the murmillo: rows → sheets (main + fall) */
  async gladiator(o = {}) {
    TOK.apply({ look: { skin: '#c08a64', hair: '#2a1c12', hs: 'crop', bs: 'stubble', cloth: '#b8933c' },
      gear: { head: { t: 'murmillo' }, belt: { t: 'balteus' }, arm: { R: { lower: { t: 'manica' } } }, leg: { L: { lower: { t: 'ocrea' } } }, wR: { t: 'sword' }, wL: { t: 'scutum', c: '#9c2f25' } } });
    BASE.visible = true; B.group.visible = true;
    const flat = (rows) => rows.flatMap(([k, fs]) => fs.map((s, i) => ({ k, i, s })));
    const main = flat(GLAD_ROWS), fall = flat(FALL_ROWS);
    const A = await renderFrames(main, { set: (fr) => setFrame(fr.s), box: 4.4, ty: 0.85, pxmm: o.pxmm });
    const Fl = await renderFrames(fall, { set: (fr) => setFrame(fr.s), box: 5.2, ty: 0.6, pxmm: o.pxmm });
    setFrame({ p: [0, 0, 0], j: {}, f: {} });
    window.SHEETS = window.SHEETS || {}; SHEETS.main = { ...A, rows: main.map(x => x.k + x.i) }; SHEETS.fall = { ...Fl, rows: fall.map(x => x.k + x.i) };
    const out = {};
    for (const [k, S] of [['main', A], ['fall', Fl]]) {
      const w8 = enc(S.canvas, 'image/webp', 0.8), w4 = enc(cols(S, [0, 2, 4, 6]), 'image/webp', 0.8), w8q = enc(S.canvas, 'image/webp', 0.65);
      out[k] = { meta: S.meta, ms: S.ms, msPerFrame: S.msPerFrame, webp: w8.url, bytes8: w8.bytes, bytes8q65: w8q.bytes, bytes4: w4.bytes, png: S.canvas.toDataURL('image/png'), rows: (k === 'main' ? main : fall).map(x => x.k + x.i) };
    }
    out.labels = [...GLAD_ROWS, ...FALL_ROWS].map(([k, fs, note]) => [k, fs.length, note]);
    return out;
  },
  async retiarius(o = {}) {
    TOK.apply({ look: { skin: '#8f6040', hair: '#141010', hs: 'curly', bs: 'goatee', cloth: '#3f6b8a' },
      gear: { arm: { L: { upper: { t: 'galerus' }, lower: { t: 'manica' } } }, belt: { t: 'balteus1' }, wR: { t: 'trident' } } });
    const fr = RET_ROWS.flatMap(([k, fs]) => fs.map((s, i) => ({ k, i, s })));
    const S = await renderFrames(fr, { set: (x) => setFrame(x.s), box: 4.6, ty: 0.85, pxmm: o.pxmm });
    setFrame({ p: [0, 0, 0], j: {}, f: {} });
    SHEETS.ret = { ...S, rows: fr.map(x => x.k + x.i) };
    const w = enc(S.canvas, 'image/webp', 0.8); return { meta: S.meta, ms: S.ms, bytes8: w.bytes, webp: w.url, rows: SHEETS.ret.rows };
  },
  async spider(o = {}) {
    B.group.visible = false; BASE.visible = false; INKS = [];
    const S = await renderFrames([0, 1, 2, 3], { set: (f) => { INKS = []; spiderFrame(f); for (const m of INKS) m.material.userData.u.value = 0.85 * 2 / (3.143 * MM_PER_M * 2); }, box: 2.4, ty: 0.2, pxmm: o.pxmm || 3.143 });
    if (SPIDER) { PROPS.remove(SPIDER); SPIDER = null; } B.group.visible = true; BASE.visible = true;
    SHEETS.spider = S; const w = enc(S.canvas, 'image/webp', 0.8); return { meta: S.meta, ms: S.ms, bytes8: w.bytes, webp: w.url, png: S.canvas.toDataURL('image/png') };
  },
  async spectators(o = {}) {
    BASE.visible = false; TOK.apply({ look: {}, gear: {} });
    const res = []; let ms = 0;
    for (let v = 0; v < SPEC_LOOKS.length; v++) {
      dressSpec(SPEC_LOOKS[v]);
      const S = await renderFrames(SPEC_POSES, { set: ([, s]) => setFrame(s), box: 3.8, ty: 0.9, pxmm: o.pxmm || 3.143 });
      ms += S.ms; res.push(S);
    }
    undress(); BASE.visible = true;
    SHEETS.spec = res; const w = enc(res[0].canvas, 'image/webp', 0.8);
    return { metas: res.map(r => r.meta), ms, bytesOneLook: w.bytes, looks: SPEC_LOOKS.length, poses: SPEC_POSES.map(p => p[0]), png: res.map(r => r.canvas.toDataURL('image/png')) };
  },
};

/* ---------------- round 2 ---------------- */
/* printed-class stand-ins (approximate loadouts from 02-data CLASSES + the 103/106/123 edits) */
export const CLASS_STAND = {
  soldier: { look: { skin: '#c99a72', hair: '#2a1d14', hs: 'crop', bs: 'stubble', cloth: '#c0433a' }, gear: { head: { t: 'centurion' }, belt: { t: 'balteus' }, arm: { L: { wraps: 1 }, R: { wraps: 1 } }, leg: { L: { upper: { t: 'legwrapsU' } }, R: { upper: { t: 'legwrapsU' } } }, wR: { t: 'sword' } } },
  royalty: { look: { skin: '#e0b48e', hair: '#5a3b20', hs: 'curly', cloth: '#4f7fc4' }, gear: { head: { t: 'cassis' }, chest: { t: 'ornate' }, arm: { L: { wraps: 1 }, R: { wraps: 1 } }, wR: { t: 'dagger' } } },
  hero: { look: { skin: '#c08a64', hair: '#2a1c12', hs: 'crop', cloth: '#4f9a57' }, gear: { head: { t: 'thrachelm' }, arm: { L: { lower: { t: 'provmanica' } }, R: { wraps: 1 } }, leg: { L: { upper: { t: 'legwrapsU' } }, R: { upper: { t: 'legwrapsU' } } }, wR: { t: 'sica' }, wL: { t: 'scutum', c: '#3f7a46' } } },
  slave: { look: { skin: '#8f6040', hair: '#141010', hs: 'curly', bs: 'goatee', cloth: '#d4b13c' }, gear: { head: { t: 'galea' }, arm: { L: { lower: { t: 'manica' } }, R: { wraps: 1 } }, leg: { L: { upper: { t: 'legwrapsU' } }, R: { upper: { t: 'legwrapsU' } } }, wR: { t: 'trident' } } },
  veteranus: { look: { skin: '#c48e66', hair: '#8a8580', hs: 'crop', bs: 'full', cloth: '#cfc6b4' }, gear: { head: { t: 'flavhelm' }, chest: { t: 'musculata' }, arm: { L: { wraps: 1 }, R: { wraps: 1 } }, leg: { L: { lower: { t: 'legwraps' } }, R: { lower: { t: 'legwraps' } } }, wR: { t: 'club' } } },
  amazonia: { look: { skin: '#b7835d', hair: '#22160e', hs: 'long', fem: 1, band: '#dc7a34', cloth: '#dc7a34' }, gear: { chest: { t: 'amazon' }, arm: { R: { cestus: 1 } }, leg: { L: { lower: { t: 'greaves' } }, R: { lower: { t: 'greaves' } } }, wR: { t: 'axe' }, wL: { t: 'sica' } } },
  venatore: { look: { skin: '#d8a882', hair: '#3a2a1e', hs: 'crop', bs: 'stubble', cloth: '#8a5cc0' }, gear: { head: { t: 'galea' }, belt: { t: 'balteus' }, arm: { L: { wraps: 1 }, R: { wraps: 1 } }, leg: { L: { lower: { t: 'legwraps' } }, R: { lower: { t: 'legwraps' } } }, wR: { t: 'spear' } } },
  damnatio: { look: { skin: '#a8754e', hair: '#141010', hs: 'cap', bs: 'stubble', cloth: '#9a8f84' }, gear: { arm: { L: { wraps: 1 }, R: { wraps: 1 } }, leg: { L: { lower: { t: 'legwraps' } }, R: { lower: { t: 'legwraps' } } }, wR: { t: 'sling' } } },
};
const CLASS_FRAMES = [['idle', 0], ['walk', 0], ['walk', 3], ['attack', 1], ['attack', 3], ['block', 1], ['hit', 0], ['cower', 1]];
/* townsfolk walking: 4 frames, empty hands swinging */
function townWalk(t) { const w = walk([0, 2, 3, 5][t]); const sw = [1, 0, -1, 0][t]; w.h = { L: [210, 880, 120 * sw], R: [-210, 880, -120 * sw] }; w.hp = { L: [1, -1, -0.2], R: [1, -1, -0.2] }; delete w.j.wR; return w; }
export const SPEC2_POSES = [['sit', SEAT(0, 0)], ['sitcheer', SEAT(1, 0)], ['sitfist', SEAT(0, 1)], ['stand', STANDP(0)], ['standcheer', STANDP(1)], ['walk0', townWalk(0)], ['walk1', townWalk(1)], ['walk2', townWalk(2)], ['walk3', townWalk(3)]];
/* base looks: the tunic in a KEY grey (recoloured at runtime), togas cream with a coloured border; hair never grey (the key) */
export const SPEC2_LOOKS = [
  { look: { skin: '#c99a72', hair: '#2a1d14', hs: 'crop', bs: 'full' }, tunic: '#d8d8d8', toga: null },
  { look: { skin: '#e0b48e', hair: '#6a3b18', hs: 'curly' }, tunic: '#d8d8d8', toga: null },
  { look: { skin: '#a8754e', hair: '#141010', hs: 'long', fem: 1, band: '#e8dcc0' }, tunic: '#d8d8d8', toga: null },
  { look: { skin: '#d8a882', hair: '#4a2c18', hs: 'crop', bs: 'stubble' }, tunic: '#d8d8d8', toga: '#efe3c0', border: '#7a1e2a' },
  { look: { skin: '#8a5a3a', hair: '#121010', hs: 'curly', bs: 'goatee' }, tunic: '#d8d8d8', toga: null },
  { look: { skin: '#e8c0a0', hair: '#9a5a2a', hs: 'long', fem: 1, band: '#3a6ab0' }, tunic: '#d8d8d8', toga: '#efe3c0', border: '#c9a23e' },
];
const SHADE = 'brightness(0.8) contrast(1.14) saturate(0.88)';   /* the darker painted tone of his minis */
const dump = (S) => ({ meta: S.meta, ms: S.ms, png: S.canvas.toDataURL('image/png') });
Object.assign(window.LOOK100, {
  /* per-cell time split on this renderer: GPU-side work (render + readback) vs the page's JS (downscale + crop scan) */
  async timing() {
    TOK.apply({ look: { skin: '#c08a64', hair: '#2a1c12', hs: 'crop', bs: 'stubble', cloth: '#b8933c' },
      gear: { head: { t: 'murmillo' }, belt: { t: 'balteus' }, arm: { R: { lower: { t: 'manica' } } }, leg: { L: { lower: { t: 'ocrea' } } }, wR: { t: 'sword' }, wL: { t: 'scutum', c: '#9c2f25' } } });
    BASE.visible = true; Object.assign(TIMES, { render: 0, post: 0, cells: 0 }); const t0 = performance.now();
    const fr = [GLAD_ROWS[1][1][0], GLAD_ROWS[2][1][3], GLAD_ROWS[4][1][0]];
    await renderFrames(fr, { set: (x) => setFrame(x), box: 4.4, ty: 0.85 });
    const t1 = performance.now(); const p0 = performance.now(); setFrame(GLAD_ROWS[2][1][2]); const poseMs = performance.now() - p0;
    const { scene } = TOK._dbg; let tris = 0; scene.traverse(o => { if (o.isMesh && o.visible && o.geometry) { const g = o.geometry; tris += (g.index ? g.index.count : g.attributes.position.count) / 3; } });
    const gl = renderer(8, 8).getContext(); const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    return { cells: TIMES.cells, msPerCellRender: +(TIMES.render / TIMES.cells).toFixed(1), msPerCellPost: +(TIMES.post / TIMES.cells).toFixed(1), totalMs: Math.round(t1 - t0), poseMs: +poseMs.toFixed(1), tris: Math.round(tris), gpu: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '?' };
  },

  /* a cleaner split: GPU raster forced to finish (gl.finish + a 1-px readPixels), then the full-frame readback, then the 2D work */
  async timing2(n = 8) {
    const { scene, turn } = TOK._dbg; const ss = 2, ppm = 3.143 * MM_PER_M * ss, S = Math.ceil(4.4 * ppm / 4) * 4; const hw = S / 2 / ppm;
    const cam = new THREE.OrthographicCamera(-hw, hw, hw, -hw, 0.01, 50); cam.position.set(0, 0.85 + 5, 8.66); cam.lookAt(0, 0.85, 0); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
    const r = renderer(S, S), gl = r.getContext(), px = new Uint8Array(4); setFrame(GLAD_ROWS[2][1][3]); let tr = 0, tb = 0, tp = 0;
    r.render(scene, cam); gl.finish(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    for (let i = 0; i < n; i++) {
      turn.rotation.y = MINI_YAW[i % 8] * D2R; turn.updateMatrixWorld(true);
      const a = performance.now(); r.render(scene, cam); gl.finish(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const b = performance.now();
      const big = new Uint8Array(S * S * 4); gl.readPixels(0, 0, S, S, gl.RGBA, gl.UNSIGNED_BYTE, big); const c = performance.now();
      let cv = document.createElement('canvas'); cv.width = S; cv.height = S; const g0 = cv.getContext('2d', { willReadFrequently: true }); g0.putImageData(new ImageData(new Uint8ClampedArray(big.buffer), S, S), 0, 0);
      const d = document.createElement('canvas'); d.width = S / 2; d.height = S / 2; const g = d.getContext('2d', { willReadFrequently: true }); g.imageSmoothingQuality = 'high'; g.drawImage(cv, 0, 0, d.width, d.height); alphaBox(d); const e = performance.now();
      tr += b - a; tb += c - b; tp += e - c;
    }
    turn.rotation.y = 0; turn.updateMatrixWorld(true);
    return { px: S, raster: +(tr / n).toFixed(1), readback: +(tb / n).toFixed(1), post2d: +(tp / n).toFixed(1) };
  },
  async classes() {
    const out = {}; const yaws = [45, 135];
    for (const [k, C] of Object.entries(CLASS_STAND)) {
      TOK.apply({ look: C.look, gear: C.gear }); BASE.visible = true;
      const frs = CLASS_FRAMES.map(([r, i]) => GLAD_ROWS.find(x => x[0] === r)[1][i]);
      const S = await renderFrames(frs, { set: (x) => setFrame(x), box: 4.6, ty: 0.85, yaws });
      out[k] = dump(S);
    }
    setFrame({ p: [0, 0, 0], j: {}, f: {} }); out.frames = CLASS_FRAMES.map(x => x.join('')); return out;
  },
  async spectators2() {
    BASE.visible = false; TOK.apply({ look: {}, gear: {} });
    if (!BENCH) { const wood = toon('#6e2a20'), top = toon('#8a3a2a'); BENCH = new THREE.Group(); const a = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.42, 0.42), wood); a.position.set(0, 0.21, -0.17); const b = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.05, 0.46), top); b.position.set(0, 0.445, -0.17);
      for (const m of [a, b]) { BENCH.add(m); const i = inkOf(m, 0.01); BENCH.add(i); INKS.push(i); } PROPS.add(BENCH); }
    const res = []; let ms = 0;
    for (const V of SPEC2_LOOKS) { dressSpec(V); for (const m of INKS) m.material.userData.u.value = 0.85 * 2 / (3.143 * MM_PER_M * 2);
      const S = await renderFrames(SPEC2_POSES, { set: ([, s]) => setFrame(s), box: 3.8, ty: 0.9, shade: SHADE }); ms += S.ms; res.push(dump(S)); }
    undress(); BENCH.visible = false; BASE.visible = true;
    return { looks: res, ms, poses: SPEC2_POSES.map(p => p[0]) };
  },
});
window.LOOK100_READY = true;
