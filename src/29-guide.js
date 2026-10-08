/* =====================================================================
   29-GUIDE · THE NEW PLAYER'S COMPANION (v0.37)
   =====================================================================
   Everything that helps a newcomer read the sand, in one place:
   • turnSuggest(p): ONE recommended move each turn — its button glows gold, its tile rings gold on the
     board, a brief vignette points at it, and a line in the hint dock says why (Settings → Turn hints).
   • Rule hints: hovering a tile, figure or action button adds what the RULES say about it.
   • Turn recap: what the crowd, the beasts and the arena did since your last turn.
   • Context menus: right-click / long-press anything on the sand for every action you can take there.
   • Step speed: every CPU action waits for Next ▶ (or Space), captioned — and, with hints on, the why.
   • Learn to play: a short guided bout, Flavius coaching step by step with the spotlight.
   ===================================================================== */
/* GUIDE — the companion's state: which event it follows, the last suggestion key, where each player's recap starts, the recap lines. */
const GUIDE={S:null,key:'',from:{},activeP:null,recap:[],vigT:0};
/* gTxt — a log line as plain escaped text (tags stripped). */
const gTxt=text=>esc(String(text||'').replace(/<[^>]+>/g,''));
/* gOn — is this guide feature on? Every hint needs the master Hints switch; the context menu is a tool and only needs its own. */
const gOn=key=>typeof SETTINGS==='undefined'||((key==='ctxMenu'||HINTS)&&SETTINGS[key]!==false); // v0.43: the master Hints switch gates every hint (context menus are a tool, not a hint)

/* ---------------- 1 · the suggestion engine ---------------- */
/* turnSuggest — the ONE recommended move for a human's turn: the choice (card when safe, else coin), the best attack, a playable item, loot, the chest, a tunnel escape, back into the zone, toward a pot, else end. TWEAK: the attack scores (90+CF for a kill, 55 hunted, 40+8 per weak spot) and the 40 bar. */
function turnSuggest(player){
  if(!S||S.over||!player||player.cpu)return null;
  if(S.phase==='choice'){
    const safe=!hurtBad(player)&&player.cf>=4;
    if(canDraw()&&safe)return {act:'card',text:_T`Draw an arena card — you are healthy and have Crowd Favor to spare, so a card's swing is worth the risk.`};
    return {act:'coin',text:hurtBad(player)?_T`Take the ${coinAmt87(2)} — you are hurt, and a bad card could finish you.`:_T`Take the safe ${coinAmt87(2)}: it buys armor and weapons at the market.`}}
  if(S.phase!=='action'||isChariot()||isNaum())return S.phase==='action'?{act:'end',text:_T('Make your moves, then end your turn.')}:null;
  const srcs=attackSources(player);let best=null;
  for(const s of srcs){const pw=srcPow(s)+(player.hercules||0);
    for(const t of targetsFor(player,s)){let sc=0,why='';
      if(t.kind==='npc'){const n=t.ref;const T=NPCT[n.t];if(n.hp<=pw*2){sc=90+T.cf;why=_T`${n.name} is down to ${n.hp} HP — a hit or two finishes it: ${cfAmt87(T.cf)}, ${coinAmt87(T.coin+n.hoard)} and a trophy.`}
        else if(n.aggro===player.id){sc=55;why=_T`${n.name} is hunting you anyway — hurt it while it is in reach.`}else{sc=25;why=_T`${n.name} is in reach, but attacking makes it hunt you.`}}
      else if(t.kind==='pot'){sc=pw>=2?60:30;why=pw>=2?_T`A Blessings pot is in reach. With power ${pw} you can break it (it needs 2 damage): ${coinAmt87(2)}, ${cfAmt87(1)} and a hidden offering.`:_T`A Blessings pot is in reach — at power ${pw} you need both hit dice to land.`}
      else if(t.kind==='player'){const q=t.ref;const weak=LOCS.filter(l=>q.hp[l]>0&&q.hp[l]+q.ap[l]<=pw).length;sc=40+weak*8+(q.cf>player.cf?5:0);why=_T`${q.name} is in reach${weak?_T` with ${weak} location${weak>1?'s':''} one strong hit from falling`:''}. Gladiator trophies are worth ${cfAmt87(10)}.`}
      if(!best||sc>best.sc)best={sc,s,t,why}}}
  if(best&&best.sc>=40){const id='m-atk'+best.s.arm+(best.s.thr?'T':'');return {act:id,mode:id.slice(2),tile:{r:best.t.r,c:best.t.c},text:_T`${best.s.thr?_T('Throw'):_T('Attack')} with your ${best.s.w.n}: ${best.why}`}}
  {const it=guideItemSug(player);if(it&&(!best||best.sc<55))return it} // v0.44: what is in your hand counts too
  const loot=lootOptions(player).filter(o=>o.t==='fw'||!player.looted);
  if(loot.length)return {act:'loot',text:_T('You are standing on dropped gear — loot one item this turn.')};
  if(typeof canOpenChest==='function'&&canOpenChest(player))return {act:'chest',text:_T('You hold a key and stand at the Arena Chest: open it for a level-4 weapon.')};
  const threat=S.npcs.find(n=>n.alive&&n.tamedBy==null&&n.aggro===player.id&&cheb(n,player)<=2&&npcStats(n).ap>=3);
  if(threat&&hurtBad(player)&&tunnelExits(player).length)return {act:'m-tunnel',mode:'tunnel',text:_T`${threat.name} is on you and you are badly hurt — dive into a tunnel (1 key) to escape.`};
  if(player.mv>0){const R=reach(player);
    // outside the zone: get back in
    if(RD().zone>1&&!inZone(player.r,player.c)){let tgt=null;for(const [k,c] of R.tiles)if(c<=player.mv&&inZone(Math.floor(k/N),k%N)&&(!tgt||c<tgt.c))tgt={k,c};
      if(tgt)return {act:'m-move',mode:'move',tile:{r:Math.floor(tgt.k/N),c:tgt.k%N},text:_T`You are outside the zone — get back in before your turn ends, or it costs ${cfAmt87(2)}.`}}
    // walk to the nearest pot
    const pls=S.pillars.filter(x=>x.pots.length).sort((a,b)=>cheb(player,a)-cheb(player,b));
    if(pls.length&&cheb(player,pls[0])>1){let tgt=null;for(const [k,c] of R.tiles){if(c>player.mv)continue;const r=Math.floor(k/N),cc=k%N;const d=Math.max(Math.abs(r-pls[0].r),Math.abs(cc-pls[0].c));const sc=(d===1?0:d*10)+c;if(!tgt||sc<tgt.sc)tgt={r,c:cc,sc,adj:d===1}}
      if(tgt)return {act:'m-move',mode:'move',tile:{r:tgt.r,c:tgt.c},text:tgt.adj?_T`Move next to the pillar at ${tl(pls[0].r,pls[0].c)} — its Blessings pot will be in reach to attack.`:_T`Head for the pillar at ${tl(pls[0].r,pls[0].c)}: its Blessings pot is worth coin, CF and an offering.`}}}
  if(best)return {act:'m-atk'+best.s.arm+(best.s.thr?'T':''),mode:('m-atk'+best.s.arm+(best.s.thr?'T':'')).slice(2),tile:{r:best.t.r,c:best.t.c},text:_T`${best.s.thr?_T('Throw'):_T('Attack')} with your ${best.s.w.n}: ${best.why}`};
  return {act:'end',text:_T('Nothing better to do this turn — end it and let the arena move.')}}

