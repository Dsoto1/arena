/* smartreg.js — adaptive regression: runs only the tests a change can reach, keeps the rest honest by rotation, and widens
   the run on its own when something breaks. Same output as runreg.sh (tools/reg.txt, one "== test ==" block each, ALLDONE).

   Usage: node tools/smartreg.js [--full] [-j 3] [--x 5] [--sample 0.05] [--dry] [tests...]
     --full    every test (releases ALWAYS use a full run — CLAUDE.md §6); also records fresh coverage maps
     --dry     print the plan (who runs and why) without running anything
     tests...  run exactly these (still records their results)

   HOW A TEST IS CHOSEN (first reason wins; the reason prints in the plan):
     new       no history or no coverage map yet
     changed   since its last pass, a FUNCTION the test executed changed (V8 coverage via tools/regcov.js, matched to the
               TypeScript parser's function boundaries, compared by text hash), or the top-level code (tables, wrapper
               installs — everything outside functions) of a src file changed when the test executed code in that file OR
               executed a function that file declares or (re)assigns at top level (so a new module's wrapper reaches the
               tests that call the wrapped function), or a global file (build.sh, 01-head.html, the runner) or the test
               file itself changed. Works on uncommitted edits. A removed src file makes the run FULL.
               Blind spot: a top-level line that mutates shared data (e.g. GLOSS.x.d = …) reaches only tests that ran
               code in that file — rotation, the fallback and the always-full release run cover it.
     warming   fewer than X consecutive passes (X = --x, default 5)
     flaky     failed and then passed on the same build at least once in its last 20 runs: never idles
     pinned    it escaped once (failed in a full run while idle); kept active for the next 10 runs
     stale     the last full run is 7+ days old → this becomes a full run
     rotation  the idle tests that ran least recently, ceil(sample x idle) of them (at least 1): every idle test is
               re-checked within ~1/sample runs, catching drift no diff explains
     idle      skipped this run

   WHEN A TEST FAILS (fallback): it is re-run alone once. Passing the second time → recorded as FLAKY (still reported,
   streak reset, never idled — a flaky test is never skipped to get green). Failing again → REAL: every idle test that
   shares a src file with it is pulled in and run ("domain"), or the whole idle pool when the failing test has no map.
   The report lists what the expansion caught.

   STATE (committed, so a fresh container keeps it): tools/regstate.json — per test {streak, runs, lastRun, lastPass,
   fails, flaky[], pinUntil, time, deps{global file:hash}, shapes{src file:top-level hash}}, plus run counter, lastFull and
   the build order; tools/regmap.json — {fh:[function text hashes], t:{test:{files:[...], fi:[indexes into fh]}}} as of
   each test's last pass. */
const fs = require('fs'), path = require('path'), crypto = require('crypto'), { spawn } = require('child_process');
const ROOT = path.resolve(__dirname, '..'), TD = path.join(__dirname, 'tests'), RD = path.join(__dirname, 'reg');
/* the run tests a snapshot of the built page (beside assets/, so its relative art loads): you can keep building while it runs */
const BUILT = path.join(ROOT, 'flavius-arena.html'), PAGE = path.join(ROOT, '.regpage.html');
if (!process.argv.includes('--dry')) fs.copyFileSync(BUILT, PAGE);
const PAGE0 = PAGE, STATE = path.join(__dirname, 'regstate.json'), MAP = path.join(__dirname, 'regmap.json');
const GLOBAL = ['build.sh', 'src/01-head.html', 'tools/smartreg.js', 'tools/regcov.js'];
const arg = process.argv.slice(2);
const opt = (k, d) => { const i = arg.indexOf(k); if (i < 0) return d; const v = arg[i + 1]; arg.splice(i, 2); return v; };
const flag = k => { const i = arg.indexOf(k); if (i < 0) return false; arg.splice(i, 1); return true; };
const J = +opt('-j', 3), X = +opt('--x', 5), SAMPLE = +opt('--sample', 0.05), FULL0 = flag('--full'), DRY = flag('--dry');
const ONLY = arg.filter(a => !a.startsWith('-'));
const readJ = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const st = readJ(STATE, { run: 0, lastFull: 0, tests: {} }), MAPJ = readJ(MAP, { fh: [], t: {} });
const map = MAPJ.t, FH = MAPJ.fh, FHI = new Map(FH.map((x, i) => [x, i]));
const hash = f => { try { return crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, f))).digest('hex').slice(0, 12); } catch (e) { return 'missing'; } };

