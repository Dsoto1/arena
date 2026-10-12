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
      off:Array.isArray(r.off)?r.off.filter(k=>OFFERS83.includes(k)).slice(0,OFF_CARRY).sort():[],dmg:cleanDmg(r.dmg),ks,kb:['g','b','a','r'].includes(r.kb)?r.kb:'',thumb:!!r.thumb,cpu:!!r.cpu}}
  /* v0.91 dmg = [[engine key, AP lost on its location 0..1 (2 decimals)],…] for brought printed armor still worn at the end (→ damaged, Ranked survivors) */
  function cleanDmg(a){if(!Array.isArray(a))return [];return a.filter(x=>Array.isArray(x)&&typeof x[0]==='string'&&KEY_RE.test(x[0])&&isFinite(+x[1])).slice(0,16)
    .map(x=>[x[0],Math.max(0,Math.min(1,Math.round(+x[1]*100)/100))]).filter(x=>x[1]>0).sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:a[1]-b[1])}
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
  const OFFERS83=Object.keys(PRICE_OFF), OFF_CARRY=2, OFF_MAX=2;
  /* v0.98 (his rule): a gladiator holds at most OFF_MAX=2 offerings and ALL he holds go into a match (ch.offerEq is kept but ignored) */
  function offersBrought(ch){return ((ch&&ch.offers)||[]).slice(0,OFF_CARRY)}
  function offerBuyWhy(ch,k){if(!ch||!ch.alive)return 'The dead buy nothing.';if(!OFFERS83.includes(k))return 'Flavius’s armory does not sell that.';
    if((ch.offers||[]).length>=OFF_MAX)return `He carries at most ${OFF_MAX} offerings.`;if((ch.wallet|0)<PRICE_OFF[k])return `Costs ${PRICE_OFF[k]} coin.`;return ''}
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
    const cap=dst.cls?OFF_MAX:OFF_SHELF;if((dst.offers||[]).length>=cap)return dst.cls?`He carries at most ${OFF_MAX} offerings.`:'The shelf is full.';return ''}
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
  function armPlace(occ,a){const locs=ARM_SIDES84[a.slot]||[a.slot];const k=(a.stack&&a.pt!=='upper'?'s:':'h:')+a.pt; /* v0.96: only lower padding (and the belt) stacks — an upper stackable piece (the Leather Tasset) takes its point alone */const free=locs.filter(l=>!(occ[l]||[]).includes(k));
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
  const AUC_LOTS=6, AUC_MIN_MS=86400000, AUC_SNIPE_MS=300000, AUC_STEP=0.05, AUC_STEP_MIN=10; /* TWEAK: lots a week, shortest life, snipe guard, raise */
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
     (cleanLook89, CREST89 = the printed banner devices), treasury UPGRADES (UPG89: a bigger offerings shelf; the 5th-slot upgrade is no longer sold, v1.0). */
(function(C){
  const CLASS_FEE89=100; /* TWEAK: a class change, from the treasury */
  const UPG89={shelf:{cost:400,add:4}}; /* TWEAK: once each, from the treasury */
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
  const minRar=(r,lo)=>{const o=['common','rare','epic','legendary'];return lo&&o.indexOf(lo)>o.indexOf(r)?lo:r};
  const capRar=(r,cap)=>{const o=['common','rare','epic','legendary'];return cap&&o.indexOf(r)>o.indexOf(cap)?cap:r};
  /* the owner history: 1–3 gladiators of the old houses, oldest first; an earlier owner fell to the next one ('taken'), the last fell ('fell') */
  function vaultHist89(rnd,t0){const n=wp(rnd,VAULT_HIST89);const hs=VAULT_HOUSES89.slice();const out=[];let when=t0-(30+Math.floor(rnd()*30))*86400e3*n;
    for(let i=0;i<n;i++){const H=hs.splice(Math.floor(rnd()*hs.length)%hs.length,1)[0];when+=(5+Math.floor(rnd()*20))*86400e3;
      out.push({house:H.house,lan:H.lan,glad:p1(rnd,PRAE89)+' '+p1(rnd,COG89),when,how:i<n-1?'taken':'fell',loc:1+Math.floor(rnd()*12),ranked:rnd()<0.75,wk:1+Math.floor(rnd()*12),vault89:1})}
    return out}
  /* the vault's lot n of week `key` → {item, pc, rar, kind}. takenW / takenA = weapon / armor uniques already claimed; o.cap = the highest tier allowed
     (the server passes 'epic' when its unique claim lost a race); o.at = the week's start (history dates end before it). Same arguments → same piece. */
  function vaultLot89(key,n,catalog,takenW,takenA,o){o=o||{};const rnd=mul(hsh('vault89#'+key+'#'+n));
    /* v0.91 o.kind ('a' | 'w') forces the kind, o.rar is the lowest tier (the draws still run, so the lot stays the same piece for the same options) */
    const kind0=rnd()<C.NAMED_ARMOR_SHARE?'a':'w';const kind=o.kind==='a'||o.kind==='w'?o.kind:kind0;const rar=capRar(minRar(wp(rnd,VAULT_RAR89),o.rar),o.cap);
    const def=kind==='a'?C.rollNamedArmor(rnd,catalog,rar,takenA||[]):C.rollNamed(rnd,catalog,rar,takenW||[]);if(!def)return null;
    const uid='v89-'+String(key).replace(/[^A-Za-z0-9]/g,'')+'-'+(n|0);const pre=kind==='a'?C.NAMED_A:C.NAMED;
    const t0=o.at!=null?o.at:C.seasonAt(Date.now()).start;
    return {item:pre+'#'+uid,pc:{st:'whole',rar:def.rar,w:{...def,key:pre+'_'+uid},hist:vaultHist89(rnd,t0),vault89:1},rar:def.rar,kind}}
  const isVault89=P=>!!(P&&P.pc&&(P.pc.vault89||(P.pc.hist||[]).some(h=>h&&h.vault89)));
  Object.assign(C,{VAULT_RAR89,VAULT_HIST89,VAULT_HOUSES89,vaultReserved89,vaultLot89,vaultHist89,isVault89})})(ONLC);
/* ══════════ v0.91 ONLINE ECONOMY II (his picks 2026-10-06; the page side is 197-v91econ) ══════════
   • DAMAGED PRINTED ARMOR (Ranked): a printed armor piece brought into a Ranked bout and still worn at the end, with AP lost on its location,
     comes home DAMAGED: pc.st 'damaged' + pc.dmg = the share of the location's AP lost (row.dmg, every client computes it from the lockstep
     state; cleanRow keeps it). Repair = ceil(price × dmg); it may be worn in Custom but never brought into Ranked until repaired (kit.dmgd,
     stripped by roomJoin / seatGroup / startRoom like kept-home pieces). Named pieces keep their rule (lost → broken; damage is ignored).
   • KEEP HOME = NAMED PIECES ONLY: homeSet refuses a printed piece; a printed piece that still carries the old flag counts as not kept home.
   • THE AUCTION: AUC_LOTS 6; aucPlan91 = what the vault must force so the week's lots hold ≥1 top-tier piece (Legendary while a unique of
     that kind is unclaimed, else Epic), ≥2 armor and ≥2 weapons (vaultLot89 o.kind / o.rar). */
(function(C){
  const DMG_ST='damaged';
  const isDamaged91=(h,it)=>{const p=C.pcOf(h,it);return !!(p&&p.st===DMG_ST)};
  const needsRepair91=(h,it)=>{const p=C.pcOf(h,it);return !!(p&&(p.st==='broken'||p.st===DMG_ST))};
  /* the piece's card carries its damage */
  for(const f of ['pieceInfo','pieceOf']){const base=C[f];C[f]=function(){const I=base.apply(this,arguments);try{if(I&&I.st===DMG_ST){const pc=f==='pieceInfo'?(arguments[0]&&arguments[0].pc):C.pcOf(arguments[0],arguments[1]);
      I.dmg=Math.max(0,Math.min(1,+(pc&&pc.dmg)||0))}}catch(e){}return I}}
  /* a broken piece: a third of its value; a damaged one: its value × the AP it lost (at least 1) */
  {const base=C.repairCost;C.repairCost=I=>I&&I.st===DMG_ST?Math.max(1,Math.ceil(C.valueOf(I)*(+I.dmg||0)-1e-9)):base(I)}
  {const base=C.repairItem;C.repairItem=function(h,it){const u=C.itemUid(it);const p=u&&h&&h.pcs&&h.pcs[u];if(p&&p.st===DMG_ST){const y={...p,st:'whole'};delete y.dmg;h.pcs={...h.pcs,[u]:y};return h}return base.apply(this,arguments)}}
  /* mark one held piece damaged, in place (a plain id is tagged so it can carry the state; it stays where it was in gear / equip) */
  function damageItem91(h,it,f){const g=(h.gear||[]).slice();const i=g.indexOf(it);if(i<0)return null;let id=it;let pc=C.pcOf(h,it);
    if(!C.itemUid(it)){id=it+'#'+C.newUid(h);pc={st:'whole'};g[i]=id;h.gear=g;if(Array.isArray(h.equip)){const e=h.equip.slice();const j=e.indexOf(it);if(j>=0){e[j]=id;h.equip=e}}}
    const u=C.itemUid(id);const was=pc&&pc.st===DMG_ST?+pc.dmg||0:0;h.pcs={...(h.pcs||{}),[u]:{...(pc||{}),st:DMG_ST,dmg:Math.round(Math.min(1,Math.max(was,f))*100)/100}};return id}
  {const base=C.gearAfter;C.gearAfter=function(ch,kit,row,ranked){const out=base.apply(this,arguments);out.dmg=[];
    try{if(ranked&&row&&row.survives!==false&&Array.isArray(row.dmg)&&row.dmg.length&&kit){const items=kit.items||[],gear=kit.gear||[];const used=new Set();
      for(const [k,f] of row.dmg){const j=gear.findIndex((g,i)=>g===k&&!used.has(i)&&!C.isNamed(items[i])&&(ch.gear||[]).includes(items[i]));if(j<0)continue;used.add(j);
        if(C.pcOf(ch,items[j])&&C.pcOf(ch,items[j]).st==='broken')continue;const nid=damageItem91(ch,items[j],+f||0);if(nid)out.dmg.push({item:nid,key:k,dmg:Math.round((+f||0)*100)/100})}}}catch(e){}
    return out}}
  /* keep home: named pieces only */
  {const base=C.isHome;C.isHome=(h,it)=>C.isNamed(it)&&base(h,it)}
  {const base=C.homeSet;C.homeSet=function(h,it,on){if(on&&!C.isNamed(it))throw new Error('Only named pieces stay home — printed gear is never kept out of Ranked.');return base.apply(this,arguments)}}
  /* the kit: kept-home = named only; damaged printed pieces listed apart (kit.dmgd) */
  {const base=C.kitOf;C.kitOf=function(ch){const k=base.apply(this,arguments);if(!k||!ch)return k;
    if(Array.isArray(k.home)){k.home=k.home.filter(it=>C.isNamed(it));if(!k.home.length)delete k.home}
    const d=(k.items||[]).filter(it=>!C.isNamed(it)&&isDamaged91(ch,it));if(d.length)k.dmgd=d;return k}}
  function dmgStrip91(kit){if(!kit||!Array.isArray(kit.dmgd)||!kit.dmgd.length)return kit;const left=kit.dmgd.slice();const gear=[],items=[];
    (kit.items||[]).forEach((it,i)=>{const j=left.indexOf(it);if(j>=0){left.splice(j,1);return}items.push(it);gear.push((kit.gear||[])[i])});
    const y={...kit,gear,items,dmgLeft:kit.dmgd.length};delete y.dmgd;return y}
  {const base=C.kitStrip;C.kitStrip=function(kit){if(kit&&Array.isArray(kit.home)){const h=kit.home.filter(it=>C.isNamed(it));kit=h.length?{...kit,home:h}:(()=>{const y={...kit};delete y.home;return y})()}return dmgStrip91(base.call(this,kit))}}
  const stripRoom91=L=>{if(!L||!L.ranked)return L;for(const p of L.players||[])if(p&&p.kit)p.kit=dmgStrip91(p.kit);for(const m of L.members||[])if(m&&m.kit)m.kit=dmgStrip91(m.kit);return L};
  for(const f of ['roomJoin','seatGroup']){const base=C[f];C[f]=function(L){const r=base.apply(this,arguments);try{stripRoom91(L)}catch(e){}return r}}
  {const base=C.startRoom;C.startRoom=function(L){try{stripRoom91(L)}catch(e){}return base.apply(this,arguments)}}
  /* ── the auction's guarantees ── */
  const AUC_MIN_A91=2, AUC_MIN_W91=2;
  const uniqLeft91=(kind,tW,tA)=>kind==='a'?C.UNIQ_A_KEYS.some(k=>!(tA||[]).includes(k)):C.UNIQUES.some(u=>!(tW||[]).includes(u.k));
  /* chest = the lots already drawn [{kind, rar}]; m = vault lots to make → the options for each (in lot order) */
  function aucPlan91(chest,m,tW,tA){chest=chest||[];const out=[];for(let j=0;j<m;j++)out.push({});if(!m)return out;
    const top=chest.some(x=>x&&(x.rar==='legendary'||(x.rar==='epic'&&!uniqLeft91(x.kind,tW,tA))));
    let a=Math.max(0,AUC_MIN_A91-chest.filter(x=>x&&x.kind==='a').length),w=Math.max(0,AUC_MIN_W91-chest.filter(x=>x&&x.kind==='w').length);
    for(const o of out){if(a>0){o.kind='a';a--}else if(w>0){o.kind='w';w--}}
    if(!top){let j=out.findIndex(o=>o.kind&&uniqLeft91(o.kind,tW,tA));if(j<0){j=out.findIndex(o=>!o.kind);if(j<0)j=0;
        if(!out[j].kind){const k=uniqLeft91('w',tW,tA)?'w':uniqLeft91('a',tW,tA)?'a':null;if(k)out[j].kind=k}}
      out[j].rar=out[j].kind&&uniqLeft91(out[j].kind,tW,tA)?'legendary':'epic'}
    return out}
  const lotKind91=(item)=>C.isNamedA(item)?'a':'w';
  const lotRar91=pc=>(pc&&(pc.rar||(pc.w&&pc.w.rar)))||'common';
  Object.assign(C,{isDamaged91,needsRepair91,damageItem91,dmgStrip91,AUC_MIN_A91,AUC_MIN_W91,uniqLeft91,aucPlan91,lotKind91,lotRar91})})(ONLC);
/* ══════════ v0.92 ONE TREASURY + ONLINE KITS (his picks 2026-10-06; the page side is 206-v92econ, the server routes.js "v0.92") ══════════
   • ONE TREASURY: gladiators keep no purse. Every survival award goes WHOLE to the house treasury (applyResult: out.cut = out.award, out.pay 0;
     the ledger keeps the earnings by gladiator under 'cut'); a purse left over from before (ch.wallet) moves into the treasury (the server's
     purse sweep, ledger 'purse' — "Purses moved to the treasury"). Every buy, ticket, wager, bid, repair and kit is paid by the treasury.
   • COIN SENT INTO A MATCH: before the horns a seated lanista sends 0–SEND_MAX92 coin (seat.send92, sendWhy92), on top of the class's starting
     coin; reserved from the treasury at the horns (seat.sent92, ledger out 'sent'). A survivor brings home his leftover coin up to what was sent
     (sendBack92 → ledger in 'back'); the dead (and those who abandon) lose it; a void / called-off match gives it all back.
   • KITS (market.kit): a CLASS KIT (the printed class's armor: classKits92, built from the game's class data — tools/mkserver.js writes
     server/src/kits92.json), the budget tiers KIT_TIERS92 (Scrap · Recruit · Champion), a RESTOCK of a saved loadout (what a bout used up), each
     planned by kitPlan92: pieces he holds (or the house shelf holds) are skipped — shelf pieces are moved onto him — and the rest is bought at its
     own price less KIT_DISC92 × the share of the kit bought. The FREE DAILY KIT (DAILY92, once an online day a house: D.kitDay92; only for points he leaves bare) is ISSUED
     (pc.iss): worth 0, never sold, never repaired, never looted — lost, used up or dented in a Ranked bout, it simply vanishes. */
(function(C){
  const SEND_MAX92=10, KIT_DISC92=0.15; /* TWEAK: coin a lanista may send into a match; the bundle discount for a whole kit */
  const KIT_TIERS92={scrap:['wraps','legwraps'],recruit:['galea','pectorale','balteus1','wraps','legwraps'],champ:['murmillo','lorica','balteus','provmanica','bracers','femoralia','ocrea']}; /* TWEAK */
  const KIT_KEYS92=['cls','scrap','recruit','champ'];
  const DAILY92=['galea','wraps','legwraps']; /* TWEAK: the free daily kit (Issued) */
  /* the printed classes' armor as kits (a pair piece once) — the shared default; the page builds it from CLASSES (onlKits92), the server reads kits92.json */
  const CLASS_KITS92={soldier:['centurion','balteus','wraps','legwrapsU'],royalty:['cassis','ornate','wraps'],hero:['thrachelm','provmanica','wraps','legwraps'],slave:['galea','manica','wraps','legwraps'],
    veteranus:['flavhelm','musculata','wraps','legwraps'],amazonia:['amazon','cestus','greaves','legwraps'],venatore:['steelhelm','balteus1','wraps','legwraps'],damnatio:['wraps','legwraps']};
  let KITS=null;const setKits92=t=>{KITS=t&&typeof t==='object'?t:null};
  const classKits92=()=>KITS||(typeof onlKits92==='function'?onlKits92():null)||CLASS_KITS92;
  /* a class's armor list [[key, loc], …] → the kit (a pair piece listed on both sides counts once) */
  function kitFromArmor92(armor,catalog){const n={},order=[];for(const [k] of armor||[]){if(!catalog||!catalog[k]||catalog[k].kind!=='a')continue;if(!(k in n))order.push(k);n[k]=(n[k]|0)+1}
    const out=[];for(const k of order){const c=catalog[k].pair?Math.ceil(n[k]/2):n[k];for(let i=0;i<c;i++)out.push(k)}return out}
  for(const k of ['purse','wager','back'])if(!C.LED_IN89.includes(k))C.LED_IN89.push(k);
  for(const k of ['sent','bet','off','auc','kit'])if(!C.LED_OUT89.includes(k))C.LED_OUT89.push(k);
  /* ── the award goes whole to the house ── */
  {const base=C.applyResult;C.applyResult=function(ch,row,ranked,x){const w0=ch?ch.wallet|0:0;const out=base.apply(this,arguments);if(ch)ch.wallet=w0;
    out.cut=out.award|0;out.pay=0;out.earn92=out.award|0;return out}}
  /* gifts: coin → the house (D) when it is given; otherwise the server's purse sweep moves it */
  {const base=C.applyGift;C.applyGift=function(ch,D,rw,P){if(D&&rw&&rw.k==='coin'){D.treasury=(D.treasury|0)+(rw.v|0);C.ledAdd(D,'gift',rw.v|0);return {to:'house'}}return base.apply(this,arguments)}}
  /* the guest pass: for thin TREASURIES now (the number passed in is the treasury) */
  {const base=C.passOK;C.passOK=function(L,who,T,lastDay,day){const w=base.apply(this,arguments);return /thin purses/.test(w)?`The guest pass is for thin treasuries — under ${C.PASS.wallet} coin.`:w}}
  {const base=C.betOK;C.betOK=function(){const w=base.apply(this,arguments);return w==='Not enough in the wallet.'?'Not enough in the treasury.':w}}
  /* ── coin sent into a match ── */
  function sendWhy92(n,T){if(!Number.isInteger(n)||n<0||n>SEND_MAX92)return `Send 0–${SEND_MAX92} coin.`;if(n>(T|0))return `The treasury holds only ${T|0} coin.`;return ''}
  /* what a seat brings home: his leftover coin (row.coin) up to what was sent; nothing for the dead or one who abandoned */
  const sendBack92=(sent,row,out)=>!row||!out||out.died||out.abandoned?0:Math.max(0,Math.min(sent|0,row.coin|0));
  /* ── ISSUED pieces (the free daily kit): worth nothing, never repaired, never looted ── */
  const isIssued92=(h,it)=>{const p=C.pcOf(h,it);return !!(p&&p.iss)};
  for(const f of ['pieceInfo','pieceOf']){const base=C[f];C[f]=function(){const I=base.apply(this,arguments);try{if(I&&!I.named){const pc=f==='pieceInfo'?(arguments[0]&&arguments[0].pc):C.pcOf(arguments[0],arguments[1]);if(pc&&pc.iss){I.iss=1;I.val=0}}}catch(e){}return I}}
  /* after a bout: an issued piece the dead carried vanishes (no loot, no market); a dented one vanishes too (it cannot be repaired); a used-up one is gone as any printed piece */
  {const base=C.gearAfter;C.gearAfter=function(ch,kit,row,ranked){const out=base.apply(this,arguments);out.vanish=[];
    try{if(out.carried&&out.carried.length)out.carried=out.carried.filter(P=>{if(P&&P.pc&&P.pc.iss){out.vanish.push(C.itemBase(P.item));return false}return true});
      if(Array.isArray(out.dmg)&&out.dmg.length)out.dmg=out.dmg.filter(x=>{if(!isIssued92(ch,x.item))return true;C.takePiece(ch,x.item);out.vanish.push(C.itemBase(x.item));(out.gone=out.gone||[]).push(C.itemBase(x.item));return false})}catch(e){}
    return out}}
  /* ── KITS ── */
  const priceL=(list,catalog)=>(list||[]).reduce((a,k)=>a+(catalog[k]?C.priceOf(catalog[k]):0),0);
  /* the piece list of a kit: 'cls' (the gladiator's class), a tier key, 'daily' */
  function kitList92(k,cls){if(k==='cls')return (classKits92()[cls]||[]).slice();if(KIT_TIERS92[k])return KIT_TIERS92[k].slice();if(k==='daily')return DAILY92.slice();return null}
  /* the plan for list on gladiator ch with the house shelf D: have (held items), take (shelf items to move onto him), buy (bases), and the price:
     full = the whole kit at catalog prices, part = what is bought, disc = round(part × KIT_DISC92 × part/full), cost = part − disc (o.free: 0) */
  function kitPlan92(ch,D,list,catalog,o){o=o||{};const ok=(h,it)=>!C.isNamed(it)&&!C.isBroken(h,it)&&!!catalog[C.itemBase(it)];
    const mine=((ch&&ch.gear)||[]).filter(it=>ok(ch,it)),shelf=((D&&D.gear)||[]).filter(it=>ok(D,it));const have=[],take=[],buy=[];
    /* o.fill (the free daily kit): only pieces for points he leaves bare — it never pushes off what he wears */
    const worn=o.fill&&ch?C.equipOf(ch):[];const cover=[];
    for(const b of list||[]){if(!catalog[b])continue;let i=mine.findIndex(it=>C.itemBase(it)===b);if(i>=0){have.push(mine.splice(i,1)[0]);continue}
      if(o.fill&&C.armFit(ch,[...worn,...buy,b],catalog).pop()===false){cover.push(b);continue}
      i=shelf.findIndex(it=>C.itemBase(it)===b);if(i>=0&&!o.fill){take.push(shelf.splice(i,1)[0]);continue}buy.push(b)}
    const full=priceL((list||[]).filter(b=>catalog[b]),catalog),part=priceL(buy,catalog);const share=full?part/full:0;
    const disc=o.free?part:Math.round(part*KIT_DISC92*share);return {have,take,buy,cover,full,part,disc,cost:part-disc,share:Math.round(share*100)/100}}
  /* a saved loadout's printed pieces as a list of bases (named ones cannot be bought again) */
  const restockList92=K=>((K&&K.items)||[]).filter(it=>!C.isNamed(it)).map(C.itemBase);
  /* the new pieces of a kit (issued ones get their own id + the mark) */
  function kitPieces92(h,buy,issued){return (buy||[]).map(b=>issued?{item:b+'#'+C.newUid(h),pc:{st:'whole',iss:1}}:{item:b,pc:null})}
  /* what he wears after a kit: the kit's pieces first (they win a point), then what he wore before */
  function kitEquip92(ch,plan,news){const first=[...plan.have,...plan.take,...(news||[]).map(P=>P.item)];const rest=(Array.isArray(ch.equip)?ch.equip:C.equipOf0(ch)).filter(it=>!first.includes(it));return first.concat(rest)}
  /* a restocked loadout points at the pieces he holds now: a lost id is replaced by a held piece of the same base (pool = the kit's pieces) */
  function kitRemap92(ch,ki,pool){const K=Array.isArray(ch.kits89)?ch.kits89[ki]:null;if(!K)return ch;const used=new Set();const items=[];
    for(const it of K.items||[]){if((ch.gear||[]).includes(it)&&!used.has(it)){used.add(it);items.push(it);continue}if(C.isNamed(it))continue;
      const j=(pool||[]).findIndex(y=>!used.has(y)&&(ch.gear||[]).includes(y)&&C.itemBase(y)===C.itemBase(it));if(j>=0){used.add(pool[j]);items.push(pool[j])}}
    ch.kits89=ch.kits89.map((x,j)=>j===ki?{...x,items}:x);return ch}
  /* '' or why this kit cannot be had now (T = the treasury, day = the online day) */
  function kitWhy92(k,plan,D,T,day){if(k==='daily'){if(D&&D.kitDay92===day)return 'One free kit a day for each house — come back tomorrow.';if(!plan.buy.length)return 'He already has all of it.';return ''}
    if(!plan.buy.length&&!plan.take.length)return 'He already has all of it.';if(plan.cost>(T|0))return `The treasury needs ${plan.cost} coin.`;return ''}
  /* the house row carries the daily kit's day; a visitor never sees it */
  {const base=C.domusRow;C.domusRow=function(D){const r=base.apply(this,arguments);if(r&&D){if(D.kitDay92)r.kitDay92=D.kitDay92;if(D.purse92)r.purse92=D.purse92}return r}}
  {const base=C.domusPub89;if(base)C.domusPub89=function(D){const r=base.apply(this,arguments);if(r){delete r.kitDay92;delete r.purse92}return r}}
  Object.assign(C,{SEND_MAX92,KIT_DISC92,KIT_TIERS92,KIT_KEYS92,DAILY92,CLASS_KITS92,setKits92,classKits92,kitFromArmor92,sendWhy92,sendBack92,isIssued92,kitList92,kitPlan92,restockList92,kitPieces92,kitEquip92,kitRemap92,kitWhy92})})(ONLC);
/* ══════════ v0.93 BACKEND HARDENING (phase 1) — shared by the server (routes.js) and the page's mock server (223-v93harden) ══════════
   • IDEMPOTENCY: every request in IDEM93 that spends, moves or claims something may carry a client request id `rid` (ridOK93); the
     server keeps its reply for IDEM_MS93 (10 min) per account + rid and answers a replay with that reply instead of acting twice.
     A rid still in flight → 'rid_busy' (the client waits and asks again); a rid reused for another request → 'rid_reuse'.
   • RATE LIMIT: one token bucket per account (guests by id) on top of the per-feature limits — RATE93 {burst, per second};
     match.* requests (lockstep moves, hashes, snapshots) fill their own, larger bucket. Refusal = code 'rate_limit' + {wait} ms. */
(function(C){
  const IDEM93=['char.buy','offer.buy','market.buy','lobby.ticket','lobby.pass','bet.place','auction.bid','gear.repair','lobby.send','market.kit','gift.open',
    'domus.buy','domus.upgrade','char.class','char.create','char.edit','char.kitapply','domus.create','domus.rename','domus.move','domus.equip','domus.dress',
    'gear.home','offer.move','offer.bring','loot.pick','lanista.name','domus.patron','domus.look','admin.grant'];
  const IDEM_MS93=10*60e3,RID_BUSY_MS93=60e3;
  const RATE93={burst:40,per:10,mburst:90,mper:30};
  const ridOK93=r=>typeof r==='string'&&/^[A-Za-z0-9_-]{8,40}$/.test(r);
  /* one token bucket: B = {n, at} (mutated) → 0 when a token was taken, else the ms to wait for one */
  function bucket93(B,now,burst,per){if(B.at==null){B.n=burst;B.at=now}const add=Math.max(0,now-B.at)*per/1000;B.n=Math.min(burst,B.n+add);B.at=now;
    if(B.n>=1){B.n-=1;return 0}return Math.max(1,Math.ceil((1-B.n)*1000/per))}
  const rateClass93=t=>/^match\./.test(String(t||''))?'m':'g';
  /* a limiter over many keys (accounts / guests), forgetting idle ones */
  function limiter93(cfg){cfg=cfg||RATE93;const M=new Map();let sweep=0;
    return (key,t,now)=>{if(!key)return 0;if(now-sweep>60e3){sweep=now;for(const [x,y] of M)if(now-(y.at||0)>120e3)M.delete(x)}
      const c=rateClass93(t);const k=c+'|'+key;let B=M.get(k);if(!B){B={};M.set(k,B)}
      return c==='m'?bucket93(B,now,cfg.mburst,cfg.mper):bucket93(B,now,cfg.burst,cfg.per)}}
  Object.assign(C,{IDEM93,IDEM_MS93,RID_BUSY_MS93,RATE93,ridOK93,bucket93,rateClass93,limiter93})})(ONLC);
/* ══════════ v0.94 ONLINE 3D TOKENS AS SERVER PICTURES — shared by the server (routes.js) and the page's mock server (226-v94onltok) ══════════
   The owner's browser renders the v0.93 token sheet (8 facings in one row, minis8 format, meta [cellW,cellH,anchorX,anchorY]) once and
   uploads it; the server keeps ONE picture per gladiator in its own item (TOK#<char> / PIC) and every screen downloads it by hash.
   • API Gateway WebSocket limits: a client frame ≤ 32 KB (browsers never fragment), a message ≤ 128 KB → the upload goes in parts of
     ≤ TOK94.PART base64 characters (char.tok, one part a request, ≤ TOK94.PARTS parts); a download (tok.get) is one reply ≤ ~90 KB.
   • The picture: WebP only (RIFF….WEBP magic + a consistent RIFF size), ≤ TOK94.MAX bytes decoded, exactly 8 × cellW wide and cellH high
     (read from the VP8 / VP8L / VP8X header), meta within TOK94 bounds, the pose JSON ≤ TOK94.POSE bytes.
   • The gladiator carries only the reference ch.tok94 = {h, at} (h = tokHash94 of the bytes); kitOf passes it on as kit.look.t94 = {c, h}
     so every seat in a room / match knows which picture to fetch. Drawing only: nothing of it enters the lockstep state or its hash. */
(function(C){
  const TOK94={MAX:65536,PART:24000,PARTS:4,POSE:600,PK:16,DAY_MAX:12,W:[40,240],H:[60,240],UP_MS:3600e3};
  const B64=/^[A-Za-z0-9+/]*={0,2}$/;
  const HID=/^[A-Za-z0-9_-]{1,40}$/,HH=/^t[0-9a-z]{4,16}$/;
  function b64Bytes94(s){s=String(s||'');if(typeof Buffer!=='undefined')return new Uint8Array(Buffer.from(s,'base64'));const bin=atob(s);const a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a}
  /* a 53-bit hash of the bytes (the same on the server and in the page) */
  function tokHash94(a){let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0;i<a.length;i++){const c=a[i];h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}
    h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
    return 't'+(4294967296*(2097151&h2)+(h1>>>0)).toString(36)}
  /* WebP width × height from its header, or null (not a WebP / a broken one) */
  function webpDims94(a){if(!a||a.length<30)return null;const s=(o,n)=>String.fromCharCode(...a.slice(o,o+n));if(s(0,4)!=='RIFF'||s(8,4)!=='WEBP')return null;
    const riff=(a[4]|a[5]<<8|a[6]<<16|a[7]<<24)>>>0;if(riff+8!==a.length)return null;const fc=s(12,4);
    if(fc==='VP8X')return {w:1+(a[24]|a[25]<<8|a[26]<<16),h:1+(a[27]|a[28]<<8|a[29]<<16)};
    if(fc==='VP8 '){if(a[23]!==0x9d||a[24]!==0x01||a[25]!==0x2a)return null;return {w:(a[26]|a[27]<<8)&0x3fff,h:(a[28]|a[29]<<8)&0x3fff}}
    if(fc==='VP8L'){if(a[20]!==0x2f)return null;const b=a[21]|a[22]<<8|a[23]<<16|a[24]<<24;return {w:1+(b&0x3fff),h:1+((b>>>14)&0x3fff)}}
    return null}
  /* '' or why the meta is refused */
  function tokMetaWhy94(m){if(!Array.isArray(m)||m.length!==4||!m.every(x=>typeof x==='number'&&isFinite(x)))return 'That token picture is not a token sheet.';
    const [w,h,ax,ay]=m;if(w!==Math.round(w)||h!==Math.round(h)||w<TOK94.W[0]||w>TOK94.W[1]||h<TOK94.H[0]||h>TOK94.H[1]||ax<0||ax>w||ay<0||ay>h)return 'That token picture is not a token sheet.';return ''}
  function tokPoseWhy94(pose,pk){if(pose!=null){if(typeof pose!=='string'||pose.length>TOK94.POSE)return 'The pose is too long.';if(pose){try{const o=JSON.parse(pose);if(!o||typeof o!=='object'||Array.isArray(o))return 'The pose is not readable.'}catch(e){return 'The pose is not readable.'}}}
    if(pk!=null&&(typeof pk!=='string'||!/^[a-z0-9]{0,16}$/.test(pk)))return 'The pose is not readable.';return ''}
  /* one upload part: '' or why */
  function tokPartWhy94(d){if(!d||!HID.test(String(d.up||''))||!(d.n>=1&&d.n<=TOK94.PARTS&&d.n===Math.round(d.n))||!(d.i>=0&&d.i<d.n&&d.i===Math.round(d.i)))return 'That upload is out of order — save the token again.';
    if(typeof d.b!=='string'||!d.b.length||d.b.length>TOK94.PART)return 'Each part of the picture may hold at most 24000 characters.';if(!B64.test(d.b))return 'That token picture is not a WebP image.';return ''}
  /* the whole picture: → {why} or {bytes, dims, h} */
  function tokCheck94(b64,meta){const mw=tokMetaWhy94(meta);if(mw)return {why:mw};if(typeof b64!=='string'||b64.length>Math.ceil(TOK94.MAX/3)*4)return {why:'The token picture is too big (64 KB at most).'};
    if(!B64.test(b64))return {why:'That token picture is not a WebP image.'};const bytes=b64Bytes94(b64);if(bytes.length>TOK94.MAX)return {why:'The token picture is too big (64 KB at most).'};
    const dims=webpDims94(bytes);if(!dims)return {why:'That token picture is not a WebP image.'};
    if(dims.w!==8*meta[0]||dims.h!==meta[1])return {why:'The token picture has the wrong size for its sheet.'};return {bytes,dims,h:tokHash94(bytes)}}
  const tokRef94=x=>x&&typeof x==='object'&&HH.test(String(x.h||''))?{h:String(x.h),at:x.at|0}:null;
  /* the kit tells every seat which picture the gladiator wears */
  {const base=C.kitOf;C.kitOf=function(ch){const k=base.apply(this,arguments);try{const r=k&&ch&&HID.test(String(ch.id||''))&&tokRef94(ch.tok94);if(r)k.look={...(k.look||{}),t94:{c:ch.id,h:r.h}}}catch(e){}return k}}
  /* a look's picture reference (rooms, seats), or null */
  const lookTok94=L=>{const t=L&&L.t94;return t&&HID.test(String(t.c||''))&&HH.test(String(t.h||''))?{c:String(t.c),h:String(t.h)}:null};
  if(Array.isArray(C.GUEST_OK)&&!C.GUEST_OK.includes('tok.get'))C.GUEST_OK.push('tok.get'); /* watchers see the pictures too */
  if(Array.isArray(C.IDEM93)&&!C.IDEM93.includes('char.tok'))C.IDEM93.push('char.tok'); /* each part carries its own rid: a replayed part is answered once */
  Object.assign(C,{TOK94,b64Bytes94,tokHash94,webpDims94,tokMetaWhy94,tokPoseWhy94,tokPartWhy94,tokCheck94,tokRef94,lookTok94})})(ONLC);
