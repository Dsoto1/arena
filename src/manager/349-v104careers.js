/* =====================================================================
   349-V104CAREERS · v1.04 B — age, the five career kinds, retirement, fame that follows results, advisor pace (Manager only)
   (his answers: tools/plans/v103/NOTES.md E3 a / A1a A3a A4a / N3a; plan tools/plans/v104/PLAN.md "B")
   1 · AGE — new league fighters arrive 18–30 (genGlad wrapper; REPLACES 17-manager's 16–21 rookies / 19–35 / the odd 36–80 sand-hand).
       1 season = 1 year (17-manager's birthday at season's end stays).
   2 · FIVE CAREER KINDS (c104Kind, from hashStr of the fighter id — never the dice RNG): Meteor 1/100 (prime 2 seasons, +8 OVR bloom, steep
       fade) · Blazer 1/10 (3–4, +4, fast) · Common ~3/4 (4–6) · Steady 1/10 (8–12, slow) · Ageless 1/150 (15–25, very slow). Per fighter:
       prime start age 23–27 (late bloomers ~1 in 8: 28–30), prime length inside the kind's range, a 0.8–1.2 spread on rise/fade.
       Phase by age (c104Phase): rising (before the prime) · prime (hold) · fading (after it).
   3 · THE SEASON TURN (c104Turn, once a season): through builder A's off-season hook OFF104.on(fn(w,ctx)) when it exists, else at the
       first endWeek of a new season (w.c104s). For every living fighter in the world (yours, the rivals', free agents): a fighter seen for
       the first time only gets his curve (g.c104 = {n: turn}) — nobody rises or fades before one season has passed (A1a). After that:
       rising = bonus growth (statGain) · entering the prime = the kind's bloom (Meteor/Blazer, not spread) · fading = ratings lost per season,
       Speed first, Intelligence last (C104.fadeW), slowed up to 35% by weeks drilled that season (g.tr104, weeklyGrowth wrapper).
       statOvr's −5…+15 clamp becomes −25…+25 so a bloom and a fade show in the overall (REPLACES the old clamp while on).
   4 · RETIREMENT (same turn): fading fighters may retire — older, longer faded and lower rated = likelier (c104RetireP; hash of world id +
       fighter id + turn). Farewell letter (yours), news + chronicle, Annals line (libertyEntry → the Liberti) for your retirees and every
       great; a GREAT (Immortalis, or peak 78+ with 8+ wins) gets "a great" plaque there. REPLACES 17-manager's weekly "hung up the sword" at 35+
       (now only at the season turn). A retired great of YOURS may stay as Doctore or Barracks master at level 3 (A3a): a letter with the two
       choices ([data-c104adv]) — he takes that council seat (name + face). A rival's great joins his house's Doctore (level ≥3) half the time.
   5 · SCOUTING — the fighter card (detailHTML wrapper) gets a Form line [data-c104form]: "Form: Rising/Prime/Fading · prime ~N seasons left".
       Free agents / rivals: sharpens with the Recruiter's reads (rec98K precisions): rough = phase + "short, bright career" / "long career",
       fair = + ~N (±1), sure = exact N + the kind's name. Your own fighters: the Doctore's level (1 rough · 2–3 fair · 4–5 sure).
   6 · FAME FOLLOWS RESULTS (N3a) — win rates are read AGAINST THE LEAGUE'S (a bout has one winner among several houses, so ~1 in 4 is
       average; c104Mean). A house's fame gain from a bout × (0.5 + 0.5 × its season win rate / the league's), 0.5–1.3 (fractional carry
       m.fm104; an early season leans on the league's rate). At the season turn a house under 3/4 of the league's rate (4+ bouts) drifts down.
   7 · ADVISOR PACE (N3a, 2nd a) — an advisor (yours and the rivals') rises at most ONE level a season: adv98Up refuses, adv98Req/adv98RReq
       add "next season" while that advisor already rose this season (w.adv104 / m.adv104 = {s, lv} snapshot at the season's first look).
   Summary of the turn: w.c104rev {s, ret[], bloom, fade, fame[]}; ctx.lines gets one line when the hook passes an array; BUS 'career.season'.
   Kill switch localStorage flavius_v104boff=1. No save migration (new fields only). Test tv104b.
   ===================================================================== */
