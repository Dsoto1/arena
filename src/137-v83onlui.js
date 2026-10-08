/* =====================================================================
   137-V83ONLUI · ONLINE v0.83, the client screens (contract tools/plans/onl83-contract.md, protocol 6; hooks in 133-v83onl)
   =====================================================================
   RANK BAR • the Domus rank bar holds all 8 ranks (Tiro → Invictus), taller; its tokens open the house profile.
   GEAR LEVELS • every gear list reads pieces through ONL83.piece / kitPieces (item ids 'key', 'key#uid' broken or with a history,
     'nw#uid' named): My Gladiators' Bring ticks and the Storeroom (rewritten: onlStoreHTML82) show named pieces as named cards with a
     🔒 "Veteranus+" note below Veteranus (no Bring), broken pieces cracked + "🔧 Repair · N" (gear.repair, the treasury or a purse).
   TREASURY • the Domus record shows the Treasury beside Purses; the result toast names award − the lanista's cut (20%) = pay; the
     Storeroom's "🏛 Buy for the shelf" is paid from the treasury (domus.buy).
   MARKET BOARD • Armory & Market = his market board (assets/market_board.webp, the 106-v75 look): a row of OFFERINGS above both halves
     (rtok medallions, ONLC.PRICE_OFF; offer.buy → the active gladiator's satchel; bring ≤2 via offer.bring), weapons left, armor right,
     level 3 at the top as on the board; a "🏺 Used" tab (market.list / market.buy): broken pieces marked, ⅔ price, owner history.
   LOOT • the loot.offer push (and hello.loot) → a popup with a 90 s countdown: the fallen's pieces as cards, pick one (loot.pick) or
     "Let Flavius choose" (the most valuable, as the server's default).
   GIFTS • his chest token round (rtokHTML('chest')) on the landing and the Domus, glowing PURPLE with a count when the HOUSE holds
     unopened gifts; tap → gift.open with a reveal (the token spins, then the prize: coin, starting CF, an offering, gear, or a NAMED
     weapon card in its rarity colour with affixes, unique effect and value).
   NAMED WEAPONS • nw83Card(): the base weapon's card tinted by rarity, Latin name, affixes, unique effect, value (1500 × 1/2/4/8) —
     used in the gift reveal, Storeroom, kit (room stakes), loot and profile. The "Ludi Infames" playlist (Veteranus+, rooms with inf).
   COUNTDOWN • the pre-match room after the host's Start: seconds left, the line-up with what is at stake per seat (ONL83.stakes: gear,
     offerings, rank), host ✕ Hold (lobby.hold); a stopped countdown says so.
   TROPHY ROOM • a shelf on the Domus (icon, name, date) from domus.get trophies.
   PROFILE + ★ FOLLOW • any house name (🏛 chips in rooms, the Forum, invitations, the stage, the rank bar) opens domus.profile: record,
     trophies, living gladiators, recent matches, ★ Follow (domus.follow), 🔗 copy the share link (#domus=<id>; a page opened with that
     hash opens Online on the profile). "★ Followed houses" on the landing (hello.follows) with Invite / Join / Watch.
   WAGERS • a rail tab "💰 Wagers" (wager.list): open pots with odds, my last 30 bets, the week's best bettors.
   HOUSE GIFTS + SHELF OFFERINGS (his call) • gifts belong to the DOMUS (domus.get gifts / hello domus.gifts); the shelf holds offerings
     (domus.get offers) moved with offer.move. MOCK: gift.open from the house, settlements move gifts onto the house and a Ranked death's
     un-brought satchel onto the shelf, offer.move.
   🧪 TESTERS • hello.tester (server: the deploy's TESTERS e-mails) → a folded "🧪 Tester" panel on the Domus (coin, gifts, gear, offerings,
     Glory → admin.grant). A granted house is a TEST house for good: Custom only (testHouse), out of Today / rank counts / wagers' top /
     Victor of the Day; its names wear a TEST chip. MOCK: tester flag = localStorage flavius_onltester83 '1' (the mock only).
   ===================================================================== */
const ONL83U={follows:[],tester:false,lootQ:[],lootSeen:{},mkt:'board',used:null,usedAt:0,wl:null,wlAt:0,stop:{},cdSeen:{},testDom:new Set(),testIds:new Set(),srOpen:{},giftBusy:false,infEv:'democritus'};
const c83=()=>typeof ICO!=='undefined'&&ICO.coin?ICO.coin:'🪙';
const OFF83N=k=>{const o=(typeof OFFER!=='undefined'&&OFFER[k])||{};return `${o.n||k}${o.s?' · '+o.s:''}`};
const offTok83=(k,sz)=>typeof rtokHTML==='function'?rtokHTML(k,sz||34,OFF83N(k)):'🎁';
const rk83=k=>ONLC.RANKS[ONLC.rankIdx(k)]||ONLC.RANKS[0];
const date83=t=>t?new Date(t).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'}):'';

/* =========================== THE MOCK (his call: gifts + freebies belong to the DOMUS; testers) =========================== */
const MOCK_TESTER83='flavius_onltester83';
const mockTester83=()=>{try{return localStorage.getItem(MOCK_TESTER83)==='1'}catch(e){return false}};
const mockTestDom83=(w,id)=>{const D=id&&mockDomus82(w,id);return !!(D&&D.test)};
/* the settlement: the gladiator's new gifts and a death's un-brought satchel go to the house */
{const base=mockAfter83;mockAfter83=function(w,L,M,a,i,row,out,gx){const r=base.apply(this,arguments);
  try{const ch=w.chars[L.players[i].char];const D=ch&&mockDomus82(w,ch.domus);if(D&&gx){if((gx.gifts||[]).length)ONLC.giftsIn(D,gx.gifts);if((gx.offLeft||[]).length)ONLC.offersIn(D,gx.offLeft)}}catch(e){console.error(e)}return r}}
/* a test house never shows in Today, Victor of the Day, the rank counts or the wagers' top list */
function mockDayClean83(w){const D=w.days80||{};const tn=new Set(Object.values(w.chars).filter(c=>c.test).map(c=>c.name));const bad=e=>!!e&&typeof e==='object'&&((e.dom&&mockTestDom83(w,e.dom))||(!e.dom&&e.name&&tn.has(e.name))||bad(e.w)||bad(e.l));
  for(const k of Object.keys(D)){const X=D[k];if(!X||typeof X!=='object')continue;for(const f of ['wins','fallen','upsets'])if(Array.isArray(X[f]))X[f]=X[f].filter(e=>!bad(e))}}
for(const t of ['match.result','match.abandon']){const base=MOCK_ROUTES[t];MOCK_ROUTES[t]=(w,d,me)=>{const r=base(w,d,me);try{mockDayClean83(w)}catch(e){}return r}}
mockRankCounts82=function(w){const o={};for(const R of ONLC.RANKS)o[R.k]=0;for(const c of Object.values(w.chars))if(c.alive&&!c.test)o[ONLC.rankFor(c).k]++;return o};
{const base=MOCK_ROUTES['wager.list'];MOCK_ROUTES['wager.list']=(w,d,me)=>{const r=base(w,d,me);r.top=(r.top||[]).filter(x=>!mockTestDom83(w,x.dom));return r}}
{const base=mockGroup;mockGroup=function(w,me){const g=base.apply(this,arguments);for(const x of g){const A=w.accounts[x.id];if(A&&A.dtest)x.test=1}return g}}
const TEST_GATE83=new Set(['lobby.create','lobby.quick','lobby.join','lobby.accept','lobby.sit','lobby.again']);
{const base=mockReq;mockReq=async function(t,d){const me=mockMe();
  if(me&&TEST_GATE83.has(t)&&d){const w=mockLoad();let ranked=false;if(t==='lobby.create'||t==='lobby.quick')ranked=!!d.ranked;else{const L=w.lobbies[t==='lobby.again'?(d.id||d.lobbyId):d.id];ranked=!!(L&&L.ranked)}
    if(ranked&&mockParty82(w,me).some(a=>(w.accounts[a]||{}).dtest))throw onlErr82(_T('Test houses play Custom only.'),'testHouse')}
  return base.apply(this,arguments)}}
{const base=MOCK_ROUTES['hello'];MOCK_ROUTES['hello']=(w,d,me)=>{const o=base(w,d,me);if(me&&!mockIsGuest82(me)&&mockTester83())o.tester=true;return o}}
{const base=MOCK_ROUTES['domus.get'];MOCK_ROUTES['domus.get']=(w,d,me)=>{const o=base(w,d,me);const A=w.accounts[me];const D=mockDomus82(w,A&&A.domus);o.gifts=(D&&D.gifts)||[];o.offers=(D&&D.offers)||[];return o}}
Object.assign(MOCK_ROUTES,{
  /* 🎁 a house gift, opened for the active gladiator (into the house with none); a gift still on a gladiator opens for him */
  'gift.open':(w,d,me)=>{const A=w.accounts[me];const D0=mockDomus82(w,A&&A.domus);let old=null;
    if(d.char){const c0=w.chars[d.char];if(c0&&c0.owner===me&&c0.alive&&(c0.gifts||[]).some(g=>g.id===d.gift))old=c0}
    if(!old&&!(D0&&(D0.gifts||[]).some(g=>g.id===d.gift)))throw new Error(_T('No such gift.'));
    const ch=old||onlMockChar(w,me);if(ch&&mockCharBusy82(w,ch.id))throw onlErr82(_T`${ch.name} is in a match — open it afterwards.`,'in_match');
    const cat=onlCatalog();const rw=ONLC.rollGift(Math.random,cat,ch?ONLC.rankFor(ch).k:'tiro');let P=null;
    if(rw.k==='named'){w.chest83=w.chest83||[];w.uniq83=w.uniq83||[];if(false&&w.chest83.length&&Math.random()<0.5){const x=w.chest83.splice(Math.floor(Math.random()*w.chest83.length),1)[0];P={item:x.item,pc:x.pc}}
      else{let def=ONLC.rollNamed(Math.random,cat,rw.rar,w.uniq83);if(def&&def.uq){if(w.uniq83.includes(def.uq))def=ONLC.rollNamed(Math.random,cat,'epic',[]);else w.uniq83.push(def.uq)}if(def)P=ONLC.namedPiece(def,ch||D0)}
      if(!P){rw.k='coin';rw.v=50}}
    ONLC.giftTake(old||D0,d.gift);let res,D2=null;
    if(ch){if(P&&!ONLC.canWearNamed(ch)){D2=mockDomus82(w,ch.domus)||D0;ONLC.putPiece(D2,P,false);res={to:'house'}}else res=ONLC.applyGift(ch,null,rw,P)}
    else{D2=D0;res=ONLC.applyGiftHouse(D0,rw,P)}
    const piece=P?ONLC.pieceInfo(P,cat):rw.k==='gear'?(ch?ONLC.pieceOf(ch,rw.item,cat):ONLC.pieceInfo({item:rw.item,pc:null},cat)):null;const D=D2||D0;
    return {reward:{...rw,...(piece?{piece}:{}),...(res.coin?{coin:res.coin}:{}),...(res.sold?{sold:true}:{})},to:res.to,char:ch||null,...(D?{domus:mockDRow82(D),gear:D.gear||[],pcs:D.pcs||{},gifts:D.gifts||[]}:{})}},
  /* 🧪 one offering between the house shelf and a satchel */
  'offer.move':(w,d,me)=>{const A=w.accounts[me];const D=mockDomus82(w,A&&A.domus);if(!D)throw onlErr82(_T('Name your house first.'),'need_domus');const k=String(d.key||'');
    const side=x=>{if(x==='house')return D;const ch=mockOwn83(w,me,x);if(ch.domus!==D.id)throw new Error(_T('Not of your house.'));if(mockCharBusy82(w,ch.id))throw onlErr82(_T`${ch.name} is in a match — the satchel waits.`,'in_match');return ch};
    if(d.from===d.to)throw new Error(_T('Pick where it goes.'));const src=side(d.from),dst=side(d.to);ONLC.offerMove(src,dst,k);const out=x=>x===D?{house:true,offers:D.offers||[]}:x;return {from:out(src),to:out(dst),domus:mockDRow82(D)}},
  /* 🧪 tester grants (the mock's tester flag: localStorage flavius_onltester83) */
  'admin.grant':(w,d,me)=>{if(!mockTester83()||mockIsGuest82(me))throw onlErr82(_T('Only testers may do that.'),'notTester');const A=w.accounts[me];const D=mockDomus82(w,A&&A.domus);if(!D)throw onlErr82(_T('Name your house first.'),'need_domus');
    const ch=onlMockChar(w,me);if(ch&&mockCharBusy82(w,ch.id))throw onlErr82(_T`${ch.name} is in a match — grant afterwards.`,'in_match');const cat=onlCatalog();
    const coin=Math.max(0,Math.min(100000,d.coin|0)),gifts=Math.max(0,Math.min(10,d.gift|0)),glory=Math.max(0,Math.min(10000,+d.glory||0));
    const gear=(Array.isArray(d.gear)?d.gear:[]).map(String).filter(k=>cat[k]).slice(0,10),offs=(Array.isArray(d.offering)?d.offering:[]).map(String).filter(k=>ONLC.OFFERS83.includes(k)).slice(0,10);
    if(!coin&&!gifts&&!glory&&!gear.length&&!offs.length)throw new Error(_T('Nothing to grant.'));const t=Date.now();D.test=true;A.dtest=true;
    for(const c of Object.values(w.chars))if(c.domus===D.id&&c.alive)c.test=true;const shelf={gear:[],offs:[]};
    if(ch){ch.wallet=(ch.wallet|0)+coin;if(glory){ch.glory=Math.round((ONLC.gloryOf(ch)+glory)*100)/100;const R=ONLC.rankFor(ch);ch.rank=R.k;if(ONLC.rankIdx(R.k)>ONLC.rankIdx(ch.rankK||'tiro'))ch.rankK=R.k}
      for(const k of gear){if(!cat[k].stack&&(ch.gear||[]).some(g=>ONLC.itemBase(g)===k))shelf.gear.push(k);else ONLC.putPiece(ch,{item:k,pc:null},true)}
      for(const k of offs){if((ch.offers||[]).length>=ONLC.OFF_MAX)shelf.offs.push(k);else ch.offers=[...(ch.offers||[]),k]}}
    else{D.treasury=(D.treasury|0)+coin;shelf.gear=gear;shelf.offs=offs}
    for(let i=0;i<gifts;i++)ONLC.giftsIn(D,[{id:'test:'+t.toString(36)+':'+i,why:'test',at:t,glad:ch?ch.name:null}]);for(const k of shelf.gear)ONLC.putPiece(D,{item:k,pc:null},false);if(shelf.offs.length)ONLC.offersIn(D,shelf.offs);
    (w.admin83=w.admin83||[]).unshift({at:t,acct:me,domus:D.id,glad:ch?ch.id:null,what:{coin,gift:gifts,glory,gear,offering:offs}});
    return {domus:mockDRow82(D),char:ch||null,gifts:D.gifts||[],gear:D.gear||[],pcs:D.pcs||{},offers:D.offers||[]}}});
{const base=MOCK_ROUTES['char.create'];MOCK_ROUTES['char.create']=(w,d,me)=>{const ch=base(w,d,me);const A=w.accounts[me];if(A&&A.dtest)ch.test=true;return ch}}

