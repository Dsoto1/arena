/* horsesim.js — v0.98 chariot horse tokens (258-v98horses): all-CPU Chariot Racing sims for candidate horse-token sets.
   A token = two printed horse faces (art + numbers of that face). The game deals tokens with its own seeded pickOne
   (racers + floor spares, with replacement), so every sim's deal comes from its seed.
   Per token (the token the racer STARTED with): races, wins, average place (1-4), horse losses (any token lost while
   racing), flips, race length (turns).
   Usage:
     node tools/horsesim.js flavius-arena.html screen [races=40]           every pairing of the 8 faces into 4 cross-horse tokens
     node tools/horsesim.js flavius-arena.html deep [races=300] SET;SET…   chosen sets, e.g. "vindexA+saxoB,palmatusA+ocianusB,…"
     node tools/horsesim.js flavius-arena.html pool [races=1200]           one pool of every cross-horse pair of the 9 printed faces (relative strength)
     node tools/horsesim.js flavius-arena.html orig [races=300]            the printed tokens (each horse with its own two faces)
   Env: PAGES=n parallel pages (default 2), FACE=0 → every token starts on its first face (default: dealt at random, as the game does). */
const {chromium}=require('playwright');
const FACES=['palmatusA','palmatusB','ocianusA','ocianusB','saxoA','saxoB','vindexA','vindexB'];
const FACES9=[...FACES,'saxoC'];
const STAT={palmatusA:[3,10],palmatusB:[2,12],ocianusA:[2,8],ocianusB:[2,10],saxoA:[1,8],saxoB:[1,12],vindexA:[3,8],vindexB:[3,12],saxoC:[1,10]};
const horse=f=>f.slice(0,-1);
/* every partition of the 8 faces into 4 pairs whose two faces are different horses; face order = faster first, then tougher */
function pairings(){const out=[];const rec=(left,acc)=>{if(!left.length){out.push(acc.slice());return}const a=left[0];
  for(let i=1;i<left.length;i++){const b=left[i];if(horse(a)===horse(b))continue;const rest=left.filter((_,j)=>j&&j!==i);
    const [x,y]=[a,b].sort((p,q)=>(STAT[q][0]-STAT[p][0])||(STAT[q][1]-STAT[p][1]));acc.push([x,y]);rec(rest,acc);acc.pop()}};rec(FACES,[]);return out}
