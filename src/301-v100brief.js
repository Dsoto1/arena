/* =====================================================================
   301-V100BRIEF · v1.0 — THE PRE-MATCH BRIEFING (his mock tools/plans/mock100/brief.html + NOTES-brief.md, round 2: 1c 2a 3a 4a 5a)
   =====================================================================
   The window 07-ui's eventBriefing opens when the horns sound (and 📋 Event reopens) is redrawn as its own framed window that fits ONE
   screen at 1440×900. It is still THE SAME modal() (title "📋 The briefing" / "📋 This event" kept in #mTitle, visually hidden; one
   primary button with value 1, close 1 → Esc), so everything that waits on it keeps working: 05-flow's first turn, 113's ONLM.info
   (online: each window shows it locally, never a recorded input), lessons/tutorials and sims (they never open it — the splash), the
   Settings switch, every test that answers it with '#mBtns button'.
   • HEADER: event card · kicker (CLASSIC · ROUND I OF III / TEAMS · SPECIAL EVENT / … · IN PROGRESS) · big name ("Classic · " dropped)
     · Summa Rudis medallion chip (classics, .brsr) · meta pills (📍 city · 📅 date · ☀ Day / ☾ Night · gladiators / teams · stands)
     · gold "How to win" bar with the wheat icon. Flavius top right: his painted face (assets/flavmood_*.webp) + one line in a bubble —
     opening = one of BF100_LINES (2a, Math.random: UI only, never the dice), reopened = his own 'pleased' mood lines.
   • THE ROUNDS = Ⅰ/Ⅱ/Ⅲ, name, zone, PvE/PvP/CF/CA chips (not allowed = red, struck through; title = 07-ui's RULE_INFO text; class
     rchip + no kept), ⏱ ends when, reward with coin/wheat icons; first round FIRST (opening), later done ✓ / NOW. Legend line under it.
   • RULES & CONDITIONS (1c): the event's own rules (gold edge: BF100_EVR per event, else the blurb) + printed conditions — The Fate
     (any event that pays CF), Arena deck (the beasts still in the deck), Blessings on the pillars, Mandata Flavi on/off, No Crowd
     Favor / no abilities. No digital-only cards (they live in Tactics). Always shown, phones too (no fold).
   • ON THE SAND: a card per seat — portrait circle (the gladiator's look: Manager look, custom portrait, online look, else
     gladPortrait) + his class token round, name, class in its colour, YOU / CPU · mind / PLAYER, team chip; mini (printed class) or
     figure on the right; a fallen seat (4a) greyed with ✝ "fell in round N" (round noted by an eliminate wrapper, display only).
   • FOOTER: "Reopen any time: 📋 Event" + the sandstone "Enter the arena" (5a) / reopened: "Opened from 📋 Event" + "Back to the sand".
   • Phones ≤600 px: full screen, card thumb + title, Flavius as a slim bubble row, rounds stacked, rule cards in one column, seats swipe
     sideways in their own strip, the button fixed at the bottom. Reduce motion / calm: no entry fade. No timers, no per-frame cost.
   Kill switch localStorage flavius_brief100off=1 → 07-ui's briefing as it was. Test tv100bf; shots tools/plans/brief100/.
   ===================================================================== */
const BF100={cur:0,fell:new WeakMap()};
function brief100On(){try{return localStorage.getItem('flavius_brief100off')!=='1'}catch(e){return true}}
/* 2a — Flavius's opening lines (one at random each time the horns sound) */
const BF100_LINES=[_T('Rome is watching. Do not bore me.'),_T('Gold for the swift. Sand for the slow.'),_T('I paid for this sand. Stain it well.'),
  _T('Thirteen thousand voices. Give them a reason.'),_T('The lions have not eaten today.'),_T('Live, and I may remember your name.'),
  _T('Fight as if I were watching. I am.'),_T('Every drop of blood is already paid for.'),_T('Try not to die in the first round. It is tedious.'),
  _T('Let us see which of you is worth the coin.'),_T('Today, the sand decides. Tomorrow, so do I.'),_T('Begin. And make it memorable.')];
