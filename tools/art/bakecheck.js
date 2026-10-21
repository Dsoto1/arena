/* =====================================================================
   tools/art/bakecheck.js — v1.08c BAKE REPRODUCIBILITY CHECK (tools/plans/v108c/NOTES.md item 6, his 6a).
   Re-renders a SMALL SAMPLE with the real bake scripts in their --check mode (nothing committed is touched: sheets, encoder output and the
   META blocks go to tools/art/anim100 and anim100b, out/check/), then compares with the committed game files:
     class  soldier move sheet  (anim100/make.js x2 soldier move --check)    → ANIM100_META.soldier.move, assets/anim100_soldier_move.webp, anim100x2_…
     beast  moechus             (anim100b/make.js l106 moechus --check)      → BEAST100_META.moechus, L106_BMETA moechus[_act], assets/beast100_moechus[_act],
                                                                               anim106[p]_beast_moechus[_act]_sh.webp  (the sheets that differed on 2026-10-18)
   Pass = META EXACTLY equal (cell sizes, anchors, rows: a different crop box shows here) AND pixels within a tolerance (the encoders are lossy
   and version-dependent, bytes are not the goal): mean <= BAKE_TOL_MEAN (1.0), max <= BAKE_TOL_MAX (64) per RGB channel over the visible pixels.
   Also writes tools/art/BAKE_VERSIONS.json: node, Playwright, Chromium, the WebGL renderer, three.js, PIL, libwebp, git HEAD.
     node tools/art/bakecheck.js                 render both samples (about 2–5 minutes on SwiftShader), compare, write the versions
     node tools/art/bakecheck.js class|beast     one sample
     node tools/art/bakecheck.js --compare       no render: compare what is already in out/check (a second run to see nondeterminism: --keep, see below)
     node tools/art/bakecheck.js --versions      only write BAKE_VERSIONS.json
     --twice   render each sample twice and also compare run 1 with run 2 (is the bake itself deterministic?)
   Needs flavius-arena.html built (sh build.sh): the class kits are read from it. Exit 1 on any meta mismatch / over-tolerance pixel.
   ===================================================================== */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '../..'), A = path.join(ROOT, 'assets'), ART = __dirname;
const OUTS = { class: path.join(ART, 'anim100/out/check'), beast: path.join(ART, 'anim100b/out/check') };
const args = process.argv.slice(2);
const want = ['class', 'beast'].filter(k => args.includes(k)); const SAMPLES = want.length ? want : ['class', 'beast'];
const TOL = { mean: +(process.env.BAKE_TOL_MEAN || 1.0), max: +(process.env.BAKE_TOL_MAX || 64) };
const run = (cmd, a, o) => cp.execFileSync(cmd, a, Object.assign({ cwd: ROOT, maxBuffer: 1 << 28 }, o)).toString();
const sh = (cmd, a) => { try { return run(cmd, a).trim(); } catch (e) { return 'unavailable: ' + String(e.message || e).split('\n')[0].slice(0, 120); } };

async function versions() {
  const v = { at: new Date().toISOString(), node: process.version, platform: process.platform + ' ' + process.arch };
  try { v.playwright = require('playwright/package.json').version; } catch (e) { v.playwright = 'unavailable'; }
  try { const { chromium } = require('playwright'); const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
    v.chromium = b.version(); const pg = await b.newPage();
    v.webgl = await pg.evaluate(() => { try { const g = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl'); const x = g.getExtension('WEBGL_debug_renderer_info');
      return x ? g.getParameter(x.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER); } catch (e) { return 'unavailable'; } });
    await b.close(); } catch (e) { v.chromium = 'unavailable: ' + String(e.message || e).slice(0, 100); }
  try { const t = fs.readFileSync(path.join(A, 'three93.js'), 'utf8'); const m = /const t="(\d{3})"/.exec(t.slice(0, 600)) || /REVISION[:=]\s*"?(\d+)"?/.exec(t); v.three = m ? 'r' + m[1] : 'unknown (assets/three93.js)'; } catch (e) { v.three = 'unavailable'; }
  v.python = sh('python3', ['--version']);
  v.PIL = sh('python3', ['-c', 'import PIL;print(PIL.__version__)']);
  v.libwebp = sh('python3', ['-c', "import PIL.features as f;print(f.version('webp'))"]);
  v.numpy = sh('python3', ['-c', 'import numpy;print(numpy.__version__)']);
  v.git = sh('git', ['rev-parse', '--short', 'HEAD']); v.gitDirty = sh('git', ['status', '--porcelain', '--', 'src', 'assets', 'tools/art']).split('\n').filter(Boolean).length;
  return v;
}

/* a generated META block: BEGIN … const NAME={json}; … END */
function block(file, begin, end) { const s = fs.readFileSync(file, 'utf8'); const i = s.indexOf(begin), j = s.indexOf(end); if (i < 0 || j < 0) throw new Error('markers missing in ' + file);
  return JSON.parse(s.slice(i + begin.length, j).trim().replace(/^const \w+=/, '').replace(/;$/, '')); }
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function firstDiff(a, b, p = '') { if (same(a, b)) return null; if (a && b && typeof a === 'object' && typeof b === 'object') { for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) { const d = firstDiff(a[k], b[k], p + '/' + k); if (d) return d; } }
  return { at: p || '/', check: JSON.stringify(a).slice(0, 80), committed: JSON.stringify(b).slice(0, 80) }; }
