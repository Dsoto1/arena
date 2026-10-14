/* =====================================================================
   157-V88MGR · v0.88 — Manager: Immortalis, the purse cap, Recruiting II (Virgilante's v0.88 answers, 2026-10-05)
   =====================================================================
   1. IMMORTALIS — a gladiator's career status. mgrImmortalis88(g) is true once he has
        · a rating of IMM88.ovr (82)+ — imm88Rating(g) = the overall without wound penalties (g.ovr + statOvr, no severed /
          injury dents; effOvr minus the wounds),
        · IMM88.wins (15)+ career wins (g.rec.w),
        · at least one invitational or Flavius Superbus title — g.titles88 (counted by a specCrown wrapper from v0.88 on),
          else w.specialLog / w.finale / the season archives naming him champion (older careers).
      The first time it holds, g.imm88 = {wk, season} is stamped and stays for good (the test is never re-run against him):
      a line in his career chronicle (ghist), the Acta (mnews 'big') and, for your own fighter, a letter from the
      Consilium. Checked after every bout (applyBout), title (specCrown) and week (endWeek), and lazily on display.
      LOOK: a gold laurel frame — BOTH classes `.imm88` (defined by 156) and the fallback `.imm88m` (here: a gold double
      border by box-shadow + two ❦ laurel marks `.imm88lf`) on: Roster wall plaques (.dcard[data-gid84]), the roster
      table rows (tr[data-mg="lsel"]), his record/detail card (detailHTML wrapper + a "❦ Immortalis" chip), the Training
      Yard card (yardCard76 wrapper) and squad row (.yo87r[data-yo87row]), Match Week bout rows (tr holding his
      [data-mg="fav"]). The DOM rows are tagged by imm88Sweep (MutationObserver on #mgrBody, 40 ms debounce).
      RIVALS FEAR THEM (modest, IMM88.fear): while you keep an Immortalis, a rival's challenge letter (rivalLetter76 'chal')
      becomes "<house> backs down" (no buttons, no challenge); in a bout with an Immortalis every other entrant loses
      IMM88.fear (3) morale before it is fought (applyBout wrapper — morale nudges the seat's temper), and Match Week shows
      "😨 fears <name>" beside them. Odds are untouched.
   2. WIN PURSE CAP: win87Mult (150) is wrapped — upset (≤×2) × streak (≤×2) is capped at WIN_CAP88 = ×3 (was up to ×4).
   3. RECRUITING II
      (1) DEADLINE + COUNTER-BID. A free agent on your board (favd, any stage short of signed) is courted from the week he
          was pinned: g.court88 = {mid, wk (absolute week)}. In the 3rd week (w.week = wk+2, sent when that week opens) the
          strongest rival suitor counter-bids: g.court88.bid = {mid, wage (ask × REC88.bidX), wk}; a letter from your
          Recruiter ('rb88_<gid>', adv 'recruiter') with ⚖ Match (sign at their wage), 🎯 Outbid with one of his
          REVEALED wants (wantOutbid88: coin = their wage +15%, arena time = your ask + the main-event pledge, rudis path =
          your ask + the rudis promise, fame / home city / a friend = your ask if your house answers it), 🚶 Walk away.
          Nothing by the week's end → he signs with the rival (endWeek wrapper; news line). The tablet and his card show
          "⏳ Rival bid in N weeks" / "⚖ Rival bid — answer by the week's end" (cd88). Not in the lesson league.
      (2) WANTS. Each free agent has 1–2 wants from WANTS88 (coin, arena time, fame, rudis path, home city, a friend in the
          house), rolled from his id (hashStr — never the dice RNG; not stored). 👁 Watch them train reveals the first,
          a scout / trial (scout ≥2) all. Revealed wants = chips on his card (✓ when your house answers it now). Court step:
          🎯 Speak to his want (free, once a recruit a week, +WANT88.pitch interest when your house answers it, else
          +WANT88.weak; the button shows the gain). Offer step: every revealed want your terms answer adds WANT88.gain
          interest inside offerVerdict (the live meter shows each want ✓ +N / ✗ how to answer); a "Promise the rudis path"
          tick appears when the rudis want is known (kept as g.rudis88 at signing).
      (3) PROGRESSIVE SCOUTING. ratingsHTML shows ranges that narrow: unscouted ±12, ask around / one scouting (scout 1)
          ±8, watched train ±4, scouted / trial / yours = exact (rng88Level). A range always holds the true value and is
          stable: its offset is a fraction hashed from the fighter id + rating, so narrower ranges sit inside wider ones.
          Replaces 144's one-line "scout to see" (the ranges show from the start).
   No save migration: every new field is optional and created when first needed.
   Test: tv88m.
   ===================================================================== */

