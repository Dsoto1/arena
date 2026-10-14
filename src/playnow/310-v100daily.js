/* 310-v100daily — v1.0 DAILY + WEEKLY CHALLENGES (OFFLINE; his pick, backlog "v1.0 EXTRAS" item 4). No online, no server.
   TODAY'S CHALLENGE (UTC day) and THIS WEEK'S CHALLENGE (ISO week, UTC) are built by dc100Spec(kind,key) from a hash of the key ONLY
   (FNV-1a → its own mulberry32, never the dice RNG): event + city + your class + the CPU line-up (classes, minds, ratings) + the
   twist(s) + the event's dice SEED. Same day → the same challenge and the same dice for every player.
   SAME DICE EVERYWHERE: a challenge plays under the printed 'classic' roster (no creations in the market/deck), Flavius presides
   (no city editor), the stands hold strangers only (no regulars from this browser, no off-duty Manager gladiators), the seed-opening
   memory is skipped, every seat carries fixed ratings (seat.stats) — the browser's own saves never shift a die.
   TWISTS (DC100_TW; light hooks, all guarded by S.daily100 — normal play never sees them):
     nomarket  Closed market — nobody may open the market (openMarket / cpuMarket refuse).
     pauper    Empty purse — you start with 0 coin (giveLoadout wrapper).
     bare      Bare skin — you start without armor (giveLoadout wrapper, stripLoc).
     wild      Hungry beasts — every beast on the sand starts hunting you (newState wrapper sets their aggro).
     noheal    No physician — you cannot use Health Elixirs (useItem wrapper; cards and offerings).
     cf20      Crowd pleaser — a win counts only with 20+ CF (scoring).
     mandata   Flavius's orders — Mandata Flavi in play (opts.mandata).
     mods      City customs — the city's class modifiers apply (opts.mods; only a city that has them).
   Daily = 1 twist, CPUs Apprentice–Veteran; weekly = 2 twists (1 in a solo event), CPUs Veteran/Master, a harder event pool.
   SCORE (dc100Score): 100 for a win (cf20: only with 20+ CF) + 3 × final CF + 60 × rounds completed / rounds + coin held (≤ 30)
     + 15 a gladiator slain + 5 a beast slain + a win's pace bonus max(0, 40 − 2 × rotations). Medals: bronze 100 · silver 250 · gold 400.
   ATTEMPTS: daily — unlimited, only the FIRST counts (started = counted; leaving it unfinished = no medal); later ones are practice.
     Weekly — 3 attempts, the best counts. Counted at the start (S.daily100.att), scored at the results window.
   STORE: localStorage flavius_daily100 {v:1,d:{'YYYY-MM-DD':{n,a:{att:{s,m,won,f,at}}}},w:{'YYYY-Www':{…}}} (flavius_* keys ride in every
     backup — 12-settings snapshotAll); entries older than 60 days pruned. Streak = consecutive days with a finished first attempt
     (today may still be open). Calendar = the last 14 days with their medals.
   UI: Play Now submenu "📅 Challenges" (modal wrapper like 247's), a slim strip on the Play Now page (setupBody wrapper, before the event
     panel), the window dc100Open (in SCREEN_OPENERS terms: it registers its own screenIntent), the results window gets a
     "Your challenge" card + "📅 Challenges" (no Replay). BUS 'challenge.done' {kind,day,score,medal,counted,att} for the Tituli.
   MEDALS ONLY (his 2a): a challenge writes no Annals, achievements, Hall, trophies, crowd memory, Ludus, wagers, autosave, missio or
     editor unlocks — the record functions 119 guards online + its offline collections, while it plays and 2 min after (dc100NoRec).
   Kill switch localStorage flavius_daily100off=1 (no button, no strip, no window). Test tv100dc; shots tools/plans/daily100/. */
const DC100={off:false,t:null,starting:null,K:'flavius_daily100',open:false};
try{DC100.off=localStorage.getItem('flavius_daily100off')==='1'}catch(e){}
const DC100_MED=[[400,'gold'],[250,'silver'],[100,'bronze']]; /* TWEAK: 48 sims (a Fighter CPU in your seat) — wins 300–550, losses ~30–230 → bronze ≈ the better half, silver ≈ a win, gold ≈ half the wins */
const DC100_PRINTED=['soldier','royalty','hero','slave','veteranus','amazonia','venatore','damnatio'];
const DC100_EVD=['democritus','democritus','egidious','egidious','cassian','cassian','triumviratus','orpheus','ludus'];
const DC100_EVW=['gauntlet','commodus','democritus','egidious','cassian','triumviratus'];
const DC100_MINDD=['apprentice','fighter','fighter','veteran'];
const DC100_MINDW=['veteran','master','master'];
const DC100_TW={
  nomarket:{ic:'⚖',n:()=>_T('Closed market'),d:()=>_T('Nobody may open the market.'),ok:()=>true},
  pauper:{ic:'🪙',n:()=>_T('Empty purse'),d:()=>_T('You start with 0 coin.'),ok:()=>true},
  bare:{ic:'🛡',n:()=>_T('Bare skin'),d:()=>_T('You start without armor.'),ok:(E)=>!E.draft&&E.kind!=='orpheus'&&E.kind!=='eagle'},
  wild:{ic:'🐾',n:()=>_T('Hungry beasts'),d:()=>_T('Every beast on the sand hunts you from the start.'),ok:(E,k)=>!E.custom&&k!=='commodus'},
  noheal:{ic:'⚕',n:()=>_T('No physician'),d:()=>_T('You cannot use Health Elixirs.'),ok:()=>true},
  cf20:{ic:'🌾',n:()=>_T('Crowd pleaser'),d:()=>_T('A win counts only with 20+ CF.'),ok:(E)=>Array.isArray(E.rounds)&&E.rounds.some(r=>r.cf)},
  mandata:{ic:'📜',n:()=>_T("Flavius's orders"),d:()=>_T('Mandata Flavi are in play.'),ok:(E)=>!!E.mandata},
  mods:{ic:'🏛',n:()=>_T('City customs'),d:()=>_T("The city's class modifiers apply."),ok:(E,k,loc)=>!E.draft&&E.kind!=='orpheus'&&E.kind!=='eagle'&&!!(LOCATIONS[loc]&&(LOCATIONS[loc].good||LOCATIONS[loc].bad))}};

