/* babylon100/measure.js — numbers + screenshots for NOTES.md.   node tools/plans/babylon100/measure.js [variant,...]
   Each variant = a FRESH browser (cold cache) on the mock-up over http (repo root), SwiftShader WebGL (no GPU in this container, so
   every number is a SOFTWARE-rendered worst case). Per variant: load marks (HTML → Babylon parsed → first frame → ready), bytes per
   resource, fps + frame p50/p95 from rAF over SECS, Babylon's own CPU frame/render time, draw calls, tris, JS heap, the browser's
   total RSS, a GPU texture estimate; then the render loop stops and a screenshot is taken. → shots/<variant>.webp + measure.json
   Also: GAME=1 measures the game's own 2D arena draw() (flavius-arena.html, all-CPU Democritus) at the same viewport for comparison. */
const { chromium } = require('playwright'); const { spawn, execSync } = require('child_process'); const fs = require('fs'), path = require('path');
const HERE = __dirname, ROOT = path.resolve(HERE, '../../..'), SECS = +(process.env.SECS || 6), OUT = path.join(HERE, 'shots');
fs.mkdirSync(OUT, { recursive: true });
const VARIANTS = {
  day: { q: '', w: 1440, h: 900 }, night: { q: 'night=1', w: 1440, h: 900 }, orbit: { q: 'persp=1&orbit=1', w: 1440, h: 900 },
  persp_night: { q: 'persp=1&night=1', w: 1440, h: 900 }, close: { q: 'zoom=close', w: 1440, h: 900 }, close_night: { q: 'zoom=close&night=1', w: 1440, h: 900 },
  lite: { q: 'shadows=0&outline=0', w: 1440, h: 900 }, noshadow: { q: 'shadows=0', w: 1440, h: 900 }, phone: { q: '', w: 844, h: 390, mobile: true },
};
const WANT = (process.argv[2] || Object.keys(VARIANTS).join(",")).split(",");
const ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-precise-memory-info'];
const rssTree = (pid) => { try { const ps = execSync('ps -eo pid,ppid,rss').toString().trim().split('\n').slice(1).map(l => l.trim().split(/\s+/).map(Number));
  const kids = new Set([pid]); let grew = true; while (grew) { grew = false; for (const [p, pp] of ps) if (kids.has(pp) && !kids.has(p)) { kids.add(p); grew = true; } }
  return Math.round(ps.filter(([p]) => kids.has(p)).reduce((a, [, , r]) => a + r, 0) / 1024); } catch (e) { return -1; } };
const load1 = () => { try { return +fs.readFileSync('/proc/loadavg', 'utf8').split(' ')[0]; } catch (e) { return -1; } };
const FRAMES = () => new Promise(res => { const f = []; let last = performance.now(); const t0 = last; const tick = () => { const t = performance.now(); f.push(t - last); last = t; if (t - t0 < window.__SECS * 1000 || f.length < 5) requestAnimationFrame(tick); else res(f.slice(1)); }; requestAnimationFrame(tick); });
const SUMF = (f) => { const s = f.slice().sort((a, b) => a - b), q = p => +(s[Math.floor(s.length * p)] || 0).toFixed(1); return { n: f.length, fps: +(f.length / (f.reduce((a, b) => a + b, 0) / 1000)).toFixed(1), p50: q(0.5), p95: q(0.95), max: q(0.999) }; };

