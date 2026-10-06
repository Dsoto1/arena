/* 201-v91zora — v0.91 TAKE THE CHEST FROM ZORA (his note 2026-10-06): when your own Zora (Venatore's eagle, or one you released) carries the
   Arena Chest and you stand on a tile next to him on your turn, the action bar offers "🦅 Take the chest from Zora": the chest passes to you
   (carried, −1 movement while held, like Pick up chest) and Open Arena Chest works from your hands if you hold a key. Free action. */
function zoraChest91(p){if(!p||!S||!S.chest||S.onl||p.cpu||!p.alive||p.carrying)return null; /* offline + hot seat; online inputs go through the lockstep stream (not wired for this yet) */
  return (S.npcs||[]).find(n=>n.t==='zora'&&n.alive&&n.tamedBy===p.id&&n.carry&&n.carry.kind==='chest'&&cheb(n,p)<=1)||null}
{const base=render;render=function(){const r=base.apply(this,arguments);try{const p=typeof cur==='function'&&cur();const z=zoraChest91(p);const box=document.querySelector('#actions .acts');
  if(z&&box&&!box.querySelector('[data-act91="zorachest"]')&&S.phase==='action'&&!S.over)box.insertAdjacentHTML('beforeend',`<button class="btn" type="button" data-act91="zorachest" ${S.busy?'disabled':''}>${_T`🦅 Take the chest from Zora`}<small>${_T`−1 movement while held`}</small></button>`)}catch(e){console.error(e)}return r}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-act91="zorachest"]');if(!b||b.disabled)return;e.preventDefault();
  const p=cur();const z=zoraChest91(p);if(!z)return;
  act(async()=>{z.carry=null;p.carrying=true;S.chest.held='p'+p.id;S.chest.r=p.r;S.chest.c=p.c;p.mv=Math.max(0,p.mv-1);
    log(_T`${nm(z)} hands the Arena Chest to ${nm(p)}.`)})});
/* Open Arena Chest without a key (his confusion 2026-10-06: a delivered chest showed only "Pick up chest"): on or carrying the chest with
   no Arena Key, the button shows dimmed with the reason, so the missing key is obvious (Venatore and Damnatio start with none). */
{const base=render;render=function(){const r=base.apply(this,arguments);try{const p=typeof cur==='function'&&cur();const box=document.querySelector('#actions .acts');
  if(p&&!p.cpu&&box&&S.chest&&S.phase==='action'&&!S.over&&p.keys<=0&&S.chest.weapons&&S.chest.weapons.length&&(onChestTile(p)||p.carrying)&&!box.querySelector('[data-act="chest"],[data-act91="chestkey"]'))
    box.insertAdjacentHTML('beforeend',`<button class="btn" type="button" data-act91="chestkey" disabled title="${_T`Opening the Arena Chest costs 1 Arena Key.`}">${_T`Open Arena Chest`}<small>${_T`needs an Arena Key`}</small></button>`)}catch(e){console.error(e)}return r}}
