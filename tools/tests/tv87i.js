/* v0.87 icon sweep (154-v87icons): coin and CF amounts wear his coin / wheat icons, weapon actions in the log wear his weapon icons.
   1 a Play Now match: log lines with coin/CF icons, a thrown weapon (thr), a shield block (abs), damage (dmg); the results window shows CF icons
   2 Manager: a friend's purse letter in the mail and the treasury line carry the coin icon
   3 Online (mock, over http): the Armory prices carry the coin icon
   Every screen: no helper markup leaks as text (innerText / title attributes) and no page errors.
   SHOT=<dir> saves i87_*.png. */
const http=require('http'),fs=require('fs'),path=require('path');const SHOT=process.env.SHOT||'';
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[];const miss=[];const o={};const ok=(c,n)=>{if(!c)miss.push(n)};
const ctx=await b.newContext({viewport:{width:1400,height:1000}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0')});
const shot=async(p,n)=>{if(SHOT)await p.screenshot({path:path.join(SHOT,'i87_'+n+'.png')})};
/* no helper markup shown as text, none inside plain-text attributes */
const leak=p=>p.evaluate(()=>{const t=document.body.innerText;const bad=[];if(/amt87|ic87[cw]|wi87|sr87/.test(t))bad.push('text:'+t.slice(Math.max(0,t.search(/amt87|ic87|wi87|sr87/)-60),t.search(/amt87|ic87|wi87|sr87/)+40));
  for(const el of document.querySelectorAll('[title],[aria-label],[alt],[placeholder]'))for(const a of ['title','aria-label','alt','placeholder']){const v=el.getAttribute(a);if(v&&/amt87|ic87|wi87/.test(v))bad.push(a+':'+v.slice(0,80))}
  for(const el of document.querySelectorAll('option'))if(/amt87|ic87|wi87/.test(el.textContent))bad.push('option:'+el.textContent.slice(0,60));return bad});
const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await pg.goto(URL0);await pg.waitForTimeout(2200);

/* ── 1 · a Play Now match ── */
o.def=await pg.evaluate(()=>({coin:typeof coinAmt87,cf:typeof cfAmt87,wi:typeof wIco87,css:!!document.getElementById('icons87'),
  h:coinAmt87('+3'),bg:(()=>{const d=document.createElement('div');d.innerHTML=cfAmt87(2);document.body.appendChild(d);const v=getComputedStyle(d.querySelector('.ic87w')).backgroundImage.slice(0,30);d.remove();return v})()}));
ok(o.def.coin==='function'&&o.def.cf==='function'&&o.def.wi==='function'&&o.def.css,'helpers defined');ok(/^<span class=amt87>\+<i class=ic87c><\/i>3/.test(o.def.h),'sign before the coin');ok(/url\(/.test(o.def.bg),'wheat art');
await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();SETTINGS.briefing=false;POPPED.add('firstTurn');
  const seats=[{cls:'slave',cpu:true,diff:'easy'},{cls:'soldier',cpu:true},{cls:'amazonia',cpu:true,diff:'easy'},{cls:'hero',cpu:true}].map(s=>({...s,pers:finalPers(s)}));
  startEvent({ev:'democritus',loc:6,seats,opts:{...CFG.opts,spect:0}})});
await pg.waitForTimeout(1500);await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null)});
if(SHOT){await pg.evaluate(()=>{SPEED='fast'});await pg.waitForTimeout(20000);await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null)})}
/* a throw at a shield-bearer: force the pieces next to each other and attack until the shield takes a hit */
o.w=await pg.evaluate(async()=>{const r={};const thrK=Object.keys(W).find(k=>W[k].throw&&!W[k].shield&&W[k].lv<=2),shK=Object.keys(W).find(k=>W[k].shield&&!W[k].p);r.thrK=thrK;r.shK=shK;
  const [a,d]=S.players;a.coin+=4;log(`${nm(a)} — test purse: ${coinAmt87('+4')}, ${cfAmt87(2)}`);
  for(let i=0;i<14;i++){a.wR=mkW(thrK);d.wL=mkW(shK);d.wL.usesLeft=9;a.hitTargets=new Set();a.armUses={R:0,L:0};a.alive=true;d.alive=true;
    for(const k of Object.keys(d.hp))d.hp[k]=Math.max(d.hp[k],6);
    d.r=a.r;d.c=a.c+1;if(d.c>12){d.c=a.c-1}
    try{await doAttack(a,{arm:'R',w:a.wR,thr:1},{kind:'player',ref:d,key:'p'+d.id,r:d.r,c:d.c})}catch(e){r.err=String(e)}
    const L=document.getElementById('log').innerHTML;if(/wi87abs/.test(L)&&/wi87thr/.test(L))break}
  const L=document.getElementById('log');r.thr=!!L.querySelector('.wi87thr');r.abs=!!L.querySelector('.wi87abs');r.dmg=!!L.querySelector('.wi87dmg');
  r.coin=!!L.querySelector('.ic87c');r.cf=!!L.querySelector('.ic87w');
  const li=[...L.querySelectorAll('li')].find(x=>x.querySelector('.wi87thr'));r.thrLine=li?li.textContent.slice(0,120):'';
  const ab=[...L.querySelectorAll('li')].find(x=>x.querySelector('.wi87abs'));r.absLine=ab?ab.textContent.slice(0,160):'';
  r.logLines=(S.logLines||[]).filter(x=>/test purse/.test(x.text)).map(x=>x.text).slice(0,1);
  const ic=L.querySelector('.ic87c');const bb=ic.getBoundingClientRect();r.icoH=Math.round(bb.height);r.fontPx=parseFloat(getComputedStyle(ic.parentElement).fontSize);return r});
