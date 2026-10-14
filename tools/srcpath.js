/* tools/srcpath.js — where a game module lives. Since v1.01 src/ is grouped by topic: src/<topic>/NN-name.js (CLAUDE.md §2).
   Module names (NN-name.js) are unique across the folders, so tools keep using the bare name and ask here for the path.
     const SP = require('./srcpath');            (from tools/; '../srcpath' from tools/i18n, …)
     SP.rel('02-data.js')  → 'src/core/02-data.js'      SP.abs('02-data.js') → absolute path
     SP.order()            → build.sh's concatenation order (relative paths, 08-setup last)
     SP.all()              → every file under src/ (relative paths)
   tools/srcmap.json = the one-time move list (old flat name → new path), for merging branches made before the regroup. */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), SRC = path.join(ROOT, 'src');
let IDX = null;
function index() {
  if (IDX) return IDX;
  IDX = {};
  for (const d of fs.readdirSync(SRC, { withFileTypes: true })) {
    if (d.isDirectory()) for (const f of fs.readdirSync(path.join(SRC, d.name))) IDX[f] = 'src/' + d.name + '/' + f;
    else IDX[d.name] = 'src/' + d.name;
  }
  return IDX;
}
const rel = name => index()[path.basename(name)] || null;
const abs = name => { const r = rel(name); if (!r) throw new Error('no src module ' + name); return path.join(ROOT, r); };
const order = () => fs.readFileSync(path.join(ROOT, 'build.sh'), 'utf8').match(/\bcat (src\/[\w\/.-]+\.js [^;]+);/)[1].trim().split(/\s+/);
const all = () => Object.values(index()).sort();
module.exports = { ROOT, rel, abs, order, all };
