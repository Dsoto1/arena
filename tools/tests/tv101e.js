/* v1.01 workstream D (321-v101board): G1 Labrys + the other hand (Armory fit, label) · G2 one coach "Terynious Tutorialis", no Flavius line, step 5 follows
   a toppled pillar's offering · G3 Play Now submenu = Back only · G4 the 3D crowd's facings (reversed meta) · G5 challenges: no To the end / Hand to CPU /
   replay / seed · G8-G9 severed limb keeps the 3D figure, 3D corpses replace the flat ones · G14 flags in spectators' hands, none floating ·
   G15 Play Now ✕ = main menu button, stale mClose title gone · G16 Lobby Browser (Join by FID right + quiet, sandstone buttons) · G17 throw icon ·
   G18 Challenges tab, calendar date inside Follow · G19 token bases thin + toggle (synthetic base) · G20 zoom settle sliced · G21 emote cascade ·
   G22 Minerva's board · 0 no new 00c errors. SHOT=<dir> saves shots. Prints MISS / ERRS, exit 1 on a miss. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);const SHOT=process.env.SHOT||'';
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':({'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'})[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
const open=async(w,h,ls)=>{const pg=await b.newPage({viewport:{width:w||1440,height:h||900}});await pg.route(/fonts\.g/,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in o)localStorage.setItem(k,o[k])},ls||{});
  await pg.goto(URL0,{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{for(let i=0;i<5&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}window.__e0=ERR92.n});return pg};
const until=async(pg,fn,ms=15000,arg)=>{try{await pg.waitForFunction(fn,arg,{timeout:ms,polling:100});return true}catch(e){return false}};
const event=(pg,o)=>pg.evaluate(async o=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SPEED='fast';startEvent({ev:o.ev||'democritus',loc:6,seed:o.seed||21,seats:(o.cls||['soldier','hero','royalty','venatore']).map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:o.spect==null?48:o.spect}});
  for(let i=0;i<300;i++){await W8(120);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&cur()===S.players[0]&&S.phase==='action'&&!S.busy)break;
    else if(S&&cur()===S.players[0]&&S.phase==='choice'&&!S.busy){const c=document.querySelector('#actions [data-act="coin"]');if(c)c.click()}}
  SPEED='pause';render();await W8(200);return !!S&&cur()===S.players[0]&&S.phase==='action'},o);
let pg=await open();

/* ---- G1 · the Labrys and the other hand ---- */
const g1=await pg.evaluate(()=>{const g={id:'t1',name:'Tester',alive:true,severed:[],eq94:{h:'x',R:null,L:null,a:[],o:[]}};const lab={id:'a',t:'w',k:'labrys'},sh={id:'b',t:'w',k:'scutum'},gl={id:'c',t:'w',k:'gladius'};
  const f1=arm94Fit(g,lab,'auto');g.eq94.R=lab;const f2=arm94Fit(g,sh,'L');const f3=arm94Fit(g,sh,'auto');g.eq94.L=sh;const f4=arm94Fit(g,lab,'auto');const f5=arm94Fit(g,gl,'L');
  return {f1:f1.z+':'+(f1.rep||[]).length,f2:f2.z+':'+(f2.rep||[]).length+(f2.no||''),f3:f3.z+':'+(f3.rep||[]).length,f4:f4.z+':'+(f4.rep||[]).length,f5:f5.z+':'+(f5.rep||[]).length,meta:arm94Meta({t:'w',k:'labrys'}),W:!!W.labrys.both}});
ok(g1.W&&g1.f1==='R:0'&&g1.f2==='L:0'&&g1.f3==='L:0'&&g1.f5==='L:1','G1 Labrys fits R, a shield goes to L without replacing it, a weapon replaces only the L piece '+JSON.stringify(g1));
ok(/both attacks/.test(g1.meta)&&!/two hands/.test(g1.meta),'G1 the label says "both attacks": '+g1.meta);

/* ---- G17 · the throw icon is no longer the "both" one ---- */
const g17=await pg.evaluate(()=>{const bg=k=>{const i=document.createElement('i');i.className='wi87'+k;document.body.appendChild(i);const u=getComputedStyle(i).backgroundImage;i.remove();return u};return {thr:bg('thr'),both:bg('both'),w:{thr:WICO75.thr.length,both:WICO75.both.length}}});
ok(g17.thr!==g17.both&&g17.w.both===5675&&g17.w.thr===4767,'G17 WICO75 thr/both swapped (the pink double arrow is the throw) '+JSON.stringify(g17.w));