const C104={
  kinds:{ /* p = share; pl = prime length range (seasons); rise = avg rating points a rising season; bloom = at the prime's start; fade = a fading season */
    meteor:{p:1/100,pl:[2,2],rise:1.2,bloom:13,fade:7},
    blazer:{p:1/10,pl:[3,4],rise:1.2,bloom:6.5,fade:4.5},
    steady:{p:1/10,pl:[8,12],rise:1,bloom:0,fade:1.5},
    ageless:{p:1/150,pl:[15,25],rise:1,bloom:0,fade:0.8},
    common:{p:0,pl:[4,6],rise:1.2,bloom:0,fade:3}},
  order:['meteor','blazer','steady','ageless'], /* common = the rest (~78%) */
  ps:[23,27],late:0.12,psLate:[28,30],spread:[0.8,1.2],
  fadeW:{spd:1.4,str:1.1,lck:0.9,cha:0.9,int:0.7}, /* Speed first, Intelligence last (sums to 5) */
  trainCut:0.35,trainWeeks:10,
  age:[18,30],
  ret:{base:0.05,perFade:0.06,perAge:0.03,ageFrom:31,perOvr:0.012,ovrBelow:62,max:0.9},
  great:{pk:78,wins:8},
  fame:{lo:0.5,hi:1.3,loseBelow:0.75,minBouts:4,k:16,prior:3},
  statClamp:[-25,25]};
function c104On(){try{return localStorage.getItem('flavius_v104boff')!=='1'}catch(e){return true}}
function c104Live(w){w=w||(typeof W_==='function'?W_():null);return c104On()&&!!w&&!w.tutorial&&!w.dead}
const c104U=s=>(hashStr(s)>>>0)/4294967296;
const C104_NAME=()=>({meteor:_T('Meteor'),blazer:_T('Blazer'),common:_T('Common'),steady:_T('Steady'),ageless:_T('Ageless')});
const C104_PH=()=>({rise:_T('Rising'),prime:_T('Prime'),fade:_T('Fading')});
/* the curve — pure, from the id */
function c104Kind(g){const id=(g&&(g.id||g.name))||'x';const u=c104U('car104k|'+id);let acc=0,kind='common';
  for(const k of C104.order){acc+=C104.kinds[k].p;if(u<acc){kind=k;break}}
  const K=C104.kinds[kind];const r=n=>c104U('car104'+n+'|'+id);
  const late=r('l')<C104.late;const R=late?C104.psLate:C104.ps;const ps=R[0]+Math.floor(r('s')*(R[1]-R[0]+1));
  const pl=K.pl[0]+Math.floor(r('p')*(K.pl[1]-K.pl[0]+1));const sp=C104.spread[0]+r('x')*(C104.spread[1]-C104.spread[0]);
  return {k:kind,ps,pl,sp:Math.round(sp*100)/100,late,K}}
function c104Phase(g,age){const c=c104Kind(g);const a=age??gAge(g);
  if(a<c.ps)return {ph:'rise',left:c.ps-a,c};if(a<c.ps+c.pl)return {ph:'prime',left:c.ps+c.pl-a,c};return {ph:'fade',left:0,past:a-(c.ps+c.pl)+1,c}}
/* 1 · age: arrivals 18–30 */
{const base=genGlad;genGlad=function(o={}){const g=base.apply(this,arguments);try{if(c104On()&&g&&(o||{}).age==null){const h=hashStr('car104a|'+g.id)>>>0;
  if(g.rookie)g.age=C104.age[0]+h%3;else if(g.age<C104.age[0])g.age=C104.age[0]+h%2;else if(g.age>C104.age[1])g.age=C104.age[1]-4+h%5}}catch(e){console.error(e)}return g}}
/* statOvr: a bloom and a fade show in the overall */
{const base=statOvr;statOvr=function(g){if(!c104On()||!g||!g.c104)return base.apply(this,arguments);try{const st=gStats(g);if(!st)return 0;
  return clamp(Math.round((statSum(st)/STAT_KEYS.length-g.st0)*0.6),C104.statClamp[0],C104.statClamp[1])}catch(e){return base.apply(this,arguments)}}}
