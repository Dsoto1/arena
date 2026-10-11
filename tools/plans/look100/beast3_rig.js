/* =====================================================================
   look100/beast3_rig.js — v1.0 LOOK TEST ROUND 3 (not game code; copied from beast2_rig.js). Round 3 changes (his round-2 answers):
   lion mane = bigger, lighter locks FRAMING THE FACE (two face rings + fewer neck rings); snake = much slimmer (r 0.95 mm, was 2.1) in a
   loose S-coil with a small head; Zora = smaller (x0.72) and PERCHED on a rock like his mini (wings spread low); Leo's sheet SPLIT into
   idle+walk and actions, each cropped on its own (sheet(): o.split).
   Round 1/2 notes: the BEASTS as sculpted 3D tokens with animation frames.: the BEASTS as sculpted 3D tokens with animation frames.
   Every frame is ONE signed-distance sculpt (smooth unions of capsules + oriented ellipsoids, mm of the real mini) built from a pose:
     quad()   — quadrupeds (lion, lioness, bear, wolf, boar, crocodile): body ellipsoids on a pitched/rolled root, 2-bone IK legs
                (front elbow back, hind stifle forward + a hock segment), neck/head frame with jaw, ears, mane, a tail chain;
     snake()  — a spline chain of tapered capsules (coils, slither wave, raised strike), banded;
     eagle()  — Zora: body, hooked beak, wings of feather plates (fold → spread → flap), tail fan, talons;
     spider() — 8 legs, tetrapod gait.
   The field is meshed with surface nets (copied from body100.js), then BAKED like the r6 sculpts: SDF ambient occlusion, cavity
   darkening, a dry-brushed highlight on convex edges, fur/mane/scale/band patterns into vertex colours; drawn with a 4-step toon
   ramp + an ink hull, sun upper left, on his oval/round bases. 8 MINI_YAW facings per frame, rows = frames, like minis8/crew96.
   Tholo + Commodus (humanoids) are rendered by anim_rig.js (the rig92 gladiator body) — see beast_make.js.
   ===================================================================== */
import * as THREE from 'three';
const MINI_YAW = [0, 45, 90, 135, 180, -135, -90, -45], D2R = Math.PI / 180, PXMM = 3.143;
/* ---------- vectors ---------- */
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], len = (a) => Math.hypot(a[0], a[1], a[2]), nrm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const cl = (v, a, b) => Math.max(a, Math.min(b, v));
const smin = (a, b, k) => { if (k <= 0) return Math.min(a, b); const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
/* rotation matrices as [col0, col1, col2] (local axes in world) */
const Rx = (a) => [[1, 0, 0], [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]];
const Ry = (a) => [[Math.cos(a), 0, -Math.sin(a)], [0, 1, 0], [Math.sin(a), 0, Math.cos(a)]];
const Rz = (a) => [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]];
const mv = (M, p) => add(add(mul(M[0], p[0]), mul(M[1], p[1])), mul(M[2], p[2]));
const mm = (A, B) => [mv(A, B[0]), mv(A, B[1]), mv(A, B[2])];
const frame = (d, upHint = [0, 1, 0]) => { d = nrm(d); let u = sub(upHint, mul(d, dot(upHint, d))); if (len(u) < 1e-4) u = [0, 0, 1]; u = nrm(u); const s = cross(u, d); return [s, u, d]; };   /* x=side(left), y=up, z=fwd */

/* ---------- primitives (mm) ---------- */
function cap(a, b, r0, r1, k, m, o = {}) { const R = Math.max(r0, r1);
  return Object.assign({ m, k, box: [[Math.min(a[0], b[0]) - R, Math.min(a[1], b[1]) - R, Math.min(a[2], b[2]) - R], [Math.max(a[0], b[0]) + R, Math.max(a[1], b[1]) + R, Math.max(a[2], b[2]) + R]],
    f: (x, y, z) => { const ab = sub(b, a), ap = [x - a[0], y - a[1], z - a[2]]; const t = cl(dot(ap, ab) / (dot(ab, ab) || 1e-9), 0, 1); return Math.hypot(ap[0] - ab[0] * t, ap[1] - ab[1] * t, ap[2] - ab[2] * t) - (r0 + (r1 - r0) * t); } }, o); }
function ell(c, r, M, k, m, o = {}) { M = M || [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; const R = Math.max(...r);
  return Object.assign({ m, k, box: [[c[0] - R, c[1] - R, c[2] - R], [c[0] + R, c[1] + R, c[2] + R]],
    f: (x, y, z) => { const p = [x - c[0], y - c[1], z - c[2]]; const q = [dot(p, M[0]) / r[0], dot(p, M[1]) / r[1], dot(p, M[2]) / r[2]]; const k0 = Math.hypot(...q), k1 = Math.hypot(q[0] / r[0], q[1] / r[1], q[2] / r[2]); return k1 < 1e-9 ? -Math.min(...r) : k0 * (k0 - 1) / k1; } }, o); }
const sph = (c, r, k, m, o) => ell(c, [r, r, r], null, k, m, o);

/* ---------- field → surface nets → bake ---------- */
function field(prims, h) {
  let lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (const p of prims) for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], p.box[0][i] - p.k); hi[i] = Math.max(hi[i], p.box[1][i] + p.k); }
  lo = lo.map(v => v - 2 * h); hi = hi.map(v => v + 2 * h);
  const nx = Math.ceil((hi[0] - lo[0]) / h) + 1, ny = Math.ceil((hi[1] - lo[1]) / h) + 1, nz = Math.ceil((hi[2] - lo[2]) / h) + 1;
  const F = new Float32Array(nx * ny * nz).fill(1e3), Md = new Float32Array(nx * ny * nz).fill(1e9), Mi = new Int16Array(nx * ny * nz).fill(-1);
  prims.forEach((p, pi) => { const e = p.k + 2 * h;
    const i0 = Math.max(0, Math.floor((p.box[0][0] - e - lo[0]) / h)), i1 = Math.min(nx - 1, Math.ceil((p.box[1][0] + e - lo[0]) / h));
    const j0 = Math.max(0, Math.floor((p.box[0][1] - e - lo[1]) / h)), j1 = Math.min(ny - 1, Math.ceil((p.box[1][1] + e - lo[1]) / h));
    const k0 = Math.max(0, Math.floor((p.box[0][2] - e - lo[2]) / h)), k1 = Math.min(nz - 1, Math.ceil((p.box[1][2] + e - lo[2]) / h));
    for (let kz = k0; kz <= k1; kz++) { const z = lo[2] + kz * h; for (let jy = j0; jy <= j1; jy++) { const y = lo[1] + jy * h; let idx = nx * (jy + ny * kz) + i0;
      for (let ix = i0; ix <= i1; ix++, idx++) { const x = lo[0] + ix * h; const d = p.f(x, y, z); F[idx] = smin(F[idx], d, p.k); if (d < Md[idx]) { Md[idx] = d; Mi[idx] = pi; } } } } });
  return { F, Md, Mi, nx, ny, nz, lo, h };
}
function sampleF(fd, x, y, z) { const { F, nx, ny, nz, lo, h } = fd; let fx = (x - lo[0]) / h, fy = (y - lo[1]) / h, fz = (z - lo[2]) / h; let i = Math.floor(fx), j = Math.floor(fy), k = Math.floor(fz);
  if (i < 0 || j < 0 || k < 0 || i >= nx - 1 || j >= ny - 1 || k >= nz - 1) return 1e3; fx -= i; fy -= j; fz -= k; const o = i + nx * (j + ny * k), sy = nx, sz = nx * ny;
  const c00 = F[o] * (1 - fx) + F[o + 1] * fx, c10 = F[o + sy] * (1 - fx) + F[o + sy + 1] * fx, c01 = F[o + sz] * (1 - fx) + F[o + sz + 1] * fx, c11 = F[o + sz + sy] * (1 - fx) + F[o + sz + sy + 1] * fx;
  return (c00 * (1 - fy) + c10 * fy) * (1 - fz) + (c01 * (1 - fy) + c11 * fy) * fz; }
function gradF(fd, x, y, z) { const e = fd.h * 0.75; return nrm([sampleF(fd, x + e, y, z) - sampleF(fd, x - e, y, z), sampleF(fd, x, y + e, z) - sampleF(fd, x, y - e, z), sampleF(fd, x, y, z + e) - sampleF(fd, x, y, z - e)]); }
function nets(fd) {   /* body100.js surfaceNets, unchanged in spirit */
  const { F, nx, ny, nz, lo, h } = fd; const sy = nx, sz = nx * ny; const vid = new Map(), pos = [];
  const corner = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]], coff = corner.map(c => c[0] + sy * c[1] + sz * c[2]);
  const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]]; const v = new Float32Array(8);
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) { let o = nx * (j + ny * k); for (let i = 0; i < nx - 1; i++, o++) {
    let m = 0; for (let c = 0; c < 8; c++) { v[c] = F[o + coff[c]]; if (v[c] < 0) m |= 1 << c; } if (m === 0 || m === 255) continue;
    let px = 0, py = 0, pz = 0, n = 0; for (const [a, b] of edges) { if (((m >> a) & 1) === ((m >> b) & 1)) continue; const t = v[a] / (v[a] - v[b]); const A = corner[a], B = corner[b]; px += A[0] + (B[0] - A[0]) * t; py += A[1] + (B[1] - A[1]) * t; pz += A[2] + (B[2] - A[2]) * t; n++; }
    vid.set(o, pos.length / 3); pos.push(lo[0] + (i + px / n) * h, lo[1] + (j + py / n) * h, lo[2] + (k + pz / n) * h); } }
  const tri = []; const push = (c, inside) => { const a = vid.get(c[0]), b = vid.get(c[1]), d = vid.get(c[2]), e = vid.get(c[3]); if (a === undefined || b === undefined || d === undefined || e === undefined) return; if (inside) tri.push(a, b, d, a, d, e); else tri.push(a, d, b, a, e, d); };
  for (const [o] of vid) { const i = o % nx, j = Math.floor(o / nx) % ny, k = Math.floor(o / sz); const g0 = F[o] < 0;
    if (j > 0 && k > 0 && g0 !== (F[o + 1] < 0)) push([o, o - sy, o - sy - sz, o - sz], g0);
    if (i > 0 && k > 0 && g0 !== (F[o + sy] < 0)) push([o, o - sz, o - sz - 1, o - 1], g0);
    if (i > 0 && j > 0 && g0 !== (F[o + sz] < 0)) push([o, o - 1, o - 1 - sy, o - sy], g0); }
  return { pos, tri };
}
const hexL = (h) => { const c = new THREE.Color(h); return [c.r, c.g, c.b]; };   /* sRGB 0..1 (vertex colours are written sRGB→linear below) */
const hsh = (x, y, z) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
function vnoise(x, y, z) { const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi; const s = (t) => t * t * (3 - 2 * t); const u = s(xf), v = s(yf), w = s(zf);
  const L = (a, b, t) => a + (b - a) * t; const c = (i, j, k) => hsh(xi + i, yi + j, zi + k);
  return L(L(L(c(0, 0, 0), c(1, 0, 0), u), L(c(0, 1, 0), c(1, 1, 0), u), v), L(L(c(0, 0, 1), c(1, 0, 1), u), L(c(0, 1, 1), c(1, 1, 1), u), v), w); }
