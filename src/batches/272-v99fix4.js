/* 272-v99fix4 — v0.99 fixes + rule changes from his notes of 2026-10-09 (answers 1a 2b 3 7 11 12 21 22 28; built by hand, no agents).
   Numbering = his list. Small edits elsewhere: 04-rules (eagle earns CF in a no-CF round, soul steal on a kill places itself, beast token
   rounds in the tame / lyre pickers), 07-ui (tamed beasts move AND attack, brighter tunnel exits), 106-v75 + 07-ui (Veteranus debt wording),
   133-v83onl (CF offerings earn in a no-CF round), 29-guide (eagle hint). Assets: assets/zora99.webp (his TTS Zora, front render).
   3a   🔨 repair prices wear the coin icon (Armory damaged card, checklist / desk row, City Square stalls)
   3    STARTER KITS ARE ISSUED (his rule): the class kit a fighter gets on signing is the house's loan, never a profit — its pieces carry
        P.iss = the fighter's id: worth nothing at the stalls (cannot be sold), and they vanish when he dies or leaves the house (wherever
        they are: on him, on the shelf, on another fighter). Bought, won and looted pieces still come home. Old saves: pieces a fighter
        wears that match his class kit are marked once (w.iss99).
   3b   damaged armor comes off the body after a bout and waits on the shelf (every house)
   3c   selling from the Armory too (not only the City Square): 💰 per piece and 💰 Sell all damaged on the damaged card, a "Spares on
        the shelf" fold with a sell button per piece; damaged pieces don't count against the 3-a-week cap
   4/27 Match Week: the bout buttons and the verdict card are compact (one line, the long note in the tooltip, prices kept)
   5    the bout card says when the Golden Eagle is among the Blessings (every Manager bout except chariot / naumachia / the eagle event)
   6    Psyche's soul steal on a KILLING blow places the HP itself (04-rules passes the flag; the CPU plan is used)
   7    a no-CF round blocks spending only: the Golden Eagle trade and the CF offerings still earn (04-rules / 133)
   10   Zora in the figure styles = his TTS model (assets/zora99.webp); the 3D-minis style already used his render
   11   (test only: tv99q checks the Armory gear reaches the board)
   12   tamed beasts: move and attack in either order (07-ui); the tame / lyre pickers show each beast's token round (04-rules)
   14   tunnel exits stand out (07-ui highlight); a pillar or any token on an exit already blocks it (tunnelExits)
   18   3D tokens (the Studio modeller's) are drawn 12% smaller so the base sits inside the tile (T99B.t93k)
   21   a NEW career opens on a welcome scroll (how a week works) that is dismissed by breaking the seal; no special-event invitations in
        the first season (weeks 1-12)
   22   Triumviratus is never the main event: when the fixture names it, it moves to the Undercard and the main event is a classic
   23   the Recruiting rail oval shows the Recruiter's hours left (the lanista's hours it read were removed in v0.87)
   24   Recruiting list: the Ask column wears the coin icon and "/wk"
   25   Mail: "Week N in review" can be dismissed (✕), until next week's review
   26   reopening a recruit (or the Recruiting tab) lands on his current step: scout → court → offer
   28   CITY CLASSES (his pick, my mapping): Roma Royalty · Capua Slave · Syracusae Hero · Leptis Magna Venatore · Thysdrus Amazonia ·
        Arles Veteranus · Verona Soldier — a fighter born there is of that class 40% of the time; Damnatio fighters come only from
        Vulso's cart and the auction block (half of those lots)
   BUG  My ludus banner: "fallen" now also shows the house's total (pm.fallen99, counted on every death: bouts, simulated bouts,
        verdicts, week-end deaths; old careers start from the grave list) */