/* v0.46: only point at a card or offering the player can actually use right now, to some effect */
/* itemPlayable — can this card or offering in hand be used right now, to some effect? */
function itemPlayable(player,item){try{const k=String(item.key||'');const hurt=typeof hurtBad==='function'&&hurtBad(player);
  if(item.kind==='offer'){if(/^elix/.test(k))return hurt;if(/^ap/.test(k))return LOCS.some(l=>player.hp[l]>0);if(k==='eagle')return cfAllowed();return /^m[wa]\d|^merc/.test(k)}
  if(item.kind!=='card')return false;const C=CARDS[k];if(!C)return false;
  const foes=activePlayers().filter(q=>q!==player&&!q.underground);const beastsNear=S.npcs.filter(n=>n.alive&&n.t!=='zora');
  switch(k){case 'elixir4':case 'elixir2':return hurt;case 'hygeia':return LOCS.some(l=>player.hp[l]<=0&&l!=='head'&&l!=='chest');
    case 'rete':return typeof reteTargets==='function'&&reteTargets(player).length>0;
    case 'lure':return beastsNear.length>0&&foes.some(q=>cheb(player,q)<=4);
    case 'lyre':case 'tame':return S.npcs.some(n=>typeof tameable==='function'&&tameable(n)&&n.tamedBy!==player.id&&cheb(player,n)<=6);
    case 'focus':case 'hercules1':case 'hercules2':{const srcs=attackSources(player);return srcs.some(s0=>targetsFor(player,s0).some(t=>t.kind==='player'||t.kind==='npc'))}
    case 'forge3':case 'forge2':return LOCS.some(l=>player.hp[l]>0);
    case 'discount':case 'mchoice':return player.market&&player.coin>=2;
    case 'ward':return foes.length>0;case 'zora':return !player.noEagle;
    default:return false}}catch(e){return false}}
/* guideItemSug — a suggestion to use the first playable item in hand (its board button glows). */
function guideItemSug(player){if(S.phase!=='action'||!player.items||!player.items.length)return null;
  for(const it of player.items){if(it.kind==='mf')continue;const btn=document.querySelector(`#board [data-act="item"][data-id="${it.id}"]`);if(!btn)continue;let I={n:'it'};try{I=itemInfo(it)}catch(e){}
    if(!itemPlayable(player,it))continue;
    if(it.kind==='offer')return {sel:`#board [data-act="item"][data-id="${it.id}"]`,text:_T`Use your <b>${esc(I.n)}</b> from your hand${I.d?` — ${esc(I.d)}`:''}. Offerings are free to use on your turn.`};
    if(it.kind==='card')return {sel:`#board [data-act="item"][data-id="${it.id}"]`,text:_T`You hold the <b>${esc(I.n)}</b> card${I.d?` — ${esc(I.d)}`:''}. Play it when it helps (its Use button is on your board).`}}
  return null}
/* ---------------- 2 · the spotlight ---------------- */
/* guideVignette — dims the screen around an element (or a rect) for a moment. TWEAK: 2.3 s (4.2 s in the lesson). */
function guideVignette(el){if(HEADLESS||!el)return;let v=document.getElementById('hintVig');if(!v){v=document.createElement('div');v.id='hintVig';document.body.appendChild(v)}
  const r=el.getBoundingClientRect?el.getBoundingClientRect():el;const x=r.left+r.width/2,y=r.top+r.height/2;
  v.style.background=`radial-gradient(circle at ${x}px ${y}px, transparent 0, transparent ${Math.max(60,r.width*0.7)}px, rgba(8,5,3,.55) ${Math.max(200,r.width*1.8)}px)`;
  v.classList.add('on');clearTimeout(GUIDE.vigT);GUIDE.vigT=setTimeout(()=>v.classList.remove('on'),TUT.on?4200:2300)}
/* guideAfterRender — after each render: builds the "since your last turn" recap and the suggested move in the hint dock, makes the button glow or rings the tile, and spotlights a new suggestion. */
function guideAfterRender(player){
  if(HEADLESS||!S)return;
  if(GUIDE.S!==S){GUIDE.S=S;GUIDE.key='';GUIDE.from={};GUIDE.activeP=null;GUIDE.recap=[];S.sugTile=null}
  // the recap window closes when a human's turn ends
  if(GUIDE.activeP!=null&&(!cur()||cur().id!==GUIDE.activeP||S.over)){GUIDE.from[GUIDE.activeP]=(S.logLines||[]).length;GUIDE.activeP=null}
  const dock=document.getElementById('hintDock');
  if(S.over||!player||player.cpu||!(S.phase==='choice'||S.phase==='action')){S.sugTile=null;return}
  // a new human turn: gather the recap
  if(GUIDE.activeP==null){GUIDE.activeP=player.id;const from=GUIDE.from[player.id];GUIDE.recap=[];
    if(from!=null&&gOn('turnRecap')){const L=(S.logLines||[]).slice(from).filter(l=>l.cls!=='hd'&&l.text&&l.text.length>6);
      const mine=L.filter(l=>l.text.includes(player.name));const loud=L.filter(l=>!mine.includes(l)&&(l.cls==='big'||l.cls==='bad'));
      GUIDE.recap=[...mine.slice(-5),...loud.slice(-4)].slice(-7)}}
  let html='';
  if(GUIDE.recap.length&&gOn('turnRecap'))html+=`<details class="hintbox recapbox" open><summary>${_T`<b>📰 Since your last turn</b>`}</summary><ul>${GUIDE.recap.map(l=>`<li class="${l.cls||''}">${gTxt(l.text)}</li>`).join('')}</ul></details>`;
  // the suggestion (the tutorial's script outranks it)
  const sug=TUT.on?tutSuggest(player):(HINTS&&gOn('turnHints')?turnSuggest(player):null);
  document.querySelectorAll('.sugglow').forEach(x=>x.classList.remove('sugglow'));
  S.sugTile=null;
  if(sug){const btn=sug.sel?document.querySelector(sug.sel):sug.act?document.querySelector(`#actions [data-act="${sug.act}"]`):null;
    const modeOn=sug.mode&&S.mode===sug.mode;
    if(btn&&!modeOn)btn.classList.add('sugglow');
    if(sug.tile&&(modeOn||!btn))S.sugTile=sug.tile;
    if(!TUT.on)html=`<div class="hintbox sugbox">${_T`<b>💡 Suggested</b> ${sug.text}${sug.tile&&!modeOn?_T(' <span class="rc-sub">(then the gold tile on the board)</span>'):''}`}</div>`+html;
    const k=S.turnNo+'|'+sug.act+'|'+(sug.tile?sug.tile.r+','+sug.tile.c:'')+'|'+(modeOn?1:0);
    if(k!==GUIDE.key){GUIDE.key=k;const tgt=btn&&!modeOn?btn:S.sugTile?guideTileRect(S.sugTile):null;if(tgt)setTimeout(()=>guideVignette(tgt),60)}}
  if(dock&&html)dock.innerHTML=html+dock.innerHTML}
