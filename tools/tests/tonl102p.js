/* v1.02 ONLINE PROGRESSION (111-onlcore "v1.02 PROGRESSION" + 340-v102prog) through the MOCK server, one window:
   a Ranked match settles through the mock's own match.result → XP decided by the shared rules (no silent growth), last102 carries the match →
   the Online window opens the RESULTS TALLY once (#tl102: CF / coin / Glory / XP rows, LEVEL UP, Continue) → the LEVEL-UP screen (#lu102: pick
   Strength, Train it → +1, point spent) → the Domus XP bar + "Lv N" on the slot card + "class set at creation" (char.class refused: class_fixed) →
   ⋯ Release (typed name, gear to the house shelf, erased) and 🗡 Grant the rudis (100 coin, a Hall plaque) → release refused in a room →
   Reduce motion shows the tally's end state at once → the kill switch hides it all. ERRS must be []. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1400,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0')});
const errs=[];const P=await ctx.newPage();P.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await P.goto(URL0,{timeout:90000});
await P.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|report|over|match|tester|acct)/.test(k))localStorage.removeItem(k);try{sessionStorage.clear()}catch(e){}});await P.reload({timeout:90000});await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const SHOT=process.env.SHOT;const shot=async n=>{if(SHOT)await P.screenshot({path:path.join(SHOT,'tonl102p_'+n+'.png')})};
const until=async(fn,arg,ms)=>{try{return (await P.waitForFunction(fn,arg,{timeout:ms||8000,polling:100})).jsonValue()}catch(e){return null}};
const info=await P.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name:'Ann Realname',google:1});await NET.req('lanista.name',{name:'Marcus Levelus'});
  const D=(await NET.req('domus.create',{name:'Levelii'})).domus;const w=mockLoad();const X=w.domus82[D.id];X.slots100=4;mockSave(w);const ch=await NET.req('char.create',{name:'Marcus Ferox',cls:'soldier'});return {id:ONL.acct.id,dom:D.id,ch:ch.id,st:ch.stats,lv:ch.lv}});
ok(info.lv===1,'a new gladiator starts at level 1');
/* ── a Ranked match through the mock's own settlement ── */
const m=await P.evaluate(async([cid])=>{const w0=mockLoad();w0.chars[cid].xp=30;mockSave(w0);
  const L=await NET.req('lobby.create',{ev:'cassian',ranked:true,cry:false});const w=mockLoad();const X=w.lobbies[L.id];X.status='live';X.started=Date.now();
  w.matches[L.id]={id:L.id,seed:7,inputs:[],results:{},open:null,watch:{},abandoned:{},status:'live'};mockSave(w);
  const r=await NET.req('match.result',{id:L.id,table:[{seat:0,won:true,place:1,f:30,coin:0,kills:0,survives:true},{seat:1,f:4},{seat:2,f:2},{seat:3,f:1}],hash:'h1'});
  const c=mockLoad().chars[cid];return {id:L.id,r,xp:c.xp,lv:c.lv,pts:c.pts,st:c.stats,last:c.last102}},[info.ch]);
