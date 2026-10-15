/* =====================================================================
   339-v102gear · v1.02 workstream H (his M11, pick 2a 2026-10-14) — THE MANAGER GEAR LOOP IN STEP WITH ONLINE
   =====================================================================
   1 · RECRUITS SIGN WITH ONLY THE ISSUED KIT: a fighter who joins a house (signed free agent, the starting rosters of a NEW career, a
       rival's recruit) gets the house's Issued Level 1 kit — online's issueList100 (111-onlcore v1.0 server batch A): galea + wraps +
       legwraps and the class's Level 1 weapon(s) (ISSUE_W100; a custom class: its own Level 1 weapons, else a gladius). Every piece is
       marked Issued (P.iss = his id, 272): worth nothing, never sold, vanishes when he dies or leaves. No class loadout arrives with a
       signing any more (225's g.k94 class kit). Each signing gets a fresh Issued kit (the last one vanished when he left).
       The rule applies once a world carries w.gear102: new worlds get it at creation ({old:0}); careers saved before v1.02 get it from
       SAVE_MIGRATIONS '1.02' ({old:1}) — nothing they own is taken away; only their NEXT signings come with the Issued kit.
   2 · DENTED, A TENTH TO MEND: armor stripped to 0 AP comes home damaged (dented) as before; its repair = ceil(value/10), at least 1
       (online 316 O1) via ARM94.fixFn (225's arm94Fix). Issued armor stripped to 0 AP VANISHES (online: Issued is never repaired);
       weapons used up/thrown/broken stay lost (225). An Issued piece picked up off the sand never comes home as a real piece
       (seat.gear94.iss → the snapshot's skip list, like in-bout market buys).
   3 · HOUSES BUY: 225's arm94AutoShop (rivals each week, the mgrsim player) + an UPGRADE pass here: an Issued weapon / armor piece that
       stands where the class kit wants a real one is replaced (shelf first, else bought) within the same budget rule; the Issued piece
       goes back to Flavius (deleted). Empty hands are filled first across the whole roster. The mgrsim player (o.player) buys like a
       rival: at most ARM94.rivMax a week above its reserve.
   5 · STARTING TREASURY (his answer 2026-10-14): a NEW career's houses start with GR102.start more coin (plain treasury coin, "just enough
       to get started"; w.gear102.start records it) — later gear is paid by wins and podiums. Tuned with tools/mgrsim.js (collapse rate).
   4 ·The Manager lesson's Armory step and the first-hour Recruiting tip say it.
   Kill switch: localStorage flavius_v102hoff=1 (nothing installed — 225/272 exactly). Test: tools/tests/tv102h.js
   ===================================================================== */
