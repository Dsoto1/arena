/* online v0.80 rules (119-onl80rules): three windows in one Custom room — printed gear only (a host with a custom chest weapon and
   the 'rolls' roster), no pause control, a tampered client is outvoted (its input skipped by the majority, which does not reload,
   and it gets the majority's arena), an online gameOver writes no offline records; then a Ranked 2-human room — hints, the
   strategy panel and Focus suggestions off (back on after), and a 2-human desync resyncs the old way (no hash vote). */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0');
  window.__req={};window.addEventListener('DOMContentLoaded',()=>{const t=setInterval(()=>{if(typeof NET==='undefined')return;clearInterval(t);const base=NET.req;NET.req=function(k){window.__req[k]=(window.__req[k]||0)+1;return base.apply(this,arguments)}},20)})});
const errs=[];const A=await ctx.newPage(),B=await ctx.newPage(),C=await ctx.newPage();const P={A,B,C};
for(const [n,p] of Object.entries(P))p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));
await A.goto(URL0);await A.evaluate(()=>localStorage.removeItem('flavius_onlmock'));await B.goto(URL0);await C.goto(URL0);await A.waitForTimeout(2500);
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls});
  /* this browser's creations: a level 4 chest weapon and a market weapon, everything on the rolls */
  const cw1={...blankCW(),id:'t80c',name:'Test Chest Blade',chest:1,rolls:{market:true,loadout:true}};const cw2={...blankCW(),id:'t80m',name:'Test Market Blade',rolls:{market:true}};
  CUSTOM.weapons=(CUSTOM.weapons||[]).filter(x=>!/^t80/.test(x.id)).concat([cw1,cw2]);CFG.roster='rolls';rosterUse(rosterById('rolls'));try{hintsMaster(true,true)}catch(e){setHints(true)}
  return {chest:CHEST_W.includes('cw_t80c'),market:Object.values(MARKET_W).flat().includes('cw_t80m'),hints:HINTS}},[name,cls]);
const pre={A:await setup(A,'Alpha','hero'),B:await setup(B,'Beta','soldier'),C:await setup(C,'Gamma','amazonia')};
/* the mock world lives in one localStorage item: a join can be lost to another window's write — join until seated */
const join=async(p,id)=>{for(let k=0;k<8;k++){const ok=await p.evaluate(async id=>{try{await NET.req('lobby.join',{id})}catch(e){}await new Promise(r=>setTimeout(r,300));
  return (await NET.req('lobby.list')).some(L=>L.id===id&&L.players.some(x=>x.id===ONL.acct.id))},id);if(ok)return true;await p.waitForTimeout(400)}return false};
