/* perf100 audit — "unnecessary rendering" by scene. One browser, one page at a time, short windows (the machine is shared).
   node tools/plans/perf100/measure.js [scene,...]   scenes: menu menuidle event mgr recruit city online studio
   Counts per second while the scene sits WITHOUT input: render()/draw()/MGR_REDRAW/onlRedraw/studioRedraw/renderTurnInd/computeHL,
   innerHTML writes (by target), layout-reading calls (forced-reflow candidates, stack-sampled), CDP Layout/RecalcStyle counts + ms,
   PERF92 sweep runs, real setInterval fires + rAF callbacks (by callback source), running CSS animations (and how many are on
   invisible / off-screen elements), image decodes + paints from a short trace, heap/DOM before and after. Writes scenes.json. */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),os=require('os');
const R=path.resolve(__dirname,'..','..','..');const serve=require(path.join(R,'tools/perf95/serve.js'));
const SECS=+(process.env.SECS||10);
const WANT=(process.argv[2]||'menu,menuidle,event,mgr,recruit,city,online,studio').split(',');
const INIT=()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');
  if(location.search.includes('onl'))localStorage.setItem('flavius_online77','1');
  const Z={ih:{},ihc:0,ihch:0,lay:{},layn:0,si:{},raf:{},st:{},on:false};window.__Z=Z;
  const key=f=>{let s='';try{s=Function.prototype.toString.call(f)}catch(e){}return s.replace(/\s+/g,' ').slice(0,70)};
  const site=()=>{const s=(new Error().stack||'').split('\n').slice(3,6).map(l=>{const m=l.match(/at (?:new )?([\w$.<>]+)/);return m?m[1]:'?'}).join('<');return s};
  const d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
  Object.defineProperty(Element.prototype,'innerHTML',{get:d.get,set(v){if(Z.on){const k=this.id?'#'+this.id:(this.className&&typeof this.className==='string'?'.'+this.className.split(' ')[0]:this.tagName);
    const o=Z.ih[k]||(Z.ih[k]={n:0,ch:0,site:{}});o.n++;o.ch+=(v&&v.length)||0;Z.ihc++;Z.ihch+=(v&&v.length)||0;if(o.n%5===1){const s=site();o.site[s]=(o.site[s]||0)+1}}return d.set.call(this,v)},configurable:true});
  const LAYP=[[HTMLElement.prototype,['offsetWidth','offsetHeight','offsetTop','offsetLeft']],[Element.prototype,['clientWidth','clientHeight','scrollHeight','scrollWidth','scrollTop']]];
  for(const [P,ks] of LAYP)for(const k of ks){const dd=Object.getOwnPropertyDescriptor(P,k);if(!dd||!dd.get)continue;Object.defineProperty(P,k,{get(){if(Z.on){Z.layn++;if(Z.layn%20===1){const s=k+' '+site();Z.lay[s]=(Z.lay[s]||0)+1}}return dd.get.call(this)},set:dd.set,configurable:true})}
  {const g=Element.prototype.getBoundingClientRect;Element.prototype.getBoundingClientRect=function(){if(Z.on){Z.layn++;if(Z.layn%20===1){const s='gBCR '+site();Z.lay[s]=(Z.lay[s]||0)+1}}return g.call(this)}}
  {const g=window.getComputedStyle;window.getComputedStyle=function(){if(Z.on){Z.layn++;if(Z.layn%20===1){const s='gCS '+site();Z.lay[s]=(Z.lay[s]||0)+1}}return g.apply(this,arguments)}}
  const si=window.setInterval;window.setInterval=function(f,ms,...a){if(typeof f!=='function')return si.call(this,f,ms,...a);const k=ms+'ms '+key(f);return si.call(this,function(){if(Z.on)Z.si[k]=(Z.si[k]||0)+1;return f.apply(this,arguments)},ms,...a)};
  const st=window.setTimeout;window.setTimeout=function(f,ms,...a){if(typeof f!=='function')return st.call(this,f,ms,...a);return st.call(this,function(){if(Z.on){const k=(ms|0)+'ms '+key(f);Z.st[k]=(Z.st[k]||0)+1}return f.apply(this,arguments)},ms,...a)};
  const raf=window.requestAnimationFrame;window.requestAnimationFrame=function(f){return raf.call(this,function(t){if(Z.on){const k=key(f);Z.raf[k]=(Z.raf[k]||0)+1}return f.call(this,t)})};
};
const WRAP=()=>{const Z=window.__Z;Z.fn={};Z.fms={};for(const k of ['render','draw','MGR_REDRAW','onlRedraw','studioRedraw','renderTurnInd','computeHL','drawStands','renderBubbles','sideApply','mgrHTML','cityDraw','drawCity','morph95','morph91']){
  try{const f=(0,eval)(k);if(typeof f!=='function')continue;window['__w_'+k]=function(){const t=performance.now();try{return f.apply(this,arguments)}finally{if(Z.on){Z.fn[k]=(Z.fn[k]||0)+1;Z.fms[k]=(Z.fms[k]||0)+performance.now()-t}}};(0,eval)(k+'=window.__w_'+k)}catch(e){}}};
