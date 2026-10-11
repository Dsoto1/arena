/* =====================================================================
   277-V100HIT · v1.0 HIT FEEDBACK (his picks 2026-10-11, tools/plans/backlog.md "v1.0 HIT FEEDBACK"). DISPLAY ONLY: nothing here
   writes S, rolls a die or changes a promise the game awaits — the wrappers hand back the base's own return value and watch it from a
   side branch (the 218 pattern), so the dice, the log and the online hash are the same ON and OFF.
   1 AVATAR NUMBERS (Q1b): a hit on a gladiator lands on the fighter-panel avatar over the struck location — grey "−N" for armor AP, red
     "−N" for health, a word when it is severed — then shrinks into the location (98's AVHIT flash and the 90/211 dims and cracks
     stay as they were). The panel PEEKS at your target (boardShown wrapper — display state in H100, never S.boardPid) for
     H100_PEEK ms, then snaps back to yours. A panel you opened on purpose (S.boardPid) is never taken over.
   2 BOARD BODY PIP: beside the struck token a small 6-zone body (head, chest, arms, legs) lights the struck zone (red = health,
     steel = armor only) next to ONE total; drawn on 227's #fx95 overlay over the board, placed with center() so it follows the
     ROT89 turn and the zoom; beasts have no zones (no pip).
   3 ONE ACTION = ONE READOUT: every text float an attack makes (−AP, −HP, blocked, ELIMINATED, the elixir save…) is gathered while
     hurt()/hurtNPC() runs and drawn as ONE line led by the cause icon (his weapon icons WICO75 dmg/abs; ✊ fist, 🐾 beast, 🪨 stone,
     ⚠ the arena): "⚔ 4 → Chest: 2 armor, 2 health". Readouts QUEUE per piece (the next starts as the last fades), never stack.
   4 SAVES / BLOCKS AS WORDS: Missed · Blocked (a fist on armor) · Absorbed N (a shield) · Dodged · Saved (Health Elixir, Fidelis).
   5 OTHERS (Q2b): full readouts for the viewer's gladiator and the target it just attacked; other exchanges = small faded marks.
     SETTINGS.hit100 = 'full' (default) | 'mine' (others: nothing) | 'quiet' (no board readouts; avatar numbers for your own fighter
     only) — Settings → Board & pieces → Hit feedback (set98Pieces wrapper, the 263 pattern).
   6 BETWEEN TURNS (Q3a): hits a human's gladiator takes outside its own turn stay as tick marks on its avatar (avatarSVG wrapper,
     H100.ticks by fighter id) until its turn begins (BUS turn.begin); hover a tick = "Leo: −3 left leg" (98's avPop).
   7 COIN / CF (Q4a): coin and CF floats never pop on the board — the coin / wheat icon flies from the tile to its counter in the
     fighter panel (when that panel shows the gainer) and the counter pulses (227's pulse95). Losses only pulse.
   8 FAST / snap: no pop-ups, no flies, no peek — avatar ticks, the AVHIT flash and the log carry it. Reduce motion / Animations
     Off / effects off (anim95): nothing moves (readouts and avatar numbers stand still, flies become a highlight); SETTINGS.fx off =
     no board readouts. Hot seat: the viewer = boardHome (the human whose turn it is / the last human). Online: the own seat
     (S.onl.seat); watchers and all-CPU tables have no viewer → every exchange is full. HEADLESS / sims: nothing.
   KILL SWITCH localStorage flavius_hit100off=1 → nothing installs (227's floating numbers as before). Test tv100h.
   ===================================================================== */
