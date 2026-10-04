/* online (phase 4): the same two-window lockstep match, but through the REAL server code — server/src/index.js's handler on a
   local WebSocket server (server/test/localws.js, in-memory store, dev sign-in) instead of the in-page mock.
   Needs server/node_modules (cd server && npm install); without it the test says SKIP and passes. */
const http=require('http'),fs=require('fs'),path=require('path');
let LWS;try{LWS=require('../../server/test/localws.js')}catch(e){console.log('SKIP — no server/node_modules (cd server && npm install)');console.log('MISS',[]);console.log('ERRS',[]);process.exit(0)}
const {chromium}=require('playwright');(async()=>{const WS=await LWS.start(0);const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1')});await ctx.addInitScript(p=>{localStorage.setItem('flavius_onlserver',JSON.stringify({ws:'ws://127.0.0.1:'+p,dev:true}))},WS.port);
const errs=[];const A=await ctx.newPage(),B=await ctx.newPage();for(const [n,p] of [['A',A],['B',B]])p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));
await A.goto(URL0);await B.goto(URL0);await A.waitForTimeout(2500);
const setup=async(p,name)=>{await p.evaluate(async(name)=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();await netPick();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls:name==='Alpha'?'hero':'soldier'})},name)};
await setup(A,'Alpha');await setup(B,'Beta');
const L=await A.evaluate(async()=>await NET.req('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:false}));
await A.waitForTimeout(300);await B.evaluate(async(id)=>await NET.req('lobby.join',{id}),L.id);
const L2=await A.evaluate(async(id)=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},L.id);
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
  if(r[0]==='sel')await p.click(r[1],{timeout:2000}).catch(()=>{});if(r[0]==='xy')await p.mouse.click(r[1][0],r[1][1]);return r[2]};
const t0=Date.now();let log=[];
while(Date.now()-t0<60000){const a=await drive(A),bb=await drive(B);if(a!=='wait'||bb!=='wait')log.push(a+'|'+bb);await A.waitForTimeout(250);
  const st=await A.evaluate(()=>S&&S.over);if(st)break}
const sa=await A.evaluate(()=>({next:ONLM.next,turn:S.turnNo,rot:S.rotation,h:onlHash(),over:S.over,resync:ONLM.resyncing}));
await B.waitForTimeout(1500);const sb=await B.evaluate(()=>({q:ONLM.q.map(x=>x.seq+x.k+(x.a||'')),pend:!!ONLM.pend,phase:S.phase,busy:S.busy,modal:CUR_MODAL?(document.querySelector('#mTitle')||{}).textContent:null,cur:cur().name,owner:onlmOwner(),info:ONLM.info,next:ONLM.next,turn:S.turnNo,rot:S.rotation,h:onlHash(),over:S.over,resync:ONLM.resyncing,me:ONLM.me}));
const ha=await A.evaluate(()=>({h:ONLM.hlog,r:ONLM.resyncs}));const hb=await B.evaluate(()=>({h:ONLM.hlog,r:ONLM.resyncs}));
/* A's own sends (n#) are the inputs B applied (s#) in order, and vice versa: compare the pre-input hashes */
const seqA=await A.evaluate(async()=>(await NET.req('match.get',{id:S.onl.lobby,from:0})).inputs.map(x=>[x.seq,x.from===ONL.acct.id,x.h||x.pre]));
let same=0,diff=0;for(const [seq,fromA,h] of seqA){const other=fromA?hb.h['s'+seq]:ha.h['s'+seq];if(!other)continue;if(other===h)same++;else diff++}
console.log(JSON.stringify({inputs:seqA.length,same,diff,resyncA:ha.r,resyncB:hb.r}));console.log(JSON.stringify({sa,sb}));console.log(log.slice(0,14).join(' ; '));const res=await A.evaluate(()=>({gl:!!ONL.char&&ONL.char.stats.spd===55&&ONL.char.wallet===0&&ONL.char.rank==='tiro',price:ONLC.PRICE[3]===750,bet:ONLC.settle([{by:'a',seat:0,amt:10},{by:'b',seat:1,amt:30}],[0]).payouts.a===38}));
const mode=await A.evaluate(()=>NET.mode);const miss=[];if(mode!=='aws')miss.push('the real transport');if(!res.gl)miss.push('a fresh Tiro');if(!res.price||!res.bet)miss.push('prices and wagers');if(seqA.length<12)miss.push('enough inputs ('+seqA.length+')');if(diff||ha.r||hb.r)miss.push('lockstep');if(same<seqA.length-1)miss.push('hash coverage');
console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();srv.close();WS.close();if(miss.length||errs.length)process.exit(1)})();