const L=await A.evaluate(async()=>await NET.req('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:false,abandon:'cpu'}));
const sees=async(p,id,n)=>{for(let t0=Date.now();Date.now()-t0<20000;){if(await p.evaluate(([id,n])=>ONLC.humansOf(mockLoad().lobbies[id]||{}).length>=n,[id,n]))return true;await p.waitForTimeout(150)}return false};
await join(B,L.id);await join(C,L.id);await sees(A,L.id,3);
const L2=await A.evaluate(async id=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},L.id);
await B.evaluate(L=>onlEnter(L),L2);await C.evaluate(L=>onlEnter(L),L2);
const drive=async p=>{const r=await p.evaluate(()=>{if(CUR_MODAL&&(!ONLM.on||onlmMine()||ONLM.info>0)){const t=(document.querySelector('#mTitle')||{}).textContent||'';const pb=document.querySelector('#modal .mbtns .primary')?'#modal .mbtns .primary':document.querySelector('#modal .mbtns button')?'#modal .mbtns button':null;return pb?['sel',pb,'modal:'+t.slice(0,24)]:['','','modal?']}
  if(!S||S.over||!ONLM.on)return ['','','off'];if(!onlmMine()||S.busy)return ['','','wait'];
  if(S.phase==='choice'&&document.querySelector('[data-act="coin"]'))return ['sel','[data-act="coin"]','coin'];
  if(S.phase==='action'){S._drv=(S._drv||0)+1;const atk=[...document.querySelectorAll('[data-act^="m-atk"]')].filter(b=>!b.disabled);
    if(S._drv%4===1&&atk.length&&S.mode==='move')return ['sel','[data-act="'+atk[0].dataset.act+'"]','mode:'+atk[0].dataset.act];
    try{computeHL()}catch(e){}const ks=[...HL.keys()];if(ks.length&&S._drv%4!==0){const k=ks[(S.turnNo*7+S._drv*3)%ks.length];const r0=Math.floor(k/N),c0=k%N;const cv=document.querySelector('canvas');const rc=cv.getBoundingClientRect();const pt=center(r0,c0);
      return ['xy',[rc.left+pt.x*rc.width/cv.width,rc.top+pt.y*rc.height/cv.height],(S.mode||'')+'@'+r0+','+c0]}
    S._drv=0;if(document.querySelector('[data-act="end"]'))return ['sel','[data-act="end"]','end']}return ['','','idle:'+S.phase]});
  /* force: the suggested End turn beats (heartbeat), so it is never 'stable' for Playwright — under load it never got clicked */if(r[0]==='sel')await p.click(r[1],{timeout:2000,force:true}).catch(()=>{});if(r[0]==='xy')await p.mouse.click(r[1][0],r[1][1]);return r[2]};
const fast=p=>p.evaluate(()=>{try{setSpeedUI('fast')}catch(e){}});
/* everyone on the sand (the host's opening windows are answered by the driver) */
const waitIn=async(ps,id)=>{const t0=Date.now();while(Date.now()-t0<90000){const ok=await Promise.all(ps.map(p=>p.evaluate(id=>!!(ONLM.on&&S&&S.onl&&S.onl.lobby===id),id)));if(ok.every(Boolean))return true;for(const p of ps)await drive(p);await A.waitForTimeout(250)}return false};
const waitOn=()=>waitIn([A,B,C],L.id);
await waitOn();for(const p of [A,B,C])await fast(p);
/* printed gear only, on the host and on the clients; Flavius presides; Custom keeps the hints */
const gearOf=p=>p.evaluate(()=>({chest:CHEST_W.filter(k=>/^c[wa]_/.test(k)),market:Object.values(MARKET_W).flat().concat(Object.values(MARKET_A).flat()).filter(k=>/^c[wa]_/.test(k)),
  inMatch:/"c[wa]_/.test(JSON.stringify(S.market||{})+JSON.stringify(S.chest||'')+JSON.stringify(S.players.map(p=>[p.wR&&p.wR.key,p.wL&&p.wL.key]))),sponsor:S.sponsorId,hints:HINTS,strat:showStrategy(),regulars:S.spect.filter(s=>s.rid&&!/^onl:/.test(s.rid)&&CROWD_CACHE.some(r=>r.id===s.rid)).length}));
const gear={A:await gearOf(A),B:await gearOf(B),C:await gearOf(C)};
/* no pause control online */
const pause=await A.evaluate(()=>{const b=document.querySelector('#speedTray [data-speed="pause"]');const st=document.querySelector('#speedTray [data-speed="step"]');const vis=x=>!!x&&getComputedStyle(x).display!=='none';
  const r={pauseShown:vis(b),stepShown:vis(st),bar:document.body.classList.contains('onlarena')};b.click();r.afterClick=SPEED;st.click();r.afterStep=SPEED;return r});
await A.evaluate(()=>{if(document.activeElement)document.activeElement.blur()});await A.keyboard.press('Space');await A.waitForTimeout(150);pause.afterSpace=await A.evaluate(()=>SPEED);
const run=async(ms,who=[A,B,C],until)=>{const t0=Date.now();while(Date.now()-t0<ms){for(const p of who)await drive(p);await A.waitForTimeout(200);if(await A.evaluate(()=>!S||S.over))break;if(until&&await until())break}};
await run(9000);
/* tamper Gamma's arena on Gamma's own move: the next input it sends is out of step with Alpha and Beta */
const gen0={A:await A.evaluate(()=>ONLM.gen),B:await B.evaluate(()=>ONLM.gen),C:await C.evaluate(()=>ONLM.gen)};let tampered=null;
{const t0=Date.now();while(Date.now()-t0<180000&&!tampered){await drive(A);await drive(B);
  tampered=await C.evaluate(()=>{if(!onlmOn()||!onlmMine()||S.busy||CUR_MODAL||ONLM.pend||!['choice','action'].includes(S.phase))return null;const h0=onlHash();S.players[0].coin+=7;return {h0,h1:onlHash(),next:ONLM.next,turn:S.turnNo}});
  if(tampered)break;/* Gamma's own window (a Focus roll, a draft…) is answered, else the move never comes and the others drop the idle seat */await C.evaluate(()=>!!(CUR_MODAL&&onlmOn()&&(onlmMine()||ONLM.info>0)))&&await drive(C);await A.waitForTimeout(150);if(await A.evaluate(()=>!S||S.over))break}}
const oddDone=async()=>{const a=await A.evaluate(()=>ONL80R.oddSkips);const c=await C.evaluate(g=>ONLM.gen!==g,gen0.C);return a>0&&c};
/* Gamma plays on until its out-of-step input is sent; then only Alpha and Beta play until the majority's arena reached Gamma (a Gamma
   still clicking while the snapshot is on its way races the resync itself — not what this checks) */
{const in0=tampered?await C.evaluate(()=>window.__req['match.input']||0):0;await run(60000,[C,A,B],async()=>(await C.evaluate(()=>window.__req['match.input']||0))>in0||await oddDone())}
await run(120000,[A,B],oddDone);
const after=async p=>p.evaluate(()=>({resyncs:ONLM.resyncs,gen:ONLM.gen,odd:{...ONLM.odd},oddSkips:ONL80R.oddSkips,votes:ONL80R.votes,last:ONL80R.last||null,next:ONLM.next,coin0:S.players[0].coin,req:{...window.__req}}));
const r1={A:await after(A),B:await after(B),C:await after(C)};
await run(120000,[A,B,C],async()=>(await A.evaluate(()=>ONLM.next))>=r1.A.next+8);
/* all three have applied every input before the hashes are compared (the regression runs 3 tests at once) */
const level=async ps=>{for(let t1=Date.now();Date.now()-t1<30000;){const ns=await Promise.all(ps.map(p=>p.evaluate(()=>ONLM.next)));if(ns.every(n=>n===ns[0]))break;await A.waitForTimeout(250)}};await level([A,B,C]);const r1b={};for(const [n,p] of Object.entries(P))r1b[n]=await p.evaluate(()=>({over:!!(S&&S.over),next:ONLM.next,turn:S&&S.turnNo,ph:S&&S.phase,busy:S&&S.busy,modal:CUR_MODAL?((document.getElementById('mTitle')||{}).textContent||'?').slice(0,40):null,act:onlmActor(),owner:onlmOwner(),me:ONLM.me,pend:!!ONLM.pend,q:ONLM.q.length,inf:ONLM.inflight,mine:onlmMine(),resyncing:!!ONLM.resyncing,cur:cur()&&cur().name,log:[...document.querySelectorAll('#log > li')].slice(0,3).map(l=>l.textContent.slice(0,80))}));
/* in step again: every seq after Gamma's reload hashes the same on all three */
const hl={};for(const [n,p] of Object.entries(P))hl[n]=await p.evaluate(()=>ONLM.hlog);
let same=0,diff=0;const from=r1.C.next;for(let s=from;s<from+400;s++){const hs=['A','B','C'].map(n=>hl[n]['s'+s]).filter(Boolean);if(hs.length<3)continue;if(hs.every(h=>h===hs[0]))same++;else diff++}
const strikes=await A.evaluate(()=>{const w=JSON.parse(localStorage.getItem('flavius_onlmock'));const O=JSON.parse(localStorage.getItem('flavius_onlmock_odd80')||'{}')[S.onl.lobby]||{votes:{},struck:{}};const c=Object.values(w.accounts).find(a=>a.name==='Gamma');
  return {votes:Object.values(O.votes).map(v=>v.length),struck:!!(c&&O.struck[c.id]),strikes:c&&c.strikes||0}});
const hk={};for(const n of ['A','B','C'])hk[n]=Object.keys(hl[n]).filter(k=>/^s\d+$/.test(k)&&+k.slice(1)>=from).map(k=>+k.slice(1)).sort((a,b)=>a-b).join(',');
/* an online gameOver writes no offline records */
const KEYS=['hall','infamis','crowd','arena','gladiators','betlog','match_auto','wallet','missios','hallTrophies','ach_ev','cal','seedOpen'];
const lsSnap=p=>p.evaluate(K=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(K.some(x=>k==='flavius_'+x||k.startsWith('flavius_'+x)))o[k]=localStorage.getItem(k)}return o},KEYS);
const ls0=await lsSnap(A);
for(const p of [A,B,C])await p.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);setTimeout(()=>gameOver([S.players[0]],'The editor calls the bout.'),10)});
await A.waitForFunction(()=>!document.getElementById('modal').hidden&&document.querySelectorAll('#mBtns button').length>0,null,{timeout:30000}).catch(()=>{});await A.waitForTimeout(1000);
const res=await A.evaluate(()=>({modal:!document.getElementById('modal').hidden,save:document.querySelectorAll('#modal [data-save],#modal [data-free]').length,btns:[...document.querySelectorAll('#mBtns button')].map(b=>b.textContent.trim().slice(0,22)),skips:{...ONL80R.skips},blocked:ONL80R.blocked}));
const ls1=await lsSnap(A);const lsDiff=Object.keys({...ls0,...ls1}).filter(k=>ls0[k]!==ls1[k]);
/* back to Online: this browser's roster and creations come back */
for(const p of [A,B,C])await p.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done('close');onlExit()});await A.waitForTimeout(1500);
const back=await A.evaluate(()=>({chest:CHEST_W.includes('cw_t80c'),market:Object.values(MARKET_W).flat().includes('cw_t80m'),hints:HINTS}));
/* Ranked, two lanistas: no hints / strategy / Focus suggestion; a desync resyncs the old way (no vote) */
for(const p of [A,B])await p.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide()});
/* the windows are still writing their match ends into the shared mock world: a room lost to such a write is opened again */
let R=null;for(let k=0;k<5;k++){R=await A.evaluate(async()=>{try{return await NET.req('lobby.create',{ev:'egidious',loc:3,seats:4,ranked:true})}catch(e){return null}});
  let ok=false,lost=false;for(let t0=Date.now();R&&Date.now()-t0<20000&&!ok&&!lost;){lost=!await A.evaluate(id=>!!mockLoad().lobbies[id],R.id);ok=!lost&&await B.evaluate(id=>!!mockLoad().lobbies[id],R.id);if(!ok&&!lost)await A.waitForTimeout(200)}
  if(ok||(R&&!lost))break;await A.waitForTimeout(1000)}
