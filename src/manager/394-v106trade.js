/* =====================================================================
   394-v106trade — v1.06 RIVAL TRADE MOTIVES (his t1a, 2026-10-17; tools/plans/v106/NOTES.md "Rival trade strategy"). Manager only.
   Kill switch localStorage flavius_v106troff=1 (back to 47's value match). Test tools/tests/tv106b.js.
   REPLACES 47 offersGen (offersWeek's new offer: a 35% Math.random roll, any friendly house, gValue = rating×2.2 + fame×1.2 − age over 30,
   no wages). 47's pruning, 229's live check, 345's "always gives something", 378's settling-in guard and 393's deadline still wrap it.
   1 · VALUE tr106Val(g) = rating×2.2 + fame×1.2 + age (young +1.5 a year under 24, −4 a year over 28) + career kind (349 c104Phase: rising
       up to +8, prime up to +6, fading −6 a season past it; Steady +4, Ageless +6, Meteor −2) + potential (pot − ovr) − weekly wage×2.
       tr106Parts(g) gives the parts.
   2 · MOTIVE tr106Motive(w,m) from the house's situation, first that holds:
       wages  (poor: coin under 3 weeks of its wages, or under 60) → swaps its dearest fighter for a cheaper one of yours, no coin;
       allin  (contender: top 4 of the league in weeks 7–8) → pays a premium (×1.15–1.35) for your best;
       gap    (a starter hurt) → buys a like-for-like fighter;
       sell   (a fighter of its own about to fade: prime ending this season or fading, rated at least its average) → offers him for a younger one of yours;
       gap    (a lopsided squad — TR106.thin = 2 classes or fewer — lacking a class you have) → buys one of that class;
       youth  (rebuilding: bottom third from week 3, or a squad averaging 27+) → wants your young prospect (≤23, room to grow), a veteran or coin back.
       Coin is never more than the house's treasury minus 4 weeks of its wages (no house goes broke on a trade).
   3 · THE CARD (offersHTML wrapper): one line WHY (o.why106) + the weekly cost change for you (o.dw106 = their wages in − his wage out):
       "+3/wk for you" · "−12/wk for you" · "same wages". The desk row keeps 270's line.
   4 · DETERMINISTIC: the week's roll and pick come from mulberry32(hashStr('tr106|world id|season|week')) — never the dice, never Math.random.
       The offer id is 'o6<season>_<week>_<house>'. w.tr106n counts offers by motive (the sim reads it).
   ===================================================================== */
const TR106={on:(()=>{try{return localStorage.getItem('flavius_v106troff')!=='1'}catch(e){return true}})(),p:0.35,reserveWk:4,poorWk:3,poorMin:60,
  K:{ovr:2.2,fame:1.2,young:1.5,old:4,pot:1,wage:2},allin:[1.15,1.35],thin:2,coin:[0.95,1.2],
  kinds:{steady:4,ageless:6,meteor:-2,blazer:0,common:0}};
const TR106_M=['wages','allin','gap','sell','youth'];
function tr106Wages(m){return rosterOf(m).reduce((a,g)=>a+((g.contract&&g.contract.wage)||0),0)}
function tr106Wage(g){return g&&g.contract?(g.contract.wage||0):(typeof askWage==='function'&&g?askWage(g):0)}
function tr106Parts(g){const o=effOvr(g),f=g.fame||0,a=gAge(g),wage=tr106Wage(g);const K=TR106.K;
  const age=a<24?(24-a)*K.young:a>28?-(a-28)*K.old:0;
  let car=0;try{if(typeof c104Phase==='function'&&(typeof c104On!=='function'||c104On())){const P=c104Phase(g);
    car=P.ph==='rise'?Math.min(8,2*P.left):P.ph==='prime'?Math.min(6,2*P.left):-6*(P.past||1);car+=TR106.kinds[P.c.k]||0}}catch(e){}
  const pot=Math.max(0,((g.pot!=null?g.pot:g.ovr)||0)-(g.ovr||0))*K.pot;
  const v=Math.round(o*K.ovr+f*K.fame+age+car+pot-wage*K.wage);return {ovr:o,fame:f,age,car,pot,wage,v}}
