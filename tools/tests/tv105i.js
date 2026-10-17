/* v1.05 B41 · a netted piece's NET is drawn in the piece's own depth slot (370-v105net), not in a late FX pass over everything.
   Setup: 3D minis, a snake netted on a free diagonal cell (r,c), a gladiator in front (r+1,c+1) and one behind (r-1,c-1). One draw() with the test-only recorder NET105.rec:
   (1) fig(snake) < net(snake) < fig(front gladiator), and fig(rear gladiator) < net(snake): behind pieces in front, over pieces behind;
   (2) the same for a NETTED GLADIATOR with a wolf in front of / behind him;  (3) classic token path (tokenStyle 'figure', mini3d off): same order;
   (4) Animations Off (still): the net is still drawn once, in the same slot;  (5) kill switch flavius_v105netoff=1: no per-piece net (312's late pass);
   (6) draw cost.  SHOTDIR=<dir> saves screenshots (not part of the test). */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async ls=>{const c=await b.newContext({viewport:{width:1440,height:900}});await c.route(/fonts\./,r=>r.abort());const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in o)localStorage.setItem(k,o[k])},ls||{});
  await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}menuHide()});return pg};
const SH=process.env.SHOTDIR||'';
const start=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.briefing=false;SETTINGS.calm=false;
  startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  await W8(1200);SPEED='snap';for(let i=0;i<160&&!(humanTurn()&&(S.phase==='action'||S.phase==='choice')&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  if(S.phase==='choice'){await takeChoice(cur(),'coin');await W8(200)}while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}SPEED='pause';
  XRAY='off';return {on:typeof NET105!=='undefined'&&!NET105.off}});
/* lay out: A = netted piece at (6,6); F in front (7,6); R behind (5,6). kind 'npc' = a netted snake with gladiators; 'pl' = a netted gladiator with wolves */
const setup=(pg,kind)=>pg.evaluate(async(kind)=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));
  for(const n of S.npcs){n.netted=false}for(const q of S.players){q.netted=false}
  const pls=S.players,ids={};let q=[6,6];for(let r=2;r<=10&&q[0]===6;r++)for(let c=2;c<=10;c++){if([-1,0,1].every(d=>!pillarAt(r+d,c+d))&&!(r===6&&c===6)){q=[r,c];r=99;break}}const [qr,qc]=q;
  const nz=S.npcs.filter(n=>n.alive&&!n.out&&n.t!=='zora');let k=0;for(const n of nz){n.r=12;n.c=k++%12}
  if(kind==='npc'){const s=nz.find(n=>n.t==='snake')||nz[0];s.t='snake';s.r=qr;s.c=qc;s.netted=true;s.aggro=null;
    pls[0].r=qr+1;pls[0].c=qc+1;pls[1].r=qr-1;pls[1].c=qc-1;pls[2].r=0;pls[2].c=0;pls[3].r=0;pls[3].c=1;window.__T={A:s,F:pls[0],R:pls[1]};ids.kind='npc'}
  else{const a=pls[0];a.r=qr;a.c=qc;a.netted=true;pls[1].r=0;pls[1].c=0;pls[2].r=0;pls[2].c=1;pls[3].r=0;pls[3].c=2;
    nz[0].r=qr+1;nz[0].c=qc+1;nz[1].r=qr-1;nz[1].c=qc-1;window.__T={A:a,F:nz[0],R:nz[1]};ids.kind='pl'}
  S.mode='';HL.clear();render();for(let i=0;i<8;i++){draw();await W8(40)}
  /* the piece's net FLIGHT (312's BST100.nets entry, wind+fly = 700 ms at speed 1) starts at the first draw; the net is only in the piece's slot once it has landed — without this wait the order check raced the 700 ms mark (failed at ~650-700 ms elapsed) */
  for(let i=0;i<60;i++){const T=(BST100.net.wind+BST100.net.fly)*bst100K(),now=performance.now();if(!BST100.nets.some(x=>x.u===window.__T.A&&now-x.t0<T+60))break;draw();await W8(50)}
  return ids},kind);
