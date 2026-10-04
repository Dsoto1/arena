/* =====================================================================
   144-V85REC · v0.85 — the recruiting tidy (Virgilante, approved 2026-10-04)
   =====================================================================
   Manager → Recruiting (pipelineHTML 87-v67, recPlanHTML 101-rec73, the free-agent list #recTable, the free agent's card
   detailHTML with ratings 66/95 and the advisor 105-mgr74):
   1. THE WEEK'S PLAN (recPlanHTML replaced) folds to one line "📜 This week: N scouting · M courting planned" (N = recruits
      on the board still to scout, M = the rest); ▸ unfolds the old per-recruit rows. Folded by default; remembered in
      localStorage flavius_recplan85. No hours on it — hours live in the banner and the rail only.
   2. THE BOARD = the Roster's barracks wall (143-v84roster look): lanes on dark stone, each recruit a small wooden tablet
      `.pcard.pt85` (72px: portrait xs, the FULL name wrapping to two lines — a long name with a "nickname" shows the nickname +
      family name, the full name on hover —, ~rating, ask, rank chip; 📌 top-right = on your board (data-mg="fav", tap to
      remove); then the action row: the next step on ONE line = the very button nextStep() builds (same data-mg / data-id /
      data-offer, so every handler still works), label + small cost after it ("🔍 Scout · 3 h · 4c", "🗣 Pitch [ARENA TIME] ·
      1 h · +~10", "✍ Sign · ~6/wk"), a "★ advised" badge on it (just ★ on narrow tablets; the advisor's reason on hover), and
      ⋯ as a 28px square beside it (opens the card). Lanes with recruits grid their tablets (auto-fill, minmax(168px,1fr)) and
      grow with their head count; EMPTY lanes collapse to narrow carved posts ("🤝 Courting · 0", the lane's hint on hover).
      Class names .pcol / .pcard stay (tests and older hooks read them).
      Pitch TOPICS are bordered tags (the log's .phtag look, `motTag85`, one tone per motive: coin gold, glory amber, honor
      teal, spectacle violet, training green, home steel, arena time red) on the board, the card's pitch buttons and wants.
      Picking a fighter (tablet, ⋯, list row) is LOCAL: only the card column + the .me marks change, no MGR_REDRAW (repeated
      ⋯ clicks made the rail flicker); the one already open just scrolls into view on stacked layouts.
   3. THE LIST: each row is ONE line — ☆, portrait, name + tags, small class · age · city, stars + ~rating, Fit, a thin
      interest bar with "41 #1" (the full "#rank · X leads by N" on hover), ask. Rows ≤ 44px; table-layout fixed.
   4. 🆕 new = arrived THIS week only (gTags wrapper; the starting pool of week 1 is not "new").
   5. The free agent's card before any scouting: the five "?" rating rows become one line "📊 Ratings: scout to see".
   6. The advisor's pick: no separate ".advise74" box — the suggested button wears a "★ advised" badge (`.star85`) and the
      reason as its tooltip (data-adv85 + title).
   7. The filter rows (tabs · Sort · Show · Search) are one compact toolbar `.rtb85`.
   8. Phones: tablets keep a fixed height (no squash), one per row ≤600px; empty lanes = one-line headers; list rows hide
      the small class line and the rank text before anything wraps; no sideways scroll.
   9. THE LANISTA'S HOURS: the weekly pool w.hours is named "the lanista's hours" everywhere the player reads it (direct edits
      in 11/17/36/70/95); the 📯 Promote panel shows "⏳ N h of the lanista's time left this week" (promoteCardHTML wrapper).
   Test: tv85r.
   ===================================================================== */
/* 4 · new = this week's arrivals (weeks are absolute; arrivals carry debut.wk = the week they enter) */
const isNew85=g=>{const w=W_();return !!(w&&g&&g.debut&&g.debut.wk===w.week&&w.week>1)};
{const base=gTags;gTags=function(g){let h=base.apply(this,arguments);try{h=h.replace(/<span class="badge good" title="Arrived in the league this week or last">🆕 new<\/span>/,'');
  if(isNew85(g))h+='<span class="badge good new85" title="Arrived in the league this week">🆕 new</span>'}catch(e){}return h}}
