/* =====================================================================
   36-MTUTOR · LEARN TO PLAY: MANAGER MODE (v0.44)
   =====================================================================
   A guided first week in a SANDBOX league (never saved, never your wallet): Flavius walks the new
   lanista through the house — the header, the tabs, the roster, recruiting, practice, Match Week
   (entering a fighter, simulating the card, reading the results), the league — and ending the week.
   Each step lights the part in question and waits for the click it asks for. Leave any time; at the end,
   a window offers the main menu, a new career, or the lesson again.
   ===================================================================== */
const MTUT={on:false,step:0,w0:0};
const mtW=()=>MGR.world&&MGR.world.tutorial?MGR.world:null;
const mtG=k=>{const id=MTUT[k];return id&&typeof gById==='function'?gById(id):null};
const mtNm=k=>{const g=mtG(k);return g?esc(g.name):'your fighter'};
const mtBout=i=>{const w=mtW();return w&&w.night&&w.night.bouts[i]};
const mtIn=(i,k)=>{const b=mtBout(i);return !!(b&&b.ents.includes(MTUT[k]))};
const mtEl=sel=>typeof sel==='function'?sel():sel?document.querySelector(sel):null;
const mtUp=(sel,up)=>()=>{const e=document.querySelector(sel);return e?(up?e.closest(up)||e.parentElement:e.parentElement):null};
const mtRivalId=()=>{const w=mtW();if(!w)return '';const r=w.mgrs.filter(m=>!m.isPlayer&&!m.dead).sort((a,b)=>(b.fame||0)-(a.fame||0))[0];return r?r.id:''};
/* v0.45 THE DEEP LESSON — one full week, every step checked off by DOING it (the coach moves on by itself),
   with guard rails: only what the step asks for can be clicked (dialogs it opens are fine), so a lesson can
   never turn into a real career by accident. */
