/* look100/page5.js — ROUND 5: straight wrists (every hold re-solved so the wrist stays neutral and the elbow/shoulder do the angling)
   + the SCULPTED helmets and cuirasses (r5_sculpt.js) beside his art and the round-4 pieces, the maximum load and the 8 classes again.
   make5.js drives it.

   THE HOLD SOLVER (hold5): a weapon leaves the fist at a fixed angle θ in the hand's own frame (u = wrist → fingertips, f = the thumb
   side, o = the back of the hand): d = cos θ·u + sin θ·f. Given the blade direction b we want and a forearm hint, the hand frame is
   u = cos θ·b + sin θ·p, f = sin θ·b − cos θ·p (p = the hint made perpendicular to b), so the blade lands exactly on b while the wrist
   stays STRAIGHT — the forearm simply points along u. The elbow is then placed on the shoulder's reach sphere (E = S + Lu·dir), the
   wrist one forearm further along u, and the two-bone IK is given that elbow as its pole. Only a twist about the forearm (pronation,
   which lives in the forearm) turns the thumb to f. A clamp checks the result (≤15° flex, ≤10° deviation) and, if a hold ever asks
   more, strips the wrist back to pure twist and re-solves the elbow. */
import * as THREE from 'three';
import { arm4, PIECES4, WGEO4, HOLD4, WHOLD4, weapon4, outfitCheck } from './r4_pieces.js';
import { JK, ENDS, jointPos, endPos, jointQ } from './rig100.js';
import { basisQ, weaponKit } from './gear100.js';
const BG = '#e9e1cf', INK = '#3a2c20', DIM = '#6a5038', OK = '#3a7a3a', BAD = '#a3281f';
const load = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error(src)); i.src = src; });
const cv = (w, h, bg = BG) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } return [c, g]; };
const txt = (g, s, x, y, size = 15, col = INK, bold) => { g.fillStyle = col; g.font = `${bold ? '600 ' : ''}${size}px Georgia, serif`; g.fillText(s, x, y); };
const webpKB = (c) => Math.round(atob(c.toDataURL('image/webp', 0.9).split(',')[1]).length / 102.4) / 10;
const cells = (im, w, h) => Array.from({ length: 8 }, (_, i) => { const [c, g] = cv(w, h, null); g.drawImage(im, i * w, 0, w, h, 0, 0, w, h); return c; });
const fit = (g, im, sx, sy, sw, sh, x, y, w, h) => { const k = Math.min(w / sw, h / sh); g.drawImage(im, sx, sy, sw, sh, x + (w - sw * k) / 2, y + (h - sh * k) / 2, sw * k, sh * k); };
const STANCE = { p: [0, -140, 10], j: { pe: [4, -20, 0], sp: [12, 10, 0], ch: [8, 10, 0], he: [-16, 8, 0] }, f: { L: [150, 230, 10], R: [-160, -230, -40] } };
const SKIN = '#ad7a5c';
const HERO = { w: 512, h: 512, span: 2.55, cy: 0.98, el: 20 };
async function token(opt) { const t0 = performance.now(); const T = await LOOK.createToken(Object.assign({ res: 0.005, scale: 1.15, paint: 1, body: { grip: { L: 'bar', R: 'hilt' }, face2: 1, headRes: 0.0022 } }, opt)); T.buildMs = Math.round(performance.now() - t0); return T; }
const sheetOf = (T) => { const r = T.sheet(); return { canvas: r.canvas, meta: r.meta, ms: r.ms, kb: webpKB(r.canvas) }; };
const kill = (T, L) => { for (const m of L) { if (m.userData && m.userData.raw) { m.parent && m.parent.remove(m); m.geometry.dispose(); continue; } if (Array.isArray(m.material)) { m.material.forEach(x => x.dispose()); m.userData.ownMat = 0; } T.B.kit.kill(m); }
  for (const ch of T.B.rig.bones.pe.children) { ch.visible = true; if (ch.userData.ink) ch.userData.ink.visible = true; } };
const V = (a) => new THREE.Vector3(...a), D = 180 / Math.PI;
const isShield = (k) => WHOLD4[k] === 'shield';

