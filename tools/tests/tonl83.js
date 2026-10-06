/* online v0.83, the server half through the MOCK (three windows): 8 ranks, the start countdown (Start → startAt → the horns; ✕ Hold),
   armory offerings (bought, brought ≤2, in the hand at the start, the used one gone, the unused one back), a GENERATED NAMED WEAPON from a
   gift built identically in two windows (W entry, the weapon in hand, the same hash), the result rows' brk/off/ks/kb from the engine,
   a Ranked match settled by agreement: the treasury's cut, a broken piece + its repair, the killer's loot pick (history kept), the rest in the
   used market (bought by a third lanista), trophies + recent matches, ★ follow (hello.follows), the house profile, the wagers tab. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','1500');
  window.P83=[];const iv=setInterval(()=>{if(typeof NET!=='undefined'&&NET.on){for(const t of ['loot.offer','loot.done','lobby.update'])NET.on(t,d=>P83.push({t,d}));clearInterval(iv)}},20)});
const errs=[];const pg=async n=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));await p.goto(URL0,{timeout:90000});return p};
const A=await pg('A');await A.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|report|over|match)/.test(k))localStorage.removeItem(k)});await A.reload({timeout:90000});
const B=await pg('B'),C=await pg('C');for(const P of [A,B,C])await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
/* HAND-OFF: the mock world is ONE localStorage item that every window reads, changes and writes back; a window whose copy is still
   behind (cross-window storage lags under load) would undo the last window's write (a lost house, a lost room). Before a window acts
   after another one did, it waits (≤15 s) until it holds that window's copy. */
const HAND={last:null,on:true};const handOff=pages=>{for(const p of pages){const ev=p.evaluate.bind(p);p.__ev=ev;p.evaluate=async(...a)=>{const L=HAND.last;
  if(HAND.on&&L&&L!==p&&!L.isClosed()){for(const t0=Date.now();Date.now()-t0<15000;){const v=await L.__ev(()=>localStorage.getItem('flavius_onlmock')).catch(()=>null);
    if(v==null||await ev(v=>localStorage.getItem('flavius_onlmock')===v,v).catch(()=>true))break;await p.waitForTimeout(100)}}
  const r=await ev(...a);HAND.last=p;return r}}};
handOff([A,B,C]);
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
const err=async(p,fn,arg)=>p.evaluate(async([fn,arg])=>{try{await (0,eval)('('+fn+')')(arg);return 'ok'}catch(e){return (e.code||'')+'|'+e.message}},[fn.toString(),arg]);
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});ONL.domus=(await NET.req('domus.create',{name:'Domus '+name})).domus;
  ONL.char=await NET.req('char.create',{name:name+' the Bold',cls});return ONL.char.id},[name,cls]);
const ca=await setup(A,'Alpha','hero'),cb=await setup(B,'Beta','soldier'),cc=await setup(C,'Gamma','slave');
const world=(p,fn,arg)=>p.evaluate(([fn,arg])=>{const w=mockLoad();const r=(0,eval)('('+fn+')')(w,arg);mockSave(w);return r},[fn.toString(),arg]);