/* weeks drilled this season (training slows the fade) */
{const base=weeklyGrowth;weeklyGrowth=function(w){const r=base.apply(this,arguments);try{if(c104Live(w)){const pm=me();const plan=w.tplan&&w.tplan.wk===w.week?w.tplan:null;
  for(const g of w.glads){if(!g.alive)continue;if(!g.contract){g.tr104=(g.tr104||0)+0.5;continue}
    if(pm&&g.contract.mgr===pm.id){const hrs=plan&&plan.g&&plan.g[g.id]?Object.values(plan.g[g.id]).reduce((a,x)=>a+(+x||0),0):0;if(!g.inj&&((w.train&&w.train!=='off')||hrs>0))g.tr104=(g.tr104||0)+1}
    else g.tr104=(g.tr104||0)+1}}}catch(e){console.error(e)}return r}}
/* rating loss, weighted Speed first … Intelligence last; fractional carry in g.c104.fx */
function c104Lose(g,amt){const st=gStats(g);if(!st||amt<=0)return {};const C=g.c104;C.fx=C.fx||{};const out={};
  for(const k of STAT_KEYS){let x=(C.fx[k]||0)+amt*(C104.fadeW[k]||1);let d=0;while(x>=1&&st[k]>STAT_MIN){st[k]--;x-=1;d++}if(st[k]<=STAT_MIN)x=0;C.fx[k]=Math.round(x*100)/100;if(d)out[k]=d}
  return out}
function c104Great(g){try{if(g.imm88||(typeof mgrImmortalis88==='function'&&mgrImmortalis88(g)))return true}catch(e){}const C=g.c104||{};return (C.pk||0)>=C104.great.pk&&((g.rec&&g.rec.w)||0)>=C104.great.wins}
function c104RetireP(g,ph){const R=C104.ret;if(ph.ph!=='fade')return 0;const a=gAge(g);const o=effOvr(g);const fs=(g.c104&&g.c104.fs)||1;
  return clamp(R.base+R.perFade*(fs-1)+R.perAge*Math.max(0,a-R.ageFrom)+R.perOvr*Math.max(0,R.ovrBelow-o),0,R.max)}
function c104Retire(w,g,rev){const m2=g.contract?mgrById(g.contract.mgr):null;const mine=!!(m2&&m2.isPlayer);const great=c104Great(g);const a=gAge(g);const o=effOvr(g);
  g.alive=false;g.retired=true;g.rt104={s:w.season,age:a,ovr:o,great:great?1:0};if(m2)g.contract=null;
  ghist(g,_T`retired at ${a}${great?_T(' — a great of the sand'):''}`);
  mnews(_T`🏺 <b>${esc(g.name)}</b>, ${a}, retires${m2?_T` from ${esc(m2.ludus)}`:''} after ${g.rec.ev} event${g.rec.ev===1?'':'s'} and ${g.rec.w} win${g.rec.w===1?'':'s'}.${great?_T(' The sand will remember a great.'):''}`,mine?'big':'');
  if(mine){tnews(_T`🏺 ${esc(g.name)} retired at ${a}.`,'bad');
    sendLetter(w,{key:'c104ret-'+g.id,kind:'letter',from:_T('your barracks'),adv:'barracks',seal:'🏺',until:w.week+4,title:_T`${g.name} lays down the sword`,
      body:`<p>${_T`Lanista — <b>${esc(g.name)}</b> is ${a} and the legs no longer answer. ${g.rec.ev} event${g.rec.ev===1?'':'s'}, ${g.rec.w} win${g.rec.w===1?'':'s'}, best overall ${(g.c104&&g.c104.pk)||o}. The barracks drink to an old sand-hand tonight.`}</p>`});
    if(great){(w.c104adv=w.c104adv||{})[g.id]={name:g.name,cls:g.cls,fem:!!g.fem,look:(()=>{try{return face99Out(fromGlad99(g),'look')}catch(e){return null}})(),s:w.season};
      sendLetter(w,{key:'c104adv-'+g.id,kind:'letter',from:_T('the Consilium'),adv:'consilium',seal:'🏛',until:w.week+6,title:_T`${g.name} could stay with the house`,
        body:`<p>${_T`A great does not leave the sand easily. <b>${esc(g.name)}</b> offers to stay — as your Doctore or as your Barracks master, at level 3. Whoever holds that seat now steps aside.`}</p><div class="acts"><button class="btn tksm" type="button" data-c104adv="${esc(g.id)}|doctore">${_T`As Doctore`} <small>${_T`now level ${adv98Lv(w,'doctore')}`}</small></button><button class="btn tksm" type="button" data-c104adv="${esc(g.id)}|barracks">${_T`As Barracks master`} <small>${_T`now level ${adv98Lv(w,'barracks')}`}</small></button></div>`})}}
  else if(great&&m2&&!m2.isPlayer&&c104U('car104r|'+w.id+'|'+g.id)<0.5&&typeof adv98R==='function'){const R=adv98R(m2,w);if(R&&R.lv)R.lv.doctore=Math.max(R.lv.doctore||1,3)}
  if((mine||great)&&typeof libertyEntry==='function')try{libertyEntry(g,m2,_T('the Gate of Life'),great?_T('retired a great'):_T('retired'))}catch(e){console.error(e)}
  rev.ret.push({id:g.id,name:g.name,age:a,ovr:o,kind:c104Kind(g).k,mine,great,house:m2?m2.ludus:null});
  try{if(typeof BUS!=='undefined')BUS.emit('career.retired',{gid:g.id,mine,great})}catch(e){}}