/* ══════════ v0.98 PART E — ONLINE: passwords, regions, the house card, DOMUS RANK, silent Find me a fight, more events (Custom), Damnatio at
   creation only, the bonus renames. Shared by the server (routes.js "v0.98" block) and the page's mock (250-v98onl). No protocol bump: an older
   page keeps working against this server (new fields are extra; a password room simply refuses it; renames are display). ══════════
   1 · PASSWORDS (Custom rooms only; his q3a): pwWhy98 checks one; the server keeps a SALTED HASH (pwHash98 = SHA-256 of salt + password, pure JS so
       the page's mock hashes the same) in its own item, never on the room — the room only carries pw:1 (🔒 in the list). Ranked refuses one.
       Find me a fight never picks a 🔒 room (quickPick wrapper). An invitation lets the guest in without the password.
   2 · REGIONS (his q2a): regionOf98(time zone) → one of REGIONS98 (7) from the host's browser time zone (no IP); each wears a flag drawn
       with the game's banner press (flagURI: bg, fg, device, word). The room carries reg; a hidden lanista's room has none.
   3 · THE HOUSE CARD: a small public summary (route house.card) — record, living gladiators, fallen, best rank ever, the last 6 events W/L,
       the Domus rank; privacy respected (a hidden lanista shows no "now").
   4 · DOMUS RANK (his q1a): drankScore98 = the best 4 LIVING gladiators' Glory + 20% of ALL fallen gladiators' Glory; the server keeps the
       best ever (D.dr98 — it never drops); tiers DRANKS98 with a symbol each (q4a: hut, amphora, wooden sword, crossed blades, helm, shield,
       laurel, eagle — no numerals). domusRow carries dr98 = {s, k}; room members carry dr (tier key) so every house name wears its banner.
   5 · (server only) lobby.quick never calls the crier.
   6 · MORE EVENTS, CUSTOM ONLY (his 1a 2b 3a): EVENTS_CUSTOM98 = Golden Eagle (teams; Ludus was dropped — no per-lanista draft yet). C.EVENTS_ALL / C.EVENTS_TEAM become NEW lists that
       include them — the internal lists (and so the weekly fixture, onlineFixture) are untouched; newLobby / roomSet refuse them in Ranked.
       Gauntlet is left out: a solo event (1 seat) cannot hold the 2 lanistas an online match needs.
   7 · DAMNATIO ONLY AT CREATION (v0.95 rule): classWhy refuses a switch into or out of Damnatio; other class changes stay 100 coin.
   8 · BONUS RENAMES (his approved table 2026-10-08): Gloriosus → Gloriosus I · weapon unique Gloriae → Gloriosus II · Acutus → Acutus I ·
       Percussor → Acutus II · Velox → Velox I · armor unique Mercurii → Velox II · armor unique Gloriae → Laudis; Tutus and Aegis keep theirs.
       A named piece's name is STORED (rolled once), so rename98(def) rewrites it from its affixes / unique (idempotent, gender kept): new rolls,
       the engine's defs (cleanNamed / cleanNamedA) and — in the page — every reply and push (250-v98onl) show the new names. */
