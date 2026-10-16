/* =====================================================================
   36-MTUTOR · LEARN TO PLAY: MANAGER MODE (v0.44)
   =====================================================================
   A guided first week in a SANDBOX league (never saved, never your wallet): Flavius walks the new
   lanista through the house — the header, the tabs, the roster, recruiting, practice, Match Week
   (entering a fighter, simulating the card, reading the results), the league — and ending the week.
   Each step lights the part in question and waits for the click it asks for. Leave any time; at the end,
   a window offers the main menu, a new career, or the lesson again.
   ===================================================================== */
/* MTUT — the lesson's state: on, current step, the week it began (w0), the two fighters' ids (A hurt, B healthy), hidden coach, last spotted/entered step. */
const MTUT={on:false,step:0,w0:0};
/* mtW — the sandbox world while the lesson's world is open, else null. */
const mtW=()=>MGR.world&&MGR.world.tutorial?MGR.world:null;
/* mtG — the lesson fighter 'A' or 'B' (by MTUT id), or null. */
const mtG=who=>{const id=MTUT[who];return id&&typeof gById==='function'?gById(id):null};
/* mtNm — that fighter's name, HTML-escaped ("your fighter" when gone). */
const mtNm=who=>{const g=mtG(who);return g?esc(g.name):_T('your fighter')};
/* mtBout — Match Week bout boutIdx (0 undercard, 1 feature, 2 main event) of the sandbox week. */
const mtBout=boutIdx=>{const w=mtW();return w&&w.night&&w.night.bouts[boutIdx]};
/* mtIn — is lesson fighter who ('A'/'B') entered in bout boutIdx? */
const mtIn=(boutIdx,who)=>{const b=mtBout(boutIdx);return !!(b&&b.ents.includes(MTUT[who]))};
/* mtEl — resolves a step's spot: a function returning an element, or a CSS selector. */
const mtEl=spot=>typeof spot==='function'?spot():spot?document.querySelector(spot):null;
/* mtUp — a spot function: the element matching sel, lifted to its closest up ancestor (else its parent). */
const mtUp=(sel,up)=>()=>{const e=document.querySelector(sel);return e?(up?e.closest(up)||e.parentElement:e.parentElement):null};
/* mtRivalId — id of the most famous living rival house (the one the lesson visits). */
const mtRivalId=()=>{const w=mtW();if(!w)return '';const r=w.mgrs.filter(m=>!m.isPlayer&&!m.dead).sort((a,b)=>(b.fame||0)-(a.fame||0))[0];return r?r.id:''};
/* mtYC — fighter B's Training Yard card (v0.92 213-v92yard), or the part of it matching sub. */
const mtYC=sub=>{const c=document.querySelector(`#mgrPane [data-y92c="${MTUT.B}"]`);return c&&sub?c.querySelector(sub):c};
/* mtY — fighter B's yard plan this week ({L locked, Q planned, pre drill}); empty when the yard is not loaded. */
const mtY=()=>{try{return y92Peek(thPlan(mtW()),MTUT.B)}catch(e){return {L:{},Q:{},pre:null}}};
/* v0.45 THE DEEP LESSON — one full week, every step checked off by DOING it (the coach moves on by itself),
   with guard rails: only what the step asks for can be clicked (dialogs it opens are fine), so a lesson can
   never turn into a real career by accident. */
