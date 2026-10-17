/* 389-v105sq (v1.05 B74 + B75): the City Square is locked until the house has SET OFF.
   • B74: in a Match Week away from home (a trip to pay / set off for) EVERY way into the host city's square is refused until the house sets off:
     citySquareGate (rail/map/Imperium data-ct="square" entries) and openCitySquare refuse, and the banner's Walk the city square button shows
     "🔒 Set off first" (disabled, title + small text). After Set off it opens as before. A home-city week (no trip), a bye, the lesson and a finished
     week are open. REPLACES beta 3's "Set off for X?" ask when walking the square (360 no longer routes the city button into it).
   • B75: the Match Week slim banner drops the trip chip, the world-event chip and the temple / sand links; the trip cost sits on the Set off
     button ("🛣 Set off for Pompeii · 🪙15", free trip → "· free"). (The chips are skipped in 360 mw105Shape via sq105On.)
   Kill switch: localStorage flavius_v105sqoff=1 (beta 3 behaviour). Test tv105aa. */
function sq105On(){try{return localStorage.getItem('flavius_v105sqoff')!=='1'&&localStorage.getItem('flavius_v105aoff')!=='1'}catch(e){return true}}
function sq105Locked(w,li){try{if(!sq105On())return false;w=w||W_();const n=w&&w.night;if(!n||n.bye||n.selfBye||w.tutorial||w.dead)return false;if(li!=null&&+li!==+n.loc)return false;
  const t=n.travel;if(!t||!(t.cost>0)||t.gone)return false;return !n.bouts.every(b=>b.done)}catch(e){return false}}
const sq105Why=()=>_T('🔒 Set off first');
function sq105Label(w,city){const t=w.night.travel;const c=t&&(t.free105||t.deal)?_T('free'):coinAmt87(t.cost);return _T`🛣 Set off for ${esc(city)} · ${c}`}
{const base=citySquareGate;citySquareGate=function(li){const r=base.apply(this,arguments);if(r)return r;return sq105Locked(null,li)?sq105Why():r}}
{const base=openCitySquare;openCitySquare=function(li){if(sq105Locked(null,li)){try{mToast(sq105Why())}catch(e){}return}return base.apply(this,arguments)}}
/* the Manager's own Walk button: stop it before anything else listens */
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mg="city"]');if(!b||!b.closest('#mgrBody')||!sq105Locked())return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();try{mToast(sq105Why())}catch(x){}},true);
{const base=mw105Shape;mw105Shape=function(T,w){const r=base.apply(this,arguments);
  try{if(r&&sq105On()){const hd=T.content.querySelector('.roomhd.mw105ban');if(hd){const note=hd.querySelector('.walk96 .city90n');
    if(sq105Locked(w)){const b=hd.querySelector('.walk96b');if(b){b.disabled=true;b.setAttribute('data-sq105','1');b.title=sq105Why();b.innerHTML=sq105Why()}
      if(note){note.textContent=_T('The square opens once the house sets off.')}}
    else if(note)note.remove()}}}catch(e){console.error(e)}
  return r}}
