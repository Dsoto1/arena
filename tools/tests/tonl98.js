/* online v0.98 part E (250-v98onl + the v0.98 section of 111-onlcore; mock, four windows):
   1 · 🔒 a Custom room's password: the host sets it in the table settings; the list row wears 🔒; joining asks (wrong → asked again, right → in);
       the mock keeps only a salted hash; a Ranked room has no password field.
   2 · the region flag (the browser's time zone → Europe) in the list and the room; the Region filter hides / shows the row.
   3 · the house card from a lanista's name (list + room): record, gladiators, best rank, last events, 🏛 Visit house opens their Domus.
   4 · the Domus rank: a banner chip beside house names in the room and the list; the big banner above the Domus Glory bar; never drops.
   6 · the two event squares under the playlists (Custom only, no Ranked buttons); ⚔ Play opens a Custom room for that event;
       LUDUS and GOLDEN EAGLE each START and PLAY online with two lanistas in lockstep (inputs, same hashes, no resync).
   7 · the Domus class picker greys Damnatio.   9 · 👤 Profile & Settings: header card + two columns (one on a phone), the flash and horn switches.
   SHOT=<dir> saves the screenshots (tools/plans/onl98/). ERRS must be []. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);const SHOT=process.env.SHOT||'';
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:900},timezoneId:'Europe/Rome'});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0');localStorage.removeItem('flavius_onlquiet80');localStorage.removeItem('flavius_onllb96')});
const errs=[];const P={};for(const n of ['A','B','C','D']){P[n]=await ctx.newPage();P[n].on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]))}
await P.A.goto(URL0,{timeout:90000});await P.A.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|match|report|over|rid)/.test(k))localStorage.removeItem(k)});
for(const n of ['B','C','D'])await P[n].goto(URL0,{timeout:90000});for(const n of ['A','B','C','D'])await P[n].waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
/* HAND-OFF (as tonl78): the mock world is one localStorage item; a window waits until it holds the last writer's copy before it acts */
const HAND={last:null,on:true};for(const p of Object.values(P)){const ev=p.evaluate.bind(p);p.__ev=ev;p.evaluate=async(...a)=>{const L=HAND.last;
  if(HAND.on&&L&&L!==p&&!L.isClosed()){for(const t0=Date.now();Date.now()-t0<15000;){const v=await L.__ev(()=>localStorage.getItem('flavius_onlmock')).catch(()=>null);
    if(v==null||await ev(v=>localStorage.getItem('flavius_onlmock')===v,v).catch(()=>true))break;await p.waitForTimeout(100)}}
  const r=await ev(...a);HAND.last=p;return r}}
const {A,B,C,D}=P;const wait=ms=>A.waitForTimeout(ms);const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const out={};
const shot=async(p,n)=>{if(SHOT){fs.mkdirSync(SHOT,{recursive:true});await p.screenshot({path:path.join(SHOT,n)})}};
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls})},[name,cls]);
await setup(A,'Alpha','hero');await setup(B,'Beta','slave');await setup(C,'Gamma','soldier');await setup(D,'Delta','amazonia');
const until=async(p,fn,arg,ms=20000)=>{const t0=Date.now();let v;while(Date.now()-t0<ms){v=await p.evaluate(fn,arg).catch(()=>null);if(v)return v;await p.waitForTimeout(200)}return v};
const click=async(p,sel)=>{await p.waitForSelector(sel,{timeout:20000});await p.click(sel);await p.waitForTimeout(400)};
const ids={};for(const [n,p] of Object.entries(P))ids[n]=await p.evaluate(()=>ONL.acct.id);
/* A's house earns a Domus rank: glory on his gladiator + a fallen one (living 700 + 20% of 1000 = 900 → Ludus Minor) */
await A.evaluate(id=>{const w=mockLoad();const c=w.chars[ONL.char.id];c.glory=700;const f=ONLC.newChar({name:'Old Fallen',cls:'veteranus',stats:{spd:75,str:75,int:75,lck:75,cha:75}},id,'gF'+Date.now(),Date.now()-1e6);
  f.alive=false;f.glory=1000;f.domus=c.domus;f.died={at:Date.now()-5e5,rank:'veteranus'};w.chars[f.id]=f;const D=mockDomus82(w,c.domus);D.recent=[{id:'m1',ev:'democritus',loc:3,at:Date.now()-9e5,won:true,died:false,glad:c.name,ranked:true},{id:'m2',ev:'cassian',loc:6,at:Date.now()-8e5,won:false,died:false,glad:c.name,ranked:false}];mockSave(w)},ids.A);
