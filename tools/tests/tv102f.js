/* v1.02 F · RESUME AFTER REFRESH (337-v102resume): A a refresh mid CPU turn resumes from that turn's start with the same dice —
   the log after the resume is the log an uninterrupted run wrote from that point; no main menu on the way; the menu's
   "⚔ Back to your match" row resumes too, ✕ forgets it; the kill switch boots the old way. B a refresh at a human's own move
   (idle point) comes back on that move (same seat, tile, movement, coin, dice) and continues with the same log after End turn;
   a finished event never resumes. C a hot-seat table resumes into hot-seat mode from its own slot. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const os=require('os'),fs=require('fs');const dirs=[];const URL=await require(path.join(__dirname,'..','perf95','serve.js'))(page) /* http: file:// storage proved unreliable across reloads under load */;const errs=[],miss=[];const ok=(c,m)=>{console.error((c?"ok   ":"MISS ")+String(m).slice(0,300));if(!c)miss.push(m)};const out={};
/* a persistent profile, like a player's browser */
const mk=async()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tv102f-'));dirs.push(dir);const ctx=await chromium.launchPersistentContext(dir,{viewport:{width:1440,height:900}});const pg=ctx.pages()[0]||await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));
  await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  await pg.goto(URL);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});return {ctx,pg}};
const dbg=(pg,tag)=>async e=>{console.error(tag+' dbg',JSON.stringify(await pg.evaluate(()=>({boot:R102.boot,keys:Object.keys(localStorage).sort().join(','),nav:performance.getEntriesByType('navigation').map(n=>n.type).join(),ptr:localStorage.getItem('flavius_v102f'),find:!!r102Find(),auto:(matchSlotGet('auto')||{}).r102||null,table:(matchSlotGet('table')||{}).r102||null,phase:S&&S.phase,ready:window.FLAVIUS_READY})).catch(x=>String(x))));throw e};
const W0=ms=>new Promise(r=>setTimeout(r,ms));
/* closes any window the way a CPU-only test does (its close value) — the same rule on both sides of a comparison */
const until=(pg,fn,arg,ms=90000)=>pg.evaluate(async([src,arg,ms])=>{const f=eval(src);const W8=t=>new Promise(r=>setTimeout(r,t));const t0=Date.now();
  while(Date.now()-t0<ms){try{if(f(arg))return true}catch(e){}if(CUR_MODAL&&!document.querySelector('#modal .hsbanner'))CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(80)}return false},[fn.toString(),arg,ms]);
const start=(pg,seed,seats,speed)=>pg.evaluate(async([seed,seats,speed])=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SPEED=speed;startEvent({ev:'democritus',loc:6,seed,seats,opts:{spect:0}});return true},[seed,seats,speed]);
const logLines=pg=>pg.evaluate(()=>[...document.querySelectorAll('#log > li')].reverse().map(l=>l.textContent));
const after=(L)=>{const i=L.findIndex(t=>/match resumes from/.test(t));return i<0?null:L.slice(i+1)};
/* the resumed lines must be what the uninterrupted run wrote from the same point (the shorter run is a prefix of the longer) */
const same=(O,R)=>{if(!R||!R.length)return {ok:false,why:'no resumed lines'};let i=-1;for(let k=O.length-1;k>=0;k--)if(O[k]===R[0]){i=k;break}if(i<0)return {ok:false,why:'first line not found: '+R[0]};
  const o=O.slice(i);const n=Math.min(o.length,R.length);for(let k=0;k<n;k++)if(o[k]!==R[k])return {ok:false,why:k+': '+o[k]+' ≠ '+R[k],n};return {ok:true,n}};
const humanIdle=()=>S&&!S.over&&!CUR_MODAL&&typeof humanTurn==='function'&&humanTurn()&&(awaiting()||{}).k==='command';

