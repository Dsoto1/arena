/* online v0.89 (171-v89onl, mock): ROOMS WHEN LANISTAS GO — three windows in one waiting room with the Online window open; a member's
   window dies without a word (the grace runs out: marked "reconnecting…", then out, found by the room screens' lobby.get); the host
   closes the Online window → lobby.leave at once → the room passes to the other lanista, seated. Then MANAGE ONLINE — two windows in a
   live Classic: an off-turn ⇄ swap on one is an order in the stream, carried out on both screens at that gladiator's next turn, with
   equal hashes. Grace/drop/ping shortened by localStorage flavius_onltest89 (read by the mock and the room ping only). */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
const errs=[];const miss=[];const out={};
const mkCtx=async(test)=>{const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(t=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0');
    if(t)localStorage.setItem('flavius_onltest89',JSON.stringify(t));else localStorage.removeItem('flavius_onltest89');
    window.__req={};window.addEventListener('DOMContentLoaded',()=>{const i=setInterval(()=>{if(typeof NET==='undefined')return;clearInterval(i);const base=NET.req;NET.req=function(k){window.__req[k]=(window.__req[k]||0)+1;return base.apply(this,arguments)}},20)})},test||null);return ctx};
const open=async(ctx,n,first)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));await p.goto(URL0);if(first)await p.evaluate(()=>localStorage.removeItem('flavius_onlmock'));await p.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});return p};
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls});return ONL.acct.id},[name,cls]);
const join=async(p,id)=>{for(let k=0;k<8;k++){const ok=await p.evaluate(async id=>{try{await NET.req('lobby.join',{id})}catch(e){}await new Promise(r=>setTimeout(r,300));
  return (await NET.req('lobby.list')).some(L=>L.id===id&&(L.members||[]).some(x=>x.id===ONL.acct.id))},id);if(ok)return true;await p.waitForTimeout(400)}return false};
const until=async(p,fn,arg,ms=20000)=>{for(let t0=Date.now();Date.now()-t0<ms;){if(await p.evaluate(fn,arg))return true;await p.waitForTimeout(150)}return false};

