/* =====================================================================
   95-V73 · v0.73 — Manager batch (Virgilante)
   =====================================================================
   • The rail: every tab with something left wears the same gold oval as Mail — Your ludus (tasks left), Recruiting
     (hours left), Training Yard (training hours left), Infirmary (fighters who need care). The Your ludus outline is
     muted like the others.
   • Scouting shows what it found on the free agent's card: the ratings (exact once scouted) and the personality tags.
   • The roster check ("Short-handed …") clears once a recruit is on your recruiting board.
   • Recruiting and training hours leave the header; each tab's banner carries its own count.
   • Every Manager tab has a scene banner (roomScene73); the "left to do" number sits at the banner's far right,
     in the same place on every tab (bannerStat73), only where the tab needs one.
   ===================================================================== */

/* ---------- what each tab has left ---------- */
function infirmNeed73(){const w=W_(),m=me();if(!w||!m)return 0;return rosterOf(m).filter(g=>g.inj&&!g.inj.war&&g.medWk!==w.week&&g.bathWk!==w.week).length}
function ludusTodo73(){try{return weekChecklist().filter(x=>!x.done).length}catch(e){return 0}}
function nightTodo73(){const w=W_(),m=me();if(!w||!m||!w.night)return null;const pend=(w.pend||[]).length;if(pend)return [pend,pend===1?'verdict waits':'verdicts wait'];
  const ros=rosterOf(m);const mine=new Set(ros.map(g=>g.id));const open=w.night.bouts.filter(b=>!b.done);const entered=open.filter(b=>b.ents.some(id=>mine.has(id))).length;
  const fit=ros.filter(g=>!g.inj&&g.morale>15).length;const want=Math.min(open.length,fit);return want>entered?[want-entered,want-entered===1?'bout to enter':'bouts to enter']:null}
function rosterTodo73(){const w=W_(),m=me();if(!w||!m)return null;const exp=rosterOf(m).filter(g=>g.contract&&g.contract.weeks<=1).length;return exp?[exp,exp===1?'contract ends':'contracts end']:null}
/* tab → [number, label, extra html] or null */
function tabStat73(k){const w=W_();if(!w||w.dead)return null;
  if(k==='ludus'){const n=ludusTodo73();return n?[n,n===1?'task left':'tasks left']:null}
  if(k==='recruit'){const h=w.hours||0,mx=hoursMax();return [h+' h',`of ${mx} left this week`,hoursPips73(h,mx,'#7fae5f')]}
  if(k==='practice'){const h=thLeft(w),mx=thMax();return h?[h+' h',`training hours of ${mx} left`,hoursPips73(h,mx,'#d9a441')]:null}
  if(k==='infirm'){const n=infirmNeed73();return n?[n,n===1?'needs care':'need care']:null}
  if(k==='night')return nightTodo73();
  if(k==='roster')return rosterTodo73();
  return null}
function hoursPips73(h,mx,col){return `<span class="hpips">${Array.from({length:mx},(_,i)=>`<i style="${i<h?`background:${col}`:''}"></i>`).join('')}</span>`}
function bannerStat73(k){const s=tabStat73(k);if(!s)return '';return `<div class="roomstat"><b>${s[0]}</b><span>${s[1]}</span>${s[2]||''}</div>`}

/* ---------- the scenes ---------- */
const BANNERS73={
  ludus:['🏛 Your ludus','the house, the ledger and the morning mail'],
  roster:['🛡 The roster','the men and women who carry your name onto the sand'],
  recruit:['🤝 Recruiting','the forum stalls, the dockside pits and a good word in the right ear'],
  board:['★ Favorites','names worth watching'],
  night:['⚔️ Match Week','three days of games — and the crowd keeps count'],
  exch:['💰 Wagers','where the smart money sits in the shade'],
  news:['📯 News','the criers, the walls and the gossip of the baths'],
  league:['📊 The league','every house, every point, twelve weeks long'],
  imp:['🌍 The Imperium','roads, legions, fans and weather from Gades to Antioch'],
  trophy:['🏆 Trophies','silver on the shelf, and room for more'],
  sched:['📅 The season','twelve weeks, two byes and the Grand Games'],
  me:['👤 The lanista','your seal, your temper and your reputation']};
