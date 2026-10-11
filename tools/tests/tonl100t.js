/* v1.0: online, a CPU never offers a truce or a trade to a human seat (no window on either screen, even with window B in Spanish); hashes agree, no resync
   (the page is served over http from the page's folder — file:// pages do not share storage between windows) */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0');});
const errs=[];const A=await ctx.newPage(),B=await ctx.newPage();for(const [n,p] of [['A',A],['B',B]])p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));
await A.goto(URL0,{timeout:90000});await A.evaluate(()=>localStorage.removeItem('flavius_onlmock'));await A.evaluate(()=>localStorage.setItem('flavius_lang','es'));await B.goto(URL0,{timeout:90000});await A.evaluate(()=>localStorage.removeItem('flavius_lang'));for(const P of [A,B])await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
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
await sync(A,B);
for(const P of [A,B]){for(let k=0;k<120;k++){const ok=await P.evaluate(()=>{if(typeof S==='undefined'||!S||!S.onl)return false;if(CUR_MODAL&&/briefing/i.test((document.querySelector('#mTitle')||{}).textContent||'')){const b=document.querySelector('#modal .mbtns .primary')||document.querySelector('#modal .mbtns button');if(b)b.click()}return !!(ONLM.on&&S.players&&S.players.length>=3&&!CUR_MODAL)});if(ok)break;await P.waitForTimeout(500)}}
const lang=await B.evaluate(()=>LANG);
/* force the diplomacy roll: every dice call is 0 (chance passes), count the windows a CPU's offer would open */
const probe=async(P,hideOnl)=>P.evaluate(async(hideOnl)=>{const res={offers:0,last:null,titles:[]};const bm=modal;modal=function(t){res.offers++;res.titles.push(String(t));return Promise.resolve(0)};
  const saveOnl=S.onl,rs=Math.random;const r0=rand;const cpus=S.players.filter(p=>p.cpu&&!p.dead&&p.diff!=='easy');res.cpus=cpus.length;
  const sv={lo:S.lastOffer,nt:S.noTruce};try{
    for(const p of cpus){const rel0=p.rel;p.rel=Object.assign({},rel0);S.players.forEach(q=>{if(!q.cpu)p.rel[q.id]=30});S.lastOffer=-99;const st=S.rngState!==undefined?S.rngState:null;
      if(hideOnl)S.onl=null;
      /* a pvp round, 3+ active, chance forced */
      const pos=S.players.map(q=>[q.r,q.c]);S.players.forEach((q,ix)=>{q.r=5+(ix>>1);q.c=5+(ix&1)});const rdd=RD();const pv0=rdd.pvp;rdd.pvp=1;const dbg={pvp:RD().pvp,act:activePlayers().length};res.dbg=dbg;
      res.gate=[EV().noTruce,S.truceGone,S.tutorial,RD().pvp,p.diff,!!EV().teams,tradePartners(p).length,tradePartners(p).filter(o=>!friendly(p,o)).length,tradePartners(p).filter(o=>!inTruce(p,o)).length,tradePartners(p).filter(o=>relOf(p,o)>-60).length,S.turnNo];const rk=RNG;try{RNG={next:()=>0,s:0};await cpuDiplomacy(p)}finally{RNG=rk;S.onl=saveOnl;rdd.pvp=pv0;p.rel=rel0;S.players.forEach((q,ix)=>{q.r=pos[ix][0];q.c=pos[ix][1]})}}
  }finally{modal=bm}
  return res},hideOnl);
const info=await A.evaluate(()=>({pvp:RD().pvp,act:activePlayers().length,humans:S.players.filter(p=>!p.cpu).length,cpus:S.players.filter(p=>p.cpu).length}));
console.log('INFO',JSON.stringify(info),'lang B',lang);
const same0=async()=>{ha=await A.evaluate(()=>({h:onlHash(),r:ONLM.resyncs,n:ONLM.next}));hb=await B.evaluate(()=>({h:onlHash(),r:ONLM.resyncs,n:ONLM.next}));return ha.h===hb.h};let ha,hb;for(let k=0;k<40&&!(await same0());k++)await A.waitForTimeout(500);console.log(JSON.stringify({ha,hb}));
const rA=await probe(A,false),rB=await probe(B,false);
console.log('PROBE',JSON.stringify(rA),JSON.stringify(rB));
const ctl=await probe(A,true);console.log('CONTROL (S.onl hidden)',JSON.stringify(ctl));
await sync(A,B);await A.waitForTimeout(1500);

const miss=[];if(info.humans<2)miss.push('two humans');if(rA.offers||rB.offers)miss.push('an offer window opened');if(ha.h!==hb.h)miss.push('hashes differ');if(ha.r||hb.r)miss.push('resync');if(lang!=='es')miss.push('window B not Spanish');if(process.env.TONL100_CTL&&!ctl.offers)miss.push('control gave no offer');
console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();srv.close();if(miss.length||errs.length)process.exit(1)})();
