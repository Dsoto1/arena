/* tools/art/amph111/props.js — the amphitheatre's props and figures, built from primitives (no downloaded models: at the bake's size —
   a barrel is ~20 px on a desktop — simple painted shapes read better and match the game's illustrated look than photoscans).
   window.AMPH111_PROPS(THREE, MAT, add, T, rnd) → {crates, barrels, rack, cage, gate, lion, guard, banner, brazier, crowd}.
   Every builder takes a frame F (local x along, y up, z outward) and returns nothing / its light point. */
window.AMPH111_PROPS = function (THREE, MAT, add, T, rnd) {
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const M4 = (F, x, y, z, ry, sx, sy, sz, rx, rz) => {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0, 'YXZ'));
    const m = new THREE.Matrix4().compose(V3(x, y, z), q, V3(sx || 1, sy || 1, sz || 1)); return F ? F.clone().multiply(m) : m;
  };
  const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const CYL = (r0, r1, h, seg) => new THREE.CylinderGeometry(r1, r0, h, seg || 12);
  const SPH = (r, ws, hs) => new THREE.SphereGeometry(r, ws || 14, hs || 10);
  const out = {};
  /* ---------- storage ---------- */
  function crate(F, x, y, z, s, ry) {
    add(BOX(0.5 * s, 0.5 * s, 0.5 * s), 'wood', M4(F, x, y + 0.25 * s, z, ry));
    /* the dark frame: 4 vertical corner battens + top/bottom bands */
    for (const [dx, dz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) add(BOX(0.07 * s, 0.52 * s, 0.07 * s), 'woodDark', M4(F, x, y + 0.25 * s, z, ry).multiply(new THREE.Matrix4().makeTranslation(dx * 0.22 * s, 0, dz * 0.22 * s)));
    add(BOX(0.52 * s, 0.06 * s, 0.52 * s), 'woodDark', M4(F, x, y + 0.47 * s, z, ry));
    add(BOX(0.52 * s, 0.06 * s, 0.52 * s), 'woodDark', M4(F, x, y + 0.04 * s, z, ry));
  }
  function barrel(F, x, y, z, s, lying, ry) {
    const prof = [[0, 0], [0.2, 0], [0.235, 0.14], [0.25, 0.28], [0.235, 0.42], [0.2, 0.56], [0, 0.56]].map(([r, h]) => new THREE.Vector2(r * s, h * s));
    const g = new THREE.LatheGeometry(prof, 16);
    const base = lying ? M4(F, x, y + 0.24 * s, z, ry, 1, 1, 1, 0, Math.PI / 2).multiply(new THREE.Matrix4().makeTranslation(0, -0.28 * s, 0)) : M4(F, x, y, z, ry);
    add(g, 'wood', base);
    for (const h of [0.1, 0.46]) { const t = new THREE.TorusGeometry(0.228 * s, 0.014 * s, 6, 20); t.rotateX(Math.PI / 2); add(t, 'iron', base.clone().multiply(new THREE.Matrix4().makeTranslation(0, h * s, 0))); }
  }
  out.crates = (F, x, y, z) => { crate(F, x - 0.3, y, z - 0.25, 1.1, 0.2); crate(F, x + 0.32, y, z - 0.1, 1, -0.15); crate(F, x - 0.2, y + 0.55, z - 0.3, 0.85, 0.5); crate(F, x + 0.25, y, z + 0.55, 0.8, 0.4); };
  out.barrels = (F, x, y, z) => { barrel(F, x - 0.3, y, z - 0.3, 1.05); barrel(F, x + 0.22, y, z - 0.15, 1); barrel(F, x + 0.05, y, z + 0.5, 0.95, true, 0.5); };
  /* pass 6: tidy groups on the forecourt, square to the arcade (no scatter) */
  out.goods = (F, x, y, z) => { crate(F, x - 0.56, y, z, 1.05, 0); crate(F, x, y, z, 1.05, 0); crate(F, x - 0.28, y + 0.53, z, 0.95, 0); barrel(F, x + 0.6, y, z + 0.02, 1); barrel(F, x + 1.08, y, z + 0.02, 1); };
  out.stores = (F, x, y, z) => { barrel(F, x - 1.0, y, z, 1); barrel(F, x - 0.52, y, z, 1); barrel(F, x - 0.04, y, z, 1); crate(F, x + 0.55, y, z, 1.05, 0); crate(F, x + 0.55, y + 0.53, z, 0.9, 0); };
  out.rack = (F, x, y, z) => {
    /* a wooden weapon rack against the back: two posts, two rails, spears + two shields leaning */
    const zb = z - 0.55;
    for (const dx of [-0.5, 0.5]) add(BOX(0.07, 1.1, 0.07), 'woodDark', M4(F, x + dx, y + 0.55, zb));
    for (const h of [0.35, 0.95]) add(BOX(1.1, 0.06, 0.06), 'woodDark', M4(F, x, y + h, zb + 0.04));
    for (let i = 0; i < 4; i++) { const dx = -0.36 + i * 0.24; add(CYL(0.018, 0.018, 1.35, 6), 'woodDark', M4(F, x + dx, y + 0.66, zb + 0.1, 0, 1, 1, 1, -0.12)); add(CYL(0.03, 0.0, 0.16, 6), 'iron', M4(F, x + dx, y + 1.38, zb + 0.02, 0, 1, 1, 1, -0.12)); }
    add(CYL(0.24, 0.24, 0.04, 18), 'red', M4(F, x - 0.25, y + 0.26, z + 0.05, 0.3, 1, 1, 1, Math.PI / 2 - 0.25));
    add(CYL(0.06, 0.06, 0.06, 10), 'gold', M4(F, x - 0.25, y + 0.26, z + 0.08, 0.3, 1, 1, 1, Math.PI / 2 - 0.25));
    add(CYL(0.22, 0.22, 0.04, 18), 'bronze', M4(F, x + 0.32, y + 0.24, z + 0.1, -0.3, 1, 1, 1, Math.PI / 2 - 0.2));
    crate(F, x + 0.55, y, z + 0.45, 0.7, 0.3);
  };
  out.cage = (F, x, y, z) => {
    const w = 1.05, d = 0.85, h = 0.9, cz = z - 0.15;
    add(BOX(w + 0.08, 0.1, d + 0.08), 'woodDark', M4(F, x, y + 0.05, cz));
    add(BOX(w + 0.08, 0.08, d + 0.08), 'woodDark', M4(F, x, y + h + 0.1, cz));
    add(BOX(w * 0.9, 0.02, d * 0.9), 'dark', M4(F, x, y + 0.11, cz));
    for (let i = 0; i <= 8; i++) { const t = -w / 2 + w * i / 8; add(CYL(0.016, 0.016, h, 6), 'iron', M4(F, x + t, y + 0.1 + h / 2, cz + d / 2)); add(CYL(0.016, 0.016, h, 6), 'iron', M4(F, x + t, y + 0.1 + h / 2, cz - d / 2)); }
    for (let i = 1; i < 6; i++) { const t = -d / 2 + d * i / 6; add(CYL(0.016, 0.016, h, 6), 'iron', M4(F, x + w / 2, y + 0.1 + h / 2, cz + t)); add(CYL(0.016, 0.016, h, 6), 'iron', M4(F, x - w / 2, y + 0.1 + h / 2, cz + t)); }
    for (const dx of [-1, 1]) for (const dz of [-1, 1]) add(BOX(0.08, h + 0.1, 0.08), 'woodDark', M4(F, x + dx * w / 2, y + 0.1 + h / 2, cz + dz * d / 2));
    barrel(F, x + 0.85, y, z + 0.35, 0.8);
  };
  /* an iron grille across the lower part of an empty arch */
  out.gate = (F, x, y, z, aw, ys) => {
    const h = ys - y + aw * 0.42;
    for (let i = 0; i <= 7; i++) add(CYL(0.02, 0.02, h, 6), 'iron', M4(F, x - aw / 2 + 0.06 + (aw - 0.12) * i / 7, y + h / 2, z));
    for (const t of [0.25, 0.6, 0.92]) add(BOX(aw, 0.04, 0.04), 'iron', M4(F, x, y + h * t, z));
  };
  /* ---------- the lion (couchant, head up), stone ---------- */
  out.lion = (F, x, y, z, face) => {
    /* a SEATED lion (haunches down, front legs straight, head up, a full mane), looking out to the viewer's side */
    const B = M4(F, x, y, z, face * 0.5, 1.4, 1.4, 1.4);
    const P = (g, lx, ly, lz, sx, sy, sz, rx, ry) => add(g, 'lion', B.clone().multiply(M4(null, lx, ly, lz, ry || 0, sx, sy, sz, rx || 0)));
    P(SPH(1, 16, 12), 0, 0.2, -0.2, 0.2, 0.2, 0.26);                 /* haunches */
    for (const sx of [-1, 1]) P(SPH(1, 12, 10), sx * 0.13, 0.15, -0.14, 0.09, 0.15, 0.2);   /* hind legs folded */
    P(SPH(1, 16, 12), 0, 0.42, -0.04, 0.17, 0.27, 0.17, 0.5);        /* the body, leaning up */
    P(SPH(1, 16, 12), 0, 0.62, 0.08, 0.21, 0.22, 0.17);              /* the mane */
    P(SPH(1, 14, 10), 0, 0.68, 0.17, 0.12, 0.12, 0.11);              /* head */
    P(BOX(0.12, 0.1, 0.13), 0, 0.63, 0.27);                           /* muzzle */
    for (const sx of [-1, 1]) {
      P(CYL(0.045, 0.05, 0.42, 8), sx * 0.08, 0.22, 0.14);            /* front legs */
      P(BOX(0.08, 0.05, 0.12), sx * 0.08, 0.025, 0.18);                /* paws */
      P(SPH(0.035, 8, 6), sx * 0.08, 0.79, 0.13);                       /* ears */
    }
    P(CYL(0.025, 0.018, 0.34, 6), 0.17, 0.05, -0.2, 1, 1, 1, Math.PI / 2, 0.6);
  };
  /* ---------- a guard (legionary) facing the viewer ---------- */
  out.guard = (F, x, y, z, side) => {
    const B = M4(F, x, y, z, Math.PI + side * 0.2, 1.3, 1.3, 1.3);
    const P = (g, key, lx, ly, lz, rx, rz) => add(g, key, B.clone().multiply(M4(null, lx, ly, lz, 0, 1, 1, 1, rx, rz)));
    for (const sx of [-1, 1]) { P(CYL(0.045, 0.055, 0.44, 8), 'skin', sx * 0.07, 0.22, 0); P(CYL(0.05, 0.05, 0.2, 8), 'bronze', sx * 0.07, 0.14, 0.01); }
    P(CYL(0.19, 0.15, 0.2, 14), 'red', 0, 0.5, 0);                            /* tunic skirt */
    P(CYL(0.15, 0.16, 0.34, 12), 'iron', 0, 0.75, 0);                         /* lorica */
    for (const t of [0.66, 0.74, 0.82]) P(CYL(0.165, 0.165, 0.02, 12), 'ironDark', 0, t, 0);
    for (const sx of [-1, 1]) P(SPH(0.07, 10, 8), 'iron', sx * 0.15, 0.9, 0);
    P(SPH(0.085, 12, 10), 'skin', 0, 1.03, 0);
    P(SPH(0.095, 12, 8), 'bronze', 0, 1.06, -0.005);
    P(BOX(0.035, 0.08, 0.2), 'red', 0, 1.17, -0.01);                         /* crest */
    P(CYL(0.035, 0.035, 0.36, 8), 'skin', -side * 0.18, 0.72, 0.03, 0, -side * 0.1);
    /* scutum on the outer arm, pilum in the inner hand */
    const sc = new THREE.CylinderGeometry(0.42, 0.42, 0.62, 16, 1, true, -0.55, 1.1); /* a curved shield panel */
    add(sc, 'red', B.clone().multiply(M4(null, side * 0.26, 0.6, -0.3, 0)));
    add(CYL(0.05, 0.05, 0.04, 10), 'gold', B.clone().multiply(M4(null, side * 0.26, 0.6, 0.13, 0, 1, 1, 1, Math.PI / 2)));
    P(CYL(0.014, 0.014, 1.75, 6), 'woodDark', -side * 0.22, 0.88, 0.06);
    P(CYL(0.025, 0, 0.16, 6), 'iron', -side * 0.22, 1.83, 0.06);
  };
  /* ---------- banners: cloth (tinted per arena) + a gold eagle + gold rod ---------- */
  out.banner = (F, x, yTop, z, w, h, dir) => {
    dir = dir || (yTop > 1 ? -1 : 1);
    const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2, -h); sh.lineTo(0, -h + w * 0.32); sh.lineTo(-w / 2, -h); sh.lineTo(-w / 2, 0);
    const g = new THREE.ShapeGeometry(sh);
    const B = M4(F, x, yTop, z + dir * 0.02, dir < 0 ? Math.PI : 0);
    add(g, 'cloth', B, 'cloth');
    const e = new THREE.PlaneGeometry(w * 0.82, w * 0.82); add(e, 'eagle', B.clone().multiply(new THREE.Matrix4().makeTranslation(0, -h * 0.42, 0.012)), 'fixed');
    for (const t of [0.07, 0.12]) add(new THREE.PlaneGeometry(w * 0.92, 0.035), 'gold', B.clone().multiply(new THREE.Matrix4().makeTranslation(0, -t, 0.011)), 'fixed');
    add(CYL(0.03, 0.03, w + 0.24, 8), 'gold', B.clone().multiply(M4(null, 0, 0.0, 0.0, 0, 1, 1, 1, 0, Math.PI / 2)));
    for (const sx of [-1, 1]) add(SPH(0.05, 8, 6), 'gold', B.clone().multiply(new THREE.Matrix4().makeTranslation(sx * (w / 2 + 0.12), 0, 0)));
  };
  /* ---------- a brazier: stone pedestal, bronze bowl, flame (fire layer) — returns the light point (world) ---------- */
  out.brazier = (F, x, y, z, s, o) => {
    s = s || 1; o = o || {};   /* o (pass 7): gold = a gilded bowl, core = the yellow heart's size, light = the night light's strength, lift/dz = where it sits, shadow = it casts shadows */
    add(CYL(0.2 * s, 0.17 * s, 0.1 * s, 14), 'stone', M4(F, x, y + 0.05 * s, z));
    add(CYL(0.13 * s, 0.11 * s, 0.62 * s, 14), 'stone', M4(F, x, y + 0.41 * s, z));
    add(CYL(0.16 * s, 0.2 * s, 0.07 * s, 14), 'stone', M4(F, x, y + 0.75 * s, z));
    const bowl = new THREE.LatheGeometry([[0.0, 0], [0.12, 0.0], [0.22, 0.08], [0.3, 0.2], [0.33, 0.26], [0.3, 0.27], [0.0, 0.24]].map(([r, h]) => new THREE.Vector2(r * s, h * s)), 18);
    add(bowl, o.gold ? 'gold' : 'bronze', M4(F, x, y + 0.78 * s, z));
    const fy = y + 1.03 * s;
    /* teardrop tongues (lathe: round belly, drawn-out tip), an orange body and a yellow heart in front */
    const tongue = (h, r) => new THREE.LatheGeometry(Array.from({ length: 11 }, (_, i) => { const t = i / 10; return new THREE.Vector2(r * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.35)), 0.7) * Math.pow(1 - t, 0.55) + (t === 0 ? 0 : 0), h * t); }), 10);
    for (const [dx, dz, h, r, k, tz] of [[0, 0, 0.62, 0.2, 'flame', 0], [0.1, 0.04, 0.4, 0.12, 'flame', 0.25], [-0.1, -0.02, 0.44, 0.13, 'flame', -0.2], [0, 0.07, 0.36 * (o.core || 1), 0.12 * (o.core || 1), 'flameCore', 0]])
      add(tongue(h * s, r * s), k, M4(F, x + dx * s, fy - 0.03 * s, z + dz * s, 0, 1, 1, 1, 0, tz), 'fire');
    const p = V3(x, fy + 0.22 * s + (o.lift || 0), z + (o.dz || 0)).applyMatrix4(F); return { x: p.x, y: p.y, z: p.z, s: s * (o.light == null ? 1 : o.light), shadow: !!o.shadow };
  };
  /* ---------- the static crowd on the far rows ---------- */
  out.crowd = (rows, LH, UEND) => {
    const body = new THREE.CylinderGeometry(0.075, 0.105, 0.3, 8); body.translate(0, 0.17, 0);
    const lap = new THREE.BoxGeometry(0.2, 0.08, 0.2); lap.translate(0, 0.04, -0.1);
    const head = new THREE.SphereGeometry(0.068, 10, 8); head.translate(0, 0.39, 0);
    const bodyG = mergeG([body, lap]);
    const TUN = ['#efe6d2', '#e6dcc6', '#d9cdb4', '#f2ead8', '#c9b48e', '#b5503a', '#8a6b48', '#7d8a60', '#5f7590', '#c49a52', '#e8d9b0', '#9a5a7a', '#d9c39a', '#a8573d'];
    const SKIN = ['#e0b896', '#c99a74', '#a8764f', '#d9a982', '#8a5a3a', '#efc9a6'];
    const items = [];
    for (const R of rows) {
      const top = R.s * (LH + R.v - R.cut);
      const x0 = Math.min(-R.s * UEND, top) + 0.25, x1 = Math.max(-R.s * UEND, top) - 0.25;
      for (let x = x0; x < x1; x += 0.4) {
        const ax = [-6.4, -1.4].map(a => a * -R.s); if (ax.some(a => Math.abs(x - a) < 0.45)) continue;
        if (Math.abs(x - 3.6 * -R.s) < 0.9 && R.i >= 0 && R.i <= 3) continue;            /* the vomitorium */
        /* clustered occupancy: denser low, thinner up high; never full */
        const n = 0.5 + 0.5 * Math.sin(x * 1.3 + R.i * 2.1) * Math.sin(x * 0.37 + R.i);
        if (rnd() > 0.4 + 0.42 * n - R.i * 0.03) continue;
        items.push({ F: R.F, x: x + (rnd() - 0.5) * 0.08, y: R.y, z: R.v + (rnd() - 0.5) * 0.05, ry: Math.PI + (rnd() - 0.5) * 0.6, t: TUN[Math.floor(rnd() * TUN.length)], k: SKIN[Math.floor(rnd() * SKIN.length)], sc: 1.2 + rnd() * 0.2 });
      }
    }
    const mb = new THREE.InstancedMesh(bodyG, MAT.crowd.mat, items.length), mh = new THREE.InstancedMesh(head, MAT.crowd.mat, items.length);
    const c = new THREE.Color();
    items.forEach((it, i) => { const m = it.F.clone().multiply(M4(null, it.x, it.y, it.z, it.ry, it.sc, it.sc, it.sc)); mb.setMatrixAt(i, m); mh.setMatrixAt(i, m); mb.setColorAt(i, c.set(it.t)); mh.setColorAt(i, c.set(it.k)); });
    for (const m of [mb, mh]) { m.userData.layer = 'fixed'; m.castShadow = true; m.receiveShadow = true; add.scene.add(m); }
    return items.length;
  };
  /* ---------- PASS 9 (his 1a, 2026-10-22): the far rows' crowd = OUR spectators — the live crowd's own sprites (313-v100crowd, the
     production rig92 token pre-rendered in tools/art/crowd100), seated, facing the sand — pass 9d: farL (top-left) faces down-right = sheet
     cell 0, farR (top-right) faces down-left = cell 3 (tools/art/crowd100 renders cell i at YAWS[i] = 45/135/−135/−45, and yaw 45 turns
     the rig's +z front toward +x = screen down-right. The bake reads 313's RAW meta; in the game 321-v101board (G4) reverses
     every cell list at load, so there 313's index 0 = down-left is right and the live stands already face the sand),
     each a quad in the camera plane anchored at the bench's front edge (9d: facing the sand the knees come over the edge and the shins
     hang down the riser to the row below, as seated people do; 9b's inset only worked while they faced along the row),
     tinted by 313's rule (tunic = robe mixed with a home-city wool). Size: f × the inner stands' seated head height (0.459 TW). Same seats
     as pass 8 (the same seeded occupancy: clustered, thinner up high, a few empty seats); one merged mesh, one atlas. ---------- */
  out.crowdSprites = (rows, LH, UEND, o) => {
    const C = window.AMPH111_CROWD; o = Object.assign({ f: 0.85, pitch: 0.4, fans: 0.6, inset: -0.02, full: 0.62, ink: 0 }, window.AMPH111_CROWD_OPT || {}, o || {});
    const RT = V3(Math.SQRT1_2, 0, -Math.SQRT1_2), UP = V3(-0.35355, 0.86603, -0.35355), TO = V3(0.61237, 0.5, 0.61237);
    const NRM = TO.clone().multiplyScalar(0.6).add(V3(0, 0.8, 0)).normalize();
    const pick = (list) => { const tot = list.reduce((a, l) => a + l[1], 0); let r = rnd() * tot; for (const l of list) { if ((r -= l[1]) < 0) return l[0]; } return list[0][0]; };
    const items = [];
    for (const R of rows) {
      const top = R.s * (LH + R.v - R.cut);
      const x0 = Math.min(-R.s * UEND, top) + 0.25, x1 = Math.max(-R.s * UEND, top) - 0.25;
      for (let x = x0; x < x1; x += o.pitch) {
        const ax = [-6.4, -1.4].map(a => a * -R.s); if (ax.some(a => Math.abs(x - a) < 0.45)) continue;
        if (Math.abs(x - 3.6 * -R.s) < 0.9 && R.i >= 0 && R.i <= 3) continue;            /* the vomitorium */
        const n = 0.5 + 0.5 * Math.sin(x * 1.3 + R.i * 2.1) * Math.sin(x * 0.37 + R.i);
        if (rnd() > o.full + 0.3 * n - R.i * 0.03) continue;   /* pass 9c: fuller than pass 8 (≈ 3 in 4 seats), still clustered + thinner up high */
        const k = pick(C.looks), pr = rnd(), row = pr < 0.03 ? 'sitcheer' : pr < 0.06 ? 'sitfist' : 'sit';
        const pal = rnd() < o.fans ? C.FANS : C.ROBES;   /* live: most of the house are fans in their fighter's colour, the rest in their robe */
        const t = C.tintOf(pal[Math.floor(rnd() * pal.length)], C.WOOL[Math.floor(rnd() * C.WOOL.length)]);
        items.push({ R, x: x + (rnd() - 0.5) * 0.08, cell: C.cell(k, row, R.s > 0 ? 3 : 0, t), sc: 0.96 + rnd() * 0.08 });
      }
    }
    const tex = C.finish(MAT.crowdSpr.mat);
    const n = items.length, P = new Float32Array(n * 18), U = new Float32Array(n * 12), N = new Float32Array(n * 18);
    const pxW = o.f * 0.459 / C.hs0 * Math.SQRT2;   /* camera-plane units per native sprite px */
    items.forEach((it, i) => {
      const c = it.cell, [, , w, h, ax, ay] = c.r, s = pxW * it.sc;
      const A = V3(it.x, it.R.y, it.R.edge + o.inset).applyMatrix4(it.R.F).addScaledVector(TO, 0.03);
      const q = (u, v) => A.clone().addScaledVector(RT, (u * w - ax) * s).addScaledVector(UP, (ay - v * h) * s);
      const p00 = q(0, 1), p10 = q(1, 1), p11 = q(1, 0), p01 = q(0, 0);   /* v = 1 is the image bottom */
      const quad = [[p00, c.u0, c.v0], [p10, c.u1, c.v0], [p11, c.u1, c.v1], [p00, c.u0, c.v0], [p11, c.u1, c.v1], [p01, c.u0, c.v1]];
      quad.forEach(([p, u, v], j) => { P.set([p.x, p.y, p.z], (i * 6 + j) * 3); U.set([u, v], (i * 6 + j) * 2); N.set([NRM.x, NRM.y, NRM.z], (i * 6 + j) * 3); });
    });
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(P, 3)); G.setAttribute('uv', new THREE.BufferAttribute(U, 2)); G.setAttribute('normal', new THREE.BufferAttribute(N, 3));
    const m = new THREE.Mesh(G, MAT.crowdSpr.mat); m.userData.layer = 'fixed'; m.castShadow = true; m.receiveShadow = true;
    /* the ink pass: the alpha-tested cut-out writes depth (so the stone's own ink lines never cross a figure) and alpha = ink. 9d: ink 0
       = no bake ink on or round a figure (amph111.html's post pass skips alpha-0 neighbours): the sprites carry their own painted outline,
       as in the live stands; the depth ink drew a grey halo round the hanging legs */
    m.userData.nmat = new THREE.ShaderMaterial({ side: THREE.DoubleSide, uniforms: { map: { value: tex }, ink: { value: o.ink || 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform sampler2D map; uniform float ink; varying vec2 vUv; void main(){ if (texture2D(map, vUv).a < 0.5) discard; gl_FragColor = vec4(0.5, 0.5, 1.0, ink); }' });
    add.scene.add(m);
    return { n, cells: C.stats.cells, atlas: C.stats.atlas };
  };
  function mergeG(list) {
    const gs = list.map(g => g.index ? g.toNonIndexed() : g); let n = 0; for (const g of gs) n += g.attributes.position.count;
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3); let o = 0;
    for (const g of gs) { P.set(g.attributes.position.array, o * 3); N.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; }
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(P, 3)); G.setAttribute('normal', new THREE.BufferAttribute(N, 3)); return G;
  }
  /* ---------- PASS 7: the façade's greenery (his front picture) — a potted cypress, ivy up a pier ---------- */
  out.cypress = (F, x, y, z, s) => {
    s = s || 1;
    const pot = [[0, 0], [0.15, 0], [0.18, 0.05], [0.22, 0.28], [0.26, 0.31], [0.25, 0.35], [0, 0.35]].map(([r, h]) => new THREE.Vector2(r * s, h * s));
    add(new THREE.LatheGeometry(pot, 16), 'terra', M4(F, x, y, z));
    /* a tall flame-shaped tree: a fat lower third drawn out to a point */
    const H = 1.55 * s, prof = Array.from({ length: 14 }, (_, i) => { const t = i / 13; return new THREE.Vector2(i === 0 ? 0.04 * s : 0.25 * s * Math.pow(Math.sin(Math.PI * Math.min(1, 0.1 + t * 1.25)), 0.7) * (1 - 0.8 * t), H * t); });
    add(new THREE.LatheGeometry(prof, 12), 'leaf', M4(F, x, y + 0.3 * s, z));
    for (let i = 0; i < 7; i++) { const t = 0.12 + i * 0.11, r = 0.2 * s * (1 - t * 0.8); const a = rnd() * 6.28;
      add(SPH(0.1 * s * (1 - t * 0.6), 8, 6), 'leafLt', M4(F, x + Math.cos(a) * r * 0.6, y + 0.3 * s + H * t, z + Math.abs(Math.sin(a)) * r * 0.7 + 0.04, 0, 1, 1.5, 0.8)); }
  };
  out.ivy = (F, x, y0, y1, z, w) => {
    /* leafy clumps up the pier's face (frame z = the face), thicker at the foot, a few spilling round the capital */
    const n = Math.round((y1 - y0) / 0.09);
    for (let i = 0; i < n; i++) { const t = i / n, yy = y0 + (y1 - y0) * t, spread = w * (0.55 - 0.3 * t) + 0.05;
      for (let j = 0; j < (t < 0.3 ? 2 : 1); j++) add(SPH(0.075 + rnd() * 0.05, 7, 5), rnd() < 0.35 ? 'leafLt' : 'leaf', M4(F, x + (rnd() - 0.5) * spread + Math.sin(t * 9) * 0.06, yy, z + 0.02, 0, 1, 1, 0.5)); }
    for (let j = 0; j < 4; j++) add(SPH(0.08, 7, 5), 'leaf', M4(F, x + (j - 1.5) * 0.12, y1 + 0.05 + rnd() * 0.06, z + 0.04, 0, 1, 0.8, 0.6));
  };
  return out;
};