/* =========================== THE CLIENT =========================== */
/* what the replies teach the screens: follows, the tester flag, loot windows, the house (gifts, shelf, test flag) */
function onl83Learn(t,r){if(!r||typeof r!=='object')return;
  if(t==='hello'){if(Array.isArray(r.follows))ONL83U.follows=r.follows;ONL83U.tester=!!r.tester;if(Array.isArray(r.loot))for(const X of r.loot)onl83LootQ(X)}
  const D=r.domus&&typeof r.domus==='object'&&!Array.isArray(r.domus)?r.domus:null;if(D&&D.test){ONL83U.testDom.add(String(D.name||''));ONL83U.testIds.add(D.id)}
  if((t==='gift.open'||t==='admin.grant'||t==='domus.buy'||t==='gear.repair'||t==='offer.move')&&D&&ONL.domus&&D.id===ONL.domus.id)ONL.domus=D;
  if(ONL82.dg&&(t==='gift.open'||t==='admin.grant'||t==='domus.buy')){for(const f of ['gear','pcs','gifts','offers'])if(r[f]!=null)ONL82.dg[f]=r[f];if(D)ONL82.dg.domus=D}
  if(ONL82.dg&&t==='gear.repair'&&r.holder&&r.holder.house){ONL82.dg.gear=r.holder.gear;ONL82.dg.pcs=r.holder.pcs}
  if(ONL82.dg&&t==='offer.move'){for(const s of [r.from,r.to])if(s&&s.house)ONL82.dg.offers=s.offers}
  if(t==='domus.profile'&&r.domus&&r.domus.test){ONL83U.testDom.add(r.domus.name);ONL83U.testIds.add(r.domus.id)}
  for(const L of [r.lobby,r].concat(t==='lobby.list'&&Array.isArray(r)?r:[]))if(L&&Array.isArray(L.players))for(const p of L.players)if(p&&p.test&&p.domus)ONL83U.testDom.add(p.domus)}
{const base=NET.req;NET.req=function(t,d){const p=base.apply(this,arguments);if(p&&typeof p.then==='function'&&!/^match\./.test(t))p.then(r=>{try{onl83Learn(t,r)}catch(e){}}).catch(()=>{});return p}}
{const base=NET.emit;NET.emit=function(t,d){try{if(t==='lobby.update')onl83CdWatch(d)}catch(e){}return base.apply(this,arguments)}}
/* the char put back after a reply (127's helper) */
const onl83Put=c=>{if(c&&c.id&&typeof onlCharPut82==='function')onlCharPut82(c)};
const onl83Holder=x=>x==='house'?{house:true,gear:(ONL82.dg&&ONL82.dg.gear)||[],pcs:(ONL82.dg&&ONL82.dg.pcs)||{},offers:(ONL82.dg&&ONL82.dg.offers)||[]}:(ONL.chars||[]).map(c=>ONL.char&&c.id===ONL.char.id?ONL.char:c).find(c=>c.id===x)||null;
const onl83Live=()=>(ONL.chars||[]).map(c=>ONL.char&&c.id===ONL.char.id?ONL.char:c).filter(c=>c.alive).sort((a,b)=>(a.born||0)-(b.born||0));

/* ---------------- a popup over the Online window (never a modal(): the window stays) ---------------- */
function onl83Pop(cls,inner,o){for(const x of document.querySelectorAll('.'+cls))x.remove();const bg=document.createElement('div');bg.className='veraskbg onl80pop pop83 '+cls;
  bg.innerHTML=`<div class="card2 verask pop83box" role="dialog" aria-modal="true">${inner}</div>`;if(!(o&&o.sticky))bg.addEventListener('click',e=>{if(e.target===bg)bg.remove()});document.body.appendChild(bg);return bg}

/* ---------------- NAMED WEAPONS: the card ---------------- */
function nw83Card(I,o){o=o||{};const w=I.w||{};const R=ONLC.rarOf(I.rar||w.rar);const col=ONL83.rarCol[R.k];const U=w.uq?ONLC.UNIQUES.find(u=>u.k===w.uq):null;const base=w.base||'';const bw=(typeof W!=='undefined'&&W[base])||{};
  const art=typeof cardHTML==='function'&&bw.n?cardHTML('w:'+base,'sm'):'⚔';const brk=I.st==='broken';
  return `<div class="nw83 r-${R.k} ${brk?'brk83':''} ${o.sm?'sm':''}" style="--rc:${col}" title="${esc2(w.n||I.n)} · ${R.n}">
    <div class="nw83-art">${art}<i class="nw83-tint"></i><span class="nw83-gem">${R.n}</span></div>
    <div class="nw83-b">${_T`<b class="nw83-n">${esc2(w.n||I.n)}</b>${base?_T`<small class="nw83-base">${esc2(bw.n||base)} · power ${w.p!=null?w.p:'—'} · range ${w.r!=null?w.r:'—'}</small>`:''}
     ${(w.aff||[]).length?`<div class="nw83-aff">${w.aff.map(a=>`<span>✦ ${esc2((ONLC.AFFIX[a]||{}).n||a)}</span>`).join('')}</div>`:''}
     ${U?`<p class="nw83-uq"><b>${esc2(U.n)}</b> — ${esc2(U.d)}</p>`:''}
     <small class="nw83-val">${brk?_T('💔 Broken · '):''}Value ${c83()} <b>${ONLC.valueOf(I)}</b></small>${o.hist?onl83Hist(I.hist):''}`}</div></div>`}
/* the owner history of a piece (who held it, how it left) */
function onl83Hist(h){if(!(h||[]).length)return '';return `<div class="hist83">${h.slice(-4).map(x=>`<small>${x.how==='taken'?_T('⚔ taken from'):_T('🪦 fell with')} <b>${esc2(x.glad||'?')}</b>${x.house?` · ${esc2(onlHouse82(x.house))}`:''} · ${esc2(date83(x.when))}</small>`).join('')}</div>`}
const histTip83=h=>(h||[]).map(x=>`${x.how==='taken'?_T('taken from'):_T('fell with')} ${x.glad||'?'}${x.house?' ('+onlHouse82(x.house)+')':''} ${date83(x.when)}`).join(' · ');
/* a piece as a small card (printed or named) */
function onl83PieceCard(I,o){o=o||{};if(!I)return '';if(I.named)return nw83Card(I,{sm:1,hist:o.hist});const art=typeof cardHTML==='function'?cardHTML((I.kind==='w'?'w:':'a:')+I.base,'sm'):'';
  return `<div class="pc83 ${I.st==='broken'?'brk83':''}" ${(I.hist||[]).length?`title="${esc2(histTip83(I.hist))}"`:''}><div class="pc83-art">${art}</div>${_T`<b>${esc2(I.n)}</b><small>Level ${I.lv}${I.kind==='a'?_T` · ${I.ap|0} AP`:''} · ${c83()} ${ONLC.valueOf(I)}</small>${I.st==='broken'?_T('<small class="brk83t">💔 Broken</small>'):''}${o.hist?onl83Hist(I.hist):''}`}</div>`}

