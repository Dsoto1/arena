/* =====================================================================
   look100/beast5_hum.js — v1.0 LOOK TEST ROUND 5 (not game code; copied from beast4_hum.js). Round 5 = his round-4 answers:
     1b THOLO's cape CLOSER to his back (cloth margin 4 cm, was 7; the top row hangs nearer the shoulder blades) so it is less boxy from
        behind, in a DARKER LINEN (#b9a582, was ivory #efe7d2) so a red fleck of tunic in a swing frame does not jump out.
     2b BIGGER CLASP DISCS, NO CHAIN: each shoulder clasp ~1.5x (disc r 0.10, boss r 0.046, brighter bronze) so they read at zoom x1.
     3a COMMODUS: the lion's upper jaw LIFTED (whisker pads, lip line, fangs and nose raised, the bridge flatter) so more of his own face
        shows from the board camera; the lion face keeps its round-4 size.
   Round 4 = his round-3 answers:
     1a each humanoid in TWO sheets like Leo: <key> = idle + walk, <key>_act = attack / hit / die, each cropped on its own (splitSheet4);
        the call still returns the full sheet (png/meta/rows) so tools/art/mm100/make.js keeps working.
     2c THOLO's cape IVORY WHITE (was red) held by a BRONZE CLASP on each shoulder (a disc with a raised boss + rim) joined by a bronze
        chain across the chest; same length (calves) and the same motion (trail / sway / swirl / whip).
     3a COMMODUS's lion-pelt hood: a BIGGER lion face (skull, brow ridge, muzzle, nose, eye sockets, ears, fangs ~1.5-1.8x, paler muzzle,
        darker mane ring) so it reads at board size.
   Round 3 (his round-2 answers):
     5a THOLO's cape = CLOTH that swings with the walk: rebuilt for every frame as a closed slab (two layers + a rim) hanging from the
        shoulders as R×C chains — gravity + a per-frame "wind" (the motion of that frame: trailing back on the walk with a left/right sway
        in step with the legs, a swirl on the swing, a forward whip on the hit) — and pushed out of the body (capsules on the torso, thighs
        and shins), so the legs push it instead of passing through it (round 2: a rigid panel on the chest bone).
     4a COMMODUS: a LION-PELT HOOD (a fur shell over the head + the lion's sculpted upper face, ears and mane tufts framing his face, the pelt
        hanging down his back = the same cloth chains, shorter) and SEGMENTED ARMOUR (lorica segmentata: banded torso + shoulder bands with
        dark seams, pteruges below; the galea and the scale lorica are gone).
   Driven by beast4_humanoid.js through beast4_hum.html → window.LOOK100.humanoid3(key).
   ===================================================================== */
import * as THREE from 'three';
import { LOOK100X as X } from './anim_rig.js';
const D2R = Math.PI / 180, V = (a) => new THREE.Vector3(...a);