ok(m.xp===63&&m.lv===2&&m.pts===1,'XP decided by the shared rules (0.5 × (30+20+15) = 33 on top of 30): '+JSON.stringify([m.xp,m.lv,m.pts]));
const sum=o=>Object.values(o).reduce((a,v)=>a+v,0);ok(sum(m.st)===sum(info.st)+1,'one level = +1 to the weakest (no silent grow): '+sum(info.st)+' → '+sum(m.st));
ok(m.last&&m.last.m===m.id&&m.last.ev==='cassian'&&m.last.ranked&&m.last.won&&m.last.lv0===1&&m.last.lv1===2&&m.last.gain===33,'last102 carries the match: '+JSON.stringify(m.last));
/* ── the Online window → the tally, once ── */
await P.evaluate(async()=>{onlineOpen('char');await new Promise(r=>setTimeout(r,900));ONL.tab='char';ONL.newGlad=false;ONL82.dgAt=0;await onlRefresh();ONL82.dg=await NET.req('domus.get',{});ONL.domus=ONL82.dg.domus;onlRedraw()});
const tl=await until(()=>{const t=document.querySelector('#tl102 .tl102');return t?{h:t.querySelector('h1').textContent,rows:[...t.querySelectorAll('.tr')].map(x=>x.id),kick:t.querySelector('.kick').textContent}:null});
ok(tl&&tl.h==='Victoria'&&['tl102cf','tl102co','tl102gl','tl102xp'].every(k=>tl.rows.includes(k))&&/RANKED/.test(tl.kick)&&/CASSIAN/i.test(tl.kick),'the tally: '+JSON.stringify(tl));
const end=await until(()=>{const S=P102.tl;const x=document.querySelector('#tl102xp');return S&&S.end&&x?{gain:x.querySelector('.gain').textContent,lvup:x.querySelector('.lvup.on')!=null,chips:x.querySelector('.brk').textContent,ring:(document.querySelector('#tl102ring b')||{}).textContent}:null},null,15000);
ok(end&&end.gain==='+33'&&end.lvup&&end.ring==='2'&&/won/.test(end.chips)&&/table/.test(end.chips),'the XP row counts up, LEVEL UP, the breakdown: '+JSON.stringify(end));
const seen=await until(()=>{const w=mockLoad();const c=Object.values(w.chars).find(x=>x.name==='Marcus Ferox');return c&&!c.last102?1:null});await shot('tally');ok(seen,'char.seen102: the server forgets it (once, any device)');
/* Continue → the level-up screen */
await P.click('#tl102 [data-p102="tlgo"]');
const lu=await until(()=>{const L=document.querySelector('#lu102 .lu102');return L?{cards:L.querySelectorAll('.rcd').length,pts:L.querySelector('.pts').textContent,go:L.querySelector('[data-p102="lugo"]').disabled}:null});
if(SHOT){await P.click('#lu102 .rcd[data-k="spd"]');await shot('levelup')}ok(lu&&lu.cards===5&&/1 point/.test(lu.pts)&&lu.go,'level up: five cards, one point, Train it waits for a pick: '+JSON.stringify(lu));ok(!(await P.$('#tl102')),'the tally closed');
const str0=await P.evaluate(()=>p102Char(P102.lu.id).stats.str);
await P.click('#lu102 .rcd[data-k="str"]');await P.click('#lu102 [data-p102="lugo"]');
const after=await until(([s])=>{const c=Object.values(mockLoad().chars).find(x=>x.name==='Marcus Ferox');return c&&c.stats.str===s+1&&c.pts===0&&!document.querySelector('#lu102')?{str:c.stats.str,log:c.lvlog}:null},[str0]);
ok(after&&after.log&&after.log[0][1]==='str','the point placed (+1 Strength), the screen closes: '+JSON.stringify(after));
/* the tally does not come back */
await P.evaluate(()=>onlRedraw());await P.waitForTimeout(400);ok(!(await P.$('#tl102')),'shown once');
/* ── the Domus ── */
const dm=await until(()=>{const x=document.querySelector('#onl .xp102w');const c=document.querySelector('#onl .gc102w .lv102');return x&&c?{lvl:x.textContent.replace(/\s+/g,' '),chip:c.textContent,cls:!!document.querySelector('#onl .cls102'),old:!!document.querySelector('#onl [data-d89="cls"]'),menu:!!document.querySelector('#onl .gc102m')}:null});
await shot('domus');ok(dm&&/Level 2/.test(dm.lvl)&&/to level 3/.test(dm.lvl)&&dm.chip.trim()==='Lv 2'&&dm.cls&&!dm.old&&dm.menu,'Domus: XP bar, Lv on the slot card, class set at creation, ⋯ menu: '+JSON.stringify(dm));
const cf=await P.evaluate(async([cid])=>{try{await NET.req('char.class',{char:cid,cls:'hero'});return 'ok'}catch(e){return e.code}},[info.ch]);ok(cf==='class_fixed','char.class refused: '+cf);
/* ── release ── */
const two=await P.evaluate(async()=>{const c=await NET.req('char.create',{name:'Spurius Minor',cls:'slave'});const w=mockLoad();const x=w.chars[c.id];x.gear=['gladius','galea#u77'];x.pcs={u77:{st:'whole',iss:1}};x.equip=['gladius'];mockSave(w);
  await onlRefresh();ONL82.dg=await NET.req('domus.get',{});ONL.domus=ONL82.dg.domus;onlRedraw();await new Promise(r=>setTimeout(r,200));return c.id});
