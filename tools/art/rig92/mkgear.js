/* rig92/mkgear.js — v1.0 (his pick c, 2026-10-11): SCULPT THE PRINTED PIECES ONCE, AT BUILD TIME → assets/gear100.js
   + (his 2a) THE BODY'S CORE ONCE → assets/body100.js (window.BODY100: the token body's mesh, skin weights, face paint, crease ink and harness
   points — body.js coreSteps — quantised + meshopt codecs + deflate; gear8.js loadBody8 decodes it; the clothing shells, materials and every
   look option are still assembled on the device). --nobody skips it.
     node tools/art/rig92/mkgear.js [--tris 1550] [--btris 60000] [--berr 0.01] [--bfull] [--nobody] [--qbits 12] [--cbits 6] [--level 3] [--vver 1] [--full] [--only murmillo,thorax] [--out file.js] [--stats file.json] [--cache dir] [--port 8794]
   (--cache keeps each raw sculpt by the sources' hash, so trying other budgets skips the sculptor)
   1. A headless page (mkgear.html) builds the token body exactly as the game does (game.js createToken defaults) and runs the SDF
      sculptor (sculpt.js) on every printed helmet, cuirass, belt and limb piece (limbs on the LEFT only — the game mirrors them).
   2. Here each mesh is SIMPLIFIED with meshoptimizer (MIT, vendor/) to its triangle budget, keeping its painted colours (attribute-aware
      simplification), quantised (positions 16 bit in the piece's box, colours 8-bit sRGB), compressed with meshoptimizer's codecs,
      deflated, and written as ONE plain script: window.GEAR100 = {v, body, src, z, pieces, b64} (works on file://, the site and the
      standalone's data: URLs). Stats → tools/plans/look100/r9_gear_stats.json.
   Re-run after editing body.js, rig.js, sculpt.js or the body options in game.js (BODY8) — tv100g fails when the sources moved on. */
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'), path = require('path'), zlib = require('zlib'), crypto = require('crypto');
const HERE = __dirname, ROOT = path.resolve(HERE, '../../..');
const argv = process.argv.slice(2); const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const OUTB = path.resolve(opt('outbody', path.join(ROOT, 'assets', 'body100.js'))), NOBODY = argv.includes('--nobody');
/* the body's triangle budget + error cap (his 2a: simplified like the pieces); --bfull = as built */
const BTRIS = +opt('btris', 60000), BERR = +opt('berr', 0.01), BFULL = argv.includes('--bfull');
const OUT = path.resolve(opt('out', path.join(ROOT, 'assets', 'gear100.js'))), STATS = path.resolve(opt('stats', path.join(ROOT, 'tools/plans/look100/r9_gear_stats.json')));
const VL = +opt('level', 3), VV = +opt('vver', 1), QB = +opt('qbits', 12), QM = (1 << QB) - 1, CQ = 1 << (8 - +opt('cbits', 6)), CACHE = opt('cache', ''), PORT = +opt('port', 8794), FULL = argv.includes('--full'), ONLY = (opt('only', '') || '').split(',').filter(Boolean), TRIS = +opt('tris', 1550);
/* triangle budget per piece kind (× --tris): helmets carry the most detail that reads on the board, wraps the least */
const KIND_K = { h: 1.25, c: 1.25, b: 0.6, l: 0.75 }, KEY_K = { wraps: 0.45, legwraps: 0.5, thorax: 1.3, legwrapsU: 1.0, femoralia: 1.0, thighplate: 1.0, crista: 1.1, thrachelm: 1.25, flavhelm: 1.2 };
/* the sources the bake depends on: a change means re-run (tv100g checks this hash) */
const SRC = ['body.js', 'rig.js', 'sculpt.js', 'gear8.js'];
const srcHash = () => crypto.createHash('sha1').update(SRC.map(f => fs.readFileSync(path.join(HERE, f), 'utf8')).join('\n')).digest('hex').slice(0, 12);
module.exports = { srcHash };
if (require.main !== module) return;

const f32 = (b) => { const u = Buffer.from(b, 'base64'); return new Float32Array(u.buffer, u.byteOffset, u.byteLength / 4); };
const u32 = (b) => { const u = Buffer.from(b, 'base64'); return new Uint32Array(u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength)); };
const srgb8 = (c) => Math.max(0, Math.min(255, Math.round((c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055) * 255)));

