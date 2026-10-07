/* v0.94 226-v94onltok — ONLINE 3D TOKENS AS SERVER PICTURES through the MOCK server, two windows: A poses + saves a 3D token in the Domus
   (the v0.93 modeller on the online gladiator, the sheet rendered once and uploaded in parts: WebP, ≤ 64 KB, the right size for its meta),
   the gladiator carries only the reference (ch.tok94), the card shows the picture; a refusal while A is in a room (server + greyed card);
   B joins A's match, fetches the picture by hash (tok.get) and draws it on the board through the figure path (the seat's token is tagged,
   nothing of it in the match state), B's own seat stays sculpted; a missing picture falls back to the sculpted token; no new errors in
   the 00c log. SHOT=<dir> saves tonl94_*.png. */
const http=require('http'),fs=require('fs'),path=require('path');const SHOT=process.env.SHOT||'';
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0')});
const TT0=Date.now();const lap=s=>console.log('@'+s+' '+((Date.now()-TT0)/1000|0)+'s');
const errs=[];const A=await ctx.newPage(),B=await ctx.newPage();for(const [n,p] of [['A',A],['B',B]])p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));
await A.goto(URL0,{timeout:90000});await A.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_(onlmock|onlrid93|tok94|onlreport|onlover|onlmatch|dombar89)/.test(k))localStorage.removeItem(k)});
await B.goto(URL0,{timeout:90000});for(const P of [A,B])await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const mark={A:await A.evaluate(()=>ERR92.n),B:await B.evaluate(()=>ERR92.n)};
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const shot=async(p,n)=>{if(SHOT)await p.screenshot({path:path.join(SHOT,`tonl94_${n}.png`)})};
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});ONL.domus=(await NET.req('domus.create',{name:'Domus '+name})).domus;ONL.char=await NET.req('char.create',{name:name+' the Bold',cls})},[name,cls]);
const sync=async(from,to,ms=15000)=>{const t0=Date.now();while(Date.now()-t0<ms){const v=await from.evaluate(()=>localStorage.getItem('flavius_onlmock'));if(await to.evaluate(v=>localStorage.getItem('flavius_onlmock')===v,v))return true;await to.waitForTimeout(100)}return false};
const seenBy=async(p,fn,arg,ms=30000)=>{const t0=Date.now();while(Date.now()-t0<ms){if(await p.evaluate(fn,arg).catch(()=>false))return true;await p.waitForTimeout(150)}return false};
await setup(A,'Alpha','hero');await sync(A,B);await setup(B,'Beta','soldier');await sync(B,A);
/* a look for A's gladiator (set at creation in the game; the test writes it into the mock world) */
await A.evaluate(async()=>{const w=mockLoad();w.chars[ONL.char.id].look=ONLC.cleanLook({portrait:{skin:'#c68e5f',hair:'#2a1a10',hs:'short',bs:'full'},color:'#2255aa',token:{c1:'#2255aa',sc:1}});mockSave(w);
  ONL.char=(await NET.req('char.mine')).find(x=>x.id===ONL.char.id);ONL.chars=await NET.req('char.mine')});
lap('ready');

/* ── 1 · A poses + saves in the Domus ── */
await A.evaluate(async()=>{onlineOpen('play');await new Promise(r=>setTimeout(r,900));ONL.tab='char';onlRedraw()});
const card=await seenBy(A,()=>!!document.querySelector('#onl [data-t94card] [data-t94="pose"]'),null,20000);ok(card,'the Domus shows the 3D token card');
await A.evaluate(()=>document.querySelector('#onl [data-t94="pose"]').click());
const ready=await seenBy(A,()=>{const b=document.querySelector('#t93m [data-t93m="save"]');return !!b&&!b.disabled},null,120000);ok(ready,'the modeller opens on the online gladiator');lap('modeller');
await seenBy(A,()=>document.querySelectorAll('#t93m #t93strip canvas').length===8,null,60000);await shot(A,'modeller');
await A.evaluate(()=>{const b=document.querySelector('#t93m [data-t93pre="victory"]');if(b)b.click()});await A.waitForTimeout(400);
await A.evaluate(()=>document.querySelector('#t93m [data-t93m="save"]').click());
const saved=await seenBy(A,()=>!document.getElementById('t93m')&&!T94.up,null,150000);ok(saved,'Save renders + uploads');lap('saved');
const S1=await A.evaluate(()=>{const w=mockLoad();const ch=w.chars[ONL.char.id];const P=t94MLoad()[ONL.char.id]||{};const chk=P.b?ONLC.tokCheck94(P.b,P.meta):{why:'none'};
  return {ref:ch.tok94&&ch.tok94.h,h:P.h,len:(P.b||'').length,why:chk.why||'',pk:P.pk,pose:(P.pose||'').length,charLen:JSON.stringify(ch).length,inChar:/RIFF|UklGR/.test(JSON.stringify(ch)),onl:!!(ONL.char.tok94&&ONL.char.tok94.h===P.h),
    kit:JSON.stringify((ONLC.kitOf(ch).look||{}).t94||null),fig:!!document.querySelector('#onl [data-t94card] .t93fig'),off:!!document.querySelector('#onl [data-t94="off"]')}});
