/* 431-v115adeath — v1.15a "Deaths fix" (his 1a 2a 5a, tools/plans/v115a/NOTES.md; study tools/plans/deaths112/REPORT.md, sim patches G3 + G5):
   G3 blood money: a house under fame 18 (any house, not only 51-v49's newcomerHouse) buys a condemned fighter back at HALF price
      (min 5). A newcomer house keeps its one half price from 51-v49 (never halved twice). REPLACES newcomerHouse's condition alone.
   G5 a death costs the house no fame while its fame is under 18 (17 killFighter takes 2 off today). REPLACES the flat -2. The deaths
      counter still counts.
   Note: the pending-verdict card says "half price — a small house" above the Pay button when either half price applies.
   No save shape change. Kill switch: localStorage flavius_v115adeathoff=1 restores today's behaviour exactly. */
const V115D={off:(()=>{try{return localStorage.getItem('flavius_v115adeathoff')==='1'}catch(e){return false}})(),fame:18};
{const base=bloodPrice;bloodPrice=function(g,F){const p=base.apply(this,arguments);if(V115D.off)return p;
  try{const m=g&&g.contract?mgrById(g.contract.mgr):null;if(m&&(m.fame||0)<V115D.fame&&!newcomerHouse(m))return Math.max(5,Math.round(p*0.5))}catch(e){}return p}}
{const base=killFighter;killFighter=function(glad,mgr){if(V115D.off)return base.apply(this,arguments);
  const f=mgr?mgr.fame:null;const r=base.apply(this,arguments);try{if(mgr&&f!=null&&f<V115D.fame)mgr.fame=f}catch(e){}return r}}
/* small-house half price applies to this house (either rule) */
function v115dSmall(m){try{return !V115D.off&&!!m&&((m.fame||0)<V115D.fame||newcomerHouse(m))}catch(e){return false}}
{const base=pendingHTML;pendingHTML=function(){let h=base.apply(this,arguments);if(V115D.off||!h)return h;
  try{const m=me();if(v115dSmall(m)){const note=`<p class="rc-sub" data-v115d="small" style="margin:4px 0">${_T('half price — a small house')}</p>`;
    h=h.replace(/<div class="acts"><button class="btn primary" type="button" data-mg="pblood" data-id="\d+\|pay"/g,s=>note+s)}}catch(e){}return h}}
