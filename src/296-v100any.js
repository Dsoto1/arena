/* v1.0 (296-v100any) · MANAGER — ENTER ANY EVENT (his picks 1a 2b 3a 4a 5a 6b 7 8a; mock tools/plans/mock100/anyevent.html, shots tools/plans/any100/).
   • 1a THE WEEK'S SPECIALS sit on Match Week ON TOP of Bouts I–III: extra entries in w.night.bouts with tier 'spc100' (TIERS.spc100, BOUT_DAY/BT85_DAY
     Sunday) and b.any100 = {fee, src 'fx'|'ed', rx, side:{gid:'A'|'B'}, paid:{gid:coin}, hire:{gid:{by,c}}, ed:{gid:mgrId}}. A special fixture (Juggernaut,
     Familia, Golden Eagle…) leaves the Main event (which turns Classic · Cassian) and becomes the first headline; the editor adds one more from ANY100.pool
     each week (hash of world id + absolute week — never the dice RNG). Triumviratus stays the undercard (272). No specials in bye, rivalry or lesson weeks.
     They play through the existing bout path (boutCfg / runBoutSim / watchBout / applyBout / mgrAfterWatch), after the Main event (the card runs in order).
   • 2b ENTRY FEE per seat you fill (b.any100.fee; paid when you enter, refunded when you withdraw before the full card is set), no appearance fee,
     a bigger purse (main purse × 1.8, the fixture × 1.2 × its own multiplier, rookie bouts × 0.55). Team events split the purse between the winners.
   • 3a ONE EVENT PER FIGHTER: entering moves him off his bout (n.any100.from); withdrawing puts him back while that seat is still open. st95Fill skips
     fighters entered in a special.
   • 4a TEAM EVENTS (EVENTS[ev].teams===1): your fighter takes the side with the most room; partner = another of yours (both seats pay you), a hired free
     agent (one-week hire fee, his share comes to you) or the editor's pick (free; his share leaves the house). Sides are kept in b.any100.side and the
     entries reordered A/B/A/B (any100Order) so boutCfg's i%2 teams match.
   • 5a/6b RESTRICTED: about every 3rd week (hash) one special takes only "B and above" (rating 70+) or "C and below" (61 and under, rookie bouts) —
     trait96Grade(effOvr). Ineligible fighters are greyed in the picker; a click says why. Rivals and fillers follow it.
   • 7 CARDS FILL EARLY: at makeNight rival houses enter (any100Rivals → any100Enter, the same entry function the player uses) and leave a seat or two;
     when you TRAVEL (travelClick paid) — or the first bout of the week starts (runBoutSim / watchBout / boutCfg) — any100FillAll seats rivals, then
     free agents, then new fighters in every open seat of every bout and special (n.any100.full).
   • 8a The banner bout tracker (145/242) shows a ★ chip per special on its day.
   UI: "This week at <city>" card (.any100wk) above the bout cards (classic + headline rows, seats, purse/fee, Enter a fighter ▾ / ✕); the picker popup
   #any100pk (starters / bench, grade, fatigue, fit; partner choices); special bout cards keep Bet / Watch / Fight / Simulate, their Enter/Withdraw
   become ours. Kill switch localStorage flavius_any100off=1 (no new specials, no week's card; specials already made keep working). Test tv100ae. */
const ANY100={pool:['familia','juggernaut','goldenEagle','ludus','naumachia','chariot','orpheus','gauntlet'],every:3,hi:70,lo:61,
  k:{fx:1.2,ed:1.8,lo:0.55},hireBase:6,pk:null};
function any100Off(){try{return localStorage.getItem('flavius_any100off')==='1'}catch(e){return false}}
TIERS.spc100={n:_T('Headline special'),ev:'familia',purse:0,fee:0,lo:0,hi:99,fame:6};
try{BOUT_DAY.spc100=_T('Sunday')}catch(e){}
try{BT85_DAY.spc100=_T('Sun')}catch(e){}
const any100Sp=b=>!!(b&&b.tier==='spc100'&&b.any100);
const any100Team=b=>{const E=b&&EVENTS[b.ev];return !!(E&&E.teams===1)};
function any100Own(gid,m){const g=gById(gid);return !!(g&&m&&g.contract&&g.contract.mgr===m.id)}
function any100Used(w){return new Set(w.night.bouts.flatMap(b=>b.ents))}
function any100Cur(w,gid){const n=w.night;for(let i=0;i<n.bouts.length;i++)if(n.bouts[i].ents.includes(gid))return {b:n.bouts[i],i};return null}
function any100Grade(g){const o=effOvr(g);return {o,gr:typeof trait96Grade==='function'?trait96Grade(o):''}}
function any100Lbl(b,i){if(any100Sp(b))return _T('Headline');return [_T('Bout I'),_T('Bout II'),_T('Bout III')][i]||TIERS[b.tier].n}
function any100RxTxt(rx){return !rx?'':rx.k==='hi'?_T('Grade B and above only'):_T('Grade C and below only')}

/* ---------- who may enter ---------- */
function any100Why(w,b,g){if(!g||!g.alive)return _T('Gone from the league.');const E=EVENTS[b.ev]||{};
  if(b.done)return _T('Already fought.');
  if(g.inj)return _T`${g.name} is hurt (${g.inj.label}).`;
  if(g.restWk===w.week)return _T`${g.name} rests this week.`;
  if(g.lanista)return _T('The lanista fights only in the Gambit.');
  if(typeof lentOut==='function'&&lentOut(g))return _T`${g.name} is out on loan.`;
  if(b.ents.includes(g.id))return _T`${g.name} is already entered here.`;
  const cur=any100Cur(w,g.id);if(cur&&cur.b.done)return _T`${g.name} already fought this week.`;
  const {o,gr}=any100Grade(g);
  if(any100Sp(b)&&b.any100.rx){const rx=b.any100.rx;
    if(rx.k==='hi'&&o<ANY100.hi)return _T`${g.name} is grade ${gr} (${o}) — ${E.n||''} takes B (70) and above.`;
    if(rx.k==='lo'&&o>ANY100.lo)return _T`${g.name} is grade ${gr} (${o}) — ${E.n||''} takes C (61) and below.`}
  if(!any100Sp(b)){const T=TIERS[b.tier];if(o<T.lo-6||o>T.hi+6)return _T`${g.name} (${o}) is outside this bout's ratings.`;if((b.wd||0)>=2)return _T('Closed to your house this week — two withdrawals.')}
  return ''}
/* the short reason in the picker's fit column (the full one shows on a click) */
function any100Short(w,b,g){const o=effOvr(g);if(g.inj)return _T('hurt');if(g.restWk===w.week)return _T('resting');if(typeof lentOut==='function'&&lentOut(g))return _T('on loan');
  if(b.ents.includes(g.id))return _T('entered here');const c=any100Cur(w,g.id);if(c&&c.b.done)return _T('fought');
  const rx=any100Sp(b)&&b.any100.rx;if(rx)return rx.k==='hi'?_T('below B'):_T('above C');if(!any100Sp(b)&&(b.wd||0)>=2)return _T('closed');return _T('out of band')}
