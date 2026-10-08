/* =====================================================================
   clean96/crew.js — the arena crew for the post-event clean-up show (v0.96, src/238-v96clean.js)
   =====================================================================
   Built on the token modeller (tools/art/rig92: body.js sculpt + rig.js poses + game.js createToken), rendered ONCE
   to flat sheets the game draws with drawImage (no three.js in the game for this):
     slave   — chained worker: drab exomis + loincloth, bare feet, iron collar + chain, wrist/ankle irons, rough hair
     charun  — the masked psychopomp: blue-grey skin, bone-white beaked mask, black hair, dark tunic, long iron mallet
     guard   — overseer: galea, red tunic, sandals, a whip (coiled / cracking)
   Each figure = one sheet: one ROW per pose, 8 cells per row in MINI_YAW order (cell 0 faces the camera, yaw +45 = a step
   along +c), orthographic camera at 30° like the minis, sun upper left, transparent, NO base (the game paints a contact
   shadow). meta = [cellW, cellH, anchorX, anchorY, rows] — the anchor is the point between the feet on the ground (y 0).
   Props (rake, mallet, whip) are modelled in base space per pose; carts, litters, ropes and loads are painted in the game.
   Space: metres, y up, the figure faces +z, its left is +x (see rig92/README.md). */
import * as THREE from 'three';
import { createToken } from '../rig92/game.js';
import { resolveSpec, MM_PER_M } from '../rig92/rig.js';

const MINI_YAW = [0, 45, 90, 135, 180, -135, -90, -45];
const D2R = Math.PI / 180;

/* ---------------- poses (rig92 preset specs: p pelvis mm, j eulers deg, f pinned feet, h wrist IK targets mm, hp poles) ---------------- */
const legsA = { L: [105, 210, 6], R: [-105, -200, -8] }, legsB = { L: [105, -200, 8], R: [-105, 210, -6] };
const walk = (fwd) => {   /* fwd = 'L' → left leg forward, right arm forward */
  const a = fwd === 'L';
  return { p: [0, -38, 0], j: { pe: [0, a ? 7 : -7, 0], sp: [5, a ? -4 : 4, 0], ch: [2, a ? -5 : 5, 0], he: [-4, 0, 0],
    sL: [a ? 20 : -24, 0, -9], eL: [a ? -10 : -30, 0, 0], sR: [a ? -24 : 20, 0, 9], eR: [a ? -30 : -10, 0, 0] }, f: a ? legsA : legsB };
};
const stand = { p: [0, -8, 0], j: { sL: [-4, 0, -10], eL: [-16, 0, 0], sR: [-4, 0, 10], eR: [-16, 0, 0] }, f: { L: [110, 20, 8], R: [-110, -20, -8] } };
/* the rake: head on the sand at H, shaft up to the top U; left hand low on the shaft, right hand high */
const RAKE = { A: { H: [0, 0, 1180], U: [-150, 1330, -60] }, B: { H: [0, 0, 760], U: [-170, 1420, -210] } };
const onShaft = (r, t, dx) => { const H = r.H, U = r.U; return [H[0] + (U[0] - H[0]) * t + dx, H[1] + (U[1] - H[1]) * t, H[2] + (U[2] - H[2]) * t]; };
const rake = (k) => ({ p: k === 'A' ? [0, -150, 40] : [0, -80, -10],
  j: { pe: [k === 'A' ? 10 : 4, -10, 0], sp: [k === 'A' ? 16 : 8, -6, 0], ch: [k === 'A' ? 10 : 6, -6, 0], he: [k === 'A' ? -16 : -8, 0, 0] },
  f: k === 'A' ? { L: [140, 260, 10], R: [-140, -210, -24] } : { L: [140, 140, 12], R: [-140, -190, -20] },
  h: { L: onShaft(RAKE[k], k === 'A' ? 0.6 : 0.56, 20), R: onShaft(RAKE[k], k === 'A' ? 0.84 : 0.8, -15) }, hp: { L: [1, -0.6, -0.4], R: [1, -0.8, -0.6] } });
