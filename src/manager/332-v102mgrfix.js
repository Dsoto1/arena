/* v1.02 (332-v102mgrfix) · MANAGER FIXES — his v1.01 notes, workstream A (tools/plans/v102/NOTES.md). Kill switch localStorage flavius_v102aoff=1.
   M21 (his ask 2026-10-14): Armory fighter list — the 3 starters (g.slot95 1–3) wear a gold border + soft glow (.ar94g.st102) and their bout numeral.
   M1  Regrow a lost limb: ONE limb a week per fighter; Hygeia's operation is booked (g.rg102 {wk,l}, 318's care101Do) and the limb is back only when
       that week ENDS (endWeek wrapper, undone if the week did not turn); the following week +20 fatigue per limb. The cure tile says so.
   M2  No 5-bout Match Week: when the week's fixture already became a headline special, the editor adds no second one (any100Make wrapper) — at most
       3 classics + 1 special, so two specials can never share a day.
   M3  Opening Your ludus (rail, any path, re-opening Manager) shows the main view: Letters drawer, advisor popover, run panel and Promote popup closed.
   M4  League > Season billing: weeks whose fixture is a special, or that hold an invitation, cannot be billed (no picker; cm_set refused).
   M7  The Care routine button says what it costs: 2 of the Training Yard's hours a week, no drills.
   M8  Infirmary: "Hire a medicus" and Hygeia's Blessing move from the banner to the top of the patient list column, laid out as one card.
   M14 Infirmary "Build Valetudinarium" plate is disabled (class off, aria-disabled, reason line) when the treasury cannot pay.
   M17 Leather Tasset pair thumbnail mirrored to face like its Tasset siblings (assets/armthumb102_legwrapsU.webp replaces THUMB81[37]).
   M18 A headline special's entry fee: fighters cannot be picked while the treasury cannot pay it; they unlock the moment it can (any100Why/any100Short).
   M19 The enter-an-event picker shows 🛏 in bed / 💤 resting beside fatigue (classic picker options too).
   M20 Team special (Naumachia…): a full card takes a free agent from EITHER side — the side chosen for you may hold only rival fighters (any100Enter retry). */
