/* v1.0 ONLINE PRE-MATCH BRIEFING FOR JOINERS (305-v100briefonl; mock, two windows on http).
   The host's window shows the briefing (as before) and the joiner's window shows it too (local only: no input, same hash, no resync). The joiner
   leaves it OPEN while the host plays the first turn: the host's board inputs close it by themselves and the match stays in lockstep (equal hashes,
   no resync, no void). Then, on the joiner: a briefing re-opened the same way closes when MY turn begins (BUS turn.begin) and when a decision
   window is asked for (the decision window appears and is not swallowed); an info window (rule pop-up) queues behind it instead.
   Kill switch flavius_briefonl305off=1 → the joiner goes straight to the board. ERRS must be []. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const PAGE=path.resolve(process.argv[2]);const root=path.dirname(PAGE),page=path.basename(PAGE);
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const errs=[];
const srv=http.createServer((q,res)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end()}const ext=path.extname(f);res.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(res)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();
const run=async(killB)=>{const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_tally102off','1');localStorage.setItem('flavius_onlcd83','0')});
const A=await ctx.newPage(),B=await ctx.newPage();for(const [n,p] of [['A',A],['B',B]])p.on('pageerror',e=>errs.push(n+':'+e.message));
await A.goto(URL0,{timeout:90000});await A.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|match|report|over|rid)/.test(k))localStorage.removeItem(k)});await B.goto(URL0,{timeout:90000});
if(killB)await B.evaluate(()=>localStorage.setItem('flavius_briefonl305off','1'));
for(const P of [A,B])await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const setup=async(p,name)=>{await p.evaluate(async(name)=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls:name==='Alpha'?'hero':'soldier'})},name)};
const sync=async(from,to,ms=15000)=>{const t0=Date.now();while(Date.now()-t0<ms){const v=await from.evaluate(()=>localStorage.getItem('flavius_onlmock'));if(await to.evaluate(v=>localStorage.getItem('flavius_onlmock')===v,v))return true;await to.waitForTimeout(100)}return false};
const seen=async(p,fn,arg,ms=30000)=>{const t0=Date.now();while(Date.now()-t0<ms){if(await p.evaluate(fn,arg).catch(()=>false))return true;await p.waitForTimeout(100)}return false};
await setup(A,'Alpha');await sync(A,B);await setup(B,'Beta');await sync(B,A);
const L=await A.evaluate(async()=>await NET.req('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:false}));
for(let k=0;k<8;k++){await seen(B,id=>!!mockLoad().lobbies[id],L.id);await B.evaluate(async(id)=>{try{await NET.req('lobby.join',{id})}catch(e){}},L.id);if(await seen(A,id=>ONLC.humansOf(mockLoad().lobbies[id]||{}).length>=2,L.id,5000))break}
await sync(B,A);const L2=await A.evaluate(async(id)=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},L.id);await sync(A,B);await B.evaluate(async(L)=>{onlEnter(L)},L2);
/* A: close its own briefing; B: keep it open */
const isBrief=p=>p.evaluate(()=>!!(CUR_MODAL&&document.querySelector('#modal.bf100 .bf100w')));
let aBrief=false,bBrief=false,bReached=false;
for(let k=0;k<400&&!(aBrief&&(bBrief||bReached));k++){
  const a=await A.evaluate(()=>{if(CUR_MODAL&&document.querySelector('#modal.bf100 .bf100w')){document.querySelector('#modal .mbtns .primary').click();return 1}return 0});if(a)aBrief=true;
  const bb=await B.evaluate(()=>({br:!!(CUR_MODAL&&document.querySelector('#modal.bf100 .bf100w')),on:!!(typeof ONLM!=='undefined'&&ONLM.on&&S&&S.players&&S.players.length>=3)}));if(bb.br)bBrief=true;if(bb.on)bReached=true;
  await A.waitForTimeout(60)}
