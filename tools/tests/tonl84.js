/* online v0.84 through the MOCK (three windows): NAMED ARMOR (a gift rolls one; a controlled Legendary piece built and worn identically in two
   windows, its engine effect — +1 movement — the same on both screens), the holographic card (.holo84, still under body.calm), the WEEKLY
   CHALLENGE card + the weekly playlist card on the landing and the one-gift cap, the "YOUR TURN" title flash when the tab is hidden, RECLAIM
   (inside the window: the seat is human again on every screen; after a rotation: cpugo and reclaim_late; after the time: reclaim_late),
   the turn tallies identical on both screens, a CPU-majority result → a quarter of the rewards, FLAVIUS'S AUCTION (draw, escrow, outbid refund,
   one lead, anti-snipe, settle + history, one win a week, a TEST house refused) and its tab.
   SHOT=<dir> saves screenshots u84_*.png. */
const http=require('http'),fs=require('fs'),path=require('path');const SHOT=process.env.SHOT||'';
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0');
  window.P84=[];const iv=setInterval(()=>{if(typeof NET!=='undefined'&&NET.on){for(const t of ['auction.outbid','auction.won','match.input'])NET.on(t,d=>P84.push({t,d}));clearInterval(iv)}},20)});
const errs=[];const pg=async n=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));await p.goto(URL0,{timeout:90000});return p};
const A=await pg('A');await A.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|report|over|match|tester|clock)/.test(k))localStorage.removeItem(k)});await A.reload({timeout:90000});
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
const shot=async(p,n,w)=>{if(!SHOT)return;for(const vw of w===390?[390]:[1300,390]){await p.setViewportSize({width:vw,height:vw===390?844:900});await p.waitForTimeout(400);await p.screenshot({path:path.join(SHOT,`u84_${n}_${vw}.png`)})}await p.setViewportSize({width:1300,height:900});await p.waitForTimeout(200)};
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});ONL.domus=(await NET.req('domus.create',{name})).domus;
  ONL.char=await NET.req('char.create',{name:name+' the Bold',cls});return {ch:ONL.char.id,dom:ONL.domus.id,acct:ONL.acct.id}},[name,cls]);
const sa=await setup(A,'Vettii','hero'),sb=await setup(B,'Aemilii','soldier'),sc=await setup(C,'Fabii','slave');
const world=(p,fn,arg)=>p.evaluate(([fn,arg])=>{const w=mockLoad();const r=(0,eval)('('+fn+')')(w,arg);mockSave(w);return r},[fn.toString(),arg]);
/* reads poll until the state their check needs is there (3 tests run at once: timers and storage sync stretch); pv returns the last read */
const pv=async(p,fn,pred,arg,ms=30000)=>{const t0=Date.now();let v;for(;;){v=await p.evaluate(fn,arg).catch(()=>null);if((v!=null&&pred(v))||Date.now()-t0>ms)return v;await p.waitForTimeout(200)}};
const err=async(p,fn,arg)=>p.evaluate(async([fn,arg])=>{try{await (0,eval)('('+fn+')')(arg);return 'ok'}catch(e){return (e.code||'')+'|'+e.message}},[fn.toString(),arg]);

