/* =====================================================================
   415-v109b — v1.09b THE WINTER CLASSIC (Manager off-season knockout). His "Go" = W3a W5a W6a W15a W16a W17a W18a W20a W21a, W1a confirmed
   2026-10-22 (tools/plans/v109/NOTES.md + MOCKUP.md room 9). Kill switch localStorage flavius_v109boff=1 (= v1.09a: no room 9, Begin needs
   nothing, no Classic bouts). Test tv109b.
   ROOM 9 · THE WINTER CLASSIC, in 413's stepper between 8 Camp and 10 Next season (WQ_X / WQ_K): the rules as 4 chips, the prize line, your
     seed, a fighter picker (one fighter per house for the whole Classic — 355 B22's pattern, chosen here) + ✍ Enter / Sit it out; the bracket
     drawn with 355's Superbus tree CSS (.v104g boxes, connectors, laurels; wildcard / invited tags); the day's bouts with 👁 Watch / ⚔ Fight /
     ▶ Simulate / Bet (17's own data-mg handlers); 🏛 the Cup in the Hall. W18a: room 9 IS on the Match Week tab of that week.
   W5a: ▶ Begin season needs ONLY the Classic answered (weekReady + 413 wqBegin wrappers); bouts left unplayed are simulated when the season
     begins (this module's endWeek wrapper — headless sims that call endWeek without an answer sit the player out).
   SEEDING: 348's P.seeds (the final league table, Sica out — 2026-10-16 s1a flat seeding). W16a: a rival sits out when its best fighter is hurt
     or its purse is low (coin < max(60, two weeks of wages)), decided by hashStr(world id + season + house) — never the dice; at most 3,
     chosen once when Winter Quarters opens (w.wc109.out). Empty seats (no house, a house sitting out, you sitting out, a house with no fit
     fighter) in seed order: the first goes to Sica's Syndicate as the wildcard (W3a: it takes that seat's seed), the rest to invited free
     agents (best OVR; an outsider is made only if none is left, 348 po104Outsider).
   BRACKET (= the Superbus shape): Day I Round 1 — bout A seeds 5·8·9·12, bout B 6·7·10·11 (4-house Cassian, the top 2 go on), seeds 1–4 rest;
     Day II semifinals — 1·4 + A's top 2, 2·3 + B's top 2; their top 2s = FOUR finalists.
   DAY III — PROVISIONAL (W1a: the final IS the Saturnalia, v1.09c). The bracket gives four finalists, so until v1.09c the Cup goes to the
     winner of ONE simulated 4-house bout (Classic Democritus, the Saturnalia's own last event) run by the existing bout simulator
     (17 runBoutSim): ▶ Day III in room 9, or at Begin. ONE function to replace: wc109Final(w,C) (it must end with C.champ set via wcSettle).
   W17a: Days I–II are Match Week bouts in w.night.bouts of the off-season week (no extra frozen weeks): tier TIERS.wc109 (like 348's sb104),
     b.wc109 = {s, d, i, ix (seat indices), k (keys)}. CLEMENCY: leagueFate returns a clemency verdict for a wc109 bout (no death, no rudis,
     no blood money, no pending verdict); applyBout's wounds and lost limbs are put back as they were (no wounds; limbs regrow free, at once);
     NO league points (leaguePtsAfterBout skipped) and NO records: each entrant's g.rec / g.ss / g.recent / g.streak87 and each house's
     bouts / wins / spS are restored after the bout; no Renown from the bouts themselves (renown105 muted inside them); no fixing.
     Manager-only: the online lockstep, the replay goldens and the match dice are untouched (no rule, engine or RNG code here; the sit-out
     hash is hashStr; bout sims use 17's own simulator as every Match Week bout does).
   W15a PRIZES (once, wcPay): the Cup (an engraved plate), +60 coin to the house, +5 morale and +5 loyalty for each of its fighters, +20 Renown
     (363's new source "Winter Classic"). W20a: a "Winter Classic" plinth on the Manager Tituli page (307 wd100TrophyView) with plates I–VI
     (the holder of each Classic; the next six from VII); three wins = THE WINTER CLASSIC REPLICA, a titulus of its own (TROPHY_LIB wc109rep,
     earnTrophy; its progress n/3 on the Tituli page). W6a: the camp (414) still takes every fit fighter. W21a: bye extras (59) kept.
   REPLACES / absorbs: nothing existing (new); 413's overview line "No bouts … in Winter Quarters" → the Classic is the only bouts; 413's room
     ✓ / tile / checklist / Next-season notes get the Classic's line.
   SAVES: w.wc109 = {s, seeds, out, st (null|'in'|'out'|'none'), pick, seats[{k,i,kind,was,gid}], d{1,2,3:[{ix,adv,pl}]}, fin, champ, champG,
     paid, view} per season · w.wc109h = [{s, n, k, lud, gid, gn, mine}] the plates · w.wc109rep (season of the replica). Optional fields, no
     migration (an old save mid-winter gets w.wc109 on first sight). No Store collection.
   ===================================================================== */
