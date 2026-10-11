/* look100 ROUND 5 — SCULPTED helmets + cuirasses without an outside modeller (look test only, tools/plans/look100).
   Each piece is an SDF sculpt: smooth unions/subtractions, shells, carved grooves, raised bands, rivets, crest fins, grilles as REAL holes
   (a dark liner shows through), embossed muscle relief, overlapping plates. Meshed with body100's surface nets on a fine grid (helmets 2 mm,
   cuirasses 2.5 mm), DECIMATED by vertex clustering (helmets 2.8 mm, cuirasses 4 mm cells, re-projected onto the surface), then BAKED:
   SDF ambient occlusion + edge wear (field curvature) + a painted palette per material (steel, gold that stays gold, bronze, leather, red
   plume, dark liner) into vertex colours. Helmets ride the head bone; cuirasses are skinned from the nearest body vertex so they bend
   with the spine and shoulders. sculpt5(B, key) → { geo, tris, ms } (cached per body); wear5(B, key) → meshes. */
import * as THREE from 'three';
import { surfaceNets100, sampleF100, gradF100 } from './body100.js';
import { JK } from './rig100.js';

/* ---------- SDF bits (metres) ---------- */
const hyp = Math.hypot, cl = (v, a, b) => Math.max(a, Math.min(b, v));
const smin = (a, b, k) => { if (k <= 0) return Math.min(a, b); const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
const smax = (a, b, k) => -smin(-a, -b, k);
const ell = (x, y, z, c, r) => { const qx = (x - c[0]) / r[0], qy = (y - c[1]) / r[1], qz = (z - c[2]) / r[2]; const k0 = hyp(qx, qy, qz), k1 = hyp(qx / r[0], qy / r[1], qz / r[2]); return k1 < 1e-9 ? -Math.min(...r) : k0 * (k0 - 1) / k1; };
const seg = (x, y, z, a, b) => { const abx = b[0] - a[0], aby = b[1] - a[1], abz = b[2] - a[2]; const t = cl(((x - a[0]) * abx + (y - a[1]) * aby + (z - a[2]) * abz) / (abx * abx + aby * aby + abz * abz), 0, 1); return hyp(x - a[0] - abx * t, y - a[1] - aby * t, z - a[2] - abz * t); };
const torY = (x, y, z, c, R, r, sz = 1) => hyp(hyp(x - c[0], (z - c[2]) / sz) - R, y - c[1]) - r;
const ellCyl = (x, z, rx, rz, cz = 0) => (hyp(x / rx, (z - cz) / rz) - 1) * Math.min(rx, rz);
const bx = (lo, hi) => [lo, hi];

/* ---------- the palette (sRGB): base · shade (cavity) · highlight (worn edge) ---------- */
const PAL = {
  steel: ['#c4cad0', '#454c55', '#f6f8fa'], iron: ['#9ba1a9', '#2a2f35', '#e0e5e9'], dsteel: ['#9aa1a8', '#30353b', '#e3e8ec'], silver: ['#d6dade', '#59606a', '#ffffff'],
  gold: ['#e9d88a', '#806b2e', '#fffbe0'], bronze: ['#dcbf7c', '#6e5a2c', '#fff0c8'], red: ['#b3302a', '#4a0f0c', '#e8786a'],
  dark: ['#1c1714', '#0a0807', '#3a302a'], leather: ['#7f4e2c', '#2e1a0e', '#c0926a'], blue: ['#3f66b0', '#18284a', '#9db8ea'], cream: ['#efe4c8', '#8a7a5a', '#ffffff'],
};
const MATS = Object.keys(PAL); const MI = Object.fromEntries(MATS.map((k, i) => [k, i + 1]));
const lin = (h) => { const c = new THREE.Color(h).convertSRGBToLinear(); return [c.r, c.g, c.b]; };
const PALL = Object.fromEntries(Object.entries(PAL).map(([k, v]) => [k, v.map(lin)]));

/* ---------- field → mesh → decimate → bake ---------- */
function* fieldOf(ops, h, pad = 0.01) {
  let lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
  for (const o of ops) if (o.op === 'add') for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], o.box[0][i]); hi[i] = Math.max(hi[i], o.box[1][i]); }
  lo = lo.map(v => v - pad); hi = hi.map(v => v + pad);
  const nx = Math.ceil((hi[0] - lo[0]) / h) + 1, ny = Math.ceil((hi[1] - lo[1]) / h) + 1, nz = Math.ceil((hi[2] - lo[2]) / h) + 1;
  const F = new Float32Array(nx * ny * nz).fill(1), M = new Uint8Array(nx * ny * nz); let n = 0;
  for (const o of ops) {
    if ((++n & 7) === 0) yield;
    const k = o.k || 0, mat = MI[o.mat] || 0, e = k + 0.002;
    const i0 = Math.max(0, Math.floor((o.box[0][0] - e - lo[0]) / h)), i1 = Math.min(nx - 1, Math.ceil((o.box[1][0] + e - lo[0]) / h));
    const j0 = Math.max(0, Math.floor((o.box[0][1] - e - lo[1]) / h)), j1 = Math.min(ny - 1, Math.ceil((o.box[1][1] + e - lo[1]) / h));
    const k0 = Math.max(0, Math.floor((o.box[0][2] - e - lo[2]) / h)), k1 = Math.min(nz - 1, Math.ceil((o.box[1][2] + e - lo[2]) / h));
    for (let kz = k0; kz <= k1; kz++) { const z = lo[2] + kz * h; for (let jy = j0; jy <= j1; jy++) { const y = lo[1] + jy * h; let idx = nx * (jy + ny * kz) + i0;
      for (let ix = i0; ix <= i1; ix++, idx++) { const x = lo[0] + ix * h; const d = o.f(x, y, z); const f0 = F[idx];
        if (o.op === 'add') { const f = smin(f0, d, k); if (d < f0 + 0.0008) M[idx] = mat; F[idx] = f; }
        else { const f = smax(f0, -d, k); if (f > f0 + 1e-6 && mat) M[idx] = mat; F[idx] = f; } } } }
  }
  return { F, M, nx, ny, nz, lo, h };
}
/* a plain field from one function over a box (the cuirasses) */
function* fieldFn(fn, matFn, box, h) {
  const lo = box[0], hi = box[1]; const nx = Math.ceil((hi[0] - lo[0]) / h) + 1, ny = Math.ceil((hi[1] - lo[1]) / h) + 1, nz = Math.ceil((hi[2] - lo[2]) / h) + 1;
  const F = new Float32Array(nx * ny * nz), M = new Uint8Array(nx * ny * nz);
  for (let kz = 0; kz < nz; kz++) { if ((kz & 7) === 0) yield; const z = lo[2] + kz * h; for (let jy = 0; jy < ny; jy++) { const y = lo[1] + jy * h; let idx = nx * (jy + ny * kz);
    for (let ix = 0; ix < nx; ix++, idx++) { const x = lo[0] + ix * h; const d = fn(x, y, z); F[idx] = d; if (d < 0.004) M[idx] = MI[matFn(x, y, z)] || 0; } } }
  return { F, M, nx, ny, nz, lo, h };
}
const run = (g) => { for (;;) { const r = g.next(); if (r.done) return r.value; } };
function matAt(fd, x, y, z) { const i = Math.round((x - fd.lo[0]) / fd.h), j = Math.round((y - fd.lo[1]) / fd.h), k = Math.round((z - fd.lo[2]) / fd.h);
  let best = 0, bd = 9; for (let dk = -1; dk <= 1; dk++) for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const ii = i + di, jj = j + dj, kk = k + dk; if (ii < 0 || jj < 0 || kk < 0 || ii >= fd.nx || jj >= fd.ny || kk >= fd.nz) continue;
    const o = ii + fd.nx * (jj + fd.ny * kk); const m = fd.M[o]; if (!m) continue; const d = Math.abs(fd.F[o]) + 0.0001 * (di * di + dj * dj + dk * dk); if (d < bd) { bd = d; best = m; } } return best; }