/* guideTileRect — a board tile as a screen rect (for the spotlight). */
function guideTileRect(tile){const b=cv.getBoundingClientRect();const m=center(tile.r,tile.c);return {left:b.left+m.x-TW*0.5,top:b.top+m.y-TW*0.4,width:TW,height:TW*0.8}}
/* drawSugTile — rings the suggested tile in pulsing gold on the canvas. */
function drawSugTile(){if(!S||!S.sugTile||S.over)return;const m=center(S.sugTile.r,S.sugTile.c);const ph=(performance.now()%1400)/1400;
  ctx.save();ctx.strokeStyle='#f0cf7d';ctx.shadowColor='rgba(240,207,125,.9)';ctx.shadowBlur=12;ctx.lineWidth=2.5+Math.sin(ph*Math.PI*2)*1;
  ell(m.x,m.y,TW*(0.4+ph*0.06),TW*(0.2+ph*0.03));ctx.stroke();ctx.restore();
  if(!GUIDE.raf)GUIDE.raf=requestAnimationFrame(()=>{GUIDE.raf=0;try{if(S&&S.sugTile)draw()}catch(e){}})}

/* ---------------- 3 · rule hints ---------------- */
/* RULE_TILE — the rule hint lines for what can stand on a tile. */
const RULE_TILE={
  pillar:_T('Pillars: from an adjacent tile you can attack the Blessings pots on top — 2 damage breaks one (2 coin, 1 CF, a hidden offering). Push a pillar (2 movement) onto a tunnel to seal it, or topple it (3 movement): the next two tiles take 3 damage and every pot breaks.'),
  player:_T('Gladiators: roll the hit die for each point of your weapon’s power; each hit lands on a rolled body location, armor first, then HP. A limb at 0 is severed; a head or chest at 0 eliminates. A gladiator trophy is worth 10 CF.'),
  npc:_T('Beasts: attacking one makes it hunt you (aggro). Slaying it earns its coin, CF and a trophy. Raged beasts hit harder; Fazed ones slow down. A beast that kills you costs you 5 CF.'),
  tunnel:_T('Tunnels: 1 Arena Key takes you underground. You choose the exit tunnel, your turn ends, and you surface there at the start of your next turn — untouchable while underground. A gladiator standing on a tunnel is fair game. A pillar pushed onto a tunnel seals it.'),
  spike:_T('Floor spikes: entering this tile deals 2 damage. Push rivals and beasts onto them.'),
  chest:_T('The Arena Chest: 1 Arena Key opens it for a level-4 weapon. You can also pick it up and carry it (−1 movement while held).'),
  pile:_T('Dropped gear: standing on it, you may loot 1 item a turn (thrown weapons are always free to pick up).'),
  zone:'Outside the zone: after your grace turns, ending your turn here costs 2 CF.',
  offer:_T('An offering in the sand: step on it to pick it up.')};
/* RULE_ACT — the rule hint lines for the action buttons. */
const RULE_ACT={'m-move':_T('Move: straight steps cost 1 movement, diagonals 2. Orange tiles show where you can go and what it costs.'),
  'm-push':_T('Push (2 movement): shove an adjacent pillar, gladiator or beast one tile away — onto spikes, or a pillar onto a tunnel.'),
  'm-topple':_T('Topple (3 movement): bring down an adjacent pillar. Anything on the next two tiles takes 3 damage; every pot on it breaks.'),
  'm-tunnel':_T('Tunnel (1 Arena Key): go underground and surface at another open tunnel. Ends your turn.'),
  chest:_T('Open the Arena Chest (1 Arena Key): take a level-4 weapon.'),chestup:_T('Pick up the chest: −1 movement while you carry it.'),chestdown:_T('Drop the chest where you stand. Free.'),
  loot:_T('Loot: take one item from the gear at your feet this turn.'),market:_T('The market: 3 CF opens it for the turn; then buy by level (the market die picks the slot). Re-rolls cost 2 coin.'),
  crowd:_T('Crowd Favor: spend CF on keys, cards, elixirs and armor. Never let it fall below 0 — you would be eliminated.'),
  trade:_T('Trade or truce with a gladiator within 4 tiles. Truces break when Flavius decides — and an arena that ends in truce ends in a thumbs-down.'),
  spear:_T('Spear a spectator (3 CF, once per event): the crowd remembers.'),selfbet:_T('Wager on yourself at today’s odds — paid only if you win the event.'),
  zora:_T('Release Zora, the golden eagle, once per event: command him on your turn.'),exit:_T('Exit the arena: your event ends here, and your Fate is drawn on what you hold.'),
  end:'End your turn (Phase 4): the next gladiator moves, the beasts resolve.',focus:_T('Focus roll: spend all your movement to choose 1 of 3 rolled hit locations.'),
  coin:_T('Phase 2 · Choice: take 2 coin — the safe pick.'),card:_T('Phase 2 · Choice: draw an arena card — it can help you or hurt you, and some hit everyone.')};
/* ruleForTile — the rule hints for everything on a tile ('' when hints are off). */
function ruleForTile(tile){if(!gOn('ruleHints')||!HINTS||!S||!tile)return '';const {r,c}=tile;const out=[];
  if(pillarAt(r,c))out.push(RULE_TILE.pillar);if(playerAt(r,c))out.push(RULE_TILE.player);if(npcAt(r,c))out.push(RULE_TILE.npc);
  if(tunnelAt(r,c))out.push(RULE_TILE.tunnel);if(spikeAt(r,c))out.push(RULE_TILE.spike);
  if(S.chest&&S.chest.held==null&&S.chest.r===r&&S.chest.c===c)out.push(RULE_TILE.chest);
  if(pilesAt(r,c).some(pl=>!pileEmpty(pl)))out.push(RULE_TILE.pile);
  if(S.floor.some(f=>f.r===r&&f.c===c&&f.kind==='offer'))out.push(RULE_TILE.offer);
  if(!inZone(r,c))out.push(RULE_TILE.zone);
  return out.length?`<div class="rulehint">📜 ${out.map(esc).join('<br>📜 ')}</div>`:''}
/* ruleForAct — the rule hint for an action button. */
function ruleForAct(act){if(!act)return '';if(act.startsWith('m-atk'))return _T('Attack: roll the hit die per point of power (thrown weapons use their thrown numbers, a|b = normal|thrown). Each hit lands on a rolled location — armor first, then HP.');return RULE_ACT[act]||''}
document.addEventListener('mouseover',e=>{if(!gOn('ruleHints')||!HINTS)return;const b=e.target.closest&&e.target.closest('#actions [data-act]');if(!b)return;const t=ruleForAct(b.dataset.act);if(!t)return;
  const h=document.getElementById('hover');if(h)h.innerHTML=`<b>${esc((b.childNodes[0]&&b.childNodes[0].textContent)||'')}</b><div class="rulehint">📜 ${esc(t)}</div>`});

