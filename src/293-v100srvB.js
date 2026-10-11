/* =====================================================================
   293-v100srvB · v1.0 SERVER BATCH B — the page side (his picks 2026-10-11: Ranked improvements 1–7, the online sidelining, Spectate → Lobby Browser)
   Shared rules = the "v1.0 SERVER BATCH B" section of 111-onlcore; the server = its block in server/src/routes.js; docs/backend.md "v1.0 server batch B".
   No protocol bump (every new request is optional; an older server just refuses it and the page carries on).
   =====================================================================
   1 RANKED MATCHMAKING: the hidden rating lives on the server only (Find me a fight prefers close ratings; Ranked seats are dealt at random at the
     horns). While my room waits with open seats the room head shows the queue estimate (queue.eta, ⏳ "≈ 1 min to fill" / "quiet hour — may take
     a while"), refreshed every 30 s while the room is on screen; lobby.quick's reply seeds it.
   2 RANKED WATCHERS ONE TURN BEHIND: the server holds their moves; the page skips the snapshot ask (replays what was released) and shows a chip
     "👁 Ranked · one turn behind". MOCK: the page holds pushed moves and lets them go on 'match.rel100' (the mock's turn clock).
   3 LEAVER MARK: the house card shows "⚠ Often leaves matches (N this week)"; a Ranked cooldown refusal reads as the server words it (ranked_cd).
      The house card also lists the Tituli the house holds (season awards — names only, no art yet).
   4 CONNECTION DOTS: one dot per seat in the turn panel (#tt100): green on · amber away · red gone · grey CPU; a ⌛ count when the seat timed out
     this match. match.conn100 every CONN100.POLL_MS while a live online match is on screen (a REAL timer; it asks only when visible + not idle).
   5 SEASON LEADERBOARD: an Online rail tab "🏆 Season" (season.board: the top 50 by Glory gained this season, my gladiators' lines, older seasons,
     the Tituli the season ends with). Guests read it.
   6 REPORT A PLAYER: 🚩 in the turn panel and in the after-match summary → a popup (player, reason, a short note) → match.report100 (once a match).
   7 AFTER-MATCH SUMMARY #as100 (non-modal card, bottom right): the outcome, Glory / coin / CF, rank up, the table, 🔗 the replay link (#replay=<id> —
     opening it says replays are coming soon), ⚔ Again (lobby.again), 🚩 Report.
   SIDELINING (3a): the turn clock starts at the OWNER's own report (match.clock 'own' — another screen's Speed never shortens it); a cosmetic reveal
     on my own turn (the chest, a spawn card, the market board) asks the server for its fixed credit (match.clock 'fx'); online the spawn card runs at
     one fixed length on every screen (nc82Ms), the clean-up show after the bout is skipped, and the CPU crowd never spends — only ticket holders act,
     in the stands' timed group turn (128). Tactics gains an "🌐 Online" page: what plays only offline. No "digital rules" label in rooms.
   SPECTATE → LOBBY BROWSER: the rail's Spectate tab is gone; the Lobby Browser has ⚔ Rooms · 👁 Live matches · 👥 Online now (287's list).
   Kill switch localStorage flavius_srvb100off=1 (the page parts; the server rules stay). Test tonl100b (mock, two windows); server v100b.test.js.
   ===================================================================== */
const B100_OFF=(()=>{try{return localStorage.getItem('flavius_srvb100off')==='1'}catch(e){return false}})();
const B100={eta:{},etaAt:{},conn:{},connAt:0,connId:null,ownSent:-1,fxN:{},hold:[],holdId:null,sb:null,sbAt:0,sbSeason:0,sum:null,noSnap:null};

