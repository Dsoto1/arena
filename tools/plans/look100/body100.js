/* =====================================================================
   rig92/body.js — the procedural gladiator body for the posable 3D tokens (v0.92 groundwork)
   =====================================================================
   The body is SCULPTED in code from ~150 anatomical primitives (muscle ellipsoids, round cones, spheres) combined
   with smooth unions (so the deltoids/traps/pecs flow into each other and leave creases), a few smooth subtractions
   (eye sockets, mouth, ears, navel), then meshed with surface nets on a 4 mm grid. Every primitive names the bone(s)
   that carry it; a vertex's skin weights blend the bones of the primitives it lies on (closest first).
   Clothing = the naked avatar's base gear (assets/avatar.png): chest harness + rings + buckles, studded belt + ring,
   grey cloth wrap, yellow subligaculum with brown hems, sandal straps criss-crossing up the shins, sandal soles.
   The straps/cloth are thin SHELLS lifted off the skin (same skin weights, so they follow any pose) cut by a mask;
   rings, buckles, studs and soles are small rigid meshes riding their bone.
   Look: cel (toon) shading with a 3-step ramp, crease ink from the field (cavities darken), an inverted-hull outline.
   buildBody(opts) → { group, mesh, rig, setOutline(px world), stats } — all positions in metres (see rig.js). */
/* look100 (v1.0 LOOK TEST, not game code): a copy of tools/art/rig92/body.js with three test options —
   opt.fem   a female (Amazonia-type) build on the same rig: lighter muscles, breasts, narrower waist, wider hips, softer face
   opt.grip  {L,R: 'open' | 'hilt' | 'bar'} — fingers + thumb closed round a bar along the hand's forward axis (a hilt or a shield handle)
   kit.sever(side, t)  cut the forearm away below t (0 elbow … 1 wrist) and return the cut frame for a stump cap */
import * as THREE from 'three';
import { JK, ENDS, makeBones, SOLE_Y } from './rig100.js';

