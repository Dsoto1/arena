/* look100 ROUND 4 — every printed armor piece MODELLED from his art (assets/arm81_*.webp, armor2.webp cells, armthumb81_*), and every weapon
   modelled from his card art (assets/weapons.jpg) with its own GRIP + HOLD. Look test only (tools/plans/look100), not game code.
   Layer stack as round 3 (outfit100 LAYER): sandals 4.8 · padding 6.2 · mail 9.2 · plates 12.5 · belts 19 mm off the skin, then the rigid
   pieces: lames / shoulder plates (stacked outward), tassets (rigid hanging plates on the thigh bone), knee caps, helmets.
   outfit4(B, [{k, sd}]) → meshes · arm4(B, k, sd) one piece · weapon4(B, k, sd) the weapon in the hand · HOLD4[k] the stance. */
import * as THREE from 'three';
import { murmKit, weaponKit, merge, plate, box, cyl, ball, at, colorize, basisQ, canvasTex, METAL, BRONZE, GOLD, LEATHER, CLOTH, WOOD, STEEL, BRASS, MAROON, GOLD2 } from './gear100.js';
import { LAYER, outfitCheck } from './outfit100.js';
import { ENDS } from './rig100.js';

const V3 = (a) => new THREE.Vector3(...a);
/* the painted pass shades deep: pieces are authored a little lighter than his art so they read at the same value on the board */
const LI = (hex, k = 0.2) => '#' + new THREE.Color(hex).lerp(new THREE.Color('#fff4e0'), k).getHexString();
const mergeL = (parts) => merge(parts.map(([g, c]) => [g, LI(c)]));
const tube = (pts, r, seg = 24, rs = 8) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(V3)), seg, r, rs, false);
/* a tapered tube (horns, fangs, spikes): stacked cones along a curve */
function taper(pts, r0, r1, n = 10) { const c = new THREE.CatmullRomCurve3(pts.map(V3)); const parts = [];
  for (let i = 0; i < n; i++) { const a = c.getPoint(i / n), b = c.getPoint((i + 1) / n), ra = r0 + (r1 - r0) * i / n, rb = r0 + (r1 - r0) * (i + 1) / n;
    const g = new THREE.CylinderGeometry(rb, ra, a.distanceTo(b) * 1.08, 10, 1); const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    g.applyQuaternion(q); g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); parts.push(g); }
  return parts; }
const domeG = (rx, ry, rz, cy, cz, th0, th1, seg = 32) => { const g = new THREE.SphereGeometry(1, seg, 18, 0, Math.PI * 2, th0, th1); g.scale(rx, ry, rz); g.translate(0, cy, cz); return g; };
const ringG = (r, tub, y, z = 0, sx = 1, sz = 1) => { const g = new THREE.TorusGeometry(r, tub, 6, 40); g.rotateX(Math.PI / 2); g.scale(sx, 1, sz); g.translate(0, y, z); return g; };
const cylSeg = (r0, r1, h, t0, tl, y, z = 0, seg = 28) => { const g = new THREE.CylinderGeometry(r0, r1, h, seg, 2, true, t0, tl); g.translate(0, y, z); return g; };
/* textures */
const holesTex = (base, hole, edge) => canvasTex(256, 160, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); g.fillStyle = hole;
  for (let r = 0; r < 6; r++) for (let c = 0; c < 14; c++) { const x = 14 + c * 17.5 + (r % 2) * 8, y = 18 + r * 22; if (Math.abs(x - w / 2) < 8 || x > w - 10) continue; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); }
  g.fillStyle = edge; g.fillRect(w / 2 - 4, 0, 8, h); g.fillRect(0, 0, w, 7); g.fillRect(0, h - 10, w, 10); });

