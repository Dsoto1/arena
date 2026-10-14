/* =====================================================================
   308-v100first · THE FIRST HOUR (v1.0, backlog "v1.0 EXTRAS" item 1)
   =====================================================================
   A brand-new player (flavius_firstrun 'pending', nothing in flavius_first100 yet) gets a new welcome:
     ⚔ Play your first match (guided) · 💼 Start your first ludus (guided) · Skip
   (the old hint switches stay in the same window, folded — tv52 ticks #frhAll; Skip keeps the value 'play').
   FIRST MATCH = a real Play Now event: Classic · Democritus at Capua (EVENTS.democritus.loc 6), you as the Soldier vs three Novice CPUs
   (Play Now's own easy pick → INT_FOR_DIFF.easy 64 = Novice), dice seed FH100.seed. COACH TIPS (FH100_MATCH) each appear ONCE at their
   moment: your first turn (the four phases + the Choice), first Action (moving), a target in reach (Attack / Focus), a beast close by,
   the Market lit, ending the turn, and the Fate on the results. They never block: no click is required or refused, "Got it" closes one,
   "No more tips" turns them all off (flavius_first100 .off). A tip closes itself when its moment passes.
   FIRST MANAGER WEEK = the player's REAL career (not the 36 lesson's sandbox — that one blocks every click but the next step, which the
   brief rules out): Manager mode opens on "Create a new lanista" with the Easy start picked, then tips (FH100_MGR) show once on each screen of
   the week — create · the desk · Recruiting · Training Yard · Match Week · simulate/watch · End the week · Week in review — and the
   rail tab of the next unseen step is outlined (.fh100spot: outline only, never a click guard). Tied to that career's id (st.cid) and its
   first week (st.w0); done after the week turns.
   Resumable: progress lives in localStorage flavius_first100 {seen:[keys],off,m:'match'|'mgr',mDone,gDone,cid,w0}; an unfinished guide
   shows a small card on the main menu (▶ Play it / ▶ Continue · ✕); after the guided match, the card offers the guided ludus once. Never in HEADLESS, sims, online, hot seat or the lessons; the tips are
   DOM only (never S, the dice RNG or onlHash; the seed is a fixed number in the config). Reduce motion: the box has no motion at all.
   Phones (≤600 px): the box spans the width above the dock. Kill switch localStorage flavius_first100off=1 (the old welcome, no tips).
   Test tv100fh; shots tools/plans/first100/. */
const FH100={seed:100,cur:null,shownAt:0,matchS:null,tick:0,next:null};
function fh100Off(){try{return localStorage.getItem('flavius_first100off')==='1'}catch(e){return false}}
function fh100St(){try{const v=JSON.parse(localStorage.getItem('flavius_first100')||'null');return v&&typeof v==='object'?v:null}catch(e){return null}}
function fh100Put(st){try{localStorage.setItem('flavius_first100',JSON.stringify(st))}catch(e){}}
function fh100Seen(k){const st=fh100St();return !!(st&&(st.seen||[]).includes(k))}
function fh100Mark(k){const st=fh100St()||{seen:[]};st.seen=st.seen||[];if(!st.seen.includes(k))st.seen.push(k);fh100Put(st)}
/* fh100Can — may a tip show on this screen at all? */
function fh100Can(){if(typeof HEADLESS!=='undefined'&&HEADLESS)return false;if(fh100Off())return false;const st=fh100St();if(!st||st.off)return false;
  try{if(typeof CFG!=='undefined'&&CFG.hotseat)return false}catch(e){}
  try{if(typeof ONL!=='undefined'&&ONL.live)return false}catch(e){}
  try{if(document.body.classList.contains('onlarena'))return false}catch(e){}
  return true}

