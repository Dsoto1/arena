/* tv106f — v1.06 beta-1 G5 + G4 (398-v106b1b; tools/plans/v106/NOTES.md g4a g5a). Checks:
   (1) a Play Now Classic Elimination with beasts, bases off, Lighting Full: NO ring under any figure — every ellipse stroke / fill made while a
       figure is drawn (drawPlayer / drawNPC) or in 356's floor pass is counted (the shadow disc excepted) → 0; the kill switch brings them back;
   (2) the tile under the piece whose turn it is is highlighted (the 'highlights' layer) — gold pixels at that tile, none with the kill switch;
   (3) team events (familia): no team ring, a team chip beside the pennant;
   (4) the v1.06a shadow sheets (assets/anim106*_sh.webp): no stray low-alpha pixels (alpha 1–7 with nothing ≥ 8 within 3 px);
   (5) the bases-off beast cells (334 g6Proc / 346 b103Wall): no small islands left in the base's footprint (the specks / dashed ring), and
       the kill switch shows they were there;
   (6) Moechus (the flat dark wolf) draws a real 3D sheet: his figure pixels have colour and shading, not near-black;
   (7) a forged finished Match Week bout: the result box on the right shows OUR fighter's face, name, Won / Lost / Fell and his purse; none of
       ours → the winner's face + name; the kill switch keeps 360's "Won by".
   node tools/tests/tv106f.js <ABSOLUTE page path> → ERRS [] and exit 0. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const MT={'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg'};
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n);console.log((c?'ok   ':'FAIL ')+n.slice(0,400))};
const open=async(ls)=>{const c=await b.newContext({viewport:{width:1440,height:900}});await c.route(/fonts\./,r=>r.abort());const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');localStorage.setItem('flavius_light106','full');for(const k in o)localStorage.setItem(k,o[k])},ls||{});
  await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
  await pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}try{menuHide()}catch(e){}});return pg};
/* a paused match, bases off; the human's piece on an open tile with a snake, a bear and both wolves around him */
const start=(pg,ev)=>pg.evaluate(async(ev)=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.briefing=false;SETTINGS.calm=false;try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}
  SETTINGS.bases101=false;applySettings();
  startEvent({ev,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'amazonia',cpu:true}],opts:{spect:0}});
  await W8(1200);SPEED='snap';for(let i=0;i<160&&!(humanTurn()&&(S.phase==='action'||S.phase==='choice')&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}SPEED='normal';
  const free=(r,c)=>r>=0&&c>=0&&r<N&&c<N&&!pillarAt(r,c);let best=null;
  for(let r=2;r<11&&!best;r++)for(let c=2;c<11&&!best;c++){let okk=true;for(let a=-1;a<=1;a++)for(let q=-2;q<=1;q++)if(!free(r+a,c+q))okk=false;if(okk)best=[r,c]}
  const [R,C]=best;const p=S.players[S.cur];p.r=R;p.c=C;p._fr=null;const others=S.players.filter(x=>x!==p);others.forEach((x,i)=>{x.r=[0,12,12][i];x.c=[12,0,12][i];x._fr=null});
  if(S.npcs.length){const at={Glykon:[R-1,C],Ursa:[R,C-1],Moechus:[R+1,C],Valencia:[R-1,C-1]};S.npcs=S.npcs.filter(n=>at[n.name]);for(const n of S.npcs){n.r=at[n.name][0];n.c=at[n.name][1];n._fr=null}}
  if(!S.npcs.some(n=>n.name==='Moechus'))S.npcs.push(mkNPC('wolf','Moechus',R+1,C));
  window.RING=()=>{const P=CanvasRenderingContext2D.prototype;const o={ell:0,fill:0,where:[]};let inFig=0,inFloor=0,inSh=0,lastE=false;const sv=[];
    const W=(obj,k,fn)=>{const f=obj[k];sv.push([obj,k,f,Object.prototype.hasOwnProperty.call(obj,k)]);obj[k]=fn(f)};
    W(P,'beginPath',f=>function(){lastE=false;return f.apply(this,arguments)});W(P,'ellipse',f=>function(){lastE=true;return f.apply(this,arguments)});
    W(P,'stroke',f=>function(){if(lastE&&(inFig||inFloor)&&!inSh){o.ell++;if(o.where.length<6)o.where.push((inFloor?'floor ':'fig ')+String(this.strokeStyle))}return f.apply(this,arguments)});
    W(P,'fill',f=>function(){if(lastE&&inFloor&&!inSh&&!/rgba\(0, 0, 0/.test(String(this.fillStyle))){o.fill++;if(o.where.length<6)o.where.push('fillF '+String(this.fillStyle))}return f.apply(this,arguments)});
    const gw=(nm,set)=>{const f=eval(nm);sv.push(['g',nm,f]);const w=function(){set(1);try{return f.apply(this,arguments)}finally{set(-1)}};eval(nm+'=w')};
    gw('drawPlayer',d=>inFig+=d);gw('drawNPC',d=>inFig+=d);gw('floor104',d=>inFloor+=d);gw('fl104Shadow',d=>inSh+=d);
    try{draw()}finally{for(const [obj,k,f,h] of sv.reverse()){if(obj==='g'){window.__f=f;eval(k+'=window.__f')}else if(h||obj===P)obj[k]=f;else delete obj[k]}}return o};
  /* the active tile's centre pixel colour on the canvas, minus the empty-board view of the same tile */
  window.TILEPX=()=>{const cv=ctx.canvas;const p=S.players[S.cur];const m=center(p.r,p.c);const t=ctx.getTransform();
    const g=cv.getContext('2d');const pts=[[-0.36,0],[0.36,0],[0,-0.18],[0,0.18]].map(([a,q])=>{const x=Math.round((m.x+a*TW)*t.a+t.e),y=Math.round((m.y+q*TW)*t.d+t.f);const d=g.getImageData(x,y,1,1).data;return [d[0],d[1],d[2]]});
    return pts};
  render();for(let i=0;i<30;i++){draw();await W8(80)}
  for(let i=0;i<60;i++){draw();if(S.npcs.every(n=>!bst100Key(n)||bst100Img(bst100Key(n),0)))break;await W8(120)}for(let i=0;i<6;i++){draw();await W8(60)}
  return {human:humanTurn(),npcs:S.npcs.map(n=>n.name),teams:!!(EV().teams||EV().coop),pteam:S.players.map(x=>x.team),mode:bs101Mode()}},ev);

