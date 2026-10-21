/* v1.08b SHARPER FIGURES (410-v108x2): (1) a desktop 1600×1000 at DPR 2 over http fetches the 2× sheets (anim100x2_*) for the printed
   classes on the sand (X108.on, the sheet's k = 2, the rows decoded from them) and — when the beasts were re-baked — beast100x2_* with
   BEAST100_META swapped to the 2× meta; (2) a 2× figure is drawn at the SAME size as the 1× one (311's an100Cell / 312's bst100Cell on the
   board canvas at DPR 2: the strongly changed pixels' bbox within 1 CSS px of the x2off page's, its top within 2: a 1-px-thin crest tip reads stronger at 2×); (3) 403's red aim outline still hugs a 2× figure
   (as tv107f 1a/1b); (4) a 390 px phone (DPR 3, touch) never asks for a 2× file (X108.why 'phone'); (5) kill switch flavius_x2off=1:
   no 2× file, X108.why 'off'; (6) bases off: a 2× beast goes back to 1×; no console errors.
   node tools/tests/tv108x.js <ABSOLUTE page path> → ERRS [] and exit 0. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.mp3':'audio/mpeg'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n);console.log((c?'ok   ':'FAIL ')+n.slice(0,500))};
const W=ms=>new Promise(r=>setTimeout(r,ms));
const open=async(view,ls)=>{const c=await b.newContext(view);await c.route(/fonts\./,r=>r.abort());const pg=await c.newPage();pg._req=[];
  pg.on('request',q=>{const u=q.url();if(/anim100|beast100/.test(u))pg._req.push(u.split('/').pop())});
  pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));pg.on('console',m=>{if(m.type()==='error'&&!/favicon|Failed to load resource/.test(m.text()))errs.push('console: '+m.text())});
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});Object.defineProperty(navigator,'deviceMemory',{get:()=>8});
    localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');for(const k in o)localStorage.setItem(k,o[k])},ls||{});
  await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
  await pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}try{menuHide()}catch(e){}});return pg};
const DESK={viewport:{width:1600,height:1000},deviceScaleFactor:2};
const PHONE={viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true};
/* the human soldier aims at the CPU hero next to him (tv107f's set-up) */
const aim=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.briefing=false;
  startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  await W8(1200);SPEED='snap';for(let i=0;i<160&&!(humanTurn()&&(S.phase==='action'||S.phase==='choice')&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  if(S.phase==='choice'){await takeChoice(cur(),'coin');await W8(200)}while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}SPEED='pause';
  XRAY='off';const pl=[[6,4],[6,5],[11,12],[12,11]];S.players.forEach((p,i)=>{p.r=pl[i][0];p.c=pl[i][1]});
  const away=[[0,0],[12,12],[0,1],[1,0],[12,0],[0,2],[2,0]];S.npcs.forEach((n,i)=>{const a=away[i%away.length];n.r=a[0];n.c=a[1]});try{RD().pvp=true}catch(e){}
  const p=cur();p.attacks=0;p.hitTargets=new Set();p.armUses={R:0,L:0};const src=attackSources(p)[0];S.mode='atk'+src.arm+(src.thr?'T':'');
  render();for(let i=0;i<60;i++){draw();await W8(50);const s=AN100.src.get('p:hero');if(i>20&&s&&s.move.bm.idle&&s.move.bm.idle!==1)break}
  const T=S.players[1];const f=AIM106.figs.find(f=>f.u===T);const s=AN100.src.get('p:hero');
  const st={on:X108.on,why:X108.why,k:s&&s.move.k,bmK:s&&s.move.bm.idle&&s.move.bm.idle.k,x2:X108.st.x2};
  if(!f)return {err:'no fig',figs:AIM106.figs.length,st};const R=cv.getBoundingClientRect(),k=cv.width/R.width;
  return {x:R.left+(f.bb.x0+f.bb.x1)/2/k,y:R.top+(f.bb.y0*0.4+f.bb.y1*0.6)/k,name:T.name,st}});
/* tv107f's measure: the outline's red pixels vs the visible body */
const measure=pg=>pg.evaluate(()=>{const s=aim106Shown();const f=s&&AIM106.figs.find(f=>f.u===s.ref);if(!f)return {err:'not shown'};
  const sp=[...AIM106.oc.values()].pop();const w=sp.cv.width,h=sp.cv.height;const o0=f.ops[0].m;const ox=Math.round(o0[4]+sp.ox),oy=Math.round(o0[5]+sp.oy);
  const sil=document.createElement('canvas');sil.width=w;sil.height=h;const g=sil.getContext('2d',{willReadFrequently:true});
  for(const o of f.ops){g.setTransform(o.m[0],o.m[1],o.m[2],o.m[3],o.m[4]-ox,o.m[5]-oy);g.drawImage(o.img,o.sx,o.sy,o.sw,o.sh,o.dx,o.dy,o.dw,o.dh)}
  const A=g.getImageData(0,0,w,h).data,O=sp.cv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,w,h).data;
  const isB=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&A[(y*w+x)*4+3]>=128;let red=0,onSolid=0,far=0,maxD=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const a=O[(y*w+x)*4+3];if(a<60)continue;red++;if(A[(y*w+x)*4+3]>=250){onSolid++;continue}
    let d=99;for(let r=0;r<=8&&d===99;r++)for(let dy=-r;dy<=r&&d===99;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;if(isB(x+dx,y+dy)){d=Math.hypot(dx,dy);break}}
    if(d>maxD)maxD=d;if(d===99)far++}
  const big=f.ops.some(o=>o.sw>=100||o.sh>=150);return {red,onSolid,far,maxD:+maxD.toFixed(2),built:F107.st.built,srcRect:f.ops.map(o=>[o.sw,o.sh].map(Math.round))}});
