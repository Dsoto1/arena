/* v1.03 workstream C · 3D tokens + Studio gear (346-v103board): T1 the re-rendered beast sheets load (bears / lions / wolves smaller than the
   gladiators, lions narrower than before); T2 "Show token bases" off takes the base off Tholo / Commodus / wolves (312 round-base sheets) and
   off sculpted figures (custom humanoids); T3 the thin-base rim ring is thinner, none without a base; T4 a disabled Tunnel says "missing a
   limb"; T5 Telemachus: every attack control's tip names him; T6 sharp cells (native size on device pixels, device-ratio beast cells,
   up-scaled cells sharpened; edges crisper than the kill switch's, draw cost kept); S1 Weapons / Armor / Trophies in 335's designer frame.
   SHOT=<dir> saves tv103c_*.png. Serves the page over http (the sheets need readable pixels). */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);const SHOT=process.env.SHOT||'';
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(ls,dpr)=>{const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:dpr||1});await ctx.route(/fonts\./,r=>r.abort());const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in o)localStorage.setItem(k,o[k])},ls||{});
  await pg.goto(URL0,{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}menuHide();window.__e0=ERR92.n});return pg};
const shot=async(pg,n)=>{if(SHOT){fs.mkdirSync(SHOT,{recursive:true});await pg.screenshot({path:path.join(SHOT,'tv103c_'+n+'.png')})}};
const newErr=pg=>pg.evaluate(()=>errNew92(window.__e0).map(e=>e.msg||e.m||JSON.stringify(e).slice(0,160)));
/* a paused Democritus: the human (seat 0) at the Action phase; beasts on the sand */
const start=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.briefing=false;SETTINGS.calm=false;
  startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  await W8(1200);SPEED='snap';for(let i=0;i<160&&!(humanTurn()&&(S.phase==='action'||S.phase==='choice')&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  if(S.phase==='choice'){await takeChoice(cur(),'coin');await W8(200)}while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}SPEED='pause';
  S.npcs=[];S.pillars=S.pillars.filter(p=>!(p.r>=3&&p.r<=9&&p.c>=2&&p.c<=10));const pl=[[5,4],[5,7],[8,4],[8,7]];S.players.forEach((p,i)=>{p.r=pl[i][0];p.c=pl[i][1]});
  for(const [t,k,r,c] of [['lion','Leo',6,5],['bear','Ursa',6,8],['wolf','Valencia',7,3],['tholo','Tholo',4,6],['commodus','Commodus',9,6]])S.npcs.push(mkNPC(t,k,r,c));
  render();for(let i=0;i<40;i++){draw();await W8(80)}return {human:humanTurn(),phase:S.phase,on:typeof V103C!=='undefined'&&!V103C.off}});

const pg=await open();const st=await start(pg);ok(st.human&&st.phase==='action'&&st.on,'0 the human acts, module on '+JSON.stringify(st));
/* ---- T1 · the re-rendered sheets ---- */
const t1=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const ks=['leo','leaena','ursa','brutum','valencia','moechus'];for(const k of ks){bst100Img(k,0);bst100Img(k,1)}
  for(let i=0;i<150&&ks.some(k=>!BST100.img[k]._ok||!BST100.img[k+'_act']._ok);i++)await W8(100);
  const bad=[];for(const k of ks)for(const a of [0,1]){const im=BST100.img[k+(a?'_act':'')],M=BEAST100_META[k],me=a?M.aw:M.iw;if(!im._ok||im.naturalWidth!==me[0]*8||im.naturalHeight!==me[1]*me[4])bad.push(k+a)}
  /* screen height of the figure (cell height × scale, the base taken off) vs the bare gladiator stand-in */
  const gR=ANIM100_META.soldier.move.rows.idle[0],gs=TW*MINI_BASE/25.4/ANIM100_META.soldier.move.pxmm,gH=gR[4]*gs;
  const h=k=>{const M=BEAST100_META[k];return M.iw[3]*bst100Scale(M)/gH};const r={};for(const k of ks)r[k]=+h(k).toFixed(2);
  const lw=BEAST100_META.leo.iw[0]/BEAST100_META.leo.iw[1];
  /* v1.02's heights above the base (BEAST100_META iw[3]) */const OLD={leo:141,leaena:119,ursa:106.1,brutum:106.1,valencia:58.5,moechus:58.5};
  const rel=ks.map(k=>[k,+(BEAST100_META[k].iw[3]/OLD[k]).toFixed(3),/^(valencia|moechus)$/.test(k)?0.92:0.86]);return {bad,r,lw:+lw.toFixed(2),rel}});
