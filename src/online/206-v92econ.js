/* 206-v92econ — v0.92 ONE TREASURY + ONLINE KITS (his picks 2026-10-06; shared rules in the v0.92 section of 111-onlcore,
   server in routes.js "v0.92").
   • ONE TREASURY: gladiators keep no purse. A survival award goes whole to the house treasury (the ledger keeps it by gladiator);
     purses left from before move into the treasury once (ledger "Purses moved to the treasury"). Every buy, ticket, wager, bid,
     repair and kit is paid by the treasury: the Domus showcase, the gladiator cards, the armory header, the stage, the creator, the
     repair popup and the buy confirmation say so; no purse is shown anywhere.
   • COIN SENT INTO A MATCH: a seated lanista picks 0–10 coin in the room (🪙 Send, lobby.send); it leaves the treasury at the horns and
     the seat starts with the class's coin + that (seat.coinStart, every client the same from the room's seat.sent92). A survivor brings
     his leftover coin home up to what was sent; the dead lose it (the room's stakes and the abandon popup count it).
   • KITS (Armory → 🎒 Kits): his CLASS KIT on the avatar ("Complete the kit · N"), Scrap · Recruit · Champion, the FREE DAILY KIT (Issued:
     worth 0, never repaired or looted, vanishes when lost) and 🛒 Restock on saved loadouts (the Domus loadout row too). Owned pieces —
     on him or on the house shelf — are skipped; the rest at its own price less 15% × the share of the kit bought.
   • THE MOCK: every paying route pays from the treasury (the treasury is lent to the gladiator for the old code, then taken back),
     coin paid to a gladiator (payouts, refunds, gifts) is swept into his house, lobby.send / the horns' reservation / the coin home /
     void + close refunds, market.kit, gear.repair (treasury only) — as server/src/routes.js. */

/* ---------------- 0 · the class kits from the game's class data (tools/mkserver.js writes the same to server/src/kits92.json) ---------------- */
function onlKits92(){const cat=onlCatalog();const o={};for(const k of ONLC.CLASSES8){const C=CLASSES[k];o[k]=ONLC.kitFromArmor92((C&&C.armor)||[],cat)}return o}
const KIT92_N=()=>({cls:_T('Class kit'),scrap:_T('Scrap padding'),recruit:_T('Recruit set'),champ:_T('Champion plate'),daily:_T('Free daily kit'),restock:_T('Restock')});
const KIT92_D=()=>({scrap:_T('Padding for arms and legs — the cheapest cover.'),recruit:_T('A full Level 1 set: helm, chest, belt, padding.'),champ:_T('Level 2–3 plate from head to greaves.'),
  daily:_T('Plain Level 1 pieces from Flavius, once a day. Issued: worth nothing, never repaired, they vanish when lost.')});

/* =========================== 1 · THE MOCK (as server/src/routes.js "v0.92") =========================== */
if(typeof NEED_DOMUS82!=='undefined')for(const t of ['market.kit','lobby.send'])NEED_DOMUS82.add(t);
function mockHouseOf92(w,acct){const A=w&&w.accounts&&w.accounts[acct];return A&&A.domus?mockDomus82(w,A.domus):null}
/* coin on a gladiator → his house's treasury */
function mockPurse92(w,me,k){const D=mockHouseOf92(w,me);if(!D)return 0;let moved=0;
  for(const c of Object.values(w.chars||{}))if(c&&c.owner===me&&c.alive&&c.domus===D.id&&(c.wallet|0)>0){moved+=c.wallet|0;c.wallet=0}
  if(moved){D.treasury=(D.treasury|0)+moved;ONLC.ledAdd(D,k||'purse',moved);if(!D.purse92)D.purse92=Date.now()}return moved}
function mockPurseAll92(w,k){for(const id of Object.keys(w.accounts||{}))if(!/^bot/.test(id))mockPurse92(w,id,k)}
/* the old route pays from the gladiator: lend it the treasury, take back what is left */
function mockLend92(name,k,pick){const base=MOCK_ROUTES[name];if(!base)return;MOCK_ROUTES[name]=function(w,d,me){const D=mockHouseOf92(w,me);let ch=null;try{ch=D?pick(w,d||{},me):null}catch(e){ch=null}
  if(!D||!ch||ch.owner!==me||!ch.alive)return base.apply(this,arguments);mockPurse92(w,me);const T0=D.treasury|0;ch.wallet=T0;D.treasury=0;let r,ok=false;
  try{r=base.apply(this,arguments);ok=true}finally{const left=Math.max(0,ch.wallet|0);ch.wallet=0;D.treasury=(D.treasury|0)+left;if(ok&&T0>left)ONLC.ledAdd(D,k,T0-left)}
  if(r&&typeof r==='object'&&!Array.isArray(r))r={...r,domus92:mockDRow82(D)};return r}}
