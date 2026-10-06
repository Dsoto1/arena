/* =====================================================================
   189-V91NIGHT · v0.91 — THE NIGHT MATCH (Virgilante's picks 2026-10-06)
   =====================================================================
   WHEN
   • Manager — Match Week's 2ND bout (w.night.bouts[1], the feature) is the night match: boutCfg wrapper → cfg.night;
     Match Week marks that card "🌙 Night match" (nightHTML wrapper, .nt91 beside the tier label).
     The City Center square (172-v89city) shows DUSK + lit lamps while the night bout is the next one on the card
     (bouts[0] fought, bouts[1] not): bake89 wrapper grades the baked layers (dusk91Apply), CB89.dusk91 = the state.
   • Play Now — Options → "Time of day" ☀ Day / 🌙 Night (#oNight91 → CFG.opts.night, kept for the session like the
     other options; startEvent gets it in cfg.opts).
   • Online rooms — the host picks Day/Night before the horns: L.night in the shared rules (111-onlcore newLobby/roomSet,
     server lobby.set whitelist, the mock's lobby.set here); every client reads it from the lobby (NIGHT91.lob, also
     carried in the opening snapshot as S.night). Display only: never in onlHash, never in the rules.
   S.night = the event is at night (newState wrapper: cfg.night, cfg.opts.night, or the online lobby's night).
   LOOK (his pick: torches on the rim only, lights never block the view) — 07-ui draw() calls night91Sand(Wd,Hd) right
   after the tile loop, so everything drawn later (start marks, labels, floor tokens, chest, pieces, highlights, hover,
   rings, Flavius, FX, text) is never darkened:
   • a baked grade per board size (NIGHT91.cache, key = size/TW/origin/dpr/stands): the stands and rim darkened to night,
     the sand a cool moonlit blue, lighter in the middle; drawn 'source-atop' (only over what is already painted);
   • a baked sky (deep blue gradient, stars, a moon with its halo) painted 'destination-over' behind the stands;
   • 11 lights on the stands' edge and corners, OUTSIDE the sand (night91Spots, unturned grid points; 3 bronze braziers
     at the corners — none under Flavius's box at the top — and 8 torches along the edges): warm pools of light on the sand edges ('lighter', subtle, clipped to the
     rim) + the fires themselves. NIGHT91.torches = their screen boxes (tests: never inside the sand diamond).
   • every fighter and beast keeps a soft warm light behind it ('screen') and a warm rim light round its silhouette
     (drawPlayer/drawNPC drawn with a soft warm shadow glow), so dark minis read against the night sand;
   • FLICKER: time-based (no dice); stops with Reduce motion (reduceMotion), Animations Off (SETTINGS.anim88) or the
     Light board (lite84On). A 110 ms timer redraws only while a night event shows and nothing else animates.
   Works turned (168-v89rotate: the rim and the lights never turn), on Naumachia water and the Chariot track.
   ===================================================================== */
const NIGHT91={lob:{},cache:null,key:'',torches:[],t0:performance.now(),frames:0};
/* night91On — is the event on screen a night match? */
function night91On(){try{if(typeof S==='undefined'||!S||HEADLESS)return false;if(S.night)return true;
  if(S.onl&&S.onl.lobby!=null){if(NIGHT91.lob[S.onl.lobby])return true;const L=typeof ONL!=='undefined'&&ONL&&ONL.lobbies?ONL.lobbies.find(x=>x&&x.id===S.onl.lobby):null;return !!(L&&L.night)}
  return false}catch(e){return false}}
/* night91Flick — may the flames flicker? */
function night91Flick(){try{if(typeof reduceMotion==='function'&&reduceMotion())return false;if(typeof SETTINGS!=='undefined'&&SETTINGS.anim88==='off')return false;
  if(typeof lite84On==='function'&&lite84On())return false;return true}catch(e){return false}}

/* ---------- when: the event's state ---------- */
{const base=newState;newState=function(config){const r=base.apply(this,arguments);try{if(S&&config){let n=!!(config.night||(config.opts&&config.opts.night));
    if(config.onl&&config.onl.lobby!=null){const id=config.onl.lobby;const L=typeof ONL!=='undefined'&&ONL&&ONL.lobbies?ONL.lobbies.find(x=>x&&x.id===id):null;if(L)NIGHT91.lob[id]=!!L.night;if(NIGHT91.lob[id])n=true}
    S.night=n}}catch(e){}return r}}
