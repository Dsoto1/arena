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
import { JOINTS, JK, HANDLE_COL, applyPose, poseToJSON, poseFromJSON, readPose, emptyPose, jointPos, endPos, solveArm, rotateJointWorld, footNow, solveTwoBone, resolveSpec, BASE_R, BASE_H, MM_PER_M, ANKLE_H } from './rig.js';
import { PRESETS, PRESET_ORDER, PRESET_GROUPS } from './presets.js';
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
  const groups = PRESET_GROUPS.map(([g, l, ks]) => [g, l, ks.slice()]);
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
  return {
    apply, setPose, pose: poseJSON, pins, groups, thumb, joint, setJoint, offset, setOffset, mirror, resetJoint, resetLimb, legPinned: (k) => { sync(); return legPinned(k); }, pinned: () => ({ L: !!(pose.f && pose.f.L), R: !!(pose.f && pose.f.R) }), presets, sheet, sheetAsync, facings, editor, stats: B.stats, _dbg: { B, turn, scene, resolve: (spec) => poseToJSON(resolveSpec(rig, spec)) },
    dispose() { gear.clear(); if (R) { R.dispose(); R.forceContextLoss(); R = null; } },
  };
}
export { poseToJSON, poseFromJSON, emptyPose };
