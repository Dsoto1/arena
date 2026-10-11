/* =====================================================================
   rig92/gear.js — armor + weapons on the posable token (v0.93)
   =====================================================================
   Armor that hugs the body (cuirass, belt, manica, bracers, greaves, thigh plates, padded wraps, cestus) is a SHELL: body triangles
   lifted off the skin with the same skin weights (body.js shellFrom), cut by a mask per equip point, so it follows any pose.
   Helmets, crests, shields and weapons are RIGID bits riding one bone (helmet → head, shield → forearm, weapon → wrist).
   A spec (the game builds it from the character, see src/222-v93token.js tok93Gear):
     { head:{t,c,x}, chest:{t,c,x}, belt:{c,x}, helm:'laurel'|…   (cosmetic headgear when no helmet)
       arm:{L|R:{upper:{t,c,x}, lower:{t,c,x}, wraps:1, cestus:1}}, leg:{L|R:{upper:{t,c,x}, lower:{t,c,x}}},
       wR:{t,c}, wL:{t,c} }
   t = the printed key (galea, murmillo, lorica, manica, ocrea …) or a family word; c = '#rrggbb' (optional); x = the custom
   piece's cosmetic EXTRAS from 207-v92extras ({k,c} — studs, spikes, fur, galerus, trim, paint are shown in 3D).
   makeGear(B) → { set(spec), clear() } — parts are cached by their spec, so changing one piece rebuilds only that piece. */
/* look100 (v1.0 LOOK TEST, not game code): a copy of tools/art/rig92/gear.js + murmKit() at the end — the Murmillo-like Soldier's
   printed pieces modelled after his art (Murmillo Helm cell 3, Manica, Greaves/ocrea cell 23, Balteus II cell 28, Gladius + Scutum cards)
   with the weapons held in a gripping fist (body100.js opt.grip). */
import * as THREE from 'three';
import { gripBar } from './body100.js';
import { JK, ENDS } from './rig100.js';

const METAL = '#a7adb3', BRONZE = '#b0813a', GOLD = '#d6ab4c', LEATHER = '#7a4a2a', CLOTH = '#d9cfb6', WOOD = '#7a5a36', RED = '#a3281f';
/* the colour a printed piece is made of */
const ARM_COL = {
  galea: METAL, cassis: BRONZE, crista: METAL, murmillo: METAL, helm5: METAL, flavhelm: GOLD, centurion: METAL, steelhelm: '#8d949b', thrachelm: BRONZE,
  balteus: BRONZE, balteus1: LEATHER, pectorale: BRONZE, lorica: METAL, musculata: BRONZE, amazon: BRONZE, flavchest: GOLD, thorax: METAL, ornate: GOLD, chestarm81: METAL,
  wraps: CLOTH, manica: METAL, provmanica: METAL, spaulder: METAL, cestus: LEATHER, galerus: BRONZE, bracers: GOLD, rarmarm81: METAL,
  legwrapsU: CLOTH, legwraps: CLOTH, femoralia: LEATHER, ocrea: METAL, greaves: GOLD, thighplate: METAL, cnemis: BRONZE, lgreaves: LEATHER,
};
const HELM_KIND = { galea: 'galea', steelhelm: 'galea', cassis: 'cassis', crista: 'crested', crested: 'crested', murmillo: 'murmillo', helm5: 'secutor', secutor: 'secutor',
  flavhelm: 'crested', centurion: 'centurion', thrachelm: 'thraex', thraex: 'thraex', provocator: 'secutor', horned: 'horned' };

/* ---------- small geometry helpers ---------- */
function colorize(geo, hex) {
  geo = geo.index ? geo.toNonIndexed() : geo; const n = geo.attributes.position.count; const c = new THREE.Color(hex).convertSRGBToLinear();
  const a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(a, 3)); if (geo.attributes.uv) geo.deleteAttribute('uv'); return geo;
}
/* merge [[geometry, colour], …] into one vertex-coloured geometry (one mesh + one outline per weapon) */
function merge(parts) {
  const gs = parts.map(([g, c]) => colorize(g, c)); let n = 0; for (const g of gs) n += g.attributes.position.count;
  const P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = new Float32Array(n * 3); let o = 0;
  for (const g of gs) { if (!g.attributes.normal) g.computeVertexNormals(); P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); C.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; g.dispose(); }
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.BufferAttribute(P, 3)); out.setAttribute('normal', new THREE.BufferAttribute(N, 3)); out.setAttribute('color', new THREE.BufferAttribute(C, 3));
  return out;
}
const at = (g, x, y, z) => { g.translate(x, y, z); return g; };
const box = (w, h, d, x = 0, y = 0, z = 0) => at(new THREE.BoxGeometry(w, h, d), x, y, z);
const cyl = (r1, r2, h, y = 0, seg = 10) => at(new THREE.CylinderGeometry(r1, r2, h, seg), 0, y, 0);
const ball = (r, x = 0, y = 0, z = 0) => at(new THREE.SphereGeometry(r, 10, 8), x, y, z);
/* a flat outline (array of [x,y]) extruded `d` thick, centred on z */
function plate(pts, d) { const s = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))); const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 6 }); g.translate(0, 0, -d / 2); return g; }
const arcPts = (rx, ry, a0, a1, n, cx = 0, cy = 0) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };

/* ---------- weapons: built along +Y with the grip at the origin ---------- */
function weaponGeo(t, c) {
  const steel = c || '#c9ced3';
  switch (t) {
    case 'dagger': return merge([[cyl(0.014, 0.014, 0.08), LEATHER], [box(0.07, 0.016, 0.03, 0, 0.048), BRONZE], [box(0.036, 0.20, 0.007, 0, 0.155), steel], [at(new THREE.ConeGeometry(0.026, 0.06, 4), 0, 0.285, 0).scale(1, 1, 0.3), steel]]);
    case 'sica': { const b = plate([[-0.02, 0.05], [0.022, 0.05], [0.03, 0.25], [0.0, 0.42], [-0.06, 0.5], [-0.02, 0.36], [-0.008, 0.22]], 0.008);
      return merge([[cyl(0.015, 0.015, 0.1), LEATHER], [ball(0.022, 0, -0.06), BRONZE], [box(0.075, 0.018, 0.03, 0, 0.055), BRONZE], [b, steel]]); }
    case 'flavgl': return merge([[cyl(0.016, 0.016, 0.11), '#5a2a1a'], [ball(0.03, 0, -0.07), GOLD], [box(0.13, 0.026, 0.045, 0, 0.065), GOLD], [box(0.056, 0.55, 0.009, 0, 0.35), '#dfe3e6'], [at(new THREE.ConeGeometry(0.04, 0.1, 4), 0, 0.67, 0).scale(1, 1, 0.25), '#dfe3e6']]);
    case 'club': return merge([[cyl(0.017, 0.017, 0.1), LEATHER], [box(0.09, 0.02, 0.035, 0, 0.06), WOOD], [box(0.05, 0.5, 0.02, 0, 0.32), '#9a7448']]);
    case 'mace': return merge([[cyl(0.016, 0.02, 0.55, 0.2), WOOD], [ball(0.06, 0, 0.5), steel], ...[0, 1, 2, 3, 4, 5].map(i => [at(new THREE.ConeGeometry(0.014, 0.04, 5), Math.cos(i) * 0.06, 0.5 + Math.sin(i * 2) * 0.03, Math.sin(i) * 0.06), steel])]);
    case 'hammer': return merge([[cyl(0.016, 0.02, 0.6, 0.22), WOOD], [box(0.2, 0.08, 0.08, 0, 0.5), '#5a5048']]);
    case 'flail': return merge([[cyl(0.016, 0.018, 0.4, 0.13), WOOD], [ball(0.035, 0.04, 0.42), steel], [ball(0.035, -0.04, 0.38), steel], [ball(0.035, 0.0, 0.31), steel]]);
    case 'axe': return merge([[cyl(0.016, 0.018, 0.7, 0.22), WOOD], [plate([[0, 0.44], [0.13, 0.4], [0.17, 0.5], [0.13, 0.6], [0, 0.56]], 0.012), steel]]);
    case 'labrys': return merge([[cyl(0.016, 0.018, 0.75, 0.24), WOOD], [plate([[0, 0.45], [0.15, 0.38], [0.19, 0.5], [0.15, 0.64], [0, 0.57]], 0.012), steel], [plate([[0, 0.45], [-0.15, 0.38], [-0.19, 0.5], [-0.15, 0.64], [0, 0.57]], 0.012), steel]]);
    case 'spear': case 'jade': return merge([[cyl(0.013, 0.013, 1.9, 0.2, 8), WOOD], [at(new THREE.ConeGeometry(0.035, 0.18, 6), 0, 1.24, 0).scale(1, 1, 0.45), t === 'jade' ? '#4f9a77' : steel]]);
    case 'trident': return merge([[cyl(0.013, 0.013, 1.8, 0.15, 8), WOOD], [box(0.2, 0.02, 0.02, 0, 1.06), steel], ...[-0.09, 0, 0.09].map(x => [at(new THREE.ConeGeometry(0.014, 0.2, 5), x, 1.17, 0), steel])]);
    case 'bow': { const R = 0.55, arc = new THREE.TorusGeometry(R, 0.013, 6, 28, 1.7); arc.rotateZ(Math.PI - 0.85); arc.translate(R, 0, 0);   /* grip at the origin, limbs along ±Y */
      return merge([[arc, '#6a4428'], [box(0.004, 2 * R * Math.sin(0.85), 0.004, R * (1 - Math.cos(0.85))), '#e8dcc0']]); }
    case 'crossbow': return merge([[box(0.045, 0.55, 0.04, 0, 0.18), WOOD], [box(0.5, 0.03, 0.025, 0, 0.36), '#5a5048'], [box(0.004, 0.004, 0.004, 0, 0.36), '#e8dcc0']]);
    case 'sling': return merge([[ball(0.03, 0, -0.08), LEATHER], [box(0.008, 0.14, 0.008, 0, -0.01), '#c9b8a0']]);
    case 'lyre': { const fr = new THREE.TorusGeometry(0.1, 0.012, 6, 20, Math.PI); fr.rotateZ(Math.PI); fr.translate(0, 0.1, 0);   /* the bowl, held at its foot */
      return merge([[fr, GOLD], ...[-0.1, 0.1].map(x => [box(0.022, 0.2, 0.022, x * 1.05, 0.2), GOLD]), [box(0.26, 0.022, 0.022, 0, 0.3), GOLD], ...[-0.05, 0, 0.05].map(x => [box(0.003, 0.2, 0.003, x, 0.2), '#e8dcc0'])]); }
    case 'scutum': { const g = new THREE.CylinderGeometry(0.62, 0.62, 0.82, 18, 1, true, -0.43, 0.86); g.translate(0, 0, -0.6);
      const rib = new THREE.CylinderGeometry(0.635, 0.635, 0.8, 4, 1, true, -0.03, 0.06); rib.translate(0, 0, -0.6);
      return merge([[g, c || '#b3362c'], [rib, GOLD], [ball(0.055, 0, 0, 0.035), GOLD]]); }
    case 'parma': { const g = new THREE.CylinderGeometry(0.9, 0.9, 0.44, 12, 1, true, -0.22, 0.44); g.translate(0, 0, -0.9); return merge([[g, c || BRONZE], [ball(0.04, 0, 0, 0.02), METAL]]); }
    case 'round': { const g = new THREE.CylinderGeometry(0.3, 0.3, 0.03, 28); g.rotateX(Math.PI / 2); return merge([[g, c || GOLD], [ball(0.06, 0, 0, 0.02), '#e8c96a']]); }
    case 'sword': default: return merge([[cyl(0.015, 0.015, 0.1), LEATHER], [ball(0.024, 0, -0.065), BRONZE], [box(0.10, 0.022, 0.04, 0, 0.06), BRONZE], [box(0.05, 0.46, 0.008, 0, 0.3), steel], [at(new THREE.ConeGeometry(0.035, 0.09, 4), 0, 0.575, 0).scale(1, 1, 0.25), steel]]);
  }
}
const SHIELDS = new Set(['scutum', 'parma', 'round']);
const UPRIGHT = new Set(['bow', 'lyre']);   /* held upright (along the forearm) instead of pointing forward */