const H100={off:false,list:[],ctx:[],ticks:{},peek:null,tgt:null,raf:0,painted:false,img:{},n:0,k:1}; /* k: a time stretch for shots/tests */
try{H100.off=localStorage.getItem('flavius_hit100off')==='1'}catch(e){}
const H100_PEEK=1700;   /* TWEAK: ms the panel shows your target before it snaps back */
const H100_DUR=1500;    /* TWEAK: ms a readout stays (Slow ×1.25, Quick animations ×0.7, faded marks ×0.7) */
const H100_TICKS=8;     /* TWEAK: tick marks kept per fighter between its turns */
const H100_AV={head:[75,40],chest:[75,97],rarm:[35,120],larm:[115,120],rleg:[62,238],lleg:[88,238]}; /* avatarSVG zone centres (07-ui parts) */
const h100Mode=()=>{const v=typeof SETTINGS!=='undefined'&&SETTINGS.hit100;return v==='mine'||v==='quiet'?v:'full'};
const h100Fast=()=>typeof SPEED!=='undefined'&&(SPEED==='fast'||SPEED==='snap');
const h100Live=()=>{try{return !H100.off&&!HEADLESS&&!!S&&!S.sim}catch(e){return false}};
const h100Anim=()=>{try{return typeof anim95==='function'?anim95():!(typeof reduceMotion==='function'&&reduceMotion())}catch(e){return true}};
/* h100Viewer — the gladiator this screen plays (null = nobody: all-CPU, watchers) */
function h100Viewer(){try{if(!S||!S.players)return null;if(S.onl){const s=S.onl.seat;return typeof s==='number'&&S.players[s]&&!S.players[s].cpu?S.players[s]:null}
  if(!S.players.some(q=>!q.cpu))return null;const c=typeof cur==='function'?cur():null;return typeof boardHome==='function'?boardHome(c):null}catch(e){return null}}
/* h100Full — does this exchange get the full readout? */
function h100Full(victim,by){const v=h100Viewer();if(!v)return true;if(victim===v||by===v)return true;if(H100.tgt&&victim===H100.tgt)return true;
  try{if(by&&by.tamedBy!=null&&S.players[by.tamedBy]===v)return true}catch(e){}return false}
function h100Dur(){let d=H100_DUR*(H100.k||1);if(typeof SPEED!=='undefined'&&SPEED==='slow')d*=1.25;if(typeof SETTINGS!=='undefined'&&SETTINGS.anim88==='quick')d*=0.7;return d}
function h100Shown(){try{const c=typeof cur==='function'?cur():null;return typeof boardShown==='function'?boardShown(c):c}catch(e){return null}}
/* cause icon: an image of his weapon icons, else a glyph */
function h100Img(k){if(H100.img[k])return H100.img[k];if(typeof WICO75==='undefined'||!WICO75[k])return null;const im=new Image();im.src=WICO75[k];H100.img[k]=im;return im}
function h100Cause(src){if(!src)return {g:'⚠'};if(src.spect)return {g:'🪨'};if(src.punch)return {g:'✊'};
  if(src.type==='npc'||src.n)return {g:'🐾'};if(src.type==='player'||src.p)return {k:'dmg',g:'⚔'};return {g:'⚠'}}
function h100By(src){try{if(!src)return _T('The arena');if(src.spect)return src.spect.name||_T('The stands');if(src.p)return src.p.name;if(src.n)return src.n.name}catch(e){}return _T('The arena')}

/* ---------- the readout queue ---------- */
function h100Add(key,o){if(!h100Live()||h100Fast())return null;if(typeof SETTINGS!=='undefined'&&SETTINGS.fx===false)return null;
  const mode=h100Mode();if(mode==='quiet')return null;if(o.faded&&mode==='mine')return null;
  const now=performance.now();
  /* the same word twice on one piece (doAttack's "miss" + the hurt that follows) = one readout */
  if(o.word&&H100.list.some(x=>x.key===key&&x.word===o.word&&now-x.made<900))return null;
  const prev=H100.list.filter(x=>x.key===key).reduce((a,x)=>Math.max(a,x.t0+x.dur-180),0);
  const dur=h100Dur()*(o.faded?0.7:1);const R={key,made:now,t0:Math.max(now,prev),dur,n:++H100.n,...o};H100.list.push(R);
  if(H100.list.length>40)H100.list.splice(0,H100.list.length-40);h100Kick();return R}
function h100Pos(R){const k=R.key;let r=R.r,c=R.c;if(k&&typeof k==='object'&&k.r!=null){r=k.r;c=k.c}return center(r,c)}
function h100Kick(){if(H100.raf)return;H100.raf=requestAnimationFrame(h100Frame)}
function h100Frame(){H100.raf=0;try{h100Paint(true)}catch(e){console.error(e)}
  const now=performance.now();H100.list=H100.list.filter(R=>now<R.t0+R.dur);if(H100.list.length)h100Kick();else if(H100.painted){try{h100Paint(true)}catch(e){}}}
