/* =====================================================================
   333-V102MGR · v1.02 workstream B — MANAGER CHANGES (his v1.01 notes 2026-10-14, picks 3a 4a 6a 7a 8a; plan tools/plans/v102/NOTES.md)
   =====================================================================
   M5  (3a) LEAGUE POINTS = PODIUMS. leaguePtsAfterBout (23-ludus) replaced: 1st 3 · 2nd 2 · 3rd 1 · else 0, and a podium counts ONLY when the
       fighter survived the bout (alive at the end AND after the Fate). Place = 17-manager's finishing order (winners first); in a team event
       every winner is 1st and the losers rank after them. msp(m) now also keeps p1/p2/p3 (S2.w stays the wins count for older readers).
       The record shows as podiums "🥇2 🥈1 🥉3 · 7 bouts" (lp102Rec / lp102Txt) in 231's standings + podium, 290's League rows + house card,
       17's tables + season letters, 185's scouting card, 47's lanista page and 22's Flavian Cup line (direct template edits). 231 LP100_TIP
       reworded. The Season tab's "+N pts" per week (290 wd100Acta96) follows the same rule. League prizes follow the points (they always
       followed the table). Rivals score the same way (every bout goes through leaguePtsAfterBout). SAVE_MIGRATIONS '1.02': older seasons
       get p1 = their wins (p2/p3 unknown → 0).
   M6  (4a) RECRUITING BALANCE. Hours: Ask around 1 h (two rough grades: the ungraded first), Watch him train 1 h (Speed + Strength one step
       sharper), Share a cup 1 h (Intelligence + Charisma one step), Study his bouts 1 h (Luck + the two weakest reads one step) — ~1.9 precision
       points an hour (15 in 8 h), but each once a recruit a week, so a recruit takes 2 weeks of cheap scouting (3 if a step is skipped). TRIAL BOUT 8 h +
       15 coin (~1.7 points an hour), everything sure at once, and only after at least one cheaper look at that recruit (REC98.cap 9 h on one recruit a week → the
       usual trial week is Ask + Trial = 9 h). Measured with tools/tests/tv102b.js (section M6). The advisor's ★ only from Recruiter level 3
       (REC102.starLv); rec98Next = the action with the most precision per hour that fits the hours left (the trial only when nothing cheaper is
       left and the recruit is worth it); the list row of the best VALUE FOR COST free agent wears a ★ (rec102Best: estimated grade + roster
       need over asking price, hours left).
   M9  (6a) TEAM PURSE BY CF. 296's applyBout wrapper calls any102Split after the base: the purse goes to the WINNING side's SURVIVORS in
       proportion to the CF each earned in the bout (equal shares when none earned CF); a dead winner's equal share is taken back; a hired
       partner's share goes to the hirer (as 296: half of his share). b.any100.split = {gid: coin} for the record + the news line.
   M10 (7a) THE COUNCIL. Only "The Council" (the tile) and "Consilium" (the advisor) remain: every "counsel" wording is gone (17 consiliumHTML,
       66 letter title, 294/297/317 buttons and heads). The Consilium's face sits at the BOTTOM LEFT of the frieze in place of the 🏛 icon; the
       other five spread along the strip. His popover loses the Buildings section (the Upgrade School tile opens its own popup: every building,
       grouped by the advisor who runs it, 23's data-mg="build" buttons). His warnings (debt, wage runway, loan due, rival challenge) are ONE
       "🧭 Consilium's report" row in Weekly tasks (a weekChecklist item) + a letter only when urgent (debt or a loan payment due); his head no
       longer lights from 297's lu2Counsel.
   M12 Recruiting list: no horizontal scroll at 1280–1920 (border-collapse, tighter fixed columns, the class chip shrinks first).
   M13 Recruiting Compare (MGR.cmp / data-reccmp) = side by side in the v1.0 look: fresco portrait, chips, home-city map inset, the Stats
       Tablet (299 rc100Grades), the personality card (299 rc100Pers) — recCmpHTML replaced.
   M15 (8a) Every letter (and the Week in review) ends with a quiet "File away ✓" text button at the bottom right (same data-ltr / data-rev99
       handlers); 272's ✕ on the Week in review is gone.
   M16 A READ letter no longer counts: the 📬 Letters count = unread envelopes + the Week in review only until opened (w.rev102), and the
       rail oval / "this week" count (ludusTodo73) skips desk rows that come from a letter already read.
   Test: tools/tests/tv102b.js
   ===================================================================== */
