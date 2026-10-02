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

/* =====================================================================
   v0.76 C — the road, a week off of your own, infirmary beds
   • Road lock (roadLocked76): once the house leaves for an away Match Week (💰 Travel, a road deal, or the first bout
     of a booked fighter), the Training Yard and the Infirmary are shut until the week ends — no new drills, hours,
     exhibitions, yard jobs, treatments, rest weeks or bed changes (LOCK76 click guard). What was booked before leaving
     still runs. Recruiting stays open. Home weeks and byes never lock. Before you leave, a window lists what is
     undone (leaveList76); the travel card says the yard is shut while you are away.
   • Sit this week out (sbyeOK76/takeSbye76): once a season, before any of your fighters is on the card (never in
     Rivalry Week): no road, no gate share (87 edit), −SBYE76.fame fame; bye perks: +TH_BYE training hours (thMax
     wrapper), wounds a week shorter, nobody sulks for missing a bout. w.night.selfBye, w.sbye76 = season.
   • Infirmary beds: bedsOf76 = 1 + Valetudinarium level. Serious wounds (serious76: surgeon-grade, −4 rating or
     worse, 3+ weeks; remembered as inj.ser76) and lost limbs need a bed. You assign them (w.beds76 = gids,
     [data-bed76]/[data-unbed76]); a healed fighter leaves the bed. Without a bed: no Medicus, surgeon or Hygeia, and
     the wound heals at half pace (endWeek wrapper: every other week adds a week). Bathhouse and Asclepius still work.
   ===================================================================== */
/* a small centred question over any window (the Manager lives in #modal, so modal() would replace it) */
function ask76(title,body,yes,no){return new Promise(res=>{for(const o of document.querySelectorAll('.ask76bg'))o.remove();
  const bg=document.createElement('div');bg.className='veraskbg ask76bg';bg.innerHTML=`<div class="card2 verask" role="dialog" aria-modal="true"><b>${title}</b><div style="margin:6px 0 10px">${body}</div><div class="acts"><button type="button" class="btn primary" data-ask76="1">${yes}</button><button type="button" class="btn" data-ask76="0">${no}</button></div></div>`;
  document.body.appendChild(bg);const done=v=>{bg.remove();document.removeEventListener('keydown',key,true);res(v)};
  const key=e=>{if(e.key==='Escape'){e.stopPropagation();e.preventDefault();done(false)}};document.addEventListener('keydown',key,true);
  bg.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('[data-ask76]');if(b)done(b.dataset.ask76==='1');else if(e.target===bg)done(false)});
  setTimeout(()=>{const y=bg.querySelector('[data-ask76="1"]');if(y)y.focus()},30)})}
const SBYE76={fame:2};
function roadLocked76(w){w=w||W_();const n=w&&w.night;if(!n||n.bye||n.selfBye||w.tutorial)return false;const t=n.travel;return !!(t&&t.cost>0&&t.gone)}
const roadCity76=w=>{const L=LOCATIONS[(w||W_()).night.loc];return L?L.n:'the games'};
{const base=travelClick;travelClick=function(a){const r=base.apply(this,arguments);try{const w=W_();const t=w&&w.night&&w.night.travel;if(t&&t.paid&&t.cost>0&&(a==='travelpay'||a==='traveldeal'))t.gone=true}catch(e){}return r}}
{const base=applyBout;applyBout=function(){const r=base.apply(this,arguments);try{const w=W_(),m=me();const t=w.night&&w.night.travel;
  const mine=id=>{const g=gById(id);return g&&g.contract&&g.contract.mgr===m.id};
  if(t&&t.cost>0&&!t.gone&&w.night.bouts.some(b=>b.done&&b.ents.some(mine)))t.gone=true;
  for(const g of rosterOf(m))if(g.inj&&!g.inj.war&&!g.inj.bedNote&&serious76(g)&&!inBed76(g)){g.inj.bedNote=1;tnews(`🛏 ${esc(g.name)} needs a bed in the Infirmary (${esc(g.inj.label)}).`,'bad')}}catch(e){console.error(e)}return r}}
/* what is left undone when the house leaves */
function leaveList76(w){const m=me();const ros=rosterOf(m);const L=[];
  const th=typeof thLeft==='function'?thLeft(w):0;if(th&&ros.length)L.push(`⏳ <b>${th}</b> training hour${th===1?'':'s'} unspent`);
  if(!w.train||w.train==='off')L.push('🏋 No drills set for the week');
  const hurt=ros.filter(g=>g.inj&&!g.inj.war&&injReq(g.inj)!=='rest'&&g.medWk!==w.week&&g.bathWk!==w.week);if(hurt.length)L.push(`⚕ Untreated: ${hurt.map(g=>esc(g.name)).join(', ')}`);
  const wait=bedWait76(w);if(wait.length&&bedFree76(w))L.push(`🛏 Waiting for a bed: ${wait.map(g=>esc(g.name)).join(', ')}`);
  const worn=typeof gFat==='function'?ros.filter(g=>!g.inj&&gFat(g)>50&&g.restWk!==w.week):[];if(worn.length)L.push(`😮‍💨 Worn down, no rest week: ${worn.map(g=>`${esc(g.name)} (${gFat(g)})`).join(', ')}`);
  return L}
const LEAVE76={ok:0};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mg="travelpay"],[data-mg="traveldeal"]');if(!b||b.disabled)return;if(LEAVE76.ok){LEAVE76.ok=0;return}
  const w=typeof W_==='function'&&W_();if(!w||w.tutorial||!w.night)return;const L=leaveList76(w);if(!L.length)return;e.preventDefault();e.stopPropagation();const sel=`[data-mg="${b.dataset.mg}"]`;
  ask76('🛣 Before you leave',`Once you leave for <b>${esc(roadCity76(w))}</b>, the Training Yard and the Infirmary are shut until the week ends. Still undone:<ul class="leave76">${L.map(x=>`<li>${x}</li>`).join('')}</ul><span class="rc-sub">Anything you already booked still runs.</span>`,'🛣 Leave now','Stay and finish').then(v=>{if(!v)return;const nb=b.isConnected?b:document.querySelector(sel);if(nb){LEAVE76.ok=1;nb.click()}})},true);
const LOCK76='[data-mg="regime"],[data-mg="exsim"],[data-mg="exlive"],[data-mg="exfight"],[data-mg="ptrain"],[data-mg="medic"],[data-mg="surgeon"],[data-mg="bath"],[data-mg="asclepius"],[data-mg="heal"],[data-tp],[data-yj],[data-bath],[data-rest],[data-bed76],[data-unbed76],[data-pen76]';
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest(LOCK76);if(!b||!b.closest('#mgrBody'))return;const w=typeof W_==='function'&&W_();if(!w)return;
  if(roadLocked76(w)){e.preventDefault();e.stopPropagation();mToast(`🛣 On the road to <b>${esc(roadCity76(w))}</b> — the Training Yard and the Infirmary reopen when the week ends.`);return}
  const t=b.closest('[data-mg="medic"],[data-mg="surgeon"],[data-mg="heal"]');if(t){const g=gById(t.dataset.id);if(g&&serious76(g)&&!inBed76(g)){e.preventDefault();e.stopPropagation();mToast(`🛏 ${esc(g.name)} needs a bed in the Infirmary first.`)}}},true);
const lockNote76=what=>{const w=W_();return roadLocked76(w)?`<div class="card2 lock76">🛣 <b>On the road to ${esc(roadCity76(w))}.</b> The ${what} is shut until the week ends — what you booked before leaving still runs.</div>`:''};
{const base=practiceHTML;practiceHTML=function(){const h=base.apply(this,arguments);try{const n=lockNote76('Training Yard');if(n)return n+`<div class="locked76">${h}</div>`}catch(e){}return h}}

/* ---------- sit this week out ---------- */
function sbyeOK76(w){w=w||W_();const n=w&&w.night;if(!n||n.bye||n.selfBye||w.tutorial||w.dead)return [false,''];
  if(w.sbye76===w.season)return [false,'Already taken this season'];
  if(typeof RIVAL_WK!=='undefined'&&wkOf(w.week)===RIVAL_WK)return [false,'Not in Rivalry Week'];
  if(n.bouts.some(b=>b.done))return [false,'The games have begun'];
  const m=me();if(n.bouts.some(b=>b.ents.some(id=>{const g=gById(id);return g&&g.contract&&g.contract.mgr===m.id})))return [false,'Your fighters are on the card'];
  const t=n.travel;if(t&&(t.gone||t.deal))return [false,'You are already on the road'];
  return [true,'']}