ok(!t1.bad.length,'T1a the six re-rendered beasts decode to their meta '+JSON.stringify(t1.bad));
ok(t1.rel.every(x=>x[1]<=x[2]),'T1b every re-rendered figure is shorter than in v1.02 (height above the base: lions/bears ≤0.86, wolves ≤0.92) '+JSON.stringify(t1.rel));
ok(t1.lw<1.35,'T1c the lion is slimmer: cell width/height '+t1.lw+' (v1.02: 1.37)');
await shot(pg,'t1');
/* ---- T3 · the rim ring ---- */
const t3=await pg.evaluate(()=>{const k=2;const out={};for(const m of [true,false]){SETTINGS.bases101=m;out[m?'thin':'off']=rim103(k)}SETTINGS.bases101=true;return out});
ok(t3.thin&&t3.thin.w<2.3*2*0.7&&t3.thin.dy>1.35*2&&t3.off===null,'T3 thin base: thinner ring on the squeezed wall; bases off: no ring '+JSON.stringify(t3));
/* ---- T2 · bases off ---- */
const t2=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.bases101=false;applySettings();
  const res={};for(const k of ['tholo','commodus','valencia','moechus','glykon','arenosus','zora']){const M=BEAST100_META[k];let im=bst100Img(k,0);for(let i=0;i<80&&!im;i++){await W8(100);im=bst100Img(k,0)}
    let okN=0,left=[];for(let f=0;f<8;f++){const c=B103_HUM.includes(k)?b103Proc(im,M,M.iw,f,0):B103_WALL.includes(k)?b103Wall(im,M,M.iw,f,0):g6Proc(im,M,M.iw,f,0);if(!c)continue;okN++;
      /* the wall band (inside the base cylinder, below the top oval's front edge): what stays opaque */
      const W=M.iw[0],H=M.iw[1],cx=M.iw[2],cy=M.iw[3],G=g6Geom(M,f);const d=c.getContext('2d').getImageData(0,0,W,H).data;
      const q=(dx,dy)=>{const u=G.inv[0][0]*dx+G.inv[0][1]*dy,v=G.inv[1][0]*dx+G.inv[1][1]*dy;return u*u+v*v};let n=0,o=0;
      for(let y=Math.floor(cy);y<Math.min(H,cy+G.T+8);y++)for(let x=0;x<W;x++){const dx=x+0.5-cx,dy=y+0.5-cy;if(q(dx,dy)<=1)continue;if(!(q(dx,dy-G.T)<=0.92||q(dx,dy-G.T/2)<=0.92))continue;n++;if(d[(y*W+x)*4+3]>128)o++}
      left.push(n?+(o/n).toFixed(2):0)}
    res[k]={ok:okN,left:Math.max(...left)}}
  const nb0=V103C.st.nb;render();for(let i=0;i<6;i++){draw();await W8(80)}res.drawn=V103C.st.nb-nb0;
  /* a custom humanoid: its sculpted figure without the base ellipses */
  const sp={kind:'humanoid',c1:'#884422',c2:'#ccaa66'};const a=figureSVG(sp),z=figureSVG(Object.assign({},sp,{_nb103:1}));
  NB103.in++;try{tokenImg(sp)}finally{NB103.in--}res.svg={base:/cy="160" rx="31"/.test(a),nb:/cy="160" rx="31"/.test(z),swap:Object.keys(TOKEN_IMG3||{}).some(k=>/_nb103/.test(k))};
  return res});