/* ---------------- 4 · context menus ---------------- */
/* ctxClose — removes the context menu. */
function ctxClose(){const m=document.getElementById('ctxMenu');if(m)m.remove()}
/* ctxItems — every action the current human can take on tile r,c (attack, push, topple, tunnel, move, actions on their own tile, trade) plus Inspect. */
function ctxItems(r,c){const items=[];if(!S||S.over)return items;const p=cur();
  const mine=humanTurn()&&S.phase==='action'&&!isChariot();
  if(mine){
    for(const s of attackSources(p))for(const t of targetsFor(p,s))if(t.r===r&&t.c===c){const id='atk'+s.arm+(s.thr?'T':'');
      items.push({l:`${s.thr?_T('🎯 Throw'):_T('⚔ Attack')} ${t.kind==='pot'?_T('the Blessings pot'):t.kind==='npc'?t.ref.name:t.ref.name} · ${s.w.n}`,run:()=>ctxTile(id,r,c)})}
    if(pushTargets(p).some(t=>t.r===r&&t.c===c))items.push({l:_T('✋ Push it away · 2 movement'),run:()=>ctxTile('push',r,c)});
    if(toppleTargets(p).some(t=>t.r===r&&t.c===c))items.push({l:_T('🏛 Topple the pillar · 3 movement'),run:()=>ctxTile('topple',r,c)});
    if(tunnelExits(p).some(t=>t.r===r&&t.c===c))items.push({l:_T('🕳 Tunnel out here · 1 key, ends turn'),run:()=>ctxTile('tunnel',r,c)});
    const R=reach(p);const cost=R.tiles.get(r*N+c);if(cost!=null&&cost<=p.mv)items.push({l:_T`👣 Move here · ${cost} movement`,run:()=>ctxTile('move',r,c)});
    if(p.r===r&&p.c===c){const pb=k=>document.querySelector(`#actions [data-act="${k}"]:not([disabled])`);
      for(const [k,l] of [['loot',_T('🎒 Loot the gear here')],['chest',_T('🗝 Open the Arena Chest')],['chestup',_T('📦 Pick up the chest')],['chestdown',_T('📦 Drop the chest')],['market',_T('⚖ Open the market')],['crowd',_T('🌾 Spend Crowd Favor')],['trade',_T('🤝 Trade or truce')],['end',_T('⏭ End turn')]])if(pb(k))items.push({l,run:()=>pb(k).click()})}
    const q=playerAt(r,c);if(q&&q!==p&&tradePartners(p).includes(q)){const tb=document.querySelector('#actions [data-act="trade"]');if(tb)items.push({l:_T`🤝 Trade or truce with ${q.name}`,run:()=>tb.click()})}}
  const q=playerAt(r,c);if(q)items.push({l:_T`🔍 Inspect ${q.name}`,run:()=>{if(!modalBusy())modal(q.name,boardHTML(q,false),[{label:_T('Close'),value:1}])}});
  return items}
/* ctxTile — runs a board action on tile r,c as if picked from the action bar. */
function ctxTile(mode,r,c){S.mode=mode;computeHL();render();onTile(r,c)}
/* ctxOpen — opens the context menu for a tile at the pointer: its name, the rule hints and the actions. */
function ctxOpen(e,tile){if(!gOn('ctxMenu')||!tile||!S)return;ctxClose();const items=ctxItems(tile.r,tile.c);
  const m=document.createElement('div');m.id='ctxMenu';m.className='ctxmenu';
  m.innerHTML=`<div class="ctxhd">${describeTile(tile)}</div>${ruleForTile(tile)}${items.length?items.map((it,i)=>`<button type="button" data-ci="${i}">${esc(it.l)}</button>`).join(''):`<div class="rc-sub" style="padding:6px 8px">${humanTurn()&&S.phase==='action'?_T('Nothing you can do here this turn.'):_T('Wait for your turn to act here.')}</div>`}`;
  document.body.appendChild(m);const W=m.offsetWidth,H=m.offsetHeight;m.style.left=Math.min(innerWidth-W-8,e.clientX+6)+'px';m.style.top=Math.min(innerHeight-H-8,e.clientY+6)+'px';
  m.addEventListener('click',ev=>{const b=ev.target.closest('[data-ci]');if(!b)return;const it=items[+b.dataset.ci];ctxClose();try{it.run()}catch(err){console.error(err)}})}