/* the drawn size: one cell drawn on the board canvas at DPR 2, the bbox of the strongly changed pixels in CSS px (thin tips the 2× sheet resolves better stay under the threshold) */
const sizes=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const out={};
  /* drawn on the board canvas itself (device px, a DPR-2 identity transform, the contact shadow off), the changed pixels' bbox in CSS px, then put back */
  const box=(fn)=>{const kc=AN100.cur,sh=fl104Sh;AN100.cur=null;fl104Sh=()=>{};const g=cv.getContext('2d');const before=g.getImageData(0,0,800,800);
    ctx.save();ctx.setTransform(2,0,0,2,0,0);try{fn()}finally{ctx.restore();AN100.cur=kc;fl104Sh=sh}
    const d=g.getImageData(0,0,800,800).data,o=before.data;g.putImageData(before,0,0);let x0=1e9,y0=1e9,x1=-1,y1=-1;
    for(let y=0;y<800;y++)for(let x=0;x<800;x++){const q=(y*800+x)*4;if(Math.abs(d[q]-o[q])+Math.abs(d[q+1]-o[q+1])+Math.abs(d[q+2]-o[q+2])>150){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}}
    return [x0/2,y0/2,(x1+1)/2,(y1+1)/2]};
  for(const cls of ['soldier','hero']){const src=an100Printed(cls);let i=0;while(!an100Bm(src,'move','idle')&&i++<80)await W8(100);
    out[cls]={k:src.move.k||1,b:box(()=>an100Cell(src,{set:'move',name:'idle',i:0},2,200,300,null))}}
  const bk=Object.keys(BEAST100X2_META).filter(k=>k!=='spider')[0];
  if(bk){let i=0;while(!bst100Img(bk,0)&&i++<80)await W8(100);out.beast={k:bk,x2:!!BEAST100_META[bk].x2,b:box(()=>bst100Cell(bk,2,{act:false,name:'idle0'},200,300,null))}}
  return out});

/* ---- 1 · desktop DPR 2: the 2× sheets; 3 · the aim outline on a 2× figure ---- */
let pg=await open(DESK);const P=await aim(pg);
ok(!P.err&&P.st.on===true&&P.st.why==='big'&&P.st.k===2&&P.st.bmK===2&&P.st.x2>=1,'1 desktop 1600×1000 DPR 2: the 2× sheets, rows cut at k 2 '+JSON.stringify(P.st));
ok(pg._req.some(u=>/^anim100x2_hero_move\.webp/.test(u))&&!pg._req.some(u=>/^anim100_hero_move\.webp/.test(u)),'1 the 2× file is fetched, not the 1× one '+JSON.stringify(pg._req.slice(0,12)));
if(!P.err){await pg.mouse.move(P.x,P.y,{steps:3});await W(400);const m=await measure(pg);const lim=1.5*2+1.6;
  ok(!m.err&&m.red>20&&m.built>=1,'3a the 403 outline is drawn on a 2× figure '+JSON.stringify(m));
  ok(!m.err&&m.maxD<=lim&&m.far===0&&m.onSolid<=m.red*0.02,'3b it hugs the body (every red pixel within '+lim+' device px, none on the solid body) '+JSON.stringify(m))}
const S2=await sizes(pg);
/* 6 · bases off: a 2× beast goes back to its 1× sheets (334 / 346 cut the base with rules tuned on 1×) */
const B6=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const k=Object.keys(BST108X1)[0];if(!k)return {err:'no 2x beast'};
  SETTINGS.bases101=false;let im=bst100Img(k,0);for(let i=0;i<80&&!im;i++){await W8(100);im=bst100Img(k,0)}const r={k,x2:!!BEAST100_META[k].x2,imX2:!!(im&&im._x2),n:X108.st.beastNoBase};SETTINGS.bases101=true;return r});
ok(!B6.err&&!B6.x2&&!B6.imX2&&B6.n>=1,'6 bases off: the beast wears its 1× sheets again '+JSON.stringify(B6));
await pg.context().close();
/* ---- 5 · kill switch, same screen; 2 · the same drawn size ---- */
pg=await open(DESK,{flavius_x2off:'1'});const P5=await aim(pg);const S1=await sizes(pg);
ok(P5.st&&P5.st.on===false&&P5.st.why==='off'&&(P5.st.k||1)===1&&!pg._req.some(u=>/x2_/.test(u)),'5 kill switch flavius_x2off=1: 1× only '+JSON.stringify({st:P5.st,req:pg._req.filter(u=>/x2_/.test(u))}));
for(const k of ['soldier','hero','beast'])if(S2[k]||S1[k]){const a=S2[k]&&S2[k].b,c=S1[k]&&S1[k].b;const d=a&&c?Math.max(...a.map((v,i)=>Math.abs(v-c[i])/(i===1?2:1))):99;   /* the top edge within 2 CSS px: a crest / spear tip one 1× pixel thin reads stronger in the 2× cell */
  ok(a&&c&&(k==='beast'?S2[k].x2&&!S1[k].x2:S2[k].k===2&&S1[k].k===1)&&d<=1,`2 ${k}: the 2× cell is drawn at the 1× size (bbox within 1 CSS px, its top within 2) `+JSON.stringify({x2:S2[k],x1:S1[k],d}))}
await pg.context().close();
/* ---- 4 · a phone ---- */
pg=await open(PHONE);const P4=await aim(pg);
ok(P4.st&&P4.st.on===false&&P4.st.why==='phone'&&!pg._req.some(u=>/x2_/.test(u))&&pg._req.some(u=>/^anim100_/.test(u)),'4 a 390 px phone: 1× sheets only '+JSON.stringify({st:P4.st,req:pg._req.slice(0,8)}));
await pg.context().close();

await b.close();srv.close();console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(2)});
