/* online (phase 1-2): the mock server's sign-in, gladiator, lobby and result; two windows playing one match in lockstep
   (the page is served over http from the page's folder — file:// pages do not share storage between windows) */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0')});
const errs=[];const A=await ctx.newPage(),B=await ctx.newPage();for(const [n,p] of [['A',A],['B',B]])p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));
await A.goto(URL0);await A.evaluate(()=>localStorage.removeItem('flavius_onlmock'));await B.goto(URL0);await A.waitForTimeout(2500);
const setup=async(p,name)=>{await p.evaluate(async(name)=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls:name==='Alpha'?'hero':'soldier'})},name)};
/* the mock world is one localStorage item: before another window writes, it must have the last write (a stale copy would overwrite it) */
const sync=async(from,to,ms=15000)=>{const t0=Date.now();while(Date.now()-t0<ms){const v=await from.evaluate(()=>localStorage.getItem('flavius_onlmock'));if(await to.evaluate(v=>localStorage.getItem('flavius_onlmock')===v,v))return true;await to.waitForTimeout(100)}return false};
await setup(A,'Alpha');await sync(A,B);await setup(B,'Beta');await sync(B,A);
const L=await A.evaluate(async()=>await NET.req('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:false}));
/* the mock world lives in one localStorage item shared by the windows: a write reaches the other window a moment later (longer under load) —
   B joins once it sees the room, and A starts once it sees B seated (a lost join is joined again) */
const seen=async(p,fn,arg,ms=30000)=>{const t0=Date.now();while(Date.now()-t0<ms){if(await p.evaluate(fn,arg).catch(()=>false))return true;await p.waitForTimeout(150)}return false};
for(let k=0;k<8;k++){await seen(B,id=>!!mockLoad().lobbies[id],L.id);await B.evaluate(async(id)=>{try{await NET.req('lobby.join',{id})}catch(e){}},L.id);if(await seen(A,id=>ONLC.humansOf(mockLoad().lobbies[id]||{}).length>=2,L.id,5000))break}
await sync(B,A);const L2=await A.evaluate(async(id)=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},L.id);await sync(A,B);
await B.evaluate(async(L)=>{onlEnter(L)},L2);
/* the auto-driver: on my own idle move, click like a person would */
const drive=async p=>{const r=await p.evaluate(()=>{if(CUR_MODAL&&(!ONLM.on||onlmMine()||ONLM.info>0)){const t=(document.querySelector('#mTitle')||{}).textContent||'';const pb=document.querySelector('#modal .mbtns .primary')?'#modal .mbtns .primary':document.querySelector('#modal .mbtns button')?'#modal .mbtns button':null;return pb?['sel',pb,'modal:'+t.slice(0,24)]:['','','modal?']}
  if(!S||S.over||!ONLM.on)return ['','','off'];if(!onlmMine()||S.busy)return ['','','wait'];
  if(S.phase==='choice'&&document.querySelector('[data-act="coin"]'))return ['sel','[data-act="coin"]','coin'];
  if(S.phase==='action'){S._drv=(S._drv||0)+1;const atk=[...document.querySelectorAll('[data-act^="m-atk"]')].filter(b=>!b.disabled);
    if(S._drv%4===1&&atk.length&&S.mode==='move')return ['sel','[data-act="'+atk[0].dataset.act+'"]','mode:'+atk[0].dataset.act];
    try{computeHL()}catch(e){}const ks=[...HL.keys()];if(ks.length&&S._drv%4!==0){const k=ks[(S.turnNo*7+S._drv*3)%ks.length];const r0=Math.floor(k/N),c0=k%N;const cv=document.querySelector('canvas');const rc=cv.getBoundingClientRect();const pt=center(r0,c0);
      return ['xy',[rc.left+pt.x*rc.width/cv.width,rc.top+pt.y*rc.height/cv.height],(S.mode||'')+'@'+r0+','+c0]}
    S._drv=0;if(document.querySelector('[data-act="end"]'))return ['sel','[data-act="end"]','end']}return ['','','idle:'+S.phase]});
  /* force: the suggested End turn beats (heartbeat), so it is never 'stable' for Playwright — under load it never got clicked */if(r[0]==='sel')await p.click(r[1],{timeout:2000,force:true}).catch(()=>{});if(r[0]==='xy')await p.mouse.click(r[1][0],r[1][1]);return r[2]};
/* play until enough inputs are on the server (not a fixed 60 s: under load the same play takes longer), then let both windows apply
   everything sent before reading the hashes */
const t0=Date.now();let log=[];
while(Date.now()-t0<240000){const a=await drive(A),bb=await drive(B);if(a!=='wait'||bb!=='wait')log.push(a+'|'+bb);await A.waitForTimeout(250);
  const st=await A.evaluate(()=>({over:S&&S.over,n:ONLM.next}));if(st.over||(st.n>16&&Date.now()-t0>20000))break}
const applied=async()=>{const ins=await A.evaluate(async()=>(await NET.req('match.get',{id:S.onl.lobby,from:0})).inputs.map(x=>[x.seq,x.from===ONL.acct.id]));const ha=await A.evaluate(()=>ONLM.hlog),hb=await B.evaluate(()=>ONLM.hlog);
  return ins.every(([seq,fromA])=>(fromA?hb:ha)['s'+seq])};
for(let t1=Date.now();Date.now()-t1<45000&&!(await applied());)await A.waitForTimeout(300);
const sa=await A.evaluate(()=>({next:ONLM.next,turn:S.turnNo,rot:S.rotation,h:onlHash(),over:S.over,resync:ONLM.resyncing}));
await B.waitForTimeout(1500);const sb=await B.evaluate(()=>({q:ONLM.q.map(x=>x.seq+x.k+(x.a||'')),pend:!!ONLM.pend,phase:S.phase,busy:S.busy,modal:CUR_MODAL?(document.querySelector('#mTitle')||{}).textContent:null,cur:cur().name,owner:onlmOwner(),info:ONLM.info,next:ONLM.next,turn:S.turnNo,rot:S.rotation,h:onlHash(),over:S.over,resync:ONLM.resyncing,me:ONLM.me}));
const ha=await A.evaluate(()=>({h:ONLM.hlog,r:ONLM.resyncs}));const hb=await B.evaluate(()=>({h:ONLM.hlog,r:ONLM.resyncs}));
/* A's own sends (n#) are the inputs B applied (s#) in order, and vice versa: compare the pre-input hashes */
const seqA=await A.evaluate(async()=>(await NET.req('match.get',{id:S.onl.lobby,from:0})).inputs.map(x=>[x.seq,x.from===ONL.acct.id,x.h||x.pre]));
let same=0,diff=0;for(const [seq,fromA,h] of seqA){const other=fromA?hb.h['s'+seq]:ha.h['s'+seq];if(!other)continue;if(other===h)same++;else diff++}
console.log(JSON.stringify({inputs:seqA.length,same,diff,resyncA:ha.r,resyncB:hb.r}));if(ha.r||hb.r)console.log('RESYNC',JSON.stringify(await A.evaluate(()=>ONLM.lastResync)),JSON.stringify(await B.evaluate(()=>ONLM.lastResync)),JSON.stringify(seqA));console.log(JSON.stringify({sa,sb}));console.log(log.slice(0,14).join(' ; '));const res=await A.evaluate(()=>({gl:!!ONL.char&&ONL.char.stats.spd===55&&ONL.char.wallet===0&&ONL.char.rank==='tiro',price:ONLC.PRICE[3]===750,bet:ONLC.settle([{by:'a',seat:0,amt:10},{by:'b',seat:1,amt:30}],[0]).payouts.a===38}));
const miss=[];if(!res.gl)miss.push('a fresh Tiro');if(!res.price||!res.bet)miss.push('prices and wagers');if(seqA.length<12)miss.push('enough inputs ('+seqA.length+')');if(diff||ha.r||hb.r)miss.push('lockstep');if(same<seqA.length-1)miss.push('hash coverage');
console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();srv.close();if(miss.length||errs.length)process.exit(1)})();