const mockPickC92=(w,d)=>w.chars[d.char];const mockPickA92=(w,d,me)=>onlMockChar(w,me);
mockLend92('char.buy','gear',mockPickC92);mockLend92('offer.buy','off',mockPickC92);mockLend92('market.buy','gear',mockPickC92);
mockLend92('lobby.ticket','bet',mockPickA92);mockLend92('bet.place','bet',mockPickA92);mockLend92('auction.bid','auc',mockPickA92);mockLend92('lobby.pass','bet',mockPickA92);
/* the repair: the treasury only; Issued pieces never */
MOCK_ROUTES['gear.repair']=(w,d,me)=>{const D=mockHouse83(w,me);mockPurse92(w,me);const item=String(d.item||'');let H=D,hc=null;
  if(d.holder!=='house'){hc=mockOwn83(w,me,d.holder);if(hc.domus!==D.id)throw new Error(_T('Not of your house.'));if(mockCharBusy82(w,hc.id))throw onlErr82(_T`${hc.name} is in a match — the forge waits.`,'in_match');H=hc}
  const I=(H.gear||[]).includes(item)?ONLC.pieceOf(H,item,onlCatalog()):null;if(!I)throw new Error(_T('That piece is not there.'));if(I.iss)throw onlErr82(_T('Issued gear is never repaired.'),'issued');
  if(I.st!=='broken'&&I.st!=='damaged')throw new Error(_T('That piece is whole.'));const cost=ONLC.repairCost(I);
  if((D.treasury|0)<cost)throw onlErr82(_T`The treasury needs ${cost} coin.`,'no_coin',{cost});D.treasury-=cost;ONLC.ledAdd(D,'repair',cost);
  ONLC.repairItem(H,item);return {cost,item,holder:hc?hc:mockShelf83(D),domus:mockDRow82(D),domus92:mockDRow82(D)}};
/* 🪙 the coin a seated lanista sends into the match */
MOCK_ROUTES['lobby.send']=(w,d,me)=>{const D=mockHouse83(w,me);mockPurse92(w,me);const L=mockLobby80(w,d.id);if(L.status!=='waiting')throw new Error(_T('Already under way.'));
  const p=L.players.find(q=>q.id===me);if(!p)throw new Error(_T('Sit down first.'));const n=Number(d.coin);const why=ONLC.sendWhy92(n,D.treasury|0);if(why)throw new Error(why);
  if(n)p.send92=n;else delete p.send92;mockUpd80(w,L);return {...mockRoomOut80(w,L),domus92:mockDRow82(D)}};
function mockBack92(w,acct,v,k){const D=mockHouseOf92(w,acct);if(!D||!v)return;D.treasury=(D.treasury|0)+v;const G=D.led89;
  if(k==='sent'){if(G&&G.out&&G.out.sent!=null)G.out.sent=Math.max(0,(G.out.sent|0)-v)}else ONLC.ledAdd(D,k,v)}
function mockReserve92(w,L){const got={};for(const p of L.players||[]){if(!p||/^bot/.test(p.id))continue;delete p.sent92;const want=Math.max(0,Math.min(ONLC.SEND_MAX92,p.send92|0));if(!want)continue;
    const D=mockHouseOf92(w,p.id);if(!D)continue;mockPurse92(w,p.id);const amt=Math.min(want,Math.max(0,D.treasury|0));if(!amt)continue;D.treasury-=amt;ONLC.ledAdd(D,'sent',amt);p.sent92=amt;got[p.id]=amt}return got}
function mockUnreserve92(w,L,got){for(const [a,v] of Object.entries(got||{}))mockBack92(w,a,v,'sent');for(const p of L.players||[])delete p.sent92}
function mockRefundSent92(w,L,M){const ab=(M&&M.abandoned)||{};const done=(L.sent92done=L.sent92done||{});
  for(const p of L.players||[]){const v=p.sent92|0;if(!v||/^bot/.test(p.id)||ab[p.id]||done[p.id])continue;done[p.id]=1;mockBack92(w,p.id,v,'sent')}}
/* the horns: reserve first (the room pushed by the start carries seat.sent92); a start that only began the countdown gives it back */
{const base=MOCK_ROUTES['lobby.start'];MOCK_ROUTES['lobby.start']=function(w,d,me){const L=w.lobbies[d&&d.id];if(!L||L.status!=='waiting')return base.apply(this,arguments);
  const got=mockReserve92(w,L);let r;try{r=base.apply(this,arguments)}catch(e){mockUnreserve92(w,L,got);throw e}if(L.status!=='live')mockUnreserve92(w,L,got);return r}}
