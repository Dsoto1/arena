/* =====================================================================
   411-v109wqproto — v1.09 WINTER QUARTERS · MOCK-UP PROTOTYPE (his N4 o1a o2a o3a + w1a–w5a, tools/plans/v104/NOTES.md; the write-up and the
   questions: tools/plans/v109/MOCKUP.md). NOTHING SHIPS FROM THIS: it is OFF unless localStorage flavius_v109wq=1, and with it on it only
   DRAWS — it never writes the world, the Store or a save (every button that would change something is blocked with a "mock-up" toast).
   What it shows, in the off-season week (348 OFF104.active) on the Match Week tab (the rail item reads "❄ Winter Quarters"):
     a stepper of rooms in order, each with the slim v1.05 room banner (388 .cp105ban + an advisor face, 298 rm100Adv / 131 face83):
       0 overview · 1 Awards night (league table recap + the Flavian / league awards, w.awardShow) · 2 the Quaestor's accounts (w.qs / w.sr104;
       the Quaestor's Ledger lines recomputed read-only from 47's formula — quaestorLedger() itself pays, so it is NOT called) · 3 Council
       review + one promotion (w.council83, 256 adv98Req) · 4 Renown + perks (150 perkTree87 + 363's Renown bar, reused as is, read-only) ·
       5 Facilities (23 facilitiesHTML, reused, read-only) · 6 Personnel: contracts, renewals (348 P.ren + 386 ren105Line), rudis requests
       (380), retirements · 7 the Winter market of tirones (free agents ≤ 22) · 8 the Winter training camp · 9 THE WINTER CLASSIC entry
       (bracket seeded by the final league table = 348's P.seeds, drawn with 348's .po104b boxes; clemency rules; empty seats → invited free
       agents; Sica's Syndicate as a wildcard) + a finished-bracket preview + the Cup in the Hall · ✦ the Saturnalia finale (10-meta
       FEST_KINDS.saturnalia: Carmina Fescennina, a chariot race, a Classic Democritus) · 10 Next season (schedule + Consilium goals).
   MOCK DATA (marked in MOCKUP.md): the money split by category, advisor verdict lines, camp effects, which rivals sit the Classic out,
   the Classic results, the Hall plates, the next season's goals, the schedule when season N+1's fixture list is not cached yet.
   Plain English strings on purpose (no _T: a mock-up must not add catalogue entries). Display only; never the dice (hashStr, not rand).
   ===================================================================== */
