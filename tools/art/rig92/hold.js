/* =====================================================================
   rig92/hold.js — v1.0: weapons from his cards IN THE FIST, held with a STRAIGHT WRIST (look100 rounds 4–8, his picks)
   =====================================================================
   • Every weapon is modelled after his card art (WGEO4, look100 round 4) and rides the wrist bone, leaving the fist at a fixed angle θ
     in the hand's own frame (u = wrist → fingertips, f = the thumb side, o = the back of the hand): sword 15° off the forearm line,
     dagger/spear out of the little-finger side, hafted weapons 80°, bow/lyre upright in the left hand (H5).
   • THE ARMED STAND (standFor): from the blade direction wanted, the hand frame is solved so the wrist stays STRAIGHT — the elbow and
     shoulder take the angle (frame5 → two-bone IK pole), then only a forearm twist turns the thumb; a clamp (≤15° flex, ≤10° deviation)
     strips any leftover wrist bend. Two-handed weapons bring the other hand to the shaft.
   • THE SCUTUM (round 8): the shield forearm stands upright (elbow over wrist) in the board's plane, the board's LONG edge along the
     forearm, its face turned to the facing; shieldCheck() = the round-8 check (every posed elbow/forearm skin point inside the board's
     outline sits BEHIND it, face ≤10° off the facing, long edge ≤10° off the forearm — all 8 facings).
   Poses stay the player's own: any pose keeps the weapons at θ on the wrist; the armed stand is only the default ('stand') pose. */
import * as THREE from 'three';
import { JK, ENDS, jointPos, endPos, jointQ } from './rig.js';
import { weaponKit, merge, plate, box, cyl, ball, at, basisQ } from './gear.js';

const V = (a) => new THREE.Vector3(...a), D = 180 / Math.PI;
const V3 = V;
const tube = (pts, r, seg = 24, rs = 8) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(V3)), seg, r, rs, false);

/* ======================= WEAPONS from his cards (look100 round 4, weapons.jpg cell = W[k].img) ======================= */
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
  axe: () => merge([[tube([[0, -0.1, 0], [0.01, 0.2, 0], [0.0, 0.45, 0], [-0.02, 0.6, 0]], 0.016, 16, 8), '#3a2a1c'], [at(plate([[0, -0.05], [0.14, -0.1], [0.19, 0.0], [0.14, 0.1], [0, 0.05]], 0.014), 0, 0.53, 0), STL], [box(0.035, 0.06, 0.03, 0, 0.53, 0), DSTL]]),
  falcata: () => merge([[cyl(0.014, 0.014, 0.1, 0, 10), '#3a2a20'], [tube([[0, -0.05, 0], [0.04, -0.07, 0], [0.05, -0.02, 0]], 0.008, 8, 6), BRZ], [box(0.07, 0.02, 0.035, 0, 0.06), BRZ],
    [plate([[-0.02, 0.07], [0.022, 0.07], [0.035, 0.22], [0.055, 0.4], [0.02, 0.56], [-0.01, 0.42], [-0.025, 0.22]], 0.008), STL]]),
  bow: () => { const R = 0.6, arc = new THREE.TorusGeometry(R, 0.014, 6, 32, 1.7); arc.rotateZ(Math.PI - 0.85); arc.translate(R, 0, 0);
    const tips = [[R * (1 - Math.cos(0.85)), R * Math.sin(0.85), 0], [R * (1 - Math.cos(0.85)), -R * Math.sin(0.85), 0]];
    const g = merge([[arc, '#6a4428'], [cyl(0.018, 0.018, 0.1, 0, 8), '#3a2a20'], ...tips.map(t => [at(new THREE.ConeGeometry(0.01, 0.04, 5), t[0] + 0.01, t[1] * 1.02, 0), '#e8dcc0'])]);
    /* v1.0 (his 3a): turned half round so the limbs curve back toward the archer (the grip leads, the string runs on his side) */
    g.rotateY(Math.PI); g.userData = { tips: tips.map(t => [-t[0], t[1], -t[2]]) }; return g; },
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
/* which hold a weapon takes (look100 round 4 WHOLD4 + the trident's own two-handed hold) */
export const WHOLD = { gladius: 'sword', rudis: 'sword', flavgl: 'sword', psykhe: 'sword', sica: 'sword', falcata: 'sword', pugio: 'dagger', knives: 'dagger',
  hasta: 'spear', jade: 'spear', pilum: 'spear', trident: 'trident', mace: 'hafted', axe: 'hafted', charun: 'hafted', flail: 'hafted',
  stones: 'throw', bow: 'bow', arcu: 'crossbow', labrys: 'labrys', sling: 'sling', lyre: 'lyre', scissor: 'arm', scutum: 'shield', thracian: 'shield', achilles: 'shield' };