/* ---------- the hand frame (rest) ---------- */
const REST = {}; for (const sd of ['L', 'R']) { const W0 = V(JK['w' + sd].pos), E0 = V(JK['e' + sd].pos), S0 = V(JK['s' + sd].pos), tip = V(ENDS['w' + sd]);
  const u = tip.clone().sub(W0).normalize(), z = V([0, 0, 1]); const f = z.clone().sub(u.clone().multiplyScalar(z.dot(u))).normalize();
  const sg = sd === 'R' ? 1 : -1; const o = new THREE.Vector3().crossVectors(u, f).multiplyScalar(sg);
  const Lh = tip.distanceTo(W0); REST[sd] = { u, f, o, sg, Lh, gl: 0.52 * Lh + 0.02, Lf: W0.distanceTo(E0), Lu: E0.distanceTo(S0), fa: W0.clone().sub(E0).normalize() }; }

/* ---------- THE HOLDS (figure metres, facing +z, the right hand at −x). θ° = blade angle off the forearm line toward the thumb ---------- */
const H5 = {
  sword: { R: { th: 28, b: [-0.2, 0.28, 1], hint: [-0.12, -0.3, 1], at: [-0.29, 1.2, 0.38] }, note: 'gladius guard: forearm forward, blade 28° above its line' },
  dagger: { R: { th: -100, b: [0.12, -1, 0.25], hint: [0, 0.12, 1], at: [-0.27, 1.22, 0.3] }, note: 'reverse grip: blade out of the little-finger side' },
  spear: { R: { th: -90, b: [0.03, -0.08, 1], hint: [0, -1, 0.25], at: [-0.2, 1.66, 0.05] }, note: 'overhand: forearm up, shaft across the fist' },
  trident: { R: { th: 25, b: [0.12, 0.22, 1], hint: [-0.05, -0.35, 1], at: [-0.2, 1.0, 0.1] }, two: { d: 0.5, th: 25, hint: [0.2, -0.35, 1] }, note: 'two hands, low, tines forward' },
  hafted: { R: { th: 80, b: [-0.12, 1, -0.15], hint: [0, 0.05, 1], at: [-0.28, 1.36, 0.24] }, note: 'raised, haft upright out of a level forearm' },
  throw: { R: { th: 0, b: [0, 1, -0.2], hint: [0, 0, 1], at: [-0.24, 1.66, -0.05] }, note: 'stone raised' },
  bow: { L: { th: 90, b: [0, 1, 0.05], hint: [0.25, 0, 1], at: [0.2, 1.42, 0.52] }, hand: 'L', drawR: { h: [-60, 1500, 160], hp: [1, -0.3, -1] }, note: 'arm out, grip upright, the right hand draws' },
  crossbow: { R: { th: 90, b: [0.05, 0.02, 1], hint: [0, -0.7, -0.6], at: [-0.15, 1.42, 0.28] }, two: { d: 0.32, th: 90, hint: [0, -1, 0.3] }, note: 'shouldered, both hands under' },
  labrys: { R: { th: 75, b: [0.35, 1, 0.35], hint: [0.1, -0.2, 1], at: [-0.17, 1.02, 0.3] }, two: { d: 0.32, th: 75, hint: [-0.1, -0.2, 1] }, note: 'two-handed' },
  sling: { R: { th: 0, b: [0, -1, 0.1], hint: [0, 0, 1], at: [-0.36, 0.98, 0.12] }, note: 'hanging' },
  lyre: { L: { th: 90, b: [0, 1, 0.1], hint: [-0.1, -0.3, 1], at: [0.12, 1.12, 0.4] }, hand: 'L', drawR: { h: [-40, 1150, 420], hp: [1, -1, -0.3] }, note: 'held, plucked' },
  arm: { R: { th: 0, b: [0, 0.05, 1], hint: [0, 0, 1], at: [-0.26, 1.08, 0.38] }, note: 'strapped, blade past the fist' },
};
const W5 = Object.assign({}, WHOLD4, { trident: 'trident' });
const mir = (a) => [-a[0], a[1], a[2]];
const mirH = (h) => ({ th: h.th, b: mir(h.b), hint: mir(h.hint), at: mir(h.at) });

