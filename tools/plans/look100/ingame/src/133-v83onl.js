/* =====================================================================
   133-V83ONL · ONLINE v0.83, the server half's client hooks + the MOCK (contract tools/plans/onl83-contract.md, protocol 6)
   =====================================================================
   No screens here (a separate client module draws them) — only what every client must do the same way, and the mock server.
   CATALOG • onlCatalog() also carries each printed weapon's stats (p r ammo throw shield absorb uses cfw soul both atkUses stones img): the
     server rolls GENERATED NAMED WEAPONS from them (tools/mkserver.js writes server/src/catalog.json from this).
   NAMED WEAPONS • a lobby kit carries {named:[full defs]}; onlSeatsFor registers W['nw_<uid>'] = ONLC.cleanNamed(def) on every client
     (never `custom`, so gearRebuild keeps it; never in the market or the chest), mkPlayer keeps them on the player (p._nw83, in snapshots;
     onlmLoad registers them again), giveLoadout puts them in hand like a bought weapon. Affix/unique hooks, all deterministic:
     hurt (pierce 1/2, ultor, aegis, sanguis, gloria, fortuna, messor), hurtNPC (ferox, venator), resetTurn (regius).
   OFFERINGS • a seat's kit.offer → seat.festItems (into the hand at the start); cf1/cf2 are playable from the hand (useItem).
     A Ranked kit.cfb → seat.cfStart (carried-in CF).
   RESULT ROWS • eliminate records S.elimOrder[].bySeat / kb; onlRow81 rows gain brk (brought pieces no longer held), off (brought offerings
     still in hand), ks/kb (who put the seat out), thumb (spared by the Thumb), slew tholo — the server breaks, returns and loots from them.
   COUNTDOWN • NET.req('lobby.start') waits for the room's startAt and sends {go:1} (old callers still get the live room back).
   ONL83 • helpers for the UI: piece(), value(), repairCost(), kitPieces(), kitValue(), stakes(), countLeft(), hold(), follow(), profile(), share(), rarCol.
   MOCK • every v0.83 route, as server/src/routes.js: offer.buy/bring, gear.repair, domus.buy, gift.open, loot.list/pick, market.list/buy, domus.profile,
     domus.follow, wager.list, lobby.hold + the countdown, Ludi Infames, and the settlement extras (treasury cut, broken pieces, offerings back,
     the dead's gear → loot / market / chest pool / house shelf, trophies, recent matches, Victor of the Day, bet history + the week's tally).
   ===================================================================== */
const ONL83={rarCol:{common:'#b9b2a0',rare:'#4f8fd6',epic:'#9a5bd0',legendary:'#e0a530'},reg:{}};

/* ---------------- the catalog: weapons carry their stats (the server rolls named weapons from them) ---------------- */
{const base=onlCatalog;onlCatalog=function(){const c=base.apply(this,arguments);
  for(const [k,it] of Object.entries(c))if(it.kind==='w'&&it.p==null&&W[k]){const w=W[k];for(const f of ['p','r','ammo','shield','absorb','uses','cfw','soul','both','atkUses','stones','img'])if(w[f]!=null)it[f]=w[f];if(w.throw)it.throw={p:w.throw.p,r:w.throw.r,n:w.throw.n}}return c}}

/* ---------------- named weapons in W (every client the same) ---------------- */
ONL83.regNamed=function(defs){for(const d0 of defs||[]){const d=ONLC.cleanNamed(d0);if(!d)continue;if(W[d.key]&&W[d.key].named83&&JSON.stringify(W[d.key])===JSON.stringify(d))continue;W[d.key]=d;ONL83.reg[d.key]=1}};
{const base=onlSeatsFor;onlSeatsFor=function(L){const seats=base.apply(this,arguments);
  try{(L.players||[]).forEach((p,i)=>{const s=seats[i];if(!s||!s.onl||s.cpu||/^bot/.test(p.id))return;const k=p.kit||{};
    const named=(k.named||[]).map(ONLC.cleanNamed).filter(Boolean);ONL83.regNamed(named);s.onl.named=named;
    s.onl.offer=(k.offer||[]).filter(x=>ONLC.OFFERS83.includes(x)).slice(0,ONLC.OFF_CARRY);if(s.onl.offer.length)s.festItems=s.onl.offer.slice();
    if(L.ranked&&(k.cfb|0)>0)s.cfStart=Math.min(ONLC.CFB_MAX,k.cfb|0)})}catch(e){console.error(e)}return seats}}
{const base=mkPlayer;mkPlayer=function(i,seat){const p=base.apply(this,arguments);
  try{if(seat&&seat.onl&&seat.onl.gear&&!seat.cpu){p._kit83={gear:seat.onl.gear.slice(),offer:(seat.onl.offer||[]).slice()};if((seat.onl.named||[]).length)p._nw83=seat.onl.named.map(d=>({...d}))}}catch(e){console.error(e)}return p}}
{const base=giveLoadout;giveLoadout=function(p){const r=base.apply(this,arguments);
  try{if(p&&p._onlKit)for(const k of p._onlKit){if(!/^nw_/.test(k)||!W[k])continue;const w=mkW(k);if(!p.wR)p.wR=w;else if(!p.wL&&!p.wR.both&&!w.both)p.wL=w;else p.wR=w}}catch(e){console.error(e)}return r}}
{const base=onlmLoad;onlmLoad=function(){const r=base.apply(this,arguments);try{if(S&&S.players)for(const p of S.players)if(p._nw83)ONL83.regNamed(p._nw83)}catch(e){}return r}}

