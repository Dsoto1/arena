/* =====================================================================
   87-V67 · v0.67 MANAGER: RECRUITING PORTAL (and the Training Yard's top row)
   =====================================================================
   • Training Yard: the four stat squares (Yard facility, Discipline, Doctores hired, Last week) sit to the right of this
     week's regime on the same row, compact (2 x 2, long notes as hover text).
   ===================================================================== */
/* cut the first balanced <div …>…</div> that starts at index i */
function cutDiv(h,i){let e=h.indexOf('>',i)+1,depth=1;while(depth&&e<h.length){const o=h.indexOf('<div',e),c=h.indexOf('</div>',e);if(c<0)return null;if(o>=0&&o<c){depth++;e=o+4}else{depth--;e=c+6}}return [h.slice(i,e),h.slice(0,i)+h.slice(e)]}
{const base=practiceHTML;practiceHTML=function(){let h=base.apply(this,arguments);try{
  const i=h.indexOf('<div class="roomtiles">');const y=h.indexOf('<div class="yardreg">');if(i<0||y<0)return h;
  const cut=cutDiv(h,i);if(!cut)return h;let [tiles,rest]=cut;
  /* long notes move into the tooltip so the squares stay small */
  tiles=tiles.replace(/<div class="roomtile">([\s\S]*?)<div class="rc-sub">([\s\S]*?)<\/div>/g,(m,a,sub)=>`<div class="roomtile" title="${sub.replace(/<[^>]+>/g,'').replace(/"/g,'&quot;')}">${a}`);
  const y2=rest.indexOf('<div class="yardreg">');const reg=cutDiv(rest,y2);if(!reg)return h;
  const inner=reg[0].replace(/^<div class="yardreg">/,'').replace(/<\/div>$/,'');
  return reg[1].slice(0,y2)+`<div class="yardreg yr2"><div class="yrleft">${inner}</div><div class="yrtiles">${tiles}</div></div>`+reg[1].slice(y2)}catch(e){console.error(e);return h}}}
{const st=document.createElement('style');st.textContent=`
.yardreg.yr2{display:grid;grid-template-columns:minmax(0,auto) minmax(260px,1fr);gap:12px;align-items:end}
.yr2 .yrtiles .roomtiles{grid-template-columns:1fr 1fr;margin:0;gap:6px}
.yr2 .yrtiles .roomtile{padding:5px 8px;gap:6px;cursor:help}.yr2 .yrtiles .rti{font-size:18px}.yr2 .yrtiles .rtv{font-size:15px}.yr2 .yrtiles .rtl{font-size:10px}
@media (max-width:1100px){.yardreg.yr2{grid-template-columns:1fr}}`;document.head.appendChild(st)}
/* ---------- Ludus Flavius in the league: a switch on the career start screen (remembered per browser, on by default) ---------- */
function lfPoolOn(){try{return localStorage.getItem('flavius_lfpool')!=='0'}catch(e){return true}}
{const base=startHTML;startHTML=function(){const h=base.apply(this,arguments);try{if(MGR.view)return h;
  const n=(typeof LUDUS_CACHE!=='undefined'?LUDUS_CACHE:[]).filter(g=>gladActive(g)&&!isCustomCls(g.cls)).length;if(!n)return h;
  const box=`<label class="lfpool"><input type="checkbox" data-lfpool ${lfPoolOn()?'checked':''}> Bring my <b>Ludus Flavius</b> gladiators into the league <span class="rc-sub">(${n} — as free agents, rivals' signings and card fillers; off = a league of its own)</span></label>`;
  return box+h}catch(e){return h}}}
document.addEventListener('change',e=>{const t=e.target;if(t&&t.matches&&t.matches('[data-lfpool]')){try{localStorage.setItem('flavius_lfpool',t.checked?'1':'0')}catch(err){}}});
{const st=document.createElement('style');st.textContent=`.lfpool{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 10px;padding:6px 10px;border:1px solid var(--line2);border-radius:8px}`;document.head.appendChild(st)}
/* =====================================================================
   RECRUITING PORTAL (v0.67)
   • Favourites become a pipeline board: ⭐ Watching (not scouted) → 🔍 Scouted → 🤝 Courting (interest 30+) → ✍ Ready
     (an offer at or near the ask — up to 1.1× — would be accepted now: recReady). Each card carries its one next step as a button
     (Scout / the best pitch / a feast or gift / "Make the offer"), and cards move on their own as the numbers change.
   • The list: "Wants ?" becomes Fit (✓ fills a gap — a class you lack or better than your weakest — and affordable, ~ one
     of the two, ✗ neither; reason on hover); the interest column shows your odds against the leading rival. Filters:
     Affordable · Fits my roster · Courting me.
   • The fighter's card (free agents): three steps — 1 Scout · 2 Court (their two biggest wants as large pitch buttons with the
     expected gain; the rest folded) · 3 Offer (a wage slider with a live acceptance meter from offerVerdict and the leading
     rival's interest marked). Signed-elsewhere (poach) and your own fighters keep their cards.
   ===================================================================== */
