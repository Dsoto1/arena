/* tv105m (v1.05 B47): in every city no building overlaps the arena. The square's own placement data (city105Placed = the blocks
   the baked square draws, 376-v105city) is read for all LOCATIONS: no block's footprint touches the arena ellipse (independent dense check),
   none has its foot hidden by the wall, none stands in front of the rim; the forum's own pieces (B89) stay out of the arena too.
   The kill switch (flavius_v105cityoff=1) restores the old layout. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1280,height:800}});
await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const r=await pg.evaluate(()=>{const A=ARENA89;const inE=(r,c,m)=>{const u=c-r,v=c+r;return ((u-A.u0)/(A.a+m))**2+((v-A.v0)/(A.b+m))**2<=1};
  const bad=[];let cities=0,houses=0;
  for(let i=1;i<LOCATIONS.length;i++){const n=LOCATIONS[i].n;cities++;const list=city105Placed(n);
    for(const O of list){houses++;let hit=false;for(let r=O.r0-0.5;r<=O.r1+0.5+1e-9&&!hit;r+=0.125)for(let c=O.c0-0.5;c<=O.c1+0.5+1e-9;c+=0.125)if(inE(r,c,0.3)){hit=true;break}
      const why=city105Hit(O);if(hit||why)bad.push([n,O.r0,O.r1,O.c0,O.c1,hit?'footprint':why])}
    for(const B of B89){if(B.k==='temple'||B.t==='tree')continue;for(let r=B.r0;r<=B.r1;r++)for(let c=B.c0;c<=B.c1;c++)if(inE(r,c,0))bad.push([n,'B89',B.k,r,c])}}
  return {cities,houses,bad,locs:LOCATIONS.length-1}});
console.log(JSON.stringify({cities:r.cities,houses:r.houses,bad:r.bad.slice(0,6)}));
let ok=r.cities===r.locs&&r.cities>=12&&r.houses>500&&r.bad.length===0;
/* the switch: with it off at least one city keeps a block the fix would drop */
const pg2=await b.newPage();await pg2.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());await pg2.addInitScript(()=>{try{localStorage.setItem('flavius_v105cityoff','1')}catch(e){}});
await pg2.goto('file://'+process.argv[2]);await pg2.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const off=await pg2.evaluate(()=>{let n=0;for(let i=1;i<LOCATIONS.length;i++)for(const O of city105Placed(i))if(city105Hit(O))n++;return n});
console.log('switch-off blocks the fix would drop',off);if(!(off>0))ok=false;
console.log('ERRS',JSON.stringify(errs.slice(0,5)));if(errs.length)ok=false;
await b.close();process.exit(ok?0:1)})();