/* the season turn */
function c104Turn(w,ctx){if(!c104Live(w))return null;w.c104n=(w.c104n||0)+1;const n=w.c104n;const rev={s:w.season,n,ret:[],bloom:0,fade:0,rise:0,first:0,fame:[]};
  for(const g of w.glads){if(!g.alive||g.lanista||g.sotonium||g.starChild)continue;
    if(!g.c104){g.c104={n,pk:effOvr(g)};if(!g.age||g.age<C104.age[0])g.age=Math.max(C104.age[0],gAge(g));rev.first++;g.tr104=0;continue}
    const C=g.c104;const ph=c104Phase(g);const K=ph.c.K;
    if(ph.ph==='rise'){const amt=K.rise*ph.c.sp;gainAll(g,{spd:amt,str:amt,int:amt,lck:amt,cha:amt});rev.rise++}
    else if(ph.ph==='prime'){if(C.ph!=='prime'&&K.bloom>0){const b=K.bloom;gainAll(g,{spd:b,str:b,int:b,lck:b,cha:b});rev.bloom++;ghist(g,_T('in full bloom — the prime has come'))}}
    else{const tr=Math.min(1,(g.tr104||0)/C104.trainWeeks);const amt=K.fade*ph.c.sp*(1-C104.trainCut*tr);const lost=c104Lose(g,amt);C.fs=(C.fs||0)+1;rev.fade++;
      const ks=Object.keys(lost);if(ks.length){const nm=Object.fromEntries(STATS.map(s=>[s[0],s[1]]));ghist(g,_T`past the prime: ${ks.map(k=>nm[k]+' −'+lost[k]).join(', ')}`)}}
    C.ph=ph.ph;C.pk=Math.max(C.pk||0,effOvr(g));g.tr104=0}
  /* retirement: faded fighters (not on loan this season) */
  for(const g of w.glads){if(!g.alive||!g.c104||g.c104.n===n||g.loanFrom||g.lanista||g.sotonium||g.starChild)continue;const ph=c104Phase(g);const p=c104RetireP(g,ph);
    if(p>0&&c104U(`car104q|${w.id}|${g.id}|${n}`)<p)c104Retire(w,g,rev)}
  /* fame drift: a losing season */
  const anyNow=(w.mgrs||[]).some(m=>m.spS&&m.spS[w.season]&&m.spS[w.season].b);const ss=anyNow?w.season:w.season-1;const mean=c104Mean(w,ss);
  for(const m of w.mgrs||[]){if(m.dead)continue;const S=(m.spS||{})[ss];if(!S||(S.b||0)<C104.fame.minBouts)continue;
    const wr=(S.w||0)/S.b;const rel=wr/mean;if(rel<C104.fame.loseBelow){const d=Math.max(1,Math.round((C104.fame.loseBelow-rel)*C104.fame.k));m.fame=clamp((m.fame||0)-d,0,100);rev.fame.push({id:m.id,d:-d,wr:Math.round(wr*100)});
      if(m.isPlayer)tnews(_T`📉 A losing season (${Math.round(wr*100)}% won) — fame −${d}.`,'bad')}}
  w.c104rev=rev;
  try{if(ctx&&Array.isArray(ctx.lines)&&rev.ret.length)ctx.lines.push(_T`🏺 Retired: ${rev.ret.slice(0,6).map(x=>esc(x.name)+' ('+x.age+')').join(', ')}${rev.ret.length>6?' …':''}`)}catch(e){}
  try{if(typeof BUS!=='undefined')BUS.emit('career.season',{w,rev})}catch(e){}
  return rev}
