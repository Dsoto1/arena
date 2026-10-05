/* regcov.js — preloaded into every regression test (node -r ./tools/regcov.js). Tests need no change. Two jobs:
   1. SHARED BROWSER (REGWS=<ws endpoint>): the runner (smartreg.js) keeps one Chromium per worker slot (chromium.launchServer)
      and hands its endpoint to each test it starts there. A plain chromium.launch() — no options, or only headless:true —
      becomes chromium.connect(REGWS): every newPage()/newContext() is a fresh incognito context as before, and the test's
      browser.close() only closes ITS contexts and disconnects (the shared browser lives on; contexts left behind by a killed
      test are closed by the server when the socket drops). A launch with options (e.g. taud36's --autoplay-policy args), or a
      failed connect, falls back to a real launch.
   2. COVERAGE (REGCOV=<out.json>): every page records V8 function coverage (CDP Profiler); on browser.close() it writes the
      start offsets of every function that ran inside the game's inline <script> (plus the script length) to REGCOV.
      smartreg.js maps those offsets back to src/ files (the script is "\n" + the src files in build.sh order). */
const out = process.env.REGCOV, ws = process.env.REGWS;
if (out || ws) {
  const pw = require('playwright');
  const fs = require('fs');
  const launch = pw.chromium.launch.bind(pw.chromium);
  const plain = o => !o || Object.keys(o).every(k => k === 'headless' && o[k] !== false);
  pw.chromium.launch = async (...a) => {
    let b = null;
    if (ws && plain(a[0])) { try { b = await pw.chromium.connect(ws, { timeout: 15000 }); } catch (e) { b = null; } }
    if (!b) b = await launch(...a);
    if (!out) return b;
    const pages = [], offs = new Set();
    let len = 0;
    const take = async c => {
      try {
        const { result } = await c.send('Profiler.takePreciseCoverage');
        for (const e of result) {
          const top = e.functions.reduce((m, f) => Math.max(m, f.ranges[0].endOffset), 0);
          if (!/\.html/.test(e.url) || top < 1e6) continue; /* only the game script (the one big inline script) */
          len = top;
          for (const f of e.functions) {
            const r = f.ranges[0];
            if (r.count > 0 && !(r.startOffset === 0 && r.endOffset >= len - 2)) offs.add(r.startOffset);
          }
        }
      } catch (e) {}
    };
    const hook = o => {
      const np = o.newPage.bind(o);
      o.newPage = async (...x) => {
        const p = await np(...x);
        /* function-level only (detailed:false): near-free, unlike Playwright's block coverage (3x slower runs) */
        try {
          const c = await p.context().newCDPSession(p); await c.send('Profiler.enable'); await c.send('Profiler.startPreciseCoverage', { callCount: false, detailed: false }); pages.push(c);
          /* a page the test closes itself (t12 closes one per event) hands its coverage in first */
          const pc = p.close.bind(p); p.close = async (...y) => { await take(c); return pc(...y); };
        } catch (e) {}
        return p;
      };
    };
    hook(b);
    const nc = b.newContext.bind(b);
    b.newContext = async (...x) => { const c = await nc(...x); hook(c); return c; };
    const close = b.close.bind(b);
    b.close = async (...x) => {
      for (const c of pages) await take(c);
      try { fs.writeFileSync(out, JSON.stringify({ len, offs: [...offs] })); } catch (e) {}
      return close(...x);
    };
    return b;
  };
}
