/* 152-v87npc — v0.87 beast cards (his notes):
   • A beast that entered from an ARENA DECK card (Leo, Leaena, Tholo, Commodus, a custom beast's spawn_cn_<id>) keeps that card in the
     Field tab's top row (beside Crowd Restless…) while it lives: resolveDrawn marks the new beast n.card87 = the card key; the row is
     data-nc82 (129's click → its beast card). Beasts placed at the start carry no card.
   • The generated card BACK of the beasts that start on the sand (wolves, snakes, bears… — nc82Back, 129) wears the beast's token
     round (40-rtok npcTokHTML) in the upper-left corner; the title moves right to clear it. */
{const base=resolveDrawn;resolveDrawn=async function(player,k){
  const spawn=typeof k==='string'&&k.startsWith('spawn');const before=spawn&&S?new Set((S.npcs||[]).map(n=>n.id)):null;
  const r=await base.apply(this,arguments);
  try{if(before)for(const n of S.npcs||[])if(!before.has(n.id)&&n.card87==null)n.card87=k}catch(e){}
  return r}}
{const base=npcTrackerHTML;npcTrackerHTML=function(){let h=base.apply(this,arguments);
  try{if(!S)return h;const list=(S.npcs||[]).filter(n=>n.alive&&n.card87&&CARDS[n.card87]);if(!list.length)return h;
    const cards=list.map(n=>`<span class="ac ac87" data-nc82="${n.id}">${cardHTML('c:'+n.card87,'xs')}<span><b>${esc(n.name)}</b><br><span style="color:var(--muted)">${_T`on the sand · ${Math.max(0,n.hp)} HP`}</span></span></span>`).join('');
    if(h.includes('<div class="actcards">'))h=h.replace('<div class="actcards">','<div class="actcards">'+cards);
    else h=h.replace(/(<h3>[\s\S]*?<\/h3>)/,`$1<div class="actcards">${cards}</div>`)}catch(e){console.error(e)}
  return h}}
{const base=nc82Back;nc82Back=function(sp){let h=base.apply(this,arguments);
  try{const tok=typeof npcTokHTML==='function'?npcTokHTML({t:sp.t,name:sp.name,id:sp.rec&&sp.rec.id||0},40):'';
    if(tok)h=h.replace('<div class="ttl">',`<div class="tok87">${tok}</div><div class="ttl ttl87">`)}catch(e){}
  return h}}
{const css=document.createElement('style');css.textContent=`
.nc82c.back .tok87{position:absolute;left:5.5%;top:4.6%;width:17%;aspect-ratio:1;z-index:2;filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))}
.nc82c.back .tok87 .rtok{display:block;width:100%!important;height:100%!important;border-radius:50%}
.nc82c.back .ttl.ttl87{left:24%;right:20%}
#npcPanel .ac87{cursor:pointer}`;document.head.appendChild(css)}
