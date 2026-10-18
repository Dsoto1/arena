/* tv106g — v1.06 AIM TAG = THE CHANCE TO WOUND (396 aim106Wound, his a1a a2a 2026-10-18). Plain node (tools/node), no browser.
   The exact model (dice enumerated, rollLoc's distribution, every modifier of tools/plans/v106/AIM-MODIFIERS.md) is checked against a
   Monte-Carlo of the REAL attack code: doAttack / tamedAttack run on the same state, restored before every trial, with a seeded RNG and
   the question port answering as the model assumes (the defender raises the shield and plays Minerva / Fidelis; the attacker plays
   Omnia Mutantur and picks the best spot; Health Elixirs are kept). For every case |model p − simulated p| ≤ 2 points and the expected
   damage within max(0.15, 4 standard errors). Also: the model is pure (no rand(), S unchanged) and the cache answers a hover redraw.
   argv[2] = the page. Prints ERRS [] on pass. Under smartreg (REGCOV) it writes the game script's function coverage (as tnode101). */
const path=require('path'),fs=require('fs');
const PAGE=path.resolve(process.argv[2]||path.join(__dirname,'..','..','flavius-arena.html'));
const ERRS=[];const T0=Date.now();const TRIALS=+(process.env.TV106G_N||10000);
let cov=null;if(process.env.REGCOV){const insp=require('inspector');cov=new insp.Session();cov.connect();cov.post('Profiler.enable');cov.post('Profiler.startPreciseCoverage',{callCount:false,detailed:false})}
function covWrite(){return new Promise(res=>{if(!cov)return res();cov.post('Profiler.takePreciseCoverage',(e,r)=>{try{const offs=new Set();let len=0;
  for(const s of (r&&r.result)||[]){if(!/\.(js|html)$/.test(s.url)||/tools[\\/](node|tests|replay)/.test(s.url))continue;const top=s.functions.reduce((m,f)=>Math.max(m,f.ranges[0].endOffset),0);if(top<1e6)continue;len=top+1;
    for(const f of s.functions){const g=f.ranges[0];if(g.count>0&&!(g.startOffset===0&&g.endOffset>=top-2))offs.add(g.startOffset+1)}}
  fs.writeFileSync(process.env.REGCOV,JSON.stringify({len,offs:[...offs]}))}catch(x){}res()})})}

