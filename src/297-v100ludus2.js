/* =====================================================================
   297-V100LUDUS2 · v1.0 — MY LUDUS, round 2 (his answers 2026-10-11 on 294-v100ludus; shots tools/plans/ludus100/r2_*)
   =====================================================================
   1a  Advisor effects (ADV100) stay as built.
   1   THE BUILDINGS BELONG TO THE ADVISORS: each facility (23-ludus FAC) is run by one advisor and is built from HIS popover
       (#lu100pop) — the same rows and the SAME button (data-mg="build" data-id=<facility> → 23's ludusClick: FAC_COST, levels I–III,
       one project a week, the say/tnews lines). Mapping LU2_FAC (TWEAK): Doctore → Training yard, Practice stands · Medicus →
       Valetudinarium, Kitchen · Barracks master → Barracks, Shrine · Clerk → Stables, Armory (the fitted armor = the house's
       stores) · Recruiter → the Ludus grade recruits read · Consilium → the OVERVIEW: grade badge, every building by advisor (click
       = that advisor's popover), the next build you can pay for and who holds it. A facility no advisor holds lands with the Consilium.
       A head wears a small 🏗 marker when one of his buildings is affordable this week (builders free, coin enough).
       The Upgrade School tile stays (art + pips) but opens the Consilium's overview (data-lu100adv="consilium"); the 'fac' lesson step
       (36-mtutor) lights the head that holds the Stables instead of the old Facilities tile.
   2b  The header ledger badge (88 weekMoney) counts the Clerk's rebate (294's endWeek: ADV100.clerkPct × (level − 1) % of the
       contract wages): net/wk includes it and the badge says "wages N (−R Clerk)".
   3a  The Roster and Armory banners (95 banner73 → roomScene73) show 294a's painted scenes (scene100 'team' / 'armory', banner
       crop) instead of 95's roster scene and 243's armoryScene96; titles, subtitles and chips unchanged.
   4b  "🏛 The Consilium's counsel" lives in the Consilium's popover (his head lights each week until the counsel is read this week,
       w.lu2c = the absolute week it was read; a money warning names itself) and "📜 Ledger" in the Clerk's popover AND on the header
       ledger badge (click / Enter → Your ludus, the Ledger panel under the tiles). The links row keeps only 🎓 Schooling (lesson).
   Kill switch localStorage flavius_ludus2100off=1 → 294's page as it was. Test tv100l2 (tv100l runs with the switch on).
   ===================================================================== */
const LU2={};
function lu2On(){try{return localStorage.getItem('flavius_ludus2100off')!=='1'&&typeof lu100On==='function'&&lu100On()}catch(e){return true}}
/* TWEAK: who runs which building */
const LU2_FAC={doctore:['yard','stands'],medicus:['valet','kitchen'],barracks:['barracks','shrine'],clerk:['stables','armory']};
function lu2Owner(fk){for(const [k,L] of Object.entries(LU2_FAC))if(L.includes(fk))return k;return 'consilium'}
function lu2Keys(k){return Object.keys(FAC).filter(fk=>lu2Owner(fk)===k)}
function lu2Busy(w,pm){return pm.facWk===w.week}
function lu2Can(w,pm,fk){const l=facLvl(pm,fk);return l<3&&!lu2Busy(w,pm)&&(pm.coin||0)>=FAC_COST[l]}
/* the next build the purse can pay for (lowest level first, then the cheapest) */
function lu2Next(w,pm){const ks=Object.keys(FAC).filter(fk=>facLvl(pm,fk)<3).sort((a,b)=>facLvl(pm,a)-facLvl(pm,b));return ks.find(fk=>(pm.coin||0)>=FAC_COST[facLvl(pm,fk)])||null}
const LU2_RN=['I','II','III'];
/* the Clerk's rebate this week (same sum as 294's endWeek) */
function lu2Rebate(w,pm){try{if(!w||!pm||w.tutorial||w.dead)return 0;const wages=rosterOf(pm).reduce((a,g)=>a+((g.contract&&g.contract.wage)||0),0);return Math.round(wages*ADV100.clerkPct*(adv98Lv(w,'clerk')-1)/100)}catch(e){return 0}}
/* the counsel: a weekly report until read; a money warning names itself */
function lu2Counsel(w){try{const pm=me();if(!w||!pm||w.tutorial)return null;if(w.lu2c===w.week)return null;
  const wages=rosterOf(pm).reduce((a,g)=>a+((g.contract&&g.contract.wage)||0),0);const run=wages>0?Math.floor(Math.max(0,pm.coin)/wages):99;
  return pm.coin<0?_T('Counsel: the treasury is in debt'):run<3?_T('Counsel: coin for less than 3 weeks of wages'):_T("This week's counsel")}catch(e){return null}}

