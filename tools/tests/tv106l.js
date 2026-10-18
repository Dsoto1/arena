/* v1.06a LIGHT + SHADOWS (399-v106light; tools/plans/v106/NOTES.md, his ok on the mock-up 2026-10-18). Checks:
   (1) Settings → Board & pieces → Lighting Full / Light / Off: defaults Full on desktop, Light on a phone; the buttons set SETTINGS.light106;
   (2) Off = no shadow draw calls at all (no 399 canvas / anim106 sheet drawn, the pass never runs) and the old discs are back;
   (3) Light = contact shadows only (no cast in the static layer, no figure shadows); (4) Full = cast shadows too (pillars + figures + beasts);
   (5) the static layer is CACHED: no rebuild across idle frames, one rebuild after a pillar topples (S.pillars / S.rubble like 05 doTopple);
   (6) the shadow under each figure follows the pose it is drawn in THIS frame (an attack: 311's AN100.keys = 399's L106.last.figs key, frame by frame);
   (7) Full drops to Light by itself under a slow frame meter (288 F100 frames > 16 ms, sustained), one toast; not under fast frames; Full again clears it;
   (8) highlight contrast (a move tile in a pillar's shadow) within 0.01 of Off (mean + min); (9) kill switch flavius_light106off=1 = Off, no Settings row.
   node tools/tests/tv106l.js <ABSOLUTE page path> → ERRS [] and exit 0. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n);console.log((c?'ok   ':'FAIL ')+n.slice(0,300))};
const open=async(ls,view)=>{const c=await b.newContext(view||{viewport:{width:1440,height:900}});await c.route(/fonts\./,r=>r.abort());const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');for(const k in o)localStorage.setItem(k,o[k])},ls||{});
  await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
  await pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}try{menuHide()}catch(e){}});return pg};
/* a paused match on Pompeii (12 pillars): the 4 gladiators + a bear and a wolf next to them; spy = counts 399's draws per draw() */
const start=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.briefing=false;SETTINGS.calm=false;try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}
  startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  await W8(1200);SPEED='snap';for(let i=0;i<160&&!(humanTurn()&&(S.phase==='action'||S.phase==='choice')&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  if(S.phase==='choice'){await takeChoice(cur(),'coin');await W8(200)}while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}SPEED='normal';
  const pl=[[6,5],[5,6],[7,7],[6,8]];S.players.forEach((p,i)=>{p.r=pl[i][0];p.c=pl[i][1];p._fr=null});
  S.npcs=[mkNPC('bear','Ursa',5,8),mkNPC('wolf','Valencia',8,5)].filter(Boolean);S.npcs.forEach(n=>{n._fr=null});
  window.SPY106=()=>{const P=CanvasRenderingContext2D.prototype,oD=P.drawImage,oF=P.fill,own=Object.prototype.hasOwnProperty.call(ctx,'drawImage'),iD=ctx.drawImage;const o={l106:0,sheet:0,disc:0};
    const tap=im=>{if(im&&(im._l106||(im.src&&/anim106/.test(im.src))))o[im._l106?'l106':'sheet']++};
    P.drawImage=function(im){tap(im);return oD.apply(this,arguments)};ctx.drawImage=function(im){if(own)tap(im);return iD.apply(this,arguments)};
    P.fill=function(){if(String(this.fillStyle).replace(/ /g,'')==='rgba(0,0,0,0.32)')o.disc++;return oF.apply(this,arguments)};
    const n0=L106.st.n;try{draw()}finally{P.drawImage=oD;P.fill=oF;if(own)ctx.drawImage=iD;else delete ctx.drawImage}o.pass=L106.st.n-n0;o.last=L106.last;o.mode=l106Mode();return o};
  window.SET106=async v=>{SETTINGS.light106=v;applySettings();for(let i=0;i<4;i++){draw();await W8(60)}};
  render();for(let i=0;i<40;i++){draw();await W8(80)}
  /* wait for the shadow sheets of the figures on the sand (desktop set) */
  for(let i=0;i<80;i++){draw();const f=(L106.last&&L106.last.figs)||[];if(l106Mode()!=='full'||f.length>=S.players.length+S.npcs.length)break;await W8(150)}
  return {human:humanTurn(),pillars:S.pillars.length,npcs:S.npcs.length,mode:l106Mode()}});

