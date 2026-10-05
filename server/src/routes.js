/* The online arena's requests — the same names and answers as the game's mock server (src/112-online.js + 118-onl80.js MOCK_ROUTES).
   route(t, d, ctx) → answer (throws Error with a player-facing message). ctx = {acct, conn}.
   push(acctId, type, data) sends to that account's open connection (one ACCT read);
   pushConn(connId, type, data, acctId) sends to a known connection and returns true when it is gone (the caller then falls back).
   v0.80 (protocol 4): ROOMS (members who sit or stand, host hand-off, kick, event/seat/team settings — the rules are ONLC's),
   quick chat (phrase codes only: lobby.say / match.say / forum.say; lobby.chat is gone), the Praeco (lobby.quick, 📣 lobby.call,
   ✉ lobby.invite, ⚔ lobby.again), the Forum (FORUM lines, mutes, a daily push meter), presence (ACCT GSI1PK 'ON' while a socket
   is open → here()), and majority-resync helpers (match.hashq / hasha / odd). Every lobby.update push carries the room.
   v0.82 (protocol 5, contract tools/plans/onl82-contract.md): DOMUS (domus.create / rename / get; needDomus gating), the coin rework (ONLC.applyResult),
   prices by AP (ONLC.priceOf), GUESTS (ctx.guest: read-only GUEST_OK requests for 2 h, counted apart), stored INVITES that die with the room
   (lobby.accept → room_gone; invite.gone pushes), and the STANDS GROUP TURN (match.stands.open / pick / close → one 'stands.result' input).
   Refusals may carry a code: throw fail(code,msg,extra) → the reply {ok:false, err, code, ...extra}.
   v0.82 STANDS FOR THE POOR: free seats (L.free, lobby.set {free}), 🎟 lobby.pass (Flavius's guest pass: one a UTC day a house, DOMUS PASS#<day>),
   +1 house fame for a pass sat through (settleMatch), stands entries carry {domus, patron}, domus.patron {look}; rankCounts seeded once by a scan.
   v0.83 tester grants: admin.grant (ctx.tester from the deploy's TESTERS e-mails; test houses: D.test / ACCT dtest / ch.test, Custom only).
   v0.83 (protocol 6, contract tools/plans/onl83-contract.md): 8 ranks (rankCounts re-seeded once: 'seeded6'), no rank gate on buying, the house
   TREASURY (20% of every award; domus.buy, repairs), armory OFFERINGS (offer.buy / offer.bring), RANKED GEAR LOSS (broken pieces, gear.repair;
   the dead's brought gear: LOOT#<match> for a human killer — loot.offer push, loot.pick, the most valuable after LOOT_MS — the rest to the
   used MARKET (market.list / market.buy) or, named, the CHEST pool), FLAVIUS'S GIFTS (gift.open; named weapons rolled here, Legendary uniques
   claimed once: WORLD UNIQ#<k>), the START COUNTDOWN (lobby.start → startAt, again with go:1 at the horns; lobby.hold), TROPHIES + recent
   matches on the DOMUS, domus.profile, ★ domus.follow (hello.follows), the WAGERS tab (wager.list; BETS#<acct>, WAGERWK#<week>), Ludi Infames (inf).
   His call (after the server half): GIFTS + freebies belong to the DOMUS — settlements move a gladiator's new gifts onto the house (D.gifts),
   gift.open opens a house gift for the ACTIVE gladiator (into the house with none); a Ranked death puts the un-brought satchel on the shelf
   (D.offers); offer.move moves an offering between the shelf and a satchel.
   v0.84 (protocol 7, contract tools/plans/onl84-contract.md): NAMED ARMOR from gifts (WORLD UNIQA#<k> claims the armor uniques; the chest pool holds
   either kind), loot pieces carry the full def (w), SEASONS (hello.season84 = this week's fixture on the Manager schedule, hello.week84 = the house's
   weekly challenge; C.weekNote at settlement → one gift a house a week), RECLAIM a seat a CPU took (drop / abandon inputs carry `until`;
   match.reclaim → a server 'reclaim' input; match.cpuheld closes the window after a rotation; ACCT rcl84), CPU-won rewards (row.cpu → applyResult),
   FLAVIUS'S AUCTION (auction.list / auction.bid; AUCTION#<week> lots from the chest pool, escrow, anti-snipe, one win a house a week, settled in the
   sweeps), Today entries carry the house name (dn). */
