/* v0.85 ONLINE LANDING II (146-v85land, mock): the playlists in a 2×2 grid (This week · Classic with working tabs · Familia · Ludi Infames)
   beside two showcases — 🏆 the biggest winner (CF + coin earned) and 🪦 the biggest loser (rank, gear value + purse lost), picked from a
   day record built with ONLC.dayFromMatch/dayFell (and the mock world's own day through a hello); "See today's list" opens the popup; no
   Today ribbon; the empty states; the online day turns at 20:00 New York (ONLC.dayStart, DST); 👥 Party: the button opens the panel,
   "Make my party code" shows a code, a second window joins with it; the landing fits at 1300×900 / 1440×900 / 1920×1080 (all four playlist
   cards and both showcases in view); phones 390: one column, no sideways scroll. SHOT=<dir> saves v85l_*.png. */
const http=require('http'),fs=require('fs'),path=require('path');const SHOT=process.env.SHOT||'';
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
const errs=[];const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const o={};
const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0')});
const A=await ctx.newPage(),B=await ctx.newPage();for(const [n,p] of [['A',A],['B',B]])p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));
const W8=(p,ms)=>p.waitForTimeout(ms);const shot=async(p,n)=>{if(SHOT)await p.screenshot({path:path.join(SHOT,`v85l_${n}.png`)})};
await A.goto(URL0,{timeout:90000});await A.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|report|over|match|tester|clock)/.test(k))localStorage.removeItem(k)});await B.goto(URL0,{timeout:90000});await W8(A,2500);
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});ONL.domus=(await NET.req('domus.create',{name})).domus;
  ONL.char=await NET.req('char.create',{name:name+' the Bold',cls});onlineOpen('play');await new Promise(r=>setTimeout(r,1200));ONL.tab='play';await onlRefresh();onlRedraw()},[name,cls]);
await setup(A,'Vettii','hero');await W8(A,600);

/* ── 1 · the 2×2 grid + the Classic tabs, no ribbon ── */
o.grid=await A.evaluate(()=>{const g=document.querySelector('#onl .onl-play81.v85');const box=document.querySelector('#onl .a85-bot .onl-pls81');const cards=box?[...box.children].filter(c=>c.offsetParent!==null&&!c.classList.contains('pl85div')):[];
  const tops=[...new Set(cards.map(c=>Math.round(c.getBoundingClientRect().top)))];
  return {v85:!!g,cols:box?getComputedStyle(box).gridTemplateColumns.split(' ').length:0,n:cards.length,rows:tops.length,order:cards.map(c=>c.classList.contains('pl84')?'week':c.classList.contains('pl85cl')?'classic':c.classList.contains('inf83')?'inf':c.dataset.pl81||'?'),
    week:cards[0]?getComputedStyle(cards[0]).borderTopStyle:'',ribbon:!!document.querySelector('#onl #onlToday80'),more:!!document.querySelector('#onl .td81-more'),show:!!document.querySelector('#onl .a85-bot #v85show')}});
ok(o.grid.v85&&o.grid.cols===2&&o.grid.n===4&&o.grid.rows===2,'playlists in a 2×2 grid '+JSON.stringify(o.grid));
ok(o.grid.order.join()==='week,classic,familia,inf','This week · Classic · Familia · Ludi Infames '+o.grid.order.join());
ok(o.grid.week==='double','This week keeps its double border');ok(!o.grid.ribbon&&!o.grid.more,'no Today ribbon / + more');ok(o.grid.show,'the showcases sit in the bottom block');
await A.click('#onl [data-pl85="egidious"]');await W8(A,200);
o.tab=await A.evaluate(()=>{const on=[...document.querySelectorAll('#onl .pl85c')].filter(c=>!c.classList.contains('pl85off')).map(c=>c.dataset.pl85k);return {on,vis:on.length===1&&document.querySelector('#onl .pl85c:not(.pl85off)').offsetParent!==null,saved:localStorage.getItem('flavius_pl85')}});
ok(o.tab.on.join()==='egidious'&&o.tab.vis&&o.tab.saved==='egidious','the Classic tabs switch '+JSON.stringify(o.tab));
await A.click('#onl [data-pl85="democritus"]');await W8(A,150);

