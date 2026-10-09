/* =====================================================================
   270-V99DESK · v0.99 — THE LANISTA'S DESK (Manager → Your ludus; mock tools/plans/mock99/desk.html, plan DESK.md)
   =====================================================================
   The 📬 Mail panel and the ✅ weekly checklist (202's two-column .lrow91) become ONE card, #desk99 "🪶 The Lanista's desk":
   • header: N wait for you · M unread letters · 📜 Read the Acta Diurna (202's button, moved here);
   • THIS WEEK: one row per open item — weekChecklist() rows (src 'ck') + every letter/offer/invitation that needs an answer
     (src 'mail', from mailLive), sorted by urgency TIERS (1 required ⚖ ✝ 🦿 · 2 this week's card ⚔ ⭐ 🗣 · 3 answers with a
     deadline · 4 care ⚕ 🛏 📜 · 5 planning), then due week, then source order. Row = icon · line + due chip · 📜 (a letter stands
     behind it) · ONE action (the source's own button re-homed — never re-implemented; two+ answers or a form → "Decide ▾" opens the
     letter's own HTML INSIDE the row) · ✕ "not this week" (w.ckSkip; ⚖ ✝ 🦿 have no ✕). Done + dismissed rows fold
     ("✓ N done · K not this week"), a dismissed row has ↶ Back on the list. Phones (≤600 px): the first 6 rows, the rest fold ("▸ N more").
   • LETTERS: what needs no answer — the Week in review (202 .rev91 + 229 "From your Doctores") pinned first, then the unread
     envelopes, then the read ones (69's own details.mail, so read state, File it away and 131's advisor faces work as before),
     then "Past letters · N kept" (w.mailLog).
   • ONE rail count on Your ludus (.mcount.hot.dk99n = open This-week rows; 69's ✉ unread oval and 95's 📋 oval are gone/hidden),
     the banner box says the same number ("this week"); ludusTodo73 = that count (95's ✓, perf sweeps read it).
   • End the week: "You are about to skip" (88's .skiplist) lists the open This-week rows with lost / expires / until wk N chips.
   Classification: deskItems99() — a letter whose body holds a button (other than File it away) is a This-week row; sendLetter may
   pass an optional act:{ic,line,btn,due,tier} (stored on the letter by sendLetter's spread) to choose explicitly
   (act:false = always a letter). The Quaestor's ledger stays a letter (its Seal button lives inside).
   STATE: w.ckSkip {wk,s,keys} (checklist keys as before + mail keys), w.mailRead, w.mailLog — nothing new, no save change.
   Kill switch: localStorage flavius_desk99off=1 → the v0.91 layout. Test tv99k.
   ===================================================================== */
const DK99={c:null,ct:0,body:null,open:new Set(),all:false};
function desk99On(){try{return localStorage.getItem('flavius_desk99off')!=='1'}catch(e){return true}}
const DK99_REQ=['⚖','✝','🦿'];
/* the dismiss list of this week */
function dk99Skips(w){return w&&w.ckSkip&&w.ckSkip.wk===w.week&&w.ckSkip.s===w.season?w.ckSkip.keys:[]}
const dk99Plain=h=>String(h||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const dk99Key=(ic,txt)=>'ck:'+hashStr(ic+dk99Plain(txt).replace(/\d+/g,'#')).toString(36);
/* every checklist row: one dismiss key; the desk shows ✕ instead of 95's "Dismiss" button; later rows (🎓 ⭐ 🔒 🩹 🛡 …) may be dismissed too */
{const base=weekChecklist;weekChecklist=function(){const I=base.apply(this,arguments);try{if(!desk99On())return I;const w=W_();if(!w)return I;const sk=dk99Skips(w);
  for(const x of I){let k=null;const mt=/data-ckskip="([^"]+)"/.exec(x.btn||'');if(mt){k=mt[1];x.btn=x.btn.replace(/<button class="btn tksm ckskip"[^>]*>[\s\S]*?<\/button>/,'')}
    else if(x.skipped&&CK_KEY[x.ic])k=CK_KEY[x.ic];if(x.skipped)x.txt=String(x.txt).replace(/ <span class="rc-sub">· dismissed<\/span>$/,'');
    x.req99=DK99_REQ.includes(x.ic);if(!k&&!x.req99)k=dk99Key(x.ic,x.txt);x.k99=k;
    if(!x.done&&k&&!x.req99&&sk.includes(k)){x.done=true;x.skipped=true}}}catch(e){console.error(e)}return I}}
