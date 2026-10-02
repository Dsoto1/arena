/* =====================================================================
   108-V76 · v0.76 — one place for saves
   =====================================================================
   • ▶ Continue on the main menu: the single most recent thing played (a match slot, a Manager career, a missio or a
     tournament), named on the button. The game notes the latest activity in localStorage flavius_last76
     {kind,k|id,label,at}: matchSlotPut (manual saves + the autosave), saveWorld (every career save), a missio event
     starting, openTourn. If that save is gone, the next most recent one is offered; nothing saved → no button.
   • 📜 Saves (savesHub76): Matches (the three slots + autosave, matchSavesHTML) · Careers (▶ Continue each, Manage →
     the Manager's own careers view) · Campaigns (active missios, the tournament) · Backups (export everything now;
     restore and manage → Settings → Saves). Play Now's Load/Manage open it on Matches.
   ===================================================================== */
const LAST76_KEY='flavius_last76';
function last76Get(){try{return JSON.parse(localStorage.getItem(LAST76_KEY)||'null')}catch(e){return null}}
function last76Note(o){if(typeof HEADLESS!=='undefined'&&HEADLESS)return;try{localStorage.setItem(LAST76_KEY,JSON.stringify({...o,at:Date.now()}))}catch(e){}}
const tAgo76=at=>{try{return new Date(at).toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}catch(e){return ''}};
{const base=matchSlotPut;matchSlotPut=function(k,snap){const r=base.apply(this,arguments);try{if(r&&snap&&!(S&&S.sim))last76Note({kind:'match',k,label:snap.summary||snap.name||'a match'})}catch(e){}return r}}
{const base=saveWorld;saveWorld=function(){const r=base.apply(this,arguments);try{const w=W_();if(w&&!w.tutorial&&!w.dead){const m=me();last76Note({kind:'career',id:w.id,label:`${m.ludus} · season ${w.season}, week ${wkOf(w.week)}`})}}catch(e){}return r}}
{const base=openTourn;openTourn=function(){try{if(TOURN)last76Note({kind:'tourn',label:TOURN.name||'the tournament'})}catch(e){}return base.apply(this,arguments)}}
{const base=startEvent;startEvent=function(){const r=base.apply(this,arguments);try{if(S&&S.missio&&!S.sim)last76Note({kind:'missio',id:S.missio.id,label:`Missio · ${S.missio.name} · step ${S.missio.step+1}/5`})}catch(e){}return r}}
/* what Continue would open now — the noted activity if it still exists, else the newest match save */
async function continue76(){const L=last76Get();
  const ok=async o=>{if(!o)return false;if(o.kind==='match')return !!matchSlotGet(o.k);if(o.kind==='tourn')return !!TOURN;
    if(o.kind==='career'){const c=await Store.list('mgrCareers').catch(()=>[]);return c.some(x=>x.id===o.id&&!x.dead)}
    if(o.kind==='missio'){const m=await Store.list('missios').catch(()=>[]);return m.some(x=>x.id===o.id&&x.status==='active')}return false};
  if(await ok(L))return L;
  const cands=[];for(const k of MSAVE_SLOTS){const sv=matchSlotGet(k);if(sv)cands.push({kind:'match',k,label:sv.summary||sv.name,at:Date.parse(sv.at)||0})}
  try{const c=(await Store.list('mgrCareers')).filter(x=>!x.dead);for(const x of c)cands.push({kind:'career',id:x.id,label:`${x.ludus} · season ${x.season}, week ${wkOf(x.week)}`,at:Date.parse(String(x.updated).replace(' ','T'))||0})}catch(e){}
  cands.sort((a,b)=>b.at-a.at);return cands[0]||null}
function continueGo76(o){if(!o)return;
  if(o.kind==='match'){menuHide();setTimeout(()=>matchLoad(o.k),60);return}
  if(o.kind==='career'){MGR.pendingLoad=o.id;mmLaunch(()=>openManager(),'Manager mode');return}
  if(o.kind==='tourn'){mmLaunch(()=>openTourn(),'the tournament');return}
  if(o.kind==='missio'){mmLaunch(()=>{CFG.mode='missio';const r=openSetup();setTimeout(function f(n){const b=document.querySelector(`#mBody [data-cont="${o.id}"]`);if(b)b.click();else if(n<20)setTimeout(()=>f(n+1),200)},300,0);return r},'the missio')}}