/* ── 2 · the showcases from a day record built by the shared rules ── */
o.seed=await A.evaluate(()=>{const cat=onlCatalog();const t=Date.now();
  const ch=(name,cls,rank,x)=>({id:'c_'+name,name,cls,rank,alive:true,bouts:9,wins:3,survived:6,lifeCF:200,wallet:0,gear:[],look:{},domus:ONL.domus.id,...x});
  const wHi=ch('Marcus','hero','veteranus'),wLo=ch('Lucius','soldier','gregarius');
  const fHi=ch('Aemilius','soldier','primus',{wallet:132,alive:false}),fLo=ch('Tiro Two','slave','tiro',{wallet:5,alive:false});
  const brought=[{item:'gladius',pc:null},{item:'galea',pc:null}].filter(P=>cat[P.item]);const val=brought.reduce((s,P)=>s+ONLC.valueOf(ONLC.pieceInfo(P,cat)),0);
  let D={};D=ONLC.dayFromMatch(D,{id:'m1',ev:'democritus',loc:6,at:t-6e5,ranked:true,seats:[
    {acct:'a1',ch:wHi,before:'veteranus',seat:0,row:{seat:0,won:true,f:31},out:{award:27,pay:22,cut:5}},
    {acct:'a2',ch:fHi,before:'primus',seat:1,row:{seat:1,won:false,f:9,kb:'g',ks:0,survives:false},out:{died:true,hall:true},gx:{carried:brought,left:[]}}]});
  D=ONLC.dayFromMatch(D,{id:'m2',ev:'cassian',loc:2,at:t-3e5,ranked:false,seats:[{acct:'a3',ch:wLo,before:'gregarius',seat:0,row:{seat:0,won:true,f:18},out:{award:0,pay:0}}]});
  D=ONLC.dayFell(D,{id:'m3',acct:'a4',ev:'egidious',loc:3,at:t-1e5,ch:fLo,before:'tiro',hall:false,kit:{items:[]}});
  ONL80F.today=ONLC.dayOut(D,'today');onlToday80Patch();
  const best=ONLC.dayBest(ONL80F.today);const s=document.getElementById('v85show');const w=s&&s.querySelector('.v85sc.win'),l=s&&s.querySelector('.v85sc.fall');
  return {val,best:[best.winner&&best.winner.name,best.loser&&best.loser.name],fallen:ONL80F.today.fallen.map(e=>[e.name,e.rank,e.gear,e.purse,e.kb||'',e.kn||'']),
    w:w?{txt:w.textContent.replace(/\s+/g,' '),face:!!w.querySelector('.portrait'),wheat:!!w.querySelector('.v85sc-num svg.ico,.v85sc-num .ico'),chip:w.querySelectorAll('.dom84c[data-onl83="prof"]').length,rank:(w.querySelector('.onl-rk')||{}).textContent||''}:null,
    l:l?{txt:l.textContent.replace(/\s+/g,' '),face:!!l.querySelector('.portrait'),rank:(l.querySelector('.onl-rk')||{}).textContent||'',lost:(l.querySelector('.v85sc-lost')||{}).textContent||''}:null}});
ok(o.seed.best[0]==='Marcus the Bold'||o.seed.best[0]==='Marcus','winner = most CF '+JSON.stringify(o.seed.best));
ok(o.seed.w&&/Marcus/.test(o.seed.w.txt)&&/31\s*CF/.test(o.seed.w.txt)&&/27\s*coin/.test(o.seed.w.txt)&&o.seed.w.face&&/Veteranus/.test(o.seed.w.rank)&&/Democritus/.test(o.seed.w.txt),'the winner box: face, rank, event, CF + coin '+JSON.stringify(o.seed.w));
ok(o.seed.w&&o.seed.w.chip===0||o.seed.w&&o.seed.w.chip===1,'house chip at most once');
ok(o.seed.val>0&&o.seed.l&&/Aemilius/.test(o.seed.l.txt)&&/Primus/.test(o.seed.l.rank)&&new RegExp(o.seed.val+'\\s*in gear').test(o.seed.l.lost)&&/132\s*purse/.test(o.seed.l.lost)&&/Slain by\s*Marcus/.test(o.seed.l.txt)&&/9\s*CF/.test(o.seed.l.txt),'the loser box: best rank, gear value + purse, killer '+JSON.stringify([o.seed.l,o.seed.val]));
ok(o.seed.fallen.length===2&&o.seed.fallen[0][0]==='Aemilius'&&o.seed.fallen[1][3]===5,'fallen sorted best rank first, purse kept '+JSON.stringify(o.seed.fallen));
await shot(A,'show');
/* the house chip opens the profile */
o.size=await A.evaluate(()=>JSON.stringify(ONL80F.today).length);ok(o.size<14000,'the day record stays small '+o.size);
await A.evaluate(()=>{const s=document.getElementById('v85show');s.querySelector('.v85sc.win .v85list').click()});await W8(A,300);
o.pop=await A.evaluate(()=>{const p=document.querySelector('.td81pop');return p?{txt:p.textContent.replace(/\s+/g,' ').slice(0,300),win:/Marcus/.test(p.textContent),fall:/Aemilius/.test(p.textContent)}:null});
ok(o.pop&&o.pop.win&&o.pop.fall,"See today's list opens the day's lists "+JSON.stringify(o.pop));await shot(A,'list');
await A.evaluate(()=>{const c=document.querySelector('.td81pop [data-onl81="tdx"]');if(c)c.click()});await W8(A,200);ok(await A.evaluate(()=>!document.querySelector('.td81pop')),'the list closes');

