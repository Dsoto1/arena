/* 280-v100citycalm (v1.0, his note: the City Square crowd ignored Reduce motion; display only — rules, dice, saves untouched)
   Under Reduce motion (SETTINGS.calm / reduceMotion()) or Animations Off (SETTINGS.anim88 'off') the square is shown placed but STILL:
   no wandering (townsfolk and animals), no glides (every figure, YOURS too, jumps to its tile), no bobbing / tail / water / steam /
   yard-lunge / flag-wave motion (the live painters and animal89 get a fixed clock), no chatter bubbles, no beast parade.
   Your own walk is input, so it still runs (a jump per step). Horns: the crowd still files toward the gate (a jump per step).
   Read live every frame, so switching the setting with the square open takes effect at once; switching back re-seeds the timers. */
function city100Calm(){try{return (typeof reduceMotion==='function'&&!!reduceMotion())||(typeof SETTINGS!=='undefined'&&SETTINGS.anim88==='off')}catch(e){return false}}
{const base=glide89;glide89=function(o,now,dur){if(!city100Calm())return base.apply(this,arguments);o._tr=o.r;o._tc=o.c;o._dr=o.r;o._dc=o.c;o._fr=o.r;o._fc=o.c;return [o.r,o.c]}}
{const base=animal89;animal89=function(c2,a,x,y,T,now){return base.call(this,c2,a,x,y,T,city100Calm()?0:now)}}
{const base=yardLive89;yardLive89=function(c2,B,now){return base.call(this,c2,B,city100Calm()?0:now)}}
{const base=templeLive89;templeLive89=function(c2,B,now){return base.call(this,c2,B,city100Calm()?0:now)}}
{const base=bathLive89;bathLive89=function(c2,B,now){return base.call(this,c2,B,city100Calm()?0:now)}}
{const base=fountainLive89;fountainLive89=function(c2,B,now){return base.call(this,c2,B,city100Calm()?0:now)}}
{const base=cityLoop;cityLoop=function(ts){if(!CITY.open)return base.apply(this,arguments);
  if(!city100Calm()){if(CITY.calm100){CITY.calm100=false;const t=performance.now();
    try{for(const n of CITY.npcs)if(!n.static&&!n.leaving)n.t0=t-Math.random()*(n.wt||2000);for(const a of CITY.anim89||[])a.t0=t+Math.random()*3000;
      CITY.chatT=t+1200+Math.random()*2500;CITY.beastT=t+9000+Math.random()*9000}catch(e){console.error(e)}}
    return base.apply(this,arguments)}
  CITY.calm100=true;const now=performance.now();
  try{for(const n of CITY.npcs){if(n.say)n.say=null;if(!n.static&&!n.leaving)n.t0=now}
    for(const a of CITY.anim89||[])a.t0=now+1e9;
    CITY.chatT=now+1e9;if(CITY.mode!=='filing')CITY.beastT=now+1e9}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
/* the reveal spreads walker phases; under calm nobody may be due in that frame */
{const base=city100Reveal;city100Reveal=function(){const r=base.apply(this,arguments);try{if(city100Calm()){const t=performance.now();for(const n of CITY.npcs)if(!n.static&&!n.leaving)n.t0=t;for(const a of CITY.anim89||[])a.t0=t+1e9;CITY.chatT=t+1e9;CITY.beastT=t+1e9}}catch(e){console.error(e)}return r}}