/* ---------- the cloth: chains from the shoulders, gravity + wind, pushed out of the body ---------- */
function windOf(k, i, o) {   /* figure space (+z forward, +x his left), in "g" units; o.k scales the swing */
  const K = o.k || 1;
  if (k === 'walk') { const ph = i / 6 * Math.PI * 2; return { w: [0.24 * Math.sin(ph) * K, 0.12, -0.6 * K], flut: 0.16 * K, ph }; }
  if (k === 'idle') { const ph = i / 4 * Math.PI * 2; return { w: [0.06 * Math.sin(ph), 0, -0.1 - 0.04 * Math.cos(ph)], flut: 0.04, ph }; }
  if (k === 'attack') return { w: [[0.1, -0.32, 0.42, 0.55, 0.15][i] * K, [0, 0.1, 0.15, 0.25, 0][i], -[0.25, 0.45, 0.7, 0.8, 0.35][i] * K], flut: 0.1, ph: i };   /* the swing swirls it */
  if (k === 'hit') return { w: [[0.1, 0.05, 0.45], [-0.15, 0.05, 0.2], [0, 0, -0.05]][i], flut: 0.06, ph: i };
  return { w: [0, 0, -0.05 * (1 - i / 4)], flut: 0.02, ph: i };   /* die: it drapes */
}
function capOf(a, b, r) { return { a, b, r }; }
function pushOut(p, cols, m) {
  for (const c of cols) { const ab = new THREE.Vector3().subVectors(c.b, c.a), ap = new THREE.Vector3().subVectors(p, c.a); const t = Math.max(0, Math.min(1, ap.dot(ab) / (ab.lengthSq() || 1e-9)));
    const q = c.a.clone().addScaledVector(ab, t); const d = p.distanceTo(q); const R = c.r + m; if (d < R) { if (d < 1e-6) p.z -= R; else { const n = new THREE.Vector3().subVectors(p, q).divideScalar(d); p.copy(q).addScaledVector(n, R); } } }
  if (p.y < 0.006) p.y = 0.006;
}
/* returns world points [r][c] */
function simCloth(B, frameKey, frameI, o) {
  const bones = B.rig.bones, gw = (k, off = [0, 0, 0]) => bones[k].localToWorld(V(off));
  B.group.updateMatrixWorld(true); const sc = B.group.scale, s = (sc.x + sc.y + sc.z) / 3;
  const cols = [capOf(gw('pe', [0, -0.02, -0.01]), gw('ne', [0, -0.05, 0]), 0.13 * s), capOf(gw('pe', [0, -0.06, -0.02]), gw('sp', [0, 0.02, -0.02]), 0.14 * s)];
  for (const sd of ['L', 'R']) { cols.push(capOf(gw('h' + sd), gw('k' + sd), 0.088 * s), capOf(gw('k' + sd), gw('a' + sd), 0.066 * s)); }
  const R = o.rows, C = o.cols, seg = o.len * sc.y / (R - 1); const W = windOf(frameKey, frameI, o);
  /* round 5 (1b): close in idle/walk (o.m), but the swing/hit frames keep round 4's 7 cm (o.mAct) + a capsule across the shoulder blades, so no tunic shows through */
  const M5 = (/^(attack|hit)/.test(frameKey) && o.mAct) || o.m || 0.016; if (o.blades) cols.push(capOf(gw('sL'), gw('sR'), o.blades * s));
  const qG = new THREE.Quaternion(); B.group.getWorldQuaternion(qG);   /* the die frames tilt the group: wind follows the figure, gravity stays down */
  const wind = V(W.w).applyQuaternion(qG); const side = V([1, 0, 0]).applyQuaternion(qG);
  const P = []; const top = [];
  /* the body's own frame from the joints (the rig92 bones are not axis-aligned): right = his left shoulder - right shoulder, up = chest → neck */
  const CH = gw('ch'), NE = gw('ne'), SL = gw('sL'), SR = gw('sR'); const rt = new THREE.Vector3().subVectors(SL, SR).normalize(), up = new THREE.Vector3().subVectors(NE, CH).normalize();
  const bk = new THREE.Vector3().crossVectors(rt, up).normalize(); if (bk.dot(V([0, 0, -1]).applyQuaternion(new THREE.Quaternion().copy(B.group.getWorldQuaternion(new THREE.Quaternion())))) < 0) bk.negate();
  const sx = (sc.x + sc.z) / 2;
  const bk0 = o.bk0 != null ? o.bk0 : 0.11;   /* round 5 (1b): Tholo's top row nearer the shoulder blades */
  for (let c = 0; c < C; c++) { const u = c / (C - 1) * 2 - 1; top.push(CH.clone().addScaledVector(rt, u * o.halfW * sx).addScaledVector(up, (o.topY - 0.035 * u * u) * sc.y).addScaledVector(bk, (bk0 + 0.02 * (1 - u * u)) * sx)); }
  P.push(top);
  for (let r = 1; r < R; r++) { const t = r / (R - 1); const row = [];
    for (let c = 0; c < C; c++) { const u = c / (C - 1) * 2 - 1; const prev = P[r - 1][c];
      const fl = W.flut * Math.sin(W.ph * 1.7 + u * 2.4 + t * 3.0) * t;
      const d = V([0, -1, 0]).addScaledVector(wind, Math.pow(t, 1.2)).addScaledVector(side, u * o.flare * t + fl); d.normalize();
      const p = prev.clone().addScaledVector(d, seg); pushOut(p, cols, M5 * s);
      const e = new THREE.Vector3().subVectors(p, prev); p.copy(prev).addScaledVector(e.normalize(), seg); pushOut(p, cols, M5 * 0.88 * s); row.push(p); }
    /* keep the columns together (cloth does not split): pull each point toward the midpoint of its neighbours, a little */
    for (let it = 0; it < 2; it++) for (let c = 1; c < C - 1; c++) { const m = row[c - 1].clone().add(row[c + 1]).multiplyScalar(0.5); row[c].lerp(m, 0.25); pushOut(row[c], cols, M5 * 0.88 * s); }
    P.push(row); }
  return P;
}
/* world grid → a closed slab mesh in the group's space (front + back layers + rim), vertex colours: folds + optional fur */
function slabGeo(B, P, o) {
  const R = P.length, C = P[0].length, inv = new THREE.Matrix4().copy(B.group.matrixWorld).invert();
  const L = P.map(row => row.map(p => p.clone().applyMatrix4(inv)));
  const nrm = (r, c) => { const a = L[Math.min(R - 1, r + 1)][c].clone().sub(L[Math.max(0, r - 1)][c]); const b = L[r][Math.min(C - 1, c + 1)].clone().sub(L[r][Math.max(0, c - 1)]); return new THREE.Vector3().crossVectors(b, a).normalize(); };
  const pos = [], col = [], idx = []; const th = o.th;
  for (const sgn of [1, -1]) for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { const p = L[r][c].clone().addScaledVector(nrm(r, c), sgn * th); pos.push(p.x, p.y, p.z);
    const u = c / (C - 1), t = r / (R - 1); let f = 0.86 + 0.14 * Math.cos(u * Math.PI * o.folds); if (o.fur) f *= 0.82 + 0.3 * Math.abs(Math.sin(u * 37 + t * 23) * Math.sin(u * 11 - t * 31)); if (t > 0.94 && o.hem) f *= 0.72; col.push(f, f, f); }
  const id = (l, r, c) => l * R * C + r * C + c;
  for (let r = 0; r < R - 1; r++) for (let c = 0; c < C - 1; c++) { const a = id(0, r, c), b = id(0, r, c + 1), d = id(0, r + 1, c), e = id(0, r + 1, c + 1); idx.push(a, d, b, b, d, e);
    const a1 = id(1, r, c), b1 = id(1, r, c + 1), d1 = id(1, r + 1, c), e1 = id(1, r + 1, c + 1); idx.push(a1, b1, d1, b1, e1, d1); }
  const rim = []; for (let c = 0; c < C; c++) rim.push([0, c]); for (let r = 1; r < R; r++) rim.push([r, C - 1]); for (let c = C - 2; c >= 0; c--) rim.push([R - 1, c]); for (let r = R - 2; r > 0; r--) rim.push([r, 0]);
  for (let i = 0; i < rim.length; i++) { const [r0, c0] = rim[i], [r1, c1] = rim[(i + 1) % rim.length]; const a = id(0, r0, c0), b = id(0, r1, c1), a1 = id(1, r0, c0), b1 = id(1, r1, c1); idx.push(a, b, a1, b, b1, a1); }
  return { pos, col, idx };
}
class Cloth {
  constructor(B, o) { this.B = B; this.o = o; const K = B.kit;
    const g = new THREE.BufferGeometry(); const n = 2 * o.rows * o.cols; g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
    this.geo = g; this.mesh = new THREE.Mesh(g, K.makeToon(o.color, { vertexColors: true, side: THREE.DoubleSide })); this.mesh.frustumCulled = false; B.group.add(this.mesh); this.ink = K.addOutline(this.mesh, false); this.ink.frustumCulled = false; this.mesh.userData.ink = this.ink;   /* so kit.kill() takes the outline too */ this.first = true; }
  update(k, i) { const P = simCloth(this.B, k, i, this.o); const { pos, col, idx } = slabGeo(this.B, P, this.o);
    this.geo.attributes.position.array.set(pos); this.geo.attributes.position.needsUpdate = true; this.geo.attributes.color.array.set(col); this.geo.attributes.color.needsUpdate = true;
    if (this.first) { this.geo.setIndex(idx); this.first = false; } this.geo.computeVertexNormals(); this.geo.computeBoundingSphere(); }
  kill() { this.B.kit.kill(this.mesh); }
}