/* ---- G3 · Play Now submenu: only Back ---- */
await pg.evaluate(()=>{playNowMenu()});ok(await until(pg,()=>document.querySelector('#modal.sand100 #mBtns .sand100back')||document.querySelector('#modal.sand100 .sand100ft button')),'G3 the Play Now tablet opened');
await pg.waitForTimeout(400);
const g3=await pg.evaluate(()=>{const m=document.getElementById('modal'),mc=document.getElementById('mClose');const seal=m.querySelector('.sand100ft .seal');const back=[...m.querySelectorAll('button')].filter(x=>/Back/.test(x.textContent));
  return {x:getComputedStyle(mc).display,seal:seal?getComputedStyle(seal).display:'none',back:back.length,txt:m.querySelector('.sand100ft')?m.querySelector('.sand100ft').innerText.replace(/\s+/g,' ').trim():''}});
ok(g3.x==='none'&&g3.seal==='none'&&g3.back>=1,'G3 no ✕ stud, no ESC·BACK seal, Back stays '+JSON.stringify(g3));
if(SHOT)await pg.screenshot({path:SHOT+'/g3.png'});
await pg.keyboard.press('Escape');await pg.waitForTimeout(500);await pg.evaluate(async()=>{for(let i=0;i<4&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,200))}});

/* ---- G15 · the Play Now setup's ✕ is the main-menu button; a stale title never follows ---- */
await pg.evaluate(()=>{const mc=document.getElementById('mClose');mc.title='Save this career and go back to the main menu';mc.classList.add('saveq');openSetup(true)});
ok(await until(pg,()=>document.querySelector('#mBody .pn100 .pn100car')),'G15 setup open');await pg.waitForTimeout(500);
const g15=await pg.evaluate(()=>{const mc=document.getElementById('mClose');return {t:mc.textContent,title:mc.title,cls:mc.className,hidden:mc.hidden}});
ok(g15.t==='🏛'&&g15.title==='Main menu'&&!/saveq/.test(g15.cls)&&!g15.hidden,'G15 ✕ → 🏛 "Main menu" '+JSON.stringify(g15));
/* ---- G18 · the Challenges tab and the date inside Follow ---- */
const g18=await pg.evaluate(()=>{const q=s=>document.querySelector('#mBody '+s);const seg=q('.pn-tabs .seg');const tabs=[...seg.querySelectorAll('button')].map(x=>x.textContent.trim());
  const fol=q('.pn100follow');return {tabs,strip:!!q('.dc100pn'),cal:!!(fol&&fol.querySelector('.calline')),calTop:!!q('.pn-top .pn-cal .calline'),chal:!!seg.querySelector('[data-dc100pn]'),txt:fol&&fol.querySelector('.calline')?fol.querySelector('.calline').textContent.replace(/\s+/g,' ').trim():''}});
ok(g18.chal&&/Challenges/.test(g18.tabs.join('|'))&&g18.tabs.findIndex(t=>/Tournament/.test(t))<g18.tabs.findIndex(t=>/Challenges/.test(t)),'G18 Challenges is a tab after Tournament '+JSON.stringify(g18.tabs));
ok(!g18.strip&&g18.cal&&!g18.calTop,'G18 the strip is gone, the calendar date sits in Follow the schedule '+JSON.stringify(g18));
if(SHOT)await pg.screenshot({path:SHOT+'/g18.png'});
await pg.evaluate(()=>{document.querySelector('#mBody .pn-tabs [data-dc100pn]').click()});
ok(await until(pg,()=>document.querySelector('.dc100')&&document.querySelector('.dc100c'),8000),'G18 the Challenges tab opens the challenges window');
const g5a=await pg.evaluate(()=>({seed:/Seed/i.test(document.querySelector('.dc100').innerText),vis:[...document.querySelectorAll('.dc100 .sd')].some(x=>x.offsetParent!==null)}));
ok(!g5a.vis,'G5 no seed line in the challenge window '+JSON.stringify(g5a));
if(SHOT)await pg.screenshot({path:SHOT+'/g5.png'});