/* the painted materials: base, under (belly/underside), pattern */
function paint(p, n, P) {
  let c = hexL(P.m.c); const pat = P.m.p;
  if (P.m.u && n[1] < -0.15) c = lerp(c, hexL(P.m.u), cl((-n[1] - 0.15) * 1.6, 0, 1));
  if (pat === 'fur') { const s = 0.86 + 0.26 * vnoise(p[0] * 0.9, p[1] * 2.2, p[2] * 0.9); c = mul(c, s); }
  else if (pat === 'mane') { const s = 0.78 + 0.42 * vnoise(p[0] * 1.6, p[1] * 0.9, p[2] * 1.6); c = mul(c, s); }
  else if (pat === 'band') { const t = (P.t || 0) * (P.m.nb || 22); const b = Math.abs(Math.sin(t * Math.PI)); if (b > 0.78) c = lerp(c, hexL(P.m.b || '#2a2014'), 0.75); if (n[1] < -0.2) c = lerp(c, hexL(P.m.u || '#e8d8a0'), 0.6); }
  else if (pat === 'diam') { const t = (P.t || 0) * 30; const a = Math.abs(((t + Math.atan2(n[0], n[1]) * 0.6) % 1 + 1) % 1 - 0.5); if (a < 0.14 && n[1] > -0.1) c = lerp(c, hexL(P.m.b), 0.7); if (n[1] < -0.2) c = lerp(c, hexL(P.m.u || '#e8d8a0'), 0.6); }
  else if (pat === 'scale') { const g = Math.abs(Math.sin(p[0] * 1.9)) * Math.abs(Math.sin(p[2] * 1.6)); c = mul(c, 0.78 + 0.3 * g); }
  else if (pat === 'feath') { const s = 0.8 + 0.3 * vnoise(p[0] * 1.6, p[1] * 1.6, p[2] * 3); c = mul(c, s); }
  return c;
}
function meshOf(prims, h) {
  const fd = field(prims, h); const sn = nets(fd); const nv = sn.pos.length / 3;
  const pos = new Float32Array(sn.pos), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3);
  for (let i = 0; i < nv; i++) { const p = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]]; const n = gradF(fd, ...p); nor.set(n, i * 3);
    /* the prim that owns this point (nearest by its own distance in the 3×3×3 around the cell) */
    const ci = Math.round((p[0] - fd.lo[0]) / h), cj = Math.round((p[1] - fd.lo[1]) / h), ck = Math.round((p[2] - fd.lo[2]) / h); let best = -1, bd = 1e9;
    for (let dk = -1; dk <= 1; dk++) for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const ii = ci + di, jj = cj + dj, kk = ck + dk; if (ii < 0 || jj < 0 || kk < 0 || ii >= fd.nx || jj >= fd.ny || kk >= fd.nz) continue; const o = ii + fd.nx * (jj + fd.ny * kk); if (fd.Mi[o] >= 0 && fd.Md[o] < bd) { bd = fd.Md[o]; best = fd.Mi[o]; } }
    const P = prims[Math.max(0, best)];
    let c = paint(p, n, P);
    /* AO along the normal + curvature: cavities darker, convex edges dry-brushed lighter (his minis' highlight bands) */
    const st = h * 1.6; let occ = 0; for (let s = 1; s <= 4; s++) { const d = s * st; occ += (d - Math.max(0, sampleF(fd, p[0] + n[0] * d, p[1] + n[1] * d, p[2] + n[2] * d))) / (1 << s); }
    const ao = cl(1 - occ / st * 0.85, 0, 1);
    const e = h * 1.3; let lap = 0; for (const [dx, dy, dz] of [[e, 0, 0], [-e, 0, 0], [0, e, 0], [0, -e, 0], [0, 0, e], [0, 0, -e]]) lap += sampleF(fd, p[0] + dx, p[1] + dy, p[2] + dz); lap = lap / 6 - sampleF(fd, ...p);
    const wear = cl(lap / e * 1.6 - 0.12, 0, 1), cav = cl(-lap / e * 2.2 - 0.05, 0, 1);
    const up = cl(n[1] * 0.5 + 0.5, 0, 1);   /* a painted top light: upper surfaces a touch warmer/lighter (zenithal highlight) */
    const a2 = Math.pow(ao, 1.25) * (1 - cav * 0.55);
    for (let k = 0; k < 3; k++) { let v = c[k] * (0.66 + 0.34 * a2) * (0.92 + 0.16 * up); v = v + (Math.min(1, c[k] * 1.45 + 0.1) - v) * wear * (P.m.dry != null ? P.m.dry : 0.6); col[i * 3 + k] = Math.pow(cl(v, 0, 1), 2.2); } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setIndex(nv > 65535 ? new THREE.Uint32BufferAttribute(sn.tri, 1) : new THREE.Uint16BufferAttribute(sn.tri, 1));
  return { geo, verts: nv, tris: sn.tri.length / 3, cells: fd.nx * fd.ny * fd.nz };
}

/* ======================= QUADRUPEDS ======================= */
/* 2-bone IK: A → knee → T, bend toward pole */
function ik2(A, T, L1, L2, pole) { let d = sub(T, A); let D = len(d); const mx = (L1 + L2) * 0.999; if (D > mx) { d = mul(nrm(d), mx); D = mx; T = add(A, d); } D = Math.max(D, Math.abs(L1 - L2) + 0.01);
  const u = nrm(d); let v = sub(pole, mul(u, dot(pole, u))); v = len(v) < 1e-5 ? [0, 1, 0] : nrm(v); const ca = cl((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D), -1, 1); const sa = Math.sqrt(1 - ca * ca);
  return [add(A, add(mul(u, L1 * ca), mul(v, L1 * sa))), T]; }
/* ---- round 2: the skeleton every build emits (his colour language: head red · shoulder/chest orange · spine yellow ·
   elbow/knee/wing green · paw/foot/wing tip blue · tail purple) ---- */
export let JL = [];
const J = (n, p, cat, par) => { JL.push({ n, p: p.slice(), cat, par }); return n; };
export const JCOL = { head: '#e8463c', chest: '#f08c2e', spine: '#f2d23c', limb: '#58c85a', foot: '#3c86e8', tail: '#9a52e0' };
/* fur clumps: small elongated ellipsoids over a patch, pointing along dir (+ noise) — the shaggy silhouette of his sculpts */
function clumps(P, n, at, spread, dir, size, m, k = 0.35, seed = 1) {
  for (let i = 0; i < n; i++) { const r1 = hsh(i, seed, 1) - 0.5, r2 = hsh(i, seed, 2) - 0.5, r3 = hsh(i, seed, 3) - 0.5;
    const c = add(at, [r1 * spread[0], r2 * spread[1], r3 * spread[2]]); const d = nrm(add(dir, [r2 * 0.6, r3 * 0.5, r1 * 0.6])); const F = frame(d, Math.abs(d[1]) > 0.9 ? [0, 0, 1] : [0, 1, 0]);
    P.push(ell(add(c, mul(d, size[2] * 0.4)), [size[0] * (0.8 + 0.4 * hsh(i, seed, 4)), size[1], size[2] * (0.8 + 0.5 * hsh(i, seed, 5))], F, k, m)); } }
