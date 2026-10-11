/* babylon100/export.js — bakes the mock-up's 3D pieces to glTF (.glb) for the Babylon scene.
     node tools/plans/babylon100/export.js
   Headless Chromium (SwiftShader WebGL) opens export.html, which builds FOUR gladiators with the real rig92 token engine
   (assets/tok93.js + assets/gear100.js, his printed pieces) and TWO beasts with look100/beast3_rig.js, baked to triangle soups.
   Here (node): meshoptimizer (tools/art/rig92/vendor/meshopt_simplifier.mjs, MIT) simplifies each one colour-aware to a budget,
   normals are recomputed, and a minimal glTF 2.0 binary is written by hand: POSITION, NORMAL, COLOR_0, JOINTS_0/WEIGHTS_0 + ONE skin
   (gladiators: rig92's own skeleton and weights; beasts: their sculpt's joint list, skinned here) and TWO LOD meshes on that skin
   (lod0 full budget, lod1 ~1/5) so Babylon animates bones on the GPU and swaps detail by screen size.  → models/*.glb + models/stats.json */
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'), path = require('path');
const HERE = __dirname, ROOT = path.resolve(HERE, '../../..'), PORT = 8871, OUT = path.join(HERE, 'models');
fs.mkdirSync(OUT, { recursive: true });
const GLAD_TRIS = +(process.env.GLAD_TRIS || 20000), BEAST_TRIS = +(process.env.BEAST_TRIS || 9000), GLAD_LO = 4000, BEAST_LO = 2000;

const KITS = {
  murmillo: { look: { hs: 'crop', skin: '#b07c5c', cloth: '#7a1c14' }, gear: { head: { t: 'murmillo' }, belt: { t: 'balteus' }, arm: { R: { upper: { t: 'manica' }, wraps: 1 }, L: { wraps: 1 } }, leg: { L: { lower: { t: 'ocrea' } }, R: { lower: { t: 'legwraps' } } }, wR: { t: 'sword', k: 'gladius' }, wL: { t: 'scutum', k: 'scutum' } } },
  thraex: { look: { hs: 'crop', skin: '#9a6a4c', cloth: '#5c6a2a', bs: 'stubble' }, gear: { head: { t: 'thrachelm' }, arm: { L: { upper: { t: 'provmanica' }, wraps: 1 }, R: { wraps: 1 } }, leg: { L: { lower: { t: 'cnemis' } }, R: { lower: { t: 'cnemis' } } }, wR: { t: 'sica', k: 'sica' }, wL: { t: 'parma', k: 'thracian' } } },
  royalty: { look: { hs: 'crop', skin: '#c9946e', cloth: '#2c3550', hair: '#2a1a10' }, gear: { head: { t: 'cassis' }, chest: { t: 'ornate' }, arm: { R: { wraps: 1 }, L: { wraps: 1 } }, wR: { t: 'dagger', k: 'pugio' } } },
  venatore: { look: { hs: 'crop', skin: '#8c5e40', cloth: '#5a3466', bs: 'full' }, gear: { head: { t: 'steelhelm' }, belt: { t: 'balteus1' }, arm: { R: { wraps: 1 }, L: { wraps: 1 } }, leg: { L: { lower: { t: 'legwraps' } }, R: { lower: { t: 'legwraps' } } }, wR: { t: 'spear', k: 'hasta' } } },
};
const BEASTS = { leo: ['idle0'], ursa: ['idle0'] };

const f32 = (s) => { const b = Buffer.from(s, 'base64'); return new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4).slice(); };
const u16f = (s) => { const b = Buffer.from(s, 'base64'); return Float32Array.from(new Uint16Array(b.buffer, b.byteOffset, b.byteLength / 2)); };
const u32 = (s) => { const b = Buffer.from(s, 'base64'); return new Uint32Array(b.buffer, b.byteOffset, b.byteLength / 4).slice(); };

