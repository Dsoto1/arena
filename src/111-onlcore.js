/* =====================================================================
   111-ONLCORE · THE ONLINE RULES (shared by the game and the AWS server)
   =====================================================================
   Pure data + functions, no DOM. The page uses it through the global ONLC; the Lambda handlers in server/ load the same
   file with require() (the module.exports line at the bottom). Change a rule here and both sides follow.
   • Ranks: Tiro → Gregarius → Veteranus → Primus Palus → Summa Rudis, earned by ranked bouts survived AND lifetime CF.
     Ranked matchmaking pairs equal ranks only. Each rank opens one more market level (Tiro: level 1 only).
   • A new online gladiator: one of the 8 printed classes, the same low ratings for everyone (55 each — they grow by
     surviving), the recruit kit (the class's weapons, no armor), an empty wallet. Coin earned in matches goes to the wallet; gear is bought between matches.
   • Prices 15 / 60 / 180 by market level; purses grow +10% per ranked bout survived in a row (streak, up to +100%).
   • Wagers: online wallets only, escrowed by the server, split among winning bets (5% to the host); fighters back only themselves.
   • Anti-cheat: results by agreement (`agree`: every human reports the whole table; strict majority wins, 2 disagreeing humans →
     void, no pay, no deaths, strikes for the minority); 3 strikes → matched only with other struck accounts; a ranked player away
     3 minutes is dropped (a CPU takes the seat at an agreed input) and still faces the Fate.
   • Death: Ranked only, by the game's own Fate table (the event's result row says whether the gladiator survives).
     The dead go to the Hall of the Fallen only if they were great: died at Veteranus or above, or with a legendary feat
     (25+ ranked bouts survived, 500+ lifetime CF, or Commodus slain). Everyone else is erased (damnatio memoriae).
   ===================================================================== */