const order=(pg,ids)=>pg.evaluate(async(ids)=>{const A=window.__T.A,F=window.__T.F,R=window.__T.R;
  NET105.rec=[];draw();const rec=NET105.rec;NET105.rec=null;
  const fig=u=>rec.findIndex(e=>e.k==='fig'&&e.u===u),net=rec.map((e,i)=>e.k==='net'&&e.u===A?i:-1).filter(i=>i>=0);
  return {fA:fig(A),fF:fig(F),fR:fig(R),net,n:rec.length,netted:A.netted,rest:A.r+','+A.c,mode:bst100Mode()}},ids);
const good=o=>o.net.length===1&&o.fA>=0&&o.fF>=0&&o.fR>=0&&o.fR<o.net[0]&&o.fA<o.net[0]&&o.net[0]<o.fF;
const shot=async(pg,name)=>{if(!SH)return;const cl=await pg.evaluate(async()=>{for(let i=0;i<4;i++){draw();await new Promise(r=>setTimeout(r,50))}const A=window.__T.A,m=center(A.r,A.c),cv=ctx.canvas,rc=cv.getBoundingClientRect(),k=rc.width/cv.width;return {x:Math.max(0,rc.left+m.x*k-110),y:Math.max(0,rc.top+(m.y-TW*1.3)*k),width:220,height:170}});await pg.screenshot({path:path.join(SH,name+'.png'),clip:cl})};

let pg=await open();const st=await start(pg);ok(st.on,'0 module on');
let ids=await setup(pg,'npc');let o=await order(pg,ids);ok(good(o),'1 snake: fig(snake) < net < fig(gladiator in front); gladiator behind < net '+JSON.stringify(o));await shot(pg,'npc-3d');
ids=await setup(pg,'pl');o=await order(pg,ids);ok(good(o),'2 netted gladiator: same order with wolves in front / behind '+JSON.stringify(o));await shot(pg,'pl-3d');
/* 3 classic token path */
await pg.evaluate(()=>{SETTINGS.tokenStyle='figure';SETTINGS.mini3d=false;applySettings();draw()});
ids=await setup(pg,'npc');o=await order(pg,ids);ok(good(o),'3a classic tokens, snake '+JSON.stringify(o));await shot(pg,'npc-classic');
ids=await setup(pg,'pl');o=await order(pg,ids);ok(good(o),'3b classic tokens, gladiator '+JSON.stringify(o));
/* 4 Animations Off */
await pg.evaluate(()=>{SPEED='snap'});
ids=await setup(pg,'npc');o=await order(pg,ids);ok(o.mode==='still'&&good(o),'4 still mode: net drawn once in the same slot '+JSON.stringify(o));
await pg.evaluate(()=>{SPEED='pause'});
await pg.context().close();
/* 5 switch */
pg=await open({flavius_v105netoff:'1'});await start(pg);ids=await setup(pg,'npc');o=await order(pg,ids);ok(o.net.length===0&&o.fA>=0,'5 switch off: no per-piece net (312 late pass) '+JSON.stringify(o));await shot(pg,'npc-switchoff');
await pg.context().close();
/* 6 cost */
pg=await open();await start(pg);await setup(pg,'npc');
const cost=await pg.evaluate(async()=>{const run=()=>{const t=performance.now();for(let i=0;i<60;i++)draw();return (performance.now()-t)/60};NET105.off=false;const on=Math.min(run(),run(),run());NET105.off=true;const off=Math.min(run(),run(),run());NET105.off=false;return {on:+on.toFixed(2),off:+off.toFixed(2)}});
ok(cost.on<=cost.off*1.15+1.5,'6 370 costs no more than +15%/1.5 ms a frame '+JSON.stringify(cost));console.log('COST',JSON.stringify(cost));
await b.close();srv.close();
console.log('ERRS',JSON.stringify(errs.slice(0,5)));if(errs.length)miss.push('page errors');
console.log(miss.length?'FAIL '+miss.join(' | '):'PASS');process.exit(miss.length?1:0)})();
