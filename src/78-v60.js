/* =====================================================================
   78-V60 · v0.60
   =====================================================================
   THE ROAD FROM THE CARD — every living gladiator in Your Play Now Gladiators (custom characters included) has
   🛣 Send on the Road at the top of their record (48-arena47's button, which only printed classes had); the walker's
   own record shows ⚔ Walk stage N instead. The Hall of Flavius keeps the Road's status, Walk stage and Abandon, but
   the long dropdown is gone: a button opens Your Play Now Gladiators to choose there.
   THE ANNALS LOOP — closing the Annals left its body (#hallBody) in the hidden window, so the next openHall() only
   re-rendered that hidden body and no window appeared; the launch watchdog then sent you back to the main menu.
   openHall now opens a fresh window whenever none is showing.
   ===================================================================== */
{const base=openHall;openHall=function(){try{if($('#modal').hidden){const hb=document.getElementById('hallBody');if(hb)hb.removeAttribute('id')}}catch(e){}return base.apply(this,arguments)}}
let ROAD_NOW=null; /* the Road as last read, for the cards (ludusDetail is synchronous) */
{const base=openLudus;openLudus=async function(){try{ROAD_NOW=await roadLoad()}catch(e){ROAD_NOW=null}return base.apply(this,arguments)}}
{const _ld=ludusDetail;ludusDetail=function(g){let h=_ld(g);if(!g||!gladActive(g)||g.cpu)return h;
  const R=ROAD_NOW&&!ROAD_NOW.over?ROAD_NOW:null;
  const btn=R&&R.gid===g.id?(()=>{const st=roadStage(R);return `<button type="button" class="btn roadsend primary" data-road="go" title="${_T`Opens New event with ${esc(g.name)} summoned`}">${_T`⚔ Walk stage ${R.step+1}: ${esc(st.L.n)}`}</button>`})()
    :`<button type="button" class="btn roadsend" data-roadsend="${g.id}" title="${_T`Win the twelve arenas in order with ${esc(g.name)}${R?_T` — replaces ${esc(R.name)}`:''}`}">${_T`🛣 Send on the Road`}</button>`;
  h=h.replace(/<button type="button" class="btn roadsend" data-roadsend="[^"]*"[^>]*>🛣 Send on the Road<\/button>/,'');
  return h.replace('<div class="gdetail" id="gDetail">',`<div class="gdetail" id="gDetail">${btn}`)}}
/* ⚔ Walk stage from the walker's record: the same hand-off as the Hall's button */
document.addEventListener('click',async e=>{const b=e.target.closest&&e.target.closest('#ludusBody [data-road="go"]');if(!b)return;e.stopPropagation();
  const R=await roadLoad();if(!R||R.over)return;const g=LUDUS_CACHE.find(x=>x.id===R.gid);if(!g||!gladActive(g)){if(typeof mToast==='function')mToast(_T('That gladiator can no longer walk the road.'));return}
  const st=roadStage(R);const cur=CUR_MODAL;if(cur)cur.done('road');
  setTimeout(()=>{CFG.mode='event';CFG.loc=st.li;CFG.ev=st.ev;const E=EVENTS[st.ev];CFG.n=clamp(CFG.n,E.min,E.max);summonToSetup(g);CFG.road={gid:R.gid,step:R.step,loc:st.li,ev:st.ev};openSetup()},120)},true);
/* the Hall: no dropdown — choose from the gladiators' records */
{const base=roadVisualHTML;roadVisualHTML=function(R,cand,old){let h=base.apply(this,arguments);
  const pick=`<div class="acts" style="align-items:center"><button class="btn primary" type="button" data-tab="ludus">${_T`🛡 Choose from Your Play Now Gladiators`}</button><span class="rc-sub">${_T`open a gladiator's record and press 🛣 Send on the Road`}</span></div>`;
  h=h.replace(/<div class="acts" style="align-items:center"><select class="tin" id="roadPick">[\s\S]*?<\/select><button[^>]*data-road="commit"[^>]*>[\s\S]*?<\/button><\/div>/,pick)
     .replace('<p class="rc-sub">You need a living gladiator of the eight classes on your roster (save one after an event).</p>',pick)
     .replace(' — or pick them here.','.');
  return h}}
/* SMOOTH HAND-OFFS BETWEEN WINDOWS: when a window opened from the main menu closes, the menu used to come back at once —
   even when another window (Annals ⇄ Your Play Now Gladiators, the Road, a record) was about to take its place, so the
   menu flashed between them. Now the curtain covers the gap and the menu returns only if nothing else opened. */
{const base=mmAfterClose;mmAfterClose=function(){if(!MM.fromMenu)return base.apply(this,arguments);const a=arguments,self=this;
  if(typeof transitCover==='function'&&!HEADLESS)transitCover(1200);
  setTimeout(()=>{if(!$('#modal').hidden||CUR_MODAL){if(typeof transitUncover==='function')transitUncover();return}base.apply(self,a);setTimeout(()=>{if(typeof transitUncover==='function')transitUncover()},120)},320)}}
/* ---------- TAME, BY THE RULEBOOK (p.40) ----------
   • The Venatore's starting Tame card shows the Lyre of Orpheus face (it had no art, so the card back showed).
   • Tamed NPCs carry no aggro: taming clears it, nothing can set it while the bond holds (setAggro), and any left over is
     swept at every turn start. They act only as the last step of their owner's Resolve, in their initial state.
   • Counter-attacks are NPC v NPC only, and only when a WILD NPC attacks: a tamed beast striking a wild one draws that
     beast's aggro onto the owner (as if the owner had hit it); striking another gladiator's tamed beast draws nothing at
     once — its owner answers in their own Resolve (a CPU owner goes for the beast that hit theirs first). */