/* hand frame + arm targets for one hand. S = the posed shoulder (rig space) */
function frame5(T, sd, h) {
  const r = REST[sd], b = V(h.b).normalize(), th = h.th / D; let p = V(h.hint).sub(b.clone().multiplyScalar(V(h.hint).dot(b)));
  if (p.lengthSq() < 1e-6) p = V([0, -1, 0]).sub(b.clone().multiplyScalar(-b.y)); p.normalize();
  const u = b.clone().multiplyScalar(Math.cos(th)).add(p.clone().multiplyScalar(Math.sin(th))).normalize();
  const f = b.clone().multiplyScalar(Math.sin(th)).sub(p.clone().multiplyScalar(Math.cos(th))).normalize();
  const o = new THREE.Vector3().crossVectors(u, f).multiplyScalar(r.sg);
  const S = jointPos(T.rig, 's' + sd).clone();
  const Wd = V(h.at).sub(u.clone().multiplyScalar(r.gl)).add(o.clone().multiplyScalar(0.03)), Ed = Wd.clone().sub(u.clone().multiplyScalar(r.Lf));
  const E = S.clone().add(Ed.clone().sub(S).normalize().multiplyScalar(r.Lu)), W = E.clone().add(u.clone().multiplyScalar(r.Lf));
  const grip = W.clone().add(u.clone().multiplyScalar(r.gl)).sub(o.clone().multiplyScalar(0.03));
  const pole = E.clone().sub(S.clone().add(W).multiplyScalar(0.5)); const sx = sd === 'L' ? 1 : -1;
  return { u, f, o, b, th, E, W, grip, S, h: [W.x * 1000, W.y * 1000, W.z * 1000], hp: pole.lengthSq() > 1e-8 ? [pole.x * sx, pole.y, pole.z] : null };
}
/* the wrist's bend measured in the hand's own frame, against its rest relation: flex (palm/back) and deviation (thumb/little finger) */
function wristBend(T, sd) {
  const r = REST[sd], rig = T.rig; const E = jointPos(rig, 'e' + sd), W = jointPos(rig, 'w' + sd), tip = endPos(rig, 'w' + sd);
  const qE = jointQ(rig, 'e' + sd), qW = jointQ(rig, 'w' + sd);
  const fa = W.clone().sub(E).normalize(), hd = tip.clone().sub(W).normalize();
  /* the forearm's own frame: rest hand f/o carried by the ELBOW (what the hand would be with a neutral wrist) */
  const n0 = r.u.clone().applyQuaternion(qE), f0 = r.f.clone().applyQuaternion(qE), o0 = r.o.clone().applyQuaternion(qE);
  const a = (v) => Math.atan2(v.dot(o0), v.dot(n0)) * D, c = (v) => Math.atan2(v.dot(f0), v.dot(n0)) * D;
  void fa; void qW;
  return { flex: Math.round(a(hd) * 10) / 10, dev: Math.round(c(hd) * 10) / 10, total: Math.round(Math.acos(Math.min(1, hd.dot(n0))) * D * 10) / 10 };
}
/* clamp: if a wrist bends past 15° flex / 10° deviation, keep only its twist and let the next solve move the elbow */
function clampWrist(T, sd) {
  const w = wristBend(T, sd); if (Math.abs(w.flex) <= 15 && Math.abs(w.dev) <= 10) return false;
  const bone = T.rig.bones['w' + sd]; const fa = REST[sd].u; const q = bone.quaternion; const rv = V([q.x, q.y, q.z]); const pr = fa.clone().multiplyScalar(rv.dot(fa));
  const tw = new THREE.Quaternion(pr.x, pr.y, pr.z, q.w).normalize(); bone.quaternion.copy(tw); bone.updateMatrixWorld(true); return true;
}
/* the weapon on the wrist bone, θ off the hand axis toward the thumb */
function mount5(B, k, sd, th) {
  const K = B.kit, r = REST[sd], W0 = JK['w' + sd].pos; const t = th / D;
  const Y = r.u.clone().multiplyScalar(Math.cos(t)).add(r.f.clone().multiplyScalar(Math.sin(t))).normalize(), X = r.u.clone().multiplyScalar(Math.sin(t)).sub(r.f.clone().multiplyScalar(Math.cos(t))).normalize();
  const bc = V(W0).add(r.u.clone().multiplyScalar(r.gl)).sub(r.o.clone().multiplyScalar(0.03));
  const geo = (WGEO4[k] || WGEO4.gladius)(); const tips = geo.userData && geo.userData.tips;
  const m = K.rigid(geo, K.makeToon('#ffffff', { vertexColors: true, side: THREE.DoubleSide }), 'w' + sd, bc.toArray(), null);
  m.position.set(bc.x - W0[0], bc.y - W0[1], bc.z - W0[2]); m.quaternion.copy(basisQ(X.toArray(), Y.toArray())); m.userData.ownMat = 1;
  if (m.userData.ink) { m.userData.ink.position.copy(m.position); m.userData.ink.quaternion.copy(m.quaternion); }
  m.userData.w4 = { tips, k }; return m;
}
function bowString(T, m) {
  const g = T.B.group; g.updateWorldMatrix(true, true); m.updateWorldMatrix(true, false);
  const tips = m.userData.w4.tips.map(t => g.worldToLocal(m.localToWorld(V(t))));
  const hb = T.B.rig.bones.wR; hb.updateWorldMatrix(true, false); const hand = g.worldToLocal(hb.localToWorld(V(JK.wR.pos.map((v, i) => (ENDS.wR[i] - v) * 0.5))));
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([tips[0], hand, tips[1]], false, 'catmullrom', 0), 24, 0.006, 5, false);
  const s = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xe8dcc0 })); s.userData.raw = 1; g.add(s); return [s];
}
function net(B) { const g = new THREE.PlaneGeometry(0.42, 0.62, 9, 12); const P = g.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i); P.setZ(i, 0.05 * Math.sin(x * 9) * Math.cos(y * 7) - Math.abs(x) * 0.12); P.setX(i, x * (0.6 + (0.31 - y) * 0.9)); }
  g.translate(0, -0.33, 0); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xd8c9a0, wireframe: true })); m.userData.raw = 1;
  const b = B.rig.bones.wL, W0 = JK.wL.pos, tip = ENDS.wL; m.position.set((tip[0] - W0[0]) * 0.6, (tip[1] - W0[1]) * 0.6, (tip[2] - W0[2]) * 0.6); m.rotation.y = Math.PI / 2; b.add(m); return [m]; }

