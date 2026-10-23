/* v1.11c SETTINGS THAT STICK (422-v111set; owner report: Safari, "I have to retoggle all my settings each time"). Checks, on the Chromium
   path AND the WebKit path (flavius_v107safariforce=1):
   (1) every board / visual setting set through the real Settings window → reload → the panel shows the choice AND the game applies it
       (Q110, 399 l106Pref/l106Mode, ANIM88, XRAY, reduceMotion, THEME.spike, SETTINGS keys), at the menu, in a match and still after 10 s
       (Auto's runtime on: flavius_v110autorun=1); a second set (Quality Low + Lighting By quality) the same;
   (2) P1 a refused localStorage write (quota) → a cookie copy + one toast; the reload takes the choice from the cookie;
   (3) P2 two tabs: a choice made in tab B is adopted by tab A, and A's next save keeps it;
   (4) P3 Auto at rung 1 (High + Lighting Light): the Quality text says "Lighting: Light", "By quality: Light." beside Lighting; an
       explicit Lighting hides the note;
   (5) P4 WebKit path: one re-bake after the match's first load (Chromium path: none);
   (6) kill switch flavius_v111setoff=1: none of it.
   node tools/tests/tv111set.js <ABSOLUTE page path> → ERRS [] and exit 0. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n);console.log((c?'ok   ':'FAIL ')+n.slice(0,600))};
/* a context whose localStorage is seeded ONCE (the reloads keep what the page wrote); quota:true = setItem('flavius_settings') throws */
const ctx=async(ls,quota)=>{const c=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});await c.route(/fonts\./,r=>r.abort());
  await c.addInitScript(([o,q])=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});
    if(!localStorage.getItem('flavius_t111seed')){localStorage.setItem('flavius_t111seed','1');localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');for(const k in o)localStorage.setItem(k,o[k])}
    if(q){const f=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='flavius_settings')throw new DOMException('full','QuotaExceededError');return f.apply(this,arguments)}}},[ls||{},!!quota]);return c};
const ready=async pg=>{await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
  await pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,200))}})};
const newPage=async c=>{const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await pg.goto(URL0);await ready(pg);return pg};
/* set through the real Settings window: [page, selector] clicks */
const setUI=(pg,cl)=>pg.evaluate(async cl=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));openSettings();await W8(250);const miss=[];
  for(const [p,sel] of cl){const t=document.querySelector(`[data-stab="${p}"]`);if(t)t.click();await W8(120);const e=document.querySelector('#s98 '+sel);if(!e){miss.push(sel);continue}e.click();await W8(120)}
  try{CUR_MODAL&&CUR_MODAL.done(null)}catch(e){}await W8(100);return miss},cl);
/* what the panel shows: the pressed button of each group, every switch */
const PANEL=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};openSettings();await W8(250);
  for(const p of ['general','help','pieces','themes','access']){const t=document.querySelector(`[data-stab="${p}"]`);if(t)t.click();await W8(120);
    document.querySelectorAll('#s98 button.on').forEach(e=>{for(const k of Object.keys(e.dataset))if(!/^(en84|tip|stab|sspeed)$/.test(k))o[k]=e.dataset[k]});
    document.querySelectorAll('#s98 input[type=checkbox][data-set]').forEach(e=>o['cb.'+e.dataset.set]=e.checked);
    if(p==='pieces'){const n=document.getElementById('l111now'),d=document.getElementById('q110d');o.note=n&&!n.hidden?n.textContent:'';o.qd=d?d.textContent:''}}
  try{CUR_MODAL&&CUR_MODAL.done(null)}catch(e){}await W8(80);return o});