/* ---------------- 1 · the RANK BAR: eight ranks, taller; tokens open the profile ---------------- */
{const base=onlRankBar82;onlRankBar82=function(){const h=base.apply(this,arguments);return h.replace('<aside class="rb82"',_T('<aside class="rb82 rb83"')).replace(/<span class="rb82-tok /g,_T('<span data-onl83="myprof" class="rb82-tok '))}}

/* ---------------- 2 · My Gladiators: Bring ticks through the pieces (named 🔒 below Veteranus, broken) ---------------- */
{const base=onlCharHTML;onlCharHTML=function(){let h=base.apply(this,arguments);try{const live=onl83Live();const sel=live.find(c=>c.id===ONL.gsel)||ONL.char;if(!sel)return h;const D=ONL.ged&&ONL.ged.id===sel.id?ONL.ged:null;
    h=h.replace(/<label class="chk"><input type="checkbox" data-onlgeq="(\d+)"[^>]*>[\s\S]*?<\/label>/g,(m,i)=>{const it=(sel.gear||[])[+i];if(it==null)return m;const I=ONL83.piece(sel,it);if(!I)return m;const why=ONLC.wearWhy(sel,it);
      if(why&&D)D.on[+i]=false;const on=D?D.on[+i]:ONLC.equipOf(sel).includes(it);
      const tag=I.named?`<span class="rar83" style="--rc:${ONL83.rarCol[I.rar]}">${esc2(ONLC.rarOf(I.rar).n)}</span>`:'';
      return `<label class="chk ${why?'no83':''}" ${why?`title="${esc2(why)}"`:''}><input type="checkbox" data-onlgeq="${i}" ${on&&!why?'checked':''} ${why?'disabled':''}> ${I.named?`<b style="color:${ONL83.rarCol[I.rar]}">${esc2(I.n)}</b>`:esc2(I.n)} <small class="rc-sub">L${I.lv}</small>${tag}${I.st==='broken'?' <small class="brk83t">💔 broken</small>':''}${I.named&&!ONLC.canWearNamed(sel)?_T(' <small class="lk83">🔒 Veteranus+</small>'):''}</label>`})}catch(e){console.error(e)}return h}}

/* ---------------- 3 · the DOMUS: treasury, gifts chest, trophy shelf, tester panel ---------------- */
function onl83GiftN(){const D=ONL.domus||{};const own=onl83Live().reduce((a,c)=>a+((c.gifts||[]).length),0);const dg=ONL82.dg&&ONL82.dg.gifts;return Math.max(D.gifts|0,Array.isArray(dg)?dg.length:0)+own}
function onl83Chest(sz,where){if(!ONL.acct||onlIsGuest82()||ONL.needDomus)return '';const n=onl83GiftN();
  return `<button type="button" class="gift83 ${n?'on':''} ${where||''}" data-onl83="gift" title="${n?_T`Donativum · ${n} unopened`:_T('Flavius sends a Donativum at every new rank and every 5 Ranked bouts survived')}">${typeof rtokHTML==='function'?rtokHTML('chest',sz,''):'🎁'}${n?`<b class="gift83n">${n}</b>`:''}<small>${n?_T('Open'):_T('Donativum')}</small></button>`}
const TROPHY_IC83=k=>{const [a,b]=String(k).split(':');if(a==='first')return '🏆';if(a==='rank')return rk83(b).ic;if(a==='slew')return b==='commodus'?'👑':b==='tholo'?'🦁':'💀';return {surv10:'🛡',surv25:'🛡',thumb:'👍',vday:'☀'}[a]||'🏅'};
function onl83Trophies(list,empty){const T=(list||[]).slice().sort((a,b)=>(b.at||0)-(a.at||0));
  return `<div class="tr83"><div class="tr83-h">${_T`🏛 Trophy room <small class="rc-sub">${T.length}</small>`}</div>${T.length?`<div class="tr83-shelf">${T.map(t=>`<div class="tr83-t" title="${esc2(t.n||ONLC.trophyName(t.k))}${t.glad?' · '+esc2(t.glad):''}"><span class="tr83-ic">${TROPHY_IC83(t.k)}${(t.x|0)>1?`<i>×${t.x}</i>`:''}</span><b>${esc2(t.n||ONLC.trophyName(t.k))}</b><small>${esc2(date83(t.at))}${t.glad?' · '+esc2(t.glad):''}</small></div>`).join('')}</div>`:`<p class="rc-sub tr83-none">${empty||_T('No trophies yet — first Ranked wins, ranks reached, Commodus or Tholo slain.')}</p>`}</div>`}
function onl83Tester(){if(!ONL83U.tester)return '';const cat=onlCatalog();const opts=Object.entries(cat).sort((a,b)=>a[1].kind.localeCompare(b[1].kind)||a[1].lv-b[1].lv||a[1].n.localeCompare(b[1].n)).map(([k,it])=>`<option value="${k}">${it.kind==='w'?'⚔':'🛡'} L${it.lv} ${esc2(it.n)}</option>`).join('');
  return `<details class="tst83" ${ONL83U.tstOpen?'open':''}><summary>${_T`🧪 Tester <small class="rc-sub">grants make this a TEST house for good — Custom only, out of Today and the ranks</small>`}</summary>
    <div class="tst83-g"><label>${_T`Coin`}<input class="tin" type="number" min="0" max="100000" id="tst83coin" value="0"></label><label>${_T`Donativa`}<input class="tin" type="number" min="0" max="10" id="tst83gift" value="0"></label>
     <label>${_T`Glory`}<input class="tin" type="number" min="0" max="10000" id="tst83glory" value="0"></label><label>${_T`Gear`}<select class="tin" id="tst83gear"><option value="">—</option>${opts}</select></label>
     <label>${_T`Offering`}<select class="tin" id="tst83off"><option value="">—</option>${ONLC.OFFERS83.map(k=>`<option value="${k}">${esc2(OFF83N(k))}</option>`).join('')}</select></label></div>
    <div class="acts"><button type="button" class="btn primary tksm" data-onl83="grant">${_T`🧪 Grant`}</button></div></details>`}
{const base=onlDomusHTML82;onlDomusHTML82=function(){let h=base.apply(this,arguments);try{const D=ONL.domus||{};const G=ONL82.dg||{};
    h=h.replace('<small>Purses</small></div>',`${_T`<small>Purses</small>`}</div><div class="tre83">${_T`<b>${c83()} ${D.treasury|0}</b><small>Treasury</small>`}</div>`);
    h=h.replace(/(<div class="dom82-ttl">[\s\S]*?<\/small><\/div>)(<\/div>)/,(m,a,b)=>a+onl83Chest(44,'dom')+b);
    if(D.test)h=h.replace(/(<div class="dom82-ttl"><h3>[\s\S]*?)(<\/h3>)/,'$1 <i class="test83">TEST</i>$2');
    h=h.replace(/(<div class="dom82-rec">[\s\S]*?<\/div><\/div>)/,`$1${onl83Trophies(G.trophies)}`);
    h=h.replace(/<\/div>$/,`${onl83Tester()}</div>`)}catch(e){console.error(e)}return h}}

/* ---------------- the Storeroom, rewritten (pieces, named, broken + repair, shelf buys, offerings) ---------------- */
onlStoreHTML82=function(){if(!ONL.acct||onlIsGuest82())return '';const cat=onlCatalog();const live=onl83Live();const busy=onlBusy82();const sel=ONL82.srSel||'all';const T=(ONL.domus||{}).treasury|0;
  const house={house:true,name:onlHouse82(onlMyDomus82()||_T('the house')),...onl83Holder('house')};const rows=[];
  for(const c of live){const eq=ONLC.equipOf(c).slice();for(const k of c.gear||[]){const i=eq.indexOf(k);const on=i>=0;if(on)eq.splice(i,1);rows.push({k,o:c,on,I:ONL83.piece(c,k)})}}
  for(const k of house.gear)rows.push({k,o:house,on:false,I:ONL83.piece(house,k)});
  const shown=rows.filter(r=>r.I&&(sel==='all'||(sel==='house'?r.o.house:r.o.id===sel)));
  const chip=(v,l,n)=>`<button type="button" class="sr82-chip ${sel===v?'on':''}" data-onl82="srsel" data-v="${esc2(v)}">${l} <small>${n}</small></button>`;
  const dest=r=>[...live.filter(c=>c!==r.o).map(c=>{const why=busy.has(c.id)?_T('in a match'):ONLC.gearMoveWhy(r.o,c,r.k,cat);return `<option value="${esc2(c.id)}" ${why?'disabled':''}>→ ${esc2(c.name)}${why?` (${esc2(why.replace(/\.$/,''))})`:''}</option>`}),r.o.house?'':`<option value="house">${_T`→ the shelf`}</option>`].join('');
  const row=r=>{const I=r.I;const lock=!r.o.house&&busy.has(r.o.id);const from=r.o.house?'house':r.o.id;const why=r.o.house?'':ONLC.wearWhy(r.o,r.k);const brk=I.st==='broken';const named=I.named;
    const art=named?`<div class="sr83-nw" style="--rc:${ONL83.rarCol[I.rar]}">${typeof cardHTML==='function'&&(I.kind==='a'?ARM[I.w.base]:W[I.w.base])?cardHTML((I.kind==='a'?'a:':'w:')+I.w.base,'sm'):(I.kind==='a'?'🛡':'⚔')}<i class="nw83-tint"></i></div>`:(typeof cardHTML==='function'?cardHTML((I.kind==='w'?'w:':'a:')+I.base,'sm'):'');
    return `<div class="sr82-it sr83 ${lock?'lock':''} ${brk?'brk83':''} ${named?'named83':''}" data-sr82="${esc2(r.k)}" ${named?_T`style="--rc:${ONL83.rarCol[I.rar]}"`:''} ${(I.hist||[]).length?`title="${esc2(histTip83(I.hist))}"`:''}><div class="sr82-art">${art}</div>
      <div class="sr82-b"><b ${named?_T`style="color:${ONL83.rarCol[I.rar]}"`:''}>${esc2(I.n)}</b>${_T`<small>${named?`${esc2(ONLC.rarOf(I.rar).n)} · `:''}Level ${I.lv}${I.kind==='a'?_T` · ${I.ap|0} AP`:''} · ${c83()} ${ONLC.valueOf(I)}</small>
      <small class="sr82-who">${r.o.house?_T('🗄 on the shelf'):_T`with <b>${esc2(r.o.name)}</b>`}</small>${lock?_T('<small class="sr82-lk">🔒 In a match</small>'):''}${named&&!r.o.house&&!ONLC.canWearNamed(r.o)?_T('<small class="lk83">🔒 Veteranus+ to bring</small>'):''}${brk?_T('<small class="brk83t">💔 Broken — repair to bring</small>'):''}`}</div>
      <div class="sr82-c">${brk?`<button type="button" class="btn tksm rep83" data-onl83="repair" data-v="${esc2(from)}|${esc2(r.k)}" ${lock?'disabled':''}>${_T`🔧 Repair · ${ONLC.repairCost(I)}`}</button>`:''}${r.o.house?'':`<label class="chk ${why?'no83':''}" ${why?`title="${esc2(why)}"`:''}><input type="checkbox" data-sr82eq="${esc2(r.o.id)}|${esc2(r.k)}" ${r.on&&!why?'checked':''} ${lock||why?'disabled':''}> ${_T`Bring`}</label>`}
      <select class="tin" data-sr83mv="${esc2(from)}|${esc2(r.k)}" ${lock?'disabled':''}><option value="">${_T`Move…`}</option>${dest(r)}</select></div></div>`};
  /* offerings: each satchel + the shelf */
  const offs=[...live.map(c=>({o:c,id:c.id,name:c.name,list:c.offers||[],eq:ONLC.offersBrought(c)})),{o:house,id:'house',name:'🗄 Shelf',list:house.offers||[],eq:[]}];
  const offRow=x=>{const lock=x.id!=='house'&&busy.has(x.id);const eq=x.eq.slice();
    return `<div class="of83-row"><b>${esc2(x.name)}</b>${x.id!=='house'?_T`<small class="rc-sub">holds ${x.list.length}/${ONLC.OFF_MAX}</small>`:''}<div class="of83-toks">${x.list.map(k=>{const j=eq.indexOf(k);const br=j>=0;if(br)eq.splice(j,1);
      const dests=offs.filter(y=>y.id!==x.id).map(y=>`<option value="${esc2(y.id)}" ${y.id!=='house'&&busy.has(y.id)?'disabled':''}>→ ${esc2(y.name)}</option>`).join('');
      return `<span class="of83 ${br?'br':''}" title="${esc2(OFF83N(k))}${br?_T(' · brought into the next match'):''}">${offTok83(k,30)}<select class="tin" data-of83mv="${esc2(x.id)}|${k}" ${lock?'disabled':''} aria-label="${_T`Move`}"><option value="">⇄</option>${dests}</select></span>`}).join('')||'<small class="rc-sub">empty</small>'}</div></div>`};
  const buyable=Object.entries(cat).sort((a,b)=>a[1].kind.localeCompare(b[1].kind)||a[1].lv-b[1].lv||a[1].n.localeCompare(b[1].n));
  const shop=`<details class="buy83" ${ONL83U.srOpen.buy?'open':''} data-d83="buy"><summary>${_T`🏛 Buy for the shelf <small class="rc-sub">paid from the treasury · ${c83()} ${T}</small>`}</summary>
    <div class="buy83-g"><select class="tin" id="buy83sel">${buyable.map(([k,it])=>{const p=ONLC.priceOf(it);return `<option value="${k}" ${p>T?'disabled':''}>${it.kind==='w'?'⚔':'🛡'} L${it.lv} ${esc2(it.n)} · ${p}</option>`}).join('')}</select><button type="button" class="btn tksm primary" data-onl83="dbuy">${_T`Buy`}</button></div>
    ${_T`<small class="rc-sub">The shelf outlives every gladiator; move pieces to whoever needs them.</small>`}</details>`;
  return `<div class="sr82" id="sr82"><div class="onl-lbtop"><h3>${_T`🗄 Storeroom`} <span class="rc-sub">${_T`${rows.length} piece${rows.length===1?'':'s'} · tick to bring · move between your gladiators`}</span></h3></div>
   <div class="sr82-chips">${chip('all',_T('All'),rows.length)}${live.map(c=>chip(c.id,`${busy.has(c.id)?'🔒 ':''}${esc2(c.name)}`,rows.filter(r=>r.o===c).length)).join('')}${chip('house',_T('🗄 Shelf'),house.gear.length)}</div>
   <div class="sr82-grid">${shown.map(row).join('')||`<p class="rc-sub">${_T`Nothing here yet — the Armory sells to your gladiators.`}</p>`}</div>${shop}
   <div class="of83-box"><div class="tr83-h">${_T`🧪 Offerings <small class="rc-sub">he carries at most ${ONLC.OFF_MAX} · all he holds goes into a match · the unused come back</small>`}</div>${offs.map(offRow).join('')}</div></div>`};
document.addEventListener('toggle',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.d83)ONL83U.srOpen[t.dataset.d83]=t.open;if(t&&t.classList&&t.classList.contains('tst83'))ONL83U.tstOpen=t.open},true);
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset)return;
  if(t.dataset.sr83mv&&t.value){const [from,item]=t.dataset.sr83mv.split('|');const to=t.value;e.stopPropagation();const I=ONL83.piece(onl83Holder(from)||{},item);
    return onlDo(async()=>{const r=await NET.req('domus.move',{item,from,to});await onlStoreAfter82(r);const nm=to==='house'?_T('the shelf'):((ONL.chars||[]).find(c=>c.id===to)||{}).name;onlToast80(`🗄 ${esc2((I&&I.n)||item)} → ${esc2(nm||'')}`)})}
  if(t.dataset.of83mv&&t.value){const [from,key]=t.dataset.of83mv.split('|');const to=t.value;e.stopPropagation();
    return onlDo(async()=>{const r=await NET.req('offer.move',{key,from,to});for(const s of [r.from,r.to])if(s&&s.cls)onl83Put(s);onlToast80(_T`🧪 ${esc2(OFF83N(key))} moved.`)})}},true);

