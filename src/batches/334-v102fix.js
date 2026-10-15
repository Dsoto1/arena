/* =====================================================================
   334-v102fix — v1.02 workstream C · UI FIXES (his v1.01 notes 2026-10-14; tools/plans/v102/NOTES.md "## C"). Wrappers + CSS; the small direct edits
   are in 307 (E1) and 321 (G6: a base-less cell is drawn T lower). Display only: rules, dice, S, the log and the online hash are untouched.
   Kill switch localStorage flavius_v102coff=1 (every wrapper and the style sheet stand down; E1's normalising stays — it only prevents a crash).
   • O1  Online "🏆 Season" banner: the wrapper div was class "sb100" = 300's sandstone BUTTON class (a 46 px slab, centred, brown text): renamed
         sb102 and laid out properly (title + season arrows on one row, text in readable cream on the dark panel, table rows spaced).
   • O5  "✖ Leave the Online arena" (#mClose.saveq) and the in-match bar's #btnOnlLeave = sandstone slabs (306's sd100CSS; Abandon = carbon).
   • G7  armor pictures (cardHTML 'a:' = a square cell) never stretch: after every Online redraw a box that is not square shrinks to its short side
         (auction lots, Domus / Armory / market tiles).
   • E1  307's online adapter (tit100OnlD): ONL82.dg.glads / trophies may be an object, missing or not iterable → Array / Object.values / [].
   • P1  the "ⓘ How the Blessings bag works" line under the Play Now options is gone.
   • P3  Play Now → 📅 Challenges opens as a card OVER the Play Now page (#dc102); ✕ / Back / Esc return to it (the setup window never closes).
         Opened from the Play Now submenu it keeps 310's window (its Back goes to the menu).
   • P4  the Challenges window is only as large as its content (the old wide, tall frame left a blank band).
   • S1  Studio: a designer's own redraw (wireStudio's redraw = #studio.innerHTML) is followed at once — in the same task, before paint — by the tidy
         passes (setGridify, st77Tidy, st98Apply) instead of 30 ms later, so hidden sections / tabs never flash.
   • S2  the same pass fills the rail counts (.st77c) before paint — no flicker of "Classes 3".
   • S3  class designer: the Ability select is titled "Extra"; the "Ability name" text box is gone.
   • S5  Names → ✎ Use opens the character designer on its first (Basics) tab (DF99.jump).
   • S6  character designer: "↺ Start a fresh one" removed.
   • S7  "✖ Exit Creator Studio" = sandstone (same rule as O5).
   • G1  Manager "Manage / Load saves" view + G2 📜 Saves window (108 savesHub76): sandstone buttons, carved card rows.
   • G4  ONE stone ✕ (300's round stud) on every window's #mClose (the labelled closers — Studio / Online / Annals / Manager — are sandstone slabs).
   • G5  coin and the trophy fly to their counters like CF (addTrophy wrapper; 277's h100Fly for the coin, a trophy cup for the Trophies stat).
   • G6  "Show token bases" off also for BEAST tokens (312's sheets: the oval base is flooded away, every model drawn down onto the tile floor);
         gladiator minis / rig figures too (321 shifts a base-less cell down by the base thickness).
   Test tv102c.
   ===================================================================== */
window.V102C_OFF=(()=>{try{return localStorage.getItem('flavius_v102coff')==='1'}catch(e){return false}})();
const V102C={off:window.V102C_OFF};

/* ---------- O1 · the Season banner (the wrapper's class collided with 300's .sb100 sandstone button) ---------- */
if(!V102C.off&&typeof b100SeasonHTML==='function'){const base=b100SeasonHTML;b100SeasonHTML=function(){let h=base.apply(this,arguments);try{if(typeof h==='string')h=h.replace('<div class="sb100">','<div class="sb102">')}catch(e){}return h}}

