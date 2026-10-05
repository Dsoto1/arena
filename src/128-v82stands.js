/* =====================================================================
   128-V82STANDS · ONLINE v0.82: the stands' group turn, the spear refund, sculpted online tokens, the creator
   =====================================================================
   • THE STANDS' GROUP TURN (online only; protocol 5, tools/plans/onl82-contract.md §6). Where the engine gives the human
     spectator an upkeep (humanSpectatorTurn inside spectatorsAct), an online match no longer asks the ticket holders one by
     one: every client waits there for ONE input. The host's client opens the window (match.stands.open {rot}, rot = S.st82n,
     counted in S so every client and every snapshot agrees); the server pushes stands.window to the ticket holders only;
     each gets a PRIVATE popup (#st82Pop — never a modal(), nobody else sees it) with their CF: 🪨 stone / 🎁 offering at a
     gladiator in their quadrant (LOCKED to the tile that gladiator stands on now), 📣 Tholo chant, 🚶 change section,
     👏 cheer for a gladiator (free), or watch. One pick each (match.stands.pick, never pushed); 20 s; the host closes the
     window (match.stands.close) — or the server does when all have answered. The single server input
     {k:'stands.result',rot,picks:[{seat,pick}],missed} is applied in seat order on every client at its place in the stream
     (st82Apply): a stone / offering lands on its locked tile — whoever stands there is hit / receives it, an empty tile
     takes the offering onto the floor (under a beast, into the spikes), a stone on empty sand misses. CF is checked when
     applied (the same refusal on every screen). Tholo: the chanting ticket holders, and the crowd fills any quadrant still
     silent (each payer 3 CF; every quadrant must join). The CPU crowd then acts as before. Offline nothing changes.
     Fallbacks: the host cannot open (no stands left on the server) → it sends a 'stands.skip' input; no window 27 s later →
     another live fighter closes it, or skips when none was opened. Only 'stands.result' from the server counts; a skip only
     from a fighter's seat. While the stands choose, board and action clicks are held (no move can slip into the stream).
   • SPEAR REFUND: a ticket holder speared from the sand is refunded the ticket price (log: "Flavius refunds the ticket — he
     hates to see his spectators speared."); they keep their wager and keep watching. The doSpear wrapper only adds this
     hook (129 may wrap doSpear again for the scowl/Mandata). Every human fighter's client reports it (match.speared
     {id,seat}); the MOCK refunds once a strict majority of the live human fighters agree (pushes stands.refund to the
     holder). The real server has no such route yet (see the v0.82 report).
   • SCULPTED ONLINE TOKENS: an online gladiator's board token is a figure + sculpt shapes, drawn as a figure for every viewer
     whatever their token style (CPU seats and beasts keep the viewer's style). Stored flat in look.token (ONLC.cleanLook keeps
     only flat short values): sc:'1', the parts, and l0…l15 = one shape each "shape,x,y,w,h,rot,rrggbb,opacity%,flags".
     No weapon, no shield, no armor: bodies tunic/bare/robe/rags, cloth headgear only; optional padded lower arms
     (bracers) / padded lower legs (wraps). Old gladiators convert on the fly from their portrait + token parts, and are
     saved once (char.edit, localStorage flavius_onlsc82). The bench = the Studio sculptor (31-sculpt, kind 'onl').
   • THE ONLINE CREATOR: a random starting class (Math.random, never the dice), 📜 Roll everything, an epithet and a
     birthplace (look.portrait.nick / .home), the full look maker with the accessories (earring, neck, face, backdrop),
     the sculpted board token beside the mini. My Gladiators gets the same accessories, details and token bench.
   ===================================================================== */

/* =========================== THE STANDS' GROUP TURN =========================== */
const STD82={pend:null,closeT:0,fallT:0,mine:new Set(),pop:null,popT:0,applied:0};
const st82Code=e=>(e&&e.code)||(/already chose/i.test((e&&e.message)||'')?'stands_twice':/no stands|nobody holds/i.test((e&&e.message)||'')?'no_stands':'');
/* the ticket holders still in the stands (a dropped holder is no longer human; a speared one is gone) */
function st82Holders(){return (S.spect||[]).filter(s=>s.human&&!s.gone&&s.onlIdx!=null&&ONLM.owners[s.onlIdx]&&!(ONLM.left&&ONLM.left[s.onlIdx]!=null))}
const st82Fighter=()=>ONLM.me>=0&&ONLM.me<onlmFighters()&&!(S.onl&&S.onl.watch);
{const base=humanSpectatorTurn;humanSpectatorTurn=async function(me){
  if(!(onlmOn()&&S.onl))return base.apply(this,arguments);
  if(S.snap)return;if(S.onl.standsOff||S.ri>0)return; /* v0.79: the stands act in round 1 only, never when the host closed them */
  if(!st82Holders().length)return;
  const G=S;const rot=S.st82n=(S.st82n|0)+1;
  const inp=await new Promise(res=>{STD82.pend={rot,res,at:Date.now()};st82Open(rot);st82Banner();setTimeout(onlmPump,30)});
  STD82.pend=null;clearTimeout(STD82.closeT);clearTimeout(STD82.fallT);st82Banner();st82PopClose();
  if(G!==S||!S||S.over)return;
  if(inp&&inp.k==='stands.result'){STD82.applied++;await st82Apply(inp)}
  else log(_T('🎟 The stands sit this rotation out.'),'thought');
  render()}}
function st82Open(rot){const id=S.onl.lobby;
  if(S.onl.host&&st82Fighter()){NET.req('match.stands.open',{id,rot}).then(()=>{STD82.closeT=setTimeout(()=>{NET.req('match.stands.close',{id,rot}).catch(()=>{})},ONLC.STANDS_MS)})
    .catch(e=>{if(st82Code(e)==='stands_twice')return;st82Skip(rot)})}
  else if(st82Fighter()){STD82.fallT=setTimeout(()=>{if(!STD82.pend||STD82.pend.rot!==rot||!onlmOn())return;
    NET.req('match.stands.close',{id,rot}).catch(e=>{if(/no stands window/i.test((e&&e.message)||''))st82Skip(rot)})},ONLC.STANDS_MS+7000)}}
/* a skip goes into the ordered stream like any move (no hash: a late duplicate is simply consumed) */
function st82Skip(rot){if(!onlmOn()||ONLM.me<0)return;const inp={k:'stands.skip',rot,seat:ONLM.me};
  NET.req('match.input',{id:S.onl.lobby,in:inp}).then(r=>{if(!r||!Number.isInteger(r.seq))return;STD82.mine.add(r.seq);ONLM.own.delete(r.seq);
    if(r.seq>=ONLM.next&&!ONLM.q.some(x=>x.seq===r.seq)){ONLM.q.push({...inp,from:'self82',seq:r.seq});ONLM.q.sort((a,b)=>a.seq-b.seq)}onlmPump()}).catch(()=>{})}
