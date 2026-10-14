/* tools/replay/online.js — the 2-seat ONLINE (mock lockstep) part of the replay harness.
   record(page): two windows (Alpha, Beta) sign in on the in-page mock server (112), sit in a Classic · Democritus with two CPUs, and play
     at Fast with tonl98f's driver (windows, coin, an attack now and then, board taps, end turn) until ≥ ONL_N inputs, then wait until both
     have applied every input. Kept in golden/online-mock.json.gz: the host's opening snapshot + the server's input stream (seq, sender's
     pre-hash) + each window's hash log (ONLM.hlog 's'+seq) + each window's state after the last input. Both windows must agree first.
   check(page): a fresh page replays that stream through 113's own watcher path (309's online playback: onlmLoad + onlmWatchOn), and every
     input must meet the same pre-hash as on both windows, the end state (onlHash, RNG.s, seats) the same. */
const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const L=require('./lib.js');const NAME='online-mock';const ONL_N=+(process.env.ONL_N||40);
const endState=()=>({h:onlHash(),rng:RNG?RNG.s:null,turns:S.turnNo,ri:S.ri,res:S.players.map(rp0Seat),npcs:(S.npcs||[]).map(n=>[n.t,n.r,n.c,n.hp,n.alive?1:0])});

async function record(PAGE){const root=path.dirname(path.resolve(PAGE)),page=path.basename(PAGE);
  const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
  await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
  try{const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
    await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0');localStorage.setItem('flavius_replay0','1');localStorage.setItem('flavius_first100off','1')});
    const errs=[];const A=await ctx.newPage(),B=await ctx.newPage();for(const [n,p] of Object.entries({A,B}))p.on('pageerror',e=>errs.push(n+':'+e.message));
    await A.goto(URL0,{timeout:90000});await A.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|match|report|over|rid)/.test(k))localStorage.removeItem(k)});
    await B.goto(URL0,{timeout:90000});for(const p of [A,B])await p.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
    /* hand-off (as tonl78/tonl98f): the mock world is one localStorage item; a window waits until it holds the last writer's copy */
    const HAND={last:null,on:true};for(const p of [A,B]){const ev=p.evaluate.bind(p);p.evaluate=async(...a)=>{const Lw=HAND.last;
      if(HAND.on&&Lw&&Lw!==p&&!Lw.isClosed()){for(const t0=Date.now();Date.now()-t0<15000;){const v=await Lw.__ev(()=>localStorage.getItem('flavius_onlmock')).catch(()=>null);
        if(v==null||await ev(v=>localStorage.getItem('flavius_onlmock')===v,v).catch(()=>true))break;await p.waitForTimeout(100)}}
      const r=await ev(...a);HAND.last=p;return r};p.__ev=ev}
    const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls})},[name,cls]);
    await setup(A,'Alpha','hero');await setup(B,'Beta','soldier');
    const Lb=await A.evaluate(async()=>{const r=await NET.req('lobby.create',{ev:'democritus',loc:5,seats:4});return r.lobby||r});const bid=await B.evaluate(()=>ONL.acct.id);
    for(let k=0;k<10;k++){await B.evaluate(async id=>{try{await NET.req('lobby.join',{id})}catch(e){}},Lb.id);let ok=false;
      for(const t0=Date.now();Date.now()-t0<4000&&!ok;){ok=await A.evaluate(([id,x])=>(mockLoad().lobbies[id].players||[]).some(p=>p.id===x),[Lb.id,bid]);if(!ok)await A.waitForTimeout(200)}if(ok)break}
    const L2=await A.evaluate(async id=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},Lb.id);await B.evaluate(L=>onlEnter(L),L2);HAND.on=false;
    const drive=async p=>{const r=await p.evaluate(()=>{if(CUR_MODAL&&(!ONLM.on||onlmMine()||ONLM.info>0)){const bs=[...document.querySelectorAll('#modal .mbtns button')].filter(b=>!b.disabled&&b.offsetParent);
          const lit=document.querySelector('#modal [data-mi]:not(.dim):not([disabled])');if(lit&&!bs.length){lit.setAttribute('data-drv','1');return ['sel','#modal [data-drv="1"]']}
          const pb=document.querySelector('#modal .mbtns .primary')?'#modal .mbtns .primary':bs.length?'#modal .mbtns button:not([disabled])':null;return pb?['sel',pb]:['']}
        if(!S||S.over||!ONLM.on||!onlmMine()||S.busy)return [''];
        if(S.phase==='command'&&document.querySelector('[data-act="cmddone"]'))return ['sel','[data-act="cmddone"]'];
        if(S.phase==='choice'&&document.querySelector('[data-act="coin"]'))return ['sel','[data-act="coin"]'];
        if(S.phase==='action'){S._drv=(S._drv||0)+1;const atk=[...document.querySelectorAll('[data-act^="m-atk"]')].filter(b=>!b.disabled);if(S._drv%4===1&&atk.length&&S.mode==='move')return ['sel','[data-act="'+atk[0].dataset.act+'"]'];
          try{computeHL()}catch(e){}const ks=[...HL.keys()];if(ks.length&&S._drv%4!==0){const k=ks[(S.turnNo*7+S._drv*3)%ks.length];const r0=Math.floor(k/N),c0=k%N;const cv=document.querySelector('canvas');const rc=cv.getBoundingClientRect();const pt=center(r0,c0);
            return ['xy',[rc.left+pt.x*rc.width/cv.width,rc.top+pt.y*rc.height/cv.height]]}
          S._drv=0;if(document.querySelector('[data-act="end"]'))return ['sel','[data-act="end"]']}return ['']});
      if(r[0]==='sel')await p.click(r[1],{timeout:2000,force:true}).catch(()=>{});if(r[0]==='xy')await p.mouse.click(r[1][0],r[1][1]).catch(()=>{})};
    const nIn=()=>A.evaluate(async()=>{try{return S&&S.onl?(await NET.req('match.get',{id:S.onl.lobby,from:0})).inputs.length:0}catch(e){return 0}}).catch(()=>0);
    let sp=false;{const t0=Date.now();let n=0;while(Date.now()-t0<300000){await drive(A);await drive(B);await A.waitForTimeout(120);
      if(!sp&&await A.evaluate(()=>!!(ONLM.on&&S&&S.phase!=='setup'))&&await B.evaluate(()=>!!(ONLM.on&&S))){for(const p of [A,B])await p.evaluate(()=>setSpeedUI('fast'));sp=true}
      if(await A.evaluate(()=>!S||S.over))break;if(++n%10===0&&await nIn()>=ONL_N)break}}
    /* stop moving; both windows apply every input and settle */
    const g=await A.evaluate(async()=>await NET.req('match.get',{id:S.onl.lobby,from:0}));const top=g.inputs.length?g.inputs[g.inputs.length-1].seq:-1;
    for(const t1=Date.now();Date.now()-t1<60000;){const ok=await Promise.all([A,B].map(p=>p.evaluate(t=>ONLM.next>t&&!ONLM.q.length&&!ONLM.pend&&!S.busy&&(S.over||['choice','action','command'].includes(S.phase)),top).catch(()=>false)));
      if(ok.every(Boolean))break;await A.waitForTimeout(250)}
    const g2=await A.evaluate(async()=>await NET.req('match.get',{id:S.onl.lobby,from:0}));
    if(g2.inputs.length!==g.inputs.length)throw new Error('the stream grew while settling ('+g.inputs.length+' → '+g2.inputs.length+')');
    const st=p=>p.evaluate(fn=>({hlog:ONLM.hlog,resync:ONLM.resyncs|0,end:(0,eval)('('+fn+')')()}),endState.toString());
    const X={A:await st(A),B:await st(B)};const out={f:'flavius-golden',gv:1,name:NAME,at:new Date().toISOString(),open:g.open,inputs:g.inputs,A:X.A,B:X.B,errs};
    await ctx.close();return out}
  finally{await b.close();srv.close()}}