/* ---- keys + the hash (never the dice) ---- */
function dc100Fnv(s){let h=0x811c9dc5;s=String(s);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return h>>>0}
function dc100Rng(s){const g=mulberry32(dc100Fnv(s));return ()=>g.next()}
function dc100Now(){return DC100.t!=null?DC100.t:Date.now()}
function dc100Day(t){const d=new Date(t!=null?t:dc100Now());return d.toISOString().slice(0,10)}
function dc100Week(t){const d=new Date(t!=null?t:dc100Now());const u=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()));const dn=u.getUTCDay()||7;u.setUTCDate(u.getUTCDate()+4-dn);
  const y0=new Date(Date.UTC(u.getUTCFullYear(),0,1));const wk=Math.ceil(((u-y0)/86400000+1)/7);return `${u.getUTCFullYear()}-W${String(wk).padStart(2,'0')}`}
function dc100Key(kind,t){return kind==='w'?dc100Week(t):dc100Day(t)}

/* ---- the spec: everything a challenge is, from its key alone ---- */
function dc100Spec(kind,key){key=key||dc100Key(kind);const r=dc100Rng(`flavius-dc100|${kind}|${key}`);const pick=a=>a[Math.floor(r()*a.length)];
  const pool=(kind==='w'?DC100_EVW:DC100_EVD).filter(k=>EVENTS[k]&&!EVENTS[k].custom);const ev=pick(pool.length?pool:['democritus']);const E=EVENTS[ev];
  const locs=[];for(let i=1;i<LOCATIONS.length;i++)if(LOCATIONS[i])locs.push(i);const loc=pick(locs);
  const n=Math.max(E.min||1,Math.min(E.max||4,kind==='w'&&ev==='commodus'?1:4));
  const cls=DC100_PRINTED.filter(k=>CLASSES[k]).slice();for(let i=cls.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[cls[i],cls[j]]=[cls[j],cls[i]]}
  const seats=[];for(let i=0;i<n;i++){const c=cls[i%cls.length];const cpu=i>0;const diff=cpu?pick(kind==='w'?DC100_MINDW:DC100_MINDD):'normal';
    const rs=dc100Rng(`flavius-dc100-st|${kind}|${key}|${i}`);const st=typeof rollStats==='function'?rollStats(typeof leanOf==='function'?leanOf(c):[],kind==='w'&&cpu?76:70,rs):null;
    if(st&&cpu&&typeof INT_FOR_DIFF!=='undefined'&&INT_FOR_DIFF[diff])st.int=INT_FOR_DIFF[diff];
    seats.push({cls:c,cpu,diff,stats:st,team:E.coop?'A':undefined})}
  const cand=Object.keys(DC100_TW).filter(k=>{try{return DC100_TW[k].ok(E,ev,loc)}catch(e){return false}});const tw=[];
  const want=kind==='w'?(n>1?2:1):1;while(tw.length<want&&cand.length){const i=Math.floor(r()*cand.length);tw.push(cand.splice(i,1)[0])}
  const seed=(dc100Fnv(`flavius-dc100-seed|${kind}|${key}`)%2147483646)+1;
  return {kind,key,ev,loc,n,seats,tw,seed,spect:8}}
const dc100Has=(t)=>{try{return !!(S&&S.daily100&&S.daily100.tw&&S.daily100.tw.includes(t))}catch(e){return false}};
const dc100Me=p=>{try{return !!(p&&S&&S.daily100&&p.id===S.daily100.human&&!p.cpu)}catch(e){return false}};