/* the ludus page's own notices (invitations, the loan offer…) are remembered from the last Your ludus render, so the count works on every tab */
{const base=mailLive;mailLive=function(bodyHTML){const out=base.apply(this,arguments);try{if(bodyHTML&&out&&out.items){const w=W_();DK99.body={wk:w.week,s:w.season,items:out.items.filter(x=>x.body)};DK99.c=null}}catch(e){}return out}}
/* ---------- classify ---------- */
const DK99_MERGE=[[/^L:med84-/,'⚕'],[/^L:contracts-/,'📜'],[/^L:fa85-/,'✝']];
function dk99Tmpl(html){const t=document.createElement('template');t.innerHTML=html||'';return t.content}
/* the source's action buttons (File it away and the 📜 links do not count) */
function dk99Acts(R){return [...R.querySelectorAll('button')].filter(b=>!b.hasAttribute('data-ltr')&&!b.hasAttribute('data-mailgo'))}
function dk99Due(w,until,nowLabel){if(until==null||until<=w.week)return {c:'now',t:nowLabel||_T('this week'),end:_T('expires'),wk:w.week};
  return {c:'wk',t:_T`answer by week ${wkOf(until)}`,end:_T`until wk ${wkOf(until)}`,wk:until}}
function dk99Mail(w,it){const R=dk99Tmpl(it.html);const L=it.letter;const cls0=((R.firstElementChild||{}).className)||'';
  const seal=it.seal||'✉';const title=String(it.title||'').replace(new RegExp('^'+RXE(seal)+'\\uFE0F?\\s*'),'');const row={src:'mail',key:it.key,ic:seal,kind:it.kind,ltr:it.key,html:it.html,title,from:it.from};it={...it,title};
  /* sendLetter's own choice */
  if(L&&L.act===false)return {...row,sec:'letter'};
  if(L&&L.act&&typeof L.act==='object'){const A=L.act;return {...row,sec:'week',tier:A.tier||3,ic:A.ic||row.ic,line:A.line||`<b>${esc(it.title)}</b>`,btn:A.btn||'',decide:!A.btn,
    due:A.due===false?null:dk99Due(w,typeof A.due==='number'?A.due:L.until),cls:'k-council'}}
  if(/qscard|lagbox/.test(cls0))return {...row,sec:'letter'};
  const acts=dk99Acts(R);const form=!!R.querySelector('input,select,textarea');
  if(/fightreq/.test(cls0)){const fr=rosterOf(me()).filter(x=>x.wantFight&&x.wantFight.week===w.week);const nm=fr.map(x=>esc(x.name)).join(', ');
    const b=acts[0]?acts[0].outerHTML.replace(/>[\s\S]*<\/button>$/,`>${fr.length===1?(fr[0].fem?_T('Enter her'):_T('Enter him')):_T('Enter them')}</button>`):'';
    return {...row,sec:'week',tier:2,cls:'k-fight',ltr:null,line:fr.length===1?_T`<b>${nm}</b> asks for a fight <span class="q">— +${FIGHT_REQ.moraleUp} morale if entered, −${FIGHT_REQ.moraleDown} if not</span>`:_T`<b>${nm}</b> ask for a fight <span class="q">— +${FIGHT_REQ.moraleUp} morale if entered, −${FIGHT_REQ.moraleDown} if not</span>`,
      btn:b,due:{c:'now',t:_T('this week'),end:_T('lost'),wk:w.week}}}
  if(/offerbox/.test(cls0)){const id=(R.querySelector('[data-m47="offyes"]')||{dataset:{}}).dataset.id;const o=(w.offers||[]).find(x=>x.id===id);let line=`<b>${esc(it.title)}</b>`;
    if(o){const m=mgrById(o.mid),g=gById(o.gid);const give=(o.give||[]).map(gById).filter(Boolean);if(m&&g)line=o.kind==='coin'?_T`<b>${esc(m.ludus)}</b> offers ${coinAmt87(o.coin)} for ${esc(g.name)}`:_T`<b>${esc(m.ludus)}</b> wants ${esc(g.name)} for ${give.map(x=>esc(x.name)).join(' & ')}${o.coin?' + '+coinAmt87(o.coin):''}`}
    return {...row,sec:'week',tier:3,cls:'k-offer',line,decide:true,due:dk99Due(w,o?o.until:w.week)}}
  /* 22's invitations card: the open invitations are the row (accepted ones need nothing) */
  if(/invbox/.test(cls0)&&R.querySelector('.invrow')){const live=R.querySelector('.invrow.live');const open=[...R.querySelectorAll('.invrow:not(.accepted):not(.live)')];
    if(live){const b=live.querySelector('button');return {...row,sec:'week',tier:2,cls:'k-invite',ltr:null,line:live.querySelector('.invt').innerHTML,btn:b?b.outerHTML:'',due:{c:'now',t:_T('this week'),end:_T('lost'),wk:w.week}}}
    if(!open.length)return {...row,sec:'letter'};
    const ivs=open.map(r=>{const b=r.querySelector('[data-mg="iv_open"]');const iv=b&&(w.invites||[]).find(x=>x.id===b.dataset.id);return {r,b,iv}});const first=ivs.reduce((a,x)=>x.iv&&(!a||!a.iv||x.iv.wk<a.iv.wk)?x:a,ivs[0]);
    const nm=first.r.querySelector('.invt b');const until=first.iv?first.iv.wk-1:w.week;
    return {...row,sec:'week',tier:3,cls:'k-invite',line:open.length===1?_T`<b>${nm?nm.innerHTML:esc(it.title)}</b> — the editors invite your fighters`:_T`<b>${open.length} invitations</b> to special events`,
      btn:open.length===1&&first.b?first.b.outerHTML:'',decide:open.length!==1||!first.b,due:dk99Due(w,until)}}
  if(!acts.length)return {...row,sec:'letter'};
  /* an answer is wanted: one plain button is re-homed, two or a form → Decide */
  const sect=R.querySelector('.sect');let line;
  if(L)line=_T`<b>${esc(it.title)}</b> <span class="q">— ${esc(it.from||'')}</span>`;
  else if(sect){const c=sect.cloneNode(true);const sub=c.querySelector('.rc-sub');const q=sub?dk99Plain(sub.innerHTML):'';if(sub)sub.remove();line=`<b>${esc(dk99Plain(c.innerHTML).replace(/^[\p{Extended_Pictographic}️\s]+/u,''))}</b>${q?` <span class="q">— ${esc(q)}</span>`:''}`}
  else line=`<b>${esc(it.title)}</b>${it.from&&it.from!=='—'?` <span class="q">— ${esc(it.from)}</span>`:''}`;
  const one=acts.length===1&&!form;const key=it.key;
  const tier=/^L:fa85-/.test(key)?1:/^L:med84-/.test(key)?4:/^L:rec(84|98)/.test(key)?5:3;
  const until=L?L.until:(()=>{const m=/week (\d+)/.exec(sect?dk99Plain(sect.innerHTML):'');return m?+m[1]+Math.floor((w.week-1)/12)*12:w.week})();
  return {...row,sec:'week',tier,cls:it.kind==='invite'?'k-invite':it.kind==='offer'?'k-offer':tier===4?'k-care':'k-council',line,
    btn:one?acts[0].outerHTML:'',decide:!one,req:tier===1,due:tier>=4?null:dk99Due(w,until)}}