/* ── 1. eight ranks ── */
const rk=await A.evaluate(async()=>({n:ONLC.RANKS.length,keys:Object.keys((await NET.req('hello',{all:1})).rankCounts||{}),vet:ONLC.rankIdx('veteranus')}));
ok(rk.n===8&&rk.keys.length===8&&rk.vet===3,'eight ranks, counted');
/* ── 2. offerings + a gift: a named weapon for a Veteranus ── */
await world(A,(w,id)=>{Object.assign(w.chars[id],{wallet:500,glory:600,gifts:[{id:id+':rank:veteranus',why:'rank:veteranus',at:Date.now()}]})},ca);
const of=await A.evaluate(async id=>{await NET.req('offer.buy',{char:id,key:'elix2'});await NET.req('offer.buy',{char:id,key:'cf1'});await NET.req('offer.buy',{char:id,key:'ap3'});const c=await NET.req('offer.bring',{char:id,keys:['elix2','cf1']});return {offers:c.offers,eq:c.offerEq,wallet:(()=>{const w=mockLoad();return (w.domus82[w.chars[id].domus]||{}).treasury|0})()}},ca); /* v0.92: the treasury pays */
ok(of.offers.length===3&&of.eq.join()==='elix2,cf1'&&of.wallet===500-40-40-120,'offerings bought, two chosen to bring');
const gift=await A.evaluate(async id=>{const r=Math.random;Math.random=()=>0.995;let g;try{g=await NET.req('gift.open',{char:id,gift:id+':rank:veteranus'})}finally{Math.random=r}
  const it=g.char.gear.find(x=>/^nw#/.test(x));return {k:g.reward.k,rar:g.reward.rar,to:g.to,it,w:it&&g.char.pcs[ONLC.itemUid(it)].w,eq:ONLC.equipOf(g.char).includes(it)}},ca);
ok(gift.k==='named'&&gift.rar==='legendary'&&gift.to==='glad'&&gift.w&&gift.w.uq&&gift.eq,'a Legendary named weapon from Flavius’s gift, brought by a Veteranus');
const nwKey=gift.w&&gift.w.key;
/* ── 3. the countdown + the named weapon built the same in two windows (Custom) ── */
const L1=await A.evaluate(async()=>await NET.req('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:false,cry:false}));await B.evaluate(async id=>await NET.req('lobby.join',{id}),L1.id);
const t0=Date.now();const L1s=await A.evaluate(async id=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},L1.id);const waited=Date.now()-t0;
ok(L1s.status==='live'&&waited>=900,'Start waits for the countdown, then the horns ('+waited+' ms)');ok(await A.evaluate(()=>P83.some(x=>x.t==='lobby.update')),'the room heard it');
await B.evaluate(L=>{onlEnter(L)},L1s);const dismiss=p=>p.evaluate(()=>{if(CUR_MODAL&&(!ONLM.on||onlmMine()||ONLM.info>0)){const b=document.querySelector('#modal .mbtns .primary')||document.querySelector('#modal .mbtns button');if(b)b.click()}});
for(const T_=Date.now();Date.now()-T_<78000&&!(await B.evaluate(()=>!!(ONLM.on&&S&&S.onl&&S.players.some(p=>p._nw83))));){await dismiss(A);await dismiss(B);await B.waitForTimeout(500)}await A.waitForTimeout(1500);
const look=async p=>p.evaluate(k=>{const me=S.players.find(x=>x._nw83);const hand=me?['R','L'].map(a=>me['w'+a]).filter(Boolean).find(w=>w.key===k):null;
  return {w:W[k]?JSON.stringify(W[k]):null,hand:hand?JSON.stringify({p:hand.p,r:hand.r,n:hand.n,uq:hand.uq}):null,items:me?me.items.filter(i=>i.kind==='offer').map(i=>i.key).sort():[],h:onlHash(),turn:S.turnNo,next:ONLM.next}},nwKey);
const la=await look(A),lb=await look(B);
ok(la.w&&la.w===lb.w,'the named weapon’s W entry is the same in both windows');ok(la.hand&&la.hand===lb.hand,'in hand on both screens');
ok(la.items.join()==='cf1,elix2'&&lb.items.join()==='cf1,elix2','the brought offerings are in the hand');
let same=la.h===lb.h;for(const T_=Date.now();Date.now()-T_<39000&&!same;){await A.waitForTimeout(400);const [x,y]=[await look(A),await look(B)];same=x.h===y.h&&x.next===y.next}
const rs=await Promise.all([A,B].map(p=>p.evaluate(()=>ONLM.resyncs|0)));ok(same&&!rs[0]&&!rs[1],'the same arena on both screens, no resync ('+la.h+' / '+lb.h+')');
/* the engine fills the result row: the weapon gone from the hand → brk; the cf offering used → off keeps elix2 */
const row=await A.evaluate(async k=>{const me=S.players.find(x=>x._nw83);const keep={R:me.wR,L:me.wL,items:me.items.slice()};for(const a of ['R','L'])if(me['w'+a]&&me['w'+a].key===k)me['w'+a]=null;
  const cf0=me.cf;await useItem(me,me.items.find(i=>i.key==='cf1'));const r=onlRow81(S,me,[]);const cf=me.cf-cf0;me.wR=keep.R;me.wL=keep.L;me.items=keep.items;me.cf=cf0;return {...r,cf}},nwKey);
ok(row.brk&&row.brk.includes(nwKey)&&row.off.join()==='elix2'&&row.cf===1&&row.ks===-1&&row.kb==='','result rows: brk / off / ks / kb ('+JSON.stringify(row)+')');
const t1=[0,1,2,3].map(i=>({seat:i,won:i===0,place:i?2:1,f:i?4:12,survives:true,off:i===0?['elix2']:[]}));
for(const p of [A,B])await p.evaluate(async([id,t])=>{await NET.req('match.result',{id,table:t,hash:'c1'})},[L1.id,t1]);
const back=await A.evaluate(async()=>(await NET.req('char.mine',{})).find(c=>c.alive).offers.sort().join());ok(back==='ap3,elix2','Custom: the unused offering came back, the used one is gone');
/* ── 4. Ranked: Beta kills Gamma; the countdown again; Alpha wagers ── */
await world(B,(w,id)=>{w.chars[id].wallet=400},cb);await world(C,(w,id)=>{w.chars[id].wallet=400},cc);
await B.evaluate(async id=>{await NET.req('char.buy',{char:id,item:'cassis'});await NET.req('char.buy',{char:id,item:'gladius'})},cb);
await C.evaluate(async id=>{await NET.req('char.buy',{char:id,item:'mace'});await NET.req('char.buy',{char:id,item:'galea'})},cc);
const L2=await B.evaluate(async()=>await NET.req('lobby.create',{ev:'cassian',loc:3,seats:4,ranked:true,cry:false}));await C.evaluate(async id=>await NET.req('lobby.join',{id}),L2.id);
const held=await B.evaluate(async id=>{const p=NET.req('lobby.start',{id});await new Promise(r=>setTimeout(r,500));await ONL83.hold(id);try{await p;return 'started'}catch(e){return e.code||e.message}},L2.id);
ok(held==='count_stopped','✕ Hold stops the countdown ('+held+')');
await A.evaluate(async id=>{await NET.req('bet.place',{id,seat:0,amt:20})},L2.id);
const wl0=await A.evaluate(async()=>await NET.req('wager.list',{}));const op=wl0.open.find(x=>x.id===L2.id);ok(op&&op.pool===20&&op.seats[0].stake===20&&wl0.mine[0].res==='open','the wagers tab: open pot, odds, my open bet');
const L2s=await B.evaluate(async id=>await NET.req('lobby.start',{id}),L2.id);const sb=L2s.players.findIndex(p=>p.char===cb),sc=L2s.players.findIndex(p=>p.char===cc);
const t2=[0,1,2,3].map(i=>i===sb?{seat:i,won:true,place:1,f:30,survives:true,brk:['cassis']}:i===sc?{seat:i,won:false,place:4,f:2,survives:false,ks:sb,kb:'g'}:{seat:i,won:false,place:2,f:6,survives:true});
await B.evaluate(async([id,t])=>{await NET.req('match.result',{id,table:t,hash:'r2'})},[L2.id,t2]);await C.evaluate(async([id,t])=>{await NET.req('match.result',{id,table:t,hash:'r2'})},[L2.id,t2]);await B.waitForTimeout(600);
const bs=await B.evaluate(async()=>{const g=await NET.req('domus.get',{});const c=(await NET.req('char.mine',{})).find(x=>x.alive);const gone=!c.gear.some(x=>ONLC.itemBase(x)==='cassis');/* v0.91: a printed piece lost in Ranked is used up; a broken one is set up to test repairs */const w=mockLoad();const cw=w.chars[c.id];ONLC.putPiece(cw,{item:'cassis',pc:null},false);const br=ONLC.breakItem(cw,'cassis');mockSave(w);return {treasury:g.domus.treasury,trophies:g.trophies.map(t=>t.k),recent:g.recent.length,br,gone,broken:!!br&&ONLC.isBroken(cw,br),offer:P83.filter(x=>x.t==='loot.offer').map(x=>x.d)}});
ok(bs.treasury>0,'the lanista’s cut in the treasury ('+bs.treasury+')');ok(bs.gone,'v0.91: the lost helm was used up (printed gear)');ok(bs.broken,'a broken piece to mend');ok(bs.trophies.includes('first:cassian')&&bs.recent>=1,'trophies + recent matches');
const lo=bs.offer[0];ok(lo&&lo.pieces.length===2&&lo.dead.name==='Gamma the Bold','the killer’s loot window');
const pick=await B.evaluate(async([id,seat,item])=>await NET.req('loot.pick',{id,seat,item}),[L2.id,sc,lo&&lo.pieces.find(p=>/^galea/.test(p.item)).item]);
const bc=await B.evaluate(async()=>{const c=(await NET.req('char.mine',{})).find(x=>x.alive);const gi=c.gear.find(x=>/^galea#/.test(x));return {gi,glad:gi&&ONLC.pcOf(c,gi).hist[0].glad}});
ok(pick.to==='glad'&&bc.gi&&bc.glad==='Gamma the Bold','the pick, with its owner history');
/* repair from the treasury */
await world(B,(w,id)=>{const o=w.chars[id].owner;for(const c of Object.values(w.chars))if(c.owner===o)c.wallet=0;w.domus82[w.accounts[o].domus].treasury=0},cb); /* v0.92: an empty treasury (purses move into it) */
const rep=await err(B,async it=>NET.req('gear.repair',{holder:ONL.char.id,item:it,pay:'treasury'}),bs.br);ok(/^no_coin\|/.test(rep),'the treasury cannot pay yet');
await world(B,(w,id)=>{const A=w.accounts[w.chars[id].owner];w.domus82[A.domus].treasury=200},cb);
const rp=await B.evaluate(async it=>{const r=await NET.req('gear.repair',{holder:ONL.char.id,item:it,pay:'treasury'});return {cost:r.cost,want:ONLC.repairCost(ONLC.pieceInfo({item:'cassis'},onlCatalog())),broken:ONLC.isBroken(r.holder,it),t:r.domus.treasury}},bs.br);
ok(rp.cost===rp.want&&rp.cost===55&&!rp.broken&&rp.t===200-rp.cost,'repaired for a third of its price');
/* the used market */
const mk=await C.evaluate(async()=>(await NET.req('market.list',{})).used);ok(mk.length===1&&/^mace#/.test(mk[0].item)&&mk[0].hist[0].how==='fell','the rest goes to the market with its history');
await world(A,(w,id)=>{w.chars[id].wallet+=100},ca);const buy=await A.evaluate(async([id,mid])=>(await NET.req('market.buy',{char:id,id:mid})).char.gear.some(x=>/^mace#/.test(x)),[ca,mk[0]&&mk[0].id]);ok(buy,'a third lanista buys it');
/* the wagers tab after the match */
const wl1=await A.evaluate(async()=>await NET.req('wager.list',{}));ok(wl1.mine[0].res==='won'&&wl1.top.length>=1,'my bet settled; the week’s best bettors');
/* ── 5. follow + profile ── */
const dB=await B.evaluate(()=>ONL.domus.id);const fw=await A.evaluate(async id=>(await NET.req('domus.follow',{id})).follows,dB);ok(fw.length===1&&fw[0].st!=='off','★ follow');
const hf=await A.evaluate(async()=>(await NET.req('hello',{all:1})).follows);ok(hf&&hf[0].id===dB,'hello lists the followed houses');
const pf=await C.evaluate(async()=>await NET.req('domus.profile',{name:'Domus Beta'}));ok(pf.domus.trophies.length>=1&&pf.glads.length===1&&pf.link==='#domus='+dB,'the house profile');
console.log(JSON.stringify({rk,of,gift:{k:gift.k,rar:gift.rar,to:gift.to,n:gift.w&&gift.w.n,uq:gift.w&&gift.w.uq},waited,la:{w:!!la.w,hand:la.hand,items:la.items,h:la.h},lb:{h:lb.h},row,back,held,bs:{t:bs.treasury,tr:bs.trophies,broken:bs.broken},pick:pick.to,rp,buy}));
console.log('MISS',miss);console.log('ERRS',errs);await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();
