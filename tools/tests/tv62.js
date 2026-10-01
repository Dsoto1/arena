/* v0.62: five minds — tiers from Intelligence, the seat picker's tiers, the chip beside the ratings, tier skills (aiSk) and a Master's sim game */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
o.t=await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();
  const tiers=[58,70,80,90,97].map(i=>AI_TIERS[aiTierOf(i)].k).join(',');const edges=[64,65,75,76,85,86,95,96].map(aiTierOf).join('');
  const chip=/🧠 Master/.test(statChips({spd:70,str:70,int:97,lck:70,cha:70}));const sb=statBonuses({int:80}).tierName;
  const r=await simEvent({ev:'democritus',loc:6,seed:4242,seats:['hero','soldier','slave','royalty'].map((c,i)=>({cls:c,cpu:true,diff:AI_TIERS[i+1].k})),opts:{...CFG.opts,spect:0}},{timeoutMs:60000});
  const r2=await simEvent({ev:'democritus',loc:6,seed:4242,seats:['hero','soldier','slave','royalty'].map((c,i)=>({cls:c,cpu:true,diff:AI_TIERS[i+1].k})),opts:{...CFG.opts,spect:0}},{timeoutMs:60000});
  const p={cpu:true,tier:4};const p0={cpu:true,tier:0};
  return {tiers,edges,chip,sb,done:!!(r&&r.rows),same:JSON.stringify(r.rows.map(x=>x.won))===JSON.stringify(r2.rows.map(x=>x.won)),
    sk:[aiSk(p,'dodge',false),aiSk(p,'focusKill',false),aiSk(p0,'shop',true),aiSk({cpu:false,tier:4},'dodge',false)].join(',')}});
ok(o.t.tiers==='novice,apprentice,fighter,veteran,master','tiers');ok(o.t.edges==='01122334','edges');ok(o.t.chip&&o.t.sb==='Fighter','chip');
ok(o.t.done&&o.t.same,'seeded sim');ok(o.t.sk==='true,true,false,false','skills');
await pg.evaluate(()=>{playNowMenu&&0;openSetup()});await pg.waitForTimeout(1200);
o.pick=await pg.evaluate(()=>{const s=document.querySelector('select[id^="dif"]');return s?[...s.options].map(x=>x.textContent).join('|'):''});
ok(/Novice/.test(o.pick)&&/Master/.test(o.pick),'seat picker');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();