const DK99_TIER={'⚖':1,'✝':1,'🦿':1,'⚔':2,'⭐':2,'🗣':2,'⚕':4,'🛏':4,'📜':4};
const DK99_CLS={'⚖':'k-fight','✝':'k-fight','🦿':'k-fight','⚔':'k-fight','⭐':'k-fight','⚕':'k-care','🛏':'k-care','📜':'k-care'};
/* deskItems99({items}) — every row of the desk: {sec:'week'|'letter', tier, due{c,t,end,wk}, ic, line, btn, decide, ltr, key, req, done, skipped, src} */
function deskItems99(o){const w=W_();if(!w||w.dead)return [];
  if(!o&&DK99.c&&DK99.c.w===w&&DK99.c.wk===w.week&&Date.now()-DK99.ct<3000)return DK99.c.rows;
  const sk=dk99Skips(w);const rows=[];let i=0;
  for(const x of weekChecklist()){const tier=DK99_TIER[x.ic]||5;const now=tier<=2||x.ic==='📜';
    rows.push({src:'ck',sec:'week',i:i++,tier,ic:x.ic,line:x.txt,btn:x.btn||'',key:x.k99||null,req:!!x.req99,done:!!x.done,skipped:!!x.skipped,cls:DK99_CLS[x.ic]||'k-plan',
      due:now&&!x.done?{c:'now',t:x.ic==='⚔'||x.ic==='⭐'?_T('bouts this week'):_T('this week'),end:_T('lost'),wk:w.week}:null})}
  let items=o&&o.items;if(!items){items=mailLive('').items.slice();const B=DK99.body;if(B&&B.wk===w.week&&B.s===w.season)for(const x of B.items)if(!items.some(y=>y.key===x.key))items.push(x)}
  for(const it of items){const mg=DK99_MERGE.find(([re])=>re.test(it.key));
    if(mg){const r=rows.find(r=>r.src==='ck'&&r.ic===mg[1]&&!r.done);if(r){r.ltr=it.key;r.lhtml=it.html;continue}}
    const r=dk99Mail(w,it);r.i=i++;if(r.sec==='week'){r.done=false;r.skipped=!r.req&&sk.includes(r.key);if(r.skipped)r.done=true}rows.push(r)}
  rows.sort((a,b)=>(a.sec===b.sec?0:a.sec==='week'?-1:1)||(a.sec==='week'?(a.tier-b.tier)||(((a.due&&a.due.wk)||999)-((b.due&&b.due.wk)||999)):0)||a.i-b.i);
  if(!o){DK99.c={w,wk:w.week,rows};DK99.ct=Date.now()}return rows}