const tr106Val=g=>tr106Parts(g).v;
/* about to fade: the prime ends this season, or already fading */
function tr106Fading(g){try{if(typeof c104Phase!=='function')return gAge(g)>=31;const P=c104Phase(g);return P.ph==='fade'||(P.ph==='prime'&&P.left<=1)}catch(e){return false}}
const tr106Prot=(g,w)=>{try{return typeof set105Left==='function'&&set105Left(g,w)>0}catch(e){return false}};
const tr106Fit=g=>!!g&&g.alive!==false&&!g.inj&&!g.loanFrom&&!g.lanista;
function tr106Rank(w,m){const L=leagueSort((w.mgrs||[]).filter(x=>!x.dead&&!x.sica),w.season);return {rank:L.indexOf(m)+1,n:L.length}}
/* the house's situation → its motive (or null) */
function tr106Sit(w,m,pm){const ros=rosterOf(m).filter(g=>!g.loanFrom);const wages=tr106Wages(m);const wk=wkOf(w.week);const {rank,n}=tr106Rank(w,m);
  const avgO=ros.length?ros.reduce((a,g)=>a+effOvr(g),0)/ros.length:0;const avgA=ros.length?ros.reduce((a,g)=>a+gAge(g),0)/ros.length:0;
  const st=(typeof depthOf==='function'?depthOf(m).starters:ros.slice(0,3));const hurt=st.find(g=>g.inj&&!g.inj.war)||null;
  const have=new Set(ros.map(g=>g.cls));const mine=pm?rosterOf(pm).filter(g=>tr106Fit(g)&&!tr106Prot(g,w)):[];const thin=have.size<=TR106.thin;const miss=thin?mine.find(g=>!have.has(g.cls))||null:null;
  const fader=ros.filter(g=>!g.inj&&tr106Fading(g)&&effOvr(g)>=avgO&&!tr106Prot(g,w)).sort((a,b)=>effOvr(b)-effOvr(a)||(a.id<b.id?-1:1))[0]||null;
  return {poor:m.coin<Math.max(TR106.poorMin,wages*TR106.poorWk),contender:rank>0&&rank<=4&&(wk===7||wk===8),hurt,miss,fader,
    rebuild:(wk>=3&&rank>0&&rank>Math.ceil(n*2/3))||avgA>=27,wages,rank,n,avgO,avgA}}
function tr106Motive(w,m,pm){const S=tr106Sit(w,m,pm||me());
  if(S.poor)return 'wages';if(S.contender)return 'allin';if(S.hurt)return 'gap';if(S.fader)return 'sell';if(S.miss)return 'gap';if(S.rebuild)return 'youth';return null}
const tr106Room=m=>Math.max(0,(m.coin||0)-tr106Wages(m)*TR106.reserveWk);
const tr106By=f=>(a,b)=>(f(b)-f(a))||(a.id<b.id?-1:a.id>b.id?1:0);
const tr106Near=(L,v,f)=>[...L].sort((a,b)=>(Math.abs(f(a)-v)-Math.abs(f(b)-v))||(a.id<b.id?-1:1))[0]||null;
/* one house's offer for this week (no side effects); r = a 0..1 number for the coin spread */
function tr106Plan(w,m,pm,r){pm=pm||me();const mot=tr106Motive(w,m,pm);if(!mot)return null;const S=tr106Sit(w,m,pm);
  const mine=rosterOf(pm).filter(g=>tr106Fit(g)&&!tr106Prot(g,w));const theirs=rosterOf(m).filter(g=>tr106Fit(g)&&!tr106Prot(g,w));if(!mine.length)return null;
  const room=tr106Room(m);const C=TR106.coin;r=r==null?0.5:r;let want=null,give=[],coin=0,why='';const L=esc(m.ludus);
  const buy=(g,k)=>{const c=Math.max(20,Math.round(tr106Val(g)*k));return c<=room?c:0};
  if(mot==='wages'){const dear=[...theirs].sort(tr106By(tr106Wage))[0];if(!dear||tr106Wage(dear)<6)return null;
    want=tr106Near(mine.filter(g=>tr106Wage(g)<=tr106Wage(dear)-3),tr106Val(dear),tr106Val);if(!want)return null;give=[dear];
    why=_T`${L} must cut wages: ${esc(dear.name)} costs them ${tr106Wage(dear)}/wk.`}
  else if(mot==='allin'){want=[...mine].sort(tr106By(effOvr))[0];coin=buy(want,TR106.allin[0]+(TR106.allin[1]-TR106.allin[0])*r);
    if(!coin){const kids=theirs.filter(g=>gAge(g)<=23).sort(tr106By(tr106Val));if(!kids.length)return null;give=[kids[0]];const gap=tr106Val(want)-tr106Val(kids[0]);
      if(gap>0&&kids[1]&&tr106Val(kids[0])<tr106Val(want)*0.8)give.push(kids[1]);coin=Math.min(room,Math.max(0,Math.round((tr106Val(want)-give.reduce((a,g)=>a+tr106Val(g),0))*0.5)))}
    why=_T`${L} goes all-in for the Superbus before the deadline.`}
  else if(mot==='gap'){if(S.hurt){want=tr106Near(mine,effOvr(S.hurt),effOvr);why=_T`${L}’s starter ${esc(S.hurt.name)} is hurt — they need a fighter now.`}
    else{want=mine.filter(g=>g.cls===S.miss.cls).sort(tr106By(effOvr))[0];const cn=CLASSES[want.cls]?CLASSES[want.cls].name:want.cls;why=_T`${L} has no ${esc(cn)} — they need one.`}
    if(!want)return null;coin=buy(want,C[0]+(C[1]-C[0])*r);
    if(!coin){const spare=theirs.filter(g=>g!==S.hurt).sort(tr106By(g=>-effOvr(g)))[0];if(!spare)return null;give=[spare];coin=Math.min(room,Math.max(0,Math.round((tr106Val(want)-tr106Val(spare))*0.5)))}}
  else if(mot==='sell'){const f=S.fader;const fv=tr106Val(f);want=mine.filter(g=>gAge(g)<=gAge(f)-3&&tr106Val(g)<=fv+10).sort(tr106By(g=>(g.pot||g.ovr||0)-(g.ovr||0)+effOvr(g)/10))[0];if(!want)return null;
    give=[f];coin=Math.min(room,Math.max(0,Math.round((tr106Val(want)-fv)*0.5)));
    why=_T`${L} sells high: ${esc(f.name)}’s best years are nearly over.`}
  else if(mot==='youth'){want=mine.filter(g=>gAge(g)<=23&&((g.pot||g.ovr||0)-(g.ovr||0)>=5||tr106Parts(g).car>0)).sort(tr106By(g=>(g.pot||g.ovr||0)-(g.ovr||0)))[0];if(!want)return null;
    const vet=theirs.filter(g=>gAge(g)>=29&&effOvr(g)>=effOvr(want)).sort(tr106By(effOvr))[0];
    if(vet){give=[vet];coin=Math.min(room,Math.max(0,Math.round((tr106Val(want)-tr106Val(vet))*0.5)))}else{coin=buy(want,C[0]+(C[1]-C[0])*r);if(!coin)return null}
    why=_T`${L} is rebuilding — they want ${esc(want.name)} (${gAge(want)}) for the years ahead.`}
  if(!want||give.includes(want))return null;
  const dw=give.reduce((a,g)=>a+tr106Wage(g),0)-tr106Wage(want);
  const o={id:'o6'+w.season+'_'+w.week+'_'+m.id,kind:give.length?'swap':'coin',mid:m.id,gid:want.id,coin,until:w.week+2,mot106:mot,why106:why,dw106:dw};if(give.length)o.give=give.map(g=>g.id);
  if(o.kind==='coin'&&!(coin>0))return null;return o}
