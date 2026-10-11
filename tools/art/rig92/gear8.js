/* =====================================================================
   rig92/gear8.js — v1.0: the PRINTED armor pieces as PRE-BAKED sculpts (his pick c, 2026-10-11)
   =====================================================================
   The SDF sculpts (sculpt.js: helmets, cuirasses, belts, limb pieces — look100 rounds 5–8) are made ONCE at build time by
   tools/art/rig92/mkgear.js and shipped as assets/gear100.js (a plain script: window.GEAR100 = {v, body, z, pieces, b64}), loaded on
   demand with the modeller. Here the game only DECODES them (meshoptimizer's codec, MIT, vendor/meshopt_decoder.js), skins them to
   the body (each vertex takes the weights of the nearest body vertex — the same rule the sculptor used), mirrors a left limb piece
   onto the right, and MERGES a figure's pieces into ONE skinned mesh with ONE outline (round 8). Players never wait for a sculpt.
   File layout (little endian, after base64 + optional deflate-raw):
     pieces[k] = { t: 'h' helmet (head-local metres, before the ×1.07·hs fit) | 'c' cuirass | 'b' belt | 'l' limb (left side),
                   nv, ni, lo:[x,y,z], hi:[x,y,z], p:[off,len] positions (4×u16 per vertex quantised to 0…q in the piece's box, meshopt vertex codec),
                   c:[off,len] colours (4×u8 sRGB, vertex codec), i:[off,len] triangles (meshopt index codec),
                   s: the skin rule (see nearFor) }
   loadBaked(GEAR100, MeshoptDecoder) → { has(k), geo(B, k, sd) } · wearBaked / merge8 / skin7 used by game.js. */
import * as THREE from 'three';

/* base64 → bytes (atob in the page; Buffer when a test runs this in node) */
function b64bytes(s) {
  if (typeof atob === 'function') { const bin = atob(s); const a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return a; }
  return new Uint8Array(Buffer.from(s, 'base64'));
}
async function inflate(bytes) {
  const ds = new DecompressionStream('deflate-raw');
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(ds)).arrayBuffer());
}
const lin8 = (() => { const t = new Float32Array(256); for (let i = 0; i < 256; i++) { const c = i / 255; t[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); } return t; })();

/* decode the file once; each piece's geometry is built the first time a figure wears it (cached per piece, raw = unskinned) */
export async function loadBaked(data, dec) {
  if (!data || !data.b64 || !data.pieces || !dec) return null;
  const t0 = (typeof performance !== 'undefined' ? performance : Date).now();
  let bytes = b64bytes(data.b64); if (data.z) bytes = await inflate(bytes);
  await dec.ready;
  const raw = new Map(), QM = data.q || 65535;
  const piece = (k) => {
    if (raw.has(k)) return raw.get(k); const d = data.pieces[k]; if (!d) return null;
    const slice = (r) => bytes.subarray(r[0], r[0] + r[1]);
    const P = new Uint8Array(d.nv * 8), C = new Uint8Array(d.nv * 4), I = new Uint8Array(d.ni * 4);
    dec.decodeVertexBuffer(P, d.nv, 8, slice(d.p)); dec.decodeVertexBuffer(C, d.nv, 4, slice(d.c)); dec.decodeIndexBuffer(I, d.ni, 4, slice(d.i));
    const q = new Uint16Array(P.buffer), pos = new Float32Array(d.nv * 3), col = new Float32Array(d.nv * 3);
    for (let v = 0; v < d.nv; v++) for (let a = 0; a < 3; a++) { pos[v * 3 + a] = d.lo[a] + (d.hi[a] - d.lo[a]) * q[v * 4 + a] / QM; col[v * 3 + a] = lin8[C[v * 4 + a]]; }
    const r = { t: d.t, pos, col, idx: new Uint32Array(I.buffer) }; raw.set(k, r); return r;
  };
  return { ms: Math.round((typeof performance !== 'undefined' ? performance : Date).now() - t0), keys: Object.keys(data.pieces), bytes: bytes.length,
    has: (k) => !!data.pieces[k], kind: (k) => data.pieces[k] && data.pieces[k].t, meta: (k) => data.pieces[k], piece };
}

