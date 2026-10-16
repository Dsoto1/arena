/* =====================================================================
   348-V104SEASON · v1.04 THE SEASON'S SHAPE (builder A of the Manager season rework; tools/plans/v104/PLAN.md "A", his answers in
   tools/plans/v103/NOTES.md: A5, E8a, N2a, E2a, E4a + the Superbus playoffs 1a 2a 3a 4a; kill switch localStorage flavius_v104aoff=1; test tv104a)
   =====================================================================
   CALENDAR (A5): byes in weeks 4 and 12 (BYE_WKS), Rivalry Week in week 11 (77's RIVAL_WK, now a let; its lock + letter at week 10).
       Per career: w.cal104 = the first season on the new calendar. New careers start on it; a running career switches at its next
       season (SAVE_MIGRATIONS '1.04'; a career still in week 1 switches now). cal104Sync(w) sets BYE_WKS / RIVAL_WK for the loaded career
       (old seasons: byes 4 & 11, rivalry 12 and the old Superbus special) at every makeNight / endWeek / page draw.
   SUPERBUS PLAYOFFS (REPLACES 17's "top 4 seated in the Superbus final" — the finaleDue special of 22 is dropped for a new-calendar season):
       seeds 1–12 by league points (leagueSort, Sica excluded; an empty seat = an invited outsider). Week 12 = Round 1: seeds 5·8·9·12 and
       6·7·10·11, two Classic (Cassian) 4-player bouts; seeds 1–4 rest. Week 13 = two semifinals (1·4 + the two qualifiers of bout A, 2·3 + those
       of bout B). Week 14 = THE SUPERBUS FINAL (four houses). The top 2 by the event's own finishing order go on (his 1a). Each house sends ONE
       gladiator a round, chosen each round (2a: yours on the card's picker, rivals their best fit; no fit fighter = a free agent hired, −5 fame).
       Prizes grow each round survived (3a): reaching the semis +40 coin +2 fame (the four rested seeds too), the final +80 +4, the champion
       +250 +10, the Superbus Cup (seasonAwards' palm_roma), +20 fame on the gladiator. Playoff bouts are tier 'sb104' in w.night.bouts — played
       like any Match Week bout (fight / watch / simulate / bet; eliminated houses watch + bet, 4a); no league points (the table stays the seeding
       table), no fixing, no entering / withdrawing, no "sit the week out". Rivals play by the same rules.
       TIME: the three playoff weeks are FROZEN weeks at absolute week 11 (a season stays 12 calendar weeks, every %12 formula untouched).
       Ending a playoff week runs the whole endWeek chain for week 11 (wages, injuries, training, care, the Acta, the review), then rewinds
       w.week to 11, shifts injuries one week on and frees the once-a-week keys (…Wk, clocks, plans) so the next playoff week starts fresh.
       A house with no bout in a playoff week gets half its wages back from the Senate (59's bye rule).
       After the final the chain is let through to the real week 12 = THE OFF-SEASON WEEK. The season itself still ends with week 12's end.
   BRACKET VIEW: an overlay (#po104br) from the League banner, the Match Week banner and the playoff card; from week 9 it shows the projected
       seeds "if the season ended today", during the playoffs the real bracket with places and who went through.
   SUPERBUS WEEK END TO END (E8a): the playoff card is 345's regal .sb103c with the laurel banner and the Superbus Cup; the rail / banners say
       "Superbus · Round 1 / Semifinals" and "Superbus Week"; a letter when the playoffs open (your seed and path) and the entrants letter when
       the final is set; w.finale + w.sb103 feed 345's Superbus review box and Acta lead; the Flavian Awards follow the final; the off-season
       page opens with the podium.
   OFF-SEASON WEEK (N2a): no bouts (week 12 is a bye: cart, market day, +6 h, half wages from the Senate); Season in Review letter (who came and
       went, finances, record, titles, the fallen, grade band-ups, the playoff run); LEAGUE AWARDS (E2a) = Gladiator of the Year (the Aureus
       Gladius), Best Record (NEW titulus lg104rec "The Unbroken Tally", best win rate, 4+ bouts), Rookie of the Year (the Tiro Laurel), Most
       Feared (the Iron Thumb) — the existing Flavian trophies are reused, not doubled; coin/fame as trophies pay; they are Tituli (307 reads
       TROPHY_LIB). CONTRACT RENEWALS (E4a): fighters whose contract ends within 8 weeks ask a raise scaled by their record (+5…+40%); benched
       (≤2 bouts) unhappy (morale <45) fighters may ask to leave; answered on the off-season page; rivals answer at once. Recruiting stays open.
   HOOKS for the other v1.04 builders:
       OFF104.on(fn) → off()  fn(w, ctx) runs once when the off-season week opens (after the final), in subscription order, before the Season
                              in Review letter is written; ctx = {season, add(html)} (add puts a line in that letter's "Also this off-season").
       OFF104.active(w)       true while the off-season week is the current week.
       OFF104.phase(w)        'r1' | 'sf' | 'fin' | 'off' | '' — the playoff phase of the current week.
       OFF104.frozen(w)       true when the NEXT endWeek is a frozen week (w.week stays 11: the end of week 11, of Round 1, of the semifinals).
                              Those week ends still run every endWeek wrapper (a builder wrapping endWeek sees them as week ends with w.week 11).
       BUS 'season.offseason' {w, season} — emitted right after the OFF104.on handlers.
   ===================================================================== */
const V104A={on:(()=>{try{return localStorage.getItem('flavius_v104aoff')!=='1'}catch(e){return true}})(),F:11,proj:9,
  prize:{sf:40,fin:80,champ:250},fame:{sf:2,fin:4,champ:10},purse:{r1:70,sf:100,fin:150},inHold:false,hooks:[]};
TIERS.sb104={n:_T('Superbus'),ev:'cassian',purse:0,fee:0,lo:0,hi:99,fame:8};
if(typeof BOUT_DAY!=='undefined')BOUT_DAY.sb104=_T('Saturday');
/* Best Record — the one new league award (the other three reuse the Flavian trophies) */
TROPHY_LIB.push({id:'lg104rec',name:'The Unbroken Tally',desc:_T('Best Record: the best win rate of the season (4 bouts or more).'),shape:'shield',metal:'gold',base:'marble',topper:'laurel',gem:'#3a7fd0',ins:'TALLY',rewards:{coin:30,fame:3},cat:'season'});

/* ---------------- the calendar ---------------- */
const cal104New=(w,season)=>!!(V104A.on&&w&&!w.tutorial&&w.cal104!=null&&(season??w.season)>=w.cal104);
function cal104Sync(w){w=w||(typeof W_==='function'?W_():null);if(V104A.inHold)return;const nw=cal104New(w);
  const want=nw?[4,12]:[4,11];if(BYE_WKS.join()!==want.join())BYE_WKS.splice(0,BYE_WKS.length,...want);
  try{RIVAL_WK=nw?11:12}catch(e){}}
/* a career on an older save: the new calendar from its next season (now, if it is still in week 1) */
function cal104Init(w){if(!w||w.cal104!=null)return;w.cal104=wkOf(w.week)<=1?w.season:w.season+1}
SAVE_MIGRATIONS.push(['1.04',w=>{cal104Init(w)}]);
{const base=newWorld;newWorld=function(){const r=base.apply(this,arguments);try{const w=W_();if(w&&w.cal104==null){w.cal104=w.season;cal104Sync(w)}}catch(e){console.error(e)}return r}}

