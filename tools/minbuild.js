/* tools/minbuild.js — v1.17 THE MINIFIED PAGE (his pick B, 2026-11-13). build.sh calls it right after it has written the readable page.
     flavius-arena.src.html   the readable page (build.sh's cat; gitignored) — open it to debug, line numbers = the sources'
     flavius-arena.html       what is tested and shipped: the same page with every module's code minified on its own
     flavius-arena.mods.json  where each module sits in flavius-arena.html's script (gitignored; smartreg.js maps coverage with it)

   Usage: node tools/minbuild.js [--readable] [--require] [--sizes]     (from build.sh; BUILD_REQUIRE_MIN=1 = --require)
          node tools/minbuild.js --pin                                  prints the esbuild version (the workflows install exactly it)
          node tools/minbuild.js --where LINE:COL [page]                a position in the minified page (an error log's "at") → module + source line

   HOW A MODULE IS MINIFIED: esbuild `transform`, WHITESPACE ONLY (comments, blanks and line breaks go; no identifier is shortened, no
   statement is rewritten or dropped) — measured 2026-11-13: adding esbuild's syntax pass saves 0.2% more on the wire (Brotli 2.242 vs
   2.246 MB) but inlines top-level `const` values into functions, drops dead branches and rewrites control flow, so it is OFF (SYNTAX below).
   Per module, joined in build.sh's order: the page still has one piece of text per module, and a change in one module never changes
   another module's minified text.

   A MODULE STAYS AS WRITTEN (raw, byte for byte as in the readable page) when its minified text is not provably the same program:
     • "function in a block"   it declares a function inside a top-level { } / if / try. esbuild rewrites those (sloppy-mode Annex B)
                               into `let name2=function…;var name=name2` — the global stays, but the function's own .name changes and
                               the global is set at the top of the block instead of where the declaration stands.
     • "esbuild helper"        esbuild added a helper of its own (__template …: a tagged template holding "</script") = new globals.
     • "</script or <!--"      the minified text would end / confuse the inline <script>.
     • "joins the module before/after"  a module that starts with ( [ ` + - / while the one before does not end its last statement:
                               the two are one statement in the readable page, so both stay raw.
     • "esbuild: …"            esbuild could not parse it on its own.
   The list prints at every build. tools/tests/tv117min.js re-checks the result with a real parser (same top-level names in every
   minified module, no statement across a module border, the timer sweeps of 00b-perf match the same callbacks in both pages).

   WITHOUT esbuild (exactly version PIN; looked up on NODE_PATH, in tools/.esb here or in a parent checkout, in /tmp/ci; else installed
   once into tools/.esb with npm) the page is built READABLE and a loud line says so; --require then fails (release.sh, CI). */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto'), zlib = require('zlib'), cp = require('child_process');
const PIN = '0.27.7', SYNTAX = false;
const ROOT = path.resolve(__dirname, '..'), SRCPAGE = path.join(ROOT, 'flavius-arena.src.html'), OUT = path.join(ROOT, 'flavius-arena.html'), MODS = path.join(ROOT, 'flavius-arena.mods.json');
const ESB = path.join(__dirname, '.esb');
const arg = process.argv.slice(2), has = k => arg.includes(k);
if (has('--pin')) { process.stdout.write(PIN + '\n'); process.exit(0); }
const OPT = { loader: 'js', minifyWhitespace: true, minifySyntax: SYNTAX, minifyIdentifiers: false, charset: 'utf8', legalComments: 'none', target: 'esnext' };
const MARK = n => `window.BUILD_MIN=${n};\n`;
const sha = t => crypto.createHash('sha1').update(t).digest('hex').slice(0, 16);
/* the main script of a built page: the text between the first plain <script> and the last </script> (what smartreg.js and V8 count from) */
const scriptOf = html => { const a = html.indexOf('<script>') + 8; return { a, src: html.slice(a, html.lastIndexOf('</script>')) }; };
const order = () => require('./srcpath').order();

function findEsbuild(install) {
  const tryDir = d => { try { const p = require.resolve('esbuild', d ? { paths: [d] } : undefined); const e = require(p); return e.version === PIN ? e : null; } catch (e) { return null; } };
  const dirs = [null, ESB];
  for (let d = ROOT, i = 0; i < 6; i++) { d = path.dirname(d); dirs.push(path.join(d, 'tools', '.esb')); } /* a worktree under the main checkout uses its copy */
  dirs.push('/tmp/ci');
  for (const d of dirs) { const e = tryDir(d); if (e) return e; }
  if (!install || process.env.FLAVIUS_NOINSTALL === '1') return null;
  /* once: npm into tools/.esb (gitignored). A failed try is remembered for an hour so an offline machine does not wait at every build. */
  const stamp = path.join(ESB, '.failed');
  try { if (Date.now() - fs.statSync(stamp).mtimeMs < 36e5) return null; } catch (e) {}
  try {
    fs.mkdirSync(ESB, { recursive: true });
    console.log(`installing esbuild@${PIN} into tools/.esb (once) …`);
    cp.execSync(`npm i --no-save --no-audit --no-fund --prefix "${ESB}" esbuild@${PIN}`, { stdio: 'ignore', timeout: 120000 });
    try { fs.unlinkSync(stamp); } catch (e) {}
  } catch (e) { try { fs.writeFileSync(stamp, String(e.message || e).slice(0, 300)); } catch (x) {} return null; }
  return tryDir(ESB);
}