/* rounded pill */
function h100Pill(cx,x,y,w,h){const r=h/2;cx.beginPath();cx.moveTo(x+r,y);cx.lineTo(x+w-r,y);cx.arc(x+w-r,y+r,r,-Math.PI/2,Math.PI/2);cx.lineTo(x+r,y+h);cx.arc(x+r,y+r,r,Math.PI/2,Math.PI*1.5);cx.closePath()}
/* the 6-zone body pip: unit boxes [x0,y0,x1,y1] in a 0.6 × 1 frame (the figure faces you: its right arm on your left, like the avatar) */
const H100_PIP={head:null,chest:[.17,.24,.43,.56],rarm:[.02,.25,.15,.58],larm:[.45,.25,.58,.58],rleg:[.18,.59,.29,.99],lleg:[.31,.59,.42,.99]};
function h100PipDraw(cx,x,y,h,loc,col){const w=h*0.6;cx.save();cx.lineWidth=Math.max(1,h/24);
  const zone=(l)=>{const on=l===loc;cx.fillStyle=on?col:'rgba(20,14,10,.72)';cx.strokeStyle=on?'rgba(255,240,220,.95)':'rgba(230,210,180,.55)';
    if(l==='head'){cx.beginPath();cx.arc(x+w*.3,y+h*.12,h*.1,0,Math.PI*2)}else{const b=H100_PIP[l];cx.beginPath();cx.rect(x+b[0]*w,y+b[1]*h,(b[2]-b[0])*w,(b[3]-b[1])*h)}
    cx.fill();cx.stroke()};
  for(const l of LOCS)zone(l);cx.restore()}
function h100Paint(clear){if(typeof fx95Cv!=='function')return;const c=fx95Cv();if(!c||typeof B95==='undefined'||!B95.fxCx)return;const cx=B95.fxCx,dpr=window.devicePixelRatio||1;
  cx.setTransform(dpr,0,0,dpr,0,0);if(clear)cx.clearRect(0,0,B95.fxW,B95.fxH);
  const now=performance.now(),move=h100Anim();let any=false;
  for(const R of H100.list){const k=(now-R.t0)/R.dur;if(k<0||k>=1)continue;any=true;
    const m=h100Pos(R);const lift=move?TW*0.18*k:0;let a=R.faded?0.55:1;if(move){if(k<0.08)a*=k/0.08;if(k>0.75)a*=(1-k)/0.25}else if(k>0.92)a=0;
    cx.save();cx.globalAlpha=a;
    /* the pip beside the token */
    let top=m.y-TW*0.35-lift;
    if(R.pip){const ph=Math.max(R.faded?18:26,Math.min(R.faded?32:46,TW*(R.faded?0.4:0.55)));const px=m.x+TW*0.3,py=m.y-TW*0.35-ph-lift;top=py;
      h100PipDraw(cx,px,py,ph,R.pip.loc,R.pip.col);
      if(R.pip.total){const fs=Math.round(ph*0.42);cx.font=`700 ${fs}px Marcellus SC, serif`;cx.textAlign='left';cx.textBaseline='middle';cx.lineJoin='round';
        cx.lineWidth=Math.max(3,fs/4);cx.strokeStyle='rgba(10,6,4,.92)';cx.strokeText(R.pip.total,px+ph*0.62,py+ph*0.45);cx.fillStyle=R.pip.col;cx.fillText(R.pip.total,px+ph*0.62,py+ph*0.45)}}
    /* the line above the token */
    if(R.text&&!R.faded||R.word&&!R.pip){const fs=Math.round(Math.max(13,Math.min(R.big?24:19,TW*(R.big?0.3:0.24))));cx.font=`700 ${fs}px Marcellus SC, serif`;cx.textBaseline='middle';
      const txt=R.text||R.word;const tw=cx.measureText(txt).width;const isz=R.cause&&!R.faded?fs*1.15:0;const pad=fs*0.45,gap=isz?fs*0.3:0;
      const W2=tw+isz+gap+pad*2,H2=fs*1.55;let x=m.x-W2/2;const y=Math.max(2,Math.min(m.y-TW*1.15-H2/2-lift,top-H2-3));x=Math.max(4,Math.min((B95.fxW||x+W2)-W2-4,x));
      if(!R.faded){cx.fillStyle='rgba(12,8,6,.8)';h100Pill(cx,x,y,W2,H2);cx.fill();cx.strokeStyle=R.edge||'rgba(240,207,125,.55)';cx.lineWidth=1;cx.stroke()}
      if(isz){const im=R.cause.k?h100Img(R.cause.k):null;if(im&&im.complete&&im.naturalWidth)cx.drawImage(im,x+pad,y+(H2-isz)/2,isz,isz);
        else{cx.font=`${Math.round(isz*0.85)}px serif`;cx.textAlign='left';cx.fillStyle='#fff';cx.fillText(R.cause.g||'',x+pad,y+H2/2);cx.font=`700 ${fs}px Marcellus SC, serif`}}
      cx.textAlign='left';cx.lineJoin='round';if(R.faded){cx.lineWidth=Math.max(3,fs/5);cx.strokeStyle='rgba(10,6,4,.85)';cx.strokeText(txt,x+pad+isz+gap,y+H2/2)}
      cx.fillStyle=R.color||'#f3e6cf';cx.fillText(txt,x+pad+isz+gap,y+H2/2)}
    cx.restore()}
  H100.painted=any}