ok(o.w.thr,'log: thrown weapon wears the throw icon');ok(o.w.abs,'log: shield block wears the absorb icon');ok(o.w.dmg,'log: damage wears the damage icon');
ok(o.w.coin&&o.w.cf,'log: coin + CF icons');ok(/4 coin/.test(o.w.logLines[0]||''),'tag-free log text keeps "4 coin"');ok(o.w.icoH>=o.w.fontPx*0.9&&o.w.icoH<=o.w.fontPx*1.2,'icon sized to the text');
await pg.evaluate(()=>{const l=document.getElementById('log');if(l)l.scrollIntoView({block:'start'})});await pg.waitForTimeout(200);await shot(pg,'log');
o.leak1=await leak(pg);ok(!o.leak1.length,'no leak in the match');
await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);simToEnd()});await pg.waitForTimeout(600);
await pg.evaluate(()=>{const b=[...document.querySelectorAll('#mBtns button')].find(b=>/Sim to end/.test(b.textContent));b&&b.click()});
for(let i=0;i<80;i++){await pg.waitForTimeout(1000);if(await pg.evaluate(()=>S&&S.over&&!document.getElementById('modal').hidden&&!!document.querySelector('.rcard')))break}
await pg.waitForTimeout(800);
o.res=await pg.evaluate(()=>{const m=document.getElementById('mBody');return {cf:m.querySelectorAll('.ic87w').length,coin:m.querySelectorAll('.ic87c').length,txt:(m.querySelector('.rcard')||m).innerText.slice(0,160)}});
ok(o.res.cf>0,'results: CF icons');await shot(pg,'results');o.leak2=await leak(pg);ok(!o.leak2.length,'no leak in the results');

/* ── 2 · Manager: a friend's purse letter + the money lines ── */
o.mgr=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(400);if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(900);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),m=me();m.coin=10;w.giftWk=-99;
  const f=w.mgrs.find(x=>!x.isPlayer);f.coin=500;const rr=Math.random;Math.random=()=>0.1;const op=opinionOf;opinionOf=()=>({v:90});try{friendGift(w,m)}finally{Math.random=rr;opinionOf=op}
  const L=(w.letters||[]).find(x=>/^gift-/.test(x.key));MGR.tab='ludus';MGR.mailOpen=L&&L.key;MGR_REDRAW();await W8(700);
  const box=document.querySelector(`[data-mail$="${L&&L.key}"]`);if(box)box.open=true;await W8(200);if(box)box.scrollIntoView({block:'center'});
  const body=document.getElementById('mgrBody');return {letter:!!L,inMail:!!(box&&box.querySelector('.ic87c')),coinIcons:body.querySelectorAll('.ic87c').length,txt:box?box.innerText.replace(/\s+/g,' ').slice(0,160):''}});
ok(o.mgr.letter&&o.mgr.inMail,'Manager letter: coin icon');ok(o.mgr.coinIcons>1,'Manager: coin icons on Your ludus');
await shot(pg,'mail');o.leak3=await leak(pg);ok(!o.leak3.length,'no leak on Your ludus');
for(const t of ['roster','recruit','board','infirm','practice','night','exch','news','league','trophy','sched','me']){o['leak_'+t]=await pg.evaluate(async t=>{MGR.tab=t;try{MGR_REDRAW()}catch(e){return ['redraw '+t+': '+e.message]}await new Promise(x=>setTimeout(x,350));return []},t);o['leak_'+t].push(...await leak(pg));ok(!o['leak_'+t].length,'no leak on '+t)}

/* ── 3 · Online (mock): the Armory ── */
const P=await ctx.newPage();P.on('pageerror',e=>errs.push('onl:'+e.message+' '+(e.stack||'').split('\n')[1]));await P.goto(URL0);
await P.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|report|over|match|tester)/.test(k))localStorage.removeItem(k)});await P.reload();await P.waitForTimeout(2300);
o.onl=await P.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name:'Icons'});ONL.domus=(await NET.req('domus.create',{name:'Icons'})).domus;
  ONL.char=await NET.req('char.create',{name:'Icons the Bold',cls:'hero'});onlineOpen('armory');await W8(1000);ONL.tab='armory';await onlRefresh();onlRedraw();await W8(600);
  const el=document.getElementById('onl');return {coin:el?el.querySelectorAll('.ic87c,.coinimg').length:0,txt:el?el.innerText.replace(/\s+/g,' ').slice(0,120):''}});
ok(o.onl.coin>0,'Online Armory: coin icons');await shot(P,'armory');o.leak4=await leak(P);ok(!o.leak4.length,'no leak in the Armory');

console.log(JSON.stringify(o).slice(0,2400));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs.slice(0,5)));
await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();