/* esbuild's Annex B rewrite always prints `var name=name2` after `let name2=function…` (checked against a parser: tv117min) */
const LOWERED = /\bvar ([\w$]+)=\1\d+\b/;
const HELPER = /\b__(?:template|freeze|defProp|defProps|getOwnProp\w*|hasOwnProp|propIsEnum|spreadValues|spreadProps|objRest|publicField|privateGet|privateSet|privateAdd|privateMethod|name|async|await|esm|commonJS|export|copyProps|reExport|toESM|toCommonJS|decorate\w*|using|callDispose)\b/;
const RISKY = '([`+-/';
async function minify(es, files, src) {
  const res = await Promise.all(src.map(s => es.transform(s, OPT).then(r => ({ code: r.code.endsWith('\n') ? r.code : r.code + '\n' }), e => ({ err: String(e.message || e).split('\n').slice(0, 2).join(' ').slice(0, 160) }))));
  const why = new Array(src.length).fill('');
  res.forEach((r, i) => {
    if (r.err) why[i] = 'esbuild: ' + r.err;
    else if (LOWERED.test(r.code) && !LOWERED.test(src[i])) why[i] = 'function in a block';
    else { const h = r.code.match(HELPER); if (h && !src[i].includes(h[0])) why[i] = 'esbuild helper';
      else if (/<\/script|<!--/i.test(r.code)) why[i] = '</script or <!--'; }
  });
  /* module borders: B starts with a token that can continue an expression → is A's last statement closed? Ask esbuild: A+B must print
     the same as A + ";" + B but for that one ";". If not (or unknown), A and B stay exactly as the readable page has them. */
  for (let i = 1; i < src.length; i++) {
    const b = res[i];
    let joined = !src[i - 1].endsWith('\n') || !!res[i - 1].err || !!b.err; /* a module esbuild cannot read alone may be half a statement */
    if (!joined && RISKY.includes(b.code[0])) {
      joined = true;
      try {
        const x = es.transformSync(src[i - 1] + src[i], OPT).code, y = es.transformSync(src[i - 1] + '\n;\n' + src[i], OPT).code;
        let k = 0; while (k < x.length && x[k] === y[k]) k++;
        joined = !(y[k] === ';' && y.slice(0, k) + y.slice(k + 1) === x);
      } catch (e) {}
    }
    if (joined) { why[i - 1] = why[i - 1] || 'joins the module after'; why[i] = why[i] || 'joins the module before'; }
  }
  return res.map((r, i) => why[i] ? { text: src[i], why: why[i] } : { text: r.code, why: '' });
}

function sizes(label, buf) {
  const g = zlib.gzipSync(buf, { level: 9 }).length;
  const b = zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11, [zlib.constants.BROTLI_PARAM_LGWIN]: 24, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length } }).length;
  console.log(`  ${label.padEnd(24)} ${(buf.length / 1e6).toFixed(2)} MB · gzip -9 ${(g / 1e6).toFixed(2)} · Brotli q11 ${(b / 1e6).toFixed(2)}`);
}

/* --where LINE:COL → the module, and (through esbuild's source map for that one module) the line in its source file */
function vlq(s) { const B = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', out = []; let v = 0, sh = 0;
  for (const ch of s) { const d = B.indexOf(ch); v |= (d & 31) << sh; if (d & 32) sh += 5; else { out.push(v & 1 ? -(v >>> 1) : v >>> 1); v = sh = 0; } } return out; }