(function(C){
  /* ── 1 · passwords ── */
  const PW98={MIN:3,MAX:24,TRIES:8,WIN:600e3}; /* TWEAK: length; wrong guesses an account may make per 10 minutes */
  const pwClean98=s=>String(s==null?'':s).replace(/[\u0000-\u001f]/g,'').trim().slice(0,64);
  function pwWhy98(pw,ranked){const p=pwClean98(pw);if(ranked)return 'Ranked rooms are open to all — passwords are for Custom rooms.';
    if(p.length<PW98.MIN||p.length>PW98.MAX)return `A password: ${PW98.MIN}–${PW98.MAX} characters.`;return ''}
  /* SHA-256 (hex) of a string's UTF-8 bytes — small and pure, the same in Node and the browser */
  function sha256hex98(str){const b=unescape(encodeURIComponent(String(str)));const K=[],H=[];let n=2,c=0;
    const fr=x=>(x-Math.floor(x))*4294967296|0;while(c<64){let p=true;for(let i=2;i*i<=n;i++)if(n%i===0){p=false;break}if(p){if(c<8)H[c]=fr(Math.pow(n,1/2));K[c]=fr(Math.cbrt(n));c++}n++}
    const w=[];const len=b.length;const words=[];for(let i=0;i<len;i++)words[i>>2]|=b.charCodeAt(i)<<((3-i%4)*8);words[len>>2]|=0x80<<((3-len%4)*8);
    const nb=((len+8)>>6)+1;for(let i=0;i<nb*16;i++)words[i]=words[i]|0;words[nb*16-1]=len*8;
    const r=(x,k)=>(x>>>k)|(x<<(32-k));const h=H.slice();
    for(let j=0;j<nb*16;j+=16){const a=h.slice();for(let i=0;i<64;i++){if(i<16)w[i]=words[j+i]|0;else{const s0=r(w[i-15],7)^r(w[i-15],18)^(w[i-15]>>>3),s1=r(w[i-2],17)^r(w[i-2],19)^(w[i-2]>>>10);w[i]=(w[i-16]+s0+w[i-7]+s1)|0}
        const S1=r(a[4],6)^r(a[4],11)^r(a[4],25),ch=(a[4]&a[5])^(~a[4]&a[6]),t1=(a[7]+S1+ch+K[i]+w[i])|0,S0=r(a[0],2)^r(a[0],13)^r(a[0],22),mj=(a[0]&a[1])^(a[0]&a[2])^(a[1]&a[2]),t2=(S0+mj)|0;
        a.pop();a.unshift((t1+t2)|0);a[4]=(a[4]+t1)|0}for(let i=0;i<8;i++)h[i]=(h[i]+a[i])|0}
    return h.map(x=>(x>>>0).toString(16).padStart(8,'0')).join('')}
  const pwHash98=(salt,pw)=>sha256hex98('flavius98|'+String(salt)+'|'+pwClean98(pw));
  /* playlists never seat anyone in a locked room */
  {const base=C.quickPick;C.quickPick=function(list){return base.apply(this,[(list||[]).filter(L=>!L||!L.pw),...[].slice.call(arguments,1)])}}

  /* ── 2 · regions (from the host's time zone) ── */
  const REGIONS98=[
    {k:'na',n:'North America',w:'AMERICA',bg:'#1c3566',fg:'#e8e0cc',shape:'mount'},
    {k:'sa',n:'South America',w:'AMERICA·S',bg:'#1d4a2a',fg:'#f0d66a',shape:'sun'},
    {k:'eu',n:'Europe',w:'EVROPA',bg:'#6e1414',fg:'#e2b64a',shape:'column'},
    {k:'af',n:'Africa',w:'AFRICA',bg:'#8a5a0e',fg:'#fff0b8',shape:'lion'},
    {k:'me',n:'Middle East',w:'ORIENS',bg:'#11474a',fg:'#e9efe6',shape:'olive'},
    {k:'as',n:'Asia',w:'ASIA',bg:'#3d1c4a',fg:'#e6c46a',shape:'tower'},
    {k:'oc',n:'Oceania',w:'OCEANVS',bg:'#1d3f5c',fg:'#e8b26a',shape:'ship'}];
  const SA98=/^America\/(Sao_Paulo|Buenos_Aires|Argentina\/|Santiago|Lima|Bogota|Caracas|Montevideo|La_Paz|Asuncion|Guayaquil|Cayenne|Paramaribo|Guyana|Belem|Fortaleza|Recife|Manaus|Bahia|Cuiaba|Porto_Velho|Rio_Branco|Noronha|Maceio|Araguaina|Campo_Grande|Santarem|Boa_Vista|Punta_Arenas|Cordoba|Mendoza|Catamarca|Jujuy|Rosario)/;
  const ME98=/^Asia\/(Dubai|Riyadh|Tehran|Baghdad|Jerusalem|Tel_Aviv|Beirut|Damascus|Amman|Qatar|Kuwait|Bahrain|Muscat|Aden|Gaza|Hebron|Nicosia|Famagusta)|^Europe\/Istanbul$|^Asia\/Istanbul$/;
  function regionOf98(tz){tz=C.cleanTz(tz);if(!tz)return '';if(SA98.test(tz))return 'sa';if(ME98.test(tz))return 'me';const p=tz.split('/')[0];
    if(p==='America'||p==='US'||p==='Canada'||p==='Mexico')return 'na';if(p==='Atlantic')return /Bermuda/.test(tz)?'na':/Stanley|South_Georgia/.test(tz)?'sa':'eu';if(p==='Europe')return 'eu';
    if(p==='Africa')return 'af';if(p==='Asia'||p==='Indian')return 'as';if(p==='Australia'||p==='Pacific')return /Honolulu/.test(tz)?'na':'oc';return ''}
  const regionByKey98=k=>REGIONS98.find(r=>r.k===k)||null;

  /* ── 4 · DOMUS RANK ── */
  const DRANKS98=[
    {k:'tugurium',n:'Tugurium',at:0,sym:'hut',bg:'#5d5246',fg:'#eadfc4'},
    {k:'taberna',n:'Taberna',at:200,sym:'amphora',bg:'#6e6236',fg:'#f2e4b2'},
    {k:'ludusminor',n:'Ludus Minor',at:600,sym:'rudis',bg:'#874626',fg:'#f6dcbc'},
    {k:'ludus',n:'Ludus',at:1500,sym:'blades',bg:'#2b5a78',fg:'#eaf1f4'},
    {k:'ludusmagnus',n:'Ludus Magnus',at:3000,sym:'helm',bg:'#6e1d22',fg:'#f0cf7d'},
    {k:'familianota',n:'Familia Nota',at:5500,sym:'shield',bg:'#4a2a6a',fg:'#f2da92'},
    {k:'illustris',n:'Domus Illustris',at:9000,sym:'laurel',bg:'#9a7524',fg:'#fff3c8'},
    {k:'aurea',n:'Domus Aurea',at:15000,sym:'eagle',bg:'#c08a22',fg:'#fff8de'}];
  const DR_TOP98=4, DR_FALLEN98=0.2;
  function drankScore98(chars){const g=c=>Math.max(0,+C.gloryOf(c)||0);const all=(chars||[]).filter(Boolean);
    const live=all.filter(c=>c.alive).map(g).sort((a,b)=>b-a).slice(0,DR_TOP98).reduce((a,x)=>a+x,0);const fell=all.filter(c=>!c.alive).map(g).reduce((a,x)=>a+x,0);
    return Math.round((live+DR_FALLEN98*fell)*10)/10}
  function drankOf98(s){let r=DRANKS98[0];for(const R of DRANKS98)if((+s||0)>=R.at)r=R;return r}
  const drankIdx98=k=>Math.max(0,DRANKS98.findIndex(r=>r.k===k));
  /* the stored best never drops: → true when D changed */
  function drankKeep98(D,s){if(!D)return false;s=+s||0;if(s>(+D.dr98||0)){D.dr98=s;return true}return false}
  {const base=C.domusRow;C.domusRow=function(D){const r=base.apply(this,arguments);if(r&&D){const s=+D.dr98||0;r.dr98={s:Math.floor(s),k:drankOf98(s).k}}return r}}
  /* room members (and seats) carry their house's tier key; lists show it beside every name */
  const DRK98=/^[a-z]{3,16}$/;
  {const base=C.roomJoin;C.roomJoin=function(L,whos){const r=base.apply(this,arguments);try{if(!r)for(const w of whos||[]){if(!w||!DRK98.test(String(w.dr||'')))continue;
        for(const x of [...(L.members||[]),...(L.players||[])])if(x.id===w.id)x.dr=w.dr;if(L.host&&L.host.id===w.id)L.host.dr=w.dr}}catch(e){}return r}}
  {const base=C.liteRow;C.liteRow=function(L){const y=base.apply(this,arguments);try{const dr={};for(const x of [...(L.members||[]),...(L.players||[])])if(x&&x.dr)dr[x.id]=x.dr;
      for(const x of [...(y.members||[]),...(y.players||[])])if(dr[x.id])x.dr=dr[x.id];if(y.host&&dr[y.host.id])y.host={...y.host,dr:dr[y.host.id]}}catch(e){}return y}}

  /* ── 6 · more events, Custom only ── */
  const EVENTS_CUSTOM98=['goldenEagle'];  /* v0.98: Ludus stays OFFLINE until every lanista can draft their own gear (his pick C) */
  const EV_SEATS98={goldenEagle:[4,8]};
  Object.assign(C.EV_SEATS,EV_SEATS98);
  const ALL0=C.EVENTS_ALL.slice(),TEAM0=C.EVENTS_TEAM.slice();
  C.EVENTS_ALL=ALL0.concat(EVENTS_CUSTOM98.filter(k=>!ALL0.includes(k)));
  C.EVENTS_TEAM=TEAM0.concat(['goldenEagle'].filter(k=>!TEAM0.includes(k)));
  const customOnly98=ev=>EVENTS_CUSTOM98.includes(ev);
  const CUSTOM_ONLY_TXT='That event is played online as Custom only.';
  const OFFLINE_ONLY98=['ludus'],OFFLINE_TXT='That event is not played online yet.';
  {const base=C.newLobby;C.newLobby=function(spec,host,id,now){spec=spec||{};if(OFFLINE_ONLY98.includes(spec.ev))throw new Error(OFFLINE_TXT);if(!customOnly98(spec.ev))return base.apply(this,arguments);if(spec.ranked)throw new Error(CUSTOM_ONLY_TXT);
    const L=base.call(this,{...spec,ev:'democritus'},host,id,now);L.ev=spec.ev;L.team=C.EVENTS_TEAM.includes(spec.ev);L.teams=2;L.seats=C.clampSeats(spec.ev,spec.seats||4);return L}}
  {const base=C.roomSet;C.roomSet=function(L,by,d,now){d=d||{};if(OFFLINE_ONLY98.includes(d.ev))return OFFLINE_TXT;if(d.ev==null||d.ev===L.ev||!customOnly98(d.ev))return base.apply(this,arguments);
    if(L.host.id!==by)return 'Only the host changes the game.';if(L.status!=='waiting')return 'Already under way.';if(L.ranked)return CUSTOM_ONLY_TXT;
    const wasTeam=L.team;L.ev=d.ev;L.team=C.EVENTS_TEAM.includes(d.ev);if(L.team&&!wasTeam){L.teams=2;L.players.forEach((p,i)=>{p.team=C.TEAM_KEYS[i%2]})}if(!L.team)for(const p of L.players)delete p.team;
    for(const p of L.players)p.ready=false;const x={...d};delete x.ev;if(x.seats==null)x.seats=L.seats;return base.call(this,L,by,x,now)}}

  /* ── 7 · Damnatio only at creation ── */
  const DAMN98='damnatio';
  {const base=C.classWhy;if(base)C.classWhy=function(ch,cls){if(ch&&ch.alive&&cls!==ch.cls&&(cls===DAMN98||ch.cls===DAMN98))return ch.cls===DAMN98?'A Damnatio stays condemned — the class is chosen only when he is raised.':'Damnatio is chosen only when a gladiator is raised.';return base.apply(this,arguments)}}

  /* ── 8 · the bonus renames ── */
  {const U=k=>C.UNIQUES.find(u=>u.k===k),UA=k=>C.UNIQUES_A.find(u=>u.k===k);const set=(u,n)=>{if(u)u.n=n};
    set(U('gloria'),'Gloriosus II');set(U('percussor'),'Acutus II');set(UA('mercurialis'),'Velox II');set(UA('gloriosa'),'Laudis')}
  /* the noun's gender (0 m · 1 f · 2 n · 3 pl), as the namer used it */
  const GEN_W98={gladius:0,mace:1,sica:1,hasta:1,stones:3,thracian:1,knives:3,trident:0,rudis:1,axe:1,falcata:1,bow:0,pugio:0,scissor:1,scutum:2,sling:1,arcu:1,charun:0,flavgl:0,jade:1,flail:2,pilum:2};
  const GEN_A98={head:1,chest:1,belt:0,arm:1,leg:1};
  const GLOR98=['Gloriosus','Gloriosa','Gloriosum','Gloriosi'],ACUT98=['Acutus','Acuta','Acutum','Acuti'];
  function rename98(w){if(!w||typeof w!=='object'||typeof w.n!=='string')return w;const armor=w.kind==='a'||!!w.named84;
    const g=armor?(GEN_A98[w.slot]!=null?GEN_A98[w.slot]:1):(GEN_W98[w.base]!=null?GEN_W98[w.base]:0);let n=w.n;
    if(w.uq){const noun=n.split(' ')[0];
      if(!armor&&w.uq==='gloria')n=noun+' '+GLOR98[g]+' II';else if(!armor&&w.uq==='percussor')n=noun+' '+ACUT98[g]+' II';
      else if(armor&&w.uq==='mercurialis')n=noun+' Velox II';else if(armor&&w.uq==='gloriosa')n=noun+' Laudis'}
    else{const a0=(w.aff||[])[0];const add=re=>{n=n.replace(re,'$1 I')};
      if(!armor&&a0==='crowd')add(/\b(Glorios(?:us|a|um|i))\b(?! I{1,2}\b)/);else if(!armor&&a0==='pierce')add(/\b(Acut(?:us|a|um|i))\b(?! I{1,2}\b)/);else if(armor&&a0==='swift')add(/\b(Velox)\b(?! I{1,2}\b)/)}
    if(n!==w.n)w.n=n;return w}
  for(const f of ['rollNamed','rollNamedArmor','cleanNamed','cleanNamedA']){const base=C[f];if(typeof base==='function')C[f]=function(){const r=base.apply(this,arguments);try{rename98(r)}catch(e){}return r}}
  /* a reply / push walked for named defs (the page): every {n, named83|named84} object renamed in place */
  function renameDeep98(x,depth){if(!x||typeof x!=='object'||(depth|0)>12)return x;if(Array.isArray(x)){for(const v of x)renameDeep98(v,(depth|0)+1);return x}
    if((x.named83||x.named84)&&typeof x.n==='string')rename98(x);for(const k in x){const v=x[k];if(v&&typeof v==='object')renameDeep98(v,(depth|0)+1)}return x}

  /* ── 9 · OFFERINGS CAP 2 (his rule, v0.98): a gladiator holding more than OFF_MAX keeps the first two; the rest go to the house shelf, and with the shelf full
     the price paid is refunded to the treasury (ledger 'refund'). Once per gladiator: ch.off98. D = his house (null → the refund goes to his wallet, swept later). ── */
  function offCap98(ch,D,t){if(!ch||ch.off98)return null;ch.off98=1;const all=(ch.offers||[]).slice();if(all.length<=C.OFF_MAX)return {moved:0,refund:0};
    const keep=all.slice(0,C.OFF_MAX),extra=all.slice(C.OFF_MAX);ch.offers=keep;if(Array.isArray(ch.offerEq))ch.offerEq=keep.slice();
    let moved=0,refund=0;if(D){D.offers=D.offers||[];const cap=C.shelfMax?C.shelfMax(D):C.OFF_SHELF;
      for(const k of extra){if(D.offers.length<cap){D.offers=[...D.offers,k];moved++}else refund+=C.PRICE_OFF[k]|0}
      if(refund){D.treasury=(D.treasury|0)+refund;C.ledAdd(D,'refund',refund,ch,t)}}
    else for(const k of extra){refund+=C.PRICE_OFF[k]|0;ch.wallet=(ch.wallet|0)+(C.PRICE_OFF[k]|0)}
    return {moved,refund}}
  Object.assign(C,{offCap98});

  if(Array.isArray(C.GUEST_OK)&&!C.GUEST_OK.includes('house.card'))C.GUEST_OK.push('house.card');
  Object.assign(C,{PW98,pwClean98,pwWhy98,sha256hex98,pwHash98,REGIONS98,regionOf98,regionByKey98,DRANKS98,DR_TOP98,DR_FALLEN98,drankScore98,drankOf98,drankIdx98,drankKeep98,
    EVENTS_CUSTOM98,EV_SEATS98,customOnly98,rename98,renameDeep98})})(ONLC);