const V109B={on:(()=>{try{return localStorage.getItem('flavius_v109boff')!=='1'}catch(e){return true}})(),bout:false};
window.V109B=V109B;
if(V109B.on&&typeof V109WQ!=='undefined'&&V109WQ.on&&typeof WQ_X!=='undefined'&&typeof OFF104!=='undefined'){
const WC109={coin:60,mo:5,loy:5,ren:20,pct:50,max:3,low:60};
TIERS.wc109={n:_T('Winter Classic'),ev:'cassian',purse:0,fee:0,lo:0,hi:99,fame:4};
if(typeof BOUT_DAY!=='undefined')BOUT_DAY.wc109=_T('Hiberna');
/* the travelling cup (drawn by 22 trophySVG; the Cup itself is the plinth, the replica is the titulus) */
const WC109_CUP={shape:'cup',metal:'silver',base:'marble',topper:'laurel',gem:'#5aa0d8',ins:'HIBERNA',name:'The Winter Classic Cup'};
TROPHY_LIB.push({id:'wc109rep',name:'The Winter Classic Replica',desc:_T('Three Winter Classic Cups: the replica the house keeps.'),shape:'cup',metal:'silver',base:'marble',topper:'laurel',gem:'#5aa0d8',ins:'III',rewards:{},cat:'special'});
if(typeof REN105!=='undefined'){REN105.lab.wc109=_T('Winter Classic');REN105.amt.wc109=WC109.ren}
if(typeof LED109_FN!=='undefined')LED109_FN.wc109Pay='purses';
const WC109_R1=[[4,7,8,11],[5,6,9,10]];

/* ---------------- the room in the stepper ---------------- */
{const i=WQ_K.indexOf('next');WQ_K.splice(i<0?WQ_K.length:i,0,'classic')}
WQ_X.rooms.classic=()=>({k:'classic',i:'🏆',n:_T('The Winter Classic'),s:_T('Classic'),adv:'doctore'});

/* ---------------- state ---------------- */
const wcS=w=>{const C=w&&w.wc109;return C&&C.s===w.season?C:null};
const wcM=k=>k&&k.startsWith('m:')?po104M(k):null;
/* W16a: who sits out — a hurt best fighter or a low purse, then a hash of world + season + house (never the dice); at most WC109.max */
function wc109Out(w,seeds){const L=[];for(const k of seeds){const m=wcM(k);if(!m||m.isPlayer||m.dead)continue;
    const ros=rosterOf(m).slice().sort((a,b)=>effOvr(b)-effOvr(a));const hurt=!ros.length||!!ros[0].inj;const wages=ros.reduce((a,g)=>a+(g.contract?g.contract.wage||0:0),0);
    const low=(m.coin||0)<Math.max(WC109.low,wages*2);if(!hurt&&!low)continue;const h=hashStr('wc109|'+w.id+'|'+w.season+'|'+m.id)>>>0;if(h%100<WC109.pct)L.push([h,m.id,hurt?'hurt':'purse'])}
  return L.sort((a,b)=>a[0]-b[0]).slice(0,WC109.max).map(x=>({id:x[1],why:x[2]}))}
function wcEnsure(w){try{if(!wqLive(w))return null}catch(e){return null}let C=wcS(w);if(C)return C;
  const P=wqP(w);let seeds=(P&&P.seeds||[]).slice(0,12);if(!seeds.length)try{seeds=po104Seeds(w)}catch(e){seeds=[]}
  seeds=seeds.map(k=>{const m=wcM(k);return m&&!m.dead&&!m.sica?k:null});while(seeds.length<12)seeds.push(null);
  const mk='m:'+me().id;C=w.wc109={s:w.season,seeds,out:wc109Out(w,seeds),st:seeds.includes(mk)?null:'none',pick:null,seats:null,d:{},fin:null,champ:null,champG:null,paid:0,view:'br'};
  if(C.st==='none')wcBuild(w,C);return C}
/* the twelve seats; empty ones → Sica's wildcard first (W3a: that seat's seed), then invited free agents */
function wc109Seats(w,C,st){const mk='m:'+me().id;const out=new Set(C.out.map(x=>'m:'+x.id));const none=new Set();
  const sica=w.mgrs.find(m=>m.sica&&!m.dead);let wild=!!(sica&&po104Fits(w,sica,none).length);
  const fas=freeAgents().filter(g=>!g.inj&&!g.inv&&g.alive!==false).sort((a,b)=>effOvr(b)-effOvr(a)||String(a.id).localeCompare(String(b.id)));let fi=0;
  return C.seeds.map((k,i)=>{const m=wcM(k);const empty=!m||out.has(k)||(k===mk?st==='out':!po104Fits(w,m,none).length);if(!empty)return {k,i,kind:'house'};
    if(wild){wild=false;return {k:'m:'+sica.id,i,kind:'wild',was:k}}const g=fas[fi++];return {k:g?'o:'+g.id:null,i,kind:'inv',was:k}})}
/* the fighter a seat sends (one per house for the whole Classic) */
function wcPick(w,C,s,used){if(s.k&&s.k.startsWith('o:')){const g=gById(s.k.slice(2));if(g&&g.alive!==false&&!g.contract&&!used.has(g.id))return g.id}
  const m=wcM(s.k);if(m){const el=po104Fits(w,m,used);const want=m.isPlayer&&C.pick?el.find(g=>g.id===C.pick):null;const g=want||el[0];if(g)return g.id}
  const fa=freeAgents().filter(x=>!x.inj&&!x.inv&&!used.has(x.id)).sort((a,b)=>effOvr(b)-effOvr(a))[0]||po104Outsider(w);if(s.k&&!s.k.startsWith('o:'))s.was=s.k;s.k='o:'+fa.id;s.kind='inv';return fa.id}
function wcBuild(w,C){if(C.seats)return;const seats=wc109Seats(w,C,C.st);const used=new Set();for(const s of seats){s.gid=wcPick(w,C,s,used);used.add(s.gid)}C.seats=seats;wcDay(w,C,1)}
function wcBout(w,C,d,i,ix){const used=new Set(w.night.bouts.filter(b=>b.wc109&&!b.done).flatMap(b=>b.ents));
  const ents=ix.map(j=>{const s=C.seats[j];const g=s.gid?gById(s.gid):null;const m=wcM(s.k);const ok=g&&g.alive!==false&&!used.has(g.id)&&(m?!!(g.contract&&g.contract.mgr===m.id):!g.contract);
    if(!ok)s.gid=wcPick(w,C,s,used);used.add(s.gid);return s.gid});
  return {tier:'wc109',ev:d===3?'democritus':'cassian',purse:0,special:false,fee:0,ents,done:false,res:null,bets:[],wc109:{s:C.s,d,i,ix:ix.slice(),k:ix.map(j=>C.seats[j].k)}}}
function wcDay(w,C,d){if(C.d[d])return;let R;if(d===1)R=WC109_R1.map(x=>x.slice());else if(d===2){const A=C.d[1];R=[[0,3,...A[0].adv],[1,2,...A[1].adv]]}else return;
  C.d[d]=R.map(ix=>({ix,adv:null,pl:null}));R.forEach((ix,i)=>w.night.bouts.push(wcBout(w,C,d,i,ix)))}
const wcBouts=(w,C,d)=>(w.night&&w.night.bouts||[]).map((b,bi)=>[b,bi]).filter(([b])=>b.wc109&&b.wc109.s===C.s&&(d==null||b.wc109.d===d));
/* a bout's finishing order as seats (the event's own places); called off = seed order */
function wcOrder(b){const W=b.wc109;if(b.res&&b.res.rows)return [...b.res.rows].sort((x,y)=>(x.place||99)-(y.place||99)).map(r=>{const q=b.ents.indexOf(r.gid);return q>=0?{j:W.ix[q],gid:r.gid,place:r.place}:null}).filter(Boolean);
  return W.ix.map((j,q)=>({j,gid:b.ents[q],place:q+1}))}
/* a bout is over: its places; the day over → the next day (Day II → the four finalists; Day III → the Cup) */
function wcSettle(w,C,b){const W=b.wc109;const x=C.d[W.d]&&C.d[W.d][W.i];if(!x||x.pl)return;const o=wcOrder(b);x.pl=o.map(r=>({j:r.j,gid:r.gid,place:r.place}));x.adv=o.slice(0,W.d===3?1:2).map(r=>r.j);
  if(wcBouts(w,C,W.d).some(([y])=>!y.done))return;
  if(W.d===1)wcDay(w,C,2);else if(W.d===2)C.fin=[...C.d[2][0].adv,...C.d[2][1].adv];else{C.champ=x.adv[0];C.champG=x.pl[0].gid;wcPay(w,C)}}

/* ---------------- Day III — PROVISIONAL until v1.09c (W1a: the final IS the Saturnalia). v1.09c replaces THIS function. ---------------- */
async function wc109Final(w,C){if(!C||C.champ!=null||!C.fin)return null;
  if(!C.d[3]){C.d[3]=[{ix:C.fin.slice(),adv:null,pl:null}];w.night.bouts.push(wcBout(w,C,3,0,C.fin))}
  const L=wcBouts(w,C,3);for(const [b,bi] of L){if(!b.done)await runBoutSim(bi);if(b.done)wcSettle(w,C,b)}return C.champ}
window.wc109Final=wc109Final;

/* ---------------- the prizes (W15a), the plate, the replica (W20a) ---------------- */
function wc109Pay(w,m){m.coin+=WC109.coin;for(const g of rosterOf(m)){g.morale=clamp((g.morale||50)+WC109.mo,0,100);g.loyB=clamp((g.loyB||0)+WC109.loy,-25,25)}
  if(m.isPlayer){try{if(typeof renown105==='function')renown105(m,'wc109',WC109.ren)}catch(e){console.error(e)}
    try{tnews(_T`🏆 The Winter Classic Cup comes home: ${coinAmt87('+'+WC109.coin)}, +${WC109.mo} morale and loyalty for the house, +${WC109.ren} Renown.`,'big')}catch(e){}}}
function wcPay(w,C){if(C.paid)return;C.paid=1;const s=C.seats[C.champ];const g=gById(C.champG);const m=wcM(s&&s.k);
  w.wc109h=w.wc109h||[];const n=w.wc109h.length+1;const mine=!!(m&&m.isPlayer);w.wc109h.push({s:C.s,n,k:s?s.k:null,lud:m?m.ludus:null,gid:g?g.id:null,gn:g?g.name:null,mine});
  if(m)wc109Pay(w,m);if(g){g.fame=clamp((g.fame||0)+5,0,100);try{ghist(g,_T`won the Winter Classic ${RN(n)} (season ${C.s})${m?_T` for ${esc(m.ludus)}`:''}`)}catch(e){}}
  try{mnews(_T`🏆 <b>${esc(g?g.name:'?')}</b>${m?_T` of ${esc(m.ludus)}`:''} wins <b>the Winter Classic</b> — the Cup travels to its new holder.`,mine?'big':'')}catch(e){}
  if(mine&&!w.wc109rep&&w.wc109h.filter(x=>x.mine).length>=3){w.wc109rep=C.s;try{earnTrophy(w,'wc109rep',{who:g?g.name:null,gid:g?g.id:null,why:_T('Three Winter Classic Cups')})}catch(e){console.error(e)}}}

/* ---------------- the answer ---------------- */
function wc109Answer(w,st,gid){const C=wcEnsure(w);if(!C||C.st)return null;const pm=me();
  if(st==='in'){const el=po104Fits(w,pm,new Set());const g=el.find(x=>x.id===gid)||(gid?null:el[0]);if(!g)return null;C.pick=g.id}
  else if(st!=='out')return null;
  C.st=st;wcBuild(w,C);try{tnews(st==='in'?_T`🏆 ${esc(gById(C.pick).name)} enters the Winter Classic for the house.`:_T('🏆 Your house sits the Winter Classic out.'))}catch(e){}
  try{saveWorld()}catch(e){}return C}
window.wc109Answer=wc109Answer;window.wc109Ensure=wcEnsure;window.wc109Out=wc109Out;
/* every bout left: Days I–II, then Day III (Begin; and any endWeek of that week) */
async function wc109Finish(w){const C=wcEnsure(w);if(!C)return null;if(!C.st){C.st='out';C.auto=1}if(!C.seats)wcBuild(w,C);
  for(let guard=0;guard<8;guard++){const L=wcBouts(w,C).filter(([b])=>!b.done&&b.wc109.d<3);if(!L.length)break;const [b,bi]=L[0];await runBoutSim(bi);if(b.done)wcSettle(w,C,b);else break}
  if(C.champ==null&&C.fin)await window.wc109Final(w,C);return C} /* v1.09c (416): window.wc109Final = the Saturnalia */
window.wc109Finish=wc109Finish;
window.WC109T={pay:wcPay,settle:wcSettle,bouts:wcBouts,seats:wc109Seats,bout:wcBout,s:wcS,m:wcM,cup:WC109_CUP}; /* test hooks + 416-v109c */

/* ---------------- clemency, no points, no records (Manager-only) ---------------- */
{const base=leagueFate;leagueFate=function(glad,row,mgr,bout){if(!(bout&&bout.wc109))return base.apply(this,arguments);
  const f=(row&&row.f)||0;return {vd:'clemency',fname:_T('Winter Classic · clemency'),line:f<20?_T`${esc(glad.name)} is spared — the Winter Classic's clemency`:''}}}
{const base=leaguePtsAfterBout;leaguePtsAfterBout=function(bout){if(bout&&bout.wc109)return;return base.apply(this,arguments)}}
{const base=boutRiggable;boutRiggable=function(b){if(b&&b.wc109)return false;return base.apply(this,arguments)}}
if(typeof renown105==='function'){const base=renown105;renown105=function(m,key){if(V109B.bout&&key!=='wc109')return 0;return base.apply(this,arguments)};window.renown105=renown105}
const wcJ=x=>x==null?x:JSON.parse(JSON.stringify(x));
function wcSnap(b){const G=[],M=new Map();for(const id of b.ents){const g=gById(id);if(!g)continue;
    G.push([g,{rec:wcJ(g.rec),ss:wcJ(g.ss),has:{ss:'ss' in g,recent:'recent' in g,inj:'inj' in g},recent:wcJ(g.recent),inj:wcJ(g.inj),sev:wcJ(g.severed),st:g.streak87,purse:g.purse||0}]);
    const m=g.contract?mgrById(g.contract.mgr):null;if(m&&!M.has(m))M.set(m,{bouts:m.bouts,wins:m.wins,spS:wcJ(m.spS),coin:m.coin})}
  return {G,M}}
function wcRestore(b,S){const win=new Set((b.res&&b.res.winners)||[]);
  for(const [g,o] of S.G){g.rec=o.rec;for(const k of ['ss','recent','inj']){const v=k==='ss'?o.ss:k==='recent'?o.recent:o.inj;if(o.has[k])g[k]=v;else delete g[k]}
    if(Array.isArray(o.sev))g.severed=o.sev;if(o.st===undefined)delete g.streak87;else g.streak87=o.st;
    /* a purse of 0: 17 still hands the winner a 1-coin share out of the house's cut — put it back */
    const m=g.contract?mgrById(g.contract.mgr):null;if(win.has(g.id)&&m&&(g.purse||0)>=o.purse+1){g.purse-=1;m.coin+=1}}
  for(const [m,o] of S.M){m.bouts=o.bouts;m.wins=o.wins;m.spS=o.spS}}
{const base=applyBout;applyBout=function(bi,res,opt){const w=W_();const b=w&&w.night&&w.night.bouts&&w.night.bouts[bi];if(!b||!b.wc109||b.done)return base.apply(this,arguments);
  const snap=wcSnap(b);V109B.bout=true;let r;try{r=base.apply(this,arguments)}finally{V109B.bout=false;try{wcRestore(b,snap)}catch(e){console.error(e)}}
  try{const C=wcS(w);if(C&&b.done)wcSettle(w,C,b);saveWorld()}catch(e){console.error(e)}return r}}

/* ---------------- W5a: Begin needs only the Classic answered ---------------- */
{const base=weekReady;weekReady=function(){const w=W_();let C=null;try{if(w&&wqLive(w))C=wcEnsure(w)}catch(e){}if(!C)return base.apply(this,arguments);
  if(!C.st)return {ok:false,why:_T('Answer the Winter Classic first: enter a fighter or sit it out.')};
  const und=w.night.bouts.filter(b=>!b.done&&b.wc109);for(const b of und)b.done=true;try{return base.apply(this,arguments)}finally{for(const b of und)b.done=false}}}
{const base=wqBegin;wqBegin=async function(){const w=W_();try{if(w&&wqLive(w)&&!MGR.busy){const C=wcEnsure(w);if(C&&!C.st){try{mToast(_T('Answer the Winter Classic first: enter a fighter or sit it out.'))}catch(e){}wqGo('classic');return false}}}catch(e){console.error(e)}
  return base.apply(this,arguments)};window.wqBegin=wqBegin}
{const base=endWeek;endWeek=async function(){const w=W_();let live=false;try{live=!!(w&&!w.dead&&wqLive(w))}catch(e){}
  if(live){try{await wc109Finish(w)}catch(e){console.error(e)}}return base.apply(this,arguments)}}
/* first sight (an old save mid-winter included) and the off-season's letter */
{const base=mgrHTML;mgrHTML=function(){try{const w=W_();if(w&&wqLive(w))wcEnsure(w)}catch(e){console.error(e)}return base.apply(this,arguments)}}
{const base=po104OffStart;po104OffStart=function(w){const r=base.apply(this,arguments);try{if(!w||w.tutorial||w.dead||!wqLive(w))return r;const C=wcEnsure(w);
    const L=(w.letters||[]).find(x=>x&&x.key==='wq109-'+w.season);if(L&&C&&typeof L.body==='string'&&L.body.indexOf('</ul>')>=0){const s=C.seeds.indexOf('m:'+me().id)+1;
      L.body=L.body.replace('</ul>',`<li>${s?_T`🏆 <b>The Winter Classic</b> — seed #${s}: enter a fighter or sit it out.`:_T('🏆 <b>The Winter Classic</b> — your house is not seeded; watch and bet.')}</li></ul>`)}}catch(e){console.error(e)}
  return r}}

/* ---------------- room 9 ---------------- */
const wcName=s=>{if(!s||!s.k)return _T('an invited free agent');if(s.k.startsWith('o:')){const g=gById(s.k.slice(2));return g?g.name:_T('an invited free agent')}return po104Name(s.k)};WC109T.name=wcName;
const WC109_D=()=>['',_T('Day I'),_T('Day II'),_T('Day III')];
function wcTree(w,C){const mk='m:'+me().id;const proj=!C.seats;const seats=C.seats||wc109Seats(w,C,C.st||'in');const D=C.d||{};
  const ph=t=>`<div class="v104e ph"><span class="sd"></span><span class="fl"></span><b>${t}</b><span class="pl"></span></div>`;
  const row=(j,x)=>{const s=seats[j];if(!s)return ph('—');const m=wcM(s.k);const pl=x&&x.pl?x.pl.find(y=>y.j===j):null;const st=x&&x.adv?(x.adv.includes(j)?' adv':' out'):'';
    const g=pl?gById(pl.gid):s.gid?gById(s.gid):null;const tag=s.kind==='wild'?`<i class="wc109tag wild">${_T('wildcard')}</i>`:s.kind==='inv'?`<i class="wc109tag inv">${_T('invited')}</i>`:'';
    const fl=m&&typeof flagChip==='function'?flagChip(m,16):'<i class="v104nf">⚑</i>';
    return `<div class="v104e${s.k===mk?' me':''}${st}${proj?' pj':''}"${g?` title="${esc(g.name)}"`:''} data-wc109seat="${j}"><span class="sd">${j+1}</span><span class="fl">${fl}</span><b>${esc(wcName(s))}${tag}</b><span class="pl">${pl?RN(pl.place):''}</span></div>`};
  const box=(t,sub,ix,x,phs,cls)=>`<div class="po104b v104b${cls?' '+cls:''}"><div class="v104bt">${t}${sub?`<small>${sub}</small>`:''}</div>${(ix||[]).map(j=>row(j,x)).join('')}${(phs||[]).map(ph).join('')}</div>`;
  const AB=i=>i?'B':'A',SI=i=>i?'II':'I';
  const r1=[0,1].map(i=>box(_T`Bout ${AB(i)} · seeds ${WC109_R1[i].map(j=>j+1).join('·')}`,'',WC109_R1[i],D[1]&&D[1][i]));
  const sf=[0,1].map(i=>{const x=D[2]&&D[2][i];return x?box(_T`Semifinal ${SI(i)}`,'',x.ix,x):box(_T`Semifinal ${SI(i)}`,'',[i?1:0,i?2:3],null,[_T`Bout ${AB(i)} · 1st`,_T`Bout ${AB(i)} · 2nd`])});
  const x3=D[3]&&D[3][0];const fin=C.fin?box(_T('The final'),_T('provisional'),C.fin,x3,null,'fin'):box(_T('The final'),_T('provisional'),null,null,[_T('Semifinal I · top 2'),_T('Semifinal II · top 2')],'fin');
  const lau=typeof lau103==='function'?lau103:()=>'';const cup=trophySVG(WC109_CUP,52);const cs=C.champ!=null?seats[C.champ]:null;const cm=cs?wcM(cs.k):null;const cg=C.champG?gById(C.champG):null;
  const champ=cs?`<div class="v104ch on${cm&&cm.isPlayer?' me':''}"><div class="v104lr">${lau(false)}${cup}${lau(true)}</div><b>${esc(wcName(cs))}</b><small>${esc(cg?cg.name:'')}</small><span class="v104cl">${_T('Winter champions')}</span></div>`
    :`<div class="v104ch"><div class="v104lr">${lau(false)}${cup}${lau(true)}</div><b>${_T('The Winter Classic Cup')}</b><small>${_T('travels to each new winner')}</small></div>`;
  const lit=(x)=>x&&x.adv?' lit':'';const H=(c,t,s)=>`<div class="v104hd" style="grid-column:${c}">${t}<small>${s}</small></div>`;
  return `<div class="po104bk v104tr wc109bk${proj?' proj':''}"><p class="po104pj">${proj?_T('Projected · seeded by the final league table · seeds 1–4 rest on Day I.'):_T('Gold goes through · faded is out · the top 2 of each bout go on.')}</p><div class="v104sx"><div class="v104g">
    ${H(1,_T('Day I'),_T('Round 1'))}${H(3,_T('Day II'),_T('Semifinals'))}${H(5,_T('Day III'),_T('The final'))}${H(7,_T('The Cup'),'')}
    <div class="v104cell" style="grid-column:1;grid-row:2">${r1[0]}</div><div class="v104k k1${lit(D[1]&&D[1][0])}" style="grid-column:2;grid-row:2"></div><div class="v104cell" style="grid-column:3;grid-row:2">${sf[0]}</div>
    <div class="v104cell" style="grid-column:1;grid-row:3">${r1[1]}</div><div class="v104k k1${lit(D[1]&&D[1][1])}" style="grid-column:2;grid-row:3"></div><div class="v104cell" style="grid-column:3;grid-row:3">${sf[1]}</div>
    <div class="v104k k2${C.fin?' lit':''}" style="grid-column:4;grid-row:2/4"></div><div class="v104cell" style="grid-column:5;grid-row:2/4">${fin}</div>
    <div class="v104k k1${C.champ!=null?' lit':''}" style="grid-column:6;grid-row:2/4"></div><div class="v104cell" style="grid-column:7;grid-row:2/4">${champ}</div></div></div></div>`}
/* the bouts of the day being played: fight / watch / simulate / bet (17's data-mg handlers) */
function wcBoutsHTML(w,C){const pm=me();const n=w.night;const L=wcBouts(w,C);const open=L.filter(([b])=>!b.done);const d=open.length?open[0][0].wc109.d:null;
  const AB=i=>i?'B':'A',SI=i=>i?'II':'I';
  const card=([b,bi])=>{const W=b.wc109;const t=W.d===1?_T`Day I · Bout ${AB(W.i)}`:W.d===2?_T`Day II · Semifinal ${SI(W.i)}`:_T('Day III · The final');let odds=[];try{odds=boutOdds(b)}catch(e){}
    const inOrder=(typeof any100Before==='function'?any100Before(n,bi):n.bouts.slice(0,bi)).every(x=>x.done);const myIn=b.ents.some(id=>{const g=gById(id);return g&&g.contract&&g.contract.mgr===pm.id});
    const rows=b.ents.map((id,q)=>{const g=gById(id);const s=C.seats[W.ix[q]];const m=wcM(s&&s.k);const r=b.res&&b.res.rows.find(x=>x.gid===id);
      return `<tr class="${m&&m.isPlayer?'me':''}${r&&r.won?' won':''}"><td class="sd">${W.ix[q]+1}</td><td class="nm">${g?gArt(g,'xs'):''}<span><b>${esc(g?g.name:'?')}</b><small>${esc(wcName(s))}</small></span></td><td>${g?effOvr(g):''}</td>
        <td>${b.done?(r&&r.place?`<b>${RN(r.place)}</b>`:''):W.d<3?`<button class="btn tksm" type="button" data-mg="bet" data-id="${bi}|${id}|${odds[q]}" ${pm.coin<1?'disabled':''}>${_T`Bet ${odds[q]}×`}</button>`:''}</td></tr>`}).join('');
    const acts=b.done?'':W.d===3?`<button type="button" class="btn primary sd100 sd100p" data-wc109="final">${_T('▶ Simulate the final')}</button>`
      :!inOrder?`<span class="rc-sub">${_T('⏳ Waiting its turn — the bouts run in order.')}</span>`
      :`<button class="btn primary" type="button" data-mg="watch" data-id="${bi}">${_T('👁 Watch')}</button>${myIn?`<button class="btn" type="button" data-mg="fight" data-id="${bi}">${_T('⚔ Fight it yourself')}</button>`:''}<button class="btn" type="button" data-mg="sim" data-id="${bi}">${_T('▶ Simulate')}</button>`;
    const stake=!b.done&&W.d<3?`<span class="wc109stk">${_T('Stake')} <input type="number" class="tin" id="mgStake${bi}" min="1" max="${pm.coin}" value="${Math.min(10,Math.max(1,pm.coin))}"></span>`:'';
    return `<div class="wc109bt${b.done?' done':''}${myIn?' mine':''}" data-wc109bout="${bi}"><div class="wc109bh"><b>${t}</b><span class="rc-sub">${esc((EVENTS[b.ev]||{}).n||'')}${b.done?' · ✓':''}</span>${stake}</div>
      <div class="wqtw"><table class="wqtbl wc109tb"><tbody>${rows}</tbody></table></div>${acts?`<div class="acts">${acts}</div>`:''}</div>`};
  let body='';
  if(d!=null){const day=L.filter(([b])=>b.wc109.d===d);body=day.map(card).join('')+(d<3&&open.length>1?`<div class="acts"><button type="button" class="btn tksm" data-wc109="day">${_T`⚡ Simulate ${WC109_D()[d]}`}</button></div>`:'')}
  else if(C.fin&&C.champ==null)body=`<div class="wc109bt"><div class="wc109bh"><b>${_T('Day III · The final')}</b><span class="rc-sub">${esc(C.fin.map(j=>wcName(C.seats[j])).join(' · '))}</span></div>
      <p class="rc-sub">${_T('For now the final is one simulated bout of the four finalists (provisional).')}</p><div class="acts"><button type="button" class="btn primary sd100 sd100p" data-wc109="final">${_T('▶ Day III · the final')}</button></div></div>`;
  else if(C.champ!=null){const s=C.seats[C.champ];const g=gById(C.champG);body=`<p class="wqlead wc109won">${_T`🏆 <b>${esc(g?g.name:'?')}</b> (${esc(wcName(s))}) wins the Winter Classic.`}</p>`}
  if(!body)return '';const dd=d!=null?WC109_D()[d]:C.champ!=null?_T('Done'):WC109_D()[3];
  return `<div class="card2 wq109c wc109days"><div class="sect">${_T`⚔ The bouts · ${dd}`}</div>${body}</div>`}
function wcEntryHTML(w,C){const pm=me();const mk='m:'+pm.id;const seed=C.seeds.indexOf(mk)+1;
  if(C.st==='none')return `<p class="rc-sub wc109st">${_T('Your house is not among the twelve seeds this winter. Watch the bouts and bet on them.')}</p>`;
  if(C.st==='in'){const g=gById(C.pick);return `<div class="wc109ent"><span class="wc109sd">${_T`Seed <b>${seed}</b>`}</span><span class="badge gold">${_T`✍ ${esc(g?g.name:'?')} fights for the house`}</span></div>`}
  if(C.st==='out'){const s=C.seats&&C.seats[seed-1];return `<div class="wc109ent"><span class="wc109sd">${_T`Seed <b>${seed}</b>`}</span><span class="badge">${_T('Your house sits it out')}</span>${s?`<span class="rc-sub">${_T`Your seat: ${esc(wcName(s))}`}</span>`:''}</div>`}
  const el=po104Fits(w,pm,new Set());if(!el.length)return `<div class="wc109ent"><span class="wc109sd">${_T`Seed <b>${seed}</b>`}</span><span class="rc-sub">${_T('No fit fighter to send.')}</span><button type="button" class="btn tksm" data-wc109="out">${_T('Sit it out')}</button></div>`;
  const cn=g=>CLASSES[g.cls]?CLASSES[g.cls].name:g.cls;
  return `<div class="wc109ent"><span class="wc109sd">${_T`Seed <b>${seed}</b>`}</span><label>${_T('Your fighter')} <select class="tin" data-wc109pick>${el.map(g=>`<option value="${g.id}">${esc(g.name)} · ${esc(cn(g))} · ${effOvr(g)}</option>`).join('')}</select></label>
    <button type="button" class="btn primary sd100 sd100p" data-wc109="in">${_T('✍ Enter')}</button><button type="button" class="btn tksm" data-wc109="out">${_T('Sit it out')}</button></div>`}
/* the Cup on its plinth: holder, plates I–VI, the replica (room 9's Hall and the Tituli page) */
function wc109HallHTML(w,px){const H=w.wc109h||[];const last=H[H.length-1];const pm=me();const mine=H.filter(x=>x.mine).length;const n1=H.length?Math.floor((H.length-1)/6)*6+1:1;
  const plates=[0,1,2,3,4,5].map(q=>{const n=n1+q;const x=H.find(h=>h.n===n);return `<div class="wc109pl${x?' on':''}${x&&x.mine?' me':''}" data-wc109plate="${n}"><span>${RN(n)}</span><b>${x?esc(x.lud||x.gn||'—'):''}</b>${x?`<small>${_T`season ${x.s}`}</small>`:''}</div>`}).join('');
  const rep=w.wc109rep?`<span class="badge gold">${_T('✓ The replica is yours')}</span>`:`<span class="wc109pips" aria-label="${esc(_T`${Math.min(mine,3)} of 3`)}">${[0,1,2].map(i=>`<i class="${i<mine?'on':''}"></i>`).join('')}</span><span class="rc-sub">${_T`${Math.min(mine,3)} of 3 for the replica`}</span>`;
  return `<div class="wc109hall"><div class="wc109hc">${trophySVG(WC109_CUP,px||120)}<div class="wc109hct"><b class="wc109hn">${_T('The Winter Classic Cup')}</b><p>${last?_T`Held by <b>${esc(last.lud||last.gn||'—')}</b> · Winter Classic ${RN(last.n)}`:_T('Not yet won.')}</p>
    <p class="rc-sub">${_T('One plate a winter. Three wins: a replica for the house’s own Tituli.')}</p><div class="wc109rep">${esc(pm.ludus)} ${rep}</div></div></div><div class="wc109pls">${plates}</div></div>`}
window.wc109HallHTML=wc109HallHTML;
function wc109Room(w){const C=wcEnsure(w);const mk='m:'+me().id;const seed=C.seeds.indexOf(mk)+1;
  const rules=[_T('🕊 Clemency: no deaths, no severe wounds'),_T('🦾 Lost limbs regrow free'),_T('📊 No league points, no lifetime records'),_T('✋ Optional — sitting out costs nothing')].map(t=>`<span class="wc109rule">${t}</span>`).join('');
  const prize=`<p class="rc-sub wc109pr">${_T`The winner: the Cup · ${coinAmt87('+'+WC109.coin)} · +${WC109.mo} morale and loyalty for the house · +${WC109.ren} Renown. Three wins: a replica for your Tituli.`}</p>`;
  const why={hurt:_T('best fighter hurt'),purse:_T('short of coin')};const outs=C.out.map(x=>{const m=mgrById(x.id);return m?`${esc(m.ludus)} (${why[x.why]||''})`:''}).filter(Boolean);
  const hall=C.view==='hall';
  const tog=`<div class="wc109tog"><button type="button" class="btn tksm${hall?'':' on'}" data-wc109="view|br" aria-pressed="${!hall}">${_T('🏆 The bracket')}</button><button type="button" class="btn tksm${hall?' on':''}" data-wc109="view|hall" aria-pressed="${hall}">${_T('🏛 The Cup in the Hall')}</button></div>`;
  const note=`<p class="rc-sub">${outs.length?_T`Sitting out: ${outs.join(', ')}.`+' ':''}${_T('Empty seats go to Sica’s Syndicate as the wildcard, then to invited free agents. Four fighters a bout; the top 2 go on.')}</p>`;
  return wqBan('classic',_T('The winter knockout · one fighter per house · seeded by the final table'),wqChip(String(C.seeds.filter(Boolean).length-C.out.length),_T('houses'))+wqChip(seed?'#'+seed:'—',_T('your seed')))
    +`<div class="card2 wq109c wc109c"><div class="wc109h">${trophySVG(WC109_CUP,74)}<div><div class="wc109rules">${rules}</div>${prize}${wcEntryHTML(w,C)}</div></div>${tog}
      ${hall?wc109HallHTML(w,120):wcTree(w,C)+note}</div>${hall?'':wcBoutsHTML(w,C)}`}
WQ_FN.classic=wc109Room;
WQ_X.sum.classic=w=>{const C=wcEnsure(w);if(!C)return '';if(C.champ!=null){const s=C.seats[C.champ];return _T`Won by ${wcName(s)}`}
  if(!C.st)return _T('Enter a fighter or sit it out');if(C.st==='in'){const g=gById(C.pick);return _T`Entered: ${g?g.name:'?'}`}return C.st==='out'?_T('Your house sits it out'):_T('Not seeded · watch and bet')};
{const base=wqDone;wqDone=function(w,k){if(k==='classic'){try{const C=wcEnsure(w);return !!(C&&C.st)}catch(e){return false}}return base.apply(this,arguments)}}
/* room 10's notes and the overview line */
{const base=WQ_FN.next;WQ_FN.next=function(w){let h=base.apply(this,arguments);try{const C=wcEnsure(w);if(!C)return h;
  const li=!C.st?_T('🏆 The Winter Classic waits for your answer.'):C.champ==null?_T('🏆 The Winter Classic’s remaining bouts are simulated.'):'';
  if(li)h=h.replace('<ul class="wqnotes">',`<ul class="wqnotes"><li>${esc(li)}</li>`)}catch(e){console.error(e)}return h}}
{const base=WQ_FN.over;WQ_FN.over=function(w){const h=base.apply(this,arguments);try{return h.split(_T('No bouts and no league games in Winter Quarters. The rooms go in any order; the last one starts the season.')).join(_T('No league games in Winter Quarters — only the Winter Classic. The rooms go in any order; the last one starts the season.'))}catch(e){}return h}}
/* the week's checklist: the Classic's item */
{const base=weekChecklist;weekChecklist=function(){const I=base.apply(this,arguments);try{const w=W_();if(!Array.isArray(I)||!wqLive(w))return I;const C=wcEnsure(w);if(!C)return I;
  I.push({done:!!C.st,ic:'🏆',txt:C.st?_T('The Winter Classic: answered'):_T('<b>The Winter Classic</b> waits for your answer'),btn:C.st?'':`<button class="btn tksm" type="button" data-wq109="go|classic">${_T('Winter Classic')}</button>`})}catch(e){console.error(e)}return I}}

/* ---------------- W20a · the plinth on the Manager Tituli page; the replica's progress ---------------- */
if(typeof wd100TrophyView==='function'){const base=wd100TrophyView;wd100TrophyView=function(){const h=base.apply(this,arguments);try{const w=W_();if(typeof h!=='string'||!w||w.tutorial||WD100.tf!=='mgr')return h;
  const i=h.indexOf('<div class="wd100tools">');const j=i>=0&&typeof tit100Span==='function'?tit100Span(h,i):-1;
  const sec=`<div class="wc109tit" data-wc109tit="1">${typeof plq100==='function'?plq100(_T('The Winter Classic'),_T('the travelling cup')):''}${wc109HallHTML(w,110)}</div>`;
  return j>0?h.slice(0,j)+sec+h.slice(j):sec+h}catch(e){console.error(e)}return h}}
if(typeof tit100Mgr==='function'){const base=tit100Mgr;tit100Mgr=function(){const L=base.apply(this,arguments);try{const w=W_();const n=((w&&w.wc109h)||[]).filter(x=>x.mine).length;
  for(const x of L||[])if(x.id==='wc109rep'&&!x.won){x.prog=[Math.min(n,3),3];x.hint=''}}catch(e){console.error(e)}return L}}

/* ---------------- clicks ---------------- */
document.addEventListener('click',async e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-wc109]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
  const w=W_();if(!w||!wqLive(w)||MGR.busy)return;const C=wcEnsure(w);if(!C)return;const [a,v]=String(b.dataset.wc109).split('|');
  if(a==='in'){const sel=document.querySelector('[data-wc109pick]');if(!wc109Answer(w,'in',sel?sel.value:null))try{mToast(_T('That fighter cannot go.'))}catch(x){}}
  else if(a==='out')wc109Answer(w,'out');
  else if(a==='view')C.view=v==='hall'?'hall':'br';
  else if(a==='day'||a==='final'){MGR.busy=true;try{if(a==='day'){const d=(wcBouts(w,C).find(([x])=>!x.done)||[{wc109:{}}])[0].wc109.d;
        for(let g=0;g<4;g++){const L=wcBouts(w,C,d).filter(([x])=>!x.done);if(!L.length)break;await runBoutSim(L[0][1]);if(L[0][0].done)wcSettle(w,C,L[0][0]);else break}}
      else await window.wc109Final(w,C)}catch(x){console.error(x)}finally{MGR.busy=false}}
  try{saveWorld()}catch(x){}if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);

{const st=document.createElement('style');st.textContent=`
.wc109h{display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap}.wc109h>div{flex:1;min-width:0}
.wc109rules{display:flex;flex-wrap:wrap;gap:6px}.wc109rule{font-size:12.5px;padding:3px 9px;border-radius:12px;border:1px solid #7a8ab0;background:#1c2232;color:#dfe8ff}
.wc109pr{margin:6px 0}.wc109ent{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:6px 0}.wc109ent label{display:flex;gap:6px;align-items:center;flex-wrap:wrap;min-width:0}.wc109ent select{max-width:100%}
.wc109sd{font-size:13px}.wc109sd b{font:400 20px var(--display);color:var(--gold2)}
.wc109tog{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.wc109tog .btn.on{border-color:#f0cf7d;color:#f6dc98;box-shadow:0 0 0 1px #d6ab4c inset}
.wc109bk{--v104g:#d6ab4c;--v104l:#8a6a2c}.wc109tag{font-style:normal;font:600 9.5px var(--mono,monospace);letter-spacing:.06em;text-transform:uppercase;margin-left:5px;padding:0 4px;border-radius:3px;vertical-align:middle}
.wc109tag.wild{background:#5b2a6e;color:#f1dcff}.wc109tag.inv{background:#2a3a52;color:#cfe0ff}
.wc109bt{border:1px solid #6b5236;border-radius:8px;padding:6px 8px;margin:0 0 8px;min-width:0}.wc109bt.mine{border-color:#d6ab4c}.wc109bt.done{opacity:.85}
.wc109bh{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}.wc109bh b{font:400 16px var(--display);color:#f6dc98}.wc109stk{margin-left:auto;font-size:12px;display:flex;gap:4px;align-items:center}.wc109stk input{width:64px}
.wc109tb td{vertical-align:middle}.wc109tb td.sd{font:600 11px var(--mono);color:#cbb593;width:22px}.wc109tb td.nm{display:flex;gap:6px;align-items:center;white-space:normal;min-width:120px}.wc109tb td.nm span{display:flex;flex-direction:column;min-width:0}.wc109tb td.nm small{font-size:11px;color:#cbb593}.wc109tb{table-layout:auto}.wc109tb tr.won td{color:#f6dc98}
.wc109won{color:#f6dc98}
.wc109hall{display:flex;flex-direction:column;gap:8px}.wc109hc{display:flex;gap:14px;align-items:center;flex-wrap:wrap}.wc109hct{flex:1;min-width:0}.wc109hct p{margin:4px 0}.wc109hn{font:400 24px var(--display);color:#e8eef8}
.wc109rep{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.wc109pips{display:inline-flex;gap:4px}.wc109pips i{width:12px;height:12px;border-radius:50%;border:1px solid #c9d1dc;background:#2a2f3a}.wc109pips i.on{background:linear-gradient(#e8ecf2,#9aa2b0)}
.wc109pls{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}
.wc109pl{display:flex;flex-direction:column;align-items:center;gap:1px;padding:6px 4px;min-height:48px;border-radius:4px;background:linear-gradient(#7a7f8a,#4a4f5a);color:#1a1d24;border:1px solid #c9d1dc;opacity:.45;min-width:0}
.wc109pl.on{opacity:1;background:linear-gradient(#e8ecf2,#9aa2b0)}.wc109pl.me{outline:2px solid #d6ab4c}.wc109pl span{font:400 13px var(--display)}.wc109pl b{font-size:11px;text-align:center;overflow-wrap:anywhere}.wc109pl small{font-size:10px}
.wc109tit{margin:0 0 10px}.wc109tit .wc109hall{padding:4px 8px}.wc109tit .wc109hct,.wc109tit .wc109hct p{color:#2a1d0e}.wc109tit .wc109hn{color:#4a3418}.wc109tit .rc-sub{color:#5a4630}
.wc109ent label{font-size:13px}
@media (max-width:760px){.wc109pls{grid-template-columns:repeat(3,minmax(0,1fr))}.wc109stk{margin-left:0}.wc109hn{font-size:20px}}
`;document.head.appendChild(st)}
}