/* the game's weapon family words (222 t93Weapon) → his card weapons */
const FAMILY = { sword: 'gladius', dagger: 'pugio', mace: 'mace', hammer: 'charun', club: 'rudis', flail: 'flail', axe: 'axe', labrys: 'labrys', spear: 'hasta', jade: 'jade',
  trident: 'trident', bow: 'bow', crossbow: 'arcu', sling: 'sling', lyre: 'lyre', sica: 'sica', flavgl: 'flavgl', scutum: 'scutum', parma: 'thracian', round: 'achilles' };
export const weaponKey = (s) => !s ? null : (s.k && WHOLD[s.k] ? s.k : FAMILY[s.t] || (WHOLD[s.t] ? s.t : 'gladius'));
const isShield = (k) => WHOLD[k] === 'shield';

/* ---------- the hand frame (rest) ---------- */
const REST = {}; for (const sd of ['L', 'R']) { const W0 = V(JK['w' + sd].pos), E0 = V(JK['e' + sd].pos), S0 = V(JK['s' + sd].pos), tip = V(ENDS['w' + sd]);
  const u = tip.clone().sub(W0).normalize(), z = V([0, 0, 1]); const f = z.clone().sub(u.clone().multiplyScalar(z.dot(u))).normalize();
  const sg = sd === 'R' ? 1 : -1; const o = new THREE.Vector3().crossVectors(u, f).multiplyScalar(sg);
  const Lh = tip.distanceTo(W0); REST[sd] = { u, f, o, sg, Lh, gl: 0.52 * Lh + 0.02, Lf: W0.distanceTo(E0), Lu: E0.distanceTo(S0), fa: W0.clone().sub(E0).normalize() }; }

/* ---------- THE HOLDS (figure metres, facing +z, the right hand at −x). θ° = blade angle off the forearm line toward the thumb ---------- */
export const STANCE = { p: [0, -140, 10], j: { pe: [4, -20, 0], sp: [12, 10, 0], ch: [8, 10, 0], he: [-16, 8, 0] }, f: { L: [150, 230, 10], R: [-160, -230, -40] } };
/* the stance for what a gear spec holds (H5[hold].j replaces joints of STANCE: the archer turns his chest so the draw shoulder goes back) */
export function stanceFor(gear) { const ho = holdsOf(gear || {}), R = ho.R, H = R && !isShield(R) ? H5[WHOLD[R]] : null;
  return { p: STANCE.p, j: Object.assign({}, STANCE.j, (H && H.j) || {}), f: STANCE.f }; }
export const H5 = {
  /* round 8: the sword hold the max-load search settled on (gladius clear of the scutum and the body) */
  sword: { R: { th: 15, b: [-0.1, 0.2, 1], hint: [-0.14, -0.06, 1], at: [-0.33, 1.2, 0.44] } },
  dagger: { R: { th: -100, b: [0.12, -1, 0.25], hint: [0, 0.12, 1], at: [-0.27, 1.22, 0.3] } },
  /* v1.0 (his 4a, best fit on the tile): the long shafts STAND UPRIGHT in the armed stand, butt by the foot (round 5 held them level, which
     made the stand 1.5–2× wider than its tile); the throw / thrust presets still carry them level */
  spear: { R: { th: 90, b: [0.04, 1, 0.06], hint: [0, 0, 1], at: [-0.34, 0.95, 0.2] } },
  trident: { R: { th: 90, b: [0.04, 1, 0.06], hint: [0, 0, 1], at: [-0.34, 0.95, 0.2] } },
  hafted: { R: { th: 80, b: [-0.12, 1, -0.15], hint: [0, 0.05, 1], at: [-0.28, 1.36, 0.24] } },
  throw: { R: { th: 0, b: [0, 1, -0.2], hint: [0, 0, 1], at: [-0.24, 1.66, -0.05] } },
  /* v1.0: targets RELATIVE TO THE POSED SHOULDER (rel, x = out) + elbow poles (pole/elb, x = out): bow arm forward at shoulder height,
     nearly straight; draw hand at the cheek, forearm along the arrow, elbow back and out at shoulder height (elbowCheck, bowOk, armClash) */
  bow: { j: { sp: [12, -16, 0], ch: [8, -22, 0], he: [-16, 50, 0] }, L: { th: 90, b: [0, 1, 0.05], hint: [0.25, 0, 1], rel: [-0.03, 0.03, 0.5], pole: [1, -0.45, -0.25] }, hand: 'L',
    drawR: { rel: [0.12, 0.13, 0.16], elb: [0.22, 0, -0.3] } },
  crossbow: { R: { th: 90, b: [0.05, 0.02, 1], hint: [0, -0.7, -0.6], at: [-0.15, 1.42, 0.28] }, two: { d: 0.32, th: 90, hint: [0, -1, 0.3] } },
  labrys: { R: { th: 75, b: [0.35, 1, 0.35], hint: [0.1, -0.2, 1], at: [-0.17, 1.02, 0.3] }, two: { d: 0.32, th: 75, hint: [-0.1, -0.2, 1], pole: [1, -0.3, -0.2] } },   /* pole: the left elbow out, not into the chest (armClash) */
  sling: { R: { th: 0, b: [0, -1, 0.1], hint: [0, 0, 1], at: [-0.36, 0.98, 0.12] } },
  lyre: { L: { th: 90, b: [0, 1, 0.1], hint: [-0.1, -0.3, 1], at: [0.12, 1.12, 0.4] }, hand: 'L', drawR: { h: [-40, 1150, 420], hp: [1, -1, -0.3] } },
  arm: { R: { th: 0, b: [0, 0.05, 1], hint: [0, 0, 1], at: [-0.26, 1.08, 0.38] } },
};
export const SHIELD8 = { at: [0.1, 1.07, 0.3] };
const mir = (a) => [-a[0], a[1], a[2]];
const mirH = (h) => ({ th: h.th, b: mir(h.b), hint: mir(h.hint), at: mir(h.at) });

