/* v0.89 168-v89rotate: my corner at the bottom. With one human the board turns (display only) so their start corner is the
   lowest on screen; hovering a tile's screen spot maps back to that tile in every turn; hot seat, Naumachia, Chariot Racing,
   lessons and all-CPU tables keep the standard view; Flavius's box sits at the top centre, clear of the tiles, every time. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\.g/,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});
const miss=[];const out={};
/* start an event with the given human seats and skip the opening windows; returns the turn and geometry facts */
const run=(ev,humans,extra)=>pg.evaluate(async([ev,humans,extra])=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));
  while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}
  menuHide();SPEED='pause';const cls=['hero','soldier','royalty','venatore'];
  startEvent({ev,loc:6,seats:cls.map((c,i)=>({cls:c,cpu:!humans.includes(i)})),opts:{spect:0}});
  for(let i=0;i<60;i++){await W8(150);if(CUR_MODAL){const t=(document.getElementById('mTitle')||{}).textContent||'';const lit=document.querySelector('#mBody [data-mi]:not(.dim):not([disabled])');
      const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];if(lit&&/raft/.test(t))lit.click();else if(bs.length)bs[0].click();else CUR_MODAL.done(null)}
    else if(S&&S.phase!=='setup'&&i>6)break}
  SPEED='pause';if(extra==='hotseat')S.hotseat={players:humans.map(i=>({seat:i,pid:'x'+i}))};if(extra==='tut')S.tutorial=true;
  draw();const M=N-1;const ys=[[0,0],[0,M],[M,0],[M,M]].map(([r,c])=>({r,c,y:center(r,c).y}));
  const h=S.players.find(p=>!p.cpu);const low=ys.reduce((a,x)=>x.y>a.y?x:a);
  const F=flavXY89();const Wd=cv.parentElement.clientWidth;let topTile=1e9;for(let r=0;r<N;r++)for(let c=0;c<N;c++)topTile=Math.min(topTile,center(r,c).y-TH/2);
  return {k:ROT89.k,start:h?h.start:null,low:[low.r,low.c],flavC:Math.abs(F.cx-Wd/2)<1.5,flavTop:F.cy-F.h/2>=0,flavClear:F.cy+F.h/2<=topTile,box:[Math.round(F.cx),Math.round(F.cy+F.h/2),Math.round(topTile)]}},[ev,humans,extra]);
/* hover the screen spot of some tiles: hoverTile must be that tile */
const roundTrip=async()=>{const tiles=[[0,0],[0,12],[12,0],[12,12],[3,7],[9,2],[6,6],[11,4]];let bad=[];
  for(const [r,c] of tiles){const p=await pg.evaluate(([r,c])=>{draw();const m=center(r,c);const B=cv.getBoundingClientRect();return {x:B.left+m.x,y:B.top+m.y}},[r,c]);
    await pg.mouse.move(p.x,p.y);await pg.waitForTimeout(30);const t=await pg.evaluate(()=>hoverTile);if(!t||t.r!==r||t.c!==c)bad.push([r,c,t])}
  const all=await pg.evaluate(()=>{let n=0;const B=cv.getBoundingClientRect();for(let r=0;r<N;r++)for(let c=0;c<N;c++){const m=center(r,c);const t=pick({clientX:B.left+m.x,clientY:B.top+m.y});if(!t||t.r!==r||t.c!==c)n++}return n});
  return {bad,all}};
const ks=new Set();
for(let seat=0;seat<4;seat++){const o=await run('democritus',[seat]);out['seat'+seat]=o;ks.add(o.k);
  if(!o.start||o.low[0]!==o.start[0]||o.low[1]!==o.start[1])miss.push(`seat ${seat}: start ${o.start} not at the bottom (lowest ${o.low})`);
  if(!o.flavC||!o.flavTop||!o.flavClear)miss.push(`seat ${seat}: Flavius box ${JSON.stringify(o)}`);
  const rt=await roundTrip();out['rt'+seat]=rt;if(rt.bad.length||rt.all)miss.push(`seat ${seat} (k=${o.k}): round trip ${JSON.stringify(rt)}`)}
if(ks.size!==4)miss.push('all four turns used: '+[...ks]);
/* the standard view */
for(const [name,ev,hum,extra] of [['hotseat','democritus',[1,2],'hotseat'],['two humans','democritus',[1,2]],['naumachia','naumachia',[2]],['chariot','chariot',[2]],['tutorial','democritus',[2],'tut'],['all CPU','democritus',[]]]){
  const o=await run(ev,hum,extra);out[name]=o;if(o.k!==0)miss.push(name+' turned the board: k='+o.k);if(!o.flavC||!o.flavTop)miss.push(name+': Flavius box '+JSON.stringify(o))}
/* the real lesson keeps the standard view */
const tut=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}
  startTutorial();for(let i=0;i<20;i++){await W8(200);if(S&&S.tutorial)break}draw();return {tut:!!(S&&S.tutorial),k:ROT89.k}});
out.lesson=tut;if(tut.k!==0)miss.push('lesson turned the board');
/* stands off: the box still sits at the top centre, above every tile */
const o2=await run('democritus',[3]);await pg.evaluate(()=>setStands(false));
const ns=await pg.evaluate(()=>{draw();const F=flavXY89();let top=1e9;for(let r=0;r<N;r++)for(let c=0;c<N;c++)top=Math.min(top,center(r,c).y-TH/2);const r={k:ROT89.k,c:Math.abs(F.cx-cv.parentElement.clientWidth/2)<1.5,clear:F.cy+F.h/2<=top};setStands(true);return r});
out.noStands=ns;if(!ns.c||!ns.clear||ns.k!==o2.k)miss.push('stands off: '+JSON.stringify(ns));
console.log(JSON.stringify(out));console.log(JSON.stringify({miss}));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
