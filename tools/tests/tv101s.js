/* tv101s — v1.01 CARD / BEAST EFFECTS AS DATA (328-v101fx):
   1 every key resolves: each CARDS / OFFER key has a row whose effects name a family or a registered handler, every NPCT type a
     beast profile, every Mandata a row (fx101Check() === []); a drawn Piaculum, a Studio beast's spawn card and a cohort card resolve
     by pattern.
   2 the interpreter == the old code: tools/tests/tv101s_old.js holds the dispatch EXACTLY as it was (04 resolveDrawn / useItem, 03
     revealOffering + the 64/129/133/179/199 wrappers, verbatim). For every printed card, the generated cards and every offering, on
     two seeded states × three setups (as dealt / stripped + hurt / beasts gone + a severed limb), the old and the new run from the
     same seed on fresh, identical states: S (JSON), RNG.s, uid, the log lines and the return value must be the same.
   3 beasts: fx101Beast(t) gives what the rules used to test by name (hunt, prey, hoard, chest, Commodus' CF pick, tame, lure) for every
     printed type and two Studio beasts (one humanoid that hunts CF, one tameable animal); a Studio beast's spawn card spawns through
     the table and the new beast reads its own NPCT row. */
const fs=require('fs'),path=require('path');const {chromium}=require('playwright');(async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1200,height:800}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+path.resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
await pg.addScriptTag({content:fs.readFileSync(path.join(__dirname,'tv101s_old.js'),'utf8')});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};

/* ---------- 1 rows ---------- */
const rows=await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();
  CUSTOM.npcs.push({id:'fx1',name:'Gigas',kind:'Giant',glyph:'G',color:'#888',hp:9,ap:3,rng:1,mv:2,coin:5,cf:3,beh:'cf',tameable:false,states:true,tok:{kind:'human'}});
  CUSTOM.npcs.push({id:'fx2',name:'Lupa',kind:'Wolf',glyph:'L',color:'#777',hp:5,ap:2,rng:1,mv:3,coin:3,cf:2,beh:'hunt',tameable:true});
  for(const n of CUSTOM.npcs.slice(-2)){NPCT['cn_'+n.id]=npcType(n);CARDS['spawn_cn_'+n.id]=cn82Card(n)}
  CLASSES.cc_fx={...CLASSES.soldier,custom:true,name:'Fx Maximus',color:'#26dfa4',clsRef:'ccl:fx'};CUSTOM.classes=(CUSTOM.classes||[]).concat([{id:'fx',name:'Fx Maximus',color:'#26dfa4'}]);
  const pia=piaKeyFor('ccl_fx');
  const o={bad:fx101Check(),pia,piaRow:fx101Row('card',pia)&&fx101Row('card',pia).draw.fam,spawn:fx101Row('card','spawn_cn_fx2').draw.fam,
    pair:fx101Row('card','pair_x').draw.fam,nCards:Object.keys(CARDS).length,nOffers:Object.keys(OFFER).length,nMf:MANDATA.length,
    fams:Object.keys(FX101.fam).length,unknown:fx101Row('card','nope__'),beast:fx101Row('beast','lion').hunt};
  return o});
console.log('ROWS',JSON.stringify(rows));
ok(rows.bad.length===0,'rows: '+rows.bad.join(', '));ok(rows.piaRow==='piaculum','drawn Piaculum by class');ok(rows.spawn==='spawnCustom','Studio spawn card');
ok(rows.pair==='pair','cohort card');ok(rows.unknown===null,'an unknown key has no row');ok(rows.beast===true,'beast lookup through fx101Row');

