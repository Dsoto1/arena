/* =====================================================================
   69-V56 · v0.56 THE LANISTA'S MAIL, AND HELP THAT KNOWS THE RATINGS
   =====================================================================
   1. MAIL — one inbox in Your ludus. Everything that used to stack as cards at the top of the tabs arrives as
      mail: offers (trade, pay-to-join, buying the ludus, the syndicate's loan), invitations (invitationals, the
      Flavian Awards), letters (Consilium, syndicate, gifts, the capital) and reports (the Quaestor's ledger, weekly
      growth, contracts ending, fighters asking for a fight). Offers and invitations keep their own buttons inside
      the letter. Live items are re-read from their sources each render (mailLive); every item is logged once in
      w.mailLog so past weeks stay readable after it is answered. Unread: w.mailRead. The Ludus tab shows the count;
      Match Week keeps one quiet line when the Consilium advises against entering.
   2. HELP — glossary terms for the five ratings and the syndicate; rating chips and sliders carry them as
      tooltips; both guides get a Ratings section; the Classes tips read the ratings; the Manager to-do list and
      the arena's strategy hints point at the next band.
   ===================================================================== */
/* ---------- 1. MAIL ---------- */
const MAIL_KINDS={offer:['📨','Offer'],invite:['🎟','Invitation'],letter:['✉','Letter'],report:['📜','Report']};
/* classify a card pulled from the old top-of-tab stack */
function mailClass(el){const c=el.className||'';const txt=(el.textContent||'').replace(/\s+/g,' ').trim();
  const title=((el.querySelector('b')||el.querySelector('.sect')||{}).textContent||txt).replace(/\s+/g,' ').trim().replace(/^[\p{Extended_Pictographic}\uFE0F\s]+/u,'').slice(0,90);
  if(/cartbox/.test(c))return null; /* Vulso's cart is a shop, not mail */
  if(/qscard/.test(c))return {kind:'report',from:"the Quaestor",title:"The Quaestor's ledger",seal:'🏛'};
  if(/fightreq/.test(c))return {kind:'report',from:'your barracks',title:'Fighters asking for a fight',seal:'🗣'};
  if(/payjoin/.test(c))return {kind:'offer',from:'a free agent',title,seal:'🪙'};
  if(/offerbox/.test(c))return {kind:'offer',from:'a rival house',title,seal:'📨'};
  if(/loanbox/.test(c))return {kind:'offer',from:"Sica's syndicate",title:'A rope, for a price',seal:'💸'};
  if(/lagbox/.test(c))return {kind:'letter',from:'the capital',title:'A letter from the capital',seal:'📜'};
  if(/invbox|specbox/.test(c))return {kind:'invite',from:/Flavian Awards/.test(txt)?'the Flavian Awards':'the editors',title,seal:'🎟'};
  return {kind:'offer',from:'—',title,seal:'📨'}}
const mailKey=(kind,title)=>kind+':'+hashStr(title.replace(/\d+/g,'#')).toString(36);
/* the cards the old stack produced (any tab), split into envelopes */
function mailFromHTML(html,out){if(!html)return;const t=document.createElement('template');t.innerHTML=html;
  for(const el of [...t.content.children]){const k=mailClass(el);if(!k){out.keep+=el.outerHTML;continue}
    out.items.push({...k,key:mailKey(k.kind,k.title),html:el.outerHTML})}}
/* mailLive — what is in the inbox right now: {items:[{key,kind,from,title,seal,html}], keep: html left on the page} */
let MAIL_BUSY=false;
function mailLive(bodyHTML){const w=W_();const out={items:[],keep:'',body:bodyHTML||''};MAIL_BUSY=true;
  try{const t0=MGR.tab;MGR.tab='ludus';try{mailFromHTML(MAIL_BASE_TOP(),out)}finally{MGR.tab=t0}
    /* the ludus page's own notices: awards, invitations, the loan offer, the capital's letter */
    if(out.body){const t=document.createElement('template');t.innerHTML=out.body;
      for(const el of [...t.content.querySelectorAll('.invbox,.specbox,.loanbox.offer,.lagbox')]){const k=mailClass(el);if(!k)continue;out.items.push({...k,key:mailKey(k.kind,k.title),html:el.outerHTML,body:1});el.remove()}
      out.body=t.innerHTML}
    for(const L of (w.letters||[]).filter(x=>x.until>=w.week&&!x.read))out.items.push({kind:L.kind||'letter',from:L.from,title:L.title,seal:L.seal||'✉',key:'L:'+L.key,html:`<div class="lbody">${L.body}</div>`,letter:L})}
  finally{MAIL_BUSY=false}
  return out}
