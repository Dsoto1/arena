/* v0.99 (210-v92fix): the Attack group says the REAL reason there is no attack. Naumachia slave, left arm severed, Gladius in the right hand.
   adjacent enemy -> attack enabled and works; no enemy -> "No enemy within range 1" (never "spent"); a teammate next to us does not count;
   enemy across the water -> "Across the water"; a sword is never "spent"; a real spent-ammo weapon still says spent; the tip shows on the v2 bar. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
const reached=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SPEED='fast';
  startEvent({ev:'naumachia',loc:6,seats:['slave','hero','soldier','royalty'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:0}});
  for(let i=0;i<500;i++){await W8(120);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);
    else if(S&&cur()===S.players[0]&&S.phase==='action'&&!S.busy)break;
    else if(S&&cur()===S.players[0]&&S.phase==='choice'&&!S.busy){const c=document.querySelector('#actions [data-act="coin"]');if(c)c.click()}}
  SPEED='pause';render();await W8(200);return !!S&&cur()===S.players[0]&&S.phase==='action'});
ok(reached,'0 reached our Action phase in Naumachia');
const mark=await pg.evaluate(()=>typeof ERR92!=='undefined'?ERR92.n:0);
const R=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};const p=cur();const q=S.players[1];
  p.hp.larm=0;p.wL=null;p.wR=mkW('gladius');p.attacks=0;p.armUses={R:0,L:0};p.hitTargets=new Set();p.mv=3;p.focusRoll=false;S.mode='move';S.truces=new Set();
  for(const x of S.players)if(x!==p&&x!==q){x.r=0;x.c=0;x.alive=false}
  const sh=shipAt(p.r,p.c);let nb=null;for(const [dr,dc] of [[0,1],[1,0],[0,-1],[-1,0]]){const r=p.r+dr,c=p.c+dc;if(sh&&sh.tiles.has(r*N+c)&&!unitAt(r,c)&&!pillarAt(r,c)){nb=[r,c];break}}
  o.sameShip=!!nb;
  const info=()=>{render();const A=document.getElementById('actions');const bs=[...A.querySelectorAll('[data-g96="atk"] button[data-act^="m-atk"]')];
    return {pvp:!!RD().pvp,en:bs.filter(x=>!x.disabled).length,n:bs.length,why:atk92Why(p),tip:[...A.querySelectorAll('[data-g96="atk"] .wb98')].map(x=>x.dataset.tip||'').join('|')}};
  q.team='Z';q.alive=true;q.underground=false;q.exited=false;q.r=nb[0];q.c=nb[1];
  o.adj=info();
  const src=attackSources(p)[0];const t=targetsFor(p,src)[0];
  if(t){const tot=()=>Object.values(q.hp).reduce((a,v)=>a+v,0)+Object.values(q.ap).reduce((a,v)=>a+v,0);const h0=tot();await doAttack(p,src,t);o.dmg=tot()<h0||p.attacks>0}
  p.attacks=0;p.armUses={R:0,L:0};p.hitTargets=new Set();S.mode='move';
  q.team=p.team;o.mate=info();q.team='Z';
  const far=[...sh.tiles].map(k=>[Math.floor(k/N),k%N]).find(([r,c])=>cheb({r,c},p)===2&&!unitAt(r,c)&&!pillarAt(r,c));
  if(far){q.r=far[0];q.c=far[1];o.far=info()}
  const other=S.ships.find(s=>s!==sh&&!s.sunk);const ot=[...other.tiles].map(k=>[Math.floor(k/N),k%N]).find(([r,c])=>!unitAt(r,c)&&!pillarAt(r,c)&&cheb({r,c},p)>1);
  q.r=ot[0];q.c=ot[1];o.water=info();
  o.swordWhy=atk92Why(p);
  const bow=mkW('gladius');bow.ammo=1;bow.ammoLeft=0;p.wR=bow;o.spent=atk92Why(p);
  p.wR=mkW('gladius');p.attacks=1;o.none=atk92Why(p);
  return o});
console.log(JSON.stringify(R));
ok(R.sameShip,'1 a free tile on our ship');
ok(R.adj&&R.adj.en>=1&&!/spent/.test(R.adj.why),'2 adjacent enemy: attack enabled '+JSON.stringify(R.adj));ok(R.dmg,'2b the attack works');
ok(R.mate&&R.mate.en===0&&/No enemy within range 1/.test(R.mate.why),'3 a teammate next to us does not count: '+JSON.stringify(R.mate));
if(R.far)ok(R.far.en===0&&R.far.why==='No enemy within range 1'&&/No enemy within range 1/.test(R.far.tip),'4 enemy 2 tiles away: '+JSON.stringify(R.far));
ok(R.water&&/Across the water/.test(R.water.why)&&/Across the water/.test(R.water.tip),'5 enemy on another ship: '+JSON.stringify(R.water));
ok(typeof R.swordWhy==='string'&&!/spent/.test(R.swordWhy),'6 sword never spent: '+R.swordWhy);
ok(/spent/.test(R.spent),'7 spent ammo says spent: '+R.spent);
ok(/no attacks left/.test(R.none),'8 attacks used');
const fresh=await pg.evaluate(mark=>typeof ERR92!=='undefined'?ERR92.n-mark:0,mark);ok(!fresh,'9 no new logged errors');
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();