const T99B={t93k:0.88,citySpec:0.4,damLot:0.5};
const CITY_CLS99={Roma:'royalty',Capua:'slave',Syracusae:'hero','Leptis Magna':'venatore',Thysdrus:'amazonia',Arles:'veteranus',Verona:'soldier'};
(()=>{try{if(typeof document==='undefined')return;const st=document.createElement('style');st.id='fix99c';st.textContent=`
#mgrBody .card2.bout .acts{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-start;align-items:center}
#mgrBody .card2.bout .acts .btn,#mgrBody #pendbox .acts .btn{flex:0 0 auto;width:auto;min-width:0;padding:6px 14px;font-size:13.5px;line-height:1.2;display:inline-flex;align-items:baseline;gap:6px;white-space:nowrap}
#mgrBody .card2.bout .acts .btn small,#mgrBody #pendbox .acts .btn small{display:inline;margin:0;font-size:11px;opacity:.8}
#mgrBody .card2.bout .acts select.tin{max-width:240px}
#mgrBody .mbtns .btn.simall{width:auto;flex:0 0 auto;padding:8px 18px}
#mgrBody .mbtns .btn.simall small{display:none}
#mgrBody #pendbox .lrow{padding:6px 8px}#mgrBody #pendbox .lrow .t>p.rc-sub{font-size:12px;margin:2px 0 4px!important}
#mgrBody #pendbox .acts{margin-top:4px!important}
.eg99{align-self:flex-start;width:max-content;display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:1px 7px;border-radius:9px;border:1px solid #c9a24a;color:#f0d690;background:rgba(201,162,74,.12);margin-left:6px;vertical-align:middle}
.tok99{display:inline-block;vertical-align:middle;margin-right:6px}
.mtabs [data-id="recruit"] .mcount.c73{display:none!important}
.mtabs .mcount.hr99{background:#7fae5f;color:#10200a;border-color:#a9d48a}
.rev99x{float:right;margin:-2px 0 0 8px;padding:0 7px;font-size:13px;line-height:20px;border-radius:50%}
.lst91 .fl99{opacity:.8;font-size:.9em}
#ar96dmg .ar96it{flex-wrap:wrap}#ar96dmg .ar96n{flex:1 1 150px;min-width:0}
.sell99{margin-top:8px}.sell99 .ar96it{display:flex;gap:8px;align-items:center;padding:3px 0}.sell99 .ar96n{flex:1;min-width:0}
.iss99{font-size:10px;padding:0 5px;border-radius:7px;border:1px solid #8a7a5a;color:#cbb88f;margin-left:4px}
.welc99bg .verask{max-width:min(620px,94vw);background:linear-gradient(#efe0bd,#d8c39a);color:#2a1d10;border:2px solid #8a6a2a;box-shadow:0 10px 40px rgba(0,0,0,.6)}
.welc99bg .verask b.t99{font:600 22px var(--serif,serif);color:#5a1d10;display:block;text-align:center;margin-bottom:4px}
.welc99bg .verask ol{margin:8px 0 8px 18px;padding:0}.welc99bg .verask li{margin:5px 0}.welc99bg .verask .rc-sub{color:#5a4630}
.welc99bg .seal99{display:block;margin:12px auto 0;width:84px;height:84px;border-radius:50%;border:none;cursor:pointer;color:#f6e3c0;font:600 12px var(--serif,serif);
  background:radial-gradient(circle at 38% 34%,#d2453a,#9a1d16 60%,#5e0d09);box-shadow:0 3px 10px rgba(0,0,0,.5),inset 0 -4px 8px rgba(0,0,0,.35)}
.welc99bg .qs99{margin:8px 0 0;padding:6px 10px;border:1px solid #a8884a;border-radius:6px;background:rgba(255,255,255,.25);font-size:13px}.welc99bg .qs99 .sect{color:#5a1d10;margin:0 0 4px}.welc99bg .qs99 .rc-sub{color:#5a4630}.welc99bg .qs99 td{color:#2a1d10!important;padding:1px 6px}
.welc99bg .seal99:hover{filter:brightness(1.1)}.welc99bg .seal99 span{display:block;font-size:26px;line-height:1.1}
`;document.head.appendChild(st)}catch(e){console.error(e)}})();

/* ---------- 10 · Zora in the figure styles: his TTS model ---------- */
try{if(typeof STANDEE_SRC!=='undefined'){STANDEE_SRC.zoraMini='assets/zora99.webp';if(typeof STANDEE_IMG!=='undefined')delete STANDEE_IMG.zoraMini}}catch(e){console.error(e)}

/* ---------- 18 · the Studio 3D tokens a little smaller on the board ---------- */
{const base=drawFigureTok;drawFigureTok=function(sp,x,y,h,opt){if(sp&&sp.t93&&h)h*=T99B.t93k;return base.call(this,sp,x,y,h,opt)}}

/* ---------- 6 · soul steal on a killing blow places itself ---------- */
{const base=distributeHP;distributeHP=async function(player,n,why,auto){if(auto&&player&&!player.cpu){player.cpu=true;try{return await base.call(this,player,n,why)}finally{player.cpu=false}}return base.apply(this,arguments)}}

