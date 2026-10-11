/* tools/plans/gear100/bowprobe.js — the bow in the armed stand: tips, grip, draw hand (world) + a hero shot per facing.
     node tools/plans/gear100/bowprobe.js flavius-arena.html [out-dir] */
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:950}});pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_tok93auto','1')});
await pg.goto('file://'+path.resolve(process.argv[2]),{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
await pg.evaluate(async()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);await loadCustoms();const c=blankChar();c.id='g100';c.name='Miles';charFromClass(c,'soldier');c.classRef='cls:soldier';c.status='active';c.tok93={v:1,mode:'3d',pose:'{"p":[0,0,0],"j":{},"f":{}}',pk:'stand',parts:{},h:'old',sheet:'data:image/png;base64,iVBORw0KGgo=',meta:[60,100,30,90],at:'2026-10-01'};await Store.put('customChars',c.id,c);await loadCustoms();openStudio('chars')});
await pg.waitForFunction(()=>typeof T93!=='undefined'&&T93.api&&T93.api.fitTile,null,{timeout:900000,polling:500});
const R=await pg.evaluate(async()=>{const api=T93.api;const g={head:{t:'galea'},wR:{t:'bow',k:'bow'}};api.apply({gear:g,pose:api.standFor(g)});api.facings(64);
  let bow=null;api.B.group.traverse(o=>{if(o.userData&&o.userData.w4&&o.userData.w4.k==='bow')bow=o});const T=window.TOK93THREE||null;
  const tips=bow.geometry.userData.tips;const w=(p)=>{const v=bow.position.clone().set(p[0],p[1],p[2]);bow.localToWorld(v);return [v.x,v.y,v.z].map(x=>+x.toFixed(3))};
  const hand=api.B.rig.bones.wR.getWorldPosition(bow.position.clone());const lh=api.B.rig.bones.wL.getWorldPosition(bow.position.clone());
  const s=await api.sheetAsync();return {A:w(tips[0]),C:w(tips[1]),G:w([0,0,0]),X:w([0.3,0,0]),hand:[hand.x,hand.y,hand.z].map(x=>+x.toFixed(3)),lhand:[lh.x,lh.y,lh.z].map(x=>+x.toFixed(3)),str:bow.userData.string,sheet:s.canvas.toDataURL('image/png')}});
console.log(JSON.stringify(Object.assign({},R,{sheet:R.sheet.length})));
if(process.argv[3])require('fs').writeFileSync(path.join(process.argv[3],'bow_sheet.png'),Buffer.from(R.sheet.split(',')[1],'base64'));
await b.close()})();