/* the mock echoes my own skip back: it is queued like anyone else's (113 would otherwise count it as already applied) */
{const base=NET.emit;NET.emit=function(t,d){if(t==='match.input'&&d&&d.in&&d.in.k==='stands.skip'&&ONL.acct&&d.in.from===ONL.acct.id){STD82.mine.add(d.in.seq);d={...d,in:{...d.in,from:'self82'}}}return base.call(this,t,d)}}
{const base=onlmPump;onlmPump=function(){for(const q of STD82.mine)ONLM.own.delete(q);return base.apply(this,arguments)}}
{const base=onlmReady;onlmReady=function(inp){if(inp&&(inp.k==='stands.result'||inp.k==='stands.skip')){if(!S||S.over)return false;
    const P=STD82.pend;return P?(inp.rot|0)<=P.rot:(inp.rot|0)<=(S.st82n|0)}return base.apply(this,arguments)}}
{const base=onlmApply;onlmApply=function(inp){if(inp&&(inp.k==='stands.result'||inp.k==='stands.skip')){const P=STD82.pend;
    const ok=P&&(inp.rot|0)===P.rot&&(inp.k==='stands.result'?inp.from==='server':(inp.seat|0)<onlmFighters());if(ok){STD82.pend=null;P.res(inp)}setTimeout(onlmPump,30);return}
  return base.apply(this,arguments)}}
/* no snapshot while the stands are choosing (a loaded client could not rejoin the wait) */
{const base=onlmSettled;onlmSettled=function(){return !STD82.pend&&base.apply(this,arguments)}}
/* nothing slips into the stream while the stands choose */
{const base=onTile;onTile=function(){if(STD82.pend&&onlmOn()&&!ONLM.replay)return;return base.apply(this,arguments)}}
window.addEventListener('click',e=>{if(!STD82.pend||!onlmOn()||!e.isTrusted)return;const t=e.target;if(!t||!t.closest||t.closest('#st82Pop'))return;
  if(t.closest('[data-act]')&&!/^m-/.test(t.closest('[data-act]').dataset.act)||t.tagName==='CANVAS'){e.preventDefault();e.stopImmediatePropagation()}},true);

/* ---------------- the banner everyone sees, the popup only the ticket holder sees ---------------- */
function st82Banner(){let el=document.getElementById('st82Wait');const P=STD82.pend;const on=!!(P&&onlmOn());
  if(!on){if(el)el.hidden=true;clearInterval(STD82.bT);STD82.bT=0;return}
  if(!el){el=document.createElement('div');el.id='st82Wait';document.body.appendChild(el)}
  const tick=()=>{const P2=STD82.pend;if(!P2||!onlmOn()){el.hidden=true;clearInterval(STD82.bT);STD82.bT=0;return}const s=Math.max(0,Math.ceil((ONLC.STANDS_MS-(Date.now()-P2.at))/1000));
    el.innerHTML=_T`🎟 The stands are choosing… <b>${s}s</b>`;el.hidden=!!document.getElementById('st82Pop');const w=document.getElementById('onlWait');if(w)w.hidden=true};
  tick();if(!STD82.bT)STD82.bT=setInterval(tick,250)}
{const base=onlmWaitShow;onlmWaitShow=function(){const r=base.apply(this,arguments);if(STD82.pend)setTimeout(()=>{if(STD82.pend){const w=document.getElementById('onlWait');if(w)w.hidden=true}},120);return r}}
function st82PopClose(){clearInterval(STD82.popT);STD82.popT=0;const o=document.getElementById('st82Pop');if(o)o.remove();STD82.pop=null;const b=document.getElementById('st82Wait');if(b&&STD82.pend)b.hidden=false}
NET.on('stands.window',d=>{try{if(!d||!S||!S.onl||d.id!==S.onl.lobby||!ONL.acct)return;if(d.seat!==ONLM.me)return;st82Popup(d)}catch(e){console.error(e)}});
function st82Pick(d,pick){const P=STD82.pop;if(!P||P.sent)return;P.sent=1;const o=document.getElementById('st82Pop');if(o)for(const b of o.querySelectorAll('button,select'))b.disabled=true;
  const msg=o&&o.querySelector('.st82msg');if(msg)msg.textContent=pick.a==='pass'?_T('You watch this rotation.'):_T('✓ Your choice is in — the stands throw together.');
  NET.req('match.stands.pick',{id:d.id,rot:d.rot,pick}).then(()=>{setTimeout(st82PopClose,pick.a==='pass'?600:1400)}).catch(e=>{if(msg)msg.textContent='⚠ '+(e.message||_T('The stands have chosen.'));setTimeout(st82PopClose,1800)})}
function st82Popup(d){st82PopClose();const s=(S.spect||[]).find(x=>x.onlIdx===d.seat);
  STD82.pop={rot:d.rot,sent:0,d};if(!s||s.gone||!s.human){st82Pick(d,{a:'pass'});return}
  const q=SECTIONS[s.sec].q;const act=activePlayers();const inQ=act.filter(p=>!p.underground&&quadOf(p)===q);
  const tholoOK=!bossSpent(_T('Tholo'))&&!EV().noBoss&&!EV().noTholo&&!isChariot()&&!isNaum();
  const btn=(pick,label,sub,dis)=>`<button type="button" class="st82b" data-st82='${esc(JSON.stringify(pick))}' ${dis?'disabled':''}><b>${label}</b>${sub?`<small>${sub}</small>`:''}</button>`;
  const rows=[...inQ.filter(p=>p.id!==s.fav).map(p=>btn({a:'stone',r:p.r,c:p.c},_T`🪨 Stone at ${esc(p.name)}`,_T`2 CF · lands on ${tl(p.r,p.c)} — whoever stands there then is hit`,s.cf<2)),
    ...inQ.map(p=>btn({a:'offer',r:p.r,c:p.c},_T`🎁 Offering to ${esc(p.name)}`,_T`8 CF · falls on ${tl(p.r,p.c)} — whoever stands there gets it`,s.cf<8)),
    tholoOK?btn({a:'tholo'},_T('📣 Chant “Tholo!”'),_T('3 CF · every quadrant must join (other ticket holders, or the crowd)'),s.cf<3):'',
    ...act.map(p=>btn({a:'cheer',v:p.id},_T`👏 Cheer for ${esc(p.name)}`,'free',false)),
    btn({a:'pass'},_T('👁 Watch this rotation'),'',false)].filter(Boolean).join('');
  const secs=SECTIONS.map((x,i)=>i).filter(i=>i!==s.sec).map(i=>`<option value="${i}">${esc(SECTIONS[i].n)} (Q${SECTIONS[i].q})</option>`).join('');
  const o=document.createElement('div');o.id='st82Pop';o.setAttribute('role','dialog');o.setAttribute('aria-label',_T('Your turn in the stands'));
  o.innerHTML=`<div class="st82hd">${_T`🎟 Your turn in the stands`} <span class="st82t" id="st82T">20s</span></div>
    <div class="st82sub">${_T`${esc(s.name)} · <b>${s.cf} CF</b> · ${esc(SECTIONS[s.sec].n)} (Q${q}) · one action · only you see this`}</div>
    <div class="st82list">${rows}</div>
    <div class="st82mv"><select class="tin" id="st82Sec" ${s.cf<3?'disabled':''}>${secs}</select><button type="button" class="btn tksm" id="st82Move" ${s.cf<3?'disabled':''}>${_T`🚶 Change section · 3 CF`}</button></div>
    <div class="st82msg rc-sub">${inQ.length?_T('Stones and offerings are locked to the tile you pick.'):_T`No gladiator stands in Q${q} — cheer, chant or move.`}</div>`;
  document.body.appendChild(o);const bw=document.getElementById('st82Wait');if(bw)bw.hidden=true;
  o.addEventListener('click',e=>{const b=e.target.closest('[data-st82]');if(b&&!b.disabled){st82Pick(d,JSON.parse(b.dataset.st82));return}
    if(e.target.closest('#st82Move')){const v=+document.getElementById('st82Sec').value;if(Number.isInteger(v))st82Pick(d,{a:'move',sec:v})}});
  const end=Date.now()+Math.max(1000,Math.min(ONLC.STANDS_MS,(d.until||0)-Date.now()||ONLC.STANDS_MS))-400;
  STD82.popT=setInterval(()=>{const left=Math.max(0,Math.ceil((end-Date.now())/1000));const t=document.getElementById('st82T');if(t)t.textContent=left+'s';
    if(left<=0){if(STD82.pop&&!STD82.pop.sent){const m=o.querySelector('.st82msg');if(m)m.textContent=_T('⏳ Time — you watch this rotation.')}setTimeout(st82PopClose,700);clearInterval(STD82.popT)}},250)}

