/* =====================================================================
   111-ONLCORE · THE ONLINE RULES (shared by the game and the AWS server)
   =====================================================================
   Pure data + functions, no DOM. The page uses it through the global ONLC; the Lambda handlers in server/ load the same
   file with require() (the module.exports line at the bottom). Change a rule here and both sides follow.
   • Ranks: Tiro → Gregarius → Veteranus → Primus Palus → Summa Rudis, earned by ranked bouts survived AND lifetime CF.
     Ranked matchmaking pairs equal ranks only. Each rank opens one more market level (Tiro: level 1 only).
   • A new online gladiator: one of the 8 printed classes, the same low ratings for everyone (55 each — they grow by
     surviving), the recruit kit (the class's weapons, no armor), an empty wallet. Surviving Ranked bouts pays the wallet (AWARD); gear is bought between matches.
   • v0.82 (protocol 5): prices — weapons 60 / 250 / 750 by market level, armor 15 / 55 / 150 coin per AP (priceOf).
     Coin: no pay-out of in-match coin; a SURVIVED RANKED bout pays a flat award by rank (AWARD: 8/12/18/25/35), +50% for a win,
     ×(1 + 10% per ranked bout survived in a row, up to +100%). Custom pays no coin. Wagers/tickets unchanged.
   • v0.82 DOMUS: every account names a house (3–24 letters, word-filtered, unique) before any gladiator; up to 4 gladiators
     (GLAD_MAX), one active; the house keeps a record (bouts, wins, survived, fallen, lifetime CF, founded).
   • v0.82 GLORY: ranks by Glory (gloryOf = lifetime CF + 12 a Ranked bout survived + 8 a Ranked win): Tiro 0, Gregarius 180, Veteranus 550,
     Primus Palus 1150, Summa Rudis 2100; never demoted (ch.rankK). TABLE SIZE (tableFactor): 2 humans seated → ×0.5, 3 → ×0.75, 4+ → ×1 on the
     coin award and on the Glory gained; the Fate applies in full.
   • v0.82 GUESTS: read-only watchers without sign-in (GUEST_OK requests), 2 hours (GUEST_MS), counted apart (hereSummary guests/gzones).
   • v0.82 STANDS GROUP TURN: one private pick per ticket holder per rotation (standsPickOK), applied together as one server input.
   • v0.82 STANDS FOR THE POOR: a room may sell FREE seats (L.free, ticket 0); Flavius's guest pass (PASS, passOK): once a UTC day a house
     whose active gladiator holds under 15 coin takes a free seat in a room selling seats; sitting through it → +1 house Fame.
     The house's PATRON look (cleanPatron, ≤1 KB) rides on its stands entries.
   • Wagers: online wallets only, escrowed by the server, split among winning bets (5% to the host); fighters back only themselves.
   • Anti-cheat: results by agreement (`agree`: every human reports the whole table; strict majority wins, 2 disagreeing humans →
     void, no pay, no deaths, strikes for the minority); 3 strikes → matched only with other struck accounts; a ranked player away
     3 minutes is dropped (a CPU takes the seat at an agreed input) and still faces the Fate.
   • v0.83 (protocol 6, contract tools/plans/onl83-contract.md): 8 RANKS (Novicius, Rudiarius, Invictus added); no rank gate on BUYING —
     the first three ranks may only WEAR printed gear (named level-4 pieces wait in the Storeroom until Veteranus); the HOUSE TREASURY takes
     20% of every survival award; ARMORY OFFERINGS (PRICE_OFF, ≤2 brought, unused ones come back); RANKED GEAR LOSS (brought pieces not held
     at the end come out BROKEN, repair ⅓ of the value; the dead lose what they brought: the human killer picks one, the rest go to the
     market); FLAVIUS'S GIFTS (rollGift) and GENERATED NAMED WEAPONS (rollNamed: affixes + Legendary uniques); START COUNTDOWN (10 s);
     TROPHIES; FOLLOW; the WAGERS tab (oddsOf, betResults); the Ludi Infames playlist (L.inf, Veteranus+).
     His call after the server half: GIFTS and freebies belong to the DOMUS (D.gifts, giftsOut/giftsIn; opened for the active gladiator, or
     into the house with none: applyGiftHouse); a Ranked death keeps the un-brought satchel on the house shelf (D.offers, offersIn, offerMove).
   • Death: Ranked only, by the game's own Fate table (the event's result row says whether the gladiator survives).
     The dead go to the Hall of the Fallen only if they were great: died at Veteranus or above, or with a legendary feat
     (25+ ranked bouts survived, 500+ lifetime CF, or Commodus slain). Everyone else is erased (damnatio memoriae).
   ===================================================================== */