async function takeSbye76(){const w=W_(),m=me();if(!sbyeOK76(w)[0])return;const L=roadCity76(w);
  const v=await ask76('🌿 Sit this week out?',`Your house skips Match Week at <b>${esc(L)}</b>. Once a season.<ul class="leave76"><li>⏳ +${TH_BYE} training hours</li><li>⚕ Wounds heal a week sooner</li><li>🛏 Nobody sulks for missing a bout</li><li>🏟 No gate share this week</li><li>📉 −${SBYE76.fame} fame</li></ul>`,'🌿 Sit it out','Cancel');
  if(!v||!sbyeOK76(w)[0])return;const n=w.night;const home=travelHome(m);
  n.selfBye=true;w.sbye76=w.season;n.travel={cost:0,paid:true,offer:null,deal:null,from:LOCATIONS[home]?LOCATIONS[home].n:'',bye:1,self:1};
  for(const g of rosterOf(m))if(g.inj&&!g.inj.war)g.inj.until=Math.max(w.week,(g.inj.until||w.week)-1);
  m.fame=clamp((m.fame||0)-SBYE76.fame,0,100);
  tnews(`🌿 <b>${esc(m.ludus)} sits out Match Week</b> at ${esc(L)}: +${TH_BYE} training hours, wounds a week sooner, no gate share, −${SBYE76.fame} fame.`,'big');
  saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()}
{const base=thMax;thMax=function(){const r=base.apply(this,arguments);try{const w=W_();if(w&&w.night&&w.night.selfBye)return r+TH_BYE}catch(e){}return r}}
{const base=weekMoney;weekMoney=function(){const r=base.apply(this,arguments);try{const w=W_();if(w&&w.night&&w.night.selfBye&&r.gate){r.net-=r.gate;r.gate=0;r.runway=r.net>=0?Infinity:Math.max(0,Math.floor(r.coin/-r.net))}}catch(e){}return r}}
{const base=travelCardHTML;travelCardHTML=function(){const w=W_();try{if(w&&w.night&&w.night.selfBye)return `<div class="card2 travelcard home sbye76"><b>🌿 Your house sits this week out</b> — the games at ${esc(roadCity76(w))} go on without you. <span class="rc-sub">+${TH_BYE} training hours · no gate share</span></div>`}catch(e){}
  let h=base.apply(this,arguments);try{const [ok]=sbyeOK76(w);
    if(ok&&h)h=h.replace(/<\/div>$/,`<div class="sbye76row"><button class="btn tksm" type="button" data-sbye76>🌿 Sit this week out<small>once a season · +${TH_BYE} h · −${SBYE76.fame} fame</small></button></div></div>`);
    if(roadLocked76(w)&&h)h=h.replace(/<\/div>$/,'<div class="rc-sub">🔒 The Training Yard and the Infirmary are shut until the week ends.</div></div>')}catch(e){}return h}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-sbye76]');if(b){e.preventDefault();e.stopPropagation();takeSbye76();return}
  const en=e.target.closest&&e.target.closest('[data-mg="enter"]');if(en){const w=typeof W_==='function'&&W_();if(w&&w.night&&w.night.selfBye){e.preventDefault();e.stopPropagation();mToast('🌿 Your house is sitting this week out.')}}},true);
{const base=nightTodo73;nightTodo73=function(){try{const w=W_();if(w&&w.night&&w.night.selfBye&&!(w.pend||[]).length)return null}catch(e){}return base.apply(this,arguments)}}

/* ---------- infirmary beds ---------- */
const bedsOf76=m=>1+(typeof facLvl==='function'?facLvl(m,'valet'):0);
function serious76(g){if(!g)return false;if((g.severed||[]).length)return true;const i=g.inj;if(!i||i.war)return false;if(i.ser76)return true;const w=W_();
  const s=injReq(i)==='surgeon'||(i.pen||0)>=4||((i.until||0)-w.week)>=3;if(s)i.ser76=1;return s}
function bedsClean76(w){const m=me();if(!m)return [];const ros=new Set(rosterOf(m).map(g=>g.id));
  w.beds76=(w.beds76||[]).filter((id,i,a)=>a.indexOf(id)===i&&ros.has(id)&&serious76(gById(id))).slice(0,bedsOf76(m));return w.beds76}
const inBed76=g=>{const w=W_();return !!(w&&(w.beds76||[]).includes(g.id))};
const bedWait76=w=>rosterOf(me()).filter(g=>serious76(g)&&!(w.beds76||[]).includes(g.id));
const bedFree76=w=>Math.max(0,bedsOf76(me())-bedsClean76(w).length);
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('[data-bed76],[data-unbed76]');if(!a)return;e.preventDefault();e.stopPropagation();const w=W_();if(!w)return;bedsClean76(w);
  if(a.dataset.bed76){const g=gById(a.dataset.bed76);if(!g||inBed76(g))return;if(!bedFree76(w)){mToast('🛏 Every bed is taken — discharge someone, or build the Valetudinarium for more.');return}w.beds76.push(g.id);tnews(`🛏 ${esc(g.name)} takes a bed in the Infirmary.`)}
  else{w.beds76=w.beds76.filter(id=>id!==a.dataset.unbed76)}
  saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()});