/* ---------- P1 · no "How the Blessings bag works" ---------- */
if(!V102C.off&&typeof optionsHTML==='function'){const base=optionsHTML;optionsHTML=function(){let h=base.apply(this,arguments);try{if(typeof h==='string')h=h.replace(/<p class="rc-sub" style="margin-top:6px"><span class="qi" data-tip="[^"]*">[^<]*<\/span><\/p>/,'')}catch(e){}return h}}

/* ---------- G7 · armor art keeps its aspect ---------- */
function g7Fit(root){try{const R=root||document.getElementById('onl');if(!R)return;
  for(const e of R.querySelectorAll('.cimg[data-card^="a:"]')){const r=e.getBoundingClientRect();if(r.width<4||r.height<4)continue;
    const k=r.width/r.height;if(Math.abs(k-1)<0.04)continue;const s=Math.round(Math.min(r.width,r.height));
    for(const [p,v] of [['width',s+'px'],['height',s+'px'],['max-width',s+'px'],['max-height',s+'px'],['margin','auto']])e.style.setProperty(p,v,'important');e.dataset.g7='1'}}catch(err){console.error(err)}}
if(!V102C.off&&typeof onlRedraw==='function'){const base=onlRedraw;onlRedraw=function(){const r=base.apply(this,arguments);try{g7Fit();setTimeout(g7Fit,120)}catch(e){}return r}}

/* ---------- P3 / P4 · Challenges ---------- */
function dc102Open(){if(document.getElementById('dc102')||typeof dc100HTML!=='function')return;
  const bg=document.createElement('div');bg.id='dc102';bg.className='dc102bg';bg.setAttribute('role','dialog');bg.setAttribute('aria-modal','true');bg.setAttribute('aria-label',_T('📅 Challenges'));
  bg.innerHTML=`<div class="dc102box"><button type="button" class="dc102x" aria-label="${_T('Close')}">×</button><h2>${_T('📅 Challenges')}</h2>${dc100HTML()}<div class="dc102ft"><button type="button" class="btn dc102back">${_T('Back')}</button></div></div>`;
  const kd=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close()}};
  const close=()=>{bg.remove();document.removeEventListener('keydown',kd,true);try{const pn=document.querySelector('#modal [data-dc100pn]');if(pn&&pn.focus)pn.focus()}catch(e){}};
  bg.addEventListener('click',e=>{const t=e.target;if(t===bg||t.closest('.dc102x,.dc102back')){close();return}
    const g=t.closest('[data-dc100go]');if(!g||g.disabled)return;const kind=g.dataset.dc100go==='w'?'w':'d';close();
    try{if(CUR_MODAL)CUR_MODAL.done(null)}catch(err){}
    setTimeout(()=>{try{const m=document.getElementById('mainMenu');if(m&&!m.hidden&&typeof menuHide==='function')menuHide()}catch(err){}dc100Begin(dc100Spec(kind,dc100Key(kind)))},80)});
  document.addEventListener('keydown',kd,true);document.body.appendChild(bg);
  const f=bg.querySelector('.dc102back');if(f&&f.focus)f.focus()}
if(!V102C.off){
  window.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-dc100pn]');if(!b||typeof DC100==='undefined'||DC100.off)return;
    const m=b.closest('#modal');if(!m||m.hidden||!CUR_MODAL)return;if(!b.closest('#mBody'))return;
    e.preventDefault();e.stopPropagation();dc102Open()},true);
  if(typeof modal==='function'){const base=modal;modal=function(title,body,buttons,opt){
    try{if(title===_T('📅 Challenges')&&opt&&opt.wide)opt=Object.assign({},opt,{wide:0})}catch(e){}
    return base.call(this,title,body,buttons,opt)}}}

/* ---------- S1 / S2 / S3 / S5 / S6 · the Studio ---------- */
const G102={mo:null,el:null,busy:false};
function g102Tweak(){const st=document.getElementById('studio');if(!st||typeof ST==='undefined')return;
  if(ST.tab==='classes'){
    const t=st.querySelector('input[data-f="abilText"]');if(t){const l=t.closest('label');if(l)l.remove()}
    const s=st.querySelector('select[data-f="abil"]');if(s){const l=s.closest('label');const tn=l&&[...l.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());if(tn&&tn.textContent.trim()!==_T('Extra'))tn.textContent=_T('Extra')}}
  if(ST.tab==='chars')for(const b of st.querySelectorAll('button[data-st="cancel"]'))b.remove()}
function g102Sync(){if(G102.busy)return;G102.busy=true;
  try{if(typeof setGridify==='function')setGridify()}catch(e){console.error(e)}
  try{if(typeof st77Tidy==='function')st77Tidy()}catch(e){console.error(e)}
  try{if(typeof st98Apply==='function')st98Apply()}catch(e){console.error(e)}
  try{g102Tweak()}catch(e){console.error(e)}
  finally{if(G102.mo)G102.mo.takeRecords();G102.busy=false}}