const SNAP=()=>{const Z=window.__Z;const anims=document.getAnimations().filter(a=>a.playState==='running');const by={};let off=0;
  for(const a of anims){const el=a.effect&&a.effect.target;let vis=true;if(el&&el.getClientRects){const r=el.getClientRects();if(!r.length)vis=false;else{const b=r[0];if(b.bottom<0||b.top>innerHeight||b.right<0||b.left>innerWidth||b.width*b.height===0)vis=false}
      let p=el;while(vis&&p&&p!==document.body){const cs=getComputedStyle(p);if(cs.visibility==='hidden'||+cs.opacity===0){vis=false}p=p.parentElement}}
    if(!vis)off++;const n=(a.animationName||a.constructor.name)+(el&&el.id?' #'+el.id:el&&el.className&&typeof el.className==='string'?' .'+el.className.split(' ')[0]:'');by[n]=by[n]||{n:0,off:0};by[n].n++;if(!vis)by[n].off++}
  const P=typeof PERF92!=='undefined'?PERF92.tasks.map(t=>[t.name,t.runs]):[];
  return {anims:anims.length,animsOff:off,animBy:Object.entries(by).sort((a,b)=>b[1].n-a[1].n).slice(0,12),perf:P,nodes:document.getElementsByTagName('*').length,idle:typeof PERF92!=='undefined'&&PERF92.idle}};