/* the settlement: a survivor's leftover coin home (up to what was sent); a void match gives it all back; so does a match called off */
{const base=mockAfter83;mockAfter83=function(w,L,M,a,i,row,out,gx){const r=base.apply(this,arguments);try{if(!M||!out||!L)return r;const p=L.players[i];const sent=p?p.sent92|0:0;if(!sent)return r;
    const done=(L.sent92done=L.sent92done||{});if(done[p.id])return r;done[p.id]=1;const home=ONLC.sendBack92(sent,row,out);out.sent92=sent;out.back92=home;if(home)mockBack92(w,p.id,home,'back')}catch(e){console.error(e)}return r}}
{const base=MOCK_ROUTES['match.result'];MOCK_ROUTES['match.result']=function(w,d,me){const L=w.lobbies[d&&d.id];const M=w.matches[d&&d.id];const was=M&&M.status;const r=base.apply(this,arguments);
  try{if(L&&M&&M.status==='done'&&was!=='done'&&ONLC.agree(M.reports||{}).void)mockRefundSent92(w,L,M)}catch(e){console.error(e)}return r}}
{const base=mockClose;mockClose=function(w,L){const live=!!L&&L.status==='live';const M=L&&w.matches[L.id];const r=base.apply(this,arguments);try{if(live)mockRefundSent92(w,L,M)}catch(e){}return r}}
/* 🎒 a kit for a gladiator */
MOCK_ROUTES['market.kit']=(w,d,me)=>{const D=mockHouse83(w,me);mockPurse92(w,me);const ch=mockOwn83(w,me,d.char);if(ch.domus!==D.id)throw new Error(_T('Not of your house.'));
  if(mockCharBusy82(w,ch.id))throw onlErr82(_T`${ch.name} is in a match — the storeroom waits.`,'in_match');const cat=onlCatalog();
  const k=String(d.kit||'');let K=null,ki=-1,list;if(k==='restock'){ki=d.i|0;K=(ch.kits89||[])[ki];if(!K)throw new Error(_T('No such loadout.'));list=ONLC.restockList92(K)}else list=ONLC.kitList92(k,ch.cls);
  if(!list)throw new Error(_T('No such kit.'));const daily=k==='daily',day=ONLC.dayKey(mockNow());const plan=ONLC.kitPlan92(ch,D,list,cat,{free:daily,fill:daily});
  const why=ONLC.kitWhy92(k,plan,D,D.treasury|0,day);if(why)throw onlErr82(why,/treasury/.test(why)?'no_coin':daily&&/tomorrow/.test(why)?'kit_day':'kit_none',{cost:plan.cost});
  if(daily)D.kitDay92=day;else if(plan.cost){D.treasury-=plan.cost;ONLC.ledAdd(D,'kit',plan.cost)}
  const took=[];for(const it of plan.take){const P=ONLC.takePiece(D,it);if(P)took.push(P)}
  const news=ONLC.kitPieces92(ch,plan.buy,daily);const eq=ONLC.kitEquip92(ch,{...plan,take:took.map(P=>P.item)},news);const off=ONLC.dressApply(ch,eq,[...took,...news],cat).off;for(const P of off)ONLC.putPiece(D,P,false);
  if(K)ONLC.kitRemap92(ch,ki,[...plan.have,...took.map(P=>P.item),...news.map(P=>P.item)]);
  return {char:ch,kit:k,bought:plan.buy,took:plan.take,cost:daily?0:plan.cost,disc:daily?0:plan.disc,full:plan.full,issued:daily,domus:mockDRow82(D),domus92:mockDRow82(D),gear:D.gear||[],pcs:D.pcs||{}}};
/* a gift's coin lands in the treasury */
{const base=MOCK_ROUTES['gift.open'];if(base)MOCK_ROUTES['gift.open']=function(w,d,me){const r=base.apply(this,arguments);try{mockPurse92(w,me,'gift');if(r&&r.reward&&r.reward.k==='coin')r.to='house';const D=mockHouseOf92(w,me);if(D&&r&&typeof r==='object'){r.domus=mockDRow82(D);r.domus92=r.domus}}catch(e){}return r}}
/* every request: a purse found on the caller moves first; coin paid to anyone's gladiator during it (payouts, refunds) moves after */
{const KIND={'gift.open':'gift','auction.bid':'refund','auction.list':'refund'};
  for(const t of Object.keys(MOCK_ROUTES)){const base=MOCK_ROUTES[t];MOCK_ROUTES[t]=function(w,d,me){try{if(me&&w&&w.accounts&&w.accounts[me])mockPurse92(w,me,'purse')}catch(e){}
    const r=base.apply(this,arguments);try{if(w&&w.accounts)mockPurseAll92(w,KIND[t]||'wager')}catch(e){}return r}}}

/* =========================== 2 · THE CLIENT =========================== */
const onlT92=()=>((ONL.domus||{}).treasury|0);
/* every reply that changed the treasury carries the house row (domus92) */
{const base=NET.req;NET.req=function(t,d){const p=base.apply(this,arguments);return Promise.resolve(p).then(r=>{try{if(r&&typeof r==='object'&&r.domus92){const X=r.domus92;delete r.domus92;
    const mine=ONL.domus&&ONL.domus.id;if(X&&X.id&&(!mine||X.id===mine)){ONL.domus={...(ONL.domus||{}),...X};if(typeof ONL82!=='undefined'&&ONL82.dg)ONL82.dg.domus=ONL.domus}}}catch(e){}return r})}}