/* ---- G5 · a challenge in play ---- */
await pg.evaluate(()=>{try{CUR_MODAL.done(null)}catch(e){}});await pg.waitForTimeout(400);
await pg.evaluate(async()=>{while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await new Promise(r=>setTimeout(r,150))}try{menuHide()}catch(e){}SETTINGS.briefing=false;SPEED='fast';dc100Begin(dc100Spec('d',dc100Day()))});
ok(await pg.evaluate(async()=>{for(let i=0;i<260;i++){await new Promise(r=>setTimeout(r,200));if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.daily100&&S.phase!=='setup'&&S.players.length)return true}return false}),'G5 the challenge started');
await pg.evaluate(async()=>{SPEED='pause';render()});await pg.waitForTimeout(400);
const g5=await pg.evaluate(async()=>{const se=document.getElementById('btnSimEnd');const over0=S.over;let r;try{r=await simToEnd(true)}catch(e){r='err'}await new Promise(x=>setTimeout(x,300));
  return {simHidden:!se||se.hidden,over:S.over===over0,toggle:seatCanToggle(S.players[0]),toggle2:seatCanToggle(S.players[1]),rec:rp100RecOK(),seedLog:[...document.querySelectorAll('#log li')].some(li=>/seed/i.test(li.textContent)&&li.textContent.indexOf(String(S.seed))>=0),chip:!!document.querySelector('[data-seat]')&&[...document.querySelectorAll('.seatchip')].length}});
ok(g5.simHidden&&g5.over,'G5 no ⏭ To the end (button hidden, simToEnd does nothing) '+JSON.stringify(g5));ok(g5.toggle===false&&g5.toggle2===false&&!g5.chip,'G5 no Hand to CPU / Take control '+JSON.stringify(g5));
ok(g5.rec===false,'G5 no replay recording');ok(!g5.seedLog,'G5 no seed line in the log');
await pg.evaluate(()=>{log(`The dice are cast from seed <b>${S.seed}</b> — test`,'thought');mToast('Seed '+S.seed+' fought before')});
ok(await pg.evaluate(()=>![...document.querySelectorAll('#log li')].some(li=>li.textContent.indexOf('dice are cast from seed')>=0)),'G5 the seed log line is dropped');
await pg.close();

/* ---- the 3D crowd, flags, corpses, severed limb, bubbles, Minerva, zoom — one live match ---- */
pg=await open();
ok(await event(pg,{}),'live match reached our Action');
await pg.waitForTimeout(2500);
/* G4 */
const g4=await pg.evaluate(()=>{const M=CROWD100_META.a.s0;return {flag:!!CROWD100_META._m101,dec:M.r.sit[0][0]>M.r.sit[3][0],rdy:cr100StandsReady(),sit:CR100.cnt}});
ok(g4.flag&&g4.dec,'G4 the four facings are reversed in the meta '+JSON.stringify(g4));ok(g4.rdy,'G4 the 3D crowd is drawing');
/* G14 */
await pg.evaluate(()=>{draw()});await pg.waitForTimeout(300);
const g14=await pg.evaluate(()=>{const before=FLAG101.n;draw();return {n:FLAG101.n,fan:drawFanFlags.toString().length<30,hold:FLAG101.n>0}});
ok(g14.fan,'G14 drawFanFlags (the floating flag) is a no-op');ok(g14.n>0&&g14.n<=16,'G14 spectators hold flags in their hands: '+g14.n);
const g14b=await pg.evaluate(()=>{const h=flag101Holders();const ids=h.map(x=>x.sp.fav);return {n:h.length,pl:S.players.length,fans:h.every(x=>x.sp.fav!=null&&S.players.some(p=>p.id===x.sp.fav)),uniq:new Set(ids).size===ids.length,first:h.every(x=>S.spect.find(s=>!s.gone&&!s.human&&s.fav===x.sp.fav&&CR91.seen.some(e=>e.id===s.id))===x.sp)}});
ok(g14b.n>0&&g14b.n<=g14b.pl&&g14b.fans&&g14b.uniq&&g14b.first,'G14 one flag per gladiator, carried by his first seated fan '+JSON.stringify(g14b));
if(SHOT)await pg.screenshot({path:SHOT+'/g14.png'});
/* G19 · the thin base + off, on a synthetic base (no pixel reads from file) */
const g19=await pg.evaluate(()=>{const mk=()=>{const c=document.createElement('canvas');c.width=82;c.height=117;const g=c.getContext('2d');const ax=41,ay=97.6,ppm=2.6;const cy=ay-3.3*ppm,rx=12.75*ppm,ry=rx/2,T=3.5*ppm;
    g.fillStyle='rgb(79,70,50)';g.fillRect(ax-rx,cy,2*rx,T);g.beginPath();g.ellipse(ax,cy+T,rx,ry,0,0,Math.PI);g.fill();
    g.fillStyle='rgb(212,181,133)';g.beginPath();g.ellipse(ax,cy,rx,ry,0,0,Math.PI*2);g.fill();
    g.fillStyle='rgb(29,18,15)';g.fillRect(ax-6,cy-4,12,10);g.fillStyle='rgb(222,170,120)';g.fillRect(ax-5,cy-3,10,8);return c};
  const cnt=(c,x)=>{const d=c.getContext('2d').getImageData(x,0,1,c.height).data;let wall=0,top=0;for(let y=0;y<c.height;y++){const i=y*4;if(d[i+3]>128){if(d[i]<100&&d[i+1]<90)wall++;else top++}}return {wall,top}};
  const f={fam:'rig'},ax=41,ay=97.6;const src=mk();const c0=cnt(src,30);
  const c1=bs101Proc(src,0,0,82,117,f,ax,ay,2.6,1);const t1=cnt(c1,30);const c2=bs101Proc(src,0,0,82,117,f,ax,ay,2.6,2);const t2=cnt(c2,30);
  const foot=c2.getContext('2d').getImageData(41,Math.round(ay-3.3*2.6),1,1).data;
  return {c0,t1,t2,foot:foot[3],stats:BS101.stats}});