const MTUT_STEPS=[
  {spot:'.mhead',say:`Welcome, <b>lanista</b>. This is a sandbox league made for this lesson — nothing is saved. Up top: your <b>treasury</b> (we lent you plenty), <b>fame</b>, ludus grade, record and the week's <b>recruiting hours</b>.`,next:1},
  {spot:'.mtabs',say:`The <b>tabs</b> run your ludus — your house, the arena, the wider world, and you. Work them left to right each week; the coach will walk you through them.`,next:1},
  // the roster and a fighter's card
  {spot:'[data-mg="tab"][data-id="roster"]',say:`Open <b>🛡 Roster</b> — the fighters under contract to your house.`,tab:'roster'},
  {spot:()=>document.querySelector(`#mgrPane tr[data-mg="lsel"][data-id="${MTUT.B}"]`),say:()=>`You have two fighters. Click <b>${mtNm('B')}</b> in the list to open <b>their card</b> beside it.`,until:()=>MGR.lsel===MTUT.B},
  {spot:()=>document.querySelector(`#mgrPane [data-mg="meal"][data-id="${MTUT.B}"]`),say:()=>`The card: rating, morale, loyalty, contract. Under <b>Keeping them</b> you spend hours and coin to keep a fighter happy and loyal. Click <b>🍷 Share a meal</b> with ${mtNm('B')}.`,until:()=>{const g=mtG('B');return g&&g.mealWk===mtW().week}},
  {spot:'#mgrPane',spotOnly:1,say:()=>`Morale and loyalty rise. <b>Morale</b> walks onto the sand with them (80+ adds AP and CF); <b>loyalty</b> is what a rival must beat to poach them.`,next:1},
  // recruiting: courting a free agent
  {spot:'[data-mg="tab"][data-id="recruit"]',say:`Now <b>🤝 Recruiting</b> — the free agents of the empire.`,tab:'recruit'},
  {spot:'#mgrPane table.tally',say:`Click any <b>free agent</b> in the list to open their recruiting card.`,enter:()=>{MTUT.sel0=MGR.sel},until:()=>MGR.sel&&MGR.sel!==MTUT.sel0,allow:['[data-mg="sort"]','[data-mg="filter"]']},
  {spot:()=>document.querySelector('#mgrPane [data-mg="scout"]'),say:`Courting starts with knowing them. Press <b>Scout</b> — six sparring bouts in your ludus reveal what they want and how they grade your house.`,enter:()=>{MTUT.court=MGR.sel},until:()=>{const g=gById(MGR.sel);return g&&(g.scout||0)>=1&&!MGR.busy}},
  {spot:mtUp('#mgrPane [data-mg="pitch"]','.acts'),say:`Now <b>pitch</b> them — sell what they care about most (the grades you just revealed). One pitch per recruit a week; each costs an hour.`,until:()=>{const g=gById(MGR.sel);const r=g&&g.recW&&g.recW[me().id];return !!(r&&r.wk===mtW().week&&r.a&&r.a.pitch)}},
  {spot:'#mgrPane',spotOnly:1,say:`Their <b>interest</b> climbs as you court them — feasts, pitches, a famous house, a fair wage. When it is high enough, <b>Offer a contract</b>. Not today: we have a card to fight.`,next:1},
  // the infirmary
  {spot:'[data-mg="tab"][data-id="infirm"]',say:()=>`${mtNm('A')} came home hurt last week. Open the <b>⚕ Infirmary</b>.`,tab:'infirm'},
  {spot:()=>document.querySelector(`#mgrPane [data-mg="medic"][data-id="${MTUT.A}"]`),say:()=>`A hurt fighter cannot be entered. Call the <b>Medicus</b> for ${mtNm('A')} — it clears the wound and lifts their spirits.`,until:()=>{const g=mtG('A');return g&&!g.inj}},
  // my ludus: spending to improve
  {spot:'[data-mg="tab"][data-id="ludus"]',say:`Cleared for play. Now <b>🏛 Your ludus</b> — where coin and points become a better house.`,tab:'ludus'},
  {spot:'[data-mg="run"][data-id="fac"]',say:`Open <b>🏗 Facilities</b>: permanent upgrades — one project a week.`,until:()=>MGR.run==='fac'},
  {spot:'[data-mg="build"][data-id="stables"]',say:`Build the <b>🐎 Stables</b> — your own road crew makes every away trip cheaper. (The yard, the infirmary wing, the barracks, the armory and the practice stands each help in their own way; together they set your <b>Ludus grade</b>, which recruits look at.)`,until:()=>facLvl(me(),'stables')>=1},
  {spot:'[data-mg="run"][data-id="school"]',say:`Coin builds the house; <b>perk points</b> build <i>you</i>. Open <b>🎓 Schooling</b>.`,until:()=>MGR.run==='school'},
  {spot:mtUp('#mgrPane [data-mg="perk"]','.card2'),say:`Spend your perk point on any trait — Honor, Showmanship, Discipline… Recruits grade you on exactly these. You earn more each week: wins, kept pledges, training.`,until:()=>(me().perkPts||0)<1},
  {spot:'.rundash [data-id="practice"]',spotOnly:1,say:`The weekly drills live in the <b>🏋 Training Yard</b> tab (with sparring against other stables). This tile takes you there any week.`,next:1},
  // match night
  {spot:'[data-mg="tab"][data-id="night"]',say:`The heart of it: <b>⚔️ Match Week</b>.`,tab:'night'},
  {spot:'[data-mg="city"]',spotOnly:1,say:`Each week's games are in one city — and in that week you can walk its <b>city square</b>: shops, the tavern, the auction block, the crowd. Explore it in your own career (after paying the road, away from home). Not in this lesson.`,next:1},
  {spot:'#mgrPane .bout',spotOnly:1,say:`Three bouts: <b>undercard</b>, <b>feature</b>, <b>main event</b>. Every fighter you enter earns an appearance fee; the winner's house takes the <b>purse</b>. They are fought in order.`,next:1},
  {spot:mtUp('#ent0','.bslip'),say:()=>`Pick <b>${mtNm('A')}</b> in the Undercard's list and press <b>Enter your fighter</b>.`,until:()=>mtIn(0,'A')},
  {spot:mtUp('#mgrPane [data-mg="watch"][data-id="0"]','.acts'),say:()=>`Now watch ${mtNm('A')} fight — <b>👁 Watch it live</b> from your box, or <b>🎟 Spectate</b> from a seat in the stands.`,until:()=>!!(S&&S.mgrCtx&&!S.over&&!mtMgrShown()),allow:['[data-mg="watch"][data-id="0"]','[data-mg="spect"][data-id="0"]']},
  {arena:1,spot:'#btnSimEnd',say:`The bout is live on the sand (close the briefing first — it tells you the event's rules). You could watch it to the end; for the lesson, press <b>⏭ Sim to end</b> to resolve it now.`,until:()=>{const b=mtBout(0);return !!(b&&b.done)||!!(S&&S.over)}},
  {arena:1,spot:()=>[...document.querySelectorAll('#mBtns button')].find(b=>/Return to Match Week/.test(b.dataset.en84||b.textContent))||null,say:`The result is in. Press <b>⏎ Return to Match Week</b>.`,until:()=>!!mtMgrShown()&&MGR.tab==='night'},
  {spot:'#pendbox',say:()=>`A <b>verdict awaits</b> for ${mtNm('A')}: the Fate table sent them to the <b>Thumb of Flavius</b>. Face it — roll the d6 yourself.`,enter:()=>mtVerdict(),until:()=>!(mtW().pend||[]).length&&!MGR.busy,allow:['[data-mg="pthumb"]','[data-mg="pblood"]','[data-mg="prudis"]']},
  {spot:()=>document.querySelector('#mgrPane [data-stk="1|5"]'),say:()=>`The <b>Feature bout</b>. You do have a fighter who could go in — ${mtNm('B')} — but we are saving them for the <b>Main event</b>. So <b>bet</b> on this one instead: raise your stake with <b>+5</b>.`,enter:()=>{const i=document.getElementById('mgStake1');MTUT.stk0=i?+i.value:10},until:()=>{const i=document.getElementById('mgStake1');return !!i&&+i.value>(MTUT.stk0||10)}},
  {spot:()=>mtBetPick(),say:`Now press <b>Bet</b> beside the lit fighter — the bookmaker's favourite (the lowest odds).`,until:()=>{const b=mtBout(1);return !!(b&&(b.bets||[]).length)},allow:['[data-mg="bet"]','#mgStake1','[data-stk]']},
  {spot:()=>document.querySelector('#mgrPane [data-mg="sim"][data-id="1"]'),say:`Slip in hand. The card runs in order — press <b>⚡ Simulate</b> on the Feature bout to fight it now. (You could also watch it or fight it yourself.)`,until:()=>{const b=mtBout(1);return !!(b&&b.done)&&!MGR.busy}},
  {spot:mtUp('#ent2','.bslip'),say:()=>`The <b>Main event</b> — the big purse. Pick <b>${mtNm('B')}</b> and press <b>Enter your fighter</b>.`,until:()=>mtIn(2,'B')},
  {spot:'[data-mg="simall"]',say:()=>`Now <b>⚡ Simulate Match Week</b> — the main event is fought in a moment, with ${mtNm('B')} in it. (In your own career you can also <b>watch it live</b> or <b>fight it yourself</b> — take your fighter's reins on the sand. For the lesson, we simulate.)`,until:()=>{const w=mtW();return w&&w.night.bouts.every(b=>b.done)&&!MGR.busy}},
  {spot:'#nightRes',spotOnly:1,say:`<b>The results.</b> Each fighter's place, the <b>Crowd Favor</b> they earned and the <b>Fate</b> it bought (under 17 CF: condemned; 17-19: the Thumb; 20-49: back to the ludus; 50+: the rudis), your purses and fees, the crowd — and your betting slip.`,next:1},
  {spot:'#pendbox',say:`Another verdict from the main event — settle it the same way before the week can end.`,until:()=>!(mtW().pend||[]).length&&!MGR.busy,allow:['[data-mg="pthumb"]','[data-mg="pblood"]','[data-mg="prudis"]']},
  // the league
  {spot:'[data-mg="tab"][data-id="league"]',say:`<b>📊 League</b> — the table. A win is 3 points, a runner-up finish 1; the top four go to the Superbus at season's end.`,tab:'league'},
  {spot:()=>document.querySelector(`#mgrPane tr[data-mg="team"][data-id="${mtRivalId()}"]`),say:()=>{const m=mgrById(mtRivalId());return `Every house can be visited. Click <b>${esc(m?m.ludus:'a rival house')}</b>${m?` — ${esc(m.name)}'s stable, the most famous in the league`:''}.`},until:()=>MGR.tab==='team'&&MGR.teamId===mtRivalId()},
  {spot:()=>{const e=document.querySelector(`#mgrPane [data-mg="envoy"][data-id="${mtRivalId()}|gift"]`);return e?e.closest('.commsacts')||e.parentElement:null},say:`Their lanista, roster and ledger — and <b>correspondence</b>. Send an envoy: <b>🎁 gifts</b> warm a rival (trades and pacts need a warm opinion).`,until:()=>{const m=mgrById(mtRivalId());return m&&m.envoyWk===mtW().week},allow:['[data-mg="envoy"]']},
  {spot:'[data-mg="tab"][data-id="imp"]',say:`<b>🌍 Imperium</b> — the map of the empire.`,tab:'imp'},
  {spot:'#mgrPane',spotOnly:1,say:`Fans on the roads, weather, wars and plagues, each city's crowd and mood — all of it moves attendance, purses and risk. A war can even call your fighters to the levy.`,next:1},
  {spot:'[data-mg="tab"][data-id="sched"]',say:`<b>📅 Season</b> — the schedule.`,tab:'sched'},
  {spot:'#mgrPane',spotOnly:1,say:`Twelve weeks, a city each week; festivals and invitationals on the side; the Superbus in Roma at the end. Plan your roads and your stars around it.`,next:1},
  {spot:'[data-mg="endask"]',say:`Last: <b>⏭ End the week</b>. Wages are paid, the yard trains, rivals scheme — and the empire moves on.`,until:()=>MGR.confirmEnd||(mtW()&&mtW().week>MTUT.w0)},
  {spot:'[data-mg="endweek"]',say:`Confirm it.`,until:()=>mtW()&&mtW().week>MTUT.w0},
  {spot:'#mgrPane [data-mg="tab"][data-id="ludus"]',say:`The <b>Acta Diurna</b> — the week's gazette: results, deaths, signings, the league's top fives. When you have read it, <b>set the paper down</b> to finish this lesson.`,until:()=>mtW()&&mtW().week>MTUT.w0&&MGR.tab==='ludus',finish:1,last:1}];
/* the lesson's one staged moment: the first bout ends at the Thumb, so there is always a verdict to settle */
function mtVerdict(){const w=mtW();if(!w)return;w.pend=(w.pend||[]).filter(x=>x.t!=='levy'); /* no wars in the lesson */const g=mtG('A');if(!g)return;if((w.pend||[]).some(x=>x.gid===g.id)||!g.alive)return;
  const b=w.night.bouts[0];const row=b&&b.res&&b.res.rows.find(x=>x.gid===g.id);if(row){row.f=18;row.vd='p-thumb';row.fname='Thumb of Flavius'}
  (w.pend=w.pend||[]).push({t:'thumb',gid:g.id,bi:0,f:18});if(typeof MGR_REDRAW==='function'&&document.getElementById('mgrBody'))try{MGR_REDRAW()}catch(e){}}
/* the fighter to back in the feature: the lowest odds on the card */
function mtBetPick(){const bs=[...document.querySelectorAll('#mgrPane [data-mg="bet"][data-id^="1|"]')];if(!bs.length)return null;return bs.sort((a,b)=>(+a.dataset.id.split('|')[2])-(+b.dataset.id.split('|')[2]))[0]}
const mtSay=st=>typeof st.say==='function'?st.say():st.say;
function mtCoach(){if(HEADLESS)return;let el=document.getElementById('mtutCoach');
  if(!MTUT.on||!mtW()){if(el)el.remove();document.querySelectorAll('.tutspot').forEach(x=>x.classList.remove('tutspot'));return}
  if(!el){el=document.createElement('div');el.id='mtutCoach';el.className='tutcoach mtut';document.body.appendChild(el);
    el.addEventListener('click',e=>{const b=e.target.closest('[data-mt]');if(!b)return;const a=b.dataset.mt;if(a==='next')mtNext();else if(a==='finish')mtDone();else if(a==='leave')mtutLeave();else if(a==='hide'){MTUT.hidden=1;el.dataset.h='';mtCoach()}else if(a==='unhide'){MTUT.hidden=0;el.dataset.h='';mtCoach()}})}
  if(MTUT.hidden){const h='<button class="btn tksm tutpill" type="button" data-mt="unhide">🎓 Show the coach</button>';if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h;el.classList.add('mini')}return}
  el.classList.remove('mini');
  const st=MTUT_STEPS[MTUT.step];if(!st)return;
  // light the part in question (re-applied as the window redraws)
  const tgt=mtEl(st.spot);document.querySelectorAll('.tutspot').forEach(x=>{if(x!==tgt)x.classList.remove('tutspot')});if(tgt&&!tgt.classList.contains('tutspot')){tgt.classList.add('tutspot');if(MTUT.spotted!==MTUT.step){MTUT.spotted=MTUT.step;try{tgt.scrollIntoView({block:'nearest',behavior:'smooth'})}catch(e){}}}
  const h=`<img src="${typeof flavFaceURL==='function'?flavFaceURL(st.last?'cheer':'calm'):''}" alt=""><div><div class="tutstep">Learn to play · Manager mode · ${MTUT.step+1} of ${MTUT_STEPS.length}</div><div>${mtSay(st)}</div>
    <div class="acts" style="margin-top:6px">${st.finish?`<button class="btn primary tksm" type="button" data-mt="finish">✔ Finish this lesson</button>`:st.next?`<button class="btn primary tksm" type="button" data-mt="next">Next ▶</button>`:''}${st.last?'':'<button class="btn tksm" type="button" data-mt="hide">Hide the coach</button><button class="btn tksm" type="button" data-mt="leave">✖ Leave the lesson</button>'}</div></div>`;
  if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h}}
