/* 209-v92cheer — v0.92 THE CROWD CHEERS IN BURSTS (his note 2026-10-06: "the spectators raise their arms all event").
   193 painted a delighted spectator with both arms up and a furious one with a fist up for as long as the mood lasted. Now the pose is a
   short BURST (0.9–1.6 s): delighted spectators throw their arms up every few seconds, pleased ones now and then, furious ones shake a
   fist; a hit, a kill or a big moment (crowdReact) sends a wave through the happy part of the stands. Between bursts they sit (the face
   keeps the mood). Cheap: the poses are cached sprites (193 sprite91 key carries the pose), one tick every 700 ms, at most one redraw a
   tick and only when a pose changed; nothing in a hidden tab, in idle mode (204 body.idle92), with Reduce motion / animations off,
   in sims. Display only — Math.random, never the dice. */
const CHEER92={tick:700,on:true,
  /* chance per tick to START a burst, by mood bucket (0 furious · 1 annoyed · 2 neutral · 3 pleased · 4 delighted) */
  p:[0.05,0,0.004,0.02,0.09],dur:[900,1600],
  wave:{hit:0.12,elim:0.45,boss:0.3,beast:0.25,topple:0.2,spear:0.15,mf:0.2,gift:0.1}};
function cheer92OK(){try{if(!CHEER92.on||HEADLESS||!S||S.sim||S.over||!STANDS)return false;if(document.visibilityState==='hidden'||document.body.classList.contains('idle92'))return false;
  if(typeof reduceMotion==='function'&&reduceMotion())return false;if(typeof SETTINGS!=='undefined'&&SETTINGS.anim88==='off')return false;return true}catch(e){return false}}
/* the pose a spectator shows now: a burst, else seated (null when the old always-on rule should apply — never, from v0.92) */
function cheer92Pose(sp,now){if(sp&&sp._cu92>now)return sp._cp92;return 0}
{const base=look91;look91=function(sp,back){const o=base.apply(this,arguments);try{o.up=cheer92Pose(sp,performance.now())}catch(e){}return o}}
function cheer92Start(sp,now,lv){const d=CHEER92.dur[0]+Math.random()*(CHEER92.dur[1]-CHEER92.dur[0]);sp._cu92=now+d;sp._cp92=lv===0?1:2}
setInterval(()=>{if(!cheer92OK())return;const now=performance.now();let changed=false;
  for(const sp of S.spect||[]){if(sp.out||sp.speared)continue;const was=sp._cu92>now-CHEER92.tick&&sp._cu92<=now;if(was)changed=true;
    if(sp._cu92>now)continue;const lv=typeof moodLv91==='function'?moodLv91(sp.mood||0):2;if(Math.random()<CHEER92.p[lv]){cheer92Start(sp,now,lv);changed=true}}
  if(changed&&typeof draw==='function'&&!(typeof fxRAF!=='undefined'&&fxRAF))draw()},CHEER92.tick);
/* a wave on the big moments: the happy part of the stands (or, for a beast / a spear, anyone) */
{const base=crowdReact;crowdReact=function(kind,info){const r=base.apply(this,arguments);try{const f=CHEER92.wave[kind];if(f&&cheer92OK()){const now=performance.now();
  for(const sp of S.spect||[]){if(sp.out||sp.speared||sp._cu92>now)continue;const lv=typeof moodLv91==='function'?moodLv91(sp.mood||0):2;if(lv>=2&&Math.random()<f)cheer92Start(sp,now,lv)}
  if(!(typeof fxRAF!=='undefined'&&fxRAF))draw()}}catch(e){}return r}}