/* ======================= HELMETS (head-local, origin = the head pivot HO, metres × hs) ======================= */
/* each returns [[geometry, colour] …] (one merged vertex-coloured mesh) + optional textured extras [[geometry, material] …] */
const IRON = '#4f5a4c', IRON_D = '#3a3f3a', GOLDH = '#d6ab4c', BLK = '#1e1b19', RED_P = '#a8241c', STEEL_B = '#7f93ad', SILVER = '#c9ced3';
const HELM = {
  /* Iron Helm (cell 0): a green-iron dome, gold riveted bands crossing over the top, a long nasal, cheek guards */
  galea: (T) => { const P = [[domeG(0.104, 0.108, 0.116, 0.13, -0.006, 0, Math.PI * 0.58), '#6c7a62']];
    P.push([ringG(0.1, 0.006, 0.1, -0.006, 1.02, 1.12), GOLDH]);
    for (const rot of [0, Math.PI / 2]) { const g = new THREE.TorusGeometry(0.118, 0.006, 6, 40, Math.PI); if (rot) g.rotateY(Math.PI / 2); g.scale(rot ? 1 : 0.88, 1, rot ? 0.97 : 1); g.translate(0, 0.125, -0.006); P.push([g, GOLDH]); }
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; P.push([ball(0.0065, Math.sin(a) * 0.103, 0.1, Math.cos(a) * 0.112 - 0.006), '#f0d080']); }
    P.push([at(new THREE.BoxGeometry(0.024, 0.095, 0.012), 0, 0.075, 0.128), '#6c7a62'], [at(new THREE.BoxGeometry(0.032, 0.008, 0.016), 0, 0.03, 0.13), GOLDH]);
    for (const sx of [1, -1]) { const g = plate([[0, 0], [0.045, 0], [0.05, -0.07], [0.02, -0.1], [0.0, -0.06]], 0.008); g.rotateY(sx * 1.2 + (sx > 0 ? 0 : Math.PI)); g.translate(sx * 0.1, 0.11, 0.05); P.push([g, '#6c7a62']); }
    return { P }; },
  /* Horned Helm (cell 1): dark steel, two big black horns, a gold-trimmed face mask pointed at the chin */
  cassis: (T) => { const P = [[domeG(0.106, 0.118, 0.118, 0.12, -0.006, 0, Math.PI * 0.58), '#5d656c']];
    P.push([cylSeg(0.118, 0.112, 0.11, -0.95, 1.9, 0.06, -0.004), '#7d858c'], [cylSeg(0.119, 0.113, 0.014, -0.95, 1.9, 0.112, -0.004), GOLDH], [at(new THREE.BoxGeometry(0.07, 0.018, 0.01), 0, 0.09, 0.125), '#151313']);
    P.push([at(new THREE.BoxGeometry(0.016, 0.15, 0.02), 0, 0.14, 0.122), GOLDH], [at(new THREE.ConeGeometry(0.03, 0.06, 4).rotateZ(Math.PI), 0, -0.015, 0.11), GOLDH], [at(new THREE.SphereGeometry(0.018, 10, 8), 0, 0.2, 0.11), '#3a6aa0']);
    for (const sx of [1, -1]) for (const g of taper([[sx * 0.095, 0.17, 0], [sx * 0.17, 0.2, 0.02], [sx * 0.2, 0.29, 0.05], [sx * 0.17, 0.36, 0.07]], 0.024, 0.003, 12)) P.push([g, BLK]);
    return { P }; },
  /* Hoplomachus Helm (arm81_crista): gold, a wide flat brim, a tall crest fin with a red plume, a grille visor */
  crista: (T) => { const P = [[domeG(0.104, 0.12, 0.114, 0.125, -0.006, 0, Math.PI * 0.55), GOLDH]];
    P.push([cylSeg(0.152, 0.112, 0.03, 0, Math.PI * 2, 0.05, -0.008), '#c79a3c'], [ringG(0.153, 0.005, 0.035, -0.008), '#9a7428']);
    const fin = plate([[-0.09, 0], [0.1, 0], [0.06, 0.05], [0.02, 0.09], [-0.03, 0.08]], 0.008); fin.rotateY(Math.PI / 2); fin.translate(0, 0.235, -0.006); P.push([fin, GOLDH]);
    P.push([at(new THREE.CylinderGeometry(0.005, 0.005, 0.12), 0, 0.37, 0.01), GOLDH]); for (let i = 0; i < 5; i++) P.push([ball(0.014 - i * 0.0015, 0, 0.42 + i * 0.02, 0.01 - i * 0.012), RED_P]);
    const X = [[cylSeg(0.11, 0.115, 0.1, -1.05, 2.1, 0.05, -0.004), new THREE.MeshToonMaterial({ map: holesTex('#b7913f', '#1a130c', '#d6ab4c'), side: THREE.DoubleSide })]];
    return { P, X }; },
  /* Steel Dome Helm (cell 4): a smooth blue-steel secutor dome to the chin, two red round eyes, a low ridge */
  helm5: (T) => { const P = [[domeG(0.104, 0.15, 0.12, 0.1, -0.002, 0, Math.PI * 0.86), STEEL_B]];
    for (const sx of [1, -1]) P.push([at(new THREE.SphereGeometry(0.014, 12, 8).scale(1, 1, 0.5), sx * 0.034, 0.1, 0.116), '#b51e18'], [at(new THREE.TorusGeometry(0.016, 0.004, 6, 16), sx * 0.034, 0.1, 0.118), '#2a3240']);
    const r = plate([[-0.09, -0.01], [0.09, -0.01], [0.07, 0.018], [-0.07, 0.018]], 0.012); r.rotateY(Math.PI / 2); r.translate(0, 0.245, -0.002); P.push([r, '#5f7088']);
    P.push([ringG(0.106, 0.005, -0.015, 0, 1, 1.12), '#2a3240']);
    return { P }; },
  /* Helm of Flavius (arm81_flavhelm): a gold lion — a mane round the face, ears, a muzzle on the brow, fangs down the cheeks, a spike */
  flavhelm: (T) => { const P = [[domeG(0.106, 0.122, 0.116, 0.125, -0.006, 0, Math.PI * 0.58), GOLDH]];
    for (let i = 0; i < 20; i++) { const a = -2.4 + i / 19 * 4.8; const d = V3([Math.sin(a), Math.cos(a), 0.35]).normalize(); const g = new THREE.ConeGeometry(0.024, 0.07, 6);
      g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d)); g.translate(Math.sin(a) * 0.112, 0.075 + Math.cos(a) * 0.115, 0.07 - Math.abs(Math.sin(a)) * 0.04); P.push([g, i % 2 ? '#b8862e' : GOLDH]); }
    P.push([at(new THREE.SphereGeometry(0.05, 14, 10).scale(1.1, 0.7, 0.8), 0, 0.21, 0.08), '#c99a3c'], [ball(0.012, 0, 0.215, 0.125), '#3a2610']);
    for (const sx of [1, -1]) { P.push([ball(0.016, sx * 0.05, 0.25, 0.04), GOLDH]); for (const g of taper([[sx * 0.075, 0.07, 0.07], [sx * 0.08, 0.0, 0.08], [sx * 0.07, -0.05, 0.075]], 0.012, 0.002, 6)) P.push([g, '#efe2c0']); }
    P.push([at(new THREE.ConeGeometry(0.014, 0.09, 8), 0, 0.29, -0.01), GOLDH]);
    return { P }; },
  /* Centurian Helm (cell 29): a small gold cap, big cheek guards, a neck guard, a red plume standing fore-aft */
  centurion: (T) => { const P = [[domeG(0.1, 0.115, 0.11, 0.135, -0.008, 0, Math.PI * 0.52), GOLDH], [ringG(0.1, 0.006, 0.125, -0.008, 1.0, 1.1), '#b8862e']];
    for (const sx of [1, -1]) { const g = plate([[0, 0], [0.05, 0], [0.055, -0.08], [0.025, -0.12], [0.0, -0.08]], 0.007); g.rotateY(sx > 0 ? 1.3 : Math.PI - 1.3); g.translate(sx * 0.09, 0.12, 0.03); P.push([g, GOLDH]); }
    P.push([cylSeg(0.115, 0.15, 0.04, Math.PI * 0.65, Math.PI * 0.7, 0.1, -0.01), GOLDH]);
    P.push([at(new THREE.BoxGeometry(0.012, 0.03, 0.16), 0, 0.255, -0.01), GOLDH]); for (let i = 0; i < 9; i++) P.push([at(new THREE.SphereGeometry(0.02, 8, 6).scale(0.7, 1.6, 0.9), 0, 0.29 + Math.sin(i / 8 * Math.PI) * 0.025, -0.085 + i * 0.021), RED_P]);
    return { P }; },
  /* Steel Helm (arm81_steelhelm): a dark iron pointed helm, a raised ridge, a face mask with red eye slits, long cheek flaps */
  steelhelm: (T) => { const prof = [[0, 0.33], [0.04, 0.28], [0.08, 0.22], [0.104, 0.15], [0.108, 0.09], [0.106, 0.0], [0.1, -0.03]].map(([x, y]) => new THREE.Vector2(x, y));
    const L = new THREE.LatheGeometry(prof, 32); L.scale(1, 1, 1.1); L.translate(0, 0, -0.006); const P = [[L, '#7a8085']];
    const r = plate([[-0.12, 0], [0.13, 0], [0.04, 0.12], [-0.02, 0.12]], 0.014); r.rotateY(Math.PI / 2); r.translate(0, 0.2, -0.006); P.push([r, '#959ba0']);
    for (const sx of [1, -1]) P.push([at(new THREE.BoxGeometry(0.03, 0.007, 0.01).rotateZ(sx * -0.25), sx * 0.034, 0.1, 0.12), '#b51e18']);
    P.push([at(new THREE.BoxGeometry(0.016, 0.12, 0.012), 0, 0.075, 0.122), '#6b7176'], [at(new THREE.BoxGeometry(0.03, 0.012, 0.03), 0, 0.018, 0.105), '#151313']);
    return { P }; },
  /* Thracian Helm (arm81_thracian): silver, a wide sloping brim, a griffin crest curving forward, a gold grille over the eyes */
  thrachelm: (T) => { const P = [[domeG(0.104, 0.12, 0.114, 0.125, -0.006, 0, Math.PI * 0.55), SILVER], [cylSeg(0.112, 0.17, 0.045, 0, Math.PI * 2, 0.045, -0.008), '#b3b8bd'], [ringG(0.17, 0.006, 0.023, -0.008), GOLDH]];
    for (const g of taper([[0, 0.2, -0.1], [0, 0.3, -0.08], [0, 0.37, 0.0], [0, 0.36, 0.07], [0, 0.31, 0.11]], 0.03, 0.018, 16)) P.push([g, '#b3b8bd']);
    P.push([at(new THREE.SphereGeometry(0.03, 12, 8).scale(0.7, 1, 1.2), 0, 0.31, 0.12), GOLDH], [at(new THREE.ConeGeometry(0.012, 0.04, 6).rotateX(Math.PI / 2), 0, 0.3, 0.16), GOLDH]);
    const X = [[cylSeg(0.11, 0.115, 0.09, -1.0, 2.0, 0.055, -0.004), new THREE.MeshToonMaterial({ map: holesTex('#c99a3c', '#1a130c', '#e2c06a'), side: THREE.DoubleSide })]];
    return { P, X }; },
};