/* ---------------- SPECTATE → LOBBY BROWSER ---------------- */
try{if(localStorage.getItem('flavius_onllb100')==='live'&&typeof WHO100!=='undefined')WHO100.lb='live'}catch(e){}
function b100LbSave(){try{localStorage.setItem('flavius_onllb100',WHO100.lb==='live'?'live':'')}catch(e){}}
if(!B100_OFF&&typeof who100TabsHTML==='function'){const base=who100TabsHTML;who100TabsHTML=function(){const h=base.apply(this,arguments);
  const live=(ONL.lobbies||[]).filter(L=>L&&L.status==='live').length;
  const b=`<button type="button" class="w100tab ${WHO100.lb==='live'?'on':''}" data-b100tab="live" aria-pressed="${WHO100.lb==='live'}">${_T('👁 Live matches')}${live?` · ${live}`:''}</button>`;
  let out=h.replace(/(<button type="button" class="w100tab[^"]*" data-w100tab="who")/,b+'$1');if(WHO100.lb==='live')out=out.replace(/(class="w100tab) on(" data-w100tab="rooms")/,'$1$2');return out}}
function b100LiveHTML(){let h='';try{h=onlSpectHTML()}catch(e){console.error(e)}
  h=h.replace(/<h3>[^<]*<\/h3>/,'').replace(/<p class="rc-sub">[\s\S]*?<\/p>/,`<p class="rc-sub b100note">${_T('Every match in progress. 👁 Watch for free, move by move — a Ranked match is shown one turn behind. 🎟 A ticket, bought before the horns, seats you in the stands.')}</p>`);
  h=h.replace(/(<h4 class="onl-h">)[^<]*(<\/h4>)/,`$1${_T('👁 Live now')}$2`);
  /* a Ranked card says so */
  try{const T=document.createElement('template');T.innerHTML=h;for(const c of T.content.querySelectorAll('.onl-sp')){const b=c.querySelector('[data-onl="watch"]');const L=b&&(ONL.lobbies||[]).find(x=>x.id===b.dataset.v);
      if(L&&L.ranked&&!c.querySelector('.b100rk')){const s=document.createElement('div');s.className='rc-sub b100rk';s.textContent=_T('⚔ Ranked · watchers see it one turn behind');(b.closest('.acts')||c).before(s)}}
    const d=document.createElement('div');d.appendChild(T.content);h=d.innerHTML}catch(e){}
  return `<div class="b100live">${h}</div>`}
if(!B100_OFF&&typeof onlLobbyHTML==='function'){const base=onlLobbyHTML;onlLobbyHTML=function(){if(typeof WHO100==='undefined'||WHO100.lb!=='live')return base.apply(this,arguments);
  return who100TabsHTML()+b100LiveHTML()}}
/* the rail: no Spectate (an old link lands on Live matches); 🏆 Season before the Hall */
if(!B100_OFF&&typeof onlHTML==='function'){const base=onlHTML;onlHTML=function(){if(ONL.tab==='spect'){ONL.tab='lobby';if(typeof WHO100!=='undefined')WHO100.lb='live'}
  const want=ONL.tab==='season';if(want)ONL.tab='hall';let h;try{h=base.apply(this,arguments)}finally{if(want)ONL.tab='season'}
  try{if(typeof h!=='string')return h;h=h.replace(/<button type="button" data-[a-z0-9]+="tab" data-v="spect"[^>]*>[^<]*<\/button>/g,'');
    if(h.includes('class="onl-rail"')&&!ONL.newGlad){const btn=`<button type="button" data-onl="tab" data-v="season" class="${want?'on':''}">${_T('🏆 Season')}</button>`;
      h=h.replace(/(<button type="button" data-[a-z0-9]+="tab" data-v="hall")/,btn+'$1');
      if(want){h=h.replace(/(<button type="button" data-[a-z0-9]+="tab" data-v="hall" class=")on(")/,'$1$2');const a=h.indexOf('<main class="onl-main">'),b=h.lastIndexOf('</main>');if(a>=0&&b>a)h=h.slice(0,a+23)+b100SeasonHTML()+h.slice(b)}}}catch(e){console.error(e)}return h}}
/* guests: the season tab is a plain tab button too (127 turns other data-onl into sign-in prompts) */
try{if(typeof GUEST_ACTS82!=='undefined'&&GUEST_ACTS82.add)GUEST_ACTS82.add('tab')}catch(e){}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#onl [data-b100tab]');if(t){e.preventDefault();e.stopPropagation();WHO100.lb='live';b100LbSave();onlRedraw();return}
  const r=e.target.closest&&e.target.closest('#onl [data-w100tab]');if(r){setTimeout(b100LbSave,0)}},true);

/* ---------------- 5 · THE SEASON LEADERBOARD ---------------- */
async function b100SeasonFetch(season){const key=season||0;if(B100.busySb)return;B100.busySb=true;try{B100.sb=await NET.req('season.board',season?{season}:{});B100.sbAt=Date.now();B100.sbErr=''}
  catch(e){B100.sbErr=errText92(e,_T('The season board could not be read.'))}finally{B100.busySb=false;if(document.getElementById('onl')&&ONL.tab==='season')onlRedraw()}}
function b100SeasonHTML(){const R=B100.sb;if(!R||Date.now()-B100.sbAt>60000&&!B100.busySb){if(!B100.busySb)setTimeout(()=>b100SeasonFetch(B100.sbSeason||0),0)}
  if(!R)return `<h3>${_T('🏆 Season')}</h3><p class="rc-sub">${B100.sbErr?esc2(B100.sbErr):_T('Reading the season…')}</p>`;
  const cur=R.season===R.now;const days=R.end?Math.max(0,Math.ceil((R.end-Date.now())/86400000)):0;
  const nav=`<span class="sb100nav"><button type="button" class="btn tksm" data-b100s="${R.season-1}" ${R.season>1?'':'disabled'} aria-label="${esc2(_T('Season before'))}">‹</button><b>${_T`Season ${R.season}`}</b><button type="button" class="btn tksm" data-b100s="${R.season+1}" ${R.season<R.now?'':'disabled'} aria-label="${esc2(_T('Season after'))}">›</button></span>`;
  const tit=(R.tit||[]).map(x=>`<span class="sb100t"><b>${x.upto===1?'1':x.upto===3?'2–3':'4–10'}</b> ${esc2(_T(x.n))}</span>`).join('');
  const mine=new Set((R.mine||[]).map(x=>x.c));
  const rows=(R.top||[]).map(x=>`<tr class="${mine.has(x.c)?'me':''} ${x.alive===false?'dead':''}"><td class="pl">${x.place}</td><td><b>${esc2(x.n)}</b>${x.alive===false?' ✝':''} <small class="rc-sub">${esc2((CLASSES[x.cls]||{}).name||'')}</small></td>
    <td>${x.dom?`<a href="#" data-hc98d="${esc2(x.dom)}">${esc2(x.dn?onlHouse82(x.dn):_T('A house'))}</a>`:'—'}</td><td>${onlRankChip(x.rk||'tiro')}</td><td class="g">+${(+x.g).toFixed(1).replace(/\.0$/,'')}</td></tr>`).join('');
  const me=(R.mine||[]).length?`<div class="sb100me">${_T('Your gladiators')}: ${(R.mine||[]).map(x=>`<span><b>${esc2(x.n)}</b> +${(+x.g).toFixed(1).replace(/\.0$/,'')} ${x.place?`· #${x.place}`:''}</span>`).join(' ')}</div>`:'';
  return `<div class="sb100"><div class="onl-lbtop"><h3>${_T('🏆 Season leaderboard')}</h3>${nav}</div>
    <p class="rc-sub">${cur?_T`Week ${R.wk} of 12 · ${days} days left · Glory gained in Ranked this season.`:_T('Final standings · Glory gained in Ranked that season.')}</p>
    <div class="sb100tit"><span class="rc-sub">${_T('Season-end Tituli:')}</span>${tit}</div>${me}
    ${rows?`<table class="tally sb100tb"><tr><th>#</th><th>${_T('Gladiator')}</th><th>${_T('House')}</th><th>${_T('Rank')}</th><th>${_T('Glory')}</th></tr>${rows}</table>`:`<p class="rc-sub">${_T('No Ranked Glory yet this season — be the first.')}</p>`}</div>`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#onl [data-b100s]');if(!b||b.disabled)return;e.preventDefault();B100.sbSeason=+b.dataset.b100s;B100.sb=null;b100SeasonFetch(B100.sbSeason)},true);

/* ---------------- 1 · THE QUEUE ESTIMATE ---------------- */
function b100EtaTxt(e){if(!e||!e.need)return '';if(e.slow)return _T('⏳ A quiet hour — the seats may take a while');const s=e.s|0;return s<60?_T`⏳ ≈ ${Math.max(10,Math.round(s/10)*10)} s to fill`:_T`⏳ ≈ ${Math.round(s/60)} min to fill`}
async function b100Eta(id){if(!id||B100.etaBusy)return;B100.etaBusy=true;try{B100.eta[id]=await NET.req('queue.eta',{id});B100.etaAt[id]=Date.now()}catch(e){B100.etaAt[id]=Date.now()}finally{B100.etaBusy=false}
  const el=document.querySelector(`#onl .eta100[data-id="${CSS.escape(String(id))}"]`);if(el){const t=b100EtaTxt(B100.eta[id]);el.textContent=t;el.hidden=!t}}
if(!B100_OFF&&typeof r96Layout==='function'){const base=r96Layout;r96Layout=function(h,L){const out=base.apply(this,arguments);try{
  if(!L||L.status!=='waiting'||typeof out!=='string'||out.indexOf('eta100')>=0)return out;const need=(L.seats|0)-(L.players||[]).length;if(need<=0)return out;
  const e=B100.eta[L.id];if(!B100.etaAt[L.id]||Date.now()-B100.etaAt[L.id]>30000)setTimeout(()=>b100Eta(L.id),0);const t=b100EtaTxt(e);
  const T=document.createElement('template');T.innerHTML=out;const hd=T.content.querySelector('.r80-head');if(!hd)return out;
  const sp=document.createElement('div');sp.className='eta100 rc-sub';sp.dataset.id=L.id;sp.textContent=t;sp.hidden=!t;const a=hd.querySelector('.r96-acts');if(a)hd.insertBefore(sp,a);else hd.appendChild(sp);
  const d=document.createElement('div');d.appendChild(T.content);return d.innerHTML}catch(e){return out}}}
/* the playlist's reply seeds it; my Ranked cooldown refusal reads plainly */
{const base=NET.req;NET.req=function(t,d){if(!B100_OFF&&t==='match.snapreq'&&d&&B100.noSnap&&d.id===B100.noSnap)return Promise.resolve({skipped100:1});
  const pr=base.apply(this,arguments);if(t==='lobby.quick'&&pr&&pr.then)pr.then(r=>{try{if(r&&r.lobby&&r.eta100){B100.eta[r.lobby.id]=r.eta100;B100.etaAt[r.lobby.id]=Date.now()}}catch(e){}}).catch(()=>{});
  if(t==='match.result'&&d&&d.id)B100.lastMid=d.id;return pr}}

/* ---------------- 2 · RANKED WATCHERS ONE TURN BEHIND ---------------- */
const b100RW=id=>{const W=ONL.watching;if(W&&W.id===id&&W.onl&&W.onl.ranked)return true;return !!(S&&S.onl&&S.onl.watch&&S.onl.ranked&&S.onl.lobby===id)};
if(!B100_OFF&&typeof onlWatch==='function'){const base=onlWatch;onlWatch=async function(L){const ranked=!!(L&&(L.ranked||((ONL.lobbies||[]).find(x=>x.id===L.id)||{}).ranked));
  if(ranked){B100.noSnap=L.id;B100.hold=[];B100.holdId=L.id}const r=await base.apply(this,arguments);
  if(ranked&&ONL.watching&&ONL.watching.id===L.id){if(typeof onlWatchReplay==='function')onlWatchReplay(L.id)}return r}}
/* MOCK only: the page holds a Ranked watcher's pushed moves until the mock's turn clock lets them go (the real server never pushes them early) */
{const base=NET.emit;NET.emit=function(t,d){try{if(!B100_OFF&&t==='match.input'&&NET.mode==='mock'&&d&&d.in&&b100RW(d.id)){if(B100.holdId!==d.id){B100.holdId=d.id;B100.hold=[]}B100.hold.push(d.in);return}
    if(!B100_OFF&&t==='match.rel100'&&d&&B100.holdId===d.id){const go=B100.hold.filter(x=>x.seq<=d.upto).sort((a,b)=>a.seq-b.seq);B100.hold=B100.hold.filter(x=>x.seq>d.upto);
      for(const x of go)base.call(this,'match.input',{id:d.id,in:x})}}catch(e){console.error(e)}return base.apply(this,arguments)}}
function b100RwChip(){let el=document.getElementById('rw100');const on=!B100_OFF&&S&&S.onl&&S.onl.watch&&S.onl.ranked&&!S.over;if(!on){if(el)el.hidden=true;return}
  if(!el){el=document.createElement('div');el.id='rw100';el.setAttribute('role','status');document.body.appendChild(el)}el.hidden=false;el.textContent=_T('👁 Ranked · you watch one turn behind')}

/* ---------------- 4 · CONNECTION DOTS + 6 · REPORT (turn panel) ---------------- */
const B100_ST={on:_T('connected'),away:_T('away — reconnecting'),gone:_T('gone'),cpu:_T('a CPU holds the seat')};
async function b100Conn(){if(B100.connBusy)return;const id=S&&S.onl&&S.onl.lobby;if(!id)return;B100.connBusy=true;
  try{const r=await NET.req('match.conn100',{id});if(S&&S.onl&&S.onl.lobby===id){B100.conn=(r&&r.seats)||{};B100.connId=id}}catch(e){}finally{B100.connBusy=false;B100.connAt=Date.now()}}
function b100Dots(){const el=document.getElementById('tt100');if(!el||el.hidden||!S||!S.onl)return;
  for(const r of el.querySelectorAll('[data-s100]')){const q=S.players[+r.dataset.s100];if(!q)continue;const seat=onlmSeatOf(q);const c=B100.connId===S.onl.lobby?B100.conn[seat]:null;
    let d=r.querySelector('.cd100');const human=typeof onlmHuman==='function'&&onlmHuman(seat);if(!c&&!human){if(d)d.remove();continue}
    if(!d){d=document.createElement('i');d.className='cd100';d.setAttribute('aria-hidden','true');const n=r.querySelector('.n');if(n)n.before(d);else r.appendChild(d)}
    const st=c?c.st:'on';if(d.dataset.st!==st)d.dataset.st=st;const tip=(B100_ST[st]||st)+(c&&c.slow?' · '+_T`⌛ timed out ${c.slow}×`:'');if(d.title!==tip){d.title=tip;r.setAttribute('aria-description',tip)}
    d.classList.toggle('slow',!!(c&&c.slow))}
  if(!el.querySelector('.rp100b')&&!(S.onl.watch&&!ONL.acct)){const b=document.createElement('button');b.type='button';b.className='rp100b';b.title=_T('Report a player');b.setAttribute('aria-label',_T('Report a player'));b.textContent='🚩';
    b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();b100Report(S.onl.lobby)});el.appendChild(b)}}