/* hand frame + arm targets for one hand (S = the posed shoulder) */
function frame5(rig, sd, h) {
  const r = REST[sd], b = V(h.b).normalize(), th = h.th / D, sx0 = sd === 'L' ? 1 : -1, S0 = jointPos(rig, 's' + sd).clone();
  const AT = h.rel ? S0.clone().add(V([h.rel[0] * sx0, h.rel[1], h.rel[2]])) : V(h.at); let p = V(h.hint).sub(b.clone().multiplyScalar(V(h.hint).dot(b)));
  if (p.lengthSq() < 1e-6) p = V([0, -1, 0]).sub(b.clone().multiplyScalar(-b.y)); p.normalize();
  const u = b.clone().multiplyScalar(Math.cos(th)).add(p.clone().multiplyScalar(Math.sin(th))).normalize();
  const f = b.clone().multiplyScalar(Math.sin(th)).sub(p.clone().multiplyScalar(Math.cos(th))).normalize();
  const o = new THREE.Vector3().crossVectors(u, f).multiplyScalar(r.sg);
  const S = jointPos(rig, 's' + sd).clone();
  const Wd = AT.clone().sub(u.clone().multiplyScalar(r.gl)).add(o.clone().multiplyScalar(0.03)), Ed = Wd.clone().sub(u.clone().multiplyScalar(r.Lf));
  const E = S.clone().add(Ed.clone().sub(S).normalize().multiplyScalar(r.Lu)), W = E.clone().add(u.clone().multiplyScalar(r.Lf));
  const grip = W.clone().add(u.clone().multiplyScalar(r.gl)).sub(o.clone().multiplyScalar(0.03));
  const pole = E.clone().sub(S.clone().add(W).multiplyScalar(0.5)); const sx = sd === 'L' ? 1 : -1;
  return { u, f, o, b, th, E, W, grip, S, h: [W.x * 1000, W.y * 1000, W.z * 1000], hp: h.pole ? h.pole.slice() : pole.lengthSq() > 1e-8 ? [pole.x * sx, pole.y, pole.z] : null };
}
/* the wrist's bend in the hand's own frame against its rest relation: flex (palm/back) and deviation (thumb/little finger) */
export function wristBend(rig, sd) {
  const r = REST[sd]; const W = jointPos(rig, 'w' + sd), tip = endPos(rig, 'w' + sd); const qE = jointQ(rig, 'e' + sd);
  const hd = tip.clone().sub(W).normalize(); const n0 = r.u.clone().applyQuaternion(qE), f0 = r.f.clone().applyQuaternion(qE), o0 = r.o.clone().applyQuaternion(qE);
  const a = (v) => Math.atan2(v.dot(o0), v.dot(n0)) * D, c = (v) => Math.atan2(v.dot(f0), v.dot(n0)) * D;
  return { flex: Math.round(a(hd) * 10) / 10, dev: Math.round(c(hd) * 10) / 10, total: Math.round(Math.acos(Math.min(1, hd.dot(n0))) * D * 10) / 10 };
}
/* v1.0: THE ELBOWS' BEND on the screen-facing figure in each of the 8 facings. Per arm: n = the elbow's offset from the shoulder→wrist
   line (out/back/up), bend = its length, dx/dy/dz = elbow against shoulder (dz < 0 behind), hz = against the head, anat = the bend in the
   upper arm's frame (< 0 = wrong way). bowOk(): bow arm nearly straight, bending out not up; draw elbow behind shoulder + head at shoulder
   height (±0.12 m); draw hand at the cheek (ch ≤ 0.1 m), forearm within 35° of the arrow (fa). */