/* ---------------- the playoffs: state ---------------- */
const po104P=w=>w&&w.po104&&w.po104.s===w.season?w.po104:null;
const po104Ph=w=>{try{const n=w&&w.night;return n&&n.po104&&cal104New(w)&&po104P(w)?n.po104:''}catch(e){return ''}};
const po104Mid=k=>k&&k.startsWith('m:')?k.slice(2):null;
const po104M=k=>{const id=po104Mid(k);return id?mgrById(id):null};
const po104Mine=k=>{const m=po104M(k);return !!(m&&m.isPlayer)};
function po104Name(k){if(!k)return _T('an invited outsider');const m=po104M(k);if(m)return m.ludus;const g=gById(k.slice(2));return g?_T`${g.name} (invited)`:_T('an invited outsider')}
/* seeds 1–12 by league points; Sica and fallen houses are out; a missing seat stays null (an invited outsider fills it) */
function po104Seeds(w){const H=leagueSort(w.mgrs.filter(m=>!m.dead&&!m.sica)).slice(0,12).map(m=>'m:'+m.id);while(H.length<12)H.push(null);return H}
const PO104_R1=[[4,7,8,11],[5,6,9,10]];
function po104New(w){const seeds=po104Seeds(w);return {s:w.season,seeds,phase:'pre',r1:PO104_R1.map(ix=>({k:ix.map(i=>seeds[i]),adv:null,pl:null})),sf:null,fin:null,champ:null,paid:{},pick:{},ren:[],log:[]}}
/* the round a key reached: 'r1' (out in round 1), 'sf', 'fin', 'champ' */
function po104Reach(P,k){if(!P||!k)return '';if(P.champ===k)return 'champ';if(P.fin&&P.fin.k.includes(k))return 'fin';if(P.sf&&P.sf.some(x=>x.k.includes(k)))return 'sf';return P.seeds.includes(k)?'r1':''}

/* ---------------- picks ---------------- */
function po104Fit(w,m,g){if(!g||!g.alive||!g.contract||g.contract.mgr!==m.id||g.lanista||g.inj)return false;
  if(g.loanFrom&&g.loanFrom.mid===m.id&&g.contract.mgr!==m.id)return false;
  if(m.isPlayer&&typeof r101Block==='function'&&r101Block(g))return false;if(typeof inBed76==='function'&&inBed76(g))return false;return true}
const po104Fits=(w,m,used)=>rosterOf(m).filter(g=>po104Fit(w,m,g)&&!(used&&used.has(g.id))).sort((a,b)=>effOvr(b)-effOvr(a));
function po104Outsider(w){const g=genGlad({ovr:62+rnd(14)});g.inv=true;g.debut={s:w.season,wk:wkOf(w.week)};w.glads.push(g);return g}
/* the fighter a key sends this round */
function po104PickFor(w,P,k,used){
  if(!k||!k.startsWith('m:')){let g=k?gById(k.slice(2)):null;if(!g||!g.alive||g.inj||used.has(g.id))g=po104Outsider(w);used.add(g.id);return {k:'o:'+g.id,gid:g.id}}
  const m=po104M(k);if(!m||m.dead){const g=po104Outsider(w);used.add(g.id);return {k:'o:'+g.id,gid:g.id}}
  const el=po104Fits(w,m,used);const want=m.isPlayer&&P.pick[k]?el.find(g=>g.id===P.pick[k]):null;let g=want||el[0];
  if(!g){g=freeAgents().filter(x=>!x.inj&&!used.has(x.id)).sort((a,b)=>effOvr(b)-effOvr(a))[0]||po104Outsider(w);m.fame=Math.max(0,(m.fame||0)-5);g.po104hire=m.id;
    if(typeof mnews==='function')mnews(_T`${esc(m.ludus)} has no fit fighter for the Superbus: the editor hires ${esc(g.name)} for the house (−5 fame).`,m.isPlayer?'bad':'')}
  used.add(g.id);return {k,gid:g.id}}
function po104Bout(w,P,r,i,keys,used){const picks=keys.map(k=>po104PickFor(w,P,k,used));
  return {tier:'sb104',ev:'cassian',purse:V104A.purse[r]||100,special:false,fee:0,ents:picks.map(p=>p.gid),done:false,res:null,bets:[],po104:{r,i,k:picks.map(p=>p.k)}}}
/* the playoff week's card replaces the throwaway league night the chain just built */
function po104Night(w,P,r){const n=w.night||{};const pool=new Set();
  /* an empty seat becomes an invited outsider: its key ('o:<gid>') is written back into the bracket */
  const rd=r==='fin'?[P.fin]:P[r];const B=rd.map((x,i)=>{const b=po104Bout(w,P,r,i,x.k,pool);x.k=b.po104.k;return b});
  const loc=LOCATIONS[6]?6:(n.loc||1);
  /* only the omen survives from the throwaway night (no moved games, specials, rivalry or road deals) */
  w.night={week:w.week,loc,grand:false,bouts:B,po104:r,omen:n.omen||{k:'clear',n:'',att:0},world:[],wAtt:0,wx:null,travel:{cost:0,paid:true,offer:null,deal:null,from:(LOCATIONS[loc]||{}).n||'',po104:1},
    fx:{...(n.fx||{}),ev:'cassian',loc,wk:wkOf(w.week)},used:[...pool]};
  P.pick={}}

/* ---------------- results ---------------- */
/* a playoff bout's finishing order as keys (the event's own ranking: 17's place) */
function po104Order(b){if(!b||!b.res||!b.res.rows)return null;const k=b.po104.k;
  return [...b.res.rows].sort((x,y)=>(x.place||99)-(y.place||99)).map(r=>{const j=b.ents.indexOf(r.gid);return j>=0?{k:k[j],gid:r.gid,place:r.place,f:r.f||0,alive:r.alive!==false}:null}).filter(Boolean)}
const po104Top2=b=>{const o=po104Order(b);return o?o.slice(0,2).map(x=>x.k):null};
function po104Pay(w,k,coin,fame,why){const m=po104M(k);if(!m)return;m.coin+=coin;m.fame=clamp((m.fame||0)+fame,0,100);
  if(m.isPlayer&&typeof tnews==='function')tnews(_T`🏛 ${why}: ${coinAmt87('+'+coin)}, +${fame} fame.`,'big')}
/* the round that just ended: who goes on (pure; pays once) */
function po104Settle(w,P,r,pay){const n=w.night;
  if(pay)return po104PayRound(w,P,r);
  if(r==='r1'){P.r1.forEach((x,i)=>{const b=n.bouts.find(b=>b.po104&&b.po104.r==='r1'&&b.po104.i===i);x.adv=po104Top2(b)||x.k.slice(0,2);x.pl=po104Order(b)});
    P.sf=[0,1].map(i=>({k:[P.seeds[i===0?0:1],P.seeds[i===0?3:2],...P.r1[i].adv],adv:null,pl:null}))}
  else if(r==='sf'){P.sf.forEach((x,i)=>{const b=n.bouts.find(b=>b.po104&&b.po104.r==='sf'&&b.po104.i===i);x.adv=po104Top2(b)||x.k.slice(0,2);x.pl=po104Order(b)});
    P.fin={k:[...P.sf[0].adv,...P.sf[1].adv],pl:null}}
  else if(r==='fin'){const b=n.bouts.find(b=>b.po104&&b.po104.r==='fin');const o=po104Order(b)||P.fin.k.map(k=>({k,gid:null,place:0,f:0}));P.fin.pl=o;P.champ=o[0].k;P.champG=o[0].gid||null;
    const cg=gById(o[0].gid);const cm=po104M(P.champ);
    w.finale={season:P.s,kind:'the Flavius Superbus',names:o.map(x=>(gById(x.gid)||{}).name||'?'),champ:cg?cg.name:null,champLudus:cm?cm.ludus:null,f:o[0].f||0,turns:b&&b.res?b.res.turns||0:0,cupGiven:false,po104:1};
    const pm=me();w.sb103={season:P.s,wk:w.week,champ:w.finale.champ,champLudus:w.finale.champLudus,f:w.finale.f,turns:w.finale.turns,mineWon:po104Mine(P.champ),
      ents:o.map(x=>{const g=gById(x.gid);const m=po104M(x.k);return {n:g?g.name:'?',l:m?m.ludus:'',mine:!!(m&&m.isPlayer),gid:x.gid}}),purse:V104A.prize.champ,fame:V104A.fame.champ,ludus:pm?pm.ludus:''}}}