const V102A={on:(()=>{try{return localStorage.getItem('flavius_v102aoff')!=='1'}catch(e){return true}})(),prev:null};
if(V102A.on){
/* ---------- M17 ---------- */
try{if(typeof THUMB81!=='undefined')THUMB81[37]='armthumb102_legwrapsU.webp'}catch(e){}

/* ---------- M1 · the limb is back when the week ends ---------- */
{const base=endWeek;endWeek=async function(){const w=W_();const wk0=w&&w.week;const done=[];
  try{if(w&&!w.dead)for(const g of w.glads||[]){const R=g.rg102;if(!R||R.wk!==w.week||g.alive===false)continue;const i=(g.severed||[]).indexOf(R.l);if(i>=0){g.severed.splice(i,1);done.push([g,R.l])}}}catch(e){console.error(e)}
  let r;try{r=await base.apply(this,arguments)}catch(e){for(const [g,l] of done)if(!(g.severed||[]).includes(l))(g.severed=g.severed||[]).push(l);throw e}
  try{const w2=W_();if(w2&&w2.week===wk0){for(const [g,l] of done)if(!(g.severed||[]).includes(l))g.severed.push(l)}
    else for(const [g,l] of done){g.rg102=null;g.fat=Math.max(0,Math.min(100,(g.fat||0)+20));try{ghist(g,_T`the ${(LOCN[l]||l).toLowerCase()} grew back — fatigue +20 from the operation`);if(g.alive!==false&&g.contract&&mgrById(g.contract.mgr)&&mgrById(g.contract.mgr).isPlayer)tnews(_T`🌿 <b>${esc(g.name)}</b>'s ${esc((LOCN[l]||l).toLowerCase())} has grown back — he is worn from the operation (+20 fatigue).`)}catch(e){}}}catch(e){console.error(e)}
  return r}}

/* ---------- M2 · at most one special beside the three classics ---------- */
{const base=any100Make;any100Make=function(w){const n=w&&w.night;let pool0=null;
  try{if(n&&n.bouts&&!n.bye){const main=n.bouts.find(b=>b.tier==='main');if(main&&!main.done&&main.special&&main.ev!=='triumviratus'&&!ANY100.ban.includes(main.ev)&&EVENTS[main.ev]&&!n.bouts.some(b=>b.tier==='spc100')){pool0=ANY100.pool;ANY100.pool=[]}}}catch(e){}
  try{return base.apply(this,arguments)}finally{if(pool0)ANY100.pool=pool0}}}

/* ---------- M3 · Your ludus always opens on its main view ---------- */
function v102LuReset(){try{if(typeof LU100!=='undefined'){LU100.mail=false;LU100.pop=null;LU100.panel=null;LU100.openKey=null}
  if(typeof MGR!=='undefined'&&MGR.run)MGR.run=null;
  for(const s of ['#lu100pop','.lu100scrim'])for(const e of document.querySelectorAll(s))e.remove();
  const D=document.getElementById('desk99');if(D)D.classList.remove('lu100open')}catch(e){}}
{const base=openManager;openManager=async function(){V102A.prev=null;v102LuReset();return base.apply(this,arguments)}}

/* ---------- M4 · specials / invitationals cannot be billed ---------- */
function v102NoBill(abs){try{const w=W_();const {season,wk}=absSW(w,abs);const f=fixtureFor(season,wk);
  if(f&&f.ev&&!/democritus|egidious|cassian/.test(f.ev))return _T('A special fixture — it cannot be billed. Enter it on Match Week.');
  if((w.invites||[]).some(x=>x.wk===abs&&['open','accepted','playing'].includes(x.status)))return _T('An invitational — it cannot be billed here. Answer the invitation (Invitations list).')}catch(e){}return ''}
{const base=wd100BillRows;wd100BillRows=function(w,pm){const rows=base.apply(this,arguments);try{return rows.map(h=>{const m=/<span class="wkn">(?:S(\d+) · )?[^<]*?(\d+)<\/span>/.exec(h);if(!m||/data-mg="cm_undo"/.test(h)||/ now"/.test(h.slice(0,40)))return h;
    const wk=+m[2];const {season:s0}=absSW(w,w.week);const season=m[1]?+m[1]:s0;let abs=null;for(let a=w.week;a<=w.week+16;a++){const x=absSW(w,a);if(x.wk===wk&&x.season===season){abs=a;break}}
    if(abs==null||abs===w.week)return h;const why=v102NoBill(abs);if(!why)return h;
    return h.replace(/<span class="c-bl">[\s\S]*?<\/span>/,`<span class="c-bl"><small title="${esc(why)}">${_T('by invitation only')}</small></span>`)}) }catch(e){console.error(e);return rows}}}
window.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mg="cm_set"]');if(!b)return;const abs=+(b.dataset.id||0);const why=abs&&v102NoBill(abs);
  if(why){e.stopImmediatePropagation();e.preventDefault();if(typeof mToast==='function')mToast('⛔ '+why)}},true);