/* ---------- 1 · Immortalis ---------- */
/* TWEAK: the milestones and the fear */
const IMM88={ovr:82,wins:15,fear:3};
const imm88Rating=g=>{try{return clamp(Math.round((g.ovr||0)+(typeof statOvr==='function'?statOvr(g):0)),25,99)}catch(e){return g&&g.ovr||0}};
function imm88Titled(g){if(!g)return false;if((g.titles88||0)>0)return true;const w=typeof W_==='function'?W_():null;if(!w)return false;
  const n=g.name;if(!n)return false;
  if((w.specialLog||[]).some(x=>x&&x.champ===n))return true;
  if(w.finale&&w.finale.champ===n)return true;
  if((w.archives||[]).some(a=>a&&a.finale&&a.finale.champ===n))return true;
  return false}
function imm88Meets(g){return !!g&&g.alive!==false&&imm88Rating(g)>=IMM88.ovr&&((g.rec&&g.rec.w)||0)>=IMM88.wins&&imm88Titled(g)}
function mgrImmortalis88(g){if(!g)return false;if(g.imm88)return true;if(!imm88Meets(g))return false;imm88Stamp(g);return true}
function imm88Stamp(g){const w=typeof W_==='function'?W_():null;if(!w||g.imm88||!(w.glads||[]).includes(g))return;
  g.imm88={wk:w.week,season:w.season};
  try{ghist(g,_T`became <b>Immortalis</b> — a legend of the sand`)}catch(e){}
  const m=g.contract?mgrById(g.contract.mgr):null;
  try{mnews(_T`❦ <b>${esc(g.name)}</b>${m?_T` of ${esc(m.ludus)}`:''} is <b>Immortalis</b> — ${g.rec.w} wins, a title, a name the crowds will not forget.`,'big')}catch(e){}
  if(m&&m.isPlayer&&!w.tutorial){try{sendLetter(w,{key:'imm88_'+g.id,kind:'letter',from:_T('the Consilium'),adv:'consilium',seal:'❦',title:_T`${g.name} is Immortalis`,until:w.week+2,
    body:`<p>${_T`<b>${esc(g.name)}</b> has done what few ever do: ${g.rec.w} wins, a title, and a rating of ${imm88Rating(g)}. The crowds name them <b>Immortalis</b>.`}</p><p class="rc-sub">${_T`The gold laurel is theirs from now on. Rival houses think twice before they challenge you, and whoever faces them on the sand fights a little afraid.`}</p>`})}catch(e){console.error(e)}}}
function imm88Check(w){if(!w||!Array.isArray(w.glads))return;for(const g of w.glads)if(g&&!g.imm88&&g.alive!==false)mgrImmortalis88(g)}
const imm88Mine=w=>{try{const m=me();return (w.glads||[]).filter(g=>g.imm88&&g.alive!==false&&g.contract&&g.contract.mgr===m.id)}catch(e){return []}};
const IMM88_LF='<i class="imm88lf l" aria-hidden="true">❦</i><i class="imm88lf r" aria-hidden="true">❦</i>';
/* titles: every invitational / Superbus crown counts on the champion */
{const base=specCrown;specCrown=function(bracket){const r=base.apply(this,arguments);try{const g=specEnt(bracket.champ);if(g&&typeof g==='object'){g.titles88=(g.titles88||0)+1;mgrImmortalis88(g)}}catch(e){console.error(e)}return r}}
/* the bout: opponents of an Immortalis fight a little afraid; wins may crown one */
{const base=applyBout;applyBout=function(bi){const w=W_();const b=w&&w.night&&w.night.bouts&&w.night.bouts[bi];
  try{if(b&&!b.done&&!b.fear88){const imm=b.ents.map(gById).filter(g=>g&&g.imm88&&g.alive!==false);if(imm.length){b.fear88=imm.map(g=>g.id);
    for(const id of b.ents){const g=gById(id);if(g&&!g.imm88)g.morale=clamp((g.morale||50)-IMM88.fear,0,100)}}}}catch(e){console.error(e)}
  const r=base.apply(this,arguments);try{if(w)imm88Check(w)}catch(e){console.error(e)}return r}}