out.dr=await A.evaluate(async()=>(await NET.req('domus.get',{})).domus.dr98);ok(out.dr&&out.dr.k==='ludusminor'&&out.dr.s===900,'the Domus rank: best living + 20% of the fallen '+JSON.stringify(out.dr));
for(const p of [A,B,C,D]){p.evaluate(()=>{onlineOpen('play')}).catch(()=>{})}for(const p of [A,B,C,D])await p.waitForSelector('#onl',{timeout:30000}).catch(()=>{});await wait(800);

/* ── 6 · the event squares (A's landing) ── */
out.sq=await until(A,()=>{const r=document.querySelector('#onl .ev98row');if(!r)return null;const s=[...r.querySelectorAll('.ev98s')];return {n:s.length,evs:s.map(x=>x.dataset.ev98),play:r.querySelectorAll('[data-onl="quick"][data-v$="|0"]').length,
  ranked:[...document.querySelectorAll('#onl [data-onl="quick"][data-v$="|1"]')].map(b=>b.dataset.v.split('|')[0]).filter(k=>ONLC.customOnly98(k)).length,vis:r.getBoundingClientRect().height>60}});
ok(out.sq&&out.sq.n===2&&out.sq.play===2&&out.sq.evs[0]!==out.sq.evs[1]&&out.sq.evs.every(k=>['familia','ludus','goldenEagle'].includes(k))&&out.sq.vis,'two event squares, different events '+JSON.stringify(out.sq));
ok(out.sq&&out.sq.ranked===0,'no Ranked button for a Custom-only event');
await A.evaluate(()=>{const r=document.querySelector('#onl .ev98row');if(r)r.scrollIntoView({block:'center'})});await wait(300);await shot(A,'landing98.png');
/* the square turns to another event on its own */
out.turn=await until(A,ev=>{const s=[...document.querySelectorAll('#onl .ev98s')].map(x=>x.dataset.ev98);return s.join()!==ev?s.join():null},out.sq?out.sq.evs.join():'',12000);ok(!!out.turn,'a square turns to another event: '+out.turn);
/* ⚔ Play on a square → a Custom room for it */
const sqEv=await A.evaluate(()=>document.querySelector('#onl .ev98s').dataset.ev98);await click(A,'#onl .ev98s [data-onl="quick"]');
out.sqRoom=await until(A,()=>{const L=onlMyLobby();return L&&{ev:L.ev,ranked:!!L.ranked,quick:!!L.quick,reg:L.reg}});ok(out.sqRoom&&out.sqRoom.ev===sqEv&&!out.sqRoom.ranked,'⚔ Play made a Custom '+sqEv+' room '+JSON.stringify(out.sqRoom));
out.sqCry=await A.evaluate(()=>{const w=mockLoad();const L=onlMyLobby();return {cry:((w.lobbies[L.id]||{}).cry||[]).length,lines:(w.forum||[]).filter(l=>l.k==='open'&&l.row&&l.row.id===L.id).length}});
ok(out.sqCry.cry===0&&out.sqCry.lines===0,'5 · Find me a fight is silent '+JSON.stringify(out.sqCry));
await A.evaluate(async()=>{const L=onlMyLobby();await NET.req('lobby.leave',{id:L.id})});await wait(400);