/* online: remember each lobby's time of day as a client meets it (entering, joining by snapshot, watching) */
function night91Lob(L){try{if(L&&L.id!=null&&'night' in L)NIGHT91.lob[L.id]=!!L.night}catch(e){}}
if(typeof onlEnter==='function'){const base=onlEnter;onlEnter=function(L){night91Lob(L);return base.apply(this,arguments)}}
if(typeof onlJoinMatch==='function'){const base=onlJoinMatch;onlJoinMatch=function(L){night91Lob(L);return base.apply(this,arguments)}}
if(typeof onlAttach==='function'){const base=onlAttach;onlAttach=function(L){night91Lob(L);return base.apply(this,arguments)}}
/* the mock server mirrors routes.js: lobby.set takes 'night' (the shared ONLC.roomSet applies it) */
if(typeof MOCK_ROUTES!=='undefined'&&MOCK_ROUTES['lobby.set']){const base=MOCK_ROUTES['lobby.set'];MOCK_ROUTES['lobby.set']=(w,d,me)=>{
  if(d&&d.night!=null&&typeof mockLobby80==='function'){const L=mockLobby80(w,d.id);if(L){const why=ONLC.roomSet(L,me,{night:d.night},typeof mockNow==='function'?mockNow():Date.now());if(why)throw new Error(why)}}
  return base(w,d,me)}}
/* the room: the host's Day/Night select; everyone else reads it in the rules line */
if(typeof onlRoomHTML80==='function'){const base=onlRoomHTML80;onlRoomHTML80=function(L,grey){let h=base.apply(this,arguments);try{if(!L||typeof h!=='string')return h;night91Lob(L);
    const nt=!!L.night;const sel=`<label class="nt91r">${_T`Time`}<select class="tin" data-onlrs="night"><option value="0" ${nt?'':'selected'}>${_T`☀ Day`}</option><option value="1" ${nt?'selected':''}>${_T`🌙 Night`}</option></select></label>`;
    if(h.indexOf('<div class="r80-set">')>=0)h=h.replace('<div class="r80-set">','<div class="r80-set">'+sel);
    else if(h.indexOf('<div class="r80-rules rc-sub">')>=0)h=h.replace('<div class="r80-rules rc-sub">',`<div class="r80-rules rc-sub"><span class="nt91r">${nt?_T('🌙 Night match'):_T('☀ Day match')}</span> · `)}catch(e){}return h}}

/* Play Now: Options → Time of day */
{const base=optionsHTML;optionsHTML=function(ev,L){let h=base.apply(this,arguments);try{if(typeof h!=='string'||/id="oNight91"/.test(h))return h;const nt=!!(CFG.opts&&CFG.opts.night);
  const box=`<label class="nt91o" title="${_T`Night: the sand under the moon, torches on the stands. The rules are the same.`}">${_T`Time of day`} <select id="oNight91"><option value="day" ${nt?'':'selected'}>${_T`☀ Day`}</option><option value="night" ${nt?'selected':''}>${_T`🌙 Night`}</option></select></label>`;
  const i=h.indexOf('<div class="opts">');if(i>=0){const j=i+'<div class="opts">'.length;h=h.slice(0,j)+box+h.slice(j)}else h=box+h}catch(e){}return h}}
document.addEventListener('change',e=>{const t=e.target;if(!t||t.id!=='oNight91')return;CFG.opts=CFG.opts||{};CFG.opts.night=t.value==='night'},true);

/* Manager: the second bout of Match Week is fought at night */
function night91Bout(w,b){try{const n=w&&w.night;if(!n||n.bye||!n.bouts||n.bouts.length<2)return false;return n.bouts.indexOf(b)===1}catch(e){return false}}
{const base=boutCfg;boutCfg=function(b){const cfg=base.apply(this,arguments);try{if(cfg&&night91Bout(W_(),b))cfg.night=true}catch(e){}return cfg}}
{const base=nightHTML;nightHTML=function(){const h=base.apply(this,arguments);try{if(typeof h!=='string')return h;const w=W_();const n=w&&w.night;if(!n||n.bye||!n.bouts||n.bouts.length<2)return h;
    let i=h.indexOf('class="card2 bout ');if(i<0)return h;i=h.indexOf('class="card2 bout ',i+10);if(i<0)return h;const k='<span class="tierlbl">';const j=h.indexOf(k,i);if(j<0)return h;
    const tag=`<span class="nt91" data-tip="${_T`The second bout of the week is fought after dusk, under the torches. The rules are the same.`}">${_T`🌙 Night match`}</span> `;
    return h.slice(0,j+k.length)+tag+h.slice(j+k.length)}catch(e){return h}}}