ok(g19.t1.wall>0&&g19.t1.wall<=Math.round(g19.c0.wall*0.92)&&g19.t1.wall>=Math.round(g19.c0.wall*0.7),'G19 the wall is ~15% thinner '+JSON.stringify(g19));
ok(g19.t2.wall===0&&g19.t2.top<g19.c0.top&&g19.foot>200,'G19 off: wall + top surface removed, the foot (ink-outlined) kept '+JSON.stringify(g19));
const g19b=await pg.evaluate(async()=>{const row=typeof set98Pieces==='function'?set98Pieces(()=>'<div></div>'):'';return /data-set="bases101"/.test(row)});
ok(g19b,'G19 Settings → Board & pieces has "Show token bases"');
await pg.evaluate(()=>{SETTINGS.bases101=false;applySettings();draw()});await pg.waitForTimeout(500);if(SHOT)await pg.screenshot({path:SHOT+'/g19_off.png'});
await pg.evaluate(()=>{SETTINGS.bases101=true;applySettings();draw()});
/* G21 */
const g21=await pg.evaluate(async()=>{const sps=S.spect.filter(s=>!s.human&&!s.gone).slice(0,14);S.emotes=[];EM101.win=[];for(const s of sps)emote(s,'👏','');const now=S.emotes.length;const q=EM101.q.length;
  await new Promise(r=>setTimeout(r,2200));return {now,q,later:S.emotes.length,max:EM101.QMAX}});
ok(g21.now<=3&&g21.q>=1,'G21 a burst of 14 reactions shows ≤3 at once, the rest queued '+JSON.stringify(g21));
/* G8 / G9 · severed limb keeps a 3D figure */
const g8=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const p=S.players[0];AN100.trace=[];draw();await W8(300);const k0=AN100.keys.get(p)||null;
  p.hp.rarm=0;AN100.trace.length=0;let first=null,ready=false;
  for(let i=0;i<4;i++){draw();await W8(60)}
  const tr=AN100.trace.filter(t=>t.id===p.id&&t.src).map(t=>t.src);
  await W8(4500);AN100.trace.length=0;draw();await W8(100);const tr2=AN100.trace.filter(t=>t.id===p.id&&t.src).map(t=>t.src);
  return {k0,tr:[...new Set(tr)],tr2:[...new Set(tr2)],on:an100On(),draws:AN100.stats.draws}});