function b100ReportSeats(id){const out=[];try{if(S&&S.onl&&S.onl.lobby===id){S.players.forEach(q=>{const s=onlmSeatOf(q);if(s!==ONLM.me&&onlmHuman(s))out.push({seat:s,name:q.name})})}}catch(e){}
  if(!out.length&&B100.sum&&B100.sum.id===id)for(const r of B100.sum.rows||[])if(r.human&&!r.me)out.push({seat:r.seat,name:r.name});return out}
function b100Report(id){if(!id)return;const seats=b100ReportSeats(id);if(!seats.length){onlToast80(_T('Nobody else to report here.'));return}
  const RS={cheat:_T('Cheating or a tampered client'),abuse:_T('Abuse in the quick chat'),afk:_T('Away — never plays'),leave:_T('Left on purpose'),name:_T('An offensive name'),other:_T('Something else')};
  const bg=onl83Pop('rp100pop',`<div class="rp100"><h3>${_T('🚩 Report a player')}</h3><p class="rc-sub">${_T('Logged with this match for review. Nothing happens to them automatically. One report a match.')}</p>
    <label>${_T('Player')} <select class="tin" id="rp100s">${seats.map(x=>`<option value="${x.seat}">${esc2(x.name)}</option>`).join('')}</select></label>
    <div class="rp100r">${ONLC.REPORT100.REASONS.map((k,i)=>`<label><input type="radio" name="rp100r" value="${k}" ${i?'':'checked'}> ${esc2(RS[k]||k)}</label>`).join('')}</div>
    <label>${_T('A short note (optional)')}<textarea class="tin" id="rp100n" maxlength="${ONLC.REPORT100.NOTE_MAX}" rows="2"></textarea></label>
    <p class="onl-err" id="rp100e" hidden></p><div class="acts"><button type="button" class="btn primary" data-rp100="send">${_T('Send the report')}</button><button type="button" class="btn" data-rp100="x">${_T('Cancel')}</button></div></div>`);
  bg.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('[data-rp100]');if(!b)return;e.preventDefault();if(b.dataset.rp100==='x'){bg.remove();return}
    const seat=+bg.querySelector('#rp100s').value;const reason=(bg.querySelector('input[name="rp100r"]:checked')||{}).value;const note=bg.querySelector('#rp100n').value;b.disabled=true;
    try{await NET.req('match.report100',{id,seat,reason,note});bg.remove();onlToast80(_T('🚩 Report sent — thank you.'))}catch(err){b.disabled=false;const x=bg.querySelector('#rp100e');x.hidden=false;x.textContent=errText92(err)}})}