/* ---------- helmets: rigid on the head ---------- */
function helmetGeo(kind, c, hs) {
  const parts = [];
  const dome = (rx, ry, rz, cy, cz, th, col) => { const g = new THREE.SphereGeometry(1, 26, 16, 0, Math.PI * 2, 0, th); g.scale(rx * hs, ry * hs, rz * hs); g.translate(0, cy * hs, cz * hs); parts.push([g, col]); };
  const crest = (len, h, col, trans) => { const g = plate(arcPts(len, h, 0, Math.PI, 14), 0.016 * hs); g.scale(hs, hs, 1); if (!trans) g.rotateY(Math.PI / 2); g.translate(0, 0.238 * hs, -0.012 * hs); parts.push([g, col]); };
  const brim = (r0, r1, cy, col) => { const g = new THREE.RingGeometry(r0 * hs, r1 * hs, 30); g.rotateX(-Math.PI / 2); g.translate(0, cy * hs, -0.01 * hs); parts.push([g, col]); };
  switch (kind) {
    case 'secutor': dome(0.104, 0.14, 0.125, 0.115, 0.012, Math.PI * 0.86, c); for (const sx of [1, -1]) parts.push([ball(0.012 * hs, sx * 0.03 * hs, 0.1 * hs, 0.135 * hs), '#14100c']); break;
    case 'murmillo': dome(0.1, 0.13, 0.122, 0.12, 0.01, Math.PI * 0.8, c); brim(0.09, 0.15, 0.115, c);
      parts.push([box(0.09 * hs, 0.08 * hs, 0.012 * hs, 0, 0.075 * hs, 0.128 * hs), '#2a2622']); crest(0.1, 0.07, c); break;
    case 'thraex': dome(0.1, 0.13, 0.122, 0.12, 0.01, Math.PI * 0.8, c); brim(0.09, 0.13, 0.11, c);
      { const g = plate([[0, 0], [0.03, 0.06], [0.0, 0.12], [-0.07, 0.15], [-0.11, 0.1], [-0.05, 0.08], [-0.03, 0.02]], 0.016 * hs); g.scale(hs, hs, 1); g.rotateY(-Math.PI / 2); g.translate(0, 0.235 * hs, 0); parts.push([g, c]); } break;
    case 'centurion': dome(0.089, 0.107, 0.11, 0.15, -0.012, Math.PI * 0.6, c); crest(0.11, 0.07, RED, true); break;
    case 'cassis': dome(0.089, 0.107, 0.11, 0.15, -0.012, Math.PI * 0.6, c); { const g = new THREE.CylinderGeometry(0.1 * hs, 0.125 * hs, 0.05 * hs, 20, 1, true, Math.PI * 0.6, Math.PI * 0.8); g.translate(0, 0.085 * hs, -0.02 * hs); parts.push([g, c]); } break;
    case 'crested': dome(0.089, 0.107, 0.11, 0.15, -0.012, Math.PI * 0.6, c); crest(0.1, 0.075, RED); break;
    case 'horned': dome(0.089, 0.107, 0.11, 0.15, -0.012, Math.PI * 0.6, c); for (const sx of [1, -1]) { const g = new THREE.ConeGeometry(0.018 * hs, 0.12 * hs, 8); g.rotateZ(-sx * 0.9); g.translate(sx * 0.11 * hs, 0.22 * hs, 0); parts.push([g, '#e8dcc0']); } break;
    case 'galea': default: dome(0.089, 0.107, 0.11, 0.15, -0.012, Math.PI * 0.6, c);
      for (const sx of [1, -1]) parts.push([box(0.012 * hs, 0.06 * hs, 0.05 * hs, sx * 0.085 * hs, 0.085 * hs, 0.03 * hs), c]); break;
  }
  return merge(parts);
}
/* cosmetic headgear from the portrait (when no helmet is worn) */
function headCosGeo(kind, hs) {
  const ring = (r, tube, col, y = 0.148, z = -0.01) => { const g = new THREE.TorusGeometry(r * hs, tube * hs, 6, 30); g.rotateX(Math.PI / 2); g.translate(0, y * hs, z * hs); return [g, col]; };
  switch (kind) {
    case 'laurel': return merge([ring(0.088, 0.008, '#5f8a3a'), ...Array.from({ length: 14 }, (_, i) => { const a = i / 14 * Math.PI * 2; return [ball(0.012 * hs, Math.sin(a) * 0.09 * hs, 0.152 * hs, (Math.cos(a) * 0.1 - 0.01) * hs), i % 2 ? '#6f9a4a' : '#4f7a2a']; })]);
    case 'circlet': return merge([ring(0.088, 0.005, GOLD)]);
    case 'diadem': return merge([ring(0.088, 0.006, GOLD), [at(new THREE.ConeGeometry(0.018 * hs, 0.04 * hs, 4), 0, 0.172 * hs, 0.09 * hs), GOLD]]);
    case 'band': return merge([ring(0.087, 0.007, LEATHER, 0.14)]);
    case 'pileus': { const g = new THREE.ConeGeometry(0.095 * hs, 0.13 * hs, 20); g.translate(0, 0.25 * hs, -0.015 * hs); return merge([[g, '#a86a2a']]); }
    case 'knot': return merge([ball(0.03 * hs, 0.05 * hs, 0.2 * hs, -0.06 * hs)]);
    default: return null;
  }
}

