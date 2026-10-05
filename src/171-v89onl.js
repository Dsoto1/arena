/* =====================================================================
   171-V89ONL · ONLINE v0.89: rooms when lanistas go + Manage between turns online
   =====================================================================
   1. ROOMS WHEN LANISTAS GO (his picks 2026-10-05; shared rules ONLC.roomOffMark/roomGoneIds/roomHostAway, server routes.js prune/presence):
      • closing the Online window (or the tab: pagehide) while a member of a WAITING room sends lobby.leave at once (onl89LeaveNow);
      • a dropped socket: the server marks the lanista L.off[id] — the room shows "Host reconnecting…" / the seat dims (onlRoomHTML80
        wrapper); back within ONLC.ROOM_GRACE (60 s) clears it; after it the server takes them out with roomLeave (the host's room passes
        to the longest-waiting lanista; nobody left → closed, tickets and wagers back);
      • every open room screen asks lobby.get every 30 s (the server prunes that room), so rooms clean up even when nobody browses;
      • MOCK: presence = accounts.seen (a 20 s ping while Online is open, 118); a member not heard for ONL89.drop (70 s: background tabs ping late) is marked,
        out after ONL89.grace. Test hook (mock + the room ping only): localStorage flavius_onltest89 = {"grace":ms,"drop":ms,"ping":ms}.
   2. MANAGE ONLINE (162-v88gear was offline only): the off-turn ⇄ swap / take is an ORDER — a lockstep input {k:'gear', seat, op}
      sent by its owner. The engine only blocks on the seat whose decision it waits for, and the mover applies its own moves at once,
      so an order cannot land in the middle of someone else's turn without splitting the arena. Every client therefore files the order
      in S.gear89[seat] when it reaches the head of the stream (any time — nothing changes), and carries it out at the same place:
      the FIRST settled point of that gladiator's next turn (its own decision, nothing resolving), before any move of that turn.
      Its owner's own board waits (onlmMine false) while an order is in flight or not yet carried out, so its first move of the turn
      always comes after its orders in the stream. Take = by option (kind + name + source), re-found at the time; gone → skipped
      everywhere alike. CPUs' between-turns pickups (gear88Cpu at beginTurn) run online too (not on the opening's first beginTurn:
      the joiners load the host's opening snapshot and begin that turn again).
   ===================================================================== */
const ONL89={grace:ONLC.ROOM_GRACE,drop:70000,ping:30000,pingAt:0,noLeave:false};
(function(){try{const o=JSON.parse(localStorage.getItem('flavius_onltest89')||'null');if(o)for(const k of ['grace','drop','ping'])if(o[k]>0)ONL89[k]=+o[k]}catch(e){}})();

/* ---------------- 1a. MOCK: marks, the grace, lobby.get ---------------- */
function mockLeave89(w,L,id,why){const aud=mockAud80(L);const r=ONLC.roomLeave(L,id,mockNow());
  if(r.closed){mockClose(w,L,'empty');mockTo(aud,'lobby.update',{id:L.id,closed:'empty'})}else{mockUpd80(w,L);mockTo([id],'lobby.update',{id:L.id,lobby:mockRoomOut80(w,L),gone89:why||'away'})}}
function mockPrune89(w,rooms){const now=mockNow();
  for(const L of rooms||Object.values(w.lobbies)){if(!L||L.status!=='waiting'||L.mock)continue;let ch=false;
    for(const m of (L.members||[]).slice()){if(/^bot/.test(m.id))continue;const a=w.accounts[m.id];const seen=(a&&a.seen)||0;
      if(seen&&now-seen>ONL89.drop)ch=ONLC.roomOffMark(L,m.id,seen+ONL89.drop)||ch;else if(seen)ch=ONLC.roomOffClear(L,m.id)||ch}
    const gone=ONLC.roomGoneIds(L,now,ONL89.grace);for(const id of gone){if(L.status!=='waiting')break;mockLeave89(w,L,id,'away');ch=false}
    if(ch&&L.status==='waiting')mockUpd80(w,L)}}
{const base=mockList80;mockList80=function(w,me){mockPrune89(w);const rows=base.apply(this,arguments);
  return rows.filter(r=>{const L=w.lobbies[r.id];if(!L)return true;const mine=(L.members||[]).some(m=>m.id===me)||(L.players||[]).some(p=>p.id===me)||(L.stands||[]).some(s=>s.id===me);return mine||!ONLC.roomHostAway(L)})}}
