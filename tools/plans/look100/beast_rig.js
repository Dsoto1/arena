/* =====================================================================
   look100/beast_rig.js — v1.0 LOOK TEST (not game code): the BEASTS as sculpted 3D tokens with animation frames.
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
  else if (pat === 'mane') { const s = 0.7 + 0.55 * vnoise(p[0] * 1.3, p[1] * 1.3, p[2] * 1.3); c = mul(c, s); }
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
    for (let k = 0; k < 3; k++) { let v = c[k] * (0.55 + 0.45 * a2) * (0.9 + 0.18 * up); v = v + (Math.min(1, c[k] * 1.45 + 0.1) - v) * wear * (P.m.dry != null ? P.m.dry : 0.6); col[i * 3 + k] = Math.pow(cl(v, 0, 1), 2.2); } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setIndex(nv > 65535 ? new THREE.Uint32BufferAttribute(sn.tri, 1) : new THREE.Uint16BufferAttribute(sn.tri, 1));
  return { geo, verts: nv, tris: sn.tri.length / 3, cells: fd.nx * fd.ny * fd.nz };
}

/* ======================= QUADRUPEDS ======================= */
/* 2-bone IK: A → knee → T, bend toward pole */
function ik2(A, T, L1, L2, pole) { let d = sub(T, A); let D = len(d); const mx = (L1 + L2) * 0.999; if (D > mx) { d = mul(nrm(d), mx); D = mx; T = add(A, d); } D = Math.max(D, Math.abs(L1 - L2) + 0.01);
  const u = nrm(d); let v = sub(pole, mul(u, dot(pole, u))); v = len(v) < 1e-5 ? [0, 1, 0] : nrm(v); const ca = cl((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D), -1, 1); const sa = Math.sqrt(1 - ca * ca);
  return [add(A, add(mul(u, L1 * ca), mul(v, L1 * sa))), T]; }