/* the menu buttons */
async function mmSaves76(){const box=document.querySelector('#mainMenu .mmbtns');if(!box)return;const play=box.querySelector('[data-mm="play"]');if(!play)return;
  let cb=box.querySelector('[data-mm="continue"]');const o=await continue76().catch(()=>null);
  if(o){if(!cb){cb=document.createElement('button');cb.type='button';cb.className='btn primary mmcont76';cb.dataset.mm='continue';play.before(cb)}
    const ic={match:'⚔️',career:'💼',tourn:'🏆',missio:'🗡'}[o.kind]||'▶';cb.innerHTML=`▶ Continue<small>${ic} ${esc(o.label||'')}${o.at?' · '+esc(tAgo76(o.at)):''}</small>`;cb._o76=o;play.classList.remove('primary')}
  else{if(cb)cb.remove();play.classList.add('primary')}
  if(!box.querySelector('[data-mm="saves"]')){const sb=document.createElement('button');sb.type='button';sb.className='btn';sb.dataset.mm='saves';sb.innerHTML='📜 Saves<small>matches, careers, campaigns, backups</small>';const st=box.querySelector('[data-mm="studio"]');(st||play).before(sb)}}
{const base=menuShow;menuShow=function(){const r=base.apply(this,arguments);try{mmSaves76()}catch(e){}return r}}
setTimeout(()=>{try{mmSaves76()}catch(e){}},400);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#mainMenu [data-mm="continue"],#mainMenu [data-mm="saves"]');if(!b)return;e.stopPropagation();e.preventDefault();
  if(b.dataset.mm==='continue')continueGo76(b._o76);else savesHub76('matches')},true);

/* the Saves window */
const HUB76={tab:'matches'};
async function hubBody76(tab){const T=[['matches','⚔️ Matches'],['careers','💼 Careers'],['campaigns','🗡 Campaigns'],['backups','🗄 Backups']];
  const tabs=`<div class="seg hub76tabs" role="tablist">${T.map(([k,l])=>`<button type="button" role="tab" data-hub76="${k}" class="${tab===k?'on':''}" aria-selected="${tab===k}">${l}</button>`).join('')}</div>`;
  let body='';
  if(tab==='matches')body=`<div id="msWin" data-mode="">${matchSavesHTML('')}</div>`;
  if(tab==='careers'){const L=(await Store.list('mgrCareers').catch(()=>[])).sort((a,b)=>String(b.updated).localeCompare(String(a.updated)));
    body=L.length?`<div class="hub76list">${L.map(c=>`<div class="hub76card ${c.dead?'dead':''}"><div><b>${esc(c.ludus||'Ludus')}</b><small>${esc(c.name||'')} · season ${c.season}, week ${wkOf(c.week)}${c.dead?' · closed':''}</small><small>⭐ ${c.fame||0} fame · ${c.coin||0} coin · ${c.wins||0} wins in ${c.bouts||0} · saved ${esc(c.updated||'')}</small></div>${c.dead?'':`<button type="button" class="btn primary" data-hubcar="${esc(c.id)}">▶ Continue</button>`}</div>`).join('')}</div>`:'<p class="rc-sub">No Manager careers yet.</p>';
    body+=`<div class="mbtns"><button type="button" class="btn" data-hubmgr="manage">🗂 Rename, export or delete careers</button><button type="button" class="btn" data-hubmgr="new">➕ A new career</button></div><p class="rc-sub">Finished careers rest in the Annals (Ludus Archives).</p>`}
  if(tab==='campaigns'){const M=(await Store.list('missios').catch(()=>[])).filter(m=>m.status==='active');
    body=`<h4 class="secth" style="margin-top:0">🗡 Missios</h4>${M.length?`<div class="hub76list">${M.map(m=>`<div class="hub76card"><div><b>${esc(m.name)}</b><small>${esc((CLASSES[m.cls]||{}).name||m.cls)} · step ${m.step+1} of 5 · carrying ${m.cfCarry||0} CF · Royal Reserve ${m.rr||0}</small></div><button type="button" class="btn primary" data-hubmis="${esc(m.id)}">▶ Continue</button></div>`).join('')}</div>`:'<p class="rc-sub">No missio under way. Start one from Play now → Missio.</p>'}
     <h4 class="secth">🏆 Tournament</h4>${TOURN?`<div class="hub76list"><div class="hub76card"><div><b>${esc(TOURN.name||'Tournament')}</b><small>in progress</small></div><button type="button" class="btn primary" data-hubtourn="1">▶ Resume</button></div></div>`:'<p class="rc-sub">No tournament under way. Start one from Play now → Tournament.</p>'}`}
  if(tab==='backups')body=`<p>A backup holds <b>everything this browser remembers</b>: careers, matches, the Ludus, your creations, the Annals and settings. Keep one before clearing your browser or to move to another device.</p>
    <div class="mbtns"><button type="button" class="btn primary" data-hubbk="export">⬇ Download a backup now</button><button type="button" class="btn" data-hubbk="manage">🗄 Restore or manage backups</button></div>`;
  return tabs+`<div class="hub76body">${body}</div>`}