/* the old screens read ch.wallet to say what is affordable: while they draw, every gladiator "holds" the treasury */
function onlLend92(fn){const T=onlT92();const seen=new Map();for(const c of [ONL.char,...(ONL.chars||[])])if(c&&!seen.has(c))seen.set(c,c.wallet);for(const c of seen.keys())c.wallet=T;
  try{return fn()}finally{for(const [c,v] of seen)c.wallet=v}}
const onlTpl92=h=>{const T=document.createElement('template');T.innerHTML=h;return T};
const onlCoin92=n=>coinAmt87(n|0);

/* ---------------- the match: the seat starts with the class's coin + the coin sent ---------------- */
{const base=onlSeatsFor;onlSeatsFor=function(L){const seats=base.apply(this,arguments);try{(L.players||[]).forEach((p,i)=>{const s=seats[i];if(!s||s.cpu||!s.onl||/^bot/.test(p.id))return;const v=p.sent92|0;if(v>0)s.coinStart=(s.coinStart|0)+v})}catch(e){console.error(e)}return seats}}
/* after the bout: the house's earnings + what came home */
{const base=onlSettled;onlSettled=function(res){try{const o=res&&res.out;if(o&&o.earn92!=null)res={...res,out:{...o,pay:o.earn92}};
    if(o&&!res.void&&(o.sent92|0)>0)setTimeout(()=>onlToast80(o.back92?_T`🪙 ${o.back92} of the ${o.sent92} coin sent came home to the treasury.`:_T`🪙 The ${o.sent92} coin sent stayed on the sand.`),7400);
    setTimeout(()=>{NET.req('domus.get',{}).then(r=>{if(r&&r.domus){ONL.domus=r.domus;if(typeof ONL82!=='undefined'){ONL82.dg=r;ONL82.dgAt=Date.now()}}}).catch(()=>{})},600)}catch(e){}return base.call(this,res)}}

/* ---------------- the room: 🪙 Send (0–10 coin into the match) ---------------- */
function onlSend92HTML(L){const me=onlMe80();const p=(L.players||[]).find(q=>q.id===me);if(!p)return '';const T=onlT92();const cur=p.send92|0;const max=Math.min(ONLC.SEND_MAX92,Math.max(cur,T));
  const opts=Array.from({length:ONLC.SEND_MAX92+1},(_,n)=>`<option value="${n}" ${n===cur?'selected':''} ${n>max?'disabled':''}>${n}</option>`).join('');
  return `<label class="snd92" title="${esc2(_T`Coin from the treasury on top of the class's starting coin (at most ${ONLC.SEND_MAX92}). A survivor brings home what is left of it; the dead lose it.`)}">${_T`🪙 Send`} <select class="tin" data-snd92="${esc2(L.id)}">${opts}</select> <small>${_T`of ${onlCoin92(T)}`}</small></label>`}
{const base=onlRoomHTML80;onlRoomHTML80=function(L,grey){let h=base.apply(this,arguments);try{if(!L||grey||L.status!=='waiting'||typeof h!=='string')return h;const s=onlSend92HTML(L);
    if(s&&h.indexOf('<div class="acts r80-go">')>=0)h=h.replace('<div class="acts r80-go">','<div class="acts r80-go">'+s)}catch(e){console.error(e)}return h}}
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.matches||!t.matches('#onl [data-snd92]'))return;const id=t.dataset.snd92,coin=+t.value|0;
  onlDo(async()=>{await onlReq80('lobby.send',{id,coin});onlToast80(coin?_T`🪙 ${coin} coin go into the match with him.`:_T('🪙 No coin sent.'))})},true);
/* the stakes at the horns count the coin sent */
{const base=ONL83.stakes;ONL83.stakes=function(L){const S=base.apply(this,arguments);try{for(const s of S){const p=(L.players||[])[s.seat];const c=p?(p.sent92!=null?p.sent92|0:p.send92|0):0;if(c){s.coin92=c;s.value=(s.value|0)+c}}}catch(e){}return S}}
/* 🚪 the abandon popup: the coin sent is at stake, never a purse */
{const base=onlStakeHTML80;onlStakeHTML80=function(o){try{const c=(o&&o.char)||{};const id=(ONL.live&&ONL.live.id)||null;const L=(ONL.lobbies||[]).find(x=>x&&x.id===id);
    const p=L&&(L.players||[]).find(q=>q&&(q.char===c.id||q.id===onlMe80()));const sent=p?p.sent92|0:0;const coin=typeof ICO!=='undefined'&&ICO.coin?ICO.coin:'🪙';
    let h=base.call(this,{...o,char:{...c,wallet:sent}});h=h.replace(`<span>${coin} ${sent}</span>`,'');
    if(sent)h=h.replace('<div class="stk80-gear">',`<div class="stk80-now stk92">${_T`🪙 ${sent} coin sent into this match from the treasury — a survivor brings it home.`}</div><div class="stk80-gear">`);return h}catch(e){console.error(e);return base.apply(this,arguments)}}}

