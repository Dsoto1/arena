/* =====================================================================
   231-V96MGR · v0.96 part A — MANAGER (his notes 2026-10-07/08; stabilization release; numbering = his list)
   =====================================================================
   1 · LANISTA TRAITS = THE HOUSE GRADES: on the perk card the "hone a trait" row becomes trait cards (`.pk96c`): the trait, its
       letter grade (A+ … F, `trait96Grade` — recruits will read the same grades in v0.97), the number, a meter and a GREEN preview
       "+2 → 75 (B → B+)" of what one point buys; the button keeps data-mg="perk" so the old handler pays. (perkTree87 wrapper)
   2 · "Save and leave this career" → "Save and Exit" (17-manager wallet row, edited in place — a template).
   3 · STANDINGS (League tab; lp90StakesHTML replaced): "Now" is "Ludus"; the Quaestor column is gone from the table (it stays in the
       season-end ledger letter and in the podium hover); the League-prize column is gone — a BANNER PODIUM above the table shows the
       top three houses (the Superbus Cup art on 1st; hover = that place's season-finish prizes, LP90 + Superbus + Quaestor);
       columns Place · Ludus · Top gladiator · Record (W-L) · Latest event · Superbus.
   4 · SEASON TAB: each finished week's Acta results card (your house's bouts that week) is kept in `w.acta96[week]` = {s, rows:[{n,t,ev,
       p,w,f,fate}]} (copied from w.review after endWeek) and shown in a new column to the right of Billing (seasonTabHTML wrapper).
       No migration: old weeks simply show "—".
   5 · MATCH WEEK ROAD BOX: sized to its content; the Consilium's "don't fight" line moves INSIDE it (.road96note); the "N points to the
       next prize" line (Match Week + the checklist) is gone — it is a letter now (`lp96Letter`: once a week, only when the standing
       changes, w.lp96 = {wk,sig}); the "🛡 Gear up in <city>" tile ([data-arm94sq] in Match Week) is removed (City Square → Stalls).
   6 · PRE-FIGHT WARNINGS cover only this week's games: the Consilium's letter is stamped with the week + host city (`loc96`, sendLetter
       wrapper) and dropped when either no longer matches (`mail96Prune`, run by mailLive + nightHTML); the fresh warning for the real
       city is written instead (adviseWeek).
   8 · "NO FIGHTER ENTERED": the checklist item, the old ludus to-do and the Match Week rail oval clear as soon as ANY of your fighters
       is on ANY card (`onCard96`, re-read on every render).
  11 · INVITATIONAL "ANSWER": opens a small fighter picker (one select per slot) with Accept / Decline at once — the letter is not
       reopened (`iv96Ask`; the old Close/Answer toggle stays for the keyboard-less Season sidebar only when already open).
  13 · ARMORY: the rail icon is an ANVIL (inline SVG, `.anv96`); damaged pieces have their own section on the RIGHT of the Armory tab
       (`#ar96dmg`: each piece with its repair price + 🔨 Repair all; [data-ar96fix] mends one outside the City Square).
   UI only — never the seeded dice. Test: tools/tests/tv96m.js
   ===================================================================== */

/* ---------------- 1 · trait cards ---------------- */
/* trait96Grade — a 1–95 trait as a letter grade. TWEAK: the cut-offs. */
const TRAIT96=[[92,'A+'],[85,'A'],[78,'B+'],[70,'B'],[62,'C+'],[54,'C'],[44,'D'],[0,'F']];
const trait96Grade=v=>(TRAIT96.find(x=>v>=x[0])||TRAIT96[TRAIT96.length-1])[1];
function traitCards96(m){const P=m.perkPts||0;
  const cards=MGR_KEYS.map(([k,l,d])=>{const v=m.p[k]||0;const max=v>=95;const nv=Math.min(95,v+2);const g0=trait96Grade(v),g1=trait96Grade(nv);
    return `<div class="pk96c ${max?'max':''}" title="${esc(d)}"><div class="pk96top"><span class="pk96n">${esc(l)}</span>${gradeChip(g0)}</div>
      <div class="pk96v"><b>${v}</b>${max?`<span class="pk96max">${_T('top of the scale')}</span>`:`<span class="pk96gain" title="${_T('What one point buys')}">+${nv-v} → ${nv}${g1!==g0?` <i>${g0} → ${g1}</i>`:''}</span>`}</div>
      <div class="meter pk96m"><i style="width:${v}%"></i></div>
      <button class="btn tksm" type="button" data-mg="perk" data-id="${k}" ${P<1||max?'disabled':''}>${max?_T('Maxed'):_T`Hone · 1 point`}</button></div>`}).join('');
  return `<div class="pk87hone pk96hone"><div class="pk96hd"><b>${_T`🏛 Your house grades`}</b><span class="rc-sub">${_T`Recruits grade your ludus on these. One point adds +2.`}</span></div><div class="pk96grid">${cards}</div></div>`}
{const base=perkTree87;perkTree87=function(){const h=base.apply(this,arguments);try{const m=me();const i=h.indexOf('<div class="pk87hone">');if(i<0||!m)return h;return h.slice(0,i)+traitCards96(m)+'</div>'}catch(e){console.error(e);return h}}}