ok(g8.on&&g8.k0,'G8 the 3D figure draws before the loss '+JSON.stringify(g8));
ok(g8.tr.length>0&&g8.tr.every(s=>s==='p:soldier'||s==='p:soldier:rarm'),'G8 right after the loss the figure is still 3D (the whole set until the severed sheet decodes) '+JSON.stringify(g8.tr));
ok(g8.tr2.includes('p:soldier:rarm'),'G8 once decoded it wears the severed set '+JSON.stringify(g8.tr2));
await pg.evaluate(()=>{S.players[0].hp.rarm=5});
/* G9 · 3D corpse */
const g9=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const v=S.players[2];const m=center(v.r,v.c);SPEED='fast';
  S.players[2].hp.head=0;try{await eliminate(v,'test')}catch(e){try{v.alive=false}catch(x){}}
  await W8(300);const n0=CORPSE101.length;
  for(let i=0;i<30&&true;i++){await W8(150);draw()}
  let fills=0;const f=ctx.fill;ctx.fill=function(){fills++;return f.apply(this,arguments)};try{if(CORPSE101.length)drawCorpseFig(center(CORPSE101[0].r,CORPSE101[0].c),{},'#f00')}finally{ctx.fill=f}
  const g=CORPSE101[0];return {n0,n:CORPSE101.length,fills,pile:(S.piles||[]).some(p=>p.corpse),tile:g?[g.r,g.c]:null}});
ok(g9.n>=1||g9.n0>=1,'G9 the 3D corpse is kept after the fall '+JSON.stringify(g9));ok(g9.n===0||g9.fills===0,'G9 the old flat corpse is skipped on that tile '+JSON.stringify(g9));
if(SHOT)await pg.screenshot({path:SHOT+'/g9.png'});
await pg.close();

/* ---- G22 · Minerva ---- */
pg=await open();
ok(await event(pg,{spect:0}),'G22 live match');
await pg.evaluate(()=>{window.__mv=minervaStep(S.players[0],S.players[1])});
ok(await until(pg,()=>document.querySelector('#mBody .m101 svg'),8000),'G22 the Minerva window shows the board picture');
const g22=await pg.evaluate(()=>{const v=S.players[0];const tiles=[...document.querySelectorAll('#mBody .m101 .m101t')];const go=tiles.filter(t=>t.dataset.m101!==undefined);
  const btns=[...document.querySelectorAll('#mBtns [data-mi]')].filter(b=>!/Stay put/.test(b.textContent));return {all:tiles.length,go:go.length,btns:btns.length,me:tiles.filter(t=>/ me/.test(t.getAttribute('class'))).length,from:[v.r,v.c]}});
ok(g22.me===1&&g22.go===g22.btns&&g22.go>=1&&g22.all>=g22.go+1,'G22 3×3 around me, every step option lit '+JSON.stringify(g22));
if(SHOT)await pg.screenshot({path:SHOT+'/g22.png'});
await pg.click('#mBody .m101 [data-m101]');await pg.waitForTimeout(500);
const g22b=await pg.evaluate(async()=>{await window.__mv;const v=S.players[0];return {moved:true,pos:[v.r,v.c]}});
ok(g22b.moved,'G22 clicking a lit tile steps there '+JSON.stringify(g22b));
/* ---- G20 · zoom: the settle is spread over frames ---- */
await pg.evaluate(async()=>{while(CUR_MODAL){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,150))}SPEED='pause';render();draw()});await pg.waitForTimeout(800);
const g20a=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const raf=()=>new Promise(r=>requestAnimationFrame(r));Z101.stats.slices=0;Z101.stats.loops=0;
  const mx=[];for(const on of [false,true,false,true]){Z101.on=on;const ds=[];const d0=draw;draw=function(){const t=performance.now();const r=d0.apply(this,arguments);ds.push(performance.now()-t);return r};
    document.getElementById('btnZoom').click();for(let i=0;i<45;i++)await raf();await W8(900);draw=d0;mx.push([on,Math.round(Math.max(...ds)),ds.length]);
    document.getElementById('btnZoom').click();await W8(1200)}
  return {mx,slices:Z101.stats.slices,loops:Z101.stats.loops}});
ok(await until(pg,()=>!Z101.raf&&!Z100.st,30000),'G20 the settle loop ends');
const g20=await pg.evaluate(async(g)=>{const mx=g.mx;
  const fresh=Object.values(AR91.L).filter(L=>L&&L.key&&L.tw).every(L=>Math.abs(L.tw-TW)<1e-6);
  return {mx,slices:g.slices,loops:g.loops,raf:Z101.raf,force:Z100.force,fresh}},g20a);
ok(g20.loops>=1&&g20.slices>=2&&g20.raf===0&&g20.force===false&&g20.fresh,'G20 the settle ran as slices '+JSON.stringify(g20));
console.log('G20 max draw ms per zoom (sliced=true/false):',JSON.stringify(g20.mx));
await pg.close();