/* the cases: a = attacker loadout, q = target (a gladiator 'g', a beast type, 'pot', or 'tamed' for a tamed beast's attack) */
const CASES=[
  {n:'gladius vs bare',a:{w:'gladius'},q:{g:{}}},
  {n:'gladius vs armor',a:{w:'gladius'},q:{g:{ap:3}}},
  {n:'fist vs full armor',a:{},q:{g:{ap:2}}},
  {n:'fist vs head+chest armor',a:{},q:{g:{ap:{head:3,chest:4}}}},
  {n:'fist + Cestus vs armor',a:{cestus:1},q:{g:{ap:2}}},
  {n:'gladius vs scutum',a:{w:'gladius'},q:{g:{shield:'scutum'}}},
  {n:'falcata vs scutum',a:{w:'falcata'},q:{g:{shield:'scutum'}}},
  {n:'flail vs thracian',a:{w:'flail'},q:{g:{shield:'thracian',ap:2}}},
  {n:'gladius + Omnia 1',a:{w:'gladius',cards:['omnia1']},q:{g:{shield:'thracian'}}},
  {n:'gladius + Omnia 2',a:{w:'gladius',cards:['omnia2']},q:{g:{shield:'scutum'}}},
  {n:'falcata vs Fidelis',a:{w:'falcata'},q:{g:{cards:['fidelis']}}},
  {n:'axe vs Fidelis + thracian',a:{w:'axe'},q:{g:{cards:['fidelis'],shield:'thracian'}}},
  {n:'gladius vs Minerva',a:{w:'gladius'},q:{g:{cards:['minerva']}}},
  {n:'Hercules 2 vs scutum',a:{w:'gladius',herc:2},q:{g:{shield:'scutum'}}},
  {n:'Focus! fist vs head+chest',a:{focusNext:1},q:{g:{ap:{head:3,chest:4,rarm:2}}}},
  {n:'focus roll fist vs 4 armored',a:{focusRoll:1,mv:4},q:{g:{ap:{head:3,chest:4,rarm:2,larm:2}}}},
  {n:'focus roll needs 3 mv',a:{focusRoll:1,mv:2},q:{g:{ap:{head:3,chest:4,rarm:2,larm:2}}}},
  {n:'endgame gladius vs scutum',a:{w:'gladius',endgame:1},q:{g:{shield:'scutum'}}},
  {n:'thrown hasta at 2',a:{w:'hasta',thr:1,dist:2},q:{g:{shield:'thracian'}}},
  {n:'bow at 3 vs scutum',a:{w:'bow',dist:3},q:{g:{shield:'scutum'}}},
  {n:'Strength 96 vs scutum',a:{w:'gladius',str:96},q:{g:{shield:'scutum'}}},
  {n:'fist vs severed + armor',a:{},q:{g:{ap:{head:3,chest:3},hp:{larm:0,rleg:0}}}},
  {n:'shield on a lost arm',a:{w:'gladius'},q:{g:{shield:'scutum',hp:{larm:0}}}},
  {n:'gladius vs lion',a:{w:'gladius'},q:{npc:'lion'}},
  {n:'fist vs bear',a:{},q:{npc:'bear'}},
  {n:'falcata + Omnia 1 vs wolf',a:{w:'falcata',cards:['omnia1']},q:{npc:'wolf'}},
  {n:'focused arcuballista vs Tholo',a:{w:'arcu',focusRoll:1,mv:4,dist:2},q:{npc:'tholo'}},
  {n:'gladius vs pot',a:{w:'gladius'},q:{pot:1}},
  {n:'falcata vs pot',a:{w:'falcata'},q:{pot:1}},
  {n:'focused bow vs pot (+1)',a:{w:'bow',focusRoll:1,mv:4},q:{pot:1}},
  {n:'tamed lion vs scutum',a:{tamed:'lion'},q:{g:{shield:'scutum'}}},
  {n:'tamed wolf vs Fidelis',a:{tamed:'wolf'},q:{g:{cards:['fidelis'],ap:2}}},
  {n:'tamed bear vs a beast',a:{tamed:'bear'},q:{npc:'snake'}},
  {n:'named Ultor vs scutum',a:{w:'gladius',named:{uq:'ultor'},avenge:1},q:{g:{shield:'scutum'}}},
  {n:'pierce 1 vs armor + thracian',a:{w:'falcata',named:{pierce:1}},q:{g:{shield:'thracian',ap:3}}},
  {n:'Percussor vs low HP armor',a:{w:'flail',named:{uq:'percussor'}},q:{g:{ap:2,hp:{head:1,chest:1,rarm:1,larm:1,rleg:1,lleg:1}}}},
  {n:'named ward armor',a:{w:'gladius'},q:{g:{ward:1}}},
  {n:'Aegis + Invicta',a:{w:'falcata'},q:{g:{aegis:1,invicta:1}}},
];