/* v1.0 (his 2a): THE BODY'S CORE, pre-baked by mkgear.js into assets/body100.js (window.BODY100 = {v, key, src, nv, ni, lo, hi, q, s, anc, z, b64}):
   s.p positions 4×u16 (0…q) in the box · s.n normals (octahedral filter, 4×i8 out) · s.i skin bones 4×u8 · s.w skin weights 4×u8 (sum 255) · s.m 4×u8 [group, paint kind,
   crease ink, 0] (all meshopt vertex codec) · s.t triangles (index codec); anc = the harness lines / ring / buckle / stud points (plain JSON).
   → the core buildBodyAsync takes as opts.core (body.js coreSteps' shape, no field). */
export async function loadBody8(data, dec) {
  if (!data || !data.b64 || !data.s || !dec) return null;
  const t0 = (typeof performance !== 'undefined' ? performance : Date).now();
  let bytes = b64bytes(data.b64); if (data.z) bytes = await inflate(bytes);
  await dec.ready;
  const nv = data.nv, ni = data.ni, QM = data.q || 65535, slice = (r) => bytes.subarray(r[0], r[0] + r[1]);
  const dv = (k, st, f) => { const o = new Uint8Array(nv * st); dec.decodeVertexBuffer(o, nv, st, slice(data.s[k]), f); return o; };
  const Pq = new Uint16Array(dv('p', 8).buffer), Nq = new Int8Array(dv('n', 4, 'OCTAHEDRAL').buffer), Iq = dv('i', 4), Wq = dv('w', 4), Mq = dv('m', 4);
  const T = new Uint8Array(ni * 4); dec.decodeIndexBuffer(T, ni, 4, slice(data.s.t));
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), skinI = new Uint16Array(nv * 4), skinW = new Float32Array(nv * 4), grp = new Uint8Array(nv), vk = new Uint8Array(nv), ink = new Float32Array(nv);
  const lo = data.lo, hi = data.hi;
  for (let v = 0; v < nv; v++) {
    for (let a = 0; a < 3; a++) pos[v * 3 + a] = lo[a] + (hi[a] - lo[a]) * Pq[v * 4 + a] / QM;
    const nx = Nq[v * 4] / 127, ny = Nq[v * 4 + 1] / 127, nz = Nq[v * 4 + 2] / 127, nl = Math.hypot(nx, ny, nz) || 1; nor[v * 3] = nx / nl; nor[v * 3 + 1] = ny / nl; nor[v * 3 + 2] = nz / nl;
    for (let a = 0; a < 4; a++) { skinI[v * 4 + a] = Iq[v * 4 + a]; skinW[v * 4 + a] = Wq[v * 4 + a] / 255; }
    grp[v] = Mq[v * 4]; vk[v] = Mq[v * 4 + 1]; ink[v] = Mq[v * 4 + 2] / 255;
  }
  return { nv, pos, nor, tri: new Uint32Array(T.buffer), skinI, skinW, grp, vk, ink, anc: data.anc, fd: null, grid: data.grid || null,
    bytes: bytes.length, ms: { load: Math.round((typeof performance !== 'undefined' ? performance : Date).now() - t0) } };
}

/* a piece as a BufferGeometry: left limb pieces mirror for the right (x → −x, winding turned) */
export function bakedGeo(BK, k, sd) {
  const r = BK.piece(k); if (!r) return null; const mir = r.t === 'l' && sd === 'R';
  const pos = mir ? r.pos.map((v, i) => (i % 3 === 0 ? -v : v)) : r.pos.slice();
  const idx = r.idx.slice(); if (mir) for (let t = 0; t < idx.length; t += 3) { const a = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = a; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(r.col.slice(), 3));
  geo.setIndex(new THREE.BufferAttribute(idx, 1)); geo.computeVertexNormals(); geo.userData.kind = r.t; return geo;
}

/* skin a body-space mesh: each vertex takes the weights of the nearest body vertex (spatial hash); near = optional (x,y,z) → true for
   body vertices allowed (keeps a forearm piece off the hip it hangs beside) */