/* ---------------- the Domus: no purse — the treasury and what is at stake ---------------- */
d89Stake=function(c){let v=0;for(const it of ONLC.equipOf(c)){if(ONLC.isHome(c,it))continue;const I=ONL83.piece(c,it);if(I)v+=ONLC.valueOf(I)}return {gear:v,purse:0,all:v}};
{const base=d89Show;d89Show=function(ch,busy){const h=base.apply(this,arguments);try{if(!ch)return h;const T=onlTpl92(h);const m=T.content.querySelector('.sc89-mon');if(m){const st=d89Stake(ch);
    m.innerHTML=`<div class="mon89 stk89 ${st.all>=STAKE_HIGH89?'hi89':''}"><small>${_T`At stake in Ranked`}</small><b>${onlCoin92(st.all)}</b><i>${_T`the gear he brings + the coin you send`}</i></div>
      <div class="mon89 tre92"><small>${_T`🏛 Treasury`}</small><b>${onlCoin92(onlT92())}</b><i>${_T`pays for all his gear · up to ${ONLC.SEND_MAX92} coin into a match`}</i></div>`}
    return T.innerHTML}catch(e){console.error(e);return h}}}
{const base=d89Cards;d89Cards=function(){const h=base.apply(this,arguments);try{const T=onlTpl92(h);for(const w of T.content.querySelectorAll('.gc89-w')){const n=w.nextElementSibling;if(n&&n.tagName==='SMALL'&&!n.className)n.remove()}return T.innerHTML}catch(e){return h}}}
/* the ledger: every source by name */
d89Ledger=function(){const L=(ONL.domus||{}).led89;const T=onlT92();
  const IN=[['cut',_T('Bout earnings')],['back',_T('Coin brought home')],['wager',_T('Wagers won & refunds')],['gift',_T('Donativa (Flavius)')],['purse',_T('Purses moved to the treasury')],['sale',_T('Sales (a full shelf)')],['refund',_T('Refunds')],['grant',_T('Tester grants')]];
  const OUT=[['gear',_T('Gear')],['kit',_T('Kits')],['off',_T('Offerings')],['repair',_T('Repairs')],['sent',_T('Coin sent into matches')],['bet',_T('Tickets & wagers')],['auc',_T('Auction bids')],['class',_T('Class changes')],['rudis',_T('Rudis granted')],['upg',_T('Upgrades')]];
  const row=(l,v,neg)=>`<div class="lg89-r"><span>${l}</span><b class="${neg?'neg':''}">${neg?'−':''}${d89Coin(v)}</b></div>`;
  if(!L)return `<div class="lg89"><b class="lg89-h">${_T`🏛 The treasury · ${d89Coin(T)}`}</b><p class="rc-sub">${_T`The ledger starts with v0.89 — nothing booked yet.`}</p></div>`;
  const ins=IN.filter(([k])=>L.in[k]).map(([k,l])=>row(l,L.in[k])).join('')||`<p class="rc-sub">${_T`Nothing yet.`}</p>`;
  const outs=OUT.filter(([k])=>L.out[k]).map(([k,l])=>row(l,L.out[k],1)).join('')||`<p class="rc-sub">${_T`Nothing yet.`}</p>`;
  const by=(L.by||[]).length?L.by.map(b=>row(esc2(b.n||'?'),b.v)).join(''):`<p class="rc-sub">${_T`No bout paid the house yet.`}</p>`;
  return `<div class="lg89"><b class="lg89-h">${_T`🏛 The treasury · ${d89Coin(T)}`}</b><small class="rc-sub">${_T`Totals since v0.89 (${esc2(new Date(L.since||Date.now()).toLocaleDateString())}) — what came before is not known.`} ${_T`Every coin the house earns or spends — the gladiators keep no purse.`}</small>
    <div class="lg89-g"><div><div class="lg89-t">${_T`In`}</div>${ins}</div><div><div class="lg89-t">${_T`Out`}</div>${outs}</div><div><div class="lg89-t">${_T`Earned by gladiator`}</div>${by}</div></div></div>`};
/* a repair: the treasury pays */
d89Repair=function(x){const I=x.I;if(I&&I.iss)return d89Err(_T('Issued gear is never repaired.'));const cost=ONLC.repairCost(I);if(onlT92()<cost)return d89Err(_T`The repair costs ${cost} coin — the treasury holds ${onlT92()}.`);
  return onlDo(async()=>{const r=await NET.req('gear.repair',{holder:x.from,item:x.it,pay:'treasury'});d89Put(r);ONL82.dgAt=0;onlToast80(_T`🔨 ${esc2(I.n)} is whole again (${coinAmt87(r.cost)}).`)})};
