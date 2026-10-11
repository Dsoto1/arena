/* 292-v100srvA — v1.0 ONLINE SERVER BATCH A, the page side (shared rules: the "v1.0 SERVER BATCH A" section of 111-onlcore; the server: the
   "v1.0 SERVER BATCH A" block of server/src/routes.js; docs/backend.md "v1.0 server batch A"). His picks 2026-10-09 / 2026-10-11.
   1 · RANKED = EQUIPPED GEAR ONLY: a Ranked seat carries seat.onl.rk; giveLoadout then adds no class weapons on top of his kit (the class armor was
       never added online). Custom keeps the class loadout. The host builds the opening, so every screen gets the same players.
   2 · THE ISSUED KIT: the Armory's free card is "🎁 Issued kit" — his class's Level 1 weapons + padding, once an online day a house, one set a house
       (a claim takes the house's Issued pieces back from everyone else); the mock route mirrors the server's.
   3 · ONLINE WAGERS GONE: no 💰 Wagers rail tab, no wager buttons, no wager bubbles in an online match; the mock's bet.place refuses like the server.
   4 · A RESULTS SCREEN FOR EVERY PLAYER: the results window of an online match opens with "Your match" (#onr100): your gladiator, victory /
       survived / fallen, the coin to the treasury (Ranked) or "Custom bout — no coin is paid", lifetime CF, Glory, rank-up, and every seat with its
       CF, outcome and Fate. It waits ("⏳ waiting for the other lanistas") until the result is settled and fills in live; the settlement's toasts
       land in it while it is on screen. Watchers see the table.
   5 · DOMUS SLOTS: locked slots show as 🔒 cards with the Glory + coin they need (data-sl100 → domus.slot).
   No save change. */
/* ---------------- 1 · Ranked: only what he wears ---------------- */
{const base=onlSeatsFor;onlSeatsFor=function(L){const seats=base.apply(this,arguments);try{if(L&&L.ranked)for(const s of seats)if(s&&s.onl&&!s.cpu)s.onl.rk=1}catch(e){}return seats}}
{const base=mkPlayer;mkPlayer=function(i,seat){const p=base.apply(this,arguments);try{if(p&&seat&&seat.onl&&seat.onl.rk&&!seat.cpu)p._rk100=1}catch(e){}return p}}
{const base=giveLoadout;giveLoadout=function(p){const C=p&&p._rk100&&p._onlKit?CLASSES[p.cls]:null;if(!C)return base.apply(this,arguments);
  const R0=C.R,L0=C.L;C.R=null;C.L=null;try{return base.apply(this,arguments)}finally{C.R=R0;C.L=L0}}}

/* ---------------- 2 · the Issued kit ---------------- */
if(typeof MOCK_ROUTES!=='undefined'){
  {const base=MOCK_ROUTES['market.kit'];MOCK_ROUTES['market.kit']=(w,d,me)=>{if(!d||d.kit!=='daily')return base(w,d,me);
    const D=mockHouse83(w,me);mockPurse92(w,me);const ch=mockOwn83(w,me,d.char);if(ch.domus!==D.id)throw new Error(_T('Not of your house.'));
    if(mockCharBusy82(w,ch.id))throw onlErr82(_T`${ch.name} is in a match — the storeroom waits.`,'in_match');const cat=onlCatalog();
    const day=ONLC.dayKey(mockNow());if(D.kitDay92===day)throw onlErr82(_T('One free kit a day for each house — come back tomorrow.'),'kit_day');
    const others=Object.values(w.chars).filter(c=>c&&c.alive&&c.owner===me&&c.domus===D.id&&c.id!==ch.id);const away=ONLC.issueElsewhere100(D,others,ch.id);
    const busy=others.find(c=>mockCharBusy82(w,c.id)&&away.some(x=>x.holder===c.id));if(busy)throw onlErr82(_T`The house’s Issued kit is with ${busy.name} in a match — claim it when he is back.`,'in_match');
    const plan=ONLC.issuePlan100(ch,cat);if(!plan.buy.length)throw onlErr82(_T('He already has all of it.'),'kit_none');
    D.kitDay92=day;const back=[];for(const x of away){const H=x.holder==='house'?D:w.chars[x.holder];if(H&&ONLC.takePiece(H,x.item))back.push(ONLC.itemBase(x.item))}
    for(const it of plan.drop)ONLC.takePiece(ch,it);const news=ONLC.kitPieces92(ch,plan.buy,true);const eq=ONLC.kitEquip92(ch,{...plan,take:[]},news);
    const off=ONLC.dressApply(ch,eq,news,cat).off;for(const P of off)ONLC.putPiece(D,P,false);
    return {char:ch,kit:'daily',bought:plan.buy,took:[],back,cost:0,disc:0,full:plan.full,issued:true,domus:mockDRow82(D),domus92:mockDRow82(D),gear:D.gear||[],pcs:D.pcs||{}}}}
  /* ---------------- 3 · wagers closed ---------------- */
  MOCK_ROUTES['bet.place']=()=>{throw onlErr82(_T(ONLC.WAGER_OFF100),'wager_off')};
  /* ---------------- 5 · slots ---------------- */
  MOCK_ROUTES['domus.slot']=(w,d,me)=>{const D=mockHouse83(w,me);mockPurse92(w,me);if(typeof mockDr98Upd==='function')mockDr98Upd(w,D.id);const g=ONLC.slotGlory100(D);const why=ONLC.slotWhy100(D,g);
    if(why)throw onlErr82(_T(why),/treasury/.test(why)?'no_coin':'slot_locked');const s=ONLC.slotBuy100(D,g,mockNow());return {domus:mockDRow82(D),domus92:mockDRow82(D),slot:s.n,cost:s.coin}};
  {const base=MOCK_ROUTES['char.create'];MOCK_ROUTES['char.create']=(w,d,me)=>{const A=w.accounts[me];const D=A&&mockDomus82(w,A.domus);
    if(D){const live=Object.values(w.chars).filter(c=>c.owner===me&&c.alive).length;const s=ONLC.slotNext100(D);
      if(live>=ONLC.gladMax(D)&&s)throw onlErr82(_T`Every slot of your house is taken — open slot ${s.n} in the Domus (${s.glory} Glory + ${s.coin} coin).`,'slot_full')}
    return base(w,d,me)}}
  if(typeof NEED_DOMUS82!=='undefined')NEED_DOMUS82.add('domus.slot')}