/* ── 1 · a gift rolls NAMED ARMOR; a controlled Legendary piece (Mercurii: +1 movement) is brought ── */
await world(A,(w,[cid,did])=>{w.chars[cid].glory=600;w.chars[cid].wallet=5000;w.domus82[did].gifts=[{id:'hgA',why:'test',at:Date.now(),glad:'x'}]},[sa.ch,sa.dom]);
const gift=await A.evaluate(async()=>{const rg=ONLC.rollGift;ONLC.rollGift=function(){rg.apply(this,arguments);return {k:'named',rar:'legendary',kind:'a'}};let g;try{g=await NET.req('gift.open',{gift:'hgA'})}finally{ONLC.rollGift=rg}
  const it=g.char.gear.find(x=>/^na#/.test(x));return {k:g.reward.k,kind:g.reward.piece&&g.reward.piece.kind,to:g.to,it,w:it&&g.char.pcs[ONLC.itemUid(it)].w}});
ok(gift.k==='named'&&gift.kind==='a'&&gift.it&&gift.w&&gift.w.named84,'a gift rolls a named ARMOR piece ('+JSON.stringify({k:gift.k,kind:gift.kind,n:gift.w&&gift.w.n,uq:gift.w&&gift.w.uq})+')');
if(gift.it)await A.evaluate(async([it,id])=>{await NET.req('domus.move',{item:it,from:id,to:'house'})},[gift.it,sa.ch]);
const nk=await world(A,(w,cid)=>{const ch=w.chars[cid];const cat=onlCatalog();let d=null;for(let s=1;s<4000&&!d;s++){let x=s;const rnd=()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296};const a=ONLC.rollNamedArmor(rnd,cat,'legendary',[]);if(a.uq==='mercurialis'&&a.slot==='head')d=a}
  const P=ONLC.namedPiece(d,ch);ONLC.putPiece(ch,P,true);return P.pc.w.key},sa.ch);
/* ── equip points (the mock = the server's rule): ticking the named helm leaves the printed one home ── */
const epm=await A.evaluate(async()=>{const c0=(await NET.req('char.mine',{})).find(c=>c.alive);await NET.req('char.buy',{char:c0.id,item:'galea'});const c=(await NET.req('char.mine',{})).find(x=>x.alive);
  const hel=c.gear.find(x=>/^na#/.test(x)&&(c.pcs[ONLC.itemUid(x)].w||{}).slot==='head');const before=ONLC.equipOf(c).filter(x=>x==='galea'||x===hel).length;
  const r=await NET.req('domus.equip',{char:c.id,item:hel,on:true});const after=ONLC.equipOf(r);return {before,named:after.includes(hel),galea:after.includes('galea')}});
ok(epm.before===1&&epm.named&&!epm.galea,'two helms are never brought together; ticking one unticks the other '+JSON.stringify(epm));
/* ── 2 · the card: holographic (Legendary armor), still under calm ── */
const holo=await A.evaluate(()=>{const ch=(mockLoad().chars[ONL.char.id]);const it=ch.gear.find(x=>/^na#/.test(x));const I=ONL83.piece(ch,it);const h=nw83Card(I,{hist:1});
  const bg=onl83Pop('pv84',`<h3 class="pop83h">A Legendary named armor</h3>${h}<div class="acts"><button class="btn" onclick="this.closest('.pv84').remove()">Close</button></div>`);const el=bg.querySelector('.nw83');
  const an=getComputedStyle(el,'::before').animationName;document.body.classList.add('calm');const an2=getComputedStyle(el,'::before').animationName;document.body.classList.remove('calm');
  return {holo:el.classList.contains('holo84'),na:el.classList.contains('na84'),an,an2,txt:el.textContent.replace(/\s+/g,' ').slice(0,160)}});
ok(holo.holo&&holo.na&&holo.an==='holo84spin'&&holo.an2==='none','the Legendary armor card shimmers (calm: still) '+JSON.stringify(holo));
await A.waitForTimeout(700);await shot(A,'armor_card');await A.evaluate(()=>{for(const x of document.querySelectorAll('.pv84'))x.remove()});

/* ── 3 · the match: the named armor built and worn the same in two windows ── */
const L1=await A.evaluate(async()=>await NET.req('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:false,cry:false,abandon:'cpu'}));await B.evaluate(async id=>await NET.req('lobby.join',{id}),L1.id);
const L1s=await A.evaluate(async id=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},L1.id);await B.evaluate(L=>onlEnter(L),L1s);
const seatB=L1s.players.findIndex(p=>p.id===sb.acct),seatA=L1s.players.findIndex(p=>p.id===sa.acct);
const drive=async p=>{const r=await p.evaluate(()=>{try{if(CUR_MODAL&&(!ONLM.on||onlmMine()||ONLM.info>0)){return document.querySelector('#modal .mbtns .primary')?'#modal .mbtns .primary':document.querySelector('#modal .mbtns button')?'#modal .mbtns button':null}
  if(!S||S.over||!ONLM.on||!onlmMine()||S.busy)return null;if(S.phase==='choice'&&document.querySelector('[data-act="coin"]'))return '[data-act="coin"]';
  if(S.phase==='action'&&document.querySelector('[data-act="end"]'))return '[data-act="end"]'}catch(e){}return null});if(r)await p.click(r,{timeout:2000,force:true}).catch(()=>{});return r};
const both=async()=>{await drive(A);await drive(B)};
const info=async p=>{const r=await p.evaluate(()=>CUR_MODAL&&(!ONLM.on||ONLM.info>0)?(document.querySelector('#modal .mbtns .primary')?'#modal .mbtns .primary':'#modal .mbtns button'):null);if(r)await p.click(r,{timeout:2000,force:true}).catch(()=>{})};
for(const T_=Date.now();Date.now()-T_<60000&&!(await B.evaluate(()=>!!(ONLM.on&&S&&S.onl&&S.players.some(p=>p._na84))));){await both();await B.waitForTimeout(400)}for(const T_=Date.now();Date.now()-T_<30000&&!(await A.evaluate(()=>!!(ONLM.on&&S&&S.onl&&S.players.some(p=>p._na84))));)await A.waitForTimeout(300);await A.waitForTimeout(800);
const look=p=>p.evaluate(([k,sA])=>{const me=S.players[sA];const keep=me.pieces.head;me.pieces.head=keep.filter(pc=>pc.key!==k);const base=mvMax(me);me.pieces.head=keep;
  return {arm:ARM[k]?JSON.stringify(ARM[k]):null,worn:!!me&&Object.values(me.pieces).some(l=>l.some(pc=>pc.key===k)),mv:mvMax(me),want:base+1+(ARM[k]&&ARM[k].swift&&na84Unhurt(me)?1:0)}},[nk,seatA]);
const la=await look(A),lb=await look(B);
ok(la.arm&&la.arm===lb.arm,'ARM[na_…] is the same in both windows');ok(la.worn&&lb.worn,'worn on both screens');ok(la.mv===la.want&&lb.mv===lb.want&&la.mv===lb.mv,'Mercurii: +1 movement on both screens ('+JSON.stringify([la.mv,la.want,lb.mv])+')');
/* ── 4 · YOUR TURN: the title flashes while the tab is hidden ── */
let flash=null;for(const T_=Date.now();Date.now()-T_<40000&&!flash;){for(const p of [A,B]){if(flash)break;const r=await p.evaluate(()=>{if(!onl84Mine())return null;const t0=document.title;
    Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});const hf=document.hasFocus;document.hasFocus=()=>false;ONL84.mineWas=false;ONL84.turnTick();const t1=document.title;
    delete document.hidden;document.hasFocus=hf;onl84FlashOff();return {t0,t1,back:document.title,alerts:ONL84.alerts|0}});if(r)flash=r}if(!flash){await both();await A.waitForTimeout(300)}}
ok(flash&&/^⚔ Your turn/.test(flash.t1)&&flash.back===flash.t0&&flash.alerts>=1,'your turn: the hidden tab’s title flashes, then comes back '+JSON.stringify(flash));
/* ── 5 · RECLAIM inside the window ── */
for(const T_=Date.now();Date.now()-T_<120000&&!(await A.evaluate(s=>!!(ONLM.on&&!S.busy&&(ONLM.pend?ONLM.pend.seat===s:onlmActor()===s)),seatB));){await drive(A);await info(B);await A.waitForTimeout(300)}
await A.evaluate(async([id,seat])=>{await NET.req('match.drop',{id,seat})},[L1.id,seatB]);
for(const T_=Date.now();Date.now()-T_<80000&&!(await B.evaluate(s=>!!(S.players[s].cpu&&S.players[s]._cpu84),seatB));){await drive(A);await info(B);await A.waitForTimeout(300)}
/* the bar is drawn by a 500 ms tick: give it a few ticks */
for(const T_=Date.now();Date.now()-T_<12000&&!(await B.evaluate(()=>!!document.querySelector('#rcl84 [data-rcl84="go"]')));)await B.waitForTimeout(250);
const dr=await B.evaluate(s=>({cpu:S.players[s].cpu,me:ONLM.me,rcl:ONL84.rcl,bar:!!document.querySelector('#rcl84 [data-rcl84="go"]'),dbg:{phase:S.phase,busy:S.busy,cur:cur()&&cur().name,turn:S.turnNo,modal:CUR_MODAL?((document.querySelector('#mTitle')||{}).textContent||'?'):null,info:ONLM.info,next:ONLM.next,q:ONLM.q.slice(0,3).map(x=>x.k+':'+x.seq+':'+x.seat),pend:ONLM.pend&&ONLM.pend.seat,halt:ONL84.halt&&ONL84.halt.seat,rs:ONLM.resyncs}}),seatB);
ok(dr.cpu&&dr.me===-1&&dr.rcl&&dr.bar,'dropped: a CPU holds the seat, the 🔌 bar offers it back '+JSON.stringify(dr));
await shot(B,'reclaim');
await B.click('#rcl84 [data-rcl84="go"]').catch(()=>{});
for(const T_=Date.now();Date.now()-T_<120000&&!(await B.evaluate(s=>ONLM.me===s&&!S.players[s].cpu,seatB));){await drive(A);await drive(B);await A.waitForTimeout(300)}
const rb=await B.evaluate(s=>({me:ONLM.me,cpu:S.players[s].cpu,watch:!!S.onl.watch,live:!!ONL.live}),seatB);const ra=await A.evaluate(s=>({cpu:S.players[s].cpu,own:ONLM.owners[s]}),seatB);
ok(rb.me===seatB&&!rb.cpu&&!rb.watch&&rb.live&&!ra.cpu&&ra.own===sb.acct,'reclaimed inside the window: the seat is human again on both screens '+JSON.stringify({rb,ra}));
for(let i=0;i<12;i++){await both();await A.waitForTimeout(300)}
let ta=await A.evaluate(()=>({t:JSON.stringify(S.players.map(p=>p._t84||null)),h:onlHash(),n:ONLM.next})),tb=await B.evaluate(()=>({t:JSON.stringify(S.players.map(p=>p._t84||null)),h:onlHash(),n:ONLM.next}));
for(const T_=Date.now();Date.now()-T_<20000&&!(ta.n===tb.n&&ta.h===tb.h);){await A.waitForTimeout(300);ta=await A.evaluate(()=>({t:JSON.stringify(S.players.map(p=>p._t84||null)),h:onlHash(),n:ONLM.next}));tb=await B.evaluate(()=>({t:JSON.stringify(S.players.map(p=>p._t84||null)),h:onlHash(),n:ONLM.next}))}
ok(ta.t===tb.t,'the turn tallies (CPU vs human) agree on both screens '+ta.t+' / '+tb.t);const rs=await Promise.all([A,B].map(p=>p.evaluate(()=>ONLM.resyncs|0)));ok(!rs[0]&&!rs[1],'no resync');
/* ── 6 · RECLAIM refused: after the time, and after a rotation (cpugo) ── */
for(const T_=Date.now();Date.now()-T_<120000&&!(await A.evaluate(s=>!!(ONLM.on&&!S.busy&&(ONLM.pend?ONLM.pend.seat===s:onlmActor()===s)),seatB));){await drive(A);await info(B);await A.waitForTimeout(300)}
await A.evaluate(async([id,seat])=>{await NET.req('match.drop',{id,seat})},[L1.id,seatB]);
for(const T_=Date.now();Date.now()-T_<80000&&!(await B.evaluate(s=>!!(S.players[s].cpu&&S.players[s]._cpu84),seatB));){await drive(A);await info(B);await A.waitForTimeout(300)}
const at0=await world(A,(w,[id,acct])=>{const v=w.matches[id].dropAt84[acct];w.matches[id].dropAt84[acct]=v-ONLC.RECLAIM_MS-5000;return v},[L1.id,sb.acct]);
const late1=await err(B,async id=>NET.req('match.reclaim',{id}),L1.id);ok(/^reclaim_late\|/.test(late1),'after 3 minutes: too late ('+late1+')');
await world(A,(w,[id,acct,v])=>{w.matches[id].dropAt84[acct]=v},[L1.id,sb.acct,at0]);
for(const T_=Date.now();Date.now()-T_<120000&&!(await A.evaluate(s=>!!(S.players[s]._cpu84&&S.players[s]._cpu84.res==='cpu'),seatB));){await drive(A);await info(B);await A.waitForTimeout(300)}
const cg=await A.evaluate(s=>({res:S.players[s]._cpu84&&S.players[s]._cpu84.res,go:P84.some(x=>x.t==='match.input'&&x.d.in&&x.d.in.k==='cpugo')}),seatB);
const late2=await err(B,async id=>NET.req('match.reclaim',{id}),L1.id);ok(cg.res==='cpu'&&cg.go&&/^reclaim_late\|/.test(late2),'after a rotation the CPU plays on (cpugo) and the reclaim is refused '+JSON.stringify(cg)+' '+late2);
/* the match ends: Alpha leaves (Custom → a CPU), nobody human is left */
await A.evaluate(async id=>{try{await NET.req('match.abandon',{id})}catch(e){}ONL.leftMatch=ONL.leftMatch||{};ONL.leftMatch[id]=1;ONL84.rcl=null;onl84Bar()},L1.id);await A.waitForTimeout(600);
for(const p of [A,B])await p.evaluate(()=>{try{if(S&&S.onl){S.over=true;ONLM.on=false}ONL.live=null;ONL.watching=null}catch(e){}});
/* the mock world is one localStorage blob: a window still running the old match could overwrite a later write — B starts afresh */
await B.reload({timeout:90000});await B.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});await B.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);try{menuHide()}catch(e){}});

