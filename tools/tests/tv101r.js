/* v1.01 wave 2 Phases B + C (327-v101beat):
   1 LOG AS EVENTS: an all-CPU Democritus played at Fast to its end — BUS 'log' carries EVERY line in order: the same count and text
     as S.logLines, and #log's newest lines are the BUS's last ones (newest first); log() wrappers still see the line written; caption
     goes through BUS 'caption'; the core's beats (beat kinds) and paints happened; HEADLESS: log() announces nothing.
   2 beat(): resolves at once while HEADLESS (same promise as sleep), honours Pause (held until the speed returns) and Step (held until
     Next), a port (beatUse) answers instead.
   3 awaiting(): {k:'ask'} exactly while an ask() window is open, back to null / 'command' once it answers; 'command' while a human idles
     in his action phase; null inside endTurn()/settle() (the 254 counters now ENG101). */
const path=require('path');const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:800}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1')});
const pg=await ctx.newPage();const errs=[],miss=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+path.resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
await pg.evaluate(()=>{window.__m=ERR92.n;menuHide();if(CUR_MODAL)CUR_MODAL.done(null);SETTINGS.briefing=false;POPPED.add('firstTurn');POPPED.add('mandata')});

/* ---------- 2 beat (first: on the page's own arena, before an event has ended) ---------- */
const r2=await pg.evaluate(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const o={};const sp0=SPEED;
  const h0=HEADLESS;HEADLESS=true;let done=0;const p=beat('tst',5000);p.then(()=>done=1);await Promise.resolve();await Promise.resolve();o.headless=done;HEADLESS=h0;
  SPEED='pause';done=0;beat('tst',50).then(()=>done=1);await sl(400);o.pauseHeld=!done;SPEED='normal';await sl(300);o.pauseLet=done;
  /* step: a CPU action just finished (stepGate) → wait for Next */
  const g0=stepGate;stepGate=()=>true;SPEED='step';done=0;beat('tst',300).then(()=>done=1);await sl(500);o.stepHeld=!done;
  try{if(typeof stepNext==='function')stepNext();else if(STEP.res){const r=STEP.res;STEP.res=null;r()}}catch(e){}await sl(200);o.stepLet=done;stepGate=g0;
  SPEED='normal';const offP=beatUse((k,ms)=>k==='tst2'?Promise.resolve('port'):null);o.port=await beat('tst2',99999);offP();
  done=0;beat('tst',30).then(()=>done=1);await sl(200);o.normal=done;SPEED=sp0;return o});
console.log('BEAT',JSON.stringify(r2));
if(!r2.headless)miss.push('beat not instant headless');if(!r2.pauseHeld||!r2.pauseLet)miss.push('beat ignores Pause');
if(!r2.stepHeld||!r2.stepLet)miss.push('beat ignores Step');if(r2.port!=='port')miss.push('beatUse port');if(!r2.normal)miss.push('beat at Normal');

/* ---------- 1 log as events ---------- */
const r1=await pg.evaluate(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const o={fns:['beat','beatUse','paint','awaiting','logDom','captionDom','engRunning101'].filter(f=>typeof window[f]!=='function')};
  const got=[],caps=[];let wrapSaw=0,wrapN=0;const off1=BUS.on('log',d=>got.push(d)),off2=BUS.on('caption',d=>caps.push(d.html));
  const bl=log;log=function(){const r=bl.apply(this,arguments);wrapN++;const li=document.querySelector('#log li');if(li&&S&&S.logLines&&S.logLines.length&&S.logLines[S.logLines.length-1].text===li.textContent)wrapSaw++;return r};
  const b0=BEAT101.n;let paints=0;const off3=BUS.on('state',()=>paints++);
  try{if(S)S.over=true;const seats=['soldier','hero','royalty','slave'].map((c,i)=>({cls:c,cpu:true,name:'Tst'+i}));
    startEvent({ev:'democritus',loc:6,seed:4242,seats,opts:{...CFG.opts,spect:'auto'}});const t0=Date.now();
    while(!(S&&S.over)&&Date.now()-t0<150000){if(SPEED!=='fast')SPEED='fast';if(CUR_MODAL){const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];if(bs.length)bs[0].click();else CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}await sl(60)}
  }finally{log=bl;off1();off2();off3()}
  o.over=!!(S&&S.over);const t=document.createElement('div');const txt=h=>{t.innerHTML=h;return t.textContent};
  const L=S.logLines;o.nBus=got.length;o.nLines=L.length;o.wrapN=wrapN;o.wrapSaw=wrapSaw;o.caps=caps.length;
  /* S.logLines starts at the event's newState; the bus heard the lines before it too — align on the tail */
  const tail=got.slice(got.length-L.length);o.order=tail.every((d,i)=>txt(d.html)===L[i].text&&(d.cls||'')===(L[i].cls||''));
  const lis=[...document.querySelectorAll('#log > li')].slice(0,30).map(li=>li.textContent);const last=got.slice(-30).reverse().map(d=>txt(d.html));
  o.dom=lis.every((x,i)=>x===last[i]);o.beats=BEAT101.n-b0;o.kinds=Object.keys(BEAT101.count).sort();o.paints=paints;
  /* HEADLESS: nothing announced */
  let hb=0;const off4=BUS.on('log',()=>hb++);const h0=HEADLESS;HEADLESS=true;try{log('x');caption('y')}finally{HEADLESS=h0;off4()}o.headlessLog=hb;
  return o});
