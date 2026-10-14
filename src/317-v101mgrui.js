/* =====================================================================
   317-V101MGRUI · v1.01 — workstream A, MANAGER UI (his notes 2026-10-13 + answers 1a 2a 3a 4a 8a, tools/plans/v101/PLAN.md)
   =====================================================================
   Display + small flow changes only; every handler / data-* / MGR state of the pages it touches is kept. Kill switch localStorage
   flavius_v101aoff=1 (the wrappers step aside; the few direct edits in older modules are listed under each item).
   M1  Rivalry letter (77-rivalry, direct edit): with fewer than 2 fit fighters only the fame-loss / editor-fills line shows; "Name no one and the
       Consilium sends your best two" only when 2+ are fit.
   M2  Blurry portraits after choosing a fighter (Match Week lineup): face99 wrapper asks 268's raster cache for 1.5× the shown width on busts
       between 20 and 100 px (the cache key includes the size; display size unchanged).
   M3  Hard start (w.startDiff 'hard'): no ★ advised marks (recAdvice74 + the finished HTML) unless the Recruiter advisor is at the top level.
   M4  Tooltip on "🗡 Promise the rudis path" (157-v88mgr, direct edit).
   M5  Recruiting list fills the column space at wide desktop widths (CSS: a wider column, the dropped Fit/Ask cells come back, the list stretches).
   M6  The recruiting "Stable" filter is gone (Roster covers it; 17's gcard still uses filter 'mine' internally).
   M7  Recruiting always opens on Free agents — also when a letter / Mail lands there (MGR.filter reset when the tab is entered, except gcard).
   M8  Imperium map: every layer chip off = bare city pins (wd100LayerSVG returns nothing, legend/badges hidden).
   M9  The Season tab leaves the rail; a "📅 Season" button sits on the League banner (the Season view keeps its ids/handlers, ◀ League brings you back; the lesson step in 36-mtutor lights League then the button).
   M10 League house card: 🔍 Scout and ⚔ Challenge gone, "Team screen" → "Team Details" (290, direct edit; 36-mtutor wording).
   M11 My Ludus → Promote opens a small popup (the same 23-ludus promote panel, centred over a scrim) instead of opening under the tiles.
       The Ledger lives INSIDE the Clerk's advisor popover (also from the header badge) — nothing opens under the tiles any more.
   M12 "The Council": the tile is renamed; the Consilium sits alone on top, centred and larger, as its head, the five advisors under him.
   M16 The Consilium's counsel is inside his popover (the old advisor/tasks panel no longer shows under the heads).
   M20 Recruiting: the Offer step tab pulses (opacity/filter only; Reduce motion = a static gold ring) once the recruit would sign.
   M22 League: the house card column is wider (CSS).
   M25 Recruiting: the board (.pipeline) sits directly under the banner; the "This week" plan line is gone.
   M33 Lanista rail tab + banner show unspent perk points; the Tituli rail tab counts honours not yet seen (w.tit101seen, marked when the plaque is clicked).
   M34 Trophies → Tituli: Honours | Glass case sub-tabs, no second trophy list, coin + fame on each plaque; Manager trophies no longer pay CF (22-trophies, direct edit).
   M36 Match Week banner bout cards never wrap to a second row (they shrink and slide left).
   M38 A negative treasury is a red note above the My Ludus banner (the old ☠ card under the tiles is removed).
   M43 Season → My Acta: every result of my fighters this season with the purse + league points (w.my101 records the coin of each bout; older weeks show —).
   M44 Sica's loan: the Clerk writes the payment letter (buttons: minimum / 50 / all), his head lights; the syndicate's warning also comes from him.
   M45 An open advisor popover closes on any other click (button, tab, letter).
   ===================================================================== */
