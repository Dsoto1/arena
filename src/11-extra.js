
/* =====================================================================
   11-EXTRA · CARD ART, HINTS, THE LUDUS & THE GUIDE
   =====================================================================
   - SHEETS + cardRef/cardHTML: every piece of printed art, addressed as 'kind:key'
     ('w:gladius' weapon card, 'a:galea' armor token, 'h:saxoA' horse token,
      'n:croc' water token, 'g:chRed' chariot card, 'k:hero' class card).
     Hover ANY [data-card] element and the real card pops up.
   - HINT_TEXT/rulePop: the hint system.
   - LUDUS FLAVIUS: saved gladiators (portraits, active roster, retire/fallen/freed states).
   - SIM_STATS + guideHTML: the strategy guide, fed by 300 headless simulations.
   - Also: strategy hints, the turn indicator, the NPC tracker, thought bubbles, the
     Standings performance graph, and the canvas feedback (fx numbers, hit flashes,
     attack lines, shake, banner).
   ===================================================================== */
/* ================= CARD ART (sprite sheets in assets/) ================= */
const ASSET='assets/';
/* v0.34 SHARE BUILD: a downloaded single-file copy carries every image embedded in
   window.ASSET_DATA, so it runs from any desk with no assets folder beside it. */
const assetURL=f=>(typeof window!=='undefined'&&window.ASSET_DATA&&window.ASSET_DATA[f])||ASSET+f;
/* SHEETS — the printed-art sprite sheets in assets/, by card kind letter: file, grid (cols × rows) and aspect ratio of one cell (wide = landscape cards). */
const SHEETS={
  c:{f:'arena.jpg',cols:10,rows:9,ar:'240/352'},
  w:{f:'weapons.jpg',cols:9,rows:3,ar:'300/208',wide:1},
  m:{f:'mandati.jpg',cols:5,rows:3,ar:'240/346'},
  e:{f:'events.jpg',cols:5,rows:3,ar:'240/346'},
  f:{f:'fates.jpg',cols:6,rows:2,ar:'240/346'},
  k:{f:'classes.jpg',cols:4,rows:2,ar:'300/432'},
  b:{f:'classbacks.jpg',cols:8,rows:1,ar:'120/173'},
  x:{f:'misc.jpg',cols:7,rows:1,ar:'240/346'},
  a:{f:'armor2.webp',cols:9,rows:3,ar:'1/1'},
  h:{f:'chtok.webp',cols:5,rows:4,ar:'1/1'},
  nt:{f:'naum.png',cols:5,rows:2,ar:'1/1'},
  g:{f:'chcards.jpg',cols:3,rows:2,ar:'520/352',wide:1},
};
/* CHCARD_IDX — chariot card key → cell on chcards.jpg. */
const CHCARD_IDX={chTeal:0,chGold:1,chSilver:2,chRed:3,chBlue:4,chPurple:5};
/* CHTOK_IDX — horse / wheel / chariot token key → cell on chtok.webp. */
const CHTOK_IDX={palmatusA:0,palmatusB:1,ocianusA:2,ocianusB:3,saxoA:4,saxoB:5,vindexA:6,vindexB:7,wheel8:8,wheel10:9,wheel12:10,chRed:11,chBlue:12,chTeal:13,chGold:14,chSilver:15,chPurple:16};
/* NAUM_IDX — Naumachia water token key → cell on naum.png. */
const NAUM_IDX={water:0,croc:1,wpn1:2,wpn2:3,wpn3:4,arm1:5,arm2:6,arm3:7,up2:8,up3:9};
/* cardRef — resolves a card ref "kind:key" to its sheet and cell index ({sh, i}); unknown arena and weapon cards fall back to a blank, others to null. */
function cardRef(ref){
  if(!ref)return null;const k=ref[0],key=ref.slice(2);
  let i=null;
  if(k==='c')i=CARDS[key]?CARDS[key].img:null;
  else if(k==='w'){const base=String(key).replace(/^severed(Arm|Leg).*/,'severed$1');i=W[base]?W[base].img:null}
  else if(k==='m'||k==='f'||k==='x')i=+key;
  else if(k==='e')i=EVENTS[key]?EVENTS[key].img:null;
  else if(k==='k'||k==='b')i=CLASSES[key]&&!CLASSES[key].custom?CLASSES[key].img:null;
  else if(k==='a')i=ARM[key]?ARM[key].img:null;
  else if(k==='h')i=CHTOK_IDX[key];
  else if(k==='g')i=CHCARD_IDX[key];
  else if(k==='n')i=NAUM_IDX[key];
  if(i==null||isNaN(i)){if(k==='c')return {sh:SHEETS.x,i:3};if(k==='w')return {sh:SHEETS.x,i:6};return null}
  return {sh:SHEETS[k==='n'?'nt':k],i};
}
/* cardStyle — inline CSS that shows a card ref's cell from its sprite sheet. */
function cardStyle(ref){
  const r=cardRef(ref);if(!r)return '';const {sh,i}=r;const col=i%sh.cols,row=Math.floor(i/sh.cols);
  return `background-image:url('${assetURL(sh.f)}');background-size:${sh.cols*100}% ${sh.rows*100}%;background-position:${sh.cols>1?col/(sh.cols-1)*100:0}% ${sh.rows>1?row/(sh.rows-1)*100:0}%;aspect-ratio:${sh.ar}`;
}
/* cardLabel — the readable name of a card ref ("Gladius (weapon card)"). */
function cardLabel(ref){
  if(!ref)return '';const k=ref[0],key=ref.slice(2);
  if(k==='c')return CARDS[key]?CARDS[key].n+' (arena card)':'Arena card';
  if(k==='w')return W[key]?W[key].n+' (weapon card)':'Weapon card';
  if(k==='m')return MANDATA[+key]?'Mandata Flavi: '+MANDATA[+key].n:'Mandata Flavi';
  if(k==='e')return EVENTS[key]?EVENTS[key].n+' (Summa Rudis card)':'';
  if(k==='h')return {wheel8:'Wagon Wheel token',wheel10:'Laurel Wheel token',wheel12:'Gilded Wheel token'}[key]||'Chariot horse token';
  if(k==='g')return ({chTeal:'Bellum Quadriga',chGold:'Aureus Triumphus',chSilver:'Bellator Aequus',chRed:'Invicta Gloria',chBlue:'Azureus Magnus',chPurple:'Fulgens Velox'}[key]||'Chariot')+' (chariot card)';
  if(k==='n')return 'Naumachia water token';
  if(k==='f')return FATES[+key]?'Fate: '+FATES[+key].n:'';
  if(k==='k'||k==='b')return CLASSES[key]?CLASSES[key].name+' class card':'';
  if(k==='a')return ARM[key]?ARM[key].n+' (armor token)':'Armor token';
  return 'Card';
}
/* cardHTML — the <span> that shows a card (size xs–xl), with data-card for the hover pop-up; custom Piacula, custom classes, custom weapons and drawn armor use their own art. Wrapped by several later modules. */
function cardHTML(ref,size='md',extra=''){
  if(ref&&ref.startsWith('c:pia_cc_')&&typeof piaCardURL==='function'){const C=CARDS[ref.slice(2)];return `<span class="cimg ${size}" style="background-image:url('${piaCardURL(C?C.cls:'')}');background-size:100% 100%;aspect-ratio:${SHEETS.c?SHEETS.c.ar:'5/7'}" role="img" aria-label="Piaculum (custom)" data-card="${ref}" ${extra}></span>`}
  // custom characters have no printed player card: their portrait stands in for it everywhere
  if(ref&&(ref[0]==='k'||ref[0]==='b')&&CLASSES[ref.slice(2)]&&CLASSES[ref.slice(2)].custom)return classArt(ref.slice(2),size);
  if(ref&&ref[0]==='w'&&String(ref.slice(2)).startsWith('cw_')&&typeof cwCardURL==='function')return `<span class="cimg ${size} wide cwc" style="background-image:url('${cwCardURL(ref.slice(2))}');background-size:100% 100%" role="img" aria-label="${esc((W[ref.slice(2)]||{}).n||'custom weapon')}" data-card="${ref}" ${extra}></span>`;
  if(ref&&ref[0]==='a'&&typeof armorStyle==='function'&&(armorStyle()==='drawn'||String(ref.slice(2)).startsWith('ca_'))&&ARM[ref.slice(2)]&&typeof armArtURL==='function')return `<span class="cimg ${size} armdrawn" style="background-image:url('${armArtURL(ref.slice(2))}');background-size:contain;background-repeat:no-repeat;background-position:center" role="img" aria-label="${esc(ARM[ref.slice(2)].n)}" data-card="${ref}" ${extra}></span>`;
  const r=cardRef(ref);if(!r)return '';
  return `<span class="cimg ${size} ${r.sh.wide?'wide':''}" style="${cardStyle(ref)}" role="img" aria-label="${esc(cardLabel(ref))}" data-card="${ref}" ${extra}></span>`;
}
/* cardText — the rules text shown under a card in the hover pop-up. */
function cardText(ref){
  const k=ref[0],key=ref.slice(2);
  if(k==='c'&&CARDS[key]){const C=CARDS[key];return `<b>${C.n}</b> · ${C.type}<br>${C.d}${C.q?`<br><i>“${C.q}”</i>`:''}`}
  if(k==='w'&&W[key])return `<b>${W[key].n}</b> · level ${W[key].lv||'—'}${W[key].lv===4?' (Arena Chest)':''}<br>${wStats(mkW(key))}`;
  if(k==='m'&&MANDATA[+key])return `<b>${MANDATA[+key].n}</b><br>${MANDATA[+key].d}<br>Reward: ${MANDATA[+key].r}`;
  if(k==='k'&&CLASSES[key])return `<b>${CLASSES[key].name}</b> · ${CLASSES[key].hero}<br>${CLASSES[key].ab}`;
  if(k==='e'&&EVENTS[key])return `<b>${EVENTS[key].n}</b><br>${EVENTS[key].blurb}`;
  if(k==='a'&&ARM[key])return `<b>${ARM[key].n}</b> · level ${ARM[key].lv} armor token<br>${armorDesc(key)}`;
  if(k==='h')return {palmatusA:'<b>Palmatus</b> · chariot horse · speed +3, 10 HP on this face',palmatusB:'<b>Palmatus</b> (flipped) · speed +2, 12 HP',ocianusA:'<b>Ocianus</b> · chariot horse · speed +2, 8 HP on this face',ocianusB:'<b>Ocianus</b> (flipped) · speed +2, 10 HP',saxoA:'<b>Saxo</b> · chariot horse · speed +1, 8 HP on this face',saxoB:'<b>Saxo</b> (flipped) · speed +1, 12 HP',vindexA:'<b>Vindex</b> · chariot horse · speed +3, 8 HP on this face',vindexB:'<b>Vindex</b> (flipped) · speed +3, 12 HP',wheel8:'<b>Wagon Wheel</b> · 8 HP',wheel10:'<b>Laurel Wheel</b> · 10 HP',wheel12:'<b>Gilded Wheel</b> · 12 HP'}[key]||'<b>Chariot</b> token';
  if(k==='g')return {chTeal:'<b>Bellum Quadriga</b> · the war quadriga: bronze-studded and mean',chGold:'<b>Aureus Triumphus</b> · gilded for the victory parade',chSilver:'<b>Bellator Aequus</b> · the steady warhorse of chariots',chRed:'<b>Invicta Gloria</b> · unconquered glory, painted in blood-red',chBlue:'<b>Azureus Magnus</b> · the great blue of the Circus faction',chPurple:'<b>Fulgens Velox</b> · shining and fast, dyed in Tyrian purple'}[key]||'';
  if(k==='n')return {water:'<b>Water Tile</b> · calm water',croc:'<b>Crocodile!</b> · the bitten location is reduced to 1 HP',wpn1:'<b>Level 1 Weapon</b> · fished from the wreckage',wpn2:'<b>Level 2 Weapon</b> · fished from the wreckage',wpn3:'<b>Level 3 Weapon</b> · fished from the wreckage',arm1:'<b>Level 1 Armor</b> · washed up at your feet',arm2:'<b>Level 2 Armor</b> · washed up at your feet',arm3:'<b>Level 3 Armor</b> · washed up at your feet',up2:'<b>Armor Upgrade</b> · +2 AP, distributed as you choose',up3:'<b>Armor Upgrade</b> · +3 AP, distributed as you choose'}[key]||'Naumachia token';
  return '';
}
// hover any [data-card] element to see the full card
/* the card hover pop-up: hovering any [data-card] (or a Ludus [data-glad]) shows the full card beside the pointer. */
(function(){
  const tip=$('#tip');let on=null;
  const place=e=>{const w=tip.offsetWidth,h=tip.offsetHeight;let x=e.clientX+18,y=e.clientY-h/2;if(x+w>innerWidth-8)x=e.clientX-w-18;y=clamp(y,8,innerHeight-h-8);tip.style.left=x+'px';tip.style.top=y+'px'};
  document.addEventListener('mouseover',e=>{
    const el=e.target.closest('[data-card],[data-glad]');if(!el){if(on){tip.hidden=true;on=null}return}
    if(el===on)return;on=el;
    if(el.dataset.glad){const g=LUDUS_CACHE.find(x=>x.id===el.dataset.glad);if(!g){tip.hidden=true;return}tip.innerHTML=ludusTip(g);tip.hidden=false;place(e);return}
    const ref=el.dataset.card;const r=cardRef(ref);
    if(!r){const k=ref[0],key=ref.slice(2);
      if((k==='k'||k==='b')&&CLASSES[key]&&CLASSES[key].custom){tip.innerHTML=classArt(key,'lg')+`<div class="tt">${cardText(ref)}</div>`;tip.hidden=false;place(e);return}
      tip.hidden=true;return}
    tip.innerHTML=cardHTML(ref,r.sh.wide?'xl':'xl')+(cardText(ref)?`<div class="tt">${cardText(ref)}</div>`:'');tip.hidden=false;place(e);
  });
  document.addEventListener('mousemove',e=>{if(on&&!tip.hidden)place(e)});
  document.addEventListener('scroll',()=>{tip.hidden=true;on=null},true);
})();
// the drawn / played card appears in the corner of the arena for a moment
function cardShow(ref,player,label){if(typeof sfx==='function'&&S&&!S.sim)sfx('card');
  if(S&&ref)(S.cardsSeen=S.cardsSeen||[]).push({ref,n:cardLabel(ref).replace(/ \(.*\)$/,''),by:player?player.name:''});
  if(HEADLESS)return;
  const box=$('#cardShow');if(!box||!cardRef(ref))return;
  const d=document.createElement('div');d.className='cs';d.innerHTML=`<b class="cslbl ${/Drawn/.test(label||'')?'drawn':'decl'}">${label||'🂠 Card'}</b>`+cardHTML(ref,SPEED==='fast'?'md':'lg')+(player?`<span style="border-left:3px solid ${player.color}">${esc(player.name)}</span>`:'');
  box.prepend(d);while(box.children.length>2)box.lastChild.remove();
  const ms=SPEED==='slow'?6500:SPEED==='fast'?1400:3200;
  setTimeout(()=>{d.classList.add('out');setTimeout(()=>d.remove(),700)},ms);
}
/* locIcon — small body-location icon (head, chest, arms, legs) from the location sprite. */
const locIcon=l=>`<i class="loc-ic" style="background-position:${['head','chest','larm','rarm','rleg','lleg'].indexOf(l)*20}% 0" title="${LOCN[l]}"></i>`;
/* IMG — loose images drawn on the canvas (blessing medallion, tunnel tiles); each redraws the board when it loads. */
const IMG={};
for(const [k,fn] of [['blessing','blessing.png'],['tunnel_open','tunnel_open.jpg'],['tunnel_door','tunnel_door.jpg']]){IMG[k]=new Image();IMG[k].onload=()=>{try{draw()}catch(e){}};IMG[k].src=assetURL(fn)}

