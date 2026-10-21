/* =====================================================================
   412-v109wq — v1.09 WINTER QUARTERS (Manager off-season), the shell + rooms 1 Awards night, 2 The Quaestor's accounts, 6 Personnel,
   10 Next season. His "Go" on the mock-up = W1a–W21a (tools/plans/v109/NOTES.md, MOCKUP.md); the look is the approved prototype's
   (411-v109wqproto, retired — its markup and CSS live on here). Kill switch localStorage flavius_v109wqoff=1 (= today's off-season page,
   its letters and its End-the-week confirm, and no money ledger). Test tv109w.
   WHERE (W18a): in the off-season week (348 OFF104.active) the Match Week tab reads "❄ Winter Quarters"; its page = a stepper strip
     (❄ overview + the rooms that exist — later releases add steps; any order, W5a; visited / finished rooms ✓) + the room's slim banner
     (388 .cp105ban + 298 rm100Adv's face) + the room + ← Back / Next → (the last room: ▶ Begin season N+1).
   REPLACES (by module): 348 po104OffHTML (the whole off-season page; 380's pending verdicts box is kept on top, same pendingHTML) ·
     348's End-the-week confirm in the off-season ("⏭ End the off-season → season N+1?" → room 10's Begin, the same weekEndGo95/endWeek;
     the rail's End the week opens room 10) · 22 the Flavian Awards screen in the off-season (W19a: the awards tab → room 1; visiting room 1
     marks w.awardShow seen; 355 B23's "🏆 The Flavian Awards" / "📜 The Acta Diurna" buttons → room 1's banner) · 355 B21 the finished
     bracket on the off-season page → room 1's Superbus column · 47's Quaestor's Ledger letter/card (W7a: sealed in room 2, qsLast.seen) ·
     348 po104Renewals' "📜 N contract asks wait on the off-season page" news + 349's "lays down the sword" farewell letters (→ room 6) ·
     88 weekChecklist's "contract ends" item in that week (→ the rooms' items). ONE letter "❄ Winter Quarters are open" (W7a); 348's Season in
     review letter stays as the archive copy (its button now says Winter Quarters). Kept as they are: rudis asks (380 rudis105Window, W4a —
     they come after the Saturnalia in v1.09c), the retired-great letter (349 [data-c104adv], room 3 in v1.09a), bye extras (59, W21a).
   ROOM 2 · THE MONEY LEDGER (W8a, new): w.led109 = {s, c0, c:{cat:{i,o}}, part, wk0} — the season's money in/out by category, counted from
     this release. There is no single treasury function (≈200 `coin+=` sites), so the ONE choke point is an accessor on the player's
     mgr.coin (installed at newWorld / every Manager draw / endWeek / applyBout / saveWorld): every change is booked by the code that made it
     (the stack's function names, a short table of lines inside endWeek wrappers found by their text, else the clicked data-mg action; the
     rest = "Senate & other"). Categories: wages, purses, bets, sales, loans, travel, repairs, recruiting, facilities, senate. A season rolls
     into w.led109h (last 2) at its first change. Old worlds (SAVE_MIGRATIONS '1.09'): part:1 — "itemised from week N", the totals of today.
   THE QUAESTOR'S LEDGER: 47 quaestorLedger(w,pm) PAYS when called — it is called once, on ✍ Seal (or by Begin when left unsealed), with a
     w.qsDue built exactly as 47 qsClose builds it (read-only preview before). qsClose itself still runs at the off-season's end (the league
     prize 185, the advisor records 256); a qsClose wrapper drops the second w.qsDue of a sealed season (w.qs.wq109paid) — no double pay.
   SAVES: w.wq109 = {s, step, v:{room:1}, sealed:{t}} per season (resume mid-winter on the same room); old saves mid-off-season start it.
   ===================================================================== */
const V109WQ={on:(()=>{try{return localStorage.getItem('flavius_v109wqoff')!=='1'}catch(e){return true}})()};
window.V109WQ=V109WQ;
/* the line calibration of the money ledger (this statement's own line; see led109Tab) */
const LED109_CAL=(()=>{try{return String(new Error().stack||'')}catch(e){return ''}})();
const LED109={act:null,actT:0,tab:null,busy:false};
/* ---------------- the money ledger: categories ---------------- */
const LED109_CATS=()=>[['wages','👥',_T('Wages & upkeep')],['purses','🏆',_T('Purses & prizes')],['bets','🎲',_T('Wagers')],['sales','🤝',_T('Sales & transfers')],
  ['loans','📜',_T('Loans')],['travel','🛣',_T('Travel')],['repairs','🛡',_T('Gear, repairs & care')],['recruiting','🔭',_T('Recruiting')],
  ['facilities','🏗',_T('Facilities & council')],['senate','🏛',_T('Senate & other')]];
/* the code that changes the treasury → its category (function names as the stack shows them) */
const LED109_FN={endWeek:'wages',rivalTrain:'wages',
  applyBout:'purses',any102Split:'purses',specRecord:'purses',specCrown:'purses',specAfterApply:'purses',specWeekStart:'purses',po104Pay:'purses',earnTrophy:'purses',
  penApply76:'purses',exhibApply:'purses',pg84Gate:'purses',any100Enter:'purses',any100Book:'purses',any100Drop:'purses',takeSbye76:'purses',qsClose:'purses',
  voidBets:'bets',settleWagers:'bets',placeSelfBet:'bets',openWagers:'bets',
  doPoach:'sales',offerAccept:'sales',c104Swap:'sales',buyBack:'sales',settlePending:'sales',
  loansWeek:'loans',lendTo:'loans',borrowFrom:'loans',loansCardHTML:'loans',loanCardHTML:'loans',
  travelState:'travel',travelClick:'travel',travelWeekEnd:'travel',
  arm94RepairAll:'repairs',arm94AutoShop:'repairs',arm94Buy:'repairs',arm94Repair:'repairs',arm94Undo:'repairs',arm94Sell:'repairs',sell99:'repairs',arm96Fix:'repairs',
  g102Upgrade:'repairs',g102Hands:'repairs',cityBuyKit:'repairs',cityKitDrop:'repairs',care101Do:'repairs',care102Do:'repairs',planRun87:'repairs',cityBath:'repairs',
  signGlad:'recruiting',cityBuyLot:'recruiting',rec98Act:'recruiting',doGiftFighter:'recruiting',doVisit:'recruiting',
  facBuild:'facilities',facWeek:'facilities',adv98Up:'facilities',
  quaestorLedger:'senate',friendGift:'senate',pg84Start:'senate',pg84Week:'senate',citySelect:'senate',cityTavern:'senate',cityLup:'senate',buyTicket:'senate'};
/* lines inside endWeek / applyBout wrappers that are not what their function's name says (found by their text, before this module) */
const LED109_LN=[['const back=Math.round(wages/2);m.coin+=back;pre[m.id]=back','senate'],['for(const m of w.mgrs)m.coin-=pre[m.id]||0;return r','senate'],
  ['const g=gateShare(m);m.coin+=g;','purses'],["ADV100.consilCoin*(lv('consilium')-1)*snap.bouts",'senate'],["ADV100.clerkPct*(lv('clerk')-1)/100",'senate'],
  ['if(!back)continue;m.coin+=back;','senate'],['if(M){m.coin-=M.wage;','wages'],['m.coin+=DARL76.gate','purses'],['for(const d of due){m.coin+=d.amt;tot+=d.amt}','repairs'],
  ['m.coin+=p.pay;tnews(','senate'],['if(ex){pm.coin-=ex;','wages'],['betSettle(bt.bid,won,pay);me().coin+=pay','bets'],['m.coin+=won?Math.round(st*o)-st:-st','bets'],
  ['pm.coin=Math.max(pm.coin,wonL?60:25)','senate'],['pm2.coin-=40','bets'],['pm.coin+=B.amt;','senate']];