/* ======================= the pieces table ======================= */
export const PIECES4 = {
  galea: { seg: 'head', ref: 0 }, cassis: { seg: 'head', ref: 1 }, crista: { seg: 'head', ref: 'arm81_crista' }, murmillo: { seg: 'head', ref: 3 },
  helm5: { seg: 'head', ref: 4 }, flavhelm: { seg: 'head', ref: 'arm81_flavhelm' }, centurion: { seg: 'head', ref: 29 }, steelhelm: { seg: 'head', ref: 'arm81_steelhelm' },
  thrachelm: { seg: 'head', ref: 'arm81_thracian' },
  pectorale: { seg: 'torso', ref: 7, col: '#b07a3a', style: 'plain' }, lorica: { seg: 'torso', ref: 8, col: '#c99a40', style: 'scale', layer: 'mail' },
  musculata: { seg: 'torso', ref: 9, col: '#c79a3a', style: 'muscle' }, amazon: { seg: 'torso', ref: 11, col: '#d0a446', style: 'wings' },
  flavchest: { seg: 'torso', ref: 10, col: '#a8743a', style: 'figures', skirt: '#9a2a22' }, thorax: { seg: 'torso', ref: 'arm81_thorax', col: '#8d9398', style: 'plates', high: 1, pauldron: 1 },
  ornate: { seg: 'torso', ref: 44, col: '#d8ae52', style: 'ornate', high: 1 },
  balteus: { seg: 'belt', ref: 28 }, balteus1: { seg: 'belt', ref: 27, col: '#7a4a2a' },
  wraps: { seg: 'armL', ref: 13, col: '#8e8d88', style: 'pad', layer: 'pad' }, bracers: { seg: 'armL', ref: 'arm81_bracers', col: '#d6ab4c', style: 'bracer' },
  manica: { seg: 'armU', ref: 14, col: '#c4b08a', lames: 6, flange: 1 }, provmanica: { seg: 'armU', ref: 'arm81_manica', col: '#6d6f70', fur: 1 },
  galerus: { seg: 'armU', ref: 18, col: SILVER, lames: 3, shoulder: 4 }, cestus: { seg: 'hand', ref: 17, col: '#a07a52' },
  legwrapsU: { seg: 'legU', ref: 19, col: '#8a4f26', thumb: 'armthumb81_legwrapsU' }, femoralia: { seg: 'legU', ref: 22, col: '#5f6656', thumb: 'armthumb81_femoralia' },
  thighplate: { seg: 'legU', ref: 25, col: '#d6ab4c', thumb: 'armthumb81_thighplate' }, legwraps: { seg: 'legL', ref: 21, col: '#9a9890', style: 'pad', layer: 'pad' },
  ocrea: { seg: 'legL', ref: 23, col: '#dcb34c', knee: 'gold' }, greaves: { seg: 'legL', ref: 'arm81_greaves', col: '#c9a03a', knee: 'lion', engr: 1 },
  cnemis: { seg: 'legL', ref: 26, col: '#c9ced3', knee: 'dome' }, lgreaves: { seg: 'legL', ref: 'arm81_lgreaves', col: '#4e3424', lace: 1 },
};