const SEG_U = V(JK.sL.pos).distanceTo(V(JK.eL.pos));
const CHEEK = [-0.08, 0.045, 0.05];   /* the right cheek / jaw corner in the head bone's frame */
export function elbowCheck(rig, turn, yaws) {
  const res = [], y0 = turn ? turn.rotation.y : 0, P = (k) => { const b = rig.bones[k]; b.updateWorldMatrix(true, false); return new THREE.Vector3().setFromMatrixPosition(b.matrixWorld); };
  const r2 = (v) => Math.round(v * 100) / 100, r3 = (v) => Math.round(v * 1000) / 1000;
  for (const yaw of (turn ? yaws || [0, 45, 90, 135, 180, 225, 270, 315] : [0])) {
    if (turn) { turn.rotation.y = yaw / D; turn.updateMatrixWorld(true); }
    const q = new THREE.Quaternion(); if (turn) turn.getWorldQuaternion(q);
    const row = { yaw }; const He = P('he');
    for (const sd of ['L', 'R']) { const sx = sd === 'L' ? 1 : -1, S = P('s' + sd), E = P('e' + sd), W = P('w' + sd);
      const OUT = V([sx, 0, 0]).applyQuaternion(q), FWD = V([0, 0, 1]).applyQuaternion(q), UP = V([0, 1, 0]);
      const ax = W.clone().sub(S).normalize(), n = E.clone().sub(S); n.sub(ax.clone().multiplyScalar(n.dot(ax))); const bend = n.length(); n.normalize();
      const sb = rig.bones['s' + sd]; const sq = new THREE.Quaternion(); sb.getWorldQuaternion(sq); const nl = n.clone().applyQuaternion(sq.invert());
      const rel = E.clone().sub(S), kU = SEG_U / (S.distanceTo(E) || 1);   /* lengths in rest metres whatever the figure's scale */
      row[sd] = { out: r2(n.dot(OUT)), back: r2(-n.dot(FWD)), up: r2(n.dot(UP)), bend: r3(bend * kU), dx: r3(rel.dot(OUT) * kU), dy: r3(rel.dot(UP) * kU), dz: r3(rel.dot(FWD) * kU), hz: r3(E.clone().sub(He).dot(FWD) * kU), anat: r2(-nl.z) }; }
    { const hb = rig.bones.wR, Wr = P('wR'), T = V(ENDS.wR).sub(V(JK.wR.pos)).applyMatrix4(hb.matrixWorld), mid = Wr.clone().lerp(T, 0.4), kU = SEG_U / (P('sR').distanceTo(P('eR')) || 1);
      const ck = V(CHEEK).applyMatrix4(rig.bones.he.matrixWorld), fa = Wr.clone().sub(P('eR')).normalize(), ln = P('wL').sub(Wr).normalize();
      row.R.ch = r3(mid.distanceTo(ck) * kU); row.R.fa = Math.round(Math.acos(Math.max(-1, Math.min(1, fa.dot(ln)))) * D); }
    res.push(row); }
  if (turn) { turn.rotation.y = y0; turn.updateMatrixWorld(true); }
  return res;
}
export function bowOk(rows) {
  return rows.every(r => { const L = r.L, R = r.R;
    const bowArm = L.bend <= 0.13 && (L.bend < 0.03 || (L.out >= 0.3 && L.up <= 0.1));
    const draw = R.dz <= -0.03 && R.hz <= -0.03 && Math.abs(R.dy) <= 0.12 && R.dx >= -0.03 && R.back >= 0.3;
    return bowArm && draw && L.anat > 0 && R.anat > 0 && R.ch <= 0.1 && R.fa <= 35; });
}
/* v1.0 (his Aim note: the draw arm went through the body): ARM SELF-INTERSECTION. Points on both arms' posed centre lines (upper arm
   from 30%, forearm, hand) against the chest/belly (elliptic cylinders), neck and head (ellipsoid) in their bones' frames; depth > tol fails.
   A hand resting on the chest or at the cheek passes. Facing-free; walks the 8 facings like elbowCheck. tv100g: every kit × preset. */
