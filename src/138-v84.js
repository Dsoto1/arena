/* =====================================================================
   138-V84 · v0.84 (Virgilante's picks 2026-10-04)
   =====================================================================
   A. THE COUNCIL SPEAKS MORE — two more advisors write (131-v83council shows their face in the opened letter via L.adv):
      the Recruiter (recruiter84: a BARGAIN — a free agent who fills a gap, is affordable and asks ≤85% of what fighters of his
      level ask — else the ★ PICK OF THE WEEK: the best ✓ fit not suggested in the last 3 weeks) and the Medicus (medicus84:
      fatigue over 60 and not resting, a serious wound without a bed, on this week's card while worn down or missing a limb).
      At most one letter each a week, only with something to say; written at the start of a week (endWeek wrapper) and, for
      the Medicus only, when a hurt fighter is put on the card (ludusTabHTML wrapper). Buttons [data-rec84] / [data-med84].
   B. BOARD LIFE (cosmetic only — never the dice; Settings → Reduce motion honoured):
      • blood soaks in: bloodAt stamps the rotation (B.rot84); 07-ui's blood draw multiplies by bloodFade84(B) (full on its own
        rotation, then down to LIFE84.floor over LIFE84.fadeRot rotations) and browns it (bloodCol84), spreading a touch.
      • a fallen gladiator: one light puff of dust (dust84, once per gladiator per event) drifts in and settles where the corpse lies.
      • a toppled pillar's rubble drops and settles (rubbleSettle84, read by 07-ui's rubble draw; only rubble made in this
        session's doTopple — loaded rubble just lies there).
      • lighter board for older phones (lite84On): SETTINGS.lite84 auto|on|off — auto skips the sand grain/scars (136-v83sand
        SAND83 / SCAR83) when devicePixelRatio > 2 and the board is large. Settings → General → Visuals.
   C. ONE TAB PER SAVE — BroadcastChannel 'flavius_tabs'. A tab that opens a Manager career (poll of MGR.world) or loads a
      match save (matchLoad wrapper) asks the others; if one holds it, a centred ask76 popup: Continue here / Cancel. Continue
      tells the other tab ('take'), which shows #tab84 and stops saving (saveBlocked76 wrapper = the 109-v761 guard). While the
      question is open the asking tab does not save that career. A match loads first (matchLoad stays synchronous for
      onlmLoad) and asks after; Cancel ends it here.
   D. BACKUPS — navigator.storage.persist() once, quietly. A gentle nudge (#bk84; main menu + 📜 Saves, never over play) after a
      Manager season ends, every 10 events, or 14 days since the last backup: ⬇ Back up now (snapshotAll → downloadSnapshot) ·
      Remind me later (3 days). Any download counts (downloadSnapshot wrapper). Backups tab: last backup date, offline-only note,
      the standalone line. STANDALONE (file://): the Online button says "Online plays at flaviusrule.com/play" and opens it.
      State: localStorage flavius_bk84 {first,last,ev,season,later}.
   E. BROWSER-TRANSLATE SAFE — GAME_TERMS (+ event and beast names) stay English: a MutationObserver wraps them in
      <span translate="no" class="gt84"> inside text, marks names/brand/chips (NOTR84) translate="no", and stamps each button's
      English label (data-en84) on first sight so the few handlers that read a label still work after Chrome rewrites it.
   F. PHONE PASS — the Online market board kept its width on phones (.onl-wrap children min-width 0); in the Manager the
      bottom tab row, the "Running the ludus" tiles and the invitation lines stay inside the window (no sideways scroll).
   ===================================================================== */