const px = pairs => run('python3', ['-I', path.join(ART, 'bakecmp.py'), ...pairs.flat()]).trim().split('\n').map(l => JSON.parse(l));

function render(kind) {
  const t0 = Date.now();
  if (kind === 'class') run('node', [path.join(ART, 'anim100/make.js'), 'x2', 'soldier', 'move', '--check'], { stdio: ['ignore', 'pipe', 'inherit'] });
  else run('node', [path.join(ART, 'anim100b/make.js'), 'l106', 'moechus', '--check'], { stdio: ['ignore', 'pipe', 'inherit'] });
  return Math.round((Date.now() - t0) / 1000);
}
function compare(kind, against) {
  const O = OUTS[kind], res = { meta: [], pixels: [] };
  const live = f => path.join(ROOT, f), chk = f => path.join(O, 'src', path.basename(f));
  if (kind === 'class') {
    const MA = '/* ANIM100_META:BEGIN (generated by tools/art/anim100/make.js) */', MB = '/* ANIM100_META:END */';
    const f = 'src/board/311-v100anim.js'; res.meta.push(['ANIM100_META.soldier.move', firstDiff(block(chk(f), MA, MB).soldier.move, block(live(f), MA, MB).soldier.move)]);
    const names = ['anim100_soldier_move.webp', 'anim100x2_soldier_move.webp'];
    res.pixels = px(names.map(n => [path.join(against || O, 'assets', n), path.join(A, n)])).map((r, i) => Object.assign({ file: names[i] }, r));
  } else {
    const BA = '/* BEAST100_META:BEGIN (generated by tools/art/anim100b/make.js) */', BB = '/* BEAST100_META:END */';
    const LA = '/* L106_BMETA:BEGIN (generated by tools/art/anim100b/make.js l106) */', LB = '/* L106_BMETA:END */';
    const f = 'src/board/312-v100beasts.js', g = 'src/board/399-v106light.js';
    res.meta.push(['BEAST100_META.moechus', firstDiff(block(chk(f), BA, BB).moechus, block(live(f), BA, BB).moechus)]);
    for (const k of ['moechus', 'moechus_act']) res.meta.push(['L106_BMETA.' + k, firstDiff(block(chk(g), LA, LB)[k], block(live(g), LA, LB)[k])]);
    const names = ['beast100_moechus.webp', 'beast100_moechus_act.webp', 'anim106_beast_moechus_sh.webp', 'anim106_beast_moechus_act_sh.webp', 'anim106p_beast_moechus_sh.webp', 'anim106p_beast_moechus_act_sh.webp'];
    res.pixels = px(names.map(n => [path.join(against || O, 'assets', n), path.join(A, n)])).map((r, i) => Object.assign({ file: names[i] }, r));
  }
  return res;
}
const bad = r => r.error || r.size && Array.isArray(r.size[0]) || (r.max > TOL.max) || (r.mean > TOL.mean);

(async () => {
  const V = await versions(); fs.writeFileSync(path.join(ART, 'BAKE_VERSIONS.json'), JSON.stringify(V, null, 1) + '\n'); console.log('versions', JSON.stringify(V));
  if (args.includes('--versions')) return;
  if (!fs.existsSync(path.join(ROOT, 'flavius-arena.html'))) { console.error('flavius-arena.html missing: sh build.sh first'); process.exit(2); }
  const head = { versions: V, tolerance: TOL, samples: {} }; let fail = 0;
  for (const kind of SAMPLES) {
    let secs = 0; if (!args.includes('--compare')) secs = render(kind);
    const r = compare(kind); r.renderSecs = secs;
    if (args.includes('--twice')) { const keep = path.join(OUTS[kind], 'run1'); fs.rmSync(keep, { recursive: true, force: true }); fs.cpSync(path.join(OUTS[kind], 'assets'), path.join(keep, 'assets'), { recursive: true });
      r.secondRenderSecs = render(kind); r.determinism = px(fs.readdirSync(path.join(keep, 'assets')).map(n => [path.join(OUTS[kind], 'assets', n), path.join(keep, 'assets', n)])); r.second = compare(kind); }
    for (const [n, d] of r.meta) if (d) { fail++; console.log(kind, 'META MISMATCH', n, JSON.stringify(d)); } else console.log(kind, 'meta ok  ', n);
    for (const p of r.pixels) { const b = bad(p); if (b) fail++; console.log(kind, b ? 'PIXELS OVER' : 'pixels ok ', p.file, p.error || (p.size && Array.isArray(p.size[0]) ? 'SIZE ' + JSON.stringify(p.size) : `max ${p.max} mean ${p.mean} p99.9 ${p.p999} >16: ${(p.over16 * 100).toFixed(3)}%`)); }
    if (r.determinism) for (const d of r.determinism) console.log(kind, 'run1 vs run2', path.basename(d.new), d.error || (d.size && Array.isArray(d.size[0]) ? 'SIZE ' + JSON.stringify(d.size) : `max ${d.max} mean ${d.mean}`));
    head.samples[kind] = r; }
  fs.mkdirSync(OUTS.class, { recursive: true }); fs.writeFileSync(path.join(OUTS.class, 'bakecheck.json'), JSON.stringify(head, null, 1));
  console.log(fail ? 'BAKECHECK FAIL ' + fail : 'BAKECHECK OK'); process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
