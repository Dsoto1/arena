/* tools/plans/gear100/aimprobe.js — the archer's Aim / armed stand: arm self-intersection (armClash), elbows (bowOk), bow uprightness,
   a 2400×300 strip of the 8 facings + a large close-up of two facings.
     node tools/plans/gear100/aimprobe.js flavius-arena.html out-dir [aim|stand] [spec JSON to try instead of the preset] [wL search 1] */
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');
const PAGE=process.argv[2],OUT=process.argv[3]||__dirname,PK=process.argv[4]||'aim',SPEC=process.argv[5]||'',SEARCH=process.argv[6]==='1';
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:950}});pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_tok93auto','1')});
await pg.goto('file://'+path.resolve(PAGE),{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
await pg.evaluate(async()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);await loadCustoms();const c=blankChar();c.id='g100';c.name='Miles';charFromClass(c,'soldier');c.classRef='cls:soldier';c.status='active';c.tok93={v:1,mode:'3d',pose:'{"p":[0,0,0],"j":{},"f":{}}',pk:'stand',parts:{},h:'old',sheet:'data:image/png;base64,iVBORw0KGgo=',meta:[60,100,30,90],at:'2026-10-01'};await Store.put('customChars',c.id,c);await loadCustoms();openStudio('chars')});
await pg.waitForFunction(()=>typeof T93!=='undefined'&&T93.api&&T93.api.fitTile,null,{timeout:900000,polling:500});
const R=await pg.evaluate(async([PK,SPEC,SEARCH])=>{const api=T93.api;const g={head:{t:'galea'},wR:{t:'bow',k:'bow'}};api.apply({gear:g});
  const bowOf=()=>{let x=null;api.B.group.traverse(o=>{if(o.userData&&o.userData.w4&&o.userData.w4.k==='bow')x=o});return x};
  const bowAx=()=>{const bw=bowOf();bw.updateWorldMatrix(true,false);const t=bw.geometry.userData.tips;const W=(p)=>bw.localToWorld(bw.position.clone().set(p[0],p[1],p[2]));
    const A=W(t[0]),C=W(t[1]),G=W([0,0,0]);const ax=A.clone().sub(C).normalize();const mid=A.clone().add(C).multiplyScalar(0.5);const bel=G.clone().sub(mid);
    return {tilt:Math.round(Math.acos(Math.abs(ax.y))*57.3),ax:ax.toArray().map(v=>+v.toFixed(2)),belly:bel.toArray().map(v=>+v.toFixed(2))}};
  const poseOf=(spec)=>spec?api._dbg.resolve(spec):PK==='stand'?api.standFor(g):api.presets.find(p=>p[0]===PK)[2];
  let spec=SPEC?JSON.parse(SPEC):null;let best=null;
  if(SEARCH&&spec){const P0=api._dbg.resolve(spec);for(let x=-60;x<=60;x+=10)for(let y=-180;y<=180;y+=15)for(let z=-40;z<=40;z+=20){const q=JSON.parse(P0);q.j.wL=[x,y,z];api.apply({pose:JSON.stringify(q)});const a=bowAx();
      const sc=a.tilt+Math.abs(x)*0.05+Math.abs(z)*0.05+(a.belly[2]>0?0:30);if(!best||sc<best.sc)best={sc,wL:[x,y,z],a}}spec.j.wL=best.wL}
  const pose=poseOf(spec);api.apply({pose});api.facings(64);const bow=bowAx();const el=api.elbows();const cl=api.clash();const bw=bowOf();const str=Object.assign({},bw.userData.string);
  const imgs=[];for(const yaw of [0,45,90,135,180,225,270,315])imgs.push(api.hero({yaw,w:300,h:300,el:20,span:2.6,cy:0.95}));
  const out=document.createElement('canvas');out.width=2400;out.height=300;const x=out.getContext('2d');x.fillStyle='#e8dfcc';x.fillRect(0,0,2400,300);imgs.forEach((c,i)=>x.drawImage(c,i*300,0,300,300));
  const cu=document.createElement('canvas');cu.width=1200;cu.height=600;const y=cu.getContext('2d');y.fillStyle='#e8dfcc';y.fillRect(0,0,1200,600);
  [90,315].forEach((yaw,i)=>y.drawImage(api.hero({yaw,w:600,h:600,el:15,span:1.15,cy:1.35}),i*600,0,600,600));
  return {best,bow,str,bowOk:el.bowOk,anatOk:el.anatOk,R:el.rows[0].R,L:el.rows[0].L,clash:cl,pose,png:out.toDataURL('image/png'),cu:cu.toDataURL('image/png')}},[PK,SPEC,SEARCH]);
console.log(JSON.stringify(Object.assign({},R,{png:undefined,cu:undefined})));
fs.writeFileSync(path.join(OUT,'aim_'+PK+'_8.png'),Buffer.from(R.png.split(',')[1],'base64'));fs.writeFileSync(path.join(OUT,'aim_'+PK+'_close.png'),Buffer.from(R.cu.split(',')[1],'base64'));
await b.close()})();