/* ======== 1. rooms when lanistas go ======== */
/* the reconnecting… mark lives from drop to drop+grace: 1.5 s was shorter than one poll round under load (A sees it through the room
   ping), and a loaded live window could itself pass the 2.5 s drop — 5 s / 6 s keep the same sequence (marked, then out) */
{const ctx=await mkCtx({grace:6000,drop:5000,ping:600});const A=await open(ctx,'A',true),B=await open(ctx,'B'),C=await open(ctx,'C');
  const ids={A:await setup(A,'Alpha','hero'),B:await setup(B,'Beta','soldier'),C:await setup(C,'Gamma','amazonia')};
  const L=await A.evaluate(async()=>await NET.req('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:false,cry:false}));
  await join(B,L.id);await join(C,L.id);
  for(const p of [A,B,C]){await p.evaluate(()=>{onlineOpen('lobby')});await p.waitForSelector('#onl #onlRoom80',{timeout:15000}).catch(()=>{})}
  out.members0=await A.evaluate(id=>(mockLoad().lobbies[id].members||[]).length,L.id);
  /* Gamma's window dies without a word (no pagehide leave) */
  await C.evaluate(()=>{ONL89.noLeave=true});await C.close();
  out.marked=await until(A,([id,c])=>{const R=(ONL.lobbies||[]).find(x=>x.id===id);return !!(R&&R.off&&R.off[c])&&!!document.querySelector('#onlRoom80 .off89 .r89-rc')},[L.id,ids.C],40000);
  out.cOut=await until(A,([id,c])=>{const R=(ONL.lobbies||[]).find(x=>x.id===id);return !!R&&!(R.members||[]).some(m=>m.id===c)&&!document.querySelector('#onlRoom80 .off89')},[L.id,ids.C],40000);
  out.cOutWorld=await A.evaluate(([id,c])=>{const R=mockLoad().lobbies[id];return {status:R.status,members:(R.members||[]).map(m=>m.id),c:(R.members||[]).some(m=>m.id===c),host:R.host.id}},[L.id,ids.C]);
  out.pings=await A.evaluate(()=>window.__req['lobby.get']||0);
  /* the host closes the Online window: lobby.leave at once, the room passes to Beta (seated) */
  await A.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done('close')});
  out.passed=await until(B,([id,a])=>{const R=(ONL.lobbies||[]).find(x=>x.id===id);return !!R&&R.host.id===ONL.acct.id&&R.players.some(p=>p.id===ONL.acct.id)&&!(R.members||[]).some(m=>m.id===a)},[L.id,ids.A],30000);
  out.leaveReq=await A.evaluate(()=>window.__req['lobby.leave']||0);
  out.bHosts=await B.evaluate(()=>!!document.querySelector('#onlRoom80 [data-onl="start"]'));
  /* Beta's tab goes (pagehide): the room empties and closes at once */
  await B.close({runBeforeUnload:false});await until(A,id=>{const R=mockLoad().lobbies[id];return !R||R.status==='done'},L.id,20000);
  out.closed=await A.evaluate(id=>{const R=mockLoad().lobbies[id];return R?R.status:'gone'},L.id);
  if(out.members0!==3)miss.push('three in the room');if(!out.marked)miss.push('reconnecting… shown on the other screen');if(!out.cOut||out.cOutWorld.c)miss.push('the dropped member is out after the grace');
  if(out.cOutWorld.host!==ids.A)miss.push('a member drop keeps the host');if(!(out.pings>0))miss.push('the room screen pings lobby.get');
  if(!out.passed)miss.push('host closes Online → the room passes on');if(!(out.leaveReq>0))miss.push('lobby.leave sent on close');if(!out.bHosts)miss.push('the new host sees Start');
  if(out.closed!=='done')miss.push('the last lanista closing the tab closes the room');
  await ctx.close()}