/* mesh the field, cluster-decimate, re-project, bake AO + wear + paint */
export function meshField(fd, cell, opts = {}) {
  const sn = run(surfaceNets100(fd)); const n0 = sn.pos.length / 3, tris0 = sn.tri.length / 3;
  const P = sn.pos; const proj = (p) => { for (let it = 0; it < 3; it++) { const f = sampleF100(fd, ...p), g = gradF100(fd, ...p); p = [p[0] - g[0] * f, p[1] - g[1] * f, p[2] - g[2] * f]; } return p; };
  /* vertex clustering */
  const key = new Map(), acc = [], remap = new Int32Array(n0); const nocl = !(cell > 0);
  /* normal-aware: the two faces of a thin shell never merge (6 bins by the field gradient's dominant axis and sign) */
  for (let i = 0; i < n0; i++) { const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2]; const g = gradF100(fd, x, y, z); const ax = Math.abs(g[0]) > Math.abs(g[1]) ? (Math.abs(g[0]) > Math.abs(g[2]) ? 0 : 2) : (Math.abs(g[1]) > Math.abs(g[2]) ? 1 : 2);
    const kk = nocl ? i : Math.floor(x / cell) + ',' + Math.floor(y / cell) + ',' + Math.floor(z / cell) + ',' + (ax * 2 + (g[ax] > 0 ? 1 : 0));
    let id = key.get(kk); if (id === undefined) { id = acc.length; key.set(kk, id); acc.push([0, 0, 0, 0]); } const a = acc[id]; a[0] += x; a[1] += y; a[2] += z; a[3]++; remap[i] = id; }
  const tri = [], seen = new Set();
  for (let t = 0; t < sn.tri.length; t += 3) { const a = remap[sn.tri[t]], b = remap[sn.tri[t + 1]], c = remap[sn.tri[t + 2]]; if (a === b || b === c || a === c) continue;
    const s = [a, b, c].sort((u, v) => u - v).join(','); if (seen.has(s)) continue; seen.add(s); tri.push(a, b, c); }
  const nv = acc.length, pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), mat = new Uint8Array(nv);
  for (let i = 0; i < nv; i++) { const a = acc[i]; const p = proj([a[0] / a[3], a[1] / a[3], a[2] / a[3]]); pos.set(p, i * 3); nor.set(gradF100(fd, ...p), i * 3); mat[i] = matAt(fd, ...p); }
  /* bake: SDF ambient occlusion (5 steps out along the normal) + edge wear (field curvature) + the palette */
  const st = opts.aoStep || 0.0026;
  for (let i = 0; i < nv; i++) { const p = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]], n = [nor[i * 3], nor[i * 3 + 1], nor[i * 3 + 2]];
    let occ = 0; for (let s = 1; s <= 5; s++) { const d = s * st; occ += (d - Math.max(0, sampleF100(fd, p[0] + n[0] * d, p[1] + n[1] * d, p[2] + n[2] * d))) / (1 << s); }
    const ao = cl(1 - occ / st * 0.9, 0, 1);
    const e = Math.max(0.0016, fd.h * 1.25); let lap = 0; for (const [dx, dy, dz] of [[e, 0, 0], [-e, 0, 0], [0, e, 0], [0, -e, 0], [0, 0, e], [0, 0, -e]]) lap += sampleF100(fd, p[0] + dx, p[1] + dy, p[2] + dz); lap = lap / 6 - sampleF100(fd, ...p);
    const wear = cl(lap / e * 2.2 - 0.25, 0, 1);
    const pal = PALL[MATS[(mat[i] || MI[opts.def || 'steel']) - 1]] || PALL.steel; const a2 = Math.pow(ao, 0.85);
    for (let c = 0; c < 3; c++) col[i * 3 + c] = (pal[1][c] + (pal[0][c] - pal[1][c]) * a2) * (1 - wear * 0.55) + pal[2][c] * wear * 0.55; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setIndex(nv > 65535 ? new THREE.Uint32BufferAttribute(tri, 1) : new THREE.Uint16BufferAttribute(tri, 1));
  return { geo, tris: tri.length / 3, tris0, verts: nv };
}

