/* look100/page4.js — ROUND 4: every armor piece modelled from his art (beside its reference), every weapon from his card with its hold
   (3 facings + a body/shield clearance check), the maximum load and the 8 class loadouts with the new pieces. make4.js drives it. */
import * as THREE from 'three';
import { arm4, outfit4, outfitCheck, PIECES4, weapon4, HOLD4, WHOLD4 } from './r4_pieces.js';
import { JK, ENDS } from './rig100.js';
const BG = '#e9e1cf', INK = '#3a2c20', DIM = '#6a5038';
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

/* ---------- equip: armor + weapons + the stance for them ---------- */
const isShield = (k) => WHOLD4[k] === 'shield';
function equip(T, { armor = [], R, L }) {
  const B = T.B, out = outfit4(B, armor);
  const HR = R ? HOLD4[WHOLD4[R]] : null, HLw = L && !isShield(L) ? (WHOLD4[L] === 'bow' || WHOLD4[L] === 'lyre' ? HOLD4[WHOLD4[L]] : HOLD4.sword) : null;
  const handL = HR && HR.hand === 'L';
  const wm = []; if (R) wm.push(...weapon4(B, R, HR && HR.hand)); if (L) wm.push(...(isShield(L) ? weapon4(B, L) : weapon4(B, L, 'L'))); out.push(...wm);
  if (R === 'trident') out.push(...net(B));
  const h = {}, hp = {};
  if (HR) { if (HR.arm.R) { h.R = HR.arm.R; hp.R = HR.arm.hpR; } if (HR.arm.L) { h.L = HR.arm.L; hp.L = HR.arm.hpL; } }
  if (!h.L) { if (L && isShield(L)) { h.L = [-20, 1050, 330]; hp.L = [1, -0.3, 0.3]; } else if (L) { h.L = [270, 1100, 300]; hp.L = [1, -0.6, -0.3]; } else { h.L = [210, 1230, 330]; hp.L = [1, -0.6, -0.2]; } }
  if (!h.R) { h.R = [-300, 1150, 280]; hp.R = [1, -1, -0.3]; }
  const pose = () => { T.apply({ pose: T.specPose({ p: STANCE.p, j: STANCE.j, f: STANCE.f, h, hp }) });
    if (L && isShield(L)) T.align('L', { o: [0, 0, 1] }); else if (L) T.align('L', { f: [0.08, 0.12, 1] }); else if (HR && HR.fL) T.align('L', { f: HR.fL }); else T.align('L', { f: [0.15, 0.3, 1] });
    if (HR && HR.f && !handL) T.align('R', { f: HR.f }); };
  pose();
  /* two hands on one haft: the off hand goes to a point along the weapon, then grips along it */
  if (HR && HR.two && wm[0]) { const m = wm[0]; m.updateWorldMatrix(true, false); const g = B.group; g.updateWorldMatrix(true, false);
    const p = g.worldToLocal(m.localToWorld(new THREE.Vector3(0, HR.two, 0))), d = g.worldToLocal(m.localToWorld(new THREE.Vector3(0, 1, 0))).sub(g.worldToLocal(m.localToWorld(new THREE.Vector3(0, 0, 0)))).normalize();
    h.L = [p.x * 1000, p.y * 1000, p.z * 1000]; hp.L = [1, -0.6, 0.2]; pose(); T.align('L', { f: [d.x, d.y, d.z] }); }
  if (HR && HR.string && wm[0] && wm[0].userData.w4.tips) out.push(...bowString(T, wm[0]));
  return out;
}
function net(B) {   /* a retiarius net hanging from the off hand: a loose mesh of cords */
  const g = new THREE.PlaneGeometry(0.42, 0.62, 9, 12); const P = g.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i); P.setZ(i, 0.05 * Math.sin(x * 9) * Math.cos(y * 7) - Math.abs(x) * 0.12); P.setX(i, x * (0.6 + (0.31 - y) * 0.9)); }
  g.translate(0, -0.33, 0); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xd8c9a0, wireframe: true })); m.userData.raw = 1;
  const b = B.rig.bones.wL, W0 = JK.wL.pos, tip = ENDS.wL; m.position.set((tip[0] - W0[0]) * 0.6, (tip[1] - W0[1]) * 0.6, (tip[2] - W0[2]) * 0.6); m.rotation.y = Math.PI / 2; b.add(m); return [m]; }
