/* =====================================================================
   28-PURSES · THE FIGHTER'S OWN COIN (v0.36)
   =====================================================================
   Every contracted gladiator keeps a PURSE of their own: a share of each purse they win for the
   house (a tenth, out of the lanista's cut) and a fifth of their weekly wage, saved. And every
   fighter carries a DREAM for that coin — their family back home, plain wealth, or, for the rare
   and ambitious few, a ludus of their own.
   A famous, highly rated fighter who dreams of a ludus and has saved enough may one day offer to
   BUY YOURS. Accept: they become the house's lanista (an AI rival from then on, roster and all),
   and the sale price founds your new ludus in the same league — you go straight to creation.
   Refuse: their morale drops, and they may walk out to found their own house — your instant rival,
   poaching from you if they can.
   ===================================================================== */
const DREAMS={ludus:['🏛',_T('to run a ludus of their own one day')],family:['🏠',_T('for the family back home')],wealth:['💰',_T('to retire rich — or die trying')]};
function gDream(g){if(!g)return 'family';if(g.dream)return g.dream;
  const h=Math.abs(hashStr('dream'+(g.id||g.name)))%100;
  g.dream=(effOvr(g)>=72&&h<45)||h<14?'ludus':h<60?'family':'wealth';return g.dream}
function purseLine(g){if(!g||!g.contract)return '';const d=DREAMS[gDream(g)];
  return `<div class="rc-sub" style="margin:2px 0" title="${_T`The fighter's own purse — a tenth of every purse they win for the house and a fifth of their wage, saved.`}">${_T`👛 Own purse <b>${g.purse||0}</b> coin · saving ${d[0]} ${esc(g.dream==='family'?_T`for the family back in ${g.city||_T('their city')}`:d[1])}${g.buyRefused?_T(' · <span style="color:var(--blood2)">you refused their offer for the house</span>'):''}`}</div>`}
// the weekly tick: savings, the rare buyout offer, and the walk-out of a refused dreamer
function purseWeek(w,pm){
  for(const g of w.glads)if(g.alive&&g.contract&&!g.lanista){g.purse=(g.purse||0)+Math.max(1,Math.round((g.contract.wage||0)*0.2));gDream(g)}
  if(w.buyOffer&&w.week-w.buyOffer.wk>=2){const g=gById(w.buyOffer.gid);if(g)tnews(_T`${esc(g.name)} withdraws the offer for the house — for now.`);w.buyOffer=null}
  if(!w.buyOffer&&w.week-(w.buyWk??-99)>=8){
    const cand=rosterOf(pm).filter(g=>!g.lanista&&!g.buyRefused&&gDream(g)==='ludus'&&g.fame>=45&&effOvr(g)>=72&&(g.purse||0)>=90).sort((a,b)=>b.fame-a.fame)[0];
    if(cand&&Math.random()<(w.forceBuy?1:0.08)){w.forceBuy=0;w.buyOffer={gid:cand.id,price:buyPrice(w,pm,cand),wk:w.week};w.buyWk=w.week;
      tnews(_T`🏛 <b>${esc(cand.name)} asks for a word in private</b> — and offers to BUY ${esc(pm.ludus)}. The offer waits on Your ludus.`,'big')}}
  for(const g of rosterOf(pm))if(g.buyRefused&&!g.lanista&&w.week>g.buyRefused&&Math.random()<0.3){defectFound(w,pm,g);break}
  /* v0.46: a fighter rich enough to buy their freedom before earning the rudis asks their lanista (once every 8 weeks) */
  for(const x of w.mgrs){if(x.dead)continue;for(const g of rosterOf(x)){if(g.lanista||g.starChild||rudisReady(g)||(g.purse||0)<freedomPrice(g)||w.week-(g.freeAsked??-99)<8)continue;
    const price=freedomPrice(g);g.freeAsked=w.week;
    if(x.isPlayer){(w.pend=w.pend||[]).push({t:'buyfree',gid:g.id,price,f:0});tnews(_T`👛 <b>${esc(g.name)}</b> asks to buy their freedom for ${price} coin — decide on Match Week.`,'big')}
    else if(Math.random()<.5){g.purse-=price;x.coin+=price;ghist(g,_T`bought their freedom from ${x.ludus} for ${price} coin`);g.alive=false;g.freed2=true;g.contract=null;try{libertyEntry(g,x,_T('the Gate of Life'),_T('bought their freedom'))}catch(e){}mnews(_T`👛 <b>${esc(g.name)}</b> buys their freedom from ${esc(x.ludus)} for ${price} coin.`)}
    break}}
}
function buyPrice(w,pm,g){return Math.round((g.purse||0)*1.4+g.fame*3+(typeof facSum==='function'?facSum(pm)*15:0)+rosterOf(pm).length*10+Math.max(0,pm.coin)*0.5)}
function buyOfferHTML(){const w=W_();const o=w&&w.buyOffer;if(!o)return '';const g=gById(o.gid);if(!g)return '';const pm=me();
  return `<div class="card2" style="border-color:var(--gold);margin-bottom:10px"><div style="display:flex;gap:10px;align-items:center">${gArt(g,'sm')}<div>${_T`<b>🏛 ${esc(g.name)} offers to buy ${esc(pm.ludus)}</b>`}
    <p style="margin:4px 0">${_T`“I have fought for this house, bled for it, saved every coin it paid me. Sell it to me, lanista. I will keep the name, keep the fighters — and pay you <b>${o.price} coin</b>.”`}</p>
    <p class="rc-sub" style="margin:0">${_T`Accept: ${esc(g.name)} becomes the house's lanista (a rival from now on, roster and all), and <b>${o.price} coin founds your new ludus</b> in this same league${w.loan?_T` (less the ${w.loan.amt} still owed to ${esc(w.loan.name)})`:''} — you go straight to creating it. Refuse: ${esc(g.name)}'s morale drops, and they may walk out to found a house of their own — against you.`}</p></div></div>
    <div class="acts" style="margin-top:8px"><button class="btn primary" type="button" data-mg="buyaccept">${_T`✍ Sell the house<small>${o.price} coin · found a new ludus</small>`}</button><button class="btn" type="button" data-mg="buyreject">${_T`✋ Refuse<small>the house is not for sale</small>`}</button></div></div>`}
// refused: the dreamer walks out and founds a rival house
function defectFound(w,pm,g){
  const fam=String(g.name).split(/\s+/).pop().replace(/["“”]/g,'');
  const id='m_g'+String(g.id).slice(-8)+Date.now().toString(36).slice(-3);
  const nm={id,name:g.name,ludus:_T('Ludus ')+fam,city:g.city||pm.city,color:pickOne(['#b0413a','#3f6fb4','#4f9a57','#c49a2c','#cc6a2c','#7a4cb0','#3fa7a0','#d0678a']),
    p:{ambition:85,cunning:62,honor:40,greed:58,show:66,discipline:55,risk:64},fame:Math.round(g.fame*0.6),coin:(g.purse||0)+40,wins:0,bouts:0,deaths:0,betNet:0,poached:0,improved:0,
    bio:_T`Fought for ${pm.ludus}, offered to buy it, was refused — and built a rival across the square.`,portrait:{...gLook(g),helm:'none'},rivals:{[pm.id]:68},rivalry:68,defector:true};
  w.mgrs.push(nm);g.contract=null;g.lanista=1;g.alive=false;g.retired=true;g.purse=0;
  ghist(g,_T`walked out of ${esc(pm.ludus)} to found ${esc(nm.ludus)}`);
  for(const f of freeAgents().sort((a,b)=>effOvr(b)-effOvr(a)).slice(0,2)){f.contract={mgr:id,wage:askWage(f),weeks:8,since:w.week};f.morale=65}
  tnews(_T`⚔ <b>${esc(g.name)} walks out</b> — and founds <b>${esc(nm.ludus)}</b> in ${esc(nm.city)}. The new house wants your fighters, and it knows their names.`,'big');
  mnews(_T`${esc(g.name)} leaves ${esc(pm.ludus)} to found ${esc(nm.ludus)}. A rivalry is born.`,'big');
}
// the sale closes: the buyer takes the house, you found a new one in the same league
function saleComplete(w,c){const pm=me();const o=w.buyOffer;const g=gById(o.gid);if(!g)return false;
  const old={name:pm.name,ludus:pm.ludus};
  try{Store.put('hall','annal_'+w.id+'_'+pm.id,{id:'annal_'+w.id+'_'+pm.id,kind:'annal',name:pm.name,ludus:pm.ludus,grade:legacyOf(w,pm).grade,score:legacyOf(w,pm).score,tier:_T('Sold to ')+g.name,seasons:w.season-(w.startSeason||1),rec:`${pm.wins}-${Math.max(0,pm.bouts-pm.wins)}`,fame:pm.fameBest||pm.fame,trophies:(w.trophies||[]).length,date:new Date().toISOString().slice(0,10),epitaph:_T`Sold for ${o.price} coin to ${g.name}, who fought for it first.`}).catch(()=>{})}catch(e){}
  // the house changes hands
  pm.isPlayer=false;pm.name=g.name;pm.portrait={...gLook(g),helm:'none'};pm.bio=_T`Fought for ${old.ludus}, then bought it from ${old.name}.`;pm.fame=Math.max(pm.fame,g.fame);
  pm.rivals=pm.rivals||{};pm.rivalry=6;g.contract=null;g.lanista=1;g.alive=false;g.retired=true;
  ghist(g,_T`bought ${esc(old.ludus)} from ${esc(old.name)} for ${o.price} coin — lanista now`);
  const debt=w.loan?w.loan.amt:0;const coin=Math.max(20,o.price-debt);w.loan=null;w.buyOffer=null;
  // you, again: a new house in the same league
  const id='m_p'+Date.now().toString(36);
  w.mgrs.push({id,name:c.name,ludus:c.ludus,city:c.city,color:c.color,p:{...c.p},fame:Math.round(Math.min(40,(pm.fameBest||pm.fame)/3)),coin,wins:0,bouts:0,deaths:0,betNet:0,poached:0,improved:0,
    bio:c.bio||_T`Sold ${old.ludus} and started again.`,portrait:{...c.portrait},custom:true,rivals:{},isPlayer:true,flag:c.flag||null});
  w.playerId=id;for(const m2 of w.mgrs)if(!m2.isPlayer)m2.rivalry=m2===pm?6:Math.round(Math.random()*8);
  w.pastTrophies=[...(w.pastTrophies||[]),...(w.trophies||[])];w.trophies=[];w.startSeason=w.season;w.rudisFreed=0;w.gemsFound=0;w.loanDone=0;
  const r=genGlad({ovr:44+rnd(7),rookie:true});r.name=genName();r.contract={mgr:id,wage:askWage(r),weeks:8,since:w.week};r.scout=2;w.glads.push(r);
  for(const x of w.glads)if(x.interest)delete x.interest[id];
  w.hours=hoursMax();
  mnews(_T`✍ <b>${esc(old.ludus)} is sold</b> to ${esc(g.name)} for ${o.price} coin${debt?_T` (${debt} went to clear the debt)`:''}. ${esc(c.name)} opens <b>${esc(c.ludus)}</b> in ${esc(c.city)} with ${coin} coin and one raw recruit.`,'big');
  return true}