/* ---------------- applying the stands' choices (the same on every client) ---------------- */
async function st82Apply(inp){const picks=(inp.picks||[]).slice().sort((a,b)=>a.seat-b.seat);const chant=[];
  if(picks.some(x=>x.pick&&x.pick.a!=='pass'))log(_T('🎟 The stands act together.'),'thought');
  for(const {seat,pick} of picks){if(!S||S.over)return;const s=(S.spect||[]).find(x=>x.onlIdx===seat);if(!s||s.gone||!s.human||!pick)continue;
    const me=seat===ONLM.me;const who=me?_T('You'):`<b>${esc(s.name)}</b>`;const v=(a,b)=>me?a:b; /* v0.87: the verb pair is translated too (you hurl / he hurls), so the line reads in every language */const prev=ONLM.specName;ONLM.specName=me?null:s.name;
    try{const a=pick.a;const r=pick.r|0,c=pick.c|0;
      if(a==='stone'){if(s.cf<2){log(_T`${who} ${v(_T('cannot'),_T('cannot'))} afford a stone (2 CF).`);continue}s.cf-=2;const q=playerAt(r,c);
        if(q&&!q.underground)await spectStone(s,q);
        else{S.stonesThrown=(S.stonesThrown||0)+1;emote(s,'🪨','');const n=npcAt(r,c);log(_T`${who} ${v(_T('hurl'),_T('hurls'))} a stone at ${tl(r,c)} — ${n?_T`it bounces off ${nm(n)}`:_T('it lands on empty sand')}.`);slog(_T`<b>${esc(s.name)}</b>'s stone lands on ${n?_T('a beast'):_T('empty sand')} at ${tl(r,c)}.`)}}
      else if(a==='offer'){if(s.cf<8){log(_T`${who} cannot afford an offering (8 CF).`);continue}s.cf-=8;const off=drawOffer();const O=OFFER[off]||{n:off,s:''};const q=playerAt(r,c);emote(s,'🎁','');
        if(q&&!q.underground){q.items.push(mkOffer(off));stat(q,'spectOffers');stat(q,'spectVal',OFFER_VAL[off]||4);log(_T`${who} ${v(_T('throw'),_T('throws'))} an offering onto ${tl(r,c)}: <b>${O.n}</b> (${O.s}) — ${nm(q)} catches it.`);slog(_T`<b>${esc(s.name)}</b> pays 8 CF: an offering lands at ${esc(q.name)}'s feet — ${O.n}.`,'big')}
        else if(inB(r,c)){placeFloor('offer',off,r,c);const n=npcAt(r,c);log(_T`${who} ${v(_T('throw'),_T('throws'))} an offering onto ${tl(r,c)}: <b>${O.n}</b> (${O.s})${n?_T` — it lies under ${nm(n)}`:typeof spikeAt==='function'&&spikeAt(r,c)?_T(' — it falls into the spikes'):_T(' — it lies on the sand')}.`);slog(_T`<b>${esc(s.name)}</b>'s offering lands on ${tl(r,c)}.`)}
        try{fx(r,c,'✦','#f0cf7d',{big:1})}catch(e){}}
      else if(a==='move'){const to=pick.sec|0;if(to<0||to>=SECTIONS.length||to===s.sec)continue;if(s.cf<3){log(_T`${who} cannot afford to change section (3 CF).`);continue}
        s.cf-=3;log(_T`${who} ${v(_T('move'),_T('moves'))} from ${SECTIONS[s.sec].n} to ${SECTIONS[to].n}.`);s.sec=to;emote(s,'🚶','')}
      else if(a==='cheer'){const p=S.players[pick.v|0];if(!p||!p.alive||p.exited)continue;s.fav=p.id;s.favCls=p.cls;emote(s,'📣','');log(_T`${who} ${v(_T('cheer'),_T('cheers'))} for ${nm(p)}.`);slog(_T`<b>${esc(s.name)}</b> cheers for ${esc(p.name)}.`)}
      else if(a==='tholo')chant.push(s)}
    finally{ONLM.specName=prev}}
  if(chant.length&&S&&!S.over)st82Tholo(chant)}
function st82Tholo(chant){const names=chant.map(s=>s.onlIdx===ONLM.me?'you':esc(s.name)).join(', ');
  if(bossSpent(_T('Tholo'))||EV().noBoss||EV().noTholo||isChariot()||isNaum()){log(_T`The chant for Tholo (${names}) goes unanswered — he does not come to this event.`);return}
  const pay={};for(const s of chant)if(s.cf>=3){const q=SECTIONS[s.sec].q;if(!pay[q])pay[q]=s}
  if(!Object.keys(pay).length){log(_T`The chant for Tholo (${names}) needs 3 CF a voice.`);return}
  for(const s of S.spect)if(!s.gone&&!s.human&&s.cf>=3){const q=SECTIONS[s.sec].q;if(!pay[q]||(!pay[q].human&&s.cf>pay[q].cf))pay[q]=s}
  if(Object.keys(pay).length<4){log(_T`The chant for Tholo (${names}) dies out — not every quadrant joins in.`);return}
  const ps=Object.values(pay);for(const s of ps){s.cf-=3;emote(s,'📣',_T('Tholo!'))}
  log(_T`Spectators in every quadrant (${ps.map(s=>s.onlIdx===ONLM.me?'you':esc(s.name)).join(', ')}) pay 3 CF each and chant “Tholo! Tholo!”`,'big');
  slog(_T`<b>${ps.map(s=>esc(s.name)).join(', ')}</b> pay 3 CF each and chant for Tholo.`,'big');spawnNPC('tholo',_T('Tholo'),S.ri<2?[6,6]:null);crowdReact('boss',{n:'Tholo'})}