/* ---------------- offerings brought: cf1/cf2 are played from the hand (the printed ones resolve on reveal) ---------------- */
{const base=useItem;useItem=async function(player,it){if(it&&it.kind==='offer'&&(it.key==='cf1'||it.key==='cf2')){
    /* v0.99: a no-CF round blocks spending only; the offering still earns */
    const v=it.key==='cf1'?1:2;cfWhy('offerings');player.cf+=v;log(_T`${nm(player)} offers to the crowd: <b>${cfAmt87('+'+(v))}</b>.`);player.items=player.items.filter(x=>x!==it);return true}
  return base.apply(this,arguments)}}

/* ---------------- the uniques and the armor-piercing affix (deterministic engine hooks) ---------------- */
const onl83Held=(p,uq)=>!!p&&['R','L'].some(a=>p['w'+a]&&p['w'+a].uq===uq);
const onl83HP=p=>p&&p.hp?Object.values(p.hp).reduce((a,v)=>a+Math.max(0,v|0),0):0;
{const base=hurt;hurt=async function(victim,location,damage,source,prefix,opts){
  const w=source&&source.type==='player'&&source.w&&source.w.named83?source.w:null;const att=w?source.p:null;const pvp=!!(victim&&victim.cls);
  if(w&&pvp&&damage>0&&w.uq==='ultor'&&att&&att.lastHitBy===victim.id&&victim!==att)damage++;
  if(pvp&&damage>0&&!(opts&&opts.direct)&&onl83Held(victim,'aegis')&&S){const k=S.ri+':'+S.rotation;if(victim._aeg83!==k){victim._aeg83=k;damage--;log(_T`${nm(victim)}'s Aegis turns 1 damage aside.`)}}
  const hp0=pvp?onl83HP(victim):0;const limb0=pvp&&victim.hp?victim.hp[location]:0;const pr=w?(w.uq==='percussor'?2:(w.pierce|0)):0;let r;
  if(pr&&damage>0&&pvp&&!source.punch&&victim.ap&&victim.ap[location]>0&&!(opts&&opts.direct)){const d1=Math.min(pr,damage);
    r=await base.call(this,victim,location,damage-d1,source,prefix,opts);
    if(victim.alive&&victim.hp[location]>0)await base.call(this,victim,location,d1,source,_T`${prefix||''} — the ${w.n} pierces`,{...(opts||{}),noShield:true,direct:true})}
  else r=await base.call(this,victim,location,damage,source,prefix,opts);
  try{if(w&&att&&pvp&&damage>0&&victim!==att){
    if(w.uq==='gloria'&&cfAllowed()){cfWhy(_T('a legendary weapon'));att.cf+=2;log(_T`${nm(att)}'s ${w.n}: the crowd roars (${cfAmt87('+2')}).`)}
    if(w.uq==='fortuna'){att.coin+=2;if(typeof coinLog==='function')coinLog(att,2,_T('a legendary weapon'));log(_T`${nm(att)}'s ${w.n}: ${coinAmt87('+2')}.`)}
    if(w.uq==='sanguis'&&att.alive&&onl83HP(victim)<hp0)await distributeHP(att,1,_T`${w.n}'s blood-price`);
    if(w.uq==='messor'&&location!=='head'&&location!=='chest'&&limb0>0&&victim.hp[location]<=0&&cfAllowed()){cfWhy(_T('a legendary weapon'));att.cf+=3;log(_T`${nm(att)}'s ${w.n} reaps a limb (${cfAmt87('+3')}).`)}}}catch(e){console.error(e)}
  return r}}
{const base=hurtNPC;hurtNPC=function(npc,damage,player,prefix,weapon,byNpc){const w=weapon&&weapon.named83?weapon:null;if(w&&w.uq==='ferox'&&damage>0)damage++;
  const was=!!(npc&&npc.alive);const r=base.call(this,npc,damage,player,prefix,weapon,byNpc);
  try{if(w&&w.uq==='venator'&&was&&npc&&!npc.alive&&player&&player.cls&&cfAllowed()){cfWhy(_T('a legendary weapon'));player.cf+=3;log(_T`${nm(player)}'s ${w.n}: the hunt pleases the crowd (${cfAmt87('+3')}).`)}}catch(e){}return r}}
{const base=resetTurn;resetTurn=function(player){const r=base.apply(this,arguments);try{if(player&&player.alive&&onl83Held(player,'regius')&&cfAllowed()){cfWhy(_T('a legendary weapon'));player.cf+=1;log(_T`${nm(player)}'s royal weapon: ${cfAmt87('+1')}.`)}}catch(e){}return r}}

/* ---------------- result rows: who put a seat out, what broke, what came back ---------------- */
{const base=eliminate;eliminate=function(victim,source){const was=!!(victim&&victim.alive);const r=base.apply(this,arguments);
  try{if(was&&S&&S.elimOrder){const e=S.elimOrder.slice().reverse().find(o=>o.id===victim.id);if(e&&e.kb==null){source=source||{};
    const killer=source.type==='player'?source.p:source.type==='npc'&&source.n&&source.n.tamedBy!=null?S.players[source.n.tamedBy]:null;const k=killer&&killer!==victim?killer:null;
    e.bySeat=k?S.players.indexOf(k):-1;e.kb=k?'g':source.type==='npc'?'b':source.type==='retire'?'r':'a'}}}catch(err){}return r}}