export const SPECIES = {
  /* digitigrade cats: wrist + hock high, toes on the ground */
  lion: { base: [72, 42], h: 0.5, L: 10.5, y: 15.2, chest: [5.6, 7.0, 7.6], belly: [4.6, 5.0, 7.4], hips: [5.0, 5.8, 6.0], fx: 3.5, hx: 3.3, legF: [8.4, 8.0, 2.8], legH: [9.2, 8.4, 5.2], rF: [2.6, 1.7, 1.4], rH: [2.9, 1.6, 1.3], paw: [2.0, 1.2, 2.4],
    neck: [6.2, 2.7], head: [3.8, 3.9, 4.2], muz: [3.9, 2.1], ears: 'round', mane: 1, tail: [21, 0.9, 0.5], tuft: 1.8, cat: 1,
    col: { fur: '#c8a46c', u: '#e0c898', mane: '#c49656', maneL: '#e0bc80', muz: '#dcc090', nose: '#3a2418', dark: '#1a120c', tuft: '#3e2610', claw: '#e8dcc0' } },
  lioness: { base: [72, 42], h: 0.5, L: 10.0, y: 14.2, chest: [5.4, 6.6, 7.6], belly: [4.6, 5.0, 7.2], hips: [4.8, 5.8, 6.0], fx: 3.1, hx: 3.0, legF: [8.0, 7.6, 2.6], legH: [8.8, 8.0, 5.0], rF: [2.2, 1.5, 1.25], rH: [2.5, 1.45, 1.2], paw: [1.8, 1.1, 2.2],
    neck: [6.2, 2.5], head: [3.0, 3.1, 3.7], muz: [3.7, 1.8], ears: 'round', tail: [20, 0.8, 0.45], tuft: 1.3, cat: 1,
    col: { fur: '#ccac78', u: '#e2cca0', muz: '#e0c89c', nose: '#3a2418', dark: '#1a120c', tuft: '#3e2610', claw: '#e8dcc0' } },
  /* plantigrade bear: heel + palm flat, long paws, a shoulder hump, shaggy */
  bear: { base: [75, 47], h: 0.55, L: 10.5, y: 16.0, chest: [8.0, 9.0, 8.6], belly: [7.6, 8.2, 8.6], hips: [7.6, 8.6, 7.6], fx: 4.4, hx: 4.2, legF: [8.2, 7.6, 1.6], legH: [8.4, 7.8, 1.8], rF: [3.5, 2.8, 2.4], rH: [3.7, 2.6, 2.3], paw: [2.8, 1.4, 4.0], plant: 1,
    neck: [5.0, 4.2], head: [4.4, 4.4, 4.6], muz: [4.2, 2.4], ears: 'bear', tail: [3.5, 1.5, 1.0], hump: 1, shag: 1,
    col: { fur: '#a88a66', u: '#8c7052', muz: '#c8b088', nose: '#141010', dark: '#120c08', claw: '#e8dcc0' } },
  wolf: { base: [25.4, 25.4], h: 0.36, L: 6.0, y: 9.6, chest: [3.2, 4.3, 4.6], belly: [2.6, 3.0, 4.4], hips: [2.9, 3.5, 3.6], fx: 1.9, hx: 1.85, legF: [5.2, 5.0, 2.0], legH: [5.8, 5.4, 3.4], rF: [1.35, 0.9, 0.75], rH: [1.65, 0.85, 0.72], paw: [1.05, 0.7, 1.45],
    neck: [4.0, 1.9], head: [2.3, 2.3, 2.5], muz: [3.3, 1.15], ears: 'pointy', tail: [11, 1.2, 0.6], brush: 1, ruff: 1,
    col: { fur: '#ae9070', u: '#dccaa8', muz: '#d4c0a0', nose: '#141210', dark: '#141210', claw: '#d8d0c0' } },
  boar: { base: [25.4, 25.4], h: 0.36, L: 5.6, y: 8.2, chest: [4.4, 5.2, 5.2], belly: [4.2, 4.6, 5], hips: [4.0, 4.6, 4.2], fx: 2.3, hx: 2.2, legF: [4.0, 3.6, 1.4], legH: [4.4, 3.6, 2.2], rF: [1.6, 1.0, 0.8], rH: [1.9, 1.0, 0.8], paw: [0.9, 0.9, 1.1],
    neck: [2.6, 3.4], head: [3.0, 3.2, 3.6], muz: [3.6, 2.0], ears: 'pointy', tail: [4, 0.5, 0.35], tusks: 1, ridge: 1, shag: 0.5,
    col: { fur: '#7e6452', u: '#665040', muz: '#a8907e', nose: '#5a3a30', dark: '#120c08', claw: '#2a2018', tusk: '#efe6cc' } },
  croc: { base: [75, 34], h: 0.45, L: 9.5, y: 3.4, chest: [5.0, 2.6, 6.0], belly: [5.2, 2.6, 6.5], hips: [4.6, 2.5, 5.0], fx: 5.0, hx: 4.6, legF: [3.6, 3.2, 1.0], legH: [4.2, 3.6, 1.2], rF: [1.3, 1.0, 0.8], rH: [1.6, 1.1, 0.9], paw: [1.4, 0.5, 1.8], sprawl: 1, plant: 1,
    neck: [2.4, 2.8], head: [2.8, 1.8, 3.4], muz: [10, 1.6], ears: null, tail: [26, 2.6, 0.3], scutes: 1, croc: 1,
    col: { fur: '#7a8456', u: '#d2c896', muz: '#7a8456', nose: '#2a3018', dark: '#141a0c', claw: '#d8d0b0', tooth: '#efe8d0' } },
};
/* variants = a recolour (sampled from his minis8: the lit 85th-percentile colour of the figure) */
export const VARIANTS = {
  leo: ['lion'], leaena: ['lioness'], ursa: ['bear'], brutum: ['bear', { fur: '#96785a', u: '#7c6248', muz: '#bca27c' }],
  valencia: ['wolf'], moechus: ['wolf', { fur: '#5c5856', u: '#8e8a86', muz: '#86827e' }],
  boar: ['boar'], croc: ['croc'],
};
function quad(S, f, COL) {
  JL = []; const P = [], C = COL;
  const M = (c, p, extra) => Object.assign({ c, p }, extra || {});
  const FUR = M(C.fur, S.croc ? 'scale' : 'fur', { u: C.u, dry: S.croc ? 0.45 : 0.6 }), DARK = M(C.dark, null, { dry: 0.3 }), NOSE = M(C.nose, null, { dry: 0.8 }), CLAW = M(C.claw, null, { dry: 0.4 });
  const SHAG = M(C.fur, 'mane', { u: C.u, dry: 0.95 });
  const pitch = (f.pitch || 0) * D2R, roll = (f.roll || 0) * D2R, yawB = (f.yaw || 0) * D2R;
  const R = mm(Ry(yawB), mm(Rz(roll), Rx(-pitch)));
  const root = [f.x || 0, (f.y != null ? f.y : S.y) + (f.dy || 0), f.z || 0];
  const T = (p) => add(mv(R, p), root);
  const br = 1 + (f.breath || 0) * 0.035, arch = f.arch || 0, L = S.L;
  /* spine (yellow): pelvis → mid → withers; chest (orange) */
  const PEL = T([0, 0.6, -L * 0.7]), MID = T([0, 1.2 + arch, 0]), WIT = T([0, S.chest[1] * 0.55 + (S.hump ? 1.2 : 0), L * 0.55]);
  J('pelvis', PEL, 'spine'); J('mid', MID, 'spine', 'pelvis'); J('withers', WIT, 'spine', 'mid');
  /* body masses */
  P.push(ell(T([0, (S.hump ? 1.2 : 0.4), L * 0.62]), mul(S.chest, br), R, L * 0.35, FUR));
  P.push(ell(T([0, arch - 0.6, 0]), [S.belly[0] * br, S.belly[1] * br, S.belly[2]], R, L * 0.4, FUR));
  P.push(ell(T([0, 0.2, -L * 0.62]), S.hips, R, L * 0.35, FUR));
  if (S.hump) P.push(ell(T([0, S.chest[1] * 0.78, L * 0.48]), [S.chest[0] * 0.62, S.chest[1] * 0.45, S.chest[2] * 0.55], R, 2.5, FUR));
  if (S.ridge) P.push(cap(T([0, S.chest[1] * 0.95, L * 0.75]), T([0, S.hips[1] * 0.8, -L * 0.4]), 1.0, 0.5, 1.4, M(C.dark, 'mane')));
  if (S.scutes) for (let i = -3; i <= 3; i++) for (const sx of [-1, 1]) P.push(sph(T([sx * 1.3, S.chest[1] * 0.92, i * L * 0.28]), 0.6, 0.3, FUR));
  /* shaggy coat: clumps along the back and flanks, flowing back and down */
  if (S.shag) { const n = Math.round(130 * S.shag); clumps(P, n, T([0, S.chest[1] * 0.55, L * 0.1]), [S.chest[0] * 1.7, S.chest[1] * 0.95, L * 2.1], mv(R, [0, -0.5, -1]), [S.chest[0] * 0.13, S.chest[0] * 0.08, S.chest[0] * 0.34], SHAG, 0.2, 3);
    clumps(P, Math.round(n / 2), T([0, -S.belly[1] * 0.5, 0]), [S.belly[0] * 1.7, 1.6, L * 1.8], mv(R, [0, -1, -0.3]), [S.chest[0] * 0.12, S.chest[0] * 0.08, S.chest[0] * 0.3], SHAG, 0.2, 7); }
  /* head + neck */
  const hp = (f.head ? f.head[0] : 0) * D2R, hy = (f.head ? f.head[1] : 0) * D2R;
  const NB = T([0, S.chest[1] * 0.35, L * 0.62 + S.chest[2] * 0.55]);
  const neckPitch = (S.croc ? 5 : S.y > 15 ? 18 : 32) * D2R;
  const nd = mv(R, [Math.sin(hy) * Math.cos(neckPitch + hp * 0.5), Math.sin(neckPitch + hp * 0.5), Math.cos(hy) * Math.cos(neckPitch + hp * 0.5)]);
  const NE = add(NB, mul(nrm(nd), S.neck[0]));
  P.push(cap(NB, NE, S.neck[1] * 1.15, S.neck[1], S.neck[1] * 0.9, FUR));
  J('neck', NB, 'chest', 'withers');
  const hdPitch = hp - (S.croc ? 0.05 : 0.35) + (pitch * 0.4);
  const hd = nrm([Math.sin(hy) * Math.cos(hdPitch), Math.sin(hdPitch), Math.cos(hy) * Math.cos(hdPitch)]); const HF = frame(mv(Ry(yawB), hd), mv(mm(Ry(yawB), Rz(roll)), [0, 1, 0]));
  const HC = add(NE, mul(HF[2], S.head[2] * 0.25));
  const H = (p) => add(HC, add(add(mul(HF[0], p[0]), mul(HF[1], p[1])), mul(HF[2], p[2])));
  J('head', HC, 'head', 'neck');
  P.push(ell(HC, S.head, HF, 1.2, FUR));
  /* the face: brow ridge, cheeks, a broad muzzle with whisker pads (cats), chin */
  P.push(ell(H([0, S.head[1] * 0.42, S.head[2] * 0.42]), [S.head[0] * 0.75, S.head[1] * 0.25, S.head[2] * 0.3], HF, 0.6, FUR));
  for (const sx of [-1, 1]) P.push(ell(H([sx * S.head[0] * 0.55, -S.head[1] * 0.2, S.head[2] * 0.3]), [S.head[0] * 0.4, S.head[1] * 0.38, S.head[2] * 0.42], HF, 0.7, FUR));
  const jaw = (f.jaw || 0) * D2R; const MUZ = C.muz ? M(C.muz, 'fur', { u: C.u }) : FUR;
  const mz0 = H([0, -S.head[1] * 0.15, S.head[2] * 0.4]), mz1 = H([0, -S.head[1] * 0.25, S.head[2] * 0.4 + S.muz[0]]);
  P.push(cap(mz0, mz1, S.muz[1] * 1.1, S.muz[1] * (S.croc ? 0.75 : 0.85), 0.9, MUZ));
  if (S.cat) for (const sx of [-1, 1]) P.push(sph(add(lerp(mz0, mz1, 0.82), add(mul(HF[0], sx * S.muz[1] * 0.55), mul(HF[1], -S.muz[1] * 0.25))), S.muz[1] * 0.62, 0.4, MUZ));
  const jd = nrm(add(mul(HF[2], Math.cos(jaw)), mul(HF[1], -Math.sin(jaw))));
  const j0 = H([0, -S.head[1] * 0.55, S.head[2] * 0.2]), j1 = add(j0, mul(jd, S.muz[0] + S.head[2] * 0.15));
  P.push(cap(j0, j1, S.muz[1] * 0.7, S.muz[1] * 0.55, jaw > 0.05 ? 0.25 : 0.7, MUZ));
  if (jaw > 0.05) { P.push(cap(add(mz0, mul(HF[1], -S.muz[1] * 0.9)), add(j0, mul(jd, S.muz[0] * 0.5)), S.muz[1] * 0.45, S.muz[1] * 0.3, 0.2, M('#6a1816', null, { dry: 0.2 })));
    for (const t of [0.75, 0.95]) for (const sx of [-1, 1]) P.push(cap(add(lerp(mz0, mz1, t), add(mul(HF[0], sx * S.muz[1] * 0.45), mul(HF[1], -S.muz[1] * 0.7))), add(lerp(mz0, mz1, t), add(mul(HF[0], sx * S.muz[1] * 0.45), mul(HF[1], -S.muz[1] * 1.3))), 0.3, 0.08, 0, M(C.tooth || '#f2ead6', null, { dry: 0.3 }))); }
  P.push(ell(add(mz1, mul(HF[1], S.muz[1] * 0.55)), [S.muz[1] * 0.55, S.muz[1] * 0.35, S.muz[1] * 0.35], HF, 0.3, NOSE));
  J('jaw', j1, 'head', 'head');
  for (const sx of [-1, 1]) P.push(sph(H([sx * S.head[0] * 0.46, S.head[1] * 0.22, S.head[2] * 0.64]), Math.max(0.35, S.head[0] * 0.12), 0.1, DARK));
  if (S.ears === 'round' || S.ears === 'bear') for (const sx of [-1, 1]) P.push(ell(H([sx * S.head[0] * 0.62, S.head[1] * 0.85, -S.head[2] * 0.1]), [S.head[0] * 0.28, S.head[1] * 0.3, S.head[2] * 0.14], HF, 0.4, FUR));
  if (S.ears === 'pointy') for (const sx of [-1, 1]) P.push(cap(H([sx * S.head[0] * 0.5, S.head[1] * 0.6, -S.head[2] * 0.1]), H([sx * S.head[0] * 0.65, S.head[1] * 1.55, -S.head[2] * 0.15]), S.head[0] * 0.3, 0.12, 0.3, FUR));
  /* the lion's mane: locks radiating round the neck and the head's back, falling down over the chest */
  if (S.mane) { const MN = M(C.mane, 'mane', { dry: 0.85 }), ML = M(C.maneL || C.mane, 'mane', { dry: 0.9 }); const ax = nrm(sub(NE, NB));
    /* round 3: the neck rings (3, was 5) stay behind the head ... */
    for (let ring = 0; ring < 3; ring++) { const c0 = lerp(NB, add(NE, mul(HF[2], -S.head[2] * 0.35)), ring / 2); const nlock = 13 + ring * 2;
      for (let i = 0; i < nlock; i++) { const a = (i + ring * 0.5) / nlock * Math.PI * 2; const side = nrm(add(mul(HF[0], Math.cos(a)), mul(HF[1], Math.sin(a)))); const out = nrm(add(side, add(mul(ax, -0.25), [0, -0.35, 0])));
        const rr = (S.head[0] * 1.2 + ring * 0.3); const p0 = add(c0, mul(side, rr * 0.6)); const Lk = 4.0 + 1.8 * hsh(i, ring, 9) + (Math.sin(a) < 0 ? 2.2 : 0);
        P.push(ell(add(p0, mul(out, Lk * 0.55)), [1.9, 1.4, Lk * 0.66], frame(out, Math.abs(out[1]) > 0.9 ? [0, 0, 1] : [0, 1, 0]), 0.45, MN)); } }
    /* ... and two rings of BIG locks frame the face (his 3a): radiating in the face plane, fanned back, longer under the chin; the inner ring lighter */
    const FC = add(HC, mul(HF[2], S.head[2] * 0.08));
    for (let ring = 0; ring < 2; ring++) { const n = 15 + ring * 5;
      for (let i = 0; i < n; i++) { const a = (i + ring * 0.5) / n * Math.PI * 2; const side = nrm(add(mul(HF[0], Math.cos(a)), mul(HF[1], Math.sin(a))));
        const out = nrm(add(side, mul(HF[2], -0.3 - ring * 0.3))); const rr = S.head[0] * (0.98 + ring * 0.42);
        const p0 = add(add(FC, mul(side, rr)), mul(HF[2], -ring * 1.3)); const Lk = (4.0 + 1.8 * hsh(i, ring, 7)) * (Math.sin(a) < -0.3 ? 1.4 : 1) * (ring ? 1.15 : 1);
        P.push(ell(add(p0, mul(out, Lk * 0.45)), [2.2 - ring * 0.1, 1.55, Lk * 0.6], frame(out, Math.abs(out[1]) > 0.9 ? [0, 0, 1] : [0, 1, 0]), 0.5, ring ? MN : ML)); } }
    for (let i = 0; i < 5; i++) { const sx = (i - 2) * 0.5; const p0 = add(FC, add(mul(HF[1], S.head[1] * 1.05), mul(HF[0], sx * S.head[0] * 0.5))); const out = nrm(add(HF[1], mul(HF[2], -0.6)));
      P.push(ell(add(p0, mul(out, 1.6)), [1.6, 1.2, 2.6], frame(out, [0, 0, 1]), 0.5, ML)); }
    clumps(P, 26, add(NB, [0, -S.chest[1] * 0.35, 0]), [S.chest[0] * 1.3, S.chest[1] * 0.9, 4], mv(R, [0, -1, 0.35]), [2.0, 1.4, 4.0], MN, 0.45, 5); }
  if (S.ruff) clumps(P, 18, NB, [S.neck[1] * 2.2, S.neck[1] * 1.8, S.neck[0] * 0.6], mv(R, [0, -0.4, -0.6]), [0.7, 0.5, 1.4], M(C.fur, 'mane', { u: C.u, dry: 0.75 }), 0.3, 6);
  if (S.tusks) for (const sx of [-1, 1]) P.push(cap(H([sx * S.muz[1] * 0.8, -S.head[1] * 0.25, S.head[2] * 0.4 + S.muz[0] * 0.7]), H([sx * S.muz[1] * 1.3, S.head[1] * 0.25, S.head[2] * 0.4 + S.muz[0] * 0.55]), 0.4, 0.12, 0.2, M(C.tusk, null, { dry: 0.3 })));
  if (S.croc) for (let i = 1; i <= 6; i++) for (const sx of [-1, 1]) P.push(cap(add(lerp(mz0, mz1, i / 7), mul(HF[0], sx * S.muz[1] * 0.85)), add(lerp(mz0, mz1, i / 7), add(mul(HF[0], sx * S.muz[1] * 0.85), mul(HF[1], -0.9))), 0.22, 0.06, 0, M(C.tooth, null)));
  /* legs: front = shoulder (orange) → elbow → wrist (green) → paw (blue); hind = hip (orange) → knee → hock (green) → foot (blue).
     digitigrade: wrist/hock well above the toes; plantigrade (bear, croc): palm and heel flat, the paw long */
  const legs = [['LF', 1, 1], ['RF', -1, 1], ['LH', 1, -1], ['RH', -1, -1]];
  for (const [k, sx, fr] of legs) {
    const front = fr > 0, Ls = front ? S.legF : S.legH, Rr = front ? S.rF : S.rH;
    const top = T([sx * (front ? S.fx : S.hx), front ? -S.chest[1] * 0.1 : 0.2, fr * L * 0.78]);
    const off = (f.feet && f.feet[k]) || [0, 0, 0];
    const spread = S.sprawl ? (front ? S.fx * 2.1 : S.hx * 2.2) : (front ? S.fx : S.hx) * 0.9;
    let foot, local = false;
    if (f.feetL && f.feetL[k]) { const q = f.feetL[k]; foot = T([sx * q[0], q[1], q[2]]); local = true; }
    else if (f.feetLocal) { foot = T([sx * spread + (f.feetLocal[k] ? f.feetLocal[k][0] * sx : 0), f.feetLocal[k] ? f.feetLocal[k][1] : -S.y, fr * L * 0.8 + (f.feetLocal[k] ? f.feetLocal[k][2] : 0)]); local = true; }
    else { const r0 = T([sx * spread, 0, fr * L * 0.8]); foot = [r0[0] + (off[3] || 0) * sx, off[1] || 0, r0[2] + (off[0] || 0)]; }
    const up = local ? mv(R, [0, 1, 0]) : [0, 1, 0]; const fwd = local ? mv(R, [0, 0, 1]) : mv(Ry(yawB), [0, 0, 1]);
    const lowP = S.plant ? add(foot, add(mul(up, Ls[2] * 0.6), mul(fwd, front ? -S.paw[2] * 0.35 : -S.paw[2] * 0.75)))
      : add(foot, add(mul(up, Ls[2]), mul(fwd, front ? -Ls[2] * 0.08 : -Ls[2] * 0.45)));
    const pole = S.sprawl ? mv(R, [sx * 1, 0.6, 0]) : mv(R, front ? [0, -0.1, -1] : [0, -0.1, 1]);
    const [knee, low] = ik2(top, lowP, Ls[0], Ls[1], pole);
    J(k + '_top', top, 'chest', front ? 'withers' : 'pelvis'); J(k + '_knee', knee, 'limb', k + '_top'); J(k + '_low', low, 'limb', k + '_knee'); J(k + '_foot', add(foot, mul(fwd, S.paw[2] * 0.5)), 'foot', k + '_low');
    /* muscle masses: shoulder blade / haunch on top, forearm or gaskin below */
    P.push(ell(lerp(top, knee, front ? 0.25 : 0.35), [Rr[0] * (front ? 1.15 : 1.35), Rr[0] * (front ? 1.5 : 1.6), Rr[0] * (front ? 1.2 : 1.45)], R, 1.2, FUR));
    if (front) P.push(ell(add(top, mv(R, [0, Rr[0] * 0.9, -Rr[0] * 0.3])), [Rr[0] * 0.7, Rr[0] * 1.1, Rr[0] * 0.9], R, 1.0, FUR));
    P.push(cap(top, knee, Rr[0], Rr[1] * 1.2, 1.0, FUR)); P.push(ell(lerp(knee, low, 0.3), [Rr[1] * 1.15, Rr[1] * 1.15, Rr[1] * 1.15], frame(sub(low, knee)), 0.6, FUR));
    P.push(cap(knee, low, Rr[1] * 1.1, Rr[2], 0.6, FUR)); P.push(cap(low, add(foot, mul(up, S.paw[1] * 0.6)), Rr[2], Rr[2] * 0.95, 0.4, FUR));
    const PF = frame(fwd, up);
    P.push(ell(add(foot, add(mul(up, S.paw[1] * 0.75), mul(PF[2], S.paw[2] * (S.plant ? 0.15 : 0.35)))), S.paw, PF, 0.5, FUR));
    if (S.shag && front) clumps(P, 6, lerp(top, knee, 0.7), [Rr[0] * 1.4, 1.5, Rr[0] * 1.2], mv(R, [0, -1, -0.4]), [0.9, 0.6, 1.6], SHAG, 0.3, 11 + sx);
    if (!S.croc) for (let c = -1; c <= 1; c++) { P.push(sph(add(foot, add(mul(PF[0], c * S.paw[0] * 0.45), add(mul(PF[2], S.paw[2] * (S.plant ? 0.75 : 0.95)), mul(up, S.paw[1] * 0.55)))), S.paw[0] * 0.3, 0.25, FUR));
      P.push(cap(add(foot, add(mul(PF[0], c * S.paw[0] * 0.45), add(mul(PF[2], S.paw[2] * (S.plant ? 1.0 : 1.1)), mul(up, S.paw[1] * 0.5)))), add(foot, add(mul(PF[0], c * S.paw[0] * 0.5), add(mul(PF[2], S.paw[2] * (S.plant ? 1.5 : 1.4)), mul(up, S.paw[1] * 0.15)))), 0.24, 0.08, 0, CLAW)); }
  }
  /* tail (purple joints) */
  if (S.tail) { const [Lt, r0, r1] = S.tail; const N = S.croc ? 10 : 8; let p = T([0, S.hips[1] * (S.croc ? 0.1 : 0.4), -L * 0.62 - S.hips[2] * 0.7]); J('tail0', p, 'tail', 'pelvis');
    let a = ((f.tail ? f.tail[0] : 0) + (S.croc ? -6 : S.brush ? -35 : -55)) * D2R, sw = (f.tail ? f.tail[1] : 0) * D2R;
    for (let i = 0; i < N; i++) { const t = i / N; const dir = mv(R, [Math.sin(sw * (0.3 + t)) * Math.cos(a), Math.sin(a), -Math.cos(sw * (0.3 + t)) * Math.cos(a)]); const q = add(p, mul(nrm(dir), Lt / N));
      if (S.croc && q[1] < 0.9) q[1] = 0.9 + (q[1] - 0.9) * 0.1;
      const ra = r0 + (r1 - r0) * t, rb = r0 + (r1 - r0) * (t + 1 / N); P.push(cap(p, q, S.brush ? ra * (1 + 0.6 * Math.sin(t * Math.PI)) : ra, S.brush ? rb * (1 + 0.6 * Math.sin((t + 1 / N) * Math.PI)) : rb, 0.4, S.brush ? M(C.fur, 'mane', { u: C.u }) : FUR, { t }));
      if (S.brush && i > 1) clumps(P, 3, q, [ra * 1.2, ra * 1.2, 1], nrm(dir), [ra * 0.7, ra * 0.5, ra * 1.4], M(C.fur, 'mane', { u: C.u, dry: 0.75 }), 0.3, 20 + i);
      if (S.scutes && i % 2 === 0) P.push(sph(add(q, mul(mv(R, [0, 1, 0]), ra * 0.8)), ra * 0.35, 0.2, FUR));
      if (i % 3 === 2 || i === N - 1) J('tail' + (i + 1), q, 'tail', JL[JL.length - 1].n);
      p = q; a += ((f.tail ? f.tail[2] || 0 : 0) + (S.croc ? 0.5 : 9)) * D2R; }
    if (S.tuft) clumps(P, 7, p, [S.tuft * 0.6, S.tuft * 0.6, S.tuft * 0.6], mv(R, [0, -0.6, -0.8]), [S.tuft * 0.45, S.tuft * 0.4, S.tuft * 0.9], M(C.tuft, 'mane'), 0.3, 31); }
  return P;
}
/* the quadruped frames (dz/dy feet offsets in mm: [dz, dy, _, dx]) */
function walkFeet(t, A, lift) { const ph = t / 6, off = { LH: 0, LF: 0.25, RH: 0.5, RF: 0.75 }, o = {};
  for (const k in off) { const p = ((ph - off[k]) % 1 + 1) % 1; if (p < 0.65) o[k] = [A * (1 - 2 * p / 0.65), 0]; else { const u = (p - 0.65) / 0.35; o[k] = [-A + 2 * A * u, lift * Math.sin(Math.PI * u)]; } } return o; }