export const SPECIES = {
  lion: { kind: 'quad', base: [72, 42], h: 0.55, L: 10.5, y: 13.5, chest: [6.4, 7.6, 8.4], belly: [5.6, 6.0, 8], hips: [5.6, 6.6, 6.6], fx: 3.6, hx: 3.4, legF: [7.8, 7.4, 2.6], legH: [8.6, 7.6, 4.6], rF: [2.7, 1.8, 1.5], rH: [3.0, 1.7, 1.4], paw: [2.1, 1.2, 2.6],
    neck: [6.5, 2.8], head: [3.6, 3.7, 4.1], muz: [4.2, 2.2], ears: 'round', mane: [7.4, 7.6, 7.2], tail: [21, 0.95, 0.5], tuft: 1.8,
    col: { fur: '#c99848', u: '#e8cc90', mane: '#7a4a20', nose: '#3a2418', dark: '#1a120c', tuft: '#5a3416', claw: '#e8dcc0' } },
  lioness: { kind: 'quad', base: [72, 42], h: 0.55, L: 10.0, y: 12.6, chest: [5.6, 6.8, 7.8], belly: [4.9, 5.4, 7.6], hips: [5.0, 6.0, 6.2], fx: 3.2, hx: 3.1, legF: [7.4, 7.0, 2.5], legH: [8.2, 7.2, 4.4], rF: [2.3, 1.6, 1.3], rH: [2.6, 1.5, 1.25], paw: [1.9, 1.1, 2.4],
    neck: [6.4, 2.6], head: [3.2, 3.3, 3.8], muz: [3.9, 1.9], ears: 'round', tail: [20, 0.85, 0.45], tuft: 1.3,
    col: { fur: '#c9a060', u: '#ead2a0', nose: '#3a2418', dark: '#1a120c', tuft: '#5a3416', claw: '#e8dcc0' } },
  bear: { kind: 'quad', base: [75, 47], h: 0.6, L: 10.5, y: 16.5, chest: [8.4, 9.4, 9.0], belly: [8.0, 8.6, 9], hips: [8.0, 9.2, 8.0], fx: 4.6, hx: 4.4, legF: [8.0, 7.6, 3.0], legH: [8.4, 7.4, 4.2], rF: [3.6, 2.8, 2.4], rH: [3.8, 2.6, 2.3], paw: [2.8, 1.4, 3.4],
    neck: [5.5, 4.4], head: [4.6, 4.6, 4.6], muz: [4.4, 2.6], ears: 'bear', tail: [4, 1.6, 1.0], hump: 1,
    col: { fur: '#6b4526', u: '#5a3a20', muz: '#a07848', nose: '#1a120c', dark: '#120c08', claw: '#e8dcc0' } },
  wolf: { kind: 'quad', base: [25.4, 25.4], h: 0.4, L: 6.0, y: 9.4, chest: [3.3, 4.4, 4.8], belly: [2.8, 3.2, 4.6], hips: [3.0, 3.6, 3.8], fx: 2.0, hx: 1.9, legF: [5.2, 5.0, 2.0], legH: [5.8, 5.2, 3.2], rF: [1.4, 0.95, 0.8], rH: [1.7, 0.9, 0.75], paw: [1.1, 0.7, 1.5],
    neck: [4.2, 1.9], head: [2.4, 2.4, 2.6], muz: [3.2, 1.2], ears: 'pointy', tail: [11, 1.2, 0.6], brush: 1,
    col: { fur: '#7d7f84', u: '#d9d4c8', muz: '#c8c2b4', nose: '#141210', dark: '#141210', claw: '#d8d0c0' } },
  boar: { kind: 'quad', base: [25.4, 25.4], h: 0.4, L: 5.6, y: 8.2, chest: [4.4, 5.2, 5.2], belly: [4.2, 4.6, 5], hips: [4.0, 4.6, 4.2], fx: 2.3, hx: 2.2, legF: [4.0, 3.6, 1.4], legH: [4.4, 3.6, 2.2], rF: [1.6, 1.0, 0.8], rH: [1.9, 1.0, 0.8], paw: [0.9, 0.9, 1.1],
    neck: [2.6, 3.4], head: [3.0, 3.2, 3.6], muz: [3.6, 2.0], ears: 'pointy', tail: [4, 0.5, 0.35], tusks: 1, ridge: 1,
    col: { fur: '#4a3426', u: '#3a2a1e', muz: '#8a6a58', nose: '#5a3a30', dark: '#120c08', claw: '#2a2018', tusk: '#efe6cc' } },
  croc: { kind: 'quad', base: [75, 34], h: 0.5, L: 9.5, y: 3.4, chest: [5.0, 2.6, 6.0], belly: [5.2, 2.6, 6.5], hips: [4.6, 2.5, 5.0], fx: 5.0, hx: 4.6, legF: [3.6, 3.2, 1.2], legH: [4.2, 3.6, 1.6], rF: [1.3, 1.0, 0.8], rH: [1.6, 1.1, 0.9], paw: [1.4, 0.5, 1.6], sprawl: 1,
    neck: [2.4, 2.8], head: [2.8, 1.8, 3.4], muz: [10, 1.6], ears: null, tail: [26, 2.6, 0.3], scutes: 1, croc: 1,
    col: { fur: '#55633a', u: '#c8bf86', muz: '#55633a', nose: '#2a3018', dark: '#141a0c', claw: '#d8d0b0', tooth: '#efe8d0' } },
};
/* variants = a recolour of a species (one model, his named tokens) */
export const VARIANTS = {
  leo: ['lion'], leaena: ['lioness'], ursa: ['bear'], brutum: ['bear', { fur: '#4e3220', u: '#3e2818', muz: '#8a6038' }],
  valencia: ['wolf', { fur: '#9a6a3a', u: '#e2cfa8', muz: '#d8c4a0' }], moechus: ['wolf', { fur: '#3a393c', u: '#6a6a6e', muz: '#5a5a5e' }],
  boar: ['boar'], croc: ['croc'],
};
function quad(S, f, COL) {
  const P = [], C = COL;
  const M = (c, p, extra) => Object.assign({ c, p }, extra || {});
  const FUR = M(C.fur, S.croc ? 'scale' : 'fur', { u: C.u, dry: S.croc ? 0.45 : 0.6 }), DARK = M(C.dark, null, { dry: 0.3 }), NOSE = M(C.nose, null, { dry: 0.8 }), CLAW = M(C.claw, null, { dry: 0.4 });
  const pitch = (f.pitch || 0) * D2R, roll = (f.roll || 0) * D2R, yawB = (f.yaw || 0) * D2R;
  const R = mm(Ry(yawB), mm(Rz(roll), Rx(-pitch)));
  const root = [f.x || 0, (f.y != null ? f.y : S.y) + (f.dy || 0), f.z || 0];
  const T = (p) => add(mv(R, p), root);
  const br = 1 + (f.breath || 0) * 0.035;
  const arch = f.arch || 0;
  /* body */
  P.push(ell(T([0, (S.hump ? 1.2 : 0.4), S.L * 0.62]), mul(S.chest, br), R, S.L * 0.35, FUR));
  P.push(ell(T([0, arch - 0.6, 0]), [S.belly[0] * br, S.belly[1] * br, S.belly[2]], R, S.L * 0.4, FUR));
  P.push(ell(T([0, 0.2, -S.L * 0.62]), S.hips, R, S.L * 0.35, FUR));
  if (S.hump) P.push(ell(T([0, S.chest[1] * 0.75, S.L * 0.5]), [S.chest[0] * 0.6, S.chest[1] * 0.45, S.chest[2] * 0.5], R, 2.5, FUR));
  if (S.ridge) P.push(cap(T([0, S.chest[1] * 0.95, S.L * 0.75]), T([0, S.hips[1] * 0.8, -S.L * 0.4]), 1.0, 0.5, 1.4, M(C.dark, 'mane')));
  if (S.scutes) for (let i = -3; i <= 3; i++) for (const sx of [-1, 1]) P.push(sph(T([sx * 1.3, S.chest[1] * 0.92, i * S.L * 0.28]), 0.6, 0.3, FUR));
  /* head + neck */
  const hp = (f.head ? f.head[0] : 0) * D2R, hy = (f.head ? f.head[1] : 0) * D2R;
  const NB = T([0, S.chest[1] * 0.35, S.L * 0.62 + S.chest[2] * 0.55]);
  const neckPitch = (S.croc ? 5 : S.y > 15 ? 18 : 32) * D2R;
  const nd = mv(R, [Math.sin(hy) * Math.cos(neckPitch + hp * 0.5), Math.sin(neckPitch + hp * 0.5), Math.cos(hy) * Math.cos(neckPitch + hp * 0.5)]);
  const NE = add(NB, mul(nrm(nd), S.neck[0]));
  P.push(cap(NB, NE, S.neck[1] * 1.15, S.neck[1], S.neck[1] * 0.9, FUR));
  const hdPitch = hp - (S.croc ? 0.05 : 0.35) + (pitch * 0.4);
  const hd = nrm([Math.sin(hy) * Math.cos(hdPitch) , Math.sin(hdPitch), Math.cos(hy) * Math.cos(hdPitch)]); const HF = frame(mv(Ry(yawB), [hd[0], hd[1], hd[2]]), mv(mm(Ry(yawB), Rz(roll)), [0, 1, 0]));
  const HC = add(NE, mul(HF[2], S.head[2] * 0.25));
  const H = (p) => add(HC, add(add(mul(HF[0], p[0]), mul(HF[1], p[1])), mul(HF[2], p[2])));
  P.push(ell(HC, S.head, HF, 1.2, FUR));
  const jaw = (f.jaw || 0) * D2R;
  const mz0 = H([0, -S.head[1] * 0.15, S.head[2] * 0.4]), mz1 = H([0, -S.head[1] * 0.25, S.head[2] * 0.4 + S.muz[0]]);
  P.push(cap(mz0, mz1, S.muz[1] * 1.1, S.muz[1] * (S.croc ? 0.75 : 0.85), 0.9, C.muz ? M(C.muz, 'fur', { u: C.u }) : FUR));
  /* the lower jaw hinges down */
  const jd = nrm(add(mul(HF[2], Math.cos(jaw)), mul(HF[1], -Math.sin(jaw))));
  const j0 = H([0, -S.head[1] * 0.55, S.head[2] * 0.2]), j1 = add(j0, mul(jd, S.muz[0] + S.head[2] * 0.15));
  P.push(cap(j0, j1, S.muz[1] * 0.7, S.muz[1] * 0.55, jaw > 0.05 ? 0.25 : 0.7, C.muz ? M(C.muz, 'fur', { u: C.u }) : FUR));
  if (jaw > 0.05) { P.push(cap(add(mz0, mul(HF[1], -S.muz[1] * 0.9)), add(j0, mul(jd, S.muz[0] * 0.5)), S.muz[1] * 0.45, S.muz[1] * 0.3, 0.2, M('#7a1c1a', null, { dry: 0.2 })));   /* the mouth inside */
    for (const t of [0.75, 0.95]) for (const sx of [-1, 1]) { P.push(cap(add(lerp(mz0, mz1, t), add(mul(HF[0], sx * S.muz[1] * 0.45), mul(HF[1], -S.muz[1] * 0.7))), add(lerp(mz0, mz1, t), add(mul(HF[0], sx * S.muz[1] * 0.45), mul(HF[1], -S.muz[1] * 1.25))), 0.28, 0.08, 0, M(C.tooth || '#f2ead6', null, { dry: 0.3 }))); } }
  P.push(sph(add(mz1, mul(HF[1], S.muz[1] * 0.55)), S.muz[1] * 0.42, 0.3, NOSE));
  for (const sx of [-1, 1]) P.push(sph(H([sx * S.head[0] * 0.48, S.head[1] * 0.25, S.head[2] * 0.62]), Math.max(0.35, S.head[0] * 0.12), 0.1, DARK));
  if (S.ears === 'round' || S.ears === 'bear') for (const sx of [-1, 1]) P.push(ell(H([sx * S.head[0] * 0.62, S.head[1] * 0.85, -S.head[2] * 0.1]), [S.head[0] * 0.28, S.head[1] * 0.3, S.head[2] * 0.14], HF, 0.4, FUR));
  if (S.ears === 'pointy') for (const sx of [-1, 1]) P.push(cap(H([sx * S.head[0] * 0.5, S.head[1] * 0.6, -S.head[2] * 0.1]), H([sx * S.head[0] * 0.65, S.head[1] * 1.55, -S.head[2] * 0.15]), S.head[0] * 0.3, 0.12, 0.3, FUR));
  if (S.mane) { P.push(ell(add(NE, mul(HF[2], -S.head[2] * 0.25)), S.mane, HF, 1.8, M(C.mane, 'mane', { dry: 0.75 }))); P.push(ell(add(NB, [0, S.chest[1] * 0.35, 0]), [S.mane[0] * 0.85, S.mane[1] * 0.9, S.mane[2] * 0.8], R, 2.2, M(C.mane, 'mane', { dry: 0.75 }))); }
  if (S.tusks) for (const sx of [-1, 1]) P.push(cap(H([sx * S.muz[1] * 0.8, -S.head[1] * 0.25, S.head[2] * 0.4 + S.muz[0] * 0.7]), H([sx * S.muz[1] * 1.3, S.head[1] * 0.25, S.head[2] * 0.4 + S.muz[0] * 0.55]), 0.4, 0.12, 0.2, M(C.tusk, null, { dry: 0.3 })));
  if (S.croc) for (let i = 1; i <= 6; i++) for (const sx of [-1, 1]) P.push(cap(add(lerp(mz0, mz1, i / 7), mul(HF[0], sx * S.muz[1] * 0.85)), add(lerp(mz0, mz1, i / 7), add(mul(HF[0], sx * S.muz[1] * 0.85), mul(HF[1], -0.9))), 0.22, 0.06, 0, M(C.tooth, null)));
  /* legs */
  const legs = [['LF', 1, 1], ['RF', -1, 1], ['LH', 1, -1], ['RH', -1, -1]];
  for (const [k, sx, fr] of legs) {
    const front = fr > 0, Ls = front ? S.legF : S.legH, Rr = front ? S.rF : S.rH;
    const top = T([sx * (front ? S.fx : S.hx), front ? -S.chest[1] * 0.1 : 0.2, fr * S.L * 0.78]);
    const off = (f.feet && f.feet[k]) || [0, 0, 0];
    const spread = S.sprawl ? (front ? S.fx * 2.1 : S.hx * 2.2) : (front ? S.fx : S.hx) * 0.9;
    let foot;
    if (f.feetLocal) foot = T([sx * spread + (off[2] || 0) * 0 + (f.feetLocal[k] ? f.feetLocal[k][0] * sx : 0), f.feetLocal[k] ? f.feetLocal[k][1] : -S.y, fr * S.L * 0.8 + (f.feetLocal[k] ? f.feetLocal[k][2] : 0)]);
    else { const r0 = T([sx * spread, 0, fr * S.L * 0.8]); foot = [r0[0] + (off[3] || 0) * sx, off[1] || 0, r0[2] + (off[0] || 0)]; if (f.feetRel) foot[1] = Math.max(0, foot[1]); }
    const up = f.feetLocal ? mv(R, [0, 1, 0]) : [0, 1, 0];
    const lowP = add(foot, add(mul(up, Ls[2]), mv(Ry(yawB), [0, 0, front ? -Ls[2] * 0.05 : -Ls[2] * 0.42])));
    const pole = S.sprawl ? add(mv(R, [sx * 1, 0.6, 0]), [0, 0, 0]) : mv(R, front ? [0, -0.1, -1] : [0, -0.1, 1]);
    const [knee, low] = ik2(top, lowP, Ls[0], Ls[1], pole);
    P.push(ell(lerp(top, knee, 0.3), [Rr[0] * 1.15, Rr[0] * 1.3, Rr[0] * 1.15], R, 1.2, FUR));
    P.push(cap(top, knee, Rr[0], Rr[1] * 1.15, 1.0, FUR)); P.push(cap(knee, low, Rr[1] * 1.1, Rr[2], 0.6, FUR)); P.push(cap(low, add(foot, mul(up, S.paw[1] * 0.6)), Rr[2], Rr[2] * 0.95, 0.4, FUR));
    const fwd = mv(Ry(yawB), [0, 0, 1]); const PF = frame(f.feetLocal ? mv(R, [0, 0, 1]) : fwd, up);
    P.push(ell(add(foot, add(mul(up, S.paw[1] * 0.75), mul(PF[2], S.paw[2] * 0.35))), S.paw, PF, 0.5, FUR));
    if (!S.croc && S.claws !== 0) for (let c = -1; c <= 1; c++) P.push(cap(add(foot, add(mul(PF[0], c * S.paw[0] * 0.45), add(mul(PF[2], S.paw[2] * 1.05), mul(up, S.paw[1] * 0.5)))), add(foot, add(mul(PF[0], c * S.paw[0] * 0.5), add(mul(PF[2], S.paw[2] * 1.4), mul(up, S.paw[1] * 0.15)))), 0.22, 0.08, 0, CLAW));
  }
  /* tail */
  if (S.tail) { const [Lt, r0, r1] = S.tail; const N = S.croc ? 10 : 8; let p = T([0, S.hips[1] * (S.croc ? 0.1 : 0.4), -S.L * 0.62 - S.hips[2] * 0.7]);
    let a = ((f.tail ? f.tail[0] : 0) + (S.croc ? -6 : S.brush ? -35 : -55)) * D2R, sw = (f.tail ? f.tail[1] : 0) * D2R;
    for (let i = 0; i < N; i++) { const t = i / N; const dir = mv(R, [Math.sin(sw * (0.3 + t)) * Math.cos(a), Math.sin(a), -Math.cos(sw * (0.3 + t)) * Math.cos(a)]); const q = add(p, mul(nrm(dir), Lt / N));
      if (S.croc && q[1] < 0.9) q[1] = 0.9 + (q[1] - 0.9) * 0.1;
      const ra = r0 + (r1 - r0) * t, rb = r0 + (r1 - r0) * (t + 1 / N); P.push(cap(p, q, S.brush ? ra * (1 + 0.6 * Math.sin(t * Math.PI)) : ra, S.brush ? rb * (1 + 0.6 * Math.sin((t + 1 / N) * Math.PI)) : rb, 0.4, S.brush ? M(C.fur, 'mane', { u: C.u }) : FUR, { t }));
      if (S.scutes && i % 2 === 0) P.push(sph(add(q, mul(mv(R, [0, 1, 0]), ra * 0.8)), ra * 0.35, 0.2, FUR));
      p = q; a += ((f.tail ? f.tail[2] || 0 : 0) + (S.croc ? 0.5 : 9)) * D2R; }
    if (S.tuft) P.push(ell(p, [S.tuft, S.tuft * 1.3, S.tuft], R, 0.6, M(C.tuft, 'mane'))); }
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
    lion: [{ dy: -Y * 0.28, pitch: -6, head: [-12, 0], tail: [25, 10, 0], feet: { LH: [2, 0], RH: [2, 0] } },
      { dy: -Y * 0.35, z: -L * 0.2, pitch: 6, head: [-6, 0], tail: [30, 0, 0], feet: { LH: [4, 0], RH: [4, 0], LF: [1, 0], RF: [1, 0] } },
      { dy: Y * 0.45, z: L * 0.4, pitch: 26, head: [8, 0], jaw: 26, tail: [5, 0, -4], feet: { LF: [L * 0.7, Y * 0.55], RF: [L * 0.8, Y * 0.62], LH: [-L * 0.6, Y * 0.12], RH: [-L * 0.55, Y * 0.12] } },
      { dy: Y * 0.3, z: L * 0.9, pitch: -10, head: [-10, 0], jaw: 34, tail: [10, 0, -2], feet: { LF: [L * 1.1, Y * 0.18], RF: [L * 1.2, Y * 0.22], LH: [L * 0.2, Y * 0.3], RH: [L * 0.1, Y * 0.32] } },
      { dy: -Y * 0.08, z: L * 0.5, pitch: -3, head: [-4, 0], jaw: 10, feet: { LF: [L * 0.55, 0], RF: [L * 0.6, 0], LH: [L * 0.35, 0], RH: [L * 0.3, 0] } }],
    bear: [{ pitch: 22, dy: Y * 0.15, head: [10, 0], feet: { LF: [L * 0.2, Y * 0.35], RF: [L * 0.2, Y * 0.3], LH: [L * 0.25, 0], RH: [L * 0.25, 0] } },
      { pitch: 58, dy: Y * 0.35, z: -L * 0.3, head: [20, 0], jaw: 30, feet: { LF: [L * 0.1, Y * 1.4, 0, 2], RF: [L * 0.2, Y * 1.5, 0, 2], LH: [L * 0.5, 0], RH: [L * 0.5, 0] } },
      { pitch: 55, dy: Y * 0.3, z: -L * 0.2, yaw: -14, head: [10, -15], jaw: 38, feet: { LF: [L * 0.6, Y * 1.0, 0, -3], RF: [L * 0.2, Y * 1.55], LH: [L * 0.5, 0], RH: [L * 0.5, 0] } },
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
export const SNAKES = { glykon: { c: '#b9a23a', b: '#3a2a10', u: '#e8d8a0', p: 'band', nb: 18 }, arenosus: { c: '#c8a46a', b: '#6a4a26', u: '#efe0bc', p: 'diam' } };
function snakeFrame(f, col) {
  const P = []; const N = 40, Ltot = 62, r = 2.1; const pts = [];
  /* a coil on the base: tail tip at the outside of a spiral, the body winding in, the last part rising as the neck */
  const rise = f.rise != null ? f.rise : 0.25, ext = f.ext || 0, wave = f.wave || 0, ph = f.ph || 0, flat = f.flat || 0;
  for (let i = 0; i <= N; i++) { const s = i / N; let x, y, z;
    if (s < 1 - rise) { const u = s / (1 - rise); const a = (f.turn || 0) + u * Math.PI * (2.2 - flat * 1.4) ; const R = (9.5 - u * 5.5) * (1 + flat * 0.5); x = Math.cos(a) * R + Math.sin(u * 8 + ph) * wave; z = Math.sin(a) * R - 1 + Math.cos(u * 8 + ph) * wave * 0.5; y = r * 0.95; }
    else { const u = (s - (1 - rise)) / rise; const a0 = (f.turn || 0) + Math.PI * (2.2 - flat * 1.4); const R0 = 4 * (1 + flat * 0.5); const bx = Math.cos(a0) * R0, bz = Math.sin(a0) * R0 - 1;
      x = bx * (1 - u) + Math.sin(u * 3 + ph) * (1.5 + wave) * u; z = bz * (1 - u) + u * (2 + ext * 10); y = r * 0.95 + (f.h != null ? f.h : 9) * Math.sin(u * Math.PI / 2) * (1 - flat); }
    pts.push([x, y, z]); }
  for (let i = 0; i < N; i++) { const s = i / N; const rr = (s < 0.12 ? 0.35 + 0.65 * s / 0.12 : s > 0.9 ? 1 - (s - 0.9) * 2.5 : 1) * r; const rr2 = ((s + 1 / N) < 0.12 ? 0.35 + 0.65 * (s + 1 / N) / 0.12 : (s + 1 / N) > 0.9 ? 1 - ((s + 1 / N) - 0.9) * 2.5 : 1) * r;
    P.push(cap(pts[i], pts[i + 1], rr, rr2, 0.5, { c: col.c, b: col.b, u: col.u, p: col.p, nb: col.nb, dry: 0.5 }, { t: s })); }
  /* head */
  const hd = nrm(sub(pts[N], pts[N - 3])); const HF = frame(add(hd, [0, -0.15 - (f.headDown || 0), 0]));
  const HC = add(pts[N], mul(HF[2], 1.6)); const H = (p) => add(HC, add(add(mul(HF[0], p[0]), mul(HF[1], p[1])), mul(HF[2], p[2])));
  P.push(ell(HC, [2.1, 1.3, 2.9], HF, 0.8, { c: col.c, p: 'none', u: col.u, dry: 0.6 }));
  const jaw = (f.jaw || 0) * D2R; if (jaw > 0.05) { const jd = nrm(add(mul(HF[2], Math.cos(jaw)), mul(HF[1], -Math.sin(jaw)))); const j0 = H([0, -0.6, -1.4]); P.push(cap(j0, add(j0, mul(jd, 3.6)), 1.0, 0.6, 0.2, { c: col.u, p: 'none' }));
    P.push(sph(H([0, -0.9, 0.6]), 0.9, 0.1, { c: '#8a2420', dry: 0.2 })); for (const sx of [-1, 1]) P.push(cap(H([sx * 0.6, -0.9, 2.2]), H([sx * 0.6, -2.1, 2.0]), 0.22, 0.05, 0, { c: '#f4eedc' })); }
  for (const sx of [-1, 1]) P.push(sph(H([sx * 1.25, 0.45, 1.0]), 0.42, 0.05, { c: '#120c08', dry: 0.9 }));
  if (f.tongue) { const t0 = H([0, -0.4, 2.8]); P.push(cap(t0, add(t0, mul(HF[2], 2.2)), 0.18, 0.12, 0.05, { c: '#c0281e' })); }
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
  const P = []; const BR = { c: '#6a4426', p: 'feath', u: '#4a2e18', dry: 0.7 }, GOLD = { c: '#c99a4a', p: 'feath', dry: 0.7 }, BEAK = { c: '#e0b040', dry: 0.5 }, TAL = { c: '#e6c040', dry: 0.4 }, DK = { c: '#141008', dry: 0.9 }, TIP = { c: '#3a2614', p: 'feath', dry: 0.6 };
  const lift = f.lift || 0, pitch = (f.pitch || 0) * D2R, roll = (f.roll || 0) * D2R; const R = mm(Rz(roll), Rx(-pitch)); const root = [0, 8.2 + lift, f.z || 0]; const T = (p) => add(mv(R, p), root);
  P.push(ell(T([0, 0, 0]), [3.4, 3.7, 5.4], mm(R, Rx(-0.25)), 1.4, BR));
  P.push(ell(T([0, 1.9, 2.6]), [2.6, 2.6, 2.6], R, 1.2, BR));
  /* head */
  const hp = (f.head ? f.head[0] : 0) * D2R, hy = (f.head ? f.head[1] : 0) * D2R; const HF = frame(mv(R, [Math.sin(hy), Math.sin(hp), Math.cos(hy) * Math.cos(hp)]), mv(R, [0, 1, 0]));
  const HC = T([0, 4.6, 3.6]); const H = (p) => add(HC, add(add(mul(HF[0], p[0]), mul(HF[1], p[1])), mul(HF[2], p[2])));
  P.push(ell(HC, [1.9, 2.0, 2.3], HF, 0.9, GOLD));
  P.push(cap(H([0, 0.3, 1.6]), H([0, -0.4, 3.4]), 0.9, 0.45, 0.4, BEAK)); P.push(cap(H([0, -0.4, 3.4]), H([0, -1.3, 3.2]), 0.42, 0.15, 0.2, BEAK));
  for (const sx of [-1, 1]) P.push(sph(H([sx * 1.15, 0.45, 1.2]), 0.42, 0.05, DK));
  /* wings: shoulder → elbow → wrist → tip, with feather plates; spread 0 (folded along the back) .. 1, flap = raise angle */
  const sp = f.spread || 0, fl = (f.flap || 0) * D2R;
  for (const sx of [-1, 1]) {
    const S0 = T([sx * 2.6, 1.6, 1.8]);
    const out = (a) => mv(R, nrm([sx * Math.cos(fl) * a, Math.sin(fl) * a + (1 - a) * 0.15, -(1 - a)]));
    const E = add(S0, mul(out(sp * 0.9 + 0.05), 5.2)), W = add(E, mul(nrm(add(out(sp), mv(R, [0, 0, -(1 - sp) * 0.6]))), 6)), Tp = add(W, mul(nrm(add(out(sp * 0.95), mv(R, [0, -0.05, -0.35 - (1 - sp) * 0.6]))), 8));
    P.push(cap(S0, E, 1.6, 1.3, 0.8, BR)); P.push(cap(E, W, 1.3, 0.9, 0.6, BR));
    /* primaries + secondaries as thin plates trailing back from the arm */
    const back = mv(R, [0, 0, -1]); const nup = nrm(cross(nrm(sub(Tp, S0)), back));
    for (let i = 0; i <= 7; i++) { const t = i / 7; const root2 = lerp(E, Tp, t); const fd = nrm(add(mul(back, 1 - t * 0.5), mul(nrm(sub(Tp, W)), t * 0.8))); const Lf = 4.5 + t * 2.5;
      const F2 = frame(fd, len(nup) > 0.1 ? (dot(nup, [0, 1, 0]) < 0 ? mul(nup, -1) : nup) : [0, 1, 0]); P.push(ell(add(root2, mul(fd, Lf * 0.5)), [1.3, 0.28, Lf * 0.55], F2, 0.25, i > 4 ? TIP : BR)); }
  }
  /* tail fan */
  const tb = T([0, -0.6, -4.8]); for (let i = -2; i <= 2; i++) { const d = mv(R, nrm([i * 0.22, -0.35 + (f.tailUp || 0), -1])); P.push(ell(add(tb, mul(d, 2.6)), [1.0, 0.3, 2.8], frame(d), 0.3, i % 2 ? TIP : BR)); }
  /* legs + talons (perched on the base when lift is 0; reaching forward in the strike) */
  const reach = f.talons || 0;
  for (const sx of [-1, 1]) { const hip = T([sx * 1.4, -2.2, 0.4]); const foot = lift > 0.5 ? add(hip, mv(R, [sx * 0.3, -4.2 + reach * 1.5, 0.8 + reach * 4.5])) : [sx * 1.5 + root[0] * 0, 0.3, root[2] + 0.8];
    P.push(cap(hip, foot, 0.9, 0.55, 0.4, GOLD)); for (const a of [-0.6, 0, 0.6]) { const d = mv(Ry(a), [0, 0, 1]); P.push(cap(foot, add(foot, add(mul(d, 1.6), [0, -0.25, 0])), 0.35, 0.18, 0.15, TAL)); P.push(cap(add(foot, mul(d, 1.6)), add(foot, add(mul(d, 2.0), [0, -0.6, 0])), 0.16, 0.08, 0, DK)); }
    P.push(cap(foot, add(foot, [0, -0.2, -1.3]), 0.3, 0.15, 0.1, TAL)); }
  return P;
}
export function eagleFrames() { return [
  { n: 'idle0' }, { n: 'idle1', head: [0, 25] }, { n: 'idle2', head: [-5, -20], spread: 0.15 }, { n: 'idle3', head: [5, 5] },
  ...[0, 1, 2, 3, 4, 5].map(t => ({ n: 'walk' + t, lift: 9 + Math.sin(t / 6 * Math.PI * 2) * 1.2, spread: 1, flap: Math.cos(t / 6 * Math.PI * 2) * 38, pitch: -4, tailUp: 0.2 })),
  { n: 'attack0', lift: 12, spread: 1, flap: 50, pitch: 10 }, { n: 'attack1', lift: 10, spread: 0.6, flap: 60, pitch: -25, head: [-25, 0], z: 3 }, { n: 'attack2', lift: 5, spread: 0.9, flap: 20, pitch: 15, talons: 1, z: 6, head: [-10, 0] },
  { n: 'attack3', lift: 3, spread: 1, flap: -10, pitch: 25, talons: 1.2, z: 7, head: [-20, 0] }, { n: 'attack4', lift: 7, spread: 1, flap: 35, pitch: 0, z: 3 },
  { n: 'hit0', spread: 0.6, flap: 30, head: [25, 0], pitch: 10 }, { n: 'hit1', spread: 0.3, flap: 10, head: [-15, 20], roll: 10 }, { n: 'hit2' },
  { n: 'die0', spread: 0.5, flap: 20, head: [-30, 0], roll: 12 }, { n: 'die1', spread: 0.8, flap: -5, head: [-40, 10], roll: 30, lift: -2 }, { n: 'die2', spread: 0.9, flap: -15, head: [-45, 20], roll: 55, lift: -4 },
  { n: 'die3', spread: 1, flap: -20, head: [-50, 30], roll: 75, lift: -5 }, { n: 'die4', spread: 1, flap: -25, head: [-55, 35], roll: 85, lift: -5.5 },
]; }

/* ======================= SPIDER ======================= */
function spiderFrame(f) {
  const P = []; const BODY = { c: '#262019', p: 'fur', dry: 0.7 }, BAND = { c: '#b8ad9c', dry: 0.5 }, LEG = { c: '#2e2620', dry: 0.7 }, EYE = { c: '#9a1a14', dry: 0.9 };
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
  GM = new THREE.DataTexture(new Uint8Array([105, 105, 165, 165, 215, 215, 255, 255]), 8, 1, THREE.RedFormat); GM.needsUpdate = true; GM.minFilter = GM.magFilter = THREE.NearestFilter;
  MATS.body = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: GM });
  const ink = new THREE.MeshBasicMaterial({ color: 0x120c0a, side: THREE.BackSide }); const u = { value: 0.3 }; ink.userData.u = u;
  ink.onBeforeCompile = (sh) => { sh.uniforms.uOut = u; sh.vertexShader = 'uniform float uOut;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normalize(normal) * uOut;'); }; ink.customProgramCacheKey = () => 'beastInk'; MATS.ink = ink;
  MESH = new THREE.Mesh(new THREE.BufferGeometry(), MATS.body); INK = new THREE.Mesh(MESH.geometry, MATS.ink); TURN.add(MESH); TURN.add(INK);
}
/* his base: an oval/round disc, sand top with grain, a coloured rim */
function makeBase(dims, rim) {
  if (BASE) { TURN.remove(BASE); BASE.traverse(o => { if (o.geometry) o.geometry.dispose(); }); BASE = null; } if (!dims) return;
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#b9ab90'; g.fillRect(0, 0, 256, 256);
  let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 900; i++) { g.fillStyle = rnd() < .5 ? 'rgba(90,76,58,.2)' : 'rgba(250,240,220,.24)'; g.beginPath(); g.arc(rnd() * 256, rnd() * 256, rnd() * 1.6 + .4, 0, 7); g.fill(); }
  for (let i = 0; i < 12; i++) { g.strokeStyle = 'rgba(120,100,76,.22)'; g.lineWidth = 3; g.beginPath(); const y = rnd() * 256; g.moveTo(0, y); g.bezierCurveTo(80, y + 16, 170, y - 16, 256, y + 4); g.stroke(); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const H = 3.4, rx = dims[0] / 2, rz = dims[1] / 2; const G = new THREE.Group();
  const geo = new THREE.CylinderGeometry(1 * 0.955, 1, H, 72); geo.scale(rz, 1, rx); geo.rotateY(Math.PI / 2);
  const m = new THREE.Mesh(geo, [new THREE.MeshToonMaterial({ color: new THREE.Color(rim), gradientMap: GM }), new THREE.MeshToonMaterial({ map: tex, gradientMap: GM }), new THREE.MeshToonMaterial({ color: new THREE.Color(rim), gradientMap: GM })]); m.position.y = -H / 2; G.add(m);
  const ig = new THREE.CylinderGeometry(1, 1, H + 0.25, 72); ig.scale(rz + 0.3, 1, rx + 0.3); ig.rotateY(Math.PI / 2); const i2 = new THREE.Mesh(ig, new THREE.MeshBasicMaterial({ color: 0x120c0a, side: THREE.BackSide })); i2.position.y = -H / 2; G.add(i2);
  BASE = G; TURN.add(G);
}
function alphaBox(c) { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; }
/* frames → sheet (rows = frames, 8 MINI_YAW cells), cropped round the base centre (anchor) like minis8 */
async function sheet(build, frames, o) {
  setup(); const t0 = performance.now(); const ss = 2, ppm = PXMM * ss, S = Math.ceil(o.box * ppm / 4) * 4, hw = S / 2 / ppm; const ty = o.ty || 10;
  const cam = new THREE.OrthographicCamera(-hw, hw, hw, -hw, 0.1, 2000); cam.position.set(0, ty + Math.sin(30 * D2R) * 500, Math.cos(30 * D2R) * 500); cam.lookAt(0, ty, 0); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  const dir = new THREE.Vector3(-0.55, 0.85, 0.55).applyQuaternion(cam.quaternion); SUN.position.copy(cam.position).add(dir.multiplyScalar(300)); SUN.target.position.copy(cam.position).add(new THREE.Vector3(0, 0, -500).applyQuaternion(cam.quaternion)); SUN.target.updateMatrixWorld();
  MATS.ink.userData.u.value = (o.ink || 0.85) * ss / ppm;
  makeBase(o.base, o.rim || '#4a3a2a');
  REND.setSize(S, S, false);
  const anc = new THREE.Vector3(0, 0, 0).project(cam); const AX = (anc.x * 0.5 + 0.5) * S / ss, AY = (-anc.y * 0.5 + 0.5) * S / ss;
  const cells = [], st = { sculpt: 0, render: 0, tris: 0, verts: 0 };
  for (const f of frames) { const q0 = performance.now(); const prims = build(f); const r = meshOf(prims, o.h); MESH.geometry.dispose(); MESH.geometry = r.geo; INK.geometry = r.geo; st.tris = Math.max(st.tris, r.tris); st.verts = Math.max(st.verts, r.verts);
    const q1 = performance.now(); st.sculpt += q1 - q0; const row = [];
    for (const yaw of MINI_YAW) { TURN.rotation.y = yaw * D2R; TURN.updateMatrixWorld(true); REND.render(SCENE, cam); let c = document.createElement('canvas'); c.width = S; c.height = S; c.getContext('2d').drawImage(REND.domElement, 0, 0);
      const d = document.createElement('canvas'); d.width = S / 2; d.height = S / 2; const g = d.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, 0, d.width, d.height); row.push({ c: d, box: alphaBox(d) }); }
    TURN.rotation.y = 0; st.render += performance.now() - q1; cells.push(row); await new Promise(ok => setTimeout(ok, 0)); }
  let L = 0, Rr = 0, Tt = 0, Bm = 0; for (const row of cells) for (const { box } of row) { if (box[2] < 0) continue; L = Math.max(L, AX - box[0]); Rr = Math.max(Rr, box[2] + 1 - AX); Tt = Math.max(Tt, AY - box[1]); Bm = Math.max(Bm, box[3] + 1 - AY); }
  const half = Math.ceil(Math.max(L, Rr)) + 1, w = half * 2, top = Math.ceil(Tt) + 1, h = top + Math.ceil(Bm) + 1, x0 = Math.floor(AX) - half, y0 = Math.floor(AY) - top;
  const out = document.createElement('canvas'); out.width = w * 8; out.height = h * cells.length; const g = out.getContext('2d'); cells.forEach((row, j) => row.forEach(({ c }, i) => g.drawImage(c, x0, y0, w, h, i * w, j * h, w, h)));
  return { canvas: out, meta: [w, h, +(AX - x0).toFixed(1), +(AY - y0).toFixed(1), cells.length], rows: frames.map(f => f.n), ms: Math.round(performance.now() - t0), sculptMs: Math.round(st.sculpt), renderMs: Math.round(st.render), tris: st.tris, verts: st.verts };
}
const enc = (c, q = 0.8) => { const u = c.toDataURL('image/webp', q); return { url: u, bytes: Math.round((u.length - u.indexOf(',') - 1) * 0.75) }; };
/* the beasts to render: key → [builder, frames, options] */
export const BEASTS = {
  leo: { sp: 'lion', base: [72, 42], rim: '#5a2a18', box: 120, ty: 12 }, leaena: { sp: 'lioness', base: [72, 42], rim: '#5a2a18', box: 116, ty: 12 },
  ursa: { sp: 'bear', base: [75, 47], rim: '#8a3a22', box: 120, ty: 15 }, brutum: { sp: 'bear', base: [75, 47], rim: '#8a3a22', box: 120, ty: 15 },
  valencia: { sp: 'wolf', base: [25.4, 25.4], rim: '#6a2a1a', box: 62, ty: 8 }, moechus: { sp: 'wolf', base: [25.4, 25.4], rim: '#6a2a1a', box: 62, ty: 8 },
  glykon: { snake: 'glykon', base: [25.4, 25.4], rim: '#b08a2a', box: 50, ty: 6 }, arenosus: { snake: 'arenosus', base: [25.4, 25.4], rim: '#b08a2a', box: 50, ty: 6 },
  zora: { eagle: 1, base: [25.4, 25.4], rim: '#5a2a18', box: 70, ty: 12 }, boar: { sp: 'boar', base: [25.4, 25.4], rim: '#4a3a2a', box: 56, ty: 7 },
  croc: { sp: 'croc', base: [75, 34], rim: '#3a4a3a', box: 130, ty: 5 }, spider: { spider: 1, base: null, box: 34, ty: 3 },
};
window.BEAST100 = {
  async render(key, opt = {}) {
    const B = BEASTS[key]; let build, frames, h;
    if (B.sp) { const v = VARIANTS[key] || [B.sp]; const S = SPECIES[B.sp]; const COL = Object.assign({}, S.col, v[1] || {}); build = (f) => quad(S, f, COL); frames = quadFrames(B.sp); h = S.h; }
    else if (B.snake) { build = (f) => snakeFrame(f, SNAKES[B.snake]); frames = snakeFrames(); h = 0.38; }
    else if (B.eagle) { build = eagleFrame; frames = eagleFrames(); h = 0.32; }
    else { build = spiderFrame; frames = spiderFrames(); h = 0.22; }
    if (opt.only) frames = frames.filter(f => opt.only.includes(f.n));
    if (opt.h) h = opt.h;
    const r = await sheet(build, frames, { base: B.base, rim: B.rim, box: B.box, ty: B.ty, h });
    window.BSHEET = window.BSHEET || {}; BSHEET[key] = r;
    const w8 = enc(r.canvas); const idleWalk = frames.filter(f => /^(idle|walk)/.test(f.n)).length;
    return { key, meta: r.meta, rows: r.rows, ms: r.ms, sculptMs: r.sculptMs, renderMs: r.renderMs, tris: r.tris, verts: r.verts, h, kb: +(w8.bytes / 1024).toFixed(1), png: r.canvas.toDataURL('image/png'),
      decodedMB: +(r.meta[0] * r.meta[1] * 4 * 8 * r.rows.length / 1048576).toFixed(2), idleWalkMB: +(r.meta[0] * r.meta[1] * 4 * 8 * idleWalk / 1048576).toFixed(2), frames: r.rows.length };
  },
};
window.BEAST100_READY = true;
