/* v0.88 THE PHONE PASS (160-v88phone) at 390x844 portrait AND 844x390 landscape (isMobile, touch, DPR 2), through the MOCK online server:
   main menu, Play Now setup, Settings (General + Audio), a live match (no window under the match drawers: the market window covers the
   screen with its info panel right under the board), the class card pop-up fits the screen, Manager (Your ludus, Recruiting, Training
   Yard, Infirmary, Match Week, Roster, the Lanista perks), Creator Studio (one-row rail, the class designer), Online (landing, Domus with
   its slot row scrolling sideways, Armory & Market, a room). Every screen: no sideways page scroll (documentElement and the window body),
   key buttons visible and >= 36 px. Also the Light board engages on a 390-px DPR-3 phone and draw() does no layout read on phones.
   SHOT=<dir> saves p88_<p|l>_<screen>.png. */
const http=require('http'),fs=require('fs'),path=require('path');const SHOT=process.env.SHOT||'';
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
const errs=[];const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
const run=async(mode)=>{const vp=mode==='p'?{width:390,height:844}:{width:844,height:390};
  const ctx=await b.newContext({viewport:vp,screen:vp,isMobile:true,hasTouch:true,deviceScaleFactor:2});await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0')});
  const P=await ctx.newPage();P.on('pageerror',e=>errs.push(mode+':'+e.message+' '+(e.stack||'').split('\n')[1]));
  await P.goto(URL0,{timeout:90000});await P.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|report|over|match|tester)/.test(k))localStorage.removeItem(k)});await P.reload({timeout:90000});await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  const W=ms=>P.waitForTimeout(ms);const shot=async n=>{if(SHOT)await P.screenshot({path:path.join(SHOT,`p88_${mode}_${n}.png`)})};
  /* the page and the window body never scroll sideways; the named buttons are on screen-able and >= 36 px */
  const check=async(name,sels=[])=>{const r=await P.evaluate(sels=>{const de=document.documentElement,mb=document.getElementById('mBody'),mo=document.getElementById('modal');
      const open=mo&&!mo.hidden;const btn=sels.map(s=>{const e=document.querySelector(s);if(!e)return [s,'missing'];const r=e.getBoundingClientRect();const st=getComputedStyle(e);
        return r.width>=36&&r.height>=36&&st.visibility!=='hidden'&&st.display!=='none'?null:[s,Math.round(r.width)+'x'+Math.round(r.height)]}).filter(Boolean);
      return {page:de.scrollWidth-innerWidth,body:open&&mb?mb.scrollWidth-mb.clientWidth:0,btn}},sels);
    ok(r.page<=1,`${mode} ${name}: no sideways page scroll (${r.page})`);ok(r.body<=1,`${mode} ${name}: the window body does not scroll sideways (${r.body})`);
    ok(!r.btn.length,`${mode} ${name}: key buttons visible and >= 36 px ${JSON.stringify(r.btn)}`);await shot(name)};
  const close=async()=>{await P.evaluate(async()=>{document.querySelectorAll('#nc82pop,.pk88').forEach(e=>e.remove());for(let i=0;i<6;i++){if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:'close');await new Promise(r=>setTimeout(r,150))}});await W(300)};
  /* 1 · main menu */
  await check('menu',['#mainMenu [data-mm="annals"]','#mainMenu [data-mm="rules"]','#mainMenu [data-mm="settings"]','#mainMenu [data-mm="saves"]']);
  /* 2 · Play Now setup */
  await P.evaluate(()=>{menuHide();MM.fromMenu=true;openSetup(true)});await W(2500);await check('playnow',['#mClose']);
  ok(await P.evaluate(()=>{const s=document.querySelector('.pn-start');if(!s)return true;const r=s.getBoundingClientRect(),m=document.getElementById('mBody').getBoundingClientRect();return r.left>=m.left-1&&r.right<=m.right+1}),mode+' playnow: the start bar stays inside the window');await close();
  /* 3 · Settings */
  await P.evaluate(()=>openSettings('general'));await W(800);await check('settings',['#mClose','#mBody [data-stab="audio"]','#mBody [data-anim88="quick"]']);
  ok(await P.evaluate(()=>{const c=document.querySelector('#mBody input[type=checkbox]');return !c||c.getBoundingClientRect().width>=20}),mode+' settings: checkboxes 20 px');
  await P.evaluate(()=>{const b=document.querySelector('#mBody [data-stab="audio"]');if(b)b.click()});await W(600);await check('audio',['#mClose']);await close();
  /* 4 · a live match + the market window */
  await P.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);try{menuHide()}catch(e){}
    startEvent({ev:'democritus',loc:6,seats:[{cls:'hero',cpu:false},{cls:'soldier',cpu:true},{cls:'slave',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}});
    for(let i=0;i<40;i++){if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await new Promise(r=>setTimeout(r,100))}SPEED='pause'});await W(900);
  const live=await P.evaluate(()=>document.body.className);ok(mode==='p'?/phoneP2/.test(live):/phoneL/.test(live),mode+' match: the phone layout is on '+live);
  await check('match',mode==='p'?['#ppTabs [data-pp="act"]','#ppTabs [data-pp="side"]','#ppTabs [data-pp="log"]']:['#plDock button']);
  await P.evaluate(()=>{const p=S.players[0];p.coin=40;window._mk=marketBuy75(p,1)});
  let mk=null;for(let i=0;i<40&&!(mk&&mk.lit);i++){await W(250);mk=await P.evaluate(()=>{const m=document.querySelector('#mBody .mk88');if(!m)return null;const lit=m.querySelector('.mboard75 .lit');if(lit)lit.dispatchEvent(new PointerEvent('pointerover',{bubbles:true}));return {lit:!!lit}})}
  await W(300);
  const mw=await P.evaluate(()=>{const R=s=>{const e=document.querySelector(s);return e?e.getBoundingClientRect():null};const mo=R('#modal .mbox'),bd=R('#mBody .mboard75'),inf=R('#mBody .mk88inf');
    const hid=s=>{const e=document.querySelector(s);return !e||getComputedStyle(e).display==='none'};
    return {full:!!mo&&mo.width>=innerWidth-1&&mo.height>=innerHeight-1,board:!!bd&&bd.right<=innerWidth+1&&bd.left>=-1&&bd.width>Math.min(innerWidth,innerHeight)*0.6,inf:!!inf&&!!bd&&(innerWidth>innerHeight?inf.left>=bd.right-2&&inf.top<innerHeight:inf.top>=bd.bottom-2&&inf.top<innerHeight)&&inf.height>20,
      bd:bd?[bd.left,bd.top,bd.width,bd.height].map(Math.round):null,drawers:hid('#ppTabs')&&hid('#actions')&&hid('aside.side')&&hid('.logbar')&&hid('header.bar')}});
  ok(mw.full,mode+' market: the window fills the screen '+JSON.stringify(mw));ok(mw.board,mode+' market: the board fits the width '+JSON.stringify(mw));
  ok(mw.inf,mode+' market: the info panel sits under the board (portrait) / beside it (landscape) '+JSON.stringify(mw));ok(mw.drawers,mode+' market: no match drawer over the window '+JSON.stringify(mw));
  await check('market',['#mPeek']);
  await P.evaluate(()=>{const b=[...document.querySelectorAll('#mBody .mboard75 .lit')][0];if(b)b.click()});await W(300);await P.evaluate(()=>{const b=document.querySelector('#mBody .mboard75 .lit');if(b)b.click()});await W(400);await close();
  /* the class card pop-up (both sides) fits the screen after a tap */
  await P.evaluate(()=>{const s=document.createElement('span');s.id='tv88pk';s.dataset.card='k:hero';s.textContent='Hero';s.style.cssText='position:fixed;left:20px;top:60px;z-index:99;padding:12px;background:#000;color:#fff';document.body.appendChild(s)});
  await P.tap('#tv88pk');await W(700);
  const tip=await P.evaluate(()=>{const t=document.getElementById('tip');const r=t.getBoundingClientRect();return {shown:!t.hidden,pair:!!t.querySelector('.cb87pair'),l:Math.round(r.left),r:Math.round(r.right),b:Math.round(r.bottom),iw:innerWidth,ih:innerHeight}});
  ok(tip.shown&&!tip.pair&&tip.l>=0&&tip.r<=tip.iw&&tip.b<=tip.ih,mode+' the printed class card pop-up (his card only, v0.91) fits inside the screen '+JSON.stringify(tip));await shot('classcard');
  await P.evaluate(()=>{document.getElementById('tv88pk').remove();document.getElementById('tip').hidden=true});
  /* draw() reads no layout on a phone */
  const reads=await P.evaluate(()=>{let n=0;const d=Object.getOwnPropertyDescriptor(Element.prototype,'clientWidth');Object.defineProperty(Element.prototype,'clientWidth',{configurable:true,get(){n++;return d.get.call(this)}});
    const g=Element.prototype.getBoundingClientRect;Element.prototype.getBoundingClientRect=function(){n++;return g.apply(this,arguments)};for(let i=0;i<5;i++)draw();Object.defineProperty(Element.prototype,'clientWidth',d);Element.prototype.getBoundingClientRect=g;return n});
  ok(reads===0,mode+' draw() does no layout read on a phone ('+reads+')');
  await P.evaluate(()=>{S.over=true});
  /* 5 · Manager */
  await P.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();MM.fromMenu=true;openManager();await W8(1000);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;me().coin=2000;MGR_REDRAW();await W8(600)});
  for(const [n,t,sels] of [['ludus','ludus',['#mBody .endwk']],['recruit','recruit',['#mBody .r85st']],['yard','practice',[]],['infirm','infirm',[]],['night','night',[]],['roster','roster',['#mBody .st95act .btn, #mBody .rm100st .st95sa .btn']],['perks','me',[]]]){
    await P.evaluate(t=>{MGR.tab=t;MGR_REDRAW()},t);await W(700);await check('mgr_'+n,['#mClose',...sels])}
  ok(await P.evaluate(()=>{MGR.tab='ludus';MGR_REDRAW();return !!document.querySelector('#mBody #council83')}),mode+' Your ludus shows the council card');
  const mr=await P.evaluate(()=>{const r=document.querySelector('#mBody .railwrap>.tabrow');if(!r)return null;const b=r.getBoundingClientRect();return {h:Math.round(b.height),bottom:Math.round(b.bottom),ih:innerHeight,heads:[...r.querySelectorAll('.railhd')].filter(h=>getComputedStyle(h).display!=='none').length}});
  ok(mr&&mr.h<=70&&mr.heads===0&&mr.bottom>=mr.ih-80,mode+' Manager: the rail is one bottom swipe row '+JSON.stringify(mr));
  await P.evaluate(()=>{const c=document.querySelector('#mBody #council83');if(c)c.scrollIntoView()});await W(300);await check('mgr_council',[]);
  await close();
  /* 6 · Creator Studio: the rail is one row of tabs (no group heads), the class designer fits */
  await P.evaluate(()=>{menuHide();openStudio('classes')});await W(1500);
  const rail=await P.evaluate(()=>{const r=document.querySelector('#studio .sttabs.rail');if(!r)return null;const hd=[...r.querySelectorAll('.railhd')].filter(h=>getComputedStyle(h).display!=='none').length;
    const bs=[...r.querySelectorAll('button[data-st="tab"]')];const tops=new Set(bs.map(x=>Math.round(x.getBoundingClientRect().top)));return {h:Math.round(r.getBoundingClientRect().height),hd,rows:tops.size,scroll:r.scrollWidth>r.clientWidth}});
  ok(rail&&rail.hd===0&&rail.rows===1&&rail.h<=60&&rail.scroll,mode+' studio: one swipe row of tabs '+JSON.stringify(rail));
  await check('studio',['#mClose','#studio [data-st="tab"][data-v="classes"]']);await close();
  /* 7 · Online (mock): landing, Domus, Armory & Market, a room */
  await P.evaluate(async()=>{ONLC.SLOT100.start=4;if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name:'Vettius'});ONL.domus=(await NET.req('domus.create',{name:'Vettii'})).domus;
    const a=await NET.req('char.create',{name:'Alpha',cls:'hero'});await NET.req('char.create',{name:'Beta',cls:'soldier'});await NET.req('char.active',{char:a.id});ONL.char=a});
  const onl=async(tab,n,sels)=>{await P.evaluate(t=>{onlineOpen(t)},tab);await P.waitForSelector('#onl .onl-rail',{timeout:15000}).catch(()=>{});await W(1800);
    const rl=await P.evaluate(()=>{const r=document.querySelector('#onl .onl-rail');return r?Math.round(r.getBoundingClientRect().height):0});ok(rl>0&&rl<=64,`${mode} online ${n}: the rail is one slim row (${rl} px)`);
    await check('onl_'+n,['#mClose','#onl .onl-rail [data-onl="tab"][data-v="play"]',...sels])};
  await onl('play','landing',[]);await close();
  await onl('char','domus',['#onl .gc89-row .gc89']);
  const sl=await P.evaluate(()=>{const row=document.querySelector('#onl .gc89-row');if(!row)return null;const cs=[...row.querySelectorAll('.gc89')];const st=getComputedStyle(row).overflowX;
    return {n:cs.length,ox:st,scroll:row.scrollWidth>row.clientWidth+1,fits:cs.every(c=>c.getBoundingClientRect().right<=row.getBoundingClientRect().right+1)}});
  ok(sl&&sl.n===4&&(mode==='p'?/auto|scroll/.test(sl.ox)&&sl.scroll:(sl.scroll||sl.fits)),mode+' Domus: the four slots scroll sideways '+JSON.stringify(sl));
  if(sl&&sl.scroll){const moved=await P.evaluate(()=>{const row=document.querySelector('#onl .gc89-row');row.scrollLeft=200;return row.scrollLeft>0});ok(moved,mode+' Domus: the slot row really scrolls')}
  await P.evaluate(()=>{const e=document.querySelector('#onl .sc89');if(e)e.scrollIntoView()});await W(200);await shot('onl_domus_stage');await close();
  await onl('armory','armory',[]);await close();
  await onl('lobby','lobby',['#onl [data-onl="mkroom"][data-v="0"]']);
  await P.evaluate(()=>{const b=document.querySelector('#onl [data-onl="mkroom"][data-v="0"]');if(b)b.click()});await W(2500);await check('onl_room',['#mClose']);await close();
  await ctx.close()};