/* the event's own rules (gold cards) — TWEAK: add an event key here to give it its own cards; others show their blurb */
const BF100_EVR={
  goldenEagle:()=>[['🦅',_T('One Golden Eagle'),_T('It waits on the centre tile and returns there if its carrier leaves.')],
    ['🚩',_T('Three captures'),_T('Then your team may leave through a starting tile. First team out wins.')],
    ['🎒',_T('Start with nothing'),_T('Three items and two Arena Keys lie in the sand.')]]
};
/* round end lines the mock words better than 07-ui's END_TXT, per event|end */
const BF100_END={'goldenEagle|eagle':_T('A team exits with three captures, or one team is left')};
const BF100_HOW={goldenEagle:w=>_T`Carry the Golden Eagle to a capture tile. After <b>three captures</b> your team may exit — the first team out wins <b>${w}</b>.`};
const bf100Roman=n=>['','I','II','III','IV','V','VI','VII','VIII','IX','X'][n]||String(n);
const bf100Cap=s=>{s=String(s||'');return s.charAt(0).toUpperCase()+s.slice(1)};
/* the round a gladiator fell in — display only (WeakMap, never S) */
{const base=eliminate;eliminate=function(v){const was=!!(v&&v.alive);const r=base.apply(this,arguments);try{if(was&&!v.alive&&S)BF100.fell.set(v,S.ri)}catch(e){}return r}}
/* bf100Look — the face a seat shows: Manager look, custom character portrait, online look, else the generated one */
function bf100Look(p){try{const w=typeof mgrWorldAny==='function'?mgrWorldAny():null;const g=w&&p.mgrGid&&w.glads&&w.glads.find(x=>x.id===p.mgrGid);if(g&&typeof gLook==='function'){const l=gLook(g);if(l)return l}}catch(e){}
  try{const C=CLASSES[p.cls];if(C&&C.custom&&C.custom.portrait)return C.custom.portrait}catch(e){}
  try{if(p._onlLook&&p._onlLook.portrait)return p._onlLook.portrait}catch(e){}
  try{const k=(typeof ptok81Cls==='function'&&ptok81Cls(p.cls))||p.cls;return typeof gladPortrait==='function'?gladPortrait(p.name||String(p.id),k):null}catch(e){return null}}
function bf100Mine(p){try{if(S.onl){const me=S.onl.seat;return S.players.indexOf(p)===me||p.id===me}}catch(e){}return !p.cpu}
function bf100Seat(p,ri){
  const C=CLASSES[p.cls]||{};const col=C.color||p.color||'#c9a458';const k=typeof ptok81Cls==='function'?ptok81Cls(p.cls):null;
  const look=bf100Look(p);let face='';try{face=look&&typeof portraitHTML==='function'?portraitHTML({name:p.name,portrait:look,color:p.color},'md'):''}catch(e){}
  const tok=k?`<i style="background-image:url('${assetURL('ptokf81_'+k+'.webp')}')"></i>`:`<i class="bf100tc" style="background:${col}">${esc(String(C.name||'?').charAt(0))}</i>`;
  let mini='';try{mini=k?`<span class="bf100mini" style="background-image:url('${assetURL('mini_'+k+'.webp')}')"></span>`:(typeof figureHTML==='function'&&typeof tokenForCls==='function'?`<span class="bf100mini bf100fig">${figureHTML(tokenForCls(p.cls),48)}</span>`:'')}catch(e){}
  const out=!p.alive;const fr=BF100.fell.get(p);
  const tm=p.team!=null&&(EV().teams||EV().coop)&&String(p.team).length<=2?` <span class="bf100tag bf100team" style="background:${teamColor(String(p.team))}">${esc(String(p.team))}</span>`:'';
  const mine=bf100Mine(p);
  const who=out?(p.exited?` <span class="bf100tag cpu">${_T('escaped')}</span>`:` <span class="bf100tag cpu">${fr!=null?_T`✝ fell in round ${bf100Roman(fr+1)}`:_T('✝ fell')}</span>`)
    :mine?` <span class="bf100tag">${S.hotseat&&typeof hsYou==='function'?hsYou(p):_T('YOU')}</span>`
    :p.cpu?` <span class="bf100tag cpu">CPU${typeof cpuMind==='function'&&cpuMind(p)?' · '+esc(cpuMind(p)):''}</span>`:` <span class="bf100tag cpu">${_T('PLAYER')}</span>`; /* i18n:skip — game terms */
  return `<div class="bf100st ${mine&&!out?'you':''} ${out?'out':''}" style="--pc:${col}"><span class="bf100fc">${face}${tok}</span><span class="bf100tx"><b>${esc(p.name)}</b><span><span class="bf100cl">${esc(C.name||'')}</span>${tm}${who}</span></span>${mini}</div>`}