/* ================= A · the Recruiter and the Medicus ================= */
const COUNCIL84={bargain:0.85,pickGap:3,fatRisk:60,cardFat:50}; /* TWEAK */
function council84Week(w){return w.season+'-'+w.week}
function recruiter84(w){const m=me();if(!w||!m||w.tutorial||w.dead)return null;const key='rec84-'+council84Week(w);if((w.letters||[]).some(l=>l.key===key))return null;
  const fa=freeAgents().filter(g=>g.alive&&!g.inj);if(fa.length<3)return null;
  const cname=g=>CLASSES[g.cls]?CLASSES[g.cls].name:g.cls;
  /* a bargain: a gap-filler he can afford, asking well below fighters of his level */
  const deals=[];for(const g of fa){const ov=effOvr(g);const peers=fa.filter(x=>x!==g&&Math.abs(effOvr(x)-ov)<=4);if(peers.length<2)continue;
    const avg=peers.reduce((a,x)=>a+askWage(x),0)/peers.length;const ask=askWage(g);const f=recFit(g,m);if(ask<=avg*COUNCIL84.bargain&&f.gap&&f.aff)deals.push({g,ask,avg:Math.round(avg),f})}
  deals.sort((a,b)=>effOvr(b.g)-effOvr(a.g));
  const seen=w.rec84=w.rec84||{};const recent=g=>seen[g.id]!=null&&w.week-seen[g.id]<COUNCIL84.pickGap;
  let L=null;const btn=g=>`<div class="acts"><button class="btn tksm" type="button" data-rec84="${esc(g.id)}">${_T`👁 See them in Recruiting`}</button></div>`;
  const d=deals.find(x=>!recent(x.g));
  if(d){const g=d.g;L={title:_T`A bargain: ${g.name}`,seal:'🪙',body:`<p>${_T`<b>${esc(g.name)}</b> · ${esc(cname(g))} · rating ${esc(estOvr(g).txt)} — asks <b>${d.ask}</b> a week. Fighters of that level ask about <b>${d.avg}</b>.`}</p><p>${esc(d.f.why)}.</p>${btn(g)}`}}
  else{const pick=fa.filter(g=>!recent(g)&&recFit(g,m).mark==='✓').sort((a,b)=>effOvr(b)-effOvr(a))[0];
    if(pick){const f=recFit(pick,m);L={title:_T`★ Pick of the week: ${pick.name}`,seal:'★',body:`<p>${_T`<b>${esc(pick.name)}</b> · ${esc(cname(pick))} · rating ${esc(estOvr(pick).txt)} · asks <b>${askWage(pick)}</b> a week.`}</p><p>${esc(f.why)}.</p>${btn(pick)}`,gid:pick.id}}}
  if(!L)return null;const gid=L.gid||(d&&d.g.id);seen[gid]=w.week;
  sendLetter(w,{key,kind:'letter',from:_T('your recruiter'),adv:'recruiter',seal:L.seal,title:L.title,body:L.body});return key}
function medicus84Risks(w){const m=me();if(!m)return [];const out=[];
  for(const g of rosterOf(m)){if(!g.alive)continue;const f=typeof gFat==='function'?gFat(g):0;const sev=(g.severed||[]).length;
    const card=typeof onCard==='function'&&onCard(g);
    if(card&&(f>COUNCIL84.cardFat||sev)){out.push({g,k:'card',t:_T`<b>${esc(g.name)}</b> is on this week's card ${sev?_T('missing a limb'):_T`worn down (fatigue ${f})`} — take them off before the arena does.`});continue}
    if(typeof serious76==='function'&&serious76(g)&&!(typeof inBed76==='function'&&inBed76(g))&&!(g.inj&&g.inj.war)){out.push({g,k:'bed',t:_T`<b>${esc(g.name)}</b>'s wound${g.inj&&g.inj.label?` (${esc(g.inj.label)})`:''} needs a bed and rest.`});continue}
    if(f>COUNCIL84.fatRisk&&g.restWk!==w.week)out.push({g,k:'fat',t:_T`<b>${esc(g.name)}</b> is worn out (fatigue ${f}) — a rest week before something tears.`})}
  return out}
function medicus84(w,onlyCard){if(!w||w.tutorial||w.dead)return null;const key='med84-'+council84Week(w);if((w.letters||[]).some(l=>l.key===key))return null;
  let R=medicus84Risks(w);if(onlyCard)R=R.filter(x=>x.k==='card');if(!R.length)return null;R=R.slice(0,3);
  sendLetter(w,{key,kind:'letter',from:_T('your medicus'),adv:'medicus',seal:'⚕',title:R.length>1?_T`${R.length} fighters at risk`:_T`${R[0].g.name} is at risk`,
    body:`<ul>${R.map(x=>`<li>${x.t}</li>`).join('')}</ul><div class="acts"><button class="btn tksm" type="button" data-med84="1">${_T`⚕ To the ward`}</button></div>`});return key}
{const base=endWeek;endWeek=async function(){const w0=W_();const s0=w0&&w0.season;const r=await base.apply(this,arguments);
  try{const w=W_();if(r!==false&&w&&w===w0&&!w.dead&&!w.tutorial){if(w.season>s0)bk84Bump('season');const a=recruiter84(w),b=medicus84(w);if(a||b)saveWorld()}}catch(e){console.error(e)}return r}}
{const base=ludusTabHTML;ludusTabHTML=function(){try{const w=W_();if(w&&medicus84(w,true))setTimeout(()=>{try{saveWorld()}catch(e){}},0)}catch(e){console.error(e)}return base.apply(this,arguments)}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-rec84],[data-med84]');if(!b||!W_())return;e.stopPropagation();
  if(b.dataset.rec84){MGR.tab='recruit';MGR.sel=b.dataset.rec84}else MGR.tab='infirm';if(typeof MGR_REDRAW==='function')MGR_REDRAW();const box=document.getElementById('mBody');if(box)box.scrollTop=0},true);

