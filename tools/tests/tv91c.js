/* v0.91 THE CROWD (193-v91crowd): sculpted spectators drawn once per look (no coloured head ring — the old base loop never
   draws them), the screen-front stands seen from behind, a gold ring at a human spectator's feet, a laurel on a known regular,
   even seating (seats spread over the section, not packed at one end), the walk-in at rotation 1 (drawn ≠ seat at the start,
   = seat after; sp._x/_y are the seat at once; Reduce motion = seated at once), sculpted tokens right of the middle drawn
   mirrored (none left of it), the hover line names a spectator; per-frame crowd cost reported. SHOT=dir saves screenshots. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
const errs=[];const miss=[];const out={};const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT||'';
const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});
/* start an event (you at seat 0, so rotation 1 waits on you) and sample the walk-in at once */
const start=async(calm)=>pg.evaluate(async(calm)=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(100)}try{menuHide()}catch(e){}
  SETTINGS.calm=!!calm;SETTINGS.tokenStyle='figure';applySettings();
  startEvent({ev:'democritus',loc:0,seats:['hero','soldier','royalty','venatore'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:48}});
  for(let i=0;i<40;i++){await W8(80);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>2)break}
  SPEED='pause';draw();const live=S.spect.filter(s=>!s.gone);
  const off=live.filter(s=>{const d=crowd91Drawn(s);return !d||!Number.isFinite(d.x)||Math.hypot(d.x-s._x,d.y-s._y)>1}).length;
  const seatOK=live.every(s=>{const a=SEAT91.get(s);if(!a)return false;const p=seatXY91(s.sec,a.slot);return Math.abs(p.x-s._x)<0.01&&Math.abs(p.y-s._y)<0.01});
  return {n:live.length,off,seatOK,rot:S.rotation,ri:S.ri}},calm);
const A=await start(false);out.walkStart=A;
ok(A.n>=20,'0 spectators seated '+A.n);ok(A.seatOK,'6 sp._x/_y are the seat at once');ok(A.off>=A.n*0.3,`6 at the start most are still walking (${A.off}/${A.n})`);
await pg.waitForTimeout(2600);
if(SHOT)await pg.screenshot({path:path.join(SHOT,'tv91c_walk.png')});
const B=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const live=()=>S.spect.filter(s=>!s.gone);const dist=()=>live().map(s=>{const d=crowd91Drawn(s);return !d||!Number.isFinite(d.x)?1e4:Math.hypot(d.x-s._x,d.y-s._y)});
  draw();const mid=dist().filter(x=>x>1).length;for(let i=0;i<60&&dist().some(x=>x>1);i++){await W8(200);draw()}
  return {mid,left:dist().filter(x=>x>1).length,rot:S.rotation,ri:S.ri}});