/* ---------- armor: sculpted when there is one, else the round-4 piece ---------- */
const piece5 = (B, it, sculpt = true) => sculpt && S5.SCULPT5.has(it.k) ? S5.wear5(B, it.k) : arm4(B, it.k, it.sd);

/* ---------- equip5: armor + weapons with straight wrists ---------- */
function equip5(T, { armor = [], R, L }, opt = {}) {
  const B = T.B, out = []; for (const it of armor) out.push(...piece5(B, it, opt.sculpt !== false));
  const hk = R ? W5[R] : null, H = hk ? H5[hk] : null; const handL = H && H.hand === 'L';
  T.apply({ pose: T.specPose({ p: STANCE.p, j: STANCE.j, f: STANCE.f }) });   /* the stance alone: the shoulders' places */
  const h = {}, hp = {}, fr = {}, mounts = [];
  if (H && H.R) { fr.R = frame5(T, 'R', H.R); mounts.push(['R', R, H.R.th]); }
  if (H && H.L) { fr.L = frame5(T, 'L', H.L); mounts.push(['L', R, H.L.th]); }
  if (H && H.two && fr.R) { const q = fr.R.grip.clone().add(fr.R.b.clone().multiplyScalar(H.two.d)); fr.L = frame5(T, 'L', { th: H.two.th, b: fr.R.b.toArray(), hint: H.two.hint, at: q.toArray() }); }
  if (R === 'knives') { fr.L = frame5(T, 'L', mirH(H5.dagger.R)); mounts.push(['L', 'pugio', H5.dagger.R.th]); }
  if (L && !isShield(L)) { const hl = W5[L] === 'dagger' ? H5.dagger.R : H5.sword.R; fr.L = frame5(T, 'L', mirH(hl)); mounts.push(['L', L, hl.th]); }
  for (const sd of ['L', 'R']) if (fr[sd]) { h[sd] = fr[sd].h; hp[sd] = fr[sd].hp; }
  if (H && H.drawR) { h.R = H.drawR.h; hp.R = H.drawR.hp; }
  if (!h.L) { if (L && isShield(L)) { h.L = [-20, 1050, 330]; hp.L = [1, -0.3, 0.3]; } else { h.L = [210, 1230, 330]; hp.L = [1, -0.6, -0.2]; } }
  if (!h.R) { h.R = [-300, 1150, 280]; hp.R = [1, -1, -0.3]; }
  T.apply({ pose: T.specPose({ p: STANCE.p, j: STANCE.j, f: STANCE.f, h, hp }) });
  for (const sd of ['L', 'R']) if (fr[sd]) T.align(sd, { tf: fr[sd].f.toArray() });
  if (L && isShield(L)) T.align('L', { o: [0, 0, 1] });
  const clamped = ['L', 'R'].filter(sd => clampWrist(T, sd));
  const wm = mounts.map(([sd, k, th]) => mount5(B, k, sd, th)); out.push(...wm);
  if (L && isShield(L)) out.push(...weaponKit(B, { L }));
  if (R === 'trident') out.push(...net(B));
  if (H && H.drawR && R === 'bow' && wm[0] && wm[0].userData.w4.tips) out.push(...bowString(T, wm[0]));
  /* the blade's miss: actual weapon axis vs the asked b */
  let miss = null; if (wm[0] && fr[mounts[0][0]]) { const m = wm[0]; m.updateWorldMatrix(true, false); const g = T.rig.bones.pe.parent; g.updateWorldMatrix(true, false);
    const a = g.worldToLocal(m.localToWorld(V([0, 0, 0]))), b2 = g.worldToLocal(m.localToWorld(V([0, 1, 0]))); miss = Math.round(Math.acos(Math.min(1, b2.sub(a).normalize().dot(fr[mounts[0][0]].b))) * D * 10) / 10; }
  out.wrist = { R: wristBend(T, 'R'), L: wristBend(T, 'L'), clamped, miss };
  return out;
}
/* round 4 for the before column (same stance, the old bent-wrist align) */
function equip4(T, R) {
  const H = HOLD4[WHOLD4[R]]; const out = weapon4(T.B, R, H.hand);
  const h = { R: H.arm.R, L: [210, 1230, 330] }, hp = { R: H.arm.hpR, L: [1, -0.6, -0.2] };
  T.apply({ pose: T.specPose({ p: STANCE.p, j: STANCE.j, f: STANCE.f, h, hp }) }); T.align('L', { f: [0.15, 0.3, 1] }); if (H.f) T.align('R', { f: H.f });
  out.wrist = { R: wristBend(T, 'R'), L: wristBend(T, 'L') }; return out;
}