onl83Repair=function(from,item){const H=onl83Holder(from);const I=H&&ONL83.piece(H,item);if(!I)return;return d89Repair({I,it:item,from,h:H})};
/* the Issued mark on a bar tile */
{const base=d89Tile;d89Tile=function(ch,x,i,busy){const h=base.apply(this,arguments);try{if(x&&x.I&&x.I.iss)return h.replace('<small class="cm89',`<small class="is92" title="${esc2(_T('Issued by Flavius: worth nothing, never repaired, it vanishes when lost.'))}">${_T`🎁 Issued`}</small><small class="cm89`)}catch(e){}return h}}
/* the loadouts: 🛒 Restock what a bout used up */
{const base=d89Kits;d89Kits=function(ch){let h=base.apply(this,arguments);try{const K=ch.kits89||[];if(!K.length)return h;const cat=onlCatalog();const sh=onl83Holder('house');
    const T=onlTpl92(h);T.content.querySelectorAll('.kt89-c').forEach((el,i)=>{const P=ONLC.kitPlan92(ch,sh,ONLC.restockList92(K[i]),cat);if(!P.buy.length)return;
      el.insertAdjacentHTML('beforeend',`<button type="button" class="btn tksm kt92rs" data-kt92="restock" data-i="${i}" title="${esc2(_T`Rebuy what a bout used up: ${P.buy.map(b=>(cat[b]||{}).n||b).join(', ')}`)}">${_T`🛒 ${onlCoin92(P.cost)}`}</button>`)});return T.innerHTML}catch(e){console.error(e);return h}}}

/* ---------------- the stage, the creator, the pass: the treasury ---------------- */
{const base=onlStageHTML;onlStageHTML=function(ch){const h=base.apply(this,arguments);try{const T=onlTpl92(h);const s=T.content.querySelector('.onl-pstats > span');
    if(s&&!ONLC.isGuest){s.title=_T('The house treasury');s.innerHTML=`🏛 ${onlCoin92(onlT92())}`}return T.innerHTML}catch(e){return h}}}
{const base=onlCreatorHTML;onlCreatorHTML=function(){const h=base.apply(this,arguments);try{const T=onlTpl92(h);const p=T.content.querySelector('.onl-cform > p.rc-sub');
    if(p)p.textContent=_T("Starts with the recruit kit (the class's weapons, no armor). Every coin he earns goes to your house's treasury, which buys his gear. Nothing carries over from a fallen gladiator.");return T.innerHTML}catch(e){return h}}}
if(typeof onlPassRoom82==='function'){const base=onlPassRoom82;onlPassRoom82=function(){return onlLend92(()=>base.apply(this,arguments))}}
if(typeof onlDomusHTML82==='function'){const base=onlDomusHTML82;onlDomusHTML82=function(){const h=base.apply(this,arguments);try{const T=onlTpl92(h);const x=T.content.querySelector('.dom82-rec > div:last-child');
    if(x)x.innerHTML=`<b>${onlCoin92(onlT92())}</b><small>${_T('Treasury')}</small>`;return T.innerHTML}catch(e){return h}}}
if(typeof ONL_WHY!=='undefined')Object.assign(ONL_WHY,{bet:_T('to place a wager — a house wagers through its gladiator'),betgo:_T('to place a wager — a house wagers through its gladiator'),ticket:_T('to buy a ticket — a seat goes to a house with a gladiator')});
/* pushes that put coin back: the treasury on screen follows (an outbid bid, a speared ticket) */
{const base=NET.emit;NET.emit=function(t,d){try{if(d&&typeof d==='object'&&ONL.domus&&(t==='auction.outbid'||t==='stands.refund')&&(d.amt|0)>0){ONL.domus={...ONL.domus,treasury:(ONL.domus.treasury|0)+(d.amt|0)};if(t==='auction.outbid')d={...d,to:'house',char:null}}}catch(e){}return base.call(this,t,d)}}

/* ---------------- the Armory: the treasury pays; 🎒 KITS ---------------- */
function kit92Av(list,id){const L=[];for(const b of list){const A=ARM[b];if(!A)continue;const locs=A.slot==='head'?['head']:A.slot==='chest'||A.slot==='belt'?['chest']:A.slot==='arm'?(A.pair?['rarm','larm']:['rarm']):A.slot==='leg'?(A.pair?['rleg','lleg']:['rleg']):[];for(const l of locs)L.push([b,l])}
  try{return avatarSVG(avatarFor73(L,id))}catch(e){return ''}}
