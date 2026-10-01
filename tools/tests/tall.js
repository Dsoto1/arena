const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
await pg.evaluate(async()=>{await loadCustoms();
  const w=blankCW();w.name='Oath of Roma';await Store.put('customWeapons',w.id,w);
  const a=blankCA();a.name='Bronze of Pola';await Store.put('customArmor',a.id,a);
  const f=blankFlag();f.name='The Boar of Capua';await Store.put('customFlags',f.id,f);
  const t=blankTrophy();t.name='The Cedar Owl';t.id='tr'+Date.now();await Store.put('customTrophies',t.id,t);
  await Store.put('customSponsors','sp1',{...blankSponsor(),id:'sp1',name:'Gaius the Generous'});
  const tk={id:'tk1',name:'Crested Hoplite',spec:{...tokenForCls('soldier')}};await Store.put('customTokens',tk.id,tk);
});
await pg.evaluate(()=>{openStudio('all')});await pg.waitForTimeout(1100);
const r=await pg.evaluate(()=>({types:[...document.querySelectorAll('.tally.compact tr td:nth-child(3)')].map(x=>x.textContent),filters:[...document.querySelectorAll('[data-st="allf"]')].map(x=>x.textContent)}));
// open the weapon from the list
await pg.evaluate(()=>{const b2=[...document.querySelectorAll('[data-st="allopen"]')].find(x=>/^weapons\|/.test(x.dataset.v));b2&&b2.click()});await pg.waitForTimeout(600);
const op=await pg.evaluate(()=>({tab:ST.tab,sub:ST.gearSub,name:ST.cw&&ST.cw.name}));
console.log(JSON.stringify({r,op}),errs.slice(0,3));await b.close()})();