MOCK_ROUTES['lobby.get']=(w,d,me)=>{const L=w.lobbies[d&&d.id];if(!L||L.status==='done')return {gone:'closed'};mockPrune89(w,[L]);if(L.status==='done')return {gone:'closed'};
  const mine=(L.members||[]).some(m=>m.id===me)||(L.players||[]).some(p=>p.id===me)||(L.stands||[]).some(s=>s.id===me);return mine?{lobby:mockRoomOut80(w,L)}:{lobby:ONLC.liteRow(L),gone:'left'}};
/* the tab goes: no time for the mock's 30–90 ms wait — the route runs here and now */
function mockReqSync89(t,d){const R=MOCK_ROUTES[t];if(!R)return null;const w=mockLoad();const me=mockMe();const sn=mockSeen80(me);for(const a of Object.values(w.accounts||{}))if(sn[a.id]&&!(a.seen>=sn[a.id]))a.seen=sn[a.id];
  mockSeedWorld(w);mock80Fix(w);MOCK_OUT=[];let out=null;try{out=R(w,d||{},me)}catch(e){MOCK_OUT=[];return null}mockSave(w);const q=MOCK_OUT;MOCK_OUT=[];mockFlush80(q);return out}

/* ---------------- 1b. CLIENT: leave on close, the room ping, the marks on screen ---------------- */
/* the Online window is up: a window is open and #onl is in it (a closed window keeps its last body) */
function onl89WinUp(){const el=document.getElementById('onl');return !!(el&&CUR_MODAL&&!el.closest('[hidden]'))}
function onl89Room(){try{return ONL.acct?onlWaitRoom80():null}catch(e){return null}}
function onl89LeaveNow(sync){const L=onl89Room();if(!L||ONL89.noLeave)return false;if(S&&S.onl&&!S.over)return false;
  if(sync){if(NET.mode==='aws'){const ws=typeof NETWS!=='undefined'&&NETWS.ws;if(ws&&ws.readyState===1)try{ws.send(JSON.stringify({t:'lobby.leave',id:++NETWS.seq,d:{id:L.id}}))}catch(e){}}
    else mockReqSync89('lobby.leave',{id:L.id});return true}
  NET.req('lobby.leave',{id:L.id}).then(r=>{if(r&&r.id)onlUpsert80(r)}).catch(()=>{});return true}
/* the Online window closed (not replaced by another Online screen, not for the horns): leave the waiting room */
{const base=onlineOpen;onlineOpen=async function(){try{return await base.apply(this,arguments)}finally{setTimeout(()=>{try{if(!onl89WinUp())onl89LeaveNow(false)}catch(e){}},700)}}}
window.addEventListener('pagehide',()=>{try{onl89LeaveNow(true)}catch(e){}});
/* the room screen asks every 30 s: the server tidies that room (gone lanistas out, marks cleared) */
setInterval(()=>{try{if(!onl89WinUp())return;const L=onl89Room();if(!L)return;const now=Date.now();if(now-ONL89.pingAt<ONL89.ping)return;ONL89.pingAt=now;
  NET.req('lobby.get',{id:L.id}).then(r=>{if(!r)return;const me=onlMe80();const i=(ONL.lobbies||[]).findIndex(x=>x.id===L.id);const o=i>=0?ONL.lobbies[i]:null;
    if(r.gone==='closed'){if(i>=0)ONL.lobbies.splice(i,1);onlToast80(_T('🚪 The room closed.'));onlUp80();return}
    const X=r.lobby;if(!X)return;const inIt=(X.members||[]).some(m=>m.id===me)||(X.stands||[]).some(s=>s.id===me);
    if(!inIt){if(i>=0)ONL.lobbies.splice(i,1);onlUp80();return}
    if(!o||JSON.stringify(o)!==JSON.stringify(X)){onlUpsert80(X);onlUp80()}}).catch(()=>{})}catch(e){}},1000);
