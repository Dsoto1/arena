/* =====================================================================
   175-v89domus · v0.89 THE ONLINE DOMUS, REBUILT (part H — his approval 2026-10-05; contract tools/plans/onl89-domus.md)
   =====================================================================
   The 🏛 Domus tab (ONL.tab 'char') is drawn here from scratch (onlCharHTML replaced while the account has a house; the older chain
   still serves the no-house / guest cases). Top to bottom:
   1 · THE BANNER `.db89` in the house colours + crest: name, record, the TREASURY with an ⓘ (the ledger by source and by gladiator,
       "since v0.89" — `led89` on the domus row), 🏆 Trophies (a popup), Flavius's gifts, and folds 🎨 Colours & crest · 👤 Patron ·
       🏗 Upgrades (5th slot 1500 / shelf +4 400, from the treasury) · 🧪 Tester. No gladiator purses here.
   2 · THE SHOWCASE `.sc89` = the ACTIVE gladiator: his weapon cards in full (right / left hand, drop targets), the avatar wearing his armor
       (a drop target; the worn pieces listed under it — click one to take it off), name ✎, class 🔄 (100 coin from the treasury, a
       popup with the 8 printed cards), rank, record, HIS PURSE (only here and on his card), the Ranked stake, the offerings in his
       satchel (★ = brought, max 2), saved loadouts (≤3: ▶ wear, 💾 save the current kit, ✕).
   3 · THE EQUIPMENT BAR `.eb89`, two tabs: ⚔ Gear (every piece the house owns that nobody wears: the shelf + pieces still held unworn)
       and 🧪 Offerings (the house shelf). CLICK a piece = put it on the showcase gladiator (the piece on the same point / hand comes off
       to the shelf); DRAG it onto the avatar / a hand / the satchel (pointer events: mouse, pen, touch). Each tile says what it does for
       him: "+2 AP right leg · replaces Leather Greaves", or why not (dimmed: named below Veteranus, broken). Broken pieces are drawn
       cracked with 🔨 + the price (one click: the treasury pays, else his purse). 🔒 keeps a piece home (never in a Ranked kit).
   4 · THE GLADIATOR CARDS `.gc89`: up to gladMax (4, or 5 with the upgrade): small avatar in his armor, his weapons, purse, rank and
       the STAKE (what he would risk in Ranked: the value of what he brings + his purse; a red edge from STAKE_HIGH89). Click = active.
   5 · THE MEMORIAL WALL `.mw89`: every fallen gladiator of the house (memo from domus.get + the dead from before v0.89).
   The look of a gladiator is LOCKED after creation (no look editors; ONLC.editChar refuses a changed look).
   MOCK: every new route (char.class, domus.dress, gear.home, char.kits, char.kitapply, domus.upgrade, domus.look), the house cap
   (char.create), admin.grant to the house, the ledger (domus.buy, gear.repair, the cut) and the memorial (mockAfter83) — as server/src/routes.js.
   ===================================================================== */
const V89D={tab:(()=>{try{return localStorage.getItem('flavius_dombar89')||'gear'}catch(e){return 'gear'}})(),open:{},drag:null,noClick:0,look:null,pin:false};
const STAKE_HIGH89=750;const GLAD_BASE89=ONLC.GLAD_MAX; /* TWEAK: the red edge on a gladiator card (coin at risk in Ranked) */

/* =========================== THE MOCK SERVER (as server/src/routes.js "v0.89 THE DOMUS REBUILD") =========================== */
function mockKitPlan89(w,me,D,ch,K){const cat=onlCatalog();const equip=[],take=[],skipped=[];const mine=(ch.gear||[]).slice(),shelf=(D.gear||[]).slice();
  const others=Object.values(w.chars).filter(c=>c.owner===me&&c.alive&&c.id!==ch.id&&c.domus===D.id);
  const nm=it=>((ONLC.pieceOf(ch,it,cat)||ONLC.pieceOf(D,it,cat)||{}).n)||((cat[ONLC.itemBase(it)]||{}).n)||ONLC.itemBase(it);
  const use=(h,it,src)=>{const I=ONLC.pieceOf(h,it,cat);if(!I)return 'gone';if(I.st==='broken')return 'broken';if(I.named&&!ONLC.canWearNamed(ch))return 'veteranus';
    if(src==='mine'){mine.splice(mine.indexOf(it),1);equip.push(it)}else{shelf.splice(shelf.indexOf(it),1);take.push({item:it,from:'house'});equip.push(it)}return ''};
  for(const it of K.items||[]){let why='';
    if(mine.includes(it))why=use(ch,it,'mine');else if(shelf.includes(it))why=use(D,it,'house');
    else{const o=others.find(c=>(c.gear||[]).includes(it));if(o)why='with:'+o.name;
      else if(!ONLC.isNamed(it)){const b=ONLC.itemBase(it);const m2=mine.find(x=>ONLC.itemBase(x)===b),s2=shelf.find(x=>ONLC.itemBase(x)===b);why=m2?use(ch,m2,'mine'):s2?use(D,s2,'house'):'gone'}else why='gone'}
    if(why)skipped.push({item:it,n:nm(it),why})}
  return {equip,take,skipped}}
function mockDress89(w,me,D,ch,equip,take){if(mockCharBusy82(w,ch.id))throw onlErr82(_T`${ch.name} is in a match — the storeroom waits.`,'in_match');const cat=onlCatalog();const T0=[];
  for(const t of (Array.isArray(take)?take:[]).slice(0,8)){const item=String((t&&t.item)||''),f=String((t&&t.from)||'');if(!item||f===ch.id)continue;let H;
    if(f==='house')H=D;else{H=w.chars[f];if(!H||H.owner!==me||H.domus!==D.id||!H.alive)throw new Error(_T('Not of your house.'));if(mockCharBusy82(w,H.id))throw onlErr82(_T`${H.name} is in a match — the storeroom waits.`,'in_match')}
    if(!(H.gear||[]).includes(item))throw new Error(_T('That piece is not there.'));const why=ONLC.takeWhy(ch,ONLC.pieceOf(H,item,cat));if(why)throw new Error(why);T0.push({H,item})}
  const inc=[],from=[];for(const t of T0){inc.push(ONLC.takePiece(t.H,t.item));if(t.H!==D&&!from.includes(t.H))from.push(t.H)}
  const r=ONLC.dressApply(ch,equip,inc,cat);for(const P of r.off)ONLC.putPiece(D,P,false);
  return {char:ch,domus:mockDRow82(D),gear:D.gear||[],pcs:D.pcs||{},from}}
Object.assign(MOCK_ROUTES,{
  'char.class':(w,d,me)=>{const D=mockHouse83(w,me);const ch=mockOwn83(w,me,d.char);if(ch.domus!==D.id)throw new Error(_T('Not of your house.'));
    if(mockBusy(w,me)||mockLive80(w,me)||Object.values(w.lobbies).some(L=>L.status==='waiting'&&ONLC.memberOf(L,me)))throw onlErr82(_T('Finish or leave your game first.'),'in_match');
    const cls=String(d.cls||'');const why=ONLC.classWhy(ch,cls,D);if(why)throw onlErr82(why,/treasury/.test(why)?'no_coin':undefined,/treasury/.test(why)?{cost:ONLC.CLASS_FEE89}:undefined);
    D.treasury=(D.treasury|0)-ONLC.CLASS_FEE89;ONLC.ledAdd(D,'class',ONLC.CLASS_FEE89,ch);ch.cls=cls;return {char:ch,domus:mockDRow82(D)}},
  'domus.dress':(w,d,me)=>{const D=mockHouse83(w,me);const ch=mockOwn83(w,me,d.char);if(ch.domus!==D.id)throw new Error(_T('Not of your house.'));return mockDress89(w,me,D,ch,d.equip,d.take)},
  'gear.home':(w,d,me)=>{const D=mockHouse83(w,me);const item=String(d.item||'');const on=d.on!==false;
    if(d.holder==='house'){const id=ONLC.homeSet(D,item,on);return {item:id,holder:{house:true,gear:D.gear||[],pcs:D.pcs||{},offers:D.offers||[]}}}
    const ch=mockOwn83(w,me,d.holder);if(ch.domus!==D.id)throw new Error(_T('Not of your house.'));if(mockCharBusy82(w,ch.id))throw onlErr82(_T`${ch.name} is in a match — the storeroom waits.`,'in_match');
    const id=ONLC.homeSet(ch,item,on);return {item:id,holder:ch}},
  'char.kits':(w,d,me)=>{const ch=mockOwn83(w,me,d.char);ch.kits89=ONLC.cleanKits(ch,d.kits);return {char:ch}},
  'char.kitapply':(w,d,me)=>{const D=mockHouse83(w,me);const ch=mockOwn83(w,me,d.char);if(ch.domus!==D.id)throw new Error(_T('Not of your house.'));const K=(ch.kits89||[])[d.i|0];if(!K)throw new Error(_T('No such loadout.'));
    if(mockCharBusy82(w,ch.id))throw onlErr82(_T`${ch.name} is in a match — the storeroom waits.`,'in_match');const P=mockKitPlan89(w,me,D,ch,K);return {...mockDress89(w,me,D,ch,P.equip,P.take),skipped:P.skipped,kit:K.n}},
  'domus.upgrade':(w,d,me)=>{const D=mockHouse83(w,me);const k=String(d.k||'');const why=ONLC.upgWhy(D,k);if(why)throw onlErr82(why,/treasury/.test(why)?'no_coin':undefined,/treasury/.test(why)?{cost:(ONLC.UPG89[k]||{}).cost}:undefined);
    ONLC.upgBuy(D,k,Date.now());return {domus:mockDRow82(D)}},
  'domus.look':(w,d,me)=>{const D=mockHouse83(w,me);D.look89=ONLC.cleanLook89(d);return {domus:mockDRow82(D)}},
  /* 🧪 tester grants (his fix): coin → the treasury, gear + offerings → the shelf, Glory → the active gladiator */
  'admin.grant':(w,d,me)=>{if(!mockTester83()||mockIsGuest82(me))throw onlErr82(_T('Only testers may do that.'),'notTester');const A=w.accounts[me];const D=mockHouse83(w,me);
    const ch=onlMockChar(w,me);if(ch&&mockCharBusy82(w,ch.id))throw onlErr82(_T`${ch.name} is in a match — grant afterwards.`,'in_match');const cat=onlCatalog();
    const coin=Math.max(0,Math.min(100000,d.coin|0)),gifts=Math.max(0,Math.min(10,d.gift|0)),glory=Math.max(0,Math.min(10000,+d.glory||0));
    const gear=(Array.isArray(d.gear)?d.gear:[]).map(String).filter(k=>cat[k]).slice(0,10),offs=(Array.isArray(d.offering)?d.offering:[]).map(String).filter(k=>ONLC.OFFERS83.includes(k)).slice(0,10);
    if(!coin&&!gifts&&!glory&&!gear.length&&!offs.length)throw new Error(_T('Nothing to grant.'));const t=Date.now();D.test=true;A.dtest=true;
    for(const c of Object.values(w.chars))if(c.domus===D.id&&c.alive)c.test=true;
    if(ch&&glory){ch.glory=Math.round((ONLC.gloryOf(ch)+glory)*100)/100;const R=ONLC.rankFor(ch);ch.rank=R.k;if(ONLC.rankIdx(R.k)>ONLC.rankIdx(ch.rankK||'tiro'))ch.rankK=R.k}
    if(coin){D.treasury=(D.treasury|0)+coin;ONLC.ledAdd(D,'grant',coin,null,t)}
    for(let i=0;i<gifts;i++)ONLC.giftsIn(D,[{id:'test:'+t.toString(36)+':'+i,why:'test',at:t,glad:ch?ch.name:null}]);for(const k of gear)ONLC.putPiece(D,{item:k,pc:null},false);if(offs.length)ONLC.offersIn(D,offs);
    (w.admin83=w.admin83||[]).unshift({at:t,acct:me,domus:D.id,glad:ch?ch.id:null,what:{coin,gift:gifts,glory,gear,offering:offs}});
    return {domus:mockDRow82(D),char:ch||null,gifts:D.gifts||[],gear:D.gear||[],pcs:D.pcs||{},offers:D.offers||[]}}});