/* ======================= HELMETS (head-local metres, origin = the head pivot, before the ×1.07·hs fit) ======================= */
const add = (f, box, mat, k = 0) => ({ op: 'add', f, box, mat, k }), sub = (f, box, mat, k = 0) => ({ op: 'sub', f, box, mat, k });
/* the common parts */
const domeShell = (c, r, t, ycut, mat, k = 0) => add((x, y, z) => Math.max(ell(x, y, z, c, r) - t, ycut - y), bx([c[0] - r[0] - t, ycut - 0.01, c[2] - r[2] - t], [c[0] + r[0] + t, c[1] + r[1] + t, c[2] + r[2] + t]), mat, k);
const bandShell = (rx, rz, cz, y0, y1, t, mat, k = 0) => add((x, y, z) => Math.max(t < 0.002 ? Math.abs(ellCyl(x, z, rx, rz, cz)) - t : ellCyl(x, z, rx, rz, cz) - t, y - y1, y0 - y), bx([-rx - t, y0, cz - rz - t], [rx + t, y1, cz + rz + t]), mat, k);
const flare = (r0, y0, r1, y1, cz, t, mat, sz = 1.08, k = 0) => add((x, y, z) => { const rho = hyp(x, (z - cz) / sz); const u = cl((y - y0) / (y1 - y0), 0, 1); const rt = r0 + (r1 - r0) * u;
  /* exact: distance to the slanted segment in the (rho, y) plane — smooth brims, no toon ripples */
  const dr = r1 - r0, dy = y1 - y0, w = cl(((rho - r0) * dr + (y - y0) * dy) / (dr * dr + dy * dy), 0, 1); void u; void rt; return hyp(rho - r0 - dr * w, y - y0 - dy * w) - t; }, bx([-Math.max(r0, r1) - t, Math.min(y0, y1) - 0.004, cz - Math.max(r0, r1) * sz - t], [Math.max(r0, r1) + t, Math.max(y0, y1) + 0.004, cz + Math.max(r0, r1) * sz + t]), mat, k);