/* the name on a tablet: the full name; when it is long and has a "nickname", the nickname + family name */
function recName85(g){const n=String(g.name||'');if(n.length<=20)return n;const q=n.match(/"([^"]+)"/);if(!q)return n;const rest=n.replace(/\s*"[^"]+"\s*/,' ').trim().split(/\s+/);return `"${q[1]}" ${rest[rest.length-1]||''}`.trim()}
/* the pitch topic as a bordered tag (the log's .phtag look), one tone per motive */
const motTag85=k=>MOTIVES[k]?`<span class="phtag mt85 mt85-${k}" title="${esc(MOTIVES[k][1])}">${esc(MOTIVES[k][0])}</span>`:'';
/* the next step on ONE line: the very button nextStep() builds (same data-mg / data-id / data-offer), label + small cost after it,
   the topic of a pitch as its tag; ⋯ = a small square beside it (opens the card with every option) */
function recStep85(g,m){const h=nextStep(g,m);const b=h.match(/<button ([^>]*)>([\s\S]*?)<\/button>/);if(!b)return `<span class="pg85">${h}</span>`;
  let attrs=b[1];const inner=b[2];let small=((inner.match(/<small>([\s\S]*?)<\/small>/)||[])[1]||'').replace(/<[^>]*>/g,'');
  const label=inner.replace(/<small>[\s\S]*?<\/small>/,'').replace(/<[^>]*>/g,'').trim();const mg=(attrs.match(/data-mg="([^"]+)"/)||[])[1]||'';
  let lab=esc(label);if(/data-offer=/.test(attrs)){lab=_T('✍ Sign');small=small.replace(/ signs$/,'')}if(mg==='pitch'){const k=(attrs.match(/data-id="[^"|]*\|(\w+)"/)||[])[1];if(k&&MOTIVES[k])lab=_T`🗣 Pitch ${motTag85(k)}`}
  attrs=attrs.replace(/class="btn([^"]*)"/,(x,c)=>_T`class="btn pst85${c.replace(/\btksm\b/,'')}"`);
  const tip=`${label}${small?' · '+small:''}`;
  attrs=/\btitle="/.test(attrs)?attrs.replace(/title="([^"]*)"/,(x,t)=>`title="${esc(tip)} — ${t}"`):attrs+_T` title="★ Advisor suggests: ${esc(tip)}"`;
  const why=(()=>{try{const a=typeof recAdvice74==='function'?recAdvice74(g,m,recStepNow(g,m)):null;return a?a[1]:_T('The next step on the way to signing them.')}catch(e){return ''}})();
  return `<button ${attrs}><span class="pl85b">${lab}</span>${small?`<small> · ${esc(small)}</small>`:''}<i class="adv85b" title="${_T`★ Advisor suggests — ${esc(why)}`}">★<span class="t85"> advised</span></i></button><button class="btn pmo85" type="button" data-mg="sel" data-id="${g.id}" title="${_T`Every option for ${esc(g.name)}`}">⋯</button>`}
/* 2 · the board as the barracks wall */
function pipelineHTML(){const w=W_(),m=me();const favs=w.glads.filter(g=>g.alive&&g.favd&&!(g.contract&&g.contract.mgr===m.id));
  const card=g=>{const o=recOdds(g,m);const iv=interestOf(g,m);const nm=recName85(g);const st=recStage(g,m);
    const chip=String(o.short||'').replace(/ vs .*$/,'').replace(' · ',' ');
    return `<div class="pcard pt85 st85-${st} ${MGR.sel===g.id?'me':''}" data-mg="sel" data-id="${g.id}" title="${esc(g.name)} · ${esc(o.txt)}"><div class="pa85p">${gArt(g,'xs')}</div>
      <b class="pn85${nm.length>22?' long85 xl85':nm.length>17?' long85':''}">${esc(nm)}</b><span class="ps85">${_T`<b>${estOvr(g).txt}</b><span>ask ${askWage(g)}</span>`}<span class="pr85 ${o.lead?'lead':'trail'}">${esc(chip.split(' ')[0])}</span></span>
      <button class="pin85" type="button" data-mg="fav" data-id="${g.id}" title="${_T`On your board — tap to remove`}">📌</button><div class="px85">${recStep85(g,m)}</div><i class="pm85"><i style="width:${iv}%"></i></i></div>`};
  const by={};for(const g of favs)(by[recStage(g,m)]=by[recStage(g,m)]||[]).push(g);
  const lane=([k,t,sub])=>{const L=(by[k]||[]).sort((a,b)=>interestOf(b,m)-interestOf(a,m));
    return L.length?`<div class="pcol pl85" style="--n:${L.length}"><div class="pcolhd" title="${esc(sub)}"><b>${t} · ${L.length}</b></div><div class="pg85l">${L.map(card).join('')}</div></div>`
      :`<div class="pcol pl85 ppost85" title="${esc(t.replace(/^\S+\s/,''))}: ${esc(sub)}"><div class="pcolhd"><b>${t} · 0</b></div></div>`};
  return `<div class="card2 pipeline pw85"><div class="sect" style="margin-top:0">${_T`★ Your recruiting board`} <span class="rc-sub">${favs.length?_T`${favs.length} on the board · tap ☆ in the list to add`:_T('tap ☆ beside a fighter to put them on your board')}</span></div>
    ${favs.length?`<div class="pcols pwall85">${REC_COLS.map(lane).join('')}</div>${(by.gone||[]).length?`<div class="rc-sub" style="margin-top:4px">${_T`Signed elsewhere: ${by.gone.map(g=>`<a href="#" data-mg="sel" data-id="${g.id}">${esc(g.name)}</a>`).join(', ')}`}</div>`:''}`:''}</div>`}
/* 1 · the week's plan on one line */
function recPlanOpen85(){try{return localStorage.getItem('flavius_recplan85')==='1'}catch(e){return false}}
{const base=recPlanHTML;recPlanHTML=function(){const h=base.apply(this,arguments);if(!h)return h;try{const w=W_(),m=me();
  const board=w.glads.filter(g=>g.alive!==false&&g.favd&&!g.contract);const sc=board.filter(g=>recStage(g,m)==='watch').length,co=board.length-sc;
  const i=h.indexOf('</summary>'),j=h.lastIndexOf('</details>');const rows=i>=0&&j>i?h.slice(i+10,j):'';
  return `<details class="card2 rplanbox rp85" ${recPlanOpen85()?'open':''}><summary class="rp85s"><span class="rp85a">▸</span> ${_T`📜 <b>This week:</b> ${sc} scouting · ${co} courting planned`}</summary><div class="rp85b">${rows}</div></details>`}catch(e){console.error(e);return h}}}
document.addEventListener('toggle',e=>{const t=e.target;if(t&&t.classList&&t.classList.contains('rp85'))try{localStorage.setItem('flavius_recplan85',t.open?'1':'0')}catch(err){}},true);
/* 3 + 7 · the list: one line per fighter; the toolbar */
{const base=recruitHTML;recruitHTML=function(){let h=base.apply(this,arguments);try{const w=W_(),m=me();
  h=h.replace('<div class="acts" style="margin-bottom:8px"><div class="seg">','<div class="acts rtb85" style="margin-bottom:8px"><div class="seg">');
  for(const [k,full,short] of [['signed',_T('Signed elsewhere'),_T('Signed')],['targets',_T('Interested in you'),_T('Interested')],['mine',_T('Your stable'),_T('Stable')]])h=h.replace(new RegExp(`(data-mg="filter" data-id="${k}" class="[^"]*")>${full}<`),`$1 title="${full}">${short}<`);
  h=h.replace('<div class="seg recflt"><span class="lbl">Show</span>','<div class="seg recflt" title="Show only">').replace(/(<button type="button" data-recf="\w+" class="[^"]*")>(\S+) ([^<]+)</g,'$1 title="Show only: $3" aria-label="$3">$2<');
  if(MGR.filter==='mine')return h;const t=h.indexOf('<div id="recTable"');if(t<0)return h;
  let tail=h.slice(t);
  tail=tail.replace('<table class="tally">','<table class="tally rt85"><colgroup><col><col class="c85r"><col class="c85f"><col class="c85i"><col class="c85a"></colgroup>');
  tail=tail.replace('<th>Your interest</th>','<th><span class="l85">Your interest</span><span class="s85">Int.</span></th>').replace('Rating ⓘ</th>','<span class="l85">Rating ⓘ</span><span class="s85">Rtg</span></th>');
  tail=tail.replace(/<tr class="([^"]*)" data-mg="sel" data-id="([^"]+)"[^>]*>[\s\S]*?<\/tr>/g,(row,cls,id)=>{const g=gById(id);if(!g)return row;
    const f=recFit(g,m),o=recOdds(g,m),iv=interestOf(g,m);const c=g.contract&&mgrById(g.contract.mgr);const C=CLASSES[g.cls];
    const sub=`${gSex(g)} ${C?C.name:'?'} · ${gAge(g)} · ${esc(g.city||'')}${c?` · <span style="color:${c.color}">${esc(c.ludus)}</span>`:''}`;
    const lock=m.fame<reqFame(g)?' 🔒':'';
    return `<tr class="${cls} r85" data-mg="sel" data-id="${id}" style="cursor:pointer"><td><div class="r85f"><button class="btn r85st" type="button" data-mg="fav" data-id="${id}" title="${_T`${g.favd?_T('Remove from'):_T('Pin to')} your recruiting board`}" style="color:${g.favd?'var(--gold2)':'var(--dim)'}">${g.favd?'★':'☆'}</button>${gArt(g,'xs')}<b class="r85n" title="${esc(g.name)}">${esc(g.name)}</b><span class="r85t">${gTags(g)}</span><span class="rc-sub r85s">${sub}</span></div></td>
      <td><span class="r85r">${starHTML(starsOf(estOvr(g).v))}<span class="odds">${estOvr(g).txt}</span></span></td>
      <td><span class="fitchip f${f.mark==='✓'?'y':f.mark==='~'?'m':'n'}" title="${esc(f.why)}">${f.mark}</span></td>
      <td title="${esc(_T`Your interest ${iv} · ${o.txt}`)}${lock?_T(' · they want more fame first'):''}"><div class="r85i"><div class="meter"><i style="width:${iv}%"></i></div><span class="rc-sub ${o.lead?'lead':'trail'}">${iv}<small> #${esc(String(o.txt).split(' ')[0].replace('#',''))}${lock}</small></span></div></td><td class="n">${askWage(g)}</td></tr>`});
  h=h.slice(0,t)+tail}catch(e){console.error(e)}return h}}
/* 5 + 6 · the free agent's card: one ratings line before scouting; the advisor's ★ on the button */
{const base=detailHTML;detailHTML=function(g){let h=base.apply(this,arguments);try{if(!g||g.contract||!h.includes('class="rsteps"'))return h;const m=me();
  if(!g.scout){const i=h.indexOf('<div class="scoutsee">');const c=i>=0?cutDiv(h,i):null;if(c)h=h.slice(0,i)+'<div class="scoutsee rat85"><span>📊 <b>Ratings:</b> <i>scout to see</i></span></div>'+h.slice(i+c[0].length)}
  h=h.replace(/<div class="advise74">[\s\S]*?<\/div>/,'');
  const step=MGR.recStep||recStepNow(g,m);const adv=typeof recAdvice74==='function'?recAdvice74(g,m,step):null;
  if(adv)h=h.replace(/<button class="btn([^"]*\badv74\b[^"]*)"([^>]*)>/,(x,c,rest)=>{const tip=_T`★ Advisor suggests — ${adv[1]}`;
    rest=/\btitle="/.test(rest)?rest.replace(/title="([^"]*)"/,(y,t0)=>`title="${esc(tip)} (${t0})"`):rest+` title="${esc(tip)}"`;
    return `<button class="btn${c}"${rest} data-adv85="${esc(adv[1])}"><i class="star85">★ advised</i>`})}catch(e){console.error(e)}return h}}
/* the pitch topics as tags on the card too: the pitch buttons and the "what they want" rows */
{const base=detailHTML;detailHTML=function(g){let h=base.apply(this,arguments);try{if(!g||g.contract)return h;
  h=h.replace(/(<button class="btn[^"]*" type="button" data-mg="pitch" data-id="[^"|]*\|(\w+)"[^>]*>(?:<i class="star85">★<\/i>)?)([\s\S]*?)<small>/g,(all,pre,k,mid)=>MOTIVES[k]&&mid.includes(MOTIVES[k][0])?pre+mid.replace(MOTIVES[k][0],motTag85(k))+'<small>':all);
  h=h.replace(/(<div class="want"[^>]*>[\s\S]*?)<b>([^<]+)<\/b>/g,(all,pre,n)=>{const k=Object.keys(MOTIVES).find(x=>MOTIVES[x][0]===n);return k?pre+motTag85(k):all})}catch(e){console.error(e)}return h}}
/* the lanista's hours (w.hours — the same pool as recruiting) on the 📯 Promote panel too */
{const base=promoteCardHTML;promoteCardHTML=function(){let h=base.apply(this,arguments);try{const w=W_();const n=(w&&w.hours)||0;
  h=h.replace('<div class="acts">',`<p class="prom85">⏳ <b>${n} h</b> of the lanista's time left this week</p><div class="acts">`)}catch(e){}return h}}
/* picking a fighter on the board or in the list (the tablet, ⋯, a row) is LOCAL: only the card column and the .me marks change —
   no MGR_REDRAW, so the rail, banner and sweeps are never rebuilt (clicking ⋯ again and again made the rail flicker);
   picking the one already open does nothing but bring the card into view */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mg]');if(!b||b.dataset.mg!=='sel'||typeof MGR==='undefined'||MGR.tab!=='recruit')return;
  const body=document.getElementById('mgrBody');if(!body||!body.contains(b)||!b.closest('.pipeline,#recTable'))return;
  const id=b.dataset.id;const g=gById(id);const col=body.querySelector('.mgrid > div:nth-child(2)');if(!g||!col)return;
  e.preventDefault();e.stopPropagation();
  const show=()=>{const r=col.getBoundingClientRect(),l=col.previousElementSibling;const stacked=l&&r.top>=l.getBoundingClientRect().bottom-2;if(stacked&&(r.top>innerHeight-80||r.bottom<60))col.scrollIntoView({block:'start',behavior:reduceMotion85()?'auto':'smooth'})};
  if(MGR.sel===id&&!b.dataset.offer){show();return}
  MGR.sel=id;try{col.innerHTML=detailHTML(g)}catch(err){console.error(err);if(typeof MGR_REDRAW==='function')MGR_REDRAW();return}
  body.querySelectorAll('.pipeline .pcard,#recTable tr[data-mg="sel"]').forEach(x=>x.classList.toggle('me',x.dataset.id===id));show()},true);
const reduceMotion85=()=>{try{return typeof reduceMotion==='function'&&reduceMotion()}catch(e){return false}};
(()=>{const st=document.createElement('style');const stone=typeof assetURL==='function'?assetURL('stone_wall.webp'):'assets/stone_wall.webp',wood=typeof assetURL==='function'?assetURL('stands_wood81.webp'):'assets/stands_wood81.webp';st.textContent=`
.rp85{padding:6px 10px!important}.rp85 .rp85s{cursor:pointer;list-style:none;font-size:13px;color:var(--bone,#e8dcc0);display:flex;gap:6px;align-items:center}.rp85 .rp85s::-webkit-details-marker{display:none}
.rp85 .rp85a{display:inline-block;transition:transform .15s;color:var(--gold2)}.rp85[open] .rp85a{transform:rotate(90deg)}.rp85 .rp85b{margin-top:4px}
.pw85 .pwall85{display:flex;flex-wrap:wrap;gap:6px;align-items:flex-start;padding:6px;border-radius:8px;border:1px solid #3a2b1f;
  background:linear-gradient(180deg,rgba(26,19,13,.86),rgba(16,11,8,.92)),url('${stone}') center/300px;box-shadow:inset 0 3px 12px rgba(0,0,0,.65)}
.pw85 .pcol.pl85{flex:var(--n,1) 1 180px;min-width:0;min-height:0;background:none;border:none;padding:0}
.pw85 .pl85 .pcolhd{margin:0 0 3px;text-shadow:0 1px 0 #000;font-size:12.5px}
.pw85 .pg85l{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:5px}
.pw85 .pcol.ppost85{flex:0 0 34px;align-self:stretch;min-height:96px;display:flex;align-items:center;justify-content:center;border-radius:4px;border:1px solid #4a3622;
  background:linear-gradient(90deg,rgba(14,9,5,.88),rgba(52,36,21,.72) 45%,rgba(14,9,5,.9)),url('${wood}') center/120px;box-shadow:2px 3px 6px rgba(0,0,0,.55);cursor:help}
.pw85 .ppost85 .pcolhd{margin:0;writing-mode:vertical-rl;transform:rotate(180deg);white-space:nowrap;color:var(--gold2,#f0cf7d);font-size:12px;text-shadow:-1px -1px 0 rgba(0,0,0,.8),1px 1px 0 rgba(255,220,160,.12)}
.pw85 .pcard.pt85{display:grid;grid-template-columns:24px minmax(0,1fr);grid-template-rows:minmax(0,1fr) auto 24px;gap:0 6px;align-items:center;height:72px;box-sizing:border-box;margin:0;padding:2px 5px 5px 5px;position:relative;overflow:hidden;
  border:1px solid #6b4f2e;border-top:2px solid #c9a24a;border-radius:4px;background:linear-gradient(180deg,rgba(78,55,33,.9),rgba(42,30,19,.95)),url('${wood}') center/160px;
  box-shadow:0 2px 5px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,220,160,.1);cursor:pointer}
.pw85 .pcard.pt85.me{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold),0 2px 5px rgba(0,0,0,.55)}
.pw85 .pcard.st85-watch{border-top-color:#8a7a62}.pw85 .pcard.st85-ready{border-top-color:#7fae5f}
.pw85 .pa85p{grid-row:1/3;width:24px;height:34px;overflow:hidden;display:grid;place-items:center}.pw85 .pa85p .portrait{width:24px!important;height:33px!important}.pw85 .pa85p .cimg{max-width:24px;max-height:34px}
.pw85 .pn85{grid-column:2;align-self:end;min-width:0;padding-right:12px;font-size:12px;line-height:1.08;color:var(--bone,#e8dcc0);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:break-word}.pw85 .pn85.long85{font-size:11px;letter-spacing:-.01em}
.pw85 .pn85.xl85{font-size:10px;letter-spacing:-.02em}.pipeline.pw85{padding-top:8px;padding-bottom:8px}.pw85>.sect{margin-bottom:4px}
.pw85 .ps85{grid-column:2;display:flex;gap:5px;align-items:baseline;min-width:0;overflow:hidden;white-space:nowrap;font-size:10.5px;line-height:1.1;color:var(--muted);margin-bottom:2px}.pw85 .ps85>b{font:600 11.5px var(--mono);color:var(--gold2)}
.pw85 .pr85{overflow:hidden;text-overflow:ellipsis;min-width:0}
.pw85 .pin85{all:unset;position:absolute;top:1px;right:2px;font-size:11px;line-height:1;cursor:pointer;filter:drop-shadow(0 1px 1px #000);opacity:.9}.pw85 .pin85:hover{opacity:1;transform:scale(1.15)}
.pw85 .adv85b{flex:none;margin-left:auto;font:600 7.5px/1 var(--mono);letter-spacing:.03em;text-transform:uppercase;padding:2px 3px;border-radius:3px;background:rgba(20,12,6,.75);border:1px solid var(--gold);color:var(--gold2);cursor:help;font-style:normal;white-space:nowrap}
.pw85 .pcard.pt85{container-type:inline-size}@container (max-width:250px){.pw85 .adv85b .t85{display:none}.pw85 .adv85b{font-size:9px;padding:1px 3px}}
.pw85 .px85{position:relative;grid-column:1/3;grid-row:3;display:flex;gap:4px;align-items:stretch;min-width:0;height:24px}
.pw85 .pst85{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:3px;height:24px;margin:0;padding:0 7px;min-height:0;font-size:11.5px;line-height:1;white-space:nowrap;overflow:hidden;text-align:left}
.pw85 .pst85 .pl85b{flex:0 0 auto;display:flex;align-items:center;gap:4px;white-space:nowrap}
.pw85 .pst85 small{display:block;flex:0 1 auto;min-width:0;margin:0;font-size:10px;opacity:.85;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pw85 .pst85[data-dis]{filter:grayscale(.55) brightness(.85)}
.pw85 .pmo85{flex:0 0 28px;width:28px;height:24px;padding:0;margin:0;min-height:0;font-size:14px;line-height:1;display:grid;place-items:center;background:rgba(0,0,0,.3);border:1px solid #4a3622;color:var(--muted)}.pw85 .pmo85:hover{color:var(--gold2)}
.pw85 .pg85{font-size:10px;align-self:center}
.mt85{background:rgba(0,0,0,.28);white-space:nowrap;display:inline-block;line-height:1.25}.pst85 .mt85{font-size:9.5px;padding:0 4px}
.mt85-coin{color:#f0cf7d;border-color:#c9a44a}.mt85-glory{color:#ffc27a;border-color:#c9853a}.mt85-honor{color:#9fe0d8;border-color:#4f9a94}.mt85-spectacle{color:#dcc0ff;border-color:#8a5cc0}
.mt85-training{color:#b7d59d;border-color:#6f9a52}.mt85-home{color:#bcd0ea;border-color:#6a87ad}.mt85-playing{color:#ffb3a3;border-color:#c8604c}
.prom85{margin:0 0 6px;font-size:12.5px;color:var(--muted)}.prom85 b{color:var(--gold2);font-family:var(--mono)}
.pw85 .pm85{position:absolute;left:0;right:0;bottom:0;height:3px;background:rgba(0,0,0,.45)}.pw85 .pm85 i{display:block;height:100%;background:#d9a441}
.rtb85{gap:6px!important;align-items:center}.rtb85 .seg button{padding:3px 8px;font-size:12px}.rtb85 .seg .lbl{font-size:10.5px;padding:0 4px}.rtb85 .recq{flex:1 1 110px;min-width:96px;padding:4px 8px;font-size:12.5px}
#recTable .rt85{table-layout:fixed;width:100%}.rt85 th{white-space:nowrap;overflow:hidden;text-overflow:clip}.rt85 .s85{display:none}.rt85 col.c85r{width:96px}.rt85 col.c85f{width:36px}.rt85 col.c85i{width:118px}.rt85 col.c85a{width:42px}
.rt85 tr.r85>td{padding:3px 4px;vertical-align:middle;height:36px;box-sizing:border-box}
.rt85 .r85f{display:flex;align-items:center;gap:5px;min-width:0;white-space:nowrap;overflow:hidden}
.rt85 .r85f .portrait,.rt85 .r85f .cimg{flex:none;max-height:32px}.rt85 .r85st{padding:1px 3px!important;border:none!important;background:none!important;font-size:15px;flex:none;min-height:0}
.rt85 .r85n{flex:0 1 auto;min-width:48px;overflow:hidden;text-overflow:ellipsis}.rt85 .r85t{flex:0 0 auto;display:flex;gap:2px}.rt85 .r85t .badge{font-size:10px;padding:0 4px}
.rt85 .r85s{flex:1 1 0;min-width:0;overflow:hidden;text-overflow:ellipsis;font-size:11px}
.rt85 .r85r{display:flex;gap:4px;align-items:center;white-space:nowrap;font-size:11px}.rt85 .r85r .odds{font-size:11px}
.rt85 .r85i{display:flex;gap:5px;align-items:center;white-space:nowrap}.rt85 .r85i .meter{flex:1 1 auto;min-width:30px;margin:0}.rt85 .r85i .rc-sub{flex:none;font-size:11px}.rt85 .r85i small{font-size:10px;opacity:.85}
.scoutsee.rat85{margin:6px 0;padding:5px 8px;border:1px dashed var(--line2);border-radius:6px;font-size:12.5px;color:var(--muted)}.scoutsee.rat85 b{color:var(--bone,#e8dcc0)}
.btn .star85{font:600 9px/1 var(--mono);font-style:normal;letter-spacing:.03em;text-transform:uppercase;color:var(--gold2);margin-right:6px;padding:2px 4px;border-radius:3px;border:1px solid var(--gold);background:rgba(0,0,0,.3);vertical-align:middle}
@media (max-width:600px){.pw85 .pwall85{flex-direction:column;align-items:stretch;padding:6px;gap:6px}.pw85 .pcol.pl85{flex:none;width:100%}.pw85 .pg85l{grid-template-columns:1fr}
  .pw85 .pcol.ppost85{flex:none;min-height:0;width:auto;justify-content:flex-start;padding:4px 8px;background:linear-gradient(180deg,rgba(52,36,21,.85),rgba(14,9,5,.92))}.pw85 .ppost85 .pcolhd{writing-mode:horizontal-tb;transform:none}
  .rt85 col.c85r{width:40px}.rt85 col.c85f{width:30px}.rt85 col.c85i{width:40px}.rt85 col.c85a{width:32px}.rt85 .l85{display:none}.rt85 .s85{display:inline}
  .rt85 .r85r>span:not(.odds),.rt85 .r85i .meter{display:none}.rt85 .r85s,.rt85 .r85i small{display:none}.rt85 .r85t .badge:not(.new85){display:none}.rt85 tr.r85>td{padding:3px 2px}
  .rplan{grid-template-columns:minmax(0,1fr) auto}}`;document.head.appendChild(st)})();