/* ---------- the arena at night ---------- */
/* night91Spots — the lights: grid points (r,c) outside the sand (the sand is 0..N), never turned */
function night91Spots(){const n=N,d=1.1,dc=1.1;const out=[{r:-dc,c:n+dc,k:'b'},{r:n+dc,c:n+dc,k:'b'},{r:n+dc,c:-dc,k:'b'}]; /* no brazier at the top corner: Flavius's box sits over it */
  for(const f of [1/3,2/3]){const a=n*f;out.push({r:-d,c:a,k:'t'},{r:a,c:n+d,k:'t'},{r:n+d,c:a,k:'t'},{r:a,c:-d,k:'t'})}return out}
/* the sand diamond (screen, unturned) */
function night91Dia(e){const k=e||0;return [isoFix(-k,-k),isoFix(-k,N+k),isoFix(N+k,N+k),isoFix(N+k,-k)]}
function night91Path(g,P){g.beginPath();P.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath()}
/* night91Bake — the static layers for this board size: grade (source-atop) and sky (destination-over) */
function night91Bake(Wd,Hd){const dpr=window.devicePixelRatio||1;const key=[Wd,Hd,dpr,TW.toFixed(2),OX.toFixed(1),OY.toFixed(1),STANDS?1:0,N].join('|');
  if(NIGHT91.cache&&NIGHT91.key===key)return NIGHT91.cache;
  const mk=()=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.round(Wd*dpr));c.height=Math.max(1,Math.round(Hd*dpr));const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);return [c,g]};
  const [gc,g]=mk();const D=night91Dia(0);const cx=(D[0].x+D[2].x)/2,cy=(D[0].y+D[2].y)/2,R=(D[1].x-D[3].x)/2;
  /* the stands and the rim: night */
  g.fillStyle='rgba(8,12,34,.56)';g.fillRect(0,0,Wd,Hd);
  /* the sand: moonlit blue, lighter in the middle (an ellipse in screen space) */
  night91Path(g,D);g.globalCompositeOperation='destination-out';g.fillStyle='#000';g.fill();g.globalCompositeOperation='source-over';
  g.save();night91Path(g,D);g.clip();g.translate(cx,cy);g.scale(1,0.5);const rg=g.createRadialGradient(0,-R*0.1,R*0.04,0,0,R*1.02);
  rg.addColorStop(0,'rgba(66,100,196,.32)');rg.addColorStop(.5,'rgba(34,56,128,.41)');rg.addColorStop(1,'rgba(12,20,58,.55)');g.fillStyle=rg;g.fillRect(-R*1.2,-R*1.2,R*2.4,R*2.4);g.restore();
  /* the sky behind it all */
  const [sc,s]=mk();const sg=s.createLinearGradient(0,0,0,Hd);sg.addColorStop(0,'#060a1c');sg.addColorStop(.55,'#0e1530');sg.addColorStop(1,'#151b33');s.fillStyle=sg;s.fillRect(0,0,Wd,Hd);
  let q=97531;const rn=()=>{q=(q*1103515245+12345)&0x7fffffff;return q/0x7fffffff};
  for(let i=0;i<110;i++){const x=rn()*Wd,y=rn()*Hd*0.9,r=rn()<0.12?1.4:0.5+rn()*0.7,a=0.35+rn()*0.55;s.fillStyle=`rgba(${220+Math.round(rn()*35)},${225+Math.round(rn()*30)},255,${a.toFixed(2)})`;s.beginPath();s.arc(x,y,r,0,Math.PI*2);s.fill()}
  const mx=Math.max(TW*1.2,Math.min(Wd*0.11,D[3].x-TW*0.5)),my=Math.max(TW*0.9,Math.min(Hd*0.12,D[0].y-TW*1.2)),mr=Math.max(10,TW*0.42);
  const halo=s.createRadialGradient(mx,my,mr*0.8,mx,my,mr*4.5);halo.addColorStop(0,'rgba(190,210,255,.28)');halo.addColorStop(1,'rgba(190,210,255,0)');s.fillStyle=halo;s.fillRect(mx-mr*5,my-mr*5,mr*10,mr*10);
  const mg=s.createRadialGradient(mx-mr*0.3,my-mr*0.3,mr*0.1,mx,my,mr);mg.addColorStop(0,'#fbf8ec');mg.addColorStop(1,'#d9dcd2');s.fillStyle=mg;s.beginPath();s.arc(mx,my,mr,0,Math.PI*2);s.fill();
  s.fillStyle='rgba(150,155,150,.35)';for(const [dx,dy,rr] of [[-0.3,-0.15,0.22],[0.25,0.2,0.16],[0.05,-0.42,0.1],[-0.1,0.38,0.12]]){s.beginPath();s.arc(mx+dx*mr,my+dy*mr,rr*mr,0,Math.PI*2);s.fill()}
  NIGHT91.key=key;NIGHT91.cache={gc,sc,mx,my};return NIGHT91.cache}