/* ---------------- 6 · warnings only for this week's games ---------------- */
{const base=sendLetter;sendLetter=function(w,o){const r=base.apply(this,arguments);try{if(o&&/^consil-/.test(o.key||'')&&w&&w.night){const L=(w.letters||[]).find(x=>x.key===o.key);if(L&&L.loc96==null)L.loc96=w.night.loc}}catch(e){}return r}}
function mail96Prune(w){if(!w||!Array.isArray(w.letters)||!w.night||w.dead)return 0;let n=0;
  w.letters=w.letters.filter(L=>{if(!/^consil-/.test(L.key||''))return true;
    const stale=!!w.night.bye||(L.loc96!=null&&L.loc96!==w.night.loc)||(L.s!=null&&L.s!==w.season)||(L.wk!=null&&L.wk!==w.week);if(stale)n++;return !stale});
  if(n&&!w.night.bye){try{adviseWeek(w)}catch(e){console.error(e)}}return n}

/* ---------------- 5 · the next-prize letter ---------------- */
function lp96Letter(w){try{if(!w||w.tutorial||w.dead||!w.night)return;const N=lp90Next();if(!N)return;const sig=N.pos+'|'+(N.t||0)+'|'+(N.need||0);const S0=w.lp96;
    if(S0&&S0.wk===w.week)return;w.lp96={wk:w.week,sig};if(S0&&S0.sig===sig)return;
    sendLetter(w,{key:'lp96',kind:'letter',from:_T('the Quaestor'),seal:'📊',until:w.week,title:N.top?_T('Top of the table'):_T`${N.need} point${N.need===1?'':'s'} to the next prize`,body:`<p>${N.txt}</p>`})}catch(e){console.error(e)}}
{const base=mailLive;mailLive=function(){try{const w=W_();if(w&&!w.dead){mail96Prune(w);lp96Letter(w)}}catch(e){console.error(e)}return base.apply(this,arguments)}}

