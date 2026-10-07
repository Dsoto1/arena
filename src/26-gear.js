/* =====================================================================
   26-GEAR · CUSTOM WEAPONS & ARMOR, AND THE DRAWN ARMOR SET (v0.31)
   =====================================================================
   • The WEAPON DESIGNER: shape a weapon (type, metals, haft, motif, accent shapes), give it stats
     assembled ONLY from behaviors and bounds that exist on printed cards, and it derives its market
     level honestly. Every creation gets a CARD — the same sideways poker-card format as the printed
     weapons — used everywhere a printed card would be. Nothing enters play unless "added to the rolls":
     the market deck at its level, and/or the character-creator loadout lists.
   • The ARMOR DESIGNER: the same, for armor — slot, point and AP within printed bounds.
   • THE DRAWN ARMOR SET: vector recreations of all 27 printed armor pieces (drawn from Virgilante's own
     scans). Settings → Visuals picks Drawn or the Original scans, exactly like Tokens.
   ===================================================================== */
/* MARKET_W0 — the printed weapon market decks as shipped (gearRebuild resets the live decks to these before adding custom weapons). */
const MARKET_W0={1:[...MARKET_W[1]],2:[...MARKET_W[2]],3:[...MARKET_W[3]]};
/* MARKET_A0 — the printed armor market decks as shipped (same reset role for armor). */
const MARKET_A0={1:[...MARKET_A[1]],2:[...MARKET_A[2]],3:[...MARKET_A[3]]};
/* ---------- stats: only printed bounds ---------- */
/* CW_BOUNDS — the [min,max] of every weapon stat a printed card ever shows; the designer never goes past them. */
const CW_BOUNDS={p:[1,4],r:[1,5],ammo:[0,6],thrN:[0,6],thrP:[0,4],thrR:[0,5],absorb:[0,2],uses:[0,12],cfw:[0,1],soul:[0,1],atkUses:[0,6]};
// calibrated so the printed cards land on their printed levels (hasta and knives stay level 1, the scutum 2, the arcuballista 3)
/* cwScore — a custom weapon's strength score from its stats, used to derive its market level. TWEAK: every weight (2.6 per power, 0.9 per range step, shield 2+2.2 per absorb…). */
function cwScore(stats){let s=stats.p*2.6+(stats.r-1)*0.9+(stats.ammo||0)*0.35+(stats.thrN||0)*0.35+(stats.thrP||0)*0.5;
  if(stats.shield)s=2+(stats.absorb||1)*2.2+(stats.uses||3)*0.35;if(stats.cfw)s+=1.6;if(stats.soul)s+=3;if(stats.both)s+=2.4;if(stats.atkUses)s-=0.8;if(stats.stones&&stats.ammo)s+=0.4;if(stats.flav)s+=1.4;return s} // v0.36: + stone-reload (the Sling) and Flavius item (the Gladius of Flavius)
/* cwLevel — a weapon's market level from its score. TWEAK: the cut-offs 5.8 (level 1) and 8 (level 2). */
function cwLevel(stats){const s=cwScore(stats);return s<=5.8?1:s<=8?2:3}
/* cwReg — registers a design in W as 'cw_<id>' and returns the weapon. */
function cwReg(design){const w=cwBuild(design);W['cw_'+design.id]=w;return w}
// v0.36: the weapon a design describes, computed fresh (the card preview never reads a stale registration)
/* cwBuild — the weapon (W entry shape) a design describes, built fresh from its stats. */
function cwBuild(design){const st=design.stats;const lv=cwLevel(st);
  const w={n:design.name,lv,p:st.shield?0:st.p,r:st.shield?0:st.r,img:-1,custom:1,cwId:design.id,art:design.art,cwLoadout:!!(design.rolls&&design.rolls.loadout),cwMarket:!!(design.rolls&&design.rolls.market)};
  if(st.ammo)w.ammo=st.ammo;if(st.thrN)w.throw={p:st.thrP||st.p,r:st.thrR||Math.min(5,st.r+2),n:st.thrN};
  if(st.shield){w.shield=1;w.absorb=st.absorb||1;w.uses=st.uses||3}
  if(st.cfw)w.cfw=1;if(st.soul)w.soul=1;if(st.both)w.both=1;if(st.atkUses)w.atkUses=st.atkUses;if(st.stones&&st.ammo)w.stones=1;if(st.flav)w.flav=1;
  return w}
/* caReg — registers a custom armor design in ARM as 'ca_<id>' (level 1–3, AP 2–7, bonus AP 1–4 clamped) and returns it. */
function caReg(design){const a={n:design.name,lv:clamp(+design.lv||1,1,3),slot:design.slot,pt:design.pt,ap:clamp(+design.ap||2,2,7),custom:1,caId:design.id,caMarket:!!(design.rolls&&design.rolls.market),caLoadout:!!(design.rolls&&design.rolls.loadout)};
  if(design.stack)a.stack=1;if(design.pair)a.pair=1;if(design.bonusLoc&&design.bonusAp)a.bonus={[design.bonusLoc]:clamp(+design.bonusAp,1,4)};
  ARM['ca_'+design.id]=a;return a}
/* gearRebuild — rebuilds the market decks: the printed pieces, then every custom weapon/armor on the rolls that the roster set allows; drops stale custom entries. */
function gearRebuild(){ // the rolls: pristine printed decks, plus whatever the user has enrolled
  for(const lv of [1,2,3]){MARKET_W[lv].length=0;MARKET_W[lv].push(...MARKET_W0[lv]);MARKET_A[lv].length=0;MARKET_A[lv].push(...MARKET_A0[lv])}
  for(const k of Object.keys(W))if(W[k].custom&&!(CUSTOM.weapons||[]).some(c=>'cw_'+c.id===k))delete W[k];
  for(const k of Object.keys(ARM))if(ARM[k].custom&&!(CUSTOM.armor||[]).some(c=>'ca_'+c.id===k))delete ARM[k];
  for(const cw of CUSTOM.weapons||[]){const w=cwReg(cw);if(w.cwMarket&&(typeof rosterGate!=='function'||rosterGate('weapons',cw,true)))MARKET_W[w.lv].push('cw_'+cw.id)}
  for(const ca of CUSTOM.armor||[]){const a=caReg(ca);if(a.caMarket&&(typeof rosterGate!=='function'||rosterGate('armor',ca,true)))MARKET_A[a.lv].push('ca_'+ca.id)}}
/* loadGear — loads the custom weapons and armor from the Store (sorted by name) and rebuilds the decks. */
async function loadGear(){try{CUSTOM.weapons=(await Store.list('customWeapons')).sort((a,b)=>String(a.name).localeCompare(b.name))}catch(e){CUSTOM.weapons=CUSTOM.weapons||[]}
  try{CUSTOM.armor=(await Store.list('customArmor')).sort((a,b)=>String(a.name).localeCompare(b.name))}catch(e){CUSTOM.armor=CUSTOM.armor||[]}gearRebuild()}
setTimeout(()=>{if(typeof CUSTOM!=='undefined')loadGear()},900);