NET.on('lobby.update',d=>{if(d&&d.gone89&&ONL.acct)onlToast80(_T('🔌 You were away too long — you left the room.'))});
/* the room screen: "Host reconnecting…" and dimmed seats */
const onl89Off=L=>Object.keys((L&&L.off)||{}).filter(id=>(L.members||[]).some(m=>m.id===id));
{const base=onlRoomHTML80;onlRoomHTML80=function(L,grey){const h=base.apply(this,arguments);try{const off=onl89Off(L);if(grey||!off.length)return h;const me=onlMe80();
    const T=document.createElement('template');T.innerHTML=h;const seats=T.content.querySelectorAll('.r80-seats > .r80-seat');
    const tag=()=>{const s=document.createElement('small');s.className='r89-rc';s.textContent=_T('reconnecting…');return s};
    L.players.forEach((p,i)=>{if(off.includes(p.id)&&seats[i]){seats[i].classList.add('off89');const w=seats[i].querySelector('.r80-who');if(w)w.appendChild(tag())}});
    const standing=(L.members||[]).filter(m=>!L.players.some(p=>p.id===m.id));const sm=T.content.querySelectorAll('.r80-stand .r80-sm');
    standing.forEach((m,i)=>{if(off.includes(m.id)&&sm[i]){sm[i].classList.add('off89');sm[i].appendChild(tag())}});
    if(off.includes(L.host.id)&&L.host.id!==me){const main=T.content.querySelector('.r80-main');if(main){const b=document.createElement('p');b.className='r89-hostoff';
      b.textContent=_T`👑 Host reconnecting… — the room passes to the longest-waiting lanista if they are not back within ${Math.round(ONLC.ROOM_GRACE/1000)} s.`;main.insertBefore(b,main.firstChild)}}
    return T.innerHTML}catch(e){console.error(e);return h}}}

/* ---------------- 2. MANAGE ONLINE: orders in the lockstep ---------------- */
const G89={fly:[],mine:new Set(),busy:false,toastAt:0};
const g89Q=seat=>((S&&S.gear89)||{})[seat]||[];
function g89Me(){return S&&S.onl&&ONLM.me>=0?S.players[ONLM.me]||null:null}
/* the place every client carries a seat's orders out: that gladiator's own settled decision */
function g89AtTurn(seat){return !!(onlmOn()&&!S.busy&&!CUR_MODAL&&!ONLM.pend&&!(typeof RESPONDER!=='undefined'&&RESPONDER)&&['choice','action','command'].includes(S.phase)&&onlmActor()===seat)}
{const base=gear88Ok;gear88Ok=function(p){if(!(S&&S.onl))return base.apply(this,arguments);
  if(!onlmOn()||S.onl.watch||!p||g89Me()!==p||(ONLM.left||{})[ONLM.me]!=null)return false;
  return !!(!S.over&&!p.cpu&&p.alive!==false&&!p.out&&!p.underground&&cur()!==p&&!ATK88.has(p)&&S.phase!=='setup')}}
/* the take options as stable keys (kind + name + where it lies) */
const g89Key=o=>({t:o.t,n:o.label,src:o.pl?o.pl.name:'sand'});
const g89Same=(a,b)=>a.t===b.t&&a.n===b.n&&a.src===b.src;
function g89Queued(){const q=g89Q(ONLM.me).concat(G89.fly);return q}
function g89Send(op){const p=g89Me();if(!p||!gear88Ok(p))return;const inp={k:'gear',seat:ONLM.me,...op};G89.fly.push(op);render();
  NET.req('match.input',{id:S.onl.lobby,in:inp}).then(r=>{G89.fly.splice(G89.fly.indexOf(op),1);if(!r||!Number.isInteger(r.seq))return;G89.mine.add(r.seq);ONLM.own.delete(r.seq);
    if(r.seq>=ONLM.next&&!ONLM.q.some(x=>x.seq===r.seq)){ONLM.q.push({...inp,from:'self89',seq:r.seq});ONLM.q.sort((a,b)=>a.seq-b.seq)}onlmPump()})
  .catch(e=>{const i=G89.fly.indexOf(op);if(i>=0)G89.fly.splice(i,1);onlToast80(_T('⚠ The server did not take that order: ')+esc(e.message));render()})}