/* a house needs a name first (as the server's NEED_DOMUS) */
{const base=mockReq;mockReq=async function(t,d){const me=mockMe();
  if(me&&!mockIsGuest82(me)&&['char.class','domus.dress','gear.home','char.kits','char.kitapply','domus.upgrade','domus.look'].includes(t)){const w=mockLoad();const A=w.accounts[me];if(A&&!A.domus)throw onlErr82(_T('Name your house first — every lanista needs a Domus.'),'need_domus')}
  if(me&&mockIsGuest82(me)&&['char.class','domus.dress','gear.home','char.kits','char.kitapply','domus.upgrade','domus.look'].includes(t))throw onlErr82(_T('Sign in to play.'),'guest');
  return base.apply(this,arguments)}}
/* the house's gladiator cap (4, or 5 with the upgrade) */
{const base=MOCK_ROUTES['char.create'];MOCK_ROUTES['char.create']=(w,d,me)=>{const A=w.accounts[me];const D=mockDomus82(w,A&&A.domus);const g=ONLC.GLAD_MAX;ONLC.GLAD_MAX=ONLC.gladMax(D);try{return base(w,d,me)}finally{ONLC.GLAD_MAX=g}}}
{const base=MOCK_ROUTES['domus.get'];MOCK_ROUTES['domus.get']=(w,d,me)=>{const o=base(w,d,me);const A=w.accounts[me];const D=mockDomus82(w,A&&A.domus);o.memo=(D&&D.memo89)||[];return o}}
{const base=MOCK_ROUTES['domus.buy'];MOCK_ROUTES['domus.buy']=(w,d,me)=>{const r=base(w,d,me);const D=mockHouse83(w,me);ONLC.ledAdd(D,'gear',ONLC.priceOf(onlCatalog()[d.item]));r.domus=mockDRow82(D);return r}}
{const base=MOCK_ROUTES['gear.repair'];MOCK_ROUTES['gear.repair']=(w,d,me)=>{const r=base(w,d,me);if(d.pay==='treasury'||(d.pay==null&&d.holder==='house')){const D=mockHouse83(w,me);ONLC.ledAdd(D,'repair',r.cost|0);r.domus=mockDRow82(D)}return r}}
/* the bigger shelf: an offering onto a shelf past the old 30 */
{const base=MOCK_ROUTES['offer.move'];MOCK_ROUTES['offer.move']=(w,d,me)=>{const A=w.accounts[me];const D=mockDomus82(w,A&&A.domus);
  if(D&&d.to==='house'&&d.from!=='house'&&(D.offers||[]).length>=ONLC.OFF_SHELF){const k=String(d.key||'');const ch=mockOwn83(w,me,d.from);if(mockCharBusy82(w,ch.id))throw onlErr82(_T`${ch.name} is in a match — the satchel waits.`,'in_match');
    const why=ONLC.offerMoveWhy(ch,D,k);if(why)throw new Error(why);const o=(ch.offers||[]).slice();o.splice(o.indexOf(k),1);ch.offers=o;D.offers=[...(D.offers||[]),k];return {from:ch,to:{house:true,offers:D.offers},domus:mockDRow82(D)}}
  return base(w,d,me)}}
/* the settlement: the cut by gladiator; a death goes on the memorial wall (M null = a Ranked abandon) */
{const base=mockAfter83;mockAfter83=function(w,L,M,a,i,row,out,gx){const r=base.apply(this,arguments);try{const ch=w.chars[L.players[i].char];const D=ch&&mockDomus82(w,ch.domus);if(D&&out){
    if(out.cut)ONLC.ledAdd(D,'cut',out.cut,ch);
    if(out.died){let kn=null;if(row&&row.kb==='g'&&(row.ks|0)>=0){const p=L.players[row.ks|0];kn=p&&p.char!==ch.id?p.name:null}
      ONLC.memoAdd(D,ONLC.memoEntry(ch,{ev:L.ev,loc:L.loc,at:Date.now()},M?ONLC.memoBy(row,out,kn):{k:'abandon'}))}}}catch(e){console.error(e)}return r}}

/* =========================== THE CLIENT =========================== */
const d89Cat=()=>onlCatalog();
const d89Live=()=>onl83Live();
const d89Act=()=>{const live=d89Live();return (ONL.char&&live.find(c=>c.id===ONL.char.id))||null};
const d89Shelf=()=>onl83Holder('house');
const d89Coin=n=>coinAmt87(n|0);
const LOC89={head:_T('head'),chest:_T('chest'),rarm:_T('right arm'),larm:_T('left arm'),rleg:_T('right leg'),lleg:_T('left leg')};
const rc89=c=>c?`style="--rc:${c}"`:''; /* i18n:skip */
const d89Busy=()=>typeof onlBusy82==='function'?onlBusy82():new Set();
/* the house colours + crest (the patron's cushion colours and a device from the house id until he picks) */
function d89Look(){const D=ONL.domus||{};if(D.look89&&D.look89.crest)return D.look89;let p={c1:'#7a2230',c2:'#d6ab4c'};try{p=onlPatronGet82(ONL.acct&&ONL.acct.id,onlMyDomus82())}catch(e){}
  const h=Math.abs(typeof hashStr==='function'?hashStr(String(D.id||'d')):7);return {c1:p.c1||'#7a2230',c2:p.c2||'#d6ab4c',crest:ONLC.CREST89[h%12]}}
function d89Crest(L,txt){try{return flagURI(L.c1,L.c2,txt!=null?txt:ludusInitials(String((ONL.domus||{}).name||'')),L.crest)}catch(e){return ''}}
/* every piece the house owns that nobody wears: the shelf, then pieces held but not worn */
function d89Bar(){const out=[];const sh=d89Shelf();for(const it of sh.gear||[]){const I=ONL83.piece(sh,it);if(I)out.push({it,h:sh,from:'house',I})}
  for(const c of d89Live()){const eq=ONLC.equipOf(c).slice();for(const it of c.gear||[]){const i=eq.indexOf(it);if(i>=0){eq.splice(i,1);continue}const I=ONL83.piece(c,it);if(I)out.push({it,h:c,from:c.id,I})}}
  return out}
const d89Base=I=>I?(I.named?(I.w||{}).base:I.base)||'':'';
/* the hands a list of bought weapons ends in (as 112's giveLoadout: the class kit first, then each bought one) */
function d89Hands(cls,list,pc){const CK=CLASSES[cls]||{};let R=CK.R&&W[CK.R]?{k:CK.R,kit:true}:null,L=CK.L&&W[CK.L]?{k:CK.L,kit:true}:null;
  for(const it of list){const b=pc(it);if(!b)continue;const x={k:b,it};if(!R)R=x;else if(!L&&!(W[R.k]||{}).both)L=x;else R=x}return {R,L}}
/* what putting x on ch means: the list he would wear, what comes off, where it goes */
function d89Plan(ch,x,hand){const cat=d89Cat();const eq=ONLC.equipOf(ch).filter(y=>y!==x.it);const I=x.I;
  const H={...ch,gear:[...(ch.gear||[]).filter(y=>y!==x.it),x.it],pcs:{...(ch.pcs||{}),...((x.h&&x.h.pcs)||{})}};
  const pI=y=>ONL83.piece(H,y);let fin;
  if(I.kind==='a'){const cand=[x.it,...eq.filter(y=>{const J=pI(y);return !(J&&!J.named&&!I.named&&!J.stack&&J.base===I.base)})];const ok=ONLC.armFit(H,cand,cat);fin=cand.filter((y,i)=>ok[i])}
  else{const ws=eq.filter(y=>(pI(y)||{}).kind==='w'),rest=eq.filter(y=>(pI(y)||{}).kind!=='w').filter(y=>{const J=pI(y);return !(J&&!J.named&&!I.named&&J.base===I.base)});
    const others=ws.filter(y=>{const J=pI(y);return !(J&&!J.named&&!I.named&&J.base===I.base)});const base=y=>d89Base(pI(y));
    const cands=[[x.it]];for(const o of others){cands.push([o,x.it],[x.it,o])}if(others.length>1)for(const o of others)for(const q of others)if(o!==q)cands.push([o,q,x.it].slice(-ONLC.DRESS_W89));
    let best=null,bs=-1;for(const c of cands){if(c.length>ONLC.DRESS_W89||!c.includes(x.it))continue;const h=d89Hands(ch.cls,c,base);const inH=[h.R,h.L].filter(Boolean).map(z=>z.it);
      if(!c.every(y=>inH.includes(y)))continue;const side=h.R&&h.R.it===x.it?'R':'L';const s=(hand&&side===hand?10:0)+(side==='R'?1:0)+c.length*3;if(s>bs){bs=s;best=c}}
    fin=[...rest,...(best||[x.it])]}
  const off=eq.filter(y=>!fin.includes(y));return {equip:fin,take:x.from===ch.id?[]:[{item:x.it,from:x.from}],off,H}}
/* one short line: what it does for him (or why not) */
function d89Cmp(ch,x){const I=x.I;if(!ch)return {no:_T('Make a gladiator active first.')};if(I.st==='broken')return {no:_T('Broken — repair it first.')};
  if(I.named&&!ONLC.canWearNamed(ch))return {no:_T('Named pieces wait until Veteranus.')};
  const P=d89Plan(ch,x);if(!P.equip.includes(x.it))return {no:_T('It does not fit beside what he wears.')};
  const offN=P.off.map(y=>(ONL83.piece(ch,y)||{}).n).filter(Boolean);const rep=offN.length?_T` · replaces ${esc2(offN.join(', '))}`:'';
  if(I.kind==='a'){const A=I.named?I.w:(ARM[I.base]||{});const sl=A.slot;const locs=sl==='head'?['head']:sl==='chest'||sl==='belt'?['chest']:sl==='arm'?(A.pair?['rarm','larm']:['rarm']):sl==='leg'?(A.pair?['rleg','lleg']:['rleg']):[];
    const lost=P.off.reduce((a,y)=>{const J=ONL83.piece(ch,y);return a+(J&&J.kind==='a'?J.ap|0:0)},0);const d=(I.ap|0)-lost;const where=A.pair?(sl==='arm'?_T('each arm'):_T('each leg')):LOC89[locs[0]]||'';
    return {ok:_T`${d>=0?'+':''}${d} AP ${where}${rep}`}}
  const h=d89Hands(ch.cls,P.equip.filter(y=>(ONL83.piece(P.H,y)||{}).kind==='w'),y=>d89Base(ONL83.piece(P.H,y)));const side=h.R&&h.R.it===x.it?_T('Right hand'):_T('Left hand');
  const was=ONLC.equipOf(ch).filter(y=>(ONL83.piece(ch,y)||{}).kind==='w');const h0=d89Hands(ch.cls,was,y=>d89Base(ONL83.piece(ch,y)));const prev=h.R&&h.R.it===x.it?h0.R:h0.L;
  const kitRep=!offN.length&&prev&&prev.kit?_T` · replaces ${esc2((W[prev.k]||{}).n||prev.k)} (recruit kit)`:'';
  return {ok:`${side}${rep}${kitRep}`}}