function bowString(T, m) {   /* the string from both tips to the drawing hand */
  const g = T.B.group; g.updateWorldMatrix(true, true); m.updateWorldMatrix(true, false);
  const tips = m.userData.w4.tips.map(t => g.worldToLocal(m.localToWorld(new THREE.Vector3(...t))));
  const hb = T.B.rig.bones.wR; hb.updateWorldMatrix(true, false); const hand = g.worldToLocal(hb.localToWorld(new THREE.Vector3(...JK.wR.pos.map((v, i) => (ENDS.wR[i] - v) * 0.5))));
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([tips[0], hand, tips[1]], false, 'catmullrom', 0), 24, 0.006, 5, false);
  const s = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xe8dcc0 })); s.userData.raw = 1; g.add(s); return [s];
}
/* clearance: weapon vertices inside the posed body (bone capsules) or inside the shield board */
function clearance(T, wm, holdSides, shieldMesh) {
  const g = T.B.group; g.updateWorldMatrix(true, true); const J = (k) => { const b = T.B.rig.bones[k]; b.updateWorldMatrix(true, false); return g.worldToLocal(b.getWorldPosition(new THREE.Vector3())); };
  const caps = [['pe', 'ne', 0.1], ['sL', 'eL', 0.045], ['sR', 'eR', 0.045], ['eL', 'wL', 0.038], ['eR', 'wR', 0.038], ['hL', 'kL', 0.07], ['hR', 'kR', 0.07], ['kL', 'aL', 0.05], ['kR', 'aR', 0.05]]
    .filter(([a, b]) => !(holdSides.includes(b[1]) && (a[0] === 'e')) ).map(([a, b, r]) => [J(a), J(b), r]);
  const head = J('he').add(new THREE.Vector3(0, 0.11, 0.02));
  const segD = (p, a, b) => { const ab = b.clone().sub(a), t = Math.max(0, Math.min(1, p.clone().sub(a).dot(ab) / ab.lengthSq())); return p.distanceTo(a.clone().add(ab.multiplyScalar(t))); };
  let body = 0, shield = 0, n = 0; const inv = shieldMesh ? new THREE.Matrix4().copy(shieldMesh.matrixWorld).invert() : null;
  for (const m of wm) { if (!m.geometry || m.userData.raw || m === shieldMesh) continue; m.updateWorldMatrix(true, false); const P = m.geometry.attributes.position;
    for (let i = 0; i < P.count; i += 3) { n++; const w = m.localToWorld(new THREE.Vector3(P.getX(i), P.getY(i), P.getZ(i))); const p = g.worldToLocal(w.clone());
      if (p.distanceTo(head) < 0.1 || caps.some(([a, b, r]) => segD(p, a, b) < r)) body++;
      if (inv) { const l = w.clone().applyMatrix4(inv); if (Math.abs(l.x) < 0.33 && Math.abs(l.y) < 0.51 && Math.abs(l.z) < 0.03) shield++; } } }
  return { body, shield, n };
}