/* MTUT_STEPS — the steps in order. Fields: spot (what to light), say (text or function), next (a Next button), tab (done when that tab is open), until (done when true), enter (runs once on arrival), allow (extra clickable selectors), spotOnly (the spot is only lit, not clickable), arena (step happens on the sand), finish/last (the final step). */
const MTUT_STEPS=[
  {k:'welcome',spot:'.mhead',say:_T`Welcome, <b>lanista</b>. This is a sandbox league made for this lesson — nothing is saved. Up top: your <b>treasury</b> (we lent you plenty), <b>fame</b>, ludus grade and record.`,next:1},
  {k:'tabs',spot:'.mtabs',say:_T`The <b>rail</b> on the left runs your ludus — your house, the arena, the wider world, and you. Work it top to bottom each week; the coach will walk you through it.`,next:1},
  // the roster and a fighter's card
  {k:'roster',spot:'[data-mg="tab"][data-id="roster"]',say:_T`Open <b>🛡 Roster</b> — the fighters under contract to your house.`,tab:'roster'},
  {k:'lsel',spot:()=>document.querySelector(`#mgrPane [data-mg="lsel"][data-id="${MTUT.B}"]`),say:()=>_T`You have two fighters. Click <b>${mtNm('B')}</b> in the list to open <b>their card</b> beside it.`,until:()=>MGR.lsel===MTUT.B},
  {k:'meal',spot:()=>document.querySelector(`#mgrPane [data-mg="meal"][data-id="${MTUT.B}"]`),say:()=>_T`The card: rating, morale, loyalty, contract. Under <b>Keeping them</b> you spend hours and coin to keep a fighter happy and loyal. Click <b>🍷 Share a meal</b> with ${mtNm('B')}.`,until:()=>{const g=mtG('B');return g&&g.mealWk===mtW().week}},
  {k:'morale',spot:'#mgrPane',spotOnly:1,say:()=>_T`Morale and loyalty rise. <b>Morale</b> walks onto the sand with them (80+ adds AP and CF); <b>loyalty</b> is what a rival must beat to poach them.`,next:1},
  // recruiting: courting a free agent
  {k:'recruit',spot:'[data-mg="tab"][data-id="recruit"]',say:_T`Now <b>🤝 Recruiting</b> — the free agents of the empire.`,tab:'recruit'},
  {k:'fa',spot:'#mgrPane table.tally',say:_T`Click any <b>free agent</b> in the list to open their recruiting card.`,enter:()=>{MTUT.sel0=MGR.sel},until:()=>MGR.sel&&MGR.sel!==MTUT.sel0,allow:['[data-mg="sort"]','[data-mg="filter"]']},
  {k:'scout',spot:()=>document.querySelector('#mgrPane [data-rec98a]:not([disabled])')||document.querySelector('#mgrPane [data-mg="scout"]'),enter:()=>{MTUT.court=MGR.sel;MGR.recStep=1;if(typeof MGR_REDRAW==='function'&&document.getElementById('mgrBody'))MGR_REDRAW()},say:_T`Courting starts with knowing them. Their ratings are letter grades — "?" until your <b>Recruiter</b> looks. Spend some of the recruiter's hours: press the first scouting action, <b>👁 Watch</b> (or any other). Grade all five and their personality shows.`,until:()=>{const g=gById(MGR.sel);return !!g&&!MGR.busy&&(((g.scout||0)>=1)||!!(g.sc98&&Object.values(g.sc98.p||{}).some(x=>x>0)))}},
  {k:'pitch',spot:()=>document.querySelector('#mgrPane .pg98')||document.querySelector('#mgrPane [data-mg="pitch"]'),enter:()=>{MGR.recStep=2;if(typeof MGR_REDRAW==='function'&&document.getElementById('mgrBody'))MGR_REDRAW()},allow:['[data-recstep]'],say:_T`Now <b>pitch</b> them. Each pitch leans on one of your <b>house grades</b> (your lanista traits — every recruit sees them); one that answers their wish counts double. One pitch per recruit a week.`,until:()=>{const g=gById(MGR.sel);const r=g&&g.recW&&g.recW[me().id];return !!(r&&r.wk===mtW().week&&r.a&&r.a.pitch)}},
  {k:'interest',spot:'#mgrPane',spotOnly:1,say:_T`Their <b>interest</b> climbs as you court them — feasts, pitches, a famous house, a fair wage. When it is high enough, <b>Offer a contract</b>. Not today: we have a card to fight.`,next:1},
  // the infirmary
  {k:'infirm',spot:'[data-mg="tab"][data-id="infirm"]',say:()=>_T`${mtNm('A')} came home hurt last week. Open the <b>⚕ Infirmary</b>.`,tab:'infirm'},
  {k:'medic',spot:()=>document.querySelector(`#mgrPane [data-mg="medic"][data-id="${MTUT.A}"]`),say:()=>_T`A hurt fighter cannot be entered. Call the <b>Medicus</b> for ${mtNm('A')} — it lifts their spirits, and in this lesson it clears the wound at once (in your own career a cure closes the wound when the week ends).`,until:()=>{const g=mtG('A');return g&&!g.inj}},
  // my ludus: spending to improve
  {k:'ludus',spot:'[data-mg="tab"][data-id="ludus"]',say:_T`Cleared for play. Now <b>🏛 Your ludus</b> — where coin and points become a better house.`,tab:'ludus'},
  {k:'fac',spot:'[data-mg="run"][data-id="fac"]',say:_T`Open <b>🏗 Facilities</b>: permanent upgrades — one project a week.`,until:()=>MGR.run==='fac'},
  {k:'stables',spot:'[data-mg="build"][data-id="stables"]',say:_T`Build the <b>🐎 Stables</b> — your own road crew makes every away trip cheaper. (The yard, the infirmary wing, the barracks, the armory and the practice stands each help in their own way; together they set your <b>Ludus grade</b>, which recruits look at.)`,until:()=>facLvl(me(),'stables')>=1},
  {k:'school',spot:'[data-mg="run"][data-id="school"]',say:_T`Coin builds the house; <b>perk points</b> build <i>you</i>. Open <b>🎓 Schooling</b> (in your own career it lives on the Lanista tab).`,until:()=>MGR.run==='school'},
  {k:'perk',spot:mtUp('#mgrPane [data-mg="perk"]','.card2'),say:_T`Spend your perk point: a <b>perk</b> from one of the three trees (each says what it does), or <b>hone a trait</b> recruits grade you on. You earn more each week: wins, kept pledges, training.`,until:()=>(me().perkPts||0)<1},
  /* v0.93: the Training Yard (213-v92yard) — a card per fighter, sessions under the weekly cap, Lock in, the Doctore's drill, Trials */
  {k:'yard',spot:'[data-mg="tab"][data-id="practice"]',say:_T`Your fighters grow in the <b>🏋 Training Yard</b>. Open it.`,tab:'practice'},
  {k:'ycard',spot:()=>mtYC(''),spotOnly:1,say:_T`One <b>card per fighter</b>. Each bar is a rating — 🏃 Speed, 💪 Strength, 📜 Tactics, 🎭 Crowd — and shows what this week's work adds. Fatigue sits under them.`,next:1},
  {k:'yplus',spot:()=>mtYC('.y92bars'),say:()=>_T`Press <b>+</b> on a rating to plan a <b>session</b> for ${mtNm('B')}. Each takes one of the house's training hours; a fighter takes at most <b>${Y92.CAP} a week</b> (the counter on the card).`,until:()=>{const y=mtY();return y92Sum(y.Q)+y92Sum(y.L)>=1},allow:['[data-y92s]']},
  {k:'ylock',spot:()=>document.querySelector(`#mgrPane [data-y92lock="${MTUT.B}"]`),say:_T`A plan is only a plan: unlocked sessions never train. Press <b>🔒 Lock in</b>.`,until:()=>y92Sum(mtY().L)>=1},
  {k:'ydrill',spot:()=>mtYC('.y92pre'),say:_T`A locked session opens the <b>Doctore's drill</b>: two ratings in one drill, with his bonus — 2 hours, one a week, outside the cap. Pick one.`,until:()=>!!mtY().pre,allow:['[data-y92pre]']},
  {k:'ydlock',spot:()=>document.querySelector(`#mgrPane [data-y92lock="${MTUT.B}"]`),say:_T`Lock in again — the drill counts only once it is locked.`,until:()=>!!(mtY().pre&&mtY().pre.lock)},
  {k:'ydoc',spot:'#mgrPane .y92doc',spotOnly:1,say:_T`<b>Your Doctore.</b> His level (your yard + the hours he spends with the squad) unlocks more drills. <b>Intensity</b> drives every session: more gain, more fatigue. <b>↻ Same as last week</b> re-plans the squad; <b>🔒 Lock all</b> locks every card.`,next:1},
  {k:'ytrials',spot:'#mgrPane .y92trials',spotOnly:1,say:_T`<b>⚔ Trials of the Yard</b>: a spar with a housemate, an exhibition against a rival house, or the beast pen — one a week per fighter, each with its cost and fatigue. Not today: we have a card to fight.`,next:1},
  // match night
  {k:'night',spot:'[data-mg="tab"][data-id="night"]',say:_T`The heart of it: <b>⚔️ Match Week</b>.`,tab:'night'},
  {k:'city',spot:'[data-mg="city"]',spotOnly:1,say:_T`Each week's games are in one city — and in that week you can walk its <b>city square</b>: the temple, the market stalls, the auction — and <b>Walk the Sand</b> at the arena gate. Explore it in your own career. Not in this lesson.`,next:1},
  {k:'bouts',spot:'#mgrPane .bout',spotOnly:1,say:_T`Three bouts: <b>undercard</b>, <b>feature</b>, <b>main event</b>. Every fighter you enter earns an appearance fee; the winner's house takes the <b>purse</b>. They are fought in order.`,next:1},
  {k:'enter0',spot:mtUp('#ent0','.bslip'),say:()=>_T`Pick <b>${mtNm('A')}</b> in the Undercard's list and press <b>Enter your fighter</b>.`,until:()=>mtIn(0,'A')},
  {k:'watch',spot:mtUp('#mgrPane [data-mg="watch"][data-id="0"]','.acts'),say:()=>_T`Now watch ${mtNm('A')} fight — <b>👁 Watch it live</b> from your box, or <b>🎟 Spectate</b> from a seat in the stands.`,until:()=>!!(S&&S.mgrCtx&&!S.over&&!mtMgrShown()),allow:['[data-mg="watch"][data-id="0"]','[data-mg="spect"][data-id="0"]']},
  {k:'sim',arena:1,spot:'#btnSimEnd',say:_T`The bout is live on the sand (close the briefing first — it tells you the event's rules). You could watch it to the end; for the lesson, press <b>⏭ Sim to end</b> to resolve it now.`,until:()=>{const b=mtBout(0);return !!(b&&b.done)||!!(S&&S.over)}},
  {k:'ret',arena:1,spot:()=>[...document.querySelectorAll('#mBtns button')].find(b=>/Return to Match Week/.test(b.dataset.en84||b.textContent))||null,say:_T`The result is in. Press <b>⏎ Return to Match Week</b>.`,until:()=>!!mtMgrShown()&&MGR.tab==='night'},
  {k:'verdict',spot:'#pendbox',say:()=>_T`A <b>verdict awaits</b> for ${mtNm('A')}: the Fate table sent them to the <b>Thumb of Flavius</b>. Face it — roll the d6 yourself.`,enter:()=>mtVerdict(),until:()=>!(mtW().pend||[]).length&&!MGR.busy,allow:['[data-mg="pthumb"]','[data-mg="pblood"]','[data-mg="prudis"]']},
  {k:'stake',spot:()=>document.querySelector('#mgrPane [data-stk="1|5"]'),say:()=>_T`The <b>Feature bout</b>. You do have a fighter who could go in — ${mtNm('B')} — but we are saving them for the <b>Main event</b>. So <b>bet</b> on this one instead: raise your stake with <b>+5</b>.`,enter:()=>{const i=document.getElementById('mgStake1');MTUT.stk0=i?+i.value:10},until:()=>{const i=document.getElementById('mgStake1');return !!i&&+i.value>(MTUT.stk0||10)}},
  {k:'bet',spot:()=>mtBetPick(),say:_T`Now press <b>Bet</b> beside the lit fighter — the bookmaker's favourite (the lowest odds).`,until:()=>{const b=mtBout(1);return !!(b&&(b.bets||[]).length)},allow:['[data-mg="bet"]','#mgStake1','[data-stk]']},
  {k:'sim1',spot:()=>document.querySelector('#mgrPane [data-mg="sim"][data-id="1"]'),say:_T`Slip in hand. The card runs in order — press <b>⚡ Simulate</b> on the Feature bout to fight it now. (You could also watch it or fight it yourself.)`,until:()=>{const b=mtBout(1);return !!(b&&b.done)&&!MGR.busy}},
  {k:'enter2',spot:mtUp('#ent2','.bslip'),say:()=>_T`The <b>Main event</b> — the big purse. Pick <b>${mtNm('B')}</b> and press <b>Enter your fighter</b>.`,until:()=>mtIn(2,'B')},
  {k:'simall',spot:'[data-mg="simall"]',say:()=>_T`Now <b>⚡ Simulate Match Week</b> — the main event is fought in a moment, with ${mtNm('B')} in it. (In your own career you can also <b>watch it live</b> or <b>fight it yourself</b> — take your fighter's reins on the sand. For the lesson, we simulate.)`,until:()=>{const w=mtW();return w&&w.night.bouts.every(b=>b.done)&&!MGR.busy}},
  {k:'results',spot:'#nightRes',spotOnly:1,say:_T`<b>The results.</b> Each fighter's place, the <b>Crowd Favor</b> they earned and the <b>Fate</b> it bought (under ${cfAmt87(17)}: condemned; 17-19: the Thumb; 20-49: back to the ludus; 50+: the rudis), your purses and fees, the crowd — and your betting slip.`,next:1},
  {k:'verdict2',spot:'#pendbox',say:_T`Another verdict from the main event — settle it the same way before the week can end.`,until:()=>!(mtW().pend||[]).length&&!MGR.busy,allow:['[data-mg="pthumb"]','[data-mg="pblood"]','[data-mg="prudis"]']},
  // the league
  {k:'league',spot:'[data-mg="tab"][data-id="league"]',say:_T`<b>📊 League</b> — the table. A podium is 3, 2 or 1 points; all twelve houses are seeded into the Superbus playoffs at season's end (the top four rest a round).`,tab:'league'},
  {k:'rival',spot:()=>document.querySelector(`#mgrPane [data-lg90box="${mtRivalId()}"]`)||document.querySelector(`#mgrPane tr[data-mg="team"][data-id="${mtRivalId()}"]`),say:()=>{const m=mgrById(mtRivalId());const open=!!document.querySelector(`#mgrPane [data-lg90box="${mtRivalId()}"]`);
    return open?_T`Their scouting card: fighters, form, this week's bouts. Press <b>🏛 Team Details</b> to visit the house.`:_T`Every house can be visited. Click <b>${esc(m?m.ludus:_T('a rival house'))}</b>${m?_T` — ${esc(m.name)}'s stable, the most famous in the league`:''}.`},until:()=>MGR.tab==='team'&&MGR.teamId===mtRivalId()},
  {k:'envoy',spot:()=>{const e=document.querySelector(`#mgrPane [data-mg="envoy"][data-id="${mtRivalId()}|gift"]`);return e?e.closest('.commsacts')||e.parentElement:null},say:_T`Their lanista, roster and ledger — and <b>correspondence</b>. Send an envoy: <b>🎁 gifts</b> warm a rival (trades and pacts need a warm opinion).`,until:()=>{const m=mgrById(mtRivalId());return m&&m.envoyWk===mtW().week},allow:['[data-mg="envoy"]']},
  {k:'imp',spot:'[data-mg="tab"][data-id="imp"]',say:_T`<b>🌍 Imperium</b> — the map of the empire.`,tab:'imp'},
  {k:'impinfo',spot:'#mgrPane',spotOnly:1,say:_T`Fans on the roads, weather, wars and plagues, each city's crowd and mood — all of it moves attendance, purses and risk. A war can even call your fighters to the levy.`,next:1},
  {k:'sched',spot:()=>document.querySelector('#mgrPane .wd100cal')||document.querySelector('.wd101sea[data-id="sched"]')||document.querySelector('.rail [data-mg="tab"][data-id="league"]')||document.querySelector('[data-mg="tab"][data-id="sched"]'),say:()=>MGR.tab==='league'?_T`Press <b>📅 Season</b> — the schedule.`:_T`<b>📅 Season</b> is a button on the <b>League</b> banner — open the League first.`,tab:'sched',allow:['.rail [data-mg="tab"][data-id="league"]','.wd101sea']},
  {k:'schedinfo',spot:'#mgrPane',spotOnly:1,say:_T`Twelve weeks, a city each week; festivals and invitationals on the side; the Superbus in Roma at the end. Plan your roads and your stars around it.`,next:1},
  {k:'endask',spot:'[data-mg="endask"]',say:_T`Last: <b>⏭ End the week</b>. Wages are paid, the yard trains, rivals scheme — and the empire moves on.`,until:()=>MGR.confirmEnd||(mtW()&&mtW().week>MTUT.w0)},
  {k:'endweek',spot:'[data-mg="endweek"]',say:_T`Confirm it.`,until:()=>mtW()&&mtW().week>MTUT.w0},
  {k:'acta',spot:'#mgrPane [data-mg="tab"][data-id="ludus"]',say:_T`The <b>Acta Diurna</b> — the week's gazette: results, deaths, signings, the league's top fives. When you have read it, <b>set the paper down</b> to finish this lesson.`,until:()=>mtW()&&mtW().week>MTUT.w0&&MGR.tab==='ludus',finish:1,last:1}];
/* the lesson's one staged moment: the first bout ends at the Thumb, so there is always a verdict to settle
   mtVerdict — rewrites fighter A's undercard result to 18 CF (the Thumb of Flavius) and queues the verdict; clears war levies. */
function mtVerdict(){const w=mtW();if(!w)return;w.pend=(w.pend||[]).filter(x=>x.t!=='levy'); /* no wars in the lesson */const g=mtG('A');if(!g)return;if((w.pend||[]).some(x=>x.gid===g.id)||!g.alive)return;
  const b=w.night.bouts[0];const row=b&&b.res&&b.res.rows.find(x=>x.gid===g.id);if(row){row.f=18;row.vd='p-thumb';row.fname=_T('Thumb of Flavius')}
  (w.pend=w.pend||[]).push({t:'thumb',gid:g.id,bi:0,f:18});if(typeof MGR_REDRAW==='function'&&document.getElementById('mgrBody'))try{MGR_REDRAW()}catch(e){}}
/* the fighter to back in the feature: the lowest odds on the card
   mtBetPick — the feature bout's Bet button with the lowest odds (data-id "1|gid|odds"), or null. */
function mtBetPick(){const bs=[...document.querySelectorAll('#mgrPane [data-mg="bet"][data-id^="1|"]')];if(!bs.length)return null;return bs.sort((a,b)=>(+a.dataset.id.split('|')[2])-(+b.dataset.id.split('|')[2]))[0]}
/* mtSay — a step's text (calls say when it is a function). */
const mtSay=step=>typeof step.say==='function'?step.say():step.say;
/* mtCoach — draws the coach box (Flavius, step counter, text, Next/Finish/Hide/Leave) and lights the step's spot; removes both when the lesson is off. Redraws only when the HTML changed. */
/* MTUTOR99 — the Manager lesson's teacher: Lady Aurelia of Verona, patroness of games (not Flavius). */
function MTUTOR99(){try{return CITY_SPONSORS[2]||null}catch(e){return null}}
function mtCoach(){if(HEADLESS)return;let el=document.getElementById('mtutCoach');
  if(!MTUT.on||!mtW()){if(el)el.remove();document.querySelectorAll('.tutspot').forEach(x=>x.classList.remove('tutspot'));return}
  if(!el){el=document.createElement('div');el.id='mtutCoach';el.className='tutcoach mtut';document.body.appendChild(el);
    el.addEventListener('click',e=>{const b=e.target.closest('[data-mt]');if(!b)return;const a=b.dataset.mt;if(a==='next')mtNext();else if(a==='finish')mtDone();else if(a==='leave')mtutLeave();else if(a==='hide'){MTUT.hidden=1;el.dataset.h='';mtCoach()}else if(a==='unhide'){MTUT.hidden=0;el.dataset.h='';mtCoach()}})}
  if(MTUT.hidden){const h=`<button class="btn tksm tutpill" type="button" data-mt="unhide">${_T`🎓 Show the coach`}</button>`;if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h;el.classList.add('mini')}return}
  el.classList.remove('mini');
  const st=MTUT_STEPS[MTUT.step];if(!st)return;
  // light the part in question (re-applied as the window redraws)
  const tgt=mtEl(st.spot);document.querySelectorAll('.tutspot').forEach(x=>{if(x!==tgt)x.classList.remove('tutspot')});if(tgt&&!tgt.classList.contains('tutspot')){tgt.classList.add('tutspot');if(MTUT.spotted!==MTUT.step){MTUT.spotted=MTUT.step;try{tgt.scrollIntoView({block:'nearest',behavior:'smooth'})}catch(e){}}}
  const h=`<img src="${typeof flavFaceURL==='function'?flavFaceURL(st.last?'cheer':'calm',MTUTOR99()):''}" alt=""><div><div class="tutstep">${_T`Learn to play · Manager mode · ${MTUT.step+1} of ${MTUT_STEPS.length}`}</div><div>${mtSay(st)}</div>
    <div class="acts" style="margin-top:6px">${st.finish?`<button class="btn primary tksm" type="button" data-mt="finish">${_T`✔ Finish this lesson`}</button>`:st.next?`<button class="btn primary tksm" type="button" data-mt="next">${_T`Next ▶`}</button>`:''}${st.last?'':`<button class="btn tksm" type="button" data-mt="hide">${_T`Hide the coach`}</button><button class="btn tksm" type="button" data-mt="leave">${_T`✖ Leave the lesson`}</button>`}</div></div>`;
  if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h}}