/* night91F — one light's flicker 0.7–1 (time-based; constant when the flames hold still) */
function night91F(i,t){const ph=i*1.913;return 0.86+0.08*Math.sin(t*7.3+ph)+0.06*Math.sin(t*13.7+ph*1.7)}
/* night91Fire — the fire itself: three tongues, outer orange → white core */
function night91Fire(x,y,h,w,f,sway){ctx.save();const H=h*f;
  for(const [k,col] of [[1,'rgba(255,120,30,.9)'],[0.68,'rgba(255,196,80,.95)'],[0.38,'rgba(255,244,200,.95)']]){const hh=H*k,ww=w*k;
    ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x-ww,y);ctx.bezierCurveTo(x-ww,y-hh*0.45,x-ww*0.2+sway*k,y-hh*0.7,x+sway*k,y-hh);ctx.bezierCurveTo(x+ww*0.2+sway*k,y-hh*0.7,x+ww,y-hh*0.45,x+ww,y);ctx.closePath();ctx.fill()}
  ctx.restore()}
/* night91Sand — called by draw() (07-ui) after the tiles: grade, sky, pools of light, the lights */
function night91Sand(Wd,Hd){if(!night91On())return;try{
  const C=night91Bake(Wd,Hd);
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='source-atop';ctx.drawImage(C.gc,0,0);ctx.globalCompositeOperation='destination-over';ctx.drawImage(C.sc,0,0);ctx.restore();
  const fl=night91Flick();const t=fl?(performance.now()-NIGHT91.t0)/1000:0;const spots=night91Spots();NIGHT91.frames++;
  const pts=spots.map((s,i)=>{const p=isoFix(s.r,s.c);return {...s,x:p.x,y:p.y,f:night91F(i,t),i}});
  /* the pools: warm light on the rim and the sand's edges */
  ctx.save();night91Path(ctx,night91Dia(0.75));ctx.clip();ctx.globalCompositeOperation='lighter';
  for(const p of pts){const R=TW*(p.k==='b'?2.9:2.4)*(0.96+0.04*p.f);ctx.save();ctx.translate(p.x,p.y);ctx.scale(1,0.5);const g=ctx.createRadialGradient(0,0,0,0,0,R);
    g.addColorStop(0,`rgba(255,150,60,${(0.34*p.f).toFixed(3)})`);g.addColorStop(.45,`rgba(240,120,40,${(0.14*p.f).toFixed(3)})`);g.addColorStop(1,'rgba(200,90,30,0)');ctx.fillStyle=g;ctx.fillRect(-R,-R,R*2,R*2);ctx.restore()}
  ctx.restore();
  /* every fighter and beast keeps a soft warm light behind it, so dark minis never sink into the night sand */
  ctx.save();ctx.globalCompositeOperation='screen';
  const lit=[];if(typeof DRAW_EMPTY==='undefined'||!DRAW_EMPTY){for(const p of S.players)if(p.alive&&!p.exited&&!p.underground)lit.push([p.r,p.c,1]);for(const n of S.npcs||[])if(n.alive&&!n.out)lit.push([n.r,n.c,0.8])}
  for(const [r,c,k] of lit){const m=center(r,c);const cy=m.y-TW*0.32,R=TW*0.62;const g=ctx.createRadialGradient(m.x,cy,0,m.x,cy,R);
    g.addColorStop(0,`rgba(255,214,160,${(0.22*k).toFixed(2)})`);g.addColorStop(.6,`rgba(255,190,130,${(0.09*k).toFixed(2)})`);g.addColorStop(1,'rgba(255,170,110,0)');ctx.fillStyle=g;ctx.fillRect(m.x-R,cy-R,R*2,R*2)}
  ctx.restore();
  /* the lights themselves, on the stands' edge (back to front) */
  const boxes=[];
  for(const p of pts.slice().sort((a,b)=>a.y-b.y)){const sway=fl?Math.sin(t*5.1+p.i*2.3)*TW*0.012:0;const x=p.x,y=p.y;
    ctx.save();ctx.fillStyle='rgba(0,0,0,.35)';ell(x,y,TW*0.12,TW*0.05);ctx.fill();
    let top;
    if(p.k==='b'){/* a bronze tripod brazier */const bh=TW*0.2,bw=TW*0.14;ctx.strokeStyle='#3a2a18';ctx.lineWidth=Math.max(1,TW*0.022);
      for(const dx of [-0.09,0,0.09]){ctx.beginPath();ctx.moveTo(x+dx*TW,y+(dx?0:TW*0.012));ctx.lineTo(x+dx*TW*0.35,y-bh);ctx.stroke()}
      const bg=ctx.createLinearGradient(x-bw,0,x+bw,0);bg.addColorStop(0,'#5a3c1c');bg.addColorStop(.4,'#b8853e');bg.addColorStop(1,'#4a3016');ctx.fillStyle=bg;
      ctx.beginPath();ctx.moveTo(x-bw,y-bh);ctx.quadraticCurveTo(x,y-bh+TW*0.11,x+bw,y-bh);ctx.closePath();ctx.fill();ctx.fillStyle='#2a1a0c';ell(x,y-bh,bw,TW*0.03);ctx.fill();
      night91Fire(x,y-bh,TW*0.24,TW*0.095,p.f,sway);top=y-bh-TW*0.24*1.06}
    else{/* a torch on a post */const ph=TW*0.28;ctx.fillStyle='#4a3420';ctx.fillRect(x-TW*0.018,y-ph,TW*0.036,ph);ctx.fillStyle='#2a1c10';ctx.beginPath();ctx.moveTo(x-TW*0.045,y-ph);ctx.lineTo(x+TW*0.045,y-ph);ctx.lineTo(x+TW*0.025,y-ph+TW*0.05);ctx.lineTo(x-TW*0.025,y-ph+TW*0.05);ctx.closePath();ctx.fill();
      night91Fire(x,y-ph,TW*0.18,TW*0.06,p.f,sway);top=y-ph-TW*0.18*1.06}
    /* a small halo round the fire */
    ctx.globalCompositeOperation='lighter';const hy=(top+y)/2-TW*0.12,hr=TW*0.42*p.f;const hg=ctx.createRadialGradient(x,hy,0,x,hy,hr);hg.addColorStop(0,'rgba(255,170,70,.3)');hg.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=hg;ctx.fillRect(x-hr,hy-hr,hr*2,hr*2);
    ctx.restore();const hw=p.k==='b'?TW*0.14:TW*0.07;boxes.push({k:p.k,x0:x-hw,x1:x+hw,y0:top,y1:y+TW*0.05})}
  NIGHT91.torches=boxes}catch(e){console.error(e)}}