/* =========================== THE SPEAR REFUND =========================== */
function st82Ticket(){const L=(ONL.lobbies||[]).find(x=>S&&S.onl&&x.id===S.onl.lobby);return (S.onl&&S.onl.ticket)||(L&&L.ticket)||0}
{const base=doSpear;doSpear=async function(p,s){const was=!!(s&&s.gone);const r=await base.apply(this,arguments);
  try{if(s&&!was&&s.gone&&s.onlIdx!=null&&s.ticket&&S&&S.onl)st82Refund(s)}catch(e){console.error(e)}return r}}
function st82Refund(s){log(_T('Flavius refunds the ticket — he hates to see his spectators speared.'),'big');s.refund82=1;
  if(s.onlIdx===ONLM.me&&typeof mToast==='function'){const n=st82Ticket();mToast(_T`🎟 Speared! Flavius refunds your ticket${n?_T` (${n} coin)`:''}. Your wager stands — keep watching.`)}
  if(st82Fighter())NET.req('match.speared',{id:S.onl.lobby,seat:s.onlIdx}).catch(()=>{})}
NET.on('stands.refund',d=>{try{if(!d||!ONL.acct)return;if(ONL.char&&d.amt)ONL.char.wallet=(ONL.char.wallet|0)+(d.amt|0);STD82.refunded=(STD82.refunded|0)+(d.amt|0)}catch(e){}});
/* the ticket price rides with the match (the room row may be gone by the time someone is speared) */
{const base=startEvent;startEvent=function(cfg){const r=base.apply(this,arguments);try{if(cfg&&cfg.onl&&S&&S.onl){const L=(ONL.lobbies||[]).find(x=>x.id===cfg.onl.lobby);if(L&&L.ticket)S.onl.ticket=L.ticket}}catch(e){}return r}}

/* ---------------- MOCK: the stands routes (as server/src/routes.js) + the refund (not on the server yet) ---------------- */
function st82Fail(code,msg){const e=new Error(msg);e.code=code;return e}
function mockStands82Close(w,id,M,L,rot){const W=M.stw[rot];if(!W||!W.open)return null;W.open=false;
  const picks=Object.values(W.picks).sort((a,b)=>a.seat-b.seat);const got=new Set(Object.keys(W.picks));
  const missed=W.holders.filter(a=>!got.has(a)).map(a=>mockSeat(L,a)).sort((a,b)=>a-b);
  const inp={k:'stands.result',rot,picks,missed,from:'server',seq:M.inputs.length};M.inputs.push(inp);mockPush('match.input',{id,in:inp});return inp}
const mockLive82=(L,M)=>L.players.filter(p=>!/^bot/.test(p.id)&&!(M.dropped||{})[p.id]&&!(M.abandoned||{})[p.id]).map(p=>p.id);
Object.assign(MOCK_ROUTES,{
  'match.stands.open':(w,d,me)=>{const L=w.lobbies[d.id],M=w.matches[d.id];if(!L||!M)throw new Error(_T('No such match.'));if(L.host.id!==me)throw new Error(_T('Only the host opens the stands.'));
    if(L.status!=='live'||M.status==='done')throw new Error(_T('The match is not live.'));if(L.standsOff)throw st82Fail('no_stands',_T('This game has no stands.'));const rot=d.rot|0;if(rot<0)throw new Error(_T('Which rotation?'));
    const holders=ONLC.standsHolders({stands:L.stands,players:L.players,dropped:M.dropped,abandoned:M.abandoned}); /* v0.87: never a fighter */if(!holders.length)throw st82Fail('no_stands',_T('Nobody holds a ticket.'));
    M.stw=M.stw||{};if(M.stw[rot])throw st82Fail('stands_twice',_T('The stands already chose this rotation.'));const at=mockNow();M.stw[rot]={open:true,at,holders,picks:{}};const until=at+ONLC.STANDS_MS;
    for(const a of holders)mockTo([a],'stands.window',{id:d.id,rot,until,seat:mockSeat(L,a)});return {rot,until,holders:holders.map(a=>mockSeat(L,a))}},
  'match.stands.pick':(w,d,me)=>{const L=w.lobbies[d.id],M=w.matches[d.id];if(!L||!M)throw new Error(_T('No such match.'));if((L.players||[]).some(p=>p.id===me))throw new Error(_T(ONLC.FELL_WATCH));const rot=d.rot|0;const W=(M.stw||{})[rot];
    if(!W||!W.open)throw st82Fail('stands_closed',_T('The stands have chosen — wait for the next rotation.'));if(!W.holders.includes(me))throw new Error(_T('Only ticket holders choose from the stands.'));
    const why=ONLC.standsPickOK(d.pick);if(why)throw new Error(why);if(W.picks[me])throw st82Fail('stands_twice',_T('You already chose this rotation.'));
    W.picks[me]={seat:mockSeat(L,me),pick:ONLC.cleanPick(d.pick)};const closed=Object.keys(W.picks).length>=W.holders.length?mockStands82Close(w,d.id,M,L,rot):null;
    return {rot,ok:true,...(closed?{closed:true,seq:closed.seq}:{})}},
  'match.stands.close':(w,d,me)=>{const L=w.lobbies[d.id],M=w.matches[d.id];if(!L||!M)throw new Error(_T('No such match.'));const rot=d.rot|0;const W=(M.stw||{})[rot];if(!W)throw new Error(_T('No stands window for that rotation.'));
    if(L.host.id!==me){if(!mockLive82(L,M).includes(me))throw new Error(_T('Only the host closes the stands.'));if(mockNow()-W.at<ONLC.STANDS_MS+5000)throw new Error(_T('The stands are still choosing.'))}
    const inp=W.open?mockStands82Close(w,d.id,M,L,rot):null;return inp?{closed:true,seq:inp.seq}:{closed:false}},
  /* a ticket holder speared: refunded once a strict majority of the live human fighters report it (a lone human is believed) */
  'match.speared':(w,d,me)=>{const L=w.lobbies[d.id],M=w.matches[d.id];if(!L||!M)throw new Error(_T('No such match.'));if(L.status!=='live')throw new Error(_T('The match is not live.'));
    const live=mockLive82(L,M);if(!live.includes(me))throw new Error(_T('Only the fighters report a spearing.'));const k=(d.seat|0)-L.seats;const t=(L.stands||[])[k];if(!t)throw new Error(_T('No such ticket holder.'));
    M.spr=M.spr||{};const R=M.spr[k]=M.spr[k]||{by:{},done:0};R.by[me]=1;if(R.done)return {refunded:true,amt:0};
    if(Object.keys(R.by).filter(a=>live.includes(a)).length*2<=live.length)return {refunded:false};
    R.done=1;const amt=t.paid|0;if(amt>0){const c=onlMockChar(w,t.id);if(c)c.wallet+=amt;t.refunded=amt;t.paid=0;L.pot=Math.max(0,(L.pot|0)-amt)}
    mockTo([t.id],'stands.refund',{id:L.id,seat:d.seat|0,amt});return {refunded:true,amt}}});