/* ================= A · mid CPU turn ================= */
if(!process.env.ONLY||process.env.ONLY.includes('A')){const {ctx,pg}=await mk();
  out.a0=await pg.evaluate(()=>({on:typeof R102!=='undefined',off:R102_OFF}));ok(out.a0.on&&!out.a0.off,'A0 module on (webdriver off) '+JSON.stringify(out.a0));
  await start(pg,7701,['hero','soldier','venatore','veteranus'].map(c=>({cls:c,cpu:true})),'fast');
  ok(await until(pg,()=>S&&S.turnNo>=6),'A1 the CPUs played some turns');
  await pg.evaluate(()=>{SPEED='pause'});await W0(400);
  const keep=await pg.evaluate(()=>({p:localStorage.getItem('flavius_v102f'),s:localStorage.getItem('flavius_match_auto'),n:R102.n,ms:R102.ms}));
  const P=JSON.parse(keep.p||'null');const SV=JSON.parse(keep.s||'null');out.a1={ptr:P&&{k:P.k,turn:P.turn,slot:P.slot},slot:SV&&SV.r102,writes:keep.n,msEach:+(keep.ms/Math.max(1,keep.n)).toFixed(2),kb:keep.s?Math.round(keep.s.length/1024):0};
  ok(P&&P.slot==='auto'&&SV&&SV.r102&&SV.r102.k==='bt'&&SV.r102.t===P.t,'A2 a turn-start autosave + pointer '+JSON.stringify(out.a1));
  const T=P?P.turn:0;
  /* the uninterrupted run from that point */
  await pg.evaluate(()=>{SPEED='fast'});ok(await until(pg,t=>S.turnNo>=t+4,T),'A3 uninterrupted run went on');await pg.evaluate(()=>{SPEED='pause'});await W0(300);
  const O=await logLines(pg);
  /* back to the saved point, then a refresh */
  await pg.evaluate(k=>{localStorage.setItem('flavius_v102f',k.p);localStorage.setItem('flavius_match_auto',k.s)},keep);await W0(400);
  await pg.reload();await pg.waitForFunction(()=>typeof S!=='undefined'&&S&&S.players&&S.players.length&&!S.over&&S.phase!=='setup',null,{timeout:90000}).catch(dbg(pg,'R1'));
  out.a4=await pg.evaluate(()=>({boot:R102.boot,menu:!document.getElementById('mainMenu').hidden,turn:S.turnNo,setup:!!document.getElementById('setupBody')}));
  ok(out.a4.boot&&!out.a4.menu&&!out.a4.setup,'A4 the refresh went straight back into the match, no main menu '+JSON.stringify(out.a4));
  ok(await until(pg,t=>S.turnNo>=t+4,T),'A5 the resumed match plays on');await pg.evaluate(()=>{SPEED='pause'});await W0(300);
  const R=after(await logLines(pg));const cmp=same(O,R);out.a6=cmp;ok(cmp.ok&&cmp.n>=20,'A6 same log as the uninterrupted run '+JSON.stringify(cmp));
  /* a real refresh while a CPU acts */
  await pg.evaluate(()=>{SPEED='normal'});ok(await until(pg,()=>cur()&&cur().cpu&&S.busy&&S.phase!=='resolve'),'A7 a CPU is acting');
  const P7=await pg.evaluate(()=>JSON.parse(localStorage.getItem('flavius_v102f')));
  await pg.reload();await pg.waitForFunction(()=>typeof S!=='undefined'&&S&&S.players&&S.players.length&&!S.over&&S.phase!=='setup',null,{timeout:90000}).catch(dbg(pg,'R2'));
  out.a8=await pg.evaluate(()=>({turn:S.turnNo,cur:S.cur,menu:!document.getElementById('mainMenu').hidden}));
  ok(P7&&P7.k==='bt'&&out.a8.cur===P7.cur&&!out.a8.menu,'A8 refreshed mid CPU turn: back at that turn '+JSON.stringify({P7:P7&&{k:P7.k,turn:P7.turn,cur:P7.cur},a8:out.a8}));
  ok(await until(pg,t=>S.turnNo>t+1,out.a8.turn),'A9 and it carries on');
  /* the main menu fallback */
  await pg.evaluate(()=>{SPEED='pause';menuShow()});await W0(300);
  out.a10=await pg.evaluate(()=>{const r=document.getElementById('mmRes102');return {row:!!r,txt:r?r.textContent:''}});ok(out.a10.row,'A10 the menu offers ⚔ Back to your match '+JSON.stringify(out.a10));
  await pg.click('#mmRes102 [data-r102="back"]');ok(await until(pg,()=>S&&!S.over&&document.getElementById('mainMenu').hidden&&S.players.length,null,10000),'A11 ⚔ Back resumes the match');
  await pg.evaluate(()=>{SPEED='pause';menuShow()});await W0(300);await pg.click('#mmRes102 [data-r102="forget"]');await W0(200);
  out.a12=await pg.evaluate(()=>({row:!!document.getElementById('mmRes102'),ptr:localStorage.getItem('flavius_v102f'),find:!!r102Find()}));ok(!out.a12.row&&!out.a12.ptr&&!out.a12.find,'A12 ✕ forgets it '+JSON.stringify(out.a12));
  /* kill switch: the old boot */
  await pg.evaluate(()=>{SPEED='fast';menuHide()});await W0(1500);await pg.evaluate(()=>{localStorage.setItem('flavius_v102foff','1')});
  await pg.reload();await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
  out.a13=await pg.evaluate(()=>({off:R102_OFF,live:!!(S&&S.players&&S.players.length&&!S.over&&S.phase!=='setup'),menu:!document.getElementById('mainMenu').hidden}));
  ok(out.a13.off&&!out.a13.live&&out.a13.menu,'A13 kill switch: the main menu as before '+JSON.stringify(out.a13));
  await ctx.close()}