/* ---------- avatar numbers + the peek ---------- */
{const base=boardShown;boardShown=function(p){try{const P=H100.peek;if(P&&!H100.off&&S&&S.boardPid==null&&performance.now()<P.until){const q=S.players.find(x=>x.id===P.id);if(q)return q}}catch(e){}return base.apply(this,arguments)}}
function h100Peek(victim){const ms=H100_PEEK*(H100.k||1);const P={id:victim.id,until:performance.now()+ms};H100.peek=P;
  requestAnimationFrame(()=>{try{if(S)render()}catch(e){}});
  setTimeout(()=>{if(H100.peek===P){H100.peek=null;try{if(S&&!S.sim)render()}catch(e){}}},ms+30)}
/* h100AvNum — the number(s) over the struck location of the panel avatar (waits a few frames for the panel to show that fighter) */
function h100AvNum(victim,loc,html,cls){const t0=performance.now();const go=()=>{const sv=document.querySelector(`#board svg[data-h100="${victim.id}"]`);
    if(!sv){if(performance.now()-t0<1200*(H100.k||1))requestAnimationFrame(go);return}
    const r=sv.getBoundingClientRect();if(r.width<20||r.height<20)return;const vb=(sv.getAttribute('viewBox')||'0 0 150 332').split(/[\s,]+/).map(Number);
    const A=H100_AV[loc]||[75,120];const x=r.left+(A[0]-vb[0])/vb[2]*r.width,y=r.top+(A[1]-vb[1])/vb[3]*r.height;
    const el=document.createElement('div');el.className='h100n '+(cls||'')+(h100Anim()?'':' still');el.setAttribute('aria-hidden','true');el.innerHTML=html;
    el.style.left=Math.round(x)+'px';el.style.top=Math.round(y)+'px';el.dataset.loc=loc;el.dataset.pid=victim.id;document.body.appendChild(el);
    if(H100.k>1)el.style.animationDuration=(1.6*H100.k)+'s';setTimeout(()=>el.remove(),1700*(H100.k||1))};requestAnimationFrame(go)}

/* ---------- hurt / hurtNPC: one readout per blow ---------- */
const h100Snap=v=>({ap:{...v.ap},hp:{...v.hp},sh:['L','R'].map(a=>{const w=v['w'+a];return w&&w.shield?[w,w.usesLeft]:null}),alive:v.alive});
{const base=hurt;hurt=function(victim,location,damage,source){
  if(!h100Live()||!victim||!victim.cls||!victim.alive||victim.exited||!LOCS.includes(location))return base.apply(this,arguments);
  const C={v:victim,loc:location,dmg:damage||0,src:source||{},b:h100Snap(victim),extra:[],at:victim.r+','+victim.c,turnOf:typeof cur==='function'?cur():null};
  H100.ctx.push(C);let r;
  try{r=base.apply(this,arguments)}catch(e){H100.ctx.splice(H100.ctx.indexOf(C),1);throw e}
  const done=()=>{const i=H100.ctx.indexOf(C);if(i>=0)H100.ctx.splice(i,1);try{h100Hit(C)}catch(e){console.error(e)}};
  if(r&&typeof r.then==='function')r.then(done,()=>{const i=H100.ctx.indexOf(C);if(i>=0)H100.ctx.splice(i,1)});else done();return r}}