const metric=(m,k)=>(m.find(x=>x.name===k)||{}).value||0;
async function measure(b,pg,cdp,label,extra){
  await cdp.send('HeapProfiler.collectGarbage');const m0=(await cdp.send('Performance.getMetrics')).metrics;const s0=await pg.evaluate(SNAP);
  await pg.evaluate(()=>{const Z=window.__Z;Z.ih={};Z.ihc=0;Z.ihch=0;Z.lay={};Z.layn=0;Z.si={};Z.raf={};Z.st={};Z.fn={};Z.fms={};Z.on=true;if(typeof LAYERS93!=='undefined'&&LAYERS93.reset)LAYERS93.reset()});
  const tr=path.join(os.tmpdir(),'perf100-'+label+'.json');const traceS=Math.min(4,SECS);
  await b.startTracing(pg,{path:tr,categories:['devtools.timeline','disabled-by-default-devtools.timeline']});await pg.waitForTimeout(traceS*1000);await b.stopTracing();
  await pg.waitForTimeout((SECS-traceS)*1000);
  const z=await pg.evaluate(()=>{const Z=window.__Z;Z.on=false;const L=typeof LAYERS93!=='undefined'&&LAYERS93.report?LAYERS93.report():null;return {fn:Z.fn,fms:Z.fms,ih:Z.ih,ihc:Z.ihc,ihch:Z.ihch,lay:Z.lay,layn:Z.layn,si:Z.si,raf:Z.raf,st:Z.st,
    layers:L&&L.frames?{frames:L.frames,rows:L.rows.map(x=>x.cached?{n:x.name,hit:x.hits,miss:x.misses,paint:x.paintMs,blit:x.blitMs}:{n:x.name,avg:x.avg,max:x.max})}:null}});
  const m1=(await cdp.send('Performance.getMetrics')).metrics;const s1=await pg.evaluate(SNAP);await cdp.send('HeapProfiler.collectGarbage');const m2=(await cdp.send('Performance.getMetrics')).metrics;
  const ev=JSON.parse(fs.readFileSync(tr)).traceEvents;const tn={};for(const e of ev)if(e.ph==='M'&&e.name==='thread_name')tn[e.pid+':'+e.tid]=e.args.name;
  const cnt=re=>{const x=ev.filter(e=>e.ph==='X'&&re.test(e.name));return {n:x.length,perS:+(x.length/traceS).toFixed(1),msPerS:Math.round(x.reduce((a,e)=>a+(e.dur||0)/1000,0)/traceS)}};
  const D=k=>metric(m1,k)-metric(m0,k);const ps=v=>+(v/SECS).toFixed(1);
  const perfRuns={};for(const [n,r] of s1.perf){const a=(s0.perf.find(x=>x[0]===n)||[0,0])[1];if(r-a)perfRuns[n]=r-a}
  const top=(o,f,k=8)=>Object.entries(o).sort((a,b)=>f(b[1])-f(a[1])).slice(0,k);
  const out={label,secs:SECS,...extra,
    calls:Object.fromEntries(Object.entries(z.fn).map(([k,v])=>[k,{perS:ps(v),msPerS:+(z.fms[k]/SECS).toFixed(1)}])),
    cdp:{taskMsPerS:Math.round(D('TaskDuration')*1000/SECS),scriptMsPerS:Math.round(D('ScriptDuration')*1000/SECS),layoutPerS:ps(D('LayoutCount')),layoutMsPerS:Math.round(D('LayoutDuration')*1000/SECS),styleRecalcPerS:ps(D('RecalcStyleCount')),styleMsPerS:Math.round(D('RecalcStyleDuration')*1000/SECS)},
    trace:{decode:cnt(/^Decode Image$|ImageDecodeTask|Decode LazyPixelRef/),paint:cnt(/^Paint$/),commit:cnt(/^Commit$/),layout:cnt(/^Layout$/),style:cnt(/^UpdateLayoutTree$/),parseHTML:cnt(/^ParseHTML$/)},
    innerHTML:{perS:ps(z.ihc),kcharsPerS:+(z.ihch/1000/SECS).toFixed(1),top:top(z.ih,v=>v.ch).map(([k,v])=>({k,n:v.n,kch:Math.round(v.ch/1000),site:top(v.site,x=>x,2).map(x=>x[0])}))},
    layoutReads:{perS:ps(z.layn),sites:top(z.lay,x=>x,8)},
    perf92Runs:perfRuns,realIntervals:top(z.si,x=>x,10).map(([k,v])=>[ps(v),k]),timeouts:top(z.st,x=>x,8).map(([k,v])=>[ps(v),k]),raf:top(z.raf,x=>x,8).map(([k,v])=>[ps(v),k]),
    anims:{running:s1.anims,offscreen:s1.animsOff,by:s1.animBy},layers:z.layers,
    mem:{heapMB0:+(metric(m0,'JSHeapUsedSize')/1e6).toFixed(1),heapMB1:+(metric(m2,'JSHeapUsedSize')/1e6).toFixed(1),nodes0:s0.nodes,nodes1:s1.nodes,docs:metric(m2,'Documents'),listeners:metric(m2,'JSEventListeners')},idle:s1.idle};
  console.log(JSON.stringify(out));return out}
const W8=`const W8=ms=>new Promise(r=>setTimeout(r,ms));const closeAll=async()=>{for(let i=0;i<30&&CUR_MODAL;i++){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}};`;
async function fresh(b,q=''){const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\.g/,x=>x.abort());await pg.addInitScript(INIT);
  await pg.goto((await serve(path.join(R,'flavius-arena.html')))+q);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});await pg.waitForTimeout(1500);await pg.evaluate(WRAP);
  const cdp=await pg.context().newCDPSession(pg);await cdp.send('Performance.enable');return {pg,cdp}}
const MGR=async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<30&&CUR_MODAL;i++){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}
  menuHide();openManager();for(let i=0;i<50&&typeof MGR_REDRAW!=='function';i++)await W8(200);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;MGR.tab='ludus';MGR_REDRAW();await W8(2500);
  for(let i=0;i<10&&CUR_MODAL&&!document.getElementById('mgrBody');i++){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(200)}return !!document.getElementById('mgrBody')};