/* ================= HINTS & RULE POPUPS ================= */
let HINTS=true;try{HINTS=localStorage.getItem('flavius_hints')!=='off'}catch(e){}
/* setHints — turns hints on or off (localStorage flavius_hints) and lights the matching top-bar buttons. */
function setHints(on){HINTS=on;try{localStorage.setItem('flavius_hints',on?'on':'off')}catch(e){}document.querySelectorAll('[data-hints]').forEach(b=>b.classList.toggle('on',(b.dataset.hints==='on')===on));if(S)render()}
/* the top-bar Hints on / off buttons. */
document.querySelectorAll('[data-hints]').forEach(b=>b.onclick=()=>setHints(b.dataset.hints==='on'));
setHints(HINTS);
/* HINT_TEXT — short hint texts by key, shown by hint(). TWEAK: the wording. */
const HINT_TEXT={
  defend:"Minerva's Push dodges the whole attack and steps you 1 tile away, so save it for hits that would sever a limb or kill you. Fidelis Constans only removes one hit die.",
  truce:'A truce stops both of you from being targeted, but only one gladiator can win. If everyone left standing is in a truce, Flavius breaks them all.',
  ammo:'Replenishing refills every ammo weapon you hold. Two Ammo cards can instead be exchanged for any ammo weapon still in the market.',
  market:'Unlocking costs 3 CF. Level 1/2/3 cost 4/8/12 coin. Re-rolls cost 2 coin. Choose (arena card) lets you skip the die entirely.',
  shield:'Raising a shield is a choice: spend a use to absorb its stated value, and the remainder still hits armor then flesh. Save uses for big hits and severing threats.',
  recruit:'Scout to learn what a fighter wants, then pitch the motives you grade well. Gifts sway the coin-hungry, feasts sway everyone, and a pledged main event is +12 interest — if you keep your word.',
};
/* hint — a hint box for a key (or literal text) — empty while hints are off. */
function hint(key){if(!HINTS)return '';const t=HINT_TEXT[key]||key;return t?`<div class="tiphint"><b>Hint</b>${t}</div>`:''}
/* POPPED — rule pop-ups already shown this page visit (each shows once). */
const POPPED=new Set();
/* humansIn — true when a human plays a seat in the live event. */
function humansIn(){return S&&S.players.some(player=>!player.cpu)}
/* rulePop — shows a rule pop-up once per visit (hints on, a human playing, no tutorial); "Turn hints off" switches hints off. */
async function rulePop(key,title,html,ref){
  if(!HINTS||(typeof SETTINGS!=='undefined'&&SETTINGS.rulePops===false)||POPPED.has(key)||!humansIn()||(typeof TUT!=='undefined'&&TUT.on))return;POPPED.add(key);
  const v=await modal(title,`<div class="rulepop">${ref?cardHTML(ref,'md'):'<span></span>'}<div>${html}</div></div>`,[{label:'Got it',value:1,primary:1},{label:'Turn hints off',value:'off'}]);
  if(v==='off')setHints(false);
}
/* RULE_POPS — the rule pop-ups by key: [title, html, card ref]. TWEAK: the wording. */
const RULE_POPS={
  telemachus:['Telemachus Interdico!','<p>While Telemachus is in play <b>no gladiator can attack</b>. Each player rolls a d6 at the start of their turn; a 1 or 6 drags him out. Use the lull to break pots? No: pots need attacks too. Move, loot, trade, buy and reposition instead.</p>','c:telemachus'],
  restless:['The Crowd Grows Restless','<p>For the next 4 turns, any gladiator who ends a turn <b>without attacking</b> gets every gladiator stoned for 2 damage. Hit something, even a pot, every turn.</p>','c:restless'],
  endgame:['Flavius Rule: End Game','<p>From now on every attack rolls <b>4 hit dice</b> and the attacker <b>chooses the hit location</b>. Fights end quickly: armor your head and chest, and go for the weakest location on your rivals.</p>','c:endgame'],
  boar:['The Calydonian Boar','<p>For one full turn rotation, each gladiator rolls a d6 at the start of their Resolve phase. Odd means the boar deals 2 damage to a rolled location.</p>','c:boar'],
  aggro:['Aggro','<p>A beast you attack or push becomes <b>aggro</b> on you: it follows you anywhere and attacks during your Resolve phase. Each NPC holds only one aggro target, the most recent gladiator to hit it. It still lashes out at anyone standing next to it. Tunnels, a Ward of the Evil Eye or a Meat Lure shake it off.</p>'],
  zone:['The zone shrinks','<p>You have 2 turns of grace to get inside the lit zone. Ending a turn outside costs 2 CF, and negative CF eliminates you.</p>'],
  firstTurn:['Your turn','<p><b>1 Resolve</b>: beasts that are aggro on you, in whose zone you stand, or next to you act. <b>2 Choice</b>: take 2 coin (safe) or draw an arena card (instant cards resolve at once and can hurt). <b>3 Action</b>: move, up to one attack per arm, push, topple, loot, trade and spend CF. <b>4 End</b>.</p><p>Hover any card or weapon to see the real card.</p>'],
  mandata:['Mandata Flavi','<p>You hold a secret objective from Flavius. Complete it and it is revealed with its reward; still hidden at the end of the event costs 5 CF. Some are completed by a spoken declaration from the Action panel.</p>'],
  thumb:['The Thumb of Flavius','<p>Ending with 17-19 CF puts your life in the Thumb of Flavius: a d6 of 4+ spares you (20 CF, sent to the Ludus Flavius). 20 CF or more reaches the Ludus, which lets you save your gladiator.</p>','f:9'],
};
/* popRule — shows the rule pop-up for a key (quiet during the Manager lesson). */
function popRule(key){if(typeof MTUT!=='undefined'&&MTUT.on)return; /* v0.46: the Manager lesson keeps a live bout quiet */const r=RULE_POPS[key];if(r)return rulePop(key,r[0],r[1],r[2])}
/* strategyHints — up to 4 live suggestions for a human in their Action phase: aggro beasts, pots in reach (with break odds), the zone, elixirs, Focus, Mandata, the Thumb range, weak weapons, loot, allies, and nearby prey. */
function strategyHints(player){
  if(!HINTS||!S||player.cpu||S.phase!=='action')return [];
  const out=[];const rd=RD();
  const threats=S.npcs.filter(npc=>npc.alive&&npc.tamedBy==null&&npc.aggro===player.id);
  const has=k=>player.items.some(i=>i.kind==='card'&&i.key===k);
  for(const n of threats){const st=npcStats(n);const outs=[];if(tunnelExits(player).length)outs.push('dive into a tunnel (1 key)');if(has('ward'))outs.push('declare your Ward of the Evil Eye');if(has('lure')&&activePlayers().some(other=>other!==player&&cheb(player,other)<=4))outs.push('throw your Meat Lure at a rival');
    out.push(`${n.name} is aggro on you${st.state?` (${st.state}: ${st.ap} attack, ${st.mv} move)`:''}. ${n.hp<=8?'It is low: finish it for the trophy.':outs.length?'To shake it: '+outs.join(', or ')+'.':'Stay out of its reach or fight it near allies.'}`)}
  {const srcs=attackSources(player).filter(s=>!s.thr&&(!s.w.punch||hasCestus(player,s.arm)));const pots=S.pillars.filter(pl=>pl.pots.length&&cheb(player,pl)===1);
   if(pots.length&&srcs.length){const best=Math.max(...srcs.map(s=>s.w.p+(hasCestus(player,s.arm)?1:0)+(player.hercules||0)+statDmgB(player)));const n=S.endgame?4:2;
     const chance=best>=2?1-Math.pow(.5,n):1-Math.pow(.5,n)-n*Math.pow(.5,n);out.push(`A Blessings pot is in reach. It needs 2 damage: with power ${best} you break it ${Math.round(chance*100)}% of the time (2 coin, 1 CF and a hidden offering).`)}}
  if(rd.zone>1&&!inZone(player.r,player.c))out.push(`You are outside the zone${player.grace>0?` (${player.grace} grace turn${player.grace>1?'s':''} left)`:''}. Ending here costs 2 CF.`);
  if(hurtBad(player)&&player.items.some(i=>i.kind==='card'&&isElixir(i.key)||i.kind==='offer'&&(i.key==='elix2'||i.key==='elix4')))out.push('You are badly hurt and hold a Health Elixir. An elixir can also save a location the moment it hits 0.');
  if(player.focusNext)out.push('Focus! is declared: your next attack on a gladiator picks the location. Aim at their least armored limb or a weak head.');
  if(player.hercules)out.push(`Herculean Vigor adds ${player.hercules} damage to your next attack that lands a hit.`);
  const mf=player.items.find(i=>i.kind==='mf');if(mf){const M=MANDATA[mf.idx];out.push(M.declare?`Your Mandata Flavi (${M.n}) is completed by declaring it: use it from your hand.`:`Mandata Flavi: ${M.d} (${M.r}).`)}
  if(player.cf>=17&&player.cf<20)out.push(`At ${player.cf} CF you sit in the Thumb of Flavius range (17-19). Reaching 20 CF secures the Ludus Flavius.`);
  if(!player.market&&cfAllowed()&&player.cf>=3+(weak(player,'tax')?1:0)&&player.coin>=purchaseCost(player,2)+(weak(player,'tax')?1:0)&&armsAttached(player).length&&Math.min(...armsAttached(player).map(a=>wScore(player['w'+a])))<3)out.push(`Your weapons are weak and you can afford a level 2 weapon (3 CF to unlock + ${purchaseCost(player,2)} coin).`);
  const sev=pilesAt(player.r,player.c).length;if(sev&&!player.looted)out.push('You stand on a pile: loot 1 item this turn.');
  if(S.active.telemachus)out.push('Telemachus blocks all attacks. Reposition, loot, trade or shop this turn.');
  if(S.active.restless&&player.attacks===0)out.push('The crowd is restless: make at least one attack this turn, even at a pot, or everyone is stoned.');
  const al=alliesOf(player);const giftable=player.items.filter(i=>i.kind==='offer'&&/elix|ap/.test(i.key)||i.kind==='card'&&(isElixir(i.key)||isForge(i.key)));
  if(giftable.length&&al.some(other=>hurtBad(other)&&cheb(player,other)<=4))out.push(`An ally near you is badly hurt. You could gift them your ${itemInfo(giftable[0]).n} from Trade or truce.`);
  if(out.length<2){
    const pl=S.pillars.filter(x=>x.pots.length).sort((a,b)=>cheb(player,a)-cheb(player,b))[0];
    if(pl&&cheb(player,pl)>1)out.push(`Nearest Blessings pot: the pillar at ${tl(pl.r,pl.c)}, ${cheb(player,pl)-1} tile${cheb(player,pl)>2?'s':''} from reach.`);
    const prey=S.npcs.filter(npc=>npc.alive&&npc.tamedBy==null&&(npc.t==='snake'||npc.t==='wolf'||npc.hp<=6)).sort((a,b)=>cheb(player,a)-cheb(player,b))[0];
    if(prey&&cheb(player,prey)<=6)out.push(`${prey.name} (${NPCT[prey.t].n}, ${prey.hp} HP) is ${cheb(player,prey)} tiles away: an easier trophy worth ${NPCT[prey.t].cf} CF and ${NPCT[prey.t].coin} coin. Attacking makes it aggro on you.`);
    const unused=player.items.filter(i=>i.kind==='offer'||i.kind==='card'&&CARDS[i.key].type==='declare');if(unused.length)out.push(`You hold ${unused.length} item${unused.length>1?'s':''} you can use this turn: ${unused.map(i=>itemInfo(i).n).slice(0,3).join(', ')}.`);
  }
  return out.slice(0,4);
}