function roomScene73(k){const sky=(a,b)=>`<defs><linearGradient id="b73${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect x="-700" width="2000" height="120" fill="url(#b73${k})"/>`;
  const col=(x,h=80,w=16,c='#d9cdb4')=>`<rect x="${x}" y="${118-h}" width="${w}" height="${h}" fill="${c}"/><rect x="${x-4}" y="${114-h}" width="${w+8}" height="6" fill="${c}"/><rect x="${x-4}" y="112" width="${w+8}" height="6" fill="${c}"/>`;
  const man=(x,y,c='#c98e62',s=1)=>`<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-46" r="7" fill="${c}"/><path d="M0-38v22M0-32l10 10M0-32l-10 10M0-16l-7 16M0-16l7 16" stroke="${c}" stroke-width="5" stroke-linecap="round"/></g>`;
  const crowd=(y,n,c)=>Array.from({length:n*3},(_,i)=>`<circle cx="${-592+i*(600/n)}" cy="${y+(i%3)*3}" r="5" fill="${c}"/>`).join('');
  let s='';
  if(k==='ludus')s=sky('#4a3424','#1e150e')+`<path d="M-700 50h2000v70H-700z" fill="#2a1d12"/><path d="M60 50L300 14 540 50z" fill="#6b4a2a"/>${[80,150,220,380,450,520].map(x=>col(x,68,14)).join('')}<rect x="270" y="62" width="60" height="56" rx="4" fill="#150e09" stroke="#c9a458" stroke-width="2"/><rect x="250" y="96" width="100" height="22" fill="#3a6a7a" opacity=".55"/>${man(120,118,'#e8dcc0',.8)}${man(480,118,'#c98e62',.8)}`;
  else if(k==='roster')s=sky('#3a2a1c','#1a120c')+`<rect x="-700" y="78" width="2000" height="8" fill="#5a3c22"/><rect x="-700" y="30" width="2000" height="6" fill="#5a3c22"/>${Array.from({length:27},(_,i)=>{const x=-536+i*64;return `<g transform="translate(${x} 74)"><path d="M-14 0q0-26 14-30q14 4 14 30z" fill="${['#9aa3ab','#c9a458','#8a6a44'][i%3]}"/><rect x="-10" y="-14" width="20" height="4" fill="#1a120c"/>${i%2?'<path d="M0-30v-12" stroke="#a3281f" stroke-width="5"/>':''}</g><path d="M${x+20} 26l18 50" stroke="#d8dde2" stroke-width="3"/>`}).join('')}`;
  else if(k==='recruit')s=sky('#c9925a','#5a3c22')+`<rect x="-700" y="84" width="2000" height="36" fill="#7a5a3a"/>${[30,230,430].map(x=>`<path d="M${x} 40h150l-10-14H${x+10}z" fill="#a3281f"/><path d="M${x} 40h150" stroke="#e8dcc0" stroke-width="3" stroke-dasharray="10 8"/><rect x="${x+8}" y="40" width="4" height="50" fill="#4a321c"/><rect x="${x+138}" y="40" width="4" height="50" fill="#4a321c"/><rect x="${x+20}" y="70" width="110" height="14" fill="#5a3c22"/>`).join('')}${man(105,98,'#c98e62',.7)}${man(305,98,'#e0b48c',.7)}${man(505,98,'#a8754e',.7)}${man(160,116,'#3a2a1c',.9)}${man(360,116,'#3a2a1c',.9)}`;
  else if(k==='board')s=sky('#2a1f30','#140f0b')+Array.from({length:60},(_,i)=>`<text x="${(i*97)%1800-600}" y="${20+(i*37)%90}" font-size="${10+(i%3)*5}" fill="#f0cf7d" opacity="${.3+(i%4)*.15}">★</text>`).join('')+`<rect x="220" y="30" width="160" height="70" rx="6" fill="#e9ddc0"/><path d="M236 50h128M236 64h110M236 78h120" stroke="#8a6a44" stroke-width="3"/>`;
  else if(k==='night')s=sky('#e0a35a','#7a3a1a')+`<rect x="-700" y="54" width="2000" height="66" fill="#8a5a34"/><path d="M0 120V54q300-60 600 0v66z" fill="#8a5a34"/>${[0,1,2].map(r=>Array.from({length:44},(_,i)=>`<path d="M${-660+i*44+(r%2)*22} ${66+r*16}q11-12 22 0" stroke="#4a2a14" stroke-width="5" fill="none"/>`).join('')).join('')}<ellipse cx="300" cy="118" rx="250" ry="12" fill="#d9b97e"/>${crowd(50,48,'#3a2014')}<path d="M300 8v34" stroke="#4a2a14" stroke-width="3"/><path d="M300 8l26 8-26 8" fill="#a3281f"/>`;
  else if(k==='exch')s=sky('#2a1d12','#140f0b')+Array.from({length:7},(_,i)=>{const x=60+i*80;const h=3+(i*5)%7;return Array.from({length:h},(_,j)=>`<ellipse cx="${x}" cy="${112-j*7}" rx="22" ry="6" fill="#e6b93a" stroke="#8a6414" stroke-width="2"/>`).join('')}).join('')+`<path d="M-660 30h1920" stroke="#c9a458" stroke-width="2" stroke-dasharray="4 6"/>`;
  else if(k==='news')s=sky('#c9b48a','#7a6444')+`<rect x="-700" y="90" width="2000" height="30" fill="#5a4a34"/>${[60,200,340,480].map((x,i)=>`<rect x="${x}" y="${24+i%2*6}" width="90" height="56" fill="#e9ddc0" stroke="#8a6a44" stroke-width="2" transform="rotate(${i%2?3:-3} ${x+45} 50)"/><path d="M${x+10} ${40+i%2*6}h70M${x+10} ${52+i%2*6}h60M${x+10} ${64+i%2*6}h66" stroke="#5c4c30" stroke-width="3" transform="rotate(${i%2?3:-3} ${x+45} 50)"/>`).join('')}${man(170,118,'#a8754e',.8)}<path d="M178 70l26-12v24z" fill="#c9a458"/>`;
  else if(k==='league')s=sky('#3a2a1c','#1a120c')+[[250,60,'#c9a458'],[150,40,'#9aa3ab'],[350,30,'#b07a4a']].map(([x,h,c])=>`<rect x="${x}" y="${118-h}" width="100" height="${h}" fill="${c}"/>`).join('')+`<g transform="translate(300 34)"><path d="M-30 0q30 30 60 0" stroke="#7ccf4f" stroke-width="5" fill="none"/></g>${[60,520].map(x=>`<rect x="${x}" y="20" width="16" height="98" fill="#4a321c"/><path d="M${x+16} 22h34v24h-34z" fill="#a3281f"/>`).join('')}`;
  else if(k==='imp')s=sky('#1c3a4a','#0f1c26')+`<rect x="-700" y="78" width="2000" height="42" fill="#3a5a3a"/><path d="M0 80q80-30 160-10t160 0 160-20 120 10v70H0z" fill="#3a5a3a"/><path d="M60 96q120-40 240-10t240-20" stroke="#c9a458" stroke-width="3" fill="none" stroke-dasharray="8 6"/>${[110,300,470].map(x=>`<circle cx="${x}" cy="${78+x%3*4}" r="7" fill="#a3281f" stroke="#f0cf7d" stroke-width="2"/>`).join('')}<g transform="translate(540 24)"><path d="M0 0v80" stroke="#c9a458" stroke-width="4"/><path d="M-18 6q18-12 36 0l-6 10q-12-8-24 0z" fill="#f0cf7d"/><rect x="-14" y="22" width="28" height="22" fill="#a3281f"/></g>`;
  else if(k==='trophy')s=sky('#2a1d12','#140f0b')+`<rect x="-700" y="92" width="2000" height="10" fill="#6b4a2a"/><rect x="-700" y="46" width="2000" height="8" fill="#6b4a2a"/>${[60,160,260,360,460,540].map((x,i)=>`<g transform="translate(${x} ${i%2?44:90})"><path d="M-14-30h28v10a14 14 0 0 1-28 0z" fill="${['#e6b93a','#c0c7cf','#b07a4a'][i%3]}"/><rect x="-3" y="-6" width="6" height="${i%2?0:4}" fill="#8a6414"/><rect x="-10" y="-4" width="20" height="4" fill="#8a6414"/></g>`).join('')}`;
  else if(k==='sched')s=sky('#c9925a','#6b4a2a')+`<circle cx="300" cy="120" r="90" fill="#e9ddc0" stroke="#8a6a44" stroke-width="4"/>${Array.from({length:12},(_,i)=>{const a=Math.PI*(1+i/11);return `<path d="M${300+Math.cos(a)*70} ${120+Math.sin(a)*70}L${300+Math.cos(a)*86} ${120+Math.sin(a)*86}" stroke="#5c4c30" stroke-width="${[3,10].includes(i)?6:3}"/>`}).join('')}<path d="M300 120L240 60" stroke="#3a2a1c" stroke-width="5"/>`;
  else if(k==='me')s=sky('#3a2430','#140f0b')+`<path d="M-700 120V70h2000v50z" fill="#2a1d12"/><g transform="translate(300 120)"><path d="M-46 0q0-40 46-44q46 4 46 44z" fill="#a3281f"/><circle cx="0" cy="-62" r="24" fill="#d9cdb4"/><path d="M-24-70q24-26 48 0" stroke="#7ccf4f" stroke-width="5" fill="none"/></g>${[120,480].map(x=>col(x,90,18)).join('')}`;
  else s=sky('#3a2a1c','#1a120c');
  return `<svg viewBox="0 0 600 120" preserveAspectRatio="xMidYMid meet" style="overflow:hidden" aria-hidden="true">${s}</svg>`}
