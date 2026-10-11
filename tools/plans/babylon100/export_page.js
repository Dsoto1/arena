/* babylon100/export_page.js — runs inside export.html (headless, driven by export.js).
   GLADIATORS: the real rig92 token engine (assets/tok93.js + assets/three93.js + the pre-baked printed gear assets/gear100.js) builds a
   figure, wears a class kit and takes the armed stand; every visible mesh (skinned body, shells, baked gear, weapons) is then BAKED to
   world space on the CPU (SkinnedMesh.getVertexPosition), coloured per vertex (vertex colour × material colour, the skin's cavity ink),
   masked-out shell triangles dropped, outlines/base skipped. Pose B = the same stand breathing (chest/head a few degrees, pelvis 8 mm
   lower) with the SAME vertex order, so Babylon can blend A↔B as a morph target (the idle).
   BEASTS: look100/beast3_rig.js (fetched, + one export line, imported as a blob module) sculpts idle0..idle3 frames (flipbook idle).
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
    const P = [], C = [], I = []; const names = [];
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
      for (let i = 0; i < n; i++) {
        o.getVertexPosition(i, v); v.applyMatrix4(o.matrixWorld);
        P.push(v.x * k, v.y * k, v.z * k);
        let r = mc.r, gg = mc.g, b = mc.b; if (vc) { r *= ca.getX(i); gg *= ca.getY(i); b *= ca.getZ(i); }
        if (cav) { const c = cav.getX(i); const d = 1 - 0.26 * smooth(0.16, 0.28, c); r *= d; gg *= d; b *= d; const ink = smooth(0.5, 0.58, c) * 0.92; r += (0.011 - r) * ink; gg += (0.007 - gg) * ink; b += (0.006 - b) * ink; }
        C.push(r, gg, b);
      }
      const ix = g.index ? g.index.array : null; const nt = ix ? ix.length / 3 : n / 3;
      for (let t = 0; t < nt; t++) {
        const a = ix ? ix[t * 3] : t * 3, bb = ix ? ix[t * 3 + 1] : t * 3 + 1, c = ix ? ix[t * 3 + 2] : t * 3 + 2;
        if (ma && (ma.getX(a) < 0 || ma.getX(bb) < 0 || ma.getX(c) < 0)) continue;   /* the shader discards these */
        I.push(base + a, base + bb, base + c);
      }
    });
    return { pos: new Float32Array(P), col: new Float32Array(C), idx: new Uint32Array(I), names };
  }

  window.EXP = {
    async init() { const t0 = performance.now(); API = await LIB.createToken(); MMPM = (await import('../../art/rig92/rig.js')).MM_PER_M; return { ms: Math.round(performance.now() - t0), baked: API.baked, why: API.bakeWhy, mmpm: MMPM }; },
    /* look + gear + armed stand → pose A; the breathing pose B on top */
    glad(look, gear) {
      const api = API; const t0 = performance.now();
      api.apply({ look, gear, pose: api.standFor(gear) });
      const A = bakeFigure(api);
      const sp = api.joint('sp'), ch = api.joint('ch'), he = api.joint('he'), off = api.offset();
      api.setJoint('sp', [sp[0] + 3, sp[1], sp[2]]); api.setJoint('ch', [ch[0] - 4, ch[1] + 3, ch[2]]); api.setJoint('he', [he[0] + 4, he[1] + 9, he[2]]);
      api.setOffset([off[0], off[1] - 8, off[2]]);
      const Bf = bakeFigure(api);
      if (Bf.pos.length !== A.pos.length) throw new Error('pose B changed the vertex count');
      return { pos: b64(A.pos), posB: b64(Bf.pos), col: b64(A.col), idx: b64(A.idx), nv: A.pos.length / 3, nt: A.idx.length / 3, names: A.names, ms: Math.round(performance.now() - t0) };
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
        out.push({ n, pos: b64(pos), col: b64(new Float32Array(r.geo.attributes.color.array)), idx: b64(new Uint32Array(r.geo.index.array)), nv: r.verts, nt: r.tris }); }
      return { key, base: [B.base[0] > 30 ? 1.1 : 0.8, B.base[0] > 30 ? 1.1 * B.base[1] / B.base[0] : 0.8], rim: B.rim, frames: out, ms: Math.round(performance.now() - t0) };
    },
  };
  window.EXP_READY = true;
})();