/* ── 7 · the WEEKLY CHALLENGE: the fixture, three challenges, ONE gift a week ── */
await world(A,(w,[a,c])=>{w.chars[a].glory=600;w.chars[c].glory=600},[sa.ch,sc.ch]);
const F=await A.evaluate(async()=>(await NET.req('hello',{all:1})).season84);ok(F&&F.key&&F.ev&&F.loc,'hello carries this week’s fixture '+JSON.stringify(F&&{key:F.key,ev:F.ev,evRaw:F.evRaw,loc:F.loc}));
const fight=async(o)=>{const L=await A.evaluate(async o=>await NET.req('lobby.create',{ev:o.ev,loc:o.loc,seats:4,ranked:!!o.ranked,cry:false}),o);await C.evaluate(async id=>{try{await NET.req('lobby.join',{id})}catch(e){const w=mockLoad();throw new Error(e.message+' '+JSON.stringify(Object.values(w.lobbies).filter(L=>L.status==='live'&&L.players.some(p=>p.id===ONL.acct.id)).map(L=>({id:L.id,ev:L.ev,m:w.matches[L.id]&&{st:w.matches[L.id].status,rep:Object.keys(w.matches[L.id].reports||{})}}))))}},L.id);
  const Ls=await A.evaluate(async id=>await NET.req('lobby.start',{id}),L.id);const ia=Ls.players.findIndex(p=>p.id===sa.acct),ic=Ls.players.findIndex(p=>p.id===sc.acct);
  const t=[0,1,2,3].map(i=>({seat:i,f:5,won:i===ia&&!!o.win,survives:true,...(i===ia&&o.cpuA?{cpu:true}:{}),...(i===ic&&o.cpuC?{cpu:true}:{})}));
  /* the mock world is one localStorage blob shared by the windows: a report lost to a simultaneous write is simply sent again */
  for(let k=0;k<4;k++){for(const p of [A,C])await p.evaluate(async([id,t])=>{await NET.req('match.result',{id,table:t,hash:'w'+id})},[L.id,t]);if(await world(A,(w,id)=>w.matches[id].status==='done',L.id))break}return world(A,(w,[id,a,c])=>{const M=w.matches[id];return [(M.outs||{})[a],(M.outs||{})[c]]},[L.id,sa.acct,sc.acct])};