/* v0.46: the Manager window counts as shown only while the modal is up (its body can linger hidden in the DOM) */
function mtMgrShown(){const e=document.getElementById('mgrBody');const m=document.getElementById('modal');return !!e&&!!m&&!m.hidden}
function mtNext(){MTUT.step++;if(MTUT.step>=MTUT_STEPS.length){mtDone();return}MTUT.entered=-1;mtCoach()}
function mtTick(){if(!MTUT.on)return;if(!mtW()){MTUT.on=false;mtCoach();return}{const w=mtW();if(w.pend&&w.pend.some(x=>x.t==='levy'))w.pend=w.pend.filter(x=>x.t!=='levy')}const st=MTUT_STEPS[MTUT.step];if(!st)return;
  if(st.enter&&MTUT.entered!==MTUT.step){MTUT.entered=MTUT.step;try{st.enter()}catch(e){console.error(e)}}
  if(st.tab&&MGR.tab===st.tab&&mtMgrShown())mtNext();
  else if(st.until&&st.until()){if(st.finish)mtDone();else mtNext()}
  else mtCoach()}
setInterval(()=>{try{mtTick()}catch(e){}},350);
/* the guard rails: while the lesson runs, only the step's own target (and whatever windows it opens) take clicks */
function mtAllowed(st,t){if(!st)return true;const el=mtEl(st.spot);if(el&&!st.spotOnly&&el.contains(t))return true;
  for(const sel of st.allow||[])if(t.closest(sel))return true;return false}
