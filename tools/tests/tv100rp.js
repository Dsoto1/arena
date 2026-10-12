/* v1.0 REPLAYS (309-v100replay): an all-CPU and a one-human Play Now event are recorded (small, in the 📜 Saves → 🎞 Replays list), the results window
   offers 🎞 Watch the replay, playback reaches the SAME end hash, the controls work (pause, ×1 ×2 ×4, next turn, jump to a round, exit), nothing is
   written while it plays (Store / records / Annals), the list keeps 10 + every ★, a Manager bout replays without touching the world, an old version
   says so, the kill switch records nothing and keeps the old "coming soon"; online (mock): replay.put keeps a Ranked match once (Custom refused),
   and the #replay=<id> link opens it from the server when this browser has none. */
const path=require('path');const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const PAGE=path.resolve(process.argv[2]);const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const errs=[];
const open=async(init)=>{const pg=await b.newPage({viewport:{width:1280,height:720}});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(init||(()=>{localStorage.setItem('flavius_firstrun','shown')}));await pg.goto('file://'+PAGE);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
  await pg.evaluate(()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);SETTINGS.briefing=false;POPPED.add('firstTurn');POPPED.add('mandata');SPEEDMUL.fast=0;window.__m=ERR92.n});return pg};
const seats=(h)=>[{cls:'royalty',cpu:!h,name:'Varinius'},{cls:'amazonia',cpu:true,name:'Galla'},{cls:'soldier',cpu:true,name:'Scourge'},{cls:'hero',cpu:true,name:'Tertius'}];
/* plays an event to its end at Fast; a human seat moves once, ends turns, then hands the rest to ⏭ */
const play=(pg,cfg,human)=>pg.evaluate(async([cfg,human])=>{if(S)S.over=true;
  startEvent({...cfg,seats:cfg.seats.map(s=>({...s,pers:finalPers(s)})),opts:{...CFG.opts,spect:'auto'}});let turns=0,moved=0,sim=0;
  for(let i=0;i<2400&&!(S&&S.over);i++){if(SPEED!=='fast'&&SPEED!=='snap')SPEED='fast';
    if(CUR_MODAL&&S&&!S.over){const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];if(bs.length)bs[0].click();else CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
    else if(human&&S&&S.phase!=='setup'&&humanTurn()){const p=cur();
      if(S.phase==='choice'){const c=document.querySelector('#actions [data-act="coin"]');if(c)c.click()}
      else if(S.phase==='action'){if(turns>=2&&!sim){sim=1;simToEnd(true)}
        else if(!moved){moved=1;S.mode='move';computeHL();const t=[...HL.entries()].find(([k,v])=>v&&v.t==='move');if(t)onTile(Math.floor(t[0]/N),t[0]%N)}
        else{const e=document.querySelector('#actions [data-act="end"]');if(e){turns++;moved=0;e.click()}}}}
    await new Promise(r=>setTimeout(r,60))}
  for(let i=0;i<30&&!CUR_MODAL;i++)await new Promise(r=>setTimeout(r,100));
  const id=RPR.byS.get(S);if(RPR.saving[id])await RPR.saving[id];const R=id?await rp100Local(id):null;
  return {over:S.over,turns:S.turnNo,id,n:R&&R.ins.length,ks:R&&R.ins.map(x=>x.k).join(','),h:R&&R.end.h,kb:(rp100Idx().find(x=>x.id===id)||{}).kb,len:(localStorage.getItem('flavius_rp100.'+id)||'').length,
    btn:[...document.querySelectorAll('#mBtns button')].some(x=>/Watch the replay/.test(x.textContent))}},[cfg,human]);
const waitEnd=(pg,ms=240000)=>pg.waitForFunction(()=>RPP.end,null,{timeout:ms,polling:200}).then(()=>pg.evaluate(()=>({...RPP.end,div:RPP.div,i:RPP.i,muted:RPP.muted|0}))).catch(()=>pg.evaluate(()=>({timeout:1,turn:S&&S.turnNo,i:RPP.i,len:RPP.ins.length,pend:RPP.pend.length,head:JSON.stringify(RPP.ins[RPP.i]||null),phase:S&&S.phase,busy:S&&S.busy,cap:RPP.cap})));
const lsSnap=pg=>pg.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k)}return o});
const lsDiff=(a,b)=>[...new Set([...Object.keys(a),...Object.keys(b)])].filter(k=>a[k]!==b[k]&&!/^flavius_(errlog92|settings|perf|fps|sidetab|last|tab84|tab92|hs$|onlmock_rev)/.test(k));