export const ARMCLASH = { tol: 0.015,
  vols: [
    { b: 'ch', k: 'chest', t: 'cyl', y: [-0.1, 0.2], c: [0, -0.005], a: 0.13, d: 0.1 },
    { b: 'sp', k: 'belly', t: 'cyl', y: [-0.12, 0.16], c: [0, 0.005], a: 0.125, d: 0.095 },
    { b: 'ne', k: 'neck', t: 'cyl', y: [-0.02, 0.13], c: [0, 0.005], a: 0.05, d: 0.05 },
    { b: 'he', k: 'head', t: 'ell', c: [0, 0.095, 0.02], r: [0.08, 0.11, 0.095] } ] };
function volDepth(v, p) {
  if (v.t === 'ell') { const x = (p.x - v.c[0]) / v.r[0], y = (p.y - v.c[1]) / v.r[1], z = (p.z - v.c[2]) / v.r[2]; return (1 - Math.hypot(x, y, z)) * Math.min(...v.r); }
  const x = (p.x - v.c[0]) / v.a, z = (p.z - v.c[1]) / v.d, rad = (1 - Math.hypot(x, z)) * Math.min(v.a, v.d), ay = Math.min(p.y - v.y[0], v.y[1] - p.y);
  return Math.min(rad, ay);
}
export function armClash(rig, turn, yaws) {
  const W = (k) => { const b = rig.bones[k]; b.updateWorldMatrix(true, false); return new THREE.Vector3().setFromMatrixPosition(b.matrixWorld); };
  const inv = (k) => { const b = rig.bones[k]; b.updateWorldMatrix(true, false); return b.matrixWorld.clone().invert(); };
  const tipOf = (sd) => { const b = rig.bones['w' + sd]; const off = V(ENDS['w' + sd]).sub(V(JK['w' + sd].pos)); return off.applyMatrix4(b.matrixWorld); };
  const y0 = turn ? turn.rotation.y : 0, rows = []; let worst = null;
  for (const yaw of (turn ? yaws || [0, 45, 90, 135, 180, 225, 270, 315] : [0])) {
    if (turn) { turn.rotation.y = yaw / D; turn.updateMatrixWorld(true); }
    const M = Object.fromEntries(ARMCLASH.vols.map(v => [v.b, inv(v.b)]));
    let rw = null;
    for (const sd of ['L', 'R']) { const S = W('s' + sd), E = W('e' + sd), Wr = W('w' + sd), T = tipOf(sd);
      for (const [seg, A, B, t0] of [['upper', S, E, 0.3], ['fore', E, Wr, 0], ['hand', Wr, T, 0]])
        for (let i = 0; i <= 8; i++) { const t = t0 + (1 - t0) * i / 8, p = A.clone().lerp(B, t);
          for (const v of ARMCLASH.vols) { const q = p.clone().applyMatrix4(M[v.b]); const d = volDepth(v, q);
            if (!rw || d > rw.depth) rw = { yaw, arm: sd, seg, t: Math.round(t * 100) / 100, vol: v.k, depth: Math.round(d * 1000) / 1000 }; } } }
    rows.push(rw); if (!worst || rw.depth > worst.depth) worst = rw; }
  if (turn) { turn.rotation.y = y0; turn.updateMatrixWorld(true); }
  return { ok: rows.every(r => r.depth <= ARMCLASH.tol), worst, n: rows.length };
}
/* clamp: past 15° flex / 10° deviation the wrist keeps only its twist */
function clampWrist(rig, sd) {
  const w = wristBend(rig, sd); if (Math.abs(w.flex) <= 15 && Math.abs(w.dev) <= 10) return false;
  const bone = rig.bones['w' + sd]; const fa = REST[sd].u; const q = bone.quaternion; const rv = V([q.x, q.y, q.z]); const pr = fa.clone().multiplyScalar(rv.dot(fa));
  bone.quaternion.copy(new THREE.Quaternion(pr.x, pr.y, pr.z, q.w).normalize()); bone.updateMatrixWorld(true); return true;
}
/* what each hand holds: [[side, card key, θ]] + the shield side */
export function holdsOf(gear) {
  const R = weaponKey(gear && gear.wR), L = weaponKey(gear && gear.wL), out = { mounts: [], shield: null, R, L };
  if (R && isShield(R)) out.shield = ['R', R]; if (L && isShield(L)) out.shield = ['L', L];
  if (R && !isShield(R)) { const H = H5[WHOLD[R]] || H5.sword; if (H.hand === 'L') out.mounts.push(['L', R, H.L.th]); else out.mounts.push(['R', R, H.R.th]); if (R === 'knives' && !L) out.mounts.push(['L', 'pugio', H5.dagger.R.th]); }
  if (L && !isShield(L)) { const hl = WHOLD[L] === 'dagger' ? H5.dagger.R : H5.sword.R; out.mounts.push(['L', L, hl.th]); }
  return out;
}

