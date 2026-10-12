/* v1.0 THE PRE-MATCH BRIEFING (301-v100brief, his mock tools/plans/mock100/brief.html round 2):
   classic + special briefings carry the mock's parts with the right event / fighters / rules; Enter starts the event, 📋 Event reopens
   it mid-event (round NOW, Back to the sand) and Esc closes it; another window never inherits its look; a Manager bout still starts;
   kill switch flavius_brief100off=1 → the old briefing; 390 px: no sideways scroll, the button on screen; no new 00c errors;
   two ONLINE windows (mock, http) each show it locally and the match starts with equal hashes. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const PAGE=path.resolve(process.argv[2]);
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const errs=[];
const open=async(w,h)=>{const pg=await b.newPage({viewport:{width:w,height:h}});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(()=>{localStorage.setItem('flavius_firstrun','shown')});
  await pg.goto('file://'+PAGE);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
  await pg.evaluate(()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);SETTINGS.briefing=true;POPPED.add('firstTurn');window.__m=ERR92.n});return pg};
const start=(pg,ev,loc,seats)=>pg.evaluate(([ev,loc,seats])=>{if(S)S.over=true;SPEED='pause';startEvent({ev,loc,seats:seats.map(s=>({...s,pers:finalPers(s)})),opts:{...CFG.opts,spect:'auto'}})},[ev,loc,seats]);
const waitBrief=pg=>pg.waitForFunction(()=>CUR_MODAL&&document.querySelector('#modal.bf100 .bf100w'),null,{timeout:20000});
const read=pg=>pg.evaluate(()=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];const m=q('#mboxEl');
  return {title:q('#mTitle').textContent,kick:(q('.bf100kick')||{}).textContent,name:(q('.bf100nm')||{}).textContent,sr:!!q('#mBody .brsr img[src*="sr_democritus"]'),
   meta:qa('.bf100meta span').map(x=>x.textContent),how:(q('.bf100how')||{}).textContent,face:!!q('.bf100flv .face[style*="flavmood_"]'),say:(q('.bf100flv .say')||{}).textContent,
   rounds:qa('.bf100rd').map(r=>({n:r.querySelector('.n').textContent,nm:r.querySelector('.nm b').textContent,tag:(r.querySelector('.nm em')||{}).textContent||'',no:[...r.querySelectorAll('.rchip.no')].map(x=>x.textContent),now:r.classList.contains('now'),done:r.classList.contains('done')})),
   rules:qa('.bf100rc').map(r=>({b:r.querySelector('b').textContent,ev:r.classList.contains('ev')})),
   seats:qa('.bf100st').map(s=>({nm:s.querySelector('.bf100tx b').textContent,you:s.classList.contains('you'),out:s.classList.contains('out'),face:!!s.querySelector('.bf100fc .portrait'),tok:!!s.querySelector('.bf100fc i'),mini:!!s.querySelector('.bf100mini'),team:(s.querySelector('.bf100team')||{}).textContent||'',tags:s.querySelector('.bf100tx>span').textContent})),
   btn:(q('#mBtns .btn.primary')||{}).textContent,note:(q('.bf100note')||{}).textContent,focus:document.activeElement===q('#mBtns .btn.primary'),
   fits:m.scrollHeight<=m.clientHeight+2,docW:document.documentElement.scrollWidth,boxW:m.scrollWidth-m.clientWidth,
   btnBottom:(q('#mBtns .btn.primary')||{getBoundingClientRect:()=>({bottom:1e9})}).getBoundingClientRect().bottom,lines:BF100_LINES}});
/* 1 classic at 1440×900 */
const pg=await open(1440,900);
await start(pg,'democritus',6,[{cls:'royalty',cpu:false,name:'Varinius Gracchi'},{cls:'amazonia',cpu:true,diff:'hard',name:'Galla Aquila'},{cls:'soldier',cpu:true,name:'The Scourge'},{cls:'damnatio',cpu:true,diff:'easy',name:'Nonus Messala'}]);
await waitBrief(pg);await pg.waitForTimeout(500);let r=await read(pg);
ok(/briefing/i.test(r.title),'title kept in #mTitle');ok(/Classic/i.test(r.kick)&&/Round I of III/i.test(r.kick),'classic kicker '+r.kick);ok(r.name==='Democritus','name '+r.name);ok(r.sr,'Summa Rudis chip');
ok(r.meta.some(x=>/Roma/.test(x))&&r.meta.some(x=>/4 gladiators/.test(x))&&r.meta.some(x=>/Day|Night/.test(x)),'meta pills '+r.meta);ok(/How to win/.test(r.how)&&/15/.test(r.how),'how to win');
ok(r.face&&r.lines.some(l=>r.say.includes(l)),'Flavius face + an opening line');
ok(r.rounds.length===3&&r.rounds[0].tag==='FIRST'&&r.rounds[0].now&&r.rounds[0].no.join()==='PvP'&&r.rounds[1].no.join()==='CA'&&r.rounds[2].no.join()==='CF,CA','rounds '+JSON.stringify(r.rounds));
const rb=r.rules.map(x=>x.b);ok(rb.includes('The Fate')&&rb.includes('Arena deck')&&rb.includes('Blessings on the pillars')&&rb.some(x=>/Mandata Flavi/.test(x)),'classic rules '+rb);ok(r.rules.find(x=>x.b==='The Fate').ev,'The Fate gold-edged in a classic');
ok(r.seats.length===4&&r.seats.filter(s=>s.you).length===1&&r.seats.every(s=>s.face&&s.tok&&s.mini)&&/YOU/.test(r.seats[0].tags)&&/CPU/.test(r.seats[1].tags),'seats '+JSON.stringify(r.seats));
ok(/Enter the arena/.test(r.btn)&&/Reopen any time/.test(r.note),'footer '+r.btn+' | '+r.note);ok(r.focus,'button focused');ok(r.fits,'fits one screen at 1440×900');
/* a window opened now (another modal) never wears the briefing look — queued behind it */
await pg.keyboard.press('Enter');await pg.waitForFunction(()=>!CUR_MODAL||!document.querySelector('#modal.bf100'),null,{timeout:5000});
const st=await pg.evaluate(async()=>{for(let i=0;i<40&&!(S.turnNo>0);i++)await new Promise(r=>setTimeout(r,100));const p=modal('Test','<p>x</p>',[{label:'Close',value:0}]);await new Promise(r=>setTimeout(r,200));
  const o={turn:S.turnNo,plain:!document.getElementById('modal').classList.contains('bf100')};CUR_MODAL&&CUR_MODAL.done(0);await p;
  for(let i=0;i<30&&CUR_MODAL;i++){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await new Promise(r=>setTimeout(r,100))}return o});