/* 1 an all-CPU Play Now event */
const pg=await open();const T0=Date.now();
const r1=await play(pg,{ev:'democritus',loc:6,seed:4242,seats:seats(false)},false);
ok(r1.over&&r1.id&&r1.h,'all-CPU event recorded '+JSON.stringify(r1));ok(r1.kb<=60&&r1.len<=60*1024,'small: '+r1.kb+' KB');ok(r1.btn,'results window: 🎞 Watch the replay');
const ls0=await lsSnap(pg);
await pg.evaluate(()=>{window.__put=0;const p=Store.put;Store.put=function(){window.__put++;return p.apply(this,arguments)};window.__hall=JSON.stringify(Store.local('hall'))});
await pg.evaluate(()=>{[...document.querySelectorAll('#mBtns button')].find(x=>/Watch the replay/.test(x.textContent)).click()});
await pg.waitForFunction(()=>RPP.on&&document.getElementById('rp100bar')&&S&&S.turnNo>=1,null,{timeout:20000});
let c=await pg.evaluate(()=>({bar:!!document.querySelector('#rp100bar .rp1tag'),title:document.querySelector('#rp100bar .rp1t').textContent,menu:document.getElementById('mainMenu').hidden,old:!!document.querySelector('#rp100bar .rp1old'),log:document.getElementById('log').textContent}));
ok(c.bar&&/Classic|Democritus/i.test(c.title)&&c.menu&&!c.old,'replay bar up '+JSON.stringify(c).slice(0,200));ok(/Replay/.test(c.log),'replay log line');
/* speed ×2 → ×4 → ×1 */
const sp=await pg.evaluate(async()=>{const q=n=>document.querySelector(`#rp100bar [data-rp1="sp"][data-n="${n}"]`);const o={};q(2).click();o.x2=SPEED;q(4).click();o.x4=SPEED;q(1).click();o.x1=SPEED;o.on=document.querySelector('#rp100bar [data-rp1="sp"].on').dataset.n;return o});
ok(sp.x2==='rp100x2'&&sp.x4==='fast'&&sp.x1==='normal'&&sp.on==='1','speeds '+JSON.stringify(sp));
/* pause holds the board */
const pz=await pg.evaluate(async()=>{document.querySelector('#rp100bar [data-rp1="play"]').click();await new Promise(r=>setTimeout(r,300));const t=S.turnNo,s=RNG.s;await new Promise(r=>setTimeout(r,1500));return {sp:SPEED,same:S.turnNo===t&&RNG.s===s,lbl:document.querySelector('#rp100bar [data-rp1="play"]').textContent}});
ok(pz.sp==='pause'&&pz.same&&/Play/.test(pz.lbl),'pause holds '+JSON.stringify(pz));
/* ⏭ next turn: exactly one more turn, then paused */
const st=await pg.evaluate(async()=>{const t=S.turnNo;document.querySelector('#rp100bar [data-rp1="sp"][data-n="4"]').click();document.querySelector('#rp100bar [data-rp1="step"]').click();
  for(let i=0;i<300&&!(RPP.paused&&S.turnNo>t);i++)await new Promise(r=>setTimeout(r,50));await new Promise(r=>setTimeout(r,600));return {t0:t,t1:S.turnNo,p:RPP.paused,sp:SPEED}});
ok(st.p&&st.t1===st.t0+1&&st.sp==='pause','next turn '+JSON.stringify(st));
/* jump to round III, then play out at ×4 */
const jp=await pg.evaluate(async()=>{const s=document.querySelector('#rp100bar [data-rp1="jump"]');s.value='2';s.dispatchEvent(new Event('change',{bubbles:true}));
  for(let i=0;i<1200&&!(RPP.paused&&S.ri>=2)&&!RPP.end;i++)await new Promise(r=>setTimeout(r,100));return {ri:S.ri,p:RPP.paused,end:!!RPP.end}});
