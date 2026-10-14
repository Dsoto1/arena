/* =====================================================================
   77-RIVALRY · v0.59
   =====================================================================
   RIVALRY WEEK — the last week of the regular season (week 12) is Familia, two on two, every house against its fiercest
   rival. The second bye moves from week 8 to week 11, the week before it.
   - PAIRING (rivalPairs): mutual heat (m.rivals both ways, plus the feud aimed at you) decides; the hottest pairs are
     matched first, ties go to the houses closest in the standings; an odd house out has a bye. The pairing is locked
     at the start of week 11 — until then the schedule says "vs TBD".
   - WEEK 11: the Consilium's letter names your rival and asks for two fighters (rivalCommit). A house that cannot field
     two eligible fighters (alive, under contract, fit by week 12, not loaned out) loses fame, and the editor backfills
     the empty places with free agents so every bout still happens. If you name no one, the Consilium picks your best two.
   - WEEK 12: one Familia bout per pairing (yours first, as the main event); you can fight (one fighter yours, the
     partner a CPU), watch, or sim it. The card keeps three bouts (yours + the two hottest rivalries); every other pairing
     is a background bout, settled at the week's end from the pairs' ratings (rivalBackground) and reported in the Acta. The winning house gains fame; the Acta reports.
   ===================================================================== */
const RIVAL_WK=12,RIVAL_FAME_SHORT=8,RIVAL_FAME_WIN=4; /* TWEAK */
BYE_WKS.splice(0,BYE_WKS.length,4,11);
{const base=seasonSchedule;seasonSchedule=function(season){const fx=base.apply(this,arguments);try{const f=fx[RIVAL_WK-1];if(f&&!f.rivalry){f.ev='familia';f.rivalry=1;f.purse=Math.max(f.purse||1,1.5)}}catch(e){}return fx}}
function rivalHeat(a,b){return ((a.rivals||{})[b.id]||0)+((b.rivals||{})[a.id]||0)+(a.isPlayer?(b.rivalry||0):0)+(b.isPlayer?(a.rivalry||0):0)}
function rivalPairs(w){const H=w.mgrs.filter(m=>!m.dead);const rank=new Map(leagueSort(H).map((m,i)=>[m.id,i]));const cand=[];
  for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++)cand.push({a:H[i],b:H[j],s:rivalHeat(H[i],H[j])-Math.abs(rank.get(H[i].id)-rank.get(H[j].id))*0.5+Math.random()*0.1});
  cand.sort((x,y)=>y.s-x.s);const used=new Set(),pairs=[];
  for(const c of cand){if(used.has(c.a.id)||used.has(c.b.id))continue;used.add(c.a.id);used.add(c.b.id);pairs.push([c.a.id,c.b.id])}
  return {pairs,bye:H.filter(m=>!used.has(m.id)).map(m=>m.id)}}
const rivalOf=(w,mid)=>{const R=w.rivalry;if(!R)return null;const p=R.pairs.find(x=>x.includes(mid));return p?mgrById(p[0]===mid?p[1]:p[0]):null};
function rivalEligible(w,m,abs){return rosterOf(m).filter(g=>g.alive&&!g.lanista&&!(g.loanFrom&&g.loanFrom.mid===m.id&&g.contract.mgr!==m.id)&&!(g.inj&&(g.inj.war||(g.inj.until||0)>=abs))).sort((a,b)=>effOvr(b)-effOvr(a))}
function rivalLetter(w){const pm=me();const R=w.rivalry;const foe=rivalOf(w,pm.id);const el=rivalEligible(w,pm,R.abs);
  const opts=sel=>`<option value="">— choose —</option>`+el.map(g=>`<option value="${g.id}" ${sel===g.id?'selected':''}>${esc(g.name)} · ${CLASSES[g.cls]?CLASSES[g.cls].name:''} · ${effOvr(g)}</option>`).join('');
  const body=foe?`<p>${_T`Next week is <b>Rivalry Week</b> — Familia, two on two. Your rival: <b>${esc(foe.ludus)}</b> (${esc(foe.name)}). Name two fighters to stand together.`}</p>
    ${el.length>=2?`<div class="acts" style="align-items:center"><select class="tin" id="rivA">${opts(el[0].id)}</select><select class="tin" id="rivB">${opts(el[1].id)}</select><button class="btn primary tksm" type="button" data-rivcommit>${_T`⚔ Name them`}</button></div>`
      :`<p class="bad">${_T`You have ${el.length} fit fighter${el.length===1?'':'s'}. Sign or heal one this week, or the house loses ${RIVAL_FAME_SHORT} fame and the editor fills your places.`}</p>`}
    ${el.length>=2?`<p class="rc-sub">${_T`Name no one and the Consilium sends your best two.`}</p>`:''}`
    :`<p>${_T`Next week is <b>Rivalry Week</b>, but the league pairs off without you — the odd house out. Rest, and watch the feuds settle.`}</p>`;
  sendLetter(w,{key:'rival-'+w.season,kind:'letter',from:_T('the Consilium'),seal:'⚔',title:foe?_T`Rivalry Week: ${foe.ludus}`:_T('Rivalry Week: a bye for us'),until:w.week,body})}