document.addEventListener('click',e=>{if(!MTUT.on||!mtW())return;const t=e.target;if(!t||!t.closest)return;
  if(t.closest('#mtutCoach')||t.closest('#mClose'))return;
  const inMgr=!!t.closest('#mgrBody');
  if(!inMgr&&t.closest('#modal'))return; // dialogs the step opened — confirmations, the seat map, results, the thumb — are part of the lesson
  if(!inMgr&&t.closest('#btnMenu')){e.preventDefault();e.stopPropagation();mtutLeave();return}
  if(!inMgr&&t.closest('.speedseg,.collhd,#btnEvInfo,#btnStands,#btnXray,#btnGraph'))return; // harmless arena controls
  if(!t.closest('button,a,select,input,textarea,summary,label,[data-mg],[data-ct],[data-act],[role="button"],canvas'))return; // clicks on nothing in particular do nothing anyway
  const st=MTUT_STEPS[MTUT.step];if(mtAllowed(st,t))return;
  e.preventDefault();e.stopPropagation();if(typeof mToast==='function')mToast(`🎓 One thing at a time — ${st&&st.next?'press <b>Next ▶</b> on the coach':'follow the coach'} (or ✖ Leave the lesson).`)},true);
async function startManagerTutorial(){
  if(typeof menuHide==='function')menuHide();
  if(typeof liveEventRunning==='function'&&liveEventRunning()&&S){S.over=true}
  const prev=MGR.world;MTUT.prev=prev?prev.id:null;
  newWorld({type:'custom',tutorial:true,mgr:{name:'Tiro',ludus:'Ludus Discipuli',city:'Roma',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},portrait:{skin:SKINS[1],hair:HAIRS[0],helm:'laurel',beard:false,bg:BGS[0]}}});
  const w=MGR.world;const m=me();
  // the lesson's week is fought at home, so the road never gets in the way
  {const home=travelHome(m);if(w.night&&w.night.loc!==home){m.city=LOCATIONS[w.night.loc].n}if(w.night)w.night.travel=null}
  // a house worth learning in: a full treasury, a perk point, hours to spend — and two fighters, one of them hurt
  m.coin=900;m.perkPts=1;w.hours=Math.max(w.hours,12);w.rules={...w.rules,death:0}; /* in the lesson the editor always shows clemency — the one verdict is staged */
  const ros=rosterOf(m);let A=ros[0];if(!A){A=genGlad({ovr:56});w.glads.push(A)}
  Object.assign(A,{ovr:57,pot:70,morale:62,inj:{until:w.week+3,label:'a deep thigh cut',pen:3,req:'medicus'},contract:{mgr:m.id,wage:askWage(A),weeks:8,since:w.week},scout:2});
  const B=genGlad({ovr:76,age:26});Object.assign(B,{pot:84,morale:58,contract:{mgr:m.id,wage:askWage(B),weeks:8,since:w.week},scout:2,debut:{s:w.season,wk:w.week},interest:{}});w.glads.push(B);
  MTUT.A=A.id;MTUT.B=B.id;MGR.lsel=A.id;MGR.run='promote';
  MTUT.on=true;MTUT.step=0;MTUT.w0=w.week;MTUT.hidden=0;MTUT.spotted=-1;MTUT.entered=-1;MGR.tab='ludus';
  openManager();setTimeout(mtCoach,500)}
