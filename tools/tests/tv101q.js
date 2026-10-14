/* v1.01 wave 2 Phase A — the question port (326-v101ask):
   1 offline: ask() opens today's window (same title/body/buttons), a modal wrapper sees the question's kind while it opens (askKind), a provider
     answers without a window (askUse), the headless rule = askAuto, every 07-ui act is in the command() registry.
   2 online (mock, two windows, B in SPANISH): a CPU's truce offer and trade offer to a human are forced through the real engine path on both
     screens (cpuDiplomacy wrapped the same way in both windows) — declined by KIND on both (the old English title regex could not match B's title),
     hashes agree, no resync; the windows' decision counters (S.ask101) agree; window answers in the stream carry kd + ds and no title; the other
     window's acts were applied through the registry (CMD101.used > 0, no twin button).
   (served over http from the page's folder — file:// pages do not share storage between windows) */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_tally102off','1');localStorage.setItem('flavius_onlcd83','0');});
const errs=[],miss=[];const A=await ctx.newPage(),B=await ctx.newPage();for(const [n,p] of [['A',A],['B',B]])p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));
await A.goto(URL0,{timeout:90000});await A.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|match|report|over|rid)/.test(k))localStorage.removeItem(k)});
await A.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});

/* ---------- 1 offline ---------- */
const off=await A.evaluate(async()=>{const o={};o.fns=['ask','askW','askX','askNow','askKind','askUse','askAuto','command','cmdReg','uiAct'].filter(f=>typeof window[f]!=='function'||typeof eval(f)!=='function');
  const seen=[];const bm=modal;modal=function(){seen.push(askKind());return bm.apply(this,arguments)};
  try{const p=askW(null,'tst101','Port test','<p id="tst101b">body</p>',[{label:'Three',value:3,primary:1},{label:'Four',value:4}]);
    await new Promise(r=>setTimeout(r,250));o.title=(document.querySelector('#mTitle')||{}).textContent;o.body=!!document.querySelector('#mBody #tst101b');o.btns=[...document.querySelectorAll('#modal .mbtns button')].map(b=>b.textContent.trim());
    o.nowAfter=askNow();const bt=[...document.querySelectorAll('#modal .mbtns button')].find(b=>/Four/.test(b.textContent));if(bt)bt.click();o.v=await p}finally{modal=bm}
  o.seen=seen;const offP=askUse('tst101p',Q=>Q.kind==='tst101p'?9:undefined);o.prov=await askW(null,'tst101p','x','',[{label:'a',value:1}]);offP();o.provModal=!!CUR_MODAL;
  o.auto=[askAuto([{label:'a',value:1,disabled:true},{label:'b',value:2}],{}),askAuto([{label:'a',value:1}],{close:'c'}),askAuto([],{grid:[{value:'g'}]})];
  o.cnt={tst101:ASK.count.tst101|0,tst101p:ASK.count.tst101p|0};o.reg=UI_ACTS101.filter(k=>!cmdFor(k));o.m=!!cmdFor('m-move');return o});
console.log('OFFLINE',JSON.stringify(off));
if(off.fns.length)miss.push('functions missing: '+off.fns);if(off.title!=='Port test'||!off.body||off.btns.join('|')!=='Three|Four')miss.push('ask did not open the same window');
if(off.v!==4)miss.push('the window value');if(off.seen[0]!=='tst101')miss.push('askKind inside a modal wrapper');if(off.nowAfter!==null)miss.push('askNow after the call');
if(off.prov!==9||off.provModal)miss.push('a provider answers without a window');if(JSON.stringify(off.auto)!==JSON.stringify([2,'c','g']))miss.push('askAuto');
if(off.cnt.tst101!==1||off.cnt.tst101p!==1)miss.push('ASK.count');if(off.reg.length||!off.m)miss.push('acts not in the registry: '+off.reg);

