/* v0.88 the online DOMUS REDESIGN (156-v88domus) through the MOCK: the stage (the active gladiator's avatar wearing his armor, two
   weapon slots as horizontal cards, purse + record), the 4 slot cards (switch the active one; an empty one opens the creator as a popup),
   the tabs Storeroom · Offerings · Trophies, purse vs treasury, no buy buttons anywhere in the Domus, and IMMORTALIS (Invictus + 25 Ranked
   bouts survived → .imm88 gold laurel frame on the slot card, the stage and the profile line + the chip). Also at 390x844.
   SHOT=<dir> saves d88_*.png at 1400x900 and 390x844. */
const http=require('http'),fs=require('fs'),path=require('path');const SHOT=process.env.SHOT||'';
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1400,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0')});
const errs=[];const P=await ctx.newPage();P.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await P.goto(URL0);
await P.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|report|over|match|tester)/.test(k))localStorage.removeItem(k)});await P.reload();await P.waitForTimeout(2500);
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const W=ms=>P.waitForTimeout(ms);
const shot=async n=>{if(!SHOT)return;await P.screenshot({path:path.join(SHOT,`d88_${n}.png`)})};
const world=(fn,arg)=>P.evaluate(([fn,arg])=>{const w=mockLoad();const r=(0,eval)('('+fn+')')(w,arg);mockSave(w);return r},[fn.toString(),arg]);
const open=async()=>{await P.evaluate(async()=>{if(!document.getElementById('onl')){onlineOpen('char');await new Promise(r=>setTimeout(r,900))}ONL.tab='char';ONL.newGlad=false;ONL82.dgAt=0;await onlRefresh();await NET.req('domus.get',{});onlRedraw()});await W(500)};

/* a house, two gladiators: Alpha (hero, a helm + a bought gladius, ticked to bring), Beta */
const ids=await P.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name:'Vettius'});ONL.domus=(await NET.req('domus.create',{name:'Vettii'})).domus;
  const a=await NET.req('char.create',{name:'Alpha',cls:'hero'});const b2=await NET.req('char.create',{name:'Beta',cls:'soldier'});return {a:a.id,b:b2.id,dom:ONL.domus.id}});
await world((w,[a,dom])=>{const ch=w.chars[a];ch.wallet=77;ch.gear=['galea','gladius'];delete ch.equip;w.domus82[dom].treasury=210;
  w.domus82[dom].trophies=[{k:'first:democritus',n:ONLC.trophyName('first:democritus'),at:Date.now(),glad:ch.name,x:1}]},[ids.a,ids.dom]);
await P.evaluate(async id=>{await NET.req('char.active',{char:id})},ids.a);
await open();
const st=await P.evaluate(()=>{const o=document.getElementById('onl');const q=s=>o.querySelector(s);
  return {stage:!!q('.st88'),av:!!q('.st88 .av88 svg'),worn:q('.st88 .av88')?q('.st88 .av88').innerHTML.length:0,wslots:o.querySelectorAll('.st88 .wp88').length,wcards:o.querySelectorAll('.st88 .wp88 [data-card^="w:"],.st88 .wp88 .cardimg,.st88 .wp88 img').length,
    name:(q('.st88 .st88-n')||{}).textContent||'',purse:(q('.st88 .mon88.purse')||{}).textContent||'',tre:(q('.mon88.tre')||{}).textContent||'',rec:(q('.st88 .st88-rec')||{}).textContent||'',
    slots:o.querySelectorAll('.sl88 .onl-gslot').length,empty:o.querySelectorAll('.sl88 .onl-gslot.empty').length,act:(q('.sl88 .onl-gslot.act b')||{}).textContent||'',
    tabs:[...o.querySelectorAll('.tb88 [data-tb88]')].map(b=>b.dataset.tb88).join(','),store:!!q('.tp88[data-tp88="store"] #sr82'),shelf:!!q('#sr82 #sh87'),offs:!!q('.tp88[data-tp88="offs"] .of83-box'),tro:!!q('.tp88[data-tp88="tro"] .tr83'),
    buy:o.querySelectorAll('.dom82-wrap [data-onl82="buy"],.dom82-wrap [data-onl83="dbuy"],.dom82-wrap [data-onl83="obuy"],.dom82-wrap [data-onl83="ubuy"],.dom82-wrap .buy83').length,
    imm:o.querySelectorAll('.imm88').length,rb:!!q('.rb82')}});