const ringT = (R, r, y, cz, mat, sz = 1.08) => add((x, yy, z) => torY(x, yy, z, [0, y, cz], R, r, sz), bx([-R - r, y - r, cz - (R + r) * sz], [R + r, y + r, cz + (R + r) * sz]), mat);
const rivet = (p, r, mat) => add((x, y, z) => hyp(x - p[0], y - p[1], z - p[2]) - r, bx(p.map(v => v - r), p.map(v => v + r)), mat);
/* grille: real holes through the face band (front sector), a dark liner behind them */
function grille(R, rz, cz, y0, y1, rows, colStep, hr, aMax, mat) {
  const ops = [];
  for (let j = 0; j < rows; j++) { const y = y0 + (j + 0.5) * (y1 - y0) / rows, off = (j % 2) * colStep * 0.5;
    for (let a = colStep * 0.5 + off; a < aMax; a += colStep) for (const s of [1, -1]) { const ang = s * a;
      const px = Math.sin(ang) * R, pz = Math.cos(ang) * rz + cz;
      ops.push(sub((x, yy, z) => { const aa = Math.atan2(x, (z - cz) * R / rz); return Math.max(hyp((aa - ang) * R, yy - y) - hr, Math.abs(hyp(x, (z - cz) * R / rz) - R) - 0.012); },
        bx([px - hr - 0.012, y - hr, pz - hr - 0.012], [px + hr + 0.012, y + hr, pz + hr + 0.012]), 'dark')); } }
  return ops;
}
const liner = (rx, rz, cz, y0, y1) => bandShell(rx, rz, cz, y0, y1, 0.0012, 'dark');
/* a swept, flattened fin along a path (crest): capsules squashed in x */
const fin = (pts, r0, r1, flat, mat, k = 0.004) => { const ops = []; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], ra = r0 + (r1 - r0) * i / (pts.length - 1), rb = r0 + (r1 - r0) * (i + 1) / (pts.length - 1);
  ops.push(add((x, y, z) => { const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]; const t = cl(((x * flat - a[0]) * ab[0] + (y - a[1]) * ab[1] + (z - a[2]) * ab[2]) / (ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2), 0, 1);
    return (hyp(x * flat - a[0] - ab[0] * t, y - a[1] - ab[1] * t, z - a[2] - ab[2] * t) - (ra + (rb - ra) * t)) / flat; },
    bx([-Math.max(ra, rb) / flat - 0.003, Math.min(a[1], b[1]) - Math.max(ra, rb) - 0.003, Math.min(a[2], b[2]) - Math.max(ra, rb) - 0.003], [Math.max(ra, rb) / flat + 0.003, Math.max(a[1], b[1]) + Math.max(ra, rb) + 0.003, Math.max(a[2], b[2]) + Math.max(ra, rb) + 0.003]), mat, k)); }
  return ops; };

/* a flat crest plate in the mid plane: under a polyline top (z, y), down into the dome (hidden), rounded thickness t */
const topAt = (pts, z) => { for (let i = 0; i < pts.length - 1; i++) { const [z0, y0] = pts[i], [z1, y1] = pts[i + 1]; if (z >= z0 && z <= z1) { const w = (z - z0) / (z1 - z0), s = w * w * (3 - 2 * w); return y0 + (y1 - y0) * s; } } return -1; };
const crestPlate = (pts, t, mat) => add((x, y, z) => { const tp = topAt(pts, z); if (tp < 0) return 0.02; return Math.max(Math.abs(x) - t, y - tp, 0.17 - y); },
  bx([-t - 0.002, 0.16, pts[0][0] - 0.002], [t + 0.002, Math.max(...pts.map(p => p[1])) + 0.004, pts[pts.length - 1][0] + 0.002]), mat, 0.004);
const crestBead = (pts, r, mat) => { const ops = []; const N = 14; let prev = null; for (let i = 0; i <= N; i++) { const z = pts[0][0] + (pts[pts.length - 1][0] - pts[0][0]) * i / N; const p = [0, topAt(pts, Math.min(z, pts[pts.length - 1][0] - 1e-6)), z]; if (prev) { const a = prev, b = p;
  ops.push(add((x, y, zz) => seg(x, y, zz, a, b) - r, bx([-r, Math.min(a[1], b[1]) - r, Math.min(a[2], b[2]) - r], [r, Math.max(a[1], b[1]) + r, Math.max(a[2], b[2]) + r]), mat, 0.002)); } prev = p; } return ops; };
