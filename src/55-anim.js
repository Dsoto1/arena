/* =====================================================================
   55-ANIM · WHAT FLIES AND WHAT STICKS
   =====================================================================
   • Thrown and shot weapons fly: spears and tridents, axes, knives, arrows, crossbow bolts, sling stones. A hit
     leaves the missile stuck where it struck — in the beast, or in the gladiator's head, chest, arm or leg; a miss
     sticks in the sand. They fade in their own time and never slow the game.
   • Spectators' stones are seen leaving the stands and landing on the gladiator.
   • A speared spectator slumps in their seat with the spear in them. The arena crew (the same chained slaves as
     the post-show) come out along the SIDELINES — never on the sand — carry the body off, and rake the blood.
     Pure theatre: nothing waits for it.
   ===================================================================== */
const PROJ=[],STUCK=[],CORPSES=[];let ANIM_RAF=null;
const LOC_OFF={head:[0,-0.98],chest:[0,-0.66],rarm:[-0.2,-0.62],larm:[0.2,-0.62],rleg:[-0.08,-0.28],lleg:[0.08,-0.28]};
function animOn(){return !HEADLESS&&typeof S!=='undefined'&&S&&!S.sim&&(typeof SETTINGS==='undefined'||SETTINGS.fx!==false)}
function animKick(){if(ANIM_RAF)return;const tick=()=>{ANIM_RAF=null;try{draw()}catch(e){}if(PROJ.length||CORPSES.some(c=>c.crew&&!c.done))ANIM_RAF=requestAnimationFrame(tick)};ANIM_RAF=requestAnimationFrame(tick)}
function missileOf(src,dist){const w=src.w||{},k=w.key||'';
  if(src.thr)return k==='axe'?'axe':'spear';
  if(w.ammo!=null)return k==='bow'?'arrow':k==='arcu'?'bolt':k==='knives'?'knife':(k==='sling'||k==='stones'||w.stones)?'stone':'arrow';
  if(w.throw&&dist>(w.r||1))return 'spear';return null}
const scr=(rc,h=0.6)=>{const c=center(rc.r,rc.c);return {x:c.x,y:c.y-TW*h}};
function projectile(kind,from,to,{arc=0,dur=420,onEnd=null}={}){if(!animOn())return;PROJ.push({kind,from,to,arc,dur,t0:performance.now(),onEnd});animKick()}
/* the pieces */
function drawMissile(kind,x,y,ang,sc=1){ctx.save();ctx.translate(x,y);ctx.rotate(ang);const L=TW*0.5*sc;ctx.lineCap='round';
  if(kind==='stone'){ctx.fillStyle='#8f8a80';ctx.strokeStyle='#4a453e';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,TW*0.07*sc,0,Math.PI*2);ctx.fill();ctx.stroke()}
  else if(kind==='knife'){ctx.strokeStyle='#4a2e18';ctx.lineWidth=TW*0.035;ctx.beginPath();ctx.moveTo(-L*0.35,0);ctx.lineTo(-L*0.1,0);ctx.stroke();ctx.fillStyle='#d9dde2';ctx.beginPath();ctx.moveTo(-L*0.1,-TW*0.025);ctx.lineTo(L*0.25,0);ctx.lineTo(-L*0.1,TW*0.025);ctx.fill()}
  else if(kind==='axe'){ctx.strokeStyle='#6a4526';ctx.lineWidth=TW*0.035;ctx.beginPath();ctx.moveTo(-L*0.4,0);ctx.lineTo(L*0.3,0);ctx.stroke();ctx.fillStyle='#c9ced4';ctx.beginPath();ctx.moveTo(L*0.18,-TW*0.1);ctx.quadraticCurveTo(L*0.42,0,L*0.18,TW*0.1);ctx.lineTo(L*0.12,0);ctx.fill()}
  else{const len=kind==='spear'?L*1.3:kind==='bolt'?L*0.6:L*0.8;ctx.strokeStyle=kind==='bolt'?'#3d2a1a':'#7a5230';ctx.lineWidth=kind==='spear'?TW*0.04:TW*0.026;ctx.beginPath();ctx.moveTo(-len,0);ctx.lineTo(0,0);ctx.stroke();
    ctx.fillStyle='#cfd4da';ctx.beginPath();ctx.moveTo(0,-TW*0.04);ctx.lineTo(TW*(kind==='spear'?0.13:0.09),0);ctx.lineTo(0,TW*0.04);ctx.fill();
    if(kind==='arrow'||kind==='bolt'){ctx.strokeStyle=kind==='bolt'?'#8a2a20':'#e8e0cc';ctx.lineWidth=TW*0.02;for(const s of [-1,1]){ctx.beginPath();ctx.moveTo(-len,0);ctx.lineTo(-len-TW*0.07,s*TW*0.05);ctx.stroke()}}}
  ctx.restore()}
