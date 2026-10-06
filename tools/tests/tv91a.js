/* v0.91 music after switching windows/desktops (21-audio): hidden → the scheduler fills 3 s ahead at once; a stalled timer never fires
   the missed notes in a burst (it restarts just ahead of now); visible again → back to the 1 s lookahead. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const pg=await b.newPage();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');
  let H=false;Object.defineProperty(document,'hidden',{get:()=>H,configurable:true});window.__hide=v=>{H=v;document.dispatchEvent(new Event('visibilitychange'))}});
await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));
  SETTINGS.audio={...audSet(),on:true,music:true,menu:true};audInit();try{await AUD.ctx.resume()}catch(e){}audTick();for(let i=0;i<40&&!AUD.timer;i++)await W8(100);await W8(400);
  const o={running:AUD.ctx.state,timer:!!AUD.timer};const now=()=>AUD.ctx.currentTime;
  o.ahead0=AUD.next-now();
  __hide(true);o.aheadHidden=AUD.next-now();__hide(false);await W8(2300);
  /* a stalled timer (as a throttled background page): stop it for 1.5 s, then the pump runs once */
  clearInterval(AUD.timer);await W8(1500);const before=AUD.next-now();const sp=[];const st=audStep;audStep=function(th,t){sp.push(t-now());return st.apply(this,arguments)};
  AUD.pump();audStep=st;o.stallBehind=before;o.past=sp.filter(x=>x<0).length;o.n=sp.length;AUD.timer=setInterval(AUD.pump,100);
  await W8(300);o.aheadBack=AUD.next-now();return o});
console.log(JSON.stringify(r));
ok(r.timer,'0 the music runs');ok(r.ahead0>0.5&&r.ahead0<1.3,'1 visible: about 1 s ahead ('+r.ahead0+')');ok(r.aheadHidden>2.5,'2 hidden: 3 s ahead at once ('+r.aheadHidden+')');
ok(r.past===0&&r.n>0,'3 a stalled timer never schedules notes in the past ('+r.past+'/'+r.n+')');ok(r.stallBehind<0,'4 the stall really fell behind ('+r.stallBehind+')');ok(r.aheadBack<=1.3,'5 visible: back to 1 s ('+r.aheadBack+')');
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