export const HELM5 = {
  /* Steel Gated Helm (murmillo, cell 3): polished dome, a bronze brow band, the round-holed grille (real holes), flared skirt + bronze rim, a fish-fin crest */
  murmillo: () => [
    domeShell([0, 0.112, -0.004], [0.106, 0.124, 0.12], 0.0026, 0.098, 'steel'),
    bandShell(0.107, 0.12, -0.004, -0.006, 0.104, 0.0026, 'steel', 0.002),
    ringT(0.108, 0.0042, 0.1, -0.004, 'bronze', 1.11), ringT(0.108, 0.0035, -0.004, -0.004, 'bronze', 1.11),
    ...grille(0.107, 0.12, -0.004, 0.006, 0.094, 5, 0.16, 0.0066, 1.22, 'dark'), liner(0.097, 0.109, -0.004, -0.004, 0.1),
    flare(0.11, -0.004, 0.16, -0.034, -0.006, 0.0026, 'steel'), ringT(0.161, 0.0045, -0.035, -0.006, 'bronze', 1.08),
    ...fin([[0, 0.205, -0.11], [0, 0.245, -0.07], [0, 0.27, -0.01], [0, 0.265, 0.05], [0, 0.235, 0.1], [0, 0.205, 0.125]], 0.018, 0.012, 2.6, 'steel', 0.008),
    ...[-0.6, -0.3, 0, 0.3, 0.6].map(a => rivet([Math.sin(a + Math.PI) * 0.112, 0.06, Math.cos(a + Math.PI) * 0.125 - 0.004], 0.0042, 'bronze')),
  ],
  /* Thracian Helm (arm81_thracian): silver dome, a wide brim sloping down, a griffin crest sweeping up and forward to a gold griffin head, a gold grille panel */
  thrachelm: () => [
    domeShell([0, 0.112, -0.004], [0.106, 0.124, 0.12], 0.0026, 0.085, 'silver'),
    bandShell(0.107, 0.12, -0.004, -0.008, 0.09, 0.0026, 'silver', 0.002),
    flare(0.11, 0.075, 0.172, 0.048, -0.006, 0.0026, 'silver'), ringT(0.173, 0.0045, 0.047, -0.006, 'gold', 1.08), ringT(0.109, 0.004, 0.078, -0.004, 'gold', 1.11),
    add((x, y, z) => Math.max(Math.abs(ellCyl(x, z, 0.109, 0.122, -0.004)) - 0.0036, y - 0.074, -0.006 - y, (Math.abs(Math.atan2(x, z + 0.004)) - 0.98) * 0.1), bx([-0.11, -0.01, 0.0], [0.11, 0.08, 0.13]), 'gold'),
    ...grille(0.1095, 0.1225, -0.004, 0.012, 0.07, 3, 0.15, 0.0072, 0.9, 'dark'), liner(0.097, 0.109, -0.004, -0.004, 0.084),
    ...fin([[0, 0.2, -0.105], [0, 0.27, -0.095], [0, 0.32, -0.065], [0, 0.345, -0.01], [0, 0.345, 0.05], [0, 0.325, 0.095], [0, 0.3, 0.12]], 0.04, 0.026, 4.8, 'silver', 0.012),
    ...[[0, 0.335, -0.08], [0, 0.365, -0.03], [0, 0.375, 0.02], [0, 0.365, 0.07]].map(p => add((x, y, z) => ell(x, y, z, p, [0.005, 0.018, 0.012]), bx([p[0] - 0.006, p[1] - 0.02, p[2] - 0.013], [p[0] + 0.006, p[1] + 0.02, p[2] + 0.013]), 'silver', 0.004)),
    add((x, y, z) => ell(x, y, z, [0, 0.305, 0.135], [0.022, 0.03, 0.036]), bx([-0.025, 0.27, 0.095], [0.025, 0.34, 0.175]), 'gold', 0.006),
    /* the griffin's hooked beak + brow ridge + eye sockets */
    add((x, y, z) => { const t = cl((z - 0.16) / 0.05, 0, 1); return hyp(x / 1.2, y - (0.298 - 0.03 * t * t), z - (0.16 + 0.05 * t)) - 0.016 * (1 - t) - 0.002; }, bx([-0.02, 0.255, 0.14], [0.02, 0.32, 0.215]), 'gold', 0.005),
    add((x, y, z) => ell(x, y, z, [0, 0.327, 0.15], [0.026, 0.008, 0.018]), bx([-0.028, 0.318, 0.13], [0.028, 0.336, 0.17]), 'gold', 0.004),
    sub((x, y, z) => hyp(Math.abs(x) - 0.019, y - 0.316, z - 0.152) - 0.0045, bx([-0.026, 0.31, 0.146], [0.026, 0.322, 0.158]), 'dark'),
    add((x, y, z) => seg(x, y, z, [0, 0.3, 0.16], [0, 0.285, 0.185]) - 0.007 + (z - 0.16) * 0.15, bx([-0.01, 0.27, 0.15], [0.01, 0.31, 0.195]), 'gold', 0.003),
    ...[1, -1].map(s => rivet([s * 0.012, 0.312, 0.152], 0.003, 'dark')),
  ],
  /* Hoplomachus Helm (arm81_crista): gold, a broad flat brim, a fine grille, a tall crest fin carrying a plume post + red plume */
  crista: () => [
    domeShell([0, 0.112, -0.004], [0.106, 0.124, 0.12], 0.0026, 0.098, 'gold'),
    bandShell(0.107, 0.12, -0.004, -0.004, 0.1, 0.0026, 'gold', 0.002),
    ...grille(0.107, 0.12, -0.004, 0.008, 0.092, 6, 0.13, 0.0052, 1.0, 'dark'), liner(0.097, 0.109, -0.004, -0.004, 0.098),
    flare(0.108, 0.1, 0.162, 0.088, -0.006, 0.0026, 'gold'), ringT(0.163, 0.004, 0.087, -0.006, 'bronze', 1.08), ringT(0.108, 0.004, 0.003, -0.004, 'bronze', 1.11),
    /* the tall crest PLATE (his art: a flat raised band over the crown), a bronze bead along its top */
    crestPlate([[-0.118, 0.2], [-0.07, 0.29], [0.0, 0.325], [0.06, 0.31], [0.1, 0.27], [0.118, 0.2]], 0.0042, 'gold'),
    ...crestBead([[-0.118, 0.2], [-0.07, 0.29], [0.0, 0.325], [0.06, 0.31], [0.1, 0.27], [0.118, 0.2]], 0.0048, 'bronze'),
    add((x, y, z) => seg(x, y, z, [0, 0.28, 0], [0, 0.39, 0.01]) - 0.0055, bx([-0.008, 0.27, -0.01], [0.008, 0.4, 0.02]), 'gold', 0.003),
    ...[[0, 0.405, 0.01, 0.016], [0, 0.43, 0.0, 0.014], [0, 0.452, -0.012, 0.012], [0, 0.47, -0.028, 0.009]].map(([x0, y0, z0, r]) => add((x, y, z) => ell(x, y, z, [x0, y0, z0], [r * 0.8, r * 1.3, r]), bx([-r, y0 - r * 1.3, z0 - r], [r, y0 + r * 1.3, z0 + r]), 'red', 0.008)),
  ],
  /* Centurian Helm (cell 29): a small gold cap with a raised brow band + rivets, big cheek guards, a flared neck guard, a red brush crest fore-aft on its holder */
  centurion: () => [
    domeShell([0, 0.125, -0.006], [0.102, 0.118, 0.114], 0.0026, 0.112, 'gold'),
    ringT(0.103, 0.0048, 0.115, -0.006, 'bronze', 1.1),
    ...[1, -1].map(s => add((x, y, z) => { const sh = Math.abs(ell(x, y, z, [0, 0.105, -0.004], [0.09, 0.13, 0.116])) - 0.0024; const reg = Math.max(0.02 - y, y - 0.118, -0.012 - z, z - 0.08 + Math.max(0, 0.06 - y) * 0.6, -x * s);
      return Math.max(sh, reg + 0.0); }, bx([s > 0 ? 0 : -0.12, 0.015, -0.02], [s > 0 ? 0.12 : 0, 0.12, 0.09]), 'gold')),
    (() => { const fl = flare(0.105, 0.112, 0.15, 0.07, -0.014, 0.0026, 'gold'); const f0 = fl.f; fl.f = (x, y, z) => Math.max(f0(x, y, z), z + 0.03); return fl; })(),   /* the neck guard: back half only */
    add((x, y, z) => Math.max(Math.abs(x) - 0.006, Math.abs(y - 0.248) - 0.008, Math.abs(z + 0.006) - 0.085), bx([-0.007, 0.238, -0.095], [0.007, 0.258, 0.085]), 'bronze', 0.004),
    add((x, y, z) => { const d = ell(x, y, z, [0, 0.29, -0.006], [0.014, 0.045, 0.1]); const groove = Math.abs(Math.sin(z * 260)) * 0.0018; return Math.max(d + groove, 0.25 - y); }, bx([-0.016, 0.25, -0.11], [0.016, 0.34, 0.1]), 'red', 0.006),
    ...Array.from({ length: 7 }, (_, i) => { const a = -1.3 + i * 0.43; return rivet([Math.sin(a) * 0.104, 0.115, Math.cos(a) * 0.114 - 0.006], 0.004, 'gold'); }),
  ],
};
/* sculpt one helmet → geometry in head-local metres (head pivot = origin) */
export function sculptHelm(key, h = 0.0022, cell = 0.0045) {
  const t0 = performance.now(); const fd = run(fieldOf(HELM5[key](), h)); const m = meshField(fd, cell, { def: 'steel' }); m.ms = Math.round(performance.now() - t0); return m;
}