/* the Wagers banner: this week's three bouts along the top (day, bout, event; ★ your fighter in it, ✓ fought, the next one lit) */
function weekStrip73(){const w=W_(),m=me();if(!w||!w.night)return '';const mine=new Set(rosterOf(m).map(g=>g.id));const DAY={under:'Fri',feature:'Sat',main:'Sun'};const nx=w.night.bouts.findIndex(b=>!b.done);
  return `<div class="b73wk">${w.night.bouts.map((b,i)=>`<span class="wkb ${b.done?'done':''} ${i===nx?'next':''}" title="${esc((TIERS[b.tier]||{}).n||'')} · ${esc(EVENTS[b.ev]?EVENTS[b.ev].n:'')}${b.ents.some(id=>mine.has(id))?' · your fighter is on this card':''}"><b>${DAY[b.tier]||''}</b> ${esc((TIERS[b.tier]||{}).n||'')} · ${esc(EVENTS[b.ev]?EVENTS[b.ev].n:'')}${b.ents.some(id=>mine.has(id))?' <i>★</i>':''}${b.done?' ✓':''}</span>`).join('')}</div>`}
function banner73(k){const B=BANNERS73[k];if(!B)return '';return `<div class="roomhd b73 b73-${k}">${roomScene73(k)}${k==='exch'?weekStrip73():''}<div class="roomttl"><b>${B[0]}</b><span>${B[1]}</span></div>${bannerStat73(k)}</div>`}