const desk99Open=()=>deskItems99().filter(r=>r.sec==='week'&&!r.done);
/* any input may change what is left: the next read recomputes */
for(const ev of ['click','change','keydown'])document.addEventListener(ev,()=>{DK99.c=null},true);
{const base=endWeek;endWeek=async function(){DK99.c=null;try{return await base.apply(this,arguments)}finally{DK99.c=null}}}
/* ---------- the count ---------- */
{const base=ludusTodo73;ludusTodo73=function(){if(!desk99On())return base.apply(this,arguments);try{return desk99Open().length}catch(e){return base.apply(this,arguments)}}}
{const base=tabStat73;tabStat73=function(k){const r=base.apply(this,arguments);try{if(k==='ludus'&&desk99On()&&r)return [r[0],_T('this week')]}catch(e){}return r}}
/* ---------- the desk ---------- */
function dk99RowHTML(r,ix){const ok=r.key||r.ltr;const op=DK99.open.has(ok);const due=r.due?`<span class="due99 ${r.due.c}">${r.due.t}</span>`:'';
  const exp=r.src==='mail'?(r.decide||r.ltr?r.html:''):(r.lhtml||'');const hasExp=!!exp;
  const act=r.decide?`<button class="btn tksm dk99dec" type="button" data-dk99open="${esc(ok)}" aria-expanded="${op}">${op?_T('Decide ▴'):_T('Decide ▾')}</button>`:r.btn;
  const ltr=r.ltr&&hasExp?`<button class="dk99l" type="button" data-dk99open="${esc(ok)}" title="${_T`Read the letter`}" aria-label="${_T`Read the letter`}">📜</button>`:'';
  return `<div class="dk99row ${r.cls||'k-plan'}${op?' open':''}${ix>=6?' dk99more':''}" data-dk99="${esc(r.key||'')}" data-tier="${r.tier}"><span class="ic">${r.ic}</span><span class="tx"><span class="tl">${r.line}</span>${due}</span>`+
    `<span class="dk99b">${ltr}${act}</span>${r.req||!r.key?`<span class="dk99x lock" title="${_T`Required`}"></span>`:`<button class="dk99x" type="button" data-dk99x="${esc(r.key)}" title="${_T`Not this week`}" aria-label="${_T`Not this week`}">✕</button>`}`+
    (hasExp?`<div class="dk99ex mail ${r.kind||'letter'}"${op?'':' hidden'}><div class="mbody">${exp}</div></div>`:'')+`</div>`}