/* ---------- 3a/24 · coin icons (string helpers) ---------- */
function coin99(n){return typeof coinAmt87==='function'?coinAmt87(n):String(n)}
function fixCoins99(root){
  for(const b of root.querySelectorAll('[data-ar96fix],[data-arm94fix]')){const t=b.querySelector('em')||b;if(t.querySelector('.amt87'))continue;const m=/🔨\s*(\d+)/.exec(t.textContent);if(m)t.innerHTML=`🔨 ${coin99(+m[1])}`}
  for(const b of root.querySelectorAll('[data-arm94fixall]')){if(b.querySelector('.amt87'))continue;const m=/(\d+)\D*$/.exec(b.textContent);if(m)b.innerHTML=`🔨 ${_T('Repair all')} · ${coin99(+m[1])}`}}
{const base=arm94ShopHTML;arm94ShopHTML=function(){const h=base.apply(this,arguments);try{if(typeof h!=='string'||!/data-arm94fix/.test(h))return h;const t=document.createElement('template');t.innerHTML=h;fixCoins99(t.content);return t.innerHTML}catch(e){console.error(e)}return h}}

/* ---------- 3 · issued starter kits ---------- */
function iss99Mark(g){const E=g&&g.eq94;if(!E)return;for(const P of [E.R,E.L,...(E.a||[])])if(P&&!P.iss)P.iss=g.id}
{const base=arm94EnsureG;arm94EnsureG=function(w,g){const had=!!(g&&g.k94);const r=base.apply(this,arguments);try{if(g&&!had&&g.k94)iss99Mark(g)}catch(e){console.error(e)}return r}}
/* every piece issued to fighter gid, wherever it is in house m */
function iss99Purge(w,gid){let n=0;try{for(const m of w.mgrs||[]){const H=arm94H(m);const keep=H.sh.filter(P=>!(P&&P.iss===gid));n+=H.sh.length-keep.length;H.sh=keep}
    for(const g of w.glads||[]){const E=g.eq94;if(!E)continue;for(const h of ['R','L'])if(E[h]&&E[h].iss===gid){E[h]=null;n++}
      if(E.a){const k=E.a.filter(P=>!(P&&P.iss===gid));n+=E.a.length-k.length;E.a=k}}}catch(e){console.error(e)}return n}
{const base=arm94Strip;arm94Strip=function(w,g){const r=base.apply(this,arguments);try{if(w&&g)iss99Purge(w,g.id)}catch(e){console.error(e)}return r}}
{const base=arm94Ensure;arm94Ensure=function(w){const r=base.apply(this,arguments);try{if(w&&!w.iss99){w.iss99=1;for(const g of w.glads||[]){const E=g.eq94;if(!E||!g.k94||!g.alive)continue;const K=arm94Kit(g.cls);
      if(E.R&&K.R===E.R.k&&!E.R.iss)E.R.iss=g.id;if(E.L&&K.L===E.L.k&&!E.L.iss)E.L.iss=g.id;const want=(K.a||[]).map(x=>x.k);for(const P of E.a||[]){const i=want.indexOf(P.k);if(i>=0&&!P.iss){P.iss=g.id;want.splice(i,1)}}}
      return (typeof r==='number'?r:0)+1}}catch(e){console.error(e)}return r}}
{const base=arm94Sell;arm94Sell=function(pid){try{const pm=me();const P=pm&&arm94H(pm).sh.find(x=>x.id===pid);if(P&&P.iss)return {no:sx(gById(P.iss),_T('Issued kit: the house lent it to him — it cannot be sold.'),_T('Issued kit: the house lent it to her — it cannot be sold.'))}}catch(e){}return base.apply(this,arguments)}}
{const base=arm94Meta;arm94Meta=function(P){const s=base.apply(this,arguments);return P&&P.iss?s+' · '+_T('issued'):s}}

/* ---------- 3b · damaged armor comes off the body after a bout ---------- */
function dmg99Shelve(w,ids){let n=0;for(const gid of ids||[]){const g=gById(gid);const E=g&&g.eq94;if(!E||!E.a)continue;const bad=E.a.filter(P=>P&&P.dmg);if(!bad.length)continue;
    const m=arm94M(w,E.h);if(!m||m.dead)continue;E.a=E.a.filter(P=>!(P&&P.dmg));arm94H(m).sh.push(...bad);n+=bad.length}return n}