const APPLIED=pg=>pg.evaluate(()=>({mode:Q110.mode,n:Q110.n,pref:l106Pref(),lmode:S?l106Mode():null,anim:ANIM88(),xray:XRAY,calm:!!reduceMotion(),spike:THEME.spike,
  tscale:+SETTINGS.tscale||100,face:SETTINGS.face99||'full',hit:SETTINGS.hit100||'full',fx:SETTINGS.fx,shake:SETTINGS.shake,gore:SETTINGS.gore,flavius:SETTINGS.flavius,
  thoughts:THOUGHTS,cam:SETTINGS.cam88,bases:SETTINGS.bases101,famous:SETTINGS.famous,reveals:SETTINGS.reveals}));
const start=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.briefing=false;try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}
  startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  for(let i=0;i<20;i++){if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(100)}SPEED='pause';return !!S});
const same=(a,b,keys)=>keys.filter(k=>JSON.stringify(a[k])!==JSON.stringify(b[k])).map(k=>k+':'+JSON.stringify(a[k])+'≠'+JSON.stringify(b[k]));
/* scenario A: everything off its default */
const CL_A=[['pieces','[data-q110=medium]'],['pieces','[data-light106=full]'],['general','[data-anim88=quick]'],['help','[data-sxray=off]'],['pieces','[data-face99=light]'],
  ['pieces','[data-hit100=quiet]'],['pieces','[data-spike98=bronze]'],['access','[data-ts98="115"]'],['help','[data-set=fx]'],['help','[data-set=shake]'],['help','[data-set=gore]'],
  ['help','[data-set=flavius]'],['help','[data-set=thoughts]'],['general','[data-set=cam88]'],['pieces','[data-set=bases101]'],['general','[data-set=famous]'],['access','[data-set=calm]'],['help','[data-set=reveals]']];