const any100RxOK=(b,o)=>{const rx=b.any100&&b.any100.rx;return !rx||(rx.k==='hi'?o>=ANY100.hi:o<=ANY100.lo)};

/* ---------- seats ---------- */
function any100SideOf(b,gid){return (b.any100&&b.any100.side&&b.any100.side[gid])||null}
function any100Room(b,s){const cap=boutSize(b)/2;return cap-b.ents.filter(id=>any100SideOf(b,id)===s).length}
function any100Put(b,gid,side){if(any100Team(b)){const s=side&&any100Room(b,side)>0?side:any100Room(b,'A')>=any100Room(b,'B')?'A':'B';b.any100.side[gid]=s}b.ents.push(gid)}
function any100Order(b){if(!any100Team(b))return;const A=b.ents.filter(id=>any100SideOf(b,id)!=='B'),B=b.ents.filter(id=>any100SideOf(b,id)==='B');const out=[];
  for(let i=0;i<Math.max(A.length,B.length);i++){if(A[i])out.push(A[i]);if(B[i])out.push(B[i])}if(A.length===B.length)b.ents=out}
/* takes a fighter off whatever unfought bout holds him; after the full card the seat goes straight back to a free agent */
function any100Pull(w,gid){const n=w.night;for(let i=0;i<n.bouts.length;i++){const b=n.bouts[i];if(b.done)continue;const k=b.ents.indexOf(gid);if(k<0)continue;
    b.ents.splice(k,1);voidBets(b,gid);if(b.any100){delete b.any100.side[gid];delete b.any100.paid[gid]}
    if(n.any100&&n.any100.full){if(any100Sp(b))any100FillSp(w,b);else fillNight()}return i}return -1}
/* THE ONE ENTRY FUNCTION — the player and the rival houses both enter through it */
function any100Enter(w,bi,gid,o={}){const n=w.night,b=n.bouts[bi],g=gById(gid);if(!b||!g)return {ok:false,why:_T('No such bout.')};
  const why=any100Why(w,b,g);if(why)return {ok:false,why};const sp=any100Sp(b);const m=o.mgr||null;const fee=sp&&o.pay!==false?b.any100.fee:0;
  if(m&&fee&&m.coin<fee)return {ok:false,why:_T`The entry fee is ${fee} coin.`};
  const from=any100Cur(w,gid);if(from&&!o.move)return {ok:false,why:_T`${g.name} is already on the card.`};
  let out=null;const size=boutSize(b);
  if(b.ents.length>=size){const keep=sp?new Set([...Object.keys(b.any100.hire),...Object.keys(b.any100.ed)]):new Set();
    const pool=b.ents.map(gById).filter(x=>x&&!keep.has(x.id)&&(!o.side||!sp||any100SideOf(b,x.id)===o.side||!any100Team(b)));
    out=(pool.filter(x=>!x.contract).sort((x,y)=>effOvr(x)-effOvr(y))[0])||(!sp&&m?pool.filter(x=>x.contract&&x.contract.mgr===m.id).pop():null);
    if(!out)return {ok:false,why:_T('Every seat is taken.')}}
  let fi=-1;if(from)fi=any100Pull(w,gid);
  if(out){const k=b.ents.indexOf(out.id);if(k>=0){const s=any100SideOf(b,out.id);b.ents.splice(k,1);voidBets(b,out.id);if(sp){delete b.any100.side[out.id];if(!o.side&&s)o.side=s}}}
  if(sp)any100Put(b,gid,o.side);else b.ents.push(gid);
  if(sp&&m&&fee){m.coin-=fee;b.any100.paid[gid]=fee}
  if(fi>=0&&fi!==bi){n.any100=n.any100||{from:{}};n.any100.from[gid]=fi}
  if(sp&&n.any100&&n.any100.full)any100Order(b);
  return {ok:true,from:fi,out:out&&out.id}}

/* ---------- the week's specials ---------- */
function any100Hash(w,salt){return hashStr('any100:'+salt+':'+w.id+':'+w.week)}
function any100Make(w){const n=w&&w.night;if(!n||!n.bouts||w.tutorial||n.bye||n.rivalry||w.dead)return;if(n.bouts.some(b=>b.tier==='spc100'))return;
  if(w.closedBye&&w.closedBye.week===w.week)return;
  n.any100={from:{},full:false};const FX=n.fx||{};const main=n.bouts.find(b=>b.tier==='main');const list=[];
  const gate=main&&main.purse?main.purse/(TIERS.main.purse*(main.special&&FX.purse?FX.purse:1)):1;
  if(main&&!main.done&&main.special&&main.ev!=='triumviratus'&&EVENTS[main.ev]){list.push({ev:main.ev,src:'fx',k:ANY100.k.fx*(FX.purse||1.5)});n.any100.fx=main.ev;
    main.ev=TIERS.main.ev;main.special=false;main.purse=Math.max(10,Math.round(TIERS.main.purse*gate));
    while(main.ents.length>boutSize(main)){const out=main.ents.map(gById).filter(g=>g&&!(g.contract&&mgrById(g.contract.mgr)&&mgrById(g.contract.mgr).isPlayer)).pop();if(!out)break;main.ents.splice(main.ents.indexOf(out.id),1)}
    fillNight()}
  const pool=ANY100.pool.filter(k=>EVENTS[k]&&!list.some(x=>x.ev===k));const h=any100Hash(w,'ed');
  if(pool.length)list.push({ev:pool[h%pool.length],src:'ed',k:ANY100.k.ed});
  const hr=any100Hash(w,'rx');if(list.length&&hr%ANY100.every===0){const i=(hr>>>4)%list.length;list[i].rx={k:(hr>>>9)&1?'hi':'lo'}}
  for(const x of list){const sz=boutSize({ev:x.ev});const purse=Math.max(20,Math.round(TIERS.main.purse*gate*x.k*(x.rx&&x.rx.k==='lo'?ANY100.k.lo:1)));
    const fee=Math.max(4,Math.round(EVENTS[x.ev].teams===1?purse/(sz*2.5):purse/10));
    n.bouts.push({tier:'spc100',ev:x.ev,purse,special:true,fee:0,ents:[],done:false,res:null,bets:[],any100:{fee,src:x.src,rx:x.rx||null,side:{},paid:{},hire:{},ed:{}}})}
  any100Rivals(w,1)}
/* rival houses enter unused fighters (one per house per special), leaving `leave` seats open */
function any100Rivals(w,leave){const n=w.night;
  n.bouts.forEach((b,bi)=>{if(!any100Sp(b)||b.done)return;const size=boutSize(b);const tm=any100Team(b);const want=!leave?size:tm?size/2:size>=4?size-leave-(size>=6?1:0):0; /* a team event keeps one whole side open for a house and its partner */
    const houses=w.mgrs.filter(m=>!m.isPlayer&&!m.dead).sort(()=>Math.random()-.5);
    for(const m of houses){if(b.ents.length>=want)break;if(b.ents.some(id=>any100Own(id,m)))continue;if(m.coin<b.any100.fee+20)continue;
      if(Math.random()>0.55+((m.p&&m.p.risk)||50)/250)continue;const used=any100Used(w);
      const g=rosterOf(m).filter(g=>!used.has(g.id)&&g.morale>15&&!any100Why(w,b,g)).sort((x,y)=>effOvr(y)-effOvr(x))[0];if(g)any100Enter(w,bi,g.id,{mgr:m,side:tm?(['A','B'].filter(x=>any100Room(b,x)>0).sort((x,y)=>any100Room(b,x)-any100Room(b,y))[0]):null})}})}