/* what he would risk in Ranked: the value of what he brings (kept-home pieces stay) + his purse */
function d89Stake(c){let v=0;for(const it of ONLC.equipOf(c)){if(ONLC.isHome(c,it))continue;const I=ONL83.piece(c,it);if(I)v+=ONLC.valueOf(I)}return {gear:v,purse:c.wallet|0,all:v+(c.wallet|0)}}

/* ---------------- pieces as cards ---------------- */
const d89Art=(I,size)=>{const b=d89Base(I);const ref=(I.kind==='a'?'a:':'w:')+b;let h='';try{h=typeof cardHTML==='function'&&(I.kind==='a'?ARM[b]:W[b])?cardHTML(ref,size||'sm'):''}catch(e){}return (h||`<span class="art89x">${I.kind==='a'?'🛡':'⚔'}</span>`).replace(/ data-card="[^"]*"/g,'')};
function d89Tile(ch,x,i,busy){const I=x.I;const named=I.named;const col=named?ONL83.rarCol[I.rar]:'';const brk=I.st==='broken';const home=ONLC.isHome(x.h,x.it);const lock=x.from!=='house'&&busy.has(x.from);
  const C=d89Cmp(ch,x);const rc=ONLC.repairCost(I);
  return `<div class="pt89 ${brk?'brk89':''} ${C.no?'no89':''} ${named?'nm89':''} ${lock?'lk89':''}" data-p89="${i}" ${rc89(named&&col)} role="button" tabindex="0" aria-label="${esc2(I.n)}">
    <div class="pt89-art">${d89Art(I)}${brk?'<i class="crk89"></i>':''}</div>
    <b class="pt89-n">${esc2(I.n)}</b><small class="pt89-s">${named?`${esc2(ONLC.rarOf(I.rar).n)} · `:''}L${I.lv}${I.kind==='a'?_T` · ${I.ap|0} AP`:''}${x.from!=='house'?_T` · with ${esc2(x.h.name||'')}`:''}</small>
    <small class="cm89 ${C.no?'why':''}">${C.no?esc2(C.no):C.ok}</small>
    <span class="pt89-b">${brk?`<button type="button" class="rp89" data-d89rep="${i}" title="${_T`Repair: a third of its value`}">${_T`🔨 ${rc}`}</button>`:''}<button type="button" class="hm89 ${home?'on':''}" data-d89home="${i}" aria-pressed="${home}" title="${home?_T('Kept home — never brought into a Ranked match (click to bring it again)'):_T('Keep home: never bring it into a Ranked match')}">🔒</button></span></div>`}

/* ---------------- 1 · the banner ---------------- */
function d89Ledger(){const L=(ONL.domus||{}).led89;const T=(ONL.domus||{}).treasury|0;
  const IN=[['cut',_T('The 20% cut from bouts')],['gift',_T('Donativa (Flavius)')],['sale',_T('Sales (a full shelf)')],['refund',_T('Refunds')],['grant',_T('Tester grants')]];
  const OUT=[['gear',_T('Gear for the shelf')],['repair',_T('Repairs')],['class',_T('Class changes')],['upg',_T('Upgrades')]];
  const row=(l,v,neg)=>`<div class="lg89-r"><span>${l}</span><b class="${neg?'neg':''}">${neg?'−':''}${d89Coin(v)}</b></div>`;
  if(!L)return `<div class="lg89"><b class="lg89-h">${_T`🏛 The treasury · ${d89Coin(T)}`}</b><p class="rc-sub">${_T`The ledger starts with v0.89 — nothing booked yet.`}</p></div>`;
  const ins=IN.filter(([k])=>L.in[k]).map(([k,l])=>row(l,L.in[k])).join('')||`<p class="rc-sub">${_T`Nothing yet.`}</p>`;
  const outs=OUT.filter(([k])=>L.out[k]).map(([k,l])=>row(l,L.out[k],1)).join('')||`<p class="rc-sub">${_T`Nothing yet.`}</p>`;
  const by=(L.by||[]).length?L.by.map(b=>row(esc2(b.n||'?'),b.v)).join(''):`<p class="rc-sub">${_T`No bout paid the house yet.`}</p>`;
  return `<div class="lg89"><b class="lg89-h">${_T`🏛 The treasury · ${d89Coin(T)}`}</b><small class="rc-sub">${_T`Totals since v0.89 (${esc2(new Date(L.since||Date.now()).toLocaleDateString())}) — what came before is not known.`}</small>
    <div class="lg89-g"><div><div class="lg89-t">${_T`In`}</div>${ins}</div><div><div class="lg89-t">${_T`Out`}</div>${outs}</div><div><div class="lg89-t">${_T`Earned by gladiator`}</div>${by}</div></div></div>`}
function d89Fold(k,label,inner){return `<details class="fd89" data-fd89="${k}" ${V89D.open[k]?'open':''}><summary>${label}</summary><div class="fd89-in">${inner}</div></details>`}
function d89LookHTML(){const L=V89D.look||(V89D.look={...d89Look()});
  return `<div class="lk89"><div class="lk89-prev"><img src="${d89Crest(L)}" alt=""></div><div class="lk89-f"><label>${_T`Field`}<input type="color" data-lk89="c1" value="${esc2(L.c1)}"></label><label>${_T`Device`}<input type="color" data-lk89="c2" value="${esc2(L.c2)}"></label>
    <div class="lk89-g" role="radiogroup" aria-label="${_T`Crest`}">${ONLC.CREST89.map(s=>`<button type="button" class="${L.crest===s?'on':''}" data-crest89="${s}" aria-pressed="${L.crest===s}" title="${esc2(s)}"><img src="${d89Crest({...L,crest:s},'')}" alt=""></button>`).join('')}</div>
    <div class="acts"><button type="button" class="btn primary tksm" data-d89="look">${_T`💾 Fly these colours`}</button><small class="rc-sub">${_T`The printed banner devices only.`}</small></div></div></div>`}
function d89UpgHTML(){const D=ONL.domus||{};const U=D.upg89||{};const T=D.treasury|0;
  const row=(k,t,d)=>{const c=ONLC.UPG89[k].cost;const have=!!U[k];return `<div class="up89"><div><b>${t}</b><small class="rc-sub">${d}</small></div>${have?`<span class="badge gold">${_T`✓ Built`}</span>`:`<button type="button" class="btn tksm ${T>=c?'primary':''}" data-upg89="${k}" ${T<c?'disabled':''}>${_T`Build · ${d89Coin(c)}`}</button>`}</div>`};
  return `${row('slot5',_T('A fifth gladiator slot'),_T`Raise up to ${GLAD_BASE89+1} living gladiators.`)}${row('shelf',_T('A bigger offerings shelf'),_T`${ONLC.OFF_SHELF} → ${ONLC.OFF_SHELF+ONLC.UPG89.shelf.add} places.`)}<small class="rc-sub">${_T`Paid from the treasury · once each.`}</small>`}
function d89Banner(){const D=ONL.domus||{};const G=ONL82.dg||{};const L=d89Look();const glads=Math.max(D.glads|0,G.glads|0,(ONL.chars||[]).length);const Wh=onlW81();
  const rec=[[_T('Bouts'),D.bouts|0],[_T('Won'),D.wins|0],[_T('Survived'),D.survived|0],[_T('Fallen'),D.fallen|0],[_T('Fame'),`✦ ${D.fame|0}`],[_T('Lifetime CF'),`${Wh} ${D.lifeCF|0}`]];
  const tro=(G.trophies||[]).length;const since=D.founded?new Date(D.founded).toLocaleDateString():'';
  const folds=[d89Fold('look',_T('🎨 Colours & crest'),d89LookHTML()),d89Fold('pat',_T('👤 Patron'),typeof onlPatronHTML82==='function'?onlPatronHTML82():''),d89Fold('upg',_T('🏗 Upgrades'),d89UpgHTML())].join('');
  return `<div class="db89" style="--hc1:${esc2(L.c1)};--hc2:${esc2(L.c2)}">
    <div class="db89-top"><img class="db89-crest" src="${d89Crest(L)}" alt="">
      <div class="db89-ttl"><h3>${esc2(onlHouse82(D.name||''))}${D.test?' <i class="test83">TEST</i>':''}</h3><small>${since?_T`founded ${esc2(since)} · `:''}${_T`${glads} gladiator${glads===1?'':'s'} raised`}</small>
        <div class="db89-rec">${rec.map(([k,v])=>`<span><b>${v}</b> ${k}</span>`).join('')}</div></div>
      <div class="db89-side"><button type="button" class="btn tksm tr89b" data-d89="tro">${_T`🏆 Trophies`}${tro?` <b>${tro}</b>`:''}</button>${typeof onl83Chest==='function'?onl83Chest(36,'dom'):''}
        <div class="db89-tre" data-d89="led" role="button" tabindex="0" aria-label="${_T`The treasury ledger`}"><small>${_T`Treasury`} <i class="ld89i">ⓘ</i></small><b>${d89Coin(D.treasury)}</b></div></div></div>
    ${glads>0?'':`<div class="dom82-row db89-ren"><input class="tin" id="dom82Ren" maxlength="${ONLC.DOMUS_MAX}" value="${esc2(D.name||'')}"><button type="button" class="btn tksm" data-onl82="drename">${_T`✎ Rename`}</button><button type="button" class="btn tksm" data-onl82="dnew">${_T`🏛 Found a new house`}</button><small class="rc-sub">${_T`Only until your first gladiator.`}</small></div>`}
    <div class="db89-folds">${folds}${typeof onl83Tester==='function'?onl83Tester():''}</div></div>`}

/* ---------------- 2 · the showcase ---------------- */
function d89Hand(ch,x,side,busy){const lbl=side==='R'?_T('Right hand - Primary'):_T('Left hand - Secondary');
  if(!x)return `<div class="wp89 empty dz89" data-dz89="w${side}"><div class="wp89-c"><span>${_T`Empty hand`}</span></div><small>${lbl}</small></div>`;
  const I=x.it?ONL83.piece(ch,x.it):null;const named=I&&I.named;const nm=named?I.n:(W[x.k]||{}).n||x.k;const col=named?ONL83.rarCol[I.rar]:'';const home=I&&ONLC.isHome(ch,x.it);
  return `<div class="wp89 dz89 ${named?'nm89':''} ${x.kit?'kit':''}" data-dz89="w${side}" ${rc89(col)}>
    <div class="wp89-c ${x.kit?'':'off89'}" ${x.kit?'':`data-d89off="${esc2(x.it)}" role="button" tabindex="0" title="${_T`Take it off (to the shelf)`}"`}>${typeof cardHTML==='function'?cardHTML('w:'+x.k,'md').replace(/ data-card="[^"]*"/g,''):''}</div>
    <small>${lbl} · <b>${esc2(nm)}</b>${x.kit?_T(' <i>recruit kit</i>'):named?` <i>${esc2(ONLC.rarOf(I.rar).n)}</i>`:''}${home?` <i class="hm89i" title="${_T`Kept home in Ranked`}">🔒</i>`:''}</small></div>`}
function d89Worn(ch){const out=[];for(const it of ONLC.equipOf(ch)){const I=ONL83.piece(ch,it);if(I&&I.kind==='a')out.push({it,I})}
  return out.map(({it,I})=>{const home=ONLC.isHome(ch,it);return `<span class="wr89 ${I.named?'nm89':''}" ${rc89(I.named&&ONL83.rarCol[I.rar])}><span class="wr89-p" data-d89off="${esc2(it)}" role="button" tabindex="0" title="${_T`${esc2(I.n)} · ${I.ap|0} AP — take it off`}">${d89Art(I,'sm')}<b>${esc2(I.n)}</b></span><button type="button" class="hm89 ${home?'on':''}" data-d89homew="${esc2(it)}" aria-pressed="${home}" title="${home?_T('Kept home in Ranked'):_T('Keep home: never bring it into a Ranked match')}">🔒</button></span>`}).join('')}
function d89Satchel(ch){const offs=ch.offers||[];const br=ONLC.offersBrought(ch).slice();
  const toks=offs.map((k,i)=>{const j=br.indexOf(k);const on=j>=0;if(on)br.splice(j,1);return `<span class="so89 ${on?'br':''}"><span class="so89-t" data-d89so="${i}" role="button" tabindex="0" title="${_T`${esc2(OFF83N(k))} — back to the shelf`}">${offTok83(k,30)}</span><button type="button" class="so89-s" data-d89br="${i}" aria-pressed="${on}" title="${on?_T('Brought into the next match'):_T`Bring it (at most ${ONLC.OFF_CARRY})`}">★</button></span>`}).join('');
  return `<div class="sat89 dz89" data-dz89="sat"><small class="sat89-h">${_T`🧪 On him · ${offs.length}/${ONLC.OFF_MAX} · ★ brought (max ${ONLC.OFF_CARRY})`}</small><div class="sat89-r">${toks||`<small class="rc-sub">${_T`No offerings — drag one from the shelf.`}</small>`}</div></div>`}
function d89Kits(ch){const K=ch.kits89||[];
  return `<div class="kt89"><small class="kt89-h">${_T`Loadouts`}</small>${K.map((k,i)=>`<span class="kt89-c"><button type="button" class="btn tksm" data-d89kit="${i}" title="${_T`Wear this loadout`}">▶ ${esc2(k.n)} <small>${k.items.length}</small></button><button type="button" class="kt89-x" data-d89kx="${i}" aria-label="${_T`Forget this loadout`}">✕</button></span>`).join('')}
    ${K.length<ONLC.KITS_MAX89?`<button type="button" class="btn tksm" data-d89="kitsave">${_T`💾 Save what he wears`}</button>`:''}</div>`}
function d89Show(ch,busy){if(!ch)return `<div class="sc89 none"><p class="rc-sub">${_T`No gladiator yet — choose an empty slot below to raise one.`}</p></div>`;
  const lock=busy.has(ch.id);let av='';try{av=avatarSVG(avatarFor73(dom88Armor(ch),'dom89_'+ch.id))}catch(e){console.error(e)}
  const pcOf=it=>d89Base(ONL83.piece(ch,it));const ws=ONLC.equipOf(ch).filter(it=>(ONL83.piece(ch,it)||{}).kind==='w');const h=d89Hands(ch.cls,ws,pcOf);
  const imm=typeof onlImmortalis88==='function'&&onlImmortalis88(ch);const Rk=ONLC.rankFor(ch);const N=ONLC.nextRank(ch);const st=d89Stake(ch);
  const rec=[[_T('Bouts'),ch.bouts|0],[_T('Wins'),ch.wins|0],[_T('Survived'),ch.survived|0],[_T('Lifetime CF'),cfAmt87(ch.lifeCF|0)],[_T('Glory'),`✦ ${Math.round(ONLC.gloryOf(ch))}`]];
  return `<div class="sc89 ${imm?'imm88':''} ${lock?'lk89':''}" data-sc89="${esc2(ch.id)}">
    <div class="sc89-wp">${d89Hand(ch,h.R,'R',busy)}${d89Hand(ch,h.L,'L',busy)}</div>
    <div class="sc89-av"><div class="av89 dz89" data-dz89="av" title="${_T`Drop armor here`}">${av}</div><div class="wr89-l">${d89Worn(ch)||`<small class="rc-sub">${_T`No armor — click or drag a piece from the bar.`}</small>`}</div></div>
    <div class="sc89-info"><div class="sc89-n">${esc2(ch.name)} <button type="button" class="ic89" data-d89="ren" aria-label="${_T`Rename`}">✎</button></div>${imm&&typeof imm88Chip==='function'?imm88Chip():''}
      <div class="sc89-sub">${esc2((CLASSES[ch.cls]||{}).name||'')} <button type="button" class="btn tksm" data-d89="cls" title="${_T`Change class: ${ONLC.CLASS_FEE89} coin from the treasury`}">${_T`🔄 Class · ${d89Coin(ONLC.CLASS_FEE89)}`}</button> ${onlRankChip(Rk.k)}</div>
      <small class="rc-sub">${N?_T`Next: ${esc2(N.n)} at ${N.glory} Glory`:_T('The highest rank')}</small>
      <div class="sc89-rec">${rec.map(([k,v])=>`<div><b>${v}</b><small>${k}</small></div>`).join('')}</div>
      <div class="sc89-mon"><div class="mon89"><small>${_T`Purse`}</small><b>${d89Coin(ch.wallet)}</b><i>${_T`his own coin — lost at death`}</i></div>
        <div class="mon89 stk89 ${st.all>=STAKE_HIGH89?'hi89':''}"><small>${_T`At stake in Ranked`}</small><b>${d89Coin(st.all)}</b><i>${_T`gear ${st.gear} + purse ${st.purse}`}</i></div></div>
      ${d89Satchel(ch)}${d89Kits(ch)}
      ${lock?`<p class="onl-busy">${_T`⏳ In a game — his gear waits until it is over.`}</p>`:''}</div></div>`}

/* ---------------- 3 · the equipment bar ---------------- */
function d89BarHTML(ch,busy){const tab=V89D.tab==='offs'?'offs':'gear';const B=d89Bar();V89D.bar=B;const sh=d89Shelf();const D=ONL.domus||{};const smax=D.smax||ONLC.shelfMax(D);
  const tb=(k,l)=>`<button type="button" role="tab" data-eb89="${k}" class="${tab===k?'on':''}" aria-selected="${tab===k}">${l}</button>`;
  const gear=B.length?B.map((x,i)=>d89Tile(ch,x,i,busy)).join(''):`<p class="rc-sub eb89-e">${_T`Nothing in the house — the Armory sells, Flavius’s Donativa, the fallen leave their gear here.`}</p>`;
  const offs=(sh.offers||[]).map((k,i)=>`<span class="of89" data-d89of="${i}" role="button" tabindex="0" title="${esc2(OFF83N(k))}">${offTok83(k,40)}<small>${esc2((OFFER[k]||{}).n||k)}</small></span>`).join('')||`<p class="rc-sub eb89-e">${_T`The shelf is empty — the Armory sells offerings.`}</p>`;
  return `<div class="eb89 dz89" data-dz89="bar"><div class="eb89-tabs" role="tablist">${tb('gear',_T`⚔ Gear <small>${B.length}</small>`)}${tb('offs',_T`🧪 Offerings <small>${(sh.offers||[]).length}/${smax}</small>`)}
     <small class="rc-sub eb89-hint">${ch?_T`Click a piece to put it on ${esc2(ch.name)} — or drag it onto him. Drag what he wears back here to take it off.`:_T`The house’s gear waits here for a gladiator.`}</small></div>
    <div class="eb89-row" data-eb89p="gear" ${tab==='gear'?'':'hidden'}>${gear}</div><div class="eb89-row offs" data-eb89p="offs" ${tab==='offs'?'':'hidden'}>${offs}</div></div>`}

/* ---------------- 4 · the gladiator cards ---------------- */
function d89Cards(live,busy){const act=ONL.char&&ONL.char.id;const D=ONL.domus||{};const max=D.gmax||ONLC.gladMax(D);const anyBusy=typeof onlBusy==='function'&&!!onlBusy();
  const card=c=>{const on=c.id===act;const imm=typeof onlImmortalis88==='function'&&onlImmortalis88(c);const st=d89Stake(c);let av='';try{av=avatarSVG(avatarFor73(dom88Armor(c),'gc89_'+c.id))}catch(e){}
    const ws=ONLC.equipOf(c).filter(it=>(ONL83.piece(c,it)||{}).kind==='w');const h=d89Hands(c.cls,ws,it=>d89Base(ONL83.piece(c,it)));const wn=[h.R,h.L].filter(Boolean).map(x=>{const I=x.it&&ONL83.piece(c,x.it);return esc2(I&&I.named?I.n:(W[x.k]||{}).n||x.k)});
    return `<button type="button" class="gc89 ${on?'act':''} ${imm?'imm88':''} ${st.all>=STAKE_HIGH89?'hi89':''}" data-onl="${on?'gpick':'gact'}" data-v="${esc2(c.id)}" ${!on&&anyBusy?_T`disabled title="In a game — switch when it is over"`:''}>
      <span class="gc89-av">${av}</span><span class="gc89-b"><b>${esc2(c.name)}</b>${imm&&typeof imm88Chip==='function'?imm88Chip():''}<small>${esc2((CLASSES[c.cls]||{}).name||'')} · ${onlRankChip(ONLC.rankFor(c).k)}</small>
      <small class="gc89-w">⚔ ${wn.join(' · ')||_T('bare hands')}</small><small>${_T`Purse ${d89Coin(c.wallet)}`}</small><small class="gc89-s">${_T`Stake ${d89Coin(st.all)}`}</small>${busy.has(c.id)?_T('<small class="lk89t">🔒 In a match</small>'):''}
      ${on?_T('<span class="badge gold">⚔ Active</span>'):''}</span></button>`};
  const empty=Array.from({length:Math.max(0,max-live.length)},()=>`<button type="button" class="gc89 empty" data-onl="gnew">${_T`<span class="gc89-plus">＋</span><b>New gladiator</b><small>starts as a Tiro</small>`}</button>`).join('');
  const lockd=!(D.upg89||{}).slot5&&live.length>=max?`<button type="button" class="gc89 empty up" data-d89="upg">${_T`<span class="gc89-plus">🔒</span><b>A fifth slot</b><small>${d89Coin(ONLC.UPG89.slot5.cost)} from the treasury</small>`}</button>`:'';
  return `<div class="gc89-row" style="--n:${Math.max(max,live.length)+(lockd?1:0)}">${live.map(card).join('')}${empty}${lockd}</div>`}

/* ---------------- 5 · the memorial wall ---------------- */
function d89Memo(){const G=ONL82.dg||{};const memo=(G.memo||[]).slice();const seen=new Set(memo.map(m=>m.id));
  for(const c of (ONL.chars||[]))if(!c.alive&&!seen.has(c.id))memo.push({id:c.id,name:c.name,cls:c.cls,rank:(c.died&&c.died.rank)||ONLC.rankFor(c).k,at:(c.died&&c.died.at)||0,old:1});
  if(!memo.length)return '';
  const by=b=>{if(!b)return '';if(b.k==='g')return b.n?_T`slain by ${esc2(b.n)}`:_T('slain by a CPU gladiator');return {b:_T('taken by a beast'),a:_T('killed by the arena'),r:_T('retired'),abandon:_T('abandoned the sand — Damnatio'),fate:_T('the Fate took him')}[b.k]||''};
  return `<div class="mw89"><div class="mw89-h">${_T`🕯 Memorial wall <small class="rc-sub">every fallen gladiator of the house · ${memo.length}</small>`}</div><div class="mw89-r">${memo.map(m=>`<div class="pq89"><span class="pq89-m">${m.fa==='c'?'✝':'D·M'}</span><b>${esc2(m.name)}</b><small>${esc2((CLASSES[m.cls]||{}).name||'')} · ${onlRankChip(m.rank||'tiro')}</small>
    <small>${m.old?_T('fell before v0.89'):`${esc2(onlEvName(m.ev||''))}${m.loc?_T` at ${esc2(onlCityName(m.loc))}`:''}${m.at?` · ${esc2(new Date(m.at).toLocaleDateString())}`:''}`}</small>${m.by?`<small class="pq89-b">${by(m.by)}</small>`:''}</div>`).join('')}</div></div>`}

/* ---------------- the Domus ---------------- */
function d89HTML(){if(typeof onlDomusLoad82==='function')onlDomusLoad82();const live=d89Live();const ch=d89Act()||null;const busy=d89Busy();const D=ONL.domus||{};
  const anyBusy=typeof onlBusy==='function'?onlBusy():null;
  return `<div class="dom82-wrap d89w"><div class="dom82-main dom89" style="--hc1:${esc2(d89Look().c1)};--hc2:${esc2(d89Look().c2)}">${d89Banner()}
    ${ONL82.ferr?`<p class="onl-err">${esc2(ONL82.ferr)}</p>`:''}${anyBusy?`<p class="onl-busy">${_T`⏳ In a game (${esc2(onlEvName(anyBusy.ev))}) — the Domus waits until it is over.`}</p>`:''}
    ${d89Show(ch,busy)}${d89BarHTML(ch,busy)}${d89Cards(live,busy)}${d89Memo()}</div>${typeof onlRankBar82==='function'?onlRankBar82():''}</div>`}
{const base=onlCharHTML;onlCharHTML=function(){if(!ONL.acct||(typeof onlIsGuest82==='function'&&onlIsGuest82())||ONL.needDomus||!ONL.domus)return base.apply(this,arguments);
  try{return d89HTML()}catch(e){console.error(e);return base.apply(this,arguments)}}}
/* the creator popup over the Domus follows the house's cap (156 reads ONLC.GLAD_MAX) */
{const base=onlHTML;onlHTML=function(){const g=ONLC.GLAD_MAX;try{ONLC.GLAD_MAX=ONLC.gladMax(ONL.domus||{});return base.apply(this,arguments)}finally{ONLC.GLAD_MAX=g}}}

/* ---------------- actions ---------------- */
function d89Put(r){if(!r)return;if(r.char&&r.char.id)onl83Put(r.char);for(const c of r.from||[])if(c&&c.id)onl83Put(c);if(r.holder&&r.holder.cls)onl83Put(r.holder);
  if(r.domus&&r.domus.id){ONL.domus=r.domus;if(ONL82.dg)ONL82.dg.domus=r.domus}
  if(ONL82.dg){if(r.gear)ONL82.dg.gear=r.gear;if(r.pcs)ONL82.dg.pcs=r.pcs;if(r.holder&&r.holder.house){ONL82.dg.gear=r.holder.gear;ONL82.dg.pcs=r.holder.pcs}}}
const d89Err=e=>{onlToast80('⚠ '+esc2(e&&e.message||e))};
function d89Wear(x,hand){const ch=d89Act();if(!ch||!x)return;const C=d89Cmp(ch,x);if(C.no)return d89Err(C.no);if(d89Busy().has(ch.id)||(x.from!=='house'&&d89Busy().has(x.from)))return d89Err(_T('In a match — the storeroom waits.'));
  const P=d89Plan(ch,x,hand);return onlDo(async()=>{const r=await NET.req('domus.dress',{char:ch.id,equip:P.equip,take:P.take});d89Put(r);onlToast80(_T`🛡 ${esc2(ch.name)} wears ${esc2(x.I.n)}.`)})}
function d89Off(it){const ch=d89Act();if(!ch)return;if(d89Busy().has(ch.id))return d89Err(_T('In a match — the storeroom waits.'));const I=ONL83.piece(ch,it);
  const eq=ONLC.equipOf(ch).filter(y=>y!==it);return onlDo(async()=>{const r=await NET.req('domus.dress',{char:ch.id,equip:eq,take:[]});d89Put(r);onlToast80(_T`🗄 ${esc2((I&&I.n)||it)} → the shelf.`)})}
function d89Offer(from,to,key){return onlDo(async()=>{const r=await NET.req('offer.move',{key,from,to});for(const s of [r.from,r.to])if(s&&s.cls)onl83Put(s);else if(s&&s.house&&ONL82.dg)ONL82.dg.offers=s.offers;if(r.domus)ONL.domus=r.domus;onlToast80(_T`🧪 ${esc2(OFF83N(key))} moved.`)})}
function d89Repair(x){const I=x.I;const cost=ONLC.repairCost(I);const T=(ONL.domus||{}).treasury|0;const ch=d89Act();
  const pay=T>=cost?'treasury':x.from!=='house'&&(x.h.wallet|0)>=cost?x.from:ch&&(ch.wallet|0)>=cost?ch.id:null;if(!pay)return d89Err(_T`The repair costs ${cost} coin — neither the treasury nor a purse can pay.`);
  return onlDo(async()=>{const r=await NET.req('gear.repair',{holder:x.from,item:x.it,pay});d89Put(r);if(r.payer)onl83Put(r.payer);ONL82.dgAt=0;onlToast80(_T`🔨 ${esc2(I.n)} is whole again (${coinAmt87(r.cost)}).`)})}
function d89Home(holder,it){const H=holder==='house'?d89Shelf():onl83Holder(holder);const on=!ONLC.isHome(H,it);
  return onlDo(async()=>{const r=await NET.req('gear.home',{holder,item:it,on});d89Put(r);onlToast80(on?_T('🔒 Kept home — never brought into a Ranked match.'):_T('🔓 It goes into Ranked matches again.'))})}
function d89ClassPop(){const ch=d89Act();if(!ch)return;const T=(ONL.domus||{}).treasury|0;const fee=ONLC.CLASS_FEE89;
  const bg=onl83Pop('cls89pop',`<h3 class="pop83h">${_T`🔄 A new class for ${esc2(ch.name)}`}</h3><p>${_T`${d89Coin(fee)} from the treasury (${d89Coin(T)}). His gear stays his; the recruit kit follows the new class. His look stays.`}</p>
    <div class="cl89-g">${ONLC.CLASSES8.map(k=>`<button type="button" class="cl89 ${k===ch.cls?'on':''}" data-cls89="${k}" ${k===ch.cls||T<fee?'disabled':''}>${typeof cardHTML==='function'?cardHTML('k:'+k,'sm').replace(/ data-card="[^"]*"/g,''):''}<span>${esc2(CLASSES[k].name)}</span></button>`).join('')}</div>
    <div class="acts"><button type="button" class="btn" data-cls89="x">${_T`Not now`}</button></div>`);
  bg.addEventListener('click',e=>{const b=e.target.closest('[data-cls89]');if(!b||b.disabled)return;const k=b.dataset.cls89;bg.remove();if(k==='x')return;
    onlDo(async()=>{const r=await NET.req('char.class',{char:ch.id,cls:k});d89Put(r);onlToast80(_T`🔄 ${esc2(ch.name)} is now ${esc2(CLASSES[k].name)}.`)})})}
function d89Ask(cls,title,label,val,max,fn){const bg=onl83Pop(cls,`<h3 class="pop83h">${title}</h3><label class="ask89">${label}<input class="tin" id="ask89i" maxlength="${max}" value="${esc2(val||'')}"></label>
    <div class="acts"><button type="button" class="btn primary" data-ask89="ok">${_T`💾 Save`}</button><button type="button" class="btn" data-ask89="x">${_T`Cancel`}</button></div>`);
  const go=()=>{const v=(document.getElementById('ask89i')||{}).value||'';bg.remove();fn(v.trim())};
  bg.addEventListener('click',e=>{const b=e.target.closest('[data-ask89]');if(!b)return;if(b.dataset.ask89==='x'){bg.remove();return}go()});
  bg.addEventListener('keydown',e=>{if(e.key==='Enter')go()});setTimeout(()=>{const i=document.getElementById('ask89i');if(i){i.focus();i.select()}},30)}
const WHY89={broken:_T('broken'),gone:_T('gone'),veteranus:_T('waits until Veteranus')};
function d89KitApply(i){const ch=d89Act();if(!ch)return;if(d89Busy().has(ch.id))return d89Err(_T('In a match — the storeroom waits.'));
  return onlDo(async()=>{const r=await NET.req('char.kitapply',{char:ch.id,i});d89Put(r);const sk=(r.skipped||[]).map(s=>`${esc2(s.n)} (${/^with:/.test(s.why)?_T`with ${esc2(s.why.slice(5))}`:WHY89[s.why]||esc2(s.why)})`);
    onlToast80(_T`▶ ${esc2(ch.name)} wears “${esc2(r.kit||'')}”.`+(sk.length?_T` Left out: ${sk.join(', ')}.`:''))})}
/* the ledger ⓘ: hover shows it, a click pins it */
function d89LedShow(el,pin){let f=document.getElementById('led89');if(!f){f=document.createElement('div');f.id='led89';f.className='led89f';document.body.appendChild(f)}
  f.innerHTML=d89Ledger();f.hidden=false;V89D.pin=!!pin||V89D.pin;const r=el.getBoundingClientRect();const w=Math.min(520,window.innerWidth-16);f.style.width=w+'px';
  f.style.left=Math.max(8,Math.min(window.innerWidth-w-8,r.right-w))+'px';f.style.top=Math.min(window.innerHeight-60,r.bottom+6)+'px';
  const b=f.getBoundingClientRect();if(b.bottom>window.innerHeight-6)f.style.top=Math.max(6,r.top-b.height-6)+'px'}
const d89LedHide=force=>{const f=document.getElementById('led89');if(f&&(force||!V89D.pin)){f.hidden=true;if(force)V89D.pin=false}};
document.addEventListener('mouseover',e=>{const t=e.target.closest&&e.target.closest('#onl [data-d89="led"]');if(t)d89LedShow(t);else if(!(e.target.closest&&e.target.closest('#led89')))d89LedHide()});

document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;
  if(!t.closest('#led89')&&!t.closest('[data-d89="led"]'))d89LedHide(true);
  if(!t.closest('#onl'))return;if(Date.now()-V89D.noClick<350){if(t.closest('.dom89')){e.preventDefault();e.stopPropagation()}return}
  const B=V89D.bar||[];let b;
  if((b=t.closest('[data-d89rep]'))){e.stopPropagation();return d89Repair(B[+b.dataset.d89rep])}
  if((b=t.closest('[data-d89home]'))){e.stopPropagation();const x=B[+b.dataset.d89home];if(x)return d89Home(x.from,x.it);return}
  if((b=t.closest('[data-d89homew]'))){e.stopPropagation();const ch=d89Act();if(ch)return d89Home(ch.id,b.dataset.d89homew);return}
  if((b=t.closest('[data-p89]'))){const x=B[+b.dataset.p89];if(x)return d89Wear(x,null);return}
  if((b=t.closest('[data-d89off]'))){return d89Off(b.dataset.d89off)}
  if((b=t.closest('[data-d89of]'))){const ch=d89Act();const k=(d89Shelf().offers||[])[+b.dataset.d89of];if(ch&&k)return d89Offer('house',ch.id,k);return}
  if((b=t.closest('[data-d89so]'))){const ch=d89Act();const k=ch&&(ch.offers||[])[+b.dataset.d89so];if(k)return d89Offer(ch.id,'house',k);return}
  if((b=t.closest('[data-d89br]'))){const ch=d89Act();if(!ch)return;const i=+b.dataset.d89br;const k=(ch.offers||[])[i];if(!k)return;const offs=ch.offers||[];
    const cur=ONLC.offersBrought(ch).slice();const tagged=[];{const left=cur.slice();offs.forEach((x,j)=>{const q=left.indexOf(x);if(q>=0){left.splice(q,1);tagged.push(j)}})}
    let keys;if(tagged.includes(i)){const left=cur.slice();left.splice(left.indexOf(k),1);keys=left}else{if(cur.length>=ONLC.OFF_CARRY)return d89Err(_T`At most ${ONLC.OFF_CARRY} offerings go into a match.`);keys=[...cur,k]}
    return onlDo(async()=>{onl83Put(await NET.req('offer.bring',{char:ch.id,keys}))})}
  if((b=t.closest('[data-eb89]'))){const k=b.dataset.eb89;V89D.tab=k;try{localStorage.setItem('flavius_dombar89',k)}catch(err){}const box=b.closest('.eb89');if(box){for(const x of box.querySelectorAll('[data-eb89]')){x.classList.toggle('on',x===b);x.setAttribute('aria-selected',String(x===b))}for(const p of box.querySelectorAll('[data-eb89p]'))p.hidden=p.dataset.eb89p!==k}return}
  if((b=t.closest('[data-d89kit]'))){return d89KitApply(+b.dataset.d89kit)}
  if((b=t.closest('[data-d89kx]'))){const ch=d89Act();if(!ch)return;const K=(ch.kits89||[]).filter((x,i)=>i!==+b.dataset.d89kx);return onlDo(async()=>{d89Put(await NET.req('char.kits',{char:ch.id,kits:K}))})}
  if((b=t.closest('[data-crest89]'))){V89D.look={...(V89D.look||d89Look()),crest:b.dataset.crest89};onlRedraw();return}
  if((b=t.closest('[data-upg89]'))){const k=b.dataset.upg89;return onlDo(async()=>{const r=await NET.req('domus.upgrade',{k});d89Put(r);onlToast80(k==='slot5'?_T('🏗 A fifth gladiator slot is built.'):_T('🏗 The offerings shelf is bigger.'))})}
  if((b=t.closest('[data-d89]'))){const a=b.dataset.d89;const ch=d89Act();
    if(a==='led'){return d89LedShow(b,true)}
    if(a==='tro'){const G=ONL82.dg||{};onl83Pop('tr89pop',`${typeof onl83Trophies==='function'?onl83Trophies(G.trophies):''}<div class="acts"><button type="button" class="btn" onclick="this.closest('.pop83').remove()">${_T`Close`}</button></div>`);return}
    if(a==='cls')return d89ClassPop();
    if(a==='upg'){V89D.open.upg=true;onlRedraw();const u=document.querySelector('#onl [data-fd89="upg"]');if(u)u.scrollIntoView({block:'nearest'});return}
    if(a==='ren'&&ch)return d89Ask('ren89pop',_T`✎ Rename ${esc2(ch.name)}`,_T('Name'),ch.name,24,v=>{if(!v||v===ch.name)return;onlDo(async()=>{d89Put({char:await NET.req('char.edit',{char:ch.id,name:v})});onlToast80(_T`✎ Now <b>${esc2(v)}</b>.`)})});
    if(a==='kitsave'&&ch)return d89Ask('kit89pop',_T('💾 Save what he wears'),_T('Loadout name'),[_T('Ranked'),_T('Ludi Infames'),_T('Custom')][(ch.kits89||[]).length]||'',20,v=>{if(!v)return;
      const K=[...(ch.kits89||[]),{n:v,items:ONLC.equipOf(ch)}];onlDo(async()=>{d89Put(await NET.req('char.kits',{char:ch.id,kits:K}));onlToast80(_T`💾 Loadout “${esc2(v)}” saved.`)})});
    if(a==='look'){const L=V89D.look||d89Look();return onlDo(async()=>{const r=await NET.req('domus.look',{c1:L.c1,c2:L.c2,crest:L.crest});d89Put(r);V89D.look=null;onlToast80(_T('🎨 The house flies its colours.'))})}}});
document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const t=e.target;if(!t||!t.closest||!t.closest('#onl .dom89'))return;if(t.matches('[role="button"]')){e.preventDefault();t.click()}});
document.addEventListener('input',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.lk89)return;V89D.look={...(V89D.look||d89Look()),[t.dataset.lk89]:t.value};const p=document.querySelector('#onl .lk89-prev img');if(p)p.src=d89Crest(V89D.look);
  for(const b of document.querySelectorAll('#onl [data-crest89] img'))b.src=d89Crest({...V89D.look,crest:b.parentElement.dataset.crest89},'')});
document.addEventListener('toggle',e=>{const t=e.target;if(t&&t.dataset&&t.dataset.fd89){V89D.open[t.dataset.fd89]=t.open;if(t.open)for(const o of document.querySelectorAll('#onl [data-fd89]'))if(o!==t&&o.open)o.open=false}},true);

/* ---------------- drag and drop (pointer events: mouse, pen and touch) ---------------- */
function d89DragSrc(el){const B=V89D.bar||[];let x;
  if((x=el.closest('[data-p89]')))return {k:'piece',x:B[+x.dataset.p89],el:x};
  if((x=el.closest('[data-d89off]')))return {k:'worn',it:x.dataset.d89off,el:x};
  if((x=el.closest('[data-d89of]')))return {k:'shelfoff',i:+x.dataset.d89of,el:x};
  if((x=el.closest('[data-d89so]')))return {k:'satoff',i:+x.dataset.d89so,el:x};return null}
const d89Fits=(src,dz)=>{if(!src||!dz)return false;const z=dz.dataset.dz89;
  if(src.k==='piece')return src.x&&(src.x.I.kind==='a'?z==='av':z==='av'||z==='wR'||z==='wL');if(src.k==='worn')return z==='bar';if(src.k==='shelfoff')return z==='sat'||z==='av';if(src.k==='satoff')return z==='bar';return false};
document.addEventListener('pointerdown',e=>{if(e.button!==0)return;const t=e.target;if(!t||!t.closest||!t.closest('#onl .dom89')||t.closest('button'))return;const src=d89DragSrc(t);if(!src)return;
  V89D.drag={src,x0:e.clientX,y0:e.clientY,on:false,id:e.pointerId}},true);
document.addEventListener('pointermove',e=>{const D=V89D.drag;if(!D||e.pointerId!==D.id)return;
  if(!D.on){if(Math.hypot(e.clientX-D.x0,e.clientY-D.y0)<7)return;D.on=true;const g=document.createElement('div');g.className='gh89';const art=D.src.el.querySelector('.pt89-art,.wp89-c,.wr89-p,.so89-t')||D.src.el;g.innerHTML=art.innerHTML;document.body.appendChild(g);D.g=g;
    document.body.classList.add('drag89');for(const z of document.querySelectorAll('#onl [data-dz89]'))z.classList.toggle('ok89',d89Fits(D.src,z));try{D.src.el.setPointerCapture&&D.src.el.releasePointerCapture&&D.src.el.releasePointerCapture(e.pointerId)}catch(err){}}
  if(D.g){D.g.style.left=e.clientX+'px';D.g.style.top=e.clientY+'px'}const el=document.elementFromPoint(e.clientX,e.clientY);const z=el&&el.closest&&el.closest('#onl [data-dz89]');
  for(const y of document.querySelectorAll('#onl .hov89'))if(y!==z)y.classList.remove('hov89');if(z&&d89Fits(D.src,z))z.classList.add('hov89');if(e.cancelable)e.preventDefault()},{passive:false});
function d89DragEnd(e,drop){const D=V89D.drag;if(!D||(e&&e.pointerId!==D.id))return;V89D.drag=null;if(D.g)D.g.remove();document.body.classList.remove('drag89');
  for(const z of document.querySelectorAll('#onl .ok89,#onl .hov89'))z.classList.remove('ok89','hov89');if(!D.on||!drop)return;V89D.noClick=Date.now();
  const el=document.elementFromPoint(e.clientX,e.clientY);const z=el&&el.closest&&el.closest('#onl [data-dz89]');if(!z||!d89Fits(D.src,z))return;const zk=z.dataset.dz89;const ch=d89Act();
  if(D.src.k==='piece')return d89Wear(D.src.x,zk==='wR'?'R':zk==='wL'?'L':null);
  if(D.src.k==='worn')return d89Off(D.src.it);
  if(D.src.k==='shelfoff'&&ch){const k=(d89Shelf().offers||[])[D.src.i];if(k)return d89Offer('house',ch.id,k)}
  if(D.src.k==='satoff'&&ch){const k=(ch.offers||[])[D.src.i];if(k)return d89Offer(ch.id,'house',k)}}
document.addEventListener('pointerup',e=>d89DragEnd(e,true),true);document.addEventListener('pointercancel',e=>d89DragEnd(e,false),true);

/* ---------------- the hover card: the piece large + what it does for him ---------------- */
document.addEventListener('mouseover',e=>{const t=e.target.closest&&e.target.closest('#onl .dom89 [data-p89]');let f=document.getElementById('cmp89');
  if(!t||V89D.drag){if(f)f.hidden=true;return}const x=(V89D.bar||[])[+t.dataset.p89];const ch=d89Act();if(!x)return;if(!f){f=document.createElement('div');f.id='cmp89';f.className='cmp89';document.body.appendChild(f)}
  const I=x.I;const C=d89Cmp(ch,x);const Wd=I.kind==='w'?(I.named?I.w:(W[I.base]||{})):null;const A=I.kind==='a'?(I.named?I.w:(ARM[I.base]||{})):null;
  f.innerHTML=`<div class="cmp89-art">${I.named&&typeof nw83Card==='function'&&I.kind==='w'?nw83Card(I,{sm:1}):d89Art(I,'md')}</div><div class="cmp89-b"><b>${esc2(I.n)}</b>
    <small>${I.named?`${esc2(ONLC.rarOf(I.rar).n)} · `:''}${_T`Level ${I.lv}`}${A?_T` · ${I.ap|0} AP · ${esc2(A.slot||'')}${A.pair?_T(' (a pair)'):''}`:''}${Wd&&Wd.p!=null?_T` · power ${Wd.p} · range ${Wd.r}`:''} · ${_T`value ${d89Coin(ONLC.valueOf(I))}`}</small>
    <p class="${C.no?'why':'ok'}">${C.no?'⛔ '+esc2(C.no):_T`✓ Fits ${esc2(ch?ch.name:'')}: ${C.ok}`}</p>${I.st==='broken'?_T`<small>💔 Broken — 🔨 ${ONLC.repairCost(I)} to repair</small>`:''}${ONLC.isHome(x.h,x.it)?_T('<small>🔒 Kept home in Ranked</small>'):''}</div>`;
  f.hidden=false;const r=t.getBoundingClientRect();const w=300;f.style.left=Math.max(6,Math.min(window.innerWidth-w-6,r.left+r.width/2-w/2))+'px';f.style.top=Math.max(6,r.top-8-f.offsetHeight)+'px'});

/* ---------------- the look ---------------- */
{const st=document.createElement('style');st.id='dom89css';st.textContent=`
#onl .dom89{--hc1:#7a2230;--hc2:#d6ab4c;display:grid;grid-template-columns:minmax(0,1fr);gap:8px;min-width:0}#onl .dom89>*{min-width:0}#onl .d89w{overflow-x:clip}
#onl .db89{border:2px solid var(--hc2);border-radius:14px;padding:8px 12px;background:linear-gradient(100deg,color-mix(in srgb,var(--hc1) 70%,#120c06) 0%,#1d150c 62%,#15100a 100%);box-shadow:0 4px 14px rgba(0,0,0,.4)}
#onl .db89-top{display:flex;gap:12px;align-items:center;min-width:0}
#onl .db89-crest{width:70px;border-radius:4px;height:auto;flex:none;filter:drop-shadow(0 3px 5px rgba(0,0,0,.6))}
#onl .db89-ttl{flex:1;min-width:0}#onl .db89-ttl h3{margin:0;font:700 20px Georgia,serif;color:#f3e2b6;line-height:1.15;overflow-wrap:anywhere}#onl .db89-ttl>small{color:#d9c79f;font-size:12px}
#onl .db89-rec{display:flex;flex-wrap:wrap;gap:4px 12px;margin-top:3px;font-size:12px;color:#d9c79f}#onl .db89-rec b{color:#fff3d0;font:700 13px Georgia,serif}
#onl .db89-side{display:flex;align-items:center;gap:8px;flex:none}#onl .db89-side .gift83{margin:0}
#onl .db89-tre{display:grid;justify-items:end;padding:5px 10px;border-radius:10px;border:1px solid var(--hc2);background:rgba(0,0,0,.28);cursor:help;position:relative;min-width:96px}
#onl .db89-tre small{font:700 10.5px system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#d9c79f}#onl .db89-tre b{font:700 19px Georgia,serif;color:#f3d58a}
#onl .ld89i{font-style:normal;font-size:12px;color:#f3d58a;letter-spacing:0}
#onl .tr89b b{color:#f3d58a}
#onl .db89-folds{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;align-items:flex-start}
#onl .db89-folds>details{flex:0 1 auto;border:1px solid rgba(214,171,76,.45);border-radius:9px;background:rgba(0,0,0,.25);padding:0 8px}
#onl .db89-folds>details[open]{flex:1 1 100%}#onl .db89-folds summary{cursor:pointer;font:700 12.5px Georgia,serif;color:#eadbb8;padding:4px 0;list-style:none}
#onl .db89-folds summary::-webkit-details-marker{display:none}#onl .fd89-in{padding:6px 0 8px}
#onl .db89 .pat82,#onl .db89 .pat82 *{color:#eadbb8}
#onl .db89-ren{margin-top:6px;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
#onl .lk89{display:flex;gap:12px;align-items:flex-start}#onl .lk89-prev img{width:84px}#onl .lk89-f{display:grid;gap:6px;flex:1;min-width:0}#onl .lk89-f>label{display:inline-flex;gap:6px;align-items:center;margin-right:10px;font-size:12px;color:#eadbb8}
#onl .lk89-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(40px,1fr));gap:4px}#onl .lk89-g button{all:unset;cursor:pointer;border:2px solid transparent;border-radius:6px;padding:1px;display:grid;place-items:center}
#onl .lk89-g button.on{border-color:#f3d58a}#onl .lk89-g button:focus-visible{outline:2px solid #f3d58a}#onl .lk89-g img{width:36px}
#onl .up89{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.06)}#onl .up89 b{color:#f3e2b6}#onl .up89 small{display:block}
#onl .sc89{display:grid;grid-template-columns:minmax(140px,172px) minmax(140px,180px) minmax(0,1fr);gap:12px;align-items:start;padding:8px 12px;border:1px solid color-mix(in srgb,var(--hc2) 60%,#4a3a24);border-radius:14px;
  background:radial-gradient(ellipse at 40% 25%,rgba(232,201,106,.11),transparent 60%),linear-gradient(#241a10,#15100a)}
#onl .sc89.none{display:block;text-align:center;padding:22px}#onl .sc89.lk89{opacity:.85}
#onl .sc89-wp{display:grid;gap:8px}
#onl .wp89{display:grid;gap:2px;justify-items:center;text-align:center;border-radius:10px;padding:2px}#onl .wp89 small{font-size:11px;color:var(--muted);line-height:1.2}#onl .wp89 small b{color:#eadbb8}#onl .wp89 small i{color:#c9ad6a;font-style:normal}
#onl .wp89-c{width:100%;aspect-ratio:600/416;border-radius:8px;overflow:hidden;display:grid;place-items:center;background:rgba(0,0,0,.25);box-shadow:0 4px 12px rgba(0,0,0,.45)}
#onl .wp89-c>.cimg,#onl .wp89-c>*{width:100%!important;height:100%!important;max-width:none!important;margin:0!important}
#onl .wp89-c.off89{cursor:pointer;touch-action:none}#onl .wp89-c.off89:hover{box-shadow:0 0 0 2px #e8c96a,0 4px 12px rgba(0,0,0,.45)}
#onl .wp89.nm89 .wp89-c{box-shadow:0 0 0 2px var(--rc),0 4px 12px rgba(0,0,0,.45)}
#onl .wp89.empty .wp89-c{border:2px dashed #7a6440;background:rgba(255,255,255,.02);box-shadow:none;color:var(--muted);font-size:12px}#onl .wp89.empty .wp89-c>span{width:auto!important;height:auto!important}
#onl .sc89-av{display:grid;gap:6px;justify-items:center;min-width:0}
#onl .av89{display:grid;place-items:center;border-radius:12px;padding:2px;width:100%}#onl .av89 svg{width:100%;max-width:150px;height:auto;max-height:228px;filter:drop-shadow(0 8px 14px rgba(0,0,0,.55))}
#onl .wr89-l{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;max-width:100%}
#onl .wr89{display:inline-flex;align-items:center;gap:1px;border:1px solid #5a4630;border-radius:8px;background:rgba(0,0,0,.25);padding:1px 2px}#onl .wr89.nm89{border-color:var(--rc)}
#onl .wr89-p{display:inline-flex;align-items:center;gap:3px;cursor:pointer;touch-action:none;padding:1px 3px;border-radius:6px;font-size:11px;color:#eadbb8;max-width:150px}
#onl .wr89-p:hover{background:rgba(232,201,106,.14)}#onl .wr89-p .cimg{width:26px!important;height:26px!important;min-width:26px;margin:0!important}#onl .wr89-p b{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#onl .hm89{all:unset;cursor:pointer;font-size:11px;opacity:.32;padding:1px 3px;border-radius:5px}#onl .hm89.on{opacity:1;background:rgba(232,201,106,.25)}#onl .hm89:hover{opacity:.9}#onl .hm89:focus-visible{outline:2px solid #e8c96a}
#onl .sc89-info{min-width:0;display:grid;gap:4px;align-content:start}#onl .sc89-n{font:700 22px Georgia,serif;color:var(--gold,#e8c96a);line-height:1.1;overflow-wrap:anywhere}
#onl .ic89{all:unset;cursor:pointer;font-size:14px;color:#c9ad6a;padding:0 4px}#onl .ic89:hover{color:#f3d58a}
#onl .sc89-sub{font-size:13px;color:#eadbb8;display:flex;flex-wrap:wrap;gap:6px;align-items:center}#onl .sc89-info>.imm88c{justify-self:start}
#onl .sc89-rec{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px}#onl .sc89-rec>div{display:grid;justify-items:center;padding:4px 2px;border:1px solid #4a3a24;border-radius:8px;background:rgba(0,0,0,.2)}
#onl .sc89-rec b{font:700 14px Georgia,serif;color:#eadbb8;white-space:nowrap}#onl .sc89-rec small{font-size:10px;color:var(--muted);text-align:center}
#onl .sc89-mon{display:grid;grid-template-columns:1fr 1fr;gap:6px}#onl .mon89{display:grid;gap:1px;padding:5px 9px;border-radius:9px;border:1px solid #6b5636;background:rgba(0,0,0,.22)}
#onl .mon89 small{font:700 10.5px system-ui,sans-serif;letter-spacing:.07em;text-transform:uppercase;color:#cbb88f}#onl .mon89 b{font:700 18px Georgia,serif;color:#f3d58a}#onl .mon89 i{font-style:normal;font-size:10.5px;color:var(--muted)}
#onl .mon89.hi89,#onl .gc89.hi89{border-color:#c0392b!important;box-shadow:inset 0 0 0 1px rgba(192,57,43,.55)}
#onl .sat89{border:1px dashed #5a4630;border-radius:9px;padding:3px 6px}#onl .sat89-h{font-size:10.5px;color:#cbb88f;display:block}#onl .sat89-r{display:flex;flex-wrap:wrap;gap:4px;min-height:30px;align-items:center}
#onl .so89{display:inline-flex;align-items:flex-start}#onl .so89-t{cursor:pointer;touch-action:none;border-radius:50%}#onl .so89.br .so89-t{box-shadow:0 0 0 2px #e8c96a}
#onl .so89-s{all:unset;cursor:pointer;font-size:11px;color:#6b5636;margin-left:-6px}#onl .so89.br .so89-s{color:#f3d58a}
#onl .kt89{display:flex;flex-wrap:wrap;gap:4px;align-items:center}#onl .kt89-h{font-size:10.5px;color:#cbb88f;text-transform:uppercase;letter-spacing:.07em;margin-right:2px}
#onl .kt89-c{display:inline-flex;align-items:center}#onl .kt89-x{all:unset;cursor:pointer;font-size:11px;color:var(--muted);padding:0 4px}#onl .kt89-x:hover{color:#e0643a}
#onl .eb89{border:1px solid #6b5636;border-radius:12px;background:linear-gradient(#1f170e,#140f09);padding:4px 8px 6px;min-width:0}
#onl .eb89-tabs{display:flex;gap:4px;align-items:center;border-bottom:1px solid #4a3a24;margin-bottom:5px;flex-wrap:wrap}
#onl .eb89-tabs button{all:unset;cursor:pointer;padding:5px 12px;border:1px solid transparent;border-bottom:0;border-radius:8px 8px 0 0;font:700 13px Georgia,serif;color:var(--muted);white-space:nowrap}
#onl .eb89-tabs button.on{color:var(--gold,#e8c96a);border-color:#6b5636;background:linear-gradient(#2a1f13,#1a130c);margin-bottom:-1px}#onl .eb89-tabs button:focus-visible{outline:2px solid #e8c96a}
#onl .eb89-hint{margin-left:auto;font-size:11px}
#onl .eb89-row{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 6px;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch}#onl .eb89-row[hidden]{display:none}
#onl .eb89-e{margin:10px 4px}
#onl .pt89{flex:0 0 118px;scroll-snap-align:start;display:grid;gap:1px;align-content:start;position:relative;padding:4px;border:1px solid #5a4630;border-radius:9px;background:rgba(0,0,0,.28);cursor:grab;touch-action:pan-x;user-select:none}
#onl .pt89:hover{border-color:#c9ad6a;transform:translateY(-1px)}#onl .pt89:focus-visible{outline:2px solid #e8c96a}#onl .pt89.nm89{border-color:var(--rc);box-shadow:inset 0 0 8px color-mix(in srgb,var(--rc) 35%,transparent)}
#onl .pt89.no89{opacity:.55;cursor:not-allowed}#onl .pt89.lk89{opacity:.45;pointer-events:none}
#onl .pt89-art{height:56px;display:grid;place-items:center;position:relative;overflow:hidden;border-radius:6px;background:rgba(255,255,255,.03)}#onl .pt89-art>.cimg{max-height:56px;width:auto!important;height:56px!important;margin:0!important}
#onl .pt89-art .cimg.wide{width:82px!important;height:auto!important}#onl .art89x{font-size:30px}
#onl .pt89-n{font:600 11.5px/1.15 Georgia,serif;color:#eadbb8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#onl .pt89.nm89 .pt89-n{color:var(--rc)}
#onl .pt89-s{font-size:10px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#onl .cm89{font-size:10.5px;line-height:1.2;color:#9fd18b;min-height:2.4em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}#onl .cm89.why{color:#e0a07a}
#onl .pt89-b{position:absolute;top:3px;right:3px;display:flex;gap:2px}#onl .pt89-b .hm89{background:rgba(0,0,0,.45)}
#onl .rp89{all:unset;cursor:pointer;font:700 10.5px system-ui,sans-serif;color:#2a1c06;background:linear-gradient(#f6dc8c,#c99a32);border-radius:6px;padding:1px 5px;pointer-events:auto}
#onl .pt89.brk89{opacity:1}#onl .pt89.brk89 .pt89-art>*{filter:grayscale(.55) brightness(.75)}
#onl .crk89{position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 46%,rgba(20,10,4,.9) 47%,rgba(240,220,180,.55) 48%,transparent 49.5%),linear-gradient(70deg,transparent 58%,rgba(20,10,4,.85) 59%,transparent 60.5%),linear-gradient(150deg,transparent 30%,rgba(20,10,4,.8) 31%,transparent 32.2%)}
#onl .of89{flex:0 0 74px;display:grid;justify-items:center;gap:2px;padding:4px;border:1px solid #5a4630;border-radius:9px;background:rgba(0,0,0,.25);cursor:grab;touch-action:pan-x;font-size:10.5px;color:#eadbb8;text-align:center}
#onl .of89:hover{border-color:#c9ad6a}
#onl .gc89-row{display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:8px}
#onl .gc89{all:unset;box-sizing:border-box;cursor:pointer;display:flex;gap:6px;align-items:flex-start;padding:6px 8px;border:1px solid color-mix(in srgb,var(--hc2) 45%,#4a3a24);border-radius:11px;background:rgba(0,0,0,.24);min-width:0;position:relative}
#onl .gc89:hover:not(:disabled){border-color:#c9ad6a}#onl .gc89.act{border:2px solid var(--hc2);background:color-mix(in srgb,var(--hc1) 22%,rgba(0,0,0,.3))}#onl .gc89:disabled{opacity:.6;cursor:not-allowed}#onl .gc89:focus-visible{outline:2px solid #e8c96a}
#onl .gc89-av{flex:none;width:40px}#onl .gc89-av svg{width:40px;height:auto;max-height:90px}
#onl .gc89-b{display:grid;gap:1px;min-width:0;font-size:11px;color:var(--muted)}#onl .gc89-b>b{font:700 13.5px Georgia,serif;color:#eadbb8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#onl .gc89-w{color:#d9c79f;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#onl .gc89.hi89 .gc89-s{color:#ff8a78;font-weight:700}#onl .gc89 .badge{justify-self:start}
#onl .gc89.empty{flex-direction:column;align-items:center;justify-content:center;text-align:center;border-style:dashed;min-height:86px;color:var(--muted);font-size:11px}#onl .gc89.empty b{color:#eadbb8}#onl .gc89-plus{font-size:24px;line-height:1}
#onl .gc89.empty.up{opacity:.75}#onl .lk89t{color:#e0a07a}
#onl .mw89{border:1px solid #4a3a24;border-radius:12px;padding:6px 10px;background:linear-gradient(#1b1611,#100d09)}#onl .mw89-h{font:700 13.5px Georgia,serif;color:#cfc3ad;margin-bottom:4px}
#onl .mw89-r{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px}#onl .pq89{flex:0 0 176px;display:grid;gap:0;padding:4px 8px;border-radius:6px;background:linear-gradient(#5b5650,#3f3b36);box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 2px 6px rgba(0,0,0,.5);color:#e8e2d6;font-size:11px}
#onl .pq89-m{font:700 12px Georgia,serif;letter-spacing:.12em;color:#f1e6c8}#onl .pq89 b{font:700 13px Georgia,serif;color:#fff}#onl .pq89 small{color:#d8d0c2}#onl .pq89-b{font-style:italic}
#onl .dz89.ok89{outline:2px dashed rgba(232,201,106,.75);outline-offset:2px}#onl .dz89.hov89{outline:3px solid #f3d58a;background:rgba(232,201,106,.12)}
body.drag89,body.drag89 *{cursor:grabbing!important}
.gh89{position:fixed;z-index:9999;pointer-events:none;width:96px;transform:translate(-50%,-60%) rotate(-4deg);opacity:.9;filter:drop-shadow(0 8px 12px rgba(0,0,0,.6))}.gh89 .cimg,.gh89 svg,.gh89 img{width:96px!important;height:auto!important;max-height:80px}
.gh89 .crk89{display:none}
.led89f{position:fixed;z-index:70;background:linear-gradient(#2a1f13,#17110b);border:1px solid #a8873e;border-radius:12px;padding:10px 12px;box-shadow:0 14px 34px rgba(0,0,0,.7);color:#eadbb8;font-size:12.5px}
.led89f[hidden]{display:none}.lg89-h{font:700 15px Georgia,serif;color:#f3d58a;display:block}.lg89-g{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:6px}
.lg89-t{font:700 11px system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#cbb88f;border-bottom:1px solid rgba(214,171,76,.35);margin-bottom:3px}
.lg89-r{display:flex;justify-content:space-between;align-items:baseline;gap:6px;padding:1px 0}.lg89-r span{min-width:0;overflow-wrap:anywhere}.lg89-r b{white-space:nowrap}.lg89-r b.neg{color:#e0a07a}
.cmp89{position:fixed;z-index:70;width:300px;display:flex;gap:8px;align-items:flex-start;background:linear-gradient(#2a1f13,#17110b);border:1px solid #a8873e;border-radius:12px;padding:8px;box-shadow:0 14px 34px rgba(0,0,0,.7);color:#eadbb8;font-size:12px;pointer-events:none}
.cmp89[hidden]{display:none}.cmp89-art{flex:0 0 120px}.cmp89-art .cimg{width:120px!important;height:auto!important;margin:0!important}.cmp89-art .nw83{width:120px}
.cmp89-b{display:grid;gap:2px;min-width:0}.cmp89-b b{font:700 14px Georgia,serif;color:#f3e2b6}.cmp89-b small{color:#cbb88f}.cmp89-b p{margin:3px 0 0;font-size:12px}.cmp89-b p.ok{color:#9fd18b}.cmp89-b p.why{color:#e0a07a}
.cl89-g{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin:8px 0}.cl89{all:unset;cursor:pointer;display:grid;justify-items:center;gap:2px;padding:4px;border:1px solid #5a4630;border-radius:8px;font-size:11.5px;text-align:center}
.cl89:hover:not([disabled]){border-color:#e8c96a}.cl89.on{border-color:#e8c96a;background:rgba(232,201,106,.12)}.cl89[disabled]{opacity:.5;cursor:not-allowed}.cl89 .cimg{width:100%!important;height:auto!important;margin:0!important}
.ask89{display:grid;gap:4px;margin:8px 0}
@media(max-width:1100px){#onl .sc89{grid-template-columns:minmax(140px,190px) minmax(130px,170px) minmax(0,1fr)}#onl .gc89-av{display:none}}
@media(max-width:900px){#onl .sc89{grid-template-columns:minmax(120px,160px) minmax(0,1fr);grid-template-areas:"av info" "wp wp"}#onl .sc89-av{grid-area:av}#onl .sc89-info{grid-area:info}#onl .sc89-wp{grid-area:wp;grid-template-columns:1fr 1fr}
  #onl .gc89-row{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:4px}#onl .gc89{flex:0 0 190px;scroll-snap-align:start}#onl .gc89-av{display:block}}
@media(max-width:600px){#onl .db89-top{flex-wrap:wrap}#onl .db89-crest{width:44px}#onl .db89-ttl h3{font-size:18px}#onl .db89-side{width:100%;justify-content:space-between}
  #onl .sc89{padding:8px;gap:8px;grid-template-columns:104px minmax(0,1fr)}#onl .av89 svg{max-height:200px}#onl .sc89-n{font-size:18px}
  #onl .sc89-rec{grid-template-columns:repeat(3,minmax(0,1fr))}#onl .sc89-rec b{font-size:12.5px}#onl .sc89-mon{grid-template-columns:1fr}#onl .mon89 b{font-size:16px}
  #onl .wr89-p b{display:none}#onl .eb89-hint{display:none}#onl .pt89{flex-basis:104px}#onl .gc89{flex-basis:168px}.lg89-g{grid-template-columns:1fr}.cl89-g{grid-template-columns:repeat(2,minmax(0,1fr))}.cmp89{display:none!important}}`;document.head.appendChild(st)}