/* the page side: one scenario, the model, then the Monte-Carlo of the real code */
const PAGE_FN=String.raw`(()=>{
const DC=x=>{if(Array.isArray(x))return x.map(DC);if(x instanceof Set)return new Set([...x].map(DC));if(x instanceof Map)return new Map([...x].map(([k,v])=>[k,DC(v)]));
  if(x&&typeof x==='object'&&Object.getPrototypeOf(x)===Object.prototype){const o={};for(const k of Object.keys(x))o[k]=DC(x[k]);return o}return x};
const snapObj=o=>{const s={};for(const k of Object.keys(o))s[k]=DC(o[k]);return s};
const putObj=(o,s)=>{for(const k of Object.keys(o))if(!(k in s))delete o[k];for(const k of Object.keys(s))o[k]=DC(s[k])};
const ZERO=()=>({head:0,chest:0,rarm:0,larm:0,rleg:0,lleg:0});
window.__mc106=async function(C,N,seed){
  const out={n:C.n};const keepEnd=checkEnd;checkEnd=function(){};const keepRNG=RNG;
  try{
  const G=S;const ps=G.players;const a=ps[0],q0=ps[1];for(const p of ps){p.cpu=false;p.alive=true;p.exited=false;p.underground=false}
  for(const p of ps.slice(2)){p.r=0;p.c=ps.indexOf(p)}
  G.endgame=C.a.endgame?1:0;G.active=G.active||{};G.active.telemachus=false;G.truces=new Set();
  const base=x=>{x.hp={head:5,chest:7,rarm:4,larm:4,rleg:4,lleg:4};x.ap=ZERO();x.pieces={head:[],chest:[],rarm:[],larm:[],rleg:[],lleg:[]};x.wR=null;x.wL=null;x.items=[];x.focusNext=false;x.focusRoll=false;x.hercules=0;x.attacks=0;x.armUses={R:0,L:0};x.hitTargets=new Set();x.lastHitBy=null;x._aeg83=null;x._ward84=null};
  base(a);a.r=6;a.c=3;a.mv=C.a.mv!=null?C.a.mv:3;if(a.st)a.st.str=C.a.str||50;
  if(C.a.w){a.wR=mkW(C.a.w);if(C.a.named)Object.assign(a.wR,{named83:1,n:'Test '+C.a.w},C.a.named)}
  if(C.a.cestus){a.pieces.rarm.push({key:'cestus',n:'Cestus',ap:2,bonus:{}});a.ap.rarm=2}
  for(const k of C.a.cards||[])a.items.push(mkCard(k));
  if(C.a.herc)a.hercules=C.a.herc;if(C.a.focusNext)a.focusNext=true;if(C.a.focusRoll)a.focusRoll=true;
  const dist=C.a.dist||1;let target,kind='atk',npc=null;
  if(C.q.g){const g=C.q.g,q=q0;base(q);q.r=6;q.c=3+dist;
    if(typeof g.ap==='number')for(const l of LOCS){q.ap[l]=g.ap;q.pieces[l].push({key:l==='head'?'galea':l==='chest'?'balteus':l.endsWith('arm')?'wraps':'legwraps',n:'pc',ap:g.ap,bonus:{}})}
    else if(g.ap)for(const [l,v] of Object.entries(g.ap)){q.ap[l]=v;q.pieces[l].push({key:l==='head'?'cassis':l==='chest'?'lorica':l.endsWith('arm')?'wraps':'legwraps',n:'pc',ap:v,bonus:{}})}
    if(g.hp)Object.assign(q.hp,g.hp);
    if(g.shield)q.wL=mkW(g.shield);for(const k of g.cards||[])q.items.push(mkCard(k));
    if(g.ward){ARM.__ward106={...ARM.galea,n:'Test ward',named84:1,ward:1};q.pieces.chest.push({key:'__ward106',n:'Test ward',ap:0,bonus:{}})}
    if(g.invicta){ARM.__inv106={...ARM.galea,n:'Test invicta',named84:1,uq:'invicta'};for(const l of LOCS)q.pieces[l].push({key:'__inv106',n:'Test invicta',ap:0,bonus:{}})}
    if(g.aegis)q.wR={...mkW('gladius'),named83:1,uq:'aegis',n:'Test aegis'};
    if(C.a.avenge)a.lastHitBy=q.id;
    target={kind:'player',ref:q,r:q.r,c:q.c,key:'p'+q.id}}
  else if(C.q.npc){npc=G.npcs.find(n=>n.t===C.q.npc)||G.npcs[0];npc.t=C.q.npc;npc.alive=true;npc.out=false;npc.tamedBy=null;npc.hp=NPCT[npc.t].hp||20;npc.r=6;npc.c=3+dist;target={kind:'npc',ref:npc,r:npc.r,c:npc.c,key:'n'+npc.id}}
  else if(C.q.pot){const pl=G.pillars[0];pl.pots=['cf1'];a.r=pl.r;a.c=pl.c-1;if(a.c<0)a.c=pl.c+1;target={kind:'pot',ref:pl,r:pl.r,c:pl.c,key:'b'+pl.id}}
  for(const n of G.npcs)if(n!==npc&&!(target&&target.ref===n)){n.r=12;n.c=n.id%13}
  let beast=null;
  if(C.a.tamed){beast=G.npcs.find(n=>n.t===C.a.tamed&&n!==npc)||G.npcs.find(n=>n!==npc);beast.t=C.a.tamed;beast.alive=true;beast.out=false;beast.carry=null;beast.tamedBy=ps.indexOf(a);beast.hp=NPCT[beast.t].hp||20;beast.r=target.r;beast.c=target.c-1;kind='catk'}
  /* the attack source exactly as 07-ui's HL entry carries it */
  const srcOf=()=>{const L=attackSources(a);return L.find(s=>!!s.thr===!!C.a.thr&&s.arm==='R')||L[0]};
  /* what the model says */
  const SB=JSON.stringify([ps.map(p=>[p.hp,p.ap,p.items.length,p.mv]),G.npcs.map(n=>[n.hp,n.alive]),G.ask101|0]);
  const r0=RNG?RNG.s:null;
  const M=aim106Wound(kind==='catk'?beast:a,target,kind,kind==='catk'?null:srcOf());
  out.model={p:M.p,avg:M.avg,notes:M.notes};
  out.pure=SB===JSON.stringify([ps.map(p=>[p.hp,p.ap,p.items.length,p.mv]),G.npcs.map(n=>[n.hp,n.alive]),G.ask101|0])&&(RNG?RNG.s:null)===r0;
  /* the state every trial starts from */
  const SNAP=[...new Set([a,target.ref,beast].filter(Boolean))].map(o=>[o,snapObj(o)]); /* only what an attack can change (the rest is reset below) */const SS={piles:DC(G.piles),floor:DC(G.floor),elims:G.elims,elimOrder:DC(G.elimOrder||[]),truces:DC(G.truces),chest:DC(G.chest)};
  const q=target.ref;
  const sOf=()=>{const src=kind==='catk'?null:srcOf();return {type:kind==='catk'?'npc':'player',p:a,w:src&&src.w,punch:!!(src&&src.w.punch),cestus:!!(src&&hasCestus(a,src.arm)),thr:!!(src&&src.thr),far:cheb(a,target)>1}};
  let lastD=0;const off=askUse('*',Qn=>{const k=Qn.kind,v=Qn.spec.values||[];
    if(k==='shieldRaise')return 1;
    if(k==='defend')return v.includes('m')?'m':v.includes('f')?'f':'take';
    if(k==='useCard')return Qn.who===a?1:0;
    if(k==='focusLoc'||k==='focusRoll')return aim106Best(q,v.filter(l=>q.hp[l]>0),lastD,sOf());
    if(k==='minervaStep')return -1;
    return undefined});
  const keepCL=chooseLocation;chooseLocation=function(p,qq,how,dmg){lastD=dmg||0;return keepCL.apply(this,arguments)};
  RNG=mulberry32(seed);let hit=0,sum=0,sq=0;
  for(let i=0;i<N;i++){for(const [o,s] of SNAP)putObj(o,s);G.piles=DC(SS.piles);G.floor=DC(SS.floor);G.elims=SS.elims;G.elimOrder=DC(SS.elimOrder);G.truces=DC(SS.truces);G.chest=DC(SS.chest);G.endgame=C.a.endgame?1:0;
    let land=0;
    if(target.kind==='pot'){const n0=q.pots.length;await doAttack(a,srcOf(),target,{focusRoll:a.focusRoll});land=q.pots.length<n0?1:0}
    else if(target.kind==='npc'){const h0=q.hp;if(kind==='catk')await tamedAttack(beast,a,target);else await doAttack(a,srcOf(),target,{focusRoll:a.focusRoll});land=h0-q.hp}
    else{const t0=LOCS.reduce((s,l)=>s+q.hp[l]+q.ap[l],0);if(kind==='catk')await tamedAttack(beast,a,target);else await doAttack(a,srcOf(),target,{focusRoll:a.focusRoll});land=t0-LOCS.reduce((s,l)=>s+q.hp[l]+q.ap[l],0)}
    if(land>0)hit++;sum+=land;sq+=land*land}
  off();chooseLocation=keepCL;for(const [o,s] of SNAP)putObj(o,s);
  const mean=sum/N;out.sim={p:100*hit/N,avg:mean,se:Math.sqrt(Math.max(0,sq/N-mean*mean)/N)};
  /* the cache: the same HL entry answers from the cache until the state moves */
  if(kind==='atk'&&target.kind!=='pot'){const keepCur=cur;const h={t:'atk',src:srcOf(),target};const w0=AIM106.stats.wound|0;const c1=aim106Chance(h),c2=aim106Chance(h);out.cache=(AIM106.stats.wound|0)-w0===1&&c1===c2;
    out.line=aim106Name(h)+' · '+aim106Line(c1)}
  }catch(e){out.err=String(e&&e.stack||e).slice(0,500)}finally{checkEnd=keepEnd;RNG=keepRNG}
  return out};
})()`;