const REC102={starLv:3,trialH:8,trialCoin:15,cap:9};
const V102B={};

/* ---------------- M5 · league points = podiums ---------------- */
const LP102_PTS=[0,3,2,1];
function lp102Of(sp){sp=sp||{};const p1=sp.p1!=null?sp.p1:(sp.w||0);return {p1,p2:sp.p2||0,p3:sp.p3||0,b:sp.b||0}}
function lp102Txt(sp){const P=lp102Of(sp);return _T`🥇${P.p1} 🥈${P.p2} 🥉${P.p3} · ${P.b} bouts`}
function lp102Rec(sp,short){const P=lp102Of(sp);const tip=_T`Podiums this season (fighter survived): ${P.p1} first, ${P.p2} second, ${P.p3} third · ${P.b} bouts`;
  return `<span class="pd102" title="${esc(tip)}">🥇${P.p1} 🥈${P.p2} 🥉${P.p3}${short?` <small>· ${P.b}</small>`:` <small>${_T`· ${P.b} bouts`}</small>`}</span>`}
/* the place that scores: a winner is 1st; the others rank after the winners in 17's finishing order */
function lp102Place(r,nWin){return r.won?1:1+Math.max(0,(r.place||99)-Math.max(1,nWin))}
leaguePtsAfterBout=function(bout){if(!bout||!bout.res)return;const w=W_();const rows=bout.res.rows||[];const nWin=rows.filter(r=>r.won).length;
  for(const r of rows){const g=gById(r.gid);if(g){(g.recent=g.recent||[]).push({s:w.season,wk:((w.week-1)%12)+1,t:TIERS[bout.tier]?TIERS[bout.tier].n:'',ev:(EVENTS[bout.ev]||{}).short||'',loc:w.night?LOCATIONS[w.night.loc].n:'',place:r.place,won:!!r.won,f:r.f||0,vd:r.vd||''});g.recent=g.recent.slice(-8)}
    const m=g&&g.contract?mgrById(g.contract.mgr):null;if(!m)continue;const S2=msp(m);S2.b++;if(S2.p1==null)S2.p1=S2.w||0;S2.p2=S2.p2||0;S2.p3=S2.p3||0;
    if(r.won){S2.w++;if(typeof gemCheck==='function')try{gemCheck(g,m)}catch(e){}}
    const pl=lp102Place(r,nWin);const alive=r.alive!==false&&g.alive!==false;
    if(alive&&pl<=3){S2['p'+pl]=(S2['p'+pl]||0)+1;S2.pts+=LP102_PTS[pl]}}};
/* the Season tab's weekly "+N pts" (only your house's rows are kept there) */
if(typeof wd100Acta96==='function'){wd100Acta96=function(w,abs){const A=w.acta96&&w.acta96[abs];if(!A)return null;let pts=0,best=null;const nW=(A.rows||[]).filter(r=>r.w).length;
  for(const r of A.rows||[]){const dead=/✝|kill|slain|fell|died|dead|death/i.test(String(r.fate||''));const pl=r.w?1:Math.max(1,r.p||99);if(!dead&&pl<=3)pts+=LP102_PTS[pl];const p=r.w?1:r.p||99;if(!best||p<best.p)best={p,n:r.n}}
  return {pts,best,n:(A.rows||[]).length,nW}}}
function lp102Migrate(w){let ch=false;for(const m of (w&&w.mgrs)||[])for(const sp of Object.values(m.spS||{}))if(sp&&sp.p1==null){sp.p1=sp.w||0;sp.p2=sp.p2||0;sp.p3=sp.p3||0;ch=true}return ch}
SAVE_MIGRATIONS.push(['1.02',w=>{lp102Migrate(w)}]);

/* ---------------- M6 · recruiting balance ---------------- */
Object.assign(REC98.acts.ask,{h:1});Object.assign(REC98.acts.watch,{h:1});Object.assign(REC98.acts.cup,{h:1});Object.assign(REC98.acts.study,{h:1});
Object.assign(REC98.acts.trial,{h:REC102.trialH,coin:REC102.trialCoin});REC98.cap=REC102.cap;
rec98Gain=function(g,a){const K=rec98K(g);const P=K.p;const out=[];const w=W_();const add=(k,t)=>{t=Math.min(3,t);if(t>(P[k]||0)&&!out.some(x=>x[0]===k))out.push([k,P[k]||0,t])};
  const ks=STATS.map(x=>x[0]);const seed=`rec102:${w&&w.id}:${g.id}:${w&&w.week}:`;
  const low=(n,max,skip)=>ks.filter(k=>!(skip||[]).includes(k)&&(P[k]||0)<max).sort((x,y)=>(P[x]||0)-(P[y]||0)||(hashStr(seed+x)%997)-(hashStr(seed+y)%997)).slice(0,n);
  if(a==='ask'){for(const k of low(2,2))add(k,(P[k]||0)+1)}
  else if(a==='watch'||a==='cup'){for(const k of REC98.acts[a].st)add(k,(P[k]||0)+1)}
  else if(a==='study'){add('lck',(P.lck||0)+1);for(const k of low(2,3,['lck']))add(k,(P[k]||0)+1)}
  else if(a==='trial'){for(const k of ks)add(k,3)}
  return out};
