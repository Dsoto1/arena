/* tv100bal — v1.0 Play Now balance (315-v100bal): Damnatio pelted only on even rotations, loadout has Iron Helm + Belt I; Amazonia has no
   Falcata; Chariot order / Orpheus corners / Golden Eagle first team are seeded lots (vary across seeds, same seed = same lot); online kit data unchanged. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR/.test(m.text()))errs.push('console: '+m.text())});
await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const R=await pg.evaluate(async()=>{while(CUR_MODAL)CUR_MODAL.done(null);menuHide();const o={};
  o.damArm=CLASSES.damnatio.armor.map(a=>a.join(':'));o.amaL=CLASSES.amazonia.L||null;o.amaR=CLASSES.amazonia.R;
  o.kitDam=JSON.stringify(onlKits92().damnatio);o.kitDamOld=JSON.stringify(ONLC.kitFromArmor92(BAL100.dam0,onlCatalog()));
  const seats=l=>l.map((c,j)=>({cls:c,cpu:true,diff:'fighter',team:'P'+(j+1)}));
  const base={opts:{...CFG.opts,spect:0}};
  const go=async cfg=>{startEvent(cfg);for(let i=0;i<80;i++){await new Promise(r=>setTimeout(r,50));if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>3)break}SPEED='pause'};
  await go({...base,ev:'democritus',loc:6,seed:11,seats:seats(['damnatio','soldier','hero','slave'])});
  const d=S.players[0];o.hasHelm=d.ap.head>0;o.belt=d.ap.chest>0;
  o.pelt={};for(const rot of [1,2,3,4]){S.rotation=rot;d.alive=true;let n=0;const lg=log;log=function(h){if(/pelts/.test(String(h)))n++;return lg.apply(this,arguments)};
    await resolvePhase(d);log=lg;o.pelt[rot]=n}
  await go({...base,ev:'democritus',loc:6,seed:12,seats:seats(['amazonia','soldier','hero','slave'])});o.amaWL=S.players[0].wL?'has':null;
  const lot=async(ev,seed,f)=>{await go({...base,ev,loc:EVENTS[ev].loc,seed,seats:seats(['soldier','hero','slave','royalty'])});return f()};
  o.ch=[];o.or=[];o.eg=[];
  for(const sd of [1,2,3,4,5,6,7,8]){o.ch.push(await lot('chariot',sd,()=>S.order.join('')));
    o.or.push(await lot('orpheus',sd,()=>S.players.map(p=>p.start.join(',')).join('|')));
    o.eg.push(await lot('goldenEagle',sd,()=>S.players[S.order[0]].team+S.order.join('')))}
  o.ch2=await lot('chariot',3,()=>S.order.join(''));
  o.or2=await lot('orpheus',3,()=>S.players.map(p=>p.start.join(',')).join('|'));
  o.eg2=await lot('goldenEagle',3,()=>S.players[S.order[0]].team+S.order.join(''));
  return o});
console.log(JSON.stringify(R));
ok(R.damArm.slice(0,2).join()==='galea:head,balteus1:chest','Damnatio loadout galea+balteus1');ok(R.hasHelm&&R.belt,'Damnatio wears helm + belt at start');
ok(R.pelt[1]===0&&R.pelt[3]===0&&R.pelt[2]===1&&R.pelt[4]===1,'pelted on even rotations only '+JSON.stringify(R.pelt));
ok(R.amaL===null&&R.amaR==='axe'&&!R.amaWL,'Amazonia has no falcata');
ok(R.kitDam===R.kitDamOld,'online Damnatio kit unchanged');
const U=a=>new Set(a).size;ok(U(R.ch)>1,'chariot order varies');ok(U(R.or)>1,'orpheus corners vary');ok(U(R.eg.map(x=>x.slice(0,2)))>1,'eagle first team varies');
ok(R.ch[2]===R.ch2&&R.or[2]===R.or2&&R.eg[2]===R.eg2,'same seed, same lot');
console.log('ERRS',JSON.stringify(errs));if(miss.length)console.log('FAIL',miss);await b.close();process.exit(miss.length||errs.length?1:0)})();