/* v0.46: the Manager window counts as shown only while the modal is up (its body can linger hidden in the DOM) */
function mtMgrShown(){const e=document.getElementById('mgrBody');const m=document.getElementById('modal');return !!e&&!!m&&!m.hidden}
/* mtNext — moves to the next step (finishes after the last). */
function mtNext(){MTUT.step++;if(MTUT.step>=MTUT_STEPS.length){mtDone();return}MTUT.entered=-1;mtCoach()}
/* mtTick — the lesson's heartbeat: drops war levies, runs a step's enter once, advances when its tab is open or its until() holds, else redraws the coach. */
function mtTick(){if(!MTUT.on)return;if(!mtW()){MTUT.on=false;mtCoach();return}{const w=mtW();if(w.pend&&w.pend.some(x=>x.t==='levy'))w.pend=w.pend.filter(x=>x.t!=='levy')}const st=MTUT_STEPS[MTUT.step];if(!st)return;
  if(st.enter&&MTUT.entered!==MTUT.step){MTUT.entered=MTUT.step;try{st.enter()}catch(e){console.error(e)}}
  if(st.tab&&MGR.tab===st.tab&&mtMgrShown())mtNext();
  else if(st.until&&st.until()){if(st.finish)mtDone();else mtNext()}
  else mtCoach()}