if(!HEADLESS&&typeof cv!=='undefined'){
  cv.addEventListener('contextmenu',e=>{if(!gOn('ctxMenu'))return;e.preventDefault();ctxOpen(e,pick(e))});
  let lp=null;cv.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch')return;const t=pick(e);lp=setTimeout(()=>{lp=null;ctxOpen(e,t)},560)});
  for(const ev of ['pointerup','pointermove','pointercancel'])cv.addEventListener(ev,()=>{if(lp){clearTimeout(lp);lp=null}});
  document.addEventListener('click',e=>{if(!e.target.closest('#ctxMenu'))ctxClose()},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')ctxClose()})}

/* ---------------- 5 · Step speed ---------------- */
/* STEP — Step speed state: where the caption's log lines start and the pending resolve. */
const STEP={from:0,res:null};
/* stepGate — should this CPU action wait for Next ▶? (Step speed, a CPU's turn with something new in the log.) */
function stepGate(){if(STEP.S!==S){STEP.S=S;STEP.from=S&&S.logLines?S.logLines.length:0}return !!(S&&!S.over&&!HEADLESS&&!S.sim&&S.players[S.cur]&&S.players[S.cur].cpu&&S.phase!=='setup'&&(S.logLines||[]).slice(STEP.from).some(l=>l.cls!=='hd'))}
/* stepWait — shows the step bar (the last log lines and, with hints, the CPU's thought) and waits for Next ▶ / Space. */
function stepWait(){return new Promise(res=>{STEP.res=res;
  const p=cur();const L=(S.logLines||[]).slice(STEP.from).filter(l=>l.cls!=='hd');const lines=L.slice(-3);
  let el=document.getElementById('stepBar');if(!el){el=document.createElement('div');el.id='stepBar';el.className='stepbar';cv.parentElement.appendChild(el)}
  const why=HINTS&&p&&p.lastThought?`<div class="stepwhy">${_T`💭 <b>${esc(p.name)}</b> thinks: “${esc(p.lastThought)}”`}</div>`:'';
  el.innerHTML=`<div class="stepcap"><span class="rc-sub">${esc(p?p.name:'CPU')} · step</span>${lines.length?lines.map(l=>`<div>${gTxt(l.text)}</div>`).join(''):'<div>…</div>'}${why}</div><button class="btn primary" type="button" id="stepNext">Next ▶<small>Space</small></button>`;
  el.hidden=false;document.getElementById('stepNext').onclick=stepGo;
  const poll=setInterval(()=>{if(SPEED!=='step'||!S||S.over){clearInterval(poll);stepGo()}},200);STEP.poll=poll})}
/* stepGo — closes the step bar and lets the CPU go on. */
function stepGo(){const el=document.getElementById('stepBar');if(el)el.hidden=true;if(STEP.poll){clearInterval(STEP.poll);STEP.poll=null}STEP.from=S&&S.logLines?S.logLines.length:0;const r=STEP.res;STEP.res=null;if(r)r()}
document.addEventListener('keydown',e=>{if(e.code==='Space'&&STEP.res&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();stepGo()}});

/* ---------------- 6 · Learn to play: the guided first bout ---------------- */
/* TUT — the lesson's state: on, current step, the pupil, scripted tiles and beasts. */
const TUT={on:false,step:0,p:null,done:{}};
/* v0.42: the lesson opens with a short tour of the screen — each part lit gold with a line on what it does —
   then the first turn. Two beasts are enough to open round two (or fourteen rotations), so the rivals meet.
   The coach always offers ✖ Exit tutorial; when the bout ends it offers the clean-up show or the menu. */
/* TUT_STEPS — the lesson script: the screen tour, then the bout steps (what Flavius says, what to press, when the step is done). */
const TUT_STEPS=[
  {id:'t_sand',spot:'#cv',say:_T`<b>The sand.</b> Thirteen by thirteen tiles: pillars carrying <b>Blessings pots</b>, tunnels, spikes, the Arena Chest — and the beasts. <b>Hover</b> anything to read it; <b>right-click</b> a tile for everything you can do there.`,next:1,tour:1},
  {id:'t_board',spot:'#board',say:_T`<b>Your player board.</b> Health (HP) and armor (AP) for each body location, your two weapons, your movement, and the cards and offerings in your hand. Lose your head or chest — and you are out.`,next:1,tour:1},
  {id:'t_roster',spot:'#roster',say:_T`<b>The gladiators.</b> Everyone on the sand at a glance: health, <b>Crowd Favor</b> (CF) and coin. Click one to see their board. CF decides your Fate at the end — and buys things mid-bout.`,next:1,tour:1},
  {id:'t_actions',spot:'#actions',say:_T`<b>Your actions.</b> The buttons for this phase of your turn. The one glowing <b style="color:var(--gold2)">gold</b> is a good idea.`,next:1,tour:1},
  {id:'t_hints',spot:'#hintDock',say:_T`<b>Hints.</b> A suggested move with its reason, and a recap of what happened while you waited.`,next:1,tour:1},
  {id:'t_speed',spot:'.speedseg',say:_T`<b>CPU speed.</b> Slow, Normal or Fast — or <b>⏯ Step</b> to watch each CPU move one at a time. <b>Space</b> pauses.`,next:1,tour:1},
  {id:'t_log',spot:'#log',say:_T`<b>The arena log.</b> Every roll, hit and cheer, newest first.`,next:1,tour:1},
  {id:'t_stand',spot:'#btnGraph',say:_T`<b>📊 Standings.</b> The race for Crowd Favor, as it stands — the dot wears the leader's color.`,next:1,tour:1},
  {id:'t_rules',spot:'#btnRules',say:_T`<b>📜 Tactics.</b> The rules at a glance, the strategy guides, the Quick Reference, the full rulebook — and these lessons, any time.`,next:1,tour:1},
  {id:'t_menu',spot:'#btnMenu',say:_T`<b>🏛 The main menu.</b> During a lesson it asks before you leave. (New events, Manager mode and Settings wait until the lesson is done.)`,next:1,tour:1},
  {id:'hello',info:1,say:_T`That is the arena. I am <b>Flavius</b>, editor of these games. Every turn has four phases: <b>1 Resolve</b> (the arena reacts), <b>2 Choice</b>, <b>3 Action</b>, <b>4 End</b>. I will light the button to press; I only step in to talk when something big happens.`,next:1},
  {id:'choice',say:_T`<b>Choice:</b> take the safe <b>${coinAmt87(2)}</b>.`,act:'coin',until:()=>S.phase==='action'},
  {id:'move',say:_T`<b>Move</b> to the gold tile beside the pillar — its <b>Blessings pot</b> holds coin, Crowd Favor and a hidden offering.`,sug:p=>tutGo(p,TUT.potTile),until:p=>p.r===TUT.potTile[0]&&p.c===TUT.potTile[1]},
  {id:'attack',say:_T`<b>Attack the pot</b> — press your attack, then the gold ring. It needs 2 damage to break (strike again if it holds).`,sug:p=>tutAtkSug(p,t=>t.kind==='pot'),until:p=>(p.stats.pots||0)>0,fallback:'end'},
  {id:'hand',say:_T`The pot gave you an offering — it waits in <b>your hand</b> on your board. Press its gold <b>Use</b>.`,sug:p=>guideItemSug(p),until:p=>!p.items.some(x=>itemPlayable(p,x)),next:1,skipLbl:_T('Keep it for later ▶')},
  {id:'tunnelinfo',info:1,say:_T`<b>Tunnels.</b> Beside you is a tunnel mouth. One <b>Arena Key</b> takes you under the sand: you surface at another tunnel <b>next turn</b>, and every beast forgets you. Your rival is across the arena — let us get closer.`,next:1},
  {id:'tunnel',say:_T`Press <b>Tunnel</b>, then the gold tunnel nearest your rival. (It ends your turn.)`,sug:p=>tutTunnelSug(p),until:p=>p.underground||cur()!==p},
  {id:'watch',say:_T`You are under the sand. Watch your rival go after the wolf…`,until:p=>humanTurn()&&cur()===p&&!p.underground,enter:()=>tutRivalHunt()},
  {id:'choice2',say:_T`You surface — and something stirs by the pillar beside you. <b>Take ${coinAmt87(2)}</b> first.`,act:'coin',until:()=>S.phase==='action',enter:()=>tutSpawnSnake()},
  {id:'snake',say:()=>_T`<b>${esc(TUT.snakeName||_T('The snake'))}</b> lurks by the pillar beside you. <b>Attack it</b> — slay it for Crowd Favor, coin and a trophy.`,sug:p=>tutAtkSug(p,t=>t.kind==='npc'&&t.ref.id===TUT.snakeId)||tutGo(p,[9,3]),until:()=>!tutSnake()||!tutSnake().alive||S.ri>0},
  {id:'endsnake',say:_T`Well struck. <b>End your turn</b>.`,act:'end',until:p=>S.ri>0||cur()!==p},
  {id:'wait2',say:_T`Two beasts are down — round two is coming…`,sug:p=>S.phase==='choice'?{act:'coin'}:null,until:p=>S.ri>0&&humanTurn()&&cur()===p},
  {id:'round2',info:1,say:()=>_T`<b>${esc(RD().n)}.</b> Two beasts are down, and with only two gladiators left the games go straight to the fight: the <b>zone has shrunk to ${ZONES[RD().zone][1]-ZONES[RD().zone][0]+1}×${ZONES[RD().zone][1]-ZONES[RD().zone][0]+1}</b> (outside it you bleed Crowd Favor) and gladiators may now fight each other. The handlers have driven you both together. You also drew <b>arena cards</b> for surviving round one — they are in your hand.`,next:1,enter:()=>tutRound2()},
  {id:'choice3',say:_T`<b>Take ${coinAmt87(2)}</b> — then we fight.`,act:'coin',until:()=>S.phase==='action'||S.phase!=='choice'},
  {id:'card',say:_T`Play <b>Herculean Vigor</b> from your hand: +2 damage if your next attack lands. Declare it <i>before</i> you attack.`,sug:p=>tutCardSug(p,'hercules2'),until:p=>(p.hercules||0)>0||!p.items.some(x=>x.key==='hercules2')},
  {id:'focus',say:_T`Now <b>🎯 Focus roll</b>: it spends your movement, but you choose where the blow lands from three rolled locations.`,sug:p=>!p.focusRoll&&tutAtkSug(p,t=>t.kind==='player')?{act:'focus',text:''}:null, /* v0.46: only when a blow can follow this turn — otherwise End turn */until:p=>p.focusRoll||p.mv<=0},
  {id:'strike',say:()=>_T`<b>Attack ${esc(tutRival()?tutRival().name:_T('your rival'))}</b> — then pick the <b>💡 gold</b> location: the quickest way to put them down.`,sug:p=>tutAtkSug(p,t=>t.kind==='player'),until:p=>p.attacks>0||S.over},
  {id:'fight',say:_T`Fight on until one of you falls: <b>move</b>, <b>Focus</b>, <b>attack</b> — and <b>End turn</b> when you are spent. The gold glow shows the way.`,sug:p=>tutFightSug(p),until:()=>S.over}];
/* tutAtkSug — suggests the first attack whose target passes pred. */
function tutAtkSug(player,pred){if(S.phase!=='action')return null;for(const s0 of attackSources(player)){const t=targetsFor(player,s0).find(pred);if(t){const id='m-atk'+s0.arm+(s0.thr?'T':'');return {act:id,mode:id.slice(2),tile:{r:t.r,c:t.c},text:''}}}return null}
/* the duel: attack if you can (Focus first while you have the legs for it), else close the distance, else end the turn */
/* tutFightSug — the duel: Focus then attack when in reach, else close in on the rival, else end the turn. */
function tutFightSug(player){if(S.phase!=='action')return null;const q=tutRival();if(!q||!q.alive)return null;
  const atk=tutAtkSug(player,t=>t.kind==='player');if(atk){if(player.mv>0&&!player.focusRoll&&!player.focusNext)return {act:'focus',text:''};return atk}
  if(player.mv>0){const R=reach(player);let best=null,bd=1e9;for(const [k,c] of R.tiles){if(c>player.mv)continue;const r=Math.floor(k/N),cc=k%N;if(!inZone(r,cc))continue; /* v0.46: never lead the pupil off the sand that is left */const d=cheb({r,c:cc},q);if(d<bd){bd=d;best=[r,cc]}}
    if(best&&cheb(player,q)>bd)return {act:'m-move',mode:'move',tile:{r:best[0],c:best[1]},text:''}}
  return {act:'end',text:''}}
/* tutGo — suggests moving to a given tile (none when already there). */
function tutGo(player,dest){if(S.phase!=='action'||!dest)return null;if(player.r===dest[0]&&player.c===dest[1])return null;return {act:'m-move',mode:'move',tile:{r:dest[0],c:dest[1]},text:''}}
/* tutTunnelSug — suggests the scripted tunnel exit (else the first one open). */
function tutTunnelSug(player){if(S.phase!=='action')return null;const ex=tunnelExits(player);if(!ex.length)return null;const t=ex.find(x=>x.r===TUT.exit[0]&&x.c===TUT.exit[1])||ex[0];return {act:'m-tunnel',mode:'tunnel',tile:{r:t.r,c:t.c},text:''}}
/* tutSnake — the lesson's snake. */
const tutSnake=()=>S.npcs.find(n=>n.id===TUT.snakeId);
/* tutRival — the lesson's CPU rival. */
const tutRival=()=>S.players.find(q=>q.cpu);
/* tutSnakeSug — the general suggestion while the snake step runs. */
function tutSnakeSug(player){if(S.phase!=='action')return null;const n=tutSnake();if(!n||!n.alive)return null;const s0=turnSuggest(player);if(s0&&s0.act&&s0.act.startsWith('m-atk'))return s0;return s0}
/* tutCardSug — suggests playing the card with this key from hand, when playable. */
function tutCardSug(player,cardKey){if(S.phase!=='action')return null;const it=player.items.find(x=>x.key===cardKey);if(!it||!itemPlayable(player,it))return null;return {sel:`#board [data-act="item"][data-id="${it.id}"]`,text:''}}
/* the rival takes the wolf (a scripted kill if the dice will not oblige) */
/* tutRivalHunt — marks the wolf the rival is meant to take. */
function tutRivalHunt(){const q=tutRival();const w=S.npcs.find(n=>n.t==='wolf'&&n.alive);if(!q||!w)return;
  setTimeout(()=>{if(!S||!S.tutorial||S.over)return;const w2=S.npcs.find(n=>n.t==='wolf'&&n.alive);if(w2&&cur()===q&&!S.busy){}},0);TUT.wolfId=w.id}
/* tutEnsureWolf — a scripted kill: the rival slays the wolf if the dice have not obliged by then. */
function tutEnsureWolf(){if(!S||!S.tutorial||S.over)return;const q=tutRival();const w=S.npcs.find(n=>n.id===TUT.wolfId&&n.alive);if(!w||!q||!q.alive)return;
  if(cur()===q&&!S.busy)return;hurtNPC(w,w.hp,q,_T`${q.name} runs the wolf through`);log(_T`${nm(q)} slays ${nm(w)} — one beast down.`,'big');checkEnd();render()}
/* round two: the handlers drive both fighters toward the centre; the rival arrives tired */
/* tutSpawnSnake — brings out the pupil's snake beside the pillar when they surface. */
function tutSpawnSnake(){if(TUT.snakeId||!TUT.snakeSpec)return;const n=mkNPC('snake',TUT.snakeSpec.key,9,2,{home:[9,2],zone:[8,10,1,3]});n.hp=2;n.name=TUT.snakeSpec.name;S.npcs.push(n);TUT.snakeId=n.id;log(_T`${nm(n)} slithers out of its hole by the pillar.`,'big');render()}
/* tutRound2 — round two: puts both fighters in the centre, tires the rival, and hands the pupil Herculean Vigor and some armor. */
function tutRound2(){if(TUT.r2)return;TUT.r2=1;const p=TUT.p,q=tutRival();if(!p||!q)return;
  const spots=[[7,6],[6,6],[7,5],[6,5]];const free=([r,c])=>!pillarAt(r,c)&&!unitAt(r,c);
  const a=spots.find(x=>free(x));if(a){p.r=a[0];p.c=a[1]}const b=[[a[0]-1,a[1]],[a[0],a[1]-1],[a[0]-1,a[1]-1]].find(x=>free(x)&&!(x[0]===p.r&&x[1]===p.c));if(b){q.r=b[0];q.c=b[1]}
  q.hp.chest=Math.min(q.hp.chest,2);q.ap.chest=0;q.items=(q.items||[]).filter(x=>x.kind!=='card'&&!CARDS[x.key]);q.hercules=0;q.focusNext=false;q.keys=0;q.tutTame=1;if(q.pers){q.pers.aggression=95;q.pers.survival=10}q.hp.head=Math.min(q.hp.head,3);q.ap.head=0;
  if(!p.items.some(x=>x.key==='hercules2'))p.items.push(mkCard('hercules2'));p.ap.chest=Math.max(p.ap.chest,4);p.ap.head=Math.max(p.ap.head,4);p.hp.chest=Math.max(p.hp.chest,6);p.hp.head=Math.max(p.hp.head,5);
  log(_T`The handlers drive ${nm(p)} and ${nm(q)} into the centre of the shrinking sand. ${nm(q)} arrives winded from the wolf.`,'big');render()}
/* tutPotMove — the general suggestion, kept only when it is a move or an attack. */
function tutPotMove(player){if(S.phase!=='action')return null;const s=turnSuggest(player);return s&&s.act==='m-move'?s:(s&&s.act.startsWith('m-atk')?s:null)}
/* tutSuggest — the lesson's suggestion for the current step (falls back to coin, or to ending the turn). */
function tutSuggest(player){const st=TUT_STEPS[TUT.step];if(!st||st.tour||st.info)return null;let r=null;if(st.sug)r=st.sug(player);else if(st.act)r={act:st.act,text:''};
  /* nothing to press for this step right now (the pot held, the rival is out of reach): end the turn and try again */
  if(!r&&S.phase==='choice'&&humanTurn()&&cur()===player)r={act:'coin',text:''};
  if(!r&&st.sug&&S.phase==='action'&&humanTurn()&&!(st.until&&st.until(player)))r={act:'end',text:''};return r}
/* tutSpot — lights one element in gold (the tour's spotlight). */
function tutSpot(sel){document.querySelectorAll('.tutspot').forEach(x=>x.classList.remove('tutspot'));if(!sel)return;const el=document.querySelector(sel);if(!el)return;el.classList.add('tutspot');try{el.scrollIntoView({block:'nearest',behavior:'smooth'})}catch(e){}if(typeof guideVignette==='function')guideVignette(el)}
/* tutCoach — draws the coach box: the step's line and buttons, the minimized pill, or the end-of-bout card. */
function tutCoach(){if(HEADLESS)return;let el=document.getElementById('tutCoach');
  const over=S&&S.tutorial&&S.over;
  if(!TUT.on&&!over){if(el)el.remove();tutSpot(null);return}
  if(!el){el=document.createElement('div');el.id='tutCoach';el.className='tutcoach';document.body.appendChild(el);
    el.addEventListener('click',e=>{const b=e.target.closest('[data-tut]');if(!b)return;const a=b.dataset.tut;
      if(a==='next')tutNext();else if(a==='skip'){TUT.hidden=1;tutCoach()}else if(a==='unhide'){TUT.hidden=0;el.dataset.h='';tutCoach()}else if(a==='exit')tutExit();else if(a==='show')tutShow();else if(a==='menu')tutToMenu()})}
  if(over){const won=(S.result&&S.result.winners||[]).includes(TUT.p?TUT.p.id:0);tutSpot(null);try{localStorage.setItem('flavius_tutDone','1')}catch(e){}
    const h=`<img src="${typeof flavFaceURL==='function'?flavFaceURL(won?'cheer':'pleased'):''}" alt=""><div><div class="tutstep">${_T`Learn to play · the bout is over`}</div><div>${_T`${won?_T('<b>Victory!</b> You are a graduate of the ludus — the crowd will remember the name.'):_T('<b>You fell</b> — but every champion did, once. The sand teaches.')} Stay for the <b>clean-up show</b>, or head back to the menu.`}</div>
      <div class="acts" style="margin-top:6px">${S.cleanDone?`<button class="btn tksm" type="button" disabled title="${_T`The crew has already swept the sand`}">${_T`🧹 The show is over`}</button><button class="btn primary tksm" type="button" data-tut="menu">${_T`🏛 Back to the main menu`}</button>`:`<button class="btn primary tksm" type="button" data-tut="show">${_T`🧹 Watch the clean-up show`}</button><button class="btn tksm" type="button" data-tut="menu">${_T`🏛 Back to the main menu`}</button>`}</div></div>`;
    if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h}return}
  if(TUT.hidden){const h=`<button class="btn tksm tutpill" type="button" data-tut="unhide">${_T`🎓 Show the coach`}</button>`;if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h;el.classList.add('mini')}tutSpot(null);TUT.lastSpot=null;return}
  el.classList.remove('mini');
  const st=TUT_STEPS[TUT.step];if(!st){tutEnd();return}
  if(st.spot!==TUT.lastSpot){TUT.lastSpot=st.spot;tutSpot(st.spot||null)}
  const tour=TUT_STEPS.filter(x=>x.tour).length;const n=TUT.step<tour?_T`The screen · ${TUT.step+1} of ${tour}`:_T`The bout · ${TUT.step-tour+1} of ${TUT_STEPS.length-tour}`;
  const say=typeof st.say==='function'?st.say():st.say;
  /* v0.46: Flavius only steps forward to TALK (the tour and the big moments); for a button to press he shrinks to a
     one-line cue, and he always stands clear of what he is pointing at */
  const cue=!st.tour&&!st.info&&!st.last;el.classList.toggle('cue',cue);
  const h=cue?`<img src="${typeof flavFaceURL==='function'?flavFaceURL('calm'):''}" alt=""><div><div class="tutstep">${_T`Learn to play · ${n}`}</div><div>${say}</div><div class="acts" style="margin-top:4px">${st.next?`<button class="btn primary tksm" type="button" data-tut="next">${st.skipLbl||_T('Next ▶')}</button>`:''}<button class="btn tksm" type="button" data-tut="exit">${_T`✖ Exit tutorial`}</button></div></div>`
    :`<img src="${typeof flavFaceURL==='function'?flavFaceURL(st.last?'cheer':'calm'):''}" alt=""><div><div class="tutstep">${_T`Learn to play · ${n}`}</div><div>${say}</div>
    <div class="acts" style="margin-top:6px">${st.next?`<button class="btn primary tksm" type="button" data-tut="next">${st.skipLbl||_T('Next ▶')}</button>`:''}<button class="btn tksm" type="button" data-tut="skip" title="${_T`A small 🎓 button stays in the corner to bring him back`}">${_T`Hide the coach`}</button><button class="btn tksm" type="button" data-tut="exit">${_T`✖ Exit tutorial`}</button></div></div>`;
  if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h}
  tutPlace(el)}
