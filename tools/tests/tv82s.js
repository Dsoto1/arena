/* v0.82 (128-v82stands): the stands' group turn — two fighters and one ticket holder on the mock server. The ticket holder's
   popup is private, ONE stands.result input is applied in step on every screen, a stone/offering is locked to its tile
   (whoever stands there is hit / receives it, an empty tile takes the offering), a speared ticket holder is refunded, an online
   gladiator wears its sculpted token on a screen whose token style is different, and the creator starts on a random class. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1')});
const errs=[];const P={};for(const n of ['A','B','C','D']){P[n]=await ctx.newPage();P[n].on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]))}
const shots=process.env.SHOTS||'';
await P.A.goto(URL0);await P.A.evaluate(()=>localStorage.removeItem('flavius_onlmock'));for(const n of ['B','C','D'])await P[n].goto(URL0);await P.A.waitForTimeout(2500);
/* A's gladiator wears a sculpted token with a marker shape (#12ab34) */
const setup=async(p,name,cls,look)=>p.evaluate(async([name,cls,look])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls,look:look||undefined});
  /* every applied stands result: the stands and the arena right after it */
  window.__st={};const b0=st82Apply;st82Apply=async function(inp){await b0.apply(this,arguments);window.__st[inp.rot]=JSON.stringify([S.spect.map(s=>[s.cf,s.sec,s.gone?1:0,s.fav??null]),onlHash(),(S.floor||[]).length])};
  window.__pop=0;setInterval(()=>{if(document.getElementById('st82Pop'))window.__pop++},150);
  return ONL.char.look},[name,cls,look]);
const lookA={portrait:{skin:'#e0ac7e',hair:'#3a2616'},color:'#a3281f',token:{sc:'1',body:'robe',helm:'hood',hair:'long',c1:'#224488',c2:'#d6ab4c',arms:'bracers',legs:'wraps',l0:'0,50,96,14,14,0,12ab34,100,'}};
const lk={A:await setup(P.A,'Alpha','hero',lookA),B:await setup(P.B,'Beta','soldier'),C:await setup(P.C,'Gamma','slave')};
await P.C.evaluate(()=>{const w=mockLoad();w.chars[ONL.char.id].wallet=30;mockSave(w)});
/* B watches its board in another token style */
await P.B.evaluate(()=>{SETTINGS.tokenStyle='cylinder';window.__tk=[];const b0=tokenImg;tokenImg=function(sp){if(sp&&sp.baked&&sp.baked.length)window.__tk.push(JSON.stringify(sp.baked));return b0.apply(this,arguments)}});
const join=async(p,id)=>{for(let k=0;k<8;k++){const ok=await p.evaluate(async id=>{try{await NET.req('lobby.join',{id})}catch(e){}await new Promise(r=>setTimeout(r,300));
  return (await NET.req('lobby.list')).some(L=>L.id===id&&L.players.some(x=>x.id===ONL.acct.id))},id);if(ok)return true;await p.waitForTimeout(400)}return false};