ok((jp.ri>=2&&jp.p)||jp.end,'jump to round III '+JSON.stringify(jp));
await pg.evaluate(()=>{if(RPP.paused)document.querySelector('#rp100bar [data-rp1="play"]').click()});
let e1=await waitEnd(pg);ok(e1.same===true&&!e1.div,'all-CPU replay: the same end hash '+JSON.stringify(e1));ok(e1.muted>0,'records muted while playing '+e1.muted);
const w1=await pg.evaluate(()=>({put:window.__put,hall:JSON.stringify(Store.local('hall'))===window.__hall,ok:/same ending/.test(document.querySelector('#rp100bar .rp1s').textContent)}));
ok(w1.put===0&&w1.hall,'no Store writes / Annals during playback '+JSON.stringify(w1));ok(w1.ok,'the end card says ✓');
const d1=lsDiff(ls0,await lsSnap(pg));ok(!d1.length,'localStorage untouched by playback: '+d1.join(','));
/* ✕ exit → the main menu, speed back */
const ex=await pg.evaluate(async()=>{document.querySelector('#rp100bar [data-rp1="exit"]').click();await new Promise(r=>setTimeout(r,1500));return {on:RPP.on,bar:!!document.getElementById('rp100bar'),menu:!document.getElementById('mainMenu').hidden,sp:SPEED}});
ok(!ex.on&&!ex.bar&&ex.menu&&!/^rp100|pause/.test(ex.sp),'exit '+JSON.stringify(ex));

/* 2 one human: a move, the coin, end turn twice, then ⏭ to the end */
const r2=await play(pg,{ev:'democritus',loc:6,seed:9191,seats:seats(true)},true);
ok(r2.over&&/tile/.test(r2.ks)&&/act/.test(r2.ks)&&/sim/.test(r2.ks),'human event recorded '+JSON.stringify(r2).slice(0,300));
await pg.evaluate(async(id)=>{if(CUR_MODAL)CUR_MODAL.done('close');await new Promise(r=>setTimeout(r,300));await rp100Play(id);rp100Speed(4)},r2.id);
let e2=await waitEnd(pg);ok(e2.same===true&&!e2.div&&e2.i>=r2.n-1,'human replay: the same end hash '+JSON.stringify(e2));
await pg.evaluate(()=>rp100Exit(true));

/* 3 the Saves tab + the list keeps 10 + every ★ */
const L3=await pg.evaluate(async()=>{const keep=rp100Idx();for(const x of keep)rp100Del(x.id);const mk=i=>rp100Save({f:'flavius-replay',fv:1,id:'T'+i,kind:'off',v:GAME_VER,at:1000+i,mode:'pn',title:'Test '+i,sub:'x',ins:[]});
  for(let i=0;i<3;i++)await mk(i);rp100Pin('T0');for(let i=3;i<14;i++)await mk(i);const a=rp100Idx();
  savesHub76('replays');await new Promise(r=>setTimeout(r,500));const rows=document.querySelectorAll('#hub76 [data-rp100go]').length;const tab=!!document.querySelector('#hub76 [data-hub76="replays"].on');
  document.querySelector('#hub76 [data-rp100pin="T13"]').click();await new Promise(r=>setTimeout(r,300));const pin13=rp100Idx().find(x=>x.id==='T13').pin;
  const del=document.querySelector('#hub76 [data-rp100del="T12"]');del.click();const armed=rp100Idx().some(x=>x.id==='T12');document.querySelector('#hub76 [data-rp100del="T12"]').click();await new Promise(r=>setTimeout(r,300));
  const gone=!rp100Idx().some(x=>x.id==='T12')&&!localStorage.getItem('flavius_rp100.T12');if(CUR_MODAL)CUR_MODAL.done('close');
  return {n:a.length,pinned:a.filter(x=>x.pin).map(x=>x.id),un:a.filter(x=>!x.pin).map(x=>x.id),old:['T1','T2','T3'].some(k=>localStorage.getItem('flavius_rp100.'+k)),rows,tab,pin13,armed,gone}});
ok(L3.n===11&&L3.pinned.join()==='T0'&&L3.un.length===10&&L3.un[0]==='T13'&&!L3.old,'keeps 10 + ★ '+JSON.stringify(L3));ok(L3.rows===11&&L3.tab,'🎞 Replays tab lists them');
ok(L3.pin13&&L3.armed&&L3.gone,'★ pin + two-click delete '+JSON.stringify(L3));
await pg.evaluate(()=>{for(const x of rp100Idx())rp100Del(x.id)});