function g102Bind(){const st=document.getElementById('studio');if(!st||G102.el===st)return;G102.el=st;if(G102.mo)G102.mo.disconnect();
  G102.mo=new MutationObserver(()=>{if(!G102.busy)g102Sync()});G102.mo.observe(st,{childList:true});g102Sync()}
if(!V102C.off&&typeof wireStudio==='function'){const base=wireStudio;wireStudio=function(){const r=base.apply(this,arguments);try{g102Bind()}catch(e){console.error(e)}return r}}
if(!V102C.off&&typeof studioRedraw==='function'){const base=studioRedraw;studioRedraw=function(){const r=base.apply(this,arguments);try{g102Bind();g102Sync()}catch(e){console.error(e)}return r}}
if(!V102C.off)window.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-nm77use]');if(b&&typeof DF99!=='undefined')DF99.jump=Date.now()},true);

/* ---------- G5 · coin + trophy fly to their counters ---------- */
function g5Trophy(r,c){try{const tgt=document.querySelector('#board .econ [data-act="trophies"]');if(!tgt||typeof cv==='undefined'||typeof h100Anim!=='function'||!h100Anim()||typeof tgt.animate!=='function')return;
  const cr=cv.getBoundingClientRect(),m=center(r,c);const sx=cr.left+m.x*(cr.width/(cv.clientWidth||cr.width)),sy=cr.top+(m.y-TW*0.9)*(cr.height/(cv.clientHeight||cr.height));
  const tr=tgt.getBoundingClientRect();const tx=tr.left+Math.min(28,tr.width/2),ty=tr.top+tr.height/2;
  const el=document.createElement('div');el.className='h100fly trophy';el.setAttribute('aria-hidden','true');
  el.innerHTML='<svg viewBox="0 0 24 24"><path d="M6 3h12v3a6 6 0 01-4 5.6V14h2.5l.5 3H7l.5-3H10v-2.4A6 6 0 016 6zM3 5h3v2a3 3 0 01-3-2zM18 5h3a3 3 0 01-3 2zM8 18h8v3H8z" fill="#f0cf7d" stroke="#6b4e1b" stroke-width="1" stroke-linejoin="round"/></svg>';
  el.style.left=Math.round(sx-14)+'px';el.style.top=Math.round(sy-14)+'px';document.body.appendChild(el);
  const dx=tx-sx,dy=ty-sy;const a=el.animate([{transform:'translate(0,0) scale(.8)',opacity:0},{transform:`translate(${dx*0.3}px,${dy*0.3-50}px) scale(1.25)`,opacity:1,offset:0.35},{transform:`translate(${dx}px,${dy}px) scale(.7)`,opacity:.9}],{duration:typeof SETTINGS!=='undefined'&&SETTINGS.anim88==='quick'?420:720,easing:'cubic-bezier(.3,.7,.4,1)'}); /* i18n:skip */
  const pulse=()=>{tgt.classList.remove('pulse95');void tgt.offsetWidth;tgt.classList.add('pulse95');setTimeout(()=>tgt.classList.remove('pulse95'),1400)};
  a.onfinish=()=>{el.remove();pulse()};a.oncancel=()=>el.remove();setTimeout(()=>el.remove(),1800)}catch(e){console.error(e)}}
if(!V102C.off&&typeof addTrophy==='function'){const base=addTrophy;addTrophy=function(player,name,kind,coin,cf,pk){const r=base.apply(this,arguments);
  try{if(typeof HEADLESS==='undefined'||!HEADLESS){if(typeof h100Live==='function'&&h100Live()&&typeof h100Fast==='function'&&!h100Fast()&&typeof h100Shown==='function'&&player===h100Shown()&&player.alive!==false){
    V102C.lastTrophy={r:player.r,c:player.c,coin:+coin||0,cf:+cf||0};
    requestAnimationFrame(()=>{if(+coin>0&&typeof h100Fly==='function')h100Fly('coin',player.r,player.c,true);setTimeout(()=>g5Trophy(player.r,player.c),160)})}}}catch(e){console.error(e)}
  return r}}