const REC102_CHEAP=['ask','watch','cup','study'];
function rec102Looked(g){const K=rec98K(g);return REC102_CHEAP.some(a=>K.a[a]!=null)||STATS.some(([k])=>(K.p[k]||0)>0)}
{const base=rec98Can;rec98Can=function(g,a){const r=base.apply(this,arguments);try{if(r&&r[0]&&a==='trial'&&!rec102Looked(g))return [false,sx(g,_T('A trial bout comes after a cheaper look at him: ask around, watch him train or share a cup first.'),_T('A trial bout comes after a cheaper look at her: ask around, watch her train or share a cup first.'))]}catch(e){console.error(e)}return r}}
/* the advisor's pick: the most precision per hour that fits; the trial only when nothing cheaper is left and he is worth it */
function rec102Pph(g,a){const n=rec98Gain(g,a).reduce((s,[,f,t])=>s+t-f,0);return n/Math.max(1,REC98.acts[a].h)}
rec98Next=function(g){try{const ok=REC102_CHEAP.filter(a=>rec98Can(g,a)[0]);
    if(ok.length)return ok.map(a=>[a,rec102Pph(g,a),REC98.acts[a].h]).sort((x,y)=>(y[1]-x[1])||(x[2]-y[2])||(REC102_CHEAP.indexOf(x[0])-REC102_CHEAP.indexOf(y[0])))[0][0];
    if(rec98Can(g,'trial')[0]&&rec102Worth(g))return 'trial'}catch(e){console.error(e)}
  return REC98.order.find(a=>rec98Gain(g,a).length)||null};
/* value for cost: the estimated grade + what the roster lacks, over the asking price; a recruit already looked at is cheaper to finish */
function rec102Value(g,m,w){try{const est=rec98Ovr(g).v;const ros=rosterOf(m).filter(x=>x.alive!==false);const need=(ros.some(x=>x.cls===g.cls)?0:6)+(ros.length<5?4:0);
  const left=rec98Left(w);const K=rec98K(g);const seen=STATS.filter(([k])=>(K.p[k]||0)>0).length;const hrs=left>=3?1:seen?1:.6;
  return (est+need-40)/(askWage(g)+8)*hrs}catch(e){return 0}}
function rec102Best(w,m){w=w||W_();m=m||me();if(!w||!m)return null;let best=null,bv=-1e9;
  for(const g of freeAgents()){if(g.inj||g.auction)continue;const v=rec102Value(g,m,w);if(v>bv){bv=v;best=g}}return best}
function rec102Worth(g){try{const w=W_(),m=me();const fa=freeAgents().filter(x=>!x.inj).map(x=>[x,rec102Value(x,m,w)]).sort((a,b)=>b[1]-a[1]).slice(0,3);return fa.some(([x])=>x===g)}catch(e){return false}}
function rec102Star(w){try{return !!w&&adv98Lv(w,'recruiter')>=REC102.starLv}catch(e){return false}}
function rec102Strip(h){return String(h).replace(/<i class="star85[^"]*"[^>]*>[\s\S]*?<\/i>/g,'').replace(/<i class="adv85b"[^>]*>★<span class="t85">[^<]*<\/span><\/i>/g,'').replace(/ adv74\b/g,'').replace(/ data-adv85="[^"]*"/g,'').replace(/<i class="rc102st"[^>]*>★<\/i>/g,'')}
{const base=recAdvice74;recAdvice74=function(g,m,step){try{if(!rec102Star(W_()))return null}catch(e){}return base.apply(this,arguments)}}
{const base=detailHTML;detailHTML=function(g){const h=base.apply(this,arguments);try{if(typeof h==='string'&&g&&!g.contract&&W_()&&!rec102Star(W_()))return rec102Strip(h)}catch(e){console.error(e)}return h}}