/* ---------- the buildings in a popover ---------- */
function lu2Row(w,pm,fk){const F=FAC[fk];const l=facLvl(pm,fk);const cost=FAC_COST[l];
  return `<div class="lu2r${lu2Can(w,pm,fk)?' can':''}"><span class="i">${F.i}</span><span class="t"><b>${esc(F.n)}</b> <span class="facpips">${[0,1,2].map(i=>`<i class="${i<l?'on':''}"></i>`).join('')}</span><small>${l?F.fx(l):F.d}</small>${l<3?`<small class="nx">${_T`Next: ${F.fx(l+1)}`}</small>`:''}</span>
    ${l<3?`<button class="btn tksm" type="button" data-mg="build" data-id="${fk}" ${dis([lu2Busy(w,pm),_T('Your builders are already busy this week.')],needCoin(pm,cost))}>${_T`Build ${LU2_RN[l]}`}<small>${coinAmt87(cost)}</small></button>`:`<span class="badge gold">${_T`complete`}</span>`}</div>`}
function lu2Builds(w,pm,k){const ks=lu2Keys(k);if(!ks.length)return '';
  return `<div class="lu2b"><div class="lu2bh">🏗 ${ks.length===1?_T('His building'):_T('His buildings')}<span class="rc-sub">${lu2Busy(w,pm)?_T('the builders are busy this week'):_T('one project a week')}</span></div>${ks.map(fk=>lu2Row(w,pm,fk)).join('')}</div>`}
