/* tools/plans/gear100/fitscan.js — v1.0 3D GEAR best fit (his 4a): prints, for every printed class kit × every preset pose, the scale the
   board sheet must shrink the figure by so nothing leaves its tile in any of the 8 facings (1 = fits as is).
     node tools/plans/gear100/fitscan.js flavius-arena.html */
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:950}});pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_tok93auto','1')});
await pg.goto('file://'+require('path').resolve(process.argv[2]),{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
await pg.evaluate(async()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);await loadCustoms();const c=blankChar();c.id='g100';c.name='Miles';charFromClass(c,'soldier');c.classRef='cls:soldier';c.status='active';c.tok93={v:1,mode:'3d',pose:'{"p":[0,0,0],"j":{},"f":{}}',pk:'stand',parts:{},h:'old',sheet:'data:image/png;base64,iVBORw0KGgo=',meta:[60,100,30,90],at:'2026-10-01'};await Store.put('customChars',c.id,c);await loadCustoms();openStudio('chars')});
await pg.waitForFunction(()=>typeof T93!=='undefined'&&T93.api&&T93.api.fitTile,null,{timeout:900000,polling:500});
const R=await pg.evaluate(async()=>{const api=T93.api;const kits=[];
  for(const k of ['soldier','royalty','hero','slave','veteranus','amazonia','venatore','damnatio']){const c=blankChar();charFromClass(c,k);c.classRef='cls:'+k;kits.push([k,t93Parts(c).gear,t93Parts(c).look])}
  const rows=[];for(const [k,g,look] of kits){api.apply({look:look||{},gear:g});const stand=api.standFor(g);const row={k,w:[g.wR&&g.wR.k,g.wL&&g.wL.k].join('/')};
    for(const [pk,,pj] of api.presets){api.apply({pose:pk==='stand'?stand:pj});const f=api.fitTile();row[pk]=f.f}rows.push(row);await new Promise(r=>setTimeout(r,0))}
  return {rows,presets:api.presets.map(p=>p[0])}});
console.log(JSON.stringify(R.presets));for(const r of R.rows)console.log(JSON.stringify(r));await b.close()})();