/* ---------- the weapon art: parametric, in a 100×100 box ---------- */
const CW_TYPES=[['none',_T('— Blank canvas —')],['sword',_T('Sword')],['dagger',_T('Dagger')],['axe',_T('Axe')],['spear',_T('Spear')],['trident',_T('Trident')],['hammer',_T('Hammer')],['club',_T('Club')],['flail',_T('Flail')],['bow',_T('Bow')],['sling',_T('Sling')],['scythe',_T('Scythe')],['shield',_T('Shield')]];
const CW_MOTIFS=[['',_T('None')],['laurel',_T('Laurel')],['serpent',_T('Serpent')],['skull',_T('Memento mori')],['bolt',_T('Lightning')],['eye',_T('Watching eye')]];
/* wpnArt — the weapon art as SVG markup in a 100×100 box: the base type, the motif, then the sculpted layers. */
function wpnArt(art){const M=art.metal||'#c9d0d6',E=(typeof tkDark==='function'?tkDark(M,-0.35):'#6d757d'),Hf=art.haft||'#7a5a2a',Wr=art.wrap||'#8a2a2a',G=art.gem||'#c0433a';const t=art.type||'sword';let g='';
  /* haft — a straight haft line from x1,y1 to x2,y2. */
  const haft=(x1,y1,x2,y2,width=4)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${Hf}" stroke-width="${width}" stroke-linecap="round"/>`;
  /* grip — a wrapped grip at x,y. */
  const grip=(x,y)=>`<rect x="${x-3.4}" y="${y}" width="6.8" height="14" rx="2" fill="${Wr}" stroke="${tkDark(Wr)}"/><path d="M${x-3.4} ${y+3}h6.8M${x-3.4} ${y+7}h6.8M${x-3.4} ${y+11}h6.8" stroke="${tkDark(Wr)}" stroke-width="1"/>`;
  if(t==='sword')g=`${grip(50,78)}<circle cx="50" cy="94" r="3.4" fill="${G}" stroke="#6a4414"/><rect x="41" y="72" width="18" height="5" rx="2" fill="#a8894a" stroke="#6a5424"/><path d="M50 8L56 20L54 72L46 72L44 20Z" fill="${M}" stroke="${E}"/><path d="M50 14L50 70" stroke="${E}" stroke-width="1.4"/>`;
  if(t==='dagger')g=`${grip(50,62)}<rect x="43" y="57" width="14" height="4.4" rx="2" fill="#a8894a"/><path d="M50 24L55 34L53 57L47 57L45 34Z" fill="${M}" stroke="${E}"/>`;
  if(t==='axe')g=`${haft(56,90,44,16,5)}<path d="M44 18Q18 22 20 44Q32 40 46 42Z" fill="${M}" stroke="${E}"/><path d="M46 20Q60 14 66 24Q58 26 48 30Z" fill="${M}" stroke="${E}" opacity=".9"/><circle cx="46" cy="30" r="2.6" fill="${G}"/>`;
  if(t==='spear')g=`${haft(50,94,50,20,4)}<path d="M50 4L58 22L50 30L42 22Z" fill="${M}" stroke="${E}"/><rect x="47" y="30" width="6" height="5" fill="${Wr}"/>`;
  if(t==='trident')g=`${haft(50,94,50,26,4)}<path d="M36 8L36 26M50 4L50 26M64 8L64 26" stroke="${M}" stroke-width="5" stroke-linecap="round"/><path d="M34 26Q50 34 66 26L66 30Q50 38 34 30Z" fill="${M}" stroke="${E}"/><path d="M36 8L34 14M50 4L48 10M64 8L62 14" stroke="${E}" stroke-width="2"/>`;
  if(t==='hammer')g=`${haft(52,92,48,26,5)}<rect x="30" y="14" width="40" height="20" rx="4" fill="${M}" stroke="${E}"/><rect x="30" y="14" width="12" height="20" rx="4" fill="${E}"/><circle cx="56" cy="24" r="2.6" fill="${G}"/>`;
  if(t==='club')g=`${haft(54,92,48,40,6)}<path d="M48 42Q30 20 44 10Q58 4 62 20Q66 34 52 44Z" fill="${Hf}" stroke="${tkDark(Hf)}"/><circle cx="46" cy="18" r="2" fill="${M}"/><circle cx="56" cy="26" r="2" fill="${M}"/><circle cx="50" cy="32" r="2" fill="${M}"/>`;
  if(t==='flail')g=`${haft(60,90,54,52,5)}<path d="M54 52Q44 40 38 30" stroke="#6d757d" stroke-width="2.4" fill="none" stroke-dasharray="3 2.4"/><circle cx="34" cy="24" r="11" fill="${M}" stroke="${E}"/><path d="M27 15l-4 -5M34 12l0 -6M41 15l4 -5M24 24l-6 0M44 24l6 0" stroke="${E}" stroke-width="2.6"/>`;
  if(t==='bow')g=`<path d="M36 8Q70 50 36 92" stroke="${Hf}" stroke-width="4.4" fill="none"/><path d="M36 8L36 92" stroke="#d8cca0" stroke-width="1.4"/>${grip(37,44)}<path d="M36 50L70 50" stroke="${E}" stroke-width="2"/><path d="M70 50l-8 -4l0 8Z" fill="${M}"/>`;
  if(t==='sling')g=`<path d="M42 90Q34 60 48 34" stroke="${Wr}" stroke-width="2.6" fill="none"/><path d="M58 90Q66 60 56 34" stroke="${Wr}" stroke-width="2.6" fill="none"/><path d="M44 32Q52 24 60 32Q52 42 44 32Z" fill="${Hf}" stroke="${tkDark(Hf)}"/><circle cx="52" cy="32" r="4.4" fill="${M}" stroke="${E}"/>`;
  if(t==='scythe')g=`${haft(58,92,50,22,5)}<path d="M50 22Q20 18 12 40Q30 34 50 32Z" fill="${M}" stroke="${E}"/>`;
  if(t==='shield')g=`<ellipse cx="50" cy="50" rx="30" ry="38" fill="${Wr}" stroke="${tkDark(Wr)}" stroke-width="2.4"/><ellipse cx="50" cy="50" rx="22" ry="29" fill="none" stroke="${M}" stroke-width="2.4"/><circle cx="50" cy="50" r="7" fill="${M}" stroke="${E}"/>`;
  const motif={laurel:`<path d="M30 84Q50 74 70 84" stroke="#5f8a3a" stroke-width="2.4" fill="none" stroke-dasharray="3 2"/>`,
    serpent:`<path d="M28 88Q36 80 44 88Q52 96 60 88Q68 80 74 86" stroke="#5f8a3a" stroke-width="2.6" fill="none"/><circle cx="74" cy="86" r="2" fill="#9bd070"/>`,
    skull:`<circle cx="76" cy="80" r="6.4" fill="#e8dcc0" stroke="#8a7a5a"/><circle cx="74" cy="79" r="1.4" fill="#241910"/><circle cx="78.5" cy="79" r="1.4" fill="#241910"/><path d="M74 84h5" stroke="#8a7a5a"/>`,
    bolt:`<path d="M74 70L68 80L73 80L67 92" stroke="#e6b93a" stroke-width="2.6" fill="none"/>`,
    eye:`<ellipse cx="76" cy="80" rx="7" ry="4.4" fill="#e8dcc0" stroke="#241910"/><circle cx="76" cy="80" r="2.2" fill="${G}"/>`}[art.motif||''];
  if(motif)g+=motif;
  g=typeof scbLayersSVG==='function'?scbLayersSVG(art,g):g+(art.layers||[]).map(L=>shapeSVG(L)).join('');
  return g}
/* CW_LV_BORDER — border colour per weapon level. */
const CW_LV_BORDER={1:'#8a6a3a',2:'#a9aeb5',3:'#7a2230',4:'#e6b93a'};
/* v0.36 THE PRINTED LOOK: a custom card is laid out like the rulebook's weapon cards — a stone-block wall inside a
   frame colored by level (I gray · II green · III purple · IV gold, the chest's own), lattice corners, the name on a
   cream plaque, "LEVEL n" down the left pillar, the stats down the right pillar as the rulebook's icon tiles, the
   weapon tilted like its printed cousins, and any fine print small and centered underneath. */
/* CW_LV_FRAME — [frame, dark trim] colours of a custom weapon card per level (I gray · II green · III purple · IV gold). */
const CW_LV_FRAME={1:['#8f959c','#4c5157'],2:['#4f8a4a','#244a22'],3:['#7a4a9a','#3a1e52'],4:['#c9a24a','#6a4e14']};
/* v0.42 THE RULEBOOK'S ICONS: the nine weapon-card icons exactly as the rulebook names them (p.10), each on its
   black diamond — attack power, range, shield absorb, ammo, soul steal, crowd favor, use, throw, both attacks. */
