/* look100 ROUND 7 (from r6_sculpt.js: fine engraving dropped, Reinforced Chest trimmed, belts + limb pieces sculpted) — SCULPTED helmets + cuirasses without an outside modeller (look test only, tools/plans/look100).
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
  bsteel: ['#8592a0', '#232a33', '#e6eef6'], horn: ['#4a4541', '#161412', '#9a948c'], dark2: ['#615c55', '#1d1b19', '#aaa49b'], copper: ['#d08a52', '#5a3016', '#ffd2a8'], lblue: ['#3c5aa8', '#141e40', '#a8c0f0'],
  cloth: ['#c9c4b6', '#5a564c', '#f4f0e6'], fur: ['#5e4632', '#1e140c', '#9a7c5c'], olive: ['#6f7766', '#262a22', '#c4cbbb'], dleather: ['#4e3424', '#1a100a', '#8e6a50'], dred: ['#6a1a16', '#220605', '#b0504a'],
};
const MATS = Object.keys(PAL); const MI = Object.fromEntries(MATS.map((k, i) => [k, i + 1]));
const lin = (h) => { const c = new THREE.Color(h).convertSRGBToLinear(); return [c.r, c.g, c.b]; };
const PALL = Object.fromEntries(Object.entries(PAL).map(([k, v]) => [k, v.map(lin)]));

const HL6 = (() => { const v = [-0.5, 0.75, 0.45], l = Math.hypot(...v); return v.map(a => a / l); })();
const HLC6 = { gold: lin('#ffe070'), bronze: lin('#ffd98a'), copper: lin('#ffb880') };
const METAL6 = new Set(['steel', 'iron', 'dsteel', 'silver', 'gold', 'bronze', 'bsteel', 'copper']);
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
  const P = sn.pos; /* round 7: a normalised gradient and a step no longer than one fine cell, so a jump in the field (a cut region) can't fling a vertex */
  const proj = (p) => { const p0 = p; for (let it = 0; it < 3; it++) { const f = cl(sampleF100(fd, ...p), -fd.h, fd.h), g = gradF100(fd, ...p), gl = Math.hypot(...g) || 1; p = [p[0] - g[0] / gl * f, p[1] - g[1] / gl * f, p[2] - g[2] / gl * f]; }
    return Math.hypot(p[0] - p0[0], p[1] - p0[1], p[2] - p0[2]) > fd.h * 2.5 ? p0 : p; };
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
    const wear = cl(lap / e * 2.2 - 0.25, 0, 1), cav = cl(-lap / e * 2.6 - 0.08, 0, 1);
    const mk = MATS[(mat[i] || MI[opts.def || 'steel']) - 1] || 'steel', pal = PALL[mk] || PALL.steel, hc = HLC6[mk] || pal[2]; const a2 = Math.pow(ao, 1.35) * (1 - cav * 0.7);
    /* round 6: a PAINTED highlight on metals — a crisp light band on the curves that face the upper left (fixed, like a brushed-on
       tabletop highlight), plus the worn edges; recesses darker (cavity + AO) so relief reads at board size */
    const nl = n[0] * HL6[0] + n[1] * HL6[1] + n[2] * HL6[2]; const hl = METAL6.has(mk) ? (cl((nl - 0.74) / 0.06, 0, 1) * 0.62 + cl((nl - 0.5) / 0.2, 0, 1) * 0.1) * (mk === 'gold' || mk === 'bronze' || mk === 'copper' ? 0.8 : 1) : 0;
    for (let c = 0; c < 3; c++) { const b = (pal[1][c] + (pal[0][c] - pal[1][c]) * a2) * (1 - wear * 0.55) + pal[2][c] * wear * 0.55; col[i * 3 + c] = b + (hc[c] - b) * Math.min(0.85, hl); } }
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
const fin = (pts, r0, r1, flat, mat, k = 0.004, rip = 0) => { const ops = []; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], ra = r0 + (r1 - r0) * i / (pts.length - 1), rb = r0 + (r1 - r0) * (i + 1) / (pts.length - 1);
  ops.push(add((x, y, z) => { const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]; const t = cl(((x * flat - a[0]) * ab[0] + (y - a[1]) * ab[1] + (z - a[2]) * ab[2]) / (ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2), 0, 1);
    const rp = rip ? 1 - rip * Math.abs(Math.sin((i + t) * 5.5)) : 1; return (hyp(x * flat - a[0] - ab[0] * t, y - a[1] - ab[1] * t, z - a[2] - ab[2] * t) - (ra + (rb - ra) * t) * rp) / flat; },
    bx([Math.min(a[0], b[0]) / flat - Math.max(ra, rb) / flat - 0.003, Math.min(a[1], b[1]) - Math.max(ra, rb) - 0.003, Math.min(a[2], b[2]) - Math.max(ra, rb) - 0.003], [Math.max(a[0], b[0]) / flat + Math.max(ra, rb) / flat + 0.003, Math.max(a[1], b[1]) + Math.max(ra, rb) + 0.003, Math.max(a[2], b[2]) + Math.max(ra, rb) + 0.003]), mat, k)); }
  return ops; };

/* a flat crest plate in the mid plane: under a polyline top (z, y), down into the dome (hidden), rounded thickness t */
const topAt = (pts, z) => { for (let i = 0; i < pts.length - 1; i++) { const [z0, y0] = pts[i], [z1, y1] = pts[i + 1]; if (z >= z0 && z <= z1) { const w = (z - z0) / (z1 - z0), s = w * w * (3 - 2 * w); return y0 + (y1 - y0) * s; } } return -1; };
const crestPlate = (pts, t, mat) => add((x, y, z) => { const tp = topAt(pts, z); if (tp < 0) return 0.02; return Math.max(Math.abs(x) - t, y - tp, 0.17 - y); },
  bx([-t - 0.002, 0.16, pts[0][0] - 0.002], [t + 0.002, Math.max(...pts.map(p => p[1])) + 0.004, pts[pts.length - 1][0] + 0.002]), mat, 0.004);
const crestBead = (pts, r, mat) => { const ops = []; const N = 14; let prev = null; for (let i = 0; i <= N; i++) { const z = pts[0][0] + (pts[pts.length - 1][0] - pts[0][0]) * i / N; const p = [0, topAt(pts, Math.min(z, pts[pts.length - 1][0] - 1e-6)), z]; if (prev) { const a = prev, b = p;
  ops.push(add((x, y, zz) => seg(x, y, zz, a, b) - r, bx([-r, Math.min(a[1], b[1]) - r, Math.min(a[2], b[2]) - r], [r, Math.max(a[1], b[1]) + r, Math.max(a[2], b[2]) + r]), mat, 0.002)); } prev = p; } return ops; };
/* round 6 helpers: a tapered cone/capsule, a rounded box, a raised strip over the dome */
const taper = (a, b, r0, r1, mat, k = 0.003) => { const R = Math.max(r0, r1) + 0.003; return add((x, y, z) => { const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]; const t = cl(((x - a[0]) * ab[0] + (y - a[1]) * ab[1] + (z - a[2]) * ab[2]) / (ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2), 0, 1);
  return hyp(x - a[0] - ab[0] * t, y - a[1] - ab[1] * t, z - a[2] - ab[2] * t) - (r0 + (r1 - r0) * t); }, bx([Math.min(a[0], b[0]) - R, Math.min(a[1], b[1]) - R, Math.min(a[2], b[2]) - R], [Math.max(a[0], b[0]) + R, Math.max(a[1], b[1]) + R, Math.max(a[2], b[2]) + R]), mat, k); };
