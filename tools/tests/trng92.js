/* v0.92 THE DICE ARE NOT FOR THE SCREENS (his pick): with a live event paused on a human's Action phase, opening and closing the windows,
   switching the side tabs, hovering the board, zooming and redrawing must not move the event's seeded RNG (02-data RNG.s) nor the crowd
   stream (S._sideS) — the UI must use Math.random. Also: no new entries in the error log (00c-errlog) during the walk. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  startEvent({ev:'egidious',loc:0,seats:['royalty','soldier','hero','venatore'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:24}});
  for(let i=0;i<200;i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&!cur().cpu&&S.phase==='choice'){const c=document.querySelector('[data-act="coin"]');if(c)c.click()}else if(S&&!cur().cpu&&S.phase==='action'&&!S.busy&&i>6)break}
  SPEED='pause';await W8(600)});
const snap=()=>pg.evaluate(()=>({rng:RNG?RNG.s:null,side:S._sideS??null,phase:S.phase,cur:S.cur,mark:ERR92.n}));
const A=await snap();
const close=async()=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}});
const steps=[['settings',()=>openSettings('general')],['settings tokens',()=>openSettings('tokens')],['rules',()=>showRules()],['annals',()=>openHall()],['bestiary',()=>openMenagerie()],['crowd',()=>openCrowd(cur())]];
const done=[];
for(const [n,f] of steps){try{await pg.evaluate(`void (${f.toString()})();0`);await pg.waitForTimeout(700);await close();await pg.waitForTimeout(250);done.push(n)}catch(e){done.push(n+'!'+String(e.message).slice(0,60))}}
/* the side tabs, hover, zoom, redraws */
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(const t of ['field','stands','fighter']){const b=document.querySelector(`[data-sidetab="${t}"]`);if(b)b.click();await W8(200)}
  const r=cv.getBoundingClientRect();for(let i=0;i<30;i++){cv.dispatchEvent(new MouseEvent('mousemove',{clientX:r.left+r.width*(0.2+0.6*Math.random()),clientY:r.top+r.height*(0.2+0.6*Math.random()),bubbles:true}));await W8(20)}
  S.zoomIn=true;for(let i=0;i<12;i++){draw();await W8(40)}S.zoomIn=false;for(let i=0;i<12;i++){draw();await W8(40)}for(let i=0;i<5;i++){render();draw()}await W8(800)});
done.push('tabs/hover/zoom/redraw');
const B=await snap();const newErr=await pg.evaluate(m=>errNew92(m),A.mark);
ok(A.rng!=null,'the event is seeded '+JSON.stringify(A));ok(A.rng===B.rng,'the event RNG did not move ('+A.rng+' → '+B.rng+')');ok(A.side===B.side,'the crowd stream did not move ('+A.side+' → '+B.side+')');
ok(A.phase===B.phase&&A.cur===B.cur,'still the same turn and phase '+JSON.stringify([A.phase,A.cur,B.phase,B.cur]));ok(newErr.length===0,'no new errors logged: '+JSON.stringify(newErr).slice(0,400));
ok(done.every(d=>!d.includes('!')),'every screen opened: '+done.join(', '));
/* the log itself works */
const L=await pg.evaluate(async()=>{const m=ERR92.n;setTimeout(()=>{throw new Error('trng92 probe')},0);await new Promise(r=>setTimeout(r,100));try{null.x}catch(e){console.error(e)}
  openSettings('general');await new Promise(r=>setTimeout(r,500));const b=document.querySelector('[data-err92o]');const o={got:errNew92(m).map(e=>e.kind+':'+e.msg),btn:b&&b.textContent};if(b)b.click();await new Promise(r=>setTimeout(r,200));
  o.pop=document.querySelectorAll('#err92pop .err92e').length;o.stored=JSON.parse(localStorage.getItem('flavius_errlog92')||'[]').length;document.querySelector('[data-err92x]').click();return o});
ok(L.got.some(x=>/error:.*trng92 probe/.test(x))&&L.got.some(x=>/^caught:/.test(x)),'the log catches thrown + console.error '+JSON.stringify(L.got));ok(/Open \(\d+\)/.test(L.btn||'')&&L.pop>=2&&L.stored>=2,'Settings → Error log lists them and keeps them '+JSON.stringify(L));
console.log(JSON.stringify({A,B,done,L}));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs.filter(x=>!/trng92 probe/.test(x))));await b.close();process.exit(miss.length||errs.filter(x=>!/trng92 probe/.test(x)).length?1:0)})();