/* ---------- colours sampled from assets/avatar.png (sRGB) ---------- */
export const COL = {
  skin: [202, 180, 158], skinShade: [176, 150, 128], lip: [194, 150, 130], brow: [70, 52, 40], eyeW: [214, 204, 190], iris: [40, 30, 24],
  hair: [64, 44, 32], ink: [22, 16, 14],
  harness: [112, 62, 46], harnessHi: [138, 80, 58], metal: [150, 150, 146], metalDark: [60, 58, 56], bronze: [120, 84, 40],
  belt: [142, 73, 26], stud: [205, 200, 185], wrap: [140, 131, 114],
  loin: [210, 165, 75], hem: [120, 72, 34], strap: [79, 73, 65], sole: [138, 116, 90],
};
/* '#rrggbb' → [r,g,b] 0-255 (null when it is not one) */
const hexRGB = (h) => { const m = /^#?([0-9a-f]{6})$/i.exec(String(h || '')); if (!m) return Array.isArray(h) ? h : null; const n = parseInt(m[1], 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const lin = (c) => { const k = new THREE.Color().setRGB(c[0] / 255, c[1] / 255, c[2] / 255, THREE.SRGBColorSpace); return [k.r, k.g, k.b]; };

/* ---------- small vector helpers on arrays ---------- */
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const P = (k) => JK[k].pos;

/* ================= the sculpt: primitives ================= */
/* prim: {t:'e'|'c', ... , g: group, k: blend radius, op: 'add'|'sub', b: bones}
   groups: T torso+neck · H head · AL/AR arms · LL/LR legs.  bones: 'key' | [['key',w],…] | {a,b,t0,t1} blend along the prim axis */
const INCOMPAT = new Set(['LL|LR', 'AL|LL', 'AL|LR', 'AR|LL', 'AR|LR', 'AL|AR', 'AL|H', 'AR|H']);
const GROUPS = ['T', 'H', 'AL', 'AR', 'LL', 'LR'];
const GI = Object.fromEntries(GROUPS.map((g, i) => [g, i + 1]));
const incompat = (a, b) => INCOMPAT.has(a + '|' + b) || INCOMPAT.has(b + '|' + a);
const INC = []; for (let i = 0; i <= GROUPS.length; i++) { INC.push([]); for (let j = 0; j <= GROUPS.length; j++) INC[i].push(i && j && incompat(GROUPS[i - 1], GROUPS[j - 1]) ? 1 : 0); }

/* ellipsoid between a and b (the long axis), cross radii rw (side) and rd (depth, toward `front`) */
function M(a, b, rw, rd, front, o) {
  const u = nrm(sub(b, a)); let v = sub(front, mul(u, dot(front, u))); v = nrm(v); const w = crs(v, u);
  return Object.assign({ t: 'e', c: mul(add(a, b), 0.5), ax: [w, u, v], r: [rw, Math.hypot(...sub(b, a)) / 2, rd], a, b2: b }, o);
}
/* world-aligned ellipsoid (optional rotation about z then y, degrees) */
function E(c, r, o, rz = 0, ry = 0) {
  const cz = Math.cos(rz * Math.PI / 180), sz = Math.sin(rz * Math.PI / 180), cy = Math.cos(ry * Math.PI / 180), syy = Math.sin(ry * Math.PI / 180);
  let ax = [[cz, sz, 0], [-sz, cz, 0], [0, 0, 1]];
  ax = ax.map(a => [a[0] * cy + a[2] * syy, a[1], -a[0] * syy + a[2] * cy]);
  return Object.assign({ t: 'e', c, ax, r, a: add(c, mul(ax[1], -r[1])), b2: add(c, mul(ax[1], r[1])) }, o);
}
/* round cone a(r1) → b(r2) */
function C(a, b, r1, r2, o) { return Object.assign({ t: 'c', a, b2: b, r1, r2 }, o); }
function S(c, r, o) { return C(c, c, r, r, o); }

function sdPrim(p, x, y, z) {
  if (p.t === 'e') {
    const dx = x - p.c[0], dy = y - p.c[1], dz = z - p.c[2];
    const A = p.ax, R = p.r;
    const qx = (dx * A[0][0] + dy * A[0][1] + dz * A[0][2]), qy = (dx * A[1][0] + dy * A[1][1] + dz * A[1][2]), qz = (dx * A[2][0] + dy * A[2][1] + dz * A[2][2]);
    const k0 = Math.hypot(qx / R[0], qy / R[1], qz / R[2]);
    const k1 = Math.hypot(qx / (R[0] * R[0]), qy / (R[1] * R[1]), qz / (R[2] * R[2]));
    return k1 < 1e-9 ? -Math.min(R[0], R[1], R[2]) : k0 * (k0 - 1) / k1;
  }
  /* round cone (iq) */
  const a = p.a, b = p.b2, r1 = p.r1, r2 = p.r2;
  const bax = b[0] - a[0], bay = b[1] - a[1], baz = b[2] - a[2];
  const pax = x - a[0], pay = y - a[1], paz = z - a[2];
  const l2 = bax * bax + bay * bay + baz * baz;
  if (l2 < 1e-12) return Math.hypot(pax, pay, paz) - r1;
  const rr = r1 - r2, a2 = l2 - rr * rr, il2 = 1 / l2;
  const yy = pax * bax + pay * bay + paz * baz, zz = yy - l2;
  const xx = pax * l2 - bax * yy, xy = pay * l2 - bay * yy, xz = paz * l2 - baz * yy;
  const x2 = xx * xx + xy * xy + xz * xz, y2 = yy * yy * l2, z2 = zz * zz * l2;
  const k = Math.sign(rr) * rr * rr * x2;
  if (Math.sign(zz) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
  if (Math.sign(yy) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
  return (Math.sqrt(x2 * a2 * il2) + yy * rr) * il2 - r1;
}
function primBox(p, pad) {
  let lo, hi;
  if (p.t === 'e') { const m = Math.max(...p.r); lo = sub(p.c, [m, m, m]); hi = add(p.c, [m, m, m]); }
  else { const m = Math.max(p.r1, p.r2); lo = [Math.min(p.a[0], p.b2[0]) - m, Math.min(p.a[1], p.b2[1]) - m, Math.min(p.a[2], p.b2[2]) - m]; hi = [Math.max(p.a[0], p.b2[0]) + m, Math.max(p.a[1], p.b2[1]) + m, Math.max(p.a[2], p.b2[2]) + m]; }
  return [sub(lo, [pad, pad, pad]), add(hi, [pad, pad, pad])];
}

/* limb helper: a point along a→b at t, pushed `out` to the side (away from the midline) and `fwd` forward */
function limbFrame(a, b, sx, frontHint = [0, 0, 1]) {
  const u = nrm(sub(b, a)); let f = sub(frontHint, mul(u, dot(frontHint, u))); f = nrm(f); let o = crs(u, f); /* u×f */
  if (o[0] * sx < 0) o = mul(o, -1);
  return { u, f, o, at: (t, out = 0, fw = 0) => add(add(lerp(a, b, t), mul(o, out)), mul(f, fw)) };
}

/* v0.98 ATHLETIC BUILD (his ask): broader chest, lats and shoulders, fuller arms and legs, a slimmer waist. opt.ath 1 = athletic (default), 0 = the v0.92 build;
   each value scales the muscle's cross radii (girdle and abdomen: width only) by 1 + (f - 1) * ath */
export const ATH = { pec: 1.16, lat: 1.16, girdle: 1.07, trap: 1.12, neck: 1.06, abd: 0.93, delt: 1.15, bi: 1.15, fore: 1.07, thigh: 1.08, calf: 1.1 };
/* look100: where the gripped bar runs (rest pose): d along the hand from the wrist, o off the palm (− = palm side), axis = hand frame f */
export function gripBar(W0, tip, sx, kind) { const Lh = Math.hypot(tip[0] - W0[0], tip[1] - W0[1], tip[2] - W0[2]); const r = kind === 'bar' ? 0.011 : 0.015;
  const hd = limbFrame(W0, tip, sx, [0, 0, 1]); return { r, d: 0.52 * Lh + 0.020, o: -0.026 - (r - 0.011), Lh, u: hd.u, f: hd.f, o3: hd.o,
    c: add(add(W0, mul(hd.u, 0.52 * Lh + 0.020)), mul(hd.o, -0.026 - (r - 0.011))) }; }
export const FEM = { pec: 0.5, lat: 0.72, girdle: 0.84, trap: 0.62, neck: 0.8, abd: 0.8, delt: 0.74, bi: 0.74, fore: 0.8, thigh: 1.04, calf: 0.95 };
export function sculpt(opt = {}) {
  const prims = [];
  const add_ = (p) => { prims.push(p); return p; };
  const ath = opt.ath == null ? 1 : +opt.ath || 0; const FEMT = opt.fem ? FEM : null;
  const bulk = (p, k) => { const f = FEMT ? (FEMT[k] || 1) : 1 + ((ATH[k] || 1) - 1) * ath; if (f === 1) return p; const wOnly = k === 'girdle' || k === 'abd';
    if (p.t === 'e') { p.r = [p.r[0] * f, p.r[1], wOnly ? p.r[2] : p.r[2] * f]; } else { p.r1 *= f; p.r2 *= f; } return p; };
  /* ---------------- torso (T) ---------------- */
  const T = (b, k = 0.03) => ({ g: 'T', b, k, op: 'add' });
  add_(E([0, 1.335, -0.026], [0.132, 0.175, 0.098], T('ch', 0.06)));                       /* ribcage */
  bulk(add_(E([0, 1.452, -0.032], [0.158, 0.068, 0.078], T('ch', 0.045))),'girdle');  /* shoulder girdle */
  bulk(add_(E([0, 1.155, -0.008], [0.115, 0.140, 0.090], T('sp', 0.07))),'abd');  /* abdomen */
  add_(E([0, 0.968, -0.014], [0.145, 0.110, 0.100], T('pe')));                         /* pelvis */
  for (const sx of [1, -1]) {
    bulk(add_(E([sx * 0.076, 1.388, 0.054], [0.100, 0.040, 0.027], T('ch', 0.03), sx * -6)),'pec');  /* pec (v0.99: a flat, broad, high male pectoral — less forward, no drooping underside) */
    add_(E([sx * 0.062, 1.290, 0.040], [0.090, 0.070, 0.048], T('ch', 0.05)));            /* v0.99 lower chest wall: carries the pec smoothly into the ribs (no gap under it) */
    add_(C([sx * 0.150, 1.285, -0.030], [sx * 0.112, 1.100, -0.004], 0.034, 0.040, T({ a: 'ch', b: 'sp', t0: 0.0, t1: 1.0 }, 0.07)));  /* v0.99 lateral taper: lats flow down into the waist (no step below the ribs) */
    add_(C([sx * 0.110, 1.365, 0.058], [sx * 0.178, 1.408, 0.012], 0.040, 0.030, T('ch', 0.02)));  /* pec → arm insertion */
    bulk(add_(E([sx * 0.112, 1.320, -0.044], [0.058, 0.125, 0.066], T('ch', 0.05), sx * 14)),'lat');  /* lat */
    add_(E([sx * 0.098, 1.120, 0.004], [0.040, 0.080, 0.070], T('sp', 0.02), sx * -4));     /* oblique */
    add_(E([sx * 0.080, 0.975, 0.036], [0.052, 0.065, 0.050], T('pe', 0.04)));             /* lower belly / hip front */
    add_(M([sx * 0.125, 1.010, -0.018], [sx * 0.118, 0.800, -0.008], 0.052, 0.068, [0, 0, 1], T({ a: 'pe', b: 'h' + (sx > 0 ? 'L' : 'R'), t0: 0.35, t1: 0.85 }, 0.05)));  /* hip side flows into the thigh */
    bulk(add_(E([sx * 0.068, 0.900, -0.064], [0.078, 0.095, 0.066], T({ a: 'pe', b: 'h' + (sx > 0 ? 'L' : 'R'), t0: 0.2, t1: 1.2 }, 0.045))),'fore');  /* glute */
    bulk(add_(C([0, 1.545, -0.042], [sx * 0.165, 1.505, -0.030], 0.036, 0.032, T([['ch', 0.7], ['ne', 0.3]], 0.03))),'trap');  /* upper trapezius slope */
    bulk(add_(E([sx * 0.088, 1.360, -0.088], [0.058, 0.075, 0.030], T('ch', 0.02), sx * 10)),'fore');  /* scapula */
    add_(E([sx * 0.034, 1.130, -0.078], [0.030, 0.130, 0.030], T('sp', 0.015)));           /* spinal erector */
    add_(C([sx * 0.044, 1.660, -0.018], [sx * 0.014, 1.515, 0.042], 0.013, 0.011, T('ne', 0.014)));  /* sternocleidomastoid */
    /* abs: four rows of the six-pack (+ the lower pair) */
    for (let i = 0; i < 4; i++) {
      const y = 1.238 - i * 0.058, z = [0.066, 0.075, 0.075, 0.060][i];
      add_(E([sx * 0.029, y, z - (opt.fem ? 0.008 : 0)], [0.027, 0.023, opt.fem ? 0.008 : 0.013], T('sp', opt.fem ? 0.02 : 0.014)));
    }
  }
  if (opt.fem) {   /* look100: the gladiatrix — breasts, a fuller hip line and seat */
    for (const sx of [1, -1]) {
      add_(E([sx * 0.066, 1.336, 0.072], [0.062, 0.058, 0.056], T('ch', 0.035), sx * -8, sx * 10));     /* breast */
      add_(E([sx * 0.132, 0.935, -0.010], [0.066, 0.095, 0.086], T({ a: 'pe', b: 'h' + (sx > 0 ? 'L' : 'R'), t0: 0.3, t1: 1.0 }, 0.06)));  /* hip */
      add_(E([sx * 0.070, 0.905, -0.074], [0.072, 0.080, 0.062], T({ a: 'pe', b: 'h' + (sx > 0 ? 'L' : 'R'), t0: 0.2, t1: 1.2 }, 0.05)));   /* fuller seat */
    }
  }
  bulk(add_(E([0, 1.400, -0.070], [0.095, 0.110, 0.042], T('ch', 0.04))),'trap');  /* mid trapezius */
  bulk(add_(C([0, 1.470, -0.024], [0, 1.645, -0.012], 0.061, 0.054, T([['ne', 0.8], ['ch', 0.2]], 0.03))),'neck');  /* neck */
  add_(S([0, 1.105, 0.093], 0.008, { g: 'T', b: 'sp', k: 0.004, op: 'sub' }));          /* navel */

  /* ---------------- head (H) ---------------- */
  const HO = [0, 1.605, 0]; const hs = opt.headScale || 1.0;
  const h = (x, y, z) => add(HO, [x * hs, y * hs, z * hs]);
  const Hd = (k = 0.02, op = 'add') => ({ g: 'H', b: 'he', k, op });
  if (!opt.face2) {
  add_(E(h(0, 0.150, -0.012), [0.077 * hs, 0.095 * hs, 0.098 * hs], Hd(0.02)));     /* cranium */
  add_(E(h(0, opt.fem ? 0.082 : 0.078, 0.022), opt.fem ? [0.050 * hs, 0.064 * hs, 0.064 * hs] : [0.056 * hs, 0.070 * hs, 0.068 * hs], Hd(0.022)));     /* face mass (look100: a narrower, shorter female face) */
  add_(E(h(0, opt.fem ? 0.02 : 0.012, opt.fem ? 0.068 : 0.072), opt.fem ? [0.019 * hs, 0.015 * hs, 0.015 * hs] : [0.025 * hs, 0.019 * hs, 0.018 * hs], Hd(0.016)));     /* chin */
  for (const sx of [1, -1]) {
    add_(C(h(sx * 0.050, 0.064, -0.018), h(sx * 0.024, 0.014, 0.056), (opt.fem ? 0.012 : 0.015) * hs, (opt.fem ? 0.011 : 0.015) * hs, Hd(0.02)));    /* jaw line */
    add_(E(h(sx * (opt.fem ? 0.043 : 0.046), opt.fem ? 0.098 : 0.094, 0.058), [0.022 * hs, 0.014 * hs, 0.020 * hs], Hd(0.014)));                 /* cheekbone */
    add_(C(h(sx * 0.050, 0.123, 0.074), h(sx * 0.006, 0.126, 0.091), (opt.fem ? 0.008 : 0.011) * hs, (opt.fem ? 0.007 : 0.010) * hs, Hd(0.012)));  /* brow ridge */
    add_(E(h(sx * 0.031, 0.100, 0.094), [0.017 * hs, 0.010 * hs, 0.013 * hs], Hd(0.008, 'sub')));         /* eye socket */
  }
  for (const sx of [1, -1]) {
    add_(S(h(sx * 0.031, 0.100, 0.080), (opt.fem ? 0.0125 : 0.0115) * hs, Hd(0.003)));                                           /* eyeball */
    add_(S(h(sx * 0.011, 0.073, 0.100), 0.0085 * hs, Hd(0.006)));                                           /* nostril wing */
    add_(E(h(sx * (opt.fem ? 0.074 : 0.079), 0.092, -0.012), opt.fem ? [0.008 * hs, 0.024 * hs, 0.015 * hs] : [0.010 * hs, 0.030 * hs, 0.018 * hs], Hd(0.006), 0, sx * -14));   /* ear */
  }
  add_(C(h(0, 0.112, 0.094), h(0, 0.074, 0.111), (opt.fem ? 0.006 : 0.0075) * hs, (opt.fem ? 0.0085 : 0.0105) * hs, Hd(0.008)));                    /* nose */
  add_(E(h(0, 0.046, 0.087), opt.fem ? [0.017 * hs, 0.0075 * hs, 0.0088 * hs] : [0.018 * hs, 0.0058 * hs, 0.0070 * hs], Hd(0.010)));                           /* upper lip */
  add_(E(h(0, 0.034, 0.085), opt.fem ? [0.0145 * hs, 0.0082 * hs, 0.0092 * hs] : [0.015 * hs, 0.0058 * hs, 0.0070 * hs], Hd(0.010)));                           /* lower lip */
  add_(E(h(0, 0.0405, 0.0935), [0.017 * hs, 0.0013 * hs, 0.007 * hs], Hd(0.002, 'sub')));                 /* mouth line */
  } else {
    /* look100 round 3 FACES: a stylised tabletop sculpt — firm planes, a clear brow ledge, a wedge nose, flush eyes (no eyeballs: sockets +
       painted irises), a firm mouth line, a jaw angle and a chin, flat ears. Small blend radii (k) so nothing melts; built on a 2.2 mm head grid. */
    const fm = !!opt.fem, F = (m, f) => fm ? f : m;
    add_(E(h(0, 0.150, -0.012), [0.077 * hs, 0.094 * hs, 0.097 * hs], Hd(0.016)));                                                    /* cranium */
    add_(E(h(0, F(0.080, 0.084), 0.024), F([0.054, 0.068, 0.064], [0.049, 0.062, 0.060]).map(v => v * hs), Hd(0.016)));              /* face mass */
    add_(E(h(0, F(0.014, 0.021), F(0.068, 0.066)), F([0.024, 0.017, 0.017], [0.017, 0.014, 0.014]).map(v => v * hs), Hd(0.016)));    /* chin */
    for (const sx of [1, -1]) {
      add_(C(h(sx * 0.052, 0.066, -0.016), h(sx * F(0.030, 0.024), F(0.016, 0.022), 0.052), F(0.016, 0.012) * hs, F(0.015, 0.011) * hs, Hd(0.014)));   /* jaw: an angle under the ear */
      add_(E(h(sx * 0.045, F(0.095, 0.098), 0.060), [0.020 * hs, 0.012 * hs, 0.018 * hs], Hd(0.008)));                                  /* cheekbone */
      add_(C(h(sx * 0.044, 0.121, 0.079), h(sx * 0.006, 0.123, 0.092), F(0.0092, 0.0072) * hs, F(0.008, 0.0065) * hs, Hd(0.015)));       /* brow ledge (blended into the brow) */
      add_(E(h(sx * 0.031, 0.101, 0.093), [0.0138 * hs, 0.0085 * hs, 0.0075 * hs], Hd(0.008, 'sub')));                                    /* eye socket (shallow) */
      add_(E(h(sx * 0.031, 0.101, 0.081), [F(0.0128, 0.0134) * hs, F(0.0072, 0.008) * hs, 0.0085 * hs], Hd(0.004)));                   /* the eye: flush, painted */
      add_(S(h(sx * F(0.0105, 0.0095), 0.071, F(0.103, 0.102)), F(0.0068, 0.0058) * hs, Hd(0.004)));                                    /* nostril wing */
      add_(E(h(sx * F(0.079, 0.074), 0.094, -0.010), F([0.0085, 0.027, 0.016], [0.007, 0.022, 0.013]).map(v => v * hs), Hd(0.004), 0, sx * -14));   /* ear */
      add_(E(h(sx * F(0.086, 0.080), 0.094, -0.006), [0.004 * hs, 0.012 * hs, 0.007 * hs], Hd(0.002, 'sub')));                        /* the ear's hollow */
    }
    add_(C(h(0, 0.118, 0.093), h(0, 0.079, F(0.113, 0.110)), F(0.0066, 0.0055) * hs, F(0.0095, 0.008) * hs, Hd(0.005)));               /* nose bridge → tip (a wedge) */
    add_(S(h(0, 0.076, F(0.110, 0.107)), F(0.0078, 0.0066) * hs, Hd(0.005)));                                                          /* nose tip */
    add_(E(h(0, 0.047, 0.086), F([0.016, 0.0038, 0.0026], [0.0155, 0.005, 0.0036]).map(v => v * hs), Hd(0.012)));                       /* upper lip */
    add_(E(h(0, 0.034, 0.082), F([0.013, 0.0042, 0.0026], [0.013, 0.0054, 0.0038]).map(v => v * hs), Hd(0.012)));                     /* lower lip */
    add_(E(h(0, 0.0405, 0.0955), [0.018 * hs, 0.0012 * hs, 0.008 * hs], Hd(0.001, 'sub')));                                           /* mouth line */
  }

  /* ---------------- arms (AL / AR) ---------------- */
  for (const [sd, sx] of [['L', 1], ['R', -1]]) {
    const g = 'A' + sd, s = 's' + sd, e = 'e' + sd, w = 'w' + sd;
    const S0 = P(s), E0 = P(e), W0 = P(w);
    const up = limbFrame(S0, E0, sx), lo = limbFrame(E0, W0, sx);
    const A = (b, k = 0.012) => ({ g, b, k, op: 'add' });
    bulk(add_(M(up.at(-0.20, 0.010, 0.000), up.at(0.47, 0.020, 0.002), 0.060, 0.066, up.f, A({ a: 'ch', b: s, t0: 0.0, t1: 0.45 }, 0.03))),'delt');  /* deltoid */
    bulk(add_(M(up.at(-0.06, 0.004, 0.032), up.at(0.38, 0.008, 0.028), 0.040, 0.036, up.f, A({ a: 'ch', b: s, t0: 0.0, t1: 0.5 }, 0.02))),'delt');  /* front deltoid */
    bulk(add_(M(up.at(-0.06, 0.006, -0.030), up.at(0.36, 0.008, -0.026), 0.038, 0.034, up.f, A({ a: 'ch', b: s, t0: 0.0, t1: 0.5 }, 0.02))),'delt');  /* rear deltoid */
    bulk(add_(C(S0, E0, 0.052, 0.040, A(s, 0.016))),'fore');  /* upper arm core */
    bulk(add_(M(up.at(0.28, 0.000, 0.026), up.at(0.86, 0.000, 0.020), 0.042, 0.040, up.f, A(s))),'bi');  /* biceps */
    bulk(add_(M(up.at(0.14, 0.008, -0.026), up.at(0.74, 0.004, -0.022), 0.046, 0.040, up.f, A(s))),'bi');  /* triceps */
    add_(S(E0, 0.040, A([[s, 0.5], [e, 0.5]], 0.01)));                                 /* elbow */
    add_(C(E0, W0, 0.039, 0.024, A(e)));                                               /* forearm core */
    bulk(add_(M(lo.at(0.02, 0.008, 0.006), lo.at(0.50, 0.003, 0.002), 0.040, 0.034, lo.f, A(e, 0.018))),'fore');  /* forearm muscles */
    add_(S(W0, 0.025, A([[e, 0.5], [w, 0.5]], 0.010)));                                /* wrist */
    /* hand: palm faces the thigh (inward); width runs front-back */
    const tip = ENDS[w]; const hd = limbFrame(W0, tip, sx, [0, 0, 1]);
    const Hn = (k = 0.006) => ({ g, b: w, k, op: 'add' });
    add_(M(hd.at(0.02, 0.0, 0.002), hd.at(0.57, 0.0, 0.004), 0.022, 0.052, hd.f, Hn(0.008)));  /* palm (thin side-to-side) */
    const fingers = [[0.033, 0.44], [0.0115, 0.48], [-0.0105, 0.46], [-0.031, 0.38]];
    const gk = (opt.grip || {})[sd] || 'open';
    if (gk !== 'open') {   /* look100: a closed fist round a bar along hd.f (hilt: r 15 mm, shield handle: r 11 mm) */
      const Lh = Math.hypot(...sub(tip, W0)), bar = gripBar(W0, tip, sx, gk);
      const pt = (d, o, f) => add(add(add(W0, mul(hd.u, d)), mul(hd.o, o)), mul(hd.f, f));
      const R = bar.r + 0.0112;
      for (const [fw, L] of fingers) {
        const len = L * Lh * 0.5, th0 = Math.atan2(0.024, -0.016), sweep = len / R;   /* knuckle angle in the (u, o) plane round the bar */
        const ring = (a) => pt(bar.d + Math.cos(a) * R, bar.o + Math.sin(a) * R, fw * 0.92);
        const n = 3; let prev = pt(0.52 * Lh, -0.002, fw * 0.92);
        for (let i = 1; i <= n; i++) { const p2 = ring(th0 - sweep * i / n); add_(C(prev, p2, 0.0122 - i * 0.0007, 0.0118 - i * 0.0008, Hn(0.003))); prev = p2; }
      }
      /* thumb: from the heel of the hand over the curled fingers, on the palm side */
      const t0 = pt(0.10 * Lh, -0.008, 0.026), t1 = pt(bar.d - 0.012, bar.o - R * 0.75, 0.05), t2 = pt(bar.d + 0.012, bar.o - R * 0.95, 0.032);
      add_(C(t0, t1, 0.0135, 0.0115, Hn(0.006))); add_(C(t1, t2, 0.0115, 0.0102, Hn(0.003)));
    } else
    for (const [fw, L] of fingers) {
      const k0 = hd.at(0.52, -0.002, fw);
      const ang = 0.35; const k1 = add(add(k0, mul(hd.u, L * 0.19 * Math.cos(ang))), mul(hd.o, -L * 0.19 * Math.sin(ang)));
      add_(C(k0, k1, 0.0122, 0.0102, Hn(0.004)));
    }
    if (gk === 'open') add_(C(hd.at(0.10, -0.006, 0.026), hd.at(0.40, -0.024, 0.046), 0.014, 0.011, Hn(0.006)));  /* thumb */
  }

  /* ---------------- legs (LL / LR) ---------------- */
  for (const [sd, sx] of [['L', 1], ['R', -1]]) {
    const g = 'L' + sd, hh = 'h' + sd, kk = 'k' + sd, aa = 'a' + sd;
    const H0 = P(hh), K0 = P(kk), A0 = P(aa);
    const th = limbFrame(H0, K0, sx), sh = limbFrame(K0, A0, sx);
    const Lg = (b, k = 0.014) => ({ g, b, k, op: 'add' });
    add_(C(add(H0, [sx * 0.006, 0.050, -0.010]), K0, 0.078, 0.052, Lg({ a: 'pe', b: hh, t0: 0.0, t1: 0.25 }, 0.07)));   /* thigh core */
    bulk(add_(M(th.at(0.18, 0.042, 0.010), th.at(0.86, 0.032, 0.008), 0.050, 0.054, th.f, Lg(hh))),'thigh');  /* vastus lateralis */
    bulk(add_(M(th.at(0.10, 0.008, 0.040), th.at(0.80, 0.004, 0.034), 0.048, 0.044, th.f, Lg(hh))),'thigh');  /* rectus femoris */
    add_(M(th.at(0.66, -0.030, 0.024), th.at(0.95, -0.026, 0.020), 0.040, 0.036, th.f, Lg(hh, 0.012)));  /* vastus medialis */
    bulk(add_(M(th.at(0.10, 0.004, -0.034), th.at(0.86, 0.000, -0.030), 0.054, 0.044, th.f, Lg(hh))),'thigh');  /* hamstrings */
    add_(M(th.at(0.06, -0.022, 0.004), th.at(0.52, -0.024, 0.004), 0.034, 0.048, th.f, Lg(hh, 0.012)));  /* adductors */
    add_(S(K0, 0.048, Lg([[hh, 0.5], [kk, 0.5]], 0.012)));                                /* knee */
    add_(M(add(K0, mul(th.f, 0.026)), add(add(K0, mul(th.f, 0.028)), [0, -0.05, 0]), 0.024, 0.016, th.f, Lg([[hh, 0.4], [kk, 0.6]], 0.01)));  /* patella */
    add_(C(K0, A0, 0.048, 0.030, Lg(kk)));                                                /* shin core */
    bulk(add_(M(sh.at(0.05, -0.021, -0.028), sh.at(0.52, -0.014, -0.022), 0.040, 0.046, sh.f, Lg(kk, 0.012))),'calf');  /* calf, inner head */
    bulk(add_(M(sh.at(0.05, 0.022, -0.026), sh.at(0.44, 0.014, -0.020), 0.036, 0.040, sh.f, Lg(kk, 0.012))),'calf');  /* calf, outer head */
    add_(M(sh.at(0.30, 0.000, -0.018), sh.at(0.82, 0.000, -0.012), 0.044, 0.032, sh.f, Lg(kk)));           /* soleus */
    add_(M(sh.at(0.10, 0.016, 0.022), sh.at(0.62, 0.010, 0.020), 0.024, 0.020, sh.f, Lg(kk, 0.01)));       /* tibialis */
    add_(S(A0, 0.029, Lg([[kk, 0.5], [aa, 0.5]], 0.01)));                                 /* ankle */
    add_(S(add(A0, [sx * 0.024, -0.006, -0.004]), 0.014, Lg(aa, 0.006)));                 /* outer ankle bone */
    add_(S(add(A0, [-sx * 0.020, 0.000, -0.002]), 0.014, Lg(aa, 0.006)));                 /* inner ankle bone */
    /* foot */
    const fy = SOLE_Y;
    add_(S([A0[0], fy + 0.033, A0[2] - 0.042], 0.033, Lg(aa, 0.02)));                      /* heel */
    add_(E([A0[0] + sx * 0.004, fy + 0.034, A0[2] + 0.060], [0.042, 0.032, 0.095], Lg(aa, 0.02), 0, sx * 4));   /* foot */
    add_(E([A0[0] + sx * 0.002, fy + 0.017, A0[2] + 0.150], [0.044, 0.017, 0.036], Lg(aa, 0.012), 0, sx * 4));  /* toes */
    add_(C([A0[0] - sx * 0.012, fy + 0.050, A0[2] + 0.02], [A0[0] - sx * 0.020, fy + 0.026, A0[2] + 0.13], 0.016, 0.012, Lg(aa, 0.014)));  /* instep */
  }
  if (opt.fem) {   /* look100 round 2: the torso follows her skeleton table — upper chest narrower, hips wider (x only) */
    const kx = (y) => y > 1.33 ? 0.92 : y > 1.12 ? 0.92 + (1.33 - y) / 0.21 * 0.08 : y > 1.02 ? 1.0 : 1.05;
    const sx3 = (v) => v && [v[0] * kx(v[1]), v[1], v[2]];
    for (const p of prims) if (p.g === 'T') { if (p.c) p.c = sx3(p.c); if (p.a) p.a = sx3(p.a); if (p.b2) p.b2 = sx3(p.b2); }
  }
  for (const p of prims) { p.gi = GI[p.g]; p.box = primBox(p, Math.max(p.k, 0.006) + 0.012); }
  return prims;
}

/* ================= the field ================= */
function smin(a, b, k) { if (k <= 0) return Math.min(a, b); const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; }
function smax(a, b, k) { return -smin(-a, -b, k); }

function* buildField(prims, h) {
  let lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (const p of prims) for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], p.box[0][i]); hi[i] = Math.max(hi[i], p.box[1][i]); }
  lo = lo.map(v => v - 2 * h); hi = hi.map(v => v + 2 * h);
  const nx = Math.ceil((hi[0] - lo[0]) / h) + 1, ny = Math.ceil((hi[1] - lo[1]) / h) + 1, nz = Math.ceil((hi[2] - lo[2]) / h) + 1;
  const N = nx * ny * nz; const F = new Float32Array(N).fill(1); const G = new Uint8Array(N);
  let pn = 0;
  for (const p of prims) {
    if ((++pn & 3) === 0) yield;
    const i0 = Math.max(0, Math.floor((p.box[0][0] - lo[0]) / h)), i1 = Math.min(nx - 1, Math.ceil((p.box[1][0] - lo[0]) / h));
    const j0 = Math.max(0, Math.floor((p.box[0][1] - lo[1]) / h)), j1 = Math.min(ny - 1, Math.ceil((p.box[1][1] - lo[1]) / h));
    const k0 = Math.max(0, Math.floor((p.box[0][2] - lo[2]) / h)), k1 = Math.min(nz - 1, Math.ceil((p.box[1][2] - lo[2]) / h));
    const sub_ = p.op === 'sub', gi = p.gi, inc = INC[gi], k = p.k;
    for (let kz = k0; kz <= k1; kz++) { const z = lo[2] + kz * h;
      for (let jy = j0; jy <= j1; jy++) { const y = lo[1] + jy * h; let idx = nx * (jy + ny * kz) + i0;
        for (let ix = i0; ix <= i1; ix++, idx++) {
          const x = lo[0] + ix * h; const d = sdPrim(p, x, y, z); const f = F[idx];
          if (sub_) { if (G[idx] === gi || G[idx] === 0 || p.g === 'T' || p.g === 'H') F[idx] = smax(f, -d, k); continue; }
          if (d < f) { F[idx] = inc[G[idx]] ? d : smin(f, d, k); G[idx] = gi; }
          else F[idx] = inc[G[idx]] ? f : smin(f, d, k);
        } } }
  }
  return { F, G, nx, ny, nz, lo, h };
}
function sampleF(fd, x, y, z) {
  const { F, nx, ny, nz, lo, h } = fd;
  let fx = (x - lo[0]) / h, fy = (y - lo[1]) / h, fz = (z - lo[2]) / h;
  let i = Math.floor(fx), j = Math.floor(fy), k = Math.floor(fz);
  if (i < 0 || j < 0 || k < 0 || i >= nx - 1 || j >= ny - 1 || k >= nz - 1) return 1;
  fx -= i; fy -= j; fz -= k;
  const o = i + nx * (j + ny * k), sy = nx, sz = nx * ny;
  const c00 = F[o] * (1 - fx) + F[o + 1] * fx, c10 = F[o + sy] * (1 - fx) + F[o + sy + 1] * fx;
  const c01 = F[o + sz] * (1 - fx) + F[o + sz + 1] * fx, c11 = F[o + sz + sy] * (1 - fx) + F[o + sz + sy + 1] * fx;
  return (c00 * (1 - fy) + c10 * fy) * (1 - fz) + (c01 * (1 - fy) + c11 * fy) * fz;
}
function gradF(fd, x, y, z) {
  const e = fd.h * 0.75;
  return nrm([sampleF(fd, x + e, y, z) - sampleF(fd, x - e, y, z), sampleF(fd, x, y + e, z) - sampleF(fd, x, y - e, z), sampleF(fd, x, y, z + e) - sampleF(fd, x, y, z - e)]);
}