const carry = (fwd) => { const w = walk(fwd); return { p: [0, -48, -10], j: Object.assign({}, w.j, { sp: [-2, 0, 0], ch: [-3, 0, 0], sL: [0, 0, 0], sR: [0, 0, 0], eL: [0, 0, 0], eR: [0, 0, 0] }),
  f: w.f, h: { L: [255, 900, 150], R: [-255, 900, 150] }, hp: { L: [1, -0.3, -1], R: [1, -0.3, -1] } }; };
const push = (fwd) => ({ p: [0, -120, -30], j: { pe: [12, 0, 0], sp: [16, 0, 0], ch: [10, 0, 0], he: [-18, 0, 0] },
  f: fwd === 'L' ? { L: [115, 190, 6], R: [-115, -290, -6] } : { L: [115, -290, 6], R: [-115, 190, -6] },
  h: { L: [210, 1030, 560], R: [-210, 1030, 560] }, hp: { L: [1, -1, -0.2], R: [1, -1, -0.2] } });
const haul = (fwd) => ({ p: [0, -140, 70], j: { pe: [14, 0, 0], sp: [18, -8, 0], ch: [12, -8, 0], he: [-22, 6, 0] },
  f: fwd === 'L' ? { L: [115, 290, 6], R: [-115, -300, -6] } : { L: [115, -300, 6], R: [-115, 290, -6] },
  h: { R: [-150, 1440, 140], L: [-30, 1300, 330] }, hp: { L: [1, -1, -0.3], R: [1, -1, -0.6] } });
/* Charun: the mallet rests on the right shoulder while he walks; he raises it, then strikes the sand */
const MALLET = { walk: { G: [-210, 1290, 170], T: [-190, 1700, -330] }, raise: { G: [-40, 1760, 120], T: [-20, 2050, -400] }, strike: { G: [-30, 960, 470], T: [0, 0, 1050] } };
const chWalk = (fwd) => { const w = walk(fwd); return { p: w.p, j: Object.assign({}, w.j, { sR: [0, 0, 0], eR: [0, 0, 0] }), f: w.f, h: { R: MALLET.walk.G }, hp: { R: [1, -1, 0.2] } }; };
const chStand = { p: [0, -10, 0], j: { sL: [-4, 0, -10], eL: [-16, 0, 0] }, f: { L: [110, 30, 8], R: [-110, -30, -8] }, h: { R: MALLET.walk.G }, hp: { R: [1, -1, 0.2] } };
const chRaise = { p: [0, -40, -30], j: { sp: [-8, 0, 0], ch: [-8, 0, 0], he: [-6, 0, 0] }, f: { L: [120, 150, 8], R: [-120, -190, -14] },
  h: { R: [-70, 1760, 110], L: [60, 1700, 140] }, hp: { L: [1, 0.2, -1], R: [1, 0.2, -1] } };
const chStrike = { p: [0, -170, 40], j: { pe: [16, 0, 0], sp: [20, 0, 0], ch: [14, 0, 0], he: [-20, 0, 0] }, f: { L: [130, 260, 8], R: [-130, -220, -16] },
  h: { R: [-50, 960, 470], L: [40, 840, 600] }, hp: { L: [1, -1, -0.3], R: [1, -1, -0.3] } };
/* the guard: left fist on the hip, the whip in the right hand (coiled), or the arm thrown up and forward (crack) */
const gdIdle = { p: [0, -6, 0], j: { he: [-4, -6, 0] }, f: { L: [140, 40, 14], R: [-140, -40, -14] }, h: { L: [215, 1040, 60], R: [-290, 930, 130] }, hp: { L: [1, 0.2, 1], R: [1, -0.3, -1] } };
const gdCrack = { p: [0, -40, 20], j: { sp: [6, 10, 0], ch: [4, 10, 0], he: [-8, 0, 0] }, f: { L: [140, 180, 10], R: [-140, -170, -20] }, h: { L: [215, 1040, 60], R: [-230, 1640, 420] }, hp: { L: [1, 0.2, 1], R: [1, -0.6, -1] } };
const gdWalk = (fwd) => { const w = walk(fwd); return { p: w.p, j: Object.assign({}, w.j, { sR: [0, 0, 0], eR: [0, 0, 0] }), f: w.f, h: { R: [-290, 960, 170] }, hp: { R: [1, -0.3, -1] } }; };