/* keep the coach clear of the thing he points at (and of the action dock): pick the corner furthest from it */
/* tutPlace — moves the coach to the corner that covers the least of the spotlight, the action dock, the hand and the top bar. */
function tutPlace(el){try{const tgt=document.querySelector('.tutspot,.sugglow');const W=innerWidth,H=innerHeight;
  let r=tgt?tgt.getBoundingClientRect():null;const dock=document.getElementById('actions');const dr=dock?dock.getBoundingClientRect():null;
  const hand=document.querySelector('#board .items');const hr=hand?hand.getBoundingClientRect():null;const bar=document.querySelector('header.bar');const br=bar?bar.getBoundingClientRect():null;
  const boxes=[r,dr,hr,br].filter(Boolean);const cw=el.offsetWidth||420,ch=el.offsetHeight||120;const cvr=cv.getBoundingClientRect();
  const top=Math.max(8,(br?br.bottom:60)+8);
  const cands=[{l:cvr.left+12,t:Math.max(top,cvr.top+12)},{l:cvr.right-cw-12,t:Math.max(top,cvr.top+12)},{l:14,t:H-ch-14},{l:W-cw-14,t:H-ch-14},{l:14,t:top},{l:W-cw-14,t:top}].map(c=>({l:Math.max(8,Math.min(W-cw-8,c.l)),t:Math.max(8,Math.min(H-ch-8,c.t))}));
  /* hit — how much of the boxes a corner position would cover. */
  const hit=c=>boxes.reduce((a,b)=>a+Math.max(0,Math.min(c.l+cw,b.right)-Math.max(c.l,b.left))*Math.max(0,Math.min(c.t+ch,b.bottom)-Math.max(c.t,b.top)),0);
  const best=cands.map(c=>({c,h:hit(c)})).sort((a,b)=>a.h-b.h)[0].c;
  el.style.left=best.l+'px';el.style.top=best.t+'px';el.style.right='auto';el.style.bottom='auto'}catch(e){}}