/* ── 1 · A opens a Custom room and sets a password in the table settings ── */
const rid=await A.evaluate(async()=>{const r=await NET.req('lobby.create',{ev:'democritus',loc:3});ONL.tab='lobby';onlRedraw();return (r.lobby||r).id});
out.room0=await until(A,()=>{const L=onlMyLobby();return L&&L.reg?{reg:L.reg,dr:(L.members[0]||{}).dr}:null});ok(out.room0&&out.room0.reg==='eu'&&out.room0.dr==='ludusminor','the room: region from the time zone + the host’s tier '+JSON.stringify(out.room0));
await A.waitForSelector('#onl #pw98Set',{timeout:20000});await A.fill('#onl #pw98Set','Roma 77');await click(A,'#onl [data-pw98="set"]');
out.pw=await until(A,id=>{const w=mockLoad();const L=w.lobbies[id];const X=(w.pw98||{})[id];return L&&L.pw?{pw:L.pw,hash:!!X&&/^[0-9a-f]{64}$/.test(X.h),plain:/Roma 77/.test(JSON.stringify(w)),badge:!!document.querySelector('#onlRoom80 .pw98b')}:null},rid);
ok(out.pw&&out.pw.pw===1&&out.pw.hash&&!out.pw.plain&&out.pw.badge,'password set: only a salted hash is kept, 🔒 on the room '+JSON.stringify(out.pw));
/* the room view: tier chips beside names, the region tag, names open the card */
await wait(500);out.rm=await A.evaluate(()=>({chips:document.querySelectorAll('#onlRoom80 .dr98c').length,reg:!!document.querySelector('#onlRoom80 .rg98t .rg98'),names:document.querySelectorAll('#onlRoom80 [data-hc98]').length}));
ok(out.rm.chips>=1&&out.rm.reg&&out.rm.names>=1,'room: rank chip, region tag, clickable names '+JSON.stringify(out.rm));await shot(A,'room98.png');

/* ── 2 · B's Lobby Browser: 🔒, region flag, tier chip; the Region filter ── */
await B.evaluate(async()=>{ONL.lobbies=await NET.req('lobby.list',{});ONL.tab='lobby';onlRedraw()});
out.row=await until(B,id=>{const tr=document.querySelector(`#onl tr[data-row="${id}"]`);return tr?{lock:!!tr.querySelector('.pw98b'),flag:!!tr.querySelector('.rg98[data-rg98="eu"]'),chip:!!tr.querySelector('.dr98c[data-dr98="ludusminor"]'),name:!!tr.querySelector('[data-hc98]')}:null},rid);
ok(out.row&&out.row.lock&&out.row.flag&&out.row.chip&&out.row.name,'list row: 🔒, the Europe flag, the tier chip, a clickable host '+JSON.stringify(out.row));
await B.selectOption('#onl select[data-lb96="reg"]','as');out.fAs=await until(B,id=>!document.querySelector(`#onl tr[data-row="${id}"]`)&&document.querySelector('#onl select[data-lb96="reg"]').value==='as'?'gone':null,rid,8000);
await B.selectOption('#onl select[data-lb96="reg"]','eu');out.fEu=await until(B,id=>document.querySelector(`#onl tr[data-row="${id}"]`)?'shown':null,rid,8000);ok(out.fAs==='gone'&&out.fEu==='shown','the Region filter '+[out.fAs,out.fEu]);
await B.evaluate(()=>{const t=document.querySelector('#onl .lb96f');if(t)t.scrollIntoView({block:'start'})});await shot(B,'list98.png');
/* ── 3 · the house card from the host's name ── */
await click(B,`#onl tr[data-row="${rid}"] [data-hc98]`);out.card=await until(B,()=>{const c=document.querySelector('.hc98pop .hc98:not(.load)');return c?{name:(c.querySelector('h3')||{}).textContent,glads:c.querySelectorAll('.hc98-gl li').length,
  last:c.querySelectorAll('.hc98-last .hc98e').length,w:c.querySelectorAll('.hc98e.w').length,dr:/Ludus Minor/.test(c.textContent),best:!!c.querySelector('.hc98-best .onl-rk-veteranus'),fallen:/Fallen/.test(c.textContent),visit:!!c.querySelector('[data-hc98v]'),follow:!!c.querySelector('[data-hc98f]')}:null});
