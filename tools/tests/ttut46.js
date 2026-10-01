const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1500,height:980}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1500);
await pg.click('[data-mm="learn"]');await pg.waitForTimeout(3000);
const log=[];let shots=0;
for(let i=0;i<700;i++){
  const st=await pg.evaluate(()=>{const s=TUT_STEPS[TUT.step];return {on:TUT.on,step:TUT.step,id:s&&s.id,over:!!(S&&S.over),modal:!document.getElementById('modal').hidden,mt:document.getElementById('mTitle').textContent,next:!!document.querySelector('#tutCoach [data-tut="next"]'),hum:humanTurn(),ph:S.phase,busy:S.busy,cue:document.getElementById('tutCoach')&&document.getElementById('tutCoach').classList.contains('cue')}});
  if(!log.length||log[log.length-1].id!==st.id){if(st.id==='card')console.log('CARDPOS',await pg.evaluate(()=>JSON.stringify(S.players.map(q=>[q.r,q.c]))+' r2='+TUT.r2+' ri='+S.ri));log.push(st);if(['move','tunnel','snake','card','strike'].includes(st.id)&&shots<5){shots++;await pg.screenshot({path:`tut46_${st.id}.png`})}}
  if(st.over)break;
  if(st.modal){await pg.evaluate(()=>{const b=document.querySelector('#mBtns button.primary:not([disabled])')||document.querySelector('#mBtns button:not([disabled])');b&&b.click()});await pg.waitForTimeout(400);continue}
  if(st.next){await pg.click('#tutCoach [data-tut="next"]');await pg.waitForTimeout(500);continue}
  if(st.hum&&!st.busy){
    const did=await pg.evaluate(()=>{const s=TUT_STEPS[TUT.step];const p=TUT.p;const sug=tutSuggest(p);
      if(!sug)return 'nosug';
      if(sug.sel){const b=document.querySelector(sug.sel);if(b){b.click();return 'sel'}}
      if(sug.act==='coin'||sug.act==='card'||sug.act==='end'||sug.act==='focus'){const b=document.querySelector(`[data-act="${sug.act}"]`);if(b){b.click();return sug.act}return 'nobtn '+sug.act}
      if(sug.mode&&S.mode!==sug.mode){const b=document.querySelector(`[data-act="${sug.act}"]`);if(b)b.click();return 'mode '+sug.mode}
      if(sug.tile){onTile(sug.tile.r,sug.tile.c);return 'tile'}
      return 'x'});
    if(did==='nosug'){await pg.evaluate(()=>{const b=document.querySelector('[data-act="end"]');const p=TUT.p;if(b&&TUT_STEPS[TUT.step].id==='fight')b.click()})}
  }
  await pg.waitForTimeout(450)}
const dbg=await pg.evaluate(()=>{const p=TUT.p;window.__k={kills:S.npcKills,ri:S.ri,npcs:S.npcs.map(n=>[n.t,n.alive,n.hp])};const srcs=attackSources(p);return {pos:[p.r,p.c],mv:p.mv,att:p.attacks,pots:p.stats.pots,ph:S.phase,hum:humanTurn(),cur:cur().name,targets:srcs.map(s=>targetsFor(p,s).map(t=>t.kind)),sug:JSON.stringify(TUT_STEPS[TUT.step].sug&&TUT_STEPS[TUT.step].sug(p)),k:window.__k,pls:S.players.map(q=>[q.name,q.alive,q.exited,q.r,q.c,JSON.stringify(q.hp)]),pl:S.pillars.filter(x=>Math.abs(x.r-p.r)<=1&&Math.abs(x.c-p.c)<=1).map(x=>[x.r,x.c,x.pots])}});console.log(JSON.stringify(dbg));
const fin=await pg.evaluate(()=>({over:S&&S.over,win:S&&S.result&&S.result.winners,title:document.getElementById('mTitle').textContent,btns:[...document.querySelectorAll('#mBtns button')].map(b=>b.textContent.slice(0,30)+(b.disabled?'(dis)':'')),deck:S.deck.includes('telemachus')}));
console.log(log.map(x=>x.step+':'+x.id+(x.cue?'(c)':'')).join(' | '));console.log(JSON.stringify(fin));console.log('ERRS',errs.slice(0,5));await b.close()})();