/* CW_ICO — the rulebook's nine weapon-card icons as SVG paths (drawn on a black diamond by cwIcoSVG). */
const CW_ICO={
  dmg:c=>`<path d="M0 -6.4L1.6 -2.4L5.8 -3.6L3.2 0L6 3L1.8 2.4L0.6 6.2L-1 2.4L-5.4 4.4L-3 0.4L-6 -2.6L-1.8 -2.2Z" fill="#e8552a"/><path d="M0 -3.4L0.9 -1.2L3 -1.6L1.6 0.3L2.8 2.2L0.6 1.4L0 3.4L-0.8 1.4L-2.8 2.2L-1.6 0.2L-3 -1.4L-0.9 -1.2Z" fill="#ffc24a"/>`,
  rng:c=>`<path d="M-5 3.6A6.2 6.2 0 0 1 3.6 -4.6" fill="none" stroke="#6fd8e0" stroke-width="2" stroke-linecap="round"/><path d="M5.6 -5.6L1.2 -5.2L4.8 -1.6Z" fill="#e8f6f8"/>`,
  abs:c=>`<path d="M0 -6L5 -3.6V0.6C5 3.6 2.6 5.4 0 6.4C-2.6 5.4 -5 3.6 -5 0.6V-3.6Z" fill="none" stroke="#9ed0f0" stroke-width="1.6"/><path d="M0 -3.4L2.8 -2V0.6C2.8 2.4 1.4 3.4 0 4C-1.4 3.4 -2.8 2.4 -2.8 0.6V-2Z" fill="#e8f4fb"/>`,
  ammo:c=>`<path d="M-5 -4.6L1.4 1.8M5 -4.6L-1.4 1.8" stroke="#b08a52" stroke-width="1.8" stroke-linecap="round"/><circle cx="-5" cy="-4.6" r="1.6" fill="none" stroke="#d8b070" stroke-width="1"/><circle cx="5" cy="-4.6" r="1.6" fill="none" stroke="#d8b070" stroke-width="1"/><path d="M-2.6 1.4L0 5.4L2.6 1.4Z" fill="#8a6434" stroke="#d8b070" stroke-width=".6"/>`,
  soul:c=>`<circle cx="-2.4" cy="-3.6" r="1.8" fill="#e0452e"/><path d="M-4.6 5.6V0.2Q-2.4 -2 -0.2 0.2V5.6Z" fill="#e0452e"/><circle cx="2.6" cy="-3.6" r="1.8" fill="#8fd04a"/><path d="M0.4 5.6V0.2Q2.6 -2 4.8 0.2V5.6Z" fill="#8fd04a"/>`,
  cf:c=>`<path d="M-4.8 5.2Q0 0.6 4.2 -5.6" fill="none" stroke="#c9b24a" stroke-width="1.1"/>${[[-3.2,3.2,-40],[-1.4,1,-40],[0.4,-1.2,-40],[2.2,-3.4,-40],[-1.4,4.4,50],[0.6,2.2,50],[2.4,0,50],[4,-2.2,50]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="2" ry=".9" transform="rotate(${r} ${x} ${y})" fill="#e6c040"/>`).join('')}`,
  use:c=>`<path d="M-3.6 -5.6H3.6M-3.6 5.6H3.6" stroke="#b08ae8" stroke-width="1.4"/><path d="M-3 -5.2Q-3 -1 0 0Q-3 1 -3 5.2H3Q3 1 0 0Q3 -1 3 -5.2Z" fill="none" stroke="#c9a8f0" stroke-width="1.1"/><path d="M-1.8 4.4Q0 2 1.8 4.4Z" fill="#e87ad8"/>`,
  thr:c=>`<circle cx="1.8" cy="-4.4" r="1.5" fill="#e87ad8"/><path d="M1.2 -2.4L-0.6 1.2L2.4 3L1 6M-0.6 1.2L-3.6 2.8M0.6 -1.6L4.4 -3.2M0.8 -1.8L-3.4 -1.4" stroke="#e87ad8" stroke-width="1.5" stroke-linecap="round" fill="none"/>`,
  both:c=>`<path d="M-5.2 5.2L4.4 -4.4M-3 5.2L5.2 -3M5.2 5.2L-4.4 -4.4" stroke="#9ab8d8" stroke-width="1.4" stroke-linecap="round"/><path d="M4.4 -4.4l1.4 -1.4M5.2 -3l1.2 -1.2M-4.4 -4.4l-1.4 -1.4" stroke="#e8f0f8" stroke-width="1.6" stroke-linecap="round"/>`};
CW_ICO.brk=CW_ICO.use; // older cards: "breaks after" is the rulebook's USE
/* CW_ICO_NAME — the icons' names, as the rulebook prints them. */
const CW_ICO_NAME={dmg:_T('Attack power'),rng:_T('Range'),abs:_T('Shield absorb'),ammo:_T('Ammo'),soul:_T('Soul steal'),cf:_T('Crowd favor'),use:_T('Use'),thr:_T('Throw'),both:_T('Both attacks')};
/* CW_ICO_DESC — the icons' one-line rules, as the rulebook prints them. */
const CW_ICO_DESC={dmg:_T('Damage dealt for each hit rolled in an attack.'),rng:_T('How far a player (or NPC) can be from a target to make an attack.'),abs:_T('Damage absorbed by the shield before it hits a player.'),ammo:_T('Initial ammo value of a weapon, managed via ammo dice and replenished via arena cards.'),soul:_T('For each hit rolled with this weapon, 1 HP to the player holding it — distributed to any body location.'),cf:_T('For every hit rolled with this weapon, 1 CF to the player holding it.'),use:_T('The number of times a weapon can be used for attacks. Discard the card at 0 uses.'),thr:_T('The number of times a weapon can be thrown, using a second set of weapon values. Discard the card at 0 throws.'),both:_T('The weapon may be used for both of a player\u2019s attacks on a turn — still two unique targets.')};
/* cwIcoSVG — one weapon-card icon on its black diamond, px pixels square. */
function cwIcoSVG(icon,px=26){return `<svg viewBox="-9 -9 18 18" width="${px}" height="${px}" aria-hidden="true"><rect x="-6.3" y="-6.3" width="12.6" height="12.6" transform="rotate(45)" fill="#15110d" stroke="#6a5a44" stroke-width=".5"/>${CW_ICO[icon]()}</svg>`}
/* cwCardSVG — a custom weapon's full card (300×208 SVG) in the printed layout: frame by level, name plaque, LEVEL pillar, stat tiles, fine print. */
function cwCardSVG(design){const w=cwBuild(design);const lv=clamp(w.lv||1,1,4);const [F,Fd]=CW_LV_FRAME[lv];
  // the stat tiles, in the rulebook's order
  const tiles=[];
  // v0.37: as printed — 'a|b' reads normal | thrown (the Hasta is 1|2 damage, 2|4 range)
  if(!w.shield||w.p){tiles.push(['dmg',w.throw?`${w.p}|${w.throw.p}`:w.p,w.throw?_T('Attack power: normal | thrown'):_T('Attack power')]);tiles.push(['rng',w.throw?`${w.r}|${w.throw.r}`:w.r,w.throw?_T('Range: normal | thrown'):_T('Range')])}
  if(w.shield){tiles.push(['abs',w.absorb,_T('Shield absorb')]);tiles.push(['use',w.uses,_T('Use')])}
  if(w.throw)tiles.push(['thr',w.throw.n,_T`Throw: ${w.throw.n}`]);
  if(w.ammo)tiles.push(['ammo',w.ammo,_T('Ammo')]);
  if(w.cfw)tiles.push(['cf','+1',_T('Crowd favor: +1 CF per hit')]);if(w.soul)tiles.push(['soul','1',_T('Soul steal: 1 HP per hit')]);if(w.atkUses)tiles.push(['use',w.atkUses,_T('Use')]);if(w.both)tiles.push(['both','↔',_T('Both attacks')]);
  const n=tiles.length,slot=Math.min(44,164/Math.max(1,n));
  const tileSVG=tiles.map(([k,v,t],i)=>{const cy=24+slot*i+slot*0.36;const fs=String(v).length>3?9:11;
    return `<g><title>${esc(t)}</title><g transform="translate(276 ${cy})"><rect x="-8.5" y="-8.5" width="17" height="17" transform="rotate(45)" fill="#15110d" stroke="${Fd}" stroke-width=".8"/>${CW_ICO[k]()}</g><text x="276" y="${cy+21}" font-size="${fs}" font-weight="700" text-anchor="middle" fill="#2a1d12" font-family="Georgia,serif">${esc(String(v))}</text>${i<n-1?`<line x1="264" x2="288" y1="${24+slot*(i+1)-1}" y2="${24+slot*(i+1)-1}" stroke="${Fd}" stroke-width=".8" opacity=".6"/>`:''}</g>`}).join('');
  // the name, fitted to its plaque
  const nm=String(design.name||_T('Unnamed')).toUpperCase();const plW=Math.max(130,Math.min(214,70+nm.length*7.2)),fsN=Math.min(14,Math.max(7.5,(plW-16)/(nm.length*0.66)));
  // the fine print: small, centered, under the weapon
  const notes=[];if(w.both)notes.push(_T('may be used for both attacks'));if(w.atkUses)notes.push(_T`breaks after ${w.atkUses} attacks`);if(w.cfw)notes.push(_T('+1 Crowd Favor per hit'));if(w.soul)notes.push(_T('drains 1 HP per hit'));if(w.flav)notes.push(_T('a Flavius item: +2 CF to a winner holding it'));if(w.stones)notes.push(_T('reloads from Stones'));
  const note=notes.join(' · ');
  // stone blocks
  const bricks=Array.from({length:9},(_,r)=>{const y=14+r*21;return `<line x1="40" x2="262" y1="${y}" y2="${y}" stroke="#b89e74" stroke-width=".9" opacity=".55"/>`+Array.from({length:6},(_,c)=>{const x=40+c*42+(r%2?21:0);return x<262?`<line x1="${x}" x2="${x}" y1="${y}" y2="${y+21}" stroke="#b89e74" stroke-width=".9" opacity=".45"/>`:''}).join('')}).join('');
  /* corner — a lattice corner of the card frame (sx/sy mirror it). */
  const corner=(x,y,sx,sy)=>`<g transform="translate(${x} ${y}) scale(${sx} ${sy})"><path d="M0 0H16V4H4V16H0Z" fill="${Fd}"/><path d="M6 6H12V8H8V12H6Z" fill="${F}"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 208">
   <rect x="0" y="0" width="300" height="208" rx="8" fill="${Fd}"/><rect x="4" y="4" width="292" height="200" rx="6" fill="${F}"/>
   <rect x="10" y="10" width="280" height="188" rx="3" fill="#e8d6b2"/>${bricks}
   <rect x="10" y="10" width="280" height="188" rx="3" fill="none" stroke="${Fd}" stroke-width="1.4"/>
   ${corner(10,10,1,1)}${corner(290,10,-1,1)}${corner(10,198,1,-1)}${corner(290,198,-1,-1)}
   <rect x="14" y="16" width="22" height="176" fill="#d9c49c" stroke="${Fd}" stroke-width="1"/><line x1="17" x2="17" y1="18" y2="190" stroke="${Fd}" opacity=".5"/><line x1="33" x2="33" y1="18" y2="190" stroke="${Fd}" opacity=".5"/>
   <text transform="translate(29 104) rotate(-90)" font-size="11" letter-spacing="4" text-anchor="middle" fill="${Fd}" font-family="Georgia,serif" font-weight="700">${_T`LEVEL ${lv}`}</text>
   <rect x="264" y="16" width="24" height="176" fill="#d9c49c" stroke="${Fd}" stroke-width="1"/>
   <g transform="translate(150 104) rotate(45) scale(1.62) translate(-50 -52)">${wpnArt(design.art||{})}</g>
   <rect x="${150-plW/2}" y="5" width="${plW}" height="22" rx="2" fill="#f4ead2" stroke="${Fd}" stroke-width="1.2"/>
   <text x="150" y="20.5" font-size="${fsN.toFixed(1)}" font-weight="700" letter-spacing=".6" text-anchor="middle" fill="#241910" font-family="Georgia,serif">${esc(nm)}</text>
   ${tileSVG}
   ${note?`<text x="150" y="191" font-size="${note.length>58?7:8.2}" font-style="italic" text-anchor="middle" fill="#4a3824" font-family="Georgia,serif">${esc(note)}</text>`:''}</svg>`}
/* CW_URLS — cache of card data URIs, keyed by weapon key + design version. */
const CW_URLS={};
/* cwCardURL — the card of a custom weapon key as a cached data URI ('' when the design is gone). */
function cwCardURL(key){const cw=(CUSTOM.weapons||[]).find(c=>'cw_'+c.id===key);if(!cw)return '';const k2=key+':'+(cw.v||0);
  return CW_URLS[k2]||(CW_URLS[k2]='data:image/svg+xml,'+encodeURIComponent(cwCardSVG(cw)))}

/* ---------- the drawn armor set: vector recreations of the 27 scanned pieces ---------- */
/* ARM_METAL — the drawn set's metal colour per printed armor piece. */
const ARM_METAL={galea:'#b8925a',cassis:'#a9aeb5',crista:'#c9a458',murmillo:'#c9a458',helm5:'#7f96a8',flavhelm:'#e6b93a',balteus:'#7a4a24',pectorale:'#b8925a',lorica:'#c9a458',musculata:'#c9a458',amazon:'#a9aeb5',flavchest:'#e6b93a',thorax:'#9aa4ae',wraps:'#c9b8a0',manica:'#a9aeb5',provmanica:'#a9aeb5',spaulder:'#8a9098',cestus:'#7a5a3a',galerus:'#b8925a',bracers:'#e6b93a',legwrapsU:'#c9b8a0',legwraps:'#c9b8a0',femoralia:'#8a6a4a',ocrea:'#b8925a',greaves:'#e6b93a',thighplate:'#a9aeb5',cnemis:'#c9a458'};
/* ARM_SHAPE — the drawn set's shape per printed armor piece. */
const ARM_SHAPE={galea:'helmR',cassis:'helmR2',crista:'helmCrest',murmillo:'helmGrill',helm5:'helmSec',flavhelm:'helmCrest',balteus:'belt',pectorale:'plate',lorica:'scale',musculata:'muscle',amazon:'muscle',flavchest:'muscle',thorax:'thorax',wraps:'bands',manica:'segArm',provmanica:'segArm',spaulder:'shoulder',cestus:'fist',galerus:'galerus',bracers:'bracerPair',legwrapsU:'bands',legwraps:'bands',femoralia:'skirt',ocrea:'greave',greaves:'greavePair',thighplate:'plateLeg',cnemis:'greaveTall'};
/* armSVG — a piece of armor drawn as SVG: its shape (printed piece or custom design) in its metal, plus any sculpted layers. */
function armSVG(key,custom){const A=ARM[key]||{};const cu=custom||(A.caId?(CUSTOM.armor||[]).find(c=>c.id===A.caId):null);
  const M=(cu&&cu.metal)||ARM_METAL[key]||'#a9aeb5';
  const D=tkDark(M,-0.4),L2=shade(M,0.25),G=(cu&&cu.gem)||'#7a2230';let g='';
  const shape=cu?cu.shape:ARM_SHAPE[key]||'plate';
  const cheek=`<path d="M30 58Q28 74 36 78L42 62Z" fill="${M}" stroke="${D}"/><path d="M70 58Q72 74 64 78L58 62Z" fill="${M}" stroke="${D}"/>`;
  switch(shape){
    case 'helmR':g=`<path d="M26 58Q26 24 50 24Q74 24 74 58L26 58Z" fill="${M}" stroke="${D}"/>${cheek}<path d="M26 56Q50 48 74 56" stroke="${D}" fill="none"/><path d="M32 34Q50 26 68 34" stroke="${L2}" stroke-width="2.4" fill="none"/>`;break;
    case 'helmR2':g=`<path d="M26 56Q26 22 50 22Q74 22 74 56L26 56Z" fill="${M}" stroke="${D}"/>${cheek}<path d="M22 58Q50 66 78 58L76 52Q50 58 24 52Z" fill="${M}" stroke="${D}"/><circle cx="50" cy="34" r="3" fill="${G}"/>`;break;
    case 'helmCrest':g=`<path d="M28 58Q28 26 50 26Q72 26 72 58Z" fill="${M}" stroke="${D}"/>${cheek}<path d="M34 26Q50 2 66 26L60 30Q50 12 40 30Z" fill="${G}" stroke="${tkDark(G)}"/><path d="M40 28q10 -16 20 0" stroke="${tkDark(G)}" stroke-width="1.2" fill="none"/><path d="M30 52Q50 44 70 52" stroke="${L2}" stroke-width="2" fill="none"/>`;break;
    case 'helmGrill':g=`<path d="M24 60Q24 20 50 20Q76 20 76 60Q64 68 50 68Q36 68 24 60Z" fill="${M}" stroke="${D}"/><path d="M34 40Q50 34 66 40L66 60Q50 66 34 60Z" fill="${L2}" stroke="${D}"/>${[0,1,2,3].map(i=>`<circle cx="${40+i*7}" cy="48" r="2.2" fill="${D}"/><circle cx="${40+i*7}" cy="56" r="2.2" fill="${D}"/>`).join('')}<path d="M20 40Q50 30 80 40" stroke="${D}" stroke-width="3" fill="none"/><path d="M40 20Q50 6 60 20" fill="${G}" stroke="${tkDark(G)}"/>`;break;
    case 'helmSec':g=`<path d="M28 62Q26 20 50 18Q72 20 72 62Q60 70 50 70Q40 70 28 62Z" fill="${M}" stroke="${D}"/><circle cx="42" cy="44" r="4.4" fill="#241910"/><circle cx="58" cy="44" r="4.4" fill="#241910"/><path d="M48 18Q50 8 56 12Q60 16 54 22" fill="${M}" stroke="${D}"/><path d="M30 58Q50 64 70 58" stroke="${D}" fill="none"/>`;break;
    case 'belt':g=`<path d="M22 42Q50 34 78 42L78 62Q50 70 22 62Z" fill="${M}" stroke="${D}"/><path d="M26 46Q50 39 74 46M26 58Q50 65 74 58" stroke="${D}" stroke-width="1.4" fill="none"/><circle cx="50" cy="52" r="5" fill="${G}" stroke="${tkDark(G)}"/><circle cx="34" cy="51" r="2.4" fill="${L2}"/><circle cx="66" cy="51" r="2.4" fill="${L2}"/>`;break;
    case 'plate':g=`<rect x="30" y="26" width="40" height="46" rx="7" fill="${M}" stroke="${D}"/><path d="M30 34L22 26M70 34L78 26M30 64L22 72M70 64L78 72" stroke="#5a4632" stroke-width="2.6"/><circle cx="50" cy="48" r="9" fill="none" stroke="${L2}" stroke-width="2.4"/><circle cx="50" cy="48" r="3" fill="${G}"/>`;break;
    case 'scale':g=`<path d="M28 24Q50 18 72 24L70 74Q50 80 30 74Z" fill="${M}" stroke="${D}"/>${[0,1,2,3,4].map(r=>[0,1,2,3].map(c=>`<path d="M${34+c*9+(r%2)*4} ${28+r*10}q4.5 6 9 0" stroke="${D}" stroke-width="1.2" fill="none"/>`).join('')).join('')}`;break;
    case 'muscle':g=`<path d="M30 22Q50 16 70 22L72 52Q70 74 50 78Q30 74 28 52Z" fill="${M}" stroke="${D}"/><path d="M38 34Q50 40 62 34M40 48q10 6 20 0M50 26L50 60" stroke="${D}" stroke-width="1.6" fill="none"/><path d="M36 64q14 8 28 0" stroke="${D}" stroke-width="1.4" fill="none"/><circle cx="50" cy="30" r="2.6" fill="${G}"/>`;break;
    case 'thorax':g=`<path d="M20 30Q30 18 40 26L36 40Q26 38 20 30Z" fill="${L2}" stroke="${D}"/><path d="M80 30Q70 18 60 26L64 40Q74 38 80 30Z" fill="${L2}" stroke="${D}"/><path d="M32 26Q50 18 68 26L70 60Q50 82 30 60Z" fill="${M}" stroke="${D}"/><path d="M36 36h28M36 46h28M38 56h24" stroke="${D}" stroke-width="1.6"/><circle cx="50" cy="66" r="3" fill="${G}"/>`;break;
    case 'bands':g=`<path d="M40 16Q56 16 58 24L60 78Q58 86 44 86Q36 84 36 76L38 24Q38 18 40 16Z" fill="${M}" stroke="${tkDark(M,-0.3)}"/>${[0,1,2,3,4,5].map(i=>`<path d="M37 ${24+i*11}Q48 ${29+i*11} 59 ${24+i*11}" stroke="${tkDark(M,-0.3)}" stroke-width="2" fill="none"/>`).join('')}`;break;
    case 'segArm':g=`<path d="M36 14Q58 14 60 26L58 84Q54 90 44 88L38 82Z" fill="${M}" stroke="${D}"/>${[0,1,2,3,4,5,6].map(i=>`<path d="M37 ${22+i*10}Q48 ${27+i*10} 59 ${22+i*10}" stroke="${D}" stroke-width="1.8" fill="none"/>`).join('')}<circle cx="48" cy="18" r="2.6" fill="${G}"/>`;break;
    case 'shoulder':g=`<path d="M24 46Q26 22 50 20Q74 22 76 46Q64 40 50 40Q36 40 24 46Z" fill="${M}" stroke="${D}"/><path d="M28 54Q50 46 72 54L70 62Q50 55 30 62Z" fill="${L2}" stroke="${D}"/><path d="M32 68Q50 62 68 68L66 74Q50 69 34 74Z" fill="${M}" stroke="${D}"/>`;break;
    case 'fist':g=`<path d="M34 40Q34 26 48 26Q64 26 64 42L64 62Q64 74 50 74Q36 74 34 60Z" fill="${M}" stroke="${tkDark(M,-0.3)}"/>${[0,1,2,3].map(i=>`<circle cx="${40+i*7}" cy="34" r="3" fill="#c9d0d6" stroke="#5d656d"/>`).join('')}<path d="M36 48h26M36 58h26" stroke="${tkDark(M,-0.3)}" stroke-width="2"/>`;break;
    case 'galerus':g=`<path d="M28 26L72 22L74 56Q56 66 30 60Z" fill="${M}" stroke="${D}"/><path d="M34 30Q52 26 68 28" stroke="${L2}" stroke-width="2.2" fill="none"/><circle cx="62" cy="42" r="4.4" fill="${G}" stroke="${tkDark(G)}"/><path d="M28 26Q22 40 30 60" stroke="${D}" fill="none"/>`;break;
    case 'bracerPair':g=`<path d="M22 30Q36 26 40 34L38 70Q32 76 24 72Z" fill="${M}" stroke="${D}"/><path d="M60 30Q74 26 78 34L76 70Q70 76 62 72Z" fill="${M}" stroke="${D}"/><path d="M24 42h14M24 54h13M62 42h14M62 54h13" stroke="${D}" stroke-width="1.6"/>`;break;
    case 'skirt':g=`<path d="M28 26Q50 20 72 26L76 66Q50 76 24 66Z" fill="${M}" stroke="${D}"/>${[0,1,2,3,4].map(i=>`<path d="M${30+i*10} 28L${28+i*11} 68" stroke="${D}" stroke-width="1.6"/>`).join('')}<path d="M26 32Q50 26 74 32" stroke="${G}" stroke-width="3" fill="none"/>`;break;
    case 'greave':g=`<path d="M40 14Q62 14 60 30L56 78Q52 90 44 88Q36 84 38 72L36 28Q36 16 40 14Z" fill="${M}" stroke="${D}"/><path d="M42 22Q50 18 56 24" stroke="${L2}" stroke-width="2.2" fill="none"/><circle cx="48" cy="40" r="3" fill="${G}"/>`;break;
    case 'greavePair':g=`<path d="M26 16Q40 14 40 28L38 76Q34 86 28 84Q22 80 24 68Z" fill="${M}" stroke="${D}"/><path d="M60 16Q74 14 74 28L72 76Q68 86 62 84Q56 80 58 68Z" fill="${M}" stroke="${D}"/><path d="M28 34q5 -3 9 0M62 34q5 -3 9 0" stroke="${D}" stroke-width="1.4" fill="none"/>`;break;
    case 'plateLeg':g=`<path d="M34 18L66 18Q70 44 62 82L38 82Q30 44 34 18Z" fill="${M}" stroke="${D}"/><path d="M36 32h28M36 48h28M38 64h24" stroke="${D}" stroke-width="1.8"/><circle cx="50" cy="24" r="2.6" fill="${G}"/>`;break;
    case 'greaveTall':g=`<path d="M38 8Q64 8 62 26L58 84Q52 94 44 92Q34 88 36 74L34 22Q34 10 38 8Z" fill="${M}" stroke="${D}"/><path d="M40 20Q48 14 58 20M40 34Q48 28 58 34" stroke="${tkDark(M,-0.3)}" stroke-width="1.6" fill="none"/><path d="M44 46Q50 40 54 46L54 66Q50 72 44 66Z" fill="${L2}" stroke="${D}"/><circle cx="49" cy="54" r="2.6" fill="${G}"/>`;break;
  }
  if(cu)g=typeof scbLayersSVG==='function'?scbLayersSVG(cu,g):g+(cu.layers||[]).map(L=>shapeSVG(L)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${g}</svg>`}