/* =========================== SCULPTED ONLINE TOKENS =========================== */
const SC82_MAX=16,SC82_SH=SHAPES.map(s=>s[0]);
const SC82_OPT={body:[['tunic',_T('Tunic')],['bare','Bare-chested'],['robe',_T('Robe')],['rags',_T('Rags')]],helm:[['none',_T('Bare head')],['hood',_T('Hood')],['laurel',_T('Laurel wreath')],['crown',_T('Crown')]],
  hair:T_HAIRS,beard:T_BEARD,neck:T_NECK,face:T_FACE,arms:[['',_T('Bare arms')],['bracers',_T('Padded lower arms')]],legs:[['',_T('Bare legs')],['wraps',_T('Padded lower legs')]]};
const SC82_COL=['c1','c2','hairC','skin'];
const SC82_KEYS=[...Object.keys(SC82_OPT),...SC82_COL,'cape'];
for(const k of ['sc',...SC82_KEYS,...Array.from({length:SC82_MAX},(_,i)=>'l'+i)])if(!ONL_TOKKEYS.includes(k))ONL_TOKKEYS.push(k);
const sc82Hex=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
/* one shape → "shape,x,y,w,h,rot,rrggbb,opacity%,flags" (≤ 40 characters, what cleanLook keeps) */
function sc82Enc(L){const t=SC82_SH.indexOf(L&&L.t);if(t<0)return null;const n=v=>Math.round(+v||0);const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  let s=[t,cl(n(L.x),-60,160),cl(n(L.y),-60,230),cl(n(L.w||12),2,99),cl(n(L.h||12),2,99),n(L.r)%360,sc82Hex(L.c)?L.c.slice(1).toLowerCase():'e6b93a',cl(Math.round((L.o??1)*100),5,100),(L.st?'s':'')+(L.cut?'x':'')].join(',');
  if(s.length>40)s=s.replace(/,[sx]*$/,',');return s.length<=40?s:null}
function sc82Dec(s){if(typeof s!=='string')return null;const a=s.split(',');if(a.length<8)return null;const t=SC82_SH[+a[0]];if(!t)return null;const f=i=>isFinite(+a[i])?+a[i]:0;
  const L={t,x:f(1),y:f(2),w:f(3)||12,h:f(4)||12,r:f(5),c:/^[0-9a-f]{6}$/i.test(a[6])?'#'+a[6]:'#e6b93a',o:Math.max(0.05,Math.min(1,(f(7)||100)/100))};if(/s/.test(a[8]||''))L.st='#1a120c';if(/x/.test(a[8]||''))L.cut=1;return L}
const sc82In=(k,v)=>SC82_OPT[k].some(o=>o[0]===(v??''));
/* the board figure of an online gladiator: its sculpted token, or one made from its portrait and old token parts */
function sc82Spec(cls,look){look=look||{};const t=look.token||{};const pt=look.portrait||{};const C=CLASSES[cls]||{};const o={kind:'human'};
  if(t.sc){for(const k of SC82_KEYS)if(t[k]!=null&&t[k]!=='')o[k]=t[k]}
  else{const src=(typeof onlTokenOf==='function'&&onlTokenOf(cls,look))||{...(TOKEN_DEF[cls]||{})};
    Object.assign(o,{body:src.body,helm:src.helm,hair:src.hair||(pt.hs==='long'||pt.long||pt.fem?'long':''),beard:src.beard||(pt.bs&&pt.bs!=='none'||pt.beard?'full':''),
      hairC:src.hairC||(sc82Hex(pt.hair)?pt.hair:undefined),skin:src.skin||(sc82Hex(pt.skin)?pt.skin:undefined),c1:src.c1||look.color,c2:src.c2,cape:!!src.cape,neck:src.neck||'',face:src.face||'',
      arms:src.arms==='bracers'?'bracers':'',legs:src.legs==='wraps'?'wraps':''})}
  for(const k of Object.keys(SC82_OPT))if(!sc82In(k,o[k]))o[k]=k==='body'?'tunic':k==='helm'?'none':'';
  for(const k of SC82_COL)if(!sc82Hex(o[k]))delete o[k];if(!o.c1)o.c1=sc82Hex(look.color)?look.color:(C.color||'#a3281f');if(!o.c2)o.c2='#d6ab4c';
  o.cape=o.cape===true||o.cape==='1'||o.cape===1;o.weapon='none';o.shield='none';
  const lays=[];for(let i=0;i<SC82_MAX;i++){const L=sc82Dec(t['l'+i]);if(L)lays.push(L)}o.baked=lays;o.layers=[];return o}
/* the flat form for look.token (shapes beyond the 3 KB look budget are left off) */
function sc82Flat(spec,look){const o={sc:'1'};for(const k of SC82_KEYS){const v=spec[k];if(v==null||v==='')continue;if(k==='cape'){if(v)o.cape=true;continue}o[k]=v}
  const all=[...(spec.baked||[]),...(spec.layers||[])].map(sc82Enc).filter(Boolean).slice(0,SC82_MAX);
  const rest={...(look||{})};delete rest.token;let n=all.length;
  for(;;){const tok={...o};all.slice(0,n).forEach((s,i)=>{tok['l'+i]=s});if(n===0||JSON.stringify({...rest,token:tok}).length<=2900){if(n<all.length)SC82.cut=all.length-n;return tok}n--}}
const SC82={cur:null,cut:0,drag:null};
/* the editing copy: kind 'onl' of the Studio sculptor works on SC82.cur.spec */
function sc82Ensure(key,lookFn,cls){const lk=lookFn();if(!lk)return null;
  if(!SC82.cur||SC82.cur.key!==key){SC82.cur={key,look:lookFn,cls,spec:sc82Spec(cls,lk),touched:!!(lk.token&&lk.token.sc)};ST.scbSel=ST.scbSel||{};SCB.hist.onl=[];SCB.redo.onl=[]}
  else{SC82.cur.look=lookFn;if(SC82.cur.cls!==cls){SC82.cur.cls=cls;if(!SC82.cur.touched){const keep=SC82.cur.spec;const sp=sc82Spec(cls,{...lk,token:null});sp.baked=keep.baked;sp.layers=keep.layers;SC82.cur.spec=sp}}}
  if(!lk.token||!lk.token.sc)sc82Sync(true);return SC82.cur}