/* ══════════ v1.0 WHO'S ONLINE (his picks 1c 2b 3a; the page: 287-v100who, the server: the "v1.0 WHO'S ONLINE" block of routes.js) ══════════
   here.list {status?, region?, sort?, cursor?} → {rows, n, next, at}: the lanistas online now (presence: ACCT GSI1PK 'ON'), one row each —
     {id, ln lanista name, g active gladiator, rk its rank, dn house name, dom house id, dr Domus-rank tier, rg region (REGIONS98 from the
      time zone), st idle|room|fight|watch, rm the waiting room, m the live match (fighting or watched), ni 1 = takes no invitation from you,
      fo 1 = you follow the house, me 1 = your own row (always first; hid 1 when you hide yourself)}.
   Never listed: hidden lanistas (acct.priv {hide}), guests, CPU bots. Guests may read the list (no ni / fo). ≤ WHO100.MAX rows a page and
   ≤ WHO100.BYTES of JSON (the rest → `next`, a numeric cursor). Status: seated in a live match → fight; in a waiting room (sitting or
   standing) → room; watching a live match (ACCT w100 {id, at}, set by match.watch, cleared by match.unwatch, ≤ WATCH_MS old) → watch; else idle.
   PER-GLADIATOR (his pick 3): st is the lanista's CURRENT activity. A gladiator stays fighting until his match ends or his Fate is recorded, even when
   his lanista abandoned (Custom 'cpu' rule) and sits in another room with ANOTHER gladiator: such a row carries ab {m, g} = that match + gladiator
   (the server reads the match record only for accounts with a live-match flag, ≤ AB_READS reads a request, cached; the row's own st ignores it). */