/* ---------- body shells per equip point ---------- */
export function makeGear(B) {
  const K = B.kit, P = K.P, GI = K.GI, HO = K.HO, hs = K.hs;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const tAlong = (p, a, b) => { const ab = sub(b, a); return dot(sub(p, a), ab) / dot(ab, ab); };
  const BI = Object.entries(K.rig.index).reduce((o, [k, i]) => (o[i] = k, o), {});
  const lin = (hex) => { const c = new THREE.Color(hex).convertSRGBToLinear(); return [c.r, c.g, c.b]; };
  /* a coloured masked material for one piece (trim = a hem band in another colour) */
  const pieceMat = (col, x) => {
    const trim = (x || []).find(e => e.k === 'trim'), paint = (x || []).find(e => e.k === 'paint');
    const m = K.maskedMat(); if (trim) m.userData.hem = { w: 0.006, col: hexArr(trim.c || GOLD), bw: 0, bcol: [0, 0, 0] };
    const c = new THREE.Color(col); if (paint) c.lerp(new THREE.Color(paint.c || RED), 0.5); m.color.copy(c); return m;
  };
  const hexArr = (h) => { const c = new THREE.Color(h); return [Math.round(c.r * 255), Math.round(c.g * 255), Math.round(c.b * 255)]; };
  const pattern = {
    plate: (p) => [1, 1, 1].map(v => v * (0.9 + 0.1 * Math.sin(p[1] * 60))),
    scale: (p) => { const r = p[1] * 110, row = Math.floor(r), f = r - row, u = (Math.atan2(p[0], p[2]) * 9 + (row % 2) * 0.5) % 1; const d = Math.hypot((u < 0 ? u + 1 : u) - 0.5, f - 0.15); const v = d < 0.48 ? 1 - d * 0.5 : 0.62; return [v, v, v]; },
    pad: (p, t) => { const v = 0.82 + 0.18 * (Math.sin(t * 46) > 0 ? 1 : 0); return [v, v, v]; },
    lames: (p, t) => { const v = 0.8 + 0.2 * ((t * 7) % 1); return [v, v, v]; },
  };
  /* extras on a built piece: studs, spikes, fur, a galerus neck guard */
  function extras(name, mesh, x, maskFn, off, sideKey) {
    const bits = []; if (!x || !x.length) return bits;
    const g = mesh.geometry, pos = g.attributes.position, msk = g.attributes.mask, sI = g.attributes.skinIndex, sW = g.attributes.skinWeight, nor = g.attributes.normal;
    const cand = []; for (let i = 0; i < pos.count; i += 7) if (msk.getX(i) > 0.012) cand.push(i);
    const pick = (n) => { const o = []; if (!cand.length) return o; for (let k = 0; k < n; k++) o.push(cand[Math.floor((k + 0.5) / n * cand.length * 0.9973) % cand.length]); return o; };
    const boneOf = (i) => { let b = 0, w = -1; for (let q = 0; q < 4; q++) if (sW.getComponent(i, q) > w) { w = sW.getComponent(i, q); b = sI.getComponent(i, q); } return BI[b] || 'pe'; };
    for (const e of x) {
      if (e.k === 'studs' || e.k === 'spikes') {
        const mat = K.makeToon(e.c || (e.k === 'studs' ? '#d8c27a' : '#c9d0d6'));
        for (const i of pick(e.k === 'studs' ? 10 : 6)) {
          const p = [pos.getX(i), pos.getY(i), pos.getZ(i)], n = [nor.getX(i), nor.getY(i), nor.getZ(i)];
          let geo; if (e.k === 'studs') geo = new THREE.SphereGeometry(0.008, 8, 6); else { geo = new THREE.ConeGeometry(0.01, 0.04, 6); geo.translate(0, 0.02, 0); geo.rotateX(Math.PI / 2); }
          const m = K.rigid(geo, mat, boneOf(i), [p[0] + n[0] * 0.004, p[1] + n[1] * 0.004, p[2] + n[2] * 0.004], n); bits.push(m);
        }
        bits.ownMat = (bits.ownMat || []).concat(mat);
      } else if (e.k === 'fur') {
        const mat = K.maskedMat(); mat.color.set(e.c || '#8a6a44'); mat.userData.ownMat = 1;
        const fur = K.shellFrom(name + '_fur', (p, gg, nn) => { const m = maskFn(p, gg, nn); return m > 0 && m < 0.016 ? Math.min(m, 0.016 - m) : -1; },
          (p) => { const v = 0.7 + 0.3 * (Math.sin(p[0] * 900) * Math.sin(p[1] * 1100) * 0.5 + 0.5); return [v, v, v]; }, (p) => off + 0.006 + 0.004 * (Math.sin(p[0] * 700 + p[2] * 800) * 0.5 + 0.5), { mat });
        fur.userData.ownMat = 1; bits.push(fur);
      } else if (e.k === 'galerus' && sideKey) {
        const s = P('s' + sideKey), sx = sideKey === 'L' ? 1 : -1; const geo = plate([[-0.07, 0], [0.07, 0], [0.05, 0.13], [-0.05, 0.13]], 0.01);
        const m = K.rigid(colorize(geo, e.c || '#b8925a'), K.makeToon('#ffffff', { vertexColors: true }), 's' + sideKey, [s[0] + sx * 0.035, s[1] + 0.05, s[2]], [sx * 0.95, 0.15, 0]);
        m.rotateZ(sx * 0.35); bits.push(m);
      }
    }
    return bits;
  }
  /* one shell piece: mask(p, group, normal) > 0 inside */
  function shell(name, col, x, maskFn, colFn, off, sideKey) {
    const mat = pieceMat(col, x); const m = K.shellFrom(name, maskFn, colFn, off, { mat }); m.userData.ownMat = 1;
    return [m].concat(extras(name, m, x, maskFn, off, sideKey));
  }
  const limb = (sd, kind) => {   /* the rest-pose segment of an arm / leg part */
    if (kind === 'upper') return [P('s' + sd), P('e' + sd), GI['A' + sd]];
    if (kind === 'lower') return [P('e' + sd), P('w' + sd), GI['A' + sd]];
    if (kind === 'thigh') return [P('h' + sd), P('k' + sd), GI['L' + sd]];
    return [P('k' + sd), P('a' + sd), GI['L' + sd]];
  };
  const band = (t, t0, t1) => Math.min(t - t0, t1 - t) * 0.25;
  const BUILD = {
    head: (s) => { const kind = HELM_KIND[s.t] || 'galea'; const geo = helmetGeo(kind, s.c || ARM_COL[s.t] || METAL, hs); const mat = K.makeToon('#ffffff', { vertexColors: true, side: THREE.DoubleSide });
      const m = K.rigid(geo, mat, 'he', HO, null); m.userData.ownMat = 1; m.position.set(HO[0] - P('he')[0], HO[1] - P('he')[1], HO[2] - P('he')[2]);
      const bits = [m]; for (const e of s.x || []) if (e.k === 'studs' || e.k === 'spikes') for (let i = 0; i < (e.k === 'studs' ? 8 : 5); i++) { const a = -0.9 + i * 0.45; const p = [Math.sin(a) * 0.1 * hs + HO[0], (0.2 - Math.abs(a) * 0.02) * hs + HO[1], Math.cos(a) * 0.1 * hs + HO[2] - 0.012];
        const geo2 = e.k === 'studs' ? new THREE.SphereGeometry(0.008, 8, 6) : (() => { const g = new THREE.ConeGeometry(0.01, 0.04, 6); g.translate(0, 0.02, 0); g.rotateX(Math.PI / 2); return g; })();
        bits.push(K.rigid(geo2, K.makeToon(e.c || '#d8c27a'), 'he', p, [Math.sin(a), 0.5, Math.cos(a)])); }
      return bits; },
    helm: (s) => { const geo = headCosGeo(s.t, hs); if (!geo) return [];
      const m = K.rigid(geo, K.makeToon('#ffffff', { vertexColors: true }), 'he', HO, null); m.userData.ownMat = 1; m.position.set(HO[0] - P('he')[0], HO[1] - P('he')[1], HO[2] - P('he')[2]); return [m]; },
    chest: (s) => { const t = s.t || 'pectorale', col = s.c || ARM_COL[t] || METAL;
      if (t === 'pectorale') return shell('g_chest', col, s.x, (p, g, n) => g === GI.T && p[2] > 0.0 ? Math.min(0.105 - Math.hypot(p[0], (p[1] - 1.35) * 1.15), p[2] - 0.0) : -1, pattern.plate, 0.009);
      const top = t === 'thorax' || t === 'ornate' ? 1.49 : 1.46, bot = t === 'lorica' ? 1.07 : 1.115;
      const m = (p, g) => g === GI.T || (t === 'thorax' && (g === GI.AL || g === GI.AR) && p[1] > 1.36 && Math.abs(p[0]) < 0.25) ? Math.min(p[1] - bot, top - p[1] + (Math.abs(p[0]) < 0.06 ? -0.03 : 0), 0.03) : -1;
      return shell('g_chest', col, s.x, m, t === 'lorica' ? pattern.scale : pattern.plate, 0.0095); },
    belt: (s) => shell('g_belt', s.c || BRONZE, s.x, (p, g) => g === GI.T ? 0.033 - Math.abs(p[1] - (1.08 - 0.01 * Math.max(0, Math.min(1, p[2] / 0.09)))) : -1, pattern.plate, 0.016),
    upper: (s, sd) => { const [a, b, gi] = limb(sd, 'upper'); return shell('g_up' + sd, s.c || ARM_COL[s.t] || METAL, s.x, (p, g) => g === gi ? band(tAlong(p, a, b), -0.22, 0.82) : -1, pattern.lames, 0.008, sd); },
    lower: (s, sd) => { const [a, b, gi] = limb(sd, 'lower'); const pad = s.t === 'wraps'; return shell('g_lo' + sd, s.c || ARM_COL[s.t] || METAL, s.x, (p, g) => g === gi ? band(tAlong(p, a, b), 0.12, 0.95) : -1, pad ? (p) => pattern.pad(p, tAlong(p, a, b)) : pattern.plate, pad ? 0.005 : 0.0075); },
    wraps: (s, sd) => { const [a, b, gi] = limb(sd, 'lower'); return shell('g_wr' + sd, CLOTH, null, (p, g) => g === gi ? band(tAlong(p, a, b), 0.3, 0.98) : -1, (p) => pattern.pad(p, tAlong(p, a, b)), 0.0045); },
    cestus: (s, sd) => { const a = P('w' + sd), gi = GI['A' + sd]; return shell('g_ce' + sd, LEATHER, null, (p, g) => g === gi ? band(tAlong(p, a, [a[0] * 1.16, a[1] - 0.17, a[2] + 0.02]), -0.1, 0.85) : -1, pattern.plate, 0.005); },
    thigh: (s, sd) => { const [a, b, gi] = limb(sd, 'thigh'); const pad = /wraps/.test(s.t || ''); return shell('g_th' + sd, s.c || ARM_COL[s.t] || LEATHER, s.x, (p, g) => g === gi ? band(tAlong(p, a, b), 0.36, 0.93) : -1, pad ? (p) => pattern.pad(p, tAlong(p, a, b)) : pattern.plate, pad ? 0.005 : 0.0085); },
    shin: (s, sd) => { const [a, b, gi] = limb(sd, 'shin'); const pad = /wraps/.test(s.t || ''), frontOnly = /ocrea|greaves/.test(s.t || '');
      return shell('g_sh' + sd, s.c || ARM_COL[s.t] || METAL, s.x, (p, g, n) => g === gi ? Math.min(band(tAlong(p, a, b), 0.04, 0.86), frontOnly ? n[2] + 0.25 : 1) : -1, pad ? (p) => pattern.pad(p, tAlong(p, a, b)) : pattern.plate, pad ? 0.005 : 0.0085); },
    weapon: (s, sd) => {
      const t = s.t || 'sword', W0 = P('w' + sd), sx = sd === 'L' ? 1 : -1;
      const tip = sd === 'L' ? [0.474, 0.770, 0.012] : [-0.474, 0.770, 0.012];
      const u = norm(sub(tip, W0)); let f = sub([0, 0, 1], u.map(v => v * dot([0, 0, 1], u))); f = norm(f); const o = norm(cross(u, f)).map(v => v * Math.sign(cross(u, f)[0] * sx || 1));
      const mat = K.makeToon('#ffffff', { vertexColors: true, side: THREE.DoubleSide }); let m;
      if (SHIELDS.has(t)) {   /* on the forearm, facing out */
        const E0 = P('e' + sd); const c = [E0[0] + (W0[0] - E0[0]) * 0.55 + o[0] * 0.1, E0[1] + (W0[1] - E0[1]) * 0.55 + o[1] * 0.1, E0[2] + (W0[2] - E0[2]) * 0.55 + o[2] * 0.1];
        const geo = weaponGeo(t, s.c); geo.rotateY(sx > 0 ? Math.PI / 2 : -Math.PI / 2);   /* face out along ±x before riding the forearm */
        m = K.rigid(geo, mat, 'e' + sd, c, null);
      } else {
        const grip = [W0[0] + u[0] * 0.095 - o[0] * 0.012, W0[1] + u[1] * 0.095, W0[2] + u[2] * 0.095 + 0.004];
        const dir = UPRIGHT.has(t) ? u.map(v => -v) : norm([f[0] + o[0] * 0.22 - u[0] * 0.1, f[1] + o[1] * 0.22 - u[1] * 0.1, f[2] + o[2] * 0.22 - u[2] * 0.1]);
        const geo = weaponGeo(t, s.c); geo.rotateX(Math.PI / 2);   /* +Y → +Z, rigid() turns +Z to dir */
        m = K.rigid(geo, mat, 'w' + sd, grip, dir);
      }
      m.userData.ownMat = 1; return [m];
    },
  };
  const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

  const built = new Map();   /* key → [meshes] */
  const killAll = (L) => { for (const m of L) K.kill(m); if (L.ownMat) for (const mt of L.ownMat) mt.dispose(); };
  /* the parts a spec asks for: [key, builder, piece spec, side] */
  function partsOf(s) {
    const out = [];
    const add = (slot, sd, piece, kind) => { if (piece) out.push([slot + (sd || '') + '|' + JSON.stringify(piece), kind || slot, piece, sd]); };
    add('head', '', s.head); if (!s.head && s.helm) add('helm', '', { t: s.helm }); add('chest', '', s.chest); add('belt', '', s.belt);
    for (const sd of ['L', 'R']) {
      const A = (s.arm || {})[sd] || {}, G = (s.leg || {})[sd] || {};
      add('upper', sd, A.upper); add('lower', sd, A.lower); if (A.wraps && !A.lower) add('wraps', sd, { w: 1 }); if (A.cestus) add('cestus', sd, { c: 1 });
      add('thigh', sd, G.upper); add('shin', sd, G.lower);
      add('weapon', sd, s['w' + sd]);
    }
    return out;
  }
  return {
    set(spec) {
      const want = partsOf(spec || {}); const keys = new Set(want.map(w => w[0]));
      for (const [k, L] of built) if (!keys.has(k)) { killAll(L); built.delete(k); }
      for (const [k, kind, piece, sd] of want) if (!built.has(k)) { try { built.set(k, BUILD[kind](piece, sd)); } catch (e) { console.error('gear', kind, e); built.set(k, []); } }
      return want.length;
    },
    clear() { for (const [, L] of built) killAll(L); built.clear(); },
  };
}
export const GEAR_COLORS = ARM_COL;