/* ---------- the welcome ---------- */
{const base=firstRunPrompt;firstRunPrompt=async function(){
  let st0=null;try{st0=localStorage.getItem('flavius_firstrun')}catch(e){}
  if(fh100Off()||fh100St()||st0!=='pending'||navigator.webdriver)return base.apply(this,arguments);
  if(CUR_MODAL||$('#mainMenu').hidden)return setTimeout(firstRunPrompt,1500);
  try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}
  fh100Put({seen:[],off:0,m:null,at:Date.now()});
  const rows=Object.entries(HINT_LABELS).map(([k,[t,d]])=>`<label class="setrow" style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-frh="${k}"><span><b>${t}</b> <span class="rc-sub">${d}</span></span></label>`).join('');
  const body=`<div class="fh100w"><p>${_T`New to the sand? Pick a guided start. Short tips show up as you play — ignore them any time.`}</p>
    <div class="fh100c"><b>${_T`⚔ Your first match`}</b><span>${_T`One Classic bout against three easy rivals.`}</span></div>
    <div class="fh100c"><b>${_T`💼 Your first ludus`}</b><span>${_T`Found a house on Easy and run one week.`}</span></div>
    <p class="rc-sub">${_T`The full lessons stay under 🎓 Tutorials on the main menu.`}</p>
    <details class="fh100h"><summary>${_T`💡 Hints`}</summary><p class="rc-sub" style="margin-top:4px">${_T`They start off. Tick any you want, or press <b>H</b> or 💡 in the arena tools any time.`}</p>
    <label class="setrow" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="frhAll">${_T`<span><b>All hints</b></span>`}</label><div style="display:grid;gap:4px;padding-left:22px">${rows}</div></details></div>`;
  const v=await modal(_T('👋 Welcome to Flavius Rule'),body,[{label:_T('⚔ Play your first match (guided)'),value:'fh_match',primary:1},{label:_T('💼 Start your first ludus (guided)'),value:'fh_mgr'},{label:_T('Skip'),value:'play'}],{close:'play',onOpen:()=>{const mb=$('#mBody');
      mb.addEventListener('change',e=>{const t=e.target;if(t.id==='frhAll')mb.querySelectorAll('[data-frh]').forEach(x=>x.checked=t.checked);else if(t.dataset.frh){const all=[...mb.querySelectorAll('[data-frh]')];$('#frhAll').checked=all.every(x=>x.checked)}});
      mb.addEventListener('change',()=>{const on=[...mb.querySelectorAll('[data-frh]')].filter(x=>x.checked).map(x=>x.dataset.frh);for(const k of Object.keys(HINT_LABELS))SETTINGS[k]=on.includes(k);SETTINGS.hints=on.length>0;applySettings()})}});
  if(v==='fh_match')fh100Go('match');else if(v==='fh_mgr')fh100Go('mgr');
  else{const st=fh100St()||{seen:[]};st.skip=1;fh100Put(st)}}}

/* fh100Go — starts a guide from the menu (the 'learn' path's curtain). */
function fh100Go(m){const st=fh100St()||{seen:[]};st.m=m;st.off=0;st.skip=0;fh100Put(st);fh100MenuCard();
  const run=()=>{if(typeof menuHide==='function')menuHide();if(m==='match')fh100Match();else fh100Mgr()};
  try{MM.fromMenu=false}catch(e){}
  if(typeof transitRun==='function')transitRun(run,m==='match'?_T('Loading your first match…'):_T('Opening Manager mode…'));else run()}

/* fh100Match — the guided bout: a real Play Now event, fixed friendly setup. */
function fh100Match(){if(typeof liveEventRunning==='function'&&liveEventRunning())return;
  const seats=[{cls:'soldier',cpu:false},{cls:'slave',cpu:true,diff:'easy',name:'Marcus'},{cls:'amazonia',cpu:true,diff:'easy',name:'Livia'},{cls:'veteranus',cpu:true,diff:'easy',name:'Brutus'}];
  const ev=EVENTS.democritus;const loc=ev.loc||6;
  try{if(typeof CFG!=='undefined'){CFG.hotseat=false}}catch(e){}
  startEvent({ev:'democritus',loc,seats,opts:{...(typeof CFG!=='undefined'?CFG.opts:{}),spect:'auto'},seed:FH100.seed});
  FH100.matchS=S;const st=fh100St()||{seen:[]};st.m='match';st.mGo=(st.mGo||0)+1;fh100Put(st);fh100MenuCard()}

/* fh100Mgr — Manager mode on "Create a new lanista", Easy start picked. */
function fh100Mgr(){if(typeof openManager!=='function')return;
  const st=fh100St()||{seen:[]};st.m='mgr';fh100Put(st);
  if(st.cid){try{MGR.pendingLoad=st.cid}catch(e){}openManager('ludus');return}
  try{MGR.world=null;MGR.view=null}catch(e){}
  openManager();let n=0;const step=()=>{n++;const c=document.querySelector('#mgrBody [data-mg="create"]');
    if(c){c.click();setTimeout(()=>{try{if(typeof NEWMGR!=='undefined'&&NEWMGR){NEWMGR.diff='easy';if(typeof MGR_REDRAW==='function')MGR_REDRAW()}}catch(e){}},120);return}
    if(n<40)setTimeout(step,150)};setTimeout(step,200)}