const WQ109={on:(()=>{try{return localStorage.getItem('flavius_v109wq')==='1'}catch(e){return false}})(),step:0,view:'entry',pick:null};
window.WQ109=WQ109;
if(WQ109.on){
const WQ_R=[
  {k:'over',i:'❄',n:'Winter Quarters',s:'Overview'},
  {k:'awards',i:'🏆',n:'Awards night',s:'Awards',adv:'consilium'},
  {k:'books',i:'⚖',n:'The Quaestor’s accounts',s:'Accounts',adv:'clerk'},
  {k:'council',i:'🏛',n:'Council review',s:'Council',adv:'consilium'},
  {k:'renown',i:'⚜',n:'Renown & perks',s:'Renown'},
  {k:'fac',i:'🏗',n:'Facilities',s:'Facilities',adv:'clerk'},
  {k:'staff',i:'✍',n:'Personnel',s:'Personnel',adv:'barracks'},
  {k:'market',i:'🤝',n:'Winter market',s:'Market',adv:'recruiter'},
  {k:'camp',i:'🏋',n:'Winter camp',s:'Camp',adv:'doctore'},
  {k:'classic',i:'🏆',n:'The Winter Classic',s:'Classic'},
  {k:'sat',i:'🎭',n:'Saturnalia',s:'Saturnalia'},
  {k:'next',i:'📅',n:'Next season',s:'Next season',adv:'consilium'}];
const WQ_NUM=i=>i===0?'':i===10?'✦':String(i<10?i:10);
const wqH=s=>Math.abs(hashStr(String(s)));
const wqLive=()=>{try{const w=W_();return !!(WQ109.on&&w&&!w.dead&&!w.tutorial&&typeof OFF104!=='undefined'&&OFF104.active(w))}catch(e){return false}};
const wqP=w=>{try{return po104P(w)}catch(e){return null}};
const wqS=w=>{const P=wqP(w);return P?P.s:w.season};
const wqTable=w=>leagueSort(w.mgrs.filter(m=>!m.dead&&!m.sica),wqS(w));
const wqFlag=(m,h)=>{try{return m&&typeof flagChip==='function'?flagChip(m,h||18)||'<i class="wqnf">⚑</i>':'<i class="wqnf">⚑</i>'}catch(e){return ''}};
const wqAdv=k=>{try{return k&&typeof rm100Adv==='function'?rm100Adv(k,54):null}catch(e){return null}};
const wqChip=(v,l,cls)=>`<div class="roomstat rm100cnt wqchip${cls?' '+cls:''}"><span class="ptbox on">${v}</span><span>${l}</span></div>`;
const wqFirst=g=>{const p=String(g.name||'').split(' ');return /^(The|the)$/.test(p[0])||/^["“]/.test(p[1]||'')&&p.length<3?g.name:p[0]};
const wqCls=g=>{try{return CLASSES[g.cls]?CLASSES[g.cls].name:''}catch(e){return ''}};
const wqGr=g=>{try{const gr=r104Grade(g);return `<span class="r104t wqgr" style="--gc:${gradeCol(gr)}">${gr}</span>`}catch(e){return ''}};
const wqAge=g=>{try{return typeof gAge==='function'?gAge(g):g.age}catch(e){return g.age}};
const wqArt=g=>{try{return typeof gArt==='function'?gArt(g,'xs'):''}catch(e){return ''}};
const wqTr=(def,sz)=>{try{return typeof trophySVG==='function'?trophySVG(def||{},sz||56):''}catch(e){return ''}};
const wqCoin=n=>{try{return coinAmt87(n)}catch(e){return String(n)}};
/* the Winter Classic Cup (a travelling cup, silver; NOT in TROPHY_LIB — the mock only draws it) */
const WQ_CUP={id:'wq109cup',name:'The Winter Classic Cup',shape:'cup',metal:'silver',base:'marble',topper:'laurel',gem:'#5aa0d8',ins:'HIBERNA'};
/* the banner's winter sky (sits behind the slim banner like the rooms' scenes) */
const wqSky=k=>{const h=wqH('sky'+k);const flakes=Array.from({length:26},(_,i)=>{const x=(h*(i+3)*37)%1200,y=(h*(i+7)*13)%110;return `<circle cx="${x}" cy="${y}" r="${1+(i%3)*.6}" fill="#e8f0ff" opacity="${.25+(i%4)*.12}"/>`}).join('');
  return `<svg viewBox="0 0 1200 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="wqsk${k}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1c2638"/><stop offset=".65" stop-color="#3a3f52"/><stop offset="1" stop-color="#5b5560"/></linearGradient></defs><rect width="1200" height="120" fill="url(#wqsk${k})"/>
    <path d="M640 120V66h40v-8h300v8h40v54Z" fill="#2a2430" opacity=".9"/>${[0,1,2,3,4,5,6,7].map(i=>`<rect x="${700+i*38}" y="70" width="14" height="50" fill="#3c3442"/><rect x="${697+i*38}" y="66" width="20" height="5" fill="#d8dce8" opacity=".8"/>`).join('')}
    <path d="M0 108Q300 92 600 104T1200 100V120H0Z" fill="#dfe6f2" opacity=".85"/>${flakes}</svg>`};
function wqBan(i,sub,chips){const R=WQ_R[i];const A=wqAdv(R.adv);const face=A?`<span class="rm100rd rm100adv" title="${esc(A.a.name+' · '+A.a.role)}">${A.f}</span>`:`<span class="rm100rd rm100adv cp105md" aria-hidden="true">${R.i}</span>`;
  return `<div class="roomhd wq109ban rm100ban v101ban w104ban cp105ban cp105one">${wqSky(R.k)}${face}<div class="roomttl"><b>${R.i} ${esc(R.n)}</b><span>${sub}</span></div>${chips||''}</div>`}
function wqSay(k,txt){const A=wqAdv(k);if(!A)return '';return `<div class="rm100clerk wqsay"><span class="rm100rd">${A.f}</span><span class="rm100one"><b>${esc(A.a.name)}</b>, ${esc(A.a.role)}: “${txt}”</span></div>`}
/* the stepper strip */
function wqStepper(cur){return `<nav class="wq109st" aria-label="Winter Quarters rooms">${WQ_R.map((R,i)=>{if(!i)return `<button type="button" class="wqs ov${cur===0?' cur':''}" data-wq109="go|0" title="Overview">❄</button>`;
  const st=i<cur?' done':i===cur?' cur':'';return `<button type="button" class="wqs${st}${R.k==='sat'?' fin':''}" data-wq109="go|${i}" ${i===cur?'aria-current="step"':''}><span class="n">${i<cur?'✓':WQ_NUM(i)}</span><span class="t">${esc(R.s)}</span></button>`}).join('<i class="wqsl"></i>')}</nav>`}
function wqNav(cur){const nx=WQ_R[cur+1];const pv=cur>0?WQ_R[cur-1]:null;
  return `<div class="wq109nav">${pv?`<button type="button" class="btn tksm" data-wq109="go|${cur-1}">← ${esc(pv.s)}</button>`:'<span></span>'}${nx?`<button type="button" class="btn primary sd100 sd100p sd100m" data-wq109="go|${cur+1}">${cur===0?'Begin: ':'Next: '}${nx.i} ${esc(nx.n)} →</button>`:`<button type="button" class="btn primary sd100 sd100p sd100m wq109go" data-wq109="mock">▶ Begin season ${wqS(W_())+1}</button>`}</div>`}

/* ---------------- 0 · overview ---------------- */
function wqOver(w){const pm=me();const P=wqP(w);const T=wqTable(w);const pos=T.indexOf(pm)+1;const ren=(P&&P.ren||[]).filter(x=>!x.st).length;
  const fa=w.glads.filter(g=>g.alive&&!g.contract&&!g.inv&&wqAge(g)<=22).length;
  const sum={awards:`You finished #${pos} of ${T.length}`,books:`Treasury ${pm.coin} · the Ledger to seal`,council:'One advisor may rise',renown:`${pm.perkPts||0} perk points to spend`,
    fac:'One winter project',staff:`${ren} contract ask${ren===1?'':'s'} waiting`,market:`${fa} tirones on the market`,camp:'Pick a focus for the winter',
    classic:'Optional · clemency · no league points',sat:'Carmina · chariots · Democritus',next:`Season ${wqS(w)+1}: schedule + goals`};
  const tiles=WQ_R.slice(1).map((R,j)=>{const i=j+1;return `<button type="button" class="wqt${R.k==='classic'||R.k==='sat'?' gold':''}" data-wq109="go|${i}"><span class="n">${WQ_NUM(i)}</span><span class="ic">${R.i}</span><b>${esc(R.n)}</b><small>${esc(sum[R.k]||'')}</small></button>`}).join('');
  return wqBan(0,`After season ${wqS(w)} · ten rooms, in order, then season ${wqS(w)+1}`,wqChip('10 + ✦','rooms')+wqChip(`${ren}`,'asks waiting'))
    +`<div class="card2 wq109c"><p class="wqlead">The season is over. Walk the house through the winter: awards, the books, the council, the barracks — then the Winter Classic and the Saturnalia, and the new season.</p><div class="wqtiles">${tiles}</div>
    <p class="rc-sub">No bouts and no league games in Winter Quarters. Each room can be left for later; the last room starts the season.</p></div>`}

/* ---------------- 1 · awards night ---------------- */
const WQ_REACH={champ:'Champion',fin:'Final',sf:'Semifinal',r1:'Round 1','':'—'};
function wqAwards(w){const pm=me();const P=wqP(w);const s=wqS(w);const T=wqTable(w);const pos=T.indexOf(pm)+1;
  const row=(m,i)=>{const sp=msp(m,s);const r=P?po104Reach(P,'m:'+m.id):'';return `<tr class="${m.isPlayer?'me':''}${i<3?' pod':''}"><td class="pl">${i+1}</td><td class="hs">${wqFlag(m,16)} <b>${esc(m.ludus)}</b></td><td>${sp.pts||0}</td><td>${sp.w||0}–${Math.max(0,(sp.b||0)-(sp.w||0))}</td><td class="sb${r==='champ'?' ch':''}">${WQ_REACH[r]||'—'}</td></tr>`};
  const pod=T.slice(0,3).map((m,i)=>{const sp=msp(m,s);return `<div class="wqpod p${i+1}${m.isPlayer?' me':''}"><span class="pl">${RN(i+1)}</span>${wqFlag(m,34)}<b>${esc(m.ludus)}</b><small>${sp.pts||0} pts · ${sp.w||0}–${Math.max(0,(sp.b||0)-(sp.w||0))}</small></div>`}).join('');
  const A=(w.awardShow&&w.awardShow.season===s?w.awardShow.awards:[]).slice(0,6);
  const aw=A.map(a=>`<div class="wqaw${a.mine?' me':''}">${wqTr(trophyDef(a.tid),52)}<div><b>${esc(a.name)}</b><span class="rc-sub">${esc(a.desc||'')}</span><span class="wqwho">${esc(a.gname||a.mname||'not given')}${a.ludus?` · ${esc(a.ludus)}`:''}</span><small>${esc(a.stat||'')}</small></div></div>`).join('')||'<p class="rc-sub">No awards this season.</p>';
  const champ=P&&P.champ?`<div class="wqsb">${wqTr(trophyDef('palm_roma'),46)}<span>The Flavius Superbus: <b>${esc(po104Name(P.champ))}</b></span></div>`:'';
  return wqBan(1,`Season ${s} · the league's final table and its awards`,wqChip(`#${pos}`,'your place')+wqChip(`${msp(pm,s).pts||0}`,'points'))
    +`<div class="wq2"><div class="card2 wq109c"><div class="sect">🏛 The final table</div><div class="wqpods">${pod}</div>${champ}
      <div class="wqtw"><table class="wqtbl"><thead><tr><th>#</th><th>Ludus</th><th>Pts</th><th>W–L</th><th>Superbus</th></tr></thead><tbody>${T.map(row).join('')}</tbody></table></div></div>
    <div class="card2 wq109c"><div class="sect">🏆 The Flavian Awards</div><div class="wqaws">${aw}</div>
      ${wqSay('consilium',pos<=4?'A season to remember. Build on it.':pos<=8?'Mid-table. The winter decides next year.':'A hard season. The winter is where houses are rebuilt.')}</div></div>`}

/* ---------------- 2 · the Quaestor's accounts ---------------- */
function wqBooks(w){const pm=me();const s=wqS(w);const Q=w.qs&&w.qs.s===s?w.qs:{wages:0,roster:[],fame:pm.fame,fans:0,bet:pm.betNet||0};const S=w.sr104&&w.sr104.s===s?w.sr104:{coin:pm.coin};
  const T=wqTable(w);const pos=T.indexOf(pm)+1;const n=w.mgrs.length;
  /* the Quaestor's Ledger, recomputed (47 quaestorLedger's lines; it is NOT called — it pays) */
  const signed=rosterOf(pm).map(g=>g.id).filter(id=>!(Q.roster||[]).includes(id)).length;const fameD=Math.max(0,(pm.fame||0)-(Q.fame||0));const lost=Math.max(0,(Q.bet||0)-(pm.betNet||0));
  const QL=[['Senate stipend',Q.rich?0:30],['Tax back on wages',Math.round((Q.wages||0)*.10)],['Rebate on lost wagers',Math.round(lost*.12)],[`Recruiting bounty · ${signed}`,signed*12],[`Fame gained · ${fameD}`,fameD*3],[`League finish · #${pos}`,Math.max(0,n-pos)*4]].filter(x=>x[1]>0);
  let qt=QL.reduce((a,x)=>a+x[1],0);const cap=120+(pm.fame||0)*3;if(qt>cap){QL.push(['Quaestor’s ceiling',cap-qt]);qt=cap}
  const paid=!!(w.qsDue&&w.qsDue.paid);
  /* the season by category — wages are real; the split of the rest is a MOCK (no category ledger exists yet) */
  const wages=Q.wages||0;const net=pm.coin-(S.coin||0);const outO=Math.round(wages*.38);const inO=Math.max(0,net+wages+outO);
  const IN=[['Purses',Math.round(inO*.58)],['Wagers',Math.round(inO*.14)],['Gate & practice crowds',Math.round(inO*.18)],['Sponsors',inO-Math.round(inO*.58)-Math.round(inO*.14)-Math.round(inO*.18)]];
  const OUT=[['Wages',wages],['Gear & repairs',Math.round(outO*.42)],['Travel',Math.round(outO*.33)],['Medicus & beds',outO-Math.round(outO*.42)-Math.round(outO*.33)]];
  const mx=Math.max(1,...IN.map(x=>x[1]),...OUT.map(x=>x[1]));
  const bar=(l,v,c)=>`<div class="wqbar ${c}"><span class="l">${l}</span><span class="b"><i style="width:${Math.round(100*v/mx)}%"></i></span><span class="v">${c==='o'?'−':'+'}${v}</span></div>`;
  return wqBan(2,`Season ${s} · money in, money out, and what the Quaestor pays`,wqChip(`${S.coin||0}→${pm.coin}`,'treasury')+wqChip(`${net>=0?'+':''}${net}`,'the season'))
    +`<div class="wq2"><div class="card2 wq109c"><div class="sect">📈 In <span class="rc-sub">+${IN.reduce((a,x)=>a+x[1],0)}</span></div>${IN.map(x=>bar(x[0],x[1],'i')).join('')}
      <div class="sect">📉 Out <span class="rc-sub">−${OUT.reduce((a,x)=>a+x[1],0)}</span></div>${OUT.map(x=>bar(x[0],x[1],'o')).join('')}
      <p class="wqtot">Treasury <b>${S.coin||0}</b> → <b>${pm.coin}</b> <span class="${net>=0?'up':'dn'}">${net>=0?'+':''}${net}</span></p></div>
    <div class="card2 wq109c wqled"><div class="sect">🏛 The Quaestor’s Ledger</div>${QL.map(x=>`<div class="wqll"><span>${esc(x[0])}</span><b>${x[1]>0?'+':''}${x[1]}</b></div>`).join('')}
      <div class="wqll tot"><span>To your treasury</span><b>${wqCoin('+'+qt)}</b></div>
      <div class="acts wqro"><button type="button" class="btn primary sd100 sd100p" ${paid?'disabled':''}>${paid?'✓ Sealed':'✍ Seal the Ledger'}</button></div>
      ${wqSay('clerk',`Wages ran ${Math.round(wages/12)} a week. ${pm.coin>wages?'We start the winter in credit.':'We start the winter short — watch the wages.'}`)}</div></div>`}

/* ---------------- 3 · council review ---------------- */
function wqCouncil(w){const pm=me();const C=w.council83||[];const lvMax=5;
  const VERD={consilium:'Read the table well; the playoffs were ours to lose.',recruiter:'Two signings graded in full. The market is thin this winter.',doctore:'The yard was busy. Band-ups came late.',medicus:'Every wound closed. One limb lost.',clerk:'The books balance. Wages are the worry.',barracks:'Morale held. Nobody walked out angry.'};
  let ready=0;const cards=C.map(a=>{const lv=a.lv||1;let req=[];try{req=adv98Req(w,pm,a.k,lv+1)}catch(e){}const met=lv<lvMax&&(lv+1<=2||(req.length&&req.every(x=>x[1]>=x[2])));if(met)ready++;
    const face=(()=>{try{return face83(a,64)}catch(e){return '🧑'}})();
    const prog=lv>=lvMax?'<span class="badge gold">top level</span>':lv+1<=2?`<span class="rc-sub">Level ${lv+1}: ${wqCoin(60)}</span>`:req.map(x=>`<span class="wqrq${x[1]>=x[2]?' ok':''}">${esc(x[0])} ${Math.min(x[1],x[2])}/${x[2]}</span>`).join('');
    return `<div class="wqadv${met?' up':''}"><span class="wqface">${face}</span><div class="wqat"><b>${esc(a.name)}</b><span class="rc-sub">${esc(a.role)} · level ${lv}</span><span class="wqstars">${'★'.repeat(lv)}${'☆'.repeat(lvMax-lv)}</span>
      <p class="wqv">“${esc(VERD[a.k]||'')}”</p><div class="wqprog">${prog}</div></div>${lv<lvMax?`<button type="button" class="btn tksm${met?' primary':''}" ${met?'':'disabled'}>⬆ Promote</button>`:''}</div>`}).join('');
  return wqBan(3,'Each advisor reports on the season · promote one',wqChip(`${ready}`,'ready to rise')+wqChip('1','promotion'))
    +`<div class="card2 wq109c wqro"><div class="wqadvs">${cards}</div><p class="rc-sub">One promotion a winter. Levels 4 and 5 are earned by the house’s record; level 2 is bought with coin.</p></div>`}

/* ---------------- 4 · renown + perks ---------------- */
function wqRenown(w){const pm=me();const r=pm.renown||{lv:0,xp:0,src:{}};let tree='';try{tree=perkTree87()}catch(e){tree='<p class="rc-sub">—</p>'}
  return wqBan(4,'Your name across the empire · spend the winter’s perk points',wqChip(`${r.lv||0}`,'renown')+wqChip(`${pm.perkPts||0}`,'perk points'))
    +`<div class="card2 wq109c wqro wqperk">${tree}</div>`}

/* ---------------- 5 · facilities ---------------- */
function wqFac(w){const pm=me();let h='';try{h=facilitiesHTML()}catch(e){h=''}let g='D';try{g=ludusGrade(pm)}catch(e){}
  return wqBan(5,'Build over the winter · one project, ready for week 1',wqChip(g,'ludus grade')+wqChip(`${pm.coin}`,'treasury'))
    +`<div class="card2 wq109c wqnote"><b>❄ Winter works.</b> One project over the winter, finished before week 1 — no builders in the yard during the season.</div><div class="wqro">${h}</div>`}

/* ---------------- 6 · personnel ---------------- */
function wqStaff(w){const pm=me();const P=wqP(w);const ros=rosterOf(pm).slice().sort((a,b)=>effOvr(b)-effOvr(a));
  const btn=(t,p)=>`<button type="button" class="btn tksm${p?' primary':''}">${t}</button>`;
  const ren=(P&&P.ren||[]).map(x=>{const g=gById(x.gid);if(!g)return '';const line=typeof ren105Line==='function'?ren105Line(g):'';
    const q=x.kind==='raise'?`asks ${wqCoin(x.wage)} a week (+${x.pct}%, was ${x.old}) for ${x.weeks} weeks`:'sat on the bench and asks to leave';
    return `<div class="wqrow">${wqArt(g)}<b>${esc(g.name)}</b>${line}<span class="rc-sub">${q}</span><span class="acts">${x.kind==='raise'?btn(`Sign ${esc(wqFirst(g))}`,1)+btn('Refuse'):btn('Let him go')+btn('Keep him',1)}</span></div>`}).join('');
  /* rudis requests: the pending 380 verdicts, else a mock one (the best record on the roster) */
  let rud=(w.pend||[]).filter(x=>x.t==='rudis'||x.t==='buyfree').map(x=>gById(x.gid)).filter(Boolean);let mockR=false;
  if(!rud.length&&ros.length){rud=[ros.slice().sort((a,b)=>((b.rec||{}).w||0)-((a.rec||{}).w||0))[0]];mockR=true}
  const rr=rud.map(g=>`<div class="wqrow">${wqArt(g)}<b>${esc(g.name)}</b><span class="rc-sub">${(g.rec||{}).w||0} wins · ${wqAge(g)} years · asks for the wooden sword</span><span class="acts">${btn('Grant the rudis',1)}${btn('Not yet')}</span></div>`).join('');
  const tr=ros.map(g=>{const c=g.contract||{};const wk=Math.max(0,c.weeks||0);let ph='';try{const x=c104Phase(g);ph={rise:'rising',prime:'prime',fade:'fading'}[x.ph]||''}catch(e){}
    return `<tr class="${wk<=8?'due':''}"><td class="nm">${wqArt(g)}<b>${esc(g.name)}</b></td><td>${wqGr(g)} ${effOvr(g)}</td><td>${wqAge(g)}</td><td>${esc(ph||'')}</td><td>${c.wage||0}</td><td>${wk<=8?`<span class="badge">${wk} wk</span>`:wk+' wk'}</td></tr>`}).join('');
  const nAsk=(P&&P.ren||[]).filter(x=>!x.st).length+rud.length;
  return wqBan(6,'Contracts, renewals, the rudis — the barracks’ winter business',wqChip(`${ros.length}`,'on the roster')+wqChip(`${nAsk}`,'asks'))
    +`<div class="wq2"><div class="card2 wq109c wqro"><div class="sect">✍ Contract asks</div>${ren||'<p class="rc-sub">No contract asks this winter.</p>'}
      <div class="sect">🗡 The rudis</div>${rr||'<p class="rc-sub">Nobody asks for freedom.</p>'}<p class="rc-sub">Unanswered asks lapse when the season starts.</p>
      ${wqSay('barracks','Answer them here and the barracks stays quiet all season.')}</div>
    <div class="card2 wq109c"><div class="sect">📜 Contracts</div><div class="wqtw"><table class="wqtbl wqct"><thead><tr><th>Fighter</th><th>OVR</th><th>Age</th><th>Career</th><th>Wage</th><th>Left</th></tr></thead><tbody>${tr}</tbody></table></div></div></div>`}

/* ---------------- 7 · the winter market of tirones ---------------- */
function wqMarket(w){const L=w.glads.filter(g=>g.alive&&!g.contract&&!g.inv&&!g.lanista&&wqAge(g)<=22).sort((a,b)=>(effOvr(b)+(b.pot||0)/3)-(effOvr(a)+(a.pot||0)/3)).slice(0,9);
  const lv=(()=>{try{return adv98Lv(w,'recruiter')}catch(e){return 1}})();
  const rows=L.map((g,i)=>{let wage=0;try{wage=askWage(g)}catch(e){}return `<div class="wqtiro${i===0?' star':''}">${wqArt(g)}<div class="wqat"><b>${i===0?'★ ':''}${esc(g.name)}</b><span class="rc-sub">${esc(wqCls(g))} · ${wqAge(g)} years</span><span>${wqGr(g)} <b>${effOvr(g)}</b> <span class="rc-sub">asks ${wqCoin(wage)}/wk</span></span></div><span class="acts">${''}<button type="button" class="btn tksm">🔍 Scout</button><button type="button" class="btn tksm primary">✍ Offer</button></span></div>`}).join('');
  return wqBan(7,'Young free agents, all signing for next season',wqChip(`${L.length}`,'tirones')+wqChip(`${lv}`,'Recruiter level'))
    +`<div class="card2 wq109c wqro"><div class="wqtiros">${rows||'<p class="rc-sub">No tirones this winter.</p>'}</div>${wqSay('recruiter',L[0]?`${esc(L[0].name)} is the one. Sign before a rival does.`:'A thin winter.')}</div>`}

/* ---------------- 8 · the winter training camp ---------------- */
const WQ_CAMP=[['str','💪','Strength & stamina','+1–2 Strength and Stamina'],['arms','⚔','Weapons','+1–2 Skill with the fighter’s own weapons'],['heal','♨','Mend & rest','every weary fighter fresh, small wounds healed'],['bond','🍷','Bond the house','+6 morale, +loyalty for all']];
function wqCamp(w){const pm=me();const ros=rosterOf(pm);const pick=WQ_CAMP[wqH(w.id)%2][0];
  const cards=WQ_CAMP.map(([k,i,n,d])=>`<button type="button" class="wqcamp${k===pick?' on':''}"><span class="ic">${i}</span><b>${n}</b><small>${d}</small></button>`).join('');
  const who=ros.map(g=>`<span class="wqwho2${g.inj?' off':''}">${wqArt(g)}<b>${esc(wqFirst(g))}</b><small>${g.inj?'in the ward':'in camp'}</small></span>`).join('');
  return wqBan(8,'One focus for the whole house over the winter',wqChip(`${ros.filter(g=>!g.inj).length}`,'in camp')+wqChip('0','injuries'))
    +`<div class="card2 wq109c wqro"><div class="sect">The camp’s focus</div><div class="wqcamps">${cards}</div><div class="sect">Who goes</div><div class="wqwhos">${who}</div>
    <p class="rc-sub">No drill injuries in camp. The fading years still take their toll at the season’s turn.</p>${wqSay('doctore','Give me the winter and I give you a sharper house in week 1.')}</div>`}

/* ---------------- 9 · THE WINTER CLASSIC ---------------- */
/* the seeds = the final league table (348's P.seeds); two rival houses sit out (MOCK: by hash) → one invited free agent + Sica's wildcard */
function wqSeeds(w){const P=wqP(w);let seeds=(P&&P.seeds||[]).slice();if(!seeds.length)try{seeds=po104Seeds(w)}catch(e){seeds=[]}
  const pm=me();const mk='m:'+pm.id;const cand=seeds.map((k,i)=>[k,i]).filter(([k])=>k&&k!==mk);const out=new Set();
  if(cand.length>3){out.add(cand[wqH(w.id+'o1')%cand.length][1]);let j=wqH(w.id+'o2')%cand.length;if(out.has(cand[j][1]))j=(j+1)%cand.length;out.add(cand[j][1])}
  const sica=w.mgrs.find(m=>m.sica);const fa=w.glads.filter(g=>g.alive&&!g.contract&&!g.inv).sort((a,b)=>effOvr(b)-effOvr(a))[0];
  let n=0;return seeds.map((k,i)=>{if(!out.has(i))return {k,i,kind:'house'};n++;
    if(n===1&&sica)return {k:'m:'+sica.id,i,kind:'wild',was:k};return {k:fa?'g:'+fa.id:null,i,kind:'inv',was:k}})}
function wqName(x){if(!x||!x.k)return 'an invited free agent';if(x.k.startsWith('g:')){const g=gById(x.k.slice(2));return g?g.name:"an invited free agent"}const m=mgrById(x.k.slice(2));return m?m.ludus:'?'}
function wqOrder(w,keys,tag){return keys.slice().sort((a,b)=>((wqH(w.id+tag+a.k)%100)-a.i*4)<((wqH(w.id+tag+b.k)%100)-b.i*4)?1:-1)}
function wqClassicRes(w){const S=wqSeeds(w);const A=[4,7,8,11].map(i=>S[i]),B=[5,6,9,10].map(i=>S[i]);const oA=wqOrder(w,A,'ra'),oB=wqOrder(w,B,'rb');
  const s1=[S[0],S[3],oA[0],oA[1]],s2=[S[1],S[2],oB[0],oB[1]];const o1=wqOrder(w,s1,'s1'),o2=wqOrder(w,s2,'s2');const F=[o1[0],o1[1],o2[0],o2[1]];const oF=wqOrder(w,F,'fin');
  return {S,A,B,oA,oB,s1,s2,o1,o2,F,oF,champ:oF[0]}}
function wqBracket(w,done){const R=wqClassicRes(w);const pm=me();const mk='m:'+pm.id;
  const row=(x,ord)=>{const m=x&&x.k&&x.k.startsWith('m:')?mgrById(x.k.slice(2)):null;const pl=ord?ord.indexOf(x)+1:0;const st=done&&ord?(pl<=2?' adv':' out'):'';
    const tag=x.kind==='wild'?'<i class="wqtag wild">wild</i>':x.kind==='inv'?'<i class="wqtag inv">inv.</i>':'';
    return `<div class="v104e${x.k===mk?' me':''}${st}"><span class="sd">${x.i+1}</span><span class="fl">${m?wqFlag(m,16):'<i class="v104nf">⚑</i>'}</span><b>${esc(wqName(x))}${tag}</b><span class="pl">${done&&pl?RN(pl):''}</span></div>`};
  const ph=t=>`<div class="v104e ph"><span class="sd"></span><span class="fl"></span><b>${t}</b><span class="pl"></span></div>`;
  const box=(t,sub,list,ord,phs,cls)=>`<div class="po104b v104b${cls?' '+cls:''}"><div class="v104bt">${t}${sub?`<small>${sub}</small>`:''}</div>${(list||[]).map(x=>row(x,ord)).join('')}${(phs||[]).map(ph).join('')}</div>`;
  const rA=box('Bout A · seeds 5·8·9·12','',R.A,done?R.oA:null),rB=box('Bout B · seeds 6·7·10·11','',R.B,done?R.oB:null);
  const s1=done?box('Semifinal I','',R.s1,R.o1):box('Semifinal I','',[R.S[0],R.S[3]],null,['Bout A · 1st','Bout A · 2nd']);
  const s2=done?box('Semifinal II','',R.s2,R.o2):box('Semifinal II','',[R.S[1],R.S[2]],null,['Bout B · 1st','Bout B · 2nd']);
  const fin=done?box('The final','the Saturnalia',R.F,R.oF,null,'fin'):box('The final','the Saturnalia',null,null,['Semifinal I · top 2','Semifinal II · top 2'],'fin');
  const lau=typeof lau103==='function'?lau103:()=>'';const cup=wqTr(WQ_CUP,52);const cm=done&&R.champ.k&&R.champ.k.startsWith('m:')?mgrById(R.champ.k.slice(2)):null;
  const champ=done?`<div class="v104ch on${cm&&cm.isPlayer?' me':''}"><div class="v104lr">${lau(false)}${cup}${lau(true)}</div><b>${esc(wqName(R.champ))}</b><small>holds the Cup until next winter</small><span class="v104cl">Winter champions</span></div>`
    :`<div class="v104ch"><div class="v104lr">${lau(false)}${cup}${lau(true)}</div><b>The Winter Classic Cup</b><small>travels to each new winner</small></div>`;
  const H=(c,t,wk)=>`<div class="v104hd" style="grid-column:${c}">${t}<small>${wk}</small></div>`;const L=x=>done?' lit':'';
  return `<div class="po104bk v104tr wqbk"><p class="po104pj">${done?'Preview with mock results · gold goes through · faded is out.':'Seeded by the final league table · seeds 1–4 rest on Day I · the top 2 of each bout go on.'}</p><div class="v104sx"><div class="v104g">
    ${H(1,'Day I','Round 1')}${H(3,'Day II','Semifinals')}${H(5,'Day III','The Saturnalia')}${H(7,'The Cup','')}
    <div class="v104cell" style="grid-column:1;grid-row:2">${rA}</div><div class="v104k k1${L()}" style="grid-column:2;grid-row:2"></div><div class="v104cell" style="grid-column:3;grid-row:2">${s1}</div>
    <div class="v104cell" style="grid-column:1;grid-row:3">${rB}</div><div class="v104k k1${L()}" style="grid-column:2;grid-row:3"></div><div class="v104cell" style="grid-column:3;grid-row:3">${s2}</div>
    <div class="v104k k2${L()}" style="grid-column:4;grid-row:2/4"></div><div class="v104cell" style="grid-column:5;grid-row:2/4">${fin}</div>
    <div class="v104k k1${L()}" style="grid-column:6;grid-row:2/4"></div><div class="v104cell" style="grid-column:7;grid-row:2/4">${champ}</div></div></div></div>`}
function wqClassic(w){const pm=me();const R=wqClassicRes(w);const mk='m:'+pm.id;const me1=R.S.find(x=>x.k===mk);const done=WQ109.view==='done';
  const ros=rosterOf(pm).slice().sort((a,b)=>effOvr(b)-effOvr(a));const pick=WQ109.pick&&ros.find(g=>g.id===WQ109.pick)||ros[0];
  const rules=['🕊 Clemency: no deaths, no severe wounds','🦾 Lost limbs regrow free','📊 No league points, no lifetime records','✋ Optional — sitting out costs nothing'].map(t=>`<span class="wqrule">${t}</span>`).join('');
  const entry=me1?`<div class="wqentry wqro2"><span class="wqseed">Seed <b>${me1.i+1}</b></span><label>Your fighter <select class="tin" data-wq109pick>${ros.map(g=>`<option value="${g.id}" ${g===pick?'selected':''}>${esc(g.name)} · ${esc(wqCls(g))} · ${effOvr(g)}</option>`).join('')}</select></label>
      <button type="button" class="btn primary sd100 sd100p" data-wq109="mock">✍ Enter ${esc(pick?wqFirst(pick):'')}</button><button type="button" class="btn tksm" data-wq109="mock">Sit it out</button></div>`:'<p class="rc-sub">Your house is not seeded.</p>';
  const prize=`<p class="rc-sub wqpr">The winner: the Cup (its name engraved in the Hall) · ${wqCoin('+60')} · +5 morale and loyalty for the whole house · Renown +20. Three wins = a replica to keep.</p>`;
  const tog=`<div class="wqtog"><button type="button" class="btn tksm${done?'':' on'}" data-wq109="view|entry">Entry</button><button type="button" class="btn tksm${done?' on':''}" data-wq109="view|done">Preview: the finished bracket</button><button type="button" class="btn tksm" data-wq109="go|hall">🏛 The Cup in the Hall</button></div>`;
  return wqBan(9,'The winter knockout · one fighter per house · seeded by the final table',wqChip('12','houses')+wqChip(me1?`#${me1.i+1}`:'—','your seed'))
    +`<div class="card2 wq109c wqcl"><div class="wqclh">${wqTr(WQ_CUP,74)}<div><div class="wqrules">${rules}</div>${prize}${entry}</div></div>${tog}${wqBracket(w,done)}
    <p class="rc-sub">Two houses sat out: their seats go to an invited free agent and to Sica’s Syndicate as the wildcard. Four-house bouts, the top 2 go on; seeds 1–4 rest on Day I.</p></div>`}
function wqHall(w){const R=wqClassicRes(w);const s=wqS(w);const ch=R.champ;const chm=ch&&ch.k&&ch.k.startsWith('m:')?mgrById(ch.k.slice(2)):null;
  const plates=[1,2,3,4,5,6].map(i=>i===s?`<div class="wqplate on"><span>${RN(i)}</span><b>${esc(wqName(ch))}</b></div>`:`<div class="wqplate${i<s?' on':''}"><span>${RN(i)}</span><b>${i<s?'—':''}</b></div>`).join('');
  return `<div class="roomhd wq109ban rm100ban v101ban w104ban cp105ban cp105one">${wqSky('hall')}<span class="rm100rd rm100adv cp105md" aria-hidden="true">🏛</span><div class="roomttl"><b>🏛 The Hall · The Winter Classic Cup</b><span>A travelling cup: each winner holds it until next winter</span></div>${wqChip(chm?wqFlag(chm,22):'—','holder')}</div>
    <div class="card2 wq109c wqhall"><div class="wqhc">${wqTr(WQ_CUP,150)}<div class="wqhct"><b class="wqhn">The Winter Classic Cup</b><p>Held by <b>${esc(wqName(ch))}</b> · Winter Classic ${RN(s)}</p><p class="rc-sub">Engraved on the base, one plate a winter. A house that wins it three times keeps a replica in its own Tituli.</p>
      <div class="wqrep">${chm?`${wqFlag(chm,18)} <b>${esc(chm.ludus)}</b> <span class="wqpips"><i class="on"></i><i></i><i></i></span> <span class="rc-sub">1 of 3 for the replica</span>`:''}</div></div></div>
      <div class="sect">The plates</div><div class="wqplates">${plates}</div><div class="acts"><button type="button" class="btn tksm" data-wq109="go|9">← The Winter Classic</button></div></div>`}

/* ---------------- ✦ · the Saturnalia ---------------- */
function wqSat(w){const R=wqClassicRes(w);const boon=(typeof FEST_KINDS!=='undefined'&&FEST_KINDS.saturnalia)?FEST_KINDS.saturnalia.boon:'+4 coin to every gladiator between events';
  const evn=k=>{try{const E=EVENTS[k];return E&&(E.name||E.n)||k}catch(e){return k}};
  const ev=[['🎭','Carmina Fescennina','Each fighter recites one verse before the games — the crowd’s favour carries into the race.'],['🏇',`${evn('chariot')}`,'Four chariots, no fighting between drivers. Laps, whips and the crowd.'],['⚔',`Classic · ${evn('democritus').replace(/^Classic\s*[·:-]\s*/,'')}`,'The last event on the sand, under clemency. The festival’s winner takes the Cup.']];
  const who=R.F.map(x=>`<span class="wqfin">${(()=>{const m=x.k&&x.k.startsWith('m:')?mgrById(x.k.slice(2)):null;return m?wqFlag(m,16):''})()} ${esc(wqName(x))}</span>`).join('');
  return wqBan(10,'The Winter Classic final · a festival of three events',wqChip('3','events')+wqChip('🕊','clemency'))
    +`<div class="card2 wq109c wqro"><div class="wqsats">${ev.map((e,i)=>`<div class="wqsatc"><span class="n">${RN(i+1)}</span><span class="ic">${e[0]}</span><b>${esc(e[1])}</b><small>${e[2]}</small></div>`).join('<i class="wqarr">→</i>')}</div>
      <p class="wqboon">🎁 Saturnalia: ${esc(boon)}</p><div class="sect">On the sand</div><div class="wqfins">${who}</div>
      <p class="rc-sub">The Winter Classic final: its four finalists play the festival; the best festival finish takes the Cup. No league points, no lifetime records; lost limbs regrow free.</p>
      <div class="acts"><button type="button" class="btn primary sd100 sd100p sd100m">🎭 Open the Saturnalia</button><button type="button" class="btn tksm">👁 Watch</button><button type="button" class="btn tksm">⚡ Simulate</button></div></div>`}

/* ---------------- 10 · next season ---------------- */
function wqNext(w){const s=wqS(w)+1;let fx=null;try{const C=calLoad();fx=C&&C.sched&&C.sched[s]}catch(e){}
  const L=(typeof LOCATIONS!=='undefined'?LOCATIONS:[]).map((x,i)=>x?[i,x.n]:null).filter(Boolean);
  if(!fx){const o=L.slice().sort((a,b)=>wqH('n'+s+a[0])-wqH('n'+s+b[0]));fx=o.slice(0,12).map((x,i)=>({wk:i+1,loc:x[0],ev:i===11?'cassian':'democritus'}))}
  const nm=i=>{const x=L.find(y=>y[0]===i);return x?x[1]:'—'};
  const wk=fx.slice(0,11).map(f=>{const bye=f.wk===4;const riv=f.wk===11;return `<div class="wqwk${bye?' bye':''}${riv?' riv':''}"><span class="n">${f.wk}</span><b>${bye?'Bye':esc(nm(f.loc))}</b><small>${bye?'rest week':riv?'Rivalry Week':''}</small></div>`}).join('')
    +[12,13,14].map((n,i)=>`<div class="wqwk po"><span class="n">${n}</span><b>${['Round 1','Semifinals','The final'][i]}</b><small>Superbus</small></div>`).join('')+'<div class="wqwk wq"><span class="n">❄</span><b>Winter</b><small>Quarters</small></div>';
  const G=[['🏛','Finish in the top 8','+30 Renown'],['🤝','Sign a B-grade fighter','+15 Renown'],['🕊','No deaths all season','the Medicus rises']];
  return wqBan(11,`Season ${s} · the road ahead and the Consilium’s goals`,wqChip('11 + 3','weeks')+wqChip('3','goals'))
    +`<div class="card2 wq109c"><div class="sect">📅 The schedule</div><div class="wqwks">${wk}</div></div>
    <div class="card2 wq109c wqro"><div class="sect">🎯 The Consilium’s goals</div><div class="wqgoals">${G.map(g=>`<div class="wqgoal"><span class="ic">${g[0]}</span><b>${g[1]}</b><small>${g[2]}</small></div>`).join('')}</div>${wqSay('consilium','Three goals, no more. Meet them and the house grows.')}</div>`}

const WQ_FN=[wqOver,wqAwards,wqBooks,wqCouncil,wqRenown,wqFac,wqStaff,wqMarket,wqCamp,wqClassic,wqSat,wqNext];
function wq109HTML(w){const st=WQ109.step;if(st==='hall')return `<div class="wq109" data-wq109step="hall">${wqStepper(9)}${wqHall(w)}</div>`;const i=Math.max(0,Math.min(WQ_R.length-1,+st||0));
  let body='';try{body=WQ_FN[i](w)}catch(e){console.error(e);body=`<p class="rc-sub">Mock-up error: ${esc(String(e&&e.message||e))}</p>`}
  return `<div class="wq109" data-wq109step="${i}">${wqStepper(i)}${body}${wqNav(i)}</div>`}
window.wq109HTML=wq109HTML;
/* the stepper strip keeps the current room in view (phones scroll it sideways) */
function wq109Scroll(){try{const st=document.querySelector('.wq109st'),c=st&&st.querySelector('.wqs.cur');if(c)st.scrollLeft=Math.max(0,c.offsetLeft-(st.clientWidth-c.offsetWidth)/2)}catch(e){}}
window.wq109Scroll=wq109Scroll;

/* the page: the Match Week tab in the off-season week becomes Winter Quarters */
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{if(!wqLive()||typeof h!=='string')return h;const w=W_();
  const t=document.createElement('template');t.innerHTML=h;const R=t.content;
  const nb=R.querySelector('.mtabs [data-mg="tab"][data-id="night"]');if(nb){for(const x of [...nb.childNodes])if(x.nodeType===3)x.remove();nb.insertBefore(document.createTextNode('❄ Winter Quarters'),nb.firstChild);const c=nb.querySelector('.tabchk');if(c)c.remove();
}
  if(MGR.tab==='night'&&!MGR.view){const pane=R.querySelector('#mgrPane');if(pane){const prev=pane.previousElementSibling;if(prev&&prev.classList.contains('roomhd'))prev.remove();
    pane.innerHTML=wq109HTML(w);setTimeout(wq109Scroll,0)}}
  const d=document.createElement('div');d.appendChild(R);return d.innerHTML}catch(e){console.error(e)}return h}}
/* the stepper + the mock-up's read-only guard (capture: nothing in a Winter Quarters room changes the world) */
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest||!wqLive())return;const b=t.closest('[data-wq109]');
  if(b){e.preventDefault();e.stopImmediatePropagation();const [a,v]=b.dataset.wq109.split('|');
    if(a==='go'){WQ109.step=v==='hall'?'hall':+v;if(typeof MGR_REDRAW==='function')MGR_REDRAW();try{const p=document.querySelector('#mgrPane');if(p)p.scrollIntoView({block:'start'})}catch(x){}return}
    if(a==='view'){WQ109.view=v;if(typeof MGR_REDRAW==='function')MGR_REDRAW();return}
    try{mToast('❄ Mock-up — not live yet')}catch(x){}return}
  const ro=t.closest('.wq109 button,.wq109 [data-pk87],.wq109 [data-mg="build"],.wq109 [data-mg="perk"]');
  if(ro&&ro.closest('.wq109')){e.preventDefault();e.stopImmediatePropagation();try{mToast('❄ Mock-up — not live yet')}catch(x){}}},true);