function kit92Card(ch,k,list,o){o=o||{};const cat=onlCatalog();const sh=onl83Holder('house');const daily=k==='daily';const P=ONLC.kitPlan92(ch,sh,list,cat,{free:daily,fill:daily});const T=onlT92();
  const D=ONL.domus||{};const day=ONLC.dayKey(typeof onlNow82==='function'?onlNow82():Date.now());const why=ONLC.kitWhy92(k,P,D,T,day);
  const have=new Set([...P.have,...P.take].map(ONLC.itemBase));const pcs=list.map(b=>{const it=cat[b]||{};const own=have.has(b);if(own)have.delete(b);
    return `<li class="${own?'own':''}"><span>${own?'✓':'·'} ${esc2(it.n||b)}</span><small>${own?_T('owned'):daily?_T('free'):onlCoin92(ONLC.priceOf(it))}</small></li>`}).join('');
  const done=!P.buy.length&&!P.take.length;
  const lbl=daily?(D.kitDay92===day?_T('🎁 Taken today'):done?_T('✓ He has it all'):_T('🎁 Take it — free')):done?_T('✓ Complete'):!P.buy.length?_T('⇄ Take from the shelf'):(k==='cls'?_T`Complete the kit · ${onlCoin92(P.cost)}`:_T`Buy the missing · ${onlCoin92(P.cost)}`);
  const sub=daily?'':P.disc?_T`${onlCoin92(P.part)} − ${Math.round(ONLC.KIT_DISC92*P.share*100)}% kit discount`:P.take.length&&!P.buy.length?_T('from the house shelf'):'';
  return `<div class="kt92c ${daily?'daily':''} ${k==='cls'?'cls':''}"><div class="kt92-av">${kit92Av(list,'kt92_'+k)}</div><div class="kt92-b"><b>${esc2(o.title||KIT92_N()[k]||k)}</b>${o.sub?`<small class="rc-sub">${o.sub}</small>`:''}
    <ul class="kt92-l">${pcs}</ul><button type="button" class="btn tksm ${why?'':'primary'}" data-kt92="${k}" ${why?_T`disabled title="${esc2(why)}"`:''}>${lbl}</button>${sub?`<small class="kt92-d">${sub}</small>`:''}</div></div>`}