/* ================= B · a human's own move ================= */
if(!process.env.ONLY||process.env.ONLY.includes('B')){const {ctx,pg}=await mk();
  await start(pg,7702,[{cls:'hero',cpu:false},...['soldier','venatore','veteranus'].map(c=>({cls:c,cpu:true}))],'fast');
  const toIdle=async()=>{for(let k=0;k<200;k++){const st=await pg.evaluate(()=>{if(!humanIdle())return '';if(S.phase==='choice'){uiAct('coin',{});return ''}return S.phase==='action'?'ok':''});if(st==='ok')return true;await until(pg,()=>humanIdle(),null,1500)}return false};
  await pg.addScriptTag({content:'window.humanIdle='+humanIdle.toString()});
  ok(await toIdle(),'B1 the human is on his move');await W0(1500);
  const keep=await pg.evaluate(()=>{const p=cur();return {p:localStorage.getItem('flavius_v102f'),s:localStorage.getItem('flavius_match_auto'),sig:[S.turnNo,S.cur,p.r,p.c,p.mv,p.coin,p.cf,RNG.s].join('|')}});
  const SV=JSON.parse(keep.s||'null');ok(SV&&SV.r102&&SV.r102.k==='idle','B2 the human\'s move is autosaved '+JSON.stringify(SV&&SV.r102));
  await pg.evaluate(()=>uiAct('end',{}));ok(await toIdle(),'B3 uninterrupted: back to the human');await pg.evaluate(()=>{SPEED='pause'});
  const O=await logLines(pg);
  await pg.evaluate(k=>{localStorage.setItem('flavius_v102f',k.p);localStorage.setItem('flavius_match_auto',k.s)},keep);await W0(400);
  await pg.reload();await pg.waitForFunction(()=>typeof S!=='undefined'&&S&&S.players&&S.players.length&&!S.over&&S.phase!=='setup',null,{timeout:90000}).catch(dbg(pg,'R3'));
  await pg.addScriptTag({content:'window.humanIdle='+humanIdle.toString()});
  ok(await until(pg,()=>humanIdle(),null,15000),'B4 resumed on the human\'s move');
  out.b5=await pg.evaluate(()=>{const p=cur();return {sig:[S.turnNo,S.cur,p.r,p.c,p.mv,p.coin,p.cf,RNG.s].join('|'),phase:S.phase,menu:!document.getElementById('mainMenu').hidden}});
  ok(out.b5.sig===keep.sig&&!out.b5.menu,'B5 same seat, tile, movement, coin, CF and dice '+JSON.stringify({was:keep.sig,now:out.b5}));
  await pg.evaluate(()=>{SPEED='fast';uiAct('end',{})});ok(await toIdle(),'B6 resumed: back to the human');await pg.evaluate(()=>{SPEED='pause'});
  const cmp=same(O,after(await logLines(pg)));out.b7=cmp;ok(cmp.ok&&cmp.n>=10,'B7 same log after End turn '+JSON.stringify(cmp));
  /* a finished event never resumes */
  await pg.evaluate(()=>{gameOver([cur()],'test')});await W0(1500);
  out.b8=await pg.evaluate(()=>({ptr:localStorage.getItem('flavius_v102f'),mark:!!(matchSlotGet('auto')||{}).r102,find:!!r102Find()}));ok(!out.b8.ptr&&!out.b8.mark&&!out.b8.find,'B8 game over: pointer and marker gone '+JSON.stringify(out.b8));
  await pg.reload();await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
  out.b9=await pg.evaluate(()=>({live:!!(S&&S.players&&S.players.length&&!S.over&&S.phase!=='setup'),menu:!document.getElementById('mainMenu').hidden,row:!!document.getElementById('mmRes102')}));
  ok(!out.b9.live&&out.b9.menu&&!out.b9.row,'B9 a finished event does not resume '+JSON.stringify(out.b9));
  await ctx.close()}