const GR102={on:false,mk:0,div:10,start:100}; /* TWEAK start: extra starting coin for every house of a NEW career — the smallest that keeps mgrsim collapses near the pre-v1.02 rate */
try{GR102.on=localStorage.getItem('flavius_v102hoff')!=='1'}catch(e){GR102.on=true}
if(GR102.on){
/* the Issued kit of a class: {R,L,a:[keys]} */
function iss102Kit(cls){let list=null;try{if(typeof ONLC!=='undefined'&&ONLC.ISSUE_W100&&ONLC.ISSUE_W100[cls])list=ONLC.issueList100(cls)}catch(e){}
  if(!list){const C=CLASSES[cls]||{};const ws=[C.R,C.L].filter(k=>k&&W[k]&&(W[k].lv|0)<=1);list=['galea','wraps','legwraps',...(ws.length?ws:['gladius'])]}
  const o={R:null,L:null,a:[]};for(const k of list){if(ARM[k])o.a.push(k);else if(W[k]){if(!o.R)o.R=k;else if(!o.L)o.L=k}}return o}
const g102Rule=w=>!!(w&&(w.gear102||GR102.mk));
function iss102Give(w,g,h){const K=iss102Kit(g.cls);const E=g.eq94={h,R:null,L:null,a:[],o:[]};const mk=(t,k)=>{const P=arm94New(w,t,k);P.iss=g.id;return P};
  if(K.R&&!arm94HandGone(g,'R'))E.R=mk('w',K.R);if(K.L&&!arm94HandGone(g,'L'))E.L=mk('w',K.L);
  for(const k of K.a){const A=ARM[k];const P=mk('a',k);if(!A.pair&&(A.slot==='arm'||A.slot==='leg'))P.loc=arm94DefLoc(A);if(arm94Locs(P).every(l=>arm94Gone(g,l)))continue;E.a.push(P)}
  g.k94=1;g.k102=1}
/* 1 · a signing: the Issued kit instead of the class loadout */
{const base=arm94EnsureG;arm94EnsureG=function(w,g){try{if(w&&g&&g.alive&&g102Rule(w)){const h=arm94Home(g);
    if(h&&g.eq94&&g.eq94.h!==h){arm94Strip(w,g)}
    if(h&&!g.eq94&&!g.loanFrom){const m=arm94M(w,h);if(m){iss102Give(w,g,h);base.apply(this,arguments);return true}}}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
{const base=newWorld;newWorld=function(){GR102.mk++;let r;try{r=base.apply(this,arguments)}finally{GR102.mk--}try{const w=W_();if(w){if(!w.gear102)w.gear102={old:0};if(w.gear102.start==null){w.gear102.start=GR102.start;for(const m of w.mgrs||[])if(!m.dead)m.coin+=GR102.start}}}catch(e){console.error(e)}return r}}
SAVE_MIGRATIONS.push(['1.02',w=>{if(w&&!w.gear102)w.gear102=GR102.mk?{old:0}:{old:1,wk:w.week|0}}]); /* a world being created runs the migrations on its first save: not old */
/* 2 · repairs: a tenth of the value; Issued armor stripped to 0 AP vanishes (225's settle reads ARM94.issVanish) */
ARM94.fixFn=P=>Math.max(1,Math.ceil(arm94Price(P.t,P.k)/GR102.div));ARM94.repK=1/GR102.div;ARM94.issVanish=true;
/* an Issued piece is never looted into a real one: the seat names its Issued keys, the snapshot skips them for every looter */
{const base=seatFor;seatFor=function(g){const s=base.apply(this,arguments);try{if(s&&s.gear94&&g&&g.eq94){const E=g.eq94;s.gear94.iss=[E.R,E.L,...E.a].filter(P=>P&&P.iss).map(P=>P.k)}}catch(e){console.error(e)}return s}}
{const base=arm94Snap;arm94Snap=function(){const out=base.apply(this,arguments);try{const pool=[];
  for(const p of S.players||[]){const I=p&&p._g94&&p._g94.iss;if(!I||!I.length)continue;const have=[p.wR&&p.wR.key,p.wL&&p.wL.key,...LOCS.flatMap(l=>((p.pieces||{})[l]||[]).map(pc=>pc.key))];
    for(const k of I){const i=have.indexOf(k);if(i>=0)have.splice(i,1);else pool.push(k)}}
  if(pool.length)for(const id in out)out[id].mk=[...(out[id].mk||[]),...pool]}catch(e){console.error(e)}return out}}
/* 3 · the upgrade pass: Issued pieces where the class kit wants a real one */
function g102Upgrade(w,m,o,used){if(!w||!m||m.dead)return 0;const H=arm94H(m);const st=arm94St(w);
  let left=o&&o.player?Math.max(0,Math.min(ARM94.rivMax-(used|0),m.coin-ARM94.playerReserve)):Math.max(0,Math.min(ARM94.rivMax-(used|0),m.coin-ARM94.rivFloor));let spent=0;
  const drop=P=>{const i=H.sh.indexOf(P);if(i>=0)H.sh.splice(i,1)};
  const get=(t,k)=>{const P=H.sh.find(x=>x.t===t&&x.k===k&&!x.dmg&&!x.iss);if(P)return P;const pr=arm94Price(t,k);if(!pr||pr>left||pr>m.coin)return null;
    left-=pr;spent+=pr;m.coin-=pr;st.spent+=pr;if(!m.isPlayer)st.rivSpent+=pr;st.buy++;arm94Fl(w,m,'buy',pr);const N=arm94New(w,t,k);H.sh.push(N);return N};
  const ros=rosterOf(m).filter(g=>g.eq94&&g.eq94.h===m.id&&!g.loanFrom&&!g.inj);
  const n=w.night;const card=new Set(n&&n.bouts?n.bouts.flatMap(b=>b.ents||[]):[]);ros.sort((a,b)=>(card.has(b.id)?1:0)-(card.has(a.id)?1:0)||effOvr(b)-effOvr(a));
  for(const g of ros){const E=g.eq94;const K=arm94Kit(g.cls);
    for(const h of ['R','L']){const cur=E[h];const k=K[h];if(!cur||!cur.iss||!k||cur.k===k||!W[k]||W[k].lv>3||arm94HandGone(g,h))continue;const P=get('w',k);if(!P)continue;
      const r=arm94Put(m,P.id,{g:g.id,z:h});if(r.ok){for(const x of r.rep||[])if(x.iss)drop(x)}}
    for(const x of K.a){if(E.a.some(P=>P.k===x.k&&!P.dmg))continue;const z=x.loc==='pair'?'body':x.loc;const F=arm94Fit(g,{t:'a',k:x.k,loc:x.loc==='pair'?undefined:x.loc},z);
      if(F.no||!F.rep.length||!F.rep.every(P=>P.iss))continue;const P=get('a',x.k);if(!P)continue;const r=arm94Put(m,P.id,{g:g.id,z});if(r.ok){for(const y of r.rep||[])if(y.iss)drop(y)}}}
  return spent}
/* empty hands first, across the whole roster (a new house has many Issued fighters wanting class pieces; a bare hand must not wait behind them) */
function g102Hands(w,m,o){if(!w||!m||m.dead)return 0;const H=arm94H(m);const st=arm94St(w);
  let left=o&&o.player?Math.max(0,m.coin-ARM94.playerReserve):Math.max(0,Math.min(ARM94.rivMax,m.coin-ARM94.rivFloor));let spent=0;
  for(const g of rosterOf(m)){const E=g.eq94;if(!E||E.h!==m.id||g.loanFrom||g.inj)continue;const K=arm94Kit(g.cls);
    for(const h of ['R','L']){if(E[h]||arm94HandGone(g,h))continue;const k=K[h];if(!k||!W[k]||W[k].lv>3)continue;
      let P=H.sh.find(x=>x.t==='w'&&x.k===k&&!x.dmg);if(!P){const pr=arm94Price('w',k);if(!pr||pr>left||pr>m.coin)continue;left-=pr;spent+=pr;m.coin-=pr;st.spent+=pr;if(!m.isPlayer)st.rivSpent+=pr;st.buy++;arm94Fl(w,m,'buy',pr);P=arm94New(w,'w',k);H.sh.push(P)}
      arm94Put(m,P.id,{g:g.id,z:h})}}
  return spent}
{const base=arm94AutoShop;arm94AutoShop=function(w,m,o={}){let pre=0;try{pre=g102Hands(w,m,o)}catch(e){console.error(e)}const mx=ARM94.rivMax,pr0=ARM94.playerReserve;ARM94.rivMax=Math.max(0,mx-pre);
  /* the mgrsim player buys like a rival (at most rivMax a week, keeping its reserve) — every piece costs coin now */
  if(o&&o.player&&m)ARM94.playerReserve=Math.max(pr0,m.coin-ARM94.rivMax);let r=0;
  try{r=base.apply(this,arguments)}finally{ARM94.rivMax=mx;ARM94.playerReserve=pr0}let u=0;try{u=g102Upgrade(w,m,o,r+pre)}catch(e){console.error(e)}return pre+r+u}}
/* 4 · the lesson and the first-hour tip say it */
try{const a=MTUT_STEPS.find(s=>s.k==='armory');if(a)a.say=_T`<b>🛡 The Armory</b> — its own tab. A new recruit signs with only the house's <b>Issued kit</b> (padding and a Level 1 weapon, worth nothing); real gear is bought in the City Square, looted or won. Pick a fighter, then drag a weapon into a hand or armor onto the body. Weapons lost on the sand are gone; armor broken to 0 AP comes home dented — the armorer mends it for a tenth of its price.`}catch(e){console.error(e)}
try{const t=FH100_MGR.find(s=>s.k==='g_recruit');if(t)t.say=()=>_T`<b>Recruiting.</b> Click a free agent. Your Recruiter's hours scout them, pitches win them over, then offer a contract. A new signing brings only the Issued kit — buy his real gear in the City Square.`}catch(e){console.error(e)}
}
