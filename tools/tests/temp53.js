const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const o=await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();newWorld({type:'pre',key:MGR_PRE[0].key});const w=W_();const out={};
 const base=worldImpact;const fx=fixtureFor(w.season,w.week+1).loc;
 worldImpact=(li,k)=>{const r=base(li,k);if(li===fx)return {...r,closed:{i:'🌋',n:'Vesuvius erupts',t:'volcano',sev:3,li}};return r};
 for(let i=0;i<w.night.bouts.length;i++)if(!w.night.bouts[i].done)await runBoutSim(i);w.pend=[];await endWeek();
 out.moved={from:LOCATIONS[fx].n,to:LOCATIONS[w.night.loc].n,flag:!!w.night.moved,bouts:w.night.bouts.length};
 /* now every city closed → impromptu bye */
 worldImpact=(li,k)=>({...base(li,k),closed:{i:'☠',n:'Plague',t:'plague',sev:3,li}});
 for(let i=0;i<w.night.bouts.length;i++)if(!w.night.bouts[i].done)await runBoutSim(i);w.pend=[];await endWeek();
 out.bye={bye:!!w.night.bye,imp:!!w.night.imposed,season:w.closedByeSeason};
 for(let i=0;i<w.night.bouts.length;i++)if(!w.night.bouts[i].done)await runBoutSim(i);w.pend=[];await endWeek();
 out.second={bye:!!w.night.bye,bouts:w.night.bouts.length};worldImpact=base;return out});
console.log(JSON.stringify(o));console.log(errs.slice(0,4));await b.close()})();