/* ---------- mgrHTML: banners, header hours out, rail ovals ---------- */
{const base=mgrHTML;mgrHTML=function(){let h=base.apply(this,arguments);try{const w=W_();if(!w||w.dead||MGR.view)return h;const k=MGR.tab;
  h=h.replace(/<span class="badge[^"]*"[^>]*>Recruiting hours [^<]*<\/span>/,'').replace(/<span class="badge[^"]*"[^>]*>Training hours [^<]*<\/span>/,'');
  if(/<div class="roomhd (infirm|yard)">/.test(h))h=h.replace(/(<div class="roomhd (infirm|yard)">[\s\S]*?<div class="roomttl">[\s\S]*?<\/div>)/,`$1${bannerStat73(k)}`);
  else if(BANNERS73[k])h=h.replace('<div class="railmain">',m0=>m0+banner73(k));
  /* the infirmary's " · N" in its label becomes the oval */
  h=h.replace(/⚕ Infirmary · \d+/,'⚕ Infirmary')}catch(e){console.error(e)}return h}}
/* the rail ovals (kept live by the sweep, like the hour chips of v0.65) */
setInterval(()=>{try{if(typeof W_!=='function'||!W_()||W_().dead)return;const w=W_();
  const vals={ludus:[ludusTodo73(),n=>`📋 ${n}`,n=>`${n} task${n===1?'':'s'} left this week`],recruit:[w.hours||0,n=>`${n} h`,n=>`${n} recruiting hours left`],practice:[thLeft(w),n=>`${n} h`,n=>`${n} training hours left`],infirm:[infirmNeed73(),n=>`⚕ ${n}`,n=>`${n} fighter${n===1?'':'s'} need care`]};
  for(const [k,[v,t,tt]] of Object.entries(vals)){const b=document.querySelector(`.mtabs [data-mg="tab"][data-id="${k}"]`);if(!b)continue;
    const old=b.querySelector('.hrchip');if(old)old.remove();let c=b.querySelector('.mcount.c73');
    if(!c){c=document.createElement('span');c.className='mcount c73';b.appendChild(c)}const txt=v?t(v):'';if(c.textContent!==txt){c.textContent=txt;c.title=v?tt(v):''}c.hidden=!v}}catch(e){}},500);

