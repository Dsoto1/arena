/* =====================================================================
   182-V89VAULT · v0.89 part N (Virgilante 2026-10-05): FLAVIUS'S VAULT — the weekly auction is never empty.
   The shared rules are in 111-onlcore ("v0.89 N": VAULT_RAR89, VAULT_HOUSES89, vaultLot89, vaultReserved89 — domusWhy / lnameWhy refuse
   the five old houses and their lanistas); the server fill is the "v0.89 N" block of server/src/routes.js. This module:
   • THE MOCK — mockAucDraw84 wrapped: a week the chest leaves short is filled from the vault (same seeded lots as the server; armor uniques
     kept in w.uniqA89, weapon uniques in w.uniq83), once a week (A.vault89).
   • SCREENS — vault lots wear "🏛 From Flavius’s vault"; their owner history reads "Worn by Marcus Crixus of House Sotonius (Sotonius) · fell at
     Capua, Ranked, week 3" (onl83Hist wrapped; other history lines as before); the ⓘ odds card says in one line that short weeks are filled
     from the vault, with the vault's tier split.
   Test: tools/tests/tonl89n.js · server: server/test/v89n.test.js
   ===================================================================== */

/* ---------------- THE MOCK (as server/src/routes.js v0.89 N) ---------------- */
{const base=mockAucDraw84;mockAucDraw84=function(w,t){const r=base.apply(this,arguments);try{const S=ONLC.seasonAt(t);const A=(w.auc84||{})[S.key];
    if(A&&!A.vault89&&(A.lots||[]).length<ONLC.AUC_LOTS){A.vault89=1;const cat=onlCatalog();const ends=ONLC.aucEnds(t);w.uniq83=w.uniq83||[];w.uniqA89=w.uniqA89||[];
      /* v0.91 the week's guarantees (as the server's vaultFill89: ONLC.aucPlan91) */
      const plan=ONLC.aucPlan91?ONLC.aucPlan91(A.lots.map(x=>({kind:ONLC.lotKind91(x.item),rar:ONLC.lotRar91(x.pc)})),ONLC.AUC_LOTS-A.lots.length,w.uniq83,w.uniqA89):[];let made=0;
      let n=A.lots.reduce((a,x)=>Math.max(a,x.n|0),0);while(A.lots.length<ONLC.AUC_LOTS){n++;const po=plan[made++]||{};let P=ONLC.vaultLot89(S.key,n,cat,w.uniq83,w.uniqA89,{at:S.start,...po});
        if(P&&P.pc.w.uq){const U=P.kind==='a'?w.uniqA89:w.uniq83;if(U.includes(P.pc.w.uq))P=ONLC.vaultLot89(S.key,n,cat,w.uniq83,w.uniqA89,{at:S.start,...po,cap:'epic'});else U.push(P.pc.w.uq)}
        const I=P&&ONLC.pieceInfo(P,cat);if(!I)break;const val=ONLC.valueOf(I);
        A.lots.push({id:S.key+'#'+n,key:S.key,n,item:P.item,pc:P.pc,val,min:ONLC.aucMin(val),opens:t,ends,bid:null,bids:[],done:false,won:null,from:{vault89:1},vault89:1})}}}catch(e){console.error(e)}return r}}

/* an unsold vault lot goes back to the vault (never the chest pool); its unique is free again */
{const base=mockAucSettle84;mockAucSettle84=function(w,X,t){const was=X.done;const r=base.apply(this,arguments);try{if(!was&&X.done&&X.vault89&&!X.bid){
    w.chest83=(w.chest83||[]).filter(x=>x.item!==X.item);const uq=X.pc&&X.pc.w&&X.pc.w.uq;if(uq){const k=ONLC.isNamedA(X.item)?'uniqA89':'uniq83';w[k]=(w[k]||[]).filter(u=>u!==uq)}}}catch(e){console.error(e)}return r}}

/* ---------------- SCREENS ---------------- */
const vault89Of=L=>!!L&&(L.vault89||(L.hist||[]).some(h=>h&&h.vault89));
/* one history line of a vault piece (the old houses: house name + its lanista) */
function vault89HistLine(x){const house=`${esc2(onlHouse82(x.house||''))}${x.lan?` <i class="vlt89l">(${esc2(x.lan)})</i>`:''}`;
  const where=`${esc2(onlCityName(x.loc|0))}, ${x.ranked?_T('Ranked'):_T('Custom')}, ${_T`week ${x.wk|0}`}`;
  return x.how==='taken'?_T`⚔ Worn by <b>${esc2(x.glad||'?')}</b> of ${house} · slain at ${where} — taken by his killer`
    :_T`🪦 Worn by <b>${esc2(x.glad||'?')}</b> of ${house} · fell at ${where}`}
{const base=onl83Hist;onl83Hist=function(h){if(!(h||[]).some(x=>x&&x.vault89))return base.apply(this,arguments);
  return `<div class="hist83 vlt89h">${h.slice(-4).map(x=>x&&x.vault89?`<small>${vault89HistLine(x)}</small>`
    :`<small>${x.how==='auction'?_T('🔨 won at Flavius’s auction by'):x.how==='taken'?_T('⚔ taken from'):_T('🪦 fell with')} <b>${esc2(x.glad||'?')}</b>${x.house?` · ${esc2(onlHouse82(x.house))}`:''} · ${esc2(date83(x.when))}</small>`).join('')}</div>`}}
/* the lot card: "From Flavius's vault" */
{const base=onl84Auction;onl84Auction=function(){let h=base.apply(this,arguments);try{const X=ONL84.auc;if(!X)return h;
    for(const L of [...(X.lots||[]),...(X.past||[])]){if(!vault89Of(L))continue;const a=`data-au84="${esc2(L.id)}">`;const i=h.indexOf(a);
      if(i>=0){h=h.slice(0,i+a.length)+`<div class="vlt89" title="${_T`An old piece from the vault, with every owner it had`}">${_T`🏛 From Flavius’s vault`}</div>`+h.slice(i+a.length);
        if(L.done&&!L.won){const u=_T('Unsold — back to Flavius’s chest');const j=h.indexOf(u,i);if(j>=0)h=h.slice(0,j)+_T('Unsold — back to Flavius’s vault')+h.slice(j+u.length)}}}}catch(e){console.error(e)}return h}}
/* the ⓘ odds card: one line on the vault */
{const base=odds89HTML;odds89HTML=function(){const h=base.apply(this,arguments);try{const RN={rare:_T('Rare'),epic:_T('Epic'),legendary:_T('Legendary')};const t=ONLC.VAULT_RAR89.reduce((a,x)=>a+x[1],0);
    const split=ONLC.VAULT_RAR89.map(([k,v])=>`${RN[k]||k} ${Math.round(v/t*100)}%`).join(' · ');
    const line=`<p class="rc-sub" data-o89="vault">${_T`🏛 A week with too few fallen pieces is filled from Flavius’s vault: ${split}.`}</p>`;
    const j=h.lastIndexOf('</div>');return j>=0?h.slice(0,j)+line+h.slice(j):h+line}catch(e){return h}}}
{const st=document.createElement('style');st.textContent=`
.vlt89{display:inline-block;margin:0 0 6px;padding:2px 8px;border-radius:999px;background:#2a1f12;color:#e8c96a;border:1px solid #8a6d3b;font:600 12px/1.4 system-ui,sans-serif}
.vlt89h small{display:block}.vlt89l{opacity:.8;font-style:normal}`;document.head.appendChild(st)}
