/* =====================================================================
   78-V60 · v0.60
   =====================================================================
   THE ROAD FROM THE CARD — every living gladiator in Your Play Now Gladiators (custom characters included) has
   🛣 Send on the Road at the top of their record (48-arena47's button, which only printed classes had); the walker's
   own record shows ⚔ Walk stage N instead. The Hall of Flavius keeps the Road's status, Walk stage and Abandon, but
   the long dropdown is gone: a button opens Your Play Now Gladiators to choose there.
   THE ANNALS LOOP — closing the Annals left its body (#hallBody) in the hidden window, so the next openHall() only
   re-rendered that hidden body and no window appeared; the launch watchdog then sent you back to the main menu.
   openHall now opens a fresh window whenever none is showing.
   ===================================================================== */
{const base=openHall;openHall=function(){try{if($('#modal').hidden){const hb=document.getElementById('hallBody');if(hb)hb.removeAttribute('id')}}catch(e){}return base.apply(this,arguments)}}
let ROAD_NOW=null; /* the Road as last read, for the cards (ludusDetail is synchronous) */
{const base=openLudus;openLudus=async function(){try{ROAD_NOW=await roadLoad()}catch(e){ROAD_NOW=null}return base.apply(this,arguments)}}
{const _ld=ludusDetail;ludusDetail=function(g){let h=_ld(g);if(!g||!gladActive(g)||g.cpu)return h;
  const R=ROAD_NOW&&!ROAD_NOW.over?ROAD_NOW:null;
  const btn=R&&R.gid===g.id?(()=>{const st=roadStage(R);return `<button type="button" class="btn roadsend primary" data-road="go" title="Opens New event with ${esc(g.name)} summoned">⚔ Walk stage ${R.step+1}: ${esc(st.L.n)}</button>`})()
    :`<button type="button" class="btn roadsend" data-roadsend="${g.id}" title="Win the twelve arenas in order with ${esc(g.name)}${R?` — replaces ${esc(R.name)}`:''}">🛣 Send on the Road</button>`;
  h=h.replace(/<button type="button" class="btn roadsend" data-roadsend="[^"]*"[^>]*>🛣 Send on the Road<\/button>/,'');
  return h.replace('<div class="gdetail" id="gDetail">',`<div class="gdetail" id="gDetail">${btn}`)}}
/* ⚔ Walk stage from the walker's record: the same hand-off as the Hall's button */
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('#ludusBody [data-road="go"]');if(!b)return;e.stopPropagation();
  const R=await roadLoad();if(!R||R.over)return;const g=LUDUS_CACHE.find(x=>x.id===R.gid);if(!g||!gladActive(g)){if(typeof mToast==='function')mToast('That gladiator can no longer walk the road.');return}
  const st=roadStage(R);const cur=CUR_MODAL;if(cur)cur.done('road');
  setTimeout(()=>{CFG.mode='event';CFG.loc=st.li;CFG.ev=st.ev;const E=EVENTS[st.ev];CFG.n=clamp(CFG.n,E.min,E.max);summonToSetup(g);CFG.road={gid:R.gid,step:R.step,loc:st.li,ev:st.ev};openSetup()},120)},true);
/* the Hall: no dropdown — choose from the gladiators' records */
{const base=roadVisualHTML;roadVisualHTML=function(R,cand,old){let h=base.apply(this,arguments);
  const pick=`<div class="acts" style="align-items:center"><button class="btn primary" type="button" data-tab="ludus">🛡 Choose from Your Play Now Gladiators</button><span class="rc-sub">open a gladiator's record and press 🛣 Send on the Road</span></div>`;
  h=h.replace(/<div class="acts" style="align-items:center"><select class="tin" id="roadPick">[\s\S]*?<\/select><button[^>]*data-road="commit"[^>]*>[\s\S]*?<\/button><\/div>/,pick)
     .replace('<p class="rc-sub">You need a living gladiator of the eight classes on your roster (save one after an event).</p>',pick)
     .replace(' — or pick them here.','.');
  return h}}
/* SMOOTH HAND-OFFS BETWEEN WINDOWS: when a window opened from the main menu closes, the menu used to come back at once —
   even when another window (Annals ⇄ Your Play Now Gladiators, the Road, a record) was about to take its place, so the
   menu flashed between them. Now the curtain covers the gap and the menu returns only if nothing else opened. */
{const base=mmAfterClose;mmAfterClose=function(){if(!MM.fromMenu)return base.apply(this,arguments);const a=arguments,self=this;
  if(typeof transitCover==='function'&&!HEADLESS)transitCover(1200);
  setTimeout(()=>{if(!$('#modal').hidden||CUR_MODAL){if(typeof transitUncover==='function')transitUncover();return}base.apply(self,a);setTimeout(()=>{if(typeof transitUncover==='function')transitUncover()},120)},320)}}