const P101={last:null,gcard:false};
const WD101={sub:'honours'};
function a101On(){try{return localStorage.getItem('flavius_v101aoff')!=='1'}catch(e){return true}}
const a101Plain=h=>String(h||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();

/* ---------- M2 · sharper busts: the raster is cut at 1.5× the shown width ---------- */
if(typeof face99==='function'){const base=face99;face99=function(spec,opt){try{if(a101On()&&opt&&opt.size>=20&&opt.size<=100&&(!opt.frame||opt.frame==='bust')&&opt.raster!==false)opt={...opt,size:Math.round(opt.size*1.5)}}catch(e){}return base.call(this,spec,opt)}}

/* ---------- M3 · Hard: no ★ unless the Recruiter is at the top level ---------- */
function adv101Hide(w){try{return !!w&&!w.tutorial&&w.startDiff==='hard'&&adv98Lv(w,'recruiter')<REC98.lvMax}catch(e){return false}}
function adv101Strip(h){return String(h).replace(/<i class="star85[^"]*"[^>]*>[\s\S]*?<\/i>/g,'').replace(/ adv74\b/g,'').replace(/ data-adv85="[^"]*"/g,'')}
{const base=recAdvice74;recAdvice74=function(g,m,step){if(a101On()&&adv101Hide(W_()))return null;return base.apply(this,arguments)}}

/* ---------- M20 + M3 · the free agent's card: the Offer tab pulses when he would sign; no ★ on Hard ---------- */
{const base=detailHTML;detailHTML=function(g){let h=base.apply(this,arguments);try{if(!a101On()||!g||g.contract||typeof h!=='string'||!h.includes('data-recstep'))return h;
  const w=W_();if(adv101Hide(w))h=adv101Strip(h);
  const rdy=typeof recReady==='function'?recReady(g):null;const cur=MGR.recStep||(typeof recStepNow==='function'?recStepNow(g,me()):1);
  if(rdy&&cur!==3){const T=document.createElement('template');T.innerHTML=h;const b=T.content.querySelector('[data-recstep="3"]');
    if(b){b.classList.add('rc101rdy');if(reduceMotionOn())b.classList.add('still');b.setAttribute('title',_T('He would sign at your ask — time to make the offer.'));return T.innerHTML}}}catch(e){console.error(e)}return h}}

/* ---------- M8 · bare map ---------- */
if(typeof wd100LayerSVG==='function'){const base=wd100LayerSVG;wd100LayerSVG=function(){try{if(a101On()){const L=WD100.lay;if(!L.fans&&!L.weather&&!L.events&&!L.war)return ''}}catch(e){}return base.apply(this,arguments)}}

/* ---------- M9 · League banner: 📅 Season button; Season banner: ◀ League ---------- */
if(typeof wd100Banner==='function'){const base=wd100Banner;wd100Banner=function(k){let h=base.apply(this,arguments);try{if(!a101On()||typeof h!=='string')return h;
  const btn=k==='league'?`<button type="button" class="wd101sea" data-mg="tab" data-id="sched">📅 ${_T('Season')}</button>`:k==='sched'?`<button type="button" class="wd101sea" data-mg="tab" data-id="league">◀ ${_T('League')}</button>`:'';
  if(btn)h=h.replace(/(<div class="kick">[\s\S]*?)(<\/div><h2>)/,(m0,a,b)=>a+btn+b)}catch(e){console.error(e)}return h}}

/* ---------- M33 · rail counts: perk points (Lanista banner too), honours not yet seen ---------- */
{const base=tabStat73;tabStat73=function(k){try{if(a101On()&&k==='me'){const p=(me()&&me().perkPts)||0;if(p)return [p,p===1?_T('perk point to spend'):_T('perk points to spend')]}}catch(e){}return base.apply(this,arguments)}}
const tit101Key=t=>(t.tid||t.id)+'#'+(t.count||1);
function tit101Seen(w){if(!Array.isArray(w.tit101seen))w.tit101seen=(w.trophies||[]).map(tit101Key);return w.tit101seen}
function tit101Unseen(w){const S=new Set(tit101Seen(w));return (w.trophies||[]).filter(t=>!S.has(tit101Key(t)))}
function tit101Mark(w,tid){const S=tit101Seen(w);let n=0;for(const t of w.trophies||[])if((t.tid||t.id)===tid&&!S.includes(tit101Key(t))){S.push(tit101Key(t));n++}if(n){try{saveWorld()}catch(e){}}return n}

/* ---------- M34 · Tituli: Honours | Glass case ---------- */
if(typeof wd100TrophyView==='function'){const base=wd100TrophyView;wd100TrophyView=function(){let h=base.apply(this,arguments);try{if(!a101On()||WD100.tf!=='mgr'||typeof h!=='string')return h;
  const w=W_();const T=document.createElement('template');T.innerHTML=h;const R=T.content;const sub=WD101.sub==='case'?'case':'honours';
  const cs=R.querySelector('.wd100case');if(cs){const det=cs.querySelector('details');if(det)det.remove()}
  const tools=R.querySelector('.wd100tools');
  if(sub==='case'){for(const n of [...R.childNodes])if(n!==tools&&n!==cs)n.remove()}else if(cs)cs.remove();
  if(tools){const seg=document.createElement('div');seg.className='seg wd101seg';seg.setAttribute('role','group');
    seg.innerHTML=`<button type="button" data-wd101sub="honours" class="${sub==='honours'?'on':''}" aria-pressed="${sub==='honours'}">${_T('Honours')}</button><button type="button" data-wd101sub="case" class="${sub==='case'?'on':''}" aria-pressed="${sub==='case'}">${_T('Glass case')}</button>`;
    const first=tools.firstElementChild;if(first)first.after(seg);else tools.prepend(seg)}
  const un=new Set(tit101Unseen(w).map(t=>t.tid||t.id));
  for(const p of R.querySelectorAll('.wd100tp[data-wd100tp]')){const id=p.getAttribute('data-wd100tp');const d=(typeof TROPHY_LIB!=='undefined'?TROPHY_LIB:[]).find(x=>x.id===id);
    if(d&&d.rewards&&(d.rewards.coin||d.rewards.fame)){const s=document.createElement('span');s.className='rw101';s.title=_T('Paid to the house when it is won');s.innerHTML=rewardText({coin:d.rewards.coin,fame:d.rewards.fame});p.appendChild(s)}
    if(un.has(id)){p.classList.add('new101');p.insertAdjacentHTML('afterbegin',`<i class="nw101">${_T('NEW')}</i>`)}}
  return T.innerHTML}catch(e){console.error(e)}return h}}

/* ---------- M43 · My Acta: purse + league points per result ---------- */
{const base=applyBout;applyBout=function(bi,res,opt){let pm=null,c0=0,b0=0,b=null,w=null;
  try{w=W_();pm=me();b=w&&w.night&&w.night.bouts&&w.night.bouts[bi];if(!b||b.done||!pm)b=null;else{c0=pm.coin;b0=pm.betNet||0}}catch(e){b=null}
  const r=base.apply(this,arguments);
  try{if(b&&b.done&&res&&res.rows){const mine=res.rows.filter(x=>{const g=gById(x.mgrId);return g&&g.contract&&g.contract.mgr===pm.id});
    if(mine.length){const delta=Math.max(0,(pm.coin-c0)-((pm.betNet||0)-b0));const wins=mine.filter(x=>x.won);const who=wins.length?wins:mine;
      const abs=w.night.week;w.my101=w.my101||{};const rec=w.my101[abs]=w.my101[abs]||{};
      who.forEach((x,i)=>{const g=gById(x.mgrId);const share=Math.floor(delta/who.length)+(i===0?delta%who.length:0);rec[g.name]=(rec[g.name]||0)+share});
      const ks=Object.keys(w.my101).map(Number).sort((a,c)=>a-c);while(ks.length>40)delete w.my101[ks.shift()]}}}catch(e){console.error(e)}
  return r}}
function wd101Acta(w,pm,wk0,baseW,sch){const out=[];const M=w.my101||{};
  for(let k=wk0-1;k>=1;k--){if(BYE_WKS.includes(k))continue;const abs=baseW+k;const A=w.acta96&&w.acta96[abs];if(!A||!A.rows||!A.rows.length)continue;const f=sch[k-1];
    for(const r of A.rows){const pts=r.w?3:r.p===2?1:0;const coin=M[abs]&&M[abs][r.n]!=null?M[abs][r.n]:null;
      const place=r.w?`🏆 ${_T('won')}`:r.p?lp90Ord(r.p):'·';
      out.push(`<div class="wd100sr act101"><span class="wkn">${_T('WK')} ${k}</span><span class="c-cy" title="${esc(LOCATIONS[f.loc].n)}"><b>${esc(r.n||'?')}</b></span><span class="c-ev">${esc(r.ev||'')}${r.t?` · ${esc(r.t)}`:''}</span><span class="c-bs">${place}${r.fate&&!r.w?` <small>${esc(r.fate)}</small>`:''}</span><span class="pl2" title="${esc(_T('Purse and fees this bout brought the house'))}">${coin==null?'—':coin?ICO.coin+' +'+coin:ICO.coin+' 0'}</span><span class="pts" title="${esc(_T('League points'))}">${pts?'+'+pts:'0'}</span></div>`)}}
  return out.length?out.join(''):`<div class="wd100sr empty"><span>${_T('No results yet this season.')}</span></div>`}

/* ---------- M44 · the Clerk's loan letters ---------- */
function clk101Body(w){const L=w.loan;const m=me();if(!L||L.amt<=0)return '';const due=L.due||0,paid=L.paid||0,left=Math.max(0,due-paid);
  return `<p>${_T`<b>${coinAmt87(L.amt)} owed</b> to ${esc(L.name)} · ${Math.round(loanRate(L)*100)}% interest a week, added to the debt. Nobody takes it from your treasury: you pay by hand.`}</p>
    <p>${due?_T`This week's minimum: <b>${due}</b>${paid?_T` (paid ${paid}${left?_T`, ${left} to go`:' ✓'})`:''}.`:_T('No minimum due yet this week.')}${L.missed?_T` <b>${L.missed} week${L.missed>1?'s':''} short${L.kind==='synd'?_T` — ${SYND.strikes} and the syndicate collects in blood`:''}.</b>`:''}</p>
    <div class="acts">${left?`<button class="btn primary tksm" type="button" data-mg="loanmin" ${dis(needCoin(m,left))}>${_T`Pay the minimum · ${left}`}</button>`:''}<button class="btn tksm" type="button" data-mg="loanpay" ${dis(needCoin(m,Math.min(L.amt,50)))}>${_T`Pay 50 now`}</button><button class="btn tksm" type="button" data-mg="loanpayall" ${dis(needCoin(m,L.amt))}>${_T`⚖ Pay it all off · ${L.amt}`}</button></div>`}
function clk101Sync(w){try{if(!w||w.dead||w.tutorial||typeof sendLetter!=='function')return;const L=w.loan;const cur=(w.letters||[]).find(x=>x&&x.key==='clerk-loan');
  if(!L||L.amt<=0){if(cur&&!cur.read)cur.read=true;return}
  if(!cur||(cur.wk!==w.week&&cur.s!==undefined&&(cur.wk!==w.week||cur.s!==w.season))){sendLetter(w,{key:'clerk-loan',kind:'letter',from:_T('your clerk'),adv:'clerk',seal:'⚖',title:_T("The Clerk: what you owe Sica"),until:w.week,body:clk101Body(w)});return}
  if(!cur.read){cur.body=clk101Body(w);cur.until=Math.max(cur.until||0,w.week)}}catch(e){console.error(e)}}
{const base=mailLive;mailLive=function(){if(a101On())clk101Sync(W_());const out=base.apply(this,arguments);try{if(a101On()&&out&&Array.isArray(out.items))out.items=out.items.filter(it=>!(typeof it.html==='string'&&/class="card2 loanbox"/.test(it.html)))}catch(e){}return out}}
{const base=sendLetter;sendLetter=function(w,o){try{if(a101On()&&o&&o.key==='synd-warn'){o={...o,from:_T('your clerk'),adv:'clerk',seal:'⚖',title:_T("The Clerk: Sica's patience is wearing thin")}}}catch(e){}return base.call(this,w,o)}}

/* ---------- M12 / M16 / M11 / M45 · the Council, counsel + ledger inside the popovers, Promote popup ---------- */
function led101HTML(w){const row=n=>`<div class="${n.cls||''}"><span class="rc-sub">S${n.s} W${n.wk} · </span>${n.text}</div>`;const L=(w.tlog||[]).slice(0,40);const m=me();const mine=(w.grave||[]).filter(x=>x.mgr===m.name);
  return `<div class="lu2b led101"><div class="lu2bh">📜 ${_T`Ludus ledger`}<span class="rc-sub">${_T`everything that touched your stable`}</span></div>
    <div class="news led101l">${L.length?L.map(row).join(''):`<p class="rc-sub" style="margin:0">${_T`Nothing yet — sign someone.`}</p>`}</div>
    ${mine.length?`<details class="led101f"><summary class="rc-sub">✝ ${_T`The fallen`} · ${mine.length}</summary><div class="news led101l">${mine.slice(0,20).map(x=>`<div class="bad"><b>${esc(x.name)}</b>${x.age?`, ${x.age}`:''} <span class="rc-sub">${CLASSES[x.cls]?esc(CLASSES[x.cls].name):''} · ${esc(x.fate||'')} · S${x.s} W${x.wk}</span></div>`).join('')}</div></details>`:''}</div>`}
{const base=lu100PopHTML;lu100PopHTML=function(w,pm,k){let h=base.apply(this,arguments);try{if(!a101On()||!h)return h;
  if(k==='consilium'){const c=`<div class="lu2b cn101"><div class="lu2bh">🧭 ${_T`The Consilium's counsel`}</div>${consiliumHTML()}</div>`;
    const re=/<div class="lu2ln"><button[^>]*data-id="consil"[^>]*>[\s\S]*?<\/button><\/div>/;h=re.test(h)?h.replace(re,()=>c):h.replace('</div><div class="lu100scrim"',()=>c+_T('</div><div class="lu100scrim"'))}
  if(k==='clerk'){const re=/<div class="lu2ln"><button[^>]*data-id="ledger"[^>]*>[\s\S]*?<\/button><\/div>/;h=h.replace(re,'');const i=h.lastIndexOf('</div><div class="lu100scrim"');if(i>0)h=h.slice(0,i)+led101HTML(w)+h.slice(i)}}catch(e){console.error(e)}return h}}
/* the Ledger badge + the counsel's "Read it" open the popover, never a panel under the tiles */
if(typeof lu2Panel==='function'){const base=lu2Panel;lu2Panel=function(id){if(!a101On()||(id!=='ledger'&&id!=='consil'))return base.apply(this,arguments);
  MGR.view=null;MGR.tab='ludus';MGR.run=null;LU100.panel=null;const w=W_();if(id==='consil'&&w)w.lu2c=w.week;LU100.pop=id==='ledger'?'clerk':'consilium';if(typeof MGR_REDRAW==='function')MGR_REDRAW()}}
/* 🏛 The Council: the Consilium alone on top, centred and larger; the five under him */
{const base=lu100Frieze;lu100Frieze=function(){let h=base.apply(this,arguments);try{if(!a101On()||typeof h!=='string'||!h)return h;
  const T=document.createElement('template');T.innerHTML=h;const R=T.content;const cc=R.querySelector('#council83');if(!cc)return h;const row=cc.querySelector('.c83row');const cons=cc.querySelector('.c83p[data-c83="consilium"]');if(!row||!cons)return h;
  const top=document.createElement('div');top.className='c101top';cons.classList.add('c101cons');top.appendChild(cons);row.before(top);cc.classList.add('c101');
  const lit=cc.querySelectorAll('.c83p.lit').length;const tile=R.querySelector('.lu100t.k-adv');
  const b=R.querySelector('.lu100t.k-adv .cap .ct>b');if(b){const cnt=b.querySelector('.cnt');b.textContent=_T('The Council')+' ';if(cnt)b.appendChild(cnt)}
  const sub=R.querySelector('.lu100t.k-adv .cap .ct>span');if(sub)sub.textContent=lit?(lit===1?_T('Someone on the Council has something for you: tap the lit face'):_T`${lit} on the Council have something for you: tap a lit face`):_T('Tap a face to hear him, see his level and train him');
  if(tile&&LU100.pop){const ps=[...row.querySelectorAll('.c83p')];const i=ps.findIndex(p=>p.dataset.c83===LU100.pop);const x=LU100.pop==='consilium'?50:(i<0?50:(i+.5)/Math.max(1,ps.length)*100);tile.style.setProperty('--hx',x.toFixed(1)+'%')}
  return T.innerHTML}catch(e){console.error(e)}return h}}
/* any other click closes an open popover (button, tab, letter…) */
window.addEventListener('click',e=>{if(!a101On()||!LU100.pop||!e.target||!e.target.closest)return;
  if(e.target.closest('#lu100pop,[data-lu100adv],[data-lu2led]'))return;
  LU100.pop=null;const p=document.getElementById('lu100pop');if(p)p.remove();const s=document.querySelector('.lu100scrim');if(s)s.remove();for(const x of document.querySelectorAll('.c83p.on'))x.classList.remove('on');
  for(const x of document.querySelectorAll('.lu100t.popon'))x.classList.remove('popon')},true);
/* nothing opens a Consilium / Ledger panel under the tiles any more */
window.addEventListener('click',e=>{if(!a101On()||!e.target||!e.target.closest)return;
  const r=e.target.closest('#mgrBody [data-mg="run"][data-id="consil"],#mgrBody [data-mg="run"][data-id="ledger"]');if(r){e.preventDefault();e.stopPropagation();lu2Panel(r.dataset.id)}
  if(e.target.closest('#mgrBody [data-mg="gcard"]'))P101.gcard=true;
  const sb=e.target.closest('[data-wd101sub]');if(sb){e.preventDefault();e.stopPropagation();WD101.sub=sb.dataset.wd101sub==='case'?'case':'honours';if(typeof MGR_REDRAW==='function')MGR_REDRAW();return}
  const tp=e.target.closest('#mgrBody .wd100tp[data-wd100tp]');if(tp&&MGR.tab==='trophy'&&WD100.tf==='mgr'){const w=W_();if(w&&tit101Mark(w,tp.getAttribute('data-wd100tp'))&&typeof MGR_REDRAW==='function')setTimeout(MGR_REDRAW,0)}},true);

/* ---------- the final mgrHTML wrapper: recruiting defaults, rail ovals, notes, bare map ---------- */
function a101Post(h,w){const pm=me();if(!pm)return h;const T=document.createElement('template');T.innerHTML=h;const R=T.content;
  /* M9 the Season tab leaves the rail */
  const sb=R.querySelector('.rail [data-mg="tab"][data-id="sched"]');if(sb)sb.remove();
  if(MGR.tab==='sched'){const lb=R.querySelector('.rail [data-mg="tab"][data-id="league"]');if(lb)lb.classList.add('on')}
  /* M33 ovals */
  const oval=(k,n,tip)=>{const b=R.querySelector(`.rail [data-mg="tab"][data-id="${k}"]`);if(!b||!n)return;b.querySelectorAll('.mcount.c101').forEach(x=>x.remove());b.insertAdjacentHTML('beforeend',`<span class="mcount c101" title="${esc(tip)}">${n}</span>`)};
  const pp=pm.perkPts||0;oval('me',pp,pp===1?_T('1 perk point to spend'):_T`${pp} perk points to spend`);
  const tb=R.querySelector('.rail [data-mg="tab"][data-id="trophy"]');if(tb){tb.textContent='🏆 '+_T('Tituli');const un=tit101Unseen(w).length;if(un)oval('trophy',un,un===1?_T('1 honour you have not seen yet'):_T`${un} honours you have not seen yet`)}
  const tab=MGR.tab;
  if(tab==='ludus'){const nb=R.querySelector('#mgrPane .card2[style*="blood2"]');
    if(nb&&nb.textContent.indexOf('☠')>=0){const inner=nb.innerHTML;nb.remove();const rm=R.querySelector('.railmain');
      if(rm){const bar=document.createElement('div');bar.className='tiphint neg101';bar.setAttribute('role','alert');bar.innerHTML=inner+` <button class="btn tksm" type="button" data-mg="tab" data-id="night">${_T('Match Week')}</button> <button class="btn tksm" type="button" data-mg="tab" data-id="roster">${_T('Roster')}</button>`;rm.insertBefore(bar,rm.firstChild)}}}
  if(tab==='ludus'){const pn=R.querySelector('#mgrPane .lu100panel');
    if(pn&&(MGR.run==='consil'||MGR.run==='ledger'))pn.remove();
    else if(pn&&LU100.panel==='promote'&&MGR.run==='promote'){pn.classList.add('pr101');pn.setAttribute('role','dialog');pn.setAttribute('aria-label',_T('Promote'));pn.insertAdjacentHTML('beforebegin','<div class="pr101scrim" data-lu100panel=""></div>')}}
  if(tab==='recruit'){
    R.querySelectorAll('[data-mg="filter"][data-id="mine"]').forEach(x=>x.remove());
    R.querySelectorAll('.rplanbox').forEach(x=>x.remove());
    const ban=R.querySelector('.railmain>.roomhd');const board=R.querySelector('.rc1board,.pipeline');if(ban&&board&&ban.nextElementSibling!==board){board.classList.add('rc101board');ban.after(board)}}
  if(tab==='imp'){const L=WD100.lay;if(!L.fans&&!L.weather&&!L.events&&!L.war){const m=R.querySelector('.wd100map');if(m)m.classList.add('bare101')}}
  return T.innerHTML}
{const base=mgrHTML;mgrHTML=function(){const w=W_();
  try{if(a101On()&&w&&!w.dead&&!MGR.view){if(MGR.tab==='recruit'&&P101.last!=='recruit'&&!P101.gcard)MGR.filter='free';P101.gcard=false;P101.last=MGR.tab}}catch(e){}
  const h=base.apply(this,arguments);
  try{if(a101On()&&typeof h==='string'&&w&&!w.dead&&!MGR.view&&typeof W_==='function')return a101Post(h,w)}catch(e){console.error(e)}return h}}

document.addEventListener('keydown',e=>{if(e.key!=='Escape'||!a101On())return;const x=document.querySelector('#mgrPane .lu100panel.pr101 .lu100x');if(x){e.preventDefault();e.stopPropagation();x.click()}},true);

/* ---------- styles ---------- */
(()=>{const st=document.createElement('style');st.textContent=`
/* M20 the Offer tab pulses (opacity/filter only) */
@keyframes rc101pulse{0%,100%{filter:drop-shadow(0 0 0 rgba(240,207,125,0))}50%{filter:drop-shadow(0 0 7px rgba(240,207,125,.95))}}
.rsteps .rc101rdy,.rc1steps .rc101rdy{box-shadow:0 0 0 2px #f0cf7d inset;animation:rc101pulse 1.6s ease-in-out infinite}
.rsteps .rc101rdy.still,body.calm .rsteps .rc101rdy,body.calm .rc1steps .rc101rdy{animation:none}
body.idle92 .rsteps .rc101rdy{animation:none}
/* M9 */
.wd101sea{margin:0 0 0 12px;display:inline-block;vertical-align:middle;font:400 14px var(--display);letter-spacing:.04em;text-transform:none;color:#f3e3bd;border:1px solid #c9a458;background:linear-gradient(#5a4520,#3a2c14);border-radius:6px;padding:2px 11px;cursor:pointer;position:relative;z-index:5}
.wd101sea:hover{filter:brightness(1.15)}.wd101sea:focus-visible{outline:2px solid var(--gold2)}
/* M22 wider house card */
.wd100lg{grid-template-columns:minmax(0,1fr) minmax(340px,440px)}
@media (max-width:1100px){.wd100lg{grid-template-columns:minmax(0,1fr) 300px}}
@media (max-width:860px){.wd100lg{grid-template-columns:minmax(0,1fr)}}
/* M8 */
.wd100map.bare101 .badg,.wd100map.bare101 .warm,.wd100map.bare101 .wd100lay{display:none!important}
.wd100map.bare101 .leg span:last-child{display:none}
/* M33 / M34 */
.mtabs .mcount.c101{float:right;margin-left:6px;background:#bcd9f2;color:#0e2c45}
.mtabs [data-id="trophy"] .mcount.c101{background:#f0cf7d;color:#2a1708}
.wd101seg{margin-left:10px}
.wd100tp .rw101{display:block;font:500 11px var(--mono);color:#3e2c12;margin-top:3px}
.wd100tp.new101{box-shadow:0 0 0 2px #d6ab4c}
.wd100tp .nw101{position:absolute;top:6px;right:6px;font:700 9px var(--mono);font-style:normal;letter-spacing:.08em;background:#7a1f12;color:#fff4d8;border-radius:3px;padding:1px 5px;z-index:2}
.wd100tp{position:relative}
/* M43 */
.wd100sr.act101{grid-template-columns:50px minmax(0,1fr) minmax(0,1.1fr) minmax(0,.9fr) 78px 40px}
.wd100sea:has(.act101){max-height:420px;overflow:auto}
.wd100sr.act101 small{font:11px var(--mono)}
/* M36 bout cards never wrap */
.roomstat.bt85w{flex-wrap:nowrap!important;max-width:none!important;min-width:0}
.roomstat.bt85w .bt85{flex:0 1 auto;min-width:0!important}
.roomstat.bt85w:has(.bt85:nth-of-type(4)) .bt85a{display:none}
.roomstat.bt85w .bt85>span,.roomstat.bt85w .bt85>b{overflow:hidden;text-overflow:ellipsis;max-width:100%}
/* M38 */
.tiphint.neg101{background:#3a1510;border-color:#a8362a;color:#ffd9cf;margin:0 0 10px}
.tiphint.neg101 b{color:#ffb3a6}
/* M12 the Council: the head on top */
.lu100t.k-adv .art.frieze{min-height:254px}
#council83.lu100fz.c101{display:flex;flex-direction:column;align-items:center;justify-content:space-around}
#council83.lu100fz.c101 .c101top{display:flex;justify-content:center;width:100%}
#council83.lu100fz.c101 .c83row{height:auto;width:100%}
#council83.lu100fz.c101 .c101cons .c83f{width:80px;height:80px;box-shadow:0 0 0 2px #e2b04e,0 0 14px rgba(226,176,78,.35)}
#council83.lu100fz.c101 .c83p{max-width:19%}
#council83.lu100fz.c101 .c101cons{max-width:none}
#council83.lu100fz.c101 .c83f{width:62px;height:62px}
@media (max-width:600px){.lu100t.k-adv .art.frieze{min-height:176px}#council83.lu100fz.c101 .c101cons .c83f{width:54px;height:54px}#council83.lu100fz.c101 .c83f{width:44px;height:44px}}
/* M16 / M11 / ledger: the popovers scroll, the Promote panel is a popup */
.lu100pop{max-height:min(72vh,560px);overflow:auto}
.lu100pop .cn101 .card2{background:none;border:0;padding:0;margin:0}.lu100pop .cn101 .card2>.sect{display:none}.lu100pop .cn101 .cons{font-size:13px;margin:6px 0;text-transform:none;letter-spacing:0;font-family:var(--body,inherit)}
.lu100pop .cn101 .cons>div b{color:var(--gold2)}
.lu100panel.pr101 .lu100x{top:8px;right:8px}
.lu100pop .led101l{max-height:200px;overflow:auto;font-size:12.5px}
.lu100pop .led101f{margin-top:6px}
.lu100panel.pr101{position:fixed;z-index:60;left:50%;top:50%;transform:translate(-50%,-50%);width:min(760px,94vw);max-height:84vh;overflow:auto;margin:0;border:1px solid #c9a458;border-radius:10px;background:linear-gradient(#2a1f17,#1c140e);box-shadow:0 18px 60px rgba(0,0,0,.8);padding:14px}
.pr101scrim{position:fixed;inset:0;z-index:59;background:rgba(8,5,3,.55);cursor:pointer}
/* M5 the list fills the column space on wide screens */
@media (min-width:1251px){.mgrid.rc100g:has(#recTable){grid-template-columns:minmax(420px,470px) minmax(0,1fr);align-items:stretch}
  .rc100g>div:first-child{display:flex;flex-direction:column;min-width:0}.rc100g>div:first-child>#recTable{flex:1 1 auto;max-height:none}
  .rc100g #recTable tr>:nth-child(3),.rc100g #recTable tr>:nth-child(5){display:table-cell}
  .rc100g #recTable col.c85f,.rc100g #recTable col.c85a{width:46px}}
`;document.head.appendChild(st)})();