let MAIL_BODYKEYS=[];
/* mailSync — the log: first sight is remembered, so past weeks stay readable once a letter is answered (Your ludus only) */
function mailSync(out){const w=W_();MAIL_BODYKEYS=out.items.filter(x=>x.body).map(x=>x.key);
  /* the log: first sight is remembered, so past weeks stay readable once a letter is answered */
  w.mailLog=w.mailLog||[];const live=new Set(out.items.map(x=>x.key));
  for(const it of out.items){let e=w.mailLog.find(x=>x.key===it.key&&x.open);if(!e){e={key:it.key,kind:it.kind,from:it.from,title:it.title,seal:it.seal,wk:w.week,s:w.season,open:true,body:it.letter?it.letter.body:''};w.mailLog.unshift(e)}it.wk=e.wk}
  for(const e of w.mailLog)if(e.open&&!live.has(e.key)){e.open=false;e.closedWk=w.week}
  w.mailLog=w.mailLog.slice(0,80);return out}
const mailUnread=items=>{const R=new Set(W_().mailRead||[]);return items.filter(x=>!R.has(x.key))};
function mailPanelHTML(live){const w=W_();const items=live.items;const un=new Set(mailUnread(items).map(x=>x.key));
  const env=it=>`<details class="mail ${it.kind}${un.has(it.key)?' unread':''}" data-mail="${esc(it.key)}" ${MGR.mailOpen===it.key?'open':''}><summary><span class="lseal">${it.seal}</span><b>${esc(it.title)}</b><span class="rc-sub">${MAIL_KINDS[it.kind][1]} · from ${esc(it.from)} · week ${wkOf(it.wk||w.week)}</span>${un.has(it.key)?'<span class="mnew">new</span>':''}</summary><div class="mbody">${it.html}</div>${it.letter?`<div class="acts"><button class="btn tksm" type="button" data-ltr="${esc(it.letter.key)}">File it away</button></div>`:''}</details>`;
  const past=(w.mailLog||[]).filter(e=>!e.open).slice(0,24);
  return `<div class="card2 mailbox" id="mailBox"><div class="mailhd"><b>📬 Mail</b><span class="rc-sub">${items.length?`${items.length} this week${un.size?` · <b>${un.size} unread</b>`:''}`:'nothing waiting this week'}</span></div>
    ${items.length?`<div class="mlist">${items.map(env).join('')}</div>`:''}
    ${past.length?`<details class="mpast"><summary>Past mail <span class="rc-sub">${past.length} kept</span></summary><div class="mlist">${past.map(e=>`<details class="mail old ${e.kind}"><summary><span class="lseal">${e.seal}</span><b>${esc(e.title)}</b><span class="rc-sub">${MAIL_KINDS[e.kind]?MAIL_KINDS[e.kind][1]:''} · from ${esc(e.from)} · S${e.s} W${wkOf(e.wk)}${e.closedWk&&e.kind!=='letter'&&e.kind!=='report'?' · answered or expired':''}</span></summary>${e.body?`<div class="mbody"><div class="lbody">${e.body}</div></div>`:''}</details>`).join('')}</div></details>`:''}</div>`}
/* the old stack stops printing at the top of the tabs: it is read through the mail */
const MAIL_BASE_TOP=buyOfferHTML;
buyOfferHTML=function(){if(MAIL_BUSY)return MAIL_BASE_TOP.apply(this,arguments);const w=W_();if(!w)return '';
  if(MGR.tab==='ludus'||MGR.tab==='recruit'){const t=document.createElement('template');t.innerHTML=MAIL_BASE_TOP.apply(this,arguments);return [...t.content.children].filter(el=>/cartbox/.test(el.className||'')).map(el=>el.outerHTML).join('')}
  return ''};