/* simplify + compact; returns {idx, keep(remap old→new), nv} */
function simplify(SIMP, pos, col, idx, budget) {
  let err = 0;
  if (idx.length / 3 > budget) { const r = SIMP.simplifyWithAttributes(idx, pos, 3, col, 3, [0.5, 0.5, 0.5], null, budget * 3, 0.02, []); idx = r[0]; err = r[1]; }
  const remap = new Int32Array(pos.length / 3).fill(-1); let nv = 0; const ni = new Uint32Array(idx.length);
  for (let i = 0; i < idx.length; i++) { const v = idx[i]; if (remap[v] < 0) remap[v] = nv++; ni[i] = remap[v]; }
  return { idx: ni, remap, nv, err };
}
const pick = (src, remap, nv, n = 3) => { const o = new Float32Array(nv * n); for (let v = 0; v < remap.length; v++) { const r = remap[v]; if (r >= 0) for (let a = 0; a < n; a++) o[r * n + a] = src[v * n + a]; } return o; };
function normals(pos, idx) {
  const n = new Float32Array(pos.length);
  for (let t = 0; t < idx.length; t += 3) { const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2], vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    const x = uy * vz - uz * vy, y = uz * vx - ux * vz, z = ux * vy - uy * vx; for (const p of [a, b, c]) { n[p] += x; n[p + 1] += y; n[p + 2] += z; } }
  for (let i = 0; i < n.length; i += 3) { const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1; n[i] /= l; n[i + 1] /= l; n[i + 2] /= l; }
  return n;
}
/* ---------- 4×4 helpers (column-major, like glTF/three) ---------- */
const mmul = (a, b) => { const o = new Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; };
function minv(m) { const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = m;
  const b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12,
    b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
  const d = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);
  return [(a11 * b11 - a12 * b10 + a13 * b09) * d, (a02 * b10 - a01 * b11 - a03 * b09) * d, (a31 * b05 - a32 * b04 + a33 * b03) * d, (a22 * b04 - a21 * b05 - a23 * b03) * d,
    (a12 * b08 - a10 * b11 - a13 * b07) * d, (a00 * b11 - a02 * b08 + a03 * b07) * d, (a32 * b02 - a30 * b05 - a33 * b01) * d, (a20 * b05 - a22 * b02 + a23 * b01) * d,
    (a10 * b10 - a11 * b08 + a13 * b06) * d, (a01 * b08 - a00 * b10 - a03 * b06) * d, (a30 * b04 - a31 * b02 + a33 * b00) * d, (a21 * b02 - a20 * b04 - a23 * b00) * d,
    (a11 * b07 - a10 * b09 - a12 * b06) * d, (a00 * b09 - a01 * b07 + a02 * b06) * d, (a31 * b01 - a30 * b03 - a32 * b00) * d, (a20 * b03 - a21 * b01 + a22 * b00) * d]; }
function trs(m) {   /* uniform-scale decompose */
  const s = Math.hypot(m[0], m[1], m[2]) || 1; const r = [m[0] / s, m[1] / s, m[2] / s, m[4] / s, m[5] / s, m[6] / s, m[8] / s, m[9] / s, m[10] / s];
  const [m00, m10, m20, m01, m11, m21, m02, m12, m22] = r, tr = m00 + m11 + m22; let q;
  if (tr > 0) { const S = Math.sqrt(tr + 1) * 2; q = [(m21 - m12) / S, (m02 - m20) / S, (m10 - m01) / S, 0.25 * S]; }
  else if (m00 > m11 && m00 > m22) { const S = Math.sqrt(1 + m00 - m11 - m22) * 2; q = [0.25 * S, (m01 + m10) / S, (m02 + m20) / S, (m21 - m12) / S]; }
  else if (m11 > m22) { const S = Math.sqrt(1 + m11 - m00 - m22) * 2; q = [(m01 + m10) / S, 0.25 * S, (m12 + m21) / S, (m02 - m20) / S]; }
  else { const S = Math.sqrt(1 + m22 - m00 - m11) * 2; q = [(m02 + m20) / S, (m12 + m21) / S, 0.25 * S, (m10 - m01) / S]; }
  const l = Math.hypot(...q); return { translation: [m[12], m[13], m[14]], rotation: q.map(v => v / l), scale: [s, s, s] }; }