/* THE ARMED STAND: the pose spec (stance + hand targets) and, after it is applied, the grip twists + clamp */
export function armedSpec(rig, gear) {
  const ho = holdsOf(gear), R = ho.R, H = R && !isShield(R) ? H5[WHOLD[R]] || H5.sword : null; const h = {}, hp = {}, fr = {};
  if (H && H.R) fr.R = frame5(rig, 'R', H.R);
  if (H && H.L) fr.L = frame5(rig, 'L', H.L);
  if (H && H.two && fr.R) { const q = fr.R.grip.clone().add(fr.R.b.clone().multiplyScalar(H.two.d)); fr.L = frame5(rig, 'L', { th: H.two.th, b: fr.R.b.toArray(), hint: H.two.hint, at: q.toArray(), pole: H.two.pole }); }
  if (R === 'knives' && !ho.L) fr.L = frame5(rig, 'L', mirH(H5.dagger.R));
  const L = ho.L; if (L && !isShield(L)) { const hl = WHOLD[L] === 'dagger' ? H5.dagger.R : H5.sword.R; fr.L = frame5(rig, 'L', mirH(hl)); }
  if (ho.shield && ho.shield[0] === 'L') { fr.L = frame5(rig, 'L', { th: 0, b: [0, -1, 0.03], hint: [0, 0, 1], at: SHIELD8.at }); fr.L.shield = 1; }
  if (ho.shield && ho.shield[0] === 'R') { fr.R = frame5(rig, 'R', { th: 0, b: [0, -1, 0.03], hint: [0, 0, 1], at: mir(SHIELD8.at) }); fr.R.shield = 1; }
  for (const sd of ['L', 'R']) if (fr[sd]) { h[sd] = fr[sd].h; hp[sd] = fr[sd].hp; }
  if (H && H.drawR) { const d = H.drawR; if (d.rel) { const S = jointPos(rig, 'sR'); h.R = [(S.x - d.rel[0]) * 1000, (S.y + d.rel[1]) * 1000, (S.z + d.rel[2]) * 1000];
      /* elb: where the elbow should be (shoulder + [out, up, z]) → the pole from the arm's middle toward it */
      if (d.elb) { const W = V(h.R.map(v => v / 1000)), Et = S.clone().add(V([-d.elb[0], d.elb[1], d.elb[2]])), pl = Et.sub(S.clone().add(W).multiplyScalar(0.5)); hp.R = [-pl.x, pl.y, pl.z]; } else hp.R = d.hp; } else { h.R = d.h; hp.R = d.hp; } }
  if (!h.L) { h.L = [210, 1230, 330]; hp.L = [1, -0.6, -0.2]; }
  if (!h.R) { h.R = [-300, 1150, 280]; hp.R = [1, -1, -0.3]; }
  const st = stanceFor(gear); return { spec: { p: st.p, j: st.j, f: st.f, h, hp }, fr };
}
export function armedFinish(rig, align, fr) {
  for (const sd of ['L', 'R']) if (fr[sd] && !fr[sd].shield) align(sd, { tf: fr[sd].f.toArray() });
  for (const sd of ['L', 'R']) if (fr[sd] && fr[sd].shield) align(sd, { o: [0, 0, 1] });
  return ['L', 'R'].filter(sd => clampWrist(rig, sd));
}

