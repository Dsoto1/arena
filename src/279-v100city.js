/* 279-v100city (v1.0, his v0.99 note "city center crowd loads frozen then all move at once (stutter)"; display only — rules, dice, saves untouched)
   ROOT CAUSE (measured, tools/tests/tv100c.js): openCitySquare started cityLoop at once. Its first frame ran bake89() (the painted forum,
   ~600 ms in one task) and only then did cityDraw request every figure image (each a data: svg that decodes later), so the square showed
   shadows only; and no walker had a t0, so on the first loop frame after the bake ALL of them were "due" and stepped together (25 figures
   first moved in the same frame), their glides sharing one start time. The v0.96 "fade in after the crowd has loaded" idea was never built:
   cityFade only flashes dark for 60 ms.
   FIX: the square opens under a black cover (#cityFade.hold100). Warm-up, one cheap step a frame: (1) let the cover paint, (2) bake89,
   (3) one cityDraw (kicks off every figure's image), (4) wait until the images are decoded (cap WARM100.cap), (5) a priming draw, then the
   cover lifts and the walk starts with random phases (Math.random, never the dice): every walker's t0 is spread over its own wait, a few
   are due within 250 ms, the animals and the chatter get fresh random starts. Reduce motion / calm: the cover cuts instead of fading.
   The cover also stands down if the square closes. Kill switch: localStorage flavius_city100off=1 (the old start). */
const WARM100={cap:1800,on:true};
try{if(localStorage.getItem('flavius_city100off')==='1')WARM100.on=false}catch(e){}
(()=>{const st=document.createElement('style');st.textContent='#cityFade.hold100{opacity:1;pointer-events:all}#cityFade.hold100.cut100{transition:none}';document.head.appendChild(st)})();
/* city100Imgs — { total, ready } of the figure images the square has asked for so far */
function city100Imgs(){let total=0,ready=0;for(const k in CITY.imgs){const im=CITY.imgs[k];if(!im||!('complete' in im))continue;total++;if(im.complete&&im.naturalWidth)ready++}return {total,ready}}
/* city100Reveal — lift the cover and start the walk: random phases, a few steps right away */
function city100Reveal(){const W=CITY.warm100;CITY.warm100=null;const now=performance.now();
  try{const npcs=(CITY.npcs||[]).filter(n=>!n.static&&!n.leaving);
    for(const n of npcs)n.t0=now-Math.random()*(n.wt||2000)/(CITY.speed||1);
    npcs.slice().sort((a,b)=>((a.t0||0)+(a.wt||0))-((b.t0||0)+(b.wt||0))).slice(0,3).forEach(n=>{n.t0=now-(n.wt||2000)/(CITY.speed||1)+Math.random()*250});
    for(const a of CITY.anim89||[])a.t0=now+Math.random()*3000;
    CITY.chatT=now+1200+Math.random()*2500;CITY.beastT=now+9000+Math.random()*9000;CITY.lastT=now}catch(e){console.error(e)}
  const fd=document.getElementById('cityFade');if(fd){if(typeof reduceMotion==='function'&&reduceMotion())fd.classList.add('cut100');fd.classList.remove('hold100')}
  CITY.shown100=now;if(W)CITY.warmMs100=Math.round(now-W.t0)}
{const base=openCitySquare;openCitySquare=function(){const was=CITY.open;const r=base.apply(this,arguments);
  try{if(!was&&CITY.open&&WARM100.on){const fd=document.getElementById('cityFade');if(fd){fd.classList.add('hold100');CITY.warm100={t0:performance.now(),step:0,done:false}}}}catch(e){console.error(e)}return r}}
{const base=cityLoop;cityLoop=function(ts){const W=CITY.open&&CITY.warm100;if(!W)return base.apply(this,arguments);
  const now=performance.now();
  try{W.step++;
    if(W.step===2){try{bake89()}catch(e){console.error(e)}}
    else if(W.step===3){cityDraw();W.drawn=true}
    else if(W.step>3){const m=city100Imgs();
      if(W.primed||now-W.t0>WARM100.cap||(m.total>0&&m.ready===m.total&&W.step>4)){if(!W.primed&&m.ready===m.total){cityDraw();W.primed=true;CITY.raf=requestAnimationFrame(cityLoop);return}
        city100Reveal();CITY.lastT=performance.now();return base.apply(this,arguments)}}
  }catch(e){console.error(e);CITY.warm100=null;const fd=document.getElementById('cityFade');if(fd)fd.classList.remove('hold100');return base.apply(this,arguments)}
  CITY.raf=requestAnimationFrame(cityLoop)}}
/* leaving during the warm-up: drop the cover's hold so closeCity's own fade works */
{const base=closeCity;closeCity=function(){try{if(CITY.warm100){CITY.warm100=null;const fd=document.getElementById('cityFade');if(fd)fd.classList.remove('hold100')}}catch(e){}return base.apply(this,arguments)}}