/* ---------------- 5 · repair: the treasury or a purse ---------------- */
function onl83Repair(from,item){const H=onl83Holder(from);const I=H&&ONL83.piece(H,item);if(!I)return;const cost=ONLC.repairCost(I);const T=(ONL.domus||{}).treasury|0;const live=onl83Live();
  const pays=[{v:'treasury',l:_T`🏛 The treasury`,have:T},...live.map(c=>({v:c.id,l:_T`${esc2(c.name)}’s purse`,have:c.wallet|0}))];
  const bg=onl83Pop('rep83pop',`<h3 class="pop83h">${_T`🔧 Repair ${esc2(I.n)}`}</h3><div class="rep83-card">${onl83PieceCard(I)}</div><p>${_T`A third of its value: <b>${c83()} ${cost}</b>. Who pays?`}</p>
    <div class="rep83-pay">${pays.map(p=>`<button type="button" class="btn ${p.have>=cost?'primary':''}" data-rep83="${esc2(p.v)}" ${p.have<cost?'disabled':''}>${p.l} <small>${c83()} ${p.have}</small></button>`).join('')}</div>
    <div class="acts"><button type="button" class="btn" data-rep83="x">${_T`Not now`}</button></div>`);
  bg.addEventListener('click',e=>{const b=e.target.closest('[data-rep83]');if(!b)return;const v=b.dataset.rep83;bg.remove();if(v==='x')return;
    onlDo(async()=>{const r=await NET.req('gear.repair',{holder:from,item,pay:v});if(r.holder&&r.holder.cls)onl83Put(r.holder);if(r.payer)onl83Put(r.payer);ONL82.dgAt=0;onlToast80(_T`🔧 ${esc2(I.n)} is whole again (${coinAmt87(r.cost)}).`)})})}

/* ---------------- 4 · the MARKET BOARD (offerings row, weapons | armor by level) + the USED market ---------------- */
function onl83Board(ch){const cat=onlCatalog();const lv=[3,2,1];const coin=c83();
  const tile=(k,it)=>{const why=ONLC.canBuy(ch,k,cat);const own=false,nOwn=(ch.gear||[]).filter(g=>ONLC.itemBase(g)===k).length+((typeof ONL82!=='undefined'&&ONL82.dg&&ONL82.dg.gear)||[]).filter(g=>ONLC.itemBase(g)===k).length;const pr=ONLC.priceOf(it);
    return `<button type="button" class="mb83-it ${why&&!own?'no':''} ${own?'own':''}" data-onl82="buy" data-v="${k}" ${why||own?'disabled':''} title="${_T`${esc2(it.n)} · level ${it.lv}${it.kind==='a'?_T` · ${it.ap|0} AP`:''}${why?' — '+esc2(why):''}`}">${typeof cardHTML==='function'?cardHTML((it.kind==='w'?'w:':'a:')+k,'sm'):''}<b>${esc2(it.n)}</b><small>${coin} ${pr}${nOwn?` · <i class="own91">${_T`owned ×${nOwn}`}</i>`:''}</small></button>`};
  const side=kind=>lv.map(l=>{const items=Object.entries(cat).filter(([k,it])=>it.kind===kind&&it.lv===l).sort((a,b)=>ONLC.priceOf(a[1])-ONLC.priceOf(b[1])||a[1].n.localeCompare(b[1].n));
    return `<div class="mb83-row"><span class="mb83-lv">${'I'.repeat(l)}</span><div class="mb83-items">${items.map(([k,it])=>tile(k,it)).join('')}</div></div>`}).join('');
  const sat=ch.offers||[];const full=sat.length>=ONLC.OFF_MAX;
  const offers=ONLC.OFFERS83.slice().sort((a,b)=>ONLC.PRICE_OFF[a]-ONLC.PRICE_OFF[b]).map(k=>{const why=ONLC.offerBuyWhy(ch,k);
    return `<button type="button" class="mb83-of" data-onl83="obuy" data-v="${k}" ${why?_T`disabled title="${esc2(why)}"`:`title="${esc2(OFF83N(k))}"`}>${offTok83(k,42)}<small>${esc2(OFF83N(k))}</small><b>${coin} ${ONLC.PRICE_OFF[k]}</b></button>`}).join('');
  return `<div class="mb83"><div class="mb83-offs"><div class="mb83-h">${_T`🧪 Offerings <small>${sat.length}/${ONLC.OFF_MAX} on ${esc2(ch.name)}${full?' — full':''}</small>`}</div><div class="mb83-ofrow">${offers}</div></div>
    <div class="mb83-halves"><div class="mb83-half w"><div class="mb83-h">${_T`⚔ Weapons`}</div>${side('w')}</div><div class="mb83-half a"><div class="mb83-h">${_T`🛡 Armor`}</div>${side('a')}</div></div></div>`}
function onl83Used(ch){if(!ONL83U.used||Date.now()-ONL83U.usedAt>15000){ONL83U.usedAt=Date.now();NET.req('market.list',{}).then(r=>{ONL83U.used=r.used||[];if(ONL.tab==='armory'&&ONL83U.mkt==='used'&&!onlFocus80())onlRedraw()}).catch(()=>{})}
  const U=ONL83U.used;if(!U)return `<p class="rc-sub">${_T`Opening the stalls…`}</p>`;if(!U.length)return `<p class="rc-sub">${_T`Nothing used for sale — the fallen’s gear comes here, with its history.`}</p>`;const cat=onlCatalog();
  return `<div class="us83">${U.map(x=>{const I=ONLC.pieceInfo({item:x.item,pc:{st:x.st,hist:x.hist}},cat)||{n:x.n,lv:x.lv,kind:x.kind,base:x.base,st:x.st,hist:x.hist,val:x.price};
    const no=(ch.wallet|0)<x.price?_T`Costs ${coinAmt87(x.price)}.`:'';
    return `<div class="us83-it ${x.st==='broken'?'brk83':''}">${onl83PieceCard({...I,st:x.st,hist:x.hist})}<div class="us83-f">${x.st==='broken'?_T`<small class="brk83t">💔 Broken · ⅔ price · repair ${ONLC.repairCost(I)}</small>`:''}
      <small class="us83-from">${x.from?_T`from <b>${esc2(x.from.glad||'?')}</b>${x.from.house?' · '+esc2(onlHouse82(x.from.house)):''}`:''}</small>${onl83Hist(x.hist)}
      <button type="button" class="btn tksm ${no?'':'primary'}" data-onl83="ubuy" data-v="${esc2(x.id)}" ${no?_T`disabled title="${esc2(no)}"`:''}>${_T`Buy · ${c83()} ${x.price}`}</button></div></div>`}).join('')}</div>`}
{const base=onlArmoryHTML;onlArmoryHTML=function(){const ch=ONL.char;if(!ch||onlIsGuest82())return base.apply(this,arguments);const R=ONLC.rankFor(ch);const t=ONL83U.mkt;
  return `<div class="onl-lbtop"><h3>${_T`🛒 Armory &amp; Market`}</h3><div class="rc-sub">${_T`${esc2(ch.name)}’s purse ${c83()} <b>${ch.wallet}</b> · ${esc2(R.n)} wears up to level ${R.mkt}${R.mkt<4?_T(' (named pieces: Veteranus+)'):''}`}</div></div>
   <div class="seg mk83seg" style="margin-bottom:8px"><button type="button" data-onl83="mkt" data-v="board" class="${t==='board'?'on':''}">${_T`🛒 Flavius’s market`}</button><button type="button" data-onl83="mkt" data-v="used" class="${t==='used'?'on':''}">${_T`🏺 Used`}</button></div>
   ${t==='used'?onl83Used(ch):onl83Board(ch)}`}}

/* ---------------- 6 · the LOOT window ---------------- */
function onl83LootQ(X){if(!X||!X.id)return;const k=X.id+'#'+X.seat;if(ONL83U.lootSeen[k])return;ONL83U.lootSeen[k]=1;ONL83U.lootQ.push(X);onl83LootNext()}
function onl83LootNext(){if(document.querySelector('.loot83pop'))return;const X=ONL83U.lootQ.shift();if(!X)return;const left=()=>Math.max(0,Math.ceil((X.until-onlNow82())/1000));
  const cat=onlCatalog();const Ps=(X.pieces||[]).map(p=>({p,I:ONLC.isNamed(p.item)?{...p,named:true,w:(p.w||{n:p.n,rar:p.rar,kind:p.kind}),val:p.val}:(ONLC.pieceInfo({item:p.item,pc:{st:p.st,hist:p.hist}},cat)||p)}));
  const best=ONLC.lootBest(X.pieces||[]);
  const bg=onl83Pop('loot83pop',`<h3 class="pop83h">${_T`⚔ The spoils of ${esc2(X.dead&&X.dead.name||_T('the fallen'))}`}</h3>
    <p class="rc-sub" style="margin:0 0 8px">${_T`${esc2(X.dead&&X.dead.domus?onlHouse82(X.dead.domus):'')} · take ONE piece; the rest goes to the market. <b class="loot83cd">⏳`} <span id="loot83s">${left()}</span> s</b></p>
    <div class="loot83-g">${Ps.map(({p,I},i)=>`<button type="button" class="loot83-it ${i===best?'best':''}" data-loot83="${esc2(p.item)}">${I.named?nw83Card(I,{sm:1}):onl83PieceCard(I)}<span class="loot83-take">${_T`Take it`}</span></button>`).join('')}</div>
    <div class="acts"><button type="button" class="btn" data-loot83="">${_T`🎲 Let Flavius choose`}</button></div>`,{sticky:1});
  const iv=setInterval(()=>{const s=document.getElementById('loot83s');if(!s||!document.body.contains(bg)){clearInterval(iv);return}s.textContent=left();if(left()<=0){clearInterval(iv);bg.remove();onl83LootNext()}},500);
  bg.addEventListener('click',e=>{const b=e.target.closest('[data-loot83]');if(!b)return;let item=b.dataset.loot83;if(!item)item=(X.pieces[best]||{}).item;clearInterval(iv);bg.remove();
    onlDo(async()=>{try{const r=await NET.req('loot.pick',{id:X.id,seat:X.seat,item});if(r.char)onl83Put(r.char);const g=r.got||{};
        onlToast80(_T`⚔ ${esc2(g.n||_T('The piece'))} is yours${r.to==='house'?_T(' — on the shelf (it waits there)'):''}.`)}
      catch(err){if(err&&err.code==='loot_done')onlToast80(_T('⚔ The pick was already made.'));else throw err}finally{setTimeout(onl83LootNext,300)}})})}
NET.on('loot.offer',d=>{if(ONL.acct&&d)onl83LootQ(d)});
NET.on('loot.done',d=>{if(d&&d.char)onl83Put(d.char)});

/* ---------------- 7 · FLAVIUS'S GIFTS: the reveal ---------------- */
const GIFT_WHY83=g=>{const [a,b]=String(g&&g.why||'').split(':');if(a==='rank')return _T`for reaching ${rk83(b).n}`;if(a==='surv')return _T`for ${b} Ranked bouts survived`;if(a==='test')return _T('a tester’s grant');return ''};
async function onl83GiftOpen(){if(ONL83U.giftBusy)return;ONL83U.giftBusy=true;try{
    let g=null;try{const r=await NET.req('domus.get',{});g=(r.gifts||[])[0]||null}catch(e){}
    let char=null;if(!g){const c=onl83Live().find(x=>(x.gifts||[]).length);if(c){g=c.gifts[0];char=c.id}}
    if(!g){onlToast80(_T('🎁 No Donativum waiting. Flavius sends one at every new rank and every 5 Ranked bouts survived.'));return}
    const who=ONL.char?esc2(ONL.char.name):esc2(onlHouse82(onlMyDomus82()||_T('the house')));
    const bg=onl83Pop('gift83pop',`<div class="gft83"><div class="gft83-tok spin">${typeof rtokHTML==='function'?rtokHTML('chest',150,''):'🎁'}</div><h3 class="pop83h">${_T`Donativum`} <span class="dnv91i" data-tip="${esc2(_T('The emperor’s gift: Flavius sends a Donativum at every new rank, every 5 Ranked bouts survived and for the weekly challenge. Everything in it is brand new.'))}">ⓘ</span></h3>${GIFT_WHY83(g)?`<p class="rc-sub">${esc2(GIFT_WHY83(g))}</p>`:''}<div class="gft83-prize" id="gft83p"></div></div>`,{sticky:1});
    const t0=Date.now();let r=null,err=null;try{r=await NET.req('gift.open',{gift:g.id,...(char?{char}:{})})}catch(e){err=e}
    await new Promise(z=>setTimeout(z,Math.max(0,1500-(Date.now()-t0))));
    const tok=bg.querySelector('.gft83-tok');if(tok){tok.classList.remove('spin');tok.classList.add('done')}
    const P=bg.querySelector('#gft83p');if(err){P.innerHTML=`<p class="onl-err">${esc2(errText92(err))}</p><div class="acts"><button type="button" class="btn" data-g83="x">${_T`Close`}</button></div>`}
    else{if(r.char&&r.char.id)onl83Put(r.char);if(r.domus)ONL.domus=r.domus;P.innerHTML=onl83Prize(r);const n=onl83GiftN();
      P.insertAdjacentHTML('beforeend',`<div class="acts">${n?`<button type="button" class="btn primary" data-g83="next">${_T`🎁 Open the next (${n})`}</button>`:''}<button type="button" class="btn" data-g83="x">${n?_T('Later'):_T('Close')}</button></div>`)}
    bg.classList.add('opened');
    bg.addEventListener('click',e=>{const b=e.target.closest('[data-g83]');if(!b)return;bg.remove();onlRedraw();if(b.dataset.g83==='next')setTimeout(onl83GiftOpen,50)})}
  finally{ONL83U.giftBusy=false}}