if(CARDS.tame&&CARDS.lyre){CARDS.tame.img=CARDS.lyre.img;CARDS.tame.q=CARDS.tame.q||CARDS.lyre.q}
{const base=beginTurn;beginTurn=async function(){try{for(const n of (S&&S.npcs)||[])if(n.tamedBy!=null&&n.aggro!=null){n.aggro=null;n.aggroWhy=null}}catch(e){}return base.apply(this,arguments)}}
{const base=tamedAttack;tamedAttack=async function(npc,player,target){if(!target||target.kind!=='npc')return base.apply(this,arguments);
  const m=target.ref,st=npcStats(npc),hits=rollHits(2),h=cnt(hits),dmg=h*st.ap;
  hurtNPC(m,dmg,player,_T`${nm(npc)} (${player.name}'s) attacks ${diceHtml(hits)} ${h}×${st.ap} = ${dmg}`,null,npc);
  if(m.alive){if(m.tamedBy==null)setAggro(m,player,'tamed');else{m.hitBy={npc:npc.id,owner:player.id,turn:S.turnNo};const o=S.players[m.tamedBy];if(o)log(_T`${nm(o)} will answer for ${nm(m)} in their own Resolve.`)}}}}
{const base=cpuCommand;cpuCommand=async function(player,n){try{const hb=n.hitBy;if(hb&&S.turnNo-hb.turn<=S.players.length*2){const foe=S.npcs.find(x=>x.id===hb.npc&&x.alive);
    if(foe){n.hitBy=null;if(cheb(n,foe)>1){if(n.netted)n.netted=false;else await npcWalk(n,adjTiles(foe),npcStats(n).mv)}
      const t=tamedTargets(n,player).find(x=>x.kind==='npc'&&x.ref===foe);if(t){await tamedAttack(n,player,t);return}}}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
/* ---------- CROWD FAVOR OFFERINGS FALL: like every offering but the Spiders and the Curse (which strike the breaker at once),
   a CF token lands face up where the pot's offering falls — 3 tiles out at the end of a toppled pillar's rubble — and pays
   its CF to whoever picks it up (none for a gladiator whose weakness bars CF from Blessings). */
{const base=revealOffering;revealOffering=async function(player,off,land){if((off==='cf1'||off==='cf2')&&land){let [r,c]=land;r=clamp(r,0,N-1);c=clamp(c,0,N-1);if(pillarAt(r,c)){r=player.r;c=player.c}
    placeFloor('offer',off,r,c);log(_T`An offering spills onto ${tl(r,c)}: <b>${OFFER[off].n}</b> (${OFFER[off].s}).`);await pickupAt(r,c);return}
  return base.apply(this,arguments)}}
{const base=pickupAt;pickupAt=async function(r,c){try{const p=playerAt(r,c);if(p){for(const f of S.floor.filter(f=>f.r===r&&f.c===c&&f.kind==='offer'&&(f.key==='cf1'||f.key==='cf2'))){
    S.floor=S.floor.filter(x=>x!==f);const v=f.key==='cf1'?1:2;if(weak(p,'noBlessCF'))log(_T`${nm(p)} picks up a Crowd Favor offering, but gains no CF from Blessings.`);
    else{cfWhy(_T('breaking pots'));p.cf+=v;fx(r,c,_T`+${v} CF`,'#f0cf7d');log(_T`${nm(p)} picks up a Crowd Favor offering: ${cfAmt87('+'+(v))}.`)}}}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
/* ---------- TRUCES YOU CAN SEE ----------
   The offer names the gladiator with their class, in its colour; and on the sand, everyone you hold a truce with wears a
   white 🕊 above their head and a dashed ring in your colour — so a move or an attack never breaks one by accident. */
function truceWho(p){const C=CLASSES[p.cls]||{};const col=C.color||p.color||'#ccc';return `<b>${esc(p.name)}</b> <span class="trcls" style="--tc:${col}"><i></i>${esc(C.name||p.cls||'')}</span>`}
function truceViewer(){if(!S||!S.players)return null;const c=cur();if(c&&!c.cpu)return c;const hs=S.players.filter(p=>!p.cpu&&p.alive);return hs.length===1?hs[0]:null}
{const base=drawPlayer;drawPlayer=function(player){const r=base.apply(this,arguments);
  try{const v=truceViewer();if(v&&v!==player&&player.alive&&!player.exited&&inTruce(v,player)){const m=center(player.r,player.c);
    ctx.save();ctx.setLineDash([5,4]);ctx.strokeStyle=v.color||'#fff';ctx.lineWidth=2;ell(m.x,m.y+TW*0.03,TW*0.42,TW*0.21);ctx.stroke();ctx.setLineDash([]);
    const y=m.y-TW*1.55;ctx.fillStyle='rgba(255,255,255,.92)';ctx.beginPath();ctx.arc(m.x+TW*0.28,y,TW*0.15,0,Math.PI*2);ctx.fill();ctx.strokeStyle=v.color||'#888';ctx.lineWidth=1.5;ctx.stroke();
    ctx.font=`${Math.round(TW*0.19)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🕊',m.x+TW*0.28,y+1);ctx.restore()}}catch(e){}
  return r}}
{const st=document.createElement('style');st.textContent=`.trcls{display:inline-flex;align-items:center;gap:4px;color:var(--tc);font-weight:600}.trcls i{width:10px;height:10px;border-radius:50%;background:var(--tc);display:inline-block}`;document.head.appendChild(st)}
