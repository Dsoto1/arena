/* =====================================================================
   59-BYE · BYE WEEKS IN MANAGER MODE (v0.52)
   =====================================================================
   Weeks 4 and 8 of every season have no Match Week. Every house rests, so no one falls behind:
   • no bouts; the week ends as soon as you choose
   • Vulso's cart calls at every gate, and it is market day on your home square (no road to pay)
   • +6 hours for recruiting and exhibitions
   • rest: injuries heal a week sooner; the week counts as a good one for morale
   • a bye-week camp: every fighter below potential has a fair chance of +1 rating
   • the Senate pays half of every house's wages, since no purses come in
   ===================================================================== */
const BYE_WKS=[4,8],BYE_HOURS=6;
const isByeWk=abs=>BYE_WKS.includes(wkOf(abs));
function byeSetup(w){const n=w.night;if(!n||n.bye)return;const m=me();
  n.bye=true;n.bouts=[];const home=typeof travelHome==='function'?travelHome(m):n.loc;n.loc=home;
  n.travel={cost:0,paid:true,offer:null,deal:null,from:LOCATIONS[home]?LOCATIONS[home].n:'',bye:1};
  w.hours=(w.hours||0)+BYE_HOURS;
  for(const g of w.glads)if(g.alive&&g.inj&&!g.inj.war&&g.contract)g.inj.until=Math.max(w.week,(g.inj.until||w.week)-1);
  if(!(w.cart&&w.cart.wk===w.week)&&typeof genGlad==='function'){const lot=[];for(let i=0;i<3;i++){const g=genGlad({ovr:38+rnd(12)});if(typeof AUCTION_WOES!=='undefined'){const [woe,fx]=pickOne(AUCTION_WOES);fx(g);g.woe=woe}else g.woe='a quiet week';g.auction=1;g.gemHid=Math.random()<.18?6+rnd(8):0;g.price=4+rnd(7);w.glads.push(g);lot.push(g.id)}
    w.cart={wk:w.week,ids:lot,bye:1}}
  if(typeof tnews==='function')tnews(`🌿 <b>Bye week.</b> No bouts anywhere in the league. Vulso’s cart is at your gate, it is market day on your home square, and you have ${BYE_HOURS} extra hours.`,'big')}
{const _mn=makeNight;makeNight=function(){const r=_mn.apply(this,arguments);try{const w=W_();if(w&&!w.tutorial&&isByeWk(w.week))byeSetup(w)}catch(e){console.error(e)}return r}}
{const _ew=endWeek;endWeek=async function(){const w=W_();const bye=!!(w&&w.night&&w.night.bye);let pre=null;
  if(bye){try{pre={};for(const m of w.mgrs){const wages=rosterOf(m).reduce((a,g)=>a+(g.contract?g.contract.wage:0),0);const back=Math.round(wages/2);m.coin+=back;pre[m.id]=back;for(const g of rosterOf(m))g.lastBout=w.week}
      const mine=pre[me().id]||0;if(mine&&typeof tnews==='function')tnews(`🏛 The Senate pays half your wages for the bye week: +${mine} coin.`)}catch(e){console.error(e)}}
  const r=await _ew.apply(this,arguments);
  if(r===false&&bye&&pre){for(const m of w.mgrs)m.coin-=pre[m.id]||0;return r}
  if(bye){try{let up=0;for(const m of w.mgrs)for(const g of rosterOf(m)){if(g.ovr<g.pot&&Math.random()<(m.isPlayer?.5:.4)){g.ovr++;if(m.isPlayer)up++}}if(up&&typeof tnews==='function')tnews(`🏋 The bye-week camp paid off: ${up} of your fighters gained +1 rating.`)}catch(e){console.error(e)}}
  return r}}