function sc82Sync(quiet){const C=SC82.cur;if(!C)return;const lk=C.look();if(!lk)return;lk.token=sc82Flat(C.spec,lk);if(!quiet){C.touched=true;if(ONL.ged&&C.key==='g:'+ONL.ged.id)ONL.ged.dirty=true}}
function sc82Refresh(){sc82Sync();const C=SC82.cur;if(!C)return;const pv=document.getElementById('onlScPrev');if(pv)pv.innerHTML=figureHTML(C.spec,190,null,{selLayer:scbSelGet('onl')});
  const g=document.getElementById('onlGTok');if(g)g.innerHTML=figureHTML(C.spec,120);const c=document.getElementById('onlCTok');if(c)c.innerHTML=figureHTML(C.spec,120)}
SCB_KIND.onl={obj:()=>SC82.cur&&SC82.cur.spec,vb:[100,170],add:{x:50,y:96},el:()=>document.querySelector('#onlScPrev svg'),refresh:()=>sc82Refresh()};
function sc82SectionHTML(noHead){const C=SC82.cur;if(!C)return '';const sp=C.spec;
  const sel=(k,label)=>`<label>${label}<select class="tin" data-onlsc="${k}">${SC82_OPT[k].map(([v,l])=>`<option value="${esc2(v)}" ${String(sp[k]??'')===v?'selected':''}>${esc2(l)}</option>`).join('')}</select></label>`;
  const col=(k,label,def)=>`<label>${label}<input type="color" data-onlsc="${k}" value="${sc82Hex(sp[k])?sp[k]:def}"></label>`;
  return `${noHead?`<p class="rc-sub" style="margin:2px 0 6px">${_T`No weapons or armor on the token.`}</p>`:`<div class="sect">${_T`Board token`} <span class="rc-sub">${_T`sculpted — every lanista sees it, whatever their token style · no weapons or armor`}</span></div>`}
   <div class="onl-sc82"><div class="onl-sc82prev" id="onlScPrev" data-scbprev="onl" title="${_T`Drag a shape to move it`}">${figureHTML(sp,190,null,{selLayer:scbSelGet('onl')})}</div>
    <div class="formgrid onl-g2">${sel('body',_T('Body'))}${sel('helm',_T('Headgear'))}${sel('hair',_T('Hair'))}${sel('beard',_T('Beard'))}${sel('neck',_T('Neck'))}${sel('face',_T('Face'))}${sel('arms',_T('Arms'))}${sel('legs',_T('Legs'))}
     ${col('c1',_T('Main colour'),'#a3281f')}${col('c2',_T('Trim colour'),'#d6ab4c')}${col('hairC',_T('Hair colour'),'#3a2616')}${col('skin',_T('Skin'),'#e0ac7e')}
     <label class="chk" style="align-self:end"><input type="checkbox" data-onlsc="cape" ${sp.cape?'checked':''}> ${_T`Cape`}</label>
     <div class="mbtns" style="grid-column:1/-1;margin:0"><button type="button" class="btn tksm" data-onl82="tokroll">${_T`🎲 Random token`}</button><button type="button" class="btn tksm" data-onl82="tokclass">${_T`↺ From the class`}</button></div></div></div>
   <details class="onl-sc82b" ${SC82.open?'open':''}><summary>${_T`✏️ Sculpt shapes`} <span class="rc-sub">${(sp.baked||[]).length+(sp.layers||[]).length}/${SC82_MAX}</span></summary>${scbBenchHTML('onl',{inGrid:false})}</details>`}
function sc82Rand(cls){const r=a=>a[Math.floor(Math.random()*a.length)];const pal=['#a3281f','#3f8f3a','#3a5fb0','#c9a03a','#6a3a8a','#b04a3a','#2f7f7a','#8a9098','#d4b13c','#5a3a22'];
  return {body:r(SC82_OPT.body)[0],helm:r(SC82_OPT.helm)[0],hair:r(SC82_OPT.hair)[0],beard:r(SC82_OPT.beard)[0],neck:Math.random()<.4?r(SC82_OPT.neck)[0]:'',face:Math.random()<.3?r(SC82_OPT.face)[0]:'',
    arms:Math.random()<.35?'bracers':'',legs:Math.random()<.35?'wraps':'',c1:r(pal),c2:r(['#d6ab4c','#e8dcc0','#c9a458','#8a5a20','#e6b93a']),hairC:r(['#3a2616','#1a120c','#6a4424','#a86a2a','#d8c08a','#8a8a8a']),
    skin:r(typeof TOKEN_SKINS!=='undefined'?TOKEN_SKINS:['#e0ac7e']),cape:Math.random()<.3}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#onl [data-scb][data-k="onl"],#onl [data-onl82]');if(!b)return;
  if(b.dataset.scb!=null){e.stopPropagation();SC82.open=1;const before=JSON.stringify([SC82.cur&&SC82.cur.spec.baked,SC82.cur&&SC82.cur.spec.layers]);
    scbClick(b,()=>{if(SC82.cur){const L=SC82.cur.spec;if((L.baked||[]).length+(L.layers||[]).length>SC82_MAX){L.layers.splice(SC82_MAX-(L.baked||[]).length);if(typeof mToast==='function')mToast(_T`Up to ${SC82_MAX} shapes on an online token.`)}}
      sc82Sync(JSON.stringify([SC82.cur&&SC82.cur.spec.baked,SC82.cur&&SC82.cur.spec.layers])===before);onlRedraw()});return}
  const a=b.dataset.onl82;const C=SC82.cur;
  if(a==='tokroll'&&C){Object.assign(C.spec,sc82Rand(C.cls));sc82Sync();onlRedraw();return}
  if(a==='tokclass'&&C){const keep=C.spec;const lk=C.look()||{};const sp=sc82Spec(C.cls,{...lk,token:null});sp.baked=keep.baked;sp.layers=keep.layers;C.spec=sp;sc82Sync();onlRedraw();return}});
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.closest||!t.closest('#onl')||t.dataset.onlsc==null)return;const C=SC82.cur;if(!C)return;const k=t.dataset.onlsc;
  C.spec[k]=t.type==='checkbox'?t.checked:t.value;sc82Refresh()},true);
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.closest||!t.closest('#onl'))return;
  if(t.dataset.onlsc!=null&&t.type==='color'&&SC82.cur){SC82.cur.spec[t.dataset.onlsc]=t.value;sc82Refresh();return}
  if(t.dataset.scbl&&t.dataset.k==='onl'){e.stopPropagation();scbInput(t)}},true);
