/* The online arena's requests — the same names and answers as the game's mock server (src/112-online.js MOCK_ROUTES).
   route(t, d, ctx) → answer (throws Error with a player-facing message). ctx = {acct, conn}.
   push(acctId, type, data) sends to that account's open connection. */
'use strict';
const C=require('./onlcore.js');
const DAY=86400;
function makeRoutes({store,push,pushConn=null,catalog,now=()=>Date.now(),rnd=()=>Math.random(),dev=false}){
  const ttl=days=>Math.floor(now()/1000)+days*DAY;
  const acctOf=async id=>id?await store.get('ACCT#'+id,'PROFILE'):null;
  /* the account's ACTIVE gladiator (v0.79: up to 3 living, one active) — the one that fights, bets and buys tickets */
  const liveChar=async acct=>{const all=(await store.byIndex('OWNER#'+acct)).filter(c=>c.alive);if(!all.length)return null;const A=await acctOf(acct);return all.find(c=>A&&c.id===A.active)||all[all.length-1]};
  const charById=async cid=>cid?await store.get('CHAR#'+cid,'CHAR'):null;
  /* the gladiator a lanista is fighting with right now (a waiting lobby or a live match): edits wait until it is over */
  async function busyIn(acct){for(const L of await store.byIndex('LOBBIES'))if((L.status==='waiting'||L.status==='live')&&L.players.some(p=>p.id===acct))return L;return null}
  const getLobby=async id=>{const L=await store.get('LOBBY#'+id,'LOBBY');if(!L)throw new Error('That game is gone.');return L};
  const putLobby=L=>store.put('LOBBY#'+L.id,'LOBBY',{...L,GSI1PK:L.status==='done'?'LOBBIES_DONE':'LOBBIES',GSI1SK:L.created,ttl:ttl(2)});
  const putChar=ch=>store.put('CHAR#'+ch.id,'CHAR',{...ch,GSI1PK:'OWNER#'+ch.owner,GSI1SK:ch.born});
  const strip=x=>{if(!x)return x;const y={...x};for(const k of ['PK','SK','GSI1PK','GSI1SK','ttl'])delete y[k];return y};
  const id=p=>p+now().toString(36)+Math.floor(rnd()*1e6).toString(36);
  /* a live match keeps its players' connections in its META record: pushes need no account reads */
  const toMatch=async(M,type,data,except)=>{for(const [a,c] of Object.entries(M.conns||{}))if(a!==except){if(c&&pushConn)await pushConn(c,type,data);else await push(a,type,data)}
    for(const [a,c] of Object.entries(M.watch||{}))if(a!==except&&c&&!(M.conns||{})[a]){if(pushConn)await pushConn(c,type,data);else await push(a,type,data)}};
  /* who may speak in a match: its fighters and its ticket holders (seats after the fighters); watchers only listen */
  const inMatch=(M,a)=>(M.players||[]).includes(a)||(M.specs||[]).includes(a);
  const connOf=(M,a)=>(M.conns||{})[a]||(M.watch||{})[a]||null;
  /* the lanista and, when they lead a party, everyone in it — as lobby seats */
  async function groupOf(acct){const a=await acctOf(acct);const P=a&&a.party?await store.get('PARTY#'+a.party,'PARTY'):null;
    if(P&&P.leader!==acct)throw new Error('Your party leader picks the game.');const ids=P?P.members:[acct];const out=[];
    for(const m of ids){const A=m===acct?a:await acctOf(m);if(!A)continue;const ch=await liveChar(m);out.push({id:m,name:A.name,char:ch&&ch.id,rank:ch?C.rankFor(ch).k:'tiro',kit:C.kitOf(ch),party:P?P.id:undefined,strikes:A.strikes||0})}
    for(const L of await store.byIndex('LOBBIES'))if(L.status==='waiting'&&L.players.some(p=>out.some(w=>w.id===p.id)))throw new Error(out.length>1?'Someone in your party is already in a lobby.':'You are already in a lobby.');
    return out}
  const toParty=async(P,type,data)=>{for(const m of P.members)await push(m,type,data)};
  const meta=async id=>{const M=await store.get('MATCH#'+id,'META');if(!M)throw new Error('No such match.');return M};
  const liveOrLast=async acct=>(await liveChar(acct))||(await store.byIndex('OWNER#'+acct))[0]||null;
  async function settleMatch(id,M,me){const L=await getLobby(id);L.stands=L.stands||[];const A=C.agree(M.reports);M.status='done';M.agreed=A;M.outs=M.outs||{};
    for(const a of A.minority){const P=await acctOf(a);if(P){P.strikes=(P.strikes||0)+1;await store.put('ACCT#'+a,'PROFILE',P)}}
    if(!A.void)for(const a of M.players){if((M.abandoned||{})[a])continue;const pl=L.players.find(p=>p.id===a);const ch=pl&&await charById(pl.char);if(ch&&!ch.alive)continue;const row=A.table.find(r=>r.seat===M.seats[a]);if(!ch||!row)continue;const out=C.applyResult(ch,row,!!L.ranked);M.outs[a]=out;await putChar(ch);
      if(out.died){const e={name:ch.name,cls:ch.cls,rank:ch.died.rank,lifeCF:ch.lifeCF,survived:ch.survived,diedAt:now(),why:out.hall?C.hallWhy(ch):''};
        if(out.hall){const H=await world('HALL');H.list=[e,...H.list].slice(0,200);await store.put('WORLD','HALL',H)}await news(out.hall?['🪦',`${ch.name} fell. The Hall of the Fallen keeps the name.`]:['🌫',`${ch.name} fell and is forgotten.`])}
      if(out.rankUp)await news(['⚔',`${ch.name} is now ${C.RANKS[C.rankIdx(out.rankUp)].n}.`])}
    if((L.bets||[]).length||L.pot){const wins=A.void?[]:A.table.filter(r=>r.won).map(r=>r.seat);const seatAcct={};L.players.forEach((p,i)=>{seatAcct[i]=p.id});
      const st=C.settle(L.bets||[],wins,{pot:L.pot|0,tix:L.stands.map(s=>({by:s.id,amt:s.paid|0})),seatAcct,void:!!A.void});
      for(const [by,v] of Object.entries(st.payouts)){const c=await liveChar(by);if(c){c.wallet+=v;await putChar(c)}}const hc=await liveChar(L.host.id);if(hc&&st.cut){hc.wallet+=st.cut;await putChar(hc)}L.settled=st}
    L.status='done';await putLobby(L);await store.put('MATCH#'+id,'META',M);
    for(const a of M.players){const pl=L.players.find(p=>p.id===a);const c=(pl&&await charById(pl.char))||await liveOrLast(a);const msg={id,void:!!A.void,out:M.outs[a]||null,char:strip(c)};if(a!==me)await push(a,'match.settled',msg)}
    for(const a of M.players){const P=await acctOf(a);if(P&&P.match===id){P.match=null;await store.put('ACCT#'+a,'PROFILE',P)}}
    await toLobby(L,'lobby.update',{id});const mp=L.players.find(p=>p.id===me);return {char:strip((mp&&await charById(mp.char))||await liveOrLast(me)),out:M.outs[me]||null,void:!!A.void}}
  /* a death outside the results table (an abandoned Ranked gladiator): the same Fate bookkeeping */
  async function fallen(ch,out){if(out.died){const e={name:ch.name,cls:ch.cls,rank:ch.died.rank,lifeCF:ch.lifeCF,survived:ch.survived,diedAt:now(),why:out.hall?C.hallWhy(ch):''};
    if(out.hall){const H=await world('HALL');H.list=[e,...H.list].slice(0,200);await store.put('WORLD','HALL',H)}await news(out.hall?['🪦',`${ch.name} fell. The Hall of the Fallen keeps the name.`]:['🌫',`${ch.name} abandoned the sand — Damnatio. Forgotten.`])}}
  /* shut a match nobody is playing any more: void (wagers and tickets back), the lobby leaves the list */
  async function closeMatch(id,why){const M=await store.get('MATCH#'+id,'META');const L=await store.get('LOBBY#'+id,'LOBBY');if(!L||L.status==='done')return;
    if(M&&M.status==='live'){M.status='done';M.closed=why;await store.put('MATCH#'+id,'META',M)}
    const st=C.settle(L.bets||[],[],{tix:(L.stands||[]).map(s=>({by:s.id,amt:s.paid|0})),void:true});for(const [by,v] of Object.entries(st.payouts)){const c=await liveChar(by);if(c){c.wallet+=v;await putChar(c)}}
    L.status='done';L.closed=why;L.bets=[];L.pool=0;L.pot=0;await putLobby(L);for(const p of L.players)if(!/^bot/.test(p.id)){const P=await acctOf(p.id);if(P&&P.match===id){P.match=null;await store.put('ACCT#'+p.id,'PROFILE',P)}}
    await toLobby(L,'lobby.update',{id,closed:why})}
  /* tidy the list: a waiting game whose host left 5+ minutes ago, a waiting game older than 3 hours, a live match with no human left
     (all abandoned or dropped) or nobody connected for 10 minutes */
  async function prune(list){const t=now();const out=[];for(const L of list){try{
      if(L.status==='waiting'){const H=await acctOf(L.host.id);if(t-(L.created||0)>3*3600e3||(H&&!H.conn&&H.offAt&&t-H.offAt>5*60e3)){await closeMatch(L.id,'host gone');continue}}
      if(L.status==='live'){const M=await store.get('MATCH#'+L.id,'META');if(M&&M.status==='live'){const left=(M.players||[]).filter(a=>!(M.abandoned||{})[a]&&!(M.dropped||{})[a]);
        const awayAll=left.length&&left.every(a=>(M.away||{})[a]&&t-M.away[a]>10*60e3);if(!left.length||awayAll){await closeMatch(L.id,'empty');continue}}}
      out.push(L)}catch(e){out.push(L)}}return out}
  const toLobby=async(L,type,data)=>{for(const p of L.players.concat(L.stands||[]))if(!/^bot/.test(p.id))await push(p.id,type,data)};
  const world=async k=>(await store.get('WORLD',k))||{list:[]};
  const news=async line=>{const N=await world('NEWS');N.list=[line,...N.list].slice(0,12);await store.put('WORLD','NEWS',N)};
  const R={
    /* one request when the Online window opens: who you are, your gladiators, the lobbies and the news */
    'hello':async(d,ctx)=>{const me=strip(await acctOf(ctx.acct));const out={ver:C.VER,mode:'aws',me};if(d.all&&me){out.chars=(await store.byIndex('OWNER#'+ctx.acct)).map(strip);const f=(me.strikes||0)>=C.STRIKES_OUT;out.lobbies=(await store.byIndex('LOBBIES')).filter(L=>!!L.flag===f).map(strip).slice(0,100);
      out.lobbies=(await prune(out.lobbies));out.active=(await liveChar(ctx.acct)||{}).id||null;out.news=(await world('NEWS')).list.slice(0,8);out.challenges=C.weekChallenges(now());out.party=me.party?strip(await store.get('PARTY#'+me.party,'PARTY')):null}return out},
    'auth.signin':async(d,ctx)=>{if(!dev)throw new Error('Sign in with Google.');const name=C.cleanName(d.name);if(name.length<2)throw new Error('Your name: 2–24 letters.');
      const a={id:ctx.acct,name,since:now()};await store.put('ACCT#'+a.id,'PROFILE',a);return a},
    'auth.signout':async()=>({}),
    'char.mine':async(d,ctx)=>(await store.byIndex('OWNER#'+ctx.acct)).map(strip),
    'char.create':async(d,ctx)=>{const live=(await store.byIndex('OWNER#'+ctx.acct)).filter(c=>c.alive);if(live.length>=C.GLAD_MAX)throw new Error(`Up to ${C.GLAD_MAX} living gladiators.`);const ch=C.newChar(d,ctx.acct,id('g'),now());
      const A=await acctOf(ctx.acct);if(A&&!live.some(c=>c.id===A.active)){A.active=ch.id;await store.put('ACCT#'+A.id,'PROFILE',A)}await putChar(ch);return ch},
    'char.active':async(d,ctx)=>{const ch=await charById(d.char);if(!ch||ch.owner!==ctx.acct||!ch.alive)throw new Error('Not yours.');if(await busyIn(ctx.acct))throw new Error('Finish or leave your game first.');
      const A=await acctOf(ctx.acct);A.active=ch.id;await store.put('ACCT#'+A.id,'PROFILE',A);return strip(ch)},
    'char.edit':async(d,ctx)=>{const ch=await charById(d.char);if(!ch||ch.owner!==ctx.acct)throw new Error('Not yours.');if(await busyIn(ctx.acct))throw new Error('Finish or leave your game first.');
      C.editChar(ch,d,catalog);await putChar(ch);return strip(ch)},
    'char.buy':async(d,ctx)=>{const ch=await store.get('CHAR#'+d.char,'CHAR');if(!ch||ch.owner!==ctx.acct)throw new Error('Not yours.');C.buy(ch,d.item,catalog);if(Array.isArray(ch.equip))ch.equip.push(d.item);await putChar(ch);return strip(ch)},
    'lobby.list':async(d,ctx)=>{const me=await acctOf(ctx.acct);const f=!!(me&&(me.strikes||0)>=C.STRIKES_OUT);return (await prune((await store.byIndex('LOBBIES')).filter(L=>!!L.flag===f))).map(strip).slice(0,100)},
    /* pre-match room: chat (a line a second each, the last 40 kept) and the host's settings */
    'lobby.chat':async(d,ctx)=>{const L=await getLobby(d.id);if(L.status!=='waiting')throw new Error('The chat closes when the horns sound.');
      if(!L.players.some(p=>p.id===ctx.acct)&&!(L.stands||[]).some(t=>t.id===ctx.acct))throw new Error('Join the game to talk.');const text=C.cleanChat(d.text);if(!text)return strip(L);
      const last=(L.chat||[]).filter(m=>m.by===ctx.acct).slice(-1)[0];if(last&&now()-last.at<1000)throw new Error('Slow down.');const a=await acctOf(ctx.acct);
      L.chat=[...(L.chat||[]),{by:ctx.acct,name:a.name,text,at:now()}].slice(-C.CHAT_KEEP);await putLobby(L);await toLobby(L,'lobby.update',{id:L.id,chat:1});return strip(L)},
    'lobby.set':async(d,ctx)=>{const L=await getLobby(d.id);if(L.host.id!==ctx.acct)throw new Error('Only the host changes the game.');if(L.status!=='waiting')throw new Error('Already under way.');
      if(d.abandon!=null&&!L.ranked)L.abandon=d.abandon==='fate'?'fate':'cpu';if(d.standsOff!=null){L.standsOff=!!d.standsOff}await putLobby(L);await toLobby(L,'lobby.update',{id:L.id});return strip(L)},
    'lobby.create':async(d,ctx)=>{const g=await groupOf(ctx.acct);const me=g.find(w=>w.id===ctx.acct);if(d.ranked&&!me.char)throw new Error('Ranked needs a living gladiator.');
      const L=C.newLobby(d,{id:ctx.acct,name:me.name,char:me.char,rank:me.rank},id('L'),now());L.flag=g.some(w=>w.strikes>=C.STRIKES_OUT);
      const why=C.seatGroup(L,g);if(why)throw new Error(why);await putLobby(L);await toLobby(L,'lobby.update',{id:L.id});return strip(L)},
    'lobby.join':async(d,ctx)=>{const L=await getLobby(d.id);const g=await groupOf(ctx.acct);
      if(!!L.flag!==g.some(w=>w.strikes>=C.STRIKES_OUT))throw new Error('That game is gone.');const why=C.seatGroup(L,g);if(why)throw new Error(why);await putLobby(L);await toLobby(L,'lobby.update',{id:L.id});return strip(L)},
    'lobby.leave':async(d,ctx)=>{const L=await store.get('LOBBY#'+d.id,'LOBBY');if(!L)return {};
      const t=(L.stands||[]).find(s=>s.id===ctx.acct);if(t&&L.status==='waiting'){L.stands=L.stands.filter(s=>s!==t);L.tickets=L.stands.length;L.pot=Math.max(0,(L.pot|0)-(t.paid|0));const ch=await liveChar(ctx.acct);if(ch){ch.wallet+=t.paid|0;await putChar(ch)}await putLobby(L);await toLobby(L,'lobby.update',{id:L.id});return strip(L)}if(L.status!=='waiting')return strip(L);
      const was=L.players.slice();L.players=L.players.filter(p=>p.id!==ctx.acct);if(!L.players.length||L.host.id===ctx.acct){L.status='done';
        /* the game is called off before the horns: every wager and ticket goes back */
        const st=C.settle(L.bets||[],[],{tix:(L.stands||[]).map(s=>({by:s.id,amt:s.paid|0})),void:true});for(const [by,v] of Object.entries(st.payouts)){const c=await liveChar(by);if(c){c.wallet+=v;await putChar(c)}}L.bets=[];L.pool=0;L.pot=0}
      await putLobby(L);await toLobby({...L,players:was},'lobby.update',{id:L.id});return strip(L)},
    'lobby.ready':async(d,ctx)=>{const L=await getLobby(d.id);const p=L.players.find(p=>p.id===ctx.acct);if(p)p.ready=!!d.ready;await putLobby(L);await toLobby(L,'lobby.update',{id:L.id});return strip(L)},
    'lobby.start':async(d,ctx)=>{const L=await getLobby(d.id);const conn={};for(const p of C.humansOf(L)){const P=await acctOf(p.id);conn[p.id]=!!(P&&P.conn)||dev&&!pushConn}
      const why=C.canStart(L,ctx.acct,conn);if(why)throw new Error(why);
      L.status='live';L.seed=Math.floor(rnd()*2**31)>>>0;L.started=now();await putLobby(L);const humans=L.players.filter(p=>!/^bot/.test(p.id)).map(p=>p.id);const specs=(L.stands||[]).map(s=>s.id);const conns={};
      for(const a of humans.concat(specs)){const A=await acctOf(a);if(A){conns[a]=A.conn||null;A.match=L.id;await store.put('ACCT#'+a,'PROFILE',A)}}
      const seats={};L.players.forEach((p,i)=>{if(humans.includes(p.id))seats[p.id]=i});specs.forEach((a,k)=>{seats[a]=L.seats+k});
      await store.put('MATCH#'+L.id,'META',{id:L.id,seed:L.seed,n:0,players:humans,specs,seats,conns,watch:{},away:{},dropped:{},abandoned:{},outs:{},reports:{},host:L.host.id,status:'live',ranked:!!L.ranked,abandon:C.abandonRule(L),standsOff:!!L.standsOff,ttl:ttl(2)});await toLobby(L,'lobby.update',{id:L.id});return strip(L)},
    'lobby.watch':async(d)=>{const L=await getLobby(d.id);L.watchers=(L.watchers||0)+1;await putLobby(L);return strip(L)},
    /* a seat in the stands, before the horns; the coin goes into the wager pot */
    'lobby.ticket':async(d,ctx)=>{const L=await getLobby(d.id);const ch=await liveChar(ctx.acct);if(!ch)throw new Error('Tickets are paid from a gladiator’s wallet.');const why=C.ticketOK(L,ctx.acct,ch.wallet);if(why)throw new Error(why);
      const a=await acctOf(ctx.acct);ch.wallet-=L.ticket;(L.stands=L.stands||[]).push({id:ctx.acct,name:a.name,paid:L.ticket});L.tickets=L.stands.length;L.pot=(L.pot||0)+L.ticket;await putChar(ch);await putLobby(L);await toLobby(L,'lobby.update',{id:L.id});return {lobby:strip(L),char:strip(ch)}},
    /* parties: a code to share; the leader picks the game and the whole party sits down together */
    'party.create':async(d,ctx)=>{const a=await acctOf(ctx.acct);if(a.party){const P=await store.get('PARTY#'+a.party,'PARTY');if(P)return strip(P)}
      let code;for(let i=0;i<6;i++){code=C.partyCode(rnd);if(!(await store.get('PCODE#'+code,'PCODE')))break}const P={id:id('P'),code,leader:ctx.acct,members:[ctx.acct],names:{[ctx.acct]:a.name},ttl:ttl(1)};
      await store.put('PARTY#'+P.id,'PARTY',P);await store.put('PCODE#'+code,'PCODE',{party:P.id,ttl:ttl(1)});a.party=P.id;await store.put('ACCT#'+a.id,'PROFILE',a);return strip(P)},
    'party.join':async(d,ctx)=>{const code=String(d.code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');const K=await store.get('PCODE#'+code,'PCODE');const P=K&&await store.get('PARTY#'+K.party,'PARTY');if(!P)throw new Error('No party with that code.');
      const a=await acctOf(ctx.acct);if(a.party&&a.party!==P.id)throw new Error('Leave your party first.');if(!P.members.includes(ctx.acct)){if(P.members.length>=C.PARTY_MAX)throw new Error('That party is full.');P.members.push(ctx.acct);P.names[ctx.acct]=a.name;await store.put('PARTY#'+P.id,'PARTY',P)}
      a.party=P.id;await store.put('ACCT#'+a.id,'PROFILE',a);await toParty(P,'party.update',{id:P.id});return strip(P)},
    'party.leave':async(d,ctx)=>{const a=await acctOf(ctx.acct);if(!a.party)return {};const P=await store.get('PARTY#'+a.party,'PARTY');a.party=null;await store.put('ACCT#'+a.id,'PROFILE',a);if(!P)return {};
      P.members=P.members.filter(m=>m!==ctx.acct);delete P.names[ctx.acct];
      if(!P.members.length){await store.del('PARTY#'+P.id,'PARTY');await store.del('PCODE#'+P.code,'PCODE');return {}}
      if(P.leader===ctx.acct)P.leader=P.members[0];await store.put('PARTY#'+P.id,'PARTY',P);await toParty(P,'party.update',{id:P.id});return {}},
    'party.get':async(d,ctx)=>{const a=await acctOf(ctx.acct);return a&&a.party?strip(await store.get('PARTY#'+a.party,'PARTY')):null},
    'bet.place':async(d,ctx)=>{const L=await getLobby(d.id);const ch=await liveChar(ctx.acct);if(!ch)throw new Error('Wagers are paid from a living gladiator’s wallet.');
      const amt=d.amt|0,seat=d.seat|0;const why=C.betOK(L,ctx.acct,seat,amt,ch.wallet);if(why)throw new Error(why);ch.wallet-=amt;(L.bets=L.bets||[]).push({by:ctx.acct,char:ch.id,seat,amt});L.pool=(L.pool||0)+amt;
      await putChar(ch);await putLobby(L);return {lobby:strip(L),char:strip(ch)}},
    'match.open':async(d,ctx)=>{const M=await meta(d.id);if(M.host!==ctx.acct)throw new Error('Only the host opens the match.');
      if(typeof d.snap!=='object'||JSON.stringify(d.snap).length>300000)throw new Error('The opening is too large.');await store.put('MATCH#'+d.id,'OPEN',{snap:d.snap,ttl:ttl(2)});await toMatch(M,'match.open',{id:d.id},ctx.acct);return {}},
    /* 👁 watch a live match: the opening, the moves so far, and from now on every move as it happens (at most 30 watchers) */
    'match.watch':async(d,ctx)=>{const M=await meta(d.id);if(M.status!=='live')throw new Error('That match is over.');const n=Object.keys(M.watch||{}).length;
      if(!inMatch(M,ctx.acct)){if(n>=30&&!(M.watch||{})[ctx.acct])throw new Error('The free stands are full — 30 watching.');if(!M.watch){M.watch={};await store.put('MATCH#'+d.id,'META',{...M,watch:{[ctx.acct]:ctx.conn||null}})}else await store.setIn('MATCH#'+d.id,'META','watch',ctx.acct,ctx.conn||null)}
      const L=await getLobby(d.id);L.watchers=(L.watchers||0)+1;await putLobby(L);
      return {lobby:strip(L),players:M.players,specs:M.specs||[],seed:M.seed,abandoned:Object.keys(M.abandoned||{}),dropped:Object.keys(M.dropped||{})}},
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
    /* ANTI-CHEAT: each human reports the whole table; the match settles once every human still seated has reported */
    'match.result':async(d,ctx)=>{const M=await meta(d.id);if(!(M.players||[]).includes(ctx.acct))throw new Error('Not your match.');
      M.reports=M.reports||{};if(!M.reports[ctx.acct])M.reports[ctx.acct]={table:C.cleanTable(d.table),hash:String(d.hash||'').slice(0,20)};
      const need=M.players.filter(a=>!(M.dropped||{})[a]&&!(M.abandoned||{})[a]);
      if(M.status!=='done'&&need.every(a=>M.reports[a]))return await settleMatch(d.id,M,ctx.acct);
      await store.put('MATCH#'+d.id,'META',M);if(M.status==='done'&&M.outs&&M.outs[ctx.acct])return {char:strip(await liveOrLast(ctx.acct)),out:M.outs[ctx.acct]};return {pending:true}},
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
      if(L.ranked){const pl=L.players.find(p=>p.id===ctx.acct);const ch=pl&&await charById(pl.char);if(ch&&ch.alive){out=C.applyResult(ch,{won:false,place:L.seats,f:0,coin:0,survives:false},true);out.abandoned=1;await putChar(ch);await fallen(ch,out);
        await store.setIn('MATCH#'+d.id,'META','outs',ctx.acct,out)}}
      const M2=await meta(d.id);const left=(M2.players||[]).filter(a=>!(M2.abandoned||{})[a]&&!(M2.dropped||{})[a]);
      if(!left.length)await closeMatch(d.id,'empty');else if(left.every(a=>(M2.reports||{})[a]))await settleMatch(d.id,M2,ctx.acct);
      const A=await acctOf(ctx.acct);if(A&&A.match===d.id){A.match=null;await store.put('ACCT#'+A.id,'PROFILE',A)}return {done:1,out,rule}},
    'hall.list':async()=>(await world('HALL')).list.slice(0,60),
    'world.news':async()=>({news:(await world('NEWS')).list.slice(0,8),online:0,challenges:C.weekChallenges(now())})};
  return async function route(t,d,ctx){const f=R[t];if(!f)throw new Error('Unknown request: '+t);if(!ctx.acct&&t!=='hello')throw new Error('Sign in first.');return f(d||{},ctx)}}
/* a player reconnects mid-match: their new connection goes into the match record */
async function reconnect(store,acct,conn){const A=await store.get('ACCT#'+acct,'PROFILE');if(A&&A.match){await store.setIn('MATCH#'+A.match,'META','conns',acct,conn);await store.setIn('MATCH#'+A.match,'META','away',acct,0)}}
async function away(store,acct,t){const A=await store.get('ACCT#'+acct,'PROFILE');if(A&&A.match)await store.setIn('MATCH#'+A.match,'META','away',acct,t)}
module.exports={makeRoutes,reconnect,away};