/* ---------- G6 · token bases off for beasts (312 sheets) ---------- */
const G6={cache:new Map(),pal:{},max:160,read:null,stats:{proc:0,hit:0,fail:0}};
const g6Mode=()=>{try{return !V102C.off&&typeof bs101Mode==='function'&&bs101Mode()===2}catch(e){return false}};
function g6Readable(im){if(G6.read!=null)return G6.read;try{const c=document.createElement('canvas');c.width=c.height=2;const g=c.getContext('2d');g.drawImage(im,0,0,2,2);g.getImageData(0,0,1,1);G6.read=true}catch(e){G6.read=false}return G6.read}
/* the base's oval as the camera sees it (ground ellipse a×b turned to the facing, squeezed to half height) — fitted on the sheets: turn = 90° − yaw */
function g6Geom(M,face){const yaw=(typeof MINI_YAW!=='undefined'?MINI_YAW[face]:0)||0,phi=(90-yaw)*Math.PI/180,a=M.base[0]/2*M.px+2.5,b=M.base[1]/2*M.px+2.5,c=Math.cos(phi),s=Math.sin(phi);
  /* A = diag(1,.5)·R·diag(a,b); inverse for the inside test */
  const A=[[c*a,-s*b],[0.5*s*a,0.5*c*b]],det=A[0][0]*A[1][1]-A[0][1]*A[1][0];
  return {A,inv:[[A[1][1]/det,-A[0][1]/det],[-A[1][0]/det,A[0][0]/det]],T:BST100_BASE_MM*M.px+2}}
