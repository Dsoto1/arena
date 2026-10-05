/* =====================================================================
   160-v88phone · v0.88 THE PHONE PASS (every v0.82–v0.88 screen at 390×844 portrait and 844×390 landscape)
   =====================================================================
   What was broken, and the fix (desktop untouched: every rule is scoped to phones — ≤600 px wide, a landscape window
   ≤500 px tall, or body.phoneL / body.phoneP2):
   • WINDOWS OVER A MATCH: a window opened during a match (market, draft, Focus roll, any modal) sat UNDER the match's
     phone drawers — portrait: the ⚔ Actions / 🛡 Fighter / 📜 Log sheet covered its lower half; landscape: the top-bar
     drawer and the actions panel covered it. While a window is up (body.modal-open) those drawers step aside.
   • LANDSCAPE WINDOWS fill the screen like portrait ones (99-phone73 only did ≤600 px wide; a phone on its side is 844 wide),
     and the Manager rail becomes the bottom swipe row there too (the grouped desktop rail filled the whole first screen).
   • TAP TARGETS: every button and select in a window ≥36×36 px (recruiting ☆ stars, yard −/+, sort icons, the × close);
     checkboxes 20 px; the main menu's slim rows (Annals · Rules · Saves · Settings) 40 px; the arena's ‹ tools handle 36 px.
   • PLAY NOW: the sticky start bar ran 8 px past both edges and its bottom sat under the screen edge.
   • NO SIDEWAYS SCROLL: wide tables (Match Week, the Lobby Browser) scroll inside their own box; the Lobby Browser's
     button row wraps; the Settings tab row scrolls sideways; Settings rows stand in one column (two squeezed columns
     wrapped the CPU speed buttons into three lines); the class designer's figure + card wrap instead of running off.
   • ONLINE: the rail's account box made every tab button 120 px tall → one slim swipe row; a phone on its side gets the
     one-column layout too (at 844 px the desktop three columns squeezed the Domus record to clipped words).
   • CREATOR STUDIO: the grouped rail (110-v77) filled the first ~450 px of the screen → one sticky swipe row of tabs; the
     Studio and Online rails scroll the open tab into view.
   • MARKET WINDOW (155): the board was 0 px wide on a phone on its side (its width came from 100vh − 400 px) → in landscape
     the board takes the height and the info panel stands beside it; in portrait it fits the width with the panel right under
     it; a lone armor piece on its pile gets a 36 px touch box (the art keeps its size; stacked pieces keep their own boxes so
     a tap never lands on the neighbour).
   • CARD POP-UP (#tip, the class card's two sides from 153): a tap shows it scaled to fit the screen, centred.
   • BEAST POPUP (152): "Tap to close" on touch screens instead of "Esc to close".
   • SMOOTH ARENA: draw()'s per-repaint read of the arena width (a forced layout) comes from a ResizeObserver on phones.
   • LIGHT BOARD (138 lite84On 'auto'): it engaged only when TW·N·dpr > 1600, which a 390-px phone never reaches (its board
     is ~370 px wide) — auto now also engages on any phone-sized screen (shorter side ≤600 px) with a DPR above 2.
   ===================================================================== */
const PH88Q='(max-width:600px),(max-height:500px) and (orientation:landscape)'; // i18n:skip
function ph88(){try{return matchMedia(PH88Q).matches}catch(e){return false}}
/* the light board: a sharp phone screen counts, whatever the board's pixel size */
{const base=lite84On;lite84On=function(){const v=SETTINGS.lite84||'auto';if(v==='auto'){const dpr=window.devicePixelRatio||1;if(dpr>2&&Math.min(screen.width||innerWidth,screen.height||innerHeight,innerWidth,innerHeight)<=600)return true}return base.apply(this,arguments)}}
/* a table wider than its window (Match Week, the Lobby Browser) scrolls inside its own box; tables that fit keep their layout */
setInterval(()=>{try{if(!ph88())return;const mb=document.getElementById('mBody');if(!mb||document.getElementById('modal').hidden)return;
  for(const t of mb.querySelectorAll('table.tally:not(.wide88)')){const p=t.parentElement;if(p&&t.offsetWidth>p.clientWidth+1)t.classList.add('wide88')}}catch(e){}},400);