export function quadFrames(sp) {
  const S = SPECIES[sp]; const A = S.L * 0.32, lift = S.y * 0.18; const F = [];
  for (let i = 0; i < 4; i++) F.push({ n: 'idle' + i, breath: Math.sin(i / 4 * Math.PI * 2), head: [Math.sin(i / 4 * Math.PI * 2) * 4, i === 2 ? 14 : i === 3 ? 6 : 0], tail: [0, Math.sin(i / 4 * Math.PI * 2) * 20, 0], jaw: sp === 'lion' && i === 2 ? 8 : 0 });
  for (let t = 0; t < 6; t++) F.push({ n: 'walk' + t, feet: walkFeet(t, A, lift), dy: S.y * 0.025 * Math.cos(t / 6 * Math.PI * 4), head: [-4 + 3 * Math.cos(t / 6 * Math.PI * 4), 0], tail: [0, Math.sin(t / 6 * Math.PI * 2) * 25, 0], pitch: 0 });
  const Y = S.y, L = S.L;
  const ATK = {
    lion: [{ dy: -Y * 0.3, pitch: -7, head: [-12, 0], tail: [25, 10, 0], feet: { LH: [2, 0], RH: [2, 0] } },
      { dy: -Y * 0.4, z: -L * 0.3, pitch: 8, head: [-6, 0], tail: [30, 0, 0], feet: { LH: [5, 0], RH: [5, 0], LF: [1, 0], RF: [1, 0] } },
      { dy: Y * 0.7, z: L * 0.9, pitch: 24, head: [8, 0], jaw: 28, tail: [5, 0, -4], feet: { LF: [L * 1.2, Y * 0.8], RF: [L * 1.3, Y * 0.9], LH: [-L * 0.2, Y * 0.3], RH: [-L * 0.1, Y * 0.35] } },
      { dy: Y * 0.35, z: L * 1.6, pitch: -12, head: [-12, 0], jaw: 36, tail: [10, 0, -2], feet: { LF: [L * 2.0, Y * 0.25], RF: [L * 2.1, Y * 0.3], LH: [L * 0.9, Y * 0.35], RH: [L * 0.8, Y * 0.4] } },
      { dy: -Y * 0.08, z: L * 1.0, pitch: -3, head: [-4, 0], jaw: 10, feet: { LF: [L * 1.1, 0], RF: [L * 1.15, 0], LH: [L * 0.9, 0], RH: [L * 0.85, 0] } }],
    bear: [{ pitch: 22, dy: Y * 0.15, head: [10, 0], feet: { LF: [L * 0.2, Y * 0.35], RF: [L * 0.2, Y * 0.3], LH: [L * 0.25, 0], RH: [L * 0.25, 0] } },
      /* reared: the front paws held up and forward in the body's own frame (round 1 hid them inside the chest) */
      { pitch: 58, dy: Y * 0.35, z: -L * 0.3, head: [24, 0], jaw: 34, feet: { LH: [L * 0.5, 0], RH: [L * 0.5, 0] }, feetL: { LF: [6.5, -1, L * 0.78 + 12], RF: [6.0, 1, L * 0.78 + 13] } },
      { pitch: 52, dy: Y * 0.3, z: -L * 0.2, yaw: -14, head: [10, -15], jaw: 40, feet: { LH: [L * 0.5, 0], RH: [L * 0.5, 0] }, feetL: { LF: [7.5, 2, L * 0.78 + 10], RF: [-2, -2, L * 0.78 + 14] } },
      { pitch: -8, dy: -Y * 0.08, z: L * 0.3, head: [-14, 0], jaw: 34, feet: { LF: [L * 0.85, 0], RF: [L * 0.9, 0], LH: [L * 0.2, 0], RH: [L * 0.2, 0] } },
      { pitch: 0, z: L * 0.15, head: [-4, 0], jaw: 6, feet: { LF: [L * 0.3, 0], RF: [L * 0.3, 0], LH: [L * 0.1, 0], RH: [L * 0.1, 0] } }],
    wolf: [{ dy: -Y * 0.2, pitch: -8, head: [-14, 0], tail: [-10, 0, 0], feet: { LH: [2, 0], RH: [2, 0] } },
      { dy: Y * 0.1, z: L * 0.55, pitch: 8, head: [4, 0], jaw: 34, feet: { LF: [L * 0.8, Y * 0.35], RF: [L * 0.9, Y * 0.3], LH: [-L * 0.3, 0], RH: [-L * 0.25, 0] } },
      { dy: -Y * 0.05, z: L * 0.65, pitch: -6, head: [-8, 18], jaw: 4, feet: { LF: [L * 0.85, 0], RF: [L * 0.9, 0], LH: [L * 0.2, 0], RH: [L * 0.2, 0] } },
      { dy: -Y * 0.12, z: L * 0.35, pitch: -4, head: [-10, -20], jaw: 4, feet: { LF: [L * 0.5, 0], RF: [L * 0.5, 0], LH: [-L * 0.05, 0], RH: [0, 0] } },
      { z: L * 0.1, head: [-2, 0], feet: {} }],
    boar: [{ head: [-8, 0], feet: { LF: [L * 0.4, Y * 0.4] } }, { dy: -Y * 0.1, z: L * 0.7, pitch: -8, head: [-22, 0], feet: { LF: [L * 0.9, 0], RF: [L * 1, 0], LH: [-L * 0.2, 0], RH: [-L * 0.3, 0] } },
      { z: L * 0.8, pitch: 10, head: [34, 0], jaw: 12, feet: { LF: [L * 0.9, Y * 0.3], RF: [L * 1, Y * 0.1], LH: [0, 0], RH: [0, 0] } }, { z: L * 0.6, pitch: 4, head: [16, 14], feet: { LF: [L * 0.7, 0], RF: [L * 0.7, 0] } }, { z: L * 0.2, head: [-4, 0], feet: {} }],
    croc: [{ head: [12, 0], jaw: 40, feet: {} }, { z: L * 0.5, head: [8, 0], jaw: 48, tail: [0, -20, 0], feet: { LF: [L * 0.5, 0], RF: [L * 0.6, 0] } }, { z: L * 0.7, head: [-2, 16], jaw: 0, tail: [0, 30, 0], feet: { LF: [L * 0.6, 0], RF: [L * 0.6, 0] } },
      { z: L * 0.6, roll: 35, head: [0, -10], jaw: 0, tail: [0, -30, 0], feetLocal: { LF: [0, -3.4, 0], RF: [0, -3.4, 0], LH: [0, -3.4, 0], RH: [0, -3.4, 0] } }, { z: L * 0.2, head: [2, 0], feet: {} }],
  };
  const atk = ATK[sp] || ATK.wolf; atk.forEach((a, i) => F.push(Object.assign({ n: 'attack' + i }, a)));
  F.push({ n: 'hit0', z: -L * 0.15, pitch: 7, head: [22, -10], jaw: 16, tail: [20, 0, 0] }, { n: 'hit1', dy: -Y * 0.08, roll: 8, head: [-12, 8], jaw: 6, tail: [-10, 0, 0], feet: { LF: [-1, 0], RF: [-1.5, 0] } }, { n: 'hit2', head: [0, 0], feet: {} });
  /* die: stagger, buckle, belly-down, rolling, on the side (legs out) */
  const fold = { LF: [S.croc ? 0 : -1.5, -Y + S.legF[2] * 0.4, 1], RF: [S.croc ? 0 : -1.5, -Y + S.legF[2] * 0.4, 1], LH: [S.croc ? 0 : -1, -Y + S.legH[2] * 0.4, -1], RH: [S.croc ? 0 : -1, -Y + S.legH[2] * 0.4, -1] };
  const out = { LF: [2.5, -Y * 0.55, 3], RF: [2.5, -Y * 0.55, 3], LH: [2.5, -Y * 0.55, -3], RH: [2.5, -Y * 0.55, -3] };
  const lie = S.chest[0] * 0.95;
  F.push({ n: 'die0', roll: 6, dy: -Y * 0.1, head: [-20, 10], jaw: 10, feet: { LF: [1, 0, 0, -1], RF: [-1, 0] } },
    { n: 'die1', dy: -Y * 0.45, pitch: -8, head: [-24, 0], jaw: 12, feet: { LF: [L * 0.1, 0], RF: [L * 0.15, 0], LH: [L * 0.3, 0], RH: [L * 0.3, 0] } },
    { n: 'die2', y: S.chest[1] * 0.9, pitch: -2, head: [-30, 8], jaw: 8, feetLocal: fold },
    { n: 'die3', y: S.chest[1] * 0.75 + lie * 0.4, roll: 45, head: [-20, 14], jaw: 14, feetLocal: out },
    { n: 'die4', y: lie * 0.95, roll: 84, head: [-10, 10], jaw: 18, tail: [0, 10, -6], feetLocal: out });
  return F;
}

