/* rig92/mkgear.js — v1.0 (his pick c, 2026-10-11): SCULPT THE PRINTED PIECES ONCE, AT BUILD TIME → assets/gear100.js
     node tools/art/rig92/mkgear.js [--tris 1550] [--qbits 12] [--cbits 6] [--level 3] [--vver 1] [--full] [--only murmillo,thorax] [--out file.js] [--stats file.json] [--cache dir] [--port 8794]
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