function h100Hit(C){const v=C.v,l=C.loc,src=C.src;
  const apL=Math.max(0,(C.b.ap[l]||0)-(v.ap[l]||0));
  let abs=0;for(const s of C.b.sh)if(s){const [w,u]=s;const now=v.wL===w||v.wR===w?w.usesLeft:0;if(now<u)abs+=Math.min(C.dmg,w.absorb||0)}
  const glance=src.punch&&!src.cestus&&C.dmg-abs>0&&(C.b.ap[l]||0)>0&&apL===0;
  const hpL=glance?0:Math.max(0,C.dmg-abs-apL);
  const sev=v.alive&&(v.hp[l]||0)<=0&&C.b.hp[l]>0&&l!=='head'&&l!=='chest';const dead=C.b.alive&&!v.alive;
  const by=src.p||src.n||null;const V=h100Viewer();
  if(by&&V&&by===V)H100.tgt=v;
  const full=h100Full(v,by);
  /* the words */
  const parts=[];if(abs)parts.push(_T`Absorbed ${abs}`);if(glance)parts.push(_T('Blocked'));if(apL)parts.push(_T`${apL} armor`);if(hpL)parts.push(_T`${hpL} health`);if(sev)parts.push(_T('Severed'));
  let text;if(!(C.dmg>0))text=_T('Missed');else if(!apL&&!hpL&&!sev)text=parts.length?parts.join(', '):_T('Blocked');else text=_T`${C.dmg} → ${LOCN[l]}: ${parts.join(', ')}`;
  const col=hpL?'#ff6a55':apL?'#d6dde3':C.dmg>0?'#9fd3ff':'#c9c0b4';
  const fast=h100Fast();
  if(!fast){
    const lost=apL+hpL;
    h100Add(v,{text,word:!(C.dmg>0)?text:null,color:col,cause:h100Cause(src),faded:!full,edge:hpL?'rgba(255,106,85,.6)':null,
      pip:lost||sev?{loc:l,col:hpL||sev?'#ff4a3a':'#c9d2da',total:'−'+lost}:null});
    for(const e of C.extra)h100Word(v,e.text,e.color,{big:e.big,faded:!full&&!e.big});
    if(dead&&!C.extra.length)h100Word(v,_T('ELIMINATED'),'#ff3b2f',{big:1});
    /* the avatar */
    const mode=h100Mode();const mine=V&&v===V;
    if((apL||hpL||sev)&&(mode==='quiet'?mine:full)){
      const shown=h100Shown();
      if(shown!==v&&V&&!mine&&mode!=='quiet'&&S.boardPid==null&&!S.over)h100Peek(v);
      if(shown===v||H100.peek&&H100.peek.id===v.id){
        const html=sev?`<b class="w">${esc(_T('Severed'))}</b>`:`${apL?`<b class="a">−${apL}</b>`:''}${hpL?`<b class="h">−${hpL}</b>`:''}`;h100AvNum(v,l,html,sev?'sev':'')}}}
  /* between turns: the tick marks */
  if(!v.cpu&&(apL||hpL||sev)&&C.turnOf!==v){const T=H100.ticks[v.id]=H100.ticks[v.id]||[];
    T.push({loc:l,n:apL+hpL,sev,by:h100By(src)});if(T.length>H100_TICKS)T.splice(0,T.length-H100_TICKS)}}
{const base=hurtNPC;hurtNPC=function(npc,damage,player,prefix,weapon,byNpc){
  if(!h100Live()||!npc||!npc.alive)return base.apply(this,arguments);
  const C={npc,v:npc,dmg:damage||0,hp:npc.hp,extra:[],at:npc.r+','+npc.c,by:player||byNpc||null,src:{type:byNpc?'npc':'player',p:player,n:byNpc,w:weapon}};
  H100.ctx.push(C);let r;
  try{r=base.apply(this,arguments)}finally{const i=H100.ctx.indexOf(C);if(i>=0)H100.ctx.splice(i,1)}
  try{if(!h100Fast()){const lost=Math.max(0,C.hp-npc.hp);const V=h100Viewer();if(C.by&&V&&C.by===V)H100.tgt=npc;
    const full=h100Full(npc,C.by);
    h100Add(npc,{text:lost?'−'+lost:_T('Missed'),word:lost?null:_T('Missed'),color:lost?'#ffa04a':'#c9c0b4',cause:h100Cause(weapon&&weapon.punch?{punch:1}:C.src),faded:!full});
    for(const e of C.extra)h100Word(npc,e.text,e.color,{big:e.big,faded:!full&&!e.big})}}catch(e){console.error(e)}
  return r}}