/* ======================= SNAKE (spline chain) ======================= */
export const SNAKES = { glykon: { c: '#b4a27a', b: '#5a4a34', u: '#e2d6b4', p: 'band', nb: 18 }, arenosus: { c: '#b8a486', b: '#7a644a', u: '#e6dcc4', p: 'diam' } };
function snakeFrame(f, col) {
  /* round 3 (his note: round 2 "far too thick"): body radius 0.95 mm (was 2.1), a LOOSE S-coil over the base (1.7 turns of a widening
     spiral, nothing stacked), the neck raised as an S, a small head — like his Glykon / Arenosus minis */
  const P = []; const N = 44, r = 0.95, HK = 0.62; const pts = [];
  const rise = (f.rise != null ? f.rise : 0.25) + 0.05, ext = f.ext || 0, wave = (f.wave || 0) * 0.8, ph = f.ph || 0, flat = f.flat || 0, Hh = (f.h != null ? f.h : 9) * 0.95;
  for (let i = 0; i <= N; i++) { const s = i / N; let x, y, z;
    if (s < 1 - rise) { const u = s / (1 - rise); const a = (f.turn || 0) + u * Math.PI * (1.7 - flat * 0.7); const R = (6.9 - u * 3.6) * (1 + flat * 0.35); x = Math.cos(a) * R + Math.sin(u * 9 + ph) * wave; z = Math.sin(a) * R - 1 + Math.cos(u * 9 + ph) * wave * 0.5; y = r * 0.95; }
    else { const u = (s - (1 - rise)) / rise; const a0 = (f.turn || 0) + Math.PI * (1.7 - flat * 0.7); const R0 = 3.3 * (1 + flat * 0.35); const bx = Math.cos(a0) * R0, bz = Math.sin(a0) * R0 - 1;
      x = bx * (1 - u) + Math.sin(u * 4 + ph) * (1.2 + wave) * u; z = bz * (1 - u) + u * (1.5 + ext * 8); y = r * 0.95 + Hh * Math.sin(u * Math.PI / 2) * (1 - flat); }
    pts.push([x, y, z]); }
  JL = []; { let prev = null; for (let i = 0; i <= N; i += 4) { const s = i / N; const n = 'c' + i; J(n, pts[i], s < 0.16 ? 'tail' : 'spine', prev); prev = n; } }
  const rad = (s) => (s < 0.15 ? 0.3 + 0.7 * s / 0.15 : s > 0.92 ? 1 - (s - 0.92) * 2.5 : 1) * r;
  for (let i = 0; i < N; i++) { const s = i / N; P.push(cap(pts[i], pts[i + 1], rad(s), rad(s + 1 / N), 0.3, { c: col.c, b: col.b, u: col.u, p: col.p, nb: col.nb, dry: 0.5 }, { t: s })); }
  /* head (x0.62 of round 2): wedge-shaped, a little wider than the neck */
  const hd = nrm(sub(pts[N], pts[N - 3])); const HF = frame(add(hd, [0, -0.15 - (f.headDown || 0), 0]));
  const HC = add(pts[N], mul(HF[2], 1.6 * HK)); const H = (p) => add(HC, add(add(mul(HF[0], p[0] * HK), mul(HF[1], p[1] * HK)), mul(HF[2], p[2] * HK)));
  P.push(ell(HC, [2.1 * HK, 1.3 * HK, 2.9 * HK], HF, 0.5, { c: col.c, p: 'none', u: col.u, dry: 0.6 }));
  J('head', HC, 'head', 'c' + (Math.floor(N / 4) * 4));
  const jaw = (f.jaw || 0) * D2R; if (jaw > 0.05) { const jd = nrm(add(mul(HF[2], Math.cos(jaw)), mul(HF[1], -Math.sin(jaw)))); const j0 = H([0, -0.6, -1.4]); P.push(cap(j0, add(j0, mul(jd, 3.6 * HK)), 1.0 * HK, 0.6 * HK, 0.15, { c: col.u, p: 'none' }));
    P.push(sph(H([0, -0.9, 0.6]), 0.9 * HK, 0.1, { c: '#8a2420', dry: 0.2 })); for (const sx of [-1, 1]) P.push(cap(H([sx * 0.6, -0.9, 2.2]), H([sx * 0.6, -2.1, 2.0]), 0.2 * HK, 0.05, 0, { c: '#f4eedc' })); }
  for (const sx of [-1, 1]) P.push(sph(H([sx * 1.25, 0.45, 1.0]), 0.4 * HK, 0.05, { c: '#120c08', dry: 0.9 }));
  if (f.tongue) { const t0 = H([0, -0.4, 2.8]); P.push(cap(t0, add(t0, mul(HF[2], 1.8)), 0.14, 0.1, 0.05, { c: '#c0281e' })); }
  return P;
}
export function snakeFrames() { return [
  { n: 'idle0', ph: 0 }, { n: 'idle1', ph: 0.4, tongue: 1 }, { n: 'idle2', ph: 0.8, h: 9.6 }, { n: 'idle3', ph: 0.4, tongue: 1, h: 9.3 },
  ...[0, 1, 2, 3, 4, 5].map(t => ({ n: 'walk' + t, ph: t / 6 * Math.PI * 2, wave: 1.4, h: 6, rise: 0.2, turn: t * 0.08 })),
  { n: 'attack0', rise: 0.32, h: 11, ext: -0.25, jaw: 10 }, { n: 'attack1', rise: 0.32, h: 12, ext: -0.4, jaw: 40, headDown: -0.2 }, { n: 'attack2', rise: 0.38, h: 7, ext: 0.9, jaw: 55, headDown: 0.25 },
  { n: 'attack3', rise: 0.38, h: 5, ext: 1.1, jaw: 0, headDown: 0.4 }, { n: 'attack4', rise: 0.28, h: 9, ext: 0.1 },
  { n: 'hit0', wave: 2.2, ph: 1, h: 7, ext: -0.3 }, { n: 'hit1', wave: 1.8, ph: 2, h: 5, jaw: 20 }, { n: 'hit2', h: 8 },
  { n: 'die0', h: 6, wave: 1.5, jaw: 20 }, { n: 'die1', h: 3, flat: 0.3, wave: 1.0 }, { n: 'die2', h: 1, flat: 0.55, headDown: 0.3 }, { n: 'die3', h: 0, flat: 0.75, headDown: 0.5, jaw: 15 }, { n: 'die4', h: 0, flat: 0.9, headDown: 0.6, jaw: 20 },
]; }