/* ================= B · board life ================= */
const LIFE84={fadeRot:4,floor:0.22,dustMs:1500,settleMs:700,dust:[]}; /* TWEAK: rotations to fade, the stain left, puff and settle times */
{const base=bloodAt;bloodAt=function(){const r=base.apply(this,arguments);try{if(S&&S.blood)for(const B of S.blood)if(B.rot84==null)B.rot84=S.rotation|0}catch(e){}return r}}
function bloodFade84(B){if(!S||!B)return 1;if(B.rot84==null)B.rot84=S.rotation|0;const age=Math.max(0,(S.rotation|0)-B.rot84);if(!age)return 1;
  return Math.max(LIFE84.floor,1-age*(1-LIFE84.floor)/LIFE84.fadeRot)}
const BLOODHEX84={};
function bloodCol84(hex,fa){if(fa>=0.999)return hex;const k=hex+'|'+fa.toFixed(2);if(BLOODHEX84[k])return BLOODHEX84[k];const t=(1-fa)*0.7;const a=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)),b=[0x4a,0x2c,0x1a];
  return BLOODHEX84[k]='#'+a.map((v,i)=>Math.round(v+(b[i]-v)*t).toString(16).padStart(2,'0')).join('')}
const life84Motion=()=>!HEADLESS&&typeof S!=='undefined'&&S&&!S.sim&&!S.snap&&(typeof animOn!=='function'||animOn())&&!(typeof reduceMotion==='function'&&reduceMotion());
let LIFE84_RAF=null;
function life84Busy(){const now=performance.now();LIFE84.dust=LIFE84.dust.filter(d=>now-d.t0<LIFE84.dustMs);return LIFE84.dust.length||RUB84.live>now}
function life84Loop(){if(LIFE84_RAF||HEADLESS)return;LIFE84_RAF=requestAnimationFrame(()=>{LIFE84_RAF=null;try{if(typeof fxRAF==='undefined'||!fxRAF)draw()}catch(e){}if(life84Busy())life84Loop()})}
/* the dust puff: once per fallen gladiator per event */
const DUST84_DONE=new WeakMap();
function dust84(r,c,id){if(!life84Motion()||r==null)return false;let set=DUST84_DONE.get(S);if(!set){set=new Set();DUST84_DONE.set(S,set)}if(set.has(id))return false;set.add(id);
  const a0=Math.random()*Math.PI*2;const parts=Array.from({length:9},(_,i)=>{const a=a0+(i/9)*Math.PI*1.3-0.65+(Math.random()-0.5)*0.4;return {a,d:0.34+Math.random()*0.16,s:0.18+Math.random()*0.12,h:0.08+Math.random()*0.18,w:Math.random()*0.25}});
  LIFE84.dust.push({r,c,t0:performance.now(),parts,id});life84Loop();return true}
{const base=eliminate;eliminate=function(victim,source){const was=!!(victim&&victim.alive);const r=base.apply(this,arguments);try{if(was&&victim&&!victim.alive&&!(source&&source.type==='retire')&&S&&S.players.includes(victim))dust84(victim.r,victim.c,victim.id)}catch(e){}return r}}
function drawDust84(){if(!LIFE84.dust.length||typeof ctx==='undefined')return;const now=performance.now();
  for(const D of LIFE84.dust){const k=(now-D.t0)/LIFE84.dustMs;if(k<0||k>=1)continue;const m=center(D.r,D.c);const e=1-Math.pow(1-k,2.2);
    ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';for(const p of D.parts){const d=p.d*(1-e*0.82);const x=m.x+Math.cos(p.a)*TW*d,y=m.y+Math.sin(p.a)*TW*d*0.5-TW*p.h*(1-e)-TW*0.02;const rad=TW*p.s*(0.7+e*0.9);
      const al=0.34*(k<0.15?k/0.15:1-(k-0.15)/0.85)*(1-p.w*0.6);if(al<=0)continue;ctx.fillStyle='rgb(170,140,100)';for(const f of [1,0.72,0.45]){ctx.globalAlpha=al*0.38;ctx.beginPath();ctx.ellipse(x,y,rad*f,rad*f*0.55,0,0,Math.PI*2);ctx.fill()}}ctx.restore()}}
{const base=drawFX;drawFX=function(){try{drawDust84()}catch(e){}return base.apply(this,arguments)}}
/* rubble settles: only rubble a topple made in this session */
const RUB84={t:new WeakMap(),live:0};
{const base=doTopple;doTopple=function(){const had=new Set(S&&S.rubble||[]);const p=base.apply(this,arguments);try{if(life84Motion()){const now=performance.now();for(const rb of S.rubble||[])if(!had.has(rb)){RUB84.t.set(rb,now);RUB84.live=Math.max(RUB84.live,now+LIFE84.settleMs+400)}if(RUB84.live>now)life84Loop()}}catch(e){}return p}}
function rubbleSettle84(rb,k,i){const t0=RUB84.t.get(rb);if(t0==null)return 0;const el=performance.now()-t0-k*110-i*28;if(el>=LIFE84.settleMs)return 0;if(el<0)return TW*(0.55+0.08*i);
  const u=el/LIFE84.settleMs;const b=u<0.62?1-Math.pow(u/0.62,2):0.16*Math.sin(Math.PI*(u-0.62)/0.38);return TW*(0.55+0.08*i)*Math.max(0,b)}
