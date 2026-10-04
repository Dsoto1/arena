/* =====================================================================
   145-v85fix · v0.85 FIXES (his notes on v0.84)
   =====================================================================
   1 · Selecting a free agent no longer favorites him: the detail card's offer meter calls offerVerdict
       for a preview, and 70-v57's offerVerdict wrapper marked every previewed fighter favd + wrote g.court.
       Now only a real offer (the data-mg="offer" click) records the court line; favd stays with the
       real actions (scout, pitch, visit, gift, trial, offer, feast — 70's click list).
   2 · Match Week: 🗺 Walk the sand and 🏙 Walk the city square move into the right side of the Road box
       (".travelcard"): two stacked tiles in a ".road85side" column, the road/temple/sit-out on the left.
       Done on the nightHTML string (a <template>), so every data-mg handler still works. The walked-sand
       REPORT card (after walking) stays where it was; only the un-walked offer moves.
   ===================================================================== */
const FIX85={offering:0};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mg="offer"]');if(!b)return;FIX85.offering++;setTimeout(()=>{FIX85.offering=Math.max(0,FIX85.offering-1)},0)},true);
{const base=offerVerdict;offerVerdict=function(g){const keepF=g?g.favd:undefined,keepC=g?g.court:undefined;const r=base.apply(this,arguments);
  if(g&&!FIX85.offering){g.favd=keepF;if(keepC===undefined)delete g.court;else g.court=keepC}return r}}

/* 2 · Match Week: the walks join the Road box */
{const base=nightHTML;nightHTML=function(){const h=base.apply(this,arguments);try{if(typeof h!=='string'||h.indexOf('travelcard')<0)return h;
  const T=document.createElement('template');T.innerHTML=h;const road=T.content.querySelector('.travelcard');if(!road)return h;
  const walkBtn=T.content.querySelector('[data-mg="scoutarena"]');const walk=walkBtn&&walkBtn.closest('.card2');
  const cityBtn=T.content.querySelector('[data-mg="city"]');const cityRow=cityBtn&&cityBtn.closest('.acts');
  if(!walk&&!cityRow)return h;
  const side=document.createElement('div');side.className='road85side';
  if(walk&&walk!==road&&!walk.contains(road)){const tip=walk.querySelector('b[data-tip]');const t=document.createElement('div');t.className='road85t';
    t.innerHTML=`<div class="road85h">${tip?tip.outerHTML:'🗺 Walk the sand'}<span class="rc-sub">fighters on the card: <b>+1 AP, +1 coin</b></span></div>`;t.appendChild(walkBtn);walk.remove();side.appendChild(t)}
  if(cityRow){const t=document.createElement('div');t.className='road85t';t.appendChild(cityBtn);cityRow.remove();side.appendChild(t)}
  const left=document.createElement('div');left.className='road85main';while(road.firstChild)left.appendChild(road.firstChild);
  road.classList.add('road85');road.appendChild(left);road.appendChild(side);return T.innerHTML}catch(e){console.error(e);return h}}}
{const st=document.createElement('style');st.textContent=`
.travelcard.road85{display:grid!important;grid-template-columns:minmax(0,1fr) 250px;gap:12px;align-items:start}
.road85main{min-width:0}
.road85side{display:flex;flex-direction:column;gap:8px;border-left:1px solid var(--line2,#4a3826);padding-left:12px}
.road85t{display:flex;flex-direction:column;gap:6px;padding:8px;border:1px solid var(--line2,#4a3826);border-radius:8px;background:rgba(0,0,0,.18)}
.road85t .btn{width:100%;margin:0}.road85h{display:flex;flex-direction:column;gap:2px}.road85h .rc-sub{font-size:12px}
@media (max-width:760px){.travelcard.road85{grid-template-columns:1fr}.road85side{border-left:0;padding-left:0;flex-direction:row;flex-wrap:wrap}.road85t{flex:1 1 200px}}`;document.head.appendChild(st)}