/* ================= TURN INDICATOR ================= */
/* v0.33 ONE ARENA, ONE OWNER: the board is a single stage that every mode shares — Play now, Manager
   bouts, tournaments, exhibitions, festivals and missios all borrow the same sand. This tag says who
   holds it right now; anything that would evict a live event warns first and abandons it cleanly. */
function arenaOwner(){if(!S)return null;
  return S.mgrCtx?{k:'manager',n:'Manager bout',i:'🏛'}:S.specCtx?{k:'spectator',n:'From the stands',i:'👁'}:S.tourn?{k:'tournament',n:'Tournament',i:'🏆'}:S.exhib?{k:'exhibition',n:'Exhibition',i:'🎪'}:S.fest?{k:'festival',n:'Festival',i:'🎉'}:S.missio?{k:'missio',n:'Missio',i:'🗡'}:{k:'play',n:'Play now',i:'⚔'}}
/* renderTurnInd — the turn indicator in the top bar: whose turn, the phase, turn and rotation, and which mode owns the arena. Replaced by 60-v53. */
function renderTurnInd(){
  if(HEADLESS)return;
  const el=$('#turnInd');if(!el)return;
  if(!S||S.over||S.phase==='setup'||!S.players.length){el.hidden=true;return}
  const p=cur();el.hidden=false;
  const ph={resolve:'1 Resolve',choice:'2 Choice',action:'3 Action',end:'4 End',command:'Commanding'}[S.phase]||S.phase;
  const ow=arenaOwner();
  el.className='turnind'+(p.cpu?'':' you');el.style.setProperty('--pc',p.color);
  el.innerHTML=`<span class="dot" aria-hidden="true"></span><span><b>${esc(p.name)}</b> ${p.cpu?'(CPU)':'· your turn'}</span><span class="ph">${ph} · turn ${S.turnNo} · rotation ${S.rotation}${ow&&ow.k!=='play'?` · <b title="Who holds the arena right now — every mode shares this one board">${ow.i} ${ow.n}</b>`:''}${SPEED==='pause'?' · <b style="color:var(--gold2)">CPU paused</b>':''}</span>`;
}

/* ================= NPC TRACKER ================= */
const SPAWNABLE=[['Leo','lion'],['Leaena','lion'],['Commodus','commodus'],['Tholo','tholo'],['Zora','zora']];
/* howToSpawn — how a beast that is not on the sand can still enter this event (its deck card, the event's own rule, a chant…). */
function howToSpawn(name,npcType){
  const ev=EV(),k=S.evKey;
  if(npcType==='zora'){const v=S.players.find(player=>player.abil==='zora'&&player.alive);return `${v?v.name+' can declare him once per event. ':''}${ev.deck&&S.deck.includes('zora')?'The Zora arena card also releases him for whoever draws it.':'No Zora card remains in the deck.'}`}
  if(k==='gauntlet'){if(npcType==='lion')return 'Released when both snakes are slain.';if(npcType==='commodus')return S.noCommodus?'Removed from this Gauntlet.':'Enters when both wolves are slain.';if(npcType==='tholo')return 'Unleashed when both bears are slain.'}
  if(k==='orpheus'&&npcType==='lion')return 'Both lions are released after the first capture.';
  if(k==='commodus'&&npcType==='commodus')return 'Enters at the start of round 2 with 20 HP.';
  if(ev.noBoss&&(npcType==='tholo'||npcType==='commodus'))return 'Not used in this event.';
  if(ev.noTholo&&npcType==='tholo')return 'Not used in this event.';
  const card={Leo:'spawnLeo',Leaena:'spawnLeaena',Commodus:'spawnCommodus',Tholo:'spawnTholo'}[name];
  let s='';
  if(ev.deck&&card){const i=S.deck.indexOf(card);s+=i>=0?`Enters when the ${name} arena card is drawn (${S.deck.length} cards left in the deck).`:'Its arena card has already been drawn or removed.'}
  else s+='Not in this event\'s arena deck.';
  if(npcType==='tholo'&&S.spect.length)s+=' Spectators in all four quadrants can also chant for Tholo.';
  if(npcType==='tholo')s+=' In rounds 1-2 Tholo spawns on the center tile and grabs the chest.';
  if(npcType==='commodus')s+=' On entry every gladiator takes 2 damage; no CF can be spent while he lives.';
  return s;
}
/* npcTrackerHTML — the Beasts & active cards panel: every beast with HP bar, state and aggro, the spawnable ones not in play (and how they enter), and the active arena cards. */
function npcTrackerHTML(){
  if(!S)return '';
  const rows=[];
  const aggroName=npc=>npc.aggro!=null&&S.players[npc.aggro]?S.players[npc.aggro].name:null;
  for(const n of S.npcs){
    const T=NPCT[n.t],st=npcStats(n);const max=Math.max(T.hp,n.hp);
    const tip=n.alive?`${npcLbl(n)} · ${n.hp}/${T.hp} HP · attack ${st.ap} · range ${st.rng} · move ${st.mv}${st.state?' · '+st.state:''}${n.aggro!=null?` · aggro on ${aggroName(n)}`:''}${n.tamedBy!=null?' · tamed by '+S.players[n.tamedBy].name:''}${n.zone&&!n.displaced?` · guards ${ROWL[n.zone[0]]}-${ROWL[n.zone[1]]}/${COLL[n.zone[2]]}-${COLL[n.zone[3]]}`:''}. Elimination: ${T.coin} coin, ${T.cf} CF, 1 trophy.${T.states?' Behavior states: '+T.states.map(s=>`${s[4]} ${s[0]}+ HP (${s[1]} atk, ${s[3]} mv)`).join(', ')+'.':''}`:`${n.name} was slain${n.killedBy?' by '+n.killedBy:''}.`;
    const sub=!n.alive?`slain${n.killedBy?' by '+esc(n.killedBy):''}`:n.tamedBy!=null?`tamed by ${esc(S.players[n.tamedBy].name)}`:n.aggro!=null?`aggro → <b style="color:${S.players[n.aggro].color}">${esc(aggroName(n))}</b>${n.aggroWhy?` <span style="color:var(--dim)">(${n.aggroWhy})</span>`:''}`:n.home&&!n.displaced?`guarding its zone · ${tl(n.r,n.c)}`:`roaming · ${tl(n.r,n.c)}`;
    rows.push({alive:n.alive,dead:!n.alive,html:`<div class="npcrow ${n.alive?'':'dead'}" title="${esc(tip)}" style="--nc:${T.col}">${npcPieceHTML(n,30,'stnd sm')||`<span class="g">${T.g}</span>`}<span>${typeof npcTokHTML==='function'?npcTokHTML(n,22):''} ${esc(n.name)} <span style="color:var(--dim)">(${npcKind(n.t)})</span>${st.state&&n.alive?`<span class="stchip ${st.state}">${st.state}</span>`:''}</span><span class="st">${n.alive?`${Math.max(0,n.hp)}/${T.hp}`:'0'}</span>${n.alive?`<span class="hpb"><i class="${n.tamedBy!=null?'tame':n.aggro!=null?'aggro':''}" style="width:${Math.max(0,n.hp)/max*100}%"></i></span>`:''}<span class="sub">${sub}</span></div>`});
  }
  if(!isChariot()&&!isNaum())for(const [name,t] of SPAWNABLE){
    if(S.npcs.some(n=>n.name===name&&n.alive))continue;if(S.npcs.some(n=>n.name===name&&!n.alive))continue;
    const how=howToSpawn(name,t);const T=NPCT[t];
    rows.push({alive:false,off:true,html:`<div class="npcrow off" title="${esc(`${name} (${npcKind(t)}) · not in play. ${how}`)}" style="--nc:${T.col}"><span class="g">${T.g}</span><span>${typeof npcTokHTML==='function'?npcTokHTML({t,name},22):''} ${name} <span style="color:var(--dim)">(${npcKind(t)})</span></span><span class="st">${T.hp} HP</span><span class="sub">not in play · ${esc(how)}</span></div>`});
  }
  const act=[];
  if(S.active.telemachus)act.push(['c:telemachus','Telemachus','no attacks · d6 of 1 or 6 removes him']);
  if(S.active.restless)act.push(['c:restless','Crowd Restless',`${S.active.restless} turn${S.active.restless>1?'s':''} left`]);
  if(S.active.boar)act.push(['c:boar','Calydonian Boar',`${S.active.boar.left} resolve phase${S.active.boar.left>1?'s':''} left`]);
  if(S.endgame)act.push(['c:endgame','Flavius Rule','4 hit dice · attacker picks location']);
  for(const q of S.players)if(q.alive&&q.mercRound===S.ri)act.push(['c:mercRound','Speed of Mercury',`${q.name} +1 MV this round`]);
  const on=rows.filter(r=>r.alive),dead=rows.filter(r=>r.dead),off=rows.filter(r=>r.off);
  return `<h3>Beasts &amp; active cards</h3>${act.length?`<div class="actcards">${act.map(([ref,n,d])=>`<span class="ac" data-card="${ref}">${cardHTML(ref,'xs')}<span><b>${n}</b><br><span style="color:var(--muted)">${d}</span></span></span>`).join('')}</div>`:''}
    ${on.length?on.map(r=>r.html).join(''):'<p class="hint">No NPCs in play.</p>'}
    ${off.length?`<div class="sect">Not in play · hover for how they enter</div>${off.map(r=>r.html).join('')}`:''}
    ${dead.length?`<div class="sect">Slain</div>${dead.map(r=>r.html).join('')}`:''}`;
}

/* ================= THOUGHT BUBBLES ================= */
let bubTimer=null,bubSeq=1;
// bubbles are created once and only repositioned afterwards, so they never re-animate or stack up
function renderBubbles(){
  if(HEADLESS)return;
  const box=$('#bubbles');if(!box)return;
  if(!S||!S.bubbles){box.innerHTML='';return}
  const ttl=SPEED==='slow'?7000:SPEED==='fast'?1800:4200;const now=Date.now();
  S.bubbles=S.over||S.clean?[]:S.bubbles.filter(b=>now-b.at<ttl||SPEED==='pause'); /* v0.47: when the event ends, the talking stops */
  const keep=new Set(S.bubbles.map(b=>'b'+b.id));
  for(const el of [...box.children])if(!keep.has(el.dataset.bid))el.remove();
  for(const b of S.bubbles){const p=S.players[b.pid];if(!p)continue;const m=center(p.r,p.c);
    let el=box.querySelector(`[data-bid="b${b.id}"]`);
    if(!el){el=document.createElement('div');el.dataset.bid='b'+b.id;el.className='bub '+b.mood;el.style.setProperty('--pc',p.color);el.innerHTML=`<span class="who">${esc(p.name)}</span>${esc(b.text)}`;box.appendChild(el)}
    el.style.left=m.x+'px';el.style.top=(m.y-TW*0.95)+'px';}
  clearTimeout(bubTimer);if(S.bubbles.length)bubTimer=setTimeout(renderBubbles,700);
}