ok(st.stage&&st.av,'the stage with the avatar '+JSON.stringify(st));ok(st.wslots===2&&st.wcards>=1,'two weapon slots with a weapon card '+st.wslots+'/'+st.wcards);
ok(/Alpha/.test(st.name),'the active gladiator on the stage');ok(/Purse/.test(st.purse)&&/77/.test(st.purse),'the purse on the stage: '+st.purse);ok(/Treasury/.test(st.tre)&&/210/.test(st.tre),'the treasury labelled: '+st.tre);
ok(/Bouts/.test(st.rec)&&/Survived/.test(st.rec)&&/CF/.test(st.rec),'the record beside the stage');
ok(st.slots===4&&st.empty===2&&/Alpha/.test(st.act),'four slot cards, two empty, Alpha active '+JSON.stringify([st.slots,st.empty,st.act]));
ok(st.tabs==='store,offs,tro'&&st.store&&st.shelf&&st.offs&&st.tro,'tabs Storeroom · Offerings · Trophies with their panels '+st.tabs);
ok(st.buy===0,'no buying in the Domus ('+st.buy+')');ok(st.imm===0,'nobody is Immortalis yet');ok(st.rb,'the rank bar stays');
/* the helm on the avatar: the galea is drawn (worn) */
ok(await P.evaluate(()=>{const a=document.querySelector('.st88 .av88');return !!a&&/<image/.test(a.innerHTML)}),'the avatar wears the helm');
await shot('stage_1400');
/* tabs switch */
await P.click('.tb88 [data-tb88="tro"]');await W(200);
const tb=await P.evaluate(()=>({tro:!document.querySelector('.tp88[data-tp88="tro"]').hidden,store:document.querySelector('.tp88[data-tp88="store"]').hidden,on:(document.querySelector('.tb88 .on')||{}).dataset.tb88}));
ok(tb.tro&&tb.store&&tb.on==='tro','Trophies tab shows, Storeroom hides');
await P.evaluate(()=>onlRedraw());await W(200);ok(await P.evaluate(()=>!document.querySelector('.tp88[data-tp88="tro"]').hidden),'the chosen tab survives a redraw');
await P.click('.tb88 [data-tb88="offs"]');await W(200);ok(await P.evaluate(()=>!document.querySelector('.tp88[data-tp88="offs"]').hidden&&document.querySelector('.tp88[data-tp88="tro"]').hidden),'Offerings tab');
await P.click('.tb88 [data-tb88="store"]');await W(200);
/* switch the active gladiator from the slot cards */
await P.click(`.sl88 .onl-gslot[data-v="${ids.b}"]`);await P.waitForFunction(id=>ONL.char&&ONL.char.id===id&&/Beta/.test((document.querySelector('.st88 .st88-n')||{}).textContent||''),ids.b,{timeout:15000}).catch(()=>{});
ok(await P.evaluate(id=>ONL.char&&ONL.char.id===id&&/Beta/.test((document.querySelector('.st88 .st88-n')||{}).textContent||'')&&mockLoad().accounts[ONL.acct.id].active===id,ids.b),'a slot card makes its gladiator active');
/* an empty slot opens the creator as a popup over the Domus */
await P.click('.sl88 .onl-gslot.empty');await W(400);
const cr=await P.evaluate(()=>({pop:!!document.querySelector('#onl .cr88pop .onl-create'),dom:!!document.querySelector('#onl .dom82-wrap')}));ok(cr.pop&&cr.dom,'the creator opens as a popup over the Domus '+JSON.stringify(cr));
await shot('creator_1400');
await P.evaluate(()=>{const b=document.querySelector('#onl .cr88pop [data-onl="nonew"]');if(b)b.click();else{ONL.newGlad=false;onlRedraw()}});await W(300);ok(await P.evaluate(()=>!document.querySelector('#onl .cr88pop')),'the popup closes');
/* full house: no free slot → no creator */
await P.evaluate(async()=>{await NET.req('char.create',{name:'Gamma',cls:'slave'});await NET.req('char.create',{name:'Delta',cls:'amazonia'})});await open();
const full=await P.evaluate(()=>({empty:document.querySelectorAll('.sl88 .onl-gslot.empty').length,slots:document.querySelectorAll('.sl88 .onl-gslot').length}));ok(full.empty===0&&full.slots===4,'a full house: four slots, none empty');
await P.evaluate(()=>{ONL.newGlad=true;ONL.creating=null;onlRedraw()});await W(200);ok(await P.evaluate(()=>!document.querySelector('#onl .cr88pop .onl-create')),'no creator when every slot is taken');await P.evaluate(()=>{ONL.newGlad=false;onlRedraw()});
/* IMMORTALIS: Invictus + 25 Ranked bouts survived */
ok(await P.evaluate(()=>typeof onlImmortalis88==='function'&&!onlImmortalis88({rank:'invictus',rankK:'invictus',survived:24,alive:true,glory:6000})&&onlImmortalis88({rankK:'invictus',survived:25,alive:true,glory:6000})&&!onlImmortalis88({survived:40,alive:true,glory:100})),'onlImmortalis88 rules');
await world((w,a)=>{Object.assign(w.chars[a],{glory:6000,rank:'invictus',rankK:'invictus',survived:31,bouts:33,wins:12,lifeCF:2400})},ids.a);
await P.evaluate(async id=>{await NET.req('char.active',{char:id})},ids.a);await open();
const im=await P.evaluate(id=>({slot:!!document.querySelector(`.sl88 .onl-gslot.imm88[data-v="${id}"]`),stage:!!document.querySelector('.st88.imm88'),chip:!!document.querySelector('.st88 .imm88c'),others:document.querySelectorAll('.sl88 .onl-gslot.imm88').length,
  ring:getComputedStyle(document.querySelector('.st88.imm88')||document.body).borderTopColor}),ids.a);