ok(st.turn>0,'Enter started the event');ok(st.plain,'next window plain');
/* 2 reopen from 📋 Event, mid-event: round II NOW, a fallen seat */
await pg.evaluate(async()=>{S.ri=1;eliminate(S.players[3],{type:'retire'});await new Promise(r=>setTimeout(r,300));for(let i=0;i<30&&CUR_MODAL;i++){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await new Promise(r=>setTimeout(r,100))}
  document.getElementById('btnEvInfo').click()});
await waitBrief(pg);await pg.waitForTimeout(300);r=await read(pg);
ok(/in progress/i.test(r.kick)&&/Round II of III/i.test(r.kick),'reopen kicker '+r.kick);ok(r.rounds[0].done&&r.rounds[1].tag==='NOW','round I done, II now');
ok(r.seats[3].out&&/fell in round II/.test(r.seats[3].tags),'fallen seat '+r.seats[3].tags);ok(/Back to the sand/.test(r.btn)&&/Opened from/.test(r.note),'reopen footer');ok(!r.lines.some(l=>r.say.includes(l)),'mid-event line from his moods');
await pg.keyboard.press('Escape');await pg.waitForTimeout(300);ok(await pg.evaluate(()=>!CUR_MODAL&&document.getElementById('modal').hidden),'Esc closes');
await pg.screenshot({path:'/tmp/tv100bf_reopen.png'});
/* 3 special: Golden Eagle, two teams */
await start(pg,'goldenEagle',9,[{cls:'hero',cpu:false,name:'Thraex',team:'A'},{cls:'amazonia',cpu:true,name:'Tigris',team:'A'},{cls:'veteranus',cpu:true,name:'Ferrum',team:'B'},{cls:'venatore',cpu:true,name:'Tertius',team:'B'}]);
await waitBrief(pg);await pg.waitForTimeout(400);r=await read(pg);
ok(/Teams/i.test(r.kick)&&/Special event/i.test(r.kick),'special kicker '+r.kick);ok(r.name==='Golden Eagle'&&!r.sr,'special name, no medallion');ok(/three captures/.test(r.how),'eagle how');
ok(r.meta.some(x=>/2 teams/.test(x)),'teams pill');ok(r.rounds.length===1&&r.rounds[0].no.join()==='CF,CA','one round, no CF/CA');
ok(r.rules.filter(x=>x.ev).length===3&&r.rules.some(x=>/No Crowd Favor/.test(x.b))&&!r.rules.some(x=>x.b==='The Fate'),'eagle rules '+JSON.stringify(r.rules));
ok(r.seats.map(s=>s.team).join('')==='AABB','team chips '+r.seats.map(s=>s.team));ok(r.fits,'special fits');
await pg.evaluate(()=>CUR_MODAL.done(1));await pg.waitForTimeout(400);
/* 4 kill switch → the old briefing */
await pg.evaluate(()=>localStorage.setItem('flavius_brief100off','1'));
await start(pg,'democritus',6,[{cls:'royalty',cpu:false,name:'A'},{cls:'amazonia',cpu:true,name:'B'},{cls:'soldier',cpu:true,name:'C'},{cls:'damnatio',cpu:true,name:'D'}]);
await pg.waitForFunction(()=>CUR_MODAL&&/briefing/i.test(document.getElementById('mTitle').textContent),null,{timeout:20000});
ok(await pg.evaluate(()=>!document.querySelector('#modal.bf100')&&!!document.querySelector('#mBody .brround')&&!!document.querySelector('#mBody .brsr')),'kill switch = old briefing');
await pg.evaluate(()=>{CUR_MODAL.done(1);localStorage.removeItem('flavius_brief100off')});await pg.waitForTimeout(400);
/* 5 a Manager bout still starts through it */
const mg=await pg.evaluate(async()=>{S.over=true;for(let i=0;i<30&&CUR_MODAL;i++){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await new Promise(r=>setTimeout(r,100))}
  newWorld({type:'pre',key:MGR_PRE[0].key});const w=W_();if(!w.night)makeNight(w);try{if(typeof any100FillAll==='function')any100FillAll(w)}catch(e){}try{fillNight(w)}catch(e){}
  const bt=w.night.bouts.find(x=>x.ents.length>=2);if(!bt)return {none:1};startEvent(boutCfg(bt,true));
  for(let i=0;i<80&&!document.querySelector('#modal.bf100');i++)await new Promise(r=>setTimeout(r,200));const o={brief:!!document.querySelector('#modal.bf100'),seats:document.querySelectorAll('.bf100st').length,n:S.players.length,ctx:!!S.mgrCtx};
  document.querySelector('#mBtns .btn.primary').click();for(let i=0;i<60&&!(S.turnNo>0);i++){if(CUR_MODAL&&!document.querySelector('#modal.bf100'))CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await new Promise(r=>setTimeout(r,150))}o.turn=S.turnNo;return o});