const rbox = (x, y, z, c, hs, r) => { const qx = Math.abs(x - c[0]) - hs[0] + r, qy = Math.abs(y - c[1]) - hs[1] + r, qz = Math.abs(z - c[2]) - hs[2] + r; return hyp(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r; };
const RB = (c, hs, r, mat, k = 0, op = add) => op((x, y, z) => rbox(x, y, z, c, hs, r), bx([c[0] - hs[0], c[1] - hs[1], c[2] - hs[2]], [c[0] + hs[0], c[1] + hs[1], c[2] + hs[2]]), mat, k);
const DOME = [[0, 0.112, -0.004], [0.106, 0.124, 0.12]];
/* a raised strip on the dome: along x = 0 ('fb') or z = cz ('lr'), from y0 up */
const strip = (dir, w, raise, y0, mat, c = DOME[0], r = DOME[1]) => add((x, y, z) => Math.max(ell(x, y, z, c, r) - raise, (dir === 'fb' ? Math.abs(x) : Math.abs(z - c[2])) - w, y0 - y),
  bx([dir === 'fb' ? -w : -r[0] - raise, y0, dir === 'fb' ? c[2] - r[2] - raise : c[2] - w], [dir === 'fb' ? w : r[0] + raise, c[1] + r[1] + raise, dir === 'fb' ? c[2] + r[2] + raise : c[2] + w]), mat, 0.002);
const onDome = (dx, dy, dz, out = 0, c = DOME[0], r = DOME[1]) => { const l = hyp(dx / r[0], dy / r[1], dz / r[2]); return [c[0] + dx / l + dx / hyp(dx, dy, dz) * out, c[1] + dy / l + dy / hyp(dx, dy, dz) * out, c[2] + dz / l + dz / hyp(dx, dy, dz) * out]; };
/* a palmette (fan of raised petals) and a round medallion, embossed on a surface given by a field g(x,y,z) */
const palmette = (cx, cy, cz, R, mat, g) => add((x, y, z) => { const dx = x - cx, dy = y - cy; const rr = hyp(dx, dy), a = Math.atan2(dx, dy); if (dy < -0.004 || rr > R) return 0.02 + Math.max(0, rr - R);
  const pet = 0.5 + 0.5 * Math.cos(a * 7); return Math.max(g(x, y, z) - 0.0045 * (0.4 + 0.6 * pet) * (1 - rr / R * 0.5), rr - R, -dy - 0.004, Math.abs(z - cz) - 0.03); }, bx([cx - R, cy - 0.005, cz - 0.03], [cx + R, cy + R, cz + 0.03]), mat, 0.002);
const medal = (p, n, R, mat) => { const nn = Math.hypot(...n), u = n.map(v => v / nn); return add((x, y, z) => { const d = [x - p[0], y - p[1], z - p[2]]; const h = d[0] * u[0] + d[1] * u[1] + d[2] * u[2]; const rr = hyp(d[0] - u[0] * h, d[1] - u[1] * h, d[2] - u[2] * h);
  const prof = rr < R * 0.35 ? 0.0045 : rr < R * 0.72 ? 0.0022 : rr < R ? 0.0038 : -1; return Math.max(rr - R, h - prof, -h - 0.006); }, bx(p.map(v => v - R - 0.006), p.map(v => v + R + 0.006)), mat, 0.0015); };
export const HELM5 = {
  /* Steel Gated Helm (murmillo, cell 3): polished dome, a bronze brow band, the round-holed grille (real holes), flared skirt + bronze rim, a fish-fin crest */
  murmillo: () => [
    domeShell([0, 0.112, -0.004], [0.106, 0.124, 0.12], 0.0026, 0.098, 'steel'),
    bandShell(0.107, 0.12, -0.004, -0.006, 0.104, 0.0026, 'steel', 0.002),
    ringT(0.108, 0.0042, 0.1, -0.004, 'bronze', 1.11), ringT(0.108, 0.0035, -0.004, -0.004, 'bronze', 1.11),
    ...grille(0.107, 0.12, -0.004, 0.006, 0.094, 5, 0.16, 0.0066, 1.22, 'dark'), liner(0.097, 0.109, -0.004, -0.004, 0.1),
    add((x, y, z) => Math.max(Math.abs(ellCyl(x, z, 0.107, 0.12, -0.004)) - 0.0048, Math.abs(x) - 0.0065, y - 0.102, -0.006 - y, -z), bx([-0.008, -0.008, 0.08], [0.008, 0.104, 0.13]), 'bronze', 0.0015),
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
    ...fin([[0, 0.2, -0.105], [0, 0.27, -0.095], [0, 0.32, -0.065], [0, 0.345, -0.01], [0, 0.345, 0.05], [0, 0.325, 0.095], [0, 0.3, 0.12]], 0.04, 0.026, 4.8, 'silver', 0.012, 0.09),
    /* the MANE: a row of pointed feathers along the top of the neck, each swept back, gold tips */
    ...Array.from({ length: 11 }, (_, i) => { const z0 = -0.095 + i * 0.019, y0 = 0.34 + 0.035 * Math.sin((i + 1) / 12 * Math.PI) - (i < 2 ? 0.03 * (2 - i) : 0) - (i > 8 ? 0.012 * (i - 8) : 0);
      return taper([0, y0 - 0.012, z0 + 0.006], [0, y0 + 0.02 + (i % 2) * 0.006, z0 - 0.022], 0.0085, 0.0018, i % 2 ? 'gold' : 'silver', 0.004); }),

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
    add((x, y, z) => { const a = Math.atan2(x, z + 0.006); return Math.max(ell(x, y, z, [0, 0.125, -0.006], [0.102, 0.118, 0.114]) - 0.0055, Math.abs(y - (0.165 + 0.011 * Math.sin(a * 8))) - 0.0032, 0.13 - y); }, bx([-0.11, 0.13, -0.125], [0.11, 0.2, 0.115]), 'bronze', 0.0015),

    ...[1, -1].map(s => add((x, y, z) => { const sh = Math.abs(ell(x, y, z, [0, 0.105, -0.004], [0.09, 0.13, 0.116])) - 0.0024; const reg = Math.max(0.02 - y, y - 0.118, -0.012 - z, z - 0.08 + Math.max(0, 0.06 - y) * 0.6, -x * s);
      return Math.max(sh, reg + 0.0); }, bx([s > 0 ? 0 : -0.12, 0.015, -0.02], [s > 0 ? 0.12 : 0, 0.12, 0.09]), 'gold')),
    (() => { const fl = flare(0.105, 0.112, 0.15, 0.07, -0.014, 0.0026, 'gold'); const f0 = fl.f; fl.f = (x, y, z) => Math.max(f0(x, y, z), z + 0.03); return fl; })(),   /* the neck guard: back half only */
    add((x, y, z) => Math.max(Math.abs(x) - 0.006, Math.abs(y - 0.248) - 0.008, Math.abs(z + 0.006) - 0.085), bx([-0.007, 0.238, -0.095], [0.007, 0.258, 0.085]), 'bronze', 0.004),
    add((x, y, z) => { const d = ell(x, y, z, [0, 0.29, -0.006], [0.014, 0.045, 0.1]); const groove = Math.abs(Math.sin(z * 260)) * 0.0018; return Math.max(d + groove, 0.25 - y); }, bx([-0.016, 0.25, -0.11], [0.016, 0.34, 0.1]), 'red', 0.006),
    ...Array.from({ length: 7 }, (_, i) => { const a = -1.3 + i * 0.43; return rivet([Math.sin(a) * 0.104, 0.115, Math.cos(a) * 0.114 - 0.006], 0.004, 'gold'); }),
  ],
  /* Iron Helm (galea, cell 0): a spangenhelm — steel dome, bronze brow band + crossing bands with rivets, a nasal that spreads into cheek guards */
  galea: () => [
    domeShell(DOME[0], DOME[1], 0.003, 0.05, 'steel'),
    ringT(0.108, 0.0062, 0.058, -0.004, 'bronze', 1.115),
    strip('fb', 0.012, 0.0072, 0.055, 'bronze'), strip('lr', 0.012, 0.0072, 0.055, 'bronze'),
    ...[0, Math.PI / 2, Math.PI, -Math.PI / 2].flatMap(az => [0.35, 0.7, 1.05, 1.35].map(el => rivet(onDome(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el), 0.0068), 0.0036, 'bronze'))),
    add((x, y, z) => { const w = 0.011 + Math.max(0, 0.012 - y) * 0.9; return Math.max(Math.abs(ellCyl(x, z, 0.108, 0.124, -0.004)) - 0.0034, Math.abs(x) - w, y - 0.062, -0.03 - y, -z); }, bx([-0.05, -0.034, 0.06], [0.05, 0.066, 0.135]), 'bronze', 0.002),
    ...[1, -1].map(s => add((x, y, z) => { const a = Math.atan2(x * s, z + 0.004); return Math.max(Math.abs(ellCyl(x, z, 0.108, 0.124, -0.004)) - 0.0032, y - 0.058, -0.045 + Math.max(0, a - 1.2) * 0.05 - y, Math.abs(a - 1.05) - 0.42 - Math.max(0, 0.02 - y) * 2); },
      bx([s > 0 ? 0 : -0.115, -0.05, -0.08], [s > 0 ? 0.115 : 0, 0.062, 0.13]), 'bronze', 0.002)),
  ],
  /* Horned Helm (cassis, cell 1): pointed dark dome, a gold ornament plate up the front, bronze brow band, closed visor with an eye slot,
     a bronze emblem below it, two curved horns */
  cassis: () => [
    domeShell([0, 0.108, -0.004], [0.106, 0.142, 0.12], 0.003, 0.0, 'iron'),
    bandShell(0.108, 0.122, -0.004, -0.05, 0.1, 0.003, 'iron'),
    ringT(0.11, 0.006, 0.104, -0.004, 'bronze', 1.115), ringT(0.11, 0.0045, -0.05, -0.004, 'bronze', 1.115),
    add((x, y, z) => Math.max(ell(x, y, z, [0, 0.108, -0.004], [0.106, 0.142, 0.12]) - 0.0085, Math.abs(x) - (0.034 - Math.max(0, y - 0.12) * 0.28), 0.108 - y, y - 0.25, -z), bx([-0.04, 0.1, 0.0], [0.04, 0.26, 0.135]), 'gold', 0.002),
    RB([0, 0.083, 0.12], [0.07, 0.0075, 0.04], 0.003, 'dark', 0, sub),
    add((x, y, z) => Math.max(Math.abs(ellCyl(x, z, 0.108, 0.122, -0.004)) - 0.0075, Math.abs(x) - (0.02 - Math.abs(y - 0.04) * 0.25), Math.abs(y - 0.04) - 0.026, -z), bx([-0.024, -0.005, 0.08], [0.024, 0.048, 0.14]), 'bronze', 0.002),
    ...[1, -1].map(s => rivet([s * 0.009, 0.05, 0.131], 0.003, 'dark')),
    ...[1, -1].flatMap(s => [...fin([[s * 0.092, 0.14, 0.0], [s * 0.135, 0.165, 0.01], [s * 0.175, 0.215, 0.025], [s * 0.19, 0.275, 0.045], [s * 0.18, 0.33, 0.06], [s * 0.16, 0.37, 0.065]], 0.022, 0.003, 1, 'horn', 0.003),
      add((x, y, z) => torY(x - s * 0.105, (y - 0.145) * 1, z, [0, 0, 0], 0.017, 0.005, 1) , bx([s * 0.105 - 0.03, 0.12, -0.03], [s * 0.105 + 0.03, 0.17, 0.03]), 'bronze', 0.002)]),
  ],
  /* Steel Dome Helm (helm5, cell 4): a closed blue-steel helm — round eye holes (red within), a centre ridge with a spike, visor line, gorget */
  helm5: () => [
    domeShell([0, 0.112, -0.004], [0.108, 0.126, 0.122], 0.003, 0.0, 'bsteel'),
    bandShell(0.109, 0.124, -0.004, -0.06, 0.11, 0.003, 'bsteel'),
    flare(0.112, -0.03, 0.128, -0.072, -0.004, 0.003, 'bsteel'),
    add((x, y, z) => Math.max(ell(x, y, z, [0, 0.112, -0.004], [0.108, 0.126, 0.122]) - 0.0085, Math.abs(x) - 0.0065, 0.1 - y), bx([-0.008, 0.095, -0.14], [0.008, 0.25, 0.14]), 'bsteel', 0.002),
    add((x, y, z) => Math.max(Math.abs(ellCyl(x, z, 0.109, 0.124, -0.004)) - 0.0085, Math.abs(x) - 0.0065, y - 0.11, -0.06 - y, -z), bx([-0.008, -0.062, 0.08], [0.008, 0.112, 0.14]), 'bsteel', 0.002),
    ringT(0.111, 0.0035, 0.05, -0.004, 'bsteel', 1.115), ringT(0.112, 0.0045, -0.085, -0.004, 'bsteel', 1.115),
    taper([0, 0.234, -0.004], [0, 0.285, 0.008], 0.009, 0.0015, 'bsteel', 0.004),
    ...[1, -1].flatMap(s => [add((x, y, z) => Math.max(hyp(x - s * 0.037, y - 0.085) - 0.0175, z - 0.15, 0.06 - z) , bx([s * 0.037 - 0.02, 0.036, 0.06], [s * 0.037 + 0.02, 0.08, 0.15]), 'dark'), ][0] ? [sub((x, y, z) => Math.max(hyp(x - s * 0.037, y - 0.085) - 0.0175, z - 0.15, 0.085 - z), bx([s * 0.037 - 0.02, 0.063, 0.107], [s * 0.037 + 0.02, 0.08, 0.15]), 'dark'),
      add((x, y, z) => ell(x, y, z, [s * 0.037, 0.085, 0.1], [0.0065, 0.0065, 0.004]), bx([s * 0.037 - 0.008, 0.077, 0.094], [s * 0.037 + 0.008, 0.093, 0.106]), 'red'),
      add((x, y, z) => Math.max(Math.abs(hyp(x - s * 0.037, y - 0.085) - 0.0195) - 0.0022, Math.abs(ellCyl(x, z, 0.109, 0.124, -0.004)) - 0.0055, -z), bx([s * 0.037 - 0.025, 0.06, 0.107], [s * 0.037 + 0.025, 0.083, 0.14]), 'bsteel', 0.0015)] : []),
    rivet([0, 0.025, 0.128], 0.004, 'bsteel'),
  ],
  /* Helm of Flavius (flavhelm): a gold LION — mane all over the dome, brow, eye sockets, snout + nose, upper jaw with fangs over the face,
     blade flanges at the jaw, a spike on top */
  flavhelm: () => [
    add((x, y, z) => { const c = [0, 0.112, -0.004], d = [x - c[0], y - c[1], z - c[2]]; const a = Math.atan2(d[0], d[2]), el = Math.atan2(d[1], hyp(d[0], d[2]));
      const mane = Math.abs(Math.sin(a * 9 + el * 3)) * Math.abs(Math.sin(el * 8 + a * 2)); return Math.max(ell(x, y, z, c, [0.11, 0.128, 0.124]) - 0.003 - 0.005 * mane * cl((0.14 - z) / 0.04, 0, 1), 0.02 - y); },
      bx([-0.125, 0.0, -0.14], [0.125, 0.26, 0.135]), 'gold'),
    add((x, y, z) => ell(x, y, z, [0, 0.162, 0.108], [0.075, 0.022, 0.034]), bx([-0.08, 0.135, 0.07], [0.08, 0.19, 0.15]), 'gold', 0.006),
    add((x, y, z) => ell(x, y, z, [0, 0.105, 0.128], [0.042, 0.04, 0.04]), bx([-0.05, 0.06, 0.08], [0.05, 0.15, 0.172]), 'gold', 0.008),
    add((x, y, z) => ell(x, y, z, [0, 0.118, 0.164], [0.018, 0.012, 0.012]), bx([-0.02, 0.104, 0.15], [0.02, 0.132, 0.18]), 'bronze', 0.004),
    ...[1, -1].flatMap(s => [sub((x, y, z) => ell(x, y, z, [s * 0.033, 0.137, 0.135], [0.014, 0.009, 0.02]), bx([s * 0.033 - 0.016, 0.126, 0.11], [s * 0.033 + 0.016, 0.148, 0.16]), 'dark'),
      add((x, y, z) => ell(x, y, z, [s * 0.033, 0.137, 0.128], [0.0065, 0.005, 0.005]), bx([s * 0.033 - 0.008, 0.13, 0.12], [s * 0.033 + 0.008, 0.144, 0.136]), 'bronze'),
      add((x, y, z) => ell(x, y, z, [s * 0.04, 0.072, 0.128], [0.03, 0.016, 0.026]), bx([s * 0.04 - 0.032, 0.054, 0.1], [s * 0.04 + 0.032, 0.09, 0.156]), 'gold', 0.006),
      taper([s * 0.05, 0.064, 0.13], [s * 0.054, 0.022, 0.132], 0.0075, 0.0012, 'cream', 0.002), taper([s * 0.022, 0.06, 0.14], [s * 0.024, 0.028, 0.14], 0.0055, 0.0012, 'cream', 0.002),
      add((x, y, z) => Math.max(Math.abs(y - 0.036) - 0.0045 + Math.max(0, Math.abs(x) - 0.12) * 0.04, Math.abs(x) - 0.195, 0.095 - Math.abs(x), Math.abs(z - 0.03) - 0.034 + (Math.abs(x) - 0.095) * 0.25), bx([s > 0 ? 0.09 : -0.2, 0.028, -0.01], [s > 0 ? 0.2 : -0.09, 0.044, 0.07]), 'gold', 0.003),
      ...[0, 1, 2].map(i => rivet([s * (0.09 + i * 0.016), 0.06 - i * 0.004, 0.12 - i * 0.02], 0.0028, 'bronze'))]),
    taper([0, 0.236, -0.004], [0, 0.3, 0.0], 0.012, 0.002, 'gold', 0.005),
  ],
  /* Steel Helm (steelhelm): a dark gothic helm — pointed dome down to a V over the face, a centre ridge with a spike, slanted eye slits with
     a red glint, two embossed skulls on the brow */
  steelhelm: () => [
    add((x, y, z) => Math.max(ell(x, y, z, [0, 0.105, -0.004], [0.106, 0.148, 0.122]) - 0.003, (-0.065 + 0.45 * Math.abs(x) + Math.max(0, -z) * 0.6) - y), bx([-0.115, -0.07, -0.135], [0.115, 0.26, 0.13]), 'iron'),
    add((x, y, z) => Math.max(ell(x, y, z, [0, 0.105, -0.004], [0.106, 0.148, 0.122]) - 0.0095, Math.abs(x) - 0.0055, (-0.058) - y), bx([-0.007, -0.06, -0.14], [0.007, 0.265, 0.14]), 'iron', 0.002),
    taper([0, 0.248, -0.004], [0, 0.31, -0.002], 0.009, 0.0015, 'iron', 0.004),
    ...[1, -1].flatMap(s => [sub((x, y, z) => { const u = (x - s * 0.036), v = (y - 0.1) + u * s * 0.25; return Math.max(Math.abs(u) - 0.024, Math.abs(v) - 0.009, 0.085 - z); }, bx([s * 0.036 - 0.028, 0.082, 0.085], [s * 0.036 + 0.028, 0.12, 0.15]), 'dark'),
      add((x, y, z) => ell(x, y, z, [s * 0.034, 0.1, 0.096], [0.008, 0.0055, 0.004]), bx([s * 0.034 - 0.009, 0.093, 0.09], [s * 0.034 + 0.009, 0.107, 0.102]), 'red'),
    ]),
  ],
};
/* sculpt one helmet → geometry in head-local metres (head pivot = origin) */
export function sculptHelm(key, h = 0.0022, cell = 0.0045) {
  const t0 = performance.now(); const fd = run(fieldOf(HELM5[key](), h)); const m = meshField(fd, cell, { def: 'steel' }); m.ms = Math.round(performance.now() - t0); return m;
}

