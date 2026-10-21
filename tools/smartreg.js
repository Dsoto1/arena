/* smartreg.js — adaptive regression: runs only the tests a change can reach, keeps the rest honest by rotation, and widens
   the run on its own when something breaks. Same output as runreg.sh (tools/reg.txt, one "== test ==" block each, ALLDONE).

   Usage: node tools/smartreg.js [--full] [-j 4] [--x 5] [--sample 0.05] [--dry] [tests...]
     --full    every test (releases ALWAYS use a full run — CLAUDE.md §6); also records fresh coverage maps
     --dry     print the plan (who runs and why, and why a run would be FULL) and exit — never runs a test, never writes state
     tests...  run exactly these (still records their results)
     -j N      workers (default 4; env REGJ sets the default)

   TEST SLOTS (v1.08c, replaces tools/testslot.sh): every test process holds one of REGSLOTS (default 2) machine-wide slots —
   /tmp/flavius-reg-slot-N held with flock(1), so a killed holder (agent timeout, SIGKILL) frees its slot at once (the kernel drops
   the lock with the process). All smartreg runs on the box share the slots: two builders at -j 2 run 2 tests at a time between
   them. A worker waiting prints "waiting for a test slot (slot N: pid P tv… since …)"; after REGSLOTWAIT seconds (default 1200)
   the run gives up with exit 75. REGSLOTS=0 turns the limit off (CI shards: one runner each, the limit is their own -j).

   HOW A TEST IS CHOSEN (first reason wins; the reason prints in the plan):
     new       no history or no coverage map yet
     changed   since its last pass, a FUNCTION the test executed changed (V8 coverage via tools/regcov.js, matched to the
               TypeScript parser's function boundaries, compared by text hash), or the top-level code (tables, wrapper
               installs — everything outside functions) of a src file changed when the test executed code in that file OR
               executed a function that file declares or (re)assigns at top level (so a new module's wrapper reaches the
               tests that call the wrapped function), or a global file (01-head.html, regcov.js) or the test file itself or a
               tools/tests/_*.js helper it requires changed. Works on uncommitted edits. A removed src file or a changed build
               order of the existing files makes the run FULL (a NEW module is not: its top-level shape reaches the tests that
               run code it wraps). build.sh and smartreg.js are not global (v1.08c): build.sh only lists the files, whose own
               shapes are compared; the runner changes no game code.
               Blind spot: a top-level line that mutates shared data (e.g. GLOSS.x.d = …) reaches only tests that ran
               code in that file — rotation, the fallback and the always-full release run cover it.
     warming   fewer than X consecutive passes (X = --x, default 5)
     flaky     failed and then passed on the same build at least once in its last 20 runs: never idles
     pinned    it escaped once (failed in a full run while idle); kept active for the next 10 runs
     stale     an idle test not run for 7+ days (v1.08c: per test, at most ceil(2 x sample x all) of the oldest a run;
               before, a 7-day-old full run turned EVERY run into a full one)
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
const DRY0 = process.argv.includes('--dry');
if (!DRY0) fs.copyFileSync(BUILT, PAGE);
/* the coverage maps are committed gzipped (v1.08c: tools/regmap.json.gz, 11.7 MB → ~4 MB; the CI full run commits it back).
   A plain tools/regmap.json is still read when there is no .gz (older branches); writes always go to the .gz. */