/* 4 a Manager bout replays and leaves the world alone */
const r4=await pg.evaluate(async()=>{if(S)S.over=true;newWorld({type:'pre',key:MGR_PRE[0].key});const w=W_();if(!w.night)makeNight(w);try{if(typeof any100FillAll==='function')any100FillAll(w)}catch(e){}try{fillNight(w)}catch(e){}
  const bt=w.night.bouts.find(x=>x.ents.length>=2);if(!bt)return {none:1};startEvent(boutCfg(bt,true));
  for(let i=0;i<2400&&!(S&&S.over);i++){if(SPEED!=='fast'&&SPEED!=='snap')SPEED='fast';if(CUR_MODAL&&S&&!S.over&&S.phase!=='setup'){const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];if(bs.length)bs[0].click();else CUR_MODAL.done(null)}
    else if(CUR_MODAL&&S&&S.phase==='setup'){const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];if(bs.length)bs[0].click()}
    else if(S&&humanTurn()&&S.phase!=='setup'&&!S.snap){simToEnd(true)}await new Promise(r=>setTimeout(r,60))}
  const id=RPR.byS.get(S);if(RPR.saving[id])await RPR.saving[id];const row=rp100Idx().find(x=>x.id===id);for(let i=0;i<40&&!CUR_MODAL;i++)await new Promise(r=>setTimeout(r,100));if(CUR_MODAL)CUR_MODAL.done('mgrnight');await new Promise(r=>setTimeout(r,2500));
  window.__w=JSON.stringify(W_());return {id,mode:row&&row.mode,ctx:!!S.mgrCtx,over:S.over}});
ok(r4.id&&r4.mode==='mgr'&&r4.ctx,'Manager bout recorded '+JSON.stringify(r4));
await pg.evaluate(async(id)=>{await rp100Play(id);rp100Speed(4);window.__w=JSON.stringify(W_())},r4.id);
let e4=await waitEnd(pg);ok(e4.same===true,'Manager bout replay: the same end hash '+JSON.stringify(e4));
const wd=await pg.evaluate(()=>{const a=JSON.parse(window.__w),b=W_();return Object.keys({...a,...b}).filter(k=>JSON.stringify(a[k])!==JSON.stringify(b[k]))});ok(!wd.length,'the Manager world is untouched by the replay '+wd);
await pg.evaluate(()=>rp100Exit(true));

/* 5 an older version says so */
const v5=await pg.evaluate(async(id)=>{const R=await rp100Local(id);R.v='0.50';await rp100Save(R);await rp100Play(id);await new Promise(r=>setTimeout(r,600));
  const o={old:(document.querySelector('#rp100bar .rp1old')||{}).textContent||'',log:document.getElementById('log').textContent.includes('v0.50')};
  const lst=(()=>{savesHub76('replays');return 1})();rp100Exit(true);return o},r4.id);
ok(/v0\.50/.test(v5.old)&&/may not replay exactly/.test(v5.old)&&v5.log,'version warning '+JSON.stringify(v5));
await pg.evaluate(async()=>{await new Promise(r=>setTimeout(r,300));if(CUR_MODAL)CUR_MODAL.done('close')});

/* 7 online (mock): replay.put keeps a Ranked match once, Custom is refused, #replay=<id> opens it from the server */
const r7=await pg.evaluate(async()=>{for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done('close');await new Promise(r=>setTimeout(r,100))}
  const me=(await NET.req('auth.signin',{name:'Replay Tester'})).id;const id='Lrp100t',idc='Lrp100c';const any=await rp100Local(rp100Idx()[0].id);
  const S0=JSON.parse(any.snap.S);S0.onl={lobby:id,ranked:true,seat:0,owners:[null,null,null,null],fighters:S0.players.length,host:true,opened:false};
  const open={...any.snap,S:JSON.stringify(S0),log:''};const w=mockLoad();
  for(const [k,rk] of [[id,true],[idc,false]]){w.lobbies[k]={id:k,ev:'democritus',loc:6,ranked:rk,status:'done',seats:4,players:[{id:me,name:'Replay Tester'}],host:{id:me},members:[],stands:[]};w.matches[k]={open,inputs:[],seed:1,status:'done'}}
  mockSave(w);const o={};o.put=await NET.req('replay.put',{id,h:'',v:GAME_VER});o.dup=(await NET.req('replay.put',{id,h:'',v:GAME_VER})).dup;
  try{await NET.req('replay.put',{id:idc})}catch(e){o.custom=e.code}try{await NET.req('replay.get',{id:'nope'})}catch(e){o.none=e.code}
  for(const x of rp100Idx())rp100Del(x.id);window.__mq=[];const b0=mockReq;mockReq=function(t){window.__mq.push(t);return b0.apply(this,arguments)};
  location.hash='#replay='+id;return o});
