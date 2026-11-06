/* tools/wrapped.js (v1.16 C3, his 5a 2026-11-06) — which functions are wrapped most often (CLAUDE.md §3 wrap idiom).
   node tools/wrapped.js            table: name, wrap count, modules (in build order; "x2" = twice in one module), sorted by count
   node tools/wrapped.js --md 25    markdown table of the top 25 (docs/architecture.md)
   Counts  {const base=NAME;NAME=function…  and its variants: const/let/var, any base name (base, b, base0 …), spaces, window.NAME on either side,
   async function and arrow wrappers. Not caught: wrappers that save the original in a multi-declaration (const a=X,b=Y;), through an object
   property (S.fn=…) or in a differently shaped statement; the footer prints the plain grep count of "const base=" for comparison. */
const fs = require('fs'), path = require('path'), SP = require('./srcpath');
const files = SP.order();
const RE = /\{\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:window\.)?([A-Za-z_$][\w$]*)\s*;\s*(?:window\.)?\2\s*=\s*(?:async\s+)?(?:function\b|\([^()]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>)/g;
const by = new Map(); let total = 0, grepBase = 0;
for (const f of files) {
  const t = fs.readFileSync(path.join(SP.ROOT, f), 'utf8'), mod = path.basename(f, '.js');
  grepBase += (t.match(/const base=/g) || []).length;
  let m; RE.lastIndex = 0;
  while ((m = RE.exec(t))) { total++; const e = by.get(m[2]) || { n: 0, mods: [] }; e.n++; e.mods.push(mod); by.set(m[2], e); }
}
const rows = [...by].map(([name, e]) => {
  const c = new Map(); e.mods.forEach(x => c.set(x, (c.get(x) || 0) + 1));
  return { name, n: e.n, mods: [...c].map(([k, v]) => v > 1 ? k + ' x' + v : k), last: e.mods[e.mods.length - 1] };
}).sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
const i = process.argv.indexOf('--md');
if (i >= 0) {
  const top = rows.slice(0, +process.argv[i + 1] || 25);
  console.log('| function | wraps | last wrapper (start here) | all wrapping modules, in build order |\n|---|---|---|---|');
  for (const r of top) { const l = r.mods.length > 8 ? r.mods.slice(0, 3).join(', ') + ' … ' + r.mods.slice(-3).join(', ') : r.mods.join(', '); console.log('| `' + r.name + '` | ' + r.n + ' | ' + r.last + ' | ' + l + ' |'); }
} else {
  for (const r of rows) console.log(String(r.n).padStart(4) + '  ' + r.name.padEnd(28) + r.mods.join(', '));
  console.log('\n' + total + ' wraps of ' + rows.length + ' functions in ' + files.length + ' modules; plain grep "const base=" finds ' + grepBase + ' (' + (grepBase > total ? (grepBase - total) + ' not matched here' : total - grepBase + ' more here: other variants') + ')');
}