/* ================= C · hot seat ================= */
if(!process.env.ONLY||process.env.ONLY.includes('C')){const {ctx,pg}=await mk();
  await pg.click('#mainMenu [data-mm="multi"]');await W0(300);await pg.click('#mainMenu [data-mm="hotseat"]');await W0(2500);
  const ins=await pg.$$('[data-hsn]');await ins[0].fill('Ann');await ins[1].fill('Bo');await ins[2].fill('Cy');await ins[3].fill('Dee');
  await pg.evaluate(()=>{SETTINGS.briefing=false});await pg.click('#goBtn');
  let live=false;for(let k=0;k<40&&!live;k++){await W0(700);live=await pg.evaluate(()=>{if(S&&S.hotseat&&!CUR_MODAL&&cur()&&!cur().cpu&&(S.phase==='action'||S.phase==='choice')&&(awaiting()||{}).k==='command')return true;
    const bt=[...document.querySelectorAll('#mBtns button')].find(x=>/sand|Continue|OK|Start|Begin|Enter the arena|Ready|I am/i.test(x.textContent));if(bt)bt.click();else if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);return false})}
  ok(live,'C1 the hot-seat table is on a human move');await W0(1500);
  const keep=await pg.evaluate(()=>{const p=cur();return {ptr:JSON.parse(localStorage.getItem('flavius_v102f')||'null'),sv:!!localStorage.getItem('flavius_match_table'),sig:[S.turnNo,S.cur,p.r,p.c,p.mv,RNG.s].join('|')}});
  ok(keep.ptr&&keep.ptr.slot==='table'&&keep.sv,'C2 the table\'s own autosave slot '+JSON.stringify(keep.ptr));
  await pg.reload();await pg.waitForFunction(()=>typeof S!=='undefined'&&S&&S.players&&S.players.length&&!S.over&&S.phase!=='setup',null,{timeout:90000}).catch(dbg(pg,'C'));await W0(800);
  out.c3=await pg.evaluate(()=>{const p=cur();return {hs:!!S.hotseat,cfg:!!CFG.hotseat,sig:[S.turnNo,S.cur,p.r,p.c,p.mv,RNG.s].join('|'),menu:!document.getElementById('mainMenu').hidden}});
  ok(out.c3.hs&&out.c3.cfg&&out.c3.sig===keep.sig&&!out.c3.menu,'C3 the table resumes in hot-seat mode where it was '+JSON.stringify({was:keep.sig,now:out.c3}));
  await ctx.close()}

for(const d of dirs)try{fs.rmSync(d,{recursive:true,force:true})}catch(e){}console.log(JSON.stringify(out));console.log('ERRS',JSON.stringify(errs));console.log('MISS',JSON.stringify(miss));process.exit(errs.length||miss.length?1:0)})();