/* ---- 1 · defaults + the Settings row ---- */
let pg=await open();
const d1=await pg.evaluate(()=>{const h=settingsHTML('pieces');const t=document.createElement('div');t.innerHTML=h;document.body.appendChild(t);
  const r={pref:l106Pref(),btns:[...t.querySelectorAll('[data-light106]')].map(x=>x.dataset.light106+(x.classList.contains('on')?'*':''))};
  t.querySelector('[data-light106="light"]').click();r.afterLight=SETTINGS.light106;t.querySelector('[data-light106="off"]').click();r.afterOff=SETTINGS.light106;
  t.querySelector('[data-light106="full"]').click();r.afterFull=SETTINGS.light106;r.on=[...t.querySelectorAll('[data-light106].on')].map(x=>x.dataset.light106);t.remove();return r});
ok(d1.pref==='full'&&d1.btns.join()==='full*,light,off','1a desktop starts on Full; the row has Full / Light / Off '+JSON.stringify(d1));
ok(d1.afterLight==='light'&&d1.afterOff==='off'&&d1.afterFull==='full'&&d1.on.join()==='full','1b the buttons set SETTINGS.light106 '+JSON.stringify(d1));
const ph=await open({},{viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const d2=await ph.evaluate(()=>({pref:l106Pref(),phone:l106Phone()}));ok(d2.pref==='light'&&d2.phone,'1c a phone starts on Light '+JSON.stringify(d2));await ph.context().close();

/* ---- 2/3/4 · Off / Light / Full ---- */
const st=await start(pg);ok(st.human&&st.pillars>=8&&st.npcs===2&&st.mode==='full','0 a paused match on Pompeii, Full '+JSON.stringify(st));
const full=await pg.evaluate(()=>{const o=SPY106();return {l106:o.l106,disc:o.disc,pass:o.pass,figs:o.last.figs.length,keys:o.last.figs.map(f=>f.npc?'n':'p'),casts:L106.layer.casts,conts:L106.layer.conts,contacts:o.last.contacts}});
ok(full.pass===1&&full.l106>=3&&full.casts>=8&&full.conts>=8,'4a Full: the static layer holds the pillars'+"'"+' casts + contacts '+JSON.stringify(full));
ok(full.figs===6&&full.keys.filter(k=>k==='n').length===2,'4b Full: a baked shadow under every gladiator and beast '+JSON.stringify(full));
ok(full.contacts>=6&&full.disc===0,'4c Full: contact shadows replace the flat discs '+JSON.stringify(full));
await pg.evaluate(()=>SET106('light'));
const lite=await pg.evaluate(()=>{const o=SPY106();return {l106:o.l106,sheet:o.sheet,disc:o.disc,pass:o.pass,figs:o.last.figs.length,casts:L106.layer.casts,conts:L106.layer.conts,contacts:o.last.contacts,mode:o.mode}});
ok(lite.mode==='light'&&lite.pass===1&&lite.casts===0&&lite.conts>=8&&lite.figs===0&&lite.sheet===0&&lite.contacts>=6&&lite.disc===0,'3 Light = contact shadows only '+JSON.stringify(lite));
await pg.evaluate(()=>SET106('off'));
const off=await pg.evaluate(()=>{const o=SPY106();return {l106:o.l106,sheet:o.sheet,disc:o.disc,pass:o.pass,mode:o.mode}});
ok(off.mode==='off'&&off.l106===0&&off.sheet===0&&off.pass===0,'2a Off = no shadow draw calls '+JSON.stringify(off));
ok(off.disc>=4,'2b Off = the old flat discs '+JSON.stringify(off));

/* ---- 5 · the static layer is cached ---- */
await pg.evaluate(()=>SET106('full'));
const c5=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));draw();const b0=L106.st.builds;for(let i=0;i<12;i++){draw();await W8(30)}const idle=L106.st.builds-b0;
  /* pan: the camera moves the layer, no rebuild */
  const oc=camFocus;let panB=0;try{camFocus=function(W,H){return {r:6,c:6,x:W/2+17,y:H/2+9}};S.zoomIn=false;const b1=L106.st.builds;draw();draw();panB=L106.st.builds-b1}finally{camFocus=oc}draw();
  const pl=S.pillars.find(x=>x&&!x.f76&&!x.w76),b2=L106.st.builds,k0=L106.layer.key;
  S.pillars=S.pillars.filter(x=>x!==pl);(S.rubble||(S.rubble=[])).push({r:pl.r,c:pl.c,dr:0,dc:1});draw();const top=L106.st.builds-b2;draw();draw();const after=L106.st.builds-b2;
  return {idle,panB,top,after,changed:k0!==L106.layer.key}});