/* TWEAK: 350 ms between lesson checks. */
setInterval(()=>{try{mtTick()}catch(e){}},350);
/* the guard rails: while the lesson runs, only the step's own target (and whatever windows it opens) take clicks */
/* mtAllowed — may this click target go through? Yes inside the step's spot (unless spotOnly) or anything matching its allow list. */
function mtAllowed(step,target){if(!step)return true;const el=mtEl(step.spot);if(el&&!step.spotOnly&&el.contains(target))return true;
  for(const sel of step.allow||[])if(target.closest(sel))return true;return false}
/* capture-phase click guard: windows the step opened, the coach and harmless arena controls pass; the main-menu button asks to leave; any other control not allowed by the step is blocked with a toast. */
document.addEventListener('click',e=>{if(!MTUT.on||!mtW())return;const t=e.target;if(!t||!t.closest)return;
  if(t.closest('#mtutCoach')||t.closest('#mClose'))return;
  const inMgr=!!t.closest('#mgrBody');
  if(!inMgr&&t.closest('#modal'))return; // dialogs the step opened — confirmations, the seat map, results, the thumb — are part of the lesson
  if(!inMgr&&t.closest('#btnMenu')){e.preventDefault();e.stopPropagation();mtutLeave();return}
  if(!inMgr&&t.closest('.speedseg,.collhd,#btnEvInfo,#btnStands,#btnXray,#btnGraph'))return; // harmless arena controls
  if(!t.closest('button,a,select,input,textarea,summary,label,[data-mg],[data-ct],[data-act],[role="button"],canvas'))return; // clicks on nothing in particular do nothing anyway
  const st=MTUT_STEPS[MTUT.step];if(mtAllowed(st,t))return;
  e.preventDefault();e.stopPropagation();if(typeof mToast==='function')mToast(_T`🎓 One thing at a time — ${st&&st.next?_T('press <b>Next ▶</b> on the coach'):_T('follow the coach')} (or ✖ Leave the lesson).`)},true);