ok(out.card&&/Alpha/.test(out.card.name)&&out.card.glads===1&&out.card.last===2&&out.card.w===1&&out.card.dr&&out.card.best&&out.card.visit&&out.card.follow,'the house card '+JSON.stringify(out.card));
await shot(B,'card98.png');await click(B,'.hc98pop [data-hc98v]');out.visit=await until(B,()=>ONL.tab==='visit'&&V89L.visit&&/Alpha/.test(V89L.visit.domus.name)?'visit':null);ok(out.visit==='visit','🏛 Visit house opens their Domus');
await B.evaluate(()=>{V89L.visit=null;ONL.tab='lobby';onlRedraw()});
/* ── 1 · B joins: asked for the password; wrong → asked again; right → in ── */
await B.evaluate(async()=>{ONL.lobbies=await NET.req('lobby.list',{});onlRedraw()});await click(B,`#onl [data-onl="join"][data-v="${rid}"]`);
await B.waitForSelector('.pw98pop #pw98In',{timeout:15000});await B.fill('.pw98pop #pw98In','wrong');await B.press('.pw98pop #pw98In','Enter');
out.wrong=await until(B,()=>{const p=document.querySelector('.pw98pop');const e=p&&p.querySelector('.onl-err');return e?e.textContent:null},null,10000);ok(/Wrong password/.test(out.wrong||''),'wrong → asked again: '+out.wrong);
await B.fill('.pw98pop #pw98In','Roma 77');await B.press('.pw98pop #pw98In','Enter');
out.in=await until(A,([id,x])=>(mockLoad().lobbies[id].members||[]).some(m=>m.id===x),[rid,ids.B],15000);ok(!!out.in,'the right password lets B in');
out.bdr=await until(A,id=>{const m=(onlMyLobby().members||[]).find(x=>x.id===id);return m&&m.dr&&document.querySelectorAll('#onlRoom80 .dr98c').length>=2?m.dr:null},ids.B);ok(out.bdr==='tugurium','B wears Tugurium');
/* the room-side house card */
await A.evaluate(()=>{ONL.tab='lobby';onlRedraw()});await click(A,`#onlRoom80 [data-u96="${ids.B}"] [data-hc98]`);out.card2=await until(A,()=>{const c=document.querySelector('.hc98pop .hc98:not(.load) h3');return c?c.textContent:null});ok(/Beta/.test(out.card2||''),'a name in the room opens that house’s card');
await A.evaluate(()=>{for(const p of document.querySelectorAll('.hc98pop'))p.remove()});
/* the host clears the password */
await click(A,'#onl [data-pw98="clear"]');out.clear=await until(A,id=>!mockLoad().lobbies[id].pw&&!(mockLoad().pw98||{})[id]?'open':null,rid);ok(out.clear==='open','the host removes the password');
await B.evaluate(async id=>{await NET.req('lobby.leave',{id})},rid);await A.evaluate(async id=>{await NET.req('lobby.leave',{id})},rid);
/* Ranked rooms: no password row; never a Custom-only event */
out.rk=await A.evaluate(async()=>{const r=await NET.req('lobby.create',{ev:'democritus',ranked:true});ONL.tab='lobby';onlRedraw();await new Promise(z=>setTimeout(z,600));const L=onlMyLobby();
  const sel=document.querySelector('#onl select[data-onlrs="ev"]');const o={pw:!!document.querySelector('#onl #pw98Set'),evs:sel?[...sel.options].map(x=>x.value):[]};
  try{await NET.req('lobby.set',{id:L.id,pw:'abcd'});o.set='ok'}catch(e){o.set=e.code||e.message}await NET.req('lobby.leave',{id:L.id});return o});