ok(c5.idle===0,'5a no static-layer rebuild across 12 idle frames '+JSON.stringify(c5));
ok(c5.top===1&&c5.after===1&&c5.changed,'5b one rebuild after a pillar topples, then cached again '+JSON.stringify(c5));

/* ---- 6 · the figure shadow follows its animation frame ---- */
const c6=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const p=S.players[0];const src=an100SrcFor(p,null);
  for(let i=0;i<60&&!an100Bm(src,'act','attack');i++){draw();await W8(100)}
  const seen=[];an100Act(p,'attack');const t0=performance.now();
  while(performance.now()-t0<AN100.poseMs*5.5){draw();const f=L106.last.figs.find(x=>!x.npc&&x.id===p.id);seen.push([AN100.keys.get(p),f&&f.key]);await W8(25)}
  draw();const fEnd=L106.last.figs.find(x=>!x.npc&&x.id===p.id);
  return {seen,poses:[...new Set(seen.map(x=>x[0]))],eq:seen.every(x=>x[0]===x[1]),end:[AN100.keys.get(p),fEnd&&fEnd.key]}});
ok(c6.eq&&c6.poses.filter(k=>/^actattack/.test(k)).length>=3,'6a the shadow key = the figure'+"'"+'s pose + facing in every frame of an attack '+JSON.stringify({poses:c6.poses,eq:c6.eq}));
ok(c6.end[0]===c6.end[1]&&/^moveidle0/.test(c6.end[0]),'6b back to idle together '+JSON.stringify(c6.end));
const c6b=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const n=S.npcs[0];const k=bst100Key(n);for(let i=0;i<60&&!bst100Img(k,1);i++){draw();await W8(100)}
  bst100Act(n,'attack');const seen=[];const t0=performance.now();while(performance.now()-t0<BST100.step*4){draw();const f=L106.last.figs.find(x=>x.npc&&x.id===n.id);const L=BST100.last.get(n.id);seen.push([L&&L.pose+'|'+L.face,f&&f.key]);await W8(25)}
  return {seen:[...new Set(seen.map(x=>x.join('=')))],eq:seen.every(x=>x[0]===x[1])}});
ok(c6b.eq&&c6b.seen.some(s=>/^attack/.test(s)),'6c a beast'+"'"+'s shadow follows its attack poses '+JSON.stringify(c6b));

/* ---- 7 · Full → Light under a slow frame meter ---- */
const c7=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const toasts=[];const oT=mToast;mToast=function(m){toasts.push(String(m));return oT.apply(this,arguments)};
  try{L106.noAuto=false;SETTINGS.fps100=true;applySettings();L106.frame=Math.max(L106.frame,1000);
    const feed=dt=>{const now=performance.now();F100.fr=[];for(let i=0;i<120;i++)F100.fr.push({t:now-3000+i*25,dt})};
    feed(15);draw();const fast=l106Mode();
    feed(31);draw();const slow=l106Mode(),auto=L106.auto,stored=localStorage.getItem('flavius_light106drop');feed(31);draw();draw();
    const h=settingsHTML('pieces');const t=document.createElement('div');t.innerHTML=h;document.body.appendChild(t);const note=/slow/.test(t.textContent);
    SETTINGS.fps100=false;applySettings();t.querySelector('[data-light106="full"]').click();t.remove();await W8(50);
    return {fast,slow,auto,stored,toasts:toasts.filter(x=>/Lighting/.test(x)).length,note,back:l106Mode(),cleared:localStorage.getItem('flavius_light106drop')}}finally{mToast=oT}});