/* ---------- a minimal glb writer: one skin (bones = [{k, par, m(tile-space world matrix at bind)}]), LOD meshes sharing it ---------- */
function glb(bones, meshes) {   /* meshes: [{name, pos, nor, col(linear rgb), idx, sj(Uint16 ×4), sw(Float32 ×4)}] */
  const bufs = []; let off = 0; const views = [], accs = [];
  const view = (ta, target) => { const b = Buffer.from(ta.buffer, ta.byteOffset, ta.byteLength); const pad = (4 - (b.length % 4)) % 4; views.push({ buffer: 0, byteOffset: off, byteLength: b.length, ...(target ? { target } : {}) }); bufs.push(b, Buffer.alloc(pad)); off += b.length + pad; return views.length - 1; };
  const N = { VEC3: 3, VEC4: 4, SCALAR: 1, MAT4: 16 };
  const acc = (ta, type, ct, target, extra = {}) => { accs.push({ bufferView: view(ta, target), componentType: ct, count: ta.length / N[type], type, ...extra }); return accs.length - 1; };
  const minmax = (p) => { const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; for (let i = 0; i < p.length; i += 3) for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a], p[i + a]); mx[a] = Math.max(mx[a], p[i + a]); } return { min: mn, max: mx }; };
  const nodes = [], rootsIx = [];
  bones.forEach((b, i) => { const local = b.par < 0 ? b.m : mmul(minv(bones[b.par].m), b.m); nodes.push({ name: b.k, ...trs(local) }); });
  bones.forEach((b, i) => { if (b.par < 0) rootsIx.push(i); else (nodes[b.par].children = nodes[b.par].children || []).push(i); });
  const ibm = new Float32Array(bones.length * 16); bones.forEach((b, i) => ibm.set(minv(b.m), i * 16));
  const skin = { joints: bones.map((_, i) => i), inverseBindMatrices: acc(ibm, 'MAT4', 5126), skeleton: rootsIx[0] };
  const gm = [];
  for (const m of meshes) {
    const nv = m.pos.length / 3; const c16 = new Uint16Array(nv * 4); for (let v = 0; v < nv; v++) { for (let a = 0; a < 3; a++) c16[v * 4 + a] = Math.round(Math.max(0, Math.min(1, m.col[v * 3 + a])) * 65535); c16[v * 4 + 3] = 65535; }
    const attrs = { POSITION: acc(m.pos, 'VEC3', 5126, 34962, minmax(m.pos)), NORMAL: acc(m.nor, 'VEC3', 5126, 34962), COLOR_0: acc(c16, 'VEC4', 5123, 34962, { normalized: true }),
      JOINTS_0: acc(Uint8Array.from(m.sj), 'VEC4', 5121, 34962), WEIGHTS_0: acc(m.sw, 'VEC4', 5126, 34962) };
    const idx = nv < 65536 ? Uint16Array.from(m.idx) : m.idx;
    gm.push({ name: m.name, primitives: [{ attributes: attrs, indices: acc(idx, 'SCALAR', nv < 65536 ? 5123 : 5125, 34963), material: 0, mode: 4 }] });
    nodes.push({ name: m.name, mesh: gm.length - 1, skin: 0 }); rootsIx.push(nodes.length - 1);
  }
  const json = { asset: { version: '2.0', generator: 'flavius babylon100/export.js' }, scene: 0, scenes: [{ nodes: rootsIx }], nodes, meshes: gm, skins: [skin],
    materials: [{ name: 'vc', pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 0.85 } }], accessors: accs, bufferViews: views, buffers: [{ byteLength: off }] };
  let js = Buffer.from(JSON.stringify(json)); js = Buffer.concat([js, Buffer.alloc((4 - js.length % 4) % 4, 0x20)]);
  const bin = Buffer.concat(bufs); const head = Buffer.alloc(12); head.writeUInt32LE(0x46546C67, 0); head.writeUInt32LE(2, 4); head.writeUInt32LE(12 + 8 + js.length + 8 + bin.length, 8);
  const ch = (len, type) => { const b = Buffer.alloc(8); b.writeUInt32LE(len, 0); b.writeUInt32LE(type, 4); return b; };
  return Buffer.concat([head, ch(js.length, 0x4E4F534A), js, ch(bin.length, 0x004E4942), bin]);
}
/* simplify to a budget and build one LOD mesh (with per-vertex arrays picked through the remap) */
function lod(SIMP, name, src, budget) {
  const s = simplify(SIMP, src.pos, src.col, src.idx, budget); const P = pick(src.pos, s.remap, s.nv);
  const out = { name, pos: P, nor: normals(P, s.idx), col: pick(src.col, s.remap, s.nv), idx: s.idx, tris: s.idx.length / 3, verts: s.nv, err: s.err };
  if (src.sj) { out.sj = pick(src.sj, s.remap, s.nv, 4); out.sw = pick(src.sw, s.remap, s.nv, 4); }
  return out;
}
/* beasts: skin a sculpt to its joint list — each vertex to the 2 nearest bone SEGMENTS (parent→joint, owned by the parent bone) */
function skinToJoints(pos, joints) {
  const ix = new Map(joints.map((j, i) => [j.n, i])); const seg = joints.filter(j => j.par && ix.has(j.par)).map(j => ({ b: ix.get(j.par), a: joints[ix.get(j.par)].p, c: j.p }));
  const nv = pos.length / 3, sj = new Float32Array(nv * 4), sw = new Float32Array(nv * 4);
  for (let v = 0; v < nv; v++) { const p = [pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]]; const best = [];
    for (const s of seg) { const d = [s.c[0] - s.a[0], s.c[1] - s.a[1], s.c[2] - s.a[2]], w = [p[0] - s.a[0], p[1] - s.a[1], p[2] - s.a[2]]; const L = d[0] * d[0] + d[1] * d[1] + d[2] * d[2] || 1e-9;
      const t = Math.max(0, Math.min(1, (w[0] * d[0] + w[1] * d[1] + w[2] * d[2]) / L)); const dist = Math.hypot(w[0] - d[0] * t, w[1] - d[1] * t, w[2] - d[2] * t); best.push([dist, s.b]); }
    best.sort((a, b) => a[0] - b[0]); const a = best[0], b = best.find(x => x[1] !== a[1]) || a; const wa = 1 / Math.pow(a[0] + 1e-3, 4), wb = b === a ? 0 : 1 / Math.pow(b[0] + 1e-3, 4);
    sj[v * 4] = a[1]; sj[v * 4 + 1] = b[1]; sw[v * 4] = wa / (wa + wb); sw[v * 4 + 1] = wb / (wa + wb); }
  const bones = joints.map(j => ({ k: j.n, par: j.par && ix.has(j.par) ? ix.get(j.par) : -1, m: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, j.p[0], j.p[1], j.p[2], 1] }));
  return { sj, sw, bones };
}