/* lighter board for older phones */
function lite84On(){const v=SETTINGS.lite84||'auto';if(v==='on')return true;if(v==='off')return false;const dpr=window.devicePixelRatio||1;return dpr>2&&(TW||0)*N*dpr>1600}
{const base=draw;draw=function(){if(!(typeof SAND83!=='undefined'&&lite84On()))return base.apply(this,arguments);const s0={g:SAND83.grain,s:SAND83.shade,a:typeof SCAR83!=='undefined'?SCAR83.alpha:0};
  SAND83.grain=0;SAND83.shade=0;if(typeof SCAR83!=='undefined')SCAR83.alpha=0;try{return base.apply(this,arguments)}finally{SAND83.grain=s0.g;SAND83.shade=s0.s;if(typeof SCAR83!=='undefined')SCAR83.alpha=s0.a}}}
{const base=settingsHTML;settingsHTML=function(tab){const h=base.apply(this,arguments);if(tab!=='general'&&tab)return h;try{const v=SETTINGS.lite84||'auto';
  const row=`<div class="setrow a11yrow"><span>${_T`<b>Light board for older phones</b>`}<br><span class="hint" style="margin:0">${_T`Skips the sand grain and scars. Auto: on sharp phone screens with a large board.`}</span></span><div class="seg">${[['auto',_T('Auto')],['on','On'],['off',_T('Off')]].map(([k,l])=>`<button type="button" data-lite84="${k}" class="${v===k?'on':''}">${l}</button>`).join('')}</div></div>`;
  const mark='<h4 style="grid-column:1/-1;margin:6px 0 0">Visuals</h4>';return h.includes(mark)?h.replace(mark,mark+row):h}catch(e){return h}}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-lite84]');if(!b)return;SETTINGS.lite84=b.dataset.lite84;applySettings();
  b.parentElement.querySelectorAll('[data-lite84]').forEach(x=>x.classList.toggle('on',x===b));try{if(S)draw()}catch(err){}});

/* ================= C · one tab per save ================= */
const TAB84={id:'t'+Math.random().toString(36).slice(2,10),held:new Set(),lost:new Set(),pend:null,missed:false,career:null,match:null,matchS:null,bc:null,wait:new Map()};
try{if(typeof BroadcastChannel==='function'&&!HEADLESS){TAB84.bc=new BroadcastChannel('flavius_tabs');TAB84.bc.onmessage=e=>tab84Msg(e.data||{})}}catch(e){}
function tab84Post(m){try{if(TAB84.bc)TAB84.bc.postMessage({...m,from:TAB84.id})}catch(e){}}
function tab84Msg(m){if(!m||m.from===TAB84.id)return;
  if(m.t==='who'&&TAB84.held.has(m.key)&&!TAB84.lost.has(m.key))tab84Post({t:'have',key:m.key,nonce:m.nonce});
  if(m.t==='have'){const f=TAB84.wait.get(m.nonce);if(f)f()}
  if(m.t==='take'&&TAB84.held.has(m.key)){TAB84.held.delete(m.key);TAB84.lost.add(m.key);tab84Lost(m.key)}}