(function(C){
  const WHO100={MAX:200,BYTES:60000,POLL_MS:30000,WATCH_MS:3*3600e3,AB_READS:20,AB_TTL:10000,ST:['idle','room','fight','watch'],SORTS:['st','name','rank','region']}; /* TWEAK: page size, reply size, the page's refresh */
  const ST_ORD100={fight:0,room:1,watch:2,idle:3};
  /* the rooms list → who sits/stands where: {room: Map acct→room id, fight: Map acct→match id, live: Set of live match ids} */
  function whoMaps100(rooms,now){const room=new Map(),fight=new Map(),live=new Set(),fightAll=new Map(),gname=new Map();
    for(const L of rooms||[]){if(!L||!L.id)continue;if(L.status==='live'){live.add(L.id);for(const p of L.players||[])if(p&&p.id&&!/^bot/.test(p.id)&&!p.cpu&&!p.left){fight.set(p.id,L.id);(fightAll.get(p.id)||fightAll.set(p.id,[]).get(p.id)).push(L.id);gname.set(p.id+'|'+L.id,String(p.name||''))}}
      else if(L.status==='waiting')for(const m of [...(L.members||[]),...(L.players||[])])if(m&&m.id&&!room.has(m.id))room.set(m.id,L.id)}
    return {room,fight,live,fightAll,gname,now:+now||0}}
  /* ab = {m, g}: a gladiator of this lanista still fighting in match m after he abandoned it (the server/mock reads the match record) — that match no longer
     counts as his CURRENT activity; a second live match (another gladiator) still does */
  function whoStatus100(A,maps,ab){if(!A)return {st:'idle'};const fm=ab&&maps.fightAll?(maps.fightAll.get(A.id)||[]).find(m=>m!==ab.m):maps.fight.get(A.id);if(fm)return {st:'fight',m:fm};if(maps.room.has(A.id))return {st:'room',rm:maps.room.get(A.id)};
    const w=A.w100;if(w&&w.id&&maps.live.has(w.id)&&(maps.now-(+w.at||0))<WHO100.WATCH_MS)return {st:'watch',m:w.id};return {st:'idle'}}
  /* the abandoned-but-still-fighting mark from a match record (Ranked abandons are a recorded Fate: nothing still fights) */
  function whoAb100(A,M,maps,ranked){if(!A||!M||M.status!=='live'||ranked||M.ranked||!(M.abandoned||{})[A.id]||(M.reports||{})[A.id]||!maps.live.has(M.id))return null;
    return {m:String(M.id),g:(maps.gname.get(A.id+'|'+M.id)||'').slice(0,40)}}
  /* one row from an ACCT profile (here = {glad, rank, tz}); o = {dr, viewer: the asking ACCT or null} */
  function whoRow100(A,maps,o){o=o||{};const h=A.here||{};const ab=o.ab&&o.ab.m&&maps.live.has(o.ab.m)?o.ab:null;const s=whoStatus100(A,maps,ab);const rk=C.RANKS.some(r=>r.k===h.rank)?h.rank:'tiro';
    const r={id:String(A.id),ln:String(A.lname||'').slice(0,40),g:String(h.glad||'').slice(0,40),rk,dn:String(A.dname||'').slice(0,40),dom:A.domus?String(A.domus):'',
      dr:/^[a-z]{3,16}$/.test(String(o.dr||''))?o.dr:'',rg:C.regionOf98?C.regionOf98(h.tz||''):'',st:s.st};
    if(s.rm)r.rm=s.rm;if(s.m)r.m=s.m;if(ab)r.ab={m:String(ab.m),g:String(ab.g||'').slice(0,40)};const V=o.viewer;
    if(V&&V.id===A.id){r.me=1;if(C.privOf89(A).hide)r.hid=1}
    else if(V){if(C.invWhy89(A,{domus:V.domus}))r.ni=1;if(A.domus&&(V.follows||[]).some(f=>f&&f.id===A.domus))r.fo=1}
    return r}
  /* who may be listed: hidden lanistas, bots and accounts without a name or gladiator never (your own row always) */
  const whoListed100=(A,viewerId)=>!!A&&!/^bot/.test(String(A.id))&&(A.id===viewerId||!C.privOf89(A).hide);
  function whoKeep100(rows,q){q=q||{};const st=WHO100.ST.includes(q.status)?q.status:'';const rg=C.regionByKey98&&C.regionByKey98(q.region)?q.region:(q.region==='none'?'none':'');
    return (rows||[]).filter(r=>r.me||((!st||r.st===st)&&(!rg||(rg==='none'?!r.rg:r.rg===rg))))}
  const whoName100=r=>String(r.ln||r.g||'').toLowerCase();
  function whoSort100(rows,by){by=WHO100.SORTS.includes(by)?by:'st';const ri=k=>C.rankIdx(k);
    const cmp={st:(a,b)=>ST_ORD100[a.st]-ST_ORD100[b.st],rank:(a,b)=>ri(b.rk)-ri(a.rk),region:(a,b)=>String(a.rg||'zz').localeCompare(String(b.rg||'zz')),name:()=>0}[by];
    return (rows||[]).slice().sort((a,b)=>(b.me|0)-(a.me|0)||cmp(a,b)||whoName100(a).localeCompare(whoName100(b))||String(a.id).localeCompare(String(b.id)))}
  /* one page from a cursor: ≤ MAX rows and ≤ BYTES of JSON */
  function whoPage100(rows,cursor){const from=Math.max(0,Math.min(rows.length,parseInt(cursor,10)||0));const out=[];let bytes=2;
    for(let i=from;i<rows.length&&out.length<WHO100.MAX;i++){const n=JSON.stringify(rows[i]).length+1;if(bytes+n>WHO100.BYTES&&out.length)break;out.push(rows[i]);bytes+=n}
    const end=from+out.length;return {rows:out,n:rows.length,next:end<rows.length?String(end):null}}
  if(Array.isArray(C.GUEST_OK)&&!C.GUEST_OK.includes('here.list'))C.GUEST_OK.push('here.list');
  Object.assign(C,{WHO100,ST_ORD100,whoAb100,whoMaps100,whoStatus100,whoRow100,whoListed100,whoKeep100,whoSort100,whoPage100})})(ONLC);
/* ══════════ v1.0 TURN TIMERS — shared by the server (routes.js "v1.0 TURN TIMERS") and the page (290-v100tt, its mock routes) ══════════
   A room's turn timer: Custom = the host's pick Off / 30 / 60 / 90 / 120 s (L.turnT, default Off); Ranked = always 60 s (locked).
   With a timer on, every decision window has its own clock (DEC seconds) and then takes its default answer.
   ttOf100(L) → {t, d} seconds (0 = off). The server, not a page's clock, says when time ran out: it orders a 'timeout' / 'dto' input.
   A seat that timed out TWICE (or more) may be handed to a CPU by a majority of the OTHER live humans (dropNeed100).
   PROTOCOL 8 (v1.0): one-button notices no longer travel as inputs, decision answers carry their number (d), turn inputs their turn (tn),
   new server inputs timeout / dto — an older page would wait for inputs that never come, so VER moves 7 → 8. */
(function(C){
  const TT100={TURNS:[0,30,60,90,120],RANKED:60,DEC:20,GRACE:1500,LOCK:1000,DROP_AFTER:2};  /* TWEAK: Custom choices, Ranked turn, decision clock, server grace, the page stops sending this long before its deadline, timeouts before a drop vote */
  const turnT100=v=>TT100.TURNS.includes(v|0)?(v|0):0;
  function ttOf100(L){if(!L)return {t:0,d:0};const t=L.ranked?TT100.RANKED:turnT100(L.turnT);return {t,d:t?TT100.DEC:0}}
  /* a majority of the other live humans (1 of 1, 2 of 2, 2 of 3) */
  const dropNeed100=n=>Math.floor(Math.max(0,n|0)/2)+1;
  {const base=C.newLobby;C.newLobby=function(spec,host,id,now){const L=base.apply(this,arguments);if(L){L.turnT=L.ranked?TT100.RANKED:turnT100(spec&&spec.turnT)}return L}}
  {const base=C.roomSet;C.roomSet=function(L,by,d,now){d=d||{};if(d.turnT==null)return base.apply(this,arguments);
    if(L.host.id!==by)return 'Only the host changes the game.';if(L.status!=='waiting')return 'Already under way.';
    if(L.ranked)return (d.turnT|0)===TT100.RANKED?'':'Ranked turns are always 60 seconds.';
    if(!TT100.TURNS.includes(+d.turnT))return 'Turn timer: Off, 30, 60, 90 or 120 seconds.';L.turnT=+d.turnT;
    const x={...d};delete x.turnT;if(Object.keys(x).some(k=>k!=='id'&&k!=='rid'))return base.call(this,L,by,x,now);return ''}}
  C.VER=8;
  Object.assign(C,{TT100,ttOf100,dropNeed100,turnT100})})(ONLC);