/* ARM_URLS — cache of armor art data URIs, keyed by armor key + design version. */
const ARM_URLS={};
/* armArtURL — the drawn art of an armor key as a cached data URI. */
function armArtURL(key){const A=ARM[key]||{};const cu=A.caId?(CUSTOM.armor||[]).find(c=>c.id===A.caId):null;const k2=key+':'+(cu?cu.v||0:0);
  return ARM_URLS[k2]||(ARM_URLS[k2]='data:image/svg+xml,'+encodeURIComponent(armSVG(key)))}
/* armorStyle — the armor art setting ('drawn' when there are no settings). */
const armorStyle=()=>typeof SETTINGS==='undefined'?'drawn':(SETTINGS.armorStyle||'drawn');

/* ---------- the sculpting bench: the token designer's freeform shapes, for gear ----------
   Both benches (weapon art and armor) share it: add shapes, click to select, DRAG on the preview to
   place them, tune size/rotation/color, delete. Layers live in a plain array of shapeSVG specs. */
/* SC_SHAPES — the shapes the sculpting bench can add. */
const SC_SHAPES=['circle','ellipse','rect','tri','diamond','star','crescent','line','spike','ring'];
/* sculptHTML — the sculpting bench controls for one preview (add shape, select layer, size/rotate/colour, delete). */
function sculptHTML(kind,layers){const sel=ST.scSel!=null&&layers[ST.scSel]?ST.scSel:null;const L=sel!=null?layers[sel]:null;
  return `<div style="grid-column:1/-1" class="sect">${_T`Sculpt`} <span class="rc-sub">${_T`add a shape, then <b>drag it on the preview</b> — exactly like the token designer`}</span></div>
   <div class="acts" style="grid-column:1/-1">${SC_SHAPES.map(t=>`<button class="btn tksm" type="button" data-sc="add" data-k="${kind}" data-t="${t}">+ ${t}</button>`).join('')}</div>
   ${layers.length?`<div class="acts" style="grid-column:1/-1">${layers.map((l2,i)=>`<button class="btn tksm ${sel===i?'primary':''}" type="button" data-sc="sel" data-k="${kind}" data-i="${i}">${l2.t} ${i+1}</button>`).join('')}${sel!=null?`<button class="btn tksm" type="button" data-sc="del" data-k="${kind}">🗑 remove</button>`:''}</div>`:''}
   ${L?`<label>${_T`Width`}<input type="range" min="2" max="80" value="${L.w||12}" data-sc="f" data-k="${kind}" data-f="w"></label><label>${_T`Height`}<input type="range" min="2" max="80" value="${L.h||12}" data-sc="f" data-k="${kind}" data-f="h"></label>
    <label>${_T`Rotate`}<input type="range" min="-180" max="180" value="${L.r||0}" data-sc="f" data-k="${kind}" data-f="r"></label><label>${_T`Color`}<input type="color" value="${L.c||'#e6b93a'}" data-sc="f" data-k="${kind}" data-f="c"></label>`:''}`}