function any100FillSp(w,b){const size=boutSize(b);const rx=b.any100.rx;const mid=rx?(rx.k==='hi'?80:52):72;let guard=0;
  while(b.ents.length<size&&guard++<20){const used=any100Used(w);
    const fa=freeAgents().filter(g=>!used.has(g.id)&&!g.inj&&any100RxOK(b,effOvr(g))).sort((x,y)=>Math.abs(effOvr(x)-mid)-Math.abs(effOvr(y)-mid)).slice(0,4);
    let g=fa.length?fa[Math.floor(Math.random()*fa.length)]:null;
    if(!g){g=genGlad({ovr:rx?(rx.k==='hi'?72+rnd(10):46+rnd(12)):60+rnd(20)});g.debut={s:w.season,wk:w.week};w.glads.push(g);if(!any100RxOK(b,effOvr(g)))g.ovr=rx.k==='hi'?Math.max(g.ovr,ANY100.hi+2):Math.min(g.ovr,ANY100.lo-2)}
    any100Put(b,g.id)}
  any100Order(b)}
/* THE FULL CARD: when you travel (or the week's first bout starts) every open seat of every bout and special is filled */
function any100FillAll(w){const n=w&&w.night;if(!n||!n.bouts||n.bye)return false;if(!n.bouts.some(any100Sp))return false;n.any100=n.any100||{from:{}};if(n.any100.full)return false;
  try{any100Rivals(w,0)}catch(e){console.error(e)}
  for(const b of n.bouts)if(any100Sp(b)&&!b.done)any100FillSp(w,b);
  fillNight();n.any100.full=true;
  try{tnews(_T`📋 The full card is set at ${LOCATIONS[n.loc].n}: every seat of every bout and headline special is taken.`)}catch(e){}
  return true}

/* ---------- the player's side ---------- */
function any100HireFee(g){return ANY100.hireBase+Math.round(effOvr(g)/8)}
function any100Partners(w,b,gid){const m=me();const used=any100Used(w);
  const mine=rosterOf(m).filter(g=>g.id!==gid&&!g.lanista&&!any100Why(w,b,g));
  const hire=freeAgents().filter(g=>!used.has(g.id)&&!g.inj&&any100RxOK(b,effOvr(g))).sort((x,y)=>effOvr(y)-effOvr(x)).slice(0,2);
  return {mine,hire}}
function any100EdPick(w,b,gid){const used=any100Used(w);const o=effOvr(gById(gid));
  return freeAgents().filter(g=>!used.has(g.id)&&!g.inj&&g.id!==gid&&any100RxOK(b,effOvr(g))).sort((x,y)=>Math.abs(effOvr(x)-o)-Math.abs(effOvr(y)-o))[0]||null}
/* what booking costs: entry fee per seat you fill (+ the hire) */
function any100Cost(b,pt){if(!any100Sp(b))return 0;const f=b.any100.fee;if(!pt)return f;if(pt.k==='mine')return f*2;if(pt.k==='hire'){const g=gById(pt.gid);return f*2+(g?any100HireFee(g):0)}return f}
function any100Book(bi,gid,pt){const w=W_(),m=me(),n=w.night,b=n.bouts[bi];const g=gById(gid);if(!b||!g)return {ok:false,why:_T('No such bout.')};
  if(!any100Sp(b))return any100Classic(bi,gid);
  const cost=any100Cost(b,pt);if(m.coin<cost)return {ok:false,why:_T`Entering costs ${cost} coin — the treasury holds ${m.coin}.`};
  const side=any100Team(b)?(any100Room(b,'A')>=any100Room(b,'B')?'A':'B'):null;
  const r=any100Enter(w,bi,gid,{mgr:m,move:true,side});if(!r.ok)return r;const s=any100SideOf(b,gid);
  let pg=null;
  if(any100Team(b)&&pt&&b.ents.length<boutSize(b)&&any100Room(b,s)>0){
    if(pt.k==='mine'){const r2=any100Enter(w,bi,pt.gid,{mgr:m,move:true,side:s});if(r2.ok)pg=gById(pt.gid)}
    else if(pt.k==='hire'){const h=gById(pt.gid);if(h&&any100Enter(w,bi,h.id,{pay:false,side:s}).ok){const c=any100HireFee(h);m.coin-=b.any100.fee+c;b.any100.paid[h.id]=b.any100.fee;b.any100.hire[h.id]={by:m.id,c};pg=h}}
    else if(pt.k==='ed'){const e=any100EdPick(w,b,gid);if(e&&any100Enter(w,bi,e.id,{pay:false,side:s}).ok){b.any100.ed[e.id]=m.id;pg=e}}}
  const E=EVENTS[b.ev]||{};
  tnews(_T`⭐ ${g.name}${pg?' & '+pg.name:''} entered in ${E.n||''} (headline special) — ${coinAmt87(cost)} entry.`);
  saveWorld();return {ok:true}}
function any100Classic(bi,gid){const w=W_(),m=me(),b=w.night.bouts[bi];if(typeof travelBlock==='function'&&travelBlock(_T('enter fighters')))return {ok:false,why:''};
  const mineIn=b.ents.find(id=>any100Own(id,m));
  if(mineIn&&mineIn!==gid&&!(w.night.any100&&w.night.any100.full)){b.ents.splice(b.ents.indexOf(mineIn),1);voidBets(b,mineIn)}
  const r=any100Enter(w,bi,gid,{mgr:m,move:true});if(r.ok)saveWorld();return r}
function any100Drop(bi){const w=W_(),m=me(),n=w.night,b=n.bouts[bi];if(!any100Sp(b)||b.done)return 0;const full=!!(n.any100&&n.any100.full);const A=b.any100;
  const out=b.ents.filter(id=>any100Own(id,m)||(A.hire[id]&&A.hire[id].by===m.id)||A.ed[id]===m.id);let back=0;
  for(const id of out){b.ents.splice(b.ents.indexOf(id),1);voidBets(b,id);if(!full){back+=(A.paid[id]||0)+(A.hire[id]?A.hire[id].c:0)}
    delete A.paid[id];delete A.hire[id];delete A.ed[id];delete A.side[id];
    const f=n.any100&&n.any100.from?n.any100.from[id]:null;if(f!=null){const fb=n.bouts[f];if(fb&&!fb.done&&fb.ents.length<boutSize(fb)&&!fb.ents.includes(id)&&!any100Cur(w,id)){if(any100Sp(fb))any100Put(fb,id);else fb.ents.push(id)}delete n.any100.from[id]}}
  m.coin+=back;if(full)any100FillSp(w,b);saveWorld();return back}

