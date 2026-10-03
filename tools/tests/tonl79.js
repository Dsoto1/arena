/* online v0.79: the pre-match room (1 lanista cannot start, quick-chat phrases — v0.80: no free text), a gladiator's own look on the other screen, rejoin after a reload,
   abandon (Custom, eliminated) and the last lanista leaving shuts the match down */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1')});
const errs=[];const A=await ctx.newPage(),B=await ctx.newPage();for(const [n,p] of [['A',A],['B',B]])p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));
await A.goto(URL0);await A.evaluate(()=>localStorage.removeItem('flavius_onlmock'));await B.goto(URL0);await A.waitForTimeout(2500);
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls})},[name,cls]);
await setup(A,'Alpha','hero');await setup(B,'Beta','soldier');
const look=await A.evaluate(async()=>{const c=await NET.req('char.edit',{char:ONL.char.id,look:{portrait:{skin:'#c68e5f',helm:'galea'},color:'#2255aa',token:{c1:'#2255aa',helm:'crested',shield:'scutum'}}});ONL.char=c;return c.look});
const L=await A.evaluate(async()=>await NET.req('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:false,abandon:'fate'}));
const solo=await A.evaluate(async id=>{try{await NET.req('lobby.start',{id});return 'started'}catch(e){return e.message}},L.id);
await B.evaluate(async id=>{await NET.req('lobby.join',{id});await NET.req('lobby.say',{id,q:'ave'})},L.id);
const chat=await A.evaluate(async id=>{await NET.req('lobby.say',{id,q:'luck'});let free='';try{await NET.req('lobby.chat',{id,text:'free text'})}catch(e){free=e.message}return (await NET.req('lobby.chatlog',{id})).map(m=>m.name+': '+ONLC.QC_TEXT[m.q]).concat(free?[]:['FREE TEXT'])},L.id);
const L2=await A.evaluate(async id=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},L.id);
await B.evaluate(L=>onlEnter(L),L2);
const drive=async p=>{const r=await p.evaluate(()=>{if(CUR_MODAL&&(!ONLM.on||onlmMine()||ONLM.info>0)){const t=(document.querySelector('#mTitle')||{}).textContent||'';const pb=document.querySelector('#modal .mbtns .primary')?'#modal .mbtns .primary':document.querySelector('#modal .mbtns button')?'#modal .mbtns button':null;return pb?['sel',pb,'modal:'+t.slice(0,24)]:['','','modal?']}
  if(!S||S.over||!ONLM.on)return ['','','off'];if(!onlmMine()||S.busy)return ['','','wait'];
  if(S.phase==='choice'&&document.querySelector('[data-act="coin"]'))return ['sel','[data-act="coin"]','coin'];
  if(S.phase==='action'){S._drv=(S._drv||0)+1;const atk=[...document.querySelectorAll('[data-act^="m-atk"]')].filter(b=>!b.disabled);
    if(S._drv%4===1&&atk.length&&S.mode==='move')return ['sel','[data-act="'+atk[0].dataset.act+'"]','mode:'+atk[0].dataset.act];
    try{computeHL()}catch(e){}const ks=[...HL.keys()];if(ks.length&&S._drv%4!==0){const k=ks[(S.turnNo*7+S._drv*3)%ks.length];const r0=Math.floor(k/N),c0=k%N;const cv=document.querySelector('canvas');const rc=cv.getBoundingClientRect();const pt=center(r0,c0);
      return ['xy',[rc.left+pt.x*rc.width/cv.width,rc.top+pt.y*rc.height/cv.height],(S.mode||'')+'@'+r0+','+c0]}
    S._drv=0;if(document.querySelector('[data-act="end"]'))return ['sel','[data-act="end"]','end']}return ['','','idle:'+S.phase]});
  if(r[0]==='sel')await p.click(r[1],{timeout:2000}).catch(()=>{});if(r[0]==='xy')await p.mouse.click(r[1][0],r[1][1]);return r[2]};
const run=async ms=>{const t0=Date.now();while(Date.now()-t0<ms){await drive(A);await drive(B);await A.waitForTimeout(250);if(await A.evaluate(()=>!S||S.over))break}};
await run(25000);
const seen=await B.evaluate(()=>({tok:!!(S.players[0]._onlTok&&S.players[0]._onlTok.helm==='crested'),art:pArt(S.players[0]).includes('portrait'),bar:document.body.classList.contains('onlarena'),newHidden:getComputedStyle(document.getElementById('btnNew')).display==='none',leave:(document.getElementById('btnOnlLeave')||{}).textContent}));
/* B reloads the page and rejoins from a snapshot */
await B.reload();await B.waitForTimeout(2500);const back=await B.evaluate(async id=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();await onlRefresh();const L=ONL.lobbies.find(x=>x.id===id);await onlAttach(L,'seat');return true},L.id);
await B.waitForTimeout(6000);const rj=await B.evaluate(()=>({on:ONLM.on,me:ONLM.me,watch:!!(S&&S.onl&&S.onl.watch)}));
const hB0=await B.evaluate(()=>Object.keys(ONLM.hlog).length);
await run(20000);
const ha=await A.evaluate(()=>({h:ONLM.hlog,r:ONLM.resyncs}));const hb=await B.evaluate(()=>({h:ONLM.hlog,r:ONLM.resyncs}));
const ins=await A.evaluate(async()=>(await NET.req('match.get',{id:S.onl.lobby,from:0})).inputs.map(x=>[x.seq,x.from===ONL.acct.id,x.h||x.pre]));
let same=0,diff=0;for(const [seq,fromA,h] of ins){const other=fromA?hb.h['s'+seq]:ha.h['s'+seq];if(!other)continue;if(other===h)same++;else diff++}
/* B abandons (Custom, rule 'fate'): eliminated at B's next turn on A's screen */
const over0=await A.evaluate(()=>S.over);
await B.evaluate(()=>{ONLM.uiAt=Date.now()});await B.click('#btnOnlLeave').catch(()=>{});await B.waitForTimeout(500);await B.click('#modal .mbtns button:not(.primary)').catch(()=>{});await B.waitForTimeout(1500);
const bLeft=await B.evaluate(()=>({on:ONLM.on,left:!!(ONL.leftMatch||{})[Object.keys(ONL.leftMatch||{})[0]]}));
const t1=Date.now();let bOut=null;while(Date.now()-t1<40000){await drive(A);await A.waitForTimeout(250);bOut=await A.evaluate(()=>({alive:S.players[1].alive,over:S.over,marked:!!(ONLM.left&&ONLM.left[1])}));if(!bOut.alive||bOut.over)break}
/* the last lanista leaves: the match shuts down */
await A.evaluate(()=>{ONLM.uiAt=Date.now()});const last=await A.evaluate(async id=>{const r=await NET.req('match.abandon',{id});return (await NET.req('lobby.list')).some(x=>x.id===id)},L.id);
console.log(JSON.stringify({solo,chat,look:!!look.token,seen,back,rj,inputs:ins.length,same,diff,resync:[ha.r,hb.r],bLeft,bOut,over0,listed:last}));
const miss=[];if(!/at least 2/.test(solo))miss.push('one lanista cannot start');if(chat.length!==2)miss.push('chat');if(!seen.tok||!seen.art)miss.push('own token/portrait on the other screen');
if(!seen.bar||!seen.newHidden||!/Abandon/.test(seen.leave||''))miss.push('online bar');if(!rj.on||rj.me!==1||rj.watch)miss.push('rejoin');if(diff||ha.r||hb.r)miss.push('lockstep after rejoin');if(ins.length<10)miss.push('enough inputs');
if(bLeft.on||!bLeft.left)miss.push('abandon leaves');if(!bOut||!(bOut.marked&&(!bOut.alive||bOut.over)))miss.push('abandoned seat eliminated');if(last)miss.push('shut down when the last leaves');
console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();srv.close();if(miss.length||errs.length)process.exit(1)})();