function onl83RowX(G,p){const x={};const K=p&&p._kit83;const cnt=(arr,k)=>arr.filter(y=>y===k).length;
  if(K){const held=['R','L'].map(a=>p['w'+a]).filter(Boolean).map(w=>w.key);const worn=[];for(const l of Object.keys(p.pieces||{}))for(const pc of p.pieces[l]||[])worn.push(pc.key);
    const brk=[];const seen={};for(const k of K.gear){seen[k]=(seen[k]||0)+1;const isW=!!W[k]&&!ARM[k];const have=cnt(isW?held:worn,k);if(seen[k]>have)brk.push(k)}x.brk=brk.sort();
    const hand=(p.items||[]).filter(i=>i.kind==='offer').map(i=>i.key);const off=[];const seenO={};for(const k of K.offer||[]){seenO[k]=(seenO[k]||0)+1;if(cnt(hand,k)>=seenO[k])off.push(k)}x.off=off.sort()}
  const e=(G.elimOrder||[]).slice().reverse().find(o=>o.id===p.id);x.ks=e&&Number.isInteger(e.bySeat)?e.bySeat:-1;x.kb=e&&e.kb||'';
  const LR=(G.lastResult||{}).rows||[];const row=LR.find(y=>y.id===p.id)||{};x.thumb=/^Thumb of Flavius/.test(String(row.fate||''))&&row.survives!==false;
  const tr=(p.trophies||[]).map(t=>String(t.name||'')+' '+String(t.kind||''));x.slew=[...(tr.some(s=>/commodus/i.test(s))?['commodus']:[]),...(tr.some(s=>/tholo/i.test(s))?['tholo']:[])];return x}
{const base=onlRow81;onlRow81=function(G,p){const row=base.apply(this,arguments);try{Object.assign(row,onl83RowX(G,p))}catch(e){console.error(e)}return row}}

/* ---------------- the START COUNTDOWN: the host's Start waits for the room's startAt, then sounds the horns ---------------- */
const onl83Now=()=>Date.now()+((typeof ONL80F!=='undefined'&&ONL80F.skew)||0);
ONL83.countLeft=L=>ONLC.countLeft(L,onl83Now());
ONL83.hold=id=>NET.req('lobby.hold',{id});
{const base=NET.req;NET.req=function(t,d){if(t!=='lobby.start'||!d||d.go)return base.apply(this,arguments);const self=this,args=arguments;
  return (async()=>{let L=await base.apply(self,args);if(!L||L.status!=='waiting'||L.startAt==null)return L;const skew=L.now!=null?L.now-Date.now():0;
    for(let i=0;i<200;i++){const wait=L.startAt-(Date.now()+skew);if(wait>0)await new Promise(r=>setTimeout(r,Math.min(wait+60,1500)));
      if(L.startAt-(Date.now()+skew)>0)continue;try{return await base.call(self,'lobby.start',{id:d.id,go:1})}
      catch(e){if(e&&e.code==='count_wait'){const x=e.extra||{};if(x.startAt)L={...L,startAt:x.startAt};await new Promise(r=>setTimeout(r,250));continue}throw e}}
    throw new Error(_T('The horns did not sound — press Start again.'))})()}}

/* ---------------- ONL83: helpers for the screens ---------------- */
ONL83.piece=(holder,item)=>ONLC.pieceOf(holder,item,onlCatalog());
ONL83.value=I=>ONLC.valueOf(I);ONL83.repairCost=I=>ONLC.repairCost(I);
/* a lobby kit's pieces as infos (named ones from kit.named) */
ONL83.kitPieces=function(kit){if(!kit)return [];const cat=onlCatalog();const nm=Object.fromEntries((kit.named||[]).map(d=>[d.key,d]));
  return (kit.gear||[]).map((k,i)=>{const it=(kit.items||[])[i]||k;if(/^nw_/.test(k)){const d=nm[k];return d?ONLC.pieceInfo({item:it,pc:{st:'whole',rar:d.rar,w:d}},cat):null}return ONLC.pieceInfo({item:it,pc:null},cat)}).filter(Boolean)};
ONL83.kitValue=kit=>ONL83.kitPieces(kit).reduce((a,I)=>a+ONLC.valueOf(I),0);
/* what is at stake at the horns, seat by seat */
ONL83.stakes=L=>(L&&L.players||[]).map((p,i)=>{const ps=ONL83.kitPieces(p.kit);return {seat:i,id:p.id,name:p.name,domus:p.domus||null,ranked:!!L.ranked,pieces:ps,value:ps.reduce((a,I)=>a+ONLC.valueOf(I),0),offer:(p.kit&&p.kit.offer)||[],cfb:L.ranked?((p.kit&&p.kit.cfb)|0):0}});
ONL83.follow=(id,on)=>NET.req('domus.follow',{id,on:on!==false});
ONL83.profile=x=>NET.req('domus.profile',/^D/.test(String(x||''))?{id:x}:{name:x});
ONL83.share=id=>{try{return location.origin+location.pathname+ONLC.domusLink(id)}catch(e){return ONLC.domusLink(id)}};