/* sculptTarget — the layer array a bench edits: weapon art ('w'), trophy ('t') or armor (anything else); creates it if missing. */
function sculptTarget(kind){return kind==='w'?((ST.cw.art.layers=ST.cw.art.layers||[])):kind==='t'?((ST.trd.layers=ST.trd.layers||[])):((ST.ca.layers=ST.ca.layers||[]))}
/* sculptClick — handles the bench buttons (add / select / delete a layer); true when it handled the click. */
function sculptClick(btn,redraw){const kind=btn.dataset.k;const Ls=sculptTarget(kind);
  if(btn.dataset.sc==='add'){Ls.push({t:btn.dataset.t,x:50,y:50,w:14,h:14,c:'#e6b93a'});ST.scSel=Ls.length-1;redraw();return true}
  if(btn.dataset.sc==='sel'){ST.scSel=+btn.dataset.i;redraw();return true}
  if(btn.dataset.sc==='del'){if(ST.scSel!=null){Ls.splice(ST.scSel,1);ST.scSel=null}redraw();return true}
  return false}
/* sculptInput — handles a bench slider or colour change on the selected layer and refreshes the preview. */
function sculptInput(input){if(input.dataset.sc!=='f')return false;const Ls=sculptTarget(input.dataset.k);const L=Ls[ST.scSel];if(!L)return true;
  L[input.dataset.f]=input.dataset.f==='c'?input.value:+input.value;gearPrevRefresh(input.dataset.k);return true}