/* ======================= CUIRASSES (body metres, rest pose) — an offset shell of the body field ======================= */
export function sculptCuirass(B, key, h = 0.0025, cell = 0.0072) {
  const t0 = performance.now(); const K = B.kit, fd = K.fd, P = K.P;
  const S = { L: P('sL'), R: P('sR') }, E = { L: P('eL'), R: P('eR') };
  const high = key === 'thorax', top = (x) => { const ax = Math.abs(x); return ax < 0.065 ? (high ? 1.47 : 1.43) + ax * 0.45 : ax < 0.165 ? 1.538 : 1.52 - (ax - 0.165) * 1.3; };
  const OFF = 0.0135, T = 0.0034;
  /* muscle relief (carved): linea alba, the pec line, three ab rows, the oblique line — and for the Reinforced, stepped plates */
  const groove = (x, y, z) => { if (z < 0) return 0; const ax = Math.abs(x); let g = 0;
    if (y > 1.12 && y < 1.34) g = Math.max(g, Math.exp(-((x / 0.0045) ** 2)));
    if (ax < 0.15 && y > 1.24) g = Math.max(g, Math.exp(-(((y - (1.315 + 0.3 * Math.max(0, ax - 0.03) ** 1.4 * 4)) / 0.005) ** 2)) * cl((0.15 - ax) / 0.03, 0, 1));
    for (const yr of [1.262, 1.205, 1.148]) if (ax < 0.062) g = Math.max(g, Math.exp(-(((y - yr) / 0.0038) ** 2)) * cl((0.062 - ax) / 0.012, 0, 1));
    if (ax > 0.06 && ax < 0.115 && y < 1.25) g = Math.max(g, Math.exp(-(((ax - 0.07 - (1.25 - y) * 0.25) / 0.005) ** 2)) * 0.7);
    return g; };
  /* embossed muscles (raised): two pectorals, three rows of ab blocks, the serratus */
  const bump = (x, y, cx, cy, rx, ry) => { const q = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2; return q < 1 ? (1 - q) ** 1.5 : 0; };
  const relief = (x, y, z) => { if (z < 0) return 0; let r = 0;
    for (const s of [1, -1]) { r += 0.014 * bump(x, y, s * 0.068, 1.355, 0.07, 0.05);
      for (const yr of [1.288, 1.232, 1.176]) r += 0.011 * bump(x, y, s * 0.03, yr, 0.026, 0.025);
      r += 0.009 * bump(x, y, s * 0.032, 1.12, 0.026, 0.028); r += 0.006 * bump(x, y, s * 0.105, 1.24, 0.03, 0.06); }
    return r; };
  const lame = (y) => { const f = ((1.52 - y) * 15) % 1; return f * 0.0055; };
  const region = (x, y, z) => { const dA = Math.min(seg(x, y, z, S.L, E.L), seg(x, y, z, S.R, E.R)); const dN = hyp(x, (z + 0.02) * 1.1);
    return Math.max(1.088 - y, y - top(x), y < 1.44 ? 0.088 - dA : 0.05 - dA, Math.abs(x) - 0.2, y > 1.47 ? 0.072 - dN : -1); };
  const fn = (x, y, z) => {
    const fb = sampleF100(fd, x, y, z); if (fb > (key === 'thorax' ? 0.085 : 0.045)) return 0.02; if (fb < -0.02) return Math.max(-0.006, region(x, y, z));
    const off = OFF + (key === 'thorax' ? lame(y) : -(key === 'musculata' ? 0.005 : 0.0034) * groove(x, y, z) + (key === 'musculata' ? relief(x, y, z) : 0)) + (key === 'musculata' || key === 'flavchest' ? 0.0022 * (z > 0 ? 1 : 0) : 0);
    const r = region(x, y, z); let d = Math.max(fb - off - T, r);   /* SOLID down into the body: no inner face to show through */
    const rim = Math.max(Math.abs(fb - off - 0.002) - T - 0.0024, Math.abs(r + 0.007) - 0.0055); d = smin(d, rim, 0.002);
    /* rivets on the shoulder joins + a lion boss on the chest (the Forged Chest) */
    for (const s of [1, -1]) { const rp = [s * 0.11, 1.5, 0.045]; const dr = hyp(x - rp[0], y - rp[1], z - rp[2]) - 0.006; if (dr < d) d = Math.min(d, dr); }
    if (key === 'musculata') { const b = ell(x, y, z, [0, 1.405, 0.135], [0.03, 0.026, 0.02]); d = smin(d, b, 0.004); }
    if (key === 'thorax') for (const s of ['L', 'R']) { const sx = s === 'L' ? 1 : -1, c0 = S[s];   /* pauldron: ONE solid curved plate, three stepped lames carved into it */
      const c = [c0[0] + sx * 0.03, c0[1] + 0.0, c0[2] - 0.004], rr = [0.125, 0.092, 0.104];
      const step = cl((c[1] + 0.06 - y) / 0.03, 0, 2.99), lm = Math.floor(step) * 0.0045 + (step % 1) * 0.0045 * 0;
      const ee = ell(x, y, z, c, rr) + lm; const pd = Math.max(ee - 0.004, -ee - 0.016, (c[1] - 0.045) - y, (c0[0] * sx - 0.045) - x * sx); d = Math.min(d, pd); }
    return d; };
  const matFn = (x, y, z) => { const fb = sampleF100(fd, x, y, z); if (key === 'thorax') return 'iron'; if (key === 'musculata' && ell(x, y, z, [0, 1.405, 0.135], [0.034, 0.03, 0.024]) < 0) return 'gold';
    const r = region(x, y, z); if (r > -0.009) return key === 'musculata' ? 'gold' : 'dsteel'; return key === 'musculata' ? 'bronze' : 'steel'; };
  const box = [[-0.4, 1.0, -0.24], [0.4, 1.64, 0.24]];
  const f2 = run(fieldFn(fn, matFn, box, h)); const m = meshField(f2, cell, { def: key === 'thorax' ? 'iron' : 'bronze', aoStep: 0.004 });
  /* skin it: each vertex takes the weights of the nearest body vertex (spatial hash) */
  const bg = B.body.geometry, bp = bg.attributes.position, bsI = bg.attributes.skinIndex, bsW = bg.attributes.skinWeight, C = 0.02, grid = new Map();
  for (let i = 0; i < bp.count; i++) { const y = bp.getY(i); if (y < 0.95) continue; const k = Math.floor(bp.getX(i) / C) + ',' + Math.floor(y / C) + ',' + Math.floor(bp.getZ(i) / C); let L = grid.get(k); if (!L) grid.set(k, L = []); L.push(i); }
  const pos = m.geo.attributes.position, n = pos.count, SI = new Uint16Array(n * 4), SW = new Float32Array(n * 4);
  for (let v = 0; v < n; v++) { const x = pos.getX(v), y = pos.getY(v), z = pos.getZ(v); const cx = Math.floor(x / C), cy = Math.floor(y / C), cz = Math.floor(z / C); let best = -1, bd = 1e9;
    for (let r = 1; r <= 3 && best < 0; r++) for (let dz = -r; dz <= r; dz++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const L = grid.get((cx + dx) + ',' + (cy + dy) + ',' + (cz + dz)); if (!L) continue;
      for (const i of L) { const d = (bp.getX(i) - x) ** 2 + (bp.getY(i) - y) ** 2 + (bp.getZ(i) - z) ** 2; if (d < bd) { bd = d; best = i; } } }
    for (let q = 0; q < 4; q++) { SI[v * 4 + q] = best >= 0 ? bsI.getComponent(best, q) : 0; SW[v * 4 + q] = best >= 0 ? bsW.getComponent(best, q) : q === 0 ? 1 : 0; } }
  m.geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(SI, 4)); m.geo.setAttribute('skinWeight', new THREE.BufferAttribute(SW, 4));
  m.ms = Math.round(performance.now() - t0); return m;
}

