/* v1.05 (375-v105mgr) · MANAGER — two of his calls (tools/plans/v105/NOTES.md B46, B48; docs/decisions.md 2026-10-17).
   B46 GOLDEN EAGLE: a Match Week week has AT MOST ONE bout with the Eagle among its Blessings (about half the weeks have one, the rest none).
     eg105Pick(w) = hashStr(w.id:season:week) -> even = an Eagle week, the bout is picked from the same hash among the bouts that can carry it (not the
     Eagle event itself, the chariot race, the naumachia). Never the dice RNG. boutCfg wrapper sets opts.eaglePot only on that bout; the "🦅 Golden
     Eagle in play" chip (272's night post-process) asks eg105Has(w,i). Exhibitions and yard trials carry no Eagle (17's three specs ask eg105Live()).
     Play Now, tournaments (22-trophies) and Online are untouched. REPLACES eaglePot on every Manager bout.
   B48 INFIRMARY SHOWS NO UNBUILT BUILDING (his call 2026-10-17; replaces the first B48 "Build it in My Ludus" link plate): every [data-mg="build"] on
     the infirmary page is REMOVED with its plate / section, so no button, link, art or price is left and the grid closes up (351's Valetudinarium
     .v104pl plate is deleted whole; 318's .iv90s.bd section too; a stray button elsewhere goes, and an emptied .acts with it). Buildings are
     bought only through the advisors / building upgrades in My Ludus. Built buildings and staff hiring work as before. Hygeia, Asclepius, the
     surgeon, the Medicus and the bathhouse are CARE bookings (hours + coin, cancellable), not buildings, and stay.
   Kill switch localStorage flavius_v105mgroff=1 (both back to today). Test tv105l. */
function eg105Live(){try{return localStorage.getItem('flavius_v105mgroff')!=='1'}catch(e){return true}}
function eg105Can(b){const E=EVENTS[b&&b.ev]||{};return !(E.kind==='eagle'||(b&&(b.ev==='chariot'||b.ev==='naumachia')))}
/* the index of the week's Eagle bout in w.night.bouts; -1 none; -2 = kill switch (every bout, as before) */
function eg105Pick(w){try{w=w||W_();const n=w&&w.night;if(!n||!n.bouts||!n.bouts.length)return -1;if(!eg105Live())return -2;
  const h=hashStr(String(w.id)+':'+w.season+':'+w.week)>>>0;if(h%2)return -1;
  const C=[];n.bouts.forEach((b,i)=>{if(eg105Can(b))C.push(i)});if(!C.length)return -1;return C[(h>>>1)%C.length]}catch(e){return -1}}
function eg105Has(w,i){const p=eg105Pick(w);return p===-2?true:p===i}
{const base=boutCfg;boutCfg=function(bout){const cfg=base.apply(this,arguments);try{const w=W_();if(!cfg||!cfg.opts||!w||!w.night||!eg105Live())return cfg;
  const i=w.night.bouts.indexOf(bout);if(i<0)return cfg;cfg.opts=Object.assign({},cfg.opts,{eaglePot:eg105Pick(w)===i})}catch(e){}return cfg}}

/* ---- B48 ---- */
{const base=mgrHTML;mgrHTML=function(){let h=base.apply(this,arguments);try{if(!eg105Live()||typeof h!=='string'||MGR.tab!=='infirm'||h.indexOf('data-mg="build"')<0)return h;
  const t=document.createElement('template');t.innerHTML=h;
  for(const b of t.content.querySelectorAll('[data-mg="build"]')){
    const pl=b.closest('.v104pl'),sc=b.closest('.iv90s.bd'),ac=b.parentElement;
    if(pl)pl.remove();else if(sc)sc.remove();else{b.remove();if(ac&&ac.classList.contains('acts')&&!ac.children.length&&!ac.textContent.trim())ac.remove()}}
  return t.innerHTML}catch(e){console.error(e)}return h}}