/* ---------- engine hooks ---------- */
{const base=makeNight;makeNight=function(){const r=base.apply(this,arguments);try{const w=W_();if(w&&!any100Off())any100Make(w)}catch(e){console.error(e)}return r}}
/* fillNight never fills a special (they fill at travel) — but their fighters count as used */
{const base=fillNight;fillNight=function(){const w=W_(),n=w&&w.night;const sp=n&&n.bouts?n.bouts.filter(b=>b.tier==='spc100'):[];if(!sp.length)return base.apply(this,arguments);
  const keep=n.bouts;n.bouts=keep.filter(b=>b.tier!=='spc100').concat([{tier:'under',ev:'',ents:[...sp.flatMap(b=>b.ents),'_a100','_b100','_c100','_d100']}]);
  try{return base.apply(this,arguments)}finally{n.bouts=keep}}}
{const base=travelClick;travelClick=function(a){const r=base.apply(this,arguments);try{const w=W_();if(w&&w.night&&typeof travelOK==='function'&&travelOK(w)&&any100FillAll(w))saveWorld()}catch(e){console.error(e)}return r}}
{const base=runBoutSim;runBoutSim=async function(){try{any100FillAll(W_())}catch(e){console.error(e)}return base.apply(this,arguments)}}
{const base=watchBout;watchBout=function(){try{any100FillAll(W_())}catch(e){console.error(e)}return base.apply(this,arguments)}}
{const base=boutCfg;boutCfg=function(b){try{const w=W_();if(any100Sp(b)&&w&&w.night&&w.night.bouts.includes(b)){any100FillAll(w);any100Order(b)}}catch(e){console.error(e)}return base.apply(this,arguments)}}
{const base=st95Fill;st95Fill=function(w){const n=w&&w.night;const hold=[];try{if(n&&n.bouts)for(const b of n.bouts)if(b.tier==='spc100'&&!b.done)for(const id of b.ents){const g=gById(id);if(g&&g.slot95){hold.push([g,g.slot95]);g.slot95=0}}}catch(e){}
  try{return base.apply(this,arguments)}finally{for(const [g,s] of hold)g.slot95=s}}}
{const base=boutSide;boutSide=function(b,i){if(any100Sp(b)&&any100Team(b)){const s=any100SideOf(b,b.ents[i]);if(s)return s==='B'?{k:'B',n:_T('Team B'),col:'#6fb0e6'}:{k:'A',n:_T('Team A'),col:'#e0a33a'}}return base.apply(this,arguments)}}
{const base=boutSidesHTML;boutSidesHTML=function(b){if(any100Sp(b)&&any100Team(b)){const nm=id=>{const g=gById(id);return g?esc(g.name):'?'};const A=b.ents.filter(id=>any100SideOf(b,id)!=='B'),B=b.ents.filter(id=>any100SideOf(b,id)==='B');
    return `<p class="sides"><span class="sidetag" style="--sc:#e0a33a">${_T`Team A`}</span> ${A.map(nm).join(' & ')||'—'} <i>${_T('versus')}</i> <span class="sidetag" style="--sc:#6fb0e6">${_T`Team B`}</span> ${B.map(nm).join(' & ')||'—'}</p>`}return base.apply(this,arguments)}}
/* sitting the week out (108) takes your fighters off every card: the specials refund their entry first (while refunds still apply) */
{const base=takeSbye76;takeSbye76=async function(){const w=W_();const r=await base.apply(this,arguments);
  try{const n=w&&w.night,m=me();if(n&&n.selfBye&&n.bouts){const full=!!(n.any100&&n.any100.full);let back=0;
    for(const b of n.bouts){if(!any100Sp(b)||b.done)continue;const A=b.any100;
      const ids=b.ents.filter(id=>any100Own(id,m)||A.ed[id]===m.id||(A.hire[id]&&A.hire[id].by===m.id));
      for(const id of Object.keys(A.paid))if(any100Own(id,m)||(A.hire[id]&&A.hire[id].by===m.id)){if(!full)back+=A.paid[id]+(A.hire[id]?A.hire[id].c:0);delete A.paid[id];delete A.hire[id]}
      for(const id of ids){delete A.ed[id];any100Pull(w,id)}
      if(full)any100FillSp(w,b)}
    if(back){m.coin+=back;saveWorld()}}}catch(e){console.error(e)}return r}}
/* team purses are shared by the winners; a hired partner's share comes home to the house that hired him */
{const base=applyBout;applyBout=function(bi,res){const w=W_();const b=w&&w.night&&w.night.bouts&&w.night.bouts[bi];if(!any100Sp(b)||b.done)return base.apply(this,arguments);
  const P=b.purse;let nw=1;try{nw=Math.max(1,(res&&res.winners||[]).length)}catch(e){}b.purse=Math.max(1,Math.round(P/nw));let r;
  try{r=base.apply(this,arguments)}finally{b.purse=P}
  try{const win=new Set((b.res&&b.res.winners)||[]);for(const [gid,h] of Object.entries(b.any100.hire||{})){if(!win.has(gid))continue;const hm=mgrById(h.by);if(!hm)continue;const cut=Math.round(P/nw*0.5);hm.coin+=cut;
      if(hm.isPlayer)tnews(_T`🤝 ${(gById(gid)||{}).name||''}, your hired partner, wins — his share comes home: ${coinAmt87('+'+cut)}.`)}}catch(e){console.error(e)}
  return r}}

/* ---------- the banner tracker: a ★ chip per special on its day (8a) ---------- */
{const base=boutTrack85;boutTrack85=function(){const h=base.apply(this,arguments);try{const w=W_(),n=w&&w.night;if(!h||!n||!n.bouts.some(any100Sp))return h;
    const T=document.createElement('template');T.innerHTML=h;
    for(const el of T.content.querySelectorAll('[data-bt85]')){const b=n.bouts[+el.dataset.bt85];if(!any100Sp(b))continue;el.classList.add('bt100s');
      const d=el.querySelector('.bt85d');if(d)d.textContent=_T('Sun ★');const nm=el.querySelector('b');if(nm)nm.textContent=(EVENTS[b.ev]||{}).n||'';el.title=_T`★ Headline special · ${(EVENTS[b.ev]||{}).n||''}`}
    return T.innerHTML}catch(e){console.error(e);return h}}}

/* ---------- the week's card + the special bout cards ---------- */
function any100Seats(b,mine){const size=boutSize(b);const face=id=>{const g=gById(id);if(!g)return '';const me1=mine.has(id);return `<span class="a1seat${me1?' you':''}" title="${esc(g.name)}${g.contract&&mgrById(g.contract.mgr)?' · '+esc(mgrById(g.contract.mgr).ludus):_T(' · free agent')}">${gArt(g,'xs')}</span>`};
  const open=k=>Array.from({length:Math.max(0,k)},()=>`<span class="a1seat open">${_T('open')}</span>`).join('');
  if(any100Sp(b)&&any100Team(b)){const cap=size/2;const A=b.ents.filter(id=>any100SideOf(b,id)!=='B'),B=b.ents.filter(id=>any100SideOf(b,id)==='B');
    return `<div class="a1seats">${A.map(face).join('')}${open(cap-A.length)}<span class="a1vs">${_T('vs')}</span>${B.map(face).join('')}${open(cap-B.length)}</div>`}
  return `<div class="a1seats">${b.ents.map(face).join('')}${open(size-b.ents.length)}</div>`}