async function savesHub76(tab){if(typeof modalBusy==='function'&&modalBusy())return;HUB76.tab=tab||HUB76.tab;
  const p=modal('📜 Saves',`<div id="hub76">${await hubBody76(HUB76.tab)}</div>`,[{label:'Close',value:'close'}],{wide:1,close:'close'});return p}
async function hubRedraw76(t){HUB76.tab=t||HUB76.tab;const box=document.getElementById('hub76');if(box)box.innerHTML=await hubBody76(HUB76.tab)}
document.addEventListener('click',async e=>{const t=e.target;if(!t.closest||!t.closest('#hub76'))return;
  const tb=t.closest('[data-hub76]');if(tb){hubRedraw76(tb.dataset.hub76);return}
  const close=()=>{if(CUR_MODAL)CUR_MODAL.done('x')};
  const c=t.closest('[data-hubcar]');if(c){close();continueGo76({kind:'career',id:c.dataset.hubcar});return}
  const mg=t.closest('[data-hubmgr]');if(mg){close();MGR.view=mg.dataset.hubmgr==='manage'?'manage':null;MGR.world=null;mmLaunch(()=>openManager(),'Manager mode');return}
  const ms=t.closest('[data-hubmis]');if(ms){close();continueGo76({kind:'missio',id:ms.dataset.hubmis});return}
  if(t.closest('[data-hubtourn]')){close();continueGo76({kind:'tourn'});return}
  const bk=t.closest('[data-hubbk]');if(bk){if(bk.dataset.hubbk==='export'){try{await downloadSnapshot(await snapshotAll())}catch(err){mToast('⚠ The backup could not be made here.')}}else{close();setTimeout(()=>openSettings('saves'),200)}return}});
/* Play now's Load / Manage, and the screen manager */
matchSavesWindow=function(){return savesHub76('matches')};
{const base=savesHub76;savesHub76=function(){const end=typeof screenIntent==='function'?screenIntent('savesHub76'):()=>{};const r=base.apply(this,arguments);if(r&&r.then)r.then(()=>{if(typeof screenWindowUp==='function'&&!screenWindowUp())end()},()=>end());return r}}
(()=>{const st=document.createElement('style');st.textContent=`
.mmbtns .mmcont76{border-color:var(--gold);box-shadow:0 0 0 1px rgba(240,207,125,.4),0 6px 18px rgba(0,0,0,.45)}
.hub76tabs{margin-bottom:12px}.hub76list{display:grid;gap:8px}
.hub76card{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:10px 12px;background:var(--panel2);border:1px solid var(--line2);border-left:3px solid var(--gold);border-radius:8px}
.hub76card b{font:400 17px var(--display);color:var(--gold2)}.hub76card small{display:block;color:var(--muted);font-size:12.5px}.hub76card.dead{opacity:.6;border-left-color:var(--line2)}`;document.head.appendChild(st)})();

/* =====================================================================
   Play Now · the roster chip and the seat cards (v0.76)
   • The roster is one chip in the Who header — "📚 <pool> ▾" — that only picks the pool to draw from (🏛 Printed game only ·
     ✦ All my creations · your sets with what they add · ✎ Manage sets); one line says what is in play; no toast. With no
     creations at all, a note points to the Creator Studio instead.
   • Seat cards: the mini, the class as a button (tap → a picker of class cards from the roster, with the guide's win rates),
     You | CPU, the 🧠 mind chip (tap to cycle), a team chip in team events, and "⋯ More" holding personality, Tune, Ludus
     rivals and summons. The original selects stay in the page (hidden, same ids) and are driven by change events.
   ===================================================================== */