const PAGE0 = PAGE, STATE = path.join(__dirname, 'regstate.json'), MAP = path.join(__dirname, 'regmap.json'), MAPGZ = MAP + '.gz', zlib = require('zlib');
const GLOBAL = ['src/core/01-head.html', 'tools/regcov.js'];
const arg = process.argv.slice(2);
const opt = (k, d) => { const i = arg.indexOf(k); if (i < 0) return d; const v = arg[i + 1]; arg.splice(i, 2); return v; };
const flag = k => { const i = arg.indexOf(k); if (i < 0) return false; arg.splice(i, 1); return true; };
const J = +opt('-j', +process.env.REGJ || 4), X = +opt('--x', 5), SAMPLE = +opt('--sample', 0.05), FULL0 = flag('--full'), DRY = flag('--dry');
const ONLY = arg.filter(a => !a.startsWith('-'));
const readJ = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const readMap = () => { try { if (fs.existsSync(MAPGZ)) return JSON.parse(zlib.gunzipSync(fs.readFileSync(MAPGZ)).toString('utf8')); } catch (e) { console.log('WARNING: ' + MAPGZ + ' unreadable: ' + e.message); } return readJ(MAP, { fh: [], t: {} }); };
const writeMap = m => { fs.writeFileSync(MAPGZ, zlib.gzipSync(JSON.stringify(m), { level: 9 })); try { fs.unlinkSync(MAP); } catch (e) {} };
const st = readJ(STATE, { run: 0, lastFull: 0, tests: {} }), MAPJ = readMap();
const map = MAPJ.t, FH = MAPJ.fh, FHI = new Map(FH.map((x, i) => [x, i]));
const hash = f => { try { return crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, f))).digest('hex').slice(0, 12); } catch (e) { return 'missing'; } };