/* surface nets: one vertex per sign-changing cell, one quad per sign-changing grid edge */
function* surfaceNets(fd) {
  const { F, nx, ny, nz, lo, h } = fd; const sy = nx, sz = nx * ny;
  const vid = new Map(); const pos = []; const quads = [];
  const corner = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const coff = corner.map(c => c[0] + sy * c[1] + sz * c[2]);
  const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const v = new Float32Array(8);
  for (let k = 0; k < nz - 1; k++) { if ((k & 7) === 0) yield; for (let j = 0; j < ny - 1; j++) { let o = nx * (j + ny * k);
    for (let i = 0; i < nx - 1; i++, o++) {
      let m = 0; for (let c = 0; c < 8; c++) { v[c] = F[o + coff[c]]; if (v[c] < 0) m |= 1 << c; }
      if (m === 0 || m === 255) continue;
      let px = 0, py = 0, pz = 0, n = 0;
      for (const [a, b] of edges) {
        if (((m >> a) & 1) === ((m >> b) & 1)) continue;
        const t = v[a] / (v[a] - v[b]); const A = corner[a], B = corner[b];
        px += A[0] + (B[0] - A[0]) * t; py += A[1] + (B[1] - A[1]) * t; pz += A[2] + (B[2] - A[2]) * t; n++;
      }
      vid.set(o, pos.length / 3); pos.push(lo[0] + (i + px / n) * h, lo[1] + (j + py / n) * h, lo[2] + (k + pz / n) * h);
    } } }
  /* quads: every sign-changing grid edge at a cell's min corner; its 4 cells all hold vertices */
  const tri = [];
  let qn = 0;
  for (const [o] of vid) {
    if ((++qn & 32767) === 0) yield;
    const i = o % nx, j = Math.floor(o / nx) % ny, k = Math.floor(o / sz);
    const g0 = F[o] < 0;
    if (j > 0 && k > 0 && g0 !== (F[o + 1] < 0)) push([o, o - sy, o - sy - sz, o - sz], g0);
    if (i > 0 && k > 0 && g0 !== (F[o + sy] < 0)) push([o, o - sz, o - sz - 1, o - 1], g0);
    if (i > 0 && j > 0 && g0 !== (F[o + sz] < 0)) push([o, o - 1, o - 1 - sy, o - sy], g0);
  }
  function push(c, inside) {
    const a = vid.get(c[0]), b = vid.get(c[1]), d = vid.get(c[2]), e = vid.get(c[3]);
    if (a === undefined || b === undefined || d === undefined || e === undefined) return;
    if (inside) tri.push(a, b, d, a, d, e); else tri.push(a, d, b, a, e, d);
  }
  return { pos, tri };
}