/* Match Week becomes the bye week */
function byeHTML(){const w=W_(),m=me();const L=LOCATIONS[w.night.loc]||{n:'home'};const lots=w.cart&&w.cart.wk===w.week?w.cart.ids.map(gById).filter(g=>g&&g.alive&&!g.contract).length:0;
  return `<div class="card2 byecard"><h4 style="margin-top:0">🌿 Bye week · week ${wkOf(w.week)} of season ${w.season}</h4>
   <p>No bouts anywhere in the league this week. Use it to build the house:</p>
   <ul class="byelist"><li>🛒 <b>Vulso’s cart</b> is at your gate${lots?` with ${lots} lot${lots===1?'':'s'}`:''} (top of any tab).</li>
    <li>🏪 <b>Market day</b> on your home square in ${esc(L.n)}: no road to pay. <button class="btn tksm" type="button" data-mg="city">Visit the square</button></li>
    <li>⏳ <b>${w.hours} hours</b> this week (+${BYE_HOURS}) for <button class="btn tksm" type="button" data-mg="tab" data-id="recruit">Recruiting</button> and <button class="btn tksm" type="button" data-mg="tab" data-id="practice">Training Yard</button> exhibitions.</li>
    <li>⚕ Rest: injuries heal a week sooner, and no one sulks for missing a bout.</li>
    <li>🏋 Bye-week camp: fighters below their potential may gain +1 rating when the week ends.</li>
    <li>🏛 The Senate pays half of every house’s wages.</li></ul>
   ${w.special&&!w.special.done?'<p class="rc-sub">⭐ An invitational still runs this week — settle it first.</p>':''}</div>${typeof weekLoopBtns==='function'?weekLoopBtns():''}`}
{const _nh=nightHTML;nightHTML=function(){const w=W_();if(w&&w.night&&w.night.bye&&!(w.special&&!w.special.done))return byeHTML();return _nh.apply(this,arguments)}}
{const _mh=mgrHTML;mgrHTML=function(){let h=_mh.apply(this,arguments);try{const w=W_();if(w&&w.night&&w.night.bye)h=h.replace('⚔️ Match Week','🌿 Bye week')}catch(e){}return h}}
/* the season table marks the byes */
{const _st=seasonTabHTML;seasonTabHTML=function(){let h=_st.apply(this,arguments);try{
  h=h.replace(/<tr class="([^"]*)"><td class="n">(▶ )?(\d+)<\/td>(<td class="rc-sub">[^<]*<\/td>)[\s\S]*?<\/tr>/g,(m0,cls,now,wk,date)=>BYE_WKS.includes(+wk)?`<tr class="${cls} sbye"><td class="n">${now||''}${wk}</td>${date}<td>🏠 Home</td><td colspan="2"><b>🌿 Bye week</b> <span class="rc-sub">no bouts · cart · market day · +${BYE_HOURS} h</span></td><td class="sbill"><span class="rc-sub">—</span></td></tr>`:m0)}catch(e){}return h}}
/* a fighter can't be billed for a bye */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mg="cm_set"],[data-mg="cm_save"]');if(!b)return;const abs=+(b.dataset.id||0);if(abs&&isByeWk(abs)){e.stopPropagation();e.preventDefault();if(typeof mToast==='function')mToast('🌿 That is a bye week — there is no bout to bill.')}},true);
/* a v0.51 career: early billings on a bye week are released */
SAVE_MIGRATIONS.push(['0.52',w=>{if(w.commits)for(const k of Object.keys(w.commits))if(isByeWk(+k))delete w.commits[k]}]);
/* an offer for a fighter who has since left (or a swap offering one) is withdrawn instead of breaking the page */
{const _oh=offersHTML;offersHTML=function(){try{const w=W_();if(w&&w.offers)w.offers=w.offers.filter(o=>{const g=gById(o.gid);if(!g||!g.contract)return false;return (o.give||[]).every(id=>{const x=gById(id);return x&&x.contract})})}catch(e){}return _oh.apply(this,arguments)}}