document.addEventListener('change',e=>{const s=e.target;if(s&&s.matches&&s.matches('[data-wq109pick]')){WQ109.pick=s.value;if(typeof MGR_REDRAW==='function')MGR_REDRAW()}},true);

{const st=document.createElement('style');st.textContent=`
.wq109{display:flex;flex-direction:column;gap:8px;min-width:0}
.wq109st{display:flex;align-items:center;gap:0;overflow-x:auto;padding:6px 4px;border:1px solid #6b5236;border-radius:8px;background:linear-gradient(180deg,#1d2230,#14100c);scrollbar-width:thin}
.wq109st .wqs{flex:none;display:flex;flex-direction:column;align-items:center;gap:1px;min-width:62px;padding:3px 4px;border:0;background:none;color:#cbb593;cursor:pointer;font:600 11px var(--sans,system-ui);border-radius:6px}
.wq109st .wqs .n{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;border:1px solid #8a6a2c;background:#1a120d;color:#f0cf7d;font:400 14px var(--display)}
.wq109st .wqs.done .n{background:#2c4a2a;border-color:#9fdc8a;color:#d6f5c8}.wq109st .wqs.cur .n{background:linear-gradient(#f6dc98,#c99a3a);color:#2a1a08;border-color:#fff1c4;box-shadow:0 0 8px #f0cf7d88}
.wq109st .wqs.cur{color:#fff3d6}.wq109st .wqs.fin .n{border-color:#c98ad8;color:#e8c8f0}.wq109st .wqs.ov{min-width:36px;font-size:18px;color:#cfe0ff}.wq109st .wqs.ov.cur{text-shadow:0 0 8px #9fc4ff}
.wq109st .wqs:focus-visible{outline:2px solid #f0cf7d}.wq109st .wqsl{flex:1 0 8px;min-width:8px;height:2px;background:#6b5236;margin-bottom:14px}
#mgrBody .roomhd.wq109ban::after{background:linear-gradient(90deg,#0c1018d8 0,#0c101890 38%,#0c101820 62%,#0c101880 100%)}
#mgrBody .roomhd.wq109ban .wqchip .ptbox{color:#cfe6ff!important}.wqchip .ptbox img{vertical-align:middle}
.wq109c{min-width:0}.wq109c .sect{display:flex;gap:8px;align-items:baseline}.wqlead{margin:0 0 8px;font-size:14px}
.wq2{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:8px}.wq2>.card2{margin:0}
.wqtiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px}
.wqt{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;padding:10px 10px 10px 40px;min-height:74px;border:1px solid #6b5236;border-radius:8px;background:linear-gradient(160deg,#2a2018,#17110c);color:#f3e3bd;cursor:pointer}
.wqt:hover{border-color:#d6ab4c}.wqt .n{position:absolute;left:8px;top:10px;display:grid;place-items:center;width:24px;height:24px;border-radius:50%;border:1px solid #8a6a2c;font:400 13px var(--display);color:#f0cf7d}
.wqt .ic{position:absolute;right:8px;top:8px;font-size:18px;opacity:.85}.wqt b{font:400 16px var(--display);color:#f6dc98;padding-right:22px}.wqt small{font-size:12px;color:#cbb593}
.wqt.gold{background:linear-gradient(160deg,#2a2440,#1a1222);border-color:#9a86c8}
.wq109nav{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center;margin-top:2px}.wq109nav .btn{max-width:100%}
.wqpods{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:4px 0 8px}
.wqpod{display:flex;flex-direction:column;align-items:center;text-align:center;gap:3px;padding:8px 6px;border:1px solid rgba(214,171,76,.5);border-radius:8px;min-width:0}.wqpod.p1{border-color:#d6ab4c;background:rgba(214,171,76,.16)}.wqpod.me{outline:2px solid #d6ab4c}
.wqpod .pl{font:400 22px var(--display);color:var(--gold2)}.wqpod b{font-size:13px;overflow-wrap:anywhere}.wqpod small{font-size:11px;color:#cbb593}
.wqsb{display:flex;align-items:center;gap:8px;margin:0 0 6px;font-size:14px}
.wqtw{overflow-x:auto;max-width:100%}.wqtbl{width:100%;border-collapse:collapse;font-size:12.5px}.wqtbl th{text-align:left;font:600 10.5px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:#cbb593;padding:3px 5px;border-bottom:1px solid #6b5236}
.wqtbl td{padding:3px 5px;border-bottom:1px dashed rgba(214,171,76,.18);white-space:nowrap}.wqtbl td.hs{max-width:220px;overflow:hidden;text-overflow:ellipsis}.wqtbl tr.me td{background:rgba(214,171,76,.2)}.wqtbl tr.pod td.pl{color:var(--gold2);font-weight:700}
.wqtbl td.sb.ch{color:#f6dc98;font-weight:700}.wqtbl .flagchip{vertical-align:middle}
.wqaws{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px}.wqaw{display:flex;gap:8px;align-items:center;padding:6px;border:1px solid rgba(214,171,76,.35);border-radius:8px;min-width:0}.wqaw.me{outline:2px solid #d6ab4c}
.wqaw>div{display:flex;flex-direction:column;min-width:0}.wqaw b{color:#f6dc98}.wqaw .rc-sub{font-size:11px}.wqwho{font-size:13px;font-weight:600}.wqaw small{font-size:11px;color:#cbb593}
.wqbar{display:grid;grid-template-columns:150px minmax(0,1fr) 64px;gap:8px;align-items:center;font-size:12.5px;margin:3px 0}.wqbar .b{height:10px;border-radius:5px;background:rgba(0,0,0,.35);overflow:hidden}.wqbar .b i{display:block;height:100%}
.wqbar.i .b i{background:linear-gradient(90deg,#4f8a3a,#9fdc8a)}.wqbar.o .b i{background:linear-gradient(90deg,#8a2a1a,#e07a5a)}.wqbar .v{text-align:right;font:600 12px var(--mono)}.wqbar.i .v{color:#9fdc8a}.wqbar.o .v{color:#f2a497}
.wqtot{margin:8px 0 0;font-size:14px}.wqtot .up{color:#9fdc8a;font-weight:700}.wqtot .dn{color:#f2a497;font-weight:700}
.wqll{display:flex;justify-content:space-between;gap:8px;padding:3px 0;border-bottom:1px dashed rgba(214,171,76,.25);font-size:13px}.wqll b{font-family:var(--mono)}.wqll.tot{border-bottom:0;border-top:1px solid #d6ab4c;margin-top:4px;padding-top:6px;font-size:14px}
.wqsay{margin-top:10px}
.wqadvs{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:8px}.wqadv{display:flex;gap:10px;align-items:flex-start;padding:8px;border:1px solid rgba(214,171,76,.35);border-radius:8px;min-width:0}.wqadv.up{border-color:#9fdc8a;background:rgba(80,140,60,.12)}
.wqface{flex:none;width:64px;height:64px;border-radius:50%;overflow:hidden;border:2px solid #8a6a2c;display:grid;place-items:center}.wqface svg,.wqface img{width:100%;height:100%}
.wqat{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}.wqat b{color:#f6dc98}.wqstars{color:#f0cf7d;letter-spacing:2px;font-size:12px}.wqv{margin:3px 0;font-size:12.5px;font-style:italic}
.wqprog{display:flex;flex-wrap:wrap;gap:4px}.wqrq{font:11px var(--mono);padding:1px 6px;border-radius:9px;border:1px solid #6b5236;color:#cbb593}.wqrq.ok{border-color:#9fdc8a;color:#9fdc8a}.wqadv>.btn{align-self:center}
.wqnote{font-size:13px}
.wqrow{display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;padding:5px 0;border-bottom:1px dashed rgba(214,171,76,.3)}.wqrow .acts{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap}
.wqct td.nm{display:flex;gap:6px;align-items:center;white-space:normal;min-width:150px}.wqct td{padding:3px 4px}.wqct tr.due td{color:#f6dc98}.wqgr{display:inline-block;min-width:22px;text-align:center;font:700 11px var(--mono);padding:1px 4px;border-radius:3px;border:1px solid var(--gc);color:var(--gc)}
.wqtiros{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px}.wqtiro{display:flex;gap:8px;align-items:center;padding:6px 8px;border:1px solid rgba(214,171,76,.35);border-radius:8px;min-width:0;flex-wrap:wrap}.wqtiro.star{border-color:#d6ab4c;background:rgba(214,171,76,.12)}
.wqtiro .acts{display:flex;gap:6px;margin-left:auto}
.wqcamps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.wqcamp{display:flex;flex-direction:column;align-items:center;text-align:center;gap:3px;padding:10px 8px;border:1px solid #6b5236;border-radius:8px;background:#1a120d;color:#f3e3bd;cursor:pointer}
.wqcamp.on{border-color:#f0cf7d;background:linear-gradient(160deg,#3a2c18,#1a120d);box-shadow:0 0 0 2px #f0cf7d55}.wqcamp .ic{font-size:24px}.wqcamp b{font:400 16px var(--display);color:#f6dc98}.wqcamp small{font-size:12px;color:#cbb593}
.wqwhos{display:flex;flex-wrap:wrap;gap:8px}.wqwho2{display:flex;flex-direction:column;align-items:center;gap:1px;padding:4px 8px;border:1px solid rgba(214,171,76,.35);border-radius:8px;min-width:72px}.wqwho2.off{opacity:.5}.wqwho2 small{font-size:10.5px;color:#cbb593}
.wqclh{display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap}.wqclh>div{flex:1;min-width:240px}.wqrules{display:flex;flex-wrap:wrap;gap:6px}.wqrule{font-size:12.5px;padding:3px 9px;border-radius:12px;border:1px solid #7a8ab0;background:#1c2232;color:#dfe8ff}
.wqpr{margin:6px 0}.wqentry{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:6px 0}.wqentry label{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.wqentry select{max-width:100%}.wqseed{font-size:13px}.wqseed b{font:400 20px var(--display);color:var(--gold2)}
.wqtog{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 0}.wqtog .btn.on{border-color:#f0cf7d;color:#f6dc98;background:#3a2c18}
.wqbk .v104b{background:rgba(20,24,40,.5)}.wqtag{font-style:normal;font:600 9.5px var(--mono);padding:0 4px;border-radius:3px;margin-left:4px;vertical-align:middle}.wqtag.wild{background:#5a1a2a;color:#ffb0b8}.wqtag.inv{background:#24324a;color:#bcd4ff}
.wqhall .wqhc{display:flex;gap:16px;align-items:center;flex-wrap:wrap}.wqhct{flex:1;min-width:240px}.wqhn{font:400 26px var(--display);color:#e8eef8}.wqrep{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:6px}
.wqpips{display:inline-flex;gap:3px}.wqpips i{width:12px;height:12px;border-radius:50%;border:1px solid #c9d1dc}.wqpips i.on{background:#c9d1dc}
.wqplates{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}.wqplate{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 4px;min-height:46px;border-radius:4px;background:linear-gradient(#7a7f8a,#4a4f5a);color:#1a1d24;border:1px solid #c9d1dc;opacity:.45}.wqplate.on{opacity:1;background:linear-gradient(#e8ecf2,#9aa2b0)}.wqplate span{font:400 13px var(--display)}.wqplate b{font-size:11px;text-align:center;overflow-wrap:anywhere}
.wqsats{display:flex;align-items:stretch;gap:6px}.wqsatc{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;text-align:center;gap:3px;padding:10px 8px;border:1px solid #9a86c8;border-radius:8px;background:linear-gradient(160deg,#2a2040,#160f1e)}
.wqsatc .n{font:400 14px var(--display);color:#e8c8f0}.wqsatc .ic{font-size:28px}.wqsatc b{font:400 17px var(--display);color:#f6dc98}.wqsatc small{font-size:12px;color:#d8cbe8}.wqarr{align-self:center;font-style:normal;color:#9a86c8;font-size:20px}
.wqboon{margin:8px 0;font-size:13.5px}.wqfins{display:flex;flex-wrap:wrap;gap:6px}.wqfin{padding:3px 9px;border-radius:12px;border:1px solid #6b5236;font-size:13px}
.wqwks{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:6px}.wqwk{display:flex;flex-direction:column;align-items:center;text-align:center;gap:1px;padding:6px 3px;border:1px solid #6b5236;border-radius:6px;min-width:0}.wqwk .n{font:400 15px var(--display);color:var(--gold2)}.wqwk b{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}.wqwk small{font-size:10.5px;color:#cbb593}
.wqwk.bye{opacity:.6}.wqwk.riv{border-color:#c0433a}.wqwk.po{border-color:#d6ab4c;background:rgba(214,171,76,.12)}.wqwk.wq{border-color:#7a8ab0;background:#1c2232}
.wqgoals{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.wqgoal{display:flex;flex-direction:column;align-items:center;text-align:center;gap:2px;padding:10px 6px;border:1px solid rgba(214,171,76,.45);border-radius:8px}.wqgoal .ic{font-size:22px}.wqgoal b{font-size:13.5px}.wqgoal small{color:#9fdc8a;font-size:12px}
@media (max-width:760px){.wq2{grid-template-columns:minmax(0,1fr)}.wqcamps{grid-template-columns:repeat(2,minmax(0,1fr))}.wqsats{flex-direction:column}.wqarr{transform:rotate(90deg)}.wqwks{grid-template-columns:repeat(4,minmax(0,1fr))}.wqplates{grid-template-columns:repeat(3,minmax(0,1fr))}
  .wqgoals{grid-template-columns:minmax(0,1fr)}.wqbar{grid-template-columns:110px minmax(0,1fr) 54px}.wqtiles{grid-template-columns:repeat(2,minmax(0,1fr))}.wqt{padding-left:36px}.wqadvs,.wqtiros,.wqaws{grid-template-columns:minmax(0,1fr)}.wq109st .wqs{min-width:54px}
  .wqpods{gap:4px}.wqpod b{font-size:11.5px}}
`;document.head.appendChild(st)}
}