/* ---- 1 + 2 · rings / active tile ---- */
let pg=await open();
const st=await start(pg,'democritus');ok(st.human&&st.npcs.includes('Moechus')&&st.mode===2,'0 a paused Classic Elimination, bases off '+JSON.stringify(st));
const r1=await pg.evaluate(()=>{const a=RING();draw();const b2=RING();return {a,b:b2,tile:B1B106.st.tile,px:TILEPX()}});
ok(r1.a.ell===0&&r1.b.ell===0&&r1.a.fill===0,'1a no ring stroke / tint under any figure (bases off, Full) '+JSON.stringify(r1));
const r1b=await pg.evaluate(async()=>{SETTINGS.bases101=true;applySettings();for(let i=0;i<4;i++)draw();const o=RING();SETTINGS.bases101=false;applySettings();draw();return o});
ok(r1b.ell===0,'1b no ring with bases on either '+JSON.stringify(r1b));
ok(r1.tile>0,'2a the active piece'+"'"+'s tile is highlighted '+JSON.stringify({tile:r1.tile,px:r1.px}));

/* ---- 4 · shadow sheets: no stray low-alpha pixels ---- */
const sheets=fs.readdirSync(path.join(root,'assets')).filter(f=>/^anim106p?_.*_sh\.webp$/.test(f));
const r4=await pg.evaluate(async(L)=>{const out={n:0,bad:[],iso:0};for(const f of L){const im=new Image();im.src='assets/'+f;try{await im.decode()}catch(e){out.bad.push(f+' decode');continue}
    const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height).data,W=c.width,H=c.height;
    const strong=new Uint8Array(W*H);for(let i=0;i<W*H;i++)if(d[i*4+3]>=8)strong[i]=1;let iso=0;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const a=d[(y*W+x)*4+3];if(!a||a>=8)continue;let near=false;
      for(let q=-3;q<=3&&!near;q++)for(let p=-3;p<=3;p++){const X=x+p,Y=y+q;if(X<0||Y<0||X>=W||Y>=H)continue;if(strong[Y*W+X]){near=true;break}}if(!near)iso++}
    out.n++;out.iso+=iso;if(iso)out.bad.push(f+' '+iso)}return out},sheets);
ok(r4.n===sheets.length&&r4.n>=150&&r4.iso===0,'4 the v1.06a shadow sheets hold no stray low-alpha pixels '+JSON.stringify({n:r4.n,iso:r4.iso,bad:r4.bad.slice(0,6)}));