ok(S1.ref&&S1.ref===S1.h&&!S1.why&&S1.len>1000&&S1.len<=Math.ceil(65536/3)*4,'stored: a WebP within the limits, the gladiator holds the hash '+JSON.stringify({h:S1.h,len:S1.len,why:S1.why}));
ok(S1.pk==='victory'&&S1.pose>20&&S1.pose<=600,'pose stored '+JSON.stringify({pk:S1.pk,pose:S1.pose}));
ok(!S1.inChar&&S1.charLen<6000,'the picture lives in its own item, not the gladiator');ok(S1.onl&&S1.fig&&S1.off,'the card shows the picture + Classic '+JSON.stringify(S1));
ok(S1.kit===JSON.stringify({c:await A.evaluate(()=>ONL.char.id),h:S1.h}),'the kit names the picture '+S1.kit);
await shot(A,'domus');

/* ── 2 · busy: in a room → refused by the server, the card greyed ── */
const L=await A.evaluate(async()=>await NET.req('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:false,abandon:'fate'}));
const busy=await A.evaluate(async()=>{let off='',up='';try{await NET.req('char.tok',{char:ONL.char.id,off:1})}catch(e){off=e.code+':'+e.message}
  try{await NET.req('char.tok',{char:ONL.char.id,up:'upbusy1',i:0,n:1,b:'AAAA',meta:[120,180,60,160]})}catch(e){up=e.code+':'+e.message}
  ONL.lobbies=await NET.req('lobby.list');ONL.tab='char';onlRedraw();await new Promise(r=>setTimeout(r,300));const btn=document.querySelector('#onl [data-t94="pose"]');return {off,up,dis:!!(btn&&btn.disabled),still:!!mockLoad().chars[ONL.char.id].tok94}});
ok(/^in_match:Finish or leave/.test(busy.off)&&/^in_match:/.test(busy.up)&&busy.still,'refused while in a room '+JSON.stringify(busy));ok(busy.dis,'the card is greyed in a room');

/* ── 3 · B joins the match, fetches A's picture and draws it ── */
await B.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_tok94/.test(k))localStorage.removeItem(k);T94.mem.clear()});
await sync(A,B);for(let k=0;k<8;k++){await B.evaluate(async id=>{try{await NET.req('lobby.join',{id})}catch(e){}},L.id);if(await seenBy(A,id=>ONLC.humansOf(mockLoad().lobbies[id]||{}).length>=2,L.id,5000))break}
await sync(B,A);
const pre=await B.evaluate(async id=>{const L=(await NET.req('lobby.list')).find(x=>x.id===id);const p=L.players.find(x=>x.kit&&x.kit.look&&x.kit.look.t94);return {named:!!p}},L.id);ok(pre.named,'the room seat names the picture');
const L2=await A.evaluate(async id=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},L.id);
const drive=async p=>{const r=await p.evaluate(()=>{if(CUR_MODAL&&(!ONLM.on||onlmMine()||ONLM.info>0)){const t=(document.querySelector('#mTitle')||{}).textContent||'';const pb=document.querySelector('#modal .mbtns .primary')?'#modal .mbtns .primary':document.querySelector('#modal .mbtns button')?'#modal .mbtns button':null;return pb?['sel',pb,'modal:'+t.slice(0,24)]:['','','modal?']}
  if(!S||S.over||!ONLM.on)return ['','','off'];if(!onlmMine()||S.busy)return ['','','wait'];
  if(S.phase==='choice'&&document.querySelector('[data-act="coin"]'))return ['sel','[data-act="coin"]','coin'];
  if(S.phase==='action'){S._drv=(S._drv||0)+1;const atk=[...document.querySelectorAll('[data-act^="m-atk"]')].filter(b=>!b.disabled);
    if(S._drv%4===1&&atk.length&&S.mode==='move')return ['sel','[data-act="'+atk[0].dataset.act+'"]','mode:'+atk[0].dataset.act];
    try{computeHL()}catch(e){}const ks=[...HL.keys()];if(ks.length&&S._drv%4!==0){const k=ks[(S.turnNo*7+S._drv*3)%ks.length];const r0=Math.floor(k/N),c0=k%N;const cv=document.querySelector('canvas');const rc=cv.getBoundingClientRect();const pt=center(r0,c0);
      return ['xy',[rc.left+pt.x*rc.width/cv.width,rc.top+pt.y*rc.height/cv.height],(S.mode||'')+'@'+r0+','+c0]}
    S._drv=0;if(document.querySelector('[data-act="end"]'))return ['sel','[data-act="end"]','end']}return ['','','idle:'+S.phase]});
  /* force: the suggested End turn beats (heartbeat), so it is never 'stable' for Playwright — under load it never got clicked */if(r[0]==='sel')await p.click(r[1],{timeout:2000,force:true}).catch(()=>{});if(r[0]==='xy')await p.mouse.click(r[1][0],r[1][1]);return r[2]};