/* rivals fear them: no challenge letters while you keep an Immortalis */
{const base=rivalLetter76;rivalLetter76=function(w){const r=base.apply(this,arguments);try{const key='rl76'+w.season+'_'+w.week;const L=(w.letters||[]).find(x=>x.key===key);
  if(L&&L.rl76&&L.rl76.kind==='chal'){const imm=imm88Mine(w);if(imm.length){const R=mgrById(L.rl76.mgr);const nm=imm[0].name;
    L.rl76.kind='fear';L.done76=1;L.seal='❦';L.title=_T`${R?R.ludus:_T('A rival')} backs down`;
    L.body=`<p>${_T`“We had a challenge written. Then someone reminded us who sleeps in your barracks. Not while <b>${esc(nm)}</b> stands.”`}</p>`;
    tnews(_T`❦ ${esc(R?R.ludus:_T('A rival house'))} will not challenge you while ${esc(nm)} stands.`)}}}catch(e){console.error(e)}return r}}
/* the record / detail card and the Training Yard card wear the frame */
function imm88Frame(h,g){if(!h||!g||!mgrImmortalis88(g))return h;return h.replace(/class="/,'class="imm88 imm88m ').replace(/^(\s*<[^>]*>)/,`$1${IMM88_LF}`)}
{const base=detailHTML;detailHTML=function(g){let h=base.apply(this,arguments);try{if(g&&mgrImmortalis88(g)){h=imm88Frame(h,g);
  h=h.replace('</button>'+esc(g.name),`</button>${esc(g.name)} <span class="imm88chip" title="${_T`Immortalis since season ${g.imm88.season}, week ${wkOf(g.imm88.wk)}: rating ${IMM88.ovr}+, ${IMM88.wins}+ wins and a title`}">${_T`❦ Immortalis`}</span>`)}}catch(e){console.error(e)}return h}}
{const base=yardCard76;yardCard76=function(g){const h=base.apply(this,arguments);try{return imm88Frame(h,g)}catch(e){return h}}}
/* the DOM rows: plaques, roster rows, squad rows, Match Week bout rows (+ "fears" chips) */
function imm88Tag(el){if(!el||el.classList.contains('imm88m'))return;el.classList.add('imm88','imm88m');
  if(el.tagName==='TR'){const td=el.querySelector('td');if(td&&!td.querySelector('.imm88lt'))td.insertAdjacentHTML('afterbegin','<i class="imm88lt" title="Immortalis">❦</i>')}
  else if(!el.querySelector(':scope>.imm88lf'))el.insertAdjacentHTML('afterbegin',IMM88_LF)}
function imm88Sweep(){const root=document.getElementById('mgrBody');if(!root||typeof W_!=='function'||!W_())return;
  const isI=id=>{const g=id&&gById(id);return !!(g&&mgrImmortalis88(g))};
  root.querySelectorAll('.dcard[data-gid84]').forEach(el=>{if(isI(el.dataset.gid84))imm88Tag(el)});
  root.querySelectorAll('.yo87r[data-yo87row]').forEach(el=>{if(isI(el.dataset.yo87row))imm88Tag(el)});
  root.querySelectorAll('tr[data-mg="lsel"][data-id]').forEach(el=>{if(isI(el.dataset.id))imm88Tag(el)});
  if(MGR.tab==='night')root.querySelectorAll('table').forEach(t=>{const rows=[...t.querySelectorAll(':scope>tbody>tr,:scope>tr')].map(tr=>({tr,b:tr.querySelector('[data-mg="fav"][data-id]')})).filter(x=>x.b);if(!rows.length)return;
    const imm=rows.filter(x=>isI(x.b.dataset.id));if(!imm.length)return;const nm=gById(imm[0].b.dataset.id).name;
    for(const x of rows){if(isI(x.b.dataset.id)){imm88Tag(x.tr);continue}
      const td=x.tr.querySelector('td');if(td&&!td.querySelector('.fear88'))td.insertAdjacentHTML('beforeend',` <span class="fear88" title="${esc(_T`Facing an Immortalis: −${IMM88.fear} morale before the bout`)}">${_T`😨 fears ${esc(nm)}`}</span>`)}})}
{let t=0;const run=()=>{t=0;try{imm88Sweep()}catch(e){console.error(e)}};
  const mo=new MutationObserver(()=>{if(!t)t=setTimeout(run,40)});
  const hook=()=>{if(document.body)mo.observe(document.body,{childList:true,subtree:true})};if(document.body)hook();else document.addEventListener('DOMContentLoaded',hook)}

/* ---------- 2 · the win purse cap ---------- */
const WIN_CAP88=3;
{const base=win87Mult;win87Mult=function(){const r=base.apply(this,arguments);try{if(r&&r.all>WIN_CAP88)r.all=WIN_CAP88}catch(e){}return r}}

/* ---------- 3 · Recruiting II ---------- */
const dis88=t=>'disabled title="'+esc(t||'')+'"'; /* i18n:skip */
/* TWEAK: the counter-bid and the wants */
const REC88={bidWeek:2,bidX:1.2,outCoin:1.15,weeks:8};
const WANT88={gain:14,pitch:10,weak:3,coinX:1.15,famMin:30,famMax:60,arenaRoster:6,coinBank:150,honor:55};
const WANTS88=[['coin','🪙',_T('Coin')],['arena','⚔',_T('Arena time')],['fame','📣',_T('Fame')],['rudis','🗡',_T('Rudis path')],['home','🏠',_T('Home city')],['friend','🤝',_T('A friend in the house')]];
const want88Def=k=>{const d=WANTS88.find(x=>x[0]===k)||[k,'•',k];return k==='coin'&&typeof ICO!=='undefined'&&ICO.coin?[d[0],ICO.coin,d[2]]:d};
/* his wants: 1–2, rolled from his id (never the dice RNG) */
function wants88(g){if(!g||!g.id)return [];const h=hashStr('want88:'+g.id);const n=h%3===0?2:1;const out=[];let i=(h>>>3)%WANTS88.length;
  while(out.length<n){const k=WANTS88[i%WANTS88.length][0];if(!out.includes(k))out.push(k);i+=1+((h>>>7)%5)}return out}
/* what scouting has shown you: watching → the first, scouting / a trial → all */
function wants88Known(g){const W=wants88(g);let m=null;try{m=me()}catch(e){}if(m&&g.contract&&g.contract.mgr===m.id)return W;if((g.scout||0)>=2)return W;if(g.watch74)return W.slice(0,1);return []}
/* does your house (and, with T, your offer) answer the want? */
function want88Fits(g,m,k,T){try{const ros=rosterOf(m).filter(x=>x.id!==g.id);const ask=askWage(g);
  if(k==='coin')return T?(T.wage||0)>=Math.ceil(ask*WANT88.coinX):(m.coin||0)>=WANT88.coinBank;
  if(k==='arena')return !!(T&&T.pledge)||ros.length<WANT88.arenaRoster;
  if(k==='fame')return (m.fame||0)>=Math.max(WANT88.famMin,Math.min(WANT88.famMax,g.fame||0));
  if(k==='rudis')return T?!!T.rudis:((m.p&&m.p.honor)||50)>=WANT88.honor;
  if(k==='home')return !!g.city&&m.city===g.city;
  if(k==='friend')return ros.some(x=>(g.city&&x.city===g.city)||x.cls===g.cls)}catch(e){}return false}
function want88How(g,k){const ask=(()=>{try{return askWage(g)}catch(e){return 0}})();
  return {coin:_T`offer ${Math.ceil(ask*WANT88.coinX)}+/wk`,arena:_T('pledge the main event'),fame:_T`house fame ${Math.max(WANT88.famMin,Math.min(WANT88.famMax,g.fame||0))}+`,rudis:_T('promise the rudis path'),home:_T`a house in ${g.city||'their city'}`,friend:_T('someone from their city or class in your house')}[k]||''}
/* the offer's terms as the card shows them right now */
function want88Terms(g,wage,weeks,pledge){const d=id=>document.getElementById(id);const sel=typeof MGR!=='undefined'&&MGR.sel===g.id;
  return {wage,weeks,pledge:!!pledge,rudis:!!(sel&&d('ofRudis88')&&d('ofRudis88').checked)}}
function want88Bonus(g,m,T){return wants88Known(g).filter(k=>want88Fits(g,m,k,T)).length*WANT88.gain}
let WANT88_IN=0;
function want88With(g,m,bonus,fn){if(!bonus||WANT88_IN)return fn();const cur=interestOf(g,m);WANT88_IN=1;g.interest[m.id]=cur+bonus;try{return fn()}finally{g.interest[m.id]=cur;WANT88_IN=0}}
{const base=offerVerdict;offerVerdict=function(g,wage,weeks,bonus,pledge){const self=this,args=arguments;try{const m=me();if(g&&m&&!g.contract){const b=want88Bonus(g,m,want88Terms(g,wage,weeks,pledge));if(b)return want88With(g,m,b,()=>base.apply(self,args))}}catch(e){console.error(e)}return base.apply(this,arguments)}}
/* the live meter: the bonus moves the bar; each known want says ✓ +N or how to answer it */
{const base=ofMeterUpdate;ofMeterUpdate=function(){const self=this,args=arguments;const g=gById(MGR.sel);let m=null;try{m=me()}catch(e){}
  if(!g||!m||g.contract)return base.apply(this,arguments);const d=id=>document.getElementById(id);
  const T=want88Terms(g,+(d('ofWage')||{}).value||askWage(g),+(d('ofWeeks')||{}).value||8,!!(d('ofPledge')||{}).checked);
  const r=want88With(g,m,want88Bonus(g,m,T),()=>base.apply(self,args));
  try{const el=d('ofMeter');const K=wants88Known(g);if(el&&K.length){el.insertAdjacentHTML('beforeend',`<div class="want88m">${_T`🎯 Wants:`} ${K.map(k=>{const [,ic,n]=want88Def(k);const ok=want88Fits(g,m,k,T);
    return `<span class="want88c ${ok?'ok':''}" data-want88c="${k}">${ic} ${esc(n)} ${ok?`<b>✓ +${WANT88.gain}</b>`:`<i>✗ ${esc(want88How(g,k))}</i>`}</span>`}).join(' ')}</div>`)}}catch(e){console.error(e)}return r}}
document.addEventListener('change',e=>{if(e.target&&e.target.id==='ofRudis88')ofMeterUpdate()});
/* a rudis promise is kept at signing */
{const base=signGlad;signGlad=function(g){const r=base.apply(this,arguments);try{const el=document.getElementById('ofRudis88');const m=me();if(g&&m&&MGR.sel===g.id&&el&&el.checked&&g.contract&&g.contract.mgr===m.id){g.rudis88={mid:m.id,s:W_().season,wk:W_().week};ghist(g,_T`was promised the rudis path by ${esc(m.ludus)}`)}}catch(e){}return r}}
/* speaking to a want (Court step): free, once a recruit a week */
function want88PitchGain(g,m,k){return want88Fits(g,m,k,null)?WANT88.pitch:WANT88.weak}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-want88]');if(!b||b.disabled)return;e.preventDefault();e.stopPropagation();
  const w=W_(),m=me();const [k,id]=b.dataset.want88.split('|');const g=gById(id);if(!w||!m||!g||g.contract||!wants88Known(g).includes(k))return;const wk=wkKey74();if(g.wantWk88===wk)return;
  g.wantWk88=wk;const before=interestOf(g,m);g.interest[m.id]=capInterest(g,m,before+want88PitchGain(g,m,k));const got=g.interest[m.id]-before;
  tnews(_T`🎯 You spoke to ${esc(g.name)}'s wish (${want88Def(k)[2].replace(/^./,ch=>typeof LANG!=='undefined'&&LANG==='de'?ch:ch.toLowerCase()) /* German nouns keep their capital */}): interest +${got}.`);MGR.msg=_T`🎯 ${g.name}: interest +${got}.`;saveWorld();MGR_REDRAW()},true);

