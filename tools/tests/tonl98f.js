/* online lockstep at mixed speeds (254-v98fastonl; mock, two windows): Alpha plays at FAST, Beta at NORMAL, a Classic (Democritus) with
   two CPUs. Beta's window is made slow at the end of a turn (its flushMF waits 1.5 s while the phase is still 'action' — what a slower
   machine or Normal-speed animations do), so Alpha's next-turn moves reach Beta while Beta is still inside the old endTurn. Before the
   fix those moves were applied there (hash mismatch → resync). Now: every input hashes the same on both windows, no resync, no stuck
   skip, and Beta reports it held a move until the turn had really ended (F98.held > 0). ERRS must be []. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_tally102off','1');localStorage.setItem('flavius_onlcd83','0')});
const errs=[];const A=await ctx.newPage(),B=await ctx.newPage();for(const [n,p] of Object.entries({A,B}))p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));
await A.goto(URL0,{timeout:90000});await A.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|match|report|over|rid)/.test(k))localStorage.removeItem(k)});
await B.goto(URL0,{timeout:90000});for(const p of [A,B])await p.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
/* HAND-OFF (as tonl78): the mock world is one localStorage item; a window waits until it holds the last writer's copy before it acts */
const HAND={last:null,on:true};for(const p of [A,B]){const ev=p.evaluate.bind(p);p.evaluate=async(...a)=>{const L=HAND.last;
  if(HAND.on&&L&&L!==p&&!L.isClosed()){for(const t0=Date.now();Date.now()-t0<15000;){const v=await L.__ev(()=>localStorage.getItem('flavius_onlmock')).catch(()=>null);
    if(v==null||await ev(v=>localStorage.getItem('flavius_onlmock')===v,v).catch(()=>true))break;await p.waitForTimeout(100)}}
  const r=await ev(...a);HAND.last=p;return r};p.__ev=ev}
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls})},[name,cls]);
await setup(A,'Alpha','hero');await setup(B,'Beta','soldier');
const L=await A.evaluate(async()=>{const r=await NET.req('lobby.create',{ev:'democritus',loc:5,seats:4});return r.lobby||r});
const bid=await B.evaluate(()=>ONL.acct.id);
for(let k=0;k<10;k++){await B.evaluate(async id=>{try{await NET.req('lobby.join',{id})}catch(e){}},L.id);let ok=false;
  for(const t0=Date.now();Date.now()-t0<4000&&!ok;){ok=await A.evaluate(([id,x])=>(mockLoad().lobbies[id].players||[]).some(p=>p.id===x),[L.id,bid]);if(!ok)await A.waitForTimeout(200)}if(ok)break}
const L2=await A.evaluate(async id=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},L.id);await B.evaluate(L=>onlEnter(L),L2);HAND.on=false;
/* Beta: a slow end of turn (test hook only) */
await B.evaluate(()=>{const f=flushMF;flushMF=async function(){const r=await f.apply(this,arguments);if(S&&S.onl&&S.phase==='action'&&!S.busy)await new Promise(q=>setTimeout(q,1500));return r}});
const drive=async p=>{const r=await p.evaluate(()=>{if(CUR_MODAL&&(!ONLM.on||onlmMine()||ONLM.info>0)){const bs=[...document.querySelectorAll('#modal .mbtns button')].filter(b=>!b.disabled&&b.offsetParent);
      const lit=document.querySelector('#modal [data-mi]:not(.dim):not([disabled])');if(lit&&!bs.length){lit.setAttribute('data-drv','1');return ['sel','#modal [data-drv="1"]','pick']}
      const pb=document.querySelector('#modal .mbtns .primary')?'#modal .mbtns .primary':bs.length?'#modal .mbtns button:not([disabled])':null;return pb?['sel',pb,'modal']:['','','modal?']}
    if(!S||S.over||!ONLM.on)return ['','','off'];if(!onlmMine()||S.busy)return ['','','wait'];
    if(S.phase==='command'&&document.querySelector('[data-act="cmddone"]'))return ['sel','[data-act="cmddone"]','cmddone'];
    if(S.phase==='choice'&&document.querySelector('[data-act="coin"]'))return ['sel','[data-act="coin"]','coin'];
    if(S.phase==='action'){S._drv=(S._drv||0)+1;const atk=[...document.querySelectorAll('[data-act^="m-atk"]')].filter(b=>!b.disabled);if(S._drv%4===1&&atk.length&&S.mode==='move')return ['sel','[data-act="'+atk[0].dataset.act+'"]','atk'];
      try{computeHL()}catch(e){}const ks=[...HL.keys()];if(ks.length&&S._drv%4!==0){const k=ks[(S.turnNo*7+S._drv*3)%ks.length];const r0=Math.floor(k/N),c0=k%N;const cv=document.querySelector('canvas');const rc=cv.getBoundingClientRect();const pt=center(r0,c0);
        return ['xy',[rc.left+pt.x*rc.width/cv.width,rc.top+pt.y*rc.height/cv.height],'tile']}
      S._drv=0;if(document.querySelector('[data-act="end"]'))return ['sel','[data-act="end"]','end']}return ['','','idle']});
  if(r[0]==='sel')await p.click(r[1],{timeout:2000,force:true}).catch(()=>{});if(r[0]==='xy')await p.mouse.click(r[1][0],r[1][1]).catch(()=>{});return r[2]};