const run=async(ms,until)=>{const t0=Date.now();while(Date.now()-t0<ms){await drive(A);await drive(B);await A.waitForTimeout(250);if(await A.evaluate(()=>!S||S.over))break;if(until&&await until(Date.now()-t0))break}};
await sync(A,B);await B.evaluate(L=>onlEnter(L),L2);lap('entered');
const inMatch=()=>B.evaluate(()=>typeof S!=='undefined'&&!!S&&!!S.onl&&!!S.players&&S.players.length>=2&&ONLM.on).catch(()=>false);
await run(90000,async()=>await inMatch()&&await B.evaluate(()=>{const t=tokenForP(S.players[0]);return !!(t&&t.t93&&t93Img(t.t93))}).catch(()=>false));
const inB=await inMatch();ok(inB,'B is in the match');lap('playing');
const drawn=await seenBy(B,()=>{const t=tokenForP(S.players[0]);return !!(t&&t.t93&&t.t93.o94&&t93Img(t.t93))},null,60000);
const D=await B.evaluate(()=>{const p0=S.players[0],p1=S.players[1];const t0=tokenForP(p0),t1=tokenForP(p1);T93.drawn=0;draw();const n=T93.drawn;
  const fig=figureHTML(t0,60);try{render()}catch(e){}const bh=(document.getElementById('board')||{}).innerHTML||'';const panel=!/Alpha/.test(bh)||/t93fig/.test(bh);return {panel,n,fetched:T94.fetched,tag:!!t0.t93,enumerable:Object.keys(t0).includes('t93'),state:/data:image|UklGR/.test(JSON.stringify(S.players)),t1:!!t1.t93,t1sc:!!p1._onlSc,fig:/t93fig/.test(fig),ls:Object.keys(localStorage).some(k=>/^flavius_tok94\./.test(k)),hash:typeof onlHash==='function'?onlHash():''}});
ok(drawn&&D.tag&&D.n>=1&&D.fetched>=1,'B fetched A\'s picture and the board draws it '+JSON.stringify(D));
ok(!D.enumerable&&!D.state,'nothing of the picture in the match state');ok(!D.t1&&D.t1sc,'B\'s own seat (no picture) stays sculpted');ok(D.fig&&D.panel,'the fighter panel shows it');ok(D.ls,'cached by hash in localStorage');
const hA=await A.evaluate(()=>typeof onlHash==='function'?onlHash():'');ok(!!D.hash&&!!hA,'hashes readable');
/* zoom onto A's piece for the picture */
if(SHOT){await shot(B,'board_full');await B.evaluate(()=>{try{window.__cf94=camFocus;camFocus=function(Wd,Hd){const p=S.players[0];const q=typeof rot89==="function"&&typeof ROT89!=="undefined"?rot89(p.r,p.c,ROT89.k||0):[p.r,p.c];return {r:q[0],c:q[1],x:Wd/2,y:Hd*0.5}};CAM.z=2.4;draw()}catch(e){}});await B.waitForTimeout(600);await shot(B,'board');
  await B.evaluate(()=>{try{camFocus=window.__cf94;CAM.z=null;draw()}catch(e){}})}

/* ── 4 · a missing picture → the sculpted token, no error ── */
const F=await B.evaluate(async()=>{const p0=S.players[0];const ref=ONLC.lookTok94(p0._onlLook);const P=t94MLoad();delete P[ref.c];localStorage.setItem('flavius_onlmocktok94',JSON.stringify(P));
  T94.mem.clear();for(const k of Object.keys(localStorage))if(/^flavius_tok94/.test(k))localStorage.removeItem(k);T94.fail.clear();
  const t=tokenForP(p0);await new Promise(r=>setTimeout(r,800));const t2=tokenForP(p0);T93.drawn=0;let err='';try{draw()}catch(e){err=e.message}
  return {first:!!t.t93,after:!!t2.t93,sc:!!(t2&&(t2.kind||t2.sc||p0._onlSc)),drawn:T93.drawn,err,failed:T94.fail.size}});
ok(!F.first&&!F.after&&F.sc&&F.drawn===0&&!F.err&&F.failed>=1,'missing picture → sculpted, no error '+JSON.stringify(F));
lap('checked');

/* no new errors in the 00c log, no page errors */
const E={A:await A.evaluate(m=>errNew92(m).map(x=>x.kind+':'+x.msg),mark.A),B:await B.evaluate(m=>errNew92(m).map(x=>x.kind+':'+x.msg),mark.B)};
ok(!E.A.length&&!E.B.length,'no new entries in the error log '+JSON.stringify(E));
console.log(JSON.stringify({S1:{h:S1.h,len:S1.len},busy,D,F}));
console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();srv.close();if(miss.length||errs.length)process.exit(1)})();