/* drag a shape on the preview (the Studio's own wiring is per designer box) */
document.addEventListener('pointerdown',e=>{const host=e.target.closest&&e.target.closest('#onl [data-scbprev="onl"]');const C=SC82.cur;if(!host||!C)return;const sp=C.spec;const Ls=sp.layers||[];if(!Ls.length)return;
  const sv=host.querySelector('svg');if(!sv)return;const R=sv.getBoundingClientRect();if(!R.width)return;const v=[(e.clientX-R.left)/R.width*100,(e.clientY-R.top)/R.height*170];
  let best=-1,bd=1e9;Ls.forEach((L,i)=>{if(L.hid||L.lk)return;const d=Math.hypot(L.x-v[0],L.y-v[1]);if(d<bd){bd=d;best=i}});if(best<0||bd>14)return;
  scbSnap('onl',sp);scbSelSet('onl',best);SC82.drag={i:best,dx:Ls[best].x-v[0],dy:Ls[best].y-v[1],sv:()=>document.querySelector('#onlScPrev svg')};sc82Refresh();e.preventDefault()});
window.addEventListener('pointermove',e=>{const D=SC82.drag;const C=SC82.cur;if(!D||!C)return;const sv=D.sv();if(!sv)return;const R=sv.getBoundingClientRect();const L=(C.spec.layers||[])[D.i];if(!L||!R.width)return;
  L.x=Math.round(((e.clientX-R.left)/R.width*100+D.dx)*10)/10;L.y=Math.round(((e.clientY-R.top)/R.height*170+D.dy)*10)/10;scbClamp('onl',L);sc82Refresh()});
window.addEventListener('pointerup',()=>{if(SC82.drag){SC82.drag=null;onlRedraw()}});

/* ---------------- in the arena: online gladiators wear their sculpted figure, whatever the viewer's token style ---------------- */
{const base=mkPlayer;mkPlayer=function(i,seat){const p=base.apply(this,arguments);try{if(seat&&seat.onl&&!seat.cpu&&seat.onl.id&&!/^bot/.test(seat.onl.id)){p._onlSc=sc82Spec(p.cls,seat.onl.look||{});p._onlTok=null}}catch(e){console.error(e)}return p}}
{const base=tokenForP;tokenForP=function(p){if(p&&p._onlSc){const sev={};let n=0;for(const l of ['rarm','larm','rleg','lleg'])if(p.hp&&p.hp[l]<=0){sev[l]=1;n++}return n?{...p._onlSc,sev}:p._onlSc}return base.apply(this,arguments)}}
{const base=drawPlayer;drawPlayer=function(p){if(p&&p._onlSc&&typeof SETTINGS!=='undefined'&&SETTINGS.tokenStyle!=='figure'){const keep=SETTINGS.tokenStyle;SETTINGS.tokenStyle='figure';try{return base.apply(this,arguments)}finally{SETTINGS.tokenStyle=keep}}return base.apply(this,arguments)}}
/* every online figure (stage, slots, rooms) is the sculpted one */
onlFig=function(cls,look,h){try{return figureHTML(sc82Spec(cls,look||{}),h)}catch(e){return onlMini(cls,h)}};
/* old gladiators: converted once (saved for everyone to see) */
{const base=onlRefresh;onlRefresh=async function(){const r=await base.apply(this,arguments);try{if(ONL.acct&&Array.isArray(ONL.chars)&&!(typeof onlBusy==='function'&&onlBusy())){let done=[];try{done=JSON.parse(localStorage.getItem('flavius_onlsc82')||'[]')||[]}catch(e){}
    for(const ch of ONL.chars.filter(c=>c.alive&&c.owner===ONL.acct.id&&!(c.look&&c.look.token&&c.look.token.sc)&&!done.includes(c.id)).slice(0,ONLC.GLAD_MAX)){done.push(ch.id);const lk={...(ch.look||{})};lk.token=sc82Flat(sc82Spec(ch.cls,lk),lk);
      NET.req('char.edit',{char:ch.id,look:lk}).then(()=>{ch.look=lk}).catch(()=>{})}
    try{localStorage.setItem('flavius_onlsc82',JSON.stringify(done.slice(-40)))}catch(e){}}}catch(e){console.error(e)}return r}}