export const FIGS = {
  slave: { look: { skin: '#b98f6a', hair: '#2e2118', hs: 'curly', bs: 'stubble', cloth: '#d2c6a6' }, tunic: '#5f5240', barefoot: true, irons: true,
    rows: [['walkA', walk('L')], ['walkB', walk('R')], ['stand', stand], ['rakeA', rake('A'), 'rake'], ['rakeB', rake('B'), 'rake'],
      ['carryA', carry('L')], ['carryB', carry('R')], ['pushA', push('L')], ['pushB', push('R')], ['haulA', haul('L')], ['haulB', haul('R')]] },
  charun: { look: { skin: '#71808f', hair: '#141210', hs: 'long', cloth: '#262a33' }, tunic: '#2c303b', barefoot: true, mask: true,
    rows: [['walkA', chWalk('L'), 'mwalk'], ['walkB', chWalk('R'), 'mwalk'], ['stand', chStand, 'mwalk'], ['raise', chRaise, 'mraise'], ['strike', chStrike, 'mstrike']] },
  guard: { look: { skin: '#c49a74', hair: '#3a2a1e', hs: 'crop', bs: 'full', cloth: '#7d2a22' }, tunic: '#8c2a22', gear: { head: { t: 'galea' }, leg: { L: { lower: { t: 'lgreaves' } }, R: { lower: { t: 'lgreaves' } } } },
    rows: [['walkA', gdWalk('L'), 'wcoil'], ['walkB', gdWalk('R'), 'wcoil'], ['idle', gdIdle, 'wcoil'], ['crack', gdCrack, 'wlash']] },
};

