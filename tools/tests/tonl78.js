/* online: a party of two in Familia (one team, CPUs on the other), a ticket holder taking stands turns (v0.82: the group turn's private popup), and a free watcher
   who joins mid-match from a fighter's snapshot — four windows on the mock server, all in lockstep */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1')});
const errs=[];const P={};for(const n of ['A','B','C','D']){P[n]=await ctx.newPage();P[n].on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]))}
await P.A.goto(URL0);await P.A.evaluate(()=>localStorage.removeItem('flavius_onlmock'));for(const n of ['B','C','D'])await P[n].goto(URL0);await P.A.waitForTimeout(2500);
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls})},[name,cls]);
await setup(P.A,'Alpha','hero');await setup(P.B,'Beta','soldier');await setup(P.C,'Gamma','slave');await setup(P.D,'Delta','amazonia');
/* C needs coin for the ticket (the mock world is shared localStorage) */
await P.C.evaluate(()=>{const w=mockLoad();w.chars[ONL.char.id].wallet=30;mockSave(w)});
const code=await P.A.evaluate(async()=>(ONL.party=await NET.req('party.create')).code);
await P.B.evaluate(async c=>{ONL.party=await NET.req('party.join',{code:c})},code);
const lead=await P.B.evaluate(async()=>{try{await NET.req('lobby.create',{ev:'familia',loc:5,ranked:false});return 'created'}catch(e){return e.message}});
const L=await P.A.evaluate(async()=>await NET.req('lobby.create',{ev:'familia',loc:5,ranked:false,ticket:5}));
const tk=await P.C.evaluate(async id=>{const r=await NET.req('lobby.ticket',{id});return {w:r.char.wallet,pot:r.lobby.pot}},L.id);
const L2=await P.A.evaluate(async id=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},L.id);
await P.B.evaluate(L=>onlEnter(L),L2);await P.C.evaluate(L=>onlEnter(L),L2);
const late=await P.C.evaluate(async id=>{try{await NET.req('lobby.ticket',{id});return 'sold'}catch(e){return e.message}},L.id);
const drive=async(p,stone)=>{const r=await p.evaluate(stone=>{const sp=document.querySelector('#st82Pop');if(sp){const bs=[...sp.querySelectorAll('[data-st82]')].filter(b=>!b.disabled);if(!bs.length)return ['','','wait'];const st=(stone&&bs.find(b=>/stone|offer/.test(b.dataset.st82)))||bs[bs.length-1];st.setAttribute('data-drv','1');return ['sel','#st82Pop [data-drv="1"]','stands']}if(CUR_MODAL&&(!ONLM.on||onlmMine()||ONLM.info>0)){const bs=[...document.querySelectorAll('#modal .mbtns button')].filter(b=>!b.disabled);
    const st=stone&&bs.find(b=>/Throw a stone|Throw an offering/.test(b.textContent));if(st){st.setAttribute('data-drv','1');return ['sel','#modal [data-drv="1"]','stands']}
    const pb=document.querySelector('#modal .mbtns .primary')?'#modal .mbtns .primary':bs.length?'#modal .mbtns button:not([disabled])':null;return pb?['sel',pb,'modal']:['','','modal?']}
  if(!S||S.over||!ONLM.on)return ['','','off'];if(!onlmMine()||S.busy)return ['','','wait'];
  if(S.phase==='choice'&&document.querySelector('[data-act="coin"]'))return ['sel','[data-act="coin"]','coin'];
  if(S.phase==='action'){S._drv=(S._drv||0)+1;const atk=[...document.querySelectorAll('[data-act^="m-atk"]')].filter(b=>!b.disabled);
    if(S._drv%4===1&&atk.length&&S.mode==='move')return ['sel','[data-act="'+atk[0].dataset.act+'"]','mode'];
    try{computeHL()}catch(e){}const ks=[...HL.keys()];if(ks.length&&S._drv%4!==0){const k=ks[(S.turnNo*7+S._drv*3)%ks.length];const r0=Math.floor(k/N),c0=k%N;const cv=document.querySelector('canvas');const rc=cv.getBoundingClientRect();const pt=center(r0,c0);
      return ['xy',[rc.left+pt.x*rc.width/cv.width,rc.top+pt.y*rc.height/cv.height],'tile']}
    S._drv=0;if(document.querySelector('[data-act="end"]'))return ['sel','[data-act="end"]','end']}return ['','','idle']},stone);
  if(r[0]==='sel')await p.click(r[1],{timeout:2000}).catch(()=>{});if(r[0]==='xy')await p.mouse.click(r[1][0],r[1][1]);return r[2]};