/* =========================== MY GLADIATORS: details, accessories, the token bench =========================== */
const sc82Txt=v=>String(v||'').replace(/[<>"'`\\]/g,'').slice(0,40);
{const base=onlCharHTML;onlCharHTML=function(){let h=base.apply(this,arguments);const D=ONL.ged;if(!D||!h)return h;try{
    sc82Ensure('g:'+D.id,()=>ONL.ged&&ONL.ged.id===D.id?ONL.ged.look:null,D.cls);
    const a=h.indexOf('<div class="sect">Board token</div>'),b=h.indexOf('<div class="sect">Gear to bring');if(a>=0&&b>a)h=h.slice(0,a)+sc82SectionHTML()+h.slice(b);
    const p=D.look.portrait||{};const P=(path,label,opts,val)=>`<label>${label}${onlSel(path,opts,val,'data-onlgp')}</label>`;
    const more=P('portrait.neck',_T('Neck'),NECKS,p.neck||'')+P('portrait.face',_T('Face piece'),FACES,p.face||'')+P('portrait.bg',_T('Backdrop'),BGS.map((v,i)=>[v,BG_NAMES[i]||_T('Backdrop ')+(i+1)]),p.bg||'')
      +`<label>${_T`Epithet`}<input class="tin" data-onlgp="portrait.nick" maxlength="40" value="${esc2(p.nick||'')}" placeholder="${_T`e.g. the Iron Wall`}"></label>`+P('portrait.home',_T('Birthplace'),[['','—'],...HOME_CITIES().map(x=>[x,x])],p.home||'');
    const k=h.indexOf('<label>Colour<input type="color" data-onlgp="color"');if(k>=0)h=h.slice(0,k)+more+h.slice(k);
    h=h.replace('<div id="onlGTok" title="The board token">','<div id="onlGTok" title="The board token (sculpted)">')}catch(e){console.error(e)}return h}}

/* =========================== THE ONLINE CREATOR =========================== */
function sc82Safe(f){const keep=RNG;RNG=null;try{return f()}finally{RNG=keep}}
const sc82Cls=()=>ONLC.CLASSES8[Math.floor(Math.random()*ONLC.CLASSES8.length)];
function sc82Creating(){const fem=Math.random()<.35;const pt=typeof randomPortrait==='function'?randomPortrait(fem):{};
  pt.nick=sc82Txt(sc82Safe(()=>typeof genNickname==='function'?genNickname():''));const H=HOME_CITIES();pt.home=H[Math.floor(Math.random()*H.length)];
  return {name:sc82Safe(()=>typeof genName==='function'?genName({female:fem}):''),cls:sc82Cls(),look:{portrait:pt}}}
{const base=onlCreatorHTML;onlCreatorHTML=function(){if(!ONL.creating)ONL.creating=sc82Creating();const d=ONL.creating;d.look=d.look||{};if(!d.look.portrait)d.look.portrait=typeof randomPortrait==='function'?randomPortrait():{};
  sc82Ensure('c',()=>ONL.creating&&ONL.creating.look,d.cls);let h=base.apply(this,arguments);try{const C=SC82.cur;const p=d.look.portrait;
    const i=h.indexOf('<div class="onl-cname">');if(i>=0)h=h.slice(0,i)+`<div class="onl-ctok82" id="onlCTok" title="${_T`The board token`}">${figureHTML(C.spec,120)}</div>`+h.slice(i);
    const j=h.indexOf('<div class="rc-sub">',h.indexOf('<div class="onl-cname">'));if(j>=0)h=h.slice(0,j)+`<div class="onl-cnick82">${p.nick?`“${esc2(p.nick)}”`:''}${p.home?_T` · from ${esc2(p.home)}`:''}</div>`+h.slice(j);
    const det=`<div class="formgrid onl-g2 onl-cdet82"><label>${_T`Epithet`}<span style="display:flex;gap:4px"><input class="tin" data-onl82c="nick" maxlength="40" value="${esc2(p.nick||'')}"><button type="button" class="btn" data-onl82="nick" style="padding:4px 8px" aria-label="${_T`Roll an epithet`}">🎲</button></span></label>
      <label>${_T`Birthplace`}<select class="tin" data-onl82c="home">${[['','—'],...HOME_CITIES().map(x=>[x,x])].map(([v,l])=>`<option value="${esc2(v)}" ${p.home===v?'selected':''}>${esc2(l)}</option>`).join('')}</select></label></div>
      <div class="mbtns" style="margin:2px 0"><button type="button" class="btn" data-onl82="roll" title="${_T`Name, class, epithet, birthplace, look and token`}">${_T`📜 Roll everything`}</button></div>`;
    const k=h.indexOf('<div class="sect">Class</div>');if(k>=0)h=h.slice(0,k)+det+h.slice(k);
    const look=`<details class="onl-clook82"><summary class="sect">${_T`Look`} <span class="rc-sub">${_T`face, accessories, backdrop`}</span></summary>${portraitControlsHTML(p,'data-onl82p').replace('>Lanista (woman)<',_T('>Gladiatrix<')).replace('>Lanista<',_T('>Gladiator<'))}</details>
      <details class="onl-ctokd82" ${SC82.copen?'open':''}><summary class="sect">${_T`Board token`} <span class="rc-sub">${_T`sculpted · everyone sees it, whatever their token style`}</span></summary>${sc82SectionHTML(1)}</details>`;
    const m=h.lastIndexOf('<div class="mbtns"><button type="button" class="btn primary" data-onl="create">');if(m>=0)h=h.slice(0,m)+look+h.slice(m)}catch(e){console.error(e)}return h}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#onl [data-onl82="roll"],#onl [data-onl82="nick"],#onl .onl-ctokd82>summary');if(!b)return;
  if(b.tagName==='SUMMARY'){SC82.copen=!b.parentElement.open;return}const d=ONL.creating;if(!d)return;
  if(b.dataset.onl82==='nick'){d.look.portrait.nick=sc82Txt(sc82Safe(()=>genNickname()));onlRedraw();return}
  const n=sc82Creating();d.name=n.name;d.cls=n.cls;d.look={portrait:n.look.portrait};if(SC82.cur&&SC82.cur.key==='c'){SC82.cur.cls=d.cls;SC82.cur.touched=false;SC82.cur.spec=sc82Spec(d.cls,{portrait:n.look.portrait});Object.assign(SC82.cur.spec,sc82Rand(d.cls))}
  onlRedraw()},true);
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.closest||!t.closest('#onl'))return;const d=ONL.creating;if(!d)return;
  if(t.dataset.onl82c){d.look.portrait[t.dataset.onl82c]=sc82Txt(t.value);const n=document.querySelector('.onl-cnick82');if(n){const p=d.look.portrait;n.textContent=(p.nick?`“${p.nick}”`:'')+(p.home?_T` · from ${p.home}`:'')}return}
  if(t.dataset.onl82p){const f=t.dataset.onl82p;let v=t.value;if(f==='fem'||f==='smile')v=v==='1';const P=d.look.portrait;if(f==='bs')P.beard=false;if(f==='hs')P.long=false;if(f==='mark'){P.scar=false;P.paint=false}P[f]=v;
    const st=document.querySelector('.onl-cstage .portrait');if(st&&typeof portraitHTML==='function')st.outerHTML=portraitHTML({name:d.name,portrait:P,color:(CLASSES[d.cls]||{}).color},'lg')}},true);
document.addEventListener('input',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.onl82c==='nick'&&ONL.creating){ONL.creating.look.portrait.nick=sc82Txt(t.value)}},true);

{const st=document.createElement('style');st.textContent=`
#st82Wait{position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:61;padding:8px 16px;border-radius:999px;background:rgba(20,14,8,.92);border:1px solid var(--gold,#e8c96a);color:#f3e6c4;font-size:14px;pointer-events:none}
#st82Pop{position:fixed;right:16px;bottom:16px;z-index:9000;width:min(380px,calc(100vw - 32px));max-height:min(70vh,560px);display:flex;flex-direction:column;gap:6px;padding:12px;border-radius:12px;
  background:var(--panel,#1c140c);border:1px solid var(--gold,#e8c96a);box-shadow:0 10px 40px rgba(0,0,0,.55);color:var(--text,#f3e6c4)}
#st82Pop .st82hd{font-weight:700;display:flex;justify-content:space-between;align-items:center}#st82Pop .st82t{font-variant-numeric:tabular-nums;color:var(--gold,#e8c96a)}
#st82Pop .st82sub{font-size:12.5px;color:var(--dim,#bfae8c)}#st82Pop .st82list{display:grid;gap:4px;overflow-y:auto;min-height:0}
#st82Pop .st82b{display:grid;text-align:left;gap:1px;padding:6px 9px;border-radius:8px;border:1px solid var(--line,#5a4630);background:rgba(255,255,255,.04);color:inherit;cursor:pointer;font:inherit}
#st82Pop .st82b:hover:not(:disabled){border-color:var(--gold,#e8c96a)}#st82Pop .st82b:disabled{opacity:.45;cursor:default}#st82Pop .st82b small{color:var(--dim,#bfae8c);font-size:11.5px}
#st82Pop .st82mv{display:flex;gap:6px}#st82Pop .st82mv select{flex:1;min-width:0}#st82Pop .st82msg{min-height:1.2em}
@media (max-width:600px){#st82Pop{left:16px;right:16px;bottom:12px;width:auto}}
.onl-sc82{display:grid;grid-template-columns:minmax(0,130px) minmax(0,1fr);gap:10px;align-items:start}.onl-sc82prev{display:flex;justify-content:center;touch-action:none;cursor:grab;border-radius:10px;background:radial-gradient(circle at 50% 70%,rgba(232,201,106,.14),transparent 70%)}
.onl-sc82b>summary,.onl-clook82>summary,.onl-ctokd82>summary{cursor:pointer}.onl-ctok82{display:flex;justify-content:center}.onl-cnick82{font-style:italic;color:var(--dim,#bfae8c);font-size:13px}
@media (max-width:600px){.onl-sc82{grid-template-columns:1fr}}`;document.head.appendChild(st)}
