/* =====================================================================
   tools/art/amph111/scene.js — THE AMPHITHEATRE (v1.11 art, his concept 2026-10-22): the procedural 3D surround around the board.
   Plain script for tools/art/amph111/amph111.html (window.AMPH111_BUILD(THREE, TEX, opt) → {scene, lights, meta}); make.js drives it.
   NOTHING here runs in the game: the game only gets the baked layers (assets/amph111_*.webp).

   WORLD = the board's own grid: X = column c, Z = row r, 1 unit = 1 tile edge, Y up (1 unit of height = 0.612 TW on screen at the
   game's 2:1 projection). Tile (r,c) covers X c..c+1, Z r..r+1; the sand is Y = 0. The game's own drawing (sand, walls, the inner
   stands, Flavius's podium and banner, its corner towers and stairs) fills the FOOTPRINT square [E0, E1]² (192's outline: tile centres
   −2.95 … 14.95, i.e. X/Z −2.45 … 15.45; the grand 4-tier arenas +0.47 a side) — the surround starts there and frames it.
   Sides (seen on screen): farL = top-left (c = E0, outward −X), farR = top-right (r = E0, outward −Z), nearL = bottom-left (r = E1,
   outward +Z), nearR = bottom-right (c = E1, outward +X). The far sides carry the upper seating (8 rows, a top gallery, the attic);
   the near sides (pass 7, his front picture) are a carved façade straight under the stands down to the ground — arched doorways,
   piers with banners, cypress + ivy — with nothing in front of it (the game's background shows). Flavius's box at the top corner, the
   grand stair between two pillars with the big braziers and two lions at the bottom corner, corner towers left and right. The stair's
   pillars, braziers and their banners are also baked as the 'front' coverage mask (userData.front): 419 paints them again over the
   game's stands corner.
   Every mesh carries userData.layer: 'stone' | 'bench' | 'cloth' (baked as luminance, tinted per arena in the game) | 'fixed'
   (own colours) | 'fire' (flames, emissive) | 'hold' (the game's footprint: depth only, never in a layer).
   ===================================================================== */