/* ======================= CUIRASSES (body metres, rest pose) — an offset shell of the body field ======================= */
/* ======================= CUIRASS FEATURES (round 6): each returns { h: extra offset (raised > 0), m: a material or null } ======================= */
const bump6 = (x, y, cx, cy, rx, ry) => { const q = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2; return q < 1 ? (1 - q) ** 1.5 : 0; };
function groove6(x, y, z) { if (z < 0) return 0; const ax = Math.abs(x); let g = 0;
  if (y > 1.12 && y < 1.34) g = Math.max(g, Math.exp(-((x / 0.0045) ** 2)));
  if (ax < 0.15 && y > 1.24) g = Math.max(g, Math.exp(-(((y - (1.315 + 0.3 * Math.max(0, ax - 0.03) ** 1.4 * 4)) / 0.005) ** 2)) * cl((0.15 - ax) / 0.03, 0, 1));
  for (const yr of [1.262, 1.205, 1.148]) if (ax < 0.062) g = Math.max(g, Math.exp(-(((y - yr) / 0.0038) ** 2)) * cl((0.062 - ax) / 0.012, 0, 1));
  if (ax > 0.06 && ax < 0.115 && y < 1.25) g = Math.max(g, Math.exp(-(((ax - 0.07 - (1.25 - y) * 0.25) / 0.005) ** 2)) * 0.7);
  return g; }