/* (3) progressive scouting: ranges that narrow */
function rng88Level(g){let m=null;try{m=me()}catch(e){}if(m&&g.contract&&g.contract.mgr===m.id)return 0;const sc=g.scout||0;if(sc>=2)return 0;if(g.watch74)return 4;if(sc>=1||g.rumor74)return 8;return 12}
function rng88(g,k,v,r){if(!r)return [v,v];const f=(hashStr('rng88:'+g.id+':'+k)%1000)/999;let lo=v-Math.round(f*2*r);let hi=lo+2*r;lo=Math.max(STAT_MIN,lo);hi=Math.min(STAT_MAX,hi);return [lo,hi]}
{const base=ratingsHTML;ratingsHTML=function(g){const h=base.apply(this,arguments);try{if(!g||!h)return h;const r=rng88Level(g);if(!r)return h;const st=gStats(g);if(!st)return h;
  let i=0;let out=h.replace(/<i style="width:\d+%"><\/i><\/div><span class="n">[^<]*<\/span>/g,mm=>{const S=STATS[i++];if(!S)return mm;const [lo,hi]=rng88(g,S[0],st[S[0]],r);const pct=Math.round(((lo+hi)/2-STAT_MIN)/(STAT_MAX-STAT_MIN)*100);
    return `<i style="width:${pct}%" class="rng88"></i></div><span class="n rng88n" data-rng88="${S[0]}" data-lo="${lo}" data-hi="${hi}">${lo}–${hi}</span>`});
  const lab=r===12?_T('rough ranges · scout to see'):r===8?_T('rumoured ranges · watch them train'):_T('close ranges · scout for the exact');
  out=out.replace(/(<div class="sect">[^<]*)(<span class="rc-sub">[^<]*<\/span>)?/,(mm,a)=>`${a} <span class="rc-sub rng88h">±${r} · ${lab}</span>`);return out}catch(e){console.error(e);return h}}}