/* ---------------- M9 · team purses by CF ---------------- */
function any102Split(b,P,nw){const res=b.res;if(!res||b.rig)return;const win=new Set(res.winners||[]);if(!win.size)return;const rows=(res.rows||[]).filter(r=>win.has(r.gid));
  const alive=rows.filter(r=>r.alive!==false&&(gById(r.gid)||{}).alive!==false);const tot=alive.reduce((s,r)=>s+Math.max(0,r.f||0),0);
  const Pe=Math.max(1,Math.round(P/nw));const net=(m,p)=>p>0?Math.round(p*(0.5+m.p.greed/300))-Math.max(1,Math.round(p*0.1)):0;const fsh=p=>p>0?Math.max(1,Math.round(p*0.1)):0;
  const split={};const pm=me();
  for(const r of rows){const g=gById(r.gid);if(!g)continue;const lives=alive.includes(r);const Pi=lives?Math.round(tot>0?P*Math.max(0,r.f||0)/tot:P/alive.length):0;split[r.gid]=Pi;
    const m=g.contract?mgrById(g.contract.mgr):null;
    if(m){m.coin+=net(m,Pi)-net(m,Pe);g.purse=Math.max(0,(g.purse||0)+fsh(Pi)-fsh(Pe))}
    const h=b.any100.hire&&b.any100.hire[r.gid];const hm=h&&mgrById(h.by);
    if(hm){const cut=Math.round(Pi*0.5);if(cut>0){hm.coin+=cut;if(hm.isPlayer)tnews(_T`🤝 ${esc(g.name)}, your hired partner, wins — his share comes home: ${coinAmt87('+'+cut)}.`)}}}
  b.any100.split=split;
  try{const mine=rows.filter(r=>{const g=gById(r.gid);return g&&((g.contract&&pm&&g.contract.mgr===pm.id)||(b.any100.hire[r.gid]&&pm&&b.any100.hire[r.gid].by===pm.id))});
    if(mine.length)tnews(_T`👥 The ${esc((EVENTS[b.ev]||{}).n||'')} purse is shared by the winners who walked off the sand, by Crowd Favor earned: ${rows.map(r=>`${esc((gById(r.gid)||{}).name||'?')} ${split[r.gid]?coinAmt87(split[r.gid]):'—'}`).join(' · ')}.`)}catch(e){}}

/* ---------------- M10 · the Council ---------------- */
function lu102Report(w){const out=[];try{const pm=me();if(!w||!pm||w.tutorial||w.dead)return out;
  const wages=rosterOf(pm).reduce((a,g)=>a+((g.contract&&g.contract.wage)||0),0);const run=wages>0?Math.floor(Math.max(0,pm.coin)/wages):99;
  if(pm.coin<0)out.push({k:'debt',u:1,t:_T('the treasury is in debt')});else if(run<3)out.push({k:'run',t:_T`coin for ${run} week${run===1?'':'s'} of wages`});
  const L=w.loan;if(L&&L.amt>0&&(L.due||0)>(L.paid||0))out.push({k:'loan',u:1,t:_T('a loan payment is due')});
  const ch=(w.letters||[]).find(x=>x&&x.rl76&&x.rl76.kind==='chal'&&x.until>=w.week&&!x.read);
  if(ch&&!(w.chal76&&w.chal76.s===w.season&&w.chal76.wk===w.week))out.push({k:'chal',t:_T('a rival challenge is waiting')})}catch(e){console.error(e)}return out}
DK99_TIER['🧭']=2;DK99_CLS['🧭']='k-council';
{const base=weekChecklist;weekChecklist=function(){const I=base.apply(this,arguments);try{const w=W_();const R=lu102Report(w);if(!R.length||!Array.isArray(I))return I;
    const k='consil102:'+R.map(x=>x.k).join(',');const sk=typeof dk99Skips==='function'?dk99Skips(w):[];const skip=sk.includes(k);
    I.unshift({ic:'🧭',txt:_T`<b>Consilium's report</b> — ${R.map(x=>esc(x.t)).join(' · ')}`,btn:`<button class="btn tksm" type="button" data-lu100adv="consilium">${_T`Hear him`}</button>`,done:skip,skipped:skip,k99:k,req99:false})}catch(e){console.error(e)}return I}}