const nIn=()=>A.evaluate(async()=>{try{return S&&S.onl?(await NET.req('match.get',{id:S.onl.lobby,from:0})).inputs.length:0}catch(e){return 0}}).catch(()=>0);
/* the speeds are set once the arena is up (every event starts on Slow); Beta keeps Normal through any window's pause */
let sp=false;{const t0=Date.now();let n=0;while(Date.now()-t0<240000){await drive(A);await drive(B);await A.waitForTimeout(150);
  if(!sp&&await A.evaluate(()=>!!(ONLM.on&&S&&S.phase!=='setup'))&&await B.evaluate(()=>!!(ONLM.on&&S))){await A.evaluate(()=>setSpeedUI('fast'));await B.evaluate(()=>setSpeedUI('normal'));sp=true}
  if(await A.evaluate(()=>!S||S.over))break;if(++n%10===0&&Date.now()-t0>30000&&await nIn()>=45)break}}
/* both windows have applied every input */
for(const t1=Date.now();Date.now()-t1<40000;){const top=await A.evaluate(async()=>{const ins=(await NET.req('match.get',{id:S.onl.lobby,from:0})).inputs;return ins.length?ins[ins.length-1].seq:0}).catch(()=>0);
  const ns=await Promise.all([A,B].map(p=>p.evaluate(()=>ONLM.next).catch(()=>0)));if(ns.every(x=>x>top))break;await drive(A);await drive(B);await A.waitForTimeout(300)}
const inputs=await A.evaluate(async()=>(await NET.req('match.get',{id:S.onl.lobby,from:0})).inputs.map(x=>[x.seq,x.from,x.k==="modal"&&x.pre?x.pre:(x.h||x.pre),x.k,x.a||'']));
const st=p=>p.evaluate(()=>({h:ONLM.hlog,r:ONLM.resyncs,last:ONLM.lastResync||null,acct:ONL.acct.id,sp:SPEED==='pause'&&MODAL_PAUSE?MODAL_PAUSE:SPEED,bad:typeof ONL80F!=='undefined'?ONL80F.badSkips:0,held:typeof F98!=='undefined'?F98.held:-1,turn:S&&S.turnNo}));
const X={A:await st(A),B:await st(B)};
let same=0,diff=[];for(const [seq,from,h,k,a] of inputs){if(!h)continue;for(const n of ['A','B']){if(X[n].acct===from)continue;const o=X[n].h['s'+seq];if(!o)continue;if(o===h)same++;else diff.push([n,seq,k,a])}}
const out={inputs:inputs.length,kinds:[...new Set(inputs.map(x=>x[3]))],same,diff:diff.slice(0,6),resync:[X.A.r,X.B.r],last:[X.A.last,X.B.last],bad:[X.A.bad,X.B.bad],held:X.B.held,turn:X.A.turn,speeds:[X.A.sp,X.B.sp]};
console.log(JSON.stringify(out));
const miss=[];
if(out.inputs<20||same<15)miss.push('enough moves played '+out.inputs+'/'+same);
if(diff.length)miss.push('every input hashes the same on both windows');
if(X.A.r||X.B.r)miss.push('no resync');if(X.A.bad||X.B.bad)miss.push('no stuck skip');
if(!(X.B.held>0))miss.push('the slow window held a move until the turn ended');
if(X.A.sp!=='fast')miss.push('Alpha at Fast');
console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();srv.close();if(miss.length||errs.length)process.exit(1)})();