out.walkEnd=B;ok(B.left===0,'6 everyone seated by the end of the walk-in (still rotation 1: '+B.rot+')');ok(B.rot===1&&B.ri===0,'6 the walk-in ends inside rotation 1');
/* the look: ring gone, back-facing near stands, human foot ring, laurel */
const L=await pg.evaluate(()=>{const g=cv.getContext('2d');const RING=['#8fe07a','#cde07a','#f0a25a','#ff5a44'];let ring=0,inSt=false;
  const st=g.stroke;g.stroke=function(){if(inSt&&RING.includes(String(this.strokeStyle).toLowerCase())&&this.lineWidth===2)ring++;return st.apply(this,arguments)};
  const ds=drawStands;drawStands=function(){inSt=true;try{return ds.apply(this,arguments)}finally{inSt=false}};
  const live=S.spect.filter(s=>!s.gone);live.forEach((s,i)=>{s.mood=[-60,-30,0,20,60][i%5]});live[0].human=true;live[1].visits=12;live[2].visits=0;
  try{draw()}finally{g.stroke=st;drawStands=ds}
  const seen=CR91.seen;const nearSecs=[0,1,2,3,4,5,6,7].filter(nearSec91);
  const backOK=seen.every(x=>x.back===nearSecs.includes(x.sec));const nBack=seen.filter(x=>x.back).length,nFront=seen.length-nBack;
  const h=seen.find(x=>x.human);const r1=seen.find(x=>x.id===live[1].id),r2=seen.find(x=>x.id===live[2].id);
  /* gold at the human's feet */
  const T=CR91.T;let gold=0;if(h){for(const dx of [-0.17,0.17]){const p=T.transformPoint(new DOMPoint(h.x+dx*TW,h.y+TW*0.01));const d=g.getImageData(Math.round(p.x)-2,Math.round(p.y)-2,5,5).data;for(let i=0;i<d.length;i+=4)if(d[i]>190&&d[i+1]>150&&d[i+2]<160&&d[i]-d[i+2]>60)gold++}}
  /* even seating: in each section with 4+ spectators, the seats span most of the bench */
  const spread=[];for(let si=0;si<8;si++){const xs=live.filter(s=>s.sec===si).map(s=>seatXY91(si,SEAT91.get(s).slot).al);if(xs.length<4)continue;spread.push((Math.max(...xs)-Math.min(...xs))/5.25)}
  /* today's packing (16-crowd seatPos k: 4 rows × 6 columns from one end) for the same counts */
  const old=[];for(let si=0;si<8;si++){const n=live.filter(s=>s.sec===si).length;if(n<4)continue;old.push(Math.floor((n-1)/4)*0.95/5.25)}
  const avg=a=>a.reduce((x,y)=>x+y,0)/Math.max(1,a.length);
  /* hover names a spectator */
  const s0=live[3];const R=cv.getBoundingClientRect();const p=T.transformPoint(new DOMPoint(s0._x,s0._y-TW*0.25));
  cv.dispatchEvent(new MouseEvent('mousemove',{clientX:R.left+p.x*R.width/cv.width,clientY:R.top+p.y*R.height/cv.height,bubbles:true}));
  const hov=document.getElementById('hover').textContent;
  let t0=performance.now();for(let i=0;i<20;i++)draw();const frame=(performance.now()-t0)/20;
  return {ring,backOK,nBack,nFront,human:!!h,gold,laurel:!!(r1&&r1.laurel),plain:!!(r2&&!r2.laurel),spread:avg(spread),old:avg(old),secs:spread.length,hov,name:s0.name,crowdMs:CR91.last,frame,hits:CR91.hits,miss:CR91.miss}});
out.look=L;ok(L.ring===0,'2 no coloured mood ring drawn ('+L.ring+')');ok(L.backOK&&L.nBack>0&&L.nFront>0,`1 near stands back-facing, far stands facing (${L.nBack}/${L.nFront})`);
ok(L.human&&L.gold>=2,'3 a gold ring at the human spectator\'s feet ('+L.gold+')');ok(L.laurel&&L.plain,'4 a regular wears the laurel, a stranger does not');
ok(L.secs>0&&L.spread>=0.55&&L.spread>L.old+0.15,`5 seats spread over the section (${L.spread.toFixed(2)} vs packed ${L.old.toFixed(2)})`);
ok(L.hov.includes(L.name),'4 the hover line names the spectator: '+L.hov);
ok(L.crowdMs<25,'per-frame crowd cost '+L.crowdMs.toFixed(2)+' ms');
/* sculpted tokens: mirrored right of the middle only */
const M=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const live=S.players.filter(p=>p.alive);
  /* v1.0: printed classes wear 311's 3D stand-ins (8 rendered facings, never mirrored); the mirror is for sculpted figures (custom/online
     tokens, and every printed class with the stand-ins off) — measured with the stand-ins off */
  const an0=typeof AN100!=='undefined'?AN100.on:null;if(an0!=null)AN100.on=false;
  live[0].r=6;live[0].c=11;live[1].r=6;live[1].c=1;for(let i=0;i<30;i++){MIR91.log.length=0;draw();if(MIR91.log.length)break;await W8(150)}
  if(an0!=null)AN100.on=an0;
  const mid=midX91();return {n:MIR91.log.length,wrong:MIR91.log.filter(x=>x.x<=mid).length,right:MIR91.log.some(x=>x.x>mid+TW*2)}});
out.mirror=M;ok(M.n>0&&M.right,'7 a sculpted token right of the middle is mirrored');ok(M.wrong===0,'7 none left of the middle is mirrored');
if(SHOT){await pg.evaluate(()=>draw());await pg.screenshot({path:path.join(SHOT,'tv91c_look.png')})}
/* Reduce motion: everyone seated at once */
const C=await start(true);out.calm=C;ok(C.off===0,'6 Reduce motion: seated at once ('+C.off+')');
await pg.evaluate(()=>{SETTINGS.calm=false});
console.log(JSON.stringify(out));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));
await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();