/* the prizes of the round that ended (once; after the week's chain went through) */
function po104PayRound(w,P,r){
  if(r==='r1'&&P.sf&&!P.paid.r1){P.paid.r1=1;for(const x of P.sf)for(const k of x.k)po104Pay(w,k,V104A.prize.sf,V104A.fame.sf,_T('Into the Superbus semifinals'))}
  if(r==='sf'&&P.fin&&!P.paid.sf){P.paid.sf=1;for(const k of P.fin.k)po104Pay(w,k,V104A.prize.fin,V104A.fame.fin,_T('Into the Superbus final'))}
  if(r==='fin'&&P.champ&&!P.paid.fin){const cg=P.champG?gById(P.champG):null;const cm=po104M(P.champ);P.paid.fin=1;po104Pay(w,P.champ,V104A.prize.champ,V104A.fame.champ,_T('Champions of the Flavius Superbus'));
      if(cg){cg.fame=clamp((cg.fame||0)+20,0,100);if(typeof ghist==='function')ghist(cg,_T`won the Flavius Superbus of season ${P.s} in Roma (${cfAmt87(w.finale.f)})`)}
      (w.specialLog=w.specialLog||[]).push({n:'The Flavius Superbus',season:P.s,champ:w.finale.champ,mine:po104Mine(P.champ)});
      if(typeof mnews==='function')mnews(_T`🏆 <b>${esc(w.finale.champ||'?')}</b>${cm?_T` of ${esc(cm.ludus)}`:''} wins <b>the Flavius Superbus</b> before a roaring Roma (${cfAmt87(w.finale.f)}).`,'big')}}

/* ---------------- the frozen weeks ---------------- */
const PO104_SCAL=/Wk$/,PO104_SC2=['raise87','buyRefused','freeAsked','lu2c'],PO104_OBJ=['cart','cityAuction','ckSkip','clk87','growth95','lp96','medc76','pitchN','rh98','sicaBribe','syndSpear','tplan'];
/* after a frozen week's chain: back to week 11, injuries a week on, this week's once-a-week marks freed */
function po104Rewind(w){const F=w.week-1;w.week=F;const old=F;
  const sc=o=>{if(!o)return;for(const k of Object.keys(o)){const v=o[k];if(v===old&&(PO104_SCAL.test(k)||PO104_SC2.includes(k)))o[k]=old-1}};
  sc(w);for(const m of w.mgrs||[])sc(m);
  for(const k of PO104_OBJ){const o=w[k];if(o&&typeof o==='object'&&o.wk===old)o.wk=old-1}
  for(const g of w.glads||[]){sc(g);for(const k of ['rg102','st87','gain87'])if(g[k]&&typeof g[k]==='object'&&g[k].wk===old)g[k].wk=old-1;
    if(g.inj){if((g.inj.until||0)>old)g.inj.until--;if(g.inj.bk102&&g.inj.bk102.wk===old)g.inj.bk102.wk=old-1}
    if(g.pledge&&(g.pledge.due||0)>old)g.pledge.due--}
  w.hours=typeof hoursMax==='function'?hoursMax():w.hours}
/* what the next endWeek is: 'r1' (end of week 11 → round 1), 'sf', 'fin', 'off' (after the final), 'end' (the off-season ends the season), '' (a normal week) */
function po104Next(w){if(!cal104New(w)||!w.night||w.dead)return '';const ph=po104Ph(w);if(ph)return {r1:'sf',sf:'fin',fin:'off',off:'end'}[ph];
  const P=po104P(w);if(wkOf(w.week)===V104A.F&&!(P&&P.phase!=='pre'))return 'r1';return ''}
{const base=endWeek;endWeek=async function(){const w=W_();
  if(!w||w.tutorial||!V104A.on)return base.apply(this,arguments);cal104Sync(w);const nx=po104Next(w);
  if(!nx)return base.apply(this,arguments);
  const n=w.night;if(n.bouts.some(b=>!b.done)||(w.pend||[]).length||(w.special&&!w.special.done))return base.apply(this,arguments);
  if(nx==='end'){const P=po104P(w);po104Lapse(w,P);const mn=window.mnews,tn=window.tnews;const drop=s=>/^🏛/.test(String(s||''))&&/Superbus/.test(String(s));
    try{if(typeof mnews==='function')mnews=function(s){if(drop(s))return;return mn.apply(this,arguments)};if(typeof tnews==='function')tnews=function(s){if(drop(s))return;return tn.apply(this,arguments)}}catch(e){}
    let r;try{r=await base.apply(this,arguments)}finally{try{mnews=mn;tnews=tn}catch(e){}}
    try{if(r!==false&&P){P.phase='done';if(w.finaleDue&&w.finaleDue.season===P.s)delete w.finaleDue}cal104Sync(w)}catch(e){console.error(e)}return r}
  let P=po104P(w);if(nx==='r1'&&!P){P=w.po104=po104New(w)}if(!P)return base.apply(this,arguments);
  const ending=n.po104||'';
  try{if(ending)po104Settle(w,P,ending,false)}catch(e){console.error(e)}
  const save=[...BYE_WKS];V104A.inHold=true;if(nx!=='off')BYE_WKS.splice(0,BYE_WKS.length,...save.filter(x=>x!==12));
  let r;try{r=await base.apply(this,arguments)}finally{V104A.inHold=false;BYE_WKS.splice(0,BYE_WKS.length,...save)}
  if(r===false)return r;
  try{if(ending)po104Settle(w,P,ending,true);
    /* 59's bye rule: a house with no bout this playoff week gets half its wages back from the Senate */
    if(ending){const inB=new Set(n.bouts.flatMap(b=>b.po104?b.po104.k:[]));for(const m of w.mgrs.filter(x=>!x.dead&&!inB.has('m:'+x.id))){const back=Math.round(rosterOf(m).reduce((a,g)=>a+(g.contract?g.contract.wage:0),0)/2);if(!back)continue;m.coin+=back;
      if(m.isPlayer&&typeof tnews==='function')tnews(_T`🏛 No Superbus bout for your house this week: the Senate pays half your wages, ${coinAmt87('+'+back)}.`)}}
    if(w.review){w.review.po104=ending||'r11';w.review.po104s=P.s}
    if(nx==='off'){po104OffStart(w,P)}
    else{po104Rewind(w);po104Night(w,P,nx);P.phase=nx;po104Letter(w,P,nx)}
    saveWorld()}catch(e){console.error(e)}
  return r}}
