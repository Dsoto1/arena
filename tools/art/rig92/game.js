/* =====================================================================
   rig92/game.js — the token modeller's engine as the game uses it (v0.93)
   =====================================================================
   tools/art/rig92/mkgame.js bundles rig.js + body.js + presets.js + gear.js + this file into assets/tok93.js (a plain script:
   window.TOK93LIB = function (THREE) { … return { createToken } }), loaded on demand with assets/three93.js (three r169 as a plain
   script) — only when the Studio's token modeller opens or a character's token is (re)made. Matches never run 3D.
   createToken(opts) → Promise<api>:
     api.apply({ look, gear, pose })     look = { skin, hair, hs, bs, fem, cloth } · gear = gear.js spec · pose = pose JSON (rig.js)
     api.sheet()                          the 8 facings (MINI_YAW order) → { canvas, meta:[cellW,cellH,anchorX,anchorY], ms }
     api.facings(px)                      8 small live canvases (the modeller's strip)
     api.editor(canvas, onChange)         drag joints / turn the view on a 2D canvas (one WebGL context for everything)
     api.presets                          [[key, label, poseJSON], …]  (resolved once on this body)
     api.groups                           [[groupKey, label, [presetKey…]], …]  (v0.99: Stances · Attacks · Defence · Show)
     api.thumb(json, px)                  a small 3/4 view of a pose (the preset buttons), the live pose untouched
     api.joint(k) / api.setJoint(k,[x,y,z]) / api.offset() / api.setOffset([x,y,z])   v0.99 joint tools (degrees / mm)
     api.mirror(limb, from) / api.resetJoint(k) / api.resetLimb(limb, side)            limb 'arm' | 'leg' | 'spine' | 'all'
     api.pose() / api.setPose(json) / api.pins(L,R) / api.dispose() */
import * as THREE from 'three';
import { buildBodyAsync } from './body.js';
import { JOINTS, JK, HANDLE_COL, applyPose, poseToJSON, poseFromJSON, readPose, emptyPose, jointPos, jointQ, endPos, ENDS, solveArm, rotateJointWorld, footNow, solveTwoBone, resolveSpec, BASE_R, BASE_H, MM_PER_M, ANKLE_H } from './rig.js';
import { PRESETS, PRESET_ORDER, PRESET_GROUPS } from './presets.js';
import { makeGear } from './gear.js';
import { loadBaked, loadBody8, wearBaked, merge8, beltShow8 } from './gear8.js';
import { mountWeapons, killWeapons, armedSpec, armedFinish, shieldCheck, wristBend, holdsOf, STANCE } from './hold.js';
import { MeshoptDecoder } from './vendor/meshopt_decoder.js';
/* v1.0 (his picks, look100 rounds 2–8): printed pieces in a token's gear spec are worn as the PRE-BAKED SDF sculpts (assets/gear100.js,
   made by mkgear.js), merged into one skinned mesh with one outline; the classic gear.js pieces stay for custom-coloured pieces and
   pieces with extras (built on the device), and for everything when the bake is missing. */
const HEAD8 = { horned: 'cassis' };
function sculptSplit8(g, BK) { const out = JSON.parse(JSON.stringify(g || {})), list = []; if (!BK) return { spec: out, list };
  const take = (o, sd) => { if (!o || o.c || (o.x && o.x.length)) return false; const k = HEAD8[o.t] || o.t; if (!BK.has(k)) return false; list.push({ k, sd }); return true; };
  if (out.head && take(out.head)) delete out.head; if (out.chest && take(out.chest)) delete out.chest; if (out.belt && take(out.belt)) delete out.belt;
  for (const s of ['L', 'R']) { const a = out.arm && out.arm[s]; if (a) { if (a.upper && take(a.upper, s)) delete a.upper; if (a.lower && take(a.lower, s)) delete a.lower; if (a.wraps && !a.lower && BK.has('wraps')) { list.push({ k: 'wraps', sd: s }); delete a.wraps; } }
    const l = out.leg && out.leg[s]; if (l) { if (l.upper && take(l.upper, s)) delete l.upper; if (l.lower && take(l.lower, s)) delete l.lower; } }
  return { spec: out, list }; }
/* the body every token is built on (the bake is made on exactly this body; a different one skips the bake) */
export const BODY8 = { res: 0.005, body: { face2: 1, headRes: 0.0022, grip: { L: 'hilt', R: 'hilt' } } };

const MINI_YAW = [0, 45, 90, 135, 180, -135, -90, -45];   /* src/102-minis73.js */
const MINI_PXMM = 3.143;                                     /* src/94-v72.js */
const D2R = Math.PI / 180;

/* the key a bake must carry to be worn on a body built with these options */
export const bodyKey8 = (o) => 'b8|' + JSON.stringify({ res: o.res, body: o.body });