/* =========================== THE MOCK SERVER (v0.83, as server/src/routes.js) =========================== */
const MOCK_CD83='flavius_onlcd83';
const mockCount83=()=>{try{const v=localStorage.getItem(MOCK_CD83);if(v!=null&&v!=='')return Math.max(0,+v|0)}catch(e){}return ONLC.COUNTDOWN_MS};
const mockOwn83=(w,me,cid)=>{const ch=w.chars[cid];if(!ch||ch.owner!==me||!ch.alive)throw new Error(_T('Not yours.'));return ch};
const mockHouse83=(w,me)=>{const A=w.accounts[me];const D=mockDomus82(w,A&&A.domus);if(!D)throw onlErr82(_T('Name your house first.'),'need_domus');return D};
const mockShelf83=D=>({house:true,gear:D.gear||[],pcs:D.pcs||{}});
function mockToMarket83(w,P,from){const I=ONLC.pieceInfo(P,onlCatalog());if(!I)return;w.chest83=w.chest83||[];w.market83=w.market83||[];
  if(I.named){w.chest83.push({item:P.item,pc:P.pc||null,at:Date.now(),from});return}
  const id='U#'+String(Date.now()).padStart(13,'0')+'#'+Math.floor(Math.random()*1e9).toString(36);w.market83.unshift({id,item:P.item,pc:P.pc||null,base:I.base,n:I.n,kind:I.kind,lv:I.lv,st:I.st,price:ONLC.usedPrice(I),at:Date.now(),from});w.market83=w.market83.slice(0,120)}
const mockLeaving83=(Ps,h,from,how)=>Ps.map(P=>ONLC.histAdd(ONLC.tagPiece(P,h),{house:from.house||null,glad:from.glad,when:Date.now(),how}));
const mockLootOut83=X=>({id:X.match,seat:X.seat,until:X.until,dead:X.dead,killer:{seat:X.killer.seat},pieces:X.pieces.map(p=>({item:p.item,n:p.n,kind:p.kind,lv:p.lv,st:p.st,rar:p.rar||null,val:p.val|0,hist:(p.pc&&p.pc.hist)||[],...(p.pc&&p.pc.w?{w:p.pc.w}:{})}))}); /* v0.84: the full def (w) */
function mockLootResolve83(w,X,i){if(X.done)return null;X.done=true;if(i==null)i=ONLC.lootBest(X.pieces);X.picked=i;const from={house:X.dead.domus||null,glad:X.dead.name};let to='market',got=null,ch=null;
  const kc=w.chars[X.killer.char];
  X.pieces.forEach((p,j)=>{let P={item:p.item,pc:p.pc||null};
    if(j===i&&kc&&kc.alive){P=ONLC.histAdd(P,{...from,when:Date.now(),how:'taken'});got=ONLC.pieceInfo(P,onlCatalog());
      if(!ONLC.gearMoveWhy({gear:[P.item],pcs:P.pc?{[ONLC.itemUid(P.item)]:P.pc}:{}},kc,P.item,onlCatalog())){ONLC.putPiece(kc,P,!ONLC.wearWhy(kc,P.item,P.pc));to='glad';ch=kc}
      else{const D=mockDomus82(w,kc.domus);if(D){ONLC.putPiece(D,P,false);to='house'}else mockToMarket83(w,P,from)}return}
    mockToMarket83(w,ONLC.histAdd(P,{...from,when:Date.now(),how:'fell'}),from)});
  const r={id:X.match,seat:X.seat,got:got&&{item:got.item,n:got.n,kind:got.kind,lv:got.lv,st:got.st,rar:got.rar||null,val:got.val},to,char:ch};mockTo([X.killer.acct],'loot.done',r);return r}
function mockLootSweep83(w){for(const X of Object.values(w.loot83||{}))if(!X.done&&Date.now()>X.until)mockLootResolve83(w,X,null)}
const mockLootMine83=(w,me)=>Object.values(w.loot83||{}).filter(X=>!X.done&&X.killer&&X.killer.acct===me&&Date.now()<=X.until);
function mockFollows83(w,fs){return (fs||[]).map(f=>{const D=mockDomus82(w,f.id);const A=D&&w.accounts[D.owner];const on=A&&mockHere80(w).find(h=>h.id===A.id&&!h.bot);
  if(!on)return {id:f.id,name:f.name,st:'off'};const live=mockLive80(w,A.id);if(live)return {id:f.id,name:f.name,st:'fight',match:live.id,glad:mockName80(w,A.id)};
  const R=mockRoomOf80(w,A.id);return R?{id:f.id,name:f.name,st:'room',room:R.id,glad:mockName80(w,A.id)}:{id:f.id,name:f.name,st:'free',acct:A.id,glad:mockName80(w,A.id)}})}
function mockBetsMark83(w,bets,res){for(let i=0;i<(bets||[]).length;i++){const b=bets[i],r=res[i];if(!b||!r||!b.bk)continue;const h=((w.bets83||{})[b.by]||[]).find(x=>x.id===b.bk);if(h){h.res=r.res;h.pay=r.pay|0}
    if(r.res!=='refund'){const wk=ONLC.weekKey(Date.now());w.wk83=w.wk83||{};const T=(w.wk83[wk]=w.wk83[wk]||{});const x=(T[b.by]=T[b.by]||{net:0,won:0,staked:0});x.net+=(r.pay|0)-(b.amt|0);x.won+=r.pay|0}}}