function h100Word(key,text,color,o={}){const t=String(text||'');if(!t)return;return h100Add(key,{word:t,text:t,color:color||'#f3e6cf',big:!!o.big,faded:!!o.faded,r:o.r,c:o.c})}

/* ---------- fx(): every text float is routed (images stay on the board) ---------- */
const h100IsMoney=t=>/\bCF\b/.test(t)||/^[+−-]\d+c\b/.test(t)||/coin/i.test(t);
function h100At(r,c){try{const C=H100.ctx.slice().reverse().find(x=>x.at===r+','+c);if(C)return C.v;
  const P=S.players.filter(p=>p.r===r&&p.c===c);return P.find(p=>p.alive&&!p.exited)||P[0]||(S.npcs||[]).find(n=>n.alive&&n.r===r&&n.c===c)||null}catch(e){return null}}
{const base=fx;fx=function(r,c,text,color,opt){
  if(!h100Live())return base.apply(this,arguments);
  const n0=FX.length;const ret=base.apply(this,arguments);
  try{const got=[];for(let i=FX.length-1;i>=n0;i--)if(!FX[i].img)got.unshift(...FX.splice(i,1));
    if(!got.length&&!(r!=null&&typeof SETTINGS!=='undefined'&&SETTINGS.fx))return ret;
    const t=String(text==null?'':text);if(!t)return ret;
    if(h100IsMoney(t)){h100Money(r,c,t);return ret}
    if(h100Fast())return ret;
    const C=H100.ctx.slice().reverse().find(x=>x.at===r+','+c);
    if(C){ /* inside a blow on this tile: the hurt readout carries the numbers; other words follow it */
      if(color==='#c9d2da'||color==='#ff5a44'||color==='#ff9a3c'||color==='#9fd3ff'&&C.v&&C.v.cls)return ret;
      const big=/ELIMINATED|RETIRED|SLAIN/.test(t);
      C.extra.push({text:big?t:/Elixir/i.test(t)?_T('Saved — Health Elixir'):t,color:big?(color||'#ff3b2f'):color,big});return ret}
    const key=h100At(r,c);const by=null;
    let w=t,col=color||'#f3e6cf',big=!!(opt&&opt.big);
    if(t==='miss')w=_T('Missed');else if(color==='#9fd3ff'&&/^Fidelis/.test(t))w=_T('Saved — Fidelis: −1 die');else if(/Elixir/i.test(t))w=_T('Saved — Health Elixir');
    else if(/^blocked /.test(t)||color==='#9fd3ff'&&/\d/.test(t)&&!/dodg/i.test(t))w=_T`Absorbed ${(t.match(/\d+/)||[''])[0]}`;
    else if(color==='#9fd3ff'&&/dodg/i.test(t))w=_T('Dodged');
    if(/ELIMINATED|RETIRED|SLAIN/.test(t))big=true;
    const faded=!big&&key&&(key.cls||key.t)?!h100Full(key,by):false;
    h100Add(key&&key.r!=null?key:'tile:'+r+','+c,{word:w,text:w,color:col,big,faded,r,c})}catch(e){console.error(e)}
  return ret}}