/* ======================= ZORA, the golden eagle ======================= */
function eagleFrame(f) {
  JL = []; const P = []; const BR = { c: '#a8865c', p: 'feath', u: '#86684a', dry: 0.75 }, GOLD = { c: '#d4b47a', p: 'feath', dry: 0.7 }, BEAK = { c: '#e0b040', dry: 0.5 }, TAL = { c: '#e6c040', dry: 0.4 }, DK = { c: '#141008', dry: 0.9 }, TIP = { c: '#5e4632', p: 'feath', dry: 0.7 };
  const lift = f.lift || 0, pitch = (f.pitch || 0) * D2R, roll = (f.roll || 0) * D2R; const R = mm(Rz(roll), Rx(-pitch));
  /* round 3 (his 6a): perched on a rock like his mini; die frames slide off it (f.g 0 -> 1 = on the base) */
  const PER = 3.2 * (1 - (f.g || 0)); const root = [0, PER + 7.9 + lift, f.z || 0]; const T = (p) => add(mv(R, p), root);
  { const ROCK = { c: '#b0a48e', p: 'fur', u: '#7e7262', dry: 0.8 }; P.push(ell([0, 1.3, 0.6], [5.6, 1.9, 4.4], Ry(0.4), 1.0, ROCK)); P.push(ell([1.2, 2.3, 0.3], [3.0, 1.3, 2.6], Ry(-0.3), 0.9, ROCK)); P.push(ell([-2.6, 0.9, 2.4], [2.8, 1.0, 2.2], null, 0.8, ROCK)); P.push(ell([-0.8, 2.4, 1.2], [2.4, 1.1, 2.0], null, 0.8, ROCK)); P.push(ell([3.4, 0.8, -2.0], [2.0, 0.8, 1.8], null, 0.6, ROCK)); }
  P.push(ell(T([0, 0, 0]), [3.4, 3.7, 5.4], mm(R, Rx(-0.25)), 1.4, BR));
  P.push(ell(T([0, 1.9, 2.6]), [2.6, 2.6, 2.6], R, 1.2, BR));
  /* head */
  const hp = (f.head ? f.head[0] : 0) * D2R, hy = (f.head ? f.head[1] : 0) * D2R; const HF = frame(mv(R, [Math.sin(hy), Math.sin(hp), Math.cos(hy) * Math.cos(hp)]), mv(R, [0, 1, 0]));
  const HC = T([0, 4.6, 3.6]); const H = (p) => add(HC, add(add(mul(HF[0], p[0]), mul(HF[1], p[1])), mul(HF[2], p[2])));
  P.push(ell(HC, [1.9, 2.0, 2.3], HF, 0.9, GOLD));
  J('pelvis', T([0, -0.5, -2.5]), 'spine'); J('mid', T([0, 0.4, 0]), 'spine', 'pelvis'); J('chest', T([0, 1.9, 2.6]), 'chest', 'mid'); J('head', HC, 'head', 'chest');
  P.push(cap(H([0, 0.3, 1.6]), H([0, -0.4, 3.4]), 0.9, 0.45, 0.4, BEAK)); P.push(cap(H([0, -0.4, 3.4]), H([0, -1.3, 3.2]), 0.42, 0.15, 0.2, BEAK));
  for (const sx of [-1, 1]) P.push(sph(H([sx * 1.15, 0.45, 1.2]), 0.42, 0.05, DK));
  /* wings: shoulder → elbow → wrist → tip, with feather plates; spread 0 (folded along the back) .. 1, flap = raise angle */
  const sp = f.spread || 0, fl = (f.flap || 0) * D2R;
  for (const sx of [-1, 1]) {
    const S0 = T([sx * 2.4, 1.8, 1.6]); const back = mv(R, [0, -0.08, -1]);
    const wd = nrm(mv(R, lerp([sx * 0.18, 0.12, -1], [sx * Math.cos(fl), Math.sin(fl), -0.12], sp))); const span = 6 + sp * 8;
    let n = nrm(cross(wd, back)); if (dot(n, mv(R, [0, 1, 0])) < 0) n = mul(n, -1);
    P.push(cap(S0, add(S0, mul(wd, span * 0.45)), 1.5, 1.0, 0.8, BR));
    J('wS' + sx, S0, 'chest', 'chest'); J('wE' + sx, add(S0, mul(wd, span * 0.35)), 'limb', 'wS' + sx); J('wW' + sx, add(S0, mul(wd, span * 0.68)), 'limb', 'wE' + sx); J('wT' + sx, add(add(S0, mul(wd, span)), mul(back, 3)), 'foot', 'wW' + sx);
    for (let i = 0; i <= 8; i++) { const t = i / 8; const c0 = add(S0, mul(wd, span * (0.05 + t * 0.95)));
      const prim = t > 0.6; const cd = nrm(prim ? add(mul(back, 1), mul(wd, (t - 0.5) * 1.6)) : back); const chord = prim ? 7.0 - (t - 0.6) * 3 : 6.4 + (1 - sp) * 1.5;
      const F2 = frame(cd, n); P.push(ell(add(c0, mul(cd, chord * 0.45)), [2.1, 0.4, chord * 0.58], F2, 0.35, prim ? TIP : BR)); }
  }
  /* tail fan */
  const tb = T([0, -0.6, -4.8]); J('tail', add(tb, mv(R, [0, -0.8, -4.5])), 'tail', 'pelvis'); for (let i = -2; i <= 2; i++) { const d = mv(R, nrm([i * 0.22, -0.35 + (f.tailUp || 0), -1])); P.push(ell(add(tb, mul(d, 2.6)), [1.0, 0.3, 2.8], frame(d), 0.3, i % 2 ? TIP : BR)); }
  /* legs + talons (perched on the base when lift is 0; reaching forward in the strike) */
  const reach = f.talons || 0;
  for (const sx of [-1, 1]) { const hip = T([sx * 1.4, -2.2, 0.4]); const foot = lift > 0.5 ? add(hip, mv(R, [sx * 0.3, -4.2 + reach * 1.5, 0.8 + reach * 4.5])) : [sx * 1.5 + root[0] * 0, PER + 0.3, root[2] + 0.8];
    P.push(cap(hip, foot, 0.9, 0.55, 0.4, GOLD)); J('leg' + sx, hip, 'limb', 'pelvis'); J('ft' + sx, foot, 'foot', 'leg' + sx); for (const a of [-0.6, 0, 0.6]) { const d = mv(Ry(a), [0, 0, 1]); P.push(cap(foot, add(foot, add(mul(d, 1.6), [0, -0.25, 0])), 0.35, 0.18, 0.15, TAL)); P.push(cap(add(foot, mul(d, 1.6)), add(foot, add(mul(d, 2.0), [0, -0.6, 0])), 0.16, 0.08, 0, DK)); }
    P.push(cap(foot, add(foot, [0, -0.2, -1.3]), 0.3, 0.15, 0.1, TAL)); }
  return P;
}
export function eagleFrames() { return [   /* round 3: perched with the wings spread LOW (his mini), flight = short hops off the perch */
  { n: 'idle0', spread: 1, flap: 18, pitch: 6 }, { n: 'idle1', spread: 1, flap: 24, head: [0, 20], pitch: 6 }, { n: 'idle2', spread: 0.95, flap: 12, head: [-5, -15], pitch: 4 }, { n: 'idle3', spread: 1, flap: 20, head: [5, 5], pitch: 6 },
  ...[0, 1, 2, 3, 4, 5].map(t => ({ n: 'walk' + t, lift: 3 + Math.sin(t / 6 * Math.PI * 2) * 0.9, spread: 1, flap: 10 + Math.cos(t / 6 * Math.PI * 2) * 34, pitch: -2, tailUp: 0.2 })),
  { n: 'attack0', lift: 6, spread: 1, flap: 40, pitch: 10 }, { n: 'attack1', lift: 5, spread: 0.6, flap: 55, pitch: -25, head: [-25, 0], z: 3 }, { n: 'attack2', lift: 3, spread: 0.9, flap: 20, pitch: 15, talons: 1, z: 6, head: [-10, 0] },
  { n: 'attack3', lift: 1.5, spread: 1, flap: -6, pitch: 25, talons: 1.2, z: 7, head: [-20, 0] }, { n: 'attack4', lift: 3.5, spread: 1, flap: 28, pitch: 0, z: 3 },
  { n: 'hit0', spread: 0.6, flap: 30, head: [25, 0], pitch: 10 }, { n: 'hit1', spread: 0.3, flap: 10, head: [-15, 20], roll: 10 }, { n: 'hit2', spread: 1, flap: 18, pitch: 6 },
  { n: 'die0', spread: 0.5, flap: 20, head: [-30, 0], roll: 12 }, { n: 'die1', spread: 0.8, flap: -5, head: [-40, 10], roll: 30, lift: -1.5, g: 0.5, z: 3 }, { n: 'die2', spread: 0.9, flap: -15, head: [-45, 20], roll: 55, lift: -3, g: 1, z: 5.5 },
  { n: 'die3', spread: 0.7, flap: 0, head: [-50, 30], roll: 62, lift: -3.6, g: 1, z: 6 }, { n: 'die4', spread: 0.6, flap: 5, head: [-55, 35], roll: 70, lift: -4, g: 1, z: 6.2 },
]; }