/* the Armory's free card: the Issued kit of HIS class */
{const base=kit92Card;kit92Card=function(ch,k,list,o){if(k!=='daily'||!ch)return base.apply(this,arguments);
  return base.call(this,ch,k,ONLC.kitList92('daily',ch.cls),{...(o||{}),title:_T('🎁 Issued kit'),sub:_T('Free once a day for your house: padding and his class’s Level 1 weapons. Issued gear is worth nothing — it cannot be sold, sent or repaired, and it is gone when lost. One set a house.')})}}

/* ---------------- 3 · no wagers online ---------------- */
{const base=onlHTML;onlHTML=function(){if(ONL.tab==='wagers')ONL.tab='play';ONL.betting=null;let h=base.apply(this,arguments);
  try{h=h.replace(/<button type="button" data-[a-z0-9]+="tab" data-v="wagers"[^>]*>[\s\S]*?<\/button>/g,'').replace(/<button[^>]*data-onl="bet"[^>]*>[\s\S]*?<\/button>/g,'');
    /* 1 · the class's weapons come only in Custom */
    h=h.split(_T(' <i>recruit kit</i>')).join(_T(' <i>recruit kit · Custom only</i>'));
    const cr=_T("Starts with the recruit kit (the class's weapons, no armor). Every coin he earns goes to your house's treasury, which buys his gear. Nothing carries over from a fallen gladiator.");
    if(h.includes(cr))h=h.split(cr).join(cr+' '+_T('In Ranked he fights with only what he wears — the class weapons come in Custom.'))}catch(e){}return h}}
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#onl [data-onl="bet"],#onl [data-onl="betgo"],#onl [data-v="wagers"][data-onl="tab"]');if(!b)return;
  e.preventDefault();e.stopImmediatePropagation();if(typeof mToast==='function')mToast(_T(ONLC.WAGER_OFF100))},true);
{const st=document.createElement('style');st.textContent=`body.onlarena #wbubs,body.onlarena .wbub{display:none!important}
.onr100{border:1px solid var(--gold,#c9a14a);border-radius:10px;padding:10px 12px;margin:0 0 12px;background:rgba(201,161,74,.08)}
.onr100 h4{margin:0 0 6px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}.onr100 .onr-st{font-size:.8em;font-weight:400;padding:1px 8px;border-radius:9px;background:rgba(255,255,255,.08)}
.onr100 .onr-st.wait{color:#e6c46a}.onr100 .onr-st.ok{color:#8fd18f}.onr100 .onr-st.void{color:#e08b8b}
.onr100 .onr-me{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;font-size:1.05em}.onr100 .onr-out{font-weight:700}.onr100 .onr-out.fell{color:#e08b8b}.onr100 .onr-out.won{color:var(--gold,#c9a14a)}
.onr100 .onr-pay{display:flex;gap:14px;flex-wrap:wrap;margin:6px 0}.onr100 .onr-pay span{white-space:nowrap}.onr100 .onr-note{margin:4px 0 0;font-size:.9em;opacity:.9}
.onr100 ul.onr-lines{margin:6px 0 0;padding-left:18px;font-size:.88em}.onr100 table{width:100%;border-collapse:collapse;margin-top:8px;font-size:.88em}
.onr100 td,.onr100 th{padding:3px 6px;text-align:left;border-top:1px solid rgba(255,255,255,.08)}.onr100 tr.me td{background:rgba(201,161,74,.12)}
.gc89.sl100{opacity:.9}.gc89.sl100 .sl100-bar{display:block;height:5px;border-radius:3px;background:rgba(255,255,255,.12);margin-top:4px;overflow:hidden}.gc89.sl100 .sl100-bar i{display:block;height:100%;background:var(--gold,#c9a14a)}
.gc89.sl100.can{border-color:var(--gold,#c9a14a);opacity:1}
@media (max-width:600px){.onr100 table th:nth-child(2),.onr100 table td:nth-child(2){display:none}}`;document.head.appendChild(st)}