(async () => {
  const { MeshoptSimplifier: SIMP } = await import(path.join(HERE, 'vendor/meshopt_simplifier.mjs'));
  const { MeshoptEncoder: ENC } = await import(path.join(HERE, 'vendor/meshopt_encoder.mjs'));
  await SIMP.ready; await ENC.ready;
  const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 700));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now(); const stats = { at: new Date().toISOString(), tris: TRIS, full: FULL, pieces: {} };
  try {
    const pg = await browser.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.goto(`http://127.0.0.1:${PORT}/tools/art/rig92/mkgear.html`); await pg.waitForFunction(() => window.MKG_READY, null, { timeout: 60000 });
    const body = { key: await pg.evaluate(() => window.MKG.bodyKey()) }; let bodyOk = false;
    const K = await pg.evaluate(() => window.MKG.keys()); const keys = [...K.helm, ...K.cuir, ...K.belt, ...K.limb].filter(k => !ONLY.length || ONLY.includes(k));
    const parts = [], pieces = {}; let off = 0; let sculptMs = 0, trisFull = 0, trisOut = 0;
    for (const k of keys) {
      const cf = CACHE && path.join(CACHE, srcHash() + '_' + k + '.json'); let r = cf && fs.existsSync(cf) ? JSON.parse(fs.readFileSync(cf, 'utf8')) : null;
      if (!r) { if (!bodyOk) { const b2 = await pg.evaluate(() => window.MKG.body()); stats.bodyMs = b2.ms; bodyOk = true; } r = await pg.evaluate((k) => window.MKG.one(k), k); if (cf) { fs.mkdirSync(CACHE, { recursive: true }); fs.writeFileSync(cf, JSON.stringify(r)); } }
      sculptMs += r.ms; trisFull += r.tris;
      const pos = f32(r.pos), col = f32(r.col); let idx = u32(r.idx); const nv0 = pos.length / 3;
      /* simplify (colour-aware) to the budget */
      const budget = Math.round(TRIS * (KIND_K[r.t] || 1) * (KEY_K[k] || 1));
      let err = 0; if (!FULL && idx.length / 3 > budget) { const res = SIMP.simplifyWithAttributes(idx, pos, 3, col, 3, [0.6, 0.6, 0.6], null, budget * 3, 0.05, []); idx = res[0]; err = res[1]; }
      /* compact + reorder for the codecs */
      const ix = new Uint32Array(idx); const [remap, nv] = ENC.reorderMesh(ix, true, false);
      const P = new Float32Array(nv * 3), C = new Float32Array(nv * 3); for (let v = 0; v < nv0; v++) { const n = remap[v]; if (n === 0xffffffff || n >= nv) continue; for (let a = 0; a < 3; a++) { P[n * 3 + a] = pos[v * 3 + a]; C[n * 3 + a] = col[v * 3 + a]; } }
      const lo = [0, 1, 2].map(a => { let m = 1e9; for (let v = 0; v < nv; v++) m = Math.min(m, P[v * 3 + a]); return +m.toFixed(5); }), hi = [0, 1, 2].map(a => { let m = -1e9; for (let v = 0; v < nv; v++) m = Math.max(m, P[v * 3 + a]); return +m.toFixed(5); });
      const q = new Uint16Array(nv * 4), c8 = new Uint8Array(nv * 4);
      for (let v = 0; v < nv; v++) for (let a = 0; a < 3; a++) { const span = hi[a] - lo[a] || 1; q[v * 4 + a] = Math.max(0, Math.min(QM, Math.round((P[v * 3 + a] - lo[a]) / span * QM))); const c = srgb8(C[v * 3 + a]); c8[v * 4 + a] = Math.min(255, Math.round(c / CQ) * CQ); }
      const vp = ENC.encodeVertexBufferLevel(new Uint8Array(q.buffer), nv, 8, VL, VV), vc = ENC.encodeVertexBufferLevel(c8, nv, 4, VL, VV), ib = ENC.encodeIndexBuffer(new Uint8Array(ix.buffer), ix.length, 4);
      const d = { t: r.t, nv, ni: ix.length, lo, hi }; if (r.s) d.s = r.s;
      for (const [nm, buf] of [['p', vp], ['c', vc], ['i', ib]]) { d[nm] = [off, buf.length]; parts.push(Buffer.from(buf)); off += buf.length; }
      pieces[k] = d; trisOut += ix.length / 3;
      stats.pieces[k] = { kind: r.t, sculptMs: r.ms, trisSculpt: r.tris, trisFine: r.trisFine, tris: ix.length / 3, verts: nv, err: +err.toFixed(5), bytes: vp.length + vc.length + ib.length };
      console.log(`${k.padEnd(11)} ${r.t} sculpt ${String(r.ms).padStart(5)} ms · ${String(r.tris).padStart(6)} → ${String(ix.length / 3).padStart(5)} tris · ${(vp.length + vc.length + ib.length)} B`);
    }
    /* ---- the body's core (his 2a): positions 14 bit in the box (≈0.1 mm), normals octahedral 8 bit (≤1.1°), weights 8 bit ---- */
    if (!NOBODY) {
      if (!bodyOk) { const b2 = await pg.evaluate(() => window.MKG.body()); stats.bodyMs = b2.ms; bodyOk = true; }
      const c = await pg.evaluate(() => window.MKG.core()); const nv0 = c.nv;
      const pos = f32(c.pos), nor = f32(c.nor), ink = f32(c.ink), sI = (() => { const u = Buffer.from(c.skinI, 'base64'); return new Uint16Array(u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength)); })(), sW = f32(c.skinW), grp = Buffer.from(c.grp, 'base64'), vk = Buffer.from(c.vk, 'base64');
      /* his 2a "the same way": SIMPLIFIED like the pieces (meshoptimizer, attribute-aware: normals + crease ink), to --btris triangles.
         Locked: every vertex on a paint edge (eyes, brows, lips: vk differs across a triangle) or a body-group edge, so the painted face
         and the group masks the clothing shells read keep their lines. --bfull ships the body as built. */
      let ix0 = u32(c.tri), berr = 0; const tris0 = ix0.length / 3;
      if (!BFULL && tris0 > BTRIS) {
        const lock = new Uint8Array(nv0);
        for (let t = 0; t < ix0.length; t += 3) { const a = ix0[t], b = ix0[t + 1], d = ix0[t + 2];
          if (vk[a] !== vk[b] || vk[a] !== vk[d] || grp[a] !== grp[b] || grp[a] !== grp[d]) lock[a] = lock[b] = lock[d] = 1; }
        const att = new Float32Array(nv0 * 4); for (let v = 0; v < nv0; v++) { att[v * 4] = nor[v * 3]; att[v * 4 + 1] = nor[v * 3 + 1]; att[v * 4 + 2] = nor[v * 3 + 2]; att[v * 4 + 3] = ink[v]; }
        const res = SIMP.simplifyWithAttributes(ix0, pos, 3, att, 4, [0.25, 0.25, 0.25, 1.0], lock, BTRIS * 3, BERR, []); ix0 = res[0]; berr = res[1];
        stats.bodyLocked = lock.reduce((a, b) => a + b, 0);
      }
      const ix = new Uint32Array(ix0); const [remap, nv] = ENC.reorderMesh(ix, true, false);
      const lo = [0, 1, 2].map(a => { let m = 1e9; for (let v = 0; v < nv0; v++) m = Math.min(m, pos[v * 3 + a]); return +(m - 1e-4).toFixed(5); }), hi = [0, 1, 2].map(a => { let m = -1e9; for (let v = 0; v < nv0; v++) m = Math.max(m, pos[v * 3 + a]); return +(m + 1e-4).toFixed(5); });
      const BQ = 16383, P = new Uint16Array(nv * 4), N = new Float32Array(nv * 4), I = new Uint8Array(nv * 4), W = new Uint8Array(nv * 4), M = new Uint8Array(nv * 4);
      for (let v = 0; v < nv0; v++) { const n = remap[v]; if (n === 0xffffffff || n >= nv) continue;
        for (let a = 0; a < 3; a++) { P[n * 4 + a] = Math.max(0, Math.min(BQ, Math.round((pos[v * 3 + a] - lo[a]) / (hi[a] - lo[a]) * BQ))); N[n * 4 + a] = nor[v * 3 + a]; }
        /* weights to 8 bits that still add up to 255 (the rounding goes to the heaviest bone) */
        let sum = 0, big = 0; for (let a = 0; a < 4; a++) { if (sI[v * 4 + a] > 255) throw new Error('bone index > 255'); I[n * 4 + a] = sI[v * 4 + a]; W[n * 4 + a] = Math.round(sW[v * 4 + a] * 255); sum += W[n * 4 + a]; if (W[n * 4 + a] > W[n * 4 + big]) big = a; }
        W[n * 4 + big] = Math.max(0, Math.min(255, W[n * 4 + big] + 255 - sum));
        M[n * 4] = grp[v]; M[n * 4 + 1] = vk[v]; M[n * 4 + 2] = Math.max(0, Math.min(255, Math.round(ink[v] * 255))); }
      const bp = [], bs = {}; let bo = 0;
      for (const [nm, buf] of [['p', ENC.encodeVertexBufferLevel(new Uint8Array(P.buffer), nv, 8, VL, VV)], ['n', ENC.encodeVertexBufferLevel(ENC.encodeFilterOct(N, nv, 4, 8), nv, 4, VL, VV)], ['i', ENC.encodeVertexBufferLevel(I, nv, 4, VL, VV)],
        ['w', ENC.encodeVertexBufferLevel(W, nv, 4, VL, VV)], ['m', ENC.encodeVertexBufferLevel(M, nv, 4, VL, VV)], ['t', ENC.encodeIndexBuffer(new Uint8Array(ix.buffer), ix.length, 4)]]) { bs[nm] = [bo, buf.length]; bp.push(Buffer.from(buf)); bo += buf.length; }
      const braw = Buffer.concat(bp), bz = zlib.deflateRawSync(braw, { level: 9 }); const rnd = (a) => JSON.parse(JSON.stringify(a, (k, v) => typeof v === 'number' ? +v.toFixed(5) : v));
      const bdata = { v: 1, key: body.key, src: srcHash(), at: stats.at.slice(0, 10), nv, ni: ix.length, grid: c.grid, lo, hi, q: BQ, s: bs, anc: rnd(c.anc), z: 1, b64: bz.toString('base64') };
      const bjs = '/* assets/body100.js — GENERATED by tools/art/rig92/mkgear.js (v1.0, his 2a): the token body\'s core (body.js coreSteps), built once at build time\n   (quantised + meshoptimizer codecs, MIT). Loaded on demand with the token modeller (222-v93token / 276-v100gear); gear8.js loadBody8 decodes it. */\nwindow.BODY100=' + JSON.stringify(bdata) + ';\n';
      if (!ONLY.length) fs.writeFileSync(OUTB, bjs);
      stats.body = { coreMs: c.ms, verts: nv, tris: ix.length / 3, trisBuilt: tris0, err: +berr.toFixed(5), locked: stats.bodyLocked || 0, codec: braw.length, deflated: bz.length, fileBytes: bjs.length, streams: Object.fromEntries(Object.entries(bs).map(([k, r]) => [k, r[1]])) };
      console.log(`body core ${nv} verts · ${tris0} → ${ix.length / 3} tris (err ${berr.toFixed(5)}) · codec ${braw.length} B · deflate ${bz.length} B · file ${bjs.length} B${ONLY.length ? ' (not written: --only)' : ' → ' + OUTB}`);
    }
    const raw = Buffer.concat(parts), z = zlib.deflateRawSync(raw, { level: 9 });
    const data = { v: 1, body: body.key, src: srcHash(), z: 1, q: QM, at: stats.at.slice(0, 10), pieces, b64: z.toString('base64') };
    const js = '/* assets/gear100.js — GENERATED by tools/art/rig92/mkgear.js (v1.0): the printed armor pieces, sculpted once at build time\n   (sculpt.js SDF sculpts → meshoptimizer simplify + codecs, MIT). Loaded on demand with the token modeller (222-v93token / 276-v100gear). */\nwindow.GEAR100=' + JSON.stringify(data) + ';\n';
    if (!ONLY.length) fs.writeFileSync(OUT, js);
    Object.assign(stats, { keys: keys.length, sculptMs, trisSculpt: trisFull, trisOut, rawBytes: raw.length, deflated: z.length, fileBytes: js.length, totalMs: Date.now() - T0, errs: errs.slice(0, 5) });
    fs.writeFileSync(STATS, JSON.stringify(stats, null, 1));
    console.log(`pieces ${keys.length} · sculpt ${sculptMs} ms · tris ${trisFull} → ${trisOut} · codec ${raw.length} B · deflate ${z.length} B · file ${js.length} B${ONLY.length ? ' (not written: --only)' : ' → ' + OUT}`);
    if (errs.length) console.log('page errors:', errs);
  } finally { await browser.close(); srv.kill(); }
})().catch(e => { console.error(e); process.exit(1); });