/* ── 3 · the mock world's own day (a hello) keys by the online day ── */
o.mock=await A.evaluate(async()=>{const w=mockLoad();const t=Date.now();w.days80={};const D=ONLC.dayFromMatch({},{id:'mx',ev:'familia',loc:4,at:t,ranked:true,seats:[{acct:'z',ch:{name:'Hostus',cls:'veteranus',rank:'gregarius',look:{}},before:'gregarius',row:{won:true,f:44},out:{award:18}}]});
  w.days80[ONLC.dayKey(t)]=D;mockSave(w);await onlRefresh();onlRedraw();await new Promise(r=>setTimeout(r,300));const s=document.getElementById('v85show');
  return {key:ONLC.dayKey(t),start:ONLC.dayStart(t),txt:s?s.textContent.replace(/\s+/g,' '):'',day:ONL80F.today&&ONL80F.today.day}});
ok(/Hostus/.test(o.mock.txt)&&/44\s*CF/.test(o.mock.txt)&&/18\s*coin/.test(o.mock.txt)&&o.mock.day==='today','the mock day (keyed by the online day) reaches the showcase '+JSON.stringify(o.mock));
ok(/No one fell today — the sand waits/.test(o.mock.txt),'the loser box empty state');
o.empty=await A.evaluate(()=>{ONL80F.today={day:'today',wins:[],fallen:[],upsets:[]};onlToday80Patch();const s=document.getElementById('v85show');return s?s.textContent.replace(/\s+/g,' '):''});
ok(/No victor yet today — the sand waits/.test(o.empty)&&/No one fell today — the sand waits/.test(o.empty),'both empty states '+o.empty);await shot(A,'empty');
o.yd=await A.evaluate(()=>{ONL80F.today={day:'yesterday',wins:[{name:'Old Win',cls:'hero',rank:'tiro',ev:'democritus',loc:6,cf:12,coin:8,ranked:true}],fallen:[],upsets:[]};onlToday80Patch();return document.getElementById('v85show').textContent.replace(/\s+/g,' ')});
ok(/Old Win/.test(o.yd)&&/yesterday/.test(o.yd)&&/No one fell yesterday/.test(o.yd),'yesterday while today is empty '+o.yd.slice(0,160));

/* ── 4 · the online day: 20:00 New York, DST-aware; the Forum follows it ── */
o.day=await A.evaluate(()=>{const iso=t=>new Date(ONLC.dayStart(Date.parse(t))).toISOString();
  return {summer:iso('2026-07-15T12:00:00Z'),summerEve:iso('2026-07-15T23:59:00Z'),winter:iso('2026-01-15T12:00:00Z'),winterEve:iso('2026-01-15T00:30:00Z'),
    mar8:iso('2026-03-08T12:00:00Z'),mar9:iso('2026-03-09T00:30:00Z'),nov1:iso('2026-11-01T12:00:00Z'),nov2:iso('2026-11-02T00:59:00Z'),nov2b:iso('2026-11-02T01:00:00Z'),
    key:ONLC.dayKey(Date.parse('2026-01-15T00:30:00Z')),prev:ONLC.dayPrevKey(Date.parse('2026-01-15T12:00:00Z')),
    forum:Math.abs(day0_85()-ONLC.forumSince(Date.now()))<1000,grace:ONLC.forumSince(Date.parse('2026-07-16T00:10:00Z'))===Date.parse('2026-07-15T23:40:00Z')}});