function any100Chips(b){const E=EVENTS[b.ev]||{};const o=[];const sp=any100Sp(b);
  if(sp&&b.any100.rx)o.push(`<span class="a1rx">🛡 ${esc(any100RxTxt(b.any100.rx))}</span>`);
  if(any100Team(b))o.push(`<span class="a1c team">${_T('👥 Team event')}</span>`);else if(E.teams==='jugg')o.push(`<span class="a1c team">${_T('👑 One against the rest')}</span>`);
  if(typeof noCF96==='function'&&noCF96(b.ev))o.push(`<span class="a1c no">${_T('🌾 No CF')}</span>`);
  if(E.short)o.push(`<span class="a1c">${esc(E.short)}</span>`);
  return o.join('')}
function any100Row(w,b,i,mine){const n=w.night,m=me();const E=EVENTS[b.ev]||{};const sp=any100Sp(b);const size=boutSize(b);const opn=size-b.ents.length;
  const mineIn=b.ents.filter(id=>mine.has(id)||(sp&&((b.any100.hire[id]&&b.any100.hire[id].by===m.id)||b.any100.ed[id]===m.id)));const riv=b.ents.filter(id=>{const g=gById(id);return g&&g.contract&&!mine.has(id)}).length;
  const day=sp?_T('SUN'):[_T('FRI'),_T('SAT'),_T('SUN')][i]||'';
  const note=opn>0?_T`<b>${opn} open</b> · ${riv} rival${riv===1?'':'s'}`:_T`full · ${b.ents.length} of ${size}`;
  let act='';
  if(b.done){const wn=((b.res&&b.res.winners)||[]).map(gById).filter(Boolean);act=`<div class="a1done">${_T('✓ fought')}${wn.length?' · 🏆 '+wn.map(g=>esc(g.name)).join(' & '):''}</div>`}
  else if(mineIn.length){act=`<div class="a1ent">${mineIn.map(id=>{const g=gById(id);return `<span class="a1ef">${gArt(g,'xs')}<span><b>${esc(g.name)}</b><small>${mine.has(id)?_T('✓ entered'):b.any100.hire[id]?_T('hired partner'):_T("editor's pick")}</small></span></span>`}).join('')}${sp?`<button type="button" class="btn a1x" data-any100="drop|${i}" title="${_T('Withdraw')}">✕</button>`:''}</div>`}
  else{const fit=rosterOf(m).filter(g=>!any100Why(w,b,g));const closed=!sp&&(b.wd||0)>=2;
    act=closed?`<div class="a1note">${_T('🔒 closed to your house this week')}</div>`:`<button type="button" class="btn a1go" data-any100="pick|${i}">${_T('⚔ Enter a fighter ▾')}</button><div class="a1note">${sp&&b.any100.rx?(fit.length?_T`${fit.length} of yours qualif${fit.length===1?'ies':'y'}`:_T('none of yours qualifies')):sp&&any100Team(b)?_T('you fill one seat, then pick a partner'):fit.length?_T`${fit.length} of yours fit`:_T('none of yours fits')}</div>`}
  const fee=sp?`<div><span>${_T('Entry')}</span><b class="neg">−${b.any100.fee}${any100Team(b)?_T(' a seat'):''}</b></div>`:`<div><span>${_T('Fee')}</span><b class="plus">+${b.fee}</b></div>`;
  return `<div class="a1ev${sp?' spc':''}${mineIn.length?' mine':''}${b.done?' done':''}" data-a1i="${i}"><span class="a1day">${day}<small>${esc(any100Lbl(b,i))}</small></span><span class="a1art">${cardHTML('e:'+b.ev,'sm')}</span>
    <div class="a1tt"><span class="a1tier">${sp?_T('Special event'):esc(TIERS[b.tier].n)}</span><b class="a1nm">${esc(E.n||'')}</b><div class="a1chips">${any100Chips(b)}</div></div>
    <div class="a1st">${any100Seats(b,mine)}<div class="a1sn">${note}</div></div>
    <div class="a1mon"><div><span>${_T('Purse')}</span><b>${ICO.coin} ${b.purse}</b></div>${fee}</div><div class="a1act">${act}</div></div>`}
function any100PanelHTML(w){const n=w.night,m=me();const mine=new Set(rosterOf(m).map(g=>g.id));const L=LOCATIONS[n.loc]||{n:''};
  const all=n.bouts.map((b,i)=>[b,i]);const cls=all.filter(([b])=>!any100Sp(b)),spc=all.filter(([b])=>any100Sp(b));
  const ent=n.bouts.filter(b=>b.ents.some(id=>mine.has(id))).length;const full=!!(n.any100&&n.any100.full);
  return `<div class="any100wk" id="any100wk"><div class="a1hd"><b class="a1h">${_T`This week at ${esc(L.n)}`}</b><span class="a1k">${_T`Entered <b>${ent}</b> of ${n.bouts.length} events · one event per fighter`}</span></div>
    <div class="a1grp">${_T('Classic bouts')}</div>${cls.map(([b,i])=>any100Row(w,b,i,mine)).join('')}
    ${spc.length?`<div class="a1grp sp">${_T('★ Headline specials')}</div>${spc.map(([b,i])=>any100Row(w,b,i,mine)).join('')}`:''}
    <div class="a1ft"><span>${_T('⚔ <b>One event per fighter</b> a week')}</span><span>${_T('★ Specials take <b>any grade</b> unless badged · an entry fee per seat, refunded until you travel')}</span><span>${_T('Triumviratus is only ever an undercard')}</span><span>${full?_T('📋 The full card is set'):_T('Open seats go to rivals and free agents when you travel')}</span></div></div>`}
{const base=nightHTML;nightHTML=function(){const w=W_();const n=w&&w.night;const fx0=n&&n.any100&&n.any100.fx&&n.fx?n.fx:null;if(fx0)n.fx={...fx0,ev:TIERS.main.ev};let h;
  try{h=base.apply(this,arguments)}finally{if(fx0)n.fx=fx0}
  try{if(typeof h!=='string'||!n||n.bye||!n.bouts)return h;const has=n.bouts.some(any100Sp);if(!has&&any100Off())return h;
    const T=document.createElement('template');T.innerHTML=h;const cards=[...T.content.querySelectorAll('.card2.bout')];const m=me();
    cards.forEach((c,i)=>{const b=n.bouts[i];if(!any100Sp(b))return;c.classList.add('spc100');
      for(const x of c.querySelectorAll('[data-mg="enter"],[data-mg="withdraw"],select[id^="ent"]'))x.remove();
      const pu=c.querySelector('.bstat.purse');const fe=pu&&pu.nextElementSibling;if(fe)fe.innerHTML=`<i>${_T('Entry fee')}</i><b>−${b.any100.fee}${any100Team(b)?_T(' a seat'):''}</b>`;
      const tl=c.querySelector('.bouttitle');if(tl)tl.insertAdjacentHTML('beforeend',`<div class="a1chips">${any100Chips(b)}</div>`);
      const opn=boutSize(b)-b.ents.length;const tb=c.querySelector('table.tally');if(opn>0&&tb)tb.insertAdjacentHTML('afterend',`<p class="rc-sub a1open">${_T`${opn} open seat${opn===1?'':'s'} — rivals and free agents take them when you travel.`}</p>`);
      const acts=c.querySelector('.acts');const mineIn=b.ents.some(id=>any100Own(id,m));
      if(acts&&!b.done){acts.insertAdjacentHTML('afterbegin',mineIn?`<button type="button" class="btn" data-any100="drop|${i}">${_T`Withdraw<small>${n.any100&&n.any100.full?_T('no refund after the full card is set'):_T`the entry fee comes back`}</small>`}</button>`:`<button type="button" class="btn primary" data-any100="pick|${i}">${_T('⚔ Enter a fighter ▾')}<small>${_T`${b.any100.fee} coin a seat`}</small></button>`)}});
    const out=T.innerHTML;if(any100Off()||!cards.length)return out;
    const p=any100PanelHTML(w);const k=out.indexOf('<div class="card2 bout');return k>=0?out.slice(0,k)+p+out.slice(k):out+p}catch(e){console.error(e);return h}}}

