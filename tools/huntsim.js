/* huntsim.js — v0.90 the hunters (186-v90board): all-CPU sims of an event set with the hunt rule off (the old 04 scan rule)
   and on, same seeds and seats for both, and the numbers he asked for: gladiator deaths per event (by beasts / by gladiators /
   other), beasts slain (by gladiators / by beasts), Tholo / lion beast-kills, event length (turns).
   Usage: node tools/huntsim.js flavius-arena.html [games=300] [events=democritus,egidious,cassian,gauntlet] */
const {chromium}=require('playwright');
(async()=>{const page=process.argv[2];const N=+(process.argv[3]||300);const EVS=(process.argv[4]||'democritus,egidious,cassian,gauntlet').split(',');
const b=await chromium.launch();const pg=await b.newPage();await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+require('path').resolve(page));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
await pg.evaluate(()=>{while(CUR_MODAL)CUR_MODAL.done(null);menuHide();
  window.HS={};const z=()=>({elimBeast:0,elimGlad:0,elimOther:0,npcByGlad:0,npcByBeast:0,tholoBK:0,lionBK:0});
  window.HSreset=()=>{window.HS=z()};HSreset();
  const be=eliminate;eliminate=function(v,src){if(v&&v.alive&&src){if(src.type==='npc')HS.elimBeast++;else if(src.type==='player')HS.elimGlad++;else if(src.type!=='retire')HS.elimOther++}return be.apply(this,arguments)};
  const bh=hurtNPC;hurtNPC=function(n,d,p,pre,w,by){const was=n&&n.alive;const r=bh.apply(this,arguments);
    if(was&&!n.alive){if(p&&p.cls)HS.npcByGlad++;else if(by){HS.npcByBeast++;if(by.t==='tholo')HS.tholoBK++;if(by.t==='lion')HS.lionBK++}}return r}});
const out={};
for(const ev of EVS)for(const mode of ['before','after']){const acc={games:0,err:0,turns:0,elimBeast:0,elimGlad:0,elimOther:0,npcByGlad:0,npcByBeast:0,tholoBK:0,lionBK:0};
  for(let i=0;i<N;i++){const r=await pg.evaluate(async([ev,i,on])=>{HUNT90.on=on;HSreset();
      let h=(i+1)*2654435761>>>0;const R=()=>((h=(h*1103515245+12345)>>>0)/4294967296);
      const cls=[...BASE_CLS].sort((a,b)=>a<b?-1:1);for(let k=cls.length-1;k>0;k--){const j=Math.floor(R()*(k+1));[cls[k],cls[j]]=[cls[j],cls[k]]}
      const seats=cls.slice(0,4).map(c=>({cls:c,cpu:true,pers:rollPersonality(c),stats:rollStats(leanOf(c),70,R)}));
      try{const res=await simEvent({ev,loc:6,seed:1000+i,seats,opts:{...CFG.opts,spect:0}},{timeoutMs:90000});return {turns:res.turns,...HS}}catch(e){return {err:String(e&&e.message||e)}}},[ev,i,mode==='after']);
    if(r.err){acc.err++;continue}acc.games++;for(const k in acc)if(k!=='games'&&k!=='err'&&r[k]!=null)acc[k]+=r[k]}
  const g=Math.max(1,acc.games),f=v=>Math.round(v/g*100)/100;
  out[ev+'/'+mode]={games:acc.games,err:acc.err,deaths:f(acc.elimBeast+acc.elimGlad+acc.elimOther),byBeast:f(acc.elimBeast),byGlad:f(acc.elimGlad),other:f(acc.elimOther),
    beastsSlainByGlad:f(acc.npcByGlad),beastsSlainByBeast:f(acc.npcByBeast),tholoBK:f(acc.tholoBK),lionBK:f(acc.lionBK),turns:f(acc.turns)};
  process.stderr.write(ev+'/'+mode+' '+JSON.stringify(out[ev+'/'+mode])+'\n')}
console.log(JSON.stringify(out,null,1));await b.close()})();