export function skin7(B, geo, near) {
  const bg = B.body.geometry, bp = bg.attributes.position, bsI = bg.attributes.skinIndex, bsW = bg.attributes.skinWeight, C = 0.02, grid = new Map();
  for (let i = 0; i < bp.count; i++) { const y = bp.getY(i); if (near ? !near(bp.getX(i), y, bp.getZ(i)) : y < 0.95) continue; const k = Math.floor(bp.getX(i) / C) + ',' + Math.floor(y / C) + ',' + Math.floor(bp.getZ(i) / C); let L = grid.get(k); if (!L) grid.set(k, L = []); L.push(i); }
  const pos = geo.attributes.position, n = pos.count, SI = new Uint16Array(n * 4), SW = new Float32Array(n * 4);
  for (let v = 0; v < n; v++) { const x = pos.getX(v), y = pos.getY(v), z = pos.getZ(v); const cx = Math.floor(x / C), cy = Math.floor(y / C), cz = Math.floor(z / C); let best = -1, bd = 1e9;
    for (let r = 1; r <= 3 && best < 0; r++) for (let dz = -r; dz <= r; dz++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const L = grid.get((cx + dx) + ',' + (cy + dy) + ',' + (cz + dz)); if (!L) continue;
      for (const i of L) { const d = (bp.getX(i) - x) ** 2 + (bp.getY(i) - y) ** 2 + (bp.getZ(i) - z) ** 2; if (d < bd) { bd = d; best = i; } } }
    for (let q = 0; q < 4; q++) { SI[v * 4 + q] = best >= 0 ? bsI.getComponent(best, q) : 0; SW[v * 4 + q] = best >= 0 ? bsW.getComponent(best, q) : q === 0 ? 1 : 0; } }
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(SI, 4)); geo.setAttribute('skinWeight', new THREE.BufferAttribute(SW, 4));
}
/* the body vertices a piece may take its weights from (the sculptor's own rule, written into the bake as s):
   ['y', lo, hi] = a belt's band · ['seg', 'e', 'w'] = within 13 cm of that limb's bone on the piece's side · none = above the knees (cuirasses) */
const segD = (x, y, z, a, b) => { const abx = b[0] - a[0], aby = b[1] - a[1], abz = b[2] - a[2]; const t = Math.max(0, Math.min(1, ((x - a[0]) * abx + (y - a[1]) * aby + (z - a[2]) * abz) / (abx * abx + aby * aby + abz * abz))); return Math.hypot(x - a[0] - abx * t, y - a[1] - aby * t, z - a[2] - abz * t); };
export function nearFor(B, s, sd) {
  if (!s) return null; if (s[0] === 'y') return (x, y) => y > s[1] && y < s[2];
  const P = B.kit.P, A = P(s[1] + sd), Bp = P(s[2] + sd); return (x, y, z) => segD(x, y, z, A, Bp) < 0.13;
}

/* one printed piece on the token from the bake (helmets ride the head bone, the rest are skinned to the body) */
export function wearBaked(B, BK, k, sd) {
  const K = B.kit; const kind = BK.kind(k); B._b8 = B._b8 || {}; const ck = kind === 'l' ? k + (sd || 'L') : k;
  let g0 = B._b8[ck]; if (!g0) { g0 = bakedGeo(BK, k, sd || 'L'); if (!g0) return []; if (kind !== 'h') skin7(B, g0, nearFor(B, BK.meta(k).s, sd || 'L')); B._b8[ck] = g0; }
  const mat = K.makeToon('#ffffff', { vertexColors: true, side: THREE.DoubleSide });
  if (kind === 'h') { const g = g0.clone(); const s = 1.07 * K.hs; g.scale(s, s, s); const mesh = K.rigid(g, mat, 'he', K.HO, null); mesh.userData.ownMat = 1; mesh.userData.s8helm = 1; return [mesh]; }
  const sm = new THREE.SkinnedMesh(g0.clone(), mat); sm.bind(B.body.skeleton, B.body.bindMatrix); sm.frustumCulled = false; sm.userData.ownMat = 1; sm.name = 's5_' + k;
  B.group.add(sm); sm.userData.ink = K.addOutline(sm, false); return [sm];
}

