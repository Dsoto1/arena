/* v1.05 x1a (363-v105renown) · kill switch localStorage flavius_v105doff=1 (with it on, the old perk point sources work as before) · test tv105d
   The lanista's perk points now come from ONE Renown bar (REPLACES the free +1 a week and the scattered +1s; decided 2026-10-16):
   every grant in 17-manager goes through perkGain105(m,src) (src week|win|pledge|train|exhib); this module wraps it. With the module on:
   'week' gives nothing; 'win' / 'pledge' / 'train' / 'exhib' become RENOWN. More sources are wrappers: applyBout (Superbus playoff round
   played / won, a sold-out house), signGlad (a good signing), the season.offseason bus event (a podium finish in the final league table).
   m.renown = {lv, xp, s, src:{key:amount} (this season), prev:{...} (last season)}. A level costs REN105.cost(lv) renown and gives 1 perk point
   at once (m.perkPts). Created lazily on first use: existing careers keep their unspent points (perkPts / perkPend untouched; a leftover
   perkPend still pays out at the next week's end) and start the bar at 0 (deriving it from history would pay the old points twice). No save
   migration (a new field with defaults). The bar is shown on the Lanista perk card (150's perkTree87 text line is replaced). */
const V105D={off:(()=>{try{return localStorage.getItem('flavius_v105doff')==='1'}catch(e){return false}})()};window.V105D=V105D;
const REN105={amt:{win:10,pledge:15,train:10,exhib:5,sign:10,sold:10,po:15,pow:15,pofin:30,pod1:50,pod2:35,pod3:20},base:6,
  cost:lv=>REN105.base+2*Math.floor(lv/12),
  grp:k=>k==='pow'||k==='pofin'?'po':/^pod\d$/.test(k)?'pod':k,
  lab:{win:_T('Wins'),pledge:_T('Pledges kept'),train:_T('Fighters improving'),exhib:_T('Exhibitions'),sign:_T('Signings'),sold:_T('Full houses'),po:_T('Superbus'),pod:_T('Podium')}};
const renOf105=m=>{if(!m)return null;const w=W_();const r=m.renown=m.renown||{lv:0,xp:0,s:w?w.season:1,src:{},prev:{}};
  if(w&&r.s!==w.season){r.prev=r.src||{};r.src={};r.s=w.season}return r};
/* renown105 — add renown to the player's lanista; every full level pays 1 perk point at once. Returns the points paid. */
function renown105(m,key,n){if(V105D.off||!m||!m.isPlayer)return 0;n=n==null?REN105.amt[key]||0:n;if(!n)return 0;const r=renOf105(m);if(!r)return 0;
  const g=REN105.grp(key);r.src[g]=(r.src[g]||0)+n;r.xp+=n;let pts=0;
  while(r.xp>=REN105.cost(r.lv)){r.xp-=REN105.cost(r.lv);r.lv++;pts++}
  if(pts){m.perkPts=(m.perkPts||0)+pts;try{mnews(_T`⚜ <b>Renown ${r.lv}</b>: your name carries further. +${pts} perk point${pts===1?'':'s'}.`,'big')}catch(e){}}
  return pts}
window.renown105=renown105;
if(!V105D.off){
{const base=perkGain105;perkGain105=function(m,src){if(!m||!m.isPlayer)return base.apply(this,arguments);if(src==='week')return;renown105(m,src)}}
const mineG=g=>{const mm=g&&g.contract&&mgrById(g.contract.mgr);return !!(mm&&mm.isPlayer)};
{const base=applyBout;applyBout=function(idx){const w=W_();const b=w&&w.night&&w.night.bouts[idx];const was=b&&b.done;const r=base.apply(this,arguments);
  try{if(b&&!was&&b.done&&!w.tutorial){const pm=me();const mine=(b.ents||[]).filter(id=>mineG(gById(id)));
    if(mine.length){const wonB=((b.res&&b.res.winners)||[]).some(id=>mine.includes(id));
      if(b.tier==='sb104'&&b.po104){renown105(pm,'po');if(wonB)renown105(pm,b.po104.r==='fin'?'pofin':'pow')}
      let cap=0;try{cap=boutCapacity(w.night.loc)}catch(e){}if(cap&&b.res&&b.res.att>=cap*.9)renown105(pm,'sold')}}}catch(e){console.error(e)}return r}}
{const base=signGlad;signGlad=function(glad){const pm=me();const isNew=!!(glad&&!(glad.contract&&pm&&glad.contract.mgr===pm.id));const r=base.apply(this,arguments);
  try{if(isNew&&glad&&((glad.ovr||0)>=62||(glad.pot||0)>=75)&&!(W_()||{}).tutorial)renown105(pm,'sign')}catch(e){console.error(e)}return r}}
if(typeof BUS!=='undefined')BUS.on('season.offseason',d=>{try{const w=d&&d.w||W_();const pm=me();if(!w||!pm||w.tutorial)return;
  const t=leagueSort(w.mgrs.filter(m=>!m.dead&&!m.sica),d.season);const i=t.findIndex(m=>m.isPlayer);if(i>=0&&i<3)renown105(pm,'pod'+(i+1))}catch(e){console.error(e)}});
/* the bar on the perk card */
function renownBarHTML105(){const m=me();const r=renOf105(m);if(!r)return '';const c=REN105.cost(r.lv),pc=Math.round(100*r.xp/c);
  const parts=Object.keys(REN105.lab).map(k=>[REN105.lab[k],r.src[k]||0]).filter(x=>x[1]);
  return `<div class="ren105" id="ren105"><div class="ren105h"><b>⚜ ${_T`Renown`} ${r.lv}</b><span class="rc-sub">${r.xp} / ${c} · ${_T('next level +1 point')}</span></div>
    <div class="ren105bar" role="progressbar" aria-valuemin="0" aria-valuemax="${c}" aria-valuenow="${r.xp}" aria-label="${_T('Renown')}"><i style="width:${pc}%"></i></div>
    <div class="rc-sub ren105src">${parts.length?_T('This season')+': '+parts.map(x=>`${x[0]} +${x[1]}`).join(' · '):_T('Earned from wins, podiums, the Superbus, full houses, kept pledges, improving fighters and good signings.')}</div></div>`}
{const base=perkTree87;perkTree87=function(){const h=base.apply(this,arguments);try{return h.replace(/<p class="rc-sub pk87how"[^>]*>[\s\S]*?<\/p>/,renownBarHTML105())}catch(e){console.error(e)}return h}}
{const st=document.createElement('style');st.textContent=`.ren105{margin:2px 0 10px}.ren105h{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap}.ren105h b{color:var(--gold2)}
.ren105bar{height:9px;margin:4px 0;border-radius:5px;background:rgba(0,0,0,.35);border:1px solid rgba(214,168,76,.4);overflow:hidden}.ren105bar i{display:block;height:100%;background:linear-gradient(90deg,#b8862e,#f0cf7a)}`;document.head.appendChild(st)}
}