const ONLC=(function(){
  const VER=4; /* protocol version: the server refuses clients on another one (v0.80: rooms, quick chat, the Praeco, presence) */
  const CLASSES8=['soldier','royalty','hero','slave','veteranus','amazonia','venatore','damnatio'];
  const EVENTS3=['democritus','egidious','cassian'];
  const EVENTS_TEAM=['familia']; /* team events: 4 seats, Team A (seats 0-1 by default) vs Team B; a party sits on one team */
  const EVENTS_ALL=EVENTS3.concat(EVENTS_TEAM);
  const STANDS_MAX=8, PARTY_MAX=4;
  /* v0.79: up to 3 living gladiators an account, one active; a match needs 2 humans; lobby chat */
  const GLAD_MAX=3, MIN_HUMANS=2, CHAT_KEEP=40, CHAT_LEN=200;
  const RANKS=[
    {k:'tiro',n:'Tiro',bouts:0,cf:0,mkt:1,ic:'🪵'},
    {k:'gregarius',n:'Gregarius',bouts:6,cf:90,mkt:2,ic:'🛡'},
    {k:'veteranus',n:'Veteranus',bouts:18,cf:300,mkt:3,ic:'⚔'},
    {k:'primus',n:'Primus Palus',bouts:35,cf:650,mkt:3,ic:'🏛'},
    {k:'summa',n:'Summa Rudis',bouts:60,cf:1200,mkt:3,ic:'👑'}];
  const STAT_KEYS=['spd','str','int','lck','cha'];const STAT_POOL=375,STAT_MIN=50,STAT_MAX=99;
  /* every new gladiator starts the same, low; ratings grow only by surviving: +1 to the lowest rating per bout survived,
     +1 more for a win (ties go in STAT_KEYS order), never above 99 */
  const START_STATS={spd:55,str:55,int:55,lck:55,cha:55};
  function grow(ch,n){for(let i=0;i<n;i++){let lo=null;for(const k of STAT_KEYS)if((ch.stats[k]||0)<STAT_MAX&&(lo==null||ch.stats[k]<ch.stats[lo]))lo=k;if(lo==null)return;ch.stats[lo]++}}
  /* gear prices by market level; the wallet only ever pays these */
  const PRICE={1:15,2:60,3:180}; /* slow on purpose: a full high-end kit takes ~50 survived bouts */
  /* match pay: placing pays a purse by rank, surviving a ranked bout pays a little more; CF earned adds to lifetime CF */
  const PURSE={tiro:[10,4,2,1],gregarius:[16,7,3,1],veteranus:[24,10,5,2],primus:[34,14,6,3],summa:[48,20,8,4]};
  const rankIdx=k=>Math.max(0,RANKS.findIndex(r=>r.k===k));
  function rankFor(ch){let r=RANKS[0];for(const R of RANKS)if((ch.survived||0)>=R.bouts&&(ch.lifeCF||0)>=R.cf)r=R;return r}
  function nextRank(ch){const i=rankIdx(rankFor(ch).k);return RANKS[i+1]||null}
  function rankProgress(ch){const N=nextRank(ch);if(!N)return 1;const cur=rankFor(ch);
    const a=Math.min(1,((ch.survived||0)-cur.bouts)/Math.max(1,N.bouts-cur.bouts)),b=Math.min(1,((ch.lifeCF||0)-cur.cf)/Math.max(1,N.cf-cur.cf));return Math.max(0,Math.min(a,b))}
  function cleanName(s){return String(s||'').replace(/[<>&"'`\\]/g,'').replace(/\s+/g,' ').trim().slice(0,24)}
  function statsOK(st){if(!st)return false;let sum=0;for(const k of STAT_KEYS){const v=st[k];if(!Number.isInteger(v)||v<STAT_MIN||v>STAT_MAX)return false;sum+=v}return sum<=STAT_POOL}
  /* validate + build a fresh character (the server does this; the mock calls it too) */
  /* v0.80: names are shown to everyone online — the word filter refuses a bad one */
  function nameBad(n){return new RegExp(CHAT_BAD.source,'i').test(String(n||''))}
  function newChar(spec,owner,id,now){const name=cleanName(spec&&spec.name);if(name.length<2)throw new Error('Name: 2–24 letters.');if(nameBad(name))throw new Error('Pick another name.');
    if(!CLASSES8.includes(spec.cls))throw new Error('Pick one of the eight printed classes.');
    const look=spec.look&&typeof spec.look==='object'?JSON.parse(JSON.stringify(spec.look)):{};
    return {id,owner,name,cls:spec.cls,stats:{...START_STATS},look:cleanLook(look),rank:'tiro',wallet:0,lifeCF:0,bouts:0,survived:0,wins:0,kills:0,gear:[],feats:[],alive:true,born:now,died:null,v:VER}}
  /* what a gladiator may buy: market level ≤ rank's level, not already owned (only padded/belt pieces stack) */
  function canBuy(ch,item,catalog){const it=catalog[item];if(!it)return 'No such piece.';if(!ch.alive)return 'The dead buy nothing.';
    const R=rankFor(ch);if(it.lv>R.mkt)return `${R.n} may buy up to level ${R.mkt}.`;if(!it.stack&&(ch.gear||[]).includes(item))return 'Already yours.';
    const p=PRICE[it.lv]||999;if((ch.wallet||0)<p)return `Costs ${p} coin.`;return ''}
  function buy(ch,item,catalog){const why=canBuy(ch,item,catalog);if(why)throw new Error(why);ch.wallet-=PRICE[catalog[item].lv];ch.gear=[...(ch.gear||[]),item];return ch}
  /* the result of one match for one gladiator. row = the event's result row for that seat:
     {won, place (1 = best), f (final CF), coin, kills, survives, slew:['commodus',…]} */
  function applyResult(ch,row,ranked){const before=rankFor(ch);const out={died:false,rankUp:null,pay:0,cf:0,hall:false};
    ch.bouts=(ch.bouts||0)+1;if(row.won)ch.wins=(ch.wins||0)+1;ch.kills=(ch.kills||0)+(row.kills|0);
    const cf=Math.max(0,row.f|0);out.cf=cf;ch.lifeCF=(ch.lifeCF||0)+cf;
    const purse0=(PURSE[before.k]||PURSE.tiro)[Math.min(3,Math.max(0,(row.place||4)-1))]||0;const kept=Math.max(0,Math.min(60,row.coin|0));
    /* the survival streak: +10% per ranked bout survived in a row, up to +100% (death ends everything anyway) */
    const purse=Math.round(purse0*(1+Math.min(1,(ch.streak||0)*0.1)));
    out.pay=(ranked?purse:Math.ceil(purse/2))+Math.floor(kept/2);ch.wallet=(ch.wallet||0)+out.pay;
    for(const s of row.slew||[])if(!ch.feats.includes('slew:'+s))ch.feats.push('slew:'+s);
    if(ranked&&row.survives===false){ch.alive=false;out.died=true;ch.died={at:Date.now(),cf,rank:before.k};out.hall=hallWorthy(ch);return out}
    if(ranked){ch.survived=(ch.survived||0)+1;ch.streak=(ch.streak||0)+1}if(row.survives!==false)grow(ch,1+(row.won?1:0));
    const after=rankFor(ch);ch.rank=after.k;if(after.k!==before.k)out.rankUp=after.k;return out}
  /* what a lobby seat needs to field the gladiator on every client */
  function kitOf(ch){return ch?{cls:ch.cls,name:ch.name,stats:{...ch.stats},gear:equipOf(ch),look:cleanLook(ch.look)}:null}
  /* what a gladiator brings: the pieces ticked in My Gladiators (all bought gear until something is unticked) */
  function equipOf(ch){const g=ch.gear||[];if(!Array.isArray(ch.equip))return g.slice();const left=g.slice();const out=[];for(const k of ch.equip){const i=left.indexOf(k);if(i>=0){out.push(k);left.splice(i,1)}}return out}
  /* a look: the portrait (face), an accent colour and the board token — only plain short values, at most 3 KB */
  function cleanLook(L){const out={};if(!L||typeof L!=='object')return out;const val=v=>typeof v==='boolean'?v:typeof v==='number'&&isFinite(v)?Math.round(v*1000)/1000:typeof v==='string'?v.replace(/[<>"'`\\]/g,'').slice(0,40):undefined;
    const flat=o=>{const r={};if(!o||typeof o!=='object'||Array.isArray(o))return r;let n=0;for(const [k,v] of Object.entries(o)){if(++n>40)break;if(!/^[a-zA-Z0-9_]{1,16}$/.test(k))continue;const x=val(v);if(x!==undefined)r[k]=x}return r};
    if(L.portrait)out.portrait=flat(L.portrait);if(typeof L.color==='string'&&/^#[0-9a-fA-F]{6}$/.test(L.color))out.color=L.color;if(L.token)out.token=flat(L.token);
    return JSON.stringify(out).length>3000?{}:out}
  /* My Gladiators: rename, change class (the 8 printed ones), look, which bought pieces to bring — only between events */
  function editChar(ch,d,catalog){if(!ch.alive)throw new Error('The dead stay as they fell.');
    if(d.name!=null){const n=cleanName(d.name);if(n.length<2)throw new Error('Name: 2–24 letters.');if(nameBad(n))throw new Error('Pick another name.');ch.name=n}
    if(d.cls!=null){if(!CLASSES8.includes(d.cls))throw new Error('Pick one of the eight printed classes.');ch.cls=d.cls}
    if(d.look!=null)ch.look=cleanLook(d.look);
    if(d.equip!=null){if(!Array.isArray(d.equip))throw new Error('Pick the pieces to bring.');const left=(ch.gear||[]).slice();const eq=[];for(const k of d.equip.slice(0,30)){const i=left.indexOf(k);if(i>=0){eq.push(k);left.splice(i,1)}}ch.equip=eq}
    return ch}
  /* lobby chat: plain text, short, a light word filter */
  const CHAT_BAD=/\b(f+u+c+k+\w*|sh[i1]t+\w*|c+u+n+t+\w*|n[i1]gg\w*|f[a4]gg?\w*|wh[o0]re\w*|sl[u]t+\w*|b[i1]tch\w*|r[e3]t[a4]rd\w*)/gi;
  function cleanChat(t){return String(t||'').replace(/[<>]/g,'').replace(/\s+/g,' ').trim().slice(0,CHAT_LEN).replace(CHAT_BAD,m=>m[0]+'*'.repeat(Math.max(0,m.length-1)))}
  /* how a host's game treats leaving: Ranked always 'fate' (an abandoned gladiator is eliminated and dies by Damnatio);
     Custom: 'fate' (eliminated, the bout ends for them — no death) or 'cpu' (a CPU takes the seat) */
  function abandonRule(L){return L.ranked?'fate':(L.abandon==='fate'?'fate':'cpu')}
  function humansOf(L){return (L.players||[]).filter(p=>!/^bot/.test(p.id))}
  function canStart(L,who,conn){if(L.host.id!==who)return 'Only the host starts the game.';if(L.status!=='waiting')return 'Already under way.';
    const h=humansOf(L);if(h.length<MIN_HUMANS)return `An online match needs at least ${MIN_HUMANS} lanistas — wait for someone to join.`;
    if(conn){const off=h.filter(p=>!conn[p.id]);if(off.length)return `${off.map(p=>p.name).join(', ')} ${off.length>1?'are':'is'} not connected.`}
    if(L.team&&!(L.ranked||L.autoBal)&&new Set(seatTeams(L)).size<2)return 'A team event needs at least two teams.';return ''}
  function hallWhy(ch){const R=RANKS[rankIdx(ch.died&&ch.died.rank||ch.rank)];if(rankIdx(R.k)>=2)return R.n;if((ch.feats||[]).includes('slew:commodus'))return 'Slew Commodus';if((ch.survived||0)>=25)return `${ch.survived} bouts survived`;return `${ch.lifeCF} lifetime CF`}
  function hallWorthy(ch){return rankIdx(ch.died&&ch.died.rank||ch.rank)>=2||(ch.survived||0)>=25||(ch.lifeCF||0)>=500||(ch.feats||[]).includes('slew:commodus')}
  /* ROOMS (v0.80). A lobby is a room: up to ROOM_MAX lanistas (L.members, in join order), of whom the event's seats sit
     (L.players — the match seats in order; empty seats are CPUs). Made with no setup; the host changes event, city, seats,
     rules and ticket until the horns; Ranked/Custom is fixed at creation. Others grab free seats first come, or stand.
     The host always keeps a seat; Give Host; a leaving host hands the room to the earliest joiner still there.
     Team events: every seated player carries a team letter (A…H); L.teams = how many teams the room plays with. */
  const ROOM_MAX=8, KICK_MS=5*60e3, TEAM_KEYS=['A','B','C','D','E','F','G','H'];
  const EV_SEATS={democritus:[4,4],egidious:[4,4],cassian:[4,4],familia:[4,8]};
  const seatRange=ev=>EV_SEATS[ev]||[4,4];
  const clampSeats=(ev,n)=>{const [lo,hi]=seatRange(ev);return Math.max(lo,Math.min(hi,(n|0)||lo))};
  function newLobby(spec,host,id,now){const ev=EVENTS_ALL.includes(spec.ev)?spec.ev:'democritus';const team=EVENTS_TEAM.includes(ev);
    return {id,host:{id:host.id,name:host.name,char:host.char||null},ev,team,teams:2,autoBal:!!spec.ranked,loc:Math.max(1,Math.min(12,spec.loc|0||6)),ranked:!!spec.ranked,rank:spec.ranked?(host.rank||'tiro'):null,
      seats:clampSeats(ev,spec.seats),players:[],members:[],kicked:{},cry:[],stands:[],watchers:0,tickets:0,pot:0,ticket:spec.standsOff?0:Math.max(0,Math.min(50,spec.ticket|0)),
      abandon:spec.ranked?'fate':(spec.abandon==='fate'?'fate':'cpu'),standsOff:!!spec.standsOff,chat:[],
      status:'waiting',created:now,seed:null,v:VER}}
  const memberOf=(L,id)=>(L.members||[]).find(m=>m.id===id)||null;
  const seatOf=(L,id)=>(L.players||[]).findIndex(p=>p.id===id);
  const teamKeys=L=>TEAM_KEYS.slice(0,Math.max(2,Math.min(TEAM_KEYS.length,L.teams|0||2)));
  /* may this lanista enter the room? (who = {id,rank,char}) '' or the reason */
  function canJoin(L,who,now){if(L.status!=='waiting')return 'Already under way.';if(memberOf(L,who.id))return '';
    const until=(L.kicked||{})[who.id];if(until&&(now||Date.now())<until)return 'The host removed you — try again in a few minutes.';
    if((L.members||[]).length>=ROOM_MAX)return 'The room is full.';
    if((L.stands||[]).some(s=>s.id===who.id))return 'You hold a ticket to this game — give it back to join.';
    if(L.ranked&&(who.rank||'tiro')!==L.rank)return `Ranked: ${(RANKS[rankIdx(L.rank)]||RANKS[0]).n} only.`;if(L.ranked&&!who.char)return 'Ranked needs a living gladiator.';return ''}
  /* the team with the fewest seated players (ties: the earlier letter) */
  function leanTeam(L){const n={};for(const k of teamKeys(L))n[k]=0;for(const p of L.players)if(n[p.team]!=null)n[p.team]++;
    return Object.keys(n).sort((a,b)=>n[a]-n[b]||a.localeCompare(b))[0]}
  /* sit members down together (a party on one team); '' or the reason (L untouched) */
  function sitGroup(L,ids,now){const ms=ids.map(id=>memberOf(L,id)).filter(m=>m&&seatOf(L,m.id)<0);if(!ms.length)return '';if(L.status!=='waiting')return 'Already under way.';
    if(L.players.length+ms.length>L.seats)return ms.length>1?`No ${ms.length} free seats together.`:'Every seat is taken.';
    const team=L.team?leanTeam(L):null;
    for(const m of ms)L.players.push({id:m.id,name:m.name,char:m.char||null,rank:m.rank||'tiro',kit:m.kit||null,ready:false,sat:now||Date.now(),...(team?{team}:{}),...(m.party?{party:m.party}:{})});return ''}
  /* a lanista (or a whole party) enters: everyone becomes a member; they sit together if there are seats for all, else they stand */
  function roomJoin(L,whos,now){const fresh=whos.filter(w=>!memberOf(L,w.id));if(!fresh.length)return '';
    for(const w of fresh){const why=canJoin(L,w,now);if(why)return whos.length>1?`${w.name}: ${why}`:why}
    if((L.members||[]).length+fresh.length>ROOM_MAX)return whos.length>1?`No room for a party of ${whos.length}.`:'The room is full.';
    L.members=L.members||[];for(const w of fresh)L.members.push({id:w.id,name:w.name,char:w.char||null,rank:w.rank||'tiro',kit:w.kit||null,at:now||Date.now(),...(w.party?{party:w.party}:{})});
    for(const w of fresh)L.stands=(L.stands||[]).filter(s=>s.id!==w.id);
    sitGroup(L,fresh.map(w=>w.id),now);return ''}
  /* the old name: join (and sit when there is room) */
  function seatGroup(L,whos,now){return roomJoin(L,whos,now)}
  function roomSit(L,who,now){if(!memberOf(L,who))return 'Join the room first.';if(seatOf(L,who)>=0)return '';return sitGroup(L,[who],now)}
  function roomStand(L,who){if(L.status!=='waiting')return 'Already under way.';if(L.host.id===who)return 'The host keeps a seat.';const i=seatOf(L,who);if(i<0)return '';L.players.splice(i,1);return ''}
  /* a lanista leaves; the host's room goes to the earliest joiner still there (who takes a seat). Returns {closed} */
  function roomLeave(L,who,now){L.members=(L.members||[]).filter(m=>m.id!==who);const i=seatOf(L,who);if(i>=0)L.players.splice(i,1);
    if(!L.members.length){L.status='done';L.closed='empty';return {closed:true}}
    if(L.host.id===who){const next=L.members.slice().sort((a,b)=>(a.at||0)-(b.at||0))[0];L.host={id:next.id,name:next.name,char:next.char||null};sitGroup(L,[next.id],now)}
    return {closed:false}}
  /* 👑 Give Host: an unseated new host takes the old host's seat (the old host stands) */
  function roomGiveHost(L,by,to,now){if(L.host.id!==by)return 'Only the host gives the room away.';if(L.status!=='waiting')return 'Already under way.';const m=memberOf(L,to);if(!m||to===by)return 'Pick someone in the room.';
    if(seatOf(L,to)<0){const i=seatOf(L,by);const old=i>=0?L.players[i]:null;if(i>=0)L.players.splice(i,1);const why=sitGroup(L,[to],now);if(why){if(old)L.players.splice(i,0,old);return why}
      if(old){const np=L.players.pop();L.players.splice(i,0,np);if(L.team)np.team=old.team}}
    L.host={id:m.id,name:m.name,char:m.char||null};return ''}
  /* the host removes a lanista (before the horns); they may come back after KICK_MS */
  function roomKick(L,by,who,now){if(L.host.id!==by)return 'Only the host removes lanistas.';if(L.status!=='waiting')return 'Already under way.';if(who===by||!memberOf(L,who))return 'Pick someone in the room.';
    roomLeave(L,who,now);L.kicked=L.kicked||{};L.kicked[who]=(now||Date.now())+KICK_MS;return ''}
  /* the host's settings until the horns. d may carry: ev, loc, seats, ticket, abandon, standsOff, teams, autoBal */
  function roomSet(L,by,d,now){if(L.host.id!==by)return 'Only the host changes the game.';if(L.status!=='waiting')return 'Already under way.';let reset=false;
    if(d.ev!=null&&d.ev!==L.ev){if(!EVENTS_ALL.includes(d.ev))return 'No such event online.';const wasTeam=L.team;L.ev=d.ev;L.team=EVENTS_TEAM.includes(d.ev);reset=true;
      if(L.team&&!wasTeam){L.teams=2;L.players.forEach((p,i)=>{p.team=TEAM_KEYS[i%2]})}if(!L.team)for(const p of L.players)delete p.team}
    const seats=clampSeats(L.ev,d.seats!=null?d.seats:L.seats);if(seats!==L.seats){L.seats=seats;reset=true}
    /* fewer seats than seated: the last to sit stand up (never the host) */
    while(L.players.length>L.seats){const order=L.players.filter(p=>p.id!==L.host.id).sort((a,b)=>(b.sat||0)-(a.sat||0));if(!order.length)break;L.players.splice(seatOf(L,order[0].id),1)}
    if(d.loc!=null)L.loc=Math.max(1,Math.min(12,d.loc|0||L.loc));
    if(d.standsOff!=null)L.standsOff=!!d.standsOff;if(d.ticket!=null)L.ticket=Math.max(0,Math.min(50,d.ticket|0));if(L.standsOff)L.ticket=0;
    if(d.abandon!=null&&!L.ranked)L.abandon=d.abandon==='fate'?'fate':'cpu';
    if(d.autoBal!=null&&!L.ranked)L.autoBal=!!d.autoBal;
    if(L.team&&d.teams!=null){const t=Math.max(2,Math.min(TEAM_KEYS.length,L.seats,d.teams|0||2));if(t!==L.teams){L.teams=t;reset=true}}
    if(L.team){const keys=teamKeys(L);for(const p of L.players)if(!keys.includes(p.team)){delete p.team;p.team=leanTeam(L)}}
    if(reset)for(const p of L.players)p.ready=false;return ''}
  /* a seated player picks a team (Custom); the host may move anyone; Ranked teams are balanced at the horns */
  function roomTeam(L,by,who,team){if(!L.team)return 'Not a team event.';if(L.status!=='waiting')return 'Already under way.';if(L.ranked)return 'Ranked teams are balanced when the horns sound.';
    if(by!==who&&L.host.id!==by)return 'Only the host moves other lanistas.';const p=L.players[seatOf(L,who)];if(!p)return 'Sit down first.';if(!teamKeys(L).includes(team))return 'No such team.';p.team=team;p.ready=false;return ''}
  /* even teams for the seated: parties stay together, strengths mixed (ratings + gear). Deterministic. */
  function strengthOf(p){const k=p.kit||{};const st=k.stats||{};return STAT_KEYS.reduce((a,x)=>a+(st[x]||55),0)+10*((k.gear||[]).length)}
  function autoBalance(L){if(!L.team)return;const keys=teamKeys(L);const cap=Math.ceil(L.seats/keys.length);const groups={};
    for(const p of L.players){const g=p.party||('solo:'+p.id);(groups[g]=groups[g]||[]).push(p)}
    const list=Object.values(groups).map(ps=>({ps,str:ps.reduce((a,p)=>a+strengthOf(p),0)})).sort((a,b)=>b.ps.length-a.ps.length||b.str-a.str||String(a.ps[0].id).localeCompare(String(b.ps[0].id)));
    const n={},str={};for(const k of keys){n[k]=0;str[k]=0}
    for(const g of list){const fit=keys.filter(k=>n[k]+g.ps.length<=cap);const pool=fit.length?fit:keys;const t=pool.slice().sort((a,b)=>n[a]-n[b]||str[a]-str[b]||a.localeCompare(b))[0];
      for(const p of g.ps)p.team=t;n[t]+=g.ps.length;str[t]+=g.str}}
  /* the team of every seat (players first, then the CPUs fill the shortest teams); null outside team events */
  function seatTeams(L){if(!L.team)return null;const keys=teamKeys(L);const t=[];const n={};for(const k of keys)n[k]=0;
    L.players.forEach((p,i)=>{t[i]=p.team||keys[0];n[t[i]]=(n[t[i]]||0)+1});
    for(let i=L.players.length;i<L.seats;i++){const k=Object.keys(n).sort((a,b)=>n[a]-n[b]||a.localeCompare(b))[0];t[i]=k;n[k]++}return t}
  /* playlists: the room to sit in — same event and mode, room for the whole group (members and seats), fullest first, then oldest */
  function quickPick(list,group,ev,ranked,flag,now){const ok=list.filter(L=>L.status==='waiting'&&L.ev===ev&&!!L.ranked===!!ranked&&!!L.flag===!!flag&&
      !group.some(w=>memberOf(L,w.id))&&group.every(w=>!canJoin(L,w,now))&&(L.members||[]).length+group.length<=ROOM_MAX&&L.seats-L.players.length>=group.length);
    return ok.sort((a,b)=>humansOf(b).length-humansOf(a).length||(a.created||0)-(b.created||0))[0]||null}
  /* the horns: Ranked (and Custom with auto-balance) team rooms balance; members without a seat leave the room. Returns their ids. */
  function startRoom(L){if(L.team&&(L.ranked||L.autoBal))autoBalance(L);const out=(L.members||[]).filter(m=>seatOf(L,m.id)<0).map(m=>m.id);L.members=(L.members||[]).filter(m=>seatOf(L,m.id)>=0);L.unseated=out;return out}
  /* a lobby row for lists: no kits, looks, chat or bets — the room's own members get the whole room */
  function liteRow(L){const y={...L};for(const k of ['chat','bets','seed','kicked','cry'])delete y[k];
    y.players=(L.players||[]).map(p=>({id:p.id,name:p.name,rank:p.rank,ready:!!p.ready,cls:p.kit&&p.kit.cls||null,...(p.team?{team:p.team}:{}),...(p.party?{party:p.party}:{})}));
    y.members=(L.members||[]).map(m=>({id:m.id,name:m.name,rank:m.rank}));y.stands=(L.stands||[]).map(s=>({id:s.id,name:s.name}));y.lite=1;return y}
  /* QUICK CHAT: phrases only, sent as codes (no text from players anywhere online) */
  const QC={room:['ave','ready','wait','horns','swap','seat','luck','vale'],after:['well','again','vale'],match:['truce','struck','mercy','ha'],forum:['ave','anyc','anyf','ranked','well','vale']};
  const QC_TEXT={ave:'Ave!',ready:'✓ Ready',wait:'⏳ 2 min',horns:'▶ Sound the horns?',swap:'⇄ Swap teams?',seat:'🪑 One more seat?',luck:'Good luck',vale:'Vale',
    well:'Well fought',again:'⚔ Again?',truce:'Truce?',struck:'Well struck!',mercy:'Mercy!',ha:'Ha!',anyc:'⚔ Anyone for Classic?',anyf:'👥 Anyone for Familia?',ranked:'🏅 Ranked, anyone?'};
  const phraseOK=(scope,q)=>(QC[scope]||[]).includes(q);
  /* limits: a phrase each 3 s (room/match), a Forum phrase each 10 s, 3 calls a room 2 minutes apart, invites, the daily Forum push meter */
  const RATE={say:3000,forum:10000,cryMax:3,cryGap:120000,invGap:4000,invSame:120000,invHour:15,fanCap:40,meterDay:100000};
  /* presence: a browser's IANA time zone (the map's only location — no IP addresses), and the landing's counts */
  function cleanTz(tz){tz=String(tz||'');return /^[A-Za-z_]{2,20}(\/[A-Za-z0-9_+\-]{1,24}){0,2}$/.test(tz)?tz:''}
  /* here = [{id,match,tz}], rooms = the lobby list → {n, fight, wait, zones:{tz:count}} */
  function hereSummary(here,rooms){const waiting=new Set();for(const L of rooms||[])if(L.status==='waiting')for(const m of (L.members||L.players||[]))waiting.add(m.id);
    const out={n:here.length,fight:0,wait:0,zones:{}};for(const h of here){if(h.match)out.fight++;else if(waiting.has(h.id))out.wait++;const z=cleanTz(h.tz);if(z)out.zones[z]=(out.zones[z]||0)+1}return out}
  /* a seat in the stands: bought before the horns, never by a fighter of this game; the price goes into the wager pot */
  function ticketOK(L,who,wallet){if(!L.ticket)return 'This game sells no tickets.';if(L.status!=='waiting')return 'Tickets are sold until the horns.';
    if(L.players.some(p=>p.id===who))return 'Fighters take the sand, not the stands.';if((L.stands||[]).some(s=>s.id===who))return 'You already hold a ticket.';
    if((L.stands||[]).length>=STANDS_MAX)return 'The stands are sold out.';if((wallet|0)<L.ticket)return `A ticket costs ${L.ticket} coin.`;return ''}
  function partyCode(r){const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=A[Math.floor(r()*A.length)%A.length];return s}
  /* wagers: online wallets only. A bet backs one seat; fighters may back only themselves; bets close when the match starts.
     settle(pool,winnerSeats) → {payouts:{bettor:coin}, cut} — the pool is split among winning bets by stake, 5% to the host. */
  const WAGER={min:1,max:500,cut:0.05};
  function betOK(L,who,seat,amt,wallet){if(L.status!=='waiting')return 'Bets close when the match starts.';if(!Number.isInteger(amt)||amt<WAGER.min||amt>WAGER.max)return `Stake ${WAGER.min}–${WAGER.max} coin.`;
    if(amt>(wallet|0))return 'Not enough in the wallet.';if(!Number.isInteger(seat)||seat<0||seat>=L.seats)return 'Back a seat.';
    const mine=L.players.findIndex(p=>p.id===who);if(mine>=0&&seat!==mine)return 'A fighter may only back themselves.';return ''}
  /* x = {pot (ticket coin), tix:[{by,amt}], seatAcct:{seat:acct}, void}. The ticket pot joins the pool of the winning bets;
     with no winning bet it goes to the winning fighters; a void match (or no winner) refunds bets and tickets. */
  function settle(bets,winSeats,x){x=x||{};const pot=x.pot|0;const pool=bets.reduce((a,b)=>a+b.amt,0);const pay={};const add=(k,v)=>{if(k&&v>0)pay[k]=(pay[k]||0)+v};
    if(x.void||!winSeats.length){for(const b of bets)add(b.by,b.amt);for(const t of x.tix||[])add(t.by,t.amt);return {payouts:pay,cut:0,refund:true}}
    const won=bets.filter(b=>winSeats.includes(b.seat));const wsum=won.reduce((a,b)=>a+b.amt,0);
    if(!wsum){for(const b of bets)add(b.by,b.amt);const ws=winSeats.map(s=>(x.seatAcct||{})[s]).filter(a=>a&&!/^bot/.test(a));let left=pot;
      for(const a of ws){const v=Math.floor(pot/ws.length);add(a,v);left-=v}return {payouts:pay,cut:left,refund:true}}
    const all=pool+pot;const cut=Math.floor(all*WAGER.cut);let left=all-cut;for(const b of won){const v=Math.floor((all-cut)*b.amt/wsum);add(b.by,v);left-=v}return {payouts:pay,cut:cut+left,refund:false}}
  /* ANTI-CHEAT — results by agreement. Every human reports the WHOLE results table (one row per seat) + an end hash.
     agree(reports) → {table, void, minority:[acct…], unverified}: the table most reports share wins when it has a strict majority;
     a lone human (the rest CPUs) is accepted but unverified; no majority (e.g. 2 humans disagree) → void: no pay, no deaths. */
  const STRIKES_OUT=3, AWAY_MS=180000;
  function cleanRow(r){r=r||{};return {seat:r.seat|0,won:!!r.won,place:Math.max(1,Math.min(8,r.place|0||4)),f:Math.max(0,Math.min(400,r.f|0)),coin:Math.max(0,Math.min(200,r.coin|0)),kills:Math.max(0,Math.min(20,r.kills|0)),survives:r.survives!==false,slew:Array.isArray(r.slew)?r.slew.filter(x=>x==='commodus'):[]}}
  function cleanTable(t){return (Array.isArray(t)?t:[]).slice(0,8).map(cleanRow).sort((a,b)=>a.seat-b.seat)}
  function agree(reports){const ids=Object.keys(reports);if(!ids.length)return {table:null,void:true,minority:[]};
    const key=r=>JSON.stringify(cleanTable(r.table))+'|'+String(r.hash||'');const groups={};for(const a of ids){const k=key(reports[a]);(groups[k]=groups[k]||[]).push(a)}
    const best=Object.entries(groups).sort((x,y)=>y[1].length-x[1].length)[0];
    if(ids.length===1)return {table:cleanTable(reports[ids[0]].table),void:false,minority:[],unverified:true};
    if(best[1].length*2>ids.length)return {table:cleanTable(reports[best[1][0]].table),void:false,minority:ids.filter(a=>!best[1].includes(a))};
    return {table:null,void:true,minority:ids}}
  /* weekly challenges rotate with the week of the year */
  const CHALLENGES=[['Survive 3 ranked bouts',3,'survived'],['Earn 60 CF in one bout',60,'cf1'],['Win a bout at Capua',1,'win:3'],['Slay 5 beasts',5,'beasts'],['Finish 5 bouts',5,'bouts'],['Win with 20+ coin left',1,'rich']];
  function weekChallenges(t){const wk=Math.floor((t||0)/604800000);const out=[];for(let i=0;i<3;i++)out.push(CHALLENGES[(wk+i*2)%CHALLENGES.length]);return out}
  return {nameBad,ROOM_MAX,KICK_MS,TEAM_KEYS,EV_SEATS,seatRange,clampSeats,memberOf,seatOf,teamKeys,roomJoin,sitGroup,roomSit,roomStand,roomLeave,roomGiveHost,roomKick,roomSet,roomTeam,strengthOf,autoBalance,quickPick,startRoom,liteRow,QC,QC_TEXT,phraseOK,RATE,cleanTz,hereSummary,GLAD_MAX,MIN_HUMANS,CHAT_KEEP,CHAT_LEN,equipOf,cleanLook,editChar,cleanChat,abandonRule,humansOf,canStart,EVENTS_TEAM,EVENTS_ALL,STANDS_MAX,PARTY_MAX,seatGroup,ticketOK,seatTeams,partyCode,VER,CLASSES8,EVENTS3,RANKS,START_STATS,grow,STAT_KEYS,STAT_POOL,STAT_MIN,STAT_MAX,PRICE,PURSE,rankIdx,rankFor,nextRank,rankProgress,cleanName,statsOK,newChar,kitOf,canBuy,buy,applyResult,hallWorthy,hallWhy,newLobby,canJoin,weekChallenges,WAGER,betOK,settle,STRIKES_OUT,AWAY_MS,cleanRow,cleanTable,agree}})();
if(typeof module!=='undefined'&&module.exports)module.exports=ONLC;
