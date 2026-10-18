/* =====================================================================
   393-v106lock — v1.06 SEASON LOCKS (his d1a d2-1,2,3, 2026-10-17; tools/plans/v106/NOTES.md "Season locks"). Manager only.
   Kill switch localStorage flavius_v106lockoff=1. Test tools/tests/tv106a.js. REPLACES: trades and loans open all season.
   1 · THE DEADLINE = the end of week 8 (LK106.dl). From week 9 to the season's end (the frozen Superbus weeks stay week 11, the off-season
       week is 12) there are no NEW trades, loans or loan asks — the player, the rival houses and Sica alike. Running loans finish on their terms.
       · offersWeek: no rival trade offers; open trade / loan offers lapse at the deadline (lk106Prune: kinds swap, coin, loan, loanin, the
         buy-outs bo104 / bi104, the bundle counter-offer tb104); asks made in a week end past the deadline are dropped with their news line.
       · lendTo / borrowFrom / offerAccept / c104Swap / c104BuyOut / c104Counter / doPoach refuse; poachVerdict says why; ludusClick refuses
         "🔁 Propose a trade" and Send; the rivals' poaching in cpuLeagueWeek (noPoach, as 378 does) and Sica's (sicaPoach) stop.
       · the buttons and pickers (trade, lend, borrow, poach, buy-out, counter-offer, the Clerk's "Lend for 3 weeks") show "🔒 Deadline passed",
         disabled (lk106Sweep after every Manager paint + popup menus); the roster's ⋯ menu shows one "🔒 Deadline passed" line in place of the
         borrowing houses (r104MenuHTML); the Clerk's loan advice (loan102Advice) is not given.
   2 · WEEK-7 LETTER "Trade deadline after week 8" (an information letter, act:false), once a season.
   3 · SIGNING after the deadline: free agents only into an EMPTY spot under the cap — your own fighters out on loan keep their places
       (cap103Why wrapper: roster + lent out ≥ cap → the reason). Rivals sign only below their own want (always under their cap).
   4 · SUPERBUS ROSTER FROZEN: w.lk106 = {s, r:{mid:[gid…]}} = every house's roster (+ its fighters out on loan) at the end of week 8 (taken at
       the first week end past the deadline; an older save mid-season takes it the first time it is needed — no migration). po104Fit (348)
       accepts only those fighters, so the playoff card's picker and the rivals' picks follow; a house with nobody fit gets 348's hired hand.
   5 · NO RELEASES IN THE PLAYOFF WEEKS (Round 1, semifinals, final = po104Ph r1/sf/fin): your Release button is locked; rival houses keep
       their extras (cpuLeagueWeek's cut is skipped those weeks).
   ===================================================================== */
const LK106={on:(()=>{try{return localStorage.getItem('flavius_v106lockoff')!=='1'}catch(e){return true}})(),dl:8,warn:7,
  kinds:['swap','coin','loan','loanin']};
function lk106Live(w){w=w||(typeof W_==='function'?W_():null);return !!(LK106.on&&w&&!w.tutorial&&!w.dead)}
/* past the deadline: weeks 9–12 of the season (the playoff weeks are frozen at 11) */
function lk106Past(w){w=w||(typeof W_==='function'?W_():null);return lk106Live(w)&&wkOf(w.week)>LK106.dl}
/* the playoff weeks: Round 1, the semifinals, the final */
function lk106Po(w){w=w||(typeof W_==='function'?W_():null);if(!lk106Live(w))return false;try{return typeof po104Ph==='function'&&['r1','sf','fin'].includes(po104Ph(w))}catch(e){return false}}
const lk106Txt=()=>_T('🔒 Deadline passed');
const lk106Why=()=>_T('The trade and loan deadline was the end of week 8. Running loans finish on their terms.');
const lk106RelWhy=()=>_T('No releases during the Superbus weeks.');
const lk106Toast=t=>{try{if(typeof mToast==='function')mToast(t)}catch(e){}};
/* a house's fighters out on loan (they keep their place) */
function lk106Out(w,m){return (w.glads||[]).filter(g=>g.alive&&g.loanFrom&&g.loanFrom.mid===m.id&&g.contract&&g.contract.mgr!==m.id)}

/* ---------------- 4 · the Superbus roster, frozen at the deadline ---------------- */
function lk106Snap(w,force){w=w||W_();if(!lk106Past(w))return null;if(!force&&w.lk106&&w.lk106.s===w.season)return w.lk106;
  const r={};for(const m of w.mgrs||[]){if(m.dead)continue;r[m.id]=rosterOf(m).map(g=>g.id).concat(lk106Out(w,m).map(g=>g.id))}
  w.lk106={s:w.season,wk:w.week,r};return w.lk106}
function lk106OnRoster(w,m,g){const L=lk106Snap(w);if(!L||!m||!g)return true;const ids=L.r[m.id];return !ids||ids.includes(g.id)}