const MORE76=new Set();
const rsName76=r=>r.id==='classic'?'🏛 Printed game only':r.id==='rolls'?'✦ All my creations':'📚 '+r.name;
function rsLine76(r){if(r.id==='classic')return 'The printed game: the eight classes, its beasts and its gear.';
  if(r.id==='rolls'){const n=(CUSTOM.chars||[]).filter(c=>typeof onRolls==='function'?onRolls(c):true).length;return `The printed game plus every creation on the rolls${n?` (${n} character${n===1?'':'s'})`:''}.`}
  const s=typeof rosterSummary==='function'?rosterSummary(r):'';return 'The printed game'+(s&&!/no creations/.test(s)?' plus '+s.replace(/^your picks: /,''):'')+'.'}
const anyCreations76=()=>['chars','npcs','weapons','armor','events','flags','trophies','specials','pairings'].some(k=>(CUSTOM[k]||[]).length);
function seats76(h){const T=document.createElement('template');T.innerHTML=h;const f=T.content;const who=f.querySelector('.pn-whobody');if(!who)return h;
  /* the roster chip */
  const lab=f.querySelector('.rspick');if(lab){lab.classList.add('h76');const R=rosterById(CFG.roster||'classic');
    const chip=document.createElement('div');chip.className='rs76';
    chip.innerHTML=anyCreations76()?`<button type="button" class="btn rs76btn" data-rs76 aria-expanded="false">${esc(rsName76(R))} ▾</button><span class="rc-sub">${esc(rsLine76(R))}</span><div class="rs76pop" hidden></div>`
      :`<span class="rc-sub">📚 The printed game. Make your own gladiators, beasts and gear in the Creator Studio and they can join from here.</span>`;
    lab.before(chip);const hd=f.querySelector('.pn-who .pn-lbl');if(hd)hd.appendChild(chip)}
  /* the seats */
  for(const el of f.querySelectorAll('.pn-who .seat')){const sel=el.querySelector('select[id^="cls"]');if(!sel)continue;const i=+sel.id.slice(3);const s=CFG.seats[i];if(!s)continue;const C=CLASSES[s.cls]||{};
    const cpuSel=el.querySelector('#cpu'+i),dif=el.querySelector('#dif'+i),team=el.querySelector('#team'+i);
    [sel,cpuSel,dif,team].forEach(x=>x&&x.classList.add('h76'));
    const tier=dif?dif.options[dif.selectedIndex]:null;const tierCol=(typeof AI_TIERS!=='undefined'&&dif&&AI_TIERS[dif.selectedIndex]&&AI_TIERS[dif.selectedIndex].c)||'var(--gold)';
    const top=document.createElement('div');top.className='st76';
    top.innerHTML=`<button type="button" class="st76cls" data-pick76="${i}" title="Choose the class"><b style="color:${C.color||'var(--gold2)'}">${esc(C.name||s.cls)}</b><small>${esc(C.sub||'')} ▾</small></button>
      <div class="st76row"><span class="seg st76who"><button type="button" data-who76="${i}:0" class="${s.cpu?'':'on'}" aria-pressed="${!s.cpu}">You</button><button type="button" data-who76="${i}:1" class="${s.cpu?'on':''}" aria-pressed="${!!s.cpu}">CPU</button></span>
      ${s.cpu&&tier?`<button type="button" class="st76chip" data-mind76="${i}" title="The CPU's mind: tap for the next one" style="border-color:${tierCol}">${esc(tier.textContent)}</button>`:''}
      ${team?`<button type="button" class="st76chip" data-team76="${i}" title="Tap for the next team">${esc(team.options[team.selectedIndex].textContent)}</button>`:''}</div>`;
    const cn=el.querySelector('.cn');(cn||el.firstChild).after(top);
    /* ⋯ More */
    const moreBits=[el.querySelector('#pre'+i),el.querySelector('[data-tune="'+i+'"]'),el.querySelector('#lcp'+i),el.querySelector('#sav'+i),el.querySelector('.perswrap')].filter(Boolean);
    if(moreBits.length){const d=document.createElement('details');d.className='more76';d.dataset.more76=i;if(MORE76.has(i))d.open=true;d.innerHTML='<summary>⋯ More</summary><div class="more76b"></div>';const b=d.querySelector('.more76b');moreBits.forEach(x=>b.appendChild(x));el.appendChild(d)}}
  const out=document.createElement('div');out.appendChild(f);return out.innerHTML}
{const base=setupBody;setupBody=function(){const h=base.apply(this,arguments);try{if(CFG.mode!=='event'||CFG.hotseat||!/class="pn75"/.test(h))return h;return seats76(h)}catch(e){console.error(e);return h}}}
/* no "Loaded for Play Now" toast: the chip shows the choice */
{const base=mToast;mToast=function(m){if(typeof m==='string'&&/Loaded for Play Now/.test(m))return;return base.apply(this,arguments)}}
const fire76=el=>el&&el.dispatchEvent(new Event('change',{bubbles:true}));
function pick76HTML(i){const sel=document.getElementById('cls'+i);if(!sel)return '';const cur=sel.value;
  return `<div class="pk76" role="dialog" aria-label="Choose a class"><div class="pk76hd"><b>Choose a class</b><span class="rc-sub">wins in the guide's ${typeof SIM50!=='undefined'?SIM50.games:''} classic events</span><button type="button" class="btn tksm" data-pk76x>Close</button></div>
    <div class="pk76grid">${[...sel.options].map(o=>{const k=o.value;const C=CLASSES[k]||{};const sw=typeof SIM50!=='undefined'&&SIM50.cls&&SIM50.cls[k];
      const art=(CLS_CARD74&&CLS_CARD74[k]?cardHTML('k:'+k,'sm'):(typeof clsPieceHTML==='function'?clsPieceHTML(k,56):'')).replace(/ data-card="[^"]*"/g,'');
      return `<button type="button" class="pk76c ${k===cur?'on':''}" data-pk76="${i}:${esc(k)}" style="--pc:${C.color||'#888'}">${art}<b>${esc(C.name||k)}</b><small>${esc(C.sub||(C.custom?'your character':''))}</small>${sw?`<span class="pk76w"><i style="width:${Math.min(100,sw.win*2.5)}%"></i></span><small>${sw.win}% wins</small>`:''}</button>`}).join('')}</div></div>`}
