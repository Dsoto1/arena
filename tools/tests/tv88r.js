/* v0.88 the Familia playlist box cycles through approved online events (161-v88pl); built from tv85l's setup.
   (was: v0.85 ONLINE LANDING II (146-v85land, mock): the playlists in a 2×2 grid (This week · Classic with working tabs · Familia · Ludi Infames)
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
await A.goto(URL0);await A.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|report|over|match|tester|clock)/.test(k))localStorage.removeItem(k)});await B.goto(URL0);await W8(A,2500);
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});ONL.domus=(await NET.req('domus.create',{name})).domus;
  ONL.char=await NET.req('char.create',{name:name+' the Bold',cls});onlineOpen('play');await new Promise(r=>setTimeout(r,1200));ONL.tab='play';await onlRefresh();onlRedraw()},[name,cls]);
await setup(A,'Vettii','hero');await W8(A,600);


o.one=await A.evaluate(()=>({rot:!!document.querySelector('#onl .rot88'),fam:!!document.querySelector('#onl [data-pl81="familia"]')}));
ok(!o.one.rot&&o.one.fam,'one approved event: the plain Familia card '+JSON.stringify(o.one));
/* approve a second event (test only) */
o.two=await A.evaluate(async()=>{ONL_EVENTS_OK88.push('ludus');if(!ONLC.EVENTS_ALL.includes('ludus'))ONLC.EVENTS_ALL.push('ludus');ROT88.MS=1500;onlRedraw();await new Promise(r=>setTimeout(r,400));
  const box=document.querySelector('#onl .rot88');if(!box)return {box:false};const on=()=>box.querySelector('.rot88s.on [data-pl81]').dataset.pl81;const a=on();
  await new Promise(r=>setTimeout(r,2800));const b=on();box.querySelector('[data-rot88i="0"]').click();const c=on();
  const btn=[...box.querySelectorAll('.rot88s.on [data-onl="quick"]')].map(x=>x.dataset.v);
  return {box:true,slides:box.querySelectorAll('.rot88s').length,dots:box.querySelectorAll('.rot88d button').length,a,b,c,btn}});
ok(o.two.box&&o.two.slides===2&&o.two.dots===2,'two approved: a cycling box with dots '+JSON.stringify(o.two));
ok(o.two.a==='familia'&&o.two.b==='ludus'&&o.two.c==='familia','it cycles and the dots jump');
ok(o.two.btn&&o.two.btn.includes('familia|1'),'Ranked/Custom buttons on the shown card');
o.kids=await A.evaluate(()=>[...document.querySelector('#onl .a85-bot .onl-pls81').children].map(c=>c.className.slice(0,40)+'|'+(c.dataset.pl81||'')));ok(o.kids.filter(k=>/\|ludus$/.test(k)).length===0,'no separate card for a cycling event');if(SHOT)await shot(A,'rot');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs));await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();