function mtCleanup(){MTUT.on=false;const el=document.getElementById('mtutCoach');if(el)el.remove();document.querySelectorAll('.tutspot').forEach(x=>x.classList.remove('tutspot'));
  if(MGR.world&&MGR.world.tutorial){MGR.world=null;if(typeof ACTIVE!=='undefined'&&ACTIVE.world&&ACTIVE.world.tutorial){ACTIVE.world=null;ACTIVE.cid=null}}}
async function mtutLeave(){const ok=await new Promise(r=>{if(typeof modalBusy==='function'&&modalBusy()&&!$('#mgrBody')&&!(S&&S.mgrCtx)){r(true);return}
    const cont=()=>modal('Leave the lesson?','<p>The sandbox league is discarded and you return to the main menu. You can take the lesson again from the menu or Rules &amp; strategy → 🎓 Lessons.</p>',[{label:'Leave the lesson',value:1,primary:1},{label:'Stay',value:0}],{close:0}).then(r);
    if($('#mgrBody')&&CUR_MODAL){MTUT.reopen=1;CUR_MODAL.done('mtleave');setTimeout(cont,120)}else cont()});
  if(!ok){MTUT.reopen=0;if(!$('#mgrBody')&&!(S&&S.mgrCtx&&!S.over)){openManager();setTimeout(mtCoach,400)}return}
  MTUT.reopen=0;if(S&&S.mgrCtx&&!S.over)S.over=true;mtCleanup();if(!$('#modal').hidden&&typeof modalDismiss==='function')modalDismiss();const go=()=>{if(typeof menuShow==='function')menuShow()};if(typeof fadeTo==='function')fadeTo(go);else go()}