(async()=>{const b=await chromium.launch();const all=[];
 try{
 if(WANT.includes('menu')||WANT.includes('menuidle')){const {pg,cdp}=await fresh(b);
   if(WANT.includes('menu'))all.push(await measure(b,pg,cdp,'menu-show'));
   /* the menu show plays ~28 s once (08-setup mmLoop), then the picture holds: measure the menu after it */
   await pg.waitForFunction(()=>!MM.raf,null,{timeout:60000}).catch(()=>{});await pg.waitForTimeout(1000);if(WANT.includes('menu'))all.push(await measure(b,pg,cdp,'menu-still'));
   if(WANT.includes('menuidle')){await pg.evaluate(()=>{PERF92.lastInput=PERF92.lastAct=performance.now()-PERF92_IDLE_MS-5000;perf92Beat(true)});await pg.waitForTimeout(1500);all.push(await measure(b,pg,cdp,'menuidle'))}
   await pg.close()}
 if(WANT.includes('event')){const {pg,cdp}=await fresh(b);
   await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<30&&CUR_MODAL;i++){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}menuHide();
     startEvent({ev:'democritus',loc:6,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true}))});
     for(let i=0;i<200;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>8)break}
     SPEED='normal';setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)},300)});
   await pg.waitForTimeout(2000);const t0=await pg.evaluate(()=>S.turnNo);const o=await measure(b,pg,cdp,'event-normal');o.turns=await pg.evaluate(()=>S.turnNo)-t0;all.push(o);
   /* paused match: the board sits still — what still runs? */
   await pg.evaluate(()=>{SPEED='pause'});await pg.waitForTimeout(2500);all.push(await measure(b,pg,cdp,'event-paused'));
   if(process.env.MEM){/* a few minutes of Normal play: heap / DOM drift */const mem=[];await pg.evaluate(()=>{SPEED='normal'});
     for(let i=0;i<=+process.env.MEM;i++){await cdp.send('HeapProfiler.collectGarbage');const m=(await cdp.send('Performance.getMetrics')).metrics;mem.push({t:i*30,heapMB:+(metric(m,'JSHeapUsedSize')/1e6).toFixed(1),nodes:metric(m,'Nodes'),listeners:metric(m,'JSEventListeners'),turn:await pg.evaluate(()=>S.turnNo+(S.over?' over':''))});if(i<+process.env.MEM)await pg.waitForTimeout(30000)}
     console.log('MEM '+JSON.stringify(mem));all.push({label:'event-mem',mem})}
   await pg.close()}
 if(['mgr','recruit','city'].some(x=>WANT.includes(x))){const {pg,cdp}=await fresh(b);const ok=await pg.evaluate(MGR);
   if(WANT.includes('mgr'))all.push(await measure(b,pg,cdp,'mgr-ludus',{ok}));
   if(WANT.includes('recruit')){await pg.evaluate(async()=>{MGR.tab='recruit';MGR_REDRAW();await new Promise(r=>setTimeout(r,1500))});all.push(await measure(b,pg,cdp,'mgr-recruit'))}
   if(WANT.includes('city')){await pg.evaluate(async()=>{MGR.tab='ludus';MGR_REDRAW();me().coin=500;openCitySquare(W_().night.loc,{prematch:true});await new Promise(r=>setTimeout(r,4000))});all.push(await measure(b,pg,cdp,'city-square'))}
   await pg.close()}
 if(WANT.includes('online')){const {pg,cdp}=await fresh(b,'?onl');await pg.evaluate(()=>localStorage.removeItem('flavius_onlmock'));
   await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<30&&CUR_MODAL;i++){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}onlineOpen('play')});
   await pg.waitForFunction(()=>!!document.querySelector('#onl input'),null,{timeout:30000}).catch(()=>{});
   /* mock sign-in with a name, then the landing (no gladiator yet); wait for the main-menu show behind it to end */
   await pg.fill('#onl input','Perfus').catch(()=>{});await pg.click('#onl button:has-text("Enter")').catch(()=>{});
   const ok=await pg.waitForFunction(()=>!!document.querySelector('#onl #onlStageMap81, #onl .omap-in, #onl [data-onlnav]'),null,{timeout:30000}).then(()=>true).catch(()=>false);
   await pg.waitForFunction(()=>!MM.raf,null,{timeout:60000}).catch(()=>{});await pg.waitForTimeout(1000);all.push(await measure(b,pg,cdp,'online-landing',{ok}));await pg.close()}
 if(WANT.includes('studio')){const {pg,cdp}=await fresh(b);await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<30&&CUR_MODAL;i++){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}menuHide();openStudio('chars');await W8(3000)});
   all.push(await measure(b,pg,cdp,'studio-chars'));await pg.close()}
 }catch(e){console.log('ERR',e.message)}
 await b.close();const f=path.join(__dirname,'scenes'+(process.env.TAG||'')+'.json');fs.writeFileSync(f,JSON.stringify(all,null,1));console.log('wrote',f)})();