export async function createToken(opts = {}) {
  /* v1.0 defaults: the figure +15% on the 0.8-tile base, the painted pass, the painted face, fists that close round a hilt */
  const o = Object.assign({ res: BODY8.res, slice: 14, scale: 1.15, paint: 1, body: BODY8.body }, opts);
  /* the pre-baked printed pieces (window.GEAR100 from assets/gear100.js; opts.gear8 = null switches them off) */
  let BK = null, bakeWhy = '';
  { const GD = o.gear8 !== undefined ? o.gear8 : (typeof window !== 'undefined' ? window.GEAR100 : null);
    const key = bodyKey8(o);
    if (!GD) bakeWhy = 'none'; else if (GD.body !== key) bakeWhy = 'body'; else try { BK = await loadBaked(GD, MeshoptDecoder); } catch (e) { bakeWhy = String(e && e.message || e); BK = null; } }
  /* ---------- scene ---------- */
  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 0.46 * Math.PI));
  const sun = new THREE.DirectionalLight(0xfff4e6, 0.62 * Math.PI); scene.add(sun); scene.add(sun.target);
  const turn = new THREE.Group(); scene.add(turn);
  const baseG = new THREE.Group(); turn.add(baseG);
  {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    g.fillStyle = '#c9b993'; g.fillRect(0, 0, 128, 128);
    let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;   /* a fixed grain, so every sheet matches */
    for (let i = 0; i < 420; i++) { g.fillStyle = rnd() < .5 ? 'rgba(120,100,70,.18)' : 'rgba(255,245,220,.22)'; g.beginPath(); g.arc(rnd() * 128, rnd() * 128, rnd() * 0.9 + .3, 0, 7); g.fill(); }
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const ramp = new THREE.DataTexture(new Uint8Array([120, 120, 190, 190, 255, 255]), 6, 1, THREE.RedFormat); ramp.needsUpdate = true; ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
    const rTop = BASE_R * 0.955, geo = new THREE.CylinderGeometry(rTop, BASE_R, BASE_H, 64);
    const side = new THREE.MeshToonMaterial({ color: new THREE.Color('#4b4636'), gradientMap: ramp }), top = new THREE.MeshToonMaterial({ map: tex, gradientMap: ramp });
    const m = new THREE.Mesh(geo, [side, top, side]); m.position.y = -BASE_H / 2; baseG.add(m);
    const ink = new THREE.Mesh(new THREE.CylinderGeometry(rTop + 0.02, BASE_R + 0.02, BASE_H + 0.03, 64), new THREE.MeshBasicMaterial({ color: 0x120c0a, side: THREE.BackSide }));
    ink.position.y = -BASE_H / 2; baseG.add(ink);
  }
  /* ---------- the body (his 2a, v1.0: the slow core pre-baked in assets/body100.js — window.BODY100, made by mkgear.js on exactly this
     body; opts.body8 = null builds it fresh, as mkgear.js itself does; a missing / other-body bake builds it fresh, time-sliced) ---------- */
  let core = null, bodyWhy = '';
  { const BD = o.body8 !== undefined ? o.body8 : (typeof window !== 'undefined' ? window.BODY100 : null);
    if (!BD) bodyWhy = 'none'; else if (BD.key !== bodyKey8(o)) bodyWhy = 'body'; else try { core = await loadBody8(BD, MeshoptDecoder); } catch (e) { bodyWhy = String(e && e.message || e); core = null; } }
  const B = await buildBodyAsync(Object.assign({ res: o.res, hair: 'cap', core }, o.body || {}), o.slice, o.onStep);
  turn.add(B.group);
  /* look100 round 2: the figure +15% against its base (his minis' heroic scale; the base stays 25.4 mm = 0.8 tile) */
  if (o.scale) B.group.scale.setScalar(o.scale);
  /* look100 round 2: the painted pass — a 4-band ramp with deeper shade, less ambient, a stronger warm sun */
  if (o.paint) { const d = new Uint8Array([40, 100, 176, 255]); B.mats.gm.image = { data: d, width: 4, height: 1 }; B.mats.gm.needsUpdate = true;
    scene.children.forEach(l => { if (l.isAmbientLight) l.intensity = 0.27 * Math.PI; if (l.isDirectionalLight) { l.intensity = 0.86 * Math.PI; l.color.set(0xffe8cc); } }); }
  const rig = B.rig, gear = makeGear(B);
  const presets = PRESET_ORDER.map(k => [k, PRESETS[k].label, poseToJSON(resolveSpec(rig, PRESETS[k].spec))]);
  const groups = PRESET_GROUPS.map(([g, l, ks]) => [g, l, ks.slice()]);
  const STAND0 = presets[0][2];   /* the plain stand (v1.0: the game turns it into the armed stand for what a gear spec holds) */
  let pose = poseFromJSON(presets[0][2]); applyPose(rig, pose);

  /* ---------- renderer: one WebGL context, never in the page (images are copied out) ---------- */
  let R = null;
  const renderer = (w, h) => {
    if (!R) { R = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); R.outputColorSpace = THREE.SRGBColorSpace; R.setClearColor(0x000000, 0); R.setPixelRatio(1); }
    if (R.domElement.width !== w || R.domElement.height !== h) R.setSize(w, h, false); return R;
  };
  const orthoCam = (w, h, ppm, el, target) => {
    const hw = w / 2 / ppm, hh = h / 2 / ppm; const cam = new THREE.OrthographicCamera(-hw, hw, hh, -hh, 0.01, 50);
    const d = 10; cam.position.set(target.x, target.y + Math.sin(el * D2R) * d, target.z + Math.cos(el * D2R) * d); cam.lookAt(target);
    cam.updateMatrixWorld(); cam.updateProjectionMatrix(); return cam;
  };
  const lightFor = (cam) => {
    const dir = new THREE.Vector3(-0.55, 0.85, 0.55).applyQuaternion(cam.quaternion);
    sun.position.copy(cam.position).add(dir.multiplyScalar(5)); sun.target.position.copy(cam.position).add(new THREE.Vector3(0, 0, -10).applyQuaternion(cam.quaternion)); sun.target.updateMatrixWorld();
  };
  const grab = (r, w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(r.domElement, 0, 0, w, h, 0, 0, w, h); return c; };
  const halve = (c) => { const d = document.createElement('canvas'); d.width = Math.ceil(c.width / 2); d.height = Math.ceil(c.height / 2); const g = d.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, 0, d.width, d.height); return d; };
  const alphaBox = (c) => {
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return [x0, y0, x1, y1];
  };
  let handles = null;
  const hideHandles = (fn) => { const v = handles && handles.visible; if (handles) handles.visible = false; try { return fn(); } finally { if (handles) handles.visible = v; } };

  /* v1.0 (his 4a): BEST FIT ON THE TILE. The base stays exactly 0.8 tile, so the tile is 1.25 base radii either side of the anchor; nothing
     of the figure (+15%) may reach past that column or below the tile's lowest corner, in any of the 8 facings. reach() measures the posed
     figure as the sheet sees it (CPU skinning, every 2nd body vertex, the sheet's own yaw + 30° projection); fitTile() scales a figure that
     spills INSIDE the render (the base never changes) and returns what it did. */
  const TILE_HALF = BASE_R * 1.25;
  function reach(el = 30) {
    turn.rotation.y = 0; turn.updateMatrixWorld(true);
    const v = new THREE.Vector3(), ce = Math.cos(el * D2R), se = Math.sin(el * D2R), ys = MINI_YAW.map(y => [Math.cos(y * D2R), Math.sin(y * D2R)]);
    let hw = 0, dn = -1e9, n = 0; const sk = new Set();
    B.group.traverseVisible(o => { if (o.isSkinnedMesh && o.skeleton && !sk.has(o.skeleton)) { sk.add(o.skeleton); o.skeleton.update(); } });
    B.group.traverseVisible(o => {
      if (!o.isMesh || o.name === 'bowstring' || /_ink$/.test(o.name)) return;   /* raw meshes count too (the retiarius' net); the string lies between the bow's tips */ const P = o.geometry && o.geometry.attributes.position; if (!P) return;
      const st = o.isSkinnedMesh && P.count > 30000 ? 2 : 1;
      for (let i = 0; i < P.count; i += st) { if (o.isSkinnedMesh) o.getVertexPosition(i, v); else v.fromBufferAttribute(P, i); v.applyMatrix4(o.matrixWorld);
        for (const [c, s2] of ys) { const xs = v.x * c + v.z * s2, zs = -v.x * s2 + v.z * c; if (Math.abs(xs) > hw) hw = Math.abs(xs); const d = zs * se - (v.y + BASE_H) * ce; if (d > dn) dn = d; } n++; }
    });
    return { hw, dn, n, tileHalf: TILE_HALF };
  }
  function fitTile(s) {
    const s0 = o.scale || 1; B.group.scale.setScalar(s0); B.group.updateMatrixWorld(true);
    const pad = ((s.outlinePx || 0.85) + 1.0) / (s.pxmm * MM_PER_M), ce = Math.cos(s.el * D2R), BH = BASE_H * ce;
    const r = reach(s.el); let f = 1;
    if (r.hw > TILE_HALF - pad) f = Math.min(f, (TILE_HALF - pad) / r.hw);
    if (r.dn > TILE_HALF / 2 - pad && r.dn + BH > 1e-6) f = Math.min(f, (TILE_HALF / 2 - pad + BH) / (r.dn + BH));
    if (f < 0.999) { B.group.scale.setScalar(s0 * f); B.group.updateMatrixWorld(true); }
    return { f: +f.toFixed(4), hw: +r.hw.toFixed(4), dn: +r.dn.toFixed(4), restore: () => { B.group.scale.setScalar(s0); B.group.updateMatrixWorld(true); } };
  }
  /* the minis' sheet: 8 yaw cells in one row, transparent, cropped round the anchor; meta like MINI8 */
  function sheet(so = {}) { const g = sheetSteps(so); for (;;) { const r = g.next(); if (r.done) return r.value; } }
  /* the same, one facing per step (the game awaits between them so a page never freezes for the whole sheet) */
  async function sheetAsync(so = {}) { const g = sheetSteps(so); for (;;) { const r = g.next(); if (r.done) return r.value; await new Promise(ok => setTimeout(ok, 0)); } }
  function* sheetSteps(so = {}) {
    const t0 = performance.now();
    const s = Object.assign({ ss: 2, el: 30, pxmm: MINI_PXMM, outlinePx: 0.85 }, so);
    const ppm = s.pxmm * MM_PER_M * s.ss, S = Math.ceil(2.9 * ppm / 4) * 4;
    const cam = orthoCam(S, S, ppm, s.el, new THREE.Vector3(0, 0.82, 0)); lightFor(cam);
    B.setOutline(s.outlinePx * s.ss / ppm);
    const r = renderer(S, S);
    const anc = new THREE.Vector3(0, -BASE_H, 0).project(cam);
    const AX = (anc.x * 0.5 + 0.5) * S / s.ss, AY = (-anc.y * 0.5 + 0.5) * S / s.ss;
    const cells = []; const fit = s.fit === false ? null : fitTile(s);
    for (const yaw of MINI_YAW) {
      lightFor(cam); B.setOutline(s.outlinePx * s.ss / ppm);   /* again: an editor redraw may run between the steps */
      renderer(S, S); hideHandles(() => { turn.rotation.y = yaw * D2R; turn.updateMatrixWorld(true); r.render(scene, cam); });
      turn.rotation.y = 0; turn.updateMatrixWorld(true);
      let c = grab(r, S, S); for (let k = s.ss; k > 1; k /= 2) c = halve(c); cells.push({ c, box: alphaBox(c) });
      if (cells.length < MINI_YAW.length) yield;
    }
    if (fit) fit.restore();
    let L = 0, Rr = 0, T = 0, Bm = 0;
    for (const { box } of cells) { L = Math.max(L, AX - box[0]); Rr = Math.max(Rr, box[2] + 1 - AX); T = Math.max(T, AY - box[1]); Bm = Math.max(Bm, box[3] + 1 - AY); }
    const pxm = s.pxmm * MM_PER_M, tile = { f: fit ? fit.f : 1, half: +Math.max(L, Rr).toFixed(1), below: +Bm.toFixed(1), limH: +(TILE_HALF * pxm).toFixed(1), limD: +(TILE_HALF / 2 * pxm).toFixed(1) };
    const half = Math.ceil(Math.max(L, Rr)) + 1, w = half * 2, top = Math.ceil(T) + 1, h = top + Math.ceil(Bm) + 1;
    const x0 = Math.floor(AX) - half, y0 = Math.floor(AY) - top;
    const out = document.createElement('canvas'); out.width = w * cells.length; out.height = h; const g = out.getContext('2d');
    cells.forEach(({ c }, i) => g.drawImage(c, x0, y0, w, h, i * w, 0, w, h));
    return { canvas: out, meta: [w, h, +(AX - x0).toFixed(1), +(AY - y0).toFixed(1)], ms: Math.round(performance.now() - t0), tile };
  }
  /* small live facings for the modeller's strip (no supersampling) */
  function facings(px = 84) {
    const S = px, ppm = S / 2.75, out = [];
    const cam = orthoCam(S, S, ppm, 30, new THREE.Vector3(0, 0.9, 0)); lightFor(cam); B.setOutline(0.9 / ppm);
    const r = renderer(S, S); const fit = fitTile({ el: 30, pxmm: MINI_PXMM, outlinePx: 0.85 });   /* his 4a: the strip shows the board's fit */
    hideHandles(() => { for (const yaw of MINI_YAW) { turn.rotation.y = yaw * D2R; turn.updateMatrixWorld(true); r.render(scene, cam); out.push(grab(r, S, S)); } });
    fit.restore(); turn.rotation.y = 0; turn.updateMatrixWorld(true); return out;
  }

  /* ---------- look + gear + pose ---------- */
  let lookKey = '', gearKey = '';
  let sculpt8 = null, last8 = [], held = [], heldKey = '';
  function apply(a = {}) {
    if (a.look || a.gear) {
      const lk = Object.assign({}, a.look || {}, { noHarness: !!(a.gear && a.gear.chest) }); const k = JSON.stringify(lk);
      if (k !== lookKey) { B.setLook(lk); lookKey = k; }
      const gk = JSON.stringify(a.gear || {}); if (gk !== gearKey) { gearKey = gk; const sp = sculptSplit8(a.gear, BK);
        const g2 = sp.spec; delete g2.wR; delete g2.wL; gear.set(g2);
        if (sculpt8) { B.kit.kill(sculpt8); sculpt8 = null; }
        const ms = []; for (const it of sp.list) { try { ms.push(...wearBaked(B, BK, it.k, it.sd)); } catch (e) { console.error(e); } }
        if (ms.length) sculpt8 = ms.length > 1 ? merge8(B, ms) : ms[0];
        beltShow8(B, !sp.list.some(it => BK && BK.kind(it.k) === 'b'));
        last8 = sp.list.map(it => it.k + (BK && BK.kind(it.k) === 'l' ? it.sd || '' : ''));
        const hk = JSON.stringify([a.gear && a.gear.wR, a.gear && a.gear.wL]); if (hk !== heldKey) { killWeapons(B, held); held = mountWeapons(B, a.gear || {}); heldKey = hk; } }
    }
    if (a.pose) setPose(a.pose);
  }
  /* THE ARMED STAND (his picks: sword 15° out of the fist, straight wrist, the elbow takes the angle; the scutum upright on the forearm):
     the default 'stand' pose for what this gear holds — the plain stand when the hands are empty. The live pose is restored. */
  function standFor(g) {
    const ho = holdsOf(g || {}); if (!ho.R && !ho.L) return STAND0;
    const keep = poseJSON();
    try { setPose(poseToJSON(resolveSpec(rig, { p: STANCE.p, j: STANCE.j, f: STANCE.f }))); const A = armedSpec(rig, g); setPose(poseToJSON(resolveSpec(rig, A.spec))); armedFinish(rig, align, A.fr); return poseToJSON(readPose(rig, pinsNow())); }
    finally { setPose(keep); }
  }
  function setPose(p) { pose = poseFromJSON(p); applyPose(rig, pose); }
  const pinsNow = () => { const f = {}; for (const s of ['L', 'R']) if (pose.f && pose.f[s]) f[s] = pose.f[s]; return f; };
  const poseJSON = () => poseToJSON(readPose(rig, pinsNow()));

  /* ---------- v0.99 joint tools (eulers in degrees, XYZ, as in the pose JSON) ---------- */
  const LIMB = { arm: ['s', 'e', 'w'], leg: ['h', 'k', 'a'], spine: ['pe', 'sp', 'ch', 'ne', 'he'] };
  const sync = () => { pose = readPose(rig, pinsNow()); };
  const clampE = (e) => [0, 1, 2].map(i => Math.max(-180, Math.min(180, Math.round(+e[i] || 0))));
  function joint(k) { sync(); return clampE((pose.j && pose.j[k]) || [0, 0, 0]); }
  function setJoint(k, e) { if (!JK[k]) return; sync(); const v = clampE(e); if (v.some(x => x)) pose.j[k] = v; else delete pose.j[k]; applyPose(rig, pose); }
  function offset() { sync(); return pose.p.map(v => Math.round(v)); }
  function setOffset(p) { sync(); pose.p = [0, 1, 2].map(i => Math.max(-450, Math.min(450, Math.round(+p[i] || 0)))); applyPose(rig, pose); }
  /* a leg pinned to the base is placed by IK: its joints follow the pin, not the sliders */
  const legPinned = (k) => /^[hka][LR]$/.test(k) && !!(pose.f && pose.f[k[1]]);
  /* mirror one side onto the other: a reflection across the body's middle keeps X and turns Y and Z round; a pinned foot moves to the other side */
  function mirror(limb, from) {
    sync(); const to = from === 'L' ? 'R' : 'L'; const kinds = limb === 'all' ? ['arm', 'leg'] : [limb];
    for (const L of kinds) {
      if (!LIMB[L] || L === 'spine') continue;
      for (const b of LIMB[L]) { const e = pose.j[b + from]; if (e) pose.j[b + to] = [e[0], -e[1], -e[2]]; else delete pose.j[b + to]; }
      if (L === 'leg') { const f = pose.f && pose.f[from]; if (f) pose.f[to] = [-f[0], f[1], -(f[2] || 0)]; else if (pose.f) delete pose.f[to]; }
    }
    if (limb === 'all') { for (const b of ['pe', 'sp', 'ch', 'ne', 'he']) { const e = pose.j[b]; if (e) pose.j[b] = [e[0], 0, 0]; } pose.p[0] = 0; }
    applyPose(rig, pose);
  }
  function resetJoint(k) { sync(); delete pose.j[k]; if (k === 'pe') pose.p = [0, 0, 0]; applyPose(rig, pose); }
  function resetLimb(limb, side) {
    sync(); const ks = limb === 'spine' ? LIMB.spine : (LIMB[limb] || []).map(b => b + side);
    for (const k of ks) delete pose.j[k]; if (limb === 'spine') pose.p = [0, 0, 0];
    if (limb === 'leg' && pose.f && pose.f[side]) { const st = poseFromJSON(presets[0][2]); if (st.f && st.f[side]) pose.f[side] = st.f[side].slice(); }
    applyPose(rig, pose);
  }
  /* a small 3/4 view of any pose (preset buttons); the live pose is restored exactly */
  function thumb(json, px = 72, o = {}) {
    const snap = { pose: JSON.parse(JSON.stringify(pose)), b: JOINTS.map(J => rig.bones[J.k].quaternion.clone()), p: rig.bones.pe.position.clone() };
    try {
      setPose(json); const ss = 2, S = px * ss, ppm = S / (o.span || 2.35);
      const cam = orthoCam(S, Math.round(S * (o.tall || 1.15)), ppm, o.el == null ? 14 : o.el, new THREE.Vector3(0, 0.98, 0)); lightFor(cam); B.setOutline(1.1 * ss / ppm);
      const H = Math.round(S * (o.tall || 1.15)); const r = renderer(S, H);
      hideHandles(() => { turn.rotation.y = (o.yaw == null ? 25 : o.yaw) * D2R; turn.updateMatrixWorld(true); r.render(scene, cam); });
      turn.rotation.y = 0; turn.updateMatrixWorld(true); return halve(grab(r, S, H));
    } finally {
      pose = snap.pose; JOINTS.forEach((J, i) => rig.bones[J.k].quaternion.copy(snap.b[i])); rig.bones.pe.position.copy(snap.p); rig.bones.pe.updateMatrixWorld(true);
    }
  }

  /* ---------- the editor: joints dragged on a 2D canvas ---------- */
  function editor(cv, onChange, eo = {}) {
    const ctx = cv.getContext('2d');
    const view = { yaw: 25, el: 12, zoom: 1 };
    handles = new THREE.Group(); turn.add(handles);
    const HD = []; const hMat = (c) => new THREE.MeshBasicMaterial({ color: c, depthTest: false, transparent: true, opacity: 0.95 });
    for (const J of JOINTS) { const m = new THREE.Mesh(new THREE.SphereGeometry(J.k === 'pe' ? 0.036 : 0.028, 14, 10), hMat(J.k === 'pe' ? HANDLE_COL.pink : HANDLE_COL[J.c])); m.renderOrder = 999; m.userData = { k: J.k, kind: 'joint' }; handles.add(m); HD.push(m); }
    for (const k of ['wL', 'wR']) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.024, 14, 10), hMat(HANDLE_COL.pink)); m.renderOrder = 999; m.userData = { k, kind: 'hand' }; handles.add(m); HD.push(m); }
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(JOINTS.length * 6), 3)); lg.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(JOINTS.length * 6), 3));
    const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ vertexColors: true, depthTest: false, transparent: true, opacity: 0.8 })); lines.renderOrder = 998; handles.add(lines);
    /* v0.98: the joint under the pointer (or being dragged) lights up — a bigger handle + a soft white halo */
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.058, 18, 12), new THREE.MeshBasicMaterial({ color: 0xfff4c8, depthTest: false, transparent: true, opacity: 0.5 })); halo.renderOrder = 997; halo.visible = false; handles.add(halo);
    /* v0.99: the SELECTED joint (click, drag, or the modeller's joint list) keeps a gold ring + the rotation gizmo */
    const selHalo = new THREE.Mesh(new THREE.SphereGeometry(0.05, 18, 12), new THREE.MeshBasicMaterial({ color: 0xe8b84a, depthTest: false, transparent: true, opacity: 0.45 })); selHalo.renderOrder = 996; selHalo.visible = false; handles.add(selHalo);
    let hot = null, sel = null, axis = 0;
    const lightHot = () => { const k = drag && drag.k ? drag.k : hot; let on = null, so = null;
      for (const m of HD) { const me = m.userData.k === k; m.scale.setScalar(me ? 1.55 : m.userData.k === sel && m.userData.kind === 'joint' ? 1.3 : 1); if (me) on = m; if (m.userData.k === sel && m.userData.kind === 'joint') so = m; }
      halo.visible = !!on; if (on) { halo.position.copy(on.position); halo.scale.setScalar(on.userData.k === 'pe' ? 1.25 : 1); }
      selHalo.visible = !!so; if (so) selHalo.position.copy(so.position);
      cv.style.cursor = drag ? (drag.k ? 'grabbing' : 'grabbing') : (hot ? 'pointer' : 'grab'); };
    function place() {
      for (const m of HD) m.position.copy(m.userData.kind === 'hand' ? endPos(rig, m.userData.k) : jointPos(rig, m.userData.k));
      const P = lg.attributes.position, C = lg.attributes.color; let n = 0;
      for (const J of JOINTS) { if (!J.p) continue; const a = jointPos(rig, J.p), b = jointPos(rig, J.k), c = new THREE.Color(J.c === 'pink' ? HANDLE_COL.pink : HANDLE_COL[J.c]);
        P.setXYZ(n, a.x, a.y, a.z); C.setXYZ(n++, c.r, c.g, c.b); P.setXYZ(n, b.x, b.y, b.z); C.setXYZ(n++, c.r, c.g, c.b); }
      lg.setDrawRange(0, n); P.needsUpdate = C.needsUpdate = true;
    }
    let cam = null;
    function render() {
      const w = cv.width, h = cv.height; if (!w || !h) return;
      const ppm = h / 2.6 * view.zoom; cam = orthoCam(w, h, ppm, view.el, new THREE.Vector3(0, 0.93, 0)); lightFor(cam); B.setOutline(1.6 / ppm);
      turn.rotation.y = view.yaw * D2R; turn.updateMatrixWorld(true); place(); lightHot();
      const r = renderer(w, h); r.render(scene, cam); ctx.clearRect(0, 0, w, h); ctx.drawImage(r.domElement, 0, 0, w, h, 0, 0, w, h);
      if (sel && eo.gizmo !== false) gizmo(w, h);
      turn.rotation.y = 0; turn.updateMatrixWorld(true);
    }
    /* the gizmo: three rings round the selected joint, one per euler axis (X bend red · Y twist green · Z side blue), the active one bold.
       XYZ order: X turns about the parent's X, Y about the X-turned Y, Z about the X-and-Y-turned Z — so each ring is the true axis of its slider. */
    const AXC = ['#ff6b5b', '#63d36b', '#5b9bff'];
    function gizmo(w, h) {
      const J = JK[sel]; if (!J) return;
      const pq = J.p ? jointQ2(J.p) : new THREE.Quaternion(); const e = new THREE.Euler().setFromQuaternion(rig.bones[sel].quaternion, 'XYZ');
      const qx = pq.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), e.x));
      const qxy = qx.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), e.y));
      const ax = [new THREE.Vector3(1, 0, 0).applyQuaternion(pq), new THREE.Vector3(0, 1, 0).applyQuaternion(qx), new THREE.Vector3(0, 0, 1).applyQuaternion(qxy)];
      const tq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), view.yaw * D2R);
      const c = jointPos(rig, sel).applyQuaternion(tq);
      const px = (v) => { const p = v.clone().project(cam); return [(p.x + 1) / 2 * w, (1 - p.y) / 2 * h]; };
      const R = 0.11 * (sel === 'pe' ? 1.35 : 1);
      ctx.save(); ctx.lineCap = 'round';
      const order = [0, 1, 2].filter(i => i !== axis).concat([axis]);
      for (const i of order) {
        const a = ax[i].clone().applyQuaternion(tq).normalize(); const u = new THREE.Vector3(0, 1, 0); if (Math.abs(a.dot(u)) > 0.9) u.set(1, 0, 0);
        const p1 = u.sub(a.clone().multiplyScalar(a.dot(u))).normalize(), p2 = new THREE.Vector3().crossVectors(a, p1);
        ctx.beginPath(); for (let t = 0; t <= 48; t++) { const g = t / 48 * Math.PI * 2; const q = px(c.clone().add(p1.clone().multiplyScalar(Math.cos(g) * R)).add(p2.clone().multiplyScalar(Math.sin(g) * R))); t ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
        ctx.strokeStyle = AXC[i]; ctx.globalAlpha = i === axis ? 1 : 0.4; ctx.lineWidth = (i === axis ? 3 : 1.2) * Math.max(1, w / 900); ctx.stroke();
        if (i === axis) { const s0 = px(c.clone().sub(a.clone().multiplyScalar(R * 1.5))), s1 = px(c.clone().add(a.clone().multiplyScalar(R * 1.5)));
          ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5 * Math.max(1, w / 900); ctx.beginPath(); ctx.moveTo(s0[0], s0[1]); ctx.lineTo(s1[0], s1[1]); ctx.stroke(); ctx.setLineDash([]); }
      }
      ctx.restore();
    }
    let raf = 0; const later = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); }); };
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let drag = null;
    const toSpace = () => { turn.rotation.y = view.yaw * D2R; turn.updateMatrixWorld(true); return turn.matrixWorld.clone().invert(); };
    const pick = (e) => { const b = cv.getBoundingClientRect(); ndc.set((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1); ray.setFromCamera(ndc, cam); };
    const down = (e) => {
      if (!cam || (e.button != null && e.button > 0)) return; pick(e); toSpace(); place(); handles.updateMatrixWorld(true);
      const hit = ray.intersectObjects(HD, false)[0];
      try { cv.setPointerCapture(e.pointerId); } catch (er) { /* fine */ }
      if (!hit) { drag = { k: null, x: e.clientX, y: e.clientY }; return; }
      const k = hit.object.userData.k, kind = hit.object.userData.kind, p0 = hit.object.getWorldPosition(new THREE.Vector3());
      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(cam.getWorldDirection(new THREE.Vector3()).negate(), p0);
      if (k[0] === 'a') plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, ANKLE_H, 0));
      drag = { k, kind, plane, x: e.clientX, y: e.clientY, pe0: rig.bones.pe.position.clone(), p0: p0.clone().applyMatrix4(toSpace()) };
      if (k !== sel) { sel = k; if (eo.onSelect) eo.onSelect(k); }
      turn.rotation.y = 0; turn.updateMatrixWorld(true); e.preventDefault(); later();
    };
    const hover = (e) => {
      if (!cam) return; pick(e); toSpace(); place(); handles.updateMatrixWorld(true);
      const hit = ray.intersectObjects(HD, false)[0]; const k = hit ? hit.object.userData.k : null;
      turn.rotation.y = 0; turn.updateMatrixWorld(true);
      if (k !== hot) { hot = k; later(); }
    };
    const move = (e) => {
      if (!drag) { hover(e); return; } const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
      if (!drag.k) { view.yaw += dx * 0.6; view.el = Math.max(-10, Math.min(60, view.el + dy * 0.3)); later(); return; }
      pick(e); const inv = toSpace(); const hit = new THREE.Vector3(); const k = drag.k, side = k.slice(-1);
      const qInv = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -view.yaw * D2R);
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion).applyQuaternion(qInv), right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion).applyQuaternion(qInv);
      turn.rotation.y = 0; turn.updateMatrixWorld(true);
      const onPlane = () => { if (!ray.ray.intersectPlane(drag.plane, hit)) return false; hit.applyMatrix4(inv); return true; };
      if (drag.kind === 'hand') { rotateJointWorld(rig, k, up, dx * 0.012); rotateJointWorld(rig, k, right, dy * 0.012); }
      else if (k === 'pe') { if (!onPlane()) return; rig.bones.pe.position.copy(drag.pe0).add(hit.clone().sub(drag.p0)); }
      else if (k[0] === 'w') { if (!onPlane()) return; solveArm(rig, side, hit); }
      else if (k[0] === 'a') {
        if (!ray.ray.intersectPlane(drag.plane, hit)) return; hit.applyMatrix4(inv);
        if (pose.f && pose.f[side]) { const f = pose.f[side]; pose.f[side] = [hit.x * 1000, hit.z * 1000, f[2]]; }
        else solveTwoBone(rig, 'h' + side, 'k' + side, 'a' + side, hit, new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 1));
      } else { rotateJointWorld(rig, k, up, dx * 0.01); rotateJointWorld(rig, k, right, dy * 0.01); }
      pose = readPose(rig, pinsNow()); applyPose(rig, pose); later(); if (onChange) onChange(false);
    };
    const up = () => { if (drag && drag.k && onChange) onChange(true); drag = null; later(); };
    const leave = () => { if (!drag && hot) { hot = null; later(); } };
    const wheel = (e) => { e.preventDefault(); view.zoom = Math.max(0.7, Math.min(3, view.zoom * (e.deltaY < 0 ? 1.1 : 0.9))); later(); };
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('wheel', wheel, { passive: false }); cv.addEventListener('pointerleave', leave);
    render();
    return {
      render: later, view,
      /* v0.99: the selected joint and the gizmo's active axis (0 X bend · 1 Y twist · 2 Z side) */
      select(k) { sel = k && JK[k] ? k : null; later(); }, selected: () => sel, axis(i) { if (i != null) { axis = Math.max(0, Math.min(2, i | 0)); later(); } return axis; },
      /* v0.98: the lit joint (hover or drag) and a joint's place on the canvas in CSS pixels (tests, hints) */
      hot: () => (drag && drag.k) || hot,
      screenOf(k) { if (!cam) return null; turn.rotation.y = view.yaw * D2R; turn.updateMatrixWorld(true); place(); const m = HD.find(x => x.userData.k === k); if (!m) return null;
        const v = m.position.clone().applyMatrix4(turn.matrixWorld).project(cam); turn.rotation.y = 0; turn.updateMatrixWorld(true); const b = cv.getBoundingClientRect();
        return { x: b.left + (v.x + 1) / 2 * b.width, y: b.top + (1 - v.y) / 2 * b.height }; },
      destroy() { cv.removeEventListener('pointerleave', leave); cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up); cv.removeEventListener('wheel', wheel);
        if (raf) cancelAnimationFrame(raf); turn.remove(handles); handles.traverse(x => { if (x.geometry) x.geometry.dispose(); if (x.material) x.material.dispose(); }); handles = null; },
    };
  }
  /* a joint's rotation in the figure's own space (the rig's jointQ, without importing it twice) */
  function jointQ2(k) { const b = rig.bones[k]; b.updateWorldMatrix(true, false); const m = turn.matrixWorld.clone().invert().multiply(b.matrixWorld); const q = new THREE.Quaternion(); m.decompose(new THREE.Vector3(), q, new THREE.Vector3()); return q; }
  /* pin / unpin a foot on the base (the leg is then solved by IK) */
  function pins(L, Rt) {
    pose = readPose(rig, pinsNow());
    for (const [s, on] of [['L', L], ['R', Rt]]) { if (on && !(pose.f && pose.f[s])) pose.f[s] = footNow(rig, s); if (!on && pose.f) delete pose.f[s]; }
    applyPose(rig, pose);
  }
  /* look100: a big close render (any yaw / elevation / framing), transparent */
  function hero(ho = {}) {
    const h = Object.assign({ w: 512, h: 512, ss: 2, el: 22, yaw: 25, span: 2.25, cy: 0.9, cx: 0, outlinePx: 1.5 }, ho);
    const W = h.w * h.ss, H = h.h * h.ss, ppm = H / h.span;
    turn.rotation.y = h.yaw * D2R; turn.updateMatrixWorld(true);
    const tgt = new THREE.Vector3(h.cx, h.cy, h.cz || 0);
    if (h.focus) { rig.bones[h.focus].getWorldPosition(tgt); tgt.y += h.fdy == null ? -0.06 : h.fdy; }   /* frame a bone (the hand close-ups) */
    const cam = orthoCam(W, H, ppm, h.el, tgt); lightFor(cam); B.setOutline(h.outlinePx * h.ss / ppm);
    const r = renderer(W, H); turn.rotation.y = h.yaw * D2R; turn.updateMatrixWorld(true); baseG.visible = h.base !== false;
    r.render(scene, cam); turn.rotation.y = 0; turn.updateMatrixWorld(true); baseG.visible = true;
    let c = grab(r, W, H); for (let k = h.ss; k > 1; k /= 2) c = halve(c); return c;
  }
  const specPose = (spec) => poseToJSON(resolveSpec(rig, spec));
  /* look100 round 2: a GRIP CONSTRAINT after the pose — turn the hand about its forearm so the back of the hand (shield face) looks
     along `o`, or bend it so the blade (hand forward axis) points along `f` (figure space, y up, +z forward) */
  function align(sd, want) {
    const sx = sd === 'L' ? 1 : -1, W0 = new THREE.Vector3(...JK['w' + sd].pos), tip = new THREE.Vector3(...ENDS['w' + sd]);
    const u = tip.clone().sub(W0).normalize(), z = new THREE.Vector3(0, 0, 1); const f = z.clone().sub(u.clone().multiplyScalar(z.dot(u))).normalize();
    let ov = new THREE.Vector3().crossVectors(u, f); if (ov.x * sx < 0) ov.negate();
    const qE = jointQ(rig, 'e' + sd); const u1 = u.clone().applyQuaternion(qE), o1 = ov.clone().applyQuaternion(qE), f1 = f.clone().applyQuaternion(qE);
    let q = qE.clone();
    if (want.o) {   /* round 3: twist about the FOREARM axis, so a strapped shield (whose board follows the forearm) turns in its own plane */
      const fa = new THREE.Vector3(...JK['w' + sd].pos).sub(new THREE.Vector3(...JK['e' + sd].pos)).normalize().applyQuaternion(qE);
      const od = new THREE.Vector3(...want.o); od.sub(fa.clone().multiplyScalar(od.dot(fa))).normalize(); const o2 = o1.clone().sub(fa.clone().multiplyScalar(o1.dot(fa))).normalize();
      const ang = Math.atan2(new THREE.Vector3().crossVectors(o2, od).dot(fa), o2.dot(od)); q = new THREE.Quaternion().setFromAxisAngle(fa, ang).multiply(qE); }
    if (want.tf) {   /* round 5: TWIST ONLY about the forearm so the thumb side (hand f) faces tf — the wrist itself stays straight */
      const fa = new THREE.Vector3(...JK['w' + sd].pos).sub(new THREE.Vector3(...JK['e' + sd].pos)).normalize().applyQuaternion(qE);
      const td = new THREE.Vector3(...want.tf); td.sub(fa.clone().multiplyScalar(td.dot(fa))).normalize(); const f2 = f1.clone().sub(fa.clone().multiplyScalar(f1.dot(fa))).normalize();
      const ang = Math.atan2(new THREE.Vector3().crossVectors(f2, td).dot(fa), f2.dot(td)); q = new THREE.Quaternion().setFromAxisAngle(fa, ang).multiply(qE); }
    if (want.f) { const fd = new THREE.Vector3(...want.f).normalize(); q = new THREE.Quaternion().setFromUnitVectors(f1, fd).multiply(qE); }
    rig.bones['w' + sd].quaternion.copy(qE.clone().invert().multiply(q)); rig.bones['w' + sd].updateMatrixWorld(true);
  }
  return {
    hero, specPose, align, B, rig, turn, scene, baseG, sculpted: () => last8.slice(), standFor,
    /* v1.0: the bake (null when missing: bakeWhy), the shield check on what is held now, the wrists' bend */
    baked: BK ? { keys: BK.keys.length, bytes: BK.bytes, ms: BK.ms } : null, bakeWhy, bodyBaked: core ? { verts: core.nv, bytes: core.bytes, ms: core.ms.load } : null, bodyWhy, bodyKey: bodyKey8(o), shieldCheck: () => shieldCheck(B, turn, held), wrists: () => ({ L: wristBend(rig, 'L'), R: wristBend(rig, 'R') }),
    reach, fitTile: (so) => { const f = fitTile(Object.assign({ el: 30, pxmm: MINI_PXMM, outlinePx: 0.85 }, so || {})); f.restore(); return { f: f.f, hw: f.hw, dn: f.dn, tileHalf: TILE_HALF }; },
    apply, setPose, pose: poseJSON, pins, groups, thumb, joint, setJoint, offset, setOffset, mirror, resetJoint, resetLimb, legPinned: (k) => { sync(); return legPinned(k); }, pinned: () => ({ L: !!(pose.f && pose.f.L), R: !!(pose.f && pose.f.R) }), presets, sheet, sheetAsync, facings, editor, stats: B.stats, _dbg: { B, turn, scene, resolve: (spec) => poseToJSON(resolveSpec(rig, spec)) },
    dispose() { gear.clear(); killWeapons(B, held); held = []; if (R) { R.dispose(); R.forceContextLoss(); R = null; } },
  };
}
export { poseToJSON, poseFromJSON, emptyPose };
