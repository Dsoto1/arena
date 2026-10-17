/* 365-v105cal — v1.05 (his q1a): every NEW Manager career starts at Season 1, week 1 and counts its own seasons.
   Before: newWorld joined the shared empire calendar (calNow) — a new career could open in season 5 — and makeNight pushed the empire
   calendar forward (calSet), with a "behind the empire" banner (lagBannerHTML) unless w.ownCal.
   Now: newWorld runs with calNow() answering season 1, week 1 (and calSet a no-op) for the whole creation, so everything the other
   modules derive from the season (the fixture and the first night, 348's cal104 calendar, the 349 careers' curve, startSeason, the
   "joining mid-season" records) is built for season 1 — nothing is regenerated afterwards. The world gets w.ownCal=true and w.cal105=1;
   a career with w.cal105 never moves the empire calendar (makeNight's calSet is skipped) and never shows the lag banner.
   Existing careers (no w.cal105) and the lesson career (w.tutorial) are untouched. Kill switch: localStorage flavius_v105caloff=1 = the old join. */
const CAL105={off:(()=>{try{return localStorage.getItem('flavius_v105caloff')==='1'}catch(e){return false}})(),on:0};
{const baseNow=calNow,baseSet=calSet;
  calNow=function(){if(CAL105.on)return {season:1,week:1,fx:fixtureFor(1,1)};return baseNow.apply(this,arguments)};
  calSet=function(){if(CAL105.on)return;try{const w=typeof W_==='function'?W_():null;if(w&&w.cal105)return}catch(e){}return baseSet.apply(this,arguments)}}
{const base=newWorld;newWorld=function(choice){
  if(CAL105.off||(choice&&choice.tutorial))return base.apply(this,arguments);
  CAL105.on++;let w;try{w=base.apply(this,arguments)}finally{CAL105.on--}
  try{if(w&&!w.tutorial){w.ownCal=true;w.cal105=1;if(typeof saveWorld==='function')saveWorld(true)}}catch(e){console.error(e)}
  return w}}
if(typeof calLag==='function'){const base=calLag;calLag=function(){try{const w=W_();if(w&&w.cal105)return 0}catch(e){}return base.apply(this,arguments)}}