function g6Proc(im,M,me,face,row){
  const key=im.src.slice(-70)+'|'+face+'|'+row;let c=G6.cache.get(key);if(c!==undefined){G6.stats.hit++;return c}
  c=null;try{const W=me[0],H=me[1],cx=me[2],cy=me[3];const src=document.createElement('canvas');src.width=W;src.height=H;const sg=src.getContext('2d');sg.drawImage(im,face*W,row*H,W,H,0,0,W,H);
    const id=sg.getImageData(0,0,W,H),d=id.data,G=g6Geom(M,face),T=G.T;
    const q=(dx,dy)=>{const u=G.inv[0][0]*dx+G.inv[0][1]*dy,v=G.inv[1][0]*dx+G.inv[1][1]*dy;return u*u+v*v};
    const inTop=(x,y,m)=>q(x+0.5-cx,y+0.5-cy)<=(1+m)*(1+m);
    const inAll=(x,y,m)=>{const dx=x+0.5-cx,dy=y+0.5-cy,k=(1+m)*(1+m);return q(dx,dy)<=k||q(dx,dy-T)<=k||q(dx,dy-T/2)<=k};
    const top=[],wall=[];const smp=(L,x,y)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=W||y>=H)return;const i=(y*W+x)*4;if(d[i+3]>200)L.push([d[i],d[i+1],d[i+2]])};
    const pt=(t,k,oy)=>{const A=G.A;/* a point on the unit circle → screen */
      return [cx+k*(A[0][0]*Math.cos(t)+A[0][1]*Math.sin(t)),cy+oy+k*(A[1][0]*Math.cos(t)+A[1][1]*Math.sin(t))]};
    /* wall / rim samples only where the empty background lies just outside (the beast never covers those) */
    const out=(p,q)=>{const vx=p[0]-cx,vy=p[1]-(cy+q),l=Math.hypot(vx,vy)||1,X=Math.round(p[0]+vx/l*3),Y=Math.round(p[1]+vy/l*3);return X<0||Y<0||X>=W||Y>=H||d[(Y*W+X)*4+3]<30};
    /* the wall / rim: walk IN from the empty background along the oval's normal to the first solid pixel and take the one just inside it (the figure scale / sheet may move the oval by a pixel or two, so no fixed ring radius) */
    const solid=(x,y)=>{x=Math.round(x);y=Math.round(y);return x>=0&&y>=0&&x<W&&y<H&&d[(y*W+x)*4+3]>200};
    const empty=(x,y)=>{x=Math.round(x);y=Math.round(y);return x<0||y<0||x>=W||y>=H||d[(y*W+x)*4+3]<30};
    const edgeIn=(t,oy)=>{let q=pt(t,1.25,oy);if(!empty(q[0],q[1]))return null;for(let k=1.25;k>=0.75;k-=0.01){q=pt(t,k,oy);if(solid(q[0],q[1])){const n=pt(t,k-0.03,oy);return solid(n[0],n[1])?n:null}}return null};
    for(let i=0;i<24;i++){const t=i*Math.PI/12;let p=pt(t,0.9,0);smp(top,p[0],p[1]);p=edgeIn(t,T*0.55);if(p)smp(wall,p[0],p[1]);p=edgeIn(t,0);if(p)smp(wall,p[0],p[1])}
    const med=L=>{const m=[0,1,2].map(ch=>L.map(p=>p[ch]).sort((a,b)=>a-b)[L.length>>1]);return L.filter(p=>(p[0]-m[0])**2+(p[1]-m[1])**2+(p[2]-m[2])**2<=60*60)};
    const topG=top.filter(p=>Math.max(p[0],p[1],p[2])-Math.min(p[0],p[1],p[2])<=56&&(p[0]*3+p[1]*6+p[2])/10>=95);const tp=topG.length>=3?med(topG):[],wl=wall.length>=3?med(wall):[];
    /* the colours learned on this sheet's other cells back this one up (the base's wood and rim are the same in every cell) */
    const P=G6.pal[im.src]||(G6.pal[im.src]={tp:[],wl:[]});for(const p of tp.slice(0,5))if(P.tp.length<40)P.tp.push(p);for(const p of wl.slice(0,5))if(P.wl.length<40)P.wl.push(p);
    const tpu=tp.length>=4?tp:P.tp.slice(0,30),wlu=wl.length>=4?wl:P.wl.slice(0,30);
    G6.dbg={k:key,tp:tp.slice(0,6),wl:wl.slice(0,6),nt:top.length,nw:wall.length};
    if(tpu.length+wlu.length<6){G.fail=1;G6.cache.set(key,null);G6.stats.fail++;return null}
    const tT=60*60,tW=20*20;
    /* the top surface is a low-saturation wood (fur / feet are not): colour AND saturation decide there; the wall + rim only below / around it */
    const near=(i,inT)=>{if(inT&&(Math.max(d[i],d[i+1],d[i+2])-Math.min(d[i],d[i+1],d[i+2])>56||(d[i]*3+d[i+1]*6+d[i+2])/10<95))return false;const S=inT?tpu:wlu;for(const p of S){const a=d[i]-p[0],b=d[i+1]-p[1],e=d[i+2]-p[2];if(a*a+b*b+e*e<=(inT?tT:tW))return true}return false};
    const ryS=Math.hypot(G.A[1][0],G.A[1][1]);
    /* the wall / rim colours count in front of the top surface, and behind it only where the rim borders the empty background (a rim line inside the beast's body stays) */
    const nearAny=(i,x,y)=>{if(inTop(x,y,-0.02))return near(i,true);const dy=y+0.5-cy;
      if(dy<-0.25*ryS){const dx=x+0.5-cx,l=Math.hypot(dx,dy)||1,X=Math.round(x+dx/l*3),Y=Math.round(y+dy/l*3);if(X>=0&&Y>=0&&X<W&&Y<H&&d[(Y*W+X)*4+3]>=30)return false}
      return near(i,false)};
    const seen=new Uint8Array(W*H),st=[];
    const x0=Math.max(0,Math.floor(cx-M.base[0]*M.px*0.6-6)),x1=Math.min(W,Math.ceil(cx+M.base[0]*M.px*0.6+6)),y0=Math.max(0,Math.floor(cy-M.base[0]*M.px*0.45)),y1=Math.min(H,Math.ceil(cy+T+M.base[0]*M.px*0.45));
    const edge=(x,y)=>{for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+a,Y=y+b;if(X<0||Y<0||X>=W||Y>=H)return true;if(!inAll(X,Y,0.03)||d[(Y*W+X)*4+3]<30)return true}return false};
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){if(!inAll(x,y,0.03))continue;const i=(y*W+x)*4;if(d[i+3]<30||!nearAny(i,x,y))continue;
      if(!edge(x,y))continue;seen[y*W+x]=1;st.push(x,y)}
    let removed=0;while(st.length){const y=st.pop(),x=st.pop();d[(y*W+x)*4+3]=0;removed++;
      for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+a,Y=y+b;if(X<x0||Y<y0||X>=x1||Y>=y1||seen[Y*W+X])continue;if(!inAll(X,Y,0.03))continue;const i=(Y*W+X)*4;if(d[i+3]<30||!nearAny(i,X,Y))continue;seen[Y*W+X]=1;st.push(X,Y)}}
    const area=Math.PI*(M.base[0]/2*M.px)*(M.base[1]/2*M.px)*0.5+(M.base[0]*M.px)*T;
    if(!removed||removed>area*1.35){G6.cache.set(key,null);G6.stats.fail++;return null}
    /* pockets of the top surface the flood could not reach (between the legs): the same wood colour, no connection needed */
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*W+x)*4;if(d[i+3]<30||!inTop(x,y,-0.03))continue;if(near(i,true)){d[i+3]=0;removed++}}
    for(let pass=0;pass<3;pass++){const kill=[];for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*W+x)*4;if(d[i+3]<30||!inAll(x,y,0.06)||(inAll(x,y,-0.14)&&inTop(x,y,-0.14)))continue;
        let t=false;for(let a=-1;a<=1&&!t;a++)for(let b=-1;b<=1;b++){if(!a&&!b)continue;const X=x+a,Y=y+b;if(X<0||Y<0||X>=W||Y>=H||d[(Y*W+X)*4+3]<30){t=true;break}}if(t)kill.push(i)}
      for(const i of kill)d[i+3]=0}
    c=document.createElement('canvas');c.width=W;c.height=H;c.getContext('2d').putImageData(id,0,0);G6.stats.proc++}catch(e){c=null;G6.stats.fail++}
  G6.cache.set(key,c);if(G6.cache.size>G6.max)G6.cache.delete(G6.cache.keys().next().value);return c}