/* (1) the courtship clock */
function court88Sync(w){let m=null;try{m=me()}catch(e){}if(!w||!m||w.tutorial)return;
  for(const g of w.glads||[]){if(g&&g.court88&&!g.favd&&!g.contract&&!g.court88.bid)delete g.court88; /* unpinned before the bid: the clock stops */
    if(!g||g.alive===false||g.contract||!g.favd)continue;if(!g.court88||g.court88.mid!==m.id)g.court88={mid:m.id,wk:w.week}}}
function court88Left(g,w){const c=g&&g.court88;if(!c||g.contract)return null;if(c.bid)return c.bid.ans?null:0;return Math.max(0,c.wk+REC88.bidWeek-w.week)}
function court88Chip(g,w){const n=court88Left(g,w);if(n==null)return '';
  return n<=0?`<span class="cd88 now" title="${_T`A rival house has made a bid — see your mail; unanswered, it wins when the week ends`}">${_T`⚖ Rival bid — answer by the week's end`}</span>`
    :`<span class="cd88" title="${_T`A rival house counter-bids in the 3rd week you court a fighter`}">${n===1?_T('⏳ Rival bid in 1 week'):_T`⏳ Rival bid in ${n} weeks`}</span>`}
function court88Rival(g,m){try{return suitors(g).map(x=>x.m).find(R=>R&&R!==m&&!R.isPlayer&&!R.dead&&!R.sica&&rosterOf(R).length<10)||null}catch(e){return null}}
function court88Bid(w,g){const m=me();const R=court88Rival(g,m);if(!R){g.court88.bid={mid:null,wage:0,wk:w.week,ans:'none'};return}
  const wage=Math.ceil(askWage(g)*REC88.bidX);g.court88.bid={mid:R.id,wage,wk:w.week};const key='rb88_'+g.id;
  sendLetter(w,{key,kind:'offer',from:_T('your recruiter'),adv:'recruiter',seal:'⚖',title:_T`${R.ludus} bids for ${g.name}`,until:w.week,rb88:{gid:g.id,mid:R.id},body:court88Body(w,g,R)})}