/* ===================== look100: the Murmillo-like Soldier ===================== */
const STEEL = '#c3c8cc', STEEL_D = '#6d7377', BRASS = '#c99a3e', DARKBR = '#5b3d22', MAROON = '#5c171b', GOLD2 = '#e2b955';
function canvasTex(w, h, paint) { const c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
/* a basis matrix: local X → ax, Y → ay, Z → X×Y */
function basisQ(ax, ay) { const X = new THREE.Vector3(...ax).normalize(), Y = new THREE.Vector3(...ay).normalize(); const Z = new THREE.Vector3().crossVectors(X, Y).normalize(); X.crossVectors(Y, Z); return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z)); }
/* a closed, curved board (shield): rounded rect W×H, corner radius rc, bent round a vertical cylinder of radius Rc, thickness th.
   groups: 0 = the painted face (uv), 1 = back + rim */
function boardGeo(W, H, rc, Rc, th, nx = 22, ny = 32) {
  const P = [], UV = [], I0 = [], I1 = [];
  const clamp = (x, y) => { const ax = Math.abs(x), ay = Math.abs(y), cx = W / 2 - rc, cy = H / 2 - rc; if (ax > cx && ay > cy) { const dx = ax - cx, dy = ay - cy, d = Math.hypot(dx, dy); if (d > rc) { x = Math.sign(x) * (cx + dx * rc / d); y = Math.sign(y) * (cy + dy * rc / d); } } return [x, y]; };
  const bend = (x, y, z) => { const a = x / Rc; return [(Rc + z) * Math.sin(a), y, (Rc + z) * Math.cos(a) - Rc]; };
  const id = (side, i, j) => side * (nx + 1) * (ny + 1) + j * (nx + 1) + i;
  for (const [side, z] of [[0, th / 2], [1, -th / 2]]) for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
    const [x, y] = clamp(-W / 2 + W * i / nx, -H / 2 + H * j / ny); P.push(...bend(x, y, z)); UV.push(x / W + 0.5, y / H + 0.5); }
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const a = id(0, i, j), b = id(0, i + 1, j), c = id(0, i + 1, j + 1), d = id(0, i, j + 1); I0.push(a, b, c, a, c, d);
    const a1 = id(1, i, j), b1 = id(1, i + 1, j), c1 = id(1, i + 1, j + 1), d1 = id(1, i, j + 1); I1.push(a1, c1, b1, a1, d1, c1); }
  const ring = []; for (let i = 0; i < nx; i++) ring.push([i, 0]); for (let j = 0; j < ny; j++) ring.push([nx, j]); for (let i = nx; i > 0; i--) ring.push([i, ny]); for (let j = ny; j > 0; j--) ring.push([0, j]);
  for (let k = 0; k < ring.length; k++) { const [i, j] = ring[k], [i2, j2] = ring[(k + 1) % ring.length]; const a = id(0, i, j), b = id(0, i2, j2), a1 = id(1, i, j), b1 = id(1, i2, j2); I1.push(a, a1, b1, a, b1, b); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2));
  g.setIndex(I0.concat(I1)); g.addGroup(0, I0.length, 0); g.addGroup(I0.length, I1.length, 1); g.computeVertexNormals(); return g;
}
/* the scutum's face after his card: red field, gold rim, a gold spine, the square boss plate, gold wings and bolts */
const scutumTex = () => canvasTex(256, 400, (g, w, h) => {
  const gr = g.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, h * 0.62); gr.addColorStop(0, '#c53a2c'); gr.addColorStop(1, '#8e2219'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = GOLD2; g.lineWidth = 14; g.strokeRect(9, 9, w - 18, h - 18); g.strokeStyle = '#3a120c'; g.lineWidth = 3; g.strokeRect(17, 17, w - 34, h - 34);
  g.fillStyle = GOLD2; g.fillRect(w / 2 - 7, 18, 14, h - 36);
  g.fillRect(w / 2 - 44, h / 2 - 44, 88, 88); g.fillStyle = '#8a6420'; g.fillRect(w / 2 - 34, h / 2 - 34, 68, 68); g.fillStyle = GOLD2; g.beginPath(); g.arc(w / 2, h / 2, 26, 0, 7); g.fill();
  g.strokeStyle = GOLD2; g.lineCap = 'round';
  for (const sy of [1, -1]) for (const sx of [1, -1]) {   /* wings + a zig-zag bolt in each quarter */
    const cx = w / 2 + sx * 62, cy = h / 2 + sy * 105; g.lineWidth = 7; g.beginPath(); g.moveTo(w / 2 + sx * 20, h / 2 + sy * 52); g.lineTo(cx - sx * 10, cy - sy * 30); g.lineTo(cx + sx * 6, cy - sy * 10); g.lineTo(cx - sx * 4, cy + sy * 22); g.stroke();
    g.lineWidth = 5; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(w / 2 + sx * 48, h / 2 + sy * (8 + k * 9)); g.quadraticCurveTo(w / 2 + sx * (80 + k * 8), h / 2 + sy * (2 + k * 14), w / 2 + sx * (100 + k * 4), h / 2 + sy * (20 + k * 18)); g.stroke(); }
  }
  for (const [x, y] of [[w / 2 - 38, h / 2 - 38], [w / 2 + 38, h / 2 - 38], [w / 2 - 38, h / 2 + 38], [w / 2 + 38, h / 2 + 38]]) { g.fillStyle = '#f2d98a'; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }
});
/* the murmillo grille: bronze frame, rows of round holes, split down the middle */
const grilleTex = () => canvasTex(256, 160, (g, w, h) => {
  g.fillStyle = '#9a7a46'; g.fillRect(0, 0, w, h); g.fillStyle = '#17110c';
  for (let r = 0; r < 6; r++) for (let c = 0; c < 14; c++) { const x = 14 + c * 17.5 + (r % 2) * 8, y = 18 + r * 22; if (Math.abs(x - w / 2) < 8 || x > w - 10) continue; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); }
  g.fillStyle = '#b8935a'; g.fillRect(w / 2 - 4, 0, 8, h); g.fillRect(0, 0, w, 7); g.fillRect(0, h - 10, w, 10);
});

