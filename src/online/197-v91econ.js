/* 197-v91econ — v0.91 ONLINE ECONOMY II (his picks 2026-10-06; shared rules in the v0.91 section of 111-onlcore, server in routes.js).
   • DAMAGED PRINTED ARMOR (Ranked): every client adds row.dmg = [[engine key, share of the location's AP lost]] for the printed armor a seat
     BROUGHT and still wears at the end (as 90-armfit armShares: 1 − cur/total, 2 decimals; a pair takes its worst leg) — deterministic
     from the lockstep state, so the results still agree by majority. A Ranked survivor's dented piece comes home 🩹 Damaged (repair =
     ceil(value × dmg)); it is worn in Custom, never brought into Ranked until repaired. The Domus bar tiles and the worn list show
     "🩹 Damaged · repair N" with the 🔨 button; the after-bout toast lists them.
   • 🔒 KEEP HOME = NAMED PIECES ONLY: the lock shows only on named (Level 4) pieces, with its one-line tip; a printed piece's old flag is ignored.
   • FLAVIUS'S AUCTION: six lots a week (ONLC.AUC_LOTS), the vault keeps the week's guarantees (aucPlan91); every lot card the same size
     (fixed height, the art scaled to one size, owner history and bids folded into overlays).
   • THE MOCK: gear.repair mends damaged pieces too, gear.home refuses printed pieces (code home_named), the result carries out.dmg.
   (The purse → treasury overdraft was dropped by his call: v0.92 replaces purses with one house treasury.) */

/* ---------------- 1 · the result row: what each seat brought and wears dented ---------------- */
function onl91Dmg(p){const K=p&&p._kit83;if(!K||!Array.isArray(K.gear))return [];const out=[];const seen={};
  const entries=k=>{const E=[];for(const l of LOCS){const P=(p.pieces&&p.pieces[l])||[];if(!P.some(pc=>pc.key===k))continue;const tot=P.reduce((a,pc)=>a+(pc.ap||0),0);const cur=Math.max(0,(p.ap&&p.ap[l])||0);
      if(cur<=0||!tot)continue;for(const pc of P)if(pc.key===k)E.push(Math.max(0,1-Math.min(1,cur/tot)))}return E};
  for(const k of K.gear){if(!ARM[k]||/^n[aw]_/.test(k))continue;const i=seen[k]=(seen[k]||0);seen[k]++;const E=entries(k);let f;
    if(ARM[k].pair){if(i>0)continue;f=E.length?Math.max(...E):0}else f=E[i]||0;f=Math.round(f*100)/100;if(f>0)out.push([k,f])}
  return out.sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:a[1]-b[1])}
{const base=onlRow81;onlRow81=function(G,p){const row=base.apply(this,arguments);try{row.dmg=onl91Dmg(p)}catch(e){console.error(e)}return row}}

/* ---------------- 2 · the after-bout toast ---------------- */
{const base=onlSettled;onlSettled=function(res){const r=base.apply(this,arguments);try{const o=res&&res.out;if(o&&!res.void&&!o.died&&(o.dmg||[]).length){const cat=onlCatalog();
    const list=o.dmg.map(d=>_T`${esc2((cat[d.key]||{}).n||d.key)} (−${Math.round((d.dmg||0)*100)}% AP)`).join(', ');
    setTimeout(()=>onlToast80(_T`🩹 Came home damaged: ${list} — 🔨 repair in the Domus before the next Ranked bout`),5600)}}catch(e){}return r}}

/* ---------------- 3 · the Domus: damaged tiles, the lock on named pieces only ---------------- */
const D91_HOME_TIP=()=>_T('Never taken into Ranked: safe from loss and loot, still worn in Custom.');
function d91Badge(I){if(!I||I.st!=='damaged')return '';return `<small class="dm91">${_T`🩹 Damaged · repair ${ONLC.repairCost(I)}`}</small>`}
function d91Lock(home,attr){return `<button type="button" class="hm89 ${home?'on':''}" ${attr} aria-pressed="${home}" title="${esc2((home?_T('🔒 Kept home. '):_T('🔒 Keep home. '))+D91_HOME_TIP())}">🔒</button>`}
d89Tile=function(ch,x,i,busy){const I=x.I;const named=I.named;const col=named?ONL83.rarCol[I.rar]:'';const brk=I.st==='broken';const dmg=I.st==='damaged';const home=named&&ONLC.isHome(x.h,x.it);const lock=x.from!=='house'&&busy.has(x.from);
  const C=d89Cmp(ch,x);const rc=ONLC.repairCost(I);
  return `<div class="pt89 ${brk?'brk89':''} ${dmg?'dmg91':''} ${C.no?'no89':''} ${named?'nm89':''} ${lock?'lk89':''}" data-p89="${i}" ${rc89(named&&col)} role="button" tabindex="0" aria-label="${esc2(I.n)}">
    <div class="pt89-art">${d89Art(I)}${brk?'<i class="crk89"></i>':''}</div>
    <b class="pt89-n">${esc2(I.n)}</b><small class="pt89-s">${named?`${esc2(ONLC.rarOf(I.rar).n)} · `:''}L${I.lv}${I.kind==='a'?_T` · ${I.ap|0} AP`:''}${x.from!=='house'?_T` · with ${esc2(x.h.name||'')}`:''}</small>
    ${d91Badge(I)}<small class="cm89 ${C.no?'why':''}">${C.no?esc2(C.no):C.ok}</small>
    <span class="pt89-b">${brk||dmg?`<button type="button" class="rp89" data-d89rep="${i}" title="${named?_T`Repair: a third of its value`:_T`Repair: a tenth of its value`}">${_T`🔨 ${rc}`}</button>`:''}${named?d91Lock(home,`data-d89home="${i}"`):''}</span></div>`};
