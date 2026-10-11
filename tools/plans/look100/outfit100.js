/* look100 round 3 — FULL OUTFITTING: every printed armor piece + weapon on the 3D token, layered so a full load stacks cleanly.
   LAYER STACK per body segment (shell offset off the skin, metres): skin 0 → sandals 0.0048 → padding/wraps 0.0062 → mail/scale 0.0092
   → plates 0.0125 → belts/straps 0.019 → rigid shoulder guards (stacked outward, +12 % each) → rigid helmets/crests.
   The game's rules (03-engine armorConflict + 232 armPad): one HARD piece per equip point (helm · chest · upper · lower · hand), lower padding
   (wraps / legwraps) stacks UNDER a hard lower piece, the belt sits ON the chest plate and under the limb pieces, the Leather Tasset takes the
   upper leg alone like a thigh plate. outfitCheck() applies those rules to a list before it is built.
   PIECES = piece → { seg, layer, recipe options } (the data table). outfit(B, [{k, sd}]) → meshes; weapons via gear100 weaponKit + WEAPONS here. */
import * as THREE from 'three';
import { murmKit, weaponKit, merge, plate, box, cyl, ball, at, colorize, helmetGeo, basisQ, canvasTex, METAL, BRONZE, GOLD, LEATHER, CLOTH, WOOD, STEEL, BRASS, MAROON, GOLD2 } from './gear100.js';

export const LAYER = { pad: 0.0062, mail: 0.0092, plate: 0.0125, belt: 0.019 };
export const PIECES = {
  galea: { seg: 'head', layer: 'helm', helm: 'galea', col: '#8b8d8c' }, cassis: { seg: 'head', layer: 'helm', helm: 'horned', col: BRONZE },
  crista: { seg: 'head', layer: 'helm', helm: 'crested', col: GOLD }, murmillo: { seg: 'head', layer: 'helm', helm: 'murm' },
  helm5: { seg: 'head', layer: 'helm', helm: 'secutor', col: '#5f6873' }, flavhelm: { seg: 'head', layer: 'helm', helm: 'crested', col: GOLD },
  centurion: { seg: 'head', layer: 'helm', helm: 'centurion', col: GOLD }, steelhelm: { seg: 'head', layer: 'helm', helm: 'galea', col: '#aab1b7' },
  thrachelm: { seg: 'head', layer: 'helm', helm: 'thraex', col: BRONZE },
  pectorale: { seg: 'torso', layer: 'plate', shape: 'pect', col: BRONZE }, lorica: { seg: 'torso', layer: 'mail', shape: 'cuirass', pat: 'scale', col: '#9ea5aa' },
  musculata: { seg: 'torso', layer: 'plate', shape: 'cuirass', pat: 'muscle', col: BRONZE }, amazon: { seg: 'torso', layer: 'plate', shape: 'cuirass', pat: 'straps', col: GOLD },
  flavchest: { seg: 'torso', layer: 'plate', shape: 'cuirass', pat: 'muscle', col: GOLD2 }, thorax: { seg: 'torso', layer: 'plate', shape: 'high', pat: 'plates', col: '#8a857d', pauldron: 1 },
  ornate: { seg: 'torso', layer: 'plate', shape: 'high', pat: 'medal', col: GOLD },
  balteus: { seg: 'belt', layer: 'belt', style: 'ornate' }, balteus1: { seg: 'belt', layer: 'belt', style: 'ring', col: LEATHER },
  wraps: { seg: 'armL', layer: 'pad', pat: 'pad', col: CLOTH }, bracers: { seg: 'armL', layer: 'plate', pat: 'plate', col: GOLD },
  manica: { seg: 'armU', layer: 'plate', pat: 'lames', col: BRONZE, flare: 1 }, provmanica: { seg: 'armU', layer: 'plate', pat: 'lames', col: STEEL, flare: 1 },
  galerus: { seg: 'armU', layer: 'plate', pat: 'lames', col: '#7d8288', flare: 2 }, cestus: { seg: 'hand', layer: 'pad', col: LEATHER },
  legwrapsU: { seg: 'legU', layer: 'plate', pat: 'strips', col: '#8a5a34' }, femoralia: { seg: 'legU', layer: 'plate', pat: 'lames', col: '#6e6b5c' },
  thighplate: { seg: 'legU', layer: 'plate', pat: 'lames', col: GOLD }, legwraps: { seg: 'legL', layer: 'pad', pat: 'pad', col: CLOTH },
  ocrea: { seg: 'legL', layer: 'plate', front: 1, knee: 1, col: GOLD2 }, greaves: { seg: 'legL', layer: 'plate', front: 1, knee: 1, pat: 'engr', col: GOLD },
  cnemis: { seg: 'legL', layer: 'plate', front: 1, knee: 1, col: STEEL }, lgreaves: { seg: 'legL', layer: 'plate', front: 1, col: '#6a4428' },
};
/* the equip point a segment stands for (armorConflict's pt) */
const PT = { head: 'helm', torso: 'chest', belt: 'belt', armU: 'upper', armL: 'lower', hand: 'hand', legU: 'upper', legL: 'lower' };
/* the game's stacking rules on a list [{k, sd}] — returns the list it keeps + what it refused and why */
export function outfitCheck(list) {
  const keep = [], refused = []; const pad = (k) => PIECES[k].layer === 'pad' && PIECES[k].seg !== 'hand' || PIECES[k].seg === 'belt';
  for (const it of list) { const P = PIECES[it.k]; if (!P) { refused.push([it.k, 'not a piece']); continue; }
    const loc = P.seg === 'head' || P.seg === 'torso' || P.seg === 'belt' ? P.seg === 'head' ? 'head' : 'chest' : (P.seg.startsWith('arm') || P.seg === 'hand' ? 'arm' : 'leg') + it.sd;
    const clash = keep.find(o => { const Q = PIECES[o.k]; const l2 = Q.seg === 'head' ? 'head' : Q.seg === 'torso' || Q.seg === 'belt' ? 'chest' : (Q.seg.startsWith('arm') || Q.seg === 'hand' ? 'arm' : 'leg') + o.sd;
      if (l2 !== loc) return false; const sameP = PT[Q.seg] === PT[P.seg] || (Q.seg === 'belt' && P.seg === 'torso') ? PT[Q.seg] === PT[P.seg] : false;
      return sameP && (pad(it.k) ? pad(o.k) : !pad(o.k)); });
    if (clash) refused.push([it.k + (it.sd || ''), 'equip point taken by ' + clash.k]); else keep.push(it); }
  return { keep, refused };
}

