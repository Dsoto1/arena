/* =====================================================================
   look100/beast3_hum.js — v1.0 LOOK TEST round 3 (not game code): the humanoid beasts on the rig92 gladiator body.
   Lines marked COPIED are anim_rig.js's frames + renderFrames (copied, not imported, so anim_rig.js stays untouched for the other look tests).
   Round 3 (his answers 2026-10-11):
     · THOLO (5a): a CLOTH CAPE rebuilt every frame — a two-sided slab hung from the shoulders, swinging with the walk phase (lagging hem,
       lateral sway, vertical folds), flaring back in the attack, then pushed BEHIND the posed body: a z-height-map of the skinned body
       (getVertexPosition, all vertices) clamps every cape point behind whatever is in front of it (+ margin) and is smoothed. capeCheck()
       then FAILS THE RENDER if any leg vertex (hip/knee/ankle-weighted) lies behind the cape's front surface inside its footprint.
     · COMMODUS (4a): a lion-pelt hood (skull over the head, muzzle over the brow, fangs, ears, hide down the neck + back, a mane ruff)
       and the forelegs knotted on the chest (sculpted in beast3_rig.js peltGeo/pawsGeo), a LORICA SEGMENTATA shell (silver lames with dark
       gaps and a lip, readable at board size), segmented shoulder guards, pteruges, white tunic, manica + greaves, sword.
   ===================================================================== */
/* COPIED from anim_rig.js (frames) */
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

/* COPIED from anim_rig.js (helpers + renderFrames) */
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