function bedsHTML76(){const w=W_(),m=me();const beds=bedsClean76(w);const N=bedsOf76(m);const wait=bedWait76(w);const free=N-beds.length;
  const why=g=>(g.severed||[]).length&&!g.inj?`lost ${g.severed.map(l=>LOCN[l].toLowerCase()).join(', ')} — Hygeia needs a bed`:esc(g.inj?g.inj.label:'');
  const cell=id=>{const g=gById(id);return `<div class="bed76 on">${mgAvatar(g)}<div><b>${esc(g.name)}</b><small>${why(g)}</small></div><button class="btn tksm" type="button" data-unbed76="${g.id}">Discharge</button></div>`};
  return `<div class="beds76"><div class="sect">🛏 Beds · ${beds.length}/${N} <span class="rc-sub">for serious wounds and lost limbs · no bed: no Medicus, surgeon or Hygeia, half-pace mending</span></div>
    <div class="bedgrid76">${beds.map(cell).join('')}${Array.from({length:free},()=>'<div class="bed76 empty"><span>🛏</span><small>Empty bed</small></div>').join('')}</div>
    ${wait.length?`<div class="bedwait76">${wait.map(g=>`<div class="bedw76"><b>${esc(g.name)}</b> <span class="rc-sub">${why(g)}</span><button class="btn tksm ${free?'primary':''}" type="button" data-bed76="${g.id}" ${free?'':'disabled title="Every bed is taken"'}>🛏 Give a bed</button></div>`).join('')}</div>`:''}</div>`}
{const base=infirmaryHTML;infirmaryHTML=function(){let h=base.apply(this,arguments);try{const w=W_();const occ=bedsClean76(w).length,N=bedsOf76(me()),wait=bedWait76(w).length;
  /* the room's Patients tile counts the real beds */
  h=h.replace(/(<div class="rtv">)\d+ \/ \d+ beds(<\/div><div class="rtl">)Patients(<\/div>)(<div class="rc-sub">[^<]*<\/div>)?(<div class="meter"[^>]*><i style="width:)[\d.]+%/,(m0,a,b,c,d,e)=>`${a}${occ} / ${N} beds${b}Serious patients${c}${wait?`<div class="rc-sub">${wait} waiting · half-pace mending</div>`:''}${e}${Math.round(occ/N*100)}%`);
  const b=bedsHTML76();const i=h.indexOf('<p class="rc-sub" style="margin:4px 0 8px"><b>Care must match');h=i>=0?h.slice(0,i)+b+h.slice(i):b+h;const n=lockNote76('Infirmary');if(n)h=n+`<div class="locked76">${h}</div>`}catch(e){console.error(e)}return h}}
{const base=planTiles;planTiles=function(g){let h=base.apply(this,arguments);try{if(serious76(g)&&!inBed76(g))h=h.replace(/class="plantile ([^"]*)" data-mg="(medic|surgeon)" data-id="[^"]*"/g,'class="plantile off" disabled data-bedneed76="1"')+`<div class="pw">🛏 Needs a bed — heals at half pace without one</div>`;else if(inBed76(g))h+=`<div class="rc-sub">🛏 In a bed</div>`}catch(e){}return h}}
{const base=careHTML;careHTML=function(g){let h=base.apply(this,arguments);try{if(g&&(g.severed||[]).length&&!inBed76(g))h=h.replace(/(<button class="btn[^"]*" type="button") data-mg="heal" data-id="[^"]*"[^>]*>/,'$1 disabled title="Needs a bed in the Infirmary first">')}catch(e){}return h}}
{const base=infirmNeed73;infirmNeed73=function(){let r=base.apply(this,arguments);try{const w=W_();r+=Math.min(bedFree76(w),bedWait76(w).length)}catch(e){}return r}}
{const base=weekChecklist;weekChecklist=function(){const I=base.apply(this,arguments);try{const w=W_();
  if(w.night&&w.night.selfBye){const x=I.find(x=>x.ic==='⚔');if(x){x.done=true;x.txt='Sitting this week out';x.btn=''}}
  const wait=bedWait76(w);const free=bedFree76(w);if(wait.length&&free){const at=I.findIndex(x=>x.ic==='⚕');I.splice(at<0?0:at+1,0,{done:false,ic:'🛏',txt:`${wait.slice(0,free).map(g=>esc(g.name)).join(', ')} ${Math.min(free,wait.length)===1?'needs':'need'} a bed`,btn:`<button class="btn tksm" type="button" data-mg="tab" data-id="infirm">Infirmary</button>`})}}catch(e){console.error(e)}return I}}
{const base=endWeek;endWeek=async function(){const w=W_();let undo=null;
  try{if(w&&!w.dead&&w.night&&w.night.bouts.every(b=>b.done)&&!(w.pend||[]).length&&!(w.special&&!w.special.done)){undo=[];const m=me();
    if(w.night.selfBye)for(const g of rosterOf(m)){undo.push([g,'lastBout',g.lastBout]);g.lastBout=w.week}
    bedsClean76(w);for(const g of rosterOf(m)){const i=g.inj;if(!i||i.war||!serious76(g)||inBed76(g)||injReq(i)==='surgeon')continue;
      undo.push([i,'half76',i.half76],[i,'until',i.until]);i.half76=(i.half76||0)+1;if(i.half76%2===1)i.until=Math.max(i.until||w.week,w.week)+1}}}catch(e){console.error(e)}
  const r=await base.apply(this,arguments);
  if(r===false&&undo)for(const [o,k,v] of undo.reverse())o[k]=v;
  try{const w2=W_();if(w2&&r!==false)bedsClean76(w2)}catch(e){}return r}}
(()=>{const st=document.createElement('style');st.textContent=`
.lock76{border-color:#c98a2e;margin-bottom:10px}.locked76 button:not([data-mg="tab"]):not([data-mg="sel"]),.locked76 .plantile{opacity:.5;cursor:not-allowed}
.leave76{margin:6px 0 8px 18px;display:grid;gap:3px}.sbye76row{margin-top:6px}
.beds76{margin:10px 0}.bedgrid76{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:6px}
.bed76{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;padding:6px 8px;border:1px solid var(--line2);border-radius:8px;background:var(--panel2);min-height:46px}
.bed76.on{border-color:var(--gold)}.bed76 small{display:block;color:var(--muted);font-size:11.5px}.bed76>:first-child{width:30px;height:38px;overflow:hidden;display:block}.bed76>:first-child *{max-width:100%;max-height:38px}
.bed76.empty{grid-template-columns:auto 1fr;opacity:.6;border-style:dashed}.bed76.empty span{font-size:20px}
.bedwait76{display:grid;gap:4px;margin-top:6px}.bedw76{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:4px 8px;border-left:3px solid var(--blood2);background:rgba(163,40,31,.12);border-radius:4px}.bedw76 .btn{margin-left:auto}`;document.head.appendChild(st)})();

/* =====================================================================
   v0.76 E — the beast pen (Training Yard)
   • One fighter against one animal (PEN76.beasts: snake, wolf, bear, lion — no Tholo, no Commodus) in a 6×6 pen in the
     middle of a normal arena (the home city's), played by you under the usual arena rules. Costs PEN76.hours training
     hours + the keeper's fee; once per fighter a week; not hurt, not resting.
   • The event is a hidden custom event (EVENTS.pen76, not enumerable — never listed): one round, end 'beasts', no deck,
     market, crowd or Fates. The pen is a hard wall: dijkstra is wrapped while S.pen76 (tiles outside PEN76.box block
     everyone). The fence and the watching roster (up to 8 others, minis facing the pen) are drawn as extra pieces
     injected into S.pillars for the length of draw() only (drawPillar wrapper: w76 = watcher, f76 = fence span).
   • Time: PEN76.rot rotations (checkEndCustom wrapper). 🏳 Call it off (#pen76Off, your turn) pulls the fighter.
   • Results (gameOver wrapper, no Fate): kill → the kill's coin to the treasury, +1 beast on the record, and a flat
     +PEN76.bonus to a rating you pick; pulled (fell or called off) → −PEN76.fame fame; time → nothing either way.
     Injuries are real (penWound76: a limb at 0 or a fall → a serious wound that needs a bed; heavy damage → a light
     one), never death. Fatigue +FAT_EXH. Back to the Training Yard.
   ===================================================================== */
const PEN76={hours:2,rot:8,bonus:2,fame:3,box:[3,8],start:[8,6],den:[3,5],beasts:{snake:3,wolf:5,bear:8,lion:10},
  watch:[[1,4],[1,7],[10,4],[10,7],[4,1],[7,1],[4,10],[7,10]]};
const pen76In=(r,c)=>r>=PEN76.box[0]&&r<=PEN76.box[1]&&c>=PEN76.box[0]&&c<=PEN76.box[1];
function penEventDef76(t,loc){
  return {custom:true,cid:'pen76',pen76:1,img:null,n:'The Beast Pen',short:'Beast pen',tag:'Training',loc,min:1,max:1,deck:0,mandata:0,teams:0,coop:0,noTruce:1,noMarket:true,draft:null,loadout:'class',
    classes:Object.keys(CLASSES),blurb:'One fighter, one beast, a pen of six by six.',noSpect:true,nofates:true,
    rounds:[{n:'The pen',zone:1,pve:1,pvp:0,cf:1,ca:1,end:'beasts',endN:1,reward:{win:0}}],
    layout:{pillars:PILLARS.filter(([r,c])=>!pen76In(r,c)).map(([r,c])=>({r,c,pot:null})),tunnels:[],spikes:[],chest:null,npcs:[{key:t,t,name:NPCT[t].n,r:PEN76.den[0],c:PEN76.den[1],beh:'hunt'}],items:[],starts:[[...PEN76.start]]},
    start:{},npcHp:100,npcDmg:0,priceMul:1,spect:0,limits:{},chariotOffers:0,optOffers:false,eaglePot:false,noCards:[]}}
{const base=newState;newState=function(config){const r=base.apply(this,arguments);try{if(S&&config&&config.pen76)S.pen76={...config.pen76}}catch(e){}return r}}
{const base=startEvent;startEvent=function(cfg){const r=base.apply(this,arguments);try{if(cfg&&cfg.pen76&&typeof LAST_CFG!=='undefined')LAST_CFG=null}catch(e){}return r}}
{const base=dijkstra;dijkstra=function(sr,sc,blocked,fly){if(S&&S.pen76&&!S.over){const b=blocked;return base.call(this,sr,sc,(r,c)=>!pen76In(r,c)||b(r,c),false)}return base.apply(this,arguments)}}
{const base=freeGrid;freeGrid=function(){if(S&&S.pen76){for(let i=0;i<80;i++){const r=PEN76.box[0]+Math.floor(Math.random()*6),c=PEN76.box[0]+Math.floor(Math.random()*6);if(!pillarAt(r,c)&&!unitAt(r,c))return [r,c]}}return base.apply(this,arguments)}}
{const base=checkEndCustom;checkEndCustom=function(ev,rd,act,set,win){if(S&&S.pen76&&act.length&&S.rotation>PEN76.rot&&S.npcs.some(n=>n.alive)){S.pen76.time=1;return win(act,'Time is called — the keepers drive the beast back.')}return base.apply(this,arguments)}}
{const base=eliminate;eliminate=function(victim){const r=base.apply(this,arguments);try{if(S&&S.pen76&&victim&&victim.cls&&S.players.includes(victim))log(`${nm(victim)} is <b>pulled from the pen</b> — the keepers drive the beast back with torches.`,'thought')}catch(e){}return r}}
{const base=matchSaveOK;matchSaveOK=function(){return S&&S.pen76?false:base.apply(this,arguments)}}
{const base=matchSaveUI;matchSaveUI=function(){const r=base.apply(this,arguments);try{if(S&&S.pen76){const b=document.getElementById('btnMSave');if(b)b.hidden=true}}catch(e){}return r}}
/* the fence and the watchers: extra pieces for the depth-sorted pass of draw() */
function penPieces76(){const P=S.pen76;const [a,b]=PEN76.box;const z=b+1;const out=[];
  /* a fence span sorts by its depth (r+c): the back sides just behind the pen's first row, the front sides just in front of its last */
  for(let j=a;j<=b;j++)out.push({f76:[a,j,a,j+1],r:a+j-0.5,c:0},{f76:[j,a,j+1,a],r:j+a-0.5,c:0},{f76:[z,j,z,j+1],r:b+j+0.6,c:0},{f76:[j,z,j+1,z],r:j+b+0.6,c:0});
  for(const u of P.watch||[])out.push({w76:u,r:u.r,c:u.c});return out.map((o,i)=>({id:'p76_'+i,pots:[],...o}))}
{const base=draw;draw=function(){if(!(S&&S.pen76&&S.pillars))return base.apply(this,arguments);const extra=penPieces76();S.pillars.push(...extra);
  try{return base.apply(this,arguments)}finally{if(S&&S.pillars)S.pillars=S.pillars.filter(x=>!x.f76&&!x.w76)}}}
{const base=drawPillar;drawPillar=function(pl){if(pl&&pl.f76)return penFence76(pl.f76);if(pl&&pl.w76)return penWatcher76(pl.w76);return base.apply(this,arguments)}}
/* a makeshift cage: rough stakes with pointed tops, two lashed poles, rope bindings at every crossing, a brace on every other span */
function penFence76([i0,j0,i1,j1]){const A=iso(i0,j0),B=iso(i1,j1);const h=TW*0.72;const front=i0===i1?i0>PEN76.box[0]:j0>PEN76.box[0];
  const seed=(i0*31+j0*17)%7;const L=(t,y)=>({x:A.x+(B.x-A.x)*t,y:A.y+(B.y-A.y)*t-y});const lw=k=>Math.max(1.2,TW*k);
  ctx.save();ctx.lineCap='round';if(front)ctx.globalAlpha=0.82;
  ctx.strokeStyle='rgba(0,0,0,.32)';ctx.lineWidth=lw(0.08);ctx.beginPath();ctx.moveTo(A.x,A.y+2);ctx.lineTo(B.x,B.y+2);ctx.stroke();
  const stakes=[0,0.34,0.67,1];
  for(const [k,t] of stakes.entries()){const lean=((seed+k*3)%5-2)*TW*0.012,hh=h*(0.9+((seed+k)%4)*0.05);const p0=L(t,0),p1={x:p0.x+lean,y:p0.y-hh};
    ctx.strokeStyle='#4a3018';ctx.lineWidth=lw(0.075);ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.lineTo(p1.x,p1.y);ctx.stroke();
    ctx.strokeStyle='#8a6034';ctx.lineWidth=lw(0.03);ctx.beginPath();ctx.moveTo(p0.x-lw(0.015),p0.y);ctx.lineTo(p1.x-lw(0.015),p1.y+2);ctx.stroke();
    ctx.fillStyle='#4a3018';ctx.beginPath();ctx.moveTo(p1.x-lw(0.04),p1.y+2);ctx.lineTo(p1.x+lw(0.04),p1.y+2);ctx.lineTo(p1.x,p1.y-TW*0.07);ctx.closePath();ctx.fill()}
  for(const y of [h*0.3,h*0.74]){const a=L(-0.04,y),b=L(1.04,y+((seed%3)-1)*TW*0.02);ctx.strokeStyle='#5c3d1e';ctx.lineWidth=lw(0.06);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    ctx.strokeStyle='#9a7040';ctx.lineWidth=lw(0.02);ctx.beginPath();ctx.moveTo(a.x,a.y-1);ctx.lineTo(b.x,b.y-1);ctx.stroke()}
  if((i0+j0)%2===0){const a=L(0.02,h*0.3),b=L(0.98,h*0.74);ctx.strokeStyle='#553819';ctx.lineWidth=lw(0.045);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
  ctx.strokeStyle='#d9c08a';ctx.lineWidth=lw(0.022);for(const t of stakes)for(const y of [h*0.3,h*0.74]){const c=L(t,y);const r=TW*0.035;
    ctx.beginPath();ctx.moveTo(c.x-r,c.y-r);ctx.lineTo(c.x+r,c.y+r);ctx.moveTo(c.x+r,c.y-r);ctx.lineTo(c.x-r,c.y+r);ctx.moveTo(c.x-r,c.y-r*0.2);ctx.lineTo(c.x+r,c.y-r*0.2);ctx.stroke()}
  ctx.restore()}
function penWatcher76(u){const m=center(u.r,u.c);ctx.save();ctx.strokeStyle=u.color||'#d6ab4c';ctx.lineWidth=2;ell(m.x,m.y+TW*0.03,TW*0.26,TW*0.13);ctx.stroke();
  const sk=standeeKeyCls(u.cls)||standeeKeyCls('soldier');let top=m.y-TW*0.6;
  const fake={cls:u.cls,hp:{...BASE_HP},color:u.color};const useFig=wantFigure(hasCustomToken(u.cls));let tk=null;try{tk=useFig?tokenForP(fake):null}catch(e){}
  if(tk&&tokenImg(tk))top=drawFigureTok(tk,m.x,m.y+TW*0.02,TW*1.15);
  else if(sk&&standeesOn()&&standeeImg(sk)){const prev=typeof MINI_CUR!=='undefined'?MINI_CUR:null;try{if(typeof MINI_CUR!=='undefined')MINI_CUR=u;top=drawStandee(sk,m.x,m.y+TW*0.04,standeeSize(sk)*0.9)}finally{if(typeof MINI_CUR!=='undefined')MINI_CUR=prev}}
  else{ctx.fillStyle=u.color||'#8a6a44';ell(m.x,m.y-TW*0.1,TW*0.22,TW*0.12);ctx.fill();top=m.y-TW*0.3}
  ctx.font=`600 ${Math.max(9,Math.round(TW*0.2))}px Alegreya Sans, sans-serif`;ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillStyle='rgba(20,14,10,.75)';
  const t=u.n||'';const tw=ctx.measureText(t).width;ctx.fillRect(m.x-tw/2-3,(top||m.y)-Math.max(12,TW*0.26),tw+6,Math.max(12,TW*0.24));ctx.fillStyle='#efe3cc';ctx.fillText(t,m.x,(top||m.y)-2);ctx.restore()}
/* 🏳 call it off */
function penOffSync76(){let b=document.getElementById('pen76Off');const show=!!(S&&S.pen76&&!S.over&&!S.sim);
  if(!show){if(b)b.hidden=true;return}
  if(!b){b=document.createElement('button');b.id='pen76Off';b.type='button';b.className='btn';b.innerHTML='🏳 Call it off';const host=document.getElementById('cv')&&document.getElementById('cv').parentElement;if(!host)return;host.appendChild(b);
    b.addEventListener('click',async()=>{if(!S||!S.pen76||S.over)return;const p=S.players[0];const ok=await ask76('🏳 Call it off?',`The keepers pull <b>${esc(p.name)}</b> out of the pen. Wounds still count; −${PEN76.fame} fame.`,'🏳 Call it off','Keep fighting');
      if(ok&&S&&S.pen76&&!S.over){S.pen76.called=1;log(`The lanista raises a hand: <b>${esc(p.name)}</b> is pulled out of the pen.`,'big');gameOver([],'The lanista calls it off.')}})}
  b.hidden=false;b.disabled=!(typeof humanTurn==='function'&&humanTurn()&&!S.busy)}
setInterval(()=>{try{penOffSync76()}catch(e){}},400);
/* the wound the pen leaves — real, never death */
function penWound76(p,g,w){const H=k=>p.hp[k]||0;const zero=LOCS.filter(l=>H(l)<=0);
  const pick=zero.includes('head')?'head':zero.includes('chest')?'chest':zero.find(l=>/arm/.test(l))||zero.find(l=>/leg/.test(l));
  if(pick||!p.alive){const l=pick||'chest';const W2={head:['a rattled skull','surgeon',4],chest:['cracked ribs','surgeon',4],rarm:['a mauled shoulder','medicus',4],larm:['a mauled shoulder','medicus',4],rleg:['a mauled thigh','medicus',4],lleg:['a mauled thigh','medicus',4]}[l];
    return {until:w.week+2,label:W2[0],req:W2[1],pen:W2[2],ser76:1}}
  const full=LOCS.reduce((s,l)=>s+(BASE_HP[l]||0),0),now=LOCS.reduce((s,l)=>s+Math.max(0,H(l)),0);
  if(full&&now/full<=0.5)return {until:w.week+1,label:'claw marks on the thigh',req:'rest',pen:2};return null}
async function penApply76(P,out,p){
  if(!MGR.world||MGR.world.id!==P.cid){const d=await Store.getDoc('mgrCareers',P.cid);if(!d)return null;MGR.world=mgrMigrate(JSON.parse(d.world))}
  const w=W_(),m=me();const g=gById(P.gid);if(!g)return null;const T=NPCT[P.t]||{n:'beast',coin:0};const L=[];g.rec=g.rec||{};
  g.fat=Math.min(100,(g.fat||0)+(typeof FAT_EXH!=='undefined'?FAT_EXH:12));
  if(out==='win'){m.coin+=T.coin||0;g.rec.kn=(g.rec.kn||0)+1;g.morale=clamp((g.morale||50)+4,0,100);L.push(`🐾 The ${esc(T.n)} is down: +${T.coin||0} coin, +1 beast on the record`);ghist(g,`killed a ${T.n} in the beast pen`)}
  else if(out==='pulled'){g.fame=clamp((g.fame||0)-PEN76.fame,0,100);g.morale=clamp((g.morale||50)-3,0,100);L.push(`🏳 Pulled from the pen: −${PEN76.fame} fame`);ghist(g,`pulled from the beast pen (${T.n})`)}
  else{L.push(`⏳ Time — the ${esc(T.n)} is driven back. No bonus, no shame.`);ghist(g,`held off a ${T.n} in the beast pen`)}
  const inj=g.inj?null:penWound76(p,g,w);if(inj){g.inj=inj;L.push(`🩹 ${esc(inj.label)} (−${inj.pen} rating${serious76(g)?' · needs a bed':''})`)}
  L.push(`😮‍💨 Fatigue ${gFat?gFat(g):g.fat}`);
  (w.pen76log=w.pen76log||[]).unshift({s:w.season,wk:w.week,n:g.name,t:P.t,out});w.pen76log=w.pen76log.slice(0,8);
  tnews(`🐾 Beast pen: <b>${esc(g.name)}</b> vs the ${esc(T.n)} — ${out==='win'?'kills it':out==='pulled'?'is pulled out':'time is called'}.${inj?` ${esc(inj.label)}.`:''}`,out==='win'?'big':out==='pulled'?'bad':'');
  saveWorld(true);return {g,L,T}}
{const base=gameOver;gameOver=async function(winners,reason){if(!S||!S.pen76||S.sim)return base.apply(this,arguments);
  if(S.overShown)return;S.overShown=true;S.over=true;S.phase='over';S.busy=false;try{render()}catch(e){}penOffSync76();
  const P=S.pen76,p=S.players[0];const beast=S.npcs.find(n=>n.t===P.t)||S.npcs[0];const killed=!!(beast&&!beast.alive);
  const out=killed&&p.alive?'win':(!p.alive||P.called)?'pulled':'time';log(reason,'big');
  if(out==='win'&&typeof sfx==='function')setTimeout(()=>sfx('fanfare'),300);
  const R=await penApply76(P,out,p).catch(e=>{console.error(e);return null});if(!R)return;const {g,L,T}=R;
  const st=gStats(g);const title=out==='win'?`🐾 ${g.name} kills the ${T.n}`:out==='pulled'?`🏳 ${g.name} is pulled from the pen`:`⏳ Time is called`;
  const body=`<div class="pen76res">${pArt(p,'md')}<ul class="leave76">${L.map(x=>`<li>${x}</li>`).join('')}</ul></div>${out==='win'?`<p><b>Choose the bonus:</b> +${PEN76.bonus} to one rating.</p>`:''}`;
  const btns=out==='win'?STATS.map(([k,n,ic])=>({label:`${ic} ${n} +${PEN76.bonus}`,sub:`${st[k]} → ${Math.min(STAT_MAX,st[k]+PEN76.bonus)}`,value:'st:'+k})):[{label:'Back to the Training Yard',value:'back',primary:1}];
  let v=await modal(title,body,btns,{close:out==='win'?null:'back'});
  if(out==='win'){const k=String(v||'').startsWith('st:')?v.slice(3):'str';const before=st[k];st[k]=Math.min(STAT_MAX,st[k]+PEN76.bonus);const nm9=(STATS.find(s=>s[0]===k)||[])[1]||k;
    tnews(`⭐ <b>${esc(g.name)}</b> takes the pen's lesson: ${nm9} ${before} → ${st[k]}.`,'big');ghist(g,`${nm9} +${st[k]-before} from the beast pen`);saveWorld(true)}
  openManager('practice')}}
/* the Training Yard card */
const penFee76=t=>PEN76.beasts[t]||5;
function penWhy76(g,w){if(!g)return 'Pick a fighter';if(g.inj)return g.inj.war?'Away at war':'Hurt';if(g.restWk===w.week)return 'Resting this week';if(g.pen76Wk===w.week)return 'Already in the pen this week';return ''}
function penCardHTML76(){const w=W_(),m=me();const ros=rosterOf(m);if(!ros.length)return '';MGR.pen76=MGR.pen76||{};const S7=MGR.pen76;
  if(!S7.t||!PEN76.beasts[S7.t])S7.t='wolf';if(!ros.some(g=>g.id===S7.gid&&!penWhy76(g,w))){const ok=ros.find(g=>!penWhy76(g,w));S7.gid=ok?ok.id:ros[0].id}
  const g=gById(S7.gid);const why=penWhy76(g,w);const fee=penFee76(S7.t);const left=typeof thLeft==='function'?thLeft(w):0;
  const block=why||(left<PEN76.hours?`Needs ${PEN76.hours} training hours`:'')||(m.coin<fee?'Not enough coin':'');
  const tile=t=>{const T=NPCT[t];return `<button type="button" class="pen76b ${S7.t===t?'on':''}" data-pen76b="${t}"><b>${esc(T.n)}</b><small>HP ${T.hp} · attack ${T.ap} · move ${T.mv}</small><small>fee ${penFee76(t)} · kill +${T.coin} coin</small></button>`};
  return `<div class="card2 pen76"><div class="sect" style="margin-top:0">🐾 The beast pen <span class="rc-sub">one fighter, one beast, a 6×6 pen · your roster watches</span></div>
    <p class="rc-sub" style="margin:2px 0 8px">You fight it on the board. Kill it: the kill's coin and <b>+${PEN76.bonus}</b> to a rating you pick. Pulled out: −${PEN76.fame} fame. Wounds are real; nobody dies. ${PEN76.rot} rotations.</p>
    <div class="pen76row"><label class="rc-sub">Fighter <select id="pen76g">${ros.map(x=>{const y=penWhy76(x,w);return `<option value="${x.id}" ${x.id===S7.gid?'selected':''} ${y?'disabled':''}>${esc(x.name)} · ${effOvr(x)}${y?` — ${y}`:''}</option>`}).join('')}</select></label></div>
    <div class="pen76grid">${Object.keys(PEN76.beasts).filter(t=>NPCT[t]).map(tile).join('')}</div>
    <div class="acts" style="margin-top:8px"><button class="btn primary" type="button" data-pen76="go" ${block?`disabled title="${esc(block)}"`:''}>⚔ Into the pen<small>${PEN76.hours} h · ${fee} coin${block?` · ${esc(block)}`:''}</small></button></div></div>`}
{const base=practiceHTML;practiceHTML=function(){const h=base.apply(this,arguments);try{const c=penCardHTML76();if(!c)return h;
  /* inside the lock wrapper's frame when on the road */const i=h.lastIndexOf('</div>');return h.startsWith('<div class="card2 lock76">')&&i>0?h.slice(0,i)+c+h.slice(i):h+c}catch(e){console.error(e);return h}}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-pen76b]');if(!t||!t.closest('#mgrBody'))return;e.stopPropagation();MGR.pen76=MGR.pen76||{};MGR.pen76.t=t.dataset.pen76b;if(typeof MGR_REDRAW==='function')MGR_REDRAW()});
document.addEventListener('change',e=>{if(e.target&&e.target.id==='pen76g'){MGR.pen76=MGR.pen76||{};MGR.pen76.gid=e.target.value;if(typeof MGR_REDRAW==='function')MGR_REDRAW()}});
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-pen76="go"]');if(!t||t.disabled||!t.closest('#mgrBody'))return;e.preventDefault();e.stopPropagation();penGo76()});
function penGo76(){const w=W_(),m=me();const S7=MGR.pen76||{};const g=gById(S7.gid);const t=S7.t;if(!g||!NPCT[t]||penWhy76(g,w))return;const fee=penFee76(t);
  if(thLeft(w)<PEN76.hours||m.coin<fee)return;
  thPlan(w).spent=(thPlan(w).spent||0)+PEN76.hours;m.coin-=fee;g.pen76Wk=w.week;
  const home=typeof travelHome==='function'?travelHome(m):6;Object.defineProperty(EVENTS,'pen76',{value:penEventDef76(t,home),enumerable:false,configurable:true,writable:true});
  const watch=rosterOf(m).filter(x=>x.id!==g.id&&!(x.inj&&x.inj.war)).slice(0,PEN76.watch.length).map((x,i)=>{const [r,c]=PEN76.watch[i];const ctr=(PEN76.box[0]+PEN76.box[1])/2;
    const dr=Math.sign(ctr-r),dc=Math.sign(ctr-c);return {r,c,_fr:r-(Math.abs(r-ctr)>=Math.abs(c-ctr)?dr:0),_fc:c-(Math.abs(c-ctr)>Math.abs(r-ctr)?dc:0),cls:CLASSES[x.cls]?x.cls:'soldier',n:x.name.split(' ')[0],color:m.color}});
  const cfg={ev:'pen76',loc:home,seats:[seatFor(g,m.color,true)],opts:{mods:false,mandata:false,optOffers:false,eaglePot:false,spect:0},omen:OMENS[0],pen76:{cid:w.id,gid:g.id,t,week:w.week,watch}};
  tnews(`🐾 ${esc(g.name)} walks into the beast pen with a ${esc(NPCT[t].n)} (${PEN76.hours} h, ${fee} coin).`);
  saveWorld(true);if(typeof MM!=='undefined')MM.fromMenu=false;/* not 'close': that path takes you back to the main menu */if(CUR_MODAL)CUR_MODAL.done('pen76');else modalDismiss();S&&(S.over=true);startEvent(cfg)}
(()=>{const st=document.createElement('style');st.textContent=`
.pen76{margin-top:12px}.pen76grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}
.pen76b{display:grid;gap:1px;text-align:left;padding:7px 9px;border:1px solid var(--line2);border-radius:8px;background:var(--panel2);color:var(--bone);cursor:pointer}
.pen76b.on{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold) inset}.pen76b b{font:400 16px var(--display)}.pen76b small{color:var(--muted);font-size:11.5px}
.pen76row select{max-width:100%}.pen76res{display:flex;gap:12px;align-items:flex-start}.pen76res .leave76{margin-top:0}
#pen76Off{position:absolute;top:8px;left:8px;z-index:5;border-color:var(--gold)}#pen76Off[hidden]{display:none}`;document.head.appendChild(st)})();

/* =====================================================================
   v0.76 F — the Training Yard, one card per fighter (yardHTML76 replaces the tab's body; the room banner stays)
   • Top strip: this week's regime (data-mg="regime"), the hours bank, squad doctore hours (data-tp="doc|±1"),
     📜 Study the card (data-yj="study"), yard level and Discipline.
   • A card per fighter: header (rating → potential, morale, fatigue, status) · Drills (data-tp="g|id|k|±1", the gain
     previewed on the chip) · Care (own doctore data-mg="ptrain", 🗣 morale talk / 🛡 gear care data-yj, 🤝 bond) ·
     Bout, one a week (⚔ spar, 🏟 exhibition, 🐾 beast pen; boutDone76) — a choice opens its panel under the card
     (MGR.yb76 {gid,k}: partner select [data-yp76], the exhibition form #exMine/#exOpp + data-mg exsim/exlive/exfight,
     the pen's beasts) · This week: what is booked or done (yardRes76), last week's line.
   ===================================================================== */
function boutDone76(g,w){const P=thPlan(w);return P.pairs.some(p=>p.k==='spar'&&(p.a===g.id||p.b===g.id))||g.exWk===w.week||g.pen76Wk===w.week}
function yardRes76(g,w){const P=thPlan(w),X=x74(w);const R=[];const nmOf=id=>esc(((gById(id)||{}).name||'?').split(' ')[0]);
  if(X.morale.includes(g.id))R.push('🗣 Morale talk: +5 morale');if(X.gear.includes(g.id))R.push('🛡 Gear care: +1 AP next bout');if(g.ptrain)R.push(`⚒ Own doctore hired (${PTRAIN_COST}c)`);
  P.pairs.forEach((p,i)=>{if(p.a===g.id||p.b===g.id)R.push(`${p.k==='bond'?'🤝 Bonding':'⚔ Sparring'} with ${nmOf(p.a===g.id?p.b:p.a)} <button type="button" class="yd76x" data-tp="unpair|${i}" title="Cancel">✕</button>`)});
  if(g.exWk===w.week){const e=(w.exlog||[]).find(x=>x.s===w.season&&x.wk===w.week&&x.txt.includes(esc(g.name)));R.push(`🏟 ${e?e.txt.replace(/^Exhibition with ([^:]+):.*?(is [^(.]+).*/,'Exhibition vs $1: $2'):'Exhibition fought'}`)}
  if(g.pen76Wk===w.week){const e=(w.pen76log||[]).find(x=>x.s===w.season&&x.wk===w.week&&x.n===g.name);const T=e&&NPCT[e.t];R.push(`🐾 Beast pen: ${!e?'in the pen':e.out==='win'?`killed the ${esc(T?T.n:'beast')}`:e.out==='pulled'?`pulled out (${esc(T?T.n:'beast')})`:`time called (${esc(T?T.n:'beast')})`}`)}
  return R}
function yardCard76(g,w,m){const P=thPlan(w),X=x74(w);const left=thLeft(w);const used=thOfG(P,g.id);const st=gStats(g);const f=gFat(g);const rest=g.restWk===w.week;
  const o=effOvr(g),pot=Math.max(o,g.pot||o);const hurt=!!g.inj;const busy=MGR.yb76&&MGR.yb76.gid===g.id?MGR.yb76.k:null;const bd=boutDone76(g,w);const nm1=g.name.split(' ')[0];
  const chip=(k,ic,lab)=>{const h=(P.g[g.id]||{})[k]||0;const v=st[k]||50,fr=(g.sxp&&g.sxp[k])||0;const gain=h*TH_DRILL*GROW_SLOW(v);const up=left>0&&used<TH_FIGHTER&&!hurt&&!rest;
    return `<div class="yd76d ${h?'on':''}"><button type="button" data-tp="g|${g.id}|${k}|1" ${up?'':'disabled'} title="+1 hour of ${lab.toLowerCase()}">${ic}<b>${lab}</b><span>${v}${gain?` → ${(v+fr+gain).toFixed(1)}`:''}</span></button><span class="pips">${[0,1,2,3].map(n=>`<button type="button" class="pip ${n<h?'on':''}" ${n<h?`data-tp="g|${g.id}|${k}|-1" title="Take an hour back"`:'disabled'}></button>`).join('')}</span></div>`};
  const reh=(P.g[g.id]||{}).rehab||0;
  const drills=hurt?(g.inj.war?'<span class="rc-sub">Away at war.</span>':`<div class="yd76d ${reh?'on':''}"><button type="button" data-tp="g|${g.id}|rehab|1" ${left>0&&reh<2&&used<TH_FIGHTER?'':'disabled'}>🩹<b>Rehab</b><span>${reh>=2?'back a week sooner':`${2-reh} h → a week sooner`}</span></button><span class="pips">${[0,1].map(n=>`<button type="button" class="pip ${n<reh?'on':''}" ${n<reh?`data-tp="g|${g.id}|rehab|-1"`:'disabled'}></button>`).join('')}</span></div>`)
    :rest?'<span class="rc-sub">🛏 Resting this week — no drills.</span>':TH_TILES.map(([k,ic,lab])=>chip(k,ic,lab)).join('');
  const b=(attr,lab,sub,on,dis,tip)=>`<button type="button" class="yd76b ${on?'on':''}" ${attr} ${dis?`disabled title="${esc(dis)}"`:tip?`title="${esc(tip)}"`:''}>${lab}<small>${sub}</small></button>`;
  const care=[b(`data-mg="ptrain" data-id="${g.id}"`,'⚒ Own doctore',g.ptrain?`hired · ${PTRAIN_COST}c`:`${PTRAIN_COST}c · best odds`,g.ptrain,hurt?'Hurt fighters rest':'','A personal doctore for this week: the best odds of +1 rating, a little extra risk'),
    b(`data-yj="morale" data-id="${g.id}"`,'🗣 Morale talk',X.morale.includes(g.id)?'done':`1 h · ${g.morale}→${Math.min(100,g.morale+5)}`,X.morale.includes(g.id),X.morale.includes(g.id)?'Done this week':left<1?'No hours left':''),
    b(`data-yj="gear" data-id="${g.id}"`,'🛡 Gear care',X.gear.includes(g.id)?'done':'1 h · +1 AP',X.gear.includes(g.id),X.gear.includes(g.id)?'Done this week':hurt?'Hurt':left<1?'No hours left':''),
    b(`data-yb76="bond:${g.id}"`,'🤝 Bond','2 h · loyalty',busy==='bond',hurt?'Hurt':left<2?'Needs 2 hours':used+2>TH_FIGHTER?`${TH_FIGHTER} h a fighter`:'')].join('');
  const opps=w.mgrs.filter(x=>!x.isPlayer&&rosterOf(x).length);const fee=penFee76((MGR.pen76&&MGR.pen76.t)||'wolf');
  const why=hurt?'Hurt':rest?'Resting':bd?'One bout a week — done':'';
  const bout=[b(`data-yb76="spar:${g.id}"`,'⚔ Spar','2 h · Speed + Strength',busy==='spar',why||(left<2?'Needs 2 hours':used+2>TH_FIGHTER?`${TH_FIGHTER} h a fighter`:'')),
    b(`data-yb76="exh:${g.id}"`,'🏟 Exhibition',`${EXHIB_HOURS} h · ${EXHIB_COST}c · vs a rival`,busy==='exh',why||(!opps.length?'No rival has fighters':left<EXHIB_HOURS?`Needs ${EXHIB_HOURS} hours`:m.coin<EXHIB_COST?'Not enough coin':''),'Against a rival stable\'s fighters; nobody dies. Scouts them, a chance at +1 rating, +1 AP and +2 CF this Match Week, a perk point, warmer relations.'),
    b(`data-yb76="pen:${g.id}"`,'🐾 Beast pen',`${PEN76.hours} h + fee · kill: +${PEN76.bonus} rating`,busy==='pen',why||(left<PEN76.hours?`Needs ${PEN76.hours} hours`:''))].join('');
  let panel='';
  if(busy==='bond'||busy==='spar'){const mates=rosterOf(m).filter(x=>x.id!==g.id&&!x.inj&&x.restWk!==w.week&&thOfG(P,x.id)+2<=TH_FIGHTER&&!(busy==='spar'&&boutDone76(x,w)));
    panel=mates.length?`<div class="yd76p"><label class="rc-sub">${busy==='bond'?'Bond':'Spar'} with <select class="tin" data-yp76p="${g.id}">${mates.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select></label>
      <button class="btn primary tksm" type="button" data-yp76="${busy}|${g.id}">${busy==='bond'?'🤝 Bond':'⚔ Spar'}<small>2 h each · ${busy==='bond'?'+loyalty, +3 morale':'Speed + Strength · 4% knock'} · at week's end</small></button></div>`:`<div class="yd76p rc-sub">Nobody free to ${busy} with.</div>`}
  else if(busy==='exh')panel=`<div class="yd76p"><input type="hidden" id="exMine" value="${g.id}"><label class="rc-sub">Against <select class="tin" id="exOpp">${opps.map(x=>`<option value="${x.id}" ${MGR.pOpp===x.id?'selected':''}>${esc(x.ludus)} · ${rosterOf(x).length} fighters · ${rivalTier(x.rivalry||0)}</option>`).join('')}</select></label>
      <div class="acts"><button class="btn primary tksm" type="button" data-mg="exsim" ${MGR.busy?'disabled':dis(needTHrs(w,EXHIB_HOURS),needCoin(m,EXHIB_COST))}>Request it<small>resolved at once</small></button><button class="btn tksm" type="button" data-mg="exlive" ${dis(needTHrs(w,EXHIB_HOURS),needCoin(m,EXHIB_COST))}>Watch live<small>on the board</small></button><button class="btn tksm" type="button" data-mg="exfight" ${dis(needTHrs(w,EXHIB_HOURS),needCoin(m,EXHIB_COST))}>Fight it<small>you play ${esc(nm1)}</small></button></div><div id="mgProg"></div></div>`;
  else if(busy==='pen'){const t=(MGR.pen76&&MGR.pen76.t)||'wolf';const blk=m.coin<penFee76(t)?'Not enough coin':left<PEN76.hours?`Needs ${PEN76.hours} hours`:'';
    panel=`<div class="yd76p"><div class="pen76grid">${Object.keys(PEN76.beasts).filter(k=>NPCT[k]).map(k=>{const T=NPCT[k];return `<button type="button" class="pen76b ${t===k?'on':''}" data-pen76b="${k}"><b>${esc(T.n)}</b><small>HP ${T.hp} · attack ${T.ap} · move ${T.mv}</small><small>fee ${penFee76(k)} · kill +${T.coin} coin</small></button>`}).join('')}</div>
      <div class="acts" style="margin-top:6px"><button class="btn primary tksm" type="button" data-pen76="go" ${blk?`disabled title="${esc(blk)}"`:''}>⚔ Into the pen<small>${PEN76.hours} h · ${penFee76(t)} coin · you fight it · pulled: −${PEN76.fame} fame</small></button></div></div>`}
  const res=yardRes76(g,w);const last=(w.lastPlan||[]).filter(x=>x.includes(esc(g.name))).map(x=>x.replace(esc(g.name)+': ','').replace(esc(g.name),'')).slice(0,2);
  return `<div class="yd76c ${hurt?'hurt':''} ${busy?'open':''}"><div class="yd76hd">${mgAvatar(g)}<div class="yd76nm"><b>${esc(g.name)}</b><span class="rc-sub">${o} → ${pot} · morale ${g.morale}${hurt?` · ⚕ ${esc(g.inj.label)}`:''}${onCard(g)?' · ⚔ on this week\'s card':''}</span>
      <i class="yd76pot"><i style="width:${Math.round(o/Math.max(1,pot)*100)}%"></i></i></div><span class="yd76h" title="Training hours this fighter uses (max ${TH_FIGHTER})">${used}/${TH_FIGHTER} h</span><span class="fatchip" title="Fatigue ${f}"><i style="width:${f}%;background:${fatCol(f)}"></i></span></div>
    <div class="yd76row"><span class="yd76l">Drills</span><div class="yd76ds">${drills}</div></div>
    <div class="yd76row"><span class="yd76l">Care</span><div class="yd76bs">${care}</div></div>
    <div class="yd76row"><span class="yd76l">Bout</span><div class="yd76bs">${bout}</div></div>${panel}
    ${res.length||last.length?`<div class="yd76res">${res.map(x=>`<span>${x}</span>`).join('')}${last.length?`<span class="rc-sub">Last week: ${last.join(' · ')}</span>`:''}</div>`:''}</div>`}
function yardHTML76(){const w=W_(),m=me();const P=thPlan(w),X=x74(w);const left=thLeft(w),mx=thMax();const ros=rosterOf(m);const cur=w.train||'off';const Y=facLvl(m,'yard');
  const icon={off:'💤',light:'🚶',std:'🏃',hard:'🔥'};
  const reg=Object.entries(TRAIN_REGIMES).map(([k,R])=>`<button type="button" class="yd76rg ${cur===k?'on':''}" data-mg="regime" data-id="${k}">${icon[k]||'🏋'} <b>${k==='off'?'None':R.n.replace(/ drills/,'')}</b><small>${R.c?`${R.c}c · 📈 ${Math.round(R.gain*100)}% · 🩹 ${Math.round(R.inj*100)}%`:'free'}</small></button>`).join('');
  const top=`<div class="card2 yd76top"><div class="yd76regs"><span class="yd76l" title="Squad drills, resolved when the week ends: the odds of +1 rating per fighter, and the injury risk">Regime ⓘ</span>${reg}</div>
    <div class="yd76bank"><span class="thbig">${left}</span><span class="rc-sub">of ${mx} h</span><span class="bankpips">${Array.from({length:mx},(_,i)=>`<i class="${i<mx-left?'used':''}"></i>`).join('')}</span>
      <span class="yd76sq" title="Each hour lifts the whole squad's regime a quarter level (max ${TH_DOC})">🧑‍🏫 Squad doctore <span class="thc"><button type="button" data-tp="doc|-1" ${P.doc>0?'':'disabled'}>−</button><b>${P.doc}</b><button type="button" data-tp="doc|1" ${left>0&&P.doc<TH_DOC?'':'disabled'}>+</button></span></span>
      <button type="button" class="yd76b ${X.study?'on':''}" data-yj="study" ${X.study||left<1?'disabled':''}>📜 Study the card<small>${X.study?'done':'1 h · scout this week · a little Intelligence'}</small></button>
      <span class="rc-sub yd76fac">🏗 Yard ${Y}/3 · 🎖 Discipline ${m.p.discipline}</span></span></div></div>`;
  const cards=ros.map(g=>yardCard76(g,w,m)).join('');
  const lastT=(w.lastTraining||[]).slice(0,6);
  return `${top}<div class="yd76grid">${cards||'<p class="rc-sub">No fighters in the yard.</p>'}</div>
    ${lastT.length||(w.exlog||[]).length?`<details class="yd76log"><summary class="rc-sub">📜 Last week's drills and recent bouts</summary>${lastT.map(x=>`<div class="rc-sub">${esc(x.n)}: ${x.txt}</div>`).join('')}${(w.exlog||[]).slice(0,4).map(x=>`<div class="rc-sub">S${x.s} W${x.wk} · ${x.txt}</div>`).join('')}</details>`:''}`}
{const base=practiceHTML;practiceHTML=function(){const h=base.apply(this,arguments);try{const t=document.createElement('template');t.innerHTML=h;const hd=t.content.querySelector('.roomhd');
  const body=yardHTML76();const n=lockNote76('Training Yard');return (hd?hd.outerHTML:'')+(n?n+`<div class="locked76">${body}</div>`:body)}catch(e){console.error(e);return h}}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-yb76],[data-yp76]');if(!t||t.disabled||!t.closest('#mgrBody'))return;e.preventDefault();e.stopPropagation();const w=W_();if(!w)return;
  if(roadLocked76(w)){mToast(`🛣 On the road to <b>${esc(roadCity76(w))}</b> — the Training Yard reopens when the week ends.`);return}
  if(t.dataset.yb76){const [k,gid]=t.dataset.yb76.split(':');MGR.yb76=MGR.yb76&&MGR.yb76.gid===gid&&MGR.yb76.k===k?null:{gid,k};if(k==='pen'){MGR.pen76={...(MGR.pen76||{}),gid,t:(MGR.pen76&&MGR.pen76.t)||'wolf'}}if(typeof MGR_REDRAW==='function')MGR_REDRAW();return}
  const [k,gid]=t.dataset.yp76.split('|');const sel=document.querySelector(`[data-yp76p="${gid}"]`);const mate=sel&&sel.value;const P=thPlan(w);
  if(!mate||mate===gid||thLeft(w)<2)return;if(thOfG(P,gid)+2>TH_FIGHTER||thOfG(P,mate)+2>TH_FIGHTER){mToast(`Each fighter can train ${TH_FIGHTER} hours a week.`);return}
  P.pairs.push({k,a:gid,b:mate});MGR.yb76=null;saveWorld();mToast(`${k==='bond'?'🤝':'⚔'} ${esc(gById(gid).name)} and ${esc(gById(mate).name)} ${k==='bond'?'bond':'spar'} this week (2 h each).`);if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);
/* a pen launched from a fighter's card fights that fighter */
{const base=penGo76;penGo76=function(){try{if(MGR.yb76&&MGR.yb76.k==='pen'){MGR.pen76=MGR.pen76||{};MGR.pen76.gid=MGR.yb76.gid}}catch(e){}MGR.yb76=null;return base.apply(this,arguments)}}
/* a just-started event is never covered by the main menu (a window closing with 'close' while the bout is still setting up) */
{const base=menuShow;menuShow=function(){if(S&&!S.over&&S.phase==='setup'&&S.startedAt&&Date.now()-S.startedAt<8000)return;return base.apply(this,arguments)}}
(()=>{const st=document.createElement('style');st.textContent=`
.yd76top{display:grid;gap:8px;margin:10px 0}.yd76regs,.yd76bank{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.yd76bank .thbig{font:400 28px var(--display);color:var(--gold2);line-height:1}
.yd76l{font:600 11px var(--mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);min-width:46px}
.yd76rg,.yd76b{display:inline-grid;gap:0;text-align:left;padding:4px 8px;border:1px solid var(--line2);border-radius:7px;background:var(--panel2);color:var(--bone);cursor:pointer;font-size:13.5px}
.yd76rg small,.yd76b small{color:var(--muted);font-size:11px}.yd76rg.on,.yd76b.on{border-color:var(--gold);background:#3a2a18}.yd76rg:hover:not(:disabled),.yd76b:hover:not(:disabled){border-color:var(--gold)}
.yd76b:disabled{opacity:.45;cursor:default}.yd76b.on:disabled{opacity:1;color:#cfe3b8}.yd76sq{display:inline-flex;gap:6px;align-items:center;font-size:13px}.yd76fac{margin-left:auto}
.yd76grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(440px,1fr));gap:10px}
@media (max-width:620px){.yd76grid{grid-template-columns:1fr}}
.yd76c{border:1px solid var(--line2);border-top:3px solid var(--gold);border-radius:10px;background:linear-gradient(180deg,var(--panel2),var(--panel));padding:8px 10px;display:grid;gap:6px}
.yd76c.hurt{border-top-color:var(--blood2)}.yd76c.open{box-shadow:0 0 0 1px var(--gold) inset}
.yd76hd{display:grid;grid-template-columns:auto 1fr auto auto;gap:8px;align-items:center}.yd76hd>:first-child{width:30px;height:40px;overflow:hidden;display:block}.yd76hd>:first-child *{max-width:100%;max-height:40px}
.yd76nm{display:grid;min-width:0}.yd76nm b{font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.yd76nm .rc-sub{font-size:12px}
.yd76pot{display:block;height:3px;border-radius:2px;background:var(--line2);margin-top:3px;overflow:hidden}.yd76pot i{display:block;height:100%;background:linear-gradient(90deg,#b8862c,#f0cf7d)}
.yd76h{font:600 11px var(--mono,monospace);color:var(--muted);border:1px solid var(--line2);border-radius:8px;padding:1px 6px}
.yd76row{display:grid;grid-template-columns:52px 1fr;gap:6px;align-items:start}.yd76row .yd76l{padding-top:6px}
.yd76ds,.yd76bs{display:flex;flex-wrap:wrap;gap:5px}
.yd76d{display:grid;border:1px solid var(--line2);border-radius:7px;background:var(--panel2);min-width:92px}.yd76d.on{border-color:var(--gold)}
.yd76d>button{all:unset;cursor:pointer;display:grid;grid-template-columns:auto 1fr;column-gap:4px;padding:4px 7px 2px;font-size:12.5px}.yd76d>button:disabled{cursor:default;opacity:.55}
.yd76d>button b{font-weight:600}.yd76d>button span{grid-column:1/-1;color:var(--muted);font-size:11.5px}.yd76d .pips{display:flex;gap:3px;padding:0 7px 5px}
.yd76d .pip{width:9px;height:9px;border-radius:50%;border:1px solid var(--line2);background:none;padding:0;cursor:pointer}.yd76d .pip.on{background:#d9a441;border-color:#d9a441}.yd76d .pip:disabled{cursor:default}
.yd76p{border:1px dashed var(--gold);border-radius:8px;padding:8px;display:grid;gap:6px;background:rgba(214,171,76,.05)}.yd76p select{max-width:100%}
.yd76res{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:12.5px;border-top:1px solid var(--line2);padding-top:5px}.yd76res>span{color:#cfe3b8}.yd76res>span.rc-sub{color:var(--muted)}
.yd76x{background:none;border:0;color:var(--muted);cursor:pointer;padding:0 2px}.yd76log{margin-top:10px}`;document.head.appendChild(st)})();