function onl83Prize(r){const w=r.reward||{};const to=r.to==='house';const where=to?_T('into the house'):(r.char?_T`to ${esc2(r.char.name)}`:'');
  if(w.k==='coin')return `<div class="pz83 coin"><span class="pz83-big">${c83()} +${w.v}</span><p>${to?_T('Into the treasury'):_T`Into ${esc2((r.char||{}).name||'the')}’s purse`}.</p></div>`;
  if(w.k==='cf')return w.coin?`<div class="pz83 coin"><span class="pz83-big">${c83()} +${w.coin}</span><p>${_T`A Crowd Favor blessing with no gladiator to carry it — into the treasury.`}</p></div>`
    :`<div class="pz83 cf"><span class="pz83-big">${onlW81()} +${w.v}</span><p>${_T`Starting Crowd Favor in ${esc2((r.char||{}).name||_T('your gladiator'))}’s next Ranked bout.`}</p></div>`;
  if(w.k==='off')return `<div class="pz83 off">${offTok83(w.key,96)}<b>${esc2(OFF83N(w.key))}</b><p>${w.sold?_T('The satchel was full — sold for half its price.'):to?_T('Onto the house shelf.'):_T`Into ${esc2((r.char||{}).name||'the')}’s satchel.`}</p></div>`;
  if(w.k==='gear'&&w.piece)return `<div class="pz83 gear">${onl83PieceCard(w.piece)}<p>${to?_T('Onto the house shelf.'):_T`For ${esc2((r.char||{}).name||_T('your gladiator'))} — ticked to bring.`}</p></div>`;
  if(w.k==='named'&&w.piece)return `<div class="pz83 named r-${w.piece.rar}" style="--rc:${ONL83.rarCol[w.piece.rar]}"><div class="pz83-rays"></div>${nw83Card(w.piece,{hist:1})}<p>${to?_T('It waits in the Storeroom until Veteranus.'):_T`${esc2((r.char||{}).name||'')} brings it to the sand.`}</p></div>`;
  return `<div class="pz83"><p>${where}</p></div>`}

/* ---------------- 8 · the landing: gifts chest, followed houses, Ludi Infames ---------------- */
function onl83InfCard(){const ch=ONL.char;const ok=!!ch&&ONLC.rankIdx(ONLC.rankFor(ch).k)>=ONLC.rankIdx(ONLC.INFAMES_MIN);const open=(ONL.lobbies||[]).filter(L=>L.inf&&L.status==='waiting');
  return `<div class="onl-pl pl81 inf83 ${ok?'':'locked'}" data-pl81="infames"><div class="onl-plart inf83-art">${typeof rtokHTML==='function'?rtokHTML('chest',64,''):''}<span>✦</span></div><div class="onl-plb">${_T`<b>Ludi Infames</b>`}<span class="badge inf83b">${_T`Veteranus and above`}</span>${_T`<small>Named gear is the point · ${open.length} open</small>`}
    <div class="acts">${ok?`<select class="tin tksm" data-onl83inf="ev">${ONLC.EVENTS_ALL.filter(k=>!ONLC.EVENTS_TEAM.includes(k)).map(k=>`<option value="${k}" ${ONL83U.infEv===k?'selected':''}>${esc2(onlEvName(k))}</option>`).join('')}</select><button type="button" class="btn primary tksm" data-onl83="infq" data-v="1">${_T`⚔ Ranked`}</button><button type="button" class="btn tksm" data-onl83="infq" data-v="0">${_T`Custom`}</button>`:_T('<small class="lk83">🔒 Reach Veteranus</small>')}</div></div></div>`}
function onl83Follows(){if(!ONL.acct||onlIsGuest82())return '';const F=ONL83U.follows||[];const room=onlMyLobby();const inRoom=room&&room.status==='waiting';
  const st={off:'⚫ away',free:'🟢 here',room:_T('🟡 in a room'),fight:'🔴 fighting'};
  return `<div class="card2 fl83">${_T`<b>★ Followed houses</b>${F.length?F.map(f=>`<div class="fl83-r"><button type="button" class="fl83-n" data-onl83="prof" data-v="${esc2(f.id)}">🏛 ${esc2(onlHouse82(f.name))}</button><small class="fl83-st">${st[f.st]||''}${f.glad?' · '+esc2(f.glad):''}</small>
     <span class="fl83-a">${f.st==='free'&&f.acct?`<button type="button" class="btn tksm" data-onl83="finv" data-v="${esc2(f.acct)}" ${inRoom?'':_T('disabled title="Open a room first"')}>${_T`✉ Invite`}</button>`:''}${f.st==='room'&&f.room?`<button type="button" class="btn tksm" data-onl="join" data-v="${esc2(f.room)}">${_T`Join`}</button>`:''}${f.st==='fight'&&f.match?`<button type="button" class="btn tksm" data-onl="watch" data-v="${esc2(f.match)}">${_T`👁 Watch`}</button>`:''}</span></div>`).join('')
    :'<p class="rc-sub" style="margin:4px 0 0">Tap any house name, then ★ Follow — see when they are here, in a room or fighting.</p>'}`}</div>`}
{const base=onlPlayHTML;onlPlayHTML=function(){let h=base.apply(this,arguments);try{
    h=h.replace('<div class="a81-stage">',`<div class="a81-stage">${onl83Chest(52,'stage')}`);
    h=h.replace(/(<div class="a81-week card2">[\s\S]*?<\/div>)(\s*<div class="a81-forum">)/,(m,a,b)=>`<div class="a81-week">${a.replace('<div class="a81-week card2">','<div class="card2 wk83">')}${onl83Follows()}</div>${b}`);
    h=h.replace(/(<div class="onl-pls onl-pls81">[\s\S]*)(<\/div><\/div><\/div>)$/,(m,a,b)=>a+onl83InfCard()+b)}catch(e){console.error(e)}return h}}

/* ---------------- 9 · the START COUNTDOWN in the room ---------------- */
function onl83CdWatch(d){const L=d&&(d.lobby||d);if(!L||!L.id)return;if(L.startAt)ONL83U.cdSeen[L.id]=L.startAt;
  else if((d.held||ONL83U.cdSeen[L.id])&&L.status==='waiting'){delete ONL83U.cdSeen[L.id];ONL83U.stop[L.id]=Date.now()}
  if(d.held)ONL83U.stop[L.id]=Date.now();if(L.status==='live')delete ONL83U.cdSeen[L.id]}
function onl83Stakes(L){const S83=ONL83.stakes(L);
  const cpu=Math.max(0,(L.seats|0)-S83.length);
  return `<div class="cd83-line">${S83.map(s=>{const p=L.players[s.seat]||{};const k=p.kit||{};const human=!/^bot/.test(p.id||'');
    return `<div class="cd83-s ${human?'':'cpu'}">${k.cls?onlFig(k.cls,k.look,46):''}<div class="cd83-sb"><b>${esc2(p.name||'CPU')}</b><small>${p.rank?onlRankChip(p.rank):''}${s.domus?` ${esc2(onlHouse82(s.domus))}`:''}</small>
      <div class="cd83-gear">${s.pieces.map(I=>`<span class="cd83-pc ${I.named?'nw':''}" ${I.named?_T`style="--rc:${ONL83.rarCol[I.rar]}"`:''} title="${esc2(I.n)} · ${ONLC.valueOf(I)}">${esc2(I.n)}</span>`).join('')||_T('<small class="rc-sub">recruit kit</small>')}
      ${(s.offer||[]).map(o=>`<span class="cd83-of" title="${esc2(OFF83N(o))}">${offTok83(o,18)}</span>`).join('')}${s.cfb?`<span class="cd83-pc">${cfAmt87('+'+(s.cfb))}</span>`:''}</div>
      <small class="cd83-val">${L.ranked?_T('At stake'):_T('Brought')}: ${c83()} ${s.value}</small></div></div>`}).join('')}${Array.from({length:cpu},()=>`<div class="cd83-s cpu"><span class="onl-rq">🤖</span><div class="cd83-sb">${_T`<b>CPU</b><small class="rc-sub">fills the open seat</small>`}</div></div>`).join('')}</div>`}
{const base=onlRoomHTML80;onlRoomHTML80=function(L,grey){let h=base.apply(this,arguments);try{if(!L||L.status!=='waiting'||grey)return h;const host=L.host&&L.host.id===onlMe80();
    const left=L.startAt!=null?ONL83.countLeft(L):null;let box='';
    if(left!=null){ONL83U.cdSeen[L.id]=L.startAt;box=`<div class="cd83" id="cd83" data-at="${L.startAt}"><div class="cd83-top"><span class="cd83-n" id="cd83n">${Math.max(0,Math.ceil(left/1000))}</span><div>${_T`<b>The horns sound in…</b><small class="rc-sub">${L.ranked?_T('Ranked: what each gladiator brings is at stake.'):_T('Custom: no deaths, nothing lost.')} Any change to the line-up stops it.</small>`}</div>${host?`<button type="button" class="btn" data-onl83="hold">${_T`✕ Hold`}</button>`:''}</div>${onl83Stakes(L)}</div>`}
    else if(ONL83U.stop[L.id]&&Date.now()-ONL83U.stop[L.id]<8000)box=`<div class="cd83 stop">${_T`<b>⏸ Countdown stopped</b><small class="rc-sub">${host?_T('Press ▶ Start again when you are ready.'):_T('The host will start again.')}</small>`}</div>`;
    if(box)h=h.replace('<div class="r80-body">',box+'<div class="r80-body">');
    if(left!=null)h=h.replace(/<button type="button" class="btn primary" data-onl="start"[^>]*>▶ Start<\/button>/,`<button type="button" class="btn primary" disabled>${_T`⏳ The horns are coming…`}</button>`)}catch(e){console.error(e)}return h}}
setInterval(()=>{try{const el=document.getElementById('cd83');if(!el)return;const n=document.getElementById('cd83n');const at=+el.dataset.at;const s=Math.max(0,Math.ceil((at-onlNow82())/1000));if(n&&n.textContent!==String(s))n.textContent=s;el.classList.toggle('go',s<=3)}catch(e){}},250);