/* startManagerTutorial — builds the sandbox league (custom world flagged tutorial): a home week, 900 coin, a perk point, 12 hours, no deaths; fighter A (hurt, needs the Medicus) and fighter B (rating 76); opens the Manager on Your ludus and shows the coach. TWEAK: the coin/hours and both fighters' numbers. */
async function startManagerTutorial(){
  if(typeof menuHide==='function')menuHide();
  if(typeof liveEventRunning==='function'&&liveEventRunning()&&S){S.over=true}
  const prev=MGR.world;MTUT.prev=prev?prev.id:null;
  newWorld({type:'custom',tutorial:true,mgr:{name:'Tiro',ludus:_T('Ludus Discipuli'),city:'Roma',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},portrait:{skin:SKINS[1],hair:HAIRS[0],helm:'laurel',beard:false,bg:BGS[0]}}});
  const w=MGR.world;const m=me();
  // the lesson's week is fought at home, so the road never gets in the way
  {const home=travelHome(m);if(w.night&&w.night.loc!==home){m.city=LOCATIONS[w.night.loc].n}if(w.night)w.night.travel=null}
  // a house worth learning in: a full treasury, a perk point, hours to spend — and two fighters, one of them hurt
  m.coin=900;m.perkPts=1;w.hours=Math.max(w.hours,12);w.rules={...w.rules,death:0}; /* in the lesson the editor always shows clemency — the one verdict is staged */
  const ros=rosterOf(m);let A=ros[0];if(!A){A=genGlad({ovr:56});w.glads.push(A)}
  Object.assign(A,{ovr:57,pot:70,morale:62,inj:{until:w.week+3,label:_T('a deep thigh cut'),pen:3,req:'medicus'},contract:{mgr:m.id,wage:askWage(A),weeks:8,since:w.week},scout:2});
  const B=genGlad({ovr:76,age:26});Object.assign(B,{pot:84,morale:58,contract:{mgr:m.id,wage:askWage(B),weeks:8,since:w.week},scout:2,debut:{s:w.season,wk:w.week},interest:{}});w.glads.push(B);
  MTUT.A=A.id;MTUT.B=B.id;MGR.lsel=A.id;MGR.run='promote';
  MTUT.on=true;MTUT.step=0;MTUT.w0=w.week;MTUT.hidden=0;MTUT.spotted=-1;MTUT.entered=-1;MGR.tab='ludus';
  openManager();setTimeout(mtCoach,500)}