/* ---- 5 · bases-off beast cells: no islands in the base footprint ---- */
const ISL=pg2=>pg2.evaluate(()=>{const out={cells:0,isl:0,per:{}};
  for(const k of ['ursa','brutum','glykon','arenosus','valencia','moechus','leo','leaena']){const M=BEAST100_META[k];const im=bst100Img(k,0);if(!im)continue;const me=M.iw,row=M.ir.indexOf('idle0');
    for(let f=0;f<8;f++){const pc=B103_WALL.includes(k)?b103Wall(im,M,me,f,row):g6Proc(im,M,me,f,row);if(!pc)continue;out.cells++;
      const W=pc.width,H=pc.height,d=pc.getContext('2d').getImageData(0,0,W,H).data,G=g6Geom(M,f),T=G.T,cx=me[2],cy=me[3];
      const q=(dx,dy)=>{const u=G.inv[0][0]*dx+G.inv[0][1]*dy,v=G.inv[1][0]*dx+G.inv[1][1]*dy;return u*u+v*v};
      const inB=(x,y)=>{const dx=x+0.5-cx,dy=y+0.5-cy;for(let t=0;t<=1.001;t+=0.25)if(q(dx,dy-T*t)<=1.25*1.25)return true;return false};
      const lab=new Int32Array(W*H);let n=0;const comps=[];
      for(let i=0;i<W*H;i++){if(lab[i]||d[i*4+3]<24)continue;n++;const st=[i];lab[i]=n;let sz=0,sx=0,sy=0;
        while(st.length){const j=st.pop();sz++;const x=j%W,y=(j/W)|0;sx+=x;sy+=y;for(let a=-1;a<=1;a++)for(let b2=-1;b2<=1;b2++){const X=x+b2,Y=y+a;if(X<0||Y<0||X>=W||Y>=H)continue;const kk=Y*W+X;if(lab[kk]||d[kk*4+3]<24)continue;lab[kk]=n;st.push(kk)}}
        comps.push({sz,cx:sx/sz,cy:sy/sz})}
      const big=Math.max(...comps.map(c=>c.sz));const small=comps.filter(c=>c.sz<Math.max(4,big*0.06)&&inB(c.cx,c.cy)).length;out.isl+=small;out.per[k]=(out.per[k]||0)+small}}
  return out});
const r5=await ISL(pg);ok(r5.cells>=48&&r5.isl===0,'5a no specks / ring pieces left round the beasts'+"'"+' feet (bases off) '+JSON.stringify(r5));

/* ---- 6 · Moechus draws his 3D sheet in colour ---- */
const r6=await pg.evaluate(()=>{const M=BEAST100_META.moechus,im=bst100Img('moechus',0);if(!im)return {img:false};const [cw,ch,ax,ay]=M.iw;const c=document.createElement('canvas');c.width=cw*8;c.height=ch;const g=c.getContext('2d');
  g.drawImage(im,0,0,cw*8,ch,0,0,cw*8,ch);const d=g.getImageData(0,0,cw*8,ch).data;const L=[];
  for(let y=0;y<Math.floor(ay-4);y++)for(let x=0;x<cw*8;x++){const i=(y*cw*8+x)*4;if(d[i+3]>200)L.push(0.3*d[i]+0.59*d[i+1]+0.11*d[i+2])}
  const mean=L.reduce((a,b2)=>a+b2,0)/L.length,sd=Math.sqrt(L.reduce((a,b2)=>a+(b2-mean)**2,0)/L.length);
  /* drawn on the board this frame: the cell call for his key */
  const n=S.npcs.find(x=>x.name==='Moechus');const c0=BST100.stats.cells;draw();return {img:true,n:L.length,mean:Math.round(mean),sd:Math.round(sd),drawn:BST100.stats.cells>c0,key:bst100Key(n)}});
ok(r6.img&&r6.n>2000&&r6.mean>=70&&r6.sd>=12&&r6.key==='moechus'&&r6.drawn,'6 Moechus is drawn from his 3D sheet with colour + shading, not a flat silhouette '+JSON.stringify(r6));
await pg.context().close();

/* ---- 3 · a team event: no team ring, a team chip ---- */
pg=await open();const st3=await start(pg,'familia');
const r3=await pg.evaluate(()=>{const c0=B1B106.st.chip;const o=RING();return {o,chips:B1B106.st.chip-c0,teams:S.players.map(p=>p.team)}});
ok(st3.teams&&r3.o.ell===0&&r3.o.fill===0,'3a team event: no team ring / tint under the figures '+JSON.stringify({st3,r3}));
ok(r3.chips>=2,'3b team event: a team chip beside each pennant '+JSON.stringify(r3));
await pg.context().close();