function mockVday83(w){const y=ONLC.dayPrevKey(Date.now());w.vday83=w.vday83||{};if(w.vday83[y])return;w.vday83[y]=1;const Y=(w.days80||{})[y];const v=Y&&(Y.wins||[])[0];const D=v&&mockDomus82(w,v.dom);if(D)ONLC.trophyAdd(D,'vday',v.name,Date.now())}

Object.assign(MOCK_ROUTES,{
  'offer.buy':(w,d,me)=>{const ch=mockOwn83(w,me,d.char);ONLC.offerBuy(ch,String(d.key||''));return ch},
  'offer.bring':(w,d,me)=>{const ch=mockOwn83(w,me,d.char);if(mockCharBusy82(w,ch.id))throw onlErr82(_T`${ch.name} is in a match — the satchel waits.`,'in_match');ONLC.offerBring(ch,d.keys);return ch},
  'gear.repair':(w,d,me)=>{const D=mockHouse83(w,me);const item=String(d.item||'');let H=D,hc=null;
    if(d.holder!=='house'){hc=mockOwn83(w,me,d.holder);if(hc.domus!==D.id)throw new Error(_T('Not of your house.'));if(mockCharBusy82(w,hc.id))throw onlErr82(_T`${hc.name} is in a match — the forge waits.`,'in_match');H=hc}
    const I=(H.gear||[]).includes(item)?ONLC.pieceOf(H,item,onlCatalog()):null;if(!I)throw new Error(_T('That piece is not there.'));if(I.st!=='broken')throw new Error(_T('That piece is whole.'));const cost=ONLC.repairCost(I);
    const byT=d.pay==='treasury'||(d.pay==null&&!hc);let payer=null;
    if(byT){if((D.treasury|0)<cost)throw onlErr82(_T`The treasury needs ${cost} coin.`,'no_coin',{cost});D.treasury-=cost}
    else{payer=mockOwn83(w,me,d.pay||hc.id);if(payer.domus!==D.id)throw new Error(_T('Not of your house.'));if((payer.wallet|0)<cost)throw onlErr82(_T`The repair costs ${cost} coin.`,'no_coin',{cost});payer.wallet-=cost}
    ONLC.repairItem(H,item);return {cost,item,holder:hc?hc:mockShelf83(D),domus:mockDRow82(D),...(payer&&payer!==hc?{payer}:{})}},
  'domus.buy':(w,d,me)=>{const D=mockHouse83(w,me);const it=onlCatalog()[d.item];if(!it)throw new Error(_T('No such piece.'));const p=ONLC.priceOf(it);
    if((D.treasury|0)<p)throw onlErr82(_T`The treasury needs ${p} coin.`,'no_coin',{cost:p});D.treasury-=p;D.gear=[...(D.gear||[]),d.item];return {domus:mockDRow82(D),gear:D.gear,pcs:D.pcs||{}}},
  'gift.open':(w,d,me)=>{const ch=mockOwn83(w,me,d.char);if(!(ch.gifts||[]).some(g=>g.id===d.gift))throw new Error(_T('No such gift.'));if(mockCharBusy82(w,ch.id))throw onlErr82(_T`${ch.name} is in a match — open it afterwards.`,'in_match');
    const cat=onlCatalog();const rw=ONLC.rollGift(Math.random,cat,ONLC.rankFor(ch).k);let P=null;
    if(rw.k==='named'){w.chest83=w.chest83||[];w.uniq83=w.uniq83||[];if(false&&w.chest83.length&&Math.random()<0.5){const x=w.chest83.splice(Math.floor(Math.random()*w.chest83.length),1)[0];P={item:x.item,pc:x.pc}}
      else{let def=ONLC.rollNamed(Math.random,cat,rw.rar,w.uniq83);if(def&&def.uq){if(w.uniq83.includes(def.uq))def=ONLC.rollNamed(Math.random,cat,'epic',[]);else w.uniq83.push(def.uq)}if(def)P=ONLC.namedPiece(def,ch)}
      if(!P){rw.k='coin';rw.v=50}}
    ONLC.giftTake(ch,d.gift);let res,D2=null;if(P&&!ONLC.canWearNamed(ch)){D2=mockDomus82(w,ch.domus);if(D2)ONLC.putPiece(D2,P,false);else ONLC.putPiece(ch,P,false);res={to:D2?'house':'glad'}}else res=ONLC.applyGift(ch,null,rw,P);
    const piece=P?ONLC.pieceInfo(P,cat):rw.k==='gear'?ONLC.pieceOf(ch,rw.item,cat):null;return {reward:{...rw,...(piece?{piece}:{})},to:res.to,char:ch,...(D2?{domus:mockDRow82(D2),gear:D2.gear||[],pcs:D2.pcs||{}}:{})}},
  'loot.list':(w,d,me)=>{mockLootSweep83(w);return mockLootMine83(w,me).map(mockLootOut83)},
  'loot.pick':(w,d,me)=>{const X=(w.loot83||{})[d.id+'#'+(d.seat|0)];if(!X||!X.killer||X.killer.acct!==me)throw new Error(_T('Nothing to take.'));if(X.done)throw onlErr82(_T('The pick is made.'),'loot_done',{picked:X.picked});
    let i=X.pieces.findIndex(p=>p.item===d.item);if(i<0)throw new Error(_T('Pick one of the pieces.'));if(Date.now()>X.until)i=null;return mockLootResolve83(w,X,i)},
  'market.list':(w)=>{mockLootSweep83(w);return {used:(w.market83||[]).slice(0,60).map(x=>({id:x.id,item:x.item,base:x.base,n:x.n,kind:x.kind,lv:x.lv,st:x.st,price:x.price,at:x.at,from:x.from||null,hist:(x.pc&&x.pc.hist)||[]}))}},
  'market.buy':(w,d,me)=>{const ch=mockOwn83(w,me,d.char);const i=(w.market83||[]).findIndex(x=>x.id===d.id);if(i<0)throw onlErr82(_T('Someone bought it first.'),'sold');const X=w.market83[i];
    const I=ONLC.pieceInfo({item:X.item,pc:X.pc},onlCatalog());
    if((ch.wallet|0)<X.price)throw onlErr82(_T`Costs ${X.price} coin.`,'no_coin',{cost:X.price});ch.wallet-=X.price;ONLC.putPiece(ch,{item:X.item,pc:X.pc},!ONLC.wearWhy(ch,X.item,X.pc));w.market83.splice(i,1);return {char:ch}},
  'domus.profile':(w,d,me)=>{let D=d.id?mockDomus82(w,String(d.id)):null;if(!D&&d.name){const id=(w.dnames82||{})[ONLC.domusKey(d.name)];D=mockDomus82(w,id)}if(!D)throw onlErr82(_T('No such house.'),'no_domus');
    const glads=Object.values(w.chars).filter(c=>c.domus===D.id&&c.alive).map(c=>{const L=ONLC.cleanLook(c.look);return {id:c.id,name:c.name,cls:c.cls,rank:ONLC.rankFor(c).k,glory:Math.round(ONLC.gloryOf(c)),bouts:c.bouts|0,wins:c.wins|0,survived:c.survived|0,look:L.token?{token:L.token,color:L.color}:{}}});
    const rank=glads.reduce((b,g)=>ONLC.rankIdx(g.rank)>ONLC.rankIdx(b)?g.rank:b,'tiro');const A=w.accounts[me];
    return {domus:{...mockDRow82(D),archived:!!D.archived,trophies:D.trophies||[],recent:D.recent||[]},glads,rank,link:ONLC.domusLink(D.id),following:!!(A&&(A.follows||[]).some(f=>f.id===D.id)),mine:!!(A&&A.domus===D.id),now:mockFollows83(w,[{id:D.id,name:D.name}])[0]}},
  'domus.follow':(w,d,me)=>{const A=w.accounts[me];const D=mockDomus82(w,String(d.id||''));if(!D)throw onlErr82(_T('No such house.'),'no_domus');if(D.id===A.domus)throw new Error(_T('That is your own house.'));
    let f=(A.follows||[]).filter(x=>x.id!==D.id);if(d.on!==false){if(f.length>=ONLC.FOLLOW_MAX)throw new Error(_T`Up to ${ONLC.FOLLOW_MAX} houses.`);f.push({id:D.id,name:D.name})}A.follows=f;return {follows:mockFollows83(w,f)}},
  'wager.list':(w,d,me)=>{const f=mockFlag80(w,me);const open=Object.values(w.lobbies).filter(L=>(L.status==='waiting'||L.status==='live')&&!L.mock&&!!L.flag===f&&((L.bets||[]).length||(L.pot|0))).slice(0,30)
      .map(L=>({id:L.id,ev:L.ev,loc:L.loc,status:L.status,ranked:!!L.ranked,seats:L.seats,players:(L.players||[]).map((p,i)=>({seat:i,name:p.name,domus:p.domus||null,cls:p.kit&&p.kit.cls||null})),...ONLC.oddsOf(L)}));
    const mine=mockIsGuest82(me)?[]:((w.bets83||{})[me]||[]).slice(0,30);const wk=ONLC.weekKey(Date.now());const T=(w.wk83||{})[wk]||{};
    const top=Object.entries(T).sort((a,b)=>(b[1].net|0)-(a[1].net|0)).slice(0,10).map(([a,x])=>({name:x.name||mockName80(w,a),domus:x.domus||(w.accounts[a]||{}).dname||null,dom:(w.accounts[a]||{}).domus||null,net:x.net|0,won:x.won|0,staked:x.staked|0}));
    return {open,mine,top,week:wk}},
  'lobby.hold':(w,d,me)=>{const L=mockLobby80(w,d.id);if(L.host.id!==me)throw new Error(_T('Only the host holds the horns.'));if(L.status!=='waiting')throw new Error(_T('Already under way.'));if(ONLC.stopCount(L))mockUpd80(w,L,{held:1});return mockRoomOut80(w,L)}});