/* ---------- BUG · the fallen: one running total per house ---------- */
function fall99Seed(w,pm){if(!w||!pm||pm.fallen99!=null)return;pm.fallen99=(w.grave||[]).filter(x=>x&&x.mgr===pm.name).length}
function fall99Snap(){try{const w=W_(),pm=me();if(!w||!pm||w.tutorial)return null;fall99Seed(w,pm);return {pm,list:rosterOf(pm).filter(g=>g&&g.alive)}}catch(e){return null}}
function fall99Count(s){try{if(!s)return;const n=s.list.filter(g=>g.alive===false).length;if(n)s.pm.fallen99=(s.pm.fallen99||0)+n}catch(e){console.error(e)}}
{const base=applyBout;applyBout=function(bi,res){const s=fall99Snap();const w=W_();const b=w&&w.night&&w.night.bouts&&w.night.bouts[bi];const r=base.apply(this,arguments);
  fall99Count(s);try{if(b&&b.done&&W_()===w)dmg99Shelve(w,b.ents)}catch(e){console.error(e)}return r}}
{const base=settlePending;settlePending=function(){const s=fall99Snap();const r=base.apply(this,arguments);fall99Count(s);return r}}
{const base=endWeek;endWeek=async function(){const s=fall99Snap();const r=await base.apply(this,arguments);fall99Count(s);return r}}

/* ---------- 3c · selling from the Armory ---------- */
function sell99Price(P){return Math.max(1,Math.floor(arm94Price(P.t,P.k)*(P.dmg?ARM94.sellK/2:ARM94.sellK)))}
function sell99(pid){const pm=me(),w=W_();if(!pm||!w)return {no:'?'};const H=arm94H(pm);const P=H.sh.find(x=>x.id===pid);if(!P)return {no:_T('Only pieces on the shelf can be sold.')};
  if(P.iss)return {no:sx(gById(P.iss),_T('Issued kit: the house lent it to him — it cannot be sold.'),_T('Issued kit: the house lent it to her — it cannot be sold.'))};
  if(!P.dmg&&arm94SellLeft(pm,w)<=0)return {no:_T`The stalls buy ${ARM94.sellMax} pieces a week from one house — come back next week.`};
  const pr=sell99Price(P);H.sh.splice(H.sh.indexOf(P),1);pm.coin+=pr;if(!P.dmg){const sk=(w.season||0)+':'+(w.week||0);pm.sell94=pm.sell94&&pm.sell94.k===sk?pm.sell94:{k:sk,n:0};pm.sell94.n++}
  try{arm94Fl(w,pm,'sell',pr)}catch(e){}return {ok:1,pr}}
function sell99HTML(){const pm=me(),w=W_();if(!pm||!w)return '';const sh=arm94H(pm).sh.filter(P=>P&&!P.iss&&!P.dmg);const left=arm94SellLeft(pm,w);
  if(!sh.length)return '';
  return `<details class="card2 sell99"><summary><b>${_T`💰 Spares on the shelf`}</b> <span class="rc-sub">${_T`${sh.length} · the stalls buy ${left} more this week (30% of the price)`}</span></summary>
    ${sh.map(P=>{const pr=sell99Price(P);return `<div class="ar96it"><span class="ar94art">${arm94Art(P,30)}</span><span class="ar96n"><b>${esc(arm94Name(P))}</b><small>${arm94Meta(P)}</small></span><button type="button" class="btn tksm" data-sell99="${P.id}" ${left<=0?'disabled':''}>💰 ${coin99('+'+pr)}</button></div>`}).join('')}</details>`}
{const base=dmg96HTML;dmg96HTML=function(){let h=base.apply(this,arguments);try{const pm=me();if(!pm)return h;const t=document.createElement('template');t.innerHTML=h||'';const root=t.content;fixCoins99(root);
    const dmg=arm94All(pm).filter(x=>x.P.dmg);
    for(const it of root.querySelectorAll('.ar96it')){const fx=it.querySelector('[data-ar96fix]');if(!fx)continue;const x=dmg.find(z=>z.P.id===fx.dataset.ar96fix);if(!x||x.P.iss||x.g)continue;
      const b=document.createElement('button');b.type='button';b.className='btn tksm';b.dataset.sell99=x.P.id;b.title=_T('Sell it as scrap (15%) — damaged pieces do not count against the weekly limit');b.innerHTML='💰 '+coin99('+'+sell99Price(x.P));fx.after(b)}
    const shelfDmg=dmg.filter(x=>!x.g&&!x.P.iss);const acts=root.querySelector('.acts');
    if(acts&&shelfDmg.length){const tot=shelfDmg.reduce((a,x)=>a+sell99Price(x.P),0);const b=document.createElement('button');b.type='button';b.className='btn tksm';b.dataset.sell99='alldmg';b.innerHTML=`💰 ${_T('Sell all damaged')} · ${coin99('+'+tot)}`;acts.appendChild(b)}
    return t.innerHTML+sell99HTML()}catch(e){console.error(e)}return h}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-sell99]');if(!b||b.disabled)return;e.preventDefault();e.stopPropagation();
  const pm=me();if(!pm)return;let got=0,n=0,no=null;const ids=b.dataset.sell99==='alldmg'?arm94H(pm).sh.filter(P=>P&&P.dmg&&!P.iss).map(P=>P.id):[b.dataset.sell99];
  for(const id of ids){const r=sell99(id);if(r.ok){got+=r.pr;n++}else no=r.no}
  if(n){saveWorld();mToast(n===1?_T`Sold for ${coin99('+'+got)}.`:_T`${n} pieces sold for ${coin99('+'+got)}.`)}else if(no)mToast(no);
  if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);