/* ---------------- 1 · offers lapse; new ones are not made ---------------- */
function lk106Drop(o){return !!o&&(LK106.kinds.includes(o.kind)||!!o.bo104)}
function lk106Prune(w,top){w=w||W_();if(!lk106Past(w))return 0;const O=w.offers||[];const bad=O.filter(lk106Drop);let n=bad.length;
  if(n){w.offers=O.filter(o=>!lk106Drop(o));
    /* the news lines of asks made during this week end go with them */
    if(top!==undefined){const T=w.tlog||[];let idx=top?T.indexOf(top):T.length;if(idx<0)idx=T.length;
      const names=bad.map(o=>{const g=gById(o.gid);return g?esc(g.name):null}).filter(Boolean);
      w.tlog=T.filter((x,i)=>i>=idx||!names.some(nm=>String(x.text).includes(nm)))}}
  if((w.bi104||[]).length){n+=w.bi104.length;w.bi104=[]}
  if(w.tb104&&!w.tb104.done){w.tb104.done='deadline';n++}
  return n}
/* the week-7 warning, once a season */
function lk106Warn(w){w=w||W_();if(!lk106Live(w)||wkOf(w.week)!==LK106.warn||w.lk106w===w.season||typeof sendLetter!=='function')return false;w.lk106w=w.season;
  sendLetter(w,{key:'lk106-'+w.season,kind:'letter',from:_T('the Consilium'),seal:'🔒',act:false,title:_T('Trade deadline after week 8'),until:w.week+1,
    body:`<p>${_T('From week 9: no new trades, loans or loan asks — for every house. Running loans finish on their terms.')}</p><p>${_T('After it, free agents sign only into an empty roster spot; the Superbus takes only the fighters on your roster at the deadline; no releases in the Superbus weeks.')}</p>`});
  return true}

if(LK106.on){
  /* the week's end: lapse + drop asks, warn in week 7, freeze the Superbus roster at the first week past the deadline */
  {const base=endWeek;endWeek=async function(){const w0=W_();const top=w0&&(w0.tlog||[])[0];const r=await base.apply(this,arguments);
    try{const w=W_();if(r!==false&&w&&w===w0&&lk106Live(w)){lk106Prune(w,top);lk106Warn(w);lk106Snap(w)}}catch(e){console.error(e)}return r}}
  {const base=offersWeek;offersWeek=function(w){if(lk106Past(w)){try{lk106Prune(w)}catch(e){console.error(e)}return}return base.apply(this,arguments)}}
  {const base=loansWeek;loansWeek=function(w){const top=w&&(w.tlog||[])[0];const r=base.apply(this,arguments);try{lk106Prune(w,top)}catch(e){console.error(e)}return r}}
  {const base=offersHTML;offersHTML=function(){try{lk106Prune()}catch(e){}return base.apply(this,arguments)}}
  {const base=mgrHTML;mgrHTML=function(){try{const w=typeof W_==='function'?W_():null;if(w&&lk106Live(w)){lk106Prune(w);lk106Warn(w)}}catch(e){console.error(e)}return base.apply(this,arguments)}}
  /* the deals themselves */
  {const base=lendTo;lendTo=function(){if(lk106Past()){lk106Toast(lk106Txt()+' — '+lk106Why());return false}return base.apply(this,arguments)}}
  {const base=borrowFrom;borrowFrom=function(){if(lk106Past()){lk106Toast(lk106Txt()+' — '+lk106Why());return false}return base.apply(this,arguments)}}
  {const base=offerAccept;offerAccept=function(o){if(lk106Past()&&lk106Drop(o)){try{OFFER_FAIL95=lk106Txt()+' — '+lk106Why()}catch(e){}return false}return base.apply(this,arguments)}}
  if(typeof c104Swap==='function'){const base=c104Swap;c104Swap=function(){if(lk106Past()){lk106Toast(lk106Txt());return}return base.apply(this,arguments)}}
  if(typeof c104BuyOut==='function'){const base=c104BuyOut;c104BuyOut=function(w){if(lk106Past(w))return;return base.apply(this,arguments)}}
  if(typeof c104Counter==='function'){const base=c104Counter;c104Counter=function(w){if(lk106Past(w)){if(w&&w.tb104)w.tb104.done='deadline';return}return base.apply(this,arguments)}}
  {const base=poachVerdict;poachVerdict=function(){if(lk106Past())return {ok:false,why:lk106Txt()+' — '+lk106Why()};return base.apply(this,arguments)}}
  {const base=doPoach;doPoach=function(){if(lk106Past()){lk106Toast(lk106Txt());return}return base.apply(this,arguments)}}
  if(typeof loan102Advice==='function'){const base=loan102Advice;loan102Advice=function(w){if(lk106Past(w))return null;return base.apply(this,arguments)}}
  {const base=ludusClick;ludusClick=async function(action,id,btn,ctx){try{if(lk106Past()&&(action==='tradego'||(action==='envoy'&&/\|trade$/.test(String(id||''))))){
      if(MGR.trade)MGR.trade=null;if(ctx&&ctx.say)ctx.say(lk106Txt()+' — '+lk106Why());else lk106Toast(lk106Txt());return true}}catch(e){console.error(e)}return base.apply(this,arguments)}}
  /* the rivals and Sica: no poaching past the deadline; no releases in the playoff weeks */
  {const base=cpuLeagueWeek;cpuLeagueWeek=function(){const w=W_();if(!lk106Past(w))return base.apply(this,arguments);
    const P=lk106Past(w)?(w.glads||[]).filter(g=>g.alive&&!g.noPoach):[];for(const g of P)g.noPoach=true;
    const keep=[];if(lk106Po(w))for(const m of w.mgrs||[]){if(m.isPlayer||m.dead||!m.p)continue;const n=rosterOf(m).length;const want=2+Math.round(m.p.ambition/28);
      if(n>want+1){keep.push([m,m.p]);m.p=Object.assign({},m.p,{ambition:28*(n-3)})}}
    try{return base.apply(this,arguments)}finally{for(const g of P)delete g.noPoach;for(const [m,p] of keep)m.p=p}}}
  if(typeof sicaPoach==='function'){const base=sicaPoach;sicaPoach=function(w){if(lk106Past(w||W_()))return;return base.apply(this,arguments)}}
  /* 3 · signing: only into an empty spot under the cap (your fighters out on loan keep theirs) */
  if(typeof cap103Why==='function'){const base=cap103Why;cap103Why=function(){const why=base.apply(this,arguments);if(why)return why;try{const w=W_();if(!lk106Past(w))return why;const pm=me();
      const cap=typeof cap104==='function'?cap104(pm):MGR_CAP103;const n=rosterOf(pm).length,out=lk106Out(w,pm).length;
      if(out&&n+out>=cap)return _T`🔒 Past the deadline a free agent signs only into an empty spot: ${n} on the roster + ${out} out on loan = ${n+out} / ${cap}.`}catch(e){console.error(e)}return why}}
  /* 4 · the Superbus takes only the fighters on the roster at the deadline */
  if(typeof po104Fit==='function'){const base=po104Fit;po104Fit=function(w,m,g){const r=base.apply(this,arguments);if(!r)return r;try{if(lk106Past(w)&&!lk106OnRoster(w,m,g))return false}catch(e){console.error(e)}return r}}
  /* 5 · releases: your button is refused in the playoff weeks */
  window.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-mg="release"]');if(!b||!lk106Po())return;
    e.preventDefault();e.stopImmediatePropagation();lk106Toast(lk106Txt()+' — '+lk106RelWhy())},true);
}