/* ---------- scouting: ratings + personality on the free agent's card ---------- */
function persTags73(g){if(g.report&&g.report.tags)return g.report.tags;try{const st=styleOf({cpu:true,pers:g.pers,diff:'normal',cls:CLASSES[g.cls]?g.cls:'soldier',stats:{},trophies:[],coin:0,cf:0});return PERS_KEYS.map(([k,l])=>[l,st[k]]).sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>x[0])}catch(e){return []}}
{const base=detailHTML;detailHTML=function(g){let h=base.apply(this,arguments);try{if(!g||g.contract||!h.includes('class="rsteps"'))return h;
  const tags=g.scout?persTags73(g):[];const add=(typeof ratingsHTML==='function'?ratingsHTML(g):'')+(g.scout?`<div class="sect">Personality</div><div class="ptags">${tags.map(t=>`<span class="badge gold">${esc(t)}</span>`).join(' ')||'<span class="rc-sub">—</span>'}</div>`:'<p class="rc-sub" style="margin:4px 0 0">Scout them to see their ratings and personality.</p>');
  const i=h.indexOf('<div class="rpane">');if(i>=0)h=h.slice(0,i)+`<div class="scoutsee">${add}</div>`+h.slice(i)}catch(e){console.error(e)}return h}}

(()=>{const st=document.createElement('style');st.textContent=`
.mtabs [data-id="ludus"].ludpend{border:1px solid rgba(214,171,76,.22)!important}
.mtabs button .mcount.c73{float:right;margin-left:6px}
.mtabs .hrchip{display:none!important}
.roomstat{position:absolute;right:14px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 16px;border:1px solid var(--gold);border-radius:999px;background:rgba(20,14,10,.78);box-shadow:0 4px 14px rgba(0,0,0,.5);min-width:96px}
.roomstat b{font:700 22px/1 var(--mono);color:#1a120c;background:var(--gold);border-radius:999px;padding:3px 12px}
.roomstat span{font-size:11.5px;color:#e8dcc0;letter-spacing:.03em;white-space:nowrap}
.hpips{display:flex;gap:2px;margin-top:2px}.hpips i{width:7px;height:7px;border-radius:2px;background:#3a2b1f;display:block}
.b73wk{position:absolute;left:0;right:0;top:4px;display:flex;justify-content:center;gap:8px;flex-wrap:wrap;padding:0 8px}.wkb{font-size:12px;color:#e8dcc0;background:rgba(20,14,10,.75);border:1px solid var(--line2);border-radius:999px;padding:2px 10px;white-space:nowrap}.wkb b{color:var(--gold2);font-family:var(--mono);font-size:11px}.wkb i{font-style:normal;color:var(--gold2)}.wkb.next{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold) inset}.wkb.done{opacity:.6}
.scoutsee{margin:6px 0 8px}.ptags{display:flex;gap:6px;flex-wrap:wrap}
@media (max-width:600px){.roomstat{right:8px;padding:4px 10px;min-width:0}.roomstat b{font-size:17px}}`;document.head.appendChild(st)})();