ok(o.day.summer==='2026-07-15T00:00:00.000Z'&&o.day.summerEve==='2026-07-15T00:00:00.000Z'&&o.day.winter==='2026-01-15T01:00:00.000Z'&&o.day.winterEve==='2026-01-14T01:00:00.000Z','20:00 New York: 00:00 UTC in summer, 01:00 UTC in winter '+JSON.stringify(o.day));
ok(o.day.mar8==='2026-03-08T01:00:00.000Z'&&o.day.mar9==='2026-03-09T00:00:00.000Z'&&o.day.nov1==='2026-11-01T00:00:00.000Z'&&o.day.nov2==='2026-11-01T00:00:00.000Z'&&o.day.nov2b==='2026-11-02T01:00:00.000Z','the DST switch days');
ok(o.day.key==='2026-01-14'&&o.day.prev==='2026-01-14','day keys');ok(o.day.forum&&o.day.grace,'the Forum starts with the online day (30-min grace)');

/* ── 5 · 👥 the Party panel ── */
o.p0=await A.evaluate(()=>({pbox:!!document.querySelector('#onl .onl-pbox'),code:!!document.querySelector('#onl #onlPCode'),btn:!!document.querySelector('#onl .onl-party [data-v85p="open"]'),
  beside:(()=>{const b=document.querySelector('#onl .v85pbtn');const s=[...document.querySelectorAll('#onl .onl-party .onl-slot')];return !!b&&s.indexOf(b)===s.length-1})()}));
ok(!o.p0.pbox&&!o.p0.code&&o.p0.btn&&o.p0.beside,'no code box under the stage; 👥 Party beside the Invite slots '+JSON.stringify(o.p0));
await A.click('#onl [data-v85p="open"]');await W8(A,300);
o.p1=await A.evaluate(()=>{const p=document.querySelector('#onl .v85pp');return p?{txt:p.textContent.replace(/\s+/g,' '),make:!!p.querySelector('[data-onl="pinvite"]'),input:!!p.querySelector('#onlPCode'),join:!!p.querySelector('[data-onl="pjoin"]')}:null});
ok(o.p1&&/Share your code/.test(o.p1.txt)&&/Join with a code/.test(o.p1.txt)&&o.p1.make&&o.p1.input&&o.p1.join,'the panel: share / join '+JSON.stringify(o.p1));await shot(A,'party');
await A.click('#onl .v85pp [data-onl="pinvite"]');await W8(A,700);
o.p2=await A.evaluate(()=>{const p=document.querySelector('#onl .v85pp');return {open:!!p,code:(document.getElementById('v85code')||{}).textContent||'',party:ONL.party&&ONL.party.code,leave:!!(p&&p.querySelector('[data-onl="pleave"]')),copy:!!(p&&p.querySelector('[data-v85p="copy"]'))}});
ok(o.p2.open&&/^[A-Z0-9]{5}$/.test(o.p2.code)&&o.p2.code===o.p2.party&&o.p2.leave&&o.p2.copy,'Make my party code → the code, Copy, Leave '+JSON.stringify(o.p2));await shot(A,'party_code');
await A.click('#onl .v85pp [data-v85p="copy"]');await W8(A,200);
/* B joins with A's code */
await setup(B,'Beta','soldier');await W8(B,500);
await B.click('#onl [data-v85p="open"]');await W8(B,300);
await B.fill('#onl .v85pp #onlPCode',o.p2.code);await B.evaluate(()=>onlRedraw());await W8(B,100);
o.keep=await B.evaluate(()=>(document.getElementById('onlPCode')||{}).value);ok(o.keep===o.p2.code,'a redraw keeps what was typed ('+o.keep+')');
await B.click('#onl .v85pp [data-onl="pjoin"]');await W8(B,900);
o.p3=await B.evaluate(()=>({party:ONL.party&&ONL.party.members.length,code:(document.getElementById('v85code')||{}).textContent||'',btn:(document.querySelector('#onl .v85pbtn')||{}).textContent||''}));
await W8(A,900);o.p4=await A.evaluate(()=>({n:ONL.party&&ONL.party.members.length,list:[...document.querySelectorAll('#onl .v85pp .v85pp-m li')].map(x=>x.textContent)}));
ok(o.p3.party===2&&o.p3.code===o.p2.code&&/Party · 2/.test(o.p3.btn),'B joins with the code '+JSON.stringify(o.p3));ok(o.p4.n===2&&o.p4.list.length===2,"A's panel lists both "+JSON.stringify(o.p4));
/* Esc / a click elsewhere closes it; Leave */
await B.keyboard.press('Escape');await W8(B,200);ok(await B.evaluate(()=>!document.querySelector('#onl .v85pp')),'Esc closes the panel');
await B.click('#onl [data-v85p="open"]');await W8(B,200);await B.click('#onl .v85pp [data-onl="pleave"]');await W8(B,600);
o.p5=await B.evaluate(()=>({party:ONL.party,share:/Share your code/.test((document.querySelector('#onl .v85pp')||{}).textContent||'')}));ok(!o.p5.party&&o.p5.share,'Leave the party '+JSON.stringify(o.p5));
await B.mouse.click(5,890);await W8(B,200);ok(await B.evaluate(()=>!document.querySelector('#onl .v85pp')),'a click elsewhere closes the panel');
await A.evaluate(()=>{V85.party=true;onlRedraw()});await W8(A,200);await A.click('#onl [data-pl85="cassian"]');await W8(A,200);
o.thru=await A.evaluate(()=>({panel:!!document.querySelector('#onl .v85pp'),tab:(document.querySelector('#onl [data-pl85].on')||{}).dataset?.pl85}));
ok(!o.thru.panel&&o.thru.tab==='cassian','a click elsewhere closes the panel AND still does its job '+JSON.stringify(o.thru));
await A.click('#onl [data-pl85="democritus"]');await A.evaluate(()=>{V85.party=false;onlRedraw()});