/* ======== 2. Manage online: an off-turn swap ======== */
{const ctx=await mkCtx(null);const D=await open(ctx,'D',true),E=await open(ctx,'E');
  await setup(D,'Delta','hero');await setup(E,'Epsilon','soldier');
  const L=await D.evaluate(async()=>await NET.req('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:false,abandon:'cpu',cry:false}));await join(E,L.id);
  await until(D,id=>ONLC.humansOf(mockLoad().lobbies[id]||{}).length>=2,L.id);
  const L2=await D.evaluate(async id=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},L.id);await E.evaluate(L=>onlEnter(L),L2);
  const drive=async p=>{const r=await p.evaluate(()=>{if(CUR_MODAL&&(!ONLM.on||onlmMine()||ONLM.info>0||(onlmOwner()===ONLM.me&&!ONLM.pend))){const pb=document.querySelector('#modal .mbtns .primary')?'#modal .mbtns .primary':document.querySelector('#modal .mbtns button')?'#modal .mbtns button':null;return pb?['sel',pb]:['','']}
    if(!S||S.over||!ONLM.on||!onlmMine()||S.busy)return ['',''];
    if(S.phase==='choice'&&document.querySelector('[data-act="coin"]'))return ['sel','[data-act="coin"]'];
    if(S.phase==='action'&&document.querySelector('[data-act="end"]'))return ['sel','[data-act="end"]'];return ['','']});
    if(r[0]==='sel')await p.click(r[1],{timeout:2000,force:true}).catch(()=>{})};
  const both=[D,E];const step=async()=>{for(const p of both)await drive(p);await D.waitForTimeout(150)};
  for(let t0=Date.now();Date.now()-t0<90000;){const ok=await Promise.all(both.map(p=>p.evaluate(id=>!!(ONLM.on&&S&&S.onl&&S.onl.lobby===id),L.id)));if(ok.every(Boolean))break;await step()}
  for(const p of both)await p.evaluate(()=>{try{setSpeedUI('fast')}catch(e){}});
  /* wait for Delta's off-turn moment (not his turn, nobody attacking him) with a weapon in a hand */
  let ord=null;for(let t0=Date.now();Date.now()-t0<120000&&!ord;){await step();
    ord=await D.evaluate(()=>{const p=g89Me();if(!p||!onlmOn()||S.busy||cur()===p||!gear88Ok(p)||armsAttached(p).length!==2||!(p.wR||p.wL))return null;
      const bar=gear88Bar(p);const r={seat:ONLM.me,wR:p.wR&&p.wR.key,wL:p.wL&&p.wL.key,turn:S.turnNo,bar:/data-gear89="swap"/.test(bar)};g89Send({op:'swap'});r.queued=/carried out as your turn begins/.test(gear88Bar(p));return r})}
  out.ord=ord;
  /* both screens carry it out at Delta's next turn */
  const swapped=p=>p.evaluate(o=>{const q=S.players[o.seat];return !!q&&(q.wR&&q.wR.key)===o.wL&&(q.wL&&q.wL.key)===o.wR},ord||{seat:0});
  let done=false;for(let t0=Date.now();ord&&Date.now()-t0<150000;){await step();if(await swapped(D)&&await swapped(E)){done=true;break}if(await D.evaluate(()=>!S||S.over))break}
  out.done=done;
  out.filed=await E.evaluate(o=>!!(S.gear89&&Array.isArray(S.gear89[o.seat])),ord||{seat:0});
  out.atTurn=await D.evaluate(o=>{const lis=[...document.querySelectorAll('#log > li')].map(l=>l.textContent);return lis.some(t=>/swaps hands/.test(t))},ord||{seat:0});
  /* a few more moves, then the same seq on both screens: equal hashes */
  const next0=await D.evaluate(()=>ONLM.next);for(let t0=Date.now();Date.now()-t0<40000;){await step();if((await D.evaluate(()=>ONLM.next))>=next0+3)break;if(await D.evaluate(()=>!S||S.over))break}
  for(let t1=Date.now();Date.now()-t1<20000;){const ns=await Promise.all(both.map(p=>p.evaluate(()=>[ONLM.next,S.busy,!!CUR_MODAL,ONLM.q.length])));if(ns[0][0]===ns[1][0]&&!ns[0][1]&&!ns[1][1]&&!ns[0][3]&&!ns[1][3])break;await D.waitForTimeout(200)}
  const hD=await D.evaluate(()=>ONLM.hlog),hE=await E.evaluate(()=>ONLM.hlog);let same=0,diff=0;for(const k of Object.keys(hD))if(/^s\d+$/.test(k)&&hE[k]){if(hD[k]===hE[k])same++;else diff++}
  out.same=same;out.diff=diff;out.resyncs=[await D.evaluate(()=>ONLM.resyncs),await E.evaluate(()=>ONLM.resyncs)];
  out.hash=[await D.evaluate(()=>[ONLM.next,onlHash()]),await E.evaluate(()=>[ONLM.next,onlHash()])];
  if(!ord)miss.push('an off-turn moment for Delta');else{if(!ord.bar)miss.push('the online bar offers ⇄ Swap');if(!ord.queued)miss.push('the bar shows the queued order')}
  if(!out.done)miss.push('the swap carried out on both screens');if(!out.filed)miss.push('the order filed in S.gear89');if(!out.atTurn)miss.push('the log names the swap');
  if(out.diff||out.same<3)miss.push('equal hashes on both screens');if(out.resyncs.some(x=>x>0))miss.push('no resync needed');
  if(out.hash[0][0]===out.hash[1][0]&&out.hash[0][1]!==out.hash[1][1])miss.push('same state at the same seq');
  await ctx.close()}
console.log(JSON.stringify(out));console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();srv.close();if(miss.length||errs.length)process.exit(1)})();