/* a letter only when urgent (debt / a loan payment due), once a week */
function lu102Letter(w){try{if(!w||w.tutorial||w.dead||typeof sendLetter!=='function')return;const R=lu102Report(w).filter(x=>x.u);if(!R.length)return;const key='consil102-'+w.season+'-'+w.week;
  if((w.letters||[]).some(x=>x.key===key))return;
  sendLetter(w,{key,kind:'letter',from:_T('the Consilium'),adv:'consilium',seal:'🏛',until:w.week,act:false,title:_T("Consilium's report: this cannot wait"),
    body:`<p>${_T`Lanista — before anything else this week:`}</p><ul>${R.map(x=>`<li>${esc(x.t)}</li>`).join('')}</ul><p>${_T`Enter fighters on Match Week, mind the wages and pay what is due. Every week in the red costs the house.`}</p>`})}catch(e){console.error(e)}}
{const base=mailLive;mailLive=function(){try{lu102Letter(W_())}catch(e){}return base.apply(this,arguments)}}
/* his head lights only from a letter of his (the urgent report, 66's warning), never from 297's lu2Counsel */
{const base=lu100Lit;lu100Lit=function(){const out=base.apply(this,arguments);try{if(out&&out.consilium&&out.consilium.key==='lu2:consil')delete out.consilium}catch(e){}return out}}
/* his popover: no Buildings section; the report stays */
{const base=lu100PopHTML;lu100PopHTML=function(w,pm,k){let h=base.apply(this,arguments);try{if(k!=='consilium'||!h)return h;const T=document.createElement('template');T.innerHTML=h;const R=T.content;
    const ov=R.querySelector('.lu2ov');const cn=R.querySelector('.cn101');const pop=R.querySelector('#lu100pop');if(cn&&pop)pop.appendChild(cn);if(ov)ov.remove();
    const rep=lu102Report(w);if(pop&&rep.length){const d=document.createElement('div');d.className='lu2b rp102';d.innerHTML=`<div class="lu2bh">⚠ ${_T`This week`}</div><ul>${rep.map(x=>`<li>${esc(x.t)}</li>`).join('')}</ul>`;pop.insertBefore(d,cn&&cn.parentNode===pop?cn:null)}
    return T.innerHTML}catch(e){console.error(e)}return h}}
/* the frieze: the Consilium's face at the bottom left in place of the 🏛 icon; the other five spread along the strip */
{const base=lu100Frieze;lu100Frieze=function(){let h=base.apply(this,arguments);try{if(typeof h!=='string'||!h)return h;const T=document.createElement('template');T.innerHTML=h;const R=T.content;
    const cc=R.querySelector('#council83');const cons=cc&&cc.querySelector('.c83p[data-c83="consilium"]');const em=R.querySelector('.lu100t.k-adv .cap .em');if(!cc||!cons||!em)return h;
    cons.classList.add('c102cons');const top=cc.querySelector('.c101top');em.replaceWith(cons);if(top)top.remove();cc.classList.add('c102');
    const tile=R.querySelector('.lu100t.k-adv');if(tile){tile.classList.add('c102t');if(LU100.pop==='consilium')tile.style.setProperty('--hx','7%')}
    return T.innerHTML}catch(e){console.error(e)}return h}}
/* the Upgrade School tile: every building, by the advisor who runs it */
const LU102={fac:false};
function lu102FacHTML(w,pm){const C=council83(w);const by={};for(const fk of Object.keys(FAC)){const o=lu2Owner(fk);(by[o]=by[o]||[]).push(fk)}
  const busy=lu2Busy(w,pm);const nm=k=>{const a=C.find(x=>x.k===k);return a?esc(a.name):k};const ro=k=>{const a=C.find(x=>x.k===k);return a?esc(a.role):''};
  return `<div class="lu100panel pr101 lu102fac" role="dialog" aria-label="${esc(_T('Upgrade School'))}"><div class="lu102fh"><b>🏛 ${_T`Upgrade School`}</b> ${lu2Grade(pm)}<span class="rc-sub">${busy?_T('the builders are busy this week'):_T('one project a week')} · ${_T`${facSum(pm)} of ${Object.keys(FAC).length*3} levels`}</span><button type="button" class="lu100x" data-lu102fac="0" aria-label="${esc(_T('Close'))}">✕</button></div>
    <div class="lu100pop lu102fb">${Object.entries(by).map(([k,L])=>`<div class="lu2b"><div class="lu2bh">${nm(k)} <span class="rc-sub">${ro(k)}</span></div>${L.map(fk=>lu2Row(w,pm,fk)).join('')}</div>`).join('')}</div></div>`}
{const base=lu100Tiles;lu100Tiles=function(){let h=base.apply(this,arguments);try{h=h.replace(/(<button type="button" class="lu100t k-school") data-lu100adv="consilium"/,'$1 data-lu102fac="1"')}catch(e){}return h}}
window.addEventListener('click',e=>{const t=e.target&&e.target.closest&&e.target.closest('[data-lu102fac]');if(!t||!t.closest('#mgrBody'))return;e.preventDefault();e.stopPropagation();
  LU102.fac=t.dataset.lu102fac==='1';if(LU102.fac&&typeof LU100!=='undefined')LU100.pop=null;if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&LU102.fac&&document.querySelector('#mgrPane .lu102fac')){e.preventDefault();e.stopPropagation();LU102.fac=false;if(typeof MGR_REDRAW==='function')MGR_REDRAW()}},true);