(async()=>{try{
  const {openGame}=require('../node/page.js');
  const P=await openGame({page:PAGE,ls:{flavius_firstrun:'shown',flavius_first100off:'1'}});
  await P.until(()=>P.G.FLAVIUS_READY,60000);P.ev('menuHide();if(CUR_MODAL)CUR_MODAL.done(null)');
  /* a live 4-gladiator event, frozen at its first turn (the turn loop parks; the state is ours) */
  P.ev(`(()=>{HEADLESS=true;THOUGHTS=false;const bt=beginTurn;beginTurn=function(){if(!window.__cap106){window.__cap106=S;beginTurn=bt;return new Promise(()=>{})}return bt.apply(this,arguments)};
    startEvent({ev:'democritus',loc:6,seed:1061,seats:[{cls:'soldier',cpu:true},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0,mandata:false}})})()`);
  const okCap=await P.until(()=>!!P.G.__cap106,600000);if(!okCap)throw new Error('the event did not reach its first turn');
  P.ev(`S=window.__cap106;S.cur=0;S.phase='action';`+PAGE_FN);
  const rows=[];let worst=0,worstA=0;
  for(let i=0;i<CASES.length;i++){const C=CASES[i];P.G.__r106=null;P.ev(`window.__mc106(${JSON.stringify(C)},${TRIALS},${1000+i}).then(r=>{window.__r106=r})`);
    await P.until(()=>!!P.G.__r106,3600000);const r=P.G.__r106;if(!r){ERRS.push(C.n+': no result');continue}
    if(r.err){ERRS.push(C.n+': '+r.err);console.log('ERR   '+C.n+' '+r.err);continue}
    const dp=Math.abs(r.model.p-r.sim.p);const da=r.model.avg==null?0:Math.abs(r.model.avg-r.sim.avg);const tolA=Math.max(0.15,4*r.sim.se);
    worst=Math.max(worst,dp);if(r.model.avg!=null)worstA=Math.max(worstA,da/tolA);
    const ok=dp<=2&&(r.model.avg==null||da<=tolA)&&r.pure&&r.cache!==false;
    rows.push({n:C.n,m:r.model.p,s:r.sim.p,ma:r.model.avg,sa:r.sim.avg});
    console.log((ok?'ok    ':'FAIL  ')+C.n.padEnd(32)+` model ${r.model.p.toFixed(1).padStart(5)}% sim ${r.sim.p.toFixed(1).padStart(5)}% (Δ ${dp.toFixed(2)})`+
      (r.model.avg!=null?` · avg ${r.model.avg.toFixed(2)} vs ${r.sim.avg.toFixed(2)}`:'')+(r.line?` · "${r.line}"`:'')+(r.model.notes.length?` · ${r.model.notes.join('; ')}`:''));
    if(!ok)ERRS.push(`${C.n}: model ${r.model.p.toFixed(2)}/${r.model.avg} vs sim ${r.sim.p.toFixed(2)}/${r.sim.avg.toFixed(3)} pure=${r.pure} cache=${r.cache}`)}
  if(rows.length<30)ERRS.push('only '+rows.length+' cases ran (30+ expected)');
  console.log(`worst |model − sim| = ${worst.toFixed(2)} points over ${rows.length} cases × ${TRIALS} trials`);
  if(P.errors.length)ERRS.push('page errors: '+JSON.stringify(P.errors.map(String)).slice(0,400));
  P.close()}catch(e){ERRS.push(String(e&&e.stack||e).slice(0,500))}
  await covWrite();console.log('time',Math.round((Date.now()-T0)/1000)+'s');console.log('ERRS '+JSON.stringify(ERRS));process.exitCode=ERRS.length?1:0;process.exit()})();
