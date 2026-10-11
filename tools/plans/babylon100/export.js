/* babylon100/export.js — bakes the mock-up's 3D pieces to glTF (.glb) for the Babylon scene.
     node tools/plans/babylon100/export.js
   Headless Chromium (SwiftShader WebGL) opens export.html, which builds FOUR gladiators with the real rig92 token engine
   (assets/tok93.js + assets/gear100.js, his printed pieces) and TWO beasts with look100/beast3_rig.js, baked to triangle soups.
   Here (node): meshoptimizer (tools/art/rig92/vendor/meshopt_simplifier.mjs, MIT) simplifies each one colour-aware to a budget,
   normals are recomputed, and a minimal glTF 2.0 binary is written by hand (POSITION, NORMAL, COLOR_0, indices; gladiators carry ONE
   morph target = the breathing pose; beasts carry idle0..idle3 as sibling nodes = a flipbook).  → models/*.glb + models/stats.json */
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'), path = require('path');
const HERE = __dirname, ROOT = path.resolve(HERE, '../../..'), PORT = 8871, OUT = path.join(HERE, 'models');
fs.mkdirSync(OUT, { recursive: true });
const GLAD_TRIS = +(process.env.GLAD_TRIS || 24000), BEAST_TRIS = +(process.env.BEAST_TRIS || 9000);

const KITS = {
  murmillo: { look: { hs: 'crop', skin: '#b07c5c', cloth: '#7a1c14' }, gear: { head: { t: 'murmillo' }, belt: { t: 'balteus' }, arm: { R: { upper: { t: 'manica' }, wraps: 1 }, L: { wraps: 1 } }, leg: { L: { lower: { t: 'ocrea' } }, R: { lower: { t: 'legwraps' } } }, wR: { t: 'sword', k: 'gladius' }, wL: { t: 'scutum', k: 'scutum' } } },
  thraex: { look: { hs: 'crop', skin: '#9a6a4c', cloth: '#5c6a2a', bs: 'stubble' }, gear: { head: { t: 'thrachelm' }, arm: { L: { upper: { t: 'provmanica' }, wraps: 1 }, R: { wraps: 1 } }, leg: { L: { lower: { t: 'cnemis' } }, R: { lower: { t: 'cnemis' } } }, wR: { t: 'sica', k: 'sica' }, wL: { t: 'parma', k: 'thracian' } } },
  royalty: { look: { hs: 'crop', skin: '#c9946e', cloth: '#2c3550', hair: '#2a1a10' }, gear: { head: { t: 'cassis' }, chest: { t: 'ornate' }, arm: { R: { wraps: 1 }, L: { wraps: 1 } }, wR: { t: 'dagger', k: 'pugio' } } },
  venatore: { look: { hs: 'crop', skin: '#8c5e40', cloth: '#5a3466', bs: 'full' }, gear: { head: { t: 'steelhelm' }, belt: { t: 'balteus1' }, arm: { R: { wraps: 1 }, L: { wraps: 1 } }, leg: { L: { lower: { t: 'legwraps' } }, R: { lower: { t: 'legwraps' } } }, wR: { t: 'spear', k: 'hasta' } } },
};
const BEASTS = { leo: ['idle0', 'idle1', 'idle2', 'idle3'], ursa: ['idle0', 'idle1', 'idle2', 'idle3'] };

