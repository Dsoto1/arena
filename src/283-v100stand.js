/* 283-v100stand — v1.0 THE CROWD STANDS UP (owner 2026-10-11). On the big moments a few spectators rise from the bench, arms up, and sit
   again: eliminations, beast spawns/kills (the 'beast' and 'boss' reactions), a topple, a spear, Flavius's big moods, a duel round and the
   waves (the happiest stand first, the rest follow with a short stagger). Ordinary 209 bursts stay seated, now and then (12% of the
   delighted ones) standing. A standing figure is one more cached sprite variant (193 sprite91 key carries o.st; the canvas has 16 units of
   head room, the body is lifted 20 units, legs + sandals drawn under it) — lifted ~0.1 tile, so it stays inside the stands band.
   Same 700 ms tick as 209, at most one redraw per tick and only when a pose changed; nothing in a hidden tab, idle92, Reduce motion,
   animations off, sims or Fast (all through cheer92OK). Display only — Math.random, never the dice. Kill switch localStorage flavius_stand100off=1. */
const STAND100={on:true,lift:20,dur:[1100,1900],
  /* share of the stands that rise per big moment (scaled by mood: delighted 1, pleased .6, neutral .25) */
  k:{elim:0.5,boss:0.45,beast:0.4,topple:0.35,spear:0.3,mf:0.1,gift:0.08,flav:0.15,duel:0.3},burst:0.12,stag:18,stagMax:500};
try{if(localStorage.getItem('flavius_stand100off')==='1')STAND100.on=false}catch(e){}
function stand100Is(sp,now){return !!(STAND100.on&&sp&&sp._sa100!=null&&now>=sp._sa100&&now<sp._sb100)}
{const base=look91;look91=function(sp,back){const o=base.apply(this,arguments);try{if(stand100Is(sp,performance.now())){o.st=1;if(!o.up)o.up=o.mood===0?1:2}}catch(e){}return o}}
{const base=paint91;paint91=function(g,o){if(!o.st)return base.apply(this,arguments);
  const L=STAND100.lift,skin=o.skin||'#e6cfa8',tun=o.tunic||'#e8dcc0',ink='rgba(28,16,8,.78)';
  {const G=g.createRadialGradient(35,94,2,35,94,24);G.addColorStop(0,'rgba(12,6,2,.5)');G.addColorStop(1,'rgba(12,6,2,0)');g.fillStyle=G;g.beginPath();g.ellipse(35,94,24,6,0,0,Math.PI*2);g.fill()}
  /* calves + sandals, then the tunic skirt falling from the lifted torso */
  g.fillStyle=skin;for(const x of [22,35]){g.beginPath();g.rect(x,84,7,9);g.fill();g.strokeStyle=ink;g.lineWidth=.8;g.stroke()}
  g.fillStyle='#4a3020';for(const x of [25.5,38.5]){g.beginPath();g.ellipse(x,93.4,5.2,2,0,0,Math.PI*2);g.fill()}
  g.beginPath();g.moveTo(14,64);g.lineTo(50,64);g.lineTo(53,85);g.quadraticCurveTo(32,89,11,85);g.closePath();
  const G2=g.createLinearGradient(14,64,52,86);G2.addColorStop(0,cmix91(tun,.2));G2.addColorStop(.5,tun);G2.addColorStop(1,cmix91(tun,-.34));g.fillStyle=G2;g.fill();g.lineWidth=1;g.strokeStyle=ink;g.stroke();
  g.strokeStyle=cmix91(tun,-.3);g.globalAlpha=.6;g.lineWidth=1;g.beginPath();g.moveTo(25,70);g.lineTo(23,86);g.moveTo(39,70);g.lineTo(41,86);g.stroke();g.globalAlpha=1;
  g.save();g.translate(0,-L);const o2=Object.assign({},o,{nosh:1,st:0});base.call(this,g,o2);g.restore()}}
function stand100Start(sp,now,delay){const d=STAND100.dur[0]+Math.random()*(STAND100.dur[1]-STAND100.dur[0]);sp._sa100=now+delay;sp._sb100=now+delay+d}
/* a big moment: the happiest rise first, neighbours follow with a short stagger */
function stand100Wave(kind){try{const f=STAND100.k[kind];if(!f||!STAND100.on||!cheer92OK())return false;const now=performance.now();
  const c=(S.spect||[]).filter(sp=>!sp.out&&!sp.speared&&!sp.gone&&!(sp._sb100>now)).map(sp=>({sp,m:sp.mood||0,lv:typeof moodLv91==='function'?moodLv91(sp.mood||0):2})).filter(x=>x.lv>=2);
  c.sort((a,b)=>b.m-a.m);let rank=0,any=false;
  for(const x of c){const w=x.lv>=4?1:x.lv===3?.6:.25;if(Math.random()<f*w){stand100Start(x.sp,now,Math.min(rank*STAND100.stag,STAND100.stagMax)+Math.random()*120);rank++;any=true;
    if(!(x.sp._cu92>now))cheer92Start(x.sp,now,x.lv)}}
  return any}catch(e){return false}}
{const base=crowdReact;crowdReact=function(kind,info){const r=base.apply(this,arguments);try{if(stand100Wave(kind)&&!(typeof fxRAF!=='undefined'&&fxRAF))draw()}catch(e){}return r}}
/* Flavius's big moods, and a delighted burst now and then standing */
{const base=flaviusMood;flaviusMood=function(m){const r=base.apply(this,arguments);try{if(m==='cheer'||m==='laugh'||m==='shock')stand100Wave('flav')}catch(e){}return r}}
{const base=cheer92Start;cheer92Start=function(sp,now,lv){const r=base.apply(this,arguments);try{if(lv===4&&STAND100.on&&Math.random()<STAND100.burst&&!(sp._sb100>now))stand100Start(sp,now,0)}catch(e){}return r}}
/* the tick: a duel round begins → the stands rise; redraw once if any pose changed since the last tick */
setInterval(()=>{if(!STAND100.on||!cheer92OK())return;const now=performance.now();
  try{const d=typeof duelZoneOn==='function'&&duelZoneOn();if(d&&S._duel100!==true){S._duel100=true;stand100Wave('duel')}else if(!d)S._duel100=false}catch(e){}
  let changed=false;for(const sp of S.spect||[]){if(sp._sa100==null)continue;const st=stand100Is(sp,now);if(st!==!!sp._sst100){sp._sst100=st;changed=true}if(!st&&now>sp._sb100)sp._sa100=null}
  if(changed&&typeof draw==='function'&&!(typeof fxRAF!=='undefined'&&fxRAF))draw()},CHEER92.tick);