async function mtDone(){if(!MTUT.on&&!mtW())return;try{localStorage.setItem('flavius_mtutDone','1')}catch(e){}
  if(CUR_MODAL&&$('#mgrBody'))CUR_MODAL.done('mtdone');mtCleanup();await new Promise(r=>setTimeout(r,150));
  const v=await modal('🎓 Tutorial completed',`<div class="rulepop"><img src="${typeof flavFaceURL==='function'?flavFaceURL('cheer'):''}" alt="" style="width:96px;border-radius:8px"><div><p><b>You have run a week of a ludus.</b> Recruit, keep, heal, build, enter, watch, bet, settle the verdicts, court your rivals — and climb the table toward the Superbus.</p><p class="rc-sub">Nothing from the lesson was kept.</p></div></div>`,
    [{label:'🏛 Main menu',value:'menu'},{label:'💼 Start a new Manager career',value:'new',primary:1},{label:'↺ Restart the tutorial',value:'again'}],{close:'menu'});
  if(v==='again'){startManagerTutorial();return}
  if(v==='new'){MGR.world=null;if(typeof openManager==='function'){await new Promise(r=>setTimeout(r,80));openManager();setTimeout(()=>{const b=document.querySelector('[data-mg="create"]');if(b)b.click()},500)}return}
  if(typeof menuShow==='function')menuShow()}