/* the swipe rails (Studio, Online) bring the open tab into view */
function ph88RailShow(){if(!ph88())return;for(const r of document.querySelectorAll('#studio .sttabs.rail,#onl .onl-rail')){const on=r.querySelector('button.on');if(!on||r.scrollWidth<=r.clientWidth)continue;
  const x=on.offsetLeft-r.offsetLeft-(r.clientWidth-on.offsetWidth)/2;if(Math.abs(r.scrollLeft-x)>4)r.scrollLeft=Math.max(0,x)}}
{const base=studioRedraw;studioRedraw=function(){const r=base.apply(this,arguments);try{ph88RailShow()}catch(e){}return r}}
{const base=onlRedraw;onlRedraw=function(){const r=base.apply(this,arguments);try{ph88RailShow()}catch(e){}return r}}
for(const k of ['openStudio','onlineOpen'])if(typeof window[k]==='function'){const base=window[k];window[k]=function(){const r=base.apply(this,arguments);setTimeout(()=>{try{ph88RailShow()}catch(e){}},400);return r}}
/* no layout work per frame on phones: draw() reads the arena wrap's clientWidth on every repaint (a forced layout whenever
   anything on the page changed since the last frame). On phones a ResizeObserver keeps that width and the read returns it;
   a width change redraws. Desktop reads it live as before. */
(()=>{try{const wrap=cv&&cv.parentElement;if(!wrap||typeof ResizeObserver!=='function')return;const d=Object.getOwnPropertyDescriptor(Element.prototype,'clientWidth');
  let w=0;new ResizeObserver(en=>{const nw=Math.round(d.get.call(wrap));if(nw!==w){const had=w;w=nw;if(had&&ph88()&&S)try{draw()}catch(e){}}}).observe(wrap);
  Object.defineProperty(wrap,'clientWidth',{configurable:true,get(){return w&&ph88()?w:d.get.call(this)}})}catch(e){}})();
/* the card pop-up (#tip, 11-extra + 153's two-sided class card) on a phone: a tap shows it, and it fits the screen — scaled down
   and centred (the two class card sides are ~500 px wide). A stray mouseover at (0,0) that touch emulation sends right after a
   tap no longer hides it at once, and the 95 watchdog counts the last tapped card as hovered (TIP_TOUCH88) — it still hides
   the pop-up once the card is gone or another spot is tapped. */
const TIP_TOUCH88={el:null};
{let lastTouch=0;document.addEventListener('touchend',e=>{lastTouch=Date.now();const t=e.target;TIP_TOUCH88.el=(t&&t.closest&&t.closest('[data-card],[data-glad],[data-tokz]'))||null},{capture:true,passive:true});
  window.addEventListener('mouseover',e=>{if(e.clientX===0&&e.clientY===0&&Date.now()-lastTouch<700&&ph88())e.stopImmediatePropagation()},true);
  const tip=document.getElementById('tip');
  const fit=()=>{try{if(tip.hidden||!ph88()){if(tip.style.transform)tip.style.transform='';return}
    const w=tip.offsetWidth,h=tip.offsetHeight;if(!w||!h)return;const sc=Math.min(1,(innerWidth-16)/w,(innerHeight-16)/h);
    const tf=sc<1?`scale(${sc.toFixed(3)})`:'',L=Math.round((innerWidth-w*sc)/2)+'px',T=Math.round(Math.max(8,Math.min(innerHeight-h*sc-8,parseFloat(tip.style.top)||8)))+'px';
    if(tip.style.transform!==tf){tip.style.transformOrigin='0 0';tip.style.transform=tf}if(tip.style.left!==L)tip.style.left=L;if(tip.style.top!==T)tip.style.top=T}catch(err){}};
  if(tip)new MutationObserver(fit).observe(tip,{childList:true,attributes:true,attributeFilter:['hidden','style']})}