function rivalLock(w){if(w.rivalry&&w.rivalry.abs===w.week+1)return;const P=rivalPairs(w);w.rivalry={season:w.season,abs:w.week+1,pairs:P.pairs,bye:P.bye,commit:{}};
  if(typeof mnews==='function'){const pm=me();const foe=rivalOf(w,pm.id);mnews(_T`⚔ <b>Rivalry Week is set.</b> ${foe?_T`${esc(pm.ludus)} meets <b>${esc(foe.ludus)}</b> — two on two, Familia, next week.`:_T`${esc(pm.ludus)} is the odd house out — a bye.`}`,'big')}
  rivalLetter(w)}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-rivcommit]');if(!b)return;const w=W_();if(!w||!w.rivalry)return;
  const a=(document.getElementById('rivA')||{}).value,c=(document.getElementById('rivB')||{}).value;
  if(!a||!c||a===c){if(typeof mToast==='function')mToast(_T('Choose two different fighters.'));return}
  w.rivalry.commit[me().id]=[a,c];if(typeof mnews==='function')mnews(_T`⚔ For Rivalry Week you name <b>${esc(gById(a).name)}</b> and <b>${esc(gById(c).name)}</b>.`);
  const L=(w.letters||[]).find(x=>x.key==='rival-'+w.season);if(L)L.read=true;saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()});
/* the two a house sends: its named pair (if still fit), else its best two; short houses lose fame and are backfilled */
function rivalPick(w,m,used){const R=w.rivalry;const el=rivalEligible(w,m,w.week).filter(g=>!used.has(g.id));const named=(R.commit[m.id]||[]).map(gById).filter(g=>g&&el.includes(g));
  const out=[...named];for(const g of el){if(out.length>=2)break;if(!out.includes(g))out.push(g)}
  const short=2-out.length;if(short>0){m.fame=Math.max(0,(m.fame||0)-RIVAL_FAME_SHORT);
    if(typeof mnews==='function')mnews(_T`${esc(m.ludus)} cannot field two fighters for Rivalry Week: −${RIVAL_FAME_SHORT} fame, and the editor fills ${short===1?_T('the place'):_T('both places')} with free agents.`,m.isPlayer?'bad':'');
    const pool=freeAgents().filter(g=>!used.has(g.id)&&!g.inj&&g.alive).sort((a,b)=>effOvr(b)-effOvr(a));
    while(out.length<2){let g=pool.shift();if(!g){g=genGlad({ovr:55+rnd(15)});g.debut={s:w.season,wk:w.week};w.glads.push(g)}out.push(g)}}
  out.forEach(g=>used.add(g.id));return out.map(g=>g.id)}
function rivalNight(w){const n=w.night,R=w.rivalry;if(!n||n.bye||!R||R.abs!==w.week||n.rivalry)return;const pm=me();
  const tmpl=n.bouts[2]||n.bouts[0]||{purse:160,fee:15};const used=new Set();
  /* the card keeps three bouts: yours (the main event) and the two hottest other rivalries; the rest are background bouts */
  const order=[...R.pairs].sort((x,y)=>(y.includes(pm.id)?1:0)-(x.includes(pm.id)?1:0));
  const mk=(p,tier)=>{const [A,B]=p.map(mgrById);const a=rivalPick(w,A,used),b=rivalPick(w,B,used);
    return {...tmpl,tier,ev:'familia',special:false,purse:Math.max(10,Math.round(TIERS[tier].purse*1.25)),fee:TIERS[tier].fee,ents:[a[0],b[0],a[1],b[1]],done:false,res:null,bets:[],billed:null,rig:null,rivalry:{a:A.id,b:B.id}}};
  n.bouts=order.slice(0,3).map((p,i)=>mk(p,i===0?'main':i===1?'feature':'under')).reverse();
  n.bgRival=order.slice(3).map(p=>{const b=mk(p,'under');return {a:b.rivalry.a,b:b.rivalry.b,ents:b.ents}});
  n.rivalry={pairs:R.pairs.length,bye:R.bye}}