const recAfford=(g,m)=>m.coin>=askWage(g)*3;
function recFit(g,m){const ros=rosterOf(m);const cls=new Set(ros.map(x=>x.cls));const weak=ros.length?Math.min(...ros.map(effOvr)):0;const v=estOvr(g).v;
  const gap=!cls.has(g.cls)?'a class you lack':ros.length<3?'a thin roster':v>weak+2?`better than your weakest (${weak})`:'';const aff=recAfford(g,m);
  const mark=gap&&aff?'✓':gap||aff?'~':'✗';return {mark,gap,aff,why:`${gap?'Fills '+gap:'No roster gap'} · ${aff?'affordable':`ask ${askWage(g)}/wk is steep for your treasury`}`}}
function recOdds(g,m){const s=suitors(g);const me1=interestOf(g,m);const rank=s.findIndex(x=>x.m===m)+1;const top=s.find(x=>x.m!==m);
  if(!top)return {txt:`#${rank}`,short:`#${rank}`,lead:true};const d=me1-top.v;const nm=top.m.ludus.replace(/^(Ludus|House of|The) /,'');
  return {txt:d>0?`#${rank} · lead ${nm} by ${d}`:d===0?`#${rank} · tied with ${nm}`:`#${rank} · ${nm} leads by ${-d}`,short:d>0?`#${rank} · +${d} vs ${nm}`:d===0?`#${rank} · tied`:`#${rank} · −${-d} vs ${nm}`,lead:d>0,top}}
/* the cheapest wage (the ask, or 1.1x) that signs them now, or null */
function recReady(g){if(g.contract)return null;for(const x of [1,1.1]){const wage=Math.ceil(askWage(g)*x);if(offerVerdict(g,wage,8,0,false).ok)return wage}return null}
function recStage(g,m){if(g.contract&&g.contract.mgr!==m.id)return 'gone';if(!g.scout)return 'watch';if(recReady(g))return 'ready';return interestOf(g,m)>=30?'court':'scouted'}
function bestPitch(g,m){if(!g.scout)return null;return g.motives.map(([k,wt])=>({k,wt,sc:mgrScore(m,k,g)})).filter(x=>x.sc>=35).sort((a,b)=>b.wt*b.sc-a.wt*a.sc)[0]||null}
const pitchGain=(g,m,k)=>{const sc=mgrScore(m,k,g);const wt=(g.motives.find(x=>x[0]===k)||[0,0])[1];if(!wt)return '+1–3';if(sc<35)return `−${3}–${6}`;return `+~${Math.round(4+wt*28*(sc/100))}`};
function nextStep(g,m){const w=W_();const st=recStage(g,m);
  if(st==='watch')return `<button class="btn tksm primary" type="button" data-mg="scout" data-id="${g.id}" ${MGR.busy?'disabled':dis(recGate(g,'scout'),needHrs(w,3),needCoin(m,scoutCost(g)))}>🔍 Scout<small>3 h · ${scoutCost(g)}c</small></button>`;
  if(st==='ready')return `<button class="btn tksm primary" type="button" data-mg="sel" data-id="${g.id}" data-offer="1">✍ Make the offer<small>~${recReady(g)}/wk signs</small></button>`;
  if(st==='gone')return `<span class="rc-sub">signed by ${esc(mgrById(g.contract.mgr).ludus)}</span>`;
  const bp=bestPitch(g,m);const feastOK=!(g.visits[m.id]&&w.week-g.visits[m.id]<3);
  if(bp&&pitchesLeft()>0&&!recGate(g,'pitch')[0])return `<button class="btn tksm primary" type="button" data-mg="pitch" data-id="${g.id}|${bp.k}" ${dis(needHrs(w,1))}>🗣 Pitch ${MOTIVES[bp.k][0]}<small>1 h · ${pitchGain(g,m,bp.k)}</small></button>`;
  if(feastOK&&!recGate(g,'visit')[0])return `<button class="btn tksm" type="button" data-mg="visit" data-id="${g.id}" ${dis(needHrs(w,4),needCoin(m,visitCost(g)))}>🍷 Feast<small>4 h · ${visitCost(g)}c</small></button>`;
  return `<button class="btn tksm" type="button" data-mg="gift2" data-id="${g.id}" ${dis(recGate(g,'gift'),[g.giftWk&&g.giftWk[m.id]&&w.week-g.giftWk[m.id]<2,'A gift landed too recently.'],needHrs(w,2),needCoin(m,giftCost(g)))}>🎁 Gift<small>2 h · ${giftCost(g)}c</small></button>`}