export function arm4(B, k, sd = 'L') {
  const K = B.kit, P = K.P, GI = K.GI, D = PIECES4[k], out = [], sx = sd === 'L' ? 1 : -1;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], nrm = (a) => { const l = Math.hypot(...a) || 1; return a.map(v => v / l); };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const tAl = (p, a, b) => { const ab = sub(b, a); return dot(sub(p, a), ab) / dot(ab, ab); };
  const lin = (hex) => { const c = new THREE.Color(hex).convertSRGBToLinear(); return [c.r, c.g, c.b]; };
  const sh = (c, v) => lin(LI(c)).map(x => x * v);
  const toon = (c, ex) => K.makeToon(c, ex);
  const vmat = () => toon('#ffffff', { vertexColors: true, side: THREE.DoubleSide });
  const rig_ = (geo, mat, bone, at2, q) => { const m = K.rigid(geo, mat, bone, at2, null); const bp = P(bone); m.position.set(at2[0] - bp[0], at2[1] - bp[1], at2[2] - bp[2]); if (q) m.quaternion.copy(q);
    m.userData.ownMat = 1; const ink = m.userData.ink; if (ink) { ink.position.copy(m.position); ink.quaternion.copy(m.quaternion); } out.push(m); return m; };
  const shell = (name, mask, colFn, off, hem) => { const mat = K.maskedMat(); if (hem) mat.userData.hem = { w: 0.0045, col: hem, bw: 0, bcol: [0, 0, 0] }; const m = K.shellFrom(name, mask, colFn, off, { mat }); m.userData.ownMat = 1; out.push(m); return m; };
  const hexA = (h) => { const c = new THREE.Color(h); return [c.r * 255, c.g * 255, c.b * 255].map(Math.round); };
  const darker = (h, f) => '#' + new THREE.Color(h).multiplyScalar(f).getHexString();
  /* the skin radius round a limb axis at t, toward direction d (rest pose) */
  const radAt = (a, b, t, d) => { const c = a.map((v, i) => v + (b[i] - v) * t); const hit = K.hitSkin(c.map((v, i) => v + d[i] * 0.3), d.map(v => -v), 0.35); return hit ? Math.hypot(...sub(hit, c)) : 0.05; };
  const outward = (axis, pref) => { const o = sub(pref, axis.map(v => v * dot(pref, axis))); return nrm(o); };
  /* lames: overlapping partial cylinders round a limb segment, each a little larger than the one above (roof-tile overlap) */
  const lames = (bone, a, b, t0, t1, n, col, arc, pref, extra = 0.004) => {
    const axis = nrm(sub(b, a)), o = outward(axis, pref), X = cross(axis, o), q = basisQ(X, axis.map(v => -v));
    const len = Math.hypot(...sub(b, a)) * (t1 - t0) / n;
    for (let i = 0; i < n; i++) { const t = t0 + (t1 - t0) * (i + 0.5) / n, c = a.map((v, j) => v + (b[j] - v) * t);
      const r = radAt(a, b, t, o) + LAYER.plate + extra + i * 0.0012; const g = new THREE.CylinderGeometry(r + 0.004, r - 0.001, len * 1.35, 24, 1, true, Math.PI - arc / 2, arc);
      const rim = new THREE.CylinderGeometry(r + 0.0055, r + 0.005, len * 0.18, 24, 1, true, Math.PI - arc / 2, arc); rim.translate(0, -len * 0.58, 0);
      rig_(mergeL([[g, i % 2 ? col : darker(col, 0.9)], [rim, darker(col, 0.62)]]), vmat(), bone, c, q); }
  };
  if (D.seg === 'head') {
    if (k === 'murmillo') { out.push(...murmKit(B, { manica: false, greave: false, belt: false, wraps: false, sword: false, shield: false })); return out; }
    const s = 1.07 * K.hs, H = HELM[k](), geo = mergeL(H.P); geo.scale(s, s, s);
    rig_(geo, vmat(), 'he', K.HO, null);
    for (const [g, m] of H.X || []) { g.scale(s, s, s); rig_(g, m, 'he', K.HO, null); }
    return out;
  }
  if (D.seg === 'torso') {
    const top = D.high ? 1.49 : 1.465, bot = D.style === 'scale' ? 1.06 : 1.1, base = LAYER[D.layer || 'plate'];
    const topAt = (x) => { const ax = Math.abs(x); return ax < 0.065 ? top - 0.045 + ax * 0.45 : ax < 0.165 ? 1.535 : 1.52 - (ax - 0.165) * 1.2; };   /* a neckline, then over the shoulders */
    const mask = (p, g) => g === GI.T || (D.high && (g === GI.AL || g === GI.AR) && p[1] > 1.37 && Math.abs(p[0]) < 0.24) ? Math.min(p[1] - bot, topAt(p[0]) - p[1], 0.03) : -1;
    const rim = (m) => m < 0.007 ? 0.0028 : 0;                                             /* a rolled edge all round */
    const DISP = {
      plain: (p) => 0.001 * Math.max(0, 1 - Math.hypot(p[0], p[1] - 1.36) / 0.05),
      muscle: (p) => p[2] > 0 ? 0.0022 : 0,                                                 /* the skin's own pecs/abs carry the sculpt; a little extra relief */
      scale: (p) => { const r = p[1] * 95, f = r - Math.floor(r); return 0.0025 * f; },
      wings: (p) => { const d1 = Math.abs(p[1] - 1.1 - (p[0] + 0.16) * 1.25), d2 = Math.abs(p[1] - 1.1 - (0.16 - p[0]) * 1.25); return d1 < 0.02 || d2 < 0.02 ? 0.003 : 0; },
      figures: (p) => 0, plates: (p) => { const f = (p[1] * 20) % 1; return 0.004 * f; }, ornate: (p) => 0.0012,
    };
    const COLF = {
      plain: (p) => { const w = Math.abs(Math.hypot(p[0], (p[1] - 1.36) * 1.2) - 0.035) < 0.004 && p[2] > 0; return w ? sh('#e0b060', 1) : sh(D.col, 0.95 + 0.08 * Math.sin(p[0] * 30)); },
      muscle: (p) => sh(D.col, 1),
      scale: (p) => { const r = p[1] * 95, row = Math.floor(r), f = r - row, u = ((Math.atan2(p[0], p[2]) * 10 + (row % 2) * 0.5) % 1 + 1) % 1; return sh(D.col, Math.hypot(u - 0.5, f - 0.2) < 0.5 ? 0.75 + 0.35 * f : 0.5); },
      wings: (p) => { const d1 = Math.abs(p[1] - 1.1 - (p[0] + 0.16) * 1.25), d2 = Math.abs(p[1] - 1.1 - (0.16 - p[0]) * 1.25); const d = Math.min(d1, d2); return d < 0.02 ? sh(D.col, 1.1 - (Math.sin(p[0] * 300 + p[1] * 300) > 0.4 ? 0.35 : 0)) : sh(D.col, 0.85); },
      figures: (p) => { const fig = p[2] > 0 && p[1] > 1.18 && p[1] < 1.42 && Math.sin(p[0] * 90) * Math.sin(p[1] * 70) > 0.55; return fig ? lin('#b8411f') : sh(D.col, 1); },
      plates: (p) => sh(D.col, ((p[1] * 20) % 1) < 0.14 ? 0.55 : 1),
      ornate: (p) => { for (const s2 of [1, -1]) { const d = Math.hypot(p[0] - s2 * 0.07, p[1] - 1.27); if (d < 0.028 && p[2] > 0) return d < 0.017 ? (Math.sin(Math.atan2(p[1] - 1.27, p[0] - s2 * 0.07) * 8) > 0 ? lin('#f2ead2') : lin('#2e5aa8')) : lin('#f2ead2'); }
        if (p[1] > 1.4 && p[2] > 0) return Math.sin(p[0] * 120) > 0.2 ? lin('#2e5aa8') : lin('#f2ead2'); return sh(D.col, 1); },
    };
    shell('r4_' + k, mask, COLF[D.style], (p, m) => base + DISP[D.style](p) + rim(m), hexA(darker(D.col, 0.55)));
    /* shoulder straps: the breast and back plates joined over each shoulder */
    if (D.pauldron) for (const s2 of ['L', 'R']) { const S0 = P('s' + s2), x2 = s2 === 'L' ? 1 : -1;
      for (let i = 0; i < 3; i++) { const g = new THREE.SphereGeometry(1, 22, 10, 0, Math.PI * 2, 0, Math.PI * (0.36 + i * 0.02)); const kk = 1 + i * 0.1; g.scale(0.085 * kk, 0.06 * kk, 0.085 * kk);
        g.scale(1.15, 1.15, 1.15); const m = rig_(colorize(g, LI(i % 2 ? D.col : darker(D.col, 0.85))), vmat(), 's' + s2, [S0[0] + x2 * (0.04 + i * 0.012), S0[1] + 0.045 - i * 0.032, S0[2]]); m.rotation.z = x2 * (0.45 + i * 0.25); } }
    if (D.skirt) for (let i = 0; i < 16; i++) { const a = -Math.PI + i / 16 * Math.PI * 2 + 0.1; const g = new THREE.BoxGeometry(0.036, 0.1, 0.006); const r = 0.155;
      const m = rig_(colorize(g, i % 2 ? D.skirt : darker(D.skirt, 0.75)), vmat(), 'pe', [Math.sin(a) * r, 1.02, Math.cos(a) * r * 0.85]); m.rotation.y = a; }
    return out;
  }
  if (D.seg === 'belt') { if (k === 'balteus') return murmKit(B, { helm: false, manica: false, greave: false, wraps: false, sword: false, shield: false });
    const by = (p) => 1.082 - 0.011 * Math.max(0, Math.min(1, p[2] / 0.09));
    shell('r4_' + k, (p, g) => g === GI.T ? 0.03 - Math.abs(p[1] - by(p)) : -1, (p) => sh(D.col, 0.9 + 0.1 * Math.sin(p[0] * 120)), (p, m) => LAYER.belt + (m < 0.006 ? 0.002 : 0), hexA('#3a2414'));
    const g = new THREE.TorusGeometry(0.03, 0.008, 8, 24); rig_(colorize(g, '#5a5550'), vmat(), 'pe', [0, 1.066, 0.142], null); return out; }
  if (D.seg === 'armU') { const S0 = P('s' + sd), E0 = P('e' + sd), gi = GI['A' + sd];
    if (D.fur) {   /* Manica (arm81_manica): a fur mantle on the shoulder, an iron shoulder plate with a riveted rim, an octagonal plate on the upper arm */
      shell('r4_fur' + sd, (p, g) => (g === gi || (g === GI.T && Math.abs(p[0]) > 0.11 && p[0] * sx > 0 && p[1] > 1.38)) ? Math.min(band(tAl(p, S0, E0), -0.35, 0.45), 1) : -1,
        (p) => sh('#5a4532', 0.7 + 0.45 * (Math.sin(p[0] * 700) * Math.sin(p[1] * 650) * 0.5 + 0.5)), (p) => 0.012 + 0.006 * (Math.sin(p[0] * 520 + p[2] * 610) * 0.5 + 0.5));
      for (let i = 0; i < 2; i++) { const g = new THREE.SphereGeometry(1, 22, 10, 0, Math.PI * 2, 0, Math.PI * 0.4); const kk = 1 + i * 0.12; g.scale(0.09 * kk, 0.065 * kk, 0.09 * kk);
        const m = rig_(colorize(g, i ? '#7c7f82' : '#5d6063'), vmat(), 's' + sd, [S0[0] + sx * (0.04 - i * 0.01), S0[1] + 0.025 - i * 0.03, S0[2]]); m.rotation.z = sx * (0.6 + i * 0.25); }
      const axis = nrm(sub(E0, S0)), o = outward(axis, [sx, 0, 0.2]), c = S0.map((v, i) => v + (E0[i] - v) * 0.45), r = radAt(S0, E0, 0.45, o) + 0.02;
      const oct = new THREE.CylinderGeometry(0.045, 0.045, 0.008, 8); oct.rotateX(Math.PI / 2); rig_(merge([[oct, '#4a4d50'], [at(new THREE.TorusGeometry(0.045, 0.004, 4, 8), 0, 0, 0.004), '#8c8f92']]), vmat(), 's' + sd, c.map((v, i) => v + o[i] * r), basisQ(cross(axis, o), axis.map(v => -v)));
      return out; }
    if (D.lames) lames('s' + sd, S0, E0, 0.12, 0.92, D.lames, D.col, Math.PI * 1.45, [sx, 0, 0.25]);
    if (D.flange) { const g = new THREE.SphereGeometry(1, 22, 10, 0, Math.PI * 2, 0, Math.PI * 0.42); g.scale(0.085, 0.065, 0.08); const m = rig_(colorize(g, darker(D.col, 1.05)), vmat(), 's' + sd, [S0[0] + sx * 0.035, S0[1] + 0.02, S0[2]]); m.rotation.z = sx * 0.6;
      const fl = plate([[-0.06, 0], [0.06, 0], [0.05, 0.05], [-0.04, 0.06]], 0.008); fl.rotateY(Math.PI / 2); const m2 = rig_(colorize(fl, '#b89a62'), vmat(), 's' + sd, [S0[0] + sx * 0.06, S0[1] + 0.07, S0[2]]); m2.rotation.z = sx * 0.6; }
    if (D.shoulder) for (let i = 0; i < D.shoulder; i++) { const g = new THREE.SphereGeometry(1, 22, 10, 0, Math.PI * 2, 0, Math.PI * (0.32 + i * 0.03)); const kk = 1 + i * 0.07; g.scale(0.088 * kk, 0.055 * kk, 0.085 * kk);
      const rv = new THREE.TorusGeometry(1, 0.035, 4, 30); rv.rotateX(Math.PI / 2); const th = Math.PI * (0.32 + i * 0.03); rv.scale(0.088 * kk * Math.sin(th), 1, 0.085 * kk * Math.sin(th)); rv.translate(0, 0.055 * kk * Math.cos(th), 0);
      const m = rig_(mergeL([[g, i % 2 ? D.col : darker(D.col, 0.88)], [rv, darker(D.col, 0.6)]]), vmat(), 's' + sd, [S0[0] + sx * (0.03 + i * 0.006), S0[1] + 0.03 - i * 0.032, S0[2]]); m.rotation.z = sx * (0.5 + i * 0.22); }
    return out; }
  if (D.seg === 'armL') { const E0 = P('e' + sd), W0 = P('w' + sd), gi = GI['A' + sd];
    if (D.style === 'pad') { shell('r4_' + k + sd, (p, g) => g === gi ? band(tAl(p, E0, W0), 0.16, 0.99) : -1, (p) => sh(D.col, Math.sin(tAl(p, E0, W0) * 44) > 0 ? 1 : 0.72), (p) => LAYER.pad + 0.0025 * Math.max(0, Math.sin(tAl(p, E0, W0) * 44)), null); return out; }
    shell('r4_' + k + sd, (p, g) => g === gi ? band(tAl(p, E0, W0), 0.24, 0.93) : -1, (p) => sh(D.col, (Math.sin(p[1] * 260) * Math.sin(p[0] * 240 + p[2] * 230)) > 0.45 ? 0.62 : 1),
      (p, m) => LAYER.plate + (m < 0.007 ? 0.003 : 0) + 0.0015 * (Math.sin(p[1] * 260) * Math.sin(p[0] * 240 + p[2] * 230) > 0.45 ? 1 : 0), hexA('#8a6420')); return out; }
  if (D.seg === 'hand') { const W0 = P('w' + sd), gi = GI['A' + sd], tip = ENDS['w' + sd];
    shell('r4_' + k + sd, (p, g) => g === gi ? band(tAl(p, W0, tip), -0.4, 0.62) : -1, (p) => sh(D.col, Math.sin(p[1] * 220 + p[2] * 90) > 0 ? 1 : 0.7), (p) => 0.006 + 0.002 * Math.max(0, Math.sin(p[1] * 220 + p[2] * 90)), null); return out; }
  if (D.seg === 'legU') {   /* TASSETS: three overlapping curved plates hanging over the thigh front + outside — rigid on the hip bone, so they swing with the leg */
    const H0 = P('h' + sd), K0 = P('k' + sd), axis = nrm(sub(K0, H0)), o = outward(axis, [sx * 0.55, 0, 0.85]), X = cross(axis, o), q = basisQ(X, axis.map(v => -v));
    for (let i = 0; i < 3; i++) { const t = 0.2 + i * 0.22, c = H0.map((v, j) => v + (K0[j] - v) * t), r = radAt(H0, K0, t, o) + LAYER.plate + 0.006 + i * 0.003, hgt = 0.13, arc = Math.PI * 1.1;
      const g = new THREE.CylinderGeometry(r + 0.003, r, hgt, 24, 1, true, Math.PI - arc / 2, arc); const bt = new THREE.CylinderGeometry(r + 0.0035, r + 0.003, 0.014, 24, 1, true, Math.PI - arc / 2, arc); bt.translate(0, -hgt / 2 + 0.007, 0);
      const rv = []; for (const a of [-0.9, 0, 0.9]) rv.push([ball(0.005, Math.sin(Math.PI + a) * (r + 0.004), hgt / 2 - 0.012, Math.cos(Math.PI + a) * (r + 0.004)), '#d8c79a']);
      const parts = [[g, i % 2 ? D.col : darker(D.col, 0.88)], [bt, darker(D.col, 0.55)], ...rv];
      if (k === 'legwrapsU') for (let s2 = 1; s2 < 5; s2++) { const a = Math.PI - arc / 2 + arc * s2 / 5; parts.push([at(new THREE.BoxGeometry(0.003, hgt, 0.003), Math.sin(a) * (r + 0.0035), 0, Math.cos(a) * (r + 0.0035)), darker(D.col, 0.5)]); }
      rig_(mergeL(parts), vmat(), 'h' + sd, c, q); }
    return out; }
  if (D.seg === 'legL') { const K0 = P('k' + sd), A0 = P('a' + sd), gi = GI['L' + sd];
    if (D.style === 'pad') { shell('r4_' + k + sd, (p, g) => g === gi ? band(tAl(p, K0, A0), 0.06, 0.9) : -1, (p) => sh(D.col, Math.sin(tAl(p, K0, A0) * 40) > 0 ? 1 : 0.72), (p) => LAYER.pad + 0.0025 * Math.max(0, Math.sin(tAl(p, K0, A0) * 40)), null); return out; }
    /* a greave shaped to the shin + calf: front and sides, a ridge down the shin, flared at the ankle, a rolled edge */
    const front = (p) => { const c = K0.map((v, i) => v + (A0[i] - v) * tAl(p, K0, A0)); const d = nrm(sub(p, c)); return d[2] * 0.85 + d[0] * sx * 0.25; };
    shell('r4_' + k + sd, (p, g, n) => g === gi ? Math.min(band(tAl(p, K0, A0), D.knee ? -0.05 : 0.05, 0.88), front(p) + 0.42) : -1,
      (p) => { const t = tAl(p, K0, A0), f = front(p); if (D.lace && f < -0.25 && Math.abs(Math.sin(t * 60)) < 0.3) return lin('#c9b48a'); if (D.engr && Math.sin(p[1] * 300) * Math.sin(p[0] * 260 + p[2] * 200) > 0.5) return sh(D.col, 0.6); return sh(D.col, 0.8 + 0.3 * Math.max(0, f)); },
      (p, m) => LAYER.plate + 0.004 * Math.max(0, front(p) - 0.7) / 0.3 + 0.006 * Math.max(0, tAl(p, K0, A0) - 0.72) / 0.16 + (m < 0.006 ? 0.0028 : 0), hexA(darker(D.col, 0.55)));
    if (D.knee) { const cap = new THREE.SphereGeometry(1, 18, 12, -1.3, 2.6, 0.25, 1.9); cap.scale(0.056, 0.066, 0.046); const parts = [[cap, D.col]];
      if (D.knee === 'dome') parts.push([at(new THREE.SphereGeometry(0.02, 10, 8).scale(1, 1, 0.6), 0, 0, 0.044), darker(D.col, 0.8)]);
      if (D.knee === 'lion') parts.push([at(new THREE.SphereGeometry(0.022, 10, 8).scale(1, 1, 0.6), 0, 0.005, 0.044), '#a37c28']);
      const KK = P('k' + sd); rig_(mergeL(parts), vmat(), 'k' + sd, [KK[0], KK[1] + 0.012, KK[2] + 0.05]); }
    return out; }
  return out;
  function band(t, t0, t1) { return Math.min(t - t0, t1 - t) * 0.25; }
}
export function outfit4(B, list) { const out = []; for (const it of list) out.push(...arm4(B, it.k, it.sd)); return out; }
export { outfitCheck };