/* ---------------- SIDELINING: the owner's own clock start, reveal credits, fixed reveal length, no CPU crowd online, no clean-up show ---------------- */
function b100Mine(){try{const p=cur();return !!(p&&S&&S.onl&&!S.onl.watch&&onlmOn()&&onlmSeatOf(p)===ONLM.me&&!p.cpu)}catch(e){return false}}
function b100Own(){try{if(!tt100On()||!b100Mine()||!['choice','action','command'].includes(S.phase))return;const tc=TT100C.tc;if(!tc||tc.t!==S.turnNo||B100.ownSent===S.turnNo)return;
  B100.ownSent=S.turnNo;NET.req('match.clock',{id:S.onl.lobby,kind:'own',t:S.turnNo,seat:ONLM.me}).then(r=>{try{tt100Status(r)}catch(e){}}).catch(()=>{})}catch(e){}}
function b100Fx(k){try{if(B100_OFF||!tt100On()||!b100Mine())return;const t=S.turnNo;const i=B100.fxN[t]=(B100.fxN[t]|0)+1;
  NET.req('match.clock',{id:S.onl.lobby,kind:'fx',t,k,i:i-1}).then(r=>{try{tt100Status(r)}catch(e){}}).catch(()=>{})}catch(e){}}
if(typeof openChest==='function'){const base=openChest;openChest=async function(player){try{if(player&&S&&S.onl&&onlmOn()&&onlmSeatOf(player)===ONLM.me&&!player.cpu)b100Fx('chest')}catch(e){}return base.apply(this,arguments)}}
if(typeof marketBuy75==='function'){const base=marketBuy75;marketBuy75=function(player){try{if(player&&S&&S.onl&&onlmOn()&&onlmSeatOf(player)===ONLM.me&&!player.cpu)b100Fx('market')}catch(e){}return base.apply(this,arguments)}}
if(typeof beastShow82==='function'){const base=beastShow82;beastShow82=function(n){try{if(S&&S.onl&&onlmOn()&&b100Mine())b100Fx('spawn')}catch(e){}return base.apply(this,arguments)}}
/* one length on every screen online (the Normal pace, cut to ⅖ — short) */
if(typeof nc82Ms==='function'){const base=nc82Ms;nc82Ms=function(ms){if(!B100_OFF&&S&&S.onl)return ms*0.4;return base.apply(this,arguments)}}
/* only ticket holders act online (the stands' group turn); the CPU crowd watches */
if(typeof spectatorsAct==='function'){const base=spectatorsAct;spectatorsAct=async function(){if(B100_OFF||!S||!S.onl)return base.apply(this,arguments);
  const keep=new Map();for(const s of S.spect||[])if(!s.human&&!s.gone){keep.set(s,s.cf|0);s.cf=-1e6}
  try{return await base.apply(this,arguments)}finally{for(const [s,c] of keep)s.cf=c+(s.gone?0:1)}}}
/* the clean-up show is skipped online (the same nothing on every screen) */
if(typeof startCleanCrew==='function'){const base=startCleanCrew;startCleanCrew=function(){if(!B100_OFF&&S&&S.onl&&S.over){S.cleanDone=1;S.zoneFull=1;return}return base.apply(this,arguments)}}

/* ---------------- 7 · THE AFTER-MATCH SUMMARY ---------------- */
function b100ReplayURL(id){let base='https://flaviusrule.com/play/';try{if(/^https?:$/.test(location.protocol))base=location.origin+location.pathname}catch(e){}return base+'#replay='+encodeURIComponent(id)}
function b100SumRows(id){const rows=[];try{if(!S||!S.onl||S.onl.lobby!==id)return rows;const W=new Set(((S.lastResult||{}).winners)||[]);
  S.players.forEach(q=>{const seat=onlmSeatOf(q);rows.push({seat,name:q.name,won:W.has(q.id),alive:!!q.alive&&!q.retired,cf:q.cf|0,human:onlmHuman(seat),me:seat===ONLM.me})});
  rows.sort((a,b)=>(b.won|0)-(a.won|0)||(b.alive|0)-(a.alive|0)||b.cf-a.cf)}catch(e){}return rows}