function relief6(x, y, z) { if (z < 0) return 0; let r = 0;
  for (const s of [1, -1]) { r += 0.016 * bump6(x, y, s * 0.068, 1.355, 0.07, 0.05);
    for (const yr of [1.288, 1.232, 1.176]) r += 0.013 * bump6(x, y, s * 0.03, yr, 0.026, 0.025);
    r += 0.01 * bump6(x, y, s * 0.032, 1.12, 0.026, 0.028); r += 0.007 * bump6(x, y, s * 0.105, 1.24, 0.03, 0.06); }
  return r; }
const muscles6 = (x, y, z, k) => relief6(x, y, z) * k - 0.006 * k * groove6(x, y, z);
/* overlapping scales: rows of scallops, each thickest at its lower edge (u across, y down) */
function scale6(u, y, s, amp) { const row = Math.floor((1.7 - y) / s), v = (1.7 - y) / s - row; const ux = u / s + (row % 2) * 0.5, fu = ux - Math.round(ux);
  const edge = 1 - (2 * fu) ** 2 - Math.max(0, v - 0.55) * 2.2; return edge > 0 ? amp * (0.35 + 0.65 * v) * Math.min(1, edge * 3) : 0; }
const around6 = (x, z) => Math.atan2(x, z + 0.02) * 0.15;   /* arc length around the torso */
function wreath6(x, y, cx, cy, R) { let r = 0; for (let a = -2.6; a <= 2.61; a += 0.29) { const lx = cx + Math.sin(a) * R, ly = cy + Math.cos(a) * R; const tg = a + Math.PI / 2;
    const dx = x - lx, dy = y - ly, u = dx * Math.cos(tg) + dy * Math.sin(tg), v = -dx * Math.sin(tg) + dy * Math.cos(tg); const q = (u / 0.011) ** 2 + (v / 0.0055) ** 2; if (q < 1) r = Math.max(r, (1 - q) ** 1.2); }
  return r; }