/* ---------- the picker ---------- */
function any100Where(w,g){const c=any100Cur(w,g.id);if(!c)return _T('not entered yet');return _T`entered · ${any100Lbl(c.b,c.i)}`}
function any100PickHTML(){const P=ANY100.pk;const w=W_(),m=me();const n=w.night,b=n.bouts[P.bi];if(!b)return '';const E=EVENTS[b.ev]||{};const sp=any100Sp(b);const L=LOCATIONS[n.loc]||{n:''};
  const ros=rosterOf(m).filter(g=>g.alive&&!g.lanista);const st=ros.filter(g=>g.slot95).sort((a,c)=>a.slot95-c.slot95),be=ros.filter(g=>!g.slot95);
  const row=g=>{const why=any100Why(w,b,g);const {o,gr}=any100Grade(g);const sel=P.gid===g.id;const cur=any100Cur(w,g.id);
    const fit=why?`<span class="a1fit no">✗ ${esc(any100Short(w,b,g))}</span>`:`<span class="a1fit ok">✓ ${sp&&b.any100.rx?_T('qualifies'):_T('fits')}</span>`;
    return `<div class="a1fr${why?' no':''}${sel?' sel':''}" data-any100="sel|${g.id}">${gArt(g,'sm')}<span class="a1fn"><b>${esc(g.name)}</b>${g.slot95?`<em>${esc(any100Lbl(n.bouts[g.slot95-1]||{},g.slot95-1))}</em>`:`<em class="bn">${_T('Bench')}</em>`}<small>${esc((CLASSES[g.cls]||{}).name||g.cls)} · ${esc(any100Where(w,g))}</small></span>
      <span class="a1gd g${(gr||'?')[0]}"><i>${esc(gr)}</i><small>${o}</small></span>${typeof fatChip90==='function'?fatChip90(g):''}${fit}<button type="button" class="btn a1pb${sel?' on':''}" ${why?'aria-disabled="true"':''}>${sel?_T('✓ Picked'):cur?_T('Move here'):_T('Pick')}</button>
      ${why&&P.why===g.id?`<div class="a1why">⛔ ${esc(why)}</div>`:''}</div>`};
  let part='';
  if(sp&&any100Team(b)&&P.gid){const {mine,hire}=any100Partners(w,b,P.gid);const s=any100Room(b,'A')>=any100Room(b,'B')?'A':'B';const room=any100Room(b,s);
    if(room<2){const mate=b.ents.filter(id=>any100SideOf(b,id)===s).map(gById).filter(Boolean)[0];part=`<div class="a1part"><b>${_T('Partner')}</b><p class="rc-sub">${mate?_T`${mate.name} already holds the other seat of Team ${s}.`:_T('No second seat on this side.')}</p></div>`;P.pt=null}
    else{const ed=any100EdPick(w,b,P.gid);const k=P.pt?P.pt.k+'|'+(P.pt.gid||''):'';
      const opt=(key,html,right)=>`<label class="a1po${k===key?' on':''}" data-any100="pt|${key}"><input type="radio" name="a1pt" ${k===key?'checked':''}> ${html}<span class="a1pr">${right}</span></label>`;
      part=`<div class="a1part"><b>${_T`Partner for ${gById(P.gid).name} · Team ${s}`}</b>
        ${mine.slice(0,4).map(g=>opt('mine|'+g.id,`${gArt(g,'xs')} <b>${esc(g.name)}</b> <small>${_T`yours · ${any100Grade(g).gr} ${effOvr(g)}`}</small>`,_T`both seats pay you · −${b.any100.fee}`)).join('')}
        ${hire.map(g=>opt('hire|'+g.id,`${gArt(g,'xs')} <b>${esc(g.name)}</b> <small>${_T`free agent · ${any100Grade(g).gr} ${effOvr(g)}`}</small>`,_T`hire ${coinAmt87(any100HireFee(g))} + −${b.any100.fee}`)).join('')}
        ${ed?opt('ed|',`🎲 <b>${_T("The editor pairs him")}</b> <small>${_T('a free agent, free')}</small>`,_T("partner's share leaves the house")):''}</div>`}}
  const g=P.gid&&gById(P.gid);const cur=g&&any100Cur(w,g.id);
  const sum=!g?_T('Pick a fighter.'):`${cur&&cur.i!==P.bi?_T`${g.name} leaves ${any100Lbl(cur.b,cur.i)} open.`:''} ${sp?_T`Entry ${coinAmt87(any100Cost(b,P.pt))} · treasury ${coinAmt87(m.coin)}.`:''}`;
  const what=sp&&b.any100.rx?`<div class="a1what rx">🛡 <b>${esc(any100RxTxt(b.any100.rx))}</b> ${b.any100.rx.k==='hi'?_T('(rating 70+) — the editor wants a show of champions.'):_T('(rating 61 and under) — a rookie bout.')}</div>`:sp&&any100Team(b)?`<div class="a1what">${_T('👥 <b>Team event.</b> Your fighter takes one seat of a team; pick his partner below — another of yours, a free agent hired for the bout, or the editor’s pick.')}</div>`:'';
  const btn=g?(any100Team(b)&&P.pt&&P.pt.gid?_T`⚔ Enter ${g.name} + ${(gById(P.pt.gid)||{}).name||''}`:cur&&cur.i!==P.bi?_T`⚔ Move ${g.name} to ${E.n||''}`:_T`⚔ Enter ${g.name}`):_T('⚔ Enter');
  return `<div class="any100pk" role="dialog" aria-modal="true" aria-label="${esc(_T`Enter ${E.n||''}`)}"><div class="a1pkhd">${cardHTML('e:'+b.ev,'sm')}<div><b class="a1h">${_T`Enter ${E.n||''}`}</b><div class="rc-sub">${esc(BOUT_DAY[b.tier]||'')} · ${esc(L.n)} · ${_T`purse ${coinAmt87(b.purse)}`}${sp?_T` · entry ${b.any100.fee}${any100Team(b)?_T(' a seat'):''}`:''}</div></div><button type="button" class="btn a1x" data-any100="x" aria-label="${_T('Close')}">✕</button></div>
    ${what}<div class="a1pkb"><div class="a1pg">${_T('Starters')}</div>${st.map(row).join('')||`<p class="rc-sub">${_T('No starters.')}</p>`}${be.length?`<div class="a1pg">${_T('Bench')}</div>${be.map(row).join('')}`:''}${part}</div>
    <div class="a1pkf"><span class="a1sum">${sum}</span><button type="button" class="btn" data-any100="x">${_T('Cancel')}</button><button type="button" class="btn primary a1ok" data-any100="ok" ${g?'':'disabled'}>${esc(btn)}</button></div></div>`}
