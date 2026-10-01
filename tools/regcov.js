/* regcov.js — preloaded into a regression test (node -r ./tools/regcov.js) when REGCOV=<out.json> is set.
   Wraps playwright's chromium.launch so every page records V8 function coverage (CDP Profiler); on browser.close() it writes the start offsets
   of every function that ran inside the game's inline <script> (plus the script length) to REGCOV. smartreg.js maps those
   offsets back to src/ files (the script is "\n" + the src files in build.sh order). Tests need no change. */
const out = process.env.REGCOV;
if (out) {
  const pw = require('playwright');
  const fs = require('fs');
  const launch = pw.chromium.launch.bind(pw.chromium);
  pw.chromium.launch = async (...a) => {
    const b = await launch(...a);
    const pages = [];
    const hook = o => {
      const np = o.newPage.bind(o);
      o.newPage = async (...x) => {
        const p = await np(...x);
        /* function-level only (detailed:false): near-free, unlike Playwright's block coverage (3x slower runs) */
        try { const c = await p.context().newCDPSession(p); await c.send('Profiler.enable'); await c.send('Profiler.startPreciseCoverage', { callCount: false, detailed: false }); pages.push(c); } catch (e) {}
        return p;
      };
    };
    hook(b);
    const nc = b.newContext.bind(b);
    b.newContext = async (...x) => { const c = await nc(...x); hook(c); return c; };
    const close = b.close.bind(b);
    b.close = async () => {
      const offs = new Set();
      let len = 0;
      for (const p of pages) {
        try {
          const { result } = await p.send('Profiler.takePreciseCoverage');
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
      }
      try { fs.writeFileSync(out, JSON.stringify({ len, offs: [...offs] })); } catch (e) {}
      return close();
    };
    return b;
  };
}