function b100Summary(id,res){if(B100_OFF||!id)return;const o=(res&&res.out)||null;const ranked=!!(S&&S.onl&&S.onl.lobby===id&&S.onl.ranked);const rows=b100SumRows(id);
  B100.sum={id,rows,ranked};const L=(ONL.lobbies||[]).find(x=>x.id===id)||{};const ev=L.ev||(S&&S.onl&&S.onl.lobby===id?S.ev:'');
  const head=res&&res.void?_T('⚖ Void — the lanistas did not agree. No pay, no deaths.'):!o?_T('⚖ Settled'):o.died?_T('✝ Fallen'):rows.find(r=>r.me&&r.won)?_T('🏆 Victory'):_T('🛡 Survived');
  const gains=o&&!o.died?[o.glory?_T`✦ +${o.glory} Glory`:'',o.pay?coinAmt87('+'+o.pay):'',o.cf?cfAmt87('+'+o.cf):'',o.rankUp?_T`⚔ now ${esc2(onlRank(o.rankUp).n)}`:''].filter(Boolean).join(' · '):'';
  const tbl=rows.map((r,i)=>`<li class="${r.me?'me':''}"><b>${i+1}.</b> ${esc2(r.name)}${r.won?' 🏆':r.alive?'':' ✝'} <small class="rc-sub">${cfAmt87(r.cf)}</small></li>`).join('');
  let el=document.getElementById('as100');if(el)el.remove();el=document.createElement('section');el.id='as100';el.setAttribute('role','dialog');el.setAttribute('aria-label',_T('After the match'));
  el.innerHTML=`<button type="button" class="as100x" data-as100="x" aria-label="${esc2(_T('Close'))}">✕</button><div class="as100h"><b>${head}</b><small>${[ev&&typeof onlEvName==='function'?esc2(onlEvName(ev)):'',ranked?_T('⚔ Ranked'):_T('Custom')].filter(Boolean).join(' · ')}</small></div>
    ${gains?`<div class="as100g">${gains}</div>`:''}${tbl?`<ol class="as100t">${tbl}</ol>`:''}
    <div class="as100l"><input class="tin" readonly value="${esc2(b100ReplayURL(id))}" aria-label="${esc2(_T('Replay link'))}"><button type="button" class="btn tksm" data-as100="copy" title="${esc2(_T('Copy the replay link — replays are coming soon'))}">🔗 ${_T('Copy')}</button></div>
    <small class="rc-sub">${_T('📼 Replays are coming soon — the link will open this match then.')}</small>
    <div class="acts"><button type="button" class="btn primary tksm" data-as100="again">${_T('⚔ Again')}</button>${rows.some(r=>r.human&&!r.me)?`<button type="button" class="btn tksm" data-as100="rep">${_T('🚩 Report')}</button>`:''}</div>`;
  el.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('[data-as100]');if(!b)return;e.preventDefault();e.stopPropagation();const a=b.dataset.as100;
    if(a==='x'){el.remove();return}
    if(a==='copy'){const v=b100ReplayURL(id);try{await navigator.clipboard.writeText(v);onlToast80(_T('🔗 Link copied.'))}catch(err){const i=el.querySelector('.as100l input');if(i){i.select();try{document.execCommand('copy')}catch(x){}}onlToast80(_T('🔗 Link selected — copy it.'))}return}
    if(a==='rep'){b100Report(id);return}
    if(a==='again'){b.disabled=true;try{const r=await NET.req('lobby.again',{id});if(typeof onlUpsert80==='function')onlUpsert80(r.lobby);el.remove();ONL.tab='play';if(typeof onlExit==='function')onlExit()}catch(err){b.disabled=false;onlToast80('⚠ '+esc2(errText92(err)))}}});
  document.body.appendChild(el)}
if(!B100_OFF&&typeof onlSettled==='function'){const base=onlSettled;onlSettled=function(res){const r=base.apply(this,arguments);try{const id=B100.lastMid||(ONL.live&&ONL.live.id);if(id)setTimeout(()=>b100Summary(id,res),2600)}catch(e){console.error(e)}return r}}
NET.on('match.settled',d=>{try{if(B100_OFF||!d||!d.id||!ONL.acct||(d.to&&d.to!==ONL.acct.id))return;if(document.getElementById('as100'))return;if(B100.lastMid===d.id||(S&&S.onl&&S.onl.lobby===d.id&&!S.onl.watch))setTimeout(()=>{if(!document.getElementById('as100'))b100Summary(d.id,d)},2600)}catch(e){}});
/* the deep link: #replay=<id> */
function b100Deep(){try{const m=/^#replay=([A-Za-z0-9_-]{1,40})$/.exec(location.hash||'');if(!m||B100_OFF)return;const id=decodeURIComponent(m[1]);
  const bg=onl83Pop('rp100pop',`<div class="rp100"><h3>${_T('📼 A match replay')}</h3><p>${_T`Match <b>${esc2(id)}</b>.`}</p><p class="rc-sub">${_T('Replays are coming soon — this link will open the match then. For now you can watch live matches in the Lobby Browser.')}</p>
    <div class="acts"><button type="button" class="btn primary" data-dl100="onl">${_T('🌐 Live matches')}</button><button type="button" class="btn" data-dl100="x">${_T('Close')}</button></div></div>`);
  bg.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-dl100]');if(!b)return;bg.remove();try{history.replaceState(null,'',location.pathname+location.search)}catch(x){}
    if(b.dataset.dl100==='onl'&&typeof onlineOpen==='function'){if(typeof WHO100!=='undefined')WHO100.lb='live';onlineOpen('lobby')}})}catch(e){}}
{let n=0;const t=setInterval(()=>{n++;if(window.FLAVIUS_READY||n>40){clearInterval(t);setTimeout(b100Deep,400)}},250)}
window.addEventListener('hashchange',b100Deep);