d89Worn=function(ch){const out=[];for(const it of ONLC.equipOf(ch)){const I=ONL83.piece(ch,it);if(I&&I.kind==='a')out.push({it,I})}
  return out.map(({it,I})=>{const home=I.named&&ONLC.isHome(ch,it);const dmg=I.st==='damaged';
    return `<span class="wr89 ${I.named?'nm89':''} ${dmg?'dmg91':''}" ${rc89(I.named&&ONL83.rarCol[I.rar])}><span class="wr89-p" data-d89off="${esc2(it)}" role="button" tabindex="0" title="${_T`${esc2(I.n)} · ${I.ap|0} AP — take it off`}">${d89Art(I,'sm')}<b>${esc2(I.n)}</b></span>${dmg?`<button type="button" class="rp89 rp91" data-d91rep="${esc2(it)}" title="${_T`🩹 Damaged — never brought into Ranked until repaired`}">${_T`🩹 🔨 ${ONLC.repairCost(I)}`}</button>`:''}${I.named?d91Lock(home,`data-d89homew="${esc2(it)}"`):''}</span>`}).join('')};
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#onl [data-d91rep]');if(!b)return;e.stopPropagation();e.preventDefault();const ch=d89Act();if(!ch)return;const it=b.dataset.d91rep;const I=ONL83.piece(ch,it);
  if(I)return d89Repair({I,it,from:ch.id,h:ch})},true);
/* the hover card names the damage */
document.addEventListener('mouseover',e=>{const t=e.target.closest&&e.target.closest('#onl .dom89 [data-p89]');if(!t)return;const x=(V89D.bar||[])[+t.dataset.p89];if(!x||!x.I||x.I.st!=='damaged')return;
  setTimeout(()=>{const f=document.getElementById('cmp89');if(!f||f.hidden||f.querySelector('.dm91'))return;const b=f.querySelector('.cmp89-b');if(b)b.insertAdjacentHTML('beforeend',`<small class="dm91">${x.I.kind==='a'?_T`🩹 Damaged (−${Math.round((x.I.dmg||0)*100)}% AP) — 🔨 ${ONLC.repairCost(x.I)} to repair; worn in Custom, not in Ranked`:_T`🩹 Dented — 🔨 ${ONLC.repairCost(x.I)} to repair; worn in Custom, not in Ranked`}</small>`)},0)});

/* ---------------- 4 · the mock mirrors the server ---------------- */
MOCK_ROUTES['gear.repair']=(w,d,me)=>{const D=mockHouse83(w,me);const item=String(d.item||'');let H=D,hc=null;
  if(d.holder!=='house'){hc=mockOwn83(w,me,d.holder);if(hc.domus!==D.id)throw new Error(_T('Not of your house.'));if(mockCharBusy82(w,hc.id))throw onlErr82(_T`${hc.name} is in a match — the forge waits.`,'in_match');H=hc}
  const I=(H.gear||[]).includes(item)?ONLC.pieceOf(H,item,onlCatalog()):null;if(!I)throw new Error(_T('That piece is not there.'));if(I.st!=='broken'&&I.st!=='damaged')throw new Error(_T('That piece is whole.'));const cost=ONLC.repairCost(I);
  const byT=d.pay==='treasury'||(d.pay==null&&!hc);let payer=null;
  if(byT){if((D.treasury|0)<cost)throw onlErr82(_T`The treasury needs ${cost} coin.`,'no_coin',{cost});D.treasury-=cost;ONLC.ledAdd(D,'repair',cost)}
  else{payer=mockOwn83(w,me,d.pay||hc.id);if(payer.domus!==D.id)throw new Error(_T('Not of your house.'));if((payer.wallet|0)<cost)throw onlErr82(_T`The repair costs ${cost} coin.`,'no_coin',{cost});payer.wallet-=cost}
  ONLC.repairItem(H,item);return {cost,item,holder:hc?hc:mockShelf83(D),domus:mockDRow82(D),...(payer&&payer!==hc?{payer}:{})}};
{const base=MOCK_ROUTES['gear.home'];MOCK_ROUTES['gear.home']=(w,d,me)=>{if(d&&d.on!==false&&!ONLC.isNamed(String(d.item||'')))throw onlErr82(_T('Only named pieces stay home — printed gear is never kept out of Ranked.'),'home_named');return base(w,d,me)}}
/* a home toggle refused: no toast storm, one line */
{const base=d89Home;d89Home=function(holder,it){if(!ONLC.isNamed(it))return onlToast80(_T('🔒 Only named pieces stay home.'));return base.apply(this,arguments)}}