function rosette6(x, y, cx, cy, R) { const dx = x - cx, dy = y - cy, rr = hyp(dx, dy); if (rr > R) return 0; const a = Math.atan2(dy, dx);
  const pet = Math.cos(a * 8) * 0.5 + 0.5; const ring = rr > R * 0.82 ? 1 : 0; return rr < R * 0.22 ? 1.2 : ring ? 0.9 : rr < R * 0.75 ? 0.55 + 0.45 * pet * (rr / R) : 0.25; }
/* a feathered wing band along a line (the Plated chest): raised, with feather notches across it */
function wing6(x, y, a, b, w) { const ab = [b[0] - a[0], b[1] - a[1]], L2 = ab[0] ** 2 + ab[1] ** 2; const t = ((x - a[0]) * ab[0] + (y - a[1]) * ab[1]) / L2; if (t < 0 || t > 1) return 0;
  const px = a[0] + ab[0] * t, py = a[1] + ab[1] * t, d = hyp(x - px, y - py); const wt = w * (0.55 + 0.45 * Math.sin(t * Math.PI)); if (d > wt) return 0;
  const fe = ((t * 16) % 1); return 0.55 + 0.45 * (1 - fe) - (d / wt) ** 2 * 0.3; }
/* the figure panels of Flavius' chest: raised copper silhouettes (heads + bodies) */
const FIG6 = [[-0.07, 1.36], [-0.035, 1.38], [0.04, 1.37], [0.08, 1.35], [-0.06, 1.2], [0.0, 1.22], [0.055, 1.2]];
function figs6(x, y) { let r = 0; for (const [fx, fy] of FIG6) { r = Math.max(r, bump6(x, y, fx, fy + 0.03, 0.01, 0.011) , bump6(x, y, fx, fy, 0.014, 0.024), bump6(x, y, fx + 0.012, fy + 0.008, 0.016, 0.004) * 0.8, bump6(x, y, fx - 0.006, fy - 0.028, 0.005, 0.016), bump6(x, y, fx + 0.006, fy - 0.028, 0.005, 0.016)); } return r; }
export const CUIR6 = {
  musculata: { base: 'bronze', rim: 'gold', boss: [[0, 1.405, 0.135], [0.03, 0.026, 0.02]], bossM: 'gold', feat: (x, y, z) => ({ h: muscles6(x, y, z, 1) + (z > 0 ? 0.0022 : 0), m: null }) },
  thorax: { base: 'iron', rim: 'iron', high: 1, paul: 'scale', cell: 0.0112, feat: (x, y, z) => { const f = ((1.52 - y) * 15) % 1; let h = f * 0.0055;
    /* a rivet row along each lame's upper edge */ const ly = 1.52 - Math.floor((1.52 - y) * 15) / 15 - 0.008; const ux = around6(x, z) / 0.035, fu = ux - Math.round(ux); const rv = hyp(fu * 0.035, y - ly); if (rv < 0.0034) h += 0.004 * Math.sqrt(1 - (rv / 0.0034) ** 2);
    return { h, m: null }; } },
  pectorale: { base: 'bronze', rim: 'bronze', feat: (x, y, z) => ({ h: muscles6(x, y, z, 0.45), m: null }) },
  lorica: { base: 'gold', rim: 'bronze', feat: (x, y, z) => ({ h: scale6(around6(x, z), y, 0.016, 0.0045), m: null }) },
  amazon: { base: 'gold', rim: 'gold', feat: (x, y, z) => { if (z < 0) return { h: 0, m: null }; const w = Math.max(wing6(x, y, [-0.15, 1.44], [0.11, 1.12], 0.045), wing6(x, y, [0.15, 1.44], [-0.11, 1.12], 0.045));
    return { h: muscles6(x, y, z, 0.3) + 0.012 * w, m: w > 0.3 ? 'bronze' : null }; } },
  flavchest: { base: 'dark2', rim: 'dark2', skirt: 'red', bot: 1.12, feat: (x, y, z) => { if (z < 0) return { h: 0, m: null }; const f = figs6(x, y); return { h: 0.0022 + 0.008 * f, m: f > 0.15 ? 'copper' : null }; } },
  ornate: { base: 'gold', rim: 'gold', high: 1, feat: (x, y, z) => { const band = y > 1.4 && z > 0; let h = muscles6(x, y, z, 0.4), m = null;
    if (band) { h += 0.003 + scale6(x, y, 0.012, 0.0028); m = Math.abs(y - 1.405) < 0.006 || y > 1.47 ? 'gold' : 'lblue'; }
    if (z > 0) for (const s of [1, -1]) { const r = rosette6(x, y, s * 0.062, 1.26, 0.032); if (r > 0) { h += 0.006 * r; m = r > 1 || (r > 0.5 && r < 0.95) ? 'lblue' : 'cream'; } }
    return { h, m }; } },
};
export function sculptCuirass(B, key, h = 0.0025, cell = 0.0072) {
  const t0 = performance.now(); const K = B.kit, fd = K.fd, P = K.P;
  const S = { L: P('sL'), R: P('sR') }, E = { L: P('eL'), R: P('eR') }, Wr = { L: P('wL'), R: P('wR') };
  const CF = CUIR6[key]; const high = !!CF.high;
  const top = (x) => { const ax = Math.abs(x); return ax < 0.065 ? (high ? 1.47 : 1.43) + ax * 0.45 : ax < 0.165 ? 1.538 : 1.52 - (ax - 0.165) * 1.3; };
  const bot = CF.bot || 1.088;
  const OFF = 0.0135, T = 0.0034;
  const region = (x, y, z) => { const dA = Math.min(seg(x, y, z, S.L, E.L), seg(x, y, z, S.R, E.R)); const dN = hyp(x, (z + 0.02) * 1.1);
    return Math.max(bot - y, y - top(x), y < 1.44 ? 0.088 - dA : 0.05 - dA, Math.abs(x) - 0.2, y > 1.47 ? 0.072 - dN : -1); };
  const X = { S, top, groove: groove6, relief: relief6 };
  const feat = (x, y, z) => CF.feat ? CF.feat(x, y, z, X) : { h: 0, m: null };
  const fn = (x, y, z) => {
    const fb = sampleF100(fd, x, y, z); if (fb > (CF.paul ? 0.085 : 0.05)) return 0.02; if (fb < -0.02) return Math.max(-0.006, region(x, y, z));
    const F = feat(x, y, z); const off = OFF + F.h;
    const r = region(x, y, z); let d = Math.max(fb - off - T, r);   /* SOLID down into the body: no inner face to show through */
    const rim = Math.max(Math.abs(fb - off - 0.002) - T - 0.0024, Math.abs(r + 0.007) - 0.0055); d = smin(d, rim, 0.002);
    for (const s of [1, -1]) { const rp = [s * 0.11, 1.5, 0.045]; const dr = hyp(x - rp[0], y - rp[1], z - rp[2]) - 0.006; if (dr < d) d = Math.min(d, dr); }
    if (CF.boss) { const b = ell(x, y, z, ...CF.boss); d = smin(d, b, 0.004); }
    if (CF.skirt) { /* a hanging band below the cuirass (the red skirt of Flavius' chest) */
      const ys = y; if (ys < bot + 0.01 && ys > bot - 0.07) { const dW = Math.min(seg(x, y, z, E.L, Wr.L), seg(x, y, z, E.R, Wr.R)); const sd = Math.max(fb - 0.022 - 0.004 * Math.sin(Math.atan2(x, z) * 28) ** 2 - T, ys - bot - 0.01, bot - 0.07 - ys, Math.abs(x) - 0.19, 0.07 - dW); d = Math.min(d, sd); } }
    if (CF.paul) for (const s of ['L', 'R']) { const sx = s === 'L' ? 1 : -1, c0 = S[s];   /* pauldron: one solid curved plate; stepped lames or riveted scales */
      const c = [c0[0] + sx * 0.03, c0[1] + 0.0, c0[2] - 0.004], rr = [0.125, 0.092, 0.104];
      const step = cl((c[1] + 0.06 - y) / 0.03, 0, 2.99), lm = Math.floor(step) * 0.0045;
      const aa = Math.atan2(z - c[2], (x - c[0]) * sx + 0.06) * 0.11;
      const sc = CF.paul === 'scale' ? scale6(aa, y, 0.017, 0.0042) : 0;
      const ee = ell(x, y, z, c, rr) + lm - sc; let pd = Math.max(ee - 0.004, -ee - 0.016, (c[1] - 0.045) - y, (c0[0] * sx - 0.045) - x * sx);
      if (CF.paul === 'scale') { /* a rivet at the top of each scale */ const rw = 0.017, row = Math.floor((1.7 - y) / rw), ux = aa / rw + (row % 2) * 0.5, fu = ux - Math.round(ux), vy = (1.7 - y) / rw - row;
        const rv = hyp(fu * rw, (vy - 0.22) * rw) - 0.0032; if (rv < 0.004 && ee < 0.012) pd = Math.min(pd, Math.max(ee - 0.0055 - (0.0032 - Math.max(0, rv + 0.0032)), rv)); }
      d = Math.min(d, pd); }
    return d; };
  const matFn = (x, y, z) => { if (CF.skirt && y < bot + 0.008) return CF.skirt; const F = feat(x, y, z); if (F.m) return F.m;
    if (CF.boss && ell(x, y, z, CF.boss[0], CF.boss[1].map(v => v + 0.004)) < 0) return CF.bossM || CF.rim;
    const r = region(x, y, z); if (r > -0.009) return CF.rim; return CF.base; };
  const box = [[-0.4, (CF.skirt ? bot - 0.08 : 1.0), -0.24], [0.4, 1.64, 0.24]];
  const f2 = run(fieldFn(fn, matFn, box, h)); const m = meshField(f2, CF.cell || cell, { def: CF.base, aoStep: 0.004 });
  skin7(B, m.geo);
  m.ms = Math.round(performance.now() - t0); return m;
}