const tab84Kind=key=>/^career:/.test(key)?'career':'match';
/* ask the other tabs; resolves true when this tab may keep the save */
async function tabClaim84(key){if(!TAB84.bc||TAB84.held.has(key))return true;TAB84.lost.delete(key);TAB84.pend=key;TAB84.missed=false;
  try{const nonce=Math.random().toString(36).slice(2);let seen=false;const got=new Promise(res=>{TAB84.wait.set(nonce,()=>{seen=true;res()});setTimeout(res,400)});tab84Post({t:'who',key,nonce});await got;TAB84.wait.delete(nonce);
    if(!seen){TAB84.held.add(key);return true}
    const what=tab84Kind(key)==='career'?_T('This career'):_T('This match');
    const ok=await ask76(_T`📑 ${what} is open in another tab`,_T`Continue here and the other tab stops saving it — or cancel and keep playing there.`,_T('Continue here'),_T('Cancel'));
    if(ok){tab84Post({t:'take',key});TAB84.held.add(key)}return ok}
  finally{TAB84.pend=null;if(TAB84.missed&&TAB84.held.has(key)&&tab84Kind(key)==='career'){TAB84.missed=false;try{saveWorld()}catch(e){}}}}
function tab84Lost(key){if(HEADLESS)return;let b=document.getElementById('tab84');if(!b){b=document.createElement('div');b.id='tab84';b.setAttribute('role','status');document.body.appendChild(b)}b.hidden=false;
  b.innerHTML=`${_T`<span>📑 <b>${tab84Kind(key)==='career'?_T('This career'):_T('This match')}</b> is now open in another tab — this tab has stopped saving.</span>`}<button type="button" class="btn tksm primary" data-tab84="go">${_T`Reload`}</button>`;
  try{mToast(_T('📑 Opened in another tab — this tab no longer saves.'))}catch(e){}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-tab84]');if(!b)return;e.preventDefault();e.stopPropagation();location.reload()},true);
/* the 109-v761 guard: a tab that gave its save away writes nothing more */
{const base=saveBlocked76;saveBlocked76=function(){if(TAB84.lost.size)return true;return base.apply(this,arguments)}}
{const base=saveWorld;saveWorld=function(){const w=W_();if(TAB84.pend&&w&&TAB84.pend==='career:'+w.id){TAB84.missed=true;return}return base.apply(this,arguments)}}
{const base=matchLoad;matchLoad=function(k){const snap=MSAVE_SLOTS.includes(String(k))?matchSlotGet(k):null;const r=base.apply(this,arguments); /* stays synchronous (onlmLoad relies on it); the question comes after */
  try{if(snap&&snap.game==='flavius-match'){const key='match:'+k+':'+snap.at;const S0=S;Promise.resolve(r).then(ok=>{if(!ok||S!==S0)return;if(TAB84.match&&TAB84.match!==key)TAB84.held.delete(TAB84.match);TAB84.match=key;TAB84.matchS=S0;
    return tabClaim84(key).then(mine=>{if(mine||S!==S0)return;TAB84.match=null;TAB84.matchS=null;S0.over=true;try{mToast(_T('⚔ Left in the other tab.'))}catch(e){}try{menuShow()}catch(e){}})}).catch(()=>{})}}catch(e){console.error(e)}return r}}
function tab84Sweep(){try{if(TAB84.match&&TAB84.matchS!==S){TAB84.held.delete(TAB84.match);TAB84.match=null;TAB84.matchS=null}
  const w=MGR.world;const key=w&&w.id&&!w.tutorial?'career:'+w.id:null;if(key===TAB84.career)return;if(TAB84.career)TAB84.held.delete(TAB84.career);TAB84.career=key;if(!key)return;bk84Set({mgr:1});
  tabClaim84(key).then(ok=>{if(ok||TAB84.career!==key)return;TAB84.career=null;if(MGR.world&&MGR.world.id===w.id){MGR.world=null;try{if(CUR_MODAL)CUR_MODAL.done(null)}catch(e){}}})}catch(e){console.error(e)}}
if(!HEADLESS)setInterval(tab84Sweep,500);