/* ---------------- 3 · THE HOUSE CARD: the leaver mark + Tituli ---------------- */
if(!B100_OFF&&typeof hc98HTML==='function'){const base=hc98HTML;hc98HTML=function(r){const h=base.apply(this,arguments);try{if(!r)return h;let add='';
  if(r.leaver&&r.leaver.n)add+=`<div class="lv100" title="${esc2(_T('Abandoned, handed to a CPU or timed out twice in Ranked matches this week'))}">${_T`⚠ Often leaves matches · ${r.leaver.n} this week`}</div>`;
  if((r.tit100||[]).length)add+=`<div class="tt100l">${r.tit100.map(x=>`<span class="tit100" title="${esc2(x.glad||'')}">🏅 ${esc2(_T(x.n))} <small>${esc2(String(x.s||'').replace(/^S/,_T('Season ')))}</small></span>`).join('')}</div>`;
  if(!add)return h;const i=h.indexOf('<div class="hc98-rec">');return i<0?h+add:h.slice(0,i)+add+h.slice(i)}catch(e){return h}}}

/* ---------------- TACTICS: the 🌐 Online page ---------------- */
function b100TacHTML(){const L=[[_T('Missio'),_T('a missio is your own gladiator\'s road — offline only')],[_T('Festivals'),_T('the five festivals and their gifts')],[_T('Tournaments and invitationals'),_T('brackets run on one screen')],[_T('Hot seat'),_T('several players on one screen')],[_T('Lessons'),_T('the Classic and Manager tutorials')],[_T('Manager mode'),_T('your ludus, its seasons and its bouts')]];
  return `<div class="tac100"><section class="cd98"><h3>🌐 ${_T('Online')}</h3><p>${_T('Online matches use the same rules as every digital game — the rulebook plus the digital rules noted in Rules at a Glance and the Quick Reference.')}</p>
    <h4>${_T('Only offline')}</h4><ul>${L.map(([a,b])=>`<li><b>${a}</b> — ${b}</li>`).join('')}</ul>
    <h4>${_T('How online differs')}</h4><ul><li>${_T('Printed gear only; your gladiator\'s record lives on the server.')}</li><li>${_T('No pause. Each screen keeps its own animation speed; the turn clock is the server\'s and starts on your own screen.')}</li>
    <li>${_T('Reveals (the chest, a beast\'s card, the market) are short and the same length everywhere — they never eat your turn time.')}</li><li>${_T('Only ticket holders act in the stands, in their timed group turn; the CPU crowd just watches.')}</li>
    <li>${_T('Ranked: watchers see the match one turn behind; seats are dealt at random; leaving often brings a short Ranked cooldown.')}</li></ul></section></div>`}
if(typeof TAC98_TABS!=='undefined'&&!B100_OFF&&!TAC98_TABS.some(t=>t[0]==='onl'))TAC98_TABS.push(['onl','🌐',_T('Online')]);
if(typeof showRules==='function'&&!B100_OFF){const base=showRules;showRules=function(tab){const want=tab==='onl';const r=base.call(this,want?'build':tab);
  const add=()=>{const m=document.querySelector('#tac98 .tac98-main');if(!m||m.querySelector('[data-pane="onl"]'))return !!m;const d=document.createElement('div');d.className='tac98-pane';d.dataset.pane='onl';d.id='rulTab-onl100';d.hidden=true;d.innerHTML=b100TacHTML();m.appendChild(d);
    if(want&&typeof tac98Show==='function')tac98Show('onl');return true};if(!add()){let n=0;const t=setInterval(()=>{if(add()||++n>40)clearInterval(t)},100)}return r}}

/* ---------------- the ticker (a REAL 1 s timer: dots, own clock, chips; asks the server only when due) ---------------- */
setInterval(()=>{try{if(B100_OFF)return;b100RwChip();if(!S||!S.onl||!onlmOn())return;b100Own();b100Dots();
  if(!document.hidden&&!document.body.classList.contains('idle92')&&!S.over&&Date.now()-B100.connAt>=ONLC.CONN100.POLL_MS)b100Conn()}catch(e){}},1000);