/* ---------- v0.73 fix: the Summa Rudis medallion beside Flavius hid his speech bubbles — it now waits behind an ⓘ ---------- */
let SR_OPEN=false;
function srBtnAt(x,y,d){const cv=document.getElementById('cv')||document.querySelector('.canvas-wrap canvas');if(!cv)return;const wrap=cv.parentElement;let b=document.getElementById('srInfo');
  if(!b){b=document.createElement('button');b.id='srInfo';b.type='button';b.className='srinfo';b.textContent='ⓘ';b.addEventListener('click',e=>{e.stopPropagation();SR_OPEN=!SR_OPEN;b.classList.toggle('on',SR_OPEN);try{draw()}catch(err){}});wrap.appendChild(b)}
  const k=cv.clientWidth/cv.width;const ox=cv.offsetLeft,oy=cv.offsetTop;b.style.left=(ox+x*k)+'px';b.style.top=(oy+(y+d*0.08)*k)+'px';b.hidden=false;
  const ev=typeof EV==='function'?EV():null;b.title=SR_OPEN?'Hide the Summa Rudis':`Summa Rudis${ev&&ev.sr?': '+ev.sr:''} — show the medallion`;b._t=Date.now()}
/* the button goes when the medallion is not drawn at all (setup, Flavius hidden, no event) */
setInterval(()=>{const b=document.getElementById('srInfo');if(b&&!b.hidden&&Date.now()-(b._t||0)>1500&&(!S||S.over||S.phase==='setup'))b.hidden=true},700);
(()=>{const st=document.createElement('style');st.textContent=`.srinfo{position:absolute;z-index:3;width:22px;height:22px;border-radius:50%;border:1px solid var(--gold);background:rgba(20,14,10,.85);color:var(--gold2);font:600 13px/1 var(--mono);cursor:pointer;padding:0;display:grid;place-items:center}.srinfo.on{background:var(--gold);color:#1a120c}`;document.head.appendChild(st)})();

/* ---------- v0.73: offer to clear the gladiators older builds recruited on their own (recruit:true, never fought) ---------- */
const oldRecruits73=()=>(typeof LUDUS_CACHE!=='undefined'?LUDUS_CACHE:[]).filter(g=>g&&g.recruit&&!(g.events>0));
{const base=ludusHTML;ludusHTML=async function(){let h=await base.apply(this,arguments);try{let off=false;try{off=localStorage.getItem('flavius_oldrec73')==='keep'}catch(e){}const L=oldRecruits73();
  if(L.length&&!off)h=`<div class="card2 oldrec"><b>🧹 ${L.length} gladiator${L.length===1?'':'s'} the ludus recruited on its own</b> <span class="rc-sub">older versions filled your roster with them; none has fought yet.</span><div class="acts" style="margin-top:6px"><button class="btn primary" type="button" data-oldrec="del">Remove them</button><button class="btn" type="button" data-oldrec="keep">Keep them</button></div></div>`+h}catch(e){console.error(e)}return h}}
document.addEventListener('click',async e=>{const b=e.target.closest('[data-oldrec]');if(!b)return;e.stopPropagation();
  if(b.dataset.oldrec==='keep'){try{localStorage.setItem('flavius_oldrec73','keep')}catch(err){}const c=b.closest('.oldrec');if(c)c.remove();return}
  const L=oldRecruits73();for(const g of L){await Store.del('gladiators',g.id).catch(()=>{})}LUDUS_CACHE=LUDUS_CACHE.filter(g=>!L.includes(g));
  const box=document.getElementById('ludusBody');if(box)box.innerHTML=await ludusHTML();if(typeof mToast==='function')mToast(`🧹 ${L.length} removed.`)},true);

/* ---------- v0.73: the ratings in the fighter panel's header start folded (until you open them) ---------- */
try{RAT_SHUT=localStorage.getItem('flavius_ratshut')!=='0'}catch(e){RAT_SHUT=true}