/* ================= D · backups ================= */
const BK84={key:'flavius_bk84',events:10,days:14,laterDays:3,url:'https://flaviusrule.com/play/'};
function bk84Get(){let o={};try{o=JSON.parse(localStorage.getItem(BK84.key)||'{}')||{}}catch(e){}if(!o.first){o.first=Date.now();try{localStorage.setItem(BK84.key,JSON.stringify(o))}catch(e){}}return o}
function bk84Set(p){const o={...bk84Get(),...p};try{localStorage.setItem(BK84.key,JSON.stringify(o))}catch(e){}return o}
function bk84Bump(k){const o=bk84Get();if(k==='ev')o.ev=(o.ev||0)+1;if(k==='season')o.season=1;bk84Set(o);try{bk84Paint()}catch(e){}}
function bk84Due(){const o=bk84Get();const now=Date.now();if(o.later&&now<o.later)return '';
  if(o.season)return _T('A Manager season ended');if((o.ev||0)>=BK84.events)return _T`${o.ev} events since your last backup`;
  const since=now-(o.last||o.first);if(since>=BK84.days*864e5&&((o.ev||0)>0||o.mgr))return o.last?_T`${Math.floor(since/864e5)} days since your last backup`:_T('No backup yet');return ''}
const bk84When=()=>{const o=bk84Get();return o.last?new Date(o.last).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'}):'never'};
const bk84Hosted=()=>/^https?:$/.test(location.protocol);
const BK84_OFF=_T('Want to play offline? Download the game, then back up here and Import in the download (Saves → Backups).');
function bk84HTML(why){return `<div class="bk84" id="bk84" role="note"><div class="bk84t">${_T`<b>⬇ Back up your saves</b><small>${esc(why)} · last backup: ${esc(bk84When())}</small><small>Careers, matches and creations live only in this browser — Online lives on the server.</small>`}</div><div class="bk84b"><button type="button" class="btn tksm primary" data-bk84="go">${_T`⬇ Back up now`}</button><button type="button" class="btn tksm" data-bk84="later">${_T`Remind me later`}</button></div></div>`}
function bk84Paint(){const mm=document.getElementById('mainMenu');if(!mm)return;let el=mm.querySelector('#bk84');const why=bk84Due();
  if(!why||mm.hidden){if(el)el.remove();return}const h=bk84HTML(why);if(el){if(el.dataset.why!==why){el.outerHTML=h;el=mm.querySelector('#bk84')}}
  else{const box=mm.querySelector('.mmbtns');if(!box)return;box.insertAdjacentHTML('afterend',h);el=mm.querySelector('#bk84')}if(el)el.dataset.why=why}
async function bk84Go(){try{await downloadSnapshot(await snapshotAll());return true}catch(e){try{mToast(_T('⚠ The backup could not be made here.'))}catch(err){}return false}}
{const base=downloadSnapshot;downloadSnapshot=async function(){const r=await base.apply(this,arguments);bk84Set({last:Date.now(),ev:0,season:0,later:0});try{bk84Paint()}catch(e){}return r}}
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('[data-bk84]');if(!b)return;e.preventDefault();e.stopPropagation();
  if(b.dataset.bk84==='later')bk84Set({later:Date.now()+BK84.laterDays*864e5});else await bk84Go();
  bk84Paint();for(const x of document.querySelectorAll('#hub76 #bk84'))x.remove();const hb=document.getElementById('hub76');if(hb&&typeof hubRedraw76==='function')hubRedraw76()},true);
{const base=menuShow;menuShow=function(){const r=base.apply(this,arguments);try{bk84Paint()}catch(e){}return r}}
{const base=hubBody76;hubBody76=async function(tab){let h=await base.apply(this,arguments);try{const why=bk84Due();if(why)h=h.replace('<div class="hub76body">',bk84HTML(why)+'<div class="hub76body">');
  if(tab==='backups'){const note=`<p class="bk84last">${_T`🗄 Last backup: <b>${esc(bk84When())}</b>. Backups cover the offline modes — Online progress lives on the server.`}</p>${bk84Hosted()?`<p class="rc-sub">${esc(BK84_OFF)}</p>`:'<p class="rc-sub">This downloaded copy keeps its own saves — Restore a backup from the site to carry careers over.</p>'}`;
    h=h.replace(/(<div class="hub76body">[\s\S]*?<\/p>)/,'$1'+note)}}catch(e){console.error(e)}return h}}
{const base=gameOver;gameOver=function(){try{if(!HEADLESS&&S&&!S.sim&&!S.onl&&!S.tutorial&&!GO84.has(S)){GO84.add(S);bk84Bump('ev')}}catch(e){}return base.apply(this,arguments)}}
const GO84=new WeakSet();
setTimeout(()=>{try{if(HEADLESS||!navigator.storage||!navigator.storage.persist)return;navigator.storage.persisted().then(p=>{if(!p)return navigator.storage.persist()}).catch(()=>{})}catch(e){}},1500);
/* the standalone (file://) has no online: the button points at the site */
const STANDALONE84=location.protocol==='file:';
{const base=onlMenuBtn;onlMenuBtn=function(){const r=base.apply(this,arguments);try{if(STANDALONE84){const b=document.querySelector('#mainMenu [data-mm="online"]');if(b){b.disabled=false;b.title=_T('Online plays at flaviusrule.com/play');b.dataset.std84='1';let s=b.querySelector('small');if(!s){s=document.createElement('small');b.appendChild(s)}s.textContent=_T('Online plays at flaviusrule.com/play')}}}catch(e){}return r}}
window.addEventListener('click',e=>{if(!STANDALONE84)return;const o=e.target.closest&&e.target.closest('#mainMenu [data-mm="online"]');if(!o)return;e.preventDefault();e.stopImmediatePropagation();
  try{window.open(BK84.url,'_blank','noopener')}catch(err){}},true);