/* ---------- coin / CF: the icon flies to its counter ---------- */
function h100Money(r,c,t){if(h100Fast())return;let who=null;try{const C=H100.ctx[H100.ctx.length-1];who=S.players.find(p=>p.r===r&&p.c===c&&p.alive)||(C&&(C.src.p||C.by))||(typeof cur==='function'?cur():null)}catch(e){}
  if(!who||who!==h100Shown())return;
  const gain=!/^[−-]/.test(t);const kinds=[];if(/\d+c\b|coin/i.test(t))kinds.push('coin');if(/\bCF\b/.test(t))kinds.push('cf');
  requestAnimationFrame(()=>{for(const k of kinds)h100Fly(k,r,c,gain)})}
function h100Fly(kind,r,c,gain){const stats=document.querySelectorAll('#board .econ .stat');const tgt=stats[kind==='coin'?0:1]||document.querySelector('#board .econ');if(!tgt)return;
  const pulse=()=>{tgt.classList.remove('pulse95');void tgt.offsetWidth;tgt.classList.add('pulse95');setTimeout(()=>tgt.classList.remove('pulse95'),1400)};
  if(!gain||!h100Anim()||typeof tgt.animate!=='function'||typeof cv==='undefined'){pulse();return}
  const cr=cv.getBoundingClientRect(),m=center(r,c);const sx=cr.left+m.x*(cr.width/(cv.clientWidth||cr.width)),sy=cr.top+(m.y-TW*0.9)*(cr.height/(cv.clientHeight||cr.height));
  const tr=tgt.getBoundingClientRect();const tx=tr.left+Math.min(28,tr.width/2),ty=tr.top+tr.height/2;
  const el=document.createElement('div');el.className='h100fly '+kind;el.setAttribute('aria-hidden','true');el.innerHTML=kind==='coin'?ICO.coin:ICO.wheat;el.style.left=Math.round(sx-14)+'px';el.style.top=Math.round(sy-14)+'px';document.body.appendChild(el);
  const dx=tx-sx,dy=ty-sy;const a=el.animate([{transform:'translate(0,0) scale(.8)',opacity:0},{transform:`translate(${dx*0.3}px,${dy*0.3-50}px) scale(1.25)`,opacity:1,offset:0.35},{transform:`translate(${dx}px,${dy}px) scale(.7)`,opacity:.9}],{duration:typeof SETTINGS!=='undefined'&&SETTINGS.anim88==='quick'?420:720,easing:'cubic-bezier(.3,.7,.4,1)'}); /* i18n:skip */
  a.onfinish=()=>{el.remove();pulse()};a.oncancel=()=>el.remove();setTimeout(()=>el.remove(),1600)}

/* ---------- the board's own redraw keeps the readouts on the overlay ---------- */
{const base=drawFX;drawFX=function(){const r=base.apply(this,arguments);try{if(!H100.off&&!HEADLESS&&(H100.list.length||H100.painted))h100Paint(true)}catch(e){}return r}}

/* ---------- ticks on the avatar + the panel marker ---------- */
{const base=avatarSVG;avatarSVG=function(p){let s=base.apply(this,arguments);try{if(H100.off||!p||!p.hp||typeof s!=='string'||!S||!S.players||!S.players.includes(p))return s;
  s=s.replace(/^<svg /,`<svg data-h100="${p.id}" `);
  const T=H100.ticks[p.id];if(T&&T.length){const per={};
    const g=T.map(t=>{const A=H100_AV[t.loc]||[75,120];const i=per[t.loc]=(per[t.loc]||0)+1;const x=A[0]-10+(i-1)*8,y=A[1]-18;
      const tip=t.sev?_T`${t.by}: severed ${LOCN[t.loc].toLowerCase()}`:_T`${t.by}: −${t.n} ${LOCN[t.loc].toLowerCase()}`;
      return `<g class="h100tk" data-avtip="${esc(tip)}" pointer-events="all"><rect x="${x-4}" y="${y-7}" width="9" height="15" fill="#000" fill-opacity="0"/><path d="M${x-2.5} ${y+6}L${x+2.5} ${y-6}" stroke="#1a0a06" stroke-width="4.2" stroke-linecap="round"/><path d="M${x-2.5} ${y+6}L${x+2.5} ${y-6}" stroke="${t.sev?'#ff4a3a':t.n>=3?'#ff7a5a':'#f0cf7d'}" stroke-width="2.4" stroke-linecap="round"/></g>`}).join('');
    const i=s.lastIndexOf('</svg>');if(i>=0)s=s.slice(0,i)+g+s.slice(i)}}catch(e){console.error(e)}return s}}