/* no invitations, billings or old Superbus inside a frozen week; the old special never opens for a playoff season */
{const base=specWeekStart;specWeekStart=function(world){try{if(V104A.inHold)return;const fd=world&&world.finaleDue;if(fd&&world.po104&&world.po104.s===fd.season&&V104A.on)delete world.finaleDue}catch(e){console.error(e)}return base.apply(this,arguments)}}
{const base=makeNight;makeNight=function(){try{cal104Sync(W_())}catch(e){}const r=base.apply(this,arguments);try{const w=W_();if(w&&!w.tutorial&&cal104New(w)&&!V104A.inHold&&(!w.sr104||w.sr104.s!==w.season))po104Snap(w)}catch(e){console.error(e)}return r}}
if(typeof calLag==='function'){const base=calLag;calLag=function(){try{const w=W_();const ph=po104Ph(w);if(ph&&ph!=='off')return 0}catch(e){}return base.apply(this,arguments)}}
/* playoff bouts: no league points (the table is the seeding table), no fixing, nobody enters or withdraws, no sitting it out */
{const base=leaguePtsAfterBout;leaguePtsAfterBout=function(bout){if(!(bout&&bout.po104))return base.apply(this,arguments);const w=W_();
  const keep=w.mgrs.map(m=>[m,JSON.stringify(msp(m))]);const r=base.apply(this,arguments);for(const [m,s] of keep)m.spS[w.season]=JSON.parse(s);return r}}
{const base=boutRiggable;boutRiggable=function(b){if(b&&b.po104)return false;return base.apply(this,arguments)}}
if(typeof st95Fill==='function'){const base=st95Fill;st95Fill=function(w){try{if(po104Ph(w||W_()))return 0}catch(e){}return base.apply(this,arguments)}}
if(typeof sbyeOK76==='function'){const base=sbyeOK76;sbyeOK76=function(w){try{if(po104Ph(w||W_()))return [false,_T('Not in the Superbus playoffs')]}catch(e){}return base.apply(this,arguments)}}
const po104Why=()=>_T('🏛 The Superbus card is set by the playoffs: each house sends one gladiator a round — choose yours on the Superbus card.');
window.addEventListener('click',e=>{try{const b=e.target&&e.target.closest&&e.target.closest('[data-mg="enter"],[data-mg="withdraw"],[data-mg="rig"]');if(!b)return;const w=W_();if(!po104Ph(w))return;
  e.preventDefault();e.stopImmediatePropagation();if(typeof mToast==='function')mToast(po104Why())}catch(err){}},true);

/* ---------------- your pick ---------------- */
function po104MyBout(w){const n=w.night;const pm=me();const k='m:'+pm.id;const i=(n.bouts||[]).findIndex(b=>b.po104&&b.po104.k.includes(k));return i<0?null:{bi:i,b:n.bouts[i],j:n.bouts[i].po104.k.indexOf(k),k}}
document.addEventListener('change',e=>{const s=e.target&&e.target.closest&&e.target.closest('[data-po104pick]');if(!s)return;try{const w=W_();const M=po104MyBout(w);if(!M||M.b.done)return;const g=gById(s.value);const pm=me();
  if(!g||!po104Fit(w,pm,g)||w.night.bouts.some((b,i)=>i!==M.bi&&b.ents.includes(g.id))){if(typeof mToast==='function')mToast(_T('That fighter cannot go this round.'));return}
  if(typeof voidBets==='function')voidBets(M.b,M.b.ents[M.j]);M.b.ents[M.j]=g.id;const P=po104P(w);if(P)P.pick[M.k]=g.id;saveWorld();
  if(typeof mToast==='function')mToast(_T`${g.name} will fight for the house in the Superbus.`);if(typeof MGR_REDRAW==='function')MGR_REDRAW()}catch(err){console.error(err)}});

/* ---------------- letters ---------------- */
const PO104_RN=()=>({r1:_T('Round 1'),sf:_T('the semifinals'),fin:_T('the Superbus final')});
function po104Letter(w,P,r){const pm=me();const k='m:'+pm.id;const seed=P.seeds.indexOf(k)+1;const reach=po104Reach(P,k);
  if(r==='r1'){const path=seed>=1&&seed<=4?_T`Seed #${seed}: your house rests in week 12 and waits in the semifinals.`:seed?_T`Seed #${seed}: Round 1 this week — finish in the top 2 of your bout to reach the semifinals.`:_T('Your house did not make the twelve. Watch the rounds and bet on them.');
    sendLetter(w,{key:'po104-r1-'+P.s,kind:'letter',from:_T('the Consilium'),seal:'🏛',title:_T('The Superbus playoffs begin'),
      body:`<p>${_T`The regular season is over. Twelve houses by league points play for the Flavius Superbus: seeds 5–12 in Round 1, seeds 1–4 rest a week.`}</p><p><b>${path}</b></p><p class="rc-sub">${_T`Each house sends one gladiator a round. Prizes: semifinal ${coinAmt87('+'+V104A.prize.sf)}, final ${coinAmt87('+'+V104A.prize.fin)}, champion ${coinAmt87('+'+V104A.prize.champ)} and the Superbus Cup.`}</p><div class="acts"><button class="btn tksm" type="button" data-po104="bracket">${_T`🏛 The bracket`}</button></div>`});
    if(typeof mnews==='function')mnews(_T`🏛 <b>The Superbus playoffs begin.</b> Seeds 1–4 rest: ${P.seeds.slice(0,4).map(x=>esc(po104Name(x))).join(', ')}.`,'big')}
  else if(r==='fin'){const names=P.fin.k.map(x=>esc(po104Name(x)));
    sendLetter(w,{key:'po104-fin-'+P.s,kind:'letter',from:_T('Flavius'),seal:'🏆',title:_T('Superbus Week: the finalists'),
      body:`<p>${_T`The four houses of the Flavius Superbus final in Roma: <b>${names.join(' · ')}</b>.`}</p><p>${reach==='fin'?_T('<b>Your house is in the final.</b> Choose your champion on the Superbus card.'):_T('Your house is out. Watch the final and bet on it.')}</p><div class="acts"><button class="btn tksm" type="button" data-mg="tab" data-id="night">${_T`🏛 To Superbus Week`}</button></div>`});
    if(typeof mnews==='function')mnews(_T`🏆 <b>Superbus Week.</b> The final in Roma: ${names.join(', ')}.`,'big')}
  else if(r==='sf'&&typeof mnews==='function')mnews(_T`🏛 The Superbus semifinals: ${P.sf.map(x=>x.k.map(y=>esc(po104Name(y))).join(', ')).join(' · ')}.`,'big')}

/* ---------------- the off-season week ---------------- */
function po104Snap(w){const pm=me();if(!pm)return;w.sr104={s:w.season,ids:rosterOf(pm).map(g=>g.id),coin:pm.coin,fame:pm.fame||0,wins:pm.wins||0,bouts:pm.bouts||0}}
const OFF104={on(fn){if(typeof fn!=='function')return ()=>{};V104A.hooks.push(fn);return ()=>{const i=V104A.hooks.indexOf(fn);if(i>=0)V104A.hooks.splice(i,1)}},
  active(w){w=w||(typeof W_==='function'?W_():null);return po104Ph(w)==='off'},phase(w){return po104Ph(w||(typeof W_==='function'?W_():null))},
  frozen(w){w=w||(typeof W_==='function'?W_():null);const x=po104Next(w);return !!x&&x!=='off'&&x!=='end'}};
function po104OffStart(w,P){const n=w.night;n.po104='off';P.phase='off';
  /* the Flavian Awards (the league's four headline awards among them) */
  try{if(typeof seasonAwards==='function')seasonAwards(w,P.s)}catch(e){console.error(e)}
  /* contract renewals */
  try{po104Renewals(w,P)}catch(e){console.error(e)}
  /* the other builders' off-season work */
  const lines=[];const ctx={season:P.s,add(h){if(h)lines.push(String(h))}};
  for(const fn of [...V104A.hooks]){try{fn(w,ctx)}catch(e){console.error(e);try{err92Add('caught','off104: '+(e&&e.message||e),'')}catch(x){}}}
  try{if(typeof BUS!=='undefined')BUS.emit('season.offseason',{w,season:P.s})}catch(e){}
  P.extra=lines;
  try{const R=po104Review(w,P);P.rev=R;sendLetter(w,{key:'sr104-'+P.s,kind:'letter',from:_T('the Clerk'),seal:'📜',title:_T`Season ${P.s} in review`,body:po104RevHTML(R,true)})}catch(e){console.error(e)}
  if(typeof mnews==='function')mnews(_T`🌿 <b>The off-season.</b> No bouts this week: contracts, awards and recruiting before season ${P.s+1}.`,'big')}