function bf100Rules(ev){
  const R=[];const ek=S.evKey;
  if(BF100_EVR[ek])for(const x of BF100_EVR[ek]())R.push([...x,'ev']);else if(!ev.sr&&ev.blurb)R.push(['📜',ev.short||ev.n,ev.blurb,'ev']);
  const allNoCF=ev.rounds.every(r=>!r.cf),allNoCA=ev.rounds.every(r=>!r.ca);
  const own=!!BF100_EVR[ek];
  if(!allNoCF)R.push(['🎴',_T('The Fate'),_T('Under 17 CF at the end: condemned. 17–19: the Thumb of Flavius.'),ev.sr?'ev':'']);
  if(ev.deck&&!own){let names=[];try{const seen=new Set();for(const k of [...(S.deck||[]),...(S.round2||[])]){const c=CARDS[k];if(c&&c.type==='npc'&&c.n&&!seen.has(c.n)){seen.add(c.n);names.push(c.n)}}}catch(e){}
    const ord=['Tholo','Leo','Leaena','Commodus'];names.sort((a,b)=>(ord.indexOf(a)+1||9)-(ord.indexOf(b)+1||9)); /* i18n:skip — beast names */
    if(names.length)R.push(['🐾',_T('Arena deck'),names.length>1?_T`${names.slice(0,-1).join(', ')} and ${names[names.length-1]} may be drawn.`:_T`${names[0]} may be drawn.`,''])}
  try{if(!own&&(S.pillars||[]).some(x=>x.pots&&x.pots.length))R.push(['🏺',_T('Blessings on the pillars'),_T('Topple a pillar or break a pot: 2 coin · 1 CF, or an offering.'),''])}catch(e){}
  if(ev.mandata&&!own)R.push(S.opts&&S.opts.mandata?['📜',_T('Mandata Flavi'),_T('Each gladiator holds a secret objective from Flavius.'),'']:['📜',_T('Mandata Flavi off'),_T('No secret objectives this event.'),'']);
  if(allNoCF&&allNoCA)R.push(['🚫',_T('No Crowd Favor, no abilities'),_T('CF is not earned or spent; class abilities are off.'),'']);
  else if(allNoCF)R.push(['🚫',_T('No Crowd Favor'),_T('CF cannot be spent in any round.'),'']);
  else if(allNoCA)R.push(['🚫',_T('No class abilities'),_T('Class abilities are off in every round.'),'']);
  return R.slice(0,6)}