/* round 8: MERGE a figure's sculpted pieces into ONE skinned mesh (one draw, one outline). Skinned pieces keep their weights; a rigid
   helmet is moved into bind space (its bone's rest place + its offset) and weighted 1 to that bone. Returns the merged mesh. */
export function merge8(B, meshes) {
  const K = B.kit, bones = B.body.skeleton.bones; const parts = [];
  for (const m of meshes) { const g = m.geometry; const n = g.attributes.position.count; const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
    let si, sw;
    if (m.isSkinnedMesh) { pos.set(g.attributes.position.array); nor.set(g.attributes.normal.array); si = g.attributes.skinIndex.array; sw = g.attributes.skinWeight.array; }
    else { const bone = m.parent; const bi = bones.indexOf(bone); bone.updateWorldMatrix(true, false);
      /* bind space: the bone's REST place (rig rest rotations are the identity) + the mesh's offset/rotation */
      const rest = new THREE.Vector3().setFromMatrixPosition(B.body.skeleton.boneInverses[bi].clone().invert());
      const mq = new THREE.Matrix4().compose(m.position, m.quaternion, m.scale); const v = new THREE.Vector3();
      for (let i = 0; i < n; i++) { v.fromBufferAttribute(g.attributes.position, i).applyMatrix4(mq).add(rest); pos.set([v.x, v.y, v.z], i * 3); v.fromBufferAttribute(g.attributes.normal, i).applyQuaternion(m.quaternion); nor.set([v.x, v.y, v.z], i * 3); }
      si = new Uint16Array(n * 4); sw = new Float32Array(n * 4); for (let i = 0; i < n; i++) { si[i * 4] = bi; sw[i * 4] = 1; } }
    parts.push({ pos, nor, col: g.attributes.color.array, si, sw, idx: g.index.array, n }); }
  const N = parts.reduce((a, p) => a + p.n, 0), I = parts.reduce((a, p) => a + p.idx.length, 0);
  const P = new Float32Array(N * 3), Nn = new Float32Array(N * 3), C = new Float32Array(N * 3), SI = new Uint16Array(N * 4), SW = new Float32Array(N * 4), IX = new Uint32Array(I); let o = 0, oi = 0;
  for (const p of parts) { P.set(p.pos, o * 3); Nn.set(p.nor, o * 3); C.set(p.col, o * 3); SI.set(p.si, o * 4); SW.set(p.sw, o * 4); for (let k = 0; k < p.idx.length; k++) IX[oi + k] = p.idx[k] + o; o += p.n; oi += p.idx.length; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(Nn, 3)); geo.setAttribute('color', new THREE.BufferAttribute(C, 3));
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(SI, 4)); geo.setAttribute('skinWeight', new THREE.BufferAttribute(SW, 4)); geo.setIndex(new THREE.BufferAttribute(IX, 1));
  for (const m of meshes) K.kill(m);
  const sm = new THREE.SkinnedMesh(geo, K.makeToon('#ffffff', { vertexColors: true, side: THREE.DoubleSide })); sm.bind(B.body.skeleton, B.body.bindMatrix); sm.frustumCulled = false; sm.userData.ownMat = 1; sm.name = 's8_merged';
  B.group.add(sm); sm.userData.ink = K.addOutline(sm, false); sm.userData.tris = IX.length / 3; return sm;
}

/* the old harness belt (shell 'belt', its studs and front ring) hidden while a sculpted belt is worn (his round-7 pick) */
export function beltShow8(B, on) {
  B.group.traverse(x => { if (x.isMesh && x.name === 'belt') { x.visible = on; if (x.userData.ink) x.userData.ink.visible = on; } });
  for (const ch of B.rig.bones.pe.children) { const gg = ch.geometry, pp = gg && gg.parameters; if (pp && ((gg.type === 'SphereGeometry' && Math.abs(pp.radius - 0.0052) < 1e-4) || (gg.type === 'TorusGeometry' && Math.abs(pp.radius - 0.031) < 1e-4))) { ch.visible = on; if (ch.userData.ink) ch.userData.ink.visible = on; } }
}