/* this week's offer: replaces 47's offersGen */
function tr106Gen(w,pm){const mine=rosterOf(pm).filter(g=>!g.loanFrom);if(mine.length<2||(w.offers||[]).length>=2)return null;
  const R=mulberry32(hashStr('tr106|'+w.id+'|'+w.season+'|'+w.week));if(R.next()>TR106.p)return null;
  const houses=(w.mgrs||[]).filter(m=>!m.isPlayer&&!m.dead&&!isRival(m)&&opinionOf(m).v>=20).sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);if(!houses.length)return null;
  const r=R.next();const plans=houses.map(m=>tr106Plan(w,m,pm,r)).filter(Boolean);if(!plans.length)return null;
  const o=plans[Math.floor(R.next()*plans.length)];return o}
if(TR106.on){
  {const base=offersGen;offersGen=function(w,pm){if(!TR106.on||!w||!pm||w.tutorial)return base.apply(this,arguments);
    try{const o=tr106Gen(w,pm);if(!o)return;const m=mgrById(o.mid),g=gById(o.gid);(w.offers=w.offers||[]).push(o);(w.tr106n=w.tr106n||{})[o.mot106]=(w.tr106n[o.mot106]||0)+1;
      tnews(_T`📨 <b>${esc(m.ludus)}</b> sends a trade offer for <b>${esc(g.name)}</b> — see the top of any tab.`,'big')}catch(e){console.error(e)}}}
  /* the card: why + the weekly cost */
  {const base=offersHTML;offersHTML=function(){let h=base.apply(this,arguments);try{const w=W_();if(!w||typeof h!=='string'||!h)return h;
    for(const o of w.offers||[]){if(!o.why106)continue;const k=h.indexOf(`data-m47="offyes" data-id="${o.id}"`);if(k<0)continue;const a=h.lastIndexOf('<div class="acts"',k);if(a<0)continue;
      const dw=o.dw106|0;const wk=dw>0?_T`+${dw}/wk for you`:dw<0?_T`−${-dw}/wk for you`:_T`same wages`;
      h=h.slice(0,a)+`<div class="tr106" data-tr106="${o.mot106}"><span class="tr106why">${o.why106}</span><span class="tr106wk ${dw>0?'up':dw<0?'dn':''}">${wk}</span></div>`+h.slice(a)}}catch(e){console.error(e)}return h}}
  (()=>{if(typeof document==='undefined'||document.getElementById('tr106css'))return;const st=document.createElement('style');st.id='tr106css';
    st.textContent=`.tr106{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline;margin:6px 0 2px;font-size:13px}.tr106 .tr106why{flex:1 1 220px;color:var(--ink,#e9dcc0);font-style:italic}
.tr106 .tr106wk{font:12px var(--mono,monospace);color:#cbb593;white-space:nowrap;border:1px solid #6b5236;border-radius:4px;padding:0 6px}.tr106 .tr106wk.up{color:#ffb0a0;border-color:#8a3a2a}.tr106 .tr106wk.dn{color:#a8e0a0;border-color:#3a6a3a}`;
    document.head.appendChild(st)})();
}