await run('p');await run('l');
/* the Light board on a sharp 390-px phone (DPR 3), Auto */
{const vp={width:390,height:844};const ctx=await b.newContext({viewport:vp,screen:vp,isMobile:true,hasTouch:true,deviceScaleFactor:3});await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});const P=await ctx.newPage();P.on('pageerror',e=>errs.push('lite:'+e.message));
  await P.goto(URL0,{timeout:90000});await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  const L=await P.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);try{menuHide()}catch(e){}SETTINGS.lite84='auto';
    startEvent({ev:'democritus',loc:6,seats:[{cls:'hero',cpu:false},{cls:'soldier',cpu:true},{cls:'slave',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}});
    for(let i=0;i<30;i++){if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await new Promise(r=>setTimeout(r,100))}SPEED='pause';return {lite:lite84On(),dpr:devicePixelRatio}});
  ok(L.lite&&L.dpr===3,'the Light board engages on a 390-px DPR-3 phone '+JSON.stringify(L));await ctx.close()}
/* desktop keeps its look: windows are not full-screen, no lite board at DPR 1 */
{const ctx=await b.newContext({viewport:{width:1400,height:900}});await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});const P=await ctx.newPage();P.on('pageerror',e=>errs.push('desk:'+e.message));
  await P.goto(URL0,{timeout:90000});await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  const D=await P.evaluate(async()=>{ /* v0.98: Settings is full screen by design — check an ordinary window */modal('Test','<label><input type="checkbox"> tick</label>',[{label:'Close',value:1}],{wide:1});await new Promise(r=>setTimeout(r,600));const r=document.querySelector('#modal .mbox').getBoundingClientRect();const c=document.querySelector('#mBody input[type=checkbox]');
    return {w:Math.round(r.width),cb:c?Math.round(c.getBoundingClientRect().width):0,lite:lite84On()}});
  ok(D.w<1400&&D.cb<20&&!D.lite,'desktop unchanged '+JSON.stringify(D));await ctx.close()}
console.log(miss.length?'MISSING '+JSON.stringify(miss):'ALL OK');console.log('ERRS',JSON.stringify(errs));
await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});