/* the warm rim light: fighters and beasts are drawn with a soft warm glow round their silhouette at night */
function night91Rim(fn,self,args,k){if(!night91On()||(typeof lite84On==='function'&&lite84On()))return fn.apply(self,args);ctx.save();ctx.shadowColor=`rgba(255,196,128,${k})`;ctx.shadowBlur=Math.max(3,TW*0.09);ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
  try{return fn.apply(self,args)}finally{ctx.restore()}}
{const base=drawPlayer;drawPlayer=function(){return night91Rim(base,this,arguments,0.85)}}
{const base=drawNPC;drawNPC=function(){return night91Rim(base,this,arguments,0.7)}}
/* the flames flicker: a light redraw only while a night event shows and nothing else is animating the board */
setInterval(()=>{try{if(HEADLESS||document.hidden||(typeof PERF92!=='undefined'&&PERF92.idle)||!night91On()||!night91Flick())return;
  const mm=document.getElementById('mainMenu');if(mm&&!mm.hidden)return;if(typeof CITY!=='undefined'&&CITY&&CITY.open)return;
  if(typeof cv==='undefined'||!cv||!cv.offsetParent)return;
  if(typeof fxRAF!=='undefined'&&fxRAF)return;if(typeof ANIM_RAF!=='undefined'&&ANIM_RAF)return;if(typeof LIFE84_RAF!=='undefined'&&LIFE84_RAF)return;
  if(S&&S.snap&&!S.over)return;draw()}catch(e){}},110);

