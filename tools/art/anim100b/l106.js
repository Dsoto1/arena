/* =====================================================================
   tools/art/anim100b/l106.js — v1.06a LIGHT for the beast renderers (tools/plans/look100/beast5_rig.js quadrupeds / snakes / Zora and
   beast5_hum.js → anim_rig.js renderFrames for Tholo + Commodus). The same light as the gladiators (src/board/311 ANIM100_LIB light() /
   shadowRow(), cfg = 399's LIGHT106_BAKE + LIGHT106_SUN): ONE sun as the key, a cool fill, a thin warm rim, the old camera-relative sun off,
   the base darker (baseK); and a GROUND SHADOW per cell (a ShadowMaterial plane at the base's bottom, the figure drawn only into the shadow map).
   Units are the scene's own (mm for beast5_rig, metres for the rig92 token): `u` = the scene units of one metre-ish figure (extents, distances).
   window.L106B = {lights(THREE, scene, cfg, tgt, u, base[]) → undo, shadowCell(THREE, scene, turn, o) → canvas, crop(cells, AX, AY) → {canvas, meta}}
   ===================================================================== */
export function lights(THREE, scene, cfg, tgt, u, base) {
  const undo = [], add = [];
  for (const l of scene.children) { if (l.isDirectionalLight && !l.userData.l106) { const v = l.visible; undo.push(() => { l.visible = v; }); l.visible = false; }
    if (l.isAmbientLight) { const v = l.intensity; undo.push(() => { l.intensity = v; }); l.intensity = cfg.amb * Math.PI; } }
  const mk = (dir, int, col) => { const L = new THREE.DirectionalLight(col, int * Math.PI); L.userData.l106 = 1; L.position.copy(tgt).add(new THREE.Vector3(...dir).normalize().multiplyScalar(6 * u));
    L.target.position.copy(tgt); scene.add(L); scene.add(L.target); L.target.updateMatrixWorld(); add.push(L); return L; };
  const a = cfg.az * Math.PI / 180, e = cfg.el * Math.PI / 180, ux = Math.cos(a), uz = Math.sin(a);
  const k = mk([-ux * Math.cos(e), Math.sin(e), -uz * Math.cos(e)], cfg.key, 0xfff0dc); mk(cfg.fillDir, cfg.fill, 0xdfe4f0); mk(cfg.rimDir, cfg.rim, 0xffe2b8);
  k.castShadow = true; k.shadow.mapSize.set(1024, 1024); const C = k.shadow.camera; C.left = -2.4 * u; C.right = 2.4 * u; C.top = 2.4 * u; C.bottom = -2.4 * u; C.near = 0.1 * u; C.far = 20 * u;
  C.layers.mask = 0xffffffff; C.updateProjectionMatrix(); k.shadow.bias = -0.0005; k.shadow.radius = 2;
  const seen = new Set(); for (const o of base || []) o.traverse(m => { if (!m.isMesh) return; for (const mt of [].concat(m.material || [])) { if (!mt || !mt.color || seen.has(mt)) continue; seen.add(mt);
    const c = mt.color.clone(); undo.push(() => mt.color.copy(c)); mt.color.multiplyScalar(cfg.baseK == null ? 1 : cfg.baseK); } });
  return () => { for (const L of add) { scene.remove(L); scene.remove(L.target); try { if (L.shadow && L.shadow.map) L.shadow.map.dispose(); } catch (x) {} } for (const f of undo.reverse()) f(); };
}
let R2 = null;
/* one shadow cell: o = {casters: [Object3D], hide: [Object3D], noCast: [Mesh], planeY, cam (an orthographic camera), S (px), ss} → a canvas S/ss px */
export function shadowCell(THREE, scene, o) {
  if (!R2) { R2 = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); R2.outputColorSpace = THREE.SRGBColorSpace; R2.setClearColor(0x000000, 0); R2.setPixelRatio(1);
    R2.shadowMap.enabled = true; R2.shadowMap.type = THREE.PCFSoftShadowMap; }
  /* v1.08c: test BOTH sides. A new WebGLRenderer's canvas is 300x150, so a cell of S = 300 (moechus, valencia) skipped setSize and rendered
     into a 300x150 buffer: the shadow cell came out 56x18 with its anchor outside it (committed 58x28, 2026-10-18 report). */
  if (R2.domElement.width !== o.S || R2.domElement.height !== o.S) R2.setSize(o.S, o.S, false);
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ opacity: 1, color: 0x000000 })); plane.scale.set(o.planeW, o.planeW, 1); plane.rotation.x = -Math.PI / 2; plane.position.y = o.planeY; plane.receiveShadow = true;
  const keep = []; for (const h of o.hide || []) { keep.push([h, 'v', h.visible]); h.visible = false; }
  const mats = new Map(); for (const root of o.casters) root.traverse(m => { if (!m.isMesh) return; const nc = (o.noCast || []).includes(m); keep.push([m, 'c', m.castShadow]); m.castShadow = !nc;
    for (const mt of [].concat(m.material || [])) if (mt && !mats.has(mt)) { mats.set(mt, [mt.colorWrite, mt.depthWrite]); mt.colorWrite = false; mt.depthWrite = false; } });
  scene.add(plane); let c;
  try { R2.render(scene, o.cam); c = document.createElement('canvas'); c.width = c.height = o.S; c.getContext('2d').drawImage(R2.domElement, 0, 0);
    for (let k = o.ss; k > 1; k /= 2) { const h2 = document.createElement('canvas'); h2.width = Math.ceil(c.width / 2); h2.height = Math.ceil(c.height / 2); const g = h2.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, 0, h2.width, h2.height); c = h2; } }
  finally { scene.remove(plane); plane.geometry.dispose(); plane.material.dispose(); for (const k of keep) { if (k[1] === 'v') k[0].visible = k[2]; else k[0].castShadow = k[2]; } for (const [m, v] of mats) { m.colorWrite = v[0]; m.depthWrite = v[1]; } }
  return c;
}
/* the shadow camera for a cell camera: same 30° view, wider (the cast leans lower right), anchor = (0, planeY, 0) */
export function shadowCam(THREE, tgt, hw, d) { const cam = new THREE.OrthographicCamera(-hw, hw, hw, -hw, 0.01 * d / 10, 5 * d), el = 30 * Math.PI / 180;
  cam.position.set(tgt.x, tgt.y + Math.sin(el) * d, tgt.z + Math.cos(el) * d); cam.lookAt(tgt); cam.updateMatrixWorld(); cam.updateProjectionMatrix(); return cam; }
/* crop rows of 8 shadow cells (uniform cell, like 312's minis8 parts) round the anchor; w, h even → {canvas, meta:[w,h,ax,ay,n]} */
export function crop(rows, AX, AY) {
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (const row of rows) for (const c of row) { const W = c.width, d = c.getContext('2d').getImageData(0, 0, W, c.height).data;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 4) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
  if (x1 < 0) { x0 = Math.floor(AX); y0 = Math.floor(AY); x1 = x0 + 1; y1 = y0 + 1; }
  x0 = Math.max(0, x0 - 2); y0 = Math.max(0, y0 - 2); x1 += 3; y1 += 3; let w = x1 - x0, h = y1 - y0; w += w & 1; h += h & 1;
  const out = document.createElement('canvas'); out.width = w * 8; out.height = h * rows.length; const g = out.getContext('2d'); g.filter = 'blur(0.5px)';
  rows.forEach((row, j) => row.forEach((c, i) => { g.save(); g.beginPath(); g.rect(i * w, j * h, w, h); g.clip(); g.drawImage(c, x0, y0, w, h, i * w, j * h, w, h); g.restore(); }));
  return { canvas: out, meta: [w, h, +(AX - x0).toFixed(1), +(AY - y0).toFixed(1), rows.length] };
}