/* ================= PERFORMANCE GRAPH ================= */
const PERF_METRICS={s:['Performance','combined CF, coin, health, AP, weapons, trophies and items'],cf:['Crowd Favor','CF'],coin:['Coin','coin'],hp:['Health','total HP'],fans:['Fans','spectators backing them'],tr:['Trophies','trophies taken']};
/* linfit — least-squares line through [x, y] points → {m slope, b intercept}. */
function linfit(pts){const n=pts.length;if(n<2)return {m:0,b:pts[0]?pts[0][1]:0};let sx=0,sy=0,sxx=0,sxy=0;for(const [x,y] of pts){sx+=x;sy+=y;sxx+=x*x;sxy+=x*y}const d=n*sxx-sx*sx;const m=d?(n*sxy-sx*sy)/d:0;return {m,b:(sy-m*sx)/n}}
/* perfChartHTML — the Standings graph (SVG) for one metric: each gladiator's line per turn plus a dashed projection of their recent trend. TWEAK: the projection uses the last 40% of turns. */
function perfChartHTML(metric='s'){
  if(!S||!S.hist)return '';
  const series=S.players.map(player=>({p:player,h:(S.hist[player.id]||[]).filter(x=>x[metric]!=null)})).filter(x=>x.h.length);
  if(!series.length||Math.max(...series.map(x=>x.h.length))<2)return '<p class="hint">The graph fills in as turns are played.</p>';
  const tMax=Math.max(...series.flatMap(x=>x.h.map(y=>y.t)));
  const horizon=Math.max(S.players.length*3,Math.round(tMax*0.25));const tEnd=tMax+horizon;
  // projection from each gladiator's recent trend (their last 40% of turns)
  for(const x of series){const h=x.h;const k=Math.max(2,Math.ceil(h.length*0.4));const pts=h.slice(-k).map(y=>[y.t,y[metric]]);const f=linfit(pts);const last=h[h.length-1];
    x.proj=[[last.t,last[metric]],[tEnd,Math.max(0,last[metric]+f.m*(tEnd-last.t))]];x.fin=Math.round(x.proj[1][1]);x.last=last}
  const vals=series.flatMap(x=>[...x.h.map(y=>y[metric]),x.proj[1][1]]);
  let yMin=Math.min(0,...vals),yMax=Math.max(10,...vals);yMax=Math.ceil(yMax/10)*10;
  const W_=760,H_=300,L=44,R=14,T=14,B=30;
  const X=t=>L+(t/tEnd)*(W_-L-R),Y=v=>T+(1-(v-yMin)/(yMax-yMin))*(H_-T-B);
  let g='';
  for(let i=0;i<=5;i++){const v=yMin+(yMax-yMin)*i/5;g+=`<line x1="${L}" x2="${W_-R}" y1="${Y(v)}" y2="${Y(v)}" stroke="#2f241b"/><text x="${L-6}" y="${Y(v)+4}" fill="#7d6a55" font-size="11" text-anchor="end" font-family="IBM Plex Mono, monospace">${Math.round(v)}</text>`}
  // round boundaries
  g+=`<line x1="${X(tMax)}" x2="${X(tMax)}" y1="${T}" y2="${H_-B}" stroke="#7a5c20" stroke-dasharray="3 4"/><text x="${X(tMax)+4}" y="${T+10}" fill="#b39d80" font-size="11" font-family="IBM Plex Mono, monospace">${S.over?'final':'now'}</text><text x="${(X(tMax)+X(tEnd))/2}" y="${T+10}" fill="#7d6a55" font-size="11" text-anchor="middle" font-family="IBM Plex Mono, monospace">projected</text>`;
  g+=`<text x="${L}" y="${H_-8}" fill="#7d6a55" font-size="11" font-family="IBM Plex Mono, monospace">turn 1</text><text x="${X(tMax)}" y="${H_-8}" fill="#7d6a55" font-size="11" text-anchor="middle" font-family="IBM Plex Mono, monospace">turn ${tMax}</text>`;
  for(const x of series){const c=x.p.color;const d=x.h.map((y,i)=>`${i?'L':'M'}${X(y.t).toFixed(1)} ${Y(y[metric]).toFixed(1)}`).join(' ');
    g+=`<path d="${d}" fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round"><title>${esc(x.p.name)}</title></path>`;
    const [a,b]=x.proj;g+=`<path d="M${X(a[0])} ${Y(a[1])} L${X(b[0])} ${Y(b[1])}" stroke="${c}" stroke-width="2" stroke-dasharray="5 5" opacity=".75"/>`;
    const last=x.last;g+=last.end==='elim'?`<text x="${X(last.t)}" y="${Y(last[metric])+4}" fill="${c}" font-size="14" text-anchor="middle">✕</text>`:`<circle cx="${X(last.t)}" cy="${Y(last[metric])}" r="3.5" fill="${c}"/>`;
    g+=`<text x="${X(tEnd)-2}" y="${Y(b[1])-5}" fill="${c}" font-size="11" text-anchor="end" font-family="IBM Plex Mono, monospace">${x.fin}</text>`;}
  const legend=series.map(x=>`<span><i style="--pc:${x.p.color}"></i>${esc(x.p.name)} <b style="font-family:var(--mono)">${Math.round(x.last[metric])}</b> <i class="proj" style="--pc:${x.p.color}"></i><span style="color:var(--muted)">→ ${x.fin}${x.last.end==='elim'?' if they had lived':''}</span></span>`).join('');
  return `<div class="perf"><svg viewBox="0 0 ${W_} ${H_}" role="img" aria-label="${PERF_METRICS[metric][0]} of each gladiator per turn, with dashed projections">${g}</svg><div class="legend">${legend}</div><p class="hint">${PERF_METRICS[metric][0]}: ${PERF_METRICS[metric][1]}. Solid lines are recorded after every turn; dashed lines extend each gladiator's recent trend ${horizon} turns ahead.</p></div>`;
}
/* perfTabs — the metric buttons above the Standings graph. */
function perfTabs(selected='s'){return `<div class="seg" role="tablist" style="margin-top:6px">${Object.entries(PERF_METRICS).map(([k,[l]])=>`<button type="button" data-perf="${k}" class="${k===selected?'on':''}">${l}</button>`).join('')}</div>`}
/* wirePerf — makes the metric buttons under root swap the graph. */
function wirePerf(root){root.addEventListener('click',e=>{const b=e.target.closest('[data-perf]');if(!b)return;e.stopPropagation();const w=root.querySelector('#perfWrap');if(w)w.innerHTML=perfTabs(b.dataset.perf)+perfChartHTML(b.dataset.perf)},true)}
/* the top-bar Standings button: the graph and the Fates table (after the event it reopens the results on the graph). */
$('#btnGraph').onclick=()=>{if(modalBusy()||!S)return;if(S.over&&S.showResults){S.showResults('graph');return} /* Standings always opens on the graph */ recordHist();modal('Standings',`<div class="seg" style="margin-bottom:8px"><button type="button" data-stpane="st" class="on">📊 Standings</button><button type="button" data-stpane="fates">⚖️ The Fates table</button></div><div id="stPaneSt"><div id="perfWrap">${perfTabs('s')+perfChartHTML('s')}</div></div><div id="stPaneFates" hidden>${fatesHTML()}</div>`,[{label:'Close',value:1}],{wide:1,onOpen:()=>{const mb=$('#mBody');wirePerf(mb);mb.addEventListener('click',e=>{const t=e.target.closest('[data-stpane]');if(!t)return;mb.querySelectorAll('[data-stpane]').forEach(b=>b.classList.toggle('on',b===t));$('#stPaneSt').hidden=t.dataset.stpane!=='st';$('#stPaneFates').hidden=t.dataset.stpane!=='fates'})}})};

/* ================= LUDUS FLAVIUS: SAVED GLADIATORS ================= */
let LUDUS_CACHE=[];
// every saved gladiator gets a face: a deterministic portrait grown from their record id, so it never changes between visits
function gladPortrait(seed,cls){
  let h=2166136261;for(const ch of String(seed))h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;
  const nx=()=>(h=(Math.imul(h,1103515245)+12345)>>>0);
  const pick=arr=>arr[nx()%arr.length];const chance=prob=>nx()%100<prob*100;
  const HELM_OF={soldier:'galea',royalty:'laurel',hero:'crested',slave:'none',veteranus:'galea',amazonia:'none',venatore:'hood',damnatio:'none'};
  return {skin:pick(SKINS),hair:pick(HAIRS),helm:HELM_OF[cls]||pick(['none','galea','crested']),beard:chance(.45),long:chance(.25),smile:chance(.3),scar:chance(.35),paint:chance(.12),bg:pick(BGS)};
}
/* ROSTER_MAX — size of the Ludus Flavius active roster (the gladiators New event can field). TWEAK: the 32. */
const ROSTER_MAX=32; /* v0.47: 32, enough for a full tournament bracket */ // the active roster: who you can FIELD (event-setup seat dropdowns); everyone else waits on the rolls
/* ludusOvr — a saved gladiator's rating from wins, events, trophies and CF, 45–92 — the same sum Manager mode uses when importing them. TWEAK: the weights. */
const ludusOvr=glad=>clamp(Math.round(50+(glad.wins||0)*4+(glad.events||0)*1.5+(gk(glad,'P'))*2+(gk(glad,'N'))+(glad.cf||0)/6),45,92);
/* gladActive — whether a saved gladiator can still be fielded (not fallen, freed, retired or in the infirmary). */
const gladActive=glad=>glad.status!=='fallen'&&glad.status!=='freed'&&glad.status!=='retired'&&glad.status!=='infirmary'; // the hurt cannot be fielded until they are treated // fallen, freed and retired gladiators have left the system
/* rosterCount — how many active-roster places are taken. */
const rosterCount=()=>LUDUS_CACHE.filter(glad=>glad.roster&&gladActive(glad)).length;
/* loadLudus — loads the saved gladiators into LUDUS_CACHE: upgrades old records, gives them portraits, sorts (roster, living, hand order, CF) and trims the roster to ROSTER_MAX. */
async function loadLudus(){LUDUS_CACHE=(await Store.list('gladiators')).map(glad=>{
    // older records: carry capped at 25 (missio rule), trophy name lists become all-time totals
    const r={...glad,carry:Math.min(25,glad.carry||0)};if(Array.isArray(r.trophiesP)){r.kP=(r.kP||0)+r.trophiesP.length;delete r.trophiesP}if(Array.isArray(r.trophiesN)){r.kN=(r.kN||0)+r.trophiesN.length;delete r.trophiesN}
    if(!r.portrait)r.portrait=gladPortrait(r.id||r.name,r.cls);return r})
  // v0.15 order: active roster first, then the living, and the fallen/freed/retired always sink to the last tiles.
  // Within a group, a hand-set position (the ⇄ swap system) wins; otherwise CF ranks them.
  .sort((a,b)=>(b.roster&&gladActive(b))-(a.roster&&gladActive(a))||gladActive(b)-gladActive(a)||((a.ord??1e9)-(b.ord??1e9))||(b.cf||0)-(a.cf||0));
  // records from before v0.7 have no active roster yet: the top of the rolls fills it
  /* v0.54: no automatic filling of the active roster — you pick who is fielded */
  // v0.18: the roster shrank to 8 — the lowest-CF extras step back onto the rolls
  {const ros=LUDUS_CACHE.filter(glad=>glad.roster&&gladActive(glad)).sort((a,b)=>(b.cf||0)-(a.cf||0));for(const g of ros.slice(ROSTER_MAX)){g.roster=false;Store.put('gladiators',g.id,{...g}).catch(()=>{})}}
  return LUDUS_CACHE}
