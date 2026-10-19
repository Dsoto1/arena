/* tv107c — v1.07 beta-1 note 1 (402-v107city): 1 the City Square's gladiators, guards and yard pair are the 3D figures (city107 sheets:
   a canvas per figure, walk frames while they glide, facings follow the step), the beasts led to the pens are kinds with a 3D figure (the
   menu show's strips); 2 with the city107 sheets blocked: the still107 frame, never the old figure; 3 the city's draw cost is no heavier
   than the kill switch (313 / 320); 4 the main menu: the flat show (282's kill switch) and 282's per-figure fallback draw the 3D strips via
   mmFig — never the old token picture; 5 kill switch flavius_v107cityoff=1 = no 402 drawing; no errors. Served over http. */
const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');
(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n);else console.log('ok',n.slice(0,200))};
const open=async(ls,block)=>{const cx=await b.newContext({viewport:{width:1440,height:900}});await cx.route(/fonts\./,r=>r.abort());if(block)await cx.route(block,r=>r.abort());
  await cx.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in ls)localStorage.setItem(k,ls[k])},ls||{});
  const pg=await cx.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await pg.goto(URL0,{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});return {pg,cx}};
const city=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}window.travelOK=()=>true;window.travelBlock=()=>false;try{menuHide()}catch(e){}
  newWorld({type:'pre',key:MGR_PRE[0].key});openCitySquare(W_().night.loc,{prematch:true});for(let i=0;i<200&&!(CITY.open&&CITY.npcs&&CITY.npcs.length&&!CITY.warm100);i++)await W8(100);await W8(1500);return CITY.open});
/* the picture each figure gets, by kind */
const kinds=pg=>pg.evaluate(()=>{const o={};for(const n of CITY.npcs){const k='fg'+(n.g?n.g.id:n.id);const im=cityImg(k,'');const t=im instanceof HTMLCanvasElement?'canvas':im?'img':'none';(o[n.kind]=o[n.kind]||{})[t]=((o[n.kind]||{})[t]||0)+1}
  o.yard=['ydhero','ydsoldier'].map(k=>cityImg(k,'') instanceof HTMLCanvasElement);return o});

/* ---------------- 1 + 3: the square ---------------- */
const A=await open({});ok(await city(A.pg),'1 the square opens');
const s0=await A.pg.evaluate(()=>Object.assign({},V107C.st));
await A.pg.waitForTimeout(3000);
const K1=await kinds(A.pg);const s1=await A.pg.evaluate(()=>Object.assign({},V107C.st));
ok(K1.glad&&!K1.glad.img&&!K1.glad.none&&K1.glad.canvas>0,'1 every gladiator is a 3D canvas '+JSON.stringify(K1.glad));
ok(K1.soldier&&!K1.soldier.img&&!K1.soldier.none,'1 the guards too '+JSON.stringify(K1.soldier));ok(K1.yard.every(Boolean),'1 the yard pair too');
ok(s1.glad>s0.glad&&s1.yard>s0.yard,'1 they draw from the city107 sheets '+JSON.stringify(s1));
const W1=await A.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const n=CITY.npcs.find(x=>x.kind==='glad'&&!x.static);if(!n)return null;
  /* a step to the east: it faces that way and walks */
  n._dr=n.r;n._dc=n.c;n.path=[];const r=n.r,c=n.c;const free=[[0,1],[1,0],[0,-1],[-1,0]].find(([a,d])=>!cityBlocked(r+a,c+d));if(!free)return null;n.r+=free[0];n.c+=free[1];
  await W8(60);const f=c107Face(n);return {fi:f.fi,moving:f.moving,want:(()=>{const a=Math.atan2(free[1]-free[0],free[1]+free[0])*180/Math.PI;return MINI_YAW.findIndex(y=>Math.abs(((a-y)%360+540)%360-180)<1)})()}});
ok(W1&&W1.moving&&W1.fi===W1.want,'1 a walker faces its step '+JSON.stringify(W1));
/* the beasts led to the pens: only kinds with a 3D figure, drawn from the strips */
const B1=await A.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const seen=new Set();const b0=V107C.st.beast;
  for(let i=0;i<6;i++){CITY.beastT=0;await W8(250);for(const n of CITY.npcs)if(n.kind==='beast')seen.add(n.bk107)}await W8(800);
  return {kinds:[...seen],drawn:V107C.st.beast-b0}});