const f32 = (s) => { const b = Buffer.from(s, 'base64'); return new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4).slice(); };
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
/* ---------- a minimal glb writer ---------- */
function glb(meshes) {   /* meshes: [{name, pos, nor, col(linear float rgb), idx, morph?:Float32 deltas, visible}] */
  const bufs = []; let off = 0; const views = [], accs = [];
  const view = (ta, target) => { const b = Buffer.from(ta.buffer, ta.byteOffset, ta.byteLength); const pad = (4 - (b.length % 4)) % 4; views.push({ buffer: 0, byteOffset: off, byteLength: b.length, ...(target ? { target } : {}) }); bufs.push(b, Buffer.alloc(pad)); off += b.length + pad; return views.length - 1; };
  const acc = (ta, type, ct, target, extra = {}) => { const bv = view(ta, target); const a = { bufferView: bv, componentType: ct, count: ta.length / ({ VEC3: 3, VEC4: 4, SCALAR: 1 }[type]), type, ...extra }; accs.push(a); return accs.length - 1; };
  const minmax = (p) => { const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; for (let i = 0; i < p.length; i += 3) for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a], p[i + a]); mx[a] = Math.max(mx[a], p[i + a]); } return { min: mn, max: mx }; };
  const gm = [], nodes = [];
  for (const m of meshes) {
    const nv = m.pos.length / 3; const c16 = new Uint16Array(nv * 4); for (let v = 0; v < nv; v++) { for (let a = 0; a < 3; a++) c16[v * 4 + a] = Math.round(Math.max(0, Math.min(1, m.col[v * 3 + a])) * 65535); c16[v * 4 + 3] = 65535; }
    const attrs = { POSITION: acc(m.pos, 'VEC3', 5126, 34962, minmax(m.pos)), NORMAL: acc(m.nor, 'VEC3', 5126, 34962), COLOR_0: acc(c16, 'VEC4', 5123, 34962, { normalized: true }) };
    const idx = nv < 65536 ? Uint16Array.from(m.idx) : m.idx;
    const prim = { attributes: attrs, indices: acc(idx, 'SCALAR', nv < 65536 ? 5123 : 5125, 34963), material: 0, mode: 4 };
    const mesh = { name: m.name, primitives: [prim] };
    if (m.morph) { prim.targets = [{ POSITION: acc(m.morph, 'VEC3', 5126, 34962, minmax(m.morph)), NORMAL: acc(m.morphN, 'VEC3', 5126, 34962) }]; mesh.weights = [0]; mesh.extras = { targetNames: ['breath'] }; }
    gm.push(mesh); nodes.push({ name: m.name, mesh: gm.length - 1 });
  }
  const json = { asset: { version: '2.0', generator: 'flavius babylon100/export.js' }, scene: 0, scenes: [{ nodes: nodes.map((_, i) => i) }], nodes, meshes: gm,
    materials: [{ name: 'vc', pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 0.85 } }], accessors: accs, bufferViews: views, buffers: [{ byteLength: off }] };
  let js = Buffer.from(JSON.stringify(json)); js = Buffer.concat([js, Buffer.alloc((4 - js.length % 4) % 4, 0x20)]);
  const bin = Buffer.concat(bufs); const head = Buffer.alloc(12); head.writeUInt32LE(0x46546C67, 0); head.writeUInt32LE(2, 4); head.writeUInt32LE(12 + 8 + js.length + 8 + bin.length, 8);
  const ch = (len, type) => { const b = Buffer.alloc(8); b.writeUInt32LE(len, 0); b.writeUInt32LE(type, 4); return b; };
  return Buffer.concat([head, ch(js.length, 0x4E4F534A), js, ch(bin.length, 0x004E4942), bin]);
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
      const pos = f32(r.pos), posB = f32(r.posB), col = f32(r.col), idx = u32(r.idx);
      const s = simplify(SIMP, pos, col, idx, GLAD_TRIS);
      const P = pick(pos, s.remap, s.nv), PB = pick(posB, s.remap, s.nv), C = pick(col, s.remap, s.nv);
      const N = normals(P, s.idx), NB = normals(PB, s.idx); const D = new Float32Array(P.length), DN = new Float32Array(P.length); for (let i = 0; i < P.length; i++) { D[i] = PB[i] - P[i]; DN[i] = NB[i] - N[i]; }
      const buf = glb([{ name: k, pos: P, nor: N, col: C, idx: s.idx, morph: D, morphN: DN }]); fs.writeFileSync(path.join(OUT, `glad_${k}.glb`), buf);
      stats.glad[k] = { trisFull: r.nt, vertsFull: r.nv, tris: s.idx.length / 3, verts: s.nv, err: +s.err.toFixed(5), kb: +(buf.length / 1024).toFixed(1), bakeMs: r.ms, parts: r.names.length };
      console.log('glad', k, stats.glad[k]);
    }
    for (const [k, frames] of Object.entries(BEASTS)) {
      const r = await pg.evaluate(([k, f]) => window.EXP.beast(k, f), [k, frames]); const ms = [];
      let tf = 0, to = 0;
      for (const f of r.frames) { const pos = f32(f.pos), col = f32(f.col), idx = u32(f.idx); const s = simplify(SIMP, pos, col, idx, BEAST_TRIS);
        const P = pick(pos, s.remap, s.nv), C = pick(col, s.remap, s.nv); ms.push({ name: f.n, pos: P, nor: normals(P, s.idx), col: C, idx: s.idx }); tf += f.nt; to += s.idx.length / 3; }
      const buf = glb(ms); fs.writeFileSync(path.join(OUT, `beast_${k}.glb`), buf);
      stats.beast[k] = { frames: r.frames.length, trisFullPerFrame: Math.round(tf / r.frames.length), trisPerFrame: Math.round(to / r.frames.length), kb: +(buf.length / 1024).toFixed(1), sculptMs: r.ms, base: r.base, rim: r.rim };
      console.log('beast', k, stats.beast[k]);
    }
    stats.errs = errs.slice(0, 10);
  } finally { await browser.close(); srv.kill(); }
  fs.writeFileSync(path.join(OUT, 'stats.json'), JSON.stringify(stats, null, 1)); console.log('errs', stats.errs);
})().catch(e => { console.error(e); process.exit(1); });