document.addEventListener('click',e=>{const t=e.target;if(!t.closest||!t.closest('#mBody .pn75'))return;
  const rb=t.closest('[data-rs76]');if(rb){const pop=rb.parentElement.querySelector('.rs76pop');const L=[...ROSTER_SYS,...(CUSTOM.rosters||[])];const cur=CFG.roster||'classic';
    pop.innerHTML=L.map(r=>`<button type="button" class="rs76opt ${r.id===cur?'on':''}" data-rs76set="${esc(r.id)}"><b>${esc(rsName76(r))}</b><small>${esc(rsLine76(r))}</small></button>`).join('')+`<button type="button" class="rs76opt man" data-rs76man><b>✎ Manage sets</b><small>Make and edit roster sets in the Creator Studio.</small></button>`;
    pop.hidden=!pop.hidden;rb.setAttribute('aria-expanded',String(!pop.hidden));return}
  const rs=t.closest('[data-rs76set]');if(rs){const s=document.querySelector('#mBody [data-roster="cfg"]');if(s){s.value=rs.dataset.rs76set;fire76(s)}return}
  if(t.closest('[data-rs76man]')){if(CUR_MODAL)CUR_MODAL.done(null);setTimeout(()=>{if(typeof openStudio==='function')openStudio('rosters')},250);return}
  const wb=t.closest('[data-who76]');if(wb){const [i,v]=wb.dataset.who76.split(':');const s=document.getElementById('cpu'+i);if(s&&s.value!==v){s.value=v;fire76(s)}return}
  const mb=t.closest('[data-mind76]');if(mb){const s=document.getElementById('dif'+mb.dataset.mind76);if(s){s.selectedIndex=(s.selectedIndex+1)%s.options.length;fire76(s);
    if(!s.isConnected||document.getElementById('dif'+mb.dataset.mind76)===s){const T2=s.options[s.selectedIndex];mb.textContent=T2.textContent}}return}
  const tb=t.closest('[data-team76]');if(tb){const s=document.getElementById('team'+tb.dataset.team76);if(s){s.selectedIndex=(s.selectedIndex+1)%s.options.length;fire76(s);if(document.getElementById('team'+tb.dataset.team76)===s)tb.textContent=s.options[s.selectedIndex].textContent}return}
  const pk=t.closest('[data-pick76]');if(pk){const w=document.querySelector('#mBody .pn75');let ov=w.querySelector('.pk76wrap');if(!ov){ov=document.createElement('div');ov.className='pk76wrap';w.appendChild(ov)}ov.innerHTML=pick76HTML(pk.dataset.pick76);ov.hidden=false;return}
  const pc=t.closest('[data-pk76]');if(pc){const [i,k]=pc.dataset.pk76.split(':');const s=document.getElementById('cls'+i);const ov=t.closest('.pk76wrap');if(ov)ov.hidden=true;if(s&&s.value!==k){s.value=k;fire76(s)}return}
  if(t.closest('[data-pk76x]')||t.classList.contains('pk76wrap')){const ov=t.closest('.pk76wrap');if(ov)ov.hidden=true;return}},true);