/* gearPrevRefresh — redraws the preview of a bench (trophy, weapon card or armor) without redrawing the whole studio. */
function gearPrevRefresh(kind){if(kind==='t'){const pv=document.getElementById('trPrev');if(pv&&ST.trd){const sv=pv.querySelector('svg');if(sv)sv.outerHTML=trophySVG({...ST.trd,name:ST.trd.name||'Trophy'},170)}return}if(kind==='w'){const pv=document.getElementById('cwPrev');if(pv)pv.innerHTML=cwCardSVG(ST.cw)}else{const pv=document.querySelector('.armprev');if(pv)pv.innerHTML=armSVG('ca_preview',{...ST.ca})}}
// drag on the previews: pointer coords → the art's own 100×100 space
/* sculptWire — wires dragging on the previews: picks the nearest layer (within 26 units) and moves it with the pointer. */
function sculptWire(box){if(box._scWired)return;box._scWired=1;let drag=null;
  /* spot — pointer event → which preview it is on and the point in that art's own 100×100 space (the weapon card's tilt undone). */
  const spot=e=>{if(e.target.closest('#trPrev')){const svg=document.querySelector('#trPrev svg');if(!svg)return null;const r=svg.getBoundingClientRect();return {kind:'t',x:(e.clientX-r.left)/r.width*100,y:(e.clientY-r.top)/r.height*134}}
    const kind=e.target.closest('#cwPrev')?'w':e.target.closest('.armprev')?'a':null;if(!kind)return null;
    const svg=(kind==='w'?document.querySelector('#cwPrev svg'):document.querySelector('.armprev svg'));if(!svg)return null;const r=svg.getBoundingClientRect();
    if(kind==='w'){ // v0.46: the art sits at translate(150 104) rotate(45) scale(1.62) translate(-50 -52) — blade up and to the right — invert that
      const px=(e.clientX-r.left)/r.width*300-150,py=(e.clientY-r.top)/r.height*208-104;const k=Math.SQRT1_2;
      return {kind,x:50+(k*px+k*py)/1.62,y:52+(-k*px+k*py)/1.62}}
    return {kind,x:(e.clientX-r.left)/r.width*100,y:(e.clientY-r.top)/r.height*100}};
  box.addEventListener('pointerdown',e=>{const p=spot(e);if(!p)return;const Ls=p.kind==='w'?(ST.cw&&ST.cw.art.layers||[]):p.kind==='t'?(ST.trd&&ST.trd.layers||[]):(ST.ca&&ST.ca.layers||[]);
    let best=null,bd=1e9;Ls.forEach((L,i)=>{const d=Math.hypot(L.x-p.x,L.y-p.y);if(d<bd){bd=d;best=i}});
    if(best!=null&&bd<26){ST.scSel=best;drag={kind:p.kind}}else if(ST.scSel!=null&&Ls[ST.scSel])drag={kind:p.kind};
    if(drag){e.preventDefault()}});
  box.addEventListener('pointermove',e=>{if(!drag)return;const p=spot(e);if(!p)return;const Ls=sculptTarget(drag.kind);const L=Ls[ST.scSel];if(!L)return;
    L.x=Math.round(Math.max(0,Math.min(100,p.x)));L.y=Math.round(Math.max(0,Math.min(drag.kind==='t'?134:100,p.y)));gearPrevRefresh(drag.kind)});
  box.addEventListener('pointerup',()=>{drag=null})}
/* ---------- the Gear studio: weapons (with their cards) and armor, in one place ---------- */
/* blankCW — a fresh weapon design (level 1 sword stats, blank art, not on the rolls). */
function blankCW(){return {id:'w'+Date.now().toString(36),name:'',type:'sword',stats:{p:1,r:1,ammo:0,thrN:0,thrP:0,thrR:0,shield:0,absorb:1,uses:3,cfw:0,soul:0,both:0,atkUses:0},art:{type:'none',layers:[],baked:[],metal:'#c9d0d6',haft:'#7a5a2a',wrap:'#8a2a2a',gem:'#c0433a',motif:''},rolls:{market:false,loadout:false},v:1}}
/* v0.45: any printed piece can seed a new design — its slot, point, AP, market level, pair/stack and bonus straight
   from the rulebook table, its drawn shape and metal as the starting art */
/* caFromSystem — seeds an armor design from a printed piece: its slot, point, AP, level, pair/stack, bonus, shape and metal. */
function caFromSystem(design,key){const A=ARM[key];if(!A)return;design.base=key;design.slot=A.slot;design.pt=A.pt;design.ap=clamp(A.ap,2,7);design.lv=A.lv||1;design.stack=A.stack?1:0;design.pair=A.pair?1:0;
  const bl=A.bonus?Object.keys(A.bonus)[0]:'';design.bonusLoc=bl||'';design.bonusAp=bl?A.bonus[bl]:0;design.shape=ARM_SHAPE[key]||'plate';design.metal=ARM_METAL[key]||design.metal;if(!design.name)design.name=A.n+' (remade)';design.fit=null}
/* blankCA — a fresh armor design (chest, 3 AP, level 2, not on the rolls). */
function blankCA(){return {id:'a'+Date.now().toString(36),name:'',slot:'chest',pt:'chest',ap:3,lv:2,stack:0,pair:0,bonusLoc:'',bonusAp:0,shape:'none',metal:'#c9a458',gem:'#7a2230',rolls:{market:false,loadout:false},layers:[],baked:[],fit:null,v:1}}
/* CA_SHAPES — the armor shapes offered under Start from. */
const CA_SHAPES=[['none',_T('— Blank canvas —')],['helmR',_T('Round helm')],['helmR2',_T('Helm with neck-guard')],['helmCrest',_T('Crested helm')],['helmGrill',_T('Grilled helm (murmillo)')],['helmSec',_T('Smooth helm (secutor)')],['belt',_T('Broad belt')],['plate',_T('Chest plate on straps')],['scale',_T('Scale shirt')],['muscle',_T('Muscled cuirass')],['thorax',_T('Great plate + shoulders')],['bands',_T('Padded wraps')],['segArm',_T('Segmented arm (manica)')],['shoulder',_T('Layered shoulder')],['fist',_T('Studded fist')],['galerus',_T('High shoulder-plate')],['bracerPair',_T('Bracer pair')],['skirt',_T('Studded skirt')],['greave',_T('Greave')],['greavePair',_T('Greave pair')],['plateLeg',_T('Thigh plate')],['greaveTall',_T('Tall ornate greave')]];
/* gearStudioHTML — the Gear studio page: weapons or armor, by the rail's sub-entry. */
function gearStudioHTML(){const sub=ST.gearSub||'w';
  return sub==='w'?gearWHTML():gearAHTML()} /* v0.45: Weapons and Armor have their own entries under Gear on the studio rail */