window.AMPH111_BUILD = function (THREE, TEX, opt) {
  opt = opt || {};
  const VAR = opt.variant || 'p7';                           /* pass 8 mock-up: 'p7' (approved pass 7, reproducible) | 'city' (his 1a) | 'ground' (his fallback c) */
  const E0 = -2.45, E1 = 15.45, GX = 0.47, M = 6.5;          /* footprint (3-tier), the grand arenas' extra, the board's middle */
  const e0 = E0 - GX, e1 = E1 + GX, LH = (e1 - e0) / 2;      /* the grand outline: everything built outside it */
  const GROUND = -2.6;                                       /* the ground around the building (near side cut-away) */
  const scene = new THREE.Scene();
  const meta = { lights: [], E0, E1, GX, GROUND };
  /* ---------- seeded randomness (the bake is deterministic) ---------- */
  let seed = 1234567; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  /* ---------- geometry buckets: merged per material, world-space box UVs ---------- */
  const BK = {};
  const UVS = { pave: 5, stone: 4.4, stoneN: 4.4, stoneF: 4.4, bench: 4.4, cloth: 1, wood: 1.6, brick: 2.2, ground: 14, dark: 4, iron: 1, gold: 1, bronze: 1, red: 1, skin: 1, plaster: 4.4, hold: 1, fire: 1, lion: 4.4, cushion: 4.4 };
  function boxUV(g, s) {
    const p = g.attributes.position, n = g.attributes.normal, uv = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i += 3) {
      /* one projection per triangle (face normal), so a face never tears */
      let nx = 0, ny = 0, nz = 0; for (let k = 0; k < 3; k++) { nx += n.getX(i + k); ny += n.getY(i + k); nz += n.getZ(i + k); }
      const ax = Math.abs(nx), ay = Math.abs(ny), az = Math.abs(nz);
      for (let k = 0; k < 3; k++) {
        const x = p.getX(i + k), y = p.getY(i + k), z = p.getZ(i + k); let u, v;
        if (ay >= ax && ay >= az) { u = x + z * 0.5; v = z - x * 0.5; } else if (ax >= az) { u = z; v = y; } else { u = x; v = y; }
        uv[(i + k) * 2] = u / s; uv[(i + k) * 2 + 1] = v / s;
      }
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  }
  function put(geom, key, m) {
    let g = geom.index ? geom.toNonIndexed() : geom.clone();
    if (m) g.applyMatrix4(m);
    if (!g.attributes.normal) g.computeVertexNormals();
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
    boxUV(g, UVS[key] || 4);
    (BK[key] = BK[key] || []).push(g);
    geom.dispose && geom !== g && 0;
  }
  function merge(list) {
    let n = 0; for (const g of list) n += g.attributes.position.count;
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2); let o = 0;
    for (const g of list) { P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); U.set(g.attributes.uv.array, o * 2); o += g.attributes.position.count; }
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(P, 3)); G.setAttribute('normal', new THREE.BufferAttribute(N, 3)); G.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    return G;
  }
  /* ---------- frames: local (x = along, y = up, z = outward) → world ---------- */
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const frame = (ex, ez, o) => new THREE.Matrix4().makeBasis(ex, V3(0, 1, 0), ez).setPosition(o);
  const SIDES = {
    farL: frame(V3(0, 0, 1), V3(-1, 0, 0), V3(e0, 0, M)),    /* +x → the left corner,  −x → the top corner */
    farR: frame(V3(-1, 0, 0), V3(0, 0, -1), V3(M, 0, e0)),   /* +x → the top corner,   −x → the right corner */
    nearL: frame(V3(1, 0, 0), V3(0, 0, 1), V3(M, 0, e1)),    /* +x → the bottom corner, −x → the left corner */
    nearR: frame(V3(0, 0, -1), V3(1, 0, 0), V3(e1, 0, M))    /* +x → the right corner,  −x → the bottom corner */
  };
  const S2 = Math.SQRT1_2;
  const DIAG = { /* the corners: x = across (right-handed with z outward along the diagonal) */
    top: frame(V3(-S2, 0, S2), V3(-S2, 0, -S2), V3(e0, 0, e0)),
    bottom: frame(V3(S2, 0, -S2), V3(S2, 0, S2), V3(e1, 0, e1)),
    left: frame(V3(S2, 0, S2), V3(-S2, 0, S2), V3(e0, 0, e1)),
    right: frame(V3(-S2, 0, -S2), V3(S2, 0, -S2), V3(e1, 0, e0))
  };
  const T = (F, x, y, z, ry, sx, sy, sz) => { const m = new THREE.Matrix4().compose(V3(x, y, z), new THREE.Quaternion().setFromAxisAngle(V3(0, 1, 0), ry || 0), V3(sx || 1, sy || 1, sz || 1)); return F ? F.clone().multiply(m) : m; };
  /* primitives in a frame */
  const box = (F, key, x0, x1, y0, y1, z0, z1) => put(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), key, T(F, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2));
  const cyl = (F, key, x, y0, y1, z, r0, r1, seg) => put(new THREE.CylinderGeometry(r1, r0, y1 - y0, seg || 14), key, T(F, x, (y0 + y1) / 2, z));
  const lathe = (F, key, x, y, z, prof, seg, s) => { const g = new THREE.LatheGeometry(prof.map(([r, h]) => new THREE.Vector2(r, h)), seg || 16); put(g, key, T(F, x, y, z, 0, s || 1, s || 1, s || 1)); };
  /* a polygon (x,z) footprint extruded from y0 to y1 */
  function prism(F, key, pts, y0, y1) {
    const sh = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, z)));
    const g = new THREE.ExtrudeGeometry(sh, { depth: y1 - y0, bevelEnabled: false });
    g.rotateX(Math.PI / 2); g.translate(0, y1, 0);           /* shape y → z, extrusion → down from y1 */
    put(g, key, F);
  }
  /* an arched opening outline (for Shape holes): x0..x1 wide, from y0 up to the spring ys, round top */
  function archPath(x0, x1, y0, ys, seg) {
    const r = (x1 - x0) / 2, cx = (x0 + x1) / 2, p = new THREE.Path(); p.moveTo(x0, y0); p.lineTo(x1, y0); p.lineTo(x1, ys);
    for (let i = 1; i < (seg || 14); i++) { const a = Math.PI * i / (seg || 14); p.lineTo(cx + r * Math.cos(a), ys + r * Math.sin(a)); }
    p.lineTo(x0, ys); p.lineTo(x0, y0); return p;
  }
  /* a wall in the frame's x/y plane from z0 to z1 (thickness) with arched holes [{x0,x1,y0,ys}] */
  function archWall(F, key, x0, x1, y0, y1, z0, z1, holes) {
    const sh = new THREE.Shape(); sh.moveTo(x0, y0); sh.lineTo(x1, y0); sh.lineTo(x1, y1); sh.lineTo(x0, y1); sh.lineTo(x0, y0);
    for (const h of holes || []) sh.holes.push(archPath(h.x0, h.x1, h.y0, h.ys));
    const g = new THREE.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false, curveSegments: 14 }); g.translate(0, 0, z0);
    put(g, key, F);
  }
  /* the inside of an arched bay: a half-cylinder vault + side walls + back wall (brick), depth z0..z1 behind the face */
  function bayInside(F, key, x0, x1, y0, ys, z0, z1, backKey) {
    const r = (x1 - x0) / 2 + 0.035, cx = (x0 + x1) / 2; x0 -= 0.035; x1 += 0.035; z0 -= 0.06;   /* a little larger than the hole: no see-through seams */
    const v = new THREE.CylinderGeometry(r, r, z1 - z0, 20, 1, true, -Math.PI / 2, Math.PI); v.rotateX(-Math.PI / 2);
    put(v, key, T(F, cx, ys, (z0 + z1) / 2));
    box(F, key, x0 - 0.05, x0, y0, ys + 0.02, z0, z1); box(F, key, x1, x1 + 0.05, y0, ys + 0.02, z0, z1);
    box(F, backKey || key, x0 - 0.05, x1 + 0.05, y0, ys + r + 0.05, z1, z1 + 0.05);
    box(F, 'ground', x0, x1, y0 - 0.02, y0, z0, z1);
  }
  const holdBox = (x0, x1, y0, y1, z0, z1) => box(null, 'hold', x0, x1, y0, y1, z0, z1);

  /* ================= THE GAME'S FOOTPRINT (holdout: occludes, casts shadow, never baked) ================= */
  const CUTD = (E1 + 13.12);            /* 192 cuts the bottom corner square to the diagonal at X + Z = 2 × 14.285 */
  prism(null, 'hold', [[E0, E0], [E1, E0], [E1, CUTD - E1], [CUTD - E1, E1], [E0, E1]], -0.6, 0.0);   /* the 3-tier footprint at sand level: a grand arena's 4th tier paints over our walkway strip; a 3-tier one shows it */
  /* the game's Flavius podium + fire towers poke up a little: low holdouts so nothing of ours glows through them */
  /* (the game's Flavius podium is inside the footprint's top corner already) */

  /* ================= THE GROUND ================= */
  /* PASS 7: no ground plane — beyond the façade the game's own background shows (his 1a) */

  /* ================= FAR SIDES: walkway, the arcaded podium, 6 rows, aisles, a vomitorium, the top gallery, the attic ================= */
  const ROWS = 6, RD = 0.6, RH = 0.4, V_POD = 0.55, T_POD = 0.42, Y_POD = 1.75;
  const vRow = i => V_POD + T_POD + 0.05 + i * RD, yRow = i => Y_POD + (i + 1) * RH;
  const V_GAL = vRow(ROWS), Y_GAL = yRow(ROWS - 1), V_BACK = V_GAL + 1.3, Y_ATT = Y_GAL + 2.1, V_OUT = V_BACK + 0.45;
  meta.far = { V_POD, Y_POD, V_GAL, Y_GAL, V_BACK, Y_ATT, V_OUT };
  const UEND = LH + 1.2;           /* the straight end toward the left/right corner (runs into the tower, which covers the joint) */
  const BOXW = 3.2;                /* Flavius's box: half its width across the top corner (diagonal frame x) */
  const CUT = BOXW * Math.SQRT2;   /* the rows stop on the box's side planes (parallel to the diagonal: seen edge-on, never a blank wall) */
  /* row footprint, the top-corner end cut parallel to the diagonal, the other end straight */
  function farPoly(F, s, v0, v1, cutTop) {
    /* s = +1: +x is the top corner (farR); s = −1: −x is the top corner (farL). Mitre: at outward v, the top end is at x = s·(LH + v) */
    const top = v => s * (LH + v - (cutTop || 0)); const oth = -s * UEND;
    return s > 0 ? [[oth, v0], [top(v0), v0], [top(v1), v1], [oth, v1]] : [[top(v0), v0], [oth, v0], [oth, v1], [top(v1), v1]];
  }
  const inSpan = (s, x, v, cut, m) => s > 0 ? x < LH + v - cut - (m || 0) : x > -(LH + v - cut) + (m || 0);
  const RED_ROWS = [];
  for (const side of ['farL', 'farR']) {
    const F = SIDES[side], s = side === 'farR' ? 1 : -1;
    /* walkway (praecinctio) behind the game's stands */
    prism(F, 'stone', farPoly(F, s, -GX, V_POD, CUT), -0.45, 0.12);
    /* THE PODIUM: a full storey between the board's stands and the upper rows — dark arches, pilasters, a cornice */
    {
      const pitch = 1.6, holes = [], xs = [];
      for (let x = -s * UEND + s * 0.9; inSpan(s, x, V_POD, CUT, 0.7); x += s * pitch) xs.push(x);
      for (const x of xs) holes.push({ x0: x - 0.4, x1: x + 0.4, y0: 0.12, ys: 0.92 });
      const xa = s > 0 ? -UEND : -(LH + V_POD - CUT), xb = s > 0 ? LH + V_POD - CUT : UEND;
      archWall(F, 'stone', xa, xb, -0.45, Y_POD, V_POD, V_POD + T_POD, holes);
      for (const h of holes) bayInside(F, 'brick', h.x0, h.x1, h.y0, h.ys, V_POD + T_POD, V_POD + T_POD + 0.9, 'dark');
      for (const x of xs) for (const px of [x - s * pitch / 2]) if (inSpan(s, px, V_POD, CUT, 0.3)) box(F, 'stone', px - 0.13, px + 0.13, 0.12, Y_POD - 0.2, V_POD - 0.06, V_POD);
      prism(F, 'stone', farPoly(F, s, V_POD - 0.1, V_POD + T_POD + 0.04, CUT), Y_POD - 0.2, Y_POD - 0.1);
      prism(F, 'stone', farPoly(F, s, V_POD - 0.14, V_POD + 0.25, CUT), Y_POD, Y_POD + 0.22);   /* parapet in front of the first row */
      prism(F, 'stone', farPoly(F, s, V_POD - 0.18, V_POD + 0.29, CUT), Y_POD + 0.22, Y_POD + 0.28);
    }
    /* rows: a stone step + a bench slab on its front */
    for (let i = 0; i < ROWS; i++) {
      const v0 = vRow(i), y = yRow(i);
      prism(F, 'stone', farPoly(F, s, v0, V_GAL + 0.01, CUT), Y_POD - 0.1, y);
      prism(F, 'bench', farPoly(F, s, v0 - 0.03, v0 + RD * 0.6, CUT), y, y + 0.07);
      RED_ROWS.push({ side, F, s, v: v0 + RD * 0.28, y: y + 0.07, cut: CUT, i });
    }
    /* aisles (scalaria): narrow stairs up the rows, half-height steps */
    for (const ax of [-6.4, -1.4]) {
      const x = ax * -s;
      for (let i = 0; i < ROWS; i++) {
        const v0 = vRow(i) - 0.03, y = yRow(i);
        box(F, 'stone', x - 0.3, x + 0.3, y - RH / 2 - 0.02, y - RH / 2 + 0.04, v0 - RD / 2, v0);
        box(F, 'stone', x - 0.3, x + 0.3, y - 0.02, y + 0.04, v0, v0 + RD);
      }
    }
    /* a vomitorium (arched entry) through the rows on each side */
    {
      const x = 3.6 * -s, i0 = 1, v0 = vRow(i0), y0 = yRow(i0 - 1);
      archWall(F, 'stone', x - 0.75, x + 0.75, y0, yRow(i0 + 2) + 0.07, v0 - 0.02, v0 + 0.3, [{ x0: x - 0.42, x1: x + 0.42, y0: y0, ys: y0 + 0.62 }]);
      box(F, 'stone', x - 0.82, x + 0.82, yRow(i0 + 2) + 0.07, yRow(i0 + 2) + 0.15, v0 - 0.06, v0 + 0.34);
      bayInside(F, 'brick', x - 0.42, x + 0.42, y0, y0 + 0.62, v0 + 0.3, v0 + 1.6, 'dark');
    }
    /* the top gallery: floor, back wall with an arcade (dark), pilasters, entablature */
    prism(F, 'stone', farPoly(F, s, V_GAL, V_BACK, CUT), Y_POD, Y_GAL);
    {
      const pitch = 1.55, holes = [], xs = [];
      for (let x = -s * UEND + s * 0.8; inSpan(s, x, V_BACK, CUT, 0.6); x += s * pitch) xs.push(x);
      for (const x of xs) holes.push({ x0: x - 0.47, x1: x + 0.47, y0: Y_GAL, ys: Y_GAL + 1.0 });
      const xa = s > 0 ? -UEND : -(LH + V_BACK - CUT), xb = s > 0 ? LH + V_BACK - CUT : UEND;
      archWall(F, 'stone', xa, xb, Y_GAL, Y_ATT, V_BACK, V_BACK + 0.32, holes);
      for (const h of holes) bayInside(F, 'brick', h.x0, h.x1, h.y0, h.ys, V_BACK + 0.32, V_BACK + 1.1, 'dark');
      for (const x of xs) { const px = x - s * pitch / 2; if (inSpan(s, px, V_BACK, CUT, 0.2)) box(F, 'stone', px - 0.13, px + 0.13, Y_GAL, Y_ATT - 0.35, V_BACK - 0.07, V_BACK); }
      prism(F, 'stone', farPoly(F, s, V_BACK - 0.1, V_BACK + 0.32, CUT), Y_ATT - 0.38, Y_ATT - 0.28);
      meta['gal_' + side] = xs;
    }
    /* attic + cornice */
    prism(F, 'stone', farPoly(F, s, V_BACK, V_OUT, CUT), Y_ATT - 0.3, Y_ATT + 0.55);
    prism(F, 'stone', farPoly(F, s, V_BACK - 0.16, V_OUT + 0.1, CUT), Y_ATT + 0.55, Y_ATT + 0.68);
    for (let k = 0; k < 13; k++) { const x = -s * UEND + s * (0.9 + k * 1.55); if (!inSpan(s, x, V_BACK, CUT, 0.5)) continue; box(F, 'dark', x - 0.16, x + 0.16, Y_ATT - 0.05, Y_ATT + 0.3, V_BACK - 0.012, V_BACK + 0.02); }
  }
  /* ================= FLAVIUS'S BOX (top corner): a pavilion facing the viewer, rising from the walkway; columns either side of his banner ================= */
  {
    const F = DIAG.top; const zf = 0.5, yb = 0.12, H = 5.4;
    /* the box's block: fills the corner between the two far wings, front face toward the viewer */
    prism(F, 'stone', [[-BOXW, zf + 0.9], [BOXW, zf + 0.9], [BOXW, 9], [-BOXW, 9]], -0.45, yb + H);
    prism(F, 'stone', [[-BOXW - 0.1, zf + 0.8], [BOXW + 0.1, zf + 0.8], [BOXW + 0.1, 9], [-BOXW - 0.1, 9]], yb + H, yb + H + 0.15);
    /* the open front: a deep loggia with a purple drape behind the banner */
    box(F, 'dark', -1.3, 1.3, yb, yb + 3.6, zf + 0.85, zf + 0.92);
    box(F, 'cushion', -1.15, 1.15, yb + 0.4, yb + 3.3, zf + 0.8, zf + 0.85);
    box(F, 'stone', -BOXW, BOXW, -0.45, yb, -3.4, zf + 0.9);                         /* the step in front (reaches back under the footprint: no sky beside it) */
    for (const x of [-2.75, -1.65, 1.65, 2.75]) {
      cyl(F, 'stone', x, yb, yb + 0.28, zf + 0.1, 0.27, 0.25, 16);
      cyl(F, 'stone', x, yb + 0.28, yb + 3.4, zf + 0.1, 0.19, 0.16, 18);
      cyl(F, 'gold', x, yb + 3.4, yb + 3.62, zf + 0.1, 0.16, 0.25, 16);
      box(F, 'stone', x - 0.3, x + 0.3, yb + 3.62, yb + 3.76, zf - 0.2, zf + 0.4);
    }
    box(F, 'stone', -BOXW, BOXW, yb + 3.76, yb + 4.3, zf - 0.25, zf + 0.9);
    box(F, 'gold', -BOXW, BOXW, yb + 3.9, yb + 3.98, zf - 0.27, zf - 0.25);
    box(F, 'stone', -BOXW - 0.1, BOXW + 0.1, yb + 4.3, yb + 4.42, zf - 0.35, zf + 0.9);
    meta.box = { zf, yb };
  }
  /* ================= NEAR SIDES — PASS 7 (his front picture, 1a): a carved stone FAÇADE straight under the near stands (the game's
     3-tier outline E1): a cornice line under the benches, piers with a base + capital, plain dark arched doorways between them, red eagle
     banners on every second pier, a potted cypress + ivy on the others. Nothing in front of it: the game's own background shows there
     (REPLACES pass 6's forecourt, low wall and goods). ================= */
  const FZ = -GX, BAY = 2.0, AW = 1.12, AY = GROUND + 1.02, PW = 0.27, PD = 0.24;   /* façade plane, pier pitch, doorway width + spring, pier half width + depth */
  const SW = 1.2, SWP = SW + 1.1;                                                  /* the stair's half width; the abutment's outer edge (diagonal frame x) */
  const SEND = E1 - M - SWP * Math.SQRT2;                                           /* where the façade meets the stair's abutment (side frame x) */
  meta.near = { FZ, BAY, AW, AY, SW, SEND };
  const PIERS = [];
  for (const side of ['nearL', 'nearR']) {
    const F = SIDES[side], s = side === 'nearL' ? 1 : -1;            /* s: which x end is the bottom corner */
    const xe = s * SEND, xo = -s * UEND;
    const ps = []; for (let k = 0; ; k++) { const x = xe - s * (PW + 0.05 + k * BAY); if (s * (x - xo) < 0.4) break; ps.push(x); }
    const holes = []; for (let k = 0; k + 1 < ps.length + 1; k++) { const x = ps[k] - s * BAY / 2; if (s * (x - xo) > AW / 2 + 0.1) holes.push({ x0: x - AW / 2, x1: x + AW / 2, y0: GROUND, ys: AY }); }
    const xa = Math.min(xo, xe), xz = Math.max(xo, xe);
    archWall(F, 'stoneN', xa, xz, GROUND, 0.0, FZ - 0.45, FZ, holes);
    for (const h of holes) bayInside(F, 'brick', h.x0, h.x1, h.y0, h.ys, FZ - 1.25, FZ - 0.45, 'dark');
    /* the cornice line under the benches (two steps) and a plinth course at the foot */
    box(F, 'stoneN', xa, xz, -0.78, -0.62, FZ, FZ + 0.12);
    box(F, 'stoneN', xa, xz, -0.86, -0.78, FZ, FZ + 0.06);
    box(F, 'stoneN', xa, xz, GROUND, GROUND + 0.16, FZ, FZ + 0.05);
    /* arch surrounds: a thin raised band round each doorway + a keystone */
    for (const h of holes) {
      const cx = (h.x0 + h.x1) / 2, r = AW / 2;
      const sh = new THREE.Shape(); sh.absarc(0, 0, r + 0.1, 0, Math.PI, false); sh.lineTo(-r, 0); sh.absarc(0, 0, r, Math.PI, 0, true); sh.lineTo(r + 0.1, 0);
      const g = new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: false, curveSegments: 16 }); put(g, 'stoneN', T(F, cx, AY, FZ));
      box(F, 'stoneN', cx - 0.09, cx + 0.09, AY + r - 0.04, AY + r + 0.16, FZ, FZ + 0.06);
      for (const sx of [-1, 1]) box(F, 'stoneN', cx + sx * (r + 0.05) - 0.05, cx + sx * (r + 0.05) + 0.05, GROUND + 0.16, AY, FZ, FZ + 0.04);
    }
    /* the piers: base, shaft, capital (under the cornice) */
    ps.forEach((x, k) => {
      box(F, 'stoneN', x - PW - 0.05, x + PW + 0.05, GROUND, GROUND + 0.3, FZ, FZ + PD + 0.05);
      box(F, 'stoneN', x - PW, x + PW, GROUND + 0.3, -0.98, FZ, FZ + PD);
      box(F, 'stoneN', x - PW - 0.06, x + PW + 0.06, -0.98, -0.86, FZ, FZ + PD + 0.07);
      PIERS.push({ side, F, x, k, s });
    });
  }
  /* ================= THE GRAND STAIR (bottom corner) between two pillars with the big braziers, two lions at its foot ================= */
  /* a frame on the 3-tier corner (E1, E1): x across the screen, z toward the viewer. The game cuts its corner at z = −1.65 and draws a
     4-step flight down to y −0.49 at z ≈ −0.63 (192 ar91Under); ours continues from there to the ground. */
  const DB = frame(V3(S2, 0, -S2), V3(S2, 0, S2), V3(E1, 0, E1));
  {
    const ZS = -0.63, YT = -0.49, n = 11, rise = (YT - GROUND) / n, run = 0.27, ZF = ZS + n * run, ZP = 0.55;
    meta.stair = { ZS, YT, n, rise, run, ZF, ZP };
    for (let k = 0; k < n; k++) box(DB, 'stoneN', -SW, SW, GROUND, YT - rise * k, ZS + k * run, ZS + (k + 1) * run + (k + 1 < n ? 0.02 : 0));
    box(DB, 'stoneN', -SW, SW, GROUND - 0.2, YT, -2.0, ZS + 0.01);                     /* under the game's own flight (no sky through it) */
    for (const sx of [-1, 1]) {
      /* the abutment: the stands' level from the façade out to the pillar */
      const P5 = [[SW, -2.6], [SW, ZP], [SWP, ZP], [SWP, -SWP], [2.6, -2.6]].map(([x, z]) => [sx * x, z]);
      prism(DB, 'stoneN', sx > 0 ? P5 : P5.slice().reverse(), GROUND, 0.0);
      /* the pillar: base, shaft, capital, a block for the brazier */
      const x0 = sx > 0 ? SW : -SWP, x1 = sx > 0 ? SWP : -SW, z0 = ZP - 1.1, z1 = ZP;
      box(DB, 'stoneF', x0 - 0.07, x1 + 0.07, GROUND, GROUND + 0.38, z0 - 0.07, z1 + 0.07);
      box(DB, 'stoneF', x0, x1, GROUND + 0.38, 0.2, z0, z1);
      box(DB, 'stoneF', x0 - 0.08, x1 + 0.08, 0.2, 0.34, z0 - 0.08, z1 + 0.08);
      box(DB, 'stoneF', x0 + 0.06, x1 - 0.06, 0.34, 0.45, z0 + 0.06, z1 - 0.06);
      box(DB, 'stoneF', x0 + 0.08, x1 - 0.08, -0.05, 0.02, z1, z1 + 0.04);           /* a moulding band across the front */
      /* the cheek wall down the flight (stepped, a little above each tread), ending on the lion's plinth */
      for (let k = 0; k < n; k++) { const z = ZS + k * run; if (z + run <= z1) continue;
        box(DB, 'stoneN', sx > 0 ? SW - 0.02 : -SW - 0.4, sx > 0 ? SW + 0.4 : -SW + 0.02, GROUND, YT - rise * k + 0.32, Math.max(z, z1), z + run + 0.01); }
      const lx = sx * (SW + 0.62), lz = ZF - 0.25;
      box(DB, 'stoneN', lx - 0.5, lx + 0.5, GROUND, GROUND + 0.36, lz - 0.55, lz + 0.55);
      box(DB, 'stoneN', lx - 0.55, lx + 0.55, GROUND + 0.36, GROUND + 0.44, lz - 0.6, lz + 0.6);
      meta.lionAt = meta.lionAt || []; meta.lionAt.push({ x: lx, y: GROUND + 0.44, z: lz - 0.05, face: sx });
      meta.pillars = meta.pillars || []; meta.pillars.push({ x: (x0 + x1) / 2, top: 0.45, z: (z0 + z1) / 2, front: z1 });
    }
  }
  /* ================= CORNER TOWERS (left and right): square, two visible faces with a gate arch + an arched window, bands, a cornice ================= */
  for (const c of ['left', 'right']) {
    const F = DIAG[c]; const z0 = 0.6, R = 2.0, H = Y_ATT + 1.6;
    prism(F, 'stone', [[0, z0 - R * 1.0], [R * 1.4, z0 + R * 0.4], [0, z0 + R * 1.8], [-R * 1.4, z0 + R * 0.4]], GROUND, H);
    for (const [y0, y1, k] of [[H, H + 0.16, 1.08], [-0.3, -0.12, 1.05], [Y_POD + 0.6, Y_POD + 0.74, 1.04], [H - 0.6, H - 0.48, 1.04]])
      prism(F, 'stone', [[0, z0 - R * k], [R * 1.4 * k, z0 + R * 0.4], [0, z0 + R * (0.4 + 1.4 * k)], [-R * 1.4 * k, z0 + R * 0.4]], y0, y1);
    const cx = 0, cz = z0 + R * 0.4;
    for (const sd of [-1, 1]) {
      /* the faces from the front corner (0, z0-R) to the side corners (+-1.4R, z0+0.4R): a frame on each, x along, z out of the face */
      const A = V3(0, 0, z0 - R).applyMatrix4(F), B = V3(sd * R * 1.4, 0, z0 + R * 0.4).applyMatrix4(F);
      const mid = A.clone().add(B).multiplyScalar(0.5); const ex = B.clone().sub(A).normalize();
      let ez = new THREE.Vector3().crossVectors(ex, V3(0, 1, 0)); const toC = V3(cx, 0, cz).applyMatrix4(F).sub(mid); if (ez.dot(toC) > 0) ez.negate();
      const exr = new THREE.Vector3().crossVectors(V3(0, 1, 0), ez).normalize();
      const FF = new THREE.Matrix4().makeBasis(exr, V3(0, 1, 0), ez).setPosition(mid); const L = A.distanceTo(B) / 2;
      archWall(FF, 'stone', -L + 0.25, L - 0.25, GROUND, Y_POD + 0.6, 0, 0.14, [{ x0: -0.7, x1: 0.7, y0: GROUND, ys: -0.55 }, { x0: -0.42, x1: 0.42, y0: 0.6, ys: 1.35 }]);
      bayInside(FF, 'brick', -0.7, 0.7, GROUND, -0.55, -1.2, 0, 'dark');
      box(FF, 'dark', -0.45, 0.45, 0.58, 1.9, -0.3, -0.02);
      archWall(FF, 'stone', -L + 0.25, L - 0.25, Y_POD + 0.74, H - 0.6, 0, 0.1, [{ x0: -0.36, x1: 0.36, y0: Y_POD + 1.3, ys: Y_POD + 2.3 }]);
      box(FF, 'dark', -0.4, 0.4, Y_POD + 1.28, Y_POD + 2.75, -0.3, -0.02);
      const med = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 18); med.rotateX(Math.PI / 2); put(med, 'bronze', FF.clone().multiply(new THREE.Matrix4().makeTranslation(0, H - 1.15, 0.12)));
      const hd = new THREE.SphereGeometry(0.17, 12, 10); put(hd, 'bronze', FF.clone().multiply(new THREE.Matrix4().makeTranslation(0, H - 1.15, 0.2)));
    }
    meta.towers = meta.towers || []; meta.towers.push({ c, top: H + 0.16, z: z0 + R * 0.4 });
  }

  /* ================= PASS 8 (his 1a / fallback c): GROUND + A ROMAN CITY in the two bottom corners and below the stair ONLY (3a: the far
     side stays as is). Paving at the façade's foot (a terrace, a wider plaza under the stair for the lions), three steps down to the street,
     then (variant 'city') a sidewalk, a low portico, a few houses with terracotta hip roofs, cypresses and umbrella pines. Everything
     here uses the HAZED materials (amph111.html hz8): it fades into a soft haze with the distance from the façade and toward the canvas
     edges, and its ink lines fade with it, so it stays low contrast and the eye stays on the sand (VISUAL POLISH RULE). The few lit
     windows are 'night' meshes: drawn only into the glow layer. ================= */
  if (VAR !== 'p7') {
    const a = E1 - 3, far = -40, TR = 1.4, CP = E1 - 2.6, CQ = E1 + 5.0, YS = GROUND - 0.6;   /* terrace depth; the plaza square under the stair */
    const Lp = o => [[far, a], [a, a], [a, far], [E1 + TR + o, far], [E1 + TR + o, CP - o], [CQ + o, CP - o], [CQ + o, CQ + o], [CP - o, CQ + o], [CP - o, E1 + TR + o], [far, E1 + TR + o]];
    prism(null, 'gPave', Lp(0), GROUND - 0.25, GROUND);
    for (let k = 1; k <= 3; k++) prism(null, 'gPave', Lp(k * 0.25), GROUND - 0.25 - k * 0.2, GROUND - k * 0.2);
    prism(null, 'gStreet', [[far, a], [a, a], [a, far], [70, far], [70, 70], [far, 70]], YS - 0.3, YS);
    meta.ground = { TR, CP, CQ, YS };
    if (VAR === 'city') {
      /* in a near side's frame: x toward the bottom corner (mirrored on nearR), z outward (the façade is z −0.47), y up */
      const bx = (F, s, key, x0, x1, y0, y1, z0, z1) => box(F, key, Math.min(s * x0, s * x1), Math.max(s * x0, s * x1), y0, y1, z0, z1);
      const hip = (F, s, x0, x1, z0, z1, y, h) => { const o = 0.14, w = x1 - x0 + 2 * o, d = z1 - z0 + 2 * o, g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
        g.rotateY(Math.PI / 4); g.translate(0, 0.5, 0); put(g, 'cRoof', T(F, s * (x0 + x1) / 2, y, (z0 + z1) / 2, 0, w, h, d)); };
      const gable = (F, s, x0, x1, z0, z1, y, h) => { const o = 0.12, g = new THREE.CylinderGeometry(1, 1, 1, 3, 1); g.rotateZ(Math.PI / 2); g.rotateX(-Math.PI / 2); g.translate(0, 0.5, 0);
        put(g, 'cRoof', T(F, s * (x0 + x1) / 2, y, (z0 + z1) / 2, 0, x1 - x0 + 2 * o, h / 1.5, (z1 - z0 + 2 * o) / 2 / 0.866)); };
      const cypress = (F, s, x, z, y, k) => { const H = 2.3 * k, prof = Array.from({ length: 12 }, (_, i) => { const t = i / 11; return new THREE.Vector2(i === 0 ? 0.03 : 0.27 * k * Math.pow(Math.sin(Math.PI * Math.min(1, 0.1 + t * 1.25)), 0.7) * (1 - 0.82 * t), H * t); });
        put(new THREE.LatheGeometry(prof, 10), 'cLeaf', T(F, s * x, y + 0.15, z)); cyl(F, 'cTrunk', s * x, y, y + 0.2, z, 0.05, 0.05, 6); };
      const pine = (F, s, x, z, y, k) => { const H = 2.2 * k; cyl(F, 'cTrunk', s * x, y, y + H, z, 0.07, 0.05, 7);
        for (const [dx, dz, dy, r, key] of [[0, 0, 0, 0.8, 'cLeaf'], [0.42, 0.18, -0.1, 0.52, 'cLeaf'], [-0.38, -0.14, -0.06, 0.54, 'cLeaf'], [0.06, 0.04, 0.1, 0.55, 'cLeafLt']])
          put(new THREE.SphereGeometry(1, 12, 7), key, T(F, s * (x + dx * k), y + H + dy * k, z + dz * k, 0, r * k, r * 0.3 * k, r * 0.85 * k)); };
      const WIN = [];
      const house = (F, s, x0, x1, z0, z1, h, rh, wins) => {
        bx(F, s, 'cWall', x0, x1, YS + 0.1, YS + 0.1 + h, z0, z1);
        bx(F, s, 'cWall', x0 - 0.05, x1 + 0.05, YS + 0.1 + h - 0.08, YS + 0.1 + h, z0 - 0.05, z1 + 0.05);   /* a thin eaves band */
        hip(F, s, x0, x1, z0, z1, YS + 0.1 + h, rh);
        for (const [wx, lit] of wins || []) { const y0 = YS + 0.1 + h * 0.5, y1 = y0 + 0.36;
          bx(F, s, 'cDark', wx - 0.13, wx + 0.13, y0, y1, z1, z1 + 0.02);
          if (lit) WIN.push([F, s, wx, y0, y1, z1]); }
        /* a door on the outward face */
        bx(F, s, 'cDark', (x0 + x1) / 2 + 0.35, (x0 + x1) / 2 + 0.75, YS + 0.1, YS + 0.1 + Math.min(0.9, h * 0.6), z1, z1 + 0.02);
      };
      const portico = (F, s, x0, x1, z0, z1, h) => {
        bx(F, s, 'cWall', x0, x1, YS + 0.1, YS + 0.1 + h, z0, z0 + 0.22);                                 /* the back wall */
        bx(F, s, 'cWall', x0, x1, YS + 0.1, YS + 0.2, z0, z1);                                             /* its floor (two steps) */
        bx(F, s, 'cWall', x0 - 0.06, x1 + 0.06, YS + 0.1, YS + 0.15, z1 - 0.05, z1 + 0.12);
        for (let x = x0 + 0.2; x <= x1 - 0.15; x += 0.62) cyl(F, 'cWall', s * x, YS + 0.2, YS + 0.1 + h - 0.12, z1 - 0.22, 0.08, 0.065, 10);
        bx(F, s, 'cWall', x0 - 0.04, x1 + 0.04, YS + 0.1 + h - 0.14, YS + 0.1 + h + 0.02, z0, z1 - 0.06);  /* architrave */
        gable(F, s, x0, x1, z0, z1 - 0.06, YS + 0.1 + h + 0.02, 0.5);
      };
      /* the two corners: nearL (s = 1) and nearR (s = −1, mirrored, a different arrangement). Only a small triangle of each corner is on a
         canvas (±7.6 TW wide at 1440, its bottom 10.65 TW below OY tall / 8.6 short): x − z ≥ −5.8 and x + z ≤ 12.3 at street level, and
         the plaza under the stair starts at x 5.6 — so the few buildings sit right by the plaza and the street; tops of the nearer ones
         rise into the short framing too. */
      for (const [side, s] of [['nearL', 1], ['nearR', -1]]) {
        const F = SIDES[side];
        /* the sidewalk the blocks stand on (a kerb toward the street) */
        bx(F, s, 'gPave', -18, 5.45, YS - 0.2, YS + 0.1, 3.05, 16);
        if (s > 0) {
          portico(F, s, -3.2, 2.6, 3.25, 4.45, 1.25);
          house(F, s, 3.1, 5.3, 3.3, 5.3, 1.3, 0.65, [[3.8, 1]]);
          house(F, s, -0.6, 2.6, 5.2, 7.2, 1.6, 0.75, [[0.2, 0], [1.7, 1]]);
          house(F, s, 3.2, 5.4, 6.1, 7.9, 1.25, 0.6, [[4.3, 0]]);
          house(F, s, -4.4, -1.4, 5.0, 6.9, 1.45, 0.7, [[-3.4, 0], [-2.2, 0]]);
          house(F, s, 0.6, 3.4, 8.3, 10.2, 1.4, 0.7, [[1.6, 0]]);
          cypress(F, s, 2.85, 3.45, YS + 0.1, 0.9); cypress(F, s, -3.6, 3.45, YS + 0.1, 0.95); cypress(F, s, -1.0, 5.6, YS + 0.1, 1.0);
          pine(F, s, 2.9, 7.7, YS + 0.1, 0.9); pine(F, s, -2.6, 7.9, YS + 0.1, 1.0); pine(F, s, 5.2, 9.4, YS + 0.1, 0.8);
        } else {
          house(F, s, -2.6, 0.6, 3.3, 5.0, 1.5, 0.7, [[-1.8, 0], [-0.3, 1]]);
          portico(F, s, 1.1, 5.3, 3.25, 4.4, 1.2);
          house(F, s, 2.6, 5.4, 5.2, 7.1, 1.35, 0.65, [[3.6, 1]]);
          house(F, s, -1.6, 1.8, 6.0, 8.0, 1.55, 0.75, [[-0.7, 0]]);
          house(F, s, -5.6, -3.2, 4.2, 6.0, 1.3, 0.65, [[-4.6, 0]]);
          house(F, s, 2.2, 4.8, 8.6, 10.4, 1.4, 0.7, [[3.0, 1]]);
          cypress(F, s, 0.95, 3.5, YS + 0.1, 0.95); cypress(F, s, 2.1, 5.45, YS + 0.1, 0.85); cypress(F, s, -2.9, 5.3, YS + 0.1, 1.0);
          pine(F, s, 0.4, 9.0, YS + 0.1, 0.95); pine(F, s, 5.3, 8.1, YS + 0.1, 0.8); pine(F, s, -4.4, 7.4, YS + 0.1, 1.0);
        }
      }
      /* the handful of warm windows (night only) */
      for (const [F, s, wx, y0, y1, z1] of WIN) box(F, 'win', s * wx - 0.11, s * wx + 0.11, y0 + 0.03, y1 - 0.03, z1 + 0.025, z1 + 0.035);
      meta.windows = WIN.length;
    }
  }

  /* ================= BUILD the merged meshes ================= */
  const MAT = opt.materials(THREE, TEX);
  for (const k of Object.keys(BK)) {
    const g = merge(BK[k]); const m = new THREE.Mesh(g, MAT[k] ? MAT[k].mat : MAT.stone.mat);
    m.userData.layer = MAT[k] ? MAT[k].layer : 'stone'; m.userData.front = k === 'stoneF'; m.castShadow = k !== 'ground'; m.receiveShadow = true; m.name = k; scene.add(m);
  }
  /* ================= PROPS + FIGURES (own meshes: they need their own colours) ================= */
  const add = (geom, key, M4, layer) => { const m = new THREE.Mesh(geom, MAT[key].mat); m.applyMatrix4(M4); m.userData.layer = layer || MAT[key].layer; m.castShadow = true; m.receiveShadow = true; scene.add(m); return m; };
  /* props: crate, barrel, rack, cage, amphora */
  add.scene = scene;
  const P = window.AMPH111_PROPS(THREE, MAT, add, T, rnd);
  /* PASS 7: the piers' dress — banners on every second pier, a potted cypress + ivy on the others */
  for (const p of PIERS) {
    if (p.k % 2 === 1) P.banner(p.F, p.x, -1.02, FZ + PD + 0.01, 0.46, 1.05);
    else { P.cypress(p.F, p.x + p.s * (PW + 0.38), GROUND, FZ + 0.3, 1); P.ivy(p.F, p.x, GROUND + 0.3, -0.9, FZ + PD, PW * 2); }
  }
  /* the lions */
  for (const l of meta.lionAt) P.lion(DB, l.x, l.y, l.z, l.face);
  /* the guards at Flavius's box */
  for (const sx of [-1, 1]) P.guard(DIAG.top, sx * 2.2, 0.12, -0.15, sx);
  /* banners (sparse): 2 on each far gallery, 1 on each near facade pier */
  meta.banners = [];
  for (const side of ['farL', 'farR']) { const F = SIDES[side], s = side === 'farR' ? 1 : -1; for (const x of [-4.1, 3.6]) P.banner(F, x * -s, Y_ATT - 0.38, V_BACK - 0.12, 0.9, 1.9); }
  for (const side of ['farL', 'farR']) { const F = SIDES[side], s = side === 'farR' ? 1 : -1; for (const k of [1.5, 6.5]) P.banner(F, -s * UEND + s * (0.9 + 1.6 * k), Y_POD - 0.24, V_POD - 0.07, 0.62, 1.15); }
  /* the stair's front pieces: marked for the 'front' mask; the big braziers cast no shadow (their own night lights sit in front of them) */
  const front = (fn, noShadow) => { const n0 = scene.children.length; const r = fn(); for (let i = n0; i < scene.children.length; i++) { scene.children[i].userData.front = 1; if (noShadow) scene.children[i].castShadow = false; } return r; };
  for (const pl of meta.pillars) front(() => P.banner(DB, pl.x, 0.12, pl.front + 0.01, 0.7, 1.55));
  /* braziers (a few, at key points): the landing (2), the tower tops, the two vomitoria on the far sides */
  meta.fires = [];
  for (const pl of meta.pillars) meta.fires.push(front(() => P.brazier(DB, pl.x, pl.top - 0.75 * 1.25, pl.z, 1.25, { gold: 1, core: 1.45, light: VAR === 'p7' ? 0.75 : 0, lift: -0.6, dz: 1.0, shadow: 1 }), 1));
  /* pass 8 (his 2a): instead of the pillar lights, two small warm pools on the stair's top steps (spot lights straight down, no shadow):
     about a third of pass 7's light there, gone before the lions, nothing on the façade */
  meta.pools = [];
  if (VAR !== 'p7') for (const sx of [-1, 1]) { const p = V3(sx * 0.55, 1.1, -0.5).applyMatrix4(DB), t = V3(sx * 0.55, -0.8, -0.15).applyMatrix4(DB); meta.pools.push({ x: p.x, y: p.y, z: p.z, tx: t.x, ty: t.y, tz: t.z }); }   /* the stem sinks into the pillar: a wide bowl on its top */   /* pass 7 (his 2a): the two big braziers on the stair's pillars */
  for (const side of ['farL', 'farR']) { const s = side === 'farR' ? 1 : -1; meta.fires.push(P.brazier(SIDES[side], -s * UEND + s * (0.9 + 1.6 * 4), Y_POD + 0.28, V_POD + 0.06, 0.75)); }
  for (const t of meta.towers) meta.fires.push(P.brazier(DIAG[t.c], 0, t.top, t.z, 1.25));
  /* the crowd on the far rows (baked, static) */
  P.crowd(RED_ROWS, LH, UEND);
  return { scene, meta, rnd };
};
