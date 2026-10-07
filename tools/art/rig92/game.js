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
     api.pose() / api.setPose(json) / api.pins(L,R) / api.dispose() */
import * as THREE from 'three';
import { buildBodyAsync } from './body.js';
import { JOINTS, HANDLE_COL, applyPose, poseToJSON, poseFromJSON, readPose, emptyPose, jointPos, endPos, solveArm, rotateJointWorld, footNow, solveTwoBone, resolveSpec, BASE_R, BASE_H, MM_PER_M, ANKLE_H } from './rig.js';
import { PRESETS, PRESET_ORDER } from './presets.js';
import { makeGear } from './gear.js';

const MINI_YAW = [0, 45, 90, 135, 180, -135, -90, -45];   /* src/102-minis73.js */
const MINI_PXMM = 3.143;                                     /* src/94-v72.js */
const D2R = Math.PI / 180;

export async function createToken(opts = {}) {
  const o = Object.assign({ res: 0.005, slice: 14 }, opts);
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
  /* ---------- the body (time-sliced build) ---------- */
  const B = await buildBodyAsync({ res: o.res, hair: 'cap' }, o.slice, o.onStep);
  turn.add(B.group);
  const rig = B.rig, gear = makeGear(B);
  const presets = PRESET_ORDER.map(k => [k, PRESETS[k].label, poseToJSON(resolveSpec(rig, PRESETS[k].spec))]);
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
    const cells = [];
    for (const yaw of MINI_YAW) {
      lightFor(cam); B.setOutline(s.outlinePx * s.ss / ppm);   /* again: an editor redraw may run between the steps */
      renderer(S, S); hideHandles(() => { turn.rotation.y = yaw * D2R; turn.updateMatrixWorld(true); r.render(scene, cam); });
      turn.rotation.y = 0; turn.updateMatrixWorld(true);
      let c = grab(r, S, S); for (let k = s.ss; k > 1; k /= 2) c = halve(c); cells.push({ c, box: alphaBox(c) });
      if (cells.length < MINI_YAW.length) yield;
    }
    let L = 0, Rr = 0, T = 0, Bm = 0;
    for (const { box } of cells) { L = Math.max(L, AX - box[0]); Rr = Math.max(Rr, box[2] + 1 - AX); T = Math.max(T, AY - box[1]); Bm = Math.max(Bm, box[3] + 1 - AY); }
    const half = Math.ceil(Math.max(L, Rr)) + 1, w = half * 2, top = Math.ceil(T) + 1, h = top + Math.ceil(Bm) + 1;
    const x0 = Math.floor(AX) - half, y0 = Math.floor(AY) - top;
    const out = document.createElement('canvas'); out.width = w * cells.length; out.height = h; const g = out.getContext('2d');
    cells.forEach(({ c }, i) => g.drawImage(c, x0, y0, w, h, i * w, 0, w, h));
    return { canvas: out, meta: [w, h, +(AX - x0).toFixed(1), +(AY - y0).toFixed(1)], ms: Math.round(performance.now() - t0) };
  }
  /* small live facings for the modeller's strip (no supersampling) */
  function facings(px = 84) {
    const S = px, ppm = S / 2.75, out = [];
    const cam = orthoCam(S, S, ppm, 30, new THREE.Vector3(0, 0.9, 0)); lightFor(cam); B.setOutline(0.9 / ppm);
    const r = renderer(S, S);
    hideHandles(() => { for (const yaw of MINI_YAW) { turn.rotation.y = yaw * D2R; turn.updateMatrixWorld(true); r.render(scene, cam); out.push(grab(r, S, S)); } });
    turn.rotation.y = 0; turn.updateMatrixWorld(true); return out;
  }

  /* ---------- look + gear + pose ---------- */
  let lookKey = '', gearKey = '';
  function apply(a = {}) {
    if (a.look || a.gear) {
      const lk = Object.assign({}, a.look || {}, { noHarness: !!(a.gear && a.gear.chest) }); const k = JSON.stringify(lk);
      if (k !== lookKey) { B.setLook(lk); lookKey = k; }
      const gk = JSON.stringify(a.gear || {}); if (gk !== gearKey) { gear.set(a.gear || {}); gearKey = gk; }
    }
    if (a.pose) setPose(a.pose);
  }
  function setPose(p) { pose = poseFromJSON(p); applyPose(rig, pose); }
  const pinsNow = () => { const f = {}; for (const s of ['L', 'R']) if (pose.f && pose.f[s]) f[s] = pose.f[s]; return f; };
  const poseJSON = () => poseToJSON(readPose(rig, pinsNow()));

  /* ---------- the editor: joints dragged on a 2D canvas ---------- */
  function editor(cv, onChange) {
    const ctx = cv.getContext('2d');
    const view = { yaw: 25, el: 12, zoom: 1 };
    handles = new THREE.Group(); turn.add(handles);
    const HD = []; const hMat = (c) => new THREE.MeshBasicMaterial({ color: c, depthTest: false, transparent: true, opacity: 0.95 });
    for (const J of JOINTS) { const m = new THREE.Mesh(new THREE.SphereGeometry(J.k === 'pe' ? 0.036 : 0.028, 14, 10), hMat(J.k === 'pe' ? HANDLE_COL.pink : HANDLE_COL[J.c])); m.renderOrder = 999; m.userData = { k: J.k, kind: 'joint' }; handles.add(m); HD.push(m); }
    for (const k of ['wL', 'wR']) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.024, 14, 10), hMat(HANDLE_COL.pink)); m.renderOrder = 999; m.userData = { k, kind: 'hand' }; handles.add(m); HD.push(m); }
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(JOINTS.length * 6), 3)); lg.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(JOINTS.length * 6), 3));
    const lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ vertexColors: true, depthTest: false, transparent: true, opacity: 0.8 })); lines.renderOrder = 998; handles.add(lines);
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
      turn.rotation.y = view.yaw * D2R; turn.updateMatrixWorld(true); place();
      const r = renderer(w, h); r.render(scene, cam); ctx.clearRect(0, 0, w, h); ctx.drawImage(r.domElement, 0, 0, w, h, 0, 0, w, h);
      turn.rotation.y = 0; turn.updateMatrixWorld(true);
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
      turn.rotation.y = 0; turn.updateMatrixWorld(true); e.preventDefault();
    };
    const move = (e) => {
      if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
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
    const up = () => { if (drag && drag.k && onChange) onChange(true); drag = null; };
    const wheel = (e) => { e.preventDefault(); view.zoom = Math.max(0.7, Math.min(3, view.zoom * (e.deltaY < 0 ? 1.1 : 0.9))); later(); };
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('wheel', wheel, { passive: false });
    render();
    return {
      render: later, view,
      destroy() { cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up); cv.removeEventListener('wheel', wheel);
        if (raf) cancelAnimationFrame(raf); turn.remove(handles); handles.traverse(x => { if (x.geometry) x.geometry.dispose(); if (x.material) x.material.dispose(); }); handles = null; },
    };
  }
  /* pin / unpin a foot on the base (the leg is then solved by IK) */
  function pins(L, Rt) {
    pose = readPose(rig, pinsNow());
    for (const [s, on] of [['L', L], ['R', Rt]]) { if (on && !(pose.f && pose.f[s])) pose.f[s] = footNow(rig, s); if (!on && pose.f) delete pose.f[s]; }
    applyPose(rig, pose);
  }
  return {
    apply, setPose, pose: poseJSON, pins, pinned: () => ({ L: !!(pose.f && pose.f.L), R: !!(pose.f && pose.f.R) }), presets, sheet, sheetAsync, facings, editor, stats: B.stats, _dbg: { B, turn, scene },
    dispose() { gear.clear(); if (R) { R.dispose(); R.forceContextLoss(); R = null; } },
  };
}
export { poseToJSON, poseFromJSON, emptyPose };