/* mtCleanup — ends the lesson: removes the coach and highlights and drops the sandbox world (never saved). */
function mtCleanup(){MTUT.on=false;const el=document.getElementById('mtutCoach');if(el)el.remove();document.querySelectorAll('.tutspot').forEach(x=>x.classList.remove('tutspot'));
  if(MGR.world&&MGR.world.tutorial){MGR.world=null;if(typeof ACTIVE!=='undefined'&&ACTIVE.world&&ACTIVE.world.tutorial){ACTIVE.world=null;ACTIVE.cid=null}}}
/* mtutLeave — asks "Leave the lesson?"; Stay reopens the Manager and coach, Leave stops any lesson bout, cleans up and fades to the main menu. */
async function mtutLeave(){const ok=await new Promise(r=>{if(typeof modalBusy==='function'&&modalBusy()&&!$('#mgrBody')&&!(S&&S.mgrCtx)){r(true);return}
    const cont=()=>modal(_T('Leave the lesson?'),`<p>${_T`The sandbox league is discarded and you return to the main menu. You can take the lesson again from the menu or Tactics → 🎓 Tutorials.`}</p>`,[{label:_T('Leave the lesson'),value:1,primary:1},{label:_T('Stay'),value:0}],{close:0}).then(r);
    if($('#mgrBody')&&CUR_MODAL){MTUT.reopen=1;CUR_MODAL.done('mtleave');setTimeout(cont,120)}else cont()});
  if(!ok){MTUT.reopen=0;if(!$('#mgrBody')&&!(S&&S.mgrCtx&&!S.over)){openManager();setTimeout(mtCoach,400)}return}
  MTUT.reopen=0;if(S&&S.mgrCtx&&!S.over)S.over=true;mtCleanup();if(!$('#modal').hidden&&typeof modalDismiss==='function')modalDismiss();const go=()=>{if(typeof menuShow==='function')menuShow()};if(typeof fadeTo==='function')fadeTo(go);else go()}