/* tutNext — advances to the next lesson step (the tour ending sets Normal speed). */
function tutNext(){const was=TUT_STEPS[TUT.step];TUT.step++;
  if(was&&was.tour&&!(TUT_STEPS[TUT.step]||{}).tour){setSpeedUI('normal')} // the tour is over — the bout begins
  if(TUT.step>=TUT_STEPS.length){tutEnd();return}tutCoach();try{render()}catch(e){}}
/* tutEnd — ends the lesson and remembers it is done. */
function tutEnd(){TUT.on=false;if(SPEED==='pause'&&S&&!S.over)setSpeedUI('normal');tutCoach();try{localStorage.setItem('flavius_tutDone','1')}catch(e){}try{render()}catch(e){}}
/* tutExit — asks, then abandons the lesson bout and returns to the main menu. */
async function tutExit(){if(typeof modalBusy==='function'&&modalBusy())return;const ok=await modal(_T('Leave the lesson?'),`<p>${_T`The bout is abandoned and you return to the main menu. You can take the lesson again any time.`}</p>`,[{label:_T('Leave the lesson'),value:1,primary:1},{label:_T('Stay'),value:0}],{close:0});if(!ok)return;
  TUT.on=false;if(S){S.over=true;S.cleanDone=1;S.tutorial=false}tutCoach();tutToMenu()}
