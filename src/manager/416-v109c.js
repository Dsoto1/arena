/* =====================================================================
   416-v109c — v1.09c THE SATURNALIA, the Winter Classic's finale (Manager off-season). His "go ahead with v1.09c" = W1a W2a W4a
   (tools/plans/v109/NOTES.md + MOCKUP.md ✦ row). Kill switch localStorage flavius_v109coff=1 (= v1.09b: the provisional Day III, the
   rudis asks when the off-season opens). Test tv109c.
   W1a DAY III IS THE SATURNALIA: the four finalists (415 C.fin) play 10-meta's festival — I Carmina Fescennina → II Chariot Racing (no
     PvP, chPvp:false) → III Classic · Democritus; the best festival finish takes the Cup → 415 wcSettle (prizes W15a, plate, replica as
     before). window.wc109Final (415 calls it through window) is replaced: ⚡ Simulate the Saturnalia, Begin and endWeek all finish it.
   REUSE, NO FORK (10-meta): the festival = two Match Week bouts of tier wc109 in w.night.bouts (b.wc109.fs 1 / 2), played by 17's own
     runBoutSim / watchBout (👁 Watch / ⚔ Fight / ▶ Simulate, data-mg) → applyBout (415's clemency: no deaths, wounds undone, limbs
     regrow, no records, no points, no Renown). boutCfg wrapper: stage 1 = startFestival's config (ev chariot, loc 7, chPvp:false,
     fest {kind:'saturnalia', sr:'democritus', stage:1}) → 05-flow runs runCarmina itself before the race (W2a: the ceremony, its verses'
     rewards carry over, no score of its own); stage 2 = continueFestival's config: when the race ends (gameOver wrapper, sim or live)
     continueFestival(rows) is CALLED with startEvent / log held, its seats (race CF + coin carried, FEST_KINDS.saturnalia's boon) and
     race order are kept in C.fest and laid on the Democritus bout's seats. Live: the results window's "Continue the festival" opens the
     Democritus bout through watchBout (mgrCtx kept). The festival champion = gameOver's own rule (the highest final CF of the last event).
   PLAY NOW UNTOUCHED: a fest with .wc109 never reaches recordEvent / updateCrowdAfterEvent / logCustomChars (Hall, Annals, records, the
     crowd's memory); Play Now's startFestival / continueFestival / FEST_KINDS are not changed; no online code; dice: each stage is its
     own seeded simEvent run (17's path), the league's and the live game's RNG untouched.
   W4a RUDIS: contracts stay in room 6; 380 rudis105Window is closed in Winter Quarters until the Saturnalia has a winner, then the asks
     are made once (380's own ask105, exposed as window.rudis105Ask; C.rud) and shown in room 10 (pendingHTML moved there; the other
     rooms drop the box when it holds only freedom asks). 380's rule stays: open verdicts block the week's end — so ▶ Begin finishes the
     Saturnalia first, and when that makes asks it stops in room 10 to answer them.
   ROOM 9: the bracket's final column reads ✦ Saturnalia; the Day III card = the three events (status), the boon, the four finalists
     (race place, festival finish), Watch / Fight / Simulate per event + ⚡ Simulate the Saturnalia (415's data-wc109="final"), then the
     standings and the Cup. REPLACES: 415's provisional Day III (one simulated Democritus) · 380's asks at the off-season's opening.
   SAVES: w.wc109 gains d[3] = [festival finish, race, Democritus], fest {carry[{gid,cf,coin}], oid, gids}, rud (optional). A v1.09b save
     mid Day III: the provisional bout is dropped and the Saturnalia starts; a stage 2 with no carry falls back to the race's CF.
   ===================================================================== */
