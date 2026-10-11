/* tools/plans/gear100/lunge.js — v1.0 3D gear (his 2b): every printed class in the Thrust and Lunge presets, the board sheet's own fit
   (long shafts raised toward the diagonal / shortened, display only), 8 facings each, over its tile → lunge_sheet.png
     node tools/plans/gear100/lunge.js flavius-arena.html [out-dir] */
const {chromium}=require('playwright');const path=require('path'),fs=require('fs');const OUT=process.argv[3]||__dirname;
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:950}});pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_tok93auto','1')});
await pg.goto('file://'+path.resolve(process.argv[2]),{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
await pg.evaluate(async()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);await loadCustoms();const c=blankChar();c.id='g100';c.name='Miles';charFromClass(c,'soldier');c.classRef='cls:soldier';c.status='active';c.tok93={v:1,mode:'3d',pose:'{"p":[0,0,0],"j":{},"f":{}}',pk:'stand',parts:{},h:'old',sheet:'data:image/png;base64,iVBORw0KGgo=',meta:[60,100,30,90],at:'2026-10-01'};await Store.put('customChars',c.id,c);await loadCustoms();openStudio('chars')});
await pg.waitForFunction(()=>typeof T93!=='undefined'&&T93.api&&T93.api.fitTile,null,{timeout:900000,polling:500});
const R=await pg.evaluate(async()=>{const api=T93.api;const rows=[];
  for(const k of ['soldier','royalty','hero','slave','veteranus','amazonia','venatore','damnatio'])for(const pk of ['thrust','lunge']){const c=blankChar();charFromClass(c,k);const P=t93Parts(c);
    api.apply({look:P.look,gear:P.gear});api.apply({pose:api.presets.find(p=>p[0]===pk)[2]});const f=api.fitTile();const s=await api.sheetAsync();const im=new Image();im.src=s.canvas.toDataURL('image/png');await im.decode();rows.push([k+' · '+pk,im,s.meta,f])}
  const S=1.5,TWpx=25.4/MINI_BASE*MINI_PXMM,CW=Math.ceil(TWpx*1.25),cellH=Math.max(...rows.map(r=>r[2][1]));const W=230+8*CW*S,H=30+rows.length*(cellH+10)*S;
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');x.fillStyle='#e8dfcc';x.fillRect(0,0,W,H);x.font='bold 14px serif';x.fillStyle='#3a2a1c';
  x.fillText('v1.0 3D gear (his 2b) — Thrust + Lunge, every class, 8 facings over the tile; size kept ≥70% (long shafts raised / shortened)',10,20);
  rows.forEach(([k,im,m,f],r)=>{const y0=30+r*(cellH+10)*S;x.fillStyle='#3a2a1c';x.font='bold 13px serif';x.fillText(k,10,y0+cellH*S*0.5);x.font='12px serif';
    x.fillText('size '+Math.round(f.f*100)+'%'+(f.shaft?' · shaft '+f.shaft.a+'°'+(f.shaft.k<1?' ×'+f.shaft.k:''):''),10,y0+cellH*S*0.5+16);
    for(let i=0;i<8;i++){const cx=230+(i+0.5)*CW*S,ay=y0+(m[3]+4)*S;x.save();x.strokeStyle='#c0392b';x.lineWidth=1.2;x.beginPath();x.moveTo(cx-TWpx/2*S,ay);x.lineTo(cx,ay-TWpx/4*S);x.lineTo(cx+TWpx/2*S,ay);x.lineTo(cx,ay+TWpx/4*S);x.closePath();x.fillStyle='rgba(205,180,130,.55)';x.fill();x.stroke();x.restore();
      x.drawImage(im,i*m[0],0,m[0],m[1],cx-m[2]*S,ay-m[3]*S,m[0]*S,m[1]*S)}});
  return {png:cv.toDataURL('image/png'),fits:rows.map(r=>[r[0],r[3].f,r[3].shaft])}});
console.log(JSON.stringify(R.fits));fs.writeFileSync(path.join(OUT,'lunge_sheet.png'),Buffer.from(R.png.split(',')[1],'base64'));await b.close()})();