/* ---------- fix (v0.74): the Your ludus tab's ✓ follows the weekly checklist (the v0.49 check could say done with tasks left) ---------- */
{const base=mgrHTML;mgrHTML=function(){let h=base.apply(this,arguments);try{const w=W_();if(!w||w.dead)return h;const n=ludusTodo73();
  h=h.replace(/(<button[^>]*data-mg="tab" data-id="ludus"[^>]*class=")([^"]*)("[^>]*>)([\s\S]*?)(<\/button>)/,(m0,a,cls,c,lab,e)=>{cls=cls.replace(/\b(ludpend|luddone)\b/g,'').trim()+' '+(n?'ludpend':'luddone');
    lab=lab.replace(/<span class="tabchk"[^>]*>✓<\/span>/,'');return `${a}${cls}${c}${lab}${n?'':'<span class="tabchk" title="Everything here is done for the week">✓</span>'}${e}`})}catch(e){console.error(e)}return h}}

/* ---------- (v0.74) each tab with a to-do wears the green ✓ once its own work is done ----------
   Recruiting: no hours left · Training Yard: a regime set and no training hours left · Infirmary: nobody waiting for care ·
   Match Week: every bout fought and no verdict waiting. (Your ludus follows the weekly checklist, above.) */
function tabDone73(k){const w=W_(),m=me();if(!w||!m||w.dead)return false;
  if(k==='recruit')return !(w.hours>0);
  const sk=w.ckSkip&&w.ckSkip.wk===w.week&&w.ckSkip.s===w.season?w.ckSkip.keys:[]; /* dismissed items count as done */
  if(k==='practice')return (sk.includes('regime')||!!w.train&&w.train!=='off')&&(sk.includes('hours')||!(thLeft(w)>0&&rosterOf(m).length));
  if(k==='infirm')return infirmNeed73()===0||sk.includes('hurt');
  if(k==='night')return !!(w.night&&w.night.bouts.every(b=>b.done))&&!(w.pend||[]).length;
  return false}
{const base=mgrHTML;mgrHTML=function(){let h=base.apply(this,arguments);try{h=h.replace(/(⚔️ Match Week) ✓/,'$1')}catch(e){}return h}}
setInterval(()=>{try{if(typeof W_!=='function'||!W_()||W_().dead)return;for(const k of ['recruit','practice','infirm','night']){const b=document.querySelector(`.mtabs [data-mg="tab"][data-id="${k}"]`);if(!b)continue;
  const d=tabDone73(k);let c=b.querySelector('.tabchk.c73');if(d&&!c){c=document.createElement('span');c.className='tabchk c73';c.title='Done for the week';c.textContent='✓';b.appendChild(c)}else if(!d&&c)c.remove()}}catch(e){}},500);

/* ---------- (v0.74) optional checklist items can be dismissed for the week; only the verdicts (⚖) are required ---------- */
const CK_KEY={'⚕':'hurt','📜':'contract','🏋':'regime','⏳':'hours','⚔':'enter','🤝':'roster'};
{const base=weekChecklist;weekChecklist=function(){const I=base.apply(this,arguments);try{const w=W_();const sk=w.ckSkip&&w.ckSkip.wk===w.week&&w.ckSkip.s===w.season?w.ckSkip.keys:[];
  for(const x of I){const k=CK_KEY[x.ic];if(!k||x.done)continue;if(sk.includes(k)){x.done=true;x.txt+=' <span class="rc-sub">· dismissed</span>';x.skipped=true}
    else x.btn=(x.btn||'')+`<button class="btn tksm ckskip" type="button" data-ckskip="${k}" title="Not this week — take it off the list">Dismiss</button>`}}catch(e){console.error(e)}return I}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-ckskip]');if(!b)return;e.stopPropagation();const w=W_();if(!w)return;
  if(!w.ckSkip||w.ckSkip.wk!==w.week||w.ckSkip.s!==w.season)w.ckSkip={wk:w.week,s:w.season,keys:[]};if(!w.ckSkip.keys.includes(b.dataset.ckskip))w.ckSkip.keys.push(b.dataset.ckskip);saveWorld();MGR_REDRAW()},true);
(()=>{const st=document.createElement('style');st.textContent=`.wkbtn{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}.ckskip{opacity:.75}.ckskip:hover{opacity:1}`;document.head.appendChild(st)})();