/* Your ludus: the mailbox first (its letters, offers and invitations come out of the page below) */
{const base=ludusTabHTML;ludusTabHTML=function(){const w=W_();const L0=w.letters;w.letters=[];let body;try{body=base.apply(this,arguments)}finally{w.letters=L0} /* the v0.55 letters strip moves into the mail */
  const live=mailLive(body);mailSync(live);return mailPanelHTML(live)+live.body}}
/* Match Week: one quiet line instead of the letters */
{const base=nightHTML;nightHTML=function(){const w=W_();const L0=w.letters;w.letters=[];let h;try{h=base.apply(this,arguments)}finally{w.letters=L0}
  const c=(w.letters||[]).find(x=>x.key==='consil-'+w.week&&x.until>=w.week);const fr=rosterOf(me()).filter(x=>x.wantFight&&x.wantFight.week===w.week);
  const lines=[c?`🏛 The Consilium advises against entering this week. <button class="btn tksm" type="button" data-mailgo="L:${esc(c.key)}">Read the letter</button>`:'',fr.length&&!(w.night&&w.night.bye)?`🗣 Asking for a fight: ${fr.map(x=>esc(x.name)).join(', ')} <span class="rc-sub">(enter them for +${FIGHT_REQ.moraleUp} morale)</span>`:''].filter(Boolean);
  return (lines.length?`<div class="mailline">${lines.map(l=>`<div>${l}</div>`).join('')}</div>`:'')+h}}
/* reading marks it read; a 'read the letter' link opens the mailbox at that letter */
document.addEventListener('toggle',e=>{const d=e.target;if(!d||!d.matches||!d.matches('details.mail[data-mail]')||!d.open)return;const w=W_();if(!w)return;w.mailRead=w.mailRead||[];
  if(!w.mailRead.includes(d.dataset.mail)){w.mailRead.push(d.dataset.mail);w.mailRead=w.mailRead.slice(-200);d.classList.remove('unread');const n=d.querySelector('.mnew');if(n)n.remove();saveWorld(true)}},true);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mailgo]');if(!b)return;e.stopPropagation();MGR.tab='ludus';MGR.mailOpen=b.dataset.mailgo;if(typeof MGR_REDRAW==='function')MGR_REDRAW();
  setTimeout(()=>{const el=document.querySelector(`details.mail[data-mail="${CSS.escape(b.dataset.mailgo)}"]`);if(el){el.open=true;el.scrollIntoView({block:'center'})}MGR.mailOpen=null},60)},true);
/* the left menu counts the unread */
{const base=mgrHTML;mgrHTML=function(){let h=base.apply(this,arguments);try{const w=W_();if(w&&!w.dead){const live=mailLive('');const keys=new Set([...live.items.map(x=>x.key),...MAIL_BODYKEYS]);const R=new Set(w.mailRead||[]);const n=[...keys].filter(k=>!R.has(k)).length;if(n)h=h.replace('🏛 Your ludus</button>',`🏛 Your ludus <span class="mcount" title="${n} unread letter${n===1?'':'s'}">✉ ${n}</span></button>`)}}catch(err){}return h}}
/* reports that used to be news lines: weekly growth and contracts ending arrive as mail too */
{const base=growthDigest;growthDigest=function(w){const sg=w.sgain||{};const rows=[];for(const [id,o] of Object.entries(sg)){const g=gById(id);if(!g)continue;
    const bits=STATS.filter(([k])=>o[k]>0).map(([k,n])=>{const v=gStats(g)[k];const nb=nextBand(k,v);return `${n} +${(+o[k]).toFixed(1)} <span class="rc-sub">(now ${v}${nb?`, ${nb-v} to the next band`:''})</span>`});
    if(bits.length)rows.push(`<li><b>${esc(g.name)}</b>: ${bits.join(' · ')}</li>`)}
  if(rows.length)sendLetter(w,{key:'grow-'+w.week,kind:'report',from:'your doctores',seal:'📈',title:'How the fighters grew this week',body:`<ul>${rows.join('')}</ul>`});
  return base.apply(this,arguments)}}