/* the weapon on the wrist bone, θ off the hand axis toward the thumb */
function mount5(B, k, sd, th) {
  const K = B.kit, r = REST[sd], W0 = JK['w' + sd].pos; const t = th / D;
  const Y = r.u.clone().multiplyScalar(Math.cos(t)).add(r.f.clone().multiplyScalar(Math.sin(t))).normalize(), X = r.u.clone().multiplyScalar(Math.sin(t)).sub(r.f.clone().multiplyScalar(Math.cos(t))).normalize();
  const bc = V(W0).add(r.u.clone().multiplyScalar(r.gl)).sub(r.o.clone().multiplyScalar(0.03));
  const geo = (WGEO4[k] || WGEO4.gladius)();
  const m = K.rigid(geo, K.makeToon('#ffffff', { vertexColors: true, side: THREE.DoubleSide }), 'w' + sd, bc.toArray(), null);
  m.position.set(bc.x - W0[0], bc.y - W0[1], bc.z - W0[2]); m.quaternion.copy(basisQ(X.toArray(), Y.toArray())); m.userData.ownMat = 1;
  if (m.userData.ink) { m.userData.ink.position.copy(m.position); m.userData.ink.quaternion.copy(m.quaternion); }
  m.userData.w4 = { k }; return m;
}
/* the retiarius' net (round 4): a loose mesh hanging from the left hand */
function net(B) { const g = new THREE.PlaneGeometry(0.42, 0.62, 9, 12); const P = g.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i); P.setZ(i, 0.05 * Math.sin(x * 9) * Math.cos(y * 7) - Math.abs(x) * 0.12); P.setX(i, x * (0.6 + (0.31 - y) * 0.9)); }
  g.translate(0, -0.33, 0); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xd8c9a0, wireframe: true })); m.userData.raw = 1; m.name = 'net';
  const b = B.rig.bones.wL, W0 = JK.wL.pos, tip = ENDS.wL; m.position.set((tip[0] - W0[0]) * 0.6, (tip[1] - W0[1]) * 0.6, (tip[2] - W0[2]) * 0.6); m.rotation.y = Math.PI / 2; b.add(m); return [m]; }

/* every held thing for a gear spec (built once per spec; they ride the bones, so any pose carries them) */
export function mountWeapons(B, gear) {
  const ho = holdsOf(gear), out = [];
  for (const [sd, k, th] of ho.mounts) out.push(mount5(B, k, sd, th));
  if (ho.shield) out.push(...weaponKit(B, { [ho.shield[0]]: ho.shield[1], up8: 1 }));
  if (ho.R === 'trident' && !ho.L) out.push(...net(B));
  for (const m of out.slice()) if (m.userData && m.userData.w4 && m.userData.w4.k === 'bow') out.push(...bowString(B, m));
  return out;
}
/* v1.0 (his 3a): THE BOW STRING — rebuilt at every render (so every sheet, facing, thumbnail and the editor) from the bow's two tips
   (the mounted bow, geometry userData.tips) and the draw hand: when the right hand's grip is beyond the chord, away from the bow's grip
   (a drawn bow, any pose / facing / yaw), the string runs tip → hand → tip; otherwise it is straight. Two thin segments + their ink. */
function bowString(B, bow) {
  const tips = bow.geometry && bow.geometry.userData && bow.geometry.userData.tips; if (!tips) return [];
  const R = 0.0032, gl = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true); gl.translate(0, 0.5, 0);
  const light = B.kit.makeToon('#efe4c8'), dark = new THREE.MeshBasicMaterial({ color: 0x120c0a, side: THREE.BackSide });
  const segs = [0, 1].map(() => [new THREE.Mesh(gl, light), new THREE.Mesh(gl.clone(), dark)]);
  const r = REST.R, W0 = JK.wR.pos, loc = r.u.clone().multiplyScalar(r.gl).sub(r.o.clone().multiplyScalar(0.03));
  const t1 = V(tips[0]), t2 = V(tips[1]), q = new THREE.Quaternion(), Y = V([0, 1, 0]), sc = new THREE.Vector3();
  const place = (m, a, b, rad) => { const d = b.clone().sub(a), l = d.length() || 1e-6; q.setFromUnitVectors(Y, d.divideScalar(l)); m.matrixWorld.compose(a, q, sc.set(rad, l, rad)); };
  const update = () => {
    const A = bow.localToWorld(t1.clone()), C = bow.localToWorld(t2.clone()), G = bow.localToWorld(V([0, 0, 0]));
    const H = B.rig.bones.wR.localToWorld(loc.clone()), AC = C.clone().sub(A), L2 = AC.lengthSq() || 1e-9;
    const t = Math.max(0, Math.min(1, H.clone().sub(A).dot(AC) / L2)), P = A.clone().add(AC.clone().multiplyScalar(t));
    const pull = H.clone().sub(P), drawn = t > 0.15 && t < 0.85 && pull.dot(P.clone().sub(G)) > 0 && pull.length() < Math.sqrt(L2) * 1.1;
    const mid = drawn ? H : A.clone().add(C).multiplyScalar(0.5), sw = B.group.scale.x || 1, ink = (B.mats.out.userData.u.value || 0) * sw;
    place(segs[0][0], A, mid, R * sw); place(segs[0][1], A, mid, R * sw + ink); place(segs[1][0], mid, C, R * sw); place(segs[1][1], mid, C, R * sw + ink);
    bow.userData.string = { drawn, t: +t.toFixed(3) };
  };
  const out = [];
  for (const [m, k] of segs) for (const x of [m, k]) { x.matrixAutoUpdate = false; x.matrixWorldAutoUpdate = false; x.frustumCulled = false; x.userData.raw = 1; x.name = 'bowstring'; x.onBeforeRender = update; B.group.add(x); out.push(x); }
  bow.userData.stringUpdate = update; return out;
}
export function killWeapons(B, list) {
  for (const m of list || []) { if (m.userData && m.userData.raw) { if (m.parent) m.parent.remove(m); m.geometry.dispose(); if (m.material) m.material.dispose(); continue; }
    if (Array.isArray(m.material)) { m.material.forEach(x => x.dispose()); m.userData.ownMat = 0; } B.kit.kill(m); }
}

