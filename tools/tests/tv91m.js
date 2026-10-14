/* v0.91 no flicker (198-v91morph): morph91 patches in place — an unchanged image is the SAME node after a redraw, a changed text updates,
   an opened <details> stays open, a focused input keeps what was typed, extra/missing nodes are added/removed; onlRedraw uses it. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_tally102off','1')});
await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
const r=await pg.evaluate(async()=>{const o={};const root=document.createElement('div');document.body.appendChild(root);
  const H=(t,n)=>`<div class="a"><img id="im" src="assets/coin.webp"><b>${t}</b><details id="d"><summary>x</summary>y</details><input id="in" value="v0">${'<i>k</i>'.repeat(n)}</div>`;
  root.innerHTML=H('one',2);const img=root.querySelector('#im');root.querySelector('#d').open=true;const inp=root.querySelector('#in');inp.focus();inp.value='typed';
  morph91(root,H('two',4));o.sameImg=root.querySelector('#im')===img;o.text=root.querySelector('b').textContent;o.open=root.querySelector('#d').open;o.typed=root.querySelector('#in').value;o.n=root.querySelectorAll('i').length;
  inp.blur();morph91(root,H('three',1));o.reset=root.querySelector('#in').value;o.n2=root.querySelectorAll('i').length;
  /* onlRedraw on the real screen keeps its nodes */
  onlineOpen();for(let i=0;i<50&&!document.getElementById('onl');i++)await new Promise(r=>setTimeout(r,100));const on=document.getElementById('onl');const first=on&&on.firstElementChild;onlRedraw();o.onlKept=!!first&&on.firstElementChild===first;return o});
console.log(JSON.stringify(r));
ok(r.sameImg,'1 an unchanged image is the same node');ok(r.text==='two','2 text updated');ok(r.open,'3 an opened fold stays open');ok(r.typed==='typed','4 a focused input keeps the typing');
ok(r.n===4&&r.n2===1,'5 nodes added/removed');ok(r.reset==='v0','6 an unfocused input follows the new value');ok(r.onlKept,'7 onlRedraw patches in place');
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