function g6Scaled(pc,me,s,face,row,key){const q=Math.round(Math.log(s)*33),sq=Math.exp(q/33);const k=key+'|s'+q;let c=G6.cache.get(k);if(c)return c;
  const w=Math.max(1,Math.round(me[0]*sq)),h=Math.max(1,Math.round(me[1]*sq));c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(pc,0,0,me[0],me[1],0,0,w,h);
  G6.cache.set(k,c);if(G6.cache.size>G6.max)G6.cache.delete(G6.cache.keys().next().value);return c}
if(!V102C.off&&typeof bst100Cell==='function'){const base=bst100Cell;bst100Cell=function(k,face,pose,x,y,opt){
  if(!g6Mode())return base.apply(this,arguments);
  try{const M=BEAST100_META[k];if(!M||!M.base)return base.apply(this,arguments);
    let im=null,me=null,row=-1;if(pose.act){im=bst100Img(k,1);if(im){me=M.aw;row=M.ar.indexOf(pose.name)}}
    if(!im||row<0){im=bst100Img(k,0);if(!im)return base.apply(this,arguments);me=M.iw;row=M.ir.indexOf(pose.name);if(row<0)row=Math.max(0,M.ir.indexOf('idle0'))}
    if(!g6Readable(im))return base.apply(this,arguments);
    const f=face||0,pc=g6Proc(im,M,me,f,row);if(!pc)return base.apply(this,arguments);
    const s=bst100Scale(M),cc=g6Scaled(pc,me,s,f,row,im.src.slice(-70)+'|'+f+'|'+row);
    ctx.save();if(opt&&opt.dim)ctx.globalAlpha*=opt.dim;if(opt&&opt.alpha!=null)ctx.globalAlpha*=opt.alpha;if(opt&&opt.filter)ctx.filter=opt.filter;
    if(!(typeof sh103Blit==='function'&&sh103Blit(cc,x-me[2]*s,y-me[3]*s,me[0]*s,me[1]*s,x,y)))ctx.drawImage(cc,x-me[2]*s,y-me[3]*s,me[0]*s,me[1]*s);ctx.restore();   /* v1.03 T6 (346) */
    
    BST100.stats.cells++;return y-M.iw[3]*s}catch(e){console.error(e);return base.apply(this,arguments)}}}