/* ---------------- the locked buttons ---------------- */
const LK106_SEL=['[data-mg="envoy"][data-id$="|trade"]','[data-mg="tradego"]','[data-tb104="yes"]','[data-r104bo="yes"]','[data-l102lend]','[data-r104lend]',
  'select[data-m47lend]','select[data-m47borrow]','[data-m48="loaninyes"]','[data-mg="poach"]','[data-m47="offyes"]','input[data-tb104g]'];
function lk106Lock(el,why){if(el.dataset.lk106)return;el.dataset.lk106='1';el.disabled=true;el.setAttribute('aria-disabled','true');el.title=why;
  if(el.tagName==='SELECT'){const o=el.options&&el.options[0];if(o)o.textContent=lk106Txt();return}
  if(el.tagName==='INPUT')return;
  if(el.classList.contains('r104mi')){const s=el.querySelector('span');if(s)s.textContent=lk106Txt();const sm=el.querySelector('small');if(sm)sm.remove();return}
  el.textContent=lk106Txt()}
function lk106Sweep(root){if(!LK106.on)return;const w=typeof W_==='function'?W_():null;if(!w||!lk106Live(w))return;root=root||document;
  if(lk106Past(w)){const why=lk106Why();for(const el of root.querySelectorAll(LK106_SEL.join(',')))lk106Lock(el,why)}
  if(lk106Po(w))for(const el of root.querySelectorAll('[data-mg="release"]'))lk106Lock(el,lk106RelWhy())}
if(LK106.on){
  /* the roster's ⋯ menu: one locked line instead of the houses that would borrow him */
  if(typeof r104MenuHTML==='function'){const base=r104MenuHTML;r104MenuHTML=function(){let h=base.apply(this,arguments);try{if(lk106Past()&&typeof h==='string'){const re=/<button[^>]*data-r104lend="[^"]*"[^>]*>[\s\S]*?<\/button>/g;let first=true;
      h=h.replace(re,()=>{if(!first)return '';first=false;return `<div class="r104mx lk106mx">${lk106Txt()}</div>`})}}catch(e){console.error(e)}return h}}
  {const base=mgrPaint;mgrPaint=function(el){const r=base.apply(this,arguments);try{lk106Sweep(el)}catch(e){console.error(e)}return r}}
  /* popups (the roster's ⋯ menu) and patched pages */
  if(typeof MutationObserver!=='undefined'){let busy=false;const mo=new MutationObserver(()=>{if(busy)return;const w=typeof W_==='function'?W_():null;if(!w||!lk106Live(w)||!(lk106Past(w)||lk106Po(w)))return;
      busy=true;try{lk106Sweep(document)}catch(e){console.error(e)}finally{busy=false}});
    const hook=()=>{if(document.body)mo.observe(document.body,{childList:true,subtree:true})};if(document.body)hook();else document.addEventListener('DOMContentLoaded',hook)}
}
