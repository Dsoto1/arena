/* v1.05 B42 · a pot that holds shows it on the board (371-v105pot). A weak attack on a Blessings pot (dice stubbed in the test only):
   (1) 1 damage -> one readout "Holds · 1 of 2" keyed to the pillar's tile, lifted above the pot, painted on the overlay above the cell, and the pot shakes;
   (2) no hit -> "Miss" (the small "Missed" float of the same blow is replaced, not doubled);
   (3) Animations Off -> the same text, NO shake;  (4) a pot that breaks (2 damage) shows neither;  (5) kill switch flavius_v105potoff=1 -> nothing. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f).slice(1);r.writeHead(200,{'content-type':{html:'text/html',js:'text/javascript',css:'text/css',png:'image/png',jpg:'image/jpeg',webp:'image/webp'}[ext]||'application/octet-stream'});r.end(fs.readFileSync(f))});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async ls=>{const c=await b.newContext({viewport:{width:1440,height:900}});await c.route(/fonts\./,r=>r.abort());const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in o)localStorage.setItem(k,o[k])},ls||{});
  await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}menuHide()});return pg};
const start=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.briefing=false;SETTINGS.calm=false;SETTINGS.anim88='normal';
  startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  await W8(1200);SPEED='snap';for(let i=0;i<160&&!(humanTurn()&&(S.phase==='action'||S.phase==='choice')&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  if(S.phase==='choice'){await takeChoice(cur(),'coin');await W8(200)}while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}SPEED='pause';
  return {human:humanTurn(),pillars:S.pillars.filter(p=>p.pots&&p.pots.length).length}});
/* one weak blow: hits = the stubbed dice; returns what the board shows */
const blow=(pg,hits,anim)=>pg.evaluate(async([hits,anim])=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.anim88=anim;SETTINGS.fx=true;
  const p=cur(),pl=S.pillars.find(x=>x.pots&&x.pots.length);let spot=null;
  for(const [dr,dc] of [[0,-1],[0,1],[-1,0],[1,0]]){const r=pl.r+dr,c=pl.c+dc;if(r>=0&&c>=0&&r<13&&c<13&&!S.pillars.some(q=>q.r===r&&q.c===c)&&!S.players.some(q=>q!==p&&q.alive&&q.r===r&&q.c===c)){spot=[r,c];break}}
  p.r=spot[0];p.c=spot[1];p.hitTargets=new Set();p.attacks=0;for(const k in p.armUses)p.armUses[k]=0;H100.list.length=0;POT105.sh=null;
  const pots0=pl.pots.length;const src=attackSources(p)[0];const t={kind:'pot',ref:pl,key:'b'+pl.id,r:pl.r,c:pl.c};
  let ev=null,snap=null;const key='tile:'+pl.r+','+pl.c;
  BUS.on('pot.hold',e=>{ev=e;snap=new Promise(res=>setTimeout(()=>{draw();let ink=false;
    try{const c=fx95Cv(),dpr=window.devicePixelRatio||1,m=center(pl.r,pl.c);h100Paint(true);const x0=Math.max(0,Math.floor((m.x-TW*0.8)*dpr)),y0=Math.max(0,Math.floor((m.y-TW*2.6)*dpr)),w=Math.floor(TW*1.6*dpr),h=Math.floor(TW*1.7*dpr);
      const d=c.getContext('2d').getImageData(x0,y0,w,h).data;for(let i=3;i<d.length;i+=4)if(d[i]>20){ink=true;break}}catch(er){ink='err '+er.message}
    const R=H100.list.filter(x=>x.key===key);res({word:R.map(x=>x.word),up:R.length?R[0].up:null,shook:!!POT105.sh,ink})},100))});
  const R0=RNG,sb=statDmgB;statDmgB=()=>0;let qi=0;RNG={next:()=>hits[qi++%hits.length]?0:0.9999};const s1={arm:src.arm,w:{...src.w,p:1}};
  try{await doAttack(p,s1,t)}finally{RNG=R0;statDmgB=sb}
  const sn=snap?await snap:{word:[],up:null,shook:false,ink:false};
  return {ev,...sn,broke:pl.pots.length<pots0}},[hits,anim]);
const pg=await open();const st=await start(pg);ok(st.human&&st.pillars>0,'setup '+JSON.stringify(st));
const a=await blow(pg,[true,false],'normal');console.log('HOLD',JSON.stringify(a));
ok(a.ev&&a.ev.dmg===1,'event dmg 1');ok(a.word.length===1&&a.word[0]==='Holds · 1 of 2','text '+a.word);ok(a.up>0,'lifted above the pot');ok(a.ink===true,'painted above the cell');ok(a.shook,'pot shakes');
const m=await blow(pg,[false,false],'normal');console.log('MISS',JSON.stringify(m));ok(m.word.length===1&&m.word[0]==='Miss','miss text '+m.word);ok(m.ink===true,'miss painted');ok(m.shook,'miss shakes');
const o=await blow(pg,[true,false],'off');console.log('OFF',JSON.stringify(o));ok(o.word.length===1&&o.word[0]==='Holds · 1 of 2','off text '+o.word);ok(!o.shook,'anim off: no shake');
const br=await blow(pg,[true,true],'normal');console.log('BREAK',JSON.stringify(br));ok(br.broke&&br.word.length===0&&!br.shook,'a breaking pot shows no hold readout');
await pg.context().close();const pk=await open({flavius_v105potoff:'1'});await start(pk);const k=await blow(pk,[true,false],'normal');console.log('KILL',JSON.stringify(k));ok(k.word.length===0&&!k.shook,'kill switch');
await b.close();srv.close();
console.log('ERRS',JSON.stringify(errs.slice(0,5)));if(errs.length)miss.push('page errors');
console.log(miss.length?'FAIL '+miss.join(' | '):'PASS');process.exit(miss.length?1:0)})();