/* ---------------- 5 · Match Week road box + 13 · no Gear-up tile ---------------- */
{const base=nightHTML;nightHTML=function(){let h=base.apply(this,arguments);try{if(typeof h!=='string')return h;const w=W_();if(w)mail96Prune(w);
    h=h.replace(/<div class="lp90next[^"]*">[\s\S]*?<\/div>/g,'').replace(/<div class="ar94mw">[\s\S]*?<\/div>/g,'');
    if(h.includes('travelcard')&&h.includes('mailline')){const T=document.createElement('template');T.innerHTML=h;const ml=T.content.querySelector('.mailline');const main=T.content.querySelector('.travelcard .road85main')||T.content.querySelector('.travelcard');
      if(ml&&main){const line=[...ml.children].find(d=>d.querySelector&&d.querySelector('[data-mailgo^="L:consil-"]'));
        if(line){const n=document.createElement('div');n.className='road96note rc-sub';n.innerHTML=line.innerHTML;main.insertBefore(n,main.querySelector('.sbye76row')||null);line.remove()}
        if(!ml.children.length)ml.remove();h=T.innerHTML}}}catch(e){console.error(e)}return h}}
{const base=checklistHTML;checklistHTML=function(){const h=base.apply(this,arguments);return typeof h==='string'?h.replace(/<div class="lp90next[^"]*">[\s\S]*?<\/div>/g,''):h}}

/* ---------------- 8 · any fighter on any card clears "none entered" ---------------- */
function onCard96(w,m){try{w=w||W_();m=m||me();const n=w&&w.night;if(!n||n.bye||!n.bouts||!m)return 0;let k=0;for(const b of n.bouts)for(const id of b.ents||[]){const g=gById(id);if(g&&g.contract&&g.contract.mgr===m.id)k++}return k}catch(e){return 0}}
{const base=weekChecklist;weekChecklist=function(){const I=base.apply(this,arguments);try{const k=onCard96();if(k){const x=I.find(y=>y.ic==='⚔'&&!/hand/.test(y.txt));if(x&&!x.done){x.done=true;x.btn='';x.txt=k===1?_T('1 of your fighters is on this week\'s card'):_T`${k} of your fighters are on this week's card`}}}catch(e){console.error(e)}return I}}
{const base=ludusTodos;ludusTodos=function(){const T=base.apply(this,arguments);try{if(Array.isArray(T)&&onCard96())return T.filter(x=>x[0]!=='⚔')}catch(e){}return T}}
{const base=nightTodo73;nightTodo73=function(){const r=base.apply(this,arguments);try{const w=W_();if(r&&!(w.pend||[]).length&&onCard96())return null}catch(e){}return r}}

/* ---------------- 4 · the Acta card of every finished week ---------------- */
{const base=endWeek;endWeek=async function(){const w0=W_();const r=await base.apply(this,arguments);
  try{const w=W_();if(w&&w===w0&&w.review&&w.review.wk!=null&&!w.tutorial){const R=w.review;w.acta96=w.acta96||{};
      if(!w.acta96[R.wk]||w.acta96[R.wk].s!==R.season){w.acta96[R.wk]={s:R.season,rows:(R.results||[]).map(x=>({n:x.name,t:x.tier,ev:x.ev,p:x.place,w:!!x.won,f:x.f,fate:String(x.fate||'').replace(/<[^>]*>/g,'')}))};
        const ks=Object.keys(w.acta96).map(Number).sort((a,b)=>a-b);while(ks.length>40)delete w.acta96[ks.shift()];try{saveWorld()}catch(e){}}}}catch(e){console.error(e)}return r}}
function acta96Cell(w,abs){const A=w.acta96&&w.acta96[abs];if(!A)return '<span class="rc-sub">—</span>';if(!A.rows.length)return `<span class="rc-sub">${_T('sat out')}</span>`;
  return `<div class="ac96">${A.rows.map(r=>`<div class="ac96b${r.w?' w':''}" title="${esc(`${r.ev||''}${r.fate?' · '+r.fate:''}`)}"><span class="ac96t">${esc(r.t||'')}</span> <b>${esc(r.n||'?')}</b> <span class="ac96p">${r.w?'🏆':r.p?lp90Ord(r.p):'·'}</span></div>`).join('')}</div>`}
{const base=seasonTabHTML;seasonTabHTML=function(){const h=base.apply(this,arguments);try{const w=W_();if(!w||typeof h!=='string')return h;const T=document.createElement('template');T.innerHTML=h;const tb=T.content.querySelector('table.stable2');if(!tb)return h;
    const wk0=((w.week-1)%12)+1;const baseW=w.week-wk0;
    tb.querySelectorAll('tr').forEach((tr,i)=>{if(i===0){const th=document.createElement('th');th.title=_T('The Acta results card: how your house did that week');th.textContent=_T('📜 Acta');tr.appendChild(th);return}
      const sb=tr.querySelector('td.sbill');if(sb){const wk=parseInt((tr.firstElementChild.textContent||'').replace(/\D/g,''),10);const td=document.createElement('td');td.className='sact96';
        td.innerHTML=tr.classList.contains('spast')&&wk?acta96Cell(w,baseW+wk):'';tr.appendChild(td);return}
      const c=tr.querySelectorAll('td');const last=c[c.length-1];if(last&&last.colSpan>1)last.colSpan++;else if(c.length===1&&c[0].colSpan)c[0].colSpan++});
    return T.innerHTML}catch(e){console.error(e);return h}}}

/* ---------------- 3 · standings: the banner podium + the table ---------------- */
function lp96Tip(pos,n){const P=lp90Prize(pos);const a=P?_T`League prize +${P.c} coin${P.f?_T`, +${P.f} fame`:''}`:_T('no league prize');
  return `${lp90Ord(pos)} — ${a}${pos<=4?' · '+_T('Flavius Superbus invitation'):''} · ${_T`Quaestor's Ledger +${Math.max(0,n-pos)*4} coin`}`}
function lp96Latest(m){const w=W_();let best=null;for(const g of rosterOf(m))for(const x of g.recent||[]){const k=(x.s||0)*100+(x.wk||0);if(!best||k>=best.k)best={k,x,g}}
  if(!best)return '<span class="rc-sub">—</span>';const x=best.x;const res=x.won?_T('🏆 won'):x.place?lp90Ord(x.place):_T('fought');
  return `<b>${res}</b> <span class="rc-sub">${esc(x.ev||x.t||'')}${x.loc?' · '+esc(x.loc):''} · ${esc(best.g.name.split(' ')[0])}</span>`}
function lp96Top(m){const g=rosterOf(m).sort((a,b)=>effOvr(b)-effOvr(a))[0];if(!g)return '<span class="rc-sub">—</span>';const o=m.isPlayer||g.scout?effOvr(g):pubOvr(g);
  return `<span class="lp96g">${gArt(g,'xs')}<span><b>${esc(g.name)}</b><br><span class="stars">${'★'.repeat(starsOf(o))}</span> <span class="rc-sub">${m.isPlayer||g.scout?o:'~'+o}</span></span></span>`}
function lp96Podium(L,n,pos){const cup=(()=>{try{const d=trophyDef('palm_roma');return d?trophySVG(d,62):''}catch(e){return ''}})();
  const slot=(i,cls)=>{const m=L[i];if(!m)return '';const sp=msp(m);
    return `<div class="lp96p ${cls}${m.isPlayer?' me':''}" title="${esc(lp96Tip(i+1,n))}" tabindex="0">${i===0?`<div class="lp96cup">${cup}</div>`:''}
      <div class="lp96ban" style="--hc:${m.color||'#c9a14a'}"><span class="lp96fl">${typeof flagChip==='function'?flagChip(m,16):''}</span><b>${esc(m.ludus)}</b><small>${sp.pts} ${_T('pts')} · ${sp.w}-${Math.max(0,sp.b-sp.w)}</small></div>
      <div class="lp96step"><span>${i+1}</span></div></div>`};
  return `<div class="lp96pod" role="group" aria-label="${_T('The top three houses')}">${slot(1,'p2')}${slot(0,'p1')}${slot(2,'p3')}</div>`}
lp90StakesHTML=function(){const w=W_(),pm=me();const L=leagueSort(w.mgrs);const n=L.length;const pos=L.indexOf(pm)+1;
  const row=(p,lab,m)=>{const me2=!lab&&p===pos;
    if(!m)return `<tr><td class="n"><b>${lab}</b></td><td colspan="5" class="rc-sub">…</td></tr>`;const sp=msp(m);
    return `<tr class="${me2?'me':''}" title="${esc(lp96Tip(p,n))}"><td class="n"><b>${lp90Ord(p)}</b></td>
      <td>${typeof flagChip==='function'?flagChip(m,14):`<span style="color:${m.color}">■</span>`} <b style="color:${m.color}">${esc(m.ludus)}</b>${me2?` <span class="rc-sub">${_T('◀ you')}</span>`:''}<br><span class="rc-sub">${esc(m.name)} · ${sp.pts} ${_T('pts')}</span></td>
      <td>${lp96Top(m)}</td><td class="n"><b>${sp.w}-${Math.max(0,sp.b-sp.w)}</b></td><td>${lp96Latest(m)}</td><td class="n">${p<=4?'🏛':'<span class="rc-sub">—</span>'}</td></tr>`};
  const K=LP90.length;let rows=L.slice(0,K).map((m,i)=>row(i+1,'',m)).join('');
  if(n>K){if(pos>K)rows+=row(pos,'',pm);const rest=n-K-(pos>K?1:0);if(rest>0)rows+=`<tr><td class="n"><b>${K+1}–${n}</b></td><td colspan="5" class="rc-sub">${_T`the other ${rest} houses`}</td></tr>`}
  return `<details class="card2 lp90 lp96" open><summary>${_T`<b>🏆 Standings</b>`} <span class="rc-sub">${_T`hover a place for its season-finish prizes`}</span></summary>
    ${lp96Podium(L,n,pos)}${lp90NextHTML('in')}
    <table class="tally compact lp90t lp96t"><tr><th>${_T`Place`}</th><th>${_T`Ludus`}</th><th>${_T`Top gladiator`}</th><th title="${_T`This season's bouts: won-lost`}">${_T`Record`}</th><th>${_T`Latest event`}</th><th title="${_T`The top four are invited to the Flavius Superbus`}">${_T`Superbus`}</th></tr>${rows}</table></details>`};

/* ---------------- 11 · invitational Answer = pick the fighters and accept ---------------- */
function iv96Ask(iv){const w=W_(),pm=me();const D=specDef(iv.sid);if(!w||!pm||!D)return;for(const o of document.querySelectorAll('.iv96bg'))o.remove();
  const ros=rosterOf(pm).filter(g=>!g.inj).sort((a,b)=>effOvr(b)-effOvr(a));const L=LOCATIONS[D.loc];
  const sel=Array.from({length:D.slots},(_,k)=>`<select class="tin iv96s" data-iv96s="${k}"><option value="">${k?_T('— optional 2nd fighter —'):_T('— choose a fighter —')}</option>${ros.map(g=>`<option value="${g.id}">${esc(g.name)} · ${effOvr(g)}</option>`).join('')}</select>`).join(' ');
  const bg=document.createElement('div');bg.className='veraskbg ask76bg iv96bg';
  bg.innerHTML=`<div class="card2 verask" role="dialog" aria-modal="true"><b>${D.icon} ${esc(iv.n||D.n)}</b><div class="rc-sub" style="margin:4px 0">📍 ${esc(L?L.n:'')} · ${_T`win`} ${coinAmt87(D.purse)} · ${coinAmt87(D.appear)} ${_T`a heat to appear`}</div>
    <div class="iv96sel">${ros.length?sel:`<p class="rc-sub">${_T('No fit fighter to send.')}</p>`}</div>
    <div class="acts"><button type="button" class="btn primary" data-iv96="ok" disabled>${_T('Accept')}</button><button type="button" class="btn" data-iv96="no">${_T('Not now')}</button><button type="button" class="btn" data-iv96="dec">${_T('Decline')}</button></div></div>`;
  document.body.appendChild(bg);const ok=bg.querySelector('[data-iv96="ok"]');const ss=[...bg.querySelectorAll('.iv96s')];
  const sync=()=>{const ch=ss.map(s=>s.value);ss.forEach((s,i)=>[...s.options].forEach(o=>{o.disabled=!!o.value&&ch.some((c,j)=>j!==i&&c===o.value)}));ok.disabled=!ch.some(Boolean)};
  ss.forEach(s=>s.addEventListener('change',sync));
  const done=()=>{bg.remove();document.removeEventListener('keydown',key,true)};const key=e=>{if(e.key==='Escape'){e.stopPropagation();e.preventDefault();done()}};document.addEventListener('keydown',key,true);
  bg.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('[data-iv96]');if(!b){if(e.target===bg)done();return}const a=b.dataset.iv96;
    if(a==='no'){done();return}
    if(a==='dec'){iv.status='declined';saveWorld();done();mToast(_T`Declined with thanks: ${esc(iv.n||D.n)}.`);MGR.ivOpen=null;if(typeof MGR_REDRAW==='function')MGR_REDRAW();return}
    const ids=[...new Set(ss.map(s=>s.value).filter(Boolean))];if(!ids.length)return;
    iv.ents=ids;iv.status='accepted';MGR.ivOpen=null;saveWorld();done();mToast(_T`✓ Accepted: ${esc(D.n)} — ${ids.map(x=>esc(gById(x).name)).join(' & ')} will travel to ${esc(L?L.n:'')}.`);if(typeof MGR_REDRAW==='function')MGR_REDRAW()});
  setTimeout(()=>{const s=ss[0];if(s)s.focus()},30)}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-mg="iv_open"]');if(!b||typeof W_!=='function')return;const w=W_();if(!w||!w.invites||MGR.ivOpen===b.dataset.id)return;
  const iv=w.invites.find(x=>String(x.id)===String(b.dataset.id));if(!iv||iv.status==='accepted'||iv.status==='declined')return;e.preventDefault();e.stopImmediatePropagation();iv96Ask(iv)},true);