/* ---------- the look ---------- */
if(!V102C.off&&typeof sd100CSS==='function'){const st=document.createElement('style');st.id='v102c-css';
  const MV='#mgrBody:is(:has(> .list2 [data-mg="dlcareer"]),:has(> .list2 [data-mg="load"]),:has(> .acts > .upsave))';
  const sd=sd100CSS({pri:[],sec:['#modal #mClose.saveq','#btnOnlLeave:not([data-mode="abandon"])','#dc102 .dc102back','#hub76 .btn:not(.primary):not([role="tab"]):not([data-mdel])','#onl .sb102 .sb100nav .btn',MV+' .btn:not([data-mg="load"]):not([data-mg="delcareer"])'],
      dan:['#btnOnlLeave[data-mode="abandon"]','#hub76 [data-mdel]',MV+' [data-mg="delcareer"]'],m:[]})+
    sd100CSS({pri:['#hub76 .btn.primary',MV+' [data-mg="load"]'],sec:[],dan:[],m:[]});
  st.textContent=sd+`
/* G4 — the round stone stud on every plain #mClose */
#modal:not(.sand100):not(.bf100) #mClose:not(.saveq){color:#4a2e14!important;background:radial-gradient(circle at 40% 35%,#e3cb9f,#b08a58 70%)!important;border:0!important;font-weight:700;
  box-shadow:inset 0 1px 0 rgba(255,244,214,.8),inset 0 -2px 0 rgba(80,52,24,.6),0 2px 0 #5a4024,0 4px 8px rgba(0,0,0,.5)!important;transition:filter .12s,transform .12s}
#modal:not(.sand100):not(.bf100) #mClose:not(.saveq):hover{color:#2a1608!important;filter:brightness(1.08);border:0!important}
#modal:not(.sand100):not(.bf100) #mClose:not(.saveq):active{transform:translateY(1px)}
#modal:not(.sand100):not(.bf100) #mClose:not(.saveq):focus-visible{outline:2px solid #fff2be;outline-offset:2px}
/* the labelled closers + the in-match bar button: compact slabs */
html.sd100on:is(#sd100i,html) #modal #mClose.saveq{--sdh:38px;--sdf:13px;padding:3px 14px;float:right;margin:-6px -8px 0 10px}
html.sd100on:is(#sd100i,html) #btnOnlLeave{--sdh:32px;--sdf:12.5px;padding:2px 12px;min-height:32px}
html.sd100on:is(#sd100i,html) #onl .sb102 .sb100nav .btn{--sdh:32px;--sdf:16px;padding:0 12px;min-width:38px}
/* phones: the Gambit's long 'Fix the bout' line wraps inside its card (it ran 250 px off the window) */
#mgrBody .acts>.btn[data-mg="rig"],#mgrBody .acts>.btn[data-mg="rig"] small{white-space:normal;max-width:100%;box-sizing:border-box;overflow-wrap:anywhere;text-align:left}
/* O1 — the Season banner */
#onl .sb102{display:block;max-width:980px}
#onl .sb102 .onl-lbtop{display:flex;align-items:center;justify-content:space-between;gap:10px 16px;flex-wrap:wrap;margin:0 0 4px}
#onl .sb102 h3{margin:0;color:#f0cf7d;font-size:22px;letter-spacing:.02em}
#onl .sb102 .sb100nav b{color:#f6e7c4;font-size:15px;min-width:76px;text-align:center}
#onl .sb102>p.rc-sub{color:#d8c8a6;font-size:14px;margin:2px 0 10px}
#onl .sb102 .sb100tit{margin:6px 0 12px;padding:8px 10px;border:1px solid rgba(214,171,76,.28);border-radius:8px;background:rgba(0,0,0,.2);gap:8px 12px}
#onl .sb102 .sb100tit>.rc-sub{color:#d9c08a;font:700 11px system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}
#onl .sb102 .sb100t{color:#f0e3c4;font-size:13px;padding:2px 10px;background:rgba(214,171,76,.08)}
#onl .sb102 .sb100me{color:#eadbb8;margin:0 0 10px;font-size:14px}
#onl .sb102 .sb100tb{width:100%;border-collapse:separate;border-spacing:0 3px;color:#eadbb8}
#onl .sb102 .sb100tb th{color:#d9c08a;font:700 11px system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;text-align:left;padding:4px 10px}
#onl .sb102 .sb100tb td{padding:7px 10px;background:rgba(255,255,255,.04);color:#f0e3c4}
#onl .sb102 .sb100tb td:first-child{border-radius:6px 0 0 6px}#onl .sb102 .sb100tb td:last-child{border-radius:0 6px 6px 0;text-align:right}
#onl .sb102 .sb100tb th:last-child{text-align:right}
#onl .sb102 .sb100tb td small{color:#bfae88}
#onl .sb102 .sb100tb a{color:#f0cf7d}
@media (max-width:600px){#onl .sb102 .sb100tb td,#onl .sb102 .sb100tb th{padding:6px 5px;font-size:12.5px}}
/* P3 / P4 — Challenges */
#modal #mboxEl:has(#dc100w){max-width:1040px;width:min(1040px,100%);height:auto!important;min-height:0!important}
.dc102bg{position:fixed;inset:0;z-index:9500;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(8,5,3,.62)}
.dc102box{position:relative;background:var(--panel);border:1px solid var(--gold);border-radius:6px;width:min(1040px,100%);max-height:calc(100% - 8px);overflow:auto;padding:18px 20px 16px;box-shadow:0 20px 60px rgba(0,0,0,.6)}
.dc102box>h2{margin:0 44px 8px 0;font-size:22px;color:var(--gold2)}
.dc102ft{margin-top:12px;display:flex;justify-content:flex-end}
.dc102x{position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:50%;border:0;font-size:20px;line-height:1;font-weight:700;cursor:pointer;color:#4a2e14;background:radial-gradient(circle at 40% 35%,#e3cb9f,#b08a58 70%);box-shadow:inset 0 1px 0 rgba(255,244,214,.8),inset 0 -2px 0 rgba(80,52,24,.6),0 2px 0 #5a4024,0 4px 8px rgba(0,0,0,.5)}
.dc102x:focus-visible{outline:2px solid #fff2be;outline-offset:2px}
html.sd100on:is(#sd100i,html) #dc102 .dc102back{min-width:140px}
/* G1 / G2 — saves */
#hub76 .hub76tabs{margin-bottom:12px}
#hub76 .hub76list{display:grid;gap:10px}
#hub76 .hub76card{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 16px;border:1px solid rgba(214,171,76,.35);border-left:4px solid #c9a44a;border-radius:8px;background:linear-gradient(180deg,rgba(255,236,190,.07),rgba(0,0,0,.18));box-shadow:inset 0 1px 0 rgba(255,244,214,.08),0 2px 6px rgba(0,0,0,.35)}
#hub76 .hub76card b{font:600 18px var(--display);color:#f0cf7d;letter-spacing:.02em}#hub76 .hub76card small{display:block;color:#cdbd9a;margin-top:2px}
#hub76 .list .item{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;margin:0 0 8px;border:1px solid rgba(214,171,76,.3);border-left:4px solid #c9a44a;border-radius:8px;background:linear-gradient(180deg,rgba(255,236,190,.06),rgba(0,0,0,.18))}
#hub76 .list .item em{display:block;font-style:normal;color:#cdbd9a;font-size:12.5px}
#hub76 .mbtns{display:flex;flex-wrap:wrap;gap:10px;margin-top:12px}#hub76 .mbtns .btn{flex:1 1 220px}
html.sd100on:is(#sd100i,html) #hub76 .btn{--sdh:38px;--sdf:14px}
#mgrBody:is(:has(> .list2 [data-mg="dlcareer"]),:has(> .list2 [data-mg="load"]),:has(> .acts > .upsave)) .list2{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:10px}
#mgrBody:is(:has(> .list2 [data-mg="dlcareer"]),:has(> .list2 [data-mg="load"])) .list2 .lrow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border:1px solid rgba(214,171,76,.35);border-left:4px solid #c9a44a;border-radius:8px;background:linear-gradient(180deg,rgba(255,236,190,.07),rgba(0,0,0,.18));box-shadow:inset 0 1px 0 rgba(255,244,214,.08),0 2px 6px rgba(0,0,0,.35)}
#mgrBody:is(:has(> .list2 [data-mg="dlcareer"]),:has(> .list2 [data-mg="load"])) .list2 .lrow .t b{font:600 18px var(--display);color:#f0cf7d}
#mgrBody:is(:has(> .list2 [data-mg="dlcareer"]),:has(> .list2 [data-mg="load"])) .list2 .lrow .a{display:flex;flex-direction:column;gap:8px;flex:none}
#mgrBody:has(> .acts > .upsave) .upsave{cursor:pointer}
html.sd100on:is(#sd100i,html) #mgrBody:is(:has(> .list2 [data-mg="dlcareer"]),:has(> .list2 [data-mg="load"]),:has(> .acts > .upsave)) :is(.acts,.mbtns)>.btn{min-width:220px;flex:none}
#mgrBody:is(:has(> .list2 [data-mg="dlcareer"]),:has(> .list2 [data-mg="load"]),:has(> .acts > .upsave)) > .mbtns{display:flex;gap:10px}
#hub76 .mbtns+p.rc-sub{margin-top:12px}
#mgrBody:is(:has(> .list2 [data-mg="dlcareer"]),:has(> .list2 [data-mg="load"]),:has(> .acts > .upsave)) > .mbtns{margin-top:14px}
/* G5 */
.h100fly.trophy svg{width:24px;height:24px}
`;document.head.appendChild(st)}