function any100PickDraw(){let bg=document.getElementById('any100pk');if(!ANY100.pk){if(bg)bg.remove();return}
  if(!bg){bg=document.createElement('div');bg.id='any100pk';bg.className='any100bg';document.body.appendChild(bg)}
  const sc=bg.querySelector('.a1pkb');const top=sc?sc.scrollTop:0;bg.innerHTML=any100PickHTML();const sc2=bg.querySelector('.a1pkb');if(sc2)sc2.scrollTop=top}
function any100Open(bi){const w=W_();const b=w&&w.night&&w.night.bouts[bi];if(!b||b.done)return;ANY100.pk={bi,gid:null,pt:null,why:null};
  const m=me();const fit=rosterOf(m).filter(g=>!g.lanista&&!any100Why(w,b,g)).sort((a,c)=>(any100Cur(w,a.id)?1:0)-(any100Cur(w,c.id)?1:0)||effOvr(c)-effOvr(a));if(fit[0])ANY100.pk.gid=fit[0].id;any100PtDefault();any100PickDraw();
  setTimeout(()=>{const x=document.querySelector('#any100pk .a1ok');if(x)x.focus()},30)}
function any100PtDefault(){const P=ANY100.pk;if(!P)return;const w=W_();const b=w.night.bouts[P.bi];P.pt=null;if(!P.gid||!any100Sp(b)||!any100Team(b))return;const {mine}=any100Partners(w,b,P.gid);
  P.pt=mine[0]?{k:'mine',gid:mine[0].id}:{k:'ed'}}
function any100Close(){ANY100.pk=null;any100PickDraw()}
function any100Redraw(){try{if(typeof MGR_REDRAW==='function')MGR_REDRAW()}catch(e){console.error(e)}}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&ANY100.pk){e.stopPropagation();e.preventDefault();any100Close()}},true);
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;
  if(ANY100.pk&&t.id==='any100pk'){any100Close();return}
  const el=t.closest('[data-any100]');if(!el)return;e.stopPropagation();e.preventDefault();const [a,v,v2]=el.dataset.any100.split('|');const w=W_();if(!w||!w.night)return;
  try{
    if(a==='pick'){any100Open(+v);return}
    if(a==='x'){any100Close();return}
    if(a==='drop'){const bi=+v;const full=!!(w.night.any100&&w.night.any100.full);if(!el.dataset.armed&&full){el.dataset.armed='1';el.title=_T('Click again: no refund after the full card is set.');if(typeof mToast==='function')mToast(_T('No refund now — the full card is set. Click ✕ again to withdraw anyway.'));return}
      const back=any100Drop(bi);if(typeof mToast==='function')mToast(back?_T`↩ Withdrawn — ${coinAmt87(back)} entry refunded.`:_T('↩ Withdrawn.'));any100Redraw();return}
    const P=ANY100.pk;if(!P)return;const b=w.night.bouts[P.bi];
    if(a==='sel'){const g=gById(v);const why=g&&any100Why(w,b,g);if(why){P.why=P.why===v?null:v;any100PickDraw();return}P.gid=v;P.why=null;any100PtDefault();any100PickDraw();return}
    if(a==='pt'){P.pt=v==='ed'?{k:'ed'}:{k:v,gid:v2};any100PickDraw();return}
    if(a==='ok'){if(!P.gid)return;const r=any100Book(P.bi,P.gid,P.pt);if(!r.ok){if(r.why&&typeof mToast==='function')mToast('⛔ '+r.why);if(r.why)return}any100Close();any100Redraw();return}
  }catch(err){console.error(err);if(typeof mToast==='function'&&typeof errText92==='function')mToast(errText92(err,_T('Something went wrong.')))}},true);