/* ---------- the city square at dusk (before the night bout) ---------- */
function dusk91City(){try{if(typeof CITY==='undefined'||!CITY||!CITY.mgr)return false;const w=CITY.w||(typeof W_==='function'?W_():null);const n=w&&w.night;
  if(!n||n.bye||!n.bouts||n.bouts.length<2)return false;if(n.loc!=null&&CITY.li!=null&&n.loc!==CITY.li)return false;return !!(n.bouts[0].done&&!n.bouts[1].done)}catch(e){return false}}
/* the lamps of the square: ground tiles (r,c) near the landmarks */
const DUSK91_LAMPS=[[3.6,5.5],[3.6,9],[7.4,4],[7.4,8.4],[10.4,4],[10.4,8.4],[12.6,10.2],[15.4,4.6],[15.4,9.4],[9.6,12.4],[3.4,12.4],[16.4,14.4]];
function dusk91Apply(K){const dpr=CITY.dpr||1,T=CITY.TW;
  const dev=(cv0,fn)=>{const g=cv0.getContext('2d');g.save();g.setTransform(1,0,0,1,0,0);fn(g,cv0.width,cv0.height);g.restore()};
  const yH=(K.yH||CITY.OY)*dpr;
  /* the ground layer: dusk sky over the panorama, the square in the blue hour */
  dev(K.bg,(g,w,h)=>{g.globalCompositeOperation='multiply';const lg=g.createLinearGradient(0,0,0,h);const hz=Math.max(0.05,Math.min(0.9,yH/h));
    lg.addColorStop(0,'#3e3a78');lg.addColorStop(Math.max(0.02,hz*0.6),'#9a6a9a');lg.addColorStop(hz,'#f0a87a');lg.addColorStop(Math.min(0.98,hz+0.08),'#8a7aa8');lg.addColorStop(1,'#6a6494');g.fillStyle=lg;g.fillRect(0,0,w,h);
    g.globalCompositeOperation='screen';const hg=g.createLinearGradient(0,Math.max(0,yH-h*0.18),0,yH+h*0.04);hg.addColorStop(0,'rgba(255,140,80,0)');hg.addColorStop(.8,'rgba(255,150,90,.28)');hg.addColorStop(1,'rgba(255,150,90,0)');g.fillStyle=hg;g.fillRect(0,0,w,h);
    g.globalCompositeOperation='source-over';let q=4242;const rn=()=>{q=(q*1103515245+12345)&0x7fffffff;return q/0x7fffffff};
    for(let i=0;i<40;i++){const x=rn()*w,y=rn()*yH*0.55;g.fillStyle=`rgba(255,250,235,${(0.25+rn()*0.5).toFixed(2)})`;g.beginPath();g.arc(x,y,(0.5+rn()*0.8)*dpr,0,Math.PI*2);g.fill()}
    const mx=w*0.86,my=Math.max(20*dpr,yH*0.22),mr=Math.max(8,T*0.32)*dpr;g.fillStyle='rgba(250,245,225,.9)';g.beginPath();g.arc(mx,my,mr,0,Math.PI*2);g.fill();g.fillStyle='rgba(70,60,110,.95)';g.beginPath();g.arc(mx+mr*0.45,my-mr*0.15,mr*0.9,0,Math.PI*2);g.fill()});
  /* every building and the front layer: the blue hour */
  const tint=cv0=>dev(cv0,(g,w,h)=>{g.globalCompositeOperation='source-atop';g.fillStyle='rgba(46,34,86,.34)';g.fillRect(0,0,w,h)});
  if(K.arena&&K.arena.cv)tint(K.arena.cv);for(const k in K.sprites||{})if(K.sprites[k]&&K.sprites[k].cv)tint(K.sprites[k].cv);if(K.fg)tint(K.fg);
  /* the arena's gate lit for the night bout */
  if(K.arena&&K.arena.cv&&typeof CITY_GATE!=='undefined'){const p=P89(CITY_GATE[0],CITY_GATE[1],0.7);dev(K.arena.cv,g=>{g.globalCompositeOperation='lighter';const x=(p.x-K.arena.x)*dpr,y=(p.y-K.arena.y)*dpr,r=T*1.6*dpr;
    const rg=g.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,'rgba(255,170,80,.45)');rg.addColorStop(1,'rgba(255,120,40,0)');g.fillStyle=rg;g.fillRect(x-r,y-r,r*2,r*2)})}
  /* the lamps: warm pools on the paving, a post and its flame */
  dev(K.bg,g=>{g.setTransform(dpr,0,0,dpr,0,0);
    for(const [r,c] of DUSK91_LAMPS){const p=P89(r,c,0);g.save();g.globalCompositeOperation='lighter';g.translate(p.x,p.y);g.scale(1,0.5);const R=T*1.7;const rg=g.createRadialGradient(0,0,0,0,0,R);
      rg.addColorStop(0,'rgba(255,160,70,.56)');rg.addColorStop(.5,'rgba(240,120,50,.2)');rg.addColorStop(1,'rgba(200,90,30,0)');g.fillStyle=rg;g.fillRect(-R,-R,R*2,R*2);g.restore();
      const ph=T*0.62;g.fillStyle='rgba(20,12,6,.4)';g.beginPath();g.ellipse(p.x,p.y,T*0.09,T*0.035,0,0,Math.PI*2);g.fill();g.fillStyle='#3a2a1a';g.fillRect(p.x-T*0.02,p.y-ph,T*0.04,ph);
      g.fillStyle='#2a1c10';g.fillRect(p.x-T*0.06,p.y-ph-T*0.02,T*0.12,T*0.03);
      for(const [k,col] of [[1,'rgba(255,130,40,.95)'],[0.62,'rgba(255,214,120,.95)'],[0.32,'rgba(255,248,215,1)']]){const hh=T*0.2*k,ww=T*0.06*k,y0=p.y-ph-T*0.02;g.fillStyle=col;g.beginPath();g.moveTo(p.x-ww,y0);g.quadraticCurveTo(p.x-ww,y0-hh*0.6,p.x,y0-hh);g.quadraticCurveTo(p.x+ww,y0-hh*0.6,p.x+ww,y0);g.closePath();g.fill()}
      g.globalCompositeOperation='lighter';const hy=p.y-ph-T*0.08,hr=T*0.5;const hg=g.createRadialGradient(p.x,hy,0,p.x,hy,hr);hg.addColorStop(0,'rgba(255,180,90,.35)');hg.addColorStop(1,'rgba(255,120,40,0)');g.fillStyle=hg;g.fillRect(p.x-hr,hy-hr,hr*2,hr*2);g.globalCompositeOperation='source-over'}})}
if(typeof bake89==='function'&&typeof CB89!=='undefined'){const base=bake89;bake89=function(){const d=dusk91City();if(!!CB89.dusk91!==d)CB89.key=null;const K=base.apply(this,arguments);
  try{const tag=(K&&K.key)+'|'+d;if(K&&K.d91!==tag){if(d)dusk91Apply(K);K.d91=tag}CB89.dusk91=d;if(typeof CITY!=='undefined'&&CITY)CITY.dusk91=d}catch(e){console.error(e)}return K}}

(()=>{const st=document.createElement('style');st.textContent=`
.nt91{display:inline-block;margin-right:4px;padding:0 6px;border-radius:9px;border:1px solid #6a78b8;background:#1c2244;color:#cfd8ff;font-size:12px;white-space:nowrap}
.nt91o select,.nt91r select{margin-left:4px}`;document.head.appendChild(st)})();