/* gearWHTML — the weapon designer page: art, icon tiles with their numbers, the card preview and your weapons. */
function gearWHTML(){const d=ST.cw||(ST.cw=blankCW());const st=d.stats;const w=cwReg({...d,id:'preview'});delete W['cw_preview'];
  /* num — a numeric select for one stat from lo to hi. */
  const num=(f,lo,hi,lbl)=>`<label>${lbl}<select data-cwf="s.${f}">${Array.from({length:hi-lo+1},(_,i)=>`<option value="${lo+i}" ${st[f]===lo+i?'selected':''}>${lo+i}</option>`).join('')}</select></label>`;
  /* chk — a checkbox for one stat. */
  const chk=(f,lbl,d2)=>`<label style="display:flex;gap:6px;align-items:center" title="${d2}"><input type="checkbox" data-cwf="s.${f}" ${st[f]?'checked':''}> ${lbl}</label>`;
  /* col — a colour input for one art field. */
  const col=(f,l)=>`<label>${l}<input type="color" data-cwf="a.${f}" value="${esc(d.art[f])}"></label>`;
  const L=CUSTOM.weapons||[];
  return `<p>${_T`Forge a weapon and its <b>card</b> — the same sideways card the printed weapons use. Stats assemble only from behaviors and bounds that exist on printed cards, and the <b>market level derives from the stats</b>, so nothing outbids the printed game. It enters play only when added to the rolls.`}</p>
   <div class="trstudio big"><div class="trprev"><div class="scart" id="cwArt" data-scbprev="w" title="${_T`Drag a shape to move it`}">${cwArtSVG(d.art)}</div><div class="rc-sub" style="text-align:center;margin:2px 0 8px">${_T`the weapon · sculpt it here`}</div><div class="cwprev" id="cwPrev">${cwCardSVG(d)}</div><div class="rc-sub" style="text-align:center;margin-top:4px">${_T`its card · Level ${w.lv} · ${w.lv===1?_T('common steel'):w.lv===2?_T('fine work'):_T('a master’s piece')}`}</div></div>
    <div class="formgrid"><label>${_T`Name`}<input type="text" data-cwf="name" value="${esc(d.name)}" maxlength="18" placeholder="${_T`e.g. Fang of Nemausus`}"></label>
     <label>${_T`Start from`}<select data-cwf="a.type">${CW_TYPES.map(([k,l])=>`<option value="${k}" ${d.art.type===k?'selected':''}>${l}</option>`).join('')}</select></label>
     ${col('metal',_T('Metal'))}${col('haft',_T('Haft wood'))}${col('wrap','Grip / leather')}${col('gem','Gem / accent')}
     <label>${_T`Motif`}<select data-cwf="a.motif">${CW_MOTIFS.map(([k,l])=>`<option value="${k}" ${(d.art.motif||'')===k?'selected':''}>${l}</option>`).join('')}</select></label>
     ${scbBenchHTML('w')}
     <div style="grid-column:1/-1" class="sect">${_T`Weapon card icons`} <span class="rc-sub">${_T`as the rulebook prints them — tick what this weapon has; numbers stay within printed bounds`}</span></div>
     <div class="icogrid" style="grid-column:1/-1">${(()=>{const sel=(f,vals,cur)=>`<select data-cwf="s.${f}">${vals.map(v=>`<option value="${v}" ${+cur===v?'selected':''}>${v}</option>`).join('')}</select>`;
       const tile=(k,ctrl,on=true,tog='')=>`<div class="icot${on?' on':''}"><div class="icoth">${cwIcoSVG(k,30)}<div><b>${CW_ICO_NAME[k]}</b>${tog}</div></div><div class="rc-sub">${CW_ICO_DESC[k]}</div>${on&&ctrl?`<div class="icoc">${ctrl}</div>`:''}</div>`;
       const tg=(f,on)=>`<label class="icotog"><input type="checkbox" data-cwt="${f}" ${on?'checked':''}> ${_T`has it`}</label>`;
       const out=[];
       out.push(tile('abs',`<label>${_T`Absorb ${sel('absorb',[1,2],st.absorb)}`}</label><label>${_T`Use ${sel('uses',[3,4,5,6,7,8,9,10,11,12],st.uses)}`}</label>`,!!st.shield,`<label class="icotog"><input type="checkbox" data-cwf="s.shield" ${st.shield?'checked':''}> ${_T`a shield`}</label>`));
       if(!st.shield){
         out.push(tile('dmg',`<label>${_T`Value ${sel('p',[1,2,3,4],st.p)}`}</label>`));
         out.push(tile('rng',`<label>${_T`Value ${sel('r',[1,2,3,4,5],st.r)}`}</label>`))}
       else{ /* v0.95: a shield's attack power and range are optional (range only with power) */
         out.push(tile('dmg',`<label>${_T`Value ${sel('shP',[1,2,3,4],st.shP||1)}`}</label>`,!!st.shP,tg('shP',!!st.shP)));
         out.push(tile('rng',`<label>${_T`Value ${sel('shR',[1,2,3,4,5],st.shR||1)}`}</label>`,!!st.shR,st.shP?tg('shR',!!st.shR):''))}
       {
         out.push(tile('thr',`<label>${_T`Throws ${sel('thrN',[1,3,6],st.thrN)}`}</label><label>${_T`Thrown power ${sel('thrP',[1,2,3,4],st.thrP||st.p)}`}</label><label>${_T`Thrown range ${sel('thrR',[2,3,4,5],st.thrR||2)}`}</label>`,!!st.thrN,tg('thr',!!st.thrN)));
         out.push(tile('ammo',`<label>${_T`Ammo ${sel('ammo',[3,4,5,6],st.ammo)}`}</label><label class="icotog"><input type="checkbox" data-cwf="s.stones" ${st.stones?'checked':''}> ${_T`🪨 reloads from Stones`}</label>`,!!st.ammo,tg('ammo',!!st.ammo)));
         out.push(tile('use',`<label>${_T`Uses ${sel('atkUses',[3,6],st.atkUses)}`}</label>`,!!st.atkUses,tg('use',!!st.atkUses)));
         out.push(tile('soul','',!!st.soul,`<label class="icotog"><input type="checkbox" data-cwf="s.soul" ${st.soul?'checked':''}> ${_T`has it`}</label>`));
         out.push(tile('cf','',!!st.cfw,`<label class="icotog"><input type="checkbox" data-cwf="s.cfw" ${st.cfw?'checked':''}> ${_T`has it`}</label>`));
         out.push(tile('both','',!!st.both,`<label class="icotog"><input type="checkbox" data-cwf="s.both" ${st.both?'checked':''}> ${_T`has it`}</label>`));}
       return out.join('')})()}</div>
     <label style="grid-column:1/-1;display:flex;gap:6px;align-items:center" title="${_T`Counts as one of Flavius\u2019s own: +2 CF to a winner holding it, like the Gladius of Flavius`}"><input type="checkbox" data-cwf="s.flav" ${st.flav?'checked':''}> ${_T`🏛 A Flavius item`} <span class="rc-sub">${_T`(not a card icon — ${cfAmt87('+2')} to a winner holding it)`}</span></label>
     <div style="grid-column:1/-1" class="rc-sub crnote">${_T`📜 <b>The rolls</b> — once saved, add this weapon to the market deck and the character loadouts with the <b>📜 Add to the rolls</b> button on the weapon itself, in the list below.`}</div></div></div>
   <div class="mbtns"><button class="btn primary" type="button" data-gs="wsave">${_T`💾 Save weapon &amp; card`}</button><button class="btn" type="button" data-gs="wnew">${_T`↺ Fresh steel`}</button><button class="btn" type="button" data-gs="wrand">${_T`🎲 Surprise me`}</button></div>
   <h4>${_T`Your weapons · ${L.length}`}</h4>${L.length?`<div class="cwlist">${L.map(c=>{const wk=W['cw_'+c.id];return `<div class="cwrow"><div class="cwmini">${cwCardSVG(c)}</div><div><b>${esc(c.name)}</b> <span class="rc-sub">${wk&&wk.cwMarket?_T('in the market'):''}${wk&&wk.cwLoadout?_T(' · in loadouts'):''}</span>${crActs('w',c)}</div></div>`}).join('')}</div>`:`<p class="rc-sub">${_T`The forge is cold. Nothing yet.`}</p>`}`}
/* gearAHTML — the armor designer page: the piece or the avatar view, the form, the sculpted set and your armor. */
function gearAHTML(){const d=ST.ca||(ST.ca=blankCA());const L=CUSTOM.armor||[];
  /* col — a colour input for one armor colour field. */
  const col=(f,l)=>`<label>${l}<input type="color" data-caf="${f}" value="${esc(d[f])}"></label>`;
  return `<p>${_T`Shape a piece of armor. The <b>sculpted set</b> below recreates all ${Object.keys(ARM).filter(k=>!ARM[k].custom).length} printed pieces — pick any of them (or choose one under <b>Start from</b>) to begin from its rulebook stats. Settings → Tokens → Armor swaps between Sculpted and the Original Drawn Armor. New pieces use printed bounds: AP 2–7, the same slots and points, and enter play only when added to the rolls.`}</p>
   <div class="trstudio big"><div class="trprev"><div class="seg" style="margin-bottom:6px;justify-content:center"><button type="button" data-gs="caview" data-id="piece" class="${ST.caAvatar?'':'on'}">${_T`The piece`}</button><button type="button" data-gs="caview" data-id="avatar" class="${ST.caAvatar?'on':''}">${_T`On the avatar`}</button></div>
      <div class="scart ${ST.caAvatar?'caav':''}" id="caPiece" data-scbprev="a" title="${ST.caAvatar?_T('Drag the piece to fit it on the body · click a body zone to equip it there'):_T('Drag a shape to move it')}">${ST.caAvatar?caAvatarSVG({...d}):armSVG('ca_preview',{...d})}</div>
      ${ST.caAvatar?`<p class="rc-sub" style="margin:6px 0 0;text-align:center">${_T`On the avatar, a drag moves the <b>whole piece</b>. Switch to <b>The piece</b> to move single shapes.`}</p><label class="rc-sub" style="display:block;margin-top:6px">${_T`Size on the body`}<input type="range" min="20" max="110" value="${caFit(d).s}" data-caf="fitS" style="width:100%"></label><div class="acts" style="justify-content:center"><button class="btn tksm" type="button" data-gs="cafitreset">${_T`↺ Default fit`}</button></div>`:''}
      <div class="rc-sub" style="text-align:center">${_T`${esc(d.name||_T('Unnamed piece'))} · ${d.ap} AP`}</div></div>
    <div class="formgrid"><label>${_T`Name`}<input type="text" data-caf="name" value="${esc(d.name)}" maxlength="24" placeholder="${_T`e.g. Lionheart Cuirass`}"></label>
     <label>${_T`Start from`}<select data-caf="shape"><optgroup label="Shapes">${CA_SHAPES.map(([k,l])=>`<option value="${k}" ${d.shape===k&&!d.base?'selected':''}>${l}</option>`).join('')}</optgroup><optgroup label="The printed armor (system pieces · stats from the rulebook)">${Object.keys(ARM).filter(k=>!ARM[k].custom).map(k=>`<option value="sys:${k}" ${d.base===k?'selected':''}>${_T`${esc(ARM[k].n)} · ${ARM[k].slot} · ${ARM[k].ap} AP · L${ARM[k].lv}`}</option>`).join('')}</optgroup></select></label>
     ${col('metal','Metal / cloth')}${col('gem',_T('Accent'))}
     <label>${_T`Body location`}<select data-caf="slot">${[['head',_T('Head')],['chest',_T('Chest')],['arm',_T('Arm')],['leg',_T('Leg')]].map(([k,l])=>`<option value="${k}" ${d.slot===k?'selected':''}>${l}</option>`).join('')}</select></label>
     <label>${_T`Point`}<select data-caf="pt">${[['helm',_T('Helm')],['chest',_T('Chest')],['upper',_T('Upper')],['lower',_T('Lower')],['hand',_T('Hand')]].map(([k,l])=>`<option value="${k}" ${d.pt===k?'selected':''}>${l}</option>`).join('')}</select></label>
     <label>AP<select data-caf="ap">${[2,3,4,5,6,7].map(v=>`<option ${+d.ap===v?'selected':''}>${v}</option>`).join('')}</select></label>
     ${scbBenchHTML('a')}
     <label>${_T`Market level`}<select data-caf="lv">${[1,2,3].map(v=>`<option ${+d.lv===v?'selected':''}>${v}</option>`).join('')}</select></label>
     <label style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-caf="stack" ${d.stack?'checked':''}> ${_T`Stackable (padding)`}</label>
     <label style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-caf="pair" ${d.pair?'checked':''}> ${_T`Pair (covers both sides)`}</label>
     <label>${_T`Bonus AP to`}<select data-caf="bonusLoc">${[['',_T('Nothing')],['head',_T('Head')],['chest',_T('Chest')],['rarm',_T('Right arm')],['larm',_T('Left arm')],['rleg',_T('Right leg')],['lleg',_T('Left leg')]].map(([k,l])=>`<option value="${k}" ${d.bonusLoc===k?'selected':''}>${l}</option>`).join('')}</select></label>
     ${d.bonusLoc?`<label>${_T`Bonus amount`}<select data-caf="bonusAp">${[1,2,3,4].map(v=>`<option ${+d.bonusAp===v?'selected':''}>${v}</option>`).join('')}</select></label>`:''}
     <div style="grid-column:1/-1" class="rc-sub crnote">${_T`📜 <b>The rolls</b> — once saved, add this piece to the market deck and the character loadouts with the <b>📜 Add to the rolls</b> button on the piece itself, in the list below.`}</div></div></div>
   <div class="mbtns"><button class="btn primary" type="button" data-gs="asave">${_T`💾 Save armor`}</button><button class="btn" type="button" data-gs="anew">${_T`↺ Fresh bronze`}</button></div>
   <h4>${_T`The sculpted set · every printed piece`} <span class="rc-sub">${_T`system pieces are locked — copy one to start a new design from it, with its rulebook stats`}</span></h4><div class="armgrid sysgrid">${Object.keys(ARM).filter(k=>!ARM[k].custom).map(k=>`<div class="armcell ${d.base===k?'on':''}" title="${_T`${esc(ARM[k].n)} · ${ARM[k].slot} · ${ARM[k].ap} AP${ARM[k].bonus?' · bonus '+Object.entries(ARM[k].bonus).map(([l,v])=>'+'+v+' '+l).join(', '):''}`}"><button type="button" class="armpick armimg" data-gs="casys" data-id="${k}" title="${_T`Start a new piece from it`}">${armSVG(k)}</button>${_T`<span>${esc(ARM[k].n)}</span><small>${ARM[k].ap} AP · L${ARM[k].lv}</small>${sysActs(`data-gs="casys" data-id="${k}"`)}`}</div>`).join('')}</div>
   ${L.length?`<h4>${_T`Your armor · ${L.length}`}</h4><div class="armgrid mine">${L.map(c=>`<div class="armcell" title="${esc(c.name)}">${armSVG('ca_'+c.id)}<span>${esc(c.name)}</span>${crActs('a',c)}</div>`).join('')}</div>`:''}`}