/* ======================= ROUND 7: BELTS + LIMB PIECES — an offset shell of the body field around ONE limb segment (or a waist band),
   cut to its span along the bone and its sector around it, solid down into the limb, skinned from that limb's own body vertices.
   Layers (round 3): pad 6 mm · mail 9 · plate 12.5 · belt 19. Each piece: seg [from, to] joints (side added), t span, sector (radians
   either side of the outward/forward direction, or full), base/rim material, feat(t, ang, s) → { h, m } relief. ======================= */
const lames7 = (t, t0, t1, n, step, base = 0) => { const u = cl((t - t0) / (t1 - t0), 0, 0.9999) * n, i = Math.floor(u), f = u - i; return base + f * step + i * step * 0.15; };
const bandsOf7 = (t, n) => { const f = (t * n) % 1; return Math.min(f, 1 - f); };
export const LIMB7 = {
  /* padded wraps: a bound cloth sleeve, ridged bands that spiral a little */
  wraps: { seg: ['e', 'w'], t: [0.06, 0.97], off: 0.006, T: 0.004, base: 'cloth', rim: 'cloth', feat: (t, a) => ({ h: 0.0032 * Math.abs(Math.sin((t * 11 + a / 6.283) * Math.PI)), m: null }) },
  legwraps: { seg: ['k', 'a'], t: [0.1, 0.86], off: 0.006, T: 0.004, base: 'cloth', rim: 'cloth', feat: (t, a) => ({ h: 0.0034 * Math.abs(Math.sin((t * 13 + a / 6.283) * Math.PI)), m: null }) },
  /* Flavius' Bracers: a gold forearm guard, raised rims at both ends and a ridge down the outside */
  bracers: { seg: ['e', 'w'], t: [0.3, 0.95], off: 0.0125, T: 0.0034, base: 'gold', rim: 'gold', sector: 2.3, feat: (t, a) => ({ h: 0.004 * Math.exp(-((a / 0.12) ** 2)) + (t < 0.36 || t > 0.89 ? 0.0028 : 0), m: null }) },
  /* the Galerus (manica): lames down the upper arm under a tall gold shoulder flange */
  manica: { seg: ['s', 'e'], t: [0.05, 1.08], off: 0.011, T: 0.0034, base: 'cream', rim: 'bronze', feat: (t) => ({ h: lames7(t, 0.12, 1.08, 6, 0.007), m: t < 0.12 ? 'gold' : null }), flange: 'gold' },
  /* the Manica (Provocator): a fur mantle over the shoulder with a scaled steel plate on the outside */
  provmanica: { seg: ['s', 'e'], t: [-0.12, 0.62], off: 0.014, T: 0.005, base: 'fur', rim: 'fur', feat: (t, a) => { const plate = Math.abs(a) < 0.95 && t > -0.02 && t < 0.5;
    return plate ? { h: 0.008 + scale6(a * 0.05, t * 0.25, 0.012, 0.0025), m: 'steel' } : { h: 0.006 * Math.abs(Math.sin(t * 60 + a * 9)) * Math.abs(Math.cos(t * 23 - a * 13)), m: null }; } },
  /* Lorica Segmentata arm (galerus): four big steel lames over the shoulder and upper arm */
  galerus: { seg: ['s', 'e'], t: [-0.16, 0.72], off: 0.0125, T: 0.0036, base: 'steel', rim: 'steel', feat: (t) => ({ h: lames7(t, -0.16, 0.72, 4, 0.009), m: null }) },
  /* tassets: three overlapping plates hanging down the front/outside of the thigh */
  legwrapsU: { seg: ['h', 'k'], t: [0.06, 0.78], off: 0.0125, T: 0.0034, base: 'leather', rim: 'leather', sector: 1.9, out: 0.6, feat: (t) => ({ h: lames7(t, 0.06, 0.78, 3, 0.008), m: null }) },
  femoralia: { seg: ['h', 'k'], t: [0.06, 0.82], off: 0.0125, T: 0.0036, base: 'olive', rim: 'olive', sector: 1.9, out: 0.6, feat: (t) => ({ h: lames7(t, 0.06, 0.82, 3, 0.009), m: null }) },
  thighplate: { seg: ['h', 'k'], t: [0.06, 0.82], off: 0.0125, T: 0.0036, base: 'gold', rim: 'gold', sector: 1.9, out: 0.6, feat: (t) => ({ h: lames7(t, 0.06, 0.82, 3, 0.009), m: null }) },
  /* greaves: shin plates from over the knee to the instep; a knee cop (round · domed · pointed) */
  ocrea: { seg: ['k', 'a'], t: [-0.1, 0.9], off: 0.0125, T: 0.0036, base: 'gold', rim: 'gold', sector: 1.75, knee: 'round', feat: (t, a) => ({ h: 0.003 * Math.exp(-((a / 0.2) ** 2)), m: null }) },
  greaves: { seg: ['k', 'a'], t: [-0.12, 0.9], off: 0.0125, T: 0.0036, base: 'gold', rim: 'bronze', sector: 1.8, knee: 'round', feat: (t, a) => ({ h: Math.abs(a) > 1.45 ? 0.0028 : 0, m: Math.abs(a) > 1.45 ? 'bronze' : null }) },
  cnemis: { seg: ['k', 'a'], t: [-0.12, 0.9], off: 0.0125, T: 0.0036, base: 'steel', rim: 'steel', sector: 1.8, knee: 'point', feat: (t, a) => ({ h: 0.0035 * Math.exp(-((a / 0.16) ** 2)), m: null }) },
  lgreaves: { seg: ['k', 'a'], t: [0.0, 0.9], off: 0.011, T: 0.004, base: 'dleather', rim: 'leather', sector: 2.2, feat: (t, a) => ({ h: (t < 0.05 || t > 0.85 || Math.abs(a) > 2.05) ? 0.0026 : 0, m: null }) },
  /* belts: a waist band over everything; Belt II = dark red leather with a gold plaque, Belt I = brown leather with an iron ring buckle */
  balteus: { belt: [0.985, 1.07], off: 0.019, T: 0.004, base: 'dred', rim: 'gold', plaque: 'gold' },
  balteus1: { belt: [0.99, 1.06], off: 0.019, T: 0.004, base: 'leather', rim: 'dleather', ring: 'iron' },
};
export function sculptLimb(B, key, sd = 'L', h = 0.0022, cell = 0.005) {
  const t0 = performance.now(); const K = B.kit, fd = K.fd, P = K.P, Q = LIMB7[key]; const sx = sd === 'L' ? 1 : -1;
  const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], nrm = (a) => { const l = Math.hypot(...a); return a.map(v => v / l); };
  const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  /* the other bones, so a piece never wraps a neighbour (the other thigh, the hip a hand hangs by, the chest beside the upper arm) */
  const SEGS = [['pe', 'ne', 0.075], ['sL', 'eL', 0], ['eL', 'wL', 0], ['sR', 'eR', 0], ['eR', 'wR', 0], ['hL', 'kL', 0], ['kL', 'aL', 0], ['hR', 'kR', 0], ['kR', 'aR', 0]].map(([a, b, r]) => [P(a), P(b), r, a + b]);
  let fn, matFn, box, near;
  if (Q.belt) {
    const [y0, y1] = Q.belt;
    const region = (x, y, z) => { let dO = 9; for (const [a, b, r, nm] of SEGS) if (nm[0] === 'e' || nm[0] === 'w') dO = Math.min(dO, seg(x, y, z, a, b)); return Math.max(y0 - y, y - y1, 0.075 - dO); };
    const feat = (x, y, z) => { let hh = 0, m = null; const yc = (y0 + y1) / 2;
      if (Math.abs(y - y0) < 0.005 || Math.abs(y - y1) < 0.005) { hh += 0.0022; m = Q.rim; }
      if (Q.plaque && z > 0) { const q = (x / 0.06) ** 2 + ((y - yc) / ((y1 - y0) * 0.62)) ** 2; if (q < 1) { hh += 0.006 * Math.sqrt(1 - q) + 0.002; m = Q.plaque; } }
      return { h: hh, m }; };
    fn = (x, y, z) => { const fb = sampleF100(fd, x, y, z); if (fb > 0.06) return 0.02; const r = region(x, y, z); if (fb < -0.02) return Math.max(-0.006, r);
      const F = feat(x, y, z); let d = Math.max(fb - Q.off - F.h - Q.T, r);
      if (Q.ring) { const c = [0, (y0 + y1) / 2, 0]; /* the ring sits on the front: find the body's front at the belt line */ const zf = 0.0; void zf;
        const rp = [x, y - c[1], z - RINGZ7]; d = Math.min(d, hyp(hyp(rp[0], rp[1]) - 0.021, rp[2]) - 0.0042); }
      return d; };
    let RINGZ7 = 0.15; { /* march from the front to the body surface on the belt line */ for (let z = 0.25; z > 0; z -= 0.002) if (sampleF100(fd, 0, (y0 + y1) / 2, z) < 0) { RINGZ7 = z + Q.off + Q.T + 0.012; break; } }
    matFn = (x, y, z) => { if (Q.ring && hyp(hyp(x, y - (y0 + y1) / 2) - 0.021, z - RINGZ7) < 0.008) return Q.ring; const F = feat(x, y, z); return F.m || Q.base; };
    box = [[-0.24, y0 - 0.012, -0.2], [0.24, y1 + 0.012, 0.22]]; near = (x, y) => y > y0 - 0.06 && y < y1 + 0.06;
  } else {
    const A = P(Q.seg[0] + sd), Bp = P(Q.seg[1] + sd), ax = sub3(Bp, A), L = Math.hypot(...ax), u = ax.map(v => v / L);
    const fz = nrm(sub3([0, 0, 1], u.map(v => v * u[2]))), side = nrm(crs(u, fz)); const sideOut = side[0] * sx > 0 ? side : side.map(v => -v);
    /* the sector is centred between forward and outward (out = 0 front · 1 outside) */
    const cen = nrm(fz.map((v, i) => v * (1 - (Q.out || 0)) + sideOut[i] * (Q.out || 0)));
    const cen2 = nrm(crs(u, cen));
    const own = Q.seg[0] + sd + Q.seg[1] + sd;
    const frame = (x, y, z) => { const v = sub3([x, y, z], A); const tl = dot(v, u) / L; const tc = cl(tl, 0, 1); const r = sub3(v, u.map(w => w * tc * L)); const a = Math.atan2(dot(r, cen2), dot(r, cen)); return [tl, a, Math.hypot(...r)]; };
    const region = (x, y, z, tl, a) => { let dOwn = seg(x, y, z, A, Bp), dO = 9; for (const [a1, b1, r1, nm] of SEGS) if (nm !== own) dO = Math.min(dO, seg(x, y, z, a1, b1) - r1);
      return Math.max(Q.t[0] - tl, tl - Q.t[1], Q.sector ? Math.abs(a) - Q.sector : -1, (dOwn - dO) * 0.6, dOwn - 0.11); };
    fn = (x, y, z) => { const fb = sampleF100(fd, x, y, z); if (fb > 0.07) return 0.02; const [tl, a] = frame(x, y, z); const r = region(x, y, z, tl, a); if (fb < -0.02) return Math.max(-0.006, r);
      const F = Q.feat ? Q.feat(tl, a) : { h: 0 }; let d = Math.max(fb - Q.off - F.h - Q.T, r);
      const rim = Math.max(Math.abs(fb - Q.off - F.h - 0.0015) - Q.T - 0.0018, Math.abs(r + 0.005) - 0.004); d = smin(d, rim, 0.0015);
      if (Q.knee) { const kc = P('k' + sd), kp = kc.map((v, i) => v + fz[i] * 0.058 + u[i] * 0.005);
        const kd = Q.knee === 'point' ? Math.max(ell(x, y, z, kp, [0.042, 0.05, 0.03]), -1) - 0.004 * cl((y - kp[1]) / 0.05 + 1, 0, 2) : ell(x, y, z, kp, [0.044, 0.046, 0.028]);
        d = smin(d, kd, 0.006); }
      if (Q.flange) { const sc = P('s' + sd), fp = [sc[0] + sx * 0.06, sc[1] + 0.07, sc[2] - 0.005];   /* a tall curved plate standing up over the shoulder, on the outside */
        const fl = Math.max(Math.abs(ell(x, y, z, [sc[0] - sx * 0.02, sc[1] + 0.02, sc[2]], [0.11, 0.11, 0.1])) - 0.003, (sc[0] + sx * 0.035 - x) * sx, sc[1] - 0.01 - y, y - (sc[1] + 0.13) + Math.abs(z - sc[2]) * 0.8);
        d = Math.min(d, fl); void fp; }
      return d; };
    matFn = (x, y, z) => { const [tl, a] = frame(x, y, z); if (Q.flange) { const sc = P('s' + sd); if ((x - sc[0]) * sx > 0.03 && y > sc[1] - 0.005) return Q.flange; }
      if (Q.knee) { const kc = P('k' + sd); if (hyp(x - kc[0] - fz[0] * 0.058, y - kc[1], z - kc[2] - fz[2] * 0.058) < 0.05) return Q.base; }
      const F = Q.feat ? Q.feat(tl, a) : { m: null }; if (F.m) return F.m; const r = region(x, y, z, tl, a); if (r > -0.006) return Q.rim; return Q.base; };
    const lo = [0, 1, 2].map(i => Math.min(A[i], Bp[i]) - 0.14), hi = [0, 1, 2].map(i => Math.max(A[i], Bp[i]) + 0.14 + (Q.flange && i === 1 ? 0.08 : 0)); box = [lo, hi];
    near = (x, y, z) => { const dOwn = seg(x, y, z, A, Bp); return dOwn < 0.13; };
  }
  const f2 = run(fieldFn(fn, matFn, box, h)); const m = meshField(f2, Q.cell || cell, { def: Q.base, aoStep: 0.003 });
  skin7(B, m.geo, near); m.ms = Math.round(performance.now() - t0); return m;
}