/* ---------- put a sculpted piece on the token (cached per body) ---------- */
export const SCULPT5 = new Set(['murmillo', 'thrachelm', 'crista', 'centurion', 'musculata', 'thorax']);
export const STATS5 = {};
export function wear5(B, key) {
  const K = B.kit; B._s5 = B._s5 || {}; let m = B._s5[key];
  if (!m) { m = HELM5[key] ? sculptHelm(key) : sculptCuirass(B, key); B._s5[key] = m; STATS5[key] = { tris: m.tris, trisFine: m.tris0, verts: m.verts, ms: m.ms }; }
  const mat = K.makeToon('#ffffff', { vertexColors: true, side: THREE.DoubleSide });
  if (HELM5[key]) { const g = m.geo.clone(); const s = 1.07 * K.hs; g.scale(s, s, s); const mesh = K.rigid(g, mat, 'he', K.HO, null); mesh.userData.ownMat = 1; return [mesh]; }
  const sm = new THREE.SkinnedMesh(m.geo.clone(), mat); sm.bind(B.body.skeleton, B.body.bindMatrix); sm.frustumCulled = false; sm.userData.ownMat = 1; sm.name = 's5_' + key;
  B.group.add(sm); sm.userData.ink = K.addOutline(sm, false); return [sm];
}