function where(pos, pageFile) {
  const m = /^(\d+):(\d+)$/.exec(pos || ''); if (!m) { console.log('usage: node tools/minbuild.js --where LINE:COL [page]'); process.exit(2); }
  const html = fs.readFileSync(pageFile || OUT, 'utf8'), M = JSON.parse(fs.readFileSync(MODS, 'utf8')), { a, src } = scriptOf(html);
  if (sha(src) !== M.sha) { console.log('flavius-arena.mods.json does not belong to this page — run sh build.sh first'); process.exit(1); }
  const lines = html.split('\n'); let off = 0; for (let i = 0; i < +m[1] - 1; i++) off += lines[i].length + 1; off += +m[2] - 1 - a;
  const mod = M.mods.find(x => off >= x[1] && off < x[2]);
  if (!mod) { console.log('that position is outside the game\'s modules (the page head or the build marker)'); return; }
  const near = src.slice(Math.max(mod[1], off - 60), off) + ' ▶ ' + src.slice(off, Math.min(mod[2], off + 80));
  if (!mod[3]) { const t = src.slice(mod[1], off).split('\n'); console.log(`${mod[0]}:${t.length}:${t[t.length - 1].length + 1}   (not minified)\n  ${near.replace(/\n/g, '⏎')}`); return; }
  const es = findEsbuild(false); let at = '';
  if (es) {
    const r = es.transformSync(fs.readFileSync(path.join(ROOT, mod[0]), 'utf8'), { ...OPT, sourcemap: 'external', sourcefile: mod[0] });
    const pre = src.slice(mod[1], off).split('\n'), L = pre.length - 1, C = pre[L].length;
    const rows = JSON.parse(r.map).mappings.split(';'); let sl = 0, sc = 0, best = null;
    rows.forEach((row, gl) => { let gc = 0; for (const seg of row.split(',')) { if (!seg) continue; const v = vlq(seg); gc += v[0]; if (v.length > 3) { sl += v[2]; sc += v[3]; if (gl < L || gl === L && gc <= C) best = [sl + 1, sc + 1]; } } });
    if (best) at = `:${best[0]}:${best[1]}`;
  }
  console.log(`${mod[0]}${at}${es ? '' : '   (no esbuild here: module only)'}\n  ${near.replace(/\n/g, '⏎')}`);
}

async function main() {
  if (has('--where')) return where(arg[arg.indexOf('--where') + 1], arg[arg.indexOf('--where') + 2]);
  const t0 = Date.now(), files = order(), src = files.map(f => fs.readFileSync(path.join(ROOT, f), 'utf8'));
  const page = fs.readFileSync(SRCPAGE, 'utf8'), { a, src: script } = scriptOf(page), head = page.slice(0, a), tail = page.slice(a + script.length);
  const pre0 = '\n' + MARK(0);
  if (script !== pre0 + src.join('')) { console.log('minbuild: flavius-arena.src.html is not "<script>" + the BUILD_MIN line + build.sh\'s module list — build.sh changed shape?'); process.exit(1); }
  const want = !has('--readable'), es = want ? findEsbuild(true) : null;
  let parts, pre, min = 0;
  if (es) { parts = await minify(es, files, src); pre = '\n' + MARK(1); min = 1; }
  else { parts = src.map(text => ({ text, why: want ? 'no esbuild' : '--readable' })); pre = pre0; }
  let o = pre.length; const mods = parts.map((p, i) => { const b = [files[i], o, o + p.text.length, p.why ? 0 : 1]; o += p.text.length; return b; });
  const out = pre + parts.map(p => p.text).join('');
  fs.writeFileSync(OUT, head + out + tail);
  const raw = {}; if (min) parts.forEach((p, i) => { if (p.why) raw[files[i]] = p.why; });
  fs.writeFileSync(MODS, JSON.stringify({ v: 1, min, esbuild: min ? PIN : '', syntax: SYNTAX, sha: sha(out), len: out.length, mods, raw }));
  const mb = n => (n / 1e6).toFixed(2);
  if (min) {
    const n = Object.keys(raw).length;
    console.log(`minified ${files.length - n} of ${files.length} modules (esbuild ${PIN}, whitespace only): page ${mb(Buffer.byteLength(page))} → ${mb(Buffer.byteLength(head + out + tail))} MB in ${((Date.now() - t0) / 1000).toFixed(1)} s · readable copy: flavius-arena.src.html`);
    const by = {}; for (const [f, w] of Object.entries(raw)) (by[w] = by[w] || []).push(path.basename(f, '.js'));
    for (const [w, l] of Object.entries(by)) console.log(`  not minified (${l.length}) — ${w}: ${l.join(' ')}`);
  } else if (want) console.log(`\x1b[1;33mNOT MINIFIED (esbuild missing): flavius-arena.html is the readable page. Needs esbuild@${PIN} — npm i --no-save --prefix tools/.esb esbuild@${PIN}\x1b[0m`);
  else console.log('READABLE build (--readable): flavius-arena.html is not minified — for debugging only, never commit or ship it');
  if (has('--sizes')) { sizes('readable (src.html)', Buffer.from(page)); sizes('flavius-arena.html', Buffer.from(head + out + tail)); }
  if (!min && (has('--require') || process.env.BUILD_REQUIRE_MIN === '1')) { console.log('BUILD_REQUIRE_MIN: a minified page is required here (release / CI)'); process.exit(3); }
}
main().catch(e => { console.error(e); process.exit(1); });