/* ---------------- 11 · PROFILES + ★ FOLLOW + the share link ---------------- */
async function onl83Profile(x){if(!x)return;let r;try{r=await ONL83.profile(x)}catch(e){if(e&&e.code==='no_domus'&&typeof x==='string'&&/^House /i.test(x))return onl83Profile(x.replace(/^House /i,''));onlToast80('🏛 '+esc2(errText92(e,_T('No such house.'))));return}
  const D=r.domus||{};const nowS={off:_T('⚫ Away'),free:_T('🟢 In the arena'),room:_T('🟡 In a room'),fight:_T('🔴 Fighting now')}[(r.now||{}).st]||'';const rec=[[_T('Bouts'),D.bouts|0],[_T('Won'),D.wins|0],[_T('Survived'),D.survived|0],[_T('Fallen'),D.fallen|0],[_T('Lifetime CF'),D.lifeCF|0],[_T('Fame'),D.fame|0]];
  const glads=(r.glads||[]).map(g=>`<div class="pf83-g">${_T`${onlFig(g.cls,{token:(g.look||{}).token,color:(g.look||{}).color},70)}<b>${esc2(g.name)}</b><small>${onlRankChip(g.rank)}</small><small>✦ ${g.glory} Glory · ${g.survived} survived · ${g.wins} won</small>`}</div>`).join('')||`<p class="rc-sub">${_T`No living gladiators.`}</p>`;
  const recent=(D.recent||[]).map(m=>`<div class="pf83-m ${m.died?'died':m.won?'won':''}">${_T`<b>${m.died?'🪦':m.won?'🏆':'⚔'} ${esc2(m.glad)}</b><small>${esc2(onlEvName(m.ev))} · ${esc2(onlCityName(m.loc))} · ${m.ranked?_T('Ranked'):_T('Custom')} · ${cfAmt87(m.cf)}${m.place?` · #${m.place}`:''} · ${esc2(date83(m.at))}</small>`}</div>`).join('')||`<p class="rc-sub">${_T`No matches yet.`}</p>`;
  const bg=onl83Pop('pf83pop',`<div class="pf83"><div class="pf83-head"><div class="dom82-crest">🏛</div><div class="pf83-t"><h3>${esc2(onlHouse82(D.name))}${D.test?' <i class="test83">TEST</i>':''}</h3>${_T`<small class="rc-sub">${D.founded?'founded '+esc2(date83(D.founded))+' · ':''}best rank ${esc2(rk83(r.rank).n)} · ${esc2(nowS)}${D.archived?' · archived':''}</small>`}</div>
      <div class="pf83-act">${r.mine||onlIsGuest82()||!ONL.acct?'':`<button type="button" class="btn ${r.following?'':'primary'}" data-pf83="follow" data-v="${esc2(D.id)}" data-on="${r.following?0:1}">${r.following?_T('★ Following'):_T('☆ Follow')}</button>`}<button type="button" class="btn" data-pf83="share" data-v="${esc2(D.id)}">${_T`🔗 Share`}</button>${(r.now||{}).st==='fight'&&r.now.match?`<button type="button" class="btn" data-pf83="watch" data-v="${esc2(r.now.match)}">${_T`👁 Watch`}</button>`:''}</div></div>
    <div class="dom82-rec pf83-rec">${rec.map(([k,v])=>`<div><b>${v}</b><small>${k}</small></div>`).join('')}</div>
    <div class="pf83-sec">${_T`<b>Gladiators</b>`}<div class="pf83-gs">${glads}</div></div>${onl83Trophies(D.trophies,_T('No trophies yet.'))}
    <div class="pf83-sec">${_T`<b>Recent matches</b>${recent}`}</div><div class="acts"><button type="button" class="btn" data-pf83="x">${_T`Close`}</button></div></div>`);
  bg.addEventListener('click',async e=>{const b=e.target.closest('[data-pf83]');if(!b)return;const a=b.dataset.pf83,v=b.dataset.v;
    if(a==='x'){bg.remove();return}
    if(a==='share'){const link=ONL83.share(v);let ok=false;try{await navigator.clipboard.writeText(link);ok=true}catch(err){}if(!ok){try{const t=document.createElement('textarea');t.value=link;document.body.appendChild(t);t.select();ok=document.execCommand('copy');t.remove()}catch(err){}}
      b.textContent=ok?_T('✓ Link copied'):'🔗 '+link;ONL83U.lastShare=link;return}
    if(a==='follow'){try{const r2=await ONL83.follow(v,b.dataset.on==='1');ONL83U.follows=r2.follows||[];bg.remove();onl83Profile(v);if(document.getElementById('onl'))onlRedraw()}catch(err){onlToast80('⚠ '+esc2(errText92(err)))}return}
    if(a==='watch'){bg.remove();const L=(ONL.lobbies||[]).find(x=>x.id===v);if(L&&typeof onlWatch==='function')onlDo(()=>onlWatch(L))}})}
/* any house chip, the stage's house line, Forum / room / invitation names */
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('.dom82c,.dom82-pl,.dom82-ttl h3');if(!t||!t.closest('#onl,.onl80pop'))return;if(t.closest('.pop83'))return;e.preventDefault();e.stopPropagation();
  const own=t.matches('.dom82-ttl h3')||t.matches('.dom82-pl');if(own&&ONL.domus&&ONL.domus.id)return onl83Profile(ONL.domus.id);
  const n=String(t.textContent||'').replace(/TEST/g,'').replace(/^[\s🏛·]+/,'').trim();onl83Profile(n)},true);
/* the share link: a page opened with #domus=<id> opens Online on that profile */
(function(){const id=ONLC.domusFromHash(location.hash);if(!id)return;let n=0;const iv=setInterval(()=>{n++;if(n>120){clearInterval(iv);return}
  const up=document.getElementById('mainMenu');if(!up||typeof onlineOpen!=='function'||document.getElementById('boot')&&getComputedStyle(document.getElementById('boot')).display!=='none')return;clearInterval(iv);
  try{localStorage.setItem('flavius_online77','1')}catch(e){}if(typeof menuHide==='function')try{menuHide()}catch(e){}onlineOpen('play');
  let k=0;const iv2=setInterval(()=>{k++;if(document.getElementById('onl')&&NET.mode){clearInterval(iv2);onl83Profile(id)}else if(k>60)clearInterval(iv2)},250)},250)})();

/* ---------------- 12 · the WAGERS tab ---------------- */
function onl83Wagers(){if(!ONL83U.wl||Date.now()-ONL83U.wlAt>10000){ONL83U.wlAt=Date.now();NET.req('wager.list',{}).then(r=>{ONL83U.wl=r;if(ONL.tab==='wagers'&&document.getElementById('onl')&&!onlFocus80())onlRedraw()}).catch(e=>{ONL83U.wl=ONL83U.wl||{open:[],mine:[],top:[],err:errText92(e)}})}
  const X=ONL83U.wl;if(!X)return `<h3>${_T`💰 Wagers`}</h3><p class="rc-sub">${_T`Reading the bookmakers’ tablets…`}</p>`;
  const open=(X.open||[]).map(L=>{const names=Object.fromEntries((L.players||[]).map(p=>[p.seat,p]));
    return `<div class="card2 wg83-pot"><div class="wg83-h">${typeof cardHTML==='function'?`<span class="wg83-ev">${cardHTML('e:'+L.ev,'sm')}</span>`:''}<div><b>${esc2(onlEvName(L.ev))}</b> <small class="rc-sub">${esc2(onlCityName(L.loc))} · ${L.ranked?_T('⚔ Ranked'):_T('Custom')} · ${L.status==='live'?'🔴 live':'waiting'}</small>
      <div class="wg83-pool">${_T`Pool ${c83()} <b>${L.pool|0}</b>${L.pot?_T` + tickets ${L.pot}`:''}`}</div></div></div>
      <table class="wg83-t"><tr><th>${_T`Seat`}</th><th>${_T`Staked`}</th><th>${_T`Pays`}</th></tr>${(L.seats||[]).map(s=>{const p=names[s.seat];return `<tr><td>${p?`${esc2(p.name)}${p.domus?` <small class="dom82c">🏛 ${esc2(onlHouse82(p.domus))}</small>`:''}`:_T`Seat ${s.seat+1}`}</td><td>${s.stake?`${c83()} ${s.stake}`:'—'}</td><td>${s.odds!=null?`<b class="wg83-odds">×${s.odds}</b>`:'—'}</td></tr>`}).join('')}</table>
      ${L.status==='waiting'&&ONL.char&&!onlIsGuest82()?`<div class="acts"><button type="button" class="btn tksm" data-onl="bet" data-v="${esc2(L.id)}">${_T`💰 Wager`}</button></div>`:''}</div>`}).join('')||`<p class="rc-sub">${_T`No open pots — wager on a room in the Lobby Browser.`}</p>`;
  const res={open:'⏳ open',won:'🏆 won',lost:'✕ lost',refund:'↺ refunded'};
  const mine=(X.mine||[]).map(b=>`<tr class="wg83-${b.res}"><td>${esc2(date83(b.at))}</td><td>${esc2(onlEvName(b.ev))} <small class="rc-sub">${esc2(onlCityName(b.loc))}</small></td><td>${esc2(b.target||'')}</td><td>${c83()} ${b.amt}</td><td>${res[b.res]||b.res}${b.res==='won'?` <b>+${b.pay}</b>`:''}</td></tr>`).join('');
  const top=(X.top||[]).map((t,i)=>`<tr><td>${['🥇','🥈','🥉'][i]||i+1}</td><td><b>${esc2(t.name)}</b>${t.domus?` <small class="dom82c">🏛 ${esc2(onlHouse82(t.domus))}</small>`:''}</td><td class="${t.net>=0?'pos':'neg'}">${t.net>=0?'+':''}${t.net}</td><td>${c83()} ${t.staked}</td></tr>`).join('');
  return `<div class="onl-lbtop"><h3>${_T`💰 Wagers`}</h3><div class="acts"><button type="button" class="btn tksm" data-onl83="wlr">↻</button></div></div>
   ${ONL.betting&&typeof onlBetHTML==='function'?onlBetHTML():''}<div class="wg83"><div class="wg83-open"><h4 class="onl-h">${_T`Open pots`}</h4><div class="wg83-pots">${open}</div></div>
    <div class="wg83-side">${onlIsGuest82()?'':`<div class="card2">${_T`<b>My bets</b>${mine?`<div class="wg83-scroll"><table class="tally wg83-t">${mine}</table></div>`:'<p class="rc-sub">No bets yet.</p>'}`}</div>`}
     <div class="card2">${_T`<b>This week’s best bettors</b>${top?`<table class="tally wg83-t">${top}</table>`:'<p class="rc-sub">No winners yet this week.</p>'}`}</div></div></div>`}
/* the rail: 💰 Wagers before the Hall; a TEST chip beside test houses' names */
{const base=onlHTML;onlHTML=function(){const want=ONL.tab==='wagers';if(want)ONL.tab='hall';let h;try{h=base.apply(this,arguments)}finally{if(want)ONL.tab='wagers'}
  try{if(ONL.acct&&h.includes('class="onl-rail"')&&!ONL.newGlad){const btn=`<button type="button" data-onl="tab" data-v="wagers" class="${want?'on':''}">${_T`💰 Wagers`}</button>`;
      h=h.replace(/(<button type="button" data-[a-z0-9]+="tab" data-v="hall")/,btn+'$1');
      if(want){h=h.replace(/(<button type="button" data-[a-z0-9]+="tab" data-v="hall" class=")on(")/,'$1$2');const a=h.indexOf('<main class="onl-main">'),b=h.lastIndexOf('</main>');if(a>=0&&b>a)h=h.slice(0,a+23)+onl83Wagers()+h.slice(b)}}
    if(ONL83U.testDom.size)h=h.replace(/(<small class="dom82c">🏛 )([^<]*)(<\/small>)/g,(m,a,n,c)=>{const raw=n.replace(/^House /,'');return ONL83U.testDom.has(raw)||ONL83U.testDom.has(n)?_T`${a}${n} <i class="test83">TEST</i>${c}`:m})}catch(e){console.error(e)}return h}}
/* guests: the wagers tab is open to them (read only) */
if(typeof GUEST_ACTS82!=='undefined')GUEST_ACTS82.add('tab');

/* ---------------- 3 · the result: award − the lanista's cut = pay; broken pieces, offerings back, gifts ---------------- */
{const base=onlSettled;onlSettled=function(res){const r=base.apply(this,arguments);try{const o=res&&res.out;if(!o||res.void)return r;const bits=[];
    if(!o.died&&(o.award|0)>0)bits.push(_T`💰 Award ${o.award} − the lanista’s cut ${o.cut|0} (to the treasury) = <b>${coinAmt87(o.pay)}</b>`);
    if((o.broken||[]).length)bits.push(_T`💔 ${o.broken.length} piece${o.broken.length===1?'':'s'} came back broken — 🔧 repair in the Storeroom`);
    if((o.gone||[]).length)bits.push(_T`🔥 Used up in the bout: ${o.gone.map(k=>esc2((onlCatalog()[k]||{}).n||k)).join(', ')} — buy new in the Armory`);
    if((o.offBack||[]).length)bits.push(_T`🧪 ${o.offBack.length} offering${o.offBack.length===1?'':'s'} back in the satchel`);
    if((o.gifts||[]).length)bits.push(_T`🎁 Flavius sends ${o.gifts.length===1?_T('a Donativum'):o.gifts.length+_T(' Donativa')} to the house`);
    if(bits.length)setTimeout(()=>onlToast80(bits.join('<br>')),5200);ONL82.dgAt=0}catch(e){}return r}}