/* ---------- the tips ---------- */
const fh100Me=()=>S&&S.players?S.players.find(p=>!p.cpu):null;
const fh100MyTurn=()=>{try{const p=cur();return !!(p&&!p.cpu&&p===fh100Me()&&!S.over)}catch(e){return false}};
const fh100Arena=()=>{try{return !!(S&&FH100.matchS===S&&!S.sim&&!S.onl&&!S.tutorial)}catch(e){return false}};
const fh100NoWin=()=>!(typeof CUR_MODAL!=='undefined'&&CUR_MODAL);
function fh100InReach(p){try{return attackSources(p).some(s=>targetsFor(p,s).some(t=>t.kind==='player'||t.kind==='npc'))}catch(e){return false}}
function fh100BeastNear(p){try{return (S.npcs||[]).some(n=>n&&n.hp>0&&n.r!=null&&cheb(n,p)<=3&&!n.tamedBy)}catch(e){return false}}
/* FH100_MATCH — the first match's tips, by priority. when() = the moment; spot = what to outline (never a click guard). */
const FH100_MATCH=[
  {k:'turn',when:()=>fh100NoWin()&&fh100MyTurn()&&['resolve','choice'].includes(S.phase),say:()=>S.phase==='choice'?_T`<b>Your turn.</b> Four phases: Resolve (beasts act) → Choice → Action → End. <b>Choice now:</b> take 2 coin (safe) or draw an arena card (a gift, or a beast).`:_T`<b>Your turn.</b> Four phases: Resolve (beasts act) → Choice → Action → End. The bar above your actions shows where you are.`,spot:'#actions',also:'choice'},
  {k:'choice',when:()=>fh100NoWin()&&fh100MyTurn()&&S.phase==='choice',say:()=>_T`<b>Choice:</b> take 2 coin (safe) or draw an arena card (a gift, or a beast).`,spot:'#actions'},
  {k:'attack',when:()=>fh100NoWin()&&fh100MyTurn()&&S.phase==='action'&&fh100InReach(cur()),say:()=>_T`<b>Someone is in reach.</b> Press a weapon under Attack, then click the target. With 3+ movement left, <b>Focus</b> aims at one body location.`,spot:'#actions'},
  {k:'move',when:()=>fh100NoWin()&&fh100MyTurn()&&S.phase==='action'&&(cur().mv||0)>0,say:()=>_T`<b>Action.</b> Click a lit tile to move — each tile costs 1 movement. Hover a tile to read it.`,spot:'#cv'},
  {k:'beast',when:()=>fh100NoWin()&&fh100MyTurn()&&fh100BeastNear(cur()),say:()=>_T`<b>A beast is close.</b> Beasts act in the Resolve phase and go for whoever hurt them. Kill one for coin and Crowd Favor — or keep away.`},
  {k:'market',need:'move',when:()=>fh100NoWin()&&fh100MyTurn()&&S.phase==='action'&&!!document.querySelector('#actions [data-act="market"]:not([disabled])'),say:()=>_T`<b>The Market</b> sells weapons and armor for coin. Buy between fights — gear wins the duel.`,spot:()=>document.querySelector('#actions [data-act="market"]')},
  {k:'end',need:'move',when:()=>fh100NoWin()&&fh100MyTurn()&&S.phase==='action'&&((cur().mv||0)===0||(cur().attacks||0)>0),say:()=>_T`<b>Done?</b> Press <b>End turn</b> (or Enter). Unused movement is lost.`,spot:()=>document.querySelector('#actions [data-act="end"]')},
  {k:'fate',when:()=>!!(S&&S.over),say:()=>_T`<b>The Fate.</b> Your Crowd Favor decides it: under 17 condemned, 17–19 the Thumb of Flavius, 20 or more you walk out. Win the crowd as well as the fight.`,last:1}];