await A.waitForTimeout(1500);await join(B,R.id);await sees(A,R.id,2);
const R2=await A.evaluate(async id=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},R.id);await B.evaluate(L=>onlEnter(L),R2);
await waitIn([A,B],R.id);
for(const p of [A,B])await fast(p);
const rk=async p=>p.evaluate(()=>{const r={hints:HINTS,set:SETTINGS.hints,strat:showStrategy(),dock:(document.getElementById('hintDock')||{}).hidden!==false,ranked:!!S.onl.ranked};try{hintsMaster(true,true)}catch(e){}r.forced=HINTS;return r});
const ranked={A:await rk(A),B:await rk(B)};
const q0={A:await A.evaluate(()=>({hashq:window.__req['match.hashq']||0,votes:ONL80R.votes})),B:await B.evaluate(()=>({hashq:window.__req['match.hashq']||0,votes:ONL80R.votes}))};
await run(6000,[A,B]);
let tamp2=null;{const t0=Date.now();while(Date.now()-t0<180000&&!tamp2){await drive(B);
  tamp2=await B.evaluate(()=>{if(!onlmOn()||onlmMine()||S.busy||CUR_MODAL||ONLM.pend||onlmActor()!==0||!['choice','action'].includes(S.phase))return null;S.players[1].coin+=5;return {next:ONLM.next}});
  if(tamp2)break;await drive(A);await A.waitForTimeout(150);if(await A.evaluate(()=>!S||S.over))break}}