const REC_COLS=[['watch','⭐ Watching','scout them to learn what they want'],['scouted','🔍 Scouted','court what they care about'],['court','🤝 Courting','keep their interest climbing'],['ready','✍ Ready to sign','an offer would land now']];
function pipelineHTML(){const w=W_(),m=me();const favs=w.glads.filter(g=>g.alive&&g.favd&&!(g.contract&&g.contract.mgr===m.id));
  const card=g=>{const o=recOdds(g,m);return `<div class="pcard ${MGR.sel===g.id?'me':''}" data-mg="sel" data-id="${g.id}"><div class="pchd">${gArt(g,'xs')}<div><b>${esc(g.name)}</b><span class="rc-sub">${CLASSES[g.cls]?CLASSES[g.cls].name:''} · ${estOvr(g).txt} · ask ${askWage(g)}</span></div><button class="pstar" type="button" data-mg="fav" data-id="${g.id}" title="Remove from your board">★</button></div>
    <div class="pmeter"><i style="width:${interestOf(g,m)}%"></i></div><div class="rc-sub pod ${o.lead?'lead':'trail'}">${esc(o.short)}</div><div class="pnext">${nextStep(g,m)}</div></div>`};
  const by={};for(const g of favs)(by[recStage(g,m)]=by[recStage(g,m)]||[]).push(g);
  return `<div class="card2 pipeline"><div class="sect" style="margin-top:0">★ Your recruiting board <span class="rc-sub">${favs.length?`${favs.length} on the board · tap ☆ in the list to add`:'tap ☆ beside a fighter to put them on your board'}</span></div>
    ${favs.length?`<div class="pcols">${REC_COLS.map(([k,t,sub])=>`<div class="pcol"><div class="pcolhd"><b>${t}</b> <span class="rc-sub">${(by[k]||[]).length}</span><div class="rc-sub">${sub}</div></div>${(by[k]||[]).sort((a,b)=>interestOf(b,m)-interestOf(a,m)).map(card).join('')}</div>`).join('')}</div>${(by.gone||[]).length?`<div class="rc-sub">Signed elsewhere: ${by.gone.map(g=>`<a href="#" data-mg="sel" data-id="${g.id}">${esc(g.name)}</a>`).join(', ')}</div>`:''}`:''}</div>`}