/* the windows agree with each other (and with each sender's own pre-hash) — else the recording itself is no golden */
function agree(G){const bad=[];for(const inp of G.inputs){const want=inp.k==='modal'?inp.pre:inp.h;for(const n of ['A','B']){const h=G[n].hlog['s'+inp.seq];if(h&&want&&h!==want&&h!=='g89')bad.push(`${n} s${inp.seq} ${inp.k}`)}}
  const d=L.diff(G.A.end,G.B.end);if(d)bad.push('end A≠B: '+d.field);if(G.A.resync||G.B.resync)bad.push('resyncs '+G.A.resync+'/'+G.B.resync);return bad}

async function replayOne(b,PAGE,G){const {pg,ctx,errs}=await L.openPage(b,PAGE);try{const top=G.inputs.length?G.inputs[G.inputs.length-1].seq:-1;
    await pg.evaluate(async G=>{await rp100Play('onlgold',{force:true,R:{f:'flavius-replay',fv:1,id:'onlgold',kind:'onl',v:GAME_VER,at:Date.now(),mode:'onl',title:'golden',sub:'',open:G.open,inputs:G.inputs,end:{}}});rp100Speed(4)},G);
    await pg.waitForFunction(t=>typeof ONLM!=='undefined'&&ONLM.next>t&&!ONLM.q.length&&!ONLM.pend&&S&&!S.busy&&(S.over||['choice','action','command'].includes(S.phase)),top,{timeout:240000,polling:250}).catch(()=>{});
    return await pg.evaluate(fn=>({next:ONLM.next,hlog:ONLM.hlog,end:(0,eval)('('+fn+')')(),errs:errNew92(window.__m).map(e=>e.msg)}),endState.toString())}finally{await ctx.close()}}

async function check(PAGE){const f=L.fileOf(NAME);if(!fs.existsSync(f)){console.log('FAIL   online-mock: no golden — node tools/replay/record.js online-mock');return false}
  const G=L.load(f);const b=await chromium.launch();const t0=Date.now();try{const o=await replayOne(b,PAGE,G);
    for(const inp of G.inputs){const want=G.A.hlog['s'+inp.seq]||G.B.hlog['s'+inp.seq];const got=o.hlog['s'+inp.seq];
      if(want&&want!=='g89'&&got!==want){console.log('FAIL   online-mock'.padEnd(25),`first divergence: input seq ${inp.seq} (${inp.k}${inp.a?' '+inp.a:''}, seat ${inp.seat}) pre-hash want ${want} got ${got||'(not applied)'}`);return false}}
    const d=L.diff(G.A.end,o.end);if(d){console.log('FAIL   online-mock'.padEnd(25),'end differs: '+d.field,'\n        want:',d.want,'\n        got: ',d.got);return false}
    console.log('ok    ','online-mock'.padEnd(18),`${G.inputs.length} lockstep inputs · hash ${o.end.h} · rng ${o.end.rng} = Alpha = Beta · ${Math.round((Date.now()-t0)/1000)} s`+(o.errs.length?' · page errors '+JSON.stringify(o.errs).slice(0,200):''));return true}
  finally{await b.close()}}
module.exports={record,check,agree,NAME};
