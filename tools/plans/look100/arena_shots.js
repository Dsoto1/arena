/* arena_shots.js — AFTER shots for the arena look test: 3 railings, 3 stones × 3 arenas, zoomed out/in, phone; draw costs → arena_costs.json */
const L=require('./arena_lib');const fs=require('fs');const D=__dirname+'/';const SRC=fs.readFileSync(D+'arena_proto.js','utf8');
const CITIES={roma:6,capua:4,leptis:9};const STONES=['trav','sand','marble'];const RAILS=['bronze','balus','parapet'];
/* pieces on the near edge rows (display only: positions moved for the picture) */
async function edgePieces(pg){await pg.evaluate(()=>{const n=N-1;const al=S.players.filter(p=>p.alive!==false&&p.r!=null);
  const spots=[[n,5],[8,n],[n,n],[n,9]];al.slice(0,4).forEach((p,i)=>{p.r=spots[i][0];p.c=spots[i][1]});S.cur=S.players.indexOf(al[2]);draw()})}
async function set(pg,o){await pg.evaluate(o=>PR100.set(o),o);await pg.waitForTimeout(150);await pg.evaluate(()=>{draw()})}
(async()=>{const {b,pg,errs}=await L.open();const costs={};
  for(const [city,loc] of Object.entries(CITIES)){
    if(city!=='roma')await pg.evaluate(()=>{S.over=true});
    await L.startAt(pg,loc,4);await pg.evaluate(SRC);await edgePieces(pg);await L.zoom(pg,1);
    await set(pg,{rail:null,stone:null});await L.canvasShot(pg,D+`arena_before_${city}.png`);
    costs[city+'|before']=await pg.evaluate(()=>PR100.cost());
    if(city==='roma'){await L.zoom(pg,1.9);await L.canvasShot(pg,D+'arena_before_edge_in.png');await L.zoom(pg,1);
      for(const r of RAILS){await set(pg,{rail:r,stone:null});await L.canvasShot(pg,D+`arena_rail_${r}.png`);costs['rail|'+r]=await pg.evaluate(()=>PR100.cost());
        await L.zoom(pg,1.9);await L.canvasShot(pg,D+`arena_rail_${r}_in.png`);await L.zoom(pg,1)}}
    for(const s of STONES){await set(pg,{rail:null,stone:s});await L.canvasShot(pg,D+`arena_stone_${s}_${city}.png`);costs[city+'|'+s]=await pg.evaluate(()=>PR100.cost());
      if(city==='roma'){await L.zoom(pg,1.9);await L.canvasShot(pg,D+`arena_stone_${s}_${city}_in.png`);await L.zoom(pg,1)}}
    /* the full set: each stone with its matching rail */
    if(city==='roma')for(const [s,r] of [['trav','bronze'],['sand','balus'],['marble','parapet']]){await set(pg,{rail:r,stone:s});await L.canvasShot(pg,D+`arena_combo_${s}_${r}.png`);costs['combo|'+s+'+'+r]=await pg.evaluate(()=>PR100.cost())}
  }
  /* phone 390 landscape */
  const ph=await L.open({browser:b,phone:true});await L.startAt(ph.pg,6,4);await ph.pg.evaluate(SRC);await edgePieces(ph.pg);
  await set(ph.pg,{rail:null,stone:null});await ph.pg.screenshot({path:D+'arena_before_phone_edge.png'});
  for(const [s,r] of [['trav','bronze'],['sand','balus'],['marble','parapet']]){await set(ph.pg,{rail:r,stone:s});await ph.pg.screenshot({path:D+`arena_phone_${s}_${r}.png`});costs['phone|'+s+'+'+r]=await ph.pg.evaluate(()=>PR100.cost(6))}
  costs.phoneBefore=await ph.pg.evaluate(()=>{PR100.set({rail:null,stone:null});return PR100.cost(6)});
  fs.writeFileSync(D+'arena_costs.json',JSON.stringify(costs,null,1));console.log(JSON.stringify(costs));
  console.log('ERRS',errs.concat(ph.errs).slice(0,5));await b.close()})();