/* the clicked action (17's big click handler, 23's ludusClick) when the stack names no function */
const LED109_ACT={scout:'recruiting',trial:'recruiting',cartbuy:'recruiting',sign:'recruiting',exfight:'purses',meal:'wages',bonus:'wages',heal:'repairs',medic:'repairs',
  surgeon:'repairs',bath:'repairs',asclepius:'repairs',bet:'bets',rig:'bets',loan:'loans',loanpayall:'loans',tradego:'sales',envoy:'senate',kintix:'senate',feast2:'senate',
  sponsor2:'senate',criers2:'senate',scoutarena:'senate',build:'facilities',repair:'repairs'};
const LED109_FR=/:(\d+):\d+\)?\s*$/;
/* docLine → category, from LED109_LN; calibrated by LED109_CAL's own line (inline script lines are document lines) */
function led109Tab(){if(LED109.tab)return LED109.tab;const T=LED109.tab={lines:new Map()};
  try{const mk='LED109'+'_CAL=(()=>';const sc=[...document.scripts].find(s=>s.text&&s.text.indexOf(mk)>=0);if(!sc)return T;const tx=sc.text;const at=tx.indexOf(mk);
    const f=LED109_CAL.split('\n').map(x=>x.trim()).find(x=>LED109_FR.test(x));if(!f)return T;const L0=+f.match(LED109_FR)[1];
    const want=[[at,null]];for(const [s,c] of LED109_LN){const i=tx.indexOf(s);if(i<0||i>=at)continue;const j=tx.indexOf(s,i+1);if(j>=0&&j<at)continue;want.push([i,c])}
    want.sort((a,b)=>a[0]-b[0]);let n=1,p=0;const ln=new Map();for(const [i] of want){for(;;){const q=tx.indexOf('\n',p);if(q<0||q>=i)break;n++;p=q+1}ln.set(i,n)}
    const off=L0-ln.get(at);for(const [i,c] of want)if(c)T.lines.set(ln.get(i)+off,c)}catch(e){}
  return T}