const V109C={on:(()=>{try{return localStorage.getItem('flavius_v109coff')!=='1'}catch(e){return true}})(),cap:null,cart:false};
window.V109C=V109C;
if(V109C.on&&typeof V109B!=='undefined'&&V109B.on&&typeof WC109T!=='undefined'&&typeof FEST_KINDS!=='undefined'&&typeof continueFestival==='function'){
const SAT={kind:'saturnalia',sr:'democritus',loc1:7,loc2:6};
const satS=w=>{try{return WC109T.s(w)}catch(e){return null}};
const satB=(w,C)=>WC109T.bouts(w,C,3).filter(([b])=>b.wc109&&b.wc109.fs);
const satOn=(w,C)=>!!(C&&C.fin&&wqLive(w));
/* Day III: the race and the Democritus as two bouts; d[3] = [0 festival finish, 1 race, 2 Democritus] */
function satEnsure(w,C){if(!C||!C.fin||C.champ!=null)return;
  if(C.d[3]&&!satB(w,C).length){w.night.bouts=w.night.bouts.filter(b=>!(b.wc109&&b.wc109.s===C.s&&b.wc109.d===3&&!b.done));delete C.d[3]}
  if(C.d[3])return;
  C.d[3]=[0,1,2].map(()=>({ix:C.fin.slice(),adv:null,pl:null}));
  const b1=WC109T.bout(w,C,3,1,C.fin);b1.ev='chariot';b1.wc109.fs=1;
  const b2={...JSON.parse(JSON.stringify(b1)),ev:SAT.sr,bets:[],res:null,done:false};b2.wc109.i=2;b2.wc109.fs=2;
  w.night.bouts.push(b1,b2);C.fest=null}
/* the festival finish: the last event's final CF (gameOver's champion rule), then its places */
function satStand(b){return [...((b&&b.res&&b.res.rows)||[])].sort((x,y)=>(y.f||0)-(x.f||0)||(x.place||99)-(y.place||99))}
function satSettle(w,C){if(!C||C.champ!=null)return;const L=satB(w,C);if(L.length<2||L.some(([b])=>!b.done))return;const b1=L[0][0],b2=L[1][0];const W=b2.wc109;
  let rows=satStand(b2).filter(r=>b2.ents.includes(r.gid)).map(r=>r.gid);
  if(rows.length<b2.ents.length){const r1=(C.fest&&C.fest.oidG)||[...((b1.res&&b1.res.rows)||[])].sort((x,y)=>(x.place||99)-(y.place||99)).map(r=>r.gid);
    for(const g of [...r1,...b2.ents])if(b2.ents.includes(g)&&!rows.includes(g))rows.push(g)}
  const x2=C.d[3][2];if(x2&&!x2.pl&&b2.res){x2.pl=[...b2.res.rows].sort((x,y)=>(x.place||99)-(y.place||99)).map(r=>({j:W.ix[b2.ents.indexOf(r.gid)],gid:r.gid,place:r.place})).filter(r=>r.j!=null);x2.adv=[]}
  C.d[3][0].pl=null;const syn={done:true,ents:b2.ents.slice(),wc109:{...W,i:0},res:{rows:rows.map((gid,k)=>({gid,place:k+1}))}};
  WC109T.settle(w,C,syn);satAsks(w,C)}
/* W1a: window.wc109Final — the Saturnalia, simulated to its end (Begin, endWeek, ⚡ Simulate the Saturnalia) */
async function satFinal(w,C){if(!C||C.champ!=null||!C.fin)return C?C.champ:null;satEnsure(w,C);
  for(const [b,bi] of satB(w,C)){if(!b.done)await runBoutSim(bi);if(!b.done)break}
  if(C.champ==null)satSettle(w,C);return C.champ}
window.wc109Final=satFinal;

/* ---------------- stage configs: startFestival's and continueFestival's (10-meta) ---------------- */
{const base=boutCfg;boutCfg=function(bout){const cfg=base.apply(this,arguments);try{const W=bout&&bout.wc109;if(!cfg||!W||!W.fs)return cfg;const w=W_();const C=satS(w);if(!C)return cfg;
    const bi=w.night.bouts.indexOf(bout);
    if(W.fs===1){cfg.ev='chariot';cfg.loc=SAT.loc1;cfg.chPvp=false;cfg.fest={kind:SAT.kind,sr:SAT.sr,stage:1,seats:cfg.seats.map(s=>({...s})),wc109:{s:C.s,bi}};return cfg}
    const F=C.fest;const same=F&&Array.isArray(F.gids)&&F.gids.join()===bout.ents.join();
    const L=satB(w,C);const b1=L[0]&&L[0][0];const r1=b1&&b1.res?b1.res.rows:[];
    cfg.seats.forEach((s,i)=>{const gid=bout.ents[i];const c=F&&(F.carry||[]).find(x=>x.gid===gid);
      if(c){s.cfStart=c.cf;s.coinStart=c.coin}else{const r=r1.find(x=>x.gid===gid);s.cfStart=r?r.f||0:0;s.coinStart=0;FEST_KINDS[SAT.kind].ap(s)}});
    cfg.ev=SAT.sr;cfg.loc=SAT.loc2;if(same&&Array.isArray(F.oid)&&F.oid.length===cfg.seats.length)cfg.order=F.oid.slice();
    cfg.fest={kind:SAT.kind,sr:SAT.sr,stage:2,seats:cfg.seats.map(s=>({...s})),wc109:{s:C.s,bi}}}catch(e){console.error(e)}return cfg}}
/* the race ends (sim or live): continueFestival itself builds stage 2 — its startEvent is held and read */
function satCapture(winners){const F=S.fest;const ws=new Set((winners||[]).map(x=>x&&typeof x==='object'?x.id:x));
  const rows=S.players.map(p=>{const won=ws.has(p.id);return {p,won,f:finalCF(p,won)}});let cap=null;
  const se=startEvent,lg=log;V109C.cart=true;startEvent=c=>{cap=c};log=()=>{};try{continueFestival(rows)}finally{startEvent=se;log=lg;V109C.cart=false}
  if(!cap)return;const gid=i=>S.players[i]&&S.players[i].mgrGid;
  V109C.cap={s:F.wc109.s,bi:F.wc109.bi,oid:(cap.order||[]).slice(),oidG:(cap.order||[]).map(id=>gid(S.players.findIndex(p=>p.id===id))).filter(Boolean),
    carry:(cap.seats||[]).map((s,i)=>({gid:gid(i),cf:s.cfStart||0,coin:s.coinStart||0})).filter(x=>x.gid),gids:S.players.map(p=>p.mgrGid)}}
{const base=gameOver;gameOver=async function(winners){try{if(S&&S.fest&&S.fest.wc109&&S.fest.stage===1&&!S.overShown)satCapture(winners)}catch(e){console.error(e)}return base.apply(this,arguments)}}
/* live: "Continue the festival" → the Democritus bout, watched (or fought) with the Manager's context */
{const base=continueFestival;continueFestival=function(){if(V109C.cart||!(S&&S.fest&&S.fest.wc109))return base.apply(this,arguments);
  try{const w=W_();const C=satS(w);const L=C?satB(w,C):[];const x=L.find(([b])=>b.wc109.fs===2);if(x&&!x[0].done){const fight=S.players.some(p=>!p.cpu);watchBout(x[1],fight);return}}catch(e){console.error(e)}
  try{if(typeof mgrFadeBack==='function')mgrFadeBack()}catch(e){}}}
/* Play Now's records, Annals, Hall and crowd memory never see a Manager festival */
for(const k of ['recordEvent','updateCrowdAfterEvent','logCustomChars']){try{const base=window[k];if(typeof base!=='function')continue;
  const f=async function(){if(S&&S.fest&&S.fest.wc109)return;return base.apply(this,arguments)};
  if(k==='recordEvent')recordEvent=f;else if(k==='updateCrowdAfterEvent')updateCrowdAfterEvent=f;else logCustomChars=f}catch(e){console.error(e)}}
/* the bouts land: the race keeps its carry, the Democritus decides the festival (415's settle is held for it) */
{const base=applyBout;applyBout=function(bi){const w=W_();const b=w&&w.night&&w.night.bouts&&w.night.bouts[bi];const W=b&&b.wc109;
  if(!W||b.done||W.d===3&&!W.fs){const r=base.apply(this,arguments);try{const C=satS(w);if(C&&C.fin&&C.champ==null&&W&&W.d===2)satEnsure(w,C)}catch(e){console.error(e)}return r}
  if(!W.fs)return base.apply(this,arguments);
  const C=satS(w);const x2=C&&C.d[3]&&C.d[3][2];const hold=W.fs===2&&x2&&!x2.pl;if(hold)x2.pl=[];let r;
  try{r=base.apply(this,arguments)}finally{if(hold)x2.pl=null}
  try{if(!C||!b.done)return r;
    if(W.fs===1){const K=V109C.cap;V109C.cap=null;if(K&&K.s===C.s&&K.bi===bi)C.fest={carry:K.carry,oid:K.oid,oidG:K.oidG,gids:K.gids};
      const x1=C.d[3][1];const og=C.fest&&C.fest.oidG;if(x1&&og&&og.length)x1.pl=og.map((gid,k)=>({j:W.ix[b.ents.indexOf(gid)],gid,place:k+1})).filter(y=>y.j!=null)}
    else satSettle(w,C);saveWorld()}catch(e){console.error(e)}return r}}

/* ---------------- W4a: the rudis asks after the Saturnalia ---------------- */
const satRudOn=()=>typeof rudis105Window==='function'&&!(typeof V105RUDIS_OFF!=='undefined'&&V105RUDIS_OFF);
if(satRudOn()){const base=rudis105Window;rudis105Window=function(w){const r=base.apply(this,arguments);if(!r)return r;
  try{w=w||W_();if(!wqLive(w))return r;const C=w.wc109;return !!(C&&C.s===w.season&&C.champ!=null)}catch(e){return r}}}
function satAsks(w,C){if(!C||C.champ==null||C.rud)return 0;C.rud=1;if(!satRudOn()||typeof window.rudis105Ask!=='function'||!rudis105Window(w))return 0;
  const tn=tnews;let n=0;try{tnews=function(){}}catch(e){}try{n=window.rudis105Ask(w)||0}catch(e){console.error(e)}finally{try{tnews=tn}catch(e){}}
  if(n)try{tnews(_T`🗡 The Saturnalia is over: ${n} freedom ask${n===1?'':'s'} wait in Next season.`,'big')}catch(e){}return n}
window.wc109Asks=satAsks;
const satFree=w=>(w.pend||[]).filter(p=>p&&(p.t==='rudis'||p.t==='buyfree')).length;
/* ▶ Begin: the Saturnalia first; asks it makes are answered in room 10 before the season starts (380: verdicts block the week's end) */
{const base=wqBegin;wqBegin=async function(){const w=W_();try{if(w&&wqLive(w)&&!MGR.busy){const C=wc109Ensure(w);if(C&&C.st){
    if(C.champ==null||!C.rud){MGR.busy=true;try{await wc109Finish(w);satAsks(w,C)}finally{MGR.busy=false}}
    if(satFree(w)){try{mToast(_T('The Saturnalia is over — answer the freedom asks, then begin the season.'))}catch(e){}wqGo('next');return false}}}}catch(e){console.error(e)}
  return base.apply(this,arguments)};window.wqBegin=wqBegin}
{const base=endWeek;endWeek=async function(){const w=W_();try{if(w&&!w.dead&&wqLive(w)){const C=w.wc109&&w.wc109.s===w.season?w.wc109:null;
    if(C){if(C.champ==null)await wc109Finish(w);satAsks(w,C)}}}catch(e){console.error(e)}return base.apply(this,arguments)}}
/* first sight: Day III's bouts, a v1.09b save, the asks of a festival already decided */
{const base=mgrHTML;mgrHTML=function(){try{const w=W_();if(w&&wqLive(w)){const C=satS(w);if(C&&C.fin){if(C.champ==null)satEnsure(w,C);else satAsks(w,C)}}}catch(e){console.error(e)}return base.apply(this,arguments)}}

/* ---------------- room 9: the ✦ Saturnalia ---------------- */
const SAT_EV=()=>[['🎭',_T('Carmina Fescennina'),_T('the opening ceremony: one verse each, no score')],['🏇',_T('Chariot Racing'),_T('three laps · no attacks')],['⚔',_T('Classic · Democritus'),_T('the race’s CF and coin carry over')]];
function satHTML(w,C){const pm=me();const L=satB(w,C);const [b1,bi1]=L[0]||[],[b2,bi2]=L[1]||[];const D=C.d[3]||[];const FK=FEST_KINDS[SAT.kind];const done=C.champ!=null;
  const st=[!!(b1&&b1.done)||done,!!(b1&&b1.done)||done,!!(b2&&b2.done)||done];const nx=st.indexOf(false);
  const evs=SAT_EV().map((e,i)=>`<div class="sat109e${st[i]?' done':''}${i===nx||(nx===0&&i===1)?' cur':''}" data-sat109ev="${i+1}"><span class="n">${RN(i+1)}</span><span class="ic">${e[0]}</span><b>${esc(e[1])}</b><small>${esc(e[2])}</small><i>${st[i]?'✓':''}</i></div>`).join('');
  const plOf=(x,j)=>{const p=x&&x.pl?x.pl.find(y=>y.j===j):null;return p?RN(p.place):'—'};
  const rows=C.fin.map(j=>{const s=C.seats[j];const m=WC109T.m(s&&s.k);const p=D[0]&&D[0].pl?D[0].pl.find(y=>y.j===j):null;const gid=p?p.gid:s&&s.gid;const g=gid?gById(gid):null;
      const r2=b2&&b2.res?b2.res.rows.find(r=>r.gid===gid):null;return {j,s,m,g,f:r2?r2.f:null,fp:p?p.place:9}})
    .sort((a,b)=>done?a.fp-b.fp:0).map(o=>`<tr class="${o.m&&o.m.isPlayer?'me':''}${done&&o.fp===1?' won':''}" data-sat109fin="${o.j}"><td class="sd">${o.j+1}</td><td class="nm">${o.g?gArt(o.g,'xs'):''}<span><b>${esc(o.g?o.g.name:'?')}</b><small>${esc(WC109T.name(o.s))}</small></span></td><td>${o.g?effOvr(o.g):''}</td><td>${plOf(D[1],o.j)}</td><td>${o.f!=null?o.f:'—'}</td><td>${done?`<b>${RN(o.fp)}</b>`:'—'}</td></tr>`).join('');
  const tbl=`<div class="wqtw"><table class="wqtbl wc109tb sat109tb"><thead><tr><th>#</th><th>${_T('Finalist')}</th><th>${_T('OVR')}</th><th>${_T('Race')}</th><th>${_T('CF')}</th><th>${_T('Finish')}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  let acts='';
  if(!done){const cur=nx<=1?[b1,bi1]:[b2,bi2];const b=cur[0],bi=cur[1];
    if(b&&!b.done){const myIn=b.ents.some(id=>{const g=gById(id);return g&&g.contract&&g.contract.mgr===pm.id});const t=b.wc109.fs===1?_T('the race'):_T('the Democritus');
      acts=`<button class="btn primary" type="button" data-mg="watch" data-id="${bi}">${_T`👁 Watch ${t}`}</button>${myIn?`<button class="btn" type="button" data-mg="fight" data-id="${bi}">${_T('⚔ Fight it yourself')}</button>`:''}<button class="btn" type="button" data-mg="sim" data-id="${bi}">${_T`▶ Simulate ${t}`}</button>`}
    acts+=`<button type="button" class="btn sd100 sd100p" data-wc109="final">${_T('⚡ Simulate the Saturnalia')}</button>`}
  const champ=done?(()=>{const s=C.seats[C.champ];const g=gById(C.champG);return `<p class="wqlead wc109won">${_T`🏆 <b>${esc(g?g.name:'?')}</b> (${esc(WC109T.name(s))}) wins the Saturnalia and the Winter Classic Cup.`}</p>`})():'';
  return `<div class="card2 wq109c wc109days sat109" data-sat109="${done?'done':nx+1}"><div class="sect">${_T('✦ The Saturnalia · Day III')}</div>
    <p class="rc-sub">${_T('The four finalists play the festival. The best festival finish — the highest Crowd Favor after the last event — takes the Cup.')}</p>
    <div class="sat109evs">${evs}</div><p class="rc-sub sat109boon">${_T`✦ ${FK.n}: ${FK.boon}.`}</p>${champ}${tbl}${acts?`<div class="acts">${acts}</div>`:''}</div>`}
{const base=WQ_FN.classic;WQ_FN.classic=function(w){let h=base.apply(this,arguments);try{const C=satS(w);if(typeof h!=='string'||!C)return h;
  const fin=_T('The final'),pv=_T('provisional'),sat=_T('Saturnalia');
  h=h.split(`${fin}<small>${pv}</small>`).join(`✦ ${sat}<small>${_T('Carmina · Chariots · Democritus')}</small>`).split(`${_T('Day III')}<small>${fin}</small>`).join(`${_T('Day III')}<small>✦ ${sat}</small>`);
  if(!C.fin)return h;satEnsure(w,C);const i=h.indexOf('<div class="card2 wq109c wc109days">');if(i<0)return h;return h.slice(0,i)+satHTML(w,C)}catch(e){console.error(e)}return h}}
{const base=WQ_X.sum.classic;WQ_X.sum.classic=function(w){const C=satS(w);if(C&&C.fin&&C.champ==null)return _T('✦ The Saturnalia: the final');return base.apply(this,arguments)}}
/* room 10: the freedom asks are answered here; the other rooms drop a box that holds only them */
{const base=wq109HTML;wq109HTML=function(w){const h=base.apply(this,arguments);try{if(!w||!satFree(w))return h;const i=h.indexOf('<div class="wq109" data-wq109step=');if(i<=0)return h;
  const top=h.slice(0,i),rest=h.slice(i);const only=(w.pend||[]).every(p=>p&&(p.t==='rudis'||p.t==='buyfree'));
  if(wqState(w).step==='next'){const j=rest.indexOf('<div class="card2 wq109c wqbegin">');if(j<0)return h;
    return rest.slice(0,j)+`<div class="card2 wq109c sat109rud" data-sat109rud="1"><div class="sect">${_T('🗡 Freedom asks')}</div><p class="rc-sub">${_T('After the Saturnalia: answer them, then begin the season.')}</p>${top}</div>`+rest.slice(j)}
  return only?rest:h}catch(e){console.error(e)}return h};window.wq109HTML=wq109HTML}
{const base=WQ_FN.next;WQ_FN.next=function(w){let h=base.apply(this,arguments);try{const C=satS(w);const n=satFree(w);const mine=rosterOf(me()).some(g=>g.rudis105);
  const li=n?_T`🗡 ${n} freedom ask${n===1?'':'s'} to answer below.`:C&&!C.rud&&mine?_T('🗡 Freedom asks (the rudis) come after the Saturnalia.'):'';
  if(li)h=h.replace('<ul class="wqnotes">',`<ul class="wqnotes"><li>${esc(li)}</li>`)}catch(e){console.error(e)}return h}}
{const base=weekChecklist;weekChecklist=function(){const I=base.apply(this,arguments);try{const w=W_();if(!Array.isArray(I)||!wqLive(w))return I;const C=satS(w);const n=satFree(w);
  if(C&&C.fin&&C.champ==null)I.push({done:false,ic:'✦',txt:_T('<b>The Saturnalia</b> — the Winter Classic final waits'),btn:`<button class="btn tksm" type="button" data-wq109="go|classic">${_T('Saturnalia')}</button>`});
  if(n)I.push({done:false,ic:'🗡',txt:_T`<b>${n} freedom ask${n===1?'':'s'}</b> wait in Next season`,btn:`<button class="btn tksm" type="button" data-wq109="go|next">${_T('Next season')}</button>`})}catch(e){console.error(e)}return I}}

{const st=document.createElement('style');st.textContent=`
.sat109evs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:6px 0}
.sat109e{display:grid;grid-template-columns:auto auto 1fr auto;grid-template-rows:auto auto;column-gap:6px;align-items:center;padding:6px 8px;border:1px solid #6b5236;border-radius:8px;background:#1d1812;min-width:0}
.sat109e .n{grid-row:1/3;font:400 18px var(--display);color:#cbb593}.sat109e .ic{grid-row:1/3;font-size:18px}.sat109e b{grid-column:3;font:400 15px var(--display);color:#f6dc98;min-width:0;overflow-wrap:anywhere}
.sat109e small{grid-column:3;font-size:11.5px;color:#cbb593;min-width:0}.sat109e i{grid-row:1/3;grid-column:4;font-style:normal;color:#9fd08a}
.sat109e.cur{border-color:#d6ab4c;box-shadow:0 0 0 1px #d6ab4c inset}.sat109e.done{opacity:.8}
.sat109boon{margin:4px 0}.sat109tb tr.won td{color:#f6dc98}
@media (max-width:760px){.sat109evs{grid-template-columns:minmax(0,1fr)}}
`;document.head.appendChild(st)}
}
