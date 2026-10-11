/* node tools/plans/mock100/banner_today.js — renders the TODAY samples of every banner/flag system from the built game
   into tools/plans/mock100/banner_today/ (PNG) + banner_today.json (data URIs), for banner.html's "Today" sheet. */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'../../..'),OUT=path.resolve(__dirname,'banner_today');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('http://localhost:8731/flavius-arena.html');await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000}).catch(()=>{});await pg.waitForTimeout(800);
const J=await pg.evaluate(async()=>{const o={};
  o.empire=['roma','capua','pompeii','syracusae','nemausus','leptis'].map(k=>({k,n:FLAGS[k].n,u:flagURIk(k)}));
  o.spqr=houseFlagURI(EMPIRE_FLAG);
  const mg=[{id:'m1',name:'Quintus',ludus:'Ludus Batiatus',city:'Capua'},{id:'m7',name:'Sica',ludus:'House of Sica',city:'Roma'},{id:'zz',name:'Ver',ludus:'Ludus Vergilius',city:'Pola'}];
  o.house=mg.map(m=>({n:m.ludus,u:houseFlagURI(mgrFlagOf(m)),chip:flagChip(m,22)}));
  o.fam=['Marcus Aurelius Varro','Gaius Cassius'].map(n=>({n,u:houseFlagURI(famFlagOf(n))}));
  o.sculpt=houseFlagURI({bg:'#1c3566',fg:'#e8e0cc',txt:'LVPA',shape:'none',layers:[{t:'circle',x:50,y:28,w:18,h:18,r:0,c:'#e2b64a',o:1},{t:'star',x:50,y:28,w:10,h:10,r:0,c:'#6e1414',o:1},{t:'line',x:50,y:44,w:60,h:3,r:0,c:'#e2b64a',o:1}],baked:[]});
  o.dr=ONLC.DRANKS98.map(R=>({k:R.k,n:R.n,u:dr98URI(R.k)}));
  o.rg=ONLC.REGIONS98.map(R=>({k:R.k,n:R.n,h:rg98Flag(R.k)}));
  o.crest=[{c1:'#7a2230',c2:'#d6ab4c',crest:'boar'},{c1:'#1d4a2a',c2:'#f0d66a',crest:'trident'}].map(L=>flagURI(L.c1,L.c2,'VAL',L.crest));
  o.lang=['it','fr','de','jp'].map(k=>{try{return flag91(k,36)}catch(e){return ''}});
  try{o.room=roomScene73('ludus')}catch(e){o.room=''}
  try{o.portrait=portraitHTML({...gladPortrait('g42','soldier'),bg:'flag:capua'},120)}catch(e){o.portrait=String(e)}
  /* canvas: the wall banners and drape of 192 (ar91Banner / ar91Drape), drawn by the game functions */
  const cv=document.createElement('canvas');cv.width=360;cv.height=200;const g=cv.getContext('2d');g.fillStyle='#4a3a2c';g.fillRect(0,0,360,200);
  g.fillStyle='#6b5640';for(let y=0;y<200;y+=20)g.fillRect(0,y,360,1);
  const TW0=window.TW;ar91Img(ar91Asset('fr_icon.png'));await new Promise(r=>setTimeout(r,500));
  ar91Banner(g,60,20,44,150,'XII');ar91Banner(g,140,20,44,150,'S');ar91Drape(g,230,20,50,160);ar91Banner(g,310,20,44,150,'IV');o.wall=cv.toDataURL();
  /* fan flag replica (27 drawFanFlags: the house flag image on a stick, 0.4×0.24 TW) */
  const f=mgrFlagOf(mg[0]);const im=new Image();im.src=houseFlagURI(f);await new Promise(r=>im.onload=r);
  const c2=document.createElement('canvas');c2.width=120;c2.height=120;const h=c2.getContext('2d');const T=110;h.fillStyle='#2a2018';h.fillRect(0,0,120,120);h.translate(30,60);h.strokeStyle='#5a4a34';h.lineWidth=3.3;h.beginPath();h.moveTo(0,T*.34);h.lineTo(0,-T*.26);h.stroke();h.drawImage(im,0,-T*.26,T*.4,T*.24);o.fan=c2.toDataURL();
  return o});
fs.writeFileSync(path.resolve(__dirname,'banner_today_data.js'),'window.BT='+JSON.stringify(J)+';');
/* the tapestries in a live arena (192 ar91DecoPaint) */
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  try{SPEED=0}catch(e){}startEvent({ev:'democritus',loc:0,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true}))});});
await pg.waitForTimeout(4000);await pg.evaluate(async()=>{for(let i=0;i<20&&CUR_MODAL;i++){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await new Promise(r=>setTimeout(r,150))}try{draw()}catch(e){}});
await pg.waitForTimeout(800);const box=await pg.evaluate(()=>{const r=document.getElementById('cv').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}});
await pg.screenshot({path:path.join(OUT,'arena.png'),clip:{x:box.x,y:box.y,width:box.width,height:Math.min(box.height,box.height*0.45)}});
await b.close();console.log('ok',Object.keys(J).join(','))})();
