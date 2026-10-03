/* The online arena's requests — the same names and answers as the game's mock server (src/112-online.js + 118-onl80.js MOCK_ROUTES).
   route(t, d, ctx) → answer (throws Error with a player-facing message). ctx = {acct, conn}.
   push(acctId, type, data) sends to that account's open connection (one ACCT read);
   pushConn(connId, type, data, acctId) sends to a known connection and returns true when it is gone (the caller then falls back).
   v0.80 (protocol 4): ROOMS (members who sit or stand, host hand-off, kick, event/seat/team settings — the rules are ONLC's),
   quick chat (phrase codes only: lobby.say / match.say / forum.say; lobby.chat is gone), the Praeco (lobby.quick, 📣 lobby.call,
   ✉ lobby.invite, ⚔ lobby.again), the Forum (FORUM lines, mutes, a daily push meter), presence (ACCT GSI1PK 'ON' while a socket
   is open → here()), and majority-resync helpers (match.hashq / hasha / odd). Every lobby.update push carries the room. */
'use strict';
const C=require('./onlcore.js');
const DAY=86400;
const HERE_MS=2*3600e3+5*60e3; /* API Gateway closes a socket after 2 h: older presence entries are stale */
const FORUM_KEEP=30;
function makeRoutes({store,push,pushConn=null,catalog,now=()=>Date.now(),rnd=()=>Math.random(),dev=false,hereMs=0}){
  const ttl=days=>Math.floor(now()/1000)+days*DAY;
  const acctOf=async id=>id?await store.get('ACCT#'+id,'PROFILE'):null;
  /* the account's ACTIVE gladiator (v0.79: up to 3 living, one active) — the one that fights, bets and buys tickets */
  const liveChar=async(acct,A)=>{const all=(await store.byIndex('OWNER#'+acct)).filter(c=>c.alive);if(!all.length)return null;if(A===undefined)A=await acctOf(acct);return all.find(c=>A&&c.id===A.active)||all[all.length-1]};
  const charById=async cid=>cid?await store.get('CHAR#'+cid,'CHAR'):null;
  const lobbies=()=>store.byIndex('LOBBIES');
  /* in a waiting room (sitting or standing) or seated in a live match */
  const inRoom=(L,a)=>L.players.some(p=>p.id===a)||(L.status==='waiting'&&!!C.memberOf(L,a));
  const inStands=(L,a)=>(L.stands||[]).some(s=>s.id===a);
  /* the gladiator a lanista is fighting with right now (a waiting room or a live match): edits wait until it is over */
  async function busyIn(acct){for(const L of await lobbies())if((L.status==='waiting'||L.status==='live')&&inRoom(L,acct))return L;return null}
  const getLobby=async id=>{const L=await store.get('LOBBY#'+id,'LOBBY');if(!L)throw new Error('That game is gone.');L.members=L.members||[];L.players=L.players||[];return L};
  /* v0.80: rooms and gladiators are written only over the version that was read (L.rev / ch.rev): two requests at once can never both
     spend, refund or join on the same copy. A request that loses gets 'try again'; the server's own bookkeeping retries (editLobby/editChar). */
  const lobbyItem=L=>({...L,GSI1PK:L.status==='done'?'LOBBIES_DONE':'LOBBIES',GSI1SK:L.created,ttl:ttl(2)});
  const putLobby=async L=>{const rev=await store.putRev('LOBBY#'+L.id,'LOBBY',lobbyItem(L));if(rev===false)throw new Error('The room changed a moment ago — try again.');L.rev=rev;return rev};
  async function editLobby(id,fn){for(let i=0;i<6;i++){const L=await store.get('LOBBY#'+id,'LOBBY');if(!L)return null;L.members=L.members||[];L.players=L.players||[];
      if((await fn(L))===false)return null;const rev=await store.putRev('LOBBY#'+id,'LOBBY',lobbyItem(L));if(rev!==false){L.rev=rev;return L}}throw new Error('The room is busy — try again.')}
  const charItem=ch=>({...ch,GSI1PK:'OWNER#'+ch.owner,GSI1SK:ch.born});
  const putChar=async ch=>{const rev=await store.putRev('CHAR#'+ch.id,'CHAR',charItem(ch));if(rev===false)throw new Error('Your gladiator changed a moment ago — try again.');ch.rev=rev;return rev};
  async function editChar(cid,fn){for(let i=0;i<6;i++){const ch=cid?await store.get('CHAR#'+cid,'CHAR'):null;if(!ch)return null;if((await fn(ch))===false)return null;
      const rev=await store.putRev('CHAR#'+cid,'CHAR',charItem(ch));if(rev!==false){ch.rev=rev;return ch}}throw new Error('Busy — try again.')}
  /* coin into a lanista's active gladiator (refunds, payouts) */
  async function credit(acct,v){if(!v)return;const c=await liveChar(acct);if(c)await editChar(c.id,ch=>{if(!ch.alive)return false;ch.wallet=(ch.wallet||0)+v})}
  const strip=x=>{if(!x)return x;const y={...x};for(const k of ['PK','SK','GSI1PK','GSI1SK','ttl'])delete y[k];return y};
  /* the whole room, for its own members (lists get C.liteRow) */
  const room=L=>{const y=strip(L);delete y.chat;return y};
  const lite=L=>C.liteRow(strip(L));
  const id=p=>p+now().toString(36)+Math.floor(rnd()*1e6).toString(36);
  const flagOf=A=>!!A&&(A.strikes||0)>=C.STRIKES_OUT;
  /* how others see a lanista online: the gladiator's name, never the sign-in (Google) name */
  const nameOf=(A,ch)=>(ch&&ch.name)||(A&&A.here&&A.here.glad)||'A lanista';
  /* a room row as the Forum keeps it (the live push carries the whole list row) */
  const tinyRow=r=>r?{id:r.id,ev:r.ev,loc:r.loc,ranked:!!r.ranked,rank:r.rank||null,seats:r.seats,n:(r.players||[]).length,team:!!r.team}:undefined;
  /* the match a lanista's gladiator is still fighting in (a CPU may hold the seat; a ticket holder is not fighting): no new room or ticket until it ends or they abandon it */
  async function stillFighting(A){if(!A||!A.match)return null;const M=await store.get('MATCH#'+A.match,'META');
    if(M&&M.status==='live'&&(M.players||[]).includes(A.id)&&!(M.abandoned||{})[A.id])return M;if(!M||M.status!=='live')await store.set('ACCT#'+A.id,'PROFILE',{match:null});return null}
  const ts13=t=>String(t).padStart(13,'0');

  /* ── presence: ACCT items with GSI1PK 'ON' (set on $connect, removed by a conditional clear on $disconnect / a gone push) ── */
  let hereC=null,hereAt=0;
  async function here(){const t=now();if(hereMs&&hereC&&t-hereAt<hereMs)return hereC;
    hereC=(await store.byIndex('ON')).filter(A=>A.conn&&t-(A.GSI1SK||0)<HERE_MS&&!/^bot/.test(A.id));hereAt=t;return hereC}
  const hereMap=async()=>new Map((await here()).map(A=>[A.id,A]));

  /* ── pushes: known connections first (no ACCT read), in batches of 10; a gone socket falls back to one fresh read ── */
  const muting=(A,by)=>!!(by&&A&&(A.mutes||[]).includes(by));
  async function sendOne(acct,type,data,A,by){
    if(pushConn&&A&&A.conn){if(muting(A,by))return;if(!(await pushConn(A.conn,type,data,acct)))return}
    const F=await acctOf(acct);if(!F||muting(F,by))return;
    if(!pushConn)return push(acct,type,data);if(F.conn&&!(A&&F.conn===A.conn))await pushConn(F.conn,type,data,acct)}
  async function batches(jobs){for(let i=0;i<jobs.length;i+=10)await Promise.all(jobs.slice(i,i+10).map(f=>f()))}
  /* send to accounts by id (o.by: skip those muting that lanista; o.except: skip one) */
  async function deliver(ids,type,data,o={}){const H=await hereMap();const seen=new Set();const jobs=[];
    for(const a of ids){if(!a||seen.has(a)||/^bot/.test(a)||a===o.except)continue;seen.add(a);jobs.push(()=>sendOne(a,type,data,H.get(a),o.by))}await batches(jobs)}
  /* send to presence entries already read (fan-outs) */
  async function fan(As,type,data){await batches(As.map(A=>()=>sendOne(A.id,type,data,A,null)))}
  const roomIds=(L,extra)=>(L.members||[]).map(m=>m.id).concat(L.players.map(p=>p.id),(L.stands||[]).map(s=>s.id),extra||[]);
  /* every member, seated player and ticket holder hears the changed room */
  const toRoom=(L,extra,o)=>deliver(roomIds(L,o&&o.also),'lobby.update',{id:L.id,lobby:room(L),...(extra||{})},o);

  /* a live match keeps its players' connections in its META record: pushes need no account reads */
  const toMatch=async(M,type,data,except)=>{for(const [a,c] of Object.entries(M.conns||{}))if(a!==except){if(c&&pushConn){if(await pushConn(c,type,data,a))await push(a,type,data)}else await push(a,type,data)}
    for(const [a,c] of Object.entries(M.watch||{}))if(a!==except&&c&&!(M.conns||{})[a]){if(pushConn)await pushConn(c,type,data,a);else await push(a,type,data)}};
  /* who may speak in a match: its fighters and its ticket holders (seats after the fighters); watchers only listen */
  const inMatch=(M,a)=>(M.players||[]).includes(a)||(M.specs||[]).includes(a);
  const liveHumans=M=>(M.players||[]).concat(M.specs||[]).filter(a=>!(M.dropped||{})[a]&&!(M.abandoned||{})[a]);
  const connOf=(M,a)=>(M.conns||{})[a]||(M.watch||{})[a]||null;
  /* the lanista and, when they lead a party, everyone in it — as room members. Names = the active gladiator's.
     Returns {g, list} (list = the LOBBIES read, reused by lobby.quick). o.except: the room being joined. */
  async function groupOf(acct,o={}){const a=await acctOf(acct);const P=a&&a.party?await store.get('PARTY#'+a.party,'PARTY'):null;
    if(P&&P.leader!==acct)throw new Error('Your party leader picks the game.');const ids=P?P.members:[acct];const g=[];
    for(const m of ids){const A=m===acct?a:await acctOf(m);if(!A)continue;
      if(await stillFighting(A))throw new Error(m===acct?'Your gladiator is still fighting a match — go back to it (⚔ Rejoin) or abandon it first.':'Someone in your party is still in a match.');
      const ch=await liveChar(m,A);g.push({id:m,name:nameOf(A,ch),char:ch&&ch.id,rank:ch?C.rankFor(ch).k:'tiro',kit:C.kitOf(ch),party:P?P.id:undefined,strikes:A.strikes||0})}
    const list=await lobbies();
    for(const L of list)if(L.status==='waiting'&&L.id!==o.except&&g.some(w=>inRoom(L,w.id)))throw new Error(g.length>1?'Someone in your party is already in a room.':'You are already in a room.');
    return {g,list}}
  async function partyOut(P){if(!P)return null;const y=strip(P);y.names={};for(const m of P.members||[]){const A=await acctOf(m);y.names[m]=nameOf(A,A&&await liveChar(m,A))}return y}
  const toParty=async(P,type,data)=>{for(const m of P.members)await push(m,type,data)};
  const meta=async id=>{const M=await store.get('MATCH#'+id,'META');if(!M)throw new Error('No such match.');return M};
  const liveOrLast=async acct=>(await liveChar(acct))||(await store.byIndex('OWNER#'+acct))[0]||null;

  /* ── the Forum: FORUM | L#<ts13>#<acct4>, the last 30 shown; pushes counted per UTC day (FMETER) ── */
  async function forumLines(){return (await store.query('FORUM','L#',{limit:FORUM_KEEP,desc:true})).reverse().map(strip)}
  async function forumPut(line){const at=now();line={...line,at};await store.put('FORUM','L#'+ts13(at)+'#'+String(line.by||'x').slice(-4),{...line,...(line.row?{row:tinyRow(line.row)}:{}),ttl:ttl(1)});return line}
  /* the daily meter: true while pushes may go out (the lines are stored either way) */
  async function meterOK(n){if(!n)return false;const day=new Date(now()).toISOString().slice(0,10);return (await store.counter('WORLD','FMETER#'+day,'n',n))<C.RATE.meterDay}
  /* free lanistas who fit a room: here, not the caller, not in it, not fighting, the same strike flag, Ranked = the same rank,
     not muting the caller; the newest RATE.fanCap by connect time */
  async function fitFor(L,by){return (await here()).filter(A=>A.id!==by&&!A.match&&!C.memberOf(L,A.id)&&!L.players.some(p=>p.id===A.id)&&flagOf(A)===!!L.flag&&
    (!L.ranked||((A.here&&A.here.rank)||'tiro')===L.rank)&&!muting(A,by)).slice(0,C.RATE.fanCap)}
  async function forumOut(line,As){line=await forumPut(line);if(await meterOK(As.length))await fan(As,'forum.line',{line});return line}
  const roomLine=(k,L,by,name)=>({k,by,name,row:lite(L),need:Math.max(0,L.seats-L.players.length)});

  async function settleMatch(id,M,me){
    /* one settlement, however many reports arrive at once: only the request that flips the status settles */
    if(!(await store.flip('MATCH#'+id,'META','status','live','done'))){const M2=await meta(id);return M2.outs&&M2.outs[me]?{char:strip(await liveOrLast(me)),out:M2.outs[me]}:{pending:true}}
    let L=await getLobby(id);L.stands=L.stands||[];const A=C.agree(M.reports);M.status='done';M.doneAt=now();M.agreed=A;M.outs=M.outs||{};
    for(const a of A.minority)await store.counter('ACCT#'+a,'PROFILE','strikes');
    const dseats=[];
    if(!A.void)for(const a of M.players){if((M.abandoned||{})[a])continue;const pl=L.players.find(p=>p.id===a);const row=A.table.find(r=>r.seat===M.seats[a]);if(!pl||!row)continue;let out=null,before='tiro';
      const ch=await editChar(pl.char,c=>{if(!c.alive)return false;before=C.rankFor(c).k;out=C.applyResult(c,row,!!L.ranked)});if(!ch||!out)continue;M.outs[a]=out;dseats.push({acct:a,ch,before,row,out});
      if(out.died){const e={name:ch.name,cls:ch.cls,rank:ch.died.rank,lifeCF:ch.lifeCF,survived:ch.survived,diedAt:now(),why:out.hall?C.hallWhy(ch):''};
        if(out.hall){const H=await world('HALL');H.list=[e,...H.list].slice(0,200);await store.put('WORLD','HALL',H)}await news(out.hall?['🪦',`${ch.name} fell. The Hall of the Fallen keeps the name.`]:['🌫',`${ch.name} fell and is forgotten.`])}
      if(out.rankUp)await news(['⚔',`${ch.name} is now ${C.RANKS[C.rankIdx(out.rankUp)].n}.`])}
    if(dseats.length)await dayEdit(D=>C.dayFromMatch(D,{id,ev:L.ev,loc:L.loc,at:now(),ranked:!!L.ranked,seats:dseats}));
    /* the room closes first (retried over any concurrent change); the wagers and the pot pay out from what was closed */
    let st=null;L=await editLobby(id,X=>{if(X.status==='done')return false;st=null;if((X.bets||[]).length||X.pot){const wins=A.void?[]:A.table.filter(r=>r.won).map(r=>r.seat);const seatAcct={};X.players.forEach((p,i)=>{seatAcct[i]=p.id});
        st=C.settle(X.bets||[],wins,{pot:X.pot|0,tix:(X.stands||[]).map(s=>({by:s.id,amt:s.paid|0})),seatAcct,void:!!A.void});X.settled=st}X.status='done'})||L;
    if(st){for(const [by,v] of Object.entries(st.payouts))await credit(by,v);if(st.cut)await credit(L.host.id,st.cut)}
    await store.put('MATCH#'+id,'META',M);
    for(const a of M.players){const pl=L.players.find(p=>p.id===a);const c=(pl&&await charById(pl.char))||await liveOrLast(a);const msg={id,void:!!A.void,out:M.outs[a]||null,char:strip(c)};if(a!==me)await push(a,'match.settled',msg)}
    for(const a of M.players){const P=await acctOf(a);if(P&&P.match===id)await store.set('ACCT#'+a,'PROFILE',{match:null})}
    hereC=null;await toRoom(L);
    /* the Forum remembers the result: the winners' gladiator names (CPU seats read 'CPU') and the best winner's CF */
    const won=A.void?[]:A.table.filter(r=>r.won);const win=won.map(r=>{const p=L.players[r.seat];return p?p.name:'CPU'});
    const res={k:'res',by:id,ev:L.ev,loc:L.loc,win,cf:won.reduce((m,r)=>Math.max(m,r.f|0),0),void:!!A.void};
    const As=(await here()).filter(x=>!x.match&&!M.players.includes(x.id)&&!(M.specs||[]).includes(x.id));await forumOut(res,As);
    const mp=L.players.find(p=>p.id===me);return {char:strip((mp&&await charById(mp.char))||await liveOrLast(me)),out:M.outs[me]||null,void:!!A.void}}
  /* a death outside the results table (an abandoned Ranked gladiator): the same Fate bookkeeping */
  async function fallen(ch,out){if(out.died){const e={name:ch.name,cls:ch.cls,rank:ch.died.rank,lifeCF:ch.lifeCF,survived:ch.survived,diedAt:now(),why:out.hall?C.hallWhy(ch):''};
    if(out.hall){const H=await world('HALL');H.list=[e,...H.list].slice(0,200);await store.put('WORLD','HALL',H)}await news(out.hall?['🪦',`${ch.name} fell. The Hall of the Fallen keeps the name.`]:['🌫',`${ch.name} abandoned the sand — Damnatio. Forgotten.`])}}
  /* refund every wager and ticket of a game that is called off */
  /* the refunds of a game called off (computed on the copy being closed; paid only after that close was written) */
  function refundsOf(L){const st=C.settle(L.bets||[],[],{tix:(L.stands||[]).map(s=>({by:s.id,amt:s.paid|0})),void:true});L.bets=[];L.pool=0;L.pot=0;return st.payouts}
  async function payAll(pay){for(const [by,v] of Object.entries(pay||{}))await credit(by,v)}
  /* shut a match nobody is playing any more: void (wagers and tickets back), the lobby leaves the list */
  async function closeMatch(id,why){let pay=null;const L=await editLobby(id,X=>{if(X.status==='done')return false;pay=refundsOf(X);X.status='done';X.closed=why});if(!L)return;
    const M=await store.get('MATCH#'+id,'META');if(M&&M.status==='live'&&(await store.flip('MATCH#'+id,'META','status','live','done'))){await store.set('MATCH#'+id,'META',{doneAt:now(),closed:why})}
    await payAll(pay);for(const p of L.players)if(!/^bot/.test(p.id)){const P=await acctOf(p.id);if(P&&P.match===id)await store.set('ACCT#'+p.id,'PROFILE',{match:null})}
    await toRoom(L,{closed:why})}
  /* tidy the list: a waiting game whose host left 5+ minutes ago, a waiting game older than 3 hours, a live match with no human left
     (all abandoned or dropped) or nobody connected for 10 minutes */
  async function prune(list){const t=now();const out=[];const H=await hereMap();for(const L of list){try{
      if(L.status==='waiting'){const on=H.get(L.host.id);const Hs=on?null:await acctOf(L.host.id);if(t-(L.created||0)>3*3600e3||(Hs&&!Hs.conn&&Hs.offAt&&t-Hs.offAt>5*60e3)){await closeMatch(L.id,'host gone');continue}}
      if(L.status==='live'){const M=await store.get('MATCH#'+L.id,'META');if(M&&M.status==='live'){const left=(M.players||[]).filter(a=>!(M.abandoned||{})[a]&&!(M.dropped||{})[a]);
        const awayAll=left.length&&left.every(a=>(M.away||{})[a]&&t-M.away[a]>10*60e3);if(!left.length||awayAll){await closeMatch(L.id,'empty');continue}}}
      out.push(L)}catch(e){out.push(L)}}return out}
  const world=async k=>(await store.get('WORLD',k))||{list:[]};
  const news=async line=>{const N=await world('NEWS');N.list=[line,...N.list].slice(0,12);await store.put('WORLD','NEWS',N)};
  /* ☀ Today in the arena (WORLD DAY#<utc day>): versioned edits, never allowed to break a settlement */
  let dayC=null,dayAt=0;
  async function dayEdit(fn){try{const k='DAY#'+C.dayKey(now());for(let i=0;i<6;i++){const X=(await store.get('WORLD',k))||{};const D=fn(X)||X;
      if((await store.putRev('WORLD',k,{...D,ttl:ttl(3)}))!==false){dayC=null;return}}}catch(e){}}
  /* today's record, or yesterday's while today's is still empty */
  async function today(){const t=now();if(hereMs&&dayC&&t-dayAt<hereMs)return dayC;const D=await store.get('WORLD','DAY#'+C.dayKey(t));
    let out=C.dayOut(D,'today');if(!C.dayHas(D)){const Y=await store.get('WORLD','DAY#'+C.dayKey(t-86400e3));if(C.dayHas(Y))out=C.dayOut(Y,'yesterday')}dayC=out;dayAt=t;return out}
  /* a lobby list for one lanista: their strike flag only; liteRow for every room but their own (full) */
  const listFor=(list,acct,f)=>{const mine=L=>inRoom(L,acct)||inStands(L,acct);const rows=list.filter(L=>!!L.flag===f);
    const out=rows.filter(mine).map(room).concat(rows.filter(L=>!mine(L)).slice(0,60).map(lite));
    while(out.length>1&&JSON.stringify(out).length>90000)out.pop();return out};

  /* ✉ one invitation (the rules are the same for lobby.invite and lobby.again); '' or the reason */
  async function inviteOne(L,me,meName,to,o={}){if(!to||to===me)return 'Pick a lanista.';const H=await hereMap();if(!H.get(to))return 'Not in the arena now.';
    const T=await acctOf(to);if(!T||!T.conn)return 'Not in the arena now.';if(T.match&&T.match!==o.again)return 'Fighting right now.';if(C.memberOf(L,to)||L.players.some(p=>p.id===to))return 'Already in the room.';if(inStands(L,to))return 'They hold a ticket to this game.';
    if(flagOf(T)!==!!L.flag)return 'They cannot join this game.';
    if(L.ranked){let r=T.here&&T.here.rank;if(!r){const tc=await liveChar(to,T);r=tc?C.rankFor(tc).k:'tiro'}if(r!==L.rank)return `Ranked: ${(C.RANKS[C.rankIdx(L.rank)]||C.RANKS[0]).n} only.`}
    const P='ACCT#'+me,S='PROFILE',t=now();
    if(o.gap!==false&&!(await store.rate(P,S,'ivAt',C.RATE.invGap,t)))return 'Slow down.';
    if(!(await store.rate(P,S,'iv_'+to,C.RATE.invSame,t)))return 'You invited them already.';
    if(!(await store.quota(P,S,'ivH',Math.floor(t/3600e3),C.RATE.invHour)))return 'Enough invitations for this hour.';
    /* a muting lanista never hears it (and the inviter is not told) */
    if(!muting(T,me)){const msg={row:lite(L),from:meName,fromId:me};if(pushConn)await pushConn(T.conn,'lobby.invite',msg,to);else await push(to,'lobby.invite',msg)}return ''}
  const memberName=(L,a)=>{const m=C.memberOf(L,a)||L.players.find(p=>p.id===a)||(L.stands||[]).find(s=>s.id===a);return m?m.name:'Lanista'};

  /* a new room for a group: newLobby + roomJoin; the Praeco's 'open' line unless cry === false (an 'open' counts as the first call) */
  async function makeRoom(d,acct,g){const me=g.find(w=>w.id===acct);if(d.ranked&&!me.char)throw new Error('Ranked needs a living gladiator.');
    const L=C.newLobby(d,{id:acct,name:me.name,char:me.char,rank:me.rank},id('L'),now());L.flag=g.some(w=>w.strikes>=C.STRIKES_OUT);if(d.quick)L.quick=1;
    const why=C.roomJoin(L,g.map(w=>{const x={...w};delete x.strikes;return x}),now());if(why)throw new Error(why);if(d.cry!==false)L.cry=[now()];await putLobby(L);return L}
  async function announce(L,acct){const As=await fitFor(L,acct);await forumOut(roomLine('open',L,acct,memberName(L,acct)),As)}
  const cleanG=g=>g.map(w=>{const x={...w};delete x.strikes;return x});

  const R={
    /* one request when the Online window opens: who you are, your gladiators, the rooms, presence, the Forum and the news */
    'hello':async(d,ctx)=>{const A=await acctOf(ctx.acct);const me=strip(A);const out={ver:C.VER,mode:'aws',me};if(d.all&&me){const chars=await store.byIndex('OWNER#'+ctx.acct);out.chars=chars.map(strip);const f=flagOf(me);
      const live=chars.filter(c=>c.alive);const ch=live.find(c=>c.id===me.active)||live[live.length-1]||null;out.active=ch?ch.id:null;
      /* the presence entry: gladiator, rank and time zone (written only when it changed) */
      const hr={glad:ch?ch.name:null,rank:ch?C.rankFor(ch).k:'tiro',tz:d.tz!=null?C.cleanTz(d.tz):((me.here&&me.here.tz)||'')};
      if(JSON.stringify(me.here||null)!==JSON.stringify(hr)){await store.set('ACCT#'+ctx.acct,'PROFILE',{here:hr});out.me={...me,here:hr};const c=(hereC||[]).find(x=>x.id===ctx.acct);if(c)c.here=hr}
      const list=await prune((await lobbies()).filter(L=>!!L.flag===f));out.lobbies=listFor(list,ctx.acct,f);
      const H=await here();out.here=C.hereSummary(H.map(x=>({id:x.id,match:x.match,tz:x.here&&x.here.tz})),list);out.online=out.here.n;out.forum=await forumLines();
      out.news=(await world('NEWS')).list.slice(0,8);out.challenges=C.weekChallenges(now());out.today=await today();out.party=me.party?await partyOut(await store.get('PARTY#'+me.party,'PARTY')):null;
      /* the match this lanista's gladiator is still in (also when a CPU holds the seat): the menu offers Rejoin / Abandon */
      const LM=await stillFighting(A);if(LM){const LL=list.find(x=>x.id===LM.id)||await store.get('LOBBY#'+LM.id,'LOBBY');out.live={id:LM.id,ev:LL&&LL.ev,loc:LL&&LL.loc,ranked:!!LM.ranked,dropped:!!(LM.dropped||{})[ctx.acct]}}
      /* one WebSocket frame is at most 128 KB: other rooms' rows go first */
      while(out.lobbies.length>1&&JSON.stringify(out).length>115000)out.lobbies.pop()}return out},
    'auth.signin':async(d,ctx)=>{if(!dev)throw new Error('Sign in with Google.');const name=C.cleanName(d.name);if(name.length<2)throw new Error('Your name: 2–24 letters.');
      const a={id:ctx.acct,name,since:now()};await store.put('ACCT#'+a.id,'PROFILE',a);return a},
    'auth.signout':async()=>({}),
    'char.mine':async(d,ctx)=>(await store.byIndex('OWNER#'+ctx.acct)).map(strip),
    'char.create':async(d,ctx)=>{const live=(await store.byIndex('OWNER#'+ctx.acct)).filter(c=>c.alive);if(live.length>=C.GLAD_MAX)throw new Error(`Up to ${C.GLAD_MAX} living gladiators.`);const ch=C.newChar(d,ctx.acct,id('g'),now());
      const A=await acctOf(ctx.acct);if(A&&!live.some(c=>c.id===A.active))await store.set('ACCT#'+A.id,'PROFILE',{active:ch.id});await putChar(ch);return strip(ch)},
    'char.active':async(d,ctx)=>{const ch=await charById(d.char);if(!ch||ch.owner!==ctx.acct||!ch.alive)throw new Error('Not yours.');if(await busyIn(ctx.acct))throw new Error('Finish or leave your game first.');
      await store.set('ACCT#'+ctx.acct,'PROFILE',{active:ch.id});return strip(ch)},
    'char.edit':async(d,ctx)=>{const ch=await charById(d.char);if(!ch||ch.owner!==ctx.acct)throw new Error('Not yours.');if(await busyIn(ctx.acct))throw new Error('Finish or leave your game first.');
      C.editChar(ch,d,catalog);await putChar(ch);return strip(ch)},
    'char.buy':async(d,ctx)=>{const ch=await store.get('CHAR#'+d.char,'CHAR');if(!ch||ch.owner!==ctx.acct)throw new Error('Not yours.');C.buy(ch,d.item,catalog);if(Array.isArray(ch.equip))ch.equip.push(d.item);await putChar(ch);return strip(ch)}, /* putChar is versioned: two buys at once cannot both spend one purse */
    'lobby.list':async(d,ctx)=>{const me=await acctOf(ctx.acct);const f=flagOf(me);return listFor(await prune((await lobbies()).filter(L=>!!L.flag===f)),ctx.acct,f)},
    /* v0.80: no free text online — phrases only (lobby.say) */
    'lobby.chat':async()=>{throw new Error('Quick chat only.')},
    /* ── ROOMS ── */
    'lobby.create':async(d,ctx)=>{const {g}=await groupOf(ctx.acct);const L=await makeRoom(d,ctx.acct,g);await toRoom(L,null,{except:ctx.acct});if(d.cry!==false)await announce(L,ctx.acct);return room(L)},
    'lobby.join':async(d,ctx)=>{const L=await getLobby(d.id);const {g}=await groupOf(ctx.acct,{except:L.id});
      if(!!L.flag!==g.some(w=>w.strikes>=C.STRIKES_OUT))throw new Error('That game is gone.');const why=C.roomJoin(L,cleanG(g),now());if(why)throw new Error(why);await putLobby(L);await toRoom(L,null,{except:ctx.acct});return room(L)},
    /* sit down (a party leader sits the standing party together) / stand up */
    'lobby.sit':async(d,ctx)=>{const L=await getLobby(d.id);const why=C.roomSit(L,ctx.acct,now());if(why)throw new Error(why);await putLobby(L);await toRoom(L,null,{except:ctx.acct});return room(L)},
    'lobby.stand':async(d,ctx)=>{const L=await getLobby(d.id);const why=C.roomStand(L,ctx.acct);if(why)throw new Error(why);await putLobby(L);await toRoom(L,null,{except:ctx.acct});return room(L)},
    'lobby.leave':async(d,ctx)=>{const L0=await store.get('LOBBY#'+d.id,'LOBBY');if(!L0)return {};
      /* a ticket holder gives the ticket back: refunded once, from the copy that removed it */
      if((L0.stands||[]).some(s=>s.id===ctx.acct)){let paid=0;const L=await editLobby(d.id,X=>{const t=(X.stands||[]).find(s=>s.id===ctx.acct);if(!t||X.status!=='waiting')return false;
          X.stands=X.stands.filter(s=>s!==t);X.tickets=X.stands.length;X.pot=Math.max(0,(X.pot|0)-(t.paid|0));paid=t.paid|0});
        if(!L)return room({...L0,members:L0.members||[],players:L0.players||[]});await credit(ctx.acct,paid);await toRoom(L,null,{except:ctx.acct});return room(L)}
      let was=[],closed=false,pay=null;const L=await editLobby(d.id,X=>{if(X.status!=='waiting'||!C.memberOf(X,ctx.acct)&&C.seatOf(X,ctx.acct)<0)return false;was=roomIds(X);pay=null;
        const r=C.roomLeave(X,ctx.acct,now());closed=r.closed;if(closed)pay=refundsOf(X)});
      if(!L)return room({...L0,members:L0.members||[],players:L0.players||[]});
      /* the room empties before the horns: every wager and ticket goes back */
      await payAll(pay);await deliver(was,'lobby.update',{id:L.id,lobby:room(L),...(closed?{closed:'empty'}:{})},{except:ctx.acct});return room(L)},
    /* 👑 give the room away */
    'lobby.host':async(d,ctx)=>{const L=await getLobby(d.id);const why=C.roomGiveHost(L,ctx.acct,d.to,now());if(why)throw new Error(why);await putLobby(L);await toRoom(L,null,{except:ctx.acct});return room(L)},
    /* the host removes a lanista (5 minutes before they may come back) */
    'lobby.kick':async(d,ctx)=>{const L=await getLobby(d.id);const why=C.roomKick(L,ctx.acct,d.who,now());if(why)throw new Error(why);await putLobby(L);await toRoom(L,null,{except:ctx.acct});
      await deliver([d.who],'lobby.update',{id:L.id,kicked:1});return room(L)},
    /* the host's settings until the horns: ev, loc, seats, ticket, abandon, standsOff, teams, autoBal */
    'lobby.set':async(d,ctx)=>{const L=await getLobby(d.id);const x={};for(const k of ['ev','loc','seats','ticket','abandon','standsOff','teams','autoBal'])if(d[k]!=null)x[k]=d[k];
      const why=C.roomSet(L,ctx.acct,x,now());if(why)throw new Error(why);await putLobby(L);await toRoom(L,null,{except:ctx.acct});return room(L)},
    'lobby.team':async(d,ctx)=>{const L=await getLobby(d.id);const why=C.roomTeam(L,ctx.acct,d.who||ctx.acct,d.team);if(why)throw new Error(why);await putLobby(L);await toRoom(L,null,{except:ctx.acct});return room(L)},
    'lobby.ready':async(d,ctx)=>{const L=await getLobby(d.id);if(L.status!=='waiting')throw new Error('Already under way.');const p=L.players.find(p=>p.id===ctx.acct);if(!p)throw new Error('Sit down first.');
      p.ready=!!d.ready;await putLobby(L);await toRoom(L,null,{except:ctx.acct});return room(L)},
    /* the horns: the unseated leave the room ('started without you'); Ranked teams are balanced */
    'lobby.start':async(d,ctx)=>{const L=await getLobby(d.id);const conn={};for(const p of C.humansOf(L)){const P=await acctOf(p.id);conn[p.id]=!!(P&&P.conn)||dev&&!pushConn}
      const why=C.canStart(L,ctx.acct,conn);if(why)throw new Error(why);const unseated=C.startRoom(L);
      L.status='live';L.seed=Math.floor(rnd()*2**31)>>>0;L.started=now();await putLobby(L);const humans=L.players.filter(p=>!/^bot/.test(p.id)).map(p=>p.id);const specs=(L.stands||[]).map(s=>s.id);const conns={};
      for(const a of humans.concat(specs)){const A=await acctOf(a);if(A){conns[a]=A.conn||null;await store.set('ACCT#'+a,'PROFILE',{match:L.id})}}
      const seats={};L.players.forEach((p,i)=>{if(humans.includes(p.id))seats[p.id]=i});specs.forEach((a,k)=>{seats[a]=L.seats+k});
      await store.put('MATCH#'+L.id,'META',{id:L.id,seed:L.seed,n:0,players:humans,specs,seats,conns,watch:{},away:{},dropped:{},abandoned:{},outs:{},reports:{},host:L.host.id,status:'live',ranked:!!L.ranked,abandon:C.abandonRule(L),standsOff:!!L.standsOff,ttl:ttl(2)});
      hereC=null;await toRoom(L,null,{except:ctx.acct});await deliver(unseated,'lobby.update',{id:L.id,started:1,unseated:1});return room(L)},
    /* playlists: sit in the fullest fitting room, else open one (and the Praeco cries it). No twin rooms. */
    'lobby.quick':async(d,ctx)=>{const ev=C.EVENTS_ALL.includes(d.ev)?d.ev:'democritus';const ranked=!!d.ranked;const {g,list}=await groupOf(ctx.acct);const flag=g.some(w=>w.strikes>=C.STRIKES_OUT);
      if(ranked&&!g.find(w=>w.id===ctx.acct).char)throw new Error('Ranked needs a living gladiator.');
      const tryJoin=async pick=>{const L=await store.get('LOBBY#'+pick.id,'LOBBY');if(!L||L.status!=='waiting')return null;L.members=L.members||[];
        if(L.seats-L.players.length<g.length)return null;if(C.roomJoin(L,cleanG(g),now()))return null;await putLobby(L);await toRoom(L,null,{except:ctx.acct});return L};
      const pick=C.quickPick(list,g,ev,ranked,flag,now());if(pick){const L=await tryJoin(pick);if(L)return {lobby:room(L),made:false}}
      const L=await makeRoom({ev,ranked,quick:1},ctx.acct,g);
      /* two playlists pressed at once: the later of two fresh twin rooms folds into the earlier one (both sides agree on the order) */
      const twin=(await lobbies()).filter(X=>X.id!==L.id&&X.quick&&X.status==='waiting'&&X.ev===ev&&!!X.ranked===ranked&&!!X.flag===flag&&(!ranked||X.rank===L.rank)&&
        ((X.created||0)<L.created||(X.created===L.created&&X.id<L.id))).sort((a,b)=>(a.created||0)-(b.created||0))[0];
      if(twin){const W=await store.get('LOBBY#'+twin.id,'LOBBY');if(W&&W.status==='waiting'){W.members=W.members||[];const X=JSON.parse(JSON.stringify(W));
        if(!C.roomJoin(X,cleanG(g),now())&&X.players.length-W.players.length===g.length){L.status='done';L.closed='merged';await putLobby(L);await putLobby(X);await toRoom(X,null,{except:ctx.acct});return {lobby:room(X),made:false}}}}
      await toRoom(L,null,{except:ctx.acct});await announce(L,ctx.acct);return {lobby:room(L),made:true}},
    /* 📣 the crier calls a waiting room with a free seat: up to RATE.cryMax a room (the opening counts), RATE.cryGap apart */
    'lobby.call':async(d,ctx)=>{const L=await getLobby(d.id);if(!C.memberOf(L,ctx.acct))throw new Error('Join the room first.');if(L.status!=='waiting')throw new Error('Already under way.');
      if(L.players.length>=L.seats)throw new Error('Every seat is taken.');L.cry=L.cry||[];if(L.cry.length>=C.RATE.cryMax)throw new Error('The crier has called three times.');
      const last=L.cry[L.cry.length-1]||0;if(now()-last<C.RATE.cryGap)throw new Error(`The crier needs a breath — ${Math.ceil((C.RATE.cryGap-(now()-last))/1000)} s.`);
      L.cry.push(now());await putLobby(L);await toRoom(L,null,{except:ctx.acct});const As=await fitFor(L,ctx.acct);await forumOut(roomLine('call',L,ctx.acct,memberName(L,ctx.acct)),As);return {left:C.RATE.cryMax-L.cry.length}},
    /* ✉ invite a lanista who is here, free and fits */
    'lobby.invite':async(d,ctx)=>{const L=await getLobby(d.id);if(!C.memberOf(L,ctx.acct))throw new Error('Join the room first.');if(L.status!=='waiting')throw new Error('Already under way.');
      const why=await inviteOne(L,ctx.acct,memberName(L,ctx.acct),d.to);if(why)throw new Error(why);return {}},
    /* ⚔ Again: a new room like the match just fought (no Praeco line), the other lanistas of that match invited */
    'lobby.again':async(d,ctx)=>{const M=await meta(d.id||d.lobbyId);if(!(M.players||[]).includes(ctx.acct))throw new Error('Not your match.');
      /* your bout is over on your screen once you reported (or left); the others may still be confirming */
      if(M.status!=='done'&&!(M.reports||{})[ctx.acct]&&!(M.abandoned||{})[ctx.acct])throw new Error('The match is not over.');
      const old=await getLobby(M.id);const {g}=await groupOf(ctx.acct);const L=await makeRoom({ev:old.ev,loc:old.loc,ranked:old.ranked,seats:old.seats,cry:false},ctx.acct,g);await toRoom(L,null,{except:ctx.acct});
      const name=memberName(L,ctx.acct);const invited=[];for(const a of M.players){if(a===ctx.acct||C.memberOf(L,a))continue;if(!(await inviteOne(L,ctx.acct,name,a,{gap:false,again:M.id})))invited.push(a)}
      return {lobby:room(L),invited}},
    /* 💬 a room phrase: its own CHAT# item (the room is never rewritten for a line) */
    'lobby.say':async(d,ctx)=>{const L=await getLobby(d.id);const mem=C.memberOf(L,ctx.acct)||L.players.some(p=>p.id===ctx.acct),st=inStands(L,ctx.acct);if(!mem&&!st)throw new Error('Join the game to talk.');
      if(L.status!=='waiting')throw new Error('The room closes when the horns sound.');if(!C.phraseOK('room',d.q))throw new Error('Quick chat only.');
      if(!(await store.rate('ACCT#'+ctx.acct,'PROFILE','sayAt',C.RATE.say,now())))throw new Error('Slow down.');
      const line={by:ctx.acct,name:memberName(L,ctx.acct),q:d.q,at:now()};await store.put('LOBBY#'+L.id,'CHAT#'+ts13(line.at)+'#'+ctx.acct,{...line,ttl:ttl(1)});
      /* ✓ Ready also marks the seat ready */
      let R0=null;if(d.q==='ready'){const p=L.players.find(p=>p.id===ctx.acct);if(p&&!p.ready){R0=await editLobby(L.id,X=>{const q=X.players.find(p=>p.id===ctx.acct);if(!q||q.ready||X.status!=='waiting')return false;q.ready=true});if(R0)await toRoom(R0,null,{except:ctx.acct})}}
      await deliver(roomIds(L),'lobby.say',{id:L.id,line},{except:ctx.acct,by:ctx.acct});return R0?{line,lobby:room(R0)}:{line}},
    'lobby.chatlog':async(d,ctx)=>{const L=await getLobby(d.id);if(!C.memberOf(L,ctx.acct)&&!L.players.some(p=>p.id===ctx.acct)&&!inStands(L,ctx.acct))throw new Error('Join the game to talk.');
      return (await store.query('LOBBY#'+L.id,'CHAT#',{limit:C.CHAT_KEEP,desc:true})).reverse().map(x=>({by:x.by,name:x.name,q:x.q,at:x.at}))},
    /* 👥 who is here: ≤40, free / in a room / fighting (same strike flag) */
    'who.list':async(d,ctx)=>{/* names: gladiators only (nameOf never shows a sign-in name) */const me=await acctOf(ctx.acct);const f=flagOf(me);const list=await lobbies();const inR=new Set();for(const L of list)if(L.status==='waiting')for(const m of L.members||L.players)inR.add(m.id);
      return (await here()).filter(A=>A.id!==ctx.acct&&flagOf(A)===f).slice(0,40).map(A=>({id:A.id,name:nameOf(A),rank:(A.here&&A.here.rank)||'tiro',st:A.match?'fight':inR.has(A.id)?'room':'free'}))},
    /* ── the Forum ── */
    'forum.get':async()=>forumLines(),
    'forum.say':async(d,ctx)=>{const ch=await liveChar(ctx.acct);if(!ch)throw new Error('Make a gladiator first.');if(!C.phraseOK('forum',d.q))throw new Error('Quick chat only.');
      if(!(await store.rate('ACCT#'+ctx.acct,'PROFILE','fAt',C.RATE.forum,now())))throw new Error('Slow down.');
      const As=(await here()).filter(A=>A.id!==ctx.acct&&!A.match&&!muting(A,ctx.acct));const line=await forumOut({k:'say',by:ctx.acct,name:ch.name,q:d.q},As);return {line}},
    /* 🔇 your mutes: their phrases, calls and invites never reach you (≤50) */
    'forum.mute':async(d,ctx)=>{const A=await acctOf(ctx.acct);let m=(A.mutes||[]).filter(x=>x!==d.who);if(d.on!==false&&d.who&&d.who!==ctx.acct)m.push(d.who);m=m.slice(-50);
      await store.set('ACCT#'+ctx.acct,'PROFILE',{mutes:m});const c=(hereC||[]).find(x=>x.id===ctx.acct);if(c)c.mutes=m;return {mutes:m}},
    'lobby.watch':async(d)=>{const L=await editLobby(d.id,X=>{X.watchers=(X.watchers||0)+1}).catch(()=>null)||await getLobby(d.id);return room(L)},
    /* a seat in the stands, before the horns; the coin goes into the wager pot (a standing member gives up the room for it) */
    'lobby.ticket':async(d,ctx)=>{const A=await acctOf(ctx.acct);if(await stillFighting(A))throw new Error('Your gladiator is still fighting a match — go back to it (⚔ Rejoin) or abandon it first.');
      const L0=await getLobby(d.id);const c0=await liveChar(ctx.acct,A);const ch=c0&&await charById(c0.id);if(!ch)throw new Error('Tickets are paid from a gladiator’s wallet.');
      const why=C.ticketOK(L0,ctx.acct,ch.wallet);if(why)throw new Error(why);const price=L0.ticket;
      /* pay first (only over the gladiator copy read), then take the seat in the stands; a refused seat is paid back */
      ch.wallet-=price;await putChar(ch);let err='';
      const L=await editLobby(d.id,X=>{err=C.ticketOK(X,ctx.acct,price);if(err||X.ticket!==price)return false;if(C.memberOf(X,ctx.acct))C.roomLeave(X,ctx.acct,now());
        (X.stands=X.stands||[]).push({id:ctx.acct,name:ch.name,paid:price});X.tickets=X.stands.length;X.pot=(X.pot||0)+price}).catch(e=>{err=e.message;return null});
      if(!L){await credit(ctx.acct,price);throw new Error(err||'The ticket price changed — try again.')}
      await toRoom(L,null,{except:ctx.acct});return {lobby:room(L),char:strip(await charById(ch.id))}},
    /* parties: a code to share; the leader picks the game and the whole party sits down together */
    'party.create':async(d,ctx)=>{const a=await acctOf(ctx.acct);if(a.party){const P=await store.get('PARTY#'+a.party,'PARTY');if(P)return await partyOut(P)}
      let code;for(let i=0;i<6;i++){code=C.partyCode(rnd);if(!(await store.get('PCODE#'+code,'PCODE')))break}const P={id:id('P'),code,leader:ctx.acct,members:[ctx.acct],names:{[ctx.acct]:nameOf(a,await liveChar(ctx.acct,a))},ttl:ttl(1)};
      await store.put('PARTY#'+P.id,'PARTY',P);await store.put('PCODE#'+code,'PCODE',{party:P.id,ttl:ttl(1)});await store.set('ACCT#'+a.id,'PROFILE',{party:P.id});return await partyOut(P)},
    'party.join':async(d,ctx)=>{const code=String(d.code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');const K=await store.get('PCODE#'+code,'PCODE');const P=K&&await store.get('PARTY#'+K.party,'PARTY');if(!P)throw new Error('No party with that code.');
      const a=await acctOf(ctx.acct);if(a.party&&a.party!==P.id)throw new Error('Leave your party first.');if(!P.members.includes(ctx.acct)){if(P.members.length>=C.PARTY_MAX)throw new Error('That party is full.');P.members.push(ctx.acct);P.names[ctx.acct]=nameOf(a,await liveChar(ctx.acct,a));await store.put('PARTY#'+P.id,'PARTY',P)}
      await store.set('ACCT#'+a.id,'PROFILE',{party:P.id});await toParty(P,'party.update',{id:P.id});return await partyOut(P)},
    'party.leave':async(d,ctx)=>{const a=await acctOf(ctx.acct);if(!a.party)return {};const P=await store.get('PARTY#'+a.party,'PARTY');await store.set('ACCT#'+a.id,'PROFILE',{party:null});if(!P)return {};
      P.members=P.members.filter(m=>m!==ctx.acct);delete P.names[ctx.acct];
      if(!P.members.length){await store.del('PARTY#'+P.id,'PARTY');await store.del('PCODE#'+P.code,'PCODE');return {}}
      if(P.leader===ctx.acct)P.leader=P.members[0];await store.put('PARTY#'+P.id,'PARTY',P);await toParty(P,'party.update',{id:P.id});return {}},
    'party.get':async(d,ctx)=>{const a=await acctOf(ctx.acct);return a&&a.party?await partyOut(await store.get('PARTY#'+a.party,'PARTY')):null},
    'bet.place':async(d,ctx)=>{const L0=await getLobby(d.id);const c0=await liveChar(ctx.acct);const ch=c0&&await charById(c0.id);if(!ch)throw new Error('Wagers are paid from a living gladiator’s wallet.');
      const amt=d.amt|0,seat=d.seat|0;const why=C.betOK(L0,ctx.acct,seat,amt,ch.wallet);if(why)throw new Error(why);ch.wallet-=amt;await putChar(ch);let err='';
      const L=await editLobby(d.id,X=>{err=C.betOK(X,ctx.acct,seat,amt,amt);if(err)return false;(X.bets=X.bets||[]).push({by:ctx.acct,char:ch.id,seat,amt});X.pool=(X.pool||0)+amt}).catch(e=>{err=e.message;return null});
      if(!L){await credit(ctx.acct,amt);throw new Error(err||'Try again.')}await toRoom(L,null,{except:ctx.acct});return {lobby:room(L),char:strip(await charById(ch.id))}},
    'match.open':async(d,ctx)=>{const M=await meta(d.id);if(M.host!==ctx.acct)throw new Error('Only the host opens the match.');
      if(typeof d.snap!=='object'||JSON.stringify(d.snap).length>300000)throw new Error('The opening is too large.');await store.put('MATCH#'+d.id,'OPEN',{snap:d.snap,ttl:ttl(2)});await toMatch(M,'match.open',{id:d.id},ctx.acct);return {}},
    /* 👁 watch a live match: the opening, the moves so far, and from now on every move as it happens (at most 30 watchers) */
    'match.watch':async(d,ctx)=>{const M=await meta(d.id);if(M.status!=='live')throw new Error('That match is over.');const n=Object.keys(M.watch||{}).length;
      if(!inMatch(M,ctx.acct)){if(n>=30&&!(M.watch||{})[ctx.acct])throw new Error('The free stands are full — 30 watching.');if(!M.watch){M.watch={};await store.put('MATCH#'+d.id,'META',{...M,watch:{[ctx.acct]:ctx.conn||null}})}else await store.setIn('MATCH#'+d.id,'META','watch',ctx.acct,ctx.conn||null)}
      const L=await editLobby(d.id,X=>{X.watchers=(X.watchers||0)+1}).catch(()=>null)||await getLobby(d.id);
      return {lobby:room(L),players:M.players,specs:M.specs||[],seed:M.seed,abandoned:Object.keys(M.abandoned||{}),dropped:Object.keys(M.dropped||{})}},
    'match.unwatch':async(d,ctx)=>{const M=await store.get('MATCH#'+d.id,'META');if(M&&(M.watch||{})[ctx.acct]!==undefined)await store.setIn('MATCH#'+d.id,'META','watch',ctx.acct,null);return {}},
    'match.get':async(d)=>{const M=await meta(d.id);const O=await store.get('MATCH#'+d.id,'OPEN');const from=Math.max(0,d.from|0);
      const ins=(await store.query('MATCH#'+d.id,'IN#')).map(x=>x.in).filter(x=>x.seq>=from);return {open:O?O.snap:null,inputs:ins,seed:M.seed}},
    /* the hot path: ONE update (the seq + the match record) + ONE small put + a push to each OTHER player */
    'match.input':async(d,ctx)=>{const raw=d.in||{};if(JSON.stringify(raw).length>4000)throw new Error('That move is too large.');
      const B=await store.bump('MATCH#'+d.id,'META','n');if(!B)throw new Error('No such match.');const M=B.item;if(!inMatch(M,ctx.acct))throw new Error('Not your match.');if(M.status!=='live')throw new Error('The match is not live.');
      if((M.dropped||{})[ctx.acct])throw new Error('A CPU holds your seat now.');if((M.abandoned||{})[ctx.acct])throw new Error('You left this match.');
      /* anti-cheat: a move may only speak for the sender's own seat (a burned seq is harmless: clients skip a server 'void') */
      if((raw.seat|0)!==(M.seats||{})[ctx.acct]||raw.k==='drop'){const v={k:'void',from:'server',seq:B.seq};await store.put('MATCH#'+d.id,'IN#'+String(B.seq).padStart(8,'0'),{in:v,ttl:ttl(2)});await toMatch(M,'match.input',{id:d.id,in:v});throw new Error('That seat is not yours.')}
      const inp={...raw,from:ctx.acct,seq:B.seq};await store.put('MATCH#'+d.id,'IN#'+String(B.seq).padStart(8,'0'),{in:inp,ttl:ttl(2)});
      await toMatch(M,'match.input',{id:d.id,in:inp},ctx.acct);return {seq:B.seq}},
    'match.snapreq':async(d,ctx)=>{const M=await meta(d.id);const w=a=>(M.watch||{})[a]!==undefined;if(!(inMatch(M,ctx.acct)||w(ctx.acct))||!inMatch(M,d.to))throw new Error('Not your match.');await toMatch({conns:{[d.to]:connOf(M,d.to)}},'match.snapreq',{id:d.id,to:d.to,from:ctx.acct,seq:d.seq});return {}},
    'match.snap':async(d,ctx)=>{const M=await meta(d.id);const w=a=>(M.watch||{})[a]!==undefined;if(!inMatch(M,ctx.acct)||!(inMatch(M,d.to)||w(d.to)))throw new Error('Not your match.');await toMatch({conns:{[d.to]:connOf(M,d.to)}},'match.snap',{id:d.id,to:d.to,snap:d.snap,seq:d.seq,from:ctx.acct});return {}},
    /* 💬 a match phrase: a bubble over the gladiator — never an input, never game state (after the match: 10 minutes of farewells) */
    'match.say':async(d,ctx)=>{const M=await meta(d.id);if(!inMatch(M,ctx.acct))throw new Error('Not your match.');
      /* live: match phrases, and farewells too (your bout may end on your screen before the others report) */
      const ok=M.status==='live'?(C.phraseOK('match',d.q)||C.phraseOK('after',d.q)):(now()-(M.doneAt||0)<=10*60e3?C.phraseOK('after',d.q):null);if(ok===null)throw new Error('The sand is quiet now.');if(!ok)throw new Error('Quick chat only.');
      if(!(await store.rate('ACCT#'+ctx.acct,'PROFILE','sayAt',C.RATE.say,now())))throw new Error('Slow down.');
      /* lanistas muting the speaker never see the bubble */
      const H=await hereMap();const keep=([a])=>!muting(H.get(a),ctx.acct);const M2={...M,conns:Object.fromEntries(Object.entries(M.conns||{}).filter(keep)),watch:Object.fromEntries(Object.entries(M.watch||{}).filter(keep))};
      const seat=(M.seats||{})[ctx.acct];await toMatch(M2,'match.say',{id:d.id,seat,q:d.q,by:ctx.acct},ctx.acct);return {seat}},
    /* majority resync: ask the other live humans for their state hash at a seq; answers go back to the asker */
    'match.hashq':async(d,ctx)=>{const M=await meta(d.id);const live=liveHumans(M);if(!live.includes(ctx.acct))throw new Error('Not your match.');
      await toMatch({conns:Object.fromEntries(live.filter(a=>a!==ctx.acct).map(a=>[a,(M.conns||{})[a]||null]))},'match.hashq',{id:d.id,seq:d.seq|0,from:ctx.acct});return {}},
    'match.hasha':async(d,ctx)=>{const M=await meta(d.id);const live=liveHumans(M);if(!live.includes(ctx.acct)||!live.includes(d.to))throw new Error('Not your match.');
      await toMatch({conns:{[d.to]:(M.conns||{})[d.to]||null}},'match.hasha',{id:d.id,seq:d.seq|0,from:ctx.acct,seat:(M.seats||{})[ctx.acct],h:String(d.h||'').slice(0,40)});return {}},
    /* a vote that a seat's lanista is out of step with the majority; a strike once a match when floor(n/2)+1 of n ≥ 3 live humans agree */
    'match.odd':async(d,ctx)=>{const M=await meta(d.id);const live=liveHumans(M);if(!live.includes(ctx.acct))throw new Error('Not your match.');
      const who=live.find(a=>(M.seats||{})[a]===(d.seat|0));if(!who||who===ctx.acct)throw new Error('No one to name.');
      await store.put('MATCH#'+d.id,'ODD#'+(d.seat|0)+'#'+ctx.acct,{by:ctx.acct,at:now(),ttl:ttl(2)});
      const votes=(await store.query('MATCH#'+d.id,'ODD#'+(d.seat|0)+'#')).filter(v=>live.includes(v.by)&&v.by!==who).length;let struck=false;
      const need=Math.floor(live.length/2)+1;if(live.length>=3&&votes>=need&&(await store.putNew('MATCH#'+d.id,'ODDX#'+who,{at:now(),ttl:ttl(2)}))){await store.counter('ACCT#'+who,'PROFILE','strikes');struck=true}
      /* a server-checked majority: the odd lanista is told, and asks one of them for the arena (an unasked snapshot is never loaded) */
      if(live.length>=3&&votes>=need){const voters=(await store.query('MATCH#'+d.id,'ODD#'+(d.seat|0)+'#')).map(v=>v.by).filter(b=>live.includes(b)&&b!==who);
        await toMatch({conns:{[who]:(M.conns||{})[who]||null}},'match.youodd',{id:d.id,seat:d.seat|0,voters})}
      return {votes,need,struck}},
    /* ANTI-CHEAT: each human reports the whole table; the match settles once every human still seated has reported */
    'match.result':async(d,ctx)=>{const M=await meta(d.id);if(!(M.players||[]).includes(ctx.acct))throw new Error('Not your match.');
      /* each report is its own map field (two reports at once never overwrite each other), then the match is read back */
      if(!(M.reports||{})[ctx.acct]){if(!M.reports)await store.set('MATCH#'+d.id,'META',{reports:{}});await store.setIn('MATCH#'+d.id,'META','reports',ctx.acct,{table:C.cleanTable(d.table),hash:String(d.hash||'').slice(0,20)})}
      const M1=await meta(d.id);M1.reports=M1.reports||{};const need=M1.players.filter(a=>!(M1.dropped||{})[a]&&!(M1.abandoned||{})[a]);
      if(M1.status==='live'&&need.every(a=>M1.reports[a]))return await settleMatch(d.id,M1,ctx.acct);
      if(M1.status==='done'&&M1.outs&&M1.outs[ctx.acct])return {char:strip(await liveOrLast(ctx.acct)),out:M1.outs[ctx.acct]};return {pending:true}},
    /* a player away 3+ minutes: a CPU takes the seat at this point in the move order (everyone applies it at the same place) */
    'match.drop':async(d,ctx)=>{const M=await meta(d.id);if(!inMatch(M,ctx.acct))throw new Error('Not your match.');const who=Object.keys(M.seats||{}).find(a=>M.seats[a]===(d.seat|0));
      if(!who||who===ctx.acct)throw new Error('No one to drop.');if((M.dropped||{})[who])return {done:1};const at=(M.away||{})[who];if(!at||now()-at<C.AWAY_MS)throw new Error('Still here.');
      const B=await store.bump('MATCH#'+d.id,'META','n');const inp={k:'drop',seat:d.seat|0,from:'server',seq:B.seq};await store.put('MATCH#'+d.id,'IN#'+String(B.seq).padStart(8,'0'),{in:inp,ttl:ttl(2)});
      await store.setIn('MATCH#'+d.id,'META','dropped',who,true);await toMatch(B.item,'match.input',{id:d.id,in:inp});return {done:1}},
    /* 🚪 Abandon: a server input every client applies at that seat's next decision; Ranked kills the gladiator now (Damnatio).
       When no human is left on the sand, the match shuts down. */
    'match.abandon':async(d,ctx)=>{const M=await meta(d.id);if(!(M.players||[]).includes(ctx.acct))throw new Error('Not your match.');if(M.status!=='live')return {done:1};
      if((M.abandoned||{})[ctx.acct])return {done:1};const L=await getLobby(d.id);const rule=M.abandon||C.abandonRule(L);const seat=M.seats[ctx.acct];
      const B=await store.bump('MATCH#'+d.id,'META','n');const inp={k:'abandon',seat,rule,from:'server',seq:B.seq};await store.put('MATCH#'+d.id,'IN#'+String(B.seq).padStart(8,'0'),{in:inp,ttl:ttl(2)});
      if(!B.item.abandoned)await store.put('MATCH#'+d.id,'META',{...B.item,abandoned:{[ctx.acct]:rule}});else await store.setIn('MATCH#'+d.id,'META','abandoned',ctx.acct,rule);
      await toMatch(B.item,'match.input',{id:d.id,in:inp});let out=null;
      if(L.ranked){const pl=L.players.find(p=>p.id===ctx.acct);let before='tiro';const ch=pl&&await editChar(pl.char,c=>{if(!c.alive)return false;before=C.rankFor(c).k;out=C.applyResult(c,{won:false,place:L.seats,f:0,coin:0,survives:false},true);out.abandoned=1});
        if(ch&&out){await fallen(ch,out);await store.setIn('MATCH#'+d.id,'META','outs',ctx.acct,out);await dayEdit(D=>C.dayFell(D,{id:d.id,acct:ctx.acct,ev:L.ev,loc:L.loc,at:now(),ch,before,hall:out.hall}))}}
      const M2=await meta(d.id);const left=(M2.players||[]).filter(a=>!(M2.abandoned||{})[a]&&!(M2.dropped||{})[a]);
      if(!left.length)await closeMatch(d.id,'empty');else if(left.every(a=>(M2.reports||{})[a]))await settleMatch(d.id,M2,ctx.acct);
      const A=await acctOf(ctx.acct);if(A&&A.match===d.id)await store.set('ACCT#'+A.id,'PROFILE',{match:null});return {done:1,out,rule}},
    'hall.list':async()=>(await world('HALL')).list.slice(0,60),
    'world.news':async()=>({news:(await world('NEWS')).list.slice(0,8),online:(await here()).length,challenges:C.weekChallenges(now()),today:await today()})};
  return async function route(t,d,ctx){const f=R[t];if(!f)throw new Error('Unknown request: '+t);if(!ctx.acct&&t!=='hello')throw new Error('Sign in first.');return f(d||{},ctx)}}
/* a player reconnects mid-match: their new connection goes into the match record */
async function reconnect(store,acct,conn){const A=await store.get('ACCT#'+acct,'PROFILE');if(A&&A.match){await store.setIn('MATCH#'+A.match,'META','conns',acct,conn);await store.setIn('MATCH#'+A.match,'META','away',acct,0)}}
async function away(store,acct,t){const A=await store.get('ACCT#'+acct,'PROFILE');if(A&&A.match)await store.setIn('MATCH#'+A.match,'META','away',acct,t)}
/* presence on: the account's socket + the 'ON' index entry (GSI1SK = connect time) */
async function online(store,acct,conn,t){const a=await store.get('ACCT#'+acct,'PROFILE');if(!a)return null;a.conn=conn;a.GSI1PK='ON';a.GSI1SK=t;await store.put('ACCT#'+acct,'PROFILE',a);await reconnect(store,acct,conn);return a}
module.exports={makeRoutes,reconnect,away,online};