const L=await P.A.evaluate(async()=>await NET.req('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:false,abandon:'cpu',ticket:5}));
await P.A.evaluate(async id=>{try{await NET.req('lobby.set',{id,ticket:5})}catch(e){}},L.id);
await join(P.B,L.id);
const tk=await P.C.evaluate(async id=>{const r=await NET.req('lobby.ticket',{id});return {w:r.char.wallet,pot:r.lobby.pot}},L.id);
const L2=await P.A.evaluate(async id=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},L.id);
await P.B.evaluate(L=>onlEnter(L),L2);await P.C.evaluate(L=>onlEnter(L),L2);
const drive=async(p,stone)=>{const r=await p.evaluate(stone=>{const sp=document.querySelector('#st82Pop');if(sp){const bs=[...sp.querySelectorAll('[data-st82]')].filter(b=>!b.disabled);if(!bs.length)return ['','','wait'];
    window.__picks=(window.__picks||0)+1;const want=window.__picks%2?/stone/:/offer/;const st=(stone&&(bs.find(b=>want.test(b.dataset.st82))||bs.find(b=>/stone|offer/.test(b.dataset.st82))))||bs[bs.length-1];st.setAttribute('data-drv','1');return ['sel','#st82Pop [data-drv="1"]','stands']}
  if(CUR_MODAL&&(!ONLM.on||onlmMine()||ONLM.info>0)){const pb=document.querySelector('#modal .mbtns .primary')?'#modal .mbtns .primary':document.querySelector('#modal .mbtns button:not([disabled])')?'#modal .mbtns button:not([disabled])':null;return pb?['sel',pb,'modal']:['','','modal?']}
  if(!S||S.over||!ONLM.on)return ['','','off'];if(!onlmMine()||S.busy)return ['','','wait'];
  if(S.phase==='choice'&&document.querySelector('[data-act="coin"]'))return ['sel','[data-act="coin"]','coin'];
  if(S.phase==='action'){S._drv=(S._drv||0)+1;try{computeHL()}catch(e){}const ks=[...HL.keys()];if(ks.length&&S._drv%3!==0){const k=ks[(S.turnNo*7+S._drv*3)%ks.length];const r0=Math.floor(k/N),c0=k%N;const cv=document.querySelector('canvas');const rc=cv.getBoundingClientRect();const pt=center(r0,c0);
      return ['xy',[rc.left+pt.x*rc.width/cv.width,rc.top+pt.y*rc.height/cv.height],'tile']}
    S._drv=0;if(document.querySelector('[data-act="end"]'))return ['sel','[data-act="end"]','end']}return ['','','idle']},stone);
  if(r[0]==='sel')await p.click(r[1],{timeout:2000}).catch(()=>{});if(r[0]==='xy')await p.mouse.click(r[1][0],r[1][1]);return r[2]};
const nRes=()=>P.A.evaluate(async()=>(await NET.req('match.get',{id:S.onl.lobby,from:0})).inputs.filter(x=>x.k==='stands.result'));
const t0=Date.now();let shot=false,during={A:0,B:0};
while(Date.now()-t0<150000){for(const n of ["A","B","C"])await drive(P[n],n==='C');
  for(const n of ['A','B'])if(await P[n].evaluate(()=>!!document.getElementById('st82Pop')))during[n]++;
  if(shots&&!shot&&await P.C.evaluate(()=>!!document.getElementById('st82Pop'))){shot=true;await P.C.screenshot({path:shots+'/stands_popup_C.png'});await P.A.screenshot({path:shots+'/stands_wait_A.png'})}
  await P.A.waitForTimeout(220);const R=await nRes();if(R.filter(x=>x.picks.length).length>=3||await P.A.evaluate(()=>S&&(S.over||S.ri>0)))break}
await P.A.waitForTimeout(2500);
const res=await nRes();
const ST={};for(const n of ['A','B','C'])ST[n]=await P[n].evaluate(()=>({st:window.__st,pop:window.__pop,hl:ONLM.hlog,r:ONLM.resyncs,applied:STD82.applied,me:ONLM.me}));
let same=0,diff=0;for(const x of res){const a=ST.A.st[x.rot],b2=ST.B.st[x.rot],c=ST.C.st[x.rot];if(a&&b2&&c){(a===b2&&a===c)?same++:diff++}
  const h=['A','B','C'].map(n=>ST[n].hl['s'+x.seq]).filter(Boolean);if(h.length===3&&!(h[0]===h[1]&&h[1]===h[2]))diff++}
const tok=await P.B.evaluate(()=>({style:SETTINGS.tokenStyle,sc:!!(S.players[0]&&S.players[0]._onlSc),marker:window.__tk.some(t=>/#12ab34/.test(t)),cpuSc:S.players.filter(p=>p.cpu).some(p=>p._onlSc),humSc:S.players.filter(p=>!p.cpu).every(p=>p._onlSc)}));
if(shots){await P.B.evaluate(()=>{try{CAM.z=2.2;camFocus&&0}catch(e){}});await P.B.screenshot({path:shots+'/stands_token_B_cylinder.png'})}
/* the refund: both fighters report the spearing of the ticket holder (seat 4) → refunded once, the holder hears it */
const w0=await P.C.evaluate(()=>{const w=mockLoad();return w.chars[ONL.char.id].wallet});
const sp1=await P.A.evaluate(async seat=>await NET.req('match.speared',{id:S.onl.lobby,seat}),4);
const sp2=await P.B.evaluate(async seat=>await NET.req('match.speared',{id:S.onl.lobby,seat}),4);
const sp3=await P.B.evaluate(async seat=>await NET.req('match.speared',{id:S.onl.lobby,seat}),4);
await P.C.waitForTimeout(600);
const ref=await P.C.evaluate(w0=>{const w=mockLoad();const L=Object.values(w.lobbies).find(x=>x.id===S.onl.lobby);return {gain:w.chars[ONL.char.id].wallet-w0,heard:STD82.refunded|0,pot:L.pot,paid:L.stands[0].paid}},w0);
await P.A.screenshot({path:(shots||'/tmp')+'/stands_after_A.png'}).catch(()=>{});
/* D (offline page): the locked tile, the refund line, the creator's random class */
const D=await P.D.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();startEvent({ev:'democritus',loc:6,seats:[{cls:'hero',cpu:true},{cls:'soldier',cpu:true},{cls:'slave',cpu:true},{cls:'amazonia',cpu:true}],seed:4242,opts:{spect:0}});
  await new Promise(r=>setTimeout(r,800));SPEED='fast';
  const s={id:900,rid:'onl:x',name:'Tester',taste:'cf',temper:'loyal',look:{},mem:[],cf:40,sec:0,mood:20,human:true,onlIdx:4,gone:false,log:[],ticket:1};S.spect.push(s);ONLM.me=-1;
  const [p0,p1]=S.players;const lines=()=>[...document.querySelectorAll('#log li')].map(li=>li.textContent);const n0=lines().length;
  /* the stone was aimed at p0's tile — p1 stands there now: p1 is the one hit */
  const r0=p0.r,c0=p0.c;p0.r=0;p0.c=6;p1.r=r0;p1.c=c0;
  let e=0;for(let r=0;r<13&&!e;r++)for(let c=0;c<13;c++)if(!playerAt(r,c)&&!npcAt(r,c)&&!pillarAt(r,c)){e=[r,c];break}
  const items1=p1.items.length;const fl0=S.floor.length;
  await st82Apply({k:'stands.result',rot:1,picks:[{seat:4,pick:{a:'stone',r:r0,c:c0}}],missed:[],from:'server'});
  const L1=lines().slice(0,lines().length-n0).join(' | ');
  await st82Apply({k:'stands.result',rot:2,picks:[{seat:4,pick:{a:'stone',r:e[0],c:e[1]}}],missed:[],from:'server'});const L2=lines()[0];
  await st82Apply({k:'stands.result',rot:3,picks:[{seat:4,pick:{a:'offer',r:r0,c:c0}}],missed:[],from:'server'});const got=p1.items.length-items1;
  await st82Apply({k:'stands.result',rot:4,picks:[{seat:4,pick:{a:'offer',r:e[0],c:e[1]}}],missed:[],from:'server'});const fl=S.floor.slice(fl0).some(f=>f.kind==='offer'&&f.r===e[0]&&f.c===e[1]);
  const cf0=s.cf;s.cf=1;await st82Apply({k:'stands.result',rot:5,picks:[{seat:4,pick:{a:'stone',r:r0,c:c0}}],missed:[],from:'server'});const poor=s.cf===1;s.cf=cf0;
  /* a spear into the stands carries the ticket holder out: the refund line */
  S.onl={lobby:'t82',fighters:4,stands:[{id:'x',name:'Tester'}],ticket:5};const sp=S.players[0];let k=0;while(!s.gone&&k<40){sp.spearUsed=false;sp.cf=10;await doSpear(sp,s);k++}
  const refund=lines().some(t=>/Flavius refunds the ticket — he hates to see his spectators speared\./.test(t));delete S.onl;
  /* the creator: a random class each time */
  ONL.acct={id:'u_test',name:'Tester'};ONL.chars=[];const cls=new Set();for(let i=0;i<20;i++){ONL.creating=null;onlCreatorHTML();cls.add(ONL.creating.cls)}
  const c0c=ONL.creating;const h=onlCreatorHTML();const tokOK=!!(c0c.look.token&&c0c.look.token.sc&&ONLC.cleanLook(c0c.look).token.sc);
  const has={nick:/data-onl82c="nick"/.test(h),home:/data-onl82c="home"/.test(h),roll:/data-onl82="roll"/.test(h),acc:/data-onl82p="ear"/.test(h)&&/data-onl82p="neck"/.test(h),tok:/id="onlCTok"/.test(h)&&/data-scbprev="onl"/.test(h)};
  return {hitP1:L1.includes(p1.name)&&!L1.includes(p0.name+' with'),L1:L1.slice(0,240),empty:/empty sand/.test(L2||''),got,fl,poor,refund,spears:k,cls:[...cls],tokOK,has}});
console.log(JSON.stringify({tk,res:res.map(x=>[x.seq,x.rot,x.picks.map(p=>p.pick.a).join('+'),x.missed.length]),same,diff,pops:[ST.A.pop,ST.B.pop,ST.C.pop],during,applied:[ST.A.applied,ST.B.applied,ST.C.applied],resync:[ST.A.r,ST.B.r,ST.C.r],tok,sp:[sp1,sp2,sp3],ref,lkA:!!(lk.A&&lk.A.token&&lk.A.token.l0),D}));
const miss=[];if(tk.pot!==5)miss.push('ticket sold');
if(res.filter(x=>x.picks.length).length<1)miss.push('stands results with picks ('+res.length+')');
if(!ST.C.pop||ST.A.pop||ST.B.pop||during.A||during.B)miss.push('the popup only on the ticket holder');
if(diff||same<1)miss.push('one result applied in step ('+same+'/'+diff+')');if(ST.A.r||ST.B.r||ST.C.r)miss.push('no resync');
if(!lk.A||!lk.A.token||!lk.A.token.l0)miss.push('the sculpt kept by cleanLook');
if(tok.style!=='cylinder'||!tok.sc||!tok.marker||tok.cpuSc||!tok.humSc)miss.push('sculpted token on a cylinder screen ('+JSON.stringify(tok)+')');
if(sp1.refunded||!sp2.refunded||sp2.amt!==5||sp3.amt!==0)miss.push('refund by majority, once');if(ref.gain!==5||ref.heard!==5||ref.pot!==0||ref.paid!==0)miss.push('refund paid ('+JSON.stringify(ref)+')');
if(!D.hitP1)miss.push('the locked tile hits whoever stands there');if(!D.empty)miss.push('a stone on empty sand misses');if(D.got!==1)miss.push('an offering on a gladiator\'s tile');if(!D.fl)miss.push('an offering on an empty tile lies on the floor');
if(!D.poor)miss.push('CF checked when applied');if(!D.refund)miss.push('the refund line');if(D.cls.length<2)miss.push('a random starting class');if(!D.tokOK)miss.push('creator token in the look');
for(const [k,v] of Object.entries(D.has))if(!v)miss.push('creator: '+k);
console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();srv.close();if(miss.length||errs.length)process.exit(1)})();