/* the bar online: ⇄ swap and one button per piece lying here; queued orders wait for your turn */
{const base=gear88Bar;gear88Bar=function(p){if(!(S&&S.onl))return base.apply(this,arguments);if(!p||g89Me()!==p)return '';const q=g89Queued();const ok=gear88Ok(p);if(!ok&&!q.length)return '';
  const arms=armsAttached(p);const canSwap=ok&&arms.length===2&&(p.wR||p.wL)&&!q.some(x=>x.op==='swap');
  const opts=ok?gear88Opts(p).filter(o=>!q.some(x=>x.op==='take'&&g89Same(x,g89Key(o)))):[];
  if(!canSwap&&!opts.length&&!q.length)return '';
  const qs=q.map(x=>x.op==='swap'?_T('⇄ swap hands'):_T`take ${esc(x.n)}`).join(' · ');
  return `<div class="gb88 gb89" data-pid="${p.id}"><span class="gb88h">${_T`🎒 Manage`}</span>${canSwap?`<button type="button" class="btn tksm" data-gear89="swap">${_T`⇄ Swap hands`}</button>`:''}${opts.map((o,j)=>`<button type="button" class="btn tksm primary" data-gear89="take" data-j="${j}" title="${esc(o.sub||'')}">${_T`Take ${esc(o.label)}`}</button>`).join('')}
    ${q.length?`<small class="gb89q">${_T`⏳ ${qs} — carried out as your turn begins`}</small>`:''}</div>`}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-gear89]');if(!b)return;e.preventDefault();e.stopPropagation();const p=g89Me();if(!p||!gear88Ok(p))return;
  if(b.dataset.gear89==='swap'){g89Send({op:'swap'});onlToast80(_T('🎒 ⇄ Ordered — your hands swap as your turn begins (online, orders wait for your turn).'));return}
  const q=g89Queued();const opts=gear88Opts(p).filter(o=>!q.some(x=>x.op==='take'&&g89Same(x,g89Key(o))));const o=opts[+b.dataset.j];if(!o)return;
  g89Send({op:'take',...g89Key(o)});onlToast80(_T`🎒 Ordered — you take ${esc(o.label)} as your turn begins.`)},true);
/* the mock echoes my own order back: queued like anyone else's (113 would count it as already applied); match.get catch-ups too */
{const base=NET.emit;NET.emit=function(t,d){if(t==='match.input'&&d&&d.in&&d.in.k==='gear'&&ONL.acct&&d.in.from===ONL.acct.id){G89.mine.add(d.in.seq);d={...d,in:{...d.in,from:'self89'}}}return base.call(this,t,d)}}
{const base=NET.req;NET.req=function(t,d){const p=base.apply(this,arguments);if(t!=='match.get'||!p||typeof p.then!=='function')return p;
  return p.then(g=>{if(g&&Array.isArray(g.inputs)&&ONL.acct)g.inputs=g.inputs.map(x=>x&&x.k==='gear'&&x.from===ONL.acct.id?(G89.mine.add(x.seq),{...x,from:'self89'}):x);return g})}}
{const base=onlmPump;onlmPump=function(){for(const s of G89.mine)ONLM.own.delete(s);return base.apply(this,arguments)}}
/* an order is filed when it reaches the head of the stream; other moves wait while orders are being carried out, and a seat's move
   waits for its own orders at its turn */
{const base=onlmReady;onlmReady=function(inp){if(inp&&inp.k==='gear')return !!(S&&!S.over);
  if(inp&&inp.k!=='modal'&&S&&!S.over){if(G89.busy)return false;if(g89Q(inp.seat).length&&g89AtTurn(inp.seat)){setTimeout(g89Flush,0);return false}}return base.apply(this,arguments)}}
{const base=onlmApply;onlmApply=function(inp){if(!inp||inp.k!=='gear')return base.apply(this,arguments);
  ONLM.hlog['s'+inp.seq]='g89';const seat=inp.seat|0;const p=S.players[seat];
  if(p&&onlmHuman(seat)&&(inp.op==='swap'||inp.op==='take')){S.gear89=S.gear89||{};const q=S.gear89[seat]=S.gear89[seat]||[];if(q.length<8)q.push(inp.op==='swap'?{op:'swap'}:{op:'take',t:String(inp.t||''),n:String(inp.n||''),src:String(inp.src||'')})}
  setTimeout(g89Flush,0);setTimeout(onlmPump,30)}}
