/* The online arena's requests — the same names and answers as the game's mock server (src/112-online.js MOCK_ROUTES).
   route(t, d, ctx) → answer (throws Error with a player-facing message). ctx = {acct, conn}.
   push(acctId, type, data) sends to that account's open connection. */
'use strict';
const C=require('./onlcore.js');
const DAY=86400;
function makeRoutes({store,push,pushConn=null,catalog,now=()=>Date.now(),rnd=()=>Math.random(),dev=false}){
  const ttl=days=>Math.floor(now()/1000)+days*DAY;
  const acctOf=async id=>id?await store.get('ACCT#'+id,'PROFILE'):null;
  const liveChar=async acct=>(await store.byIndex('OWNER#'+acct)).find(c=>c.alive)||null;
  const getLobby=async id=>{const L=await store.get('LOBBY#'+id,'LOBBY');if(!L)throw new Error('That game is gone.');return L};
  const putLobby=L=>store.put('LOBBY#'+L.id,'LOBBY',{...L,GSI1PK:L.status==='done'?'LOBBIES_DONE':'LOBBIES',GSI1SK:L.created,ttl:ttl(2)});
  const putChar=ch=>store.put('CHAR#'+ch.id,'CHAR',{...ch,GSI1PK:'OWNER#'+ch.owner,GSI1SK:ch.born});
  const strip=x=>{if(!x)return x;const y={...x};for(const k of ['PK','SK','GSI1PK','GSI1SK','ttl'])delete y[k];return y};
  const id=p=>p+now().toString(36)+Math.floor(rnd()*1e6).toString(36);
  /* a live match keeps its players' connections in its META record: pushes need no account reads */
  const toMatch=async(M,type,data,except)=>{for(const [a,c] of Object.entries(M.conns||{}))if(a!==except){if(c&&pushConn)await pushConn(c,type,data);else await push(a,type,data)}};
  const meta=async id=>{const M=await store.get('MATCH#'+id,'META');if(!M)throw new Error('No such match.');return M};
  const liveOrLast=async acct=>(await liveChar(acct))||(await store.byIndex('OWNER#'+acct))[0]||null;
  async function settleMatch(id,M,me){const L=await getLobby(id);const A=C.agree(M.reports);M.status='done';M.agreed=A;M.outs={};
    for(const a of A.minority){const P=await acctOf(a);if(P){P.strikes=(P.strikes||0)+1;await store.put('ACCT#'+a,'PROFILE',P)}}
    if(!A.void)for(const a of M.players){const ch=await liveChar(a);const row=A.table.find(r=>r.seat===M.seats[a]);if(!ch||!row)continue;const out=C.applyResult(ch,row,!!L.ranked);M.outs[a]=out;await putChar(ch);
      if(out.died){const e={name:ch.name,cls:ch.cls,rank:ch.died.rank,lifeCF:ch.lifeCF,survived:ch.survived,diedAt:now(),why:out.hall?C.hallWhy(ch):''};
        if(out.hall){const H=await world('HALL');H.list=[e,...H.list].slice(0,200);await store.put('WORLD','HALL',H)}await news(out.hall?['🪦',`${ch.name} fell. The Hall of the Fallen keeps the name.`]:['🌫',`${ch.name} fell and is forgotten.`])}
      if(out.rankUp)await news(['⚔',`${ch.name} is now ${C.RANKS[C.rankIdx(out.rankUp)].n}.`])}
    if((L.bets||[]).length){const wins=A.void?[]:A.table.filter(r=>r.won).map(r=>r.seat);const st=C.settle(L.bets,wins);
      for(const [by,v] of Object.entries(st.payouts)){const c=await liveChar(by);if(c){c.wallet+=v;await putChar(c)}}const hc=await liveChar(L.host.id);if(hc&&st.cut){hc.wallet+=st.cut;await putChar(hc)}L.settled=st}
    L.status='done';await putLobby(L);await store.put('MATCH#'+id,'META',M);
    for(const a of M.players){const c=await liveOrLast(a);const msg={id,void:!!A.void,out:M.outs[a]||null,char:strip(c)};if(a!==me)await push(a,'match.settled',msg)}
    await toLobby(L,'lobby.update',{id});return {char:strip(await liveOrLast(me)),out:M.outs[me]||null,void:!!A.void}}
  const toLobby=async(L,type,data)=>{for(const p of L.players)if(!/^bot/.test(p.id))await push(p.id,type,data)};
  const world=async k=>(await store.get('WORLD',k))||{list:[]};
  const news=async line=>{const N=await world('NEWS');N.list=[line,...N.list].slice(0,12);await store.put('WORLD','NEWS',N)};
  const R={
    /* one request when the Online window opens: who you are, your gladiators, the lobbies and the news */
    'hello':async(d,ctx)=>{const me=strip(await acctOf(ctx.acct));const out={ver:C.VER,mode:'aws',me};if(d.all&&me){out.chars=(await store.byIndex('OWNER#'+ctx.acct)).map(strip);const f=(me.strikes||0)>=C.STRIKES_OUT;out.lobbies=(await store.byIndex('LOBBIES')).filter(L=>!!L.flag===f).map(strip).slice(0,100);
      out.news=(await world('NEWS')).list.slice(0,8);out.challenges=C.weekChallenges(now())}return out},
    'auth.signin':async(d,ctx)=>{if(!dev)throw new Error('Sign in with Google.');const name=C.cleanName(d.name);if(name.length<2)throw new Error('Your name: 2–24 letters.');
      const a={id:ctx.acct,name,since:now()};await store.put('ACCT#'+a.id,'PROFILE',a);return a},
    'auth.signout':async()=>({}),
    'char.mine':async(d,ctx)=>(await store.byIndex('OWNER#'+ctx.acct)).map(strip),
    'char.create':async(d,ctx)=>{if(await liveChar(ctx.acct))throw new Error('One living gladiator at a time.');const ch=C.newChar(d,ctx.acct,id('g'),now());await putChar(ch);return ch},
    'char.buy':async(d,ctx)=>{const ch=await store.get('CHAR#'+d.char,'CHAR');if(!ch||ch.owner!==ctx.acct)throw new Error('Not yours.');C.buy(ch,d.item,catalog);await putChar(ch);return strip(ch)},
    'lobby.list':async(d,ctx)=>{const me=await acctOf(ctx.acct);const f=!!(me&&(me.strikes||0)>=C.STRIKES_OUT);return (await store.byIndex('LOBBIES')).filter(L=>!!L.flag===f).map(strip).slice(0,100)},
    'lobby.create':async(d,ctx)=>{const a=await acctOf(ctx.acct);const ch=await liveChar(ctx.acct);if(d.ranked&&!ch)throw new Error('Ranked needs a living gladiator.');
      for(const L of await store.byIndex('LOBBIES'))if(L.status==='waiting'&&L.players.some(p=>p.id===ctx.acct))throw new Error('You are already in a lobby.');
      const L=C.newLobby(d,{id:ctx.acct,name:a.name,char:ch&&ch.id,rank:ch?C.rankFor(ch).k:'tiro',kit:C.kitOf(ch)},id('L'),now());L.flag=(a.strikes||0)>=C.STRIKES_OUT;await putLobby(L);return L},
    'lobby.join':async(d,ctx)=>{const L=await getLobby(d.id);const a=await acctOf(ctx.acct);const ch=await liveChar(ctx.acct);const who={id:ctx.acct,name:a.name,char:ch&&ch.id,rank:ch?C.rankFor(ch).k:'tiro'};
      if(!!L.flag!==((a.strikes||0)>=C.STRIKES_OUT))throw new Error('That game is gone.');const why=C.canJoin(L,who);if(why)throw new Error(why);if(!L.players.some(p=>p.id===ctx.acct))L.players.push({...who,kit:C.kitOf(ch),ready:false});await putLobby(L);await toLobby(L,'lobby.update',{id:L.id});return strip(L)},
    'lobby.leave':async(d,ctx)=>{const L=await store.get('LOBBY#'+d.id,'LOBBY');if(!L)return {};L.players=L.players.filter(p=>p.id!==ctx.acct);if(!L.players.length||L.host.id===ctx.acct)L.status='done';await putLobby(L);await toLobby(L,'lobby.update',{id:L.id});return strip(L)},
    'lobby.ready':async(d,ctx)=>{const L=await getLobby(d.id);const p=L.players.find(p=>p.id===ctx.acct);if(p)p.ready=!!d.ready;await putLobby(L);await toLobby(L,'lobby.update',{id:L.id});return strip(L)},
    'lobby.start':async(d,ctx)=>{const L=await getLobby(d.id);if(L.host.id!==ctx.acct)throw new Error('Only the host starts the game.');if(L.status!=='waiting')throw new Error('Already under way.');
      L.status='live';L.seed=Math.floor(rnd()*2**31)>>>0;L.started=now();await putLobby(L);const humans=L.players.filter(p=>!/^bot/.test(p.id)).map(p=>p.id);const conns={};
      for(const a of humans){const A=await acctOf(a);if(A){conns[a]=A.conn||null;A.match=L.id;await store.put('ACCT#'+a,'PROFILE',A)}}
      const seats={};L.players.forEach((p,i)=>{if(humans.includes(p.id))seats[p.id]=i});
      await store.put('MATCH#'+L.id,'META',{id:L.id,seed:L.seed,n:0,players:humans,seats,conns,away:{},dropped:{},reports:{},host:L.host.id,status:'live',ranked:!!L.ranked,ttl:ttl(2)});await toLobby(L,'lobby.update',{id:L.id});return strip(L)},
    'lobby.watch':async(d)=>{const L=await getLobby(d.id);L.watchers=(L.watchers||0)+1;await putLobby(L);return strip(L)},
    'lobby.ticket':async(d,ctx)=>{const L=await getLobby(d.id);const ch=await liveChar(ctx.acct);if(!ch)throw new Error('Tickets are paid from a gladiator’s wallet.');if((ch.wallet||0)<L.ticket)throw new Error(`A ticket costs ${L.ticket} coin.`);
      ch.wallet-=L.ticket;L.tickets=(L.tickets||0)+1;L.pot=(L.pot||0)+L.ticket;await putChar(ch);await putLobby(L);return {lobby:strip(L),char:strip(ch)}},
    'bet.place':async(d,ctx)=>{const L=await getLobby(d.id);const ch=await liveChar(ctx.acct);if(!ch)throw new Error('Wagers are paid from a living gladiator’s wallet.');
      const amt=d.amt|0,seat=d.seat|0;const why=C.betOK(L,ctx.acct,seat,amt,ch.wallet);if(why)throw new Error(why);ch.wallet-=amt;(L.bets=L.bets||[]).push({by:ctx.acct,char:ch.id,seat,amt});L.pool=(L.pool||0)+amt;
      await putChar(ch);await putLobby(L);return {lobby:strip(L),char:strip(ch)}},
    'match.open':async(d,ctx)=>{const M=await meta(d.id);if(M.host!==ctx.acct)throw new Error('Only the host opens the match.');
      if(typeof d.snap!=='object'||JSON.stringify(d.snap).length>300000)throw new Error('The opening is too large.');await store.put('MATCH#'+d.id,'OPEN',{snap:d.snap,ttl:ttl(2)});await toMatch(M,'match.open',{id:d.id},ctx.acct);return {}},
    'match.get':async(d)=>{const M=await meta(d.id);const O=await store.get('MATCH#'+d.id,'OPEN');const from=Math.max(0,d.from|0);
      const ins=(await store.query('MATCH#'+d.id,'IN#')).map(x=>x.in).filter(x=>x.seq>=from);return {open:O?O.snap:null,inputs:ins,seed:M.seed}},
    /* the hot path: ONE update (the seq + the match record) + ONE small put + a push to each OTHER player */
    'match.input':async(d,ctx)=>{const raw=d.in||{};if(JSON.stringify(raw).length>4000)throw new Error('That move is too large.');
      const B=await store.bump('MATCH#'+d.id,'META','n');if(!B)throw new Error('No such match.');const M=B.item;if(!(M.players||[]).includes(ctx.acct))throw new Error('Not your match.');if(M.status!=='live')throw new Error('The match is not live.');
      if((M.dropped||{})[ctx.acct])throw new Error('A CPU holds your seat now.');
      /* anti-cheat: a move may only speak for the sender's own seat (a burned seq is harmless: clients skip a server 'void') */
      if((raw.seat|0)!==(M.seats||{})[ctx.acct]||raw.k==='drop'){const v={k:'void',from:'server',seq:B.seq};await store.put('MATCH#'+d.id,'IN#'+String(B.seq).padStart(8,'0'),{in:v,ttl:ttl(2)});await toMatch(M,'match.input',{id:d.id,in:v});throw new Error('That seat is not yours.')}
      const inp={...raw,from:ctx.acct,seq:B.seq};await store.put('MATCH#'+d.id,'IN#'+String(B.seq).padStart(8,'0'),{in:inp,ttl:ttl(2)});
      await toMatch(M,'match.input',{id:d.id,in:inp},ctx.acct);return {seq:B.seq}},
    'match.snapreq':async(d,ctx)=>{const M=await meta(d.id);if(!(M.players||[]).includes(ctx.acct)||!(M.players||[]).includes(d.to))throw new Error('Not your match.');await toMatch({conns:{[d.to]:M.conns[d.to]}},'match.snapreq',{id:d.id,to:d.to,from:ctx.acct,seq:d.seq});return {}},
    'match.snap':async(d,ctx)=>{const M=await meta(d.id);if(!(M.players||[]).includes(ctx.acct)||!(M.players||[]).includes(d.to))throw new Error('Not your match.');await toMatch({conns:{[d.to]:M.conns[d.to]}},'match.snap',{id:d.id,to:d.to,snap:d.snap,seq:d.seq,from:ctx.acct});return {}},
    /* ANTI-CHEAT: each human reports the whole table; the match settles once every human still seated has reported */
    'match.result':async(d,ctx)=>{const M=await meta(d.id);if(!(M.players||[]).includes(ctx.acct))throw new Error('Not your match.');
      M.reports=M.reports||{};if(!M.reports[ctx.acct])M.reports[ctx.acct]={table:C.cleanTable(d.table),hash:String(d.hash||'').slice(0,20)};
      const need=M.players.filter(a=>!(M.dropped||{})[a]);
      if(M.status!=='done'&&need.every(a=>M.reports[a]))return await settleMatch(d.id,M,ctx.acct);
      await store.put('MATCH#'+d.id,'META',M);if(M.status==='done'&&M.outs&&M.outs[ctx.acct])return {char:strip(await liveOrLast(ctx.acct)),out:M.outs[ctx.acct]};return {pending:true}},
    /* a player away 3+ minutes: a CPU takes the seat at this point in the move order (everyone applies it at the same place) */
    'match.drop':async(d,ctx)=>{const M=await meta(d.id);if(!(M.players||[]).includes(ctx.acct))throw new Error('Not your match.');const who=Object.keys(M.seats||{}).find(a=>M.seats[a]===(d.seat|0));
      if(!who||who===ctx.acct)throw new Error('No one to drop.');if((M.dropped||{})[who])return {done:1};const at=(M.away||{})[who];if(!at||now()-at<C.AWAY_MS)throw new Error('Still here.');
      const B=await store.bump('MATCH#'+d.id,'META','n');const inp={k:'drop',seat:d.seat|0,from:'server',seq:B.seq};await store.put('MATCH#'+d.id,'IN#'+String(B.seq).padStart(8,'0'),{in:inp,ttl:ttl(2)});
      await store.setIn('MATCH#'+d.id,'META','dropped',who,true);await toMatch(B.item,'match.input',{id:d.id,in:inp});return {done:1}},
    'hall.list':async()=>(await world('HALL')).list.slice(0,60),
    'world.news':async()=>({news:(await world('NEWS')).list.slice(0,8),online:0,challenges:C.weekChallenges(now())})};
  return async function route(t,d,ctx){const f=R[t];if(!f)throw new Error('Unknown request: '+t);if(!ctx.acct&&t!=='hello')throw new Error('Sign in first.');return f(d||{},ctx)}}
/* a player reconnects mid-match: their new connection goes into the match record */
async function reconnect(store,acct,conn){const A=await store.get('ACCT#'+acct,'PROFILE');if(A&&A.match){await store.setIn('MATCH#'+A.match,'META','conns',acct,conn);await store.setIn('MATCH#'+A.match,'META','away',acct,0)}}
async function away(store,acct,t){const A=await store.get('ACCT#'+acct,'PROFILE');if(A&&A.match)await store.setIn('MATCH#'+A.match,'META','away',acct,t)}
module.exports={makeRoutes,reconnect,away};