(async () => {
  const { MeshoptSimplifier: SIMP } = await import(path.join(ROOT, 'tools/art/rig92/vendor/meshopt_simplifier.mjs')); await SIMP.ready;
  const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); await new Promise(r => setTimeout(r, 800));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const stats = { glad: {}, beast: {} };
  try {
    const pg = await browser.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
    await pg.goto(`http://127.0.0.1:${PORT}/tools/plans/babylon100/export.html`); await pg.waitForFunction(() => window.EXP_READY, null, { timeout: 60000 });
    stats.init = await pg.evaluate(() => window.EXP.init()); console.log('token engine', stats.init);
    for (const [k, kit] of Object.entries(KITS)) {
      const r = await pg.evaluate(([l, g]) => window.EXP.glad(l, g), [kit.look, kit.gear]);
      const src = { pos: f32(r.pos), col: f32(r.col), idx: u32(r.idx), sj: u16f(r.sj), sw: f32(r.sw) };
      const L0 = lod(SIMP, k + '_lod0', src, GLAD_TRIS), L1 = lod(SIMP, k + '_lod1', src, GLAD_LO);
      const buf = glb(r.bones, [L0, L1]); fs.writeFileSync(path.join(OUT, `glad_${k}.glb`), buf);
      stats.glad[k] = { trisFull: r.nt, vertsFull: r.nv, lod0: { tris: L0.tris, verts: L0.verts }, lod1: { tris: L1.tris, verts: L1.verts }, bones: r.bones.length, kb: +(buf.length / 1024).toFixed(1), bakeMs: r.ms, parts: r.names.length };
      console.log('glad', k, stats.glad[k]);
    }
    for (const [k, frames] of Object.entries(BEASTS)) {
      const r = await pg.evaluate(([k, f]) => window.EXP.beast(k, f), [k, frames]); const f = r.frames[0];
      const src = { pos: f32(f.pos), col: f32(f.col), idx: u32(f.idx) };
      const L0 = lod(SIMP, k + '_lod0', src, BEAST_TRIS), L1 = lod(SIMP, k + '_lod1', src, BEAST_LO);
      let bones; for (const L of [L0, L1]) { const sk = skinToJoints(L.pos, f.joints); L.sj = sk.sj; L.sw = sk.sw; bones = sk.bones; }
      const buf = glb(bones, [L0, L1]); fs.writeFileSync(path.join(OUT, `beast_${k}.glb`), buf);
      stats.beast[k] = { trisFull: f.nt, lod0: { tris: L0.tris, verts: L0.verts }, lod1: { tris: L1.tris, verts: L1.verts }, bones: bones.length, joints: f.joints.map(j => j.n + '<' + (j.par || '')).join(' '), kb: +(buf.length / 1024).toFixed(1), sculptMs: r.ms, base: r.base, rim: r.rim };
      console.log('beast', k, stats.beast[k]);
    }
    stats.errs = errs.slice(0, 10);
  } finally { await browser.close(); srv.kill(); }
  fs.writeFileSync(path.join(OUT, 'stats.json'), JSON.stringify(stats, null, 1)); console.log('errs', stats.errs);
})().catch(e => { console.error(e); process.exit(1); });
