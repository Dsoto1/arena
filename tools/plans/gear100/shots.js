/* tools/plans/gear100/shots.js — v1.0 3D GEAR integration shots: the 8 printed classes as Studio characters, converted by the game's own
   auto-convert (pre-baked body + gear, armed stand, best fit), then
     classes_facings.png  every class × the 8 facings, each cell over its board tile (red diamond = the tile, gold ring = the 0.8 base)
     board_a.png / board_b.png  four classes each on the board (Democritus, zoomed)
   node tools/plans/gear100/shots.js flavius-arena.html [out-dir] */
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');
const OUT=process.argv[3]||path.join(__dirname);const CLS=['soldier','royalty','hero','slave','veteranus','amazonia','venatore','damnatio'];
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:950}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_tok93auto','1')});
await pg.goto('file://'+path.resolve(process.argv[2]),{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
await pg.evaluate(async(CLS)=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);await loadCustoms();
  for(const k of CLS){const c=blankChar();c.id='g_'+k;c.name=k[0].toUpperCase()+k.slice(1)+' Tok';charFromClass(c,k);c.classRef='cls:'+k;c.status='active';c.created='2026-10-11';await Store.put('customChars',c.id,c)}
  await loadCustoms();openStudio('chars')},CLS);
const t0=Date.now();
await pg.waitForFunction((CLS)=>CLS.every(k=>{const c=CUSTOM.chars.find(x=>x.id==='g_'+k);return c&&c.tok93&&c.tok93.v===2&&c.tok93.sheet&&c.tok93.sheet.length>2000}),CLS,{timeout:3000000,polling:2000});
console.log('converted 8 in',Math.round((Date.now()-t0)/1000),'s');
/* the facings sheet: each class row = its sheet, every cell over its tile */
const png=await pg.evaluate(async(CLS)=>{const rows=[];for(const k of CLS){const t=CUSTOM.chars.find(x=>x.id==='g_'+k).tok93;const im=new Image();im.src=t.sheet;await im.decode();rows.push([k,im,t.meta])}
  const S=1.5,TWpx=25.4/MINI_BASE*MINI_PXMM,CW=Math.ceil(TWpx*1.25),cellH=Math.max(...rows.map(r=>r[2][1]));const W=120+8*CW*S,H=30+rows.length*(cellH+20)*S;
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');x.fillStyle='#e8dfcc';x.fillRect(0,0,W,H);x.font='bold 15px serif';x.fillStyle='#3a2a1c';
  x.fillText('v1.0 3D gear — the 8 printed classes, armed stand, 8 facings, each over its tile (red = tile, gold = 0.8 base)',10,20);
  rows.forEach(([k,im,m],r)=>{const y0=30+r*(cellH+20)*S;x.fillStyle='#3a2a1c';x.fillText(k,10,y0+cellH*S*0.6);
    for(let i=0;i<8;i++){const cx=120+(i+0.5)*CW*S,ay=y0+(m[3]+6)*S;
      x.save();x.strokeStyle='#c0392b';x.lineWidth=1.5;x.beginPath();x.moveTo(cx-TWpx/2*S,ay);x.lineTo(cx,ay-TWpx/4*S);x.lineTo(cx+TWpx/2*S,ay);x.lineTo(cx,ay+TWpx/4*S);x.closePath();x.fillStyle='rgba(205,180,130,.55)';x.fill();x.stroke();
      x.strokeStyle='#b8902c';x.beginPath();x.ellipse(cx,ay,TWpx*0.4*S,TWpx*0.2*S,0,0,Math.PI*2);x.stroke();x.restore();
      x.drawImage(im,i*m[0],0,m[0],m[1],cx-m[2]*S,ay-m[3]*S,m[0]*S,m[1]*S);
      x.save();x.strokeStyle='rgba(192,57,43,.6)';x.setLineDash([3,3]);x.beginPath();x.moveTo(cx-TWpx/2*S,ay-m[3]*S);x.lineTo(cx-TWpx/2*S,ay);x.moveTo(cx+TWpx/2*S,ay-m[3]*S);x.lineTo(cx+TWpx/2*S,ay);x.stroke();x.restore()}});
  return cv.toDataURL('image/png')},CLS);
fs.writeFileSync(path.join(OUT,'classes_facings.png'),Buffer.from(png.split(',')[1],'base64'));
const meta=await pg.evaluate((CLS)=>CLS.map(k=>{const t=CUSTOM.chars.find(x=>x.id==='g_'+k).tok93;return [k,t.meta,t.pk,(t.sheet||'').length]}),CLS);console.log(JSON.stringify(meta));
/* on the board: two events, four classes each, zoomed in */
for(const [nm,ks] of [['a',CLS.slice(0,4)],['b',CLS.slice(4)]]){
  await pg.evaluate(async(ks)=>{for(let i=0;i<8&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,200))}try{closeStudio()}catch(e){}menuHide();
    startEvent({ev:'democritus',loc:6,seats:ks.map((k,i)=>({cls:'cc_g_'+k,cpu:true})),opts:{spect:0}})},ks);
  await pg.waitForFunction(()=>typeof S!=='undefined'&&S&&S.players&&S.players.length===4,null,{timeout:60000});await pg.waitForTimeout(2500);
  await pg.evaluate(async()=>{try{SPEED=0}catch(e){}for(let i=0;i<12&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,300))}
    /* gather the four in the middle, two tiles apart, so they read at once */
    const busy=(r,c)=>(S.pillars||[]).some(q=>Math.abs(q.r-r)<=1&&Math.abs(q.c-c)<=1)||(S.npcs||[]).some(n=>n.r===r&&n.c===c);const at=[];for(let d=0;d<7&&at.length<4;d++)for(let r=6-d;r<=6+d;r++)for(let c=6-d;c<=6+d;c++){if(at.length<4&&r>=0&&c>=0&&r<13&&c<13&&!busy(r,c)&&at.every(t=>Math.abs(t[0]-r)+Math.abs(t[1]-c)>=3))at.push([r,c])}S.players.forEach((p,i)=>{p.r=at[i][0];p.c=at[i][1]});try{CAM.z=2.2;S.zoomIn=2.2}catch(e){}
    for(const p of S.players){const t=tokenForP(p);for(let i=0;i<40&&!(t.t93&&t93Img(t.t93));i++)await new Promise(r=>setTimeout(r,100))}draw()});
  await pg.waitForTimeout(1200);await pg.evaluate(()=>draw());
  const cv=await pg.$('#cv');await cv.screenshot({path:path.join(OUT,'board_'+nm+'.png')});
  await pg.evaluate(async()=>{try{S.over=true}catch(e){}for(let i=0;i<8&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,200))}});
}
console.log('ERRS',JSON.stringify(errs.slice(0,5)));await b.close()})();