const label=set=>set.map(t=>t.join('+')).join(',');
const parse=s=>s.split(',').map(t=>t.split('+'));
(async()=>{const page=process.argv[2],mode=process.argv[3]||'screen',RACES=+(process.argv[4]||(mode==='screen'?40:300));
  let sets;if(mode==='screen')sets=pairings();else if(mode==='pool'){sets=[[]];for(let i=0;i<FACES9.length;i++)for(let j=i+1;j<FACES9.length;j++)if(horse(FACES9[i])!==horse(FACES9[j]))sets[0].push([FACES9[i],FACES9[j]])}
  else if(mode==='orig')sets=[[['palmatusA','palmatusB'],['ocianusA','ocianusB'],['saxoA','saxoB'],['vindexA','vindexB']]];else sets=(process.argv[5]||'').split(';').filter(Boolean).map(parse);
  const NP=+(process.env.PAGES||2),FACE=process.env.FACE||'rand';
  const b=await chromium.launch();const pages=[];
  for(let i=0;i<NP;i++){const pg=await b.newPage();await pg.route(/fonts\./,r=>r.abort());
    await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
    await pg.goto('file://'+require('path').resolve(page));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
    await pg.evaluate(()=>{while(CUR_MODAL)CUR_MODAL.done(null);menuHide();
      window.HR=null;const tokOf=h=>h?HORSES.findIndex(H=>H.sides===h.sides):-1;window.HRtok=tokOf;
      const bs=chariotSetup;chariotSetup=function(){const r=bs.apply(this,arguments);try{HR={start:S.players.map(p=>tokOf(p.ch.horse)),lost:HORSES.map(()=>0),flips:HORSES.map(()=>0),end:null};
        if(window.HRFACE==='rand')for(const p of S.players){const h=p.ch.horse;if(h&&rand()<0.5){h.face=1;if(h.sides[1].n)h.name=h.sides[1].n}}}catch(e){}return r};
      const bstep=chStep;chStep=async function(p){const h=p&&p.ch&&p.ch.horse,f0=h?h.face:null;const r=await bstep.apply(this,arguments);try{if(HR&&h&&p.ch.horse===h&&h.face!==f0)HR.flips[tokOf(h)]++}catch(e){}return r};
      const bhit=chHitPart;chHitPart=function(p,part){const h=p&&p.ch&&p.ch.horse;const r=bhit.apply(this,arguments);try{if(HR&&part==='horse'&&h&&!p.ch.horse)HR.lost[tokOf(h)]++}catch(e){}return r};
      const bgo=gameOver;gameOver=async function(winners){try{if(HR&&S.sim&&isChariot()){const ws=new Set((winners||[]).map(w=>typeof w==='number'?w:w.id));
        const sc=p=>ws.has(p.id)?1e6:p.alive?(p.ch?p.ch.laps+chProg(p.ch.cr??p.r,p.ch.cc??p.c):0)*100:-(S.elimOrder||[]).length+((S.elimOrder||[]).findIndex(o=>o.id===p.id));
        const order=[...S.players].sort((a,c)=>sc(c)-sc(a));HR.end={place:S.players.map(p=>order.indexOf(p)+1),win:S.players.map(p=>ws.has(p.id)),turns:S.turnNo,laps:S.players.map(p=>p.ch?p.ch.laps:0)}}}catch(e){}return bgo.apply(this,arguments)}});
    pages.push(pg)}
  const results=[];
  for(const set of sets){const acc=set.map(()=>({races:0,wins:0,place:0,lost:0,flips:0,laps:0}));let turns=0,games=0,err=0;
    const idx=[...Array(RACES).keys()];const work=pages.map((pg,w)=>(async()=>{for(let i=w;i<RACES;i+=NP){
      const r=await pg.evaluate(async([set,i,FACE])=>{window.HRFACE=FACE;const ST={palmatusA:[3,10],palmatusB:[2,12],ocianusA:[2,8],ocianusB:[2,10],saxoA:[1,8],saxoB:[1,12],vindexA:[3,8],vindexB:[3,12],saxoC:[1,10]};
        const cap=s=>s[0].toUpperCase()+s.slice(1,-1);
        HORSES.splice(0,HORSES.length,...set.map(([a,b])=>({n:cap(a),sides:[{n:cap(a),mv:ST[a][0],hp:ST[a][1],art:a},{n:cap(b),mv:ST[b][0],hp:ST[b][1],art:b}]})));
        let h=(i+1)*2654435761>>>0;const R=()=>((h=(h*1103515245+12345)>>>0)/4294967296);
        const cls=[...BASE_CLS].sort((a,b)=>a<b?-1:1);for(let k=cls.length-1;k>0;k--){const j=Math.floor(R()*(k+1));[cls[k],cls[j]]=[cls[j],cls[k]]}
        const seats=cls.slice(0,4).map(c=>({cls:c,cpu:true,pers:rollPersonality(c),stats:rollStats(leanOf(c),70,R)}));HR=null;
        try{await simEvent({ev:'chariot',loc:6,seed:5000+i,seats,opts:{...CFG.opts,spect:0}},{timeoutMs:120000,maxTurns:900});return HR&&HR.end?HR:{err:'no end'}}catch(e){return {err:String(e&&e.message||e)}}},[set,i,FACE]);
      if(r.err||!r.end){err++;continue}games++;turns+=r.end.turns;
      r.start.forEach((t,k)=>{if(t<0)return;const a=acc[t];a.races++;a.wins+=r.end.win[k]?1:0;a.place+=r.end.place[k];a.laps+=r.end.laps[k]});
      r.lost.forEach((v,t)=>acc[t].lost+=v);r.flips.forEach((v,t)=>acc[t].flips+=v)}})());
    await Promise.all(work);
    const tok=acc.map((a,t)=>({tok:set[t].join('+'),mv:set[t].map(f=>STAT[f][0]).join('/'),hp:set[t].map(f=>STAT[f][1]).join('/'),races:a.races,win:a.races?+(a.wins/a.races*100).toFixed(1):0,place:a.races?+(a.place/a.races).toFixed(2):0,
      lostPerRace:a.races?+(a.lost/a.races).toFixed(2):0,flipsPerRace:a.races?+(a.flips/a.races).toFixed(2):0}));
    const wr=tok.map(t=>t.win),mx=Math.max(...wr),mn=Math.min(...wr);
    const row={set:label(set),games,err,turns:games?+(turns/games).toFixed(1):0,ratio:mn?+(mx/mn).toFixed(2):99,minWin:mn,maxWin:mx,tok};results.push(row);
    process.stderr.write(JSON.stringify({set:row.set,games,err,ratio:row.ratio,min:mn,max:mx,turns:row.turns,win:wr})+'\n')}
  console.log(JSON.stringify(results,null,1));await b.close()})();