ok(r7.put&&r7.put.done&&r7.dup===1&&r7.custom==='replay_custom'&&r7.none==='replay_none','mock replay.put / get '+JSON.stringify(r7));
await pg.waitForFunction(()=>RPP.on&&RPP.onl&&S&&S.onl&&S.onl.rp100,null,{timeout:20000}).catch(()=>{});
const o7=await pg.evaluate(()=>({on:RPP.on,onl:RPP.onl,hash:location.hash,pop:!!document.querySelector('.rp100pop')}));ok(o7.on&&o7.onl&&!o7.hash&&!o7.pop,'#replay link opens the server replay '+JSON.stringify(o7));
await pg.evaluate(()=>rp100Speed(4));let e7=await waitEnd(pg);ok(e7.win&&!e7.timeout,'online replay plays to its end '+JSON.stringify(e7));
const q7=await pg.evaluate(()=>window.__mq.filter(t=>/^(match|stands|bet)\./.test(t)));ok(!q7.length,'no match requests from an online replay '+q7);
const s7=await pg.evaluate(()=>{rp100Exit(true);B100.lastMid=null;b100Summary('Lrp100t',{});const el=document.getElementById('as100');const o={w:!!(el&&el.querySelector('[data-rp100go="Lrp100t"]')),t:el?el.textContent:''};if(el)el.remove();return o});
ok(s7.w&&!/coming soon/i.test(s7.t),'after-match card: 🎞 Watch, no "coming soon" '+JSON.stringify(s7).slice(0,200));
const e0=await pg.evaluate(()=>errNew92(window.__m).map(e=>e.msg));ok(!e0.length,'no new 00c errors '+JSON.stringify(e0).slice(0,400));
await pg.close();

/* 6 the kill switch: nothing recorded, the old "coming soon" */
const pk=await open(()=>{localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_replay100off','1')});
const k6=await pg2(pk);async function pg2(p){return p.evaluate(async()=>{if(S)S.over=true;startEvent({ev:'democritus',loc:6,seed:5,seats:[{cls:'royalty',cpu:true,name:'A'},{cls:'amazonia',cpu:true,name:'B'},{cls:'soldier',cpu:true,name:'C'},{cls:'hero',cpu:true,name:'D'}].map(s=>({...s,pers:finalPers(s)})),opts:{...CFG.opts,spect:'auto'}});
  for(let i=0;i<100&&!(S&&S.turnNo>0);i++)await new Promise(r=>setTimeout(r,100));simToEnd(true);for(let i=0;i<600&&!S.over;i++)await new Promise(r=>setTimeout(r,100));await new Promise(r=>setTimeout(r,500));
  const btn=[...document.querySelectorAll('#mBtns button')].some(x=>/Watch the replay/.test(x.textContent));if(CUR_MODAL)CUR_MODAL.done('close');
  location.hash='#replay=Lnothing';await new Promise(r=>setTimeout(r,800));const pop=document.querySelector('.rp100pop');return {over:S.over,n:rp100Idx().length,btn,pop:pop?pop.textContent:''}})}
ok(k6.over&&k6.n===0&&!k6.btn,'kill switch: nothing recorded '+JSON.stringify(k6).slice(0,200));ok(/coming soon/i.test(k6.pop),'kill switch: the old popup '+k6.pop.slice(0,80));
await pk.close();
console.log('time',Math.round((Date.now()-T0)/1000)+'s');
console.log('ERRS '+JSON.stringify(errs.slice(0,5)));if(errs.length)miss.push('page errors');
console.log(miss.length?'FAIL\n - '+miss.join('\n - '):'tv100rp: all checks passed');await b.close();process.exitCode=miss.length?1:0})();