function po104Review(w,P){const pm=me();const S=w.sr104&&w.sr104.s===P.s?w.sr104:{ids:rosterOf(pm).map(g=>g.id),coin:pm.coin,fame:pm.fame||0,wins:pm.wins||0,bouts:pm.bouts||0};
  const now=rosterOf(pm).map(g=>g.id);const came=now.filter(id=>!S.ids.includes(id)).map(gById).filter(Boolean).map(g=>g.name);
  const went=S.ids.filter(id=>!now.includes(id)).map(id=>{const g=gById(id);if(!g)return null;const m2=g.contract?mgrById(g.contract.mgr):null;
    const why=!g.alive?(g.freed2?_T('freed'):g.retired?_T('retired'):_T('fell')):m2?_T`to ${m2.ludus}`:_T('left');return `${g.name} (${why})`}).filter(Boolean);
  const sp=msp(pm,P.s);const tit=(w.trophies||[]).flatMap(t=>(t.hist||[]).filter(h=>h.season===P.s).map(()=>t.name));
  const fallen=(w.grave||[]).filter(x=>x.s===P.s&&x.mgr===pm.name).map(x=>x.name);
  const bands=rosterOf(pm).filter(g=>g.ss&&g.ss.s===P.s&&g.ss.o0!=null&&typeof trait96Grade==='function'&&trait96Grade(g.ovr)!==trait96Grade(g.ss.o0)&&g.ovr>g.ss.o0).map(g=>`${g.name} ${trait96Grade(g.ss.o0)} → ${trait96Grade(g.ovr)}`);
  const k='m:'+pm.id;const reach=po104Reach(P,k);const seed=P.seeds.indexOf(k)+1;
  const run=!seed?_T('did not make the playoffs'):reach==='champ'?_T('won the Flavius Superbus'):reach==='fin'?_T`reached the final (place ${((P.fin.pl||[]).findIndex(x=>x.k===k)+1)||'?'})`:reach==='sf'?_T('went out in the semifinals'):_T('went out in Round 1');
  const aw=(w.awardShow&&w.awardShow.season===P.s?w.awardShow.awards:[]);const L=PO104_AW().map(([tid,lbl])=>{const a=aw.find(x=>x.tid===tid);return {lbl,who:a?(a.gname||a.mname):null,ludus:a?a.ludus:'',stat:a?a.stat:'',mine:!!(a&&a.mine)}});
  return {season:P.s,came,went,coin:pm.coin-S.coin,fame:(pm.fame||0)-S.fame,rec:typeof lp102Txt==='function'?lp102Txt(sp):'',pts:sp.pts||0,wins:(pm.wins||0)-S.wins,bouts:(pm.bouts||0)-S.bouts,tit,fallen,bands,seed,run,aw:L,extra:P.extra||[]}}
