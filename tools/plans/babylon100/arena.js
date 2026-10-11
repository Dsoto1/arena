/* babylon100/arena.js — LOOK-ONLY mock-up: the Flavius Rule arena (Roma) drawn LIVE in Babylon.js 9.27.1.
   Nothing here touches the game. Units = TILES (1 tile = 31.75 mm of the mini), y up; board tile (r,c) centre = (c-6, 0, 6-r):
   row 0 / col 0 = the FAR walls (Flavius's box in the far corner), (12,12) = the near corner with the stairs (the game's view).
   URL flags (for the screenshot/measure scripts): ?night=1 · ?persp=1 · ?zoom=close · ?noui=1 · ?shadows=0 · ?crowd=0 · ?outline=0 */
(function () {
  const Q = new URLSearchParams(location.search), flag = (k, d) => (Q.has(k) ? Q.get(k) !== '0' : d);
  if (flag('noui', false)) document.body.classList.add('noui');
  const canvas = document.getElementById('cv');
  const engine = new BABYLON.Engine(canvas, true, { stencil: true, preserveDrawingBuffer: true, antialias: true }, false);
  engine.setHardwareScalingLevel(1 / Math.min(2, window.devicePixelRatio || 1));   /* crisp up to dpr 2, like the game's canvas cap */
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.80, 0.87, 0.93, 1);
  const V3 = (x, y, z) => new BABYLON.Vector3(x, y, z), C3 = (h) => BABYLON.Color3.FromHexString(h);
  const tile = (r, c) => V3(c - 6, 0, 6 - r);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;   /* cosmetic, fixed so every shot matches */
  const MATS = [];
  const mat = (name, hex, o = {}) => { const m = new BABYLON.StandardMaterial(name, scene); m.diffuseColor = C3(hex); m.specularColor = new BABYLON.Color3(o.spec || 0.04, o.spec || 0.04, o.spec || 0.04);
    if (o.tex) m.diffuseTexture = o.tex; if (o.emis) m.emissiveColor = C3(o.emis); m.maxSimultaneousLights = 12; MATS.push(m); return m; };

  /* ---------- lights: warm sun upper left, sky fill; shadows ---------- */
  const hemi = new BABYLON.HemisphericLight('sky', V3(0.2, 1, -0.3), scene); hemi.intensity = 0.62; hemi.diffuse = C3('#fff1dc'); hemi.groundColor = C3('#8a7458');
  const sun = new BABYLON.DirectionalLight('sun', V3(0.55, -1, -0.25).normalize(), scene); sun.position = V3(-20, 30, 12); sun.intensity = 1.55; sun.diffuse = C3('#ffe2b8');
  const SHADOWS = flag('shadows', true);
  const sg = SHADOWS ? new BABYLON.ShadowGenerator(2048, sun) : null;
  if (sg) { sg.usePercentageCloserFiltering = true; sg.filteringQuality = BABYLON.ShadowGenerator.QUALITY_MEDIUM; sg.bias = 0.0015; sg.normalBias = 0.01; sg.darkness = 0.32;
    sun.shadowMinZ = 1; sun.shadowMaxZ = 80; sun.autoUpdateExtends = false; sun.orthoLeft = -17; sun.orthoRight = 17; sun.orthoTop = 17; sun.orthoBottom = -17; }
  const cast = (m) => { if (sg) sg.addShadowCaster(m, true); };

  /* ---------- textures ---------- */
  const trav = new BABYLON.Texture('../look100/arena2_tex/6_roma.webp', scene);   /* look100 round 2: Roma's Colosseum travertine */
  const sandTex = (() => {   /* the sand: 13×13 tiles, pale Roma sand, grain, tile bevels, grid, a few scars + blood (painted once) */
    const N = 2048, P = N / 13, t = new BABYLON.DynamicTexture('sand', { width: N, height: N }, scene, true), g = t.getContext();
    for (let r = 0; r < 13; r++) for (let c = 0; c < 13; c++) { const v = (rnd() - 0.5) * 14 + ((r + c) % 2 ? 4 : -4); g.fillStyle = `rgb(${232 + v},${218 + v},${190 + v})`; g.fillRect(c * P, r * P, P, P);
      g.fillStyle = 'rgba(255,250,235,.35)'; g.fillRect(c * P + 3, r * P + 3, P - 6, 3); g.fillRect(c * P + 3, r * P + 3, 3, P - 6);
      g.fillStyle = 'rgba(120,96,60,.18)'; g.fillRect(c * P + 3, r * P + P - 6, P - 6, 3); g.fillRect(c * P + P - 6, r * P + 3, 3, P - 6); }
    for (let i = 0; i < 90000; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(120,96,60,.16)' : 'rgba(255,248,230,.20)'; g.fillRect(rnd() * N, rnd() * N, 1 + rnd() * 2, 1 + rnd() * 2); }
    g.strokeStyle = 'rgba(90,70,45,.55)'; g.lineWidth = 2.2; for (let i = 0; i <= 13; i++) { g.beginPath(); g.moveTo(i * P, 0); g.lineTo(i * P, N); g.stroke(); g.beginPath(); g.moveTo(0, i * P); g.lineTo(N, i * P); g.stroke(); }
    g.strokeStyle = 'rgba(110,84,52,.35)'; g.lineWidth = 3; for (let i = 0; i < 14; i++) { const x = rnd() * N, y = rnd() * N; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 40, y + 20, x + 80, y - 30, x + 120 * rnd() + 40, y + 60 * rnd()); g.stroke(); }
    const blood = (x, y, s) => { g.fillStyle = 'rgba(120,16,12,.75)'; for (let i = 0; i < 18; i++) { g.beginPath(); g.ellipse(x + (rnd() - .5) * s, y + (rnd() - .5) * s * .6, s * (.08 + rnd() * .22), s * (.05 + rnd() * .12), rnd() * 3, 0, 7); g.fill(); } };
    blood(9.4 * P, 10.6 * P, P * 0.9); blood(3.5 * P, 5.4 * P, P * 0.6);
    t.update(true); t.anisotropicFilteringLevel = 8; return t;
  })();
  const flavTex = new BABYLON.Texture('../../../assets/flavmood_calm.webp', scene);

  /* ---------- static geometry, merged per material at the end ---------- */
  const GROUPS = {};
  const put = (key, m) => { (GROUPS[key] = GROUPS[key] || []).push(m); return m; };
  const TK = 1 / 1.6;   /* travertine texture repeat: one 512 px tile per 1.6 tiles */
  const box = (key, w, h, d, x, y, z, o = {}) => {   /* y = bottom; face UVs scaled to the box so the stone keeps its size */
    const fu = [V4(w, h), V4(w, h), V4(d, h), V4(d, h), V4(w, d), V4(w, d)];
    const m = BABYLON.MeshBuilder.CreateBox('b', { width: w, height: h, depth: d, faceUV: fu }, scene); m.position.set(x, y + h / 2, z); if (o.ry) m.rotation.y = o.ry; return put(key, m);
  };
  function V4(a, b) { return new BABYLON.Vector4(0, 0, a * TK, b * TK); }
  const M = {
    stone: mat('travertine', '#f0e2c6', { tex: trav }), stoneDark: mat('travertineDark', '#b8a580', { tex: trav }), red: mat('redCap', '#9c2b20'), cushion: mat('cushion', '#8e2a22'),
    bench: mat('bench', '#e8d7b6', { tex: trav }), gilt: mat('gilt', '#d2a54a', { spec: 0.5 }), bronze: mat('bronze', '#9a6a2c', { spec: 0.35 }), iron: mat('iron', '#4a4a4e', { spec: 0.3 }),
    clay: mat('clay', '#b0603a'), wood: mat('wood', '#6b4628'), purple: mat('purple', '#5a2a5e'), dark: mat('dark', '#2a2420'), plaza: mat('plaza', '#cdb991', { tex: trav }),
  };
  M.plaza.diffuseTexture = trav.clone(); M.plaza.diffuseTexture.uScale = M.plaza.diffuseTexture.vScale = 40;

  /* the sand */
  const sand = BABYLON.MeshBuilder.CreateGround('sand', { width: 13, height: 13 }, scene); const sandM = mat('sandM', '#ffffff', { tex: sandTex }); sand.material = sandM; sand.receiveShadows = true;
  /* the plaza far below, so the camera never sees the void */
  const plaza = BABYLON.MeshBuilder.CreateGround('plaza', { width: 120, height: 120 }, scene); plaza.position.y = -3.2; plaza.material = M.plaza; plaza.receiveShadows = true;
  /* foundation + gully under the sand edge */
  box('stoneDark', 14.0, 0.5, 14.0, 0, -0.52, 0);

  const E = 6.5, G = 0.32;   /* sand half-size, gully width */
  /* FAR sides (row 0 at z=+E, col 0 at x=-E): podium wall with the red cap, then the stands climbing away */
  const FAR_H = 1.0, TIERS = 8, TD = 0.48, TR = 0.34;
  for (const side of ['n', 'w']) {
    const along = (a, h, d, off, y, key) => side === 'n' ? box(key, a, h, d, -0.5 * G, y, E + G + off + d / 2) : box(key, d, h, a, -(E + G + off + d / 2), y, 0.5 * G);
    along(2 * E + 2 * G + 0.6, FAR_H, 0.34, 0, -0.06, 'stone');
    along(2 * E + 2 * G + 0.6, 0.08, 0.40, -0.03, FAR_H - 0.06, 'red');
    for (let t = 0; t < TIERS; t++) { const off = 0.34 + t * TD, y = FAR_H + t * TR, len = 2 * E + 2 * G + 0.6 + 2 * (off + TD);
      along(len, TR, TD, off, y - 0.06, 'bench'); along(len, 0.07, TD * 0.62, off + TD * 0.38, y + TR - 0.06, 'cushion'); }
    along(2 * E + 2 * G + 0.6 + 2 * (0.34 + TIERS * TD + 0.5), FAR_H + TIERS * TR + 1.1, 0.5, 0.34 + TIERS * TD, -0.06, 'stone');   /* the outer arcade wall */
  }
  /* NEAR sides (row 12 at z=-E, col 12 at x=+E): the cut-down wall (Hc ≈ 0.16 tile) + its red lip, the GILT RAIL on piers, stands stepping DOWN */
  const HC = 0.16;
  for (const side of ['s', 'e']) {
    const along = (a, h, d, off, y, key) => side === 's' ? box(key, a, h, d, 0.5 * G, y, -(E + G + off + d / 2)) : box(key, d, h, a, E + G + off + d / 2, y, -0.5 * G);
    along(2 * E + 2 * G + 0.6, HC + 0.06, 0.30, 0, -0.06, 'stone');
    along(2 * E + 2 * G + 0.6, 0.05, 0.34, -0.02, HC, 'red');
    for (let t = 0; t < 7; t++) { const off = 0.30 + t * TD, y = -0.26 - t * 0.3, len = 2 * E + 2 * G + 0.6 + 2 * (off + TD);
      along(len, 0.3, TD, off, y, 'bench'); along(len, 0.07, TD * 0.62, off + TD * 0.38, y + 0.3, 'cushion'); }
    /* gilt rail: two bars + a knobbed post every half tile; a gap at the stairway (the middle of each side); stone piers at the ends */
    const L = E + G;
    for (const [a0, a1] of [[-L + 0.25, -0.75], [0.75, L - 0.25]]) {
      const len = a1 - a0, mid = (a0 + a1) / 2, rp = (y, h) => side === 's' ? box('gilt', len, h, 0.035, mid, y, -(E + 0.18)) : box('gilt', 0.035, h, len, E + 0.18, y, -mid);
      rp(HC + 0.30, 0.035); rp(HC + 0.14, 0.02);
      for (let a = a0; a <= a1 + 1e-6; a += 0.5) { const p = side === 's' ? V3(a, 0, -(E + 0.18)) : V3(E + 0.18, 0, -a);
        box('gilt', 0.03, 0.32, 0.03, p.x, HC + 0.02, p.z); const k = put('gilt', BABYLON.MeshBuilder.CreateSphere('k', { diameter: 0.07, segments: 6 }, scene)); k.position.set(p.x, HC + 0.37, p.z); }
      for (const a of [a0 - 0.12, a1 + 0.12]) { const p = side === 's' ? V3(a, 0, -(E + 0.18)) : V3(E + 0.18, 0, -a); box('stone', 0.2, 0.46, 0.2, p.x, HC, p.z); box('stone', 0.26, 0.06, 0.26, p.x, HC + 0.46, p.z); }
    }
  }
  /* the stairs at the near corner + corner towers at the side corners (look100 round 2: plinth to the walkway) */
  for (let s = 0; s < 7; s++) box('bench', 2.2, 0.26, 0.38, E + 0.9 + s * 0.27, -0.3 - s * 0.26, -E - 0.9 - s * 0.27, { ry: Math.PI / 4 });
  const towers = [V3(E + 0.55, 0, E + 0.55), V3(-E - 0.55, 0, -E - 0.55)];
  for (const p of towers) { box('stone', 1.3, 2.5, 1.3, p.x, -0.6, p.z); box('red', 1.42, 0.12, 1.42, p.x, 1.9, p.z); box('stoneDark', 1.5, 0.18, 1.5, p.x, -0.75, p.z);
    const br = put('bronze', BABYLON.MeshBuilder.CreateCylinder('brazier', { height: 0.3, diameterTop: 0.5, diameterBottom: 0.18, tessellation: 12 }, scene)); br.position.set(p.x, 2.17, p.z); }
  /* Flavius's box in the far corner: podium, four columns, a purple canopy, his painted face */
  const FB = V3(-E - 1.2, 0, E + 1.2);
  box('stone', 2.4, 2.4, 2.4, FB.x, -0.06, FB.z, { ry: Math.PI / 4 });
  for (const [dx, dz] of [[-0.8, 0], [0.8, 0], [0, -0.8], [0, 0.8]]) { const c = put('stone', BABYLON.MeshBuilder.CreateCylinder('col', { height: 1.6, diameter: 0.16, tessellation: 10 }, scene)); c.position.set(FB.x + dx, 3.14, FB.z + dz); }
  box('purple', 2.3, 0.18, 2.3, FB.x, 3.94, FB.z, { ry: Math.PI / 4 });

  /* pillars (Democritus: PILLARS in 02-data) as instances of ONE fluted column + base + capital; a clay pot on each */
  const PILLARS = [[0, 6], [2, 2], [2, 10], [4, 4], [4, 8], [6, 0], [6, 12], [8, 4], [8, 8], [10, 2], [10, 10], [12, 6]];
  const pillar = (() => { const parts = [BABYLON.MeshBuilder.CreateCylinder('shaft', { height: 1.25, diameterTop: 0.36, diameterBottom: 0.4, tessellation: 16 }, scene),
    BABYLON.MeshBuilder.CreateCylinder('pbase', { height: 0.14, diameter: 0.56, tessellation: 16 }, scene), BABYLON.MeshBuilder.CreateBox('cap', { width: 0.54, height: 0.12, depth: 0.54 }, scene)];
    parts[0].position.y = 0.14 + 0.625; parts[1].position.y = 0.07; parts[2].position.y = 0.14 + 1.25 + 0.06;
    const m = BABYLON.Mesh.MergeMeshes(parts, true, true); m.material = mat('pillarM', '#ece0c8', { tex: trav }); return m; })();
  const pot = (() => { const sh = [[0, 0], [0.09, 0], [0.13, 0.05], [0.16, 0.14], [0.14, 0.24], [0.07, 0.3], [0.06, 0.36], [0.09, 0.38], [0, 0.38]].map(([x, y]) => V3(x, y, 0));
    const m = BABYLON.MeshBuilder.CreateLathe('pot', { shape: sh, tessellation: 16 }, scene); m.material = M.clay; return m; })();
  PILLARS.forEach(([r, c], i) => { const p = tile(r, c); const a = pillar.createInstance('pillar' + i); a.position.copyFrom(p); cast(a);
    for (let k = 0; k < (i % 3) + 1; k++) { const b = pot.createInstance('pot' + i + k); b.position.set(p.x + (k - ((i % 3) / 2)) * 0.15, 1.51, p.z + (k % 2) * 0.08); b.scaling.setAll(0.8); cast(b); } });
  pillar.setEnabled(false); pot.setEnabled(false);
  /* spike caps (SPIKE_SPOTS): a bronze sewer cap with 7 iron spikes, as instances */
  const spike = (() => { const parts = [BABYLON.MeshBuilder.CreateCylinder('disc', { height: 0.05, diameter: 0.74, tessellation: 24 }, scene)];
    for (let i = 0; i < 7; i++) { const a = i / 6 * Math.PI * 2, rr = i === 6 ? 0 : 0.2; const s = BABYLON.MeshBuilder.CreateCylinder('sp', { height: 0.2, diameterTop: 0, diameterBottom: 0.07, tessellation: 6 }, scene); s.position.set(Math.cos(a) * rr, 0.12, Math.sin(a) * rr); parts.push(s); }
    parts[0].position.y = 0.02; const m = BABYLON.Mesh.MergeMeshes(parts, true, true); m.material = M.iron; return m; })();
  [[3, 6], [6, 3], [6, 9], [9, 6]].forEach(([r, c], i) => { const s = spike.createInstance('spike' + i); s.position.copyFrom(tile(r, c)); cast(s); }); spike.setEnabled(false);
  /* tunnel trapdoors (TUNNELS) */
  const door = BABYLON.MeshBuilder.CreateBox('door', { width: 0.8, height: 0.03, depth: 0.8 }, scene); door.material = M.wood;
  [[3, 3], [3, 9], [9, 3], [9, 9]].forEach(([r, c], i) => { const d = door.createInstance('door' + i); d.position.copyFrom(tile(r, c)); d.position.y = 0.015; }); door.setEnabled(false);
  /* the Arena Chest in the middle */
  { const p = tile(6, 6); box('wood', 0.5, 0.28, 0.34, p.x, 0, p.z); const lid = put('wood', BABYLON.MeshBuilder.CreateCylinder('lid', { height: 0.5, diameter: 0.34, tessellation: 12, arc: 0.5 }, scene));
    lid.rotation.z = Math.PI / 2; lid.rotation.x = -Math.PI / 2; lid.position.set(p.x, 0.28, p.z); for (const dx of [-0.17, 0, 0.17]) box('bronze', 0.04, 0.3, 0.36, p.x + dx, 0, p.z); }
  /* start corners: a coloured quarter mark in each corner tile */
  const PCOL = ['#c8322a', '#2f6fcf', '#3a9a3e', '#d6a520'];
  [[12, 12], [12, 0], [0, 0], [0, 12]].forEach(([r, c], i) => { const d = BABYLON.MeshBuilder.CreateDisc('start' + i, { radius: 0.42, tessellation: 24 }, scene); d.rotation.x = Math.PI / 2; d.position.copyFrom(tile(r, c)); d.position.y = 0.004;
    const m = mat('startM' + i, PCOL[i]); m.alpha = 0.35; d.material = m; });

  /* banners on poles on the far walls + the tower braziers' flames (torches at night) */
  const banners = [];
  [['#c9a227', -3.2, 'n'], ['#5a3a8a', 3.2, 'n'], ['#3f7d3c', -3.2, 'w'], ['#c55a1e', 3.2, 'w']].forEach(([col, a, side]) => {
    const base = side === 'n' ? V3(a, 0, E + G + 0.35 + TIERS * TD + 0.2) : V3(-(E + G + 0.35 + TIERS * TD + 0.2), 0, a);
    const pole = put('wood', BABYLON.MeshBuilder.CreateCylinder('pole', { height: 2.4, diameter: 0.06, tessellation: 6 }, scene)); pole.position.set(base.x, FAR_H + TIERS * TR + 2.2, base.z);
    const b = BABYLON.MeshBuilder.CreatePlane('banner', { width: 0.7, height: 1.1, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene); b.position.set(base.x, FAR_H + TIERS * TR + 2.6, base.z); b.rotation.y = side === 'n' ? 0 : Math.PI / 2;
    b.material = mat('bannerM', col, { emis: '#000000' }); banners.push(b); cast(b); });
  const fireM = mat('fire', '#ff9a2e', { emis: '#ff7a18' }); fireM.disableLighting = true;
  const TORCHES = [...towers.map(p => V3(p.x, 2.42, p.z)), V3(-E - 0.45, 1.25, -2.5), V3(-E - 0.45, 1.25, 2.5), V3(-2.5, 1.25, E + 0.45), V3(2.5, 1.25, E + 0.45), V3(E + 0.42, 0.62, 3), V3(-3, 0.62, -E - 0.42)];
  const flames = TORCHES.map((p, i) => { if (i >= 2) { const s = put('iron', BABYLON.MeshBuilder.CreateCylinder('torch', { height: p.y < 1 ? 0.45 : 0.4, diameterTop: 0.12, diameterBottom: 0.04, tessellation: 8 }, scene)); s.position.set(p.x, p.y - 0.2, p.z); }
    const f = BABYLON.MeshBuilder.CreateCylinder('flame', { height: 0.28, diameterTop: 0, diameterBottom: 0.2, tessellation: 8 }, scene); f.position.set(p.x, p.y + 0.12, p.z); f.material = fireM; return f; });
  const torchLights = TORCHES.map((p, i) => { const l = new BABYLON.PointLight('torch' + i, V3(p.x, p.y + 0.35, p.z), scene); l.diffuse = C3('#ff9a48'); l.specular = C3('#000000'); l.range = 7.5; l.intensity = 0; l.setEnabled(false); return l; });

  /* merge the static pieces: one mesh per material */
  const STATIC = [];
  for (const [k, list] of Object.entries(GROUPS)) { const m = BABYLON.Mesh.MergeMeshes(list, true, true); m.material = M[k]; m.receiveShadows = true; m.freezeWorldMatrix(); STATIC.push(m); cast(m); }
  const face = BABYLON.MeshBuilder.CreatePlane('flavius', { width: 1.0, height: 1.0 }, scene); face.position.set(FB.x + 0.55, 2.95, FB.z - 0.55); face.rotation.y = Math.PI * 0.75;
  const faceM = mat('faceM', '#ffffff', { tex: flavTex }); faceM.emissiveColor = C3('#3a3530'); face.material = faceM;
  /* a crowd: ONE mesh (body + head), thin-instanced over the stands with a colour per spectator (1 draw call) */
  const CROWD = flag('crowd', true) ? (() => {
    const body = BABYLON.MeshBuilder.CreateCapsule('cb', { height: 0.42, radius: 0.1, tessellation: 8, subdivisions: 1 }, scene); body.position.y = 0.21;
    const head = BABYLON.MeshBuilder.CreateSphere('ch', { diameter: 0.15, segments: 6 }, scene); head.position.y = 0.5;
    const m = BABYLON.Mesh.MergeMeshes([body, head], true, true); const cm = mat('crowdM', '#ffffff'); m.material = cm;
    const mats = [], cols = []; const tunic = ['#e9e1cf', '#c7b28a', '#8e2a22', '#5a6e8a', '#6b7d3c', '#a0603a', '#d8c27a', '#7a5a9a', '#f0ece2'];
    const add = (x, y, z) => { if (rnd() < 0.42) return; const s = 0.85 + rnd() * 0.3; mats.push(...BABYLON.Matrix.Compose(V3(s, s, s), BABYLON.Quaternion.Identity(), V3(x, y, z)).toArray()); const c = C3(tunic[(rnd() * tunic.length) | 0]); cols.push(c.r, c.g, c.b, 1); };
    for (const side of ['n', 'w']) for (let t = 0; t < TIERS; t++) { const off = E + G + 0.34 + t * TD + TD * 0.32, y = FAR_H + t * TR + TR - 0.06; for (let a = -E - 0.4 - t * 0.48; a <= E + 0.4 + t * 0.48; a += 0.3) side === 'n' ? add(a, y, off) : add(-off, y, a); }
    for (const side of ['s', 'e']) for (let t = 1; t < 7; t++) { const off = E + G + 0.30 + t * TD + TD * 0.32, y = -0.26 - t * 0.3 + 0.3; for (let a = -E - 0.4 - t * 0.48; a <= E + 0.4 + t * 0.48; a += 0.3) { if (Math.abs(a) < 0.9) continue; side === 's' ? add(a, y, -off) : add(off, y, -a); } }
    m.thinInstanceSetBuffer('matrix', new Float32Array(mats), 16); m.thinInstanceSetBuffer('color', new Float32Array(cols), 4); cm.diffuseColor = new BABYLON.Color3(1, 1, 1);
    m.receiveShadows = true; cast(m); return { mesh: m, n: mats.length / 16 }; })() : null;

  /* ---------- the pieces: glTF baked from the real rig92 engine (export.js) ---------- */
  const tokM = mat('tokM', '#ffffff', { spec: 0.08 });
  const GLADS = [['murmillo', 11, 10, PCOL[0]], ['thraex', 5, 2, PCOL[1]], ['royalty', 2, 7, PCOL[2]], ['venatore', 8, 6, PCOL[3]]];
  const BEASTS = [['leo', 5, 7], ['ursa', 7, 3]];
  const OUTLINE = flag('outline', true);
  const pieces = [];
  function baseDisc(w, d, rim, ring) {   /* his base: sand top, coloured rim, a seat-colour ring on the sand for gladiators */
    const b = BABYLON.MeshBuilder.CreateCylinder('base', { height: 0.1, diameterTop: 1, diameterBottom: 1.04, tessellation: 32 }, scene); b.scaling.set(w, 1, d); b.position.y = 0.05; b.material = mat('rimM', rim); cast(b); b.receiveShadows = true;
    if (ring) { const t = BABYLON.MeshBuilder.CreateTorus('ring', { diameter: w + 0.08, thickness: 0.05, tessellation: 32 }, scene); t.position.y = 0.035; const rm = mat('ringM', ring, { emis: ring }); rm.emissiveColor.scaleInPlace(0.35); t.material = rm; return [b, t]; }
    return [b];
  }
  async function load(file) { const r = await BABYLON.SceneLoader.ImportMeshAsync('', 'models/', file, scene); return r.meshes; }
  async function loadPieces() {
    for (const [k, r, c, col] of GLADS) {
      const ms = await load(`glad_${k}.glb`); const root = new BABYLON.TransformNode('g_' + k, scene); ms[0].parent = root; const mesh = ms.find(m => m.getTotalVertices && m.getTotalVertices() > 0);
      mesh.material = tokM; mesh.receiveShadows = true; if (OUTLINE) { mesh.renderOutline = true; mesh.outlineWidth = 0.012; mesh.outlineColor = C3('#120c0a'); } cast(mesh);
      const p = tile(r, c); root.position.copyFrom(p); root.position.y = 0.1; root.rotation.y = Math.atan2(-p.x, -p.z) + Math.PI;
      for (const o of baseDisc(0.8, 0.8, '#4b4636', col)) { o.position.x = p.x; o.position.z = p.z; }
      pieces.push({ k, mesh, mt: mesh.morphTargetManager && mesh.morphTargetManager.getTarget(0), ph: rnd() * 6.28 });
    }
    for (const [k, r, c] of BEASTS) {
      const ms = await load(`beast_${k}.glb`); const root = new BABYLON.TransformNode('b_' + k, scene); ms[0].parent = root; const frames = ms.filter(m => m.getTotalVertices && m.getTotalVertices() > 0);
      frames.forEach((f, i) => { f.material = tokM; f.receiveShadows = true; if (OUTLINE) { f.renderOutline = true; f.outlineWidth = 0.012; f.outlineColor = C3('#120c0a'); } cast(f); f.setEnabled(i === 0); });
      const p = tile(r, c); root.position.copyFrom(p); root.position.y = 0.1; root.rotation.y = Math.atan2(-p.x, -p.z) + Math.PI;
      const meta = { leo: [1.1, 0.64, '#3a1a18'], ursa: [1.1, 0.69, '#7b2c17'] }[k]; const [b] = baseDisc(meta[1], meta[0], meta[2]); b.position.x = p.x; b.position.z = p.z; b.rotation.y = root.rotation.y;
      pieces.push({ k, frames, f: 0, ph: rnd() * 2 });
    }
  }

  /* ---------- camera: the game's 2:1 isometric view (orthographic, 30° elevation, looking along the board diagonal) ---------- */
  const ALPHA = -Math.PI / 4, BETA = Math.PI / 3;
  const cam = new BABYLON.ArcRotateCamera('cam', ALPHA, BETA, 60, V3(0, 0.2, 0), scene);
  cam.attachControl(canvas, true); cam.lowerBetaLimit = 0.35; cam.upperBetaLimit = 1.45; cam.minZ = 0.5; cam.maxZ = 400; cam.panningSensibility = 60; cam.wheelDeltaPercentage = 0.01;
  let ortho = !flag('persp', false), zoom = 1;   /* ortho half-height = 9.6 / zoom */
  const fitOrtho = () => { const h = 9.6 / zoom, a = engine.getRenderWidth() / engine.getRenderHeight(); const hh = a < 1 ? h * 1.0 / a * 0.62 : h; cam.orthoTop = hh; cam.orthoBottom = -hh; cam.orthoLeft = -hh * a; cam.orthoRight = hh * a; };
  function setCam(o) { ortho = o; if (ortho) { cam.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA; cam.lowerRadiusLimit = cam.upperRadiusLimit = 60; cam.radius = 60; fitOrtho(); }
    else { cam.mode = BABYLON.Camera.PERSPECTIVE_CAMERA; cam.fov = 0.55; cam.lowerRadiusLimit = 5; cam.upperRadiusLimit = 80; cam.radius = 36 / zoom; }
    document.getElementById('bCam').textContent = ortho ? 'Perspective' : 'Isometric'; }
  canvas.addEventListener('wheel', (e) => { if (!ortho) return; zoom = Math.max(0.6, Math.min(5, zoom * Math.exp(-e.deltaY * 0.0012))); fitOrtho(); e.preventDefault(); }, { passive: false });
  let pinch0 = 0; canvas.addEventListener('touchmove', (e) => { if (!ortho || e.touches.length !== 2) { pinch0 = 0; return; } const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); if (pinch0) { zoom = Math.max(0.6, Math.min(5, zoom * d / pinch0)); fitOrtho(); } pinch0 = d; }, { passive: true });
  function reset() { cam.alpha = ALPHA; cam.beta = BETA; cam.target = V3(0, 0.2, 0); zoom = 1; setCam(ortho); }
  setCam(ortho);
  if (Q.get('zoom') === 'close') { zoom = 3.6; cam.target = tile(11, 10).add(V3(-0.6, 0.55, 0.9)); setCam(ortho); }
  window.addEventListener('resize', () => { engine.resize(); if (ortho) fitOrtho(); });

  /* ---------- day / night (189-v91night: torches on the rim only, moonlit blue in the middle, pieces readable) ---------- */
  let night = false;
  function setNight(n) { night = n;
    scene.clearColor = n ? new BABYLON.Color4(0.05, 0.07, 0.14, 1) : new BABYLON.Color4(0.80, 0.87, 0.93, 1);
    hemi.intensity = n ? 0.30 : 0.62; hemi.diffuse = C3(n ? '#8ea4d8' : '#fff1dc'); hemi.groundColor = C3(n ? '#20202e' : '#8a7458');
    sun.intensity = n ? 0.55 : 1.55; sun.diffuse = C3(n ? '#9fb6ff' : '#ffe2b8'); if (sg) sg.darkness = n ? 0.45 : 0.32;
    torchLights.forEach(l => { l.setEnabled(n); l.intensity = n ? 1.6 : 0; }); flames.forEach(f => f.scaling.setAll(n ? 1.5 : 1));
    document.getElementById('bNight').textContent = n ? '☀ Day' : '☾ Night'; }
  setNight(flag('night', false));
  document.getElementById('bNight').onclick = () => setNight(!night); document.getElementById('bCam').onclick = () => setCam(!ortho); document.getElementById('bReset').onclick = reset;
  window.addEventListener('keydown', (e) => { if (e.key === 'n' || e.key === 'N') setNight(!night); if (e.key === 'p' || e.key === 'P') setCam(!ortho); if (e.key === 'r' || e.key === 'R') reset(); });

  /* ---------- readout ---------- */
  const inst = new BABYLON.SceneInstrumentation(scene); inst.captureFrameTime = true; inst.captureRenderTime = true;
  const hud = document.getElementById('hud'); let hudT = 0;
  const tris = () => (scene.getActiveIndices() / 3) | 0;
  window.MOCK = { scene, engine, inst, stats: () => ({ fps: +engine.getFps().toFixed(1), frameMs: +inst.frameTimeCounter.lastSecAverage.toFixed(2), renderMs: +inst.renderTimeCounter.lastSecAverage.toFixed(2),
    drawCalls: inst.drawCallsCounter.current, activeMeshes: scene.getActiveMeshes().length, tris: tris(), crowd: CROWD ? CROWD.n : 0, w: engine.getRenderWidth(), h: engine.getRenderHeight() }), setNight, setCam };

  /* ---------- the loop: idles (morph breathing / beast flipbook), torch flicker ---------- */
  scene.onBeforeRenderObservable.add(() => {
    const t = performance.now() / 1000;
    for (const p of pieces) { if (p.mt) p.mt.influence = 0.5 + 0.5 * Math.sin(t * 1.7 + p.ph);
      if (p.frames) { const f = Math.floor((t + p.ph) / 0.32) % p.frames.length; if (f !== p.f) { p.frames[p.f].setEnabled(false); p.frames[f].setEnabled(true); p.f = f; } } }
    if (night) torchLights.forEach((l, i) => { l.intensity = 1.45 + 0.25 * Math.sin(t * 9 + i * 2.1) + 0.12 * Math.sin(t * 23 + i); });
    if (t - hudT > 0.5) { hudT = t; const s = window.MOCK.stats(); hud.textContent = `Babylon ${BABYLON.Engine.Version} · ${engine.webGLVersion === 2 ? 'WebGL2' : 'WebGL1'}\n${s.fps} fps · frame ${s.frameMs} ms\ndraw calls ${s.drawCalls} · meshes ${s.activeMeshes}\ntris ${(s.tris / 1000).toFixed(0)}k · ${s.w}×${s.h}`; }
  });
  loadPieces().catch(e => { console.error(e); window.MOCK_ERR = String(e && e.stack || e); }).finally(() => {
    document.getElementById('load').remove(); scene.executeWhenReady(() => { let n = 0; scene.onAfterRenderObservable.add(() => { if (++n === 10) window.MOCK_READY = true; }); }); });
  engine.runRenderLoop(() => scene.render());
})();