/* FH100_MGR — the first Manager week's tips. tab = the rail tab the step lives on (its tab is outlined while it is the next unseen step). */
const fh100MgrShown=()=>{const e=document.getElementById('mgrBody'),m=document.getElementById('modal');return !!(e&&m&&!m.hidden)};
const fh100W=()=>{try{const w=MGR.world;const st=fh100St();return w&&!w.tutorial&&st&&st.cid===w.id?w:null}catch(e){return null}};
const fh100Mine=w=>{try{const ids=new Set(rosterOf(me()).map(g=>g.id));return (w.night&&w.night.bouts||[]).some(b=>(b.ents||[]).some(id=>ids.has(id)))}catch(e){return false}};
const FH100_MGR=[
  {k:'g_create',when:()=>fh100MgrShown()&&!MGR.world&&MGR.view==='create',say:()=>_T`<b>Found your house.</b> Name your lanista and ludus, keep the <b>Easy</b> start (more coin, two fighters), then press <b>Open the ludus</b>.`,spot:'#mgrBody [data-mg="nmgo"]'},
  {k:'g_desk',tab:'ludus',when:()=>fh100MgrShown()&&fh100W()&&MGR.tab==='ludus',say:()=>_T`<b>Your ludus.</b> The desk lists this week's tasks — work them top to bottom. The rail on the left opens every room.`,spot:'#mgrBody #desk99'},
  {k:'g_recruit',tab:'recruit',when:()=>fh100MgrShown()&&fh100W()&&MGR.tab==='recruit',say:()=>_T`<b>Recruiting.</b> Click a free agent. Your Recruiter's hours scout them, pitches win them over, then offer a contract.`},
  {k:'g_yard',tab:'practice',when:()=>fh100MgrShown()&&fh100W()&&MGR.tab==='practice',say:()=>_T`<b>Training Yard.</b> Press <b>+</b> on a rating to plan a session, then <b>🔒 Lock in</b> — only locked sessions train.`},
  {k:'g_night',tab:'night',when:()=>fh100MgrShown()&&fh100W()&&MGR.tab==='night'&&!fh100Mine(fh100W()),say:()=>_T`<b>Match Week.</b> Pick a fighter in a bout and press <b>Enter your fighter</b>. Every entry earns a fee; the winner's house takes the purse.`,spot:'#mgrBody .bout'},
  {k:'g_sim',tab:'night',when:()=>fh100MgrShown()&&fh100W()&&MGR.tab==='night'&&fh100Mine(fh100W()),say:()=>_T`<b>Entered.</b> Watch a bout live, fight it yourself — or <b>⚡ Simulate Match Week</b> to fight the card now.`,spot:'#mgrBody [data-mg="simall"]'},
  {k:'g_end',when:()=>{const w=fh100W();return fh100MgrShown()&&!!w&&w.week===fh100St().w0&&!!(w.night&&(w.night.bouts||[]).length&&w.night.bouts.every(b=>b.done))},say:()=>_T`<b>The card is fought.</b> Settle any verdicts, then <b>⏭ End the week</b>: wages are paid, the yard trains, the empire moves on.`,spot:'#mgrBody [data-mg="endask"]'},
  {k:'g_review',when:()=>{const w=fh100W();return fh100MgrShown()&&!!w&&w.week>fh100St().w0&&MGR.tab==='ludus'},say:()=>_T`<b>Week in review</b> — the first letter under <b>📬 Letters</b> on your desk. Your first week is done: the house is yours now.`,spot:'#mgrBody [data-lu100mail]',last:1}];

/* the box: the coach look (.tutcoach.cue) — one tip at a time */
function fh100Box(){let el=document.getElementById('fh100');if(el)return el;el=document.createElement('div');el.id='fh100';el.className='tutcoach cue fh100';el.setAttribute('role','status');el.setAttribute('aria-live','polite');
  el.addEventListener('click',e=>{const b=e.target.closest('[data-fh100]');if(!b)return;const a=b.dataset.fh100;
    if(a==='ok')fh100Hide();else if(a==='off'){const st=fh100St()||{seen:[]};st.off=1;fh100Put(st);fh100Hide();fh100MenuCard();if(typeof mToast==='function')mToast(_T('💡 Tips off — the guide stays under 🎓 Tutorials.'))}});
  document.body.appendChild(el);return el}