export function murmKit(B, o = {}) {
  const K = B.kit, P = K.P, GI = K.GI, HO = K.HO, hs = K.hs, out = [];
  const toon = (c, ex) => K.makeToon(c, ex);
  const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const tAl = (p, a, b) => { const ab = sub3(b, a); return dot3(sub3(p, a), ab) / dot3(ab, ab); };
  const lin3 = (hex) => { const c = new THREE.Color(hex).convertSRGBToLinear(); return [c.r, c.g, c.b]; };
  const place = (m, bone, at, q) => { const bp = P(bone); m.position.set(at[0] - bp[0], at[1] - bp[1], at[2] - bp[2]); if (q) m.quaternion.copy(q); return m; };
  const rig_ = (geo, mat, bone, at, q) => { const m = K.rigid(geo, mat, bone, at, null); place(m, bone, at, q); m.userData.ownMat = 1; const ink = m.userData.ink; if (ink) { ink.position.copy(m.position); ink.quaternion.copy(m.quaternion); } out.push(m); return m; };
  const H = (x, y, z) => [HO[0] + x * hs, HO[1] + y * hs, HO[2] + z * hs];

  /* ---- Murmillo Helm (cell 3): polished dome, the round-holed grille over the face, a flared brim at the bottom, a fish crest ---- */
  if (o.helm !== false) {
    const steel = toon(STEEL, { side: THREE.DoubleSide }), steelD = toon('#9aa0a5'), bronze = toon(BRASS), K2 = o.helmK || 1.08;
    const Hk = (x, y, z) => H(x * K2, y * K2, z * K2);
    const dome = new THREE.SphereGeometry(1, 30, 14, 0, Math.PI * 2, 0, Math.PI * 0.5); dome.scale(0.108 * hs * K2, 0.118 * hs * K2, 0.124 * hs * K2);
    rig_(dome, steel, 'he', Hk(0, 0.112, -0.004));
    const face = new THREE.CylinderGeometry(0.108 * hs * K2, 0.112 * hs * K2, 0.118 * hs * K2, 30, 3, true, -1.2, 2.4);
    rig_(face, toon('#ffffff', { map: grilleTex(), side: THREE.DoubleSide }), 'he', Hk(0, 0.053, -0.004));
    const back = new THREE.CylinderGeometry(0.108 * hs * K2, 0.116 * hs * K2, 0.118 * hs * K2, 30, 3, true, 1.2, Math.PI * 2 - 2.4); rig_(back, steel, 'he', Hk(0, 0.053, -0.004));
    const band = new THREE.TorusGeometry(0.109 * hs * K2, 0.006 * hs * K2, 6, 40); band.rotateX(Math.PI / 2); rig_(band, bronze, 'he', Hk(0, 0.112, -0.004));
    const brim = new THREE.CylinderGeometry(0.112 * hs * K2, 0.16 * hs * K2, 0.03 * hs * K2, 36, 1, true); rig_(brim, steel, 'he', Hk(0, -0.02, -0.006));
    const rim = new THREE.TorusGeometry(0.16 * hs * K2, 0.0055 * hs * K2, 6, 40); rim.rotateX(Math.PI / 2); rig_(rim, bronze, 'he', Hk(0, -0.035, -0.006));
    const crest = plate([[-0.13, 0], [-0.1, 0.035], [-0.02, 0.075], [0.06, 0.07], [0.12, 0.035], [0.135, 0.0]], 0.016); crest.scale(hs * K2, hs * K2, 1); crest.rotateY(Math.PI / 2);
    rig_(crest, steelD, 'he', Hk(0, 0.21, -0.004));
    const crestRim = plate([[-0.13, -0.004], [0.135, -0.004], [0.135, 0.01], [-0.13, 0.01]], 0.02); crestRim.scale(hs * K2, hs * K2, 1); crestRim.rotateY(Math.PI / 2); rig_(crestRim, bronze, 'he', Hk(0, 0.21, -0.004));
  }
  /* ---- Manica on the SWORD arm (right): steel lames from shoulder to wrist + a flared shoulder guard ---- */
  if (o.manica !== false) {
    const sd = o.swordSide || 'R', S0 = P('s' + sd), E0 = P('e' + sd), W0 = P('w' + sd), gi = GI['A' + sd], sx = sd === 'L' ? 1 : -1;
    const tArm = (p) => { const tu = tAl(p, S0, E0); return tu < 1 ? tu * 0.5 : 0.5 + tAl(p, E0, W0) * 0.5; };
    const mat = K.maskedMat(); mat.userData.hem = { w: 0.006, col: [201, 154, 62], bw: 0, bcol: [0, 0, 0] };
    const lame = (p) => { const t = tArm(p) * 15.5, f = t - Math.floor(t); const v = f < 0.13 ? 0.42 : 0.78 + 0.22 * f; return lin3(STEEL).map(c => c * v / Math.max(0.0001, lin3(STEEL)[0]) * lin3(STEEL)[0]); };
    const m = K.shellFrom('g_manica', (p, g) => g === gi ? Math.min(tArm(p) + 0.04, 0.95 - tArm(p)) * 0.25 : -1, lame, 0.0095, { mat }); m.userData.ownMat = 1; out.push(m);
    const sh = new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.42); sh.scale(0.085, 0.07, 0.078);
    const shm = rig_(sh, toon(STEEL, { side: THREE.DoubleSide }), 's' + sd, [S0[0] + sx * 0.03, S0[1] + 0.012, S0[2]]); shm.rotation.z = sx * 0.62;
    const rimg = new THREE.TorusGeometry(1, 0.06, 6, 28); rimg.rotateX(Math.PI / 2); rimg.scale(0.085 * Math.sin(Math.PI * 0.42), 0.07, 0.078 * Math.sin(Math.PI * 0.42));
    const rm = rig_(rimg, toon(BRASS), 's' + sd, [S0[0] + sx * 0.03, S0[1] + 0.012, S0[2]]); rm.rotation.z = sx * 0.62; rm.position.y += 0.07 * Math.cos(Math.PI * 0.42) * Math.cos(0.62); rm.position.x += -sx * 0.07 * Math.cos(Math.PI * 0.42) * Math.sin(0.62);
  }
  /* ---- the ocrea: one gold greave on the LEFT (front) leg, over the knee (cell 23) ---- */
  if (o.greave !== false) {
    const sd = o.shieldSide || 'L', K0 = P('k' + sd), A0 = P('a' + sd), gi = GI['L' + sd];
    const mat = K.maskedMat(); mat.userData.hem = { w: 0.005, col: [120, 84, 30], bw: 0, bcol: [0, 0, 0] };
    const gcol = (p, m2) => { const ax = Math.atan2(p[0] - (K0[0] + A0[0]) / 2, p[2] - (K0[2] + A0[2]) / 2 + 0.02); const v = 0.82 + 0.3 * Math.max(0, Math.cos(ax * 1.6)); return lin3(GOLD2).map(c => c * v); };
    const m = K.shellFrom('g_ocrea', (p, g, n) => g === gi ? Math.min(Math.min(tAl(p, K0, A0) + 0.16, 0.86 - tAl(p, K0, A0)) * 0.25, n[2] + 0.35) : -1, gcol, 0.011, { mat }); m.userData.ownMat = 1; out.push(m);
    const cap = new THREE.SphereGeometry(1, 16, 10, -1.2, 2.4, 0.3, 1.7); cap.scale(0.05, 0.06, 0.04);
    rig_(cap, toon(GOLD2, { side: THREE.DoubleSide }), 'k' + sd, [K0[0], K0[1] + 0.02, K0[2] + 0.028]);
  }
  /* ---- Balteus II (cell 28): a wide dark-red belt with gold scrollwork + a gold rim ---- */
  if (o.belt !== false) {
    const by = (p) => 1.085 - 0.012 * Math.max(0, Math.min(1, p[2] / 0.09));
    const mat = K.maskedMat(); mat.userData.hem = { w: 0.008, col: [215, 170, 69], bw: 0, bcol: [0, 0, 0] };
    const col = (p) => { const a = Math.atan2(p[0], p[2]), y = p[1] - by(p); const wave = Math.abs(y - 0.011 * Math.sin(a * 7)) < 0.004; const palm = Math.abs(a) < 0.28 && Math.abs(y) < 0.03 && Math.abs(a) * 0.1 < 0.03 - Math.abs(y) * 0.6;
      return wave || palm ? lin3(GOLD2) : lin3(MAROON); };
    const m = K.shellFrom('g_balteus', (p, g) => g === GI.T ? 0.042 - Math.abs(p[1] - by(p)) : -1, col, 0.019, { mat }); m.userData.ownMat = 1; out.push(m);
    /* the base belt's iron ring + studs would poke through: hide them */
    for (const c of B.rig.bones.pe.children) { const pr = c.geometry && c.geometry.parameters; if (pr && (pr.radius === 0.031 || pr.radius === 0.0052)) { c.visible = false; if (c.userData.ink) c.userData.ink.visible = false; } }
  }
  /* ---- padded wraps on the shield forearm (the Soldier's printed kit) ---- */
  if (o.wraps !== false && !o.severL) {
    const sd = o.shieldSide || 'L', E0 = P('e' + sd), W0 = P('w' + sd), gi = GI['A' + sd];
    const m = K.shellFrom('g_wraps', (p, g) => g === gi ? Math.min(tAl(p, E0, W0) - 0.25, 0.97 - tAl(p, E0, W0)) * 0.25 : -1, (p) => { const v = 0.8 + 0.2 * (Math.sin(tAl(p, E0, W0) * 46) > 0 ? 1 : 0); return lin3(CLOTH).map(c => c * v); }, 0.0045, {}); out.push(m);
  }
  /* ---- weapons + shield (round 2: one mount for every class) ---- */
  if (o.sword !== false) out.push(...weaponKit(B, { R: 'gladius' }, out));
  if (o.shield !== false && !o.severL) out.push(...weaponKit(B, { L: 'scutum', handle: o.handle }, out));
  /* ---- a severed forearm: the cut + a stump cap (flesh, bone, a dark rim) ---- */
  if (o.severL) {
    const cut = K.sever('L', 0.32); const r = cut.r + 0.008;
    const flesh = new THREE.CircleGeometry(r, 24), bone = new THREE.CircleGeometry(r * 0.32, 16), ring = new THREE.RingGeometry(r * 0.82, r * 1.02, 24);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...cut.n));
    const at2 = (k) => [cut.at[0] + cut.n[0] * k, cut.at[1] + cut.n[1] * k, cut.at[2] + cut.n[2] * k];
    rig_(flesh, toon('#9b1d18', { side: THREE.DoubleSide }), 'eL', at2(0.0), q);
    rig_(ring, toon('#5a0d0b', { side: THREE.DoubleSide }), 'eL', at2(0.001), q);
    rig_(bone, toon('#efe3c8', { side: THREE.DoubleSide }), 'eL', at2(0.0015), q);
    for (const [k, rr, dx] of [[0.014, 0.012, 0.01], [0.034, 0.009, -0.008], [0.058, 0.007, 0.004], [0.08, 0.005, -0.002]]) rig_(new THREE.SphereGeometry(rr, 8, 6).scale(1, 1.6, 1), toon('#8a1612'), 'eL', [cut.at[0] + dx, cut.at[1] - k, cut.at[2] + 0.01], null);
  }
  return out;
}