function drawProjectiles(){const now=performance.now();
  for(let i=PROJ.length-1;i>=0;i--){const P=PROJ[i];const k=(now-P.t0)/P.dur;const a=typeof P.from==='function'?P.from():P.from,b=typeof P.to==='function'?P.to():P.to;if(!a||!b){PROJ.splice(i,1);continue}
    if(k>=1){PROJ.splice(i,1);try{P.onEnd&&P.onEnd()}catch(e){}continue}
    const x=a.x+(b.x-a.x)*k,y=a.y+(b.y-a.y)*k-Math.sin(Math.PI*k)*P.arc*TW;const dx=(b.x-a.x),dy=(b.y-a.y)-Math.cos(Math.PI*k)*Math.PI*P.arc*TW;
    drawMissile(P.kind,x,y,P.kind==='axe'?k*12:Math.atan2(dy,dx))}
  const tnow=now;for(let i=STUCK.length-1;i>=0;i--){const s=STUCK[i];const age=tnow-s.t0;const ref=s.ref;
    const locGone=ref&&s.lodged&&(ref.alive===false||(ref.hp&&typeof ref.hp==='object'&&s.loc in ref.hp&&(ref.hp[s.loc]||0)<=0&&!((ref.ap||{})[s.loc]>0)));
    if(age>s.life||locGone||(ref&&(ref.gone||ref.exited))||(S&&S.over&&age>4000)){STUCK.splice(i,1);continue}
    let x,y;if(ref){const o=LOC_OFF[s.loc]||[0,-0.5];const c=center(ref.r,ref.c);x=c.x+o[0]*TW;y=c.y+o[1]*TW}else{const c=center(s.r,s.c);x=c.x+s.dx*TW;y=c.y+s.dy*TW}
    ctx.save();ctx.globalAlpha=s.lodged?1:Math.min(1,(s.life-age)/(s.fade||1500));drawMissile(s.kind,x,y,s.ang,0.8);ctx.restore()}}
{const _df=drawFX;drawFX=function(){_df();try{if(animOn()||PROJ.length||STUCK.length)drawProjectiles()}catch(e){}}}

