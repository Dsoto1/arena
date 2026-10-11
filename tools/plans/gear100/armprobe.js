/* tools/plans/gear100/armprobe.js — v1.0 3D gear: one class's kit in a pose, 8 big facings + the elbows' bend in body space
     node tools/plans/gear100/armprobe.js flavius-arena.html [out-dir] [class] [pose|stand] */
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');
const PAGE=process.argv[2],OUT=process.argv[3]||__dirname,CLS=process.argv[4]||'venatore',PK=process.argv[5]||'stand';
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:950}});pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_tok93auto','1')});
await pg.goto('file://'+path.resolve(PAGE),{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
await pg.evaluate(async()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);await loadCustoms();const c=blankChar();c.id='g100';c.name='Miles';charFromClass(c,'soldier');c.classRef='cls:soldier';c.status='active';c.tok93={v:1,mode:'3d',pose:'{"p":[0,0,0],"j":{},"f":{}}',pk:'stand',parts:{},h:'old',sheet:'data:image/png;base64,iVBORw0KGgo=',meta:[60,100,30,90],at:'2026-10-01'};await Store.put('customChars',c.id,c);await loadCustoms();openStudio('chars')});
await pg.waitForFunction(()=>typeof T93!=='undefined'&&T93.api&&T93.api.fitTile,null,{timeout:900000,polling:500});
const R=await pg.evaluate(async([CLS,PK])=>{const api=T93.api;let P;if(CLS[0]==='{')P={gear:JSON.parse(CLS),look:{}};else{const c=blankChar();charFromClass(c,CLS);P=t93Parts(c)}const g=P.gear;
  api.apply({look:P.look,gear:g});api.apply({pose:PK==='stand'?api.standFor(g):api.presets.find(p=>p[0]===PK)[2]});
  const el=api.elbows?api.elbows():null;const fit=api.fitTile();
  const imgs=[];for(const yaw of [0,45,90,135,180,225,270,315])imgs.push(api.hero({yaw,w:300,h:300,el:20,span:2.6,cy:0.95}));
  const out=document.createElement('canvas');out.width=300*8;out.height=300;const x=out.getContext('2d');x.fillStyle='#e8dfcc';x.fillRect(0,0,2400,300);imgs.forEach((c,i)=>x.drawImage(c,i*300,0,300,300));
  return {g,el,fit,png:out.toDataURL('image/png')}},[CLS,PK]);
console.log(JSON.stringify({g:R.g,el:R.el,fit:R.fit}));
fs.writeFileSync(path.join(OUT,'probe_'+(CLS[0]==='{'?'gear':CLS)+'_'+PK+'.png'),Buffer.from(R.png.split(',')[1],'base64'));
await b.close()})();