/* brief100HTML — the whole window body (header, rounds, rules, seats, footer note) */
function brief100HTML(opening){
  const ev=EV();const L=LOCATIONS[S.locIdx];const n=S.players.length;const live=!opening&&S.phase!=='setup';
  const teamsN=ev.teams||ev.coop?[...new Set(S.players.map(p=>p.team))].length:0;
  const classic=/^Classic · /.test(ev.n||'');const name=classic?ev.n.replace(/^Classic · /,''):ev.n;
  const kind=teamsN&&!ev.coop?_T('Teams'):classic?_T('Classic'):esc(ev.tag||ev.short||'');
  const nr=ev.rounds.length;
  const k2=live?(nr>1?_T`Round ${bf100Roman(S.ri+1)} of ${bf100Roman(nr)} · in progress`:_T('In progress')):(classic||nr>1?_T`Round I of ${bf100Roman(nr)}`:_T('Special event'));
  const extra=(S.fest&&typeof festName==='function'?' · '+esc(festName(S.fest.kind)):'')+(S.missio?_T(' · Missio'):'');
  let card='';try{card=cardHTML('e:'+S.evKey,'md')||''}catch(e){}
  if(!card)card=`<span class="cimg md bf100nocard" aria-hidden="true">🏟</span>`;
  let sr='';try{const k=typeof srKey==='function'?srKey(ev):null;if(k)sr=`<span class="brsr bf100sr">${srImgHTML(k,40)}<span>${_T`Summa Rudis<b>${esc(ev.sr)}</b>`}</span></span>`}catch(e){}
  const meta=[];meta.push(`📍 <b>${esc(L?L.n:'')}</b>`);
  try{if(!S.onl&&typeof calNow==='function'&&typeof empireDate==='function'){const c=calNow();meta.push('📅 '+esc(empireDate(c.season,c.week).short))}}catch(e){}
  let night=false;try{night=typeof night91On==='function'&&night91On()}catch(e){}meta.push(night?_T('☾ Night'):_T('☀ Day'));
  meta.push(teamsN&&!ev.coop?_T`⚔ ${n} gladiators · ${teamsN} teams`:n===1?_T('⚔ 1 gladiator'):_T`⚔ ${n} gladiators`);
  try{const st=(S.spect||[]).filter(x=>!x.gone).length;if(st)meta.push(_T`🏟 ${st}K in the stands`)}catch(e){}
  const last=ev.rounds[nr-1];const win=last.reward&&last.reward.win?cfAmt87(last.reward.win):'';
  const how=BF100_HOW[S.evKey]&&win?BF100_HOW[S.evKey](win)
    :last.end==='alive1'&&!teamsN?(win?_T`Survive every round. The last one standing wins <b>${win}</b> — then Crowd Favor decides your Fate.`:_T('Survive every round. The last one standing wins — then Crowd Favor decides your Fate.'))
    :teamsN?_T`Be the side still standing when <b>${esc(END_TXT[last.end]||last.end)}</b>.`+(win?_T` The winners take <b>${win}</b>.`:'')
    :_T`The event is won when <b>${esc(END_TXT[last.end]||last.end)}</b>.`+(win?_T` Worth <b>${win}</b>.`:'');
  const mood=opening?'smug':'pleased';
  let say=opening?BF100_LINES[Math.floor(Math.random()*BF100_LINES.length)]:'';
  if(!say){try{const P=FLAV_LINES.pleased;say=P[Math.floor(Math.random()*P.length)]}catch(e){}say=say||_T('Better. Now earn the next one.')}
  const rows=ev.rounds.map((rd,i)=>{const now=live&&i===S.ri,done=live&&i<S.ri,first=!live&&i===0;const rr=roundRules(rd,now);
    const zs=ZONES[rd.zone]?ZONES[rd.zone][1]-ZONES[rd.zone][0]+1:13;
    const chips=['pve','pvp','cf','ca'].map(k=>`<span class="rchip ${rr[k]?'yes y':'no n0'}" title="${esc(rr[k]?RULE_INFO[k][2]:RULE_INFO[k][3])}">${{pve:'PvE',pvp:'PvP',cf:'CF',ca:'CA'}[k]}</span>`).join(''); /* i18n:skip — class names */
    const rw=rd.reward||{};const rwT=rw.win&&!rw.coin&&!rw.cf&&!rw.cards?_T`Winner ${cfAmt87(rw.win)}`:[rw.cards?_T`${rw.cards} cards`:'',rw.coin?coinAmt87(rw.coin):'',rw.cf?cfAmt87(rw.cf):'',rw.win?_T`Winner ${cfAmt87(rw.win)}`:''].filter(Boolean).join(' · ');
    return `<div class="bf100rd ${now||first?'now':''} ${done?'done':''}"><span class="n">${bf100Roman(i+1)}</span><span class="nm"><b>${esc(rd.n)}</b><span>${zs}×${zs}</span>${first?`<em>${_T('FIRST')}</em>`:now?`<em>${_T('NOW')}</em>`:done?`<em class="dn">${_T('✓ DONE')}</em>`:''}</span><span class="rch">${chips}</span><span class="end">⏱ ${esc(bf100Cap(BF100_END[S.evKey+'|'+rd.end]||END_TXT[rd.end]||rd.end))}</span><span class="rw">${rwT}</span></div>`}).join('');
  const zs0=ev.rounds.map(r=>ZONES[r.zone]?ZONES[r.zone][1]-ZONES[r.zone][0]:12);
  const rsub=nr>1?(zs0.every((z,i)=>!i||z<zs0[i-1])?_T('· the sand shrinks each round'):''):(zs0[0]>=12?_T('· one round, the whole sand'):_T('· one round'));
  const rules=bf100Rules(ev).map(([ic,b,t,k])=>`<div class="bf100rc ${k}"><span class="ic" aria-hidden="true">${ic}</span><div><b>${esc(b)}</b><span>${esc(t)}</span></div></div>`).join('');
  const alive=S.players.filter(p=>p.alive).length;
  const teamsL=teamsN&&!ev.coop?[...new Set(S.players.map(p=>p.team))].map(t=>_T`Team ${esc(String(t))}`+` <span class="bf100tag bf100team" style="background:${teamColor(String(t))}">${esc(String(t))}</span>`).join(_T(' vs ')):'';
  const ssub=live&&!teamsN?_T`· ${alive} still standing`:teamsL?'· '+teamsL:ev.coop?_T('· one side'):n===1?_T('· alone on the sand'):_T('· every one for himself');
  const seats=S.players.map(p=>bf100Seat(p)).join('');
  return `<div class="brief bf100w"><div class="bf100hd"><div class="bf100card">${card}</div><div class="bf100mid"><div class="bf100kick">${kind}${extra} · <span class="k">${k2}</span></div>
   <div class="bf100ttl"><div class="bf100nm" role="heading" aria-level="2">${esc(name)}</div>${sr}</div><div class="bf100meta">${meta.map(x=>`<span>${x}</span>`).join('')}</div>
   <div class="bf100how"><span class="tr" aria-hidden="true">🏆</span><span>${_T`<b>How to win.</b> ${how}`}</span></div></div>
   <div class="bf100flv"><div class="face" style="background-image:url('${assetURL('flavmood_'+mood+'.webp')}')" role="img" aria-label="${_T('Flavius')}"></div><div class="say">“${esc(say)}”</div><div class="who">${_T('FLAVIUS · FROM HIS BOX')}</div></div></div>
  <div class="bf100body"><div><div class="bf100sh">${_T('The rounds')} <small>${rsub}</small></div><div class="bf100rounds">${rows}</div>
   <div class="bf100leg">${_T`<span>PvP</span> = not allowed this round · hover a chip for the full rule`}</div></div>
   <div><div class="bf100sh">${_T('Rules & conditions')} <small>${_T('· this event')}</small></div><div class="bf100rules">${rules}</div></div></div>
  <div class="bf100seats"><div class="bf100sh">${_T('On the sand')} <small>${ssub}</small></div><div class="bf100strip" style="--n:${Math.min(4,Math.max(1,n))}">${seats}</div></div></div>`}