const ONLC=(function(){
  const VER=7; /* v0.84: named armor, seasons + the weekly challenge, reclaim a seat, CPU-won rewards, Flavius's Auction. v0.83: ranks 8, gear levels, treasury, offerings, gear loss + loot, gifts, named weapons, countdown, trophies, follow, wagers tab.  protocol version: the server refuses clients on another one (v0.80: rooms, quick chat, the Praeco, presence; v0.82: domus, coin, guests, invites, stands turn) */
  const CLASSES8=['soldier','royalty','hero','slave','veteranus','amazonia','venatore','damnatio'];
  const EVENTS3=['democritus','egidious','cassian'];
  const EVENTS_TEAM=['familia']; /* team events: 4 seats, Team A (seats 0-1 by default) vs Team B; a party sits on one team */
  const EVENTS_ALL=EVENTS3.concat(EVENTS_TEAM);
  const STANDS_MAX=8, PARTY_MAX=4;
  /* v0.79: up to 3 living gladiators an account, one active; a match needs 2 humans; lobby chat */
  const GLAD_MAX=4, MIN_HUMANS=2, CHAT_KEEP=40, CHAT_LEN=200;
  /* v0.83: 8 ranks. mkt = the highest gear level the rank may WEAR / bring (and carry): 3 = printed only, 4 = named pieces too.
     Buying has no rank gate since v0.83 (prices gate). */
  const RANKS=[
    {k:'tiro',n:'Tiro',glory:0,mkt:3,ic:'🪵'},
    {k:'novicius',n:'Novicius',glory:90,mkt:3,ic:'🌿'},
    {k:'gregarius',n:'Gregarius',glory:180,mkt:3,ic:'🛡'},
    {k:'veteranus',n:'Veteranus',glory:550,mkt:4,ic:'⚔'},
    {k:'primus',n:'Primus Palus',glory:1150,mkt:4,ic:'🏛'},
    {k:'summa',n:'Summa Rudis',glory:2100,mkt:4,ic:'👑'},
    {k:'rudiarius',n:'Rudiarius',glory:3500,mkt:4,ic:'🗡'},
    {k:'invictus',n:'Invictus',glory:5500,mkt:4,ic:'🦅'}];
  const STAT_KEYS=['spd','str','int','lck','cha'];const STAT_POOL=375,STAT_MIN=50,STAT_MAX=99;
  /* every new gladiator starts the same, low; ratings grow only by surviving: +1 to the lowest rating per bout survived,
     +1 more for a win (ties go in STAT_KEYS order), never above 99 */
  const START_STATS={spd:55,str:55,int:55,lck:55,cha:55};
  function grow(ch,n){for(let i=0;i<n;i++){let lo=null;for(const k of STAT_KEYS)if((ch.stats[k]||0)<STAT_MAX&&(lo==null||ch.stats[k]<ch.stats[lo]))lo=k;if(lo==null)return;ch.stats[lo]++}}
  /* v0.82 gear prices: a weapon by its market level (PRICE), an armor piece by its AP (PRICE_AP per AP at its level; the catalog carries ap) */
  const PRICE={1:60,2:250,3:750}, PRICE_AP={1:15,2:55,3:150};
  function priceOf(it){if(!it)return 999999;if(it.kind==='a')return (PRICE_AP[it.lv]||999)*Math.max(1,it.ap|0);return PRICE[it.lv]||999999}
  /* v0.82 match pay: only a SURVIVED RANKED bout pays — a flat award by the rank held at the horns, +50% for a win, ×(1 + 10% a survived
     ranked bout in a row, ≤ +100%). Custom pays nothing; coin carried in the match is never paid out. */
  const AWARD={tiro:8,novicius:10,gregarius:12,veteranus:18,primus:25,summa:35,rudiarius:45,invictus:60}, WIN_BONUS=0.5;
  function awardOf(rank,won,streak){return Math.round((AWARD[rank]||AWARD.tiro)*(won?1+WIN_BONUS:1)*(1+Math.min(1,(streak|0)*0.1)))}
  const rankIdx=k=>Math.max(0,RANKS.findIndex(r=>r.k===k));
  /* v0.82 GLORY: one number ranks a gladiator — lifetime CF + 12 a Ranked bout survived + 8 a Ranked win, every part at the match's
     table-size factor (tableFactor). Kept on the gladiator (ch.glory, fractional); gladiators from before v0.82 start from their record
     (ch.rwins = Ranked wins when known, else all wins). NO DEMOTION: the highest rank reached (ch.rankK; else the stored ch.rank) holds. */
  const GLORY={cf:1,survived:12,win:8};
  function gloryOf(ch){if(!ch)return 0;if(typeof ch.glory==='number'&&isFinite(ch.glory))return ch.glory;return (ch.lifeCF|0)+GLORY.survived*(ch.survived|0)+GLORY.win*(ch.rwins!=null?ch.rwins|0:ch.wins|0)}
  function rankByGlory(g){let r=RANKS[0];for(const R of RANKS)if(g>=R.glory)r=R;return r}
  function rankFor(ch){let r=rankByGlory(gloryOf(ch));for(const k of [ch&&ch.rankK,ch&&ch.rank]){const K=k&&RANKS.find(R=>R.k===k);if(K&&rankIdx(K.k)>rankIdx(r.k))r=K}return r}
  function nextRank(ch){const i=rankIdx(rankFor(ch).k);return RANKS[i+1]||null}
  function rankProgress(ch){const N=nextRank(ch);if(!N)return 1;const cur=rankFor(ch);return Math.max(0,Math.min(1,(gloryOf(ch)-cur.glory)/Math.max(1,N.glory-cur.glory)))}
  /* v0.82 TABLE SIZE: humans seated in the match (CPU fillers do not count): 2 → half, 3 → three quarters, 4+ → full (coin and Glory; the Fate in full) */
  const tableFactor=n=>n==null?1:n>=4?1:n===3?0.75:0.5;
  function cleanName(s){return String(s||'').replace(/[<>&"'`\\]/g,'').replace(/\s+/g,' ').trim().slice(0,24)}
  function statsOK(st){if(!st)return false;let sum=0;for(const k of STAT_KEYS){const v=st[k];if(!Number.isInteger(v)||v<STAT_MIN||v>STAT_MAX)return false;sum+=v}return sum<=STAT_POOL}
  /* validate + build a fresh character (the server does this; the mock calls it too) */
  /* v0.80: names are shown to everyone online — the word filter refuses a bad one */
  function nameBad(n){return new RegExp(CHAT_BAD.source,'i').test(String(n||''))}
  function newChar(spec,owner,id,now){const name=cleanName(spec&&spec.name);if(name.length<2)throw new Error('Name: 2–24 letters.');if(nameBad(name))throw new Error('Pick another name.');
    if(!CLASSES8.includes(spec.cls))throw new Error('Pick one of the eight printed classes.');
    const look=spec.look&&typeof spec.look==='object'?JSON.parse(JSON.stringify(spec.look)):{};
    return {id,owner,name,cls:spec.cls,stats:{...START_STATS},look:cleanLook(look),rank:'tiro',rankK:'tiro',glory:0,rwins:0,wallet:0,lifeCF:0,bouts:0,survived:0,wins:0,kills:0,gear:[],feats:[],alive:true,born:now,died:null,v:VER}}
  /* what a gladiator may buy: market level ≤ rank's level, not already owned (only padded/belt pieces stack) */
  function canBuy(ch,item,catalog){const it=catalog[item];if(!it)return 'No such piece.';if(!ch.alive)return 'The dead buy nothing.';
    /* v0.83: no rank gate on buying — the price gates; one copy of a non-stacking piece (whole or broken) */
    /* v0.91 (his call): the printed market is OPEN — any number of copies; spares wait on the shelf, one is worn */
    const p=priceOf(it);if((ch.wallet||0)<p)return `Costs ${p} coin.`;return ''}
  function buy(ch,item,catalog){const why=canBuy(ch,item,catalog);if(why)throw new Error(why);ch.wallet-=priceOf(catalog[item]);ch.gear=[...(ch.gear||[]),item];return ch}
  /* the result of one match for one gladiator. row = the event's result row for that seat:
     {won, place (1 = best), f (final CF), coin (ignored since v0.82), kills, survives, slew:['commodus',…]} */
  function applyResult(ch,row,ranked,x){const before=rankFor(ch);const g0=gloryOf(ch);const cpu=!!(row&&row.cpu);const f=tableFactor(x&&x.humans)*(cpu?CPU_CUT:1);const out={died:false,rankUp:null,pay:0,cf:0,hall:false,factor:f,glory:0,...(cpu?{cpu:true}:{})};
    /* v0.84: a seat the CPU mostly played (row.cpu) earns CPU_CUT of the coin and the Glory, no gifts, no trophies; the Fate still applies */
    const surv=row.survives!==false;const gain=f*(Math.max(0,row.f|0)+(ranked&&surv?GLORY.survived:0)+(ranked&&surv&&row.won?GLORY.win:0));
    if(ch.rwins==null)ch.rwins=ch.glory==null?(ch.wins|0):0;if(ranked&&row.won)ch.rwins++;ch.glory=Math.round((g0+gain)*100)/100;out.glory=Math.round(gain*10)/10;
    if(!ch.rankK||rankIdx(before.k)>rankIdx(ch.rankK))ch.rankK=before.k;const t83=(x&&x.now)||Date.now();out.gifts=[];out.ranks=[];
    ch.bouts=(ch.bouts||0)+1;if(row.won)ch.wins=(ch.wins||0)+1;ch.kills=(ch.kills||0)+(row.kills|0);
    const cf=Math.max(0,row.f|0);out.cf=cf;ch.lifeCF=(ch.lifeCF||0)+cf;
    /* v0.82: the award (Ranked, survived) — streak counted before this bout */
    /* v0.83: the house treasury takes TREASURY_CUT of the award (out.cut); the gladiator keeps out.pay (out.award = both) */
    out.award=ranked&&row.survives!==false?Math.round(awardOf(before.k,!!row.won,ch.streak||0)*f):0;out.cut=Math.round(out.award*TREASURY_CUT);out.pay=out.award-out.cut;ch.wallet=(ch.wallet||0)+out.pay;
    for(const s of row.slew||[])if(!ch.feats.includes('slew:'+s))ch.feats.push('slew:'+s);
    if(ranked&&row.survives===false){ch.alive=false;out.died=true;ch.died={at:Date.now(),cf,rank:before.k};out.hall=hallWorthy(ch);return out}
    if(ranked){ch.survived=(ch.survived||0)+1;ch.streak=(ch.streak||0)+1}if(row.survives!==false)grow(ch,1+(row.won?1:0));
    const after=rankFor(ch);ch.rank=after.k;if(rankIdx(after.k)>rankIdx(ch.rankK))ch.rankK=after.k;if(after.k!==before.k)out.rankUp=after.k;
    /* v0.83 Flavius's gifts: one for every rank reached, one every GIFT_EVERY Ranked bouts survived */
    for(let i=rankIdx(before.k)+1;i<=rankIdx(after.k);i++){out.ranks.push(RANKS[i].k);const g=cpu?null:giftAdd(ch,'rank:'+RANKS[i].k,t83);if(g)out.gifts.push(g)}
    if(!cpu&&ranked&&ch.survived>0&&ch.survived%GIFT_EVERY===0){const g=giftAdd(ch,'surv:'+ch.survived,t83);if(g)out.gifts.push(g)}
    return out}
  /* what a lobby seat needs to field the gladiator on every client */
  /* v0.83: gear = ENGINE keys (printed key, or 'nw_<uid>' for a named weapon) in the order brought; items = the same pieces as the
     gladiator holds them (parallel to gear); named = the full weapon defs of the named pieces; offer = the offerings brought (≤2);
     cfb = extra starting CF for a Ranked match (from a gift) */
  function kitOf(ch){if(!ch)return null;const gear=[],items=[],named=[];
    for(const it of equipOf(ch)){if(isNamed(it)){const pc=pcOf(ch,it);if(!pc||!pc.w)continue;named.push({...pc.w,key:engineKey(it)})}gear.push(engineKey(it));items.push(it)}
    return {cls:ch.cls,name:ch.name,stats:{...ch.stats},gear,items,named,offer:offersBrought(ch),cfb:Math.max(0,ch.cfb|0),look:cleanLook(ch.look)}}
  /* what a gladiator brings: the pieces ticked in My Gladiators (all bought gear until something is unticked) */
  function equipOf0(ch){const g=(ch.gear||[]).filter(k=>!wearWhy(ch,k));if(!Array.isArray(ch.equip))return g.slice();const left=g.slice();const out=[];for(const k of ch.equip){const i=left.indexOf(k);if(i>=0){out.push(k);left.splice(i,1)}}return out}
  /* v0.84: never bring two armor pieces that cannot be worn together (one per equip point and layer, as 03-engine armorConflict): the first wins */
  function equipOf(ch){const out=equipOf0(ch);const ok=armFit(ch,out,catNow());return out.filter((x,i)=>ok[i])}
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
    if(d.equip!=null){if(!Array.isArray(d.equip))throw new Error('Pick the pieces to bring.');const left=(ch.gear||[]).slice();const eq=[];for(const k of d.equip.slice(0,30)){const i=left.indexOf(k);if(i>=0){const why=wearWhy(ch,k);if(why)throw new Error(why);eq.push(k);left.splice(i,1)}}const ok=armFit(ch,eq,catNow());ch.equip=eq.filter((x,i)=>ok[i])}
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
  function hallWhy(ch){const R=RANKS[rankIdx(ch.died&&ch.died.rank||ch.rank)];if(rankIdx(R.k)>=rankIdx('veteranus'))return R.n;if((ch.feats||[]).includes('slew:commodus'))return 'Slew Commodus';if((ch.survived||0)>=25)return `${ch.survived} bouts survived`;return `${ch.lifeCF} lifetime CF`}
  function hallWorthy(ch){return rankIdx(ch.died&&ch.died.rank||ch.rank)>=rankIdx('veteranus')||(ch.survived||0)>=25||(ch.lifeCF||0)>=500||(ch.feats||[]).includes('slew:commodus')}
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
      free:!spec.standsOff&&!(spec.ticket|0)&&!!spec.free,
      abandon:spec.ranked?'fate':(spec.abandon==='fate'?'fate':'cpu'),standsOff:!!spec.standsOff,night:!!spec.night,chat:[],...(spec.inf?{inf:true}:{}),startAt:null,
      status:'waiting',created:now,seed:null,v:VER}}
  const memberOf=(L,id)=>(L.members||[]).find(m=>m.id===id)||null;
  const seatOf=(L,id)=>(L.players||[]).findIndex(p=>p.id===id);
  const teamKeys=L=>TEAM_KEYS.slice(0,Math.max(2,Math.min(TEAM_KEYS.length,L.teams|0||2)));
  /* may this lanista enter the room? (who = {id,rank,char}) '' or the reason */
  function canJoin(L,who,now){if(L.status!=='waiting')return 'Already under way.';if(memberOf(L,who.id))return '';
    const until=(L.kicked||{})[who.id];if(until&&(now||Date.now())<until)return 'The host removed you — try again in a few minutes.';
    if((L.members||[]).length>=ROOM_MAX)return 'The room is full.';
    if((L.stands||[]).some(s=>s.id===who.id))return 'You hold a ticket to this game — give it back to join.';
    if(L.ranked&&(who.rank||'tiro')!==L.rank)return `Ranked: ${(RANKS[rankIdx(L.rank)]||RANKS[0]).n} only.`;if(L.ranked&&!who.char)return 'Ranked needs a living gladiator.';
    if(L.inf&&rankIdx(who.rank||'tiro')<rankIdx(INFAMES_MIN))return 'Ludi Infames: Veteranus and above.';return ''}
  /* the team with the fewest seated players (ties: the earlier letter) */
  function leanTeam(L){const n={};for(const k of teamKeys(L))n[k]=0;for(const p of L.players)if(n[p.team]!=null)n[p.team]++;
    return Object.keys(n).sort((a,b)=>n[a]-n[b]||a.localeCompare(b))[0]}
  /* sit members down together (a party on one team); '' or the reason (L untouched) */
  function sitGroup(L,ids,now){const ms=ids.map(id=>memberOf(L,id)).filter(m=>m&&seatOf(L,m.id)<0);if(!ms.length)return '';if(L.status!=='waiting')return 'Already under way.';
    if(ms.some(m=>(L.stands||[]).some(t=>t.id===m.id)))return 'A ticket holder watches from the stands — fighters take the sand.'; /* v0.87: never both */
    if(L.players.length+ms.length>L.seats)return ms.length>1?`No ${ms.length} free seats together.`:'Every seat is taken.';
    const team=L.team?leanTeam(L):null;
    for(const m of ms)L.players.push({id:m.id,name:m.name,char:m.char||null,rank:m.rank||'tiro',kit:m.kit||null,ready:false,sat:now||Date.now(),...(team?{team}:{}),...(m.party?{party:m.party}:{}),...(m.domus?{domus:m.domus}:{})});countCheck(L);return ''}
  /* a lanista (or a whole party) enters: everyone becomes a member; they sit together if there are seats for all, else they stand */
  function roomJoin(L,whos,now){const fresh=whos.filter(w=>!memberOf(L,w.id));if(!fresh.length)return '';
    for(const w of fresh){const why=canJoin(L,w,now);if(why)return whos.length>1?`${w.name}: ${why}`:why}
    if((L.members||[]).length+fresh.length>ROOM_MAX)return whos.length>1?`No room for a party of ${whos.length}.`:'The room is full.';
    L.members=L.members||[];for(const w of fresh)L.members.push({id:w.id,name:w.name,char:w.char||null,rank:w.rank||'tiro',kit:w.kit||null,at:now||Date.now(),...(w.party?{party:w.party}:{}),...(w.domus?{domus:w.domus}:{})});
    for(const w of fresh)L.stands=(L.stands||[]).filter(s=>s.id!==w.id);
    sitGroup(L,fresh.map(w=>w.id),now);return ''}
  /* the old name: join (and sit when there is room) */
  function seatGroup(L,whos,now){return roomJoin(L,whos,now)}
  function roomSit(L,who,now){if(!memberOf(L,who))return 'Join the room first.';if(seatOf(L,who)>=0)return '';return sitGroup(L,[who],now)}
  function roomStand(L,who){if(L.status!=='waiting')return 'Already under way.';if(L.host.id===who)return 'The host keeps a seat.';const i=seatOf(L,who);if(i<0)return '';L.players.splice(i,1);countCheck(L);return ''}
  /* a lanista leaves; the host's room goes to the earliest joiner still there (who takes a seat). Returns {closed} */
  function roomLeave(L,who,now){L.members=(L.members||[]).filter(m=>m.id!==who);if(L.off&&L.off[who]){delete L.off[who];if(!Object.keys(L.off).length)delete L.off}const i=seatOf(L,who);if(i>=0)L.players.splice(i,1);
    if(!L.members.length){L.status='done';L.closed='empty';return {closed:true}}
    if(L.host.id===who){const next=L.members.slice().sort((a,b)=>(a.at||0)-(b.at||0))[0];L.host={id:next.id,name:next.name,char:next.char||null};sitGroup(L,[next.id],now)}
    countCheck(L);return {closed:false}}
  /* v0.89 ROOMS WHEN LANISTAS GO: a member whose socket dropped is marked L.off[id] = when (the room shows "reconnecting…");
     coming back within ROOM_GRACE clears it; after it the server takes them out with roomLeave (any member — the host's room passes on) */
  const ROOM_GRACE=60e3;
  function roomOffMark(L,id,t){if(!L||L.status!=='waiting'||!memberOf(L,id))return false;L.off=L.off||{};if(L.off[id])return false;L.off[id]=t||Date.now();return true}
  function roomOffClear(L,id){if(!L||!L.off||!L.off[id])return false;delete L.off[id];if(!Object.keys(L.off).length)delete L.off;return true}
  /* the members past their grace (offAt = their own drop time when the room has no mark: a missed $disconnect) */
  function roomGoneIds(L,now,grace,offAt){const g=grace==null?ROOM_GRACE:grace;const out=[];for(const m of L.members||[]){if(/^bot/.test(m.id))continue;
      const t=(L.off||{})[m.id]||(offAt&&offAt[m.id])||0;if(t&&now-t>g)out.push(m.id)}return out}
  /* lists never show a room whose host is away (dropped, inside the grace) to anyone outside it */
  const roomHostAway=L=>!!(L&&L.status==='waiting'&&L.off&&L.host&&L.off[L.host.id]);
  /* 👑 Give Host: an unseated new host takes the old host's seat (the old host stands) */
  function roomGiveHost(L,by,to,now){if(L.host.id!==by)return 'Only the host gives the room away.';if(L.status!=='waiting')return 'Already under way.';const m=memberOf(L,to);if(!m||to===by)return 'Pick someone in the room.';
    if(seatOf(L,to)<0){const i=seatOf(L,by);const old=i>=0?L.players[i]:null;if(i>=0)L.players.splice(i,1);const why=sitGroup(L,[to],now);if(why){if(old)L.players.splice(i,0,old);return why}
      if(old){const np=L.players.pop();L.players.splice(i,0,np);if(L.team)np.team=old.team}}
    L.host={id:m.id,name:m.name,char:m.char||null};countCheck(L,true);return ''}
  /* the host removes a lanista (before the horns); they may come back after KICK_MS */
  function roomKick(L,by,who,now){if(L.host.id!==by)return 'Only the host removes lanistas.';if(L.status!=='waiting')return 'Already under way.';if(who===by||!memberOf(L,who))return 'Pick someone in the room.';
    roomLeave(L,who,now);L.kicked=L.kicked||{};L.kicked[who]=(now||Date.now())+KICK_MS;return ''}
  /* the host's settings until the horns. d may carry: ev, loc, seats, ticket, free, abandon, standsOff, night, teams, autoBal
     (free: seats in the stands at no cost — ticket 0; a price, or 'none' without free, ends it; stands off ends both) */
  function roomSet(L,by,d,now){if(L.host.id!==by)return 'Only the host changes the game.';if(L.status!=='waiting')return 'Already under way.';let reset=false;
    if(d.ev!=null&&d.ev!==L.ev){if(!EVENTS_ALL.includes(d.ev))return 'No such event online.';const wasTeam=L.team;L.ev=d.ev;L.team=EVENTS_TEAM.includes(d.ev);reset=true;
      if(L.team&&!wasTeam){L.teams=2;L.players.forEach((p,i)=>{p.team=TEAM_KEYS[i%2]})}if(!L.team)for(const p of L.players)delete p.team}
    const seats=clampSeats(L.ev,d.seats!=null?d.seats:L.seats);if(seats!==L.seats){L.seats=seats;reset=true}
    /* fewer seats than seated: the last to sit stand up (never the host) */
    while(L.players.length>L.seats){const order=L.players.filter(p=>p.id!==L.host.id).sort((a,b)=>(b.sat||0)-(a.sat||0));if(!order.length)break;L.players.splice(seatOf(L,order[0].id),1)}
    if(d.loc!=null)L.loc=Math.max(1,Math.min(12,d.loc|0||L.loc));
    if(d.standsOff!=null)L.standsOff=!!d.standsOff;if(d.free!=null){L.free=!!d.free;if(L.free)L.ticket=0}
    if(d.ticket!=null){L.ticket=Math.max(0,Math.min(50,d.ticket|0));if(L.ticket>0||d.free==null)L.free=false}if(L.standsOff){L.ticket=0;L.free=false}
    if(d.abandon!=null&&!L.ranked)L.abandon=d.abandon==='fate'?'fate':'cpu';
    if(d.night!=null)L.night=!!d.night; /* v0.91: the night match — display only, never in the rules or the hash */
    if(d.autoBal!=null&&!L.ranked)L.autoBal=!!d.autoBal;
    if(L.team&&d.teams!=null){const t=Math.max(2,Math.min(TEAM_KEYS.length,L.seats,d.teams|0||2));if(t!==L.teams){L.teams=t;reset=true}}
    if(L.team){const keys=teamKeys(L);for(const p of L.players)if(!keys.includes(p.team)){delete p.team;p.team=leanTeam(L)}}
    if(reset)for(const p of L.players)p.ready=false;countCheck(L);return ''}
  /* a seated player picks a team (Custom); the host may move anyone; Ranked teams are balanced at the horns */
  function roomTeam(L,by,who,team){if(!L.team)return 'Not a team event.';if(L.status!=='waiting')return 'Already under way.';if(L.ranked)return 'Ranked teams are balanced when the horns sound.';
    if(by!==who&&L.host.id!==by)return 'Only the host moves other lanistas.';const p=L.players[seatOf(L,who)];if(!p)return 'Sit down first.';if(!teamKeys(L).includes(team))return 'No such team.';p.team=team;p.ready=false;countCheck(L);return ''}
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
  function quickPick(list,group,ev,ranked,flag,now,inf){const ok=list.filter(L=>L.status==='waiting'&&L.ev===ev&&!!L.ranked===!!ranked&&!!L.flag===!!flag&&!!L.inf===!!inf&&
      !group.some(w=>memberOf(L,w.id))&&group.every(w=>!canJoin(L,w,now))&&(L.members||[]).length+group.length<=ROOM_MAX&&L.seats-L.players.length>=group.length);
    return ok.sort((a,b)=>humansOf(b).length-humansOf(a).length||(a.created||0)-(b.created||0))[0]||null}
  /* the horns: Ranked (and Custom with auto-balance) team rooms balance; members without a seat leave the room. Returns their ids. */
  function startRoom(L){if(L.team&&(L.ranked||L.autoBal))autoBalance(L);const out=(L.members||[]).filter(m=>seatOf(L,m.id)<0).map(m=>m.id);L.members=(L.members||[]).filter(m=>seatOf(L,m.id)>=0);L.unseated=out;return out}
  /* a lobby row for lists: no kits, looks, chat or bets — the room's own members get the whole room */
  function liteRow(L){const y={...L};for(const k of ['chat','bets','seed','kicked','cry','invited'])delete y[k];
    y.players=(L.players||[]).map(p=>({id:p.id,name:p.name,rank:p.rank,ready:!!p.ready,cls:p.kit&&p.kit.cls||null,...(p.team?{team:p.team}:{}),...(p.party?{party:p.party}:{}),...(p.domus?{domus:p.domus}:{})}));
    y.members=(L.members||[]).map(m=>({id:m.id,name:m.name,rank:m.rank,...(m.domus?{domus:m.domus}:{})}));delete y.invited;y.stands=(L.stands||[]).map(s=>({id:s.id,name:s.name,...(s.domus?{domus:s.domus}:{}),...(s.pass?{pass:1}:{})}));y.lite=1;return y}
  /* QUICK CHAT: phrases only, sent as codes (no text from players anywhere online) */
  const QC={room:['ave','ready','wait','horns','swap','seat','luck','vale'],after:['well','again','vale'],match:['truce','struck','mercy','ha'],forum:['ave','anyc','anyf','ranked','well','vale']};
  const QC_TEXT={ave:'Ave!',ready:'✓ Ready',wait:'⏳ 2 min',horns:'▶ Sound the horns?',swap:'⇄ Swap teams?',seat:'🪑 One more seat?',luck:'Good luck',vale:'Vale',
    well:'Well fought',again:'⚔ Again?',truce:'Truce?',struck:'Well struck!',mercy:'Mercy!',ha:'Ha!',anyc:'⚔ Anyone for Classic?',anyf:'👥 Anyone for Familia?',ranked:'🏅 Ranked, anyone?'};
  const phraseOK=(scope,q)=>(QC[scope]||[]).includes(q);
  /* limits: a phrase each 3 s (room/match), a Forum phrase each 10 s, 3 calls a room 2 minutes apart, invites, the daily Forum push meter */
  const RATE={say:3000,forum:10000,cryMax:3,cryGap:120000,invGap:4000,invSame:120000,invHour:15,fanCap:40,meterDay:100000};
  /* presence: a browser's IANA time zone (the map's only location — no IP addresses), and the landing's counts */
  function cleanTz(tz){tz=String(tz||'');return /^[A-Za-z_]{2,20}(\/[A-Za-z0-9_+\-]{1,24}){0,2}$/.test(tz)?tz:''}
  /* here = [{id,match,tz}], rooms = the lobby list, guests = [{tz}] (v0.82) → {n, fight, wait, zones:{tz:count}, guests, gzones:{tz:count}} */
  function hereSummary(here,rooms,guests){const waiting=new Set();for(const L of rooms||[])if(L.status==='waiting')for(const m of (L.members||L.players||[]))waiting.add(m.id);
    const out={n:here.length,fight:0,wait:0,zones:{}};for(const h of here){if(h.match)out.fight++;else if(waiting.has(h.id))out.wait++;const z=cleanTz(h.tz);if(z)out.zones[z]=(out.zones[z]||0)+1}
    out.guests=(guests||[]).length;out.gzones={};for(const g of guests||[]){const z=cleanTz(g.tz);if(z)out.gzones[z]=(out.gzones[z]||0)+1}return out}
  /* ── v0.82 DOMUS: the online ludus. A house name: 3–24 letters after cleanName, word-filtered; unique case-insensitively (the server
     keeps DNAME#<domusKey>). The record mirrors its gladiators' results. ── */
  const DOMUS_MIN=3, DOMUS_MAX=24;
  function domusWhy(s){const n=String(s||'').replace(/[<>&"'`\\]/g,'').replace(/\s+/g,' ').trim();if(n.length<DOMUS_MIN||n.length>DOMUS_MAX)return `House name: ${DOMUS_MIN}–${DOMUS_MAX} letters.`;if(nameBad(n))return 'Pick another name for your house.';return ''}
  const domusKey=s=>cleanName(s).toLowerCase();
  function newDomus(name,owner,id,now){const why=domusWhy(name);if(why)throw new Error(why);return {id,owner,name:cleanName(name),founded:now,bouts:0,wins:0,survived:0,fallen:0,lifeCF:0,glads:0,archived:false,v:VER}}
  /* one gladiator's settled result into the house record (out = applyResult's answer) */
  function domusNote(D,row,out,ranked){D.bouts=(D.bouts|0)+1;if(row&&row.won)D.wins=(D.wins|0)+1;D.lifeCF=(D.lifeCF|0)+((out&&out.cf)|0);
    if(out&&out.died)D.fallen=(D.fallen|0)+1;else if(ranked)D.survived=(D.survived|0)+1;return D}
  /* the house record built from gladiators made before houses existed (no data lost) */
  function domusFromChars(D,chars){for(const c of chars||[]){D.bouts=(D.bouts|0)+(c.bouts|0);D.wins=(D.wins|0)+(c.wins|0);D.survived=(D.survived|0)+(c.survived|0);D.lifeCF=(D.lifeCF|0)+(c.lifeCF|0);if(!c.alive)D.fallen=(D.fallen|0)+1}D.glads=(D.glads|0)+(chars||[]).length;return D}
  const domusRow=D=>D?{id:D.id,name:D.name,founded:D.founded,bouts:D.bouts|0,wins:D.wins|0,survived:D.survived|0,fallen:D.fallen|0,lifeCF:D.lifeCF|0,glads:D.glads|0,
    fame:D.fame|0,passDay:D.passDay||null,treasury:D.treasury|0,trophyN:(D.trophies||[]).length,gifts:(D.gifts||[]).length,offers:(D.offers||[]).length,...(D.test?{test:true}:{}),...(D.patron&&Object.keys(D.patron).length?{patron:D.patron}:{})}:null;
  /* the house's PATRON (the face in the stands): plain short values only (skin, hair, hat, beard, tunic, mantle, cushion colours…), ≤16 keys, ≤1 KB */
  function cleanPatron(P){const out={};if(!P||typeof P!=='object'||Array.isArray(P))return out;let n=0;
    for(const [k,v] of Object.entries(P)){if(++n>16)break;if(!/^[a-zA-Z0-9_]{1,16}$/.test(k))continue;
      const x=typeof v==='boolean'?v:typeof v==='number'&&isFinite(v)?Math.round(v*1000)/1000:typeof v==='string'?v.replace(/[<>"'`\\]/g,'').slice(0,40):undefined;if(x!==undefined)out[k]=x}
    return JSON.stringify(out).length>1000?{}:out}
  /* ── v0.82 THE STOREROOM: every piece a house owns sits with one of its gladiators (ch.gear) or in the house itself (D.gear).
     A piece moves between them (domus.move) and is ticked to bring or not (domus.equip) — never for a gladiator seated in a waiting
     room or a live match. A gladiator may carry only what its rank may buy (market level ≤ rank's mkt); one copy of a non-stacking piece. ── */
  const isGlad=x=>!!(x&&x.cls&&x.owner);
  /* v0.83: a piece is 'key' (printed, whole, no history), 'key#uid' (printed with a state or a history: holder.pcs[uid]) or 'nw#uid'
     (a named weapon; its def in holder.pcs[uid].w). Moves carry the pcs entry. Named pieces go only to a Veteranus or above. */
  function gearMoveWhy(src,dst,item,catalog){const P=src&&(src.gear||[]).includes(item)?pieceOf(src,item,catalog):null;if(!src||!(src.gear||[]).includes(item))return 'That piece is not there.';if(!P)return 'No such piece.';if(!dst||src===dst)return 'Pick where it goes.';
    if(isGlad(src)&&!src.alive)return 'The dead keep what they fell with.';
    if(isGlad(dst)){if(!dst.alive)return 'The dead carry nothing.';const R=rankFor(dst);if(P.lv>R.mkt)return P.named?'Named pieces wait in the Storeroom until Veteranus.':`A ${R.n} may carry up to level ${R.mkt}.`;
      if(!P.stack&&!P.named&&(dst.gear||[]).some(g=>itemBase(g)===P.base))return 'They already have one.'}return ''}
  function gearMove(src,dst,item,catalog){const why=gearMoveWhy(src,dst,item,catalog);if(why)throw new Error(why);
    const T=takePiece(src,item);putPiece(dst,T,isGlad(dst)&&!wearWhy(dst,item,T.pc));return {src,dst}}
  /* tick / untick one piece to bring (one copy); a broken piece or (below Veteranus) a named one cannot be brought */
  function gearEquip(ch,item,on){if(!ch.alive)throw new Error('The dead stay as they fell.');const eq=equipOf(ch);const have=(ch.gear||[]).filter(k=>k===item).length,inEq=eq.filter(k=>k===item).length;
    if(!have)throw new Error('That piece is not theirs.');if(on){const why=wearWhy(ch,item);if(why)throw new Error(why)}if(on&&inEq<have){/* v0.84: ticking a piece unticks whatever shares its equip point */const ok=armFit(ch,[item,...eq],catNow());const kept=eq.filter((x,k)=>ok[k+1]);eq.length=0;eq.push(...kept,item)}else if(!on&&inEq){eq.splice(eq.indexOf(item),1)}ch.equip=eq;return ch}
  /* ── v0.82 GUESTS: a connection without sign-in may only look (these requests), for 2 hours from its first connect ── */
  const GUEST_MS=2*3600e3, GUEST_OK=['auction.list','hello','auth.guest','lobby.list','match.watch','match.unwatch','match.get','match.snapreq','forum.get','hall.list','world.news','domus.profile','wager.list']; /* v0.83: house pages and the open pots too */;
  /* ── v0.82 STANDS GROUP TURN: once a rotation every ticket holder picks ONE action in private; the server applies all picks as one
     input. A thrown stone / offering is LOCKED to its tile (r,c on the 13×13 board). ── */
  const STANDS_MS=20000, STANDS_ACTS=['pass','stone','offer','tholo','move','cheer'];
  function standsPickOK(p){if(!p||typeof p!=='object'||Array.isArray(p))return 'Pick an action.';if(JSON.stringify(p).length>600)return 'That pick is too large.';
    if(!STANDS_ACTS.includes(p.a))return 'No such action from the stands.';
    if(p.a==='stone'||p.a==='offer'){if(!Number.isInteger(p.r)||!Number.isInteger(p.c)||p.r<0||p.r>12||p.c<0||p.c>12)return 'Throw at a tile.'}return ''}
  function cleanPick(p){const o={a:p.a};for(const k of ['r','c','seat','sec','v','tok'])if(p[k]!=null&&(typeof p[k]==='number'||typeof p[k]==='string'))o[k]=typeof p[k]==='string'?p[k].slice(0,24):p[k];return o}
  /* a seat in the stands: bought before the horns, never by a fighter of this game; the price goes into the wager pot (a free seat: 0) */
  function standsSeatWhy(L,who){if(L.standsOff||(!(L.ticket>0)&&!L.free))return 'This game sells no tickets.';if(L.status!=='waiting')return 'Tickets are sold until the horns.';
    if(L.players.some(p=>p.id===who))return 'Fighters take the sand, not the stands.';if((L.stands||[]).some(s=>s.id===who))return 'You already hold a ticket.';
    if((L.stands||[]).length>=STANDS_MAX)return 'The stands are sold out.';return ''}
  /* v0.87 the stands act only for ticket holders who are not fighters of this match (a fallen fighter may watch, never throw):
     M = the match meta {specs:[acct], players:[acct], dropped, abandoned} (or a lobby: stands [{id}], players [{id}]) */
  const FELL_WATCH='You fell in this match — you can watch, not throw.';
  function standsHolders(M){const fx=new Set((M.players||[]).map(p=>typeof p==='string'?p:p&&p.id));const sp=(M.specs||(M.stands||[]).map(t=>t.id)||[]);
    return sp.filter(a=>a&&!fx.has(a)&&!(M.dropped||{})[a]&&!(M.abandoned||{})[a])}
  function ticketOK(L,who,wallet){const why=standsSeatWhy(L,who);if(why)return why;if((wallet|0)<(L.ticket|0))return `A ticket costs ${L.ticket} coin.`;return ''}
  /* 🎟 Flavius's guest pass: once a UTC day for each house (lastDay = the house's last pass day), only while the active gladiator's wallet
     is under PASS.wallet, a free seat in a waiting room that sells seats (any price, or free) and has room in the stands */
  const PASS={wallet:15,fame:1};
  function passOK(L,who,wallet,lastDay,day){if((wallet|0)>=PASS.wallet)return `The guest pass is for thin purses — under ${PASS.wallet} coin.`;
    if(lastDay&&lastDay===day)return 'One guest pass a day for each house — come back tomorrow.';return standsSeatWhy(L,who)}
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
  /* v0.83 extra fields (every client computes them from the same lockstep state): brk = engine keys of the pieces this seat BROUGHT and no
     longer holds at the end (→ broken, Ranked survivors); off = the brought offerings still in hand; ks = the seat that eliminated it (-1 none);
     kb = how it went out: g gladiator · b beast · a the arena · r retired · '' still standing; thumb = spared by the Thumb of Flavius */
  const KEY_RE=/^[A-Za-z0-9_.\-]{1,60}$/;
  function cleanRow(r){r=r||{};const ks=Number.isInteger(r.ks)&&r.ks>=0&&r.ks<16?r.ks:-1;
    return {seat:r.seat|0,won:!!r.won,place:Math.max(1,Math.min(8,r.place|0||4)),f:Math.max(0,Math.min(400,r.f|0)),coin:Math.max(0,Math.min(200,r.coin|0)),kills:Math.max(0,Math.min(20,r.kills|0)),survives:r.survives!==false,
      slew:Array.isArray(r.slew)?[...new Set(r.slew.filter(x=>x==='commodus'||x==='tholo'))].sort():[],
      brk:Array.isArray(r.brk)?r.brk.filter(k=>typeof k==='string'&&KEY_RE.test(k)).slice(0,16).sort():[],
      off:Array.isArray(r.off)?r.off.filter(k=>OFFERS83.includes(k)).slice(0,OFF_CARRY).sort():[],ks,kb:['g','b','a','r'].includes(r.kb)?r.kb:'',thumb:!!r.thumb,cpu:!!r.cpu}}
  function cleanTable(t){return (Array.isArray(t)?t:[]).slice(0,8).map(cleanRow).sort((a,b)=>a.seat-b.seat)}
  function agree(reports){const ids=Object.keys(reports);if(!ids.length)return {table:null,void:true,minority:[]};
    const key=r=>JSON.stringify(cleanTable(r.table))+'|'+String(r.hash||'');const groups={};for(const a of ids){const k=key(reports[a]);(groups[k]=groups[k]||[]).push(a)}
    const best=Object.entries(groups).sort((x,y)=>y[1].length-x[1].length)[0];
    if(ids.length===1)return {table:cleanTable(reports[ids[0]].table),void:false,minority:[],unverified:true};
    if(best[1].length*2>ids.length)return {table:cleanTable(reports[best[1][0]].table),void:false,minority:ids.filter(a=>!best[1].includes(a))};
    return {table:null,void:true,minority:ids}}
  /* ── v0.80 Today in the arena: one record a UTC day (WORLD DAY#yyyy-mm-dd) — wins = the most CF in one match, fallen = Ranked deaths
     (Damnatio too) best rank first, upsets = a lower rank beating a higher one. Each entry keeps the face/token (look), the event and the
     outcome; the record stays under DAY_MAX bytes (faces leave from the tail first). ── */
  const DAY_KEEP={wins:5,fallen:5,upsets:4},DAY_MAX=14000;const ACTA_KEEP=10;
  /* v0.85 THE ONLINE DAY turns at 20:00 New York time (America/New_York, DST-aware by the US rule: EDT from the second Sunday of March
     02:00 EST = 07:00 UTC to the first Sunday of November 02:00 EDT = 06:00 UTC) — Today (WORLD DAY#), the Forum reset, the guest pass and
     the Victor of the Day all follow it. nyBehind(t) = hours New York is behind UTC at t; dayStart(t) = the last 20:00 New York at or before t
     (00:00 UTC in summer, 01:00 UTC in winter); dayKey(t) = the UTC date of that start ('yyyy-mm-dd' — the New York date the online day
     mostly covers; in summer it equals the old UTC-day key, so old DAY# items still read); dayPrevKey(t) = the online day before. No libraries. */
  function nyBehind(t){const y=new Date(t).getUTCFullYear();const sun=(m,n)=>{const d=new Date(Date.UTC(y,m,1)).getUTCDay();return 1+((7-d)%7)+7*(n-1)};
    const a=Date.UTC(y,2,sun(2,2),7),b=Date.UTC(y,10,sun(10,1),6);return t>=a&&t<b?4:5}
  function dayStart(t){t=+t||0;const L=new Date(t-nyBehind(t)*36e5);const d=L.getUTCDate()-(L.getUTCHours()<20?1:0);
    const base=Date.UTC(L.getUTCFullYear(),L.getUTCMonth(),d,20);const s=base+4*36e5;return nyBehind(s)===4?s:base+5*36e5}
  function dayKey(t){return new Date(dayStart(t)).toISOString().slice(0,10)}
  const dayPrevKey=t=>dayKey(dayStart(t)-1);
  /* the Forum's day: lines since the day turned, and those of the last 30 minutes linger past the turn */
  const FORUM_GRACE=18e5;const forumSince=t=>Math.min(dayStart(t),(+t||0)-FORUM_GRACE);
  function dayWho(ch,rank){return {name:ch.name,cls:ch.cls,rank:rank||rankFor(ch).k,look:cleanLook(ch.look),bouts:ch.bouts|0,wins:ch.wins|0,survived:ch.survived|0,lifeCF:ch.lifeCF|0,...(ch.domus?{dom:ch.domus}:{})}}
  function dayLite(ch,rank){const L=cleanLook(ch.look);return {name:ch.name,cls:ch.cls,rank:rank||rankFor(ch).k,look:L.token?{token:L.token,color:L.color}:{}}}
  const DAY_SORT={wins:(a,b)=>b.cf-a.cf||a.at-b.at,fallen:(a,b)=>rankIdx(b.rank)-rankIdx(a.rank)||(b.lifeCF|0)-(a.lifeCF|0)||a.at-b.at,
    upsets:(a,b)=>b.gap-a.gap||rankIdx(b.l.rank)-rankIdx(a.l.rank)||a.at-b.at};
  function dayNote(D,kind,e){D=D||{};D[kind]=(D[kind]||[]).filter(x=>x.key!==e.key).concat([e]).sort(DAY_SORT[kind]).slice(0,DAY_KEEP[kind]);return D}
  function daySlim(D){const faces=[];for(let i=DAY_KEEP.wins;i>=0;i--)for(const k of ['upsets','fallen','wins']){const e=(D[k]||[])[i];if(e)faces.push(...(k==='upsets'?[e.l,e.w]:[e]))}
    for(const cut of ['portrait','look'])for(const f of faces){if(JSON.stringify(D).length<=DAY_MAX)return D;if(f&&f.look){if(cut==='portrait')delete f.look.portrait;else f.look={}}}return D}
  /* a settled match: m = {id,ev,loc,at,ranked,void,seats:[{acct,ch (after the result),before (rank key at the horns),row,out}]} (abandoned seats left out) */
  /* v0.85 the showcases: a win keeps the coin earned (the award, house cut included); a fall keeps what died with him — the value of
     the pieces he brought (gx.carried from gearAfter, else the kit's items, else what he would bring — equipOf0 — read before they leave) and his purse,
     plus who or what killed him (kb: g gladiator · b beast · a arena · r rules; kn = the killing gladiator's name) */
  function dayLost(s){const ch=s.ch||{};const cat=catNow();let ps=s.gx&&Array.isArray(s.gx.carried)?s.gx.carried:null;
    if(!ps)ps=((s.kit&&s.kit.items)||equipOf0(ch)).map(it=>({item:it,pc:pcOf(ch,it)}));
    let g=0;for(const P of ps)try{g+=valueOf(pieceInfo(P,cat))}catch(e){}return {gear:Math.max(0,g|0),purse:Math.max(0,ch.wallet|0)}}
  function dayFromMatch(D,m){D=D||{};if(m.void)return D;const hs=(m.seats||[]).filter(s=>s&&s.ch&&s.row);const base={at:m.at,ev:m.ev,loc:m.loc,ranked:!!m.ranked};
    for(const s of hs){if(s.row.won&&(s.row.f|0)>0)dayNote(D,'wins',{key:m.id+'#'+s.acct,...base,...dayWho(s.ch,s.before),cf:s.row.f|0,coin:Math.max(0,(s.out&&(s.out.award!=null?s.out.award:s.out.pay))|0)});
      if(s.out&&s.out.died){const kb=['g','b','a','r'].includes(s.row.kb)?s.row.kb:'';const k=kb==='g'?hs.find(z=>z!==s&&z.seat!=null&&z.seat===s.row.ks):null;
        dayNote(D,'fallen',{key:m.id+'#'+s.acct,...base,...dayWho(s.ch,s.before),how:'fate',hall:!!s.out.hall,cf:s.row.f|0,...dayLost(s),...(kb?{kb}:{}),...(k&&k.ch?{kn:String(k.ch.name||'').slice(0,40)}:{})})}}
    for(const w of hs.filter(s=>s.row.won)){const l=hs.filter(s=>!s.row.won&&rankIdx(s.before)>rankIdx(w.before)).sort((a,b)=>rankIdx(b.before)-rankIdx(a.before))[0];
      if(l)dayNote(D,'upsets',{key:m.id+'#'+w.acct,...base,gap:rankIdx(l.before)-rankIdx(w.before),w:dayLite(w.ch,w.before),l:{...dayLite(l.ch,l.before),fell:!!(l.out&&l.out.died)}})}
    /* v0.87 the Acta of the day: one line per settled match, newest first (the top winner, how many fell) */
    {const win=hs.filter(s=>s.row.won).sort((a,b)=>(b.row.f|0)-(a.row.f|0));const W=win[0];const prev=(D.acta||[]).find(x=>x.id===m.id);
      actaPut(D,{id:m.id,...base,cf:W?W.row.f|0:0,wn:win.length,fell:hs.filter(s=>s.out&&s.out.died).length+(prev&&prev.pre?prev.fell|0:0),
        w:W?{name:String(W.ch.name||'').slice(0,40),cls:W.ch.cls,...(W.ch.domus?{dom:W.ch.domus}:{})}:null})}
    return daySlim(D)}
  function actaPut(D,e){D.acta=[e,...(D.acta||[]).filter(x=>x.id!==e.id)].sort((a,b)=>(b.at|0)-(a.at|0)).slice(0,ACTA_KEEP);return D}
  /* a Ranked gladiator abandoned the sand: Damnatio */
  function dayFell(D,m){D=D||{};const pa=(D.acta||[]).find(x=>x.id===m.id);if(pa)pa.fell=(pa.fell|0)+1;else actaPut(D,{id:m.id,at:m.at,ev:m.ev,loc:m.loc,ranked:true,cf:0,wn:0,fell:1,w:null,pre:1});
    return daySlim(dayNote(D,'fallen',{key:m.id+'#'+m.acct,at:m.at,ev:m.ev,loc:m.loc,ranked:true,...dayWho(m.ch,m.before),how:m.how||'damnatio',hall:!!m.hall,cf:0,...dayLost(m)}))}
  /* the landing's showcases (v0.85): the biggest winner = the most CF in one match (wins[0]); the biggest loser = the best-ranked
     gladiator who fell in Ranked (fallen[0]) — both already sorted that way (DAY_SORT), so every screen picks the same two */
  const dayBest=T=>({winner:((T&&T.wins)||[])[0]||null,loser:((T&&T.fallen)||[]).find(e=>e&&e.ranked!==false)||null});
  const dayHas=D=>!!D&&['wins','fallen','upsets','acta'].some(k=>(D[k]||[]).length);
  function dayOut(D,day){D=D||{};return {day,wins:D.wins||[],fallen:D.fallen||[],upsets:D.upsets||[],acta:D.acta||[]}}
  /* weekly challenges rotate with the week of the year */
  const CHALLENGES=[['Survive 3 ranked bouts',3,'survived'],['Earn 60 CF in one bout',60,'cf1'],['Win a bout at Capua',1,'win:3'],['Slay 5 beasts',5,'beasts'],['Finish 5 bouts',5,'bouts'],['Win with 20+ coin left',1,'rich']];
  function weekChallenges(t){const wk=Math.floor((t||0)/604800000);const out=[];for(let i=0;i<3;i++)out.push(CHALLENGES[(wk+i*2)%CHALLENGES.length]);return out}
  /* ══════════════════════ v0.83 (protocol 6) ══════════════════════ */
  const TREASURY_CUT=0.2, GIFT_EVERY=5, GIFT_KEEP=20, COUNTDOWN_MS=10000, LOOT_MS=90000, FOLLOW_MAX=100, TROPHY_MAX=60, RECENT_KEEP=10, INFAMES_MIN='veteranus';
  const canWearNamed=ch=>rankIdx(rankFor(ch).k)>=rankIdx('veteranus');
  /* ── ARMORY OFFERINGS: the printed Blessings a gladiator may buy and carry (never Spiders or the Curse). ≤OFF_MAX in the satchel
     (ch.offers), ≤OFF_CARRY brought (ch.offerEq; absent = the first two). They enter the match in the hand; unused ones come back
     to a survivor, used ones are gone; a Ranked death loses them all. ── */
  const PRICE_OFF={elix2:40,ap2:40,merc1:40,cf1:40,elix4:120,ap3:120,merc2:120,cf2:120};
  const OFFERS83=Object.keys(PRICE_OFF), OFF_CARRY=2, OFF_MAX=10;
  function offersBrought(ch){const have=(ch&&ch.offers||[]).slice();const want=Array.isArray(ch&&ch.offerEq)?ch.offerEq:have.slice();const out=[];
    for(const k of want){if(out.length>=OFF_CARRY)break;const i=have.indexOf(k);if(i>=0){out.push(k);have.splice(i,1)}}return out}
  function offerBuyWhy(ch,k){if(!ch||!ch.alive)return 'The dead buy nothing.';if(!OFFERS83.includes(k))return 'Flavius’s armory does not sell that.';
    if((ch.offers||[]).length>=OFF_MAX)return `Up to ${OFF_MAX} offerings in the satchel.`;if((ch.wallet|0)<PRICE_OFF[k])return `Costs ${PRICE_OFF[k]} coin.`;return ''}
  function offerBuy(ch,k){const why=offerBuyWhy(ch,k);if(why)throw new Error(why);ch.wallet-=PRICE_OFF[k];ch.offers=[...(ch.offers||[]),k];return ch}
  function offerBring(ch,keys){if(!ch.alive)throw new Error('The dead stay as they fell.');if(!Array.isArray(keys))throw new Error('Pick the offerings to bring.');
    if(keys.length>OFF_CARRY)throw new Error(`Bring at most ${OFF_CARRY} offerings.`);const have=(ch.offers||[]).slice();const eq=[];
    for(const k of keys){const i=have.indexOf(k);if(i<0)throw new Error('That offering is not in the satchel.');eq.push(k);have.splice(i,1)}ch.offerEq=eq;return ch}
  /* ── PIECES: 'key' | 'key#uid' | 'nw#uid' (see gearMoveWhy). holder.pcs[uid] = {st:'whole'|'broken', hist:[{house,glad,when,how}], w?:def, rar?} ── */
  const NAMED='nw', L4_PRICE=1500, HIST_KEEP=12;
  const RARITY=[{k:'common',n:'Common',mult:1,aff:0},{k:'rare',n:'Rare',mult:2,aff:1},{k:'epic',n:'Epic',mult:4,aff:2},{k:'legendary',n:'Legendary',mult:8,aff:2,uq:1}];
  const rarOf=k=>RARITY.find(r=>r.k===k)||RARITY[0];
  const itemBase=it=>String(it||'').split('#')[0];
  const itemUid=it=>{const s=String(it||'');const i=s.indexOf('#');return i<0?null:s.slice(i+1)};
  const isNamed=it=>{const b=itemBase(it);return b===NAMED||b==='na'}; /* v0.84: 'na#uid' = a named ARMOR piece */
  const engineKey=it=>isNamed(it)?itemBase(it)+'_'+itemUid(it):itemBase(it);
  const pcOf=(h,it)=>{const u=itemUid(it);return u&&h&&h.pcs&&h.pcs[u]||null};
  const isBroken=(h,it)=>{const p=pcOf(h,it);return !!(p&&p.st==='broken')};
  function newUid(h){const n=(h.pcsN=(h.pcsN|0)+1);return String(h.id||'x').replace(/[^A-Za-z0-9_-]/g,'').slice(-24)+'.'+n.toString(36)}
  /* what a piece is: {item, base, key (engine), named, kind, lv, n, ap, stack, st, hist, rar, w, val} — P = {item, pc} */
  function pieceInfo(P,catalog){if(!P||!P.item)return null;const it=P.item,pc=P.pc||{},base=itemBase(it);
    if(base===NAMED||base==='na'){const w=pc.w||{};const R=rarOf(pc.rar||w.rar);const A=base==='na';return {item:it,base,key:engineKey(it),named:true,kind:A?'a':'w',lv:4,n:w.n||(A?'Named armor':'Named weapon'),...(A?{ap:w.ap|0}:{}),stack:false,st:pc.st||'whole',hist:pc.hist||[],rar:R.k,w,val:L4_PRICE*R.mult}}
    const c=(catalog||{})[base];if(!c)return null;return {item:it,base,key:base,named:false,kind:c.kind,lv:c.lv,n:c.n,ap:c.ap,stack:!!c.stack,st:pc.st||'whole',hist:pc.hist||[],val:priceOf(c)}}
  const pieceOf=(h,it,catalog)=>pieceInfo({item:it,pc:pcOf(h,it)},catalog);
  const valueOf=I=>I?I.val|0:0;
  const repairCost=I=>Math.ceil(valueOf(I)/3);
  /* a used piece in the market: its catalog price, two thirds when broken (named pieces are never sold) */
  const usedPrice=I=>I&&!I.named?(I.st==='broken'?Math.round(I.val*2/3):I.val):0;
  /* '' or why this gladiator cannot bring it (pc: the piece's entry when it is not held yet) */
  function wearWhy(ch,it,pc){const p=pc!==undefined?pc:pcOf(ch,it);if(p&&p.st==='broken')return 'Broken — repair it first.';
    if(isNamed(it)&&isGlad(ch)&&!canWearNamed(ch))return 'Named pieces wait in the Storeroom until Veteranus.';return ''}
  function takePiece(h,it){const g=(h.gear||[]).slice();const i=g.indexOf(it);if(i<0)return null;g.splice(i,1);h.gear=g;
    if(Array.isArray(h.equip)){const e=h.equip.slice();const j=e.indexOf(it);if(j>=0)e.splice(j,1);h.equip=e}
    const u=itemUid(it);let pc=null;if(u&&h.pcs&&h.pcs[u]){pc=h.pcs[u];const y={...h.pcs};delete y[u];h.pcs=y}return {item:it,pc}}
  function putPiece(h,P,tick){h.gear=[...(h.gear||[]),P.item];const u=itemUid(P.item);if(u&&P.pc)h.pcs={...(h.pcs||{}),[u]:P.pc};if(tick&&Array.isArray(h.equip))h.equip=[...h.equip,P.item];return h}
  /* a plain printed piece gets its own uid (to carry a state or a history) */
  function tagPiece(P,h){if(itemUid(P.item))return P;const u=newUid(h);return {item:P.item+'#'+u,pc:P.pc||{st:'whole'}}}
  function histAdd(P,e){P.pc={...(P.pc||{st:'whole'}),hist:[...((P.pc&&P.pc.hist)||[]),e].slice(-HIST_KEEP)};return P}
  /* break one held piece (it leaves the bring list); returns its new item id */
  function breakItem(h,it){if(!(h.gear||[]).includes(it))return null;let T=takePiece(h,it);T=tagPiece(T,h);T.pc={...(T.pc||{}),st:'broken'};putPiece(h,T,false);return T.item}
  function repairItem(h,it){const u=itemUid(it);if(!u||!h.pcs||!h.pcs[u]||h.pcs[u].st!=='broken')throw new Error('That piece is whole.');h.pcs={...h.pcs,[u]:{...h.pcs[u],st:'whole'}};return h}
  /* ── RANKED GEAR LOSS + offerings back, after applyResult. kit = the lobby seat's kit (what was brought).
     A survivor: brought offerings leave the satchel, those still in hand (row.off) come back; Ranked: pieces in row.brk break, the gift CF
     bonus is spent. A Ranked death: everything brought → {carried} (loot / market), everything else → {left} (the house Storeroom);
     the satchel and unopened gifts are lost. ── */
  function gearAfter(ch,kit,row,ranked){kit=kit||{};const items=kit.items||[],gear=kit.gear||[];const out={broken:[],gone:[],offBack:[],carried:[],left:[]};
    const brought=(kit.offer||[]).slice();const offs=(ch.offers||[]).slice();for(const k of brought){const i=offs.indexOf(k);if(i>=0)offs.splice(i,1)}
    if(ranked&&row&&row.survives===false){for(const it of items){if((ch.gear||[]).includes(it))out.carried.push(takePiece(ch,it))}
      for(const it of (ch.gear||[]).slice())out.left.push(takePiece(ch,it));out.offLeft=offs;out.gifts=giftsOut(ch);ch.offers=[];ch.offerEq=[];ch.cfb=0;return out}
    const back=(row&&row.off||[]).slice();for(const k of brought){const i=back.indexOf(k);if(i>=0){back.splice(i,1);offs.push(k);out.offBack.push(k)}}
    ch.offers=offs;if(Array.isArray(ch.offerEq)){const h=offs.slice();ch.offerEq=ch.offerEq.filter(k=>{const i=h.indexOf(k);if(i<0)return false;h.splice(i,1);return true})}
    if(ranked){const used=new Set();for(const k of (row&&row.brk)||[]){const j=gear.findIndex((g,i)=>g===k&&!used.has(i));if(j<0)continue;used.add(j);
        /* v0.91 (his call): a printed piece lost in a Ranked bout is used up — gone (buy another); a named piece comes back broken */
        if(isNamed(items[j])){const nit=breakItem(ch,items[j]);if(nit)out.broken.push(nit)}else if((ch.gear||[]).includes(items[j])){takePiece(ch,items[j]);out.gone.push(itemBase(items[j]))}}
      if(kit.cfb)ch.cfb=Math.max(0,(ch.cfb|0)-(kit.cfb|0))}
    out.gifts=giftsOut(ch);return out}
  /* ── v0.83 (his call): Flavius's gifts and the freebies belong to the DOMUS, not a gladiator. applyResult still names the gift on the
     gladiator (ch.gifts); gearAfter moves them out (out.gifts, each with the gladiator's name) and the settlement puts them on the house
     (giftsIn → D.gifts, ≤GIFT_HOUSE; D.giftsOpened keeps them from coming back). A Ranked death: the brought offerings die with him, the
     un-brought satchel goes onto the house shelf (out.offLeft → offersIn → D.offers, ≤OFF_SHELF; offerMove between shelf and satchels). ── */
  const GIFT_HOUSE=40, OFF_SHELF=30;
  function giftsOut(ch){const gs=((ch&&ch.gifts)||[]).map(g=>({...g,glad:g.glad||ch.name||null}));if(ch)ch.gifts=[];return gs}
  function giftsIn(D,gs){D.gifts=D.gifts||[];const done=D.giftsOpened||[];for(const g of gs||[]){if(!g||!g.id||D.gifts.length>=GIFT_HOUSE)continue;if(D.gifts.some(x=>x.id===g.id)||done.includes(g.id))continue;D.gifts.push(g)}return D}
  function offersIn(D,keys){D.offers=D.offers||[];let sold=0;for(const k of keys||[]){if(!OFFERS83.includes(k))continue;if(D.offers.length>=OFF_SHELF){sold+=Math.round(PRICE_OFF[k]/2);continue}D.offers=[...D.offers,k]}if(sold)D.treasury=(D.treasury|0)+sold;return D}
  /* one offering between the house shelf (D) and a gladiator's satchel (or two satchels) */
  function offerMoveWhy(src,dst,k){if(!src||!dst||src===dst)return 'Pick where it goes.';if(!(src.offers||[]).includes(k))return 'That offering is not there.';
    const cap=dst.cls?OFF_MAX:OFF_SHELF;if((dst.offers||[]).length>=cap)return dst.cls?`Up to ${OFF_MAX} offerings in the satchel.`:'The shelf is full.';return ''}
  function offerMove(src,dst,k){const why=offerMoveWhy(src,dst,k);if(why)throw new Error(why);const o=(src.offers||[]).slice();o.splice(o.indexOf(k),1);src.offers=o;
    if(Array.isArray(src.offerEq)){const h=o.slice();src.offerEq=src.offerEq.filter(x=>{const i=h.indexOf(x);if(i<0)return false;h.splice(i,1);return true})}dst.offers=[...(dst.offers||[]),k];return {src,dst}}
  /* a house gift opened with no living gladiator: coin → the treasury, a CF bonus → coin (CFB_COIN a point), offerings / gear / named → the shelf */
  const CFB_COIN=8;
  function applyGiftHouse(D,rw,P){if(rw.k==='coin'){D.treasury=(D.treasury|0)+(rw.v|0);return {to:'house'}}
    if(rw.k==='cf'){D.treasury=(D.treasury|0)+(rw.v|0)*CFB_COIN;return {to:'house',coin:(rw.v|0)*CFB_COIN}}
    if(rw.k==='off'){offersIn(D,[rw.key]);return {to:'house'}}
    if(rw.k==='gear'){putPiece(D,{item:rw.item,pc:null},false);return {to:'house'}}
    if(rw.k==='named'&&P){putPiece(D,P,false);return {to:'house'}}return {to:null}}
  /* the killer's pick when the window closes untaken: the most valuable (first on a tie) */
  function lootBest(pieces){let b=0;(pieces||[]).forEach((p,i)=>{if((p.val|0)>(pieces[b].val|0))b=i});return b}
  /* ── FLAVIUS'S GIFTS: one for every rank reached and every GIFT_EVERY Ranked bouts survived (ch.gifts [{id,why,at}], ≤GIFT_KEEP) ── */
  function giftAdd(ch,why,at){ch.gifts=ch.gifts||[];const id=String(ch.id||'g')+':'+why;if(ch.gifts.some(g=>g.id===id)||(ch.giftsOpened||[]).includes(id)||ch.gifts.length>=GIFT_KEEP)return null;const g={id,why,at};ch.gifts.push(g);return g}
  function giftTake(ch,id){const g=(ch.gifts||[]).find(x=>x.id===id);if(!g)throw new Error('No such gift.');ch.gifts=ch.gifts.filter(x=>x!==g);ch.giftsOpened=[...(ch.giftsOpened||[]),id].slice(-40);return g}
  /* the server's roll (rnd = server randomness): mostly coin; a CF bonus (extra STARTING CF next Ranked match, ≤CFB_MAX); an offering; L1 gear
     uncommon; L2/L3 rare; a named piece very rare (rarity by RAR_W) */
  const GIFT_W=[['coin',55],['cf',15],['off',15],['l1',9],['l23',4],['named',2]], RAR_W=[['common',50],['rare',30],['epic',15],['legendary',5]], CFB_MAX=12;
  const wpick=(rnd,tab)=>{const t=tab.reduce((a,x)=>a+x[1],0);let v=rnd()*t;for(const x of tab){if((v-=x[1])<0)return x[0]}return tab[tab.length-1][0]};
  const pick1=(rnd,arr)=>arr[Math.min(arr.length-1,Math.floor(rnd()*arr.length))];
  function rollGift(rnd,catalog,rank){const k=wpick(rnd,GIFT_W);const keys=lv=>Object.keys(catalog||{}).filter(x=>catalog[x].lv===lv).sort();
    if(k==='coin')return {k,v:Math.round((AWARD[rank]||AWARD.tiro)*(2+rnd()*3))};
    if(k==='cf')return {k,v:3+Math.floor(rnd()*4)};
    if(k==='off')return {k,key:rnd()<0.75?pick1(rnd,OFFERS83.filter(x=>PRICE_OFF[x]<100)):pick1(rnd,OFFERS83.filter(x=>PRICE_OFF[x]>=100))};
    if(k==='l1'||k==='l23'){const lv=k==='l1'?1:rnd()<0.7?2:3;const ks=keys(lv);if(!ks.length)return {k:'coin',v:20};return {k:'gear',item:pick1(rnd,ks),lv}}
    /* v0.84: the kind is drawn AFTER the rarity (the same randomness rolls the same rarity as v0.83) */
    const rar=wpick(rnd,RAR_W);return {k:'named',rar,kind:rnd()<NAMED_ARMOR_SHARE?'a':'w'}}
  /* a gift's reward into the gladiator (or, for a named piece below Veteranus, the house shelf D). P = the named piece {item,pc} when k is named. → {to} */
  function applyGift(ch,D,rw,P){if(rw.k==='coin'){ch.wallet=(ch.wallet|0)+(rw.v|0);return {to:'glad'}}
    if(rw.k==='cf'){ch.cfb=Math.min(CFB_MAX,(ch.cfb|0)+(rw.v|0));return {to:'glad'}}
    if(rw.k==='off'){if((ch.offers||[]).length>=OFF_MAX){ch.wallet=(ch.wallet|0)+Math.round(PRICE_OFF[rw.key]/2);return {to:'glad',sold:true}}ch.offers=[...(ch.offers||[]),rw.key];return {to:'glad'}}
    if(rw.k==='gear'){putPiece(ch,{item:rw.item,pc:null},!wearWhy(ch,rw.item,null));return {to:'glad'}}
    if(rw.k==='named'&&P){if(canWearNamed(ch)){putPiece(ch,P,true);return {to:'glad'}}if(D){putPiece(D,P,false);return {to:'house'}}putPiece(ch,P,false);return {to:'glad'}}return {to:null}}
  /* ── GENERATED NAMED WEAPONS (the server rolls; every client builds the same W entry from the def: ONL83 in 133) ──
     base = a printed market weapon (catalog stats); Common 0 affixes · Rare 1 · Epic 2 · Legendary 2 + one UNIQUE effect (one weapon each in
     the world: the server claims it). Caps: power ≤5, range ≤5. */
  const AFFIX={dmg:{n:'+1 damage',fits:w=>!w.shield&&w.p>0&&w.p<5,apply:w=>{w.p++;if(w.throw)w.throw={...w.throw,p:Math.min(5,w.throw.p+1)}}},
    rng:{n:'+1 range',fits:w=>!w.shield&&w.r>0&&w.r<5,apply:w=>{w.r++}},
    use:{n:'+1 use',fits:w=>w.ammo!=null||!!w.throw||!!w.shield||w.atkUses!=null,apply:w=>{if(w.ammo!=null)w.ammo++;else if(w.throw)w.throw={...w.throw,n:w.throw.n+1};else if(w.shield)w.uses++;else w.atkUses++}},
    pierce:{n:'armor-piercing 1',fits:w=>!w.shield&&!w.pierce,apply:w=>{w.pierce=1}},
    crowd:{n:'+1 CF a hit',fits:w=>!w.shield&&!w.cfw,apply:w=>{w.cfw=1}}};
  const AFFIX_ADJ={dmg:['Cruentus','Cruenta','Cruentum','Cruenti'],rng:['Longus','Longa','Longum','Longi'],use:['Perpetuus','Perpetua','Perpetuum','Perpetui'],pierce:['Acutus','Acuta','Acutum','Acuti'],crowd:['Gloriosus','Gloriosa','Gloriosum','Gloriosi']};
  const COMMON_ADJ=[['Fidus','Fida','Fidum','Fidi'],['Ferreus','Ferrea','Ferreum','Ferrei'],['Vetus','Vetus','Vetus','Veteres']];
  const GODS=['Martis','Iovis','Neptuni','Dianae','Herculis','Plutonis','Victoriae','Fortunae'];
  /* the unique effects (Legendary): k, the epithet in the name, what it does (engine hooks in 133-v83onl) */
  const UNIQUES=[
    {k:'sanguis',n:'Sanguinarius',d:'Each hit that draws blood from a gladiator heals the wielder 1 HP.'},
    {k:'gloria',n:'Gloriae',d:'+2 CF each time it hits a gladiator.'},
    {k:'fortuna',n:'Fortunatus',d:'+2 coin each time it hits a gladiator.'},
    {k:'ferox',n:'Ferox',d:'+1 damage against beasts.'},
    {k:'venator',n:'Venator',d:'+3 CF for every beast it slays.'},
    {k:'aegis',n:'Aegis',d:'While held, the first hit the wielder takes each rotation loses 1 damage.'},
    {k:'ultor',n:'Ultor',d:'+1 damage against the gladiator who last hit the wielder.'},
    {k:'messor',n:'Messor',d:'+3 CF each time it severs a limb.'},
    {k:'regius',n:'Regius',d:'While held, +1 CF at the start of each of the wielder’s turns.'},
    {k:'percussor',n:'Percussor',d:'Armor-piercing 2: up to 2 damage of each hit ignores AP.'}];
  const UNIQ_SHIELD=['aegis','regius'];
  const NOUN={gladius:['Gladius',0],mace:['Clava',1],sica:['Sica',1],hasta:['Hasta',1],stones:['Lapides',3],thracian:['Parma',1],knives:['Cultri',3],trident:['Tridens',0],rudis:['Rudis',1],
    axe:['Securis',1],falcata:['Falcata',1],bow:['Arcus',0],pugio:['Pugio',0],scissor:['Forfex',1],scutum:['Scutum',2],sling:['Funda',1],arcu:['Arcuballista',1],charun:['Malleus',0],
    flavgl:['Gladius',0],jade:['Lancea',1],flail:['Flagellum',2],pilum:['Pilum',2]};
  const W_FIELDS=['p','r','ammo','shield','absorb','uses','cfw','soul','both','atkUses','stones','img'];
  /* rar = rarity key; taken = unique keys already claimed (the server's WORLD UNIQ# items) → the def (no key yet: namedPiece adds it) */
  function rollNamed(rnd,catalog,rar,taken){const bases=Object.keys(catalog||{}).filter(k=>catalog[k].kind==='w'&&catalog[k].p!=null).sort();if(!bases.length)return null;
    const base=pick1(rnd,bases);const c=catalog[base];const w={base,lv:4};for(const f of W_FIELDS)if(c[f]!=null)w[f]=c[f];if(c.throw)w.throw={p:c.throw.p,r:c.throw.r,n:c.throw.n};
    let R=rarOf(rar);let uq=null;if(R.uq){const pool=UNIQUES.map(u=>u.k).filter(k=>(!w.shield||UNIQ_SHIELD.includes(k))&&!(taken||[]).includes(k));if(pool.length)uq=pick1(rnd,pool);else R=rarOf('epic')}
    const aff=[];for(let i=0;i<R.aff;i++){const ok=Object.keys(AFFIX).filter(k=>!aff.includes(k)&&AFFIX[k].fits(w));if(!ok.length)break;const k=pick1(rnd,ok);AFFIX[k].apply(w);aff.push(k)}
    const [noun,g]=NOUN[base]||[c.n,2];const adj=a=>a[g];let n=noun;
    if(R.k==='common')n+=' '+adj(pick1(rnd,COMMON_ADJ));else if(aff.length)n+=' '+adj(AFFIX_ADJ[aff[0]]);
    if(R.k==='epic')n+=' '+pick1(rnd,GODS);if(uq)n=noun+' '+UNIQUES.find(u=>u.k===uq).n;
    Object.assign(w,{n,rar:R.k,aff,...(uq?{uq}:{}),named83:1});return w}
  function namedPiece(w,h){const uid=newUid(h);const pre=w&&w.kind==='a'?'na':NAMED;return {item:pre+'#'+uid,pc:{st:'whole',rar:w.rar,w:{...w,key:pre+'_'+uid},hist:[]}}}
  /* a named def as a client builds it (defensive: numbers clamped, strings cleaned) */
  function cleanNamed(w){if(!w||typeof w!=='object')return null;const n=x=>Math.max(0,Math.min(12,x|0));const o={n:cleanName(w.n)||'Named weapon',base:String(w.base||'').replace(/[^a-z0-9_]/gi,'').slice(0,24),lv:4,
      key:String(w.key||'').replace(/[^A-Za-z0-9_.\-]/g,'').slice(0,64),p:Math.min(6,n(w.p)),r:Math.min(6,n(w.r)),img:Number.isInteger(w.img)?w.img:-1,rar:rarOf(w.rar).k,aff:Array.isArray(w.aff)?w.aff.filter(k=>AFFIX[k]).slice(0,3):[],named83:1};
    if(!/^nw_/.test(o.key))return null;if(w.ammo!=null)o.ammo=n(w.ammo);if(w.throw)o.throw={p:Math.min(6,n(w.throw.p)),r:Math.min(6,n(w.throw.r)),n:Math.max(1,n(w.throw.n))};
    if(w.shield){o.shield=1;o.absorb=Math.min(4,n(w.absorb));o.uses=Math.max(1,n(w.uses))}for(const f of ['cfw','soul','both','stones'])if(w[f])o[f]=1;if(w.atkUses!=null)o.atkUses=Math.max(1,n(w.atkUses));
    if(w.pierce)o.pierce=Math.min(2,n(w.pierce));if(w.uq&&UNIQUES.some(u=>u.k===w.uq))o.uq=w.uq;return o}
  /* ── START COUNTDOWN: the host's Start sets L.startAt = now + COUNTDOWN_MS and L.startSig = lineupSig(L); any line-up change
     (seats, teams, event, seat count, host) stops it (countCheck) ── */
  function lineupSig(L){return JSON.stringify([L.ev,L.seats,L.teams|0,!!L.ranked,L.host&&L.host.id,(L.players||[]).map(p=>[p.id,p.team||''])])}
  function stopCount(L){if(L.startAt!=null||L.startSig){L.startAt=null;L.startSig=null;L.startBy=null;return true}return false}
  function countCheck(L,force){if(L&&L.startAt!=null&&(force||L.startSig!==lineupSig(L)))return stopCount(L);return false}
  const countLeft=(L,now)=>L&&L.startAt!=null&&L.status==='waiting'?Math.max(0,L.startAt-(now||Date.now())):null;
  /* ── TROPHIES on the Domus: {k, n, at, glad, x (count, repeatable ones)} ── */
  const EV_N={democritus:'Democritus',egidious:'Egidious',cassian:'Cassian',familia:'Familia'};
  function trophyName(k){const [a,b]=String(k).split(':');if(a==='first')return `First Ranked win · ${EV_N[b]||b}`;if(a==='rank')return `${(RANKS.find(r=>r.k===b)||{n:b}).n} reached`;
    if(a==='slew')return b==='tholo'?'Slew Tholo':'Slew Commodus';return {vday:'Victor of the Day',surv10:'10 bouts survived',surv25:'25 bouts survived',thumb:'Survived the Thumb of Flavius'}[a]||k}
  const TROPHY_REPEAT=['vday'];
  function trophyAdd(D,k,glad,at){D.trophies=D.trophies||[];const t=D.trophies.find(x=>x.k===k);if(t){if(!TROPHY_REPEAT.includes(k))return false;t.x=(t.x|0)+1;t.at=at;t.glad=glad;return true}
    if(D.trophies.length>=TROPHY_MAX)return false;D.trophies.push({k,n:trophyName(k),at,glad,x:1});return true}
  /* the trophies one settled seat earns its house (ch after applyResult) */
  function trophiesFrom(ch,row,out,ranked,ev){const k=[];if(!row||!out||row.cpu)return k;const alive=!out.died;
    if(ranked&&row.won&&alive)k.push('first:'+ev);for(const r of out.ranks||[])k.push('rank:'+r);for(const s of row.slew||[])k.push('slew:'+s);
    if(ranked&&alive&&(ch.survived|0)>=10)k.push('surv10');if(ranked&&alive&&(ch.survived|0)>=25)k.push('surv25');if(row.thumb&&alive)k.push('thumb');return k}
  /* one line of the house's recent matches */
  const recentRow=(m,ch,row,out)=>({id:m.id,ev:m.ev,loc:m.loc,at:m.at,ranked:!!m.ranked,glad:ch.name,cls:ch.cls,won:!!(row&&row.won),died:!!(out&&out.died),cf:(row&&row.f)|0,place:(row&&row.place)|0});
  function recentAdd(D,e){D.recent=[e,...(D.recent||[]).filter(x=>x.id!==e.id||x.glad!==e.glad)].slice(0,RECENT_KEEP);return D}
  /* ── FOLLOW + the share link ── */
  const domusLink=id=>'#domus='+encodeURIComponent(String(id||''));
  function domusFromHash(h){const m=/[#&]domus=([^&]+)/.exec(String(h||''));return m?decodeURIComponent(m[1]).replace(/[^A-Za-z0-9_-]/g,'').slice(0,40)||null:null}
  /* ── THE WAGERS TAB: the pool by seat and the payout multiple if that seat wins (after the 5% cut, tickets in the pot included) ── */
  function oddsOf(L){const bets=L.bets||[];const pool=bets.reduce((a,b)=>a+(b.amt|0),0);const pot=L.pot|0;const all=pool+pot;const net=all-Math.floor(all*WAGER.cut);const seats=[];
    for(let i=0;i<(L.seats|0);i++){const mine=bets.filter(b=>b.seat===i);const stake=mine.reduce((a,b)=>a+(b.amt|0),0);seats.push({seat:i,stake,bets:mine.length,odds:stake?Math.round(net/stake*100)/100:null})}
    return {pool,pot,seats}}
  /* each bet's own outcome, the same arithmetic as settle(): {res:'won'|'lost'|'refund', pay} in the order of bets */
  function betResults(bets,winSeats,x){x=x||{};bets=bets||[];if(x.void||!winSeats.length)return bets.map(b=>({res:'refund',pay:b.amt|0}));
    const won=bets.filter(b=>winSeats.includes(b.seat));const wsum=won.reduce((a,b)=>a+b.amt,0);if(!wsum)return bets.map(b=>({res:'refund',pay:b.amt|0}));
    const all=bets.reduce((a,b)=>a+b.amt,0)+(x.pot|0);const cut=Math.floor(all*WAGER.cut);return bets.map(b=>winSeats.includes(b.seat)?{res:'won',pay:Math.floor((all-cut)*b.amt/wsum)}:{res:'lost',pay:0})}
  const weekKey=t=>'W'+Math.floor((t||0)/604800000);
  /* ── v0.84 EQUIP POINTS: what a kit may bring together. A piece occupies its location(s) (head · chest (belts too) · one arm or leg side ·
     a pair = both sides) on one equip point (pt) in one layer (stackable padding vs hard). The catalog (with slot/pt/stack/pair) is the server's
     (setCatalog) or the page's onlCatalog(). ── */
  let CAT84=null;const setCatalog=c=>{CAT84=c||null};const catNow=()=>CAT84||(typeof onlCatalog==='function'?onlCatalog():null);
  const ARM_SIDES84={head:['head'],chest:['chest'],belt:['chest'],arm:['rarm','larm'],leg:['rleg','lleg']};
  function armOf(h,it,catalog){const b=itemBase(it);if(b==='na'){const w=(pcOf(h,it)||{}).w;return w&&w.slot?{slot:w.slot,pt:String(w.pt||''),stack:false,pair:!!w.pair}:null}
    const c=(catalog||{})[b];if(!c||c.kind!=='a'||!c.slot)return null;return {slot:c.slot,pt:String(c.pt||''),stack:!!c.stack,pair:!!c.pair}}
  function armPlace(occ,a){const locs=ARM_SIDES84[a.slot]||[a.slot];const k=(a.stack?'s:':'h:')+a.pt;const free=locs.filter(l=>!(occ[l]||[]).includes(k));
    if(a.pair){if(free.length<locs.length)return false;for(const l of locs)(occ[l]=occ[l]||[]).push(k);return true}if(!free.length)return false;(occ[free[0]]=occ[free[0]]||[]).push(k);return true}
  /* items (in order) → [true|false]: each armor piece fits beside the ones before it (weapons and unknown pieces always true) */
  function armFit(h,items,catalog){const occ={};return (items||[]).map(it=>{const a=armOf(h,it,catalog);return !a||armPlace(occ,a)})}
  /* ══════════════════════ v0.84 (protocol 7, contract tools/plans/onl84-contract.md) ══════════════════════
     NAMED ARMOR ('na#uid', engine key 'na_uid'), SEASONS on the Manager's schedule + the weekly challenge, RECLAIM_MS, CPU-won rewards,
     Flavius's Auction. Every number marked TWEAK is a default Virgilante may change. */
  const NAMED_ARMOR_SHARE=0.4; /* TWEAK: a named gift / chest roll is armor 40% of the time, a weapon 60% */
  const CPU_SHARE=0.5, CPU_CUT=0.25; /* TWEAK: a seat the CPU played MORE than half of → 25% coin and Glory, no gifts, no trophies */
  const RECLAIM_MS=180000; /* TWEAK: a dropped / CPU-abandoned seat may be taken back for 3 minutes (or until the CPU begins its next turn) */
  const NAMED_A='na';const isNamedA=it=>itemBase(it)===NAMED_A;
  const ARM_LOCS84=['head','chest','larm','rarm','lleg','rleg'], ARM_SLOTS84=['head','chest','belt','arm','leg'];
  /* the affixes of named armor (engine hooks in 139-v84onl); caps: a piece ≤ 6 AP (the location still caps at 7) */
  const AFFIX_A={ap:{n:'+1 AP',fits:a=>(a.ap|0)<6,apply:a=>{a.ap=(a.ap|0)+1}},
    bonus:{n:'+1 AP to another location',fits:a=>!a.bonus||!Object.keys(a.bonus).length,apply:a=>{a.bonus={[a.slot==='chest'?'head':'chest']:1}}},
    ward:{n:'the first hit each rotation loses 1 damage',fits:a=>!a.ward,apply:a=>{a.ward=1}},
    swift:{n:'+1 movement while unhurt',fits:a=>!a.swift,apply:a=>{a.swift=1}}};
  const AFFIX_A_ADJ={ap:['Solidus','Solida','Solidum'],bonus:['Amplus','Ampla','Amplum'],ward:['Tutus','Tuta','Tutum'],swift:['Velox','Velox','Velox']};
  /* the unique effects of Legendary armor (each claimed ONCE in the world: WORLD UNIQA#<k>) */
  const UNIQUES_A=[
    {k:'regalis',n:'Regis',d:'While worn, +1 CF at the start of each of the wearer’s turns.'},
    {k:'invicta',n:'Invicti',d:'A hit of 2 or more on the location it guards loses 1 damage.'},
    {k:'gloriosa',n:'Gloriae',d:'+1 CF when a gladiator’s hit on the wearer is stopped by armor (no HP lost).'},
    {k:'mercurialis',n:'Mercurii',d:'+1 movement while worn.'},
    {k:'vindex',n:'Vindicis',d:'+1 damage against the gladiator who last hit the wearer.'},
    {k:'restituta',n:'Phoenicis',d:'At the start of the wearer’s turns, the location it guards regains 1 AP (up to the pieces’ own AP).'}];
  const UNIQ_A_KEYS=UNIQUES_A.map(u=>u.k);
  const NOUN_A={head:['Galea',1],chest:['Lorica',1],belt:['Balteus',0],arm:['Manica',1],leg:['Ocrea',1]};
  /* rar = rarity key; taken = armor uniques already claimed → the def (no key yet: namedPiece adds it). Bases: printed, never stackable padding */
  function rollNamedArmor(rnd,catalog,rar,taken){const bases=Object.keys(catalog||{}).filter(k=>catalog[k].kind==='a'&&!catalog[k].stack&&ARM_SLOTS84.includes(catalog[k].slot)).sort();if(!bases.length)return null;
    const base=pick1(rnd,bases);const c=catalog[base];const a={kind:'a',base,lv:4,slot:c.slot,pt:String(c.pt||''),ap:Math.min(6,c.ap|0),...(c.pair?{pair:1}:{}),...(c.bonus&&Object.keys(c.bonus).length?{bonus:{...c.bonus}}:{})};
    let R=rarOf(rar);let uq=null;if(R.uq){const pool=UNIQ_A_KEYS.filter(k=>!(taken||[]).includes(k));if(pool.length)uq=pick1(rnd,pool);else R=rarOf('epic')}
    const aff=[];for(let i=0;i<R.aff;i++){const ok=Object.keys(AFFIX_A).filter(k=>!aff.includes(k)&&AFFIX_A[k].fits(a));if(!ok.length)break;const k=pick1(rnd,ok);AFFIX_A[k].apply(a);aff.push(k)}
    const [noun,g]=NOUN_A[c.slot]||['Lorica',1];let n=noun;
    if(R.k==='common')n+=' '+pick1(rnd,COMMON_ADJ)[g];else if(aff.length)n+=' '+AFFIX_A_ADJ[aff[0]][g];
    if(R.k==='epic')n+=' '+pick1(rnd,GODS);if(uq)n=noun+' '+UNIQUES_A.find(u=>u.k===uq).n;
    Object.assign(a,{n,rar:R.k,aff,...(uq?{uq}:{}),named84:1});return a}
  /* a named armor def as a client builds it (defensive: numbers clamped, strings cleaned) */
  function cleanNamedA(a){if(!a||typeof a!=='object')return null;const key=String(a.key||'').replace(/[^A-Za-z0-9_.\-]/g,'').slice(0,64);if(!/^na_/.test(key))return null;
    const slot=ARM_SLOTS84.includes(a.slot)?a.slot:null;if(!slot)return null;
    const o={kind:'a',key,n:cleanName(a.n)||'Named armor',base:String(a.base||'').replace(/[^a-z0-9_]/gi,'').slice(0,24),lv:4,slot,pt:String(a.pt||'').replace(/[^a-z]/gi,'').slice(0,12),ap:Math.max(0,Math.min(7,a.ap|0)),
      rar:rarOf(a.rar).k,aff:Array.isArray(a.aff)?a.aff.filter(k=>AFFIX_A[k]).slice(0,3):[],named84:1};
    if(a.pair)o.pair=1;if(a.bonus&&typeof a.bonus==='object'){const b={};for(const [l,v] of Object.entries(a.bonus).slice(0,2))if(ARM_LOCS84.includes(l))b[l]=Math.max(1,Math.min(2,v|0));if(Object.keys(b).length)o.bonus=b}
    if(a.ward)o.ward=1;if(a.swift)o.swift=1;if(a.uq&&UNIQ_A_KEYS.includes(a.uq))o.uq=a.uq;return o}
  /* CPU-won rewards: a seat's turn tally {h (human), c (CPU)} → the result row's cpu flag */
  const cpuRow=t=>!!t&&(t.c|0)>((t.h|0)+(t.c|0))*CPU_SHARE;
  /* ── SEASONS = the system schedule (19-calendar seasonSchedule + 77-rivalry week 12), on the server clock ── */
  const WEEK_MS=604800000, SEASON_EPOCH=Math.floor(Date.UTC(2026,9,1)/WEEK_MS)*WEEK_MS; /* Thursday 2026-10-01 00:00 UTC — the same week boundaries as weekKey */
  const seasonKeyOf=n=>'S'+(Math.floor(n/12)+1)+'W'+(n%12+1);
  function seasonAt(t){const n=Math.max(0,Math.floor(((t||0)-SEASON_EPOCH)/WEEK_MS));const start=SEASON_EPOCH+n*WEEK_MS;return {season:Math.floor(n/12)+1,wk:n%12+1,n,key:seasonKeyOf(n),start,end:start+WEEK_MS}}
  const SCHED_W=[['democritus',22],['egidious',16],['cassian',14],['familia',5],['goldenEagle',4],['juggernaut',3],['orpheus',3],['triumviratus',3],['ludus',2],['chariot',2],['naumachia',1],['commodus',2]];
  const LOC_IDS84=[1,2,3,4,5,6,7,8,9,10,11,12];
  /* the page's mulberry32 + hashStr, copied (the schedule must match the Manager's) */
  function mul84(seed){let s=seed>>>0;return ()=>{let t=s=s+0x6D2B79F5>>>0;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}}
  const hash84=x=>{let h=2166136261;for(const ch of String(x))h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;return h};
  const FX84={};
  function seasonFixtures(season){if(FX84[season])return FX84[season].map(f=>({...f}));const r=mul84(hash84('sched'+season));const order=LOC_IDS84.slice().sort(()=>r()-.5);
    const total=SCHED_W.reduce((a,x)=>a+x[1],0);const isCl=ev=>/democritus|egidious|cassian/.test(ev);const fx=[];
    order.slice(0,12).forEach((loc,i)=>{let ev='democritus';if(i===11)ev='cassian';else{let x=r()*total;for(const [k,w] of SCHED_W){if((x-=w)<0){ev=k;break}}}
      if(!isCl(ev)&&i>0&&!isCl(fx[i-1].ev))ev='democritus';fx.push({wk:i+1,loc,ev})});
    if(fx[11]){fx[11].ev='familia';fx[11].rivalry=1}FX84[season]=fx;return fx.map(f=>({...f}))}
  /* this week's online fixture: an event the online arena cannot hold yet becomes Democritus at the same city (TWEAK) */
  function onlineFixture(t){const S=seasonAt(t);const f=seasonFixtures(S.season)[S.wk-1];return {...S,ev:EVENTS_ALL.includes(f.ev)?f.ev:'democritus',evRaw:f.ev,loc:f.loc}}
  /* ── THE WEEKLY CHALLENGE (the week's fixture): win it · survive it Ranked · finish 3 bouts → ONE gift (with a win) a house a week ── */
  const CH84=[{k:'win',n:1},{k:'surv',n:1},{k:'bouts',n:3}], WEEK_GIFTS84=1; /* TWEAK: at most 1 challenge gift per house per week */
  function weekState(D,t){const F=seasonAt(t);const X=D&&D.wk84&&D.wk84.key===F.key?{...D.wk84}:{key:F.key,win:0,surv:0,bouts:0,wins:0,gift:0};X.done=!!(X.win>=1&&X.surv>=1&&X.bouts>=3);return X}
  /* one settled seat of a house (m = {ev, loc, ranked, at}) → D.wk84; returns the week's gift when it was just earned (already put on D) */
  function weekNote(D,m,ch,row,out){const t=(m&&m.at)||Date.now();const F=onlineFixture(t);const X=weekState(D,t);delete X.done;D.wk84=X;if(!row||row.cpu)return null;
    X.bouts=(X.bouts|0)+1;const here=!!m&&m.ev===F.ev&&(m.loc|0)===F.loc;if(row.won){X.wins=(X.wins|0)+1;if(here)X.win=1}
    if(m&&m.ranked&&here&&!(out&&out.died)&&row.survives!==false)X.surv=1;
    if(X.win&&X.surv&&X.bouts>=3&&X.wins>=1&&(X.gift|0)<WEEK_GIFTS84){const g={id:'week:'+F.key+':'+(D.id||'d'),why:'week:'+F.key,at:t,glad:(ch&&ch.name)||null};const n0=(D.gifts||[]).length;
      giftsIn(D,[g]);if((D.gifts||[]).length>n0){X.gift=(X.gift|0)+1;return g}}return null}
  /* ── FLAVIUS'S AUCTION: only Flavius sells (the chest pool); escrow, anti-snipe, one win a house a week ── */
  const AUC_LOTS=3, AUC_MIN_MS=86400000, AUC_SNIPE_MS=300000, AUC_STEP=0.05, AUC_STEP_MIN=10; /* TWEAK: lots a week, shortest life, snipe guard, raise */
  const aucMin=val=>Math.ceil((val|0)/2);
  const aucNextMin=lot=>lot&&lot.bid?Math.max((lot.bid.amt|0)+AUC_STEP_MIN,Math.ceil((lot.bid.amt|0)*(1+AUC_STEP))):aucMin(lot&&lot.val);
  const aucEnds=t=>Math.max(seasonAt(t).end,t+AUC_MIN_MS);
  function aucBidWhy(lot,amt,t){if(!lot||lot.done||t>lot.ends)return 'The hammer has fallen on that lot.';const m=aucNextMin(lot);if(!(Number.isInteger(amt)&&amt>=m))return `The next bid is at least ${m} coin.`;return ''}
  function aucSnipe(lot,t){if(lot.ends-t<AUC_SNIPE_MS)lot.ends=t+AUC_SNIPE_MS;return lot}

  return {ROOM_GRACE,roomOffMark,roomOffClear,roomGoneIds,roomHostAway,standsHolders,FELL_WATCH,setCatalog,armOf,armFit,equipOf0,NAMED_A,NAMED_ARMOR_SHARE,CPU_SHARE,CPU_CUT,RECLAIM_MS,isNamedA,AFFIX_A,UNIQUES_A,UNIQ_A_KEYS,rollNamedArmor,cleanNamedA,cpuRow,WEEK_MS,SEASON_EPOCH,seasonAt,seasonKeyOf,SCHED_W,seasonFixtures,onlineFixture,CH84,WEEK_GIFTS84,weekState,weekNote,AUC_LOTS,AUC_MIN_MS,AUC_SNIPE_MS,AUC_STEP,AUC_STEP_MIN,aucMin,aucNextMin,aucEnds,aucBidWhy,aucSnipe,GIFT_HOUSE,OFF_SHELF,giftsOut,giftsIn,offersIn,offerMoveWhy,offerMove,CFB_COIN,applyGiftHouse,TREASURY_CUT,GIFT_EVERY,GIFT_KEEP,COUNTDOWN_MS,LOOT_MS,FOLLOW_MAX,TROPHY_MAX,RECENT_KEEP,INFAMES_MIN,canWearNamed,PRICE_OFF,OFFERS83,OFF_CARRY,OFF_MAX,offersBrought,offerBuyWhy,offerBuy,offerBring,NAMED,L4_PRICE,RARITY,rarOf,itemBase,itemUid,isNamed,engineKey,pcOf,isBroken,newUid,pieceInfo,pieceOf,valueOf,repairCost,usedPrice,wearWhy,takePiece,putPiece,tagPiece,histAdd,breakItem,repairItem,gearAfter,lootBest,giftAdd,giftTake,GIFT_W,RAR_W,CFB_MAX,rollGift,applyGift,AFFIX,UNIQUES,rollNamed,namedPiece,cleanNamed,lineupSig,stopCount,countCheck,countLeft,trophyName,trophyAdd,trophiesFrom,recentRow,recentAdd,domusLink,domusFromHash,oddsOf,betResults,weekKey,PASS,passOK,standsSeatWhy,cleanPatron,gearMoveWhy,gearMove,gearEquip,GLORY,gloryOf,rankByGlory,tableFactor,PRICE_AP,priceOf,AWARD,WIN_BONUS,awardOf,DOMUS_MIN,DOMUS_MAX,domusWhy,domusKey,newDomus,domusNote,domusFromChars,domusRow,GUEST_MS,GUEST_OK,STANDS_MS,STANDS_ACTS,standsPickOK,cleanPick,DAY_KEEP,DAY_MAX,dayKey,dayWho,dayLite,dayNote,daySlim,dayFromMatch,dayFell,dayHas,dayOut,nyBehind,dayStart,dayPrevKey,FORUM_GRACE,forumSince,dayLost,dayBest,nameBad,ROOM_MAX,KICK_MS,TEAM_KEYS,EV_SEATS,seatRange,clampSeats,memberOf,seatOf,teamKeys,roomJoin,sitGroup,roomSit,roomStand,roomLeave,roomGiveHost,roomKick,roomSet,roomTeam,strengthOf,autoBalance,quickPick,startRoom,liteRow,QC,QC_TEXT,phraseOK,RATE,cleanTz,hereSummary,GLAD_MAX,MIN_HUMANS,CHAT_KEEP,CHAT_LEN,equipOf,cleanLook,editChar,cleanChat,abandonRule,humansOf,canStart,EVENTS_TEAM,EVENTS_ALL,STANDS_MAX,PARTY_MAX,seatGroup,ticketOK,seatTeams,partyCode,VER,CLASSES8,EVENTS3,RANKS,START_STATS,grow,STAT_KEYS,STAT_POOL,STAT_MIN,STAT_MAX,PRICE,rankIdx,rankFor,nextRank,rankProgress,cleanName,statsOK,newChar,kitOf,canBuy,buy,applyResult,hallWorthy,hallWhy,newLobby,canJoin,weekChallenges,WAGER,betOK,settle,STRIKES_OUT,AWAY_MS,cleanRow,cleanTable,agree}})();
/* ══════════════════════ v0.89 THE DOMUS REBUILD (part H — contract tools/plans/onl89-domus.md) ══════════════════════
   Kept apart from the IIFE above (it only EXTENDS ONLC; the page and the server both load it). His asks (2026-10-05):
   • the look is set at creation (editChar refuses a changed look; the one-time v0.82 sculpted-token conversion still passes), the CLASS changes
     only through char.class for CLASS_FEE89 coin from the house treasury;
   • the Domus dresses a gladiator (dressApply: what he wears; everything else he holds goes to the house shelf);
   • KEEP HOME: a piece flagged pcs[uid].home is listed in kit.home and left out of every Ranked kit (kitStrip in roomJoin / seatGroup / startRoom);
   • saved loadouts (cleanKits), the treasury LEDGER by totals (ledAdd / ledgerOf), the MEMORIAL wall (memoEntry / memoAdd), house colours + crest
     (cleanLook89, CREST89 = the printed banner devices), treasury UPGRADES (UPG89: a 5th gladiator slot, a bigger offerings shelf). */
(function(C){
  const CLASS_FEE89=100; /* TWEAK: a class change, from the treasury */
  const UPG89={slot5:{cost:1500},shelf:{cost:400,add:4}}; /* TWEAK: once each, from the treasury */
  const CREST89=['eagle','horse','mount','tri','olive','croc','tower','goat','sun','lion','wave','moon','wolf','owl','trident','laurel','boar','ship','thunder','column'];
  const MEMO_MAX89=60, KITS_MAX89=3, KIT_ITEMS89=16, DRESS_W89=2, LED_BY89=40;
  const LED_IN89=['cut','gift','sale','refund','grant'], LED_OUT89=['gear','repair','class','upg'];
  const upgOf=D=>(D&&D.upg89)||{};
  const GMAX0=C.GLAD_MAX; /* the base cap (pages may lend ONLC.GLAD_MAX the house's cap for older screens) */
  const gladMax=D=>GMAX0+(upgOf(D).slot5?1:0);
  const shelfMax=D=>C.OFF_SHELF+(upgOf(D).shelf?UPG89.shelf.add:0);
  function upgWhy(D,k){const U=UPG89[k];if(!U)return 'No such upgrade.';if(upgOf(D)[k])return 'Already built.';if(((D&&D.treasury)|0)<U.cost)return `The treasury needs ${U.cost} coin.`;return ''}
  function upgBuy(D,k,t){const why=upgWhy(D,k);if(why)throw new Error(why);const U=UPG89[k];D.treasury=(D.treasury|0)-U.cost;D.upg89={...upgOf(D),[k]:t||1};ledAdd(D,'upg',U.cost,null,t);return D}
  /* ── the ledger: totals only (in / out by source, the cut by gladiator) ── */
  function ledAdd(D,k,amt,ch,t){amt=Math.round(+amt||0);if(!D||!amt)return D;const L=D.led89||(D.led89={since:t||Date.now(),in:{},out:{},by:{}});L.in=L.in||{};L.out=L.out||{};L.by=L.by||{};
    if(LED_OUT89.includes(k))L.out[k]=(L.out[k]|0)+Math.abs(amt);else if(LED_IN89.includes(k))L.in[k]=(L.in[k]|0)+amt;else return D;
    if(k==='cut'&&ch&&ch.id){const b=L.by[ch.id]||(L.by[ch.id]={n:'',v:0});b.n=String(ch.name||b.n||'').slice(0,24);b.v=(b.v|0)+amt;
      const ks=Object.keys(L.by);if(ks.length>LED_BY89){ks.sort((a,b2)=>(L.by[a].v|0)-(L.by[b2].v|0));for(const x of ks.slice(0,ks.length-LED_BY89))if(x!==ch.id)delete L.by[x]}}
    return D}
  function ledgerOf(D){const L=D&&D.led89;if(!L)return null;const sum=o=>Object.values(o||{}).reduce((a,v)=>a+(v|0),0);
    return {since:L.since||0,in:{...(L.in||{})},out:{...(L.out||{})},by:Object.entries(L.by||{}).map(([id,x])=>({id,n:x.n||'',v:x.v|0})).sort((a,b)=>b.v-a.v),tin:sum(L.in),tout:sum(L.out)}}
  /* ── colours + crest: two plain colours and one printed banner device ── */
  const HEX=/^#[0-9a-fA-F]{6}$/;
  function cleanLook89(x){if(!x||typeof x!=='object')throw new Error('Pick the colours and the crest.');if(!HEX.test(String(x.c1||''))||!HEX.test(String(x.c2||'')))throw new Error('Pick two colours.');
    if(!CREST89.includes(x.crest))throw new Error('Pick one of the printed crests.');return {c1:String(x.c1).toLowerCase(),c2:String(x.c2).toLowerCase(),crest:x.crest}}
  /* ── the memorial wall: every fallen gladiator of the house (the Hall of the Fallen keeps only the great) ── */
  function memoBy(row,out,killer){if(out&&out.abandoned)return {k:'abandon'};const kb=row&&row.kb;
    if(kb==='g')return killer?{k:'g',n:String(killer).slice(0,24)}:{k:'g'};if(kb==='b'||kb==='a'||kb==='r')return {k:kb};return {k:'fate'}}
  function memoEntry(ch,m,by,t){return {id:ch.id,name:ch.name,cls:ch.cls,rank:(ch.died&&ch.died.rank)||C.rankFor(ch).k,fa:ch.faith==='christian'||ch.faith==='c'?'c':'p',
    ev:(m&&m.ev)||null,loc:((m&&m.loc)|0)||null,at:(m&&m.at)||t||Date.now(),by:by||{k:'fate'},bouts:ch.bouts|0,survived:ch.survived|0,lifeCF:ch.lifeCF|0}}
  function memoAdd(D,e){if(!D||!e)return D;D.memo89=[e,...(D.memo89||[]).filter(x=>x.id!==e.id)].slice(0,MEMO_MAX89);return D}
  /* ── keep home: the flag lives on the piece (a plain id is tagged first, so it can carry it) ── */
  const isHome=(h,it)=>{const p=C.pcOf(h,it);return !!(p&&p.home)};
  function homeSet(h,it,on){if(!(h.gear||[]).includes(it))throw new Error('That piece is not there.');let id=it;
    if(!C.itemUid(it)){if(!on)return it;const wasEq=Array.isArray(h.equip)&&h.equip.includes(it);const T=C.tagPiece(C.takePiece(h,it),h);C.putPiece(h,T,wasEq);id=T.item}
    const u=C.itemUid(id);const pc={...(C.pcOf(h,id)||{st:'whole'})};if(on)pc.home=1;else delete pc.home;h.pcs={...(h.pcs||{}),[u]:pc};return id}
  /* the kit lists its kept-home pieces; a Ranked room strips them (the gladiator fights without them) */
  {const base=C.kitOf;C.kitOf=function(ch){const k=base.apply(this,arguments);if(!k||!ch)return k;const home=(k.items||[]).filter(it=>isHome(ch,it));if(home.length)k.home=home;return k}}
  function kitStrip(kit){if(!kit||!Array.isArray(kit.home)||!kit.home.length)return kit;const left=kit.home.slice();const gear=[],items=[];const gone=new Set();
    (kit.items||[]).forEach((it,i)=>{const j=left.indexOf(it);if(j>=0){left.splice(j,1);gone.add((kit.gear||[])[i]);return}items.push(it);gear.push((kit.gear||[])[i])});
    const y={...kit,gear,items,named:(kit.named||[]).filter(d=>!gone.has(d.key)),homeLeft:kit.home.length};delete y.home;return y}
  const stripRoom=L=>{if(!L||!L.ranked)return L;for(const p of L.players||[])if(p&&p.kit)p.kit=kitStrip(p.kit);for(const m of L.members||[])if(m&&m.kit)m.kit=kitStrip(m.kit);return L};
  for(const f of ['roomJoin','seatGroup']){const base=C[f];C[f]=function(L){const r=base.apply(this,arguments);try{stripRoom(L)}catch(e){}return r}}
  {const base=C.startRoom;C.startRoom=function(L){try{stripRoom(L)}catch(e){}return base.apply(this,arguments)}}
  /* ── the look is set at creation; the class changes only through char.class ── */
  const stable=o=>o&&typeof o==='object'?(Array.isArray(o)?'['+o.map(stable).join(',')+']':'{'+Object.keys(o).sort().map(k=>JSON.stringify(k)+':'+stable(o[k])).join(',')+'}'):JSON.stringify(o);
  {const base=C.editChar;C.editChar=function(ch,d,catalog){d={...(d||{})};
    if(d.look!=null){const was=C.cleanLook(ch.look),now=C.cleanLook(d.look);const legacy=!(was.token&&was.token.sc)&&!!(now.token&&now.token.sc); /* only the one-time v0.82 sculpted-token conversion (an old look → its sculpted token) */
      if(stable(was)!==stable(now)&&!legacy)throw new Error('A gladiator’s look is set when he is raised.');if(!legacy)delete d.look}
    if(d.cls!=null&&d.cls!==ch.cls)throw new Error(`Change class in the Domus — ${CLASS_FEE89} coin from the treasury.`);delete d.cls;return base.call(this,ch,d,catalog)}}
  function classWhy(ch,cls,D){if(!ch||!ch.alive)return 'The dead stay as they fell.';if(!C.CLASSES8.includes(cls))return 'Pick one of the eight printed classes.';if(cls===ch.cls)return 'That is already his class.';
    if(((D&&D.treasury)|0)<CLASS_FEE89)return `The treasury needs ${CLASS_FEE89} coin.`;return ''}
  /* ── dressing a gladiator: inc = pieces taken from the shelf / another gladiator ({item, pc}); equip = what he should wear, in order.
     → {eq, off}: off = the pieces he no longer wears (they go to the house shelf). ── */
  function dressApply(ch,equip,inc,catalog){for(const P of inc||[])C.putPiece(ch,P,false);const held=(ch.gear||[]).slice();const left=held.slice();const eq=[];const bases=new Set();let nw=0;
    for(const it of (Array.isArray(equip)?equip:[]).slice(0,30).map(String)){const i=left.indexOf(it);if(i<0)continue;if(C.wearWhy(ch,it))continue;const I=C.pieceOf(ch,it,catalog);if(!I)continue;
      if(!I.stack&&!I.named){if(bases.has(I.base))continue;bases.add(I.base)}if(I.kind==='w'){if(nw>=DRESS_W89)continue;nw++}left.splice(i,1);eq.push(it)}
    const ok=C.armFit(ch,eq,catalog);const fin=eq.filter((x,i)=>ok[i]);const rest=held.slice();for(const it of fin){const i=rest.indexOf(it);if(i>=0)rest.splice(i,1)}
    const off=[];for(const it of rest){const T=C.takePiece(ch,it);if(T)off.push(T)}ch.equip=fin.slice();return {eq:fin,off}}
  /* why a piece cannot be taken onto this gladiator ('' when it can) */
  function takeWhy(ch,I){if(!ch||!ch.alive)return 'The dead carry nothing.';if(!I)return 'No such piece.';if(I.named&&!C.canWearNamed(ch))return 'Named pieces wait in the Storeroom until Veteranus.';return ''}
  /* ── saved loadouts: ≤KITS_MAX89 named lists of the pieces he holds ── */
  function cleanKits(ch,kits){if(!Array.isArray(kits))throw new Error('Pick the loadouts.');if(kits.length>KITS_MAX89)throw new Error(`Up to ${KITS_MAX89} loadouts.`);const held=ch.gear||[];
    return kits.map(k=>{const n=C.cleanName(k&&k.n).slice(0,20);if(!n)throw new Error('Name the loadout.');if(C.nameBad(n))throw new Error('Pick another name.');
      const left=held.slice();const items=[];for(const it of (Array.isArray(k.items)?k.items:[]).slice(0,KIT_ITEMS89).map(String)){const i=left.indexOf(it);if(i>=0){left.splice(i,1);items.push(it)}}return {n,items}})}
  /* ── the domus row carries the new fields ── */
  {const base=C.domusRow;C.domusRow=function(D){const r=base.apply(this,arguments);if(!r)return r;r.gmax=gladMax(D);r.smax=shelfMax(D);if(D.upg89)r.upg89={...D.upg89};if(D.look89)r.look89={...D.look89};const L=ledgerOf(D);if(L)r.led89=L;return r}}
  /* the house shelf's cap follows the upgrade (a gladiator's satchel keeps OFF_MAX); offerings sold for a full shelf go into the ledger */
  {const base=C.offerMoveWhy;C.offerMoveWhy=function(src,dst,k){if(src&&dst&&src!==dst&&!dst.cls){if(!(src.offers||[]).includes(k))return 'That offering is not there.';if((dst.offers||[]).length>=shelfMax(dst))return 'The shelf is full.';return ''}return base.apply(this,arguments)}}
  {const base=C.offersIn;C.offersIn=function(D,keys){if(!D)return base.apply(this,arguments);const cap=shelfMax(D);D.offers=D.offers||[];let sold=0;
    for(const k of keys||[]){if(!C.OFFERS83.includes(k))continue;if(D.offers.length>=cap){sold+=Math.round(C.PRICE_OFF[k]/2);continue}D.offers=[...D.offers,k]}
    if(sold){D.treasury=(D.treasury|0)+sold;ledAdd(D,'sale',sold)}return D}}
  {const base=C.applyGiftHouse;C.applyGiftHouse=function(D,rw,P){const t0=(D&&D.treasury)|0;const r=base.apply(this,arguments);try{if(D&&rw&&(rw.k==='coin'||rw.k==='cf')){const d=(D.treasury|0)-t0;if(d>0)ledAdd(D,'gift',d)}}catch(e){}return r}}
  Object.assign(C,{CLASS_FEE89,UPG89,CREST89,MEMO_MAX89,KITS_MAX89,KIT_ITEMS89,DRESS_W89,LED_IN89,LED_OUT89,gladMax,shelfMax,upgWhy,upgBuy,ledAdd,ledgerOf,cleanLook89,
    memoBy,memoEntry,memoAdd,isHome,homeSet,kitStrip,classWhy,dressApply,takeWhy,cleanKits})})(ONLC);
/* ══════════════════════ v0.89 J — ARMOR AFFIXES II + THE NAMED-ARMOR CURVE (contract tools/plans/onl89-affix.md) ══════════════════════
   Kept apart from the IIFE above (it only EXTENDS ONLC; the page and the server both load it). His call (2026-10-05): armor bonuses are
   PERMANENT only (no offerings for them) and properly rare.
   • eight new armor affixes on C.AFFIX_A (engine hooks in 177-v89affix): lapid (stones from the stands → 0 here), spin (a melee hit here
     costs the attacker 1 HP), venat (−1 from beasts here), miss (−1 from thrown/shot weapons here), firm (floor spikes → 0 on this leg),
     integ (never comes back Broken — gearAfter), fid (a killer cannot loot it: it goes home — gearAfter), fort (+1 on the Thumb of Flavius d6,
     Legendary only, FORT_LEG89 of them).
   • rollNamedArmor is replaced: affixes are drawn by weight (AFF_W89; Lapidarius twice as likely on a helm) instead of evenly;
     rollGift is replaced with the same draws in the same order (weapons roll exactly as before) + a named ARMOR piece re-rolls its tier on
     RAR_A89 (Common 60 / Rare 28 / Epic 10 / Legendary 2). The chest pool and the auction re-use pieces already rolled: no new rolls there.
   • affixOdds89 / giftOdds89 = the exact odds from these tables (the ⓘ odds card, tools/affixsim.js and the tests read them). */
(function(C){
  const A=C.AFFIX_A;
  const SL=(...s)=>a=>s.includes(a.slot);
  const mk=(k,n,f)=>({n,fits:a=>!a[k]&&(!f||f(a)),apply:a=>{a[k]=1}});
  Object.assign(A,{
    venat:mk('venat','−1 damage from beasts here'),
    miss:mk('miss','−1 damage from thrown and shot weapons here',SL('head','chest','belt','arm')),
    firm:mk('firm','floor spikes deal 0 to this leg',SL('leg')),
    spin:mk('spin','a melee hit here costs the attacker 1 HP',SL('chest','belt','arm')),
    lapid:mk('lapid','stones from the stands deal 0 here'),
    integ:mk('integ','never comes back Broken'),
    fid:mk('fid','cannot be looted: if the wearer falls it goes home'),
    fort:{n:'+1 on the wearer’s Thumb of Flavius roll',fits:()=>false,apply:a=>{a.fort=1}}}); /* Legendary only, drawn apart (FORT_LEG89) */
  const NEW89=['venat','miss','firm','spin','lapid','integ','fid','fort'];
  /* TWEAK: the curve. Weights per affix draw (only the affixes that fit the piece are in the draw); Lapidarius ×LAPID_HELM89 on a helm */
  const AFF_W89={ap:30,bonus:30,ward:10,swift:10,venat:10,miss:10,firm:10,spin:4,lapid:5,integ:4,fid:4}; /* lapid 5 → ≈1 in 12 Rare-or-better pieces (tools/affixsim.js) */
  const LAPID_HELM89=2, FORT_LEG89=0.25;
  const RAR_A89=[['common',60],['rare',28],['epic',10],['legendary',2]];
  const GIFT_L2_89=0.7, GIFT_CHEAP89=0.75, GIFT_COIN89=[2,5], GIFT_CF89=[3,6];
  const AFF_ADJ89={ap:['Solidus','Solida','Solidum'],bonus:['Amplus','Ampla','Amplum'],ward:['Tutus','Tuta','Tutum'],swift:['Velox','Velox','Velox'],
    venat:['Venatorius','Venatoria','Venatorium'],miss:['Missilis','Missilis','Missile'],firm:['Firmus','Firma','Firmum'],spin:['Spinosus','Spinosa','Spinosum'],
    lapid:['Lapidarius','Lapidaria','Lapidarium'],integ:['Integer','Integra','Integrum'],fid:['Fidelis','Fidelis','Fidele'],fort:['Fortunae','Fortunae','Fortunae']};
  /* the Latin name of each armor affix (cards and the odds card): the masculine form */
  const AFF_LAT89=Object.fromEntries(Object.entries(AFF_ADJ89).map(([k,v])=>[k,v[0]]));
  const NOUN_A89={head:['Galea',1],chest:['Lorica',1],belt:['Balteus',0],arm:['Manica',1],leg:['Ocrea',1]};
  const COMMON_ADJ89=[['Fidus','Fida','Fidum'],['Ferreus','Ferrea','Ferreum'],['Vetus','Vetus','Vetus']];
  const GODS89=['Martis','Iovis','Neptuni','Dianae','Herculis','Plutonis','Victoriae','Fortunae'];
  const SLOTS89=['head','chest','belt','arm','leg'];
  const wp=(rnd,tab)=>{const t=tab.reduce((a,x)=>a+x[1],0);let v=rnd()*t;for(const x of tab){if((v-=x[1])<0)return x[0]}return tab[tab.length-1][0]};
  const p1=(rnd,arr)=>arr[Math.min(arr.length-1,Math.floor(rnd()*arr.length))];
  const affW=(k,a)=>(AFF_W89[k]||0)*(k==='lapid'&&a.slot==='head'?LAPID_HELM89:1);
  const affTab=(a,aff)=>Object.keys(AFF_W89).filter(k=>!aff.includes(k)&&A[k]&&A[k].fits(a)).map(k=>[k,affW(k,a)]).filter(x=>x[1]>0);
  const basesA=catalog=>Object.keys(catalog||{}).filter(k=>catalog[k].kind==='a'&&!catalog[k].stack&&SLOTS89.includes(catalog[k].slot)).sort();
  const baseA=(catalog,b)=>{const c=catalog[b];return {kind:'a',base:b,lv:4,slot:c.slot,pt:String(c.pt||''),ap:Math.min(6,c.ap|0),...(c.pair?{pair:1}:{}),...(c.bonus&&Object.keys(c.bonus).length?{bonus:{...c.bonus}}:{})}};
  /* rar = rarity key; taken = armor uniques already claimed → the def (no key yet: namedPiece adds it). The same draws as v0.84 up to the affixes. */
  function rollNamedArmor(rnd,catalog,rar,taken){const bases=basesA(catalog);if(!bases.length)return null;
    const b=p1(rnd,bases);const a=baseA(catalog,b);
    let R=C.rarOf(rar);let uq=null;if(R.uq){const pool=C.UNIQ_A_KEYS.filter(k=>!(taken||[]).includes(k));if(pool.length)uq=p1(rnd,pool);else R=C.rarOf('epic')}
    let n=R.aff;const fort=!!R.uq&&n>0&&rnd()<FORT_LEG89;if(fort)n--;
    const aff=[];for(let i=0;i<n;i++){const tab=affTab(a,aff);if(!tab.length)break;const k=wp(rnd,tab);A[k].apply(a);aff.push(k)}
    if(fort){A.fort.apply(a);aff.push('fort')}
    const [noun,g]=NOUN_A89[a.slot]||['Lorica',1];let nm=noun;
    if(R.k==='common')nm+=' '+p1(rnd,COMMON_ADJ89)[g];else if(aff.length)nm+=' '+AFF_ADJ89[aff[0]][g];
    if(R.k==='epic')nm+=' '+p1(rnd,GODS89);if(uq)nm=noun+' '+C.UNIQUES_A.find(u=>u.k===uq).n;
    Object.assign(a,{n:nm,rar:R.k,aff,...(uq?{uq}:{}),named84:1});return a}
  /* Flavius's gift: the v0.83/84 draws in the same order (coin · CF bonus · offering · gear · named); a named ARMOR piece then re-rolls its tier on RAR_A89 */
  function rollGift(rnd,catalog,rank){const k=wp(rnd,C.GIFT_W);const keys=lv=>Object.keys(catalog||{}).filter(x=>catalog[x].lv===lv).sort();
    if(k==='coin')return {k,v:Math.round((C.AWARD[rank]||C.AWARD.tiro)*(GIFT_COIN89[0]+rnd()*(GIFT_COIN89[1]-GIFT_COIN89[0])))};
    if(k==='cf')return {k,v:GIFT_CF89[0]+Math.floor(rnd()*(GIFT_CF89[1]-GIFT_CF89[0]+1))};
    if(k==='off')return {k,key:rnd()<GIFT_CHEAP89?p1(rnd,C.OFFERS83.filter(x=>C.PRICE_OFF[x]<100)):p1(rnd,C.OFFERS83.filter(x=>C.PRICE_OFF[x]>=100))};
    if(k==='l1'||k==='l23'){const lv=k==='l1'?1:rnd()<GIFT_L2_89?2:3;const ks=keys(lv);if(!ks.length)return {k:'coin',v:20};return {k:'gear',item:p1(rnd,ks),lv}}
    let rar=wp(rnd,C.RAR_W);const kind=rnd()<C.NAMED_ARMOR_SHARE?'a':'w';if(kind==='a')rar=wp(rnd,RAR_A89);return {k:'named',rar,kind}}
  /* a named armor def as a client builds it: the v0.84 clean + the v0.89 flags */
  const cleanA0=C.cleanNamedA;
  function cleanNamedA(a){const o=cleanA0(a);if(!o)return o;for(const k of NEW89)if(a[k])o[k]=1;return o}
  /* after a match: an Integer piece never breaks; a Fidelis piece of a Ranked dead goes HOME (out.left → the house Storeroom) instead of loot/market */
  const gearAfter0=C.gearAfter;
  function gearAfter(ch,kit,row,ranked){const w=it=>{const p=C.pcOf(ch,it);return (p&&p.w)||{}};
    if(ranked&&row&&row.survives!==false&&Array.isArray(row.brk)&&row.brk.length&&kit){const items=kit.items||[],gear=kit.gear||[];const brk=row.brk.slice();
      items.forEach((it,j)=>{if(w(it).integ){const i=brk.indexOf(gear[j]);if(i>=0)brk.splice(i,1)}});row={...row,brk}}
    const out=gearAfter0.call(this,ch,kit,row,ranked);
    if(out&&out.carried&&out.carried.length){const keep=[];for(const P of out.carried){if(P&&P.pc&&P.pc.w&&P.pc.w.fid){out.left.push(C.histAdd(P,{house:null,glad:(ch&&ch.name)||null,when:Date.now(),how:'home'}));(out.home89=out.home89||[]).push(P.item)}else keep.push(P)}out.carried=keep}
    return out}
  /* ── exact odds from the tables (no sampling) ── */
  const clone=o=>JSON.parse(JSON.stringify(o));
  function enumAff(a,left,aff,p,rec){const tab=left>0?affTab(a,aff):[];if(!tab.length){for(const k of aff)rec[k]=(rec[k]||0)+p;return}
    const t=tab.reduce((s,x)=>s+x[1],0);for(const [k,wt] of tab){const b=clone(a);A[k].apply(b);enumAff(b,left-1,[...aff,k],p*wt/t,rec)}}
  function enumAffW(w,left,aff,p,rec){const ok=left>0?Object.keys(C.AFFIX).filter(k=>!aff.includes(k)&&C.AFFIX[k].fits(w)):[];if(!ok.length){for(const k of aff)rec[k]=(rec[k]||0)+p;return}
    for(const k of ok){const b=clone(w);C.AFFIX[k].apply(b);enumAffW(b,left-1,[...aff,k],p/ok.length,rec)}}
  function oddsTier(catalog,bases,R){const rec={};for(const b of bases){const a=baseA(catalog,b);const P=1/bases.length;
      if(R.uq&&R.aff>0){enumAff(a,R.aff-1,['fort'],P*FORT_LEG89,rec);enumAff(a,R.aff,[],P*(1-FORT_LEG89),rec)}else enumAff(a,R.aff,[],P,rec)}return rec}
  /* kind 'a' | 'w' → {tiers:[[key,weight]...], aff:{rare:{k:p},epic,legendary} (p = the chance a piece of that tier carries it); armor also slot shares + helm Lapidarius */
  function affixOdds89(catalog,kind){const out={tiers:(kind==='a'?RAR_A89:C.RAR_W).map(x=>x.slice()),aff:{},slot:{},n:{}};
    for(const r of ['common','rare','epic','legendary'])out.n[r]=C.rarOf(r).aff;
    if(kind==='a'){const bases=basesA(catalog);out.slotAff={};
      for(const r of ['rare','epic','legendary'])out.aff[r]=oddsTier(catalog,bases,C.rarOf(r));
      for(const s of SLOTS89){const bs=bases.filter(b=>catalog[b].slot===s);out.slot[s]=bs.length/(bases.length||1);out.slotAff[s]={};
        for(const r of ['rare','epic','legendary'])out.slotAff[s][r]=bs.length?oddsTier(catalog,bs,C.rarOf(r)):{}}
      out.helmLapid=Object.fromEntries(['rare','epic','legendary'].map(r=>[r,out.slotAff.head[r].lapid||0]))}
    else{const bases=Object.keys(catalog||{}).filter(k=>catalog[k].kind==='w'&&catalog[k].p!=null).sort();for(const r of ['rare','epic','legendary']){const rec={};
        for(const b of bases){const w={...clone(catalog[b]),base:b,lv:4};enumAffW(w,C.rarOf(r).aff,[],1/bases.length,rec)}out.aff[r]=rec}}
    return out}
  /* what one gift opening gives — every chance from the tables above */
  function giftOdds89(){const t=C.GIFT_W.reduce((a,x)=>a+x[1],0);const P=k=>(C.GIFT_W.find(x=>x[0]===k)||[0,0])[1]/t;
    const cheap=C.OFFERS83.filter(x=>C.PRICE_OFF[x]<100),dear=C.OFFERS83.filter(x=>C.PRICE_OFF[x]>=100);
    return {kinds:C.GIFT_W.map(([k])=>[k,P(k)]),coin:GIFT_COIN89.slice(),cf:GIFT_CF89.slice(),off:{cheap:[GIFT_CHEAP89,cheap],dear:[1-GIFT_CHEAP89,dear]},l23:{2:GIFT_L2_89,3:1-GIFT_L2_89},
      armorShare:C.NAMED_ARMOR_SHARE,namedA:P('named')*C.NAMED_ARMOR_SHARE,namedW:P('named')*(1-C.NAMED_ARMOR_SHARE),fort:FORT_LEG89}}
  Object.assign(C,{rollNamedArmor,rollGift,cleanNamedA,gearAfter,affixOdds89,giftOdds89,AFF_W89,LAPID_HELM89,FORT_LEG89,RAR_A89,AFF_ADJ89,AFF_LAT89,NEW_AFF89:NEW89,
    GIFT_L2_89,GIFT_CHEAP89,GIFT_COIN89,GIFT_CF89})})(ONLC);
/* ══════════ v0.89 L · THE LANISTA (contract tools/plans/onl89-profile.md) ══════════
   The lanista's own NAME (never the sign-in name): 3–24 letters, word-filtered, unique case-insensitively (server LNAME#<key>);
   a rename once every RENAME_MS89 (A.nameAt), the old name kept as "formerly X" and held for its owner LOLD_MS89, then released.
   PRIVACY: {hide} = not in Here now / the Orbis glow (still counted in the totals), {inv} = who may invite: all | follow | none.
   FID (Flavius ID): a permanent 6-letter code per account, shown FID-XXXXXX (no look-alike letters). Lookups by FID (fid.find,
   domus.visit, follow / invite by FID) are rate-limited (FIND_MAX89 a minute). domus.visit = a house's PUBLIC face (no treasury,
   purses, shelf, offerings or loadouts). */
(function(C){
  const LNAME_MIN89=3,LNAME_MAX89=24,RENAME_MS89=30*86400e3,LOLD_MS89=14*86400e3,FIND_MAX89=20,INV89=['all','follow','none'];
  const FID_ABC89='23456789ABCDEFGHJKMNPQRSTUVWXYZ',FID_LEN89=6;
  const lnameClean=s=>String(s||'').replace(/[<>&"'`\\]/g,'').replace(/\s+/g,' ').trim();
  function lnameWhy(s){const n=lnameClean(s);if(n.length<LNAME_MIN89||n.length>LNAME_MAX89)return `Lanista name: ${LNAME_MIN89}–${LNAME_MAX89} letters.`;
    if(!/^[\p{L}][\p{L} .\-]*$/u.test(n))return 'Letters only, please.';if(C.nameBad(n))return 'Pick another name.';return ''}
  const lnameKey=s=>lnameClean(s).toLowerCase();
  /* when the next rename is allowed (0 = now) */
  const renameAt=A=>A&&A.nameAt&&A.lname?A.nameAt+RENAME_MS89:0;
  function renameWhy(A,now){const t=renameAt(A);return t>now?`One rename every 30 days — next on ${new Date(t).toISOString().slice(0,10)}.`:''}
  /* how others see the lanista: the name and, for 14 days after a rename, the former one */
  function lanOut(A,now){if(!A||!A.lname)return null;const o={n:A.lname};if(A.lold&&A.lold.until>now)o.old=A.lold.n;return o}
  function cleanPriv(p,old){const o={hide:!!(old&&old.hide),inv:INV89.includes(old&&old.inv)?old.inv:'all'};if(p&&p.hide!=null)o.hide=!!p.hide;if(p&&INV89.includes(p.inv))o.inv=p.inv;return o}
  const privOf=A=>cleanPriv(null,A&&A.priv89);
  /* may `by` ({domus}) invite T? '' or the reason */
  function invWhy(T,by){const p=privOf(T);if(p.inv==='none')return 'They take no invitations.';
    if(p.inv==='follow'&&!((T&&T.follows)||[]).some(f=>by&&f.id===by.domus))return 'They take invitations only from houses they follow.';return ''}
  function fidMake(rnd){let s='';for(let i=0;i<FID_LEN89;i++)s+=FID_ABC89[Math.floor((rnd||Math.random)()*FID_ABC89.length)%FID_ABC89.length];return s}
  /* "FID-ab3 xyz", "ab3xyz" → "AB3XYZ"; '' when it cannot be one */
  function fidClean(s){let x=String(s||'').toUpperCase().replace(/[\s\-_.]/g,'');if(x.length===FID_LEN89+3&&x.startsWith('FID'))x=x.slice(3);
    return x.length===FID_LEN89&&[...x].every(c=>FID_ABC89.includes(c))?x:''}
  const fidShow=c=>c?'FID-'+c:'';
  /* a house's public face: the record, colours, trophies — never the treasury, gifts, offerings, passes or the ledger */
  function domusPub(D){const r=C.domusRow(D);if(!r)return r;for(const k of ['treasury','gifts','offers','passDay','led89','upg89','smax','patron'])delete r[k];return r}
  /* a gladiator as a visitor sees him: what he WEARS, his rank and record — never his purse, satchel, loadouts or kept-home flags */
  function visitChar(ch){const eq=C.equipOf(ch);const pcs={};for(const it of eq){const u=C.itemUid(it);const P=u&&(ch.pcs||{})[u];if(P){const y={...P};delete y.home;pcs[u]=y}}
    return {id:ch.id,name:ch.name,cls:ch.cls,look:C.cleanLook(ch.look),alive:true,born:ch.born||0,rank:C.rankFor(ch).k,rankK:ch.rankK||null,glory:Math.round(C.gloryOf(ch)),
      bouts:ch.bouts|0,wins:ch.wins|0,survived:ch.survived|0,lifeCF:ch.lifeCF|0,gear:eq.slice(),equip:eq.slice(),pcs,...(ch.test?{test:true}:{})}}
  if(Array.isArray(C.GUEST_OK))for(const t of ['fid.find','domus.visit'])if(!C.GUEST_OK.includes(t))C.GUEST_OK.push(t);
  Object.assign(C,{LNAME_MIN89,LNAME_MAX89,RENAME_MS89,LOLD_MS89,FIND_MAX89,INV89,FID_ABC89,FID_LEN89,lnameWhy,lnameKey,lnameClean,renameAt,renameWhy,lanOut,
    cleanPriv89:cleanPriv,privOf89:privOf,invWhy89:invWhy,fidMake,fidClean,fidShow,domusPub89:domusPub,visitChar89:visitChar})})(ONLC);
/* ══════════ v0.89 N · FLAVIUS'S VAULT (his ask 2026-10-05: "pre-populate the auction house") ══════════
   With few players nobody's named gear has gone back to the chest, so the weekly auction stood empty. When the week's draw finds fewer than
   AUC_LOTS chest pieces, the rest come from FLAVIUS'S VAULT: named pieces rolled with the SAME tables as gifts (rollNamed / rollNamedArmor,
   NAMED_ARMOR_SHARE for the kind) on a vault tier curve VAULT_RAR89 (Rare 60 / Epic 32 / Legendary 8). Seeded by the week key + lot number
   (vaultLot89), so every server instance draws the same lots; a Legendary unique already claimed in the world is never minted (the roller skips
   claimed ones, the server re-rolls Epic when its claim loses a race: o.cap). Each piece carries 1–3 lines of OWNER HISTORY (the usual hist
   format + vault89:1, loc, ranked, wk, lan) of gladiators of five old houses run by fictional lanistas (VAULT_HOUSES89) — those lanista names
   AND house names are RESERVED (vaultReserved89: domusWhy + lnameWhy refuse them for real players). pc.vault89 marks the piece; the bidding,
   escrow, one win a house a week, the coin sink and Veteranus+ are unchanged; a won vault piece is an ordinary named piece of the winner. */
(function(C){
  const VAULT_RAR89=[['rare',60],['epic',32],['legendary',8]]; /* TWEAK: the vault's tier curve (gifts: RAR_W / RAR_A89) */
  const VAULT_HIST89=[[1,45],[2,35],[3,20]]; /* TWEAK: how many past owners a vault piece names */
  const VAULT_HOUSES89=[{lan:'Virgilante',house:'Aquila Aurea'},{lan:'Zora350',house:'Leaena Rubra'},{lan:'SrgtSlaughta',house:'Lanius'},{lan:'Duckio',house:'Anas Ferox'},{lan:'Sotonius',house:'Sotonius'}];
  const PRAE89=['Marcus','Gaius','Lucius','Titus','Quintus','Decimus','Aulus','Sextus','Gnaeus','Publius','Servius','Tiberius','Spurius','Numerius','Manius','Appius'];
  const COG89=['Crixus','Varro','Celadus','Flamma','Priscus','Verus','Spiculus','Tetraites','Carpophorus','Hermes','Oenomaus','Gannicus','Rufus','Niger','Felix','Corvus','Severus','Tigris','Ursus','Lupus','Ferox','Audax','Pugnax','Callidus'];
  /* the page's mulberry32 + an FNV hash (the same on page and server) */
  const mul=seed=>{let s=seed>>>0;return ()=>{let t=s=s+0x6D2B79F5>>>0;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}};
  const hsh=x=>{let h=2166136261;for(const ch of String(x))h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;return h};
  const wp=(rnd,tab)=>{const t=tab.reduce((a,x)=>a+x[1],0);let v=rnd()*t;for(const x of tab){if((v-=x[1])<0)return x[0]}return tab[tab.length-1][0]};
  const p1=(rnd,arr)=>arr[Math.min(arr.length-1,Math.floor(rnd()*arr.length))];
  /* reserved: the five lanistas and their houses (letters and digits only, any case, with or without "House": "Zora 350", "house sotonius") */
  const rkey=s=>String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
  const RES89=new Set(VAULT_HOUSES89.flatMap(H=>[rkey(H.lan),rkey(H.house)]));
  const vaultReserved89=s=>{const k=rkey(s);return !!k&&(RES89.has(k)||RES89.has(k.replace(/^(house|domus|ludus|familia|gens)/,'')))};
  const RES_MSG89='That name belongs to an old house of the arena.';
  {const base=C.domusWhy;C.domusWhy=function(s){const w=base.apply(this,arguments);return w||(vaultReserved89(s)?RES_MSG89:'')}}
  if(C.lnameWhy){const base=C.lnameWhy;C.lnameWhy=function(s){const w=base.apply(this,arguments);return w||(vaultReserved89(s)?RES_MSG89:'')}}
  const capRar=(r,cap)=>{const o=['common','rare','epic','legendary'];return cap&&o.indexOf(r)>o.indexOf(cap)?cap:r};
  /* the owner history: 1–3 gladiators of the old houses, oldest first; an earlier owner fell to the next one ('taken'), the last fell ('fell') */
  function vaultHist89(rnd,t0){const n=wp(rnd,VAULT_HIST89);const hs=VAULT_HOUSES89.slice();const out=[];let when=t0-(30+Math.floor(rnd()*30))*86400e3*n;
    for(let i=0;i<n;i++){const H=hs.splice(Math.floor(rnd()*hs.length)%hs.length,1)[0];when+=(5+Math.floor(rnd()*20))*86400e3;
      out.push({house:H.house,lan:H.lan,glad:p1(rnd,PRAE89)+' '+p1(rnd,COG89),when,how:i<n-1?'taken':'fell',loc:1+Math.floor(rnd()*12),ranked:rnd()<0.75,wk:1+Math.floor(rnd()*12),vault89:1})}
    return out}
  /* the vault's lot n of week `key` → {item, pc, rar, kind}. takenW / takenA = weapon / armor uniques already claimed; o.cap = the highest tier allowed
     (the server passes 'epic' when its unique claim lost a race); o.at = the week's start (history dates end before it). Same arguments → same piece. */
  function vaultLot89(key,n,catalog,takenW,takenA,o){o=o||{};const rnd=mul(hsh('vault89#'+key+'#'+n));
    const kind=rnd()<C.NAMED_ARMOR_SHARE?'a':'w';const rar=capRar(wp(rnd,VAULT_RAR89),o.cap);
    const def=kind==='a'?C.rollNamedArmor(rnd,catalog,rar,takenA||[]):C.rollNamed(rnd,catalog,rar,takenW||[]);if(!def)return null;
    const uid='v89-'+String(key).replace(/[^A-Za-z0-9]/g,'')+'-'+(n|0);const pre=kind==='a'?C.NAMED_A:C.NAMED;
    const t0=o.at!=null?o.at:C.seasonAt(Date.now()).start;
    return {item:pre+'#'+uid,pc:{st:'whole',rar:def.rar,w:{...def,key:pre+'_'+uid},hist:vaultHist89(rnd,t0),vault89:1},rar:def.rar,kind}}
  const isVault89=P=>!!(P&&P.pc&&(P.pc.vault89||(P.pc.hist||[]).some(h=>h&&h.vault89)));
  Object.assign(C,{VAULT_RAR89,VAULT_HIST89,VAULT_HOUSES89,vaultReserved89,vaultLot89,vaultHist89,isVault89})})(ONLC);
if(typeof module!=='undefined'&&module.exports)module.exports=ONLC;