/* ---- the record (localStorage; backups carry it) ---- */
function dc100Load(){let o=null;try{o=JSON.parse(localStorage.getItem(DC100.K)||'null')}catch(e){}if(!o||typeof o!=='object')o={};if(!o.d||typeof o.d!=='object')o.d={};if(!o.w||typeof o.w!=='object')o.w={};o.v=1;return o}
function dc100Save(o){try{const lim=dc100Day(dc100Now()-60*86400000);for(const k of Object.keys(o.d))if(k<lim)delete o.d[k];
    const wl=dc100Week(dc100Now()-70*86400000);for(const k of Object.keys(o.w))if(k<wl)delete o.w[k];localStorage.setItem(DC100.K,JSON.stringify(o))}catch(e){}}
function dc100Rec(o,kind,key){const m=kind==='w'?o.w:o.d;if(!m[key])m[key]={n:0,a:{}};const R=m[key];if(!R.a||typeof R.a!=='object')R.a={};R.n=+R.n||0;return R}
function dc100Medal(s){for(const [v,m] of DC100_MED)if(s>=v)return m;return ''}
const DC100_MI={gold:'🥇',silver:'🥈',bronze:'🥉'};
function dc100MedalN(m){return m==='gold'?_T('gold'):m==='silver'?_T('silver'):m==='bronze'?_T('bronze'):_T('no medal')}
/* the result that counts: daily = attempt 1, weekly = the best of 3 */
function dc100Counted(kind,R){if(!R)return null;if(kind==='w'){let b=null;for(const k of Object.keys(R.a||{}))if(+k<=3){const x=R.a[k];if(x&&(!b||x.s>b.s))b=x}return b}return R.a&&R.a[1]||null}
function dc100Streak(o,t){o=o||dc100Load();let n=0;const day=86400000;const now=t!=null?t:dc100Now();
  for(let i=0;i<400;i++){const k=dc100Day(now-i*day);const R=o.d[k];const x=R&&R.a&&R.a[1];if(x){n++;continue}if(i===0)continue;break}return n}

/* ---- the score ---- */
function dc100Score(res,spec,info){info=info||{};const row=(res.rows||[]).find(x=>x.id===spec.human)||(res.rows||[]).find(x=>x.human);if(!row)return {s:0,m:'',won:false,parts:[]};
  const E=EVENTS[spec.ev]||{rounds:[1]};const tot=Math.max(1,(E.rounds||[]).length);const f=Math.round(+row.f||0);
  const done=row.alive?tot:Math.max(0,Math.min(tot,info.elimRi!=null?info.elimRi:0));
  const cfFail=(spec.tw||[]).includes('cf20')&&row.won&&f<20;const won=!!row.won&&!cfFail;
  const parts=[[_T('Victory'),won?100:0],[_T('Crowd Favor ×3'),3*Math.max(0,f)],[_T`Rounds ${done}/${tot}`,Math.round(60*done/tot)],[_T('Coin held'),Math.min(30,Math.max(0,+row.coin||0))],
    [_T('Gladiators slain ×15'),15*(+row.kp||0)],[_T('Beasts slain ×5'),5*(+row.kn||0)],[_T('Pace'),won?Math.max(0,40-2*(+res.rotations||0)):0]];
  const s=parts.reduce((a,p)=>a+p[1],0);return {s,m:dc100Medal(s),won,f,cfFail,parts}}

/* ---- starting a challenge ---- */
function dc100Config(spec,att){const tw=spec.tw||[];
  return {ev:spec.ev,loc:spec.loc,seats:spec.seats.map(s=>{const o={cls:s.cls,cpu:!!s.cpu,diff:s.diff,stats:s.stats?{...s.stats}:undefined};if(s.team)o.team=s.team;if(s.cpu)o.name=(CLASSES[s.cls]||{}).hero;return o}),
    opts:{mods:tw.includes('mods'),mandata:tw.includes('mandata'),optOffers:false,eaglePot:false,carmina:false,spect:spec.spect},chPvp:true,seed:spec.seed,
    daily100:{kind:spec.kind,key:spec.key,att,tw:[...tw],human:0,ev:spec.ev,seed:spec.seed}}}
function dc100Left(kind,R){return kind==='w'?Math.max(0,3-(R?R.n:0)):Infinity}
function dc100Begin(spec){if(DC100.off)return false;const o=dc100Load();const R=dc100Rec(o,spec.kind,spec.key);
  if(spec.kind==='w'&&R.n>=3){if(typeof mToast==='function')mToast(_T('📅 No attempts left this week.'));return false}
  R.n++;const att=R.n;dc100Save(o);const cfg=dc100Config(spec,att);
  const keepR=typeof CFG!=='undefined'?CFG.roster:undefined;if(typeof CFG!=='undefined')CFG.roster='classic';DC100.starting=cfg;
  try{if(!HEADLESS){try{window.scrollTo(0,0);document.documentElement.scrollTop=0}catch(e){}}startEvent(cfg)}
  finally{DC100.starting=null;if(typeof CFG!=='undefined')CFG.roster=keepR}
  return true}