/* gearStudioClick — handles the Gear studio buttons: new / random / edit / delete / save weapons and armor, view and fit switches. */
async function gearStudioClick(btn,redraw){const a=btn.dataset.gs,id=btn.dataset.id;
  if(a==='sub'){ST.gearSub=id;redraw();return}
  if(a==='wnew'){ST.cw=blankCW();redraw();return}
  if(a==='wrand'){const d=blankCW();const t=pickOne(CW_TYPES.slice(1))[0];d.art.type=t;d.type=t;const hex=()=>'#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0');
    d.art.metal=pickOne(['#c9d0d6','#e6b93a','#a9764a','#7f96a8','#b8925a']);d.art.haft=pickOne(['#7a5a2a','#4a3018','#8a6a3a']);d.art.wrap=hex();d.art.gem=hex();d.art.motif=pickOne(CW_MOTIFS)[0];
    if(t==='shield'){d.stats.shield=1;d.stats.absorb=1+rnd(2);d.stats.uses=3+rnd(8)}else{d.stats.p=1+rnd(3);d.stats.r=1+rnd(2);if(Math.random()<.3)d.stats.thrN=pickOne([1,3]);if(Math.random()<.2)d.stats.ammo=3+rnd(3)}
    d.name=pickOne([_T('Fang'),_T('Oath'),_T('Kiss'),_T('Wrath'),_T('Sting'),_T('Mercy'),_T('Thorn'),_T('Talon')])+' of '+pickOne(LOCATIONS.filter(Boolean)).n;ST.cw=d;redraw();return}
  if(a==='wedit'){const c=(CUSTOM.weapons||[]).find(x=>x.id===id);if(c)ST.cw=JSON.parse(JSON.stringify(c));redraw();return}
  if(a==='wdel'){CUSTOM.weapons=(CUSTOM.weapons||[]).filter(x=>x.id!==id);await Store.del('customWeapons',id).catch(()=>{});gearRebuild();redraw();return}
  if(a==='wsave'){const d=ST.cw;if(!String(d.name).trim())d.name=pickOne([_T('Nameless Steel'),_T('The Bargain'),_T('Vulso’s Pride')]);if(!nameGuard('weapons',d,'[data-cwf="name"]'))return;d.v=(d.v||0)+1;
    CUSTOM.weapons=[...(CUSTOM.weapons||[]).filter(x=>x.id!==d.id),JSON.parse(JSON.stringify(d))].sort((x,y)=>String(x.name).localeCompare(y.name));
    await Store.put('customWeapons',d.id,d).catch(()=>{});gearRebuild();
    if(typeof mToast==='function')mToast(_T`⚔ <b>${esc(d.name)}</b> is forged${d.rolls.market||d.rolls.loadout?_T(' — and on the rolls'):_T(' — add it to the rolls when ready')}.`);redraw();return}
  if(a==='anew'){ST.ca=blankCA();redraw();return}
  if(a==='caview'){ST.caAvatar=id==='avatar';redraw();return}
  if(a==='cafitreset'){ST.ca.fit=null;redraw();return}
  if(a==='casys'){const d=ST.ca||(ST.ca=blankCA());caFromSystem(d,id);d.name=ARM[id].n+' (remade)';redraw();return}
  if(a==='aedit'){const c=(CUSTOM.armor||[]).find(x=>x.id===id);if(c)ST.ca=JSON.parse(JSON.stringify(c));redraw();return}
  if(a==='adel'){CUSTOM.armor=(CUSTOM.armor||[]).filter(x=>x.id!==id);await Store.del('customArmor',id).catch(()=>{});gearRebuild();redraw();return}
  if(a==='asave'){const d=ST.ca;if(!String(d.name).trim())d.name='Unnamed Bronze';if(!nameGuard('armor',d,'[data-caf="name"]'))return;d.v=(d.v||0)+1;
    CUSTOM.armor=[...(CUSTOM.armor||[]).filter(x=>x.id!==d.id),JSON.parse(JSON.stringify(d))].sort((x,y)=>String(x.name).localeCompare(y.name));
    await Store.put('customArmor',d.id,d).catch(()=>{});gearRebuild();
    if(typeof mToast==='function')mToast(_T`🛡 <b>${esc(d.name)}</b> is hammered out.`);redraw();return}}
/* gearStudioInput — handles the Gear studio form fields for weapons (icon toggles, stats, art) and armor; returns 'redraw' when the form changes shape. */
function gearStudioInput(input){
  if(input.dataset.cwt!=null){const d=ST.cw,st=d.stats,on=input.checked; // v0.42: the rulebook's toggles reveal their numbers
    if(input.dataset.cwt==='thr'){st.thrN=on?1:0;if(on){st.thrP=st.thrP||Math.min(4,st.p+1);st.thrR=st.thrR||Math.max(2,Math.min(5,st.r+1))}}
    if(input.dataset.cwt==='ammo')st.ammo=on?4:0;if(input.dataset.cwt==='use')st.atkUses=on?3:0;
    const pv=document.getElementById('cwPrev');if(pv)pv.innerHTML=cwCardSVG(d);return 'redraw'}
  if(input.dataset.cwf!=null){const d=ST.cw;const f=input.dataset.cwf;const v=input.type==='checkbox'?(input.checked?1:0):input.type==='color'||input.tagName==='INPUT'?input.value:+input.value||input.value;
    if(f.startsWith('s.'))d.stats[f.slice(2)]=input.type==='checkbox'?v:+v;else if(f.startsWith('a.'))d.art[f.slice(2)]=input.value;else if(f.startsWith('r.'))d.rolls[f.slice(2)]=!!input.checked;else d[f]=input.value;
    if(f==='a.type')d.type=input.value;
    const pv=document.getElementById('cwPrev');if(pv)pv.innerHTML=cwCardSVG(d);if(f.startsWith('a.'))cwArtRefresh();
    if(['s.shield','s.thrN','s.ammo','s.soul','s.cfw','s.both','s.atkUses','s.stones'].includes(f))return 'redraw'; // v0.36/0.42: these change the form's shape
    return true}
  if(input.dataset.caf!=null){const d=ST.ca;const f=input.dataset.caf;
    if(f==='shape'&&String(input.value).startsWith('sys:')){caFromSystem(d,input.value.slice(4));return 'redraw'}
    if(f==='shape')d.base=null;
    if(f.startsWith('r.'))d.rolls[f.slice(2)]=!!input.checked;else if(input.type==='checkbox')d[f]=input.checked?1:0;else d[f]=input.type==='color'?input.value:(isNaN(+input.value)?input.value:(f==='name'?input.value:+input.value||input.value));
    if(f==='name')d.name=input.value;
    if(f==='fitS'){d.fit={...caFit(d),slot:d.slot,s:+input.value};caPrevRefresh();return true}
    caPrevRefresh();if(f==='slot'||f==='pair')return 'redraw';return true}
  return false}
