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
  const VER=2; /* protocol version: the server refuses clients on another one */
  const CLASSES8=['soldier','royalty','hero','slave','veteranus','amazonia','venatore','damnatio'];
  const EVENTS3=['democritus','egidious','cassian'];
  const EVENTS_TEAM=['familia']; /* team events: 4 seats, Team A (seats 0-1 by default) vs Team B; a party sits on one team */
  const EVENTS_ALL=EVENTS3.concat(EVENTS_TEAM);
  const STANDS_MAX=8, PARTY_MAX=4;
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
  function newChar(spec,owner,id,now){const name=cleanName(spec&&spec.name);if(name.length<2)throw new Error('Name: 2–24 letters.');
    if(!CLASSES8.includes(spec.cls))throw new Error('Pick one of the eight printed classes.');
    const look=spec.look&&typeof spec.look==='object'?JSON.parse(JSON.stringify(spec.look)):{};
    return {id,owner,name,cls:spec.cls,stats:{...START_STATS},look,rank:'tiro',wallet:0,lifeCF:0,bouts:0,survived:0,wins:0,kills:0,gear:[],feats:[],alive:true,born:now,died:null,v:VER}}
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
  function kitOf(ch){return ch?{cls:ch.cls,name:ch.name,stats:{...ch.stats},gear:(ch.gear||[]).slice()}:null}
  function hallWhy(ch){const R=RANKS[rankIdx(ch.died&&ch.died.rank||ch.rank)];if(rankIdx(R.k)>=2)return R.n;if((ch.feats||[]).includes('slew:commodus'))return 'Slew Commodus';if((ch.survived||0)>=25)return `${ch.survived} bouts survived`;return `${ch.lifeCF} lifetime CF`}
  function hallWorthy(ch){return rankIdx(ch.died&&ch.died.rank||ch.rank)>=2||(ch.survived||0)>=25||(ch.lifeCF||0)>=500||(ch.feats||[]).includes('slew:commodus')}
  /* lobbies */
  /* a lobby; the host's whole party sits down with them (seatGroup). Team events: L.team, every player carries team 'A' or 'B'. */
  function newLobby(spec,host,id,now){const ev=EVENTS_ALL.includes(spec.ev)?spec.ev:'democritus';const team=EVENTS_TEAM.includes(ev);const seats=team?4:Math.max(2,Math.min(4,spec.seats|0||4));
    return {id,host:{id:host.id,name:host.name,char:host.char||null},ev,team,loc:Math.max(1,Math.min(12,spec.loc|0||6)),ranked:!!spec.ranked,rank:spec.ranked?(host.rank||'tiro'):null,
      seats,players:[],stands:[],watchers:0,tickets:0,pot:0,ticket:Math.max(0,Math.min(50,spec.ticket|0)),
      status:'waiting',created:now,seed:null,v:VER}}
  function canJoin(L,who){if(L.status!=='waiting')return 'Already under way.';if(L.players.some(p=>p.id===who.id))return '';if(L.players.length>=L.seats)return 'Full.';
    if(L.ranked&&(who.rank||'tiro')!==L.rank)return `Ranked: ${(RANKS[rankIdx(L.rank)]||RANKS[0]).n} only.`;if(L.ranked&&!who.char)return 'Ranked needs a living gladiator.';return ''}
  /* seat a group (a lone lanista or a party) together. whos = [{id,name,char,rank,kit}]. Team events put the group on one team.
     Returns '' and changes L, or a reason (L untouched). */
  function seatGroup(L,whos){const fresh=whos.filter(w=>!L.players.some(p=>p.id===w.id));if(!fresh.length)return '';
    for(const w of fresh){const why=canJoin(L,w);if(why)return whos.length>1?`${w.name}: ${why}`:why}
    if(L.players.length+fresh.length>L.seats)return whos.length>1?`No room for a party of ${whos.length}.`:'Full.';
    let team=null;if(L.team){const n=t=>L.players.filter(p=>p.team===t).length;const mates=L.players.find(p=>whos.some(w=>w.id===p.id));
      team=mates?mates.team:['A','B'].find(t=>n(t)+fresh.length<=L.seats/2);if(!team||n(team)+fresh.length>L.seats/2)return 'No team has room for you all.'}
    for(const w of fresh)L.players.push({id:w.id,name:w.name,char:w.char||null,rank:w.rank||'tiro',kit:w.kit||null,ready:false,...(team?{team}:{}),...(w.party?{party:w.party}:{})});
    for(const w of fresh)L.stands=(L.stands||[]).filter(s=>s.id!==w.id);return ''}
  /* a seat in the stands: bought before the horns, never by a fighter of this game; the price goes into the wager pot */
  function ticketOK(L,who,wallet){if(!L.ticket)return 'This game sells no tickets.';if(L.status!=='waiting')return 'Tickets are sold until the horns.';
    if(L.players.some(p=>p.id===who))return 'Fighters take the sand, not the stands.';if((L.stands||[]).some(s=>s.id===who))return 'You already hold a ticket.';
    if((L.stands||[]).length>=STANDS_MAX)return 'The stands are sold out.';if((wallet|0)<L.ticket)return `A ticket costs ${L.ticket} coin.`;return ''}
  /* the seat order every client uses: fighters 0..seats-1 (empty seats are CPUs), then the ticket holders.
     Team events: players keep their team, CPUs fill the short team. */
  function seatTeams(L){if(!L.team)return null;const t=[];const n={A:0,B:0};L.players.forEach((p,i)=>{t[i]=p.team||'A';n[t[i]]++});for(let i=L.players.length;i<L.seats;i++){const k=n.A<=n.B?'A':'B';t[i]=k;n[k]++}return t}
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
  return {EVENTS_TEAM,EVENTS_ALL,STANDS_MAX,PARTY_MAX,seatGroup,ticketOK,seatTeams,partyCode,VER,CLASSES8,EVENTS3,RANKS,START_STATS,grow,STAT_KEYS,STAT_POOL,STAT_MIN,STAT_MAX,PRICE,PURSE,rankIdx,rankFor,nextRank,rankProgress,cleanName,statsOK,newChar,kitOf,canBuy,buy,applyResult,hallWorthy,hallWhy,newLobby,canJoin,weekChallenges,WAGER,betOK,settle,STRIKES_OUT,AWAY_MS,cleanRow,cleanTable,agree}})();
if(typeof module!=='undefined'&&module.exports)module.exports=ONLC;