function led109Name(fr){let m=fr.match(/^\s*at (?:async )?([^\s(]+)/);let n=m?m[1]:(fr.match(/^([^@]*)@/)||[])[1]||'';n=String(n).replace(/[<\/].*$/,'');const k=n.split('.');return k[k.length-1]}
function led109Cat(){let st='';try{st=String(new Error().stack||'')}catch(e){}const T=led109Tab();const fr=st.split('\n');
  for(const f of fr){const nm=led109Name(f);if(nm==='set'||/^led109/.test(nm))continue;const m=f.match(LED109_FR);if(m&&T.lines.has(+m[1]))return T.lines.get(+m[1]);if(nm&&LED109_FN[nm])return LED109_FN[nm]}
  if(LED109.act&&Date.now()-LED109.actT<2500&&LED109_ACT[LED109.act])return LED109_ACT[LED109.act];return 'senate'}
function led109New(w,coin,part){return {s:w.season,c0:coin,c:{},part:part?1:0,wk0:typeof wkOf==='function'?wkOf(w.week):1}}
function led109Rec(w,d,old){let L=w.led109;if(L&&L.s!==w.season){L.c1=old;(w.led109h=w.led109h||[]).unshift(L);w.led109h=w.led109h.slice(0,2);L=null}
  if(!L)L=w.led109=led109New(w,old,!(w.led109h&&w.led109h.length&&w.led109h[0].s===w.season-1));
  const k=led109Cat();const c=L.c[k]=L.c[k]||{i:0,o:0};if(d>0)c.i+=d;else c.o-=d}
/* the one choke point: the player's mgr.coin becomes an accessor (a plain number in saves; JSON reads it) */
function led109Install(w){try{if(!V109WQ.on||!w||w.tutorial||!w.mgrs)return;const pm=w.mgrs.find(m=>m.id===w.playerId);if(!pm)return;const d=Object.getOwnPropertyDescriptor(pm,'coin');
  if(d&&d.get&&d.get._led109)return;let v=d&&'value' in d?d.value:pm.coin;const get=function(){return v};get._led109=1;
  Object.defineProperty(pm,'coin',{configurable:true,enumerable:true,get,set(nv){const old=v;v=nv;try{if(!LED109.busy&&typeof nv==='number'&&typeof old==='number'&&isFinite(nv)&&isFinite(old)&&nv!==old){LED109.busy=true;try{led109Rec(w,nv-old,old)}finally{LED109.busy=false}}}catch(e){}}});
  if(!w.led109)w.led109=led109New(w,v,1)}catch(e){console.error(e)}}
/* the season's sheet: {L, start, now, rows:[[k,ic,label,i,o]], sum, res} */
function led109Sheet(w,pm){const L=w.led109&&w.led109.s===w.season?w.led109:null;const S=w.sr104&&w.sr104.s===w.season?w.sr104:null;
  const start=L&&!L.part?L.c0:(S?S.coin:L?L.c0:pm.coin);const now=pm.coin;const rows=LED109_CATS().map(([k,ic,lb])=>{const c=(L&&L.c[k])||{i:0,o:0};return [k,ic,lb,c.i,c.o]});
  const sum=rows.reduce((a,r)=>a+r[3]-r[4],0);return {L,start,now,rows,sum,res:now-start-sum,part:!L||!!L.part,wk0:L?L.wk0:1}}
SAVE_MIGRATIONS.push(['1.09',w=>{try{if(V109WQ.on&&w&&!w.tutorial&&!w.led109){const pm=(w.mgrs||[]).find(m=>m.id===w.playerId);if(pm)w.led109=led109New(w,pm.coin||0,1)}}catch(e){console.error(e)}}]);
document.addEventListener('click',e=>{try{const b=e.target&&e.target.closest&&e.target.closest('[data-mg]');if(b){LED109.act=b.dataset.mg;LED109.actT=Date.now()}}catch(x){}},true);
if(V109WQ.on){
  {const base=newWorld;newWorld=function(){const r=base.apply(this,arguments);try{const w=W_();const pm=w&&me();if(w&&pm&&!w.tutorial){w.led109=led109New(w,pm.coin,0);led109Install(w)}}catch(e){console.error(e)}return r}}
  {const base=applyBout;applyBout=function(){try{led109Install(W_())}catch(e){}return base.apply(this,arguments)}}
  {const base=saveWorld;saveWorld=function(){try{led109Install(W_())}catch(e){}return base.apply(this,arguments)}}
}
/* a sealed season's second w.qsDue (47 qsClose at the off-season's end) is dropped — the Ledger was paid in Winter Quarters (always on: a guard) */
{const base=qsClose;qsClose=function(w,pm){const r=base.apply(this,arguments);try{if(w&&w.qs&&w.qs.wq109paid&&w.qsDue&&w.qsDue.s===w.qs.s)w.qsDue=null}catch(e){console.error(e)}return r}}

/* ---------------- Winter Quarters: state ---------------- */
const WQ_R=()=>[{k:'over',i:'❄',n:_T('Winter Quarters'),s:_T('Overview')},{k:'awards',i:'🏆',n:_T('Awards night'),s:_T('Awards'),adv:'consilium'},
  {k:'books',i:'⚖',n:_T('The Quaestor’s accounts'),s:_T('Accounts'),adv:'clerk'},{k:'staff',i:'✍',n:_T('Personnel'),s:_T('Personnel'),adv:'barracks'},
  {k:'next',i:'📅',n:_T('Next season'),s:_T('Next season'),adv:'consilium'}];
const WQ_K=['over','awards','books','staff','next'];
const wqLive=w=>{try{w=w||W_();return !!(V109WQ.on&&w&&!w.dead&&!w.tutorial&&typeof OFF104!=='undefined'&&OFF104.active(w))}catch(e){return false}};
function wqState(w){let S=w.wq109;if(!S||S.s!==w.season){S=w.wq109={s:w.season,step:'over',v:{},sealed:null}}if(!WQ_K.includes(S.step))S.step='over';return S}
const wqP=w=>{try{return po104P(w)}catch(e){return null}};
const wqTable=w=>leagueSort(w.mgrs.filter(m=>!m.dead&&!m.sica),w.season);
const wqH=s=>Math.abs(hashStr(String(s)));
const wqFlag=(m,h)=>{try{return m&&typeof flagChip==='function'?flagChip(m,h||18)||'<i class="wqnf">⚑</i>':'<i class="wqnf">⚑</i>'}catch(e){return ''}};
const wqAdv=k=>{try{return k&&typeof rm100Adv==='function'?rm100Adv(k,54):null}catch(e){return null}};
const wqChip=(v,l)=>`<div class="roomstat rm100cnt wqchip"><span class="ptbox on">${v}</span><span>${l}</span></div>`;
const wqFirst=g=>{const p=String(g.name||'').split(' ');return /^(The|the)$/.test(p[0])||/^["“]/.test(p[1]||'')&&p.length<3?g.name:p[0]};
const wqGr=g=>{try{const gr=r104Grade(g);return `<span class="r104t wqgr" style="--gc:${gradeCol(gr)}">${gr}</span>`}catch(e){return ''}};
const wqAge=g=>{try{return typeof gAge==='function'?gAge(g):g.age}catch(e){return g.age}};
const wqArt=g=>{try{return typeof gArt==='function'?gArt(g,'xs'):''}catch(e){return ''}};
const wqTr=(def,sz)=>{try{return typeof trophySVG==='function'?trophySVG(def||{},sz||56):''}catch(e){return ''}};
const wqCoin=n=>{try{return coinAmt87(n)}catch(e){return String(n)}};
const wqOpen=w=>{const P=wqP(w);return (P&&P.ren||[]).filter(x=>!x.st&&gById(x.gid)).length};
/* a room is ✓: awards = visited · books = sealed · staff = visited and every ask answered */
function wqDone(w,k){const S=wqState(w);if(k==='awards')return !!S.v.awards;if(k==='books')return !!S.sealed;if(k==='staff')return !!S.v.staff&&!wqOpen(w);return false}
function wqVisit(w,k){const S=wqState(w);S.step=k;if(k!=='over')S.v[k]=1;
  if(k==='awards'&&w.awardShow&&w.awardShow.season===w.season&&!w.awardShow.seen){w.awardShow.seen=true;try{if(typeof sfx==='function')sfx('fanfare')}catch(e){}}}
function wqGo(k){const w=W_();if(!w)return;if(wqLive(w)){wqVisit(w,k);try{saveWorld()}catch(e){}}MGR.view=null;MGR.tab='night';MGR.confirmEnd=false;
  if(typeof MGR_REDRAW==='function')MGR_REDRAW();setTimeout(()=>{try{const p=document.querySelector('.wq109');if(p)p.scrollIntoView({block:'start'});wq109Scroll()}catch(e){}},0)}

/* ---------------- the Quaestor's Ledger: 47's numbers, read-only, until the seal ---------------- */
/* w.qsDue exactly as 47 qsClose (+ 51's rich) builds it — without closing the season (qsClose still runs at the week's end) */
function wqQ(w,pm){if(typeof qsInit==='function')qsInit(w,pm);const Q0=w.qs;if(!Q0)return null;const L=leagueSort(w.mgrs,w.season);let fans=0;try{fans=teamFans().length}catch(e){}
  const Q={...Q0,closed:1,pos:L.indexOf(pm)+1,n:w.mgrs.length,signed:rosterOf(pm).map(g=>g.id).filter(id=>!(Q0.roster||[]).includes(id)).length,lost:Math.max(0,(Q0.bet||0)-(pm.betNet||0)),
    fameD:Math.max(0,(pm.fame||0)-(Q0.fame||0)),fansD:Math.max(0,fans-(Q0.fans||0)),fameAt:pm.fame};try{if(typeof thriving==='function')Q.rich=thriving(pm)}catch(e){}return Q}
/* 47 quaestorLedger's lines (the same words and numbers; it is NOT called here — it pays) */
function wqQLines(Q){const lines=[[_T('🏛 The Senate’s stipend — your house stood the whole season'),Q.rich?0:30],[_T('📜 Tax return on the wages you paid (')+Q.wages+' coin)',Math.round(Q.wages*0.10)],[_T('🎲 Rebate on the tax you paid on lost wagers'),Math.round(Q.lost*0.12)],
    [_T('🤝 Recruiting bounty — ')+Q.signed+_T(' new signing')+(Q.signed===1?'':'s'),Q.signed*12],[_T('⭐ Fame gained this season (')+Q.fameD+')',Q.fameD*3],[_T('👥 New fans (')+Q.fansD+'K)',Q.fansD*2],
    [_T('📊 League finish — ')+(Q.pos?'#'+Q.pos+' of '+Q.n:'—'),Q.pos?Math.max(0,(Q.n-Q.pos))*4:0]].filter(x=>x[1]>0);
  let total=lines.reduce((a,x)=>a+x[1],0);const cap=120+(Q.fameAt||0)*3;if(total>cap){lines.push([_T`⚖ The quaestor’s ceiling (${cap})`,cap-total]);total=cap}return {lines,total}}
/* ✍ Seal: 47 quaestorLedger, once */
function wqSeal(w,pm){if(!w||!pm||!wqLive(w))return null;const S=wqState(w);if(S.sealed)return null;if(w.qs&&w.qs.wq109paid)return null;
  if(!(w.qsDue&&!w.qsDue.paid)){const Q=wqQ(w,pm);if(!Q)return null;w.qsDue=Q}
  const t=quaestorLedger(w,pm);if(t==null)return null;S.sealed={t};if(w.qs)w.qs.wq109paid=1;if(w.qsLast)w.qsLast.seen=true;try{saveWorld(true)}catch(e){}return t}

/* ---------------- the frame: banner, stepper, nav ---------------- */
const wqSky=k=>{const h=wqH('sky'+k);const flakes=Array.from({length:26},(_,i)=>{const x=(h*(i+3)*37)%1200,y=(h*(i+7)*13)%110;return `<circle cx="${x}" cy="${y}" r="${1+(i%3)*.6}" fill="#e8f0ff" opacity="${.25+(i%4)*.12}"/>`}).join('');
  return `<svg viewBox="0 0 1200 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="wqsk${k}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1c2638"/><stop offset=".65" stop-color="#3a3f52"/><stop offset="1" stop-color="#5b5560"/></linearGradient></defs><rect width="1200" height="120" fill="url(#wqsk${k})"/>
    <path d="M640 120V66h40v-8h300v8h40v54Z" fill="#2a2430" opacity=".9"/>${[0,1,2,3,4,5,6,7].map(i=>`<rect x="${700+i*38}" y="70" width="14" height="50" fill="#3c3442"/><rect x="${697+i*38}" y="66" width="20" height="5" fill="#d8dce8" opacity=".8"/>`).join('')}
    <path d="M0 108Q300 92 600 104T1200 100V120H0Z" fill="#dfe6f2" opacity=".85"/>${flakes}</svg>`};
function wqBan(i,sub,chips,extra){const R=WQ_R()[i];const A=wqAdv(R.adv);const face=A?`<span class="rm100rd rm100adv" title="${esc(A.a.name+' · '+A.a.role)}">${A.f}</span>`:`<span class="rm100rd rm100adv cp105md" aria-hidden="true">${R.i}</span>`;
  return `<div class="roomhd wq109ban rm100ban v101ban w104ban cp105ban cp105one">${wqSky(R.k)}${face}<div class="roomttl"><b>${R.i} ${esc(R.n)}</b><span>${sub}</span>${extra||''}</div>${chips||''}</div>`}
function wqSay(k,txt){const A=wqAdv(k);if(!A)return '';return `<div class="rm100clerk wqsay"><span class="rm100rd">${A.f}</span><span class="rm100one"><b>${esc(A.a.name)}</b>, ${esc(A.a.role)}: “${txt}”</span></div>`}
function wqStepper(w,cur){const R=WQ_R();return `<nav class="wq109st" aria-label="${esc(_T('Winter Quarters rooms'))}">${R.map((r,i)=>{if(!i)return `<button type="button" class="wqs ov${cur===0?' cur':''}" data-wq109="go|over" title="${esc(r.s)}" aria-label="${esc(r.s)}">❄</button>`;
  const dn=wqDone(w,r.k);const st=(i===cur?' cur':'')+(dn?' done':'');return `<button type="button" class="wqs${st}" data-wq109="go|${r.k}" ${i===cur?'aria-current="step"':''}><span class="n">${dn&&i!==cur?'✓':i}</span><span class="t">${esc(r.s)}</span></button>`}).join('<i class="wqsl"></i>')}</nav>`}
function wqReady(){try{return weekReady()}catch(e){return {ok:true}}}
function wqBeginBtn(w,big){const r=wqReady();return `<button type="button" class="btn primary sd100 sd100p sd100m wq109go" data-wq109="begin" ${r.ok?'':`disabled title="${esc(r.why||'')}"`}>${_T`▶ Begin season ${w.season+1}`}${big&&!r.ok?`<small>${esc(r.why||'')}</small>`:''}</button>`}
function wqNav(w,cur){const R=WQ_R();const nx=R[cur+1];const pv=cur>0?R[cur-1]:null;
  return `<div class="wq109nav">${pv?`<button type="button" class="btn tksm" data-wq109="go|${pv.k}">← ${esc(pv.s)}</button>`:'<span></span>'}${nx?`<button type="button" class="btn primary sd100 sd100p sd100m" data-wq109="go|${nx.k}">${cur===0?_T('Begin: '):_T('Next: ')}${nx.i} ${esc(nx.n)} →</button>`:wqBeginBtn(w)}</div>`}

/* ---------------- 0 · overview ---------------- */
function wqOver(w){const pm=me();const T=wqTable(w);const pos=T.indexOf(pm)+1;const ren=wqOpen(w);const S=wqState(w);
  let qt=0;try{const Q=wqQ(w,pm);qt=Q?wqQLines(Q).total:0}catch(e){}
  const sum={awards:_T`You finished #${pos} of ${T.length}`,books:S.sealed?_T`Ledger sealed · ${wqCoin('+'+S.sealed.t)}`:_T`The Ledger to seal · about ${wqCoin('+'+qt)}`,
    staff:ren?_T`${ren} contract ask${ren===1?'':'s'} waiting`:_T('No contract asks waiting'),next:_T`Season ${w.season+1}: the schedule`};
  const tiles=WQ_R().slice(1).map((R,j)=>{const i=j+1;const dn=wqDone(w,R.k);return `<button type="button" class="wqt${dn?' done':''}" data-wq109="go|${R.k}"><span class="n">${dn?'✓':i}</span><span class="ic">${R.i}</span><b>${esc(R.n)}</b><small>${esc(sum[R.k]||'')}</small></button>`}).join('');
  return wqBan(0,_T`After season ${w.season} · the house's winter business, then season ${w.season+1}`,wqChip(`${WQ_R().length-1}`,_T('rooms'))+wqChip(`${ren}`,_T('asks waiting')))
    +`<div class="card2 wq109c"><p class="wqlead">${_T('The season is over. Walk the house through the winter: the awards, the books, the barracks — then the new season.')}</p><div class="wqtiles">${tiles}</div>
    <p class="rc-sub">${_T('No bouts and no league games in Winter Quarters. The rooms go in any order; the last one starts the season.')}</p></div>`}

/* ---------------- 1 · awards night ---------------- */
const WQ_REACH=()=>({champ:_T('Champion'),fin:_T('Final'),sf:_T('Semifinal'),r1:_T('Round 1')});
function wqAwards(w){const pm=me();const P=wqP(w);const s=w.season;const T=wqTable(w);const pos=T.indexOf(pm)+1;const RE=WQ_REACH();
  const wl=sp=>`${sp.w||0}–${Math.max(0,(sp.b||0)-(sp.w||0))}`;
  const row=(m,i)=>{const sp=msp(m,s);const r=P?po104Reach(P,'m:'+m.id):'';return `<tr class="${m.isPlayer?'me':''}${i<3?' pod':''}"><td class="pl">${i+1}</td><td class="hs">${wqFlag(m,16)} <b>${esc(m.ludus)}</b></td><td>${sp.pts||0}</td><td>${wl(sp)}</td><td class="sb${r==='champ'?' ch':''}">${RE[r]||'—'}</td></tr>`};
  const pod=T.slice(0,3).map((m,i)=>{const sp=msp(m,s);return `<div class="wqpod p${i+1}${m.isPlayer?' me':''}"><span class="pl">${RN(i+1)}</span>${wqFlag(m,34)}<b>${esc(m.ludus)}</b><small>${_T`${sp.pts||0} pts · ${wl(sp)}`}</small></div>`}).join('');
  const A=(w.awardShow&&w.awardShow.season===s?w.awardShow.awards:[]);
  const aw=A.map(a=>`<div class="wqaw${a.mine?' me':''}">${wqTr(trophyDef(a.tid),52)}<div><b>${esc(a.name)}</b><span class="rc-sub">${esc(a.desc||'')}</span><span class="wqwho">${esc(a.gname||a.mname||_T('not given'))}${a.ludus?` · ${esc(a.ludus)}`:''}</span><small>${esc(a.stat||'')}</small></div></div>`).join('')||`<p class="rc-sub">${_T('No awards this season.')}</p>`;
  const champ=P&&P.champ?`<div class="wqsb">${wqTr(trophyDef('palm_roma'),46)}<span>${_T`The Flavius Superbus: <b>${esc(po104Name(P.champ))}</b>`}</span></div>`:'';
  const acta=w.lastPaper?`<span class="wqbb"><button type="button" class="btn tksm" data-mg="paper">${_T('📜 The Acta Diurna')}</button></span>`:'';
  return wqBan(1,_T`Season ${s} · the league's final table and its awards`,wqChip(`#${pos}`,_T('your place'))+wqChip(`${msp(pm,s).pts||0}`,_T('points')),acta)
    +`<div class="wq2"><div class="card2 wq109c"><div class="sect">${_T('🏛 The final table')}</div><div class="wqpods">${pod}</div>${champ}
      <div class="wqtw"><table class="wqtbl"><thead><tr><th>#</th><th>${_T('Ludus')}</th><th>${_T('Pts')}</th><th>${_T('W–L')}</th><th>${_T('Superbus')}</th></tr></thead><tbody>${T.map(row).join('')}</tbody></table></div></div>
    <div class="card2 wq109c"><div class="sect">${_T('🏆 The Flavian Awards')}</div><div class="wqaws">${aw}</div>
      ${wqSay('consilium',pos<=4?_T('A season to remember. Build on it.'):pos<=8?_T('Mid-table. The winter decides next year.'):_T('A hard season. The winter is where houses are rebuilt.'))}</div></div>`}

/* ---------------- 2 · the Quaestor's accounts ---------------- */
function wqBooks(w){const pm=me();const S=wqState(w);const X=led109Sheet(w,pm);const net=X.now-X.start;
  const IN=X.rows.filter(r=>r[3]>0).sort((a,b)=>b[3]-a[3]),OUT=X.rows.filter(r=>r[4]>0).sort((a,b)=>b[4]-a[4]);
  const mx=Math.max(1,...X.rows.map(r=>Math.max(r[3],r[4])),Math.abs(X.res));
  const bar=(r,v,c)=>`<div class="wqbar ${c}" data-wq109cat="${r[0]}"><span class="l">${r[1]} ${esc(r[2])}</span><span class="b"><i style="width:${Math.round(100*v/mx)}%"></i></span><span class="v">${c==='o'?'−':'+'}${v}</span></div>`;
  const tin=IN.reduce((a,r)=>a+r[3],0),tout=OUT.reduce((a,r)=>a+r[4],0);
  const res=X.res?`<div class="wqbar ${X.res>0?'i':'o'} wqres" data-wq109cat="res"><span class="l">${X.part?_T('Before itemising'):_T('Not itemised')}</span><span class="b"><i style="width:${Math.round(100*Math.abs(X.res)/mx)}%"></i></span><span class="v">${X.res>0?'+':'−'}${Math.abs(X.res)}</span></div>`:'';
  const wages=(w.qs&&w.qs.s===w.season&&w.qs.wages)||0;
  const part=X.part?`<p class="rc-sub wqpart">${_T`The books by category are kept from this season (week ${X.wk0}); earlier weeks count in the treasury total only. Wages paid this season: ${wages}.`}</p>`:'';
  let ledger;
  if(S.sealed&&w.qsLast&&w.qsLast.season===w.season){const Q=w.qsLast;ledger=Q.lines.map(x=>`<div class="wqll"><span>${esc(x[0])}</span><b>${x[1]>0?'+':''}${x[1]}</b></div>`).join('')+`<div class="wqll tot"><span>${_T('Paid into your treasury')}</span><b>${wqCoin('+'+Q.total)}</b></div><div class="acts"><button type="button" class="btn tksm" disabled>${_T('✓ Sealed')}</button></div>`}
  else{const Q=wqQ(w,pm);const QL=Q?wqQLines(Q):{lines:[],total:0};ledger=QL.lines.map(x=>`<div class="wqll"><span>${esc(x[0])}</span><b>${x[1]>0?'+':''}${x[1]}</b></div>`).join('')+`<div class="wqll tot"><span>${_T('To your treasury')}</span><b>${wqCoin('+'+QL.total)}</b></div>
      <div class="acts"><button type="button" class="btn primary sd100 sd100p" data-wq109="seal">${_T('✍ Seal the Ledger')}</button></div><p class="rc-sub">${_T('Unsealed, the Quaestor seals it when the season begins.')}</p>`}
  return wqBan(2,_T`Season ${w.season} · money in, money out, and what the Quaestor pays`,wqChip(`${X.start}→${X.now}`,_T('treasury'))+wqChip(`${net>=0?'+':''}${net}`,_T('the season')))
    +`<div class="wq2"><div class="card2 wq109c wqacc"><div class="sect">${_T('📈 In')} <span class="rc-sub">+${tin}</span></div>${IN.map(r=>bar(r,r[3],'i')).join('')||`<p class="rc-sub">${_T('Nothing yet.')}</p>`}
      <div class="sect">${_T('📉 Out')} <span class="rc-sub">−${tout}</span></div>${OUT.map(r=>bar(r,r[4],'o')).join('')||`<p class="rc-sub">${_T('Nothing yet.')}</p>`}${res}
      <p class="wqtot">${_T`Treasury <b>${X.start}</b> → <b>${X.now}</b>`} <span class="${net>=0?'up':'dn'}">${net>=0?'+':''}${net}</span></p>${part}</div>
    <div class="card2 wq109c wqled"><div class="sect">${_T('🏛 The Quaestor’s Ledger')}</div>${ledger}
      ${wqSay('clerk',pm.coin>=4*rosterOf(pm).reduce((a,g)=>a+(g.contract?g.contract.wage||0:0),0)?_T('We start the winter in credit.'):_T('We start the winter short — watch the wages.'))}</div></div>`}

/* ---------------- 6 · personnel ---------------- */
function wqStaff(w){const pm=me();const P=wqP(w);const ros=rosterOf(pm).slice().sort((a,b)=>effOvr(b)-effOvr(a));
  /* 348's renewal rows, the same actions (data-po104="ren|…", 348 po104Answer) + 386's OVR / W–L / form line */
  const ren=(P&&P.ren||[]).map(x=>{const g=gById(x.gid);if(!g)return '';const nm=esc(wqFirst(g));const btn=(v,t)=>`<button class="btn tksm${v==='y'?' primary':''}" type="button" data-po104="ren|${g.id}|${v}">${t}</button>`;
    const q=x.kind==='raise'?_T`asks ${coinAmt87(x.wage)} a week (+${x.pct}%, was ${x.old}) for ${x.weeks} more weeks`:_T('sat on the bench and asks to leave');
    const done=x.st?`<span class="badge">${x.st==='yes'?(x.kind==='raise'?_T('signed'):_T('let go')):x.st==='no'?(x.kind==='raise'?_T('refused'):_T('kept')):_T('lapsed')}</span>`
      :`<span class="acts">${x.kind==='raise'?btn('y',_T`Sign ${nm}`)+btn('n',_T('Refuse')):btn('y',_T`Let ${nm} go`)+btn('n',_T`Keep ${nm}`)}</span>`;
    const line=(typeof ren105Line==='function'&&!(typeof V105RENEW_OFF!=='undefined'&&V105RENEW_OFF))?ren105Line(g):'';
    return `<div class="po104rn wqrow" data-po104ren="${g.id}">${wqArt(g)}<b>${esc(g.name)}</b>${line}<span class="rc-sub">${q}</span>${done}</div>`}).join('');
  /* 349's farewells: your fighters who retired at the season's turn */
  const R=w.c104rev&&w.c104rev.s===w.season?(w.c104rev.ret||[]).filter(x=>x.mine):[];
  const fw=R.map(x=>{const g=gById(x.id);return `<div class="wqrow wqfw">${g?wqArt(g):''}<b>${esc(x.name)}</b><span class="rc-sub">${_T`retires at ${x.age} · best ${(g&&g.c104&&g.c104.pk)||x.ovr} · ${g&&g.rec?g.rec.ev:0} events, ${g&&g.rec?g.rec.w:0} wins`}</span>${x.great?`<span class="badge gold">${_T('a great of the sand')}</span>`:''}</div>`}).join('');
  const tr=ros.map(g=>{const c=g.contract||{};const wk=Math.max(0,c.weeks||0);let ph='';try{const x=c104Phase(g);ph={rise:_T('rising'),prime:_T('prime'),fade:_T('fading')}[x.ph]||''}catch(e){}
    return `<tr class="${wk<=8?'due':''}"><td class="nm">${wqArt(g)}<b>${esc(g.name)}</b></td><td>${wqGr(g)} ${effOvr(g)}</td><td>${wqAge(g)}</td><td>${esc(ph)}</td><td>${c.wage||0}</td><td>${wk<=8?`<span class="badge">${_T`${wk} wk`}</span>`:_T`${wk} wk`}</td></tr>`}).join('');
  const nAsk=wqOpen(w);
  return wqBan(3,_T('Contracts and farewells — the barracks’ winter business'),wqChip(`${ros.length}`,_T('on the roster'))+wqChip(`${nAsk}`,_T('asks')))
    +`<div class="wq2"><div class="card2 wq109c"><div class="sect">${_T('✍ Contract renewals')}</div>${ren||`<p class="rc-sub">${_T('No contract asks this winter.')}</p>`}${ren?`<p class="rc-sub">${_T('Unanswered asks lapse when the season begins: raises keep the old terms, the others stay and sulk.')}</p>`:''}
      ${fw?`<div class="sect">${_T('🏺 Farewells')}</div>${fw}`:''}
      ${wqSay('barracks',nAsk?_T('Answer them here and the barracks stays quiet all season.'):_T('The barracks is settled for the winter.'))}</div>
    <div class="card2 wq109c"><div class="sect">${_T('📜 Contracts')}</div><div class="wqtw"><table class="wqtbl wqct"><thead><tr><th>${_T('Fighter')}</th><th>${_T('OVR')}</th><th>${_T('Age')}</th><th>${_T('Career')}</th><th>${_T('Wage')}</th><th>${_T('Left')}</th></tr></thead><tbody>${tr}</tbody></table></div>
      <p class="rc-sub">${_T('Gold: the contract ends within 8 weeks.')} <button class="btn tksm" type="button" data-mg="tab" data-id="recruit">${_T('🤝 Recruiting')}</button></p></div></div>`}

/* ---------------- 10 · next season ---------------- */
function wqNext(w){const s=w.season+1;let fx=[];try{fx=seasonSchedule(s)||[]}catch(e){}
  const byes=typeof BYE_WKS!=='undefined'?BYE_WKS:[4,12];let rw=11;try{rw=RIVAL_WK}catch(e){}
  const loc=i=>{const L=LOCATIONS[i];return L?L.n:'—'};const evn=k=>{const E=EVENTS[k];return E?(E.n||k):''};
  const wk=[];for(let n=1;n<=11;n++){const f=fx[n-1]||{};const bye=byes.includes(n);const riv=n===rw;
    wk.push(`<div class="wqwk${bye?' bye':''}${riv?' riv':''}"><span class="n">${n}</span><b>${bye?_T('Bye'):esc(loc(f.loc))}</b><small>${bye?_T('rest week'):riv?_T('Rivalry Week'):esc(evn(f.ev))}</small></div>`)}
  const po=[12,13,14].map((n,i)=>`<div class="wqwk po"><span class="n">${n}</span><b>${[_T('Round 1'),_T('Semifinals'),_T('The final')][i]}</b><small>${_T('Superbus')}</small></div>`).join('');
  const r=wqReady();const open=wqOpen(w);const S=wqState(w);
  const notes=[open?_T`${open} contract ask${open===1?'':'s'} still open — they lapse.`:'',!S.sealed?_T('The Quaestor seals the Ledger and pays.'):'',_T('This week’s wages are paid; the empire moves on to week 1.')].filter(Boolean);
  return wqBan(4,_T`Season ${s} · the road ahead`,wqChip('11 + 3',_T('weeks'))+wqChip(`${byes.filter(x=>x<=11).length}`,_T('bye')))
    +`<div class="card2 wq109c"><div class="sect">${_T('📅 The schedule')}</div><div class="wqwks">${wk.join('')}${po}<div class="wqwk wq"><span class="n">❄</span><b>${_T('Winter')}</b><small>${_T('Quarters')}</small></div></div></div>
    <div class="card2 wq109c wqbegin"><div class="sect">${_T`▶ Season ${s}`}</div><ul class="wqnotes">${notes.map(x=>`<li>${x}</li>`).join('')}</ul>${r.ok?'':`<p class="rc-sub wqwhy">${esc(r.why||'')}</p>`}
      ${wqSay('consilium',_T('The sand is raked, the banners are up. Say the word.'))}</div>`}

const WQ_FN={over:wqOver,awards:wqAwards,books:wqBooks,staff:wqStaff,next:wqNext};
function wq109HTML(w){const S=wqState(w);const i=Math.max(0,WQ_K.indexOf(S.step));let body='';try{body=WQ_FN[WQ_K[i]](w)}catch(e){console.error(e);body=`<p class="rc-sub">${esc(String(e&&e.message||e))}</p>`}
  let pend='';try{if((w.pend||[]).length&&typeof pendingHTML==='function')pend=pendingHTML()}catch(e){console.error(e)}
  return `${pend}<div class="wq109" data-wq109step="${WQ_K[i]}">${wqStepper(w,i)}${body}${wqNav(w,i)}</div>`}
window.wq109HTML=wq109HTML;
function wq109Scroll(){try{const st=document.querySelector('.wq109st'),c=st&&st.querySelector('.wqs.cur');if(c)st.scrollLeft=Math.max(0,c.offsetLeft-(st.clientWidth-c.offsetWidth)/2)}catch(e){}}
window.wq109Scroll=wq109Scroll;

/* ▶ Begin season N+1 = the off-season week's end (229 weekEndGo95 → endWeek, as the old confirm did); an unsealed Ledger is sealed first */
async function wqBegin(){const w=W_();if(!wqLive(w)||MGR.busy)return false;const r=wqReady();if(!r.ok){try{mToast(r.why)}catch(e){}return false}
  try{wqSeal(w,me())}catch(e){console.error(e)}
  if(typeof weekEndGo95==='function')return weekEndGo95();
  MGR.busy=true;let ok=false;try{ok=await endWeek()}finally{MGR.busy=false}if(ok){MGR.tab='paper';if(typeof MGR_REDRAW==='function')MGR_REDRAW()}return ok}
window.wqBegin=wqBegin;

if(V109WQ.on){
/* ---------------- the page ---------------- */
{const base=mgrHTML;mgrHTML=function(){let w=null;try{w=W_();if(w)led109Install(w)}catch(e){}let live=false;
  try{live=wqLive(w);if(live&&!MGR.view){const auto=typeof V104S!=='undefined'&&V104S.toOff;if(MGR.tab==='awards'&&!auto){MGR.tab='night';wqVisit(w,'awards')}else if(MGR.tab==='awards'&&auto)MGR.tab='night';if(MGR.confirmEnd){MGR.confirmEnd=false;MGR.tab='night';wqVisit(w,'next')}}}catch(e){console.error(e)}
  const h=base.apply(this,arguments);if(!live||typeof h!=='string')return h;
  try{const t=document.createElement('template');t.innerHTML=h;const R=t.content;const lbl=_T('❄ Winter Quarters');
    const nb=R.querySelector('.mtabs [data-mg="tab"][data-id="night"]');if(nb){for(const x of [...nb.childNodes])if(x.nodeType===3)x.remove();nb.insertBefore(document.createTextNode(lbl),nb.firstChild);const c=nb.querySelector('.tabchk');if(c)c.remove()}
    const mw=R.querySelector('.lu100mw[data-id="night"] .tx>b');if(mw)mw.textContent=lbl;
    if(MGR.tab==='night'&&!MGR.view){const lb=R.querySelector('.lu100tt>b');if(lb)lb.textContent=lbl;const pane=R.querySelector('#mgrPane');if(pane){const prev=pane.previousElementSibling;if(prev&&prev.classList.contains('roomhd'))prev.remove();
      pane.innerHTML=wq109HTML(w);setTimeout(wq109Scroll,0)}}
    const d=document.createElement('div');d.appendChild(R);return d.innerHTML}catch(e){console.error(e)}return h}}
/* the money ledger sees every week end */
{const base=endWeek;endWeek=async function(){try{led109Install(W_())}catch(e){}const r=await base.apply(this,arguments);try{led109Install(W_())}catch(e){}return r}}
/* the off-season opens: the asks' news and the farewell letters go to the rooms; ONE "Winter Quarters are open" letter (W7a) */
{const base=po104Renewals;po104Renewals=function(w){const tn=window.tnews;let r;try{tnews=function(s){if(/📜/.test(String(s||''))&&/contract ask/.test(String(s)))return;return tn.apply(this,arguments)}}catch(e){}
  try{r=base.apply(this,arguments)}finally{try{tnews=tn}catch(e){}}return r}}
{const base=po104RevHTML;po104RevHTML=function(R,letter){let h=base.apply(this,arguments);try{if(letter)h=h.split(_T`🌿 The off-season`).join(_T('❄ Winter Quarters'))}catch(e){}return h}}
{const base=po104OffStart;po104OffStart=function(w,P){const r=base.apply(this,arguments);try{if(!w||w.tutorial||w.dead)return r;const pm=me();w.wq109={s:w.season,step:'over',v:{},sealed:null};
    w.letters=(w.letters||[]).filter(x=>!(x&&typeof x.key==='string'&&/^c104ret-/.test(x.key)&&x.s===w.season));
    const T=wqTable(w);const pos=T.indexOf(pm)+1;const ren=wqOpen(w);let qt=0;try{const Q=wqQ(w,pm);qt=Q?wqQLines(Q).total:0}catch(e){}
    const ret=w.c104rev&&w.c104rev.s===w.season?(w.c104rev.ret||[]).filter(x=>x.mine).map(x=>esc(x.name)):[];
    const li=[_T`🏆 <b>Awards night</b> — your house finished #${pos} of ${T.length}.`,_T`⚖ <b>The Quaestor’s Ledger</b> waits for your seal (about ${wqCoin('+'+qt)}).`,
      ren?_T`✍ <b>${ren} contract ask${ren===1?'':'s'}</b> in Personnel.`:'',ret.length?_T`🏺 Farewells: ${ret.join(', ')}.`:'',_T`📅 <b>Season ${w.season+1}</b> begins from the last room.`].filter(Boolean);
    sendLetter(w,{key:'wq109-'+w.season,kind:'letter',from:_T('the Consilium'),adv:'consilium',seal:'❄',title:_T('Winter Quarters are open'),
      body:`<p>${_T('The season is over. The house goes into Winter Quarters — on the Match Week tab, room by room, in any order.')}</p><ul class="po104rv">${li.map(x=>`<li>${x}</li>`).join('')}</ul><div class="acts"><button class="btn tksm" type="button" data-wq109="go|over">${_T('❄ To Winter Quarters')}</button></div>`})}catch(e){console.error(e)}
  return r}}
/* the rail's per-tab ✓ (95 tabDone73): Winter Quarters is done when rooms 1, 2 and 6 are */
if(typeof tabDone73==='function'){const base=tabDone73;tabDone73=function(k){try{if(k==='night'){const w=W_();if(wqLive(w))return ['awards','books','staff'].every(x=>wqDone(w,x))}}catch(e){}return base.apply(this,arguments)}}
/* that week's checklist (88 weekChecklist + its wrappers): the rooms' items instead of "contract ends this week" */
{const base=weekChecklist;weekChecklist=function(){const I=base.apply(this,arguments);try{const w=W_();if(!Array.isArray(I)||!wqLive(w))return I;const S=wqState(w);const ren=wqOpen(w);
  const go=(k,l)=>`<button class="btn tksm" type="button" data-wq109="go|${k}">${l}</button>`;const out=I.filter(x=>x.ic!=='📜');
  out.push({done:!!S.v.awards,ic:'🏆',txt:S.v.awards?_T('Awards night: seen'):_T('<b>Awards night</b> waits in Winter Quarters'),btn:S.v.awards?'':go('awards',_T('Awards night'))});
  out.push({done:!!S.sealed,ic:'⚖',txt:S.sealed?_T('The Quaestor’s Ledger is sealed'):_T('<b>The Quaestor’s Ledger</b> waits for your seal'),btn:S.sealed?'':go('books',_T('Accounts'))});
  out.push({done:!ren,ic:'✍',txt:ren?_T`<b>${ren} contract ask${ren===1?'':'s'}</b> wait in Personnel`:_T('No contract asks waiting'),btn:ren?go('staff',_T('Personnel')):''});
  return out}catch(e){console.error(e)}return I}}
}
/* clicks: the stepper, the seal, Begin; the rail's End the week opens room 10 */
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest||!V109WQ.on)return;
  const b=t.closest('[data-wq109]');
  if(b){e.preventDefault();e.stopImmediatePropagation();const [a,v]=b.dataset.wq109.split('|');const w=W_();if(!w)return;
    if(a==='go'){wqGo(WQ_K.includes(v)?v:'over');return}
    if(!wqLive(w))return;
    if(a==='seal'){const t2=wqSeal(w,me());if(t2!=null){try{mToast(_T`🏛 The Quaestor’s Ledger is sealed: ${wqCoin('+'+t2)}.`)}catch(x){}}if(typeof MGR_REDRAW==='function')MGR_REDRAW();return}
    if(a==='begin'){wqBegin();return}
    return}
  const ea=t.closest('[data-mg="endask"]');if(ea){const w=W_();if(wqLive(w)){e.preventDefault();e.stopImmediatePropagation();wqGo('next')}}},true);

