/* =====================================================================
   111-ONLCORE · THE ONLINE RULES (shared by the game and the AWS server)
   =====================================================================
   Pure data + functions, no DOM. The page uses it through the global ONLC; the Lambda handlers in server/ load the same
   file with require() (the module.exports line at the bottom). Change a rule here and both sides follow.
   • Ranks: Tiro → Gregarius → Veteranus → Primus Palus → Summa Rudis, earned by ranked bouts survived AND lifetime CF.
     Ranked matchmaking pairs equal ranks only. Each rank opens one more market level (Tiro: level 1 only).
   • A new online gladiator: one of the 8 printed classes, the same low ratings for everyone (55 each — they grow by
     surviving), the recruit kit (the class's weapons, no armor), an empty wallet. Coin earned in matches goes to the wallet; gear is bought between matches.
   • Death: Ranked only, by the game's own Fate table (the event's result row says whether the gladiator survives).
     The dead go to the Hall of the Fallen only if they were great: died at Veteranus or above, or with a legendary feat
     (25+ ranked bouts survived, 500+ lifetime CF, or Commodus slain). Everyone else is erased (damnatio memoriae).
   ===================================================================== */
const ONLC=(function(){
  const VER=1; /* protocol version: the server refuses clients on another one */
  const CLASSES8=['soldier','royalty','hero','slave','veteranus','amazonia','venatore','damnatio'];
  const EVENTS3=['democritus','egidious','cassian'];
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
  const PRICE={1:8,2:20,3:45};
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
    const purse=(PURSE[before.k]||PURSE.tiro)[Math.min(3,Math.max(0,(row.place||4)-1))]||0;const kept=Math.max(0,Math.min(60,row.coin|0));
    out.pay=(ranked?purse:Math.ceil(purse/2))+Math.floor(kept/2);ch.wallet=(ch.wallet||0)+out.pay;
    for(const s of row.slew||[])if(!ch.feats.includes('slew:'+s))ch.feats.push('slew:'+s);
    if(ranked&&row.survives===false){ch.alive=false;out.died=true;ch.died={at:Date.now(),cf,rank:before.k};out.hall=hallWorthy(ch);return out}
    if(ranked)ch.survived=(ch.survived||0)+1;if(row.survives!==false)grow(ch,1+(row.won?1:0));
    const after=rankFor(ch);ch.rank=after.k;if(after.k!==before.k)out.rankUp=after.k;return out}
  function hallWorthy(ch){return rankIdx(ch.died&&ch.died.rank||ch.rank)>=2||(ch.survived||0)>=25||(ch.lifeCF||0)>=500||(ch.feats||[]).includes('slew:commodus')}
  /* lobbies */
  function newLobby(spec,host,id,now){const ev=EVENTS3.includes(spec.ev)?spec.ev:'democritus';const seats=Math.max(2,Math.min(4,spec.seats|0||4));
    return {id,host:{id:host.id,name:host.name,char:host.char||null},ev,loc:Math.max(1,Math.min(12,spec.loc|0||6)),ranked:!!spec.ranked,rank:spec.ranked?(host.rank||'tiro'):null,
      seats,players:[{id:host.id,name:host.name,char:host.char||null,rank:host.rank||'tiro',ready:false}],watchers:0,tickets:0,ticket:Math.max(0,Math.min(50,spec.ticket|0)),
      status:'waiting',created:now,seed:null,v:VER}}
  function canJoin(L,who){if(L.status!=='waiting')return 'Already under way.';if(L.players.length>=L.seats)return 'Full.';if(L.players.some(p=>p.id===who.id))return '';
    if(L.ranked&&(who.rank||'tiro')!==L.rank)return `Ranked: ${(RANKS[rankIdx(L.rank)]||RANKS[0]).n} only.`;if(L.ranked&&!who.char)return 'Ranked needs a living gladiator.';return ''}
  /* weekly challenges rotate with the week of the year */
  const CHALLENGES=[['Survive 3 ranked bouts',3,'survived'],['Earn 60 CF in one bout',60,'cf1'],['Win a bout at Capua',1,'win:3'],['Slay 5 beasts',5,'beasts'],['Finish 5 bouts',5,'bouts'],['Win with 20+ coin left',1,'rich']];
  function weekChallenges(t){const wk=Math.floor((t||0)/604800000);const out=[];for(let i=0;i<3;i++)out.push(CHALLENGES[(wk+i*2)%CHALLENGES.length]);return out}
  return {VER,CLASSES8,EVENTS3,RANKS,START_STATS,grow,STAT_KEYS,STAT_POOL,STAT_MIN,STAT_MAX,PRICE,PURSE,rankIdx,rankFor,nextRank,rankProgress,cleanName,statsOK,newChar,canBuy,buy,applyResult,hallWorthy,newLobby,canJoin,weekChallenges}})();
if(typeof module!=='undefined'&&module.exports)module.exports=ONLC;