for(const k of ['tholo','commodus','valencia','moechus','glykon','arenosus','zora'])ok(t2[k]&&t2[k].ok===8&&t2[k].left<=0.12,'T2a '+k+': every facing loses its base (wall band left ≤12%) '+JSON.stringify(t2[k]));
ok(t2.drawn>0,'T2b the board draws the base-less cells '+t2.drawn);
ok(t2.svg.base&&!t2.svg.nb&&t2.svg.swap,'T2c sculpted figures (custom humanoids) drop the base ellipses while bases are off '+JSON.stringify(t2.svg));
await shot(pg,'t2_bases_off');
await pg.evaluate(()=>{SETTINGS.bases101=true;applySettings();draw()});
/* ---- T4 · the tunnel's reason ---- */
const t4=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const p=cur();p.r=3;p.c=4;p.keys=1;p.hp.larm=0;S.mode='move';render();await W8(200);
  const b=document.querySelector('#actions [data-act="m-tunnel"],#actions .ph-m-tunnel');return {why:tun103Why(p),tip:b&&(b.dataset.tip||''),al:b&&b.getAttribute('aria-label'),dis:b&&b.disabled}});
ok(/missing a limb/.test(t4.why)&&/missing a limb/.test(t4.tip||'')&&/missing a limb/.test(t4.al||''),'T4 a disabled tunnel says it is the missing limb '+JSON.stringify(t4));
const t4b=await pg.evaluate(async()=>{const p=cur();p.hp.larm=5;p.keys=0;render();return tun103Why(p)});
ok(/Arena Key/.test(t4b),'T4b no key → "Needs an Arena Key" '+t4b);
await pg.evaluate(()=>{const p=cur();p.keys=1;p.r=5;p.c=4;render()});
/* ---- T5 · Telemachus ---- */
const t5=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));S.active.telemachus=1;render();await W8(200);
  const L=[...document.querySelectorAll('#actions [data-g96="atk"] button, #actions [data-g96="atk"] .ph96b')];
  const out={n:L.length,tips:L.map(b=>b.dataset.tip||'').filter(t=>!/Telemachus/.test(t)),hd:(document.querySelector('#actions [data-g96="atk"] .hd96')||{dataset:{}}).dataset.tip||''};S.active.telemachus=0;render();return out});
ok(t5.n>0&&!t5.tips.length&&/Telemachus/.test(t5.hd),'T5 Telemachus: every attack control + the group header name him '+JSON.stringify(t5));
/* ---- T6 · sharp cells ---- */
const t6=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const s0=Object.assign({},V103C.st);for(let i=0;i<20;i++){draw();await W8(50)}
  const t0=performance.now();for(let i=0;i<10;i++)draw();const ms=(performance.now()-t0)/10;
  /* a sharpen on a typical up-scaled cell */
  const c=document.createElement('canvas');c.width=140;c.height=220;const g=c.getContext('2d');g.fillStyle='#a63';g.fillRect(30,20,80,180);const q0=performance.now();for(let i=0;i<5;i++)sh103Sharpen(c);const shMs=(performance.now()-q0)/5;
  return {blit:V103C.st.blit-s0.blit,ms:+ms.toFixed(1),shMs:+shMs.toFixed(2)}});
ok(t6.blit>0,'T6a cells drawn at their own size on device pixels '+JSON.stringify(t6));
ok(t6.shMs<4,'T6b one sharpen of a 140×220 cell stays cheap '+JSON.stringify(t6));
/* edge energy vs the kill switch, a 2× screen zoomed (cells up-scaled) */
const edge=async ls=>{const p=await open(ls,2);await start(p);return p.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));S.zoomIn=true;CAM.z=null;CAM.fr=6;CAM.fc=5;for(let i=0;i<50;i++){draw();await W8(80)}
  const d=window.devicePixelRatio||1,g=cv.getContext('2d');const en=u=>{const m=center(u.r,u.c);const x=Math.round((m.x-TW*0.45)*d),y=Math.round((m.y-TW*1.5)*d),w=Math.round(TW*0.9*d),h=Math.round(TW*1.6*d);
    const D=g.getImageData(x,y,w,h).data;const L=new Float32Array(w*h);for(let i=0;i<w*h;i++)L[i]=0.3*D[i*4]+0.59*D[i*4+1]+0.11*D[i*4+2];let s=0,n=0;
    for(let yy=1;yy<h-1;yy++)for(let xx=1;xx<w-1;xx++){const i=yy*w+xx;const gx=L[i+1-w]+2*L[i+1]+L[i+1+w]-L[i-1-w]-2*L[i-1]-L[i-1+w],gy=L[i-1+w]+2*L[i+w]+L[i+1+w]-L[i-1-w]-2*L[i-w]-L[i+1-w];const mg=Math.hypot(gx,gy);if(mg>40){s+=mg;n++}}return s/Math.max(1,n)};
  const gl=S.players.map(en);const t0=performance.now();for(let i=0;i<8;i++)draw();return {e:gl.reduce((a,b)=>a+b,0)/gl.length,ms:(performance.now()-t0)/8}}).finally(()=>p.context().close())};