/* nothing is snapshotted while orders are being carried out */
{const base=onlmSettled;onlmSettled=function(){return !G89.busy&&base.apply(this,arguments)}}
/* your own board waits for your orders (in flight, or not yet carried out) at your turn */
{const base=onlmMine;onlmMine=function(){const r=base.apply(this,arguments);if(!r||!onlmOn()||ONLM.me<0)return r;
  if(onlmActor()===ONLM.me&&(G89.fly.length||g89Q(ONLM.me).length||G89.busy)){setTimeout(g89Flush,0);if(Date.now()-G89.toastAt>4000){G89.toastAt=Date.now();onlToast80(_T('🎒 Carrying out your orders…'))}return false}return r}}
async function g89Flush(){if(G89.busy||!onlmOn())return;const c=cur();const seat=c?S.players.indexOf(c):-1;if(seat<0||!g89Q(seat).length||!g89AtTurn(seat))return;
  G89.busy=true;const G=S;try{const q=S.gear89[seat];while(q.length&&G===S&&!S.over){const o=q.shift();await g89Do(c,o)}}catch(e){console.error(e)}
  finally{G89.busy=false;if(G===S&&S){render();setTimeout(onlmPump,30)}}}
async function g89Do(p,o){if(!p||p.alive===false||p.out||p.underground)return;
  if(o.op==='swap'){if(armsAttached(p).length!==2||!(p.wR||p.wL))return;const r=p.wR,l=p.wL;p.wR=l||null;p.wL=r||null;if(p.armUses){const u=p.armUses.R;p.armUses.R=p.armUses.L;p.armUses.L=u}
    log(_T`🎒 ${nm(p)} swaps hands: ${p.wR?esc(p.wR.n):_T('nothing')} is now primary, ${p.wL?esc(p.wL.n):_T('nothing')} secondary.`);return}
  if(o.op==='take'){const opt=gear88Opts(p).find(x=>g89Same(g89Key(x),o));if(!opt){log(_T`🎒 ${nm(p)} reaches for ${esc(o.n)} — it is no longer there.`,'thought');return}
    ONLM.uiAt=0;const was=p.looted;try{await doLoot(p,opt)}finally{p.looted=was}}}
setInterval(()=>{try{if(onlmOn()&&!G89.busy)g89Flush()}catch(e){}},200);
/* CPUs tidy up between turns online too — the same on every screen (not on the opening's first beginTurn: the joiners begin it again) */
{const base=gear88Cpu;gear88Cpu=async function(){if(!S||S.over||!S.onl)return base.apply(this,arguments);if(!(S.turnNo>0))return;const c=cur();
  for(const p of S.players||[]){if(!p.cpu||p===c||p.alive===false||p.out||p.underground)continue;
    for(let k=0;k<6;k++){const opts=gear88Opts(p).filter(o=>{if(o.t==='a'){const a=o.pl.armor[o.i];const d=a&&ARM[a.key];return !!d&&sideLocs(d).some(l=>p.hp[l]>0&&!armorConflict(p,l,a.key))}
        return armsAttached(p).some(x=>!p['w'+x])}).sort((x,y)=>(y.val||0)-(x.val||0));if(!opts.length)break;
      const was=p.looted;try{await doLoot(p,opts[0])}catch(e){break}finally{p.looted=was}}}}}
{const css=document.createElement('style');css.textContent=`
.r80-seat.off89,.r80-sm.off89{opacity:.45;filter:grayscale(.6)}
.r89-rc{display:block;color:var(--muted);font-style:italic}
.r89-hostoff{margin:0 0 8px;padding:6px 10px;border:1px dashed rgba(232,196,106,.5);border-radius:8px;background:rgba(232,196,106,.08);font-size:13px}
.gb89q{flex-basis:100%;color:var(--muted)}`;document.head.appendChild(css)}
