/* v1.10 AUTO QUALITY + THE SAFARI FIXES (417-v110auto; tools/plans/v110/NOTES.md 1a–6a). Checks:
   (1) Settings → Board & pieces: the FIRST card is Quality (Auto / High / Medium / Low, Auto on by default), Lighting under it
       ("By quality" on, Full / Light / Off), 399's old Lighting card gone; desktop Auto = High (Lighting Full, board at the device ratio, 2× sheets);
   (2) the presets' levers: High / Medium / Low → l106Pref, devicePixelRatio, x108Want (2× sheets), the crowd (CHEER92.p, walkOK91, cheer92OK);
   (3) a manual Lighting choice overrides the preset's lighting; "By quality" clears it;
   (4) Auto with stubbed frame times: sustained slow frames → one rung down (only after a commit, at a quiet moment), no second step inside
       the gap; sustained headroom → back up; after a second drop the climb waits twice as long (hysteresis);
   (5) WebKit forced (flavius_v107safariforce=1): the board at 1.5×, 1× sheets at the start, 2× only after on-time frames;
   (6) a phone at DPR 3: Auto starts on Light, the board at 3× unzoomed and 2× zoomed;
   (7) kill switch flavius_v110autooff=1: v1.09c (no Quality card, 399's three Lighting buttons, no Q110 lever on the ratio);
   (8) settings migration: an explicit old Lighting choice stays the override; an old Full + 399's slow drop → Auto decides (starts ≥ rung 1);
   (9) 5a: l106Build gives a NEW layer canvas each build (flavius_l106freshoff=1 → reused); (10) the recorder report carries q110.
   node tools/tests/tv110a.js <ABSOLUTE page path> → ERRS [] and exit 0. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n);console.log((c?'ok   ':'FAIL ')+n.slice(0,400))};
const open=async(ls,view)=>{const c=await b.newContext(view||{viewport:{width:1440,height:900},deviceScaleFactor:2});await c.route(/fonts\./,r=>r.abort());const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');for(const k in o)localStorage.setItem(k,o[k])},ls||{});
  await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
  await pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}try{menuHide()}catch(e){}});return pg};
/* a quick match on Pompeii (pillars: 399's static layer has something to hold) */
const start=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.briefing=false;try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}
  startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  SPEED='pause';for(let i=0;i<20;i++){if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);draw();await W8(100)}return !!S});
/* the Quality card + levers read in the page */
const LEV=()=>({mode:Q110.mode,tier:Q110.tier,rung:Q110.n,light:l106Pref(),dpr:devicePixelRatio,x2:!!x108Want(),crowd:Q110.lv.crowd,
  p:CHEER92.p.reduce((s,v)=>s+v,0),walk:typeof walkOK91==='function'?walkOK91():null,cheer:typeof cheer92OK==='function'?cheer92OK():null,stand:STAND100.on});
const CARD=()=>{const t=document.createElement('div');t.innerHTML=settingsHTML('pieces');document.body.appendChild(t);window.__q=t;
  const st=t.querySelector('.s98-stack'),first=st&&st.firstElementChild;
  return {first:!!(first&&first.querySelector('[data-q110]')),q:[...t.querySelectorAll('[data-q110]')].map(x=>x.dataset.q110+(x.classList.contains('on')?'*':'')),
    l:[...t.querySelectorAll('[data-light106]')].map(x=>x.dataset.light106+(x.classList.contains('on')?'*':'')),cards:t.querySelectorAll('section.s98-card [data-light106]').length?[...new Set([...t.querySelectorAll('[data-light106]')].map(x=>x.closest('section')))].length:0}};