/* ---------------- MOCK (as the server's "v1.0 SERVER BATCH B" block) ---------------- */
if(typeof MOCK_ROUTES!=='undefined'){
  const mL=(w,id)=>w.lobbies[id],mM=(w,id)=>w.matches&&w.matches[id];
  const mFight=(L,a)=>(L.players||[]).some(p=>p.id===a)||(L.stands||[]).some(s=>s.id===a);
  const mSeatAcct=(L,seat)=>{const p=L.players[seat];return p?p.id:null};
  const mLv=(w,a,k,m)=>{const A=w.accounts[a];if(A&&!A.bot)A.lv100=ONLC.leaveAdd100(A.lv100,k,Date.now(),m)};
  const mCd=(w,me)=>{const A=w.accounts[me];const u=ONLC.leaveCooldown100(A&&A.lv100,Date.now());if(u){const e=new Error(_T`You left too many matches — Ranked opens again in ${Math.max(1,Math.ceil((u-Date.now())/60000))} min.`);e.code='ranked_cd';throw e}};
  for(const t of ['lobby.create','lobby.quick']){const base=MOCK_ROUTES[t];if(base)MOCK_ROUTES[t]=(w,d,me)=>{if(d&&d.ranked)mCd(w,me);const r=base(w,d,me);
    try{if(t==='lobby.quick'&&r&&r.lobby&&r.lobby.status==='waiting'){const L=r.lobby;const h=(w.qeta100||{})[L.ev+'#'+(L.ranked?(L.rank||'tiro'):'c')];const need=(L.seats|0)-(L.players||[]).length;const free=(typeof mockHere80==='function'?mockHere80(w):[]).filter(x=>!x.bot&&!x.match&&!mFight(L,x.id)).length;r.eta100={...ONLC.eta100(h,need,L.seats,free),need,free}}}catch(e){}return r}}
  for(const t of ['lobby.join','lobby.sit','lobby.accept']){const base=MOCK_ROUTES[t];if(base)MOCK_ROUTES[t]=(w,d,me)=>{const L=d&&d.id&&mL(w,d.id);if(L&&L.ranked)mCd(w,me);return base(w,d,me)}}
  {const base=MOCK_ROUTES['lobby.start'];if(base)MOCK_ROUTES['lobby.start']=(w,d,me)=>{const r=base(w,d,me);try{const L=mL(w,d.id);if(L&&L.status==='live'&&L.quick&&L.started&&L.created){w.qeta100=w.qeta100||{};const k=L.ev+'#'+(L.ranked?(L.rank||'tiro'):'c');w.qeta100[k]=ONLC.etaFold100(w.qeta100[k],L.started-L.created)}}catch(e){}return r}}
  MOCK_ROUTES['queue.eta']=(w,d,me)=>{const L=mL(w,d.id);if(!L)throw new Error(_T('That game is gone.'));if(!(L.members||[]).some(m=>m.id===me)&&!L.players.some(p=>p.id===me))throw new Error(_T('Join the room first.'));
    const need=(L.seats|0)-(L.players||[]).length;const h=(w.qeta100||{})[L.ev+'#'+(L.ranked?(L.rank||'tiro'):'c')];const free=(typeof mockHere80==='function'?mockHere80(w):[]).filter(x=>!x.bot&&!x.match&&!mFight(L,x.id)).length;return {...ONLC.eta100(h,need,L.seats,free),need,free}};
  /* watchers of a Ranked match: one turn behind */
  {const base=MOCK_ROUTES['match.watch'];MOCK_ROUTES['match.watch']=(w,d,me)=>{const r=base(w,d,me);const L=mL(w,d.id);if(L&&L.ranked&&!mFight(L,me))r.delay100=1;return r}}
  {const base=MOCK_ROUTES['match.get'];MOCK_ROUTES['match.get']=(w,d,me)=>{const r=base(w,d,me);const L=mL(w,d.id),M=mM(w,d.id);if(L&&M&&L.ranked&&L.status==='live'&&!mFight(L,me)){const rel=M.rel100==null?-1:M.rel100;r.inputs=(r.inputs||[]).filter(x=>x.seq<=rel);r.delay100=1}return r}}
  const mRel=(id,M)=>{if(!M)return;const upto=(M.inputs||[]).length-1;if(upto<=(M.rel100==null?-1:M.rel100))return;M.rel100=upto;mockPush('match.rel100',{id,upto})};
  {const base=MOCK_ROUTES['match.clock'];if(base)MOCK_ROUTES['match.clock']=(w,d,me)=>{d=d||{};const L=mL(w,d.id),M=mM(w,d.id);const t0=M&&M.tc100?M.tc100.t:-1;
    if(L&&M&&(d.kind==='own'||d.kind==='fx')){const tc=M.tc100;if(tc&&!tc.end&&tc.t===(d.t|0)&&mSeatAcct(L,tc.seat)===me&&L.status==='live'){const t=Date.now();
        if(d.kind==='own'&&!tc.own){tc.at=Math.max(tc.at,Math.min(t,tc.at+ONLC.FX100.OWN_MAX));tc.own=1}
        if(d.kind==='fx'){M.lk100=M.lk100||{};const k='FX#'+tc.t+'#'+(d.i|0);const used=+tc.fx||0;const add=Math.max(0,Math.min(ONLC.fxMs100(d.k),ONLC.FX100.TURN_MAX-used));if(add>0&&!M.lk100[k]){M.lk100[k]=1;tc.x=(+tc.x||0)+add;tc.fx=used+add}}}
      d={...d,kind:'none'}}
    const r=base(w,d,me);try{if(L&&M&&L.ranked&&M.tc100&&M.tc100.t>t0)mRel(d.id,M)}catch(e){}return r}}
  /* the end releases the rest; the season's Glory */
  {const base=MOCK_ROUTES['match.result'];MOCK_ROUTES['match.result']=(w,d,me)=>{const M0=mM(w,d.id);const was=M0&&M0.status;const r=base(w,d,me);try{const L=mL(w,d.id),M=mM(w,d.id);
    if(M&&M.status==='done'&&was!=='done'){if(L&&L.ranked)mRel(d.id,M);const key=ONLC.seasonKey100(Date.now());w.season100=w.season100||{};const T=w.season100[key]=w.season100[key]||{};
      for(const [a,out] of Object.entries(M.outs||{})){const g=+((out&&out.glory)||0);if(!(g>0))continue;const p=L.players.find(x=>x.id===a);const ch=p&&w.chars[p.char];if(!ch)continue;const A=w.accounts[a]||{};const D=A.domus&&typeof mockDomus82==='function'?mockDomus82(w,A.domus):null;
        const o=T[ch.id]||{c:ch.id,g:0};T[ch.id]={...o,n:ch.name,cls:ch.cls,dn:(D&&D.name)||A.dname||'',dom:A.domus||'',rk:ONLC.rankFor(ch).k,alive:!!ch.alive,g:Math.round((o.g+g)*10)/10}}}}catch(e){console.error(e)}return r}}
  MOCK_ROUTES['season.board']=(w,d,me)=>{const S0=ONLC.seasonAt(Date.now());const s=d&&Number.isInteger(d.season)&&d.season>=1&&d.season<=S0.season?d.season:S0.season;const key='S'+s;
    const rows=Object.values(((w.season100||{})[key])||{});let top=[];for(const x of rows)top=ONLC.seasonTop100(top,x);top=top.map((x,i)=>({...x,place:i+1}));
    const mine=top.filter(x=>{const c=w.chars[x.c];return c&&c.owner===me}).map(x=>({c:x.c,n:x.n,g:x.g,place:x.place,alive:x.alive}));
    return {key,season:s,now:S0.season,wk:s===S0.season?S0.wk:12,weeks:12,end:s===S0.season?S0.start+(12-S0.wk+1)*604800000:null,top,mine,tit:ONLC.SEASON100.TITULI}};
  MOCK_ROUTES['match.conn100']=(w,d,me)=>{const L=mL(w,d.id),M=mM(w,d.id);if(!L||!M)throw new Error(_T('No such match.'));if(!mFight(L,me)&&!(M.watch||{})[me])throw new Error(_T('Not your match.'));
    const here=new Set((typeof mockHere80==='function'?mockHere80(w):[]).map(x=>x.id));const o={};L.players.forEach((p,i)=>{if(/^bot/.test(p.id))return;
      const st=(M.dropped||{})[p.id]||(M.abandoned||{})[p.id]?'cpu':here.has(p.id)?'on':'away';const sl=((M.toc100||{})[i])|0;o[i]=sl?{st,slow:sl}:{st}});return {id:d.id,seats:o,now:Date.now(),live:L.status==='live'}};
  MOCK_ROUTES['match.report100']=(w,d,me)=>{d=d||{};const why=ONLC.reportWhy100(d);if(why){const e=new Error(_T(why));e.code='report_bad';throw e}const L=mL(w,d.id),M=mM(w,d.id);if(!L||!M)throw new Error(_T('No such match.'));
    if(!mFight(L,me)&&!(M.watch||{})[me])throw new Error(_T('Not your match.'));const who=mSeatAcct(L,d.seat);if(!who||who===me){const e=new Error(_T('Pick a player.'));e.code='report_bad';throw e}
    w.reports100=w.reports100||{};const R=w.reports100[d.id]=w.reports100[d.id]||{};if(R[me]){const e=new Error(_T('You already reported this match.'));e.code='report_once';throw e}
    R[me]={seat:d.seat,who,reason:d.reason,note:String(d.note||'').replace(/[<>]/g,'').slice(0,ONLC.REPORT100.NOTE_MAX),at:Date.now()};return {done:1}};
  /* leaving (Ranked) */
  {const base=MOCK_ROUTES['match.abandon'];MOCK_ROUTES['match.abandon']=(w,d,me)=>{const L=mL(w,d.id),M=mM(w,d.id);const was=!!(M&&(M.abandoned||{})[me]);const live=M&&M.status!=='done';const r=base(w,d,me);if(L&&L.ranked&&live&&!was)mLv(w,me,'abandon',d.id);return r}}
  {const base=MOCK_ROUTES['match.drop'];MOCK_ROUTES['match.drop']=(w,d,me)=>{const L=mL(w,d.id),M=mM(w,d.id);const who=L&&mSeatAcct(L,d.seat|0);const was=!!(M&&who&&(M.dropped||{})[who]);const r=base(w,d,me);if(L&&L.ranked&&who&&!was&&(M.dropped||{})[who])mLv(w,who,'drop',d.id);return r}}
  {const base=MOCK_ROUTES['house.card'];if(base)MOCK_ROUTES['house.card']=(w,d,me)=>{const r=base(w,d,me);try{const dom=r&&r.domus&&r.domus.id;const A=Object.values(w.accounts).find(a=>a.domus===dom);const lm=ONLC.leaveMark100(A&&A.lv100,Date.now());if(lm.mark)r.leaver={n:lm.n}}catch(e){}return r}}
  if(Array.isArray(ONLC.GUEST_OK)&&!ONLC.GUEST_OK.includes('season.board'))ONLC.GUEST_OK.push('season.board')}