/* ======================= WEAPONS from his cards (weapons.jpg cell = W[k].img) ======================= */
const STL = '#cfd4d8', DSTL = '#8e979e', GRIP = '#2a1d16', BRZ = '#8a5a2a';
const leaf = (len, w, y0) => plate([[-w * 0.55, y0], [w * 0.55, y0], [w * 0.6, y0 + len * 0.3], [w * 0.45, y0 + len * 0.8], [0, y0 + len], [-w * 0.45, y0 + len * 0.8], [-w * 0.6, y0 + len * 0.3]], 0.008);
const hilt = (pom = '#3a2a20', gd = BRZ, gr = GRIP) => [[cyl(0.0145, 0.0145, 0.1, 0, 10), gr], [at(new THREE.SphereGeometry(0.026, 12, 8).scale(1, 0.8, 1), 0, -0.064, 0), pom], [box(0.09, 0.022, 0.04, 0, 0.06), gd]];
export const WGEO4 = {
  gladius: () => merge([...hilt('#2a2420', '#3a2a20'), [leaf(0.5, 0.054, 0.07), STL], [plate([[-0.005, 0.09], [0.005, 0.09], [0.003, 0.48], [-0.003, 0.48]], 0.0095), DSTL]]),
  mace: () => merge([[cyl(0.015, 0.018, 0.6, 0.2, 8), '#1f2733'], [at(new THREE.SphereGeometry(0.055, 12, 10).scale(1, 1.3, 1), 0, 0.52, 0), '#3a5aa0'],
    ...Array.from({ length: 10 }, (_, i) => { const a = i * 2.4, y = 0.48 + (i % 3) * 0.035; return [at(new THREE.ConeGeometry(0.01, 0.035, 5).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), V3([Math.cos(a), 0.2, Math.sin(a)]).normalize())), Math.cos(a) * 0.058, y, Math.sin(a) * 0.058), '#c9ced3']; })]),
  sica: () => merge([...hilt('#c99a3e', '#c99a3e'), [plate([[-0.018, 0.07], [0.02, 0.07], [0.032, 0.24], [0.02, 0.38], [-0.04, 0.5], [-0.012, 0.36], [-0.004, 0.22]], 0.008), STL]]),
  hasta: () => merge([[cyl(0.013, 0.013, 1.8, 0.15, 8), '#4a3420'], [at(leaf(0.22, 0.05, 0), 0, 1.04, 0), STL], [at(new THREE.ConeGeometry(0.014, 0.06, 6).rotateZ(Math.PI), 0, -0.76, 0), DSTL]]),
  stones: () => merge([[ball(0.036, 0, 0.06, 0.03), '#9a8a74'], [ball(0.03, 0.04, 0.09, 0.02), '#8a7a66'], [ball(0.028, -0.035, 0.1, 0.035), '#a59580']]),
  knives: () => merge([[cyl(0.012, 0.012, 0.09, 0, 8), '#3a2a20'], [box(0.05, 0.014, 0.026, 0, 0.05), BRZ], [plate([[-0.016, 0.055], [0.016, 0.055], [0.0, 0.25]], 0.006), STL]]),
  trident: () => merge([[cyl(0.013, 0.013, 1.75, 0.15, 8), '#5a3a22'], [box(0.22, 0.02, 0.02, 0, 1.02), DSTL], ...[-0.1, 0, 0.1].map(x => [at(new THREE.CylinderGeometry(0.006, 0.008, 0.22, 6), x, 1.13, 0), DSTL]),
    ...[-0.1, 0, 0.1].map(x => [at(new THREE.ConeGeometry(0.016, 0.05, 4), x, 1.26, 0), STL])]),
  rudis: () => merge([...hilt('#8a6234', '#8a6234', '#8a6234'), [leaf(0.5, 0.05, 0.07), '#c79a5a']]),
  severedArm: () => merge([[cyl(0.04, 0.032, 0.3, 0.13, 10), '#c08a68'], [at(new THREE.CylinderGeometry(0.042, 0.042, 0.012, 12), 0, 0.285, 0), '#8e1612'], [at(new THREE.CylinderGeometry(0.044, 0.044, 0.03, 10), 0, 0.2, 0), '#a5734a'],
    [at(new THREE.SphereGeometry(0.035, 10, 8).scale(0.8, 1.5, 1.2), 0, -0.04, 0), '#c08a68']]),
  severedLeg: () => merge([[cyl(0.05, 0.038, 0.42, 0.2, 10), '#c08a68'], [at(new THREE.CylinderGeometry(0.052, 0.052, 0.012, 12), 0, 0.41, 0), '#8e1612'], [at(new THREE.SphereGeometry(0.045, 10, 8).scale(1, 0.8, 2.3), 0, -0.03, 0.07), '#6a4a30'],
    ...[0.05, 0.12, 0.2].map(y => [at(new THREE.TorusGeometry(0.046, 0.005, 4, 14).rotateX(Math.PI / 2), 0, y, 0), '#4f4941'])]),
  axe: () => merge([[tube([[0, -0.1, 0], [0.01, 0.2, 0], [0.0, 0.45, 0], [-0.02, 0.6, 0]], 0.016, 16, 8), '#3a2a1c'], [at(plate([[0, -0.05], [0.14, -0.1], [0.19, 0.0], [0.14, 0.1], [0, 0.05]], 0.014), 0, 0.53, 0), STL], [box(0.035, 0.06, 0.03, 0, 0.53, 0), DSTL]]),
  falcata: () => merge([[cyl(0.014, 0.014, 0.1, 0, 10), '#3a2a20'], [tube([[0, -0.05, 0], [0.04, -0.07, 0], [0.05, -0.02, 0]], 0.008, 8, 6), BRZ], [box(0.07, 0.02, 0.035, 0, 0.06), BRZ],
    [plate([[-0.02, 0.07], [0.022, 0.07], [0.035, 0.22], [0.055, 0.4], [0.02, 0.56], [-0.01, 0.42], [-0.025, 0.22]], 0.008), STL]]),
  bow: () => { const R = 0.6, arc = new THREE.TorusGeometry(R, 0.014, 6, 32, 1.7); arc.rotateZ(Math.PI - 0.85); arc.translate(R, 0, 0);
    const tips = [[R * (1 - Math.cos(0.85)), R * Math.sin(0.85), 0], [R * (1 - Math.cos(0.85)), -R * Math.sin(0.85), 0]];
    const g = merge([[arc, '#6a4428'], [cyl(0.018, 0.018, 0.1, 0, 8), '#3a2a20'], ...tips.map(t => [at(new THREE.ConeGeometry(0.01, 0.04, 5), t[0] + 0.01, t[1] * 1.02, 0), '#e8dcc0'])]); g.userData = { tips }; return g; },
  pugio: () => merge([[cyl(0.012, 0.012, 0.09, 0, 8), '#2a2420'], [ball(0.022, 0, -0.055, 0), '#c99a3e'], [box(0.06, 0.016, 0.03, 0, 0.05), '#c99a3e'], [leaf(0.2, 0.04, 0.055), STL]]),
  scissor: () => merge([[cyl(0.046, 0.04, 0.24, -0.04, 14), '#5f5c56'], [at(new THREE.TorusGeometry(0.047, 0.005, 4, 16).rotateX(Math.PI / 2), 0, 0.075, 0), '#8e979e'],
    [at(new THREE.TorusGeometry(0.1, 0.016, 6, 22, Math.PI).rotateY(Math.PI / 2).rotateX(Math.PI), 0, 0.2, 0), '#d6dadd']]),
  sling: () => merge([[tube([[0, 0.02, 0], [0.01, -0.12, 0.01], [0.0, -0.3, 0.0]], 0.003, 12, 4), '#c9b8a0'], [tube([[0, 0.02, 0], [-0.01, -0.12, -0.01], [0.0, -0.3, 0.0]], 0.003, 12, 4), '#c9b8a0'],
    [at(new THREE.SphereGeometry(0.03, 10, 8).scale(1.2, 0.8, 1), 0, -0.31, 0), '#7a4a2a'], [ball(0.016, 0, -0.29, 0), '#8a7a66']]),
  arcu: () => merge([[box(0.05, 0.62, 0.05, 0, 0.18), '#6a4a2c'], [at(new THREE.TorusGeometry(0.28, 0.012, 6, 24, Math.PI * 0.75).rotateZ(Math.PI * 0.125), 0, 0.33, 0), '#3a3a3a'],
    [box(0.48, 0.004, 0.004, 0, 0.36), '#e8dcc0'], [box(0.012, 0.32, 0.012, 0, 0.42, 0.03), '#8a6a3a'], [at(new THREE.ConeGeometry(0.012, 0.04, 4), 0, 0.6, 0.03), STL]]),
  charun: () => merge([[cyl(0.017, 0.02, 0.75, 0.25, 8), '#3a2a1c'], [box(0.24, 0.1, 0.1, 0, 0.6), '#3a3634'], [box(0.25, 0.02, 0.105, 0, 0.56), '#6b625a']]),
  flavgl: () => merge([...hilt('#d6ab4c', '#d6ab4c', '#5a2a1a'), [leaf(0.6, 0.06, 0.07), '#e6e9ec'], [plate([[-0.005, 0.1], [0.005, 0.1], [0.004, 0.55], [-0.004, 0.55]], 0.0095), '#d6ab4c']]),
  jade: () => merge([[cyl(0.014, 0.014, 1.8, 0.15, 8), '#2f7a52'], [at(leaf(0.26, 0.055, 0), 0, 1.04, 0), '#4fae7a'], ...[0, 1, 2].map(i => [at(new THREE.ConeGeometry(0.012, 0.12, 5).rotateZ(Math.PI + (i - 1) * 0.3), (i - 1) * 0.02, 0.97, 0), '#c23a2a'])]),
  flail: () => merge([[cyl(0.017, 0.02, 0.42, 0.13, 8), '#c9a05a'], ...[-1, 0, 1].flatMap(i => { const e = [i * 0.06, 0.5 - Math.abs(i) * 0.04, 0];
      return [[tube([[0, 0.34, 0], [i * 0.03, 0.43, 0], e], 0.003, 8, 4), '#5a5550'], [at(new THREE.SphereGeometry(0.03, 10, 8), ...e), '#2a2a2a'],
        ...[0, 1, 2, 3].map(j => [at(new THREE.ConeGeometry(0.007, 0.024, 4).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), V3([Math.cos(j * 1.6), Math.sin(j * 1.6), 0.5]).normalize())), e[0] + Math.cos(j * 1.6) * 0.03, e[1] + Math.sin(j * 1.6) * 0.03, 0.01), '#9a9a9a'])]; })]),
  pilum: () => merge([[cyl(0.015, 0.015, 1.25, 0.05, 8), '#5a3a22'], [ball(0.03, 0, 0.7, 0), '#4a4a4a'], [cyl(0.0065, 0.0065, 0.55, 0.95, 6), DSTL], [at(new THREE.ConeGeometry(0.016, 0.06, 4), 0, 1.25, 0), STL]]),
  labrys: () => merge([[cyl(0.016, 0.018, 1.0, 0.3, 8), '#3a2a1c'], [at(plate([[0, -0.05], [0.16, -0.11], [0.19, 0.0], [0.16, 0.11], [0, 0.05]], 0.012), 0, 0.72, 0), STL],
    [at(plate([[0, -0.05], [-0.16, -0.11], [-0.19, 0.0], [-0.16, 0.11], [0, 0.05]], 0.012), 0, 0.72, 0), STL], [box(0.05, 0.1, 0.04, 0, 0.72), '#8e979e']]),
  psykhe: () => merge([[cyl(0.015, 0.015, 0.11, 0, 10), '#20202a'], [box(0.12, 0.022, 0.04, 0, 0.065), '#4a4f7a'], [ball(0.028, 0, -0.07), '#6a72b8'],
    [plate(Array.from({ length: 13 }, (_, i) => [0.022 + 0.008 * Math.sin(i * 1.4), 0.07 + i * 0.05]).concat([[0, 0.75]], Array.from({ length: 13 }, (_, i) => [-0.022 - 0.008 * Math.sin((12 - i) * 1.4), 0.07 + (12 - i) * 0.05])), 0.008), '#5d6db8']]),
  lyre: () => { const fr = new THREE.TorusGeometry(0.11, 0.013, 6, 20, Math.PI); fr.rotateZ(Math.PI); fr.translate(0, 0.11, 0);
    return merge([[fr, '#d6ab4c'], ...[-1, 1].map(s => [tube([[s * 0.11, 0.11, 0], [s * 0.14, 0.24, 0], [s * 0.1, 0.34, 0]], 0.012, 10, 6), '#d6ab4c']), [box(0.24, 0.02, 0.02, 0, 0.33), '#d6ab4c'],
      ...[-0.06, -0.02, 0.02, 0.06].map(x => [box(0.003, 0.24, 0.003, x, 0.21), '#f0e6cc'])]); },
};
/* the hold per weapon: arm targets (mm, figure space), the hand axis direction (where the hand's forward axis points), the mount
   (blade along +f = normal grip, -f = reverse / overhand, -u = hanging), a two-hand partner point along the weapon (m from the grip) */