/* ======================= SPIDER ======================= */
function spiderFrame(f) {
  JL = []; const P = []; const BODY = { c: '#262019', p: 'fur', dry: 0.7 }, BAND = { c: '#b8ad9c', dry: 0.5 }, LEG = { c: '#2e2620', dry: 0.7 }, EYE = { c: '#9a1a14', dry: 0.9 };
  const flip = f.flip || 0, rear = f.rear || 0, curl = f.curl || 0; const R = mm(Rz(flip * Math.PI), Rx(-rear * 0.5)); const root = [0, 2.2 + flip * 1.2 + rear * 1.4, 0]; const T = (p) => add(mv(R, p), root);
  P.push(ell(T([0, 0.4, 1.4]), [1.6, 1.1, 1.9], R, 0.4, BODY)); P.push(ell(T([0, 0.9, -1.8]), [2.2, 1.9, 2.7], mm(R, Rx(0.3)), 0.5, BODY));
  for (const [y, z, r] of [[2.6, -1.4, 0.55], [2.4, -2.4, 0.5], [2.0, -3.3, 0.4]]) P.push(ell(T([0, y, z]), [r * 1.6, r * 0.35, r * 0.8], R, 0.1, BAND));
  for (const sx of [-1, 1]) { P.push(sph(T([sx * 0.45, 1.25, 3.0]), 0.3, 0.05, EYE)); P.push(cap(T([sx * 0.4, 0.2, 3.2]), T([sx * 0.35, -0.6 - rear * 0.3, 3.6 + rear * 0.6]), 0.3, 0.12, 0.1, LEG)); }
  const ang = [55, 20, -15, -50];
  for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const grp = (i + (sx > 0 ? 0 : 1)) % 2; const ph = (f.ph || 0) + grp * Math.PI; const g = f.walk ? 1 : 0;
    const a = (ang[i] + Math.sin(ph) * 14 * g * (i < 2 ? 1 : -1)) * D2R, lift = Math.max(0, Math.cos(ph)) * 1.2 * g;
    const hip = T([sx * 1.1, 0.6, 1.3 - i * 0.6]); const reach = 7 - Math.abs(i - 1.5) * 0.4;
    let foot = [sx * Math.cos(a) * reach, lift, Math.sin(a) * reach + 0.6];
    if (rear && i < 2) foot = T([sx * (2.5 + i), 4 + i * 0.5, 4.5]);
    if (curl) foot = lerp(foot, T([sx * 1.4, 3.5, 1 - i * 0.5]), curl);
    const knee = add(lerp(hip, foot, 0.42), [sx * 0.5, 3.4 * (1 - curl * 0.5) + lift * 0.5, 0]);
    P.push(cap(hip, knee, 0.42, 0.32, 0.2, LEG)); P.push(sph(knee, 0.4, 0.1, LEG)); P.push(cap(knee, foot, 0.3, 0.14, 0.1, LEG)); }
  return P;
}
export function spiderFrames() { return [{ n: 'idle0' }, { n: 'idle1', ph: 0.6 }, ...[0, 1, 2, 3].map(t => ({ n: 'walk' + t, walk: 1, ph: t / 4 * Math.PI * 2 })),
  { n: 'attack0', rear: 0.6 }, { n: 'attack1', rear: 1 }, { n: 'attack2', rear: 0.3 }, { n: 'hit0', ph: 1.2, rear: 0.2 }, { n: 'hit1' }, { n: 'die0', curl: 0.4 }, { n: 'die1', curl: 0.8, flip: 0.5 }, { n: 'die2', curl: 1, flip: 1 }]; }