/* THE SHIELD CHECK (round 8): posed elbow + forearm skin points must sit BEHIND the board (board-local z < 0 inside its outline), the
   board's face within 10° of the facing and its long edge within 10° of the forearm — every one of the 8 facings. */
export function shieldCheck(B, turn, list) {
  const board = (list || []).find(m => Array.isArray(m.material)); if (!board) return null;
  let sd = 'L'; for (let p = board.parent; p; p = p.parent) { if (p === B.rig.bones.wR || p === B.rig.bones.eR) { sd = 'R'; break; } if (p === B.rig.bones.wL || p === B.rig.bones.eL) break; }
  const body = B.body, bp = body.geometry.attributes.position, E0 = V(JK['e' + sd].pos), W0 = V(JK['w' + sd].pos), S0 = V(JK['s' + sd].pos);
  const segD = (p, a, b) => { const ab = b.clone().sub(a), t = Math.max(0, Math.min(1, p.clone().sub(a).dot(ab) / ab.lengthSq())); return [p.distanceTo(a.clone().add(ab.multiplyScalar(t))), t]; };
  const idx = []; const v = new THREE.Vector3();
  for (let i = 0; i < bp.count; i += 2) { v.fromBufferAttribute(bp, i); const [d, t] = segD(v, E0, W0); const [du] = segD(v, S0, E0); if ((d < 0.065 && t > 0.0 && t < 0.92) || (v.distanceTo(E0) < 0.07 && du > 0.02)) idx.push(i); }
  const res = { side: sd, pts: idx.length, facings: [] }; const y0 = turn.rotation.y;
  for (const yaw of [0, 45, 90, 135, 180, 225, 270, 315]) { turn.rotation.y = yaw * Math.PI / 180; turn.updateMatrixWorld(true); board.updateWorldMatrix(true, false); const inv = board.matrixWorld.clone().invert();
    const bb = new THREE.Box3().setFromBufferAttribute(board.geometry.attributes.position); let front = 0, inside = 0, worst = -1;
    for (const i of idx) { body.getVertexPosition(i, v); v.applyMatrix4(body.matrixWorld).applyMatrix4(inv); if (v.x < bb.min.x || v.x > bb.max.x || v.y < bb.min.y || v.y > bb.max.y) continue; inside++; if (v.z > -0.002) { front++; worst = Math.max(worst, v.z); } }
    const n = new THREE.Vector3(0, 0, 1).transformDirection(board.matrixWorld), face = new THREE.Vector3(0, 0, 1).applyQuaternion(turn.quaternion);
    const ang = Math.round(Math.acos(Math.min(1, n.dot(face))) * 1800 / Math.PI) / 10;
    const ly = new THREE.Vector3(0, 1, 0).transformDirection(board.matrixWorld); const eb = B.rig.bones['e' + sd], wb = B.rig.bones['w' + sd]; eb.updateWorldMatrix(true, false); wb.updateWorldMatrix(true, false);
    const fa = wb.getWorldPosition(new THREE.Vector3()).sub(eb.getWorldPosition(new THREE.Vector3())).normalize(); const along = Math.round(Math.acos(Math.min(1, Math.abs(ly.dot(fa)))) * 1800 / Math.PI) / 10;
    res.facings.push({ yaw, inside, front, worst: Math.round(worst * 1000), ang, along }); }
  turn.rotation.y = y0; turn.updateMatrixWorld(true);
  res.ok = res.facings.every(f => f.front === 0 && f.ang <= 10 && f.along <= 10 && f.inside > 0); res.angMax = Math.max(...res.facings.map(f => f.ang)); res.alongMax = Math.max(...res.facings.map(f => f.along)); res.frontMax = Math.max(...res.facings.map(f => f.front));
  return res;
}