{const st=document.createElement('style');st.textContent=`
#onl .b100live .onl-spgrid{margin-bottom:10px}#onl .b100rk{color:#e2c46a}
#onl .sb100nav{display:inline-flex;align-items:center;gap:8px}#onl .sb100tit{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;margin:4px 0 8px}
#onl .sb100t{border:1px solid rgba(214,171,76,.4);border-radius:12px;padding:1px 8px;font-size:12px}#onl .sb100t b{color:#e2c46a;margin-right:3px}
#onl .sb100me{margin:0 0 8px;font-size:13px}#onl .sb100me span{margin-right:10px}
#onl .sb100tb td.pl{width:34px;text-align:right;color:#bfae88}#onl .sb100tb td.g{font-weight:600;color:#9fd38a;white-space:nowrap}#onl .sb100tb tr.me td{background:rgba(214,171,76,.12)}#onl .sb100tb tr.dead td{opacity:.7}
#onl .eta100{color:#e2c46a;white-space:nowrap}
#rw100{position:fixed;left:50%;transform:translateX(-50%);top:6px;z-index:60;background:rgba(20,16,12,.88);border:1px solid #d6ab4c;color:#f3dfa8;border-radius:14px;padding:3px 12px;font:600 12.5px system-ui,sans-serif;pointer-events:none}
#tt100 .cd100{flex:none;width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:4px;background:#6fbf73;box-shadow:0 0 0 1px rgba(0,0,0,.5)}
#tt100 .cd100[data-st="away"]{background:#e2b64a}#tt100 .cd100[data-st="gone"]{background:#d9534f}#tt100 .cd100[data-st="cpu"]{background:#8a8f96}#tt100 .cd100.slow{outline:1px dashed #e2b64a;outline-offset:1px}
#tt100 .rp100b{display:block;margin:2px 0 0 auto;background:none;border:0;cursor:pointer;font-size:12px;opacity:.55;padding:0 2px;line-height:1.2}#tt100 .rp100b:hover,#tt100 .rp100b:focus-visible{opacity:1}
.rp100{display:flex;flex-direction:column;gap:8px;max-width:420px}.rp100 label{display:flex;flex-direction:column;gap:3px}.rp100r{display:grid;grid-template-columns:1fr 1fr;gap:4px 10px}.rp100r label{flex-direction:row;align-items:center;gap:5px}
#as100{position:fixed;right:14px;bottom:14px;z-index:70;width:min(340px,calc(100vw - 32px));background:#1d1712;border:1px solid #d6ab4c;border-radius:10px;padding:10px 12px;box-shadow:0 8px 28px rgba(0,0,0,.55);color:#eadbb8;display:flex;flex-direction:column;gap:6px;font-size:13px}
#as100 .as100x{position:absolute;right:6px;top:4px;background:none;border:0;color:inherit;cursor:pointer;font-size:14px}
#as100 .as100h{display:flex;flex-direction:column}#as100 .as100h b{font-size:16px;color:#f3dfa8}#as100 .as100g{font-weight:600}
#as100 .as100t{margin:0;padding-left:0;list-style:none;max-height:120px;overflow:auto}#as100 .as100t li.me{color:#f3dfa8}
#as100 .as100l{display:flex;gap:4px}#as100 .as100l input{flex:1;min-width:0;font-size:11.5px}
#onl .lv100,.hc98 .lv100{color:#e8a58e;font-size:12.5px;margin:4px 0}.hc98 .tt100l{display:flex;flex-wrap:wrap;gap:4px 8px;margin:4px 0}.hc98 .tit100{font-size:12px;border:1px solid rgba(214,171,76,.35);border-radius:10px;padding:1px 7px}
.tac100 ul{margin:4px 0 10px 18px}.tac100 li{margin:2px 0}
@media (max-width:600px){#as100{right:8px;left:8px;width:auto;bottom:8px}.rp100r{grid-template-columns:1fr}}
`;document.head.appendChild(st)}