function lu2Grade(pm){const g=ludusGrade(pm);return `<span class="gradebox sm" style="--gc:${gradeCol(g)}" title="${esc(_T`Ludus grade — from ${facSum(pm)} of ${Object.keys(FAC).length*3} facility levels`)}">${g}</span>`}
function lu2Overview(w,pm){const C=council83(w);const nm=k=>{const a=C.find(x=>x.k===k);return a?esc(String(a.name).split(' ')[0]):k};const ro=k=>{const a=C.find(x=>x.k===k);return a?esc(a.role):''};
  const owners=[...new Set(Object.keys(FAC).map(lu2Owner))].filter(k=>k!=='consilium');
  const nx=lu2Next(w,pm);const busy=lu2Busy(w,pm);
  const next=busy?_T('The builders are busy this week — the next project waits for next week.'):nx?_T`Next you can pay for: <b>${esc(FAC[nx].n)} ${LU2_RN[facLvl(pm,nx)]}</b> · ${coinAmt87(FAC_COST[facLvl(pm,nx)])} — ask ${nm(lu2Owner(nx))}.`:Object.keys(FAC).every(fk=>facLvl(pm,fk)>=3)?_T('Every building is finished.'):_T('No building fits the treasury this week.');
  const own=lu2Keys('consilium');
  return `<div class="lu2b lu2ov"><div class="lu2bh">🏗 ${_T`The buildings`} ${lu2Grade(pm)}<span class="rc-sub">${_T`Ludus grade · ${facSum(pm)} of ${Object.keys(FAC).length*3} levels`}</span></div>
    <div class="lu2g">${owners.map(k=>`<button type="button" class="lu2o${lu2Keys(k).some(fk=>lu2Can(w,pm,fk))?' can':''}" data-lu100adv="${k}"><b>${nm(k)}</b><small>${ro(k)}</small>${lu2Keys(k).map(fk=>{const l=facLvl(pm,fk);return `<span>${FAC[fk].i} ${esc(FAC[fk].n)} <span class="facpips">${[0,1,2].map(i=>`<i class="${i<l?'on':''}"></i>`).join('')}</span></span>`}).join('')}</button>`).join('')}</div>
    <div class="lu2nx">${next}${nx&&!busy?` <button type="button" class="lnk" data-lu100adv="${lu2Owner(nx)}">${_T`Open ${nm(lu2Owner(nx))} ›`}</button>`:''}</div>
    ${own.length?own.map(fk=>lu2Row(w,pm,fk)).join(''):''}
    <div class="lu2ln"><button type="button" class="btn tksm" data-mg="run" data-id="consil">🏛 ${_T`The Consilium's counsel`}</button></div></div>`}
function lu2PopExtra(w,pm,k){
  if(k==='consilium')return lu2Overview(w,pm);
  if(k==='recruiter')return `<div class="lu2b"><div class="lu2bh">🏗 ${_T`What recruits see`} ${lu2Grade(pm)}</div><small class="lu2nt">${_T('Free agents weigh your Ludus grade. Every building any advisor raises lifts it.')} <button type="button" class="lnk" data-lu100adv="consilium">${_T`The buildings ›`}</button></small></div>`;
  let h=lu2Builds(w,pm,k);
  if(k==='clerk'){const M=weekMoney();const reb=M.clerk||0;
    h+=`<div class="lu2b"><div class="lu2bh">📜 ${_T`The books`}</div><small class="lu2nt">${_T`This week: wages ${M.wages}`}${reb?_T` · his rebate −${reb}`:''} · ${_T`net`} ${coinAmt87((M.net>=0?'+':'')+M.net)}/${_T`wk`}</small><div class="lu2ln"><button type="button" class="btn tksm" data-mg="run" data-id="ledger">📜 ${_T`Ledger`} <small>${(w.tlog||[]).length}</small></button></div></div>`}
  return h}
{const base=lu100PopHTML;lu100PopHTML=function(w,pm,k){let h=base.apply(this,arguments);try{if(!lu2On()||!h)return h;const add=lu2PopExtra(w,pm,k);const i=h.lastIndexOf('</div><div class="lu100scrim"');if(add&&i>0)h=h.slice(0,i)+add+h.slice(i)}catch(e){console.error(e)}return h}}
/* the Consilium lights with his weekly counsel */
{const base=lu100Lit;lu100Lit=function(w){const out=base.apply(this,arguments);try{if(lu2On()&&out&&!out.consilium){const c=lu2Counsel(w);if(c)out.consilium={key:'lu2:consil',title:c}}}catch(e){console.error(e)}return out}}
/* the 🏗 marker on a head (inside the face, so 294's frieze keeps it) */
{const base=lu100Frieze;lu100Frieze=function(R,w,pm){try{if(lu2On()&&!w.tutorial)for(const p of R.querySelectorAll('#council83 .c83p')){const k=p.dataset.c83;if(lu2Keys(k).some(fk=>lu2Can(w,pm,fk))&&k!=='consilium'){const f=p.querySelector('.c83f');if(f){f.insertAdjacentHTML('beforeend',`<span class="lu2bm" title="${esc(_T('A building of his is affordable this week'))}">🏗</span>`);p.classList.add('lu2can')}}}}catch(e){console.error(e)}return base.apply(this,arguments)}}
/* the Upgrade School tile opens the Consilium's overview */
{const base=lu100Tiles;lu100Tiles=function(w,pm,council){let h=base.apply(this,arguments);try{if(!lu2On())return h;const i=h.indexOf('<button type="button" class="lu100t k-school"');const j=h.indexOf('<button type="button" class="lu100t k-armory"');if(i<0||j<i)return h;
    const KS=['yard','barracks','valet','kitchen','shrine','stands'].filter(k=>FAC[k]);const busy=lu2Busy(w,pm);const nx=lu2Next(w,pm);const C=council83(w);const who=k=>{const a=C.find(x=>x.k===k);return a?esc(String(a.name).split(' ')[0]):''};
    const pips=`<span class="pips">${KS.map(k=>{const l=facLvl(pm,k);return `<span title="${esc(FAC[k].n)} ${l?LU2_RN[l-1]:'—'}"><em>${esc(LU100_FAC()[k]||FAC[k].n)}</em>${[0,1,2].map(n=>`<i${n<l?' class="on"':''}></i>`).join('')}</span>`}).join('')}</span>`;
    const t=lu100Tile({cls:'k-school',attr:`data-lu100adv="consilium" title="${esc(_T('Each advisor runs his own buildings'))}"`,art:scene100('school'),extra:pips,ic:'🏛',t:_T('Upgrade School'),
      sub:busy?_T('The builders are busy this week'):nx?_T`Each advisor runs his buildings · next: ${esc(FAC[nx].n)} ${LU2_RN[facLvl(pm,nx)]} with ${who(lu2Owner(nx))}`:_T('Each advisor runs his buildings'),chips:[`<span>${_T`Grade ${ludusGrade(pm)}`}</span>`]});
    h=h.slice(0,i)+t+h.slice(j)}catch(e){console.error(e)}return h}}

/* ---------- 2b · the Clerk's rebate in the ledger badge ---------- */
{const base=weekMoney;weekMoney=function(){const r=base.apply(this,arguments);try{if(lu2On()&&r){const reb=lu2Rebate(W_(),me());if(reb>0){r.clerk=reb;r.net+=reb;r.runway=r.net>=0?Infinity:Math.max(0,Math.floor(r.coin/-r.net))}}}catch(e){console.error(e)}return r}}
/* the end of the <span> that starts at i (nested spans counted) */
function lu2SpanEnd(h,i){let d=0;const re=/<span\b|<\/span>/g;re.lastIndex=i;let m;while((m=re.exec(h))){if(m[0]==='</span>'){d--;if(!d)return m.index+7}else d++}return -1}

/* ---------- the final mgrHTML wrapper: badge, links row ---------- */
{const base=mgrHTML;mgrHTML=function(){let h=base.apply(this,arguments);try{if(!lu2On()||typeof h!=='string')return h;const w=W_();if(!w||w.dead||MGR.view)return h;
  const i=h.indexOf('<span class="badge ledger');
  if(i>=0){const e=lu2SpanEnd(h,i);if(e>0){const M=weekMoney();let s=h.slice(i,e);
      s=s.replace('<span class="badge ledger',`<span role="button" tabindex="0" data-lu2led="1" aria-label="${esc(_T('Open the ledger'))}" class="badge ledger lu2led`);
      if(M.clerk>0){s=s.replace(' title="',` title="${esc(_T`The Clerk haggles ${M.clerk} off the wages`)} · `);s=s.slice(0,-7)+`<span class="lu2rb"> · <span class="lu2w">${_T`wages ${M.wages}`} </span>${_T`(−${M.clerk} Clerk)`}</span></span>`}
      h=h.slice(0,i)+s+h.slice(e)}}
  if(MGR.tab==='ludus'){h=h.replace(/<div class="lu100lk">([\s\S]*?)<\/div>/,(all,inner)=>{const keep=inner.replace(/<button[^>]*data-id="(consil|ledger)"[^>]*>[\s\S]*?<\/button>/g,'').trim();return keep?`<div class="lu100lk">${keep}</div>`:''})}}catch(e){console.error(e)}return h}}

/* ---------- 3a · the Roster and Armory banners ---------- */
{const base=roomScene73;roomScene73=function(k){try{if(lu2On()&&(k==='roster'||k==='armory')&&typeof scene100==='function')return scene100(k==='roster'?'team':'armory','banner','lu2ban')+'<span class="lu2bsh" aria-hidden="true"></span>'}catch(e){console.error(e)}return base.apply(this,arguments)}}

/* ---------- 1 · the lesson's Facilities step lights the head that holds the Stables ---------- */
try{const st=MTUT_STEPS.find(x=>x&&x.k==='fac');if(st){const sp0=st.spot,say0=st.say,un0=st.until;const on=()=>lu2On()&&!!document.querySelector('#mgrPane #council83.lu100fz');
  st.spot=()=>on()?document.querySelector(`#mgrPane .c83p[data-c83="${lu2Owner('stables')}"]`):mtEl(sp0);
  st.say=()=>on()?_T`Each advisor runs his own <b>buildings</b>: permanent upgrades, one project a week. The <b>Clerk</b> keeps the Stables — tap his face.`:(typeof say0==='function'?say0():say0);
  st.until=()=>(un0&&un0())||(on()&&LU100.pop===lu2Owner('stables'))}}catch(e){console.error(e)}

/* ---------- clicks: counsel, ledger badge, panels from the popover ---------- */
function lu2Panel(id){MGR.view=null;MGR.tab='ludus';MGR.run=id;LU100.panel=id;LU100.pop=null;const w=W_();if(id==='consil'&&w)w.lu2c=w.week;if(typeof MGR_REDRAW==='function')MGR_REDRAW();
  setTimeout(()=>{const p=document.querySelector('#mgrPane .lu100panel');if(p)try{p.scrollIntoView({block:'nearest',behavior:reduceMotionOn()?'auto':'smooth'})}catch(e){}},60)}
window.addEventListener('click',e=>{if(!lu2On()||!e.target||!e.target.closest)return;
  const led=e.target.closest('[data-lu2led]');if(led&&led.closest('#mgrBody')){e.preventDefault();e.stopPropagation();lu2Panel('ledger');return}
  const rd=e.target.closest('#lu100pop [data-lu100read^="lu2:"]');if(rd){e.preventDefault();e.stopPropagation();lu2Panel('consil');return}
  const r=e.target.closest('#lu100pop [data-mg="run"]');if(r){LU100.pop=null;const w=W_();if(r.dataset.id==='consil'&&w)w.lu2c=w.week;setTimeout(()=>{const p=document.querySelector('#mgrPane .lu100panel');if(p)try{p.scrollIntoView({block:'nearest'})}catch(err){}},80)}},true);
window.addEventListener('keydown',e=>{if(!lu2On()||(e.key!=='Enter'&&e.key!==' '))return;const t=e.target&&e.target.closest&&e.target.closest('[data-lu2led]');if(t){e.preventDefault();t.click()}},true);

(()=>{const st=document.createElement('style');st.textContent=`
.badge.ledger.lu2led{cursor:pointer}.badge.ledger.lu2led:hover{filter:brightness(1.15)}.badge.ledger.lu2led:focus-visible{outline:2px solid var(--gold2)}
.badge.ledger .lu2rb{opacity:.85}
.roomhd.b73>img.lu2ban{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.roomhd.b73>.lu2bsh{position:absolute;inset:0;background:linear-gradient(90deg,rgba(20,12,6,.78) 0%,rgba(20,12,6,.35) 45%,rgba(20,12,6,0) 70%,rgba(20,12,6,.45) 100%);pointer-events:none}
.roomhd.b73>.roomttl,.roomhd.b73>.roomstat{z-index:2}
#council83.lu100fz .c83f>.lu2bm{position:absolute;right:-4px;top:-4px;z-index:3;width:22px!important;height:22px!important;filter:none!important;overflow:visible!important;border-radius:50%;display:grid;place-items:center;font-size:12px;background:#2a1a0e;border:1.5px solid #9fd77e;box-shadow:0 1px 3px rgba(0,0,0,.6)}
.lu100pop .lu2b{margin-top:9px;border-top:1px solid var(--line2,#5a4636);padding-top:8px}
.lu100pop .lu2bh{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font:700 11px var(--mono);letter-spacing:1px;text-transform:uppercase;color:var(--gold2);margin-bottom:4px}
.lu100pop .lu2bh .rc-sub{font:400 12px var(--body,inherit);letter-spacing:0;text-transform:none;margin-left:auto}
.lu100pop .lu2r{display:grid;grid-template-columns:24px minmax(0,1fr) auto;gap:8px;align-items:center;padding:5px 0;border-top:1px dashed rgba(201,164,88,.25)}
.lu100pop .lu2r:first-of-type{border-top:0}
.lu100pop .lu2r .i{font-size:17px;text-align:center}
.lu100pop .lu2r .t{min-width:0;font-size:13px}.lu100pop .lu2r .t b{color:#f3e3b8}
.lu100pop .lu2r small,.lu100pop .lu2nt{display:block;font-size:12px;color:var(--muted,#b3a58a);line-height:1.3}.lu100pop .lu2r small.nx{color:#9fd77e}
.lu100pop .lu2r .btn{white-space:nowrap;display:flex;flex-direction:column;align-items:center;line-height:1.1}
.lu100pop .lu2r .btn small{display:block;color:inherit;font-size:11px}
.lu100pop .facpips{display:inline-flex;gap:2px;vertical-align:1px}.lu100pop .facpips i{width:7px;height:7px;border-radius:50%;border:1px solid #d6ab4c}.lu100pop .facpips i.on{background:#f0cf7d}
.lu100pop .lu2g{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.lu100pop .lu2o{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;gap:1px;padding:5px 8px;border:1px solid #5a4636;border-radius:7px;background:rgba(0,0,0,.2);font-size:12px;min-width:0}
.lu100pop .lu2o:hover,.lu100pop .lu2o:focus-visible{border-color:var(--gold2)}.lu100pop .lu2o.can{border-color:#6f9a52}
.lu100pop .lu2o b{color:#f3e3b8;font-size:13px}.lu100pop .lu2o small{font:700 9.5px var(--mono);letter-spacing:.8px;text-transform:uppercase;color:var(--dim,#a3907a)}
.lu100pop .lu2o>span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#e8dcc0}
.lu100pop .lu2nx{margin:6px 0 2px;font-size:12.5px}.lu100pop .lu2nx .lnk,.lu100pop .lu2nt .lnk{color:#f0cf7d}
.lu100pop .lu2ln{display:flex;justify-content:flex-end;gap:6px;margin-top:6px}
.lu100pop .lu2ln .btn small{display:inline;margin-left:4px;opacity:.7}
@media (max-width:600px){.badge.ledger .lu2w{display:none}.lu100pop .lu2g{grid-template-columns:1fr 1fr;gap:4px}.lu100pop .lu2o{padding:4px 6px;font-size:11px}.lu100pop .lu2r .t{font-size:12.5px}
 #council83.lu100fz .c83f>.lu2bm{width:16px!important;height:16px!important;font-size:9px;right:-3px;top:-3px}}
`;document.head.appendChild(st)})();