/* ---------- 23 · the Recruiting oval = the Recruiter's hours left ---------- */
function rec99Left(w){try{return Math.max(0,rec98HrsMax(w)-rec98Used(w))}catch(e){return 0}}
{const base=tabStat73;tabStat73=function(k){if(k==='recruit'){try{const w=W_();if(!w||w.dead)return null;const mx=rec98HrsMax(w),h=rec99Left(w);return [h+' h',_T`of ${mx} · the Recruiter's hours`,typeof hoursPips73==='function'?hoursPips73(h,mx,'#7fae5f'):'']}catch(e){}}return base.apply(this,arguments)}}
{const base=tabDone73;tabDone73=function(k){if(k==='recruit'){try{return !(rec99Left(W_())>0)}catch(e){}}return base.apply(this,arguments)}}
function hr99Sync(){try{if(typeof W_!=='function')return;const w=W_();const b=document.querySelector('.mtabs [data-mg="tab"][data-id="recruit"]');if(!b)return;let c=b.querySelector('.mcount.hr99');
  const h=w&&!w.dead&&!w.tutorial?rec99Left(w):0;if(!h){if(c)c.remove();return}
  if(!c){c=document.createElement('span');c.className='mcount hr99';b.appendChild(c)}const t=h+' h';if(c.textContent!==t)c.textContent=t;c.title=_T`${h} of the Recruiter's hours left this week`}catch(e){}}
try{if(typeof PERF92_SWEEPS!=='undefined')PERF92_SWEEPS.push(['hr99','hr99Sync()'])}catch(e){}
setInterval(()=>{hr99Sync()},600);

/* ---------- 26 · back to a recruit = his current step ---------- */
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-mg="sel"],[data-mg="tab"][data-id="recruit"]');if(t&&typeof MGR!=='undefined')MGR.recStep=null},true);

/* ---------- 25 · Week in review can be dismissed ---------- */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-rev99]');if(!b)return;e.preventDefault();e.stopPropagation();const w=W_();if(!w||!w.review)return;
  w.rev99={s:w.review.season,wk:w.review.wk};saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);