export function outfit(B, list) {
  const K = B.kit, P = K.P, GI = K.GI, out = [];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const tAl = (p, a, b) => { const ab = sub(b, a); return dot(sub(p, a), ab) / dot(ab, ab); };
  const lin = (hex) => { const c = new THREE.Color(hex).convertSRGBToLinear(); return [c.r, c.g, c.b]; };
  const sh = (c, v) => lin(c).map(x => x * v);
  const toon = (c, ex) => K.makeToon(c, ex);
  const rig_ = (geo, mat, bone, at2, q) => { const m = K.rigid(geo, mat, bone, at2, null); const bp = P(bone); m.position.set(at2[0] - bp[0], at2[1] - bp[1], at2[2] - bp[2]); if (q) m.quaternion.copy(q);
    m.userData.ownMat = 1; const ink = m.userData.ink; if (ink) { ink.position.copy(m.position); ink.quaternion.copy(m.quaternion); } out.push(m); return m; };
  const shell = (name, mask, colFn, off, hem) => { const mat = K.maskedMat(); if (hem) mat.userData.hem = { w: 0.005, col: hem, bw: 0, bcol: [0, 0, 0] }; const m = K.shellFrom(name, mask, colFn, off, { mat }); m.userData.ownMat = 1; out.push(m); return m; };
  const band = (t, t0, t1) => Math.min(t - t0, t1 - t) * 0.25;
  const PAT = {
    plate: (c) => (p) => sh(c, 0.92 + 0.1 * Math.sin(p[1] * 60)),
    pad: (c, a, b) => (p) => sh(c, Math.sin(tAl(p, a, b) * 46) > 0 ? 1 : 0.8),
    lames: (c, a, b) => (p) => { const f = (tAl(p, a, b) * 7) % 1; return sh(c, f < 0.12 ? 0.45 : 0.8 + 0.25 * f); },
    strips: (c) => (p) => { const a = Math.atan2(p[0], p[2]) * 6; return sh(c, Math.abs(a - Math.round(a)) < 0.08 ? 0.5 : 1); },
    scale: (c) => (p) => { const r = p[1] * 110, row = Math.floor(r), f = r - row, u = ((Math.atan2(p[0], p[2]) * 9 + (row % 2) * 0.5) % 1 + 1) % 1; return sh(c, Math.hypot(u - 0.5, f - 0.15) < 0.48 ? 1 : 0.55); },
    muscle: (c) => (p) => { const x = Math.abs(p[0]); const line = Math.abs(p[1] - 1.33 - x * 0.25) < 0.006 && x < 0.13 || x < 0.004 && p[1] < 1.33 || (p[1] < 1.29 && p[1] > 1.12 && Math.abs((p[1] - 1.12) % 0.055) < 0.005 && x < 0.06);
      return sh(c, line ? 0.55 : 0.95 + 0.1 * Math.cos(x * 20)); },
    straps: (c) => (p) => { const d1 = Math.abs(p[1] - 1.12 - (p[0] + 0.15) * 1.3), d2 = Math.abs(p[1] - 1.12 - (0.15 - p[0]) * 1.3); return d1 < 0.016 || d2 < 0.016 ? sh('#6a4a26', 1) : sh(c, 1); },
    plates: (c) => (p) => sh(c, ((p[1] * 22) % 1) < 0.12 ? 0.5 : 1),
    medal: (c) => (p) => { for (const sx of [1, -1]) if (Math.hypot(p[0] - sx * 0.07, p[1] - 1.3) < 0.03) return Math.hypot(p[0] - sx * 0.07, p[1] - 1.3) < 0.02 ? lin('#3b5fa8') : lin('#f0e2b0'); return sh(c, 1); },
    engr: (c, a, b) => (p) => sh(c, (Math.sin(p[1] * 300) * Math.sin(p[0] * 260 + p[2] * 200)) > 0.55 ? 0.6 : 1),
  };
  const flares = { L: 0, R: 0 };
  const flare = (sd, col, n) => { const S0 = P('s' + sd), sx = sd === 'L' ? 1 : -1;
    for (let i = 0; i < n; i++) { const k = 1 + 0.12 * flares[sd]++; const g = new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.42); g.scale(0.082 * k, 0.066 * k, 0.076 * k);
      const m = rig_(g, toon(col, { side: THREE.DoubleSide }), 's' + sd, [S0[0] + sx * (0.03 - i * 0.012), S0[1] + 0.014 - i * 0.03, S0[2]]); m.rotation.z = sx * (0.62 + i * 0.18); } };
  for (const it of list) {
    const k = it.k, D = PIECES[k], sd = it.sd || 'L'; if (!D) continue; const off = LAYER[D.layer] || 0;
    if (D.seg === 'head') {
      if (D.helm === 'murm') { out.push(...murmKit(B, { manica: false, greave: false, belt: false, wraps: false, sword: false, shield: false })); continue; }
      const geo = helmetGeo(D.helm, D.col, K.hs * 1.06); const m = rig_(geo, toon('#ffffff', { vertexColors: true, side: THREE.DoubleSide }), 'he', K.HO, null); continue;
    }
    if (D.seg === 'torso') {
      const top = D.shape === 'high' ? 1.49 : 1.46, bot = D.layer === 'mail' ? 1.07 : 1.105;
      const mask = D.shape === 'pect' ? (p, g) => g === GI.T && p[2] > 0 ? Math.min(0.105 - Math.hypot(p[0], (p[1] - 1.35) * 1.15), p[2]) : -1
        : (p, g) => g === GI.T || (D.shape === 'high' && (g === GI.AL || g === GI.AR) && p[1] > 1.37 && Math.abs(p[0]) < 0.24) ? Math.min(p[1] - bot, top - p[1] + (Math.abs(p[0]) < 0.06 ? -0.035 : 0), 0.03) : -1;
      shell('o_' + k, mask, (PAT[D.pat] || PAT.plate)(D.col), off, [90, 64, 30]);
      if (D.pauldron) for (const s2 of ['L', 'R']) flare(s2, D.col, 1);
      continue;
    }
    if (D.seg === 'belt') {
      if (D.style === 'ornate') { out.push(...murmKit(B, { helm: false, manica: false, greave: false, wraps: false, sword: false, shield: false })); continue; }
      const by = (p) => 1.082 - 0.011 * Math.max(0, Math.min(1, p[2] / 0.09));
      shell('o_' + k, (p, g) => g === GI.T ? 0.03 - Math.abs(p[1] - by(p)) : -1, (p) => sh(D.col, 0.9 + 0.1 * Math.sin(p[0] * 120)), off, [60, 36, 18]);
      continue;
    }
    if (D.seg === 'armU') { const S0 = P('s' + sd), E0 = P('e' + sd), gi = GI['A' + sd];
      shell('o_' + k + sd, (p, g) => g === gi ? band(tAl(p, S0, E0), -0.22, 0.86) : -1, PAT[D.pat](D.col, S0, E0), off, [201, 154, 62]); if (D.flare) flare(sd, D.col, D.flare); continue; }
    if (D.seg === 'armL') { const E0 = P('e' + sd), W0 = P('w' + sd), gi = GI['A' + sd];
      shell('o_' + k + sd, (p, g) => g === gi ? band(tAl(p, E0, W0), D.layer === 'pad' ? 0.18 : 0.26, D.layer === 'pad' ? 0.99 : 0.93) : -1, PAT[D.pat](D.col, E0, W0), off, D.layer === 'pad' ? null : [120, 84, 30]); continue; }
    if (D.seg === 'hand') { const W0 = P('w' + sd), gi = GI['A' + sd], tip = [W0[0] * 1.16, W0[1] - 0.17, W0[2] + 0.02];
      shell('o_' + k + sd, (p, g) => g === gi ? band(tAl(p, W0, tip), -0.15, 0.85) : -1, (p) => sh(D.col, Math.sin(p[1] * 180) > 0 ? 1 : 0.75), 0.006); continue; }
    if (D.seg === 'legU') { const H0 = P('h' + sd), K0 = P('k' + sd), gi = GI['L' + sd];
      shell('o_' + k + sd, (p, g, n) => g === gi ? Math.min(band(tAl(p, H0, K0), 0.34, 0.92), n[2] + 0.45) : -1, PAT[D.pat](D.col, H0, K0), off, [80, 56, 30]); continue; }
    if (D.seg === 'legL') { const K0 = P('k' + sd), A0 = P('a' + sd), gi = GI['L' + sd];
      const f = (PAT[D.pat] || PAT.plate)(D.col, K0, A0);
      shell('o_' + k + sd, (p, g, n) => g === gi ? Math.min(band(tAl(p, K0, A0), D.layer === 'pad' ? 0.06 : D.knee ? -0.1 : 0.06, D.layer === 'pad' ? 0.9 : 0.86), D.front ? n[2] + 0.3 : 1) : -1, f, off, D.layer === 'pad' ? null : [90, 64, 30]);
      if (D.knee) { const cap = new THREE.SphereGeometry(1, 16, 10, -1.2, 2.4, 0.3, 1.7); cap.scale(0.05, 0.06, 0.042); rig_(cap, toon(D.col, { side: THREE.DoubleSide }), 'k' + sd, [K0[0], K0[1] + 0.02, K0[2] + 0.03]); }
      continue; }
  }
  return out;
}
/* every weapon in W → what the hand holds (weaponKit kinds + a few made here) */
export const WEAPONS = { gladius: 'gladius', mace: 'mace', sica: 'sica', hasta: 'hasta', stones: 'stones', thracian: 'thracian', knives: 'pugio', trident: 'trident', rudis: 'rudis',
  severedArm: 'severedArm', severedLeg: 'severedLeg', axe: 'axe', falcata: 'falcata', bow: 'bow', pugio: 'pugio', scissor: 'scissor', scutum: 'scutum', sling: 'sling', arcu: 'crossbow',
  charun: 'hammer', flavgl: 'flavgl', jade: 'jade', flail: 'flail', pilum: 'pilum', labrys: 'labrys', psykhe: 'psykhe', achilles: 'achilles', lyre: 'lyre' };