/* ---------------- M13 · Compare, side by side ---------------- */
recCmpHTML=function(){const m=me(),w=W_();const L=(MGR.cmp||[]).map(gById).filter(g=>g&&g.alive!==false);MGR.cmp=L.map(g=>g.id);if(!L.length||!m||!w)return '';
  const col=g=>{const free=!g.contract;const iv=interestOf(g,m);const rank=suitors(g).findIndex(x=>x.m===m)+1;const cl=CLASSES[g.cls];
    let map='';try{const P=typeof mi100Pt==='function'&&g.city?mi100Pt(g.city):null;if(P&&typeof mapInset100==='function')map=mapInset100({w:120,h:70,minW:150,label:_T`${g.city}: home city`,frame:P.off?[6,1,5]:[g.city],pts:[{p:g.city,k:'home',lab:P.off?'':g.city,tip:g.city}]})||''}catch(e){}
    const grades=free&&typeof rc100Grades==='function'?rc100Grades(g):(typeof ratingsHTML==='function'?ratingsHTML(g):'');
    const pers=free&&typeof rc100Pers==='function'?rc100Pers(g,m):'';
    const chips=[`<span class="ch">${esc(cl?cl.name:g.cls)}</span>`,`<span class="ch">${_T`${g.age||'?'} yrs`}</span>`,free?`<span class="ch">${_T`asks ${coinAmt87(askWage(g))}/wk`}</span>`:'',free?`<span class="ch">${_T`interest ${iv}${rank?` · #${rank}`:''}`}</span>`:`<span class="ch">${esc((mgrById(g.contract.mgr)||{}).ludus||'')}</span>`,g.inj?`<span class="ch bad">⚕ ${esc(g.inj.label||'')}</span>`:''].join('');
    return `<section class="cmp102c"><div class="cmp102h"><span class="rc1fr cmp102p"><span class="pic"></span><span class="rc1pp">${gArt(g,'md')}</span></span><div class="cmp102i"><b>${esc(g.name)}</b><div class="cmp102ch">${chips}</div>${map?`<div class="cmp102m">${map}<small>${esc(g.city||'')}</small></div>`:''}</div>
      <button class="btn tksm cmp102x" type="button" data-reccmp="${g.id}" title="${_T`Take out of the comparison`}" aria-label="${_T`Take out of the comparison`}">✕</button></div>
      <div class="cmp102g">${grades}</div>${pers?`<div class="cmp102pe">${pers}</div>`:''}</section>`};
  return `<div class="card2 cmpbox cmp102"><div class="sect" style="margin-top:0">${_T`⇄ Compare`} <span class="rc-sub">${L.length<2?_T('pick one more with ⇄ on a fighter’s card'):_T('side by side')}</span></div><div class="cmp102g2" style="--n:${Math.min(L.length,3)}">${L.map(col).join('')}</div></div>`};

/* ---------------- M15 + M16 · letters ---------------- */
const fa102Btn=attr=>`<div class="fa102r"><button type="button" class="fa102" ${attr}>${_T`File away ✓`}</button></div>`;
function rev102Read(w){const R=w&&w.review;return !!(R&&w.rev102&&w.rev102.s===R.season&&w.rev102.wk===R.wk)}
document.addEventListener('toggle',e=>{const d=e.target;if(!d||!d.matches||!d.matches('details.rev91')||!d.open)return;const w=W_();const R=w&&w.review;if(!R||rev102Read(w))return;w.rev102={s:R.season,wk:R.wk};try{saveWorld(true)}catch(err){}
  const b=document.querySelector('#desk99 .lu100mb b');if(b){const n=Math.max(0,(+b.textContent||0)-1);if(n)b.textContent=n;else b.remove()}},true);