const RH = (h, hp = [1, -1, -0.3]) => ({ R: h, hpR: hp });
export const HOLD4 = {
  sword: { arm: RH([-300, 1100, 300]), f: [-0.08, 0.12, 1], mount: 'f', note: 'forward and low' },
  dagger: { arm: RH([-280, 1300, 260]), f: [0.1, 1, 0.25], mount: '-f', note: 'reverse grip' },
  spear: { arm: RH([-230, 1620, 60], [1, 0.3, -1]), f: [0.05, 0.1, -1], mount: '-f', two: 0.55, note: 'overhand, point forward' },
  hafted: { arm: RH([-310, 1420, 120], [1, -0.6, -0.6]), f: [-0.15, 1, -0.25], mount: 'f', note: 'raised, head up' },
  throw: { arm: RH([-260, 1640, -60], [1, 0.3, -1]), f: [0, 1, 0], mount: 'f', note: 'raised to throw' },
  bow: { arm: { L: [60, 1460, 560], hpL: [1, -0.2, -0.2], R: [-60, 1500, 160], hpR: [1, -0.3, -1] }, fL: [0, 1, 0.05], mount: 'f', hand: 'L', string: 1, note: 'drawn' },
  crossbow: { arm: { R: [-150, 1420, 280], hpR: [1, -1, -0.4] }, f: [0.05, 0.02, 1], mount: 'f', two: 0.32, note: 'shouldered' },
  labrys: { arm: RH([-170, 1020, 300]), f: [0.35, 1, 0.35], mount: 'f', two: 0.32, note: 'two-handed' },
  sling: { arm: RH([-400, 980, 140], [1, -1, 0]), f: [0, 0, 1], mount: '-u', note: 'hanging' },
  lyre: { arm: { L: [120, 1120, 400], hpL: [1, -0.6, -0.2], R: [-40, 1150, 420], hpR: [1, -1, -0.3] }, fL: [0, 1, 0.1], mount: 'f', hand: 'L', note: 'held, plucked' },
  arm: { arm: RH([-260, 1060, 300]), f: [0, 0.05, 1], mount: 'u', note: 'strapped on the forearm, blade past the fist' },
  shield: { note: 'strapped + handle (round 3)' },
};
export const WHOLD4 = { gladius: 'sword', rudis: 'sword', flavgl: 'sword', psykhe: 'sword', sica: 'sword', falcata: 'sword', pugio: 'dagger', knives: 'dagger',
  hasta: 'spear', jade: 'spear', pilum: 'spear', trident: 'spear', mace: 'hafted', axe: 'hafted', charun: 'hafted', flail: 'hafted', severedArm: 'hafted', severedLeg: 'hafted',
  stones: 'throw', bow: 'bow', arcu: 'crossbow', labrys: 'labrys', sling: 'sling', lyre: 'lyre', scissor: 'arm', scutum: 'shield', thracian: 'shield', achilles: 'shield' };