const WANT_A={mode:'medium',n:'medium',pref:'full',anim:'quick',xray:'off',calm:true,spike:'#9a6a32',tscale:115,face:'light',hit:'quiet',fx:false,shake:false,gore:false,flavius:false,thoughts:false,cam:false,bases:false,famous:false,reveals:false};
const CL_B=[['pieces','[data-q110=low]'],['pieces','[data-light106=q]']];
const WANT_B={mode:'low',n:'low',pref:'off'};
try{
  for(const [path,ls] of [['chromium',{}],['webkit',{flavius_v107safariforce:'1'}]]){
    for(const [sc,CL,WANT,lm] of [['A',CL_A,WANT_A,'full'],['B',CL_B,WANT_B,'off']]){
      const c=await ctx({...ls,flavius_v110autorun:'1'});const pg=await newPage(c);
      const m=await setUI(pg,CL);ok(!m.length,`${path} ${sc}: every control found ${JSON.stringify(m)}`);
      const P0=await PANEL(pg),A0=await APPLIED(pg);
      ok(!same(A0,WANT,Object.keys(WANT)).length,`${path} ${sc}: applied as chosen before the reload ${same(A0,WANT,Object.keys(WANT))}`);
      await pg.reload();await ready(pg);
      const P1=await PANEL(pg),A1=await APPLIED(pg);const pk=Object.keys(P0).filter(k=>k!=='qd'&&k!=='cb.briefing');   /* start() turns the briefing off itself */
      ok(!same(P1,P0,pk).length,`${path} ${sc}: the panel after the reload = the choice ${same(P1,P0,pk)}`);
      ok(!same(A1,WANT,Object.keys(WANT)).length,`${path} ${sc}: applied after the reload ${same(A1,WANT,Object.keys(WANT))}`);
      await start(pg);await pg.waitForTimeout(1500);const A2=await APPLIED(pg);
      ok(!same(A2,WANT,Object.keys(WANT)).length&&A2.lmode===lm,`${path} ${sc}: applied in a match (lighting ${A2.lmode}) ${same(A2,WANT,Object.keys(WANT))}`);
      await pg.evaluate(()=>{SPEED='normal';const t=Date.now();return new Promise(r=>{const f=()=>{try{draw()}catch(e){}if(Date.now()-t<10000)setTimeout(f,120);else r()};f()})});
      const A3=await APPLIED(pg),P3=await PANEL(pg);
      ok(!same(A3,WANT,Object.keys(WANT)).length&&A3.lmode===lm&&!same(P3,P0,pk).length,`${path} ${sc}: still after 10 s (panel + applied) ${same(A3,WANT,Object.keys(WANT))} ${same(P3,P0,pk)}`);
      if(sc==='A'){const rb=await pg.evaluate(()=>V111SET.st.rebake);ok(path==='webkit'?rb===1:rb===0,`${path}: P4 re-bake after load = ${rb}`)}
      await c.close()}}

  /* (2) P1 a refused write */
  {const c=await ctx({},true);const pg=await newPage(c);await setUI(pg,[['pieces','[data-q110=high]'],['pieces','[data-light106=off]']]);
    const s=await pg.evaluate(()=>({fail:V111SET.st.fail,ck:document.cookie.indexOf('flavius_set111=')>=0,toast:V111SET.toasted}));
    ok(s.fail>0&&s.ck&&s.toast,'P1 a refused write → cookie copy + toast '+JSON.stringify(s));
    await pg.reload();await ready(pg);const A=await APPLIED(pg),P=await PANEL(pg);
    ok(A.mode==='high'&&A.pref==='off'&&P.q110==='high'&&P.light106==='off','P1 the reload takes the choice from the cookie '+JSON.stringify({mode:A.mode,pref:A.pref,q:P.q110,l:P.light106}));
    await c.close()}

  /* (3) P2 two tabs */
  {const c=await ctx({});const A=await newPage(c),B=await newPage(c);
    await setUI(B,[['pieces','[data-q110=low]']]);
    const got=await A.waitForFunction(()=>SETTINGS.quality110==='low'&&Q110.mode==='low',null,{timeout:5000}).then(()=>true,()=>false);
    ok(got,'P2 tab A adopts tab B\'s Quality');
    await setUI(A,[['general','[data-anim88=off]']]);
    const ls=await A.evaluate(()=>JSON.parse(localStorage.getItem('flavius_settings')));
    ok(ls.quality110==='low'&&ls.anim88==='off','P2 A\'s next save keeps B\'s choice '+JSON.stringify({q:ls.quality110,a:ls.anim88}));
    await c.close()}

  /* (4) P3 the panel at Auto's rung 1 */
  {const c=await ctx({});const pg=await newPage(c);
    await pg.evaluate(()=>{Q110.pend={to:1,why:'test',t:performance.now()};Q110.commit()});
    const P=await PANEL(pg),A=await APPLIED(pg);
    ok(P.q110==='auto'&&P.light106==='q'&&/Lighting: Light/.test(P.qd)&&P.note==='By quality: Light.'&&A.pref==='light','P3 Auto rung 1: the panel names Lighting Light '+JSON.stringify({qd:P.qd,note:P.note,pref:A.pref}));
    await setUI(pg,[['pieces','[data-light106=off]']]);const P2=await PANEL(pg);
    ok(P2.light106==='off'&&!P2.note&&!/Lighting:/.test(P2.qd),'P3 an explicit Lighting: no note '+JSON.stringify({qd:P2.qd,note:P2.note}));
    await c.close()}

  /* (6) kill switch */
  {const c=await ctx({flavius_v111setoff:'1',flavius_v107safariforce:'1'});const pg=await newPage(c);const P=await PANEL(pg);await start(pg);await pg.waitForTimeout(3000);
    const k=await pg.evaluate(()=>({off:V111SET.off,rb:V111SET.st.rebake,saves:V111SET.st.saves}));
    ok(k.off&&!k.rb&&!k.saves&&P.note===''&&!('l111now' in P&&P.l111now),'kill switch: nothing '+JSON.stringify(k));
    await c.close()}
}catch(e){errs.push('EXC '+e.message+' '+(e.stack||'').split('\n')[1])}
await b.close();srv.close();console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));process.exit(errs.length||miss.length?1:0)})();