/* ===== v1.0 SERVER BATCH A ===== (his picks 2026-10-09/11; the server: the "v1.0 SERVER BATCH A" block of routes.js; the page: 292-v100srvA;
   docs/backend.md "v1.0 server batch A")
   1 · RANKED = EQUIPPED GEAR ONLY: a Ranked gladiator brings what he wears and holds (kitOf already lists only that); the page no longer adds the
       class's weapons on top in Ranked (Custom keeps the class loadout). The opening snapshot is the host's, so no protocol change.
   2 · ONE ISSUED KIT PER HOUSE, REFILLED DAILY (market.kit 'daily'): the plain set issueList100 = the old DAILY92 padding + the class's Level 1 weapons
       (ISSUE_W100: a Level 1 stand-in where the class weapon is Level 2). Issued pieces (pc.iss) are worth 0: never sold, auctioned, sent, repaired or
       looted, and they vanish when lost — also the ones a dead gladiator left at home. ONE set a house: a claim takes back every Issued piece the
       house holds elsewhere (the shelf, its other gladiators — refused while one of them is in a match) and refills only what this gladiator lacks
       (armor only on bare points; weapons only when he holds no weapon of his own). Once an online day a house (D.kitDay92, as v0.92).
   3 · ONLINE WAGERS CLOSED: betOK always refuses (WAGER_OFF100); the server's bet.place answers code 'wager_off'. Settlement code stays for old data.
   5 · DOMUS SLOTS: a new house opens with SLOT100.start (1) gladiator slot; slots 2–4 open for the house's Glory (its best Domus-rank score, dr98)
       AND coin from the treasury (SLOT100.steps). A house founded before v1.0 (no slots100 yet) keeps as many slots as it has LIVING gladiators when first touched (at least 1; slotsMigrate100, once, stored on the house); the rest are locked like a new house's. The coin-only 5th slot
       (UPG89.slot5) is REMOVED (his call 2026-10-11): never offered or bought (upgWhy refuses, mcode), max online = 4; a house that already built it keeps it.
   6 · WATCHERS ARE NOT PLAYERS: the landing's counts (hereSummary) count a ticket holder in a live match as watching, not fighting; Who's online
       shows a ticket holder as watching (live) / in a room (waiting).
   7 · GOOFY TAUNTS: a few light Roman taunts join the room / match / after phrase sets (QC, QC_TEXT). */
(function(C){
  const SLOT100={start:1,steps:[{n:2,glory:150,coin:200},{n:3,glory:600,coin:500},{n:4,glory:1500,coin:1000}]}; /* TWEAK: his numbers (backlog 2026-10-09) */
  const ISSUE_W100={soldier:['gladius'],royalty:['gladius'],hero:['sica','thracian'],slave:['trident'],veteranus:['rudis'],amazonia:['mace'],venatore:['hasta'],damnatio:['stones']}; /* TWEAK: Level 1 only */
  const WAGER_OFF100='Online wagers are closed — Flavius keeps no book.';
  /* ── 5 · slots ── */
  const slotsOf100=D=>{if(!D||D.slots100==null)return C.GLAD_MAX;const n=D.slots100|0;return Math.max(1,Math.min(C.GLAD_MAX,n))};
  const slotNext100=D=>SLOT100.steps.find(s=>s.n>slotsOf100(D))||null;
  /* glory = the house's Domus-rank score (the best ever, D.dr98, or a fresher one the caller passes) */
  const slotGlory100=(D,g)=>Math.floor(Math.max(+((D&&D.dr98)||0)||0,+g||0));
  function slotWhy100(D,g){if(!D)return 'Name your house first.';const s=slotNext100(D);if(!s)return 'Every slot of the house is open.';const have=slotGlory100(D,g);
    if(have<s.glory)return `Slot ${s.n} opens at ${s.glory} Glory — your house has ${have}.`;if((D.treasury|0)<s.coin)return `The treasury needs ${s.coin} coin.`;return ''}
  function slotBuy100(D,g,t){const why=slotWhy100(D,g);if(why)throw new Error(why);const s=slotNext100(D);D.treasury=(D.treasury|0)-s.coin;D.slots100=s.n;C.ledAdd(D,'upg',s.coin,null,t);return s}
  /* once per house: a pre-v1.0 house (no slots100) keeps one slot per living gladiator (min 1); returns true when it changed */
  const slotsMigrate100=(D,living)=>{if(!D||D.slots100!=null)return false;D.slots100=Math.max(1,Math.min(C.GLAD_MAX,living|0));return true};
  C.gladMax=D=>slotsOf100(D)+(((D&&D.upg89)||{}).slot5?1:0);
  {const base=C.upgWhy;C.upgWhy=function(D,k){if(k==='slot5')return 'The fifth gladiator slot is no longer sold.';return base.apply(this,arguments)}} /* a house that already built it keeps D.upg89.slot5 (gladMax still counts it) */
  {const base=C.newDomus;C.newDomus=function(){const D=base.apply(this,arguments);if(D)D.slots100=SLOT100.start;return D}}
  {const base=C.domusRow;C.domusRow=function(D){const r=base.apply(this,arguments);if(r&&D){r.gmax=C.gladMax(D);r.slots100=slotsOf100(D);const s=slotNext100(D);r.slotNext100=s?{...s}:null}return r}}
  {const base=C.domusPub89;if(base)C.domusPub89=function(D){const r=base.apply(this,arguments);if(r)delete r.slotNext100;return r}}
  /* ── 2 · the Issued kit ── */
  const issueList100=cls=>[...C.DAILY92,...(ISSUE_W100[cls]||['gladius'])];
  {const base=C.kitList92;C.kitList92=function(k,cls){if(k==='daily')return issueList100(cls);return base.apply(this,arguments)}}
  const isIss100=(h,it)=>{const p=C.pcOf(h,it);return !!(p&&p.iss)};
  const issOf100=h=>((h&&h.gear)||[]).filter(it=>isIss100(h,it));
  /* the plan for his claim: have = his Issued pieces of the set, buy = the bases issued now, drop = his Issued pieces outside his set (taken back) */
  function issuePlan100(ch,catalog){catalog=catalog||{};const list=issueList100(ch&&ch.cls);const kind=b=>(catalog[b]||{}).kind;const left=issOf100(ch);const have=[],buy=[],cover=[];
    const worn=C.equipOf(ch);const ownW=worn.some(it=>!isIss100(ch,it)&&!C.isBroken(ch,it)&&kind(C.itemBase(it))==='w');
    for(const b of list){if(!catalog[b])continue;const i=left.findIndex(it=>C.itemBase(it)===b);if(i>=0){have.push(left.splice(i,1)[0]);continue}
      if(kind(b)==='w'){if(ownW){cover.push(b);continue}buy.push(b);continue}
      if(C.armFit(ch,[...worn,...buy.filter(x=>kind(x)!=='w'),b],catalog).pop()===false){cover.push(b);continue}buy.push(b)}
    const full=list.filter(b=>catalog[b]).reduce((a,b)=>a+C.priceOf(catalog[b]),0);
    return {have,take:[],buy,cover,drop:left,full,part:0,disc:0,cost:0,share:0}}
  /* every Issued piece the house holds outside this gladiator: [{holder:'house'|char id, item}] (the claim takes them back — one set a house) */
  function issueElsewhere100(D,others,chId){const out=[];for(const it of issOf100(D))out.push({holder:'house',item:it});
    for(const c of others||[])if(c&&c.id!==chId&&c.alive!==false)for(const it of issOf100(c))out.push({holder:c.id,item:it});return out}
  /* the dead's pieces left at home: Issued ones vanish with him */
  {const base=C.gearAfter;C.gearAfter=function(){const out=base.apply(this,arguments);try{if(out&&Array.isArray(out.left)&&out.left.length){const keep=[];
      for(const P of out.left){if(P&&P.pc&&P.pc.iss){(out.vanish=out.vanish||[]).push(C.itemBase(P.item))}else keep.push(P)}out.left=keep}}catch(e){}return out}}
  /* never worth a coin anywhere (the used market, repairs) */
  {const base=C.usedPrice;C.usedPrice=function(I){if(I&&I.iss)return 0;return base.apply(this,arguments)}}
  {const base=C.repairCost;C.repairCost=function(I){if(I&&I.iss)return 0;return base.apply(this,arguments)}}
  /* ── 3 · wagers closed ── */
  C.betOK=function(){return WAGER_OFF100};
  /* ── 6 · watchers are not players ── */
  {const base=C.hereSummary;C.hereSummary=function(here,rooms){const out=base.apply(this,arguments);try{const spec=new Set();
      for(const L of rooms||[])if(L&&L.status==='live')for(const s of L.stands||[])if(s&&s.id&&!(L.players||[]).some(p=>p&&p.id===s.id))spec.add(s.id+'|'+L.id);
      let w=0;for(const h of here||[])if(h&&h.match&&spec.has(h.id+'|'+h.match))w++;out.watch=w;if(w)out.fight=Math.max(0,(out.fight|0)-w)}catch(e){}return out}}
  {const base=C.whoMaps100;C.whoMaps100=function(rooms){const m=base.apply(this,arguments);m.spec=new Map();try{for(const L of rooms||[]){if(!L||!L.id)continue;
      for(const s of L.stands||[]){if(!s||!s.id)continue;if(L.status==='live')m.spec.set(s.id,L.id);else if(L.status==='waiting'&&!m.room.has(s.id))m.room.set(s.id,L.id)}}}catch(e){}return m}}
  {const base=C.whoStatus100;C.whoStatus100=function(A,maps){const r=base.apply(this,arguments);if(r&&r.st==='idle'&&A&&maps&&maps.spec&&maps.spec.has(A.id))return {st:'watch',m:maps.spec.get(A.id)};return r}}
  /* ── 7 · taunts (codes only; the page translates QC_TEXT) ── */
  Object.assign(C.QC_TEXT,{lions:'🦁 The lions are hungry — for you!',senate:'🏛 Even the Senate moves faster!',garum:'🐟 You smell of cheap garum.',
    tickle:'Was that a tickle?',granny:'My grandmother hits harder!',yawn:'😴 Flavius is yawning.',sandal:'Sand in your sandals?',bigger:'Next time, bring a bigger sword!',
    /* v1.0 room (his revision 3 of the room mock): the room's Taunts group */
    mlions:'Mind the lions',flwatch:'Flavius is watching',damna:'Is that a Damnatio?',helmet:'Nice helmet. Yours?',slaves:'I’ve seen stronger slaves',
    bucket:'Bring a bucket',gate:'To the Gate of Life!',betme:'My lanista bet on me… sorry, lanista'});
  for(const [sc,ks] of [['room',['lions','senate','garum','mlions','flwatch','damna','helmet','slaves','bucket','gate','betme']],['match',['tickle','granny','yawn','sandal']],['after',['bigger']]])for(const k of ks)if(!C.QC[sc].includes(k))C.QC[sc].push(k);
  /* the new paying request runs once per request id */
  if(Array.isArray(C.IDEM93)&&!C.IDEM93.includes('domus.slot'))C.IDEM93.push('domus.slot');
  Object.assign(C,{SLOT100,ISSUE_W100,WAGER_OFF100,slotsOf100,slotsMigrate100,slotNext100,slotGlory100,slotWhy100,slotBuy100,issueList100,isIss100,issOf100,issuePlan100,issueElsewhere100})})(ONLC);