/* when it runs: builder A's off-season week, else the first endWeek of a new season */
let C104REG=false;
function c104Off(w,ctx){try{if(!c104Live(w)||w.c104s===w.season)return;w.c104s=w.season;c104Turn(w,ctx)}catch(e){console.error(e)}}
function c104Reg(){if(C104REG)return true;try{if(typeof OFF104!=='undefined'&&OFF104&&typeof OFF104.on==='function'){OFF104.on(c104Off);C104REG=true}}catch(e){}return C104REG}
c104Reg();
{const base=endWeek;endWeek=async function(){const reg=c104Reg();const r=await base.apply(this,arguments);
  try{const w=W_();if(!reg&&r!==false&&c104Live(w)){if(w.c104s==null)w.c104s=w.season;else if(w.season>w.c104s){w.c104s=w.season;c104Turn(w,null)}}}catch(e){console.error(e)}return r}}
/* 6 · fame follows results */
function c104Mean(w,season){let W=0,B=0;for(const m of w.mgrs||[]){const S=(m.spS||{})[season];if(S){W+=S.w||0;B+=S.b||0}}return B>=8?Math.max(0.05,W/B):0.25}
function c104FameK(m){const w=W_();const S=msp(m);const mean=c104Mean(w,w.season);const P=C104.fame.prior;const wr=((S.w||0)+mean*P)/((S.b||0)+P);return clamp(C104.fame.lo+0.5*wr/mean,C104.fame.lo,C104.fame.hi)}
{const base=applyBout;applyBout=function(){const w=W_();let f0=null;try{if(c104Live(w))f0=new Map((w.mgrs||[]).map(m=>[m.id,m.fame||0]))}catch(e){}
  const r=base.apply(this,arguments);
  try{if(f0)for(const m of w.mgrs||[]){const d=(m.fame||0)-(f0.get(m.id)||0);if(d<=0)continue;const x=d*c104FameK(m)+(m.fm104||0);const whole=Math.floor(x);m.fm104=Math.round((x-whole)*100)/100;m.fame=clamp((f0.get(m.id)||0)+whole,0,100)}}catch(e){console.error(e)}
  return r}}