window.LOOK_RUN4 = async function () {
  const R = { files: {}, stats: {} }; const out = (k, c) => { R.files[k] = c.toDataURL('image/png'); };
  const inv = await (await fetch('r3_inventory.json')).json();
  const armorSheet = await load('../../../assets/armor2.webp'), wsheet = await load('../../../assets/weapons.jpg');
  const refImg = {}; for (const [k, d] of Object.entries(PIECES4)) if (typeof d.ref === 'string') refImg[d.ref] = await load(`../../../assets/${d.ref}.webp`);
  const drawRef = (g, d, x, y, w, h) => { if (typeof d.ref === 'string') { const im = refImg[d.ref]; fit(g, im, 0, 0, im.width, im.height, x, y, w, h); } else { const i = d.ref; fit(g, armorSheet, (i % 9) * 330, Math.floor(i / 9) * 330, 330, 330, x, y, w, h); } };
  const M = await token({}); R.stats.build = M.buildMs; M.apply({ look: { hs: 'crop', skin: SKIN } });
  const stand = M.presets.find(p => p[0] === 'stand')[2];
  /* ---------- 1. every armor piece beside his art ---------- */
  {
    const A = inv.arm.filter(a => PIECES4[a.k]); const COLS = 4, CW = 590, CH = 290; const rows = Math.ceil(A.length / COLS);
    const [c, g] = cv(20 + COLS * CW, 60 + rows * CH + 30); txt(g, `Round 4 · every printed armor piece (${A.length}) modelled from his art — his art left, the 3D piece in two views`, 20, 32, 20, INK, 1);
    M.B.kit.setHarness(false); const t0 = performance.now();
    const FOC = { head: ['he', 0.62, 0.15, 30, -60], torso: ['ch', 0.82, 0.02, 25, 200], belt: ['sp', 0.7, -0.05, 25, 200], armU: ['eL', 0.6, 0.12, -60, -150], armL: ['wL', 0.55, 0.1, -60, 160], hand: ['wL', 0.4, -0.05, -60, 140], legU: ['kL', 0.75, 0.16, -35, -110], legL: ['kL', 0.8, -0.2, -25, 160] };
    for (let i = 0; i < A.length; i++) { const a = A[i], d = PIECES4[a.k]; const both = !['head', 'torso', 'belt'].includes(d.seg);
      const L = both ? [...arm4(M.B, a.k, 'L'), ...arm4(M.B, a.k, 'R')] : arm4(M.B, a.k, 'L'); M.apply({ pose: stand });
      const [bone, span, dy, y1, y2] = FOC[d.seg]; const v1 = M.hero({ yaw: y1, w: 210, h: 230, span, focus: bone, fdy: dy, el: 14, outlinePx: 1.4 }), v2 = M.hero({ yaw: y2, w: 210, h: 230, span, focus: bone, fdy: dy, el: 14, outlinePx: 1.4 });
      const x = 20 + (i % COLS) * CW, y = 50 + Math.floor(i / COLS) * CH; g.fillStyle = '#4a4440'; g.fillRect(x, y + 32, 150, 230); drawRef(g, d, x + 5, y + 37, 140, 220);
      g.drawImage(v1, x + 155, y + 32); g.drawImage(v2, x + 370, y + 32);
      txt(g, `${a.n}`, x, y + 14, 14, INK, 1); txt(g, `${a.k} · ${a.slot}/${a.pt} · AP ${a.ap}`, x, y + 28, 11.5, DIM);
      kill(M, L); }
    R.stats.armorMs = Math.round(performance.now() - t0); out('r4_armor', c); M.B.kit.setHarness(true);
  }
  /* ---------- 2. every weapon from his card, in its hold, 3 facings + clearance ---------- */
  {
    const Wk = inv.w.filter(w => WHOLD4[w.k]); const COLS = 2, CW = 880, CH = 300; const rows = Math.ceil(Wk.length / COLS);
    const [c, g] = cv(20 + COLS * CW, 60 + rows * CH + 30); txt(g, `Round 4 · every weapon (${Wk.length}) from his card, held by its type — card left, 3 facings, clearance vs body/shield`, 20, 32, 20, INK, 1);
    const IMG = { gladius: 0, mace: 1, sica: 2, hasta: 3, stones: 4, thracian: 5, knives: 6, trident: 7, rudis: 8, severedArm: 9, severedLeg: 10, axe: 11, falcata: 12, bow: 13, pugio: 14, scissor: 15, scutum: 16, sling: 17, arcu: 18, charun: 19, flavgl: 20, jade: 21, flail: 22, pilum: 23, labrys: 24, psykhe: 25, achilles: 26 };
    R.stats.clear = {}; const t0 = performance.now();
    for (let i = 0; i < Wk.length; i++) { const w = Wk[i], hk = WHOLD4[w.k]; const kit = isShield(w.k) ? { L: w.k } : hk === 'bow' || hk === 'lyre' ? { R: w.k } : { R: w.k };
      const L = equip(M, kit); const holds = isShield(w.k) ? ['L'] : HOLD4[hk].two ? ['L', 'R'] : [HOLD4[hk].hand || 'R'].concat(w.k === 'knives' || w.k === 'trident' ? ['L'] : []);
      const cl = clearance(M, L.filter(m => m.userData && (m.userData.w4 || m.isMesh)).filter(m => !(m.name || '').startsWith('r4_')), holds, isShield(w.k) ? null : null); R.stats.clear[w.k] = cl;
      const vs = [45, 100, -70].map(y => M.hero({ yaw: y, w: 200, h: 250, span: 2.75, cy: 1.05, el: 16, outlinePx: 1.3 }));
      const x = 20 + (i % COLS) * CW, y = 50 + Math.floor(i / COLS) * CH; const ci = IMG[w.k];
      if (ci != null) fit(g, wsheet, (ci % 9) * 600, Math.floor(ci / 9) * 416, 600, 416, x, y + 40, 250, 174); else { g.fillStyle = '#4a4440'; g.fillRect(x, y + 40, 250, 174); txt(g, 'no card art', x + 80, y + 130, 13, '#ddd'); }
      vs.forEach((v, j) => g.drawImage(v, x + 260 + j * 205, y + 30));
      txt(g, `${w.n} · ${w.k}`, x, y + 14, 14, INK, 1); txt(g, `hold: ${hk} — ${HOLD4[hk].note}`, x, y + 30, 12, DIM);
      txt(g, cl.body ? `⚠ ${cl.body}/${cl.n} sample points inside the body` : `✓ clear of the body (${cl.n} points checked)`, x, y + 236, 12, cl.body ? '#a3281f' : '#3a7a3a');
      kill(M, L); }
    R.stats.weaponMs = Math.round(performance.now() - t0); out('r4_weapons', c);
  }
  /* ---------- 3. the maximum load ---------- */
  {
    const want = [{ k: 'murmillo' }, { k: 'thorax' }, { k: 'balteus' }, { k: 'galerus', sd: 'R' }, { k: 'wraps', sd: 'R' }, { k: 'bracers', sd: 'R' }, { k: 'manica', sd: 'L' }, { k: 'wraps', sd: 'L' },
      { k: 'thighplate', sd: 'L' }, { k: 'thighplate', sd: 'R' }, { k: 'legwraps', sd: 'L' }, { k: 'legwraps', sd: 'R' }, { k: 'cnemis', sd: 'L' }, { k: 'ocrea', sd: 'R' }];
    const chk = outfitCheck(want); const L = equip(M, { armor: chk.keep, R: 'gladius', L: 'scutum' });
    const sh = L.find(m => Array.isArray(m.material)); const cl = clearance(M, L.filter(m => m.userData && m.userData.w4), ['R'], sh); R.stats.maxClear = cl;
    const s = sheetOf(M); R.stats.max = { kb: s.kb, meta: s.meta, ms: s.ms }; out('r4_maxload_sheet', s.canvas);
    const hero = M.hero(Object.assign({ yaw: 24 }, HERO)), side = M.hero(Object.assign({}, HERO, { yaw: -80, w: 300, h: 300 })), back = M.hero(Object.assign({}, HERO, { yaw: 200, w: 300, h: 300 }));
    const [c, g] = cv(1500, 900); txt(g, 'Round 4 · MAXIMUM LOAD with the modelled pieces (Steel Gated Helm, Reinforced Chest + pauldrons, Belt II, Lorica Segmentata R, Galerus L, wraps + Bracers, Tassets, leg wraps, Steel Greaves + Greaves, Scutum, Gladius)', 20, 30, 15, INK, 1);
    cells(s.canvas, s.meta[0], s.meta[1]).forEach((cc, i) => g.drawImage(cc, 20 + i * 180 + (180 - s.meta[0]) / 2, 46));
    txt(g, `8 facings ${s.canvas.width}×${s.canvas.height} · ${s.kb} KB WebP · ${s.ms} ms · gladius clearance: body ${cl.body}, shield ${cl.shield} of ${cl.n} points`, 20, 210, 13, DIM);
    g.drawImage(hero, 20, 230); g.drawImage(side, 560, 240); g.drawImage(back, 880, 240);
    out('r4_maxload', c); kill(M, L);
  }
  /* ---------- 4. the 8 class loadouts ---------- */
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
    const [c, g] = cv(1780, 70 + CLS.length * 200); txt(g, 'Round 4 · the 8 class loadouts with the modelled pieces and weapon holds · his mini left · painted · 1.15×', 20, 32, 18, INK, 1);
    R.stats.classes = {};
    for (let n = 0; n < CLS.length; n++) { const [k, d] = CLS[n]; const T = d.fem ? F : M; if (d.fem) LOOK.setBody(LOOK.FEM_BODY);
      const L = equip(T, d); const s = sheetOf(T); const hero = T.hero(Object.assign({ yaw: 24 }, HERO, { w: 190, h: 190 })); R.stats.classes[k] = { kb: s.kb, ms: s.ms, meta: s.meta }; out('r4_cls_' + k, s.canvas);
      const mini = await load(`../../../assets/minis8_${k}.webp`); const mm = MINI8[k]; const y = 52 + n * 200;
      txt(g, `${k} · ${d.armor.map(a => a.k + (a.sd || '')).join(', ')} · ${[d.R, d.L].filter(Boolean).join(' + ')} · ${s.kb} KB`, 20, y + 14, 13, INK, 1);
      const mc = cells(mini, mm[0], mm[1]); g.drawImage(mc[0], 20, y + 22); g.drawImage(mc[1], 160, y + 22);
      cells(s.canvas, s.meta[0], s.meta[1]).forEach((cc, i) => g.drawImage(cc, 300 + i * 160 + (160 - s.meta[0]) / 2, y + 22)); g.drawImage(hero, 1580, y + 6);
      kill(T, L); if (d.fem) LOOK.setBody(null); }
    out('r4_classes', c);
  }
  return R;
};