/* guests may read house pages and the open pots */
{const base=mockReq;mockReq=async function(t,d){const me=mockMe();
  if(me&&!mockIsGuest82(me)&&['offer.buy','offer.bring','gear.repair','domus.buy','gift.open','loot.pick','market.buy','domus.follow'].includes(t)){const w=mockLoad();const A=w.accounts[me];if(A&&!A.domus)throw onlErr82(_T('Name your house first — every lanista needs a Domus.'),'need_domus')}
  return base.apply(this,arguments)}}
/* the countdown: Start → startAt; {go:1} at startAt → the horns; ✕ Hold or a line-up change stops it */
{const base=MOCK_ROUTES['lobby.start'];MOCK_ROUTES['lobby.start']=(w,d,me)=>{const ms=mockCount83();if(ms<=0)return base(w,d,me);const L=mockLobby80(w,d.id);ONLC.countCheck(L);const now=mockNow();
  if(L.startAt==null){if(d.go)throw onlErr82(_T('The countdown was stopped — press Start again.'),'count_stopped');const conn={};const here=new Set(mockHere80(w).map(h=>h.id));for(const p of ONLC.humansOf(L))conn[p.id]=here.has(p.id);
    const why=ONLC.canStart(L,me,conn);if(why)throw new Error(why);L.startAt=now+ms;L.startBy=me;L.startSig=ONLC.lineupSig(L);mockUpd80(w,L,{count:L.startAt});return {...mockRoomOut80(w,L),now}}
  if(now<L.startAt){if(!d.go&&me===L.host.id)return {...mockRoomOut80(w,L),now};throw onlErr82(_T('The horns are not yet.'),'count_wait',{startAt:L.startAt,now})}
  const seated=L.players.some(p=>p.id===me);if(me!==L.host.id&&!(seated&&now>=L.startAt+5000))throw new Error(_T('The host sounds the horns.'));
  ONLC.stopCount(L);return base(w,d,L.host.id)}}
{const base=mockUpd80;mockUpd80=function(w,L){try{if(L&&L.status==='waiting')ONLC.countCheck(L)}catch(e){}return base.apply(this,arguments)}}
/* Ludi Infames: Veteranus and above */
{const base=MOCK_ROUTES['lobby.create'];MOCK_ROUTES['lobby.create']=(w,d,me)=>{if(d&&d.inf&&mockGroup(w,me).some(x=>ONLC.rankIdx(x.rank||'tiro')<ONLC.rankIdx(ONLC.INFAMES_MIN)))throw new Error(_T('Ludi Infames: Veteranus and above.'));return base(w,d,me)}}
{const base=MOCK_ROUTES['lobby.quick'];MOCK_ROUTES['lobby.quick']=(w,d,me)=>{if(!d||!d.inf)return base(w,d,me);const g=mockGroup(w,me);if(g.some(x=>ONLC.rankIdx(x.rank||'tiro')<ONLC.rankIdx(ONLC.INFAMES_MIN)))throw new Error(_T('Ludi Infames: Veteranus and above.'));
  const now=mockNow();const flag=g.some(x=>x.strikes>=ONLC.STRIKES_OUT);const ev=ONLC.EVENTS_ALL.includes(d.ev)?d.ev:'democritus';const L=ONLC.quickPick(Object.values(w.lobbies).filter(x=>!x.mock),g,ev,!!d.ranked,flag,now,true);
  if(L){const why=ONLC.roomJoin(L,g,now);if(why)throw new Error(why);mockUpd80(w,L);return {lobby:mockRoomOut80(w,L),made:false}}return {lobby:mockRoomOut80(w,mockCreate80(w,{ev,ranked:!!d.ranked,inf:1},me,true)),made:true}}}