/* gladiatorRecord — a saved gladiator's record after an event, built from the result row and the previous record: history entry, CF and carry (half, ≤25), severed limbs, totals and the career ledger. */
function gladiatorRecord(row,prev){
  const p=row.p,ev=EV(),L=LOCATIONS[S.locIdx];
  const tp=p.trophies.filter(t=>t.pk==='player'),tn=p.trophies.filter(t=>t.pk!=='player');
  const entry={date:new Date().toISOString().slice(0,10),event:ev.short+(ev.sr?' · '+ev.sr:''),ev:S.evKey,li:S.locIdx,loc:L?L.n:'',won:!!row.won,cf:row.f,att:S.attendance||0,fate:row.fate?row.fate[0]:'',coin:p.coin,kP:tp.length,kN:tn.length,rounds:S.ri+1,survived:p.alive};
  const r=prev?{...prev}:{name:p.name,cls:p.cls,created:entry.date,history:[],kP:0,kN:0,events:0,wins:0,cpu:!!p.cpu};
  if(prev)r.cpu=!!prev.cpu&&!!p.cpu; // a human who survives with a CPU gladiator makes it eligible for missios
  // older records kept trophy names; the Ludus now keeps all-time totals
  if(Array.isArray(r.trophiesP)){r.kP=(r.kP||0)+r.trophiesP.length;delete r.trophiesP}if(Array.isArray(r.trophiesN)){r.kN=(r.kN||0)+r.trophiesN.length;delete r.trophiesN}
  r.name=p.name;r.cls=p.cls;r.cf=row.f;r.carry=Math.min(25,Math.floor(row.f/2));r.fate=entry.fate;r.status='active';r.updated=entry.date;
  r.severed=['rarm','larm','rleg','lleg'].filter(l=>p.hp[l]<=0);r.coin=(prev?prev.coin||0:0)+p.coin;
  r.kP=(r.kP||0)+entry.kP;r.kN=(r.kN||0)+entry.kN;
  r.events=(r.events||0)+1;r.wins=(r.wins||0)+(row.won?1:0);r.history=[...(r.history||[]),entry];
  // v0.27 career ledger: the totals a Liberti plaque (and the Ludus card) remember
  const st=p.stats||{};r.dmg=(r.dmg||0)+(st.dmgDealt||0);r.taken=(r.taken||0)+(st.dmgTaken||0);r.cfSum=(r.cfSum||0)+row.f;r.best=Math.max(r.best||0,row.f);r.pots=(r.pots||0)+(st.pots||0);
  r.house=(r.house||0)+(typeof houseCount==='function'?houseCount(S.attendance||0,S.seed,S.locIdx):0);r.arenas=[...new Set([...(r.arenas||[]),S.locIdx])];entry.dmg=st.dmgDealt||0;
  if(p.pers)r.pers=p.pers;
  return r;
}
/* saveGladiator — saves (or updates) a result row's gladiator in the Ludus Flavius; a new one clears the weakest dead record when the rolls are full. */
async function saveGladiator(row){
  const prev=row.p.saved?LUDUS_CACHE.find(glad=>glad.id===row.p.saved)||await Store.getDoc('gladiators',row.p.saved):null;
  const id=prev?prev.id:`g${Date.now()}${row.p.id}`;
  const rec=gladiatorRecord(row,prev);
  rec.portrait=(prev&&prev.portrait)||gladPortrait(id,rec.cls);
  rec.roster=prev?!!prev.roster:false; /* v0.54: the active roster is yours to fill — a new save waits on the rolls until you add it */
  // the Ludus holds 60: when a NEW valid gladiator needs a tile, the oldest dead weight is cleared first
  if(!prev&&LUDUS_CACHE.length>=(typeof LUDUS_CAP!=='undefined'?LUDUS_CAP:92)){
    const cut=[...LUDUS_CACHE].filter(glad=>!gladActive(glad)).sort((a,b)=>(a.cf||0)-(b.cf||0))[0];
    if(cut){await Store.del('gladiators',cut.id).catch(()=>{});LUDUS_CACHE=LUDUS_CACHE.filter(glad=>glad.id!==cut.id);
      log(`The Ludus rolls are full: ${esc(cut.name)}'s old record (${cut.status}) is cleared to make room.`)}}
  rec.id=id;await Store.put('gladiators',id,rec);row.p.saved=id;await loadLudus();return rec;
}
/* markFallen — strikes a summoned gladiator who fell short: their record is kept as fallen. */
async function markFallen(player,row){ // a saved gladiator who returns and falls short of the Ludus dies
  const prev=LUDUS_CACHE.find(glad=>glad.id===player.saved)||await Store.getDoc('gladiators',player.saved);if(!prev)return;
  const rec=gladiatorRecord(row,prev);rec.status='fallen';rec.carry=0;rec.roster=false;await Store.put('gladiators',prev.id,rec);await loadLudus();
}
/* gk — a record's all-time trophy count of a kind (P gladiators, N beasts), old name lists included. */
const gk=(glad,kind)=>(glad['k'+kind]||0)+(Array.isArray(glad['trophies'+kind])?glad['trophies'+kind].length:0);
/* ludusTile — one tile on the Ludus rolls (face, CF, stars, class, status, trophies); an empty slot when there is no gladiator. */
function ludusTile(glad,i){
  if(!glad)return `<div class="gtile empty" aria-hidden="true"></div>`;
  const C=CLASSES[glad.cls]||CLASSES.soldier;
  return `<button type="button" class="gtile ${glad.status==='fallen'||glad.status==='retired'?'fallen':glad.status==='freed'?'freed':''}${glad.status==='infirmary'?' infirm':''} ${glad.roster||!gladActive(glad)?'':'bench'}" style="--pc:${C.color}" data-glad="${glad.id}" aria-label="${esc(glad.name)}, ${C.name}, ${glad.cf} CF">
    <span class="face">${portraitSVG(glad.portrait,C.color)}</span>
    ${glad.roster&&gladActive(glad)?'<span class="act" title="In the active roster: can be summoned or fielded from event setup">★</span>':''}
    <span class="cf">${glad.cf}</span>
    <b>${esc(glad.name)}</b><span class="m">${starHTML(starsOf(ludusOvr(glad)))}</span><span class="m">${C.name}${glad.status==='fallen'?' · fallen':glad.status==='freed'?' · freed 🗡':glad.status==='retired'?' · retired':glad.status==='infirmary'?' · 🏥 infirmary':''}</span>
    <span class="m">⚔ ${gk(glad,'P')} · 🐾 ${gk(glad,'N')} · ${glad.events} ev</span></button>`;
}
/* gladFace — a saved gladiator's portrait. */
const gladFace=(glad,size)=>portraitHTML({name:glad.name,portrait:glad.portrait,color:(CLASSES[glad.cls]||CLASSES.soldier).color},size);
/* ludusTip — the hover card for a saved gladiator: face, status, CF and the last six events. */
function ludusTip(glad){
  const C=CLASSES[glad.cls];const h=(glad.history||[]).slice(-6).reverse();
  return `<div style="display:flex;gap:10px;max-width:340px">${gladFace(glad,'sm')}<div><div style="font:400 17px var(--display);color:var(--gold2)">${esc(glad.name)}</div><div class="tt" style="margin:0">${C.name} · ${glad.status==='fallen'?'fallen':glad.status==='freed'?'freed · took the rudis':glad.status==='retired'?'retired':glad.roster?'active roster':'in the Ludus'} · ${glad.cf} CF · returns with ${glad.carry||0}<br>⚔ ${gk(glad,'P')} gladiators · 🐾 ${gk(glad,'N')} beasts · ${glad.wins}/${glad.events} wins</div></div></div>
    <div class="tt" style="max-width:340px">${h.map(x=>`${esc(x.date)} · <b>${esc(x.event)}</b> at ${esc(x.loc)}: ${x.won?'won':'survived'}, ${x.cf} CF`).join('<br>')||'No history yet.'}${(glad.history||[]).length>6?'<br>…':''}<br><i>Click for the full record.</i></div>`;
}
/* ludusDetail — a saved gladiator's full record with its buttons (roster, summon, field as CPU, retire, missio, swap tile). */
function ludusDetail(glad){
  if(!glad)return '';const C=CLASSES[glad.cls];
  return `<div class="gdetail" id="gDetail">${gladFace(glad,'md')}<div>
    <div style="font:400 20px var(--display);color:var(--gold2)">${esc(glad.name)} <span style="font-size:14px">${starHTML(starsOf(ludusOvr(glad)))} <span class="odds">${ludusOvr(glad)}</span></span></div>
    <div style="color:var(--muted);font-size:13px"><span data-card="k:${glad.cls}" style="text-decoration:underline dotted;cursor:help">${C.name}</span> · ${C.sub} · ${glad.status==='fallen'?'<span style="color:var(--blood2)">fallen</span>':glad.status==='freed'?'<b style="color:var(--gold2)">freed · the rudis</b>':glad.status==='retired'?'<span style="color:var(--muted)">retired · lays down the sword</span>':glad.roster?'<b style="color:var(--gold2)">active roster</b>':'in the Ludus Flavius'} · saved ${esc(glad.created)}${glad.cpu?' · CPU':''}</div>
    <div class="badges"><span class="badge gold">${glad.cf} CF last event</span><span class="badge">Returns with ${glad.carry||0} CF</span><span class="badge">${glad.wins}/${glad.events} wins</span><span class="badge">Royal Reserve ${glad.coin||0} coin</span>${(glad.severed||[]).length?`<span class="badge bad">Severed: ${glad.severed.map(l=>LOCN[l]).join(', ')}</span>`:''}</div>
    <h4>All-time trophies</h4><div class="rc-stats"><span><b>${gk(glad,'P')}</b>⚔ Gladiators</span><span><b>${gk(glad,'N')}</b>🐾 Beasts</span><span><b>${glad.wins}</b>Wins</span><span><b>${glad.events}</b>Events</span><span><b>${glad.coin||0}</b>Royal Reserve</span></div>
    <h4>History</h4><table class="tally"><tr><th>Date</th><th>Event</th><th>Result</th><th>CF</th><th>Kills P/N</th></tr>${(glad.history||[]).slice().reverse().map(h=>`<tr><td>${esc(h.date)}</td><td>${esc(h.event)} · ${esc(h.loc)}</td><td>${h.won?'<b style="color:var(--gold2)">won</b>':'survived'} · ${esc(h.fate)}</td><td class="n">${h.cf}</td><td class="n">${Array.isArray(h.kP)?h.kP.length:h.kP||0}/${Array.isArray(h.kN)?h.kN.length:h.kN||0}</td></tr>`).join('')}</table>
    ${glad.cpu?'<p class="hint"><b>🤖 A computer-played gladiator.</b> They were saved from a CPU seat, so for now they only fight <i>against</i> you: in New event, pick them in a seat set to CPU and the computer plays them. In Manager mode you can sign them and bet on them. To play them yourself, a human must first survive one event with them.</p>':''}
    ${glad.status==='freed'?'<p class="hint">This gladiator won their freedom and left the sands forever. Their glory lives in the Liberti (the Annals).</p>':''}
    <div class="mbtns" ${glad.status==='freed'?'hidden':''}>${gladActive(glad)?`<button class="btn" type="button" data-groster="${glad.id}">${glad.roster?'Drop from the active roster':`Add to the active roster<small>${rosterCount()}/${ROSTER_MAX} places taken</small>`}</button>`:''}<button class="btn primary" type="button" data-summon="${glad.id}">Summon to a new event<small>you control them · returns with ${glad.carry||0} CF and fresh class gear</small></button><button class="btn" type="button" data-summoncpu="${glad.id}">Field as a CPU rival<small>keeps their personality</small></button>${gladActive(glad)?`<button class="btn" type="button" data-gretire="${glad.id}">Retire &amp; erase<small>struck from the game forever — though a rare few dodge Flavius and turn up in the stands</small></button>`:''}${!glad.cpu&&MISSIOS[glad.cls]?`<button class="btn" type="button" data-gmissio="${glad.id}">Continue as a missio<small>starts at step ${missioCredit(glad)+1} of 5</small></button>`:''}<button class="btn" type="button" data-gswaptile="${glad.id}">⇄ Swap tile position<small>then click any other tile to trade places</small></button></div>
    ${(typeof CROWD_CACHE!=='undefined'?CROWD_CACHE.filter(r=>r.kin&&String(r.kin.name).toLowerCase()===glad.name.toLowerCase()):[]).length?`<h4>Family in the stands</h4><p class="rc-sub">${CROWD_CACHE.filter(r=>r.kin&&String(r.kin.name).toLowerCase()===glad.name.toLowerCase()).map(r=>`👪 <b>${esc(r.name)}</b> (${esc(r.kin.rel)})`).join(' · ')} — they arrive in family colors whenever ${esc(glad.name)} fights.</p>`:''}</div></div>`;
}
/* ludusHTML — the Ludus Flavius window body: the selected record, the active roster grid, the infirmary and the rolls (60 tiles). */
async function ludusHTML(sel){
  const all=await loadLudus();
  const ros=all.filter(glad=>glad.roster&&gladActive(glad));const rolls=all.filter(glad=>!(glad.roster&&gladActive(glad)));
  const cells=[];for(let i=0;i<60;i++)cells.push(ludusTile(rolls[i],i)); /* v0.47: 60 places on the rolls below the roster of 32 */
  const slot=(glad,i)=>glad?`<button type="button" class="rslot" style="--pc:${(CLASSES[glad.cls]||CLASSES.soldier).color}" data-glad="${glad.id}" aria-label="${esc(glad.name)}, active roster">
      <span class="face">${portraitSVG(glad.portrait,(CLASSES[glad.cls]||CLASSES.soldier).color)}</span><span class="rs-n">${i+1}</span>
      <b>${esc(glad.name)}</b><span class="m">${starHTML(starsOf(ludusOvr(glad)))} ${ludusOvr(glad)}</span><span class="m">${(CLASSES[glad.cls]||CLASSES.soldier).name} · ${glad.cf} CF · ${glad.wins}/${glad.events} won</span></button>`
    :`<div class="rslot empty"><span class="rs-n">${i+1}</span><span class="m">open place</span></div>`;
  return `<div id="gDetailWrap">${sel?ludusDetail(all.find(glad=>glad.id===sel)):'<p class="hint" style="margin:6px 0">Click a gladiator to open their full record — all-time trophies, history, roster and summons.</p>'}</div><div class="card2 rosterbox"><div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:6px"><h4 style="margin:0">⭐ Active roster · ${ros.length}/${ROSTER_MAX}</h4><span class="rc-sub">Click a gladiator for their record · use <b>Add to / Drop from the active roster</b> on their record</span></div>
    <p class="rc-sub" style="margin:4px 0 8px">The active roster is your <b>fielded squad</b>: only these ${ROSTER_MAX} can be picked in New event's seat dropdowns (as your own seat, or a seat the computer plays). Everyone else stays safe on the rolls below — still saved, still summonable from their record — until you promote them. You choose who joins it: open a gladiator’s record and press <b>Add to the active roster</b>.</p>
    <div class="rgrid8">${Array.from({length:ROSTER_MAX},(_,i)=>slot(ros[i],i)).join('')}</div></div>
    <p>Gladiators whose Fate reached the <b>Ludus Flavius</b> (20+ CF) or freedom live here — up to 92 of them — 32 on the active roster and 60 on the rolls. Once saved, their record updates <b>automatically</b> after every event they are summoned to: survive and the legend grows, fall short and they are struck from the rolls for good. Summon one to fight again (half their final CF up to 25, fresh class gear, severed limbs persist), or continue them as a missio — the five-event campaign of their class.${Store.db?' The Ludus is shared with everyone who opens this page.':' Saved in this browser.'}</p>
    ${all.some(glad=>glad.status==='infirmary')?`<div class="card2" style="border-color:var(--blood2);margin:10px 0"><h4 style="margin-top:0">🏥 The Ludus infirmary</h4><p class="rc-sub" style="margin:0 0 6px">Carried from the sand too hurt to stand on the rolls. Care is paid by your <b>active lanista's</b> treasury. Four events untended and a wound writes its own ending — death, flight, or a limp for life.</p>
     <div class="list2">${all.filter(glad=>glad.status==='infirmary').map(glad=>`<div class="lrow" style="--pc:var(--blood2)"><span class="face" style="width:44px">${portraitSVG(glad.portrait,(CLASSES[glad.cls]||CLASSES.soldier).color)}</span><div class="t"><b>${esc(glad.name)}</b><small>needs ${esc((glad.infirm||{}).need||'care')} · ${(glad.infirm||{}).cost||MEDICUS} coin · untended for ${(glad.infirm||{}).wait||0} of 4 events${(glad.severed||[]).length?` · severed: ${glad.severed.map(l=>LOCN[l]).join(', ')}`:''}</small></div><div class="a"><button class="btn primary" type="button" data-ginfirm="${glad.id}">Pay for care<small>${(glad.infirm||{}).cost||MEDICUS} coin · back to the rolls</small></button></div></div>`).join('')}</div></div>`:''}
    <h4>📜 The rolls</h4><div class="ludus" role="list">${cells.join('')}</div>${rolls.length>60?`<p class="hint">${rolls.length-60} more gladiators are stored beyond the first 60.</p>`:''}`;
}
/* openLudus — opens the Ludus Flavius window and handles its buttons (swap tiles, roster, infirmary care, retire & erase, summon, missio). */
async function openLudus(sel,fromHall){
  if(modalBusy())return;
  const html=await ludusHTML(sel);
  const v=await modal('🛡 Your Play Now Gladiators · Ludus Flavius',`<div id="ludusBody">${html}</div>`,[{label:'Close',value:0}],{wide:1,full:1,onOpen:done=>{if(fromHall){const x=$('#mClose');if(x){x.textContent='← Back to the Annals';x.classList.add('saveq')}}
    const box=$('#ludusBody');
    let swapFrom=null; // the ⇄ system: pick a tile, click another, they trade places
    const show=(id,go)=>{const w=$('#gDetailWrap');w.innerHTML=ludusDetail(LUDUS_CACHE.find(glad=>glad.id===id));if(go)try{w.scrollIntoView({block:'start',behavior:'smooth'})}catch(e){}};
    box.onfocusin=e=>{const t=e.target.closest('[data-glad]');if(t&&!swapFrom)show(t.dataset.glad)};
    box.onclick=async e=>{
      const sw=e.target.closest('[data-gswaptile]');
      if(sw){swapFrom=sw.dataset.gswaptile;sw.innerHTML='⇄ Now click the tile to trade with<small>or click this again to cancel</small>';sw.classList.add('primary');if(sw.dataset.armed){swapFrom=null;delete sw.dataset.armed;sw.classList.remove('primary');sw.innerHTML='⇄ Swap tile position<small>then click any other tile to trade places</small>'}else sw.dataset.armed='1';return}
      const t=e.target.closest('[data-glad]');
      if(t&&swapFrom&&t.dataset.glad!==swapFrom){
        const a2=LUDUS_CACHE.find(glad=>glad.id===swapFrom),b2=LUDUS_CACHE.find(glad=>glad.id===t.dataset.glad);
        if(a2&&b2){LUDUS_CACHE.forEach((glad,i)=>{if(glad.ord==null)glad.ord=i}); // first swap pins everyone's current order
          [a2.ord,b2.ord]=[b2.ord,a2.ord];
          await Store.put('gladiators',a2.id,{...a2}).catch(()=>{});await Store.put('gladiators',b2.id,{...b2}).catch(()=>{});
          await loadLudus();box.innerHTML=await ludusHTML(a2.id)}
        swapFrom=null;return}
      if(t){show(t.dataset.glad,1);return}
      const ro=e.target.closest('[data-groster]');
      if(ro){const g=LUDUS_CACHE.find(x=>x.id===ro.dataset.groster);if(!g)return;
        if(!g.roster&&rosterCount()>=ROSTER_MAX){ro.innerHTML=`Roster full (${ROSTER_MAX}): drop someone first`;return}
        g.roster=!g.roster;Store.put('gladiators',g.id,{...g}).catch(()=>{});
        box.innerHTML=await ludusHTML(g.id);return}
      const gi=e.target.closest('[data-ginfirm]');
      if(gi){const g=LUDUS_CACHE.find(x=>x.id===gi.dataset.ginfirm);if(!g)return;
        const cost=(g.infirm||{}).cost||MEDICUS;
        const m=typeof activeMgr==='function'?await activeMgr():null;
        if(!m||m.coin<cost){gi.innerHTML=`Needs ${cost} coin from an active lanista<small>${m?'treasury too light — win purses or bets':'set one in Manager mode or at the Wagers table'}</small>`;return}
        const pr=await getPurse();await setPurse({...pr,coin:pr.coin-cost});
        g.status='active';if((g.infirm||{}).need&&/Hygeia/.test(g.infirm.need))g.severed=[];delete g.infirm;
        await Store.put('gladiators',g.id,{...g}).catch(()=>{});
        log(`🏥 ${esc(g.name)} is treated (${cost} coin) and discharged — back on the Ludus rolls, fit to fight.`,'big');
        box.innerHTML=await ludusHTML(g.id);return}
      const rt=e.target.closest('[data-gretire]');
      if(rt){e.stopPropagation();const g=LUDUS_CACHE.find(x=>x.id===rt.dataset.gretire);if(!g)return;
        if(rt.dataset.armed!=='1'){rt.dataset.armed='1';rt.innerHTML='CONFIRM · erase forever<small>one more click and they are gone from the game</small>';rt.classList.add('primary');rt.style.borderColor='var(--blood2)';return}
        // one confirm, then GONE: the record is deleted outright. But roughly one in four slips the editor's
        // ledger entirely and turns up in the cheap seats a week later, story intact.
        const escaped=Math.random()<0.25;
        await Store.del('gladiators',g.id).catch(()=>{});
        LUDUS_CACHE=LUDUS_CACHE.filter(x=>x.id!==g.id);
        let farewell;
        if(escaped&&typeof CROWD_CACHE!=='undefined'){
          const r={id:'spex'+g.id,name:g.name,taste:pickOne(['aggression','cf','underdog']),temper:pickOne(['loyal','bloodthirsty','hothead']),
            exGlad:1,visits:0,quit:null,grudgeName:null,custom:0,trouble:Math.random()<.3?1:0,
            look:{skin:g.portrait&&g.portrait.skin||pickOne(SKINS),hair:g.portrait&&g.portrait.hair||pickOne(HAIRS),fem:!!(g.portrait&&g.portrait.fem),beard:!!(g.portrait&&g.portrait.beard),long:!!(g.portrait&&g.portrait.long)},
            mem:[{d:new Date().toISOString().slice(0,10),kind:'exglad',note:`used to BE a gladiator: ${g.events||0} events, ${g.wins||0} wins, ${gk(g,'P')} gladiators and ${gk(g,'N')} beasts on the wall`}]};
          CROWD_CACHE.push(r);Store.put('crowd',r.id,r).catch(()=>{});
          farewell=`<div class="card2"><b style="color:var(--gold2)">${esc(g.name)} vanishes in the night.</b><p style="margin:6px 0 0">The record is burned, the cell is empty — and a week later the ushers swear they saw the same face in the cheap seats, eating ${specLore(r).snack} and heckling the undercard like they never swung a sword. Some people just cannot leave the arena. (Find them in the Spectator roster.)</p></div>`;
        }else{
          farewell=`<div class="card2"><b style="color:var(--blood2)">${esc(g.name)} is erased.</b><p style="margin:6px 0 0">The record is burned, the name is chiselled off the rolls, and the sand forgets faster than anyone likes to admit. Retirement from Flavius's arena is just death with better paperwork.</p></div>`;
        }
        box.innerHTML=await ludusHTML(null);const wrap=$('#gDetailWrap');if(wrap)wrap.innerHTML=farewell;
        return}
      const s=e.target.closest('[data-summon]');if(s)done('summon:'+s.dataset.summon);const sc=e.target.closest('[data-summoncpu]');if(sc)done('summoncpu:'+sc.dataset.summoncpu);const m=e.target.closest('[data-gmissio]');if(m)done('missio:'+m.dataset.gmissio)};
  }});
  if(typeof v==='string'&&v.startsWith('summon:')){const g=LUDUS_CACHE.find(x=>x.id===v.slice(7));if(g){summonToSetup(g);openSetup()}}
  if(typeof v==='string'&&v.startsWith('summoncpu:')){const g=LUDUS_CACHE.find(x=>x.id===v.slice(10));if(g){summonToSetup(g,true);openSetup()}}
  if(typeof v==='string'&&v.startsWith('missio:')){const g=LUDUS_CACHE.find(x=>x.id===v.slice(7));if(g){const ms=await Store.list('missios');const ex=ms.find(m=>m.gladId===g.id&&m.status==='active');const rec=ex||await missioFromLudus(g);startMissio(rec)}}
  if(fromHall&&(v===0||v==null)&&typeof openHall==='function')setTimeout(()=>openHall('infamis'),60); // v0.43: back to the Annals
}
/* summonToSetup — puts a saved gladiator into a New event seat (seat 1, or a free CPU seat when fielded as a CPU rival). */
function summonToSetup(glad,asCpu=false){
  CFG.mode='event';
  const i=asCpu?Math.max(1,CFG.seats.findIndex((o,j)=>j>0&&o.cpu&&!o.saved)):0;const s=CFG.seats[i<0?1:i];
  // free the class if another seat holds it
  const clash=CFG.seats.find(o=>o!==s&&o.cls===glad.cls);if(clash)clash.cls=s.cls;
  Object.assign(s,{cls:glad.cls,cpu:asCpu,name:glad.name,saved:glad.id});
  if(asCpu&&glad.pers){s.preset='custom';s.pers={...glad.pers}}
}
/* the top-bar Ludus button. */
$('#btnLudus').onclick=()=>openLudus();

