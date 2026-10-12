/* 271-v99fix3 — v0.99 fixes from his notes V99 (answers 2026-10-09; no sub-agents, no CI until the release):
   1b  Multiplayer button: no "Hot seat · Online" under it (246 edit)
   5a/6a/6b  one fixed place for both lessons' coach boxes: Learn to play = the upper-left corner of the arena window (29 tutPlace), the Manager
        lesson = a fixed corner dock with a steady height (CSS below); tablets/phones = a full-width sheet above the bottom bar
   5b  the teachers are city editors, not Flavius (29 TUTOR99 / 36 MTUTOR99)
   5c  Learn to play step 3/10 lights the 🐾 Field tab (29 t_roster spot)
   7a  Online → Profile & Settings: when the page cannot be built, the tab shows the reason + a reference code + Try again (it showed the Hall body / nothing)
   7b  a refresh inside the Online window reopens the Online window on the same tab (sessionStorage flavius_onlopen99; a live match still wins)
   9a  online: 🤖 Hand to CPU / 🎮 Take control are not offered in an online match (the toggle changed only that screen's seat: the other clients kept waiting for a
        player who was playing no more = the frozen screen / the results that never came); Abandon is the way out
   10b/10c online room: ▶ Start (and the seat's ✓ Ready) sit in a foot bar at the bottom right of the lobby; Ready leaves Quick chat (its phrase chip is dropped)
   11a the Focus / Throw toggles (and the weapon docks) glow ember-orange when on; other `.on` buttons of the bar get a brighter gold edge
   12a Naumachia: the hull HP / sunk labels fade away once the event is over (900 ms)
   12c Flavius' box is not drawn while the board is zoomed in
   13b audio stutter while the window is resized: the music scheduler looks 3 s ahead during a resize (21 pump) and a resize STORM (3+ events in 300 ms) folds
        its board redraws into one per animation frame
   (more items are added below as they are built) */
(()=>{try{if(typeof document==='undefined')return;const st=document.createElement('style');st.id='fix99b';st.textContent=`
.tutcoach{transition:none!important}
.tutcoach.mtut{left:auto;right:14px;top:auto;bottom:14px;max-width:min(430px,92vw);min-height:132px}
#actions .grid98 .dock98 .btn.b96.on,#actions .grid98 .btn.fo98.on,#actions .grid98 .dock98 .th98.on{border:1px solid #ff6a3d!important;background:linear-gradient(#7a2c18,#44190e)!important;color:#fff0cc;box-shadow:0 0 0 1px #ff6a3d,0 0 11px 2px rgba(255,106,61,.7),inset 0 0 9px rgba(255,150,100,.35)!important}
#actions .grid98 .btn.on:not(.fo98):not(.th98){box-shadow:0 0 0 1px var(--gold),0 0 8px rgba(240,207,125,.5)}
#onl .r99-foot{display:flex;justify-content:flex-end;align-items:center;gap:10px;margin-top:14px;padding-top:10px;border-top:1px solid var(--line2,#4a3a26)}
#onl .r99-foot .r80-go{display:flex;gap:10px;align-items:center;justify-content:flex-end;flex-wrap:wrap;margin:0}
#onl .r99-foot [data-onl="start"]{min-width:190px;font-size:18px;padding:11px 26px;box-shadow:0 0 0 1px #e6c56a,0 4px 14px rgba(0,0,0,.5)}
#onl .r99-foot [data-onl="rready"]{min-width:170px;font-size:17px;padding:10px 22px}
#onl .r99-foot [data-onl="rready"].primary{background:linear-gradient(#3f7d3a,#2a5a27);border-color:#7fd070;color:#f2ffe8;box-shadow:0 0 0 1px #7fd070,0 0 12px rgba(127,208,112,.55)}
@media (max-width:900px){.tutcoach.mtut{left:8px;right:8px;bottom:64px;max-width:none;min-height:0}}
`;document.head.appendChild(st)}catch(e){console.error(e)}})();

/* 7a · Profile & Settings that fails must say so. 180's onlHTML wrapper swallows a throw and returns the plain Hall body (so the tab looked empty). */
{const base=onlHTML;onlHTML=function(){const h=base.apply(this,arguments);
  try{if(ONL.tab==='prof'&&typeof h==='string'&&h.includes('class="onl-rail"')&&!/class="pr(89|98)/.test(h)){
    let why='';try{l89ProfHTML()}catch(e){why=errText92(e,_T('Something went wrong.'))}
    if(!why)why=_T('The page did not load.');
    return l89Main(h,`<div class="pr98"><div class="card2 pr98-c"><h3>${_T`👤 Profile & Settings`}</h3><p class="onl-err">${esc2(why)}</p><p class="rc-sub">${_T`Copy it from Settings → Error log if it keeps happening.`}</p><button type="button" class="btn tksm" data-onl="tab" data-v="prof">${_T`↻ Try again`}</button></div></div>`)}}catch(e){console.error(e)}
  return h}}