/* ---------- the final Manager pass: Match Week compact + eagle chips, coins, Ask column, review ✕, fallen total ---------- */
{const base=mgrHTML;mgrHTML=function(){let h=base.apply(this,arguments);try{const w=W_();if(typeof h!=='string'||!w||w.dead)return h;const tab=MGR.tab;
  if(!['night','armory','ludus','recruit','roster'].includes(tab)&&!/data-arm94fix/.test(h))return h;
  const t=document.createElement('template');t.innerHTML=h;const R=t.content;
  fixCoins99(R);
  if(tab==='night'){/* 4/27: one-line buttons, the long note goes to the tooltip; a note with a price stays */
    for(const b of R.querySelectorAll('.card2.bout .acts .btn, #pendbox .acts .btn, .mbtns .btn.simall')){const s=b.querySelector('small');if(!s)continue;const tx=s.textContent.trim();if(!b.title)b.title=tx;
      if(!(s.querySelector('.amt87')||/\d/.test(tx)))s.remove()}
    /* 5: the Golden Eagle among the Blessings */
    const n=w.night;const cards=[...R.querySelectorAll('.card2.bout')];
    if(n&&n.bouts)cards.forEach((c,i)=>{const b=n.bouts[i];if(!b)return;const ev=EVENTS[b.ev]||{};if(ev.kind==='eagle'||b.ev==='chariot'||b.ev==='naumachia')return;
      const tt=c.querySelector('.bouttitle');if(tt&&!tt.querySelector('.eg99'))tt.insertAdjacentHTML('beforeend',`<span class="eg99" title="${_T('The Golden Eagle is one of the 12 Blessings on the pillars: trade it to the crowd for 5 CF')}">🦅 ${_T('Golden Eagle in play')}</span>`)})}
  if(tab==='recruit'){for(const td of R.querySelectorAll('tr.r85 > td.n:last-child')){const v=td.textContent.trim();if(/^\d+$/.test(v))td.innerHTML=`${coin99(+v)}<small>${_T('/wk')}</small>`}}
  if(tab==='ludus'){const rev=R.querySelector('.rev91');const Rv=w.review;if(rev&&!Rv&&w.welc99)rev.remove(); /* 21: the scroll replaced the old welcome letter */
    if(rev&&Rv){if(w.rev99&&w.rev99.s===Rv.season&&w.rev99.wk===Rv.wk)rev.remove();else{const sm=rev.querySelector('summary');if(sm&&!sm.querySelector('[data-rev99]'))sm.insertAdjacentHTML('beforeend',`<button type="button" class="btn tksm rev99x" data-rev99="1" title="${_T('Dismiss until next week')}">✕</button>`)}}
    const pm=me();const fl=R.querySelectorAll('.lst91 > span');if(pm&&fl.length>=4){fall99Seed(w,pm);const sp=fl[3];if(!sp.querySelector('.fl99'))sp.insertAdjacentHTML('beforeend',` <span class="fl99">· ${_T`${pm.fallen99||0} in all`}</span>`)}}
  return t.innerHTML}catch(e){console.error(e)}return h}}