/* the rules hooks — each one is the old call unless a challenge is on the sand */
{const base=newState;newState=function(config){const r=base.apply(this,arguments);
  try{if(config&&config.daily100&&S){S.daily100={...config.daily100};S.dc100ri=null;S.sponsorId='flavius';
      if(S.daily100.tw.includes('wild')){const me=S.players[S.daily100.human];if(me)for(const n of S.npcs||[])if(n&&n.t!=='zora')n.aggro=me.id}}}catch(e){console.error(e)}return r}}
{const base=sponsorStart;sponsorStart=function(cfg){if(cfg&&cfg.daily100||DC100.starting){if(S)S.sponsorId='flavius';return}return base.apply(this,arguments)}}
{const base=seatSpectators;seatSpectators=function(n,cfg){if(!(cfg&&cfg.daily100)&&!DC100.starting)return base.apply(this,arguments);
  const keep=CROWD_CACHE;CROWD_CACHE=[];try{return base.apply(this,arguments)}finally{CROWD_CACHE=keep}}}
{const base=seatOffDuty;seatOffDuty=function(){if(DC100.starting||(S&&S.daily100&&S.phase==='setup'))return;return base.apply(this,arguments)}}
{const base=seedOpening;seedOpening=function(config){if(config&&config.daily100)return;return base.apply(this,arguments)}}
{const base=giveLoadout;giveLoadout=function(player){const r=base.apply(this,arguments);
  try{if(dc100Me(player)){if(dc100Has('pauper'))player.coin=0;if(dc100Has('bare'))for(const l of LOCS)stripLoc(player,l)}}catch(e){console.error(e)}return r}}
{const base=openMarket;openMarket=async function(player){if(dc100Has('nomarket')){if(!HEADLESS&&typeof mToast==='function')mToast(_T('⚖ The market is closed today.'));return}return base.apply(this,arguments)}}
{const base=cpuMarket;cpuMarket=async function(player){if(dc100Has('nomarket'))return;return base.apply(this,arguments)}}
{const base=useItem;useItem=async function(player,it){if(it&&dc100Me(player)&&dc100Has('noheal')&&((it.kind==='offer'&&(it.key==='elix2'||it.key==='elix4'))||(it.kind==='card'&&typeof isElixir==='function'&&isElixir(it.key)))){
    if(typeof mToast==='function')mToast(_T('⚕ No physician today: elixirs cannot be used.'));return false}return base.apply(this,arguments)}}
/* the empire's calendar does not move for a challenge */
{const base=careerHoldsClock;careerHoldsClock=async function(){try{if(S&&S.daily100)return true}catch(e){}return base.apply(this,arguments)}}
/* the round you fell in (rounds completed) */
try{BUS.on('elim',d=>{try{if(S&&S.daily100&&d&&d.victim&&!d.victim.npc&&d.victim.id===S.daily100.human&&S.dc100ri==null)S.dc100ri=S.ri}catch(e){}})}catch(e){}

/* ---- the result: filed once, shown in the results window ---- */
function dc100Finish(){if(!S||!S.daily100||!S.lastResult)return null;if(S.dc100res)return S.dc100res;const D=S.daily100;
  const sc=dc100Score(S.lastResult,D,{elimRi:S.dc100ri});const o=dc100Load();const R=dc100Rec(o,D.kind,D.key);
  if(!R.a[D.att])R.a[D.att]={s:sc.s,m:sc.m,won:sc.won,f:sc.f,at:Date.now()};if(R.n<D.att)R.n=D.att;dc100Save(o);
  const counted=D.kind==='w'?D.att<=3:D.att===1;S.dc100res={...sc,counted,att:D.att,kind:D.kind,key:D.key,best:dc100Counted(D.kind,R),left:dc100Left(D.kind,R),streak:dc100Streak(o)};
  try{BUS.emit('challenge.done',{kind:D.kind,day:D.key,score:sc.s,medal:sc.m,counted,att:D.att})}catch(e){}
  return S.dc100res}