/* put weapon k in the hand (after the pose + grip constraint). Returns meshes; mesh.userData.w4 = { tips } for the bow string */
export function weapon4(B, k, sd) {
  const K = B.kit, P = K.P, out = []; const H = HOLD4[WHOLD4[k]] || HOLD4.sword; sd = sd || H.hand || 'R';
  if (WHOLD4[k] === 'shield') return weaponKit(B, { L: k });
  const W0 = P('w' + sd), tip = ENDS['w' + sd], sx = sd === 'L' ? 1 : -1;
  const Lh = Math.hypot(tip[0] - W0[0], tip[1] - W0[1], tip[2] - W0[2]); const u = [0, 1, 2].map(i => (tip[i] - W0[i]) / Lh);
  const z = [0, 0, 1], zu = z[0] * u[0] + z[1] * u[1] + z[2] * u[2]; let f = z.map((v, i) => v - u[i] * zu); const fl = Math.hypot(...f); f = f.map(v => v / fl);
  let o = [u[1] * f[2] - u[2] * f[1], u[2] * f[0] - u[0] * f[2], u[0] * f[1] - u[1] * f[0]]; if (o[0] * sx < 0) o = o.map(v => -v);
  const bc = [0, 1, 2].map(i => W0[i] + u[i] * (0.52 * Lh + 0.02) + o[i] * -0.03);
  const geo = (WGEO4[k] || WGEO4.gladius)(); const tips = geo.userData && geo.userData.tips;
  const Y = H.mount === '-f' ? f.map(v => -v) : H.mount === '-u' ? u.map(v => -v) : H.mount === 'u' ? u : f, X = H.mount === 'u' || H.mount === '-u' ? f : u;
  const q = basisQ(X, Y);
  const at2 = H.mount === 'u' ? W0.map((v, i) => v + u[i] * 0.02) : bc;
  const m = K.rigid(geo, K.makeToon('#ffffff', { vertexColors: true, side: THREE.DoubleSide }), 'w' + sd, at2, null); const bp = P('w' + sd);
  m.position.set(at2[0] - bp[0], at2[1] - bp[1], at2[2] - bp[2]); m.quaternion.copy(q); m.userData.ownMat = 1; if (m.userData.ink) { m.userData.ink.position.copy(m.position); m.userData.ink.quaternion.copy(m.quaternion); }
  m.userData.w4 = { tips, k }; out.push(m);
  if (k === 'knives') out.push(...weapon4(B, 'pugio', 'L'));
  return out;
}