/* ================= STRATEGY GUIDE ================= */
/* Results of 300 simulated all-CPU classic events — THIS. IS. SPARTA. (Well. The arena.) v0.11 rules. */
const SIM_STATS={"games": 300, "gladiators": 1200, "winCF": 50, "ludusPct": 35, "potWin": 32, "noPotWin": 12, "avgTurns": 55, "cls": {"amazonia": {"win": 31, "cf": 22}, "damnatio": {"win": 7, "cf": 8}, "hero": {"win": 34, "cf": 26}, "royalty": {"win": 31, "cf": 18}, "slave": {"win": 22, "cf": 13}, "soldier": {"win": 29, "cf": 18}, "venatore": {"win": 18, "cf": 18}, "veteranus": {"win": 29, "cf": 22}}, "pers": {"hunt": {"n": 163, "win": 21, "cf": 19.4, "ludus": 37}, "coin": {"n": 211, "win": 27, "cf": 16.1, "ludus": 28}, "loyalty": {"n": 29, "win": 24, "cf": 17.7, "ludus": 38}, "cf": {"n": 237, "win": 27, "cf": 22.1, "ludus": 46}, "aggression": {"n": 326, "win": 29, "cf": 19.7, "ludus": 37}, "survival": {"n": 234, "win": 18, "cf": 12.7, "ludus": 25}}, "findings": ["Gladiators with 2+ beast trophies won 28% of events and reached the Ludus 44% of the time; with none, 18% and 18%. The beasts are the arena's savings account.", "Buying 2+ market items: 28% win rate, versus 14% for gladiators who never bought. Coin left in the purse wins nothing.", "Breaking 2+ pots: 32% win rate and 41% reached the Ludus, versus 12% and 25% for the pot-shy. A power-1 weapon breaks a pot only 1 time in 4 \u2014 pots are a job for power-2 weapons, a Cestus or Herculean Vigor.", "Drawing 2+ arena cards: 27% win rate versus 18% for coin-only players, and the card players reached the Ludus twice as often (39% vs 19%).", "Very cautious gladiators (survival 70+) averaged 13.5 CF against 22.4 for the bold (30 or less). The crowd pays for nerve, not for hiding.", "Keen beast hunters (hunt 70+) averaged 18.2 CF against 13.8 for gladiators who ignore the beasts.", "Difficulty check (100 further events with one Easy, one Normal and two Hard CPUs): Easy won 3%, Normal 20%, each Hard CPU 39%. Hard CPUs now ration shield uses, route around danger and never lose track of a walled-in beast.", "An event lasted 55 turns on average, and winners finished with about 50 CF \u2014 under the new crowd scaling, big attendance changes the noise, not the number."], "note": "300 events, four gladiators each, random classes and personalities, normal difficulty, v0.11 rules. Dominant trait = the highest of the six priorities; win rates sit near 25% because four gladiators enter each event."};