function onlKitsHTML92(ch){if(!ch)return '';const K=ch.kits89||[];const cat=onlCatalog();const sh=onl83Holder('house');const cls=(CLASSES[ch.cls]||{}).name||ch.cls;const N=KIT92_N(),Dd=KIT92_D();
  const rest=K.map((x,i)=>{const P=ONLC.kitPlan92(ch,sh,ONLC.restockList92(x),cat);return P.buy.length?`<button type="button" class="btn tksm" data-kt92="restock" data-i="${i}" title="${esc2(P.buy.map(b=>(cat[b]||{}).n||b).join(', '))}">${_T`🛒 Restock ${esc2(x.n)} · ${onlCoin92(P.cost)}`}</button>`:''}).join('');
  return `<details class="kt92" ${ONL.kt92shut?'':'open'}><summary>${_T`🎒 Kits for ${esc2(ch.name)}`} <small class="rc-sub">${_T`owned pieces (his or the shelf's) are skipped · up to ${Math.round(ONLC.KIT_DISC92*100)}% off a whole kit · the treasury pays`}</small></summary>
    <div class="kt92-row">${kit92Card(ch,'cls',ONLC.kitList92('cls',ch.cls),{title:_T`${N.cls} · ${esc2(cls)}`,sub:_T('his class’s printed armor')})}${['scrap','recruit','champ'].map(k=>kit92Card(ch,k,ONLC.kitList92(k),{sub:Dd[k]})).join('')}
      ${kit92Card(ch,'daily',ONLC.DAILY92,{sub:Dd.daily})}</div>${rest?`<div class="kt92-rs">${rest}</div>`:''}</details>`}
{const base=onlArmoryHTML;onlArmoryHTML=function(){const ch=ONL.char;if(!ch||(typeof onlIsGuest82==='function'&&onlIsGuest82()))return base.apply(this,arguments);
  const h=onlLend92(()=>base.apply(this,arguments));try{const T=onlTpl92(h);const sub=T.content.querySelector('.onl-lbtop .rc-sub');const R=ONLC.rankFor(ch);
    if(sub)sub.innerHTML=_T`🏛 Treasury ${onlCoin92(onlT92())} · buys for ${esc2(ch.name)} · ${esc2(R.n)} wears up to level ${R.mkt}${R.mkt<4?_T(' (named pieces: Veteranus+)'):''}`;
    const top=T.content.querySelector('.onl-lbtop');const t=typeof ONL83U!=='undefined'?ONL83U.mkt:'board';if(top&&t!=='used')top.insertAdjacentHTML('afterend',onlKitsHTML92(ch));return T.innerHTML}catch(e){console.error(e);return h}}}
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.matches&&d.matches('#onl details.kt92'))ONL.kt92shut=!d.open},true);
/* a kit, bought */
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#onl [data-kt92]');if(!b||b.disabled)return;e.preventDefault();e.stopImmediatePropagation();const ch=ONL.char;if(!ch)return;
  const k=b.dataset.kt92,i=b.dataset.i!=null?+b.dataset.i:undefined;const N=KIT92_N();
  onlDo(async()=>{const r=await NET.req('market.kit',{char:ch.id,kit:k,...(i!=null?{i}:{})});d89Put(r);if(typeof ONL82!=='undefined')ONL82.dgAt=0;const cat=onlCatalog();
    const got=(r.bought||[]).map(x=>(cat[x]||{}).n||x).join(', ');
    onlToast80(r.issued?_T`🎁 Flavius issues ${esc2(got)} to ${esc2(r.char.name)}.`:got?_T`🎒 ${esc2(N[k]||k)}: ${esc2(got)} for ${coinAmt87(r.cost)}${r.disc?_T` (−${r.disc} kit discount)`:''} — ${esc2(r.char.name)} wears it.`:_T`🎒 ${esc2(r.char.name)} wears the kit — from the house shelf.`)})},true);
/* the single buy: the treasury pays */
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#onl [data-onl82="buy"]');if(!b||b.disabled)return;e.preventDefault();e.stopImmediatePropagation();
  const cat=onlCatalog();const v=b.dataset.v;const it=cat[v];const ch=ONL.char;if(!it||!ch)return;const pr=ONLC.priceOf(it);const T=onlT92();
  ask76(_T('🛒 Buy this piece?'),`<p style="margin:0">${_T`Buy <b>${esc2(it.n)}</b> (level ${it.lv}${it.kind==='a'?_T` · ${it.ap|0} AP`:''}) for <b>${esc2(ch.name)}</b>: <b>${coinAmt87(pr)}</b>?`}</p><p class="rc-sub" style="margin:6px 0 0">${_T`Treasury ${coinAmt87(`${T} → ${T-pr}`)}.`}</p>`,_T`Buy · ${pr}`,_T('Not now'))
    .then(ok=>{if(ok)onlDo(async()=>{const c=await NET.req('char.buy',{char:ch.id,item:v});ONL.char=c;onlCharPut82(c);onlToast80(_T`🛒 Bought ${esc2(it.n)} for ${coinAmt87(pr)}.`)})})},true);

/* ---------------- the look ---------------- */
{const st=document.createElement('style');st.id='econ92css';st.textContent=`
#onl .snd92{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;margin-right:6px;color:#eadbb8}#onl .snd92 select{width:auto;min-width:54px;padding:2px 4px}
#onl .stk92{color:#f3d58a}
#onl .mon89.tre92 b{color:#f3d58a}
#onl .is92{display:block;color:#bfe3ff;font-size:11px;font-weight:600}
#onl .kt92rs{margin-left:4px}
#onl details.kt92{margin:0 0 10px;border:1px solid rgba(168,135,62,.55);border-radius:12px;padding:6px 10px;background:linear-gradient(rgba(42,31,19,.55),rgba(23,17,11,.55))}
#onl details.kt92>summary{cursor:pointer;font:700 15px Georgia,serif;color:#f3d58a;list-style:none}#onl details.kt92>summary::-webkit-details-marker{display:none}
#onl details.kt92>summary small{font:400 12px system-ui,sans-serif;margin-left:6px}
#onl .kt92-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-top:8px}
#onl .kt92c{display:flex;gap:6px;border:1px solid rgba(168,135,62,.35);border-radius:10px;padding:6px;background:rgba(0,0,0,.18);min-width:0}
#onl .kt92c.cls{border-color:#d9b25a;box-shadow:inset 0 0 0 1px rgba(217,178,90,.25)}#onl .kt92c.daily{border-color:#7fb2d9}
#onl .kt92-av{flex:none;width:58px;height:120px;overflow:hidden}#onl .kt92-av svg{width:58px;height:auto;max-height:120px}
#onl .kt92-b{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1}#onl .kt92-b>b{color:#f3d58a;font-size:13px}#onl .kt92-b>small{font-size:11px;line-height:1.25}
#onl .kt92-l{list-style:none;margin:0;padding:0;font-size:11.5px;line-height:1.35}#onl .kt92-l li{display:flex;gap:4px;align-items:baseline}#onl .kt92-l li>span{flex:1;min-width:0}#onl .kt92-l li>small{white-space:nowrap}#onl .kt92-l li.own{color:#9fd39b}#onl .kt92-l small{opacity:.8}
#onl .kt92-b .btn{align-self:flex-start;margin-top:auto}#onl .kt92-d{font-size:10.5px;opacity:.8}
#onl .kt92-rs{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
@media (max-width:600px){#onl .kt92-row{grid-template-columns:1fr}#onl .kt92-av{width:46px;height:96px}#onl .kt92-av svg{width:46px}}`;document.head.appendChild(st)}