/* ===== v1.0 SERVER BATCH B ===== */
/* Ranked improvements 1–7 + the online sidelining (his picks 2026-10-11). Shared by the server (routes.js "v1.0 SERVER BATCH B") and the page
   (293-v100srvB: the client + its mock routes). No protocol bump: every new request is optional for an older page; the server only adds fields.
   1 ELO100   a hidden skill rating per gladiator (server item ELO#<char>, never in a reply): pairwise Elo over the human seats of a settled Ranked
              match by place (K 40 for the first NEW_N rated bouts, then 24, divided by the other humans). Find me a fight (lobby.quick, Ranked) prefers
              a room whose seated humans average within WIN of the group (eloPrefer100); none close → the old pick (it never stalls a queue).
      ETA100  the queue estimate while a quick room waits: the playlist's fill-time history (an EMA of horns − creation) × open seats, slower when
              no free lanista of that rank is online (eta100).
      SEATS   a Ranked room that is not a team event deals its seats at the horns at random (startRoom wrapper; seat = start corner and turn order).
   2 WATCH100 Ranked watchers see the match ONE TURN BEHIND: the server keeps their moves until the next turn's clock (match.clock 'turn') and at
              the end; match.get gives them only what was released; no snapshot is cut for them.
   3 LEAVE100 abandons, CPU takeovers (an away drop or a timeout vote) and seats that timed out twice in one match count against the account
              (Ranked only); MARK in WIN → the house card says "Often leaves"; CD_N in CD_WIN → no Ranked for CD_MS.
   4 CONN100  a dot per seat: on (connected), away (socket gone < AWAY_MS), gone (≥ AWAY_MS), cpu (dropped / abandoned); slow = timed out this match.
   5 SEASON100 the season's leaderboard by Glory gained (season = seasonAt(t).season, the Manager calendar); TITULI = the season-end awards
              (names + flags on the house only, no art yet) given once to the top places of the season before.
   6 REPORT100 Report a player: one per match per reporter, REASONS, DAY_MAX a day, until AFTER_MS after the end; logged for review, no penalty.
   7 the after-match summary's replay link = the match id (#replay=<id>; replays come later).
   SIDELINING FX100: a cosmetic reveal inside a turn (the chest, a beast's spawn card, the market's pick) lasts FX100.ms on every screen online and
              is added to that turn's clock (match.clock {kind:'fx'}, once per reveal, ≤ TURN_MAX a turn); the turn clock starts at the seat
              owner's own report (≤ OWN_MAX after another screen's), so a Slow or Fast viewer never moves anyone's clock. */
(function(C){
  const ELO100={START:1000,K_NEW:40,K:24,NEW_N:10,WIN:150,MIN:100,MAX:3000};  /* TWEAK: start, K while new / after, rated bouts while new, matchmaking window */
  const eloK100=n=>(n|0)<ELO100.NEW_N?ELO100.K_NEW:ELO100.K;
  const eloExp100=(a,b)=>1/(1+Math.pow(10,(b-a)/400));
  /* rows [{id, r (rating), n (rated bouts), place}] → {id: new rating}; ties share half a point */
  function eloPairs100(rows){const out={};const R=(rows||[]).filter(x=>x&&x.id!=null);const m=R.length;if(m<2){for(const x of R)out[x.id]=x.r;return out}
    for(const a of R){let s=0;for(const b of R){if(b===a)continue;const sc=a.place<b.place?1:a.place>b.place?0:0.5;s+=sc-eloExp100(a.r,b.r)}
      out[a.id]=Math.max(ELO100.MIN,Math.min(ELO100.MAX,Math.round(a.r+eloK100(a.n)*s/(m-1))))}return out}
  /* the list Find me a fight should pick from: rooms whose seated humans' average (roomElo[id]) is within WIN of mine, when one of them fits */
  function eloPrefer100(list,group,ev,ranked,flag,now,inf,mine,roomElo){if(!ranked||mine==null||!roomElo)return list;
    const near=list.filter(L=>L.status!=='waiting'||!L.ranked||L.ev!==ev||roomElo[L.id]==null||Math.abs(roomElo[L.id]-mine)<=ELO100.WIN);
    return near.length!==list.length&&C.quickPick(near,group,ev,ranked,flag,now,inf)?near:list}
  const ETA100={DEF:90,MIN:10,MAX:600,EMA:0.3,SLOW:2};  /* TWEAK: seconds before any history, clamp, history weight, ×slow when nobody fits online */
  function etaFold100(h,ms){h=h&&typeof h==='object'?h:{};const s=Math.max(1,Math.min(3600,Math.round((ms||0)/1000)));const a=h.n?h.a*(1-ETA100.EMA)+s*ETA100.EMA:s;return {a:Math.round(a*10)/10,n:Math.min(999,(h.n|0)+1)}}
  function eta100(h,need,seats,free){need=Math.max(0,need|0);if(!need)return {s:0,slow:false};const base=h&&h.n?+h.a:ETA100.DEF;const share=need/Math.max(1,(seats|0)-1);
    const slow=!(free>0);const s=Math.round(Math.max(ETA100.MIN,Math.min(ETA100.MAX,base*share*(slow?ETA100.SLOW:1))));return {s,slow}}
  /* SEATS: a Ranked room that is not a team event deals its seats at random at the horns (the server's rnd; the mock's Math.random) */
  {const base=C.startRoom;C.startRoom=function(L){const out=base.apply(this,arguments);try{if(L&&L.ranked&&!L.team&&C.SEAT_RND100!==false&&(L.players||[]).length>1){const r=typeof C.seatRnd100==='function'?C.seatRnd100:Math.random;
      const P=L.players;const was=P.map(p=>p.id);for(let i=P.length-1;i>0;i--){const j=Math.floor(r()*(i+1));const t=P[i];P[i]=P[j];P[j]=t}L.shuf100=1;
      /* wagers placed on a seat follow their fighter to his new seat */
      for(const b of L.bets||[]){const id=was[b.seat|0];const k=P.findIndex(p=>p.id===id);if(id!=null&&k>=0)b.seat=k}}}catch(e){}return out}}
  const WATCH100={DELAY:'turn'};
  const LEAVE100={WIN_MS:7*86400e3,MARK:3,CD_N:3,CD_WIN:86400e3,CD_MS:15*60e3,KEEP:20,KINDS:['abandon','drop','timeout']};  /* TWEAK: the one constant set: mark = 3 in 7 days, cooldown = 3 in 24 h → 15 min */
  function leaveAdd100(list,kind,t,m){const L=(Array.isArray(list)?list:[]).filter(x=>x&&t-(+x.at||0)<LEAVE100.WIN_MS);L.push({k:LEAVE100.KINDS.includes(kind)?kind:'drop',at:+t||0,...(m?{m:String(m).slice(0,40)}:{})});return L.slice(-LEAVE100.KEEP)}
  function leaveMark100(list,t){const n=(Array.isArray(list)?list:[]).filter(x=>x&&t-(+x.at||0)<LEAVE100.WIN_MS).length;return {n,mark:n>=LEAVE100.MARK}}
  /* the cooldown's end (0 = none): CD_N leaves in CD_WIN, counted from the last of them */
  function leaveCooldown100(list,t){const L=(Array.isArray(list)?list:[]).filter(x=>x&&t-(+x.at||0)<LEAVE100.CD_WIN).sort((a,b)=>a.at-b.at);if(L.length<LEAVE100.CD_N)return 0;const until=L[L.length-1].at+LEAVE100.CD_MS;return until>t?until:0}
  const CONN100={POLL_MS:15000,ST:['on','away','gone','cpu']};
  /* M = the match record; returns {seat: {st, slow?}} for its human fighter seats (toc = {seat: timeouts this match}) */
  function connOf100(M,now,toc){const o={};if(!M)return o;for(const a of M.players||[]){const seat=(M.seats||{})[a];if(seat==null)continue;let st='on';
      if((M.dropped||{})[a]||(M.abandoned||{})[a])st='cpu';else{const aw=+((M.away||{})[a])||0;if(aw>0)st=now-aw>=C.AWAY_MS?'gone':'away'}
      const sl=toc?(toc[seat]|0):0;o[seat]=sl?{st,slow:sl}:{st}}return o}
  const SEASON100={TOP:50,TITULI:[{upto:1,k:'s100v',n:'Victor of the Season'},{upto:3,k:'s100p',n:'On the Season’s Podium'},{upto:10,k:'s100x',n:'One of the Season’s Ten'}]};
  const seasonKey100=t=>'S'+C.seasonAt(t).season;
  /* the top list: rows {c (gladiator), n (name), cls, dn (house name), dom, g (Glory gained), rk} — one per gladiator, highest first */
  function seasonTop100(top,row){const L=(Array.isArray(top)?top:[]).filter(x=>x&&x.c!==row.c);L.push(row);L.sort((a,b)=>(b.g-a.g)||String(a.c).localeCompare(String(b.c)));return L.slice(0,SEASON100.TOP)}
  const seasonTitulus100=place=>(SEASON100.TITULI.find(x=>place>=1&&place<=x.upto)||null);
  const REPORT100={REASONS:['cheat','abuse','afk','leave','name','other'],DAY_MAX:10,AFTER_MS:86400e3,NOTE_MAX:200};
  function reportWhy100(d){d=d||{};if(!REPORT100.REASONS.includes(d.reason))return 'Pick a reason.';if(!Number.isInteger(d.seat)||d.seat<0||d.seat>15)return 'Pick a player.';return ''}
  const FX100={ms:{chest:900,spawn:900,market:900},TURN_MAX:5000,OWN_MAX:10000};  /* TWEAK: one length per reveal online, its credit cap a turn, how late the owner's own report may start his clock */
  const fxMs100=k=>FX100.ms[k]|0;
  if(Array.isArray(C.GUEST_OK))for(const t of ['season.board'])if(!C.GUEST_OK.includes(t))C.GUEST_OK.push(t);
  Object.assign(C,{ELO100,eloK100,eloExp100,eloPairs100,eloPrefer100,ETA100,etaFold100,eta100,WATCH100,LEAVE100,leaveAdd100,leaveMark100,leaveCooldown100,
    CONN100,connOf100,SEASON100,seasonKey100,seasonTop100,seasonTitulus100,REPORT100,reportWhy100,FX100,fxMs100})})(ONLC);
/* ===== v1.0 INSIGNIA ===== (his answers 2026-10-12, spec tools/plans/mock100/NOTES-banner.md; the page: 304-v100insig / 304a-v100insigui)
   The online Domus wears the FULL house design minus sculpt layers (his 4a): domus.look keeps, beside {c1 field, c2 emblem colour, crest},
   the optional c3 (second dye), pat (pattern), ins (inscription: Roman square capitals ≤ 12, word-filtered — a bad one is dropped silently),
   trim {gilt,tassels,fringe,bar,topbar,fc}, wear (0..1) and top (the signum topper); crest may be any Insignia emblem (CREST100). Never
   layers/baked. An old page ignores the new fields (it draws c1/c2/crest as before). No new server texts: the old messages are reused. */
(function(C){
  const HEX=/^#[0-9a-fA-F]{6}$/;
  const PATS100=['plain','clavi','meander','wave','clipeus','laurel','halved'];
  const CREST100=[...C.CREST89,'bull','capricorn','scorpion','medusa','gladii','rete','palma','murmillo','thraex','manus','spqr','num','sym:hut','sym:amphora','sym:rudis','sym:blades','sym:helm','sym:shield','sym:laurel','sym:eagle'];
  const TOPS100=['emb','manus','sym:eagle','sym:laurel','palma'];const FC100=['gold','creta','rubia','purpura','c2'];const TRIM_KEYS100=['gilt','tassels','fringe','bar','topbar'];
  const INS_MAX100=12;
  /* the inscription as the Romans cut it: upper case, U→V, J→I, letters / digits / · . - space; '' when the word filter objects */
  function insClean100(s){let v=String(s==null?'':s).toUpperCase().replace(/U/g,'V').replace(/J/g,'I').replace(/[^A-Z0-9·.\- ]/g,'').replace(/\s+/g,' ').trim().slice(0,INS_MAX100);
    try{if(v&&typeof C.nameBad==='function'&&(C.nameBad(v)||C.nameBad(String(s))||C.nameBad(v.replace(/V/g,'U'))))v=''}catch(e){}return v}
  function cleanLook100(x){if(!x||typeof x!=='object')throw new Error('Pick the colours and the crest.');if(!HEX.test(String(x.c1||''))||!HEX.test(String(x.c2||'')))throw new Error('Pick two colours.');
    if(!CREST100.includes(x.crest))throw new Error('Pick one of the printed crests.');
    const o={c1:String(x.c1).toLowerCase(),c2:String(x.c2).toLowerCase(),crest:x.crest};
    if(x.c3!=null&&HEX.test(String(x.c3)))o.c3=String(x.c3).toLowerCase();
    if(PATS100.includes(x.pat)&&x.pat!=='plain')o.pat=x.pat;
    if(x.ins!=null){const v=insClean100(x.ins);if(v)o.ins=v}
    if(x.trim&&typeof x.trim==='object'&&!Array.isArray(x.trim)){const t={};for(const k of TRIM_KEYS100)if(typeof x.trim[k]==='boolean')t[k]=x.trim[k];if(FC100.includes(x.trim.fc))t.fc=x.trim.fc;if(Object.keys(t).length)o.trim=t}
    if(x.wear!=null){const w=Math.round(Math.max(0,Math.min(1,+x.wear||0))*100)/100;if(w>0)o.wear=w}
    if(TOPS100.includes(x.top)&&x.top!=='emb')o.top=x.top;
    return o}
  Object.assign(C,{CREST100,PATS100,TOPS100,INS_MAX100,insClean100,cleanLook100,cleanLook89:cleanLook100})})(ONLC);
/* ===== v1.0 LOBBY ROOM ===== */
/* The online room v1.0 (his room mock, decisions 10a/10e/10f/10i + C1a–C4a). Shared by the server (routes.js "v1.0 LOBBY ROOM") and the page
   (302-v100lobby: the room screen, the Lobby Browser's Join box and its mock route). No protocol bump: a new optional request.
   ROOM CODE (C2a): every room has a short code R-XXXXX made from its id (roomCode100: FNV-1a of the id over the FID letters — no look-alikes), so it
     needs no storage and every screen shows the same code. It replaces ✉ Invite inside the room: a friend types it into the Lobby Browser.
   lobby.code {code, pw?}: R-XXXXX → that waiting room; FID-XXXXXX → the waiting room that lanista is in now (a hidden lanista or one whose privacy
     refuses invitations is "not in a room you can join"). It joins through lobby.join, so passwords (pw98), kicks, Ranked rank rules, the busy rule
     and the Ranked cooldown apply as there. A bare 6-letter word starting with R may be either: the room is tried first, then the FID. Lookups count
     against the FID quota (FIND_MAX89 a minute), so codes cannot be guessed quickly. */