const eOff=await edge({flavius_v103coff:'1'}),eOn=await edge({});
ok(eOn.e>eOff.e*1.04,'T6c gladiator edges crisper than v1.02 (2× screen, zoomed) '+JSON.stringify({on:eOn,off:eOff}));
ok(eOn.ms<eOff.ms*1.5+4,'T6d the draw cost stays (settled board) '+JSON.stringify({on:eOn.ms,off:eOff.ms}));
/* ---- S1 · the Gear designers in the frame ---- */
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(200)}openStudio();await W8(900)});
for(const v of ['gear:w','gear:a','trophies']){
  const s1=await pg.evaluate(async v=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));document.querySelector(`#studio [data-st="tab"][data-v="${v}"]`).click();await W8(700);
    const R=document.querySelector('#studio .df99.d102');const tabs=R?[...R.querySelectorAll('[data-df99t]')].map(t=>t.dataset.df99t):[];
    const save=R&&R.querySelector('[data-gs="wsave"],[data-gs="asave"],[data-trs="save"]');const nm=R&&R.querySelector('input[data-cwf="name"],input[data-caf="name"],input[data-trf="name"]');
    let head='';if(nm){nm.value='Tv103 Piece';nm.dispatchEvent(new Event('input',{bubbles:true}));await W8(200);head=(R.querySelector('.df99head')||{}).textContent||''}
    /* the second tab opens and the preview stays */
    const t2=R&&R.querySelectorAll('[data-df99t]')[1];if(t2){t2.click();await W8(300)}const R2=document.querySelector('#studio .df99.d102');
    return {frame:!!R,tabs,st98:document.querySelectorAll('#studio .st98bar').length,save:!!save,head:/Tv103 Piece/.test(head),pv:!!(R2&&R2.querySelector('.df99pv #cwArt,.df99pv #caPiece,.df99pv #trPrev'))}},v);
  ok(s1.frame&&s1.tabs.length>=2&&!s1.st98&&s1.save&&s1.head&&s1.pv,'S1 '+v+' in the designer frame (tabs, Save, live name, preview) '+JSON.stringify(s1));
  await shot(pg,'s1_'+v.replace(':','_'))}
/* the sculpt tab still sculpts (a shape added to the weapon) */
const s1b=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));document.querySelector('#studio [data-st="tab"][data-v="gear:w"]').click();await W8(600);
  const n0=document.querySelectorAll('#studio .scbl').length;const t=[...document.querySelectorAll('#studio .df99.d102 [data-df99t]')].find(x=>/sculpt/i.test(x.textContent));if(t){t.click();await W8(300)}
  const btn=[...document.querySelectorAll('#studio .df99.d102 .scbench button')].find(x=>/Circle/.test(x.textContent));if(btn){btn.click();await W8(500)}
  return {tab:!!t,btn:!!btn,n0,n1:document.querySelectorAll('#studio .scbl').length}});
ok(s1b.tab&&s1b.btn&&s1b.n1>s1b.n0,'S1b the weapon Sculpt tab adds a shape '+JSON.stringify(s1b));
ok((await newErr(pg)).length===0,'no new errors '+JSON.stringify(await newErr(pg)));
console.log(miss.length?'MISSING '+JSON.stringify(miss,null,1):'ALL OK');console.log('ERRS',JSON.stringify(errs));
await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});