/* ---------- 2 old == new ---------- */
const keys=await pg.evaluate(()=>({cards:Object.keys(CARDS).filter(k=>!k.startsWith('pair_')),offers:Object.keys(OFFER)}));
const res=await pg.evaluate(async({keys})=>{
  SPEED='snap';const out={n:0,diff:[],noise:0};
  const closer=setInterval(()=>{try{if(CUR_MODAL)CUR_MODAL.done(null)}catch(e){}},20);
  let lines=[];BUS.on('log',d=>lines.push(d.html+'|'+(d.cls||'')));
  const ser=()=>JSON.stringify(S,(k,v)=>v instanceof Set?{__set:[...v]}:v instanceof Map?{__map:[...v]}:typeof v==='function'||SER_SKIP.has(k)?undefined:v);
  /* display-only fields draw()/rAF write on S (the camera duel flag, the stands' fade clock) — not rules state */
  const SER_SKIP=new Set(['_duel100','_stRaf','_stFade','_fr','_fc','_face']); /* + 102's mini facing on pieces */
  const SEATS=[{cls:'veteranus',cpu:true},{cls:'damnatio',cpu:true},{cls:'venatore',cpu:true},{cls:'cc_fx',cpu:true}];
  /* fresh — the same state every time for (seed, setup); returns the acting gladiator */
  const MR=Math.random;let mr=null;const fresh=(seed,setup,pi)=>{mr=mulberry32(seed*7+setup);Math.random=()=>mr.next(); /* cosmetic Math.random (thoughts…) seeded per run */
    newState({ev:'democritus',loc:6,seed,seats:SEATS,opts:{optOffers:1}});S.phase='action';S.cur=pi;S.turnNo=3;S.startedAt=0; /* the one wall-clock field */
    const p=S.players[pi];
    if(setup===1){for(const l of LOCS)stripLoc(p,l);p.wR=null;p.coin=0;p.hp.rarm=2;p.hp.larm=1;p.mv=2;S.players[(pi+1)%4].coin=1}
    if(setup===2){for(const n of S.npcs)if(n.t==='bear')n.alive=false;p.hp.rleg=0;p.hp.chest=2;p.cf=30;
      const w=S.npcs.find(n=>n.t==='wolf');if(w){w.r=p.r;w.c=Math.min(12,p.c+1);w.tamedBy=S.players[(pi+2)%4].id}}
    lines=[];return p};
  const snap=ret=>({ret:ret===undefined?'u':ret,S:ser(),rng:RNG?RNG.s:0,uid,log:lines.join('\n')});
  /* H = run HEADLESS (sims' path, fast; log captured by a stand-in log()), else the live path (cardShow, beats, the BUS) */
  let H=true;const LOG0=log;
  const runOne=async(fn,mk,seed,setup,pi)=>{HEADLESS=H;if(H)log=(h,c='')=>lines.push(h+'|'+(c||''));const p=fresh(seed,setup,pi);const a=mk(p);let ret;try{ret=await fn(p,a)}catch(e){ret='ERR '+e.message}
    for(let i=0;i<40&&CUR_MODAL;i++)await new Promise(r=>setTimeout(r,25));if(!H)await new Promise(r=>setTimeout(r,60)); /* let cosmetic tails land in THIS run */
    const o=snap(ret);Math.random=MR;HEADLESS=false;log=LOG0;return o};
  const firstDiff=(a,b)=>{for(const f of ['ret','rng','uid','log','S'])if(JSON.stringify(a[f])!==JSON.stringify(b[f])){
      if(f!=='S'&&f!=='log')return f+' '+JSON.stringify(a[f])+' vs '+JSON.stringify(b[f]);
      const x=String(a[f]),y=String(b[f]);let i=0;while(i<x.length&&x[i]===y[i])i++;return f+' @'+i+': '+x.slice(Math.max(0,i-60),i+60)+' ‖ '+y.slice(Math.max(0,i-60),i+60)}return null};
  const cmp=async(label,oldFn,newFn,mk)=>{for(const [seed,setup,h] of [[101,0,true],[101,1,true],[101,2,true],[2024,0,true],[2024,1,true],[2024,2,true],[555,0,false]]){H=h;const pi=(seed+setup)%4;
      const A=await runOne(oldFn,mk,seed,setup,pi),B=await runOne(newFn,mk,seed,setup,pi);out.n++;
      const d=firstDiff(A,B);if(d){const B2=await runOne(newFn,mk,seed,setup,pi);const dn=firstDiff(B,B2);if(dn){out.noise++;(out.nz=out.nz||[]).push(label+': '+dn.slice(0,300));continue}out.diff.push(label+' seed '+seed+' setup '+setup+': '+d.slice(0,400))}}};
  /* drawn */
  for(const k of keys.cards)await cmp('draw '+k,(p)=>OLD101_rd(p,k),(p)=>fx101Drawn(p,k),()=>null);
  /* played from the hand */
  for(const k of keys.cards.filter(k=>CARDS[k].type!=='instant'&&CARDS[k].type!=='active'))await cmp('use '+k,(p,it)=>OLD101_use(p,it),(p,it)=>fx101Use(p,it),p=>{const it=mkCard(k);p.items.push(it);if(k==='ammo')p.items.push(mkCard('ammo'));return it});
  for(const k of keys.offers)await cmp('use offer '+k,(p,it)=>OLD101_use(p,it),(p,it)=>fx101Use(p,it),p=>{const it=mkOffer(k);p.items.push(it);return it});
  /* the whole useItem chain (310's wrapper outside) still lands on the table */
  for(const k of ['elix2','cf2','mw1','eagle'])await cmp('useItem '+k,(p,it)=>OLD101_use(p,it),(p,it)=>useItem(p,it),p=>{const it=mkOffer(k);p.items.push(it);return it});
  /* revealed from a pot */
  for(const k of keys.offers)await cmp('reveal '+k,p=>OLD101_revealBase(p,k,[p.r,Math.min(12,p.c+1)]),p=>fx101Reveal(p,k,[p.r,Math.min(12,p.c+1)]),()=>null);
  /* the comparison can see a difference (Wealth 3 vs Wealth 5) */
  {H=true;const A=await runOne(p=>OLD101_rd(p,'wealth3'),()=>null,101,0,0),B=await runOne(p=>fx101Drawn(p,'wealth5'),()=>null,101,0,0);out.canary=!!firstDiff(A,B)}
  Math.random=MR;clearInterval(closer);out.used=FX101.used;return out},{keys});