/* the list: the board replaces the old Favourites box; Fit and Odds; the three filters */
MGR.rf=MGR.rf||{};
{const base=recruitHTML;recruitHTML=function(){let h=base.apply(this,arguments);try{const w=W_(),m=me();if(MGR.filter==='mine')return h;
  const fb=h.indexOf('<div class="card2 favbox">');if(fb>=0){const c=cutDiv(h,fb);if(c)h=c[1]}
  h=h.replace('<div class="mgrid"><div>',`<div class="mgrid"><div>${pipelineHTML()}`);
  h=h.replace('<th>Wants</th>','<th title="✓ fills a roster gap and is affordable · ~ one of the two · ✗ neither">Fit</th>');
  h=h.replace(/(<tr class="[^"]*" data-mg="sel" data-id="([^"]+)"[\s\S]*?<\/td><td>[\s\S]*?<\/td>)<td class="rc-sub">[\s\S]*?<\/td>(<td style="min-width:110px"><div class="meter"><i style="width:\d+%"><\/i><\/div>)<span class="rc-sub">[\s\S]*?<\/span>/g,(all,pre,id,meter)=>{const g=gById(id);if(!g)return all;const f=recFit(g,m),o=recOdds(g,m);
    return `${pre}<td><span class="fitchip f${f.mark==='✓'?'y':f.mark==='~'?'m':'n'}" title="${esc(f.why)}">${f.mark}</span></td>${meter}<span class="rc-sub ${o.lead?'lead':'trail'}">${interestOf(g,m)} · ${esc(o.txt)}${m.fame<reqFame(g)?' · 🔒':''}</span>`});
  /* filters */
  const on=MGR.rf;const act=Object.keys(on).filter(k=>on[k]);
  if(act.length)h=h.replace(/<tr class="[^"]*" data-mg="sel" data-id="([^"]+)"[\s\S]*?<\/tr>/g,(row,id)=>{const g=gById(id);if(!g)return row;const f=recFit(g,m);
    if(on.aff&&!f.aff)return '';if(on.fit&&!f.gap)return '';if(on.court&&interestOf(g,m)<30)return '';return row});
  const chips=`<div class="seg recflt"><span class="lbl">Show</span>${[['aff','💰 Affordable'],['fit','🧩 Fits my roster'],['court','🤝 Courting me']].map(([k,l])=>`<button type="button" data-recf="${k}" class="${on[k]?'on':''}">${l}</button>`).join('')}</div>`;
  h=h.replace('<input type="search" id="recQ"',chips+'<input type="search" id="recQ"')}catch(e){console.error(e)}return h}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-recf]');if(!b)return;e.preventDefault();MGR.rf[b.dataset.recf]=!MGR.rf[b.dataset.recf];if(typeof MGR_REDRAW==='function')MGR_REDRAW()});
document.addEventListener('click',e=>{const b=e.target.closest('[data-offer]');if(b)MGR.recStep=3},true);
/* the fighter's card: three steps for free agents */
function recStepNow(g,m){return !g.scout?1:recReady(g)?3:2}
{const base=detailHTML;detailHTML=function(g){const w=W_(),m=me();if(!g||g.contract)return base.apply(this,arguments);try{
  const full=base.apply(this,arguments);const iv=interestOf(g,m);const s=suitors(g).slice(0,4);const now=recStepNow(g,m);
  if(MGR.recFor!==g.id){MGR.recFor=g.id;MGR.recStep=null}const step=MGR.recStep||now;
  const head=full.slice(0,full.indexOf('<div class="sect">'));const hrs=w.hours;
  const stepper=`<div class="rsteps">${[[1,'Scout',!!g.scout],[2,'Court',now>=3],[3,'Offer',false]].map(([n,l,done])=>`<button type="button" class="rstep ${step===n?'cur':''} ${done?'done':''}" data-recstep="${n}">${done?'✓':n} ${l}</button>`).join('')}</div>`;
  const wants=g.scout?g.motives.map(([k,wt])=>`<div class="want" title="${esc(MOT_ADVICE[k]||'')}">${gradeHTML(mgrScore(m,k,g))}<b>${MOTIVES[k][0]}</b><span class="rc-sub">${Math.round(wt*100)}%</span></div>`).join(''):'';
  const rep=g.report;
  const s1=`<div class="rpane"><p class="rc-sub" style="margin:0 0 6px">${g.scout?'Scouted — you know what they want and how they grade your house.':'Six sparring bouts in your ludus reveal what they want, how they grade you, and how they really fight.'}</p>
    ${g.scout?`<div class="wants">${wants}</div>`:''}${rep?`<div class="rc-stats" style="margin-top:6px"><span><b>${rep.win}/${rep.n}</b>wins</span><span><b>${rep.surv}/${rep.n}</b>survived</span><span><b>${rep.cf}</b>avg CF</span><span><b>${rep.dmg}</b>dmg</span></div>`:''}
    <div class="acts" style="margin-top:6px"><button class="btn ${g.scout?'':'primary'}" type="button" data-mg="scout" data-id="${g.id}" ${MGR.busy?'disabled':dis(recGate(g,'scout'),needHrs(w,3),needCoin(m,scoutCost(g)))}>${g.scout?'Scout again':'🔍 Scout'}<small>3 h · ${scoutCost(g)} coin</small></button>${`<button class="btn" type="button" data-mg="trial" data-id="${g.id}" ${MGR.busy?'disabled':dis(recGate(g,'trial'),needHrs(w,3),needCoin(m,4))}>Trial bout<small>3 h · 4 coin · trust + a full scout</small></button>`}</div></div>`;
  const ranked=(g.scout?g.motives.map(([k,wt])=>({k,wt,sc:mgrScore(m,k,g)})).sort((a,b)=>b.wt-a.wt):[]);const top2=ranked.slice(0,2).map(x=>x.k);
  const pb=(k,big)=>`<button class="btn ${big?'pbig':''}" type="button" data-mg="pitch" data-id="${g.id}|${k}" ${hrs<1?'disabled':dis(recGate(g,'pitch'),[pitchesLeft()<=0,`All ${PITCH_MAX} of this week's pitches are spent.`])}>${gradeHTML(mgrScore(m,k,g))} ${MOTIVES[k][0]}<small>1 h · ${g.scout?pitchGain(g,m,k):'unknown — scout first'}</small></button>`;
  const s2=`<div class="rpane"><div class="sect" style="margin-top:0">Pitch <span class="rc-sub">${pitchesLeft()} of ${PITCH_MAX} pitches left this week · one per recruit</span></div>
    ${g.scout?`<div class="acts">${top2.map(k=>pb(k,true)).join('')}</div><details class="morep"><summary class="rc-sub">Other pitches</summary><div class="acts">${Object.keys(MOTIVES).filter(k=>!top2.includes(k)).map(k=>pb(k,false)).join('')}</div></details>`:`<div class="acts">${Object.keys(MOTIVES).map(k=>pb(k,false)).join('')}</div>`}
    <div class="sect">Win them over</div><div class="acts"><button class="btn" type="button" data-mg="visit" data-id="${g.id}" ${dis(recGate(g,'visit'),[g.visits[m.id]&&w.week-g.visits[m.id]<3,'They feasted with you recently — every 3 weeks.'],needHrs(w,4),needCoin(m,visitCost(g)))}>🍷 Host a feast<small>4 h · ${visitCost(g)} coin</small></button><button class="btn" type="button" data-mg="gift2" data-id="${g.id}" ${dis(recGate(g,'gift'),[g.giftWk&&g.giftWk[m.id]&&w.week-g.giftWk[m.id]<2,'A gift landed too recently — every 2 weeks.'],needHrs(w,2),needCoin(m,giftCost(g)))}>🎁 Send a gift<small>2 h · ${giftCost(g)} coin</small></button></div>
    <div class="sect">Suitors</div>${s.map(x=>`<div class="suit"><span style="color:${x.m.color}">${esc(x.m.ludus)}${x.m.isPlayer?' (you)':''}</span><div class="meter"><i style="width:${x.v}%"></i></div><span class="n">${x.v}</span></div>`).join('')}</div>`;
  const ask=askWage(g),lo=Math.max(1,Math.floor(ask*0.8)),hi=Math.ceil(ask*1.8),start=recReady(g)||ask;
  const s3=`<div class="rpane"><div class="ofrow"><label>Wage <b id="ofWageV">${start}</b>/wk</label><input type="range" id="ofWage" min="${lo}" max="${hi}" value="${start}" step="1"></div>
    <div class="ofscale"><span>${lo}</span><span>ask ${ask}</span><span>${hi}</span></div>
    <div class="bslip"><label>Weeks <select class="tin" id="ofWeeks" style="width:auto"><option>4</option><option selected>8</option><option>12</option></select></label><label>Bonus <input type="number" class="tin" id="ofBonus" value="0" min="0" style="width:5em"></label>
      <label style="font-size:12px"><input type="checkbox" id="ofPledge"> Pledge the main event (+12)</label></div>
    <div id="ofMeter" class="ofmeter"></div>
    <div class="acts"><button class="btn primary" type="button" data-mg="offer" data-id="${g.id}" ${hrs<1?'disabled':dis(recGate(g,'offer'))}>✍ Offer the contract<small>1 h · one offer per recruit a week</small></button></div></div>`;
  return head+stepper+[s1,s2,s3][step-1]+'</div>'}catch(e){console.error(e);return base.apply(this,arguments)}}}
/* the live acceptance meter */
function ofMeterUpdate(){const el=document.getElementById('ofMeter');if(!el)return;const g=gById(MGR.sel);if(!g)return;const m=me();
  const wage=+(document.getElementById('ofWage')||{}).value||askWage(g),weeks=+(document.getElementById('ofWeeks')||{}).value||8,bonus=Math.max(0,+(document.getElementById('ofBonus')||{}).value||0),pledge=!!(document.getElementById('ofPledge')||{}).checked;
  const v=offerVerdict(g,wage,weeks,bonus,pledge);const pull=coinPull(g,wage+bonus/Math.max(1,weeks));const mine=interestOf(g,m)+(pledge?12:0)+pull;const top=suitors(g).find(x=>x.m!==m);
  const need=starsOf(effOvr(g))<=2?40:52;const lvl=v.ok?'yes':mine>=need-6&&(!top||mine>=top.v-4)?'close':'no';
  const wv=document.getElementById('ofWageV');if(wv)wv.textContent=wage;
  el.className='ofmeter '+lvl;el.innerHTML=`<div class="ofbar"><i style="width:${Math.min(100,mine)}%"></i>${top?`<u style="left:${Math.min(100,top.v)}%" title="${esc(top.m.ludus)}: ${top.v}"></u>`:''}<s style="left:${need}%" title="the interest they need"></s></div>
    <div><b>${lvl==='yes'?'✓ They would sign':lvl==='close'?'≈ Close':'✗ Not yet'}</b> <span class="rc-sub">your pull ${mine} (money +${pull}) · they need ${need}${top?` · ${esc(top.m.ludus)} at ${top.v}`:''}</span></div>${v.ok?'':`<div class="rc-sub">${esc(v.why)}</div>`}`}
document.addEventListener('input',e=>{if(e.target&&['ofWage','ofBonus'].includes(e.target.id))ofMeterUpdate()});
document.addEventListener('change',e=>{if(e.target&&['ofWeeks','ofPledge'].includes(e.target.id))ofMeterUpdate()});
document.addEventListener('click',e=>{const b=e.target.closest('[data-recstep]');if(!b)return;e.preventDefault();MGR.recStep=+b.dataset.recstep;if(typeof MGR_REDRAW==='function')MGR_REDRAW()});
setInterval(()=>{const el=document.getElementById('ofMeter');if(el&&!el.dataset.init){el.dataset.init=1;ofMeterUpdate()}},300);
{const st=document.createElement('style');st.textContent=`
.pipeline .pcols{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}@media (max-width:900px){.pipeline .pcols{grid-template-columns:1fr 1fr}}
.pcol{background:rgba(255,255,255,.02);border:1px solid var(--line2);border-radius:8px;padding:6px;min-height:60px}.pcolhd{margin-bottom:6px}.pcolhd .rc-sub{font-size:10.5px}
.pcard{border:1px solid var(--line2);border-radius:7px;padding:6px;margin-bottom:6px;cursor:pointer;background:var(--panel2)}.pcard.me{border-color:var(--gold)}
.pchd{display:flex;gap:6px;align-items:center}.pchd>div{flex:1;min-width:0}.pchd b{display:block;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pchd .rc-sub{font-size:10.5px}
.pstar{all:unset;cursor:pointer;color:var(--gold2);font-size:15px}.pmeter{height:4px;background:var(--line2);border-radius:2px;margin:5px 0 2px;overflow:hidden}.pmeter i{display:block;height:100%;background:#d9a441}
.pnext{margin-top:4px}.pnext .btn{width:100%;font-size:12px;padding:4px 6px}.pnext .btn small{font-size:10px}.pod{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:11px}.lead{color:#9cc46e!important}.trail{color:#d9a441!important}
.fitchip{display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;border-radius:50%;font-weight:700;cursor:help}.fitchip.fy{background:rgba(127,174,95,.25);color:#b7d59d}.fitchip.fm{background:rgba(217,164,65,.2);color:#f0cf7d}.fitchip.fn{background:rgba(201,86,74,.18);color:#e89a8f}
.recflt{flex-wrap:wrap}
.rsteps{display:flex;gap:4px;margin:8px 0}.rstep{flex:1;border:1px solid var(--line2);background:none;color:var(--muted);border-radius:16px;padding:4px 6px;cursor:pointer;font-size:12.5px}
.rstep.cur{border-color:var(--gold);color:var(--gold2);background:rgba(240,207,125,.08)}.rstep.done{color:#9cc46e}
.rpane{border:1px solid var(--line2);border-radius:8px;padding:8px}.wants{display:grid;gap:3px}.want{display:flex;gap:8px;align-items:center;font-size:13px;cursor:help}
.pbig{flex:1 1 45%;font-size:15px;padding:8px}.morep{margin-top:6px}.suit{display:grid;grid-template-columns:1fr 90px 26px;gap:6px;align-items:center;font-size:12.5px}
.ofrow{display:flex;gap:10px;align-items:center}.ofrow input[type=range]{flex:1}.ofscale{display:flex;justify-content:space-between;font-size:10.5px;color:var(--muted);margin:0 0 6px}
.ofmeter{margin:8px 0;padding:6px 8px;border-radius:7px;border:1px solid var(--line2)}.ofmeter.yes{border-color:rgba(127,174,95,.6)}.ofmeter.close{border-color:rgba(217,164,65,.6)}.ofmeter.no{border-color:rgba(201,86,74,.45)}
.ofbar{position:relative;height:8px;background:var(--line2);border-radius:4px;margin-bottom:5px}.ofbar i{position:absolute;left:0;top:0;bottom:0;border-radius:4px;background:#d9a441}.ofmeter.yes .ofbar i{background:#7fae5f}
.ofbar u{position:absolute;top:-3px;bottom:-3px;width:3px;background:#c9564a;border-radius:2px}.ofbar s{position:absolute;top:-3px;bottom:-3px;width:2px;background:#e9e5dc;opacity:.7}`;document.head.appendChild(st)}
/* ---------- Juggernaut (Play Now setup): exactly one Juggernaut, everyone else is the Team. The rows open with seat 1 as the
   Juggernaut; choosing Juggernaut for a seat moves the role there (the old one joins the Team); the last Juggernaut can't be
   switched to the Team — pick another seat as the Juggernaut instead. ---------- */
function juggNormalize(n){const S8=CFG.seats.slice(0,n);let j=S8.findIndex(s=>s.team==='J');if(j<0)j=0;S8.forEach((s,i)=>s.team=i===j?'J':'T')}
{const base=seatRows;seatRows=function(ev,n){try{if(ev&&ev.teams==='jugg')juggNormalize(n)}catch(e){}return base.apply(this,arguments)}}
document.addEventListener('change',e=>{const t=e.target;if(!t||!/^team\d$/.test(t.id||''))return;const ev=EVENTS[CFG.ev];if(!ev||ev.teams!=='jugg')return;
  const i=+t.id.slice(4);const sels=[...document.querySelectorAll('select[id^="team"]')].filter(x=>/^team\d$/.test(x.id));
  if(t.value==='J'){for(const s of sels){const k=+s.id.slice(4);if(k!==i){s.value='T';if(CFG.seats[k])CFG.seats[k].team='T'}}CFG.seats[i].team='J'}
  else if(!sels.some(s=>s.value==='J')){t.value='J';CFG.seats[i].team='J';try{mToast('Someone has to be the Juggernaut — choose Juggernaut on another seat to hand the role over.')}catch(err){}}});
/* ---------- the Ludus record: 🛣 Send on the Road (or ⚔ Walk stage) joins the record's action row, beside "Continue as a
   missio", instead of floating in the corner ---------- */
{const base=ludusDetail;ludusDetail=function(g){let h=base.apply(this,arguments);try{
  const m=h.match(/<button type="button" class="btn roadsend[^"]*"[^>]*>[\s\S]*?<\/button>/);if(!m)return h;
  const i=h.indexOf('<div class="mbtns"');if(i<0)return h;const j=h.indexOf('</div>',i);if(j<0)return h;
  const btn=m[0].replace('class="btn roadsend','class="btn roadsend inrow').replace(/>(🛣 Send on the Road)</,'>$1<small>win the twelve arenas in order</small><').replace(/>(⚔ Walk stage[^<]*)</,'>$1<small>opens the next stage</small><');
  h=h.replace(m[0],'');return h.slice(0,h.indexOf('</div>',h.indexOf('<div class="mbtns"')))+btn+h.slice(h.indexOf('</div>',h.indexOf('<div class="mbtns"')))}catch(e){return h}}}
{const st=document.createElement('style');st.textContent=`.roadsend.inrow{position:static!important;float:none!important;margin:0!important}`;document.head.appendChild(st)}