await fight({ev:F.ev,loc:F.loc,ranked:true,win:true});await fight({ev:'cassian',loc:F.loc===3?4:3});await fight({ev:'egidious',loc:2});await fight({ev:F.ev,loc:F.loc,ranked:true,win:true});
const wk=await A.evaluate(async()=>{const h=await NET.req('hello',{all:1});const g=await NET.req('domus.get',{});return {w:h.week84,gifts:(g.gifts||[]).filter(x=>/^week:/.test(x.why)).length}});
ok(wk.w&&wk.w.win&&wk.w.surv&&wk.w.bouts>=3&&wk.w.done&&wk.gifts===1,'all three challenges done → ONE gift, never two '+JSON.stringify(wk));
const wc=await C.evaluate(async()=>(await NET.req('hello',{all:1})).week84);ok(wc&&wc.bouts>=4&&!wc.gift,'the loser has no gift');
/* ── 8 · CPU-majority result → a quarter of the rewards ── */
const cpu=await fight({ev:'democritus',loc:6,ranked:true,cpuA:true});ok(cpu[0]&&cpu[0].cpu&&Math.abs(cpu[0].factor-0.125)<1e-9&&!(cpu[0].gifts||[]).length&&cpu[1]&&!cpu[1].cpu&&cpu[1].factor===0.5,'a CPU-played seat: ×0.25 on top of the table factor, no gifts '+JSON.stringify({a:cpu[0]&&{f:cpu[0].factor,aw:cpu[0].award,cpu:cpu[0].cpu},c:cpu[1]&&{f:cpu[1].factor,aw:cpu[1].award}}));