const BF100_SWORD='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 2l9.2 9.2-1.4 1.4L1.6 3.4 3 2zm18 0l1.4 1.4-7.1 7.1 2.1 2.1 1.4-1.4 1.4 1.4-2.1 2.1 2.8 2.8-1.4 1.4-2.8-2.8-2.1 2.1-1.4-1.4 1.4-1.4-2.1-2.1-2.1 2.1 1.4 1.4-1.4 1.4-2.1-2.1-2.8 2.8L4.6 20l2.8-2.8-2.1-2.1 1.4-1.4 1.4 1.4L21 2z"/></svg>';
/* the window: the same eventBriefing → modal; this marks the call so briefingHTML and modal take the new look */
{const base=eventBriefing;eventBriefing=async function(opening){if(!brief100On())return base.apply(this,arguments);
  const prev=BF100.cur;BF100.cur=opening?1:2;try{return await base.apply(this,arguments)}finally{BF100.cur=prev}}}
{const base=briefingHTML;briefingHTML=function(){if(BF100.cur&&brief100On()){try{return brief100HTML(BF100.cur===1)}catch(e){console.error(e)}}return base.apply(this,arguments)}}
function bf100Unmark(){try{const m=document.getElementById('modal');if(m)m.classList.remove('bf100')}catch(e){}}
{const base=modal;modal=function(title,body,buttons,opt){
  if(BF100.cur&&typeof body==='string'&&body.indexOf('bf100w')>=0&&brief100On()){
    const opening=BF100.cur===1;const o=Object.assign({},opt||{});delete o.wide;o.close=1;
    const ok=o.onOpen,kp=o.keep;
    o.onOpen=function(done){try{const m=document.getElementById('modal');m.classList.add('bf100');m.classList.toggle('bf100calm',!!(typeof reduceMotion==='function'&&reduceMotion()));
      const mb=document.getElementById('mBtns');if(mb&&!mb.querySelector('.bf100note')){const s=document.createElement('span');s.className='bf100note';
        s.innerHTML=opening?_T`Reopen any time: <b>📋 Event</b> on the top bar.`:_T`Opened from <b>📋 Event</b> · the fight waits for you.`;mb.insertBefore(s,mb.firstChild)}}catch(e){}
      if(ok)return ok.apply(this,arguments)};
    o.keep=function(v){bf100Unmark();return kp?kp.apply(this,arguments):false};
    const btns=[{label:BF100_SWORD+`<span class="t">${opening?_T('Enter the arena'):_T('Back to the sand')}</span>`,value:1,primary:1}];
    return base.call(this,title,body,btns,o)}
  /* any other window: never inherits the briefing's look */
  if(opt&&typeof opt==='object'){const ok=opt.onOpen;opt=Object.assign({},opt,{onOpen:function(){bf100Unmark();if(ok)return ok.apply(this,arguments)}})}else opt={onOpen:bf100Unmark};
  return base.call(this,title,body,buttons,opt)}}