/* ---------------- helpers ---------------- */
const mm = (a) => new THREE.Vector3(a[0] / 1000, a[1] / 1000, a[2] / 1000);
let TOK = null, B = null, PROPS = null, OUTS = [], RIG_BITS = [], GM = null;
const toon = (c) => new THREE.MeshToonMaterial({ color: new THREE.Color(c), gradientMap: GM });
/* an inverted-hull outline for a prop (world metres) */
function inked(mesh, w = 0.012) {
  const m = new THREE.MeshBasicMaterial({ color: 0x120c0a, side: THREE.BackSide }); const u = { value: w }; m.userData.u = u;
  m.onBeforeCompile = (sh) => { sh.uniforms.uOut = u; sh.vertexShader = 'uniform float uOut;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normalize(normal) * uOut;'); };
  m.customProgramCacheKey = () => 'crewInk';
  const o = new THREE.Mesh(mesh.geometry, m); o.position.copy(mesh.position); o.quaternion.copy(mesh.quaternion); o.scale.copy(mesh.scale);
  OUTS.push(o); return o;
}
/* a cylinder from a to b (metres) */
function rod(a, b, r, col, seg = 8) {
  const d = new THREE.Vector3().subVectors(b, a); const g = new THREE.CylinderGeometry(r, r, d.length(), seg);
  const m = new THREE.Mesh(g, toon(col)); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  PROPS.add(m); PROPS.add(inked(m)); return m;
}
function blk(c, size, col, quat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(...size), toon(col)); m.position.copy(c); if (quat) m.quaternion.copy(quat); PROPS.add(m); PROPS.add(inked(m)); return m;
}
function tube(pts, r, col) {
  const curve = new THREE.CatmullRomCurve3(pts); const g = new THREE.TubeGeometry(curve, 48, r, 6, false); const m = new THREE.Mesh(g, toon(col)); PROPS.add(m); PROPS.add(inked(m, 0.008)); return m;
}
const WOOD = '#8a6238', WOOD_D = '#5e4126', IRON = '#4a4744', IRON_L = '#7b7c7e', LEATHER = '#5a3820';
/* the props of one pose */
function props(kind) {
  PROPS.clear(); OUTS = [];
  if (kind === 'rake' || kind === 'rakeA' || kind === 'rakeB') return;
  if (kind && kind.startsWith('rake:')) {
    const r = RAKE[kind.slice(5)]; const H = mm(r.H), U = mm(r.U);
    rod(H.clone().add(new THREE.Vector3(0, 0.03, 0)), U, 0.017, WOOD);
    const head = H.clone().add(new THREE.Vector3(0, 0.07, 0)); blk(head, [0.5, 0.05, 0.05], WOOD_D);
    for (let i = 0; i < 9; i++) { const x = -0.22 + i * 0.055; rod(new THREE.Vector3(head.x + x, head.y - 0.02, head.z), new THREE.Vector3(head.x + x, 0.0, head.z + 0.025), 0.007, IRON_L, 5); }
    return;
  }
  if (kind && kind.startsWith('mallet:')) {
    const k = MALLET[kind.slice(7)]; const G = mm(k.G), T = mm(k.T); const d = new THREE.Vector3().subVectors(T, G).normalize();
    const end = T.clone(), start = G.clone().addScaledVector(d, -0.18);
    rod(start, end, 0.02, WOOD_D);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
    const hd = blk(end.clone().addScaledVector(d, 0.02), [0.3, 0.13, 0.15], IRON, q); hd.rotateY(0.0);
    for (const s of [-1, 1]) blk(end.clone().addScaledVector(d, 0.02).add(new THREE.Vector3(0, 0, 0)).addScaledVector(new THREE.Vector3(1, 0, 0).applyQuaternion(q), s * 0.155), [0.03, 0.16, 0.17], IRON_L, q);
    return;
  }
  if (kind === 'wcoil') {   /* a coiled whip hanging from the right fist */
    const h = mm([-300, 900, 150]); rod(h.clone().add(new THREE.Vector3(0, 0.08, 0)), h.clone().add(new THREE.Vector3(0, -0.2, 0.02)), 0.016, LEATHER);
    for (let i = 0; i < 3; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.085 - i * 0.008, 0.009, 6, 18), toon('#4a2c18')); t.position.copy(h).add(new THREE.Vector3(-0.02, -0.3 - i * 0.03, 0.02 + i * 0.01)); t.rotation.set(0.2, Math.PI / 2, 0.2 * i); PROPS.add(t); PROPS.add(inked(t, 0.006)); }
    return;
  }
  if (kind === 'wlash') {   /* the lash thrown out ahead, the tip snapping at the sand */
    const h = mm([-230, 1660, 440]); rod(h.clone().add(new THREE.Vector3(0, -0.05, -0.08)), h.clone().add(new THREE.Vector3(0.0, 0.17, 0.08)), 0.016, LEATHER);
    tube([h.clone().add(new THREE.Vector3(0, 0.17, 0.08)), mm([-200, 2000, 700]), mm([-150, 1700, 1200]), mm([-100, 900, 1550]), mm([-60, 300, 1700]), mm([-20, 40, 1650])], 0.011, '#4a2c18');
    return;
  }
  if (kind && kind.startsWith('m')) return props('mallet:' + kind.slice(1));
}
/* figure dressing that stays for every row: tunic shell, irons, mask, bare feet */
function dress(F) {
  for (const m of RIG_BITS) B.kit.kill(m); RIG_BITS = [];
  const K = B.kit, GI = K.GI, P = K.P;
  B.setLook(Object.assign({}, F.look, { noHarness: true }));
  /* bare feet: sandal straps off, soles and the belt studs/ring scaled away (their outlines follow the scale) */
  B.group.traverse(o => {
    if (o.name === 'sandals' || o.name === 'sandals_ink') o.visible = !F.barefoot;
    if (o.isMesh && !o.isSkinnedMesh && (o.material === B.mats.sole)) o.scale.setScalar(F.barefoot ? 1e-4 : 1);
    if (o.isMesh && !o.isSkinnedMesh && (o.material === B.mats.stud || o.material === B.mats.iron)) o.scale.setScalar(F.irons || F.mask ? 1e-4 : 1);
  });
  /* the tunic: an exomis — torso from the hips to the left shoulder, the right shoulder and breast bare */
  const tun = K.shellFrom('tunic96', (p, g) => {
    if (g !== GI.T) return -1; if (p[1] < 0.97 || p[1] > 1.5) return -1;
    const bare = (-p[0]) * 0.9 + (p[1] - 1.24) * 1.0 - 0.06;   /* the diagonal over the right breast */
    return Math.min(p[1] - 0.97, 1.5 - p[1], -bare, 0.03);
  }, (p) => { const f = Math.sin(p[0] * 70 + p[1] * 25) * 0.5 + 0.5; return [0.84 + 0.16 * f, 0.84 + 0.16 * f, 0.84 + 0.16 * f]; }, 0.011, { mat: (() => { const m = K.maskedMat(); m.color.set(F.tunic); m.userData.ownMat = 1; return m; })() });
  RIG_BITS.push(tun);
  if (F.irons) {
    const iron = K.makeToon(IRON), ring = (R, r) => new THREE.TorusGeometry(R, r, 8, 20);
    const nk = P('ne'); RIG_BITS.push(K.rigid(ring(0.072, 0.014), iron, 'ne', [nk[0], nk[1] - 0.01, nk[2] + 0.01], [0, 1, 0.15]));
    /* a short chain from the collar's front ring down the chest */
    for (let i = 0; i < 5; i++) { const at = [0.0, nk[1] - 0.06 - i * 0.04, nk[2] + 0.085 - i * 0.004]; RIG_BITS.push(K.rigid(ring(0.017, 0.0055), iron, 'ch', at, i % 2 ? [1, 0, 0] : [0, 0, 1])); }
    for (const s of ['L', 'R']) {
      const w = P('w' + s), e = P('e' + s); const d = [w[0] - e[0], w[1] - e[1], w[2] - e[2]];
      RIG_BITS.push(K.rigid(ring(0.046, 0.012), iron, 'e' + s, [e[0] + d[0] * 0.86, e[1] + d[1] * 0.86, e[2] + d[2] * 0.86], d));
      const a = P('a' + s), k = P('k' + s); const d2 = [a[0] - k[0], a[1] - k[1], a[2] - k[2]];
      RIG_BITS.push(K.rigid(ring(0.058, 0.013), iron, 'k' + s, [k[0] + d2[0] * 0.88, k[1] + d2[1] * 0.88, k[2] + d2[2] * 0.88], d2));
    }
  }
  if (F.mask) {   /* Charun's mask: a pale face plate, a hooked beak, dark eye holes, a ridge over the brow */
    const HO = K.HO, hs = K.hs; const bone = toon('#efe9dc');
    const plate = new THREE.SphereGeometry(0.108 * hs, 18, 12, Math.PI * 0.08, Math.PI * 0.84, Math.PI * 0.18, Math.PI * 0.62); plate.scale(1.12, 1.3, 1.12);
    RIG_BITS.push(K.rigid(plate, bone, 'he', [HO[0], HO[1] + 0.085 * hs, HO[2] + 0.012], null));
    const beak = new THREE.ConeGeometry(0.034 * hs, 0.15 * hs, 8); beak.rotateX(Math.PI * 0.62);
    RIG_BITS.push(K.rigid(beak, bone, 'he', [HO[0], HO[1] + 0.06 * hs, HO[2] + 0.15 * hs], null));
    const dark = toon('#0e0b0a');
    for (const sx of [1, -1]) RIG_BITS.push(K.rigid(new THREE.SphereGeometry(0.014 * hs, 8, 6), dark, 'he', [HO[0] + sx * 0.034 * hs, HO[1] + 0.112 * hs, HO[2] + 0.118 * hs], null));
    const ridge = new THREE.TorusGeometry(0.06 * hs, 0.011 * hs, 6, 16, Math.PI); RIG_BITS.push(K.rigid(ridge, bone, 'he', [HO[0], HO[1] + 0.11 * hs, HO[2] + 0.095 * hs], [0, 0.3, 1]));
  }
}