/* the landing: the challenge card + the weekly playlist card */
await A.evaluate(async()=>{onlineOpen('play');for(let k=0;k<150&&!document.getElementById('onl');k++)await new Promise(r=>setTimeout(r,200));ONL.tab='play';await onlRefresh();onlRedraw()});await A.waitForTimeout(700);
const land=await pv(A,()=>{const c=document.querySelector('#onl #wk84');const pl=document.querySelector('#onl [data-pl81="week84"]');const pls=document.querySelector('#onl .onl-pls81');
  return {card:c?c.textContent.replace(/\s+/g,' ').trim().slice(0,200):'',ok:c?c.querySelectorAll('.wk84-c.ok').length:0,pl:!!pl,first:!!pls&&pls.firstElementChild===pl,plTxt:pl?pl.textContent.replace(/\s+/g,' ').slice(0,90):'',al:!!document.querySelector('#onl [data-onl84="alerts"]')}},v=>/This week: .+ at /.test(v.card)&&v.ok===3&&v.pl&&v.first);
ok(/This week: .+ at /.test(land.card)&&land.ok===3,'the landing’s challenge card (3 ticks) '+JSON.stringify(land));ok(land.pl&&land.first&&/This week:/.test(land.plTxt),'the weekly playlist card leads the playlists');ok(!land.al,'v0.89: no ⚔🔔 turn-alert button (174-v89onlui; defaults apply)');
await shot(A,'landing');await A.evaluate(()=>{const x=document.querySelector('#onl .a81-pls');if(x)x.scrollIntoView()});await shot(A,'playlists',1300);