/* ---------------- the controls ---------------- */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-onl83]');if(!b||!b.closest('#onl,.onl80pop'))return;e.preventDefault();e.stopPropagation();const a=b.dataset.onl83,v=b.dataset.v;
  if(a==='gift')return onl83GiftOpen();
  if(a==='myprof'){if(ONL.domus&&ONL.domus.id)onl83Profile(ONL.domus.id);return}
  if(a==='prof')return onl83Profile(v);
  if(a==='mkt'){ONL83U.mkt=v;if(v==='used')ONL83U.usedAt=0;onlRedraw();return}
  if(a==='wlr'){ONL83U.wlAt=0;onlRedraw();return}
  if(a==='repair'){const [from,item]=v.split('|');return onl83Repair(from,item)}
  if(a==='hold'){const L=onlMyLobby();if(L)NET.req('lobby.hold',{id:L.id}).then(R=>{ONL83U.stop[L.id]=Date.now();if(R&&R.id)onlUpsert80(R);onlRedraw()}).catch(err=>onlToast80('⚠ '+esc2(errText92(err))));return}
  if(a==='obuy'){const ch=ONL.char;if(!ch)return;const pr=ONLC.PRICE_OFF[v];
    return ask76(_T('🧪 Buy this offering?'),`<div style="display:flex;gap:12px;align-items:center">${offTok83(v,64)}<p style="margin:0">${_T`<b>${esc2(OFF83N(v))}</b> for <b>${coinAmt87(pr)}</b> into ${esc2(ch.name)}’s satchel.<br><small class="rc-sub">Up to ${ONLC.OFF_CARRY} go into a match; the unused come back.</small>`}</p></div>`,_T`Buy · ${pr}`,_T('Not now'))
      .then(ok=>{if(ok)onlDo(async()=>{const c=await NET.req('offer.buy',{char:ch.id,key:v});onl83Put(c);ONL.char=c;onlToast80(_T`🧪 ${esc2(OFF83N(v))} is in the satchel.`)})})}
  if(a==='ubuy'){const ch=ONL.char;const x=(ONL83U.used||[]).find(y=>y.id===v);if(!ch||!x)return;
    return ask76(_T('🏺 Buy it used?'),`<p style="margin:0">${_T`Buy <b>${esc2(x.n)}</b>${x.st==='broken'?' (<b>broken</b>)':''} for <b>${coinAmt87(x.price)}</b>?`}</p>${x.from?`<p class="rc-sub" style="margin:6px 0 0">${_T`Once ${esc2(x.from.glad||'someone')}’s.`}</p>`:''}`,_T`Buy · ${x.price}`,_T('Not now'))
      .then(ok=>{if(ok)onlDo(async()=>{try{const r=await NET.req('market.buy',{char:ch.id,id:v});onl83Put(r.char);ONL.char=r.char;onlToast80(_T`🏺 ${esc2(x.n)} is ${esc2(ch.name)}’s now.`)}finally{ONL83U.usedAt=0;ONL83U.used=null}})})}
  if(a==='dbuy'){const s=document.getElementById('buy83sel');const k=s&&s.value;const it=onlCatalog()[k];if(!it)return;const p=ONLC.priceOf(it);
    return ask76(_T('🏛 Buy for the shelf?'),`<p style="margin:0">${_T`<b>${esc2(it.n)}</b> (level ${it.lv}) for <b>${coinAmt87(p)}</b> from the treasury (${(ONL.domus||{}).treasury|0}).`}</p>`,_T`Buy · ${p}`,_T('Not now'))
      .then(ok=>{if(ok)onlDo(async()=>{await NET.req('domus.buy',{item:k});ONL82.dgAt=0;onlToast80(_T`🏛 ${esc2(it.n)} is on the shelf.`)})})}
  if(a==='finv'){const L=onlMyLobby();if(!L)return;return onlDo(async()=>{await NET.req('lobby.invite',{id:L.id,to:v});onlToast80(_T('✉ Invitation sent.'))})}
  if(a==='infq'){const ev=ONL83U.infEv;return onlDo(async()=>{const r=await onlReq80('lobby.quick',{ev,ranked:v==='1',inf:1});onlToast80(r.made?_T`✦ A new Ludi Infames room — ${esc2(onlEvName(ev))}.`:_T`✦ You joined ${esc2(r.lobby.host.name)}’s Ludi Infames room.`)})}
  if(a==='grant'){const num=id=>Math.max(0,+((document.getElementById(id)||{}).value)||0);const g=(document.getElementById('tst83gear')||{}).value,o=(document.getElementById('tst83off')||{}).value;
    const d={coin:num('tst83coin'),gift:num('tst83gift'),glory:num('tst83glory'),gear:g?[g]:[],offering:o?[o]:[]};
    return onlDo(async()=>{const r=await NET.req('admin.grant',d);if(r.char)onl83Put(r.char);if(r.domus)ONL.domus=r.domus;ONL82.dgAt=0;await onlRefresh();onlToast80(_T('🧪 Granted. This is a TEST house now.'))})}},true);
document.addEventListener('change',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.onl83inf){ONL83U.infEv=t.value;e.stopPropagation()}},true);

