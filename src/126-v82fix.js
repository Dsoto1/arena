/* =====================================================================
   126-v82fix · fixes after v0.81 (his notes while testing)
   =====================================================================
   • Unique beasts (Tholo, Commodus, Leo, Leaena): the moment one enters the event by ANY route (start layout, chant, Gauntlet chain,
     custom layout, its card), its arena card leaves the deck (S.deck and the round-2 cards). A drawn card for a beast already
     spent is set aside and the next card is drawn instead (safety net) — no more wasted "Tholo" draws while he is on the sand.
   ===================================================================== */
const UNIQUE_CARD82={Tholo:'spawnTholo',Commodus:'spawnCommodus',Leo:'spawnLeo',Leaena:'spawnLeaena'};
function uniqueOut82(key){const k=UNIQUE_CARD82[key];if(!k||!S)return;let n=0;
  for(const D of [S.deck,S.round2])if(Array.isArray(D))for(let i=D.length-1;i>=0;i--)if(D[i]===k){D.splice(i,1);n++}
  return n}
{const base=spawnNPC;spawnNPC=function(target,name,at,extra={}){const r=base.apply(this,arguments);
  try{const k=extra&&extra.tamedBy!=null?null:spawnKey(target,name);if(r&&k)uniqueOut82(k)}catch(e){}return r}}
{const base=drawArena;drawArena=async function(player){
  try{for(let g=0;g<6&&S&&S.deck&&S.deck.length;g++){const top=S.deck[S.deck.length-1];const key=Object.keys(UNIQUE_CARD82).find(x=>UNIQUE_CARD82[x]===top);
    if(!key||!bossSpent(key))break;S.deck.pop();log(`${key} is already in this event — that card is set aside and another is drawn.`)}}catch(e){}
  return base.apply(this,arguments)}}
/* an event that starts with a unique beast on the sand: clean the deck once it is built */
{const base=beginTurn;beginTurn=async function(){try{if(S&&!S._uq82&&S.deck){S._uq82=1;for(const k of Object.keys(UNIQUE_CARD82))if(bossSpent(k))uniqueOut82(k)}}catch(e){}return base.apply(this,arguments)}}