/* ---------------- 13 · the Armory: an anvil, and the damaged pieces on the right ---------------- */
const ANV96='<svg class="anv96" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M1.5 5h17.5c0 3.2-2.2 5-5 5.2H12v1.6c1.8.5 3.2 1.4 3.2 3.2v.5H17v3H7v-3h1.8v-.5c0-1.8 1.4-2.7 3.2-3.2v-1.6H9C5.2 10.2 2.6 8 1.5 5z"/></svg>';
{const base=railTabs;railTabs=function(){const h=base.apply(this,arguments);return typeof h==='string'?h.replace(/(armory"[^>]*>)🛡/,'$1'+ANV96):h}}
function arm96Fix(pid){const pm=me(),w=W_();if(!pm||!w)return {no:'?'};const at=arm94Find(pm,pid);if(!at||!at.P.dmg)return {no:'?'};const pr=arm94Fix(at.P);if(pm.coin<pr)return {no:_T('Not enough coin.')};
  pm.coin-=pr;delete at.P.dmg;const st=arm94St(w);st.fix++;st.spent+=pr;arm94Fl(w,pm,'rep',pr);saveWorld();return {ok:1}}
function dmg96HTML(){const pm=me();if(!pm)return '';const list=arm94All(pm).filter(x=>x.P.dmg);const tot=list.reduce((a,x)=>a+arm94Fix(x.P),0);
  const items=list.map(x=>{const pr=arm94Fix(x.P);return `<div class="ar96it"><span class="ar94art">${arm94Art(x.P,34)}</span><span class="ar96n"><b>🩹 ${esc(arm94Name(x.P))}</b><small>${x.g?esc(x.g.name):_T('on the shelf')} · ${arm94Meta(x.P)}</small></span><button type="button" class="btn tksm" data-ar96fix="${x.P.id}" ${pm.coin<pr?'disabled':''}>${_T`🔨 ${pr}`}</button></div>`}).join('');
  return `<div class="card2 ar96dmg" id="ar96dmg"><div class="sect" style="margin-top:0">${_T`🩹 Damaged`} <span class="rc-sub">${list.length}</span></div>
    ${list.length?`${items}<div class="acts" style="margin-top:6px"><button class="btn tksm" type="button" data-arm94fixall="1" ${pm.coin<tot?'disabled':''}>${_T`🔨 Repair all · ${tot} coin`}</button></div><p class="rc-sub" style="margin:6px 0 0">${_T`Armor that fell to 0 AP comes home damaged and stays on the shelf until it is mended. The armorer in the City Square charges less at home.`}</p>`
      :`<p class="rc-sub" style="margin:0">${_T('Nothing needs repair.')}</p>`}</div>`}
{const base=armoryTab95;armoryTab95=function(){const h=base.apply(this,arguments);try{if(!h)return h;const i=h.indexOf('<div class="card2 ar94" id="ar94">');if(i<0)return h;return h.slice(0,i)+`<div class="ar96wrap"><div class="ar96main">${h.slice(i)}</div><aside class="ar96side">${dmg96HTML()}</aside></div>`}catch(e){console.error(e);return h}}}
{const base=arm94Redraw;arm94Redraw=function(){const r=base.apply(this,arguments);try{const el=document.getElementById('ar96dmg');if(el){const T=document.createElement('template');T.innerHTML=dmg96HTML();el.replaceWith(T.content.firstElementChild)}}catch(e){}return r}}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-ar96fix]');if(!b)return;e.preventDefault();e.stopPropagation();
  const r=arm96Fix(b.dataset.ar96fix);if(r&&r.no&&typeof mToast==='function')mToast('⛔ '+r.no);if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);

/* ---------------- look ---------------- */
{const st=document.createElement('style');st.textContent=`
.anv96{width:1.05em;height:1.05em;vertical-align:-.15em;margin-right:.15em}
.pk96hone{margin-top:12px;padding-top:10px;border-top:1px solid var(--line2,#4a3826)}
.pk96hd{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;margin-bottom:8px}.pk96hd b{font:400 17px var(--display);color:var(--gold2,#e0b95a)}
.pk96grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.pk96c{display:flex;flex-direction:column;gap:6px;padding:10px;border:1px solid var(--line2,#4a3826);border-radius:10px;background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(0,0,0,.2))}
.pk96top{display:flex;justify-content:space-between;align-items:center;gap:6px}.pk96n{font-weight:700}
.pk96v{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}.pk96v>b{font:400 26px var(--display);color:var(--gold2,#e0b95a)}
.pk96gain{color:#7fd48a;font-weight:700}.pk96gain i{font-style:normal;color:#9fe8a8;font-weight:400}.pk96max{color:var(--dim,#a3907a);font-size:12px}
.pk96m{height:6px}.pk96c .btn{width:100%;margin:0}
.lp96pod{display:flex;justify-content:center;align-items:flex-end;gap:10px;margin:10px 0 12px;padding:6px 6px 0}
.lp96p{display:flex;flex-direction:column;align-items:center;width:min(30%,210px);min-width:0;outline:none}
.lp96cup{margin-bottom:-4px;filter:drop-shadow(0 4px 6px rgba(0,0,0,.5))}
.lp96ban{width:100%;box-sizing:border-box;text-align:center;padding:8px 8px 16px;color:#fff6e4;background:linear-gradient(180deg,color-mix(in srgb,var(--hc) 88%,#fff 0%),color-mix(in srgb,var(--hc) 55%,#000));
  clip-path:polygon(0 0,100% 0,100% 100%,50% 86%,0 100%);display:flex;flex-direction:column;gap:2px;align-items:center}
.lp96ban b{font:400 15px var(--display);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}.lp96ban small{opacity:.9}
.lp96fl{min-height:16px;display:inline-flex}
.lp96step{width:100%;margin-top:-10px;display:flex;align-items:flex-start;justify-content:center;font:400 30px var(--display);color:rgba(0,0,0,.55);border-radius:6px 6px 0 0;padding-top:14px;box-sizing:border-box;box-shadow:inset 0 2px 0 rgba(255,255,255,.35)}
.lp96p.p1 .lp96step{height:88px;background:linear-gradient(180deg,#f6dc8f,#c9a14a)}.lp96p.p2 .lp96step{height:62px;background:linear-gradient(180deg,#dfe5ee,#9aa4b2)}.lp96p.p3 .lp96step{height:46px;background:linear-gradient(180deg,#dda26b,#a8693a)}
.lp96p.me .lp96ban{box-shadow:0 0 0 2px var(--gold2,#e0b95a)}.lp96p:focus-visible .lp96ban{outline:2px solid var(--gold2,#e0b95a)}
.lp96g{display:inline-flex;align-items:center;gap:6px}.lp96t td{vertical-align:middle}
.ac96{display:flex;flex-direction:column;gap:2px;font-size:12.5px;min-width:150px}.ac96b.w{color:var(--gold2,#e0b95a)}.ac96t{color:var(--dim,#a3907a);font-size:11px;text-transform:uppercase}
.travelcard.road85{width:fit-content;max-width:100%;grid-template-columns:minmax(220px,auto) 250px}
.road96note{margin:6px 0;padding:6px 8px;border-left:3px solid var(--blood2,#b34a3a);background:rgba(0,0,0,.18);border-radius:4px}
.ar96wrap{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:12px;align-items:start}.ar96main{min-width:0}
.ar96dmg .ar96it{display:flex;gap:8px;align-items:center;padding:5px 0;border-bottom:1px solid var(--line2,#4a3826)}.ar96n{flex:1;min-width:0;display:flex;flex-direction:column}.ar96n small{color:var(--dim,#a3907a)}
.iv96sel{display:flex;flex-direction:column;gap:6px;margin:6px 0 10px}.iv96sel select{max-width:100%}
@media (max-width:900px){.ar96wrap{grid-template-columns:1fr}.travelcard.road85{width:auto;grid-template-columns:1fr}.lp96pod{gap:6px}}
`;document.head.appendChild(st)}