const hall0=await P.evaluate(()=>mockLoad().hall.length);
await P.click(`#onl .gc102m[data-v="${two}"]`);await until(()=>!!document.querySelector('#p102menu [data-p102="rel"]'));await P.click('#p102menu [data-p102="rel"]');
const rl=await until(()=>{const r=document.querySelector('#rl102 .rl102');return r?{t:r.querySelector('h3').textContent,gone:r.querySelector('li.gone')!=null,erase:r.querySelector('.rl102v.erase')!=null,dis:r.querySelector('[data-p102="relgo"]').disabled}:null});
await shot('release');ok(rl&&/Release Spurius Minor/.test(rl.t)&&rl.gone&&rl.erase&&rl.dis,'the release window: '+JSON.stringify(rl));
await P.fill('#rl102in','Spurius');ok(await P.$eval('#rl102 [data-p102="relgo"]',x=>x.disabled),'a wrong name keeps the button off');
await P.fill('#rl102in','spurius minor');ok(!(await P.$eval('#rl102 [data-p102="relgo"]',x=>x.disabled)),'the right name (any case) opens it');
await P.click('#rl102 [data-p102="relgo"]');
const rel=await until(([id])=>{const w=mockLoad();const c=w.chars[id];if(!c||c.alive||document.querySelector('#rl102'))return null;const A=Object.values(w.accounts).find(a=>a.domus);const D=w.domus82[A.domus];
  return {k:c.rel102&&c.rel102.k,hall:w.hall.length,shelf:(D.gear||[]).includes('gladius'),iss:(D.gear||[]).some(g=>/^galea/.test(g)),memo:(D.memo89||[]).some(m=>m.name==='Spurius Minor'&&m.by&&m.by.k==='rel')}},[two]);
ok(rel&&rel.k==='released'&&rel.hall===hall0&&rel.shelf&&!rel.iss&&rel.memo,'released: gear to the shelf, the Issued piece gone, erased (no Hall), the memorial: '+JSON.stringify(rel));
/* ── the rudis ── */
const three=await P.evaluate(async([dom])=>{const c=await NET.req('char.create',{name:'Verus',cls:'hero'});const w=mockLoad();w.domus82[dom].treasury=150;mockSave(w);
  await onlRefresh();ONL82.dg=await NET.req('domus.get',{});ONL.domus=ONL82.dg.domus;onlRedraw();await new Promise(r=>setTimeout(r,200));return c.id},[info.dom]);
await P.click(`#onl .gc102m[data-v="${three}"]`);await until(()=>!!document.querySelector('#p102menu [data-p102="rudis"]'));await P.click('#p102menu [data-p102="rudis"]');
const rw=await until(()=>{const r=document.querySelector('#rl102 .rl102');return r?{hall:r.querySelector('.rl102v.hall')!=null,t:r.querySelector('h3').textContent}:null});ok(rw&&rw.hall&&/rudis/.test(rw.t),'the rudis window promises the Hall: '+JSON.stringify(rw));
await P.fill('#rl102in','Verus');await P.click('#rl102 [data-p102="relgo"]');
const rd=await until(([id,dom])=>{const w=mockLoad();const c=w.chars[id];if(!c||c.alive)return null;return {k:c.rel102.k,h:w.hall[0]&&w.hall[0].name===id?0:(w.hall[0]||{}).why||'',name:(w.hall[0]||{}).name,tre:w.domus82[dom].treasury}},[three,info.dom]);
ok(rd&&rd.k==='rudis'&&rd.name==='Verus'&&/Rudiarius — freed/.test(rd.h)&&rd.tre===50,'the rudis: 100 coin, a Hall plaque: '+JSON.stringify(rd));
/* ── release refused in a room ── */
const busy=await P.evaluate(async([cid])=>{await NET.req('lobby.create',{ev:'cassian',ranked:false,cry:false});let a='',b='';try{await NET.req('char.release',{id:cid,name:'Marcus Ferox'})}catch(e){a=e.code}
  try{await NET.req('char.lvup',{id:cid,k:'spd'})}catch(e){b=e.code}return [a,b]},[info.ch]);