ok(!out.rk.pw&&!out.rk.evs.some(k=>['ludus','goldenEagle'].includes(k))&&out.rk.set==='pw_ranked','Ranked: no password, no Custom-only events '+JSON.stringify(out.rk));

/* ── 4 · the Domus wears its banner ── */
await A.evaluate(()=>{ONL82.dgAt=0;ONL.tab='char';onlRedraw()});out.dom=await until(A,()=>{const t=document.querySelector('#onl .rb82 .dr98-top');return t?{txt:t.textContent.replace(/\s+/g,' ').trim(),img:!!t.querySelector('img.dr98-big')}:null},null,20000);
ok(out.dom&&/Ludus Minor/.test(out.dom.txt)&&out.dom.img,'the Domus rank banner above the Glory bar '+JSON.stringify(out.dom));
/* never drops: the living gladiator loses Glory → still Ludus Minor */
out.keep=await A.evaluate(async()=>{const w=mockLoad();w.chars[ONL.char.id].glory=10;mockSave(w);return (await NET.req('domus.get',{})).domus.dr98});ok(out.keep&&out.keep.s===900,'never drops '+JSON.stringify(out.keep));
await A.evaluate(()=>{const t=document.querySelector('#onl .rb82');if(t)t.scrollIntoView({block:'start'})});await wait(400);await shot(A,'domus98.png');
/* ── 7 · Damnatio greyed in the class picker ── */
out.dm=await A.evaluate(async()=>{const w=mockLoad();const D=mockDomus82(w,w.chars[ONL.char.id].domus);D.treasury=500;mockSave(w);ONL.domus=(await NET.req('domus.get',{})).domus;d89ClassPop();const b=document.querySelector('.cls89pop [data-cls89="damnatio"]');const o={dis:!!(b&&b.disabled),why:b?b.title:''};
  try{await NET.req('char.class',{char:ONL.char.id,cls:'damnatio'});o.srv='ok'}catch(e){o.srv=e.message}for(const p of document.querySelectorAll('.cls89pop'))p.remove();return o});
ok(out.dm.dis&&/Damnatio/.test(out.dm.why)&&/Damnatio/.test(out.dm.srv),'Damnatio only at creation '+JSON.stringify(out.dm));

/* ── 9 · 👤 Profile & Settings ── */
await A.evaluate(()=>{ONL.tab='prof';onlRedraw()});out.pr=await until(A,()=>{const R=document.querySelector('#onl .pr98');if(!R)return null;const cols=[...R.querySelectorAll('.pr98-g > .pr98-col')].map(c=>Math.round(c.getBoundingClientRect().left));
  return {head:!!R.querySelector('.pr98-h h2'),fid:!!R.querySelector('.pr98-fid b'),ren:!!R.querySelector('#ln89Ren'),cols,flash:!!R.querySelector('[data-n98="flash"]'),horn:!!R.querySelector('[data-n98="horn"]'),quiet:!!R.querySelector('[data-n98="quiet"]'),
    seg:R.querySelectorAll('.seg98 input[data-l89p="inv"]').length,hide:!!R.querySelector('input[data-l89p="hide"]'),find:!!R.querySelector('#fd89In'),del:!!R.querySelector('[data-l89="del"]'),out:!!R.querySelector('[data-onl="signout"]'),chip:!!R.querySelector('.pr98-house .dr98c')}});
