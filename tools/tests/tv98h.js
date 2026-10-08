/* v0.98 chariot horses (258-v98horses): every horse token = two different horses (his sheet faces, Saxo 1/10 new on
   chtok cell 17) in a pool of 12, drawn without replacement with a random face up from the seeded dice; a gate flip changes the face, the horse's name and its
   movement, logs "… takes the reins", and the panel card + the board draw the new face; same seed = same deal and race. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+require('path').resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
o.data=await pg.evaluate(()=>{const faces=HORSES.flatMap(H=>H.sides);
  return {n:HORSES.length,two:HORSES.every(H=>H.sides.length===2&&H.sides[0].n&&H.sides[1].n&&H.sides[0].n!==H.sides[1].n),
    art:faces.every(s=>CHTOK_IDX[s.art]!=null),saxoC:CHTOK_IDX.saxoC===17&&faces.some(s=>s.art==='saxoC'),
    even:['Palmatus','Ocianus','Saxo','Vindex'].every(n=>faces.filter(s=>s.n===n).length===6),
    tip:cardText('h:saxoC'),label:cardLabel('h:vindexB'),tok:horseTok98(HORSES[0])}});
ok(o.data.n===12&&o.data.two&&o.data.art&&o.data.saxoC,'tokens = two different horses');ok(o.data.even,'each horse 6 faces');
ok(/Saxo/.test(o.data.tip)&&/Other side/.test(o.data.tip)&&/Vindex/.test(o.data.tip),'face tooltip names the other side');ok(/⇄/.test(o.data.tok),'token name A ⇄ B');
/* same seed → same deal and the same race; the starting face is dealt (some tokens start on their second face) */
o.det=await pg.evaluate(async()=>{while(CUR_MODAL)CUR_MODAL.done(null);menuHide();
  const deals=[];const bs=chariotSetup;chariotSetup=function(){const r=bs.apply(this,arguments);deals.push(S.players.map(p=>p.ch.horse.sides[p.ch.horse.face].art+':'+p.ch.horse.name+':'+p.ch.horse.face).join(',')+'|'+S.floor.filter(f=>f.kind==='horse').map(f=>f.part.name+f.part.face).join(','));return r};
  const seats=['soldier','hero','slave','royalty'].map(c=>({cls:c,cpu:true,stats:{spd:70,str:70,int:70,lck:70,cha:70}}));const res=[];
  for(const seed of [981,981,982,983,984,985])res.push(await simEvent({ev:'chariot',loc:7,seed,seats:JSON.parse(JSON.stringify(seats)),opts:{...CFG.opts,spect:0}},{timeoutMs:120000,maxTurns:900}));
  chariotSetup=bs;
  return {same:deals[0]===deals[1]&&res[0].turns===res[1].turns&&res[0].winners.join()===res[1].winners.join(),deals,faces1:deals.some(d=>/:1(,|\|)/.test(d))&&deals.some(d=>/:0(,|\|)/.test(d))&&new Set(deals.slice(1)).size>2,turns:res.map(r=>r.turns)}});
ok(o.det.same,'deterministic deal + race');ok(o.det.faces1,'deals vary by seed');
/* a live race (seat 0 human, held at the draft window): drive player 0 through the top gate */
o.flip=await pg.evaluate(async()=>{startEvent({ev:'chariot',loc:7,seed:4242,seats:[{cls:'hero',cpu:false},...['soldier','slave','royalty'].map(c=>({cls:c,cpu:true}))],opts:{...CFG.opts,spect:0}});
  {const t0=Date.now();while(Date.now()-t0<30000&&!(S.players&&S.players[0]&&S.players[0].ch&&CUR_MODAL))await new Promise(r=>setTimeout(r,100))}
  const toks=[...S.players.map(q=>q.ch.horse),...S.floor.filter(f=>f.kind==='horse').map(f=>f.part)].map(h=>HORSES.findIndex(T=>T.sides===h.sides));const noRep=toks.every(t=>t>=0)&&new Set(toks).size===toks.length;
  const p=S.players[0],H=p.ch.horse;const f0=H.face,n0=H.name,mv0=chMv(p),other=H.sides[1-f0];
  const drawn=[];const bt=chTok;chTok=function(art){drawn.push(art);return bt.apply(this,arguments)};
  p.cf=0;p.r=1;p.c=6;p.ch.cr=1;p.ch.cc=6;await chStep(p,1,7);
  const logTxt=[...document.querySelectorAll('#log li')].slice(0,8).map(li=>li.textContent).join(' / ');
  render();draw();await new Promise(r=>setTimeout(r,250));draw();
  const comp=chCardComp(p);const board=(document.getElementById('board')||{}).innerHTML||'';chTok=bt;
  const r={noRep,toks,face:H.face!==f0,name:H.name===other.n&&H.name!==n0,mv:H.sides[H.face].mv===other.mv&&chMv(p)===clamp(3+other.mv-(p.ch.wheel?0:2),1,7),
    log:new RegExp(`${n0}.*is spent.*${other.n} takes the reins`).test(logTxt),comp:comp.includes('h:'+other.art)&&comp.includes('chnm98')&&comp.includes('⇄')&&/fl98/.test(comp),
    drawn:drawn.includes(other.art)||drawn.includes(H.sides[f0].art),flipT:!!H.flipT,n0,n1:H.name,logTxt:logTxt.slice(0,300)};
  /* a second flip goes back to the first horse */
  p.r=11;p.c=6;await chStep(p,11,5);r.back=H.face===f0&&H.name===n0;
  while(CUR_MODAL)CUR_MODAL.done(null);S.over=true;return r});
ok(o.flip.face&&o.flip.name&&o.flip.mv,'flip: face, name, movement');ok(o.flip.log,'flip log names the new horse');ok(o.flip.comp,'panel card shows the new face');
ok(o.flip.drawn&&o.flip.flipT,'board draws the turning token');ok(o.flip.back,'second flip returns');ok(o.flip.noRep,'tokens drawn without replacement (racers + spares)');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();