ok(busy[0]==='in_match','release refused in a room: '+busy[0]);ok(busy[1]==='lvup_bad'||busy[1]==='in_match','lvup refused (no point / in a room): '+busy[1]);
/* ── Reduce motion: the end state at once ── */
const rm=await P.evaluate(async([cid])=>{const ls=(await NET.req('lobby.list',{}));for(const L of ls)if(L.status==='waiting')try{await NET.req('lobby.leave',{id:L.id})}catch(e){}
  const w=mockLoad();const c=w.chars[cid];c.last102={at:Date.now(),ranked:false,won:false,died:false,cf:12,coin:0,g0:10,g1:22,rk0:'tiro',rk1:'tiro',xp0:c.xp,xp1:c.xp+16,gain:16,lv0:c.lv,lv1:c.lv,pts:0,auto:[],f:1};mockSave(w);
  SETTINGS.calm=true;await onlRefresh();onlRedraw();await new Promise(r=>setTimeout(r,250));const x=document.querySelector('#tl102xp');const r={h:(document.querySelector('#tl102 h1')||{}).textContent,gain:x&&x.querySelector('.gain').textContent,end:!!(P102.tl&&P102.tl.end)};
  P102.tl&&p102TlClose(false);SETTINGS.calm=false;return r},[info.ch]);
ok(rm.h==='Bout done'&&rm.gain==='+16'&&rm.end,'Reduce motion: the end state at once: '+JSON.stringify(rm));
/* ── the level in the lists ── */
const lv=await P.evaluate(async()=>{const L=await NET.req('lobby.create',{ev:'cassian',ranked:false,cry:false});ONL.lobbies=await NET.req('lobby.list',{});const h=onlRoomHTML80(ONL.lobbies.find(x=>x.id===L.id)||L,false);
  const d=document.createElement('div');d.innerHTML=h;const hc=document.createElement('div');hc.innerHTML=hc98HTML({domus:ONL.domus,glads:[{id:'x',name:'Marcus Ferox',cls:'soldier',rank:'tiro',glory:1,lv:2}],last:[],best:'tiro'});
  await NET.req('lobby.leave',{id:L.id});return {room:(d.querySelector('.lv102')||{}).textContent||'',card:(hc.querySelector('.hc98-gl .lv102')||{}).textContent||''}});
ok(/Lv 2/.test(lv.room),'room seat / member list: '+JSON.stringify(lv));ok(/Lv 2/.test(lv.card),'house card: '+JSON.stringify(lv));
/* ── the kill switch ── */
const P2=await ctx.newPage();P2.on('pageerror',e=>errs.push('P2 '+e.message));await P2.addInitScript(()=>localStorage.setItem('flavius_v102ioff','1'));await P2.goto(URL0,{timeout:90000});await P2.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const off=await P2.evaluate(()=>({off:P102.off,css:!!document.getElementById('p102css'),show:typeof d89Show==='function'?d89Show({id:'g',name:'X',cls:'hero',stats:{},gear:[],bouts:0,wins:0,survived:0},new Set()).indexOf('xp102w')<0:true}));
ok(off.off&&!off.css&&off.show,'the kill switch: no tally, no XP bar: '+JSON.stringify(off));
if(miss.length||errs.length){console.log('FAIL',miss,'ERRS',errs);process.exit(1)}console.log('tonl102p: ok');console.log('ERRS []');await b.close();srv.close()})().catch(e=>{console.error(e);process.exit(1)});