console.log('LOG',JSON.stringify(r1));
if(r1.fns.length)miss.push('functions missing: '+r1.fns);if(!r1.over)miss.push('the event did not finish');
if(r1.nBus<r1.nLines||r1.nLines<20)miss.push('BUS log count '+r1.nBus+' vs S.logLines '+r1.nLines);if(!r1.order)miss.push('BUS lines not in S.logLines order');
if(!r1.dom)miss.push('#log newest lines are not the BUS last lines');if(r1.wrapN<r1.nLines||r1.wrapSaw<r1.nLines*0.9)miss.push('a log() wrapper did not find its line written ('+r1.wrapSaw+'/'+r1.wrapN+')');
if(!r1.caps)miss.push('no caption through the BUS');if(r1.beats<10||!r1.kinds.includes('beginTurn')||!r1.kinds.includes('cpuAct'))miss.push('core beats '+r1.beats+' '+r1.kinds);
if(r1.paints<20)miss.push('core paints '+r1.paints);if(r1.headlessLog)miss.push('HEADLESS log announced');

/* ---------- 3 awaiting ---------- */
const r3=await pg.evaluate(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const o={};
  if(S)S.over=true;const seats=[{cls:'soldier',cpu:false,name:'Me'},...['hero','royalty','slave'].map((c,i)=>({cls:c,cpu:true,name:'C'+i}))];
  SPEED='fast';startEvent({ev:'democritus',loc:6,seed:777,seats,opts:{...CFG.opts,spect:'auto'}});const t0=Date.now();
  while(Date.now()-t0<60000){if(CUR_MODAL){const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];if(bs.length)bs[0].click();else CUR_MODAL.done(null)}
    if(S&&!S.busy&&!CUR_MODAL&&humanTurn()&&S.phase==='choice'){const c=document.querySelector('#actions [data-act="coin"]');if(c)c.click()}
    if(S&&!S.busy&&!CUR_MODAL&&humanTurn()&&S.phase==='action')break;await sl(50)}
  await sl(200);o.idle=awaiting();o.pend0=ASK.pend.size;
  const p=askW(cur(),'tst101r','Awaiting test','<p>x</p>',[{label:'One',value:1},{label:'Two',value:2}]);await sl(150);
  o.during=awaiting();o.cur=!!CUR_MODAL;const bt=[...document.querySelectorAll('#mBtns button')].find(b=>/Two/.test(b.textContent));if(bt)bt.click();o.v=await p;o.after=awaiting();
  /* a local window is not a match decision */
  const pl=ask(cur(),'tst101l',{local:1,title:'L',body:'',buttons:[{label:'Ok',value:1}]});await sl(100);o.local=awaiting();if(CUR_MODAL)CUR_MODAL.done(1);await pl;
  /* inside endTurn: held */
  let inside=null,saw=0;const bc=checkEnd;checkEnd=function(){if(engRunning101()){saw++;if(inside===null)inside=awaiting()}return bc.apply(this,arguments)};const off5=()=>{checkEnd=bc};
  const tn=S.turnNo;command(0,{k:'act',a:'end'});await sl(1500);off5();o.turned=S.turnNo!==tn;o.inEnd=inside;o.sawRun=saw;o.engRun=ENG101.run;S.over=true;return o});
console.log('AWAIT',JSON.stringify(r3));
if(!r3.idle||r3.idle.k!=='command'||r3.idle.seat!==0)miss.push('awaiting while the human idles: '+JSON.stringify(r3.idle));
if(!r3.during||r3.during.k!=='ask'||r3.during.kind!=='tst101r'||!r3.cur)miss.push('awaiting during an ask: '+JSON.stringify(r3.during));
if(r3.v!==2||!r3.after||r3.after.k!=='command')miss.push('awaiting after the ask answered: '+JSON.stringify(r3.after));
if(r3.local&&r3.local.k==='ask')miss.push('a local window counted as a match decision');
if(!r3.sawRun)miss.push('no checkEnd() seen inside endTurn()/settle()');if(r3.inEnd!==null&&r3.inEnd!==undefined)miss.push('awaiting inside endTurn: '+JSON.stringify(r3.inEnd));
const newErr=await pg.evaluate(()=>ERR92.list?ERR92.list.slice(0).filter((x,i,a)=>true).length:0).catch(()=>0);
const e92=await pg.evaluate(()=>typeof errNew92==='function'?errNew92(window.__m):[]).catch(()=>[]);
for(const x of (e92||[]))errs.push('err92: '+(x.msg||x.m||JSON.stringify(x)).slice(0,200));
console.log('MISS',JSON.stringify(miss));console.log('ERRS '+JSON.stringify([...errs,...miss]));await b.close();process.exitCode=(errs.length||miss.length)?1:0})();