function fh100Hide(){const el=document.getElementById('fh100');if(el)el.remove();document.querySelectorAll('.fh100spot').forEach(x=>x.classList.remove('fh100spot'));const t=FH100.cur;FH100.cur=null;
  if(t&&t.last){const st=fh100St()||{seen:[]};if(st.m==='match'&&t.k==='fate')st.mDone=1;if(t.k==='g_review')st.gDone=1;if(st.mDone&&st.m==='match')st.m=null;if(st.gDone&&st.m==='mgr')st.m=null;fh100Put(st)}}
function fh100Show(t,kind){FH100.cur=t;FH100.shownAt=Date.now();FH100.kind=kind;fh100Mark(t.k);if(t.also)fh100Mark(t.also);
  const el=fh100Box();el.classList.toggle('fh100g',kind==='mgr');
  const face=typeof flavFaceURL==='function'?flavFaceURL(t.last?'cheer':'pleased',kind==='mgr'&&typeof MTUTOR99==='function'?MTUTOR99():typeof TUTOR99==='function'?TUTOR99():undefined):'';
  const lab=kind==='mgr'?_T('Your first ludus · tip'):_T('Your first match · tip');
  el.innerHTML=`${face?`<img src="${face}" alt="">`:''}<div><div class="tutstep">${lab}</div><div class="fh100t">${t.say()}</div><div class="acts" style="margin-top:6px"><button class="btn primary tksm" type="button" data-fh100="ok">${_T`Got it`}</button><button class="btn tksm" type="button" data-fh100="off">${_T`No more tips`}</button></div></div>`;
  fh100Spot(t);fh100Place()}
/* fh100Place — desktop match: the box sits just above the action bar (the board's empty lower corner), never over the buttons */
function fh100Place(){const el=document.getElementById('fh100');if(!el)return;const a=document.getElementById('actions');const B=document.body.classList;
  if(FH100.kind==='match'&&innerWidth>600&&a&&!B.contains('phoneL')&&!B.contains('phoneP2')){const r=a.getBoundingClientRect();if(r.height>0&&r.top>140){el.style.left=Math.max(8,r.left)+'px';el.style.bottom=Math.round(innerHeight-r.top+8)+'px';return}}
  el.style.left='';el.style.bottom=''}
function fh100Text(t){const el=document.getElementById('fh100');const tx=el&&el.querySelector('.fh100t');if(!tx)return;let h='';try{h=t.say()}catch(e){}if(h&&tx.dataset.h!==h){tx.dataset.h=h;tx.innerHTML=h}}
function fh100Spot(t){const tgt=t&&t.spot?(typeof t.spot==='function'?t.spot():document.querySelector(t.spot)):null;
  document.querySelectorAll('.fh100spot').forEach(x=>{if(x!==tgt)x.classList.remove('fh100spot')});if(tgt)tgt.classList.add('fh100spot')}
/* fh100Tick — every 400 ms (a PERF92 sweep: render/input/modal wake it): is a tip's moment here? */
function fh100Tick(){if(!fh100Can()){if(FH100.cur||document.getElementById('fh100'))fh100Hide();return}
  const st=fh100St();let list=null,kind=null;
  if(fh100Arena()){list=FH100_MATCH;kind='match'}
  else if(st.m==='mgr'||st.cid){
    /* the career this guide belongs to: the first non-lesson world opened after the guide began */
    try{const w=MGR.world;if(w&&!w.tutorial&&!st.cid&&st.m==='mgr'&&!st.gDone){st.cid=w.id;st.w0=w.week;fh100Put(st)}}catch(e){}
    if(!st.gDone&&!(S&&!S.over&&S.phase!=='setup'&&!fh100MgrShown())){list=FH100_MGR;kind='mgr'}}
  const cur9=FH100.cur;
  if(cur9){let still=false;try{still=!!cur9.when()}catch(e){}
    if(!list||FH100.kind!==kind){fh100Hide();return}
    if(!still&&!cur9.last&&Date.now()-FH100.shownAt>1200){fh100Hide()}
    else{fh100Spot(cur9);fh100Text(cur9);fh100Place();if(Date.now()-FH100.shownAt<6000||cur9.last)return}}
  if(!list)return;
  const seen=new Set((fh100St()||{}).seen||[]);
  for(const t of list){if(seen.has(t.k))continue;if(t.need&&!seen.has(t.need))continue;let ok=false;try{ok=!!t.when()}catch(e){}if(ok){if(FH100.cur&&FH100.cur.k===t.k)return;fh100Show(t,kind);return}}
  /* the Manager guide outlines the rail tab of the next unseen step that lives on another tab */
  if(kind==='mgr'&&!FH100.cur&&fh100W()){const nx=list.find(t=>t.tab&&!seen.has(t.k));document.querySelectorAll('.fh100spot').forEach(x=>x.classList.remove('fh100spot'));
    if(nx&&MGR.tab!==nx.tab){const b=document.querySelector(`#mgrBody [data-mg="tab"][data-id="${nx.tab}"]`);if(b)b.classList.add('fh100spot')}}}