if(killB){ok(!bBrief&&bReached,'kill switch: the joiner goes straight to the board');await ctx.close();return}
ok(aBrief,'host window shows the briefing');ok(bBrief,'JOINER window shows the briefing');
const jb=await B.evaluate(()=>({me:document.querySelectorAll('.bf100st.you').length===1,info:ONLM.info,turnNo:S.turnNo,btn:(document.querySelector('#modal .mbtns .primary')||{}).textContent,sent:ONLM.sent,pend:!!ONLM.pend}));
ok(jb.me&&jb.info===0&&!jb.pend&&!jb.sent,'joiner briefing: own seat YOU, nothing recorded/sent '+JSON.stringify(jb));
ok(/Enter the arena/.test(jb.btn||''),'joiner button reads Enter the arena');
/* the host plays its first turn while the joiner still has the briefing open: the briefing must not hold the lockstep */
let stillOpenAtHostMove=null,closedByInput=false;
for(let k=0;k<200;k++){
  const st=await A.evaluate(()=>({mine:!!(ONLM.on&&S&&!S.over&&onlmActor()===ONLM.me&&!S.busy&&!CUR_MODAL),ph:S&&S.phase,inputs:ONLM.sent}));
  if(st.mine&&st.ph==='choice'){await A.click('[data-act="coin"]',{force:true,timeout:3000}).catch(()=>{})}
  else if(st.mine&&st.ph==='action'){await A.click('[data-act="end"]',{force:true,timeout:3000}).catch(()=>{})}
  if(st.inputs>0){closedByInput=!(await isBrief(B));if(closedByInput)break;}
  await A.waitForTimeout(150)}
ok(closedByInput,'the host\'s board input closed the joiner\'s open briefing by itself (match not held)');
let ha,hb;for(let k=0;k<40;k++){ha=await A.evaluate(()=>({h:onlHash(),r:ONLM.resyncs|0,n:S.turnNo}));hb=await B.evaluate(()=>({h:onlHash(),r:ONLM.resyncs|0,n:S.turnNo}));if(ha.h===hb.h&&ha.n===hb.n)break;await A.waitForTimeout(400)}
ok(ha.h===hb.h&&!ha.r&&!hb.r,'hashes agree, no resync '+JSON.stringify({ha,hb}));
const voids=await A.evaluate(async()=>(await NET.req('match.get',{id:S.onl.lobby,from:0})).inputs.filter(i=>i.k==='void').length);ok(voids===0,'no void inputs '+voids);
/* unit-level: re-open the briefing on B the same way and check the two closers */
const open=()=>B.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);BF100.cur=1;BFO305.open=true;ONLM.info++;let p;try{p=modal('📋 The briefing',briefingHTML(),[{label:'x',value:1,primary:1}],{wide:true,close:1})}finally{ONLM.info--;BF100.cur=0}p.then(()=>{BFO305.open=false});await new Promise(r=>setTimeout(r,300));return !!document.querySelector('#modal.bf100 .bf100w')});
ok(await open(),'briefing re-opened on the joiner (test)');
const t1=await B.evaluate(async()=>{BUS.emit('turn.begin',{seat:ONLM.me});await new Promise(r=>setTimeout(r,300));return !(CUR_MODAL&&document.querySelector('#modal.bf100'))});ok(t1,'my turn begins -> the briefing closes');
ok(await open(),'re-opened again');
const t2=await B.evaluate(async()=>{window.__dec=null;const p=modal('Pick one','<p>Decide</p>',[{label:'Left',value:'L'},{label:'Right',value:'R'}]);await new Promise(r=>setTimeout(r,400));
  const r={dec:!!(CUR_MODAL&&/Pick one/.test(document.getElementById('mTitle').textContent)),brief:!!document.querySelector('#modal.bf100 .bf100w'),cls:document.getElementById('modal').classList.contains('bf100')};if(CUR_MODAL)CUR_MODAL.done('L');return r});
ok(t2.dec&&!t2.brief&&!t2.cls,'a decision window closes the briefing and appears with its own look '+JSON.stringify(t2));
ok(await open(),'re-opened a third time');
const t3=await B.evaluate(async()=>{ONLM.info++;const p=modal('Rule pop-up','<p>Rule</p>',[{label:'OK',value:1}]);ONLM.info--;await new Promise(r=>setTimeout(r,400));return {brief:!!document.querySelector('#modal.bf100 .bf100w'),title:document.getElementById('mTitle').textContent}});
ok(t3.brief,'an info window queues behind the briefing '+JSON.stringify(t3));
await B.evaluate(()=>{for(let i=0;i<3&&CUR_MODAL;i++)CUR_MODAL.done(1)});
await ctx.close()};
await run(false);await run(true);
srv.close();console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();if(miss.length||errs.length)process.exit(1)})();