/* ===================== look100 round 2: weapons + shields in the fist, for every class ===================== */
const W_ALIAS = { gladius: 'gladius', pugio: 'dagger', sica: 'sica', trident: 'trident', rudis: 'rudis', axe: 'axe', hasta: 'spear', sling: 'sling', falcata: 'falcata', mace: 'mace' };
const thracianTex = () => canvasTex(200, 260, (g, w, h) => { g.fillStyle = '#3f7a52'; g.fillRect(0, 0, w, h); g.strokeStyle = GOLD2; g.lineWidth = 12; g.strokeRect(8, 8, w - 16, h - 16);
  g.lineWidth = 6; for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2 + Math.cos(a) * 70, h / 2 + Math.sin(a) * 95); g.stroke(); }
  g.fillStyle = GOLD2; g.beginPath(); g.arc(w / 2, h / 2, 24, 0, 7); g.fill(); });
export function weaponKit(B, spec, sink) {
  const K = B.kit, P = K.P, out = [];
  const toon = (c, ex) => K.makeToon(c, ex);
  const rig_ = (geo, mat, bone, at, q) => { const m = K.rigid(geo, mat, bone, at, null); const bp = P(bone); m.position.set(at[0] - bp[0], at[1] - bp[1], at[2] - bp[2]); if (q) m.quaternion.copy(q);
    m.userData.ownMat = 1; const ink = m.userData.ink; if (ink) { ink.position.copy(m.position); ink.quaternion.copy(m.quaternion); } out.push(m); return m; };
  const held = (sd, kind) => { const W0 = P('w' + sd), tip = ENDS['w' + sd], sx = sd === 'L' ? 1 : -1; return gripBar(W0, tip, sx, kind); };
  const vmat = () => toon('#ffffff', { vertexColors: true, side: THREE.DoubleSide });
  const geoOf = (t) => {
    if (t === 'gladius' || t === 'rudis' || t === 'falcata') {
      const wood = t === 'rudis', curve = t === 'falcata';
      const blade = curve ? plate([[-0.026, 0.06], [0.024, 0.06], [0.034, 0.25], [0.05, 0.42], [0.0, 0.58], [-0.02, 0.4], [-0.026, 0.2]], 0.008)
        : plate([[-0.027, 0.06], [0.027, 0.06], [0.03, 0.2], [0.024, 0.46], [0, 0.56], [-0.024, 0.46], [-0.03, 0.2]], 0.008);
      const fuller = plate([[-0.006, 0.08], [0.006, 0.08], [0.004, 0.44], [-0.004, 0.44]], 0.0095);
      return merge([[cyl(0.0145, 0.0145, 0.1, 0, 10), wood ? '#8a6234' : '#2a1d16'], ...[-0.03, 0, 0.03].map(y => [at(new THREE.TorusGeometry(0.0155, 0.003, 4, 12).rotateX(Math.PI / 2), 0, y, 0), wood ? '#6d4a26' : '#4a3424']),
        [at(new THREE.SphereGeometry(0.028, 14, 10).scale(1, 0.8, 1), 0, -0.066, 0), wood ? '#8a6234' : '#3a2a20'], [box(0.084, 0.024, 0.038, 0, 0.058), wood ? '#8a6234' : DARKBR], [box(0.09, 0.008, 0.042, 0, 0.069), BRASS],
        [blade, wood ? '#c79a5a' : '#d3d8dc'], ...(wood ? [] : [[fuller, '#8e979e']])]);
    }
    return weaponGeo(t);
  };
  for (const sd of ['R', 'L']) {
    const t0 = spec[sd]; if (!t0) continue;
    if (t0 === 'scutum' || t0 === 'thracian') {
      /* STRAPPED + HELD: the forearm runs along the back of the board (a strap round it), the fist holds the handle behind the boss;
         board plane = forearm × hand-forward, face = the back of the hand (the pose's grip constraint turns that forward) */
      const b = held(sd, 'bar'), big = t0 === 'scutum', W = big ? 0.66 : 0.46, Hh = big ? 1.02 : 0.62;
      const ctr = [0, 1, 2].map(i => b.c[i] - b.u[i] * (big ? 0.07 : 0.03) + b.o3[i] * 0.058);
      let q = basisQ(b.u, b.f); { const zz = new THREE.Vector3(0, 0, 1).applyQuaternion(q); if (zz.dot(new THREE.Vector3(...b.o3)) < 0) q = basisQ(b.u.map(v => -v), b.f); }
      const geo = boardGeo(W, Hh, big ? 0.07 : 0.05, big ? 0.6 : 0.5, 0.026);
      const m = rig_(geo, [toon('#ffffff', { map: big ? scutumTex() : thracianTex() }), toon('#6e4a2c')], 'w' + sd, ctr, q);
      const boss = new THREE.SphereGeometry(big ? 0.06 : 0.045, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2); boss.rotateX(Math.PI / 2);
      const bm = rig_(boss, toon(GOLD2), 'w' + sd, [0, 1, 2].map(i => b.c[i] + b.o3[i] * 0.07), q);
      /* the handle in the fist + the forearm strap (leather band round the forearm, riveted to the board) */
      rig_(colorize(cyl(0.011, 0.011, 0.16, 0, 10), '#6e4a2c'), vmat(), 'w' + sd, b.c, basisQ(b.u, b.f));
      const E0 = P('e' + sd), W0 = P('w' + sd), ax = [W0[0] - E0[0], W0[1] - E0[1], W0[2] - E0[2]], st = [E0[0] + ax[0] * 0.42, E0[1] + ax[1] * 0.42, E0[2] + ax[2] * 0.42];
      const band = new THREE.TorusGeometry(0.044, 0.009, 6, 20); const bq = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(...ax).normalize());
      rig_(band, toon('#5a3a22'), 'e' + sd, st, bq);
      const tab = box(0.03, 0.028, 0.05); rig_(colorize(tab, '#5a3a22'), vmat(), 'e' + sd, [0, 1, 2].map(i => st[i] + b.o3[i] * 0.05), basisQ(b.u, b.f));
      if (spec.handle) for (const x of [m, bm]) { x.visible = false; if (x.userData.ink) x.userData.ink.visible = false; }
    } else {
      const t = W_ALIAS[t0] || t0, b = held(sd, 'hilt');
      rig_(geoOf(t), vmat(), 'w' + sd, b.c, basisQ(b.u, b.f));
    }
  }
  return out;
}
