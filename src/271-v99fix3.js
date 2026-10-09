/* 271-v99fix3 — v0.99 fixes from his notes V99 (answers 2026-10-09; no sub-agents, no CI until the release):
   1b  Multiplayer button: no "Hot seat · Online" under it (246 edit)
   5a/6a/6b  one fixed place for both lessons' coach boxes: Learn to play = the upper-left corner of the arena window (29 tutPlace), the Manager
        lesson = a fixed corner dock with a steady height (CSS below); tablets/phones = a full-width sheet above the bottom bar
   5b  the teachers are city editors, not Flavius (29 TUTOR99 / 36 MTUTOR99)
   5c  Learn to play step 3/10 lights the 🐾 Field tab (29 t_roster spot)
   7a  Online → Profile & Settings: when the page cannot be built, the tab shows the reason + a reference code + Try again (it showed the Hall body / nothing)
   7b  a refresh inside the Online window reopens the Online window on the same tab (sessionStorage flavius_onlopen99; a live match still wins)
   (more items are added below as they are built) */
(()=>{try{if(typeof document==='undefined')return;const st=document.createElement('style');st.id='fix99b';st.textContent=`
.tutcoach{transition:none!important}
.tutcoach.mtut{left:auto;right:14px;top:auto;bottom:14px;max-width:min(430px,92vw);min-height:132px}
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
{const base=onlRedraw;onlRedraw=function(){const r=base.apply(this,arguments);try{if(document.getElementById('onl')){const t=ONL.tab==='visit'?'play':(ONL.tab||'play');sessionStorage.setItem('flavius_onlopen99',t)}}catch(e){}return r}}
{const base=onl96Auto;onl96Auto=async function(){try{return await base.apply(this,arguments)}finally{ON99.done=true}}}
/* pagehide while the window is open must keep the flag (the modal promise never resolves on a refresh, so nothing clears it) */
{const t0=Date.now();const iv=setInterval(()=>{try{if(Date.now()-t0>70000){clearInterval(iv);return}
  if(!ON99.done||!window.FLAVIUS_READY)return;clearInterval(iv);
  let tab=null;try{tab=sessionStorage.getItem('flavius_onlopen99')}catch(e){}
  if(!tab||!(typeof ONL_ON==='function'&&ONL_ON()))return;
  if((typeof CUR_MODAL!=='undefined'&&CUR_MODAL)||(S&&S.onl&&!S.over)||document.getElementById('onl'))return;
  const m=document.getElementById('mainMenu');if(m&&m.hidden)return;
  onlineOpen(tab)}catch(e){clearInterval(iv)}},300)}