/* ---------- 2 online, window B in Spanish ---------- */
await A.evaluate(()=>localStorage.setItem('flavius_lang','es'));await B.goto(URL0,{timeout:90000});await A.evaluate(()=>localStorage.removeItem('flavius_lang'));await B.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const setup=async(p,name)=>{await p.evaluate(async(name)=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls:name==='Alpha'?'hero':'soldier'})},name)};
const sync=async(from,to,ms=15000)=>{const t0=Date.now();while(Date.now()-t0<ms){const v=await from.evaluate(()=>localStorage.getItem('flavius_onlmock'));if(await to.evaluate(v=>localStorage.getItem('flavius_onlmock')===v,v))return true;await to.waitForTimeout(100)}return false};
await setup(A,'Alpha');await sync(A,B);await setup(B,'Beta');await sync(B,A);
const L=await A.evaluate(async()=>await NET.req('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:false}));
const seen=async(p,fn,arg,ms=30000)=>{const t0=Date.now();while(Date.now()-t0<ms){if(await p.evaluate(fn,arg).catch(()=>false))return true;await p.waitForTimeout(150)}return false};
for(let k=0;k<8;k++){await seen(B,id=>!!mockLoad().lobbies[id],L.id);await B.evaluate(async(id)=>{try{await NET.req('lobby.join',{id})}catch(e){}},L.id);if(await seen(A,id=>ONLC.humansOf(mockLoad().lobbies[id]||{}).length>=2,L.id,5000))break}
await sync(B,A);const L2=await A.evaluate(async(id)=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},L.id);await sync(A,B);
await B.evaluate(async(L)=>{onlEnter(L)},L2);await sync(A,B);
for(const P of [A,B]){for(let k=0;k<120;k++){const ok=await P.evaluate(()=>{if(typeof S==='undefined'||!S||!S.onl)return false;if(CUR_MODAL&&ONLM.info>0){const b=document.querySelector('#modal .mbtns .primary')||document.querySelector('#modal .mbtns button');if(b)b.click()}return !!(ONLM.on&&S.players&&S.players.length>=3)});if(ok)break;await P.waitForTimeout(500)}}
const lang=await B.evaluate(()=>LANG);if(lang!=='es')miss.push('window B not Spanish');
/* the forced offers: the first two CPU turns from turn T on (both windows wrap cpuDiplomacy the same way, so both reach them at the same engine point) */
const T=Math.max(await A.evaluate(()=>S.turnNo),await B.evaluate(()=>S.turnNo))+2;
for(const P of [A,B])await P.evaluate(T=>{window.__q101={T,fired:0,res:[],titles:[],regex:[]};const base=cpuDiplomacy;
  cpuDiplomacy=async function(player){const Q=window.__q101;if(S&&S.onl&&Q.fired<2&&S.turnNo>=Q.T){const q=S.players.find(o=>!o.cpu&&o.alive!==false);
      if(q){Q.fired++;const kind=Q.fired===1?'truceOffer':'tradeOffer';const title=kind==='truceOffer'?_T`${player.name} offers a truce`:_T`${player.name} proposes a trade`;
        Q.titles.push(title);Q.regex.push(/offers a truce|proposes a trade/.test(title));
        const ok=await hsAsk(q,()=>askX(q,kind,{from:player},title,`<p>${kind}</p>`,[{label:kind==='truceOffer'?_T('Accept truce'):_T('Accept trade'),value:1,primary:1},{label:_T('Refuse'),value:0}]));
        Q.res.push(ok);if(ok)makeTruce(player,q);return}}
    return base.apply(this,arguments)}},T);
/* drive both windows (tonl98f / tools/replay/online.js driver) until both offers fired and some moves went through */
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
let sp=false;{const t0=Date.now();while(Date.now()-t0<240000){await drive(A);await drive(B);await A.waitForTimeout(120);
  if(!sp){for(const p of [A,B])await p.evaluate(()=>setSpeedUI('fast')).catch(()=>{});sp=true}
  const f=await Promise.all([A,B].map(p=>p.evaluate(()=>window.__q101.res.length+(S&&S.over?9:0)).catch(()=>0)));if(f.every(x=>x>=2)&&Date.now()-t0>20000)break}}
/* settle: both windows applied every input, same state */
const st=p=>p.evaluate(()=>({h:onlHash(),r:ONLM.resyncs|0,n:ONLM.next,ask:S.ask101|0,q:window.__q101,used:CMD101.used,twin:CMD101.twin,cnt:{t:ASK.count.truceOffer|0,d:ASK.count.tradeOffer|0},busy:!!(S.busy||ONLM.q.length||ONLM.pend)}));
let sa,sb;for(let k=0;k<60;k++){sa=await st(A);sb=await st(B);if(sa.h===sb.h&&sa.n===sb.n&&!sa.busy&&!sb.busy)break;await drive(A);await drive(B);await A.waitForTimeout(400)}
const g=await A.evaluate(async()=>(await NET.req('match.get',{id:S.onl.lobby,from:0})).inputs);
const mins=g.filter(x=>x.k==='modal');const acts=g.filter(x=>x.k==='act').length;
console.log('A',JSON.stringify(sa));console.log('B',JSON.stringify(sb));console.log('STREAM',g.length,'inputs ·',acts,'acts ·',mins.length,'window answers',JSON.stringify(mins.map(x=>({kd:x.kd,ds:x.ds,t:x.t,seat:x.seat}))));
for(const [n,s] of [['A',sa],['B',sb]]){if(s.q.res.length<2)miss.push(n+': the forced offers did not both fire');if(s.q.res.some(v=>v!==0))miss.push(n+': an offer was not declined');if(s.cnt.t<1||s.cnt.d<1)miss.push(n+': ask kinds not counted')}
if(sb.q.regex.some(Boolean))miss.push('B titles still English (the language case is not exercised)');if(!sa.q.regex.every(Boolean))miss.push('A titles not English');
if(sa.h!==sb.h)miss.push('hashes differ');if(sa.r||sb.r)miss.push('resync');if(sa.ask!==sb.ask)miss.push('decision counters differ '+sa.ask+'/'+sb.ask);
if(mins.some(x=>!x.kd||x.ds==null||x.t!=null))miss.push('a window answer without kind/number (or with a title)');
if(acts&&!(sa.used+sb.used))miss.push('acts not applied through the registry');if(sa.twin||sb.twin)miss.push('twin button used '+sa.twin+'/'+sb.twin);
console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();srv.close();if(miss.length||errs.length)process.exit(1)})();