function dc100ResHTML(x){const D=S.daily100;const daily=x.kind!=='w';
  const tag=daily?(x.counted?_T('First attempt · this one counts'):_T('Practice · your first attempt already counts')):_T`Attempt ${x.att} of 3 · the best counts`;
  const best=x.best?_T`Counted: <b>${x.best.s}</b> ${x.best.m?DC100_MI[x.best.m]:''}`:'';
  return `<section class="dc100res dc100parch" role="status"><div class="dc100rh"><span class="k">${daily?_T`📅 Today's challenge`:_T`🗓 This week's challenge`}</span><span class="sp"></span><span class="t">${tag}</span></div>
    <div class="dc100rb"><span class="dc100med ${x.m||'none'}" aria-label="${esc(dc100MedalN(x.m))}">${x.m?DC100_MI[x.m]:'—'}</span><span class="sc"><b>${x.s}</b><small>${esc(dc100MedalN(x.m))}</small></span>
    <span class="pt">${x.parts.filter(p=>p[1]).map(p=>`<span>${esc(p[0])} <b>+${p[1]}</b></span>`).join('')}${x.cfFail?`<span class="bad">${_T`🌾 Won with under 20 CF — no victory`}</span>`:''}</span></div>
    <div class="dc100rf">${best}${!daily?` · ${x.left===1?_T('1 attempt left'):_T`${x.left} attempts left`}`:''}${daily?` · ${_T`🔥 ${x.streak}-day streak`}`:''}</div></section>`}
{const base=modal;modal=function(title,body,buttons,opt){
  try{if(!DC100.off&&typeof S!=='undefined'&&S&&S.daily100&&S.over&&S.lastResult&&Array.isArray(buttons)&&buttons.some(b=>b&&b.value==='new')&&typeof body==='string'){
    const x=dc100Finish();if(x){body=dc100ResHTML(x)+body;buttons=buttons.filter(b=>!(b&&b.value==='replay'));
      if(!buttons.some(b=>b&&b.value==='dc100'))buttons.splice(Math.max(0,buttons.findIndex(b=>b&&b.value==='new')),0,{label:_T('📅 Challenges'),sub:_T('today and this week'),value:'dc100',primary:1});
      buttons=buttons.map(b=>b&&b.value==='new'?{...b,primary:0}:b);
      const p=base.call(this,title,body,buttons,opt);return p&&p.then?p.then(v=>{if(v==='dc100')setTimeout(()=>{try{if(typeof cleanFinishNow==='function')cleanFinishNow()}catch(e){}dc100Open()},0);return v}):p}}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}

/* ---- the window ---- */
function dc100When(kind,key){try{if(kind==='w')return key.replace('-W',' · '+_T('week')+' ');const d=new Date(key+'T12:00:00Z');return d.toLocaleDateString(undefined,{day:'numeric',month:'short',timeZone:'UTC'})}catch(e){return key}}
function dc100Card(kind){const key=dc100Key(kind);const sp=dc100Spec(kind,key);const E=EVENTS[sp.ev]||{};const L=LOCATIONS[sp.loc]||{};const o=dc100Load();const R=(kind==='w'?o.w:o.d)[key];
  const me=sp.seats[0];const C=c=>CLASSES[c]||{};const cnt=x=>x?x.s:'';
  const art=typeof cardRef==='function'&&cardRef('e:'+sp.ev)?`<span class="dc100art" style="${cardStyle('e:'+sp.ev)}"></span>`:`<span class="dc100art dc100noart">✦</span>`;
  const tw=sp.tw.map(k=>{const t=DC100_TW[k];return `<div class="dc100tw"><span class="ic" aria-hidden="true">${t.ic}</span><span><b>${esc(t.n())}</b><small>${esc(t.d())}</small></span></div>`}).join('');
  const foes=sp.seats.slice(1).map(s=>`<span class="dc100cl" style="--c:${C(s.cls).color||'#888'}">${esc(C(s.cls).name||s.cls)} <small>${esc((AI_TIERS.find(t=>t.k===s.diff)||{}).n||s.diff)}</small></span>`).join('');
  const first=R&&R.a&&R.a[1];const best=dc100Counted(kind,R);const left=dc100Left(kind,R);const started=R&&R.n>0;
  let st='',btn='';
  if(kind==='d'){st=first?`<span class="dc100st done">${first.m?DC100_MI[first.m]:'—'} <b>${first.s}</b> ${_T`counted`}</span>`:started?`<span class="dc100st bad">${_T`✕ left unfinished`}</span>`:`<span class="dc100st new">${_T`First attempt counts`}</span>`;
    btn=`<button type="button" class="sb100 ${started?'':'pri'} m" data-dc100go="d">${DC100_SW}<span class="t">${started?_T('Practice'):_T('Enter the arena')}</span></button>`}
  else{st=`<span class="dc100st ${best?'done':'new'}">${best?`${best.m?DC100_MI[best.m]:'—'} <b>${best.s}</b> · `:''}${_T`${left} of 3 left`}</span>`;
    btn=`<button type="button" class="sb100 ${left?'pri':''} m" data-dc100go="w" ${left?'':'disabled'}>${DC100_SW}<span class="t">${left?_T`Attempt ${4-left} of 3`:_T('No attempts left')}</span></button>`}
  return `<section class="dc100c dc100parch" data-dc100k="${kind}"><div class="dc100h"><span class="k">${kind==='w'?_T`🗓 This week`:_T`📅 Today`}</span><span class="dt">${esc(dc100When(kind,key))}</span><span class="sp"></span>${st}</div>
    <div class="dc100b">${art}<div class="dc100i"><b class="nm">${esc((E.n||sp.ev).replace(/^Classic · /,''))}</b><span class="lc">${_T`at`} <b>${esc(L.n||'?')}</b></span>${tw}
      <div class="dc100ln"><span class="dc100cl you" style="--c:${C(me.cls).color||'#c9a14a'}">${_T`You`}: <b>${esc(C(me.cls).name||me.cls)}</b></span>${foes?`<span class="vs">${_T`vs`}</span>${foes}`:''}</div>
      <small class="sd">${_T`🎲 Seed ${sp.seed} · the same dice for everyone`}</small></div></div>
    <div class="dc100f">${btn}</div></section>`}
function dc100CalHTML(){const o=dc100Load();const day=86400000;const now=dc100Now();let h='';
  for(let i=13;i>=0;i--){const k=dc100Day(now-i*day);const R=o.d[k];const x=R&&R.a&&R.a[1];const d=new Date(k+'T12:00:00Z').getUTCDate();
    h+=`<span class="dc100d${i===0?' today':''}${x?' '+(x.m||'none'):R&&R.n?' left':''}" title="${esc(k)}${x?' · '+x.s:''}"><small>${d}</small><b>${x?(x.m?DC100_MI[x.m]:'·'):R&&R.n?'✕':''}</b></span>`}
  const st=dc100Streak(o);
  return `<div class="dc100cal dc100parch"><div class="dc100calh"><b>${_T`🔥 ${st}-day streak`}</b>${st>=7?`<span class="dc100st done">${_T`A full week!`}</span>`:''}<span class="sp"></span><small>${_T`Last 14 days`}</small></div><div class="dc100days">${h}</div>
    <p class="dc100how">${_T`Score: win 100 · CF ×3 · rounds up to 60 · coin up to 30 · gladiator 15 · beast 5 · a quick win up to 40.`} <span>🥉 100 · 🥈 250 · 🥇 400</span></p></div>`}
function dc100HTML(){return `<div class="dc100" id="dc100w"><p class="dc100intro">${_T`One fixed challenge a day and a harder one a week — the same arena, gladiators and dice for every player.`}</p><div class="dc100cards">${dc100Card('d')}${dc100Card('w')}</div>${dc100CalHTML()}</div>`}
async function dc100Open(){if(DC100.off)return null;if(typeof modalBusy==='function'&&modalBusy()&&!DC100.open)return null;DC100.open=true;let v;
  try{v=await modal(_T('📅 Challenges'),dc100HTML(),[{label:_T('Back'),value:null}],{wide:1,close:null,onOpen:done=>{const mb=document.getElementById('mBody');if(!mb)return;
      mb.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-dc100go]');if(!b||b.disabled)return;done('go:'+b.dataset.dc100go)})}})}
  finally{DC100.open=false}
  if(typeof v==='string'&&v.startsWith('go:')){const kind=v.slice(3)==='w'?'w':'d';try{const m=document.getElementById('mainMenu');if(m&&!m.hidden&&typeof menuHide==='function')menuHide()}catch(e){}
    dc100Begin(dc100Spec(kind,dc100Key(kind)))}
  return v}
/* a window that ends in a window: register a screen intent like the other openers (79) */
{const base=dc100Open;dc100Open=function(){const end=typeof screenIntent==='function'?screenIntent('dc100Open'):()=>{};let r;try{r=base.apply(this,arguments)}catch(e){end();throw e}
  const up=()=>typeof screenWindowUp==='function'&&screenWindowUp();if(r&&typeof r.then==='function')r.then(()=>{if(!up())end()},()=>end());else setTimeout(()=>{if(!up())end()},0);return r}}
try{if(typeof SCREEN_OPENERS!=='undefined'&&!SCREEN_OPENERS.includes('dc100Open'))SCREEN_OPENERS.push('dc100Open')}catch(e){}

/* ---- the Play Now submenu button + the Play Now page strip ---- */
{const base=modal;modal=function(title,body,buttons,opt){
  try{if(!DC100.off&&title===_T('⚔️ Play now')&&Array.isArray(buttons)&&!buttons.some(b=>b&&b.value==='dc100')){
    const L=buttons.slice();const at=L.findIndex(b=>b&&b.value==='new');const sp=dc100Spec('d');const x=dc100Counted('d',dc100Load().d[sp.key]);
    L.splice(at<0?0:at+1,0,{label:_T('📅 Challenges'),sub:x?_T`today: ${x.m?DC100_MI[x.m]+' ':''}${x.s} · and this week's`:_T`today: ${((EVENTS[sp.ev]||{}).n||sp.ev).replace(/^Classic · /,'')} at ${(LOCATIONS[sp.loc]||{}).n||'?'} · one try counts`,value:'dc100'});
    const p=base.call(this,title,body,L,opt);return p&&p.then?p.then(v=>{if(v==='dc100'){setTimeout(()=>{try{const go=()=>dc100Open();if(typeof mmLaunch!=='function'||typeof MM==='undefined'||Date.now()-(MM.launchedAt||0)<700)go();else mmLaunch(go,_T('📅 Challenges'))}catch(e){console.error(e)}},0);return null}return v}):p}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
if(typeof sand100Dress==='function'){const base=sand100Dress;sand100Dress=function(){const r=base.apply(this,arguments);
  try{document.querySelectorAll('#mBtns .sb100 .lab .t').forEach(t=>{if(/^📅/.test(t.textContent)){t.textContent=t.textContent.replace(/^📅\s*/u,'');const b=t.closest('.sb100');if(b&&!b.querySelector('svg'))b.insertAdjacentHTML('afterbegin',DC100_IC)}})}catch(e){}return r}}
const DC100_SW=typeof PN100_IC!=='undefined'?PN100_IC.swords:'';
const DC100_IC='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 1h2v2h6V1h2v2h3a2 2 0 012 2v15a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h3zm-3 8v11h16V9zm3 3h3v3H7z"/></svg>';
function dc100Strip(){const sp=dc100Spec('d');const x=dc100Counted('d',dc100Load().d[sp.key]);const E=EVENTS[sp.ev]||{};const t=DC100_TW[sp.tw[0]];
  return `<div class="dc100pn" role="group" aria-label="${_T`Today's challenge`}"><span class="ic" aria-hidden="true">📅</span><span class="tx"><b>${_T`Today's challenge`}</b> · ${esc((E.n||sp.ev).replace(/^Classic · /,''))} ${_T`at`} ${esc((LOCATIONS[sp.loc]||{}).n||'?')} · ${_T`You`}: ${esc((CLASSES[sp.seats[0].cls]||{}).name||'')}${t?` · ${t.ic} ${esc(t.n())}`:''}</span>${x?`<span class="dc100st done">${x.m?DC100_MI[x.m]:'—'} <b>${x.s}</b></span>`:''}<span class="sp"></span><button type="button" class="sb100 s" data-dc100pn>${_T`📅 Challenges`}</button></div>`}
{const base=setupBody;setupBody=function(){const h=base.apply(this,arguments);try{if(DC100.off||typeof CFG==='undefined'||CFG.mode!=='event'||CFG.hotseat||typeof h!=='string'||h.indexOf('dc100pn')>=0)return h;
    const T=document.createElement('template');T.innerHTML=h;const f=T.content;const at=f.querySelector('.pn100ev')||f.querySelector('.pn-bands');if(!at)return h;at.insertAdjacentHTML('beforebegin',dc100Strip());return T.innerHTML}catch(e){console.error(e);return h}}}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-dc100pn]');if(!b||DC100.off)return;e.preventDefault();e.stopPropagation();
  try{if(CUR_MODAL)CUR_MODAL.done('dc100')}catch(err){}setTimeout(()=>dc100Open(),60)},true);

/* ---- the look: parchment in the house's Roman style ---- */
{const st=document.createElement('style');st.textContent=`
.dc100parch{position:relative;border-radius:8px;color:#3f2610;background:radial-gradient(ellipse at 30% 0%,rgba(255,248,226,.55),transparent 60%),linear-gradient(#ecdcb4,#dcc290);border:1px solid #7a5a34;box-shadow:inset 0 1px 0 rgba(255,246,222,.8),inset 0 -2px 0 rgba(122,90,52,.35),0 2px 8px rgba(0,0,0,.45)}
.dc100parch b{color:#2e1a08}.dc100parch small{color:#5a3d1e}
.dc100{display:flex;flex-direction:column;gap:12px}.dc100intro{margin:0;color:var(--dim)}
.dc100cards{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.dc100c{display:flex;flex-direction:column;padding:12px 14px;min-width:0}
.dc100h{display:flex;align-items:center;gap:8px;flex-wrap:wrap;border-bottom:1px solid rgba(122,90,52,.45);padding-bottom:6px;margin-bottom:8px}
.dc100h .k,.dc100rh .k{font:400 17px/1.1 var(--display);letter-spacing:.08em;font-variant:small-caps;color:#4a2e14}.dc100h .dt{font-size:13px;color:#5a3d1e}.dc100 .sp,.dc100res .sp,.dc100pn .sp,.dc100cal .sp{flex:1}
.dc100st{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:12px;font-size:12.5px;border:1px solid #7a5a34;background:rgba(255,246,222,.55);color:#3f2610;white-space:nowrap}
.dc100st.done{border-color:#8a6a1e;background:rgba(240,206,110,.45)}.dc100st.bad{border-color:#8a2e1e;color:#6a1e10}
.dc100b{display:flex;gap:12px;flex:1;min-width:0}.dc100art{flex:none;width:96px;height:139px;border-radius:5px;background-size:cover;box-shadow:0 2px 6px rgba(0,0,0,.45);border:1px solid #5a4024}
.dc100noart{display:grid;place-items:center;background:#5b4128;color:#f6dc98;font-size:30px}
.dc100i{display:flex;flex-direction:column;gap:6px;min-width:0;flex:1}.dc100i .nm{font:400 21px/1.1 var(--display);letter-spacing:.04em}.dc100i .lc{font-size:13.5px;color:#4a2e14}
.dc100tw{display:flex;gap:8px;align-items:flex-start;padding:6px 8px;border-radius:6px;background:rgba(90,58,26,.12);border:1px dashed rgba(122,90,52,.6)}
.dc100tw .ic{font-size:18px;line-height:1.2}.dc100tw b{display:block;font-size:14px}.dc100tw small{display:block;font-size:12.5px;line-height:1.25}
.dc100ln{display:flex;flex-wrap:wrap;gap:5px;align-items:center}.dc100ln .vs{font-size:12px;color:#5a3d1e;font-style:italic}
.dc100cl{display:inline-flex;align-items:center;gap:4px;padding:1px 7px 1px 6px;border-radius:10px;font-size:12.5px;color:#2e1a08;background:rgba(255,246,222,.6);border-left:4px solid var(--c)}
.dc100cl small{color:#5a3d1e;font-size:11px}.dc100cl.you{background:rgba(240,206,110,.5)}
.dc100i .sd{font-size:12px}.dc100f{display:flex;justify-content:flex-end;margin-top:10px}
.dc100cal{padding:10px 14px}.dc100calh{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.dc100days{display:grid;grid-template-columns:repeat(14,minmax(0,1fr));gap:4px}
.dc100d{display:flex;flex-direction:column;align-items:center;gap:1px;padding:3px 0 4px;border-radius:5px;background:rgba(255,246,222,.4);border:1px solid rgba(122,90,52,.4);min-height:42px}
.dc100d small{font-size:11px}.dc100d b{font-size:16px;line-height:1.1}.dc100d.today{outline:2px solid #8a6a1e;outline-offset:-1px}.dc100d.left b{color:#8a2e1e}
.dc100parch .dc100how,#mBody .dc100how{margin:8px 0 0;font-size:12.5px;color:#4a2e14}.dc100how span{white-space:nowrap;margin-left:6px}
.dc100res{padding:10px 14px;margin-bottom:10px}.dc100rh{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.dc100rh .t{font-size:12.5px;color:#5a3d1e}
.dc100rb{display:flex;align-items:center;gap:12px;margin:6px 0;flex-wrap:wrap}.dc100med{display:grid;place-items:center;width:46px;height:46px;border-radius:50%;font-size:26px;background:radial-gradient(circle at 40% 35%,#f3e2b6,#b8955a 70%);box-shadow:inset 0 1px 0 #fff3cf,0 2px 0 #5a4024}
.dc100med.none{font-size:20px;color:#5a3d1e}.dc100rb .sc{display:flex;flex-direction:column;line-height:1}.dc100rb .sc b{font:400 30px/1 var(--display)}.dc100rb .sc small{font-size:12px;text-transform:uppercase;letter-spacing:.08em}
.dc100rb .pt{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:12.5px;flex:1;min-width:200px}.dc100rb .pt .bad{color:#7a1e10}.dc100rf{font-size:13px}
.dc100pn{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 10px;padding:7px 10px;border-radius:7px;color:#3f2610;background:linear-gradient(#ecdcb4,#dcc290);border:1px solid #7a5a34;box-shadow:inset 0 1px 0 rgba(255,246,222,.8)}
.dc100pn .ic{font-size:18px}.dc100pn .tx{font-size:13.5px;min-width:0}.dc100pn b{color:#2e1a08}
@media (max-width:760px){.dc100cards{grid-template-columns:minmax(0,1fr)}}
@media (max-width:600px){.dc100art{width:70px;height:101px}.dc100i .nm{font-size:18px}.dc100days{gap:2px}.dc100d{min-height:36px}.dc100d b{font-size:13px}.dc100pn .tx{flex:1 1 200px}.dc100f .sb100{width:100%}}
`;document.head.appendChild(st)}

/* ---- medals only: a challenge leaves no other record (his 2a) ---- */
const DC100R={overAt:0,inOver:false};
function dc100NoRec(){try{if(!S||!S.daily100)return false;if(!S.over)return true;return DC100R.inOver||Date.now()-DC100R.overAt<120000}catch(e){return false}}
{const base=gameOver;gameOver=async function(){const on=!!(S&&S.daily100);if(on){DC100R.overAt=Date.now();DC100R.inOver=true}try{return await base.apply(this,arguments)}finally{if(on){DC100R.inOver=false;DC100R.overAt=Date.now()}}}}
/* a=1: the original is async (later wrappers hide that, and gameOver calls .catch on some of them) */
for(const [nm,val,a] of [['recordEvent',undefined,1],['achievementsAfterEvent',undefined,1],['logCustomChars',undefined,1],['updateCrowdAfterEvent',undefined,1],
  ['bestiaryTally',undefined,0],['saveGladiator',null,1],['markFallen',undefined,1],['claimFreedom',undefined,1],['hallTrophy',undefined,1],['rivalTrophy',undefined,1],
  ['sponsorAfterEvent',undefined,1],['roadAfterEvent',undefined,1],['infirmaryTick',undefined,1],['achGrant',false,1],['betRec',null,0],['betSettle',undefined,0],
  ['matchAutosave',undefined,0],['advanceMissio',null,1]]){
  try{const base=eval(nm);if(typeof base!=='function')continue;
    const w=function(){if(dc100NoRec())return a?Promise.resolve(val):val;return base.apply(this,arguments)};eval(`${nm}=w`)}catch(e){}}
{const base=matchSaveOK;matchSaveOK=function(){return dc100NoRec()?false:base.apply(this,arguments)}}
{const base=resultCard;resultCard=function(){const h=base.apply(this,arguments);if(!dc100NoRec()||typeof h!=='string')return h;
  return h.replace(/<button class="btn" type="button" data-(save|free)="[^"]*"[^>]*>[\s\S]*?<\/button>/g,'')}}
{const DC100_BLOCK=new Set(['hall','infamis','hallTrophies','gladiators','missios','wallet','crowd','arena','customChars']);
  const put=Store.put,del=Store.del;
  Store.put=function(col){if(DC100_BLOCK.has(col)&&dc100NoRec())return Promise.resolve(false);return put.apply(this,arguments)};
  Store.del=function(col){if(DC100_BLOCK.has(col)&&dc100NoRec())return Promise.resolve();return del.apply(this,arguments)}}