/* ---------- M18 + M19 + M20 · the enter-an-event picker ---------- */
const v102Fee=(b,g)=>{try{const m=me();return any100Sp(b)&&m&&g&&any100Own(g.id,m)&&!b.ents.includes(g.id)&&m.coin<b.any100.fee?b.any100.fee:0}catch(e){return 0}};
const any100Why0=any100Why;
{const base=any100Why;any100Why=function(w,b,g){const r=base.apply(this,arguments);if(r)return r;const f=v102Fee(b,g);return f?_T`The entry fee is ${f} coin — the treasury holds ${me().coin}.`:''}}
{const base=any100Short;any100Short=function(w,b,g){try{if(!any100Why0(w,b,g)&&v102Fee(b,g))return _T('can’t pay')}catch(e){}return base.apply(this,arguments)}}
{const base=any100Enter;any100Enter=function(w,bi,gid,o){let r=base.apply(this,arguments);
  try{if(r&&!r.ok){const b=w.night.bouts[bi];if(b&&any100Sp(b)&&any100Team(b)&&b.ents.length>=boutSize(b))for(const s of ['A','B']){if(o&&s===o.side)continue;const r2=base.call(this,w,bi,gid,{...(o||{}),side:s});r=r2;if(r2.ok)break}}}catch(e){console.error(e)}
  return r}}
{const base=any100PickHTML;any100PickHTML=function(){const h=base.apply(this,arguments);try{if(typeof h!=='string'||!h)return h;const w=W_();const T=document.createElement('template');T.innerHTML=h;let hit=false;
  for(const row of T.content.querySelectorAll('.a1fr[data-any100^="sel|"]')){const g=gById(row.dataset.any100.slice(4));const fb=row.querySelector('.fb90');if(!g||!fb)continue;
    const bed=typeof inBed76==='function'&&inBed76(g),rest=g.restWk!=null&&g.restWk===w.week;if(!bed&&!rest)continue;
    const wr=document.createElement('span');wr.className='a1fw102';fb.replaceWith(wr);wr.appendChild(fb);
    const st=document.createElement('span');st.className='a1st102'+(bed?' bed':' rest');st.textContent=bed?_T('🛏 in bed'):_T('💤 resting');st.title=bed?_T('In an infirmary bed — cannot be entered.'):_T('Resting this week — entering ends the rest.');wr.appendChild(st);hit=true}
  return hit?T.innerHTML:h}catch(e){console.error(e);return h}}}
{const base=nightHTML;nightHTML=function(){const h=base.apply(this,arguments);try{if(typeof h!=='string'||h.indexOf('id="ent')<0)return h;const w=W_();const T=document.createElement('template');T.innerHTML=h;
  for(const sel of T.content.querySelectorAll('select[id^="ent"]'))for(const o of sel.querySelectorAll('option')){const g=gById(o.value);if(!g)continue;
    const bed=typeof inBed76==='function'&&inBed76(g),rest=g.restWk!=null&&g.restWk===w.week;let t=o.textContent;
    if(bed)t=t.replace(/— .*$/,_T('— 🛏 in bed'));
    else{if(rest)t+=' · '+_T('💤 resting');try{t+=' · '+FB90_TXT()[fatBand90(gFat(g))][0]}catch(e){}}
    o.textContent=t}
  return T.innerHTML}catch(e){console.error(e);return h}}}

/* ---------- the Manager page: M3 (opening Your ludus), M7, M8, M14, M1 text ---------- */
{const base=mgrHTML;mgrHTML=function(){try{const t=typeof MGR!=='undefined'?MGR.tab:null;if(t==='ludus'&&V102A.prev!=null&&V102A.prev!=='ludus')v102LuReset();V102A.prev=t}catch(e){}
  const h=base.apply(this,arguments);if(typeof h!=='string')return h;
  try{if(!/data-care90|v101bx|data-id="valet"|data-mg="heal"/.test(h))return h;const w=W_(),pm=me();if(!w||!pm)return h;
    const T=document.createElement('template');T.innerHTML=h;const R=T.content;
    for(const b of R.querySelectorAll('[data-care90]')){const on=/\bon\b/.test(b.className);let s=b.querySelector('small');if(!s){s=document.createElement('small');b.appendChild(s)}
      s.textContent=on?_T`on · 2 of the Training Yard's hours a week, no drills · tap to stop`:_T`2 of the Training Yard's hours a week, no drills · fatigue −${FAT_CARE90}`;b.title=_T('A standing order: 2 of the Training Yard’s hours a week, no drills.')}
    for(const b of R.querySelectorAll('[data-mg="heal"]')){const s=b.querySelector('small');if(s&&!s.dataset.v102){s.dataset.v102='1';s.textContent+=' · '+_T('one limb a week, back when the week ends · +20 fatigue after')}}
    {const bx=R.querySelector('.v101bx'),list=R.querySelector('aside.rm100list');
      if(bx&&list&&!list.querySelector('.v102inf')){const med=bx.querySelector('.v101med'),hy=bx.querySelector('.hyg87');if(med||hy){const c=document.createElement('div');c.className='v102inf';if(med)c.appendChild(med);if(hy)c.appendChild(hy);list.insertBefore(c,list.firstChild)}}}
    {const bd=R.querySelector('.iv90care [data-mg="build"][data-id="valet"]');if(bd&&bd.dataset.dis){bd.classList.add('off');bd.setAttribute('aria-disabled','true');
      const fl=pm.facWk===w.week;if(!fl&&pm.coin<FAC_COST[facLvl(pm,'valet')]&&!bd.querySelector('.v102why'))bd.insertAdjacentHTML('beforeend',`<span class="v102why">${_T`Treasury too low`}</span>`)}}
    return T.innerHTML}catch(e){console.error(e);return h}}}