/* ── 9 · FLAVIUS'S AUCTION ── */
await world(A,(w,[a,c])=>{w.auc84={};w.aucwin84={};w.chest83=[];const cat=onlCatalog();const mk=(s,r,k)=>{let x=s;const rnd=()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296};const d=k==='a'?ONLC.rollNamedArmor(rnd,cat,r,[]):ONLC.rollNamed(rnd,cat,r,[]);
  const P=ONLC.namedPiece(d,{id:'fallen'+s});P.pc.hist=[{house:'Domus Antiqua',glad:'Old Marcus '+s,when:Date.now()-864e5*2,how:'fell'}];return {item:P.item,pc:P.pc,at:Date.now()}};
  w.chest83.push(mk(11,'legendary','a'),mk(12,'epic','w'),mk(13,'rare','a'));w.chars[a].wallet=20000;w.chars[c].wallet=20000},[sa.ch,sc.ch]);
let al=await A.evaluate(async()=>await NET.req('auction.list',{}));ok(al.lots.length===3&&al.lots.every(l=>l.w&&l.hist.length&&l.min===Math.ceil(l.val/2)),'three lots from the chest, full cards + history, half the value');
const [l1,l2]=al.lots;const r1=await err(B,async l=>NET.req('auction.bid',{lot:l.id,amt:l.min}),l1);ok(/^auc_rank\|/.test(r1),'a Tiro may not bid ('+r1+')');
const w0=await A.evaluate(()=>ONL.char.wallet);const bA=await A.evaluate(async l=>(await NET.req('auction.bid',{lot:l.id,amt:l.min})).char.wallet,l1);ok(bA===20000-l1.min,'escrow: the bid leaves the purse');
const r2=await err(A,async l=>NET.req('auction.bid',{lot:l.id,amt:l.min}),l2);ok(/^auc_lead\|/.test(r2),'one lead at a time ('+r2+')');
const nx=await C.evaluate(l=>ONLC.aucNextMin({bid:{amt:l.min}}),l1);await C.evaluate(async([l,a])=>NET.req('auction.bid',{lot:l.id,amt:a}),[l1,nx]);
const ref=await pv(A,async()=>({w:(await NET.req('char.mine',{})).find(c=>c.alive).wallet,push:P84.filter(x=>x.t==='auction.outbid').length}),v=>v.w===20000&&v.push>=1);ok(ref.w===20000&&ref.push>=1,'outbid: the coin is back at once + a notice '+JSON.stringify(ref));
/* anti-snipe: the clock moves to the last minute; Alpha's bid adds five minutes */
const ends0=await A.evaluate(async()=>(await NET.req('auction.list',{})).lots[0].ends);await A.evaluate(e=>localStorage.setItem('flavius_onlclock84',String(e-60e3-Date.now())),ends0);
const sn=await A.evaluate(async([l,a])=>{const r=await NET.req('auction.bid',{lot:l.id,amt:a});return {ends:r.lot.ends,now:mockT84()}},[l1,await A.evaluate(n=>ONLC.aucNextMin({bid:{amt:n}}),nx)]);
ok(Math.abs(sn.ends-(sn.now+ONLC_SNIPE()))<3000,'a late bid adds five minutes '+JSON.stringify(sn));
function ONLC_SNIPE(){return 300000}
await A.evaluate(()=>{ONL.tab='auction';ONL84.aucAt=0;onlRedraw()});
const tab=await pv(A,()=>({lots:document.querySelectorAll('#onl .au84-lot').length,holo:document.querySelectorAll('#onl .au84-lot .holo84').length,rail:!!document.querySelector('#onl [data-onl="tab"][data-v="auction"].on'),lead:!!document.querySelector('#onl .au84-lot.mine')}),v=>v.lots===3&&v.holo>=2&&v.rail&&v.lead);
ok(tab.lots===3&&tab.holo>=2&&tab.rail&&tab.lead,'the 🔨 Auction tab: lot cards (shimmering), my lead '+JSON.stringify(tab));await shot(A,'auction');
/* the hammer falls (the next sweep): Alpha wins lot 1 with its history; the rest go back to the chest */
await A.evaluate(e=>localStorage.setItem('flavius_onlclock84',String(e+10e3-Date.now())),sn.ends);
al=await C.evaluate(async()=>await NET.req('auction.list',{}));
const won=await pv(A,async it=>{const c=(await NET.req('char.mine',{})).find(x=>x.alive);const g=c.gear.find(x=>ONLC.itemUid(x)===ONLC.itemUid(it));return {g:!!g,how:g&&ONLC.pcOf(c,g).hist.slice(-1)[0].how,old:g&&ONLC.pcOf(c,g).hist[0].glad,push:P84.some(x=>x.t==='auction.won')}},v=>v.g&&v.how==='auction'&&/Old Marcus/.test(v.old)&&v.push,l1.item);
const W=await A.evaluate(()=>{const w=mockLoad();return {chest:(w.chest83||[]).length,lots:Object.values(w.auc84).flatMap(x=>x.lots).filter(l=>l.done).length}});
ok(won.g&&won.how==='auction'&&/Old Marcus/.test(won.old)&&won.push,'the winner gets the piece, its history + an auction line '+JSON.stringify(won));ok(W.chest>=2,'the unsold go back to the chest '+JSON.stringify(W));
/* one win a house a week; a TEST house may not bid */
const key=await A.evaluate(()=>ONLC.seasonAt(mockT84()-2e6).key);
await world(A,(w,k)=>{const L=w.auc84[k]||(w.auc84[k]={lots:[]});L.lots.push({id:k+'#9',key:k,n:9,item:'nw#zz.9',pc:{st:'whole',rar:'rare',w:{key:'nw_zz.9',n:'Gladius Testus',base:'gladius',rar:'rare',p:2,r:1,aff:[],named83:1},hist:[]},val:3000,min:1500,opens:mockT84(),ends:mockT84()+3600e3,bid:null,bids:[],done:false})},key);
const r3=await err(A,async k=>NET.req('auction.bid',{lot:k+'#9',amt:1500}),key);ok(/^auc_won\|/.test(r3),'one win a house a week ('+r3+')');
await C.evaluate(()=>localStorage.setItem('flavius_onltester83','1'));const gr=await err(C,async()=>NET.req('admin.grant',{coin:1}));ok(gr==='ok','tester grant ('+gr+')');await C.evaluate(()=>localStorage.removeItem('flavius_onltester83'));
const r4=await err(C,async k=>NET.req('auction.bid',{lot:k+'#9',amt:1500}),key);ok(/^testHouse\|/.test(r4),'a TEST house may not bid ('+r4+')');
await A.evaluate(()=>localStorage.removeItem('flavius_onlclock84'));

console.log(JSON.stringify({gift,holo:{holo:holo.holo,an:holo.an,an2:holo.an2},la:{mv:la.mv,worn:la.worn},flash,dr:{cpu:dr.cpu,bar:dr.bar},rb,ra,t84:ta.t,late1,late2,wk,land,cpu:cpu.map(o=>o&&{f:o.factor,aw:o.award}),tab,won}));
console.log('MISS',miss);console.log('ERRS',errs);await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();