{const st=document.createElement('style');st.textContent=`
.any100wk{border:1px solid #6b5236;border-radius:8px;background:linear-gradient(#241a12,#1d150f);overflow:hidden;margin:0 0 12px}
.any100wk .a1hd{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:9px 14px;border-bottom:1px solid var(--line2,#4a3826);background:#160f0b}
.any100wk .a1h{font:400 19px var(--display,serif);color:var(--gold2)}
.any100wk .a1k{margin-left:auto;font-size:13px;color:var(--dim)}.any100wk .a1k b{color:var(--bone,#efe3cc)}
.any100wk .a1grp{padding:5px 14px;font:500 10.5px var(--mono,monospace);letter-spacing:.16em;text-transform:uppercase;color:var(--dim);background:#1a120d;border-top:1px solid #4a3826}
.any100wk .a1grp.sp{color:#e4b9f5;background:linear-gradient(90deg,#2b1830,#1a120d 60%)}
.a1ev{display:grid;grid-template-columns:52px 46px minmax(170px,1fr) minmax(150px,214px) 104px minmax(150px,210px);gap:12px;align-items:center;padding:8px 14px;border-top:1px solid #ffffff0c}
.a1ev.mine{background:linear-gradient(90deg,#3a2a1640,transparent 70%)}.a1ev.spc{background:linear-gradient(90deg,#3a1f3c40,transparent 70%)}.a1ev.done{opacity:.72}
.a1day{text-align:center;font:600 12px var(--mono,monospace);color:var(--gold2);border:1px solid #6b5236;border-radius:5px;padding:4px 0;background:#21180f;line-height:1.25}
.a1day small{display:block;font:400 10px var(--mono,monospace);color:var(--dim)}
.a1art{width:46px;height:52px;overflow:hidden;border-radius:4px;display:block}.a1art>*{width:46px!important;max-width:46px;height:auto;margin:0!important}
.a1tt{min-width:0}.a1tier{display:block;font:500 10.5px var(--mono,monospace);letter-spacing:.12em;text-transform:uppercase;color:var(--dim)}
.a1nm{display:block;font:400 17px/1.15 var(--display,serif);color:var(--bone,#efe3cc);margin:1px 0 3px}
.a1chips{display:flex;flex-wrap:wrap;gap:4px;margin-top:2px}
.a1c{font-size:11.5px;padding:0 7px;border-radius:9px;border:1px solid #5a4430;color:#d8c4a2;background:#2a1f17;white-space:nowrap}
.a1c.no{border-color:#8a5a3a;color:#f0b48a}.a1c.team{border-color:#4f7aa8;color:#a9cdf2;background:#17222f}
.a1rx{display:inline-flex;font:600 11.5px var(--body,sans-serif);padding:1px 8px;border-radius:4px;color:#2a1405;background:linear-gradient(#f3d58b,#c79a3c);border:1px solid #f6e2a8;white-space:nowrap}
.a1seats{display:flex;gap:4px;align-items:center;flex-wrap:wrap}
.a1seat{width:34px;height:40px;border-radius:5px;border:1px solid #4a3826;background:#160f0b;overflow:hidden;display:grid;place-items:center;flex:none}
.a1seat>*{max-width:100%;max-height:100%}.a1seat.you{border:2px solid var(--gold);box-shadow:0 0 6px #d6ab4c66}
.a1seat.open{border:1.5px dashed #8a7050;color:#a3907a;font:10px var(--mono,monospace)}
.a1vs{font:11px var(--mono,monospace);color:var(--dim);margin:0 2px}.a1sn{font:11.5px var(--mono,monospace);color:var(--dim);margin-top:3px}.a1sn b{color:#9fd47a;font-weight:500}
.a1mon{font-size:13px;line-height:1.5}.a1mon div{display:flex;justify-content:space-between;gap:6px}.a1mon span{color:var(--dim)}
.a1mon b{font:600 13.5px var(--mono,monospace);color:var(--gold2)}.a1mon b.plus{color:#bfe39e}.a1mon b.neg{color:#f0b48a}
.a1act{display:flex;flex-direction:column;gap:4px;min-width:0}.a1act .a1go{border-color:var(--gold);color:var(--gold2)}
.a1note{font-size:12px;color:var(--dim);text-align:center}.a1done{font-size:12.5px;color:var(--dim)}
.a1ent{display:flex;align-items:center;gap:6px;border:1px solid #6f8f45;background:#1f2a14;border-radius:5px;padding:4px 6px;flex-wrap:wrap}
.a1ef{display:flex;align-items:center;gap:6px;min-width:0}.a1ef b{color:#cfeab0;font-weight:600;font-size:13px}.a1ef small{display:block;color:#9cb889;font-size:11.5px}
.a1x{width:26px;height:26px;padding:0;margin-left:auto;font-size:13px}
.any100wk .a1ft{display:flex;flex-wrap:wrap;gap:4px 16px;padding:8px 14px;border-top:1px solid #4a3826;background:#160f0b;font-size:12.5px;color:var(--dim)}.any100wk .a1ft b{color:var(--bone,#efe3cc);font-weight:500}
.card2.bout.spc100{border-color:#7a4f8a}.card2.bout.spc100 .a1chips{margin-top:4px}.a1open{margin:4px 0 0}
.roomstat.bt85w .bt85.bt100s{border-color:#b98ad0!important}.roomstat.bt85w .bt85.bt100s .bt85d{color:#e4b9f5}
.any100bg{position:fixed;inset:0;z-index:9000;background:#000a;display:flex;align-items:center;justify-content:center;padding:16px}
.any100pk{width:min(820px,100%);max-height:calc(100vh - 32px);display:flex;flex-direction:column;background:linear-gradient(#251b13,#1c140e);border:1px solid #8a6a3a;border-radius:9px;box-shadow:0 16px 50px #000c;color:var(--bone,#efe3cc)}
.a1pkhd{display:flex;gap:12px;align-items:center;padding:10px 14px;border-bottom:1px solid #4a3826}.a1pkhd>.card,.a1pkhd>:first-child{width:52px;flex:none}.a1pkhd .a1x{align-self:flex-start}
.a1what{margin:10px 14px 2px;border:1px solid #4f7aa8;background:#141d28;border-radius:6px;padding:8px 11px;font-size:13.5px;color:#cfe0f2}.a1what.rx{border-color:#c79a3c;background:#2a1f10;color:#f0dfb5}
.a1pkb{overflow:auto;padding:0 14px 8px;min-height:0}
.a1pg{padding:9px 0 3px;font:500 10.5px var(--mono,monospace);letter-spacing:.16em;text-transform:uppercase;color:var(--dim)}
.a1fr{display:grid;grid-template-columns:44px minmax(130px,1fr) 70px 78px minmax(90px,130px) 104px;gap:10px;align-items:center;padding:6px 8px;border-top:1px solid #ffffff0c;border-radius:5px;cursor:pointer}
.a1fr.sel{background:#2a3a1c;outline:1px solid #6f8f45}.a1fr.no{opacity:.55}.a1fr.no:has(.a1why){opacity:1;background:#3a1a16;outline:1px solid #8a3a30}
.a1fr>.portrait,.a1fr>:first-child{width:44px!important;height:44px!important;overflow:hidden;border-radius:5px}.a1fr>:first-child img,.a1fr>:first-child svg{width:44px!important;height:auto!important}.a1fn{min-width:0}.a1fn b{font-size:14.5px}.a1fn em{font-style:normal;font:10.5px var(--mono,monospace);color:#1a1008;background:var(--gold);border-radius:3px;padding:0 5px;margin-left:5px}.a1fn em.bn{background:#4a3826;color:#d8c4a2}
.a1fn small{display:block;font-size:12px;color:var(--dim)}
.a1gd{display:inline-flex;align-items:baseline;gap:4px;font:700 14px var(--mono,monospace)}.a1gd i{font-style:normal;min-width:28px;text-align:center;padding:1px 4px;border-radius:4px;background:#b9c9d6;color:#14202a}
.a1gd.gA i{background:#e8c55e;color:#2a1a04}.a1gd.gC i,.a1gd.gD i,.a1gd.gF i{background:#c08a5a;color:#24140a}.a1gd small{font:400 12px var(--mono,monospace);color:var(--dim)}
.a1fit{font-size:12px;color:var(--dim)}.a1fit.ok{color:#9fd47a}.a1fit.no{color:#f09a88}
.a1pb.on{border-color:#9fd47a;color:#cfeab0}.a1fr.no .a1pb{opacity:.5}
.a1why{grid-column:1/-1;font-size:12.5px;color:#f6c2b6}
.a1part{margin:10px 0 2px;border:1px solid #4a3826;border-radius:6px;padding:8px 10px}.a1part>b{color:var(--gold2);font:400 15px var(--display,serif)}
.a1po{display:flex;align-items:center;gap:8px;padding:5px 2px;font-size:13px;cursor:pointer;flex-wrap:wrap}.a1po small{color:var(--dim)}.a1po .a1pr{margin-left:auto;color:var(--dim);font-size:12px}
.a1po.on{color:var(--gold2)}.a1po .portrait,.a1po>span:first-of-type{flex:none}
.a1pkf{display:flex;align-items:center;gap:8px;padding:9px 14px;border-top:1px solid #4a3826;flex-wrap:wrap}.a1sum{flex:1;min-width:160px;font-size:13px;color:var(--dim)}
@media (max-width:900px){.a1ev{grid-template-columns:46px 1fr;grid-auto-rows:auto}.a1ev .a1art{display:none}.a1ev .a1tt{grid-column:2}.a1ev .a1st,.a1ev .a1mon,.a1ev .a1act{grid-column:1/-1}
  .a1mon{display:flex;gap:14px}.a1fr{grid-template-columns:40px 1fr auto;row-gap:4px}.a1fr .fb90,.a1fr .a1fit{grid-column:2}.a1fr .a1pb{grid-column:3;grid-row:1}.a1fr .a1gd{grid-column:3;grid-row:2}}
@media (max-width:600px){.any100bg{padding:0;align-items:flex-end}.any100pk{max-height:92vh;border-radius:12px 12px 0 0}.any100wk .a1k{margin-left:0}}
`;document.head.appendChild(st)}