(()=>{const st=document.createElement('style');st.textContent=`
/* windows over a match: the phone drawers step aside while a window is up */
body.phoneP2.modal-open #ppTabs,body.phoneP2.modal-open #actions,body.phoneP2.modal-open aside.side,body.phoneP2.modal-open .logbar,body.phoneP2.modal-open header.bar,
body.phoneL.modal-open #actions,body.phoneL.modal-open aside.side,body.phoneL.modal-open .logbar,body.phoneL.modal-open header.bar,body.phoneL.modal-open #plDock{display:none!important}
body.phoneP2 #ctTog,body.phoneL #ctTog{min-width:36px;min-height:36px}
@media (max-height:500px) and (orientation:landscape){
  .mbox,.mbox.wide,.mbox.xwide{max-width:100vw!important;width:100vw!important;max-height:100dvh!important;height:100dvh;border-radius:0!important;padding:10px 12px!important;margin:0}
  .modal{padding:0!important}
  .onl-wrap,.onl-create,.onl-cprof{grid-template-columns:1fr!important}#onl .onl-wrap>*{min-width:0}
  .onl-rail{position:static!important;flex-direction:row!important;flex-wrap:nowrap!important;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;padding-bottom:4px}
  .onl-rail::-webkit-scrollbar{display:none}.onl-rail button{white-space:nowrap;flex:0 0 auto;padding:8px 10px!important;font-size:14px!important}.onl-rail>:not(button){flex:0 0 auto;white-space:nowrap}
  .onl-ged,.onl-room .onl-rbody{grid-template-columns:1fr}
  #modal.full .railwrap,.railwrap{display:flex!important;flex-direction:column-reverse;gap:8px}
  #modal.full .railwrap>.tabrow,.railwrap>.tabrow{flex-direction:row!important;position:sticky!important;top:auto!important;bottom:-10px;z-index:5;margin:0!important;background:#1c140e;border-top:1px solid var(--gold);padding:4px;gap:4px}
  #modal.full .railwrap .rail,.railwrap .rail{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;overflow-x:auto;gap:4px;padding:0!important;border:0!important;background:none!important;scrollbar-width:none;-webkit-overflow-scrolling:touch}
  #modal.full .railwrap .rail .railgrp,.railwrap .rail .railgrp{display:contents!important}#modal.full .railwrap .rail .railhd,.railwrap .rail .railhd{display:none!important}
  #modal.full .railwrap .rail button,.railwrap .rail button{flex:0 0 auto;white-space:nowrap;padding:7px 10px!important;border-radius:999px!important;font-size:13px;width:auto!important}
  #modal.full .railwrap .endwk{width:auto!important;flex:0 0 auto;font-size:12px;padding:6px 8px}
  .railwrap .railmain{min-width:0}
  .roomhd{height:64px}.roomttl span{display:none}
  .badges.mhead{flex-wrap:nowrap!important;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}.badges.mhead .badge{flex:0 0 auto;font-size:12px!important;padding:3px 7px!important}
  #mBody .mgrhd img,#mBody .mgrhd svg{max-height:56px}
  .mk88{display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:12px;align-items:start}
  .mk88>.mboard75{grid-row:1/span 4;grid-column:1;width:min(62vw,calc((100dvh - 90px) * 1.5456))!important}.mk88>:not(.mboard75){grid-column:2;min-width:0}
  #mk88peek .mk88{display:block}#mk88peek .mk88>.mboard75{width:100%!important}
}
@media (max-width:600px),(max-height:500px) and (orientation:landscape){
  #modal button,#modal .btn,#modal select,#modal .tin{min-height:36px}
  #modal button{min-width:36px}
  #modal .mclose:not(.saveq){width:36px;height:36px}
  .pn-start{margin:0!important;bottom:-12px!important}
  #modal input[type=checkbox]{width:20px;height:20px;flex:0 0 auto}
  #modal .r85st{min-width:36px!important;min-height:36px!important;display:inline-flex;align-items:center;justify-content:center}
  #modal .yo87pr,#modal .yo87sel{min-height:36px}
  #mainMenu .btn{min-height:40px}
  #tip{max-width:none!important;z-index:75}
  #mBody table.tally.wide88{display:block;max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}
  #onl .onl-lbtop .acts{display:flex;flex-wrap:wrap;gap:6px}
  #mBody .seg[role=tablist]{display:flex;max-width:100%;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
  #mBody .seg[role=tablist]>button{flex:0 0 auto}
  #mBody .seg[role=tablist]::-webkit-scrollbar{display:none}
  #onl .onl-rail{align-items:center}
  #onl .onl-rail button{min-height:36px;box-sizing:border-box}
  #onl .onl-rail .onl-acct{display:flex;align-items:center;gap:6px;white-space:nowrap;padding:2px 6px}
  #onl .onl-rail .onl-acct>*{margin:0!important}
  #studio .sttabs.rail{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;position:sticky;top:-12px;z-index:6;background:#1c140e;gap:4px;padding:4px 0!important;margin-bottom:8px;border:0!important}
  #studio .sttabs.rail::-webkit-scrollbar{display:none}
  #studio .sttabs.rail .railgrp{display:contents!important}
  #studio .sttabs.rail .railhd{display:none!important}
  #studio .sttabs.rail button{flex:0 0 auto!important;width:auto!important;white-space:nowrap;padding:7px 11px!important;border-radius:999px!important;font-size:13.5px;min-height:36px}
  #studio .setup-grid{grid-template-columns:minmax(0,1fr)!important}
  #studio .setup-grid>*{min-width:0}
  #studio div:has(>#clsCard){flex-wrap:wrap;justify-content:center}
  #studio #clsCard{max-width:100%}
  #studio #clsCard svg{max-width:100%;height:auto}
  .mk88 .mboard75{max-width:100%}
  .mk88 .mb-pile.n1 .mb-a{position:relative}
  .mk88 .mb-pile.n1 .mb-a::after{content:'';position:absolute;left:50%;top:50%;width:36px;height:36px;transform:translate(-50%,-50%)}
}
@media (max-width:600px){
  #mBody .setgrid:has(>.setrow){grid-template-columns:minmax(0,1fr)!important}
}`;document.head.appendChild(st)})();