/* ======================= render ======================= */
let REND, SCENE, TURN, MESH, INK, BASE, SUN, GM, MATS = {};
function setup() {
  if (REND) return; REND = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); REND.outputColorSpace = THREE.SRGBColorSpace; REND.setClearColor(0, 0); REND.setPixelRatio(1);
  SCENE = new THREE.Scene(); SCENE.add(new THREE.AmbientLight(0xffffff, 0.5 * Math.PI)); SUN = new THREE.DirectionalLight(0xfff4e6, 0.62 * Math.PI); SCENE.add(SUN); SCENE.add(SUN.target);
  TURN = new THREE.Group(); SCENE.add(TURN);
  GM = new THREE.DataTexture(new Uint8Array([150, 150, 198, 198, 235, 235, 255, 255]), 8, 1, THREE.RedFormat); GM.needsUpdate = true; GM.minFilter = GM.magFilter = THREE.NearestFilter;
  MATS.body = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: GM });
  const ink = new THREE.MeshBasicMaterial({ color: 0x120c0a, side: THREE.BackSide }); const u = { value: 0.3 }; ink.userData.u = u;
  ink.onBeforeCompile = (sh) => { sh.uniforms.uOut = u; sh.vertexShader = 'uniform float uOut;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normalize(normal) * uOut;'); }; ink.customProgramCacheKey = () => 'beastInk'; MATS.ink = ink;
  MESH = new THREE.Mesh(new THREE.BufferGeometry(), MATS.body); INK = new THREE.Mesh(MESH.geometry, MATS.ink); TURN.add(MESH); TURN.add(INK);
}
/* his base: an oval/round disc, sand top with grain, a coloured rim */
function makeBase(dims, rim) {
  if (BASE) { TURN.remove(BASE); BASE.traverse(o => { if (o.geometry) o.geometry.dispose(); }); BASE = null; } if (!dims) return;
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#8c7c66'; g.fillRect(0, 0, 256, 256);
  let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 900; i++) { g.fillStyle = rnd() < .5 ? 'rgba(60,48,36,.28)' : 'rgba(200,186,160,.24)'; g.beginPath(); g.arc(rnd() * 256, rnd() * 256, rnd() * 1.6 + .4, 0, 7); g.fill(); }
  for (let i = 0; i < 12; i++) { g.strokeStyle = 'rgba(70,56,40,.3)'; g.lineWidth = 4; g.beginPath(); const y = rnd() * 256; g.moveTo(0, y); g.bezierCurveTo(80, y + 16, 170, y - 16, 256, y + 4); g.stroke(); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const H = 3.4, rx = dims[0] / 2, rz = dims[1] / 2; const G = new THREE.Group();
  const geo = new THREE.CylinderGeometry(1 * 0.955, 1, H, 72); geo.scale(rz, 1, rx);
  const m = new THREE.Mesh(geo, [new THREE.MeshToonMaterial({ color: new THREE.Color(rim), gradientMap: GM }), new THREE.MeshToonMaterial({ map: tex, gradientMap: GM }), new THREE.MeshToonMaterial({ color: new THREE.Color(rim), gradientMap: GM })]); m.position.y = -H / 2; G.add(m);
  const ig = new THREE.CylinderGeometry(1, 1, H + 0.25, 72); ig.scale(rz + 0.3, 1, rx + 0.3); const i2 = new THREE.Mesh(ig, new THREE.MeshBasicMaterial({ color: 0x120c0a, side: THREE.BackSide })); i2.position.y = -H / 2; G.add(i2);
  BASE = G; TURN.add(G);
}
function alphaBox(c) { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; }
/* frames → sheet (rows = frames, 8 MINI_YAW cells), cropped round the base centre (anchor) like minis8 */
async function sheet(build, frames, o) {
  setup(); const t0 = performance.now(); const ss = 2, ppm = (o.pxmm || PXMM) * ss, S = Math.ceil(o.box * ppm / 4) * 4, hw = S / 2 / ppm; const ty = o.ty || 10;
  const cam = new THREE.OrthographicCamera(-hw, hw, hw, -hw, 0.1, 2000); cam.position.set(0, ty + Math.sin(30 * D2R) * 500, Math.cos(30 * D2R) * 500); cam.lookAt(0, ty, 0); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  const dir = new THREE.Vector3(-0.55, 0.85, 0.55).applyQuaternion(cam.quaternion); SUN.position.copy(cam.position).add(dir.multiplyScalar(300)); SUN.target.position.copy(cam.position).add(new THREE.Vector3(0, 0, -500).applyQuaternion(cam.quaternion)); SUN.target.updateMatrixWorld();
  MATS.ink.userData.u.value = (o.ink || 0.85) * ss / ppm;
  makeBase(o.base, o.rim || '#4a3a2a');
  REND.setSize(S, S, false);
  const anc = new THREE.Vector3(0, 0, 0).project(cam); const AX = (anc.x * 0.5 + 0.5) * S / ss, AY = (-anc.y * 0.5 + 0.5) * S / ss;
  const cells = [], JR = [], st = { sculpt: 0, render: 0, tris: 0, verts: 0 };
  for (const f of frames) { const q0 = performance.now(); const prims = build(f); const r = meshOf(prims, o.h); MESH.scale.setScalar(o.sc || 1); INK.scale.setScalar(o.sc || 1); MESH.geometry.dispose(); MESH.geometry = r.geo; INK.geometry = r.geo; st.tris = Math.max(st.tris, r.tris); st.verts = Math.max(st.verts, r.verts);
    const q1 = performance.now(); st.sculpt += q1 - q0; const row = []; const jl = JL.slice(); const jrow = [];
    for (const yaw of MINI_YAW) { const Y = new THREE.Vector3(0, 1, 0); jrow.push(jl.map(j => { const v = new THREE.Vector3(...j.p).multiplyScalar(o.sc || 1).applyAxisAngle(Y, yaw * D2R).project(cam); return { n: j.n, par: j.par, cat: j.cat, x: +((v.x * 0.5 + 0.5) * S / ss - AX).toFixed(1), y: +((-v.y * 0.5 + 0.5) * S / ss - AY).toFixed(1) }; })); } JR.push(jrow);
    for (const yaw of MINI_YAW) { TURN.rotation.y = yaw * D2R; TURN.updateMatrixWorld(true); REND.render(SCENE, cam); let c = document.createElement('canvas'); c.width = S; c.height = S; c.getContext('2d').drawImage(REND.domElement, 0, 0);
      const d = document.createElement('canvas'); d.width = S / 2; d.height = S / 2; const g = d.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, 0, d.width, d.height); row.push({ c: d, box: alphaBox(d) }); }
    TURN.rotation.y = 0; st.render += performance.now() - q1; cells.push(row); await new Promise(ok => setTimeout(ok, 0)); }
  /* crop a set of rows round the base anchor (round 3: o.split = [[name, rowRegExp], ...] -> each part cropped on its own) */
  const crop = (idx) => { let L = 0, Rr = 0, Tt = 0, Bm = 0; for (const j of idx) for (const { box } of cells[j]) { if (box[2] < 0) continue; L = Math.max(L, AX - box[0]); Rr = Math.max(Rr, box[2] + 1 - AX); Tt = Math.max(Tt, AY - box[1]); Bm = Math.max(Bm, box[3] + 1 - AY); }
    const half = Math.ceil(Math.max(L, Rr)) + 1, w = half * 2, top = Math.ceil(Tt) + 1, h = top + Math.ceil(Bm) + 1, x0 = Math.floor(AX) - half, y0 = Math.floor(AY) - top;
    const out = document.createElement('canvas'); out.width = w * 8; out.height = h * idx.length; const g = out.getContext('2d'); idx.forEach((j, jj) => cells[j].forEach(({ c }, i) => g.drawImage(c, x0, y0, w, h, i * w, jj * h, w, h)));
    return { canvas: out, meta: [w, h, +(AX - x0).toFixed(1), +(AY - y0).toFixed(1), idx.length], rows: idx.map(j => frames[j].n) }; };
  const all = crop(frames.map((_, j) => j));
  const parts = (o.split || []).map(([name, re]) => Object.assign({ name }, crop(frames.map((f, j) => re.test(f.n) ? j : -1).filter(j => j >= 0))));
  return { canvas: all.canvas, parts, joints: JR, meta: all.meta, rows: all.rows, ms: Math.round(performance.now() - t0), sculptMs: Math.round(st.sculpt), renderMs: Math.round(st.render), tris: st.tris, verts: st.verts };
}
const enc = (c, q = 0.8) => { const u = c.toDataURL('image/webp', q); return { url: u, bytes: Math.round((u.length - u.indexOf(',') - 1) * 0.75) }; };
/* the beasts to render: key → [builder, frames, options] */
/* round 2 board rule (his 2c + 3a): long bases capped at 1.1 tile but the FIGURE drawn +30% (round bases: +15% like the gladiators);
   each sheet is rendered at the size it is drawn at zoom ×2 (tile 104 px): long base → 1.1·104/long mm, round → 0.8·104/25.4 ≈ the minis' 3.143 */
const DRAWN = (b) => b[0] > 30 ? 1.1 * 104 / b[0] : PXMM;
export const BEASTS = {
  leo: { sp: 'lion', base: [72, 42], rim: '#3a1a18', box: 150, ty: 16, sc: 1.15 * 1.3, split: [['leo', /^(idle|walk)/], ['leo_act', /^(attack|hit|die)/]] }, leaena: { sp: 'lioness', base: [72, 42], rim: '#3a1a18', box: 146, ty: 16, sc: 1.15 * 1.3 },
  ursa: { sp: 'bear', base: [75, 47], rim: '#7b2c17', box: 150, ty: 19, sc: 1.3 }, brutum: { sp: 'bear', base: [75, 47], rim: '#7b2c17', box: 150, ty: 19, sc: 1.3 },
  valencia: { sp: 'wolf', base: [25.4, 25.4], rim: '#3a2214', box: 70, ty: 9, sc: 1.15 }, moechus: { sp: 'wolf', base: [25.4, 25.4], rim: '#3a2214', box: 70, ty: 9, sc: 1.15 },
  glykon: { snake: 'glykon', base: [25.4, 25.4], rim: '#c4a35a', box: 56, ty: 7, sc: 1.15 }, arenosus: { snake: 'arenosus', base: [25.4, 25.4], rim: '#c4a35a', box: 56, ty: 7, sc: 1.15 },
  zora: { eagle: 1, base: [25.4, 25.4], rim: '#4a2016', box: 62, ty: 9, sc: 1.15 * 0.72 }, boar: { sp: 'boar', base: [25.4, 25.4], rim: '#3a2a1e', box: 64, ty: 8, sc: 1.15 },
  croc: { sp: 'croc', base: [75, 34], rim: '#2e3a2a', box: 160, ty: 6, sc: 1.3 }, spider: { spider: 1, base: null, box: 34, ty: 3, sc: 1 },
};
window.BEASTS_KEYS = () => BEASTS;
window.BEAST300 = {
  async render(key, opt = {}) {
    const B = BEASTS[key]; let build, frames, h;
    if (B.sp) { const v = VARIANTS[key] || [B.sp]; const S = SPECIES[B.sp]; const COL = Object.assign({}, S.col, v[1] || {}); build = (f) => quad(S, f, COL); frames = quadFrames(B.sp); h = S.h; }
    else if (B.snake) { build = (f) => snakeFrame(f, SNAKES[B.snake]); frames = snakeFrames(); h = 0.26; }
    else if (B.eagle) { build = eagleFrame; frames = eagleFrames(); h = 0.32; }
    else { build = spiderFrame; frames = spiderFrames(); h = 0.22; }
    if (opt.only) frames = frames.filter(f => opt.only.includes(f.n));
    if (opt.h) h = opt.h;
    if (opt.diag) frames = frames.filter(f => f.n === 'idle0');
    const r = await sheet(build, frames, { split: opt.diag || opt.only ? null : B.split, base: B.base, rim: B.rim, box: B.box, ty: B.ty, h, sc: B.sc, pxmm: opt.diag ? 6 / (B.sc || 1) * 1.2 : (B.base ? DRAWN(B.base) : PXMM) });
    window.BSHEET = window.BSHEET || {}; BSHEET[key] = r;
    const parts = r.parts.map(p => { const e = enc(p.canvas); return { name: p.name, meta: p.meta, rows: p.rows, kb: +(e.bytes / 1024).toFixed(1), webp: e.url, decodedMB: +(p.meta[0] * p.meta[1] * 4 * 8 * p.rows.length / 1048576).toFixed(2) }; });
    const w8 = enc(r.canvas); const idleWalk = frames.filter(f => /^(idle|walk)/.test(f.n)).length;
    return { key, meta: r.meta, rows: r.rows, ms: r.ms, sculptMs: r.sculptMs, renderMs: r.renderMs, tris: r.tris, verts: r.verts, h, kb: +(w8.bytes / 1024).toFixed(1), png: r.canvas.toDataURL('image/png'),
      decodedMB: +(r.meta[0] * r.meta[1] * 4 * 8 * r.rows.length / 1048576).toFixed(2), idleWalkMB: +(r.meta[0] * r.meta[1] * 4 * 8 * idleWalk / 1048576).toFixed(2), frames: r.rows.length, parts, joints: opt.diag ? r.joints[0] : null, pxmm: opt.diag ? 0 : (B.base ? DRAWN(B.base) : PXMM), sc: B.sc };
  },
};
window.BEAST300_READY = true;