function desk99HTML(rows,unread){const w=W_();const open=rows.filter(r=>r.sec==='week'&&!r.done),done=rows.filter(r=>r.sec==='week'&&r.done);const dn=done.filter(r=>!r.skipped),sk=done.filter(r=>r.skipped);
  const more=open.length>6?open.length-6:0;
  return `<div class="dk99${DK99.all?' dk99all':''}" id="desk99"><div class="dk99hd"><h2>${_T`🪶 The Lanista's desk`}</h2><span class="rc-sub">${open.length?_T`<b>${open.length}</b> wait for you`:_T('nothing waits for you')} · ${unread===1?_T('1 unread letter'):_T`${unread} unread letters`}</span><span class="dk99acta"></span></div>
  <div class="dk99sec">${_T`This week`} <span class="n">${open.length?_T`· ${open.length} to do`:_T('· all done — end the week when ready')}</span></div>
  <div class="dk99tw">${open.map(dk99RowHTML).join('')}</div>
  ${more||done.length?`<div class="dk99foot">${more?`<button class="dk99mt" type="button" data-dk99more="1">${DK99.all?_T('▴ fewer'):_T`▸ ${more} more`}</button>`:''}${done.length?`<details class="dk99done"><summary>${sk.length?_T`✓ ${dn.length} done · ${sk.length} not this week`:_T`✓ ${dn.length} done`}</summary><div class="dl">${dn.map(r=>`<span>✓ ${dk99Plain(r.line)}</span>`).join('')}${sk.map(r=>`<span><s>${r.ic} ${dk99Plain(r.line)}</s> · ${_T`not this week`} <button class="btn tksm dk99bk" type="button" data-dk99back="${esc(r.key)}">${_T`↶ Back on the list`}</button></span>`).join('')}</div></details>`:''}</div>`:''}
  <div class="dk99sec">${_T`Letters`} <span class="n">${unread?_T`· ${unread} unread`:''}</span></div><div class="dk99lt mlist"></div></div>`}
function dk99PastHTML(w){const past=(w.mailLog||[]).filter(e=>!e.open).slice(0,24);if(!past.length)return '';
  return `<details class="mpast dk99past"><summary>${_T`Past letters`} <span class="rc-sub">${_T`${past.length} kept`}</span></summary><div class="mlist">${past.map(e=>`<details class="mail old ${e.kind}"><summary><span class="lseal">${e.seal}</span><b>${esc(e.title)}</b><span class="rc-sub">${_T`${MAIL_KINDS[e.kind]?MAIL_KINDS[e.kind][1]:''} · from ${esc(e.from)} · S${e.s} W${wkOf(e.wk)}`}</span></summary>${e.body?`<div class="mbody"><div class="lbody">${e.body}</div></div>`:''}</details>`).join('')}</div></details>`}
/* the final mgrHTML wrapper: the rail count everywhere; on Your ludus the desk replaces 202's mail + checklist row */
{const base=mgrHTML;mgrHTML=function(){DK99.c=null;let h=base.apply(this,arguments);try{const w=W_();const on=desk99On();if(document.body)document.body.classList.toggle('dk99on',on&&!!w);
  if(!w||w.dead||!on)return h;
  h=h.replace(/ ?<span class="mcount" title="[^"]*">✉ \d+<\/span>/,'');
  const n=ludusTodo73();h=h.replace(/(<button[^>]*data-mg="tab" data-id="ludus"[^>]*>)([\s\S]*?)(<\/button>)/,(m0,a,lab,e)=>`${a}${lab.replace(/<span class="mcount hot dk99n"[^>]*>\d+<\/span>/,'')}${n?`<span class="mcount hot dk99n" title="${n===1?_T('1 thing waits for you this week'):_T`${n} things wait for you this week`}">${n}</span>`:''}${e}`);
  if(MGR.view||MGR.tab!=='ludus')return h;
  const t=document.createElement('template');t.innerHTML=h;const R=t.content;const mail=R.querySelector('#mailBox');if(!mail)return h;const host=mail.closest('.lrow91')||mail;
  const env=new Map([...mail.querySelectorAll('details.mail[data-mail]')].map(d=>[d.dataset.mail,d]));
  /* the envelopes hold what mailLive saw this render (with 131's advisor heads): use their bodies */
  const items=mailLive('').items.slice();const B=DK99.body;if(B&&B.wk===w.week&&B.s===w.season)for(const x of B.items)if(!items.some(y=>y.key===x.key))items.push(x);
  for(const it of items){const d=env.get(it.key);const mb=d&&d.querySelector(':scope>.mbody');if(mb)it.html=mb.innerHTML}
  const rows=deskItems99({items});DK99.c={w,wk:w.week,rows};DK99.ct=Date.now();
  const R2=new Set(w.mailRead||[]);const lets=rows.filter(r=>r.sec==='letter');const unread=lets.filter(r=>!R2.has(r.key)).length;
  const dt=dk99Tmpl(desk99HTML(rows,unread));const desk=dt.firstElementChild;
  const acta=mail.querySelector('.acta91');if(acta){const s=desk.querySelector('.dk99acta');acta.classList.add('acta99');acta.innerHTML=`📜 <span class="al99">${_T`Read the Acta Diurna`}</span><span class="as99">${_T`Acta`}</span>`;acta.title=_T('Read the Acta Diurna');s.replaceWith(acta)}
  else desk.querySelector('.dk99acta').remove();
  const lt=desk.querySelector('.dk99lt');const rev=mail.querySelector('details.rev91');if(rev)lt.appendChild(rev);
  const used=new Set(rows.filter(r=>r.sec==='week').map(r=>r.key));for(const r of rows)if(r.src==='ck'&&r.ltr)used.add(r.ltr);
  const L=lets.map(r=>env.get(r.key)).filter(Boolean);const extra=[...env.values()].filter(d=>!used.has(d.dataset.mail)&&!L.includes(d)); /* nothing gets lost */
  for(const d of [...L,...extra].sort((a,b)=>(R2.has(a.dataset.mail)?1:0)-(R2.has(b.dataset.mail)?1:0)))lt.appendChild(d);
  if(!lt.children.length)lt.insertAdjacentHTML('beforeend',`<div class="rc-sub dk99none">${_T`No letters this week.`}</div>`);
  const past=dk99PastHTML(w);if(past)desk.insertAdjacentHTML('beforeend',past);
  host.replaceWith(desk);return t.innerHTML}catch(e){console.error(e)}return h}}
/* ---------- the rows' own controls ---------- */
function dk99Read(key){const w=W_();if(!w||!key)return;w.mailRead=w.mailRead||[];if(!w.mailRead.includes(key)){w.mailRead.push(key);w.mailRead=w.mailRead.slice(-200);saveWorld(true)}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-dk99x],[data-dk99back],[data-dk99open],[data-dk99more]');if(!t||!t.closest('#desk99'))return;
  e.preventDefault();e.stopPropagation();const w=W_();if(!w)return;DK99.c=null;
  if(t.dataset.dk99more){DK99.all=!DK99.all;const d=t.closest('#desk99');d.classList.toggle('dk99all',DK99.all);const n=d.querySelectorAll('.dk99tw>.dk99more').length;t.textContent=DK99.all?_T('▴ fewer'):_T`▸ ${n} more`;return}
  if(t.dataset.dk99open){const k=t.dataset.dk99open;const row=t.closest('.dk99row');const ex=row&&row.querySelector('.dk99ex');if(!ex)return;const op=!DK99.open.has(k);
    if(op)DK99.open.add(k);else DK99.open.delete(k);ex.hidden=!op;row.classList.toggle('open',op);const dec=row.querySelector('.dk99dec');if(dec){dec.textContent=op?_T('Decide ▴'):_T('Decide ▾');dec.setAttribute('aria-expanded',String(op))}
    if(op){const r=(deskItems99()||[]).find(x=>x.key===k||x.ltr===k);dk99Read(r&&r.ltr||k)}return}
  const k=t.dataset.dk99x||t.dataset.dk99back;if(!w.ckSkip||w.ckSkip.wk!==w.week||w.ckSkip.s!==w.season)w.ckSkip={wk:w.week,s:w.season,keys:[]};
  if(t.dataset.dk99x){if(!w.ckSkip.keys.includes(k))w.ckSkip.keys.push(k);DK99.open.delete(k)}else w.ckSkip.keys=w.ckSkip.keys.filter(x=>x!==k);
  saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);
/* ---------- End the week: the desk's open rows ---------- */
{const base=endConfirmHTML;endConfirmHTML=function(){let h=base.apply(this,arguments);try{if(!desk99On())return h;const i=h.indexOf('<div class="skiplist">');let cut=i>=0?cutDiv(h,i):null;if(cut)h=cut[1];
  const L=desk99Open().filter(r=>r.ic!=='⚖');if(!L.length)return h;const max=7;
  const li=r=>`<div class="sk99"><span>${r.ic}</span><span>${dk99Plain(r.line)}</span>${r.due?`<span class="due99 ${r.due.end===_T('lost')||r.due.end===_T('expires')?'now':'wk'}">${r.due.end}</span>`:'<span></span>'}</div>`;
  const rest=L.length-max;const html=`<div class="skiplist sk99l">${_T`<b>You are about to skip:</b>`}${L.slice(0,rest>0?max-1:max).map(li).join('')}${rest>0?`<div class="sk99"><span>…</span><span class="rc-sub">${_T`+ ${rest+1} more`}</span><span></span></div>`:''}</div>`;
  const a=h.indexOf('<div class="acts"><button class="btn primary" type="button" data-mg="endweek">');return a>=0?h.slice(0,a)+html+h.slice(a):h}catch(e){console.error(e)}return h}}
/* ---------- styles (mock desk.html) ---------- */
(()=>{const st=document.createElement('style');st.textContent=`
body.dk99on .mtabs [data-id="ludus"] .mcount.c73{display:none!important}
.mtabs .mcount.hot.dk99n,.mcount.hot.dk99n{background:#f0cf7d!important;color:#2a1708!important;box-shadow:inset 0 0 0 1px #a8802e!important;float:right;margin-left:6px}
#desk99{margin:0 0 12px;background:var(--panel2);border:1px solid #6a5130;border-radius:8px;padding:12px 14px 14px}
#desk99 .dk99hd{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:6px}
#desk99 .dk99hd h2{font:400 21px var(--display);color:var(--gold2);margin:0}
#desk99 .dk99hd .rc-sub b{color:var(--gold2)}
#desk99 .acta99{margin-left:auto;white-space:nowrap}#desk99 .acta99 .as99{display:none}
#desk99 .dk99sec{display:flex;align-items:center;gap:8px;font:11px var(--mono);letter-spacing:1.2px;text-transform:uppercase;color:var(--dim);margin:12px 0 6px}
#desk99 .dk99sec:after{content:"";flex:1;height:1px;background:var(--line2)}#desk99 .dk99sec .n{color:var(--gold2)}
#desk99 .dk99tw{display:grid;gap:4px}
#desk99 .dk99row{display:grid;grid-template-columns:28px minmax(0,1fr) auto 22px;align-items:center;gap:8px;min-height:38px;background:var(--panel);border:1px solid var(--line2);border-left:4px solid #6a5130;border-radius:6px;padding:4px 8px}
#desk99 .dk99row>.ic{font-size:17px;text-align:center}
#desk99 .dk99row>.tx{display:flex;align-items:baseline;min-width:0}#desk99 .dk99row>.tx>.tl{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}#desk99 .dk99row>.tx>.due99{flex:none}
#desk99 .dk99row>.tx b{color:var(--gold2)}#desk99 .dk99row .q{color:var(--muted);font-size:13px}
#desk99 .dk99b{display:flex;gap:6px;align-items:center;justify-content:flex-end;flex-wrap:wrap}
#desk99 .dk99b .btn{border-color:#8a6a2c;background:linear-gradient(#3a2a17,#2a1f17);color:var(--gold2);white-space:nowrap}
#desk99 .dk99row.k-fight .dk99b .btn{border-color:#8a3a2c;color:#ffd2c4;background:linear-gradient(#4a2017,#2a1712)}
#desk99 .dk99l{font-size:15px;background:none;border:0;cursor:pointer;padding:0 3px;border-radius:4px;filter:sepia(.3);color:inherit}#desk99 .dk99l:hover{background:rgba(240,207,125,.15)}
#desk99 .dk99x{box-sizing:border-box;min-width:0;min-height:0;width:22px;height:22px;border-radius:50%;border:1px solid transparent;background:none;color:var(--dim);font-size:13px;line-height:20px;text-align:center;cursor:pointer;padding:0}
#desk99 .dk99x:hover{border-color:var(--line2);color:var(--bone)}#desk99 .dk99x.lock{visibility:hidden}
#desk99 .k-fight{border-left-color:#d24a3a}#desk99 .k-offer{border-left-color:var(--gold)}#desk99 .k-invite{border-left-color:#8fc3ea}#desk99 .k-care{border-left-color:#6fae4c}#desk99 .k-plan{border-left-color:#9c8a6c}#desk99 .k-council{border-left-color:#c9a458}
#desk99 .dk99row.open{border-color:#7a5d2a;border-left-color:var(--gold);background:#251b12}
#desk99 .dk99ex{grid-column:2 / -1;margin:2px 0 6px;border-radius:5px;padding:8px 12px;border-left:0}
#desk99 .dk99ex .mbody{margin:0}
.due99{font:700 10px var(--mono);letter-spacing:.6px;text-transform:uppercase;border-radius:9px;padding:2px 7px;margin-left:6px;vertical-align:1px;white-space:nowrap}
.due99.now{background:#7a2219;color:#ffd9cf}.due99.wk{background:#5c4316;color:#f6dd95}
#desk99 .dk99foot{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;margin-top:6px;font-size:13px;color:var(--muted)}
#desk99 .dk99mt{display:none;background:none;border:0;color:var(--muted);font-size:13px;cursor:pointer;padding:0}
#desk99 .dk99done summary{cursor:pointer}
#desk99 .dk99done .dl{display:grid;gap:2px;margin:5px 0 0 22px}#desk99 .dk99done .dl span{color:var(--dim)}#desk99 .dk99done s{color:#8c7a64}
#desk99 .dk99bk{font-size:12px;padding:0 6px}
#desk99 .dk99lt{display:grid;gap:4px}
#desk99 .dk99lt>details.mail:not([open]):not(.unread):not(.rev91){opacity:.7}
#desk99 .dk99lt>details.mail>summary{flex-wrap:nowrap;white-space:nowrap;overflow:hidden}
#desk99 .dk99lt>details.mail>summary>.rc-sub{overflow:hidden;text-overflow:ellipsis;min-width:0}
#desk99 .dk99lt>details.mail>summary>.mnew{margin-left:auto}
#desk99 .dk99past{margin-top:8px}
.skiplist.sk99l .sk99{display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:6px;align-items:center;margin-top:3px}
@media(max-width:600px){
 #desk99{padding:10px 8px}#desk99 .dk99hd h2{font-size:19px}#desk99 .acta99 .al99{display:none}#desk99 .acta99 .as99{display:inline}
 #desk99 .dk99row{grid-template-columns:24px minmax(0,1fr) 32px;grid-template-rows:auto auto;row-gap:2px;padding:6px}
 #desk99 .dk99row>.tx{display:block;grid-column:2;grid-row:1;font-size:14px;line-height:1.25}#desk99 .dk99row>.tx>.tl{white-space:normal}
 #desk99 .dk99row>.ic{grid-row:1 / span 2;align-self:start;margin-top:2px}
 #desk99 .dk99row>.dk99x{grid-column:3;grid-row:1;align-self:start;justify-self:end;width:30px;height:30px;line-height:28px}
 #desk99 .dk99row>.dk99b{grid-column:2 / -1;grid-row:2}
 #desk99 .dk99row>.dk99ex{grid-column:1 / -1;grid-row:3}
 #desk99:not(.dk99all) .dk99tw>.dk99more{display:none}
 #desk99 .dk99mt{display:inline}
 #desk99 .dk99lt>details.mail>summary{white-space:normal;flex-wrap:wrap}}`;document.head.appendChild(st)})();