/* the test list and the src order both come from their one source of truth: runreg.sh's DEFAULT and build.sh */
const runreg = fs.readFileSync(path.join(__dirname, 'runreg.sh'), 'utf8');
const ALL = [...new Set(runreg.match(/DEFAULT="([^"]+)"/)[1].trim().split(/\s+/))];
const ORDER = fs.readFileSync(path.join(ROOT, 'build.sh'), 'utf8').match(/cat (src\/02-data\.js[^;]+);/)[1].trim().split(/\s+/);
/* the built script, parsed: every function's text hash by start offset, and each src file's top-level "shape" (its text with
   every function cut out) — the script is "\n" followed by the src files in build order, so offsets map back to files */
const ts = require('typescript');
const sha = t => crypto.createHash('sha1').update(t).digest('hex').slice(0, 10);
const BUILD = (() => {
  const html = fs.readFileSync(fs.existsSync(PAGE) && !process.argv.includes('--dry') ? PAGE : BUILT, 'utf8'), a = html.indexOf('<script>') + 8, src = html.slice(a, html.lastIndexOf('</script>'));
  let o = 1;
  const bounds = ORDER.map(f => { const n = fs.readFileSync(path.join(ROOT, f), 'utf8').length; const b = [o, o + n, f]; o += n; return b; });
  if (o !== src.length) console.log(`WARNING: flavius-arena.html is not built from the current src (${o} vs ${src.length}) — run sh build.sh`);
  const sf = ts.createSourceFile('x.js', src, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS), K = ts.SyntaxKind;
  const FK = new Set([K.FunctionDeclaration, K.FunctionExpression, K.ArrowFunction, K.MethodDeclaration, K.GetAccessor, K.SetAccessor, K.Constructor]);
  const fn = new Map(), fname = new Map(), outer = [], tops = [];
  const root = e => { while (e && (e.kind === K.PropertyAccessExpression || e.kind === K.ElementAccessExpression)) e = e.expression; return e && e.kind === K.Identifier ? e.text : null; };
  (function walk(n, inFn) {
    const isF = FK.has(n.kind);
    if (isF) {
      const s0 = n.getStart(sf), p = n.parent;
      fn.set(s0, sha(src.slice(s0, n.end))); if (!inFn) outer.push([s0, n.end]);
      const nm = n.name && n.name.text || p && p.kind === K.VariableDeclaration && p.name.text || p && p.kind === K.BinaryExpression && p.right === n && root(p.left);
      if (nm) fname.set(s0, nm);
    } else if (!inFn) { /* top-level names this code declares or (re)assigns: a wrapper `{const base=f;f=function…}` names f */
      const nm = n.kind === K.FunctionDeclaration && n.name ? n.name.text : n.kind === K.VariableDeclaration && n.name.kind === K.Identifier ? n.name.text
        : n.kind === K.BinaryExpression && n.operatorToken.kind === K.EqualsToken ? root(n.left) : null;
      if (nm) tops.push([n.getStart(sf), nm]);
    }
    ts.forEachChild(n, c => walk(c, inFn || isF));
  })(sf, false);
  for (const [s0, e0] of outer) { const nm = fname.get(s0); if (nm && src.slice(s0, s0 + 9) === 'function ') tops.push([s0, nm]); }
  const shape = {};
  for (const [b0, b1, f] of bounds) {
    let t = '', p = b0;
    for (const [s0, e0] of outer) { if (e0 <= b0 || s0 >= b1) continue; t += src.slice(p, Math.max(p, s0)) + 'ƒ'; p = Math.max(p, e0); }
    shape[f] = sha(t + src.slice(p, b1));
  }
  const names = {};
  for (const [o, nm] of tops) { const b = bounds.find(x => o >= x[0] && o < x[1]); if (b) (names[b[2]] = names[b[2]] || new Set()).add(nm); }
  return { bounds, fn, fname, shape, names, all: new Set(fn.values()) };
})();
const fileAt = off => { for (const [a, b, f] of BUILD.bounds) if (off >= a && off < b) return f; return null; };
const depsOf = t => [...GLOBAL, `tools/tests/${t}.js`];
const HASH = {}; const h = f => HASH[f] || (HASH[f] = hash(f));
for (const t of ALL) depsOf(t).forEach(h); /* hash now, so edits made during the run don't leak into its records */

function plan(full) {
  const tests = ONLY.length ? ONLY : ALL, P = [], idle = [];
  for (const t of tests) {
    const s = st.tests[t];
    let why = null;
    if (ONLY.length) why = 'asked';
    else if (full) why = 'full';
    else if (!s || !map[t]) why = 'new';
    else if (depsOf(t).some(f => (s.deps || {})[f] !== h(f))) why = 'changed';
    else if (ORDER.some(f => ((st.shapeSets || {})[s.sh] || s.shapes || {})[f] !== BUILD.shape[f] && (map[t].files.includes(f) || (map[t].names || []).some(nm => (BUILD.names[f] || new Set()).has(nm))))) why = 'changed';
    else if (map[t].fi.some(i => !BUILD.all.has(FH[i]))) why = 'changed';
    else if (s.streak < X) why = 'warming';
    else if ((s.flaky || []).some(r => r > st.run - 20)) why = 'flaky';
    else if ((s.pinUntil || 0) > st.run) why = 'pinned';
    if (why) P.push({ t, why }); else idle.push(t);
  }
  const n = idle.length ? Math.max(1, Math.ceil(idle.length * SAMPLE)) : 0;
  const rot = [...idle].sort((a, b) => (st.tests[a].lastRun || 0) - (st.tests[b].lastRun || 0)).slice(0, n);
  for (const t of rot) P.push({ t, why: 'rotation' });
  return { P, idle: idle.filter(t => !rot.includes(t)) };
}

/* per-test kill limit: 400 s, or 1.6x the test's recorded time + 60 s when it is slower (t12 needs ~430 s alone) */
function limitFor(t) { const k = (st.tests[t] || {}).time || 0; return Math.max(400, Math.round(k * 1.6 + 60)); }

/* run a list of tests, J at a time, slowest first; coverage on unless cov === false */
function runAll(list, cov = true) {
  fs.mkdirSync(RD, { recursive: true });
  const q = [...list].sort((a, b) => ((st.tests[b] || {}).time || 9999) - ((st.tests[a] || {}).time || 9999));
  const res = {};
  return new Promise(done => {
    let live = 0;
    const next = () => {
      if (!q.length && !live) return done(res);
      while (live < J && q.length) {
        const t = q.shift(); live++;
        const t0 = Date.now(), cf = path.join(RD, t + '.cov.json'); try { fs.unlinkSync(cf); } catch (e) {}
        const env = { ...process.env, ...(cov ? { REGCOV: cf } : {}) };
        const pr = spawn('node', ['-r', path.join(__dirname, 'regcov.js'), path.join(TD, t + '.js'), PAGE], { cwd: TD, env });
        let out = '';
        pr.stdout.on('data', d => out += d); pr.stderr.on('data', d => out += d);
        const kill = setTimeout(() => pr.kill('SIGKILL'), limitFor(t) * 1000);
        pr.on('close', code => {
          clearTimeout(kill); live--;
          const errs = /ERRS \[\s*\S/.test(out) && !/ERRS \[\]/.test(out);
          res[t] = { out, code: code == null ? 124 : code, pass: code === 0 && !errs, time: Math.round((Date.now() - t0) / 1000), cov: readJ(cf, null) };
          next();
        });
      }
    };
    next();
  });
}

function record(t, r, run) {
  const s = st.tests[t] || (st.tests[t] = { streak: 0, runs: 0, fails: 0, flaky: [] });
  s.runs++; s.lastRun = run; s.time = r.time;
  if (r.pass && r.cov && r.cov.offs && r.cov.offs.length) {
    const files = [...new Set(r.cov.offs.map(fileAt).filter(Boolean))].sort();
    const fi = [...new Set(r.cov.offs.map(o => BUILD.fn.get(o)).filter(Boolean))].map(x => { let i = FHI.get(x); if (i == null) { i = FH.length; FH.push(x); FHI.set(x, i); } return i; });
    const names = [...new Set(r.cov.offs.map(o => BUILD.fname.get(o)).filter(Boolean))].sort();
    map[t] = { files, fi, names };
    const sid = sha(JSON.stringify(BUILD.shape)); st.shapeSets = st.shapeSets || {}; st.shapeSets[sid] = BUILD.shape; s.sh = sid; delete s.shapes;
  }
  if (r.pass) { s.streak++; s.lastPass = run; s.deps = Object.fromEntries(depsOf(t).map(f => [f, h(f)])); }
  else { s.streak = 0; s.fails++; s.deps = {}; }
}

(async () => {
  const run = ++st.run;
  const full = FULL0 || !st.lastFull || Date.now() - st.lastFull > 7 * 864e5 || (st.order || '').split(' ').some(f => f && !ORDER.includes(f));
  if (!full && !ONLY.length && !Object.keys(map).length) { console.log('No coverage map yet — run once with --full.'); }
  const { P, idle } = plan(full);
  const why = {}; for (const x of P) (why[x.why] = why[x.why] || []).push(x.t);
  const head = `smartreg run ${run} · ${full ? 'FULL' : 'smart'} · ${P.length} of ${ALL.length} tests · ` + Object.entries(why).map(([k, v]) => `${k} ${v.length}`).join(', ') + ` · idle ${idle.length}`;
  console.log(head); for (const [k, v] of Object.entries(why)) if (k !== 'full') console.log(`  ${k}: ${v.join(' ')}`);
  if (DRY) { st.run--; return; }
  const res = await runAll(P.map(x => x.t));
  /* fallback: re-run each failure alone; real failures pull their idle domain in */
  const failed = Object.keys(res).filter(t => !res[t].pass), report = [];
  const flakyNow = [], real = [];
  if (failed.length) {
    const again = await runAll(failed, false);
    for (const t of failed) {
      if (again[t].pass) { flakyNow.push(t); (st.tests[t] = st.tests[t] || { streak: 0, runs: 0, fails: 0, flaky: [] }).flaky = [...(st.tests[t].flaky || []), run].slice(-5); }
      else real.push(t);
    }
  }
  let extra = {};
  if (real.length && idle.length) {
    const files = new Set(real.flatMap(t => (map[t] || {}).files || []));
    const blind = real.some(t => !map[t]);
    const dom = blind ? idle : idle.filter(t => ((map[t] || {}).files || []).some(f => files.has(f)));
    report.push(`FALLBACK: ${real.length} real failure(s) → ${blind ? 'the whole idle pool' : 'their domain'} (${dom.length} idle tests)`);
    extra = await runAll(dom);
    const caught = Object.keys(extra).filter(t => !extra[t].pass);
    report.push(caught.length ? `  the expansion caught: ${caught.join(' ')}` : '  the expansion found nothing more');
  }
  /* escape check: a full run catching a test that was idle (or rotation-only) last time → pin it */
  for (const t of Object.keys(res)) if (!res[t].pass && full && st.tests[t] && st.tests[t].lastRun < run - 1) { st.tests[t].pinUntil = run + 10; report.push(`ESCAPE: ${t} failed after sitting idle — pinned for 10 runs`); }
  for (const [t, r] of Object.entries({ ...res, ...extra })) record(t, r, run);
  if (full && !real.length) { st.lastFull = Date.now(); st.order = ORDER.join(' '); }
  /* tools/reg.txt in runreg.sh's format, in list order */
  const all = { ...res, ...extra };
  let txt = head + '\n';
  for (const t of ALL.concat(ONLY.filter(t => !ALL.includes(t)))) if (all[t]) txt += `== ${t} ==\n${all[t].out}exit=${all[t].code}\n`;
  if (flakyNow.length) report.push(`FLAKY (failed, then passed alone): ${flakyNow.join(' ')}`);
  txt += report.join('\n') + (report.length ? '\n' : '') + `SUMMARY pass ${Object.values(all).filter(r => r.pass).length} · fail ${real.length + Object.values(extra).filter(r => !r.pass).length} · flaky ${flakyNow.length} · skipped ${Math.max(0, ALL.length - Object.keys(all).length)}\nALLDONE\n`;
  fs.writeFileSync(path.join(__dirname, 'reg.txt'), txt);
  { const used = new Set(Object.values(st.tests).map(x => x.sh)); for (const k of Object.keys(st.shapeSets || {})) if (!used.has(k)) delete st.shapeSets[k]; }
  fs.writeFileSync(STATE, JSON.stringify(st, null, 1)); fs.writeFileSync(MAP, JSON.stringify(MAPJ));
  console.log(report.join('\n')); console.log(txt.split('\n').slice(-3).join('\n'));
  process.exit(real.length || Object.values(extra).some(r => !r.pass) ? 1 : 0);
})();