/* ---------------- rendering ---------------- */
let REND = null;
function renderer(w, h) {
  if (!REND) { REND = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); REND.outputColorSpace = THREE.SRGBColorSpace; REND.setClearColor(0x000000, 0); REND.setPixelRatio(1); }
  if (REND.domElement.width !== w || REND.domElement.height !== h) REND.setSize(w, h, false); return REND;
}
function alphaBox(c) {
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return [x0, y0, x1, y1];
}
/* render one figure → { url (webp), png, meta:[cellW,cellH,ax,ay,rows], rows:[names], ms, bytes } */
async function renderFig(name, o = {}) {
  const t0 = performance.now(); const F = FIGS[name];
  const { scene, turn } = TOK._dbg; const sun = scene.children.find(x => x.isDirectionalLight);
  TOK.apply({ look: F.look, gear: F.gear || {} });
  dress(F);
  const ss = o.ss || 4, pxmm = o.pxmm || 2.6, el = 30, ppm = pxmm * MM_PER_M * ss;
  const S = Math.ceil(3.4 * ppm / 4) * 4;
  const target = new THREE.Vector3(0, 0.95, 0.25);
  const hw = S / 2 / ppm; const cam = new THREE.OrthographicCamera(-hw, hw, hw, -hw, 0.01, 50);
  cam.position.set(target.x, target.y + Math.sin(el * D2R) * 10, target.z + Math.cos(el * D2R) * 10); cam.lookAt(target); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  const dir = new THREE.Vector3(-0.55, 0.85, 0.55).applyQuaternion(cam.quaternion);
  sun.position.copy(cam.position).add(dir.multiplyScalar(5)); sun.target.position.copy(cam.position).add(new THREE.Vector3(0, 0, -10).applyQuaternion(cam.quaternion)); sun.target.updateMatrixWorld();
  const outPx = o.outlinePx || 0.9; B.setOutline(outPx * ss / ppm);
  const r = renderer(S, S);
  const anc = new THREE.Vector3(0, 0, 0).project(cam); const AX = (anc.x * 0.5 + 0.5) * S / ss, AY = (-anc.y * 0.5 + 0.5) * S / ss;
  const cells = [];
  for (const [rk, spec, pk] of F.rows) {
    const pose = resolveSpec(B.rig, spec); TOK.setPose(pose);
    props(pk === 'rake' ? 'rake:' + rk.slice(-1) : pk);
    for (const m of OUTS) m.material.userData.u.value = outPx * ss / ppm * 1.0;
    const row = [];
    for (const yaw of MINI_YAW) {
      turn.rotation.y = yaw * D2R; turn.updateMatrixWorld(true); r.render(scene, cam);
      let c = document.createElement('canvas'); c.width = S; c.height = S; c.getContext('2d').drawImage(r.domElement, 0, 0);
      for (let k = ss; k > 1; k /= 2) { const d = document.createElement('canvas'); d.width = Math.ceil(c.width / 2); d.height = Math.ceil(c.height / 2); const g = d.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, 0, d.width, d.height); c = d; }
      row.push({ c, box: alphaBox(c) });
      await new Promise(ok => setTimeout(ok, 0));
    }
    turn.rotation.y = 0; turn.updateMatrixWorld(true);
    cells.push(row);
  }
  let L = 0, Rr = 0, T = 0, Bm = 0;
  for (const row of cells) for (const { box } of row) { if (box[2] < 0) continue; L = Math.max(L, AX - box[0]); Rr = Math.max(Rr, box[2] + 1 - AX); T = Math.max(T, AY - box[1]); Bm = Math.max(Bm, box[3] + 1 - AY); }
  const half = Math.ceil(Math.max(L, Rr)) + 1, w = half * 2, top = Math.ceil(T) + 1, h = top + Math.ceil(Bm) + 1;
  const x0 = Math.floor(AX) - half, y0 = Math.floor(AY) - top;
  const out = document.createElement('canvas'); out.width = w * 8; out.height = h * cells.length; const g = out.getContext('2d');
  cells.forEach((row, j) => row.forEach(({ c }, i) => g.drawImage(c, x0, y0, w, h, i * w, j * h, w, h)));
  const url = out.toDataURL('image/webp', o.q || 0.8);
  return { url, png: o.png ? out.toDataURL('image/png') : null, meta: [w, h, +(AX - x0).toFixed(1), +(AY - y0).toFixed(1), cells.length], rows: F.rows.map(x => x[0]), ms: Math.round(performance.now() - t0), bytes: Math.round((url.length - 23) * 0.75) };
}

window.CREW96 = {
  async init(res = 0.005) { TOK = await createToken({ res }); B = TOK._dbg.B; GM = B.mats.gm; const { turn } = TOK._dbg; turn.children[0].visible = false; PROPS = new THREE.Group(); turn.add(PROPS); return B.stats; },
  renderFig, FIGS: Object.keys(FIGS),
};
window.CREW96_READY = true;