{const st=document.createElement('style');st.textContent=`
.rb83 .rb82-body{height:620px}.rb83 .rb82-band{font-size:12px}.rb83 .rb82-tok{cursor:pointer}
.dom82-rec{grid-template-columns:repeat(8,minmax(0,1fr))}.tre83{border-color:#a8873e!important;background:rgba(232,201,106,.07)}.tre83 b{color:#f3d58a!important}
.test83{display:inline-block;font:700 9.5px/1.4 var(--mono,monospace);font-style:normal;letter-spacing:.08em;color:#1a1208;background:#7fd0c8;border-radius:4px;padding:0 4px;margin-left:4px;vertical-align:2px}
.dom82c,.dom82-pl,.dom82-ttl h3{cursor:pointer}.dom82c:hover,.dom82-pl:hover{text-decoration:underline}
.gift83{all:unset;position:relative;cursor:pointer;display:grid;justify-items:center;gap:1px;flex:none;border-radius:50%;filter:grayscale(.55) brightness(.8);transition:filter .2s,transform .2s}
.gift83 small{font:600 10.5px system-ui,sans-serif;color:#cbb88f}.dom82 .gift83 small{color:#6b4a8a}.gift83:hover{transform:translateY(-2px)}
.gift83.on{filter:none;animation:gift83glow 2.2s ease-in-out infinite}.gift83.on small{color:#e2c7ff}
.gift83.on>span:first-child,.gift83.on>img:first-child{border-radius:50%;box-shadow:0 0 0 2px #b77cff,0 0 18px 6px rgba(160,90,255,.75),0 0 40px 10px rgba(140,60,240,.35)}
@keyframes gift83glow{0%,100%{filter:drop-shadow(0 0 4px rgba(170,100,255,.6))}50%{filter:drop-shadow(0 0 14px rgba(190,120,255,.95))}}
.gift83n{position:absolute;top:-4px;right:-6px;min-width:20px;height:20px;border-radius:10px;background:#7b2fd0;color:#fff;font:700 12px/20px system-ui,sans-serif;text-align:center;border:2px solid #f2e3ff;padding:0 3px;box-sizing:border-box}
.a81-stage{position:relative}.gift83.stage{position:absolute;top:12px;right:14px;z-index:4}.gift83.dom{margin-left:auto}.dom82-ttl{min-width:0}

.tr83{display:grid;gap:6px}.tr83-h{font:700 15px Georgia,serif;color:var(--gold,#e8c96a)}.tr83-none{margin:0}
.tr83-shelf{display:flex;gap:8px;overflow-x:auto;padding:8px 10px 12px;border-radius:10px;background:linear-gradient(#2b1f14,#1d150d);box-shadow:inset 0 -10px 0 #4a3420,inset 0 -12px 0 #6b4a2a;scrollbar-width:thin}
.tr83-t{flex:none;width:118px;display:grid;justify-items:center;text-align:center;gap:1px}.tr83-ic{position:relative;font-size:30px;line-height:1.1;filter:drop-shadow(0 3px 3px rgba(0,0,0,.6))}.tr83-ic i{position:absolute;right:-12px;bottom:0;font:700 10px var(--mono,monospace);font-style:normal;color:#f3d58a}
.tr83-t b{font:600 11.5px/1.2 Georgia,serif;color:#eadbb8}.tr83-t small{font-size:10.5px;color:var(--muted)}
.tst83{border:1px dashed #4d8f88;border-radius:10px;padding:6px 10px}.tst83 summary{cursor:pointer;color:#9fe0d8}.tst83-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:6px;margin:8px 0}.tst83-g label{display:grid;gap:2px;font-size:12px;color:var(--muted)}
.rar83{display:inline-block;margin-left:4px;font:700 10px system-ui,sans-serif;color:#120c06;background:var(--rc);border-radius:4px;padding:0 4px}
.lk83{color:#f0cf7d!important}.no83{opacity:.75}.brk83t{color:#ff9b8a!important}
.brk83 .sr82-art{align-self:start;overflow:hidden}.brk83 .sr82-art,.brk83 .pc83-art,.brk83 .nw83-art{filter:grayscale(.7) brightness(.6) contrast(1.1);position:relative}
.brk83 .sr82-art::after,.brk83 .pc83-art::after,.brk83 .nw83-art::after{content:"";position:absolute;inset:0;background:linear-gradient(118deg,transparent 46%,rgba(20,10,6,.95) 47%,rgba(255,220,190,.35) 48%,transparent 49%),linear-gradient(62deg,transparent 58%,rgba(20,10,6,.9) 59%,transparent 60.5%),linear-gradient(160deg,transparent 30%,rgba(20,10,6,.85) 31%,transparent 32%);pointer-events:none}
.sr83.brk83{border-color:#7a3a2c}.sr83.named83{border-color:var(--rc);box-shadow:inset 0 0 18px -6px var(--rc)}.rep83{border-color:#c9a24f!important}
.sr83-nw{position:relative;border-radius:6px;overflow:hidden}.nw83-tint{position:absolute;inset:0;background:var(--rc);mix-blend-mode:color;opacity:.55;pointer-events:none}
.buy83,.of83-box{margin-top:12px;border:1px solid #5a4428;border-radius:10px;padding:8px 10px;background:rgba(255,255,255,.02)}.buy83 summary{cursor:pointer;font:700 14px Georgia,serif;color:var(--gold,#e8c96a)}
.buy83-g{display:flex;gap:6px;margin:8px 0 4px;flex-wrap:wrap}.buy83-g select{flex:1 1 220px;min-width:0}
.of83-row{display:grid;grid-template-columns:120px minmax(0,1fr);gap:2px 10px;align-items:center;padding:6px 0;border-top:1px dashed rgba(255,255,255,.07)}.of83-row>small{grid-column:1}.of83-toks{grid-column:2;grid-row:1 / span 2;display:flex;flex-wrap:wrap;gap:6px}
.of83{display:grid;justify-items:center;gap:1px;padding:3px 4px;border:1px solid #4a3a26;border-radius:8px;font-size:10.5px}.of83.br{border-color:#c9a24f;background:rgba(232,201,106,.08)}.of83 label{display:flex;gap:2px;align-items:center;color:var(--muted)}
.of83 select{width:44px;padding:0 2px;font-size:11px;height:22px}
.nw83{--rc:#b9b2a0;display:grid;grid-template-columns:120px minmax(0,1fr);gap:10px;padding:10px;border:2px solid var(--rc);border-radius:12px;text-align:left;
  background:radial-gradient(ellipse at 20% 0%,color-mix(in srgb,var(--rc) 30%,transparent),transparent 65%),linear-gradient(#251b12,#140e09);box-shadow:0 0 22px -6px var(--rc),inset 0 0 0 1px rgba(0,0,0,.6);max-width:430px}
.nw83.sm{grid-template-columns:72px minmax(0,1fr);padding:7px;gap:8px;max-width:340px}.nw83.sm .nw83-uq{font-size:11px}.nw83.sm .nw83-n{font-size:14px}
.nw83-art{position:relative;border-radius:8px;overflow:hidden;align-self:start;box-shadow:0 2px 8px rgba(0,0,0,.6)}.nw83-art>*:not(.nw83-tint):not(.nw83-gem){display:block;width:100%}
.nw83-gem{position:absolute;left:0;right:0;bottom:0;text-align:center;font:700 10px system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#140c06;background:var(--rc);padding:1px 0}
.nw83-b{display:grid;gap:3px;min-width:0;align-content:start}.nw83-n{font:700 17px/1.15 Georgia,serif;color:var(--rc);text-shadow:0 1px 6px rgba(0,0,0,.8)}.nw83-base{color:var(--muted);font-size:11.5px}
.nw83-aff{display:flex;flex-wrap:wrap;gap:4px}.nw83-aff span{font:600 11px system-ui,sans-serif;color:#eadbb8;border:1px solid color-mix(in srgb,var(--rc) 60%,transparent);border-radius:6px;padding:0 5px}
.nw83-uq{margin:2px 0 0;font-size:12px;color:#f6e7c4;border-left:3px solid var(--rc);padding-left:6px}.nw83-uq b{color:var(--rc)}.nw83-val{color:#d9c08a;font-size:12px}
.r-legendary.nw83{animation:nw83leg 3s ease-in-out infinite}@keyframes nw83leg{50%{box-shadow:0 0 34px -2px var(--rc),inset 0 0 0 1px rgba(0,0,0,.6)}}
.hist83{display:grid;gap:1px;margin-top:2px}.hist83 small{font-size:10.5px;color:#bfae8a}
.pc83{display:grid;justify-items:center;gap:2px;text-align:center;padding:6px;border:1px solid #5a4428;border-radius:10px;background:rgba(255,255,255,.03);max-width:200px}.pc83-art{width:84px;position:relative}.pc83 b{font:600 13px Georgia,serif}.pc83 small{font-size:11px;color:var(--muted)}
.mb83{position:relative;border-radius:12px;padding:12px;background:linear-gradient(rgba(16,10,6,.82),rgba(16,10,6,.9)),url('${typeof assetURL==='function'?assetURL('market_board.webp'):'assets/market_board.webp'}') center/cover;border:2px solid #7a5a2e;box-shadow:0 6px 20px rgba(0,0,0,.5),inset 0 0 40px rgba(0,0,0,.6)}
.mb83-h{font:700 15px Georgia,serif;color:var(--gold,#e8c96a);margin:0 0 6px;display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}.mb83-h small{font:500 12px system-ui,sans-serif;color:var(--muted)}
.mb83-offs{padding:8px 10px;border:1px solid #6b5636;border-radius:10px;background:rgba(0,0,0,.35);margin-bottom:10px}
.mb83-ofrow{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:thin}
.mb83-of{all:unset;cursor:pointer;flex:none;width:92px;display:grid;justify-items:center;gap:2px;text-align:center;padding:6px 4px;border:1px solid #5a4428;border-radius:10px;background:rgba(255,255,255,.03)}
.mb83-of:hover:not([disabled]){border-color:var(--gold,#e8c96a);background:rgba(232,201,106,.08)}.mb83-of[disabled]{opacity:.45;cursor:not-allowed}.mb83-of small{font-size:10.5px;line-height:1.15;color:#d8c9a6}.mb83-of b{font:700 12px var(--mono,monospace);color:#f3d58a}
.mb83,.mb83-offs,.mb83-ofrow,.mb83-items{min-width:0}.mb83-halves{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px}.mb83-half{min-width:0;padding:8px;border:1px solid #6b5636;border-radius:10px;background:rgba(0,0,0,.3)}
.mb83-row{display:grid;grid-template-columns:28px minmax(0,1fr);gap:6px;align-items:center;padding:6px 0;border-top:1px dashed rgba(232,201,106,.18)}.mb83-row:first-of-type{border-top:0}
.mb83-lv{font:700 15px Georgia,serif;color:#e8c96a;text-align:center;writing-mode:vertical-rl;transform:rotate(180deg)}
.mb83-items{display:flex;flex-wrap:wrap;gap:6px;padding-bottom:4px}
.mb83-it{all:unset;cursor:pointer;flex:none;width:86px;display:grid;justify-items:center;gap:2px;text-align:center;padding:4px;border-radius:8px;border:1px solid transparent}
.mb83-it:hover:not([disabled]){border-color:var(--gold,#e8c96a);background:rgba(232,201,106,.08)}.mb83-it .cardimg,.mb83-it>span:first-child{max-width:78px}.mb83-it b{font:600 11.5px/1.15 Georgia,serif}.mb83-it small{font:600 11px var(--mono,monospace);color:#f3d58a}
.mb83-it.no{opacity:.5}.mb83-it.own small{color:#9fd18f}.mb83-it[disabled]{cursor:default}
.us83{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}.us83-it{display:grid;grid-template-columns:auto minmax(0,1fr);gap:8px;padding:8px;border:1px solid #5a4428;border-radius:10px}.us83-it.brk83{border-color:#7a3a2c}
.us83-f{display:grid;gap:3px;align-content:start}.us83-from{color:#cbb88f}
.pop83box{max-width:min(720px,94vw)!important;max-height:90vh;overflow:auto}.pop83h{margin:0 0 6px;font:700 20px Georgia,serif;color:var(--gold,#e8c96a)}
.rep83-card{display:flex;justify-content:center;margin:6px 0}.rep83-pay{display:flex;flex-wrap:wrap;gap:6px}
.loot83-g{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}.loot83-it{all:unset;cursor:pointer;position:relative;display:grid;justify-items:center;gap:4px;padding:6px;border-radius:12px;border:2px solid transparent}
.loot83-it:hover{border-color:var(--gold,#e8c96a);background:rgba(232,201,106,.06)}.loot83-it.best::before{content:"most valuable";white-space:nowrap;position:absolute;top:-8px;left:50%;transform:translateX(-50%);font:700 10px system-ui;background:#a3281f;color:#fff;border-radius:6px;padding:0 6px;z-index:2}
.loot83-take{font:700 12px system-ui,sans-serif;color:#f3d58a}.loot83cd{color:#f0cf7d;margin-left:6px}
.gft83{display:grid;justify-items:center;text-align:center;gap:4px;perspective:600px}.gft83-tok{transform-style:preserve-3d}
.gft83-tok.spin{animation:gft83spin .7s linear infinite;filter:drop-shadow(0 0 22px rgba(170,100,255,.95))}.gft83-tok.done{animation:gft83pop .5s ease-out both}
@keyframes gft83spin{from{transform:rotateY(0)}to{transform:rotateY(360deg)}}@keyframes gft83pop{0%{transform:scale(1)}40%{transform:scale(1.15)}100%{transform:scale(.55);opacity:.85}}
.gft83-tok.done{margin:-30px 0 -30px}
.gft83-prize{display:grid;justify-items:center;gap:6px;min-height:20px}.pz83{display:grid;justify-items:center;gap:6px;animation:pz83in .5s ease-out both;position:relative}@keyframes pz83in{from{opacity:0;transform:translateY(14px) scale(.9)}to{opacity:1;transform:none}}
.pz83 p{margin:0}.pz83-big{font:700 38px Georgia,serif;color:#f3d58a;text-shadow:0 2px 12px rgba(0,0,0,.7)}.pz83.off b{font:700 16px Georgia,serif;color:#eadbb8}
.pz83-rays{position:absolute;left:50%;top:40%;width:460px;height:460px;transform:translate(-50%,-50%);background:repeating-conic-gradient(from 0deg,color-mix(in srgb,var(--rc) 35%,transparent) 0 8deg,transparent 8deg 20deg);-webkit-mask:radial-gradient(circle,#000 18%,transparent 62%);mask:radial-gradient(circle,#000 18%,transparent 62%);animation:pz83rot 14s linear infinite;pointer-events:none;z-index:-1}
@keyframes pz83rot{to{transform:translate(-50%,-50%) rotate(360deg)}}.pz83.named{isolation:isolate}
.inf83{border-color:#7b2fd0!important;background:linear-gradient(135deg,rgba(123,47,208,.25),rgba(20,12,24,.85))!important;box-shadow:0 0 18px -6px #9a5bd0}
.inf83-art{display:grid;place-items:center;position:relative;min-height:90px}.inf83-art>span:last-child{position:absolute;right:8px;top:4px;color:#e0a530;font-size:20px}.inf83b{background:#4b2a6a!important;color:#ead7ff!important}
.inf83.locked{filter:grayscale(.6);opacity:.75}.inf83 select{max-width:120px;height:26px;padding:0 4px}
.a81-week{display:grid;gap:12px;align-content:start}.wk83{margin:0}
.fl83{display:grid;gap:4px}.fl83-r{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:0 6px;align-items:center;padding:3px 0;border-top:1px dashed rgba(255,255,255,.08)}
.fl83-n{all:unset;cursor:pointer;font:600 13px Georgia,serif;color:#eadbb8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fl83-n:hover{text-decoration:underline}.fl83-st{grid-column:1;font-size:11px;color:var(--muted)}.fl83-a{grid-column:2;grid-row:1 / span 2;display:flex;gap:4px}
.cd83{margin:0 0 10px;padding:10px 12px;border:2px solid #c9a24f;border-radius:12px;background:linear-gradient(90deg,rgba(163,40,31,.25),rgba(33,25,19,.7))}.cd83.stop{border-color:#6b5636;display:grid;gap:2px;background:rgba(255,255,255,.03)}
.cd83-top{display:flex;gap:12px;align-items:center}.cd83-top>div{flex:1;min-width:0;display:grid}.cd83-n{font:700 44px/1 Georgia,serif;color:#f3d58a;min-width:56px;text-align:center;text-shadow:0 0 14px rgba(255,190,80,.6)}
.cd83.go .cd83-n{color:#ff8b6a;animation:cd83p .5s ease-in-out infinite alternate}@keyframes cd83p{to{transform:scale(1.15)}}
.cd83-line{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;margin-top:8px}.cd83-s{display:flex;gap:8px;padding:6px;border:1px solid #5a4428;border-radius:10px;background:rgba(0,0,0,.25)}.cd83-s.cpu{opacity:.7}
.cd83-sb{display:grid;gap:2px;min-width:0}.cd83-sb small{color:var(--muted);font-size:11px}.cd83-gear{display:flex;flex-wrap:wrap;gap:3px;align-items:center}
.cd83-pc{font-size:10.5px;border:1px solid #6b5636;border-radius:5px;padding:0 4px;color:#eadbb8}.cd83-pc.nw{border-color:var(--rc);color:var(--rc);font-weight:700}.cd83-val{color:#f3d58a!important}
.pf83{display:grid;gap:10px}.pf83-head{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.pf83-t{flex:1;min-width:160px}.pf83-t h3{margin:0;font:700 22px Georgia,serif;color:var(--gold,#e8c96a)}.pf83-act{display:flex;gap:6px;flex-wrap:wrap}
.pf83-rec{grid-template-columns:repeat(6,minmax(0,1fr))}.pf83-sec{display:grid;gap:4px}.pf83-gs{display:flex;gap:10px;flex-wrap:wrap}.pf83-g{display:grid;justify-items:center;text-align:center;width:130px;gap:1px}.pf83-g small{font-size:11px;color:var(--muted)}
.pf83-m{display:grid;padding:3px 0;border-top:1px dashed rgba(255,255,255,.08)}.pf83-m small{color:var(--muted);font-size:11.5px}.pf83-m.won b{color:#f3d58a}.pf83-m.died b{color:#ff9b8a}
.wg83{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:14px;align-items:start}.wg83-pots{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px}.wg83-side{display:grid;gap:12px}
.wg83-h{display:flex;gap:10px;align-items:center}.wg83-ev{width:52px;flex:none}.wg83-pool{color:#f3d58a;font-size:13px}.wg83-t{width:100%;font-size:12.5px;border-collapse:collapse;margin-top:6px}.wg83-t th{text-align:left;color:var(--muted);font-weight:600}
.wg83-t td,.wg83-t th{padding:3px 4px;border-top:1px dashed rgba(255,255,255,.07)}.wg83-odds{color:#9fd18f}.wg83-won td:last-child{color:#9fd18f}.wg83-lost td:last-child{color:#ff9b8a}.wg83-t .pos{color:#9fd18f}.wg83-t .neg{color:#ff9b8a}
.wg83-scroll{max-height:340px;overflow:auto}
@media(max-width:760px){.dom82-rec{grid-template-columns:repeat(4,minmax(0,1fr))}.rb83 .rb82-body{height:auto}.rb83 .rb82-bands{min-width:0}.rb83 .rb82-band{min-width:0;flex:1 1 0;padding:1px;overflow:hidden}.rb83 .rb82-band b{font-size:9px;line-height:1.1;letter-spacing:-.3px;overflow-wrap:anywhere}.rb83 .rb82-band small,.rb83 .rb82-n{font-size:9px;overflow-wrap:anywhere}.rb83{min-width:0;overflow:hidden}.dom82-rec>div{min-width:0}.mb83-halves{grid-template-columns:minmax(0,1fr)}.mb83-items{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:thin}.mb83{padding:8px}.wg83{grid-template-columns:1fr}.pf83-rec{grid-template-columns:repeat(3,minmax(0,1fr))}
 .nw83{grid-template-columns:84px minmax(0,1fr)}.of83-row{grid-template-columns:1fr}.of83-toks{grid-column:1;grid-row:auto}.gift83.stage{top:8px;right:8px}.cd83-n{font-size:36px;min-width:44px}.pz83-rays{width:320px;height:320px}}`;document.head.appendChild(st)}
