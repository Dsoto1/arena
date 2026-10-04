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
   3 · Match Week banner: the count box becomes the BOUT TRACKER — three boxes (Fri Undercard → Sat Feature →
       Sun Main event) joined by arrows; the next one up is lit (click → scrolls to its card), a fought bout is
       struck through with a sword slash and shows your fighter's result; your fighter's entry shows as a dot.
   4 · Road deals: accepting a house's offer to pay the road ENTERS their chosen fighter at once, in the bout
       that suits his rating (TIERS lo/hi; the closest open, unclosed bout), replacing the weakest free agent
       like "Enter your fighter"; the offer names that bout.
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

/* 3 · the bout tracker on the Match Week banner */
const BT85_DAY={under:'Fri',feature:'Sat',main:'Sun'};
function boutTrack85(){const w=W_(),m=me();const n=w&&w.night;if(!n||n.bye||!n.bouts||!n.bouts.length)return '';
  const mine=new Set(rosterOf(m).map(g=>g.id));const nextI=n.bouts.findIndex(b=>!b.done);
  const box=(b,i)=>{const T=TIERS[b.tier]||{n:b.tier};const me1=b.ents.find(id=>mine.has(id));const g=me1&&gById(me1);
    let st=b.done?'done':i===nextI?'next':'later';let res='';
    if(b.done&&g){const r=b.res||{};const won=r.winner===g.id||(r.wid===g.id)||(Array.isArray(r.winners)&&r.winners.includes(g.id));res=g.alive===false?'🪦':won?'🏆':'✓'}
    return `<button type="button" class="bt85 ${st}" data-bt85="${i}" title="${esc(T.n)}${g?` · ${esc(g.name)}`:''}${b.done?' · fought':i===nextI?' · up next':''}"><span class="bt85d">${BT85_DAY[b.tier]||''}</span><b>${esc((T.n||'').replace(' bout','').replace(' event',''))}</b><span class="bt85m">${g?'●':''}${res?' '+res:''}</span>${b.done?'<i class="bt85x"></i>':''}</button>`};
  return `<div class="roomstat bt85w">${n.bouts.map((b,i)=>box(b,i)).join('<span class="bt85a">➜</span>')}</div>`}
{const base=bannerStat73;bannerStat73=function(k){if(k==='night'){try{const h=boutTrack85();if(h){const s=tabStat73(k);return h.replace('</div>',(s?`<span class="bt85n">${s[0]} ${esc(s[1])}</span>`:'')+'</div>')}}catch(e){console.error(e)}}return base.apply(this,arguments)}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-bt85]');if(!b)return;e.stopPropagation();const i=+b.dataset.bt85;const c=document.querySelectorAll('#mgrBody .card2.bout')[i];if(c)c.scrollIntoView({behavior:typeof reduceMotion==='function'&&reduceMotion()?'auto':'smooth',block:'start'})},true);
{const st=document.createElement('style');st.textContent=`
.roomstat.bt85w{display:flex!important;flex-direction:row!important;align-items:center;gap:4px;flex-wrap:wrap;justify-content:flex-end;max-width:440px;padding:6px 10px;border-radius:12px}
.roomstat.bt85w span.bt85a,.roomstat.bt85w .bt85 span{font-size:inherit}.roomstat.bt85w .bt85 b{font:700 12.5px var(--sans,system-ui);color:inherit;background:none;padding:0;border-radius:0}
.bt85{position:relative;display:flex;flex-direction:column;align-items:center;min-width:74px;padding:4px 8px;border-radius:8px;border:1px solid rgba(214,171,76,.35);background:rgba(20,14,8,.78);color:#cdbb95;font:600 12px var(--sans,system-ui);cursor:pointer;overflow:hidden}
.bt85 b{font-size:12.5px;color:inherit}.bt85d{font:600 9.5px var(--mono);letter-spacing:.08em;text-transform:uppercase;opacity:.8}.bt85m{font-size:11px;min-height:13px;color:#f0cf7d}
.bt85.next{border-color:#f0cf7d;color:#fff3d6;box-shadow:0 0 0 1px #f0cf7d inset,0 0 12px rgba(240,207,125,.35);background:linear-gradient(180deg,#4a3714,#2a1e0c)}
.bt85.later{opacity:.55}.bt85.done{color:#a8987a;border-color:rgba(160,140,110,.35)}
.bt85x{position:absolute;left:-6%;right:-6%;top:50%;height:3px;transform:rotate(-24deg);background:linear-gradient(90deg,transparent,#d8dde3 12%,#9aa4ad 70%,#5e666e 88%,transparent);box-shadow:0 0 3px rgba(0,0,0,.6);pointer-events:none}
.bt85x::after{content:'';position:absolute;right:8%;top:-3px;width:6px;height:9px;background:#8a6a2a;border-radius:2px}
.bt85a{color:#d6ab4c;font-size:14px;opacity:.85}.bt85n{flex-basis:100%;text-align:right;font-size:11.5px;color:#e8d6ae}
@media (max-width:600px){.roomstat.bt85w{max-width:none}.bt85{min-width:60px;padding:3px 5px}}`;document.head.appendChild(st)}

/* 4 · road deals enter the fighter in the bout that suits him */
function dealBout85(n,g){if(!n||!g)return -1;const o=effOvr(g);let best=-1,bd=1e9;n.bouts.forEach((b,i)=>{if(b.done||(b.wd||0)>=2)return;const T=TIERS[b.tier];if(!T)return;
  const d=o<T.lo?T.lo-o:o>T.hi?o-T.hi:0;const mid=Math.abs(o-(T.lo+T.hi)/2)/100;if(d+mid<bd){bd=d+mid;best=i}});return best}
{const base=travelClick;travelClick=function(a){const w=W_();const t=travelState(w);const pre=a==='traveldeal'&&t&&t.offer?{...t.offer}:null;const r=base.apply(this,arguments);
  try{if(pre&&t.deal){const n=w.night,g=gById(t.deal.gid),m=me();if(g&&!n.bouts.some(b=>b.ents.includes(g.id))){const bi=dealBout85(n,g);const bo=n.bouts[bi];
      if(bo){const out=bo.ents.map(gById).filter(x=>x&&!x.contract).sort((x,y)=>effOvr(x)-effOvr(y))[0]||bo.ents.map(gById).filter(x=>x&&(!x.contract||x.contract.mgr!==m.id)).pop();
        if(out){bo.ents[bo.ents.indexOf(out.id)]=g.id;if(typeof voidBets==='function')voidBets(bo,out.id);t.deal.bi=bi;
          if(typeof tnews==='function')tnews(`⚔ <b>${esc(g.name)}</b> is entered in the ${esc(TIERS[bo.tier].n)}, as the deal asks.`);saveWorld()}}}}}catch(e){console.error(e)}return r}}
{const base=travelCardHTML;travelCardHTML=function(){let h=base.apply(this,arguments);try{const w=W_(),n=w.night,t=travelState(w);const o=t&&t.offer;if(o&&typeof h==='string'){const g=gById(o.gid);const bi=dealBout85(n,g);const bo=n.bouts[bi];
    if(bo)h=h.replace('Enter them in any bout tonight and the trip is theirs.',`They want them in the <b>${esc(TIERS[bo.tier].n)}</b> — accept and they are entered at once.`)}}catch(e){}return h}}