/* the rail oval / "this week": a desk row that comes from a letter already read does not count */
function lu102ReadRow(w,r){try{const R=new Set(w.mailRead||[]);const k=r.ltr||r.key;return r.src==='mail'&&!r.req&&!!k&&/^L:/.test(k)&&R.has(k)}catch(e){return false}}
{const base=ludusTodo73;ludusTodo73=function(){const n=base.apply(this,arguments);try{const w=W_();if(!w||w.dead||typeof desk99Open!=='function')return n;const open=desk99Open();if(open.length!==n)return n;return open.filter(r=>!lu102ReadRow(w,r)).length}catch(e){return n}}}

/* ---------------- the final mgrHTML wrapper ---------------- */
function v102bPost(h,w){const T=document.createElement('template');T.innerHTML=h;const R=T.content;const tab=MGR.tab;
  /* M15: File away ✓ at the bottom right of every letter */
  for(const d of R.querySelectorAll('details.mail[data-mail]')){const b=d.querySelector(':scope>.acts>[data-ltr]');if(!b)continue;const k=b.getAttribute('data-ltr');b.parentNode.replaceWith(dk99Tmpl(fa102Btn(`data-ltr="${esc(k)}"`)))}
  if(tab==='ludus'){const rev=R.querySelector('details.rev91');if(rev){rev.querySelectorAll('.rev99x').forEach(x=>x.remove());if(!rev.querySelector('.fa102'))rev.appendChild(dk99Tmpl(fa102Btn('data-rev99="1"')))}
    /* M16: the Letters count */
    const mb=R.querySelector('#desk99 .lu100mb');if(mb){const n=R.querySelectorAll('#desk99 .dk99lt>details.mail.unread').length+(rev&&!rev102Read(w)?1:0);const b=mb.querySelector('b');if(b)b.remove();if(n)mb.insertAdjacentHTML('beforeend',` <b>${n}</b>`)}
    const sub=R.querySelector('#desk99 .lu100mail .lu100mh .rc-sub');if(sub){const n=R.querySelectorAll('#desk99 .dk99lt>details.mail.unread').length+(rev&&!rev102Read(w)?1:0);sub.textContent=n?_T`${n} unread`:_T('all read')}
    /* M10: the Upgrade School popup */
    if(LU102.fac){const pane=R.querySelector('#mgrPane');const pm=me();if(pane&&pm){pane.appendChild(dk99Tmpl(`<div class="pr101scrim" data-lu102fac="0"></div>`+lu102FacHTML(w,pm)))}}}
  if(tab==='recruit'){
    if(!rec102Star(w)){for(const el of R.querySelectorAll('.star85,.adv85b,.rc102st'))el.remove();for(const el of R.querySelectorAll('.adv74'))el.classList.remove('adv74');for(const el of R.querySelectorAll('[data-adv85]'))el.removeAttribute('data-adv85')}
    else{const best=rec102Best(w,me());const tr=best&&R.querySelector(`#recTable tr[data-mg="sel"][data-id="${CSS.escape(best.id)}"] .r85n`);
      if(tr)tr.insertAdjacentHTML('beforebegin',`<i class="rc102st" title="${esc(_T('★ Your recruiter: the best value for the coin on the market'))}">★</i>`)}}
  return T.innerHTML}
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{const w=W_();if(typeof h==='string'&&w&&!w.dead&&!MGR.view)return v102bPost(h,w)}catch(e){console.error(e)}return h}}
{const base=mgrMigrate;mgrMigrate=function(w){const o=base.apply(this,arguments);try{if(o&&lp102Migrate(o))o._lp102dirty=1}catch(e){console.error(e)}return o}}
{const base=openManager;openManager=async function(){const r=await base.apply(this,arguments);try{const w=W_();if(w&&w._lp102dirty){delete w._lp102dirty;saveWorld()}}catch(e){}return r}}
/* the lesson's Facilities step: the Upgrade School tile now opens the building list */
try{const st=MTUT_STEPS.find(x=>x&&x.k==='fac');if(st){const un0=st.until;st.until=()=>(un0&&un0())||LU102.fac}}catch(e){console.error(e)}