(function(C){
  const CODE100={LEN:5,PRE:'R-'};  /* TWEAK: letters in a room code (31^5 ≈ 28 million) */
  const ABC=C.FID_ABC89||'23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  function roomCode100(id){let h=0x811c9dc5;const s='room:'+String(id||'');for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}
    let o='';for(let i=0;i<CODE100.LEN;i++){o+=ABC[h%ABC.length];h=Math.floor(h/ABC.length)^(Math.imul(h,2654435761)>>>7)>>>0;h>>>=0}return CODE100.PRE+o}
  /* what the box holds: {room:'R-XXXXX'} and/or {fid:'XXXXXX'}; null when it can be neither */
  function codeParse100(s){const raw=String(s||'').toUpperCase().trim();const x=raw.replace(/[\s\-_.]/g,'');const out={};
    const ok=t=>[...t].every(c=>ABC.includes(c));
    if(/^FID/.test(x)){const f=C.fidClean(x);if(f)out.fid=f}
    else{if(x.length===CODE100.LEN+1&&x[0]==='R'&&ok(x.slice(1)))out.room=CODE100.PRE+x.slice(1);
      if(!/^R-/.test(raw)&&x.length===(C.FID_LEN89||6)&&ok(x))out.fid=x}
    return out.room||out.fid?out:null}
  /* the waiting room behind a code (newest first) */
  function roomByCode100(list,code){let best=null;for(const L of list||[])if(L&&L.status==='waiting'&&roomCode100(L.id)===code&&(!best||(L.created||0)>(best.created||0)))best=L;return best}
  Object.assign(C,{CODE100,roomCode100,codeParse100,roomByCode100})})(ONLC);
/* ===== v1.0 REPLAYS ===== */
/* Ranked replays kept by the server (the page: 309-v100replay; the server: routes.js "v1.0 REPLAYS"; docs/backend.md "v1.0 replays"). No protocol bump.
   replay.put {id, h, v}  a HUMAN FIGHTER of a finished, settled RANKED match asks the server to keep it. The server builds the replay from ITS OWN
                          stored opening (MATCH#<id> OPEN) and inputs (IN#…, server order) — the client sends only its end hash (h) and game version
                          (v), so a replay cannot be forged; once a match (REPLAY#<id> R, putNew — a second put answers {done, dup}), ≤ REPLAY100.MAX
                          bytes, kept REPLAY100.DAYS days (ttl), indexed GSI1PK 'REPLAYS' / GSI1SK = when (the most recent first, for a future
                          Ranked check). Refusals: replay_bad (no id / not your match) · replay_custom (only Ranked) · replay_wait (still live —
                          ask again after the settlement) · replay_gone (the opening expired) · replay_big.
   replay.get {id}        anyone, guests too → {id, v, h, at, ranked, ev, loc, open, inputs}; replay_none when nothing is kept.
   The stored inputs never carry account ids: from → 'server' or 'p', acct → 'p' (replayAnon100). */
(function(C){
  const REPLAY100={DAYS:30,MAX:380000,ID:/^[A-Za-z0-9_-]{1,40}$/}; /* TWEAK: days kept; the byte cap stays under DynamoDB's 400 KB item */
  const replayIdOK100=id=>typeof id==='string'&&REPLAY100.ID.test(id);
  function replayPutWhy100(d){if(!d||!replayIdOK100(d.id))return 'Which match?';if(d.h!=null&&(typeof d.h!=='string'||d.h.length>24))return 'Which match?';
    if(d.v!=null&&(typeof d.v!=='string'||d.v.length>12))return 'Which match?';return null}
  const replayAnon100=x=>{const y={...(x||{})};if(y.from!=='server')y.from='p';if(y.acct!=null)y.acct='p';return y};
  function replayPack100(o){return {id:o.id,v:String(o.v||'').slice(0,12),h:String(o.h||'').slice(0,24),at:o.at,ranked:true,ev:o.ev==null?null:o.ev,loc:o.loc==null?null:o.loc,
    open:o.open,inputs:(o.inputs||[]).slice().sort((a,b)=>(a.seq|0)-(b.seq|0)).map(replayAnon100)}}
  const replaySize100=rp=>{try{return JSON.stringify(rp).length}catch(e){return Infinity}};
  if(Array.isArray(C.GUEST_OK)&&!C.GUEST_OK.includes('replay.get'))C.GUEST_OK.push('replay.get');
  Object.assign(C,{REPLAY100,replayIdOK100,replayPutWhy100,replayAnon100,replayPack100,replaySize100})})(ONLC);
/* ══════════ v1.0 BALANCE (his picks O1 O2 O3 from tools/plans/balance100/REPORT.md; the server block "v1.0 BALANCE" at the end of routes.js;
   the page side is 316-v100balonl; docs/backend.md "v1.0 balance"; NO protocol bump) ══════════
   • O1 PRINTED GEAR COMES HOME DENTED (Ranked): a printed piece (L1–3, not named, not Issued) brought into a Ranked bout and no longer held at the
     end is no longer destroyed (v0.91 out.gone) — it stays with the survivor DAMAGED (pc.st 'damaged', dmg 1, in place like the v0.91 dents:
     worn in Custom, stripped from Ranked kits until repaired). A RANKED DEATH (his follow-up): the human killer still takes ONE piece of his
     choice (printed or named — the loot window is unchanged, gx.carried holds everything brought); every other PRINTED piece goes home to the
     dead man's house shelf dented (homeDent100 — the server's toMarket / the mock's mockToMarket83 route a 'fell' printed piece home instead of
     the used market), named ones go back to Flavius's chest as before; killed by a beast / CPU / the Fate: the same without the pick. out.dent100
     [{item,key}] = survivor: lost pieces; death: the printed pieces that go home (unless the killer takes one). REPAIR of a printed piece
     (damaged, or an old broken one) = a tenth of its value (at least 1) — named pieces keep a third, Issued pieces stay worth 0 and vanish.
     SURVIVAL AWARDS = a smooth ladder (his pick): Tiro 24 · Novicius 30 · Gregarius 36 · Veteranus 42 · Primus Palus 50 · Summa Rudis 60 ·
     Rudiarius 70 · Invictus 80 (win +50%, streak as before; a rank-up never pays less); Flavius's gift coin keeps the old table (AWARD_GIFT100).
   • O2 RANK GLORY x½: Tiro 0 · Novicius 45 · Gregarius 90 · Veteranus 275 · Primus Palus 575 · Summa Rudis 1050 · Rudiarius 1750 · Invictus 2750.
     Never demoted (ch.rankK). Everything gated by rank reads RANKS (market levels, named gear at Veteranus+, Ludi Infames, the auction,
     Ranked rooms of one rank, Immortalis = Invictus). Gladiators already past a new threshold rise at once (rankFor) with no back-dated gifts.
   • O3 A RANK-UP GIFT ONCE PER HOUSE PER RANK: the Domus keeps D.rkg100 = ranks it was given a gift for (seeded on first touch from the
     'rank:<k>' gifts it already holds or opened); giftsIn drops a second 'rank:<k>' gift (the dropped ids ride on gs.drop100, and
     after100(out,gx) takes them out of the result the player sees: out.gifts, out.giftDup100). Gifts every GIFT_EVERY Ranked bouts survived are unchanged. */
(function(C){
  const BAL100={award:{tiro:24,novicius:30,gregarius:36,veteranus:42,primus:50,summa:60,rudiarius:70,invictus:80},gloryK:0.5,repairK:0.1,dent:true,home:true}; /* TWEAK: his picks 2026-10-12 (dent: a survivor's lost printed pieces come home dented; home: a death's printed pieces go to the house — tests may switch them off) */
  /* ── O2 the thresholds (in place: rankByGlory, rankFor and every reader share these objects) ── */
  for(const R of C.RANKS)R.glory=Math.round(R.glory*BAL100.gloryK);
  /* ── O1 awards: the table itself (awardOf, the result toast and the room's lines read it); gifts keep the old coin ── */
  const AWARD_GIFT100={...C.AWARD};
  for(const k of Object.keys(BAL100.award))if(C.AWARD[k]!=null)C.AWARD[k]=BAL100.award[k];
  {const base=C.rollGift;C.rollGift=function(){const cur=C.AWARD;C.AWARD=AWARD_GIFT100;try{return base.apply(this,arguments)}finally{C.AWARD=cur}}}
  /* ── O1 repairs: a printed piece costs a tenth of its value ── */
  const printed100=I=>!!I&&!I.named&&!I.iss;
  {const base=C.repairCost;C.repairCost=function(I){if(printed100(I)&&(I.st==='damaged'||I.st==='broken'))return Math.max(1,Math.ceil((I.val|0)*BAL100.repairK-1e-9));return base.apply(this,arguments)}}
  /* ── O1 after a bout: lost printed pieces come home dented ── */
  const iss100=(h,it)=>{const p=C.pcOf(h,it);return !!(p&&p.iss)};
  /* a dead man's piece that goes home dented when nobody takes it: printed, not Issued */
  const homeable100=P=>!!(P&&P.item&&!C.isNamed(P.item)&&!(P.pc&&P.pc.iss));
  /* the piece as it lands on his house shelf (P already carries a uid — the server tags the dead's pieces before they leave) */
  const homeDent100=P=>({item:P.item,pc:{...(P.pc||{}),st:'damaged',dmg:1}});
  /* the used market / chest step: a printed piece that fell (nobody took it) goes home instead; a piece the killer took ('taken') keeps the old way */
  const homeRoute100=P=>BAL100.home&&homeable100(P)&&!((P.pc&&P.pc.hist)||[]).slice(-1).some(h=>h&&h.how==='taken');
  {const base=C.gearAfter;C.gearAfter=function(ch,kit,row,ranked){const lost=[];
    try{if(BAL100.dent&&ranked&&ch&&kit&&row&&row.survives!==false&&Array.isArray(row.brk)&&row.brk.length){const items=kit.items||[],gear=kit.gear||[];const used=new Set();const brk=[];
        for(const k of row.brk){const j=gear.findIndex((g,i)=>g===k&&!used.has(i));if(j<0){brk.push(k);continue}used.add(j);const it=items[j];
          if(it&&!C.isNamed(it)&&(ch.gear||[]).includes(it))lost.push({it,key:k});else brk.push(k)}
        if(lost.length)row={...row,brk}}}catch(e){lost.length=0}
    const out=base.call(this,ch,kit,row,ranked);out.dent100=[];
    try{for(const x of lost){if(!(ch.gear||[]).includes(x.it))continue;
        if(iss100(ch,x.it)){C.takePiece(ch,x.it);(out.vanish=out.vanish||[]).push(C.itemBase(x.it));(out.gone=out.gone||[]).push(C.itemBase(x.it));continue}
        const nid=C.damageItem91(ch,x.it,1);if(nid)out.dent100.push({item:nid,key:x.key})}
      if(BAL100.home&&ranked&&row&&row.survives===false&&Array.isArray(out.carried))for(const P of out.carried)if(homeable100(P))out.dent100.push({item:P.item,key:C.itemBase(P.item)})}catch(e){}
    return out}}
  /* ── O3 one rank-up gift a house ── */
  function rkg100(D){if(Array.isArray(D.rkg100))return D.rkg100;const s=new Set();
    for(const id of [...(D.giftsOpened||[]),...(D.gifts||[]).map(g=>g&&g.id)]){const m=/:rank:([a-z]+)$/.exec(String(id||''));if(m)s.add(m[1])}
    D.rkg100=[...s];return D.rkg100}
  {const base=C.giftsIn;C.giftsIn=function(D,gs){if(!D)return base.apply(this,arguments);const have=rkg100(D).slice();const pass=[],drop=[];
    for(const g of gs||[]){const m=g&&/^rank:([a-z]+)$/.exec(String(g.why||''));if(!m){pass.push(g);continue}if(have.includes(m[1])){drop.push(g.id);continue}have.push(m[1]);pass.push(g)}
    D.rkg100=have;try{if(gs)gs.drop100=drop}catch(e){}return base.call(this,D,pass)}}
  /* the result the player sees (call after the house took gx.gifts): the dented list, the gifts the house already had for that rank removed */
  function after100(out,gx){if(!out||!gx)return out;if(Array.isArray(gx.dent100)&&gx.dent100.length)out.dent100=gx.dent100.slice();
    const drop=gx.gifts&&gx.gifts.drop100;if(Array.isArray(drop)&&drop.length&&Array.isArray(out.gifts)){out.gifts=out.gifts.filter(g=>!(g&&drop.includes(g.id)));out.giftDup100=drop.length}return out}
  Object.assign(C,{BAL100,AWARD_GIFT100,rkg100,after100,homeable100,homeDent100,homeRoute100})})(ONLC);
if(typeof module!=='undefined'&&module.exports)module.exports=ONLC;