/* ================= masks for the clothing (rest pose) ================= */
function segDist(p, a, b) { const ab = sub(b, a), t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / dot(ab, ab))); return Math.hypot(...sub(p, add(a, mul(ab, t)))); }
function polyDist(p, pts) { let d = 1e9; for (let i = 0; i < pts.length - 1; i++) d = Math.min(d, segDist(p, pts[i], pts[i + 1])); return d; }
/* march along a ray until the field turns negative → a point on the skin */
function hitSkin(fd, from, dir, maxd = 0.6) {
  const s = fd.h * 0.5; let prev = sampleF(fd, ...from), t = 0;
  for (; t < maxd; t += s) {
    const p = add(from, mul(dir, t + s)); const f = sampleF(fd, ...p);
    if (f < 0) { const tt = t + s * prev / (prev - f); return add(from, mul(dir, tt)); }
    prev = f;
  }
  return null;
}

/* ================= build ================= */
export function buildBody(opts = {}) { const g = buildSteps(opts); for (;;) { const r = g.next(); if (r.done) return r.value; } }
/* the same build cut into slices of ~sliceMs so a page stays responsive (the game builds the body this way) */
export async function buildBodyAsync(opts = {}, sliceMs = 14, onStep) {
  const g = buildSteps(opts); let t = performance.now(), n = 0;
  for (;;) { const r = g.next(); if (r.done) return r.value; if (performance.now() - t > sliceMs) { if (onStep) onStep(++n); await new Promise(ok => setTimeout(ok, 0)); t = performance.now(); } }
}
function* buildSteps(opts = {}) {
  const t0 = performance.now();
  const o = Object.assign({ res: 0.004, hair: 'cap', outline: 0.012 }, opts);
  const prims = sculpt(o);
  const fd = yield* buildField(prims, o.res);
  const t1 = performance.now();
  const sn = yield* surfaceNets(fd);
  const t2 = performance.now();
  let nv = sn.pos.length / 3; let pos = new Float32Array(sn.pos); let nor = new Float32Array(nv * 3); let fdH = null;
  /* project onto the surface, smooth normals from the field gradient */
  for (let i = 0; i < nv; i++) {
    if ((i & 4095) === 4095) yield;
    let p = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]];
    for (let it = 0; it < 2; it++) { const f = sampleF(fd, ...p), g = gradF(fd, ...p); p = sub(p, mul(g, f)); }
    const g = gradF(fd, ...p);
    pos.set(p, i * 3); nor.set(g, i * 3);
  }
  /* look100 round 3: the HEAD on its own finer grid (opt.headRes, e.g. 2.2 mm): the body's head triangles are dropped and the head-only
     surface (projected on its own field) is merged in where the head is the closest part — so the face keeps its planes, and every later
     step (weights, paint, crease ink, hair + beard shells) runs on the fine head for free */
  if (o.headRes) {
    const YC = 1.585, primsH = prims.filter(q => q.g === 'H' || (q.g === 'T' && q.box[1][1] > 1.5)), addH = primsH.filter(q => q.op === 'add' && q.g === 'H'), addT = prims.filter(q => q.g === 'T' && q.op === 'add');
    const minOf = (L, x, y, z) => { let d = 1e9; for (const q of L) { const bb = q.box; if (x < bb[0][0] || y < bb[0][1] || z < bb[0][2] || x > bb[1][0] || y > bb[1][1] || z > bb[1][2]) continue; d = Math.min(d, sdPrim(q, x, y, z)); } return d; };
    const isHead = (x, y, z) => y > 1.5 && minOf(addH, x, y, z) < minOf(addT, x, y, z);
    fdH = yield* buildField(primsH, o.headRes); const snH = yield* surfaceNets(fdH);
    const nH = snH.pos.length / 3, posH = new Float32Array(snH.pos), norH = new Float32Array(nH * 3), keepH = new Uint8Array(nH);
    for (let i = 0; i < nH; i++) { if ((i & 4095) === 4095) yield; let p = [posH[i * 3], posH[i * 3 + 1], posH[i * 3 + 2]];
      for (let it = 0; it < 2; it++) { const f = sampleF(fdH, ...p), g = gradF(fdH, ...p); p = sub(p, mul(g, f)); } posH.set(p, i * 3); norH.set(gradF(fdH, ...p), i * 3);
      keepH[i] = p[1] > YC - 0.005 ? 1 : 0; }
    const dropB = new Uint8Array(nv); for (let i = 0; i < nv; i++) dropB[i] = pos[i * 3 + 1] > YC + 0.005 ? 1 : 0;
    const tri = []; for (let t = 0; t < sn.tri.length; t += 3) { const a = sn.tri[t], b = sn.tri[t + 1], c = sn.tri[t + 2]; if (dropB[a] && dropB[b] && dropB[c]) continue; tri.push(a, b, c); }
    for (let t = 0; t < snH.tri.length; t += 3) { const a = snH.tri[t], b = snH.tri[t + 1], c = snH.tri[t + 2]; if (!keepH[a] || !keepH[b] || !keepH[c]) continue; tri.push(a + nv, b + nv, c + nv); }
    const P2 = new Float32Array((nv + nH) * 3), N2 = new Float32Array((nv + nH) * 3); P2.set(pos); P2.set(posH, nv * 3); N2.set(nor); N2.set(norH, nv * 3);
    pos = P2; nor = N2; nv += nH; sn.tri = tri;
  }
  /* skin weights + dominant group per vertex */
  const rig = makeBones(); const bi = rig.index;
  const skinI = new Uint16Array(nv * 4), skinW = new Float32Array(nv * 4), grp = new Uint8Array(nv);
  const addPrims = prims.filter(p => p.op === 'add');
  const SIG = 0.010;
  for (let i = 0; i < nv; i++) {
    if ((i & 2047) === 2047) yield;
    const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
    const cand = []; let dmin = 1e9, gmin = 0;
    for (const p of addPrims) {
      const b = p.box; if (x < b[0][0] || y < b[0][1] || z < b[0][2] || x > b[1][0] || y > b[1][1] || z > b[1][2]) continue;
      const d = sdPrim(p, x, y, z); cand.push([p, d]); if (d < dmin) { dmin = d; gmin = p.gi; }
    }
    grp[i] = gmin;
    const bw = {};
    for (const [p, d] of cand) {
      if (INC[gmin][p.gi]) continue;
      if (d > dmin + 0.05) continue;
      const w = Math.exp(-(d - dmin) / SIG);
      const b = p.b;
      if (typeof b === 'string') bw[b] = (bw[b] || 0) + w;
      else if (Array.isArray(b)) for (const [k, f] of b) bw[k] = (bw[k] || 0) + w * f;
      else {
        const ab = sub(p.b2, p.a); const t = Math.max(0, Math.min(1, dot(sub([x, y, z], p.a), ab) / dot(ab, ab)));
        let s = (t - b.t0) / (b.t1 - b.t0); s = Math.max(0, Math.min(1, s)); s = s * s * (3 - 2 * s);
        bw[b.a] = (bw[b.a] || 0) + w * (1 - s); bw[b.b] = (bw[b.b] || 0) + w * s;
      }
    }
    const arr = Object.entries(bw).sort((a, b) => b[1] - a[1]).slice(0, 4); const sum = arr.reduce((s, a) => s + a[1], 0) || 1;
    arr.forEach(([k, w], n) => { skinI[i * 4 + n] = bi[k]; skinW[i * 4 + n] = w / sum; });
    if (!arr.length) { skinI[i * 4] = bi.pe; skinW[i * 4] = 1; }
  }
  const t3 = performance.now();

  /* ---------- body colours: skin, face paint, crease ink ---------- */
  const col = new Float32Array(nv * 3);
  const L = Object.fromEntries(Object.entries(COL).map(([k, c]) => [k, lin(c)]));
  const HO = [0, 1.605, 0], hs = o.headScale || 1;
  const eyeC = [1, -1].map(sx => add(HO, mul([sx * 0.031, 0.100, 0.080], hs)));
  const browL = [1, -1].map(sx => [add(HO, mul([sx * 0.050, 0.118, 0.080], hs)), add(HO, mul([sx * 0.030, 0.123, 0.095], hs)), add(HO, mul([sx * 0.011, 0.119, 0.099], hs))]);
  const ink = new Float32Array(nv);
  const vk = new Uint8Array(nv);   /* what each vertex is painted as: 0 skin · 1 iris · 2 eye white · 3 brow · 4 lip (setLook repaints) */
  for (let i = 0; i < nv; i++) {
    if ((i & 8191) === 8191) yield;
    const p = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]], n = [nor[i * 3], nor[i * 3 + 1], nor[i * 3 + 2]];
    let c = L.skin;
    if (grp[i] === GI.H) {
      if (!o.face2) { for (const ec of eyeC) { const d = Math.hypot(...sub(p, ec)); if (d < 0.0155 * hs) { const fwd = (p[2] - ec[2]) / d; c = fwd > 0.62 ? L.iris : L.eyeW; vk[i] = fwd > 0.62 ? 1 : 2; } } }
      else if (n[2] > 0.15 && p[2] > HO[2] + 0.074 * hs) for (const ec of eyeC) {   /* round 3: painted eyes — an almond of white, an iris, a dark upper lid */
        const ex = (p[0] - ec[0]) / (0.0128 * hs), ey = (p[1] - (ec[1] + 0.001 * hs)) / ((o.fem ? 0.0074 : 0.0066) * hs), r = Math.hypot(ex, ey), di = Math.hypot(p[0] - ec[0], p[1] - ec[1]);
        if (r < 1) { c = di < 0.0052 * hs ? L.iris : L.eyeW; vk[i] = di < 0.0052 * hs ? 1 : 2; }
        else if (r < (o.fem ? 1.5 : 1.3) && ey > -0.1) { c = L.brow; vk[i] = 3; } }
      for (const bl of browL) if (polyDist(p, bl) < (o.fem ? 0.0034 : 0.0050) * hs && n[2] > 0.2) { c = L.brow; vk[i] = 3; }
      if (o.fem) for (const ec of eyeC) { const d = Math.hypot(...sub(p, ec)); if (d > 0.0118 * hs && d < 0.0165 * hs && p[1] > ec[1] + 0.003 * hs && n[2] > 0.3) { c = L.brow; vk[i] = 3; } }   /* lashes: a dark upper lid */
      const ly = p[1] - HO[1];
      if (Math.abs(p[0]) < 0.016 * hs && ly > 0.031 * hs && ly < 0.050 * hs && p[2] > 0.088 * hs + HO[2]) { c = L.lip; vk[i] = 4; }
      if (o.face2 && Math.abs(p[0]) < 0.0165 * hs && Math.abs(ly - 0.0405 * hs) < 0.0015 * hs && p[2] > 0.085 * hs + HO[2]) { c = L.brow; vk[i] = 3; }   /* the mouth line */
    }
    /* crease ink: how much the skin is hemmed in just above it */
    const e = grp[i] === GI.H ? 0.0065 : 0.011; const fdk = grp[i] === GI.H && fdH ? fdH : fd; const f = sampleF(fdk, p[0] + n[0] * e, p[1] + n[1] * e, p[2] + n[2] * e) / e;
    let k = Math.max(0, Math.min(1, (0.62 - f) / 0.3));
    /* no crease ink where a shoulder meets the torso: raising the arm would stretch it into a blot */
    let wS = 0, wT = 0; for (let q = 0; q < 4; q++) { const b = skinI[i * 4 + q], w = skinW[i * 4 + q]; if (b === bi.sL || b === bi.sR) wS += w; if (b === bi.ch || b === bi.sp) wT += w; }
    if (grp[i] === GI.H) k = Math.max(0, (k - (o.face2 ? 0.42 : 0.2)) / (o.face2 ? 0.58 : 0.8));   /* the face keeps only its tight creases (no grey smudge) */
    ink[i] = (wS > 0.04 && wT > 0.04) || (grp[i] !== GI.T && wT > 0.04 && (grp[i] === GI.AL || grp[i] === GI.AR)) ? k * 0.2 : k;
    col.set(c, i * 3);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('cav', new THREE.BufferAttribute(ink, 1));
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinI, 4));
  geo.setAttribute('skinWeight', new THREE.BufferAttribute(skinW, 4));
  geo.setIndex(sn.tri.length > 65535 * 3 ? new THREE.Uint32BufferAttribute(sn.tri, 1) : new THREE.Uint32BufferAttribute(sn.tri, 1));

  const group = new THREE.Group(); group.name = 'gladiator';
  rig.root.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(rig.list);
  const mats = makeMaterials(o);
  const body = new THREE.SkinnedMesh(geo, mats.skin); body.name = 'body';
  body.add(rig.root); body.bind(skeleton); body.frustumCulled = false;
  group.add(body);
  const outlines = [];
  const addOutline = (mesh, masked) => { const om = outlineMesh(mesh, mats, masked); mesh.parent.add(om); outlines.push(om); return om; };
  addOutline(body, false);

  /* ---------- clothing shells ---------- */
  const shellParts = [];
  const shellFrom = (name, maskFn, colFn, offset, opt2 = {}) => { const bandFn = opt2.band || null;
    const keep = new Uint8Array(nv); const mval = new Float32Array(nv);
    for (let i = 0; i < nv; i++) { const p = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]]; mval[i] = maskFn(p, grp[i], [nor[i * 3], nor[i * 3 + 1], nor[i * 3 + 2]]); }
    const tri = sn.tri, outTri = [], remap = new Int32Array(nv).fill(-1); const P2 = [], N2 = [], C2 = [], M2 = [], B2 = [], SI = [], SW = [];
    for (let t = 0; t < tri.length; t += 3) {
      const a = tri[t], b = tri[t + 1], c = tri[t + 2];
      if (mval[a] < 0 && mval[b] < 0 && mval[c] < 0) continue;
      for (const v of [a, b, c]) {
        if (remap[v] < 0) {
          remap[v] = P2.length / 3; const n = [nor[v * 3], nor[v * 3 + 1], nor[v * 3 + 2]], p = [pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]];
          const off = typeof offset === 'function' ? offset(p, mval[v]) : offset;
          P2.push(p[0] + n[0] * off, p[1] + n[1] * off, p[2] + n[2] * off); N2.push(...n);
          C2.push(...colFn(p, mval[v], grp[v])); M2.push(mval[v]); B2.push(bandFn ? bandFn(p) : 1);
          for (let q = 0; q < 4; q++) { SI.push(skinI[v * 4 + q]); SW.push(skinW[v * 4 + q]); }
        }
        outTri.push(remap[v]);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P2, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N2, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(C2, 3)); g.setAttribute('mask', new THREE.Float32BufferAttribute(M2, 1)); g.setAttribute('band', new THREE.Float32BufferAttribute(B2, 1));
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(SI, 4)); g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(SW, 4));
    g.setIndex(outTri);
    const m = new THREE.SkinnedMesh(g, opt2.hem ? hemMat(opt2.mat || mats.cloth, opt2.hem) : (opt2.mat || mats.cloth)); m.name = name; m.bind(skeleton, body.bindMatrix); m.frustumCulled = false;
    group.add(m); m.userData.ink = addOutline(m, true); shellParts.push(m); return m;
  };
  /* where the harness runs: polylines found on the skin */
  const front = (x, y) => hitSkin(fd, [x, y, 0.35], [0, 0, -1]);
  const back = (x, y) => hitSkin(fd, [x, y, -0.35], [0, 0, 1]);
  const top = (x, z) => hitSkin(fd, [x, 1.75, z], [0, -1, 0], 0.5);
  const RING = front(0, 1.312), BRING = back(0, 1.318);
  const straps = [1, -1].map(sx => [RING, front(sx * 0.05, 1.360), front(sx * 0.095, 1.425), front(sx * 0.118, 1.470), top(sx * 0.122, -0.005), back(sx * 0.115, 1.455), back(sx * 0.06, 1.378), BRING].filter(Boolean));
  const projSkin = (p) => { for (let it = 0; it < 4; it++) { const f = sampleF(fd, ...p), g = gradF(fd, ...p); p = sub(p, mul(g, f)); } return p; };
  const densify = (pts) => { const out = [pts[0]]; for (let i = 1; i < pts.length; i++) { const n = Math.max(1, Math.ceil(Math.hypot(...sub(pts[i], pts[i - 1])) / 0.008)); for (let j = 1; j <= n; j++) out.push(projSkin(lerp(pts[i - 1], pts[i], j / n))); } return out; };
  for (let i = 0; i < straps.length; i++) straps[i] = densify(straps[i]);
  const isTorsoish = (g, p) => g === GI.T || ((g === GI.AL || g === GI.AR) && Math.abs(p[0]) < 0.215 && p[1] > 1.38);
  const harnessMask = (p, g) => {
    if (!isTorsoish(g, p)) return -1;
    let m = -1; for (const s of straps) m = Math.max(m, 0.024 - polyDist(p, s));
    /* the band under the pecs, all the way round */
    const yb = 1.262 + (p[2] < 0 ? 0.012 : 0) - Math.max(0, Math.abs(p[0]) - 0.05) * 0.05;
    if (g === GI.T && p[1] > 1.2 && p[1] < 1.33) m = Math.max(m, 0.0145 - Math.abs(p[1] - yb));
    return m;
  };
  const leather = (p, m) => { const hi = (Math.sin(p[0] * 210 + p[1] * 160) * 0.5 + 0.5) * 0.25; return lerp(L.harness, L.harnessHi, hi); };
  yield; const harnessBits = [shellFrom('harness', harnessMask, leather, 0.0055, { mat: mats.leather })]; yield;

  const beltY = (p) => 1.080 - 0.010 * Math.max(0, Math.min(1, p[2] / 0.09));
  shellFrom('belt', (p, g) => g === GI.T ? 0.027 - Math.abs(p[1] - beltY(p)) : -1,
    (p, m) => lerp(L.belt, L.harnessHi, (Math.sin(p[0] * 120) * 0.5 + 0.5) * 0.3), 0.011, { mat: mats.leather });
  shellFrom('wrap', (p, g) => g === GI.T ? 0.029 - Math.abs(p[1] - (beltY(p) - 0.052)) : -1,
    (p) => lerp(L.wrap, mul(L.wrap, 0.82), (Math.sin(p[0] * 90 + p[1] * 300) * 0.5 + 0.5) * 0.5), 0.0085, { mat: mats.cloth });
  /* subligaculum: below the wrap, down to the leg line (outer hip high, crotch low) */
  const legLine = (p) => { const ax = Math.abs(p[0]); const back_ = p[2] < -0.02; return (back_ ? 0.815 : 0.805) + (back_ ? 0.08 : 0.115) * Math.max(0, Math.min(1, (ax - 0.025) / 0.13)); };
  const loinMask = (p, g) => {
    const topY = beltY(p) - 0.058;
    if (g === GI.T) return Math.min(topY - p[1] + 0.012, p[1] - legLine(p) + 0.03);
    if (g === GI.LL || g === GI.LR) return Math.min(topY - p[1], p[1] - legLine(p));
    return -1;
  };
  const vA = [0.112, 0.985], vB = [0.0, 0.835];
  const vBand = (p) => {   /* signed distance to the front V panel's seam (|x|, y on the front) */
    if (p[2] < 0.02 || p[1] > vA[1] + 0.01) return 1;
    const dx = vB[0] - vA[0], dy = vB[1] - vA[1], l = Math.hypot(dx, dy);
    return ((Math.abs(p[0]) - vA[0]) * dy - (p[1] - vA[1]) * dx) / l;
  };
  const loinCol = (p, m) => {
    const fold = Math.sin(Math.atan2(p[0], p[2]) * 14 + p[1] * 30) * 0.5 + 0.5; return lerp([1, 1, 1], [0.86, 0.86, 0.86], fold * (Math.abs(p[0]) > 0.09 ? 0.8 : 0.25));   /* neutral folds: the colour is the material's (setLook) */
  };
  yield; const loin = shellFrom('loincloth', loinMask, loinCol, (p, m) => 0.0065 + Math.max(0, Math.abs(p[0]) - 0.1) * 0.12, { mat: mats.cloth, band: vBand, hem: { w: 0.009, col: COL.hem, bw: 0.0032, bcol: COL.hem } });

  /* sandal straps: helices up the shin crossing at front and back, a band below the knee, foot straps */
  const shin = { L: [P('kL'), P('aL')], R: [P('kR'), P('aR')] };
  const sandalMask = (p, g) => {
    if (g !== GI.LL && g !== GI.LR) return -1;
    const sd = g === GI.LL ? 'L' : 'R', sx = sd === 'L' ? 1 : -1; const [K0, A0] = shin[sd];
    const ax = nrm(sub(K0, A0)); const rel = sub(p, A0); const hgt = dot(rel, ax);
    let m = -1;
    if (hgt > -0.02 && hgt < 0.345) {
      const r = sub(rel, mul(ax, hgt)); const ph = Math.atan2(r[0] * sx, r[2]);  /* 0 = front */
      const per = 0.105, tw = per * ph / (2 * Math.PI);
      const u1 = hgt + tw, u2 = hgt - tw + per / 2;
      const d1 = Math.abs(u1 - per * Math.round(u1 / per)), d2 = Math.abs(u2 - per * Math.round(u2 / per));
      const hw = 0.0105;
      if (hgt > 0.02) m = Math.max(0.78 * hw - d1 * 0.78, 0.78 * hw - d2 * 0.78);
      m = Math.max(m, 0.0115 - Math.abs(hgt - 0.334));            /* top band */
      m = Math.max(m, 0.0085 - Math.abs(hgt - 0.030));             /* ankle band */
      if (hgt > 0.335) m = Math.min(m, 0.0115 - Math.abs(hgt - 0.334));
    }
    /* foot straps: over the instep, a toe loop, round the heel */
    if (p[1] < 0.09) {
      const fz = p[2] - A0[2];
      if (p[1] > SOLE_Y + 0.018) m = Math.max(m, 0.0115 - Math.abs(fz - 0.055));
      if (p[1] > SOLE_Y + 0.010) m = Math.max(m, 0.0065 - Math.abs(fz - 0.128));
      if (fz < -0.03) m = Math.max(m, 0.009 - Math.abs(p[1] - (SOLE_Y + 0.040)));
    }
    return m;
  };
  yield; shellFrom('sandals', sandalMask, (p, m) => lerp(L.strap, mul(L.strap, 1.25), (Math.sin(p[1] * 400) * 0.5 + 0.5) * 0.2), 0.0048, { mat: mats.leather });

  loin.material.color.setRGB(...L.loin);
  /* ---------- hair, beards, the strophium: shells made the first time a look asks for them (setLook) ---------- */
  const hl = (p) => sub(p, HO).map(v => v / hs);   /* head-local, unscaled */
  const capLine = (lp) => { const th = Math.atan2(Math.abs(lp[0]), lp[2]); return th < 0.9 ? 0.186 - th * 0.035 : th < 1.9 ? 0.154 - (th - 0.9) * 0.07 : 0.084 - (th - 1.9) * 0.03; };
  const noEars = (lp, m) => (Math.abs(lp[0]) > 0.066 && lp[1] < 0.125 && lp[1] > 0.045 && lp[2] > -0.04 && lp[2] < 0.02) ? Math.min(m, -0.001) : m;
  const hairCol = (p) => lerp([0.74, 0.74, 0.74], [1, 1, 1], (Math.sin(p[0] * 600 + p[2] * 300) * 0.5 + 0.5) * 0.7);
  const mouthCut = (lp, m) => { const d = Math.max(Math.abs(lp[0]) - 0.019, Math.abs(lp[1] - 0.041) - 0.012, 0.068 - lp[2]); return d < 0 ? Math.min(m, d) : m; };
  const HAIR = {
    cap: () => shellFrom('hair', (p, g) => g !== GI.H ? -1 : noEars(hl(p), hl(p)[1] - capLine(hl(p))), hairCol, (p, m) => 0.0045 + Math.min(0.006, Math.max(0, m) * 0.25), { mat: mats.hair }),
    crop: () => shellFrom('hair_crop', (p, g) => g !== GI.H ? -1 : noEars(hl(p), hl(p)[1] - capLine(hl(p)) - 0.014), hairCol, 0.0028, { mat: mats.hair }),
    curly: () => shellFrom('hair_curly', (p, g) => g !== GI.H ? -1 : noEars(hl(p), hl(p)[1] - capLine(hl(p)) + 0.004), hairCol,
      (p, m) => 0.006 + 0.0045 * (Math.sin(p[0] * 520) * Math.sin(p[1] * 480) * Math.sin(p[2] * 560) * 0.5 + 0.5) + Math.min(0.005, Math.max(0, m) * 0.2), { mat: mats.hair }),
    crest: () => shellFrom('hair_crest', (p, g) => { if (g !== GI.H) return -1; const lp = hl(p); return Math.min(0.02 - Math.abs(lp[0]), lp[1] - 0.105); }, hairCol,
      (p, m) => 0.004 + Math.max(0, m) * 1.25, { mat: mats.hair }),
    long: () => shellFrom('hair_long', (p, g) => {
      if (g === GI.H) { const lp = hl(p); let m = lp[1] - capLine(lp); if (lp[2] < -0.005 && lp[1] > -0.04) m = Math.max(m, Math.min(-lp[2] - 0.005, lp[1] + 0.04)); return noEars(lp, m); }
      if (g === GI.T && p[2] < -0.03 && p[1] > 1.36 && p[1] < 1.66) return Math.min(0.105 - Math.abs(p[0]) - (1.66 - p[1]) * 0.12, p[1] - 1.36 - Math.abs(p[0]) * 0.25);
      return -1; }, hairCol, (p, m) => 0.0055 + Math.min(0.007, Math.max(0, m) * 0.3), { mat: mats.hair }),
  };
  HAIR.braid = () => { const m = HAIR.cap(); const bits = [m];
    for (let i = 0; i < 6; i++) { const r = 0.017 - i * 0.0017; bits.push(rigid(new THREE.SphereGeometry(r, 10, 8), mats.hair, 'he', add(HO, mul([0, 0.10 - i * 0.034, -0.105 - i * 0.004], hs)))); }
    return bits; };
  const BEARD = {
    full: () => shellFrom('beard', (p, g) => { if (g !== GI.H) return -1; const lp = hl(p); let m = Math.min(0.076 - lp[1], lp[2] + 0.028, lp[1] + 0.034);
      if (lp[1] < 0.11 && Math.abs(lp[0]) > 0.05 && lp[2] > -0.025 && lp[2] < 0.045) m = Math.max(m, Math.min(0.11 - lp[1], 0.045 - lp[2]) * 0.5);
      return mouthCut(lp, m); }, hairCol, (p, m) => 0.0035 + Math.min(0.006, Math.max(0, m) * 0.18), { mat: mats.hair }),
    goatee: () => shellFrom('beard_goatee', (p, g) => { if (g !== GI.H) return -1; const lp = hl(p); return mouthCut(lp, Math.min(0.026 - Math.abs(lp[0]), 0.06 - lp[1], lp[2] - 0.035)); }, hairCol, 0.0045, { mat: mats.hair }),
    stache: () => shellFrom('beard_stache', (p, g) => { if (g !== GI.H) return -1; const lp = hl(p); return Math.min(0.03 - Math.abs(lp[0]) - Math.max(0, lp[1] - 0.06) * 0.6, 0.0085 - Math.abs(lp[1] - 0.0585), lp[2] - 0.07); }, hairCol, 0.0035, { mat: mats.hair }),
    stubble: () => shellFrom('beard_stubble', (p, g) => { if (g !== GI.H) return -1; const lp = hl(p); return mouthCut(lp, Math.min(0.072 - lp[1], lp[2] + 0.025, lp[1] + 0.03)); }, hairCol, 0.0012, { mat: mats.stubble }),
  };
  BEARD.forked = () => { const m = BEARD.full(); const bits = [m];
    for (const sx of [1, -1]) { const at = add(HO, mul([sx * 0.016, -0.012, 0.072], hs)); const c = rigid(new THREE.ConeGeometry(0.012, 0.05, 8), mats.hair, 'he', at); c.rotation.set(Math.PI, 0, sx * 0.25); bits.push(c); }
    return bits; };
  const strophium = () => shellFrom('strophium', (p, g) => g === GI.T ? Math.min(p[1] - 1.285, 1.43 - p[1], 0.175 - Math.abs(p[0])) : -1,
    (p) => lerp([1, 1, 1], [0.85, 0.85, 0.85], (Math.sin(p[0] * 160 + p[1] * 90) * 0.5 + 0.5) * 0.5), 0.0075, { mat: mats.strophium, hem: { w: 0.006, col: COL.hem, bw: 0, bcol: COL.hem } });
  const looks = {};   /* built look shells by key → [meshes] */
  const lookPart = (key, make) => { if (!looks[key]) looks[key] = [].concat(make()); return looks[key]; };
  const showAll = (L2, on) => { for (const m of L2) { m.visible = on; if (m.userData.ink) m.userData.ink.visible = on; } };

  /* ---------- rigid bits riding a bone ---------- */
  const rigid = (geo2, mat, boneKey, at, lookN) => {
    const m = new THREE.Mesh(geo2, mat); const b = rig.bones[boneKey]; const bp = P(boneKey);
    m.position.set(at[0] - bp[0], at[1] - bp[1], at[2] - bp[2]);
    if (lookN) m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...lookN).normalize());
    b.add(m); m.userData.ink = addOutline(m, false); return m;
  };
  const nAt = (p) => gradF(fd, ...p);
  if (RING) harnessBits.push(rigid(new THREE.TorusGeometry(0.020, 0.0055, 8, 24), mats.metal, 'ch', add(RING, [0, 0, 0.008]), [0, 0.1, 1]));
  if (BRING) harnessBits.push(rigid(new THREE.TorusGeometry(0.018, 0.005, 8, 20), mats.metal, 'ch', add(BRING, mul(nAt(BRING), 0.010)), nAt(BRING)));
  for (const s of straps) {   /* a square buckle part-way up each front strap */
    const i = s.findIndex(p => p[1] > 1.395); if (i < 1) continue; const hit = s[i], prev = s[i - 1];
    const bk = rigid(new THREE.TorusGeometry(0.017, 0.0035, 4, 4), mats.metal, 'ch', add(hit, mul(nAt(hit), 0.010)), nAt(hit));
    bk.rotateZ(Math.PI / 4 + Math.atan2(hit[1] - prev[1], hit[0] - prev[0])); harnessBits.push(bk);
  }
  const BF = front(0, beltY([0, 0, 0.1]) - 0.02);
  if (BF) rigid(new THREE.TorusGeometry(0.031, 0.0072, 10, 28), mats.iron, 'pe', add(BF, [0, 0, 0.021]), [0, -0.15, 1]);
    for (const sx of [1, -1]) for (const x of [0.05, 0.075, 0.10, 0.125]) {   /* belt studs */
    const ang = Math.asin(Math.min(0.95, x / 0.13)); const dir = [Math.sin(ang) * sx, 0, Math.cos(ang)];
    const hit = hitSkin(fd, [dir[0] * 0.35, beltY([0, 0, 0.1]) + 0.004, dir[2] * 0.35], [-dir[0], 0, -dir[2]]); if (!hit) continue;
    for (const dy of [-0.0085, 0.0085]) rigid(new THREE.SphereGeometry(0.0052, 8, 6), mats.stud, 'pe', add(add(hit, mul(nAt(hit), 0.0135)), [0, dy, 0]));
  }
  /* sandal soles */
  for (const sd of ['L', 'R']) {
    const sx = sd === 'L' ? 1 : -1, A0 = P('a' + sd);
    const sh = new THREE.Shape(); const pts = [];
    for (let i = 0; i < 28; i++) { const t = i / 28 * Math.PI * 2; const z = Math.cos(t), x = Math.sin(t);
      const half = z > 0 ? 0.047 + 0.006 * z : 0.038; const zz = z > 0 ? 0.072 + 0.135 * z : 0.072 + 0.150 * z;
      pts.push(new THREE.Vector2(x * half * (z > 0.6 ? 1 - (z - 0.6) * 0.5 : 1), zz)); }
    sh.setFromPoints(pts);
    const g2 = new THREE.ExtrudeGeometry(sh, { depth: SOLE_Y, bevelEnabled: false, curveSegments: 4 });
    g2.rotateX(Math.PI / 2); g2.translate(sx * 0.004, SOLE_Y, 0);   /* shape y → +z (relative to the ankle), extrusion → down to y 0 */
    const m = new THREE.Mesh(g2, mats.sole); const b = rig.bones['a' + sd];
    m.position.set(0, -A0[1], 0); b.add(m); addOutline(m, false);
  }

  const setOutline = (w) => { for (const m of outlines) m.material.userData.u.value = w; mats.out.userData.u.value = w; };
  setOutline(o.outline);

  /* ---------- the look: skin, hair, beard, cloth colour, the gladiatrix's strophium ---------- */
  const colA = geo.attributes.color, iris = L.iris, eyeW = L.eyeW;
  let lookNow = null;
  const setLook = (lk = {}) => {
    const skin = lin(hexRGB(lk.skin) || COL.skin), hair = lin(hexRGB(lk.hair) || COL.hair);
    const brow = mul(hair, 0.75), lip = [skin[0] * 0.95, skin[1] * 0.72, skin[2] * 0.7];
    const k = (lk.skin || '') + '|' + (lk.hair || '');
    if (!lookNow || lookNow.k !== k) {
      const A = colA.array;
      for (let i = 0; i < nv; i++) { const c = vk[i] === 0 ? skin : vk[i] === 1 ? iris : vk[i] === 2 ? eyeW : vk[i] === 3 ? brow : lip; A[i * 3] = c[0]; A[i * 3 + 1] = c[1]; A[i * 3 + 2] = c[2]; }
      colA.needsUpdate = true;
    }
    mats.hair.color.setRGB(...hair); mats.stubble.color.setRGB(...lerp(hair, skin, 0.55));
    loin.material.color.setRGB(...lin(hexRGB(lk.cloth) || COL.loin));
    const hs2 = lk.hs === 'bald' ? null : HAIR[lk.hs] ? lk.hs : 'cap', bs2 = BEARD[lk.bs] ? lk.bs : null;
    for (const key in looks) showAll(looks[key], false);
    if (hs2) showAll(lookPart('h:' + hs2, HAIR[hs2]), true);
    if (bs2) showAll(lookPart('b:' + bs2, BEARD[bs2]), true);
    if (lk.fem) { const st = lookPart('strophium', strophium); st[0].material.color.setRGB(...lin(hexRGB(lk.band) || [230, 220, 196])); showAll(st, true); }
    showAll(harnessBits, !lk.fem && !lk.noHarness);
    lookNow = { k, lk };
  };
  /* take a shell or rigid bit off again (gear changes) */
  const kill = (m) => {
    if (!m) return; const ink = m.userData.ink;
    for (const x of [m, ink]) { if (!x) continue; if (x.parent) x.parent.remove(x); const i = outlines.indexOf(x); if (i >= 0) outlines.splice(i, 1); const j = shellParts.indexOf(x); if (j >= 0) shellParts.splice(j, 1); }
    if (m.geometry) m.geometry.dispose(); if (m.userData.ownMat && m.material) m.material.dispose(); if (ink && ink.material) ink.material.dispose();
  };
  /* what gear.js builds with */
  /* look100: cut the forearm away below t (0 elbow … 1 wrist); the cut frame comes back for a stump cap */
  const triAll = sn.tri.slice();
  const sever = (sd, t = 0.3) => {
    const E0 = P('e' + sd), W0 = P('w' + sd), ab = sub(W0, E0), l2 = dot(ab, ab), gi = GI['A' + sd];
    const gone = (v) => grp[v] === gi && dot(sub([pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]], E0), ab) / l2 > t;
    const keep = []; for (let i = 0; i < triAll.length; i += 3) { const a = triAll[i], b = triAll[i + 1], c = triAll[i + 2]; if (gone(a) || gone(b) || gone(c)) continue; keep.push(a, b, c); }
    geo.setIndex(new THREE.Uint32BufferAttribute(keep, 1));
    let rmax = 0; const C0 = add(E0, mul(ab, t)), u = nrm(ab);
    for (let v = 0; v < nv; v++) { if (grp[v] !== gi) continue; const r = sub([pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]], C0); const along = dot(r, u); if (Math.abs(along) < 0.006) rmax = Math.max(rmax, Math.hypot(...sub(r, mul(u, along)))); }
    return { at: C0, n: u, r: rmax };
  };
  const kit = { sever, shellFrom, rigid, kill, nAt, P, GI, HO, hs, mats, lin, hexRGB, showAll,
    makeToon: (c, ex) => toonMat(c, mats, ex),
    maskedMat: (ex) => maskedToon(Object.assign({ vertexColors: true, gradientMap: mats.gm, side: THREE.DoubleSide }, ex || {}), 0.0024),
    hitSkin: (from, dir, maxd) => hitSkin(fd, from, dir, maxd), rig, group, setHarness: (on) => showAll(harnessBits, on) };
  setLook({ hs: o.hair === 'none' ? 'bald' : 'cap' });
  const t4 = performance.now();
  return { group, body, rig: Object.assign(rig, { skeleton, space: group }), setOutline, shells: shellParts, mats, setLook, kit,
    stats: { verts: nv, tris: sn.tri.length / 3, grid: [fd.nx, fd.ny, fd.nz], ms: { field: t1 - t0, mesh: t2 - t1, weights: t3 - t2, rest: t4 - t3, total: t4 - t0 } } };
}