/* skin a body-space mesh: each vertex takes the weights of the nearest body vertex (spatial hash); near = optional (x,y,z) → true for
   body vertices allowed (keeps a forearm piece off the hip it hangs beside) */
function skin7(B, geo, near) {
  const bg = B.body.geometry, bp = bg.attributes.position, bsI = bg.attributes.skinIndex, bsW = bg.attributes.skinWeight, C = 0.02, grid = new Map();
  for (let i = 0; i < bp.count; i++) { const y = bp.getY(i); if (near ? !near(bp.getX(i), y, bp.getZ(i)) : y < 0.95) continue; const k = Math.floor(bp.getX(i) / C) + ',' + Math.floor(y / C) + ',' + Math.floor(bp.getZ(i) / C); let L = grid.get(k); if (!L) grid.set(k, L = []); L.push(i); }
  const pos = geo.attributes.position, n = pos.count, SI = new Uint16Array(n * 4), SW = new Float32Array(n * 4);
  for (let v = 0; v < n; v++) { const x = pos.getX(v), y = pos.getY(v), z = pos.getZ(v); const cx = Math.floor(x / C), cy = Math.floor(y / C), cz = Math.floor(z / C); let best = -1, bd = 1e9;
    for (let r = 1; r <= 3 && best < 0; r++) for (let dz = -r; dz <= r; dz++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const L = grid.get((cx + dx) + ',' + (cy + dy) + ',' + (cz + dz)); if (!L) continue;
      for (const i of L) { const d = (bp.getX(i) - x) ** 2 + (bp.getY(i) - y) ** 2 + (bp.getZ(i) - z) ** 2; if (d < bd) { bd = d; best = i; } } }
    for (let q = 0; q < 4; q++) { SI[v * 4 + q] = best >= 0 ? bsI.getComponent(best, q) : 0; SW[v * 4 + q] = best >= 0 ? bsW.getComponent(best, q) : q === 0 ? 1 : 0; } }
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(SI, 4)); geo.setAttribute('skinWeight', new THREE.BufferAttribute(SW, 4));
}
/* ---------- put a sculpted piece on the token (cached per body) ---------- */
export const SCULPT5 = new Set([...Object.keys(HELM5), ...Object.keys(CUIR6), ...Object.keys(LIMB7)]);
export const STATS5 = {};
export function wear5(B, key, sd) {
  const K = B.kit; B._s5 = B._s5 || {}; const ck = LIMB7[key] && !LIMB7[key].belt ? key + (sd || 'L') : key; let m = B._s5[ck];
  if (!m) { m = HELM5[key] ? sculptHelm(key) : LIMB7[key] ? sculptLimb(B, key, sd || 'L') : sculptCuirass(B, key); B._s5[ck] = m; STATS5[ck] = { tris: m.tris, trisFine: m.tris0, verts: m.verts, ms: m.ms }; }
  const mat = K.makeToon('#ffffff', { vertexColors: true, side: THREE.DoubleSide });
  if (HELM5[key]) { const g = m.geo.clone(); const s = 1.07 * K.hs; g.scale(s, s, s); const mesh = K.rigid(g, mat, 'he', K.HO, null); mesh.userData.ownMat = 1; return [mesh]; }
  const sm = new THREE.SkinnedMesh(m.geo.clone(), mat); sm.bind(B.body.skeleton, B.body.bindMatrix); sm.frustumCulled = false; sm.userData.ownMat = 1; sm.name = 's5_' + key;
  B.group.add(sm); sm.userData.ink = K.addOutline(sm, false); return [sm];
}