/* ---------- 21 · a new career opens on the welcome scroll; no invitations in the first season ---------- */
/* headless test browsers skip the scroll unless localStorage flavius_welc99on=1 (like the token auto-convert's flavius_tok93auto) */
function welc99Head(){try{return /HeadlessChrome/.test(navigator.userAgent)&&localStorage.getItem('flavius_welc99on')!=='1'}catch(e){return false}}
function welc99Due(w){return !!(w&&!w.dead&&!w.tutorial&&!w.welc99&&!w.review&&(w.week||1)<=1&&!welc99Head())}
/* the founding ledger rides on the scroll; breaking the seal seals it too */
function welc99Ledger(w){try{if(!w.qsLast||w.qsLast.seen||typeof qsCardHTML!=='function')return '';const t=document.createElement('template');t.innerHTML=qsCardHTML();const a=t.content.querySelector('.acts');if(a)a.remove();const c=t.content.querySelector('.qscard');if(c){c.classList.remove('card2');c.classList.add('qs99')}return t.innerHTML}catch(e){return ''}}
function welc99Show(){const w=W_(),m=me();if(!welc99Due(w)||!m||document.querySelector('.welc99bg'))return;
  const bg=document.createElement('div');bg.className='veraskbg welc99bg';
  bg.innerHTML=`<div class="card2 verask" role="dialog" aria-modal="true"><b class="t99">${_T`Welcome to ${esc(m.ludus)}`}</b>
    <p class="rc-sub" style="text-align:center;margin:0 0 6px">${_T`A letter from your council, sealed with the house's wax`}</p>
    <p style="margin:6px 0">${_T`Lanista, the ludus is yours. Every week runs the same way:`}</p>
    <ol><li>${_T`<b>Your ludus</b> — read the desk: letters that need an answer and the week's tasks.`}</li>
    <li>${_T`<b>Prepare</b> — sign fighters in <b>Recruiting</b> (the Recruiter's hours), set drills in the <b>Training Yard</b>, heal in the <b>Infirmary</b>, dress them from the <b>Armory</b>.`}</li>
    <li>${_T`<b>Match Week</b> — three bouts in the host city (Friday, Saturday, Sunday). Enter your fighters, then fight, watch or simulate.`}</li>
    <li>${_T`<b>Decide</b> — thumbs, blood money and the rudis wait for your verdict.`}</li>
    <li>${_T`<b>End the week</b> — wages, training, healing and the Acta Diurna.`}</li></ol>
    <p class="rc-sub" style="margin:4px 0">${_T`The top four houses after 12 weeks meet in the Flavius Superbus. Three week-ends in the red close the ludus.`}</p>${welc99Ledger(w)}
    <button type="button" class="seal99" data-welc99="1" title="${_T('Break the seal and begin')}"><span>🏛</span>${_T('Break the seal')}</button></div>`;
  document.body.appendChild(bg);const done=()=>{bg.remove();document.removeEventListener('keydown',key,true);try{const w2=W_();if(w2){w2.welc99=1;if(w2.qsLast&&!w2.qsLast.seen)w2.qsLast.seen=true;saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()}}catch(e){}};
  const key=e=>{if(e.key==='Escape'){e.stopPropagation();e.preventDefault()}};document.addEventListener('keydown',key,true);
  bg.addEventListener('click',e=>{e.stopPropagation();if(e.target.closest('[data-welc99]'))done()});setTimeout(()=>{const s=bg.querySelector('.seal99');if(s)s.focus()},30)}
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{if(MGR.tab==='ludus'&&!MGR.view&&welc99Due(W_())&&typeof document!=='undefined'&&!(typeof HEADLESS!=='undefined'&&HEADLESS))setTimeout(welc99Show,250)}catch(e){}return h}}
{const base=specWeekStart;specWeekStart=function(world){let blk=null;try{if(world&&!world.tutorial&&(world.week||0)<=12){world.invites=world.invites||[];blk=[0,1].map(i=>({id:'blk99'+i,status:'accepted',wk:-999,n:'',ents:[],sid:''}));world.invites.push(...blk)}}catch(e){}
  try{return base.apply(this,arguments)}finally{if(blk&&world.invites)world.invites=world.invites.filter(iv=>!blk.includes(iv))}}}

/* ---------- 22 · Triumviratus is an Undercard event ---------- */
{const base=makeNight;makeNight=function(){const r=base.apply(this,arguments);try{const w=W_(),n=w&&w.night;if(!n||!n.bouts)return r;const main=n.bouts.find(b=>b.tier==='main'),under=n.bouts.find(b=>b.tier==='under');
    if(main&&under&&main.ev==='triumviratus'&&!main.done&&!under.done){main.ev=TIERS.main.ev;main.special=false;under.ev='triumviratus';under.special=true;
      const need=typeof boutSize==='function'?boutSize(under):3;while(under.ents.length>need){const out=under.ents.map(gById).filter(g=>g&&!(g.contract&&mgrById(g.contract.mgr)&&mgrById(g.contract.mgr).isPlayer)).pop();if(!out)break;under.ents.splice(under.ents.indexOf(out.id),1)}
      if(typeof fillNight==='function')fillNight()}}catch(e){console.error(e)}return r}}

/* ---------- 28 · city classes; Damnatio only from Vulso's cart and the auction block ---------- */
const GEN99B={dam:0};
{const base=genGlad;genGlad=function(opts={}){opts=opts||{};if(opts.cls)return base.call(this,opts);const o={...opts};
  try{if(GEN99B.dam&&Math.random()<GEN99B.dam){o.cls='damnatio';return base.call(this,o)}
    if(!o.city)o.city=pickOne(HOME_CITIES());const sp=CITY_CLS99[o.city];if(sp&&Math.random()<T99B.citySpec)o.cls=sp}catch(e){}
  let g=base.call(this,o);
  if(!GEN99B.dam){for(let i=0;i<8&&g&&g.cls==='damnatio';i++)g=base.call(this,o);if(g&&g.cls==='damnatio'){g.cls='slave'}}
  return g}}
{const base=emptyBarracksWeek;emptyBarracksWeek=function(){const p=GEN99B.dam;GEN99B.dam=T99B.damLot;try{return base.apply(this,arguments)}finally{GEN99B.dam=p}}}
{const base=cityAuctionLot;cityAuctionLot=function(){const p=GEN99B.dam;GEN99B.dam=T99B.damLot;try{return base.apply(this,arguments)}finally{GEN99B.dam=p}}}