/* ---- 7 · Match Week: our fighter in the result box ---- */
const mgr=async pg2=>pg2.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_();w.welc99=1;w.train='off';w.tplan=null;w.pend=[];for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
  window.W8=W8;window.NIGHT=async()=>{const el=document.querySelector('#mgrBody');if(!el||!el.offsetParent){menuHide();openManager('ludus');await W8(900)}MGR.tab='night';MGR.confirmEnd=false;MGR_REDRAW();await W8(700)};
  /* forge: bout 0 fought; res = which:'won' | 'fell' | 'none' */
  window.FORGE=async(which)=>{const w=W_(),n=w.night;const b=n.bouts.find(x=>x.ents&&x.ents.length>=2)||n.bouts[0];const bi=n.bouts.indexOf(b);const mine=rosterOf(me());const g=mine[0];
    const foes=w.mgrs.filter(m=>!m.isPlayer).flatMap(m=>rosterOf(m)).slice(0,3);const ents=which==='none'?foes.map(x=>x.id):[g.id,...foes.slice(0,2).map(x=>x.id)];b.ents=ents;b.done=true;
    const win=which==='won'?g.id:foes[0].id;
    b.res={att:900,winners:[win],turns:7,reason:'',lines:[],rows:ents.map((id,i)=>({gid:id,place:id===win?1:i+2,won:id===win,f:20,alive:!(which==='fell'&&id===g.id),vd:which==='fell'&&id===g.id?'killed':'ludus',fname:''}))};
    if(which!=='none')b.res.house101={tot:which==='won'?42:6,by:{[g.id]:which==='won'?42:6}};
    await NIGHT();const art=document.querySelector(`.mw105b[data-mw105b="${bi}"]`);const box=art&&art.querySelector('.a1act .mw105rt');
    return {bi,our:g.name,win:(gById(win)||{}).name,html:box?box.outerHTML.slice(0,900):null,text:box?box.textContent.replace(/\s+/g,' ').trim():'',face:!!(box&&box.querySelector('.mw398f img,.mw398f svg,.mw398f [class*="portrait"],.mw398f canvas,.mw398f span[style]')),cls:box?box.className:''}};
  menuHide();openManager('ludus');await W8(600);MGR.view=null});
pg=await open();await mgr(pg);
const w7=await pg.evaluate(()=>FORGE('won'));
ok(w7.html&&/mw398/.test(w7.cls)&&w7.face&&w7.text.includes(w7.our)&&/Won/.test(w7.text)&&/\+42/.test(w7.text),'7a our fighter won: face, name, Won, purse '+JSON.stringify(w7).slice(0,700));
const f7=await pg.evaluate(()=>FORGE('fell'));
ok(f7.html&&f7.face&&f7.text.includes(f7.our)&&/Fell/.test(f7.text)&&/\+6/.test(f7.text),'7b our fighter fell: Fell + his purse '+JSON.stringify(f7).slice(0,700));
const n7=await pg.evaluate(()=>FORGE('none'));
ok(n7.html&&n7.face&&n7.text.includes(n7.win)&&/Won the bout/.test(n7.text)&&!n7.text.includes(n7.our),'7c none of ours fought: the winner'+"'"+'s face + name '+JSON.stringify(n7).slice(0,700));
await pg.context().close();

/* ---- kill switch ---- */
pg=await open({flavius_v106b1boff:'1'});await start(pg,'democritus');
const k1=await pg.evaluate(()=>{const o=RING();return {o,tile:B1B106.st.tile,off:B1B106.off}});
ok(k1.off&&k1.o.ell>=2&&k1.tile===0,'K1 kill switch: the rings are back, no active tile '+JSON.stringify(k1));
const k5=await ISL(pg);ok(k5.isl>0,'K2 kill switch: the base-flood islands come back (5a measured a real fix) '+JSON.stringify({isl:k5.isl,per:k5.per}));
await pg.context().close();
pg=await open({flavius_v106b1boff:'1'});await mgr(pg);
const k7=await pg.evaluate(()=>FORGE('won'));ok(k7.html&&!/mw398/.test(k7.cls)&&/Won by/.test(k7.text),'K3 kill switch: 360'+"'"+'s "Won by" box '+JSON.stringify(k7).slice(0,400));
await pg.context().close();

await b.close();srv.close();console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(2)});