/* ================= materials ================= */
function ramp() {
  const d = new Uint8Array([105, 105, 175, 175, 255, 255]);   /* shade · mid · light */
  const t = new THREE.DataTexture(d, d.length, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
}
function maskedToon(params, ink, hem) {
  const m = new THREE.MeshToonMaterial(params);
  m.userData.ink = { value: ink }; m.userData.hem = hem || null;
  m.onBeforeCompile = (sh) => {
    const H = m.userData.hem || { w: 0, col: [0, 0, 0], bw: 0, bcol: [0, 0, 0] };
    sh.uniforms.uInk = m.userData.ink; sh.uniforms.uInkCol = { value: new THREE.Color(0x16100e) };
    sh.uniforms.uHemW = { value: H.w }; sh.uniforms.uHemCol = { value: new THREE.Color().setRGB(...lin(H.col)) };
    sh.uniforms.uBandW = { value: H.bw }; sh.uniforms.uBandCol = { value: new THREE.Color().setRGB(...lin(H.bcol)) };
    sh.vertexShader = 'attribute float mask;\nattribute float band;\nvarying float vMask;\nvarying float vBand;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvMask = mask; vBand = band;');
    sh.fragmentShader = 'varying float vMask;\nvarying float vBand;\nuniform float uInk, uHemW, uBandW;\nuniform vec3 uInkCol, uHemCol, uBandCol;\n' +
      sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
if (vMask < 0.0) discard;
if (vMask < uHemW) diffuseColor.rgb = uHemCol;
if (abs(vBand) < uBandW) diffuseColor.rgb = uBandCol;
if (vMask < uInk || abs(vBand) < uBandW * 0.3) diffuseColor.rgb = uInkCol;`);
  };
  m.customProgramCacheKey = () => 'masked' + JSON.stringify(m.userData.hem || 0);
  return m;
}
/* a copy of a masked material with a hem (edge colour) and a painted seam (band) */
function hemMat(base, hem) { const m = maskedToon({ vertexColors: true, gradientMap: base.gradientMap, side: base.side }, base.userData.ink.value, hem); return m; }
function inkedSkin(params) {
  const m = new THREE.MeshToonMaterial(params);
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uInkCol = { value: new THREE.Color(0x1c1410) };
    sh.vertexShader = 'attribute float cav;\nvarying float vCav;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvCav = cav;');
    sh.fragmentShader = 'varying float vCav;\nuniform vec3 uInkCol;\n' + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.74, smoothstep(0.16, 0.28, vCav));
diffuseColor.rgb = mix(diffuseColor.rgb, uInkCol, smoothstep(0.50, 0.58, vCav) * 0.92);`);
  };
  m.customProgramCacheKey = () => 'inkedSkin';
  return m;
}
/* a plain toon material in an sRGB colour (gear) */
function toonMat(c, mats, extra = {}) { const k = new THREE.Color(c); return new THREE.MeshToonMaterial(Object.assign({ color: k, gradientMap: mats.gm }, extra)); }
function makeMaterials(o) {
  const gm = ramp();
  const toon = (c, extra = {}) => new THREE.MeshToonMaterial(Object.assign({ color: new THREE.Color().setRGB(...lin(c)), gradientMap: gm }, extra));
  const mats = {
    skin: inkedSkin({ vertexColors: true, gradientMap: gm }),
    cloth: maskedToon({ vertexColors: true, gradientMap: gm, side: THREE.DoubleSide }, 0.0026),
    leather: maskedToon({ vertexColors: true, gradientMap: gm, side: THREE.DoubleSide }, 0.0022),
    hair: maskedToon({ vertexColors: true, gradientMap: gm, side: THREE.DoubleSide }, 0.0),
    metal: toon(COL.metal), bronze: toon(COL.bronze), sole: toon(COL.sole), iron: toon(COL.metalDark), stud: toon(COL.stud),
  };
  mats.stubble = maskedToon({ vertexColors: true, gradientMap: gm, side: THREE.DoubleSide, transparent: true, opacity: 0.55 }, 0.0);
  mats.strophium = maskedToon({ vertexColors: true, gradientMap: gm, side: THREE.DoubleSide }, 0.0024);
  mats.gm = gm;
  mats.out = new THREE.MeshBasicMaterial({ color: 0x120c0a });
  mats.out.userData.u = { value: o.outline };
  return mats;
}
/* inverted hull outline: back faces pushed out along the (skinned) normal */
function outlineMesh(src, mats, masked) {
  const u = { value: 0.012 };
  const m = new THREE.MeshBasicMaterial({ color: 0x120c0a, side: THREE.BackSide });
  m.userData.u = u;
  const skinned = !!src.isSkinnedMesh;
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uOut = u;
    let vs = 'uniform float uOut;\n' + (masked ? 'attribute float mask;\nvarying float vMask;\n' : '') + sh.vertexShader;
    if (skinned) vs = vs.replace('#include <skinning_vertex>', '#include <skinning_vertex>\ntransformed += normalize(objectNormal) * uOut;' + (masked ? '\nvMask = mask;' : ''));
    else vs = vs.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normalize(normal) * uOut / max(1e-6, length(modelMatrix[0].xyz));');
    sh.vertexShader = vs;
    if (masked) sh.fragmentShader = 'varying float vMask;\n' + sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\nif (vMask < 0.0) discard;');
  };
  m.customProgramCacheKey = () => 'outline' + (skinned ? 's' : 'r') + (masked ? 'm' : '');
  let om;
  if (skinned) { om = new THREE.SkinnedMesh(src.geometry, m); om.bind(src.skeleton, src.bindMatrix); }
  else om = new THREE.Mesh(src.geometry, m);
  om.frustumCulled = false; om.name = src.name + '_ink';
  if (!skinned) { om.position.copy(src.position); om.quaternion.copy(src.quaternion); om.scale.copy(src.scale); om.matrixAutoUpdate = true;
    om.onBeforeRender = () => { om.position.copy(src.position); om.quaternion.copy(src.quaternion); om.scale.copy(src.scale); }; }
  return om;
}