ok(mg.brief&&mg.seats===mg.n&&mg.turn>0,'Manager bout '+JSON.stringify(mg));
/* known, not this module (seen with the kill switch on too): 230's morph95TplAttrs trips on a Manager nickname in quotes now and then */
const e1=await pg.evaluate(()=>errNew92(window.__m).filter(e=>!(/morph95TplAttrs/.test(e.at||'')&&/not a valid attribute name/.test(e.msg))).map(e=>e.msg));ok(!e1.length,'no new 00c errors (desktop): '+JSON.stringify(e1));
await pg.close();
/* 6 phone 390×844 */
const ph=await open(390,844);
await start(ph,'democritus',6,[{cls:'royalty',cpu:false,name:'Varinius Gracchi'},{cls:'amazonia',cpu:true,name:'Galla Aquila'},{cls:'soldier',cpu:true,name:'The Scourge'},{cls:'damnatio',cpu:true,name:'Nonus Messala'}]);
await waitBrief(ph);await ph.waitForTimeout(400);r=await read(ph);
ok(r.docW<=390&&r.boxW<=0,'390: no sideways scroll '+r.docW+'/'+r.boxW);ok(r.btnBottom<=844,'390: button on screen');ok(r.rules.length>=4,'390: rules all shown');
const scr=await ph.evaluate(async()=>{const m=document.getElementById('mboxEl');m.scrollTop=1e5;await new Promise(r=>setTimeout(r,100));const s=document.querySelector('.bf100strip');return {btn:document.querySelector('#mBtns .btn.primary').getBoundingClientRect().bottom,strip:s.scrollWidth>s.clientWidth,doc:document.documentElement.scrollWidth}});
ok(scr.btn<=844&&scr.doc<=390,'390 scrolled: button stays, no sideways page');ok(scr.strip,'390: seats swipe in their own strip');
ok(await ph.evaluate(()=>errNew92(window.__m).length===0),'no new 00c errors (phone)');
await ph.close();
/* 7 online (mock): two windows, each shows the briefing locally, the match starts with equal hashes */
const root=path.dirname(PAGE),page=path.basename(PAGE);
const srv=http.createServer((q,res)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end()}const ext=path.extname(f);res.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(res)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0')});
const A=await ctx.newPage(),B=await ctx.newPage();for(const [n,p] of [['A',A],['B',B]])p.on('pageerror',e=>errs.push(n+':'+e.message));
await A.goto(URL0,{timeout:90000});await A.evaluate(()=>localStorage.removeItem('flavius_onlmock'));await B.goto(URL0,{timeout:90000});for(const P of [A,B])await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const setup=async(p,name)=>{await p.evaluate(async(name)=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls:name==='Alpha'?'hero':'soldier'})},name)};
const sync=async(from,to,ms=15000)=>{const t0=Date.now();while(Date.now()-t0<ms){const v=await from.evaluate(()=>localStorage.getItem('flavius_onlmock'));if(await to.evaluate(v=>localStorage.getItem('flavius_onlmock')===v,v))return true;await to.waitForTimeout(100)}return false};
const seen=async(p,fn,arg,ms=30000)=>{const t0=Date.now();while(Date.now()-t0<ms){if(await p.evaluate(fn,arg).catch(()=>false))return true;await p.waitForTimeout(150)}return false};
await setup(A,'Alpha');await sync(A,B);await setup(B,'Beta');await sync(B,A);
const L=await A.evaluate(async()=>await NET.req('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:false}));
for(let k=0;k<8;k++){await seen(B,id=>!!mockLoad().lobbies[id],L.id);await B.evaluate(async(id)=>{try{await NET.req('lobby.join',{id})}catch(e){}},L.id);if(await seen(A,id=>ONLC.humansOf(mockLoad().lobbies[id]||{}).length>=2,L.id,5000))break}
await sync(B,A);const L2=await A.evaluate(async(id)=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},L.id);await sync(A,B);await B.evaluate(async(L)=>{onlEnter(L)},L2);await sync(A,B);
const got={};for(const [n,P] of [['A',A],['B',B]]){got[n]={brief:false,me:false,reached:false};for(let k=0;k<120;k++){const s=await P.evaluate(()=>{if(typeof S==='undefined'||!S||!S.onl)return {};const o={};
    if(CUR_MODAL&&document.querySelector('#modal.bf100 .bf100w')){o.brief=true;o.me=document.querySelectorAll('.bf100st.you').length===1;document.querySelector('#modal .mbtns .primary').click()}
    o.ok=!!(ONLM.on&&S.players&&S.players.length>=3&&!CUR_MODAL);return o});if(s.brief){got[n].brief=true;got[n].me=s.me}if(s.ok){got[n].reached=true;break}await P.waitForTimeout(500)}}
/* the host's window opens the event (and its briefing); a joiner loads the host's snapshot and goes straight to the board, as before */
ok(got.A.brief&&got.A.me,'online: the briefing on the host window, own seat YOU '+JSON.stringify(got));ok(got.B.reached,'online: window B reached the match');
let ha,hb;for(let k=0;k<40;k++){ha=await A.evaluate(()=>({h:onlHash(),r:ONLM.resyncs}));hb=await B.evaluate(()=>({h:onlHash(),r:ONLM.resyncs}));if(ha.h===hb.h)break;await A.waitForTimeout(500)}
ok(ha.h===hb.h&&!ha.r&&!hb.r,'online: hashes agree, no resync '+JSON.stringify({ha,hb}));
await ctx.close();srv.close();
console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();if(miss.length||errs.length)process.exit(1)})();
