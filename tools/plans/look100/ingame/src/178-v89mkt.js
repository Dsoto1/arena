/* 178-v89mkt — the market while COMMODUS is in the arena (his notes, 2026-10-05). The market never closes: Commodus only blocks
   Crowd Favor (03-engine cfAllowed/commodusIn), so nobody can pay the 3 CF to unlock it. A market already unlocked this turn
   stays open for coin purchases.
   • Market window (106 openMarket → modal 'Market of Flavius'): Unlock market says "No CF while Commodus is in the arena".
   • Crowd Favor window (163): the Unlock market tile says the same.
   • FREE PICKS (offerings, cards and rewards that give "a level N weapon / armor" — 03 marketRoll → 106 marketBuy75 with
     opt.only): ALWAYS chosen outright, no d4 (his rule: the tokens and cards say "choose") — Commodus or not — from that level's side.
     Since 179-v89market every market take is chosen outright (no die anywhere). */
/* STARTING CARDS (his rule): a class's starting card — Slave's Rete, Hero's Ward, Venatore's Tame (= the Lyre in the deck), Damnatio's
   Meat Lure, any custom character's — comes OUT of the arena deck while a copy is left; with none left the gladiator still gets it. */
{const base=giveLoadout;giveLoadout=function(player){const n0=(player&&player.items||[]).length;const r=base.apply(this,arguments);try{
    if(S&&Array.isArray(S.deck))for(const it of (player.items||[]).slice(n0)){if(!it||it.kind!=='card')continue;const dk=it.key==='tame'?'lyre':it.key;const i=S.deck.lastIndexOf(dk);if(i>0)S.deck.splice(i,1)}}catch(e){console.error(e)}return r}}
const mktShut89=()=>{try{return !!(S&&!S.over&&typeof commodusIn==='function'&&commodusIn())}catch(e){return false}};
{const base=modal;modal=function(title,body,btns,opt){try{
    if(title===_T('Market of Flavius')&&Array.isArray(btns)&&mktShut89())
      btns=btns.map(b=>b&&b.value==='unlock'?{...b,disabled:true,sub:_T('No CF while Commodus is in the arena')}:b);
    if(typeof body==='string'&&mktShut89()&&body.includes('cf88mb'))
      body=body.replace(new RegExp('(<img[^>]*class="cf88mb"[\\s\\S]*?)('+RXE(TX('Unlock market for this turn'))+')'),`$1$2 · ${_T('no CF while Commodus is in the arena')}`)}catch(e){console.error(e)}
  return base.call(this,title,body,btns,opt)}}
/* v0.89 K: the free-pick wrapper that borrowed the Market Choice path is gone — 179-v89market's marketBuy75 lets everyone choose
   outright from the level's row (free picks keep the line "X chooses outright at level N"). */