try{if(typeof ROUT87_SUB!=='undefined')ROUT87_SUB.care=_T("2 of the Training Yard's hours a week, no drills")}catch(e){}

{const st=document.createElement('style');st.textContent=`
.v102inf{display:grid;gap:6px;margin:0 0 8px;padding:8px;border:1px solid #6b5236;border-radius:8px;background:#1f1711}
.v102inf .v101med{display:flex;align-items:center;justify-content:space-between;gap:8px;white-space:normal;font-size:12.5px}
.v102inf .v101med .btn{margin:0}
.aside .v102inf .hyg87,.v102inf .hyg87,.roomhd .v102inf .hyg87{position:relative!important;inset:auto!important;transform:none!important;max-width:none!important;width:auto;display:flex;flex-direction:row;align-items:center;justify-content:space-between;gap:8px;padding:6px 8px;margin:0}
.v102inf .hyg87 .btn{white-space:normal;flex:none}
.a1fw102{display:flex;flex-wrap:wrap;gap:3px;align-items:center}
.a1st102{font-size:11.5px;padding:0 6px;border-radius:9px;border:1px solid #8a7050;color:#e8d6b0;background:#2a1f17;white-space:nowrap}
.a1st102.bed{border-color:#c88070;color:#f6c2b6}
.rm100plt.off .v102why,.plantile.off .v102why{display:block;font-size:11px;color:#f09a88}
`;document.head.appendChild(st)}
}

/* M21 · Armory: starters in gold (display only) */
if(V102A.on){const base=mgrHTML;mgrHTML=function(){let h=base.apply(this,arguments);
  if(typeof MGR==='undefined'||MGR.tab!=='armory'||typeof h!=='string')return h;
  return h.replace(/class="ar94g ?(on)?" data-ar94g="([^"]+)"/g,(m,on,id)=>{const g=typeof gById==='function'?gById(id):null;const sl=g&&g.slot95;
    return sl>=1&&sl<=3?`class="ar94g${on?' on':''} st102" data-ar94g="${id}" data-st102="${['I','II','III'][sl-1]}"`:m})};
 const st=document.createElement('style');st.textContent=`.ar94g.st102{border-color:#d4a73c!important;box-shadow:0 0 0 1px #d4a73c,0 0 10px rgba(212,167,60,.45);position:relative}
.ar94g.st102::after{content:attr(data-st102);position:absolute;top:2px;right:5px;font:700 10px var(--serif,Georgia),serif;color:#f2d27a}`;document.head.appendChild(st)}

/* M22 · Armory: loaned fighters in their own small list above Damaged */
function ln102HTML(){const pm=typeof me==='function'?me():null;if(!pm)return '';const L=rosterOf(pm).filter(g=>g.loanFrom&&g.loanFrom.mid===pm.id);if(!L.length)return '';
  const row=g=>{const wk=g.loanFrom.weeks|0;
    return `<div class="ln102r">${gArt(g,'xs')}<span><b>${esc(g.name)}</b><small>${_T`lent out`}${wk?' · '+_T`${wk} wk`:''}</small></span></div>`};
  return `<div class="card2 ln102" id="ln102"><div class="sect" style="margin-top:0">${_T`🤝 On loan`} <span class="rc-sub">${L.length}</span></div>${L.map(row).join('')}</div>`}
if(V102A.on&&typeof armoryTab95==='function'){const base=armoryTab95;armoryTab95=function(){let h=base.apply(this,arguments);try{if(!h)return h;
    const pm=me();const ids=new Set(rosterOf(pm).filter(g=>g.loanFrom&&g.loanFrom.mid===pm.id).map(g=>g.id));
    if(ids.size){h=h.replace(/<button type="button" class="ar94g[^"]*" data-ar94g="([^"]+)"[\s\S]*?<\/button>/g,(m,id)=>ids.has(id)?'':m);
      h=h.replace('<aside class="ar96side">','<aside class="ar96side">'+ln102HTML())}}catch(e){console.error(e)}return h}}
if(V102A.on){const st=document.createElement('style');st.textContent=`.ln102{margin-bottom:10px}.ln102r{display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #3a2c20}.ln102r:first-of-type{border-top:0}
.ln102r span{display:grid;line-height:1.2}.ln102r small{color:var(--dim);font-size:11.5px}.ln102r img,.ln102r svg{width:30px;height:30px;border-radius:50%}`;document.head.appendChild(st)}