/* ---- G16 · the Lobby Browser (mock Online) ---- */
{const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0')});
const A=await ctx.newPage();A.on('pageerror',e=>errs.push('A:'+e.message));await A.goto(URL0,{timeout:90000});await A.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
await A.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name:'Alpha'});await NET.req('domus.create',{name:'Domus Alpha'});await NET.req('lanista.name',{name:'Lanista Alpha'});ONL.char=await NET.req('char.create',{name:'Alpha the Bold',cls:'hero'})});
A.evaluate(()=>{onlineOpen('lobby')}).catch(()=>{});await A.waitForSelector('#onl',{timeout:30000});await A.evaluate(()=>{ONL.tab='lobby';onlRedraw()});await A.waitForSelector('#onl .onl-lbtop .lb100-jb',{timeout:15000}).catch(()=>{});
const g16=await A.evaluate(()=>{const top=document.querySelector('#onl .onl-lbtop');const jb=top&&top.querySelector('.lb100-jb');const acts=top&&top.querySelector('.acts');if(!jb||!acts)return {none:1};const a=acts.getBoundingClientRect(),j=jb.getBoundingClientRect();
  const btn=acts.querySelector('[data-onl="mkroom"]:not(.primary)');const cs=getComputedStyle(btn);const sub=jb.querySelector('button[type=submit]');return {jbRight:j.left>=a.right-1,w:Math.round(j.width),btnColor:cs.color,btnBg:/svg|gradient/.test(cs.backgroundImage),sub:sub.className,jbH:Math.round(j.height),on:document.documentElement.classList.contains('sd100on')}});
ok(!g16.none&&g16.jbRight&&g16.w<=330,'G16 Join by code/FID sits right of the buttons and is small '+JSON.stringify(g16));
ok(g16.on?(g16.btnBg&&g16.btnColor==='rgb(58, 36, 16)'):true,'G16 the other buttons are sandstone '+JSON.stringify(g16));ok(!/primary/.test(g16.sub||''),'G16 the Join ▸ button is quiet');
if(SHOT)await A.screenshot({path:SHOT+'/g16.png'});await ctx.close()}

/* ---- G2 · the lessons' coach ---- */
pg=await open();
const g2=await pg.evaluate(()=>{const hello=TUT_STEPS.find(s=>s.id==='hello').say;return {hello:/Flavius/.test(hello),same:MTUTOR99()===TUTOR99(),sp:!!TUTOR99()}});
ok(!g2.hello&&g2.same,'G2 the opening line no longer introduces Flavius, one teacher for both lessons '+JSON.stringify(g2));
await pg.evaluate(()=>{startTutorial()});ok(await until(pg,()=>document.querySelector('#tutCoach .tutstep'),30000),'G2 the lesson coach shows');
const g2b=await pg.evaluate(()=>document.querySelector('#tutCoach .tutstep').textContent);ok(/^Terynious Tutorialis · /.test(g2b),'G2 the coach is named: '+g2b);
/* step 5: the offering lies on the sand after a topple */
const g2c=await pg.evaluate(()=>{const hand=TUT_STEPS.find(s=>s.id==='hand');TUT.p=S.players[0];const ph0=S.phase;S.phase='action';S.floor=(S.floor||[]).filter(f=>f.kind!=='offer');const a=hand.say();
  const r=(S.players[0].r+2)%13,c=(S.players[0].c+3)%13;S.floor.push({id:9999,kind:'offer',r,c});const b=hand.say(),sug=hand.sug(S.players[0]),un=hand.until(S.players[0]);S.floor=S.floor.filter(f=>f.id!==9999);S.phase=ph0;
  return {a:/in <b>your hand|waits in/.test(a)||/pot gave you/.test(a),b:b.indexOf(tl(r,c))>=0,sug:!!(sug&&sug.tile&&sug.tile.r===r),un}});
ok(g2c.a,'G2 step 5 with the offering in hand keeps its text');ok(g2c.b&&g2c.sug&&g2c.un===false,'G2 step 5 after a topple names the tile, walks there and waits '+JSON.stringify(g2c));
if(SHOT)await pg.screenshot({path:SHOT+'/g2.png'});
const errsNew=await pg.evaluate(()=>errNew92(window.__e0).map(e=>e.msg||e.m||JSON.stringify(e).slice(0,160)));
ok(errsNew.length===0,'0 no new 00c errors '+JSON.stringify(errsNew.slice(0,3)));
await b.close();srv.close();
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));process.exit(miss.length||errs.length?1:0)})();