if(STANDALONE84)document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#mainMenu [data-mm="multi"]'))setTimeout(()=>{try{onlMenuBtn()}catch(err){}},0)});

/* ================= E · browser-translate safe ================= */
const GAME_TERMS=[_T('Soldier'),_T('Royalty'),_T('Hero'),_T('Slave'),_T('Veteranus'),_T('Amazonia'),_T('Venatore'),_T('Damnatio'),_T('Tiro'),_T('Novicius'),_T('Gregarius'),_T('Primus Palus'),_T('Summa Rudis'),_T('Rudiarius'),_T('Invictus'),
  _T('Fate'),_T('Fates'),_T('Thumb of Flavius'),_T('Missio'),_T('Lanista'),_T('Domus'),_T('Mandata Flavi'),_T('Piacula'),'CF','AP','HP','PvE','PvP',_T('Focus'),_T('Tholo'),_T('Commodus'),_T('Zora'),_T('Leo'),_T('Leaena'),
  _T('Flavius'),_T('Ludus'),_T('Ludus Flavius'),_T('Naumachia'),_T('Familia'),_T('Juggernaut'),_T('Gauntlet'),_T('Orpheus'),_T('Golden Eagle'),_T('Triumviratus'),_T('Democritus'),_T('Egidious'),_T('Cassian'),_T('Ludi Infames'),_T('Arena Chest'),_T('Blessings'),_T('Hygeia'),_T('Praeco'),_T('Orbis Terrarum')];
