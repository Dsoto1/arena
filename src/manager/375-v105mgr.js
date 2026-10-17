/* v1.05 (375-v105mgr) · MANAGER — two of his calls (tools/plans/v105/NOTES.md B46, B48; docs/decisions.md 2026-10-17).
   B46 GOLDEN EAGLE: a Match Week week has AT MOST ONE bout with the Eagle among its Blessings (about half the weeks have one, the rest none).
     eg105Pick(w) = hashStr(w.id:season:week) -> even = an Eagle week, the bout is picked from the same hash among the bouts that can carry it (not the
     Eagle event itself, the chariot race, the naumachia). Never the dice RNG. boutCfg wrapper sets opts.eaglePot only on that bout; the "🦅 Golden
     Eagle in play" chip (272's night post-process) asks eg105Has(w,i). Exhibitions and yard trials carry no Eagle (17's three specs ask eg105Live()).
     Play Now, tournaments (22-trophies) and Online are untouched. REPLACES eaglePot on every Manager bout.
   B48 INFIRMARY HAS NO BUILD BUTTON: every [data-mg="build"] on the infirmary page (351's Valetudinarium plate keeps its face) becomes a "Build it in My Ludus" link that opens the Upgrade School (333's
     LU102.fac popup, where buildings are bought); any other [data-mg="build"] left on the infirmary page is swept to the same link. Built
     buildings and staff hiring work as before. Hygeia, Asclepius, the surgeon and the bathhouse are CARE bookings (hours + coin, cancellable),
     not buildings, and stay.
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
function b105Link(){return `<span class="b105lk v101lnk" role="button" tabindex="0" data-b105="1">${_T`Build it in My Ludus →`}</span>`}
{const base=mgrHTML;mgrHTML=function(){let h=base.apply(this,arguments);try{if(!eg105Live()||typeof h!=='string'||MGR.tab!=='infirm'||h.indexOf('data-mg="build"')<0)return h;
  const t=document.createElement('template');t.innerHTML=h;
  for(const b of t.content.querySelectorAll('[data-mg="build"]')){
    if(b.classList.contains('v104pl')){const nm=b.querySelector('.v104pb > b'),fx=b.querySelector('.v104fx'),ph=b.querySelector('.v104ph'); /* 351's Valetudinarium plate: same face, a link instead of the button */
      b.outerHTML=`<div class="v104pl plantile b105pl" data-v104p="build"><span class="rm100fr">${(b.querySelector('.rm100fr')||{innerHTML:''}).innerHTML}</span><span class="v104pb"><b>${nm?nm.innerHTML:'🏗'}</b>${ph?ph.outerHTML:''}${fx?fx.outerHTML:''}${b105Link()}</span></div>`}
    else b.outerHTML=b105Link()}
  return t.innerHTML}catch(e){console.error(e)}return h}}
function b105Go(){MGR.tab='ludus';MGR.view=null;if(typeof LU100!=='undefined')LU100.pop=null;if(typeof LU102!=='undefined')LU102.fac=true;if(typeof MGR_REDRAW==='function')MGR_REDRAW()}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-b105]');if(!b||!b.closest('#mgrBody'))return;e.preventDefault();e.stopPropagation();b105Go()},true);
document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const b=e.target&&e.target.closest&&e.target.closest('[data-b105]');if(!b||!b.closest('#mgrBody'))return;e.preventDefault();e.stopPropagation();b105Go()},true);
try{const st=document.createElement('style');st.textContent='.b105pl{cursor:default}.b105lk{display:inline-block;margin-top:4px;cursor:pointer;text-decoration:underline;color:var(--gold,#d6ab4c)}';document.head.appendChild(st)}catch(e){}