ok(B1.kinds.length>0&&B1.kinds.every(k=>['lion','bear','wolf','viper'].includes(k))&&B1.drawn>0,'1 the beasts to the pens are 3D kinds '+JSON.stringify(B1));
/* 3 cost: time inside cityDraw per real frame, 402 on vs off (313/320) */
const P=await A.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const on=[],off=[];let cur=null;const b0=cityDraw;cityDraw=function(){const t=performance.now();const r=b0.apply(this,arguments);if(cur)cur.push(performance.now()-t);return r};
  for(let k=0;k<3;k++){V107C.on=true;await W8(300);cur=on;await W8(1500);cur=null;V107C.on=false;await W8(300);cur=off;await W8(1500);cur=null}V107C.on=true;cityDraw=b0;
  const md=a=>{const s=a.slice().sort((x,y)=>x-y);return s[s.length>>1]||0};return {on:md(on),off:md(off),n:on.length}});
console.log('PERF city draw ms (median a frame) 402 on',P.on.toFixed(2),'off',P.off.toFixed(2));
ok(P.n>30&&P.on<=P.off*1.3+0.5,`3 the square's draw is no heavier (${P.on.toFixed(2)} vs ${P.off.toFixed(2)} ms)`);
if(process.env.SHOT)await A.pg.screenshot({path:path.join(process.env.SHOT,'tv107c_city.png')});
await A.cx.close();

/* ---------------- 2: city107 blocked → the still frame ---------------- */
const B=await open({},/city107_/);ok(await city(B.pg),'2 the square opens (sheets blocked)');await B.pg.waitForTimeout(1500);
const K2=await kinds(B.pg);const s2=await B.pg.evaluate(()=>Object.assign({},V107C.st));
ok(K2.glad&&!K2.glad.img&&K2.glad.canvas>0&&s2.still>0&&s2.glad===0,'2 the still107 frame stands in '+JSON.stringify({g:K2.glad,st:s2}));
await B.cx.close();

/* ---------------- 4: the menu ---------------- */
const M=await open({flavius_mm100off:'1'});
const m4=await M.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));await W8(5000);const a={menu:V107C.st.menu,tok:V107C.st.menuTok,mm100:MM100S.on};
  /* jump the flat show's clock to Commodus raising his sword (08 mmShow2, 22 s) */
  MM.t0=performance.now()-23000;const c0=V107C.st.menu;await W8(1500);return Object.assign(a,{com:V107C.st.menu-c0,tok2:V107C.st.menuTok,frames:MM107F.size})});
ok(m4.menu>20&&m4.tok===0&&!m4.mm100,'4 the flat show draws the 3D strips, no token picture '+JSON.stringify(m4));
ok(m4.com>0&&m4.tok2===0&&m4.frames>0,'4 Commodus too (his strip in the token frame) '+JSON.stringify(m4));
if(process.env.SHOT)await M.pg.screenshot({path:path.join(process.env.SHOT,'tv107c_menuflat.png')});
const m5=await M.pg.evaluate(()=>{const cv=document.createElement('canvas');cv.width=200;cv.height=200;const c2=cv.getContext('2d');const n0=V107C.st.menu+V107C.st.menuWait;
  for(const k of ['hero','lion','bear','tholo','commodus','zora','wolf','snake'])mmFig(c2,k,100,180,150,0,1,1);return V107C.st.menu+V107C.st.menuWait-n0});
ok(m5===8,'4 mmFig: every class / beast key is handled by 402 ('+m5+'/8)');
await M.cx.close();

/* ---------------- 5: kill switch ---------------- */
const O=await open({flavius_v107cityoff:'1'});ok(await city(O.pg),'5 the square opens (402 off)');await O.pg.waitForTimeout(1500);
const s5=await O.pg.evaluate(()=>({on:V107C.on,st:V107C.st}));ok(!s5.on&&s5.st.glad===0&&s5.st.still===0&&s5.st.yard===0,'5 kill switch: 402 draws nothing '+JSON.stringify(s5));
await O.cx.close();

const bad=errs.filter(e=>!/Failed to load resource|net::ERR/.test(e));
console.log('MISSING',JSON.stringify(miss));console.log('ERRS',JSON.stringify(bad.slice(0,6)));await b.close();srv.close();process.exit(miss.length||bad.length?1:0)})();