'use strict';
const C=require('./onlcore.js');
const DAY=86400;
const HERE_MS=2*3600e3+5*60e3; /* API Gateway closes a socket after 2 h: older presence entries are stale */
const FORUM_KEEP=30;
/* a refusal the client can act on: err = the player-facing text, code = a stable key, extra fields ride along in the reply */
function fail(code,msg,extra){const e=new Error(msg);e.code=code;if(extra)e.extra=extra;return e}
/* v0.82: requests an account without a house may not make (needDomus) */
const NEED_DOMUS=new Set(['auction.bid','offer.move','offer.buy','offer.bring','gear.repair','domus.buy','gift.open','loot.pick','market.buy','domus.follow','char.create','char.buy','char.edit','char.active','lobby.create','lobby.join','lobby.accept','lobby.quick','lobby.sit','lobby.ticket','lobby.invite','lobby.call','lobby.again','lobby.say','bet.place','party.create','party.join','forum.say','domus.move','domus.equip','lobby.pass','domus.patron']);
/* what a guest is told when a request needs a sign-in */
const GUEST_WHY={'forum.say':'speak in the Forum','bet.place':'wager','lobby.ticket':'buy a ticket','char.create':'raise gladiators','domus.create':'found a house','lobby.pass':'take a seat in the stands'};
function makeRoutes({store,push,pushConn=null,catalog,now=()=>Date.now(),rnd=()=>Math.random(),dev=false,hereMs=0,countdown=C.COUNTDOWN_MS}){
  const ttl=days=>Math.floor(now()/1000)+days*DAY;if(C.setCatalog)C.setCatalog(catalog); /* v0.84: equip points (C.equipOf / gearEquip) read the catalog */
  const acctOf=async id=>id?await store.get('ACCT#'+id,'PROFILE'):null;
  /* the account's ACTIVE gladiator (v0.79: up to 3 living, one active) — the one that fights, bets and buys tickets */
  const liveChar=async(acct,A)=>{const all=(await store.byIndex('OWNER#'+acct)).filter(c=>c.alive);if(!all.length)return null;if(A===undefined)A=await acctOf(acct);return all.find(c=>A&&c.id===A.active)||all[all.length-1]};
  const charById=async cid=>cid?await store.get('CHAR#'+cid,'CHAR'):null;
  /* v0.83 the caller's own living gladiator, or a refusal */
  const ownChar=async(acct,cid)=>{const ch=await charById(cid);if(!ch||ch.owner!==acct||!ch.alive)throw new Error('Not yours.');return ch};
  const lobbies=()=>store.byIndex('LOBBIES');
  /* in a waiting room (sitting or standing) or seated in a live match */
  const inRoom=(L,a)=>L.players.some(p=>p.id===a)||(L.status==='waiting'&&!!C.memberOf(L,a));
  const inStands=(L,a)=>(L.stands||[]).some(s=>s.id===a);
  /* the gladiator a lanista is fighting with right now (a waiting room or a live match): edits wait until it is over */
  /* a gladiator seated in a waiting room or a live match (its gear is locked) */
  const charBusy=(cid,list)=>(list||[]).some(L=>(L.status==='waiting'||L.status==='live')&&(L.players||[]).some(p=>p.char===cid));
  async function busyIn(acct){for(const L of await lobbies())if((L.status==='waiting'||L.status==='live')&&inRoom(L,acct))return L;return null}
  const getLobby=async id=>{const L=await store.get('LOBBY#'+id,'LOBBY');if(!L)throw new Error('That game is gone.');L.members=L.members||[];L.players=L.players||[];return L};
  /* v0.80: rooms and gladiators are written only over the version that was read (L.rev / ch.rev): two requests at once can never both
     spend, refund or join on the same copy. A request that loses gets 'try again'; the server's own bookkeeping retries (editLobby/editChar). */
  const lobbyItem=L=>({...L,GSI1PK:L.status==='done'?'LOBBIES_DONE':'LOBBIES',GSI1SK:L.created,ttl:ttl(2)});
  const putLobby=async L=>{C.countCheck(L);const rev=await store.putRev('LOBBY#'+L.id,'LOBBY',lobbyItem(L));if(rev===false)throw new Error('The room changed a moment ago — try again.');L.rev=rev;return rev};
  async function editLobby(id,fn){for(let i=0;i<6;i++){const L=await store.get('LOBBY#'+id,'LOBBY');if(!L)return null;L.members=L.members||[];L.players=L.players||[];
      if((await fn(L))===false)return null;C.countCheck(L);const rev=await store.putRev('LOBBY#'+id,'LOBBY',lobbyItem(L));if(rev!==false){L.rev=rev;return L}}throw new Error('The room is busy — try again.')}
  const charItem=ch=>({...ch,GSI1PK:'OWNER#'+ch.owner,GSI1SK:ch.born});
  const putChar=async ch=>{const rev=await store.putRev('CHAR#'+ch.id,'CHAR',charItem(ch));if(rev===false)throw new Error('Your gladiator changed a moment ago — try again.');ch.rev=rev;return rev};
  async function editChar(cid,fn){for(let i=0;i<6;i++){const ch=cid?await store.get('CHAR#'+cid,'CHAR'):null;if(!ch)return null;if((await fn(ch))===false)return null;
      const rev=await store.putRev('CHAR#'+cid,'CHAR',charItem(ch));if(rev!==false){ch.rev=rev;return ch}}throw new Error('Busy — try again.')}
  /* coin into a lanista's active gladiator (refunds, payouts) */
  async function credit(acct,v){if(!v)return;const c=await liveChar(acct);if(c)await editChar(c.id,ch=>{if(!ch.alive)return false;ch.wallet=(ch.wallet||0)+v})}
  const strip=x=>{if(!x)return x;const y={...x};for(const k of ['PK','SK','GSI1PK','GSI1SK','ttl'])delete y[k];return y};
  /* the whole room, for its own members (lists get C.liteRow) */
  const room=L=>{const y=strip(L);delete y.chat;delete y.invited;return y};
  const lite=L=>C.liteRow(strip(L));
  const id=p=>p+now().toString(36)+Math.floor(rnd()*1e6).toString(36);
  const flagOf=A=>!!A&&(A.strikes||0)>=C.STRIKES_OUT;
  /* how others see a lanista online: the gladiator's name, never the sign-in (Google) name */
  const nameOf=(A,ch)=>(ch&&ch.name)||(A&&A.here&&A.here.glad)||'A lanista';
  /* a room row as the Forum keeps it (the live push carries the whole list row) */
  const tinyRow=r=>r?{id:r.id,ev:r.ev,loc:r.loc,ranked:!!r.ranked,rank:r.rank||null,seats:r.seats,n:(r.players||[]).length,team:!!r.team}:undefined;
  /* the match a lanista's gladiator is still fighting in (a CPU may hold the seat; a ticket holder is not fighting): no new room or ticket until it ends,
     they abandon it, or their own screen has finished it (reported — the others may still be confirming) */
  async function stillFighting(A){if(!A||!A.match)return null;const M=await store.get('MATCH#'+A.match,'META');
    if(M&&M.status==='live'&&(M.players||[]).includes(A.id)&&!(M.abandoned||{})[A.id]&&!(M.reports||{})[A.id])return M;if(!M||M.status!=='live')await store.set('ACCT#'+A.id,'PROFILE',{match:null});return null}
  const ts13=t=>String(t).padStart(13,'0');
  const rk=r=>String(r|0).padStart(6,'0');
  /* who is asking: the account, or a guest's id (watching only) */
  const viewer=ctx=>ctx.acct||(ctx.guest&&ctx.guest.id)||null;

  /* ── presence: ACCT items with GSI1PK 'ON' (set on $connect, removed by a conditional clear on $disconnect / a gone push) ── */
  let hereC=null,hereAt=0;
  async function here(){const t=now();if(hereMs&&hereC&&t-hereAt<hereMs)return hereC;
    hereC=(await store.byIndex('ON')).filter(A=>A.conn&&t-(A.GSI1SK||0)<HERE_MS&&!/^bot/.test(A.id));hereAt=t;return hereC}
  const hereMap=async()=>new Map((await here()).map(A=>[A.id,A]));
  /* v0.82 guests: GUEST#<gid> items with GSI1PK 'GON' while a guest socket is open (counted apart, never pushed the Forum) */
  let gC=null,gAt=0;
  async function guestsHere(){const t=now();if(hereMs&&gC&&t-gAt<hereMs)return gC;gC=(await store.byIndex('GON')).filter(G=>G.conn&&t-(G.GSI1SK||0)<HERE_MS&&t-(G.first||0)<C.GUEST_MS);gAt=t;return gC}
  const summary=async list=>{const H=await here();return C.hereSummary(H.map(x=>({id:x.id,match:x.match,tz:x.here&&x.here.tz})),list,(await guestsHere()).map(G=>({tz:G.tz})))};
  /* ── v0.82 DOMUS: DOMUS#<id> DOMUS = the house; DNAME#<lower name> DNAME = its name, claimed once (putNew); ACCT PROFILE {domus, dname} ── */
  const domusGet=async id=>id?await store.get('DOMUS#'+id,'DOMUS'):null;
  const domusItem=D=>({...D,GSI1PK:'DOMUS_OF#'+D.owner,GSI1SK:D.founded});
  async function editDomus(id,fn){if(!id)return null;for(let i=0;i<6;i++){const D=await domusGet(id);if(!D)return null;if((await fn(D))===false)return null;
      const rev=await store.putRev('DOMUS#'+id,'DOMUS',domusItem(D));if(rev!==false){D.rev=rev;return D}}return null}
  /* gladiators a house has ever had (living or dead): its counter, or its gladiators found by owner */
  async function domusGlads(D){if(!D)return 0;const n=(await store.byIndex('OWNER#'+D.owner)).filter(c=>c.domus===D.id).length;return Math.max(n,D.glads|0)}
  async function claimName(name,D){const k=C.domusKey(name);if(await store.putNew('DNAME#'+k,'DNAME',{domus:D.id,owner:D.owner,name}))return true;
    const X=await store.get('DNAME#'+k,'DNAME');return !!X&&X.domus===D.id}
  const releaseName=async D=>{const k=C.domusKey(D.name);const X=await store.get('DNAME#'+k,'DNAME');if(X&&X.domus===D.id)await store.del('DNAME#'+k,'DNAME')};
  /* a gladiator's settled result into its house record (never allowed to break a settlement) */
  const domusResult=async(ch,row,out,ranked)=>domusAfter(ch,row,out,ranked,null,null);
  /* v0.83 one edit of the house after a settled seat: the record, the treasury's cut, the dead's un-brought pieces onto the shelf, trophies, recent matches */
  async function domusAfter(ch,row,out,ranked,m,gx){try{if(ch&&ch.domus)await editDomus(ch.domus,D=>{C.domusNote(D,row,out,ranked);D.treasury=(D.treasury|0)+((out&&out.cut)|0);
      for(const P of (gx&&gx.left)||[])C.putPiece(D,P,false);if(gx&&gx.gifts&&gx.gifts.length)C.giftsIn(D,gx.gifts);if(gx&&gx.offLeft&&gx.offLeft.length)C.offersIn(D,gx.offLeft);for(const k of C.trophiesFrom(ch,row,out,ranked,m&&m.ev))C.trophyAdd(D,k,ch.name,now());if(m)C.recentAdd(D,C.recentRow(m,ch,row,out));if(m&&!(out&&out.abandoned))C.weekNote(D,m,ch,row,out)})}catch(e){}}
  /* ── v0.83 where the dead's brought gear goes: the used MARKET (MARKET U#<ts13>#<r>, printed pieces) or the CHEST pool (CHEST P#<uid>, named) ── */
  async function toMarket(P,from){const I=C.pieceInfo(P,catalog);if(!I)return;
    if(I.named){await store.put('CHEST','P#'+C.itemUid(P.item),{item:P.item,pc:P.pc||null,at:now(),from,taken:0});return}
    const sk='U#'+ts13(now())+'#'+Math.floor(rnd()*1e9).toString(36);await store.put('MARKET',sk,{id:sk,item:P.item,pc:P.pc||null,base:I.base,n:I.n,kind:I.kind,lv:I.lv,st:I.st,price:C.usedPrice(I),at:now(),from,sold:0,ttl:ttl(14)})}
  /* the dead's pieces get their own ids and a line of history before they leave the house */
  const leaving=(Ps,h,from,how)=>Ps.map(P=>C.histAdd(C.tagPiece(P,h),{house:from.house||null,glad:from.glad,when:now(),how}));
  /* ── v0.83 LOOT#<match> S#<seat6>: a dead gladiator's brought gear, waiting for the human killer's pick (GSI1PK 'LOOT' until done) ── */
  const lootOut=X=>({id:X.match,seat:X.seat,until:X.until,dead:X.dead,killer:{seat:X.killer.seat},pieces:X.pieces.map(p=>({item:p.item,n:p.n,kind:p.kind,lv:p.lv,st:p.st,rar:p.rar||null,val:p.val|0,hist:(p.pc&&p.pc.hist)||[],...(p.pc&&p.pc.w?{w:p.pc.w}:{})}))});
  async function lootMake(mid,seat,dead,killer,Ps){const until=now()+C.LOOT_MS;const pieces=Ps.map(P=>{const I=C.pieceInfo(P,catalog)||{};return {item:P.item,pc:P.pc||null,n:I.n,kind:I.kind,lv:I.lv,st:I.st,rar:I.rar||null,val:I.val|0}});
    const X={match:mid,seat,dead,killer,pieces,until,done:false,GSI1PK:'LOOT',GSI1SK:until,ttl:ttl(3)};await store.put('LOOT#'+mid,'S#'+rk(seat),X);await deliver([killer.acct],'loot.offer',lootOut(X));return X}
  /* the pick (i), or the most valuable when i is null: one piece to the killer (his shelf when he cannot carry it), the rest to the market */
  async function lootResolve(X,i){if(!(await store.flip('LOOT#'+X.match,'S#'+rk(X.seat),'done',false,true)))return null;if(i==null)i=C.lootBest(X.pieces);
    const from={house:X.dead.domus||null,glad:X.dead.name};let to='market',got=null,ch=null;const kc=await charById(X.killer.char);
    for(let j=0;j<X.pieces.length;j++){const p=X.pieces[j];let P={item:p.item,pc:p.pc||null};
      if(j===i&&kc&&kc.alive){P=C.histAdd(P,{...from,when:now(),how:'taken'});got=C.pieceInfo(P,catalog);
        const fit=c=>!C.gearMoveWhy({gear:[P.item],pcs:P.pc?{[C.itemUid(P.item)]:P.pc}:{}},c,P.item,catalog);
        ch=await editChar(kc.id,c=>{if(!c.alive||!fit(c))return false;C.putPiece(c,P,!C.wearWhy(c,P.item,P.pc))});if(ch)to='glad';
        else if(kc.domus&&await editDomus(kc.domus,D=>{C.putPiece(D,P,false)}))to='house';else await toMarket(P,from);continue}
      await toMarket(C.histAdd(P,{...from,when:now(),how:'fell'}),from)}
    await store.set('LOOT#'+X.match,'S#'+rk(X.seat),{GSI1PK:'LOOT_DONE',picked:i});const r={id:X.match,seat:X.seat,got:got&&{item:got.item,n:got.n,kind:got.kind,lv:got.lv,st:got.st,rar:got.rar||null,val:got.val},to,char:ch?strip(ch):null};
    await deliver([X.killer.acct],'loot.done',r);return r}
  /* windows past their time close with the default pick (no timers: every hello, loot.list and market.list sweeps) */
  async function lootSweep(){for(const X of await store.byIndex('LOOT'))if(!X.done&&now()>X.until)try{await lootResolve(X,null)}catch(e){}}
  const lootMine=async acct=>(await store.byIndex('LOOT')).filter(X=>!X.done&&X.killer&&X.killer.acct===acct&&now()<=X.until);
  /* the dead's brought gear: the human killer's window, else all to the market */
  async function deadGear(mid,seat,ch,acct,gx,killer){if(!gx||!gx.carried.length)return;const A=await acctOf(acct);const from={house:(A&&A.dname)||null,glad:ch.name};
    if(killer){const Ps=gx.carried.map(P=>C.tagPiece(P,ch));await lootMake(mid,seat,{acct,char:ch.id,name:ch.name,cls:ch.cls,domus:from.house},killer,Ps);return}
    for(const P of leaving(gx.carried,ch,from,'fell'))await toMarket(P,from)}
  /* ── v0.83 the wagers tab: BETS#<acct> B#<ts13>#<room> (each bet and its outcome) and WAGERWK#<week> A#<acct> (the week's tally) ── */
  async function betsMark(bets,res){for(let i=0;i<(bets||[]).length;i++){const b=bets[i],r=res[i];if(!b||!r||!b.bk)continue;try{await store.set('BETS#'+b.by,b.bk,{res:r.res,pay:r.pay|0});
      if(r.res!=='refund'){const wk=C.weekKey(now());await store.counter('WAGERWK#'+wk,'A#'+b.by,'net',(r.pay|0)-(b.amt|0));if(r.pay)await store.counter('WAGERWK#'+wk,'A#'+b.by,'won',r.pay|0)}}catch(e){}}}
  /* ── v0.83 FOLLOW: what a followed house is doing now (its lanista's presence) ── */
  async function followsOut(fs,list){const H=await here();const byDom=new Map(H.filter(A=>A.domus).map(A=>[A.domus,A]));list=list||await lobbies();
    return (fs||[]).map(f=>{const A=byDom.get(f.id);if(!A)return {id:f.id,name:f.name,st:'off'};if(A.match)return {id:f.id,name:f.name,st:'fight',match:A.match,glad:nameOf(A)};
      const R=list.find(L=>L.status==='waiting'&&inRoom(L,A.id));return R?{id:f.id,name:f.name,st:'room',room:R.id,glad:nameOf(A)}:{id:f.id,name:f.name,st:'free',acct:A.id,glad:nameOf(A)}})}
  const tokenLook=c=>{const L=C.cleanLook(c.look);return L.token?{token:L.token,color:L.color}:{}};
  /* v0.82 a seat in the stands: the gladiator's name, the house and its patron look ride along ("🎟 Patron of House …" on every screen) */
  const standEntry=(acct,ch,A,D,paid,extra)=>({id:acct,name:ch.name,paid,...(A&&A.dname?{domus:A.dname}:{}),...(D&&D.patron&&Object.keys(D.patron).length?{patron:D.patron}:{}),...(extra||{})});

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
  const toRoom=async(L,extra,o)=>{await deliver(roomIds(L,o&&o.also),'lobby.update',{id:L.id,lobby:room(L),...(extra||{})},o);await sweepInvites(L)};
  /* ── v0.82 INVITES: INVITE#<to> R#<room>#<by> {room,by,name,at} (ttl 1 day). An invitation dies with the room — started, filled (no free
     seat), closed, or every lanista who sent it gone — and when the invitee joins any room. No timers. ── */
  function inviteDead(L,to){if(!L||L.status==='done')return {why:'closed'};if(L.status==='live')return {why:'started',live:true};
    if(L.players.length>=L.seats)return {why:'full'};const by=(L.invited||[]).filter(x=>x.to===to).map(x=>x.by);
    if(by.length&&!by.some(b=>C.memberOf(L,b)))return {why:'left'};return null}
  const GONE_TXT={closed:'That room has closed.',started:'That game has started — you can watch it.',full:'That room has filled up.',left:'The lanista who invited you has left the room.'};
  async function dropInvites(to,roomId){const xs=await store.query('INVITE#'+to,'R#'+(roomId?roomId+'#':''));for(const x of xs)await store.del('INVITE#'+to,x.SK);return xs}
  /* push invite.gone to those whose invitation to L just died (called with every room push) */
  async function sweepInvites(L){const inv=L&&L.invited||[];if(!inv.length||(L.status==='done'&&L.started))return; /* a started room was swept at the horns */const seen=new Set();
    for(const {to} of inv){if(seen.has(to))continue;seen.add(to);const dead=inviteDead(L,to);if(!dead)continue;
      if((await dropInvites(to,L.id)).length)await deliver([to],'invite.gone',{rooms:[L.id],why:dead.why,...(dead.live?{live:true}:{})})}}
  /* the invitee joined a room: every pending invitation is dropped (invite.gone names the OTHER rooms; the joined one is simply used) */
  async function cancelInvites(ids,joined){for(const a of ids){const xs=await dropInvites(a);const rooms=[...new Set(xs.map(x=>x.room))].filter(r=>r!==joined);if(rooms.length)await deliver([a],'invite.gone',{rooms,why:'joined'})}}

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
      if(!A.domus)throw fail('need_domus',m===acct?'Name your house first.':'Someone in your party has no house yet.');
      const ch=await liveChar(m,A);g.push({id:m,name:nameOf(A,ch),domus:A.dname||undefined,char:ch&&ch.id,rank:ch?C.rankFor(ch).k:'tiro',kit:C.kitOf(ch),party:P?P.id:undefined,strikes:A.strikes||0,...(A.dtest?{test:1}:{})})}
    const list=await lobbies();
    for(const L of list)if(L.status==='waiting'&&L.id!==o.except&&g.some(w=>inRoom(L,w.id)))throw new Error(g.length>1?'Someone in your party is already in a room.':'You are already in a room.');
    return {g,list}}
  async function partyOut(P){if(!P)return null;const y=strip(P);y.names={};for(const m of P.members||[]){const A=await acctOf(m);y.names[m]=nameOf(A,A&&await liveChar(m,A))}return y}
  const toParty=async(P,type,data)=>{for(const m of P.members)await push(m,type,data)};
  const meta=async id=>{const M=await store.get('MATCH#'+id,'META');if(!M)throw new Error('No such match.');return M};
  const liveOrLast=async acct=>(await liveChar(acct))||(await store.byIndex('OWNER#'+acct))[0]||null;

  /* ── the Forum: FORUM | L#<ts13>#<acct4>, the last 30 shown; pushes counted per UTC day (FMETER) ── */
  async function forumLines(){const d0=C.forumSince(now());return (await store.query('FORUM','L#',{limit:FORUM_KEEP,desc:true})).reverse().map(strip).filter(l=>(l.at||0)>=d0)} /* v0.85: the Forum starts fresh each online day (20:00 New York, C.dayStart); lines from the last 30 min linger past the turn (TTL deletion is lazy) */
  async function forumPut(line){const at=now();line={...line,at};await store.put('FORUM','L#'+ts13(at)+'#'+String(line.by||'x').slice(-4),{...line,...(line.row?{row:tinyRow(line.row)}:{}),ttl:ttl(1)});return line}
  /* the daily meter: true while pushes may go out (the lines are stored either way) */
  async function meterOK(n){if(!n)return false;const day=new Date(now()).toISOString().slice(0,10);return (await store.counter('WORLD','FMETER#'+day,'n',n))<C.RATE.meterDay}
  /* free lanistas who fit a room: here, not the caller, not in it, not fighting, the same strike flag, Ranked = the same rank,
     not muting the caller; the newest RATE.fanCap by connect time */
  const kickedOut=(L,a)=>((L.kicked||{})[a]||0)>now();
  async function fitFor(L,by){return (await here()).filter(A=>A.id!==by&&!A.match&&!C.memberOf(L,A.id)&&!L.players.some(p=>p.id===A.id)&&!kickedOut(L,A.id)&&!inStands(L,A.id)&&flagOf(A)===!!L.flag&&
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
      let gx=null;const ch=await editChar(pl.char,c=>{if(!c.alive)return false;before=C.rankFor(c).k;out=C.applyResult(c,row,!!L.ranked,{humans:(M.players||[]).length,now:now()});gx=C.gearAfter(c,pl.kit,row,!!L.ranked);
        out.broken=gx.broken;out.offBack=gx.offBack});if(!ch||!out)continue;M.outs[a]=out;dseats.push({acct:a,ch,before,row,out,gx,seat:M.seats[a]});
      if(out.died)await countRank(before,-1,ch);else if(out.rankUp){await countRank(before,-1,ch);await countRank(out.rankUp,1,ch)}
      await domusAfter(ch,row,out,!!L.ranked,{id,ev:L.ev,loc:L.loc,at:now(),ranked:!!L.ranked},gx);
      if(out.died){const e={name:ch.name,cls:ch.cls,rank:ch.died.rank,lifeCF:ch.lifeCF,survived:ch.survived,diedAt:now(),why:out.hall?C.hallWhy(ch):''};
        if(out.hall){const H=await world('HALL');H.list=[e,...H.list].slice(0,200);await store.put('WORLD','HALL',H)}await news(out.hall?['🪦',`${ch.name} fell. The Hall of the Fallen keeps the name.`]:['🌫',`${ch.name} fell and is forgotten.`])}
      if(out.rankUp)await news(['⚔',`${ch.name} is now ${C.RANKS[C.rankIdx(out.rankUp)].n}.`])}
    const dpub=dseats.filter(s=>!s.ch.test);if(dpub.length)await dayEdit(D=>C.dayFromMatch(D,{id,ev:L.ev,loc:L.loc,at:now(),ranked:!!L.ranked,seats:dpub}));
    /* v0.83 the dead's brought gear: a living human killer picks one (LOOT), the rest — or all of it — goes to the market */
    for(const s of dseats)if(s.out.died&&s.gx){const ks=s.row.ks;const ka=s.row.kb==='g'&&ks>=0?M.players.find(x=>M.seats[x]===ks&&x!==s.acct):null;const kd=ka&&dseats.find(z=>z.acct===ka);
      const killer=ka&&kd&&!kd.out.died&&!(M.abandoned||{})[ka]?{acct:ka,char:kd.ch.id,seat:ks}:null;try{await deadGear(id,s.seat,s.ch,s.acct,s.gx,killer)}catch(e){}}
    /* 🎟 a guest pass sat through to the end (a ticket holder of this match, not left / dropped / abandoned, not away for AWAY_MS) → +1 house Fame */
    const famed=[];if(!A.void)try{const gone=a=>(M.dropped||{})[a]||(M.abandoned||{})[a]||(M.left||{})[a]||((M.away||{})[a]&&now()-M.away[a]>=C.AWAY_MS);
      for(const s of L.stands)if(s.pass&&(M.specs||[]).includes(s.id)&&!gone(s.id)){const P=await acctOf(s.id);if(P&&P.domus&&(await editDomus(P.domus,X=>{X.fame=(X.fame|0)+C.PASS.fame})))famed.push(s.id)}}catch(e){}
    /* the room closes first (retried over any concurrent change); the wagers and the pot pay out from what was closed */
    let st=null,br=null,bets=[];L=await editLobby(id,X=>{if(X.status==='done')return false;st=null;br=null;for(const s of X.stands||[])if(famed.includes(s.id))s.fame=C.PASS.fame;if((X.bets||[]).length||X.pot){const wins=A.void?[]:A.table.filter(r=>r.won).map(r=>r.seat);const seatAcct={};X.players.forEach((p,i)=>{seatAcct[i]=p.id});
        st=C.settle(X.bets||[],wins,{pot:X.pot|0,tix:(X.stands||[]).map(s=>({by:s.id,amt:s.paid|0})),seatAcct,void:!!A.void});X.settled=st;bets=(X.bets||[]).slice();br=C.betResults(bets,wins,{pot:X.pot|0,void:!!A.void})}X.status='done'})||L;
    if(st){for(const [by,v] of Object.entries(st.payouts))await credit(by,v);if(st.cut)await credit(L.host.id,st.cut)}if(br)await betsMark(bets,br);
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
  function refundsOf(L){const st=C.settle(L.bets||[],[],{tix:(L.stands||[]).map(s=>({by:s.id,amt:s.paid|0})),void:true});const bets=(L.bets||[]).slice();L.bets=[];L.pool=0;L.pot=0;
    Object.defineProperty(st.payouts,'_bets',{value:bets,enumerable:false});return st.payouts}
  async function payAll(pay){for(const [by,v] of Object.entries(pay||{}))await credit(by,v);const bets=pay&&pay._bets;if(bets&&bets.length)await betsMark(bets,bets.map(b=>({res:'refund',pay:b.amt|0})))}
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
  /* v0.82 living gladiators by rank, every house: WORLD COUNTS {tiro:n,…} kept by atomic counters (creation +1, rank-up −1/+1, death −1) — never a scan */
  async function countRank(k,by,ch){try{if(k&&!(ch&&ch.test))await store.counter('WORLD','COUNTS',k,by)}catch(e){}}
  async function rankCounts(){let X=await store.get('WORLD','COUNTS');if(!X||X.seeded==null||X.seeded6==null)X=await (seeding||(seeding=seedCounts().finally(()=>{seeding=null})));
    const o={};for(const R of C.RANKS)o[R.k]=Math.max(0,(X||{})[R.k]|0);return o}
  /* gladiators made before the counters existed: ONE scan of the living, written only while the item has no 'seeded' mark (a conditional put —
     the first seeding wins, later ones read it); the counters carry on from there */
  let seeding=null;
  async function seedCounts(){try{const o={seeded:now(),seeded6:now()};for(const R of C.RANKS)o[R.k]=0;
      for(const c of await store.scan('CHAR#','CHAR'))if(c&&c.alive&&!c.test){const k=C.rankFor(c).k;o[k]=(o[k]|0)+1}
      /* v0.83: 'seeded6' — the 8 ranks are counted once more from a scan (Novicius, Rudiarius, Invictus) */
      if(await store.putUnless('WORLD','COUNTS',o,'seeded6'))return o}catch(e){}return (await store.get('WORLD','COUNTS'))||{}}
  const news=async line=>{const N=await world('NEWS');N.list=[line,...N.list].slice(0,12);await store.put('WORLD','NEWS',N)};
  /* ☀ Today in the arena (WORLD DAY#<online day> — the day turns at 20:00 New York, C.dayKey): versioned edits, never allowed to break a settlement */
  let dayC=null,dayAt=0;
  async function dayEdit(fn){try{const k='DAY#'+C.dayKey(now());for(let i=0;i<6;i++){const X=(await store.get('WORLD',k))||{};const D=fn(X)||X;
      if((await store.putRev('WORLD',k,{...D,ttl:ttl(3)}))!==false){dayC=null;return}}}catch(e){}}
  /* today's record, or yesterday's while today's is still empty */
  /* v0.83 Victor of the Day: yesterday's best win (most CF in one match) gives its house a trophy, once (WORLD VDAY#<day>) */
  let vdDone=null;
  async function vdayAward(t){const y=C.dayPrevKey(t);if(vdDone===y)return;vdDone=y;try{if(!(await store.putNew('WORLD','VDAY#'+y,{at:t,ttl:ttl(3)})))return;
      const Y=await store.get('WORLD','DAY#'+y);const w=Y&&(Y.wins||[])[0];if(w&&w.dom)await editDomus(w.dom,D=>{C.trophyAdd(D,'vday',w.name,t)})}catch(e){}}
  async function today(){const t=now();await vdayAward(t);if(hereMs&&dayC&&t-dayAt<hereMs)return dayC;const D=await store.get('WORLD','DAY#'+C.dayKey(t));
    let out=C.dayOut(D,'today');if(!C.dayHas(D)){const Y=await store.get('WORLD','DAY#'+C.dayPrevKey(t));if(C.dayHas(Y))out=C.dayOut(Y,'yesterday')}dayC=await dnFill(out);dayAt=t;return dayC}
  /* a lobby list for one lanista: their strike flag only; liteRow for every room but their own (full) */
  const listFor=(list,acct,f)=>{const mine=L=>inRoom(L,acct)||inStands(L,acct);const rows=list.filter(L=>!!L.flag===f);
    const out=rows.filter(mine).map(room).concat(rows.filter(L=>!mine(L)).slice(0,60).map(lite));
    while(out.length>1&&JSON.stringify(out).length>90000)out.pop();return out};

  /* ✉ one invitation (the rules are the same for lobby.invite and lobby.again); '' or the reason */
  async function inviteOne(L,me,meName,to,o={}){if(!to||to===me)return 'Pick a lanista.';const H=await hereMap();if(!H.get(to))return 'Not in the arena now.';
    const T=await acctOf(to);if(!T||!T.conn)return 'Not in the arena now.';if(T.match&&T.match!==o.again)return 'Fighting right now.';if(C.memberOf(L,to)||L.players.some(p=>p.id===to))return 'Already in the room.';if(inStands(L,to))return 'They hold a ticket to this game.';if(kickedOut(L,to))return 'You removed them a moment ago.';
    if(flagOf(T)!==!!L.flag)return 'They cannot join this game.';
    if(L.ranked){let r=T.here&&T.here.rank;if(!r){const tc=await liveChar(to,T);r=tc?C.rankFor(tc).k:'tiro'}if(r!==L.rank)return `Ranked: ${(C.RANKS[C.rankIdx(L.rank)]||C.RANKS[0]).n} only.`}
    const P='ACCT#'+me,S='PROFILE',t=now();
    if(o.gap!==false&&!(await store.rate(P,S,'ivAt',C.RATE.invGap,t)))return 'Slow down.';
    if(!(await store.rate(P,S,'iv_'+to,C.RATE.invSame,t)))return 'You invited them already.';
    if(!(await store.quota(P,S,'ivH',Math.floor(t/3600e3),C.RATE.invHour)))return 'Enough invitations for this hour.';
    /* a muting lanista never hears it (and the inviter is not told) */
    if(!muting(T,me)){const A=await acctOf(me);const msg={room:L.id,row:lite(L),from:meName,fromId:me,fromDomus:(A&&A.dname)||null};
      await store.put('INVITE#'+to,'R#'+L.id+'#'+me,{room:L.id,by:me,name:meName,at:t,ttl:ttl(1)});
      await editLobby(L.id,X=>{X.invited=(X.invited||[]).filter(x=>!(x.to===to&&x.by===me)).concat([{to,by:me}]).slice(-60)}).catch(()=>null);
      if(pushConn)await pushConn(T.conn,'lobby.invite',msg,to);else await push(to,'lobby.invite',msg)}return ''}
  const memberName=(L,a)=>{const m=C.memberOf(L,a)||L.players.find(p=>p.id===a)||(L.stands||[]).find(s=>s.id===a);return m?m.name:'Lanista'};

  /* a new room for a group: newLobby + roomJoin; the Praeco's 'open' line unless cry === false (an 'open' counts as the first call) */
  async function makeRoom(d,acct,g){const me=g.find(w=>w.id===acct);if(d.ranked&&!me.char)throw new Error('Ranked needs a living gladiator.');
    if(d.inf&&g.some(w=>C.rankIdx(w.rank||'tiro')<C.rankIdx(C.INFAMES_MIN)))throw new Error('Ludi Infames: Veteranus and above.');
    const L=C.newLobby(d,{id:acct,name:me.name,char:me.char,rank:me.rank},id('L'),now());L.flag=g.some(w=>w.strikes>=C.STRIKES_OUT);if(d.quick)L.quick=1;
    const why=C.roomJoin(L,g.map(w=>{const x={...w};delete x.strikes;return x}),now());if(why)throw new Error(why);if(d.cry!==false)L.cry=[now()];await putLobby(L);return L}
  async function announce(L,acct){const As=await fitFor(L,acct);await forumOut(roomLine('open',L,acct,memberName(L,acct)),As)}
  const cleanG=g=>g.map(w=>{const x={...w};delete x.strikes;return x});

  const R={
    /* one request when the Online window opens: who you are, your gladiators, the rooms, presence, the Forum and the news */
    'hello':async(d,ctx)=>{
      /* v0.82 a guest: the landing only (rooms as lite rows, presence, the Forum, news, Today) */
      if(!ctx.acct&&ctx.guest){const G=ctx.guest;const list=await prune((await lobbies()).filter(L=>!L.flag));const out={ver:C.VER,mode:'aws',me:null,guest:{id:G.id,until:(G.first||now())+C.GUEST_MS},now:now()};
        out.lobbies=listFor(list,G.id,false);out.here=await summary(list);out.online=out.here.n;out.forum=await forumLines();out.news=(await world('NEWS')).list.slice(0,8);out.challenges=C.weekChallenges(now());out.today=await today();out.rankCounts=await rankCounts();
        while(out.lobbies.length>1&&JSON.stringify(out).length>115000)out.lobbies.pop();return out}
      const A=await acctOf(ctx.acct);const me=strip(A);const out={ver:C.VER,mode:'aws',me,now:now()};
      /* v0.82 the house: needDomus until it is named (an old account keeps its gladiators — they join the house when it is founded) */
      if(me){out.needDomus=!me.domus;out.domus=C.domusRow(await domusGet(me.domus));if(ctx.tester)out.tester=true}
      if(d.all&&me){const chars=await store.byIndex('OWNER#'+ctx.acct);out.chars=chars.map(strip);const f=flagOf(me);
      const live=chars.filter(c=>c.alive);const ch=live.find(c=>c.id===me.active)||live[live.length-1]||null;out.active=ch?ch.id:null;
      /* the presence entry: gladiator, rank and time zone (written only when it changed) */
      const hr={glad:ch?ch.name:null,rank:ch?C.rankFor(ch).k:'tiro',tz:d.tz!=null?C.cleanTz(d.tz):((me.here&&me.here.tz)||''),...(me.dname?{domus:me.dname}:{})};
      if(JSON.stringify(me.here||null)!==JSON.stringify(hr)){await store.set('ACCT#'+ctx.acct,'PROFILE',{here:hr});out.me={...me,here:hr};const c=(hereC||[]).find(x=>x.id===ctx.acct);if(c)c.here=hr}
      const list=await prune((await lobbies()).filter(L=>!!L.flag===f));out.lobbies=listFor(list,ctx.acct,f);
      out.here=await summary(list);out.online=out.here.n;out.forum=await forumLines();
      out.news=(await world('NEWS')).list.slice(0,8);out.challenges=C.weekChallenges(now());out.today=await today();out.rankCounts=await rankCounts();out.party=me.party?await partyOut(await store.get('PARTY#'+me.party,'PARTY')):null;
      /* the match this lanista's gladiator is still in (also when a CPU holds the seat): the menu offers Rejoin / Abandon */
      /* v0.83 the houses you follow (what they do now) and a killer's open loot windows */
      out.follows=await followsOut(me.follows||[],list);await lootSweep();out.loot=(await lootMine(ctx.acct)).map(lootOut);
      const LM=await stillFighting(A);if(LM){const LL=list.find(x=>x.id===LM.id)||await store.get('LOBBY#'+LM.id,'LOBBY');out.live={id:LM.id,ev:LL&&LL.ev,loc:LL&&LL.loc,ranked:!!LM.ranked,dropped:!!(LM.dropped||{})[ctx.acct]}}
      /* one WebSocket frame is at most 128 KB: other rooms' rows go first */
      while(out.lobbies.length>1&&JSON.stringify(out).length>115000)out.lobbies.pop()}return out},
    'auth.signin':async(d,ctx)=>{if(!dev)throw new Error('Sign in with Google.');const name=C.cleanName(d.name);if(name.length<2)throw new Error('Your name: 2–24 letters.');
      const a={id:ctx.acct,name,since:now()};await store.put('ACCT#'+a.id,'PROFILE',a);return a},
    'auth.signout':async()=>({}),
    /* v0.82 a guest connection (opened with ?guest=<id>): its time zone for the map and the time it has left */
    'auth.guest':async(d,ctx)=>{if(ctx.acct)throw new Error('You are signed in.');if(!ctx.guest)throw fail('guest','Open the arena as a guest first.');const G=ctx.guest;
      const tz=C.cleanTz(d.tz);await store.set('GUEST#'+G.id,'GUEST',{tz});const c=(gC||[]).find(x=>x.id===G.id);if(c)c.tz=tz;return {guest:true,id:G.id,first:G.first,until:(G.first||now())+C.GUEST_MS,now:now()}},
    /* ── v0.82 DOMUS ── */
    'domus.get':async(d,ctx)=>{const A=await acctOf(ctx.acct);const D=await domusGet(A&&A.domus);const old=[];for(const x of (A&&A.domusOld)||[]){const o=await domusGet(x);if(o)old.push(C.domusRow(o))}
      const list=await lobbies();const mine=(await store.byIndex('OWNER#'+ctx.acct)).filter(c=>c.alive);
      return {domus:C.domusRow(D),needDomus:!D,glads:await domusGlads(D),archived:old,gear:(D&&D.gear)||[],pcs:(D&&D.pcs)||{},trophies:(D&&D.trophies)||[],recent:(D&&D.recent)||[],gifts:(D&&D.gifts)||[],offers:(D&&D.offers)||[],busy:mine.filter(c=>charBusy(c.id,list)).map(c=>c.id)}},
    /* v0.82 🗄 the storeroom: move one piece between the house's gladiators and the house itself ('house'); tick a piece to bring */
    'domus.move':async(d,ctx)=>{const A=await acctOf(ctx.acct);const D=await domusGet(A&&A.domus);if(!D)throw fail('need_domus','Name your house first.');const item=String(d.item||'');const list=await lobbies();
      const side=async x=>{if(x==='house')return {house:true};const ch=await charById(x);if(!ch||ch.owner!==ctx.acct||ch.domus!==D.id)throw new Error('Not of your house.');if(charBusy(ch.id,list))throw fail('in_match',`${ch.name} is in a match — the storeroom waits.`);return {ch}};
      const S0=await side(d.from),T0=await side(d.to);if(d.from===d.to)throw new Error('Pick where it goes.');
      const why=C.gearMoveWhy(S0.house?{gear:D.gear||[],pcs:D.pcs||{}}:S0.ch,T0.house?{gear:D.gear||[]}:T0.ch,item,catalog);if(why)throw new Error(why);
      /* take it out first (versioned, with its state: v0.83 pcs), then put it in; a failed put returns it */
      let T=null;const one=P=>({gear:[P.item],pcs:P.pc?{[C.itemUid(P.item)]:P.pc}:{}});
      const take=async()=>S0.house?await editDomus(D.id,X=>{T=C.takePiece(X,item);if(!T)return false}):await editChar(S0.ch.id,c=>{if(!c.alive||!(c.gear||[]).includes(item))return false;T=C.takePiece(c,item)});
      const give=async()=>T0.house?await editDomus(D.id,X=>{C.putPiece(X,T,false)}):await editChar(T0.ch.id,c=>{if(C.gearMoveWhy(one(T),c,item,catalog))return false;C.putPiece(c,T,!C.wearWhy(c,item,T.pc))});
      if(!(await take()))throw new Error('That piece moved a moment ago — try again.');
      if(!(await give())){if(S0.house)await editDomus(D.id,X=>{C.putPiece(X,T,false)});else await editChar(S0.ch.id,c=>{C.putPiece(c,T,false)});throw new Error('It could not go there — it stayed where it was.')}
      const hs=async()=>{const X=await domusGet(D.id);return {house:true,gear:X.gear||[],pcs:X.pcs||{}}};
      return {from:S0.house?await hs():strip(await charById(S0.ch.id)),to:T0.house?await hs():strip(await charById(T0.ch.id))}},
    'domus.equip':async(d,ctx)=>{const ch=await charById(d.char);if(!ch||ch.owner!==ctx.acct)throw new Error('Not yours.');if(charBusy(ch.id,await lobbies()))throw fail('in_match',`${ch.name} is in a match — the storeroom waits.`);
      const c=await editChar(ch.id,x=>{C.gearEquip(x,String(d.item||''),!!d.on)});return strip(c)},
    /* found a house (or, while the current one has never had a gladiator, a new one — the old is archived with its record) */
    'domus.create':async(d,ctx)=>{const A=await acctOf(ctx.acct);if(!A)throw new Error('Sign in first.');const why=C.domusWhy(d.name);if(why)throw fail('domus_name',why);
      const cur=await domusGet(A.domus);if(cur&&(await domusGlads(cur))>0)throw fail('domus_locked','Your house already has gladiators — it stands as it is.');
      const D=C.newDomus(d.name,ctx.acct,id('D'),now());if(!(await claimName(D.name,D)))throw fail('name_taken','Another lanista’s house has that name.');
      /* gladiators made before houses existed join it, with their record */
      const old=(await store.byIndex('OWNER#'+ctx.acct)).filter(c=>!c.domus);C.domusFromChars(D,old);
      for(const c of old)await editChar(c.id,x=>{if(x.domus)return false;x.domus=D.id});
      if((await store.putRev('DOMUS#'+D.id,'DOMUS',domusItem(D)))===false)throw new Error('Try again.');
      if(cur){await editDomus(cur.id,X=>{X.archived=true;X.archivedAt=now()});await releaseName(cur)}
      const P={domus:D.id,dname:D.name};if(cur)P.domusOld=[...(A.domusOld||[]),cur.id].slice(-10);await store.set('ACCT#'+ctx.acct,'PROFILE',P);hereC=null;
      return {domus:C.domusRow(D),needDomus:false,joined:old.length}},
    /* rename: only while the house has never had a gladiator */
    'domus.rename':async(d,ctx)=>{const A=await acctOf(ctx.acct);const D=await domusGet(A&&A.domus);if(!D)throw fail('need_domus','Name your house first.');
      if((await domusGlads(D))>0)throw fail('domus_locked','A house with gladiators keeps its name.');const why=C.domusWhy(d.name);if(why)throw fail('domus_name',why);
      const name=C.cleanName(d.name);const same=C.domusKey(name)===C.domusKey(D.name);if(!same&&!(await claimName(name,D)))throw fail('name_taken','Another lanista’s house has that name.');
      const old={...D};const X=await editDomus(D.id,Y=>{Y.name=name});if(!X)throw new Error('Try again.');if(!same)await releaseName(old);
      await store.set('ACCT#'+ctx.acct,'PROFILE',{dname:name});hereC=null;return {domus:C.domusRow(X)}},
    'char.mine':async(d,ctx)=>(await store.byIndex('OWNER#'+ctx.acct)).map(strip),
    'char.create':async(d,ctx)=>{const live=(await store.byIndex('OWNER#'+ctx.acct)).filter(c=>c.alive);if(live.length>=C.GLAD_MAX)throw new Error(`Up to ${C.GLAD_MAX} living gladiators.`);const ch=C.newChar(d,ctx.acct,id('g'),now());
      const A=await acctOf(ctx.acct);ch.domus=A&&A.domus||null;if(A&&A.dtest)ch.test=true;if(A&&!live.some(c=>c.id===A.active))await store.set('ACCT#'+A.id,'PROFILE',{active:ch.id});await putChar(ch);
      await editDomus(ch.domus,D=>{D.glads=(D.glads|0)+1});await countRank(C.rankFor(ch).k,1,ch);return strip(ch)},
    'char.active':async(d,ctx)=>{const ch=await charById(d.char);if(!ch||ch.owner!==ctx.acct||!ch.alive)throw new Error('Not yours.');if(await busyIn(ctx.acct))throw new Error('Finish or leave your game first.');
      await store.set('ACCT#'+ctx.acct,'PROFILE',{active:ch.id});return strip(ch)},
    'char.edit':async(d,ctx)=>{const ch=await charById(d.char);if(!ch||ch.owner!==ctx.acct)throw new Error('Not yours.');if(await busyIn(ctx.acct))throw new Error('Finish or leave your game first.');
      C.editChar(ch,d,catalog);await putChar(ch);return strip(ch)},
    'char.buy':async(d,ctx)=>{const ch=await store.get('CHAR#'+d.char,'CHAR');if(!ch||ch.owner!==ctx.acct)throw new Error('Not yours.');C.buy(ch,d.item,catalog);if(Array.isArray(ch.equip))ch.equip.push(d.item);await putChar(ch);return strip(ch)}, /* putChar is versioned: two buys at once cannot both spend one purse */
    'lobby.list':async(d,ctx)=>{const me=await acctOf(ctx.acct);const f=flagOf(me);return listFor(await prune((await lobbies()).filter(L=>!!L.flag===f)),ctx.acct,f)},
    /* v0.80: no free text online — phrases only (lobby.say) */
    'lobby.chat':async()=>{throw new Error('Quick chat only.')},
    /* ── ROOMS ── */
    'lobby.create':async(d,ctx)=>{const {g}=await groupOf(ctx.acct);const L=await makeRoom(d,ctx.acct,g);await cancelInvites(g.map(w=>w.id));await toRoom(L,null,{except:ctx.acct});if(d.cry!==false)await announce(L,ctx.acct);return room(L)},
    'lobby.join':async(d,ctx)=>{if(d.inv)return R['lobby.accept'](d,ctx);const L=await getLobby(d.id);const {g}=await groupOf(ctx.acct,{except:L.id});
      if(!!L.flag!==g.some(w=>w.strikes>=C.STRIKES_OUT))throw new Error('That game is gone.');const why=C.roomJoin(L,cleanG(g),now());if(why)throw new Error(why);await putLobby(L);
      await cancelInvites(g.map(w=>w.id),L.id);await toRoom(L,null,{except:ctx.acct});return room(L)},
    /* v0.82 ✉ accept an invitation: refused with code room_gone (+ live:true when the game can be watched) once the room started, filled,
       closed, or everyone who invited you left; no invitation → code no_invite */
    'lobby.accept':async(d,ctx)=>{const L=await store.get('LOBBY#'+d.id,'LOBBY');if(L){L.members=L.members||[];L.players=L.players||[]}const dead=inviteDead(L,ctx.acct);
      if(dead){await dropInvites(ctx.acct,d.id);throw fail('room_gone',GONE_TXT[dead.why],{why:dead.why,...(dead.live?{live:true}:{})})}
      const mine=await store.query('INVITE#'+ctx.acct,'R#'+d.id+'#');if(!mine.length)throw fail('no_invite','That invitation is gone.');
      const {g}=await groupOf(ctx.acct,{except:L.id});if(!!L.flag!==g.some(w=>w.strikes>=C.STRIKES_OUT))throw fail('room_gone',GONE_TXT.closed,{why:'closed'});
      const why=C.roomJoin(L,cleanG(g),now());if(why)throw new Error(why);await putLobby(L);await cancelInvites(g.map(w=>w.id),L.id);await toRoom(L,null,{except:ctx.acct});return room(L)},
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
      await payAll(pay);await deliver(was,'lobby.update',{id:L.id,lobby:room(L),...(closed?{closed:'empty'}:{})},{except:ctx.acct});await sweepInvites(L);return room(L)},
    /* 👑 give the room away */
    'lobby.host':async(d,ctx)=>{const L=await getLobby(d.id);const why=C.roomGiveHost(L,ctx.acct,d.to,now());if(why)throw new Error(why);await putLobby(L);await toRoom(L,null,{except:ctx.acct});return room(L)},
    /* the host removes a lanista (5 minutes before they may come back) */
    'lobby.kick':async(d,ctx)=>{const L=await getLobby(d.id);const why=C.roomKick(L,ctx.acct,d.who,now());if(why)throw new Error(why);await putLobby(L);await toRoom(L,null,{except:ctx.acct});
      await deliver([d.who],'lobby.update',{id:L.id,kicked:1});return room(L)},
    /* the host's settings until the horns: ev, loc, seats, ticket, abandon, standsOff, teams, autoBal */
    'lobby.set':async(d,ctx)=>{const L=await getLobby(d.id);const x={};for(const k of ['ev','loc','seats','ticket','free','abandon','standsOff','teams','autoBal'])if(d[k]!=null)x[k]=d[k];
      const why=C.roomSet(L,ctx.acct,x,now());if(why)throw new Error(why);await putLobby(L);await toRoom(L,null,{except:ctx.acct});return room(L)},
    'lobby.team':async(d,ctx)=>{const L=await getLobby(d.id);const why=C.roomTeam(L,ctx.acct,d.who||ctx.acct,d.team);if(why)throw new Error(why);await putLobby(L);await toRoom(L,null,{except:ctx.acct});return room(L)},
    'lobby.ready':async(d,ctx)=>{const L=await getLobby(d.id);if(L.status!=='waiting')throw new Error('Already under way.');const p=L.players.find(p=>p.id===ctx.acct);if(!p)throw new Error('Sit down first.');
      p.ready=!!d.ready;await putLobby(L);await toRoom(L,null,{except:ctx.acct});return room(L)},
    /* the horns: the unseated leave the room ('started without you'); Ranked teams are balanced */
    /* v0.83 START COUNTDOWN: the host's Start → L.startAt (now + countdown) and the room is pushed; at startAt the host sends lobby.start
       {go:1} (any seated lanista may, 5 s later) and the horns sound. A line-up change stops it (C.countCheck on every room write);
       go:1 on a stopped countdown → code count_stopped; too early → code count_wait {startAt}. countdown 0 (tests) = the horns at once. */
    'lobby.start':async(d,ctx)=>{const L=await getLobby(d.id);const conn={};for(const p of C.humansOf(L)){const P=await acctOf(p.id);conn[p.id]=!!(P&&P.conn)||dev&&!pushConn}
      if(countdown>0){C.countCheck(L);const live=L.startAt!=null;
        if(!live){if(d.go)throw fail('count_stopped','The countdown was stopped — press Start again.');const why=C.canStart(L,ctx.acct,conn);if(why)throw new Error(why);
          L.startAt=now()+countdown;L.startBy=ctx.acct;L.startSig=C.lineupSig(L);await putLobby(L);await toRoom(L,{count:L.startAt},{except:ctx.acct});return {...room(L),now:now()}}
        if(now()<L.startAt){if(!d.go&&ctx.acct===L.host.id)return {...room(L),now:now()};throw fail('count_wait','The horns are not yet.',{startAt:L.startAt,now:now()})}
        const seated=L.players.some(p=>p.id===ctx.acct);if(ctx.acct!==L.host.id&&!(seated&&now()>=L.startAt+5000))throw new Error('The host sounds the horns.')}
      const why=C.canStart(L,countdown>0?L.host.id:ctx.acct,conn);if(why)throw new Error(why);C.stopCount(L);const unseated=C.startRoom(L);
      L.status='live';L.seed=Math.floor(rnd()*2**31)>>>0;L.started=now();await putLobby(L);const humans=L.players.filter(p=>!/^bot/.test(p.id)).map(p=>p.id);const specs=(L.stands||[]).map(s=>s.id);const conns={};
      for(const a of humans.concat(specs)){const A=await acctOf(a);if(A){conns[a]=A.conn||null;await store.set('ACCT#'+a,'PROFILE',{match:L.id})}}
      const seats={};L.players.forEach((p,i)=>{if(humans.includes(p.id))seats[p.id]=i});specs.forEach((a,k)=>{seats[a]=L.seats+k});
      await store.put('MATCH#'+L.id,'META',{id:L.id,seed:L.seed,n:0,players:humans,specs,seats,conns,watch:{},away:{},dropped:{},abandoned:{},left:{},outs:{},reports:{},host:L.host.id,status:'live',ranked:!!L.ranked,abandon:C.abandonRule(L),standsOff:!!L.standsOff,ttl:ttl(2)});
      hereC=null;await toRoom(L,null,{except:ctx.acct});await deliver(unseated,'lobby.update',{id:L.id,started:1,unseated:1});return room(L)},
    /* v0.83 ✕ Hold: the host stops the countdown */
    'lobby.hold':async(d,ctx)=>{const L=await getLobby(d.id);if(L.host.id!==ctx.acct)throw new Error('Only the host holds the horns.');if(L.status!=='waiting')throw new Error('Already under way.');
      if(C.stopCount(L)){await putLobby(L);await toRoom(L,{held:1},{except:ctx.acct})}return room(L)},
    /* playlists: sit in the fullest fitting room, else open one (and the Praeco cries it). No twin rooms. */
    'lobby.quick':async(d,ctx)=>{const ev=C.EVENTS_ALL.includes(d.ev)?d.ev:'democritus';const ranked=!!d.ranked;const {g,list}=await groupOf(ctx.acct);const flag=g.some(w=>w.strikes>=C.STRIKES_OUT);
      if(ranked&&!g.find(w=>w.id===ctx.acct).char)throw new Error('Ranked needs a living gladiator.');
      const tryJoin=async pick=>{const L=await store.get('LOBBY#'+pick.id,'LOBBY');if(!L||L.status!=='waiting')return null;L.members=L.members||[];
        if(L.seats-L.players.length<g.length)return null;if(C.roomJoin(L,cleanG(g),now()))return null;await putLobby(L);await cancelInvites(g.map(w=>w.id),L.id);await toRoom(L,null,{except:ctx.acct});return L};
      const inf=!!d.inf;if(inf&&g.some(w=>C.rankIdx(w.rank||'tiro')<C.rankIdx(C.INFAMES_MIN)))throw new Error('Ludi Infames: Veteranus and above.');
      const pick=C.quickPick(list,g,ev,ranked,flag,now(),inf);if(pick){const L=await tryJoin(pick);if(L)return {lobby:room(L),made:false}}
      /* the playlist's open room is ELECTED with one consistent pointer item (QUICK#…|OPEN): the room index is eventually consistent, the pointer is not */
      const qk='QUICK#'+ev+'#'+(ranked?(g.find(w=>w.id===ctx.acct).rank||'tiro'):'c')+'#'+(flag?1:0)+(inf?'#inf':'');
      const viaPtr=async P=>{if(!P||!P.id)return null;const X=await store.get('LOBBY#'+P.id,'LOBBY');return X&&X.status==='waiting'?tryJoin(X):null};
      let ptr=await store.get(qk,'OPEN');{const J=await viaPtr(ptr);if(J)return {lobby:room(J),made:false}}
      const L=await makeRoom({ev,ranked,quick:1,inf},ctx.acct,g);
      if((await store.putRev(qk,'OPEN',{...(ptr||{}),id:L.id,ttl:ttl(1)}))===false){ptr=await store.get(qk,'OPEN');
        /* another press won the pointer a moment ago: fold into its room (mine closes unseen), or keep mine if theirs will not take us */
        const J=await viaPtr(ptr);if(J){L.status='done';L.closed='merged';await putLobby(L).catch(()=>{});await cancelInvites(g.map(w=>w.id),J.id);return {lobby:room(J),made:false}}}
      /* two playlists pressed at once: the later of two fresh twin rooms folds into the earlier one (both sides agree on the order) */
      const twin=(await lobbies()).filter(X=>X.id!==L.id&&X.quick&&X.status==='waiting'&&X.ev===ev&&!!X.ranked===ranked&&!!X.flag===flag&&!!X.inf===inf&&(!ranked||X.rank===L.rank)&&
        ((X.created||0)<L.created||(X.created===L.created&&X.id<L.id))).sort((a,b)=>(a.created||0)-(b.created||0))[0];
      if(twin){const W=await store.get('LOBBY#'+twin.id,'LOBBY');if(W&&W.status==='waiting'){W.members=W.members||[];const X=JSON.parse(JSON.stringify(W));
        if(!C.roomJoin(X,cleanG(g),now())&&X.players.length-W.players.length===g.length){L.status='done';L.closed='merged';await putLobby(L);await putLobby(X);await cancelInvites(g.map(w=>w.id),X.id);await toRoom(X,null,{except:ctx.acct});return {lobby:room(X),made:false}}}}
      await cancelInvites(g.map(w=>w.id));await toRoom(L,null,{except:ctx.acct});await announce(L,ctx.acct);return {lobby:room(L),made:true}},
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
      const old=await getLobby(M.id);const {g}=await groupOf(ctx.acct);const L=await makeRoom({ev:old.ev,loc:old.loc,ranked:old.ranked,seats:old.seats,inf:!!old.inf,cry:false},ctx.acct,g);await cancelInvites(g.map(w=>w.id));await toRoom(L,null,{except:ctx.acct});
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
      return (await here()).filter(A=>A.id!==ctx.acct&&flagOf(A)===f).slice(0,40).map(A=>({id:A.id,name:nameOf(A),domus:A.dname||null,rank:(A.here&&A.here.rank)||'tiro',st:A.match?'fight':inR.has(A.id)?'room':'free'}))},
    /* ── the Forum ── */
    'forum.get':async()=>forumLines(),
    'forum.say':async(d,ctx)=>{const ch=await liveChar(ctx.acct);if(!ch)throw new Error('Make a gladiator first.');if(!C.phraseOK('forum',d.q))throw new Error('Quick chat only.');
      if(!(await store.rate('ACCT#'+ctx.acct,'PROFILE','fAt',C.RATE.forum,now())))throw new Error('Slow down.');
      const As=(await here()).filter(A=>A.id!==ctx.acct&&!A.match&&!muting(A,ctx.acct));const A=await acctOf(ctx.acct);const line=await forumOut({k:'say',by:ctx.acct,name:ch.name,domus:(A&&A.dname)||null,q:d.q},As);return {line}},
    /* 🔇 your mutes: their phrases, calls and invites never reach you (≤50) */
    'forum.mute':async(d,ctx)=>{const A=await acctOf(ctx.acct);let m=(A.mutes||[]).filter(x=>x!==d.who);if(d.on!==false&&d.who&&d.who!==ctx.acct)m.push(d.who);m=m.slice(-50);
      await store.set('ACCT#'+ctx.acct,'PROFILE',{mutes:m});const c=(hereC||[]).find(x=>x.id===ctx.acct);if(c)c.mutes=m;return {mutes:m}},
    'lobby.watch':async(d)=>{const L=await editLobby(d.id,X=>{X.watchers=(X.watchers||0)+1}).catch(()=>null)||await getLobby(d.id);return room(L)},
    /* a seat in the stands, before the horns; the coin goes into the wager pot (a standing member gives up the room for it) */
    'lobby.ticket':async(d,ctx)=>{const A=await acctOf(ctx.acct);if(await stillFighting(A))throw new Error('Your gladiator is still fighting a match — go back to it (⚔ Rejoin) or abandon it first.');
      const L0=await getLobby(d.id);const c0=await liveChar(ctx.acct,A);const ch=c0&&await charById(c0.id);if(!ch)throw new Error('Tickets are paid from a gladiator’s wallet.');
      const why=C.ticketOK(L0,ctx.acct,ch.wallet);if(why)throw new Error(why);const price=L0.ticket|0;const D=await domusGet(A&&A.domus);
      /* pay first (only over the gladiator copy read), then take the seat in the stands; a refused seat is paid back. A free seat (L.free) pays nothing. */
      if(price){ch.wallet-=price;await putChar(ch)}let err='';
      const L=await editLobby(d.id,X=>{err=C.ticketOK(X,ctx.acct,price);if(err||(X.ticket|0)!==price)return false;if(C.memberOf(X,ctx.acct))C.roomLeave(X,ctx.acct,now());
        (X.stands=X.stands||[]).push(standEntry(ctx.acct,ch,A,D,price,price?null:{free:1}));X.tickets=X.stands.length;X.pot=(X.pot||0)+price}).catch(e=>{err=e.message;return null});
      if(!L){if(price)await credit(ctx.acct,price);throw new Error(err||'The ticket price changed — try again.')}
      await toRoom(L,null,{except:ctx.acct});return {lobby:room(L),char:strip(await charById(ch.id))}},
    /* v0.82 🎟 Flavius's guest pass: once a UTC day a house (DOMUS PASS#<day>, claimed with putNew), while the active gladiator's wallet is under
       PASS.wallet — a free seat (paid 0, pass:1) in a waiting room that sells seats with room in the stands. Sat through → +1 Fame (settleMatch). */
    'lobby.pass':async(d,ctx)=>{const A=await acctOf(ctx.acct);const D=await domusGet(A&&A.domus);if(!D)throw fail('need_domus','Name your house first.');
      if(await stillFighting(A))throw new Error('Your gladiator is still fighting a match — go back to it (⚔ Rejoin) or abandon it first.');
      const c0=await liveChar(ctx.acct,A);const ch=c0&&await charById(c0.id);if(!ch)throw new Error('The pass seats a gladiator’s house — make a gladiator first.');
      const day=C.dayKey(now());const L0=await getLobby(d.id);const why=C.passOK(L0,ctx.acct,ch.wallet,D.passDay,day);if(why)throw new Error(why);
      if(await busyIn(ctx.acct))throw new Error('Leave your room first.');
      if(!(await store.putNew('DOMUS#'+D.id,'PASS#'+day,{room:d.id,acct:ctx.acct,at:now(),ttl:ttl(3)})))throw new Error('One guest pass a day for each house — come back tomorrow.');
      let err='';const L=await editLobby(d.id,X=>{err=C.passOK(X,ctx.acct,0,null,day)||(C.memberOf(X,ctx.acct)?'Leave your room first.':'');if(err)return false;
        (X.stands=X.stands||[]).push(standEntry(ctx.acct,ch,A,D,0,{pass:1}));X.tickets=X.stands.length}).catch(e=>{err=e.message;return null});
      if(!L){await store.del('DOMUS#'+D.id,'PASS#'+day);throw new Error(err||'Try again.')}
      const D2=(await editDomus(D.id,X=>{X.passDay=day}))||D;await toRoom(L,null,{except:ctx.acct});return {lobby:room(L),char:strip(ch),domus:C.domusRow(D2)}},
    /* v0.82 the house's patron look (the face in the stands): cleaned, ≤1 KB; {} or null = the generated default */
    'domus.patron':async(d,ctx)=>{const A=await acctOf(ctx.acct);const D=await domusGet(A&&A.domus);if(!D)throw fail('need_domus','Name your house first.');
      if(d.look!=null&&(typeof d.look!=='object'||Array.isArray(d.look)))throw new Error('Not a look.');if(d.look!=null&&JSON.stringify(d.look).length>4000)throw new Error('That look is too large.');const p=C.cleanPatron(d.look);
      const X=await editDomus(D.id,Y=>{if(Object.keys(p).length)Y.patron=p;else delete Y.patron});if(!X)throw new Error('Try again.');return {domus:C.domusRow(X)}},
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
      const bk='B#'+ts13(now())+'#'+L0.id+'#'+Math.floor(rnd()*1e6).toString(36);
      const L=await editLobby(d.id,X=>{err=C.betOK(X,ctx.acct,seat,amt,amt);if(err)return false;(X.bets=X.bets||[]).push({by:ctx.acct,char:ch.id,seat,amt,bk});X.pool=(X.pool||0)+amt}).catch(e=>{err=e.message;return null});
      if(!L){await credit(ctx.acct,amt);throw new Error(err||'Try again.')}
      /* v0.83 the wagers tab: this bet in the bettor's history, the week's tally */
      try{const p=L.players[seat];const A=await acctOf(ctx.acct);await store.put('BETS#'+ctx.acct,bk,{room:L.id,ev:L.ev,loc:L.loc,ranked:!!L.ranked,seat,amt,target:p?p.name:'CPU',at:now(),res:'open',pay:0,ttl:ttl(30)});
        const wk=C.weekKey(now());await store.counter('WAGERWK#'+wk,'A#'+ctx.acct,'staked',amt);await store.set('WAGERWK#'+wk,'A#'+ctx.acct,{name:ch.name,domus:(A&&A.dname)||null,dom:(A&&A.domus)||null,ttl:ttl(21)})}catch(e){}
      await toRoom(L,null,{except:ctx.acct});return {lobby:room(L),char:strip(await charById(ch.id))}},
    'match.open':async(d,ctx)=>{const M=await meta(d.id);if(M.host!==ctx.acct)throw new Error('Only the host opens the match.');
      if(typeof d.snap!=='object'||JSON.stringify(d.snap).length>300000)throw new Error('The opening is too large.');await store.put('MATCH#'+d.id,'OPEN',{snap:d.snap,ttl:ttl(2)});await toMatch(M,'match.open',{id:d.id},ctx.acct);return {}},
    /* 👁 watch a live match: the opening, the moves so far, and from now on every move as it happens (at most 30 watchers) */
    'match.watch':async(d,ctx)=>{const me=viewer(ctx);const M=await meta(d.id);if(M.status!=='live')throw new Error('That match is over.');const n=Object.keys(M.watch||{}).length;
      if(!inMatch(M,me)){if(n>=30&&!(M.watch||{})[me])throw new Error('The free stands are full — 30 watching.');if(!M.watch){M.watch={};await store.put('MATCH#'+d.id,'META',{...M,watch:{[me]:ctx.conn||null}})}else await store.setIn('MATCH#'+d.id,'META','watch',me,ctx.conn||null)}
      const L=await editLobby(d.id,X=>{X.watchers=(X.watchers||0)+1}).catch(()=>null)||await getLobby(d.id);
      const RW0=me?reclaimWin(M,me):null;const RW=RW0&&await reclaimOpen(d.id,RW0)?RW0:null;
      return {lobby:room(L),players:M.players,specs:M.specs||[],seed:M.seed,abandoned:Object.keys(M.abandoned||{}).filter(a=>M.abandoned[a]),dropped:Object.keys(M.dropped||{}).filter(a=>M.dropped[a]),...(RW?{reclaim:{seat:RW.seat,until:RW.until}}:{})}},
    'match.unwatch':async(d,ctx)=>{const me=viewer(ctx);const M=await store.get('MATCH#'+d.id,'META');if(M&&(M.watch||{})[me]!==undefined)await store.setIn('MATCH#'+d.id,'META','watch',me,null);
      /* v0.82 a ticket holder leaving the stands before the end (a guest pass then earns no Fame) */
      if(M&&M.status==='live'&&(M.specs||[]).includes(me)&&!(M.left||{})[me]){if(!M.left)await store.set('MATCH#'+d.id,'META',{left:{[me]:now()}});else await store.setIn('MATCH#'+d.id,'META','left',me,now())}return {}},
    'match.get':async(d)=>{const M=await meta(d.id);const O=await store.get('MATCH#'+d.id,'OPEN');const from=Math.max(0,d.from|0);
      const ins=(await store.query('MATCH#'+d.id,'IN#')).map(x=>x.in).filter(x=>x.seq>=from);return {open:O?O.snap:null,inputs:ins,seed:M.seed}},
    /* the hot path: ONE update (the seq + the match record) + ONE small put + a push to each OTHER player */
    'match.input':async(d,ctx)=>{const raw=d.in||{};if(JSON.stringify(raw).length>4000)throw new Error('That move is too large.');
      const B=await store.bump('MATCH#'+d.id,'META','n');if(!B)throw new Error('No such match.');const M=B.item;if(!inMatch(M,ctx.acct))throw new Error('Not your match.');if(M.status!=='live')throw new Error('The match is not live.');
      if((M.dropped||{})[ctx.acct])throw new Error('A CPU holds your seat now.');if((M.abandoned||{})[ctx.acct])throw new Error('You left this match.');
      /* anti-cheat: a move may only speak for the sender's own seat (a burned seq is harmless: clients skip a server 'void') */
      if((raw.seat|0)!==(M.seats||{})[ctx.acct]||['drop','abandon','reclaim','cpugo','void','stands.result'].includes(raw.k)){const v={k:'void',from:'server',seq:B.seq};await store.put('MATCH#'+d.id,'IN#'+String(B.seq).padStart(8,'0'),{in:v,ttl:ttl(2)});await toMatch(M,'match.input',{id:d.id,in:v});throw new Error('That seat is not yours.')}
      const inp={...raw,from:ctx.acct,seq:B.seq};await store.put('MATCH#'+d.id,'IN#'+String(B.seq).padStart(8,'0'),{in:inp,ttl:ttl(2)});
      await toMatch(M,'match.input',{id:d.id,in:inp},ctx.acct);return {seq:B.seq}},
    'match.snapreq':async(d,ctx)=>{const me=viewer(ctx);const M=await meta(d.id);const w=a=>(M.watch||{})[a]!==undefined;if(!(inMatch(M,me)||w(me))||!inMatch(M,d.to))throw new Error('Not your match.');await toMatch({conns:{[d.to]:connOf(M,d.to)}},'match.snapreq',{id:d.id,to:d.to,from:me,seq:d.seq});return {}},
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
      const B=await store.bump('MATCH#'+d.id,'META','n');const until=now()+C.RECLAIM_MS;const inp={k:'drop',seat:d.seat|0,from:'server',seq:B.seq,until};await rclOpen(d.id,B.item,who,d.seat|0,until);await store.put('MATCH#'+d.id,'IN#'+String(B.seq).padStart(8,'0'),{in:inp,ttl:ttl(2)});
      await store.setIn('MATCH#'+d.id,'META','dropped',who,true);await toMatch(B.item,'match.input',{id:d.id,in:inp});return {done:1}},
    /* 🚪 Abandon: a server input every client applies at that seat's next decision; Ranked kills the gladiator now (Damnatio).
       When no human is left on the sand, the match shuts down. */
    'match.abandon':async(d,ctx)=>{const M=await meta(d.id);if(!(M.players||[]).includes(ctx.acct))throw new Error('Not your match.');if(M.status!=='live')return {done:1};
      if((M.abandoned||{})[ctx.acct])return {done:1};const L=await getLobby(d.id);const rule=M.abandon||C.abandonRule(L);const seat=M.seats[ctx.acct];
      const B=await store.bump('MATCH#'+d.id,'META','n');const rcl=rule==='cpu'&&!L.ranked?now()+C.RECLAIM_MS:0;const inp={k:'abandon',seat,rule,from:'server',seq:B.seq,...(rcl?{until:rcl}:{})};if(rcl)await rclOpen(d.id,B.item,ctx.acct,seat,rcl);await store.put('MATCH#'+d.id,'IN#'+String(B.seq).padStart(8,'0'),{in:inp,ttl:ttl(2)});
      if(!B.item.abandoned)await store.put('MATCH#'+d.id,'META',{...B.item,abandoned:{[ctx.acct]:rule}});else await store.setIn('MATCH#'+d.id,'META','abandoned',ctx.acct,rule);
      await toMatch(B.item,'match.input',{id:d.id,in:inp});let out=null;
      if(L.ranked){const pl=L.players.find(p=>p.id===ctx.acct);let before='tiro',gx=null;const ch=pl&&await editChar(pl.char,c=>{if(!c.alive)return false;before=C.rankFor(c).k;out=C.applyResult(c,{won:false,place:L.seats,f:0,coin:0,survives:false},true,{now:now()});out.abandoned=1;gx=C.gearAfter(c,pl.kit,{survives:false},true)});
        if(ch&&out){if(out.died)await countRank(before,-1,ch);await fallen(ch,out);await domusAfter(ch,{won:false},out,true,{id:d.id,ev:L.ev,loc:L.loc,at:now(),ranked:true},gx);try{await deadGear(d.id,seat,ch,ctx.acct,gx,null)}catch(e){}await store.setIn('MATCH#'+d.id,'META','outs',ctx.acct,out);if(!ch.test)await dayEdit(D=>C.dayFell(D,{id:d.id,acct:ctx.acct,ev:L.ev,loc:L.loc,at:now(),ch,before,hall:out.hall,gx}))}}
      const M2=await meta(d.id);const left=(M2.players||[]).filter(a=>!(M2.abandoned||{})[a]&&!(M2.dropped||{})[a]);
      if(!left.length)await closeMatch(d.id,'empty');else if(left.every(a=>(M2.reports||{})[a]))await settleMatch(d.id,M2,ctx.acct);
      const A=await acctOf(ctx.acct);if(A&&A.match===d.id)await store.set('ACCT#'+A.id,'PROFILE',{match:null});return {done:1,out,rule}},
    /* ══════════ v0.83 ══════════ */
    /* 🧪 the armory's offerings: buy one into a gladiator's satchel; pick ≤2 to bring (never while seated in a room or a match) */
    'offer.buy':async(d,ctx)=>{const ch=await ownChar(ctx.acct,d.char);const c=await editChar(ch.id,x=>{C.offerBuy(x,String(d.key||''))});return strip(c)},
    'offer.bring':async(d,ctx)=>{const ch=await ownChar(ctx.acct,d.char);if(charBusy(ch.id,await lobbies()))throw fail('in_match',`${ch.name} is in a match — the satchel waits.`);
      const c=await editChar(ch.id,x=>{C.offerBring(x,Array.isArray(d.keys)?d.keys.map(String):d.keys)});return strip(c)},
    /* 🔨 repair a broken piece (⅓ of its value) — paid from the house treasury or a gladiator's wallet (pay: 'treasury' | <gladiator id>) */
    'gear.repair':async(d,ctx)=>{const A=await acctOf(ctx.acct);const D=await domusGet(A&&A.domus);if(!D)throw fail('need_domus','Name your house first.');const item=String(d.item||'');const list=await lobbies();
      let H=D,hc=null;if(d.holder!=='house'){hc=await ownChar(ctx.acct,d.holder);if(hc.domus!==D.id)throw new Error('Not of your house.');if(charBusy(hc.id,list))throw fail('in_match',`${hc.name} is in a match — the forge waits.`);H=hc}
      const I=(H.gear||[]).includes(item)?C.pieceOf(H,item,catalog):null;if(!I)throw new Error('That piece is not there.');if(I.st!=='broken')throw new Error('That piece is whole.');const cost=C.repairCost(I);
      const byT=d.pay==='treasury'||(d.pay==null&&!hc);let payer=null;
      if(byT){if(!(await editDomus(D.id,Y=>{if((Y.treasury|0)<cost)return false;Y.treasury-=cost})))throw fail('no_coin',`The treasury needs ${cost} coin.`,{cost})}
      else{payer=await ownChar(ctx.acct,d.pay||hc.id);if(payer.domus!==D.id)throw new Error('Not of your house.');if(!(await editChar(payer.id,c=>{if(!c.alive||(c.wallet|0)<cost)return false;c.wallet-=cost})))throw fail('no_coin',`The repair costs ${cost} coin.`,{cost})}
      const ok=hc?await editChar(hc.id,c=>{if(!C.isBroken(c,item))return false;C.repairItem(c,item)}):await editDomus(D.id,Y=>{if(!C.isBroken(Y,item))return false;C.repairItem(Y,item)});
      if(!ok){if(byT)await editDomus(D.id,Y=>{Y.treasury=(Y.treasury|0)+cost});else await editChar(payer.id,c=>{c.wallet=(c.wallet|0)+cost});throw new Error('That piece changed a moment ago — try again.')}
      const D2=await domusGet(D.id);return {cost,item,holder:hc?strip(await charById(hc.id)):{house:true,gear:D2.gear||[],pcs:D2.pcs||{}},domus:C.domusRow(D2),...(payer&&payer.id!==(hc&&hc.id)?{payer:strip(await charById(payer.id))}:{})}},
    /* 🏛 the treasury buys a printed piece onto the house shelf (for any of its gladiators: domus.move) */
    'domus.buy':async(d,ctx)=>{const A=await acctOf(ctx.acct);const D=await domusGet(A&&A.domus);if(!D)throw fail('need_domus','Name your house first.');const it=catalog[d.item];if(!it)throw new Error('No such piece.');
      const p=C.priceOf(it);const X=await editDomus(D.id,Y=>{if((Y.treasury|0)<p)return false;Y.treasury-=p;Y.gear=[...(Y.gear||[]),d.item]});if(!X)throw fail('no_coin',`The treasury needs ${p} coin.`,{cost:p});
      return {domus:C.domusRow(X),gear:X.gear||[],pcs:X.pcs||{}}},
    /* 🎁 open one of Flavius's gifts (the server rolls). His call: gifts belong to the HOUSE (D.gifts) and are opened for the ACTIVE gladiator
       (coin / CF bonus / offering / gear to him; a named piece below Veteranus waits on the shelf) — with no living gladiator into the house
       (C.applyGiftHouse). A gift still on a gladiator (before the move) opens as before, for him. */
    'gift.open':async(d,ctx)=>{const A=await acctOf(ctx.acct);const D0=await domusGet(A&&A.domus);const list=await lobbies();
      let old=null;if(d.char){const c0=await charById(d.char);if(c0&&c0.owner===ctx.acct&&c0.alive&&(c0.gifts||[]).some(g=>g.id===d.gift))old=c0}
      if(!old&&!(D0&&(D0.gifts||[]).some(g=>g.id===d.gift)))throw new Error('No such gift.');
      const ch=old||await liveChar(ctx.acct,A);if(ch&&charBusy(ch.id,list))throw fail('in_match',`${ch.name} is in a match — open it afterwards.`);
      const rw=C.rollGift(rnd,catalog,ch?C.rankFor(ch).k:'tiro');let pool=null,def=null,claim=null;
      if(rw.k==='named'){const P0=(await store.query('CHEST','P#',{limit:20})).filter(x=>!x.taken);
        if(P0.length&&rnd()<0.5){const x=P0[Math.min(P0.length-1,Math.floor(rnd()*P0.length))];if(await store.flip('CHEST',x.SK,'taken',0,1)){pool={item:x.item,pc:x.pc};await store.del('CHEST',x.SK)}}
        if(!pool){const A84=rw.kind==='a';const U=A84?'UNIQA#':'UNIQ#';const roll=A84?C.rollNamedArmor:C.rollNamed;const taken=(await store.query('WORLD',U)).map(x=>x.k);def=roll(rnd,catalog,rw.rar,taken);
          if(def&&def.uq){if(await store.putNew('WORLD',U+def.uq,{k:def.uq,at:now()}))claim=U+def.uq;else def=roll(rnd,catalog,'epic',[])}}
        if(!pool&&!def){rw.k='coin';rw.v=50}}
      const undo=async()=>{if(claim)await store.del('WORLD',claim);if(pool)await store.put('CHEST','P#'+C.itemUid(pool.item),{item:pool.item,pc:pool.pc,at:now(),taken:0})};
      /* the gift leaves the house first (versioned: opened once) */
      if(!old&&!(await editDomus(D0.id,Y=>{if(!(Y.gifts||[]).some(g=>g.id===d.gift))return false;C.giftTake(Y,d.gift)}))){await undo();throw new Error('No such gift.')}
      let P=null,res=null,c=null;
      if(ch)c=await editChar(ch.id,x=>{if(!x.alive)return false;if(old){if(!(x.gifts||[]).some(g=>g.id===d.gift))return false;C.giftTake(x,d.gift)}
        P=rw.k==='named'?(pool||C.namedPiece(def,x)):null;if(P&&!C.canWearNamed(x)){res={to:'house'};return}res=C.applyGift(x,null,rw,P)});
      if(old&&!c){await undo();throw new Error('No such gift.')}
      let D2=null;const hid=(c&&c.domus)||(D0&&D0.id);
      if(!c||res.to==='house')D2=await editDomus(hid,Y=>{if(rw.k==='named'&&!P)P=pool||C.namedPiece(def,Y);res=c?(C.putPiece(Y,P,false),{to:'house'}):C.applyGiftHouse(Y,rw,P)});
      const piece=P?C.pieceInfo(P,catalog):rw.k==='gear'?(c?C.pieceOf(c,rw.item,catalog):C.pieceInfo({item:rw.item,pc:null},catalog)):null;
      return {reward:{...rw,...(piece?{piece}:{}),...(res&&res.coin?{coin:res.coin}:{}),...(res&&res.sold?{sold:true}:{})},to:res?res.to:'house',char:c?strip(c):null,
        ...(D2||D0?{domus:C.domusRow(D2||await domusGet(hid)),gear:(D2||{}).gear||undefined,pcs:(D2||{}).pcs||undefined,gifts:((D2||await domusGet(hid))||{}).gifts||[]}:{})}},
    /* 🧪 one offering between the house shelf and a gladiator's satchel (from/to: 'house' | <gladiator id>) */
    'offer.move':async(d,ctx)=>{const A=await acctOf(ctx.acct);const D=await domusGet(A&&A.domus);if(!D)throw fail('need_domus','Name your house first.');const k=String(d.key||'');const list=await lobbies();
      const side=async x=>{if(x==='house')return null;const ch=await ownChar(ctx.acct,x);if(ch.domus!==D.id)throw new Error('Not of your house.');if(charBusy(ch.id,list))throw fail('in_match',`${ch.name} is in a match — the satchel waits.`);return ch};
      if(d.from===d.to)throw new Error('Pick where it goes.');const sc=await side(d.from),dc=await side(d.to);
      const S0=sc||D,D1=dc||D;const why=C.offerMoveWhy(S0,D1,k);if(why)throw new Error(why);
      /* take first, then give (a failed give puts it back) */
      const took=sc?await editChar(sc.id,x=>{if(!(x.offers||[]).includes(k))return false;C.offerMove(x,{offers:[]},k)}):await editDomus(D.id,Y=>{if(!(Y.offers||[]).includes(k))return false;C.offerMove(Y,{offers:[],cls:1},k)});
      if(!took)throw new Error('That offering is not there.');
      const put=dc?await editChar(dc.id,x=>{if((x.offers||[]).length>=C.OFF_MAX)return false;x.offers=[...(x.offers||[]),k]}):await editDomus(D.id,Y=>{if((Y.offers||[]).length>=(C.shelfMax?C.shelfMax(Y):C.OFF_SHELF))return false; /* v0.89: the shelf upgrade */Y.offers=[...(Y.offers||[]),k]});
      if(!put){if(sc)await editChar(sc.id,x=>{x.offers=[...(x.offers||[]),k]});else await editDomus(D.id,Y=>{Y.offers=[...(Y.offers||[]),k]});throw new Error(dc?`Up to ${C.OFF_MAX} offerings in the satchel.`:'The shelf is full.')}
      const D2=await domusGet(D.id);const out=x=>x?strip(x):{house:true,offers:D2.offers||[]};return {from:out(sc&&await charById(sc.id)),to:out(dc&&await charById(dc.id)),domus:C.domusRow(D2)}},
    /* ⚔ the killer's pick from the fallen's brought gear (LOOT_MS after the settlement; then the most valuable is taken for him) */
    'loot.list':async(d,ctx)=>{await lootSweep();return (await lootMine(ctx.acct)).map(lootOut)},
    'loot.pick':async(d,ctx)=>{const X=await store.get('LOOT#'+d.id,'S#'+rk(d.seat|0));if(!X||!X.killer||X.killer.acct!==ctx.acct)throw new Error('Nothing to take.');
      if(X.done)throw fail('loot_done','The pick is made.',{picked:X.picked});let i=X.pieces.findIndex(p=>p.item===d.item);if(i<0)throw new Error('Pick one of the pieces.');
      if(now()>X.until)i=null;const r=await lootResolve(X,i);if(!r)throw fail('loot_done','The pick is made.');return r},
    /* 🏺 the used market: the fallen's printed pieces with their history (broken ones at ⅔ price) */
    'market.list':async(d,ctx)=>{await lootSweep();return {used:(await store.query('MARKET','U#',{limit:60,desc:true})).filter(x=>!x.sold).map(x=>({id:x.id,item:x.item,base:x.base,n:x.n,kind:x.kind,lv:x.lv,st:x.st,price:x.price,at:x.at,from:x.from||null,hist:(x.pc&&x.pc.hist)||[]}))}},
    'market.buy':async(d,ctx)=>{const ch=await ownChar(ctx.acct,d.char);const sk=String(d.id||'');if(!/^U#/.test(sk))throw new Error('No such piece.');const X=await store.get('MARKET',sk);if(!X||X.sold)throw fail('sold','Someone bought it first.');
      const I=C.pieceInfo({item:X.item,pc:X.pc},catalog);if(!I)throw new Error('No such piece.');if(!I.stack&&(ch.gear||[]).some(g=>C.itemBase(g)===I.base))throw new Error('Already yours.');if((ch.wallet|0)<X.price)throw fail('no_coin',`Costs ${X.price} coin.`,{cost:X.price});
      if(!(await store.flip('MARKET',sk,'sold',0,1)))throw fail('sold','Someone bought it first.');
      const c=await editChar(ch.id,x=>{if(!x.alive||(x.wallet|0)<X.price)return false;x.wallet-=X.price;C.putPiece(x,{item:X.item,pc:X.pc},!C.wearWhy(x,X.item,X.pc))});
      if(!c){await store.set('MARKET',sk,{sold:0});throw new Error('Try again.')}await store.del('MARKET',sk);return {char:strip(c)}},
    /* 🏛 any house by id or name: record, trophies, living gladiators, best rank, recent matches, what its lanista does now */
    'domus.profile':async(d,ctx)=>{let id=d.id?String(d.id):null;if(!id&&d.name){const X=await store.get('DNAME#'+C.domusKey(d.name),'DNAME');id=X&&X.domus}const D=await domusGet(id);if(!D)throw fail('no_domus','No such house.');
      const glads=(await store.byIndex('OWNER#'+D.owner)).filter(c=>c.domus===D.id&&c.alive).map(c=>({id:c.id,name:c.name,cls:c.cls,rank:C.rankFor(c).k,glory:Math.round(C.gloryOf(c)),bouts:c.bouts|0,wins:c.wins|0,survived:c.survived|0,look:tokenLook(c)}));
      const rank=glads.reduce((b,g)=>C.rankIdx(g.rank)>C.rankIdx(b)?g.rank:b,'tiro');const me=ctx.acct?await acctOf(ctx.acct):null;const [st]=await followsOut([{id:D.id,name:D.name}]);
      return {domus:{...C.domusRow(D),archived:!!D.archived,trophies:D.trophies||[],recent:D.recent||[]},glads,rank,link:C.domusLink(D.id),following:!!(me&&(me.follows||[]).some(f=>f.id===D.id)),mine:!!(me&&me.domus===D.id),now:st}},
    /* ★ follow a house (one tap, no request; ≤FOLLOW_MAX) — on:false unfollows */
    'domus.follow':async(d,ctx)=>{const A=await acctOf(ctx.acct);const D=await domusGet(String(d.id||''));if(!D)throw fail('no_domus','No such house.');if(D.id===A.domus)throw new Error('That is your own house.');
      let f=(A.follows||[]).filter(x=>x.id!==D.id);if(d.on!==false){if(f.length>=C.FOLLOW_MAX)throw new Error(`Up to ${C.FOLLOW_MAX} houses.`);f.push({id:D.id,name:D.name})}
      await store.set('ACCT#'+ctx.acct,'PROFILE',{follows:f});const c=(hereC||[]).find(x=>x.id===ctx.acct);if(c)c.follows=f;return {follows:await followsOut(f)}},
    /* 🎲 the wagers tab: open pots and odds, my bets (30), this week's best bettors */
    'wager.list':async(d,ctx)=>{const me=ctx.acct?await acctOf(ctx.acct):null;const f=flagOf(me);
      const open=(await lobbies()).filter(L=>(L.status==='waiting'||L.status==='live')&&!!L.flag===f&&((L.bets||[]).length||(L.pot|0))).slice(0,30).map(L=>({id:L.id,ev:L.ev,loc:L.loc,status:L.status,ranked:!!L.ranked,seats:L.seats,
        players:(L.players||[]).map((p,i)=>({seat:i,name:p.name,domus:p.domus||null,cls:p.kit&&p.kit.cls||null})),...C.oddsOf(L)}));
      const mine=ctx.acct?(await store.query('BETS#'+ctx.acct,'B#',{limit:30,desc:true})).map(x=>{const y=strip(x);y.id=x.SK;return y}):[];const wk=C.weekKey(now());
      const tops=[];for(const x of (await store.query('WAGERWK#'+wk,'A#')).sort((a,b)=>(b.net|0)-(a.net|0))){if(tops.length>=10)break;const XD=x.dom?await domusGet(x.dom):null;if(!(XD&&XD.test))tops.push(x)}const top=tops.map(x=>({name:x.name||'A lanista',domus:x.domus||null,dom:x.dom||null,net:x.net|0,won:x.won|0,staked:x.staked|0}));
      return {open,mine,top,week:wk}},
    /* 🧪 ONLINE TESTER GRANTS (his call): only accounts whose sign-in e-mail is in the deploy's TESTERS list (ctx.tester, set on $connect —
       no e-mail is ever stored or sent), only to THEIR OWN house / active gladiator. Every grant is logged (ADMIN#log). A house that ever
       received a grant is a TEST house for good (D.test, ACCT dtest, its gladiators ch.test): Custom only, never in Today, the rank counts,
       the wagers' top list or Victor of the Day. */
    'admin.grant':async(d,ctx)=>{if(!ctx.tester)throw fail('notTester','Only testers may do that.');const A=await acctOf(ctx.acct);const D=await domusGet(A&&A.domus);if(!D)throw fail('need_domus','Name your house first.');
      const ch=await liveChar(ctx.acct,A);if(ch&&charBusy(ch.id,await lobbies()))throw fail('in_match',`${ch.name} is in a match — grant afterwards.`);
      const coin=Math.max(0,Math.min(100000,d.coin|0)),gifts=Math.max(0,Math.min(10,d.gift|0)),glory=Math.max(0,Math.min(10000,+d.glory||0));
      const gear=(Array.isArray(d.gear)?d.gear:[]).map(String).filter(k=>catalog[k]).slice(0,10),offs=(Array.isArray(d.offering)?d.offering:[]).map(String).filter(k=>C.OFFERS83.includes(k)).slice(0,10);
      if(!coin&&!gifts&&!glory&&!gear.length&&!offs.length)throw new Error('Nothing to grant.');
      const what={coin,gift:gifts,glory,gear,offering:offs};const t=now();
      /* the house first: flagged for good, the gifts, gear/offerings that the gladiator cannot carry */
      const live=(await store.byIndex('OWNER#'+ctx.acct)).filter(c=>c.alive&&c.domus===D.id);
      if(!D.test)for(const c of live)await countRank(C.rankFor(c).k,-1);
      let c2=null;const shelf={gear:[],offs:[]};
      if(ch)c2=await editChar(ch.id,x=>{shelf.gear=[];shelf.offs=[];x.test=true;x.wallet=(x.wallet|0)+coin;if(glory){x.glory=Math.round(((C.gloryOf(x)||0)+glory)*100)/100;const R=C.rankFor(x);x.rank=R.k;if(C.rankIdx(R.k)>C.rankIdx(x.rankK||'tiro'))x.rankK=R.k}
        for(const k of gear){if(!catalog[k].stack&&(x.gear||[]).some(g=>C.itemBase(g)===k))shelf.gear.push(k);else C.putPiece(x,{item:k,pc:null},true)}
        for(const k of offs){if((x.offers||[]).length>=C.OFF_MAX)shelf.offs.push(k);else x.offers=[...(x.offers||[]),k]}});
      if(!c2){shelf.gear=gear;shelf.offs=offs}
      for(const c of live)if(!c2||c.id!==c2.id)await editChar(c.id,x=>{x.test=true});
      const X=await editDomus(D.id,Y=>{Y.test=true;if(!c2)Y.treasury=(Y.treasury|0)+coin;for(let i=0;i<gifts;i++)C.giftsIn(Y,[{id:'test:'+t.toString(36)+':'+i,why:'test',at:t,glad:c2?c2.name:null}]);
        for(const k of shelf.gear)C.putPiece(Y,{item:k,pc:null},false);if(shelf.offs.length)C.offersIn(Y,shelf.offs)});
      await store.set('ACCT#'+ctx.acct,'PROFILE',{dtest:true});
      const LG=(await store.get('ADMIN','log'))||{list:[]};LG.list=[{at:t,acct:ctx.acct,domus:D.id,glad:c2?c2.id:null,what},...(LG.list||[])].slice(0,500);await store.put('ADMIN','log',LG);
      return {domus:C.domusRow(X),char:c2?strip(c2):null,gifts:(X&&X.gifts)||[],gear:(X&&X.gear)||[],pcs:(X&&X.pcs)||{},offers:(X&&X.offers)||[]}},
    'hall.list':async()=>(await world('HALL')).list.slice(0,60),
    'world.news':async()=>({news:(await world('NEWS')).list.slice(0,8),online:(await here()).length,guests:(await guestsHere()).length,challenges:C.weekChallenges(now()),today:await today(),rankCounts:await rankCounts()}),
    /* ── v0.82 STANDS GROUP TURN. MATCH#<id> STW#<rot6> = the window {rot,open,at,holders}; STP#<rot6>#<acct> = one private pick.
       The host opens it once a rotation; every ticket holder hears stands.window and sends ONE pick (stored, never pushed);
       the host closes it (20 s) — or it closes when all have answered, or any fighter may close it 25 s after it opened —
       and ONE server input {k:'stands.result',rot,picks:[{seat,pick}],missed:[seat…]} joins the match's ordered inputs. ── */
    'match.stands.open':async(d,ctx)=>{const M=await meta(d.id);if(M.host!==ctx.acct)throw new Error('Only the host opens the stands.');if(M.status!=='live')throw new Error('The match is not live.');
      if(M.standsOff)throw fail('no_stands','This game has no stands.');const rot=d.rot|0;if(rot<0)throw new Error('Which rotation?');
      const holders=C.standsHolders(M);if(!holders.length)throw fail('no_stands','Nobody holds a ticket.');
      const at=now();if(!(await store.putNew('MATCH#'+d.id,'STW#'+rk(rot),{rot,open:true,at,holders,ttl:ttl(2)})))throw fail('stands_twice','The stands already chose this rotation.');
      const until=at+C.STANDS_MS;for(const a of holders)await toMatch({conns:{[a]:(M.conns||{})[a]||null}},'stands.window',{id:d.id,rot,until,seat:(M.seats||{})[a]});
      return {rot,until,holders:holders.map(a=>(M.seats||{})[a])}},
    'match.stands.pick':async(d,ctx)=>{const M=await meta(d.id);const rot=d.rot|0;const W=await store.get('MATCH#'+d.id,'STW#'+rk(rot));
      if(!W||!W.open)throw fail('stands_closed','The stands have chosen — wait for the next rotation.');if((M.players||[]).includes(ctx.acct))throw new Error(C.FELL_WATCH);if(!(W.holders||[]).includes(ctx.acct))throw new Error('Only ticket holders choose from the stands.');
      const why=C.standsPickOK(d.pick);if(why)throw new Error(why);const pick=C.cleanPick(d.pick);
      if(!(await store.putNew('MATCH#'+d.id,'STP#'+rk(rot)+'#'+ctx.acct,{acct:ctx.acct,seat:(M.seats||{})[ctx.acct],pick,at:now(),ttl:ttl(2)})))throw fail('stands_twice','You already chose this rotation.');
      const n=(await store.query('MATCH#'+d.id,'STP#'+rk(rot)+'#')).length;let closed=null;if(n>=W.holders.length)closed=await closeStands(d.id,M,rot);
      return {rot,ok:true,...(closed?{closed:true,seq:closed.seq}:{})}},
    'match.stands.close':async(d,ctx)=>{const M=await meta(d.id);const rot=d.rot|0;const W=await store.get('MATCH#'+d.id,'STW#'+rk(rot));if(!W)throw new Error('No stands window for that rotation.');
      if(M.host!==ctx.acct){if(!liveHumans(M).includes(ctx.acct)||(M.specs||[]).includes(ctx.acct))throw new Error('Only the host closes the stands.');if(now()-W.at<C.STANDS_MS+5000)throw new Error('The stands are still choosing.')}
      const inp=W.open?await closeStands(d.id,M,rot):null;return inp?{closed:true,seq:inp.seq}:{closed:false}},
    /* v0.82 a ticket holder was speared: every live human FIGHTER reports it once (SPR#<seat>#<acct>); when a strict majority of them
       agree, the ticket price goes back to the holder exactly once (the lobby's copy is edited versioned) → push stands.refund */
    'match.speared':async(d,ctx)=>{const M=await meta(d.id);if(M.status!=='live')throw new Error('That match is over.');const seat=d.seat|0;
      const fighters=(M.players||[]).filter(a=>!(M.dropped||{})[a]&&!(M.abandoned||{})[a]);if(!fighters.includes(ctx.acct))throw new Error('Only the fighters report a speared spectator.');
      const holder=(M.specs||[]).find(a=>(M.seats||{})[a]===seat);if(!holder)throw new Error('No ticket holder in that seat.');
      await store.putNew('MATCH#'+d.id,'SPR#'+rk(seat)+'#'+ctx.acct,{at:now(),ttl:ttl(2)});
      const votes=(await store.query('MATCH#'+d.id,'SPR#'+rk(seat)+'#')).filter(x=>fighters.includes(String(x.SK).split('#').pop())).length;const need=Math.floor(fighters.length/2)+1;
      if(votes<need)return {votes,need,refunded:0};
      let amt=0;await editLobby(d.id,X=>{amt=0;const t=(X.stands||[]).find(s=>s.id===holder);if(!t||!(t.paid|0))return false;amt=t.paid|0;t.paid=0;t.speared=1;X.pot=Math.max(0,(X.pot|0)-amt)});
      if(amt){await credit(holder,amt);await deliver([holder],'stands.refund',{id:d.id,seat,amt})}return {votes,need,refunded:amt}}};
  /* the window closes once: every pick becomes one input in the match's order */
  async function closeStands(id,M,rot){if(!(await store.flip('MATCH#'+id,'STW#'+rk(rot),'open',true,false)))return null;const W=await store.get('MATCH#'+id,'STW#'+rk(rot));
    const ps=(await store.query('MATCH#'+id,'STP#'+rk(rot)+'#')).filter(p=>(W.holders||[]).includes(p.acct));const got=new Set(ps.map(p=>p.acct));
    const picks=ps.map(p=>({seat:p.seat,pick:p.pick})).sort((a,b)=>a.seat-b.seat);const missed=(W.holders||[]).filter(a=>!got.has(a)).map(a=>(M.seats||{})[a]).sort((a,b)=>a-b);
    const B=await store.bump('MATCH#'+id,'META','n');if(!B)return null;const inp={k:'stands.result',rot,picks,missed,from:'server',seq:B.seq};
    await store.put('MATCH#'+id,'IN#'+String(B.seq).padStart(8,'0'),{in:inp,ttl:ttl(2)});await toMatch(B.item,'match.input',{id,in:inp});return inp}
  /* ══════════ v0.84 (protocol 7, tools/plans/onl84-contract.md) ══════════ */
  /* a META map field: set the whole map when it is missing (setIn needs the map to exist), else one key */
  async function metaIn(id,M,map,k,v){if(!M||!M[map]){await store.set('MATCH#'+id,'META',{[map]:{...((M&&M[map])||{}),[k]:v}});if(M)M[map]={...(M[map]||{}),[k]:v}}else{await store.setIn('MATCH#'+id,'META',map,k,v);M[map][k]=v}}
  /* ── 🔌 RECLAIM: a dropped (or, in Custom, CPU-abandoned) lanista may take the seat back within RECLAIM_MS, until the CPU begins that seat's next turn ── */
  /* every client HALTS at the start of that seat's next CPU turn and waits for ONE server input: 'reclaim' (the lanista is back) or 'cpugo' (the window
     closed: the CPU plays on). One lock a window (MATCH RCLX#<seat>#<dropAt>, putNew) makes them exclusive. */
  async function rclOpen(id,M,acct,seat,until){try{await metaIn(id,M,'dropAt84',acct,until-C.RECLAIM_MS);await store.set('ACCT#'+acct,'PROFILE',{rcl84:{id,seat,until}})}catch(e){}}
  const reclaimWin=(M,acct)=>{const seat=(M.seats||{})[acct];if(seat==null||M.status!=='live')return null;const dr=(M.dropped||{})[acct],ab=(M.abandoned||{})[acct];if(!dr&&ab!=='cpu')return null;
    if(ab&&M.ranked)return null;const at=(M.dropAt84||{})[acct];if(!at)return null;return {seat,at,until:at+C.RECLAIM_MS,lock:'RCLX#'+seat+'#'+at}};
  const reclaimOpen=async(id,W)=>!!W&&W.until>now()&&!(await store.get('MATCH#'+id,W.lock));
  /* ── 🔨 FLAVIUS'S AUCTION: AUCTION#<week> L#<n> lots drawn from the chest pool; AUCWIN#<week> D#<domus> = the house's one win ── */
  const aucPK=key=>'AUCTION#'+key;
  const lotOut=(X,me)=>{const I=C.pieceInfo({item:X.item,pc:X.pc},catalog)||{};return {id:X.id,item:X.item,kind:I.kind||'w',n:I.n||'',rar:I.rar||null,lv:I.lv||4,ap:I.ap,val:X.val|0,min:X.min|0,next:C.aucNextMin(X),opens:X.opens,ends:X.ends,
    bid:X.bid?{name:X.bid.name,dname:X.bid.dname||null,amt:X.bid.amt|0,at:X.bid.at,...(me&&X.bid.acct===me?{mine:true}:{})}:null,bids:(X.bids||[]).map(b=>({name:b.name,dname:b.dname||null,amt:b.amt|0,at:b.at})),
    hist:(X.pc&&X.pc.hist)||[],w:(X.pc&&X.pc.w)||null,done:!!X.done,won:X.won?{name:X.won.name,dname:X.won.dname||null,amt:X.won.amt|0,to:X.won.to||null}:null,mine:!!(me&&X.bid&&X.bid.acct===me)}};
  /* the week's lots: the first sweep of a week draws up to AUC_LOTS named pieces from the chest pool (META putNew: once) */
  async function aucDraw(t){const S=C.seasonAt(t);if(await store.get(aucPK(S.key),'META'))return;if(!(await store.putNew(aucPK(S.key),'META',{at:t,ttl:ttl(90)})))return;
    const pool=(await store.query('CHEST','P#',{limit:40})).filter(x=>!x.taken);let n=0;const ends=C.aucEnds(t);
    for(const x of pool){if(n>=C.AUC_LOTS)break;const I=C.pieceInfo({item:x.item,pc:x.pc},catalog);if(!I||!I.named)continue;if(!(await store.flip('CHEST',x.SK,'taken',0,1)))continue;await store.del('CHEST',x.SK);n++;
      await store.put(aucPK(S.key),'L#'+rk(n),{id:S.key+'#'+n,key:S.key,n,item:x.item,pc:x.pc||null,val:C.valueOf(I),min:C.aucMin(C.valueOf(I)),opens:t,ends,bid:null,bids:[],done:false,won:null,from:x.from||null,ttl:ttl(90)})}}
  /* an ended lot (versioned with the bids): the piece to the winner (his gladiator from Veteranus up, else the house shelf), the coin leaves the game;
     no bid → back to the chest pool */
  async function aucSettle(key,n){for(let i=0;i<6;i++){const X=await store.get(aucPK(key),'L#'+rk(n));if(!X||X.done||now()<=X.ends)return null;X.done=true;
      if((await store.putRev(aucPK(key),'L#'+rk(n),X))===false)continue;const b=X.bid;let P={item:X.item,pc:X.pc||null};
      if(!b){await store.put('CHEST','P#'+C.itemUid(P.item),{item:P.item,pc:P.pc,at:now(),from:X.from||null,taken:0});return {to:'chest'}}
      P=C.histAdd(P,{house:b.dname||null,glad:b.name,when:now(),how:'auction'});let to='house',c=null;
      if(b.char)c=await editChar(b.char,x=>{if(!x.alive||!C.canWearNamed(x))return false;C.putPiece(x,P,true)});
      if(c)to='glad';else if(!(await editDomus(b.dom,Y=>{C.putPiece(Y,P,false)}))){to='chest';await store.put('CHEST','P#'+C.itemUid(P.item),{item:P.item,pc:P.pc,at:now(),from:X.from||null,taken:0})}
      await store.set(aucPK(key),'L#'+rk(n),{won:{name:b.name,dname:b.dname||null,amt:b.amt|0,acct:b.acct,dom:b.dom,to},pc:P.pc});await store.putNew('AUCWIN#'+key,'D#'+b.dom,{lot:X.id,at:now(),ttl:ttl(90)});
      const I=C.pieceInfo(P,catalog)||{};await deliver([b.acct],'auction.won',{lot:X.id,n:I.n,amt:b.amt|0,to,char:c?strip(c):null});await news(['🔨',`${b.name} won ${I.n||'a named piece'} at Flavius’s auction.`]);return {to}}return null}
  /* no timers: every hello, auction.list and market.list sweeps (this week's draw, ended lots of this week and the last) */
  let aucAt=0;
  async function aucSweep(force){const t=now();if(!force&&hereMs&&t-aucAt<hereMs)return;aucAt=t;try{await aucDraw(t);const S=C.seasonAt(t);
      for(const k of [...new Set([S.key,C.seasonKeyOf(Math.max(0,S.n-1))])])for(const X of await store.query(aucPK(k),'L#'))if(!X.done&&t>X.ends)await aucSettle(k,X.n)}catch(e){}}
  /* an outbid leader's coin back: to the gladiator, or (fallen since) the house treasury */
  async function aucRefund(b,lot){if(!b||!(b.amt|0))return;const c=b.char?await editChar(b.char,x=>{if(!x.alive)return false;x.wallet=(x.wallet|0)+(b.amt|0)}):null;
    if(!c)await editDomus(b.dom,Y=>{Y.treasury=(Y.treasury|0)+(b.amt|0)});await deliver([b.acct],'auction.outbid',{lot,amt:b.amt|0,to:c?'glad':'house',char:c?strip(c):null})}
  /* why this lanista may not bid this week ('' when he may) */
  async function aucWhy(A,D,ch,key){if(!D)return 'Name your house first.';if(D.test||(A&&A.dtest))return 'Test houses may not bid.';if(!ch||C.rankIdx(C.rankFor(ch).k)<C.rankIdx('veteranus'))return 'Flavius sells to Veteranus and above.';
    if(await store.get('AUCWIN#'+key,'D#'+D.id))return 'Your house already won a lot this week.';return ''}
  /* ☀ Today: the house names beside the gladiators (one read per house, cached with the day) */
  async function dnFill(out){const names={};const fill=async e=>{if(!e||!e.dom||e.dn)return;if(!(e.dom in names)){const D=await domusGet(e.dom).catch(()=>null);names[e.dom]=D?D.name:null}if(names[e.dom])e.dn=names[e.dom]};
    try{for(const k of ['wins','fallen'])for(const e of out[k]||[])await fill(e);for(const e of out.acta||[])await fill(e&&e.w)}catch(e){}return out}
  Object.assign(R,{
    /* 🔌 take back a seat a CPU took (within the window): one server input that every client applies at the next settled human decision */
    'match.reclaim':async(d,ctx)=>{const M=await meta(d.id);const W=reclaimWin(M,ctx.acct);if(!W)throw fail('reclaim_no','There is no seat of yours to take back.');
      if(now()>W.until)throw fail('reclaim_late','Too late — the CPU has fought on in your seat. You may watch.',{until:W.until});
      const L=await getLobby(d.id);const pl=L.players.find(p=>p.id===ctx.acct);const ch=pl&&await charById(pl.char);if(!ch||!ch.alive)throw fail('reclaim_no','Your gladiator is gone.');
      if(!(await store.putNew('MATCH#'+d.id,W.lock,{k:'reclaim',acct:ctx.acct,at:now(),ttl:ttl(2)})))throw fail('reclaim_late','Too late — the CPU has begun your next turn. You may watch.',{until:W.until});
      const B=await store.bump('MATCH#'+d.id,'META','n');const inp={k:'reclaim',seat:W.seat,acct:ctx.acct,from:'server',seq:B.seq};
      await store.put('MATCH#'+d.id,'IN#'+String(B.seq).padStart(8,'0'),{in:inp,ttl:ttl(2)});const M2=B.item;
      if((M2.dropped||{})[ctx.acct])await store.setIn('MATCH#'+d.id,'META','dropped',ctx.acct,null);if((M2.abandoned||{})[ctx.acct])await store.setIn('MATCH#'+d.id,'META','abandoned',ctx.acct,null);
      await metaIn(d.id,M2,'dropAt84',ctx.acct,0);await metaIn(d.id,M2,'conns',ctx.acct,ctx.conn||null);await metaIn(d.id,M2,'away',ctx.acct,0);if((M2.watch||{})[ctx.acct]!==undefined)await store.setIn('MATCH#'+d.id,'META','watch',ctx.acct,null);
      await store.set('ACCT#'+ctx.acct,'PROFILE',{match:d.id,rcl84:null});
      await toMatch({...M2,conns:{...(M2.conns||{}),[ctx.acct]:ctx.conn||null}},'match.input',{id:d.id,in:inp});return {seq:B.seq,seat:W.seat}},
    /* the clients reached the seat's next CPU turn (a full rotation) and wait: unless the lanista already took it back, the window closes ('cpugo') */
    'match.cpuheld':async(d,ctx)=>{const M=await meta(d.id);const live=(M.players||[]).filter(a=>!(M.dropped||{})[a]&&!(M.abandoned||{})[a]);if(!live.includes(ctx.acct))throw new Error('Not your match.');
      const seat=d.seat|0;const who=Object.keys(M.seats||{}).find(a=>M.seats[a]===seat);if(!who||who===ctx.acct)throw new Error('No one to name.');
      const W=reclaimWin(M,who);if(!W)return {held:false};if(!(await store.putNew('MATCH#'+d.id,W.lock,{k:'cpugo',at:now(),ttl:ttl(2)})))return {held:false};
      const B=await store.bump('MATCH#'+d.id,'META','n');const inp={k:'cpugo',seat,from:'server',seq:B.seq};await store.put('MATCH#'+d.id,'IN#'+String(B.seq).padStart(8,'0'),{in:inp,ttl:ttl(2)});
      await store.set('ACCT#'+who,'PROFILE',{rcl84:null});await toMatch(B.item,'match.input',{id:d.id,in:inp});return {held:true,seq:B.seq}},
    /* 🔨 the auction: this week's lots (and last week's results); guests read too */
    'auction.list':async(d,ctx)=>{await aucSweep();const t=now();const S=C.seasonAt(t);const me=ctx.acct||null;const prevK=S.n>0?C.seasonKeyOf(S.n-1):null;
      const cur=await store.query(aucPK(S.key),'L#');const past=prevK?await store.query(aucPK(prevK),'L#'):[];
      const lots=cur.concat(past.filter(x=>!x.done)).map(x=>lotOut(x,me));const mine={lead:null,won:null,why:''};
      if(me){const A=await acctOf(me);const D=await domusGet(A&&A.domus);const ch=await liveChar(me,A);mine.why=await aucWhy(A,D,ch,S.key);mine.lead=(lots.find(l=>l.mine&&!l.done)||{}).id||null;
        const W=D&&await store.get('AUCWIN#'+S.key,'D#'+D.id);mine.won=W?W.lot:null}else mine.why='Sign in to bid.';
      return {week:{key:S.key,season:S.season,wk:S.wk,ends:S.end},lots,past:past.filter(x=>x.done).map(x=>lotOut(x,me)),mine,now:t}},
    /* a bid: coin into escrow from the active gladiator; the previous leader is refunded at once; the last 5 minutes extend */
    'auction.bid':async(d,ctx)=>{await aucSweep(true);const A=await acctOf(ctx.acct);const D=await domusGet(A&&A.domus);if(!D)throw fail('need_domus','Name your house first.');
      if(D.test||A.dtest)throw fail('testHouse','Test houses may not bid at Flavius’s auction.');
      const m=/^(S\d+W\d+)#(\d+)$/.exec(String(d.lot||''));if(!m)throw fail('auc_closed','No such lot.');const key=m[1],n=m[2]|0;const amt=d.amt|0;
      const X=await store.get(aucPK(key),'L#'+rk(n));if(!X||X.done||now()>X.ends)throw fail('auc_closed','The hammer has fallen on that lot.');
      const ch=await liveChar(ctx.acct,A);if(!ch||C.rankIdx(C.rankFor(ch).k)<C.rankIdx('veteranus'))throw fail('auc_rank','Flavius sells to Veteranus and above.');
      if(await store.get('AUCWIN#'+key,'D#'+D.id))throw fail('auc_won','Your house already won a lot this week.');
      const lead=(await store.query(aucPK(key),'L#')).find(L=>!L.done&&L.bid&&L.bid.dom===D.id&&L.id!==X.id);if(lead)throw fail('auc_lead','Your house already leads another lot — one win a house a week.',{lot:lead.id});
      if(X.bid&&X.bid.dom===D.id)throw fail('auc_lead','Your house leads this lot already.',{lot:X.id});
      const why=C.aucBidWhy(X,amt,now());if(why)throw fail('auc_low',why,{min:C.aucNextMin(X)});
      /* escrow first (versioned), then the lot (versioned); a lost race gives the coin straight back */
      if(!(await editChar(ch.id,c=>{if(!c.alive||(c.wallet|0)<amt)return false;c.wallet-=amt})))throw fail('no_coin',`${ch.name}’s purse holds less than ${amt} coin.`,{cost:amt});
      const bid={acct:ctx.acct,char:ch.id,dom:D.id,dname:D.name,name:ch.name,amt,at:now()};let Y=null,prev=null,err=null;
      for(let i=0;i<6&&!Y;i++){const Z=await store.get(aucPK(key),'L#'+rk(n));const w=C.aucBidWhy(Z,amt,now());if(w){err=fail(Z&&!Z.done?'auc_low':'auc_closed',w,{min:C.aucNextMin(Z)});break}
        if(Z.bid&&Z.bid.dom===D.id){err=fail('auc_lead','Your house leads this lot already.',{lot:Z.id});break}
        const p0=Z.bid;Z.bid=bid;Z.bids=[...(Z.bids||[]),{name:bid.name,dname:bid.dname,amt,at:bid.at,dom:D.id}].slice(-12);C.aucSnipe(Z,now());
        if((await store.putRev(aucPK(key),'L#'+rk(n),Z))!==false){Y=Z;prev=p0}}
      if(!Y){await editChar(ch.id,c=>{c.wallet=(c.wallet|0)+amt});throw err||new Error('The lot is busy — try again.')}
      if(prev)await aucRefund(prev,Y.id);return {lot:lotOut(Y,ctx.acct),char:strip(await charById(ch.id))}}});
  /* hello: this week's fixture + the house's challenge, an open reclaim window, the auction's sweep */
  {const base=R['hello'];R['hello']=async(d,ctx)=>{await aucSweep();const o=await base(d,ctx);const t=now();o.season84=C.onlineFixture(t);
    if(ctx.acct&&o.me){const A=await acctOf(ctx.acct);const D=await domusGet(A&&A.domus);if(D)o.week84=C.weekState(D,t);
      const X=A&&A.rcl84;if(X&&X.until>t){const M=await store.get('MATCH#'+X.id,'META');const W=M&&reclaimWin(M,ctx.acct);if(W&&await reclaimOpen(X.id,W)){const L=await store.get('LOBBY#'+X.id,'LOBBY');o.reclaim84={id:X.id,seat:W.seat,until:W.until,ev:L&&L.ev,loc:L&&L.loc,ranked:!!(L&&L.ranked)};if(o.live&&o.live.id===X.id)o.live.reclaim={seat:W.seat,until:W.until}}}}
    return o}}
  {const base=R['market.list'];R['market.list']=async(d,ctx)=>{await aucSweep();return base(d,ctx)}}
  {const base=R['world.news'];R['world.news']=async(d,ctx)=>({...(await base(d,ctx)),season84:C.onlineFixture(now())})}

  /* ══════════ v0.89 THE DOMUS REBUILD (part H — contract tools/plans/onl89-domus.md) ══════════
     New routes: char.class · domus.dress · gear.home · char.kits · char.kitapply · domus.upgrade · domus.look. Wrapped: char.create (the house's
     gladMax), domus.get (+ memo), domus.buy / gear.repair (the treasury LEDGER; gifts and shelf sales: ONLC.applyGiftHouse / offersIn), admin.grant (REPLACED: coin → the treasury, gear and
     offerings → the house shelf), domusAfter (the cut by gladiator + the MEMORIAL on a death), aucRefund (a refund into the treasury).
     Everything here is additive; the only edited line outside this block is offer.move's shelf cap (C.shelfMax). */
  for(const t of ['char.class','domus.dress','gear.home','char.kits','char.kitapply','domus.upgrade','domus.look'])NEED_DOMUS.add(t);
  const ledger89=async(did,k,amt,ch)=>{if(!did||!amt)return null;try{return await editDomus(did,D=>{C.ledAdd(D,k,amt,ch,now())})}catch(e){return null}};
  const myHouse89=async acct=>{const A=await acctOf(acct);const D=await domusGet(A&&A.domus);if(!D)throw fail('need_domus','Name your house first.');return {A,D}};
  const shelfOut89=D=>({house:true,gear:(D&&D.gear)||[],pcs:(D&&D.pcs)||{},offers:(D&&D.offers)||[]});
  /* the cut by gladiator and the memorial (one more edit of the house after domusAfter's) */
  {const base=domusAfter;domusAfter=async function(ch,row,out,ranked,m,gx){await base.apply(this,arguments);
    try{if(!ch||!ch.domus||!out||!(out.cut||out.died))return;let kn=null;
      if(out.died&&row&&row.kb==='g'&&(row.ks|0)>=0&&m&&m.id){const L=await store.get('LOBBY#'+m.id,'LOBBY');const p=L&&(L.players||[])[row.ks|0];kn=p&&p.char!==ch.id?p.name:null}
      await editDomus(ch.domus,D=>{if(out.cut)C.ledAdd(D,'cut',out.cut,ch,now());if(out.died)C.memoAdd(D,C.memoEntry(ch,m,C.memoBy(row,out,kn),now()))})}catch(e){}}}
  /* an outbid leader who has fallen since: his coin goes into the treasury — a ledger refund */
  {const base=aucRefund;aucRefund=async function(b,lot){let toT=false;try{if(b&&(b.amt|0)){const c=b.char?await charById(b.char):null;toT=!(c&&c.alive)}}catch(e){}
    await base.apply(this,arguments);if(toT&&b&&b.dom)await ledger89(b.dom,'refund',b.amt|0,null)}}
  /* a gladiator wears what the Domus gives him; the pieces he no longer wears go onto the shelf */
  async function dress89(acct,D,ch,equip,take){const list=await lobbies();if(!ch||!ch.alive)throw new Error('Not yours.');
    if(charBusy(ch.id,list))throw fail('in_match',`${ch.name} is in a match — the storeroom waits.`);
    const T0=[];const srcs={};
    for(const t of (Array.isArray(take)?take:[]).slice(0,8)){const item=String((t&&t.item)||''),from=String((t&&t.from)||'');if(!item||from===ch.id)continue;let I=null;
      if(from==='house'){if(!(D.gear||[]).includes(item))throw new Error('That piece is not there.');I=C.pieceOf(D,item,catalog)}
      else{const sc=await charById(from);if(!sc||sc.owner!==acct||sc.domus!==D.id||!sc.alive)throw new Error('Not of your house.');if(charBusy(sc.id,list))throw fail('in_match',`${sc.name} is in a match — the storeroom waits.`);
        if(!(sc.gear||[]).includes(item))throw new Error('That piece is not there.');I=C.pieceOf(sc,item,catalog);srcs[sc.id]=1}
      const why=C.takeWhy(ch,I);if(why)throw new Error(why);T0.push({item,from})}
    /* take them out first (versioned), then dress him; a failure puts everything back */
    const got=[];const back=async()=>{for(const g of got){if(g.from==='house')await editDomus(D.id,Y=>{C.putPiece(Y,g.P,false)});else await editChar(g.from,c=>{C.putPiece(c,g.P,false)})}};
    for(const t of T0){let P=null;const ok=t.from==='house'?await editDomus(D.id,Y=>{P=C.takePiece(Y,t.item);if(!P)return false}):await editChar(t.from,c=>{if(!c.alive||!(c.gear||[]).includes(t.item))return false;P=C.takePiece(c,t.item)});
      if(!ok||!P){await back();throw new Error('That piece moved a moment ago — try again.')}got.push({from:t.from,P})}
    let off=[];const c=await editChar(ch.id,x=>{if(!x.alive||x.owner!==acct)return false;off=C.dressApply(x,equip,got.map(g=>g.P),catalog).off});
    if(!c){await back();throw new Error('Your gladiator changed a moment ago — try again.')}
    let D2=D;if(off.length)D2=(await editDomus(D.id,Y=>{for(const P of off)C.putPiece(Y,P,false)}))||D;else D2=await domusGet(D.id);
    const from=[];for(const id of Object.keys(srcs)){const s=await charById(id);if(s)from.push(strip(s))}
    return {char:strip(c),domus:C.domusRow(D2),gear:D2.gear||[],pcs:D2.pcs||{},from}}
  /* a loadout's pieces, found again: held → worn, on the shelf → taken back, elsewhere → skipped (with why) */
  async function kitPlan89(acct,D,ch,K){const equip=[],take=[],skipped=[];const mine=(ch.gear||[]).slice(),shelf=(D.gear||[]).slice();
    const others=(await store.byIndex('OWNER#'+acct)).filter(c=>c.alive&&c.id!==ch.id&&c.domus===D.id);
    const nm=it=>((C.pieceOf(ch,it,catalog)||C.pieceOf(D,it,catalog)||{}).n)||((catalog[C.itemBase(it)]||{}).n)||C.itemBase(it);
    const use=(h,it,src)=>{const I=C.pieceOf(h,it,catalog);if(!I)return 'gone';if(I.st==='broken')return 'broken';if(I.named&&!C.canWearNamed(ch))return 'veteranus';
      if(src==='mine'){mine.splice(mine.indexOf(it),1);equip.push(it)}else{shelf.splice(shelf.indexOf(it),1);take.push({item:it,from:'house'});equip.push(it)}return ''};
    for(const it of K.items||[]){let why='';
      if(mine.includes(it))why=use(ch,it,'mine');else if(shelf.includes(it))why=use(D,it,'house');
      else{const o=others.find(c=>(c.gear||[]).includes(it));if(o)why='with:'+o.name;
        else if(!C.isNamed(it)){const b=C.itemBase(it);const m2=mine.find(x=>C.itemBase(x)===b),s2=shelf.find(x=>C.itemBase(x)===b);why=m2?use(ch,m2,'mine'):s2?use(D,s2,'house'):'gone'}else why='gone'}
      if(why)skipped.push({item:it,n:nm(it),why})}
    return {equip,take,skipped}}
  Object.assign(R,{
    /* 🔄 a new class: 100 coin from the house treasury, never while in a room or a match; his gear stays his */
    'char.class':async(d,ctx)=>{const {A,D}=await myHouse89(ctx.acct);const ch=await ownChar(ctx.acct,d.char);if(ch.domus!==D.id)throw new Error('Not of your house.');
      if(await busyIn(ctx.acct)||await stillFighting(A))throw fail('in_match','Finish or leave your game first.');const cls=String(d.cls||'');
      const why=C.classWhy(ch,cls,D);if(why)throw (/treasury/.test(why)?fail('no_coin',why,{cost:C.CLASS_FEE89}):new Error(why));
      const X=await editDomus(D.id,Y=>{if((Y.treasury|0)<C.CLASS_FEE89)return false;Y.treasury-=C.CLASS_FEE89;C.ledAdd(Y,'class',C.CLASS_FEE89,ch,now())});if(!X)throw fail('no_coin',`The treasury needs ${C.CLASS_FEE89} coin.`,{cost:C.CLASS_FEE89});
      const c=await editChar(ch.id,x=>{if(!x.alive)return false;x.cls=cls});
      if(!c){const Y=await editDomus(D.id,Z=>{Z.treasury=(Z.treasury|0)+C.CLASS_FEE89;if(Z.led89&&Z.led89.out)Z.led89.out.class=Math.max(0,(Z.led89.out.class|0)-C.CLASS_FEE89)});throw new Error('Try again.')}
      return {char:strip(c),domus:C.domusRow(await domusGet(D.id))}},
    /* 🛡 dress a gladiator from the Domus (a click or a drag): the pieces to take, the list he wears */
    'domus.dress':async(d,ctx)=>{const {D}=await myHouse89(ctx.acct);const ch=await ownChar(ctx.acct,d.char);if(ch.domus!==D.id)throw new Error('Not of your house.');
      return await dress89(ctx.acct,D,ch,d.equip,d.take)},
    /* 🔒 keep a piece home: never brought into a Ranked match */
    'gear.home':async(d,ctx)=>{const {D}=await myHouse89(ctx.acct);const item=String(d.item||'');const on=d.on!==false;let id=null;
      if(d.holder==='house'){const X=await editDomus(D.id,Y=>{if(!(Y.gear||[]).includes(item))return false;id=C.homeSet(Y,item,on)});if(!X)throw new Error('That piece is not there.');return {item:id,holder:shelfOut89(X)}}
      const ch=await ownChar(ctx.acct,d.holder);if(ch.domus!==D.id)throw new Error('Not of your house.');if(charBusy(ch.id,await lobbies()))throw fail('in_match',`${ch.name} is in a match — the storeroom waits.`);
      const c=await editChar(ch.id,x=>{if(!(x.gear||[]).includes(item))return false;id=C.homeSet(x,item,on)});if(!c)throw new Error('That piece is not there.');return {item:id,holder:strip(c)}},
    /* 💾 his saved loadouts (≤3, only pieces he holds) */
    'char.kits':async(d,ctx)=>{const ch=await ownChar(ctx.acct,d.char);const c=await editChar(ch.id,x=>{x.kits89=C.cleanKits(x,d.kits)});return {char:strip(c)}},
    /* ▶ wear a saved loadout (pieces that moved, broke or were lost are skipped, each with why) */
    'char.kitapply':async(d,ctx)=>{const {D}=await myHouse89(ctx.acct);const ch=await ownChar(ctx.acct,d.char);if(ch.domus!==D.id)throw new Error('Not of your house.');
      const K=(ch.kits89||[])[d.i|0];if(!K)throw new Error('No such loadout.');const P=await kitPlan89(ctx.acct,D,ch,K);const r=await dress89(ctx.acct,D,ch,P.equip,P.take);
      return {...r,skipped:P.skipped,kit:K.n}},
    /* 🏗 treasury upgrades: a 5th gladiator slot, a bigger offerings shelf (once each) */
    'domus.upgrade':async(d,ctx)=>{const {D}=await myHouse89(ctx.acct);const k=String(d.k||'');const why=C.upgWhy(D,k);if(why)throw (/treasury/.test(why)?fail('no_coin',why,{cost:(C.UPG89[k]||{}).cost}):new Error(why));
      let err=null;const X=await editDomus(D.id,Y=>{err=C.upgWhy(Y,k);if(err)return false;C.upgBuy(Y,k,now())});if(!X)throw new Error(err||'Try again.');return {domus:C.domusRow(X)}},
    /* 🎨 the house colours + crest (a printed banner device) */
    'domus.look':async(d,ctx)=>{const {D}=await myHouse89(ctx.acct);const L=C.cleanLook89(d);const X=await editDomus(D.id,Y=>{Y.look89=L});if(!X)throw new Error('Try again.');return {domus:C.domusRow(X)}}});
  /* the house's gladiator cap (4, or 5 with the upgrade) */
  R['char.create']=async(d,ctx)=>{const live=(await store.byIndex('OWNER#'+ctx.acct)).filter(c=>c.alive);const A=await acctOf(ctx.acct);const D=await domusGet(A&&A.domus);const max=C.gladMax(D);
    if(live.length>=max)throw new Error(`Up to ${max} living gladiators.`);const ch=C.newChar(d,ctx.acct,id('g'),now());
    ch.domus=A&&A.domus||null;if(A&&A.dtest)ch.test=true;if(A&&!live.some(c=>c.id===A.active))await store.set('ACCT#'+A.id,'PROFILE',{active:ch.id});await putChar(ch);
    await editDomus(ch.domus,X=>{X.glads=(X.glads|0)+1});await countRank(C.rankFor(ch).k,1,ch);return strip(ch)};
  {const base=R['domus.get'];R['domus.get']=async(d,ctx)=>{const o=await base(d,ctx);try{const A=await acctOf(ctx.acct);const D=await domusGet(A&&A.domus);o.memo=(D&&D.memo89)||[]}catch(e){o.memo=[]}return o}}
  /* the ledger: the treasury buying for the shelf, a repair the treasury paid (a house gift opened into the treasury: C.applyGiftHouse) */
  {const base=R['domus.buy'];R['domus.buy']=async(d,ctx)=>{const r=await base(d,ctx);try{const X=await ledger89(r.domus&&r.domus.id,'gear',C.priceOf(catalog[d.item]),null);if(X)r.domus=C.domusRow(X)}catch(e){}return r}}
  {const base=R['gear.repair'];R['gear.repair']=async(d,ctx)=>{const r=await base(d,ctx);try{const byT=d.pay==='treasury'||(d.pay==null&&d.holder==='house');
      if(byT){const X=await ledger89(r.domus&&r.domus.id,'repair',r.cost|0,null);if(X)r.domus=C.domusRow(X)}}catch(e){}return r}}
  /* 🧪 tester grants (his fix C): coin → the house TREASURY, gear → the house shelf (unequipped), offerings → the shelf; gifts → the house;
     Glory → the active gladiator. Same caps, same log, same TEST-house flags as v0.83. */
  R['admin.grant']=async(d,ctx)=>{if(!ctx.tester)throw fail('notTester','Only testers may do that.');const {A,D}=await myHouse89(ctx.acct);
    const ch=await liveChar(ctx.acct,A);if(ch&&charBusy(ch.id,await lobbies()))throw fail('in_match',`${ch.name} is in a match — grant afterwards.`);
    const coin=Math.max(0,Math.min(100000,d.coin|0)),gifts=Math.max(0,Math.min(10,d.gift|0)),glory=Math.max(0,Math.min(10000,+d.glory||0));
    const gear=(Array.isArray(d.gear)?d.gear:[]).map(String).filter(k=>catalog[k]).slice(0,10),offs=(Array.isArray(d.offering)?d.offering:[]).map(String).filter(k=>C.OFFERS83.includes(k)).slice(0,10);
    if(!coin&&!gifts&&!glory&&!gear.length&&!offs.length)throw new Error('Nothing to grant.');const what={coin,gift:gifts,glory,gear,offering:offs};const t=now();
    const live=(await store.byIndex('OWNER#'+ctx.acct)).filter(c=>c.alive&&c.domus===D.id);if(!D.test)for(const c of live)await countRank(C.rankFor(c).k,-1);
    let c2=null;if(ch)c2=await editChar(ch.id,x=>{x.test=true;if(glory){x.glory=Math.round(((C.gloryOf(x)||0)+glory)*100)/100;const Rk=C.rankFor(x);x.rank=Rk.k;if(C.rankIdx(Rk.k)>C.rankIdx(x.rankK||'tiro'))x.rankK=Rk.k}});
    for(const c of live)if(!c2||c.id!==c2.id)await editChar(c.id,x=>{x.test=true});
    const X=await editDomus(D.id,Y=>{Y.test=true;if(coin){Y.treasury=(Y.treasury|0)+coin;C.ledAdd(Y,'grant',coin,null,t)}
      for(let i=0;i<gifts;i++)C.giftsIn(Y,[{id:'test:'+t.toString(36)+':'+i,why:'test',at:t,glad:c2?c2.name:null}]);for(const k of gear)C.putPiece(Y,{item:k,pc:null},false);if(offs.length)C.offersIn(Y,offs)});
    await store.set('ACCT#'+ctx.acct,'PROFILE',{dtest:true});
    const LG=(await store.get('ADMIN','log'))||{list:[]};LG.list=[{at:t,acct:ctx.acct,domus:D.id,glad:c2?c2.id:null,what},...(LG.list||[])].slice(0,500);await store.put('ADMIN','log',LG);
    return {domus:C.domusRow(X),char:c2?strip(c2):null,gifts:(X&&X.gifts)||[],gear:(X&&X.gear)||[],pcs:(X&&X.pcs)||{},offers:(X&&X.offers)||[]}};
  /* ══════════ end of v0.89 THE DOMUS REBUILD ══════════ */
  return async function route(t,d,ctx){const f=R[t];if(!f)throw new Error('Unknown request: '+t);
    /* v0.82 guests look, never act — for 2 hours from their first connect */
    if(!ctx.acct&&ctx.guest){if(now()-(ctx.guest.first||0)>C.GUEST_MS)throw fail('guest_expired','Your two hours as a guest are up — sign in to keep watching.');
      if(!C.GUEST_OK.includes(t))throw fail('guest',`Sign in to ${GUEST_WHY[t]||'play'}.`);return f(d||{},ctx)}
    if(!ctx.acct&&t!=='hello'&&t!=='auth.guest')throw new Error('Sign in first.');
    /* v0.82 no house, no gladiators, rooms, buys or words */
    if(NEED_DOMUS.has(t)){const A=await acctOf(ctx.acct);if(A&&!A.domus)throw fail('need_domus','Name your house first — every lanista needs a Domus.')}
    /* 🧪 test houses play Custom only (the caller and their party) */
    if(TEST_GATE.has(t)&&d){let ranked=false;if(t==='lobby.create'||t==='lobby.quick')ranked=!!d.ranked;else{const id=t==='lobby.again'?(d.id||d.lobbyId):d.id;const L=id?await store.get('LOBBY#'+id,'LOBBY'):null;ranked=!!(L&&L.ranked)}
      if(ranked){const A=await acctOf(ctx.acct);let test=!!(A&&A.dtest);if(!test&&A&&A.party){const P=await store.get('PARTY#'+A.party,'PARTY');for(const m of (P&&P.members)||[]){const B=await acctOf(m);if(B&&B.dtest)test=true}}
        if(test)throw fail('testHouse','Test houses play Custom only.')}}
    return f(d||{},ctx)}}
const TEST_GATE=new Set(['lobby.create','lobby.quick','lobby.join','lobby.accept','lobby.sit','lobby.again']);
/* a player reconnects mid-match: their new connection goes into the match record */
async function reconnect(store,acct,conn){const A=await store.get('ACCT#'+acct,'PROFILE');if(A&&A.match){await store.setIn('MATCH#'+A.match,'META','conns',acct,conn);await store.setIn('MATCH#'+A.match,'META','away',acct,0)}}
async function away(store,acct,t){const A=await store.get('ACCT#'+acct,'PROFILE');if(A&&A.match)await store.setIn('MATCH#'+A.match,'META','away',acct,t)}
/* presence on: the account's socket + the 'ON' index entry (GSI1SK = connect time) */
async function online(store,acct,conn,t){const a=await store.get('ACCT#'+acct,'PROFILE');if(!a)return null;a.conn=conn;a.GSI1PK='ON';a.GSI1SK=t;await store.put('ACCT#'+acct,'PROFILE',a);await reconnect(store,acct,conn);return a}
module.exports={makeRoutes,reconnect,away,online,fail};