/* hello: the houses you follow, your open loot windows, Victor of the Day */
{const base=MOCK_ROUTES['hello'];MOCK_ROUTES['hello']=(w,d,me)=>{try{mockVday83(w);mockLootSweep83(w)}catch(e){}const o=base(w,d,me);const A=me&&w.accounts[me];
  if(A&&!mockIsGuest82(me)){o.follows=mockFollows83(w,A.follows||[]);o.loot=mockLootMine83(w,me).map(mockLootOut83)}return o}}
{const base=MOCK_ROUTES['world.news'];MOCK_ROUTES['world.news']=(w,d,me)=>{try{mockVday83(w)}catch(e){}return base(w,d,me)}}
{const base=MOCK_ROUTES['domus.get'];MOCK_ROUTES['domus.get']=(w,d,me)=>{const o=base(w,d,me);const A=w.accounts[me];const D=mockDomus82(w,A&&A.domus);o.pcs=(D&&D.pcs)||{};o.trophies=(D&&D.trophies)||[];o.recent=(D&&D.recent)||[];return o}}
{const base=MOCK_ROUTES['domus.move'];MOCK_ROUTES['domus.move']=(w,d,me)=>{const o=base(w,d,me);const A=w.accounts[me];const D=mockDomus82(w,A&&A.domus);for(const k of ['from','to'])if(o[k]&&o[k].house)o[k]=mockShelf83(D);return o}}
/* a bet's own line in the bettor's history and the week's tally */
{const base=MOCK_ROUTES['bet.place'];MOCK_ROUTES['bet.place']=(w,d,me)=>{const r=base(w,d,me);try{const L=w.lobbies[d.id];const b=(L.bets||[])[L.bets.length-1];if(b&&b.by===me&&!b.bk){
    b.bk='B#'+String(Date.now()).padStart(13,'0')+'#'+L.id+'#'+Math.floor(Math.random()*1e6).toString(36);const p=L.players[b.seat];w.bets83=w.bets83||{};
    (w.bets83[me]=w.bets83[me]||[]).unshift({id:b.bk,room:L.id,ev:L.ev,loc:L.loc,ranked:!!L.ranked,seat:b.seat,amt:b.amt,target:p?p.name:'CPU',at:Date.now(),res:'open',pay:0});w.bets83[me]=w.bets83[me].slice(0,60);
    const wk=ONLC.weekKey(Date.now());w.wk83=w.wk83||{};const T=(w.wk83[wk]=w.wk83[wk]||{});const x=(T[me]=T[me]||{net:0,won:0,staked:0});x.staked+=b.amt;x.name=mockName80(w,me);x.domus=(w.accounts[me]||{}).dname||null;
    if(r&&r.lobby)r.lobby=mockRoomOut80(w,L)}}catch(e){console.error(e)}return r}}