/* 7 · advisor pace: one level a season */
function adv104Snap(w,holder,lvOf){const s=w.season;let A=holder.adv104;if(!A||A.s!==s){A=holder.adv104={s,lv:{}};for(const k of ADV98_K)A.lv[k]=lvOf(k)}return A}
function adv104Rose(w,k){if(!c104Live(w))return false;const A=adv104Snap(w,w,x=>adv98Lv(w,x));return adv98Lv(w,k)>(A.lv[k]||1)}
{const base=adv98Up;adv98Up=function(k){try{const w=W_();if(w&&adv104Rose(w,k))return {ok:false,why:_T('One level a season — this advisor rose already. Next season.')}}catch(e){console.error(e)}return base.apply(this,arguments)}}
{const base=adv98Req;adv98Req=function(w,pm,k,lv){const r=base.apply(this,arguments);try{if(w&&r&&r.length&&adv104Rose(w,k))return [...r,[_T('next season'),0,1]]}catch(e){console.error(e)}return r}}
{const base=adv98RReq;adv98RReq=function(w,m,k,lv){const r=base.apply(this,arguments);try{if(c104Live(w)&&m&&r&&r.length){const R=adv98R(m,w);const A=adv104Snap(w,m,x=>R.lv[x]||1);if((R.lv[k]||1)>(A.lv[k]||1))return [...r,[0,1]]}}catch(e){console.error(e)}return r}}
{const base=adv98RivalWeek;adv98RivalWeek=function(w){try{if(c104Live(w))for(const m of w.mgrs||[]){if(m.isPlayer||m.dead)continue;const R=adv98R(m,w);adv104Snap(w,m,x=>R.lv[x]||1)}}catch(e){console.error(e)}return base.apply(this,arguments)}}
/* a retired great takes a council seat */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-c104adv]');if(!b)return;const w=W_();if(!w)return;const [gid,k]=String(b.dataset.c104adv).split('|');
  const r=c104Seat(w,gid,k);if(r&&typeof mToast==='function')mToast(_T`🏛 ${esc(r.name)} is your ${esc(r.role)} now — level ${r.lv}.`);
  const L=(w.letters||[]).find(x=>x.key==='c104adv-'+gid);if(L)L.read=true;try{saveWorld()}catch(err){}if(typeof MGR_REDRAW==='function')MGR_REDRAW()});
function c104Seat(w,gid,k){const G=(w.c104adv||{})[gid];if(!G||!['doctore','barracks'].includes(k))return null;const a=council83(w).find(x=>x.k===k);if(!a)return null;
  a.name=G.name;if(G.look)a.face={...G.look,fem:!!G.fem};a.lv=3;a.from104=gid;delete w.c104adv[gid];
  try{const A=adv104Snap(w,w,x=>adv98Lv(w,x));A.lv[k]=3}catch(e){}
  return a}
/* 5 · the Form line */
function c104Read(g){const w=W_(),m=me();try{if(g.contract&&m&&g.contract.mgr===m.id){const lv=adv98Lv(w,'doctore');return lv>=4?3:lv>=2?2:1}
  const K=typeof rec98K==='function'?rec98K(g):null;const p=K&&K.p||{};const s=STAT_KEYS.reduce((a,k)=>a+(p[k]||0),0)/STAT_KEYS.length;return s>=2.6?3:s>=1.4?2:s>0?1:0}catch(e){return 0}}
function c104FormHTML(g,read){const P=c104Phase(g);const c=P.c;const N=C104_NAME(),PH=C104_PH();read=read??c104Read(g);
  const rough=c.k==='meteor'||c.k==='blazer'?_T('short, bright career'):c.k==='steady'||c.k==='ageless'?_T('long career'):'';
  let txt;if(!read)txt=_T('not read yet — scout to learn');
  else{const n=read>=3?P.left:Math.max(1,P.left+((hashStr('car104n|'+g.id)>>>0)%3)-1);
    const when=P.ph==='rise'?(read>=2?_T`prime in ~${n} season${n===1?'':'s'}`:''):P.ph==='prime'?(read>=2?_T`prime ~${n} season${n===1?'':'s'} left`:''):_T('past the prime');
    const kind=read>=3?N[c.k]+(c.late?_T(' · late bloomer'):''):rough;
    txt=[`<b>${PH[P.ph]}</b>`,when,kind].filter(Boolean).join(' · ')}
  return `<div class="c104form" data-c104form="${read?P.ph:'unread'}" data-c104read="${read}">${_T`📈 Form:`} ${txt}</div>`}
{const base=detailHTML;detailHTML=function(g){const h=base.apply(this,arguments);try{if(!c104Live()||!g||typeof h!=='string'||g.alive===false)return h;return c104FormHTML(g)+h}catch(e){console.error(e);return h}}}
(()=>{const st=document.createElement('style');st.textContent=`.c104form{font-size:12.5px;color:var(--muted);margin:0 0 6px;padding:4px 8px;border-left:3px solid var(--gold2);background:rgba(201,178,122,.08)}.c104form b{color:var(--gold2)}`;document.head.appendChild(st)})();