ok(im.slot&&im.stage&&im.chip&&im.others===1,'Immortalis: the laurel on the slot card, the stage + the chip '+JSON.stringify(im));
await shot('immortalis_1400');
/* the profile line */
await P.evaluate(()=>onl83Profile(ONL.domus.id));await P.waitForSelector('.pf83pop',{timeout:10000}).catch(()=>{});await W(300);
ok(await P.evaluate(()=>document.querySelectorAll('.pf83pop .pf83-g.imm88').length===1&&!!document.querySelector('.pf83pop .imm88c')),'Immortalis on the profile line');
await P.evaluate(()=>{const p=document.querySelector('.pf83pop');if(p)p.remove()});
/* phones 390 x 844: stage, slots scroll sideways, tabs; no page-wide horizontal scroll */
await P.setViewportSize({width:390,height:844});await W(500);await P.evaluate(()=>onlRedraw());await W(300);
const ph=await P.evaluate(()=>{const r=s=>{const e=document.querySelector(s);return e?e.getBoundingClientRect():null};const st=r('.st88'),sl=r('.sl88'),tb=r('.tb88');const row=document.querySelector('.sl88');
  const mb=document.querySelector('#mBody');return {st:!!st&&st.width<=392,order:!!(st&&sl&&tb)&&st.top<sl.top&&sl.top<tb.top,scroll:!!row&&getComputedStyle(row).overflowX!=='visible',wide:mb?mb.scrollWidth-mb.clientWidth:0,av:r('.st88 .av88')?r('.st88 .av88').width:0}});
ok(ph.st&&ph.order&&ph.scroll&&ph.wide<=2&&ph.av>60,'phone: stage, then the slot row (scrolls sideways), then the tabs '+JSON.stringify(ph));
await P.evaluate(()=>{const e=document.querySelector('.st88');if(e)e.scrollIntoView()});await W(200);await shot('phone_390');await P.evaluate(()=>{const e=document.querySelector('.sl88');if(e)e.scrollIntoView()});await W(200);await shot('phone_390_slots');
console.log(miss.length?'MISSING '+JSON.stringify(miss):'ALL OK');console.log('ERRS',JSON.stringify(errs));
await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});