ok(out.pr&&out.pr.head&&out.pr.fid&&out.pr.ren&&out.pr.cols.length===2&&out.pr.cols[1]>out.pr.cols[0]+200&&out.pr.flash&&out.pr.horn&&out.pr.quiet&&out.pr.seg===3&&out.pr.hide&&out.pr.find&&out.pr.del&&out.pr.out,'profile: header + two columns '+JSON.stringify(out.pr));
/* the switches: the horn off alone keeps the flash */
await A.click('#onl .sw98:has([data-n98="horn"])');await wait(300);out.sw=await A.evaluate(()=>({flash:localStorage.getItem('flavius_onlflash98'),horn:localStorage.getItem('flavius_onlhorn98'),flashOn:n98Flash(),hornOn:n98Horn()}));
ok(out.sw.horn==='0'&&out.sw.flashOn&&!out.sw.hornOn,'horn off, flash on '+JSON.stringify(out.sw));await A.click('#onl .sw98:has([data-n98="horn"])');
await shot(A,'profile98_1440.png');await A.setViewportSize({width:390,height:844});await wait(700);
out.pr390=await A.evaluate(()=>{const cols=[...document.querySelectorAll('#onl .pr98-g > .pr98-col')].map(c=>Math.round(c.getBoundingClientRect().left));return {cols,over:document.documentElement.scrollWidth-window.innerWidth}});
ok(out.pr390.cols.length===2&&out.pr390.cols[0]===out.pr390.cols[1]&&out.pr390.over<=1,'phone: one column, no sideways scroll '+JSON.stringify(out.pr390));await shot(A,'profile98_390.png');
await A.setViewportSize({width:1440,height:900});await wait(300);

/* ── 6 · LUDUS (A + B) and GOLDEN EAGLE (C + D) start and play online in lockstep ── */
HAND.on=false;
const drive=async p=>{const r=await p.evaluate(()=>{if(CUR_MODAL&&(!ONLM.on||onlmMine()||ONLM.info>0)){const bs=[...document.querySelectorAll('#modal .mbtns button')].filter(b=>!b.disabled&&b.offsetParent);
      const lit=document.querySelector('#modal [data-mi]:not(.dim):not([disabled])');if(lit&&!bs.length){lit.setAttribute('data-drv','1');return ['sel','#modal [data-drv="1"]','pick']}
      const pb=document.querySelector('#modal .mbtns .primary')?'#modal .mbtns .primary':bs.length?'#modal .mbtns button:not([disabled])':null;return pb?['sel',pb,'modal']:['','','modal?']}
    if(!S||S.over||!ONLM.on)return ['','','off'];if(!onlmMine()||S.busy)return ['','','wait'];
    if(S.phase==='choice'&&document.querySelector('[data-act="coin"]'))return ['sel','[data-act="coin"]','coin'];
    if(S.phase==='action'){S._drv=(S._drv||0)+1;try{computeHL()}catch(e){}const ks=[...HL.keys()];if(ks.length&&S._drv%4!==0){const k=ks[(S.turnNo*7+S._drv*3)%ks.length];const r0=Math.floor(k/N),c0=k%N;const cv=document.querySelector('canvas');const rc=cv.getBoundingClientRect();const pt=center(r0,c0);
        return ['xy',[rc.left+pt.x*rc.width/cv.width,rc.top+pt.y*rc.height/cv.height],'tile']}
      S._drv=0;if(document.querySelector('[data-act="end"]'))return ['sel','[data-act="end"]','end']}return ['','','idle']});
  if(r[0]==='sel')await p.click(r[1],{timeout:2000,force:true}).catch(()=>{});if(r[0]==='xy')await p.mouse.click(r[1][0],r[1][1]).catch(()=>{});return r[2]};
async function start(ev,H,G,seats){const L=await H.evaluate(async([ev,seats])=>{const r=await NET.req('lobby.create',{ev,loc:5,seats});return r.lobby||r},[ev,seats]);
  for(let k=0;k<6;k++){await G.evaluate(async id=>{try{await NET.req('lobby.join',{id})}catch(e){}},L.id);if(await until(H,([id,x])=>(mockLoad().lobbies[id].players||[]).some(p=>p.id===x),[L.id,await G.evaluate(()=>ONL.acct.id)],4000))break}
  const L2=await H.evaluate(async id=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},L.id);await G.evaluate(L=>onlEnter(L),L2);return L.id}