function contractReport(w){const exp=rosterOf(me()).filter(g=>g.contract&&g.contract.weeks<=2);if(!exp.length)return;
  sendLetter(w,{key:'contracts-'+w.week,kind:'report',from:'your clerk',seal:'📜',title:`Contract${exp.length===1?'':'s'} ending soon`,body:`<p>${exp.map(g=>`<b>${esc(g.name)}</b> (${g.contract.weeks} week${g.contract.weeks===1?'':'s'} left)`).join(', ')}. Re-sign from the fighter's card on the Roster tab before they walk.</p>`})}
{const base=endWeek;endWeek=async function(){const w0=W_();const r=await base.apply(this,arguments);try{const w=W_();if(r!==false&&w&&w===w0&&!w.dead&&!w.tutorial){contractReport(w);saveWorld()}}catch(e){console.error(e)}return r}}
/* ---------- 2. HELP ---------- */
Object.assign(GLOSS,{
  ratings:{t:'Ratings',re:/\bratings? bands?\b|\bfive ratings\b/i,d:'Five numbers from 50 to 99 every gladiator carries: [[spd|Speed]], [[str|Strength]], [[int|Intelligence]], [[lck|Luck]] and [[cha|Charisma]]. Crossing 76 (and higher bands) earns a perk. Perks pay only in rounds that allow class abilities, and they stack.'},
  spd:{t:'Speed',re:/\bSpeed (?=\d)/,d:'Movement. Base 3 (two legs); +1 at 76, +2 at 96. Grows with drills and fights.'},
  str:{t:'Strength',re:/\bStrength (?=\d)/,d:'Damage per successful attack: +1 at 76, +2 at 87, +3 at 96. Grows with drills, wins and kills.'},
  int:{t:'Intelligence',re:/\bIntelligence (?=\d)/,d:'How a CPU plays the gladiator: Easy below 76, Normal from 76, Hard from 96. Grows by surviving and winning.'},
  lck:{t:'Luck',re:/\bLuck (?=\d)/,d:'Coin each turn: +1 at 76, +2 at 96. Grows with time at a ludus and the bonds you build.'},
  cha:{t:'Charisma',re:/\bCharisma (?=\d)/,d:'Crowd Favor each turn: +1 at 76, +2 at 96. Grows with big crowds, high CF, fame and being spared.'},
  synd:{t:"Sica's syndicate",re:/Sica's syndicate/,d:'The lender of last resort: only to a house in the red, 12% a week added to the debt. Pay the weekly minimum by hand; three short weeks and a spear finds your best fighter.'}});
/* chips and sliders carry the glossary tooltips */
{const base=statChips;statChips=function(st,opt={}){return base.apply(this,arguments).replace(/<span class="statchip([^"]*)" title="([^"]*)">([^<]*)<b>/g,(m,c,t,ic)=>{const k=STATS.find(s=>s[2]===ic.trim());return `<span class="statchip${c}" data-tt="${k?k[0]:'ratings'}" aria-label="${t}">${ic}<b>`})}}
{const base=ratingsHTML;ratingsHTML=function(g){return base.apply(this,arguments).replace(/<span>([^<]*) (Speed|Strength|Intelligence|Luck|Charisma)<\/span>/g,(m,ic,n)=>`<span>${ic} <span class="gl" data-tt="${STATS.find(s=>s[1]===n)[0]}">${n}</span></span>`)}}
{const base=statSlidersHTML;statSlidersHTML=function(c){return base.apply(this,arguments).replace(/<span>([^<]*) (Speed|Strength|Intelligence|Luck|Charisma)<\/span>/g,(m,ic,n)=>`<span>${ic} <span class="gl" data-tt="${STATS.find(s=>s[1]===n)[0]}">${n}</span></span>`)}}
/* the guides: a Ratings section in both, and the Classes tips read the ratings */
const RATINGS_GUIDE=`<h4>Ratings: Speed, Strength, Intelligence, Luck, Charisma</h4><ul>
  <li><b>Every gladiator has five ratings</b> from 50 to 99. Classes set the loadout; the ratings set the perks. A Slave tends to be fast and a Soldier strong, but not every one is.</li>
  <li><b>Speed</b>: +1 movement at 76, +2 at 96. <b>Strength</b>: +1 damage per hit at 76, +2 at 87, +3 at 96. <b>Luck</b>: +1 coin a turn at 76, +2 at 96. <b>Charisma</b>: +1 CF a turn at 76, +2 at 96. They stack.</li>
  <li><b>When they pay</b>: only in rounds that allow class abilities. In a Classic event that is round 1, so a strong gladiator should hit early and hard.</li>
  <li><b>Intelligence</b> sets a CPU's mind — Novice below 65, Apprentice 65, Fighter 76, Veteran 86, Master 96. It never adds gear or coin.</li>
  <li><b>Read the chips</b> on each fighter panel: a gold chip is a perk earned; a glowing one is a top band (96+).</li></ul>`;
const RATINGS_MGR=`<h4>Ratings that grow</h4><ul>
  <li><b>Slow and steady</b>: a busy, winning fighter climbs about one band a season. Gains slow above 90 and stop at 99.</li>
  <li><b>What grows what</b>: Strength and Speed from the Training Yard (brutal drills most), fights survived and won, and kills. Intelligence from surviving and winning. Charisma from big CF, fame and being spared. Luck from weeks with your house and the bonds you build (meals, bonuses, kin tickets).</li>
  <li><b>Push a fighter over a line</b>: the to-do list flags anyone a few points short of a band; a personal trainer or brutal drills that week can earn the perk before the next Match Week.</li>
  <li><b>Watch the free agents</b>: they drill on their own, and rival yards train too. A fighter who reaches 96 makes the news.</li>
  <li><b>Your mail</b> carries a weekly growth report from the doctores; a new band also makes your ludus ledger.</li></ul>`;
{const base=playGuideHTML;playGuideHTML=function(){const h=base.apply(this,arguments);const i=h.indexOf('<details class="gsec"');return i<0?h.replace(/<\/div>\s*$/,RATINGS_GUIDE+'</div>'):h.slice(0,i)+`<details class="gsec" open><summary>Ratings: Speed, Strength, Intelligence, Luck, Charisma</summary><div class="gsecb">${RATINGS_GUIDE.replace(/^<h4>[^<]*<\/h4>/,'')}</div></details>`+h.slice(i)}}
{const base=mgrGuideHTML;mgrGuideHTML=function(){const h=base.apply(this,arguments);const i=h.indexOf('<details class="gsec"');return i<0?h.replace(/<\/div>\s*$/,RATINGS_MGR+'</div>'):h.slice(0,i)+`<details class="gsec"><summary>Ratings that grow</summary><div class="gsecb">${RATINGS_MGR.replace(/^<h4>[^<]*<\/h4>/,'')}</div></details>`+h.slice(i)}}
/* the Manager to-do list: who is a few points short of a band, and unread mail */
{const base=ludusTodos;ludusTodos=function(){const T=base.apply(this,arguments);try{const w=W_(),m=me();const go=(tab,l)=>`<button class="btn" type="button" data-mg="tab" data-id="${tab}" style="padding:2px 8px">${l}</button>`;
  const close=[];for(const g of rosterOf(m)){if(g.inj)continue;const st=gStats(g);for(const k of ['str','spd']){const nb=nextBand(k,st[k]);if(nb&&nb-st[k]<=3)close.push([g,k,nb])}}
  if(close.length){const [g,k,nb]=close.sort((a,b)=>(a[2]-gStats(a[0])[a[1]])-(b[2]-gStats(b[0])[b[1]]))[0];const n=STATS.find(s=>s[0]===k)[1];const after=k==='str'?`+${band3(nb)} damage`:`+${band2(nb)} movement`;
    T.unshift(['📈',`<b>${esc(g.name)}</b> is ${nb-gStats(g)[k]} ${n} from ${after} — standard or brutal drills, or a personal trainer, this week.`,go('practice','Training Yard')])}}catch(e){}return T}}
/* the arena's strategy hints: your perks this round, or why they rest */
{const base=strategyHints;strategyHints=function(p){const out=base.apply(this,arguments);try{if(!out||!p||!p.st||!S||S.phase!=='action'||!Array.isArray(out))return out;
  const per=statPerks(p.st);if(!per.length)return out;
  out.unshift(caAllowed()?`Your ratings pay this round: ${per.join(', ')}.`:`Class abilities are off this round, so your rating perks (${per.join(', ')}) rest until a round that allows them.`)}catch(e){}return out}}
/* ---------- styles for the mail ---------- */
{const st=document.createElement('style');st.textContent=`
.mailbox{border-color:#6a5130;margin-bottom:10px}.mailhd{display:flex;gap:10px;align-items:baseline;margin-bottom:6px}.mailhd b{font:400 19px var(--display);color:var(--gold2)}
.mlist{display:grid;gap:6px}.mail{background:var(--panel2);border:1px solid var(--line2);border-left:4px solid #c9a458;border-radius:6px;padding:5px 10px}
.mail.offer{border-left-color:#d6ab4c}.mail.invite{border-left-color:#8fc3ea}.mail.letter{border-left-color:#c9a458}.mail.report{border-left-color:#7f858c}.mail.old{opacity:.8}
.mail.unread{box-shadow:0 0 0 1px rgba(240,207,125,.45) inset}.mail summary{cursor:pointer;display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}.mail .lseal{font-size:16px}
.mail .mnew{font:700 10px var(--mono);letter-spacing:.08em;padding:1px 6px;border-radius:9px;background:var(--gold);color:#1a120c;text-transform:uppercase}
.mail .mbody{margin:6px 0 4px}.mail .mbody>.card2{margin:0;border:none;background:none;padding:2px 0;box-shadow:none}.mail .lbody{font-family:Georgia,serif;font-size:14px;line-height:1.5;color:var(--bone)}.mail .lbody p{color:var(--bone);margin:0 0 6px}.mail .lbody ul{margin:0 0 6px;padding-left:18px}
.mpast{margin-top:8px}.mpast>summary{cursor:pointer;color:var(--muted);font-size:13px}.mpast .mlist{margin-top:6px}
.mcount{display:inline-block;margin-left:4px;font:700 10px var(--mono);padding:1px 6px;border-radius:9px;background:var(--gold);color:#1a120c;vertical-align:1px}
.mailline{display:grid;gap:4px;margin-bottom:10px;padding:6px 10px;border:1px solid #6a5130;border-radius:6px;background:var(--panel2);font-size:13.5px}`;document.head.appendChild(st)}
/* the Play Now guide's dashboard: one more chart, wins by rating perk */
{const base=guideDashHTML;guideDashHTML=function(){const h=base.apply(this,arguments);const P=SIM50.perk;if(!P)return h;
  const lbl={0:'No perks',1:'One perk',2:'Two or more'};const rows=Object.entries(P.count).map(([k,v])=>({l:lbl[k]||k+' perks',v:v.win,tip:`${lbl[k]||k}: wins ${v.win}% · average ${v.cf} CF · ${v.n} gladiators`}));
  for(const [k,n] of [['coin','Luck +1'],['cf','Charisma +1'],['mv','Speed +1'],['dmg','Strength +1']])if(P[k]&&P[k]['1'])rows.push({l:n,v:P[k]['1'].win,tip:`${n}: wins ${P[k]['1'].win}% (without: ${P[k]['0'].win}%) · average ${P[k]['1'].cf} CF`});
  const chart=gvHBar('Win rate by rating perk','share of events won · hover for CF',rows,{max:40});
  return h.replace('</div>\n   <ul class="gfind">',chart+'</div>\n   <ul class="gfind">')}}