ok(c7.fast==='full','7a fast frames keep Full '+JSON.stringify(c7));
ok(c7.slow==='light'&&c7.auto==='light'&&c7.stored==='1'&&c7.toasts===1,'7b sustained slow frames drop Full to Light, one toast '+JSON.stringify(c7));
ok(c7.note&&c7.back==='full'&&c7.cleared===null,'7c Settings says why; picking Full again clears the drop '+JSON.stringify(c7));

/* ---- 8 · highlight contrast in a pillar's shadow: Full within 0.01 of Off ---- */
const CR=()=>pg.evaluate(()=>{const dpr=devicePixelRatio||1,g=cv.getContext('2d');const lum=([r,gg,bb])=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(r)+0.7152*f(gg)+0.0722*f(bb)};
  const cr=(a,c)=>{const x=lum(a),y=lum(c);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)};
  /* the empty tiles just down-sun of every pillar (one step +c and +r: lower right on the screen) */
  const T=[];for(const pl of S.pillars){if(!pl)continue;for(const [dr,dc] of [[0,1],[1,0],[1,1],[-1,1]]){const r=pl.r+dr,c=pl.c+dc;if(inB(r,c)&&!unitAt(r,c)&&!pillarAt(r,c)&&!T.some(t=>t[0]===r&&t[1]===c))T.push([r,c])}}
  const oHL=computeHL;let force=true;computeHL=function(){oHL.apply(this,arguments);if(force)for(const [r,c] of T)HL.set(r*N+c,{t:'move',cost:1})};
  const pts=[];for(const [r,c] of T){const m=center(r,c);for(const [ox,oy] of [[-.22,0],[.22,0],[-.15,-.07],[.15,-.07],[-.15,.07],[.15,.07]])pts.push({k:r*N+c,x:m.x+ox*TW,y:m.y+oy*TW})}
  const read=()=>pts.map(p=>{const d=g.getImageData(Math.round(p.x*dpr),Math.round(p.y*dpr),1,1).data;return [d[0],d[1],d[2]]});
  let on,off;try{force=true;draw();on=read();force=false;draw();off=read()}finally{computeHL=oHL;draw()}
  const per={};pts.forEach((p,i)=>{(per[p.k]||(per[p.k]=[])).push(cr(on[i],off[i]))});const v=Object.values(per).map(a=>a.reduce((x,y)=>x+y,0)/a.length);
  return {n:v.length,mean:v.reduce((x,y)=>x+y,0)/v.length,min:Math.min(...v)}});
await pg.evaluate(async()=>{SPEED='pause';SETTINGS.anim88='off';applySettings();for(let i=0;i<3;i++)draw()});
await pg.evaluate(()=>SET106('off'));const crOff=await CR();await pg.evaluate(()=>SET106('full'));const crFull=await CR();
ok(crOff.n>=8&&Math.abs(crFull.mean-crOff.mean)<=0.01&&crFull.min>=crOff.min-0.01,'8 highlight contrast in the pillars'+"'"+' shadows within 0.01 of Off '+JSON.stringify({off:crOff,full:crFull}));
await pg.context().close();

/* ---- 9 · kill switch ---- */
pg=await open({flavius_light106off:'1'});await start(pg);
const k9=await pg.evaluate(()=>{SETTINGS.light106='full';const o=SPY106();return {mode:o.mode,l106:o.l106,sheet:o.sheet,pass:o.pass,disc:o.disc,row:/data-light106/.test(settingsHTML('pieces'))}});
ok(k9.mode==='off'&&k9.l106===0&&k9.sheet===0&&k9.pass===0&&k9.disc>=4&&!k9.row,'9 kill switch = Off, no Lighting row '+JSON.stringify(k9));
await pg.context().close();

await b.close();srv.close();console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(2)});