/* the lessons, in one place: the main menu's split button (hidden once both are done, unless Settings says
   otherwise) and Rules & strategy → 🎓 Lessons */
const lessonDone=k=>{try{return localStorage.getItem(k==='manager'?'flavius_mtutDone':'flavius_tutDone')==='1'}catch(e){return false}};
function lessonsMenuVis(){const el=document.getElementById('mmLearn');if(!el)return;const pref=typeof SETTINGS!=='undefined'?SETTINGS.lessonsMenu:undefined;
  /* v0.46: each lesson's button goes once that lesson is done; a lone button is as wide as the rest of the menu */
  const bc=el.querySelector('[data-mm="learn"]'),bm=el.querySelector('[data-mm="learnmgr"]');
  const showC=pref===true||(pref!==false&&!lessonDone('classic')),showM=pref===true||(pref!==false&&!lessonDone('manager'));
  if(bc)bc.hidden=!showC;if(bm)bm.hidden=!showM;el.hidden=!showC&&!showM;el.classList.toggle('single',showC!==showM)}
function lessonsHTML(){const card=(k,ic,t,d)=>`<div class="mstone"><div class="mshd"><span class="msic">${ic}</span><div><div class="msv">${lessonDone(k)?'✔ completed':'not taken yet'}</div><b>${t}</b></div></div><p style="margin:4px 0 8px">${d}</p><button class="btn primary" type="button" data-lesson="${k}">${lessonDone(k)?'Take it again':'Start the lesson'}</button></div>`;
  return `<div class="lessoncards">${card('classic','🎓','Learn to Play (Classic)','A tour of the arena screen, then a guided bout against one rival and two beasts: the choice, moving, breaking a Blessings pot, your hand, ending the turn — and the fight to the finish.')}${card('manager','💼','Learn to Play Manager Mode','One full guided week of a ludus in a sandbox league: a fighter’s card and keeping them happy, courting a recruit, the infirmary, facilities and schooling, Match Week (watch a bout live, bet, enter the main event), a verdict, a rival house, the Imperium, the season — and the Acta Diurna.')}</div>
   <label class="setrow" style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" data-lessonsmenu="1" ${(SETTINGS.lessonsMenu===true)||(SETTINGS.lessonsMenu!==false&&!(lessonDone('classic')&&lessonDone('manager')))?'checked':''}><span><b>🎓 Lesson buttons on the main menu</b> <span class="rc-sub">they hide once both are done; tick to keep them</span></span></label>`}