await run(90000,[A,B],async()=>(await B.evaluate(()=>ONLM.resyncs))>0&&(await B.evaluate(()=>!ONLM.resyncing)));
{const f=(tamp2&&tamp2.next||0)+1;const t2=Date.now();await run(90000,[A,B],async()=>Date.now()-t2>=8000&&(await A.evaluate(f=>ONLM.next-f,f))>=3)}await level([A,B]);
const two={A:await A.evaluate(()=>({resyncs:ONLM.resyncs,votes:ONL80R.votes,hashq:window.__req['match.hashq']||0})),B:await B.evaluate(()=>({resyncs:ONLM.resyncs,votes:ONL80R.votes,hashq:window.__req['match.hashq']||0,coin1:S.players[1].coin}))};
const hA=await A.evaluate(()=>ONLM.hlog),hB=await B.evaluate(()=>ONLM.hlog);let same2=0,diff2=0;const f2=(tamp2&&tamp2.next||0)+1;for(let s=f2;s<f2+400;s++){const a=hA['s'+s],c=hB['s'+s];if(!a||!c)continue;if(a===c)same2++;else diff2++}
for(const p of [A,B])await p.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done('close');onlExit()});await A.waitForTimeout(1200);
const rkBack={A:await A.evaluate(()=>({hints:HINTS,set:SETTINGS.hints,strat:showStrategy(),chest:CHEST_W.includes('cw_t80c'),rec:onl80Rec()})),B:await B.evaluate(()=>({hints:HINTS,set:SETTINGS.hints,strat:showStrategy()}))};
console.log(JSON.stringify({pre,gear,pause,tampered,r1,r1b,same,diff,hk,strikes,res,lsDiff,back,ranked,q0,tamp2,two,same2,diff2,rkBack}));
const miss=[];
if(!pre.A.chest||!pre.A.market||!pre.B.chest)miss.push('custom gear set up offline');
for(const n of ['A','B','C']){const g=gear[n];if(g.chest.length||g.market.length||g.inMatch)miss.push('printed gear only '+n);if(g.sponsor!=='flavius')miss.push('Flavius presides '+n);if(g.regulars)miss.push('no regulars '+n);if(!g.hints)miss.push('Custom keeps hints '+n)}
if(pause.pauseShown||pause.stepShown||!pause.bar||pause.afterClick==='pause'||pause.afterStep==='step'||pause.afterSpace==='pause')miss.push('no pause online');
if(!tampered)miss.push('tamper on Gamma\'s move');
if(!(r1.A.oddSkips>0&&r1.B.oddSkips>0))miss.push('majority skipped the odd input');if(r1.A.resyncs||r1.B.resyncs)miss.push('majority did not reload');
if(r1.C.gen===gen0.C)miss.push('odd client got the majority arena');if(r1.A.gen!==gen0.A||r1.B.gen!==gen0.B)miss.push('majority generation unchanged');
if(!(r1.A.odd&&r1.A.odd[2]!=null))miss.push('seat marked odd');if(diff||same<3)miss.push('in step after the odd snapshot');if(!strikes.struck||strikes.strikes<1)miss.push('odd votes strike once');
if(!res.modal||res.save||res.btns.some(t=>/Save all|Replay/.test(t)))miss.push('results without Ludus/replay');
if(!res.skips.recordEvent||!res.skips.updateCrowdAfterEvent)miss.push('record writers skipped');if(lsDiff.length)miss.push('offline records untouched: '+lsDiff.join(','));
if(!back.chest||!back.market||!back.hints)miss.push('own roster back after');
for(const n of ['A','B']){const k=ranked[n];if(!k.ranked||k.hints||k.set||k.strat||!k.dock||k.forced)miss.push('Ranked hints off '+n)}
if(!tamp2)miss.push('2-human tamper');if(!(two.B.resyncs>0))miss.push('2-human resync');if(two.A.hashq-q0.A.hashq||two.B.hashq-q0.B.hashq||two.A.votes!==q0.A.votes||two.B.votes!==q0.B.votes)miss.push('2 humans: no vote');if(diff2||same2<2)miss.push('2-human in step after');
for(const n of ['A','B']){const k=rkBack[n];if(!k.hints||!k.set||!k.strat)miss.push('hints back after Ranked '+n)}if(!rkBack.A.chest)miss.push('roster back after Ranked');if(rkBack.A.rec)miss.push('offline writes resume after the online match');
console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();srv.close();if(miss.length||errs.length)process.exit(1)})();