/* 7b · refresh in the Online menu returns to the Online menu. The flag lives in sessionStorage (this tab only): set while the window is open (and
   follows its tab), cleared when it closes. On load, once the match auto-return (234 onl96Auto) has decided, an open flag reopens Online. */
const ON99={done:false};
{const base=onlineOpen;onlineOpen=async function(tab){try{sessionStorage.setItem('flavius_onlopen99',tab||ONL.tab||'play')}catch(e){}
  try{return await base.apply(this,arguments)}finally{if(!ON99.keep){try{sessionStorage.removeItem('flavius_onlopen99')}catch(e){}}ON99.keep=false}}}
{const base=onlRedraw;onlRedraw=function(){const r=base.apply(this,arguments);try{if(document.getElementById('onl')&&typeof CUR_MODAL!=='undefined'&&CUR_MODAL){const t=ONL.tab==='visit'?'play':(ONL.tab||'play');sessionStorage.setItem('flavius_onlopen99',t)}}catch(e){}return r}}
{const base=onl96Auto;onl96Auto=async function(){try{return await base.apply(this,arguments)}finally{ON99.done=true}}}
/* pagehide while the window is open must keep the flag (the modal promise never resolves on a refresh, so nothing clears it) */
{const t0=Date.now();const iv=setInterval(()=>{try{if(Date.now()-t0>70000){clearInterval(iv);return}
  if(!ON99.done||!window.FLAVIUS_READY)return;clearInterval(iv);
  let tab=null;try{tab=sessionStorage.getItem('flavius_onlopen99')}catch(e){}
  if(!tab||!(typeof ONL_ON==='function'&&ONL_ON()))return;
  if((typeof CUR_MODAL!=='undefined'&&CUR_MODAL)||(S&&S.onl&&!S.over)||document.getElementById('onl'))return;
  const m=document.getElementById('mainMenu');if(m&&m.hidden)return;
  onlineOpen(tab)}catch(e){clearInterval(iv)}},300)}

/* 12a · Naumachia: hull labels fade when the event concludes */
{const base=drawFX;drawFX=function(){try{if(S&&S.over&&S.ships&&S.ships.length&&typeof isNaum==='function'&&isNaum()&&!HEADLESS){
    const t0=S._over99||(S._over99=Date.now());const a=1-(Date.now()-t0)/900;
    if(a<=0){const sv=S.ships;S.ships=[];try{return base.apply(this,arguments)}finally{S.ships=sv}}
    ctx.save();ctx.globalAlpha=Math.max(0,a);try{return base.apply(this,arguments)}finally{ctx.restore();requestAnimationFrame(()=>{try{draw()}catch(e){}})}}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
/* 12c · no Flavius mood box while zoomed in */
{const base=drawFlavius;drawFlavius=function(){try{if(!HEADLESS&&typeof ar91Zoomed==='function'&&ar91Zoomed())return}catch(e){}return base.apply(this,arguments)}}

/* 13b · resizing the window: the main thread was busy with a full board redraw per resize event (plus two more from the phone modules), so the 100 ms music pump
   missed its slots. RZ99.t = the last resize; the pump (21) schedules 3 s ahead for 1.5 s after it; a storm of events folds draw() into one per frame. */
const RZ99={t:0,n:0,t0:0,raf:0};
addEventListener('resize',()=>{const n=Date.now();if(n-RZ99.t0>300){RZ99.n=0;RZ99.t0=n}RZ99.n++;RZ99.t=n},true);
{const base=draw;draw=function(){if(!HEADLESS&&RZ99.n>=3&&Date.now()-RZ99.t<250){if(!RZ99.raf)RZ99.raf=requestAnimationFrame(()=>{RZ99.raf=0;try{base.call(this)}catch(e){console.error(e)}});return}
  return base.apply(this,arguments)}}

/* 10b/10c · the room's foot: Start / Ready at the bottom right, big; the 'Ready' phrase no longer sits among the quick-chat chips */
{const base=onlRoomHTML80;onlRoomHTML80=function(L,grey){const h=base.apply(this,arguments);
  try{if(typeof h!=='string'||!h.includes('id="onlRoom80"'))return h;const T=document.createElement('template');T.innerHTML=h;const root=T.content.querySelector('#onlRoom80');if(!root)return h;
    const chip=root.querySelector('[data-onl="rsay"][data-v="ready"]');if(chip)chip.remove();
    const go=root.querySelector('.r80-go');if(go&&!root.querySelector('.r99-foot')){const foot=document.createElement('div');foot.className='r99-foot';foot.appendChild(go);root.appendChild(foot)}
    return T.innerHTML}catch(e){console.error(e);return h}}}

/* 9a · online matches run in lockstep: a local seat hand-off desyncs the table (his notes 9a-9c). Not offered online. */
{const base=seatCanToggle;seatCanToggle=function(player){try{if(S&&S.onl)return false}catch(e){}return base.apply(this,arguments)}}