/* ── 6 · the landing fits on one screen; phones one column ── */
await A.evaluate(()=>{const e={name:'Vettii the Bold',cls:'hero',rank:'veteranus',ev:'democritus',loc:6,cf:24,coin:27,dom:ONL.domus.id,dn:'Vettii',ranked:true};
  ONL80F.today={day:'today',wins:[e,{...e,cf:20}],fallen:[{...e,name:'Aemilii the Bold',rank:'primus',how:'fate',gear:870,purse:132,dom:'x',dn:'Aemilii'}],upsets:[]};onlRedraw()});
for(const [w,h] of [[1300,900],[1440,900],[1920,1080]]){await A.setViewportSize({width:w,height:h});await W8(A,600);
  const m=await A.evaluate(()=>{const box=document.getElementById('mBody').getBoundingClientRect();const els=[...document.querySelectorAll('#onl .a85-bot .onl-pls81>*:not(.pl85div)'),...document.querySelectorAll('#v85show .v85sc')].filter(e=>e.offsetParent!==null);
    const bot=Math.max(...els.map(e=>e.getBoundingClientRect().bottom));return {n:els.length,bottom:Math.round(bot),box:Math.round(box.bottom),sc:document.getElementById('mBody').scrollTop,guest:!!document.querySelector('#onl .pass82')}});
  o['fit'+w]=m;ok(m.n===6&&m.bottom<=m.box&&m.sc===0,`all four playlists + both showcases in view at ${w}×${h} `+JSON.stringify(m));await shot(A,'land_'+w)}
await A.setViewportSize({width:390,height:844});await W8(A,600);
o.ph=await A.evaluate(()=>{const g=document.querySelector('#onl .onl-play81');const bot=document.querySelector('#onl .a85-bot');return {cols:getComputedStyle(g).gridTemplateColumns.split(' ').length,bcols:getComputedStyle(bot).gridTemplateColumns.split(' ').length,wide:document.documentElement.scrollWidth<=392,mb:document.getElementById('mBody').scrollWidth<=document.getElementById('mBody').clientWidth+2}});
ok(o.ph.cols===1&&o.ph.bcols===1&&o.ph.wide&&o.ph.mb,'phones: one column, no sideways scroll '+JSON.stringify(o.ph));
await A.evaluate(()=>{const e=document.getElementById('v85show');if(e)e.scrollIntoView()});await W8(A,200);await shot(A,'phone');

console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();srv.close();if(miss.length||errs.length)process.exit(1)})();