/* a background rivalry: the stronger pair usually wins (ratings, a little luck); fame, heat and the Acta follow */
function rivalBackground(w){const n=w.night;if(!n||!n.bgRival||n.bgDone)return;n.bgDone=true;
  for(const x of n.bgRival){const pairA=[x.ents[0],x.ents[2]].map(gById).filter(Boolean),pairB=[x.ents[1],x.ents[3]].map(gById).filter(Boolean);
    const sA=pairA.reduce((t,g)=>t+effOvr(g),0),sB=pairB.reduce((t,g)=>t+effOvr(g),0);const pA=1/(1+Math.exp((sB-sA)/9));
    const aWins=Math.random()<pA;const W2=mgrById(aWins?x.a:x.b),L2=mgrById(aWins?x.b:x.a);const wp=aWins?pairA:pairB,lp=aWins?pairB:pairA;
    if(W2){W2.fame=(W2.fame||0)+RIVAL_FAME_WIN;W2.rivals=W2.rivals||{};if(L2)W2.rivals[L2.id]=clamp((W2.rivals[L2.id]||0)+4,0,100)}
    if(L2&&W2){L2.rivals=L2.rivals||{};L2.rivals[W2.id]=clamp((L2.rivals[W2.id]||0)+8,0,100)}
    for(const g of wp){g.wins=(g.wins||0)+1;g.bouts=(g.bouts||0)+1;g.morale=clamp((g.morale||50)+4,0,100)}for(const g of lp){g.bouts=(g.bouts||0)+1;g.morale=clamp((g.morale||50)-3,0,100)}
    if(typeof mnews==='function'&&W2&&L2)mnews(_T`⚔ Rivalry Week: <b>${esc(W2.ludus)}</b> (${wp.map(g=>esc(g.name)).join(' & ')}) beat ${esc(L2.ludus)} (${lp.map(g=>esc(g.name)).join(' & ')}) — +${RIVAL_FAME_WIN} fame.`)}}
{const base=endWeek;endWeek=async function(){try{const w=W_();if(w&&w.night&&w.night.bgRival&&w.night.bouts.every(b=>b.done)&&!(w.pend||[]).length)rivalBackground(w)}catch(e){console.error(e)}return base.apply(this,arguments)}}
{const base=makeNight;makeNight=function(){const r=base.apply(this,arguments);try{const w=W_();if(w&&!w.tutorial){
  if(wkOf(w.week)===RIVAL_WK-1)rivalLock(w);
  if(wkOf(w.week)===RIVAL_WK){if(!w.rivalry||w.rivalry.abs!==w.week){const P=rivalPairs(w);w.rivalry={season:w.season,abs:w.week,pairs:P.pairs,bye:P.bye,commit:{}}}rivalNight(w)}}}catch(e){console.error(e)}return r}}
/* the winning house gains fame */
{const base=applyBout;applyBout=function(bi,res,opt){const w=W_();const b=w&&w.night&&w.night.bouts[bi];const was=b&&b.done;const r=base.apply(this,arguments);
  try{if(b&&b.rivalry&&!was&&b.done){const win=new Set((res.winners||[]).map(i=>res.rows.find(x=>x.id===i)).filter(Boolean).map(x=>{const g=gById(x.mgrId);return g&&g.contract?g.contract.mgr:null}));
    for(const mid of [b.rivalry.a,b.rivalry.b])if(win.has(mid)){const m=mgrById(mid);const o=mgrById(mid===b.rivalry.a?b.rivalry.b:b.rivalry.a);if(m){m.fame=(m.fame||0)+RIVAL_FAME_WIN;
      if(typeof mnews==='function')mnews(_T`⚔ <b>${esc(m.ludus)}</b> wins the rivalry against ${esc(o?o.ludus:_T('their rival'))} (+${RIVAL_FAME_WIN} fame).`,m.isPlayer?'big':'')}}}}catch(e){console.error(e)}
  return r}}
/* the Match Week and Season pages say so */
{const base=nightHTML;nightHTML=function(){const h=base.apply(this,arguments);try{const w=W_();const n=w&&w.night;if(n&&n.rivalry){const foe=rivalOf(w,me().id);
  return `<div class="card2 rivalban">${_T`<b>⚔ Rivalry Week</b> — every house against its fiercest rival, two on two (Familia). ${foe?_T`Yours: <b>${esc(foe.ludus)}</b> — fight with one of your pair, the other at your side.`:_T('You are the odd house out this week.')} ${n.bgRival&&n.bgRival.length?_T` ${n.bgRival.length} more rivalr${n.bgRival.length===1?_T('y is'):_T('ies are')} settled in the background at the week's end.`:''}`}</div>`+h}}catch(e){}return h}}
{const base=seasonTabHTML;seasonTabHTML=function(){const h=base.apply(this,arguments);try{const w=W_();const wk=wkOf(w.week);if(wk<=RIVAL_WK){const R=w.rivalry&&w.rivalry.season===w.season?w.rivalry:null;const foe=R?rivalOf(w,me().id):null;
  return `<p class="rc-sub rivalline">${_T`⚔ <b>Week ${RIVAL_WK} · Rivalry Week</b> (Familia, two on two) vs <b>${R?(foe?esc(foe.ludus):_T('— a bye —')):'TBD'}</b>${R?'':_T(' — set at the start of week 11, when the Consilium writes')} · byes in weeks ${BYE_WKS.join(' and ')}.`}</p>`+h}}catch(e){}return h}}
{const st=document.createElement('style');st.textContent=`.rivalban{border-color:#b0453a;background:linear-gradient(90deg,rgba(176,69,58,.18),transparent);margin-bottom:8px}`;document.head.appendChild(st)}