console.log('DIFF',res.n,'comparisons, noise',res.noise,'mismatches',res.diff.length);for(const d of res.diff.slice(0,20))console.log('  '+d);for(const d of (res.nz||[]).slice(0,8))console.log('  NOISE '+d);
ok(res.diff.length===0,res.diff.length+' old/new mismatches');ok(res.n>=(keys.cards.length+keys.offers.length*2+4)*7,'comparisons '+res.n);ok(res.noise===0,'noisy states '+res.noise);ok(res.canary,'the comparison sees a real difference');
const famsUsed=Object.keys(res.used||{});console.log('FAMILIES RUN',famsUsed.length,famsUsed.join(' '));ok(famsUsed.length>=30,'families exercised '+famsUsed.length);

/* ---------- 3 beasts ---------- */
const be=await pg.evaluate(async()=>{const o={bad:[]};
  const old=t=>{const T=NPCT[t];return {hunt:t==='tholo'||t==='lion',prey:t!=='zora',hoard:t==='tholo',chest:t==='tholo',picksCF:!!(t==='commodus'||T.huntCF),tame:!!T.tameable,
    lure:t==='zora'||t==='commodus'?false:t==='tholo'?true:!(typeof hum95ally==='function'&&hum95ally(t))}};
  for(const t of Object.keys(NPCT)){const a=old(t),f=fx101Beast(t);for(const k of Object.keys(a))if(a[k]!==f[k])o.bad.push(t+'.'+k+' '+a[k]+'≠'+f[k])}
  o.cn1=fx101Beast('cn_fx1');o.cn2=fx101Beast('cn_fx2');
  /* lureOK100 / tameable / setAggro read the table */
  const n1={alive:true,t:'cn_fx1'},n2={alive:true,t:'cn_fx2'};o.lure=[lureOK100(n1),lureOK100(n2),lureOK100({alive:true,t:'tholo'}),lureOK100({alive:true,t:'zora'}),lureOK100({alive:true,t:'commodus'})];
  /* a Studio beast's spawn card through the table */
  SPEED='snap';newState({ev:'democritus',loc:6,seed:5,seats:[{cls:'hero',cpu:true},{cls:'soldier',cpu:true},{cls:'slave',cpu:true},{cls:'royalty',cpu:true}],opts:{}});
  const before=S.npcs.length;await fx101Drawn(S.players[0],'spawn_cn_fx1');const nb=S.npcs[S.npcs.length-1];
  o.spawned=S.npcs.length===before+1&&nb.t==='cn_fx1';o.tame=tameable(nb);o.picks=fx101Beast(nb.t).picksCF;
  nb.aggro=null;setAggro(nb,S.players[1],'push');o.ignoresPush=nb.aggro==null;setAggro(nb,S.players[1],'card');o.cardSends=nb.aggro===S.players[1].id;
  return o});
console.log('BEASTS',JSON.stringify(be));
ok(be.bad.length===0,'beast profiles: '+be.bad.join(', '));
ok(be.cn1.picksCF&&!be.cn1.lure&&!be.cn1.tame&&be.cn1.prey&&!be.cn1.hunt,'Studio humanoid CF hunter profile');ok(be.cn2.tame&&be.cn2.lure&&be.cn2.scan&&!be.cn2.picksCF,'Studio tameable hunter profile');
ok(JSON.stringify(be.lure)==='[false,true,true,false,false]','lure through the table '+JSON.stringify(be.lure));
ok(be.spawned,'Studio spawn card spawns its beast');ok(be.tame===false&&be.picks===true,'spawned Studio beast reads its own row');ok(be.ignoresPush&&be.cardSends,'a CF picker ignores push aggro, a card sends it');
const E=errs.filter(e=>!/favicon|net::/.test(e));
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(E.concat(miss)));await b.close();process.exit(E.length||miss.length?1:0)})();