/* mtDone — marks the Manager lesson done (localStorage flavius_mtutDone), cleans up and offers: main menu, a new Manager career, or the lesson again. */
async function mtDone(){if(!MTUT.on&&!mtW())return;try{localStorage.setItem('flavius_mtutDone','1')}catch(e){}
  if(CUR_MODAL&&$('#mgrBody'))CUR_MODAL.done('mtdone');mtCleanup();await new Promise(r=>setTimeout(r,150));
  const v=await modal(_T('🎓 Tutorial completed'),`<div class="rulepop"><img src="${typeof flavFaceURL==='function'?flavFaceURL('cheer',MTUTOR99()):''}" alt="" style="width:96px;border-radius:8px"><div><p>${_T`<b>You have run a week of a ludus.</b> Recruit, keep, heal, build, enter, watch, bet, settle the verdicts, court your rivals — and climb the table toward the Superbus.`}</p><p class="rc-sub">${_T`Nothing from the lesson was kept.`}</p></div></div>`,
    [{label:_T('🏛 Main menu'),value:'menu'},{label:_T('💼 Start a new Manager career'),value:'new',primary:1},{label:_T('↺ Restart the tutorial'),value:'again'}],{close:'menu'});
  if(v==='again'){startManagerTutorial();return}
  if(v==='new'){MGR.world=null;if(typeof openManager==='function'){await new Promise(r=>setTimeout(r,80));openManager();setTimeout(()=>{const b=document.querySelector('[data-mg="create"]');if(b)b.click()},500)}return}
  if(typeof menuShow==='function')menuShow()}