(()=>{const st=document.createElement('style');st.textContent=`
.pd102{white-space:nowrap;font-variant-numeric:tabular-nums}.pd102 small{opacity:.75;font-size:.85em}
.wd100lgt .wd100rh,.wd100lgt .wd100r{grid-template-columns:22px 28px minmax(0,1.5fr) 40px 84px minmax(0,1.2fr) 112px 48px 12px}
@media (max-width:1100px){.wd100lgt .wd100rh,.wd100lgt .wd100r{grid-template-columns:22px 28px minmax(0,1.5fr) 40px 84px minmax(0,1fr) 108px 12px}}
@media (max-width:760px){.wd100lgt .wd100rh,.wd100lgt .wd100r{grid-template-columns:18px 24px minmax(0,1fr) 34px 70px 12px}}
.wd100lgt .c-rec .pd102{font-size:12.5px}
/* M10 the Council strip: Consilium bottom left, the five spread */
.lu100t.k-adv.c102t .cap>.c83p.c102cons{flex:none;width:58px;margin:-26px 4px 0 -2px;position:relative;z-index:2;cursor:pointer}
.lu100t.k-adv.c102t .cap>.c83p.c102cons>b,.lu100t.k-adv.c102t .cap>.c83p.c102cons>.c83r,.lu100t.k-adv.c102t .cap>.c83p.c102cons>.note{display:none}
.lu100t.k-adv.c102t .cap>.c83p.c102cons .c83f{width:54px!important;height:54px!important;border-radius:50%;overflow:hidden;border:2px solid #c9a458;box-shadow:0 2px 6px rgba(0,0,0,.6)}
.lu100t.k-adv.c102t .cap>.c83p.c102cons.lit .c83f{border-color:#ffd77a;box-shadow:0 0 10px #ffd77a99}
#council83.lu100fz.c102 .c83row{justify-content:space-evenly;width:100%}
.lu100pop .rp102 ul{margin:2px 0 0 18px;padding:0;font-size:12.5px;color:#ffcf9a}
.lu102fac{max-width:640px}.lu102fac .lu102fh{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px}.lu102fac .lu102fh .rc-sub{margin-right:auto}
.lu102fac .lu100pop.lu102fb{position:static;inset:auto;width:auto;max-height:min(70vh,560px);overflow:auto;box-shadow:none;margin:0;transform:none}
/* M12 the list fits */
.rc100g #recTable{overflow-x:hidden}.rc100g #recTable table{border-collapse:collapse;border-spacing:0}
.rc100g #recTable .rc1cl{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis}
.rc100g #recTable .r85n{flex:1 1 40px}
#recTable .rc102st{font-style:normal;color:var(--gold2);flex:none;font-size:13px;cursor:help}
@media (min-width:1251px){.rc100g #recTable col.c85r{width:42px}.rc100g #recTable col.c85f{width:34px}.rc100g #recTable col.c85i{width:34px}.rc100g #recTable col.c85a{width:58px}}
/* M13 compare */
.cmp102 .cmp102g2{display:grid;grid-template-columns:repeat(var(--n,2),minmax(0,1fr));gap:10px}
.cmp102c{border:1px solid var(--line2,#5a4636);border-radius:9px;padding:8px;background:linear-gradient(#ffffff08,#0000);min-width:0}
.cmp102h{display:flex;gap:9px;align-items:flex-start}.cmp102p{flex:none;width:74px;height:96px;position:relative;display:block;border-radius:6px;overflow:hidden;border:2px solid #8a6a3a}
.cmp102p .rc1pp,.cmp102p .rc1pp>*{display:block;width:100%;height:100%}.cmp102i{flex:1;min-width:0}.cmp102i>b{font:400 17px var(--display,Georgia,serif);color:#f3e3b8}
.cmp102ch{display:flex;flex-wrap:wrap;gap:4px;margin:3px 0}.cmp102ch .ch{font-size:11.5px;border:1px solid var(--line2,#5a4636);border-radius:9px;padding:0 7px;white-space:nowrap}.cmp102ch .ch.bad{border-color:#b0503a;color:#ffb3a0}
.cmp102m{display:flex;gap:6px;align-items:center}.cmp102m small{font-size:11px;color:var(--muted)}.cmp102x{flex:none}
.cmp102g .gs98{grid-template-columns:1fr 1fr;margin:6px 0}.cmp102pe .pe98{margin-top:4px}
@media (max-width:760px){.cmp102 .cmp102g2{grid-template-columns:1fr}}
/* M15 File away */
.fa102r{display:flex;justify-content:flex-end;padding:2px 8px 6px}
button.fa102{all:unset;cursor:pointer;font-size:12px;color:var(--muted,#b3a58a);text-decoration:underline dotted;text-underline-offset:3px;padding:2px 2px}
button.fa102:hover,button.fa102:focus-visible{color:var(--gold2,#f0cf7d);outline:none}
`;document.head.appendChild(st)})();