const PO104_AW=()=>[['aureus',_T('Gladiator of the Year')],['lg104rec',_T('Best Record')],['tiro',_T('Rookie of the Year')],['iron_thumb',_T('Most Feared')]];
function po104RevHTML(R,letter){const li=(t,v)=>`<li><b>${t}</b> ${v}</li>`;const none=_T('none');
  return `<ul class="po104rv">${li(_T('Record:'),_T`${R.wins}–${Math.max(0,R.bouts-R.wins)} · ${R.pts} pts · ${R.rec}`)}${li(_T('Playoffs:'),R.seed?_T`seed #${R.seed}, ${R.run}`:R.run)}
    ${li(_T('Treasury:'),`${R.coin>=0?'+':''}${R.coin} · ${_T`fame ${R.fame>=0?'+':''}${R.fame}`}`)}${li(_T('Came:'),R.came.length?R.came.map(esc).join(', '):none)}${li(_T('Went:'),R.went.length?R.went.map(esc).join(', '):none)}
    ${li(_T('Titles:'),R.tit.length?R.tit.map(esc).join(', '):none)}${li(_T('The fallen:'),R.fallen.length?R.fallen.map(esc).join(', '):none)}${li(_T('Grade band-ups:'),R.bands.length?R.bands.map(esc).join(', '):none)}
    ${li(_T('League awards:'),R.aw.map(a=>`${a.lbl} — ${a.who?esc(a.who)+(a.ludus?` (${esc(a.ludus)})`:''):_T('not given')}`).join(' · '))}
    ${R.extra.length?li(_T('Also this off-season:'),R.extra.join(' · ')):''}</ul>${letter?`<div class="acts"><button class="btn tksm" type="button" data-mg="tab" data-id="night">${_T`🌿 The off-season`}</button></div>`:''}`}
/* Best Record joins the Flavian Awards (the other three league awards are the Aureus Gladius, the Tiro Laurel and the Iron Thumb) */
{const base=seasonAwards;seasonAwards=function(world,season){const r=base.apply(this,arguments);try{season=season??world.season;if(!V104A.on||!cal104New(world,season)||!world.awardShow)return r;
  const G=world.glads.filter(g=>g.ss&&g.ss.s===season&&g.ss.ev>=4).sort((a,b)=>(b.ss.w/b.ss.ev-a.ss.w/a.ss.ev)||(b.ss.w-a.ss.w)||((b.fame||0)-(a.fame||0)));const g=G[0];
  if(g&&g.ss.w){const m=g.contract?mgrById(g.contract.mgr):null;const d=trophyDef('lg104rec');const a={tid:'lg104rec',name:d.name,cat:'season',desc:d.desc,gid:g.id,gname:g.name,mid:m?m.id:null,mname:m?m.name:null,ludus:m?m.ludus:_T('free agent'),mine:!!(m&&m.isPlayer),stat:_T`${g.ss.w}–${g.ss.ev-g.ss.w} (${Math.round(100*g.ss.w/g.ss.ev)}%)`};
    const A=world.awardShow.awards;const at=Math.max(0,A.findIndex(x=>x.tid==='tiro'));A.splice(at,0,a);
    if(a.mine){const e=earnTrophy(world,'lg104rec',{why:`${a.desc} (${a.stat})`,who:g.name,gid:g.id});if(e)a.eid=e.id}else if(m&&typeof mTrophy==='function')mTrophy(m,'lg104rec',{who:g.name,why:`${a.desc} (${a.stat})`});
    const H=(world.awardHist||[]).find(x=>x.season===season);if(H)H.awards.push({name:a.name,cat:a.cat,who:a.gname,ludus:a.ludus,mine:a.mine,stat:a.stat})}}catch(e){console.error(e)}return r}}
/* E4a contract renewals */
function po104Renewals(w,P){P.ren=[];
  for(const m of w.mgrs.filter(x=>!x.dead))for(const g of rosterOf(m)){if(g.lanista||(g.loanFrom&&g.contract.mgr!==m.id))continue;const ss=g.ss&&g.ss.s===P.s?g.ss:{ev:0,w:0};
    if((g.contract.weeks||0)<=8){const rate=ss.ev>=2?ss.w/ss.ev:0;const pct=ss.ev>=2?Math.round(5+35*rate):5;const wage=Math.ceil(Math.max(g.contract.wage||0,askWage(g))*(1+pct/100));
      if(m.isPlayer)P.ren.push({gid:g.id,kind:'raise',old:g.contract.wage,wage,pct,weeks:12,st:null});
      else if(m.coin>=wage*8){g.contract.wage=wage;g.contract.weeks=Math.max(0,g.contract.weeks)+12;g.contract.expired=0}}
    else if((ss.ev||0)<=2&&(g.morale||50)<45&&Math.random()<.6){if(m.isPlayer)P.ren.push({gid:g.id,kind:'leave',st:null});
      else if(Math.random()<.5){g.contract=null;g.interest=g.interest||{};g.interest[m.id]=15;if(typeof ghist==='function')ghist(g,_T`left ${m.ludus} in the off-season`)}}}
  if(P.ren.length&&typeof tnews==='function')tnews(_T`📜 ${P.ren.length} contract ask${P.ren.length===1?'':'s'} wait on the off-season page.`,'big')}
function po104Answer(w,P,gid,yes){const R=(P.ren||[]).find(x=>x.gid===gid&&!x.st);const g=gById(gid);const pm=me();if(!R||!g||!g.contract||g.contract.mgr!==pm.id)return false;R.st=yes?'yes':'no';
  if(R.kind==='raise'){if(yes){g.contract.wage=R.wage;g.contract.weeks=Math.max(0,g.contract.weeks)+R.weeks;g.contract.expired=0;g.morale=clamp((g.morale||50)+6,0,100);tnews(_T`✍ ${esc(g.name)} signs on: ${R.wage} a week for ${R.weeks} more weeks.`)}
    else{g.morale=clamp((g.morale||50)-8,0,100);tnews(_T`${esc(g.name)} keeps the old terms and will walk when the contract ends.`,'bad')}}
  else{if(yes){if(typeof ghist==='function')ghist(g,_T`left ${pm.ludus} in the off-season`);g.contract=null;g.interest=g.interest||{};g.interest[pm.id]=20;tnews(_T`${esc(g.name)} leaves the house.`)}
    else{g.morale=clamp((g.morale||50)-10,0,100);tnews(_T`${esc(g.name)} stays — and sulks (−10 morale).`,'bad')}}
  return true}
/* unanswered asks at the off-season's end: raises lapse (old terms), leave asks stay and sulk */
function po104Lapse(w,P){if(!P)return;for(const R of P.ren||[])if(!R.st){R.st='lapsed';const g=gById(R.gid);if(g&&R.kind==='leave')g.morale=clamp((g.morale||50)-6,0,100)}}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-po104]');if(!b)return;const w=W_();if(!w)return;const a=b.dataset.po104;
  if(a==='bracket'){e.preventDefault();po104Open();return}
  if(a==='close'){e.preventDefault();po104Close();return}
  if(a.startsWith('ren|')){e.preventDefault();const [,gid,v]=a.split('|');const P=po104P(w);if(P&&po104Answer(w,P,gid,v==='y')){saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()}}});

/* ---------------- the bracket ---------------- */
function po104Live(w,P,r,i){const n=w.night;const b=n&&n.bouts&&n.bouts.find(b=>b.po104&&b.po104.r===r&&b.po104.i===i);return b&&b.done?po104Order(b):null}
function po104BracketHTML(w,compact){const P0=po104P(w);const proj=!P0||P0.phase==='pre';const P=proj?po104New(w):P0;const pm=me();const mk='m:'+pm.id;
  const seedOf=k=>P.seeds.indexOf(k)+1;
  const row=(k,o)=>{o=o||{};const s=k?seedOf(k):0;const m=po104M(k);const mine=m&&m.isPlayer;const pl=o.pl&&k?o.pl.find(x=>x.k===k):null;
    const st=o.adv?(o.adv.includes(k)?' adv':' out'):'';
    return `<div class="po104e${mine?' me':''}${st}"><span class="sd">${s?'#'+s:''}</span><b>${k?esc(po104Name(k)):_T('an invited outsider')}</b>${pl?`<small>${_T`${esc((gById(pl.gid)||{}).name||'')} · ${RN(pl.place||0)}`}</small>`:''}${st===' adv'?'<i>✓</i>':''}</div>`};
  const ph=(t)=>`<div class="po104e ph"><b>${t}</b></div>`;
  const box=(t,keys,o,phs)=>`<div class="po104b"><div class="po104bt">${t}</div>${keys?keys.map(k=>row(k,o)).join(''):''}${(phs||[]).map(ph).join('')}</div>`;
  const r1=P.r1.map((x,i)=>box(_T`Round 1 · ${i?'B':'A'}`,x.k,{adv:x.adv||null,pl:x.pl||po104Live(w,P,'r1',i)}));
  const bye=box(_T('Rest week · seeds 1–4'),P.seeds.slice(0,4),{});
  const sf=[0,1].map(i=>P.sf?box(_T`Semifinal · ${i?'B':'A'}`,P.sf[i].k,{adv:P.sf[i].adv||null,pl:P.sf[i].pl||po104Live(w,P,'sf',i)})
    :box(_T`Semifinal · ${i?'B':'A'}`,[P.seeds[i?1:0],P.seeds[i?2:3]],{},[_T`Round 1 · ${i?'B':'A'} · 1st`,_T`Round 1 · ${i?'B':'A'} · 2nd`]));
  const fpl=P.fin?(P.fin.pl||po104Live(w,P,'fin',0)):null;
  const fin=P.fin?box(_T('The Superbus final'),P.fin.k,{adv:P.champ?[P.champ]:null,pl:fpl}):box(_T('The Superbus final'),null,{},[_T('Semifinal A · top 2'),_T('Semifinal B · top 2')]);
  const champ=P.champ?`<div class="po104ch">${typeof trophySVG==='function'?trophySVG(trophyDef('palm_roma')||{},compact?46:64):''}<b>${esc(po104Name(P.champ))}</b><small>${esc((w.finale&&w.finale.season===P.s&&w.finale.champ)||'')}</small></div>`
    :`<div class="po104ch dim">${typeof trophySVG==='function'?trophySVG(trophyDef('palm_roma')||{},compact?46:64):''}<b>${_T('The Superbus Cup')}</b><small>${_T`champion: ${coinAmt87('+'+V104A.prize.champ)}`}</small></div>`;
  const s=seedOf(mk);
  const head=proj?`<p class="po104pj">${_T`<b>If the season ended today</b> — projected seeds from the league table (week ${wkOf(w.week)} of 12).`} ${s?(s<=4?_T`You: #${s}, a rest week.`:_T`You: #${s}, Round 1.`):_T('You: outside the twelve.')}</p>`
    :`<p class="po104pj">${s?_T`Your house: seed #${s}.`:_T('Your house is not in the playoffs.')} ${_T`Prizes: semifinal ${coinAmt87('+'+V104A.prize.sf)} · final ${coinAmt87('+'+V104A.prize.fin)} · champion ${coinAmt87('+'+V104A.prize.champ)}.`}</p>`;
  return `<div class="po104bk${compact?' cmp':''}" data-po104proj="${proj?1:0}">${head}<div class="po104cols"><div class="po104c"><div class="po104ch2">${_T('Week 12')}</div>${r1.join('')}${bye}</div><div class="po104c"><div class="po104ch2">${_T('Week 13')}</div>${sf.join('')}</div><div class="po104c"><div class="po104ch2">${_T('Week 14')}</div>${fin}${champ}</div></div></div>`}
function po104Open(){const w=W_();if(!w)return;po104Close();const d=document.createElement('div');d.id='po104br';d.className='po104ov';
  d.innerHTML=`<div class="po104box" role="dialog" aria-label="${esc(_T('The Superbus bracket'))}"><div class="po104hd"><b>${_T`🏛 The Flavius Superbus · season ${w.season}`}</b><button type="button" class="po104x" data-po104="close" aria-label="${esc(_T('Close'))}">✕</button></div>${po104BracketHTML(w,false)}</div>`;
  d.addEventListener('click',e=>{if(e.target===d)po104Close()});document.body.appendChild(d)}
function po104Close(){const d=document.getElementById('po104br');if(d)d.remove()}
const po104BrOK=w=>!!(w&&cal104New(w)&&!w.dead&&(po104Ph(w)||(wkOf(w.week)>=V104A.proj&&!po104P(w))));

/* ---------------- the pages ---------------- */
const PO104_PH=()=>({r1:_T('Superbus · Round 1'),sf:_T('Superbus · Semifinals'),fin:_T('Superbus Week'),off:_T('Off-season')});
const PO104_WK={r1:12,sf:13,fin:14};
function po104CardHTML(w){const P=po104P(w);const r=w.night.po104;const pm=me();const mk='m:'+pm.id;const M=po104MyBout(w);const reach=po104Reach(P,mk);const lau=typeof lau103==='function'?lau103:()=> '';
  const title={r1:_T('SUPERBUS · ROUND 1'),sf:_T('SUPERBUS · SEMIFINALS'),fin:_T('SUPERBUS WEEK')}[r];
  let you='';
  if(M){const b=M.b;const g=gById(b.ents[M.j]);const el=po104Fits(w,pm,new Set(w.night.bouts.flatMap((x,i)=>i===M.bi?[]:x.ents)));
    you=b.done?`<p>${_T`Your gladiator <b>${esc(g?g.name:'?')}</b> has fought.`}</p>`
      :`<div class="po104pk"><label>${_T`Your gladiator for ${r==='fin'?_T('the final'):r==='sf'?_T('the semifinal'):_T('Round 1')}:`} <select class="tin" data-po104pick>${el.map(x=>`<option value="${x.id}" ${x.id===b.ents[M.j]?'selected':''}>${esc(x.name)} · ${CLASSES[x.cls]?CLASSES[x.cls].name:''} · ${effOvr(x)}</option>`).join('')}${g&&!el.includes(g)?`<option value="${g.id}" selected>${esc(g.name)}</option>`:''}</select></label><span class="rc-sub">${_T('One gladiator a round — chosen again each round.')}</span></div>`}
  else{const seed=P.seeds.indexOf(mk)+1;you=`<p>${!seed?_T('Your house is not in the playoffs — watch the bouts and bet on them.'):r==='r1'&&seed<=4?_T`Seed #${seed}: your house rests this week and waits in the semifinals.`:_T('Your house is out of the Superbus — watch the bouts and bet on them.')}</p>`}
  const pr=_T`Prizes: semifinal ${coinAmt87('+'+V104A.prize.sf)} +${V104A.fame.sf} fame · final ${coinAmt87('+'+V104A.prize.fin)} +${V104A.fame.fin} · champion ${coinAmt87('+'+V104A.prize.champ)} +${V104A.fame.champ} and the Superbus Cup.`;
  return `<div class="card2 specbox sb103c po104card" data-po104ph="${r}"><div class="sb103ban">${lau(false)}<div><b>${title}</b><small>${_T`The Flavius Superbus · Roma · week ${PO104_WK[r]} · season ${P.s}`}</small></div>${lau(true)}</div>
    <div class="po104top">${typeof trophySVG==='function'?trophySVG(trophyDef('palm_roma')||{},70):''}<div class="po104tx">${you}<p class="rc-sub">${_T('The top 2 of each bout by the event’s own finishing order go on. Playoff bouts score no league points.')}</p><p class="rc-sub">${pr}</p></div>
    <button class="btn tksm po104bb" type="button" data-po104="bracket">${_T`🏛 The bracket`}</button></div>${po104BracketHTML(w,true)}</div>`}
function po104OffHTML(w){const P=po104P(w);const R=P.rev||po104Review(w,P);const pm=me();
  const fpl=(P.fin&&P.fin.pl)||[];const pod=fpl.length?`<div class="po104pod">${fpl.slice(0,4).map((x,i)=>{const g=gById(x.gid);const m=po104M(x.k);return `<div class="po104p p${i+1}${m&&m.isPlayer?' me':''}">${i===0&&typeof trophySVG==='function'?trophySVG(trophyDef('palm_roma')||{},58):`<span class="pl">${RN(i+1)}</span>`}${g&&typeof gArt==='function'?gArt(g,'xs'):''}<b>${esc(g?g.name:'?')}</b><small>${esc(po104Name(x.k))}</small></div>`}).join('')}</div>`:'';
  const ren=(P.ren||[]);const rr=ren.map(x=>{const g=gById(x.gid);if(!g)return '';const btn=(v,t)=>`<button class="btn tksm${v==='y'?' primary':''}" type="button" data-po104="ren|${g.id}|${v}">${t}</button>`;
    const q=x.kind==='raise'?_T`asks ${coinAmt87(x.wage)} a week (+${x.pct}%, was ${x.old}) for ${x.weeks} more weeks`:_T('sat on the bench and asks to leave');
    const done=x.st?`<span class="badge">${x.st==='yes'?(x.kind==='raise'?_T('signed'):_T('let go')):x.st==='no'?(x.kind==='raise'?_T('refused'):_T('kept')):_T('lapsed')}</span>`:(x.kind==='raise'?btn('y',_T('Sign'))+btn('n',_T('Refuse')):btn('y',_T('Let him go'))+btn('n',_T('Keep him')));
    return `<div class="po104rn" data-po104ren="${g.id}"><b>${esc(g.name)}</b> <span class="rc-sub">${q}</span> ${done}</div>`}).join('');
  return `<div class="card2 po104off" data-po104ph="off"><div class="po104oh"><b>${_T`🌿 The off-season · after season ${P.s}`}</b><span class="rc-sub">${_T`No bouts this week. Season ${P.s+1} starts when the week ends.`}</span></div>
    ${P.champ?`<div class="po104ptl">${_T`🏆 The Flavius Superbus: <b>${esc(po104Name(P.champ))}</b>`}</div>${pod}`:''}
    <div class="po104sec"><div class="sect">${_T`📜 Season ${P.s} in review`}</div>${po104RevHTML(R,false)}</div>
    <div class="po104sec"><div class="sect">${_T('✍ Contract renewals')}</div>${rr||`<p class="rc-sub">${_T('No contract asks this off-season.')}</p>`}${rr?`<p class="rc-sub">${_T('Unanswered asks lapse when the week ends: raises keep the old terms, the others stay and sulk.')}</p>`:''}</div>
    <div class="po104sec"><div class="sect">${_T('🤝 Recruiting is open')}</div><p class="rc-sub">${_T('Sign, scout and train before the new season.')} <button class="btn tksm" type="button" data-mg="tab" data-id="recruit">${_T`Recruiting`}</button> <button class="btn tksm" type="button" data-mg="tab" data-id="practice">${_T`Training Yard`}</button> <button class="btn tksm" type="button" data-po104="bracket">${_T`🏛 The bracket`}</button></p></div>
    </div>${typeof weekLoopBtns==='function'?weekLoopBtns():''}`}
{const base=nightHTML;nightHTML=function(){const w=W_();const ph=po104Ph(w);if(!ph||(w.special&&!w.special.done))return base.apply(this,arguments);
  if(ph==='off')return po104OffHTML(w);
  const n=w.night;n.bye=false;let h;try{h=base.apply(this,arguments)}finally{delete n.bye}
  try{const t=document.createElement('template');t.innerHTML=h;for(const s of ['.travelcard','.any100wk','.sbye76row','.rivalban','.byecard','.movedcard','p.wkline'])for(const x of t.content.querySelectorAll(s))x.remove();
    for(const c of t.content.querySelectorAll('.card2.bout.sb104 .tierlbl'))c.textContent=_T('Superbus');h=t.innerHTML}catch(e){}
  return po104CardHTML(w)+h}}
/* the page: rail + banners say Superbus / Off-season, the bracket button, the season texts */
/* the old "top four" texts (English strings of 231 / 290; other languages keep theirs until the release's translation pass) */
const PO104_TXT=()=>[[_T('The Flavius Superbus: the top four of the league table send one fighter each to Roma when week 12 ends — invitation only.'),_T('The Flavius Superbus playoffs: the top 12 of the league table, weeks 12–14. Seeds 1–4 rest in week 12; each house sends one gladiator a round.')],
  ['The top four houses at week 12 are invited to the Flavius Superbus.',_T('The top 12 houses after week 11 play the Superbus playoffs; seeds 1–4 rest in week 12.')],
  ['The top four are invited to the Flavius Superbus',_T('The top 12 play the Superbus playoffs')]];
function po104Post(h){const w=W_();if(!w||w.dead||MGR.view||typeof h!=='string'||!cal104New(w))return h;const ph=po104Ph(w);const br=po104BrOK(w);const lg=MGR.tab==='league'||MGR.tab==='sched';if(!ph&&!br&&!lg)return h;
  if(lg)for(const [a,b] of PO104_TXT())if(h.includes(a))h=h.split(a).join(b);
  const t=document.createElement('template');t.innerHTML=h;const R=t.content;const Q=s=>R.querySelector(s);
  const bb=()=>{const x=document.createElement('button');x.type='button';x.className='btn tksm po104bb';x.dataset.po104='bracket';x.textContent=_T('🏛 Bracket');return x};
  if(ph){const lbl=PO104_PH()[ph];const ic=ph==='off'?'🌿 ':'🏛 ';
    const nb=Q('.mtabs [data-mg="tab"][data-id="night"]');if(nb){if(ph!=='off')nb.classList.add('sb103');for(const x of [...nb.childNodes])if(x.nodeType===3)x.remove();nb.insertBefore(document.createTextNode(ic+lbl),nb.firstChild);const c=nb.querySelector('.mcount.c85n');if(c&&ph==='off')c.remove()}
    const rb=Q('.roomhd.b73-night .roomttl span');if(rb)rb.textContent=ph==='off'?_T`🌿 Off-season · after season ${w.season}`:`🏛 ${lbl} · ${_T`week ${PO104_WK[ph]} of season ${w.season}`}`;
    const lb=Q('.lu100tt>b');if(lb)lb.textContent=ic+lbl;
    const mw=Q('.lu100mw[data-id="night"]');if(mw){if(ph!=='off')mw.classList.add('sb103m');const mb=mw.querySelector('.tx>b');if(mb)mb.textContent=lbl}
    const eh=Q('.endconfirm h4');if(eh)eh.textContent=ph==='off'?_T`⏭ End the off-season → season ${w.season+1}?`:_T`⏭ End ${lbl}?`;
    if(w.review&&w.review.po104&&w.review.po104s===w.season){const d=Q('details.rev91 summary b');const nm={r11:_T('Week 11'),r1:_T('Superbus Round 1'),sf:_T('Superbus semifinals'),fin:_T('Superbus Week')}[w.review.po104];if(d&&nm&&!(w.review.sb103))d.textContent=_T`${nm} in review · season ${RN(w.season)}`}}
  if(br){const k=Q('.roomhd.b73-league .kick');if(k&&!k.querySelector('.po104bb'))k.appendChild(bb());const nt=Q('.roomhd.b73-night .roomttl');if(nt&&!nt.querySelector('.po104bb'))nt.appendChild(bb())}
  /* the League banner + the Season view say what the Superbus now is */
  const sub=Q('.roomhd.b73-league .sub');if(sub&&/Superbus/.test(sub.textContent))sub.textContent=_T`Season ${w.season} · ${Math.max(0,12-wkOf(w.week))} weeks left · 12 houses go to the Superbus playoffs, the top 4 rest in week 12`;
  const gg=Q('.wd100wk.gg .ev');if(gg)gg.textContent=_T('playoffs · weeks 12–14');
  return t.innerHTML}
{const base=mgrHTML;mgrHTML=function(){try{cal104Sync(W_())}catch(e){}const h=base.apply(this,arguments);if(!V104A.on)return h;try{return po104Post(h)}catch(e){console.error(e)}return h}}
{const base=seasonTabHTML;seasonTabHTML=function(){try{cal104Sync(W_())}catch(e){}let h=base.apply(this,arguments);try{if(cal104New(W_()))h=h.split(_T(' — set at the start of week 11, when the Consilium writes')).join(_T(' — set at the start of week 10, when the Consilium writes'))}catch(e){}return h}}

/* ---------------- styles ---------------- */
{const st=document.createElement('style');st.textContent=`
.po104card .po104top{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.po104card .po104tx{flex:1;min-width:220px}.po104card .po104tx p{margin:3px 0}
.po104pk{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;margin:4px 0}.po104pk select{max-width:100%}
.po104bk{margin-top:8px}.po104pj{margin:0 0 6px;font-size:13px}.po104cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.po104c{display:flex;flex-direction:column;gap:8px;min-width:0}.po104ch2{font:600 11px var(--sans,system-ui);letter-spacing:.12em;text-transform:uppercase;opacity:.75}
.po104b{border:1px solid #8a6a2c;border-radius:8px;padding:5px 6px;background:rgba(20,8,16,.35)}.po104bt{font:600 11.5px var(--sans,system-ui);color:#f0cf7d;margin-bottom:3px}
.po104e{display:grid;grid-template-columns:30px minmax(0,1fr) auto;align-items:center;gap:2px 6px;padding:2px 4px;border-radius:5px;font-size:12.5px;line-height:1.25}
.po104e .sd{opacity:.7;font-size:11px}.po104e b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}.po104e small{grid-column:2/4;opacity:.75;font-size:11px}
.po104e.me{background:rgba(214,171,76,.22);outline:1px solid #d6ab4c}.po104e.adv i{color:#9fdc8a;font-style:normal}.po104e.out{opacity:.5;text-decoration:line-through}.po104e.ph{opacity:.6;font-style:italic;grid-template-columns:1fr}
.po104ch{display:flex;flex-direction:column;align-items:center;text-align:center;gap:2px;padding:6px;border:1px solid #d6ab4c;border-radius:8px;background:radial-gradient(rgba(214,171,76,.25),transparent)}.po104ch.dim{opacity:.75}
.po104ov{position:fixed;inset:0;z-index:4000;background:rgba(10,4,8,.6);display:flex;align-items:center;justify-content:center;padding:16px}
.po104box{width:min(920px,100%);max-height:92vh;overflow:auto;border:2px solid #d6ab4c;border-radius:12px;padding:12px 14px;background:linear-gradient(160deg,#3b1030,#5b1b47 48%,#2a0c22);color:#f3e3b8;box-shadow:0 10px 40px rgba(0,0,0,.6)}
.po104box b{color:#f6dc98}.po104hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font:400 20px var(--display)}
.po104x{width:34px;height:34px;border-radius:6px;border:1px solid #d6ab4c;background:#2a0c22;color:#f0cf7d;font-size:16px;cursor:pointer}
.po104off .po104oh{display:flex;flex-direction:column;gap:2px;margin-bottom:6px}.po104off .po104oh b{font:400 22px var(--display);color:var(--gold2)}
.po104sec{margin-top:8px}.po104rv{margin:4px 0 0 16px;padding:0;line-height:1.4}.po104rn{display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;padding:3px 0;border-bottom:1px dashed rgba(214,171,76,.3)}
.po104ptl{margin:4px 0;font:400 18px var(--display)}.po104pod{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:6px 0}
.po104p{display:flex;flex-direction:column;align-items:center;text-align:center;gap:2px;padding:6px;border:1px solid rgba(214,171,76,.5);border-radius:8px}.po104p.p1{border-color:#d6ab4c;background:rgba(214,171,76,.16)}.po104p.me{outline:2px solid #d6ab4c}
.po104p .pl{font:400 22px var(--display);color:var(--gold2)}.po104p small{opacity:.75;font-size:11px}
@media (max-width:760px){.po104cols{grid-template-columns:minmax(0,1fr)}.po104pod{grid-template-columns:repeat(2,minmax(0,1fr))}.po104box{padding:10px}}
`;document.head.appendChild(st)}