/* ---------------- 5 · the auction: the owner history and the bid list fold out of the card (every card one size) ---------------- */
function onl91AucFold(h){if(!h||h.indexOf('au84-lot')<0)return h;const T=document.createElement('template');T.innerHTML=h;
  for(const lot of T.content.querySelectorAll('.au84-lot')){const card=lot.querySelector(':scope>.nw83');const hi=card&&card.querySelector('.hist83');
    if(hi){const n=hi.querySelectorAll('small').length;const d=document.createElement('details');d.className='hist91';d.innerHTML=`<summary>${_T`📜 Owners · ${n}`}</summary>`;d.appendChild(hi);card.after(d)}
    const bd=lot.querySelector(':scope>.au84-bids');if(bd&&!bd.querySelector('.bl91')){const box=document.createElement('div');box.className='bl91';for(const x of [...bd.children])if(x.tagName!=='SUMMARY')box.appendChild(x);bd.appendChild(box)}}
  return T.innerHTML}
{const base=onl84Auction;onl84Auction=function(){const h=base.apply(this,arguments);try{return onl91AucFold(h)}catch(e){console.error(e);return h}}}
/* one overlay open at a time; a click outside folds it */
document.addEventListener('toggle',e=>{const d=e.target;if(!d||!d.matches||!d.matches('#onl .hist91,#onl .au84-bids')||!d.open)return;for(const o of document.querySelectorAll('#onl .hist91[open],#onl .au84-bids[open]'))if(o!==d)o.open=false},true);
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#onl .hist91,#onl .au84-bids'))return;for(const o of document.querySelectorAll('#onl .hist91[open],#onl .au84-bids[open]'))o.open=false},true);

/* ---------------- 6 · the look ---------------- */
{const st=document.createElement('style');st.id='econ91css';st.textContent=`
#onl .dm91{display:block;color:#ffb27a;font-weight:600;font-size:11px;line-height:1.2}
#onl .pt89.dmg91{box-shadow:inset 0 0 0 1px rgba(255,160,90,.55)}
#onl .wr89.dmg91 .wr89-p b{color:#ffcf9e}#onl .rp91{all:unset;cursor:pointer;font-size:11px;padding:1px 4px;border-radius:5px;background:rgba(255,160,90,.18);color:#ffcf9e}
#onl .rp91:focus-visible{outline:2px solid #e8c96a}
/* the auction: every lot card the same size (history + bids fold into overlays: onl91AucFold) */
#onl .au84-grid{grid-template-columns:repeat(auto-fill,minmax(290px,1fr));align-items:start}
#onl .au84-lot{height:392px;box-sizing:border-box;display:flex;flex-direction:column;gap:6px;position:relative;overflow:visible}
#onl .au84-lot>*{flex:none;min-width:0}#onl .au84-lot>.vlt89{align-self:flex-start;margin:0}
#onl .au84-lot>.nw83{height:204px;max-height:204px;overflow:hidden;box-sizing:border-box}
#onl .au84-lot .au84-bid{margin-top:auto}
#onl .hist91,#onl .au84-bids{position:relative;font-size:12px}#onl .hist91>summary,#onl .au84-bids>summary{cursor:pointer;color:#d9c08a;list-style-position:inside}
#onl .hist91>.hist83,#onl .au84-bids>.bl91{position:absolute;left:0;right:0;bottom:calc(100% + 4px);z-index:30;max-height:210px;overflow:auto;margin:0;
  background:#1f1812;border:1px solid rgba(232,201,106,.45);border-radius:8px;padding:6px 8px;box-shadow:0 8px 24px rgba(0,0,0,.55)}
#onl .au84-bids>.bl91 small{display:block;color:var(--muted)}
@media (max-width:600px){#onl .au84-grid{grid-template-columns:1fr}}`;document.head.appendChild(st)}