window.LOOK_RUN5 = async function () {
  const R = { files: {}, stats: {} }; const out = (k, c) => { R.files[k] = c.toDataURL('image/png'); };
  const armorSheet = await load('../../../assets/armor2.webp'), wsheet = await load('../../../assets/weapons.jpg');
  const refImg = {}; for (const [k, d] of Object.entries(PIECES4)) if (typeof d.ref === 'string') refImg[d.ref] = await load(`../../../assets/${d.ref}.webp`);
  const drawRef = (g, d, x, y, w, h) => { if (!d) return; if (typeof d.ref === 'string') { const im = refImg[d.ref]; fit(g, im, 0, 0, im.width, im.height, x, y, w, h); } else { const i = d.ref; fit(g, armorSheet, (i % 9) * 330, Math.floor(i / 9) * 330, 330, 330, x, y, w, h); } };
  const M = await token({}); R.stats.build = M.buildMs; M.apply({ look: { hs: 'crop', skin: SKIN } });
  const stand = M.presets.find(p => p[0] === 'stand')[2];
  const IMG = { gladius: 0, mace: 1, sica: 2, hasta: 3, stones: 4, thracian: 5, knives: 6, trident: 7, rudis: 8, severedArm: 9, severedLeg: 10, axe: 11, falcata: 12, bow: 13, pugio: 14, scissor: 15, scutum: 16, sling: 17, arcu: 18, charun: 19, flavgl: 20, jade: 21, flail: 22, pilum: 23, labrys: 24, psykhe: 25, achilles: 26 };
  const fmtW = (w) => `flex ${w.flex}° · dev ${w.dev}°`;
  /* ---------- 1. wrists: before / after, 4 holds × 3 facings ---------- */
  {
    const HOLDS = [['gladius', 'sword'], ['hasta', 'spear (overhand)'], ['axe', 'axe (hafted)'], ['knives', 'knives (reverse)']];
    const VIEWS = [[40, 'R'], [100, 'R'], [-60, 'R']];
    const CW = 175, CH = 230; const [c, g] = cv(30 + 2 * (3 * CW + 30) + 20, 70 + HOLDS.length * (CH + 56));
    txt(g, 'Round 5 · WRISTS — round 4 (left: wrist bent to aim) vs round 5 (right: wrist straight, elbow + shoulder angle it) · 3 facings', 20, 32, 16, INK, 1);
    R.stats.wrists = {}; const t0 = performance.now();
    for (let i = 0; i < HOLDS.length; i++) { const [k, name] = HOLDS[i]; const y = 56 + i * (CH + 56);
      txt(g, name, 20, y + 14, 15, INK, 1);
      for (const side of [0, 1]) { const L = side ? equip5(M, { R: k }) : equip4(M, k); const x0 = 20 + side * (3 * CW + 40);
        VIEWS.forEach(([yaw], j) => g.drawImage(M.hero({ yaw, w: CW, h: CH, span: 1.25, focus: 'wR', fdy: 0.05, el: 14, outlinePx: 1.3 }), x0 + j * CW, y + 22));
        const w = L.wrist.R; const bad = Math.abs(w.flex) > 15 || Math.abs(w.dev) > 10;
        txt(g, `${side ? 'ROUND 5' : 'round 4'} · right wrist ${fmtW(w)}${side && L.wrist.miss != null ? ` · blade off its aim ${L.wrist.miss}°` : ''}`, x0, y + CH + 40, 12.5, bad ? BAD : OK, 1);
        R.stats.wrists[k + (side ? '_r5' : '_r4')] = { R: w, L: L.wrist.L, miss: L.wrist.miss };
        kill(M, L); }
      if (i) { g.strokeStyle = '#cbbd9f'; g.beginPath(); g.moveTo(20, y - 4); g.lineTo(c.width - 20, y - 4); g.stroke(); } }
    g.strokeStyle = '#b8a888'; g.beginPath(); g.moveTo(20 + 3 * CW + 20, 50); g.lineTo(20 + 3 * CW + 20, c.height - 10); g.stroke();
    R.stats.wristMs = Math.round(performance.now() - t0); out('r5_wrists', c);
  }
  /* ---------- 2. every weapon type in its round-5 hold (one facing + numbers) ---------- */
  {
    const inv = await (await fetch('r3_inventory.json')).json(); const Wk = inv.w.filter(w => W5[w.k] && !isShield(w.k));
    const COLS = 6, CW = 290, CH = 330; const rows = Math.ceil(Wk.length / COLS); const [c, g] = cv(20 + COLS * CW, 60 + rows * CH);
    txt(g, `Round 5 · every held weapon (${Wk.length}) with a straight wrist — his card top, the hold below, the wrist's bend in the hand's own frame`, 20, 32, 17, INK, 1);
    R.stats.holds = {}; const t0 = performance.now();
    for (let i = 0; i < Wk.length; i++) { const w = Wk[i]; const L = equip5(M, { R: w.k }); const x = 20 + (i % COLS) * CW, y = 50 + Math.floor(i / COLS) * CH;
      const ci = IMG[w.k]; if (ci != null) fit(g, wsheet, (ci % 9) * 600, Math.floor(ci / 9) * 416, 600, 416, x + 70, y + 20, 130, 90);
      g.drawImage(M.hero({ yaw: 50, w: 270, h: 190, span: 2.3, cy: 1.15, el: 16, outlinePx: 1.2 }), x, y + 112);
      const hd = H5[W5[w.k]]; const sd = hd.hand === 'L' ? 'L' : 'R'; const wb = L.wrist[sd]; const bad = Math.abs(wb.flex) > 15 || Math.abs(wb.dev) > 10;
      txt(g, `${w.n}`, x, y + 14, 13, INK, 1); txt(g, `${sd} ${fmtW(wb)}${hd.two || w.k === 'knives' ? ` · L ${fmtW(L.wrist.L)}` : ''}`, x, y + 318, 11, bad ? BAD : OK);
      R.stats.holds[w.k] = { hold: W5[w.k], R: L.wrist.R, L: L.wrist.L, miss: L.wrist.miss, clamped: L.wrist.clamped }; kill(M, L); }
    R.stats.holdsMs = Math.round(performance.now() - t0); out('r5_holds', c);
  }
  /* ---------- 3. the sculpted pieces beside his art and round 4 ---------- */
  {
    const LIST = [['murmillo', 'he', 0.66, 0.15, 30, -70], ['thrachelm', 'he', 0.8, 0.2, 30, -80], ['crista', 'he', 0.8, 0.2, 30, -80], ['centurion', 'he', 0.7, 0.15, 30, -70], ['musculata', 'ch', 0.9, 0.0, 22, 200], ['thorax', 'ch', 0.95, 0.02, 22, -60]];
    const CW = 235, CH = 250; const [c, g] = cv(20 + 5 * CW + 20, 70 + LIST.length * (CH + 30));
    txt(g, 'Round 5 · SCULPTED in code (SDF → surface nets → decimated → AO + wear + paint baked) — his art · round 4 · round 5 (two views)', 20, 32, 17, INK, 1);
    M.B.kit.setHarness(false); R.stats.sculpt = {};
    for (let i = 0; i < LIST.length; i++) { const [k, bone, span, dy, y1, y2] = LIST[i]; const y = 50 + i * (CH + 30), d = PIECES4[k];
      g.fillStyle = '#4a4440'; g.fillRect(20, y + 22, 220, CH - 10); drawRef(g, d, 25, y + 27, 210, CH - 20);
      M.apply({ pose: stand });
      let L = arm4(M.B, k, 'L'); M.apply({ pose: stand }); g.drawImage(M.hero({ yaw: y1, w: CW - 10, h: CH, span, focus: bone, fdy: dy, el: 14, outlinePx: 1.4 }), 20 + CW, y + 18); kill(M, L);
      const t0 = performance.now(); L = S5.wear5(M.B, k); const ms = Math.round(performance.now() - t0); M.apply({ pose: stand });
      g.drawImage(M.hero({ yaw: y1, w: CW - 10, h: CH, span, focus: bone, fdy: dy, el: 14, outlinePx: 1.4 }), 20 + 2 * CW + 20, y + 18);
      g.drawImage(M.hero({ yaw: y2, w: CW - 10, h: CH, span, focus: bone, fdy: dy, el: 14, outlinePx: 1.4 }), 20 + 3 * CW + 20, y + 18);
      g.drawImage(M.hero({ yaw: y1 + 180, w: CW - 10, h: CH, span, focus: bone, fdy: dy, el: 14, outlinePx: 1.4 }), 20 + 4 * CW + 20, y + 18);
      const st = S5.STATS5[k]; R.stats.sculpt[k] = Object.assign({ wearMs: ms }, st);
      txt(g, `${k} — ${st.tris.toLocaleString()} triangles (meshed ${st.trisFine.toLocaleString()}, decimated), ${st.verts.toLocaleString()} verts, built in ${st.ms} ms`, 20, y + 14, 13.5, INK, 1);
      txt(g, 'his art', 22, y + CH + 24, 11, DIM); txt(g, 'round 4', 20 + CW, y + CH + 24, 11, DIM); txt(g, 'round 5 sculpt · 3 views', 20 + 2 * CW + 20, y + CH + 24, 11, DIM);
      kill(M, L); }
    M.B.kit.setHarness(true); out('r5_sculpt', c);
  }
  /* ---------- 4. the maximum load ---------- */
  {
    const want = [{ k: 'murmillo' }, { k: 'thorax' }, { k: 'balteus' }, { k: 'galerus', sd: 'R' }, { k: 'wraps', sd: 'R' }, { k: 'bracers', sd: 'R' }, { k: 'manica', sd: 'L' }, { k: 'wraps', sd: 'L' },
      { k: 'thighplate', sd: 'L' }, { k: 'thighplate', sd: 'R' }, { k: 'legwraps', sd: 'L' }, { k: 'legwraps', sd: 'R' }, { k: 'cnemis', sd: 'L' }, { k: 'ocrea', sd: 'R' }];
    const chk = outfitCheck(want); const t0 = performance.now(); const L = equip5(M, { armor: chk.keep, R: 'gladius', L: 'scutum' }); const eqMs = Math.round(performance.now() - t0);
    const s = sheetOf(M); R.stats.max = { kb: s.kb, meta: s.meta, ms: s.ms, equipMs: eqMs, wrist: L.wrist }; out('r5_maxload_sheet', s.canvas);
    const hero = M.hero(Object.assign({ yaw: 24 }, HERO)), side = M.hero(Object.assign({}, HERO, { yaw: -80, w: 300, h: 300 })), back = M.hero(Object.assign({}, HERO, { yaw: 200, w: 300, h: 300 }));
    const [c, g] = cv(1500, 900); txt(g, 'Round 5 · MAXIMUM LOAD — sculpted Steel Gated Helm + Reinforced Chest, round-4 limbs, Scutum, Gladius with a straight wrist', 20, 30, 16, INK, 1);
    cells(s.canvas, s.meta[0], s.meta[1]).forEach((cc, i) => g.drawImage(cc, 20 + i * 180 + (180 - s.meta[0]) / 2, 46));
    txt(g, `8 facings ${s.canvas.width}×${s.canvas.height} · ${s.kb} KB WebP · sheet ${s.ms} ms · right wrist ${fmtW(L.wrist.R)} · sculpts: ${['murmillo', 'thorax'].map(k => k + ' ' + S5.STATS5[k].tris.toLocaleString() + ' tris').join(', ')}`, 20, 210, 13, DIM);
    g.drawImage(hero, 20, 230); g.drawImage(side, 560, 240); g.drawImage(back, 880, 240);
    out('r5_maxload', c); kill(M, L);
  }
  /* ---------- 5. the 8 class loadouts ---------- */
  {
    const CLS = [['soldier', { armor: [{ k: 'centurion' }, { k: 'balteus' }, { k: 'wraps', sd: 'L' }, { k: 'wraps', sd: 'R' }, { k: 'legwrapsU', sd: 'L' }, { k: 'legwrapsU', sd: 'R' }], R: 'gladius' }],
      ['royalty', { armor: [{ k: 'cassis' }, { k: 'ornate' }, { k: 'wraps', sd: 'L' }, { k: 'wraps', sd: 'R' }], R: 'pugio' }],
      ['hero', { armor: [{ k: 'thrachelm' }, { k: 'provmanica', sd: 'L' }, { k: 'wraps', sd: 'L' }, { k: 'wraps', sd: 'R' }, { k: 'legwraps', sd: 'L' }, { k: 'legwraps', sd: 'R' }], R: 'sica', L: 'thracian' }],
      ['slave', { armor: [{ k: 'galea' }, { k: 'manica', sd: 'L' }, { k: 'wraps', sd: 'L' }, { k: 'wraps', sd: 'R' }, { k: 'legwraps', sd: 'L' }, { k: 'legwraps', sd: 'R' }], R: 'trident' }],
      ['veteranus', { armor: [{ k: 'flavhelm' }, { k: 'musculata' }, { k: 'wraps', sd: 'L' }, { k: 'wraps', sd: 'R' }, { k: 'legwraps', sd: 'L' }, { k: 'legwraps', sd: 'R' }], R: 'rudis' }],
      ['amazonia', { fem: 1, armor: [{ k: 'amazon' }, { k: 'cestus', sd: 'R' }, { k: 'greaves', sd: 'L' }, { k: 'greaves', sd: 'R' }], R: 'axe', L: 'falcata' }],
      ['venatore', { armor: [{ k: 'steelhelm' }, { k: 'balteus1' }, { k: 'wraps', sd: 'L' }, { k: 'wraps', sd: 'R' }, { k: 'legwraps', sd: 'L' }, { k: 'legwraps', sd: 'R' }], R: 'hasta' }],
      ['damnatio', { armor: [{ k: 'wraps', sd: 'L' }, { k: 'wraps', sd: 'R' }, { k: 'legwraps', sd: 'L' }, { k: 'legwraps', sd: 'R' }], R: 'sling' }]];
    const MINI8 = { hero: [106, 115], veteranus: [80, 124], amazonia: [111, 136], damnatio: [80, 125], royalty: [82, 130], soldier: [95, 129], slave: [138, 133], venatore: [105, 128] };
    LOOK.setBody(LOOK.FEM_BODY); const F = await token({ body: { fem: 1, grip: { L: 'hilt', R: 'hilt' }, face2: 1, headRes: 0.0022 } }); F.apply({ look: { hs: 'long', fem: 1, skin: '#bb8a6c' } }); LOOK.setBody(null);
    const [c, g] = cv(1780, 70 + CLS.length * 200); txt(g, 'Round 5 · the 8 class loadouts — sculpted helmets/cuirasses where made (✦), straight wrists · his mini left · painted · 1.15×', 20, 32, 18, INK, 1);
    R.stats.classes = {};
    for (let n = 0; n < CLS.length; n++) { const [k, d] = CLS[n]; const T = d.fem ? F : M; if (d.fem) LOOK.setBody(LOOK.FEM_BODY);
      const L = equip5(T, d); const s = sheetOf(T); const hero = T.hero(Object.assign({ yaw: 24 }, HERO, { w: 190, h: 190 })); R.stats.classes[k] = { kb: s.kb, ms: s.ms, meta: s.meta, wrist: L.wrist }; out('r5_cls_' + k, s.canvas);
      const mini = await load(`../../../assets/minis8_${k}.webp`); const mm = MINI8[k]; const y = 52 + n * 200;
      txt(g, `${k} · ${d.armor.map(a => (S5.SCULPT5.has(a.k) ? '✦' : '') + a.k + (a.sd || '')).join(', ')} · ${[d.R, d.L].filter(Boolean).join(' + ')} · ${s.kb} KB`, 20, y + 14, 13, INK, 1);
      const mc = cells(mini, mm[0], mm[1]); g.drawImage(mc[0], 20, y + 22); g.drawImage(mc[1], 160, y + 22);
      cells(s.canvas, s.meta[0], s.meta[1]).forEach((cc, i) => g.drawImage(cc, 300 + i * 160 + (160 - s.meta[0]) / 2, y + 22)); g.drawImage(hero, 1580, y + 6);
      kill(T, L); if (d.fem) LOOK.setBody(null); }
    out('r5_classes', c);
  }
  R.stats.sculptAll = S5.STATS5;
  return R;
};
window.LOOK5 = { equip5, equip4, wristBend, H5 };