/* gearGuideHTML — the strategy guide's gear section: weapons ranked by expected damage, best armor per slot. */
function gearGuideHTML(){
  // expected damage per attack: PvP rolls 2 hit dice, PvE 4, each hit is 50/50
  const rows=Object.entries(W).filter(([k,w])=>w.lv>=1&&!w.limb&&!w.lyre&&!w.noAtk).map(([k,w])=>{
    const pvp=w.p*1+(w.both?w.p:0),pve=w.p*2+(w.both?w.p*2:0);
    const extra=[w.throw?`throw P${w.throw.p} R${w.throw.r} ×${w.throw.n}`:'',w.ammo?`${w.ammo} ammo`:'',w.atkUses?`${w.atkUses} uses`:'',w.shield?`absorbs ${w.absorb} × ${w.uses}`:'',w.cfw?`+${w.cfw} CF per hit`:'',w.soul?`+${w.soul} HP per hit`:'',w.both?'both attacks':'',w.flav?'Flavius item (+2 CF if you win)':''].filter(Boolean).join(' · ');
    const score=w.shield&&!w.p?w.absorb*w.uses/3:pve*(1+(w.r-1)*0.25)+(w.throw?w.throw.p*0.5:0)+(w.cfw?1.5:0)+(w.soul?1.5:0);
    return {k,w,pvp,pve,extra,score}}).sort((a,b)=>b.score-a.score);
  const byLv=lv=>rows.filter(r=>r.w.lv===lv);
  const wRow=r=>`<tr><td data-card="w:${r.k}" style="cursor:help;text-decoration:underline dotted">${r.w.n}</td><td class="n">${r.w.lv===4?'4 · chest':r.w.lv}</td><td class="n">${r.w.shield&&!r.w.p?'—':r.w.p}</td><td class="n">${r.w.shield&&!r.w.p?'—':r.w.r}</td><td class="n">${r.w.shield&&!r.w.p?'—':r.pvp}</td><td class="n">${r.w.shield&&!r.w.p?'—':r.pve}</td><td style="font-size:13px;color:var(--muted)">${r.extra}</td></tr>`;
  const armor=Object.entries(ARM).map(([k,a])=>({k,a,val:a.ap*(a.pair?2:1)+Object.values(a.bonus||{}).reduce((s,v)=>s+v,0)+(a.greaves?3:0)+(a.cestus?2:0)})).sort((x,y)=>y.val-x.val);
  const slotName={head:'Head',chest:'Chest',arm:'Arms',leg:'Legs'};
  return `<h4>Best weapons</h4>
   <p>Expected damage per attack assumes every hit die is a coin flip: 2 dice against gladiators, 4 against beasts. Range matters as much as power: an attack from 3+ tiles away rarely gets hit back.</p>
   <ul><li><b>Level 1 (4 coin):</b> ${byLv(1).filter(r=>r.w.p).slice(0,3).map(r=>r.w.n).join(', ')}. Knives and Stones reach 2-3 tiles; the Hasta and Tridenti throw for 2. Everything else hits for 1.</li>
   <li><b>Level 2 (8 coin):</b> ${byLv(2).filter(r=>r.w.p).slice(0,3).map(r=>r.w.n).join(', ')}. The Axe, Falcata and Royal Dagger hit for 2; the Parthian Bow and Stone Sling reach 5 tiles. The Scutum Shield absorbs 2 per hit for 4 hits.</li>
   <li><b>Level 3 (12 coin):</b> the Charun and Tri-Ball Flail (power 4, range 2) are the best buys in the game; the Gladius of Flavius hits as hard at range 1 and counts as a Flavius item.</li>
   <li><b>Level 4 · Arena Chest (1 key):</b> the Labrys attacks twice for 4, the Psykhe heals you 1 HP per hit, and the Shield of Achilles absorbs 2 per hit for 12 uses while still striking for 2.</li></ul>
   <div style="overflow-x:auto"><table class="tally"><tr><th>Weapon</th><th>Level</th><th>Power</th><th>Range</th><th>Exp. dmg PvP</th><th>Exp. dmg PvE</th><th>Notes</th></tr>${rows.map(wRow).join('')}</table></div>
   <h4>Best armor</h4>
   <p>Each body location holds at most one padded (stackable) piece plus one piece per equip point, and never more than 7 AP. Padded wraps sit under bracers and greaves; a Balteus belt stacks with any chest armor.</p>
   <ul>${['head','chest','arm','leg'].map(sl=>{const best=armor.filter(x=>x.a.slot===sl).slice(0,3);return `<li><b>${slotName[sl]}:</b> ${best.map(x=>`${x.a.n} (${x.a.ap} AP${x.a.pair?' each side':''}${x.a.bonus?', bonus '+Object.entries(x.a.bonus).map(([l,v])=>`+${v} ${LOCN[l]}`).join(' '):''}${x.a.greaves?', +1 movement as a pair':''}${x.a.cestus?', +1 damage':''}, level ${x.a.lv})`).join('; ')}</li>`}).join('')}</ul>
   <p>Priorities: armor the head and chest first (losing either eliminates you), then the arm that holds your best weapon. The ${armor[0].a.n} is the single strongest piece (${armor[0].a.ap} AP${armor[0].a.bonus?' plus '+Object.entries(armor[0].a.bonus).map(([l,v])=>`${v} AP on the ${LOCN[l].toLowerCase()}`).join(' and '):''}).</p>`;
}
/* guideHTML — the original strategy guide (Rules & strategy → guide), with the SIM_STATS numbers. */
function guideHTML(){
  const st=typeof SIM_STATS!=='undefined'?SIM_STATS:null;
  const cls=BASE_CLS.map(k=>[k,CLASSES[k]]);
  return `<div class="guide">
  <p>Advice distilled from the rulebook and from <b>${st?st.games:'many'} simulated all-CPU events</b>${st&&st.games===300?' — three hundred of them, because some numbers demand it. <i>This is the arena.</i>':''} Turn <b>Hints</b> on in the top bar for rule popups the first time something happens and live suggestions in your Action panel.</p>
  <h4>Winning the crowd</h4><ul>
   <li><b>Your Fate is your score.</b> 20+ CF reaches the Ludus Flavius (you can save your gladiator); 50+ earns freedom. 17-19 is the Thumb of Flavius, a coin flip with your life.</li>
   <li>Early CF comes from <b>Blessings pots</b> (2 coin + 1 CF + a hidden offering, 2 damage breaks one), <b>beast trophies</b> (snake 3, wolf 4, bear 5, lion 5, Commodus and Tholo 6) and your class ability. A gladiator elimination is worth 10 CF and a trophy.</li>
   <li>Winners add 15 CF, 5 CF per 3 trophies and 2 CF per Flavius item. Every Mandata Flavi still hidden at the end costs 5 CF, so work on yours early.</li>
   ${st?`<li>In the simulations winners averaged <b>${st.winCF} CF</b>; ${st.ludusPct}% of all gladiators reached the Ludus Flavius, and gladiators who broke 2+ pots in round 1 won ${st.potWin}% of events versus ${st.noPotWin}% for those who broke none.</li>`:''}
  </ul>
  ${st?`<h4>What ${st.games} simulated events say</h4><ul>${st.findings.map(f=>`<li>${f}</li>`).join('')}</ul>`:''}
  <h4>Each turn</h4><ul>
   <li><b>Resolve</b>: check which beasts are aggro on you (the NPC tracker shows it). An NPC holds one aggro target, the last gladiator to hit it, and still lashes out at anyone adjacent.</li>
   <li><b>Choice</b>: 2 coin is safe. Of the arena deck's 33 instant cards, 18 cost you something (armor or weapons falling apart, Lashings, Telonium, Piaculum). Draw when you are healthy or need a spike: Omnia Mutantur, Minerva's Push and Elixirs win fights.</li>
   <li><b>Action</b>: attack first if a kill or pot is in reach, then move; you get one attack per arm. Diagonals cost 2 movement.</li>
   <li>Push beasts or rivals onto floor spikes (2 damage), push pillars onto tunnels to seal them, and topple pillars (3 movement) for 3 damage on the next two tiles plus every pot on top.</li>
  </ul>
  ${gearGuideHTML()}
  <h4>Beasts and behavior states</h4><ul>
   <li>Lions, Commodus and Tholo start <b>Initial</b>, turn <b>Raged</b> (harder hits, faster) as they lose HP, then <b>Fazed</b> (slow, weak) near death. Don't stand next to a Raged Tholo (5 attack); finish a Fazed one before a rival steals the trophy.</li>
   <li>Base beasts guard zones: stand in a zone at the start of your turn and its beast comes for you. Snakes (3 HP) and wolves (6 HP) are the safest early trophies; bears hit for 3.</li>
   <li>Tunnels and the Ward of the Evil Eye shake aggro. A Meat Lure hands a beast's aggro to a rival within 4 tiles.</li>
   <li>Tholo can only be head-shot with a focused Arcuballista, and he steals the chest if he walks over it.</li>
  </ul>
  <h4>Allies, truces and teams</h4><ul>
   <li>Allied CPUs gift elixirs and AP to hurt teammates, share keys for the chest and focus fire on whatever is hitting their allies. You can gift items too from Trade or truce.</li>
   <li>A truce ends the moment either side attacks. When every gladiator left is in truce in an elimination event, Flavius breaks every truce.</li>
  </ul>
  <h4>The newer rules, mastered</h4><ul>
   <li><b>Shields are a choice.</b> Each incoming hit you decide whether to spend a use absorbing the shield's stated value; the rest falls on armor, then flesh. Spend uses on 2+ damage hits and on any hit that threatens a severing; let chip damage land on healthy armor.</li>
   <li><b>Big crowds cheer louder, not richer.</b> Up to 8 seated, every fan in your section is 1 CF (the printed rule). Over 8, your section is worth its share of the house (fans × 8 ÷ attendance), fractions carry turn to turn, and no section pays more than 3 CF per resolve — so packing the stands with your fans helps, but freedom still has to be won with trophies and the final bout. Attendance is recorded with every result.</li>
   <li><b>Mind the omen.</b> Weather and city news sway attendance and moods, and a hometown gladiator gains (or loses) CF before their own city. In Manager mode the omen also scales the night's purses.</li>
   <li><b>The Gauntlet pays for blood only.</b> No coin from the Choice phase, at most 12 (stingy) spectators, and three quiet rotations earn the editor's lash. Kill fast or die tired.</li>
   <li><b>The editor's patience is finite everywhere:</b> 40 rotations without blood (or 200 total) and Flavius calls the event on Crowd Favor.</li>
  </ul>
  <h4>Manager mode: how recruiting really works</h4><ul>
   <li>Every fighter weighs three <b>motives</b> (coin, glory, honor, spectacle, training, home, arena time) and grades your ludus A–F on each. Interest ≈ the weighted sum. <b>Scout first</b>: it reveals their motives, so your pitches stop guessing.</li>
   <li><b>Raising your grades</b>: treasury and low greed raise Coin; wins and fame raise Glory and Spectacle; Discipline plus improved fighters raises Training; a small roster raises Arena time; and Honor is the slow one — poaches (−9) and broken pledges (−6) scar it, kept pledges (+3) heal it.</li>
   <li><b>The tools</b>: Pitch (1h, aimed at a motive you grade well), Send a gift (2h, lands hardest on coin-hungry fighters), Host a feast (4h, the big swing), Scout (3h, sparring report + motives), and the <b>Pledge</b> — promise the main event within 2 weeks for +12 interest at the table. Keep it and the barracks notice; break it and your Honor pays for years.</li>
   <li><b>Rivalry is real.</b> Poach a stable, outbid a suitor or beat their fighters and that lanista runs hot: bitter rivals poach YOUR fighters first and bet against your entries. The League tab shows every feud.</li>
   <li>Watch the books: three week-ends in the red (or a season ended in debt) and the creditors close the ludus for good. The weekly repair budget (${typeof REPAIR_CAP!=='undefined'?REPAIR_CAP:50} coin) covers Hygeia limb regrowth and the Medicus.</li>
  </ul>
  <h4>Manager mode: the life of a league fighter</h4><ul>
   <li><b>Fates in the league.</b> Every league bout ends the way a board-game event does: each fighter meets the <b>Fate table</b> (p.54-55). Under 17 CF they are condemned (Damnatio or a Fatal Charade); 17-19 CF, the <b>Thumb of Flavius</b> — you roll the d6 yourself on Match Week (4-6 spares them, 1-3 hands them to a d12 death); 20-49 CF, the <b>Ludus Flavius</b> — they survive; 50+ CF, the <b>rudis</b> — freedom, theirs to take (you can ask them to stay). Any condemned fighter can be bought back with <b>blood money</b> paid to the editor — the price rises with their rating, fame and how grim the sentence. (A <b>missio</b>, in Flavius Rule, is something else entirely: a five-event campaign for one gladiator — see New event → Missio.)</li>
   <li><b>How fighters enter the league</b>: two or three new faces arrive every week (mostly rookies, 17–21, low-rated but high-potential and cheap); your arena's saved Ludus Flavius gladiators and Creator Studio characters join every new career; and a bout short of entrants conscripts a fresh sword on the spot.</li>
   <li><b>How they leave</b>: death under the thumb; two severed limbs (unless healed by Hygeia); a cheap free agent who goes unsigned ~14 weeks gives up and goes home; and <b>age</b> — every season is a birthday, and past 35 each year makes hanging up the sword likelier.</li>
   <li><b>Age shapes class</b>: the young arrive mostly as Slaves and Soldiers; the graying re-badge as Veteranus. Mid-career (23–31) is when fighters most often change class — at a ludus's request, after new drills, on an omen-reader's advice, or plain restlessness. The news criers report every change.</li>
   <li><b>The training yard</b>: set a weekly drill budget in Your ludus. More coin per fighter means better odds of +1 rating (your Discipline helps), the report prints in the Acta Diurna — and a hard week or an ill omen can injure someone: benched and rating-docked until the Medicus (or a week of rest) clears it.</li>
  </ul>
  <h4>Classes</h4><ul>${cls.map(([k,C])=>`<li><span data-card="k:${k}" style="text-decoration:underline dotted;cursor:help">${C.name}</span>: ${esc(C.ab)} ${{soldier:'Soldiers lean strong: with Strength 76+ every hit lands harder while class abilities are on, so strike early, then armor up.',royalty:'Royalty leans lucky: Luck 76+ pays coin each turn. Bank it into level 2-3 weapons; the Pugio hits for 2.',hero:'Heroes lean on Charisma: 76+ adds CF each turn. The Scutum absorbs 2 per hit for 4 hits, so play long.',slave:'Slaves lean fast: Speed 76+ means an extra tile a turn to race to pots and away from beasts; the Rete stops a chaser.',veteranus:'Best armor in the game (5 AP head and chest) but the Rudis falls apart after 6 uses, so buy a weapon early.',amazonia:'Axe and Falcata both hit for 2 and the Cestus adds 1. You gain no CF from pots, so hunt beasts and gladiators.',venatore:'Release Zora early: he breaks pots and carries loot. Your Tame card turns a wolf or bear into a bodyguard.',damnatio:'No armor worth the name and a stone to the head each turn. The Stone Sling reaches 5 tiles; stay far away and win for +10 CF.'}[k]}${st&&st.cls[k]?` <span style="color:var(--muted)">(sim win rate ${st.cls[k].win}%, avg CF ${st.cls[k].cf})</span>`:''}</li>`).join('')}</ul>
  ${st?`<h4>Personalities in the simulations</h4><table class="tally"><tr><th>Dominant trait</th><th>Games</th><th>Win rate</th><th>Avg final CF</th><th>Reached Ludus</th></tr>${Object.entries(st.pers).map(([k,v])=>`<tr><td>${esc(PERS_KEYS.find(x=>x[0]===k)?.[1]||k)}</td><td class="n">${v.n}</td><td class="n">${v.win}%</td><td class="n">${v.cf}</td><td class="n">${v.ludus}%</td></tr>`).join('')}</table><p class="hint">${esc(st.note||'')}</p>`:''}
    <h4>Manager mode, beyond the sand (v0.21–v0.25)</h4><ul>
   <li><b>Morale fights with them.</b> 80+ morale walks out with +1 AP and +1 CF and a bolder style; under 35 costs 1 AP; under 20 drops them a whole difficulty tier. A shared meal or kin tickets before Match Week is cheap insurance.</li>
   <li><b>Walk the sand</b> every week you enter someone: 2 hours and 6 coin buys +1 AP and +1 coin for each of your fighters on that card — better value than most training.</li>
   <li><b>Enter a fighter every week.</b> The appearance fee is paid win or lose, so an entry is never a loss even before the purse.</li>
   <li><b>Read the Consilium.</b> The Quaestor's runway is the number to watch: under three weeks of wages, stop signing and start entering.</li>
   <li><b>Bet on value, not favorites.</b> Scouted fighters show your own estimate beside the bookmaker's; ▲ value marks the only bets worth making. Every slip lands in the shared exchange, so you can see who else is laying coin.</li>
   <li><b>Fell behind the empire?</b> The doctores can run the missing weeks with sensible verdicts — or keep your own calendar if you'd rather play every week yourself.</li></ul>
  <h4>What a rating means (Manager mode)</h4><ul>
   <li><b>Rating sets the brain.</b> Below 60 a fighter plays like an <b>Easy</b> CPU: noisy decisions, random card and coin choices, no truces, no clever tunnel play. 60-79 plays <b>Normal</b>. <b>80+</b> plays <b>Hard</b>: almost no noise, banks coin for the market, avoids the deck when hurt, uses tunnels and truces well.</li>
   <li><b>Rating fits armor and fills the purse.</b> Before the bout a fighter gets +1 AP for every 6 points above 62 (65 → +1, 74 → +2, 80 → +3, 86+ → +4-5) and +1 coin for every 5 points above 70 (75 → +1, 90 → +4). A 37 walks out bare with an empty purse; a 65 with one extra AP; an 85 with four AP, three coin and the Hard brain.</li>
   <li><b>So a 37 against a 65 is not a fair fight</b> — but it is still a dice game. Hit dice, the Blessings bag, beasts and the crowd give the underdog real upsets, which is exactly why the bookmaker offers long odds on them.</li>
   <li><b>Morale moves it.</b> High morale: +1 AP, +1 CF. Low: −1 AP. Broken: one tier worse at thinking. Injuries lower the rating itself (−3 to −5), and every severed limb costs 6.</li></ul>
  <h4>The square and the long game (v0.30)</h4><ul>
   <li><b>Walk the square before Match Week.</b> The tavern scouts someone for 6 coin, the bathhouse is the cheapest morale in the game, and kit from the arms market means your fighter starts armed instead of spending first-turn coin at the arena market.</li>
   <li><b>The auction block is a lottery ticket.</b> A few coins for a body in the barracks; roughly one in eight is a hidden gem who re-rates upward on their first win for you.</li>
   <li><b>Loans are a bridge, not a business.</b> 8% a week compounds brutally; borrow only what one good Match Week can repay — and pay a friendly house back early, since they remember it.</li>
   <li><b>Play for Legacy.</b> There is no forced ending: cups and Superbus crowns are worth the most, and retirement at a high tier is the closest thing to "beating" Manager mode.</li></ul>
  <h4>The table and the week (v0.29)</h4><ul>
   <li><b>Points win seasons, fame wins recruits.</b> A win is 3, a runner-up finish 1. The top four go to the Superbus. Feature and main-event wins count the same as undercard wins, so entering every bout you can win matters more than chasing one big purse.</li>
   <li><b>Work left to right, then End the week.</b> Ludus → Roster → Recruiting → … → Match Week. End the week pays wages and moves the empire; you can't undo it, so spend your recruiting hours first.</li>
   <li><b>Invitations are deadly now.</b> A heat winner rarely falls to the Fates (the winner's bonus lifts their score), but the rest of the field plays for its life. Send fighters you can afford to lose — or pick events marked Fate-free.</li></ul>
  <h4>Money, facilities and the market (v0.28)</h4><ul>
   <li><b>Money talks.</b> A recruit's interest counts the wage you put on the table: every coin over their ask adds interest (1.5× the ask ≈ +45), and a big enough offer buys past the fame they would normally demand. A humble ludus can sign a blue-chip fighter — if it pays like a palace. Stars (4★/5★) ask 25%/50% more to begin with.</li>
   <li><b>One of each, three pitches.</b> Each week you can scout, feast, gift, trial, pitch and make an offer to a recruit once each, with three pitches in total. Spread your hours across prospects instead of hammering one.</li>
   <li><b>Facilities are where big winnings belong.</b> The Training yard, Valetudinarium, Barracks, Armory and Practice stands are permanent, cost 250 / 600 / 1200 a level, and set your Ludus grade — recruits weigh it, and each one works every single week.</li>
   <li><b>The bookmaker has limits.</b> No slip pays more than 500 coin, and the Emperor takes a tenth of the profit on every winning bet.</li></ul>
  <h4>Silverware (v0.27)</h4><ul>
   <li><b>The Flavian Awards reward seasons, not nights.</b> The Aureus Gladius goes to the most wins, the Darling of the Stands to the single best Fate score, the Iron Thumb and the Bestiarius Horn to the most gladiators and beasts beaten. Spreading bouts across one star fighter chases the Aureus; a deep roster chases the Iron Sandal.</li>
   <li><b>Accept invitations you can win.</b> The stars are honest: a ★★★ Leptis Cup is a fine first trophy; the ★★★★★ Colossus draws the league's best. Two fighters in the Colossus means two heats with a chance — they never meet in round one.</li>
   <li><b>Trophy CF rides into the next bout.</b> A trophy's CF reward is banked on the fighter who won it and added to their starting CF next time out — a head start toward the rudis.</li>
   <li><b>Early billing is a small, safe edge.</b> +10 coin and +1 fame just for planning; the 15% poster bonus only if they win. Bill a steady fighter for a week whose fixture suits them.</li>
   <li><b>The Fate score is not the CF on the card.</b> Winners add the event reward, 5 per 3 trophies, 2 per Flavius item and 15 for a held Golden Eagle — watch the <i>win → N</i> line to see how close the rudis really is.</li></ul>
  <h4>The Hall and the Road</h4><ul>
   <li>Achievements unlock token parts and titles; <b>Sand in the Sandals</b> (25 events) adds 25 coin to every new Manager career — worth earning early.</li>
   <li><b>The Road of Flavius</b> starts at Arles and ends at Roma. Commit a well-armored, high-HP gladiator from your Ludus: one loss ends it, so the survivable classes (Soldier, Veteranus) walk further than glass cannons.</li></ul>
  ${typeof cheatsGuideHTML==='function'?cheatsGuideHTML():''}
</div>`;
}
// The strategy guide lives inside 'Rules in this build' (showRules('guide')) since v0.7.