/* the lessons, in one place: the main menu's split button (hidden once both are done, unless Settings says
   otherwise) and Rules & strategy → 🎓 Lessons */
/* lessonDone — has this lesson ('manager' or 'classic') been completed in this browser? */
const lessonDone=lesson=>{try{return localStorage.getItem(lesson==='manager'?'flavius_mtutDone':'flavius_tutDone')==='1'}catch(e){return false}};
/* lessonsMenuVis — shows/hides the main menu's two lesson buttons (each goes once its lesson is done, unless Settings keeps them); a lone button spans the row. */
function lessonsMenuVis(){const el=document.getElementById('mmLearn');if(!el)return;const pref=typeof SETTINGS!=='undefined'?SETTINGS.lessonsMenu:undefined;
  /* v0.46: each lesson's button goes once that lesson is done; a lone button is as wide as the rest of the menu */
  const bc=el.querySelector('[data-mm="learn"]'),bm=el.querySelector('[data-mm="learnmgr"]');
  const showC=pref===true||(pref!==false&&!lessonDone('classic')),showM=pref===true||(pref!==false&&!lessonDone('manager'));
  if(bc)bc.hidden=!showC;if(bm)bm.hidden=!showM;el.hidden=!showC&&!showM;el.classList.toggle('single',showC!==showM)}
/* lessonsHTML — Rules & strategy → 🎓 Lessons: a card per lesson (done or not, start/again) and the "lesson buttons on the main menu" switch. */
function lessonsHTML(){const card=(k,icon,title,desc)=>`<div class="mstone"><div class="mshd"><span class="msic">${icon}</span><div><div class="msv">${lessonDone(k)?'✔ completed':_T('not taken yet')}</div><b>${title}</b></div></div><p style="margin:4px 0 8px">${desc}</p><button class="btn primary" type="button" data-lesson="${k}">${lessonDone(k)?_T('Take it again'):_T('Start the lesson')}</button></div>`;
  return `<div class="lessoncards">${card('classic','🎓',_T('Learn to Play (Classic)'),_T('A tour of the arena screen, then a guided bout against one rival and two beasts: the choice, moving, breaking a Blessings pot, your hand, ending the turn — and the fight to the finish.'))}${card('manager','💼',_T('Learn to Play Manager Mode'),_T('One full guided week of a ludus in a sandbox league: a fighter’s card and keeping them happy, courting a recruit, the infirmary, facilities and schooling, the Training Yard, Match Week (watch a bout live, bet, enter the main event), a verdict, a rival house, the Imperium, the season — and the Acta Diurna.'))}</div>
   <label class="setrow" style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" data-lessonsmenu="1" ${(SETTINGS.lessonsMenu===true)||(SETTINGS.lessonsMenu!==false&&!(lessonDone('classic')&&lessonDone('manager')))?'checked':''}><span>${_T`<b>🎓 Lesson buttons on the main menu</b>`} <span class="rc-sub">${_T`they hide once both are done; tick to keep them`}</span></span></label>`}
