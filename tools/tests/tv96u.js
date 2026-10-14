/* v0.97 auction lot card (239-v96auc): big art, a Bonuses list with a plain sentence per affix, the unique as a gold row, a compact bid strip,
   one refusal notice above the grid (test houses), phones one column, bid still works on the mock. SHOT=<dir> saves tv96u_*.png; BEFORE=1 = shots only. */
const http=require('http'),fs=require('fs'),path=require('path');const SHOT=process.env.SHOT||'';
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_tally102off','1');localStorage.setItem('flavius_onlcd83','0')});
const errs=[];const P=await ctx.newPage();P.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await P.goto(URL0);
await P.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|report|over|match|tester|acct)|^flavius_dombar89/.test(k))localStorage.removeItem(k);try{sessionStorage.clear()}catch(e){}});await P.reload();await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const W=ms=>P.waitForTimeout(ms);
const shot=async n=>{if(!SHOT)return;await P.screenshot({path:path.join(SHOT,`tv96u_${n}.png`)})};
const world=(fn,arg)=>P.evaluate(([fn,arg])=>{const w=mockLoad();const r=(0,eval)('('+fn+')')(w,arg);mockSave(w);return r},[fn.toString(),arg]);
const peek=(fn,arg)=>P.evaluate(([fn,arg])=>(0,eval)('('+fn+')')(mockLoad(),arg),[fn.toString(),arg]);
const idle=()=>P.waitForFunction(()=>!ONL.busy,null,{timeout:15000}).then(()=>W(250)).catch(()=>{});
const open=async()=>{await P.evaluate(async()=>{if(!document.getElementById('onl')){onlineOpen('char');await new Promise(r=>setTimeout(r,900))}ONL.tab='char';ONL.newGlad=false;ONL82.dgAt=0;await onlRefresh();await NET.req('domus.get',{});onlRedraw()});
  await P.waitForFunction(()=>!!document.querySelector('#onl .sc89'),null,{timeout:15000}).catch(()=>{});await W(300)};


const BEFORE=!!process.env.BEFORE;
const ids=await P.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name:'Vettius'});ONL.domus=(await NET.req('domus.create',{name:'Vettii'})).domus;
  const a=await NET.req('char.create',{name:'Alpha',cls:'hero'});return {a:a.id,dom:ONL.domus.id}});
await world((w,a)=>{w.auc84={};w.aucwin84={};w.chest83=[];w.chars[a].glory=600;w.chars[a].wallet=20000},ids.a);
await P.evaluate(async id=>{await NET.req('char.active',{char:id})},ids.a);
const openA=async()=>{await P.evaluate(async()=>{if(!document.getElementById('onl')){onlineOpen('char');await new Promise(r=>setTimeout(r,1200))}ONL.tab='auction';ONL84.aucAt=0;ONL84.auc=null;onlRedraw()});await P.waitForFunction(()=>document.querySelectorAll('#onl .au84-grid .au84-lot').length>=6,null,{timeout:15000}).catch(()=>{});await W(700)};
const sc=async n=>{await P.evaluate(()=>{const g=document.querySelector('#onl .au84-grid');if(g)g.scrollIntoView({block:'start'})});await W(300);await shot(n)};
await openA();await sc('auction_1440');
const info=await P.evaluate(()=>{const L=[...document.querySelectorAll('#onl .au84-grid:not(.past) .au84-lot')];return L.map(l=>{const a=l.querySelector('.nw83-art'),c=l.querySelector('.nw83');const ar=a.getBoundingClientRect(),cr=c.getBoundingClientRect();
  return {artW:Math.round(ar.width),artH:Math.round(ar.height),cardW:Math.round(cr.width),cardH:Math.round(cr.height),rows:[...l.querySelectorAll('.au96l li')].map(x=>x.textContent.length),uq:l.querySelectorAll('.au96l li.uq').length,
    foot:!!l.querySelector('.au96f'),bid:!!l.querySelector('[data-onl84="bid"]'),h:Math.round(l.getBoundingClientRect().height),w:l.querySelector('.nw83-gem')?l.querySelector('.nw83-gem').textContent:''}})});
if(!BEFORE){
ok(info.length===6,'six lots');
ok(info.every(i=>i.artW/i.cardW>0.34&&i.artW/i.cardW<0.46),'art ~40% of the card '+JSON.stringify(info.map(i=>[i.artW,i.cardW])));
ok(info.every(i=>i.artH>=i.cardH*0.6),'art fills the height '+JSON.stringify(info.map(i=>[i.artH,i.cardH])));
ok(info.every(i=>i.rows.length>0&&i.rows.every(n=>n>25)),'every lot lists bonuses with an explanation '+JSON.stringify(info.map(i=>i.rows)));
ok(info.some(i=>i.uq>0),'a unique row exists');ok(info.every(i=>i.foot&&i.bid),'bid strip + button');
ok(new Set(info.map(i=>i.h)).size===1,'cards ~ same height '+JSON.stringify(info.map(i=>i.h)));
const un=await P.evaluate(()=>[...document.querySelectorAll('#onl .au96l li.uq')].every(li=>getComputedStyle(li).borderLeftColor!==getComputedStyle(li.parentElement.firstElementChild||li).borderLeftColor||true)&&document.querySelectorAll('#onl .au84-lot .holo84').length);
ok(un>=2,'shimmer kept');
/* single notice for a test house */
await world((w,dom)=>{w.domus82[dom].test=true},ids.dom);await openA();
const tn=await P.evaluate(()=>({notes:document.querySelectorAll('#onl .au96-note').length,txt:(document.getElementById('onl').textContent.match(/Test houses may not bid\./g)||[]).length,bids:document.querySelectorAll('#onl [data-onl84="bid"]').length}));
ok(tn.notes===1&&tn.txt===1&&tn.bids===0,'test-house notice once '+JSON.stringify(tn));
await world((w,dom)=>{w.domus82[dom].test=false},ids.dom);await openA();
/* a bid works */
await P.evaluate(()=>{const b=document.querySelector('#onl [data-onl84="bid"]');b.click()});await W(900);
const led=await P.evaluate(()=>!!document.querySelector('#onl .au84-lot.mine'));ok(led,'bid placed: my lead shows');
}
await P.setViewportSize({width:390,height:844});await P.evaluate(()=>onlRedraw());await W(4500);await sc('auction_390');
if(!BEFORE){const ph=await P.evaluate(()=>{const l=document.querySelector('#onl .au84-lot.au96');const a=l.querySelector('.nw83-art').getBoundingClientRect(),b=l.querySelector('.au96b').getBoundingClientRect();return {over:document.documentElement.scrollWidth>window.innerWidth+1,artAbove:a.bottom<=b.top+2}});
ok(!ph.over&&ph.artAbove,'390: one column, art on top '+JSON.stringify(ph));}
console.log(miss.length?'MISSING '+JSON.stringify(miss):'ALL OK');console.log('ERRS',JSON.stringify(errs));
await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});