/* ================= VISUAL FEEDBACK: floating numbers, attack flashes, banners, shake ================= */
const FX=[],FXL=[];let fxRAF=null;
/* reduceMotion — true when Settings → Reduce motion is on or the system asks for reduced motion. */
const reduceMotion=()=>{try{if(typeof SETTINGS!=='undefined'&&SETTINGS.calm)return true;return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}}; /* v0.63: or Settings → Reduce motion */
/* v0.46 HIT FEEDBACK: every blow that lands makes its target flash red — a figure, a beast, a Blessings pot or a pillar —
   and the Spiders offering sends a swarm crawling over whoever broke it open. */
const HITFX=[];
/* hitFlash — queues a red hit flash (green for heals, a spider swarm for the Spiders offering) on tile r,c. TWEAK: the durations (spiders 2600, heal 900, hit 520 ms). */
function hitFlash(r,c,kind='hit'){if(HEADLESS||!S||S.sim||r==null)return;HITFX.push({r,c,kind,t0:performance.now(),dur:kind==='spiders'?2600:kind==='heal'?900:520,seed:Math.random()*1000});if(!fxRAF)fxLoop()}
/* drawHitFX — draws the queued hit flashes and spider swarms on the canvas. */
function drawHitFX(){const now=performance.now();
  for(let i=HITFX.length-1;i>=0;i--){const h=HITFX[i];const k=(now-h.t0)/h.dur;if(k>=1){HITFX.splice(i,1);continue}const m=center(h.r,h.c);
    if(h.kind==='spiders'){ctx.save();const n=14;for(let j=0;j<n;j++){const a=h.seed+j*2.399;const ph=(k*3+j/n)%1;const rad=TW*(0.12+0.26*((j*37)%10)/10);
        const x=m.x+Math.cos(a+k*6*(j%2?1:-1))*rad,y=m.y-TW*(0.15+0.75*ph)+Math.sin(a*1.7+k*9)*TW*0.06;ctx.globalAlpha=k>0.8?(1-k)/0.2:Math.min(1,k*6);
        ctx.fillStyle='#120b08';ctx.strokeStyle='#120b08';ctx.lineWidth=1;const s=TW*0.035;ctx.beginPath();ctx.ellipse(x,y,s*1.2,s,0,0,Math.PI*2);ctx.fill();
        for(let l=0;l<4;l++){const wig=Math.sin(now/60+j+l)*s*0.6;ctx.beginPath();ctx.moveTo(x-s,y);ctx.lineTo(x-s*2.4,y-s+l*s*0.7+wig);ctx.moveTo(x+s,y);ctx.lineTo(x+s*2.4,y-s+l*s*0.7-wig);ctx.stroke()}
        ctx.fillStyle='#8a1d12';ctx.beginPath();ctx.arc(x,y-s*0.2,s*0.35,0,Math.PI*2);ctx.fill()}ctx.restore();continue}
    const a=(1-k)*(h.kind==='hit'?0.75:0.6);ctx.save();ctx.globalCompositeOperation='lighter';
    const cy=h.kind==='pot'?m.y-TW*1.05:h.kind==='pillar'?m.y-TW*0.6:m.y-TW*0.45;const rr=TW*(h.kind==='pillar'?0.6:0.5)*(1+k*0.3);
    const g=ctx.createRadialGradient(m.x,cy,0,m.x,cy,rr);const HL9=h.kind==='heal';g.addColorStop(0,HL9?`rgba(90,255,120,${a})`:`rgba(255,40,20,${a})`);g.addColorStop(0.6,HL9?`rgba(30,200,70,${a*0.5})`:`rgba(200,20,10,${a*0.5})`);g.addColorStop(1,HL9?'rgba(0,140,40,0)':'rgba(160,0,0,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(m.x,cy,rr*0.8,rr*(h.kind==='pillar'?1.4:1.1),0,0,Math.PI*2);ctx.fill();ctx.restore()}}
/* fx — a floating number/text over tile r,c (stacked when several land at once); also triggers the matching flash and sound. TWEAK: the 1500 ms (900 fast) duration. */
function fx(r,c,text,color='#fff',opt={}){
  if(/^−\d+( AP)?$/.test(String(text)))hitFlash(r,c,'hit');
  else if(/^\+\d+ (HP|AP)/.test(String(text)))hitFlash(r,c,'heal'); /* v0.47: green when health or armor is restored */
  if(!HEADLESS&&S&&!S.sim&&typeof sfx==='function'){const t=String(text);sfx(/ELIMINATED|RETIRED/.test(t)?'death':/^−\d+$/.test(t)?(+t.slice(1)>=4?'bighit':'hit'):/blocked|AP$/.test(t)?'block':/dodg|miss/i.test(t)?'whoosh':/coin/i.test(t)?'coin':/CF/.test(t)&&/^\+/.test(t)?'cf':'')}
  if(HEADLESS||!SETTINGS.fx||!S||r==null)return;
  const stack=FX.filter(f=>f.r===r&&f.c===c&&performance.now()-f.t0<400).length;
  FX.push({r,c,text,color,t0:performance.now()+stack*140,dur:opt.dur||(SPEED==='fast'?900:1500),big:!!opt.big,img:opt.img||null});
  if(!fxRAF)fxLoop();
}
/* fxLine — a short attack line flashed from one tile to another. */
function fxLine(from,to,color='#ff6a55'){if(HEADLESS||!SETTINGS.fx||!S||!from||!to)return;FXL.push({a:{r:from.r,c:from.c},b:{r:to.r,c:to.c},color,t0:performance.now(),dur:SPEED==='fast'?300:520});if(!fxRAF)fxLoop()}
/* fxLoop — animation loop that redraws while any effect is still playing. */
function fxLoop(){fxRAF=requestAnimationFrame(()=>{fxRAF=null;try{draw()}catch(e){}if(FX.length||FXL.length||HITFX.length||(S&&S.emotes&&S.emotes.length))fxLoop()})}
/* drawFX — draws the hit flashes, attack lines and floating numbers. */
function drawFX(){
  const now=performance.now();try{drawHitFX()}catch(e){}
  for(let i=FXL.length-1;i>=0;i--){const l=FXL[i];const k=(now-l.t0)/l.dur;if(k>=1){FXL.splice(i,1);continue}if(k<0)continue;
    const a=center(l.a.r,l.a.c),b=center(l.b.r,l.b.c);ctx.save();ctx.globalAlpha=1-k;ctx.strokeStyle=l.color;ctx.lineWidth=3;ctx.shadowColor=l.color;ctx.shadowBlur=8;
    ctx.beginPath();ctx.moveTo(a.x,a.y-TW*0.35);ctx.lineTo(a.x+(b.x-a.x)*Math.min(1,k*2.2),a.y-TW*0.35+(b.y-a.y)*Math.min(1,k*2.2));ctx.stroke();ctx.restore()}
  for(let i=FX.length-1;i>=0;i--){const f=FX[i];const k=(now-f.t0)/f.dur;if(k>=1){FX.splice(i,1);continue}if(k<0)continue;
    const m=center(f.r,f.c);const y=m.y-TW*(0.9+k*0.8);const sz=Math.round(TW*(f.big?0.42:0.3)*(k<0.15?0.6+k*2.7:1));
    if(f.img){const im=IMG[f.img];if(im&&im.complete&&im.naturalWidth){const s=TW*(0.55+Math.min(k,0.3)*1.2);ctx.save();ctx.globalAlpha=k>0.6?(1-k)/0.4:1;ctx.shadowColor='rgba(0,0,0,.6)';ctx.shadowBlur=8;ctx.drawImage(im,m.x-s/2,m.y-TW*(1.3+k*0.9)-s/2,s,s);ctx.restore()}continue}
    ctx.save();ctx.globalAlpha=k>0.7?(1-k)/0.3:1;ctx.font=`700 ${sz}px Marcellus SC, serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.lineWidth=Math.max(3,sz/5);ctx.strokeStyle='rgba(10,6,4,.9)';ctx.strokeText(f.text,m.x,y);ctx.fillStyle=f.color;ctx.fillText(f.text,m.x,y);ctx.restore()}
}
/* shake — shakes the arena (Settings → Screen shake, not with reduced motion). */
function shake(){if(HEADLESS||!SETTINGS.shake||reduceMotion())return;const w=cv.parentElement;w.classList.remove('shake');void w.offsetWidth;w.classList.add('shake')}
/* banner — the big announcement banner over the arena. */
function banner(text,sub=''){
  if(HEADLESS)return;
  const w=cv.parentElement;let b=$('#banner');if(!b){b=document.createElement('div');b.id='banner';b.className='banner';b.setAttribute('aria-live','polite');w.appendChild(b)}
  b.innerHTML=`<div>${text}</div>${sub?`<small>${sub}</small>`:''}`;b.classList.remove('on');void b.offsetWidth;b.classList.add('on');
}