/* ---------------- 4 · the results screen for every player ---------------- */
const ONR100={res:null,id:null,at:0,lines:[]};
function onr100Live(){return !!(S&&S.onl&&S.over&&S.lastResult)}
function onr100Seat(){if(!S||!S.onl||S.onl.watch)return -1;const n=S.onl.fighters||S.players.length;const s=S.onl.seat;return s!=null&&s>=0&&s<n?s:-1}
function onr100HTML(){if(!onr100Live())return '';const LR=S.lastResult;const seat=onr100Seat();const me=seat>=0?S.players[seat]:null;const row=me?(LR.rows||[]).find(r=>r.id===me.id):null;
  const ranked=!!S.onl.ranked;const res=ONR100.id===S.onl.lobby?ONR100.res:null;const W=typeof onlW81==='function'?onlW81():'🌾';const coin=v=>typeof coinAmt87==='function'?coinAmt87(v):'🪙 '+v;
  const wait=!!me&&!res;const st=res?(res.void?`<span class="onr-st void">${_T`⚖ Void`}</span>`:`<span class="onr-st ok">${_T`✓ Settled`}</span>`):wait?`<span class="onr-st wait">${_T`⏳ Waiting for the other lanistas to confirm…`}</span>`:'';
  const outc=r=>!r?'':r.won?`<span class="onr-out won">${_T`🏆 Victory`}</span>`:r.survives===false?`<span class="onr-out fell">${_T`☠ Fallen`}</span>`:`<span class="onr-out">${_T`✓ Survived`}</span>`;
  let mine='';
  if(me&&row){const o=res&&res.out;const pay=[];let note='';
    if(res&&res.void)note=_T('The lanistas did not agree on the result — the match is void: no pay, no deaths.');
    else if(o){if(ranked&&!o.died){const c=o.earn92!=null?o.earn92:(o.award!=null?o.award:o.pay);pay.push(_T`<span>${coin('+'+(c|0))} to the house treasury</span>`)}
      if(!ranked)note=_T('Custom bout — no coin is paid. Lifetime CF still counts.');else if(o.died)note=_T('Fallen in a Ranked bout — nothing is paid; the house keeps what he left at home.');
      if(o.cf!=null)pay.push(`<span>${W} +${o.cf|0} ${_T`lifetime CF`}</span>`);if(o.glory)pay.push(`<span>${_T`✦ +${o.glory} Glory`}</span>`);
      if(o.rankUp)pay.push(`<span>${_T`⚔ now <b>${esc2(onlRank(o.rankUp).n)}</b>`}</span>`);if(o.factor!=null&&o.factor<1)pay.push(`<span class="rc-sub">${_T`small table ×${o.factor===0.5?'½':'¾'}`}</span>`)}
    else note=ranked?_T('Coin and Glory are paid once every lanista has reported the same result.'):_T('Custom bout — no coin is paid. Lifetime CF still counts.');
    mine=`<div class="onr-me"><b>${esc2(me.name)}</b>${outc(row)}<span>${W} ${row.f|0} ${_T`CF this bout`}</span>${row.fate?`<span class="rc-sub">${esc2(row.fate)}</span>`:''}</div>
      ${pay.length?`<div class="onr-pay">${pay.join('')}</div>`:''}${note?`<p class="onr-note">${note}</p>`:''}${ONR100.lines.length?`<ul class="onr-lines">${ONR100.lines.map(l=>`<li>${l}</li>`).join('')}</ul>`:''}`}
  else mine=`<p class="onr-note">${_T`You watched this match — the fighters' results are below.`}</p>`;
  const rows=(LR.rows||[]).map((r,i)=>{const p=S.players.find(x=>x.id===r.id)||{};const human=!p.cpu;
    return `<tr class="${me&&r.id===me.id?'me':''}"><td><b>${esc2(r.name||p.name||'')}</b>${human?'':' <small class="rc-sub">CPU</small>'}</td><td>${esc2((CLASSES[r.cls]||{}).name||'')}</td><td>${W} ${r.f|0}</td><td>${outc(r)}</td><td><small>${esc2(r.fate||'')}</small></td></tr>`}).join('');
  return `<div class="onr100" id="onr100"><h4>${ranked?_T('⚔ Your Ranked match'):_T('Your Custom match')} ${st}</h4>${mine}
    <table><tr><th>${_T`Gladiator`}</th><th>${_T`Class`}</th><th>${_T`CF`}</th><th>${_T`Outcome`}</th><th>${_T`Fate`}</th></tr>${rows}</table></div>`}