/* ---------- Commodus: lion-pelt hood + segmented armour ---------- */
function commodusKit(B) {
  const K = B.kit, GI = K.GI, HO = K.HO, hs = K.hs, out = []; const mat = (c) => { const m = K.maskedMat(); m.color.set(c); m.userData.ownMat = 1; return m; };
  const hl = (p) => [(p[0] - HO[0]) / hs, (p[1] - HO[1]) / hs, (p[2] - HO[2]) / hs];
  const fur = (p) => { const f = 0.8 + 0.3 * Math.abs(Math.sin(p[0] * 300 + p[1] * 520) * Math.sin(p[2] * 410 - p[1] * 260)); return [f, f, f]; };
  /* the hood: over the crown, the back and the sides of the head down the nape; the face stays bare */
  out.push(K.shellFrom('hood4', (p, g) => { if (g !== GI.H && !(g === GI.T && p[1] > 1.45 && p[2] < 0.0)) return -1; const lp = hl(p);
    const thr = lp[2] > 0.035 ? 0.16 : lp[2] > -0.01 ? 0.05 : -0.14; return Math.min(lp[1] - thr, 0.03); }, fur, 0.015, { mat: mat('#b88a48') }));
  /* armour: banded torso (lorica segmentata) + shoulder bands; seams dark, a front closure line */
  out.push(K.shellFrom('seg4', (p, g) => { if (g === GI.T) return Math.min(p[1] - 1.06, 1.475 - p[1], 0.03); if ((g === GI.AL || g === GI.AR) && Math.abs(p[0]) < 0.3) return Math.min(p[1] - 1.31, 0.03); return -1; },
    (p) => { const f = (((1.48 - p[1]) / 0.043) % 1 + 1) % 1; let v = f < 0.13 ? 0.42 : 0.86 + 0.14 * (1 - f); if (Math.abs(p[0]) < 0.007 && p[2] > 0 && p[1] < 1.3) v *= 0.55; return [v, v, v]; }, 0.013, { mat: mat('#d6d9de') }));
  /* pteruges: leather strips below the armour */
  out.push(K.shellFrom('pter4', (p, g) => { if (g !== GI.T && g !== GI.LL && g !== GI.LR) return -1; return Math.min(p[1] - 0.8, 1.075 - p[1], 0.03); },
    (p) => { const a = Math.atan2(p[0], p[2]); const f = ((a / 0.24) % 1 + 1) % 1; const v = f < 0.16 ? 0.5 : 0.95; return [v, v * 0.97, v * 0.92]; }, 0.017, { mat: mat('#cdb88e') }));
  /* the lion's upper face over his brow (sculpted bits riding the head bone) */
  const PEL = K.makeToon('#b88a48'), MANE = K.makeToon('#7a4e26'), DK = K.makeToon('#2a1a12'), TOOTH = K.makeToon('#efe6cc');
  /* round 5 (3a): the whole lion head sits higher and a little further back on his crown (FY/FZ), so the board camera sees his face under the jaw */
  const FY = 0.17, FZ = -0.05; const at = (x, y, z) => [HO[0] + x * hs, HO[1] + (y + FY) * hs, HO[2] + (z + FZ) * hs];
  const blob = (r, a, b, c, m, p, look) => { const g = new THREE.SphereGeometry(1, 18, 12); g.scale(a, b, c); const q = K.rigid(g, m, 'he', p, look || null); out.push(q); return q; };
  /* round 4 (his 3a): a BIGGER lion face that reads at board size — sitting HIGH on his head like a pelt hood (his own face stays bare below
     its upper jaw): a long nose bridge to a broad dark nose (a lion, not a bear), heavy brow, pale muzzle + whisker pads, dark eye sockets, small
     ears tucked into a shaggy dark mane ring round the lion's head, the old tufts framing his face made longer */
  const MUZ = K.makeToon('#e2c28c'), MANE2 = K.makeToon('#6a3e1a'), EYE = K.makeToon('#d89a2a');
  blob(1, 0.112, 0.07, 0.11, PEL, at(0, 0.15, 0.03));               /* the lion's skull over his crown */
  blob(1, 0.098, 0.03, 0.045, PEL, at(0, 0.178, 0.105));             /* heavy brow */
  /* round 5 (his 3a): the upper jaw LIFTED: nose, whisker pads, lip line and fangs raised (JL5 in head units) and the bridge flatter, so his own face shows below */
  const JL5 = 0.035;
  { const g = new THREE.CapsuleGeometry(0.036, 0.09, 6, 12); g.rotateX(Math.PI / 2 - 0.05); out.push(K.rigid(g, PEL, 'he', at(0, 0.172, 0.18))); }   /* the long nose bridge, flatter */
  blob(1, 0.042, 0.021, 0.026, DK, at(0, 0.146 + JL5 * 0.8, 0.245));              /* broad flat nose */
  for (const sx of [-1, 1]) { blob(1, 0.044, 0.03, 0.044, MUZ, at(sx * 0.036, 0.118 + JL5, 0.208));   /* whisker pads */
    blob(1, 0.024, 0.014, 0.012, DK, at(sx * 0.054, 0.172, 0.142)); blob(1, 0.009, 0.007, 0.006, EYE, at(sx * 0.054, 0.172, 0.152));   /* sockets + amber eyes */
    { const e = new THREE.ConeGeometry(0.024, 0.038, 10); out.push(K.rigid(e, PEL, 'he', at(sx * 0.082, 0.228, -0.005), [sx * 0.3, 1, 0.1])); }   /* small ears */
    const fg = new THREE.ConeGeometry(0.012, 0.042, 8); fg.rotateX(Math.PI); out.push(K.rigid(fg, TOOTH, 'he', at(sx * 0.03, 0.075 + JL5 + 0.006, 0.2))); }   /* fangs over his brow */
  blob(1, 0.062, 0.012, 0.03, DK, at(0, 0.097 + JL5, 0.21));               /* the upper lip line */
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; const x = Math.sin(a) * 0.125, y = 0.16 + Math.cos(a) * 0.105;
    if (Math.cos(a) < -0.6) continue; blob(1, 0.04, 0.04, 0.03, MANE2, at(x, y, 0.035 - 0.02 * Math.abs(Math.sin(a))), [x * 3, (y - 0.16) * 3, 0.6]); }   /* the mane ring round the lion's head */
  for (let i = 0; i < 11; i++) { const a = (i / 10 - 0.5) * 2.7; const x = Math.sin(a) * 0.15, y = 0.06 - (1 - Math.cos(a)) * 0.18, z = 0.02 - (1 - Math.cos(a)) * 0.05;
    blob(1, 0.034, 0.062, 0.026, MANE2, at(x, y, z), [x * 3, 0.2, 1]); }   /* mane tufts framing his face, longer */
  return out;
}