/* ---------- the turn / event hooks (BUS) ---------- */
if(!H100.off){
  /* an avatar number belongs to the fighter it landed on: gone when the panel shows someone else */
  BUS.on('render',()=>{try{const ns=document.querySelectorAll('.h100n');if(!ns.length)return;const sv=document.querySelector('#board svg[data-h100]');const id=sv?sv.getAttribute('data-h100'):null;ns.forEach(n=>{if(n.dataset.pid!==id)n.remove()})}catch(e){}});
  BUS.on('turn.begin',d=>{try{if(!d||d.sim)return;if(H100.ticks[d.id]){delete H100.ticks[d.id];requestAnimationFrame(()=>{try{if(S&&!S.sim)render()}catch(e){}})}
    const V=h100Viewer();if(V&&V.id===d.id)H100.tgt=null}catch(e){}});
  BUS.on('event.start',d=>{if(d&&d.sim)return;H100.list.length=0;H100.ctx.length=0;H100.ticks={};H100.peek=null;H100.tgt=null});
}

/* ---------- Settings → Board & pieces → Hit feedback ---------- */
function h100SetHTML(){const v=h100Mode();const b=(k,l)=>`<button type="button" data-hit100="${k}" class="${v===k?'on':''}" aria-pressed="${v===k}">${l}</button>`;
  return `<div class="seg s98-seg">${b('full',_T('Full'))}${b('mine',_T('Mine'))}${b('quiet',_T('Quiet'))}</div>`}
if(!H100.off&&typeof set98Pieces==='function'){const base=set98Pieces;set98Pieces=function(){let h=base.apply(this,arguments);try{
  const row=typeof set98Row==='function'?set98Row(_T('Hit feedback'),_T('Full: your fights in full, the rest as faint marks. Mine: only your fights. Quiet: only your fighter’s body.'),h100SetHTML()):'';
  const card=typeof set98Card==='function'?set98Card('🎯',_T('Hits'),`<div class="s98-rows">${row}</div>`):'';
  h=h.replace(/<\/div>$/,card+'</div>')}catch(e){console.error(e)}return h}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-hit100]');if(!b)return;SETTINGS.hit100=b.dataset.hit100;
  try{applySettings()}catch(err){}b.parentElement.querySelectorAll('[data-hit100]').forEach(x=>{const on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',String(on))})});

(()=>{if(H100.off)return;const st=document.createElement('style');st.textContent=`
.h100n{position:fixed;z-index:9000;pointer-events:none;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:1px;font:700 17px/1 'Marcellus SC',serif;text-shadow:0 0 3px #000,0 1px 2px #000,0 0 6px rgba(0,0,0,.8);animation:h100in 1.6s ease-out forwards}
.h100n b{display:block}.h100n .a{color:#d6dde3}.h100n .h{color:#ff5a44;font-size:19px}.h100n .w{color:#ff4a3a;font-size:13px;letter-spacing:.04em}
@keyframes h100in{0%{opacity:0;transform:translate(-50%,-50%) scale(.6)}12%{opacity:1;transform:translate(-50%,-62%) scale(1.15)}65%{opacity:1;transform:translate(-50%,-62%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(.45)}}
.h100n.still{animation:h100still 1.6s steps(1,end) forwards}
@keyframes h100still{0%,90%{opacity:1}100%{opacity:0}}
body.calm .h100n{animation:h100still 1.6s steps(1,end) forwards}
@media (prefers-reduced-motion:reduce){.h100n{animation:h100still 1.6s steps(1,end) forwards}}
.h100fly{position:fixed;z-index:9001;width:28px;height:28px;display:grid;place-items:center;pointer-events:none;filter:drop-shadow(0 3px 6px rgba(0,0,0,.6))}
.h100fly .ico,.h100fly img,.h100fly svg{width:24px;height:24px}
#board .h100tk{cursor:help}
body.chromeoff .h100n,body.chromeoff .h100fly{display:none}`;document.head.appendChild(st)})();