function onr100Paint(){const el=document.getElementById('onr100');if(!el||!onr100Live())return;const h=onr100HTML();if(h)el.outerHTML=h}
{const base=modal;modal=function(title,body,buttons,opt){try{if(onr100Live()&&typeof body==='string'&&/class="rcard/.test(body)&&!/id="onr100"/.test(body)){
    if(ONR100.id!==S.onl.lobby){ONR100.id=S.onl.lobby;ONR100.res=null;ONR100.lines=[];ONR100.at=0}body=onr100HTML()+body}}catch(e){console.error(e)}return base.apply(this,arguments)}}
{const base=onlSettled;onlSettled=function(res){try{const id=(S&&S.onl&&S.onl.lobby)||(ONL.live&&ONL.live.id);if(ONR100.id!==id){ONR100.id=id;ONR100.lines=[]}ONR100.res=res;ONR100.at=Date.now()}catch(e){}
  const r=base.apply(this,arguments);try{onr100Paint()}catch(e){}return r}}
/* while the card is up, the settlement's notes land in it (the CF line is already on the card) */
{const base=mToast;mToast=function(m){try{if(typeof m==='string'&&ONR100.at&&Date.now()-ONR100.at<15000&&document.getElementById('onr100')){
    if(m.includes(_T('lifetime CF')))return;const t=m.replace(/<br\s*\/?>/g,'\n').split('\n').map(x=>x.trim()).filter(Boolean);for(const x of t)if(!ONR100.lines.includes(x))ONR100.lines.push(x);onr100Paint();return}}catch(e){}
  return base.apply(this,arguments)}}

/* ---------------- 5 · Domus slots ---------------- */
function sl100Glory(D){return Math.floor(Math.max(+((D&&D.dr98&&D.dr98.s)||0)||0,0))}
{const base=d89Cards;d89Cards=function(live,busy){let h=base.apply(this,arguments);try{const D=ONL.domus||{};const nx=D.slotNext100;if(!nx)return h;
    h=h.replace(/<button type="button" class="gc89 empty up"[\s\S]*?<\/button>/,'');const g=sl100Glory(D),T=D.treasury|0;const can=g>=nx.glory&&T>=nx.coin;const pct=Math.min(100,Math.round(g/nx.glory*100));
    const card=`<button type="button" class="gc89 empty sl100 ${can?'can':''}" data-sl100="${nx.n}" title="${esc2(can?_T('Open this slot'):ONLC.slotWhy100({...D,dr98:g},g)||'')}"><span class="gc89-plus">${can?'🔓':'🔒'}</span><b>${_T`Slot ${nx.n}`}</b>
      <small>${_T`✦ ${g} / ${nx.glory} Glory`}</small><small>${_T`${coinAmt87(nx.coin)} from the treasury`}</small><span class="sl100-bar"><i style="width:${pct}%"></i></span></button>`;
    const i=h.lastIndexOf('</div>');if(i>0)h=h.slice(0,i)+card+h.slice(i);h=h.replace(/style="--n:(\d+)"/,(m,n)=>_T`style="--n:${(+n)+1}"`)}catch(e){console.error(e)}return h}}
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#onl [data-sl100]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
  const D=ONL.domus||{};const nx=D.slotNext100;if(!nx)return;const g=sl100Glory(D);const why=ONLC.slotWhy100({...D,dr98:g},g);
  if(why){if(typeof mToast==='function')mToast('🔒 '+esc2(_T(why)));return}
  ask76(_T`🔓 Open slot ${nx.n}?`,`<p style="margin:0">${_T`Your house has ${g} Glory (needs ${nx.glory}). The treasury pays ${coinAmt87(nx.coin)}: ${coinAmt87(`${D.treasury|0} → ${(D.treasury|0)-nx.coin}`)}.`}</p>`,_T`Open · ${nx.coin}`,_T('Not now'))
    .then(ok=>{if(!ok)return;onlDo(async()=>{const r=await NET.req('domus.slot',{});if(r&&r.domus){ONL.domus=r.domus;if(typeof ONL82!=='undefined'&&ONL82.dg)ONL82.dg.domus=r.domus}
      if(typeof mToast==='function')mToast(_T`🔓 Slot ${r.slot} is open — raise a new gladiator.`)})})},true);