/* ---------- Tholo: the bronze clasps (round 4, his 2c) — a disc + raised boss + rim on each shoulder top, a chain across the chest ---------- */
function tholoKit(B) {
  /* round 5 (2b): bigger discs (r 0.10, was 0.066), brighter bronze, a thick dark rim + a raised pale boss; NO chain */
  const K = B.kit, out = []; const BRZ = K.makeToon('#e0aa48'), BRZD = K.makeToon('#6a4218'), BRZL = K.makeToon('#f4cf7a'); const ch = K.P('ch');
  for (const sx of [-1, 1]) { const at = [sx * 0.15, 1.535, -0.03], n = [sx * 0.42, 0.8, 0.45];
    const d = new THREE.CylinderGeometry(0.1, 0.1, 0.022, 32); d.rotateX(Math.PI / 2); out.push(K.rigid(d, BRZ, 'ch', at, n));
    const r = new THREE.TorusGeometry(0.1, 0.016, 8, 36); out.push(K.rigid(r, BRZD, 'ch', at, n));
    const nn = new THREE.Vector3(...n).normalize(); const bo = new THREE.SphereGeometry(0.046, 16, 12); bo.scale(1, 1, 0.7); out.push(K.rigid(bo, BRZL, 'ch', [at[0] + nn.x * 0.014, at[1] + nn.y * 0.014, at[2] + nn.z * 0.014], n)); }
  return out;
}
/* ---------- 1a: cut one rendered sheet into idle+walk and actions, each cropped round the anchor on its own ---------- */
function splitSheet4(S, rows, parts) {
  const [w, h, AX, AY] = S.meta, n = 8; const g0 = S.canvas.getContext('2d'); const D = g0.getImageData(0, 0, S.canvas.width, S.canvas.height).data, CW = S.canvas.width;
  const boxOf = (ri, ci) => { let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (D[((ri * h + y) * CW + ci * w + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; };
  return parts.map(([name, re]) => { const idx = rows.map((r, i) => re.test(r) ? i : -1).filter(i => i >= 0); let L = 0, R = 0, T = 0, Bm = 0;
    for (const ri of idx) for (let ci = 0; ci < n; ci++) { const b = boxOf(ri, ci); if (b[2] < 0) continue; L = Math.max(L, AX - b[0]); R = Math.max(R, b[2] + 1 - AX); T = Math.max(T, AY - b[1]); Bm = Math.max(Bm, b[3] + 1 - AY); }
    const half = Math.ceil(Math.max(L, R)) + 1, W = half * 2, top = Math.ceil(T) + 1, H = top + Math.ceil(Bm) + 1, x0 = Math.floor(AX) - half, y0 = Math.floor(AY) - top;
    const c = document.createElement('canvas'); c.width = W * n; c.height = H * idx.length; const g = c.getContext('2d');
    idx.forEach((ri, j) => { for (let ci = 0; ci < n; ci++) g.drawImage(S.canvas, ci * w + x0, ri * h + y0, W, H, ci * W, j * H, W, H); });   /* x0,y0 >= 0: a part's crop sits inside the full crop */
    const e = X.enc(c, 'image/webp', 0.8);
    return { name, meta: [W, H, +(AX - x0).toFixed(1), +(AY - y0).toFixed(1), idx.length], rows: idx.map(i => rows[i]), kb: +(e.bytes / 1024).toFixed(1), webp: e.url, png: c.toDataURL('image/png'),
      decodedMB: +(W * H * 4 * n * idx.length / 1048576).toFixed(2) }; });
}

const CONF = {
  tholo: { look: { skin: '#b07a52', hair: '#8a847c', hs: 'crop', bs: 'full', cloth: '#7a3a22' }, gear: { helm: 'laurel', arm: { L: { wraps: 1 }, R: { wraps: 1 } }, wR: { t: 'club' } }, sc: [1.15 * 1.24, 1.15 * 1.13, 1.15 * 1.2], tunic: '#7a3a22',
    cloth: { color: '#b9a582', rows: 12, cols: 9, len: 1.12, halfW: 0.17, topY: 0.245, flare: 0.24, th: 0.011, m: 0.04, mAct: 0.07, blades: 0.075, bk0: 0.085, hem: 1, folds: 7, k: 1 }, kit: tholoKit },
  commodus: { look: { skin: '#e0b48e', hair: '#5a3b20', hs: 'crop', bs: 'full', cloth: '#ece6da' }, gear: { belt: { t: 'balteus' }, arm: { R: { lower: { t: 'manica', c: '#cfd2d8' } } }, leg: { L: { lower: { t: 'ocrea', c: '#cfd2d8' } }, R: { lower: { t: 'ocrea', c: '#cfd2d8' } } }, wR: { t: 'sword' } }, sc: [1.21, 1.21, 1.21], tunic: '#ece6da',
    cloth: { color: '#b88a48', rows: 10, cols: 9, len: 0.78, halfW: 0.16, topY: 0.25, flare: 0.1, th: 0.011, fur: 1, folds: 3, k: 0.7 }, kit: commodusKit },
};
window.LOOK100.humanoid3 = async function (key, o = {}) {
  const B = X.B, TOK = X.TOK, H = CONF[key]; TOK.apply({ look: H.look, gear: H.gear }); const K = B.kit, GI = K.GI; const extra = [];
  if (H.tunic) { const m = K.maskedMat(); m.color.set(H.tunic); m.userData.ownMat = 1;
    extra.push(K.shellFrom('tun4_' + key, (p, g) => { if (g === GI.T) return Math.min(p[1] - 0.68, 1.47 - p[1], 0.03); if (g === GI.LL || g === GI.LR) return Math.min(p[1] - 0.64, 0.03); return -1; },
      (p) => { const f = Math.sin(p[0] * 60 + p[1] * 22) * 0.5 + 0.5; return [0.82 + 0.18 * f, 0.82 + 0.18 * f, 0.82 + 0.18 * f]; }, 0.011, { mat: m })); }
  if (H.kit) extra.push(...H.kit(B));
  B.group.scale.set(...H.sc); B.group.updateMatrixWorld(true);
  const cloth = new Cloth(B, H.cloth);
  const rows = [X.GLAD_ROWS[0], X.GLAD_ROWS[1], X.GLAD_ROWS[2], X.GLAD_ROWS[4], X.FALL_ROWS[0]];
  let fr = rows.flatMap(([k, fs]) => fs.map((s, i) => ({ k: k === 'fall' ? 'die' : k, i, s }))); if (o.only) fr = fr.filter(x => o.only.includes(x.k + x.i));
  let clothMs = 0;
  const S = await X.renderFrames(fr, { set: (x) => { X.setFrame(x.s); const t = performance.now(); cloth.update(x.k, x.i); clothMs += performance.now() - t; }, box: 6.4, ty: 0.85, yaws: o.yaws });
  B.group.scale.set(1, 1, 1); cloth.kill(); for (const m of extra) K.kill(m); X.setFrame({ p: [0, 0, 0], j: {}, f: {} });
  const rowsN = fr.map(x => x.k + x.i); const w = X.enc(S.canvas, 'image/webp', 0.8);
  const parts = o.only ? [] : splitSheet4(S, rowsN, [[key, /^(idle|walk)/], [key + '_act', /^(attack|hit|die)/]]);
  return { key, meta: S.meta, rows: rowsN, ms: S.ms, clothMs: Math.round(clothMs), kb: +(w.bytes / 1024).toFixed(1), webp: w.url, png: S.canvas.toDataURL('image/png'), parts,
    decodedMB: +(S.meta[0] * S.meta[1] * 4 * 8 * rowsN.length / 1048576).toFixed(2), idleWalkMB: +(S.meta[0] * S.meta[1] * 4 * 8 * 10 / 1048576).toFixed(2), frames: rowsN.length, pxmm: 3.143 };
};
/* debug: the cloth points of one frame next to the body's joints (world space) */
window.LOOK100.cloth3dbg = function (key, fi = 0) { const B = X.B, H = CONF[key]; X.TOK.apply({ look: H.look, gear: H.gear }); B.group.scale.set(...H.sc); B.group.updateMatrixWorld(true);
  X.setFrame(X.GLAD_ROWS[0][1][fi]); const P = simCloth(B, 'idle', fi, H.cloth); const r = (v) => v.toArray().map(x => +x.toFixed(3));
  const j = {}; for (const k of ['pe', 'ch', 'ne', 'sL', 'sR']) j[k] = r(B.rig.bones[k].getWorldPosition(new THREE.Vector3()));
  const out = { j, top: P[0].map(r), mid: P[Math.floor(P.length / 2)].map(r) }; B.group.scale.set(1, 1, 1); return out; };
window.LOOK100_R5 = true;