function court88Outs(g,m,bid){const ask=askWage(g);return wants88Known(g).map(k=>{let wage=ask,ok=true,why='';
  if(k==='coin')wage=Math.ceil(bid.wage*REC88.outCoin);else if(k==='arena'||k==='rudis')ok=true;else{ok=want88Fits(g,m,k,null);if(!ok)why=want88How(g,k)}
  if(ok&&(m.coin||0)<wage){ok=false;why=_T('Your treasury cannot cover the first week.')}return {k,wage,ok,why}})}
function court88Body(w,g,R){const m=me();const bid=g.court88.bid;const btn=(a,l,dis,t)=>`<button class="btn tksm${a==='match'?' primary':''}" type="button" data-rb88="${a}|${g.id}" ${dis?dis88(t):''}>${l}</button>`;
  const outs=court88Outs(g,m,bid);
  return `<p>${_T`“<b>${esc(R.ludus)}</b> has put <b>${bid.wage}</b> a week on the table for <b>${esc(g.name)}</b>. Answer by the week's end, or the fighter is theirs.”`}</p>
    ${outs.length?'':`<p class="rc-sub">${_T`We don't know what this one wants yet — scout first and we could outbid them on it.`}</p>`}
    <div class="acts">${btn('match',_T`⚖ Match · ${bid.wage}/wk`,(m.coin||0)<bid.wage,_T('Your treasury cannot cover the first week.'))}${outs.map(o=>{const [,ic,n]=want88Def(o.k);return btn('want:'+o.k,_T`🎯 Outbid: ${ic} ${esc(n)} · ${o.wage}/wk`,!o.ok,o.why)}).join('')}${btn('walk',_T('🚶 Walk away'))}</div>`}
function court88ToRival(w,g,why){const c=g.court88,bid=c&&c.bid;const R=bid&&mgrById(bid.mid);if(!R||g.contract)return false;
  g.contract={mgr:R.id,wage:bid.wage,weeks:REC88.weeks,since:w.week};g.unsigned=0;bid.ans=why;
  try{mlog(R,_T`signed ${g.name}, outbidding you`)}catch(e){}ghist(g,_T`signed with ${esc(R.ludus)} (${bid.wage}/wk)`);
  mnews(_T`${esc(R.ludus)} signs <b>${esc(g.name)}</b> (${bid.wage}/wk) — your courtship came to nothing.`);tnews(_T`🚶 ${esc(g.name)} signs with ${esc(R.ludus)}.`,'bad');
  const L=(w.letters||[]).find(x=>x.key==='rb88_'+g.id);if(L){L.read=true;L.done88=1}return true}
function court88Sign(w,g,wage,opt){const m=me();const bid=g.court88&&g.court88.bid;if(g.contract||!bid||bid.ans||(m.coin||0)<wage)return false;
  signGlad(g,wage,REC88.weeks,0,!!opt.pledge);bid.ans=opt.why;if(opt.rudis){g.rudis88={mid:m.id,s:w.season,wk:w.week};ghist(g,_T`was promised the rudis path by ${esc(m.ludus)}`)}
  if(opt.want)g.wantMet88=opt.want;const L=(w.letters||[]).find(x=>x.key==='rb88_'+g.id);if(L){L.read=true;L.done88=1}
  tnews(_T`✍ ${esc(g.name)} signs with you (${wage}/wk)${opt.want?_T` — you answered a wish: ${want88Def(opt.want)[2].replace(/^./,ch=>typeof LANG!=='undefined'&&LANG==='de'?ch:ch.toLowerCase()) /* German nouns keep their capital */}`:''}.`,'big');return true}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-rb88]');if(!b||b.disabled)return;e.preventDefault();e.stopPropagation();
  const w=W_(),m=me();if(!w||!m)return;const [a,id]=b.dataset.rb88.split('|');const g=gById(id);const bid=g&&g.court88&&g.court88.bid;if(!g||!bid||bid.ans||g.contract)return;
  if(a==='match')court88Sign(w,g,bid.wage,{why:'match'});
  else if(a.startsWith('want:')){const k=a.slice(5);const o=court88Outs(g,m,bid).find(x=>x.k===k);if(!o||!o.ok)return;court88Sign(w,g,o.wage,{why:'want',want:k,pledge:k==='arena',rudis:k==='rudis'})}
  else if(a==='walk')court88ToRival(w,g,'walk');
  saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);
{const base=endWeek;endWeek=async function(){const w=W_();const wk0=w&&w.week;try{if(w)court88Sync(w)}catch(e){console.error(e)}
  const r=await base.apply(this,arguments);
  try{const w2=W_();if(w2&&w2===w&&w2.week!==wk0){
    for(const g of w2.glads||[]){const c=g&&g.court88;if(!c||!c.bid||c.bid.ans||g.contract)continue;if(c.bid.wk<w2.week){if(!court88ToRival(w2,g,'late'))c.bid.ans='gone'}}
    court88Sync(w2);
    if(!w2.tutorial)for(const g of w2.glads||[]){const c=g&&g.court88;if(!c||c.bid||g.contract||g.alive===false||!g.favd)continue;if(w2.week-c.wk>=REC88.bidWeek)court88Bid(w2,g)}
    imm88Check(w2)}}catch(e){console.error(e)}return r}}
/* the board's tablets: the countdown */
{const base=pipelineHTML;pipelineHTML=function(){try{court88Sync(W_())}catch(e){}const h=base.apply(this,arguments);try{const w=W_();
  return h.replace(/(class="pcard pt85[^"]*" data-mg="sel" data-id="([^"]+)"[\s\S]*?)(<\/span>\s*<button class="pin85")/g,(mm,a,id,c)=>{const g=gById(id);const chip=g?court88Tiny(g,w):'';return chip?a+chip+c:mm})}catch(e){console.error(e);return h}}}
/* the tablet's compact countdown (the full line is on the card) */
function court88Tiny(g,w){const n=court88Left(g,w);if(n==null)return '';return n<=0?`<span class="cd88 now t" title="${_T`A rival house has made a bid — see your mail; unanswered, it wins when the week ends`}">${_T`⚖ bid!`}</span>`
  :`<span class="cd88 t" title="${n===1?_T('⏳ Rival bid in 1 week'):_T`⏳ Rival bid in ${n} weeks`}">⏳${n}${_T`wk`}</span>`}
/* the free agent's card: countdown, wants, want pitches, the rudis tick, ranges from the start */
{const base=detailHTML;detailHTML=function(g){let h=base.apply(this,arguments);try{const w=W_(),m=me();if(!g||g.contract||!h.includes('class="rsteps"'))return h;court88Sync(w);
  const K=wants88Known(g);const step=MGR.recStep||recStepNow(g,m);
  /* ranges even before scouting (144 had folded them to one line) */
  if(!g.scout){const i=h.indexOf('<div class="scoutsee rat85">');const c=i>=0?cutDiv(h,i):null;if(c)h=h.slice(0,i)+`<div class="scoutsee rat85 rg88">${ratingsHTML(g)}</div>`+h.slice(i+c[0].length)}
  const chips=K.length?K.map(k=>{const [,ic,n]=want88Def(k);const ok=want88Fits(g,m,k,null);return `<span class="want88 ${ok?'ok':''}" data-want88k="${k}" title="${esc(ok?_T('Your house answers this now'):want88How(g,k))}">${ic} ${esc(n)}${ok?' ✓':''}</span>`}).join(''):
    `<span class="rc-sub">${wants88(g).length>1?_T('2 wishes'):_T('a wish')} ${_T`— watch them train or scout to learn`}</span>`;
  const bid=g.court88&&g.court88.bid,R=bid&&bid.mid&&!bid.ans?mgrById(bid.mid):null;
  const top=`<div class="want88row"><b>${_T`🎯 Wants`}</b> ${chips} ${court88Chip(g,w)}</div>${R?`<div class="bid88 card2">${court88Body(w,g,R)}</div>`:''}`;
  h=h.replace('<div class="rsteps">',top+'<div class="rsteps">');
  if(step===2&&K.length){const sent=g.wantWk88===wkKey74();
    const pb=K.map(k=>{const [,ic,n]=want88Def(k);return `<button class="btn tksm" type="button" data-want88="${k}|${g.id}" ${sent?dis88(_T('Once a recruit a week')):''}>${_T`🎯 Speak to it: ${ic} ${esc(n)}<small>free · +${want88PitchGain(g,m,k)} interest</small>`}</button>`}).join('');
    h=h.replace('<div class="rpane">',`<div class="rpane"><div class="acts want88p">${pb}</div>`)}
  if(step===3&&K.includes('rudis'))h=h.replace('<div id="ofMeter"',`<label class="rudis88" style="font-size:12px" title="${esc(sx(g,_T('He wants a path to the rudis — his freedom. Promising it adds interest now and notes the promise on his record.'),_T('She wants a path to the rudis — her freedom. Promising it adds interest now and notes the promise on her record.')))}"><input type="checkbox" id="ofRudis88"> ${_T`🗡 Promise the rudis path (+${WANT88.gain})`}</label><div id="ofMeter"`);
  }catch(e){console.error(e)}return h}}

(()=>{const st=document.createElement('style');st.textContent=`
.imm88m{box-shadow:0 0 0 2px #d4af37,0 0 0 4px #1a1206,0 0 0 5px #f0d27a,0 0 10px rgba(240,200,90,.35)!important;border-color:#d4af37!important}
div.imm88m,.dcard.imm88m{position:relative}
.imm88lf{position:absolute;top:3px;font-style:normal;font-size:17px;line-height:1;color:#f0d27a;text-shadow:0 0 3px #000,0 1px 0 #6a4a10;z-index:3;pointer-events:none}
.imm88lf.l{left:12px;transform:rotate(-25deg)}.imm88lf.r{right:12px;transform:scaleX(-1) rotate(-25deg)}
tr.imm88m>td{background:linear-gradient(90deg,rgba(212,175,55,.16),rgba(212,175,55,.04))}tr.imm88m{box-shadow:none!important;outline:2px double #d4af37;outline-offset:-2px}
.imm88lt{font-style:normal;color:#f0d27a;margin-right:4px;text-shadow:0 0 3px #000}
.imm88chip{display:inline-block;font:600 11px var(--ui,inherit);color:#1a1206;background:linear-gradient(180deg,#f6dc8a,#c9962b);border-radius:9px;padding:1px 7px;vertical-align:middle;letter-spacing:.02em}
.fear88{font-size:10.5px;color:#d9b38c;border:1px solid rgba(217,179,140,.4);border-radius:8px;padding:0 5px;white-space:nowrap}
.cd88{display:inline-block;font-size:10.5px;line-height:1.3;color:#e8c98a;border:1px solid rgba(232,201,138,.45);border-radius:8px;padding:0 5px;margin:2px 0;white-space:nowrap}
.cd88.now{color:#ffd9a0;border-color:#e0883a;background:rgba(224,136,58,.16)}
.cd88.t{margin:0 0 0 3px;padding:0 3px;font-size:9.5px;line-height:1.25;vertical-align:middle}
.want88row{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:6px 0;font-size:12.5px}
.want88,.want88c{display:inline-block;border:1px solid var(--line2);border-radius:9px;padding:1px 7px;font-size:11.5px;color:var(--bone,#e8dcc0);background:rgba(255,255,255,.03)}
.want88.ok,.want88c.ok{border-color:#7fb27a;color:#cfe8c8}.want88c i{font-style:normal;color:var(--muted)}.want88c b{color:#9fd49a}
.want88m{margin-top:4px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;font-size:12px}.want88p{margin-bottom:6px}
.rng88n{white-space:nowrap}.bid88{margin:6px 0;padding:6px 8px;border-color:#e0883a}.bid88 p{margin:0 0 4px;font-size:12.5px}.rudis88{display:block;margin:4px 0}
`;document.head.appendChild(st)})();