try{if(typeof PERF92_SWEEPS!=='undefined')PERF92_SWEEPS.push(['fh100','fh100Tick()'])}catch(e){}
setInterval(()=>{try{fh100Tick()}catch(e){}},400);

/* ---------- resume from the main menu ---------- */
function fh100MenuCard(){let el=document.getElementById('fh100mm');const mm=document.getElementById('mainMenu');const st=fh100St();
  const nxt=!!(st&&st.mDone&&!st.m&&!st.cid&&!st.gDone&&!st.nx);
  const want=!!(mm&&!mm.hidden&&st&&!st.off&&!fh100Off()&&((st.m==='match'&&!st.mDone)||(st.m==='mgr'&&!st.gDone)||nxt));
  if(!want){if(el)el.remove();return}
  if(!el){el=document.createElement('div');el.id='fh100mm';el.className='fh100mm';mm.appendChild(el);
    el.addEventListener('click',e=>{const b=e.target.closest('[data-fh100m]');if(!b)return;const a=b.dataset.fh100m;const s=fh100St()||{seen:[]};
      if(a==='go')fh100Go(s.m||'mgr');else if(a==='nx'){s.nx=1;fh100Put(s);el.remove()}else{s.off=1;fh100Put(s);el.remove()}})}
  const h=nxt?`<span>${_T`🎓 <b>Next:</b> your first ludus — one guided week.`}</span><button class="btn primary tksm" type="button" data-fh100m="go">${_T`▶ Start`}</button>`:st.m==='match'?`<span>${_T`🎓 <b>Your first match</b> — not finished.`}</span><button class="btn primary tksm" type="button" data-fh100m="go">${_T`▶ Play it`}</button>`:`<span>${_T`🎓 <b>Your first ludus</b> — one week to go.`}</span><button class="btn primary tksm" type="button" data-fh100m="go">${_T`▶ Continue`}</button>`;
  const full=h+`<button class="btn tksm" type="button" data-fh100m="${nxt?'nx':'x'}" aria-label="${_T`Close the guide`}">✕</button>`;if(el.dataset.h!==full){el.dataset.h=full;el.innerHTML=full}}
{const _ms=menuShow;menuShow=function(){const r=_ms.apply(this,arguments);try{fh100MenuCard()}catch(e){}return r}}
{const _mh=menuHide;menuHide=function(){const r=_mh.apply(this,arguments);try{const el=document.getElementById('fh100mm');if(el)el.remove()}catch(e){}return r}}

{const st=document.createElement('style');st.textContent=`
#fh100.tutcoach{z-index:3200;left:14px;bottom:14px;top:auto;right:auto;max-width:min(400px,92vw);transition:none}
#fh100.fh100g{left:auto;right:14px}
#fh100 .fh100t{color:var(--bone)}
.fh100spot{outline:3px solid #f0cf7d!important;outline-offset:2px}
.fh100w .fh100c{display:grid;gap:2px;padding:6px 10px;margin:6px 0;border:1px solid var(--line,#5a4630);border-radius:6px;background:rgba(0,0,0,.18)}
.fh100w .fh100c span{color:var(--muted);font-size:13px}
.fh100w details.fh100h summary{cursor:pointer;color:var(--gold2);margin-top:6px}
.fh100mm{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:20;display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:center;max-width:calc(100vw - 32px);
  background:#1e160f;border:1px solid var(--gold);border-radius:8px;padding:6px 10px;box-shadow:0 8px 24px rgba(0,0,0,.6);font-size:14px}
@media (max-width:600px){#fh100.tutcoach,#fh100.fh100g{left:8px;right:8px;bottom:64px;max-width:none}.fh100mm{bottom:8px;font-size:13px}}`;document.head.appendChild(st)}