{const st=document.createElement('style');st.textContent=`
.wq109{display:flex;flex-direction:column;gap:8px;min-width:0}
.wq109st{display:flex;align-items:center;gap:0;overflow-x:auto;padding:6px 4px;border:1px solid #6b5236;border-radius:8px;background:linear-gradient(180deg,#1d2230,#14100c);scrollbar-width:thin;max-width:100%}
.wq109st .wqs{flex:none;display:flex;flex-direction:column;align-items:center;gap:1px;min-width:62px;padding:3px 4px;border:0;background:none;color:#cbb593;cursor:pointer;font:600 11px var(--sans,system-ui);border-radius:6px}
.wq109st .wqs .n{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;border:1px solid #8a6a2c;background:#1a120d;color:#f0cf7d;font:400 14px var(--display)}
.wq109st .wqs.done .n{background:#2c4a2a;border-color:#9fdc8a;color:#d6f5c8}.wq109st .wqs.cur .n{background:linear-gradient(#f6dc98,#c99a3a);color:#2a1a08;border-color:#fff1c4;box-shadow:0 0 8px #f0cf7d88}
.wq109st .wqs.cur{color:#fff3d6}.wq109st .wqs.ov{min-width:36px;font-size:18px;color:#cfe0ff}.wq109st .wqs.ov.cur{text-shadow:0 0 8px #9fc4ff}
.wq109st .wqs:focus-visible{outline:2px solid #f0cf7d}.wq109st .wqsl{flex:1 0 8px;min-width:8px;height:2px;background:#6b5236;margin-bottom:14px}
#mgrBody .roomhd.wq109ban::after{background:linear-gradient(90deg,#0c1018d8 0,#0c101890 38%,#0c101820 62%,#0c101880 100%)}
#mgrBody .roomhd.wq109ban .wqchip .ptbox{color:#cfe6ff!important}.wqchip .ptbox img{vertical-align:middle}.wq109ban .wqbb{display:inline-flex;margin-left:8px;vertical-align:middle}
.wq109c{min-width:0}.wq109c .sect{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}.wqlead{margin:0 0 8px;font-size:14px}
.wq2{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:8px}.wq2>.card2{margin:0}
.wqtiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px}
.wqt{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;padding:10px 10px 10px 40px;min-height:74px;border:1px solid #6b5236;border-radius:8px;background:linear-gradient(160deg,#2a2018,#17110c);color:#f3e3bd;cursor:pointer;min-width:0}
.wqt:hover{border-color:#d6ab4c}.wqt .n{position:absolute;left:8px;top:10px;display:grid;place-items:center;width:24px;height:24px;border-radius:50%;border:1px solid #8a6a2c;font:400 13px var(--display);color:#f0cf7d}
.wqt.done .n{background:#2c4a2a;border-color:#9fdc8a;color:#d6f5c8}
.wqt .ic{position:absolute;right:8px;top:8px;font-size:18px;opacity:.85}.wqt b{font:400 16px var(--display);color:#f6dc98;padding-right:22px}.wqt small{font-size:12px;color:#cbb593}
.wq109nav{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center;margin-top:2px}.wq109nav .btn{max-width:100%}.wq109go small{display:block;font-size:11px;opacity:.85}
.wqpods{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:4px 0 8px}
.wqpod{display:flex;flex-direction:column;align-items:center;text-align:center;gap:3px;padding:8px 6px;border:1px solid rgba(214,171,76,.5);border-radius:8px;min-width:0}.wqpod.p1{border-color:#d6ab4c;background:rgba(214,171,76,.16)}.wqpod.me{outline:2px solid #d6ab4c}
.wqpod .pl{font:400 22px var(--display);color:var(--gold2)}.wqpod b{font-size:13px;overflow-wrap:anywhere}.wqpod small{font-size:11px;color:#cbb593}
.wqsb{display:flex;align-items:center;gap:8px;margin:0 0 6px;font-size:14px}
.wqtw{overflow-x:auto;max-width:100%}.wqtbl{width:100%;border-collapse:collapse;font-size:12.5px}.wqtbl th{text-align:left;font:600 10.5px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:#cbb593;padding:3px 5px;border-bottom:1px solid #6b5236}
.wqtbl td{padding:3px 5px;border-bottom:1px dashed rgba(214,171,76,.18);white-space:nowrap}.wqtbl td.hs{max-width:220px;overflow:hidden;text-overflow:ellipsis}.wqtbl tr.me td{background:rgba(214,171,76,.2)}.wqtbl tr.pod td.pl{color:var(--gold2);font-weight:700}
.wqtbl td.sb.ch{color:#f6dc98;font-weight:700}.wqtbl .flagchip{vertical-align:middle}
.wqaws{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px}.wqaw{display:flex;gap:8px;align-items:center;padding:6px;border:1px solid rgba(214,171,76,.35);border-radius:8px;min-width:0}.wqaw.me{outline:2px solid #d6ab4c}
.wqaw>div{display:flex;flex-direction:column;min-width:0}.wqaw b{color:#f6dc98}.wqaw .rc-sub{font-size:11px}.wqwho{font-size:13px;font-weight:600}.wqaw small{font-size:11px;color:#cbb593}
.wqbar{display:grid;grid-template-columns:170px minmax(0,1fr) 64px;gap:8px;align-items:center;font-size:12.5px;margin:3px 0}.wqbar .b{height:10px;border-radius:5px;background:rgba(0,0,0,.35);overflow:hidden}.wqbar .b i{display:block;height:100%}
.wqbar .l{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.wqbar.wqres .l{font-style:italic;opacity:.8}
.wqbar.i .b i{background:linear-gradient(90deg,#4f8a3a,#9fdc8a)}.wqbar.o .b i{background:linear-gradient(90deg,#8a2a1a,#e07a5a)}.wqbar .v{text-align:right;font:600 12px var(--mono)}.wqbar.i .v{color:#9fdc8a}.wqbar.o .v{color:#f2a497}
.wqtot{margin:8px 0 0;font-size:14px}.wqtot .up{color:#9fdc8a;font-weight:700}.wqtot .dn{color:#f2a497;font-weight:700}
.wqll{display:flex;justify-content:space-between;gap:8px;padding:3px 0;border-bottom:1px dashed rgba(214,171,76,.25);font-size:13px}.wqll b{font-family:var(--mono);white-space:nowrap}.wqll.tot{border-bottom:0;border-top:1px solid #d6ab4c;margin-top:4px;padding-top:6px;font-size:14px}
.wqsay{margin-top:10px}
.wqrow{display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center;padding:5px 0;border-bottom:1px dashed rgba(214,171,76,.3);overflow-wrap:anywhere}.wqrow .acts{margin-left:auto;display:flex;gap:6px;flex-wrap:wrap}
.wqct td.nm{display:flex;gap:6px;align-items:center;white-space:normal;min-width:150px}.wqct td{padding:3px 4px}.wqct tr.due td{color:#f6dc98}.wqgr{display:inline-block;min-width:22px;text-align:center;font:700 11px var(--mono);padding:1px 4px;border-radius:3px;border:1px solid var(--gc);color:var(--gc)}
.wqwks{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:6px}.wqwk{display:flex;flex-direction:column;align-items:center;text-align:center;gap:1px;padding:6px 3px;border:1px solid #6b5236;border-radius:6px;min-width:0}.wqwk .n{font:400 15px var(--display);color:var(--gold2)}.wqwk b{font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}.wqwk small{font-size:10.5px;color:#cbb593;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
.wqwk.bye{opacity:.6}.wqwk.riv{border-color:#c0433a}.wqwk.po{border-color:#d6ab4c;background:rgba(214,171,76,.12)}.wqwk.wq{border-color:#7a8ab0;background:#1c2232}
.wqnotes{margin:4px 0 0 16px;padding:0;line-height:1.45;font-size:13px}.wqwhy{color:#f2a497}
@media (max-width:760px){.wq2{grid-template-columns:minmax(0,1fr)}.wqwks{grid-template-columns:repeat(4,minmax(0,1fr))}
  .wqbar{grid-template-columns:120px minmax(0,1fr) 54px}.wqtiles{grid-template-columns:repeat(2,minmax(0,1fr))}.wqt{padding-left:36px}.wqaws{grid-template-columns:minmax(0,1fr)}.wq109st .wqs{min-width:54px}
  .wqpods{gap:4px}.wqpod b{font-size:11.5px}}
`;document.head.appendChild(st)}