try{
  /* ---- 1 · Settings + defaults ---- */
  let pg=await open();
  const d1=await pg.evaluate(`(${CARD})()`);
  ok(d1.first&&d1.q.join()==='auto*,high,medium,low'&&d1.l.join()==='q*,full,light,off'&&d1.cards===1,'1a Quality is the first card, Auto on; Lighting under it (By quality on); one Lighting group '+JSON.stringify(d1));
  const l1=await pg.evaluate(`(${LEV})()`);
  ok(l1.mode==='auto'&&l1.tier==='high'&&l1.rung==='high'&&l1.light==='full'&&l1.dpr===2&&l1.x2===true&&l1.crowd==='full'&&l1.p>0&&l1.stand===true,'1b desktop Auto = High: Full, 2×, ratio 2, full crowd '+JSON.stringify(l1));
  /* ---- 2 · presets ---- */
  const d2=await pg.evaluate(`(()=>{const L=${LEV};const t=window.__q;const out={};for(const k of ['medium','low','high','auto']){t.querySelector('[data-q110="'+k+'"]').click();out[k]=L();out[k].on=[...t.querySelectorAll('[data-q110].on')].map(x=>x.dataset.q110).join();out[k].saved=JSON.parse(localStorage.getItem('flavius_settings')).quality110}return out})()`);
  ok(d2.medium.light==='light'&&d2.medium.dpr===1.5&&d2.medium.x2===false&&d2.medium.crowd==='react'&&d2.medium.p===0&&d2.medium.stand===false&&d2.medium.on==='medium'&&d2.medium.saved==='medium','2a Medium: Light, 1.5×, 1× sheets, the crowd reacts only '+JSON.stringify(d2.medium));
  ok(d2.low.light==='off'&&d2.low.dpr===1&&d2.low.x2===false&&d2.low.crowd==='still'&&d2.low.cheer===false&&d2.low.walk===false,'2b Low: Off, 1×, 1× sheets, a still crowd '+JSON.stringify(d2.low));
  ok(d2.high.light==='full'&&d2.high.dpr===2&&d2.high.x2===true&&d2.high.crowd==='full'&&d2.high.p===l1.p&&d2.high.stand===true,'2c High: Full, 2×, 2× sheets, the full crowd back '+JSON.stringify(d2.high));
  ok(d2.auto.mode==='auto'&&d2.auto.light==='full','2d back to Auto '+JSON.stringify(d2.auto));
  /* ---- 3 · manual Lighting overrides the preset ---- */
  const d3=await pg.evaluate(()=>{const t=window.__q;t.querySelector('[data-q110="medium"]').click();const a=l106Pref();t.querySelector('[data-light106="full"]').click();const b=l106Pref(),dpr=devicePixelRatio;
    t.querySelector('[data-light106="q"]').click();const c=l106Pref(),gone=!('light106' in SETTINGS);t.querySelector('[data-q110="auto"]').click();t.remove();return {a,b,dpr,c,gone}});
  ok(d3.a==='light'&&d3.b==='full'&&d3.dpr===1.5&&d3.c==='light'&&d3.gone,'3 Lighting Full overrides Medium (the ratio stays Medium); By quality clears it '+JSON.stringify(d3));
  /* ---- 4 · Auto steps on stubbed frame times ---- */
  await start(pg);
  const d4=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const K=Q110K;let t=1e7;const feed=(dt,ms,step)=>{const end=t+ms;for(;t<end;t+=step)Q110.feed(dt,t)};
    const o={};Q110.rung=0;Q110.refresh();Q110.lastStep=-1e9;Q110.quietUntil=0;Q110.bk=[];Q110.downs=[0,0,0];Q110.pend=null;
    feed(16.7,3000,50);o.fastPend=Q110.pend;
    feed(40,3000,50);o.slowPend=Q110.pend&&Q110.pend.to;o.before=Q110.n;
    for(let i=0;i<30&&Q110.pend;i++)await W8(150);   /* the poll commits on a quiet frame */
    o.after=Q110.n;o.light=l106Pref();
    feed(40,K.gap-K.settle-1000,50);o.inGap=Q110.pend;   /* inside the gap: no second step */
    t+=K.settle;feed(16.7,K.upWin+K.gap,100);o.upPend=Q110.pend&&Q110.pend.to;Q110.commit();o.up=Q110.n;
    t+=K.settle+K.gap;feed(40,3000,50);Q110.commit();o.down2=Q110.n;o.downs=Q110.downs.slice();
    t+=K.settle;feed(16.7,K.upWin+K.gap+2000,100);o.notYet=Q110.pend;
    feed(16.7,K.upWin+2000,100);o.later=Q110.pend&&Q110.pend.to;Q110.commit();o.up2=Q110.n;o.steps=Q110.steps.filter(s=>s.to).map(s=>s.from+'>'+s.to);return o});
  ok(d4.fastPend===null&&d4.slowPend===1&&d4.before==='high'&&d4.after==='high-light'&&d4.light==='light','4a sustained slow frames → one rung down (Light), committed on a quiet frame '+JSON.stringify(d4));
  ok(d4.inGap===null,'4b no second step inside the gap '+JSON.stringify(d4.inGap));
  ok(d4.upPend===0&&d4.up==='high','4c sustained headroom → back up '+JSON.stringify(d4));
  ok(d4.down2==='high-light'&&d4.downs[0]===2&&d4.notYet===null&&d4.later===0&&d4.up2==='high','4d hysteresis: after a second drop the climb waits twice as long '+JSON.stringify(d4));
  /* ---- 10 · the recorder report ---- */
  const d10=await pg.evaluate(()=>{const o=rec107Extra();return o.q110&&{mode:o.q110.mode,tier:o.q110.tier,steps:o.q110.steps.length,dpr:o.q110.dpr}});
  ok(d10&&d10.mode==='auto'&&d10.steps>=4&&d10.dpr.real===2,'10 the recorder report carries q110 '+JSON.stringify(d10));
  /* ---- 9 · a fresh layer canvas every build ---- */
  const d9=await pg.evaluate(()=>{L106.layer=null;draw();const a=L106.layer&&L106.layer.c;L106.layer.key='stale';draw();const c=L106.layer&&L106.layer.c;return {a:!!a,b:!!c,diff:a!==c,n:Q110.st.fresh}});
  ok(d9.a&&d9.b&&d9.diff&&d9.n>=2,'9a l106Build: a new canvas each build '+JSON.stringify(d9));
  await pg.context().close();
  pg=await open({flavius_l106freshoff:'1'});await start(pg);
  const d9b=await pg.evaluate(()=>{L106.layer=null;draw();const a=L106.layer&&L106.layer.c;L106.layer.key='stale';draw();const c=L106.layer&&L106.layer.c;return {a:!!a,same:a===c}});
  ok(d9b.a&&d9b.same,'9b flavius_l106freshoff=1: the layer canvas reused as before '+JSON.stringify(d9b));
  await pg.context().close();
  /* ---- 5 · WebKit forced ---- */
  pg=await open({flavius_v107safariforce:'1'});
  const d5=await pg.evaluate(()=>{const o={wk:Q110.webkit,dpr:devicePixelRatio,real:w1Real(),x2:!!x108Want(),why:X108.why,ok0:Q110.x2ok,rung:Q110.n};
    let t=2e7;Q110.lastStep=-1e9;Q110.quietUntil=0;Q110.bk=[];for(const e=t+Q110K.x2Win+2000;t<e;t+=100)Q110.feed(16.7,t);o.ok1=Q110.x2ok;o.x2b=!!x108Want();o.light=l106Pref();return o});
  ok(d5.wk&&d5.dpr===1.5&&d5.real===2&&d5.x2===false&&d5.ok0===false&&d5.rung==='high'&&d5.light==='full','5a WebKit: 1.5×, Full, 1× sheets at the start '+JSON.stringify(d5));
  ok(d5.ok1===true&&d5.x2b===true,'5b WebKit: 2× sheets after sustained on-time frames '+JSON.stringify(d5));
  await pg.context().close();
  /* ---- 6 · a phone at DPR 3 ---- */
  pg=await open({},{viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
  const d6=await pg.evaluate(()=>{const o={rung:Q110.n,light:l106Pref(),phone:Q110.phone};const z=AR91.z;AR91.z=1;o.unz=devicePixelRatio;AR91.z=2;o.zoom=devicePixelRatio;AR91.z=z;return o});
  ok(d6.phone&&d6.rung==='high-light'&&d6.light==='light'&&d6.unz===3&&d6.zoom===2,'6 phone DPR 3: Auto starts on Light; the board 3× unzoomed, 2× zoomed '+JSON.stringify(d6));
  await pg.context().close();
  /* ---- 7 · kill switch ---- */
  pg=await open({flavius_v110autooff:'1'});
  const d7=await pg.evaluate(`(()=>{const c=(${CARD})();window.__q.remove();return {c,off:Q110.off,dpr:devicePixelRatio,lv:Q110.lv,light:l106Pref()}})()`);
  ok(d7.off&&d7.c.q.length===0&&d7.c.l.join()==='full*,light,off'&&d7.dpr===2&&d7.lv===null&&d7.light==='full','7 kill switch: v1.09c Settings (Lighting only), no lever '+JSON.stringify(d7));
  await start(pg);
  const d7b=await pg.evaluate(()=>{L106.layer=null;draw();const a=L106.layer&&L106.layer.c;L106.layer.key='stale';draw();return {same:a===(L106.layer&&L106.layer.c)}});
  ok(d7b.same,'7b kill switch: no fresh layer '+JSON.stringify(d7b));
  await pg.context().close();
  /* ---- 8 · settings migration ---- */
  pg=await open({flavius_settings:JSON.stringify({light106:'off'})});
  const d8=await pg.evaluate(()=>({mode:Q110.mode,set:SETTINGS.light106,light:l106Pref(),v:SETTINGS.q110v}));
  ok(d8.mode==='auto'&&d8.set==='off'&&d8.light==='off'&&d8.v===1,'8a an explicit old Lighting choice stays the override under Auto '+JSON.stringify(d8));
  await pg.context().close();
  pg=await open({flavius_settings:JSON.stringify({light106:'full'}),flavius_light106drop:'1'});
  const d8b=await pg.evaluate(()=>({mode:Q110.mode,set:'light106' in SETTINGS,light:l106Pref(),rung:Q110.n,cap:Q110.cap}));
  ok(d8b.mode==='auto'&&!d8b.set&&d8b.light==='light'&&d8b.rung==='high-light','8b old Full + the slow drop → Auto decides, starting on Light '+JSON.stringify(d8b));
  await pg.context().close();
}catch(e){errs.push('EXC '+e.message)}
await b.close();srv.close();console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));process.exit(errs.length||miss.length?1:0)})();