(()=>{const st=document.createElement('style');st.textContent=`
#modal.bf100{padding:12px}
#modal.bf100 .mbox{max-width:min(1240px,calc(100vw - 48px));width:100%;padding:0!important;border:1px solid #6b5236;border-radius:12px;background:linear-gradient(#21180f,#181009);box-shadow:0 30px 80px #000d,0 0 0 1px #000;overflow-x:hidden;overflow-y:auto;display:block;height:auto}
#modal.bf100:not(.bf100calm) .mbox{animation:bf100in .22s ease-out}
@keyframes bf100in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
#modal.bf100 #mTitle{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;margin:0;padding:0}
#modal.bf100 #mClose,#modal.bf100 #mPeek{display:none!important}
#modal.bf100 #mBody{padding:0;overflow:visible}
.bf100w{color:var(--bone)}
.bf100hd{position:relative;display:grid;grid-template-columns:118px minmax(0,1fr) auto;gap:18px;padding:16px 20px 14px;border-bottom:1px solid var(--line2);background:radial-gradient(ellipse 70% 120% at 30% 0%,#3a2a18 0%,transparent 70%),linear-gradient(#24190f,#1b130d)}
.bf100card .cimg{width:118px!important;height:auto;box-shadow:0 8px 20px #000c,0 0 0 1px #6b5236;border-radius:6px}
.bf100nocard{display:grid!important;place-items:center;aspect-ratio:480/692;font-size:40px}
.bf100kick{font:500 11px var(--mono);letter-spacing:.2em;color:var(--muted);text-transform:uppercase}
.bf100kick .k{color:var(--gold)}
.bf100ttl{display:flex;align-items:center;gap:14px;margin:2px 0 4px;flex-wrap:wrap}
.bf100nm{font:400 38px/1.05 var(--display);color:var(--gold2);letter-spacing:.04em;text-shadow:0 2px 0 #000}
.bf100sr{display:inline-flex;align-items:center;gap:8px;padding:3px 10px 3px 3px;border-radius:999px;border:1px solid #6b5236;background:#160f0b}
.bf100sr img{width:40px;height:40px;border-radius:50%;box-shadow:0 0 0 1px var(--gold)}
.bf100sr>span{font-size:12px;line-height:1.15;color:var(--muted)}.bf100sr b{display:block;color:var(--gold2);font-size:13px}
.bf100meta{display:flex;flex-wrap:wrap;gap:6px;margin:2px 0 8px}
.bf100meta span{font-size:13.5px;padding:3px 9px;border-radius:999px;border:1px solid #4a3826;background:#1a120d;color:#e2d5bb;white-space:nowrap}
.bf100meta span b{color:var(--gold2);font-weight:600}
.bf100how{display:flex;gap:10px;align-items:flex-start;padding:8px 12px;border-radius:8px;border:1px solid var(--gold);background:linear-gradient(90deg,#3a2a18,#231a12);font-size:15px;color:#efe3cc;max-width:760px}
.bf100how .tr{font-size:20px;line-height:1}.bf100how b{color:var(--gold2)}
.bf100flv{display:flex;flex-direction:column;align-items:flex-end;gap:6px;width:240px}
.bf100flv .face{width:132px;height:102px;border-radius:10px;background-size:cover;background-position:center;box-shadow:0 0 0 2px #6b5236,0 0 0 4px #1b130d,0 0 0 5px var(--gold),0 10px 22px #000b}
.bf100flv .say{position:relative;max-width:240px;padding:8px 12px;border-radius:10px;background:#efe3cc;color:#2a1a0c;font:italic 600 15px/1.25 var(--body);box-shadow:0 6px 16px #000a}
.bf100flv .say::after{content:"";position:absolute;right:50px;top:-7px;border:7px solid transparent;border-top:0;border-bottom-color:#efe3cc}
.bf100flv .who{font:500 10.5px var(--mono);letter-spacing:.14em;color:var(--muted)}
.bf100body{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:16px;padding:14px 20px 10px}
.bf100sh{display:flex;align-items:baseline;gap:8px;font:400 17px var(--display);color:var(--gold2);letter-spacing:.06em;margin:0 0 7px}
.bf100sh small{font:12.5px var(--body);color:var(--muted);letter-spacing:0;display:inline-flex;align-items:baseline;gap:4px;flex-wrap:wrap}
.bf100rounds{display:grid;gap:1px;background:#00000050;border:1px solid #3a2c1e;border-radius:8px;overflow:hidden}
.bf100rd{display:grid;grid-template-columns:40px minmax(0,1fr) auto;gap:4px 12px;align-items:center;padding:10px 12px;background:var(--panel2);position:relative}
.bf100rd .n{grid-row:1/3;font:400 25px var(--display);color:var(--gold);text-align:center}
.bf100rd .nm{display:flex;align-items:baseline;gap:8px;min-width:0;flex-wrap:wrap}
.bf100rd .nm b{font:400 19px var(--display);color:var(--bone);letter-spacing:.02em}
.bf100rd .nm span{font:12px var(--mono);color:var(--muted)}
.bf100rd .nm em{font:600 10px var(--mono);letter-spacing:.12em;font-style:normal;color:#140f0b;background:var(--gold2);padding:1px 6px;border-radius:3px}
.bf100rd.done{opacity:.55}.bf100rd.done .n{color:var(--muted)}.bf100rd .nm em.dn{background:#4d7a43;color:#e8f5df}
.bf100rd.now{background:linear-gradient(90deg,#3a2a18,#2a1f17 60%);box-shadow:inset 3px 0 0 var(--gold)}
.bf100rd .rch{display:flex;gap:4px;justify-content:flex-end}
.bf100rd .rch .rchip,.bf100leg span{font:600 11px var(--mono);padding:2px 6px;border-radius:3px;border:1px solid;cursor:help}
.bf100rd .rch .y{border-color:#4d7a43;color:#bfe3b0;background:#1e2d19}
.bf100rd .rch .n0,.bf100leg span{border-color:#6a2a22;color:#ec9a8a;text-decoration:line-through;background:#2a1512}
.bf100rd .end{font-size:14px;color:#ddd0b6;line-height:1.3}
.bf100rd .rw{font-size:13.5px;color:var(--gold2);text-align:right;white-space:nowrap}
.bf100leg{margin-top:6px;font-size:12px;color:var(--muted)}.bf100leg span{font-size:10.5px;padding:1px 5px;cursor:default}
.bf100rules{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.bf100rc{position:relative;display:flex;gap:10px;padding:9px 10px;border-radius:8px;border:1px solid #3a2c1e;background:var(--panel2);min-height:64px}
.bf100rc .ic{flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-size:16px;background:#160f0b;box-shadow:0 0 0 1px #4a3826}
.bf100rc b{display:block;font-size:14.5px;color:var(--bone);line-height:1.2}
.bf100rc>div>span{display:block;font-size:13px;color:var(--muted);line-height:1.25;margin-top:2px}
.bf100rc.ev{border-color:#7a5a24;background:linear-gradient(135deg,#33261a,#251b13 70%)}
.bf100seats{padding:4px 20px 12px}
.bf100strip{display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:10px}
.bf100st{position:relative;display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:9px;border:1px solid #3a2c1e;border-left:4px solid var(--pc);background:linear-gradient(90deg,color-mix(in srgb,var(--pc) 16%,#2a1f17),#211811 70%);min-width:0}
.bf100fc{position:relative;flex:none;width:56px;height:56px;border-radius:50%;background:#2a1f30;box-shadow:0 0 0 2px var(--pc),0 3px 8px #000a}
.bf100fc .portrait{position:absolute!important;left:-18px;top:-22px;width:92px!important;height:129px!important;clip-path:circle(28px at 46px 50px);pointer-events:none}
.bf100fc .portrait>*{width:100%!important;height:100%!important}
.bf100fc i{position:absolute;right:-7px;bottom:-5px;width:26px;height:26px;border-radius:50%;background-size:cover;box-shadow:0 0 0 1.5px #140f0b,0 2px 4px #000b;z-index:1}
.bf100fc i.bf100tc{display:grid;place-items:center;font:700 12px var(--display);font-style:normal;color:#140f0b}
.bf100st.out{opacity:.5;filter:grayscale(.7)}.bf100st.out .bf100fc::after{content:"✝";position:absolute;inset:0;display:grid;place-items:center;font-size:26px;color:#efe3cc;text-shadow:0 1px 3px #000;z-index:2}
.bf100tx{min-width:0;flex:1}
.bf100tx b{display:block;font-size:14.5px;color:var(--bone);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bf100tx>span{display:block;font-size:12.5px;color:var(--muted)}
.bf100cl{color:var(--pc);font-family:var(--display);font-size:14px;letter-spacing:.03em;filter:brightness(1.25)}
.bf100mini{flex:none;width:40px;height:50px;background-size:contain;background-repeat:no-repeat;background-position:center bottom;filter:drop-shadow(0 3px 4px #000a)}
.bf100mini.bf100fig{display:flex;align-items:flex-end;justify-content:center}
.bf100tag{white-space:nowrap;font:600 9.5px var(--mono);padding:1px 5px;border-radius:3px;color:#140f0b;background:var(--gold2);margin-left:4px;vertical-align:1px}
.bf100tag.cpu{background:#6b5a46;color:#efe3cc}
.bf100st.you{box-shadow:0 0 0 1px var(--gold),0 0 16px #d6ab4c30}
#modal.bf100 #mBtns{display:flex;flex-wrap:nowrap;align-items:center;gap:14px;margin:0;padding:12px 20px 16px;border-top:1px solid var(--line2);background:#150f0b}
#modal.bf100 .bf100note{flex:1;font-size:13px;color:var(--muted)}#modal.bf100 .bf100note b{color:var(--bone)}
#modal.bf100 #mBtns .btn.primary{flex:none;position:relative;height:58px;display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:0 30px;border:0;border-radius:5px;cursor:pointer;white-space:nowrap;
  font:400 24px/1 var(--display);letter-spacing:.07em;color:#4a3017;background:linear-gradient(176deg,#dcc196 0%,#c9a877 38%,#b48f5c 100%);
  box-shadow:inset 0 2px 0 rgba(255,244,214,.75),inset 0 -3px 0 rgba(92,60,28,.55),0 4px 0 #6b4e2b,0 5px 0 #4b3519,0 10px 18px rgba(0,0,0,.6);transition:transform .12s,box-shadow .12s,filter .12s;min-width:0}
#modal.bf100 #mBtns .btn.primary::before{content:"";position:absolute;inset:6px;border-radius:3px;background:linear-gradient(180deg,#8f2a1e,#6d1c13 60%,#5a160f);box-shadow:inset 0 2px 4px rgba(0,0,0,.6),inset 0 -1px 0 rgba(255,180,150,.25),0 1px 0 rgba(255,238,204,.55);pointer-events:none}
#modal.bf100 #mBtns .btn.primary>*{position:relative;z-index:1}
#modal.bf100 #mBtns .btn.primary .t{background:linear-gradient(180deg,#fff2be 0%,#f0cf7d 30%,#b98a2a 62%,#e7c46c 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 1px 0 rgba(60,20,8,.85))}
#modal.bf100 #mBtns .btn.primary svg{width:26px;height:26px;fill:#f0cf7d;filter:drop-shadow(0 1px 0 rgba(60,20,8,.85))}
#modal.bf100 #mBtns .btn.primary:hover,#modal.bf100 #mBtns .btn.primary:focus-visible{transform:translateY(-2px);filter:brightness(1.06);box-shadow:inset 0 2px 0 rgba(255,244,214,.75),inset 0 -3px 0 rgba(92,60,28,.55),0 6px 0 #6b4e2b,0 7px 0 #4b3519,0 14px 24px rgba(0,0,0,.7),0 0 0 2px rgba(240,207,125,.55)}
#modal.bf100 #mBtns .btn.primary:active{transform:translateY(3px);box-shadow:inset 0 3px 6px rgba(60,36,14,.45),0 1px 0 #6b4e2b,0 2px 0 #4b3519}
#modal.bf100.bf100calm #mBtns .btn.primary,body.calm #modal.bf100 #mBtns .btn.primary{transition:none}
@media (prefers-reduced-motion:reduce){#modal.bf100 .mbox{animation:none!important}}
@media (max-width:900px) and (min-width:601px){.bf100hd{grid-template-columns:96px minmax(0,1fr)}.bf100flv{grid-column:1/-1;flex-direction:row-reverse;align-items:center;justify-content:flex-end;width:auto}.bf100flv .who{display:none}.bf100body{grid-template-columns:1fr}.bf100strip{grid-template-columns:repeat(2,minmax(0,1fr))}.bf100card .cimg{width:96px!important}}
@media (max-width:600px){
  #modal.bf100{padding:0}
  #modal.bf100 .mbox{max-width:100vw;width:100vw;height:100%;max-height:100%;border-radius:0;border:0}
  .bf100hd{grid-template-columns:72px minmax(0,1fr);gap:12px;padding:12px 16px}
  .bf100card .cimg{width:72px!important}
  .bf100kick{letter-spacing:.14em;font-size:10.5px}
  .bf100ttl{gap:8px}.bf100nm{font-size:27px}
  .bf100sr img{width:30px;height:30px}.bf100sr>span{font-size:11px}.bf100sr b{font-size:12px}
  .bf100meta span{font-size:12px;padding:2px 7px}
  .bf100how{grid-column:1/-1;font-size:14px}
  .bf100flv{grid-column:1/-1;flex-direction:row-reverse;align-items:center;width:auto;justify-content:flex-end}
  .bf100flv .face{width:58px;height:46px;border-radius:8px;box-shadow:0 0 0 1px var(--gold);flex:none}
  .bf100flv .say{font-size:13.5px;padding:6px 10px}.bf100flv .say::after{right:-7px;top:12px;border:7px solid transparent;border-right:0;border-left-color:#efe3cc}
  .bf100flv .who{display:none}
  .bf100body{grid-template-columns:1fr;padding:12px 16px 6px}
  .bf100rd{grid-template-columns:30px minmax(0,1fr);padding:9px 10px}
  .bf100rd .n{font-size:20px;grid-row:1/5}
  .bf100rd .rch{justify-content:flex-start;flex-wrap:wrap}.bf100rd .nm,.bf100rd .rch,.bf100rd .end,.bf100rd .rw{grid-column:2}.bf100rd .rw{text-align:left;white-space:normal}
  .bf100rules{grid-template-columns:1fr}
  .bf100seats{padding:4px 0 10px}.bf100seats .bf100sh{padding:0 16px}
  .bf100strip{display:flex;overflow-x:auto;padding:0 16px 4px;scroll-snap-type:x mandatory;overscroll-behavior-x:contain}
  .bf100st{flex:none;width:250px;scroll-snap-align:start}
  #modal.bf100 #mBtns{position:sticky;bottom:0;padding:10px 16px calc(12px + env(safe-area-inset-bottom));box-shadow:0 -10px 24px #000b;z-index:5}
  #modal.bf100 .bf100note{display:none}#modal.bf100 #mBtns .btn.primary{flex:1;font-size:20px;height:52px;padding:0 16px}
}`;document.head.appendChild(st)})();
