/* babylon100/export_page.js — runs inside export.html (headless, driven by export.js).
   GLADIATORS: the real rig92 token engine (assets/tok93.js + assets/three93.js + the pre-baked printed gear assets/gear100.js) builds a
   figure, wears a class kit and takes the armed stand; every visible mesh (skinned body, shells, baked gear, weapons) is then BAKED to
   world space on the CPU (SkinnedMesh.getVertexPosition), coloured per vertex (vertex colour × material colour, the skin's cavity ink),
   masked-out shell triangles dropped, outlines/base skipped. The SKIN comes along: rig92's bones (their matrices at this pose = the bind
   pose) + every vertex's own bone indices/weights (rigid helmets/weapons = 100% on the bone they ride), so Babylon animates it on the GPU.
   BEASTS: look100/beast3_rig.js (fetched, + one export line, imported as a blob module) sculpts idle0 + its joint list (JL); export.js
   skins it to those joints (nearest bone segments) — one skeleton per species.
   Units out: TILES (1 tile = 31.75 mm of the mini: the 25.4 mm base is 0.8 tile), y up, figure facing +z. */
(function () {
  const T = window.THREE93, LIB = window.TOK93LIB(T);
  const TILE_MM = 31.75;
  const b64 = (ta) => { const u = new Uint8Array(ta.buffer, ta.byteOffset, ta.byteLength); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  let API = null, MMPM = 0;

  function visibleUp(o, stop) { for (let p = o; p && p !== stop; p = p.parent) if (!p.visible) return false; return true; }
  /* one posed figure → {pos(Float32, tiles), col(Float32 linear), idx(Uint32), src:[mesh names]} */
  function bakeFigure(api) {
    const root = api.turn; root.updateMatrixWorld(true); const B = api.B;
    const P = [], C = [], I = [], SJ = [], SW = []; const names = [];
    /* the skeleton: rig92's bones by key; every vertex keeps its own skin weights (rigid bits = 100% on the bone they ride) */
    const keys = Object.keys(api.rig.bones), boneIx = new Map(keys.map((k, i) => [api.rig.bones[k], i]));
    const rigidBone = (o) => { for (let p = o.parent; p; p = p.parent) if (boneIx.has(p)) return boneIx.get(p); return boneIx.get(api.rig.bones.pe); };
    const v = new T.Vector3();
    const k = MMPM / TILE_MM;
    root.traverse(o => {
      if (!o.isMesh || !visibleUp(o, root)) return;
      for (let p = o; p; p = p.parent) if (p === api.baseG) return;
      const m = Array.isArray(o.material) ? o.material[0] : o.material;
      if (!m || m === B.mats.out || (m.isMeshBasicMaterial && m.side === T.BackSide)) return;   /* ink hulls */
      if (m.userData && m.userData.u && !m.isMeshToonMaterial) return;
      const g = o.geometry, pa = g.attributes.position; if (!pa) return; const n = pa.count;
      const ca = g.attributes.color, ma = g.attributes.mask, cav = g.attributes.cav;
      const mc = m.color ? m.color : new T.Color(1, 1, 1); const vc = !!(m.vertexColors && ca);
      const base = P.length / 3; names.push(o.name || o.type);
      const si = o.isSkinnedMesh && g.attributes.skinIndex, sw = o.isSkinnedMesh && g.attributes.skinWeight, rb = si ? 0 : rigidBone(o);
      const gmap = si ? o.skeleton.bones.map(b => boneIx.has(b) ? boneIx.get(b) : rigidBone(b)) : null;
      for (let i = 0; i < n; i++) {
        o.getVertexPosition(i, v); v.applyMatrix4(o.matrixWorld);
        P.push(v.x * k, v.y * k, v.z * k);
        let r = mc.r, gg = mc.g, b = mc.b; if (vc) { r *= ca.getX(i); gg *= ca.getY(i); b *= ca.getZ(i); }
        if (cav) { const c = cav.getX(i); const d = 1 - 0.26 * smooth(0.16, 0.28, c); r *= d; gg *= d; b *= d; const ink = smooth(0.5, 0.58, c) * 0.92; r += (0.011 - r) * ink; gg += (0.007 - gg) * ink; b += (0.006 - b) * ink; }
        C.push(r, gg, b);
        if (si) for (let q = 0; q < 4; q++) { SJ.push(gmap[si.getComponent(i, q)] || 0); SW.push(sw.getComponent(i, q)); } else SJ.push(rb, 0, 0, 0), SW.push(1, 0, 0, 0);
      }
      const ix = g.index ? g.index.array : null; const nt = ix ? ix.length / 3 : n / 3;
      for (let t = 0; t < nt; t++) {
        const a = ix ? ix[t * 3] : t * 3, bb = ix ? ix[t * 3 + 1] : t * 3 + 1, c = ix ? ix[t * 3 + 2] : t * 3 + 2;
        if (ma && (ma.getX(a) < 0 || ma.getX(bb) < 0 || ma.getX(c) < 0)) continue;   /* the shader discards these */
        I.push(base + a, base + bb, base + c);
      }
    });
    /* each bone's matrix in tile space at THIS pose (the posed mesh is the bind pose) + its parent */
    const bones = keys.map(kk => { const bn = api.rig.bones[kk]; bn.updateWorldMatrix(true, false); const W = new T.Matrix4().makeScale(k, k, k).multiply(bn.matrixWorld);
      let par = -1; for (let p = bn.parent; p; p = p.parent) if (boneIx.has(p)) { par = boneIx.get(p); break; } return { k: kk, par, m: W.elements.slice() }; });
    return { pos: new Float32Array(P), col: new Float32Array(C), idx: new Uint32Array(I), sj: new Uint16Array(SJ), sw: new Float32Array(SW), bones, names };
  }

  window.EXP = {
    async init() { const t0 = performance.now(); API = await LIB.createToken(); MMPM = (await import('../../art/rig92/rig.js')).MM_PER_M; return { ms: Math.round(performance.now() - t0), baked: API.baked, why: API.bakeWhy, mmpm: MMPM }; },
    /* look + gear + armed stand → pose A; the breathing pose B on top */
    glad(look, gear) {
      const api = API; const t0 = performance.now();
      api.apply({ look, gear, pose: api.standFor(gear) });
      const A = bakeFigure(api);
      return { pos: b64(A.pos), col: b64(A.col), idx: b64(A.idx), sj: b64(A.sj), sw: b64(A.sw), bones: A.bones, nv: A.pos.length / 3, nt: A.idx.length / 3, names: A.names, ms: Math.round(performance.now() - t0) };
    },
    async beast(key, frames) {
      if (!window.__B3) {
        let src = await (await fetch('../look100/beast3_rig.js')).text();
        src = src.replace(/from 'three'/g, "from '" + new URL('../../art/rig92/vendor/three.module.min.js', location.href).href + "'");
        src += '\nexport { quad, meshOf };\n';
        window.__B3 = await import(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
      }
      const M = window.__B3; const B = M.BEASTS[key]; const S = M.SPECIES[B.sp]; const v = M.VARIANTS[key] || [B.sp]; const COL = Object.assign({}, S.col, v[1] || {});
      const all = M.quadFrames(B.sp); const out = []; const t0 = performance.now();
      /* scale to tiles: long bases are drawn 1.1 tile long, the figure ×sc on it (look100 round 2 board rule); round bases 0.8 tile */
      const k = (B.base[0] > 30 ? 1.1 / B.base[0] : 0.8 / 25.4) * (B.sc || 1);
      for (const n of frames) { const f = all.find(x => x.n === n); const r = M.meshOf(M.quad(S, f, COL), S.h); const p = r.geo.attributes.position.array; const pos = new Float32Array(p.length); for (let i = 0; i < p.length; i++) pos[i] = p[i] * k;
        const joints = M.JL.map(j => ({ n: j.n, par: j.par || null, p: j.p.map(v => v * k) }));
        out.push({ n, joints, pos: b64(pos), col: b64(new Float32Array(r.geo.attributes.color.array)), idx: b64(new Uint32Array(r.geo.index.array)), nv: r.verts, nt: r.tris }); }
      return { key, base: [B.base[0] > 30 ? 1.1 : 0.8, B.base[0] > 30 ? 1.1 * B.base[1] / B.base[0] : 0.8], rim: B.rim, frames: out, ms: Math.round(performance.now() - t0) };
    },
  };
  window.EXP_READY = true;
})();