const t0=Date.now();let watching=false;const acts={A:0,B:0,C:0};
while(Date.now()-t0<(process.env.T78||110000)){for(const n of ['A','B','C']){const v=await drive(P[n],n==='C');if(v!=='wait'&&v!=='off'&&v!=='idle')acts[n]++}
  if(!watching&&Date.now()-t0>9000){watching=true;await P.D.evaluate(async id=>{ONL.lobbies=await NET.req('lobby.list');onlWatch(ONL.lobbies.find(x=>x.id===id))},L.id)}
  await P.A.waitForTimeout(250);if(await P.A.evaluate(()=>S&&S.over))break}
await P.A.waitForTimeout(2500);
const inputs=await P.A.evaluate(async()=>(await NET.req('match.get',{id:S.onl.lobby,from:0})).inputs.map(x=>[x.seq,x.from,x.h||x.pre,x.k]));
const H={};for(const n of ['A','B','C','D'])H[n]=await P[n].evaluate(()=>({h:ONLM.hlog,r:ONLM.resyncs,me:ONLM.me,acct:ONL.acct.id,on:!!(S&&S.onl),watch:!!(S&&S.onl&&S.onl.watch),next:ONLM.next}));
let same=0,diff=0,dSame=0,dDiff=0;const diffs=[];for(const [seq,from,h] of inputs){if(!h)continue;/* server inputs (v0.82 stands.result) carry no hash */for(const n of ['A','B','C','D']){if(H[n].acct===from)continue;const o=H[n].h['s'+seq];if(!o)continue;const ok=o===h;if(n==='D'){ok?dSame++:dDiff++}else{ok?same++:(diff++,diffs.push(n+seq))}}}

const setupA=await P.A.evaluate(()=>({teams:S.players.map(p=>p.team),names:S.players.map(p=>p.name),stands:(S.spect||[]).filter(s=>s.human).map(s=>[s.name,s.onlIdx])}));
const fromC=await P.A.evaluate(async seat=>(await NET.req('match.get',{id:S.onl.lobby,from:0})).inputs.filter(x=>x.k==='stands.result'&&(x.picks||[]).some(p=>p.seat===seat)).length,4);
console.log(JSON.stringify({lead,tk,late,inputs:inputs.length,fromC,same,diff,dSame,dDiff,resync:[H.A.r,H.B.r,H.C.r,H.D.r],watch:H.D.watch,dNext:H.D.next,aNext:H.A.next,acts,setupA,diffs:diffs.slice(0,6)}));
const miss=[];if(!/leader picks/.test(lead))miss.push('only the leader picks');if(tk.w!==25||tk.pot!==5)miss.push('ticket paid into the pot');if(!/until the horns/.test(late))miss.push('tickets close at the horns');
if(JSON.stringify(setupA.teams.slice(0,2))!=='["A","A"]'||setupA.teams.filter(t=>t==='B').length!==2)miss.push('the party on one team');
if(!setupA.stands.length||setupA.stands[0][1]!==4)miss.push('the ticket holder in the stands');if(!fromC)miss.push('stands decisions from the ticket holder');
if(inputs.length<12)miss.push('enough inputs ('+inputs.length+')');if(diff||H.A.r||H.B.r||H.C.r)miss.push('lockstep');if(!H.D.watch||dSame<4||dDiff)miss.push('the watcher in step ('+dSame+'/'+dDiff+')');
console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();srv.close();if(miss.length||errs.length)process.exit(1)})();