/* a called-off game: its bets are refunds in the history */
{const base=mockClose;mockClose=function(w,L){const bets=(L&&L.bets||[]).slice();const r=base.apply(this,arguments);try{mockBetsMark83(w,bets,bets.map(b=>({res:'refund',pay:b.amt|0})))}catch(e){}return r}}
/* the settlement extras (as settleMatch): the treasury's cut, broken pieces, offerings back, the dead's gear, trophies, recent, bet history */
function mockAfter83(w,L,M,a,i,row,out,gx){const ch=w.chars[L.players[i].char];if(!ch)return;const D=mockDomus82(w,ch.domus);
  if(D){D.treasury=(D.treasury|0)+((out&&out.cut)|0);for(const P of gx.left||[])ONLC.putPiece(D,P,false);for(const k of ONLC.trophiesFrom(ch,row,out,!!L.ranked,L.ev))ONLC.trophyAdd(D,k,ch.name,Date.now());
    ONLC.recentAdd(D,ONLC.recentRow({id:L.id,ev:L.ev,loc:L.loc,at:Date.now(),ranked:!!L.ranked},ch,row,out))}}
{const base=MOCK_ROUTES['match.result'];MOCK_ROUTES['match.result']=(w,d,me)=>{const L=w.lobbies[d.id];const M=w.matches[d.id];const was=M&&M.status;const had=new Set(Object.keys((M&&M.outs)||{}));
  const bets=(L&&L.bets||[]).slice();const r=base(w,d,me);
  try{if(L&&M&&M.status==='done'&&was!=='done'){const A=ONLC.agree(M.reports||{});const gs=[];
    L.players.forEach((p,i)=>{const out=(M.outs||{})[p.id];if(!out||had.has(p.id)||/^bot/.test(p.id))return;const ch=w.chars[p.char];const row=(A.table||[]).find(x=>x.seat===i);if(!ch||!row)return;
      const gx=ONLC.gearAfter(ch,p.kit,row,!!L.ranked);out.broken=gx.broken;out.gone=gx.gone||[];out.dmg=gx.dmg||[];out.offBack=gx.offBack;mockAfter83(w,L,M,p.id,i,row,out,gx);gs.push({acct:p.id,i,ch,row,out,gx})});
    for(const s of gs)if(s.out.died&&s.gx.carried.length){const from={house:(w.accounts[s.acct]||{}).dname||null,glad:s.ch.name};const ks=s.row.ks;
      const k=s.row.kb==='g'&&ks>=0?gs.find(z=>z.i===ks&&z.acct!==s.acct&&!z.out.died&&!(M.abandoned||{})[z.acct]):null;
      if(k){const Ps=s.gx.carried.map(P=>ONLC.tagPiece(P,s.ch));const cat=onlCatalog();w.loot83=w.loot83||{};
        const X={match:L.id,seat:s.i,dead:{acct:s.acct,char:s.ch.id,name:s.ch.name,cls:s.ch.cls,domus:from.house},killer:{acct:k.acct,char:k.ch.id,seat:k.i},until:Date.now()+ONLC.LOOT_MS,done:false,
          pieces:Ps.map(P=>{const I=ONLC.pieceInfo(P,cat)||{};return {item:P.item,pc:P.pc||null,n:I.n,kind:I.kind,lv:I.lv,st:I.st,rar:I.rar||null,val:I.val|0}})};
        w.loot83[L.id+'#'+s.i]=X;mockTo([k.acct],'loot.offer',mockLootOut83(X))}
      else for(const P of mockLeaving83(s.gx.carried,s.ch,from,'fell'))mockToMarket83(w,P,from)}
    if(bets.length){const wins=A.void?[]:(A.table||[]).filter(x=>x.won).map(x=>x.seat);mockBetsMark83(w,bets,ONLC.betResults(bets,wins,{pot:L.pot|0,void:!!A.void}))}
    if(r&&r.out&&gs.some(s=>s.acct===me)){const s=gs.find(z=>z.acct===me);r.out=s.out;r.char=s.ch}}}catch(e){console.error(e)}return r}}
{const base=MOCK_ROUTES['match.abandon'];MOCK_ROUTES['match.abandon']=(w,d,me)=>{const L=w.lobbies[d.id];const i=L?L.players.findIndex(x=>x.id===me):-1;const p=i>=0?L.players[i]:null;const ch=p&&w.chars[p.char];
  const r=base(w,d,me);try{if(r&&r.out&&r.out.died&&ch&&L.ranked){const gx=ONLC.gearAfter(ch,p.kit,{survives:false},true);mockAfter83(w,L,null,me,i,{won:false,place:L.seats,f:0},r.out,gx);
    const from={house:(w.accounts[me]||{}).dname||null,glad:ch.name};for(const P of mockLeaving83(gx.carried,ch,from,'fell'))mockToMarket83(w,P,from)}}catch(e){console.error(e)}return r}}