/* ---------- the weapons that fly ---------- */
const hpSumOf=q=>q?Object.values(q.hp&&typeof q.hp==='object'?q.hp:{v:q.hp||0}).reduce((a,v)=>a+(+v||0),0)+Object.values(q.ap||{}).reduce((a,v)=>a+(+v||0),0):0;
{const _da=doAttack;doAttack=async function(p,src,t,opt){let kind=null,before=null,locBefore=null;const tgt=t&&t.ref;
  try{if(animOn()&&t&&src){const dist=cheb(p,t);kind=missileOf(src,dist);if(kind&&dist>=1){before=hpSumOf(tgt);if(tgt&&tgt.hp&&typeof tgt.hp==='object')locBefore={hp:{...tgt.hp},ap:{...(tgt.ap||{})}};
    const from=()=>scr(p,0.62),to=()=>tgt&&tgt.r!=null?scr(tgt,t.kind==='npc'?0.45:0.6):scr(t,0.2);projectile(kind,from,to,{arc:kind==='stone'?0.5:kind==='spear'||kind==='axe'?0.25:0.08,dur:Math.min(700,260+dist*70)})}}}catch(e){}
  const r=await _da(p,src,t,opt);
  try{if(kind==='stone'){const hit=tgt&&hpSumOf(tgt)<before;const c0={dx:(Math.random()-.5)*0.3,dy:-0.1};
      /* v0.52: a stone that lands is spent — it fades on the spot; a miss rolls to rest and fades */
      if(hit)STUCK.push({kind,ref:tgt,loc:'chest',ang:0,t0:performance.now(),life:700,fade:700});else STUCK.push({kind,r:t.r,c:t.c,...c0,ang:0,t0:performance.now(),life:1400,fade:1000});animKick()}
    else if(kind&&src.thr){ /* v0.52: a thrown weapon never sticks: with throws left it drops under the target (the floor token), otherwise it is spent */
      if(!(src.w&&src.w.throwsLeft>0))STUCK.push({kind,r:t.r,c:t.c,dx:0,dy:-0.05,ang:1.4,t0:performance.now(),life:1200,fade:1200});animKick()}
    else if(kind){const ang=Math.atan2((t.r-p.r)+(t.c-p.c),(t.c-p.c)-(t.r-p.r))*0.5+0.35;
    const hit=tgt&&hpSumOf(tgt)<before;if(hit){let loc='chest';if(locBefore){for(const l of Object.keys(locBefore.hp))if((tgt.hp[l]||0)<locBefore.hp[l]||(tgt.ap&&(tgt.ap[l]||0)<locBefore.ap[l])){loc=l;break}}
      const quick=kind==='arrow'||kind==='bolt'; /* v0.53: arrows and bolts strike and fade, like stones */
      STUCK.push({kind,ref:tgt,loc:t.kind==='npc'?'chest':loc,ang,t0:performance.now(),life:quick?900:22000,fade:quick?700:1500})}
    else STUCK.push({kind,r:t.r,c:t.c,dx:(Math.random()-.5)*0.4,dy:-0.08,ang:ang+1.2,t0:performance.now(),life:14000});
    while(STUCK.length>24){const j=STUCK.findIndex(x=>!x.lodged);STUCK.splice(j<0?0:j,1)}animKick()}}catch(e){}
  return r}}

/* ---------- stones from the stands ---------- */
{const _ss=spectStone;spectStone=async function(s,q){try{if(animOn()&&s&&q&&s._x!=null){const sx=s._x,sy=s._y-TW*0.35;projectile('stone',{x:sx,y:sy},()=>scr(q,0.62),{arc:0.9,dur:620})}}catch(e){}return _ss(s,q)}}

/* ---------- the speared spectator, and the crew that fetches them ---------- */
function seatRC(si,k){const s=SECTIONS[si];const row=k%4,col=Math.floor(k/4)%6;const d=1.55+row*0.38;const along=(s.half?7:0.9)+col*0.95+(row%2?0.45:0);
  return s.edge==='top'?[-d,along]:s.edge==='bottom'?[N-1+d,along]:s.edge==='left'?[along,-d]:[along,N-1+d]}
function sidelineRC(si,along){const s=SECTIONS[si];const d=1.12;return s.edge==='top'?[-d,along]:s.edge==='bottom'?[N-1+d,along]:s.edge==='left'?[along,-d]:[along,N-1+d]}
function gateRC(si){const s=SECTIONS[si];const d=1.12;const lo=-d,hi=N-1+d;const near=s.half?hi:lo;return s.edge==='top'?[lo,near]:s.edge==='bottom'?[hi,near]:s.edge==='left'?[near,lo]:[near,hi]}
{const _dsp=doSpear;doSpear=async function(p,s){let k=0;try{k=S.spect.filter(x=>!x.gone&&x.sec===s.sec).indexOf(s);if(k<0)k=0}catch(e){}const was=!!s.gone;
  try{if(animOn()&&s._x!=null){const sx=s._x,sy=s._y-TW*0.28;projectile('spear',()=>scr(p,0.7),{x:sx,y:sy},{arc:0.35,dur:520})}}catch(e){}
  const r=await _dsp(p,s);
  try{if(animOn()&&!was&&s.gone){const rc=seatRC(s.sec,k);const s0=SECTIONS[s.sec];const along=s0.edge==='top'||s0.edge==='bottom'?rc[1]:rc[0];
    const C={sec:s.sec,rc,look:s.look||{},name:s.name,t0:performance.now(),ang:Math.atan2(rc[0]-p.r,rc[1]-p.c)};CORPSES.push(C);
    setTimeout(()=>{if(!S||S.over&&!CORPSES.includes(C))return;const g=gateRC(s.sec),sl=sidelineRC(s.sec,along);C.crew={path:[g,sl,rc,sl,g],t0:performance.now(),speed:1.7};animKick()},2200)}}catch(e){}
  return r}}