/* the test list and the src order both come from their one source of truth: runreg.sh's DEFAULT and build.sh */
const runreg = fs.readFileSync(path.join(__dirname, 'runreg.sh'), 'utf8');
const ALL = [...new Set(runreg.match(/DEFAULT="([^"]+)"/)[1].trim().split(/\s+/))];
const ORDER = fs.readFileSync(path.join(ROOT, 'build.sh'), 'utf8').match(/\bcat (src\/[\w\/.-]+\.js [^;]+);/)[1].trim().split(/\s+/);
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
/* a t12 shard (t12a/b/c) is a 2-line stub that runs tools/tests/t12.js with its share of the events */
/* helpers a test requires (tools/tests/_*.js, e.g. _wait.js, _st98.js) are its deps too; t12's shards reach them through t12.js */
const HELP = {};
const helpersOf = f => HELP[f] || (HELP[f] = (() => { let t = ''; try { t = fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) {}
  return [...new Set([...t.matchAll(/['"`](?:\.\/)?(_[\w-]+)(?:\.js)?['"`]/g)].map(m => `tools/tests/${m[1]}.js`).filter(x => fs.existsSync(path.join(ROOT, x))))].sort(); })());
const depsOf = t => { const own = [`tools/tests/${t}.js`, ...(/^t12[a-z]$/.test(t) ? ['tools/tests/t12.js'] : [])]; return [...GLOBAL, ...own, ...new Set(own.flatMap(helpersOf))]; };
const HASH = {}; const h = f => HASH[f] || (HASH[f] = hash(f));
for (const t of ALL) depsOf(t).forEach(h); /* hash now, so edits made during the run don't leak into its records */

function plan(full) {
  const tests = ONLY.length ? ONLY : ALL, P = [], idle = [];
  for (const t of tests) {
    const s = st.tests[t];
    let why = null, cause = null, c;
    if (ONLY.length) why = 'asked';
    else if (full) why = 'full';
    else if (!s || !map[t]) why = 'new';
    else if ((c = depsOf(t).find(f => (s.deps || {})[f] !== h(f)))) { why = 'changed'; cause = path.basename(c); }
    else if ((c = ORDER.find(f => ((st.shapeSets || {})[s.sh] || s.shapes || {})[f] !== BUILD.shape[f] && (map[t].files.includes(f) || (map[t].names || []).some(nm => (BUILD.names[f] || new Set()).has(nm)))))) { why = 'changed'; cause = 'top level of ' + path.basename(c); }
    else if (map[t].fi.some(i => !BUILD.all.has(FH[i]))) { why = 'changed'; cause = 'a function it ran'; }
    else if (s.streak < X) why = 'warming';
    else if ((s.flaky || []).some(r => r > st.run - 20)) why = 'flaky';
    else if ((s.pinUntil || 0) > st.run) why = 'pinned';
    if (why) P.push({ t, why, cause }); else idle.push(t);
  }
  /* stale: idle tests not run for 7+ days, oldest first, capped (a long pause must not turn the next run into a full one) */
  const at = t => st.tests[t].lastAt || st.lastFull || 0, old = Date.now() - 7 * 864e5;
  const staleAll = idle.filter(t => at(t) < old).sort((a, b) => at(a) - at(b)), stale = staleAll.slice(0, Math.ceil(ALL.length * SAMPLE * 2));
  for (const t of stale) P.push({ t, why: 'stale' });
  const rest = idle.filter(t => !stale.includes(t));
  const n = rest.length ? Math.max(1, Math.ceil(rest.length * SAMPLE)) : 0;
  const rot = [...rest].sort((a, b) => (st.tests[a].lastRun || 0) - (st.tests[b].lastRun || 0)).slice(0, n);
  for (const t of rot) P.push({ t, why: 'rotation' });
  return { P, idle: rest.filter(t => !rot.includes(t)), staleN: staleAll.length };
}

/* per-test kill limit: 400 s, or 1.6x the test's recorded time + 60 s when it is slower. The whole t12 (asked by name only;
   the suite runs its shards t12a/b/c, ~1/3 each) at least 1500 s — it needs ~900 s alone, more under load; treplay101 (every golden replay, ~5 min) too */
/* (times are recorded at the run's own -j; above -j 3 each test runs slower, so the 1.6x margin grows with J/3) */
function limitFor(t) { const k = (st.tests[t] || {}).time || 0; return Math.max((t === 't12' || t === 'treplay101') ? 1500 : 400, Math.round(k * 1.6 * Math.max(1, J / 3) + 60)); }

/* SHARED BROWSERS: one Chromium per worker slot (chromium.launchServer), handed to each test via REGWS — regcov.js turns the
   test's chromium.launch() into a connect, so a test no longer pays for its own browser start. A slot's browser is replaced
   when it died or after SLOT_MAX tests (keeps memory flat). Re-runs of failures ("alone") launch their own browser, so a
   test that only fails in a shared browser shows up as FLAKY, never hidden. REGSHARE=0 turns sharing off. */
const SLOT_MAX = 25, SHARE = process.env.REGSHARE !== '0';
const slots = [];
async function slotWS(i) {
  if (!SHARE) return null;
  const s = slots[i] || (slots[i] = { srv: null, n: 0 });
  const dead = s.srv && s.srv.process().exitCode !== null;
  if (s.srv && (dead || s.n >= SLOT_MAX)) { const old = s.srv; s.srv = null; try { await old.close(); } catch (e) {} }
  if (!s.srv) { try { s.srv = await require('playwright').chromium.launchServer(); s.n = 0; } catch (e) { return null; } }
  s.n++; return s.srv.wsEndpoint();
}
async function slotsClose() { for (const s of slots) if (s && s.srv) { try { await s.srv.close(); } catch (e) {} s.srv = null; } }

/* TEST SLOTS (see the header). A slot = a tiny holder process `flock -n /tmp/flavius-reg-slot-N sh -c 'read x'` that keeps the lock
   while its stdin (a pipe from this runner) is open: the test ends → we close it; this runner dies however it dies → the pipe closes
   → the holder exits → the kernel drops the lock. The test itself is NOT a child of the holder, so no test or browser process can
   inherit the lock (a lock fd inherited by an orphan was the way to a forever-held slot). `timeout -s KILL` bounds every test, even
   one orphaned by a killed runner. */
const SLOTS = process.env.REGSLOTS == null || process.env.REGSLOTS === '' ? 2 : +process.env.REGSLOTS, SLOTWAIT = +(process.env.REGSLOTWAIT || 1200);
const has = c => { try { require('child_process').execFileSync(c, ['--version'], { stdio: 'ignore' }); return true; } catch (e) { return false; } };
const FLOCK = has('flock'), TIMEOUT = has('timeout');
const slotFile = i => `/tmp/flavius-reg-slot-${i}`;
function trySlot(i) {
  const hd = spawn('flock', ['-n', '-E', '75', slotFile(i), 'sh', '-c', 'echo GOT; read x'], { stdio: ['pipe', 'pipe', 'ignore'] });
  return new Promise(res => {
    let done = false;
    hd.stdout.on('data', d => { if (!done && /GOT/.test(String(d))) { done = true; res({ hd }); } });
    hd.on('error', e => { if (!done) { done = true; res({ err: String(e) }); } });
    hd.on('exit', code => { if (!done) { done = true; res(code === 75 ? null : { err: code }); } });
  });
}
function slotWho(i) { try { const w = JSON.parse(fs.readFileSync(slotFile(i) + '.who', 'utf8')); return `slot ${i}: pid ${w.pid} ${w.test} since ${w.since.slice(11, 19)}`; } catch (e) { return `slot ${i}: ?`; } }
async function slotTake(t, cmd, lim, o) {
  const run = hd => { const c = TIMEOUT ? ['timeout', '-s', 'KILL', String(lim + 30), ...cmd] : cmd; const pr = spawn(c[0], c.slice(1), o);
    const free = () => { if (hd) try { hd.stdin.end(); } catch (e) {} };
    /* timeout(1) relays a TERM to the test; KILL it 5 s later if it is still there (a KILL to timeout itself would orphan the test) */
    return { pr, out: '', kill: () => { try { pr.kill(TIMEOUT ? 'SIGTERM' : 'SIGKILL'); } catch (e) {} if (TIMEOUT) setTimeout(() => { try { if (pr.exitCode == null && pr.signalCode == null) pr.kill('SIGKILL'); } catch (e) {} }, 5000).unref(); }, free }; };
  if (!SLOTS || !FLOCK) return run(null);
  const t0 = Date.now(); let said = 0;
  for (;;) {
    for (let i = 0; i < SLOTS; i++) {
      const r = await trySlot(i);
      if (r && r.hd) { try { fs.writeFileSync(slotFile(i) + '.who', JSON.stringify({ pid: process.pid, test: t, since: new Date().toISOString(), root: ROOT })); } catch (e) {} return run(r.hd); }
      if (r && r.err != null) { console.log(`WARNING: flock failed (${r.err}) — ${t} runs without a slot`); return run(null); }
    }
    if (Date.now() - t0 > SLOTWAIT * 1000) return null;
    if (Date.now() - t0 > 10000 && Date.now() - said > 60000) { said = Date.now(); console.log(`waiting for a test slot for ${t} (${[...Array(SLOTS).keys()].map(slotWho).join(' · ')})`); }
    await new Promise(r => setTimeout(r, Date.now() - t0 < 5000 ? 200 : 2000));
  }
}
/* run a list of tests, J at a time, slowest first; coverage on unless cov === false; shared slot browsers unless share === false */
function runAll(list, cov = true, share = true) {
  fs.mkdirSync(RD, { recursive: true });
  const q = [...list].sort((a, b) => ((st.tests[b] || {}).time || 9999) - ((st.tests[a] || {}).time || 9999));
  const res = {}, free = Array.from({ length: J }, (_, i) => i);
  return new Promise(done => {
    let live = 0;
    const next = async () => {
      if (!q.length && !live) return done(res);
      while (live < J && q.length) {
        const t = q.shift(), slot = free.shift(); live++;
        const ws = share ? await slotWS(slot) : null;
        const t0 = Date.now(), cf = path.join(RD, t + '.cov.json'); try { fs.unlinkSync(cf); } catch (e) {}
        const env = { ...process.env, ...(cov ? { REGCOV: cf } : {}), ...(ws ? { REGWS: ws } : {}) };
        if (!ws) delete env.REGWS;
        const cmd = ['node', '-r', path.join(__dirname, 'regcov.js'), path.join(TD, t + '.js'), PAGE];
        const sl = await slotTake(t, cmd, limitFor(t), { cwd: TD, env });
        if (!sl) { console.log(`GAVE UP: no test slot free within ${SLOTWAIT} s (REGSLOTS=${SLOTS}) — another run holds them`); await slotsClose(); process.exit(75); }
        const pr = sl.pr; let out = sl.out;
        pr.stdout.on('data', d => out += d); pr.stderr.on('data', d => out += d);
        const kill = setTimeout(() => sl.kill(), limitFor(t) * 1000);
        /* 'close' waits for the pipes; a grandchild that kept them open would hang the run → 'exit' + 3 s also ends it */
        let ended = false, ex = null;
        pr.on('exit', code => { ex = setTimeout(() => end(code), 3000); });
        const end = code => {
          if (ended) return; ended = true; clearTimeout(ex);
          clearTimeout(kill); sl.free(); live--; free.push(slot);
          const errs = /ERRS \[\s*\S/.test(out) && !/ERRS \[\]/.test(out);
          res[t] = { out, code: code == null ? 124 : code, pass: code === 0 && !errs, time: Math.round((Date.now() - t0) / 1000), cov: readJ(cf, null) };
          next();
        };
        pr.on('close', end);
      }
    };
    next();
  });
}

function record(t, r, run) {
  const s = st.tests[t] || (st.tests[t] = { streak: 0, runs: 0, fails: 0, flaky: [] });
  s.runs++; s.lastRun = run; s.lastAt = Date.now(); s.time = r.time;
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
  /* FULL only for a reason that a per-test plan cannot cover; the reason is printed (v1.08c: no more silent 7-day escalation) */
  const was = (st.order || '').split(' ').filter(Boolean), gone = was.filter(f => !ORDER.includes(f));
  const kept = ORDER.filter(f => was.includes(f)), moved = was.filter(f => ORDER.includes(f)).some((f, i) => kept[i] !== f);
  const fullWhy = FULL0 ? '--full' : !st.lastFull ? 'no full run recorded yet' : !Object.keys(map).length ? 'no coverage map (tools/regmap.json.gz)'
    : gone.length ? 'src file(s) removed: ' + gone.slice(0, 5).join(' ') : moved ? 'build order of existing src files changed' : '';
  const full = !ONLY.length && !!fullWhy;
  const { P, idle, staleN } = plan(full);
  const why = {}; for (const x of P) (why[x.why] = why[x.why] || []).push(x.t);
  const head = `smartreg run ${run} · ${full ? 'FULL' : 'smart'} · ${P.length} of ${ALL.length} tests · ` + Object.entries(why).map(([k, v]) => `${k} ${v.length}`).join(', ') + ` · idle ${idle.length}`;
  console.log(head); if (full) console.log(`  FULL because: ${fullWhy}`); else if (fullWhy && ONLY.length) console.log(`  (a plan run would be FULL: ${fullWhy})`);
  for (const [k, v] of Object.entries(why)) if (k !== 'full') console.log(`  ${k}: ${v.join(' ')}`);
  { const by = {}; for (const x of P) if (x.cause) by[x.cause] = (by[x.cause] || 0) + 1;
    const top = Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 8); if (top.length) console.log('  changed by: ' + top.map(([k, n]) => `${k} ${n}`).join(', ')); }
  if (staleN > (why.stale || []).length) console.log(`  (${staleN} idle tests are 7+ days old; the oldest ${(why.stale || []).length} run now)`);
  if (DRY) { console.log('DRY: nothing run, no state written'); process.exit(0); }
  const res = await runAll(P.map(x => x.t));
  /* fallback: re-run each failure alone; real failures pull their idle domain in */
  const failed = Object.keys(res).filter(t => !res[t].pass), report = [];
  const flakyNow = [], real = [];
  if (failed.length) {
    const again = await runAll(failed, false, false); /* alone = own browser */
    for (const t of failed) {
      if (again[t].pass) { flakyNow.push(t); (st.tests[t] = st.tests[t] || { streak: 0, runs: 0, fails: 0, flaky: [] }).flaky = [...(st.tests[t].flaky || []), run].slice(-5); }
      else real.push(t);
    }
  }
  let extra = {};
  if (real.length && idle.length && process.env.REGNOEXPAND !== '1') { /* CI shards set REGNOEXPAND=1: another shard runs the rest */
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
  fs.writeFileSync(STATE, JSON.stringify(st, null, 1)); writeMap(MAPJ);
  console.log(report.join('\n')); console.log(txt.split('\n').slice(-3).join('\n'));
  await slotsClose();
  process.exit(real.length || Object.values(extra).some(r => !r.pass) ? 1 : 0);
})();