/* tutShow — lets the clean-up show run (removes the coach and closes the result window). */
function tutShow(){if(S&&S.cleanDone)return;const el=document.getElementById('tutCoach');if(el)el.remove();if(S)S.tutShow=1;if(typeof modalDismiss==='function'&&!$('#modal').hidden)modalDismiss()}
/* tutToMenu — leaves the lesson for the main menu (with a fade). */
function tutToMenu(){const el=document.getElementById('tutCoach');if(el)el.remove();if(S)S.tutorial=false;if(typeof modalDismiss==='function'&&!$('#modal').hidden)modalDismiss();
  try{if(typeof cleanFinishNow==='function')cleanFinishNow()}catch(e){}const go=()=>{if(typeof menuShow==='function')menuShow()};if(typeof fadeTo==='function')fadeTo(go);else go()}
/* the clean-up show's last act: after the lesson, fade to black and back up at the main menu */
/* tutAfterShow — after the clean-up show, fades back to the main menu. */
function tutAfterShow(){if(S&&S.tutorial&&S.over){S.tutorial=false;setTimeout(()=>{const go=()=>{if(typeof modalDismiss==='function'&&!$('#modal').hidden)modalDismiss();if(typeof menuShow==='function')menuShow()};if(typeof fadeTo==='function')fadeTo(go);else go()},1800)}}
/* v0.45: a tour step is satisfied by trying the thing it points at — click it (and close any window it opens) and the coach moves on */
document.addEventListener('click',e=>{if(!TUT.on||!S||!S.tutorial||S.over)return;const st=TUT_STEPS[TUT.step];if(!st||!st.tour||!st.spot)return;const el=document.querySelector(st.spot);if(el&&e.target&&el.contains(e.target))TUT.advWait=TUT.step},true);
/* tutTick — the lesson's heartbeat (every 400 ms): round two, entering steps, the scripted wolf, and advancing when a step is done. */
function tutTick(){if(S&&S.tutorial&&S.over){tutCoach();return}if(!TUT.on)return;if(!S||S.over)return;
  if(S.tutorial&&S.ri>=1&&!TUT.r2&&TUT.p){try{tutRound2()}catch(e){console.error(e)}} /* v0.46: the moment the zone shrinks — before the rival's first turn in it */const st=TUT_STEPS[TUT.step];const p=TUT.p;
  if(TUT.advWait===TUT.step&&!modalBusy()){TUT.advWait=null;setTimeout(()=>{if(!modalBusy()&&TUT.on)tutNext()},500);return}
  if(st&&st.enter&&TUT.entered!==TUT.step){TUT.entered=TUT.step;try{st.enter()}catch(e){console.error(e)}}
  if(st&&['choice2','snake'].includes(st.id))tutEnsureWolf();
  if(st&&st.until&&p&&st.until(p))tutNext();else tutCoach()}
setInterval(()=>{try{tutTick()}catch(e){}},400);
/* startTutorial — starts the lesson: a staged Democritus bout vs one easy CPU, a fixed deck, one pot, the wolf for the rival and a snake for the pupil. */
async function startTutorial(){
  if(typeof menuHide==='function')menuHide();
  SETTINGS.hints=true;if(typeof applySettings==='function')applySettings();
  TUT.on=true;TUT.step=0;TUT.lastSpot=null;TUT.entered=-1;TUT.r2=0;TUT.hidden=0;
  const seats=[{cls:'soldier',cpu:false,name:'Tiro'},{cls:'slave',cpu:true,diff:'easy',name:genName()}];
  startEvent({ev:'democritus',loc:6,seats,opts:{...CFG.opts,spect:'auto'},tutorial:true});
  /* v0.46: a staged first bout — one pot, a tunnel, a snake of your own while the rival takes the wolf, then round two
     in the centre with an arena card and a Focus roll. The deck holds only the plain cards (no Telemachus, no stalls). */
  const G=S;S.tutorial=true;
  S.deck=['wealth3','elixir2','merc1','forge2','wealth5','elixir4','merc2','hercules1','wealth3','elixir2'];S.deck.unshift('endgame');
  S.round2=['hercules2','focus','hercules2','hercules2','focus','hercules2'];
  setTimeout(()=>{if(S!==G)return;const p=S.players[0],q=S.players[1];TUT.p=p;/* v0.95: sleep() now holds a wait that is already running when Pause is set, so pausing mid-Resolve would freeze the lesson before the human's Choice — pause once it is reached */{let n=0;const hold=()=>{if(S!==G||!TUT.on||SPEED==='pause')return;if(S.phase==='choice'||++n>150)setSpeedUI('pause');else setTimeout(hold,100)};hold()}
    p.r=12;p.c=9;p.keys=Math.max(p.keys||0,1);q.r=12;q.c=0;
    TUT.potTile=[10,9];TUT.exit=[9,3];
    const pl=S.pillars.find(x=>x.r===10&&x.c===10);if(pl)pl.pots=['ap2'];
    const wolf=S.npcs.find(n=>n.t==='wolf'),snake=S.npcs.find(n=>n.t==='snake');
    S.npcs=[wolf].filter(Boolean); /* the snake waits in its hole until you surface — it is yours */
    if(snake){TUT.snakeSpec={t:snake.t,key:snake.key||'Arenosus',name:snake.name}}
    if(wolf){wolf.r=11;wolf.c=1;wolf.hp=1;wolf.aggro=q.id;wolf.zone=null;wolf.home=null;TUT.wolfId=wolf.id}
    if(snake)TUT.snakeName=snake.name;
    const ei=document.querySelector('.evintro');if(ei)ei.click();
    try{render()}catch(e){}tutCoach()},900)}

/* v0.44: the lesson is its own little world — no new events, no Settings, no Manager mode until it is done;
   the 🏛 menu button asks before leaving */
document.addEventListener('click',e=>{if(!S||!S.tutorial||S.over)return;const b=e.target.closest('#btnNew,#btnSettings,#btnManager,#btnMenu,#btnStudio,#btnHall,#btnLudus,#btnDrawS');if(!b)return;
  e.preventDefault();e.stopPropagation();if(b.id==='btnMenu'){tutExit();return}if(typeof mToast==='function')mToast(_T('🎓 Finish the lesson first — or ✖ Exit tutorial.'))},true);