document.addEventListener('toggle',e=>{const d=e.target;if(d&&d.classList&&d.classList.contains('more76')){const i=+d.dataset.more76;if(d.open)MORE76.add(i);else MORE76.delete(i)}},true);
(()=>{const st=document.createElement('style');st.textContent=`
.h76{display:none!important}
.pn-who .pn-lbl{align-items:flex-start}.rs76{position:relative;display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;font:14px var(--body);letter-spacing:0;color:var(--bone)}
.rs76btn{font-size:14px;padding:4px 12px;border-color:var(--gold)}.rs76 .rc-sub{font-size:12.5px}
.rs76pop{position:absolute;top:calc(100% + 4px);left:0;z-index:6;display:grid;gap:4px;width:min(420px,86vw);padding:8px;background:var(--panel);border:1px solid var(--gold);border-radius:8px;box-shadow:0 12px 30px rgba(0,0,0,.6)}.rs76pop[hidden]{display:none}
.rs76opt{display:grid;gap:2px;text-align:left;padding:7px 10px;border:1px solid var(--line2);border-radius:6px;background:var(--panel2);cursor:pointer;color:var(--bone)}.rs76opt.on{border-color:var(--gold);background:#3a2a18}.rs76opt b{font-size:14px}.rs76opt small{color:var(--muted);font-size:12px}.rs76opt.man{border-style:dashed}
.st76{display:grid;gap:6px;padding-right:58px}.st76cls{display:grid;gap:0;justify-items:start;background:none;border:0;padding:0;cursor:pointer;text-align:left}
.st76cls b{font:400 20px var(--display);letter-spacing:.03em}.st76cls small{color:var(--muted);font-size:12.5px}.st76cls:hover b,.st76cls:focus-visible b{text-decoration:underline}
.st76row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.st76who button{padding:4px 12px}
.st76chip{font:12.5px var(--body);padding:3px 10px;border-radius:999px;border:1px solid var(--gold);background:var(--panel);color:var(--bone);cursor:pointer}
.more76{border-top:1px solid var(--line2);padding-top:4px}.more76 summary{cursor:pointer;color:var(--muted);font-size:13px}.more76b{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.more76b select{max-width:100%}
.pk76wrap{position:fixed;inset:0;z-index:50;display:grid;place-items:center;background:rgba(8,5,3,.6);padding:16px}.pk76wrap[hidden]{display:none}
.pk76{width:min(820px,100%);max-height:86vh;overflow:auto;background:var(--panel);border:1px solid var(--gold);border-radius:10px;padding:12px;box-shadow:0 20px 60px rgba(0,0,0,.7)}
.pk76hd{display:flex;gap:10px;align-items:baseline;margin-bottom:10px}.pk76hd b{font:400 19px var(--display);color:var(--gold2)}.pk76hd .btn{margin-left:auto}
.pk76grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}
.pk76c{display:grid;justify-items:center;gap:3px;padding:8px;border:1px solid var(--line2);border-top:3px solid var(--pc);border-radius:8px;background:var(--panel2);cursor:pointer;color:var(--bone)}
.pk76c.on{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold) inset}.pk76c:hover{border-color:var(--gold)}.pk76c .cimg.sm{width:96px}
.pk76c b{font:400 15px var(--display)}.pk76c small{color:var(--muted);font-size:11.5px}.pk76w{display:block;width:80%;height:5px;background:#33271e;border-radius:3px;overflow:hidden}.pk76w i{display:block;height:100%;background:linear-gradient(90deg,#6f9a4a,#e6b93a)}`;document.head.appendChild(st)})();