function crewPos(C,now){const P=C.crew.path;const segs=[];let tot=0;for(let i=1;i<P.length;i++){const d=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);segs.push(d);tot+=d}const half=tot/2,v=C.crew.speed;
  const walk=dist=>{dist=Math.max(0,Math.min(tot,dist));let acc=0;for(let i=0;i<segs.length;i++){if(dist<=acc+segs[i]){const f=segs[i]?(dist-acc)/segs[i]:0;return [P[i][0]+(P[i+1][0]-P[i][0])*f,P[i][1]+(P[i+1][1]-P[i][1])*f]}acc+=segs[i]}return P[P.length-1]};
  const tIn=half/v*1000,lift=1400,rake=2000,tOut=half/v*1000;const t=now-C.crew.t0;const lag=0.55;
  /* the carrier: in, lift, out with the body. The raker: follows in a step behind, rakes the bench, walks out */
  const carrier=t<tIn?{pos:walk(t/1000*v),carry:false}:t<tIn+lift?{pos:P[2],carry:false}:t<tIn+lift+tOut?{pos:walk(half+(t-tIn-lift)/1000*v),carry:true}:null;
  const rt=t-tIn-lift;const raker=t<tIn+lift?{pos:walk(Math.max(0,t/1000*v-lag))}:rt<rake?{pos:P[2],raking:true}:rt<rake+tOut?{pos:walk(half+(rt-rake)/1000*v)}:null;
  const bloodA=rt<0?1:Math.max(0,1-rt/rake);return (!carrier&&!raker)?{done:true}:{carrier,raker,bloodA,lifted:t>=tIn+lift}}
function drawCorpses(){if(!CORPSES.length)return;const now=performance.now();
  for(let i=CORPSES.length-1;i>=0;i--){const C=CORPSES[i];const st=C.crew?crewPos(C,now):null;if(st&&st.done){CORPSES.splice(i,1);continue}if(S&&S.over&&now-C.t0>60000){CORPSES.splice(i,1);continue}
    const seat=pt(C.rc[0],C.rc[1]);const bloodA=st?st.bloodA:1;
    if(bloodA>0){ctx.save();ctx.globalAlpha=0.75*bloodA;ctx.fillStyle='#6e1410';ell(seat.x+TW*0.05,seat.y-TW*0.04,TW*0.17,TW*0.07);ctx.fill();ctx.restore()}
    if(!(st&&st.lifted)){const lk=C.look;ctx.save();ctx.translate(seat.x,seat.y-TW*0.12);ctx.rotate(0.9);ctx.fillStyle=lk.robe||'#7a6a55';ell(0,0,TW*0.15,TW*0.08);ctx.fill();ctx.fillStyle=lk.skin||'#e6cfa8';ell(TW*0.17,0,TW*0.07,TW*0.07);ctx.fill();ctx.restore();
      drawMissile('spear',seat.x+TW*0.02,seat.y-TW*0.2,-1.1,0.75)}
    if(st){try{if(st.raker){const r2=pt(st.raker.pos[0],st.raker.pos[1]);drawSlave9({x:r2.x+(st.raker.raking?Math.sin(now/180)*TW*0.06:0),y:r2.y},true)}
      if(st.carrier){const m=pt(st.carrier.pos[0],st.carrier.pos[1]);drawSlave9({x:m.x,y:m.y},false);if(st.carrier.carry){ctx.fillStyle='#d8cfc0';ell(m.x,m.y-TW*0.52,TW*0.19,TW*0.06);ctx.fill();ctx.strokeStyle='#8a2a20';ctx.lineWidth=1.5;ctx.stroke()}}}catch(e){}}}}
{const _ds=drawStands;drawStands=function(){_ds();try{if(!HEADLESS&&S)drawCorpses()}catch(e){}}}
