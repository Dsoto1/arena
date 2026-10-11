/* look100/iter.js — quick check renders while modelling: node tools/plans/look100/iter.js <tag> '<js returning [canvas…]>' */
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../../..'), PORT = 8794 + Math.floor(Math.random() * 100);
(async () => {
  const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 700));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const pg = await browser.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' || m.type() === 'log') errs.push(m.text()); });
    await pg.goto(`http://127.0.0.1:${PORT}/tools/plans/look100/look.html`);
    await pg.waitForFunction(() => window.LOOK_READY, null, { timeout: 60000 });
    const url = await pg.evaluate(`(async()=>{ const cs = await (async()=>{ ${fs.readFileSync(process.argv[3], 'utf8')} })();
      const W = cs.reduce((s,c)=>s+c.width,0), H = Math.max(...cs.map(c=>c.height)); const o = document.createElement('canvas'); o.width=W; o.height=H; const g=o.getContext('2d'); g.fillStyle='#e9e1cf'; g.fillRect(0,0,W,H); let x=0; for(const c of cs){g.drawImage(c,x,0); x+=c.width} return o.toDataURL('image/png'); })()`);
    fs.writeFileSync(path.join(process.env.ITER_OUT || __dirname, `_iter_${process.argv[2]}.png`), Buffer.from(url.split(',')[1], 'base64'));
    console.log('ok', errs.slice(0, 8).join('\n'));
  } catch (e) { console.error('FAIL', e.message); } finally { await browser.close(); srv.kill(); }
})();
