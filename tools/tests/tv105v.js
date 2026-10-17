/* tv105v — v1.05 B66 (385-v105dead): a fighter KILLED in a bout is never a free agent; he keeps his house (marked fallen) until the week ends,
   then is cleared and sits in w.grave; the blood-money "let him go" path behaves the same; buy-back keeps a fighter alive and signed;
   kill switch flavius_v105deadoff=1 restores the old behaviour (contract cleared at once). */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async off=>{const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v105deadoff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_();w.welc99=1;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}});return pg};
let pg=await open(false);
out.on=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={};const w=W_(),pm=me();const ros=rosterOf(pm);const g=ros[0],h=ros[1],s=ros[2];
  const wk=w.week,gr0=w.grave.length;
  /* 1 killed in a bout: not a free agent, still with his house, listed as fallen */
  killFighter(g,pm,FATES[0],'the sand');
  r.notFree=!freeAgents().some(x=>x.id===g.id);r.house=!!g.contract&&g.contract.mgr===pm.id;r.fallen=fallen105(pm).some(x=>x.id===g.id);r.dead=g.alive===false;
  r.notRoster=!rosterOf(pm).includes(g);r.grave1=w.grave.length===gr0+1&&w.grave[0].name===g.name;
  r.offer=offerVerdict(g,10,6,0).ok===false;
  menuHide();openManager('roster');await W8(900);const st=document.querySelector('.f105');r.strip=!!st&&/Fallen this week/.test(st.textContent)&&st.textContent.includes(g.name);
  /* 2 blood money: "let him go" is the same */
  w.pend=[{t:'blood',gid:h.id,bi:0,f:5,fi:0,price:50}];try{settlePending(0,'let')}catch(e){r.err=String(e)}
  r.letDead=h.alive===false&&!!h.fallen105&&!freeAgents().some(x=>x.id===h.id)&&!!h.contract&&h.contract.mgr===pm.id;
  /* 3 buy-back keeps him alive and under contract */
  pm.coin=500;buyBack(s,pm,FATES[0],10);r.bought=s.alive&&!s.fallen105&&!!s.contract&&s.contract.mgr===pm.id;
  /* 4 the week ends: contract cleared, still in the grave, never a free agent */
  w.pend=[];if(w.special&&!w.special.done)await specAutoRun();
  if(w.night&&!w.night.bye)for(let k=0;k<w.night.bouts.length;k++)if(!w.night.bouts[k].done)await runBoutSim(k);w.pend=[];
  const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);try{await endWeek()}finally{clearInterval(hold)}await W8(300);
  const w2=W_();r.adv=w2.week!==wk;
  r.endOk=[g,h].every(x=>{const gg=gById(x.id);return !gg.contract&&gg.alive===false&&!gg.fallen105&&!freeAgents().some(y=>y.id===x.id)&&w2.grave.some(z=>z.name===gg.name)});
  return r});
for(const k of ['notFree','house','fallen','dead','notRoster','grave1','offer','strip','letDead','bought','adv','endOk'])ok(out.on[k],'on '+k+' '+JSON.stringify(out.on));
await pg.close();
/* kill switch: the old behaviour */
pg=await open(true);
out.off=await pg.evaluate(()=>{const w=W_(),pm=me();const g=rosterOf(pm)[0];killFighter(g,pm,FATES[0],'the sand');return {cleared:g.contract===null,noMark:!g.fallen105,notFree:!freeAgents().some(x=>x.id===g.id)}});
ok(out.off.cleared&&out.off.noMark&&out.off.notFree,'kill switch '+JSON.stringify(out.off));
console.log(JSON.stringify(out));
console.log('ERRS',JSON.stringify(errs));if(miss.length){console.log('MISS',JSON.stringify(miss,null,1));await b.close();process.exit(1)}
await b.close();process.exit(errs.length?1:0)})();