let GT84_RE=null,GT84_N=0;
function gt84Re(){const ev=typeof EVENTS==='object'?Object.keys(EVENTS):[];if(GT84_RE&&GT84_N===ev.length)return GT84_RE;GT84_N=ev.length;const set=new Set(GAME_TERMS);
  for(const k of ev){const E=EVENTS[k];if(E&&!E.custom){if(E.n&&E.n.length<40)set.add(E.n);if(E.short&&E.short.length<30)set.add(E.short)}}
  try{for(const k of Object.keys(NPCT)){const n=NPCT[k]&&NPCT[k].n;if(n&&/^[A-Z][\w' ]{2,24}$/.test(n))set.add(n)}}catch(e){}
  const L=[...set].filter(Boolean).sort((a,b)=>b.length-a.length).map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  return GT84_RE=new RegExp(`(?<![\\w’'-])(?:${L.join('|')})(?![\\w’-])`,'g')}
const GT84_SKIP=new Set(['SCRIPT','STYLE','TEXTAREA','INPUT','SELECT','OPTION','LABEL','TITLE','NOSCRIPT','CANVAS','CODE','PRE','FONT']);
const GT84_NO='[translate="no"],.notranslate,svg,[contenteditable],[contenteditable=""],[contenteditable="true"]';
/* names, the brand and chips that are a name (translate="no" on the whole element) */
const NOTR84='#log b[style*="color"],.brand,.mmed,.mmlogo,.ed,.roundmk,.evchip75,.rtok,#menagBody .brow .t b,.c83p b,.adv83n b,.cls-name,.pname,.pb-name';
function gt84Text(n){const p=n.parentElement;if(!p||GT84_SKIP.has(p.tagName)||p.closest(GT84_NO))return;const s=n.data;if(!s||s.length<2)return;const re=gt84Re();re.lastIndex=0;if(!re.test(s))return;re.lastIndex=0;
  const fr=document.createDocumentFragment();let at=0,m;while((m=re.exec(s))){if(m.index>at)fr.appendChild(document.createTextNode(s.slice(at,m.index)));const sp=document.createElement('span');sp.className='gt84';sp.setAttribute('translate','no');sp.textContent=m[0];fr.appendChild(sp);at=m.index+m[0].length}
  if(at<s.length)fr.appendChild(document.createTextNode(s.slice(at)));n.replaceWith(fr)}
function gt84Btn(b){if(b.querySelector('font'))return;const t=(b.textContent||'').trim();if(t&&t.length<=80)b.dataset.en84=t}
function gt84Scan(root){if(!root)return;if(root.nodeType===3){gt84Text(root);return}if(root.nodeType!==1||GT84_SKIP.has(root.tagName))return;
  if(root.matches&&root.matches(NOTR84))root.setAttribute('translate','no');for(const el of root.querySelectorAll(NOTR84))el.setAttribute('translate','no');
  if(root.tagName==='BUTTON')gt84Btn(root);for(const b of root.querySelectorAll('button'))gt84Btn(b);
  {const b=root.closest&&root.closest('button');if(b&&b!==root)gt84Btn(b)}
  if(root.closest&&root.closest(GT84_NO))return;{const re=gt84Re();re.lastIndex=0;if(!re.test(root.textContent||''))return;re.lastIndex=0}const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const L=[];let n;while((n=tw.nextNode()))if(n.data.length>1)L.push(n);for(const x of L)gt84Text(x)}
let GT84_OBS=null;
function gt84Start(){if(HEADLESS||GT84_OBS||!document.body)return;try{gt84Scan(document.body)}catch(e){}
  GT84_OBS=new MutationObserver(recs=>{try{for(const r of recs){const font=[...r.addedNodes].some(n=>n.nodeType===1&&n.tagName==='FONT');if(font)continue; /* the translator's own work */
      const tb=r.target&&r.target.closest&&r.target.closest('button');if(tb&&r.addedNodes.length)gt84Btn(tb);
      for(const n of r.addedNodes){if(!n.isConnected)continue;gt84Scan(n)}}}catch(e){}GT84_OBS.takeRecords()});
  GT84_OBS.observe(document.body,{childList:true,subtree:true})}
if(document.body)setTimeout(gt84Start,0);else document.addEventListener('DOMContentLoaded',gt84Start);
try{document.documentElement.lang=document.documentElement.lang||'en'}catch(e){}

/* ================= styles (D, C, F) ================= */
{const st=document.createElement('style');st.textContent=`
#mainMenu .bk84,#hub76 .bk84{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;justify-content:space-between;max-width:460px;margin:10px auto 0;padding:8px 12px;border:1px solid #8a6a3a;border-radius:10px;background:rgba(28,20,13,.88);box-shadow:0 4px 14px rgba(0,0,0,.35);text-align:left}
#hub76 .bk84{max-width:none;margin:0 0 12px}
.bk84t{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1 1 240px;color:var(--bone,#efe3cc);font-size:14px}.bk84t small{color:var(--muted,#b3a58a);font-size:12px;line-height:1.3}
.bk84b{display:flex;gap:6px;flex-wrap:wrap}.bk84last{margin:10px 0 4px}
#tab84{position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:5001;display:flex;flex-wrap:wrap;gap:8px;align-items:center;max-width:calc(100vw - 32px);padding:8px 12px;background:var(--panel,#1f1711);border:1px solid #c0503a;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,.55);font-size:14px;color:var(--bone,#efe3cc)}
#tab84[hidden]{display:none}
@media(max-width:760px){#onl .onl-wrap>*{min-width:0}}
@media(max-width:600px){#mBody .badges.mhead{max-width:100%;min-width:0}#modal.full .railwrap>.tabrow,.railwrap>.tabrow{margin:0!important}.rundash .rtile2{min-width:0;overflow:hidden}.invline,.invt{min-width:0;flex-wrap:wrap}.invt b,.invt .rc-sub,.mail .sect .rc-sub{white-space:normal!important;overflow-wrap:anywhere}}
#mainMenu [data-mm="online"][data-std84] small{display:block!important}
`;document.head.appendChild(st)}