const nIn=p=>p.evaluate(async()=>{try{return S&&S.onl?(await NET.req('match.get',{id:S.onl.lobby,from:0})).inputs.length:0}catch(e){return 0}}).catch(()=>0);
async function result(ev,H,G){for(const t1=Date.now();Date.now()-t1<40000;){const top=await H.evaluate(async()=>{const ins=(await NET.req('match.get',{id:S.onl.lobby,from:0})).inputs;return ins.length?ins[ins.length-1].seq:0}).catch(()=>0);
    const ns=await Promise.all([H,G].map(p=>p.evaluate(()=>ONLM.next).catch(()=>0)));if(ns.every(x=>x>top))break;await H.waitForTimeout(300)}
  const inputs=await H.evaluate(async()=>(await NET.req('match.get',{id:S.onl.lobby,from:0})).inputs.map(x=>[x.seq,x.from,x.h||x.pre,x.k]));
  const HH={H:await H.evaluate(()=>({h:ONLM.hlog,r:ONLM.resyncs,acct:ONL.acct.id,ev:S.evKey,n:S.players.length,teams:S.players.map(p=>p.team||''),seats:S.players.map(p=>!!p.cpu)})),G:await G.evaluate(()=>({h:ONLM.hlog,r:ONLM.resyncs,acct:ONL.acct.id,ev:S.evKey,n:S.players.length}))};
  let same=0,diff=0;for(const [seq,from,h] of inputs){if(!h)continue;for(const k of ['H','G']){if(HH[k].acct===from)continue;const o=HH[k].h['s'+seq];if(!o)continue;o===h?same++:diff++}}
  return {ev,inputs:inputs.length,kinds:[...new Set(inputs.map(x=>x[3]))],same,diff,resync:[HH.H.r,HH.G.r],evH:HH.H.ev,evG:HH.G.ev,players:HH.H.n,teams:HH.H.teams,cpu:HH.H.seats}}
/* both matches at once (a loaded machine plays them slowly): Ludus = A + B (its draft runs on the host), Golden Eagle = C + D (teams) */
await start('ludus',A,B,4);await start('goldenEagle',C,D,4);
{const t0=Date.now();let n=0;while(Date.now()-t0<330000){for(const p of [A,B,C,D])await drive(p);await A.waitForTimeout(150);
  if(++n%10===0&&Date.now()-t0>40000){const [a,c]=[await nIn(A),await nIn(C)];if(a>=8&&c>=8)break}}}
out.ludus=await result('ludus',A,B);console.log('LUDUS',JSON.stringify(out.ludus));
ok(out.ludus.evH==='ludus'&&out.ludus.evG==='ludus'&&out.ludus.players===4&&out.ludus.inputs>=6&&out.ludus.same>=3&&!out.ludus.diff&&!out.ludus.resync[0]&&!out.ludus.resync[1],'Ludus plays online in lockstep '+JSON.stringify(out.ludus));
await shot(A,'ludus98.png');
out.eagle=await result('goldenEagle',C,D);console.log('EAGLE',JSON.stringify(out.eagle));
ok(out.eagle.evH==='goldenEagle'&&out.eagle.evG==='goldenEagle'&&out.eagle.players===4&&new Set(out.eagle.teams).size===2&&out.eagle.inputs>=6&&out.eagle.same>=3&&!out.eagle.diff&&!out.eagle.resync[0]&&!out.eagle.resync[1],'Golden Eagle plays online in lockstep (two teams) '+JSON.stringify(out.eagle));
await shot(C,'eagle98.png');

console.log(JSON.stringify(out));console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();srv.close();if(miss.length||errs.length)process.exit(1)})();