async function babylon(name) {
  const V = VARIANTS[name]; const PORT = 8900 + Math.floor(Math.random() * 90);
  const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' }); await new Promise(r => setTimeout(r, 700));
  const bs = await chromium.launchServer({ args: ARGS }); const pid = bs.process().pid; const b = await chromium.connect(bs.wsEndpoint());
  try {
    const pg = await b.newPage({ viewport: { width: V.w, height: V.h }, deviceScaleFactor: V.mobile ? 3 : 1, isMobile: !!V.mobile, hasTouch: !!V.mobile });
    const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    const cdp = await pg.context().newCDPSession(pg); await cdp.send('Performance.enable');
    const L0 = load1(); const t0 = Date.now();
    await pg.goto(`http://127.0.0.1:${PORT}/tools/plans/babylon100/arena.html?noui=1${V.q ? '&' + V.q : ''}`, { timeout: 120000 });
    await pg.waitForFunction(() => window.MOCK_READY || window.MOCK_ERR, null, { timeout: 300000, polling: 250 });
    const wall = Date.now() - t0;
    const load = await pg.evaluate(() => { const m = k => { const e = performance.getEntriesByName(k)[0]; return e ? Math.round(e.startTime) : -1; };
      const res = performance.getEntriesByType('resource').map(r => ({ f: r.name.replace(/^.*\/(tools|assets)\//, '$1/'), kb: Math.round(r.encodedBodySize / 1024), ms: Math.round(r.responseEnd - r.startTime) }));
      return { htmlMs: m('html'), babylonParsedMs: m('babylon'), firstFrameMs: Math.round(window.MOCK_FIRST_T), readyMs: Math.round(window.MOCK_READY_T), err: window.MOCK_ERR || null, totalKB: res.reduce((a, r) => a + r.kb, 0), res }; });
    await pg.evaluate((s) => { window.__SECS = s; }, SECS);
    const frames = SUMF(await pg.evaluate(FRAMES));
    const bjs = await pg.evaluate(() => { const s = window.MOCK.stats(); let tex = 0; for (const t of window.MOCK.scene.textures) { try { const z = t.getSize(); tex += z.width * z.height * 4 * (t.noMipmap ? 1 : 1.33); } catch (e) {} }
      return Object.assign(s, { texMB: +(tex / 1048576).toFixed(1), heapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : -1, gl: window.MOCK.engine.getGlInfo().renderer }); });
    const met = (await cdp.send('Performance.getMetrics')).metrics, mv = k => (met.find(x => x.name === k) || {}).value || 0;
    const rssMB = pid ? rssTree(pid) : -1;
    await pg.evaluate(() => { window.MOCK.engine.stopRenderLoop(); window.MOCK.scene.render(); });
    /* the canvas itself (preserveDrawingBuffer): a page screenshot waits on SwiftShader's compositor backlog and can time out */
    const png = await pg.evaluate(() => document.getElementById('cv').toDataURL('image/webp', 0.82), null); fs.writeFileSync(path.join(OUT, name + '.webp'), Buffer.from(png.split(',')[1], 'base64'));
    return { name, viewport: `${V.w}x${V.h}${V.mobile ? '@3' : ''}`, load: Object.assign(load, { wallMs: wall }), frames, babylon: bjs, jsHeapMB: +(mv('JSHeapUsedSize') / 1048576).toFixed(1), rssMB, load1: [L0, load1()], errs: errs.slice(0, 5) };
  } finally { await b.close(); await bs.close(); srv.kill(); }
}

async function game() {   /* the game's 2D canvas: forced draw() calls on a live all-CPU event, same viewport */
  const bs = await chromium.launchServer({ args: ARGS }); const pid = bs.process().pid; const b = await chromium.connect(bs.wsEndpoint());
  try { const pg = await b.newPage({ viewport: { width: 1440, height: 900 } }); await pg.route(/fonts\.g/, r => r.abort());
    await pg.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); localStorage.setItem('flavius_firstrun', 'shown'); });
    const t0 = Date.now(); await pg.goto(await require(path.join(ROOT, 'tools/perf95/serve.js'))(path.join(ROOT, 'flavius-arena.html')), { timeout: 240000, waitUntil: 'domcontentloaded' });
    await pg.waitForFunction(() => window.FLAVIUS_READY, null, { timeout: 300000, polling: 500 }); const bootMs = Date.now() - t0;
    const out = await pg.evaluate(async () => { const W8 = ms => new Promise(r => setTimeout(r, ms)); while (CUR_MODAL) { CUR_MODAL.done(CUR_MODAL.closeB ? CUR_MODAL.closeB.value : null); await W8(120); } try { menuHide(); } catch (e) {}
      startEvent({ ev: 'democritus', loc: 6, seats: ['hero', 'soldier', 'royalty', 'venatore'].map(c => ({ cls: c, cpu: true })) });
      for (let i = 0; i < 200; i++) { await W8(100); if (CUR_MODAL) CUR_MODAL.done(CUR_MODAL.closeB ? CUR_MODAL.closeB.value : null); else if (S && S.phase !== 'setup' && i > 8) break; }
      SPEED = 'pause'; await W8(1500);
      const one = (n) => { const d = []; for (let i = 0; i < n; i++) { const t = performance.now(); draw(); d.push(performance.now() - t); } d.sort((a, b) => a - b); return { p50: +d[n >> 1].toFixed(1), p95: +d[Math.floor(n * 0.95)].toFixed(1) }; };
      const r = { full: one(40) }; try { CAM.z = 2; } catch (e) {} r.zoom2 = one(40); try { CAM.z = 1; } catch (e) {}
      r.heapMB = +(performance.memory.usedJSHeapSize / 1048576).toFixed(1); r.cv = [document.getElementById('cv').width, document.getElementById('cv').height]; return r; });
    const rss = rssTree(pid); try { const png = await pg.evaluate(() => document.getElementById('cv').toDataURL('image/webp', 0.82)); fs.writeFileSync(path.join(OUT, 'game_today.webp'), Buffer.from(png.split(',')[1], 'base64')); } catch (e) { console.log('game shot', e.message); }
    return Object.assign(out, { bootMs, rssMB: rss, load1: load1() });
  } finally { await b.close(); await bs.close(); }
}

(async () => {
  const file = path.join(HERE, 'measure.json'); const all = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  if (process.env.GAME === '1') { all.game = await game(); console.log('game', JSON.stringify(all.game)); }
  for (const v of WANT.filter(k => VARIANTS[k])) { const r = await babylon(v); all[v] = r; console.log(v, JSON.stringify({ load: { ...r.load, res: undefined }, frames: r.frames, b: r.babylon, rss: r.rssMB, heap: r.jsHeapMB, la: r.load1, errs: r.errs }));
    fs.writeFileSync(file, JSON.stringify(all, null, 1)); }
  fs.writeFileSync(file, JSON.stringify(all, null, 1));
})();
