/* classes.js — v1.0 balance pass, Play Now classes. All-CPU headless sims (simEvent) per printed event family with the 8 printed
   classes dealt at random to the seats (seeded per game) and every seat on the SAME mind (Fighter by default; ratings are the
   game's own class-leaning roll, int pinned by the mind). Per game it records, per seat: class, seat index, won, alive at the end,
   eliminated by (beast kind / gladiator / other), gladiator kills, beast kills, CF; and per game Tholo/lion kills of other beasts.
   Usage: node tools/balance100/classes.js flavius-arena.html [games per event=600] [events=all] [pages=2] [mind=fighter] > raw.json
   Seed base: SEED env (default 100000). Progress on stderr. */
const {chromium}=require('playwright');const path=require('path');
const SEATS={democritus:4,egidious:4,cassian:4,triumviratus:3,familia:4,ludus:4,goldenEagle:4,orpheus:4,juggernaut:4,gauntlet:1,commodus:4,naumachia:8,chariot:4};
(async()=>{const page=path.resolve(process.argv[2]);const N=+(process.argv[3]||600);const EVS=(!process.argv[4]||process.argv[4]==='all')?Object.keys(SEATS):process.argv[4].split(',');
const NP=+(process.argv[5]||2),MIND=process.argv[6]||'fighter',SEED=+(process.env.SEED||100000);
const b=await chromium.launch();const pages=[];
for(let i=0;i<NP;i++){const pg=await b.newPage();await pg.route(/fonts\./,r=>r.abort());
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(()=>{while(CUR_MODAL)CUR_MODAL.done(null);menuHide();
    window.BT={};
    const be=eliminate;eliminate=function(v,src){try{if(v&&v.alive&&src&&!BT.el[v.id]){const s=src||{};
        BT.el[v.id]=s.type==='npc'?('beast:'+((s.n&&s.n.t)||'?')):s.type==='player'?'glad':s.type==='retire'?'retire':('other:'+(s.type||'?'))}}catch(e){}return be.apply(this,arguments)};
    const bh=hurtNPC;hurtNPC=function(n,d,p,pre,w,by){const was=n&&n.alive;const r=bh.apply(this,arguments);
      try{if(was&&!n.alive&&!(p&&p.cls)&&by){BT.bk[by.t]=(BT.bk[by.t]||0)+1}}catch(e){}return r}});
  pages.push(pg)}
const out={meta:{N,mind:MIND,seed:SEED,date:new Date().toISOString(),events:EVS},games:[]};
for(const ev of EVS){const n=SEATS[ev];const t0=Date.now();let done=0,errs=0;const list=Array.from({length:N},(_,i)=>i);
  const per=Math.ceil(N/NP);
  const parts=await Promise.all(pages.map((pg,pi)=>(async()=>{const res=[];for(const i of list.slice(pi*per,(pi+1)*per)){
      const r=await pg.evaluate(async({ev,n,i,MIND,SEED})=>{
        let h=(SEED+i*2654435761+ev.length*97)>>>0;const R=()=>((h=(h*1103515245+12345)>>>0)/4294967296);
        let pool=[...BASE_CLS];if(EVENTS[ev].noVenatore)pool=pool.filter(c=>c!=='venatore');
        const cls=[];for(let k=0;k<n;k++)cls.push(pool[Math.floor(R()*pool.length)]); /* with replacement: every class in every seat */
        const E=EVENTS[ev];
        const seats=cls.map((c,j)=>({cls:c,cpu:true,diff:MIND,team:E.coop?'A':E.teams==='jugg'?(j===0?'J':'T'):E.teams?(j%2?'B':'A'):'P'+(j+1)}));
        BT.el={};BT.bk={};
        let res;try{res=await simEvent({ev,loc:EVENTS[ev].loc||6,seed:SEED+i*7919,seats,opts:{...CFG.opts,spect:0}},{timeoutMs:120000})}catch(e){return {err:String(e&&e.message||e)}}
        return {ev,i,turns:res.turns,rot:res.rotations,reason:res.reason,bk:BT.bk,npcKills:res.npcKills||0,
          s:res.rows.map((x,j)=>({c:x.cls,j,t:seats[j].team,w:x.won?1:0,a:x.alive?1:0,sv:x.survives?1:0,f:x.f,kp:x.kp,kn:x.kn,el:BT.el[x.id]||null,er:x.elimTurn}))}},{ev,n,i,MIND,SEED});
      if(r.err){errs++;process.stderr.write(ev+' err '+r.err+'\n')}else res.push(r);done++;
      if(done%50===0)process.stderr.write(`${ev} ${done}/${N} ${Math.round((Date.now()-t0)/1000)}s\n`)}return res})()));
  for(const p of parts)out.games.push(...p);
  process.stderr.write(`${ev} done ${N} games, ${errs} errors, ${Math.round((Date.now()-t0)/1000)}s\n`)}
console.log(JSON.stringify(out));await b.close()})();
